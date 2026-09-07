/**
 * perf-profile.mjs — attribute frame cost to functions.
 *
 * Companion to `perf-ab.mjs`: the A/B runner tells you WHETHER a change helped,
 * this tells you WHERE the time is going in the first place. Drives its own
 * headless Chrome over CDP (Node >= 22, zero dependencies), boots the mobile
 * board with the scripted bench driver, records a V8 CPU profile of the steady
 * state and prints the heaviest functions by self time.
 *
 *   node tools/perf-profile.mjs --url http://localhost:4177/index.html \
 *     --throttle 4 --ms 20000 --wave 12 --tier mid
 *
 * Caveat inherited from every sampling profiler: self time is attributed to
 * whatever V8 had on top of the stack, so a canvas call that spends its time
 * inside the browser's compositor shows up under the JS frame that issued it.
 * Read it as "which of MY functions is expensive", not as a GPU breakdown.
 */

import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const argv = process.argv.slice(2)
const arg = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`)
  if (i === -1) return fallback
  const next = argv[i + 1]
  return next === undefined || next.startsWith('--') ? true : next
}

const URL_UNDER_TEST = arg('url', 'http://localhost:4177/index.html')
const THROTTLE = Number(arg('throttle', 4))
const RUN_MS = Number(arg('ms', 20000))
const WAVE = Number(arg('wave', 12))
const TIER = arg('tier', '') === true ? '' : arg('tier', '')
const SEED = Number(arg('seed', 7))
const EXTRA = arg('params', '') === true ? '' : arg('params', '')
const OUT = arg('out', null)
const TOP = Number(arg('top', 30))
/** Keep headless on the real GPU — required for anything fill-rate bound. */
const GPU = arg('gpu', false) === true
const CHROME =
  arg('chrome', null) ||
  process.env.CHROME_PATH ||
  (process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : 'google-chrome')

const VIEWPORT = { width: 412, height: 915, dpr: 2 }
const PORT = 9446
const BOOT_GRACE_MS = 9000

const PRELUDE = `try {
  const today = new Date().toISOString().slice(0, 10)
  localStorage.setItem('tower_state', JSON.stringify({
    ts_m2_onboarded: true, ts_m2_tutorial: true, ts_daily_bonus_day: today,
    ts_user_sound_volume: 0, ts_user_music_volume: 0, ts_mobile_mute: true
  }))
} catch (e) {}`

const userDataDir = mkdtempSync(join(tmpdir(), 'perf-prof-'))
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    ...(GPU ? [] : ['--disable-gpu']),
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--autoplay-policy=no-user-gesture-required',
    '--enable-precise-memory-info',
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
    'about:blank'
  ],
  { stdio: 'ignore' }
)
chrome.on('error', (e) => {
  console.error(`perf-profile: cannot launch Chrome at ${CHROME}\n  ${e.message}`)
  process.exit(2)
})

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const wsUrl = await (async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      const json = await res.json()
      if (json.webSocketDebuggerUrl) return json.webSocketDebuggerUrl
    } catch {
      /* not up yet */
    }
    await sleep(250)
  }
  throw new Error('Chrome did not expose a CDP endpoint')
})()

const ws = new WebSocket(wsUrl)
await new Promise((res, rej) => {
  ws.addEventListener('open', res, { once: true })
  ws.addEventListener('error', rej, { once: true })
})

let msgId = 0
const pending = new Map()
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id !== undefined && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) reject(new Error(msg.error.message))
    else resolve(msg.result)
  }
})
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = ++msgId
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }))
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id)
        reject(new Error(`CDP timeout: ${method}`))
      }
    }, RUN_MS + 120000)
  })
const evaluate = async (sessionId, expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId)
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text ?? 'evaluate failed')
  return r.result?.value
}

const { browserContextId } = await send('Target.createBrowserContext', { disposeOnDetach: true })
const { targetId } = await send('Target.createTarget', {
  url: 'about:blank',
  browserContextId,
  width: VIEWPORT.width,
  height: VIEWPORT.height
})
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })

await send('Page.enable', {}, sessionId)
await send('Runtime.enable', {}, sessionId)
await send('Profiler.enable', {}, sessionId)
await send(
  'Emulation.setDeviceMetricsOverride',
  {
    width: VIEWPORT.width,
    height: VIEWPORT.height,
    deviceScaleFactor: VIEWPORT.dpr,
    mobile: true,
    screenOrientation: { type: 'portraitPrimary', angle: 0 }
  },
  sessionId
)
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 }, sessionId)
await send(
  'Emulation.setUserAgentOverride',
  {
    userAgent:
      'Mozilla/5.0 (Linux; Android 11; SM-A125F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l'
  },
  sessionId
)
if (THROTTLE > 1) await send('Emulation.setCPUThrottlingRate', { rate: THROTTLE }, sessionId)
await send('Page.addScriptToEvaluateOnNewDocument', { source: PRELUDE }, sessionId)

const u = new global.URL(URL_UNDER_TEST)
u.searchParams.set('fit', 'dropmerge')
u.searchParams.set('perf', '1')
u.searchParams.set('seed', String(SEED))
u.searchParams.set('benchwave', String(WAVE))
u.searchParams.set('bench', String(RUN_MS + 600000)) // never self-terminate
if (TIER) u.searchParams.set('tier', TIER)
for (const pair of String(EXTRA).split(',')) {
  const t = pair.trim()
  if (!t) continue
  const [k, v] = t.split('=')
  u.searchParams.set(`perf.${k.trim()}`, (v ?? 'on').trim())
}

console.log(`perf-profile: ${u.toString()}\n  CPU x${THROTTLE}, ${RUN_MS} ms window\n`)
await send('Page.navigate', { url: u.toString() }, sessionId)
await sleep(BOOT_GRACE_MS)

await send('Profiler.setSamplingInterval', { interval: 200 }, sessionId)
await send('Profiler.start', {}, sessionId)
await sleep(RUN_MS)
const { profile } = await send('Profiler.stop', {}, sessionId)

const probe = await evaluate(sessionId, 'JSON.stringify(window.__perf ? window.__perf.report() : null)')
if (probe && probe !== 'null') {
  const r = JSON.parse(probe)
  console.log(
    `probe: frames ${r.frames} | work p50 ${r.work.p50.toFixed(1)} p95 ${r.work.p95.toFixed(1)} ` +
      `p99 ${r.work.p99.toFixed(1)} max ${r.work.max.toFixed(1)} ms | >33ms ${r.overBudget.over33} | ` +
      `long tasks ${r.longTasks.count} (${Math.round(r.longTasks.totalMs)} ms)`
  )
  // The gap between "work" and "delta" is everything the frame costs OUTSIDE
  // our JS: canvas rasterisation, compositing, and the DOM HUD's own layout
  // and paint. On a phone that gap is usually the larger half.
  console.log(
    `  delta  p50 ${r.delta.p50.toFixed(1)} p95 ${r.delta.p95.toFixed(1)} ` +
      `p99 ${r.delta.p99.toFixed(1)} max ${r.delta.max.toFixed(1)} ms | ` +
      `>16.7ms ${r.overBudget.over16}/${r.frames}`
  )
  for (const [name, p] of Object.entries(r.phases)) {
    console.log(`  phase ${name.padEnd(8)} mean ${p.meanMs.toFixed(2)} ms  max ${p.maxMs.toFixed(1)} ms`)
  }
  console.log('')
}

// ─── Self-time by function ──────────────────────────────────────────────────

const byId = new Map(profile.nodes.map((n) => [n.id, n]))
const selfTicks = new Map()
for (const n of profile.nodes) selfTicks.set(n.id, n.hitCount ?? 0)

const totalTicks = [...selfTicks.values()].reduce((a, b) => a + b, 0) || 1
const durationMs = (profile.endTime - profile.startTime) / 1000

const rows = []
for (const n of profile.nodes) {
  const hits = selfTicks.get(n.id) ?? 0
  if (hits === 0) continue
  const f = n.callFrame
  const where = f.url ? `${f.url.split('/').pop()}:${f.lineNumber + 1}` : '(native)'
  rows.push({ name: f.functionName || '(anonymous)', where, hits })
}
// Fold identical function+site entries (V8 mints a node per call path).
const folded = new Map()
for (const r of rows) {
  const key = `${r.name}|${r.where}`
  folded.set(key, (folded.get(key) ?? 0) + r.hits)
}
const sorted = [...folded.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP)

console.log(`─── self time, top ${TOP} (${durationMs.toFixed(0)} ms wall, ${totalTicks} samples) ───`)
for (const [key, hits] of sorted) {
  const [name, where] = key.split('|')
  const pct = (hits / totalTicks) * 100
  console.log(`  ${pct.toFixed(1).padStart(5)} %  ${String(name).padEnd(34)} ${where}`)
}

if (OUT) {
  writeFileSync(OUT, JSON.stringify(profile))
  console.log(`\n  raw profile → ${OUT}`)
}

void byId
try {
  ws.close()
} catch {
  /* ignore */
}
chrome.kill()
process.exit(0)

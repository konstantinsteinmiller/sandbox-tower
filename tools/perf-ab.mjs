/**
 * perf-ab.mjs — interleaved A/B/A/B performance runner for web games.
 *
 * Part of the `web-game-performance-optimize` skill. Zero dependencies: drives
 * its OWN Chrome over raw CDP using Node's built-in WebSocket (Node >= 22),
 * with a separate --user-data-dir so it never contends with the
 * chrome-devtools-mcp profile.
 *
 * Requires the page to ship `templates/usePerfProbe.ts` (it polls
 * `window.__perf.done` / `.result`) and `templates/perfVariants.ts` (which
 * reads the `perf.<name>=on|off` URL params this script sets).
 *
 * ── Usage ─────────────────────────────────────────────────────────────────
 *   pnpm build && pnpm preview --port 4177      # ALWAYS the built bundle
 *   node scripts/perf-ab.mjs \
 *     --url "http://127.0.0.1:4177/index.html" \
 *     --a "pool=off" --b "pool=on" \
 *     --reps 5 --ms 45000 --throttle 4 --viewport 412x915x2 --seed 7 --drive
 *
 * ── Options ───────────────────────────────────────────────────────────────
 *   --url        page under test (required)
 *   --a / --b    variant specs, comma-separated `name=on|off` (default: --a "")
 *   --reps       reps PER VARIANT (default 3; use 5 when numbers are close)
 *   --ms         measured window per rep, after warmup (default 45000)
 *   --throttle   CPU slowdown factor, 1 = off (default 4 ≈ mid-range Android)
 *   --viewport   WxHxDPR[,landscape] (default 412x915x2)
 *   --seed       RNG seed handed to the probe (default 7)
 *   --drive      dispatch a scripted pointer sweep — replace with your game's
 *                real input script for anything serious
 *   --headful    show the browser (needed for trustworthy GPU-side numbers)
 *   --chrome     path to Chrome
 *   --out        write the full JSON result here
 *
 * ── What this can and cannot prove ────────────────────────────────────────
 * Headless + --disable-gpu gives repeatable RELATIVE CPU numbers. It proves
 * nothing about overdraw, DPR, draw-call or shader cost — those need --headful
 * and ultimately a real phone (MEASURING.md Recipe 4).
 */

import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// ─── Args ───────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
const arg = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`)
  if (i === -1) return fallback
  const next = argv[i + 1]
  return next === undefined || next.startsWith('--') ? true : next
}

const URL_UNDER_TEST = arg('url')
if (!URL_UNDER_TEST) {
  console.error('perf-ab: --url is required')
  process.exit(2)
}

const SPEC_A = arg('a', '') === true ? '' : arg('a', '')
const SPEC_B = arg('b', '') === true ? '' : arg('b', '')
const REPS = Number(arg('reps', 3))
const RUN_MS = Number(arg('ms', 45000))
const THROTTLE = Number(arg('throttle', 4))
const SEED = Number(arg('seed', 7))
const DRIVE = arg('drive', false) === true
const HEADFUL = arg('headful', false) === true
/** Wave the scripted driver jumps to — the heavy part of a Drop & Merge run. */
const BENCH_WAVE = Number(arg('wave', 12))
/** Force a device tier (`low|mid|high`) instead of letting the UA decide. */
const TIER = arg('tier', '') === true ? '' : arg('tier', '')
/** Keep headless on the real GPU. Required for anything fill-rate bound. */
const GPU = arg('gpu', false) === true
/** Measured window in FRAMES rather than milliseconds. Preferred here: the
 *  simulation is driven by the frame delta, so a time-boxed window lets a
 *  faster variant play further into the wave and be measured on a fuller
 *  board. Zero falls back to `--ms`. */
const FRAMES = Number(arg('frames', 0))
/** Discarded frames before collection starts (JIT, first bakes, art arrival). */
const WARM_FRAMES = Number(arg('warmframes', 240))
/** Discarded reps run before the measured ones. The first page load of a
 *  session pays for cold HTTP cache, cold shader cache and a cold JIT, and it
 *  lands entirely on whichever variant happens to go first. */
const WARMUP_REPS = Number(arg('warmup', 1))
const OUT = arg('out', null)
const CHROME =
  arg('chrome', null) ||
  process.env.CHROME_PATH ||
  (process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : 'google-chrome')

const vpRaw = String(arg('viewport', '412x915x2'))
const landscape = vpRaw.includes('landscape')
const [vw, vh, vdpr] = vpRaw.split(',')[0].split('x').map(Number)
const VIEWPORT = { width: vw || 412, height: vh || 915, dpr: vdpr || 2, landscape }

// Warmup is owned by the probe (2 s); this is the extra grace for boot,
// asset loading and the first scene mount before the probe starts counting.
const BOOT_GRACE_MS = 8000
const HARD_TIMEOUT_MS = BOOT_GRACE_MS + Math.max(RUN_MS, FRAMES * 25) + 120000
const PORT = 9444

// ─── Variant spec -> URL ────────────────────────────────────────────────────

const buildUrl = (spec) => {
  const u = new global.URL(URL_UNDER_TEST)
  for (const pair of String(spec).split(',')) {
    const t = pair.trim()
    if (!t) continue
    const [k, v] = t.split('=')
    u.searchParams.set(`perf.${k.trim()}`, (v ?? 'on').trim())
  }
  // Frame-counted when asked for. See `usePerfProbe.benchFrameBudget` for why
  // a time-boxed window cannot compare two variants of THIS game fairly.
  if (FRAMES > 0) {
    u.searchParams.set('benchframes', String(FRAMES))
    u.searchParams.set('benchwarm', String(WARM_FRAMES))
  } else {
    u.searchParams.set('bench', String(RUN_MS))
  }
  u.searchParams.set('seed', String(SEED))
  u.searchParams.set('benchwave', String(BENCH_WAVE))
  // The mobile board is behind its own runtime switch; a rep that landed on
  // the desktop scene would silently measure a different game.
  u.searchParams.set('fit', 'dropmerge')
  if (TIER) u.searchParams.set('tier', TIER)
  return u.toString()
}

/**
 * Seeded into every rep BEFORE the app boots (`addScriptToEvaluateOnNewDocument`).
 *
 * Sandbox Tower persists everything into one `sandbox_state` blob, so one write
 * settles the whole first-run experience: no tutorial overlay, no onboarding
 * gate, no daily-bonus modal — all of which pause the clock or cover the board
 * and would make the measured window mostly a still frame.
 */
const PRELUDE = `try {
  const today = new Date().toISOString().slice(0, 10)
  localStorage.setItem('sandbox_state', JSON.stringify({
    ts_m2_onboarded: true,
    ts_m2_tutorial: true,
    ts_daily_bonus_day: today,
    ts_user_sound_volume: 0,
    ts_user_music_volume: 0,
    ts_mobile_mute: true
  }))
} catch (e) {}`

// ─── Chrome + CDP plumbing ──────────────────────────────────────────────────

const userDataDir = mkdtempSync(join(tmpdir(), 'perf-ab-'))
const chromeArgs = [
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${userDataDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-background-timer-throttling',
  '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows',
  '--autoplay-policy=no-user-gesture-required',
  // Without this `performance.memory` is bucketed to uselessness and the
  // probe's heap slope reads a flat 0 — i.e. "not measured", not "no garbage".
  '--enable-precise-memory-info',
  `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
  'about:blank'
]
// `--disable-gpu` forces Skia onto SwiftShader, which software-rasterises every
// canvas fill. For a game whose cost is JS that is merely slow and uniform; for
// one that is fill-rate bound it is a 10-20x handicap ON TOP of the CPU
// throttle, and it saturates: every variant queues, the differences drown, and
// the run reports noise. `--gpu` keeps new-headless on the real GPU, which is
// the only setting under which these numbers mean anything for a phone.
if (!HEADFUL) chromeArgs.unshift('--headless=new', ...(GPU ? [] : ['--disable-gpu']))

const chrome = spawn(CHROME, chromeArgs, { stdio: 'ignore' })
chrome.on('error', (e) => {
  console.error(`perf-ab: cannot launch Chrome at ${CHROME}\n  ${e.message}`)
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
    if (msg.error) reject(new Error(`${msg.error.message} (${JSON.stringify(msg.error.data ?? '')})`))
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
    }, HARD_TIMEOUT_MS)
  })

const evaluate = async (sessionId, expression) => {
  const r = await send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    sessionId
  )
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text ?? 'evaluate failed')
  return r.result?.value
}

// ─── One rep ────────────────────────────────────────────────────────────────

/**
 * Each rep runs in its own incognito browser context, so localStorage /
 * IndexedDB start empty. Otherwise rep 2 boots into rep 1's save and plays a
 * completely different (usually much heavier) game.
 */
const runOnce = async (label, spec) => {
  const { browserContextId } = await send('Target.createBrowserContext', {
    disposeOnDetach: true
  })
  const { targetId } = await send('Target.createTarget', {
    url: 'about:blank',
    browserContextId,
    width: VIEWPORT.width,
    height: VIEWPORT.height
  })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })

  try {
    await send('Page.enable', {}, sessionId)
    await send('Runtime.enable', {}, sessionId)
    await send(
      'Emulation.setDeviceMetricsOverride',
      {
        width: VIEWPORT.width,
        height: VIEWPORT.height,
        deviceScaleFactor: VIEWPORT.dpr,
        mobile: true,
        screenOrientation: VIEWPORT.landscape
          ? { type: 'landscapePrimary', angle: 90 }
          : { type: 'portraitPrimary', angle: 0 }
      },
      sessionId
    )
    await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 }, sessionId)
    // A phone UA, so `mobileCheck()` and `useDeviceTier` see what a phone sees.
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

    const url = buildUrl(spec)
    const t0 = Date.now()
    await send('Page.navigate', { url }, sessionId)

    // Scripted input. A crude periodic sweep + tap: enough to keep a
    // steer/tap game in motion, NOT enough to call an input script. Replace it
    // with a recorded one for any result you intend to act on.
    let driving = DRIVE
    const drive = async () => {
      let i = 0
      while (driving) {
        const x = VIEWPORT.width * (0.25 + 0.5 * (0.5 + 0.5 * Math.sin(i / 12)))
        const y = VIEWPORT.height * 0.75
        try {
          await send(
            'Input.dispatchTouchEvent',
            { type: 'touchStart', touchPoints: [{ x, y }] },
            sessionId
          )
          await send(
            'Input.dispatchTouchEvent',
            { type: 'touchMove', touchPoints: [{ x: x + 8, y }] },
            sessionId
          )
          await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, sessionId)
        } catch {
          break
        }
        i++
        await sleep(200)
      }
    }
    const driver = drive()

    // Poll for the probe's completion flag.
    const deadline = Date.now() + BOOT_GRACE_MS + (FRAMES > 0 ? FRAMES * 25 + 60000 : RUN_MS) + 30000
    let result = null
    while (Date.now() < deadline) {
      await sleep(500)
      const done = await evaluate(sessionId, 'Boolean(window.__perf && window.__perf.done)').catch(
        () => false
      )
      if (done) {
        result = await evaluate(sessionId, 'JSON.stringify(window.__perf.result)')
        break
      }
    }
    driving = false
    await driver.catch(() => {})

    if (!result) {
      const probePresent = await evaluate(sessionId, 'Boolean(window.__perf)').catch(() => false)
      throw new Error(
        probePresent
          ? 'probe never reported done — is the game loop calling perf.beginFrame/endFrame?'
          : 'window.__perf missing — is usePerfProbe imported, and did the page load?'
      )
    }

    const fcp = await evaluate(
      sessionId,
      "(performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime||0"
    ).catch(() => 0)

    const report = JSON.parse(result)
    report.wallMs = Date.now() - t0
    report.fcpMs = fcp
    report.label = label
    report.url = url
    console.log(
      `  ${label}  p50 ${report.work.p50.toFixed(2)} | p95 ${report.work.p95.toFixed(2)} ms | ` +
        `p99 ${report.work.p99.toFixed(2)} | >16.7ms ${report.overBudget.over16} | ` +
        `>33ms ${report.overBudget.over33} | heap ${report.heapSlopeKbPerFrame.toFixed(1)} KB/f | ` +
        `lt ${report.longTasks.count} | frames ${report.frames} | variants ${report.variants || '-'}`
    )
    return report
  } finally {
    await send('Target.closeTarget', { targetId }).catch(() => {})
    await send('Target.disposeBrowserContext', { browserContextId }).catch(() => {})
  }
}

// ─── Stats ──────────────────────────────────────────────────────────────────

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b)
  const n = s.length
  if (n === 0) return 0
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}
const spreadPct = (xs) => {
  const m = median(xs)
  if (m === 0) return 0
  return ((Math.max(...xs) - Math.min(...xs)) / m) * 100
}
const pick = (runs, path) =>
  runs.map((r) => path.split('.').reduce((o, k) => (o == null ? 0 : o[k]), r) ?? 0)

// ─── Main ───────────────────────────────────────────────────────────────────

console.log(
  `perf-ab: ${REPS} reps/variant, ${RUN_MS} ms each, CPU x${THROTTLE}, ` +
    `${VIEWPORT.width}x${VIEWPORT.height}@${VIEWPORT.dpr}, seed ${SEED}` +
    (HEADFUL ? ', headful' : ', headless (CPU-relative only)')
)
console.log(`  A: ${SPEC_A || '(defaults)'}\n  B: ${SPEC_B || '(defaults)'}\n`)

const runsA = []
const runsB = []
let failed = 0

// Throwaway reps. Without them the very first measured rep carries the whole
// session's cold-start cost — one 327 ms p95 against a 55 ms steady state was
// enough to push the reported noise floor past 300 %.
for (let i = 0; i < WARMUP_REPS; i++) {
  console.log(`warmup ${i + 1}/${WARMUP_REPS} (discarded)`)
  await runOnce('warm', SPEC_A).catch((e) => console.log(`  warm FAILED: ${e.message}`))
  await runOnce('warm', SPEC_B).catch((e) => console.log(`  warm FAILED: ${e.message}`))
}

// INTERLEAVED — A B A B A B. Never all-A-then-all-B: thermal drift, CPU boost
// and page cache all move in one direction and would show up as a fake effect.
for (let rep = 0; rep < REPS; rep++) {
  console.log(`rep ${rep + 1}/${REPS}`)
  for (const [label, spec, bucket] of [
    ['A', SPEC_A, runsA],
    ['B', SPEC_B, runsB]
  ]) {
    try {
      bucket.push(await runOnce(label, spec))
    } catch (e) {
      failed++
      console.log(`  ${label}  FAILED: ${e.message}`)
    }
  }
}

const report = { ok: false }

if (runsA.length && runsB.length) {
  const a95 = pick(runsA, 'work.p95')
  const b95 = pick(runsB, 'work.p95')
  const medA = median(a95)
  const medB = median(b95)
  const improvePct = medA === 0 ? 0 : ((medA - medB) / medA) * 100
  const noisePct = spreadPct(a95)

  const row = (name, path, unit = '', digits = 2) => {
    const av = median(pick(runsA, path))
    const bv = median(pick(runsB, path))
    const d = av === 0 ? 0 : ((av - bv) / av) * 100
    return `  ${name.padEnd(20)} A ${av.toFixed(digits).padStart(9)}${unit}  ->  B ${bv
      .toFixed(digits)
      .padStart(9)}${unit}   ${d >= 0 ? '-' : '+'}${Math.abs(d).toFixed(1)} %`
  }

  console.log('\n─── medians across reps ───────────────────────────────────────')
  console.log(row('work p50', 'work.p50', ' ms'))
  console.log(row('work p95  *primary*', 'work.p95', ' ms'))
  console.log(row('work p99', 'work.p99', ' ms'))
  console.log(row('work max', 'work.max', ' ms'))
  console.log(row('backdrop mean', 'phases.backdrop.meanMs', ' ms'))
  console.log(row('backdrop max', 'phases.backdrop.maxMs', ' ms'))
  console.log(row('frames >16.7ms', 'overBudget.over16', '', 0))
  console.log(row('frames >33.3ms', 'overBudget.over33', '', 0))
  console.log(row('heap slope', 'heapSlopeKbPerFrame', ' KB/f'))
  console.log(row('long tasks', 'longTasks.count', '', 0))
  console.log(row('FCP (veto)', 'fcpMs', ' ms', 0))
  console.log(`\n  baseline noise floor (A p95 spread): ${noisePct.toFixed(1)} %`)

  // Thresholds: SKILL.md § 5. Pre-registered on purpose — do not tune them
  // after seeing the numbers.
  let verdict
  if (Math.abs(improvePct) < 3) {
    verdict = 'REVERT — below the noise floor. Keep the simpler code. Log the null result.'
  } else if (improvePct < 0) {
    verdict = `REVERT — B is ${Math.abs(improvePct).toFixed(1)} % WORSE.`
  } else if (improvePct >= 5 && improvePct > noisePct) {
    verdict = `KEEP — ${improvePct.toFixed(1)} % better, above the ${noisePct.toFixed(1)} % noise floor.`
  } else if (improvePct >= 5) {
    verdict = `INCONCLUSIVE — ${improvePct.toFixed(1)} % gain does not clear the ${noisePct.toFixed(
      1
    )} % noise floor. More reps, or a longer run.`
  } else {
    verdict = `GREY ZONE — ${improvePct.toFixed(
      1
    )} %. Keep only if it also removes complexity or stacks with a sibling change.`
  }
  console.log(`\n  VERDICT: ${verdict}`)
  console.log('  Check the veto metrics above (FCP, heap) before accepting.\n')
  console.log('  → Append the outcome to PERF-LEDGER.md, including a null result.\n')

  report.ok = true
  Object.assign(report, {
    config: { url: URL_UNDER_TEST, specA: SPEC_A, specB: SPEC_B, REPS, RUN_MS, THROTTLE, SEED, VIEWPORT, headful: HEADFUL },
    medians: { aP95: medA, bP95: medB, improvePct, noisePct },
    verdict,
    runsA,
    runsB,
    failed
  })
} else {
  console.log('\nperf-ab: not enough successful runs to compare.')
}

if (OUT) {
  writeFileSync(OUT, JSON.stringify(report, null, 2))
  console.log(`  full JSON → ${OUT}`)
}

try {
  ws.close()
} catch {
  /* ignore */
}
chrome.kill()
process.exit(report.ok ? 0 : 1)

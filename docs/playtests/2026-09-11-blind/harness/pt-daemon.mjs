// Blind-playtest daemon: one headed Chrome on its own profile, one player.
//
//   node pt-daemon.mjs --id 3 --mode mobile --url http://127.0.0.1:4391/ --x 900 --y 0
//
// Game time is HELD between commands (virtual clock from the
// gameplay-video-pipeline skill) and runs in real time only while a command
// executes, so an LLM's 10-30 s think time is not charged to the siege.
// Every input command runs a short post window afterwards so the canvas
// repaints before the screenshot.
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, appendFileSync, existsSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import http from 'node:http'

const HERE = dirname(fileURLToPath(import.meta.url))
const CLOCK_LIB = 'C:/Users/konst/.claude/skills/gameplay-video-pipeline/assets/tools/preview-video/lib/clock.mjs'
const { CLOCK_SOURCE } = await import(pathToFileURL(CLOCK_LIB).href)
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const argv = process.argv.slice(2)
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d }
const id = Number(arg('id'))
const mode = arg('mode', 'desktop')
const url = arg('url')
const winX = Number(arg('x', 0))
const winY = Number(arg('y', 0))
const cdpPort = 9300 + id
const httpPort = 9400 + id

const MOBILE = mode === 'mobile'
// Screenshot pixels are what the player sees and clicks in. Desktop: 1:1 with
// CSS px. Mobile: a 390x844 phone rendered at DPR 1.5 -> 585x1266 shots.
const VIEW = MOBILE ? { w: 390, h: 844, dpr: 1.5 } : { w: 1280, h: 720, dpr: 1 }
const SCALE = VIEW.dpr
const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36'

const profile = join(HERE, 'profiles', `pt-${id}`)
const shotDir = join(HERE, 'shots', `pt-${id}`)
const logFile = join(HERE, 'logs', `pt-${id}.log`)
mkdirSync(join(HERE, 'logs'), { recursive: true })
if (existsSync(profile)) rmSync(profile, { recursive: true, force: true })
mkdirSync(profile, { recursive: true })
mkdirSync(shotDir, { recursive: true })
const log = (...a) => appendFileSync(logFile, `[${new Date().toISOString()}] ${a.join(' ')}\n`)
log('daemon start', JSON.stringify({ id, mode, url, cdpPort, httpPort }))

// ── Chrome ──────────────────────────────────────────────────────────────────
const winW = VIEW.w + 16
const winH = VIEW.h + 40
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${cdpPort}`,
  `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-default-apps',
  '--disable-extensions', '--disable-sync', '--mute-audio',
  '--disable-features=Translate,MediaRouter,OptimizationHints,CalculateNativeWinOcclusion',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  `--window-position=${winX},${winY}`,
  `--window-size=${winW},${winH}`,
  `--app=data:text/html,<title>Playtester ${id} (${mode})</title><body style="background:#111;color:#ccc;font:20px sans-serif">Playtester ${id} booting…</body>`
], { stdio: 'ignore', detached: false })
writeFileSync(join(HERE, 'logs', `pt-${id}.chrome-pid`), String(chrome.pid))
chrome.on('exit', (c) => { log('chrome exited', c); process.exit(0) })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const getJson = async (path) => (await fetch(`http://127.0.0.1:${cdpPort}${path}`)).json()

let target = null
for (let i = 0; i < 100 && !target; i++) {
  try { target = (await getJson('/json/list')).find((t) => t.type === 'page') } catch { /* booting */ }
  if (!target) await sleep(200)
}
if (!target) { log('no page target'); chrome.kill(); process.exit(1) }

// ── CDP session ─────────────────────────────────────────────────────────────
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
let seq = 0
const pending = new Map()
const listeners = []
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id && pending.has(msg.id)) {
    const { res, rej, timer } = pending.get(msg.id)
    clearTimeout(timer)
    pending.delete(msg.id)
    msg.error ? rej(new Error(msg.error.message)) : res(msg.result)
  } else if (msg.method) {
    for (const l of listeners) l(msg)
  }
}
ws.onclose = () => { log('cdp closed'); process.exit(0) }
const send = (method, params = {}, timeoutMs = 20000) => new Promise((res, rej) => {
  const mid = ++seq
  const timer = setTimeout(() => { pending.delete(mid); rej(new Error(`${method} timed out`)) }, timeoutMs)
  pending.set(mid, { res, rej, timer })
  ws.send(JSON.stringify({ id: mid, method, params }))
})
const evaluate = async (expression, awaitPromise = false) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
  return r.result.value
}

listeners.push((m) => {
  if (m.method === 'Runtime.exceptionThrown') {
    log('PAGE EXCEPTION', m.params.exceptionDetails?.exception?.description?.split('\n')[0] || m.params.exceptionDetails?.text)
  }
  if (m.method === 'Page.frameNavigated' && !m.params.frame.parentId) log('navigated', m.params.frame.url)
})

await send('Page.enable')
await send('Runtime.enable')
await send('Network.enable')
// The live leaderboard must never see a playtest score: block the Worker. The
// game falls back to its baked snapshot, so the rank badge still renders.
await send('Network.setBlockedURLs', { urls: ['*tower-siege-leaderboard*', '*workers.dev*'] })
if (MOBILE) {
  await send('Emulation.setUserAgentOverride', { userAgent: MOBILE_UA, platform: 'Linux armv8l' })
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
}
await send('Emulation.setDeviceMetricsOverride', {
  width: VIEW.w, height: VIEW.h, deviceScaleFactor: VIEW.dpr, mobile: MOBILE,
  screenWidth: VIEW.w, screenHeight: VIEW.h,
  screenOrientation: { type: 'portraitPrimary', angle: 0 }
})
await send('Page.addScriptToEvaluateOnNewDocument', { source: CLOCK_SOURCE })
await send('Page.navigate', { url })
log('navigating', url)

// ── Clock ───────────────────────────────────────────────────────────────────
const FRAME = 1000 / 60
let vtotal = 0 // virtual ms the game has been allowed to run through commands
const ensureArmed = async () => {
  const s = await evaluate('window.__vclock ? window.__vclock.armed : null').catch(() => null)
  if (s === true) return
  if (s === null) { await sleep(500); return }
  await evaluate('new Promise((d) => window.__vclock.native.raf(() => d(window.__vclock.arm())))', true)
  log('clock armed')
}
// Run the game for `ms` of virtual time, paced to wall clock so a watcher
// sees real-speed play.
const run = async (ms) => {
  await ensureArmed()
  const frames = Math.max(1, Math.round(ms / FRAME))
  const t0 = Date.now()
  for (let i = 0; i < frames; i++) {
    await evaluate(`window.__vclock && window.__vclock.armed ? window.__vclock.step(${FRAME}) : null`).catch(() => {})
    const ahead = (i + 1) * FRAME - (Date.now() - t0)
    if (ahead > 2) await sleep(ahead)
  }
  vtotal += frames * FRAME
}
const frame = () => run(FRAME)

// ── Input (coordinates arrive in SCREENSHOT px) ─────────────────────────────
const px = (v) => Number(v) / SCALE
const clampXY = (x, y) => [Math.max(0, Math.min(VIEW.w - 1, px(x))), Math.max(0, Math.min(VIEW.h - 1, px(y)))]
const mouse = (type, x, y, extra = {}) => send('Input.dispatchMouseEvent', { type, x, y, ...extra })
const touch = (type, points) => send('Input.dispatchTouchEvent', {
  type, touchPoints: points.map((p, i) => ({ x: p[0], y: p[1], id: i, radiusX: 6, radiusY: 6, force: 1 }))
})
const lerp = (a, b, t) => a + (b - a) * t

let lastMouse = [VIEW.w / 2, VIEW.h / 2]
const moveTo = async (x, y, steps = 6) => {
  const [sx, sy] = lastMouse
  for (let i = 1; i <= steps; i++) {
    await mouse('mouseMoved', lerp(sx, x, i / steps), lerp(sy, y, i / steps))
    await frame()
  }
  lastMouse = [x, y]
}

const desktopCmds = {
  async click(x, y) {
    const [cx, cy] = clampXY(x, y)
    await moveTo(cx, cy)
    await mouse('mousePressed', cx, cy, { button: 'left', buttons: 1, clickCount: 1 })
    await run(80)
    await mouse('mouseReleased', cx, cy, { button: 'left', buttons: 0, clickCount: 1 })
  },
  async dblclick(x, y) {
    const [cx, cy] = clampXY(x, y)
    await moveTo(cx, cy)
    for (const n of [1, 2]) {
      await mouse('mousePressed', cx, cy, { button: 'left', buttons: 1, clickCount: n })
      await mouse('mouseReleased', cx, cy, { button: 'left', buttons: 0, clickCount: n })
      await run(60)
    }
  },
  async rclick(x, y) {
    const [cx, cy] = clampXY(x, y)
    await moveTo(cx, cy)
    await mouse('mousePressed', cx, cy, { button: 'right', buttons: 2, clickCount: 1 })
    await run(80)
    await mouse('mouseReleased', cx, cy, { button: 'right', buttons: 0, clickCount: 1 })
  },
  async hover(x, y) {
    const [cx, cy] = clampXY(x, y)
    await moveTo(cx, cy, 10)
  },
  async hold(x, y, ms = 800) {
    const [cx, cy] = clampXY(x, y)
    await moveTo(cx, cy)
    await mouse('mousePressed', cx, cy, { button: 'left', buttons: 1, clickCount: 1 })
    await run(Math.min(5000, Number(ms)))
    await mouse('mouseReleased', cx, cy, { button: 'left', buttons: 0, clickCount: 1 })
  },
  async drag(x1, y1, x2, y2) {
    const [ax, ay] = clampXY(x1, y1)
    const [bx, by] = clampXY(x2, y2)
    await moveTo(ax, ay)
    await mouse('mousePressed', ax, ay, { button: 'left', buttons: 1, clickCount: 1 })
    await run(60)
    const steps = 18
    for (let i = 1; i <= steps; i++) {
      await mouse('mouseMoved', lerp(ax, bx, i / steps), lerp(ay, by, i / steps), { buttons: 1 })
      await frame()
    }
    await run(60)
    await mouse('mouseReleased', bx, by, { button: 'left', buttons: 0, clickCount: 1 })
    lastMouse = [bx, by]
  },
  async wheel(x, y, dy) {
    const [cx, cy] = clampXY(x, y)
    await moveTo(cx, cy, 3)
    const n = Math.max(1, Math.round(Math.abs(Number(dy)) / 100))
    for (let i = 0; i < n; i++) {
      await mouse('mouseWheel', cx, cy, { deltaX: 0, deltaY: Math.sign(Number(dy)) * 100 })
      await frame()
    }
  }
}

const mobileCmds = {
  async tap(x, y) {
    const [cx, cy] = clampXY(x, y)
    await touch('touchStart', [[cx, cy]])
    await run(70)
    await touch('touchEnd', [])
  },
  async longpress(x, y, ms = 800) {
    const [cx, cy] = clampXY(x, y)
    await touch('touchStart', [[cx, cy]])
    await run(Math.min(5000, Number(ms)))
    await touch('touchEnd', [])
  },
  async drag(x1, y1, x2, y2) {
    const [ax, ay] = clampXY(x1, y1)
    const [bx, by] = clampXY(x2, y2)
    await touch('touchStart', [[ax, ay]])
    await run(60)
    const steps = 18
    for (let i = 1; i <= steps; i++) {
      await touch('touchMove', [[lerp(ax, bx, i / steps), lerp(ay, by, i / steps)]])
      await frame()
    }
    await run(60)
    await touch('touchEnd', [])
  },
  async pinch(x, y, factor) {
    const [cx, cy] = clampXY(x, y)
    const f = Math.max(0.3, Math.min(3, Number(factor)))
    const r0 = 60
    const r1 = r0 * f
    const pts = (r) => [[cx - r, cy], [cx + r, cy]].map(([a, b]) => [Math.max(0, Math.min(VIEW.w - 1, a)), b])
    await touch('touchStart', pts(r0))
    await frame()
    const steps = 14
    for (let i = 1; i <= steps; i++) {
      await touch('touchMove', pts(lerp(r0, r1, i / steps)))
      await frame()
    }
    await touch('touchEnd', [])
  }
}
mobileCmds.swipe = mobileCmds.drag

const commonCmds = {
  async wait(ms) { await run(Math.max(0, Math.min(15000, Number(ms) || 0))) },
  async shot() { /* no time passes */ },
  // Browser refresh, as a real player would press F5 / pull to refresh.
  async reload() {
    await send('Page.reload', {})
    log('player reload')
    await sleep(4500)
    await ensureArmed()
  }
}

const cmds = { ...commonCmds, ...(MOBILE ? mobileCmds : desktopCmds) }

let shotSeq = 0
const screenshot = async (label) => {
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 82 }, 30000)
  shotSeq++
  const file = join(shotDir, `${String(shotSeq).padStart(4, '0')}-${label}.jpg`)
  writeFileSync(file, Buffer.from(r.data, 'base64'))
  return file
}

// ── HTTP command server ─────────────────────────────────────────────────────
let busy = Promise.resolve()
const handle = async (body) => {
  const { steps = [], post, shot = true } = body
  const done = []
  for (const [name, ...a] of steps) {
    const fn = cmds[name]
    if (!fn) throw new Error(`unknown command "${name}" for ${mode}. Available: ${Object.keys(cmds).join(', ')}`)
    if (fn.length > a.length && !['hold', 'longpress'].includes(name)) throw new Error(`"${name}" needs ${fn.length} numbers`)
    if (a.some((v) => !Number.isFinite(Number(v)))) throw new Error(`"${name}" arguments must be numbers`)
    await fn(...a)
    done.push([name, ...a].join(' '))
  }
  const isInput = steps.some(([n]) => !['wait', 'shot'].includes(n))
  const postMs = post !== undefined ? Math.max(0, Math.min(3000, Number(post))) : (isInput ? 900 : 0)
  if (postMs) await run(postMs)
  log('cmd', done.join(' | '), `post=${postMs}`, `vt=${Math.round(vtotal)}`)
  const out = { ok: true, done, gameTimeSeconds: Math.round(vtotal / 100) / 10 }
  if (shot) out.screenshot = await screenshot((steps.at(-1)?.[0] || 'shot'))
  return out
}

// Operator-only view of the save (never exposed to the player CLI).
const inspect = () => evaluate(`(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); const v = localStorage.getItem(k); o[k] = v && v.length > 4000 ? v.slice(0, 4000) + '…' : v } return { title: document.title, href: location.href, ls: o } })()`)

http.createServer((req, res) => {
  let raw = ''
  req.on('data', (c) => { raw += c })
  req.on('end', () => {
    const job = busy.then(async () => {
      try {
        if (req.url === '/inspect') return { ok: true, ...(await inspect()) }
        if (req.url === '/note') {
          const text = String(JSON.parse(raw || '{}').text || '').replace(/\s+/g, ' ').trim()
          mkdirSync(join(HERE, 'reports'), { recursive: true })
          appendFileSync(join(HERE, 'reports', `pt-${id}.notes.md`),
            `- [game ${Math.round(vtotal / 100) / 10}s | shot ${String(shotSeq).padStart(4, '0')}] ${text}\n`)
          return { ok: true, noted: text }
        }
        if (req.url === '/quit') { setTimeout(() => { chrome.kill(); process.exit(0) }, 100); return { ok: true } }
        return await handle(JSON.parse(raw || '{}'))
      } catch (err) {
        log('error', err.message)
        return { ok: false, error: err.message }
      }
    })
    busy = job.catch(() => {})
    job.then((out) => {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(out))
    })
  })
}).listen(httpPort, '127.0.0.1', () => log('http on', httpPort))

// Let the page boot on the real clock, then take it over.
await sleep(4000)
await ensureArmed().catch((e) => log('arm failed', e.message))

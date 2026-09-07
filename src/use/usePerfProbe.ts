/**
 * usePerfProbe — zero-allocation in-page performance probe.
 *
 * Drop into `src/use/`. Framework-agnostic (no Vue/React import), so the same
 * file works in any web game. Companion to `perfVariants.ts` and
 * `scripts/perf-ab.mjs` from the `web-game-performance-optimize` skill.
 *
 * ── Wiring ────────────────────────────────────────────────────────────────
 *   import { perf } from '@/use/usePerfProbe'       // import EARLY in main.ts
 *                                                    // (it seeds Math.random)
 *   const frame = (now: number) => {
 *     perf.beginFrame(now)
 *     perf.phase('update'); update(FIXED_DT)
 *     perf.phase('render'); render()
 *     perf.endFrame()
 *     requestAnimationFrame(frame)
 *   }
 *
 * ── Activation ────────────────────────────────────────────────────────────
 *   ?perf=1                 collect, report on demand via __perf.report()
 *   localStorage.perf=true  same, sticky
 *   ?bench=45000&seed=7     benchmark mode: warm up, capture 45 s, then set
 *                           window.__perf.done = true and .result = report.
 *                           This is the contract `perf-ab.mjs` drives.
 *
 * Inert (a few branches per frame) when none of those are set — safe to leave
 * in a production bundle, though gating the import behind a dev chunk is
 * cheaper still.
 *
 * ── Why it is written this way ─────────────────────────────────────────────
 * A probe that allocates per frame measures itself. Everything on the hot path
 * uses preallocated Float64Array ring buffers and integer cursors: no arrays,
 * no objects, no closures, no string building. Sorting/percentiles happen only
 * inside report(), which is a cold path.
 */

// ─── Configuration ──────────────────────────────────────────────────────────

/** Ring capacity in frames: 8192 ≈ 2.3 min at 60 fps. */
const CAP = 8192

/** Frames discarded at the start — JIT, texture upload, pool fill. */
const DEFAULT_WARMUP_MS = 2000

/** Max distinct phases (update/render/physics/vfx/...). */
const MAX_PHASES = 12

// ─── State (module-level, single instance) ──────────────────────────────────

const workMs = new Float64Array(CAP)
const deltaMs = new Float64Array(CAP)
const heapBytes = new Float64Array(CAP)
let cursor = 0
let count = 0

const phaseNames: string[] = []
const phaseIndex: Record<string, number> = Object.create(null)
const phaseTotalMs = new Float64Array(MAX_PHASES)
const phaseMaxMs = new Float64Array(MAX_PHASES)

let frameStart = 0
let lastFrameStart = 0
let currentPhase = -1
let phaseStart = 0

let longTaskCount = 0
let longTaskTotalMs = 0
let longTaskObserver: PerformanceObserver | null = null

let collecting = false
let benchDone = false
let startedAt = 0
let warmupUntil = 0

// ─── Environment gates (resolved once, at module load) ──────────────────────

const search = typeof location === 'undefined' ? '' : location.search
const params = new URLSearchParams(search)

const readFlag = (key: string): string | null => {
  const q = params.get(key)
  if (q !== null) return q
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const benchMsRaw = readFlag('bench')
const BENCH_MS = benchMsRaw === null ? 0 : Number(benchMsRaw) || 0

/**
 * Frame-counted benchmark window.
 *
 * The time-boxed `?bench=` window only compares two variants fairly when the
 * simulation is independent of how fast the frames come, and this game's is
 * not: `step()` is handed the real frame delta and clamps its catch-up, so a
 * slower variant loses simulated time and arrives at a DIFFERENT, usually
 * emptier board. The measurement then reads that emptier board as a win.
 *
 * With `?benchframes=` the game drives its clock off the frame counter instead
 * (see the scene's loop), so both variants run tick-for-tick the same
 * simulation and the only thing that differs is how long it takes them.
 * `benchwarm` is the discarded prefix, in frames, for the same reason the
 * time-boxed path discards a fixed 2 s.
 */
const benchFramesRaw = readFlag('benchframes')
const BENCH_FRAMES = benchFramesRaw === null ? 0 : Number(benchFramesRaw) || 0
const benchWarmRaw = readFlag('benchwarm')
const WARMUP_FRAMES = benchWarmRaw === null ? 180 : Number(benchWarmRaw) || 0

const ENABLED =
  BENCH_MS > 0 || BENCH_FRAMES > 0 || readFlag('perf') === '1' || readFlag('perf') === 'true'

/** Frames seen since the probe woke, warmup included. */
let framesSeen = 0

// ─── Seeded RNG (determinism — see MEASURING.md § Determinism) ──────────────

/**
 * mulberry32. Installed over Math.random at module load when `?seed=` is
 * present, so every run of a benchmark plays the same game.
 *
 * Only covers Math.random. Audit gameplay code for Date.now(),
 * performance.now() and crypto.getRandomValues() used as randomness — those
 * stay non-deterministic and will silently de-sync your A/B.
 */
export const installSeededRandom = (seed: number): void => {
  let a = seed >>> 0
  Math.random = (): number => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Gated on a BENCH flag as well as the seed, not on `?seed=` alone. This
// module ships in the player's bundle, and portals append query parameters of
// their own — a portal that happened to pass `?seed=` would have replaced
// `Math.random` for every player it sent, and a game whose wave director, loot
// rolls and VFX all draw from one fixed stream is not a subtle bug.
const seedParam = params.get('seed')
if ((BENCH_MS > 0 || BENCH_FRAMES > 0) && seedParam !== null && seedParam !== '') {
  installSeededRandom(Number(seedParam) || 1)
}

// ─── Heap sampling (Chrome only) ────────────────────────────────────────────

interface MemoryInfo {
  usedJSHeapSize: number
}
const memory = (performance as Performance & { memory?: MemoryInfo }).memory ?? null

// ─── Long tasks ─────────────────────────────────────────────────────────────

const startLongTaskObserver = (): void => {
  if (longTaskObserver || typeof PerformanceObserver === 'undefined') return
  try {
    // The callback allocates, but it fires only for tasks >= 50 ms — i.e. on
    // frames that are already blown. Not on the steady-state hot path.
    longTaskObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      for (let i = 0; i < entries.length; i++) {
        longTaskCount++
        longTaskTotalMs += entries[i]!.duration
      }
    })
    longTaskObserver.observe({ entryTypes: ['longtask'] })
  } catch {
    longTaskObserver = null
  }
}

// ─── Hot path ───────────────────────────────────────────────────────────────

const beginFrame = (now?: number): void => {
  if (!ENABLED) return
  const t = now === undefined ? performance.now() : now
  frameStart = t
  currentPhase = -1
  phaseStart = t
  framesSeen++
  const warmedUp = BENCH_FRAMES > 0 ? framesSeen > WARMUP_FRAMES : t >= warmupUntil
  if (!collecting && warmedUp) {
    collecting = true
    startedAt = t
    // Phase accumulators are cleared HERE, not at construction: warmup holds
    // every one-off bake in the game (monster strips, the first backdrop, the
    // first sprite of each kind), and leaving those in puts a 160 ms `max` on
    // a phase whose measured window never exceeds 3 ms.
    phaseTotalMs.fill(0)
    phaseMaxMs.fill(0)
  }
}

/** Frame-counted bench mode: how many frames the game should have run by now,
 *  so the scene can drive its clock off the counter instead of the wall. */
export const benchFrameBudget = (): number => BENCH_FRAMES

/**
 * Close the previous phase and open `name`. Call between the logical blocks of
 * the frame. `name` must be one of a small fixed set — it is interned on first
 * use (cold) and looked up by property access afterwards (no allocation).
 */
const phase = (name: string): void => {
  if (!ENABLED) return
  const t = performance.now()
  if (currentPhase >= 0) {
    const d = t - phaseStart
    phaseTotalMs[currentPhase]! += d
    if (d > phaseMaxMs[currentPhase]!) phaseMaxMs[currentPhase] = d
  }
  let idx = phaseIndex[name]
  if (idx === undefined) {
    if (phaseNames.length >= MAX_PHASES) return
    idx = phaseNames.length
    phaseNames.push(name)
    phaseIndex[name] = idx
  }
  currentPhase = idx
  phaseStart = t
}

const endFrame = (): void => {
  if (!ENABLED) return
  const t = performance.now()
  if (currentPhase >= 0) {
    const d = t - phaseStart
    phaseTotalMs[currentPhase]! += d
    if (d > phaseMaxMs[currentPhase]!) phaseMaxMs[currentPhase] = d
    currentPhase = -1
  }
  if (collecting) {
    workMs[cursor] = t - frameStart
    deltaMs[cursor] = lastFrameStart === 0 ? 0 : frameStart - lastFrameStart
    heapBytes[cursor] = memory === null ? 0 : memory.usedJSHeapSize
    cursor = (cursor + 1) % CAP
    if (count < CAP) count++
  }
  lastFrameStart = frameStart

  // Benchmark mode: freeze the numbers and raise the flag `perf-ab.mjs` polls.
  const finished =
    BENCH_FRAMES > 0 ? count >= BENCH_FRAMES : BENCH_MS > 0 && t - startedAt >= BENCH_MS
  if (finished && collecting && !benchDone) {
    benchDone = true
    perf.result = report()
    perf.done = true
  }
}

// ─── Cold path: reporting ───────────────────────────────────────────────────

const scratch = new Float64Array(CAP)

const sortedCopy = (src: Float64Array, n: number): Float64Array => {
  const view = scratch.subarray(0, n)
  view.set(src.subarray(0, n))
  view.sort()
  return view
}

const percentile = (sorted: Float64Array, p: number): number => {
  const n = sorted.length
  if (n === 0) return 0
  const i = Math.min(n - 1, Math.max(0, Math.ceil((p / 100) * n) - 1))
  return sorted[i]!
}

const countOver = (src: Float64Array, n: number, limit: number): number => {
  let c = 0
  for (let i = 0; i < n; i++) if (src[i]! > limit) c++
  return c
}

/**
 * Average bytes allocated per frame, estimated from the rising edge of the
 * heap sawtooth: sum every positive delta (drops are collections) and divide
 * by the frame count. Chrome only; 0 elsewhere means "not measured", NOT
 * "no allocation".
 */
const heapSlopeBytesPerFrame = (n: number): number => {
  if (memory === null || n < 2) return 0
  let sum = 0
  for (let i = 1; i < n; i++) {
    const d = heapBytes[i]! - heapBytes[i - 1]!
    if (d > 0) sum += d
  }
  return sum / n
}

export interface PerfReport {
  frames: number
  durationMs: number
  work: { p50: number; p95: number; p99: number; max: number; mean: number }
  delta: { p50: number; p95: number; p99: number; max: number }
  overBudget: { over16: number; over33: number; over50: number }
  heapSlopeKbPerFrame: number
  longTasks: { count: number; totalMs: number }
  phases: Record<string, { totalMs: number; meanMs: number; maxMs: number }>
  variants: string
  ua: string
}

const report = (): PerfReport => {
  const n = count
  const sortedWork = sortedCopy(workMs, n)
  const workMean = (() => {
    let s = 0
    for (let i = 0; i < n; i++) s += workMs[i]!
    return n === 0 ? 0 : s / n
  })()
  const overBudget = {
    over16: countOver(deltaMs, n, 16.7),
    over33: countOver(deltaMs, n, 33.3),
    over50: countOver(deltaMs, n, 50)
  }
  const workP = {
    p50: percentile(sortedWork, 50),
    p95: percentile(sortedWork, 95),
    p99: percentile(sortedWork, 99),
    max: n === 0 ? 0 : sortedWork[n - 1]!,
    mean: workMean
  }
  const sortedDelta = sortedCopy(deltaMs, n)
  const deltaP = {
    p50: percentile(sortedDelta, 50),
    p95: percentile(sortedDelta, 95),
    p99: percentile(sortedDelta, 99),
    max: n === 0 ? 0 : sortedDelta[n - 1]!
  }

  const phases: Record<string, { totalMs: number; meanMs: number; maxMs: number }> = {}
  for (let i = 0; i < phaseNames.length; i++) {
    const name = phaseNames[i]!
    phases[name] = {
      totalMs: phaseTotalMs[i]!,
      meanMs: n === 0 ? 0 : phaseTotalMs[i]! / n,
      maxMs: phaseMaxMs[i]!
    }
  }

  return {
    frames: n,
    durationMs: lastFrameStart - startedAt,
    work: workP,
    delta: deltaP,
    overBudget,
    heapSlopeKbPerFrame: heapSlopeBytesPerFrame(n) / 1024,
    longTasks: { count: longTaskCount, totalMs: longTaskTotalMs },
    phases,
    // Filled by perfVariants.ts if present — keeps the report self-describing
    // so a ledger row can never be attributed to the wrong variant.
    variants:
      (globalThis as { __perfVariants?: { describe(): string } }).__perfVariants?.describe() ?? '',
    ua: typeof navigator === 'undefined' ? '' : navigator.userAgent
  }
}

const reset = (): void => {
  cursor = 0
  count = 0
  longTaskCount = 0
  longTaskTotalMs = 0
  phaseTotalMs.fill(0)
  phaseMaxMs.fill(0)
  collecting = false
  benchDone = false
  framesSeen = 0
  warmupUntil = performance.now() + DEFAULT_WARMUP_MS
}

// ─── Public surface ─────────────────────────────────────────────────────────

export const perf = {
  enabled: ENABLED,
  benchMs: BENCH_MS,
  /** > 0 when the window is counted in frames rather than milliseconds. */
  benchFrames: BENCH_FRAMES,
  beginFrame,
  phase,
  endFrame,
  report,
  reset,
  /** Set by bench mode; polled by scripts/perf-ab.mjs. */
  done: false,
  result: null as PerfReport | null
}

if (ENABLED) {
  warmupUntil = (typeof performance === 'undefined' ? 0 : performance.now()) + DEFAULT_WARMUP_MS
  startLongTaskObserver()
  ;(globalThis as unknown as { __perf: typeof perf }).__perf = perf
}

export default perf

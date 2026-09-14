import { ref, type Ref } from 'vue'
import { PROFILES, deviceTier, resolveDeviceTier, readDeviceSignals, type DeviceTier, type RenderProfile } from '@/use/useDeviceTier'
import { dayPhase, setRenderProfile } from '@/use/useTowerArt'
import { setEnemyFieldCap } from '@/use/useTowerGame'

/**
 * ─── Adaptive quality ───────────────────────────────────────────────────────
 *
 * What the device can actually DO, learned from the frames it produces, rather
 * than guessed from what it says about itself.
 *
 * `useDeviceTier` answers a different question and answers it at boot: it reads
 * core count, memory, the UA and the Poki category, and picks a profile before
 * the first frame. That is the right shape for a phone, where those signals
 * correlate with performance and where a wrong guess is at least a cheap one.
 *
 * It is the wrong shape for a desktop. `resolveDeviceTier` scores a machine as
 * weak only when at least two of its signals agree, and none of them fire on a
 * laptop: eight cores, not mobile, no Android major. So EVERY desktop resolved
 * to `high` — and the desktop scene never applied a profile at all, so `high`
 * was academic anyway. A 2-CU integrated GPU (Radeon 610M and its neighbours)
 * got the full package: live day/night sky, the mirrored tower, the paper-tooth
 * grain, per-block animated gradients, nine hundred particles, DPR 2. Measured
 * on such a machine: 18 fps in a wave-1 BUILD phase, with four blocks on the
 * board and nothing else moving.
 *
 * So this module watches the clock instead. It samples real frame deltas, and
 * when the machine is demonstrably not holding the target it steps the whole
 * quality package down — renderer fidelity, HUD effects and, at the bottom
 * tier, how many enemies may be on the field at once.
 *
 * ── What it deliberately does not do ──────────────────────────────────────
 *
 * It does not chase the target. Every tier change costs a full backdrop re-bake
 * (`setRenderProfile` invalidates the cached scenery layer), so a controller
 * that oscillated would spend more than it saved and would visibly flicker the
 * sky. Hence: a fast audition, then hysteresis, then at most one upgrade for
 * the rest of the session.
 *
 * ── The thresholds are absolute, and that is a choice ──────────────────────
 *
 * They are stated against a 60 fps target rather than against an estimate of
 * this display's refresh rate. Estimating the refresh from observed frames is
 * circular on exactly the machines this exists for: a device pinned at 18 fps
 * produces a p10 near 50 ms, an estimator reads that as "this is a 20 Hz
 * display", and concludes the machine is keeping up perfectly. The cost of
 * being absolute is that a genuinely 30 Hz-locked panel (a laptop throttled on
 * battery) settles on `low` and stays there — which is the tier a 30 fps device
 * should have been handed anyway. `adaptiveReport()` surfaces the observed p10
 * so that case is at least legible when someone goes looking.
 */

// ─── Policy ─────────────────────────────────────────────────────────────────

/**
 * What a tier means beyond the renderer.
 *
 * `RenderProfile` is the renderer's contract and stays that way — the
 * mobile-fit scene passes one straight to `setRenderProfile` and must not
 * suddenly inherit a desktop's enemy cap. Everything a tier implies OUTSIDE
 * the canvas lives here instead.
 */
export interface QualityPolicy {
  profile: RenderProfile
  /**
   * Whether the HUD keeps its expensive CSS.
   *
   * Off, `#app-root` gets `data-hud-fx="off"` and the global rules in `App.vue`
   * drop three classes of per-frame compositor work: `backdrop-filter` over a
   * canvas that invalidates every frame, keyframes animating `filter:
   * drop-shadow()`, and keyframes animating `box-shadow` / `background-position`.
   * None of those composite — each is a full re-raster of its element on every
   * frame, and none of them are visible to a probe that brackets the canvas.
   */
  hudEffects: boolean
  /** Ceiling on enemies alive at once, or null for the mode's own rule. */
  enemyCap: number | null
}

/**
 * Tier → policy.
 *
 * The render profiles are `useDeviceTier`'s, unchanged: they are the ones
 * PERF-LEDGER.md measured on the mobile-fit board, and a desktop that cannot
 * hold 60 fps wants the same subtractions a phone does.
 *
 * `low` caps the field at twelve. That is a change to the GAME, not to its
 * fidelity — the wave still arrives in full, it just arrives in smaller groups,
 * which makes the fight slower and somewhat easier. It is confined to the
 * bottom tier on purpose, and it is worth being plain that a run played there
 * is not strictly comparable to one played at `high`.
 */
export const TIER_POLICY: Readonly<Record<DeviceTier, QualityPolicy>> = {
  high: { profile: PROFILES.high, hudEffects: true, enemyCap: null },
  mid: { profile: PROFILES.mid, hudEffects: false, enemyCap: null },
  low: { profile: PROFILES.low, hudEffects: false, enemyCap: 12 }
}

const ORDER: readonly DeviceTier[] = ['low', 'mid', 'high']

const stepDown = (t: DeviceTier): DeviceTier => ORDER[Math.max(0, ORDER.indexOf(t) - 1)]!
const stepUp = (t: DeviceTier): DeviceTier => ORDER[Math.min(ORDER.length - 1, ORDER.indexOf(t) + 1)]!

// ─── Measurement constants ──────────────────────────────────────────────────

/**
 * ─── The slow-machine blind spot ────────────────────────────────────────────
 *
 * Every constant below used to be expressed in FRAMES with a wall-clock floor,
 * and the outlier rule discarded anything at or over the scene's own 120 ms
 * delta clamp. Together those three decisions made the controller structurally
 * incapable of seeing the machines it exists for.
 *
 * A playtest on 2026-09-14 — Intel UHD 630, ANGLE D3D11, 8 cores, DPR 1.25 —
 * sat at **2–5 fps for three minutes**. At 5 fps every frame is 200 ms, the
 * scene handed that over clamped to 120, and 120 ≥ the 118 ms outlier ceiling,
 * so every single frame was thrown away as "the page stopped". `__quality()`
 * after 108 s of that reads `windowsJudged: 0`. The controller never judged one
 * window, never stepped down, and the player kept the full `high` package —
 * live day/night sky, the 4.5 s scenery re-bake, the grain pass, the HUD's
 * `backdrop-filter` — for the entire session. The worse the machine, the more
 * certain it was to be ignored.
 *
 * Two of the three are fixed here; the third is in `GameScene.vue`, which now
 * feeds the TRUE frame interval rather than the clamped simulation delta (the
 * clamp is right for physics and wrong for a measurement).
 */

/**
 * Frames and wall time discarded before the first window opens.
 *
 * The opening seconds carry the WebP decodes, the first monster bakes, the
 * platform SDK's own script work and the splash teardown — none of which
 * represent steady play, and all of which would push a healthy machine straight
 * to `low`.
 *
 * `WARMUP_MS` is a floor and `WARMUP_CEILING_MS` is a ceiling, because the
 * frame count alone is a trap: 40 frames is 0.7 s at 60 fps, 2.7 s at 15 fps
 * and **thirteen seconds at 3 fps**. The machine that most needs relief would
 * wait longest for it. Past the ceiling, wall time has done the warmup's job
 * however few frames fit inside it.
 */
const WARMUP_MS = 1500
const WARMUP_FRAMES = 40
const WARMUP_CEILING_MS = 4000

/** A window closes at whichever of these comes first — see `MIN_WINDOW_FRAMES`. */
const WINDOW_FRAMES = 60
const WINDOW_MS = 1600

/** Below this a window is discarded rather than judged: too few frames to rank. */
const MIN_WINDOW_FRAMES = 18

/**
 * The same floor, for a machine that cannot produce eighteen frames in 1.6 s.
 *
 * Below ~11 fps `MIN_WINDOW_FRAMES` can never be met inside `WINDOW_MS`, so
 * every window closed short and was discarded — forever, at any frame rate low
 * enough to matter. The window stays OPEN instead until it has enough to rank,
 * and six is enough when the signal is this loud: six frames of 250 ms give a
 * median of 250 against a 22 ms threshold and an over-budget ratio of 1.0.
 */
const SLOW_WINDOW_MS = 4000
const MIN_SLOW_FRAMES = 6

/** A window with almost no frames in it at all is abandoned, not grown without
 *  bound — the page is not drawing and there is nothing to judge. */
const STALE_WINDOW_MS = 12_000

/**
 * Above this a frame is a SUSPECT, not yet evidence.
 *
 * A tab switch, an ad teardown, a GC pause behind a modal and a synchronous
 * decode all produce one enormous delta, and counting those would downgrade a
 * machine for events it did not cause. What separates them from a genuinely
 * slow machine is not the size of the delta — it is that they happen ONCE.
 *
 * So a suspect frame is discarded on its own and counted once `STALL_RUN` of
 * them arrive back to back. Nothing that stops the page produces four
 * consecutive 118 ms frames; a machine at 5 fps produces nothing else.
 */
const OUTLIER_MS = 118
const STALL_RUN = 4

/** How long after a tier change before its frames count. A change re-bakes the
 *  whole scenery layer, and those frames are not steady state. */
const SETTLE_MS = 1400

/**
 * The opening audition: within it, ONE bad window is enough to step down.
 *
 * Bounded by windows as well as by the clock, and it is the LATER of the two.
 * Ten seconds is six or seven windows on a healthy machine and barely one on a
 * machine at 3 fps, whose windows are four seconds long — so the wall clock
 * alone hands the fast relief to the machines that need it least and makes the
 * worst machine serve a two-window streak for every step it takes.
 */
const AUDITION_MS = 10_000
const AUDITION_WINDOWS = 3

/**
 * Thresholds, stated per PRESENTED frame at `drawEvery: 1`.
 *
 * They are scaled by the active tier's `drawEvery`, and that scaling is not a
 * detail. The `low` tier draws every second frame, so on a 60 Hz panel a
 * perfectly healthy `low` presents at 33 ms — which against an unscaled 22 ms
 * threshold reads as "still struggling" forever. The machine would be pinned at
 * the bottom tier with no way back even after whatever was loading the CPU at
 * boot had finished, and the report would claim it was failing when it was
 * doing exactly what it was told.
 *
 * So the target a tier is judged against is the target that tier was set up to
 * hit: 60 fps of presented frames at `drawEvery: 1`, 30 at `drawEvery: 2`.
 */
const STRUGGLE_P50_MS = 22

/**
 * A median this far over budget skips the intermediate tier entirely.
 *
 * Stepping one tier at a time is right for a machine that is *near* the line —
 * it stops the controller oscillating, and every change costs a full scenery
 * re-bake. It is wrong for a machine eleven times over budget: `mid` is not
 * going to save it, and walking there first costs an extra re-bake and a whole
 * extra window (four seconds, at the frame rate that produced this) before the
 * tier that might actually help arrives.
 */
const COLLAPSE_P50_MS = STRUGGLE_P50_MS * 4

/** Fraction of frames over budget above which the machine is not holding it. */
const OVER_BUDGET_MS = 33.3
const STRUGGLE_OVER_RATIO = 0.2

/** Median below which the machine is comfortable enough to consider a step up. */
const COMFORT_P50_MS = 17.5
const COMFORT_OVER_RATIO = 0.02

/** Presented frames per RAF frame at the tier in force. */
const drawEveryNow = (): number => TIER_POLICY[activeTier.value].profile.drawEvery

/** Consecutive agreeing windows required, once the audition is over. */
const DOWN_STREAK_AFTER_AUDITION = 2
const UP_STREAK = 5

/** Quiet required before the session's single permitted upgrade. */
const UP_QUIET_MS = 25_000

// ─── State ──────────────────────────────────────────────────────────────────

/** The tier currently in force. Mirrors into `deviceTier` so existing readers
 *  (the debug HUD) keep working. */
export const activeTier: Ref<DeviceTier> = ref('high')

/** True while the controller is allowed to change anything. */
let enabled = false
/** Set by `?tier=`: the player pinned a tier, so measurement is advisory only. */
let pinned = false

let startedAt = 0
let framesSeen = 0
let auditionEndsAt = 0
let settleUntil = 0
let upgradesLeft = 1
let lastChangeAt = 0

let downStreak = 0
let upStreak = 0

/** Consecutive frames at or over the suspect ceiling — see `STALL_RUN`. */
let stallRun = 0

/** Window accumulator. Preallocated — a probe that allocates per frame is
 *  measuring itself. */
const windowDeltas = new Float64Array(256)
let windowCount = 0
let windowStartedAt = 0
let windowOver = 0

/** Session-wide bookkeeping, for `adaptiveReport()` only. */
let windowsJudged = 0
let bestP10 = Number.POSITIVE_INFINITY
let lastP50 = 0
let lastOverRatio = 0
/** Frames thrown away as isolated stalls. A session where this is large and
 *  `windowsJudged` is small is the blind spot re-opening — say so in the
 *  report rather than leaving it to be re-derived from a playtest. */
let stallsDropped = 0

let onProfileChange: ((p: RenderProfile) => void) | null = null

// ─── Sampling ───────────────────────────────────────────────────────────────

const nowMs = (): number =>
  typeof performance === 'undefined' ? Date.now() : performance.now()

/** `?a=b` and `#/?a=b` both read as one query — the router is hash-based. */
const queryFlag = (name: string): string | null => {
  if (typeof location === 'undefined') return null
  const raw = location.search + location.hash
  const flat = raw.replace(/#[^?]*\?/g, '&').replace(/#.*$/, '')
  return new URLSearchParams(flat.startsWith('?') ? flat.slice(1) : flat).get(name)
}

/** Percentile of the current window. Sorts a copy; cold path, once per window. */
const percentile = (sorted: number[], p: number): number =>
  sorted.length === 0 ? 0 : sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]!

const resetWindow = (t: number): void => {
  windowCount = 0
  windowOver = 0
  windowStartedAt = t
}

/**
 * Put the policy into effect.
 *
 * The day phase is captured at the moment of the change rather than taken from
 * the profile's constant. `PROFILES.mid` freezes the sky at 0.18 — mid-morning
 * — which is the right answer at boot and the wrong one at runtime: a player
 * downgraded during a night wave would watch the sky snap to morning. Freezing
 * it where it already is makes the change invisible, which is the whole point
 * of doing it silently.
 */
const applyTier = (tier: DeviceTier, t: number): void => {
  const policy = TIER_POLICY[tier]
  const profile: RenderProfile = { ...policy.profile, staticDayPhase: dayPhase() }

  activeTier.value = tier
  deviceTier.value = tier
  setRenderProfile(profile)
  setEnemyFieldCap(policy.enemyCap)
  applyHudPolicy(tier, policy)

  lastChangeAt = t
  settleUntil = t + SETTLE_MS
  downStreak = 0
  upStreak = 0
  resetWindow(t)
  onProfileChange?.(profile)
}

/**
 * Publish the tier to the DOM.
 *
 * Two attributes rather than one: `data-quality` is informational (and useful
 * in a bug report screenshot), while `data-hud-fx` is the one the stylesheet
 * keys off, so a future tier can drop HUD effects without being called `low`.
 */
const applyHudPolicy = (tier: DeviceTier, policy: QualityPolicy): void => {
  if (typeof document === 'undefined') return
  const root = document.getElementById('app-root') ?? document.documentElement
  root.setAttribute('data-quality', tier)
  if (policy.hudEffects) root.removeAttribute('data-hud-fx')
  else root.setAttribute('data-hud-fx', 'off')
}

/**
 * Judge one closed window and act on it.
 *
 * Downgrades are fast during the audition and deliberate afterwards: a boss
 * wave is the heaviest thing the game does, and one heavy window during it is
 * not evidence that the machine needs a permanently smaller game.
 */
const judge = (p50: number, overRatio: number, t: number): void => {
  const inAudition = t < auditionEndsAt || windowsJudged <= AUDITION_WINDOWS
  const scale = drawEveryNow()
  const slowMedian = p50 > STRUGGLE_P50_MS * scale
  const manyOverBudget = overRatio > STRUGGLE_OVER_RATIO

  // The bar rises once the audition is over, and it rises in KIND, not just in
  // streak length.
  //
  // During the audition either symptom is enough: the player is in their first
  // ten seconds, the cost of being wrong is some fidelity, and the cost of
  // being slow is the player leaving.
  //
  // Afterwards both must hold. A boss wave landing is the heaviest thing this
  // game does, and it produces two or three seconds where a third of frames go
  // over budget while the median stays fine. Under an OR that burst reads as
  // two consecutive failing windows — because it straddles a window boundary,
  // its tail lands in the next one — and the player permanently loses the
  // reflection they were holding sixty frames a second right up until the boss
  // arrived. Requiring a slow MEDIAN as well means a downgrade needs a machine
  // that is sustainably behind, not one having a moment.
  const struggling = inAudition
    ? (slowMedian || manyOverBudget)
    : (slowMedian && manyOverBudget)

  const comfortable = p50 < COMFORT_P50_MS * scale && overRatio < COMFORT_OVER_RATIO

  if (struggling) {
    upStreak = 0
    downStreak++
    const needed = inAudition ? 1 : DOWN_STREAK_AFTER_AUDITION
    if (downStreak < needed) return
    const next = p50 > COLLAPSE_P50_MS * scale ? ORDER[0]! : stepDown(activeTier.value)
    if (next === activeTier.value) { downStreak = 0; return }
    applyTier(next, t)
    return
  }

  downStreak = 0
  if (!comfortable) { upStreak = 0; return }

  upStreak++
  if (upgradesLeft <= 0 || upStreak < UP_STREAK) return
  if (t - lastChangeAt < UP_QUIET_MS) return
  const next = stepUp(activeTier.value)
  if (next === activeTier.value) { upStreak = 0; return }
  upgradesLeft--
  applyTier(next, t)
}

/**
 * Feed one frame. Called from the scene's RAF loop, and ONLY while the scene is
 * actually simulating and drawing — a paused frame, a frame under an ad and a
 * frame behind the result screen are all cheap for reasons that have nothing to
 * do with the hardware.
 */
export const sampleAdaptiveFrame = (dtMs: number): void => {
  if (!enabled || pinned) return
  if (typeof document !== 'undefined' && document.hidden) return
  // Scaled with the tier for the same reason the thresholds are: at
  // `drawEvery: 2` one presented frame spans two RAF intervals, so an honest
  // 40 ms there is not the stall a 40 ms would be at `drawEvery: 1`.
  const scale = drawEveryNow()
  if (!(dtMs > 0)) return

  const t = nowMs()
  framesSeen++

  // A suspect frame counts only once it has company — see `STALL_RUN`. The run
  // is tracked before the warmup gate so the first frames after a slow boot do
  // not reset it; it is the shape of the stream that decides, not where in the
  // session it falls.
  if (dtMs >= OUTLIER_MS * scale) {
    stallRun++
    if (stallRun < STALL_RUN) { stallsDropped++; return }
  } else {
    stallRun = 0
  }

  const warmedUp = framesSeen >= WARMUP_FRAMES || t - startedAt >= WARMUP_CEILING_MS
  if (!warmedUp || t - startedAt < WARMUP_MS) return
  if (t < settleUntil) return
  if (windowStartedAt === 0) resetWindow(t)

  if (windowCount < windowDeltas.length) {
    windowDeltas[windowCount++] = dtMs
    if (dtMs > OVER_BUDGET_MS * scale) windowOver++
  }

  // A window closes when it has enough frames to rank, or when it has run long
  // enough to have collected enough. The third clause is what makes a slow
  // machine measurable at all: at 5 fps there are never eighteen samples inside
  // 1.6 s, so rather than discarding the window it simply stays open.
  const elapsed = t - windowStartedAt
  const closed = windowCount >= WINDOW_FRAMES
    || (elapsed >= WINDOW_MS && windowCount >= MIN_WINDOW_FRAMES)
    || (elapsed >= SLOW_WINDOW_MS && windowCount >= MIN_SLOW_FRAMES)
  if (!closed) {
    if (elapsed >= STALE_WINDOW_MS) resetWindow(t)
    return
  }

  const sorted: number[] = Array.prototype.slice.call(windowDeltas.subarray(0, windowCount))
  sorted.sort((a, b) => a - b)
  const p50 = percentile(sorted, 0.5)
  const p10 = percentile(sorted, 0.1)
  const overRatio = windowOver / windowCount

  windowsJudged++
  lastP50 = p50
  lastOverRatio = overRatio
  if (p10 < bestP10) bestP10 = p10

  resetWindow(t)
  judge(p50, overRatio, t)
}

// ─── Lifecycle ──────────────────────────────────────────────────────────────

export interface AdaptiveOptions {
  /**
   * Called whenever a new profile takes effect — but NOT for the initial one,
   * which is the return value instead.
   *
   * The scene needs this because `dpr` is not the renderer's to apply: the
   * canvas backing store is sized in the scene's `resize()`, so a tier that
   * lowers the DPR cap only takes effect once the scene re-sizes its canvas.
   *
   * The initial profile is excluded on purpose. A scene wires this up while its
   * own `resize` is still being declared, and a callback that fired during
   * `initAdaptiveQuality` would reach into a half-initialised setup scope. The
   * caller already has the starting profile — it is what this function returns.
   */
  onProfile?: (p: RenderProfile) => void
  /**
   * Tier to start from. Defaults to `high` — the desktop's historical
   * behaviour, which is what a capable machine should keep. Pass the boot
   * guess where one is meaningful.
   */
  startTier?: DeviceTier
}

/**
 * Start the controller and hand back the profile to render with right now.
 *
 * `?tier=low|mid|high` pins a tier and stops all measurement — that is what
 * makes a reproducible A/B possible, and what lets a support conversation say
 * "open it with `?tier=low` and tell me if it is smooth". `?adaptive=off`
 * leaves the starting tier in place and stops measuring without pinning it.
 */
export const initAdaptiveQuality = (opts: AdaptiveOptions = {}): RenderProfile => {
  const forced = queryFlag('tier')
  const off = queryFlag('adaptive') === 'off'

  // Attached only after the starting tier is in force — see `onProfile`.
  onProfileChange = null
  const t = nowMs()

  startedAt = t
  framesSeen = 0
  windowStartedAt = 0
  windowsJudged = 0
  bestP10 = Number.POSITIVE_INFINITY
  lastP50 = 0
  lastOverRatio = 0
  stallsDropped = 0
  stallRun = 0
  downStreak = 0
  upStreak = 0
  upgradesLeft = 1
  lastChangeAt = t
  auditionEndsAt = t + WARMUP_MS + AUDITION_MS

  pinned = forced === 'low' || forced === 'mid' || forced === 'high'
  enabled = !off

  // A pinned tier wins outright. Otherwise start from the caller's tier, or
  // from `high`: the boot signals cannot see a weak GPU behind a strong CPU,
  // which is the exact machine this exists for, so guessing DOWN from them
  // would take fidelity off desktops that never needed to lose it.
  const start: DeviceTier = pinned
    ? (forced as DeviceTier)
    : (opts.startTier ?? 'high')

  applyTier(start, t)
  onProfileChange = opts.onProfile ?? null
  // `applyTier` opens a settle window; at boot there is nothing to settle.
  settleUntil = 0
  resetWindow(0)
  windowStartedAt = 0
  return { ...TIER_POLICY[start].profile, staticDayPhase: dayPhase() }
}

/** Stop measuring and release the scene callback. Call on scene unmount. */
export const stopAdaptiveQuality = (): void => {
  enabled = false
  onProfileChange = null
}

export interface AdaptiveReport {
  tier: DeviceTier
  pinned: boolean
  enabled: boolean
  windowsJudged: number
  lastP50: number
  lastOverRatio: number
  /** Best 10th-percentile delta seen. Near 16.7 on a 60 Hz panel that is
   *  occasionally keeping up; well above it means the machine never does. */
  bestP10: number
  upgradesLeft: number
  /** Frames discarded as isolated stalls. Large next to `windowsJudged` means
   *  the controller is being fed a stream it cannot read. */
  stallsDropped: number
}

/**
 * Snapshot for the debug HUD and for bug reports. Cold path.
 *
 * Also hung off `window.__quality` at the bottom of this file. A playtest comes
 * back as a screenshot and a frame counter, and neither says which tier the
 * machine settled on or why — so the next report can carry `__quality()` in it
 * and the question "did the controller even fire?" stops being a guess.
 */
export const adaptiveReport = (): AdaptiveReport => ({
  tier: activeTier.value,
  pinned,
  enabled,
  windowsJudged,
  lastP50: Math.round(lastP50 * 10) / 10,
  lastOverRatio: Math.round(lastOverRatio * 100) / 100,
  bestP10: bestP10 === Number.POSITIVE_INFINITY ? 0 : Math.round(bestP10 * 10) / 10,
  upgradesLeft,
  stallsDropped
})

/**
 * The boot guess, for a caller that wants one.
 *
 * Kept separate from `initAdaptiveQuality` because on desktop it is NOT the
 * right starting point (see the note there); a phone scene that wants it can
 * pass it in as `startTier`.
 */
export const bootTierGuess = (): DeviceTier => resolveDeviceTier(readDeviceSignals())

// One function on `window`, unconditionally — it is four lines, it allocates
// nothing until called, and it is the difference between a playtest report that
// answers "which tier, and on what evidence" and one that does not. Shipping it
// in production is deliberate: the machines worth asking about are never the
// ones running a debug build.
if (typeof window !== 'undefined') {
  ;(window as unknown as { __quality?: () => AdaptiveReport }).__quality = adaptiveReport
}

/** Test-only: forget everything and detach from the DOM. */
export const __resetAdaptiveQuality = (): void => {
  enabled = false
  pinned = false
  startedAt = 0
  framesSeen = 0
  windowStartedAt = 0
  windowCount = 0
  windowOver = 0
  windowsJudged = 0
  bestP10 = Number.POSITIVE_INFINITY
  stallsDropped = 0
  stallRun = 0
  downStreak = 0
  upStreak = 0
  upgradesLeft = 1
  activeTier.value = 'high'
  onProfileChange = null
}

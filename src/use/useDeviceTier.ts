import { ref, type Ref } from 'vue'
import { mobileCheck } from '@/utils/function'
import { pokiDeviceCategory, type PokiDeviceCategory } from '@/utils/pokiPlugin'

/**
 * ─── Device tier ────────────────────────────────────────────────────────────
 *
 * What this device can afford, decided ONCE at boot from what it tells us,
 * rather than discovered over the first five seconds of dropped frames.
 *
 * The renderer's rolling quality tier (`useTowerVfx.sampleFrame`) keeps its
 * job — it may still step the particle budget down mid-wave — but it never
 * raises anything above what the boot tier allows, and it never reached the
 * expensive passes at all: the canvas resolution, the per-block gradients and
 * the draw cadence are decided here, before the first frame.
 *
 * Only the mobile-fit scene applies a profile. The desktop scene never calls
 * `applyDeviceTier`, so its output is exactly what it always was.
 */

export type DeviceTier = 'low' | 'mid' | 'high'

export interface RenderProfile {
  /** Cap on `devicePixelRatio` for the game canvas. The HUD is DOM and stays crisp. */
  dpr: number
  /** Draw every Nth animation frame; the simulation still steps every frame. */
  drawEvery: 1 | 2
  /** Per-block animated gradients (the reinforced sweep, the buff glow). */
  shine: boolean
  /** Particle pool cap, or null for the rolling tier's own. */
  particleCap: number | null
  /** Floating combat-text cap, or null for the default. */
  textCap: number | null

  // ── Backdrop fidelity ─────────────────────────────────────────────────────
  //
  // The scenery layer is CACHED, so none of these are per-frame costs in the
  // ordinary sense — they are the price of a cache MISS, paid as one long
  // frame. What made them worth a profile field is that the day/night clock
  // was invalidating that cache on a timer, which turned a one-off bake into a
  // stutter every few seconds for the whole run. See PERF-LEDGER.md.

  /** Animate the day/night cycle. Off freezes the sky at `staticDayPhase`. */
  dayCycle: boolean
  /** Where the frozen sky sits in its day, 0..1 (0.18 ≈ mid-morning). */
  staticDayPhase: number
  /** Mirror the tower into the water — a second pass over every block. */
  reflection: boolean
  /** Paper-tooth grain over the backdrop: one full-canvas `multiply` fill. */
  grain: boolean
}

/**
 * The desktop's behaviour, and the base every tier below is a subtraction from.
 *
 * `high` is what the game did before there were tiers at all — the desktop
 * scene never applies a profile, so this record IS its behaviour.
 */
export const PROFILES: Readonly<Record<DeviceTier, RenderProfile>> = {
  high: {
    dpr: 2, drawEvery: 1, shine: true, particleCap: null, textCap: null,
    dayCycle: true, staticDayPhase: 0.18, reflection: true, grain: true
  },
  mid: {
    dpr: 1.5, drawEvery: 1, shine: false, particleCap: 150, textCap: 16,
    dayCycle: false, staticDayPhase: 0.18, reflection: false, grain: false
  },
  low: {
    dpr: 1, drawEvery: 2, shine: false, particleCap: 80, textCap: 16,
    dayCycle: false, staticDayPhase: 0.18, reflection: false, grain: false
  }
}

export interface DeviceSignals {
  /** The query string, for a `?tier=` override. */
  query: string
  cores: number
  /** `navigator.deviceMemory`, GB, where the browser reports it. */
  memoryGb: number | null
  dpr: number
  /** Major Android version from the UA, or null. */
  androidMajor: number | null
  mobile: boolean
  pokiCategory: PokiDeviceCategory | null
}

/**
 * The decision, as a pure function of the signals.
 *
 * Every "this looks weak" signal is a candidate, and the tier is how many
 * agree: a phone with few cores and little memory is `low`; a phone that is
 * merely a phone is `mid`; a desktop is `high`. No single signal decides,
 * because every one of them lies on some device — Safari reports no memory at
 * all, and an eight-core budget Android is still a budget Android.
 */
/** `?a=b`, `#/?a=b` and `?a=b#/?c=d` all read as one query — the router is
 *  hash-based, so a portal's query and ours can sit either side of the `#`. */
const queryOf = (raw: string): URLSearchParams => {
  const flat = raw.replace(/#[^?]*\?/g, '&').replace(/#.*$/, '')
  return new URLSearchParams(flat.startsWith('?') ? flat.slice(1) : flat)
}

export const resolveDeviceTier = (s: DeviceSignals): DeviceTier => {
  const forced = queryOf(s.query).get('tier')
  if (forced === 'low' || forced === 'mid' || forced === 'high') return forced
  let weak = 0
  if (s.cores > 0 && s.cores <= 4) weak++
  if (s.memoryGb !== null && s.memoryGb <= 3) weak++
  if (s.androidMajor !== null && s.androidMajor <= 9) weak++
  if (s.mobile || s.pokiCategory === 'mobile' || s.pokiCategory === 'tablet') weak++
  if (weak >= 2) return 'low'
  if (weak === 1) return 'mid'
  return 'high'
}

const androidMajorOf = (ua: string): number | null => {
  const m = /Android (\d+)/.exec(ua)
  return m ? Number(m[1]) : null
}

export const readDeviceSignals = (): DeviceSignals => {
  const nav = typeof navigator === 'undefined' ? null : navigator
  const mem = (nav as unknown as { deviceMemory?: number } | null)?.deviceMemory
  return {
    query: typeof location === 'undefined' ? '' : location.search + location.hash,
    cores: nav?.hardwareConcurrency ?? 0,
    memoryGb: typeof mem === 'number' ? mem : null,
    dpr: typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1,
    androidMajor: androidMajorOf(nav?.userAgent ?? ''),
    mobile: mobileCheck(),
    pokiCategory: pokiDeviceCategory.value
  }
}

export const deviceTier: Ref<DeviceTier> = ref('high')

/** Resolve and remember the tier; returns the profile to apply. */
export const initDeviceTier = (): RenderProfile => {
  deviceTier.value = resolveDeviceTier(readDeviceSignals())
  return PROFILES[deviceTier.value]
}

// ─── The GPU, which is the one thing none of the signals above can see ──────
//
// `resolveDeviceTier` scores a machine weak on core count, memory, the UA and
// the Poki category. Not one of those fires on a desktop, and PERF-LEDGER.md
// has now collected two playtests from machines where every one of them was
// wrong in the same direction:
//
//   2026-09-10  AMD Radeon 610M (2 CU) · 8 cores · DPR 1.5      18 fps
//   2026-09-14  Intel UHD 630 · 8 cores · DPR 1.25        2-5 fps, 3 minutes
//
// Both scored `high` on every signal the game had. What they have in common is
// visible in one string the browser will hand over for free — the unmasked
// WebGL renderer — and nothing else in the profile comes close to it.
//
// This is a STARTING GUESS, not a verdict. `useAdaptiveQuality` measures the
// machine either way, can take a wrongly-demoted desktop back up to `high`
// after twenty-five seconds of comfortable play, and can take a machine this
// misses down to `low` regardless. What the guess buys is the first ten
// seconds, which on a 3 fps machine is the whole of the player's patience.

export type GpuClass = 'software' | 'weak' | 'unknown'

/**
 * Classify an unmasked WebGL renderer string.
 *
 * Deliberately a small allowlist of things that are KNOWN slow rather than a
 * model of the GPU market: an unrecognised string must read as `unknown` and
 * keep its fidelity, because the cost of a false positive is a capable desktop
 * quietly losing its reflection and the cost of a false negative is a machine
 * that gets measured a few seconds later anyway.
 *
 * Exported and pure so the match list is testable without a GPU — see
 * `tests/game/gpuClass.test.ts`, which pins the real strings both playtest
 * machines reported alongside the ones that must NOT match.
 */
export const gpuClass = (renderer: string | null): GpuClass => {
  if (!renderer) return 'unknown'
  const r = renderer.toLowerCase()

  // No GPU at all: Chrome's fallback rasteriser, Mesa's, and Windows'. Every
  // full-viewport fill in this renderer is on the CPU here.
  if (/swiftshader|llvmpipe|software rasterizer|basic render driver|softpipe|microsoft basic/.test(r)) {
    return 'software'
  }

  // Intel's pre-Xe integrated line — HD / UHD / GMA. Iris Xe and Arc are a
  // different architecture and several times the throughput, so the pattern is
  // anchored on "hd graphics" rather than on "intel".
  if (/intel/.test(r) && /\b(u?hd graphics|gma)\b/.test(r)) return 'weak'

  // AMD's smallest integrated parts. Named individually because "Radeon" also
  // covers the RX discrete line and the far stronger 660M/680M, and a pattern
  // loose enough to catch a 610M catches those too.
  if (/radeon/.test(r) && /\b(6[01]0m|vega [368]|r[2-5] graphics)\b/.test(r)) return 'weak'

  // Mobile parts old enough to be a problem. Consumed only by the desktop
  // start tier today — the phone scene's own boot guess is measured
  // (PERF-LEDGER.md) and is deliberately not changed here on an unmeasured
  // signal — but correct if a tablet ever arrives down this path.
  if (/\bmali-(t\d|g3\d|g5[12])/.test(r)) return 'weak'
  if (/\badreno\b.*\b[345]\d\d\b/.test(r)) return 'weak'
  if (/powervr/.test(r)) return 'weak'

  return 'unknown'
}

/** Cached across calls: the context creation is the expensive half. */
let gpuRendererCache: string | null | undefined

/**
 * The unmasked WebGL renderer, or null where it cannot be had.
 *
 * Null is the common case on a privacy-hardened browser (Firefox's
 * `resistFingerprinting`, Safari's masking, an extension that spoofs it) and on
 * any machine where WebGL is off entirely. That is fine: it lands on `unknown`,
 * which keeps the fidelity and leaves the decision to measurement.
 *
 * The context is thrown away immediately. The game's canvas is 2D — this exists
 * only to ask the question.
 */
export const readGpuRenderer = (): string | null => {
  if (gpuRendererCache !== undefined) return gpuRendererCache
  gpuRendererCache = null
  try {
    if (typeof document === 'undefined') return null
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl') ?? c.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return null
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const raw = ext
      ? gl.getParameter((ext as { UNMASKED_RENDERER_WEBGL: number }).UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    gpuRendererCache = typeof raw === 'string' && raw.length > 0 ? raw : null
  } catch {
    gpuRendererCache = null
  }
  return gpuRendererCache
}

/**
 * Where the DESKTOP scene should start.
 *
 * `high` unless the GPU says otherwise, which is the historical behaviour for
 * every machine this cannot identify. A software rasteriser starts at the
 * floor; a known-weak integrated part starts one step down, which is the
 * package PERF-LEDGER.md measured (frozen and baked sky, no reflection, no
 * grain, HUD effects off) without touching the draw cadence or the enemy count.
 */
export const desktopStartTier = (): DeviceTier => {
  switch (gpuClass(readGpuRenderer())) {
    case 'software': return 'low'
    case 'weak': return 'mid'
    default: return 'high'
  }
}

/** Test-only: forget the cached renderer string. */
export const __resetGpuCache = (): void => { gpuRendererCache = undefined }

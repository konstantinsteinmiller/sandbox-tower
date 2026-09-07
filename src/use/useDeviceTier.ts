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

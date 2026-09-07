/**
 * ─── perfVariants — boot-frozen A/B overrides for performance experiments ────
 *
 * Companion to `usePerfProbe.ts` and `tools/perf-ab.mjs`
 * (`web-game-performance-optimize` skill).
 *
 * These are OVERRIDES, not settings. The permanent home for "what does this
 * device get" is the render profile in `useDeviceTier.ts`; this module exists
 * so a measurement run can flip ONE of those decisions from the URL without
 * the game's own logic changing. `override()` therefore answers `null` for
 * anything the runner did not ask about, and the caller keeps its own default:
 *
 *     const REFLECTION = override('reflection') ?? profile.reflection
 *
 * ── The contract ──────────────────────────────────────────────────────────
 * 1. Every flag is resolved ONCE, at module load, and frozen. A flag that can
 *    change mid-run makes the measurement meaningless, and a lookup that reads
 *    localStorage per frame IS the regression you would be measuring.
 * 2. Branch at the coarsest level that isolates the change, so the check never
 *    lands in an inner loop. Hoist it into a module-scope `const`.
 * 3. Both paths must produce the SAME gameplay. These all change how the scene
 *    is PAINTED; none of them change the simulation.
 * 4. When an experiment concludes, delete its name from `VARIANTS` and leave
 *    the winner as the profile's value. A flag kept "just in case" rots.
 *
 * ── Resolution order (first hit wins) ─────────────────────────────────────
 *    ?perf.staticsky=on|off      URL — what perf-ab.mjs sets
 *    localStorage['perf.staticsky']
 *    import.meta.env.VITE_PERF_STATICSKY
 *    null (the caller's own default stands)
 */

/**
 * Every live experiment.
 *
 * A name is removed the moment its experiment is settled AND one of its two
 * paths stops shipping — the merge-tier sprite and the measured bake budget
 * both went that way, and their losing branches were deleted with them. The
 * four below stay because BOTH paths still ship: the desktop draws a moving
 * sky and a mirrored tower, the phone tiers do not, so each flag is the way to
 * force one tier's answer and re-run the row in PERF-LEDGER.md that decided it.
 */
const VARIANTS = [
  /** E2 — freeze the day/night clock so the cached background layer stops
   *  re-rasterising every 4.5 s. */
  'staticsky',
  /** E2b — sky gradient + celestial bloom baked into the cached layer instead
   *  of repainted live every frame. Only sound while the sky is frozen. */
  'bakedsky',
  /** E3 — mirrored tower reflection in the water. */
  'reflection',
  /** E6 — paper-tooth grain pass (a full-canvas `multiply` fill). */
  'grain'
] as const

export type PerfVariant = (typeof VARIANTS)[number]

const params = typeof location === 'undefined' ? null : new URLSearchParams(location.search)

const parseBool = (raw: string | null | undefined): boolean | null => {
  if (raw === null || raw === undefined || raw === '') return null
  const v = raw.toLowerCase()
  if (v === 'on' || v === 'true' || v === '1') return true
  if (v === 'off' || v === 'false' || v === '0') return false
  return null
}

const fromEnv = (name: string): boolean | null => {
  try {
    const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env
    if (!env) return null
    return parseBool(env[`VITE_PERF_${name.toUpperCase()}`])
  } catch {
    return null
  }
}

const resolve = (name: string): boolean | null => {
  const fromUrl = parseBool(params?.get(`perf.${name}`))
  if (fromUrl !== null) return fromUrl
  try {
    const stored = parseBool(localStorage.getItem(`perf.${name}`))
    if (stored !== null) return stored
  } catch {
    /* storage blocked (incognito, sandboxed iframe, YouTube Playables) */
  }
  return fromEnv(name)
}

/** Resolved once, at module load, then frozen. */
const RESOLVED: Readonly<Record<PerfVariant, boolean | null>> = Object.freeze(
  Object.fromEntries(VARIANTS.map((k) => [k, resolve(k)])) as Record<PerfVariant, boolean | null>
)

/**
 * The measurement run's answer for `name`, or `null` when it did not ask.
 *
 * Call this at MODULE SCOPE and store the result in a const — never inside a
 * per-frame function.
 */
export const override = (name: PerfVariant): boolean | null => RESOLVED[name]

/** e.g. "reflection=off,staticsky=on" — stamped into every PerfReport, so a
 *  ledger row can never be attributed to the wrong variant. */
export const describe = (): string =>
  VARIANTS.filter((k) => RESOLVED[k] !== null)
    .map((k) => `${k}=${RESOLVED[k] ? 'on' : 'off'}`)
    .join(',') || 'defaults'

if (typeof globalThis !== 'undefined') {
  ;(
    globalThis as unknown as { __perfVariants: { describe(): string; all: typeof RESOLVED } }
  ).__perfVariants = { describe, all: RESOLVED }
}

export default { override, describe, all: RESOLVED }

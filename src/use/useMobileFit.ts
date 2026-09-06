import { ref, type Ref } from 'vue'
import { mobileCheck } from '@/utils/function'
import { isPoki } from '@/use/useUser'
import { pokiDeviceCategory, type PokiDeviceCategory } from '@/utils/pokiPlugin'

/**
 * ─── Which game does this device get? ───────────────────────────────────────
 *
 * The desktop tower and the mobile-fit Drop & Merge board are one bundle:
 * Poki (and every other portal) serves the same build to a laptop and to a
 * phone and tells us, at runtime, which one it landed on. So the choice is a
 * runtime MODE, decided once per session before the first scene mounts, and
 * frozen — a run is played on one board from its first tick to its last, and a
 * rotation only ever shows a "turn your phone" overlay.
 *
 * `VITE_USE_MOBILE_FIT_GAME` is the kill switch. When it is `false` the
 * resolver answers `desktop` for every device, the router never reaches the
 * mobile-fit import, and Rollup leaves the whole `src/mobile-fit` package out
 * of the bundle. It defaults to ON (an unset variable is not `'false'`).
 */

export type FitMode = 'desktop' | 'dropmerge'

/** Build-time literal, so the dead branch folds. */
export const MOBILE_FIT_ENABLED = import.meta.env.VITE_USE_MOBILE_FIT_GAME !== 'false'

/** Resolved once by `settleFitMode`; `desktop` until then. */
export const fitMode: Ref<FitMode> = ref('desktop')

export interface FitSignals {
  /** `location.search` plus the query part of the hash, if any. */
  query: string
  pokiCategory: PokiDeviceCategory | null
  coarsePointer: boolean
  mobileUa: boolean
  /** The viewport's short side, CSS px. */
  shortSide: number
  enabled?: boolean
}

/** Tablets get the phone scheme on Poki (their rule); everywhere else a
 *  600 px short side is where the desktop layout starts to fit. */
export const TABLET_SHORT_SIDE = 600

/**
 * The decision, as a pure function of what the device told us.
 *
 * Order matters: a QA override (`?fit=`) beats everything; the portal's own
 * device category beats our guess; and the guess needs BOTH a touch signal and
 * a phone-sized viewport, so a touch laptop keeps the desktop game.
 */
export const resolveFitMode = (s: FitSignals): FitMode => {
  if (!(s.enabled ?? MOBILE_FIT_ENABLED)) return 'desktop'
  const forced = new URLSearchParams(s.query).get('fit')
  if (forced === 'desktop') return 'desktop'
  if (forced === 'dropmerge' || forced === 'mobile') return 'dropmerge'
  if (s.pokiCategory === 'mobile' || s.pokiCategory === 'tablet') return 'dropmerge'
  if (s.pokiCategory === 'desktop') return 'desktop'
  if ((s.coarsePointer || s.mobileUa) && s.shortSide < TABLET_SHORT_SIDE) return 'dropmerge'
  return 'desktop'
}

/** The query string, wherever the portal put it: `?fit=x#/` or `#/?fit=x`. */
const fullQuery = (): string => {
  if (typeof location === 'undefined') return ''
  const hashQuery = location.hash.includes('?') ? location.hash.slice(location.hash.indexOf('?')) : ''
  const search = location.search.startsWith('?') ? location.search.slice(1) : location.search
  const hashPart = hashQuery.startsWith('?') ? hashQuery.slice(1) : hashQuery
  return [search, hashPart].filter(Boolean).join('&')
}

export const readFitSignals = (): FitSignals => ({
  query: fullQuery(),
  pokiCategory: pokiDeviceCategory.value,
  coarsePointer: typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches,
  mobileUa: mobileCheck(),
  shortSide: typeof window === 'undefined' ? 1024 : Math.min(window.innerWidth, window.innerHeight)
})

/** How long to wait for Poki's device category before guessing. */
const POKI_CATEGORY_WAIT_MS = 1500

let settled: Promise<FitMode> | null = null

/**
 * Decide the mode, once.
 *
 * On Poki the SDK is initialised in parallel with the boot (deliberately — see
 * `main.ts`), so its device category may not be in yet. The first navigation
 * waits for it, briefly; a category that never arrives falls through to the
 * touch-and-size guess. Every later call returns the same answer.
 */
export const settleFitMode = (): Promise<FitMode> => {
  if (settled) return settled
  settled = (async () => {
    if (!MOBILE_FIT_ENABLED) {
      fitMode.value = 'desktop'
      return fitMode.value
    }
    if (isPoki && pokiDeviceCategory.value === null) {
      const until = Date.now() + POKI_CATEGORY_WAIT_MS
      while (pokiDeviceCategory.value === null && Date.now() < until) {
        await new Promise((r) => setTimeout(r, 50))
      }
    }
    fitMode.value = resolveFitMode(readFitSignals())
    return fitMode.value
  })()
  return settled
}

/** Tests only: forget the settled answer. */
export const __resetFitMode = (): void => {
  settled = null
  fitMode.value = 'desktop'
}

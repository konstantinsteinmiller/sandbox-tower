import type { I18n } from 'vue-i18n'
import { LANGUAGES } from '@/utils/enums'
import { getState } from '@/use/useTowerState'
import { LANGUAGE_KEY } from '@/keys'
import { portalLocale, resolveActiveLocale } from '@/use/usePortalLocale'

/**
 * Does a portal own the display language on this build?
 *
 * Read off `import.meta.env` literals rather than the `useUser` flags so Vite
 * folds the whole expression to a constant at build time — and so this module
 * does not drag `useUser`'s module-load side effects into its own import graph.
 */
const IS_PORTAL_BUILD =
  import.meta.env.VITE_APP_CRAZY_WEB === 'true'
  || import.meta.env.VITE_APP_PLAYGAMA === 'true'
  || import.meta.env.VITE_APP_YANDEX === 'true'
  || import.meta.env.VITE_APP_GAMEPIX === 'true'
  || import.meta.env.VITE_APP_GAME_DISTRIBUTION === 'true'
  || import.meta.env.VITE_APP_GAME_MONETIZE === 'true'

/**
 * Locale loader — lazy, code-split, cache-safe.
 *
 * Every file under `./locales/*.ts` is registered with Vite as a
 * dynamic import, which makes each locale its own chunk. The selected
 * locale is fetched on demand; the rest stay out of the critical path.
 *
 * The `{ import: 'default' }` option tells Vite to unwrap the module's
 * default export automatically so callers get the raw messages object.
 */
const localeLoaders = import.meta.glob<Record<string, unknown>>(
  './locales/*.ts',
  { import: 'default' }
)

/** In-memory cache so repeat `loadLocale` calls don't re-import. */
const localeCache = new Map<string, Record<string, unknown>>()
/** Shared in-flight promises so concurrent calls coalesce. */
const localeInFlight = new Map<string, Promise<Record<string, unknown>>>()

const pathFor = (code: string) => `./locales/${code}.ts`

export const isSupportedLocale = (code: string | null | undefined): code is string =>
  !!code && LANGUAGES.includes(code)

/**
 * Dynamically load a single locale's message bundle. Safe to call for
 * already-loaded locales (returns the cached object immediately).
 * Throws if the locale file is missing so callers can fall back to `en`.
 */
export const loadLocaleMessages = async (
  code: string
): Promise<Record<string, unknown>> => {
  const cached = localeCache.get(code)
  if (cached) return cached

  const inflight = localeInFlight.get(code)
  if (inflight) return inflight

  const loader = localeLoaders[pathFor(code)]
  if (!loader) throw new Error(`[i18n] no locale file for "${code}"`)

  const promise = loader().then((msgs) => {
    const resolved = (msgs ?? {}) as Record<string, unknown>
    localeCache.set(code, resolved)
    localeInFlight.delete(code)
    return resolved
  })
  localeInFlight.set(code, promise)
  return promise
}

// ─── Document-level locale ─────────────────────────────────────────────────
//
// `lang` and `dir` on `<html>`. Nothing set these before, which meant Arabic —
// a locale this game ships and lists in its own picker — rendered
// left-to-right, and every script fell back to whatever `sans-serif` resolved
// to on the device.
//
// `lang` is also what the script-specific font stacks and typography
// corrections in `App.vue` key off, so this one call is what makes Han, Thai,
// Devanagari and Arabic text render in a face chosen for them.

/** Locales written right-to-left. Arabic is the only one shipped today. */
const RTL_LOCALES = new Set(['ar'])

/**
 * Stamp `lang` + `dir` on the document element.
 *
 * Called at first paint AND on every switch: a `dir` applied only at boot
 * leaves a mid-session switch into Arabic rendering the wrong way round, which
 * is exactly the flow a portal's language test drives.
 */
export const applyDocumentLocale = (code: string): void => {
  if (typeof document === 'undefined') return
  const el = document.documentElement
  el.setAttribute('lang', code)
  el.setAttribute('dir', RTL_LOCALES.has(code) ? 'rtl' : 'ltr')
}

/**
 * Ensure a locale is registered with the given i18n instance and switch to
 * it. Designed to be called from UI code (OptionsModal language dropdown,
 * CrazyGames locale sync, etc.) — it will no-op if the locale is already
 * the active one and messages are already present.
 *
 * On load failure, the promise resolves *without* switching so the UI
 * keeps rendering the previously active locale.
 */
export const setI18nLocale = async (
  i18n: I18n<any, any, any, string, false>,
  code: string
): Promise<void> => {
  const target = isSupportedLocale(code) ? code : 'en'
  const g: any = i18n.global
  // Already-loaded locales can switch synchronously.
  if (g.availableLocales.includes(target)) {
    g.locale.value = target
    applyDocumentLocale(target)
    return
  }
  try {
    const msgs = await loadLocaleMessages(target)
    g.setLocaleMessage(target, msgs)
    g.locale.value = target
    applyDocumentLocale(target)
  } catch (e) {
    console.error(`[i18n] failed to load locale "${target}"`, e)
  }
}

/**
 * Resolve the locale we should boot with, synchronously, before creating the
 * i18n instance so the first dynamic import targets only the right locale file.
 *
 * `portalHint` is the language the host portal reported (CrazyGames, Playgama,
 * Yandex). It is published into the live `portalLocale` ref and then weighed
 * against the player's stored choice by `resolveActiveLocale` — which is where
 * the precedence rules live, so the boot path and every later re-decision
 * (a late bridge answer, a mid-session portal switch) agree by construction.
 *
 * The stored choice is checked BEFORE the portal hint, not after: putting the
 * portal first made every load flash the portal's language for a player who had
 * already picked something else, until a post-hydrate watcher corrected it.
 *
 * The fallback splits by build. On a portal build there is no
 * `navigator.language` step — Playgama's rule is that the default is English,
 * and the Bridge's own `platform.language` already falls back to the browser
 * language, so honouring the browser again would boot a tester's machine into
 * their own locale and read as the game ignoring the portal. On a plain web
 * build no portal contract applies, so the browser guess is the best default
 * available.
 *
 * `sandbox_state.ts_user_language` has already been populated from the cloud by
 * `SaveManager.init()` before `main.ts` calls us. Nothing here touches
 * sessionStorage (CG QA: NO locally-saved data).
 */
export const resolveInitialLocale = (portalHint?: string | null): string => {
  if (isSupportedLocale(portalHint)) portalLocale.value = portalHint
  const stored = getState<string | undefined>(LANGUAGE_KEY)
  const nav = typeof navigator !== 'undefined'
    ? navigator.language?.split('-')[0]
    : undefined
  const fallback = !IS_PORTAL_BUILD && isSupportedLocale(nav) ? nav : 'en'
  return resolveActiveLocale(stored, fallback)
}

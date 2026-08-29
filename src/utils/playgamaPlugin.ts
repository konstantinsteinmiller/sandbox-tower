// ─── Playgama Bridge plugin ────────────────────────────────────────────────
//
// Lazy-loaded module that owns everything the game talks to the Playgama
// Bridge SDK about. Mirrors `gameDistributionPlugin.ts` / `glitchPlugin.ts`
// in shape — `main.ts` only imports it when `isPlaygama` is true so non-
// Playgama builds never ship the SDK glue.
//
// "Playgama Bridge" is the unified abstraction Playgama ships across 28+
// portals (production Playgama, Yandex, CrazyGames, Poki, GameSnacks, …).
// On the production Playgama portal `bridge.platform.id === 'playgama'`.
// On localhost dev (no parent-frame handshake) the bridge falls back to
// MOCK and `platform.id === 'mock'` — that's the fast happy path.
//
// **DO NOT** override `forciblySetPlatformId` in the bridge config. The
// bridge has built-in detectors per parent-frame protocol; forcing a
// platform id pins it to ONE protocol and breaks every other context
// (notably the developer QA tool, which speaks a different protocol than
// production). See `nexusorbiter` integration-doc pitfall A.

import { ref } from 'vue'
import { isPlaygama } from '@/use/useUser'
import { isDebug } from '@/use/useMatch'
import { pauseGame, resumeGame } from '@/use/useGamePause'
import { setPlatformAudioMuted } from '@/use/useGamePauseAudio'
import { portalLocale } from '@/use/usePortalLocale'
import { LANGUAGES } from '@/utils/enums'
import type { SaveStrategy } from '@/utils/save/types'
// Static import — the obfuscator's `stringArray` mangles dynamic-import
// literals, which on the Playgama QA Tool surfaced as
// `Failed to resolve module specifier '@/utils/save/PlaygamaStrategy'`
// at runtime. Static-importing it inlines the (small) strategy class
// into this plugin's already-lazy-loaded chunk; non-Playgama builds
// don't touch this module at all (resolveSaveStrategy's `VITE_APP_PLAYGAMA`
// arm is dead code outside Playgama), so the bundle cost stays zero.
import { PlaygamaStrategy } from '@/utils/save/PlaygamaStrategy'

const SDK_SRC = 'https://bridge.playgama.com/v1/stable/playgama-bridge.js'
// Production handshake on cold-start can take 5-7 s; keep generous headroom
// so a slow CDN / mobile cold-cache doesn't latch the "ads blocked" rail
// for the rest of the session. Localhost MOCK resolves in <50 ms either way.
const INIT_TIMEOUT_MS = 15_000

// Options handed to `bridge.initialize()`.
//
// The bridge resolves its config as `ConfigLoader.load(configFilePath, options)`
// — it fetches `./playgama-bridge-config.json` first and only falls back to
// this object when that fetch or parse FAILS. QA wrappers and CDNs that don't
// serve the JSON are common, so the same values ship in both places (see the
// `emit-playgama-bridge-config` plugin in `vite.config.ts`).
//
// `allowAnonymousCloudSave` is the one that matters. The bridge gates
// `isStorageAvailable('platform_internal')` on
// `allowAnonymousCloudSave === true || player.isAuthorized`, and guests — most
// portal traffic, and the QA reviewer's first run — are not authorized. Without
// the flag every cloud write silently degrades to the bridge's local adapter
// and nothing ever reaches the Playgama remote. It looks like it works, because
// localStorage is still there.
const BRIDGE_INIT_OPTIONS = {
  storage: { allowAnonymousCloudSave: true },
  advertisement: { minimumDelayBetweenInterstitial: 120 }
} as const

// How often to re-read `bridge.platform.language`.
//
// The bridge emits NO language-change event (confirmed against the full
// platform API reference), but Playgama's guided testing tools flip the
// language mid-session — the QA tool re-sends its INITIALIZE message, which
// re-assigns the cached `_platformLanguage`. A single read at init passes
// nothing; a cheap getter read plus a string compare every 2 s does.
const LANGUAGE_POLL_MS = 2_000

// Adapters with no portal behind them. Their `platform.language` is just
// `navigator.language`, so honouring it boots the game in the tester's browser
// language and earns the "default language must be English" ticket. `qa_tool`
// is deliberately NOT in this set — it has its own language selector and
// exercising it is the entire point of the localization check.
const NO_PORTAL_LANGUAGE = new Set(['mock', 'standalone'])

/**
 * How long to wait for an ad request to show ANY sign of life before deciding
 * it was never filled.
 *
 * This governs the ad-before-the-result-screen contract, so it is not a free
 * parameter. `presentDefeat` awaits the interstitial and only then reveals the
 * death screen; if this wrapper resolves while the ad is still on its way, the
 * screen is revealed underneath it and the ad lands ON TOP a moment later —
 * which is exactly what "the interstitial appeared after the death screen"
 * looks like from the outside.
 *
 * It was 800 ms, measured from the moment `showInterstitial()` resolved — and
 * that promise resolves when the request is DISPATCHED, not when the ad opens.
 * An ad waterfall that takes a second and a half to render (normal) beat the
 * timer every time. 4 s is longer than any fill takes to at least report
 * `loading`, and it is only ever paid when the bridge says nothing at all:
 * a genuine no-fill emits `failed` and settles immediately.
 */
const AD_OPEN_GRACE_MS = 4_000

declare global {
  interface Window {
    bridge?: any
    playgamaBridge?: any
  }
}

/** Reactive: true once the bridge has resolved `initialize()` successfully. */
export const isPlaygamaSdkActive = ref(false)
/** Reactive: true when the bridge failed to come up or the script was
 *  blocked. Wired into `AdProvider.isAdsBlocked` via `PlaygamaProvider`. */
export const isPlaygamaAdsBlocked = ref(false)
/**
 * Two-letter locale derived from `bridge.platform.language`, normalised to a
 * language this game actually ships. `null` whenever the portal asked for
 * nothing we can honour — never a bare code we don't have a bundle for, and
 * never a guess, because a value here outranks the player's own choice when it
 * CHANGES (see `usePortalLocale`).
 *
 * Deliberately an ALIAS of the shared `portalLocale` ref rather than a second
 * ref that something has to copy across. The poll below keeps writing to it for
 * the whole session — Playgama's guided testing switches language mid-session
 * without reloading the frame — and a copy that only ran at boot would make the
 * poll invisible to the i18n watcher, which is the exact bug the poll exists to
 * fix.
 */
export const playgamaLocale = portalLocale
/** Auto-detected platform id reported by the bridge after init — useful for
 *  debugging which portal protocol the bridge picked. */
export const playgamaDetectedId = ref<string | null>(null)

// ─── Internal handles ──────────────────────────────────────────────────────

let initPromise: Promise<void> | null = null
let gameReadySent = false
let gameplayStartedActive = false
let heldPause = false
let injectPromise: Promise<any> | null = null
/** Edge-triggered bridge → unified pause gate. A double-`paused=true`
 *  emission from the bridge can't drift anything: we flip
 *  `isPlatformPaused` (idempotent), and the shared `useGamePauseAudio`
 *  orchestrator is what actually suspends/resumes audio off the aggregate
 *  `isGamePaused` — one suspend driver for every build, no double-count. */
const setPaused = (paused: boolean): void => {
  if (paused === heldPause) return
  heldPause = paused
  if (paused) pauseGame()
  else resumeGame()
}

/**
 * Portal audio toggle → engine mute.
 *
 * Read-only signal: the Bridge exposes `isAudioEnabled` but no setter, the
 * portal chrome owns it. `setPlatformAudioMuted` is edge-triggered and holds
 * its own slot in the shared ref-counted suspend stack, so a duplicated
 * `enabled=false` cannot strand the game silent and this can safely overlap an
 * ad's own pause.
 *
 * `undefined` (the property missing on an older bridge / adapter) is treated as
 * "audio enabled", never as a mute: a mute we invented and can never be told to
 * lift is a permanently silent game.
 */
const applyPortalAudioState = (enabled: unknown): void => {
  setPlatformAudioMuted(enabled === false)
}

/**
 * Read `bridge.platform.isAudioEnabled` and apply it.
 *
 * The property is a getter behind the same init guard as `bridge.storage` and
 * `platform.language` — it throws before `initialize()` resolves, and some
 * adapters throw again during an ad takeover. Wrapped so a throwing getter
 * cannot abort the rest of the init wiring (the pause subscription lives a few
 * lines below it).
 */
const readAndApplyPortalAudio = (): void => {
  const bridge = getBridge()
  try {
    applyPortalAudioState(bridge?.platform?.isAudioEnabled)
  } catch (e) {
    if (isDebug.value) console.warn('[playgama] isAudioEnabled read threw', e)
  }
}

const getBridge = (): any =>
  typeof window === 'undefined' ? null : (window.bridge ?? window.playgamaBridge ?? null)

/** Public accessor — `PlaygamaStrategy` reads `bridge.storage` through this. */
export const getPlaygamaBridge = (): any => getBridge()

// ─── Portal language ──────────────────────────────────────────────────────

/**
 * Collapse whatever the host portal reported into a language code we ship.
 *
 * The Bridge passes the host's value straight through from 28+ portals, so the
 * ISO 639-1 the docs promise is only one of the shapes that arrive: `zh-CN`,
 * `zh-Hant`, `pt-BR` and 3-letter ISO 639-2 (`deu`, `ara`, `zho`) all show up.
 * Anything we can't map returns `null` rather than a bare code — an unsupported
 * portal language must not be able to knock a player out of their own choice.
 */
const normalizePortalLanguage = (raw: unknown): string | null => {
  if (typeof raw !== 'string' || raw.length === 0) return null
  const base = raw.toLowerCase().split(/[-_]/)[0] ?? ''
  if (LANGUAGES.includes(base)) return base
  // ISO 639-2/T and /B for the languages we ship. Cheaper and more predictable
  // than pulling in an Intl.Locale-based mapper for a handful of portals.
  const THREE_LETTER: Record<string, string> = {
    eng: 'en', ara: 'ar', zho: 'zh', chi: 'zh', deu: 'de', ger: 'de',
    nld: 'nl', dut: 'nl', spa: 'es', fra: 'fr', fre: 'fr', hin: 'hi',
    ind: 'id', ita: 'it', jpn: 'ja', kor: 'ko', kaz: 'kk', pol: 'pl',
    por: 'pt', rus: 'ru', tha: 'th', tur: 'tr', ukr: 'uk', uzb: 'uz',
    vie: 'vi'
  }
  return THREE_LETTER[base] ?? null
}

/** Read the portal language through the init guard. The getter throws
 *  `Before using the SDK you must initialize it` pre-init and can throw again
 *  during ad takeover, so every read is wrapped. */
const readPortalLanguage = (): string | null => {
  const bridge = getBridge()
  try {
    if (NO_PORTAL_LANGUAGE.has(String(bridge?.platform?.id ?? ''))) return null
    return normalizePortalLanguage(bridge?.platform?.language)
  } catch {
    return null
  }
}

let languagePollTimer: ReturnType<typeof setInterval> | null = null

/** Poll `platform.language` for the life of the session. Change-only logging —
 *  a 2 s timer that narrates every tick floods the QA console it is meant to
 *  be legible in. Skipped while the document is hidden. */
const startLanguagePoll = (): void => {
  if (languagePollTimer != null) return
  if (typeof window === 'undefined') return
  languagePollTimer = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
    const next = readPortalLanguage()
    if (next === null || next === playgamaLocale.value) return
    console.info('[playgama] portal language changed →', next)
    playgamaLocale.value = next
  }, LANGUAGE_POLL_MS)
}

// ─── SDK script injection (defensive — build-time tag is primary) ─────────

const ensureSdkLoaded = (): Promise<any> => {
  if (injectPromise) return injectPromise
  injectPromise = new Promise<any>((resolve) => {
    if (typeof window === 'undefined') return resolve(null)
    if (getBridge()) return resolve(getBridge())
    const existing = document.querySelector(`script[src="${SDK_SRC}"]`) as HTMLScriptElement | null
    const onLoad = () => {
      // Poll briefly — the bridge sets `window.bridge` synchronously on
      // load but some wrappers wrap the script in a deferred chunk.
      let tries = 0
      const tick = () => {
        const b = getBridge()
        if (b) return resolve(b)
        if (++tries > 200) return resolve(null) // ~10 s @ 50 ms
        setTimeout(tick, 50)
      }
      tick()
    }
    if (existing) {
      if (existing.dataset.loaded === 'true') return onLoad()
      existing.addEventListener('load', onLoad, { once: true })
      existing.addEventListener('error', () => resolve(null), { once: true })
      return
    }
    const tag = document.createElement('script')
    tag.src = SDK_SRC
    tag.async = false
    tag.addEventListener('load', () => { tag.dataset.loaded = 'true'; onLoad() }, { once: true })
    tag.addEventListener('error', () => resolve(null), { once: true })
    document.head.appendChild(tag)
  })
  return injectPromise
}

// ─── Public init ──────────────────────────────────────────────────────────

export const playgamaPlugin = (): Promise<void> => {
  if (initPromise) return initPromise
  if (!isPlaygama) {
    initPromise = Promise.resolve()
    return initPromise
  }
  initPromise = (async () => {
    const sdk = await ensureSdkLoaded()
    if (!sdk) {
      isPlaygamaAdsBlocked.value = true
      if (isDebug.value) console.warn('[playgama] SDK script missing — ads disabled')
      return
    }
    const bridge = getBridge()
    if (!bridge?.initialize) {
      isPlaygamaAdsBlocked.value = true
      return
    }
    try {
      await Promise.race([
        // Options are the FALLBACK the bridge uses when
        // `playgama-bridge-config.json` fails to fetch or parse — a QA wrapper
        // or CDN that does not serve the file is common. The same values ship
        // in both places; see `BRIDGE_INIT_OPTIONS`.
        bridge.initialize(BRIDGE_INIT_OPTIONS),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('initialize() timeout')), INIT_TIMEOUT_MS)
        )
      ])
      isPlaygamaSdkActive.value = true
      playgamaDetectedId.value = bridge?.platform?.id ?? null
      console.info('[playgama] initialized — platform.id:', playgamaDetectedId.value)

      // Language: read once now, then poll. There is no change event, and
      // Playgama's guided testing tools switch the language mid-session.
      playgamaLocale.value = readPortalLanguage()
      startLanguagePoll()

      const ev = bridge?.EVENT_NAME ?? {}
      const pauseEventName = ev.PAUSE_STATE_CHANGED ?? 'pause_state_changed'
      const audioEventName = ev.AUDIO_STATE_CHANGED ?? 'audio_state_changed'
      const interstitialEventName = ev.INTERSTITIAL_STATE_CHANGED ?? 'interstitial_state_changed'
      const rewardedEventName = ev.REWARDED_STATE_CHANGED ?? 'rewarded_state_changed'

      // ── Pause ──
      //
      // `PAUSE_STATE_CHANGED` is the bridge's AGGREGATED signal: it already
      // folds in visibility, ads and portal chrome. It is therefore the ONLY
      // subscriber allowed to move the pause gate.
      //
      // A `VISIBILITY_STATE_CHANGED` subscriber used to sit here too, calling
      // `setPaused(false)` on 'visible'. Both wrote the same `heldPause`
      // boolean, so a visibility event arriving while an interstitial was open
      // resumed the game and its music UNDERNEATH the ad. `useGamePause`
      // already tracks `document.visibilityState` itself, so dropping the
      // bridge's copy loses nothing.
      bridge.platform?.on?.(pauseEventName, (p: boolean) => setPaused(!!p))

      // ── Audio ──
      //
      // Muting is NOT pausing. Routing this into `setPaused` (what it did
      // before) freezes the game when the player touches the portal's speaker
      // icon, stopping the run they are in the middle of.
      // `setPlatformAudioMuted` drives the same ref-counted suspend stack the
      // ad gate uses, so it silences music AND SFX without touching gameplay,
      // and without writing anything into the player's saved volumes.
      //
      // The INITIAL read is the half that gets missed: the event only fires on
      // SUBSEQUENT changes, so a player arriving at an already-muted portal is
      // handled by this line and nothing else.
      readAndApplyPortalAudio()
      bridge.platform?.on?.(audioEventName, (enabled: boolean) => {
        applyPortalAudioState(enabled)
      })
      // Per-format flags drive only the ad-show promise resolution edges —
      // never pause. (Pause is the aggregated `PAUSE_STATE_CHANGED`.)
      bridge.advertisement?.on?.(interstitialEventName, (_s: string) => {
        // Pause is already handled by the aggregated event. Keep this
        // subscriber registered so the bridge knows we care about
        // interstitial lifecycle — used internally for `showInterstitialPG`.
      })
      bridge.advertisement?.on?.(rewardedEventName, (_s: string) => {
        // Same: grant edge is read inside `showRewardedPG` via a dedicated
        // listener registered at show time.
      })
    } catch (e) {
      console.warn('[playgama] initialize() failed', e)
      isPlaygamaAdsBlocked.value = true
      // A failed handshake costs us ads and cloud saves, but the bridge still
      // exposes its documented browser-language fallback — localisation should
      // not die with the SDK. Read it through the same normaliser (which
      // returns null on the mock / standalone adapters, so a dev boot is
      // unaffected) and keep polling in case the QA tool recovers.
      playgamaLocale.value = readPortalLanguage()
      startLanguagePoll()
    }
  })()
  return initPromise
}

// ─── Lifecycle messages ───────────────────────────────────────────────────

const sendMessage = (name: string, params?: any): void => {
  const bridge = getBridge()
  try {
    bridge?.platform?.sendMessage?.(name, params)
  } catch (e) {
    if (isDebug.value) console.warn('[playgama] sendMessage failed', name, e)
  }
}

/** Fires `in_game_loading_started`. Safe to call before init resolves — a
 *  no-op until `isPlaygamaSdkActive` flips true. */
export const playgamaLoadingStart = (): void => {
  if (!isPlaygamaSdkActive.value) return
  sendMessage('in_game_loading_started')
}

/** Fires `in_game_loading_stopped` AND `game_ready` (once). `game_ready`
 *  is a certification-mandatory edge — missing it is an explicit rejection
 *  reason on the Playgama QA Tool. Idempotent. */
export const playgamaGameLoadingStop = (): void => {
  if (!isPlaygamaSdkActive.value) return
  sendMessage('in_game_loading_stopped')
  if (gameReadySent) return
  gameReadySent = true
  sendMessage('game_ready')
}

/** Notify the portal that gameplay is starting. Idempotent. */
export const playgamaGameplayStart = (): void => {
  if (!isPlaygamaSdkActive.value || gameplayStartedActive) return
  gameplayStartedActive = true
  sendMessage('gameplay_started')
}

/** Companion to `playgamaGameplayStart`. Idempotent. */
export const playgamaGameplayStop = (): void => {
  if (!isPlaygamaSdkActive.value || !gameplayStartedActive) return
  gameplayStartedActive = false
  sendMessage('gameplay_stopped')
}

// ─── Ad show wrappers ─────────────────────────────────────────────────────

/** Shows an interstitial; resolves on `closed` or `failed`. Never rejects. */
export const showInterstitialPG = async (): Promise<void> => {
  await playgamaPlugin()
  const bridge = getBridge()
  if (!bridge?.advertisement?.showInterstitial) return
  return new Promise<void>((resolve) => {
    let settled = false
    let opened = false
    const ev = bridge?.EVENT_NAME ?? {}
    const evName = ev.INTERSTITIAL_STATE_CHANGED ?? 'interstitial_state_changed'
    const finish = () => {
      if (settled) return
      settled = true
      try { off?.() } catch { /* ignore */ }
      resolve()
    }
    const off = bridge.advertisement?.on?.(evName, (state: string) => {
      // ANY state at all means the bridge's own state machine is alive and will
      // tell us when this is over. The grace timer below is only for a bridge
      // that says nothing — never a reason to give up on one that is talking.
      opened = true
      if (state === 'closed' || state === 'failed') finish()
    })
    try {
      const maybe = bridge.advertisement.showInterstitial()
      if (maybe && typeof maybe.then === 'function') {
        // DO NOT settle when the show() promise resolves: Playgama resolves it
        // the instant the request is DISPATCHED, before the ad opens. Settling
        // there dropped the pause gate immediately, so music + gameplay resumed
        // UNDERNEATH the still-open ad — and, because `presentDefeat` awaits
        // this call before revealing the death screen, it also let the screen
        // appear first and the ad land on top of it. The lifecycle is driven by
        // INTERSTITIAL_STATE_CHANGED ('loading' → 'opened' → 'closed'/'failed').
        // The promise is only used to (a) catch a hard dispatch failure, and
        // (b) detect a bridge that never answers at all.
        maybe.then(
          () => { setTimeout(() => { if (!opened) finish() }, AD_OPEN_GRACE_MS) },
          () => finish()
        )
      }
    } catch (e) {
      console.warn('[playgama] showInterstitial threw', e)
      finish()
    }
    // Belt-and-braces: hard cap so a state event drop can't strand the call.
    setTimeout(finish, 60_000)
  })
}

/** Shows a rewarded video. Resolves `true` only when the bridge fired
 *  `rewarded` BEFORE the `closed` / `failed` edge (Playgama's docs note
 *  the grant edge is `'rewarded'`, not `'closed'`). */
export const showRewardedPG = async (): Promise<boolean> => {
  await playgamaPlugin()
  const bridge = getBridge()
  if (!bridge?.advertisement?.showRewarded) return false
  return new Promise<boolean>((resolve) => {
    let settled = false
    let rewarded = false
    let opened = false
    const ev = bridge?.EVENT_NAME ?? {}
    const evName = ev.REWARDED_STATE_CHANGED ?? 'rewarded_state_changed'
    const finish = () => {
      if (settled) return
      settled = true
      try { off?.() } catch { /* ignore */ }
      resolve(rewarded)
    }
    const off = bridge.advertisement?.on?.(evName, (state: string) => {
      // Same rule as the interstitial: any state means the bridge is talking,
      // so the silence timer below must not fire.
      opened = true
      if (state === 'rewarded') {
        // The grant edge. Playgama's docs note `rewarded` can arrive BEFORE
        // `closed`, so this is the one that pays out — never `closed` alone,
        // which a fast close-out would also produce.
        rewarded = true
        return
      }
      if (state === 'closed' || state === 'failed') finish()
    })
    try {
      const maybe = bridge.advertisement.showRewarded()
      if (maybe && typeof maybe.then === 'function') {
        // DO NOT settle when the show() promise resolves: Playgama resolves it
        // the instant the request is DISPATCHED — before the ad opens, and well
        // before the 'rewarded' grant edge. Settling there resolved granted=false
        // immediately and dropped the pause gate, so music + gameplay resumed
        // UNDER the still-open ad (the bug in the log). The grant + close are
        // driven entirely by REWARDED_STATE_CHANGED ('opened' → 'rewarded' →
        // 'closed'/'failed'). The promise is only used to (a) catch a hard
        // dispatch failure, and (b) detect a no-fill where the ad never opened.
        maybe.then(
          () => { setTimeout(() => { if (!opened) finish() }, AD_OPEN_GRACE_MS) },
          () => finish()
        )
      }
    } catch (e) {
      console.warn('[playgama] showRewarded threw', e)
      finish()
    }
    setTimeout(finish, 120_000)
  })
}

// ─── Save-strategy factory ────────────────────────────────────────────────

/**
 * Build the Playgama save strategy. Non-Playgama builds never reach this
 * code (resolveSaveStrategy's `VITE_APP_PLAYGAMA` arm is dead code there),
 * so the static import above doesn't bloat their bundles.
 */
export const createPlaygamaSaveStrategy = async (): Promise<SaveStrategy> => {
  return new PlaygamaStrategy()
}

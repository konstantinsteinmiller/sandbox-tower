// ─── Poki platform plugin ───────────────────────────────────────────────────
//
// Wraps PokiSDK v2 (https://game-cdn.poki.com/scripts/v2/poki-sdk.js) behind a
// small, safe surface. Nothing outside this file should touch `window.PokiSDK`,
// because two of the SDK's behaviours are footguns this module exists to
// neutralise. Both were found by de-minifying the shipped bundle; neither is in
// Poki's public docs.
//
//   1. THE BAD-EVENT KILL SWITCH. A `gameplayStart()` landing within 50 ms of
//      the preceding `gameplayStop()` increments an internal `badEvents`
//      counter. At 10, `gameplayStart`, `gameplayStop` AND `commercialBreak`
//      all become no-ops for the rest of the session (the counter decays 1/s).
//      Nothing surfaces but a debug log line — the game keeps running and
//      simply stops earning.
//
//      This project drives the bracket from `watch(isLiveGameplay, …)` in
//      GameScene, and `isLiveGameplay` is a computed over FOUR reactive inputs
//      (phase / showResult / isAnyModalOpen / isAdShowing). A modal closing in
//      the same tick an ad opens produces exactly the sub-50 ms stop→start pair
//      the SDK penalises. `pokiGameplayStart/Stop` below collapse duplicate
//      consecutive events and DEFER a start that lands inside the guard window
//      (cancelling it outright if a stop arrives first, so we never emit an
//      unmatched event).
//
//   2. `rewardedBreak()` IS NOT QUEUED BY THE LOADER SHIM. The 5.5 KB shim
//      queues `init` and `commercialBreak` for replay once the ~325 KB core
//      lands, but its `rewardedBreak` is a literal `() => Promise.resolve(false)`.
//      A rewarded button tapped in the first few hundred ms silently refuses the
//      reward. Hence `isPokiSdkActive` — flipped only after `init()` settles,
//      and the provider's `isRewardedReady` hangs off it.
//
// Poki has NO cloud-save API (its wrapper mirrors localStorage + IndexedDB
// itself — see PokiStrategy), NO audio-mute signal and NO pause signal. The
// game owns all three. The only ad-audio edge available is the `onStart`
// callback, which fires ONLY when a video ad genuinely opens — a no-fill
// resolves the promise without ever calling it. That is why PokiProvider sets
// `managesMidgameAudio: true`.
//
// NOTE ON `isAdShowing`: this module deliberately does NOT touch it. In this
// codebase `useAds` owns the pause/audio gate and passes an `onImpression`
// callback down; the wrappers here just invoke it on the real-ad edge. Flipping
// the ref from both places would double-manage the gate.

import { ref, computed } from 'vue'

// ─── Types ──────────────────────────────────────────────────────────────────

export type PokiDeviceCategory = 'desktop' | 'mobile' | 'tablet'
export type PokiRewardedSize = 'small' | 'medium' | 'large'

interface PokiSDKGlobal {
  init: (options?: Record<string, unknown>) => Promise<unknown>
  gameLoadingFinished: () => void
  gameplayStart: () => void
  gameplayStop: () => void
  commercialBreak: (onStart?: () => void) => Promise<unknown>
  rewardedBreak: (
    arg?: (() => void) | { onStart?: () => void, size?: PokiRewardedSize }
  ) => Promise<boolean>
  measure: (category: string, what?: string, action?: string) => void
  captureError: (err: unknown) => void
  getLanguage: () => string
  getDeviceInfo: () => { category: PokiDeviceCategory }
  getURLParam: (name: string) => string
  movePill: (topPercent: number, topPx: number) => void
  muteAd: () => void
  setVolume: (volume: number) => void
  setDebug: (on?: boolean) => void
}

declare global {
  interface Window {
    PokiSDK?: PokiSDKGlobal
    /** Local-dev switch (set before init): no monetization; `init()` resolves
     *  in ~10 ms, `commercialBreak()` in 100 ms, `rewardedBreak()` resolves
     *  TRUE in ~200 ms. Lets the grant path be exercised without a stub. */
    __poki_no_ads?: boolean
  }
}

const SDK_SRC = 'https://game-cdn.poki.com/scripts/v2/poki-sdk.js'

/**
 * The SDK penalises a `gameplayStart` less than 50 ms after a `gameplayStop`.
 * 120 ms gives headroom for rAF jitter and for a promise chain that settles
 * inside a single frame.
 */
const MIN_EVENT_GAP_MS = 120

/** How long to wait for the shim to define `window.PokiSDK`. The tag is in
 *  index.html and module scripts are deferred, so in practice this resolves on
 *  the first poll; the budget only matters if the CDN is slow or blocked. */
const SDK_WAIT_TIMEOUT_MS = 8000

const getSdk = (): PokiSDKGlobal | null =>
  (typeof window !== 'undefined' && window.PokiSDK) || null

const warn = (...args: unknown[]): void => console.warn('[poki]', ...args)

// ─── Reactive state ─────────────────────────────────────────────────────────

/** True once `PokiSDK.init()` has SETTLED — resolved OR rejected. Poki's docs
 *  are explicit that a rejected init must still boot the game, and the core is
 *  loaded either way, so the real (queued) methods are live from that point.
 *  Every rewarded surface gates on this: before it flips, `rewardedBreak()`
 *  resolves `false` from the loader shim's stub. */
export const isPokiSdkActive = ref(false)

/**
 * Constant `false`. `PokiSDK.isAdBlocked()` is hardcoded `() => false` in the
 * shipped v2 core, and `rewardedBreak()` resolving `false` conflates "blocked",
 * "no fill" and "player skipped" — so there is no signal that could drive the
 * shared AdsBlockedModal without firing it on legitimate no-fills.
 *
 * Poki does not forbid such a modal (unlike the CrazyGames case, where the SDK
 * shows its own and `ownsAdBlockUi` suppresses ours to avoid stacking). It is
 * simply undetectable here. The binding requirement is the hard one from Poki's
 * requirements page — "games must remain fully playable when ad blockers are
 * active" — which is verified by playing the build with uBlock on, not by a flag.
 */
export const isPokiAdsBlocked = computed(() => false)

/** Portal language hint: `?iso_lang`, falling back to `navigator.language`.
 *  A HINT, not the player's choice — never persisted into LANGUAGE_KEY.
 *  Readable synchronously from the loader shim, before `init()` resolves. */
export const pokiLocale = ref<string | null>(null)

/** `'desktop' | 'mobile' | 'tablet'`. Poki requires tablets to be forced onto
 *  the MOBILE control scheme, and the SDK's classifier handles the iPadOS
 *  desktop-UA case (via `navigator.maxTouchPoints`) that a `pointer: coarse`
 *  media query gets wrong. Also readable pre-init. */
export const pokiDeviceCategory = ref<PokiDeviceCategory | null>(null)

// ─── Boot ───────────────────────────────────────────────────────────────────

let initPromise: Promise<void> | null = null

const ensureScriptTag = (): void => {
  if (typeof document === 'undefined') return
  if (document.querySelector(`script[src="${SDK_SRC}"]`)) return
  // Defensive: some QA wrappers serve their own index.html. Harmless when the
  // build-time tag is present (the query above short-circuits).
  const tag = document.createElement('script')
  tag.src = SDK_SRC
  tag.async = false
  document.head.appendChild(tag)
}

const waitForSdk = async (timeoutMs = SDK_WAIT_TIMEOUT_MS): Promise<PokiSDKGlobal | null> => {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const sdk = getSdk()
    if (sdk) return sdk
    if (Date.now() >= deadline) return null
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

/**
 * Read the portal language WITHOUT waiting for init. `getLanguage()` is fully
 * implemented in the loader shim, so it answers correctly the moment the tag has
 * run — which is what lets `main.ts` use the PARALLEL init arm and keep an ad
 * SDK off the first-paint critical path (Poki measures conversion-to-play on the
 * first `gameplayStart()`, so boot latency is revenue).
 */
export const readPokiLanguage = (): string | null => {
  const sdk = getSdk()
  if (!sdk) return null
  try {
    const raw = sdk.getLanguage?.()
    const code = typeof raw === 'string' ? raw.trim().toLowerCase().split('-')[0] : ''
    if (code) pokiLocale.value = code
    return code || null
  } catch (e) {
    warn('getLanguage threw', e)
    return null
  }
}

/**
 * Idempotent SDK boot. Safe to call from several entry points (`main.ts`, the
 * AdProvider's `init()`); they all join the same promise, so `PokiSDK.init()`
 * runs exactly once per page load. (Calling it twice only warns and returns the
 * original promise, but we don't rely on that.)
 */
export const pokiPlugin = (): Promise<void> => {
  if (initPromise) return initPromise

  initPromise = (async () => {
    ensureScriptTag()
    const sdk = await waitForSdk()
    if (!sdk) {
      warn('SDK never appeared — continuing without Poki (game stays playable)')
      return
    }

    readPokiLanguage()
    try {
      pokiDeviceCategory.value = sdk.getDeviceInfo?.().category ?? null
    } catch (e) {
      warn('getDeviceInfo threw', e)
    }

    // `setDebug(true)` is IGNORED on *.poki-gdn.com / gdn.poki.com and the
    // attempt is REPORTED to Poki as a `debugTrueInProduction` event. Never let
    // it out of dev.
    if (import.meta.env.DEV) {
      try { sdk.setDebug?.(true) } catch { /* non-fatal */ }
    }

    try {
      await sdk.init({})
    } catch (e) {
      // Documented behaviour: "Initialized, something went wrong, load your game
      // anyway." The core script has loaded regardless, so the real methods are
      // live from here.
      warn('init() rejected — booting the game anyway', e)
    }

    isPokiSdkActive.value = true
  })()

  return initPromise
}

// ─── Loading bracket ────────────────────────────────────────────────────────

let loadingFinishedSent = false

/**
 * The ONE strictly-required SDK call. Fired from `FLogoProgress.vue` on the
 * splash-resolved edge — the same edge that drives CrazyGames' `loadingStop`,
 * Playgama's `game_ready` and GamePix's `gameLoaded`.
 *
 * `gameLoadingStart()` and `gameLoadingProgress()` are `() => {}` in the v2
 * core — the loading bar is ours to drive, and there is nothing to report into.
 */
export const pokiGameLoadingFinished = (): void => {
  if (loadingFinishedSent) return
  const sdk = getSdk()
  if (!sdk) return
  loadingFinishedSent = true
  try { sdk.gameLoadingFinished() } catch (e) { warn('gameLoadingFinished threw', e) }
}

// ─── Gameplay bracket (bad-event-safe) ──────────────────────────────────────

type Bracket = 'idle' | 'playing'

let bracket: Bracket = 'idle'
let lastStopEmittedAt = 0
let pendingStart: ReturnType<typeof setTimeout> | null = null

const emitStart = (): void => {
  const sdk = getSdk()
  if (!sdk) return
  try { sdk.gameplayStart() } catch (e) { warn('gameplayStart threw', e) }
}

const emitStop = (): void => {
  const sdk = getSdk()
  if (!sdk) return
  try { sdk.gameplayStop() } catch (e) { warn('gameplayStop threw', e) }
  lastStopEmittedAt = performance.now()
}

/**
 * Open the gameplay bracket. Poki measures conversion-to-play (the Web Fit
 * Test's 65 % gate) on the FIRST of these, so it should fire as soon as the
 * player can act — not behind a menu.
 *
 * Idempotent, and never emits inside the SDK's 50 ms bad-event window: a start
 * that lands too soon after a stop is deferred rather than dropped.
 */
export const pokiGameplayStart = (): void => {
  if (bracket === 'playing') return
  bracket = 'playing'

  const since = performance.now() - lastStopEmittedAt
  if (lastStopEmittedAt === 0 || since >= MIN_EVENT_GAP_MS) {
    emitStart()
    return
  }

  pendingStart = setTimeout(() => {
    pendingStart = null
    if (bracket === 'playing') emitStart()
  }, MIN_EVENT_GAP_MS - since)
}

/**
 * Close the gameplay bracket: pause, modal, result screen, defeat, ad showing.
 * Emitted SYNCHRONOUSLY (never deferred) so it always precedes an ad request.
 *
 * If a start is still pending it never reached the SDK — cancel it and emit
 * nothing, rather than an unmatched stop.
 */
export const pokiGameplayStop = (): void => {
  if (bracket === 'idle') return
  bracket = 'idle'

  if (pendingStart) {
    clearTimeout(pendingStart)
    pendingStart = null
    return
  }
  emitStop()
}

/** Test seam — resets the bracket state machine between specs. */
export const __resetPokiGameplayBracketForTests = (): void => {
  if (pendingStart) clearTimeout(pendingStart)
  pendingStart = null
  bracket = 'idle'
  lastStopEmittedAt = 0
  loadingFinishedSent = false
}

// ─── Ads ────────────────────────────────────────────────────────────────────

/**
 * Interstitial. Resolves when the ad finished, errored, or was never shown —
 * never rejects.
 *
 * POSITION IS IMPLICIT: the SDK reports this as a PREROLL until the first
 * `gameplayStart()` and a MIDROLL after it (`__gameStarted ? midroll : preroll`
 * in the core). The first-play placement this project fires before the opening
 * wave therefore lands as a preroll, which is what Poki wants.
 *
 * `onImpression` is invoked ONLY when a video ad genuinely opens. A no-fill
 * resolves without calling it — which is what `managesMidgameAudio: true` on the
 * provider exists to exploit: the win/lose stinger survives an unfilled break.
 */
export const showMidgameAdPoki = async (onImpression?: () => void): Promise<void> => {
  const sdk = getSdk()
  if (!sdk || !isPokiSdkActive.value) return
  try {
    await sdk.commercialBreak(() => {
      try { onImpression?.() } catch (e) { warn('onImpression threw', e) }
    })
  } catch (e) {
    warn('commercialBreak threw', e)
  }
}

/**
 * Rewarded video. Resolves `true` ONLY when the reward is earned.
 *
 * `size` is undocumented but real: 'small' | 'medium' | 'large' plays 1 | 2 | 3
 * ads back to back. We stay on 'small' — this game's rewards (respin, 2× speed,
 * revive) are single-ad sized, and chaining videos for the same payout is the
 * kind of thing Poki's monetization review pushes back on.
 *
 * Returns `false` when the SDK has not initialised — matching the loader shim's
 * own stub, so callers behave identically either way. The provider keeps the
 * button hidden until then, so a player should never reach this branch.
 */
export const showRewardedAdPoki = async (
  size: PokiRewardedSize = 'small',
  onImpression?: () => void
): Promise<boolean> => {
  const sdk = getSdk()
  if (!sdk || !isPokiSdkActive.value) return false
  try {
    return await sdk.rewardedBreak({
      size,
      onStart: () => {
        try { onImpression?.() } catch (e) { warn('onImpression threw', e) }
      }
    })
  } catch (e) {
    warn('rewardedBreak threw', e)
    return false
  }
}

/**
 * Mirror the player's own mute onto the ad video, so an ad isn't the loudest
 * thing on the page for someone who muted the game. Both calls are undocumented
 * but present in the shipped core, and both no-op under `__poki_no_ads`.
 */
export const syncPokiAdVolume = (volume: number): void => {
  const sdk = getSdk()
  if (!sdk) return
  try {
    if (volume <= 0) sdk.muteAd?.()
    else sdk.setVolume?.(volume)
  } catch (e) { warn('ad volume sync failed', e) }
}

// ─── Analytics / errors / chrome ────────────────────────────────────────────

const MEASURE_FORBIDDEN = /[/^]/

/**
 * Progression + interaction funnels, e.g.
 *   pokiMeasure('wave', String(wave), 'start' | 'complete' | 'fail')
 *   pokiMeasure('rewarded', 'respin', 'visible' | 'interact')
 *
 * Rules: `/` and `^` are rejected outright by the SDK; a `start` must be
 * followed by exactly one of `complete`/`fail`; pair `visible` with `interact`;
 * keep the values stable across versions or the funnels break.
 *
 * NEVER measure an ad impression — the SDK tracks those itself and a duplicate
 * corrupts the report.
 */
export const pokiMeasure = (category: string, what: string, action: string): void => {
  const sdk = getSdk()
  if (!sdk) return
  if ([category, what, action].some((v) => MEASURE_FORBIDDEN.test(v))) {
    warn('measure() args cannot contain "/" or "^" —', category, what, action)
    return
  }
  try { sdk.measure(category, what, action) } catch (e) { warn('measure threw', e) }
}

/** Feeds P4D's 24-hour Error Scanner. Wired to the app's global error handlers
 *  in `main.ts`. Must never throw — it runs from inside an error path. */
export const pokiCaptureError = (err: unknown): void => {
  const sdk = getSdk()
  if (!sdk) return
  try { sdk.captureError(err) } catch { /* swallow: never fail while reporting */ }
}

/**
 * Move Poki's mobile nav pill off the game's top HUD. The pill is 46×62 px on
 * narrow screens / 92×64 px on wide ones and sits at the top of the canvas;
 * the platform default is `movePill(0, 24)`. Implemented as a
 * `window.top.postMessage`, so it silently no-ops outside the Poki wrapper —
 * harmless in the Inspector and in dev.
 */
export const pokiMovePill = (topPercent: number, topPx: number): void => {
  const sdk = getSdk()
  if (!sdk) return
  try {
    sdk.movePill(Math.min(50, Math.max(0, topPercent)), topPx)
  } catch (e) {
    warn('movePill threw', e)
  }
}

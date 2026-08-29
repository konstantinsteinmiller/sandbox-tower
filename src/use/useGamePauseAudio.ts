// ─── Central pause → audio + console-log orchestrator ──────────────────────
//
// ONE place, for EVERY build, that turns "the game is paused" into "all
// audio is silenced and we said so in the console". Every reason the game
// halts (rewarded / interstitial ad on screen, tab hidden, platform SDK
// pause callback, an app-side modal) already OR's into `isGamePaused`
// (see `useGamePause.ts`); this module subscribes to that single gate and:
//
//   • suspends ALL engine audio on the false→true edge (bg music + the
//     Web Audio context + every registered HTMLAudio element), and
//   • resumes it on the true→false edge,
//   • logging both transitions with the active pause reasons.
//
// GamePix QA flagged that music / SFX kept playing under interstitial and
// rewarded ads. The fix is structural: route the audio mute through the
// universal pause gate so it can NEVER be skipped on any provider —
// CrazyGames, GameDistribution, Playgama, GamePix, or the Noop/web build.
// The render loop already early-returns on `isGamePaused` (GameScene.vue),
// so this module is the audio half of the same gate.
//
// **Single suspend slot.** `suspendAllAudio` / `resumeAllAudio` are
// ref-counted in `useAssets.ts`. This orchestrator owns exactly ONE slot
// (tracked by `slotHeld`) so a duplicated `paused=true` emission can never
// drift the counter and leave the game permanently muted. All the older
// per-path suspends (in `useAds`, `gamepixPlugin`, `playgamaPlugin`,
// `useAssets.armVisibilitySuspend`) were removed in favour of this — there
// is now one suspend driver, not four overlapping ones.
//
// **`onPauseChange` fires with `flush: 'sync'`.** `useAds.showRewardedAd`
// flips `isAdShowing = true` and then immediately `await`s the SDK call,
// which opens the ad overlay synchronously before the await yields. The
// sync fanout guarantees this orchestrator's `suspendAllAudio()` runs
// inside that same call stack — there is no microtask window where music
// plays under the ad.

import { ref } from 'vue'
import { isGamePaused, getActivePauseReasons, onPauseChange } from '@/use/useGamePause'
import { suspendAllAudio, resumeAllAudio, killOneShotSfx } from '@/use/useAssets'
import { isDebug } from '@/use/useMatch'

const TAG = '[pause]'

/** Debug-gated console.info for the pause/resume audit lines. They fire on
 *  every ad / tab-hide / platform pause, so they spam the QA console — gate
 *  them behind `isDebug` (flip with the `cmarc` cheat or
 *  `localStorage.setItem('debug','true')`). */
const dlog = (...args: unknown[]): void => {
  if (isDebug.value) console.info(...args)
}

let installed = false
/** True while THIS orchestrator is holding its single audio-suspend slot. */
let slotHeld = false
let unsubscribe: (() => void) | null = null

/** Apply the current gate state to audio exactly once per edge. Logs the
 *  transition with the reasons that are (or were) active. */
const sync = (paused: boolean): void => {
  if (paused && !slotHeld) {
    slotHeld = true
    suspendAllAudio()
    const reasons = getActivePauseReasons()
    dlog(
      `${TAG} ⏸ PAUSE  reasons=[${reasons.join(', ') || 'unknown'}]`
      + ' → music + SFX suspended, render loop halted'
    )
  } else if (!paused && slotHeld) {
    slotHeld = false
    resumeAllAudio()
    dlog(
      `${TAG} ▶ RESUME → music + SFX resumed, render loop running`
    )
  }
}

/**
 * Wire the universal pause gate to the audio layer. Idempotent — calling
 * it more than once (main.ts boot + useAds module load) installs a single
 * subscriber. Returns an uninstall function (used by tests).
 *
 * Applies the current gate state immediately on install so a game that
 * boots into a hidden tab starts muted without waiting for a transition.
 */
export const installGamePauseAudio = (): (() => void) => {
  if (installed) return uninstallGamePauseAudio
  installed = true
  // Seed from the live gate so we don't miss a pause that is already
  // asserting at install time (e.g. booted in a backgrounded tab).
  sync(isGamePaused.value)
  unsubscribe = onPauseChange(sync)
  return uninstallGamePauseAudio
}

/** Tear down the subscriber and release the suspend slot if held. Mainly
 *  for tests — production installs once and never uninstalls. */
export const uninstallGamePauseAudio = (): void => {
  if (!installed) return
  unsubscribe?.()
  unsubscribe = null
  if (slotHeld) {
    slotHeld = false
    resumeAllAudio()
  }
  installed = false
}

// ─── Platform sound-toggle (audio-only, NOT a gameplay pause) ───────────────
//
// Portals like GamePix expose `soundOff` / `soundOn` callbacks that ask the
// game to mute / unmute WITHOUT pausing gameplay — the portal's own mute
// button, or an ad layer that wants silence while the game stays visible.
// This is distinct from the pause gate (which freezes the render loop too),
// so it does NOT go through `isGamePaused`. It still drives the SAME
// ref-counted suspend stack in `useAssets`, so this module remains the only
// audio authority — no second driver, no counter drift. Edge-triggered so a
// duplicated `soundOff` from the SDK can't double-suspend and strand the game
// muted.
/**
 * Reactive so the audio layer can GATE on it, not just react to the edge.
 *
 * A plain boolean was not enough, and Playgama QA caught exactly why:
 * *"After the reload the game plays sound although the platform is still
 * muted."* `suspendAllAudio()` pauses the HTMLAudio elements that exist at the
 * moment it runs — it cannot stop `bgMusic.play()` from being called a second
 * later. The portal mute is applied during boot, BEFORE the music element is
 * even created, so there was nothing to pause and nothing to stop the music
 * starting behind it.
 *
 * `useSound.playWithFade` now early-returns while this is true, and re-fires on
 * the false edge — the same shape as the `isMobileAudioMuted` guard beside it.
 */
export const isPlatformAudioMuted = ref(false)

/** Mute / unmute engine audio in response to a portal sound-toggle callback
 *  (`bridge.platform.isAudioEnabled`, GamePix `soundOff` / `soundOn`).
 *
 *  Holds its own ref-counted suspend slot, independent of the pause-gate slot —
 *  so an ad that fires BOTH a pause and a soundOff still resumes correctly once
 *  both clear. Idempotent per edge, so a duplicated SDK emission can never
 *  strand the game silent. */
export const setPlatformAudioMuted = (muted: boolean): void => {
  if (muted === isPlatformAudioMuted.value) return
  isPlatformAudioMuted.value = muted
  if (muted) {
    suspendAllAudio()
    // Hard-stop in-flight one-shots. Suspending the context only FREEZES a
    // Web Audio source; on unmute it would thaw and tail audibly, seconds
    // after the sound that spawned it.
    killOneShotSfx()
    dlog(`${TAG} 🔇 platform mute → audio suspended`)
  } else {
    resumeAllAudio()
    dlog(`${TAG} 🔊 platform unmute → audio resumed`)
  }
}

/** Test-only introspection: is the orchestrator currently holding its
 *  audio-suspend slot? */
export const __isAudioSlotHeld = (): boolean => slotHeld

/** Test-only introspection: is the platform sound-toggle mute active? */
export const __isPlatformAudioMuted = (): boolean => isPlatformAudioMuted.value

import { ref, type Ref } from 'vue'

// ─── The interstitial chord ─────────────────────────────────────────────────
//
// Thirty consecutive taps on the coin badge force an interstitial.
//
// WHY IT EXISTS. An interstitial is the hardest thing in a portal build to see
// on purpose. The placements that ship are paced (`canShowInterstitial` — at
// least 121 s apart), gated on a provider that has to be ready, and hung off
// events that cost a minute of play each to reach: a wave cleared, a defeat
// screen, a first load. So the question every ad integration actually has to
// answer — does the music really stop, does the game really pause, does it come
// back — is asked once per session on a real device, in the portal shell, where
// no build-time switch and no dev-only chord can reach. This one ships, for the
// same reason the vConsole chord ships (`useVConsole`).
//
// WHY IT DOES NOT CONSULT THE PACING GATE. The pacing gate is the thing under
// test. A chord that obeyed it would answer "no ad" for two entirely different
// reasons — the integration is broken, or it is simply too soon — and those are
// the two answers the person tapping needs to tell apart. So it goes straight
// to `showMidgameAd`, which is the same call the real placements make and
// carries the whole audio-kill / pause-gate contract with it (and stamps the
// pacing clock itself, so a forced ad still cannot be followed by a real one
// seconds later).
//
// WHY THERE IS NO COUNTER. The vConsole chord renders a `tap N/20` toast
// because its whole job is to tell a developer whether taps are arriving when
// nothing else on the page can. This one has a louder confirmation available —
// a full-screen ad — and a visible counter on the coin badge is a thing a
// PLAYER can discover and chase. It stays silent.

/**
 * Taps needed, and they must be consecutive: `GAP_MS` of quiet resets the run.
 *
 * Thirty, with a reset, is not reachable by accident. The badge is not a
 * control — a player has no reason to tap it even once — and a run of thirty
 * inside a second and a bit each is a deliberate act.
 */
export const AD_CHORD_TAPS = 30

/**
 * The longest pause allowed BETWEEN two taps of the same run, ms.
 *
 * A gap, not a window. The vConsole chord counts taps inside a rolling sixty
 * seconds, which is right for a chord somebody may hunt for; here it would let
 * a run accumulate across a whole minute of ordinary play and surprise a player
 * with an advert. Consecutive means consecutive.
 */
const GAP_MS = 1200

/**
 * How long a `click` is treated as the tail of the `pointerdown` before it.
 *
 * One physical tap fires BOTH: the badge listens on each because portal shells
 * swallow one or the other, and a finger press produces the pair about 30-50 ms
 * apart. Counting both would trip the chord at fifteen real taps, i.e. at a
 * number nobody was told about.
 *
 * Deduped by EVENT KIND rather than by elapsed time alone, and that distinction
 * is the whole of it: somebody entering a thirty-tap chord taps FAST, and a
 * plain "ignore anything within 60 ms" rule throws away the taps of anyone who
 * gets above about sixteen a second — so the chord would quietly stop working
 * for exactly the person trying hardest to enter it. A `pointerdown` therefore
 * always counts, and a `click` counts only when no `pointerdown` preceded it.
 */
const COALESCE_MS = 120

/** Which DOM event this tap arrived on — see `COALESCE_MS`. */
export type AdChordTapKind = 'down' | 'click'

let recentTaps = 0
let lastTapAt = 0
let lastDownAt = 0
let firing = false

/** Test seam: the actual ad call, so a spec can watch it without an SDK. */
let show: () => Promise<void> = async () => {
  const { showMidgameAd } = await import('@/use/useAds')
  await showMidgameAd()
}

/** Reactive only so a debug overlay COULD read it. Nothing on screen does. */
export const adChordTaps: Ref<number> = ref(0)

/** Swap the ad call. Tests only. */
export const __setAdChordShow = (fn: () => Promise<void>): void => { show = fn }

/** Forget the run in progress. Tests, and the fire path. */
export const resetAdChord = (): void => {
  recentTaps = 0
  lastTapAt = 0
  lastDownAt = 0
  adChordTaps.value = 0
}

/**
 * Register one tap on the chord trigger (the coin badge).
 *
 * Returns true on the tap that fired the ad, so a caller could flash a
 * confirmation. Nothing does.
 */
export const registerAdChordTap = (kind: AdChordTapKind = 'down'): boolean => {
  // An ad is already on its way or on screen; every tap on top of it is part of
  // the same burst and must not queue a second one behind the first.
  if (firing) return false

  const now = Date.now()
  if (kind === 'down') lastDownAt = now
  // The tail of a tap already counted on its `pointerdown`.
  else if (now - lastDownAt < COALESCE_MS) return false

  // Consecutive: too long since the last one and this tap starts a fresh run.
  recentTaps = lastTapAt > 0 && now - lastTapAt <= GAP_MS ? recentTaps + 1 : 1
  lastTapAt = now
  adChordTaps.value = recentTaps

  if (recentTaps < AD_CHORD_TAPS) return false

  firing = true
  resetAdChord()
  void (async () => {
    try {
      await show()
    } catch (e) {
      // The provider contract is not to reject, but a broken SDK is exactly
      // what this chord is used to find — so it must not take the page with it.
      console.warn('[ad-chord] interstitial threw', e)
    } finally {
      firing = false
    }
  })()
  return true
}

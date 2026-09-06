// ─── The player's first real gesture ────────────────────────────────────────
//
// One question, asked by two very different parts of the game:
//
//   * Poki forbids `gameplayStart()` before the player has touched the page.
//     It is enforced by hand in QA rather than by the SDK, so nothing throws —
//     the build simply comes back rejected (see `pokiPlugin`).
//   * The OPENING WAVE's countdown starts on the same edge. A game that boots
//     straight into a live stage cannot start that clock on load: a player
//     still reading the page around the frame would meet wave 1 having never
//     touched the game.
//
// Both need the same signal, and it has to be literally the same one — two
// independent gesture watches drift the moment one of them learns something
// the other does not, and all three subtleties below were learned the hard way.
//
// Nothing here runs at module scope: `armFirstInteraction()` is what installs
// the listeners, so importing this module is free and Rollup can still drop it.

import { computed, ref } from 'vue'

/** True once the player has genuinely acted on the page. Never goes back. */
export const hasUserInteracted = ref(false)

/** True once something has declared that it is waiting for that gesture. */
const armed = ref(false)

/**
 * Is a real player's first gesture still outstanding?
 *
 * False until `armFirstInteraction()` has run, and that is what makes this
 * safe for the domain layer to gate on: a headless run of the simulation (the
 * test suite, the balance harness) has no player to wait for and never arms
 * the watch, so the game behaves there exactly as it always did.
 */
export const awaitingFirstInteraction = computed(
  () => armed.value && !hasUserInteracted.value
)

/** Every way a player can first act on a game playable by mouse, finger or key. */
const GESTURE_EVENTS = ['pointerdown', 'touchstart', 'mousedown', 'keydown'] as const

/** Run once, on the opening edge, then dropped. */
const waiting = new Set<() => void>()

const onGesture = (e: Event): void => {
  // `isTrusted` only. A synthetic `dispatchEvent` is not a player — which is
  // also why `noteUserInteraction` is exported: a spec cannot open the gate by
  // faking an event, and should not be able to.
  if (e.isTrusted) noteUserInteraction()
}

const disarmGestureWatch = (): void => {
  if (typeof window === 'undefined') return
  for (const type of GESTURE_EVENTS) {
    window.removeEventListener(type, onGesture, { capture: true })
  }
}

/**
 * Start watching for the gesture. Idempotent, and safe to call from several
 * places — the splash, the scene and the Poki plugin all want it as early as
 * they can get it.
 */
export const armFirstInteraction = (): void => {
  if (armed.value || typeof window === 'undefined') return
  armed.value = true

  // The browser already knows. `userActivation.hasBeenActive` is sticky for
  // the lifetime of the document, so it catches the gesture our own listeners
  // are too late for: a player who taps during the splash has interacted, and
  // asking them for a SECOND tap is exactly the friction this exists to avoid.
  // Optional-chained because Safari only shipped it in 16.4 — where it is
  // missing, the listeners below are the whole gate.
  if (navigator.userActivation?.hasBeenActive) {
    noteUserInteraction()
    return
  }

  for (const type of GESTURE_EVENTS) {
    // CAPTURE phase, on `window`. The battlefield calls `stopPropagation()` on
    // its own pointer handlers, which hides the gesture from anything listening
    // on the bubble.
    window.addEventListener(type, onGesture, { capture: true, passive: true })
  }
}

/**
 * The player has acted.
 *
 * Called by the gesture watch, and directly by any call site that already
 * knows a real interaction happened.
 */
export const noteUserInteraction = (): void => {
  if (hasUserInteracted.value) return
  hasUserInteracted.value = true
  disarmGestureWatch()
  const due = [...waiting]
  waiting.clear()
  for (const fn of due) fn()
}

/**
 * Run `fn` on the first interaction — immediately if it already happened.
 *
 * A Set, so a caller that registers the same handler on every bracket it opens
 * (which `pokiPlugin` does) queues it once.
 */
export const onFirstInteraction = (fn: () => void): void => {
  if (hasUserInteracted.value) { fn(); return }
  waiting.add(fn)
}

/** Test seam — puts the gate back to "nobody has touched anything". */
export const __resetFirstInteractionForTests = (): void => {
  disarmGestureWatch()
  waiting.clear()
  armed.value = false
  hasUserInteracted.value = false
}

import type { TutorialStep } from '@/components/game/TutorialOverlay.vue'

// ─── May this beat stop the siege? ──────────────────────────────────────────
//
// One rule, in one place, as a pure function — because it lived inside a
// computed in `GameScene` and cost an eight-minute playtest.
//
// The failure: a coach mark was added around the Call Wave button, and the
// build clock was held for it exactly as it is held for the opening sequence.
// That beat is a POINTER over a live, playable game, so the countdown simply
// stopped — a player who did not press the button was never sent another wave,
// and nothing on screen said why. It is also the wrong lesson about the button
// itself, which exists to call a wave EARLY for a bonus rather than to be the
// only way one ever starts.
//
// Nothing here can be verified by looking at a running game for a few seconds,
// which is precisely why it belongs in a module a test can import.

/**
 * Beats that genuinely OWN the screen.
 *
 * A pictogram card or a scripted hand is playing and is eating the player's
 * input: a wave that started underneath one would be a wave they cannot fight.
 * These, and only these, may stop the clock on their own account.
 *
 * `call` is deliberately absent and must stay absent. So is every future beat
 * that only points at something — an arrow is a suggestion, and a suggestion
 * that halts the game until it is obeyed is a modal wearing an arrow's clothes.
 */
export const CLOCK_OWNING_STEPS: ReadonlySet<TutorialStep> = new Set<TutorialStep>([
  'mergeGuide', 'mergePower', 'rankGate'
])

/**
 * The total time the coach marks may hold the siege still, per run, ms.
 *
 * The backstop of last resort, and it exists because every OTHER guarantee in
 * this file is about a state the code can observe. This one is about the states
 * it cannot: a demo whose rAF clock stopped advancing, a target that measures
 * forever without the player ever being able to reach it, a beat nobody has
 * thought of yet. A game that has not sent a wave in forty-five seconds is
 * broken whatever the reason, and a broken tutorial must degrade into a playable
 * game rather than into a still photograph of one.
 *
 * Generous on purpose: the whole opening sequence is about fifteen seconds of
 * cards and three taps, so nothing that is working can reach this.
 */
export const MAX_HOLD_MS = 45_000

export interface HoldState {
  /** The beat that is live, or null when the tutorial is finished/not running. */
  step: TutorialStep | null
  /** The beat belongs to the forced opening sequence, which gates wave 1. */
  opening: boolean
  /**
   * The overlay has a measured target — i.e. there is actually something on
   * screen telling the player what to do.
   *
   * This is the second half of the 2026-09-15 audit, and the more expensive
   * half. `TutorialOverlay` renders NOTHING without a rect, deliberately: a dim
   * layer with no hole is a modal with no way out. But the hold did not follow
   * the same rule, so every way a target can go missing — the player pressing
   * Escape and closing the inspector the `rankUp` beat points into, a resumed
   * run that cannot afford the piece `place` teaches with — produced a game that
   * LOOKED normal and playable and would never send another wave. No overlay, no
   * explanation, and no wave: the player's session simply ended there.
   *
   * Ignored for the beats that own the screen: those measure no target by
   * design (their card or their scripted hand is the thing on screen) and must
   * keep holding.
   */
  hasTarget: boolean
  /** How long the tutorial has already held the clock this run, ms. */
  heldMs: number
}

/**
 * Should the build countdown be held right now?
 *
 * `opening` is true while the beat belongs to the forced opening sequence,
 * which gates wave 1 itself — the wave must not start before the player has
 * been taught to build. Everything after the opening is a lesson laid over a
 * game already in progress, and only earns a hold while it is covering the
 * screen.
 */
export const holdsBuildClock = (s: HoldState): boolean => {
  if (!s.step) return false
  // The backstop. Whatever the beat believes about itself, the siege resumes.
  if (s.heldMs >= MAX_HOLD_MS) return false
  if (CLOCK_OWNING_STEPS.has(s.step)) return true
  if (!s.opening) return false
  // A pointer beat earns the hold only while the player can see what it wants.
  return s.hasTarget
}

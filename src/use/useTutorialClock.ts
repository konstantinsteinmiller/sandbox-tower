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
 * These, and only these, may stop the clock.
 *
 * `call` is deliberately absent and must stay absent. So is every future beat
 * that only points at something — an arrow is a suggestion, and a suggestion
 * that halts the game until it is obeyed is a modal wearing an arrow's clothes.
 */
export const CLOCK_OWNING_STEPS: ReadonlySet<TutorialStep> = new Set<TutorialStep>([
  'mergeGuide', 'mergePower', 'rankGate'
])

/**
 * Should the build countdown be held?
 *
 * `opening` is true while the beat belongs to the forced opening sequence,
 * which holds unconditionally — those beats gate wave 1 itself, and the wave
 * must not start before the player has been taught to build. Everything after
 * the opening is a lesson laid over a game already in progress, and only earns
 * a hold while it is covering the screen.
 */
export const holdsBuildClock = (
  step: TutorialStep | null, opening: boolean
): boolean => {
  if (!step) return false
  if (opening) return true
  return CLOCK_OWNING_STEPS.has(step)
}

import type { TutorialStep } from '@/components/game/TutorialOverlay.vue'

// ─── The phone board's coach marks: when they run, when they retire ─────────
//
// The rules the scene applies, as plain functions, so they can be pinned by
// tests without mounting a canvas. See `GameSceneDrop`'s tutorial section for
// the beats themselves and the 2026-09-11 blind playtest for why these rules
// exist: five phone players, none of whom finished the drop beat, and every one
// of whom met the dimmed screen again on each new run.

/** The last wave the coach marks can show on. Past it the stage lets go. */
export const COACH_MARK_LAST_WAVE = 2

/** A weld this soon after the player's own drop is one that drop made. */
export const WELD_AFTER_DROP_MS = 8000

/**
 * Where a run's coach marks start. A player who has dropped a piece on this
 * board before is never walked through the drop again; they start at the merge
 * beat, which still has something to teach.
 */
export const firstBeatIndex = (dropLearned: boolean, tutorialDone: boolean): number =>
  dropLearned && !tutorialDone ? 1 : 0

/**
 * Retire an unfinished tutorial for good?
 *
 * Only once its stage is over AND the player has dropped something at least
 * once. A player who never dropped anything has not learned the one gesture
 * the board runs on, and meets the drop beat again next run.
 */
export const shouldRetireCoachMarks = (s: {
  tutorialDone: boolean
  dropLearned: boolean
  wave: number
}): boolean => !s.tutorialDone && s.dropLearned && s.wave > COACH_MARK_LAST_WAVE

/**
 * Has this board shown the merge ladder and the power demo?
 *
 * A save with the tutorial done and NO flag at all finished the full sequence
 * before the flag existed, and so saw both cards. An early retirement writes an
 * explicit `false`, which is how the two are told apart.
 */
export const mergeLessonSeenFromSave = (saved: boolean | null, tutorialDone: boolean): boolean =>
  saved === true || (saved === null && tutorialDone)

/**
 * Open the merge lesson on this change of the tower's weld depth?
 *
 * The depth — the sum of (tier − 1) over the tower — rises by one per weld.
 * Only a rise that follows the player's own drop counts: a resumed or revived
 * run arrives with its welds standing, and a collapse can settle twins
 * together, and neither is the moment to explain what the player just did.
 * Mid-sequence the coach marks play the cards themselves.
 */
export const shouldOpenMergeLesson = (s: {
  depthNow: number
  depthBefore: number
  seen: boolean
  msSinceDrop: number
  cardUp: boolean
  step: TutorialStep | null
}): boolean => {
  if (s.depthNow <= s.depthBefore || s.seen || s.cardUp) return false
  if (s.msSinceDrop > WELD_AFTER_DROP_MS) return false
  return s.step !== 'merge' && s.step !== 'mergeGuide' && s.step !== 'mergePower'
}

/**
 * Tray taps with no board touch between them before the drop is SHOWN again.
 *
 * The arm-then-tap gesture has no feedback of its own: an armed card looks the
 * same whether the player understood where the next tap goes or not. In the
 * 2026-09-11 rerun P10 tapped the lit card three times, then spent about
 * seventy seconds tapping tray cards before it tried a column at 83 s.
 *
 * Three, because one tap to change your mind about which piece to hold is an
 * ordinary thing to do and must not be answered with a lesson — and because
 * three is the count that playtest actually produced.
 */
export const TRAY_TAPS_BEFORE_LESSON = 3

/**
 * Replay the drop lesson now?
 *
 * `taps` counts tray taps — arming, disarming, switching — since the player
 * last touched the board. The coach marks own the screen while they are up, so
 * their own demo is never competed with.
 */
export const shouldReplayDropLesson = (s: {
  taps: number
  armed: boolean
  step: TutorialStep | null
}): boolean => s.armed && s.step === null && s.taps >= TRAY_TAPS_BEFORE_LESSON

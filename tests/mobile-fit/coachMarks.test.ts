import { describe, expect, it } from 'vitest'
import {
  COACH_MARK_LAST_WAVE, TRAY_TAPS_BEFORE_LESSON, WELD_AFTER_DROP_MS, firstBeatIndex,
  mergeLessonSeenFromSave, shouldOpenMergeLesson, shouldReplayDropLesson, shouldRetireCoachMarks
} from '@/mobile-fit/coachMarks'
import type { TutorialStep } from '@/components/game/TutorialOverlay.vue'

/**
 * ─── The phone coach marks retire, and the merge lesson has its own door ────
 *
 * The 2026-09-11 blind playtest: five phone players, none finished the drop
 * beat, and all of them met the dimmed screen again on every new run and every
 * reload — the tutorial only recorded itself done after all four beats in one
 * sitting. These pin the rules that replaced that.
 */

describe('where the coach marks start', () => {
  it('starts at the drop beat for a player who has never dropped', () => {
    expect(firstBeatIndex(false, false)).toBe(0)
  })

  it('skips the drop beat once the drop has been learned', () => {
    expect(firstBeatIndex(true, false)).toBe(1)
  })

  it('does not care where a finished tutorial would start', () => {
    expect(firstBeatIndex(true, true)).toBe(0)
  })
})

describe('retiring an unfinished tutorial', () => {
  const past = COACH_MARK_LAST_WAVE + 1

  it('retires once the stage is over and the player has dropped something', () => {
    expect(shouldRetireCoachMarks({ tutorialDone: false, dropLearned: true, wave: past })).toBe(true)
  })

  it('keeps it for a player who never dropped anything', () => {
    expect(shouldRetireCoachMarks({ tutorialDone: false, dropLearned: false, wave: past })).toBe(false)
  })

  it('waits for the stage to end', () => {
    for (let w = 0; w <= COACH_MARK_LAST_WAVE; w++) {
      expect(shouldRetireCoachMarks({ tutorialDone: false, dropLearned: true, wave: w })).toBe(false)
    }
  })

  it('has nothing to do for a finished tutorial', () => {
    expect(shouldRetireCoachMarks({ tutorialDone: true, dropLearned: true, wave: past })).toBe(false)
  })
})

describe('has this board shown the merge cards', () => {
  it('trusts an explicit flag either way', () => {
    expect(mergeLessonSeenFromSave(true, false)).toBe(true)
    expect(mergeLessonSeenFromSave(false, true)).toBe(false)
  })

  it('reads a finished tutorial with no flag as an old save that saw both cards', () => {
    expect(mergeLessonSeenFromSave(null, true)).toBe(true)
  })

  it('reads no tutorial and no flag as not seen', () => {
    expect(mergeLessonSeenFromSave(null, false)).toBe(false)
  })
})

describe('opening the merge lesson on a weld', () => {
  const weld = {
    depthNow: 1, depthBefore: 0, seen: false, msSinceDrop: 900, cardUp: false, step: null
  } as const

  it("opens on the first weld the player's own drop made", () => {
    expect(shouldOpenMergeLesson(weld)).toBe(true)
  })

  it('opens outside the coach marks, whatever beat has retired', () => {
    expect(shouldOpenMergeLesson({ ...weld, step: 'drop' })).toBe(true)
  })

  it('never opens twice', () => {
    expect(shouldOpenMergeLesson({ ...weld, seen: true })).toBe(false)
  })

  it('ignores a tower that got shallower (a welded block was lost)', () => {
    expect(shouldOpenMergeLesson({ ...weld, depthNow: 0, depthBefore: 1 })).toBe(false)
  })

  it('ignores welds that no drop of the player made (resume, revive, collapse)', () => {
    expect(shouldOpenMergeLesson({ ...weld, msSinceDrop: WELD_AFTER_DROP_MS + 1 })).toBe(false)
    expect(shouldOpenMergeLesson({ ...weld, msSinceDrop: Infinity })).toBe(false)
  })

  it('does not stack over a card that is already up', () => {
    expect(shouldOpenMergeLesson({ ...weld, cardUp: true })).toBe(false)
  })

  it.each(['merge', 'mergeGuide', 'mergePower'] as const)(
    'leaves it to the sequence during the %s beat', (step) => {
      expect(shouldOpenMergeLesson({ ...weld, step })).toBe(false)
    }
  )
})

/**
 * ─── The drop, shown again on demand ────────────────────────────────────────
 *
 * Arm-then-tap has no feedback of its own, and the 2026-09-11 rerun's P10
 * tapped the tray three times and then spent about seventy seconds there
 * before trying a column. The lesson replays after three tray taps with no
 * board touch between them — and NOT after one, because changing your mind
 * about which piece to hold is an ordinary thing to do.
 */
describe('replaying the drop lesson', () => {
  const at = (taps: number, over: Partial<{ armed: boolean; step: TutorialStep | null }> = {}) =>
    shouldReplayDropLesson({ taps, armed: true, step: null, ...over })

  it('says nothing for one or two taps', () => {
    expect(at(1)).toBe(false)
    expect(at(2)).toBe(false)
  })

  it('shows the drop on the third unanswered tap, and after it', () => {
    expect(at(TRAY_TAPS_BEFORE_LESSON)).toBe(true)
    expect(at(TRAY_TAPS_BEFORE_LESSON + 2)).toBe(true)
  })

  it('stays quiet with nothing in hand', () => {
    expect(at(5, { armed: false })).toBe(false)
  })

  it('never competes with the coach marks, which play the same demo', () => {
    expect(at(5, { step: 'drop' })).toBe(false)
    expect(at(5, { step: 'merge' })).toBe(false)
  })
})

/**
 * ─── What the coach marks are allowed to stop ───────────────────────────────
 *
 * The 2026-09-15 fix gave this board's beats a hold, because the sequence was
 * being taken away mid-lesson by a wave clock the player does not control:
 * seven beats against four- and six-second build windows and a stage that
 * expires for good at wave 3.
 *
 * What it holds is the COUNTDOWN. It must not hold the board, and that is not a
 * preference — a drop spawns a FALLING block that needs stepped frames to land,
 * settle and fuse, and the `merge` beat waits on that fusion. A board frozen for
 * the beats would leave the piece in the air and the beat waiting on a merge
 * that can never happen.
 */
describe('the coach marks hold the countdown, not the board', () => {
  const TICK = 1000 / 60

  const load = async (scripted = false) => {
    const { vi } = await import('vitest')
    vi.resetModules()
    localStorage.clear()
    const game = await import('@/use/useTowerGame')
    const { DROPMERGE_RULES } = await import('@/mobile-fit/rules')
    game.applyRules(DROPMERGE_RULES)
    game.startRun()
    if (scripted) game.seedScriptedOpening()
    return game
  }

  it('lets a dropped piece land while the hold is up', async () => {
    const game = await load()
    // Exactly the state a coach mark puts the board in.
    game.buildClockHeld.value = true
    game.wood.value = 20_000
    game.offers.value = ['b_wood', 'b_wood', 'b_wood']
    const topBefore = game.columnTop(-2)
    expect(game.dropOffer(0, -2)).toBe(true)
    // In the air, and the board has to be stepped to bring it down.
    expect(game.getDebris()).toHaveLength(1)

    for (let i = 0; i < 400 && game.getDebris().length > 0; i++) game.step(TICK)
    // Out of the air and standing on the column — which is the whole point: a
    // held board would have left it hanging there for ever.
    expect(game.getDebris()).toHaveLength(0)
    expect(game.columnTop(-2)).toBeGreaterThan(topBefore)
  })

  it('still stops the build window from expiring under the lesson', async () => {
    const game = await load(true)
    // Get to a build phase: this board calls wave 1 for itself.
    for (let i = 0; i < 20_000 && game.phase.value !== 'build'; i++) game.step(TICK)
    if (game.phase.value !== 'build') return
    game.buildClockHeld.value = true
    const left = game.buildTimeLeft.value
    // Far longer than the four-second opening window the beats were losing to.
    for (let i = 0; i < 1_800; i++) game.step(TICK)
    expect(game.phase.value).toBe('build')
    expect(game.buildTimeLeft.value).toBe(left)
  })

  it('is wired that way in the scene, not to the simulation gate', async () => {
    const source = await import('node:fs').then((fs) =>
      fs.readFileSync('src/mobile-fit/GameSceneDrop.vue', 'utf8'))
    expect(source).toContain('watch(coachHold, (held) => { buildClockHeld.value = held }')
    // The loop's `step` gate stays on the beats that genuinely own the screen.
    expect(source).toContain('&& !showMergePower.value && !handLessonHold.value')
  })
})

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TutorialOverlay, { type TutorialStep } from '@/components/game/TutorialOverlay.vue'

/**
 * ─── The coach marks are wordless, and there is no way out of them ──────────
 *
 * The first-run tutorial teaches by leaving exactly one thing on screen live:
 * a hole in a dim layer, with a fat arrow on it. Three properties carry that,
 * and each of them is one careless "just add a Skip button" away from being
 * lost — which is what the previous tutorial shipped, and it let a player leave
 * without ever placing a block.
 *
 *   1. NO COPY. Not one character. The audience is children on a game portal,
 *      and reading is where they leave; it is also what keeps the tutorial out
 *      of the 21 locale files entirely.
 *   2. NO CONTROLS. A Next or a Skip is a way to finish the tutorial without
 *      performing it, and every beat exists to be performed.
 *   3. NO HOLE, NO OVERLAY. With nothing measurable to point at, the dim layer
 *      would be a full-screen modal over a game that has no dismiss button —
 *      the one failure mode that could strand a player permanently.
 */

const RECT = { x: 200, y: 300, w: 80, h: 60 }
const STEPS: TutorialStep[] = ['pick', 'place', 'inspectMerged', 'rankUp', 'call', 'drop', 'merge']

/** The pictogram beat hands the screen to `MergeGuide` and has nothing to point
 *  at, so rule 3 above applies to it in the strongest form: it must render
 *  nothing here even when the scene happens to be holding a stale rect. */
const CARD_STEPS: TutorialStep[] = ['mergeGuide']

const overlay = (step: TutorialStep | null, target: typeof RECT | null) =>
  mount(TutorialOverlay, { props: { step, target } })

describe('tutorial overlay', () => {
  it.each(STEPS)('%s renders no readable text', (step) => {
    const w = overlay(step, RECT)
    expect(w.text().trim()).toBe('')
    w.unmount()
  })

  it.each(STEPS)('%s offers nothing to press', (step) => {
    const w = overlay(step, RECT)
    expect(w.findAll('button')).toHaveLength(0)
    expect(w.findAll('a')).toHaveLength(0)
    w.unmount()
  })

  it('points at the target with an arrow', () => {
    const w = overlay('pick', RECT)
    expect(w.find('.tutorial__arrow').exists()).toBe(true)
    expect(w.find('.tutorial__ring').exists()).toBe(true)
    w.unmount()
  })

  it('cuts a real hole: the dim is four rects, never one over everything', () => {
    const w = overlay('place', RECT)
    expect(w.findAll('.tutorial__dim')).toHaveLength(4)
    w.unmount()
  })

  it('renders nothing at all when there is no target to point at', () => {
    const w = overlay('call', null)
    expect(w.find('.tutorial').exists()).toBe(false)
    expect(w.findAll('.tutorial__dim')).toHaveLength(0)
    w.unmount()
  })

  it.each(CARD_STEPS)('%s hands the screen to its own card and draws nothing', (step) => {
    const w = overlay(step, RECT)
    expect(w.find('.tutorial').exists()).toBe(false)
    w.unmount()
  })

  it('renders nothing when no step is live', () => {
    const w = overlay(null, RECT)
    expect(w.find('.tutorial').exists()).toBe(false)
    w.unmount()
  })
})

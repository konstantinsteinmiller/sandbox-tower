import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TutorialOverlay, { type TutorialStep } from '@/components/game/TutorialOverlay.vue'
import { dimAround, type DimBox } from '@/components/game/dimRects'

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

/** The pictogram beat hands the screen to `MergeGuide`, and the power demo to
 *  `MergePowerDemo`; neither has anything to point at, so rule 3 above applies
 *  to them in the strongest form: they must render nothing here even when the
 *  scene happens to be holding a stale rect. */
const CARD_STEPS: TutorialStep[] = ['mergeGuide', 'mergePower']

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

/**
 * ─── The phone's drop beats open a second window: the armed card ────────────
 *
 * With only the column live, the card under the dim was dead — and pressing it
 * was the first thing every phone player in the 2026-09-11 blind playtest did.
 * The second window keeps the lesson's rules (wordless, no controls, nothing
 * else live) and adds exactly one more live pixel region.
 */
describe('tutorial overlay with a passage', () => {
  const CARD = { x: 150, y: 700, w: 60, h: 70 }
  const withPassage = (step: TutorialStep) =>
    mount(TutorialOverlay, { props: { step, target: RECT, passage: CARD } })

  it.each(['drop', 'merge'] as const)('%s stays wordless and controlless', (step) => {
    const w = withPassage(step)
    expect(w.text().trim()).toBe('')
    expect(w.findAll('button')).toHaveLength(0)
    w.unmount()
  })

  it('rings the card as well as the column, and arrows only the column', () => {
    const w = withPassage('drop')
    expect(w.findAll('.tutorial__ring')).toHaveLength(2)
    expect(w.find('.tutorial__ring.is-passage').exists()).toBe(true)
    expect(w.findAll('.tutorial__arrow')).toHaveLength(1)
    w.unmount()
  })

  it('leaves no dim over either window', () => {
    const w = withPassage('drop')
    const dims = w.findAll('.tutorial__dim')
    expect(dims.length).toBeGreaterThan(4)
    const inside = (b: DimBox, px: number, py: number) =>
      px > b.x && px < b.x + b.w && py > b.y && py < b.y + b.h
    for (const d of dims) {
      const s = (d.element as HTMLElement).style
      const box = {
        x: Number.parseFloat(s.left), y: Number.parseFloat(s.top),
        w: Number.parseFloat(s.width), h: Number.parseFloat(s.height)
      }
      // The centres of both windows are never under a dim rect.
      expect(inside(box, RECT.x + RECT.w / 2, RECT.y + RECT.h / 2)).toBe(false)
      expect(inside(box, CARD.x + CARD.w / 2, CARD.y + CARD.h / 2)).toBe(false)
    }
    w.unmount()
  })

  it('ignores a passage when there is no hole to go with it', () => {
    const w = mount(TutorialOverlay, { props: { step: 'drop', target: null, passage: CARD } })
    expect(w.find('.tutorial').exists()).toBe(false)
    w.unmount()
  })
})

describe('the dim around several holes', () => {
  const VW = 400
  const VH = 800
  const area = (bs: DimBox[]) => bs.reduce((a, b) => a + b.w * b.h, 0)

  it('is the whole screen when there is no hole', () => {
    expect(area(dimAround([], VW, VH))).toBe(VW * VH)
  })

  it('covers exactly what the holes leave, with no overlap', () => {
    const holes = [{ x: 50, y: 100, w: 60, h: 400 }, { x: 200, y: 650, w: 80, h: 90 }]
    const dims = dimAround(holes, VW, VH)
    expect(area(dims)).toBe(VW * VH - area(holes))
    // No dim rect intersects a hole.
    for (const d of dims) {
      for (const h of holes) {
        const overlapW = Math.min(d.x + d.w, h.x + h.w) - Math.max(d.x, h.x)
        const overlapH = Math.min(d.y + d.h, h.y + h.h) - Math.max(d.y, h.y)
        expect(overlapW > 0 && overlapH > 0).toBe(false)
      }
    }
  })

  it('merges overlapping holes and clips ones hanging off the screen', () => {
    const holes = [{ x: -20, y: 100, w: 100, h: 100 }, { x: 50, y: 150, w: 100, h: 100 }]
    const covered = 80 * 100 + 100 * 100 - 30 * 50 // the union, clipped at x = 0
    expect(area(dimAround(holes, VW, VH))).toBe(VW * VH - covered)
  })
})

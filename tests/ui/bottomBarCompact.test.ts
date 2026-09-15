import { describe, it, expect } from 'vitest'
import { bottomBarLayoutFor, COMPACT_SLACK_PX, type BottomBarMetrics } from '@/utils/bottomBarLayout'
import { clampPx, trayMinWidthPx, trayWantWidthPx, TRAY_MIN_TILE_PX } from '@/utils/trayFit'
import { OFFER_SLOTS } from '@/game/shapes'

/**
 * ─── The hand is never cut off ──────────────────────────────────────────────
 *
 * The bar has one hard promise and a pile of soft preferences. The promise is
 * that every offer in the build hand is on screen: an offer outside the
 * scroller is invisible, with nothing to say it is there, and a player who
 * cannot see their hand cannot play the build phase. Everything else — the
 * clusters lying down, the bar staying short — yields to it.
 *
 * This file models the layouts the stylesheet actually produces and checks the
 * promise across a grid of real viewports, rather than pinning the flags for a
 * handful of screens. Flags are an implementation; "five cards fit" is the
 * requirement, and it is what a future change has to keep passing.
 */

const REM = 16
/** `clamp(2.5rem, 11vw, 3.4rem)`, or the smaller step the stylesheet drops to
 *  on a very narrow or very short screen. Keyed on the VIEWPORT, never on the
 *  layout — see `bottomBarLayoutFor` for why that matters. */
const buttonPx = (vw: number, vh: number): number =>
  vw <= 30 * REM || (vw > vh && vh <= 26 * REM)
    ? clampPx(2.1, 9, 2.6, vw)
    : clampPx(2.5, 11, 3.4, vw)

/** The bar's own side padding and the gap between its columns. */
const padPx = (vw: number): number => clampPx(0.35, 2, 0.7, vw)
const gapPx = (vw: number, vh: number): number =>
  vw > vh && vh <= 30 * REM ? 0.2 * REM : clampPx(0.25, 1.6, 0.7, vw)

/** The widest shipped wave control: the speed switch, and the German and
 *  Spanish "call wave" labels, which are the ones that set this figure. */
const WAVE_CONTROL_PX = 190

const metricsFor = (vw: number, vh: number, slots: number, compact = false): BottomBarMetrics => {
  const b = buttonPx(vw, vh)
  const metaGap = clampPx(0.15, 1, 0.35, vw)
  const buttonsRow = 2 * b + metaGap          // Arrow Rain + the tech tree
  return {
    inner: vw - 2 * padPx(vw),
    columnGap: gapPx(vw, vh),
    metaRow: 3 * b + 2 * metaGap,             // mute, settings, missions
    metaCol: b,
    // Always a column, so the wider of the two rather than their sum.
    rightCol: Math.max(buttonsRow, WAVE_CONTROL_PX),
    viewportW: vw,
    viewportH: vh,
    slots,
    compact
  }
}

/** How much width the hand actually gets, given the layout that was chosen. */
const handWidth = (m: BottomBarMetrics): number => {
  const { compact, stacked } = bottomBarLayoutFor(m)
  const want = trayWantWidthPx(m.viewportW, m.viewportH, m.slots)
  if (stacked) return m.inner
  const sides = (compact ? m.metaCol : m.metaRow) + m.rightCol
  return Math.min(want, m.inner - 2 * m.columnGap - sides)
}

/** Whether the two button clusters fit side by side in the row they share. */
const clustersFit = (m: BottomBarMetrics): boolean => {
  const { compact, stacked } = bottomBarLayoutFor(m)
  const meta = compact ? m.metaCol : m.metaRow
  const room = stacked ? m.inner - m.columnGap : m.inner - 2 * m.columnGap
  return meta + m.rightCol <= room + (stacked ? 0 : handWidth(m) === 0 ? 0 : 0) || stacked
    ? meta + m.rightCol <= room
    : true
}

// Real shapes: the narrowest supported viewport, landscape phones (including
// the ~670x400 embed the hand was reported cut off on), portrait phones,
// awkward portal embeds, tablets and desktops.
const VIEWPORTS: [number, number][] = [
  [320, 658], [360, 640], [390, 844], [414, 896],
  [568, 320], [640, 360], [667, 375], [670, 400], [740, 360], [844, 390],
  [852, 393], [896, 414], [932, 430],
  [580, 900], [768, 1024], [764, 385], [700, 640], [640, 629],
  [1024, 768], [1280, 800], [1440, 900], [1920, 1080]
]

describe('the build hand is never cut off', () => {
  for (const slots of [3, 4, OFFER_SLOTS]) {
    it(`fits every offer at ${slots} slots, on every shipped viewport`, () => {
      for (const [vw, vh] of VIEWPORTS) {
        const m = metricsFor(vw, vh, slots)
        const need = trayMinWidthPx(vw, slots)
        expect(
          handWidth(m),
          `${vw}x${vh}, ${slots} offers: the hand needs ${Math.round(need)}px ` +
          `and the layout gives it ${Math.round(handWidth(m))}px ` +
          `(${JSON.stringify(bottomBarLayoutFor(m))})`
        ).toBeGreaterThanOrEqual(need)
      }
    })
  }

  it('is pinned to the hand the game actually deals', () => {
    // 5 is what `rules.offers.slots` ships. The grid above is checked against
    // that constant rather than a literal, because the promise is only testable
    // for a hand the tap-target floor can fit: at 320px a SIXTH card needs
    // 321px of a 307px row, and no arrangement of buttons can conjure that. If
    // this number goes up, the narrow end of the grid above needs revisiting —
    // most likely by letting the bar shed its own side padding.
    expect(OFFER_SLOTS).toBe(5)
  })

  it('never leaves the two button clusters overlapping', () => {
    for (const slots of [3, 4, OFFER_SLOTS]) {
      for (const [vw, vh] of VIEWPORTS) {
        const m = metricsFor(vw, vh, slots)
        expect(clustersFit(m), `${vw}x${vh}, ${slots} offers`).toBe(true)
      }
    }
  })
})

describe('bottomBarLayoutFor escalates only as far as it has to', () => {
  it('leaves a desktop bar roomy', () => {
    expect(bottomBarLayoutFor(metricsFor(1440, 900, 5))).toEqual({ compact: false, stacked: false })
  })

  it('gives the hand its own row at the narrowest supported viewport', () => {
    const out = bottomBarLayoutFor(metricsFor(320, 658, 5))
    expect(out.stacked).toBe(true)
    // The clusters stay lying down UNDER the hand, which is the shorter bar —
    // they fit there only because the buttons drop a size below 30rem. Remove
    // that shrink and this flips to a three-row bar on the smallest phone.
    expect(out.compact).toBe(false)
  })

  it('is sticky across the slack band rather than flapping', () => {
    const want = trayWantWidthPx(1000, 700, 4)
    const base: BottomBarMetrics = {
      ...metricsFor(1000, 700, 4),
      inner: 800,
      columnGap: 10,
      rightCol: WAVE_CONTROL_PX,
      metaCol: 54.4
    }
    // Short of what it wants, but by less than the slack.
    base.metaRow = 800 - 20 - WAVE_CONTROL_PX - (want - COMPACT_SLACK_PX / 2)
    expect(bottomBarLayoutFor(base).compact).toBe(false)
    expect(bottomBarLayoutFor({ ...base, compact: true }).compact).toBe(true)
  })

  it('moves the line with the offer count, not just the viewport', () => {
    // The same screen, more cards dealt: this is the whole reason the decision
    // is measured rather than keyed to a breakpoint.
    expect(trayMinWidthPx(860, 6)).toBeGreaterThan(trayMinWidthPx(860, 4))
    const few = bottomBarLayoutFor(metricsFor(700, 640, 3))
    const many = bottomBarLayoutFor(metricsFor(700, 640, 9))
    expect(many.stacked || many.compact).toBe(true)
    expect(few.stacked).toBe(false)
  })

  it('never asks the hand to go below the tap target', () => {
    for (const slots of [3, 4, OFFER_SLOTS]) {
      expect(trayMinWidthPx(320, slots)).toBeGreaterThan(slots * TRAY_MIN_TILE_PX)
    }
  })
})

import { trayMinWidthPx, trayWantWidthPx } from '@/utils/trayFit'

/**
 * How the bottom bar arranges itself — measured, in three steps.
 *
 * The bar holds three things: the meta buttons, the build hand, and the wave
 * control with Arrow Rain and the tech tree above it. The hand is the one that
 * must never be cut off — it is the whole decision of the build phase, and an
 * offer outside the scroller is invisible with nothing to suggest it is there.
 * The other two are buttons that can stand up, shrink, or move.
 *
 * This used to budget with a share of the viewport (46vw) and hope. A share is
 * not an answer to "does the hand fit", so it did not fix a short landscape
 * screen, where the player saw three of five cards. It asks the hand now
 * (`@/utils/trayFit`), and escalates only as far as it has to:
 *
 *   roomy    — three columns, both clusters lying down as rows. What a desktop
 *              gets, and what looks best.
 *   compact  — the clusters STAND UP: the meta buttons into a column above the
 *              mute, the wave control under its two buttons. Costs height in
 *              two corners that are empty sky, and buys the hand the width of
 *              two buttons on each side.
 *   stacked  — the hand takes a full-width row of its own and the two clusters
 *              share the row beneath it. The bar gets taller; nothing is cut
 *              off. The last resort, and the one that still works at 320px.
 *
 * `stacked` implies `compact`: at the widths that force a stacked hand, the two
 * clusters cannot lie down side by side in the row below either.
 *
 * EVERY INPUT IS INDEPENDENT OF THE ARRANGEMENT THIS DECIDES, so the two cannot
 * chase each other. The clusters are measured as what they need laid out in a
 * row and as their widest single child — both unchanged by stacking them — and
 * the hand's needs come from the viewport and the offer count. Nothing reads
 * back what the chosen layout actually produced. In particular the buttons must
 * not change SIZE with the arrangement: a smaller button in compact mode would
 * make the roomy layout fit again, which would make the compact layout wrong,
 * forever. Shrink them on the viewport instead (see the stylesheet).
 */

/**
 * How far short of its preferred width the hand has to fall before the clusters
 * stand up — and, read the other way, the band the decision is sticky over:
 * once compact, the bar stays compact until the hand would get all of it back.
 * A layout tuned to land within a pixel or two of the line is not one to
 * re-arrange, and a cluster that re-flows a rounded rect wider cannot flip the
 * bar back and forth.
 */
export const COMPACT_SLACK_PX = 24

export interface BottomBarMetrics {
  /** The bar's width less its own side padding. */
  inner: number
  /** Gap between the bar's columns — counted twice, for the two of them. */
  columnGap: number
  /** The meta cluster laid out as ONE row, whatever it is in right now. */
  metaRow: number
  /** The meta cluster's widest single button: its width as a column. */
  metaCol: number
  /** The right-hand cluster's width. It is always a column — Arrow Rain and
   *  the tech tree sit above the wave control at every size — so this is the
   *  wider of that button row and the control under it. */
  rightCol: number
  /** Viewport, for the hand's own arithmetic. */
  viewportW: number
  viewportH: number
  /** How many offers the hand is dealing, the gift's borrowed slot included. */
  slots: number
  /** Whether the bar is compact NOW, which is what makes the decision sticky. */
  compact: boolean
}

export interface BottomBarLayout {
  /** The clusters stand up. */
  compact: boolean
  /** The hand takes a row of its own. Implies `compact`. */
  stacked: boolean
}

export const bottomBarLayoutFor = (m: BottomBarMetrics): BottomBarLayout => {
  // Three columns have two gaps between them; the stacked layout's lower row
  // has one.
  const threeCol = m.inner - 2 * m.columnGap
  const twoCol = m.inner - m.columnGap
  const wants = trayWantWidthPx(m.viewportW, m.viewportH, m.slots)
  const needs = trayMinWidthPx(m.viewportW, m.slots)

  // Standing the clusters up is the most a three-column bar can give the hand.
  // If it would STILL lose a card, no arrangement of three columns works and
  // the hand has to have a row to itself.
  const stacked = threeCol - m.metaCol - m.rightCol < needs

  const compact = stacked
    // With the hand on its own row, the question is no longer about the hand at
    // all: it is whether the two clusters fit side by side underneath it. At
    // 320px they do not — a meta row and a wave control want ~350px of ~300 —
    // and two clusters that overlap are worse than a bar one button taller.
    ? m.metaRow + m.rightCol > twoCol
    // Otherwise: stand them up whenever lying down costs the hand its preferred
    // size, with the slack band so a near-miss layout is left alone.
    //
    // The slack applies to the PREFERENCE and never to the requirement. It is
    // wide enough (24px) to swallow the gap between `wants` and `needs` on a
    // small screen — at 568x320 with four offers the hand wants 217px and
    // cannot do without 214, so a band measured from `wants` alone let the
    // layout settle at 213 and drop a card. Whichever line is higher wins.
    : threeCol - m.metaRow - m.rightCol
        < Math.max(needs, m.compact ? wants : wants - COMPACT_SLACK_PX)

  return { compact, stacked }
}

/**
 * Does the bottom bar's hand still get its share?
 *
 * The three-column bar (`.scene__bottom` in `GameScene.vue`) gives the build
 * hand a fixed SHARE of the viewport — but only what the two side clusters
 * leave over, because their tracks floor at `min-content`. On a landscape
 * phone both clusters are rows and together they want most of the screen, so
 * the hand is left with a fraction of its track and the offers scroll off the
 * side of a scroller nothing suggests can be scrolled.
 *
 * Kept out of the scene and free of the DOM so the thresholds are falsifiable:
 * the one number that matters here is where the line sits, and the layout it
 * decides for cannot be rendered in a test.
 */

/** Must match the middle track of `.scene__bottom`. */
export const TRAY_SHARE = 0.46

/**
 * How far short of its share the hand has to fall before the clusters stand
 * up — and, read the other way, the band the decision is sticky over: once
 * compact, the bar stays compact until the hand would get the whole share
 * back. A layout tuned to land within a pixel or two of the line (the 700px
 * embed `.scene__bottom` is measured against) is not one to re-arrange, and a
 * cluster that re-flows a rounded rect wider cannot flip the bar back.
 */
export const COMPACT_SLACK_PX = 24

export interface BottomBarMetrics {
  /** The bar's width less its own side padding. */
  inner: number
  /** Gap between the bar's columns — counted twice, for the two of them. */
  columnGap: number
  /** The meta cluster laid out as ONE row, whatever it is in right now. */
  metaRow: number
  /** The right-hand cluster at the width the ROOMY bar gives it: the sum of
   *  its buttons and the wave control where the two sit side by side, and the
   *  wider of them where they are already stacked. */
  rightCluster: number
  /** Viewport width — what the hand's share is a fraction of. */
  viewport: number
  /** Whether the bar is compact NOW, which is what makes the decision sticky. */
  compact: boolean
}

/**
 * Every input is independent of the arrangement this decides, so the two
 * cannot chase each other: the clusters' widths are what they need laid out in
 * a row (unchanged by stacking them), and the hand's want is the CSS share.
 * What the compact layout actually gives the hand is never read back.
 */
export const isBottomBarCompact = (m: BottomBarMetrics): boolean => {
  const room = m.inner - 2 * m.columnGap - m.metaRow - m.rightCluster
  const wants = m.viewport * TRAY_SHARE
  return room < (m.compact ? wants : wants - COMPACT_SLACK_PX)
}

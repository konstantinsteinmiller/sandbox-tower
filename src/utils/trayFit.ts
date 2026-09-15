/**
 * How much width the build hand needs, and how big its tiles come out.
 *
 * This arithmetic used to live only inside `BuildTray`, which could answer
 * "how big are my tiles in the width I was given" but never "is the width I
 * was given enough" — and the bottom bar, which decides how much width to give
 * it, had no way to ask. So the bar guessed with a share of the viewport
 * (46vw), the hand quietly scrolled whatever did not fit, and a player on a
 * short landscape screen saw three of five offers with nothing to suggest the
 * rest existed. Reported from play twice.
 *
 * Both sides read it from here now, so "the hand fits" means the same thing to
 * the component that lays the tiles out and to the bar that budgets for them.
 *
 * Pure and viewport-arithmetic only: the CSS `clamp()`s below are mirrors of
 * the stylesheet, and nothing here touches the DOM.
 */

/**
 * The smallest a tile may be drawn.
 *
 * 44px is the tap-target minimum. Below it the tile stops being reliably
 * hittable, so this is a floor the layout has to work around rather than a
 * number to shave when space runs short — if the hand cannot fit at 44 the
 * answer is to give it a row of its own, not smaller tiles.
 */
export const TRAY_MIN_TILE_PX = 44

/** One CSS `clamp(<min>rem, <n>vw, <max>rem)` in px, at viewport width `w`.
 *  Assumes a 16px root, which is the browser default and what this app ships. */
export const clampPx = (minRem: number, vw: number, maxRem: number, w: number): number =>
  Math.min(maxRem * 16, Math.max(minRem * 16, (vw / 100) * w))

/**
 * Every pixel of the tray that is NOT thumbnail, for `slots` tiles: the
 * scroller's border and padding, the gaps between slots, and each tile body's
 * own border and padding. Mirrors the stylesheet in `BuildTray.vue`.
 */
export const trayChromePx = (viewportW: number, slots: number): number =>
  4                                                              // scroller border
  + 2 * clampPx(0.12, 0.7, 0.28, viewportW)                      // scroller padding
  + Math.max(0, slots - 1) * clampPx(0.12, 0.8, 0.28, viewportW) // gaps
  + slots * (4 + 2 * clampPx(0.04, 0.3, 0.1, viewportW))         // per-tile border + padding

/**
 * The biggest tile the VIEWPORT will carry, whatever width the hand is given.
 *
 * The height term is what lets the tray live in the bottom bar on a landscape
 * phone: there the short axis is the scarce one, and a hand sized off the width
 * alone would eat a third of it.
 */
export const trayTileCapPx = (viewportW: number, viewportH: number): number =>
  Math.min(72, viewportW * 0.135, viewportH * 0.14)

/** Total width the hand occupies with `slots` tiles of `tilePx`. */
export const trayWidthPx = (viewportW: number, slots: number, tilePx: number): number =>
  trayChromePx(viewportW, slots) + slots * tilePx

/**
 * The narrowest the hand can be without hiding an offer — every tile at the tap
 * floor. A track narrower than this WILL cut a card off, whatever else is true.
 */
export const trayMinWidthPx = (viewportW: number, slots: number): number =>
  trayWidthPx(viewportW, slots, TRAY_MIN_TILE_PX)

/** The width the hand would like: every tile at the viewport's cap. */
export const trayWantWidthPx = (viewportW: number, viewportH: number, slots: number): number =>
  trayWidthPx(viewportW, slots, trayTileCapPx(viewportW, viewportH))

/** Tile edge for a hand that has been given `trackPx`, floored at the tap
 *  target and capped by the viewport. */
export const trayTilePx = (
  trackPx: number, viewportW: number, viewportH: number, slots: number
): number => {
  const cap = trayTileCapPx(viewportW, viewportH)
  const n = Math.max(1, slots)
  if (trackPx <= 0) return Math.round(Math.max(TRAY_MIN_TILE_PX, cap))
  const perSlot = (trackPx - trayChromePx(viewportW, n)) / n
  return Math.round(Math.max(TRAY_MIN_TILE_PX, Math.min(cap, perSlot)))
}

import { describe, it, expect } from 'vitest'
import { isBottomBarCompact, TRAY_SHARE } from '@/utils/bottomBarLayout'

/**
 * Where the bottom bar stands its side clusters up.
 *
 * The figures are the ones the stylesheet is tuned against: a 3.4rem HUD
 * button, the gaps `.scene__bottom` and `.scene__right` clamp to, and the two
 * viewports the layout has been measured on — the 700px portal embed
 * `.scene__bottom`'s column comment is written for, which must stay ROOMY, and
 * a landscape phone, where the hand is left with a fraction of its share.
 */
const BUTTON = 54.4          // clamp(2.5rem, 11vw, 3.4rem), capped
const META_GAP = 5.6         // clamp(0.15rem, 1vw, 0.35rem), capped
const metaRow = (buttons: number): number =>
  buttons * BUTTON + Math.max(0, buttons - 1) * META_GAP

describe('isBottomBarCompact', () => {
  it('leaves the 700px embed alone — its clusters already fit', () => {
    // Measured in `.scene__bottom`: the meta cluster needs 162px there and the
    // wave control 163px at its widest shipped label, which leaves the hand
    // ~331px against a 322px share.
    const roomy = {
      inner: 700 - 2 * 11.2,
      columnGap: 10.2,
      metaRow: 162,
      rightCluster: 163,
      viewport: 700,
      compact: false
    }
    expect(isBottomBarCompact(roomy)).toBe(false)
    // And stays roomy once it is: the sticky half of the band only holds a
    // decision that was already made the other way.
    expect(isBottomBarCompact({ ...roomy, compact: true })).toBe(false)
  })

  it('stands the clusters up on a landscape phone', () => {
    // 860x480: both clusters are rows there, and together they take two thirds
    // of the bar — the hand gets ~260px of the ~396px share.
    const phone = {
      inner: 860 - 2 * 11.2,
      columnGap: 3.2,
      metaRow: metaRow(3),
      // Arrow Rain + tech tree, then the speed switch beside them.
      rightCluster: metaRow(2) + 8 + 175,
      viewport: 860,
      compact: false
    }
    expect(isBottomBarCompact(phone)).toBe(true)
    expect(isBottomBarCompact({ ...phone, compact: true })).toBe(true)
  })

  it('is sticky across the slack band rather than flapping', () => {
    const base = {
      inner: 800,
      columnGap: 10,
      metaRow: 170,
      rightCluster: 165,
      viewport: 1000,
      compact: false
    }
    // room = 800 - 20 - 170 - 165 = 445; the share is 460.
    const room = base.inner - 2 * base.columnGap - base.metaRow - base.rightCluster
    const wants = base.viewport * TRAY_SHARE
    expect(room).toBeLessThan(wants)
    // Short of the share, but not by enough to re-arrange a bar that is not.
    expect(isBottomBarCompact(base)).toBe(false)
    // Already compact, it takes the WHOLE share back to lie down again.
    expect(isBottomBarCompact({ ...base, compact: true })).toBe(true)
    expect(isBottomBarCompact({ ...base, compact: true, rightCluster: 130 })).toBe(false)
  })
})

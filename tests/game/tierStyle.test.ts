import { describe, expect, it } from 'vitest'
import { tierStyle, TIER_RUNGS } from '@/game/tierStyle'

/**
 * ─── Merge tiers are colour-coded ───────────────────────────────────────────
 *
 * Players stopped welding at tier 2: a tier-3 gun looked exactly as special as
 * a tier 2 — one grey plate, one gun — so nothing on the board argued for the
 * next weld. Each tier now has its own colour and a merged weapon is visibly
 * more gun — ONE bigger gun, never copies of it. These pin the parts of that
 * which are rules rather than taste.
 */

describe('tier colours', () => {
  it('gives every tier from 2 to the top of the ladder a colour of its own', () => {
    const hexes = new Set<string>()
    for (let t = 2; t <= TIER_RUNGS; t++) hexes.add(tierStyle(t).hex)
    expect(hexes.size).toBe(TIER_RUNGS - 1)
    expect(TIER_RUNGS).toBeGreaterThanOrEqual(6)
  })

  it('repeats the top colour past the ladder instead of wrapping back to green', () => {
    const top = tierStyle(TIER_RUNGS).hex
    for (const t of [TIER_RUNGS + 1, TIER_RUNGS + 5, 40]) expect(tierStyle(t).hex).toBe(top)
    expect(tierStyle(40).hex).not.toBe(tierStyle(2).hex)
  })

  it('never uses the reinforced gold', () => {
    // Gold means "reinforced" on this battlefield (the rim is rgba(255,206,74)).
    // A plate that could pass for it would make the two unreadable at a glance.
    const gold = [255, 206, 74]
    for (let t = 2; t <= TIER_RUNGS; t++) {
      const [r, g, b] = tierStyle(t).rgb
      const d = Math.hypot(r - gold[0]!, g - gold[1]!, b - gold[2]!)
      expect(d, `tier ${t}`).toBeGreaterThan(60)
    }
  })

  it('agrees with itself: the rgb triplet is the hex', () => {
    for (let t = 1; t <= TIER_RUNGS; t++) {
      const s = tierStyle(t)
      const hex = `#${s.rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`
      expect(hex).toBe(s.hex)
    }
  })
})

/** Where a cannon's muzzle sits, as a fraction of the span it is drawn at
 *  (`drawFixture`: the swell ends at 0.55, the bore at 0.57). */
const MUZZLE_REACH = 0.57

describe('merged weapons', () => {
  it('makes every tier of the tower ladder visibly more gun than the one below it', async () => {
    const { gunSpanForTier } = await import('@/use/useTowerArt')
    const spans = [1, 2, 3, 4, 5, 6].map(gunSpanForTier)
    for (let i = 1; i < spans.length; i++) expect(spans[i]!, `tier ${i + 1}`).toBeGreaterThan(spans[i - 1]!)
    // A tier 2 used to be a tier 1 on a wider block — 1.1 against 1.0 — and
    // only the twin barrel said otherwise. One gun has to say it by size.
    expect(spans[1]! / spans[0]!).toBeGreaterThanOrEqual(1.2)
  })

  it('keeps a wide weld\'s barrel inside the cells it stands on', async () => {
    const { gunSpanForTier } = await import('@/use/useTowerArt')
    // Tier 2 is 2×1 and tier 4 is 4×2: half-widths of one and two cells.
    expect(MUZZLE_REACH * gunSpanForTier(2)).toBeLessThan(1)
    expect(MUZZLE_REACH * gunSpanForTier(4)).toBeLessThan(2)
  })

  it('grows a gun along a weld\'s long side, less along a tall one, and not at all on a square', async () => {
    const { gunGrowthFor } = await import('@/use/useTowerArt')
    expect(gunGrowthFor(1, 1)).toBe(1)
    expect(gunGrowthFor(2, 2)).toBe(1)
    expect(gunGrowthFor(2, 1)).toBeGreaterThan(gunGrowthFor(1, 2))
    expect(gunGrowthFor(1, 2)).toBeGreaterThan(1)
    expect(gunGrowthFor(4, 2)).toBe(gunGrowthFor(2, 1))
  })

  it('grows a one-cell weld a step per tier, and stops before it buries its neighbours', async () => {
    const { fixtureSpanForCellTier } = await import('@/use/useTowerArt')
    const spans = [1, 2, 3, 4, 5, 9].map(fixtureSpanForCellTier)
    expect(spans).toEqual([1, 1.2, 1.28, 1.34, 1.34, 1.34])
    // At the cap a sideways shot spills about a quarter of a cell into the next
    // column — what the old triple battery at 1.3 spilled — and no further.
    expect(MUZZLE_REACH * spans.at(-1)! - 0.5).toBeLessThan(0.27)
  })
})

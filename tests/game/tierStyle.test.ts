import { describe, expect, it } from 'vitest'
import { tierStyle, TIER_RUNGS } from '@/game/tierStyle'

/**
 * ─── Merge tiers are colour-coded ───────────────────────────────────────────
 *
 * Players stopped welding at tier 2: a tier-3 gun looked exactly as special as
 * a tier 2 — one grey plate, one gun — so nothing on the board argued for the
 * next weld. Each tier now has its own colour and a merged weapon is visibly
 * more gun. These pin the parts of that which are rules rather than taste.
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

describe('merged weapons', () => {
  it('fields a twin at tier 2 and a triple battery from tier 3', async () => {
    const { batteryFor } = await import('@/use/useTowerArt')
    for (const gun of ['cannon', 'archer', 'bombard', 'mortar', 'tesla', 'frost']) {
      expect(batteryFor(gun, 1), gun).toHaveLength(1)
      expect(batteryFor(gun, 2), gun).toHaveLength(2)
      expect(batteryFor(gun, 3), gun).toHaveLength(3)
      expect(batteryFor(gun, 7), gun).toHaveLength(3)
      // The front piece is drawn last, at full size — it is still THE gun.
      const copies = batteryFor(gun, 3)
      expect(copies[copies.length - 1]![2]).toBe(1)
    }
  })

  it('leaves blocks that are not guns as one fixture at any tier', async () => {
    const { batteryFor } = await import('@/use/useTowerArt')
    for (const id of ['lumberHut', 'spikes', 'banner']) expect(batteryFor(id, 5)).toHaveLength(1)
  })

  it('grows a one-cell weld a step per tier, and stops before it buries its neighbours', async () => {
    const { fixtureSpanForCellTier } = await import('@/use/useTowerArt')
    const spans = [1, 2, 3, 4, 5, 9].map(fixtureSpanForCellTier)
    expect(spans).toEqual([1, 1.12, 1.22, 1.3, 1.3, 1.3])
  })
})

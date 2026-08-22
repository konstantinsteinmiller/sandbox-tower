import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CRATE_LADDER, SHAPE_BY_ID, SHAPE_DEFS, crateBaseId, shapeCost, upgradeCrateShape
} from '@/game/shapes'
import { BLOCK_DEFS } from '@/game/blocks'

// The simulation is a module-level singleton (project convention), so each test
// re-imports it fresh to get a clean tower. `levels` seeds the tech blob before
// the modules load, which is how a test owns a block the ladder cares about.
const loadGame = async (levels: Record<string, number> = {}) => {
  vi.resetModules()
  localStorage.clear()
  localStorage.setItem('tower_state', JSON.stringify({
    ts_tech: { levels }, ts_coins: 5000
  }))
  return import('@/use/useTowerGame')
}

const WOOD_ONLY = new Set(['wood'])
const WITH_BRACE = new Set(['wood', 'brace'])
const EVERYTHING = new Set(['wood', 'brace', 'spikes'])
const rich = () => true
const broke = () => false

const materialsOf = (id: string): string[] =>
  [...new Set(SHAPE_BY_ID[id]!.cells.map(([, , t]) => t))]

beforeEach(() => {
  localStorage.clear()
})

describe('the crate ladder', () => {
  it('runs cheapest to best, and each rung really is better', () => {
    expect([...CRATE_LADDER]).toEqual(['wood', 'brace', 'spikes'])
    for (let i = 1; i < CRATE_LADDER.length; i++) {
      const lower = BLOCK_DEFS[CRATE_LADDER[i - 1]!]!
      const upper = BLOCK_DEFS[CRATE_LADDER[i]!]!
      expect(upper.hp, CRATE_LADDER[i]).toBeGreaterThan(lower.hp)
      expect(upper.armor ?? 0, CRATE_LADDER[i]).toBeGreaterThanOrEqual(lower.armor ?? 0)
    }
  })

  it('deals the best crate the player has unlocked', () => {
    expect(upgradeCrateShape('wL', WOOD_ONLY, rich)).toBe('wL')
    expect(materialsOf(upgradeCrateShape('wL', WITH_BRACE, rich))).toEqual(['brace'])
    expect(materialsOf(upgradeCrateShape('wL', EVERYTHING, rich))).toEqual(['spikes'])
  })

  it('offers every wood silhouette in every tier, not just three of them', () => {
    // The three hand-authored braced shapes were a domino, an L and a 2x2 —
    // so unlocking the Braced Crate used to turn ten wood shapes into thirteen
    // shapes rather than into ten better ones.
    const woodShapes = SHAPE_DEFS.filter((s) => materialsOf(s.id).join() === 'wood')
    expect(woodShapes.length).toBeGreaterThan(6)
    for (const s of woodShapes) {
      expect(materialsOf(upgradeCrateShape(s.id, EVERYTHING, rich)), s.id).toEqual(['spikes'])
    }
  })

  it('falls back down the ladder to what the player can actually pay for', () => {
    // A spiked crate costs stone that no wood shape ever did. Handing one to a
    // stone-poor player is handing them a wall they cannot place.
    const affordBraceOnly = (id: string): boolean => materialsOf(id).join() !== 'spikes'
    expect(materialsOf(upgradeCrateShape('wO', EVERYTHING, affordBraceOnly))).toEqual(['brace'])
    // Broke entirely: they still get shown the cheapest thing.
    expect(upgradeCrateShape('wO', EVERYTHING, broke)).toBe('wO')
  })

  it('leaves anything that is not a pure crate piece alone', () => {
    for (const s of SHAPE_DEFS) {
      const mats = materialsOf(s.id)
      const pureCrate = mats.every((m) => (CRATE_LADDER as ReadonlyArray<string>).includes(m))
      if (pureCrate) continue
      expect(upgradeCrateShape(s.id, EVERYTHING, rich), s.id).toBe(s.id)
    }
  })

  it('never touches the stone crate — it is the other material, not a deeper rank', () => {
    for (const s of SHAPE_DEFS) {
      if (materialsOf(s.id).join() !== 'stone') continue
      expect(upgradeCrateShape(s.id, EVERYTHING, rich), s.id).toBe(s.id)
    }
  })

  it('keeps the geometry identical and only swaps the material', () => {
    for (const s of SHAPE_DEFS) {
      if (materialsOf(s.id).join() !== 'wood') continue
      for (const tier of ['brace', 'spikes']) {
        const v = SHAPE_BY_ID[`${s.id}~${tier}`]!
        expect(v, `${s.id}~${tier}`).toBeDefined()
        expect(v.cells.map(([x, y]) => `${x},${y}`)).toEqual(s.cells.map(([x, y]) => `${x},${y}`))
        expect(v.roofs ?? []).toEqual(s.roofs ?? [])
        expect(v.lane).toBe(s.lane)
      }
    }
  })

  it('prices each rung as the blocks it is made of', () => {
    const base = shapeCost('w2h')
    const braced = shapeCost('w2h~brace')
    const spiked = shapeCost('w2h~spikes')
    expect(braced.wood).toBeGreaterThan(base.wood)
    // The rung that introduces a second currency — the whole reason the
    // affordability fallback has to exist.
    expect(base.stone).toBe(0)
    expect(braced.stone).toBe(0)
    expect(spiked.stone).toBeGreaterThan(0)
  })

  it('keeps the upgraded variants OUT of the draw pool', () => {
    // They must only ever be projected onto, never rolled: a variant in the hat
    // would put the same silhouette in it three times.
    for (const s of SHAPE_DEFS) expect(s.id.includes('~'), s.id).toBe(false)
    expect(Object.keys(SHAPE_BY_ID).some((id) => id.includes('~'))).toBe(true)
  })

  it('recovers the base geometry from an upgraded id', () => {
    expect(crateBaseId('wL~spikes')).toBe('wL')
    expect(crateBaseId('wL')).toBe('wL')
    expect(crateBaseId('archer1')).toBe('archer1')
  })
})

describe('the ladder in a live hand', () => {
  /**
   * The material of every STRUCTURE-lane crate piece on the table.
   *
   * Lane-filtered on purpose. The Spiked Wall is also an authored SUPPORT piece
   * (`spikes1`, `spikeWall`), and those are not on the ladder in any meaningful
   * sense — they are already its top rung, so they are dealt as themselves and
   * must not fall back to a wood crate when the purse is empty. Counting them
   * here would be measuring the support lane and calling it the wall lane.
   */
  const crateMaterials = (offers: readonly string[]): string[] =>
    offers
      .filter(Boolean)
      .filter((id) => SHAPE_BY_ID[crateBaseId(id)]?.lane === 'structure')
      .map((id) => materialsOf(id).join())
      .filter((m) => (CRATE_LADDER as ReadonlyArray<string>).includes(m))

  it('stops dealing plain wood once the player owns something better', async () => {
    // Rich enough to pay for the top rung, so affordability cannot be what
    // decides the answer here.
    const g = await loadGame({ foundations: 1, unlockBrace: 1, unlockSpikes: 1 })
    g.startRun()
    g.wood.value = 99_999
    g.stone.value = 99_999
    g.runCoins.value = 99_999

    // Deal a lot of hands: the structure lane is random, so one hand proves
    // nothing about what the deck can still produce.
    const seen = new Set<string>()
    for (let i = 0; i < 60; i++) {
      for (let slot = 0; slot < g.offers.value.length; slot++) g.rerollOffer(slot)
      for (const m of crateMaterials(g.offers.value)) seen.add(m)
    }
    expect(seen.size).toBeGreaterThan(0)
    // Not one plain wood or braced crate in sixty hands — they have been
    // outgrown, and the deck no longer offers what the player outgrew.
    expect([...seen]).toEqual(['spikes'])
  })

  it('hands out only placeable pieces when the purse is empty', async () => {
    const g = await loadGame({ foundations: 1, unlockBrace: 1, unlockSpikes: 1 })
    g.startRun()
    // Deliberately destitute. Every crate piece dealt must still be the
    // cheapest tier, not a spiked wall the player has no stone for.
    g.wood.value = 0
    g.stone.value = 0
    g.runCoins.value = 0

    const seen = new Set<string>()
    for (let i = 0; i < 40; i++) {
      for (let slot = 0; slot < g.offers.value.length; slot++) g.rerollOffer(slot)
      for (const m of crateMaterials(g.offers.value)) seen.add(m)
    }
    expect([...seen]).toEqual(['wood'])
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  TECH_NODES, TECH_BY_ID, effectTotal, firstHpNodeId, nextRankGain, sumEffect, techCost
} from '@/game/tech'
import { TECH_NODES_DROPMERGE } from '@/mobile-fit/tech'
import { waveReward } from '@/game/waves'

/**
 * ─── The first upgrade ──────────────────────────────────────────────────────
 *
 * The 2026-09-11 blind playtest had testers buy upgrades, die on the same wave
 * and decide the tree does nothing — +6 % on a wall is a number nobody can see.
 * So the first block-HP rank is front-loaded to +50 %, the game points at it
 * from stage 2 on, and it has to be affordable by the time it does.
 *
 * Pinned here because each piece is one careless rebalance from undoing the
 * others: a price that drifts past the wave-2 purse, a description that goes
 * back to the flat per-rank number, a re-ordered phone strip that padlocks a
 * card a player already paid for.
 */

afterEach(() => {
  localStorage.clear()
  vi.resetModules()
})

const DESK = TECH_BY_ID['foundations']!
const PHONE = TECH_NODES_DROPMERGE.find((n) => n.id === 'm2_foundations')!

describe('the front-loaded first rank', () => {
  it('is +50 % on its own, then steps at the node\'s normal rate', () => {
    expect(effectTotal(DESK.effect, 1)).toBe(50)
    expect(effectTotal(DESK.effect, 2)).toBe(56)
    expect(effectTotal(DESK.effect, 4)).toBe(68)
    expect(effectTotal(PHONE.effect, 1)).toBe(50)
    expect(effectTotal(PHONE.effect, 3)).toBe(66)
  })

  it('sums the same way the combat multiplier reads it', () => {
    expect(sumEffect({ foundations: 1 }, 'blockHp')).toBe(50)
    expect(sumEffect({ foundations: 3 }, 'blockHp')).toBe(62)
    expect(sumEffect({ m2_foundations: 2 }, 'blockHp', TECH_NODES_DROPMERGE)).toBe(58)
  })

  it('advertises the NEXT rank\'s gain, so the card reads +50 % unbought and +6 % after', () => {
    expect(nextRankGain(DESK.effect, 0)).toBe(50)
    expect(nextRankGain(DESK.effect, 1)).toBe(6)
    expect(nextRankGain(DESK.effect, 7)).toBe(6)
    expect(nextRankGain(PHONE.effect, 0)).toBe(50)
    expect(nextRankGain(PHONE.effect, 1)).toBe(8)
  })

  it('leaves every other node flat', () => {
    for (const node of [...TECH_NODES, ...TECH_NODES_DROPMERGE]) {
      if (node.id === 'foundations' || node.id === 'm2_foundations') continue
      const e = node.effect as { pct?: number; add?: number }
      const step = e.pct ?? e.add ?? 0
      expect(nextRankGain(node.effect, 0), node.id).toBe(step)
      expect(effectTotal(node.effect, 3), node.id).toBe(step * 3)
    }
  })
})

describe('what it costs, and when a first run can pay', () => {
  it('prices rank one at 20 on both boards, and leaves the ladder above it alone', () => {
    expect(techCost('foundations', 0)).toBe(20)
    expect(techCost('foundations', 1)).toBe(51)
    expect(techCost('m2_foundations', 0, TECH_NODES_DROPMERGE)).toBe(20)
    // Rank 2 still comes off `costBase` (50 × 1.28), not off the override.
    expect(techCost('m2_foundations', 1, TECH_NODES_DROPMERGE)).toBe(64)
  })

  it('is in the wallet by the wave-2 clear, even without the early-call bonus', () => {
    // Waves pay the wallet `waveReward(n).coins`; the mode's `rewardMul` scales
    // materials only, so this is the same purse on both boards. The spotlight
    // lights when wave 2 starts, and the first build phase it is up for comes
    // straight after this.
    const purse = waveReward(1).coins + waveReward(2).coins
    expect(purse).toBeGreaterThanOrEqual(techCost('foundations', 0))
    expect(purse).toBeGreaterThanOrEqual(techCost('m2_foundations', 0, TECH_NODES_DROPMERGE))
  })
})

describe('where the first HP card sits', () => {
  it('is the root of the desktop tree', () => {
    expect(firstHpNodeId(TECH_NODES)).toBe('foundations')
    expect(DESK.requires).toEqual([])
  })

  it('leads the phone strip, with Sharp Bolts and the brace behind it', () => {
    expect(firstHpNodeId(TECH_NODES_DROPMERGE)).toBe('m2_foundations')
    expect(TECH_NODES_DROPMERGE[0]!.id).toBe('m2_foundations')
    const byId = Object.fromEntries(TECH_NODES_DROPMERGE.map((n) => [n.id, n]))
    expect(byId.m2_foundations!.requires).toEqual([])
    expect(byId.m2_sharpBolts!.requires).toEqual(['m2_foundations'])
    expect(byId.m2_brace!.requires).toEqual(['m2_sharpBolts'])
    expect(byId.m2_bombard!.requires).toEqual(['m2_brace'])
    // Still one track: every card but the first needs exactly the one before.
    TECH_NODES_DROPMERGE.forEach((n, i) => {
      if (i === 0) return
      expect(n.requires, n.id).toEqual([TECH_NODES_DROPMERGE[i - 1]!.id])
    })
  })
})

describe('a phone save from before the strip was re-ordered', () => {
  /** Load the phone board over a seeded save, as the scene does. */
  const loadPhone = async (levels: Record<string, number>, coins = 500) => {
    vi.resetModules()
    localStorage.clear()
    localStorage.setItem('tower_state', JSON.stringify({ ts_m2_tech: { levels }, ts_coins: coins }))
    const game = await import('@/use/useTowerGame')
    const { DROPMERGE_RULES } = await import('@/mobile-fit/rules')
    game.applyRules(DROPMERGE_RULES)
    const mod = await import('@/use/useTowerProgress')
    return { p: mod.default(), mod }
  }

  it('never padlocks a card the player already owns', async () => {
    // Old order: Sharp Bolts → brace → Foundations. This player bought the
    // first two and never reached the third.
    const { p } = await loadPhone({ m2_sharpBolts: 3, m2_brace: 1 })
    expect(p.levelOf('m2_sharpBolts')).toBe(3)
    expect(p.isUnlocked('m2_sharpBolts')).toBe(true)
    expect(p.isUnlocked('m2_brace')).toBe(true)
    // The next Sharp Bolts rank is still for sale …
    expect(p.buyTech('m2_sharpBolts')).toBe(true)
    expect(p.levelOf('m2_sharpBolts')).toBe(4)
    // … and the card now in front of it is simply buyable, as a root.
    expect(p.isUnlocked('m2_foundations')).toBe(true)
    expect(p.buyTech('m2_foundations')).toBe(true)
  })

  it('still gates an unowned card on its prerequisite', async () => {
    const { p } = await loadPhone({})
    expect(p.isUnlocked('m2_sharpBolts')).toBe(false)
    expect(p.buyTech('m2_sharpBolts')).toBe(false)
  })

  it('takes +50 % block HP off the first Foundations rank', async () => {
    const { p, mod } = await loadPhone({})
    expect(p.buyTech('m2_foundations')).toBe(true)
    expect(mod.blockHpMul.value).toBeCloseTo(1.5)
  })
})

describe('the in-tree spotlight', () => {
  const load = async (levels: Record<string, number> = {}) => {
    vi.resetModules()
    localStorage.clear()
    localStorage.setItem('tower_state', JSON.stringify({ ts_tech: { levels } }))
    const discovery = await import('@/use/useTechDiscovery')
    const game = await import('@/use/useTowerGame')
    const progress = await import('@/use/useTowerProgress')
    const lit = (): boolean => discovery.shouldSpotlightFirstUpgrade(TECH_NODES, progress.levelOf)
    return { discovery, game, progress, lit }
  }

  it('waits for stage 2', async () => {
    const { game, lit } = await load()
    game.wave.value = 1
    expect(lit()).toBe(false)
    game.wave.value = 2
    expect(lit()).toBe(true)
  })

  it('lights from the first wave of a later run once a wave is banked', async () => {
    const { game, progress, lit } = await load()
    game.wave.value = 0
    progress.totalWaves.value = 1
    expect(lit()).toBe(true)
  })

  it('stays on after the tree is opened, until the card is bought', async () => {
    // Opening the tree retires the HUD arrow; this one is about the purchase.
    const { discovery, game, lit } = await load()
    game.wave.value = 3
    discovery.markTechFound()
    expect(discovery.techNudge.value).toBe(false)
    expect(lit()).toBe(true)
  })

  it('goes out once Foundations is bought', async () => {
    const { game, lit } = await load({ foundations: 1 })
    game.wave.value = 5
    expect(lit()).toBe(false)
  })

  it('never lights for a player who has already chosen a different first upgrade', async () => {
    const { game, lit } = await load({ sharpBolts: 1 })
    game.wave.value = 5
    expect(lit()).toBe(false)
  })
})

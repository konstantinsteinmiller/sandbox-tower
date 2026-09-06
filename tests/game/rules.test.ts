import { describe, expect, it, vi } from 'vitest'

// The merge ceiling and the fixture's span are rules, not constants: the
// desktop keeps both, the drop board drops both.
describe('merge rules', () => {
  it('leaves the desktop uncapped too, with the gun growing over its footprint', async () => {
    const { DESKTOP_RULES } = await import('@/game/rules')
    expect(DESKTOP_RULES.maxMergeTier).toBe(Infinity)
    // The desktop keeps every cell its halves stood on, so the gun grows with
    // the footprint's SHORT side: 2×1 → 1.1, 2×2 → 2.2, 4×2 → 2.2, 4×4 → 4.4.
    expect(DESKTOP_RULES.mergeArt).toBe('footprint')
    const { fixtureSpanForTier } = await import('@/use/useTowerArt')
    expect(fixtureSpanForTier(1)).toBe(1)
    expect(fixtureSpanForTier(2)).toBeCloseTo(1.1)
    expect(fixtureSpanForTier(3)).toBeCloseTo(2.2)
    expect(fixtureSpanForTier(4)).toBeCloseTo(2.2)
    expect(fixtureSpanForTier(5)).toBeCloseTo(4.4)
  })

  it('leaves the drop board uncapped, with the fixture inside its one cell', async () => {
    const { DROPMERGE_RULES } = await import('@/mobile-fit/rules')
    expect(DROPMERGE_RULES.maxMergeTier).toBe(Infinity)
    expect(DROPMERGE_RULES.mergeArt).toBe('cell')
  })

  it('welds the drop board in all four directions, gravity first', async () => {
    const { DROPMERGE_RULES, DESKTOP_RULES } = await import('@/mobile-fit/rules')
      .then(async (m) => ({ ...m, ...(await import('@/game/rules')) }))
    expect(DROPMERGE_RULES.mergeDirs).toEqual([[0, -1], [-1, 0], [1, 0], [0, 1]])
    // Scanned in order, so down wins a tie — the way the piece was moving.
    expect(DROPMERGE_RULES.mergeDirs[0]).toEqual([0, -1])
    // The desktop fuses by rectangle in `adjacency` and never reads this.
    expect(DESKTOP_RULES.merge).toBe('adjacency')
    expect(DESKTOP_RULES.mergeDirs).toEqual([[0, -1]])
  })
})

// ─── The rule-set seam ──────────────────────────────────────────────────────
//
// `DESKTOP_RULES` must reproduce every constant the simulation carried before
// the seam existed, because it is what every existing test — and every player
// — runs on. These pins are the contract; the mobile-fit suite exercises the
// other side of it.

const load = async () => {
  vi.resetModules()
  localStorage.clear()
  const game = await import('@/use/useTowerGame')
  const rules = await import('@/game/rules')
  return { game, rules }
}

describe('DESKTOP_RULES reproduces the pre-seam constants', () => {
  it('board, support, merging and the hand', async () => {
    const { rules } = await load()
    const d = rules.DESKTOP_RULES
    expect(d.id).toBe('desktop')
    expect(d.board).toEqual({ groundHalfWidth: 'tech', upperHalfWidth: 22, maxRow: Infinity, waterRow: true })
    expect(d.support).toBe('graph')
    expect(d.merge).toBe('adjacency')
    expect(d.mergeTypes).toBe('weapons')
    expect(d.fall.killCells).toBe(5)
    expect(d.offers.slots).toBe(5)
    expect(d.offers.lanes).toEqual(['structure', 'weapon', 'any', 'any', 'support'])
    expect(d.offers.weaponSlot).toBe(1)
    expect(d.offers.supportSlot).toBe(4)
    expect(d.offers.rotation).toBe(true)
    expect(d.offers.rerollMs).toBe(5_000)
    expect(d.offers.unlockRerollSlots).toEqual([2, 3])
    expect(d.blocks).toEqual({ catalogue: null, foldStoneIntoWood: null })
  })

  it('director, economy, abilities and keys', async () => {
    const { rules } = await load()
    const d = rules.DESKTOP_RULES
    expect(d.enemies.roster).toBeNull()
    expect(d.enemies.maxOnField).toBe(Infinity)
    expect(d.enemies.speedMul).toBe(1)
    expect(d.enemies.airSpawn).toBe('sides')
    expect(d.waves.budgetMul).toBe(1)
    expect(d.waves.buildMs).toBe(15_000)
    expect(d.waves.spawnWindowMs).toBe(82_000)
    expect(d.waves.flushAtMs).toBe(96_000)
    expect(d.waves.bossEvery).toBe(10)
    expect(d.waves.bossBudget).toBe(0.6)
    expect(d.waves.airFromWave).toBe(9)
    expect(d.waves.seaFromWave).toBe(12)
    expect(d.waves.siegeFromWave).toBe(14)
    expect(d.waves.expectedPowerMul).toBe(1)
    expect(d.waves.hpSlope).toBe(0.135)
    expect(d.waves.rewardMul).toBe(1)
    expect(d.difficulty.hoardDivisor).toBe(1)
    expect(d.economy).toEqual({ startWood: 120, startStone: 40 })
    expect(d.tech.stateKey).toBe('ts_tech')
    expect(d.abilities).toEqual({ arrowRain: 'aim', cavalry: true, rangeBoost: true, speeds: [1, 2, 3] })
    expect(d.save).toEqual({
      runKey: 'ts_run', bestWaveKey: 'ts_best_wave', onboardedKey: 'ts_onboarded', tutorialKey: 'ts_tutorial'
    })
    expect(d.camera).toBe('auto')
  })

  it('is the active rule set by default', async () => {
    const { rules } = await load()
    expect(rules.activeRules.current).toBe(rules.DESKTOP_RULES)
    expect(rules.rulesNow().id).toBe('desktop')
  })
})

describe('the simulation under the desktop rules', () => {
  it('keeps the foundation at ±4, the upper floors at ±22 and the dock at ±3', async () => {
    const { game } = await load()
    game.startRun()
    expect(game.halfWidthAt(0)).toBe(4)
    expect(game.halfWidthAt(3)).toBe(22)
    expect(game.halfWidthAt(game.WATER_ROW)).toBe(3)
    expect(game.halfWidthAt(500)).toBe(22)
  })

  it('deals five offers and sizes the per-slot state to match', async () => {
    const { game } = await load()
    game.startRun()
    expect(game.offers.value).toHaveLength(5)
    expect(game.rerollReadyIn.value).toHaveLength(5)
    expect(game.offerEnhanced.value).toHaveLength(5)
  })

  it('starts with 120 wood and 40 stone', async () => {
    const { game } = await load()
    game.startRun()
    expect(game.wood.value).toBe(120)
    expect(game.stone.value).toBe(40)
  })
})

describe('applyRules', () => {
  it('resizes the hand state and notifies subscribers', async () => {
    const { game, rules } = await load()
    let seen = ''
    rules.onRulesChange((r) => { seen = r.id })
    const custom = {
      ...rules.DESKTOP_RULES,
      id: 'custom',
      offers: { ...rules.DESKTOP_RULES.offers, slots: 3, lanes: ['structure', 'weapon', 'any'] as const, supportSlot: null, unlockRerollSlots: [2] }
    }
    game.applyRules(custom)
    expect(seen).toBe('custom')
    expect(game.rerollReadyIn.value).toHaveLength(3)
    expect(game.offerEnhanced.value).toHaveLength(3)
    game.startRun()
    expect(game.offers.value).toHaveLength(3)
  })

  it('never restores a snapshot written under other rules', async () => {
    const { game, rules } = await load()
    const state = await import('@/use/useTowerState')
    game.startRun()
    game.wood.value = 500
    game.placeBlock('wood', 1, 0)
    game.saveRunSnapshot()
    const snap = state.getState<{ rules?: string; blocks: unknown[] }>('ts_run')
    expect(snap?.rules).toBe('desktop')
    expect(game.hasSavedRun()).toBe(true)

    // Same key, foreign rules id: refused.
    state.setState('ts_run', { ...snap, rules: 'someone-else' })
    expect(game.hasSavedRun()).toBe(false)
    expect(game.resumeRun()).toBe(false)

    // A pre-seam snapshot (no `rules` field) is a desktop one and still loads.
    const legacy = { ...snap } as Record<string, unknown>
    delete legacy.rules
    state.setState('ts_run', legacy)
    expect(game.hasSavedRun()).toBe(true)
    expect(game.resumeRun()).toBe(true)
    expect(game.getBlocks().has('1,0')).toBe(true)

    // Another mode saves under its own key and never sees the desktop's.
    game.applyRules({ ...rules.DESKTOP_RULES, id: 'other', save: { ...rules.DESKTOP_RULES.save, runKey: 'ts_other_run' } })
    expect(game.hasSavedRun()).toBe(false)
  })
})

import { describe, expect, it, vi } from 'vitest'

// ─── Gift pieces ────────────────────────────────────────────────────────────
//
// A gift is a FREE piece that arrives already welded: the flying chest's prize
// and the one-time present for clearing wave 3. What has to hold, on both
// boards: it costs nothing, it lands as the weld it claims to be, it obeys the
// placement rules a bought piece does, it survives a reload but not a new run,
// and the present is given exactly once.

const TICK = 1000 / 60

const load = async (mode: 'tower' | 'drop' = 'tower', keepStorage = false) => {
  vi.resetModules()
  if (!keepStorage) localStorage.clear()
  const game = await import('@/use/useTowerGame')
  if (mode === 'drop') {
    const { DROPMERGE_RULES } = await import('@/mobile-fit/rules')
    game.applyRules(DROPMERGE_RULES)
  }
  const gifts = await import('@/use/useGifts')
  const state = await import('@/use/useTowerState')
  const keys = await import('@/keys')
  return { game, gifts, state, keys }
}

const purse = (game: Awaited<ReturnType<typeof load>>['game']) =>
  [game.wood.value, game.stone.value, game.runCoins.value]

/** Call a wave and hold the field clear until the sim is back in build. */
const clearWave = (game: Awaited<ReturnType<typeof load>>['game']): void => {
  game.callWave()
  for (let t = 0; t < 200_000; t += TICK) {
    game.getEnemies().length = 0
    game.step(TICK)
    if (game.phase.value === 'build') return
  }
  throw new Error('wave never cleared')
}

describe('a gift on the tower board', () => {
  it('lands as ONE tier-2 weld over two cells, and costs nothing', async () => {
    const { game, gifts } = await load()
    game.startRun()
    expect(gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })).toBe(true)
    const before = purse(game)
    expect(gifts.placeGiftAt(1, 0)).toBe(true)
    const b = game.getBlocks().get('1,0')!
    expect(b.typeId).toBe('tesla')
    expect(b.tier).toBe(2)
    expect([b.w, b.h]).toEqual([2, 1])
    // One block, both cells.
    expect(game.getBlocks().get('2,0')).toBe(b)
    expect(b.hp).toBe(b.maxHp)
    expect(purse(game)).toEqual(before)
    expect(gifts.gifts.value).toHaveLength(0)
  })

  it('lands the jackpot as the 2×2 tier 3', async () => {
    const { game, gifts } = await load()
    game.startRun()
    gifts.grantGift({ typeId: 'mortar', tier: 3, source: 'chest' })
    expect(gifts.placeGiftAt(1, 0)).toBe(true)
    const b = game.getBlocks().get('1,0')!
    expect(b.tier).toBe(3)
    expect([b.w, b.h]).toEqual([2, 2])
    expect(game.getBlocks().get('2,1')).toBe(b)
  })

  it('snaps to the footprint that contains the tapped cell', async () => {
    const { game, gifts } = await load()
    game.startRun()
    // The ground ends at the foundation's edge; tapping the last cell cannot
    // start a flat pair there, so the pair ends on it instead.
    const edge = game.halfWidthAt(0)
    gifts.grantGift({ typeId: 'frost', tier: 2, source: 'chest' })
    expect(gifts.placeGiftAt(edge, 0)).toBe(true)
    const b = game.getBlocks().get(`${edge},0`)!
    expect(b.typeId).toBe('frost')
    expect(b.c).toBe(edge - 1)
  })

  it('comes as a plain pair when the board never fuses its type', async () => {
    const { game, gifts } = await load()
    game.startRun()
    // An obelisk is a buff, not a weapon, and the tower welds weapons only.
    gifts.grantGift({ typeId: 'obelisk', tier: 2, source: 'chest' })
    expect(gifts.placeGiftAt(1, 0)).toBe(true)
    const a = game.getBlocks().get('1,0')!
    const b = game.getBlocks().get('2,0')!
    expect(a.typeId).toBe('obelisk')
    expect(b.typeId).toBe('obelisk')
    expect(a).not.toBe(b)
    expect(a.tier ?? 1).toBe(1)
  })

  it('refuses a spot a bought piece could not use, and keeps the gift', async () => {
    const { game, gifts } = await load()
    game.startRun()
    gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    // The Gate's own cell, and a cell floating in the sky.
    expect(gifts.placeGiftAt(0, 0)).toBe(false)
    expect(gifts.placeGiftAt(3, 5)).toBe(false)
    expect(gifts.gifts.value).toHaveLength(1)
  })
})

describe('a gift on the drop board', () => {
  it('drops as one pre-fused cell and lands at its tier, free', async () => {
    const { game, gifts } = await load('drop')
    game.startRun()
    game.buildClockHeld.value = true
    gifts.grantGift({ typeId: 'frost', tier: 2, source: 'chest' })
    const before = purse(game)
    expect(gifts.dropGiftAt(2)).toBe(true)
    for (let i = 0; i < 400 && game.getDebris().length > 0; i++) game.step(TICK)
    const b = game.getBlocks().get('2,0')!
    expect(b.typeId).toBe('frost')
    expect(b.tier).toBe(2)
    expect([b.w ?? 1, b.h ?? 1]).toEqual([1, 1])
    expect(b.hp).toBe(b.maxHp)
    expect(purse(game)).toEqual(before)
    expect(gifts.gifts.value).toHaveLength(0)
  })

  it('refuses a column off the board or full', async () => {
    const { game, gifts } = await load('drop')
    game.startRun()
    gifts.grantGift({ typeId: 'tesla', tier: 3, source: 'chest' })
    expect(gifts.dropGiftAt(9)).toBe(false)
    expect(gifts.gifts.value).toHaveLength(1)
  })
})

describe('the queue', () => {
  it('holds at most three', async () => {
    const { game, gifts } = await load()
    game.startRun()
    for (let i = 0; i < gifts.MAX_GIFTS; i++) {
      expect(gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })).toBe(true)
    }
    expect(gifts.grantGift({ typeId: 'frost', tier: 2, source: 'chest' })).toBe(false)
    expect(gifts.gifts.value).toHaveLength(3)
  })

  it('survives a reload of the run it was won in, and not a new run', async () => {
    const first = await load()
    first.game.startRun()
    first.gifts.grantGift({ typeId: 'mortar', tier: 2, source: 'chest' })
    first.game.saveRunSnapshot()
    first.state.flushPersist()

    // A reload: fresh modules over the same storage, and the run resumes.
    const again = await load('tower', true)
    expect(again.game.resumeRun()).toBe(true)
    expect(again.gifts.gifts.value.map((g) => g.typeId)).toEqual(['mortar'])

    // A new siege starts empty-handed.
    again.game.startRun()
    expect(again.gifts.gifts.value).toHaveLength(0)
  })

  it('keeps each board its own gifts', async () => {
    const tower = await load()
    tower.game.startRun()
    tower.gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    expect(tower.state.getState<unknown[]>(tower.keys.GIFTS_KEY)).toHaveLength(1)
    expect(tower.state.getState(tower.keys.M2_GIFTS_KEY)).toBeUndefined()

    const { DROPMERGE_RULES } = await import('@/mobile-fit/rules')
    tower.game.applyRules(DROPMERGE_RULES)
    expect(tower.gifts.gifts.value).toHaveLength(0)
  })
})

describe('the chest\'s draw', () => {
  const seq = (...xs: number[]) => {
    let i = 0
    return () => xs[i++ % xs.length]!
  }

  it('prefers what the player has not unlocked', async () => {
    const { gifts } = await load()
    const owned = new Set(['tesla', 'frost', 'mortar'])
    for (const r of [0, 0.3, 0.6, 0.99]) {
      expect(gifts.rollChestGift(seq(r, 0.5), owned).typeId).toBe('obelisk')
    }
  })

  it('pays a tier 3 about one time in ten — guns only', async () => {
    const { gifts } = await load()
    const none = new Set<string>()
    expect(gifts.rollChestGift(seq(0, 0.05), none)).toEqual({ typeId: 'tesla', tier: 3, source: 'chest' })
    expect(gifts.rollChestGift(seq(0, 0.5), none).tier).toBe(2)
    // The last entry is the obelisk: a low second roll still does not make it
    // a tier 3.
    expect(gifts.rollChestGift(seq(0.999, 0.01), none)).toEqual({ typeId: 'obelisk', tier: 2, source: 'chest' })
    let jackpots = 0
    let rolls = 0
    let s = 7
    const lcg = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
    for (let i = 0; i < 4000; i++) {
      const g = gifts.rollChestGift(lcg, none)
      if (g.typeId === 'obelisk') continue
      rolls++
      if (g.tier === 3) jackpots++
    }
    expect(jackpots / rolls).toBeGreaterThan(0.07)
    expect(jackpots / rolls).toBeLessThan(0.13)
  })
})

describe('the first-clear present', () => {
  it('hands over a tier-2 cannon on the first clear of wave 3, and never again', async () => {
    const { game, gifts, state, keys } = await load()
    game.startRun()
    game.buildClockHeld.value = true
    game.debugSetWave(2)
    clearWave(game)
    expect(game.wave.value).toBe(2)
    expect(gifts.gifts.value).toHaveLength(0)

    clearWave(game)
    expect(game.wave.value).toBe(3)
    expect(gifts.gifts.value).toEqual([{ typeId: 'cannon', tier: 2, source: 'firstClear' }])
    expect(state.getState(keys.FIRST_CLEAR_GIFT_KEY)).toBe(true)

    // Wave 4, and a whole new run's wave 3: nothing more.
    clearWave(game)
    expect(gifts.gifts.value).toHaveLength(1)
    game.startRun()
    game.buildClockHeld.value = true
    game.debugSetWave(3)
    clearWave(game)
    expect(gifts.gifts.value).toHaveLength(0)
  })

  it('is the drop board\'s own, too', async () => {
    const { game, gifts, state, keys } = await load('drop')
    game.startRun()
    game.buildClockHeld.value = true
    state.setState(keys.FIRST_CLEAR_GIFT_KEY, true)
    game.debugSetWave(3)
    clearWave(game)
    expect(gifts.gifts.value.map((g) => g.source)).toEqual(['firstClear'])
    expect(state.getState(keys.M2_FIRST_CLEAR_GIFT_KEY)).toBe(true)
  })
})

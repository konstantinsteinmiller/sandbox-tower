import { describe, expect, it, vi } from 'vitest'

// ─── Gift pieces ────────────────────────────────────────────────────────────
//
// A gift is a piece that arrives already welded: the flying chest's prize and
// the one-time present for clearing wave 3. What has to hold, on both boards:
// it lands as the weld it claims to be, it obeys the placement rules a bought
// piece does, it is FREE only where it is meant to be (the present, and the
// first chest a player ever opens) and half price otherwise, it survives a
// reload but not a new run, and the present is given exactly once.

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

/** Enough of everything that a gift's price is never what refuses it. */
const stock = (game: Awaited<ReturnType<typeof load>>['game']): void => {
  game.wood.value = 9_999
  game.stone.value = 9_999
  game.runCoins.value = 9_999
}

/** A free gift — what the present and the first chest ever opened pay out. */
const freeGift = (typeId: string, tier = 2) =>
  ({ typeId, tier, source: 'chest' as const, free: true })

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

// The green sockets a gift in hand shows — the same flash a hand piece gets.
describe('where a gift can go', () => {
  it('lists the sockets it would take, and every one it lists does take it', async () => {
    const { game, gifts } = await load()
    game.startRun()
    stock(game)
    gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    const anchors = gifts.giftAnchors(gifts.gifts.value[0]!)
    expect(anchors.length).toBeGreaterThan(0)
    // Beside the Gate on the ground; never over it. The Gate's OWN cell is the
    // exclusion — a two-cell gift cannot start there in either orientation —
    // while the cells either side of it are sockets, because a tier 2 may
    // stand up as well as lie down. (`giftAnchors` scanned only the flat
    // footprint until 2026-09-14, so it under-reported the legal board by
    // roughly half on a narrow opening tower.)
    expect(anchors).toContainEqual([1, 0])
    expect(anchors).toContainEqual([-1, 0])
    expect(anchors).not.toContainEqual([0, 0])
    const [c, r] = anchors[anchors.length - 1]!
    expect(gifts.placeGiftAt(c, r)).toBe(true)
    expect(game.getBlocks().get(`${c},${r}`)?.typeId).toBe('tesla')
  })

  it('grows with the tower', async () => {
    const { game, gifts } = await load()
    game.startRun()
    gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    const before = gifts.giftAnchors(gifts.gifts.value[0]!)
    game.wood.value = 500
    game.stone.value = 500
    expect(game.placeBlock('wood', 1, 0)).toBeTruthy()
    expect(game.placeBlock('wood', 2, 0)).toBeTruthy()
    const after = gifts.giftAnchors(gifts.gifts.value[0]!)
    // The row the two crates made is now a floor to stand a gift on…
    expect(after).toContainEqual([1, 1])
    expect(before).not.toContainEqual([1, 1])
    // …and the ground they took is no longer offered.
    expect(after).not.toContainEqual([1, 0])
  })
})

describe('a gift on the tower board', () => {
  it('lands as ONE tier-2 weld over two cells, and a free one costs nothing', async () => {
    const { game, gifts } = await load()
    game.startRun()
    expect(gifts.grantGift(freeGift('tesla'))).toBe(true)
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
    stock(game)
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
    stock(game)
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
    stock(game)
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
    gifts.grantGift(freeGift('frost'))
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

describe('what a gift costs', () => {
  it('prices a chest piece at half of building its cells the long way', async () => {
    const { game, gifts } = await load()
    game.startRun()
    const one = game.priceOfBlock('tesla')
    // A tier 2 is two of the block, a tier 3 four — halved.
    expect(gifts.giftPrice({ typeId: 'tesla', tier: 2, source: 'chest' })).toEqual({
      wood: Math.ceil(one.wood), stone: Math.ceil(one.stone), coins: Math.ceil(one.coins)
    })
    expect(gifts.giftPrice({ typeId: 'tesla', tier: 3, source: 'chest' })).toEqual({
      wood: Math.ceil(one.wood * 2), stone: Math.ceil(one.stone * 2), coins: Math.ceil(one.coins * 2)
    })
    // Free is free, whatever the block.
    expect(gifts.giftPrice(freeGift('tesla', 3))).toEqual({ wood: 0, stone: 0, coins: 0 })
  })

  it('charges the purse when a paid gift is placed', async () => {
    const { game, gifts } = await load()
    game.startRun()
    stock(game)
    const gift = { typeId: 'tesla', tier: 2, source: 'chest' as const }
    gifts.grantGift(gift)
    const price = gifts.giftPrice(gift)
    const before = purse(game)
    expect(gifts.placeGiftAt(1, 0)).toBe(true)
    expect(purse(game)).toEqual([
      before[0]! - price.wood, before[1]! - price.stone, before[2]! - price.coins
    ])
  })

  it('refuses a gift the purse cannot pay for, and keeps it in hand', async () => {
    const { game, gifts } = await load()
    game.startRun()
    game.wood.value = 0
    game.stone.value = 0
    game.runCoins.value = 0
    const gift = { typeId: 'tesla', tier: 2, source: 'chest' as const }
    gifts.grantGift(gift)
    expect(gifts.missingForGift(gift).length).toBeGreaterThan(0)
    expect(gifts.placeGiftAt(1, 0)).toBe(false)
    expect(gifts.gifts.value).toHaveLength(1)
    // Nothing landed.
    expect(game.getBlocks().get('1,0')).toBeUndefined()
  })

  it('gives the first chest ever opened away, and sells every one after', async () => {
    const { game, gifts, state, keys } = await load()
    game.startRun()
    const prize = { typeId: 'frost', tier: 2, source: 'chest' as const }

    expect(gifts.chestFreebieSpent()).toBe(false)
    expect(gifts.grantChestGift(prize)).toBe(true)
    expect(gifts.gifts.value[0]!.free).toBe(true)
    expect(state.getState(keys.FIRST_CHEST_KEY)).toBe(true)

    expect(gifts.grantChestGift(prize)).toBe(true)
    expect(gifts.gifts.value[1]!.free).toBe(false)

    // And the freebie is spent for good — a new run does not restore it.
    game.startRun()
    expect(gifts.chestFreebieSpent()).toBe(true)
    expect(gifts.grantChestGift(prize)).toBe(true)
    expect(gifts.gifts.value[0]!.free).toBe(false)
  })

  it('keeps each board its own freebie', async () => {
    const { game, gifts, state, keys } = await load('drop')
    game.startRun()
    gifts.grantChestGift({ typeId: 'frost', tier: 2, source: 'chest' })
    expect(state.getState(keys.M2_FIRST_CHEST_KEY)).toBe(true)
    expect(state.getState(keys.FIRST_CHEST_KEY)).toBeUndefined()
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

describe('the chest’s draw', () => {
  const seq = (...xs: number[]) => {
    let i = 0
    return () => xs[i++ % xs.length]!
  }

  it('prefers what the player has not unlocked', async () => {
    const { gifts } = await load()
    const owned = new Set(['tesla', 'frost', 'mortar'])
    // Each roll spends the obelisk from this run's pass, so the pass is reset
    // between them: what is asserted here is the preference, not the cycle.
    for (const r of [0, 0.3, 0.6, 0.99]) {
      gifts.resetChestInventory()
      expect(gifts.rollChestGift(seq(r, 0.5), owned).typeId).toBe('obelisk')
    }
  })

  it('pays ONE CELL, never a weld', async () => {
    const { gifts } = await load()
    const none = new Set<string>()
    // The chest is an introduction, not a head start: it used to hand over a
    // tier 2 — and a tier 3 one time in ten — which is two to four welded
    // cells of a gun the player may never have unlocked.
    // Every type it carries, across a whole pass — the tier is never the
    // draw's business again.
    for (let i = 0; i < gifts.CHEST_GIFTS.length; i++) {
      expect(gifts.rollChestGift(seq(0.5, 0.05), none)?.tier).toBe(1)
    }
  })

  it('delivers each thing it carries once, then stops bringing pieces', async () => {
    const { gifts } = await load()
    const none = new Set<string>()
    let s = 7
    const lcg = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
    const kinds = gifts.CHEST_GIFTS.length

    const pass = Array.from({ length: kinds }, () => gifts.rollChestGift(lcg, none)?.typeId)
    expect(new Set(pass).size).toBe(kinds)
    expect([...pass].sort()).toEqual(gifts.CHEST_GIFTS.map(([id]) => id).sort())

    // Everything has been introduced, so there is nothing left to teach: the
    // chest pays `CHEST_COIN_PRIZE` from here instead of handing out more
    // guns (`FlyingChest.onOpen`).
    for (let i = 0; i < 5; i++) expect(gifts.rollChestGift(lcg, none)).toBeNull()
  })

  it('starts a fresh pass with a fresh tower', async () => {
    const { game, gifts } = await load()
    const none = new Set<string>()
    const first = gifts.rollChestGift(seq(0, 0.5), none).typeId
    expect(gifts.chestDelivered().has(first)).toBe(true)
    // The list resets with the run (`onRunStart`), so a new tower meets the
    // whole inventory again.
    game.startRun()
    expect(gifts.chestDelivered().size).toBe(0)
    expect(gifts.rollChestGift(seq(0, 0.5), none).typeId).toBe(first)
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
    expect(gifts.gifts.value).toEqual([
      { typeId: 'cannon', tier: 2, source: 'firstClear', free: true }
    ])
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

import { describe, expect, it, vi } from 'vitest'

// ─── Drop & Merge Siege — the rules in the simulation ───────────────────────
//
// Every test loads a fresh simulation, applies the mobile-fit rules and starts
// a run, exactly as the phone scene does in its setup.

const TICK = 1000 / 60

const load = async () => {
  vi.resetModules()
  localStorage.clear()
  const game = await import('@/use/useTowerGame')
  const { DROPMERGE_RULES, BOARD_MAX_ROW, BOARD_HALF_WIDTH } = await import('@/mobile-fit/rules')
  const { PIECE_DEFS } = await import('@/mobile-fit/pieces')
  game.applyRules(DROPMERGE_RULES)
  game.startRun()
  // This board has NO opening build window — it calls wave 1 on the first tick
  // (see `firstBuildMs`), which is the whole point of it. Every spec below is
  // about the board itself, though, so the clock is frozen and the phase stays
  // where the mechanics under test live; the opening wave has its own specs in
  // `tests/game/openingWave.test.ts`.
  game.buildClockHeld.value = true
  return { game, rules: DROPMERGE_RULES, BOARD_MAX_ROW, BOARD_HALF_WIDTH, PIECE_DEFS }
}

/** Step until nothing is in the air any more. */
const settle = (game: Awaited<ReturnType<typeof load>>['game'], maxTicks = 400): void => {
  for (let i = 0; i < maxTicks; i++) {
    game.step(TICK)
    if (game.getDebris().length === 0) return
  }
}

const rich = (game: Awaited<ReturnType<typeof load>>['game']): void => {
  game.wood.value = 20_000
  game.runCoins.value = 5_000
}

describe('board', () => {
  it('is five columns wide and seven rows tall, with no water row', async () => {
    const { game, BOARD_MAX_ROW } = await load()
    expect(game.halfWidthAt(0)).toBe(2)
    expect(game.halfWidthAt(BOARD_MAX_ROW)).toBe(2)
    expect(game.halfWidthAt(BOARD_MAX_ROW + 1)).toBe(-1)
    expect(game.halfWidthAt(game.WATER_ROW)).toBe(-1)
    expect(game.canPlaceAt(3, 0)).toBe(false)
    expect(game.canPlaceAt(2, 0)).toBe(true)
    expect(game.canPlaceAt(0, BOARD_MAX_ROW + 1)).toBe(false)
    expect(game.canPlaceAt(0, -1, 'skiff')).toBe(false)
  })

  it('starts with ninety materials and no stone', async () => {
    const { game } = await load()
    expect(game.wood.value).toBe(90)
    expect(game.stone.value).toBe(0)
  })
})

describe('the hand', () => {
  it('deals three single-column pieces from the mobile pool', async () => {
    const { game, PIECE_DEFS } = await load()
    const ids = new Set(PIECE_DEFS.map((p) => p.id))
    expect(game.offers.value).toHaveLength(3)
    for (const id of game.offers.value) {
      // The crate ladder may have re-cut a wood piece; the base id is in the pool.
      const base = id.split('~')[0]!
      expect(ids.has(base)).toBe(true)
    }
    expect(game.rerollReadyIn.value).toHaveLength(3)
  })

  it('locks the first slot to structure and the second to a weapon', async () => {
    const { game, PIECE_DEFS } = await load()
    const laneOf = (id: string) => PIECE_DEFS.find((p) => p.id === id.split('~')[0])?.lane
    expect(laneOf(game.offers.value[0]!)).toBe('structure')
    expect(laneOf(game.offers.value[1]!)).toBe('weapon')
  })

  it('charges stone costs as wood at the fold rate', async () => {
    const { game } = await load()
    expect(game.priceOfShape('b_stone')).toEqual({ wood: 22, stone: 0, coins: 0 })
    expect(game.priceOfShape('b_cannon')).toEqual({ wood: 39, stone: 0, coins: 0 })
    expect(game.priceOfShape('b_wood')).toEqual({ wood: 10, stone: 0, coins: 0 })
  })
})

describe('drops', () => {
  it('drops the offered piece into a column, charging it and rerolling the slot', async () => {
    const { game } = await load()
    rich(game)
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    const before = game.wood.value
    expect(game.canDropAt(2)).toBe(true)
    expect(game.dropOffer(0, 2)).toBe(true)
    expect(game.wood.value).toBe(before - 10)
    expect(game.getDebris()).toHaveLength(1)
    expect(game.getBlocks().has('2,0')).toBe(false)
    settle(game)
    expect(game.getBlocks().get('2,0')?.typeId).toBe('wood')
    const landed = game.getBlocks().get('2,0')!
    // A gentle fall: full health, no fall damage.
    expect(landed.hp).toBe(landed.maxHp)
  })

  it('stacks a second drop on the first, even mid-air', async () => {
    const { game } = await load()
    rich(game)
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    expect(game.dropOffer(0, -2)).toBe(true)
    game.offers.value = ['b_archer', 'b_archer', 'b_wood']
    // The first is still falling: the column already counts it.
    expect(game.columnTop(-2)).toBe(0)
    expect(game.dropOffer(0, -2)).toBe(true)
    settle(game)
    expect(game.getBlocks().get('-2,0')?.typeId).toBe('wood')
    expect(game.getBlocks().get('-2,1')?.typeId).toBe('archer')
  })

  it('refuses a full column without charging', async () => {
    const { game, BOARD_MAX_ROW } = await load()
    rich(game)
    for (let r = 0; r <= BOARD_MAX_ROW; r++) expect(game.placeBlock('stone', 2, r)).toBe(true)
    expect(game.canDropAt(2)).toBe(false)
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    const before = game.wood.value
    expect(game.dropOffer(0, 2)).toBe(false)
    expect(game.wood.value).toBe(before)
  })

  it('refuses a column off the board', async () => {
    const { game } = await load()
    rich(game)
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    expect(game.canDropAt(3)).toBe(false)
    expect(game.dropOffer(0, 3)).toBe(false)
  })

  it('drops a two-tall perch bottom cell first', async () => {
    const { game } = await load()
    rich(game)
    game.offers.value = ['b_wood', 'perchArcher', 'b_wood']
    expect(game.dropOffer(1, 1)).toBe(true)
    settle(game)
    expect(game.getBlocks().get('1,0')?.typeId).toBe('wood')
    expect(game.getBlocks().get('1,1')?.typeId).toBe('archer')
  })

  it('writes the snapshot only once the piece has landed', async () => {
    const { game } = await load()
    const state = await import('@/use/useTowerState')
    rich(game)
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    game.dropOffer(0, 2)
    settle(game)
    const snap = state.getState<{ rules?: string; blocks: unknown[][] }>('ts_m2_run')
    expect(snap?.rules).toBe('dropmerge')
    expect(snap?.blocks.some((b) => b[0] === 2 && b[1] === 0)).toBe(true)
    expect(state.getState('ts_run')).toBeUndefined()
    expect(game.hasSavedRun()).toBe(true)
  })
})

describe('landing merge', () => {
  it('fuses a dropped block DOWN into its twin', async () => {
    const { game } = await load()
    rich(game)
    game.placeBlock('wood', 2, 0)
    const wall = game.getBlocks().get('2,0')!
    const baseHp = wall.maxHp
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    game.dropOffer(0, 2)
    settle(game)
    expect(game.getBlocks().has('2,1')).toBe(false)
    const fused = game.getBlocks().get('2,0')!
    expect(fused.tier).toBe(2)
    expect(fused.maxHp).toBe(baseHp * 2)
    expect(fused.hp).toBe(fused.maxHp)
  })

  it('cascades down a column of twins', async () => {
    const { game } = await load()
    rich(game)
    game.placeBlock('wood', -2, 0)
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    game.dropOffer(0, -2)
    settle(game) // tier 2
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    game.dropOffer(0, -2)
    settle(game) // tier 1 on a tier 2 — no merge
    expect(game.getBlocks().get('-2,0')?.tier).toBe(2)
    expect(game.getBlocks().get('-2,1')?.tier ?? 1).toBe(1)
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    game.dropOffer(0, -2)
    settle(game) // tier 1 + tier 1 → tier 2, then tier 2 + tier 2 → tier 3
    expect(game.getBlocks().has('-2,1')).toBe(false)
    expect(game.getBlocks().get('-2,0')?.tier).toBe(3)
  })

  // Sideways fusion. Two mortars that end up shoulder to shoulder are as
  // obviously a pair as two stacked ones.
  it('fuses a landed block SIDEWAYS into the twin beside it', async () => {
    const { game } = await load()
    rich(game)
    game.placeBlock('wood', -1, 0)
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    expect(game.dropOffer(0, -2)).toBe(true)
    settle(game)
    // The crate that was already standing is the longest-living of the two,
    // so it is the one that keeps its cell.
    expect(game.getBlocks().get('-1,0')?.tier).toBe(2)
    expect(game.getBlocks().has('-2,0')).toBe(false)
  })

  it('fuses sideways in either direction', async () => {
    const { game } = await load()
    rich(game)
    game.placeBlock('wood', 1, 0)
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    expect(game.dropOffer(0, 2)).toBe(true)
    settle(game)
    expect(game.getBlocks().get('1,0')?.tier).toBe(2)
    expect(game.getBlocks().has('2,0')).toBe(false)
  })

  it('cascades out of a DOWN weld into the SIDEWAYS one it creates', async () => {
    const { game } = await load()
    rich(game)
    game.placeBlock('wood', -1, 0)
    const anchor = game.getBlocks().get('-1,0')!.uid
    // Fuses sideways on landing: the anchor goes to tier 2 and −2 empties.
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    game.dropOffer(0, -2)
    settle(game)
    expect(game.getBlocks().get('-1,0')?.tier).toBe(2)
    // A tier 1 beside a tier 2 is not a pair, so this one just stands there.
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    game.dropOffer(0, -2)
    settle(game)
    expect(game.getBlocks().get('-2,0')?.tier ?? 1).toBe(1)
    // This one welds DOWN into it — and the tier 2 that makes is now a twin
    // of the anchor, so the same landing carries on sideways.
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    game.dropOffer(0, -2)
    settle(game)
    expect(game.getBlocks().get('-1,0')?.tier).toBe(3)
    expect(game.getBlocks().get('-1,0')?.uid).toBe(anchor)
    expect(game.getBlocks().has('-2,0')).toBe(false)
  })

  it('carries wounds across the weld', async () => {
    const { game } = await load()
    rich(game)
    game.placeBlock('wood', 2, 0)
    const wall = game.getBlocks().get('2,0')!
    game.damageBlockForTest(wall, 20)
    const missing = wall.maxHp - wall.hp
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    game.dropOffer(0, 2)
    settle(game)
    const fused = game.getBlocks().get('2,0')!
    expect(fused.tier).toBe(2)
    expect(fused.maxHp - fused.hp).toBe(missing)
  })

  it('never fuses into the Gate', async () => {
    const { game } = await load()
    const { canMergeBlocks } = await import('@/game/blocks')
    expect(canMergeBlocks({ typeId: 'gate' }, { typeId: 'gate' }, 'all')).toBe(false)
    expect(canMergeBlocks({ typeId: 'wood' }, { typeId: 'wood' }, 'all')).toBe(true)
    // Walls fuse on this board; on the desktop only guns do.
    expect(canMergeBlocks({ typeId: 'wood' }, { typeId: 'wood' })).toBe(false)
    void game
  })

  // The desktop's tier-3 ceiling is a footprint rule — a merged block there
  // keeps the cells its halves stood on. Here the weld always lands in one
  // cell, so there is nothing to cap.
  it('has no tier ceiling: twins keep folding past three', async () => {
    const { game } = await load()
    const { canMergeBlocks } = await import('@/game/blocks')
    rich(game)
    // Sixteen walls into one column is a tier-5 weld: 2→3→4→5 as the
    // cascade re-runs on every landing.
    for (let i = 0; i < 16; i++) {
      game.offers.value = ['b_wood', 'b_archer', 'b_wood']
      expect(game.dropOffer(0, -2)).toBe(true)
      settle(game)
    }
    expect(game.getBlocks().get('-2,0')?.tier).toBe(5)
    // Nothing else is left standing in the column: it all folded downward.
    expect(game.getBlocks().has('-2,1')).toBe(false)
    // And the rule the sim asks: a tier-9 pair is still a legal weld here,
    // while the desktop default refuses anything at three.
    expect(canMergeBlocks(
      { typeId: 'wood', tier: 9 }, { typeId: 'wood', tier: 9 }, 'all', Infinity
    )).toBe(true)
    // A ceiling is still expressible, it is just not one this board sets.
    expect(canMergeBlocks(
      { typeId: 'archer', tier: 3 }, { typeId: 'archer', tier: 3 }, 'all', 3
    )).toBe(false)
  })

  it('scales power and hit points with the deeper tiers', async () => {
    const { mergePowerMul, mergeHpMul } = await import('@/game/blocks')
    expect(mergePowerMul(5)).toBe(81)
    expect(mergeHpMul(5)).toBe(16)
  })
})

describe('column support', () => {
  it('holds a block up by the block below it, with no chain to the Gate', async () => {
    const { game } = await load()
    rich(game)
    game.placeBlock('wood', 2, 0)
    game.placeBlock('archer', 2, 1)
    for (let i = 0; i < 30; i++) game.step(TICK)
    expect(game.getBlocks().has('2,1')).toBe(true)
  })

  it('drops the stack one landing when the block under it dies — and fuses twins on the way', async () => {
    const { game } = await load()
    rich(game)
    game.placeBlock('stone', 2, 0)
    game.placeBlock('wood', 2, 1)
    game.placeBlock('wood', 2, 2)
    game.damageBlockForTest(game.getBlocks().get('2,0')!, 9_999)
    settle(game)
    // The two crates fell, the upper landed on the lower: one tier-2 crate.
    expect(game.getBlocks().get('2,0')?.typeId).toBe('wood')
    expect(game.getBlocks().get('2,0')?.tier).toBe(2)
    expect(game.getBlocks().has('2,1')).toBe(false)
    expect(game.getBlocks().has('2,2')).toBe(false)
  })

  it('a settled block lands undamaged', async () => {
    const { game } = await load()
    rich(game)
    game.placeBlock('stone', 1, 0)
    game.placeBlock('archer', 1, 1)
    game.damageBlockForTest(game.getBlocks().get('1,0')!, 9_999)
    settle(game)
    const a = game.getBlocks().get('1,0')!
    expect(a.typeId).toBe('archer')
    expect(a.hp).toBe(a.maxHp)
  })
})

describe('enemies', () => {
  it('divers enter from the sky over the board, walkers from the flanks', async () => {
    const { game, BOARD_MAX_ROW, BOARD_HALF_WIDTH } = await load()
    game.debugSpawn(['bat', 'grunt'])
    const [bat, grunt] = game.getEnemies()
    expect(bat!.y).toBeGreaterThan(BOARD_MAX_ROW + 2)
    expect(Math.abs(bat!.x)).toBeLessThanOrEqual(BOARD_HALF_WIDTH)
    expect(Math.abs(grunt!.x)).toBeGreaterThanOrEqual(6)
  })

  // Placed two cells OFF the frame, as the desktop places them, the opening
  // wave was shot dead by the fort's cannon (range 8.5) before it ever reached
  // a frame barely five cells either side of the Gate: a first session's first
  // monster came on screen fifteen seconds in. Here an enemy stands just inside
  // whatever the zoom currently shows.
  it('stands walkers just inside the edge of the frame, wherever the zoom puts it', async () => {
    const { game } = await load()
    const { enemyDef } = await import('@/game/enemies')
    const inset = enemyDef('grunt').scale * 0.3
    game.setViewSpan(-5.2, 5.2, 12)
    game.debugSpawn(['grunt', 'grunt'])
    const [left, right] = game.getEnemies()
    expect(left!.x).toBeCloseTo(-5.2 + inset, 6)
    expect(right!.x).toBeCloseTo(5.2 - inset, 6)
    // On screen from the first frame: its centre is inside the frame.
    expect(Math.abs(left!.x)).toBeLessThan(5.2)

    // Zoomed further out, the same entrance is further out — it follows the
    // frame, not the tower.
    game.setViewSpan(-8, 8, 16)
    game.debugSpawn(['grunt'])
    expect(game.getEnemies()[2]!.x).toBeCloseTo(-8 + inset, 6)
  })

  it('never stands a walker closer than a cell and a half to the board', async () => {
    const { game, BOARD_HALF_WIDTH } = await load()
    // Tighter than the fit ever gets: the frame's edge is barely past the wall.
    game.setViewSpan(-2.8, 2.8, 9)
    game.debugSpawn(['grunt', 'grunt'])
    for (const e of game.getEnemies()) {
      expect(Math.abs(e.x)).toBeGreaterThanOrEqual(BOARD_HALF_WIDTH + 1.5 - 1e-9)
    }
  })

  it('drops divers in from the top of what the player can see', async () => {
    const { game, BOARD_MAX_ROW } = await load()
    const { enemyDef } = await import('@/game/enemies')
    const inset = enemyDef('bat').scale * 0.3
    game.setViewSpan(-5.2, 5.2, 12)
    game.debugSpawn(['bat'])
    expect(game.getEnemies()[0]!.y).toBeCloseTo(12 - inset, 6)
    game.setViewSpan(-8, 8, 17)
    game.debugSpawn(['bat'])
    expect(game.getEnemies()[1]!.y).toBeCloseTo(17 - inset, 6)

    // Zoomed in over a full column, the top of the frame is inside the
    // tower's own sky — a diver still starts two rows clear of the crown.
    rich(game)
    for (let r = 0; r <= BOARD_MAX_ROW; r++) game.placeBlock('stone', 2, r)
    game.setViewSpan(-3.8, 3.8, 7.5)
    game.debugSpawn(['bat'])
    expect(game.getEnemies()[2]!.y).toBeGreaterThanOrEqual(BOARD_MAX_ROW + 1 + 2 - 1e-9)
  })

  it('leaves the desktop its walk-on entrances, two cells past the frame', async () => {
    vi.resetModules()
    localStorage.clear()
    const game = await import('@/use/useTowerGame')
    game.startRun()
    game.buildClockHeld.value = true
    game.setViewSpan(-5, 5, 12)
    game.debugSpawn(['grunt'])
    expect(game.getEnemies()[0]!.x).toBeCloseTo(-7, 6)
  })

  it('never fields more than ten at once', async () => {
    const { game } = await load()
    rich(game)
    for (let c = -2; c <= 2; c++) if (c !== 0) game.placeBlock('stone', c, 0)
    game.debugSetWave(12)
    game.callWave()
    expect(game.wavePlan().total).toBeGreaterThan(10)
    let peak = 0
    for (let i = 0; i < 60 * 50; i++) {
      game.step(TICK)
      const live = game.getEnemies().filter((e) => e.dying <= 0).length
      if (live > peak) peak = live
      if (game.phase.value !== 'battle') break
    }
    expect(peak).toBeLessThanOrEqual(10)
  })

  it('only ever plans the mobile roster', async () => {
    const { game, rules } = await load()
    for (let w = 1; w <= 24; w++) {
      game.debugSetWave(w)
      const plan = game.previewNextWave()
      for (const o of plan.orders) expect(rules.enemies.roster!.has(o.typeId)).toBe(true)
    }
  })
})

// ─── The sky ────────────────────────────────────────────────────────────────
//
// A portrait screen is mostly sky, and on this board it is the lane the whole
// frame can see coming. It used to carry almost nothing: `airFromWave` was 4,
// but the bat's own `minWave` is 9 and the roster did not override it, so the
// air pool was empty and waves 4-8 fielded no flyers at all.

describe('the sky', () => {
  // Planned at difficulty 1 — a tower on the curve — with exactly the options
  // the game hands the director (`waveOpts`). A tower well BELOW the curve gets
  // smaller waves, and a small wave's air slice may buy no bat at all; that is
  // the director easing off a struggling player, and it is left alone on
  // purpose (see the note on `airShare` in the rules).
  const director = async () => {
    const { game } = await load()
    const { planWave, countAir } = await import('@/game/waves')
    const opts = game.waveOpts()
    return { plan: (w: number) => planWave(w, 1, false, opts), countAir }
  }

  it('fields flyers on every one of the first eight waves', async () => {
    const { plan, countAir } = await director()
    for (let w = 1; w <= 8; w++) {
      expect(countAir(plan(w)), `wave ${w}`).toBeGreaterThan(0)
    }
  })

  it('gives flyers at least a quarter of the first sixteen waves', async () => {
    const { plan, countAir } = await director()
    let air = 0
    let all = 0
    for (let w = 1; w <= 16; w++) {
      const p = plan(w)
      air += countAir(p)
      all += p.total
    }
    // Measured at 30 % when this was written; the desktop-era mix was ~9 %.
    expect(air / all).toBeGreaterThanOrEqual(0.25)
  })

  it('opens with something to watch: wave 1 is more than one monster, and one of them flies', async () => {
    const { game } = await load()
    const { countAir } = await import('@/game/waves')
    // Against the fort a first session actually starts with. The old 60 %
    // opening against it was ONE grunt, shot dead before it reached the frame.
    expect(game.seedScriptedOpening()).toBe(true)
    const plan = game.previewNextWave()
    expect(plan.wave).toBe(1)
    expect(plan.total).toBeGreaterThanOrEqual(2)
    expect(countAir(plan)).toBeGreaterThanOrEqual(1)
  })
})

describe('repair all', () => {
  it('patches every wounded block for gold in the build phase', async () => {
    const { game } = await load()
    rich(game)
    game.placeBlock('wood', 1, 0)
    game.placeBlock('wood', -1, 0)
    game.damageBlockForTest(game.getBlocks().get('1,0')!, 15)
    game.damageBlockForTest(game.getBlocks().get('-1,0')!, 15)
    expect(game.repairAllCost()).toBeGreaterThan(0)
    expect(game.repairAll()).toBe(true)
    expect(game.getBlocks().get('1,0')!.hp).toBe(game.getBlocks().get('1,0')!.maxHp)
    expect(game.repairAllCost()).toBe(0)
    expect(game.repairAll()).toBe(false)
  })
})

describe('abilities', () => {
  it('has no third speed rung, no paid rung at all, and no cavalry', async () => {
    // Two rungs, and both are free — this board gives the nudge away and never
    // sells fast-forward. A grant asked for the tower game's 3x snaps DOWN to
    // the fastest rung this ladder actually has rather than setting a speed no
    // segment on the switch can select.
    const { game } = await load()
    game.grantSpeedBuff(3)
    expect(game.gameSpeed.value).toBe(1.5)
    expect(game.setGameSpeed(3)).toBe(false)
    expect(game.setGameSpeed(2)).toBe(false)
    expect(game.setGameSpeed(1.5)).toBe(true)
    expect(game.needsSpeedBuff(1.5)).toBe(false)
    game.toggleSpeed()
    expect(game.gameSpeed.value).toBe(1)
    expect(game.summonCavalry()).toBe(false)
  })
})

describe('blueprints', () => {
  it('has no rank ceiling — only a compounding price', async () => {
    await load()
    const { TECH_NODES_DROPMERGE } = await import('@/mobile-fit/tech')
    const { UNCAPPED, techCost, isUnlockNode } = await import('@/game/tech')
    const ranks = TECH_NODES_DROPMERGE.filter((n) => !isUnlockNode(n.id, TECH_NODES_DROPMERGE))
    expect(ranks.length).toBe(5)
    for (const n of ranks) expect(n.maxLevel).toBe(UNCAPPED)

    // The ladder never runs out …
    const bolts = 'm2_sharpBolts'
    expect(techCost(bolts, 40, TECH_NODES_DROPMERGE)).toBeLessThan(Infinity)
    // … it just gets steep. Half price on the first rank, then compounding.
    expect(techCost(bolts, 0, TECH_NODES_DROPMERGE)).toBe(20)
    expect(techCost(bolts, 4, TECH_NODES_DROPMERGE)).toBe(114)
    expect(techCost(bolts, 9, TECH_NODES_DROPMERGE)).toBe(424)
    expect(techCost(bolts, 19, TECH_NODES_DROPMERGE)).toBe(5_850)
    expect(techCost(bolts, 29, TECH_NODES_DROPMERGE)).toBe(80_620)
    // Every step is dearer than the last, all the way up.
    for (const lvl of [1, 7, 12, 21, 33]) {
      expect(techCost(bolts, lvl + 1, TECH_NODES_DROPMERGE))
        .toBeGreaterThan(techCost(bolts, lvl, TECH_NODES_DROPMERGE))
    }
    // An unlock is still a one-off.
    expect(techCost('m2_brace', 1, TECH_NODES_DROPMERGE)).toBe(Infinity)
  })

  it('keeps buying ranks past the old cap of five', async () => {
    const { game } = await load()
    const progressMod = await import('@/use/useTowerProgress')
    const progress = progressMod.default()
    progress.coins.value = 500_000
    // Sharp Bolts sits behind Foundations since the strip was re-ordered.
    expect(progress.buyTech('m2_foundations')).toBe(true)
    // Five was the ceiling; the twelfth rank proves the ladder is open.
    for (let i = 1; i <= 12; i++) {
      expect(progress.buyTech('m2_sharpBolts')).toBe(true)
      expect(progress.levelOf('m2_sharpBolts')).toBe(i)
    }
    // +8 % damage a rank, compounding through the shared multiplier.
    expect(progressMod.damageMul.value).toBeCloseTo(1 + 0.08 * 12)
    void game
  })

  it('buys cards in order, on its own key, without touching the desktop tree', async () => {
    const { game } = await load()
    const progressMod = await import('@/use/useTowerProgress')
    const state = await import('@/use/useTowerState')
    const progress = progressMod.default()
    progress.coins.value = 500
    // Foundations leads the strip; everything else waits its turn.
    expect(progress.isUnlocked('m2_foundations')).toBe(true)
    expect(progress.isUnlocked('m2_sharpBolts')).toBe(false)
    expect(progress.buyTech('m2_sharpBolts')).toBe(false)
    expect(progress.buyTech('m2_foundations')).toBe(true)
    expect(progress.levelOf('m2_foundations')).toBe(1)
    // The first rank is front-loaded: +50 % block HP on its own.
    expect(progressMod.blockHpMul.value).toBeCloseTo(1.5)
    expect(progress.isUnlocked('m2_sharpBolts')).toBe(true)
    expect(progress.isUnlocked('m2_brace')).toBe(false)
    expect(progress.buyTech('m2_sharpBolts')).toBe(true)
    expect(progressMod.damageMul.value).toBeCloseTo(1.08)
    expect(progress.isUnlocked('m2_brace')).toBe(true)
    const levels = state.getState<{ levels: Record<string, number> }>('ts_m2_tech')?.levels
    expect(levels?.m2_foundations).toBe(1)
    expect(levels?.m2_sharpBolts).toBe(1)
    expect(state.getState('ts_tech')).toBeUndefined()
    void game
  })

  it('gates the lumber hut behind its card and keeps the desktop-only blocks out', async () => {
    const { game } = await load()
    const progressMod = await import('@/use/useTowerProgress')
    const available = progressMod.availableBlocks
    expect(available.value.has('wood')).toBe(true)
    expect(available.value.has('cannon')).toBe(true)
    expect(available.value.has('lumberHut')).toBe(false)
    expect(available.value.has('mortar')).toBe(false)
    expect(available.value.has('skiff')).toBe(false)
    void game
  })
})

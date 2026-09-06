import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ENEMY_DEFS } from '@/game/enemies'

// The simulation is a module-level singleton (project convention), so each test
// re-imports it fresh to get a clean tower.
const loadGame = async () => {
  vi.resetModules()
  localStorage.clear()
  return import('@/use/useTowerGame')
}

/** Run the fixed-step sim for `ms` of simulated time. */
const advance = (g: { step: (ms: number) => void }, ms: number): void => {
  for (let t = 0; t < ms; t += 16) g.step(16)
}

/** Call one wave and hold the field clear until the sim returns to build. */
const clearOneWave = (g: {
  step: (ms: number) => void
  callWave: () => void
  getEnemies: () => unknown[]
  phase: { value: string }
}): void => {
  g.callWave()
  for (let t = 0; t < 120_000; t += 16) {
    g.getEnemies().length = 0
    g.step(16)
    if (g.phase.value === 'build') return
  }
  throw new Error('wave never cleared')
}

const stocked = async () => {
  const g = await loadGame()
  g.startRun()
  // These are BUILD-phase skills, and the opening wave now calls itself three
  // seconds in — a repair cooldown is longer than that, so the clock is frozen
  // rather than raced. Every wave in this file is called explicitly.
  g.buildClockHeld.value = true
  g.wood.value = 9999
  g.stone.value = 9999
  g.runCoins.value = 9999
  return g
}

beforeEach(() => {
  localStorage.clear()
})

describe('field repair', () => {
  it('prices off the ceiling, not the wound', async () => {
    const g = await stocked()
    g.placeBlock('stone', 1, 0)
    const b = g.getBlocks().get('1,0')!
    expect(g.repairCostAt(1, 0)).toBe(Math.ceil(b.maxHp / g.REPAIR_HP_PER_GOLD))
  })

  it('refuses a block that is already whole', async () => {
    const g = await stocked()
    g.placeBlock('stone', 1, 0)
    expect(g.canRepairBlock(1, 0)).toBe(false)
    expect(g.repairBlock(1, 0)).toBe(false)
  })

  it('patches a wounded block to full and charges run gold', async () => {
    const g = await stocked()
    g.placeBlock('stone', 1, 0)
    const b = g.getBlocks().get('1,0')!
    b.hp = 1
    const purse = g.runCoins.value
    const price = g.repairCostAt(1, 0)

    expect(g.repairBlock(1, 0)).toBe(true)
    expect(b.hp).toBe(b.maxHp)
    expect(g.runCoins.value).toBe(purse - price)
  })

  it('locks that block out for the cooldown, and only that block', async () => {
    const g = await stocked()
    g.placeBlock('stone', 1, 0)
    g.placeBlock('stone', 2, 0)
    const a = g.getBlocks().get('1,0')!
    const b = g.getBlocks().get('2,0')!
    a.hp = 1
    b.hp = 1

    expect(g.repairBlock(1, 0)).toBe(true)
    a.hp = 1
    expect(g.canRepairBlock(1, 0)).toBe(false)
    expect(g.repairWaitAt(1, 0)).toBeGreaterThan(0)
    // The lockout is per block — the wall next door is untouched.
    expect(g.canRepairBlock(2, 0)).toBe(true)

    advance(g, g.REPAIR_COOLDOWN_MS + 200)
    expect(g.repairWaitAt(1, 0)).toBe(0)
    expect(g.canRepairBlock(1, 0)).toBe(true)
  })

  it('refuses when the purse is short', async () => {
    const g = await stocked()
    g.placeBlock('stone', 1, 0)
    g.getBlocks().get('1,0')!.hp = 1
    g.runCoins.value = g.repairCostAt(1, 0) - 1
    expect(g.canRepairBlock(1, 0)).toBe(false)
    expect(g.repairBlock(1, 0)).toBe(false)
  })
})

describe('arrow rain', () => {
  it('starts a run ready', async () => {
    const g = await stocked()
    expect(g.arrowRainReady.value).toBe(true)
  })

  it('kills air enemies outright inside the zone and spares those outside', async () => {
    const g = await stocked()
    g.callWave()
    const def = ENEMY_DEFS.bombardier ?? Object.values(ENEMY_DEFS).find((d) => d.movement === 'air')!
    const enemies = g.getEnemies()
    enemies.length = 0
    const mk = (uid: number, x: number) => ({
      uid, typeId: def.id, x, y: 6, hp: def.hp, maxHp: def.hp,
      dir: 1 as const, cd: 999_999, targetUid: -1, slowMs: 0, slowPct: 0,
      flash: 0, phase: 0, dying: 0
    })
    enemies.push(mk(70_001, 0))
    enemies.push(mk(70_002, g.ARROW_RAIN_RADIUS + 4))

    expect(g.callArrowRain(0)).toBe(true)
    expect(enemies[0]!.hp).toBe(0)
    // Outside the beaten zone is outside it — the band edge is a real line.
    expect(enemies[1]!.hp).toBe(def.hp)
  })

  it('wounds a siege engine rather than deleting it', async () => {
    const g = await stocked()
    g.callWave()
    const def = ENEMY_DEFS.trebuchet!
    const enemies = g.getEnemies()
    enemies.length = 0
    enemies.push({
      uid: 70_010, typeId: 'trebuchet', x: -1, y: def.scale / 2,
      hp: def.hp, maxHp: def.hp, dir: 1, cd: 999_999, targetUid: -1,
      slowMs: 0, slowPct: 0, flash: 0, phase: 0, dying: 0
    })

    expect(g.callArrowRain(0)).toBe(true)
    expect(enemies[0]!.hp).toBeLessThan(def.hp)
    // Reaching it is the point; one volley is not supposed to be the answer.
    expect(enemies[0]!.hp).toBeGreaterThan(0)
  })

  it('stops at the first block in a column and shelters what is beneath it', async () => {
    const g = await stocked()
    // A three-high stack. Only the crown is in the open.
    g.placeBlock('stone', 3, 0)
    g.placeBlock('stone', 3, 1)
    g.placeBlock('stone', 3, 2)
    const bottom = g.getBlocks().get('3,0')!
    const middle = g.getBlocks().get('3,1')!
    const crown = g.getBlocks().get('3,2')!
    const full = crown.maxHp

    expect(g.callArrowRain(3)).toBe(true)

    expect(crown.hp).toBeCloseTo(full - full * g.ARROW_RAIN_SELF_PCT, 5)
    // The arrow ends where it hits. Anything under the block it stopped on has
    // no idea the volley happened.
    expect(middle.hp).toBe(middle.maxHp)
    expect(bottom.hp).toBe(bottom.maxHp)
  })

  it('takes the top of every column in the zone, not just one', async () => {
    const g = await stocked()
    g.placeBlock('stone', 2, 0)
    g.placeBlock('stone', 3, 0)
    const a = g.getBlocks().get('2,0')!
    const b = g.getBlocks().get('3,0')!

    expect(g.callArrowRain(2)).toBe(true)
    expect(a.hp).toBeLessThan(a.maxHp)
    expect(b.hp).toBeLessThan(b.maxHp)
  })

  it('charges a wide block once however many arrows land on it', async () => {
    const g = await stocked()
    // A merged 2x1 spans two columns, so two columns' worth of arrows find it.
    g.placeBlock('stone', 1, 0)
    g.placeBlock('stone', 2, 0)
    const blocks = [...g.getTowerBlocks().values()].filter((x) => x.typeId === 'stone')
    const wide = blocks.find((x) => (x.w ?? 1) > 1)
    if (!wide) return // stone does not merge in this build; nothing to assert
    const full = wide.maxHp

    expect(g.callArrowRain(wide.c)).toBe(true)
    // A tenth per BLOCK, not per arrow.
    expect(wide.hp).toBeCloseTo(full - full * g.ARROW_RAIN_SELF_PCT, 5)
  })

  it('passes through everything in the open, at every height', async () => {
    const g = await stocked()
    g.callWave()
    const air = Object.values(ENEMY_DEFS).find((d) => d.movement === 'air')!
    const treb = ENEMY_DEFS.trebuchet!
    const enemies = g.getEnemies()
    enemies.length = 0
    enemies.push({
      uid: 71_001, typeId: air.id, x: 0, y: 8, hp: air.hp, maxHp: air.hp,
      dir: 1, cd: 999_999, targetUid: -1, slowMs: 0, slowPct: 0,
      flash: 0, phase: 0, dying: 0
    })
    enemies.push({
      uid: 71_002, typeId: 'trebuchet', x: 0, y: treb.scale / 2,
      hp: treb.hp, maxHp: treb.hp, dir: 1, cd: 999_999, targetUid: -1,
      slowMs: 0, slowPct: 0, flash: 0, phase: 0, dying: 0
    })

    expect(g.callArrowRain(0)).toBe(true)
    // The flyer dying overhead must not consume the shaft that killed it.
    expect(enemies[0]!.hp).toBe(0)
    expect(enemies[1]!.hp).toBeLessThan(treb.hp)
  })

  it('never kills the player’s own block outright', async () => {
    const g = await stocked()
    g.placeBlock('wood', 3, 0)
    const b = g.getBlocks().get('3,0')!
    b.hp = 1
    expect(g.callArrowRain(3)).toBe(true)
    expect(b.hp).toBeGreaterThan(0)
  })

  it('spends the charge and refuses a second volley', async () => {
    const g = await stocked()
    expect(g.callArrowRain(0)).toBe(true)
    expect(g.arrowRainReady.value).toBe(false)
    expect(g.callArrowRain(0)).toBe(false)
  })

  it('refills a third per cleared wave, ready again on the third', async () => {
    const g = await stocked()
    g.placeBlock('stone', 1, 0)
    expect(g.callArrowRain(6)).toBe(true)
    expect(g.arrowRainStock.value).toBe(0)

    for (let i = 1; i <= g.ARROW_RAIN_WAVES; i++) {
      // Clear a wave the honest way: call it, then hold the field empty until
      // the sim drops back into build. Stepping a flat span instead would run
      // the build timer out and auto-call the NEXT wave, so the loop would be
      // counting something other than the waves it thinks it is.
      clearOneWave(g)
      expect(g.arrowRainStock.value, `after wave ${i}`).toBe(i)
      if (i < g.ARROW_RAIN_WAVES) {
        expect(g.arrowRainReady.value, `after wave ${i}`).toBe(false)
      }
    }
    expect(g.arrowRainReady.value).toBe(true)
    expect(g.arrowRainCharge.value).toBe(1)
  })
})

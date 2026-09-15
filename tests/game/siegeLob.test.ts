import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ENEMY_DEFS } from '@/game/enemies'
import { isFlamingSiege, PITCH_WAVE } from '@/use/useTowerGame'

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

/**
 * A tower with a wall out to the left, and one trebuchet parked at its standoff
 * with a spent cooldown so it shoots on the first tick.
 */
const siegedTower = async () => {
  const g = await loadGame()
  g.startRun()
  // Pinned to 1x. Every budget below is quoted in milliseconds against the
  // engine's own reload ("well short of the reload — so exactly one stone has
  // been thrown"), and `step` multiplies its delta by `gameSpeed` during a
  // battle — so at the 1.5x a run now OPENS on, 3000 ms of stepping is 4500 ms
  // of siege and the trebuchet has thrown twice. What is under test here is the
  // flight of one stone, not the rung the player is watching it at.
  g.setGameSpeed(1)
  g.wood.value = 9999
  g.stone.value = 9999
  for (let c = -3; c <= -1; c++) {
    for (let r = 0; r <= 1; r++) g.placeBlock('stone', c, r)
  }
  g.callWave()

  const def = ENEMY_DEFS.trebuchet!
  const enemies = g.getEnemies()
  enemies.length = 0
  enemies.push({
    uid: 91_001,
    typeId: 'trebuchet',
    // Inside its standoff, so it sets up and fires instead of walking in.
    x: -(def.siege!.standoff! - 2),
    y: def.scale / 2,
    hp: def.hp,
    maxHp: def.hp,
    dir: 1,
    cd: 0,
    targetUid: -1,
    slowMs: 0,
    slowPct: 0,
    flash: 0,
    phase: 0,
    dying: 0
  })
  return { g, def }
}

const towerHp = (g: { getTowerBlocks: () => Map<number, { hp: number }> }): number => {
  let hp = 0
  for (const b of g.getTowerBlocks().values()) hp += b.hp
  return hp
}

beforeEach(() => {
  localStorage.clear()
})

describe('a trebuchet throws a stone that has to travel', () => {
  it('puts a real round in the air instead of damaging the tower on the spot', async () => {
    const { g } = await siegedTower()
    const before = towerHp(g)

    // One tick past the cooldown: the shot has been taken, and the only thing
    // that should have happened is that a stone left the machine.
    advance(g, 48)

    const inFlight = g.getProjectiles()
    expect(inFlight).toHaveLength(1)
    expect(inFlight[0]!.hostile).toBe(true)
    expect(inFlight[0]!.ballistic).toBe(true)
    // This is the regression. The blast used to bloom on the target the frame
    // the cooldown elapsed, with nothing crossing the ten cells in between.
    expect(towerHp(g)).toBe(before)
  })

  it('arcs — rising before it falls, rather than flying flat at the wall', async () => {
    const { g } = await siegedTower()
    advance(g, 48)

    const stone = g.getProjectiles()[0]!
    const launchY = stone.y
    let peak = launchY
    for (let i = 0; i < 120 && g.getProjectiles().length > 0; i++) {
      advance(g, 16)
      const live = g.getProjectiles()[0]
      if (live) peak = Math.max(peak, live.y)
    }
    // A lob, not a bolt: it must clear its own launch height on the way over.
    expect(peak).toBeGreaterThan(launchY + 1)
  })

  it('still lands, and still hurts the tower it was aimed at', async () => {
    const { g, def } = await siegedTower()
    const before = towerHp(g)

    // Comfortably longer than the longest flight the lob can pick, but well
    // short of the reload — so exactly one stone has been thrown.
    advance(g, 3000)

    expect(g.getProjectiles()).toHaveLength(0)
    expect(towerHp(g)).toBeLessThan(before)
    // It hits about as hard as it is specified to. The splash is wide enough to
    // catch several blocks, so this is a floor rather than an equality.
    expect(before - towerHp(g)).toBeGreaterThanOrEqual(def.damage * 0.5)
  })

  it('does not let a wave finish while its stone is still in the air', async () => {
    const { g } = await siegedTower()
    advance(g, 48)
    expect(g.getProjectiles()).toHaveLength(1)

    // Kill the thrower mid-flight. The round it already loosed is still a real
    // object in the world, and the build phase must not open under it.
    const enemies = g.getEnemies()
    enemies.length = 0

    advance(g, 32)
    expect(g.phase.value).toBe('battle')
  })
})

describe('a catapult throws too, and lights its shot late', () => {
  it('lobs a real boulder instead of resolving on the spot', async () => {
    const g = await loadGame()
    g.startRun()
    g.wood.value = 9999
    g.stone.value = 9999
    for (let c = -3; c <= -1; c++) g.placeBlock('stone', c, 0)
    g.callWave()

    const def = ENEMY_DEFS.catapult!
    const enemies = g.getEnemies()
    enemies.length = 0
    enemies.push({
      uid: 93_001, typeId: 'catapult', x: -(def.siege!.standoff! - 2),
      y: def.scale / 2, hp: def.hp, maxHp: def.hp, dir: 1, cd: 0,
      targetUid: -1, slowMs: 0, slowPct: 0, flash: 0, phase: 0, dying: 0
    })

    let hp = 0
    for (const b of g.getTowerBlocks().values()) hp += b.hp
    advance(g, 48)

    expect(g.getProjectiles()).toHaveLength(1)
    expect(g.getProjectiles()[0]!.hostile).toBe(true)
    let after = 0
    for (const b of g.getTowerBlocks().values()) after += b.hp
    expect(after).toBe(hp)
  })

  it('throws rock before the pitch wave and fire after it', async () => {
    const def = ENEMY_DEFS.catapult!
    expect(isFlamingSiege(def, PITCH_WAVE - 1)).toBe(false)
    expect(isFlamingSiege(def, PITCH_WAVE)).toBe(true)
    // The trebuchet keeps throwing masonry — one engine changing round is a
    // thing the player can learn; both changing at once is just "wave 30 hurts".
    expect(isFlamingSiege(ENEMY_DEFS.trebuchet!, PITCH_WAVE + 5)).toBe(false)
  })

  it('sets a pitch round alight, and leaves what it hits burning', async () => {
    const g = await loadGame()
    g.startRun()
    g.wood.value = 9999
    g.stone.value = 9999
    g.placeBlock('stone', -2, 0)
    // Straight to the wave the crews switch ammunition on.
    g.debugSetWave(PITCH_WAVE)
    g.callWave()

    const def = ENEMY_DEFS.catapult!
    const enemies = g.getEnemies()
    enemies.length = 0
    enemies.push({
      uid: 93_002, typeId: 'catapult', x: -(def.siege!.standoff! - 2),
      y: def.scale / 2, hp: def.hp, maxHp: def.hp, dir: 1, cd: 0,
      targetUid: -1, slowMs: 0, slowPct: 0, flash: 0, phase: 0, dying: 0
    })
    advance(g, 48)

    const round = g.getProjectiles()[0]!
    expect(round.kind).toBe('fire')
    expect(round.burnMs).toBeGreaterThan(0)
    expect(round.burnDps).toBeGreaterThan(0)
  })
})

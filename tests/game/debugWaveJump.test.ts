import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ENEMY_DEFS } from '@/game/enemies'

// The simulation is a module-level singleton (project convention), so each test
// re-imports it fresh to get a clean tower.
const loadGame = async () => {
  vi.resetModules()
  localStorage.clear()
  return import('@/use/useTowerGame')
}

beforeEach(() => {
  localStorage.clear()
})

describe('the wave-jump cheat', () => {
  it('lands the NEXT called wave on the number asked for', async () => {
    const g = await loadGame()
    g.startRun()

    g.debugSetWave(15)
    // `wave` counts waves SURVIVED, so a build phase before wave 15 reads 14 —
    // exactly what the HUD shows after clearing wave 14 the honest way.
    expect(g.wave.value).toBe(14)
    expect(g.isBossIncoming.value).toBe(false)

    g.callWave()
    expect(g.wave.value).toBe(15)
  })

  it('lines the boss banner up with the wave it jumped to', async () => {
    const g = await loadGame()
    g.startRun()
    g.debugSetWave(20)
    // Wave 20 is a boss wave, and the warning has to say so BEFORE it is called
    // — that is the whole reason to jump to it.
    expect(g.isBossIncoming.value).toBe(true)
  })

  it('opens a build phase to meet the wave in', async () => {
    const g = await loadGame()
    g.startRun()
    g.callWave()
    expect(g.phase.value).toBe('battle')

    g.debugSetWave(12)
    expect(g.phase.value).toBe('build')
    expect(g.buildTimeLeft.value).toBeGreaterThan(0)
  })

  it('clears the field, so the old horde does not walk into the new wave', async () => {
    const g = await loadGame()
    g.startRun()
    g.callWave()
    g.debugSpawn(['ram', 'ram', 'trebuchet'])
    expect(g.getEnemies().length).toBeGreaterThan(0)

    g.debugSetWave(18)
    expect(g.getEnemies()).toHaveLength(0)
    expect(g.getProjectiles()).toHaveLength(0)
    expect(g.enemiesLeft.value).toBe(0)
  })

  it('leaves the tower and the purse exactly as they were', async () => {
    const g = await loadGame()
    g.startRun()
    g.wood.value = 400
    g.stone.value = 300
    g.runCoins.value = 77
    // Build FIRST, then snapshot: placing spends, and the point of this test is
    // what the jump itself changes.
    g.placeBlock('stone', 1, 0)
    g.placeBlock('stone', 2, 0)
    const blocks = g.getTowerBlocks().size
    const purse = { wood: g.wood.value, stone: g.stone.value, coins: g.runCoins.value }

    g.debugSetWave(22)

    // The jump is not a simulation of twenty-two waves of play. Faking a tower
    // to go with the wave would make it useless for the thing it exists for:
    // finding out what wave 22 does to THIS defence.
    expect(g.getTowerBlocks().size).toBe(blocks)
    expect(g.wood.value).toBe(purse.wood)
    expect(g.stone.value).toBe(purse.stone)
    expect(g.runCoins.value).toBe(purse.coins)
  })

  it('deals a hand the target wave can actually use', async () => {
    const g = await loadGame()
    g.startRun()
    g.debugSetWave(20)
    // The deck is wave-gated; without a re-deal the player meets wave 20
    // holding wave 1's hand.
    expect(g.offers.value.filter(Boolean).length).toBe(g.offers.value.length)
  })

  it('clamps a nonsense target to the first wave', async () => {
    const g = await loadGame()
    g.startRun()
    g.debugSetWave(0)
    expect(g.wave.value).toBe(0)
    g.debugSetWave(-40)
    expect(g.wave.value).toBe(0)
  })

  it('survives a jump taken while a trebuchet stone is in the air', async () => {
    const g = await loadGame()
    g.startRun()
    g.wood.value = 9999
    g.stone.value = 9999
    g.placeBlock('stone', -2, 0)
    g.callWave()

    const def = ENEMY_DEFS.trebuchet!
    const enemies = g.getEnemies()
    enemies.length = 0
    enemies.push({
      uid: 92_001, typeId: 'trebuchet', x: -(def.siege!.standoff! - 2),
      y: def.scale / 2, hp: def.hp, maxHp: def.hp, dir: 1, cd: 0,
      targetUid: -1, slowMs: 0, slowPct: 0, flash: 0, phase: 0, dying: 0
    })
    for (let t = 0; t < 48; t += 16) g.step(16)
    expect(g.getProjectiles().length).toBeGreaterThan(0)

    g.debugSetWave(9)
    // A round left over from the wave that was abandoned must not land on the
    // tower two waves later, nor hold the next wave-clear check open forever.
    expect(g.getProjectiles()).toHaveLength(0)
    expect(g.phase.value).toBe('build')
  })
})

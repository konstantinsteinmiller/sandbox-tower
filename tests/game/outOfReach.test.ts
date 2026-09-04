import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ENEMY_DEFS } from '@/game/enemies'
import { BLOCK_DEFS } from '@/game/blocks'
import { countOutranged, deepestStandoff, planWave } from '@/game/waves'

// ─── Outranged siege ────────────────────────────────────────────────────────
//
// The rage-quit these rules exist to remove: a trebuchet parks at twelve cells,
// every gun on the tower fires at nothing, and the player has neither a reason
// to expect it nor an affordable answer to it. Three guarantees are asserted
// here, because each one is invisible from the others:
//
//   1. the wave director can be ASKED, before the wave, how much of it stands
//      beyond a given reach;
//   2. a sortie is FREE exactly while the field holds an engine no gun reaches
//      and no rider is already out — it cannot be farmed and cannot strand;
//   3. the paid reach extension is big enough to answer the deepest engine in
//      the game from the shallowest tower a player can arrive with.

const loadGame = async () => {
  vi.resetModules()
  localStorage.clear()
  return import('@/use/useTowerGame')
}

beforeEach(() => {
  localStorage.clear()
})

describe('warning before the wave', () => {
  it('counts the engines in a plan that stand beyond a given reach', () => {
    const plan = planWave(24, 1, false)
    const deepest = deepestStandoff(plan)
    // Nothing is outranged by a gun that reaches further than the deepest
    // engine in the plan; everything with a standoff is outranged by nothing.
    expect(countOutranged(plan, deepest)).toBe(0)
    expect(countOutranged(plan, 0)).toBeGreaterThanOrEqual(countOutranged(plan, deepest))
  })

  it('reports a reach a real weapon can actually be bought up to', () => {
    // The chip tells the player what to buy, so the figure has to name a
    // purchase that exists. The Mortar is that purchase for a trebuchet.
    const treb = ENEMY_DEFS.trebuchet!.siege!.standoff!
    expect(BLOCK_DEFS.mortar!.weapon!.range).toBeGreaterThanOrEqual(treb)
  })

  it('leaves waves with no siege at all reporting nothing', () => {
    const plan = planWave(3, 1, false)
    expect(deepestStandoff(plan)).toBe(0)
    expect(countOutranged(plan, 0)).toBe(0)
  })
})

describe('free cavalry while the tower cannot answer', () => {
  it('charges nothing while an engine stands beyond every gun', async () => {
    const g = await loadGame()
    g.startRun()
    // An archer-only tower: 7.5 cells, well short of a trebuchet at 12.
    g.wood.value = 500
    g.stone.value = 500
    g.placeBlock('archer', 0, 1)
    g.callWave()
    g.debugSpawn(['trebuchet'])
    // Walk the engine in to its standoff and let the reach scan settle.
    for (let i = 0; i < 400; i++) g.step(16.67)

    expect(g.unreachableSiege.value).toBe(1)
    expect(g.isCavalryFree.value).toBe(true)
  })

  it('stops being free the moment riders are on the field', async () => {
    const g = await loadGame()
    g.startRun()
    g.wood.value = 500
    g.placeBlock('archer', 0, 1)
    g.callWave()
    g.debugSpawn(['trebuchet'])
    for (let i = 0; i < 400; i++) g.step(16.67)
    expect(g.isCavalryFree.value).toBe(true)

    // A second free squad is never granted while the first is alive — that is
    // what stops the mercy rule becoming an infinite army.
    g.summonCavalry()
    expect(g.isCavalryFree.value).toBe(false)
  })

  it('never fires for an engine the tower can already shoot', async () => {
    const g = await loadGame()
    g.startRun()
    g.wood.value = 500
    g.stone.value = 500
    // A ram walks into contact, so nothing about it is ever out of reach.
    g.placeBlock('archer', 0, 1)
    g.callWave()
    g.debugSpawn(['ram'])
    for (let i = 0; i < 400; i++) g.step(16.67)

    expect(g.unreachableSiege.value).toBe(0)
    expect(g.isCavalryFree.value).toBe(false)
  })
})

describe('the paid reach extension', () => {
  it('walks the shortest gun in the game past the deepest engine in it', async () => {
    const g = await loadGame()
    const deepest = Math.max(
      ...Object.values(ENEMY_DEFS).map((d) => d.siege?.standoff ?? 0)
    )
    // The floor case: a player who owns nothing but Archery towers. If the buff
    // does not clear the deepest standoff from THAT tower it has not solved the
    // problem it is sold for.
    expect(BLOCK_DEFS.archer!.weapon!.range * g.RANGE_BUFF_MUL).toBeGreaterThan(deepest)
  })

  it('actually extends what the turrets reach, and clears with the wave', async () => {
    const g = await loadGame()
    g.startRun()
    g.wood.value = 500
    g.placeBlock('archer', 0, 1)
    g.callWave()

    const before = g.bestWeaponReach()
    g.grantRangeBuff()
    expect(g.isRangeBuffed.value).toBe(true)
    expect(g.bestWeaponReach()).toBeCloseTo(before * g.RANGE_BUFF_MUL, 5)

    // Nothing on the field, so the wave completes and takes the buff with it —
    // spotters answer one emergency, they are not a tech rank.
    for (let i = 0; i < 2000 && g.phase.value === 'battle'; i++) g.step(16.67)
    expect(g.phase.value).toBe('build')
    expect(g.isRangeBuffed.value).toBe(false)
    expect(g.bestWeaponReach()).toBeCloseTo(before, 5)
  })

  it('survives a tech recache mid-wave', async () => {
    // Regression guard: the wave-start multiplier cache used to read the bare
    // tech value, so any recache (a rank bought mid-run) silently cancelled a
    // buff the player had just paid for.
    const g = await loadGame()
    g.startRun()
    g.wood.value = 500
    g.placeBlock('archer', 0, 1)
    g.grantRangeBuff()
    const buffed = g.bestWeaponReach()
    g.callWave()
    expect(g.bestWeaponReach()).toBeCloseTo(buffed, 5)
  })
})

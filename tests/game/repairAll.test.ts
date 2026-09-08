import { describe, expect, it, vi } from 'vitest'
import type { Block } from '@/game/types'

/**
 * Repair-All is deliberately NOT all-or-nothing.
 *
 * The button prints the full bill but stays pressable while a single wound is
 * affordable, and the gold then buys the worst wounds it can reach. The specs
 * below pin the two halves of that rule that are easy to break silently: the
 * ORDER (worst wound first, not whatever order the occupancy map iterates in)
 * and the SKIP (a block the leftover gold cannot cover is stepped over, not a
 * wall the walk stops at).
 */

// The simulation is a module-level singleton (project convention), so each test
// re-imports it fresh to get a clean tower.
const loadGame = async () => {
  vi.resetModules()
  localStorage.clear()
  const g = await import('@/use/useTowerGame')
  g.startRun()
  g.wood.value = 9999
  g.stone.value = 9999
  g.runCoins.value = 9999
  return g
}

type Game = Awaited<ReturnType<typeof loadGame>>

const at = (g: Game, c: number, r: number): Block => g.getBlocks().get(`${c},${r}`)!

/**
 * Four crates wounded to prices of 5, 3, 2 and 1 gold.
 *
 * The ceilings are set by hand rather than inherited from the crate's balance
 * numbers: the queue is sorted on the WOUND, so a test that left the ceiling to
 * the current balance pass would silently lose its price gaps the next time a
 * crate's hit points move. The wounds are also deliberately out of placement
 * order, so a walk that never sorted at all would fail rather than pass by
 * accident.
 */
const CELLS: [number, number][] = [[1, 0], [-1, 0], [2, 0], [-2, 0]]
const WOUNDS = [40, 100, 20, 60]
/** Gold each of `CELLS` costs to patch, in the same order. */
const PRICES = [2, 5, 1, 3]
/** `CELLS`, worst wound first — the order the purse must spend in. */
const WORST_FIRST: [number, number][] = [[-1, 0], [-2, 0], [1, 0], [2, 0]]

const woundedTower = (g: Game): void => {
  for (const [c, r] of CELLS) g.placeBlock('wood', c, r)
  CELLS.forEach(([c, r], i) => {
    const b = at(g, c, r)
    b.maxHp = 200
    b.hp = b.maxHp - WOUNDS[i]!
  })
}

const isFull = (g: Game, c: number, r: number): boolean => {
  const b = at(g, c, r)
  return b.hp >= b.maxHp
}

describe('the repair-all plan', () => {
  it('prices every wound and, with a full purse, spends the lot', async () => {
    const g = await loadGame()
    woundedTower(g)
    g.runCoins.value = 500

    const plan = g.repairAllPlan()
    expect(plan.damaged).toBe(4)
    expect(plan.totalCost).toBe(11)
    expect(plan.totalCost).toBe(g.repairAllCost())
    expect(plan.spend).toBe(plan.totalCost)
    expect(plan.repairs).toBe(plan.damaged)

    expect(g.canRepairAll()).toBe(true)
    expect(g.repairAll()).toBe(true)
    for (const [c, r] of CELLS) expect(isFull(g, c, r)).toBe(true)
    expect(g.runCoins.value).toBe(500 - 11)
    expect(g.repairAllCost()).toBe(0)
    expect(g.repairAllPlan()).toEqual({ damaged: 0, totalCost: 0, spend: 0, repairs: 0 })
    expect(g.canRepairAll()).toBe(false)
    expect(g.repairAll()).toBe(false)
  })

  it('reports nothing to do on an undamaged tower', async () => {
    const g = await loadGame()
    g.placeBlock('wood', 1, 0)
    expect(g.repairAllPlan()).toEqual({ damaged: 0, totalCost: 0, spend: 0, repairs: 0 })
    expect(g.canRepairAll()).toBe(false)
    expect(g.repairAll()).toBe(false)
  })

  it('still shows the FULL bill when the purse can only pay part of it', async () => {
    const g = await loadGame()
    woundedTower(g)
    g.runCoins.value = 5

    const plan = g.repairAllPlan()
    expect(plan.totalCost).toBe(11)
    expect(plan.spend).toBe(5)
    expect(plan.repairs).toBe(1)
    expect(plan.damaged).toBe(4)
  })

  it('never mutates — it is read from a computed every frame', async () => {
    const g = await loadGame()
    woundedTower(g)
    g.runCoins.value = 7

    const hpBefore = CELLS.map(([c, r]) => at(g, c, r).hp)
    const versionBefore = g.towerVersion.value
    const first = g.repairAllPlan()
    const second = g.repairAllPlan()

    expect(second).toEqual(first)
    expect(CELLS.map(([c, r]) => at(g, c, r).hp)).toEqual(hpBefore)
    expect(g.runCoins.value).toBe(7)
    expect(g.towerVersion.value).toBe(versionBefore)
  })
})

describe('spending a part-purse', () => {
  it('buys the worst wound first', async () => {
    const g = await loadGame()
    woundedTower(g)
    // Exactly the price of the deepest wound — and of two cheaper ones together,
    // so a walk in the wrong order would also spend it all and still be wrong.
    g.runCoins.value = 5

    expect(g.canRepairAll()).toBe(true)
    expect(g.repairAll()).toBe(true)
    expect(isFull(g, ...WORST_FIRST[0]!)).toBe(true)
    for (const cell of WORST_FIRST.slice(1)) expect(isFull(g, ...cell)).toBe(false)
    expect(g.runCoins.value).toBe(0)
  })

  it('skips a wound it cannot afford and patches a cheaper one further down', async () => {
    const g = await loadGame()
    woundedTower(g)
    // 4 gold: the 5-gold wound is out of reach, the 3-gold one is bought, and
    // the 1-gold scratch is bought with what is left over — the 2-gold wound
    // between them is stepped over, not a wall the walk stops at.
    g.runCoins.value = 4

    const plan = g.repairAllPlan()
    expect(plan.repairs).toBe(2)
    expect(plan.spend).toBe(4)

    expect(g.repairAll()).toBe(true)
    expect(isFull(g, -1, 0)).toBe(false)
    expect(isFull(g, -2, 0)).toBe(true)
    expect(isFull(g, 1, 0)).toBe(false)
    expect(isFull(g, 2, 0)).toBe(true)
    expect(g.runCoins.value).toBe(0)
  })

  it('never spends more than the purse holds, at any purse', async () => {
    for (let purse = 0; purse <= 13; purse++) {
      const g = await loadGame()
      woundedTower(g)
      g.runCoins.value = purse
      const plan = g.repairAllPlan()
      expect(plan.spend).toBeLessThanOrEqual(purse)
      expect(plan.spend).toBeLessThanOrEqual(plan.totalCost)
      expect(g.repairAll()).toBe(plan.repairs > 0)
      expect(g.runCoins.value).toBe(purse - plan.spend)
      expect(g.runCoins.value).toBeGreaterThanOrEqual(0)
    }
  })

  it('breaks a tie on placement order, so the same tower always spends the same way', async () => {
    const g = await loadGame()
    const pair: [number, number][] = [[1, 0], [-1, 0]]
    for (const [c, r] of pair) g.placeBlock('wood', c, r)
    for (const [c, r] of pair) {
      const b = at(g, c, r)
      b.maxHp = 200
      b.hp = b.maxHp - 60
    }
    // Enough for one of the two identical wounds. The older block wins, every time.
    g.runCoins.value = 3

    expect(g.repairAllPlan().repairs).toBe(1)
    expect(g.repairAll()).toBe(true)
    expect(at(g, 1, 0).uid).toBeLessThan(at(g, -1, 0).uid)
    expect(isFull(g, 1, 0)).toBe(true)
    expect(isFull(g, -1, 0)).toBe(false)
  })
})

describe('when repair-all is refused', () => {
  it('is unpressable below the price of the cheapest wound, and changes nothing', async () => {
    const g = await loadGame()
    g.placeBlock('wood', 1, 0)
    const b = at(g, 1, 0)
    b.maxHp = 200
    b.hp = b.maxHp - 100
    g.runCoins.value = 4

    const plan = g.repairAllPlan()
    expect(plan.damaged).toBe(1)
    expect(plan.totalCost).toBe(5)
    expect(plan.spend).toBe(0)
    expect(plan.repairs).toBe(0)

    expect(g.canRepairAll()).toBe(false)
    expect(g.repairAll()).toBe(false)
    expect(b.hp).toBe(100)
    expect(g.runCoins.value).toBe(4)
  })

  it('is refused mid-wave — it would be a "pay to undo the wave" button', async () => {
    const g = await loadGame()
    for (const [c, r] of CELLS) g.placeBlock('wood', c, r)
    g.callWave()
    expect(g.phase.value).toBe('battle')
    // Wounded AFTER the call: starting a wave re-derives the tower's stats.
    CELLS.forEach(([c, r], i) => {
      const b = at(g, c, r)
      b.maxHp = 200
      b.hp = b.maxHp - WOUNDS[i]!
    })
    g.runCoins.value = 500

    expect(g.canRepairAll()).toBe(false)
    expect(g.repairAll()).toBe(false)
    for (const [c, r] of CELLS) expect(isFull(g, c, r)).toBe(false)
    expect(g.runCoins.value).toBe(500)
    // The plan itself is phase-blind: the caption still prints the real bill.
    expect(g.repairAllPlan().totalCost).toBe(11)
  })
})

describe('the wound price', () => {
  it('is a gold per twenty hit points, rounded up, and never free', async () => {
    const g = await loadGame()
    g.placeBlock('wood', 1, 0)
    const b = at(g, 1, 0)
    b.maxHp = 200
    for (const wound of [1, 19, 20, 21, 100]) {
      b.hp = b.maxHp - wound
      expect(g.repairAllCost()).toBe(Math.max(1, Math.ceil(wound / g.REPAIR_HP_PER_GOLD)))
    }
    expect(PRICES).toEqual(WOUNDS.map((w) => Math.ceil(w / g.REPAIR_HP_PER_GOLD)))
  })
})

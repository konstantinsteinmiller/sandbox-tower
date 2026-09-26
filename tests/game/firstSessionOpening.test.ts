import { describe, expect, it, vi } from 'vitest'
import { firstRunBudgetScale, planWave } from '@/game/waves'
import { tierOf } from '@/game/blocks'

/**
 * ─── The first-session scripted opening ─────────────────────────────────────
 *
 * A brand-new player used to meet wave 1 as an empty foundation under a
 * fifteen-second timer, having never been shown what a tower looks like. Two
 * things answer that, and both are only ever on while `ts_onboarded` is false:
 *
 *   1. a free starter fort, seeded onto the foundation, and
 *   2. waves 1-2 priced under the curve.
 *
 * The load-bearing claim is the last test in this file: a player who does
 * NOTHING but call the wave survives it. That is the "one guaranteed win" the
 * whole feature exists to deliver, and it is the only way to know the two
 * numbers above are actually sized for each other.
 */

const loadGame = async () => {
  vi.resetModules()
  localStorage.clear()
  return import('@/use/useTowerGame')
}

/** Mark the player as onboarded BEFORE the module is imported, so the sim's
 *  first-session reads see a veteran. */
const loadVeteranGame = async () => {
  vi.resetModules()
  localStorage.clear()
  localStorage.setItem('sandbox_state', JSON.stringify({ ts_onboarded: true }))
  return import('@/use/useTowerGame')
}

/** Run one wave and stop the moment it is over. Returns false if the run died. */
const playWave = (g: any): boolean => {
  g.callWave()
  for (let t = 0; t < 200_000; t += 16) {
    g.step(16)
    if (g.phase.value === 'defeat') return false
    if (g.phase.value === 'build' && t > 1_000) return true
  }
  return g.phase.value !== 'defeat'
}

describe('first-session opening surcharge', () => {
  it('prices waves 1-2 OVER the curve, and leaves wave 3 on alone', () => {
    // Inverted on 2026-09-14. It was a discount (0.6 / 0.8) until a policy sim
    // showed that every value below 2.4 left a player who BUILT on a flat
    // 100 % Gate for six straight waves — see `FIRST_RUN_SCALE`.
    expect(firstRunBudgetScale(1)).toBeCloseTo(1.6)
    expect(firstRunBudgetScale(2)).toBeCloseTo(1.4)
    expect(firstRunBudgetScale(3)).toBe(1)
    expect(firstRunBudgetScale(12)).toBe(1)
  })

  it('eases OFF rather than on — wave 1 is the one that bites', () => {
    // The ramp direction is the design, not an accident of two numbers: the
    // surcharge is heaviest before the player has a tower and lifts as they
    // build one.
    expect(firstRunBudgetScale(1)).toBeGreaterThan(firstRunBudgetScale(2))
    expect(firstRunBudgetScale(2)).toBeGreaterThan(firstRunBudgetScale(3))
  })

  it('sends MORE enemies on the opening waves', () => {
    expect(planWave(1, 1, true).total).toBeGreaterThan(planWave(1, 1, false).total)
    expect(planWave(2, 1, true).total).toBeGreaterThan(planWave(2, 1, false).total)
  })

  it('leaves everything from wave 3 on exactly as it was', () => {
    for (const w of [3, 5, 9, 12, 20]) {
      expect(planWave(w, 1, true).orders).toEqual(planWave(w, 1, false).orders)
    }
  })

  it('stays deterministic — the surcharged wave is still the same wave twice', () => {
    expect(planWave(1, 1, true).orders).toEqual(planWave(1, 1, true).orders)
  })

  it('is off by default, so nothing outside the first session sees it', () => {
    expect(planWave(1).orders).toEqual(planWave(1, 1, false).orders)
  })
})

describe('the free starter fort', () => {
  it('puts a wall either side of the Gate and a cannon on top of it', async () => {
    const g = await loadGame()
    g.startRun()
    expect(g.seedScriptedOpening()).toBe(true)

    const blocks = g.getBlocks()
    expect(blocks.size).toBe(4)
    expect(blocks.get('-1,0')?.typeId).toBe('wood')
    expect(blocks.get('1,0')?.typeId).toBe('wood')
    expect(blocks.get('0,1')?.typeId).toBe('cannon')
  })

  it('is free — it costs the player no resources', async () => {
    const g = await loadGame()
    g.startRun()
    const woodBefore = g.wood.value
    const stoneBefore = g.stone.value
    g.seedScriptedOpening()
    expect(g.wood.value).toBe(woodBefore)
    expect(g.stone.value).toBe(stoneBefore)
  })

  it('does not count towards blocks the PLAYER placed', async () => {
    const g = await loadGame()
    g.startRun()
    g.seedScriptedOpening()
    // Missions and lifetime achievements read this; the player placed nothing.
    expect(g.runSummary().blocksPlaced).toBe(0)
  })

  it('refuses to seed anything but a bare foundation', async () => {
    const g = await loadGame()
    g.startRun()
    expect(g.seedScriptedOpening()).toBe(true)
    // A second call would drop blocks into cells the player may have built on.
    expect(g.seedScriptedOpening()).toBe(false)
    expect(g.getBlocks().size).toBe(4)
  })

  it('survives a reload — the fort is in the run snapshot', async () => {
    const g = await loadGame()
    g.startRun()
    g.seedScriptedOpening()

    const g2 = await import('@/use/useTowerGame')
    expect(g2.resumeRun()).toBe(true)
    expect(g2.getBlocks().get('0,1')?.typeId).toBe('cannon')
    expect(g2.getBlocks().size).toBe(4)
  })
})

/**
 * ─── The tutorial's first placement is a MERGE ───────────────────────────────
 *
 * The coach marks deal a `cannon1` into the weapon slot and point at the
 * shoulder of the fort — the first entry of `TUTORIAL_CELLS` in `GameScene` —
 * because the fort already has a cannon on the Gate and the two fuse on
 * contact. That is how a first-time player meets merging now: not as a
 * 200-coin node in a screen they never open, but as the first thing their own
 * hand does.
 *
 * The beat is spread over the scene component, the shape catalogue and the
 * opening purse, so nothing else can pin it: change the fort's gun, the
 * tutorial's shape or the starting resources and the lesson silently becomes
 * "put a block somewhere" again, with every test still green.
 */
describe('the tutorial merge', () => {
  /** Kept in step with `TUTORIAL_SHAPE` / `TUTORIAL_CELLS[0]` in GameScene. */
  const TUTORIAL_SHAPE = 'cannon1'
  const SHOULDER = { c: -1, r: 1 }

  it('deals the same gun the fort is already carrying', async () => {
    const { SHAPE_BY_ID } = await import('@/game/shapes')
    const cells = SHAPE_BY_ID[TUTORIAL_SHAPE]!.cells
    // One cell, so it cannot be placed "wrong" by rotation, and a cannon, so
    // it twins with the one the scripted opening puts on the Gate.
    expect(cells).toHaveLength(1)
    expect(cells[0]![2]).toBe('cannon')
  })

  it('is affordable out of the opening purse', async () => {
    const g = await loadGame()
    g.startRun()
    g.seedScriptedOpening()
    // The beat has no Skip button, so a piece the player cannot buy would
    // strand them. 25 wood + 10 stone against 120 + 40.
    expect(g.canAffordShape(TUTORIAL_SHAPE)).toBe(true)
  })

  it('fuses with the fort cannon on the very first placement', async () => {
    const g = await loadGame()
    g.startRun()
    g.seedScriptedOpening()
    expect(g.canPlaceShapeAt(TUTORIAL_SHAPE, SHOULDER.c, SHOULDER.r, 0)).toBe(true)

    g.offers.value = [...g.offers.value.slice(0, 1), TUTORIAL_SHAPE, ...g.offers.value.slice(2)]
    expect(g.placeShape(1, SHOULDER.c, SHOULDER.r, 0)).toBe(true)

    // One gun where there were two, two cells wide, at tier 2 — and no tech
    // whatsoever bought to get it.
    const cannons = [...g.getTowerBlocks().values()].filter((b) => b.typeId === 'cannon')
    expect(cannons).toHaveLength(1)
    expect(tierOf(cannons[0]!.tier)).toBe(2)
    expect([cannons[0]!.w ?? 1, cannons[0]!.h ?? 1]).toEqual([2, 1])
  })
})

describe('the guaranteed opening win', () => {
  it('a first-session player who only calls the wave survives wave 1', async () => {
    const g = await loadGame()
    g.startRun()
    g.seedScriptedOpening()

    expect(playWave(g)).toBe(true)
    expect(g.wave.value).toBe(1)
    // Not merely alive — the Gate should still be worth defending afterwards.
    // The opening surcharge is meant to cost an outer WALL, never the Gate.
    expect(g.gateHpPct.value).toBeGreaterThan(0.5)
  })

  it('leans on wave 1 for a first-session player and not for a veteran', async () => {
    const fresh = await loadGame()
    fresh.startRun()
    fresh.callWave()
    const opening = fresh.enemiesTotal.value

    const veteran = await loadVeteranGame()
    veteran.startRun()
    veteran.callWave()

    // The surcharge is the first session's alone: a returning player meets the
    // curve, which is what keeps wave 1 meaning the same thing every run after.
    expect(opening).toBeGreaterThan(veteran.enemiesTotal.value)
  })
})

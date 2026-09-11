import { describe, expect, it, vi } from 'vitest'
import { killShareOf } from '@/game/waves'

/**
 * ─── The wave's materials, paid a kill at a time ────────────────────────────
 *
 * A player watched hammering an unaffordable column had not understood that
 * the wave's wood was coming later, at the clear. The wave's base materials
 * are now split over its enemies and each kill pays its cut on the spot.
 *
 * The contract that makes that safe is EXACTNESS: the cuts sum to what the
 * clear used to pay, to the unit, however the wave went — every enemy killed,
 * none killed, some killed and the rest removed another way, extra enemies on
 * top. So every sim test here runs the SAME wave twice, once fought and once
 * cleared without a single kill (the old lump, settled at the clear), and
 * demands the two purses end identical.
 */

const TICK = 1000 / 60

describe('killShareOf', () => {
  it('splits a total into cuts that sum to it exactly', () => {
    for (const total of [0, 1, 7, 10, 23, 97, 250, 1001]) {
      for (const n of [1, 2, 3, 4, 7, 9, 13, 40]) {
        let sum = 0
        for (let i = 0; i < n; i++) sum += killShareOf(total, n, i)
        expect(sum, `${total} over ${n}`).toBe(total)
      }
    }
  })

  it('spreads the odd units through the wave, never more than one apart', () => {
    expect([0, 1, 2, 3].map((i) => killShareOf(10, 4, i))).toEqual([2, 3, 2, 3])
    for (const [total, n] of [[23, 9], [5, 12], [101, 7]] as const) {
      const cuts = Array.from({ length: n }, (_, i) => killShareOf(total, n, i))
      expect(Math.max(...cuts) - Math.min(...cuts)).toBeLessThanOrEqual(1)
      for (const c of cuts) expect(Number.isInteger(c)).toBe(true)
    }
  })

  it('pays nothing past the last kill, for nothing, or over nobody', () => {
    expect(killShareOf(10, 4, 4)).toBe(0)
    expect(killShareOf(10, 4, -1)).toBe(0)
    expect(killShareOf(0, 4, 0)).toBe(0)
    expect(killShareOf(10, 0, 0)).toBe(0)
  })
})

type Game = typeof import('@/use/useTowerGame')

const load = async (board: 'desktop' | 'dropmerge'): Promise<Game> => {
  vi.resetModules()
  localStorage.clear()
  const g = await import('@/use/useTowerGame')
  if (board === 'dropmerge') {
    const { DROPMERGE_RULES } = await import('@/mobile-fit/rules')
    g.applyRules(DROPMERGE_RULES)
  }
  g.startRun()
  // Nothing on the field shoots — the test decides exactly who dies.
  g.buildClockHeld.value = true
  return g
}

/**
 * Call the next wave and run it to the clear.
 *
 * `killFirst` enemies die through the real damage path the moment they are on
 * the field; everyone after that is removed without dying, which is exactly
 * what a wave that "nobody fought" looks like to the payout.
 */
const runWave = (
  g: Game, killFirst: number, extra: string[] = []
): { midWave: number; kills: number } => {
  g.callWave()
  if (extra.length > 0) g.debugSpawn(extra)
  const start = g.wood.value
  let midWave = 0
  let kills = 0
  for (let t = 0; t < 400_000; t += TICK) {
    for (const e of [...g.getEnemies()]) {
      if (e.dying > 0) continue
      if (kills < killFirst) {
        g.damageEnemyForTest(e, 1e9)
        kills++
      } else {
        g.getEnemies().splice(g.getEnemies().indexOf(e), 1)
      }
    }
    // What the kills paid while the wave was still on.
    if (g.phase.value === 'battle') midWave = Math.max(midWave, g.wood.value - start)
    g.step(TICK)
    if (g.phase.value === 'build') return { midWave, kills }
  }
  throw new Error('wave never cleared')
}

describe.each(['desktop', 'dropmerge'] as const)('per-kill materials — %s', (board) => {
  it('pays the wave\'s materials during the wave, and exactly the old lump in total', async () => {
    // The control: the same wave cleared without a kill pays its whole reward
    // at the clear, which is what the game used to do for every wave.
    const control = await load(board)
    const w0 = control.wood.value
    const s0 = control.stone.value
    runWave(control, 0)
    const lumpWood = control.wood.value - w0
    const lumpStone = control.stone.value - s0
    expect(lumpWood).toBeGreaterThan(0)

    const fought = await load(board)
    const f0 = fought.wood.value
    const fs0 = fought.stone.value
    const { midWave, kills } = runWave(fought, Infinity)
    expect(kills).toBe(fought.lastWaveReward.value?.tally
      ? Object.values(fought.lastWaveReward.value.tally).reduce((a, b) => a + b, 0)
      : -1)
    // Paid as the enemies died, not at the clear...
    expect(midWave).toBeGreaterThan(0)
    // ...and to the unit what the lump paid.
    expect(fought.wood.value - f0).toBe(lumpWood)
    expect(fought.stone.value - fs0).toBe(lumpStone)
  })

  it('reports the wave\'s whole payout, and only the clear\'s share as landing at the clear', async () => {
    const g = await load(board)
    runWave(g, Infinity)
    const r = g.lastWaveReward.value!
    const control = await load(board)
    runWave(control, 0)
    const c = control.lastWaveReward.value!
    // The toast and the ×3 offer read the same totals either way.
    expect(r.wood).toBe(c.wood)
    expect(r.stone).toBe(c.stone)
    expect(r.coins).toBe(c.coins)
    // Every enemy died to the tower, so nothing of the base materials was left
    // for the clear; the fought-free wave landed all of it there.
    expect(r.atClear.wood).toBe(0)
    expect(r.atClear.stone).toBe(0)
    expect(c.atClear.wood).toBe(c.wood)
  })

  it('settles what the kills did not collect when the wave clears', async () => {
    const control = await load(board)
    const w0 = control.wood.value
    runWave(control, 0)
    const lump = control.wood.value - w0

    // One dies to the tower, the rest leave some other way.
    const g = await load(board)
    const g0 = g.wood.value
    const { kills } = runWave(g, 1)
    expect(kills).toBe(1)
    expect(g.wavePlan().total).toBeGreaterThan(1)
    expect(g.wood.value - g0).toBe(lump)
    const r = g.lastWaveReward.value!
    expect(r.atClear.wood).toBeGreaterThan(0)
    expect(r.atClear.wood).toBeLessThan(lump)
  })

  it('never pays past the total, however many die', async () => {
    const control = await load(board)
    const w0 = control.wood.value
    runWave(control, 0)
    const lump = control.wood.value - w0

    // Five enemies the plan never priced, killed alongside the planned ones.
    const g = await load(board)
    const g0 = g.wood.value
    const { kills } = runWave(g, Infinity, ['grunt', 'grunt', 'grunt', 'grunt', 'grunt'])
    expect(kills).toBeGreaterThan(5)
    expect(g.wood.value - g0).toBe(lump)
  })

  it('banks nothing mid-wave: a reload replays the wave from the purse before it', async () => {
    const g = await load(board)
    const state = await import('@/use/useTowerState')
    const { DROPMERGE_RULES } = await import('@/mobile-fit/rules')
    const runKey = board === 'dropmerge' ? DROPMERGE_RULES.save.runKey : 'ts_run'
    const before = g.wood.value
    g.callWave()
    // Kill whatever is on the field until at least one cut has been paid.
    for (let t = 0; t < 60_000 && g.killSharePaid().kills === 0; t += TICK) {
      for (const e of [...g.getEnemies()]) if (e.dying <= 0) g.damageEnemyForTest(e, 1e9)
      g.step(TICK)
    }
    expect(g.killSharePaid().wood).toBeGreaterThan(0)
    expect(g.wood.value).toBeGreaterThan(before)
    // The snapshot on disk is the build phase's: none of those cuts are in it.
    expect(state.getState<{ wood: number }>(runKey)?.wood).toBe(before)

    // So a reload resumes with the pre-wave purse, and the split starts over:
    // the replayed wave pays its full share once, not on top of the first try.
    expect(g.resumeRun()).toBe(true)
    expect(g.wood.value).toBe(before)
    expect(g.killSharePaid().kills).toBe(0)
  })
})

describe('per-kill materials — what still lands at the clear', () => {
  it('pays the economy blocks at the clear, on top of the kill cuts', async () => {
    const g = await load('dropmerge')
    g.wood.value = 500
    expect(g.placeBlock('lumberHut', 2, 0)).toBe(true)
    const before = g.wood.value
    runWave(g, Infinity)
    const r = g.lastWaveReward.value!
    // Every enemy died to the tower, so what landed at the clear is the hut's
    // yield and nothing else — and the purse moved by the whole payout.
    expect(r.atClear.wood).toBeGreaterThan(0)
    expect(r.wood).toBeGreaterThan(r.atClear.wood)
    expect(g.wood.value - before).toBe(r.wood)
  })
})

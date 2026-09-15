import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FxEvent } from '@/use/useTowerVfx'

/**
 * ─── A block dying is an event, not a disappearance ─────────────────────────
 *
 * The 2026-09-15 blind playtest: two testers watched towers leave the board and
 * neither could say what had happened. One reported a cannon that "silently
 * became a placeholder icon — no destroyed message, no explosion, no
 * confirmation"; the other died on wave 8 holding 185 wood and 105 stone while
 * three of four slots were dismantled one at a time, and called it a fairness
 * bug rather than a loss.
 *
 * Shatter alone is debris the colour of the block that dropped it, on a
 * battlefield already full of debris. So a violent death now also throws a
 * small blast — the cannon-impact vocabulary the player already reads as
 * "something was destroyed here".
 *
 * (`removeBlock` also skips the punctuation blast for a block carrying its own
 * `deathExplosion`, so a demolition charge is not double-detonated. No shipped
 * block declares one yet, so there is nothing here to test that would not pass
 * vacuously — the guard is pinned by the type, not by a fixture.)
 */

/**
 * The simulation is a module-level singleton, so each test re-imports it fresh
 * for a clean tower. `vi.resetModules()` resets the WHOLE registry — so the fx
 * bus has to be re-imported alongside it, or the test reads a different module
 * instance from the one the game is pushing into and every queue looks empty.
 */
const loadGame = async () => {
  vi.resetModules()
  localStorage.clear()
  const [game, vfx] = await Promise.all([
    import('@/use/useTowerGame'),
    import('@/use/useTowerVfx')
  ])
  vfx.resetVfx()
  return { ...game, drainFx: vfx.drainFx }
}

const explosions = (fx: FxEvent[]) => fx.filter((e) => e.kind === 'explosion')
const shatters = (fx: FxEvent[]) => fx.filter((e) => e.kind === 'shatter')

/** A run with one stone block standing on the ground beside the Gate. */
const oneBlockRun = async () => {
  const g = await loadGame()
  g.startRun()
  g.wood.value = 99_999
  g.stone.value = 99_999
  // The ground row: nothing under it to settle, nothing over it to orphan.
  expect(g.placeBlock('stone', 2, 0)).toBe(true)
  g.drainFx()
  return g
}

beforeEach(() => localStorage.clear())

describe('a block that reaches zero HP', () => {
  it('throws a blast as well as its debris', async () => {
    const g = await oneBlockRun()

    g.damageBlockForTest(g.getBlocks().get('2,0')!, 99_999)
    const fx = g.drainFx()

    expect(shatters(fx), 'the debris still plays').toHaveLength(1)
    expect(explosions(fx), 'and now a blast with it').toHaveLength(1)
  })

  it('keeps the blast under a cannon round, so a loss never restages the shot', async () => {
    const g = await oneBlockRun()

    g.damageBlockForTest(g.getBlocks().get('2,0')!, 99_999)
    const [blast] = explosions(g.drainFx())

    // The cheapest splash weapon in the game throws 0.8 cells; this punctuates
    // a loss rather than re-firing the round that caused it.
    expect(blast).toBeDefined()
    expect(blast!.kind === 'explosion' && blast!.radius).toBeLessThan(0.8)
  })

  it('plays no report of its own — the shatter is already sounding', async () => {
    // A five-block collapse is a chain of splinters, not a chain of sub thumps.
    const g = await oneBlockRun()

    g.damageBlockForTest(g.getBlocks().get('2,0')!, 99_999)
    const [blast] = explosions(g.drainFx())
    expect(blast!.kind === 'explosion' && blast!.quiet).toBe(true)
  })

  it('stays quiet and blastless when the block is SOLD', async () => {
    const g = await oneBlockRun()

    expect(g.sellBlock(2, 0)).not.toBeNull()
    const fx = g.drainFx()
    expect(explosions(fx), 'a sale is not a destruction').toHaveLength(0)
    expect(shatters(fx), 'nor is it a shattering').toHaveLength(0)
  })

  it('blasts once per block when a whole row is wiped out', async () => {
    const g = await loadGame()
    g.startRun()
    g.wood.value = 99_999
    g.stone.value = 99_999
    for (const c of [1, 2, 3]) expect(g.placeBlock('stone', c, 0), `at ${c}`).toBe(true)
    g.drainFx()

    for (const c of [1, 2, 3]) g.damageBlockForTest(g.getBlocks().get(`${c},0`)!, 99_999)
    const fx = g.drainFx()

    expect(shatters(fx)).toHaveLength(3)
    expect(explosions(fx)).toHaveLength(3)
    expect(explosions(fx).every((e) => e.kind === 'explosion' && e.quiet)).toBe(true)
  })
})

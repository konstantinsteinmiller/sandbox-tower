import { describe, expect, it, vi } from 'vitest'
import { tierOf } from '@/game/blocks'

/**
 * ─── Moving a block that is already standing ────────────────────────────────
 *
 * The verb the game was missing. A tester on 2026-09-14 dragged one cannon onto
 * an identical one to fuse them and got a camera pan — and they were not wrong
 * about the rule, because `settleMerges` already fuses any two adjacent twins.
 * What was missing was the only way a player could deliberately MAKE two
 * standing blocks adjacent.
 *
 * So the merge is not implemented here at all: the move is, and the fusion
 * falls out of the settle pass that already runs on every structural change.
 * That is what these tests pin — the move, its refusals, and the fact that the
 * player's actual goal is reached without a single line of merge code.
 */

const load = async () => {
  vi.resetModules()
  localStorage.clear()
  const g = await import('@/use/useTowerGame')
  g.startRun()
  g.wood.value = 9_999
  g.stone.value = 9_999
  g.runCoins.value = 9_999
  return g
}

type Game = Awaited<ReturnType<typeof load>>
const at = (g: Game, c: number, r: number) => g.getBlocks().get(`${c},${r}`)

describe('picking a block up', () => {
  it('moves it, and the cell it left is empty', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    expect(at(g, -3, 0)).toBeTruthy()

    expect(g.moveBlock(-3, 0, 3, 0)).toBe(true)
    expect(at(g, -3, 0)).toBeUndefined()
    expect(at(g, 3, 0)?.typeId).toBe('wood')
  })

  it('never moves the Gate — it is the loss condition, not a piece', async () => {
    const g = await load()
    expect(g.canMoveBlock(0, 0)).toBe(false)
    expect(g.moveBlock(0, 0, 3, 0)).toBe(false)
    expect(at(g, 0, 0)?.typeId).toBe('gate')
  })

  it('never moves anything mid-battle', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    g.callWave()
    expect(g.phase.value).toBe('battle')
    expect(g.canMoveBlock(-3, 0)).toBe(false)
    expect(g.moveBlock(-3, 0, 3, 0)).toBe(false)
    expect(at(g, -3, 0)).toBeTruthy()
  })

  it('refuses a destination a bought piece could not use, and changes nothing',
    async () => {
      const g = await load()
      g.placeBlock('wood', -3, 0)
      // Floating in the sky, and on top of the Gate.
      expect(g.moveBlock(-3, 0, 3, 6)).toBe(false)
      expect(g.moveBlock(-3, 0, 0, 0)).toBe(false)
      expect(at(g, -3, 0)?.typeId).toBe('wood')
    })

  it('costs nothing and refunds nothing — it is the same block', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    const purse = [g.wood.value, g.stone.value, g.runCoins.value]
    expect(g.moveBlock(-3, 0, 3, 0)).toBe(true)
    expect([g.wood.value, g.stone.value, g.runCoins.value]).toEqual(purse)
  })

  it('carries the block\'s own history with it', async () => {
    const g = await load()
    g.placeBlock('cannon', -3, 0)
    g.upgradeBlock(-3, 0)
    const before = at(g, -3, 0)!
    const [uid, level, hp] = [before.uid, before.level, before.hp]

    expect(g.moveBlock(-3, 0, 3, 0)).toBe(true)
    const after = at(g, 3, 0)!
    // The same object, not a rebuilt one: a move must not launder a damaged
    // block into a fresh one, nor drop the rank the player paid for.
    expect(after.uid).toBe(uid)
    expect(after.level).toBe(level)
    expect(after.hp).toBe(hp)
  })
})

describe('the move is how a player merges what is already standing', () => {
  it('fuses two twins when one is carried next to the other', async () => {
    const g = await load()
    // Two tier-1 cannons with a gap between them — the shape a player ends up
    // with by placing guns where there was room rather than where they fuse.
    g.placeBlock('cannon', -4, 0)
    g.placeBlock('cannon', -1, 0)
    expect([...g.getTowerBlocks().values()].filter((b) => b.typeId === 'cannon')).toHaveLength(2)

    expect(g.moveBlock(-4, 0, -2, 0)).toBe(true)

    // One gun where there were two, two cells wide, at tier 2 — and the player
    // did it with the gesture they tried first.
    const cannons = [...g.getTowerBlocks().values()].filter((b) => b.typeId === 'cannon')
    expect(cannons).toHaveLength(1)
    expect(tierOf(cannons[0]!.tier)).toBe(2)
    expect([cannons[0]!.w ?? 1, cannons[0]!.h ?? 1]).toEqual([2, 1])
  })

  it('leaves two DIFFERENT guns side by side alone', async () => {
    const g = await load()
    g.placeBlock('cannon', -4, 0)
    g.placeBlock('archery', -1, 0)
    expect(g.moveBlock(-4, 0, -2, 0)).toBe(true)
    // Adjacent, and still two blocks: the merge rule is unchanged by the new
    // way of reaching it.
    expect(at(g, -2, 0)?.typeId).toBe('cannon')
    expect(at(g, -1, 0)?.typeId).toBe('archery')
  })

  it('moves a merged block as one piece, by its whole footprint', async () => {
    const g = await load()
    g.placeBlock('cannon', -4, 0)
    g.placeBlock('cannon', -3, 0)
    const weld = at(g, -4, 0)!
    expect(tierOf(weld.tier)).toBe(2)
    expect(weld.w).toBe(2)

    expect(g.moveBlock(-4, 0, 2, 0)).toBe(true)
    // Both cells travel together, and they are still one block.
    expect(at(g, 2, 0)).toBe(at(g, 3, 0))
    expect(at(g, -4, 0)).toBeUndefined()
    expect(at(g, -3, 0)).toBeUndefined()
  })
})

describe('what the destination check answers', () => {
  it('allows a one-cell nudge — the block is lifted before it is tested',
    async () => {
      const g = await load()
      g.placeBlock('wood', -3, 0)
      // Overlapping moves are the case a naive check gets wrong: the piece's
      // own cells are in the way of the piece.
      expect(g.canMoveBlockTo(-3, 0, -2, 0)).toBe(true)
      expect(g.moveBlock(-3, 0, -2, 0)).toBe(true)
      expect(at(g, -2, 0)?.typeId).toBe('wood')
    })

  it('refuses a move to where it already is', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    expect(g.canMoveBlockTo(-3, 0, -3, 0)).toBe(false)
  })

  it('settles anything the move left floating', async () => {
    const g = await load()
    // A crate on the ground with a second one resting on top of it.
    g.placeBlock('wood', -3, 0)
    g.placeBlock('wood', -3, 1)
    expect(at(g, -3, 1)).toBeTruthy()

    expect(g.moveBlock(-3, 0, 3, 0)).toBe(true)
    // The upper crate has nothing under it any more. Support settles exactly as
    // it does when a load-bearing block is sold.
    expect(at(g, -3, 1)).toBeUndefined()
  })
})

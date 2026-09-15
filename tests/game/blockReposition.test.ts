import { describe, expect, it, vi } from 'vitest'

/**
 * ─── Repositioning costs gold, and only on a move that happens ──────────────
 *
 * Moving a standing block used to be free, which made it the cheapest tool in
 * the game: between waves a player could reshuffle an entire board into a
 * perfect merge lattice at no cost and with no limit, and — because
 * `settleSupport` runs inside the move — could also collapse the top of their
 * own tower on purpose for nothing. It now costs `MOVE_COST` run gold.
 *
 * A price introduces four ways to rob the player, and every one of them is
 * silent. These are what is pinned here:
 *
 *   1. a REFUSED move must not touch the purse — an illegal cell, a battle, the
 *      Gate, or a destination the player cannot afford;
 *   2. putting the block back where it came from must be FREE and must change
 *      nothing, because that is a change of mind rather than a move;
 *   3. a player who cannot afford it must not be able to move at all — a move
 *      that happens and then fails to charge is worse than one that is refused;
 *   4. the collapse must wait for the DESTINATION. The scene scans the whole
 *      board through `canMoveBlockTo` while the player is still deciding, and
 *      that predicate lifts the block out of the grid to test it — a leak there
 *      would drop the tower while nobody had committed to anything.
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

/**
 * A crate on the foundation with a second one resting on top of it.
 *
 * The lower one is the only thing holding the upper one in the Gate's support
 * graph, so moving it away orphans the upper one — which is the fixture the
 * collapse-timing tests need. The foundation is 4 cells either side of the
 * Gate, so both -3 and 3 are legal ground cells.
 */
const stack = (g: Game): void => {
  g.placeBlock('wood', -3, 0)
  g.placeBlock('wood', -3, 1)
}

describe('what a move costs', () => {
  it('charges exactly the posted price, once', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    const before = g.runCoins.value

    expect(g.moveBlock(-3, 0, 3, 0)).toBe(true)

    expect(g.runCoins.value).toBe(before - g.MOVE_COST)
    // The price the card prints is the price the simulation takes. A button
    // that says 10 and charges anything else is the one bug a player will not
    // forgive.
    expect(g.MOVE_COST).toBe(10)
  })

  it('takes nothing when the destination is illegal', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    const before = g.runCoins.value

    // Floating in the sky, and on top of the Gate.
    expect(g.moveBlock(-3, 0, 3, 6)).toBe(false)
    expect(g.moveBlock(-3, 0, 0, 0)).toBe(false)

    expect(g.runCoins.value).toBe(before)
    expect(at(g, -3, 0)?.typeId).toBe('wood')
  })

  it('takes nothing for putting the block back where it already is', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    const before = g.runCoins.value

    // Not a refusal — a change of mind. The design asks for this in as many
    // words, and it falls out of the legality check running before the price
    // rather than out of a special case.
    expect(g.moveBlock(-3, 0, -3, 0)).toBe(false)

    expect(g.runCoins.value).toBe(before)
    expect(at(g, -3, 0)?.typeId).toBe('wood')
  })

  it('takes nothing mid-battle, when no move is possible at all', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    g.callWave()
    expect(g.phase.value).toBe('battle')
    const before = g.runCoins.value

    expect(g.moveBlock(-3, 0, 3, 0)).toBe(false)

    expect(g.runCoins.value).toBe(before)
    expect(at(g, -3, 0)?.typeId).toBe('wood')
  })

  it('never moves the Gate, and never charges for trying', async () => {
    const g = await load()
    const before = g.runCoins.value

    expect(g.canMoveBlock(0, 0)).toBe(false)
    expect(g.moveBlock(0, 0, 3, 0)).toBe(false)

    expect(g.runCoins.value).toBe(before)
    expect(at(g, 0, 0)?.typeId).toBe('gate')
  })
})

describe('a player who cannot pay', () => {
  it('cannot move at all, and is not charged for finding out', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    // One coin short. The wave payout that fixes this is seconds away, which is
    // why the scene greys the button rather than hiding it.
    g.runCoins.value = g.MOVE_COST - 1

    expect(g.moveBlock(-3, 0, 3, 0)).toBe(false)

    expect(g.runCoins.value).toBe(g.MOVE_COST - 1)
    expect(at(g, -3, 0)?.typeId).toBe('wood')
    expect(at(g, 3, 0)).toBeUndefined()
  })

  it('can move at exactly the price, and lands on nothing', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    g.runCoins.value = g.MOVE_COST

    expect(g.moveBlock(-3, 0, 3, 0)).toBe(true)
    expect(g.runCoins.value).toBe(0)
  })

  it('reports affordability separately from legality', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)

    g.runCoins.value = g.MOVE_COST
    expect(g.canAffordMove()).toBe(true)
    expect(g.missingForMove()).toEqual([])

    g.runCoins.value = g.MOVE_COST - 1
    expect(g.canAffordMove()).toBe(false)
    // Shaped for `denyPurchase`, so an unaffordable move blinks the gold pile
    // in the resource bar instead of failing silently.
    expect(g.missingForMove()).toEqual(['coins'])

    // …and an empty purse must NOT make the board look unbuildable: the
    // destination check is pure legality and answers the same either way. This
    // is what keeps every socket lit while the player waits for a payout.
    expect(g.canMoveBlockTo(-3, 0, 3, 0)).toBe(true)
    expect(g.canMoveBlock(-3, 0)).toBe(true)
  })
})

describe('when the tower falls', () => {
  it('stands perfectly still while the player is choosing', async () => {
    const g = await load()
    stack(g)
    expect(at(g, -3, 1)).toBeTruthy()
    const purse = g.runCoins.value
    const blocks = g.getBlocks().size

    // Exactly what the scene does while a block is armed: `canMoveBlockTo` once
    // per candidate cell, over the whole board, to light the sockets. It lifts
    // the block out of the grid to test each one — a release that failed to be
    // undone would collapse the tower here, with the player having committed to
    // nothing and having been charged nothing.
    let legal = 0
    for (let c = -8; c <= 8; c++) {
      for (let r = 0; r <= 6; r++) if (g.canMoveBlockTo(-3, 0, c, r)) legal++
    }
    expect(legal).toBeGreaterThan(0)

    expect(g.getDebris()).toHaveLength(0)
    expect(at(g, -3, 1)).toBeTruthy()
    expect(at(g, -3, 0)).toBeTruthy()
    expect(g.getBlocks().size).toBe(blocks)
    expect(g.runCoins.value).toBe(purse)
  })

  it('drops what the move orphaned, on the move and not before', async () => {
    const g = await load()
    stack(g)
    // Nothing is falling yet, and the upper crate is still standing on the one
    // below it.
    expect(g.getDebris()).toHaveLength(0)

    expect(g.moveBlock(-3, 0, 3, 0)).toBe(true)

    // Now it falls. `settleSupport` runs INSIDE the move — the same rule that
    // governs selling a load-bearing block — so the collapse is the answer to
    // the player's chosen destination rather than to their having thought
    // about one.
    expect(g.getDebris()).toHaveLength(1)
    expect(at(g, -3, 1)).toBeUndefined()
    expect(at(g, 3, 0)?.typeId).toBe('wood')
  })

  it('still charges exactly once when the move brings the tower down',
    async () => {
      const g = await load()
      stack(g)
      const before = g.runCoins.value

      expect(g.moveBlock(-3, 0, 3, 0)).toBe(true)

      // One move, one fee, however much rubble it made. The collapse is a
      // consequence the player chose, not a second transaction.
      expect(g.runCoins.value).toBe(before - g.MOVE_COST)
    })
})

describe('the move survives a reload', () => {
  it('persists the new position and the spent gold together', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    const before = g.runCoins.value
    expect(g.moveBlock(-3, 0, 3, 0)).toBe(true)

    // `moveBlock` writes the snapshot itself, so a tab closed straight after a
    // move must not hand the block back in its old cell WITH the gold still
    // spent — or, worse, in its new cell with the gold refunded. Resumed on the
    // same instance, which is how every other snapshot test in the suite is
    // written: what is under test is the SHAPE the snapshot carries, not the
    // state layer's debounce.
    expect(g.resumeRun()).toBe(true)

    expect(at(g, 3, 0)?.typeId).toBe('wood')
    expect(at(g, -3, 0)).toBeUndefined()
    expect(g.runCoins.value).toBe(before - g.MOVE_COST)
  })
})

/**
 * ─── The reshuffle allowance ────────────────────────────────────────────────
 *
 * A flat price fixed the first move and left the mechanic open: by the mid
 * waves a run's gold income covers a dozen moves a phase, so ten gold bought
 * unlimited re-solving of the merge lattice between waves. That turns the one
 * irreversible thing about placement — that a weld happens where you put it —
 * into a puzzle with an undo button.
 *
 * So three moves per three-wave window sit at the base price and the fourth
 * onward doubles. What is pinned here is every way that could go wrong quietly:
 * a curve that escalates on the wrong move, a window that never resets, a
 * window that resets every wave (which would escalate nothing), a card quoting
 * a price the simulation does not charge, and a page reload used as a refill.
 */
describe('the reshuffle allowance', () => {
  it('prices three moves cheap and then doubles', async () => {
    const g = await load()
    // Pure curve, no tower needed — this IS the feature.
    expect([0, 1, 2].map(g.moveCostFor)).toEqual([10, 10, 10])
    expect(g.moveCostFor(3)).toBe(20)
    expect(g.moveCostFor(4)).toBe(40)
    expect(g.moveCostFor(5)).toBe(80)
    // The third and fourth moves are where the decision lives: the jump has to
    // land exactly after the allowance, not one either side of it.
    expect(g.moveCostFor(g.CHEAP_MOVES - 1)).toBe(g.MOVE_COST)
    expect(g.moveCostFor(g.CHEAP_MOVES)).toBe(g.MOVE_COST * 2)
  })

  it('caps, so the chip never has to print five digits', async () => {
    const g = await load()
    expect(g.moveCostFor(50)).toBe(g.MOVE_COST_CAP)
    expect(g.moveCostFor(500)).toBe(g.MOVE_COST_CAP)
    // Still a real price rather than a token one.
    expect(g.MOVE_COST_CAP).toBeGreaterThan(g.MOVE_COST * 20)
  })

  it('charges the escalating price off the live counter', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    const spend = (from: number, to: number): number => {
      const before = g.runCoins.value
      expect(g.moveBlock(from, 0, to, 0)).toBe(true)
      return before - g.runCoins.value
    }
    // Shuffled between two legal ground cells, four times.
    expect(spend(-3, 3)).toBe(10)
    expect(spend(3, -3)).toBe(10)
    expect(spend(-3, 3)).toBe(10)
    // The fourth move in the window.
    expect(spend(3, -3)).toBe(20)
    expect(spend(-3, 3)).toBe(40)
  })

  it('quotes the price it is about to charge, never the base one', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    // `moveCost` is what the inspector prints. The early-call badge shipped the
    // opposite bug — a HUD advertising a payout the simulation would not make —
    // and this is the same class of failure one card over.
    for (const expected of [10, 10, 10, 20, 40]) {
      expect(g.moveCost.value).toBe(expected)
      const before = g.runCoins.value
      const [from, to] = g.getBlocks().has('-3,0') ? [-3, 3] : [3, -3]
      expect(g.moveBlock(from, 0, to, 0)).toBe(true)
      expect(before - g.runCoins.value).toBe(expected)
    }
  })

  it('counts down the cheap moves for the card, and stops at zero', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    expect(g.cheapMovesLeft.value).toBe(g.CHEAP_MOVES)
    g.moveBlock(-3, 0, 3, 0)
    expect(g.cheapMovesLeft.value).toBe(2)
    g.moveBlock(3, 0, -3, 0)
    expect(g.cheapMovesLeft.value).toBe(1)
    g.moveBlock(-3, 0, 3, 0)
    expect(g.cheapMovesLeft.value).toBe(0)
    g.moveBlock(3, 0, -3, 0)
    // Never negative: it is a pip count, and the card renders one pip per unit.
    expect(g.cheapMovesLeft.value).toBe(0)
  })

  it('does not spend the allowance on a move that never happened', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    // Illegal, then back to its own cell, then unaffordable.
    expect(g.moveBlock(-3, 0, 3, 6)).toBe(false)
    expect(g.moveBlock(-3, 0, -3, 0)).toBe(false)
    g.runCoins.value = 9
    expect(g.moveBlock(-3, 0, 3, 0)).toBe(false)
    g.runCoins.value = 9_999
    // Three refusals later the allowance is untouched and the next move is 10.
    expect(g.cheapMovesLeft.value).toBe(g.CHEAP_MOVES)
    expect(g.moveCost.value).toBe(g.MOVE_COST)
  })

  it('resets after three waves, and not before', async () => {
    const g = await load()
    // Windows are three waves wide: 0-2, 3-5, 6-8. A per-PHASE reset would
    // refill the allowance every thirty seconds and escalate nothing, and a
    // run-long budget would price a wave-30 move off a wave-4 mistake.
    expect(g.moveWindowOf(0)).toBe(0)
    expect(g.moveWindowOf(2)).toBe(0)
    expect(g.moveWindowOf(3)).toBe(1)
    expect(g.moveWindowOf(5)).toBe(1)
    expect(g.moveWindowOf(6)).toBe(2)

    g.placeBlock('wood', -3, 0)
    g.moveBlock(-3, 0, 3, 0)
    g.moveBlock(3, 0, -3, 0)
    g.moveBlock(-3, 0, 3, 0)
    expect(g.moveCost.value).toBe(20)

    // Still the same window two waves later — the price stays where the player
    // left it. (`debugSetWave(n)` leaves `wave` at n-1, so these are driven by
    // the value the window is keyed off rather than by the jump's argument.)
    g.debugSetWave(3)
    expect(g.wave.value).toBe(2)
    expect(g.moveCost.value).toBe(20)
    expect(g.cheapMovesLeft.value).toBe(0)

    // New window.
    g.debugSetWave(4)
    expect(g.wave.value).toBe(3)
    expect(g.moveCost.value).toBe(g.MOVE_COST)
    expect(g.cheapMovesLeft.value).toBe(g.CHEAP_MOVES)

    // And it escalates again inside the new window rather than staying cheap.
    // A second pair of cells, because the first block is still standing on one
    // of the originals — the wave jump clears the field, not the tower.
    g.runCoins.value = 9_999
    g.placeBlock('wood', -2, 0)
    for (const [from, to] of [[-2, 2], [2, -2], [-2, 2]] as const) {
      expect(g.moveBlock(from, 0, to, 0)).toBe(true)
    }
    expect(g.moveCost.value).toBe(20)
  })

  it('a fresh run starts on an untouched allowance', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    g.moveBlock(-3, 0, 3, 0)
    g.moveBlock(3, 0, -3, 0)
    g.moveBlock(-3, 0, 3, 0)
    expect(g.moveCost.value).toBe(20)
    g.startRun()
    expect(g.moveCost.value).toBe(g.MOVE_COST)
    expect(g.cheapMovesLeft.value).toBe(g.CHEAP_MOVES)
  })

  it('survives a reload — a refresh is not a refill', async () => {
    const g = await load()
    g.placeBlock('wood', -3, 0)
    g.moveBlock(-3, 0, 3, 0)
    g.moveBlock(3, 0, -3, 0)
    g.moveBlock(-3, 0, 3, 0)
    expect(g.moveCost.value).toBe(20)
    g.saveRunSnapshot()
    // The state layer debounces its write; without this the reload below reads
    // a blob with no run in it and `resumeRun` correctly refuses.
    const { flushPersist } = await import('@/use/useTowerState')
    flushPersist()

    // A page reload: a new module instance over the SAME save, so the counter
    // comes back at its module default and the resume path has to correct it.
    // Without the snapshot fields this is three more moves at ten gold.
    vi.resetModules()
    const h = await import('@/use/useTowerGame')
    expect(h.resumeRun()).toBe(true)
    expect(h.moveCost.value).toBe(20)
    expect(h.cheapMovesLeft.value).toBe(0)
  })

  it('treats a snapshot written before the price existed as untouched', async () => {
    // The forgiving direction, and the correct one: a run saved by a build in
    // which no move had a price cannot have spent an allowance.
    const g = await load()
    g.placeBlock('wood', -3, 0)
    g.moveBlock(-3, 0, 3, 0)
    g.saveRunSnapshot()
    const { getState, setState, flushPersist } = await import('@/use/useTowerState')
    const { RUN_KEY } = await import('@/keys')
    const snap = { ...getState<Record<string, unknown>>(RUN_KEY, {}) }
    expect(snap.moves).toBe(1)
    delete snap.moves
    delete snap.movesWindow
    setState(RUN_KEY, snap)
    flushPersist()

    vi.resetModules()
    const h = await import('@/use/useTowerGame')
    expect(h.resumeRun()).toBe(true)
    expect(h.moveCost.value).toBe(h.MOVE_COST)
    expect(h.cheapMovesLeft.value).toBe(h.CHEAP_MOVES)
  })
})

import { describe, expect, it, vi } from 'vitest'

/**
 * ─── The reinforced hand lasts until the pieces do ──────────────────────────
 *
 * Thirty wallet coins, or a rewarded video, turns the four-or-five pieces the
 * player is looking at gold: more HP, more damage, and a badge on each card
 * saying so. It is the most expensive thing a player can buy inside a single
 * run, and the one whose value is hardest to see afterwards — a block on the
 * tower does not say what it cost.
 *
 * So the contract is simple and it has to be airtight: **the only thing that
 * spends the reinforcement is placing the piece.** Everything else — calling a
 * wave, clearing one, reloading the page, coming back on another device — hands
 * the rest of the hand back exactly as gold as it was.
 *
 * Two halves are pinned here, and the second one shipped broken:
 *
 *   1. LIVE. Nothing in a wave touches the flags. That is true today only
 *      because `dealOffers` happens not to be called on the wave path, which is
 *      correctness by omission — the kind that survives until someone adds a
 *      re-deal and cannot see what it costs. Pinned so the omission becomes a
 *      decision.
 *   2. PERSISTED. `resumeRun` restored the exact hand and then set every flag
 *      to false, so a reload handed the player their own pieces with the
 *      purchase stripped off. The snapshot is written at every wave boundary,
 *      which is why this presented as "calling a wave takes it away".
 */

const load = async () => {
  vi.resetModules()
  localStorage.clear()
  const g = await import('@/use/useTowerGame')
  g.startRun()
  g.seedScriptedOpening(true)
  // Modest on purpose. A 9999 purse is a HOARD, and `hoardFactor` prices the
  // next wave against it hard enough to kill the scripted fort — which has
  // nothing to do with what these tests are about.
  g.wood.value = 220
  g.stone.value = 160
  g.runCoins.value = 60
  return g
}

type Game = Awaited<ReturnType<typeof load>>

/** Fight the current wave to its end. */
const playWave = (g: Game): void => {
  g.buildClockHeld.value = false
  g.callWave()
  for (let t = 0; t < 200_000 && g.phase.value === 'battle'; t += 16) g.step(16)
  expect(g.phase.value).toBe('build')
}

const allGold = (g: Game): boolean => g.offerEnhanced.value.every(Boolean)

/**
 * Place the piece in `slot` on the first cell it legally fits.
 *
 * Scanned rather than hard-coded: the board these tests open on carries the
 * scripted fort, so which cells are free depends on the opening's layout and on
 * whichever shape the deck happened to deal into that slot. A fixed coordinate
 * here is a test that fails whenever either is retuned, for a reason that has
 * nothing to do with what it is checking.
 */
const buildFrom = (g: Game, slot: number): void => {
  const shapeId = g.offers.value[slot]!
  for (let r = 0; r <= 6; r++) {
    for (let c = -8; c <= 8; c++) {
      if (!g.canPlaceShapeAt(shapeId, c, r)) continue
      expect(g.placeShape(slot, c, r, 0), `placing ${shapeId} at ${c},${r}`).toBe(true)
      return
    }
  }
  throw new Error(`no legal cell for ${shapeId} in slot ${slot}`)
}

describe('what a wave does to it: nothing', () => {
  it('survives the call', async () => {
    const g = await load()
    g.dealEnhancedOffers()
    expect(allGold(g)).toBe(true)
    g.callWave()
    expect(allGold(g)).toBe(true)
  })

  it('survives the fight and the wave clear', async () => {
    const g = await load()
    g.dealEnhancedOffers()
    playWave(g)
    expect(g.wave.value).toBe(1)
    // Entering a build phase runs `ensureAffordableWeapon`, which may swap the
    // weapon slot's piece. It deliberately keeps the flag — the player paid to
    // reinforce whatever is in that lane — so the hand is still whole.
    expect(allGold(g)).toBe(true)
  })

  it('spends across several waves, a piece at a time, exactly as asked', async () => {
    // The user's own words: "the player should be able to continue to build the
    // reinforced versions until the boxes are rotated out". So this plays it
    // the way a player does — fight, build one gold piece, fight again — and
    // asserts the hand is only ever one slot poorer, never wiped.
    //
    // It BUILDS rather than hoarding, and that is load-bearing: sitting on a
    // 9999 purse raises the hoard surcharge (`hoardFactor`) enough to kill the
    // scripted fort on wave 2, so a version of this test that just topped the
    // purse up between waves died for reasons that had nothing to do with the
    // hand.
    const g = await load()
    g.dealEnhancedOffers()
    const slots = g.offerEnhanced.value.length

    for (let i = 0; i < 3; i++) {
      playWave(g)
      // Every slot the player has not spent is still gold on the far side of
      // the wave — which is the whole claim.
      expect(g.offerEnhanced.value.slice(i).every(Boolean), `after wave ${i + 1}`).toBe(true)
      buildFrom(g, i)
      expect(g.offerEnhanced.value[i], `slot ${i} after building it`).toBe(false)
      expect(g.offerEnhanced.value).toHaveLength(slots)
    }
    expect(g.wave.value).toBe(3)
    // Three spent, the rest still paid for.
    expect(g.offerEnhanced.value.slice(3).every(Boolean)).toBe(true)
  })

  it('is spent one slot at a time, by BUILDING', async () => {
    // The intended way to lose it, and the only one. Placing a reinforced piece
    // rotates that slot over; the rest of the hand is untouched.
    const g = await load()
    g.dealEnhancedOffers()
    const slots = g.offerEnhanced.value.length

    buildFrom(g, 0)
    expect(g.offerEnhanced.value[0]).toBe(false)
    expect(g.offerEnhanced.value.slice(1).every(Boolean)).toBe(true)
    expect(g.offerEnhanced.value).toHaveLength(slots)

    // …and the block that went down really is reinforced, or the purchase paid
    // for a colour.
    const placed = [...g.getTowerBlocks().values()].filter((b) => b.enhanced)
    expect(placed.length).toBeGreaterThan(0)
  })

  it('is spent by a manual reroll too — that slot, and only that slot', async () => {
    const g = await load()
    g.dealEnhancedOffers()
    expect(g.manualReroll(1)).toBe(true)
    expect(g.offerEnhanced.value[1]).toBe(false)
    expect(g.offerEnhanced.value[0]).toBe(true)
    expect(g.offerEnhanced.value[2]).toBe(true)
  })
})

describe('what a reload does to it: nothing, now', () => {
  const reload = async (g: Game) => {
    g.saveRunSnapshot()
    const { flushPersist } = await import('@/use/useTowerState')
    flushPersist()
    vi.resetModules()
    const h = await import('@/use/useTowerGame')
    expect(h.resumeRun()).toBe(true)
    return h
  }

  it('brings the whole gold hand back', async () => {
    // The bug, exactly as a player met it: buy the hand, play a wave (which
    // writes the snapshot), reload, and every piece is back — plain.
    const g = await load()
    g.dealEnhancedOffers()
    playWave(g)
    const hand = g.offers.value.slice()

    const h = await reload(g)

    expect(h.offers.value).toEqual(hand)
    expect(h.offerEnhanced.value.every(Boolean)).toBe(true)
  })

  it('brings back a partly spent hand exactly as partly spent', async () => {
    const g = await load()
    g.dealEnhancedOffers()
    buildFrom(g, 0)
    const before = g.offerEnhanced.value.slice()
    expect(before[0]).toBe(false)

    const h = await reload(g)

    expect(h.offerEnhanced.value).toEqual(before)
  })

  it('never reinforces a slot the restore had to fill itself', async () => {
    // The reinforcement follows the PIECE. If the snapshot is short — an older
    // build, or a shape since dropped from the catalogue — the missing slots
    // are rolled fresh, and the player never paid for those.
    const g = await load()
    g.dealEnhancedOffers()
    g.saveRunSnapshot()
    const { getState, setState, flushPersist } = await import('@/use/useTowerState')
    const { RUN_KEY } = await import('@/keys')
    const snap = { ...getState<Record<string, unknown>>(RUN_KEY, {}) }
    // A hand from a build with two fewer slots, but a flag array claiming all
    // of them — the shape a naive pad would get wrong.
    snap.offers = (snap.offers as string[]).slice(0, 2)
    snap.enhanced = [true, true, true, true, true]
    setState(RUN_KEY, snap)
    flushPersist()

    vi.resetModules()
    const h = await import('@/use/useTowerGame')
    expect(h.resumeRun()).toBe(true)
    expect(h.offerEnhanced.value.slice(0, 2).every(Boolean)).toBe(true)
    expect(h.offerEnhanced.value.slice(2).some(Boolean)).toBe(false)
    expect(h.offerEnhanced.value).toHaveLength(h.offers.value.length)
  })

  it('restores an older snapshot as plain rather than throwing', async () => {
    const g = await load()
    g.dealEnhancedOffers()
    g.saveRunSnapshot()
    const { getState, setState, flushPersist } = await import('@/use/useTowerState')
    const { RUN_KEY } = await import('@/keys')
    const snap = { ...getState<Record<string, unknown>>(RUN_KEY, {}) }
    delete snap.enhanced
    setState(RUN_KEY, snap)
    flushPersist()

    vi.resetModules()
    const h = await import('@/use/useTowerGame')
    expect(h.resumeRun()).toBe(true)
    // Written by a build in which the flag did not exist, so it was written
    // unreinforced. Restoring it that way is honest; restoring it gold would
    // hand every existing save a free purchase.
    expect(h.offerEnhanced.value.some(Boolean)).toBe(false)
  })

  it('starts a NEW run plain, whatever the last one had bought', async () => {
    const g = await load()
    g.dealEnhancedOffers()
    expect(allGold(g)).toBe(true)
    g.startRun()
    expect(g.offerEnhanced.value.some(Boolean)).toBe(false)
  })
})

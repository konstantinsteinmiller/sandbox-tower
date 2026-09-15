import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STATE_KEY } from '@/use/useTowerState'
import { useAutoHand } from '@/use/useAutoHand'

/**
 * ─── The gift's drag lesson ─────────────────────────────────────────────────
 *
 * Two rounds of playtesting have ended with a player holding a gift they could
 * not work out how to put down, so the first free one is demonstrated: the hand
 * picks the tray tile up, carries it to a cell the gift could really go on, and
 * lets go.
 *
 * Three properties are worth pinning, and none of them is "it looks right":
 *
 *   • It must never PLACE the gift. It is a demonstration, and a demo that
 *     spent the prize would take the one decision it is teaching.
 *   • It must be once per player, seeded from the save at module load — which
 *     is why every case re-imports under `vi.resetModules()`.
 *   • It must aim at a cell that is both legal AND on screen. A hand that
 *     glides off the edge, or onto a cell the player's own tap would be
 *     refused at, teaches the wrong thing twice over.
 *
 * The gift queue and the camera are stubbed: `giftAnchors` needs a real tower
 * and the projection needs a real viewport, and neither is what is under test
 * here — the CHOICE among the cells they return is.
 */

const stub = vi.hoisted(() => ({
  /** Stands in for the `nextGift` computed; the coach only ever reads `.value`
   *  and compares it by identity to notice the player getting there first. */
  nextGift: { value: null as { typeId: string; tier: number; source: string; free?: boolean } | null },
  anchors: [] as Array<[number, number]>,
  /** Which of those anchors `giftPlacementAt` would actually accept. */
  legal: (_c: number, _r: number) => true
}))

vi.mock('@/use/useGifts', () => ({
  nextGift: stub.nextGift,
  giftAnchors: () => stub.anchors,
  giftPlacementAt: (_g: unknown, c: number, r: number) =>
    (stub.legal(c, r) ? { c, r, w: 1, h: 1 } : null)
}))

// A 40 px cell with the origin at (480, 360) — jsdom's window is 1024 × 768,
// so columns out past ±12 and rows below the ground fall off the screen, which
// is exactly the case the target picker has to refuse.
vi.mock('@/use/useTowerCamera', () => ({
  worldToScreenX: (wx: number) => 480 + wx * 40,
  worldToScreenY: (wy: number) => 360 - wy * 40
}))

const FREE_GIFT = { typeId: 'cannon', tier: 2, source: 'firstClear', free: true }
const PAID_GIFT = { typeId: 'tesla', tier: 1, source: 'chest', free: false }

const seedSave = (fields: Record<string, unknown>): void => {
  localStorage.setItem(STATE_KEY, JSON.stringify(fields))
}

const load = async () => {
  vi.resetModules()
  return import('@/use/useGiftCoach')
}

/** A gift tile in the DOM at a known place — jsdom measures nothing on its
 *  own, so the rect is the one thing that has to be handed over. */
const mountTile = (): HTMLElement => {
  const el = document.createElement('div')
  el.setAttribute('data-gift-tile', '')
  el.getBoundingClientRect = () => ({
    left: 100, top: 600, width: 60, height: 60,
    right: 160, bottom: 660, x: 100, y: 600, toJSON: () => ({})
  }) as DOMRect
  document.body.appendChild(el)
  return el
}

beforeEach(() => {
  localStorage.clear()
  document.body.innerHTML = ''
  stub.nextGift.value = { ...FREE_GIFT }
  stub.anchors = [[0, 0], [1, 0], [0, 3], [-1, 3], [2, 3]]
  stub.legal = () => true
})

afterEach(() => {
  vi.useRealTimers()
})

describe('which cell the demo drags to', () => {
  it('takes the crown, and the most central column on it', async () => {
    const { pickGiftTarget } = await load()
    const project = (c: number, r: number) => ({ x: 100 + c * 10, y: 100 - r * 10 })
    const best = pickGiftTarget(
      [[0, 0], [2, 3], [-1, 3], [5, 1]], project, () => true
    )
    // Row 3 is the highest; of the two cells on it, -1 is nearer the middle.
    expect(best?.cell).toEqual([-1, 3])
    expect(best?.at).toEqual({ x: 90, y: 70 })
  })

  it('skips cells that are off screen rather than gliding to them', async () => {
    const { pickGiftTarget } = await load()
    const project = (c: number, r: number) => ({ x: 100 + c * 10, y: 100 - r * 10 })
    // The crown is off screen; the demo settles for the highest cell that is on.
    const best = pickGiftTarget(
      [[0, 0], [0, 9]], project, (p) => p.y > 50
    )
    expect(best?.cell).toEqual([0, 0])
  })

  it('has nothing to aim at when every cell is off screen', async () => {
    const { pickGiftTarget } = await load()
    expect(pickGiftTarget([[0, 0]], () => ({ x: 0, y: 0 }), () => false)).toBeNull()
  })
})

describe('who gets the lesson', () => {
  it('is for a FREE gift, and not for a bought one', async () => {
    const { shouldRunGiftCoach } = await load()
    expect(shouldRunGiftCoach(FREE_GIFT)).toBe(true)
    expect(shouldRunGiftCoach(PAID_GIFT)).toBe(false)
    expect(shouldRunGiftCoach(null)).toBe(false)
  })

  it('never plays again for a player whose save says it has', async () => {
    seedSave({ ts_gift_coach: true })
    const { shouldRunGiftCoach, giftCoachDone } = await load()
    expect(giftCoachDone.value).toBe(true)
    expect(shouldRunGiftCoach(FREE_GIFT)).toBe(false)
  })

  it('picks the flag up from a cloud save that landed after boot', async () => {
    // The real sequence on a platform build: the module is seeded at import
    // with whatever was there (nothing), the SDK's blob arrives, the save layer
    // re-reads it, and the scene asks again once the run is up.
    const coach = await load()
    const { reloadTowerState } = await import('@/use/useTowerState')
    expect(coach.giftCoachDone.value).toBe(false)
    seedSave({ ts_gift_coach: true })
    reloadTowerState()
    coach.refreshGiftCoach()
    expect(coach.giftCoachDone.value).toBe(true)
  })
})

describe('playing the lesson', () => {
  it('grabs the tile, carries it to a legal cell, lets go — and places nothing', async () => {
    vi.useFakeTimers()
    mountTile()
    const { runGiftCoach } = await load()
    const auto = useAutoHand()
    const held = stub.nextGift.value

    const done = runGiftCoach({ hand: auto, canPlay: () => true })

    // Starts on the tile, finger down and holding the piece.
    await vi.advanceTimersByTimeAsync(430)
    expect([auto.hand.x, auto.hand.y]).toEqual([130, 630])
    expect(auto.hand.carrying).toBe(true)

    // Carried to the crown: (0, 3) is the highest central cell on screen.
    await vi.advanceTimersByTimeAsync(300 + 100)
    expect(auto.hand.carrying).toBe(true)
    expect([auto.hand.x, auto.hand.y]).toEqual([480, 360 - 3.5 * 40])

    await vi.advanceTimersByTimeAsync(5_000)
    await expect(done).resolves.toBe('played')
    expect(auto.hand.visible).toBe(false)

    // The prize is still the player's to place.
    expect(stub.nextGift.value).toBe(held)
    // And the lesson is spent.
    expect(JSON.parse(localStorage.getItem(STATE_KEY) ?? '{}').ts_gift_coach).toBe(true)
  })

  it('aims only at cells a real drop would be accepted at', async () => {
    vi.useFakeTimers()
    mountTile()
    // The crown looks legal to the socket list and is refused by the placement
    // rule — the case where the two disagree is the one worth pinning.
    stub.legal = (_c, r) => r === 0
    const { runGiftCoach } = await load()
    const auto = useAutoHand()
    const done = runGiftCoach({ hand: auto, canPlay: () => true })

    await vi.advanceTimersByTimeAsync(430 + 300 + 100)
    expect([auto.hand.x, auto.hand.y]).toEqual([480, 360 - 0.5 * 40])
    await vi.advanceTimersByTimeAsync(5_000)
    await expect(done).resolves.toBe('played')
  })

  it('stops the moment something else takes the screen, and stays unspent', async () => {
    vi.useFakeTimers()
    mountTile()
    const { runGiftCoach } = await load()
    const auto = useAutoHand()
    let free = true
    const done = runGiftCoach({ hand: auto, canPlay: () => free })

    await vi.advanceTimersByTimeAsync(500)
    expect(auto.hand.visible).toBe(true)
    free = false
    await vi.advanceTimersByTimeAsync(300)
    expect(auto.hand.visible).toBe(false)

    await vi.advanceTimersByTimeAsync(5_000)
    await expect(done).resolves.toBe('cancelled')
    // Never shown, never spent: the next free gift can still teach it.
    expect(JSON.parse(localStorage.getItem(STATE_KEY) ?? '{}').ts_gift_coach).toBeUndefined()
  })

  it('gives up quietly when the tile is not on screen', async () => {
    const { runGiftCoach } = await load()
    const auto = useAutoHand()
    await expect(runGiftCoach({ hand: auto, canPlay: () => true })).resolves.toBe('lost')
    expect(auto.hand.visible).toBe(false)
  })

  it('gives up quietly when the gift has nowhere legal to go', async () => {
    mountTile()
    stub.legal = () => false
    const { runGiftCoach } = await load()
    const auto = useAutoHand()
    await expect(runGiftCoach({ hand: auto, canPlay: () => true })).resolves.toBe('lost')
  })

  it('does not run a second time', async () => {
    vi.useFakeTimers()
    mountTile()
    const coach = await load()
    const auto = useAutoHand()
    const first = coach.runGiftCoach({ hand: auto, canPlay: () => true })
    await vi.advanceTimersByTimeAsync(5_000)
    await expect(first).resolves.toBe('played')

    stub.nextGift.value = { ...FREE_GIFT }
    await expect(coach.runGiftCoach({ hand: auto, canPlay: () => true })).resolves.toBe('skipped')
  })
})

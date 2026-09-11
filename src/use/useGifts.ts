import { computed, shallowRef, watch } from 'vue'
import { BLOCK_DEFS, blockDef, canMergeBlocks } from '@/game/blocks'
import { registerShapeDefs, SHAPE_BY_ID } from '@/game/shapes'
import { onRulesChange, rulesNow } from '@/game/rules'
import { getState, setState } from '@/use/useTowerState'
import { availableBlocks } from '@/use/useTowerProgress'
import {
  phase, wave, canPlaceShapeAt, canDropAt, spawnGiftBlocks, dropGiftCell, onRunStart
} from '@/use/useTowerGame'
import {
  GIFTS_KEY, M2_GIFTS_KEY, FIRST_CLEAR_GIFT_KEY, M2_FIRST_CLEAR_GIFT_KEY, M2_RUN_KEY
} from '@/keys'

/**
 * ─── Gift pieces ────────────────────────────────────────────────────────────
 *
 * A piece the player did not pay for, and usually could not have bought: a
 * weld of a gun the tech tree has not opened yet. Two ways to win one —
 *
 *   · the FLYING CHEST, once per wave, tapped out of the sky (FlyingChest.vue);
 *   · the FIRST-CLEAR present, once per save, for clearing wave 3 — the
 *     onboarding rule that a first clear should hand the player a THING, not a
 *     number: "here is a gun you did not have" is a reason to start wave 4.
 *
 * WHY A GIFT IS A WELD. Merging is what holds playtime, and the tier-3 gun is
 * the one players never reached — they stopped at tier 2. A gift arrives
 * already merged, so the first time many players see a blue tier-3 battery on
 * their own tower is the chest's jackpot, and the tier colours and the twin /
 * triple barrels explain the rest.
 *
 * What a gift IS on each board follows that board's own merge rule:
 *
 *   · the TOWER (`mergeArt: 'footprint'`): a tier 2 is ONE 2×1 block (or 1×2,
 *     whichever fits where the player tapped), a tier 3 one 2×2 — exactly what
 *     two or four twins welded there would have become. A type the tower never
 *     fuses (the obelisk: a buff is not a weapon) comes as a plain pair.
 *   · the DROP board (`mergeArt: 'cell'`): one cell, already at its tier,
 *     dropped into a column like any piece.
 *
 * PERSISTED, per board, for the run it was won in. A prize that vanished on a
 * reload is the one "lost my reward" complaint worth designing out; a prize
 * that followed the player into their next siege would make the chest a bank.
 * So the queue is saved on every change and cleared by `startRun` — a resumed
 * run keeps its gifts, a new one starts with none.
 */

export interface Gift {
  /** The block the gift is made of. */
  typeId: string
  /** The merge tier it arrives at: 2, or 3 for the jackpot. */
  tier: number
  /** Where it came from — drives the cue, never the gift itself. */
  source: 'chest' | 'firstClear'
}

/** Unplaced gifts held at once. The chest does not fly while the tray is full:
 *  a prize with nowhere to go is a prize the player watches expire. */
export const MAX_GIFTS = 3

/**
 * What a chest can hold, with its draw weight.
 *
 * The strong, late guns — the coil, the frost emitter, the mortar — and the
 * obelisk, a buff block that changes how a tower is built around it. Rarer,
 * because it does not shoot, and a chest that paid out a stone that sits there
 * would read as the worse prize.
 */
export const CHEST_GIFTS: ReadonlyArray<readonly [string, number]> = [
  ['tesla', 3], ['frost', 3], ['mortar', 3], ['obelisk', 1]
]

/** Chance that a chest's gun arrives as a tier 3 instead of a tier 2. */
export const CHEST_JACKPOT_CHANCE = 0.1

/** The first wave whose clear hands over the one-time present. */
export const FIRST_CLEAR_WAVE = 3

/** The present: the gun the scripted fort already carries, one weld deep. */
export const FIRST_CLEAR_GIFT: Gift = { typeId: 'cannon', tier: 2, source: 'firstClear' }

// ─── The queue ──────────────────────────────────────────────────────────────

export const gifts = shallowRef<Gift[]>([])

/** The gift the tray offers next. */
export const nextGift = computed<Gift | null>(() => gifts.value[0] ?? null)

/**
 * The most recent arrival, with a counter so two identical gifts in a row are
 * still two cues. The tile watches it to celebrate.
 */
export const giftArrival = shallowRef<{ gift: Gift; n: number } | null>(null)

const keysNow = (): { queue: string; firstClear: string } =>
  rulesNow().save.runKey === M2_RUN_KEY
    ? { queue: M2_GIFTS_KEY, firstClear: M2_FIRST_CLEAR_GIFT_KEY }
    : { queue: GIFTS_KEY, firstClear: FIRST_CLEAR_GIFT_KEY }

/** A persisted entry is only trusted if it still names a real block at a
 *  tier this code can place. A save from a future build is dropped, not
 *  half-honoured. */
const isGift = (g: unknown): g is Gift => {
  if (!g || typeof g !== 'object') return false
  const o = g as Record<string, unknown>
  return typeof o.typeId === 'string' && !!BLOCK_DEFS[o.typeId]
    && typeof o.tier === 'number' && o.tier >= 2 && o.tier <= 3
    && (o.source === 'chest' || o.source === 'firstClear')
}

const persist = (): void => {
  setState(keysNow().queue, gifts.value.map((g) => ({ ...g })))
}

/**
 * Re-read the queue for the board in force.
 *
 * Called when the rules change (the phone scene applies its rule set after
 * this module has loaded) and by the tile on mount, after the boot — a cloud
 * save can land after the first read.
 */
export const reloadGifts = (): void => {
  const raw = getState<unknown>(keysNow().queue, [])
  gifts.value = Array.isArray(raw) ? raw.filter(isGift).slice(0, MAX_GIFTS) : []
}

/** Queue a gift. Returns false, changing nothing, when the tray is full. */
export const grantGift = (gift: Gift): boolean => {
  if (gifts.value.length >= MAX_GIFTS || !isGift(gift)) return false
  gifts.value = [...gifts.value, { ...gift }]
  persist()
  giftArrival.value = { gift: { ...gift }, n: (giftArrival.value?.n ?? 0) + 1 }
  return true
}

export const clearGifts = (): void => {
  gifts.value = []
  persist()
}

const takeNextGift = (): void => {
  gifts.value = gifts.value.slice(1)
  persist()
}

// ─── What a gift becomes on the board in force ──────────────────────────────

/** Does this board weld two of `typeId` into one block? */
export const giftFuses = (typeId: string): boolean => {
  const rules = rulesNow()
  return canMergeBlocks({ typeId }, { typeId }, rules.mergeTypes, rules.maxMergeTier)
}

/** A gift footprint on the tower board, in cells. */
export interface GiftFootprint { c: number; r: number; w: number; h: number }

/**
 * The footprints a tier comes in on the tower board, preferred first.
 *
 * A tier 2 is two cells, so it can lie down or stand up — flat first, because
 * a flat 2×1 is what a weld of two side-by-side twins looks like and it is the
 * one that fits on the ground either side of a tower. A tier 3 is the 2×2
 * bastion, which has no second orientation.
 */
const FOOTPRINTS: Readonly<Record<number, ReadonlyArray<readonly [number, number]>>> = {
  2: [[2, 1], [1, 2]],
  3: [[2, 2]]
}

/**
 * The shape id a footprint is checked and ghosted as.
 *
 * Registered in the shared shape index on first use (never in a deck, so no
 * hand can ever deal one): it is what lets the placement check and the build
 * ghost treat a gift as exactly the piece it looks like.
 */
export const giftShapeId = (typeId: string, w: number, h: number): string => {
  const id = `gift:${typeId}:${w}x${h}`
  if (!SHAPE_BY_ID[id]) {
    const cells: Array<[number, number, string]> = []
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) cells.push([dx, dy, typeId])
    registerShapeDefs([{ id, lane: 'weapon', weight: 0, cells }])
  }
  return id
}

/**
 * Where the gift would go if the player tapped `(c, r)` — or null.
 *
 * Snapped around the tapped cell rather than anchored on it: a two-cell piece
 * has two cells the player could have meant, and a tap that is one cell off a
 * legal spot should land, not buzz. Every candidate still passes the same
 * `canPlaceShapeAt` a bought piece does — the snap chooses between legal
 * placements, it never invents one.
 */
export const giftPlacementAt = (gift: Gift, c: number, r: number): GiftFootprint | null => {
  for (const [w, h] of FOOTPRINTS[Math.min(3, Math.max(2, gift.tier))] ?? []) {
    const id = giftShapeId(gift.typeId, w, h)
    for (let ox = 0; ox < w; ox++) {
      for (let oy = 0; oy < h; oy++) {
        if (canPlaceShapeAt(id, c - ox, r - oy)) return { c: c - ox, r: r - oy, w, h }
      }
    }
  }
  return null
}

/** Place the next gift on the tower board around `(c, r)`. */
export const placeGiftAt = (c: number, r: number): boolean => {
  const gift = nextGift.value
  if (!gift) return false
  const at = giftPlacementAt(gift, c, r)
  if (!at) return false
  if (!spawnGiftBlocks(gift.typeId, gift.tier, at.c, at.r, at.w, at.h, giftFuses(gift.typeId))) return false
  takeNextGift()
  return true
}

/** Can the next gift go into column `c` of the drop board? */
export const canDropGiftAt = (c: number): boolean => nextGift.value != null && canDropAt(c, 1)

/** Drop the next gift into column `c` of the drop board. */
export const dropGiftAt = (c: number): boolean => {
  const gift = nextGift.value
  if (!gift || !dropGiftCell(gift.typeId, gift.tier, c)) return false
  takeNextGift()
  return true
}

// ─── The chest's draw ───────────────────────────────────────────────────────

/**
 * Roll what a chest holds.
 *
 * Prefers what the player has NOT unlocked: the chest is a taste of the tree,
 * and a tier-2 of a gun already in every hand is a smaller surprise than one
 * that has never been in any. Once everything is owned, all four are fair game.
 * The jackpot is for guns only — a tier-3 obelisk is a rule nobody has met.
 */
export const rollChestGift = (
  rand: () => number = Math.random,
  owned: ReadonlySet<string> = availableBlocks.value
): Gift => {
  const locked = CHEST_GIFTS.filter(([id]) => !owned.has(id))
  const pool = locked.length > 0 ? locked : CHEST_GIFTS
  const total = pool.reduce((s, [, w]) => s + w, 0)
  let pick = rand() * total
  let typeId = pool[pool.length - 1]![0]
  for (const [id, w] of pool) {
    pick -= w
    if (pick < 0) { typeId = id; break }
  }
  const gun = blockDef(typeId).weapon !== undefined
  const tier = gun && rand() < CHEST_JACKPOT_CHANCE ? 3 : 2
  return { typeId, tier, source: 'chest' }
}

// ─── The first-clear present ────────────────────────────────────────────────

/**
 * Hand over the present on the first wave cleared at or past wave 3, once
 * per save and board.
 *
 * "At or past", not "exactly 3": a player who was already deeper than that
 * when this shipped has cleared wave 3 many times and was never given it, and
 * the next wave they clear is the first chance to.
 *
 * Synchronous, so a headless run of the simulation sees the gift on the same
 * tick the wave ends.
 */
watch(phase, (next, prev) => {
  if (next !== 'build' || prev !== 'battle' || wave.value < FIRST_CLEAR_WAVE) return
  const key = keysNow().firstClear
  if (getState<boolean>(key, false) === true) return
  if (grantGift({ ...FIRST_CLEAR_GIFT })) setState(key, true)
}, { flush: 'sync' })

onRunStart(clearGifts)
onRulesChange(reloadGifts)
reloadGifts()

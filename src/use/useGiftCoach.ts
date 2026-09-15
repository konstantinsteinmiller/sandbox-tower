import { computed, ref, type ComputedRef } from 'vue'
import { flushPersist, getState, setState } from '@/use/useTowerState'
import { GIFT_COACH_KEY } from '@/keys'
import { giftAnchors, giftPlacementAt, nextGift, type Gift } from '@/use/useGifts'
import { worldToScreenX, worldToScreenY } from '@/use/useTowerCamera'
import type { AutoHand, HandPoint, HandStep } from '@/use/useAutoHand'

/**
 * ─── "Drag it onto the tower" ───────────────────────────────────────────────
 *
 * A gift is the one piece in the game a player is handed rather than sold, and
 * two rounds of playtesting running it has been the piece they could not get
 * rid of: on 2026-09-14 two of three testers who won one gave up while still
 * holding it. The sockets (`giftAnchors`) were added for exactly that and are
 * not enough on their own, because they only appear once the gift is IN HAND —
 * which is the state the player never reached. Nothing on screen says the gold
 * tile in the tray is a thing you pick up and carry.
 *
 * So the first time a free gift lands, the hand shows it: press the tile, carry
 * it across, set it down on a cell the gift could really go on, let go. Two
 * seconds, wordless — a gesture is faster demonstrated than captioned, and a
 * caption would need twenty locales to say "drag this".
 *
 * IT NEVER PLACES THE GIFT. The hand mimes the drop and the piece stays in the
 * tray. A demo that spent the prize would take the one decision the lesson is
 * about — WHERE it goes — away from the player it is teaching, and on a board
 * where placement is most of the game that is worse than not teaching them.
 *
 * ONCE PER PLAYER, and one flag for both boards, on the same reasoning
 * `useTechDiscovery` uses for the tech tree: the gesture is the gesture, and a
 * player who has been shown it on the phone has been shown it.
 */

/**
 * The persisted "already shown" flag, catalogued in `src/keys.ts` with every
 * other `ts_`-prefixed field in the save blob. Re-exported here so a reader of
 * this module can see which field it owns without a second hop.
 */
export { GIFT_COACH_KEY }

/** Re-read on demand: module scope runs before a platform build's cloud save
 *  has landed, exactly as `useTechDiscovery.refreshTechFound` describes. */
const readDone = (): boolean => getState<boolean>(GIFT_COACH_KEY, false) === true

/** A `ref`, not a plain `let`: `giftCoachDone` is a computed over it, and a
 *  computed over a bare variable caches its first answer forever — so a
 *  consumer that read it before the cloud save landed would never see the
 *  refresh below. */
const done = ref(readDone())

export const giftCoachDone: ComputedRef<boolean> = computed(() => done.value)

/** Called by the scene once the run is up, after a hydrate has either arrived
 *  or is not coming. Never un-marks a lesson that has been shown. */
export const refreshGiftCoach = (): void => {
  if (!done.value) done.value = readDone()
}

/**
 * Record that the lesson has played. Flushed rather than left to the state
 * layer's 200 ms debounce, for the reason `markTechFound` gives: a player who
 * has just been shown something is a player who may close the tab next, and
 * losing the write costs them the demo again in their next session.
 */
const markPlayed = (): void => {
  if (done.value) return
  done.value = true
  setState(GIFT_COACH_KEY, true)
  flushPersist()
}

/**
 * Is this gift worth the lesson?
 *
 * FREE ones only. A half-price chest prize is a purchase, and a player who has
 * reached one has almost certainly placed the free piece that came before it —
 * the first-clear present, which every save gets at wave 3.
 */
export const shouldRunGiftCoach = (gift: Gift | null | undefined): boolean =>
  !done.value && gift?.free === true

// ─── Where the hand starts and where it goes ────────────────────────────────

/** The gift tile's centre, or null when it is not on screen. The attribute is
 *  `GiftTile.vue`'s contract with this module. */
export const giftTilePoint = (): HandPoint | null => {
  const el = document.querySelector('[data-gift-tile]')
  const r = el?.getBoundingClientRect()
  return r && r.width > 0 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null
}

/**
 * A cell's centre in screen space.
 *
 * The inverse of `screenToCell`, which rounds the column and floors the row —
 * so column `c` is centred on world x `c`, and row `r` spans world y `[r, r+1)`
 * and is centred half a cell up. (The renderer agrees: it draws a socket from
 * `worldToScreenX(c - 0.5)`, `worldToScreenY(r + 1)` at one zoom square.)
 */
export const cellToScreen = (c: number, r: number): HandPoint =>
  ({ x: worldToScreenX(c), y: worldToScreenY(r + 0.5) })

/**
 * Which legal cell the demo drags to.
 *
 * The crown, and central: highest row first, then the column nearest the
 * tower's middle. That is where a player would put a gun they were given, so
 * the demo is a suggestion as well as an instruction — and it keeps the drag a
 * long, legible diagonal from the tray rather than a twitch to the nearest
 * ground cell beside it.
 *
 * Pure, and given its projection, so the choice can be tested without a camera.
 */
export const pickGiftTarget = (
  cells: ReadonlyArray<readonly [number, number]>,
  project: (c: number, r: number) => HandPoint,
  onScreen: (p: HandPoint) => boolean
): { cell: readonly [number, number]; at: HandPoint } | null => {
  let best: { cell: readonly [number, number]; at: HandPoint } | null = null
  for (const cell of cells) {
    const at = project(cell[0]!, cell[1]!)
    if (!onScreen(at)) continue
    if (!best) { best = { cell, at }; continue }
    const br = best.cell[1]!
    const bc = best.cell[0]!
    const c = cell[0]!
    const r = cell[1]!
    if (r > br || (r === br && Math.abs(c) < Math.abs(bc))) best = { cell, at }
  }
  return best
}

/**
 * Is a point somewhere the player will actually look?
 *
 * Inset from every edge, and by the HUD's own bars where the caller knows them
 * — a hand that glides under the build tray has demonstrated nothing. The
 * default insets are zero rather than guessed, so a caller that does not pass
 * them gets the honest screen rather than a made-up one.
 */
const EDGE_MARGIN_PX = 48

const isOnScreen = (p: HandPoint, inset: { top: number; bottom: number }): boolean =>
  p.x > EDGE_MARGIN_PX
  && p.x < window.innerWidth - EDGE_MARGIN_PX
  && p.y > inset.top + EDGE_MARGIN_PX
  && p.y < window.innerHeight - inset.bottom - EDGE_MARGIN_PX

// ─── The run ────────────────────────────────────────────────────────────────

export interface GiftCoachOptions {
  /**
   * The scene's own auto-hand, borrowed rather than a second one made here:
   * only one `TutorialHand` is mounted, and sharing the instance means the
   * scene's existing `autoHand.cancel()` calls — a modal opening, the tutorial
   * taking the screen — already cut this short for free.
   */
  hand: AutoHand
  /**
   * False while anything else owns the screen: a modal, an ad, the result
   * screen, the tutorial, a paused game. Supplied by the caller rather than
   * imported, so this module never reaches into the scene's state; polled
   * while the demo plays, so a dialog that opens mid-drag stops it.
   */
  canPlay: () => boolean
  /** HUD bars to keep the target clear of, if the caller tracks them. */
  inset?: () => { top: number; bottom: number }
}

export type GiftCoachOutcome = 'played' | 'skipped' | 'lost' | 'cancelled'

/** Cancels the poll below; the hand is cancelled through its own token. */
let stopWatch: (() => void) | null = null

/** Stop a demo that is playing. Safe to call when none is. */
export const cancelGiftCoach = (): void => {
  stopWatch?.()
  stopWatch = null
}

/**
 * Play the lesson, once ever.
 *
 * Resolves `skipped` when the gate says no (already shown, not a free gift),
 * `lost` when the tile or a legal target is not on screen, `cancelled` when
 * something took the screen, `played` when the whole drag ran.
 *
 * Marked as shown when the DROP lands, not when the run starts: a demo
 * cancelled by an ad in its first frame was never seen, and burning the one
 * showing on it would leave the player with the same gift and the same
 * question. By the drop the gesture has played out on screen.
 */
export const runGiftCoach = async (o: GiftCoachOptions): Promise<GiftCoachOutcome> => {
  const gift = nextGift.value
  if (!shouldRunGiftCoach(gift) || !gift) return 'skipped'
  if (!o.canPlay()) return 'skipped'

  const start = giftTilePoint()
  if (!start) return 'lost'

  const inset = o.inset?.() ?? { top: 0, bottom: 0 }
  // Only cells a tap would really be accepted at: `giftAnchors` lists the
  // sockets and `giftPlacementAt` is what the drop itself runs, so a target
  // that passes both is one the player can repeat.
  const legal = giftAnchors(gift).filter(([c, r]) => giftPlacementAt(gift, c, r) != null)
  const target = pickGiftTarget(legal, cellToScreen, (p) => isOnScreen(p, inset))
  if (!target) return 'lost'

  // The camera is still easing while the demo plays (a gift arrives on a wave
  // clear, which re-frames the tower), so the target is re-read when the glide
  // starts rather than frozen here.
  const tc = target.cell[0]!
  const tr = target.cell[1]!
  const to = (): HandPoint | null => {
    const at = cellToScreen(tc, tr)
    return isOnScreen(at, o.inset?.() ?? inset) ? at : null
  }

  let played = false
  const steps: HandStep[] = [
    // The arrival cue is on screen when a gift lands; let it be read first.
    { kind: 'wait', ms: 420 },
    { kind: 'grab', ms: 300 },
    { kind: 'move', to, ms: 820 },
    // Hovering over the socket, which lights under the fingertip.
    { kind: 'wait', ms: 260 },
    { kind: 'drop', ms: 140, then: () => { played = true; markPlayed() } },
    // Back to the tile: the last thing on screen is the piece still waiting,
    // so the lesson ends pointing at the thing the player has to do.
    { kind: 'move', to: () => giftTilePoint(), ms: 520 },
    { kind: 'wait', ms: 200 }
  ]

  // Anything that takes the screen, and the player beating the demo to it:
  // both end the run rather than talking over it.
  const held = gift
  const poll = window.setInterval(() => {
    if (!o.canPlay() || nextGift.value !== held) cancelGiftCoach()
  }, 120)
  stopWatch = () => {
    window.clearInterval(poll)
    o.hand.cancel()
  }

  const outcome = await o.hand.run(steps, start)
  window.clearInterval(poll)
  stopWatch = null

  if (outcome === 'done') return 'played'
  // The tail glide can be lost (the tray scrolled, the tile went) or cut short
  // AFTER the drop has already taught the gesture. That is a played lesson.
  return played ? 'played' : outcome === 'lost' ? 'lost' : 'cancelled'
}

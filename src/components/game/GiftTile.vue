<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onArtChanged } from '@/game/art'
import { rulesNow } from '@/game/rules'
import { tierStyle } from '@/game/tierStyle'
import {
  paintLiveFixture, paintTierPlate, paintWorldBlock, setBuildOverlay, type DropGuide
} from '@/use/useTowerArt'
import { screenToCell, screenToWorldX } from '@/use/useTowerCamera'
import { columnTop, halfWidthAt, previewGiftDrop, towerVersion } from '@/use/useTowerGame'
import { noteBuildAction } from '@/use/useIdleNudge'
import useSounds from '@/use/useSound'
import {
  canDropGiftAt, dropGiftAt, giftAnchors, giftArrival, giftFuses, giftPlacementAt, giftPrice,
  giftShapeId, gifts, missingForGift, nextGift, placeGiftAt, reloadGifts, CHEST_GIFT_DISCOUNT,
  FIRST_CLEAR_WAVE, type Gift
} from '@/use/useGifts'
import { denyPurchase } from '@/use/useResourceBlink'
import { requestRejectFlash } from '@/use/useWorldCues'
import IconGold from '@/components/icons/IconGold.vue'
import IconStone from '@/components/icons/IconStone.vue'
import IconWood from '@/components/icons/IconWood.vue'

/**
 * ─── The gift tile ──────────────────────────────────────────────────────────
 *
 * Where a won piece waits to be placed: in the hand's first slot, gold-rimmed,
 * with its price on it — FREE for the first-clear present and the first chest
 * a player ever opens, half price for every chest after that (`giftPrice`).
 * Tap it and the board takes the next tap as the placement; or drag it straight
 * onto the board. Either way it goes through the gift's own placement rules
 * (`useGifts`), which charge the bill the tile is showing.
 *
 * It owns its whole gesture — the scenes only mount it and stand their own
 * hand down when it arms (`armed`) — so neither board's placement handlers
 * learn about gifts. Board taps are read from the window AFTER the scene has
 * seen them (bubble phase), which leaves the scene's pan, pinch and long-press
 * bookkeeping untouched; with nothing armed in the hand, a scene does nothing
 * with a plain tap on empty ground, and the gift takes it.
 *
 * The preview is painted by the battlefield's own painters — the block face,
 * the gun at its tier's size and colour, the tier plate — so the tile shows the thing
 * that will land, not a symbol for it.
 */

interface Props {
  /** `cell`: the drop board — a gift drops into a column. `footprint`: the
   *  tower board — a gift is set down around the tapped cell. */
  variant: 'cell' | 'footprint'
  /** The battlefield canvas; board taps are recognised by their target. */
  canvas: HTMLCanvasElement | null
  /** A piece from the hand is armed — the gift stands down. */
  slotArmed?: boolean
  /** Tutorial, result screen, defeat: the tile is not on offer. */
  disabled?: boolean
  /**
   * Standing IN the hand's first slot rather than floating over it, at the
   * tray's own tile size. The first slot only ever deals walls, so a won piece
   * borrows it until it is placed and the wall comes back after — the free
   * piece sits where every other piece is picked up, not in a row of its own
   * the eye has to learn to check.
   */
  inTray?: boolean
  /** The preview's edge, px — the tray's tile size when `inTray`. */
  size?: number
}

const props = withDefaults(defineProps<Props>(), { slotArmed: false, disabled: false, inTray: false, size: 52 })

const emit = defineEmits<{
  /** The gift is in hand — the scene disarms whatever it was holding. */
  (e: 'armed'): void
  (e: 'placed', gift: Gift): void
}>()

const { t } = useI18n()
const { playSound } = useSounds()

const gift = nextGift
const armed = ref(false)
const count = computed(() => gifts.value.length)

/** A pair of plain blocks rather than one weld — the obelisk on the tower. */
const isPair = computed(() => !!gift.value && !giftFuses(gift.value.typeId))

/**
 * What this piece costs to set down: nothing for the first-clear present and
 * for the first chest a player ever opens, half price for every chest after
 * (`giftPrice`). Shown on the tile, because a piece that quietly takes wood
 * out of the pile when it lands is a piece the player did not agree to buy.
 */
const price = computed(() => (gift.value ? giftPrice(gift.value) : null))
const isFree = computed(() => gift.value?.free === true)
const offPct = computed(() => Math.round((1 - CHEST_GIFT_DISCOUNT) * 100))

const label = computed(() => {
  const g = gift.value
  if (!g) return ''
  const name = t(`blocks.names.${g.typeId}`)
  if (isPair.value) return t(isFree.value ? 'gift.pair' : 'gift.pairPaid', { name })
  return t(isFree.value ? 'gift.tile' : 'gift.tilePaid', { name, n: g.tier })
})

const rimColour = computed(() => (gift.value ? tierStyle(gift.value.tier).hex : '#ffd35c'))

// ─── The preview ────────────────────────────────────────────────────────────

const canvasEl = ref<HTMLCanvasElement | null>(null)

const paint = (): void => {
  const cv = canvasEl.value
  const g = gift.value
  if (!cv || !g) return
  const TILE_PX = props.size
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const px = Math.round(TILE_PX * dpr)
  if (cv.width !== px) { cv.width = px; cv.height = px }
  const ctx = cv.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, TILE_PX, TILE_PX)
  if (isPair.value) {
    // Two half-size blocks side by side: what lands is two of them.
    const s = TILE_PX * 0.46
    for (const x of [TILE_PX * 0.04, TILE_PX * 0.5]) {
      paintWorldBlock(ctx, g.typeId, x, TILE_PX * 0.3, s)
      paintLiveFixture(ctx, g.typeId, x + s / 2, TILE_PX * 0.3 + s / 2, s, { aim: 0.15, uid: 5, col: 1 })
    }
    return
  }
  const s = TILE_PX * 0.72
  const x = (TILE_PX - s) / 2
  const y = TILE_PX * 0.2
  paintWorldBlock(ctx, g.typeId, x, y, s)
  paintLiveFixture(ctx, g.typeId, x + s / 2, y + s / 2, s * 1.1, { aim: 0.15, uid: 5, col: 1, tier: g.tier })
  paintTierPlate(ctx, g.tier, x + s - s * 0.2, y + s * 0.17, s)
}

// ─── The arrival cue ────────────────────────────────────────────────────────

const cue = ref<string | null>(null)
const popping = ref(false)
let cueTimer = 0

watch(giftArrival, (a) => {
  if (!a) return
  cue.value = a.gift.source === 'firstClear'
    ? t('gift.firstClear', { n: FIRST_CLEAR_WAVE })
    : a.gift.free === true
      ? t('gift.free')
      : t('gift.discount', { n: Math.round((1 - CHEST_GIFT_DISCOUNT) * 100) })
  popping.value = false
  void nextTick(() => { popping.value = true })
  window.clearTimeout(cueTimer)
  cueTimer = window.setTimeout(() => { cue.value = null; popping.value = false }, 2_600)
})

// ─── Where a pointer is on the board ────────────────────────────────────────

/** The drop board's column under a screen x, or null off the board. */
const columnAt = (clientX: number): number | null => {
  const half = Math.max(0, halfWidthAt(0))
  const wx = screenToWorldX(clientX)
  if (Math.abs(wx) > half + 0.5) return null
  return Math.max(-half, Math.min(half, Math.round(wx)))
}

// ─── The overlay while the gift is in hand ──────────────────────────────────

let hover: { x: number; y: number } | null = null

/**
 * The drop board's guides for the gift in hand — with the welds each column's
 * drop would make (`previewGiftDrop`), so a tier-2 cannon gift held over a
 * tier-2 cannon shows the tier 3 it will become, exactly as a piece from the
 * hand does.
 *
 * Kept until the tower or the gift changes: `publish` runs on every pointer
 * move, and each preview replays a landing on a copy of the board.
 */
let guideMemo: { key: string; guides: DropGuide[] } | null = null

const cellGuides = (g: Gift): DropGuide[] => {
  // The purse is part of the key: a gift the player cannot pay for yet lights
  // no column, and the moment a kill's payout lands the columns must come
  // back — which the tower's own version would not tell us about.
  const payable = missingForGift(g).length === 0
  const key = `${towerVersion.value}|${g.typeId}|${g.tier}|${payable}`
  if (guideMemo?.key === key) return guideMemo.guides
  const half = Math.max(0, halfWidthAt(0))
  const maxRow = rulesNow().board.maxRow
  const guides: DropGuide[] = []
  for (let c = -half; c <= half; c++) {
    const valid = canDropGiftAt(c)
    guides.push({
      c,
      r: Math.min(maxRow, columnTop(c) + 1),
      valid,
      merges: valid ? previewGiftDrop(g.typeId, g.tier, c) : undefined
    })
  }
  guideMemo = { key, guides }
  return guides
}

const publish = (): void => {
  const g = gift.value
  if (!armed.value || !g) return
  if (props.variant === 'cell') {
    const maxRow = rulesNow().board.maxRow
    const guides = cellGuides(g)
    const col = hover ? columnAt(hover.x) : null
    setBuildOverlay({
      dropGuides: guides,
      dropRows: maxRow,
      dropColumn: col,
      dropValid: col != null && canDropGiftAt(col),
      hoverC: col,
      hoverR: col != null ? Math.min(maxRow, columnTop(col) + 1) : null
    })
    return
  }
  const preferred = giftShapeId(g.typeId, 2, g.tier >= 3 ? 2 : 1)
  if (!hover) {
    // In hand, pointer not on the board yet: the legal sockets already show
    // where it can go, exactly as they do for a piece from the hand.
    setBuildOverlay({ selectedShape: preferred, selectedRot: 0, hoverC: null, hoverR: null, hoverValid: false, slots: anchorsFor(g) })
    return
  }
  const cell = screenToCell(hover.x, hover.y)
  const at = giftPlacementAt(g, cell.c, cell.r)
  // Nowhere legal under the pointer: ghost the preferred footprint in red.
  setBuildOverlay({
    selectedShape: at ? giftShapeId(g.typeId, at.w, at.h) : preferred,
    selectedRot: 0,
    hoverC: at ? at.c : cell.c,
    hoverR: at ? at.r : cell.r,
    hoverValid: !!at,
    slots: anchorsFor(g)
  })
}

/** The gift's legal sockets, kept until the tower or the gift changes — the
 *  scan runs a placement check per cell and `publish` runs per pointer move. */
let anchorMemo: { key: string; anchors: Array<[number, number]> } | null = null
const anchorsFor = (g: Gift): Array<[number, number]> => {
  const key = `${towerVersion.value}|${g.typeId}|${g.tier}`
  if (anchorMemo?.key !== key) anchorMemo = { key, anchors: giftAnchors(g) }
  return anchorMemo.anchors
}

const clearOverlay = (): void => {
  if (props.variant === 'cell') {
    setBuildOverlay({ dropGuides: [], dropColumn: null, dropValid: false, hoverC: null, hoverR: null })
  } else {
    setBuildOverlay({ selectedShape: null, hoverC: null, hoverR: null, hoverValid: false, slots: [] })
  }
}

// ─── Arming ─────────────────────────────────────────────────────────────────

const arm = (): void => {
  if (!gift.value || props.disabled || armed.value) return
  armed.value = true
  emit('armed')
  playSound('modal-open', 0.03, 1.2)
  publish()
}

const disarm = (): void => {
  if (!armed.value) return
  armed.value = false
  hover = null
  clearOverlay()
}

/** Put the gift down where the pointer is. */
const placeAt = (clientX: number, clientY: number): boolean => {
  const g = gift.value
  if (!g) return false
  // A price the purse cannot meet is refused OUT LOUD and before the board is
  // looked at, exactly as a piece from the hand is: the short piles blink and
  // a knock plays. The gift stays in hand for when the payout lands.
  if (denyPurchase(missingForGift(g))) return false
  let ok = false
  if (props.variant === 'cell') {
    const c = columnAt(clientX)
    ok = c != null && dropGiftAt(c)
  } else {
    const cell = screenToCell(clientX, clientY)
    ok = placeGiftAt(cell.c, cell.r)
  }
  if (!ok) {
    playSound('obstacle-hit', 0.03)
    // Shown, not only heard: the red ghost shakes where it was refused and
    // every legal socket (tower) or landing cell (drop board) flashes green —
    // the same "not there; here" a piece from the hand gets. The gift stays
    // in hand for the next try.
    hover = { x: clientX, y: clientY }
    publish()
    requestRejectFlash()
    return false
  }
  playSound('reward-continue', 0.05)
  // A gift set down is building like any other: the idle nudge starts over.
  noteBuildAction()
  disarm()
  emit('placed', g)
  return true
}

// ─── The tile's own gesture: tap to arm, or drag onto the board ─────────────

const DRAG_SLOP_PX = 10
let press: { x: number; y: number; dragging: boolean } | null = null

const overCanvas = (x: number, y: number): boolean => {
  const cv = props.canvas
  if (!cv) return false
  const el = document.elementFromPoint?.(x, y)
  // `elementFromPoint` sees the HUD layers first; the canvas rect is the
  // honest answer to "is the finger over the board".
  if (el === cv) return true
  const r = cv.getBoundingClientRect()
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom && el?.closest?.('button') == null
}

const onTileMove = (e: PointerEvent): void => {
  if (!press) return
  if (!press.dragging && Math.hypot(e.clientX - press.x, e.clientY - press.y) > DRAG_SLOP_PX) {
    press.dragging = true
    arm()
  }
  if (press.dragging) {
    hover = { x: e.clientX, y: e.clientY }
    publish()
  }
}

const onTileUp = (e: PointerEvent): void => {
  window.removeEventListener('pointermove', onTileMove)
  window.removeEventListener('pointerup', onTileUp)
  window.removeEventListener('pointercancel', onTileUp)
  const p = press
  press = null
  if (!p) return
  if (!p.dragging) {
    if (armed.value) disarm()
    else arm()
    return
  }
  // A drag that lands somewhere illegal keeps the gift in hand: the refusal
  // flash shows where it CAN go, and the next tap puts it there.
  if (e.type !== 'pointercancel' && overCanvas(e.clientX, e.clientY)) placeAt(e.clientX, e.clientY)
  else disarm()
}

const onTileDown = (e: PointerEvent): void => {
  if (!gift.value || props.disabled) return
  e.preventDefault()
  e.stopPropagation()
  press = { x: e.clientX, y: e.clientY, dragging: false }
  window.addEventListener('pointermove', onTileMove)
  window.addEventListener('pointerup', onTileUp)
  window.addEventListener('pointercancel', onTileUp)
}

// ─── Board taps while the gift is in hand ───────────────────────────────────
//
// Bubble phase on the window, so the scene's canvas handlers have already run:
// a two-finger pinch, a drag-pan and a long-press are theirs, and only a short
// single tap is the gift's.

const TAP_MAX_MS = 350
const downOnBoard = new Map<number, { x: number; y: number; at: number }>()
let multi = false

const onBoardDown = (e: PointerEvent): void => {
  if (!armed.value || e.target !== props.canvas) return
  downOnBoard.set(e.pointerId, { x: e.clientX, y: e.clientY, at: performance.now() })
  if (downOnBoard.size > 1) multi = true
  hover = { x: e.clientX, y: e.clientY }
  publish()
}

const onBoardMove = (e: PointerEvent): void => {
  if (!armed.value || press) return
  if (e.target !== props.canvas && !downOnBoard.has(e.pointerId)) return
  hover = { x: e.clientX, y: e.clientY }
  publish()
}

const onBoardUp = (e: PointerEvent): void => {
  const down = downOnBoard.get(e.pointerId)
  downOnBoard.delete(e.pointerId)
  const wasMulti = multi
  if (downOnBoard.size === 0) multi = false
  if (!armed.value || !down || wasMulti || e.type === 'pointercancel') return
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y) > DRAG_SLOP_PX
  if (moved || performance.now() - down.at > TAP_MAX_MS) return
  placeAt(e.clientX, e.clientY)
}

const onKey = (e: KeyboardEvent): void => {
  if (e.code === 'Escape' && armed.value) disarm()
}

// ─── Wiring ─────────────────────────────────────────────────────────────────

watch(() => props.slotArmed, (on) => { if (on) disarm() })
watch(() => props.disabled, (off) => { if (off) disarm() })
watch(gift, (g) => {
  if (!g) disarm()
  void nextTick(paint)
})
// Painted whenever the canvas itself appears, not only when the gift changes.
// The tile is `v-if`'d on `disabled` as well as on the gift, so a gift won
// during a result screen or a tutorial card mounted its canvas later, when
// `disabled` fell — with nothing left to call `paint` — and the player got a
// gold tile with FREE on it and nothing inside.
watch(canvasEl, (el) => { if (el) paint() })
watch(() => props.size, () => { void nextTick(paint) })
// The scene's own overlay watchers run first on a tower change and clear the
// guides they do not know about; this puts the gift's back.
watch(towerVersion, () => { if (armed.value) publish() })

let stopArt: (() => void) | null = null

onMounted(() => {
  reloadGifts()
  paint()
  stopArt = onArtChanged(paint)
  window.addEventListener('pointerdown', onBoardDown)
  window.addEventListener('pointermove', onBoardMove)
  window.addEventListener('pointerup', onBoardUp)
  window.addEventListener('pointercancel', onBoardUp)
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  disarm()
  stopArt?.()
  window.clearTimeout(cueTimer)
  window.removeEventListener('pointerdown', onBoardDown)
  window.removeEventListener('pointermove', onBoardMove)
  window.removeEventListener('pointerup', onBoardUp)
  window.removeEventListener('pointercancel', onBoardUp)
  window.removeEventListener('pointermove', onTileMove)
  window.removeEventListener('pointerup', onTileUp)
  window.removeEventListener('pointercancel', onTileUp)
  window.removeEventListener('keydown', onKey)
})

defineExpose({ arm, disarm, placeAt, armed })
</script>

<template lang="pug">
  div.gift(v-if="gift && !disabled" :class="{ 'is-tray': inTray }")
    Transition(name="gift-cue")
      span.gift__cue(v-if="cue") {{ cue }}
    button.gift__tile(
      type="button"
      :class="{ 'is-armed': armed, 'is-pop': popping }"
      :style="{ '--gift-rim': rimColour, '--gift-art': `${size}px` }"
      :aria-label="label"
      :aria-pressed="armed"
      @pointerdown="onTileDown"
    )
      canvas.gift__art(ref="canvasEl" aria-hidden="true")
      //- What it costs, on the tile: FREE, or the half price with the discount
      //- flagged in the corner so the bill reads as the bargain it is.
      span.gift__free(v-if="isFree || !price") {{ t('gift.free') }}
      span.gift__free.is-price(v-else)
        span.gift__cost(v-if="price.wood > 0")
          IconWood.gift__res
          | {{ price.wood }}
        span.gift__cost(v-if="price.stone > 0")
          IconStone.gift__res
          | {{ price.stone }}
        span.gift__cost(v-if="price.coins > 0")
          IconGold.gift__res
          | {{ price.coins }}
      span.gift__off(v-if="!isFree") {{ t('gift.discount', { n: offPct }) }}
      span.gift__count(v-if="count > 1") {{ count }}
</template>

<style scoped lang="sass">
// The bottom padding keeps the FREE ribbon, which hangs below the tile, inside
// the row it sits in rather than over the hand beneath it.
.gift
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  padding-bottom: 8px
  pointer-events: auto

// Rimmed in the gift's own tier colour, over a warm gold backing — "free" and
// "merged" in one glance, and unlike anything the hand ever deals.
.gift__tile
  position: relative
  width: calc(var(--gift-art, 52px) + 8px)
  height: calc(var(--gift-art, 52px) + 8px)
  padding: 3px
  border: 3px solid var(--gift-rim)
  border-radius: 12px
  background: radial-gradient(circle at 50% 35%, #fff2b8 0%, #f0b93a 55%, #9a6412 100%)
  box-shadow: 0 3px 0 #3a2508, 0 0 12px rgba(255, 214, 90, 0.7)
  cursor: grab
  touch-action: none
  -webkit-tap-highlight-color: transparent
  animation: gift-breathe 1.4s ease-in-out infinite alternate

  &.is-armed
    translate: 0 -6px
    box-shadow: 0 6px 0 #3a2508, 0 0 0 3px #fff, 0 0 18px rgba(255, 240, 180, 0.95)
    animation: none

  &.is-pop
    animation: gift-pop 0.5s ease-out

.gift__art
  display: block
  width: var(--gift-art, 52px)
  height: var(--gift-art, 52px)

// In the hand's first slot: no row of its own to pad, and it breathes a
// little less — it sits among the other tiles now, and a wall of motion
// beside them would out-shout the hand it has joined.
.gift.is-tray
  padding-bottom: 0

  .gift__tile
    animation-duration: 1.8s

.gift__free
  position: absolute
  left: 50%
  bottom: -9px
  translate: -50% 0
  padding: 0 6px
  border: 2px solid #2a1607
  border-radius: 999px
  background: #ffd35c
  color: #2a1607
  font-size: 10px
  font-weight: 900
  line-height: 14px
  letter-spacing: 0.04em
  text-transform: uppercase
  white-space: nowrap

// The price wears the same ribbon the FREE tag does, so the tile's shape does
// not change when a chest stops giving pieces away.
.gift__free.is-price
  display: flex
  align-items: center
  gap: 0.3em
  padding: 0 5px

.gift__cost
  display: inline-flex
  align-items: center
  gap: 0.1em
  font-variant-numeric: tabular-nums

.gift__res
  width: 1.1em
  height: 1.1em

// The discount, top-left — the corner the count badge does not use.
.gift__off
  position: absolute
  top: -8px
  left: -8px
  padding: 0 4px
  border: 2px solid #2a1607
  border-radius: 999px
  background: #6fe08a
  color: #06240f
  font-size: 9px
  font-weight: 900
  line-height: 14px
  white-space: nowrap

.gift__count
  position: absolute
  top: -8px
  right: -8px
  min-width: 18px
  height: 18px
  padding: 0 4px
  border-radius: 999px
  background: #d8321e
  color: #fff
  font-size: 11px
  font-weight: 900
  line-height: 18px

.gift__cue
  position: absolute
  bottom: calc(100% + 8px)
  left: 50%
  translate: -50% 0
  padding: 4px 10px
  border: 2px solid #2a1607
  border-radius: 10px
  background: #fff4dc
  color: #2a1607
  font-size: 12px
  font-weight: 900
  white-space: nowrap
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
  pointer-events: none

@keyframes gift-breathe
  from
    scale: 1
  to
    scale: 1.06

@keyframes gift-pop
  0%
    scale: 0.6
  60%
    scale: 1.18
  100%
    scale: 1

.gift-cue-enter-active, .gift-cue-leave-active
  transition: opacity 0.25s ease, translate 0.25s ease

.gift-cue-enter-from, .gift-cue-leave-to
  opacity: 0
  translate: -50% 6px

@media (prefers-reduced-motion: reduce)
  .gift__tile
    animation: none
</style>

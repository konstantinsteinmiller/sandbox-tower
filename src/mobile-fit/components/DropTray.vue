<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ShapeTile from '@/components/game/ShapeTile.vue'
import FHudBadge from '@/components/atoms/FHudBadge.vue'
import { shapeBlockTypes } from '@/game/shapes'
import { blockDef, ENHANCED_HP_MUL, ENHANCED_DAMAGE_MUL } from '@/game/blocks'
import { priceOfShape } from '@/use/useTowerGame'

/**
 * The hand: three drop pieces at the thumb, and the Volley beside them.
 *
 * A tile is pressed, never clicked: the scene decides whether the press was a
 * tap (arm the piece, then tap a column) or a drag (carry it to a column and
 * let go). The swap button sits UNDER each tile rather than on its corner, so a
 * thumb aiming at one never lands on the other.
 *
 * The tile also cancels its own `touchstart`. `touch-action: none` should be
 * enough to keep the browser from claiming a drag that starts on it, but a
 * page-level overscroll that does claim it ends the drag in a `pointercancel`
 * halfway up the screen — and the tile never wants a click or a scroll, so
 * there is nothing to lose by saying so twice.
 */

interface Props {
  offers: string[]
  enhanced: boolean[]
  selected: number | null
  materials: number
  gold: number
  rerollSeconds: number[]
  /** The volley's charge is full. */
  volleyReady: boolean
  /** A volley can only be loosed while a wave is on the field. */
  inBattle: boolean
  /** 0..1 — how much of the volley's charge is banked. */
  volleyCharge: number
  volleyWavesLeft: number
  /**
   * The player has gone a while without building while something here is
   * affordable (`useIdleNudge`): pulse the tiles they CAN pay for. Never the
   * grey ones — pointing at a piece they cannot buy is an instruction they
   * cannot follow.
   */
  nudge?: boolean
  /**
   * A won piece is waiting: slot 0 shows the scene's `gift` slot (the gift
   * tile) in place of its wall until the gift is dropped. The first slot only
   * ever deals walls, so borrowing it costs the hand nothing it will miss —
   * the wall is still there underneath, and comes back the moment the gift is
   * placed.
   */
  giftFirst?: boolean
  /**
   * Bumped the moment the reinforced hand is PAID for — the cards spark and
   * their numbers pop in. See `BuildTray`'s `paidAt` for why the purchase
   * needs a beat of its own: on a coin-priced build the preview has already
   * turned the hand gold, so the tap that spends the coins otherwise changes
   * nothing a player can point at.
   */
  paidAt?: number
}

const props = withDefaults(defineProps<Props>(), { nudge: false, giftFirst: false, paidAt: 0 })

/** True for one beat after the hand is paid for. */
const justPaid = ref(false)
let paidTimer = 0
watch(() => props.paidAt, (at) => {
  if (!at) return
  justPaid.value = true
  window.clearTimeout(paidTimer)
  paidTimer = window.setTimeout(() => { justPaid.value = false }, 1_100)
})
onUnmounted(() => window.clearTimeout(paidTimer))

const emit = defineEmits<{
  (e: 'press', slot: number, ev: PointerEvent): void
  (e: 'reroll', slot: number): void
  (e: 'volley'): void
}>()

const { t } = useI18n()

interface Entry {
  slot: number
  shapeId: string
  materials: number
  gold: number
  affordable: boolean
  enhanced: boolean
  /** What the reinforced hand bought, on the card: "+75% / +50%", or "+75%"
   *  for a piece with no gun to improve. Null when the card is ordinary. */
  boostChip: string | null
  name: string
}

/** The reinforced bonus as whole percentages, from the constants the
 *  simulation actually applies rather than restated in prose per language. */
const enhancedHpPct = Math.round((ENHANCED_HP_MUL - 1) * 100)
const enhancedDmgPct = Math.round((ENHANCED_DAMAGE_MUL - 1) * 100)

const entries = computed<Entry[]>(() =>
  props.offers.map((shapeId, slot) => {
    const cost = priceOfShape(shapeId)
    const enhanced = props.enhanced[slot] === true
    return {
      slot,
      shapeId,
      materials: cost.wood,
      gold: cost.coins,
      affordable: props.materials >= cost.wood && props.gold >= cost.coins,
      enhanced,
      // This tray carried NO numbers at all — a reinforced hand was a row of
      // gold borders and nothing else, so on the phone the purchase could only
      // ever be read as decoration. The desktop showed damage, and only on the
      // guns (`BuildTray`).
      boostChip: !enhanced
        ? null
        : shapeBlockTypes(shapeId).some((id) => !!blockDef(id).weapon)
          ? `+${enhancedHpPct}% / +${enhancedDmgPct}%`
          : `+${enhancedHpPct}%`,
      name: t(`blocks.names.${shapeBlockTypes(shapeId)[0] ?? 'wood'}`)
    }
  })
)

const cooling = (slot: number): number => props.rerollSeconds[slot] ?? 0
</script>

<template lang="pug">
  div.tray
    button.tray__volley(
      type="button"
      :class="{ 'is-ready': volleyReady && inBattle, 'is-idle': volleyReady && !inBattle }"
      :aria-label="t('hud.arrowRain')"
      @click="emit('volley')"
    )
      svg.tray__volley-icon(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round")
        path(d="M5 3v10")
        path(d="M2.6 10.2 5 13.4l2.4-3.2")
        path(d="M12 5v11")
        path(d="M9.6 13.2 12 16.4l2.4-3.2")
        path(d="M19 3v10")
        path(d="M16.6 10.2 19 13.4l2.4-3.2")
        path(d="M3 20.5h18" stroke-width="2.6")
      span.tray__volley-fill(:style="{ height: `${Math.round(volleyCharge * 100)}%` }")
      span.tray__volley-label {{ t('mobile.volley') }}
      FHudBadge(v-if="!volleyReady" tone="red") {{ volleyWavesLeft }}

    //- The gift, standing in the first slot while it waits. No swap under it —
    //- there is nothing to swap a free piece for — but a spacer of the swap's
    //- height, so the row's tiles stay level.
    div.tray__slot(v-if="giftFirst")
      slot(name="gift")
      span.tray__swap-spacer(aria-hidden="true")
    div.tray__slot(v-for="e in entries" v-show="!(giftFirst && e.slot === 0)" :key="e.slot")
      button.tray__tile(
        type="button"
        :class="{ 'is-selected': selected === e.slot, 'is-poor': !e.affordable, 'is-enhanced': e.enhanced, 'is-nudge': nudge && e.affordable, 'is-paid': justPaid && e.enhanced }"
        :style="{ '--slot': e.slot }"
        :aria-label="e.boostChip ? `${e.name} — ${t('blocks.enhancedNote', { hp: enhancedHpPct, dmg: enhancedDmgPct })}` : e.name"
        @pointerdown.prevent="emit('press', e.slot, $event)"
        @touchstart.prevent
      )
        span.tray__body
          ShapeTile(:shape-id="e.shapeId" :size="52")
          //- What the rewarded video bought, in numbers, on the card itself.
          span.tray__boost(v-if="e.boostChip") {{ e.boostChip }}
        span.tray__cost
          span.tray__cost-item(:class="{ 'is-short': materials < e.materials }")
            i.tray__dot.is-wood
            | {{ e.materials }}
          span.tray__cost-item(v-if="e.gold > 0" :class="{ 'is-short': gold < e.gold }")
            i.tray__dot.is-gold
            | {{ e.gold }}
      button.tray__swap(
        type="button"
        :class="{ 'is-cooling': cooling(e.slot) > 0 }"
        :disabled="cooling(e.slot) > 0"
        :aria-label="t('mobile.swap')"
        @pointerdown.stop
        @click.stop="emit('reroll', e.slot)"
      )
        svg(v-if="cooling(e.slot) === 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round")
          path(d="M20 11a8 8 0 1 0-2.3 6.3")
          path(d="M20 4v7h-7")
        span(v-else) {{ cooling(e.slot) }}
</template>

<style scoped lang="sass">
.tray
  display: flex
  align-items: flex-end
  justify-content: center
  gap: clamp(0.35rem, 2vw, 0.6rem)
  padding: 0.25rem 0.5rem
  pointer-events: auto

.tray__slot
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.2rem

.tray__tile
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.1rem
  min-width: 3.5rem
  padding: 0.2rem 0.25rem
  border: 2px solid #24345a
  border-radius: 0.6rem
  background-image: linear-gradient(to bottom, rgba(38, 56, 96, 0.95), rgba(18, 30, 56, 0.95))
  box-shadow: 0 4px 0 #0d1830, 0 6px 14px rgba(0, 0, 0, 0.45)
  cursor: pointer
  touch-action: none
  -webkit-tap-highlight-color: transparent
  transition: transform 110ms ease-out, filter 110ms ease-out, border-color 110ms ease-out

  &:active
    transform: translateY(2px)

  &.is-poor
    filter: grayscale(0.7) brightness(0.62)

  &.is-selected
    border-color: #7fe0ff
    box-shadow: 0 0 0 2px rgba(127, 224, 255, 0.55), 0 0 14px rgba(127, 224, 255, 0.6)
    transform: translateY(-4px)

  // Turning gold is a card flip, one tile after another — the reinforced
  // hand's preview and its payout (see BuildTray's `tray-flip-gold`). On
  // `rotate`, so it composes with the lift's `transform` and the nudge's
  // `scale`; a nudged tile runs both animations side by side.
  &.is-enhanced
    border-color: #ffd54a
    box-shadow: 0 0 0 1px rgba(255, 213, 74, 0.5), 0 0 10px rgba(255, 190, 40, 0.45)
    animation: tray-flip-gold 460ms cubic-bezier(0.3, 1.4, 0.5, 1) calc(var(--slot, 0) * 80ms) both

  // The idle nudge: a slow swell and a ring breathing out of the tile. On
  // `scale` and a pseudo-element, never `transform` or `box-shadow`, so it
  // rides on top of the selected lift and the reinforced glow instead of
  // fighting them for the same property.
  &.is-nudge
    animation: tray-nudge 1.1s ease-in-out infinite

    &::after
      content: ''
      position: absolute
      inset: -3px
      border: 2px solid rgba(127, 224, 255, 0.9)
      border-radius: 0.75rem
      pointer-events: none
      animation: tray-nudge-ring 1.1s ease-out infinite

.tray__tile.is-enhanced.is-nudge
  animation: tray-flip-gold 460ms cubic-bezier(0.3, 1.4, 0.5, 1) calc(var(--slot, 0) * 80ms) both, tray-nudge 1.1s ease-in-out infinite

@keyframes tray-flip-gold
  0%, 49.9%
    border-color: #24345a
    box-shadow: 0 4px 0 #0d1830, 0 6px 14px rgba(0, 0, 0, 0.45)
  0%
    rotate: y 0deg
  50%
    rotate: y 90deg
  100%
    rotate: y 0deg

@keyframes tray-nudge
  0%, 100%
    scale: 1
  45%
    scale: 1.09

@keyframes tray-nudge-ring
  0%
    opacity: 0.95
    scale: 1
  100%
    opacity: 0
    scale: 1.28

// Still asked for: keep the ring, lose the swell, so the tile is marked
// without anything moving.
@media (prefers-reduced-motion: reduce)
  .tray__tile.is-nudge,
  .tray__tile.is-enhanced,
  .tray__tile.is-enhanced.is-nudge
    animation: none

    &::after
      animation: none
      opacity: 0.85

  // The numbers stay — they are the message; only the pop goes.
  .tray__tile.is-paid .tray__body,
  .tray__tile.is-paid .tray__boost
    animation: none

.tray__body
  position: relative
  display: flex
  align-items: center
  justify-content: center
  pointer-events: none

// ─── What the reinforced hand bought ────────────────────────────────────────
//
// A number on the card, not a colour: the phone tray had no numbers at all, so
// a reinforced hand read as three gold borders. Over the thumbnail's top-left
// corner, where it cannot push the tile wider — the row is five tiles across a
// phone and has no width to give.
.tray__boost
  position: absolute
  top: 0
  left: 50%
  translate: -50% -42%
  padding: 0 0.3em
  border: 1px solid rgba(0, 0, 0, 0.7)
  border-radius: 999px
  background-image: linear-gradient(to bottom, #ffd54a, #e0951c)
  color: #2a1a02
  font-weight: 900
  font-size: 0.52rem
  line-height: 1.3
  white-space: nowrap
  pointer-events: none

// The payment's own moment: the card sparks and its numbers pop in, one after
// another down the row. The gold flip above belongs to the PREVIEW and has
// already played by the time the coins are spent.
.tray__tile.is-paid
  .tray__body
    animation: tray-paid-spark 620ms ease-out calc(var(--slot, 0) * 70ms) both

  .tray__boost
    animation: tray-chip-pop 520ms cubic-bezier(0.2, 1.5, 0.4, 1) calc(var(--slot, 0) * 70ms + 90ms) both

@keyframes tray-paid-spark
  0%, 100%
    filter: none
  35%
    filter: drop-shadow(0 0 10px rgba(255, 243, 196, 0.95)) drop-shadow(0 0 18px rgba(255, 205, 70, 0.8))

@keyframes tray-chip-pop
  0%
    opacity: 0
    scale: 0.4
  60%
    opacity: 1
    scale: 1.35
  100%
    opacity: 1
    scale: 1

.tray__cost
  display: flex
  gap: 0.3em
  line-height: 1
  pointer-events: none

.tray__cost-item
  display: inline-flex
  align-items: center
  gap: 0.15em
  color: #dbe6ff
  font-weight: 900
  font-size: 0.68rem
  text-shadow: 1px 1px 0 #000

  &.is-short
    color: #ff8f8f

.tray__dot
  display: inline-block
  width: 0.5em
  height: 0.5em
  border-radius: 999px

  &.is-wood
    background-color: #a9682f
  &.is-gold
    background-color: #ffd93c

// A real tap target, under the tile rather than on its corner.
.tray__swap-spacer
  display: block
  height: 1.6rem

.tray__swap
  display: flex
  align-items: center
  justify-content: center
  width: 2.75rem
  height: 1.6rem
  padding: 0.2rem
  border: 2px solid #0f1a30
  border-radius: 999px
  background-image: linear-gradient(to bottom, #6fd3ff, #2f8fe0)
  color: #04203a
  font-size: 0.7rem
  font-weight: 900
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent

  svg
    width: 1rem
    height: 1rem

  &.is-cooling
    background-image: linear-gradient(to bottom, #4a5a7d, #2b3654)
    color: #c8d6f2
    cursor: not-allowed

// ─── Volley ─────────────────────────────────────────────────────────────────

.tray__volley
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 0.1rem
  width: 3.4rem
  height: 4.3rem
  margin-bottom: 1.8rem
  border: 2px solid #0f1a30
  border-radius: 0.6rem
  background-image: linear-gradient(to bottom, #4a5a7d, #2b3654)
  color: #cfe4ff
  overflow: hidden
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent

  &.is-ready
    background-image: linear-gradient(to bottom, #ffd54a, #e0951c)
    color: #2a1a02
    box-shadow: 0 0 12px rgba(255, 190, 40, 0.5)

.tray__volley-icon
  position: relative
  z-index: 1
  width: 1.6rem
  height: 1.6rem

.tray__volley-label
  position: relative
  z-index: 1
  font-size: 0.55rem
  font-weight: 900
  text-transform: uppercase

.tray__volley-fill
  position: absolute
  left: 0
  right: 0
  bottom: 0
  background-color: rgba(255, 213, 74, 0.35)
  pointer-events: none
  transition: height 300ms ease-out
</style>

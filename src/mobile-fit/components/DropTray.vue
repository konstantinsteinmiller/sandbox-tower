<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ShapeTile from '@/components/game/ShapeTile.vue'
import FHudBadge from '@/components/atoms/FHudBadge.vue'
import { shapeBlockTypes } from '@/game/shapes'
import { priceOfShape } from '@/use/useTowerGame'

/**
 * The hand: three drop pieces at the thumb, and the Volley beside them.
 *
 * A tile is pressed, never clicked: the scene decides whether the press was a
 * tap (arm the piece, then tap a column) or a drag (carry it to a column and
 * let go). The swap button sits UNDER each tile rather than on its corner, so a
 * thumb aiming at one never lands on the other.
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
}

const props = withDefaults(defineProps<Props>(), { nudge: false })

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
  name: string
}

const entries = computed<Entry[]>(() =>
  props.offers.map((shapeId, slot) => {
    const cost = priceOfShape(shapeId)
    return {
      slot,
      shapeId,
      materials: cost.wood,
      gold: cost.coins,
      affordable: props.materials >= cost.wood && props.gold >= cost.coins,
      enhanced: props.enhanced[slot] === true,
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

    div.tray__slot(v-for="e in entries" :key="e.slot")
      button.tray__tile(
        type="button"
        :class="{ 'is-selected': selected === e.slot, 'is-poor': !e.affordable, 'is-enhanced': e.enhanced, 'is-nudge': nudge && e.affordable }"
        :aria-label="e.name"
        @pointerdown.prevent="emit('press', e.slot, $event)"
      )
        span.tray__body
          ShapeTile(:shape-id="e.shapeId" :size="52")
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

  &.is-enhanced
    border-color: #ffd54a
    box-shadow: 0 0 0 1px rgba(255, 213, 74, 0.5), 0 0 10px rgba(255, 190, 40, 0.45)

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
  .tray__tile.is-nudge
    animation: none

    &::after
      animation: none
      opacity: 0.85

.tray__body
  display: flex
  align-items: center
  justify-content: center
  pointer-events: none

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

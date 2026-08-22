<script setup lang="ts">
import { ref, watch } from 'vue'
import IconGold from '@/components/icons/IconGold.vue'
import IconStone from '@/components/icons/IconStone.vue'
import IconWood from '@/components/icons/IconWood.vue'

/**
 * Top-centre resource readout: wood, stone and the run's gold (reference
 * image 1).
 *
 * Each figure pops when it increases, which is what makes a wave-clear payout
 * feel like a payout rather than a silent number change.
 *
 * The third figure is GOLD — the run currency that kills drop and that blocks,
 * upgrades and hulls are priced in. It is not the wallet in the corner, which
 * is COINS and buys tech. They were drawn with the same coin and called the
 * same thing while being two balances the player holds simultaneously, which
 * is why the ingot is here and the coin is not.
 *
 * The icons are drawn large on purpose. This bar is the only readout of the
 * three numbers the whole build phase is spent spending, and at the size it
 * started it lost to the wave banner beside it.
 *
 * All three glyphs are SHARED components rather than markup inlined here. Wood
 * and stone were inline, so the grace-continue button — the only other place
 * that names those two resources — had to approximate them with coloured dots,
 * and the two readouts of the same thing did not look like the same thing.
 */

interface Props {
  wood: number
  stone: number
  /** Run gold. */
  coins: number
}

const props = defineProps<Props>()

const woodPop = ref(false)
const stonePop = ref(false)
const coinPop = ref(false)

/** Retrigger a CSS animation by dropping the class for one frame. */
const pop = (flag: { value: boolean }): void => {
  flag.value = false
  requestAnimationFrame(() => { flag.value = true })
}

watch(() => props.wood, (n, o) => { if (n > o) pop(woodPop) })
watch(() => props.stone, (n, o) => { if (n > o) pop(stonePop) })
watch(() => props.coins, (n, o) => { if (n > o) pop(coinPop) })
</script>

<template lang="pug">
  div.resource-bar
    span.resource-bar__shadow(aria-hidden="true")
    div.resource-bar__body
      div.resource-bar__item
        IconWood.resource-bar__icon
        span.resource-bar__value(:class="{ pop: woodPop }") {{ wood }}

      div.resource-bar__item
        IconStone.resource-bar__icon
        span.resource-bar__value(:class="{ pop: stonePop }") {{ stone }}

      div.resource-bar__item.resource-bar__item--coins
        IconGold.resource-bar__icon
        span.resource-bar__value(class="is-gold" :class="{ pop: coinPop }") {{ coins }}
</template>

<style scoped lang="sass">
.resource-bar
  position: relative
  pointer-events: none
  max-width: 92vw

.resource-bar__shadow
  position: absolute
  inset: 0
  transform: translateY(3px)
  border-radius: clamp(0.5rem, 2.4vw, 0.9rem)
  background-color: #0d1830

.resource-bar__body
  position: relative
  display: flex
  align-items: center
  gap: clamp(0.6rem, 3.4vw, 1.5rem)
  // A floor so the bar keeps its shape even with single-digit values.
  min-height: 3rem
  padding: clamp(0.3rem, 1.7vw, 0.6rem) clamp(0.7rem, 3.6vw, 1.35rem)
  border: 2px solid #0f1a30
  border-radius: clamp(0.5rem, 2.4vw, 0.9rem)
  background-image: linear-gradient(to bottom, rgba(38, 56, 96, 0.94), rgba(20, 32, 60, 0.94))

.resource-bar__item
  display: flex
  align-items: center
  gap: clamp(0.25rem, 1.3vw, 0.45rem)

.resource-bar__icon
  flex: 0 0 auto
  width: clamp(1.45rem, 6.4vw, 2.15rem)
  height: clamp(1.45rem, 6.4vw, 2.15rem)
  // The glyphs are drawn to fill their box, so a drop shadow is what separates
  // them from whatever sky happens to be behind the bar.
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.45))

.resource-bar__value
  color: #fff
  font-weight: 900
  line-height: 1
  font-variant-numeric: tabular-nums
  font-size: clamp(1.12rem, 5.1vw, 1.75rem)
  text-shadow: 2px 2px 0 #000
  display: inline-block

  &.is-gold
    color: #ffd93c

  &.pop
    animation: res-pop 0.34s cubic-bezier(0.34, 1.56, 0.64, 1)

@keyframes res-pop
  0%
    scale: 1
  35%
    scale: 1.32
  100%
    scale: 1

// ─── Portrait phone ─────────────────────────────────────────────────────────
//
// The top row runs wave-status | resources | wallet across the full width, and
// on a 390 px screen those three already consume 360 px of it — before the
// numbers reach four digits. Coins are the natural thing to move: wood and
// stone are the materials being spent right now, while coins are the run's
// banked currency, so splitting them off separates two different kinds of
// number as well as buying the row back ~50 px.
@media (max-width: 30rem) and (orientation: portrait)
  // Grid, not a wrapping flex row. `flex-basis: 100%` on the coin item makes it
  // contribute a full container width to max-content, so the pill stayed as
  // wide as it was before and only got taller. A grid sizes its columns from
  // the content that actually sits in them, and a spanning item does not drag
  // that width up with it.
  .resource-bar__body
    display: grid
    grid-template-columns: auto auto
    justify-content: center
    align-items: center
    row-gap: 0.1rem
    column-gap: clamp(0.6rem, 4vw, 1.2rem)

  .resource-bar__item--coins
    grid-column: 1 / -1
    justify-content: center
    padding-top: 0.12rem
    border-top: 1px solid rgba(255, 255, 255, 0.14)

</style>

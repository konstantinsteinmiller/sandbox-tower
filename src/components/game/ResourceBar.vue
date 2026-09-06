<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import IconGold from '@/components/icons/IconGold.vue'
import IconStone from '@/components/icons/IconStone.vue'
import IconWood from '@/components/icons/IconWood.vue'
import { resourceFloats, FLOAT_LIFE_MS, type ResourceFloatId } from '@/use/useResourceFloats'

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

/**
 * Payout floats, grouped by the figure they belong under.
 *
 * They are rendered by the BAR rather than by whoever awarded them, because
 * where they have to appear is defined entirely by where the number is: a
 * "+12 wood" that rises anywhere other than into the wood readout is a
 * different, worse animation. The bar is also the only thing that knows the
 * portrait layout moves gold onto its own row.
 */
const floatsFor = (id: ResourceFloatId) =>
  computed(() => resourceFloats.value.filter((f) => f.id === id))

const woodFloats = floatsFor('wood')
const stoneFloats = floatsFor('stone')
const goldFloats = floatsFor('gold')

/**
 * The animation length, taken from the same constant that schedules the float's
 * removal. Repeating "1250ms" in the stylesheet is how the two silently drift:
 * bump one and the fade is either guillotined mid-flight or finishes early and
 * leaves an invisible node sitting over the bar.
 */
const floatVars = { '--float-life': `${FLOAT_LIFE_MS}ms` }
</script>

<template lang="pug">
  div.resource-bar
    span.resource-bar__shadow(aria-hidden="true")
    div.resource-bar__body
      div.resource-bar__item
        IconWood.resource-bar__icon
        span.resource-bar__value(:class="{ pop: woodPop }") {{ wood }}
        //- Payout floats rise out of here into the figure above them. Purely
        //- decorative — the number they announce is already on screen — so they
        //- are hidden from assistive tech rather than read out twice.
        div.resource-bar__floats(aria-hidden="true" :style="floatVars")
          span.resource-bar__float.is-wood(
            v-for="(f, i) in woodFloats"
            :key="f.uid"
            :style="{ animationDelay: `${i * 110}ms` }"
          ) +{{ f.amount }}

      div.resource-bar__item
        IconStone.resource-bar__icon
        span.resource-bar__value(:class="{ pop: stonePop }") {{ stone }}
        div.resource-bar__floats(aria-hidden="true" :style="floatVars")
          span.resource-bar__float.is-stone(
            v-for="(f, i) in stoneFloats"
            :key="f.uid"
            :style="{ animationDelay: `${i * 110}ms` }"
          ) +{{ f.amount }}

      div.resource-bar__item.resource-bar__item--coins
        IconGold.resource-bar__icon
        span.resource-bar__value(class="is-gold" :class="{ pop: coinPop }") {{ coins }}
        div.resource-bar__floats(aria-hidden="true" :style="floatVars")
          span.resource-bar__float.is-gold(
            v-for="(f, i) in goldFloats"
            :key="f.uid"
            :style="{ animationDelay: `${i * 110}ms` }"
          ) +{{ f.amount }}
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
  position: relative
  display: flex
  align-items: center
  gap: clamp(0.25rem, 1.3vw, 0.45rem)

// ─── Payout floats ──────────────────────────────────────────────────────────
//
// Anchored under each figure and drawn OUTSIDE the bar's own box, so a payout
// never resizes the bar or pushes the row it sits in. The bar is
// `pointer-events: none`, and these inherit that: they must never intercept a
// tap meant for the battlefield underneath.

.resource-bar__floats
  position: absolute
  top: 100%
  left: 50%
  translate: -50% 0
  display: flex
  flex-direction: column
  align-items: center
  pointer-events: none

.resource-bar__float
  position: absolute
  top: 0
  white-space: nowrap
  font-weight: 900
  font-variant-numeric: tabular-nums
  line-height: 1
  // Twice the old size, which puts it a shade LARGER than the total it is
  // announcing. Deliberate: the running total is always on screen and can be
  // read at leisure, while the payout is on screen for two seconds, arrives
  // while the player is still looking at the battlefield, and is the thing that
  // has to catch the eye. At the old size it lost that race to its own subject.
  font-size: clamp(1.7rem, 8vw, 2.6rem)
  text-shadow: 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000
  animation: res-float var(--float-life, 2500ms) cubic-bezier(0.22, 0.9, 0.3, 1) backwards

  &.is-wood
    color: #ffc27a
  &.is-stone
    color: #dce4ee
  &.is-gold
    color: #ffd93c

// Starts BELOW the bar and travels up into the figure, which is the whole
// message: this number came from down there and landed up here.
//
// It is spent by the time it arrives, on purpose. Carried at full opacity all
// the way it ended up sitting across the digits it was announcing — so the one
// moment the player most wants to read the new total is the moment something
// else is printed over it. The last third fades while it covers the last few
// pixels, which reads as absorbed rather than as occluding.
// Measured in `em`, not `rem`: the travel has to stay in proportion to the
// glyph, or doubling the type turns a rise into a twitch.
@keyframes res-float
  0%
    opacity: 0
    scale: 0.7
    translate: 0 1.3em
  14%
    opacity: 1
    scale: 1.14
  26%
    scale: 1
  70%
    opacity: 1
    translate: 0 0.28em
  100%
    opacity: 0
    scale: 0.95
    translate: 0 -0.15em

// A player who asked for less motion still needs to see the payout, so it is
// held still and faded rather than removed.
@media (prefers-reduced-motion: reduce)
  .resource-bar__float
    animation: res-float-still var(--float-life, 2500ms) linear backwards

  @keyframes res-float-still
    0%
      opacity: 0
    10%, 80%
      opacity: 1
    100%
      opacity: 0

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

  // Wood and stone move to a FIRST row here, with gold on a second one beneath
  // them — so `top: 100%` of those two cells is no longer the bottom of the
  // bar, it is the middle of it, and their payouts were drawn straight across
  // the gold row. Push them past it.
  //
  // `200%` rather than a fixed offset: the containing block is the cell itself,
  // and both rows are sized by the same icon and value clamps, so one cell
  // height IS the row below to within a pixel or two at every viewport in this
  // range. The addend covers the coins row's own border and padding.
  .resource-bar__item:not(.resource-bar__item--coins) .resource-bar__floats
    top: calc(200% + 0.35rem)

  // ...which then lands gold on the same line as the other two, and at this
  // width the three columns are close enough that "+33 +12 +24" runs together
  // into one string of digits. Gold is already on its own grid row, so it gets
  // its own float line too: two short lines read, one long one does not.
  .resource-bar__item--coins .resource-bar__floats
    top: calc(100% + 2rem)

</style>

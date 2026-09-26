<script setup lang="ts">
import { computed } from 'vue'
import { prependBaseUrl } from '@/utils/function'
import {
  isRewardGated, canOfferReward, adInFlight, REWARD_COIN_COST
} from '@/use/useAdGate'
import { coins as walletCoins } from '@/use/useTowerEconomy'
import IconCoin from '@/components/icons/IconCoin.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import type { GameIconName } from '@/components/icons/iconNames'

/**
 * A button for a perk that MAY be paid for with a rewarded video.
 *
 * It always shows the movie icon on gated builds so the player knows the cost
 * before they tap — a reward button that silently opens a video is the single
 * most complained-about pattern in portal QA. On ungated builds (dev, non-CG
 * portals, CG pre-release) the perk is free and the icon is dropped, because
 * showing a video badge for something that never plays a video is a lie.
 *
 * Where no video plays the perk is priced in WALLET coins instead — see
 * `REWARD_COIN_COST`. A perk that is free and unlimited off-portal is not the
 * same perk, it stops being a decision, so the button shows a coin and an
 * amount in place of the video badge and disables itself when the player cannot
 * pay. On a gated build the video is the price and the coins are never touched,
 * so the two can never stack.
 */

interface Props {
  label: string
  tone?: 'gold' | 'green' | 'blue'
  size?: 'sm' | 'md'
  isDisabled?: boolean
  /** Force-hide the badge entirely: no video, no price (for a free retry). */
  free?: boolean
  /** Override the coin price. Defaults to the shared `REWARD_COIN_COST`. */
  coinCost?: number
  /** Override the balance the price is checked against. Defaults to the
   *  wallet, which is what the price is actually taken from. */
  coins?: number
  /** A glyph from the shared set, in place of the caption. `label` stays
   *  required and becomes the accessible name — the string is read aloud
   *  rather than read on screen. */
  icon?: GameIconName
  /** Drop the caption and keep the glyph. The video badge and the coin price
   *  still show: those carry information a glyph cannot. */
  iconOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'gold',
  size: 'md',
  isDisabled: false,
  free: false,
  coinCost: REWARD_COIN_COST,
  coins: undefined,
  icon: undefined,
  iconOnly: false
})

const purse = computed(() => props.coins ?? walletCoins.value)

defineEmits(['click'])

const movieSrc = prependBaseUrl('images/icons/movie_128x96.webp')

/** Show the badge only when tapping this really will play a video. */
const showMovie = computed(() => isRewardGated && !props.free)

/** A coin price applies only where there is no video to charge instead. */
const showCoin = computed(() => !isRewardGated && !props.free && props.coinCost > 0)

const tooPoor = computed(() => showCoin.value && purse.value < props.coinCost)

/** A gated build with no ad ready cannot honour the perk, so the button is
 *  disabled rather than failing after the tap. */
const disabled = computed(() =>
  props.isDisabled || adInFlight.value || tooPoor.value || (!props.free && !canOfferReward.value)
)
</script>

<template lang="pug">
  button.f-reward-button(
    type="button"
    :class="[`tone-${tone}`, `size-${size}`, { 'is-disabled': disabled, 'is-icon-only': iconOnly }]"
    :disabled="disabled"
    :aria-label="iconOnly ? label : undefined"
    @click="!disabled && $emit('click')"
  )
    span.f-reward-button__shadow(aria-hidden="true")
    span.f-reward-button__body
      //- The video badge LEADS: it is not a price, it is what tapping this
      //- does, and the player needs to know that before they read the offer.
      img.f-reward-button__movie(
        v-if="showMovie"
        :src="movieSrc"
        alt=""
        draggable="false"
      )
      GameIcon.f-reward-button__icon(v-if="iconOnly && icon" :name="icon")
      span.f-reward-button__label(v-else)
        slot {{ label }}
      //- A coin price TRAILS, amount first and glyph after it — "30 coins",
      //- the order it is said in, and the order every other priced control in
      //- the HUD already uses (the wave bonus, the ad-reward badge). Leading
      //- with the glyph put a coin at the head of the button where the video
      //- badge sits on a portal build, so the same control read as two
      //- different things depending on the platform.
      span.f-reward-button__price(v-if="showCoin")
        | {{ coinCost }}
        IconCoin.f-reward-button__coin
</template>

<style scoped lang="sass">
.f-reward-button__coin
  width: 1.05em
  height: 1.05em
  flex-shrink: 0

// Pale yellow on a gold button is two shades of the same colour, and the single
// bottom-right shadow it used to carry does not separate them — the price was
// the one number on the control the player could not read. It now takes the
// LABEL's treatment: white, fully outlined, legible on all three tones. The
// coin beside it is what says "money", so the text does not have to be gold to
// say it too.
.f-reward-button__price
  display: inline-flex
  align-items: center
  gap: 0.22em
  color: #fff
  font-weight: 900
  font-variant-numeric: tabular-nums
  line-height: 1.15
  text-shadow: 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000

.f-reward-button
  position: relative
  display: inline-flex
  align-items: center
  justify-content: center
  // Floors so the control survives any parent layout and stays tappable.
  min-width: 5rem
  min-height: 2.75rem
  padding: 0
  border: 0
  background: none
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: transform 90ms ease-out, filter 90ms ease-out

  &:hover:not(.is-disabled)
    filter: brightness(1.08)

  &:active:not(.is-disabled)
    transform: translateY(2px) scale(0.97)

  &.is-disabled
    opacity: 0.5
    filter: grayscale(1)
    cursor: not-allowed

.f-reward-button__shadow
  position: absolute
  inset: 0
  transform: translateY(3px)
  border-radius: clamp(0.6rem, 2.6vw, 1.1rem)

.f-reward-button__body
  position: relative
  display: flex
  align-items: center
  justify-content: center
  gap: clamp(0.3rem, 1.6vw, 0.55rem)
  width: 100%
  min-height: 2.75rem
  padding: clamp(0.4rem, 1.8vw, 0.7rem) clamp(0.7rem, 3.4vw, 1.35rem)
  border: 2px solid var(--ui-line)
  border-radius: clamp(0.6rem, 2.6vw, 1.1rem)
  box-shadow: inset 0 2px 0 var(--ui-gloss)

.f-reward-button__movie
  flex: 0 0 auto
  width: clamp(1.1rem, 4.6vw, 1.6rem)
  height: auto
  // The icon is the price tag; it must not be dimmed into invisibility on the
  // gold body.
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6))
  pointer-events: none

// Same contract as FButton's: the glyph replaces the caption, and the control
// squares up rather than keeping a caption's width with nothing in it. The
// video badge and the coin price are NOT dropped — those carry information a
// glyph cannot.
.f-reward-button__icon
  flex-shrink: 0
  width: 1.5em
  height: 1.5em

.f-reward-button.is-icon-only
  min-width: 2.75rem

  .f-reward-button__body
    padding-left: clamp(0.4rem, 1.8vw, 0.7rem)
    padding-right: clamp(0.4rem, 1.8vw, 0.7rem)

.f-reward-button.is-icon-only.size-sm
  min-width: 2.25rem

.size-md .f-reward-button__icon
  font-size: clamp(0.8rem, 3.4vw, 1.2rem)

.size-sm .f-reward-button__icon
  font-size: clamp(0.68rem, 2.8vw, 0.95rem)

.f-reward-button__label
  color: #fff
  font-weight: 900
  text-transform: uppercase
  white-space: nowrap
  line-height: 1.15
  text-shadow: 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000

.size-md .f-reward-button__label
  font-size: clamp(0.8rem, 3.4vw, 1.2rem)

// The price tracks the label rather than inheriting the page default, or it
// drifts out of proportion with the offer it is pricing at either end of the
// clamp. A touch smaller: it is the terms, not the offer.
.size-md .f-reward-button__price
  font-size: clamp(0.72rem, 3vw, 1.05rem)

.size-sm
  min-height: 2.25rem

  .f-reward-button__body
    min-height: 2.25rem
    padding: clamp(0.25rem, 1.2vw, 0.45rem) clamp(0.5rem, 2.6vw, 0.9rem)

  .f-reward-button__label
    font-size: clamp(0.68rem, 2.8vw, 0.95rem)

  .f-reward-button__price
    font-size: clamp(0.62rem, 2.5vw, 0.86rem)

.tone-gold
  .f-reward-button__shadow
    background-color: var(--btn-yellow-drop)
  .f-reward-button__body
    background-image: linear-gradient(to bottom, var(--btn-yellow-from), var(--btn-yellow-to))

.tone-green
  .f-reward-button__shadow
    background-color: var(--btn-green-drop)
  .f-reward-button__body
    background-image: linear-gradient(to bottom, var(--btn-green-from), var(--btn-green-to))

.tone-blue
  .f-reward-button__shadow
    background-color: var(--btn-blue-drop)
  .f-reward-button__body
    background-image: linear-gradient(to bottom, var(--btn-blue-from), var(--btn-blue-to))
</style>

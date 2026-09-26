<script setup lang="ts">
/**
 * The standard HUD chip used by every meta button in the bottom rows
 * (Daily Rewards, Missions, Achievements, Battle Pass, Ad Reward, Settings,
 * Tech Tree, Themes).
 *
 * Exists to kill the copy-pasted `scale-80 sm:scale-100` wrappers that used to
 * live in each of those components. Those transforms shrank the painted chip
 * without shrinking its layout box, so the bottom row reserved full-size gaps
 * around 80%-size buttons and the spacing looked wrong on exactly the screens
 * that could least afford it. Everything here is fluid `clamp()` sizing with a
 * hard 2.5rem floor, so the row is compact on a 320px phone, comfortable on a
 * tablet, and never collapses.
 *
 * Slots: default = the glyph (SVG / icon component); `badge` = the corner
 * indicator (claim count, reward pill, timer).
 */

interface Props {
  /** Colour family. `gold` is the "there is something to collect" default. */
  tone?: 'gold' | 'blue' | 'green' | 'slate'
  /** Soft glow pulse — used when the button has an unclaimed reward. */
  attention?: boolean
  /** Hop, on top of the glow. A glow says "something changed here"; a button
   *  that MOVES says "press me", and that is the difference between a player
   *  noticing the tech tree and a player never opening it. Kept separate from
   *  `attention` so the quieter signals stay quiet. */
  bounce?: boolean
  isDisabled?: boolean
  ariaLabel?: string
}

withDefaults(defineProps<Props>(), {
  tone: 'gold',
  attention: false,
  bounce: false,
  isDisabled: false
})

defineEmits(['click'])
</script>

<template lang="pug">
  button.f-hud-button(
    type="button"
    :class="[`tone-${tone}`, { 'is-attention': attention, 'is-bounce': bounce, 'is-disabled': isDisabled }]"
    :aria-label="ariaLabel"
    :disabled="isDisabled"
    @click="!isDisabled && $emit('click')"
  )
    span.f-hud-button__shadow(aria-hidden="true")
    span.f-hud-button__body
      slot
    span.f-hud-button__badge(v-if="$slots.badge")
      slot(name="badge")
</template>

<style scoped lang="sass">
.f-hud-button
  position: relative
  display: inline-flex
  align-items: center
  justify-content: center
  flex: 0 0 auto
  // Floors keep the tap target legal and the chip visible in any layout.
  min-width: 2.5rem
  min-height: 2.5rem
  width: clamp(2.5rem, 11vw, 3.4rem)
  height: clamp(2.5rem, 11vw, 3.4rem)
  padding: 0
  border: 0
  background: none
  cursor: pointer
  pointer-events: auto
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: transform 90ms ease-out, filter 90ms ease-out

  &:hover:not(.is-disabled)
    filter: brightness(1.08)

  &:active:not(.is-disabled)
    transform: translateY(2px) scale(0.94)

  &.is-disabled
    opacity: 0.45
    filter: grayscale(1)
    cursor: not-allowed

.f-hud-button__shadow
  position: absolute
  inset: 0
  transform: translateY(3px)
  border-radius: clamp(0.45rem, 2vw, 0.7rem)

.f-hud-button__body
  position: relative
  display: flex
  align-items: center
  justify-content: center
  width: 100%
  height: 100%
  border: 2px solid var(--ui-line)
  border-radius: clamp(0.45rem, 2vw, 0.7rem)
  color: #fff
  // Candy-plastic gloss along the top edge.
  box-shadow: inset 0 2px 0 var(--ui-gloss)

  // The glyph fills a consistent fraction of the chip regardless of chip size,
  // so a row of mixed icons reads as one set.
  :slotted(svg), :slotted(img)
    width: 62%
    height: 62%
    pointer-events: none

.f-hud-button__badge
  position: absolute
  top: 0
  right: 0
  translate: 30% -30%
  display: flex
  align-items: center
  justify-content: center
  pointer-events: none

// ─── Tones ──────────────────────────────────────────────────────────────────

.tone-gold
  .f-hud-button__shadow
    background-color: var(--btn-yellow-drop)
  .f-hud-button__body
    background-image: linear-gradient(to bottom, var(--btn-yellow-from), var(--btn-yellow-to))

.tone-blue
  .f-hud-button__shadow
    background-color: var(--btn-blue-drop)
  .f-hud-button__body
    background-image: linear-gradient(to bottom, var(--btn-blue-from), var(--btn-blue-to))

.tone-green
  .f-hud-button__shadow
    background-color: var(--btn-green-drop)
  .f-hud-button__body
    background-image: linear-gradient(to bottom, var(--btn-green-from), var(--btn-green-to))

.tone-slate
  .f-hud-button__shadow
    background-color: var(--btn-plain-drop)
  .f-hud-button__body
    background-image: linear-gradient(to bottom, var(--btn-plain-from), var(--btn-plain-to))

.is-attention
  animation: hud-pulse 1.6s ease-in-out infinite

@keyframes hud-pulse
  0%, 100%
    filter: drop-shadow(0 0 0 rgba(255, 200, 0, 0))
  50%
    filter: drop-shadow(0 0 8px rgba(255, 200, 0, 0.75))

// A double hop, then a long pause. A continuous bounce reads as decoration and
// the eye filters it out within seconds; a burst every couple of seconds keeps
// catching the eye for as long as it takes, which is the whole job. `transform`
// only, so it composites and never lays the HUD out again.
//
// It rides on the SAME element as the glow, so the two animations have to be
// declared together — a second `animation` property would replace the first
// rather than add to it, and the button would bounce without its aura.
.is-bounce
  animation: hud-bounce 2.4s ease-in-out infinite

.is-attention.is-bounce
  animation: hud-pulse 1.6s ease-in-out infinite, hud-bounce 2.4s ease-in-out infinite

@keyframes hud-bounce
  0%, 34%, 100%
    transform: translateY(0)
  8%
    transform: translateY(-22%)
  17%
    transform: translateY(0)
  25%
    transform: translateY(-11%)

// A player who has asked the OS for less motion still needs to find the tech
// tree — they just must not be jumped at. The glow carries the signal on its
// own, so the hop is dropped rather than the whole nudge.
@media (prefers-reduced-motion: reduce)
  .is-bounce,
  .is-attention.is-bounce
    animation: hud-pulse 1.6s ease-in-out infinite
</style>

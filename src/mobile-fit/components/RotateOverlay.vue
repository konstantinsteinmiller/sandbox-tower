<script setup lang="ts">
import { useI18n } from 'vue-i18n'

/**
 * "Hold your phone upright."
 *
 * The drop board is a portrait game: five columns of thumb-wide cells with the
 * sky as the air lane. Sideways it would be a strip of board with nowhere to
 * put the hand. The scene pauses the simulation while this is up, so a wave
 * cannot play out under a screen the player cannot act on.
 */
const { t } = useI18n()
</script>

<template lang="pug">
  div.rotate
    div.rotate__phone
      i
    p.rotate__text {{ t('mobile.rotatePortrait') }}
</template>

<style scoped lang="sass">
.rotate
  position: fixed
  inset: 0
  z-index: 60
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 1rem
  // The splash's sunny sky into sand (index.html).
  background: linear-gradient(180deg, #6fc3f7 0%, #a9dcf9 38%, #d6f0ff 56%, #f6e2ae 70%, #e3c07e 100%)
  pointer-events: auto

.rotate__phone
  width: 3.2rem
  height: 5.4rem
  // A toy phone: pool-blue plastic shell with the sunshine rim.
  border: 3px solid var(--ui-rim)
  border-radius: 0.6rem
  background-image: linear-gradient(to bottom, var(--ui-panel-top), var(--ui-panel-bot))
  box-shadow: 0 0 0 2px var(--ui-line), inset 0 2px 0 var(--ui-gloss)
  animation: rotate-hint 1.6s ease-in-out infinite
  transform-origin: center

  i
    display: block
    width: 1rem
    height: 3px
    margin: 0.35rem auto 0
    border-radius: 3px
    background-color: var(--ui-text-soft)

@keyframes rotate-hint
  0%, 20%
    transform: rotate(-90deg)
  60%, 100%
    transform: rotate(0deg)

.rotate__text
  max-width: 16rem
  color: #fff
  font-size: 1.1rem
  font-weight: 900
  text-align: center
  text-shadow: 2px 2px 0 #000
</style>

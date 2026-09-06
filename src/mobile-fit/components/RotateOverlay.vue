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
  background: radial-gradient(circle at 50% 40%, #1b2b52 0%, #0a1224 70%)
  pointer-events: auto

.rotate__phone
  width: 3.2rem
  height: 5.4rem
  border: 3px solid #cfe4ff
  border-radius: 0.6rem
  animation: rotate-hint 1.6s ease-in-out infinite
  transform-origin: center

  i
    display: block
    width: 1rem
    height: 3px
    margin: 0.35rem auto 0
    border-radius: 3px
    background-color: #cfe4ff

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

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { spriteFor, onArtChanged } from '@/game/art'

/**
 * Painted glyph when there is one, the drawn SVG otherwise.
 *
 * These three sit in the HUD bar on every frame of the game, so leaving them as
 * flat vector under a hand-painted tower is the one style mismatch a player
 * cannot look away from.
 *
 * The probe is async, so the component subscribes: the first paint happens
 * before the bitmap decodes, and without the subscription the icon would keep
 * the vector until something else forced a re-render.
 */
const painted = ref<string | null>(null)
const sync = (): void => { painted.value = spriteFor('icon', 'gold')?.src ?? null }

onMounted(() => {
  sync()
  const stop = onArtChanged(sync)
  onUnmounted(stop)
})
</script>

<template lang="pug">
  //- ─── Gold ────────────────────────────────────────────────────────────────
  //-
  //- The RUN currency: kill drops, block prices, block upgrades. Deliberately
  //- NOT a coin — `IconCoin` is the META wallet spent in the tech tree, and the
  //- two were sharing one icon while being two different balances the player
  //- can hold at once. An ingot beside a coin is unmistakable at 20 px; two
  //- coins of different sizes are not.
  //-
  //- Sized by the caller (`w-4 h-4`, or a CSS width/height), like every other
  //- icon in the set.
  img(v-if="painted" :src="painted" alt="" aria-hidden="true" class="res-icon-img")
  svg(v-else viewBox="0 0 24 24" aria-hidden="true")
    //- Two nuggets behind the bar, so the pile has depth rather than being one
    //- floating brick.
    path(
      d="M3.2 17.6 L6 15.4 L9.4 16.2 L8.6 19.6 L4.6 20.2 Z"
      fill="#b8801a"
      stroke="#6d4708"
      stroke-width="1"
      stroke-linejoin="round"
    )
    path(
      d="M15 16 L18.4 14.9 L21 17.1 L19.8 20.1 L16 20 Z"
      fill="#c98f1e"
      stroke="#6d4708"
      stroke-width="1"
      stroke-linejoin="round"
    )
    //- The ingot: a trapezoid body with a bright cast top face. The two-plane
    //- read is what makes it a solid bar rather than a yellow blob.
    path(
      d="M5.4 10.6 L18.6 10.6 L21 19.4 L3 19.4 Z"
      fill="#e0a81c"
      stroke="#6d4708"
      stroke-width="1.3"
      stroke-linejoin="round"
    )
    path(
      d="M5.4 10.6 L18.6 10.6 L16.6 7.4 L7.4 7.4 Z"
      fill="#ffd95e"
      stroke="#6d4708"
      stroke-width="1.3"
      stroke-linejoin="round"
    )
    //- One specular streak across the top face, off-centre.
    path(
      d="M8.9 8.4 L14.4 8.4 L13.6 9.6 L8.2 9.6 Z"
      fill="#fff3b8"
    )
    //- ...and a cool bounce along the ingot's shadow side, so the body has two
    //- values instead of one flat fill.
    path(
      d="M3 19.4 L5.4 10.6 L8 10.6 L6.1 19.4 Z"
      fill="#c08a12"
    )
</template>

<style scoped lang="sass">
svg
  display: block
  overflow: visible
</style>

<style scoped lang="sass">
// Matches the SVG arm exactly: the caller sizes these with utility classes and
// must not have to care which arm it got.
.res-icon-img
  display: block
  width: 100%
  height: 100%
  object-fit: contain
</style>

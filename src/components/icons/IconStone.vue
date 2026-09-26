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
const sync = (): void => { painted.value = spriteFor('icon', 'stone')?.src ?? null }

onMounted(() => {
  sync()
  const stop = onArtChanged(sync)
  onUnmounted(stop)
})
</script>

<template lang="pug">
  //- ── Pebbles (resource id `stone`) ──
  //-
  //- Three smooth grey-blue pebbles in a little pile, each with a wet-look
  //- highlight. Round, where the sand is a heap and gold an ingot, so the three
  //- resources never share a silhouette.
  //-
  //- Sized by the caller (e.g. `class="w-4 h-4"`), like every other icon here.
  img(v-if="painted" :src="painted" alt="" aria-hidden="true" class="res-icon-img")
  svg(v-else viewBox="0 0 24 24" aria-hidden="true")
    g(stroke="#34404e" stroke-width="1.2" stroke-linejoin="round")
      ellipse(cx="7.3" cy="17.3" rx="5.7" ry="4.1" fill="#8594a6")
      ellipse(cx="17.1" cy="17.9" rx="5.1" ry="3.6" fill="#71829a")
      ellipse(cx="12.3" cy="10.5" rx="5.6" ry="4.4" fill="#9fb0c2")
    //- Highlights, upper left.
    ellipse(cx="5.9" cy="15.9" rx="2.4" ry="1.15" fill="#c9d4df")
    ellipse(cx="15.8" cy="16.8" rx="2" ry="1" fill="#a9b8c8")
    ellipse(cx="10.7" cy="8.9" rx="2.6" ry="1.35" fill="#e2e9f0")
    //- Contact shadows between the stones.
    path(d="M8.4 19.9 Q11 19.5 12.3 17.6" fill="none" stroke="#5f6f82" stroke-width="0.9" stroke-linecap="round")
    path(d="M14.3 13.4 Q16.4 12.8 17.3 10.9" fill="none" stroke="#6e7f93" stroke-width="0.9" stroke-linecap="round")
    circle(cx="19.3" cy="18.8" r="0.55" fill="#4f5d6e")
    circle(cx="4.6" cy="18.6" r="0.5" fill="#5f6f82")
</template>

<style scoped lang="sass">
// Matches the SVG arm exactly: the caller sizes these with utility classes and
// must not have to care which arm it got.
.res-icon-img
  display: block
  width: 100%
  height: 100%
  object-fit: contain
</style>

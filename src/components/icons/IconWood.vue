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
const sync = (): void => { painted.value = spriteFor('icon', 'wood')?.src ?? null }

onMounted(() => {
  sync()
  const stop = onArtChanged(sync)
  onUnmounted(stop)
})
</script>

<template lang="pug">
  //- ── Sand (resource id `wood`) ──
  //-
  //- A heap of sand with a toy spade stuck in it. The heap alone read as a tan
  //- blob at HUD size; the blue spade handle is the tell that makes it the
  //- sandbox's sand, and gives it a silhouette no other resource shares
  //- (pebbles are round, gold is an ingot).
  //-
  //- Sized by the caller (e.g. `class="w-4 h-4"`), like every other icon here.
  img(v-if="painted" :src="painted" alt="" aria-hidden="true" class="res-icon-img")
  svg(v-else viewBox="0 0 24 24" aria-hidden="true")
    //- The spade, drawn first so the heap buries its blade.
    g(transform="rotate(30 17.5 8)")
      rect(x="16.55" y="1.2" width="1.9" height="8.4" rx="0.95" fill="#2f7de1" stroke="#173a66" stroke-width="0.9")
      rect(x="14.8" y="0.3" width="5.4" height="2.1" rx="1.05" fill="#5fb2ff" stroke="#173a66" stroke-width="0.9")
      path(d="M14.8 9 H20.2 L19.8 13.2 Q17.5 14.9 15.2 13.2 Z" fill="#ffc93c" stroke="#8a5a12" stroke-width="0.9" stroke-linejoin="round")
    //- The heap: lit face left, shadow right (light from the upper left).
    path(d="M1.3 21.2 C1.9 14.6 5.6 8 11.6 7.7 C17.9 7.6 21.9 14.4 22.7 21.2 Z" fill="#e3c07e" stroke="#6e4d2a" stroke-width="1.3" stroke-linejoin="round")
    path(d="M3.1 20.2 C3.8 15.2 6.6 9.9 11 9.1 C9.1 11.8 8 15.7 7.9 20.2 Z" fill="#f6e2ae")
    path(d="M16.2 20.2 C16 15.6 15 11.9 13.4 9.3 C17.6 10.5 20.4 15.1 20.9 20.2 Z" fill="#c79a5c")
    path(d="M5 16.4 Q12 14.8 19.4 16.2" fill="none" stroke="#c79a5c" stroke-width="0.7" stroke-linecap="round" opacity="0.7")
    //- Grain speckle.
    circle(cx="10.4" cy="12.6" r="0.6" fill="#b88c4c")
    circle(cx="12.8" cy="18.4" r="0.65" fill="#b88c4c")
    circle(cx="9.6" cy="17.6" r="0.5" fill="#9c7440")
    circle(cx="5.8" cy="18.4" r="0.6" fill="#fff4d6")
    circle(cx="18" cy="18" r="0.6" fill="#9c7440")
    circle(cx="12.6" cy="11" r="0.5" fill="#fff4d6")
    circle(cx="14.4" cy="14.2" r="0.5" fill="#b88c4c")
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

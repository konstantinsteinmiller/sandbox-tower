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
  //- ── Stone ──
  //-
  //- Two faceted blocks, each cut into a lit top plane and a shadowed face. One
  //- flat pentagon read as a grey smudge; the plane break is what makes it read
  //- as cut rock.
  //-
  //- Sized by the caller (e.g. `class="w-4 h-4"`), like every other icon here.
  img(v-if="painted" :src="painted" alt="" aria-hidden="true" class="res-icon-img")
  svg(v-else viewBox="0 0 24 24" aria-hidden="true")
    //- Back block.
    g(stroke="#39404a" stroke-width="1" stroke-linejoin="round")
      path(d="M2.6 12.4 L7 9.6 L12.4 11.4 L11.6 17.6 L4.4 18.6 Z" fill="#6a727d")
      path(d="M2.6 12.4 L7 9.6 L12.4 11.4 L7.6 13.4 Z" fill="#8d97a3")
    //- Front block, larger and a step lighter — the one the eye lands on.
    g(stroke="#39404a" stroke-width="1.2" stroke-linejoin="round")
      path(d="M9.4 13 L15.2 8.8 L21.4 11.8 L20.4 19.4 L11.4 20.4 Z" fill="#78818d")
      path(d="M9.4 13 L15.2 8.8 L21.4 11.8 L15.6 14.6 Z" fill="#a7b2bf")
      path(d="M15.6 14.6 L21.4 11.8 L20.4 19.4 Z" fill="#5f6772")
    //- Two chips of quartz catching the light.
    path(d="M13.2 11.4 L15 10.6 L14.4 12 Z" fill="#dfe7f0")
    path(d="M4.8 12.2 L6.4 11.4 L5.9 12.7 Z" fill="#c9d3de")
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

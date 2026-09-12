<script setup lang="ts">
import BlockTile from '@/components/game/BlockTile.vue'
import { GATE_ID } from '@/game/blocks'

/**
 * The revive button's picture: your rubble standing back up as a tower.
 *
 * ── What it replaced, and why twice ──
 *
 * First a fast-forward mark, which the 2026-09-11 rerun's testers read as
 * "skip" or "speed up" — the one thing a continue is not. Then a rewind arrow
 * with the Gate inside it, which measured no better for a different reason:
 * at button size D1 saw "a small square in a white ring", read the row
 * "WAVE 9 +100 +100 30" as a wave-9 completion REWARD to claim, and came away
 * believing the restart button had resumed the siege. P6 tapped it with "no
 * explanation of cost or effect" and only found out on the tap. The resource
 * bonus was the biggest thing on the button, so the bonus is what it said.
 *
 * So the picture carries it now, and it is the only thing on the button that
 * is large: a heap of broken blocks lifts, straightens and locks together into
 * a standing tower over the Gate, on a slow loop. Rubble → tower is the whole
 * offer in one image, and it needs no word in any language.
 *
 * The blocks are the game's own painted tiles rather than a drawing of some,
 * so what stands up is recognisably the thing that just fell down.
 */

/** The four pieces, bottom-up: the Gate, its flanks, and a crown. Each entry
 *  is the tile's grid cell and how far its rubble had scattered. */
const PARTS = [
  { id: GATE_ID, x: 0, y: 0, from: -14, rot: 26 },
  { id: 'stone', x: -1, y: 0, from: -26, rot: -34 },
  { id: 'stone', x: 1, y: 0, from: -22, rot: 30 },
  { id: 'wood', x: 0, y: 1, from: -38, rot: -22 }
] as const
</script>

<template lang="pug">
  span.rebuilt(aria-hidden="true")
    span.rebuilt__ground
    span.rebuilt__part(
      v-for="(p, i) in PARTS"
      :key="i"
      :style="{ '--x': p.x, '--y': p.y, '--from': `${p.from}%`, '--rot': `${p.rot}deg`, '--i': i }"
    )
      BlockTile(:type-id="p.id" :size="34" :glyph="false")
</template>

<style scoped lang="sass">
// One cell of the little tower, in em so the whole picture follows the caption
// it sits beside. Three cells across, two high, plus a hair of ground.
$cell: 0.78em

.rebuilt
  position: relative
  flex: 0 0 auto
  display: block
  width: calc(#{$cell} * 3)
  height: calc(#{$cell} * 2.35)
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.45))

// The line the tower rebuilds ON. Without it the pieces rise out of nothing
// and the picture reads as blocks floating rather than as ground being rebuilt.
.rebuilt__ground
  position: absolute
  inset-inline: 0
  bottom: 0
  height: 0.13em
  border-radius: 999px
  background-image: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 240, 200, 0.75), rgba(255, 255, 255, 0))

.rebuilt__part
  position: absolute
  left: 50%
  bottom: 0.13em
  width: $cell
  height: $cell
  margin-left: calc(#{$cell} / -2)
  translate: calc(var(--x) * #{$cell}) calc(var(--y) * -1 * #{$cell})
  transform-origin: 50% 100%
  // Each piece settles a beat after the one below it, so the tower builds from
  // the ground up rather than snapping together all at once.
  animation: rebuilt-settle 3s cubic-bezier(0.35, 1.5, 0.5, 1) calc(var(--i) * 130ms) infinite

  // BlockTile sizes its canvas in pixels; this one follows the caption.
  :deep(.block-tile)
    width: 100% !important
    height: 100% !important

// Scattered and tipped over (rubble), then lifted, straightened and locked in
// place — and HELD there for most of the loop, because the standing tower is
// what is being offered, not the animation.
@keyframes rebuilt-settle
  0%, 8%
    transform: translateY(var(--from)) rotate(var(--rot)) scale(0.82)
    opacity: 0.25
  34%
    transform: translateY(0) rotate(0deg) scale(1.06)
    opacity: 1
  42%, 88%
    transform: translateY(0) rotate(0deg) scale(1)
    opacity: 1
  100%
    transform: translateY(var(--from)) rotate(var(--rot)) scale(0.82)
    opacity: 0.25

// Still asked for: the tower stands, and stays standing.
@media (prefers-reduced-motion: reduce)
  .rebuilt__part
    animation: none
    transform: none
    opacity: 1
</style>

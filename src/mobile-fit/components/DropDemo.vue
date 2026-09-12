<script setup lang="ts">
import { computed } from 'vue'
import ShapeTile from '@/components/game/ShapeTile.vue'
import type { DimBox } from '@/components/game/dimRects'

/**
 * The drop, SHOWN — a ghost of the lesson's piece making the trip itself.
 *
 * The phone board's first coach mark used to be a lit column and an arrow, and
 * nothing else: no word of what to do there (the coach marks carry no copy, by
 * rule) and no picture of it either. The 2026-09-11 blind playtest put five
 * phone players in front of it and none of them finished the beat. All five
 * read the lit column as "the lane the monsters come down", pressed the card
 * first, found it dead under the dim, and one of them concluded the game had
 * frozen.
 *
 * So the lesson plays itself, on a loop, until the player does it: a finger
 * dot presses the armed card, the card's piece lifts off it as a translucent
 * copy, rides the finger up into the lit column and settles into the cell it
 * will really land in, and a ripple marks the release. The same trip works as
 * a drag or as tap-then-tap; the demo is the drag, because a drag names both
 * ends of the gesture in one motion.
 *
 * Wordless like the overlay under it, and inert: `pointer-events: none` on
 * the whole layer, so the demo can never be what swallows the player's touch.
 * Reduced motion keeps the picture and drops the trip — the ghost stands in its
 * landing cell with a still ring round it.
 */

interface Props {
  /** The armed piece — what the ghost is a copy of. */
  shapeId: string | null
  /** The tray card it lifts off, screen space. */
  from: DimBox | null
  /** The cell it settles into, screen space. */
  to: DimBox | null
}

const props = defineProps<Props>()

/** The ghost is painted at the tray's own tile size and scaled to the cell. */
const GHOST = 52

const style = computed(() => {
  const a = props.from
  const b = props.to
  if (!a || !b) return undefined
  const x0 = a.x + a.w / 2
  const y0 = a.y + a.h / 2
  const x1 = b.x + b.w / 2
  const y1 = b.y + b.h / 2
  return {
    '--x0': `${Math.round(x0)}px`,
    '--y0': `${Math.round(y0)}px`,
    '--dx': `${Math.round(x1 - x0)}px`,
    '--dy': `${Math.round(y1 - y0)}px`,
    '--s1': (Math.max(12, b.w) / GHOST).toFixed(3),
    '--cell': `${Math.round(Math.max(12, b.w))}px`
  }
})
</script>

<template lang="pug">
  div.demo(v-if="shapeId && style" aria-hidden="true" :style="style")
    span.demo__ripple
    span.demo__ghost
      ShapeTile(:shape-id="shapeId" :size="GHOST")
    span.demo__touch
</template>

<style scoped lang="sass">
// One loop, three layers on one clock: the finger presses (0-20%), carries
// (20-56%), lets go (56-62%); the piece settles; the ripple answers the
// release. Everything is `transform`/`opacity`, so it composites.
$loop: 2.6s

.demo
  position: fixed
  inset: 0
  // Over the coach-mark dim (z 40), under nothing the player can press.
  z-index: 41
  pointer-events: none

.demo__ghost,
.demo__touch,
.demo__ripple
  position: absolute
  left: var(--x0)
  top: var(--y0)
  pointer-events: none

.demo__ghost
  width: 52px
  height: 52px
  margin: -26px 0 0 -26px
  opacity: 0
  filter: drop-shadow(0 0 10px rgba(127, 224, 255, 0.85)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))
  animation: demo-carry $loop ease-in-out infinite

.demo__touch
  width: 30px
  height: 30px
  margin: -4px 0 0 -4px
  border-radius: 999px
  background: radial-gradient(circle at 40% 35%, rgba(255, 255, 255, 0.95), rgba(220, 236, 255, 0.75) 60%, rgba(160, 200, 255, 0.4))
  box-shadow: 0 0 0 3px rgba(20, 30, 50, 0.55), 0 4px 10px rgba(0, 0, 0, 0.5)
  opacity: 0
  animation: demo-finger $loop ease-in-out infinite

// The release, where the piece will land — anchored on the destination.
.demo__ripple
  left: calc(var(--x0) + var(--dx))
  top: calc(var(--y0) + var(--dy))
  width: var(--cell)
  height: var(--cell)
  margin: calc(var(--cell) / -2) 0 0 calc(var(--cell) / -2)
  border: 3px solid rgba(255, 224, 110, 0.95)
  border-radius: 0.6rem
  opacity: 0
  animation: demo-ripple $loop ease-out infinite

@keyframes demo-carry
  0%
    transform: translate(0, 0) scale(1)
    opacity: 0
  8%, 20%
    transform: translate(0, -14px) scale(1.08)
    opacity: 0.92
  56%
    transform: translate(var(--dx), var(--dy)) scale(var(--s1))
    opacity: 0.92
  62%
    transform: translate(var(--dx), calc(var(--dy) - 6px)) scale(var(--s1))
  68%, 88%
    transform: translate(var(--dx), var(--dy)) scale(var(--s1))
    opacity: 0.92
  100%
    transform: translate(var(--dx), var(--dy)) scale(var(--s1))
    opacity: 0

@keyframes demo-finger
  0%
    transform: translate(0, 0) scale(1.35)
    opacity: 0
  8%
    transform: translate(0, 0) scale(1)
    opacity: 0.95
  20%
    transform: translate(0, -14px) scale(0.88)
    opacity: 0.95
  56%
    transform: translate(var(--dx), var(--dy)) scale(0.88)
    opacity: 0.95
  64%
    transform: translate(var(--dx), calc(var(--dy) - 10px)) scale(1.3)
    opacity: 0
  100%
    transform: translate(var(--dx), var(--dy)) scale(1.3)
    opacity: 0

@keyframes demo-ripple
  0%, 56%
    transform: scale(0.5)
    opacity: 0
  60%
    transform: scale(0.7)
    opacity: 0.95
  88%
    transform: scale(1.45)
    opacity: 0
  100%
    transform: scale(1.45)
    opacity: 0

// The picture without the trip: the piece stands where it will land, ringed.
@media (prefers-reduced-motion: reduce)
  .demo__ghost
    animation: none
    opacity: 0.85
    transform: translate(var(--dx), var(--dy)) scale(var(--s1))
  .demo__touch
    display: none
  .demo__ripple
    animation: none
    opacity: 0.9
    transform: scale(1.12)
</style>

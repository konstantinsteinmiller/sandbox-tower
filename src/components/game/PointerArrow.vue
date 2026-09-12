<script setup lang="ts">
import { computed } from 'vue'

/**
 * A fat yellow arrow pointing at whatever it is placed next to.
 *
 * The coach-mark arrow (`TutorialOverlay`) without the dim sheet around it: the
 * same gradient, the same dark casing and the same bob, so "the yellow arrow"
 * means one thing everywhere it appears — press what I am pointing at. No words;
 * the arrow and the gold glow on its target are the whole instruction.
 *
 * Drop it inside the target's positioned wrapper and say which SIDE of the
 * target it sits on; it points back at the target from there. It never takes
 * a tap — a pointer that swallowed the press aimed at the thing it points to
 * would be worse than no pointer.
 */

interface Props {
  /** Which side of the target the arrow sits on. It points toward the target. */
  side?: 'top' | 'bottom' | 'left' | 'right'
  /** Arrow length in rem (tip to tail). The width follows at the coach mark's ratio. */
  length?: number
  /** Clear space between the tip and the target's edge, in rem. */
  gap?: number
}

const props = withDefaults(defineProps<Props>(), {
  side: 'top',
  length: 2.6,
  gap: 0.15
})

// Gradient ids are document-global, and several arrows can be live at once
// (the HUD button's and the tree card's). A shared id would let one arrow's
// gradient vanish with another's unmount. `<script setup>` runs per instance,
// so this is per arrow.
const gid = `pointerArrowFill${Math.random().toString(36).slice(2, 9)}`

/** Rotation that turns the down-pointing artwork toward the target. */
const ANGLE: Record<NonNullable<Props['side']>, number> = {
  top: 0,
  bottom: 180,
  left: -90,
  right: 90
}

const style = computed(() => ({
  '--pa-len': `${props.length}rem`,
  '--pa-wide': `${(props.length * 0.68).toFixed(3)}rem`,
  '--pa-gap': `${props.gap}rem`,
  '--pa-angle': `${ANGLE[props.side]}deg`
}))
</script>

<template lang="pug">
  //- The outer span is a zero-size anchor parked on the point the tip must
  //- touch; the shape hangs off it tip-down and rotates about that tip, so one
  //- drawing serves all four sides.
  span.pointer-arrow(:class="`is-${side}`" :style="style" aria-hidden="true")
    span.pointer-arrow__shape
      svg.pointer-arrow__svg(viewBox="0 0 64 96" preserveAspectRatio="none")
        defs
          linearGradient(:id="gid" x1="0" y1="0" x2="0" y2="1")
            stop(offset="0" stop-color="#ffe98a")
            stop(offset="0.45" stop-color="#ffd02a")
            stop(offset="1" stop-color="#f79000")
        path(
          d="M22 6 h20 v44 h15 L32 92 L9 50 h13 z"
          :fill="`url(#${gid})`"
          stroke="#5a3200"
          stroke-width="5"
          stroke-linejoin="round"
        )
</template>

<style scoped lang="sass">
.pointer-arrow
  position: absolute
  z-index: 6
  width: 0
  height: 0
  pointer-events: none

  &.is-top
    left: 50%
    bottom: calc(100% + var(--pa-gap))
  &.is-bottom
    left: 50%
    top: calc(100% + var(--pa-gap))
  &.is-left
    top: 50%
    right: calc(100% + var(--pa-gap))
  &.is-right
    top: 50%
    left: calc(100% + var(--pa-gap))

.pointer-arrow__shape
  position: absolute
  left: calc(var(--pa-wide) / -2)
  bottom: 0
  width: var(--pa-wide)
  height: var(--pa-len)
  transform-origin: 50% 100%
  transform: rotate(var(--pa-angle))
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.6))

.pointer-arrow__svg
  display: block
  width: 100%
  height: 100%
  // Bobs along its own axis — after the rotation that is always "toward the
  // thing it points at". Same beat as the coach-mark arrow.
  animation: pointer-arrow-bob 0.9s ease-in-out infinite

@keyframes pointer-arrow-bob
  0%, 100%
    transform: translateY(-12%)
  50%
    transform: translateY(2%)

@media (prefers-reduced-motion: reduce)
  .pointer-arrow__svg
    animation: none
</style>

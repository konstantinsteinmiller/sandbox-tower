<script setup lang="ts">
import { computed } from 'vue'
import type { HandState } from '@/use/useAutoHand'

/**
 * ─── The tutorial's automatic hand ──────────────────────────────────────────
 *
 * What the player sees while a scripted sequence (`useAutoHand`) plays: a
 * gloved hand that glides between targets and presses them, with a ripple
 * where the fingertip lands. The position it is given IS the fingertip — the
 * glove is drawn up and to the right of it, so the point being pressed is never
 * hidden under the hand pressing it.
 *
 * While it is up, a transparent layer takes every pointer event on the screen.
 * The hand is DEMONSTRATING: a player tapping along underneath it would open
 * panels and buy things out from under the script, and the lesson is that one
 * sequence, watched. It is a few seconds long and ends on its own.
 *
 * Inked like the cast — a dark line under a flat pale fill — rather than an
 * emoji or a system cursor, so it reads as part of the game rather than as an
 * operating system reaching into it.
 */

const props = defineProps<{ hand: HandState }>()

const handStyle = computed(() => ({
  left: `${props.hand.x}px`,
  top: `${props.hand.y}px`,
  transitionDuration: `${props.hand.moveMs}ms`
}))
</script>

<template lang="pug">
  Transition(name="thand-fade")
    div.thand-layer(
      v-if="hand.visible"
      aria-hidden="true"
      @pointerdown.stop.prevent
      @click.stop.prevent
    )
      div.thand(:style="handStyle" :class="{ 'is-pressing': hand.pressing }")
        span.thand__ripple(v-if="hand.pressing")
        //- The fingertip sits at the viewBox's (15, 2). Every shape is stroked
        //- first and filled after, so the glove reads as ONE outlined form with
        //- no seams where the fingers overlap the palm.
        svg.thand__glove(viewBox="0 0 48 58")
          g.thand__ink
            rect(x="10" y="2" width="10" height="30" rx="5")
            rect(x="19" y="18" width="9" height="18" rx="4.5")
            rect(x="27" y="21" width="9" height="17" rx="4.5")
            rect(x="35" y="25" width="8" height="15" rx="4")
            path(d="M10 30 Q 2 30 3 38 Q 5 46 12 50 L 14 30 Z")
            rect(x="9" y="28" width="34" height="26" rx="10")
          g.thand__fill
            rect(x="10" y="2" width="10" height="30" rx="5")
            rect(x="19" y="18" width="9" height="18" rx="4.5")
            rect(x="27" y="21" width="9" height="17" rx="4.5")
            rect(x="35" y="25" width="8" height="15" rx="4")
            path(d="M10 30 Q 2 30 3 38 Q 5 46 12 50 L 14 30 Z")
            rect(x="9" y="28" width="34" height="26" rx="10")
          //- Knuckle creases and a cuff, so it is a hand and not a mitten.
          path.thand__crease(d="M20 30 v5 M28 32 v4 M36 34 v3")
          rect.thand__cuff(x="12" y="48" width="28" height="8" rx="3")
</template>

<style scoped lang="sass">
// Above the coach marks (40) and the tutorial's cards (45): the hand plays in
// the gap between them and has to be over whatever panel it is pressing.
.thand-layer
  position: fixed
  inset: 0
  z-index: 50
  cursor: default
  touch-action: none

.thand
  position: absolute
  width: 46px
  height: 56px
  // The fingertip (15, 2 of 48 × 58) onto the point.
  translate: -31% -3%
  transition-property: left, top
  transition-timing-function: cubic-bezier(0.45, 0, 0.25, 1)
  pointer-events: none
  filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.45))

  &.is-pressing .thand__glove
    scale: 0.86
    translate: 0 5%

.thand__glove
  display: block
  width: 100%
  height: 100%
  overflow: visible
  transform-origin: 31% 3%
  transition: scale 90ms ease-out, translate 90ms ease-out

.thand__ink
  fill: #1a1208
  stroke: #1a1208
  stroke-width: 4.5
  stroke-linejoin: round

.thand__fill
  fill: #fffaf0

.thand__crease
  fill: none
  stroke: #c9b89a
  stroke-width: 1.6
  stroke-linecap: round

.thand__cuff
  fill: #ffd35c
  stroke: #1a1208
  stroke-width: 2.4

// The tap, where the fingertip is: one gold ring swelling out.
.thand__ripple
  position: absolute
  left: 31%
  top: 3%
  width: 44px
  height: 44px
  margin: -22px 0 0 -22px
  border-radius: 50%
  border: 3px solid rgba(255, 217, 60, 0.95)
  animation: thand-ripple 0.42s ease-out forwards

@keyframes thand-ripple
  from
    scale: 0.3
    opacity: 1
  to
    scale: 1.5
    opacity: 0

.thand-fade-enter-active, .thand-fade-leave-active
  transition: opacity 0.2s ease

.thand-fade-enter-from, .thand-fade-leave-to
  opacity: 0

// Reduced motion keeps the demonstration — the hand has to get from one target
// to the next to show anything — and drops the flourish on the press.
@media (prefers-reduced-motion: reduce)
  .thand__ripple
    animation: none
    opacity: 0

  .thand__glove
    transition: none
</style>

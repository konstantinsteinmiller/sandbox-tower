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
 *
 * While the script is CARRYING (`useAutoHand`'s `grab` … `drop`), a piece rides
 * under the fingertip. Without it a drag is two taps with a glide in between,
 * which is exactly the reading the gift lesson has to overcome — the player who
 * has a piece in hand and does not know it can be dragged onto the tower. It is
 * a generic crate rather than the real block: the battlefield's painters live
 * in the renderer, the hand is a DOM overlay, and a wrong-looking real block
 * would be worse than an honest stand-in.
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
      div.thand(:style="handStyle" :class="{ 'is-pressing': hand.pressing, 'is-carrying': hand.carrying }")
        span.thand__ripple(v-if="hand.pressing")
        //- The piece in hand. Behind the glove in paint order, so the fingers
        //- close over it rather than the crate sitting on top of them.
        Transition(name="thand-carry")
          span.thand__carry(v-if="hand.carrying" aria-hidden="true")
            span.thand__carry-grain
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

// The carried piece, centred on the fingertip and a little below it, so the
// glove's fingers overlap its top edge and the two read as one gesture.
//
// Sized off the same percentages the ripple uses rather than a magic offset:
// both are anchored to the fingertip, and a crate that drifts off the finger
// when the hand box changes would be the first thing to look wrong.
.thand__carry
  position: absolute
  left: 31%
  top: 3%
  width: 34px
  height: 34px
  margin: -6px 0 0 -17px
  // A bucket-moulded Sand Block (sandbox-reskin.md: sand-light → sand-mid).
  border: 3px solid #1a1208
  border-radius: 6px
  background-image: linear-gradient(to bottom, #f6e2ae, #e3c07e)
  // Translucent, and it says so: this is a demonstration of a piece being
  // moved, not a piece that is actually on the board.
  opacity: 0.88
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
  rotate: -6deg
  pointer-events: none

// Two mould ridges. Enough to read as the game's sand block at 34px, and
// cheaper than another SVG for something that is on screen for two seconds.
.thand__carry-grain
  position: absolute
  inset: 5px 4px
  border-top: 2px solid rgba(184, 140, 76, 0.7)
  border-bottom: 2px solid rgba(184, 140, 76, 0.7)

// Picked up and set down, rather than appearing and vanishing: the pop is the
// half of the lesson that says WHEN the piece left the tray.
.thand-carry-enter-active
  transition: scale 160ms cubic-bezier(0.2, 1.5, 0.4, 1), opacity 160ms ease-out
.thand-carry-leave-active
  transition: scale 180ms ease-in, opacity 180ms ease-in
.thand-carry-enter-from
  scale: 0.4
  opacity: 0
.thand-carry-leave-to
  scale: 1.25
  opacity: 0

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

  // The crate stays — it is the content of the lesson, not decoration — and
  // only its pop goes.
  .thand-carry-enter-active,
  .thand-carry-leave-active
    transition: none
</style>

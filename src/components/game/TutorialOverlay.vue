<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

/**
 * First-run coach marks — WORDLESS, and not optional.
 *
 * Shown on the first stage of a player's first session, once ever. There is no
 * offer to accept, no Skip, no Next and no copy: every beat is a dimmed screen
 * with a hole cut over exactly one thing and a fat yellow arrow pointing at it,
 * and it advances only when the player performs the action.
 *
 * Design rules, in order of importance:
 *
 *   1. **The hole is the only live pixel on the screen.** The dim layer eats
 *      every pointer event outside it, so the one thing a player can do is the
 *      thing they are being taught. That is what makes the teaching unskippable
 *      without a single word of instruction.
 *   2. **No text.** The audience is children, and people deciding in five
 *      seconds whether to keep playing; a wall of copy is where both leave. A
 *      spotlight and an arrow say "tap here" in every language the game ships
 *      in — and in the ones it does not.
 *   3. **No dismiss control.** A Next button teaches "press the thing that
 *      makes this go away", and it let a player leave the tutorial without ever
 *      having placed a block, which is the entire point of it.
 *   4. **A step it cannot point at does not run.** With no measurable target
 *      the overlay renders NOTHING rather than a full-screen dim — a dim with
 *      no hole is a modal the player cannot get out of, and by design this
 *      component has no escape hatch to offer them.
 */

/**
 * `drop` and `merge` are the mobile-fit board's beats; the rest are shared.
 *
 * `mergeGuide` is the odd one out and deliberately so: it is a beat of the
 * TUTORIAL, but it is not a coach mark. It has no target to cut a hole over —
 * it hands the screen to `MergeGuide`, a pictogram card — so this component
 * renders nothing for it, by the same no-hole-no-overlay rule every other step
 * obeys. It lives in the union anyway so the scene's step list stays one typed
 * sequence rather than a sequence plus a special case beside it.
 */
export type TutorialStep =
  'pick' | 'place' | 'mergeGuide' | 'inspectMerged' | 'rankUp' | 'call' | 'drop' | 'merge'

interface Props {
  /** Which step is live, or null when the tutorial is finished/never started. */
  step: TutorialStep | null
  /** Screen-space rect to cut out of the dim layer. */
  target: { x: number; y: number; w: number; h: number } | null
}

const props = defineProps<Props>()

/**
 * Beats that are NOT coach marks — they hand the whole screen to a card.
 *
 * Enforced here rather than by the scene passing a null rect, because "the
 * scene remembered to stop measuring" is not a guarantee: `measureTutorialTarget`
 * is on a poll, and one stale rect surviving a step change would cut a hole in
 * a card with nothing reachable behind it and dim the card itself.
 */
const CARD_STEPS = new Set<TutorialStep>(['mergeGuide'])

/** Padding around the highlighted element, so the hole never crops it. */
const PAD = 10

const hole = computed(() => {
  if (props.step && CARD_STEPS.has(props.step)) return null
  const r = props.target
  if (!r) return null
  return {
    x: Math.round(r.x - PAD),
    y: Math.round(r.y - PAD),
    w: Math.round(r.w + PAD * 2),
    h: Math.round(r.h + PAD * 2)
  }
})

// Re-measure on resize: the overlay is positioned in screen space, so a rotate
// or a keyboard opening would otherwise leave the hole somewhere arbitrary.
const tick = ref(0)
const onResize = (): void => { tick.value++ }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

/**
 * The arrow: where it sits, how big it is, and which way it points.
 *
 * Sized off the viewport's short side so it is unmissable on a phone without
 * covering half a desktop screen, and placed on whichever side of the hole has
 * room for it — pointing back at the hole from there. `x`/`y` is the arrow's
 * TIP, which is the point that has to land on the thing being taught.
 */
const GAP_PX = 10

const arrow = computed(() => {
  void tick.value
  const h = hole.value
  if (!h) return null
  const vw = typeof window === 'undefined' ? 1024 : window.innerWidth
  const vh = typeof window === 'undefined' ? 768 : window.innerHeight

  const len = Math.round(Math.min(120, Math.max(64, Math.min(vw, vh) * 0.22)))
  const wide = Math.round(len * 0.68)
  const need = len + GAP_PX

  const cx = Math.round(h.x + h.w / 2)
  const cy = Math.round(h.y + h.h / 2)

  // Above first — an arrow coming down onto the target is the one everybody
  // reads without thinking — then below, then the sides.
  let x = cx
  let y = h.y - GAP_PX
  let angle = 0
  if (h.y < need) {
    if (vh - (h.y + h.h) >= need) { y = h.y + h.h + GAP_PX; angle = 180 }
    else if (h.x >= need) { x = h.x - GAP_PX; y = cy; angle = 90 }
    else if (vw - (h.x + h.w) >= need) { x = h.x + h.w + GAP_PX; y = cy; angle = -90 }
    // Nothing fits: keep it above and let it overhang the top edge rather than
    // point at nothing.
  }
  return { x, y, angle, w: wide, h: len }
})

/** The inline `transform`, kept out of the template so the pug line stays
 *  readable — it is three values and a rotation about the tip. */
const arrowStyle = computed(() => {
  const a = arrow.value
  if (!a) return undefined
  return {
    left: `${a.x}px`,
    top: `${a.y}px`,
    width: `${a.w}px`,
    height: `${a.h}px`,
    transform: `translate(-50%, -100%) rotate(${a.angle}deg)`
  }
})
</script>

<template lang="pug">
  Transition(name="tut")
    //- No hole means nothing to point at, and a dim layer with no hole is a
    //- modal the player cannot dismiss — this one has no dismiss control.
    div.tutorial(v-if="step && hole")
      //- The dim layer is four rects around the hole rather than one rect with
      //- a mask: it keeps the hole genuinely click-through on every browser,
      //- which `mask-image` does not — and it makes everything else inert,
      //- which is what forces the lesson.
      div.tutorial__dim(:style="{ left: 0, top: 0, width: '100%', height: hole.y + 'px' }")
      div.tutorial__dim(:style="{ left: 0, top: (hole.y + hole.h) + 'px', width: '100%', bottom: 0 }")
      div.tutorial__dim(:style="{ left: 0, top: hole.y + 'px', width: hole.x + 'px', height: hole.h + 'px' }")
      div.tutorial__dim(:style="{ left: (hole.x + hole.w) + 'px', top: hole.y + 'px', right: 0, height: hole.h + 'px' }")
      div.tutorial__ring(:style="{ left: hole.x + 'px', top: hole.y + 'px', width: hole.w + 'px', height: hole.h + 'px' }")

      //- The whole instruction. Rotated about its own tip, so one shape serves
      //- all four sides of the hole.
      div.tutorial__arrow(v-if="arrowStyle" aria-hidden="true" :style="arrowStyle")
        svg.tutorial__arrow-svg(viewBox="0 0 64 96" preserveAspectRatio="none")
          defs
            linearGradient#tutArrowFill(x1="0" y1="0" x2="0" y2="1")
              stop(offset="0" stop-color="#ffe98a")
              stop(offset="0.45" stop-color="#ffd02a")
              stop(offset="1" stop-color="#f79000")
          path(
            d="M22 6 h20 v44 h15 L32 92 L9 50 h13 z"
            fill="url(#tutArrowFill)"
            stroke="#5a3200"
            stroke-width="5"
            stroke-linejoin="round"
          )
</template>

<style scoped lang="sass">
.tutorial
  position: fixed
  inset: 0
  z-index: 40
  // The layer itself is inert; only the dim rects take pointer events, so the
  // highlighted control stays live through the hole and nothing else does.
  pointer-events: none

.tutorial__dim
  position: absolute
  background-color: rgba(6, 10, 20, 0.72)
  pointer-events: auto

.tutorial__ring
  position: absolute
  border: 3px solid rgba(255, 214, 80, 0.95)
  border-radius: clamp(0.5rem, 2.4vw, 0.9rem)
  box-shadow: 0 0 0 3px rgba(255, 214, 80, 0.25), 0 0 22px rgba(255, 200, 60, 0.5)
  animation: tut-pulse 1.5s ease-in-out infinite
  pointer-events: none

@keyframes tut-pulse
  0%, 100%
    box-shadow: 0 0 0 3px rgba(255, 214, 80, 0.2), 0 0 18px rgba(255, 200, 60, 0.35)
  50%
    box-shadow: 0 0 0 6px rgba(255, 214, 80, 0.4), 0 0 30px rgba(255, 200, 60, 0.7)

.tutorial__arrow
  position: absolute
  // Rotation pivots on the TIP, which `translate(-50%, -100%)` has just put on
  // the anchor point — so every side uses the same shape and the same anchor.
  transform-origin: 50% 100%
  pointer-events: none
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.65))

.tutorial__arrow-svg
  display: block
  width: 100%
  height: 100%
  // Bobs along its own axis, which after the parent's rotation always means
  // "towards the thing it is pointing at".
  animation: tut-arrow-bob 0.9s ease-in-out infinite

@keyframes tut-arrow-bob
  0%, 100%
    transform: translateY(-10%)
  50%
    transform: translateY(4%)

@media (prefers-reduced-motion: reduce)
  .tutorial__arrow-svg
    animation: none
  .tutorial__ring
    animation: none

.tut-enter-active, .tut-leave-active
  transition: opacity 180ms ease-out

.tut-enter-from, .tut-leave-to
  opacity: 0
</style>

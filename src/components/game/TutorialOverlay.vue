<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { dimAround, type DimBox } from './dimRects'

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
 *
 * `mergePower` follows it and is the same kind of beat: the four-second
 * `MergePowerDemo` owns the screen, and this component renders nothing.
 *
 * `rankGate` is played by the automatic hand (`TutorialHand`) rather than
 * pointed at, so the scene measures no target for it and nothing renders here.
 */
export type TutorialStep =
  'pick' | 'place' | 'mergeGuide' | 'mergePower' | 'inspectMerged' | 'rankUp' | 'rankGate' | 'call'
  | 'drop' | 'merge'

interface Props {
  /** Which step is live, or null when the tutorial is finished/never started. */
  step: TutorialStep | null
  /** Screen-space rect to cut out of the dim layer. */
  target: DimBox | null
  /**
   * A second live window: where the lesson's piece comes FROM.
   *
   * The phone board's drop beats teach "this card, into that column", and with
   * only the column live the card was dimmed and dead — so the first thing
   * every phone player in the 2026-09-11 blind playtest did (press the card,
   * drag it up) did nothing, and all five read the lit column as the lane the
   * monsters come down. With the card in its own window the natural gesture
   * works, and the path between the two windows is what the scene's ghost
   * demo walks. Ringed, never arrowed: the arrow still names the destination.
   * Absent on the desktop board, which keeps its single hole exactly as it was.
   */
  passage?: DimBox | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** The player tapped the dim — i.e. anywhere but the thing being taught. */
  (e: 'miss'): void
}>()

/**
 * ── Answering a tap that lands on the dim ───────────────────────────────────
 *
 * The dim eats every pointer event outside the hole, and until now that is
 * literally all it did: no sound, no movement, nothing. A player who has not
 * understood the arrow taps the biggest, brightest thing on the screen — which
 * IS the arrow, and the arrow is outside the hole and `pointer-events: none` —
 * gets absolutely no response, and concludes the game has frozen. There is no
 * Skip here to rescue them and no copy to re-read, so that conclusion ends the
 * session.
 *
 * So a miss is now answered in the game's own voice: the hole and the arrow
 * snap once towards each other ("not there; HERE" — the same answer a refused
 * placement gives) and the scene plays the refusal sound. It teaches nothing
 * new, and it is not a dismiss control. It only says the game is alive and is
 * still asking for the same thing.
 */
const bump = ref(0)
let bumpTimer = 0

const onMiss = (): void => {
  emit('miss')
  // Restart the animation even when one is already running: a player who taps
  // three times should see three answers, not one long one.
  bump.value++
  window.clearTimeout(bumpTimer)
  bumpTimer = window.setTimeout(() => { bump.value = 0 }, 420)
}

onUnmounted(() => window.clearTimeout(bumpTimer))

/**
 * Beats that are NOT coach marks — they hand the whole screen to a card.
 *
 * Enforced here rather than by the scene passing a null rect, because "the
 * scene remembered to stop measuring" is not a guarantee: `measureTutorialTarget`
 * is on a poll, and one stale rect surviving a step change would cut a hole in
 * a card with nothing reachable behind it and dim the card itself.
 */
const CARD_STEPS = new Set<TutorialStep>(['mergeGuide', 'mergePower'])

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

/** The second window, padded like the first — and only ever beside one. */
const passageHole = computed<DimBox | null>(() => {
  const r = props.passage
  if (!r || !hole.value) return null
  const pad = Math.round(PAD * 0.6)
  return {
    x: Math.round(r.x - pad),
    y: Math.round(r.y - pad),
    w: Math.round(r.w + pad * 2),
    h: Math.round(r.h + pad * 2)
  }
})

/**
 * The dim around BOTH windows, when there are two. The single-hole layout
 * below stays the four rects it always was.
 */
const passageDims = computed<DimBox[]>(() => {
  void tick.value
  const a = hole.value
  const b = passageHole.value
  if (!a || !b) return []
  const vw = typeof window === 'undefined' ? 1024 : window.innerWidth
  const vh = typeof window === 'undefined' ? 768 : window.innerHeight
  return dimAround([a, b], vw, vh)
})

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
      template(v-if="passageHole")
        div.tutorial__dim(
          v-for="(d, i) in passageDims"
          :key="i"
          :style="{ left: d.x + 'px', top: d.y + 'px', width: d.w + 'px', height: d.h + 'px' }"
          @pointerdown="onMiss"
        )
        div.tutorial__ring.is-passage(:class="{ 'is-bump': bump > 0 }" :key="'p' + bump" :style="{ left: passageHole.x + 'px', top: passageHole.y + 'px', width: passageHole.w + 'px', height: passageHole.h + 'px' }")
      template(v-else)
        div.tutorial__dim(:style="{ left: 0, top: 0, width: '100%', height: hole.y + 'px' }" @pointerdown="onMiss")
        div.tutorial__dim(:style="{ left: 0, top: (hole.y + hole.h) + 'px', width: '100%', bottom: 0 }" @pointerdown="onMiss")
        div.tutorial__dim(:style="{ left: 0, top: hole.y + 'px', width: hole.x + 'px', height: hole.h + 'px' }" @pointerdown="onMiss")
        div.tutorial__dim(:style="{ left: (hole.x + hole.w) + 'px', top: hole.y + 'px', right: 0, height: hole.h + 'px' }" @pointerdown="onMiss")
      //- `:key` on the bump so a second tap restarts the animation instead of
      //- joining the one already playing.
      div.tutorial__ring(:class="{ 'is-bump': bump > 0 }" :key="'h' + bump" :style="{ left: hole.x + 'px', top: hole.y + 'px', width: hole.w + 'px', height: hole.h + 'px' }")

      //- The whole instruction. Rotated about its own tip, so one shape serves
      //- all four sides of the hole.
      div.tutorial__arrow(v-if="arrowStyle" aria-hidden="true" :class="{ 'is-bump': bump > 0 }" :key="'a' + bump" :style="arrowStyle")
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

// The card's window: the same gold, pulsing out of step with the column's, so
// the eye goes from one to the other rather than seeing two identical frames.
.tutorial__ring.is-passage
  border-width: 2px
  animation-delay: -0.75s

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

// The answer to a tap that landed on the dim: one hard pulse of the ring and
// one shove of the arrow along its own axis — after the parent's rotation, that
// is always "towards the thing it is pointing at".
.tutorial__ring.is-bump
  animation: tut-bump 0.4s ease-out

.tutorial__arrow.is-bump .tutorial__arrow-svg
  animation: tut-arrow-bump 0.4s ease-out

@keyframes tut-bump
  0%
    box-shadow: 0 0 0 3px rgba(255, 214, 80, 0.25), 0 0 22px rgba(255, 200, 60, 0.5)
  35%
    box-shadow: 0 0 0 10px rgba(255, 236, 150, 0.75), 0 0 44px rgba(255, 220, 90, 0.95)
  100%
    box-shadow: 0 0 0 3px rgba(255, 214, 80, 0.25), 0 0 22px rgba(255, 200, 60, 0.5)

@keyframes tut-arrow-bump
  0%
    transform: translateY(-10%)
  30%
    transform: translateY(-38%)
  65%
    transform: translateY(10%)
  100%
    transform: translateY(-10%)

@media (prefers-reduced-motion: reduce)
  .tutorial__arrow-svg
    animation: none
  .tutorial__ring
    animation: none
  // The miss answer stays — it is feedback, not decoration, and without it a
  // reduced-motion player gets the silent dead screen this exists to end. The
  // ring simply flashes in place instead of moving anything.
  .tutorial__ring.is-bump
    animation: tut-bump 0.4s ease-out
  .tutorial__arrow.is-bump .tutorial__arrow-svg
    animation: none

.tut-enter-active, .tut-leave-active
  transition: opacity 180ms ease-out

.tut-enter-from, .tut-leave-to
  opacity: 0
</style>

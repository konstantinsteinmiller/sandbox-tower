<script lang="ts">
/**
 * ─── Which primer shows, and when they all stop ─────────────────────────────
 *
 * A plain `<script>` block beside the `<script setup>` below, so this rule can
 * be imported and pinned by a test. That is not a stylistic preference: the
 * rule used to be a computed inside `GameScene`, which is unmountable in a
 * headless run and therefore untestable — the same shape of mistake, in the
 * same file, that `useTutorialClock` was extracted to undo after a coach mark
 * silently froze the build clock for an entire playtest.
 *
 * It lives HERE rather than in a new module because the `HintId` vocabulary is
 * already here: "which of these seven may show right now" is a statement about
 * this component's own union, and splitting the two apart would let a new
 * `HintId` be added without anybody having to answer when it retires.
 */

/** `dropBlock` and `mergeBlock` belong to the mobile-fit board; the rest are shared. */
export type HintId =
  | 'selectBlock' | 'placeBlock' | 'camera' | 'callWave' | 'inspect'
  | 'dropBlock' | 'mergeBlock'

/**
 * The wave whose arrival retires every primer, for good.
 *
 * Two, so the last primer a player can be shown is on wave 1 — `wave` holds
 * the wave in progress, so `wave === 2` is already the second fight.
 *
 * This is stated as its own clause rather than left to `ts_onboarded`, which
 * is what used to carry it. `onboarded` is a different fact about the save (it
 * also gates the second-wave build nudge), it is persisted, and it is written
 * by a watcher — three ways for "the primers have retired" to quietly stop
 * being true. A player who has been told how to play and is still being told
 * is the most irritating failure a tutorial has, and it should not depend on a
 * flag whose job is something else.
 */
export const CONTROL_HINT_RETIRE_WAVE = 2

/**
 * Everything the choice depends on.
 *
 * Flat and primitive on purpose: a test can state a board in one line, and
 * nothing here needs a canvas, a store or a mounted scene.
 */
export interface ControlHintState {
  /** Primers whose action the player has already performed, this session. */
  done: ReadonlySet<HintId>
  /** `ts_onboarded`: this player has finished a first session before. */
  onboarded: boolean
  /** The wave in progress. 0 is the opening build phase. */
  wave: number
  /** Something owns the screen — a result screen, a modal, a coach mark. */
  busy: boolean
  /** The run is over. */
  defeated: boolean
  /** A tray slot is armed, so the player is mid-placement. */
  armed: boolean
  /** The game is in a build phase. */
  building: boolean
  /** Blocks standing. The inspect primer needs something to point at. */
  blocks: number
}

/**
 * The one primer to show right now, or null.
 *
 * Ordered by "what does the player most need to know", and every entry retires
 * permanently the first time its action is performed — see `done`.
 */
/**
 * Is the player past being told how to play?
 *
 * "Wave 2 has been CLEARED", not "wave 2 has started" — which is a one-wave
 * difference and was, until now, a disagreement between this rule and the
 * comment above the flag that drove it ("After the second wave the player has
 * seen every primer that matters"). The code retired them a wave earlier than
 * the prose claimed.
 *
 * It matters because of what the primers cost to miss. `inspect` points at the
 * one screen where run gold is spent, and its whole life used to be wave 1's
 * battle — when the player is fighting, not inspecting — plus whatever build
 * window followed. With the window before wave 2 cut to 5 s, that is close to
 * never shown at all, which is how this primer got into the state of having
 * been translated into twenty-one languages and never once emitted.
 *
 * Giving it the far side of wave 2 costs a veteran nothing: every primer
 * retires the moment its own gesture is performed, and a player who has
 * finished a session before is answered by `onboarded` before this is reached.
 */
export const onboardingDone = (s: { wave: number; building: boolean }): boolean =>
  s.wave > CONTROL_HINT_RETIRE_WAVE
  || (s.wave === CONTROL_HINT_RETIRE_WAVE && s.building)

export const activeControlHint = (s: ControlHintState): HintId | null => {
  // Never nag a veteran, and never talk over a result screen, a modal, or the
  // coach marks — those are deliberately wordless, and a hint bubble is the one
  // thing on screen that would put copy back on them.
  if (s.onboarded || s.busy || s.defeated) return null
  // The hard stop. Whatever any individual primer believes about itself, the
  // player has now fought two waves and is done being told how.
  if (onboardingDone(s)) return null
  if (!s.done.has('selectBlock') && !s.armed) return 'selectBlock'
  if (!s.done.has('placeBlock') && s.armed) return 'placeBlock'
  if (!s.done.has('callWave') && s.building && s.wave === 0) return 'callWave'
  if (!s.done.has('camera') && s.wave >= 1) return 'camera'
  // The inspector is where run gold is spent — block upgrades, ranks, the
  // effective stats of a reinforced or roofed block. It opens on a long-press,
  // which nothing ever taught: this hint has been written and translated into
  // every locale since the inspector shipped and was never once emitted, so
  // in practice no player was told the upgrade button exists.
  if (!s.done.has('inspect') && s.wave >= 1 && s.blocks > 1) return 'inspect'
  return null
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { isMobilePortrait } from '@/use/useUser'
import { mobileCheck } from '@/utils/function'

/**
 * The on-screen control primer.
 *
 * A build-and-defend game has a non-obvious first action ("tap a block, THEN
 * tap the ground"), and a player who doesn't discover it in the first ten
 * seconds bounces. So the hint is explicit, phrased for the input device the
 * player actually has, and it retires itself the moment the action is performed
 * — nagging a competent player is its own kind of failure.
 *
 * WHICH primer shows is not decided here — see the plain `<script>` block above.
 */

interface Props {
  hint: HintId | null
}

const props = defineProps<Props>()
const { t } = useI18n()

const isTouch = computed(() => mobileCheck() || isMobilePortrait.value
  || (typeof window !== 'undefined' && navigator.maxTouchPoints > 0))

const text = computed(() => {
  if (!props.hint) return ''
  // Each hint has a touch and a pointer phrasing — "Tap" vs "Click", "Pinch"
  // vs "Scroll" — because a wrong verb reads as a bug.
  return t(`hints.${props.hint}.${isTouch.value ? 'touch' : 'desktop'}`)
})
</script>

<template lang="pug">
  Transition(name="hint")
    div.control-hint(v-if="hint")
      svg.control-hint__icon(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true")
        //- A pointing hand — universally readable as "do this".
        path(d="M9 11V6a2 2 0 1 1 4 0v5")
        path(d="M13 8a2 2 0 1 1 4 0v6a6 6 0 0 1-6 6h-1a5 5 0 0 1-4.3-2.4L4 15a1.6 1.6 0 0 1 2.6-1.9L8 15")
      span.control-hint__text {{ text }}
</template>

<style scoped lang="sass">
.control-hint
  display: inline-flex
  align-items: center
  gap: clamp(0.25rem, 1.4vw, 0.5rem)
  // Floors so the hint is always readable, and a max so it never spans a
  // desktop screen edge-to-edge.
  min-height: 1.75rem
  max-width: min(90vw, 26rem)
  padding: clamp(0.22rem, 1.2vw, 0.45rem) clamp(0.55rem, 3vw, 1rem)
  // A pool-blue plastic pill with a soft sunshine rim.
  border: 2px solid var(--ui-rim-soft)
  border-radius: 999px
  background-color: rgba(31, 90, 160, 0.82)
  box-shadow: 0 0 0 1.5px var(--ui-line)
  backdrop-filter: blur(3px)
  pointer-events: none
  animation: hint-breathe 2.4s ease-in-out infinite

.control-hint__icon
  flex: 0 0 auto
  width: clamp(0.85rem, 3.6vw, 1.1rem)
  height: clamp(0.85rem, 3.6vw, 1.1rem)
  color: #ffd93c

.control-hint__text
  color: #fff
  font-weight: 900
  text-align: center
  line-height: 1.2
  font-size: clamp(0.62rem, 2.9vw, 0.92rem)
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.85)

.hint-enter-active, .hint-leave-active
  transition: opacity 260ms ease-out, translate 260ms ease-out

.hint-enter-from, .hint-leave-to
  opacity: 0
  translate: 0 0.5rem

@keyframes hint-breathe
  0%, 100%
    opacity: 0.92
  50%
    opacity: 0.68
</style>

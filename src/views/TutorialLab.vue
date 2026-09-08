<script setup lang="ts">
import { ref } from 'vue'
import MergeGuide from '@/components/game/MergeGuide.vue'
import TrapTutorial from '@/components/game/TrapTutorial.vue'
import { getState, setState } from '@/use/useTowerState'
import { MERGE_GUIDE_KEY, TRAP_TUTORIAL_KEY, TUTORIAL_KEY } from '@/keys'

/**
 * ─── Tutorial lab ───────────────────────────────────────────────────────────
 *
 * Both teaching cards on one screen, on demand.
 *
 * They exist because each of them fires ONCE, on a moment that cannot be
 * re-entered: the merge ladder on the first fusion of a first run, the collapse
 * demo on the first death this save has ever had. Checking either one meant
 * wiping the save and replaying the opening — which is how a full-screen card
 * ships with its layout broken in landscape, or with a loop that never finishes
 * its last beat. Nobody looks at a once-ever screen twice unless looking is
 * cheap.
 *
 * It also holds the FLAGS, because "does it show up again" is half of what
 * there is to test about a once-ever screen, and reading that answer out of
 * devtools is worse than a row of three buttons.
 *
 * Dev only, and out of every portal build — see the router. A reviewer finding
 * an unreachable tooling screen in a shipped bundle is a question nobody needs
 * to answer.
 */

const merge = ref(false)
const trap = ref(false)

/**
 * Which board's merge ladder.
 *
 * The two are genuinely different pictures, not a style choice: the tower game
 * welds into a growing rectangle and the phone board collapses every weld back
 * into one cell. Both have to be checkable from here or the one nobody opens is
 * the one that ships wrong.
 */
const variant = ref<'footprint' | 'cell'>('footprint')

const flags = ref({
  tutorial: getState<boolean>(TUTORIAL_KEY, false) === true,
  merge: getState<boolean>(MERGE_GUIDE_KEY, false) === true,
  trap: getState<boolean>(TRAP_TUTORIAL_KEY, false) === true
})

const syncFlags = (): void => {
  flags.value = {
    tutorial: getState<boolean>(TUTORIAL_KEY, false) === true,
    merge: getState<boolean>(MERGE_GUIDE_KEY, false) === true,
    trap: getState<boolean>(TRAP_TUTORIAL_KEY, false) === true
  }
}

const clearFlags = (): void => {
  setState(TUTORIAL_KEY, false)
  setState(MERGE_GUIDE_KEY, false)
  setState(TRAP_TUTORIAL_KEY, false)
  syncFlags()
}

const setFlags = (): void => {
  setState(TUTORIAL_KEY, true)
  setState(MERGE_GUIDE_KEY, true)
  setState(TRAP_TUTORIAL_KEY, true)
  syncFlags()
}

/** The same viewports the cards have to survive, driven from here rather than
 *  from devtools so the two failing ones are one click apart. */
const FRAMES = [
  { id: 'free', w: 0, h: 0 },
  { id: '320x658 portrait', w: 320, h: 658 },
  { id: '412x915 portrait', w: 412, h: 915 },
  { id: '740x360 landscape', w: 740, h: 360 },
  { id: '1280x720 desktop', w: 1280, h: 720 }
] as const

const frame = ref<(typeof FRAMES)[number]>(FRAMES[0])
</script>

<template lang="pug">
  div.lab
    header.lab__bar
      h1.lab__title Tutorial lab

      div.lab__group
        button.lab__btn(type="button" @click="variant = 'footprint'; merge = true") Merge ladder · tower
        button.lab__btn(type="button" @click="variant = 'cell'; merge = true") Merge ladder · phone
        button.lab__btn(type="button" @click="trap = true") Collapse trap

      div.lab__group
        //- The cards are once-ever, so "will it come back" is half the test.
        span.lab__flag(:class="{ 'is-on': flags.tutorial }") coach marks
        span.lab__flag(:class="{ 'is-on': flags.merge }") merge
        span.lab__flag(:class="{ 'is-on': flags.trap }") trap
        button.lab__btn(type="button" @click="clearFlags") forget all
        button.lab__btn(type="button" @click="setFlags") mark seen

      div.lab__group
        button.lab__btn(
          v-for="f in FRAMES"
          :key="f.id"
          type="button"
          :class="{ 'is-active': frame.id === f.id }"
          @click="frame = f"
        ) {{ f.id }}

    //- The cards are `position: fixed`, so a frame has to be a real containing
    //- block or they would ignore it and fill the window. `transform` on the
    //- wrapper is what makes one, which is the whole reason this is not a plain
    //- sized div.
    div.lab__stage(
      :class="{ 'is-framed': frame.w > 0 }"
      :style="frame.w > 0 ? { width: frame.w + 'px', height: frame.h + 'px' } : undefined"
    )
      div.lab__hint(v-if="!merge && !trap") Pick a card above. Click it to dismiss, the way a player does.
      MergeGuide(v-model="merge" :variant="variant" @continue="merge = false")
      TrapTutorial(v-model="trap" @continue="trap = false")
</template>

<style scoped lang="sass">
.lab
  min-height: 100vh
  background-color: #10141c
  color: #cbd5e1
  font: 13px system-ui, sans-serif

.lab__bar
  display: flex
  flex-wrap: wrap
  align-items: center
  gap: 0.75rem
  padding: 0.6rem 0.9rem
  border-bottom: 1px solid #26303f

.lab__title
  margin: 0
  font-size: 0.95rem
  font-weight: 800
  color: #e2e8f0

.lab__group
  display: flex
  align-items: center
  gap: 0.35rem

.lab__btn
  padding: 0.3rem 0.6rem
  border: 1px solid #33415a
  border-radius: 0.35rem
  background-color: #1b2331
  color: #cbd5e1
  cursor: pointer

  &:hover
    background-color: #243044

  &.is-active
    border-color: #7dd3fc
    color: #7dd3fc

.lab__flag
  padding: 0.2rem 0.45rem
  border-radius: 0.35rem
  background-color: #1b2331
  color: #64748b
  font-size: 0.72rem
  text-transform: uppercase
  letter-spacing: 0.04em

  &.is-on
    background-color: #14532d
    color: #86efac

.lab__stage
  position: relative
  // `transform` — not `position: relative` alone — is what makes this a
  // containing block for the cards' `position: fixed`. Without it a framed
  // viewport would be a box the cards paint straight out of.
  transform: translate(0)
  overflow: hidden
  margin: 1rem auto
  width: calc(100% - 2rem)
  height: calc(100vh - 8rem)
  border: 1px dashed #33415a
  border-radius: 0.5rem
  background-color: #0a1224

  &.is-framed
    resize: both

.lab__hint
  position: absolute
  inset: 0
  display: flex
  align-items: center
  justify-content: center
  padding: 1rem
  color: #475569
  text-align: center
</style>

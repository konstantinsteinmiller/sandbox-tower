<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CallWaveButton from '@/components/game/CallWaveButton.vue'
import IconGold from '@/components/icons/IconGold.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import FHudButton from '@/components/atoms/FHudButton.vue'
import TechTreeGlyph from '@/components/icons/TechTreeGlyph.vue'
import PointerArrow from '@/components/game/PointerArrow.vue'

/**
 * The bottom bar: menu, Blueprints, Repair all, and the wave control.
 *
 * Everything the player must reach mid-wave lives here, in the thumb's third
 * of the screen. Repair all only renders while it can do something — a button
 * that is always there and mostly disabled is a button the player learns to
 * ignore.
 *
 * Blueprints sits beside the menu rather than inside it. It used to be one of
 * the drawer's buttons, and the 2026-09-11 blind playtest found what that costs:
 * three of five phone testers found the tree only after their second defeat,
 * and finished holding hundreds of coins they never knew they could spend.
 */

interface Props {
  phase: 'build' | 'battle' | 'defeat'
  timeLeft: number
  bonusPct: number
  speed: number
  bossIncoming: boolean
  speedBuffLeft: number
  speeds: ReadonlyArray<number>
  /** Gold to repair everything; 0 when nothing is hurt. */
  repairCost: number
  canRepair: boolean
  warnings: Array<{ id: string; n: number; m?: number }>
  menuOpen: boolean
  /** Blueprint cards affordable right now — the Blueprints button's badge. */
  blueprintsAffordable?: number
  /** The stage-2 nudge (`techNudge`): gold aura, hop and the yellow arrow on
   *  the Blueprints button until the tree is first opened. */
  blueprintsAttention?: boolean
}

withDefaults(defineProps<Props>(), {
  blueprintsAffordable: 0,
  blueprintsAttention: false
})

const emit = defineEmits<{
  (e: 'call'): void
  (e: 'set-speed', n: number): void
  (e: 'buy-speed', n: number): void
  (e: 'repair-all'): void
  (e: 'menu'): void
  (e: 'blueprints'): void
}>()

const { t } = useI18n()
</script>

<template lang="pug">
  div.bar
    div.bar__left
      button.bar__menu(
        type="button"
        :class="{ 'is-open': menuOpen }"
        :aria-label="t('mobile.menu')"
        @click="emit('menu')"
      )
        svg(viewBox="0 0 24 24" fill="currentColor")
          circle(cx="5" cy="12" r="2.2")
          circle(cx="12" cy="12" r="2.2")
          circle(cx="19" cy="12" r="2.2")

      //- The same chip, glyph and badge as the desktop's tech button, so the
      //- tree is one recognisable thing on both boards (and on the defeat
      //- screen, which borrows the glyph).
      span.bar__blueprints
        PointerArrow(v-if="blueprintsAttention" side="top" :length="2.3")
        FHudButton(
          tone="green"
          :attention="blueprintsAttention"
          :bounce="blueprintsAttention"
          :aria-label="t('tech.blueprints.title')"
          @click="emit('blueprints')"
        )
          TechTreeGlyph(:active="blueprintsAttention || blueprintsAffordable > 0")
          template(#badge)
            span.bar__badge(v-if="blueprintsAffordable > 0") {{ blueprintsAffordable }}

    button.bar__repair(
      v-if="phase === 'build' && repairCost > 0"
      type="button"
      :disabled="!canRepair"
      @click="emit('repair-all')"
    )
      GameIcon.bar__repair-icon(name="repair")
      span.bar__repair-label {{ t('mobile.repairAll') }}
      span.bar__repair-cost
        IconGold.bar__gold
        | {{ repairCost }}

    div.bar__right
      div.bar__warnings(v-if="warnings.length > 0")
        span.bar__warning(v-for="w in warnings" :key="w.id" :class="`is-${w.id}`")
          | {{ t(`warnings.${w.id}`, { n: w.n, m: w.m ?? 0 }) }}
      CallWaveButton(
        :phase="phase"
        :time-left="timeLeft"
        :bonus-pct="bonusPct"
        :speed="speed"
        :boss-incoming="bossIncoming"
        :speed-buff-left="speedBuffLeft"
        :speeds="speeds"
        @call="emit('call')"
        @set-speed="emit('set-speed', $event)"
        @buy-speed="emit('buy-speed', $event)"
      )
</template>

<style scoped lang="sass">
.bar
  display: flex
  align-items: flex-end
  justify-content: space-between
  gap: 0.4rem
  padding: 0.25rem 0.5rem calc(0.3rem + env(safe-area-inset-bottom, 0px))
  pointer-events: auto

.bar__menu
  display: flex
  align-items: center
  justify-content: center
  width: 2.75rem
  height: 2.75rem
  border: 2px solid var(--ui-line)
  border-radius: 0.6rem
  background-image: linear-gradient(to bottom, var(--btn-plain-from), var(--btn-plain-to))
  box-shadow: inset 0 2px 0 var(--ui-gloss), 0 3px 0 var(--btn-plain-drop)
  color: #fff
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent

  svg
    width: 1.4rem
    height: 1.4rem

  &.is-open
    border-color: var(--ui-rim)

.bar__left
  display: flex
  align-items: flex-end
  gap: 0.4rem

// A positioned box for the arrow to hang off. The chip itself hops while the
// nudge is up, and an arrow parented to it would hop with it and bob on top of
// that — pointing at a moving target from a moving arrow.
.bar__blueprints
  position: relative
  display: inline-flex

  // One size with the menu button beside it, rather than the chip's fluid
  // clamp: two neighbours of different heights read as a misaligned row.
  :deep(.f-hud-button)
    width: 2.75rem
    height: 2.75rem

.bar__badge
  display: inline-flex
  align-items: center
  justify-content: center
  min-width: 1.1rem
  height: 1.1rem
  padding: 0 0.25em
  border-radius: 999px
  background-color: var(--btn-red-to)
  color: #fff
  font-size: 0.6rem
  font-weight: 900

.bar__repair
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 0.05rem
  min-width: 3.6rem
  height: 2.75rem
  padding: 0 0.5rem
  border: 2px solid var(--ui-line)
  border-radius: 0.6rem
  background-image: linear-gradient(to bottom, var(--btn-green-from), var(--btn-green-to))
  box-shadow: inset 0 2px 0 var(--ui-gloss), 0 3px 0 var(--btn-green-drop)
  color: #fff
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent

  &:disabled
    filter: grayscale(0.6) brightness(0.7)
    cursor: not-allowed

// Nested one level deeper than it needs to be, on purpose.
//
// `GameIcon`'s own scoped rule sizes `.game-icon` to fill its box, which is
// the same specificity as a bare `.bar__repair-icon` — so which of the two
// sizes the glyph would come down to the order Vite happened to emit the two
// stylesheets in. A glyph that fills its flex parent instead of measuring a
// rem is not a subtle bug, and it is not one a unit test would ever catch;
// the extra selector makes the answer independent of build order.
.bar__repair .bar__repair-icon
  width: 1rem
  height: 1rem

.bar__repair-label
  font-size: 0.55rem
  font-weight: 900
  text-transform: uppercase
  line-height: 1

.bar__repair-cost
  display: inline-flex
  align-items: center
  gap: 0.15rem
  font-size: 0.7rem
  font-weight: 900
  color: #ffd93c
  text-shadow: 1px 1px 0 #000

.bar__gold
  width: 0.8rem
  height: 0.8rem

.bar__right
  display: flex
  flex-direction: column
  align-items: flex-end
  gap: 0.2rem

.bar__warnings
  display: flex
  flex-wrap: wrap
  justify-content: flex-end
  gap: 0.2rem

.bar__warning
  padding: 0.1rem 0.4rem
  border: 1px solid var(--ui-line)
  border-radius: 999px
  background-color: var(--ui-panel)
  color: #fff
  font-size: 0.55rem
  font-weight: 900
  text-transform: uppercase
  white-space: nowrap

  &.is-air
    background-color: #7a5cc8
  &.is-bombers
    background-color: #e0662a
  &.is-hoard
    background-color: #d99a1e
</style>

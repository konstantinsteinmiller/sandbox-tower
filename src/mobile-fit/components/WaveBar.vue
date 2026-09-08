<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CallWaveButton from '@/components/game/CallWaveButton.vue'
import IconGold from '@/components/icons/IconGold.vue'
import GameIcon from '@/components/icons/GameIcon.vue'

/**
 * The bottom bar: menu, Repair all, and the wave control.
 *
 * Everything the player must reach mid-wave lives here, in the thumb's third
 * of the screen. Repair all only renders while it can do something — a button
 * that is always there and mostly disabled is a button the player learns to
 * ignore.
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
  /** Pull the eye to the menu, because the tech tree is behind it and the
   *  player has not found it yet. Drops the moment the drawer is opened —
   *  holding it while the drawer is up would be shouting at a door that is
   *  already open. */
  menuAttention?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'call'): void
  (e: 'set-speed', n: number): void
  (e: 'buy-speed', n: number): void
  (e: 'repair-all'): void
  (e: 'menu'): void
}>()

const { t } = useI18n()
</script>

<template lang="pug">
  div.bar
    button.bar__menu(
      type="button"
      :class="{ 'is-open': menuOpen, 'is-attention': menuAttention && !menuOpen }"
      :aria-label="t('mobile.menu')"
      @click="emit('menu')"
    )
      svg(viewBox="0 0 24 24" fill="currentColor")
        circle(cx="5" cy="12" r="2.2")
        circle(cx="12" cy="12" r="2.2")
        circle(cx="19" cy="12" r="2.2")

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
  border: 2px solid #0f1a30
  border-radius: 0.6rem
  background-image: linear-gradient(to bottom, #4a5a7d, #2b3654)
  color: #cfe4ff
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent

  svg
    width: 1.4rem
    height: 1.4rem

  &.is-open
    border-color: #7fe0ff

  // The tech tree lives behind this button, so on the phone the nudge has to
  // start here — a glow on a screen the player cannot see is no nudge at all.
  // Same gold aura and same double-hop as the tech button itself
  // (`FHudButton.is-bounce`), so the two read as one trail rather than two
  // unrelated blinking things.
  &.is-attention
    border-color: #ffcd00
    animation: bar-menu-pulse 1.6s ease-in-out infinite, bar-menu-bounce 2.4s ease-in-out infinite

@keyframes bar-menu-pulse
  0%, 100%
    filter: drop-shadow(0 0 0 rgba(255, 200, 0, 0))
  50%
    filter: drop-shadow(0 0 8px rgba(255, 200, 0, 0.75))

@keyframes bar-menu-bounce
  0%, 34%, 100%
    transform: translateY(0)
  8%
    transform: translateY(-22%)
  17%
    transform: translateY(0)
  25%
    transform: translateY(-11%)

@media (prefers-reduced-motion: reduce)
  .bar__menu.is-attention
    animation: bar-menu-pulse 1.6s ease-in-out infinite

.bar__repair
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 0.05rem
  min-width: 3.6rem
  height: 2.75rem
  padding: 0 0.5rem
  border: 2px solid #0f1a30
  border-radius: 0.6rem
  background-image: linear-gradient(to bottom, #57a37c, #2f6f4e)
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
  border: 1px solid rgba(0, 0, 0, 0.6)
  border-radius: 999px
  background-color: #2b3654
  color: #fff
  font-size: 0.55rem
  font-weight: 900
  text-transform: uppercase
  white-space: nowrap

  &.is-air
    background-color: #5a3f8a
  &.is-bombers
    background-color: #a3441e
  &.is-hoard
    background-color: #a8781e
</style>

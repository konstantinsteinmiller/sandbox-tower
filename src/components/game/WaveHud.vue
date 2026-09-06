<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { registerChordTap } from '@/use/useVConsole'
import BlockTile from '@/components/game/BlockTile.vue'
import { GATE_ID } from '@/game/blocks'

/**
 * Backing size for the Gate thumbnail, CSS px.
 *
 * Drawn far larger than it is shown and scaled down: the chip is about 15 px
 * across, and a canvas sized to that has no detail left to lose once the device
 * pixel ratio is anything other than 1.
 */
const GATE_ICON_PX = 48

/**
 * Top-left status ribbon: current wave, enemies remaining, and the Gate's
 * health.
 *
 * The gate bar is the single most important number on screen — it is the lose
 * condition — so it gets its own row and turns red + pulses below 35 %, which
 * is the cue to stop expanding and start reinforcing.
 */

interface Props {
  wave: number
  enemiesLeft: number
  enemiesTotal: number
  gateHpPct: number
  phase: 'build' | 'battle' | 'defeat'
  bestWave: number
}

const props = defineProps<Props>()
const { t } = useI18n()

/** Fraction of the wave still to fight — the bar drains as you clear it. */
const waveProgress = computed(() => {
  if (props.enemiesTotal <= 0) return 0
  return Math.max(0, Math.min(1, props.enemiesLeft / props.enemiesTotal))
})

const gateCritical = computed(() => props.gateHpPct <= 0.35)
const isRecord = computed(() => props.wave > props.bestWave && props.wave > 0)
</script>

<template lang="pug">
  //- `pointer-events-auto` re-enables taps because the HUD container is
  //- pointer-events-none; the taps feed the vConsole debug chord.
  div.wave-hud(
    @pointerdown="registerChordTap"
    @click="registerChordTap"
  )
    span.wave-hud__shadow(aria-hidden="true")
    div.wave-hud__body
      div.wave-hud__row
        span.wave-hud__label {{ t('hud.wave') }}
        span.wave-hud__value(:class="{ 'is-record': isRecord }") {{ wave }}
        span.wave-hud__sep(v-if="phase === 'battle'") ·
        template(v-if="phase === 'battle'")
          span.wave-hud__label {{ t('hud.enemies') }}
          span.wave-hud__value {{ enemiesLeft }}

      //- Remaining-enemies bar (battle only).
      div.wave-hud__bar(v-if="phase === 'battle'")
        div.wave-hud__bar-fill(
          class="is-enemies"
          :style="{ width: waveProgress * 100 + '%' }"
        )

      //- Gate integrity — always visible; this is the lose condition.
      div.wave-hud__gate
        //- The Gate itself, in miniature — the same thumbnail the tray and the
        //- inspector use, so it picks up the painted block when art is on and
        //- falls back to the procedural one otherwise. It replaced a hand-drawn
        //- arch glyph that no longer looked like the thing it stands for.
        //-
        //- No pictogram: the body is a stone arch with a door in it, which is
        //- already the whole message, and at this size the glyph's backing disc
        //- would cover it.
        span.wave-hud__gate-icon
          BlockTile(:type-id="GATE_ID" :size="GATE_ICON_PX" :glyph="false")
        div.wave-hud__bar
          div.wave-hud__bar-fill(
            :class="gateCritical ? 'is-gate-critical' : 'is-gate'"
            :style="{ width: Math.max(0, gateHpPct) * 100 + '%' }"
          )
</template>

<style scoped lang="sass">
.wave-hud
  position: relative
  pointer-events: auto
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  // Fluid, with a floor so the chip is always legible and never collapses.
  min-width: clamp(7rem, 34vw, 12rem)
  max-width: 46vw

.wave-hud__shadow
  position: absolute
  inset: 0
  transform: translateY(3px)
  border-radius: clamp(0.5rem, 2.4vw, 0.9rem)
  background-color: #0d1830

.wave-hud__body
  position: relative
  display: flex
  flex-direction: column
  gap: clamp(0.15rem, 0.8vw, 0.3rem)
  padding: clamp(0.25rem, 1.4vw, 0.5rem) clamp(0.45rem, 2.4vw, 0.85rem)
  border: 2px solid #0f1a30
  border-radius: clamp(0.5rem, 2.4vw, 0.9rem)
  background-image: linear-gradient(to bottom, rgba(38, 56, 96, 0.94), rgba(20, 32, 60, 0.94))

.wave-hud__row
  display: flex
  align-items: baseline
  gap: clamp(0.2rem, 1.2vw, 0.45rem)
  white-space: nowrap

.wave-hud__label
  color: #9fb6de
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.06em
  font-size: clamp(0.5rem, 2.2vw, 0.72rem)

.wave-hud__value
  color: #fff
  font-weight: 900
  line-height: 1
  font-size: clamp(0.85rem, 4vw, 1.35rem)
  text-shadow: 2px 2px 0 #000

  // A personal best in progress is worth shouting about — it is the single
  // strongest "one more run" hook this game has.
  &.is-record
    color: #ffd93c
    animation: hud-record 1.4s ease-in-out infinite

.wave-hud__sep
  color: #5b7096

.wave-hud__bar
  position: relative
  flex: 1
  height: clamp(0.28rem, 1.2vw, 0.45rem)
  border-radius: 999px
  background-color: rgba(0, 0, 0, 0.5)
  overflow: hidden

.wave-hud__bar-fill
  height: 100%
  border-radius: 999px
  transition: width 220ms ease-out

  &.is-enemies
    background-image: linear-gradient(to right, #ff8a5a, #e5342a)

  &.is-gate
    background-image: linear-gradient(to right, #7ce0a0, #34a853)

  &.is-gate-critical
    background-image: linear-gradient(to right, #ff8080, #d32222)
    animation: hud-critical 0.8s ease-in-out infinite

.wave-hud__gate
  display: flex
  align-items: center
  gap: clamp(0.2rem, 1.2vw, 0.4rem)

// A shade larger than the glyph it replaced: a flat gold silhouette reads at
// 15 px, a painted block needs a little more room to be recognisable.
.wave-hud__gate-icon
  flex: 0 0 auto
  display: block
  width: clamp(0.85rem, 3.6vw, 1.15rem)
  height: clamp(0.85rem, 3.6vw, 1.15rem)

// `!important` is what it takes to beat BlockTile's own inline width/height,
// which is sized for the backing canvas rather than the box it is shown in.
.wave-hud__gate-icon :deep(canvas)
  width: 100% !important
  height: 100% !important

@keyframes hud-critical
  0%, 100%
    opacity: 1
  50%
    opacity: 0.55

@keyframes hud-record
  0%, 100%
    text-shadow: 2px 2px 0 #000
  50%
    text-shadow: 2px 2px 0 #000, 0 0 10px rgba(255, 217, 60, 0.9)
</style>

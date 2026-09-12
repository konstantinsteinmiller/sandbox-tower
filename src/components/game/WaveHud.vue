<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { registerChordTap } from '@/use/useVConsole'
import BlockTile from '@/components/game/BlockTile.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
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

/**
 * ─── A health bar, not a progress bar ───────────────────────────────────────
 *
 * The heart alone did not settle it: the bar under "Wave" was still a green
 * pill, the shape every loading and progress bar on the web has. So it is now
 * the object every action game draws for a life — a framed, square-ended red
 * bar on a dark track, notched at the quarters, with the chunk a hit takes out
 * left behind in pale gold for a beat before it drains ("damage trail"). A
 * progress bar has none of those; nobody reads this one as wave progress.
 */
const HP_TICKS = [0.25, 0.5, 0.75] as const
const TRAIL_HOLD_MS = 380

const hpPct = computed(() => Math.max(0, Math.min(1, props.gateHpPct)))
const trailPct = ref(hpPct.value)
const trailDraining = ref(false)
let trailTimer: ReturnType<typeof setTimeout> | null = null

watch(hpPct, (next) => {
  // Healed, repaired or a new run: the trail follows at once.
  if (next >= trailPct.value) {
    if (trailTimer) { clearTimeout(trailTimer); trailTimer = null }
    trailDraining.value = false
    trailPct.value = next
    return
  }
  // A loss: hold the old width, then drain to wherever the bar is by then. Not
  // re-armed per hit, so a sustained siege drains in steps instead of never.
  if (trailTimer) return
  trailTimer = setTimeout(() => {
    trailTimer = null
    trailDraining.value = true
    trailPct.value = hpPct.value
  }, TRAIL_HOLD_MS)
})

/**
 * ─── "This bar is the Gate's life" ──────────────────────────────────────────
 *
 * The 2026-09-11 blind playtest: a tester read this bar as WAVE PROGRESS for an
 * entire run, and another never worked out what it tracked. It sits under the
 * word "Wave" and it is the only bar there in the build phase, so that reading
 * was the natural one — the tiny Gate thumbnail at its head did not overturn
 * it.
 *
 * Two marks now say "health" without a word. A heart on the Gate thumbnail,
 * the mark every game uses for a life, and the same heart the first-run banner
 * pins on the Gate. And the bar answers the hit: when the Gate loses health the
 * heart thumps and the bar flashes, so the cause (something struck the Gate)
 * and the number it moved are seen together.
 *
 * Throttled: a Gate under a sustained siege drops a little every few frames,
 * and a flash per drop would strobe.
 */
const HIT_FLASH_MS = 450
const HIT_GAP_MS = 700

const gateHit = ref(false)
let hitTimer: ReturnType<typeof setTimeout> | null = null
let lastHitAt = -Infinity

watch(() => props.gateHpPct, (next, prev) => {
  if (!(next < prev) || props.phase !== 'battle') return
  const now = performance.now()
  if (now - lastHitAt < HIT_GAP_MS) return
  lastHitAt = now
  gateHit.value = true
  if (hitTimer) clearTimeout(hitTimer)
  hitTimer = setTimeout(() => { gateHit.value = false; hitTimer = null }, HIT_FLASH_MS)
})

onUnmounted(() => {
  if (hitTimer) clearTimeout(hitTimer)
  if (trailTimer) clearTimeout(trailTimer)
})
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
      div.wave-hud__gate(:class="{ 'is-hit': gateHit }")
        //- The Gate itself, in miniature — the same thumbnail the tray and the
        //- inspector use, so it picks up the painted block when art is on and
        //- falls back to the procedural one otherwise. It replaced a hand-drawn
        //- arch glyph that no longer looked like the thing it stands for.
        //-
        //- No block pictogram: the body is a stone arch with a door in it, which
        //- is already the whole message, and at this size the glyph's backing
        //- disc would cover it. The heart on its corner is what says "life".
        span.wave-hud__gate-icon
          BlockTile(:type-id="GATE_ID" :size="GATE_ICON_PX" :glyph="false")
          span.wave-hud__heart(aria-hidden="true")
            GameIcon(name="heart")
        div.hp(
          role="meter"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="Math.round(hpPct * 100)"
          :aria-label="t('blocks.names.gate')"
          :class="{ 'is-critical': gateCritical }"
        )
          div.hp__trail(:class="{ 'is-draining': trailDraining }" :style="{ width: trailPct * 100 + '%' }")
          div.hp__fill(:style="{ width: hpPct * 100 + '%' }")
          span.hp__tick(
            v-for="q in HP_TICKS"
            :key="q"
            :class="{ 'is-half': q === 0.5 }"
            :style="{ left: q * 100 + '%' }"
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

.wave-hud__gate-icon
  position: relative

// The Gate's life: a red heart hanging off the thumbnail's corner. Outlined in
// the HUD's own navy so it holds its shape over the painted stone.
.wave-hud__heart
  position: absolute
  right: -38%
  bottom: -30%
  width: 72%
  height: 72%
  color: #ff4d5e
  filter: drop-shadow(0 0 1px #0d1830) drop-shadow(0 1px 0 #0d1830)
  pointer-events: none

  :deep(svg)
    display: block
    width: 100%
    height: 100%

// ── The Gate's health bar ──
//
// Square-ended, framed twice (the HUD's navy, then a pale rim), a dark red
// track, a glossy red fill with a highlight band, and notches at the quarters —
// the half mark heavier. Twice the enemies bar's height: it is the one number
// that ends the run.
.hp
  position: relative
  flex: 1
  height: clamp(0.55rem, 2.1vw, 0.8rem)
  margin-left: clamp(0.2rem, 1vw, 0.35rem)
  border-radius: 3px
  background-image: linear-gradient(to bottom, #1b0505, #3d0c0c)
  box-shadow: 0 0 0 1.5px #0d1830, 0 0 0 2.5px rgba(255, 220, 196, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.75)
  overflow: hidden

// What the last hit took, in pale gold, before it drains.
.hp__trail
  position: absolute
  top: 0
  bottom: 0
  left: 0
  background-color: #ffe39a

  &.is-draining
    transition: width 520ms ease-in

.hp__fill
  position: absolute
  top: 0
  bottom: 0
  left: 0
  background-image: linear-gradient(to bottom, #ff9090 0%, #f23b3b 36%, #c51717 70%, #8d0b0b 100%)
  box-shadow: 1px 0 0 rgba(40, 0, 0, 0.6)
  transition: width 140ms ease-out

  // The gloss that makes it read as a bar of liquid life, not a flat fill.
  &::after
    content: ''
    position: absolute
    top: 1px
    left: 2px
    right: 2px
    height: 32%
    border-radius: 2px
    background-color: rgba(255, 255, 255, 0.34)

.hp__tick
  position: absolute
  top: 0
  bottom: 0
  width: 1.5px
  transform: translateX(-50%)
  background-color: rgba(18, 3, 3, 0.75)
  box-shadow: 1px 0 0 rgba(255, 255, 255, 0.16)
  pointer-events: none

  &.is-half
    width: 2.5px

// Below 35 %: the fill throbs brighter — the cue to stop building out and
// start reinforcing.
.hp.is-critical .hp__fill
  animation: hp-critical 0.7s ease-in-out infinite

@keyframes hp-critical
  0%, 100%
    filter: none
  50%
    filter: brightness(1.5)

// Struck: the heart thumps and the bar flashes white for a beat.
.wave-hud__gate.is-hit
  .wave-hud__heart
    animation: hud-heart-thump 450ms ease-out

  .hp__fill
    animation: hud-gate-flash 450ms ease-out

@keyframes hud-heart-thump
  0%
    transform: scale(1)
  30%
    transform: scale(1.45)
  100%
    transform: scale(1)

@keyframes hud-gate-flash
  0%
    filter: brightness(2.2) saturate(0.4)
  100%
    filter: none

// The flash says "hit" through colour alone; the thump and the trail's drain
// are motion, so they go.
@media (prefers-reduced-motion: reduce)
  .wave-hud__gate.is-hit .wave-hud__heart
    animation: none

  .hp__trail.is-draining
    transition: none

@keyframes hud-record
  0%, 100%
    text-shadow: 2px 2px 0 #000
  50%
    text-shadow: 2px 2px 0 #000, 0 0 10px rgba(255, 217, 60, 0.9)
</style>

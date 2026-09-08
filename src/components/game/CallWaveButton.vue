<script setup lang="ts">
import { computed } from 'vue'
import { GAME_SPEEDS, needsSpeedBuff } from '@/use/useTowerGame'
import { useI18n } from 'vue-i18n'
import { prependBaseUrl } from '@/utils/function'
import {
  isRewardGated, canOfferReward, adInFlight, REWARD_COIN_COST
} from '@/use/useAdGate'
import { coins as walletCoins } from '@/use/useTowerEconomy'
import IconCoin from '@/components/icons/IconCoin.vue'

/**
 * The Call Wave button (reference image 1).
 *
 * During BUILD it shows the countdown to the automatic start and the bonus the
 * player would bank by calling now — turning "wait or go?" into a legible,
 * priced decision rather than a blind gamble.
 *
 * During BATTLE it becomes the fast-forward switch, so the corner never holds a
 * dead control.
 */

interface Props {
  phase: 'build' | 'battle' | 'defeat'
  /** Milliseconds left in the build phase. */
  timeLeft: number
  /** Early-call coin bonus as a percentage (0 = none). */
  bonusPct: number
  speed: number
  bossIncoming: boolean
  /** Milliseconds of fast-forward left. 0 = not bought. */
  speedBuffLeft?: number
  /** The rungs on offer, slowest first. A mode with no 3× simply omits it. */
  speeds?: ReadonlyArray<number>
  /**
   * Bounce, because something is telling the player to press this.
   *
   * The first-run coach mark's last beat: the rest of the screen is dimmed and
   * an arrow points here, and the button moving is what makes it read as the
   * live thing rather than another piece of dimmed HUD.
   */
  attention?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  speedBuffLeft: 0,
  speeds: () => GAME_SPEEDS,
  attention: false
})
const emit = defineEmits<{
  (e: 'call'): void
  /** Move to an already-unlocked rung. */
  (e: 'set-speed', n: number): void
  /** Buy fast-forward, landing on this rung. */
  (e: 'buy-speed', n: number): void
}>()

const { t } = useI18n()

const clock = computed(() => {
  const total = Math.max(0, Math.ceil(props.timeLeft / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

/** The last 10 seconds get an urgency pulse so the auto-start is never a
 *  surprise mid-placement. */
const urgent = computed(() => props.phase === 'build' && props.timeLeft <= 10_000)

// ─── Fast-forward switch ────────────────────────────────────────────────────
//
// A segmented 1× / 1.5× / 3× switch, not a button that changes meaning.
//
// The old control was two different buttons wearing the same slot: an OFFER
// while unpaid, and a 1×/2× toggle once paid. That made the corner unreadable
// at a glance — the same place said "buy" one moment and "you are at 2×" the
// next — and it topped out at 2×, which is not enough for the case the control
// exists for. A tower that died at wave 20 has to replay twenty solved waves.
//
// A switch fixes both. Every rung is visible and labelled at all times, so the
// player can see where they are AND where they could be, and the paid rung
// costs nothing extra beyond the one purchase: how fast is a preference, not a
// second transaction.
//
// The badge rides on the rungs it ACTUALLY gates, and `needsSpeedBuff` is the
// one place that decides which those are — the test used to be `n > 1` here,
// in the aria-label, in the lock and in the tap handler, which is four copies
// of a rule that has since changed. It must never be an invisible cost (a
// control that silently opens a video on tap is the single most complained-
// about pattern in portal QA) and it must never be a visible cost that is not
// real: 1.5× is free, so a film badge on it would be a lie that costs a tap to
// discover.
const movieSrc = prependBaseUrl('images/icons/movie_128x96.webp')

/** True once fast-forward is paid for, whatever rung is selected. */
const buffOwned = computed(() => props.speedBuffLeft > 0)

/** Show the film badge only where tapping really will play a video. */
const showMovie = computed(() => isRewardGated && !buffOwned.value)

/**
 * Where no video plays, the buff is priced in wallet coins like every other
 * perk — so the badge becomes a coin rather than disappearing and leaving an
 * unlimited free button.
 */
const showPrice = computed(() => !isRewardGated && !buffOwned.value)
const tooPoor = computed(() => showPrice.value && walletCoins.value < REWARD_COIN_COST)

/** A gated build with no ad ready — or an empty wallet — cannot honour it. */
const offerDisabled = computed(
  () => adInFlight.value || tooPoor.value || !canOfferReward.value
)

/**
 * A rung is locked when it needs paying for and the purchase cannot be made
 * right now. The free rungs are never locked: the player must always be able to
 * slow down, and must never be blocked from the nudge they are not paying for.
 */
const isLocked = (n: number): boolean =>
  needsSpeedBuff(n) && !buffOwned.value && offerDisabled.value

const onSpeed = (n: number): void => {
  if (n === props.speed) return
  // Already paid for, or free: just move.
  if (!needsSpeedBuff(n) || buffOwned.value) { emit('set-speed', n); return }
  if (offerDisabled.value) return
  // Unpaid: the tap is a purchase, and it carries the rung that was asked for
  // so the video lands the player where they pressed.
  emit('buy-speed', n)
}

</script>

<template lang="pug">
  div.call-wave
    //- BUILD: call the wave early for a bonus.
    button.call-wave__btn(
      v-if="phase === 'build'"
      type="button"
      :class="{ 'is-urgent': urgent, 'is-boss': bossIncoming, 'is-attention': attention }"
      @click="emit('call')"
    )
      span.call-wave__shadow(aria-hidden="true")
      span.call-wave__body
        span.call-wave__label {{ bossIncoming ? t('hud.callBoss') : t('hud.callWave') }}
        span.call-wave__meta
          span.call-wave__clock {{ clock }}
          span.call-wave__bonus(v-if="bonusPct > 0")
            | +{{ bonusPct }}%
            IconCoin.call-wave__bonus-icon

    //- BATTLE: the fast-forward switch. Every rung visible and labelled, with
    //- the video badge on the ones that still have to be paid for.
    div.speed-switch(v-else-if="phase === 'battle'" role="group" :aria-label="t('hud.speedGroup')")
      span.speed-switch__shadow(aria-hidden="true")
      div.speed-switch__body
        button.speed-switch__seg(
          v-for="n in speeds"
          :key="n"
          type="button"
          :class="{ 'is-active': speed === n, 'is-locked': isLocked(n) }"
          :aria-pressed="speed === n"
          :aria-label="needsSpeedBuff(n) && !buffOwned ? t('hud.speedOffer', { n }) : t('hud.speed', { n })"
          @click="onSpeed(n)"
        )
          span.speed-switch__x {{ n }}×
          //- Only on the rungs it gates, and only until they are paid for.
          img.speed-switch__movie(
            v-if="needsSpeedBuff(n) && showMovie"
            :src="movieSrc"
            alt=""
            draggable="false"
          )
          IconCoin.speed-switch__coin(v-else-if="needsSpeedBuff(n) && showPrice")

</template>

<style scoped lang="sass">
.call-wave
  pointer-events: auto

.call-wave__btn
  position: relative
  display: inline-flex
  // Floors so the primary action of the build phase can never be crushed.
  min-width: 5.5rem
  min-height: 2.75rem
  padding: 0
  border: 0
  background: none
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: transform 90ms ease-out, filter 90ms ease-out

  &:hover
    filter: brightness(1.08)

  &:active
    transform: translateY(2px) scale(0.96)

.call-wave__shadow
  position: absolute
  inset: 0
  transform: translateY(4px)
  border-radius: clamp(0.5rem, 2.4vw, 0.9rem)
  background-color: #102e7a

.call-wave__body
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 0.1rem
  width: 100%
  padding: clamp(0.28rem, 1.5vw, 0.5rem) clamp(0.6rem, 3.2vw, 1.15rem)
  border: 2px solid #0f1a30
  border-radius: clamp(0.5rem, 2.4vw, 0.9rem)
  background-image: linear-gradient(to bottom, #6ab4ff, #2266ff)

.call-wave__label
  color: #fff
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.05em
  line-height: 1.05
  white-space: nowrap
  font-size: clamp(0.7rem, 3.2vw, 1.05rem)
  text-shadow: 2px 2px 0 #000

.call-wave__meta
  display: flex
  align-items: center
  gap: 0.35em

.call-wave__clock
  color: #cfe4ff
  font-weight: 900
  font-variant-numeric: tabular-nums
  font-size: clamp(0.55rem, 2.4vw, 0.75rem)
  text-shadow: 1px 1px 0 #000

.call-wave__bonus
  // White on a deeper green: the dark-on-light version was the odd one out in a
  // HUD where every other number is white with a hard shadow, and it was the
  // first thing to become unreadable at a small size.
  //
  // The coin trails the number for the same reason it does on the speed offer:
  // "+15%" alone does not say WHAT is 15 % better, and the bonus is paid in the
  // one currency the HUD already draws in the badge above it.
  display: inline-flex
  align-items: center
  gap: 0.2em
  color: #fff
  background-color: #1f9d4d
  border: 1px solid rgba(8, 40, 20, 0.7)
  border-radius: 999px
  padding: 0 0.4em
  font-weight: 900
  font-size: clamp(0.5rem, 2.2vw, 0.68rem)
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.65)

.call-wave__bonus-icon
  width: 1.15em
  height: 1.15em
  flex-shrink: 0

// ─── Fast-forward switch ────────────────────────────────────────────────────
//
// One raised pill holding three segments, so it reads as a single control with
// a position rather than as three buttons that happen to be adjacent. The
// selected rung is gold — the HUD's "this is live" colour — and the rest sit
// dark, which is what makes the current speed readable in peripheral vision
// while the player is watching the battle rather than the button.

.speed-switch
  position: relative
  display: inline-flex
  pointer-events: auto

.speed-switch__shadow
  position: absolute
  inset: 0
  transform: translateY(4px)
  border-radius: 999px
  background-color: #1c2436

.speed-switch__body
  position: relative
  display: flex
  align-items: stretch
  gap: 2px
  padding: 3px
  border: 2px solid #0f1a30
  border-radius: 999px
  background-image: linear-gradient(to bottom, #46536f, #2a3348)

.speed-switch__seg
  display: inline-flex
  align-items: center
  justify-content: center
  gap: 0.22em
  // Tap-target floor. Three segments in one pill is the tightest row in the
  // HUD, so this is the number that decides whether the control is usable on a
  // phone at all.
  min-width: 2.4rem
  // 2.25rem is this project's thumb floor (the cavalry button carries the same
  // note). Three segments in one pill is the tightest row in the HUD, so it is
  // the first place a floor gets quietly undercut.
  min-height: 2.25rem
  padding: 0.1rem clamp(0.28rem, 1.6vw, 0.5rem)
  border: 0
  border-radius: 999px
  background-color: rgba(12, 18, 32, 0.45)
  color: #c8d4ea
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: background-color 110ms ease-out, color 110ms ease-out, transform 90ms ease-out

  &:hover:not(.is-active)
    background-color: rgba(12, 18, 32, 0.22)

  &:active
    transform: translateY(1px) scale(0.97)

  // The live rung. Gold body, dark text: the one place in the HUD that inverts,
  // because "which speed am I on" has to survive a glance mid-battle.
  &.is-active
    background-image: linear-gradient(to bottom, #ffd93c, #f0a500)
    color: #21160a
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35)

  // Cannot be honoured right now (no fill, or an empty wallet off-portal). Dim
  // rather than hidden: the rung still has to be visible, or the player cannot
  // see that a faster speed exists at all.
  &.is-locked
    opacity: 0.45
    cursor: not-allowed

.speed-switch__x
  font-weight: 900
  font-variant-numeric: tabular-nums
  line-height: 1
  font-size: clamp(0.72rem, 3.1vw, 1rem)
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5)

.speed-switch__seg.is-active .speed-switch__x
  // Dark text on gold wants a light lift, not a black shadow.
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4)

.speed-switch__movie
  flex: 0 0 auto
  width: clamp(0.85rem, 3.6vw, 1.15rem)
  height: auto
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6))
  pointer-events: none

.speed-switch__coin
  flex: 0 0 auto
  width: clamp(0.75rem, 3.2vw, 1rem)
  height: clamp(0.75rem, 3.2vw, 1rem)
  pointer-events: none

// Something is pointing at this button and waiting. Whole-button bounce rather
// than the urgent glow: it has to be legible as THE thing to press with the
// rest of the screen dimmed behind a coach mark, and a shadow pulse is not.
.call-wave__btn.is-attention
  animation: cw-attention 0.72s ease-in-out infinite

@keyframes cw-attention
  0%, 100%
    transform: translateY(0) scale(1)
  40%
    transform: translateY(-9px) scale(1.06)
  70%
    transform: translateY(0) scale(0.98)

@media (prefers-reduced-motion: reduce)
  .call-wave__btn.is-attention
    animation: none

// The wave is about to start on its own.
.call-wave__btn.is-urgent .call-wave__body
  animation: cw-urgent 0.7s ease-in-out infinite

// A boss wave is next — recolour so nobody calls it by reflex.
.call-wave__btn.is-boss
  .call-wave__body
    background-image: linear-gradient(to bottom, #ff7a5a, #b3251b)
  .call-wave__shadow
    background-color: #6b1212

@keyframes cw-urgent
  0%, 100%
    box-shadow: 0 0 0 0 rgba(255, 210, 60, 0)
  50%
    box-shadow: 0 0 0 4px rgba(255, 210, 60, 0.55)

// ─── Portrait phone ─────────────────────────────────────────────────────────
//
// It shares its row with the meta cluster and the tech-tree button, and it is
// the widest thing in it. The floors above exist so the primary build-phase
// action can never be crushed — but 5.5 rem plus 1.15 rem of side padding is
// more than "not crushed" needs on a 390 px screen, and the slack was coming
// out of the buttons next to it.
@media (max-width: 30rem) and (orientation: portrait)
  .call-wave__btn
    min-width: 4.6rem

  .call-wave__body
    padding-inline: 0.45rem
    padding-block: 0.24rem

  // Three segments in one pill is the tightest thing in the row, so the
  // per-segment floor comes down with everything else. It stays above the
  // 44 px tap target once the pill's own padding and border are counted.
  .speed-switch__seg
    min-width: 2rem
    padding-inline: 0.22rem

</style>

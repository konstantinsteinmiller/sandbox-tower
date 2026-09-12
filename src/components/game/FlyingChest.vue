<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { spriteFor, onArtChanged } from '@/game/art'
import { propArt, CHEST_WING_ID, CHEST_WING_BOX } from '@/game/paintedArt'
import { isGamePaused } from '@/use/useGamePause'
import { isAnyModalOpen } from '@/use/useModalState'
import useSounds from '@/use/useSound'
import { flyingChestRequests } from '@/use/useTowerGame'
import { gifts, grantChestGift, rollChestGift, MAX_GIFTS, type Gift } from '@/use/useGifts'

/**
 * ─── The flying chest ───────────────────────────────────────────────────────
 *
 * A winged chest crosses the sky over the board. Tap it and it opens into a
 * GIFT PIECE — a weld of a gun the player usually does not own yet (see
 * `useGifts`). Ignore it and it flies off; there is another along shortly.
 *
 * Ported from Merge Idle War's flying chest, where it is the most-tapped thing
 * in the game, with two changes for a tower defence:
 *
 *   · ONE EARLY, THEN ONE EVERY 45 SECONDS. The first is five seconds after
 *     the chest becomes possible at all: its job is to tell a new player, while
 *     they are still deciding whether to stay, that there are guns here they
 *     have not met. After that the timer paces them.
 *
 *     It was one per WAVE, and that was too many: early waves are short, so a
 *     first session met three or four chests inside the first minute and the
 *     tower was built out of free welds before the deck had dealt twice. The
 *     timer also makes the rhythm the same on a fast wave and a slow one.
 *   · The clock is UNPAUSED time only, so the gap is 45 seconds of play rather
 *     than 45 seconds of standing in a menu.
 *
 * The clock only runs while the game does. Ads, hidden tabs, modals, the result
 * screen, the rotate prompt and the tutorial's cards all hold it (`paused` plus
 * the global gates), and a chest in flight freezes where it is rather than
 * finishing its crossing behind a scrim.
 *
 * ART. The chest is this game's own — the painted `icon/chest` when the art
 * layer has one, the TreasureChest vector otherwise. The wings are drawn here
 * in the game's inked style and give way to a painted `prop/chest-wing` once
 * one is listed in `PAINTED_PROPS` (see `paintedArt.ts` — an unlisted slot is
 * never requested, so an unpainted wing costs no 404). The painting follows
 * `CHEST_WING_BOX`: the RIGHT wing on a square canvas at the chest's own scale,
 * shoulder at the box's pivot. It is placed so that pivot lands on the drawn
 * wing's shoulder, mirrored for the left, and rotated about it to flap.
 */

interface Props {
  /** The chest may exist right now: tutorial behind the player and the run
   *  live (no result screen, not defeated). The first chest of a run is timed
   *  from this going true. */
  ready: boolean
  /** Anything the scene knows holds play — result screen, rotate prompt,
   *  tutorial cards. The global ad / modal gates are read here directly. */
  paused?: boolean
  /** The wave in progress. Read only to notice a NEW RUN (the number going
   *  backwards), which owes the player an early chest again. */
  wave: number
}

const props = withDefaults(defineProps<Props>(), { paused: false })

const emit = defineEmits<{
  (e: 'opened', gift: Gift): void
}>()

const { t } = useI18n()
const { playSound } = useSounds()

/** A crossing, in unpaused milliseconds. Long enough to notice and reach with
 *  a thumb, short enough that ignoring it is a choice. */
const FLIGHT_MS = 9_000
/** How long after the chest becomes possible the FIRST one takes off. */
const FIRST_MS = 5_000
/** And how long after one leaves the sky the next one enters it. */
const EVERY_MS = 45_000
/** A full gift tray grounds the chest; it tries again this often. */
const RETRY_MS = 10_000
/** The open animation, before the chest is gone. */
const OPEN_MS = 450
const TICK_MS = 100

const flying = ref(false)
const opening = ref(false)
/** 0 → 1 across the sky. */
const progress = ref(0)
/** Height of the lane, as a share of the sky band. */
const lane = ref(0.25)
/** +1 crosses left to right, −1 right to left. */
const dir = ref<1 | -1>(1)

/** Unpaused milliseconds until the next launch, or −1 for none scheduled. */
let countdown = -1
/** A chest has already flown this run, so the next one is on the long timer
 *  rather than on the newcomer's early one. */
let flownThisRun = false

const gated = computed(() => isGamePaused.value || isAnyModalOpen.value || props.paused)

// ─── Art ────────────────────────────────────────────────────────────────────

const chestArt = ref<string | null>(null)
const wingArt = ref<string | null>(null)
const syncArt = (): void => {
  chestArt.value = spriteFor('icon', 'chest')?.src ?? null
  wingArt.value = propArt(CHEST_WING_ID)?.src ?? null
}

/**
 * Where a PAINTED wing sits inside its flap box, read off `CHEST_WING_BOX`.
 *
 * The box below is laid out for the drawn wing — 46 % × 36 % of the chest
 * button, shoulder at its left edge 60 % down, where the flap rotates. The
 * painting is a square canvas at the chest's own scale (the chest image is
 * 56 % of the button) with its shoulder at the contract's pivot, so it is sized
 * to the chest and shifted until that pivot sits on the drawn shoulder. Written
 * out from the contract rather than as CSS literals: repaint the wing with a
 * different pivot, change the one constant, and this follows.
 */
const CHEST_SHARE = 0.56
const WING_BOX_W = 0.46
const WING_BOX_H = 0.36
const SHOULDER_Y = 0.6
const paintedWingStyle = (() => {
  const s = CHEST_SHARE * CHEST_WING_BOX.chestScale
  const pct = (v: number): string => `${(v * 100).toFixed(2)}%`
  return {
    width: pct(s / WING_BOX_W),
    height: pct(s / WING_BOX_H),
    left: pct(-CHEST_WING_BOX.pivotX * (s / WING_BOX_W)),
    top: pct(SHOULDER_Y - CHEST_WING_BOX.pivotY * (s / WING_BOX_H))
  }
})()

// ─── Flight ─────────────────────────────────────────────────────────────────

let raf = 0
let last = 0

const frame = (now: number): void => {
  raf = requestAnimationFrame(frame)
  const dt = last === 0 ? 16 : Math.min(50, now - last)
  last = now
  if (!flying.value || opening.value || gated.value) return
  progress.value = Math.min(1, progress.value + dt / FLIGHT_MS)
  if (progress.value >= 1) land()
}

const startLoop = (): void => {
  if (raf) return
  last = 0
  raf = requestAnimationFrame(frame)
}

const stopLoop = (): void => {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

/** Gone — flown off, opened, or the run ended under it. The next one is booked
 *  from here, so the gap is measured between chests rather than from a wave. */
const land = (): void => {
  const wasFlying = flying.value
  flying.value = false
  opening.value = false
  progress.value = 0
  stopLoop()
  if (wasFlying && props.ready && countdown < 0) countdown = EVERY_MS
}

/**
 * Take off. A full gift tray grounds it — there is nowhere for the prize to
 * go — unless QA forced it, in which case it flies and pays nothing.
 */
const launch = (force = false): boolean => {
  if (flying.value) return false
  if (!force && gifts.value.length >= MAX_GIFTS) return false
  lane.value = 0.1 + Math.random() * 0.3
  dir.value = Math.random() < 0.5 ? 1 : -1
  progress.value = 0
  opening.value = false
  flying.value = true
  flownThisRun = true
  playSound('modal-open', 0.025, 1.25)
  startLoop()
  return true
}

const onOpen = (): void => {
  if (!flying.value || opening.value) return
  opening.value = true
  const gift = rollChestGift()
  // Free the first time a chest is ever opened on this board, half price
  // after that (`grantChestGift`).
  if (grantChestGift(gift)) {
    playSound('reward-continue', 0.06)
    emit('opened', gift)
  } else {
    playSound('obstacle-hit', 0.03)
  }
  window.setTimeout(land, OPEN_MS)
}

// ─── Schedule ───────────────────────────────────────────────────────────────

/** Book the next chest, unless one is already booked or in the sky. */
const book = (ms: number): void => {
  if (flying.value || countdown >= 0) return
  countdown = ms
}

// The chest has become possible — the tutorial is behind the player, or a
// result screen has closed onto a live run. The first one of a run comes
// early; after that the timer takes over where it left off.
watch(() => props.ready, (ready) => {
  if (ready) { book(flownThisRun ? EVERY_MS : FIRST_MS); return }
  countdown = -1
  if (flying.value && !opening.value) land()
}, { immediate: true })

// A wave number going BACKWARDS is a new run, or a continue restoring the last
// wave beaten — either way this player is owed an early chest again.
watch(() => props.wave, (w, prev) => {
  if (prev === undefined || w >= prev) return
  flownThisRun = false
  countdown = -1
  if (props.ready) book(FIRST_MS)
})

// QA: `__tower.requestFlyingChest()`, or `?chest=now` on the URL.
watch(flyingChestRequests, () => launch(true))

const readChestHatch = (): boolean => {
  if (typeof location === 'undefined') return false
  const hash = location.hash.includes('?') ? location.hash.slice(location.hash.indexOf('?') + 1) : ''
  const search = location.search.startsWith('?') ? location.search.slice(1) : location.search
  return new URLSearchParams([search, hash].filter(Boolean).join('&')).get('chest') === 'now'
}

let ticker = 0
let stopArt: (() => void) | null = null

onMounted(() => {
  syncArt()
  stopArt = onArtChanged(syncArt)
  ticker = window.setInterval(() => {
    if (gated.value || flying.value || countdown < 0 || !props.ready) return
    countdown -= TICK_MS
    if (countdown > 0) return
    countdown = -1
    // A grounded chest (nowhere to put the prize) is not a chest skipped:
    // it comes back round shortly rather than at the end of a full gap.
    if (!launch()) countdown = RETRY_MS
  }, TICK_MS)
  if (readChestHatch()) window.setTimeout(() => launch(true), 800)
})

onBeforeUnmount(() => {
  window.clearInterval(ticker)
  stopLoop()
  stopArt?.()
})

// ─── Placement on screen ────────────────────────────────────────────────────

const flightStyle = computed(() => {
  const p = progress.value
  // −15 % → 115 %: it enters and leaves fully off the edge.
  const x = dir.value === 1 ? -15 + p * 130 : 115 - p * 130
  // A lazy sine on top of the lane, so it reads as flying rather than sliding.
  const bob = Math.sin(p * Math.PI * 6) * 0.025
  return { left: `${x}%`, top: `${(lane.value + bob) * 100}%` }
})

defineExpose({ launch, onOpen })
</script>

<template lang="pug">
  div.fchest-layer
    button.fchest(
      v-if="flying"
      type="button"
      :class="{ 'is-open': opening, 'is-held': gated }"
      :style="flightStyle"
      :aria-label="t('gift.chest')"
      @pointerdown.stop.prevent="onOpen"
    )
      span.fchest__glow
      //- Wings behind the chest, each flapping about its own shoulder. The left
      //- is the right one mirrored, so a painted wing is one file.
      span.fchest__wing.is-left
        span.fchest__flap
          img.fchest__wing-art.is-painted(v-if="wingArt" :src="wingArt" :style="paintedWingStyle" alt="" draggable="false")
          svg.fchest__wing-art(v-else viewBox="0 0 64 48" aria-hidden="true")
            path.fchest__feathers(d="M3 26 C 12 10, 34 3, 61 7 C 57 13, 51 15, 53 19 C 47 21, 43 22, 45 27 C 38 28, 34 29, 35 34 C 28 34, 23 35, 22 39 C 14 37, 7 33, 3 26 Z")
            path.fchest__covert(d="M3 26 C 9 15, 22 9, 33 9 C 28 16, 20 22, 11 30 C 7 30, 4 28, 3 26 Z")
            path.fchest__quill(d="M19 15 Q 36 15 53 19 M 15 19 Q 30 22 45 27 M 11 23 Q 23 28 35 34")
      span.fchest__wing.is-right
        span.fchest__flap
          img.fchest__wing-art.is-painted(v-if="wingArt" :src="wingArt" :style="paintedWingStyle" alt="" draggable="false")
          svg.fchest__wing-art(v-else viewBox="0 0 64 48" aria-hidden="true")
            path.fchest__feathers(d="M3 26 C 12 10, 34 3, 61 7 C 57 13, 51 15, 53 19 C 47 21, 43 22, 45 27 C 38 28, 34 29, 35 34 C 28 34, 23 35, 22 39 C 14 37, 7 33, 3 26 Z")
            path.fchest__covert(d="M3 26 C 9 15, 22 9, 33 9 C 28 16, 20 22, 11 30 C 7 30, 4 28, 3 26 Z")
            path.fchest__quill(d="M19 15 Q 36 15 53 19 M 15 19 Q 30 22 45 27 M 11 23 Q 23 28 35 34")
      img.fchest__chest(v-if="chestArt" :src="chestArt" alt="" draggable="false")
      svg.fchest__chest(v-else viewBox="0 0 64 64" aria-hidden="true")
        defs
          linearGradient(id="fchestBody" x1="0" y1="0" x2="0" y2="1")
            stop(offset="0" stop-color="#a05a2c")
            stop(offset="1" stop-color="#5a2e10")
          linearGradient(id="fchestLid" x1="0" y1="0" x2="0" y2="1")
            stop(offset="0" stop-color="#c0732e")
            stop(offset="1" stop-color="#7d4017")
        rect(x="6" y="28" width="52" height="28" rx="3" fill="url(#fchestBody)" stroke="#2a1607" stroke-width="2")
        path(d="M6 28 Q32 8 58 28 Z" fill="url(#fchestLid)" stroke="#2a1607" stroke-width="2")
        rect(x="26" y="34" width="12" height="14" rx="2" fill="#fcd34d" stroke="#5a3408" stroke-width="1.5")
        circle(cx="32" cy="40" r="2" fill="#5a3408")
        rect(x="6" y="38" width="52" height="3" fill="#3a1d09" opacity="0.6")
        rect(x="6" y="50" width="52" height="3" fill="#3a1d09" opacity="0.6")
      span.fchest__burst(v-if="opening")
</template>

<style scoped lang="sass">
// The sky band it crosses. Never interactive itself — only the chest is. No
// z-index of its own: mounted first in its band, it paints under the HUD
// pieces that follow it, so it never covers a bubble or a menu being read.
.fchest-layer
  position: absolute
  inset: 0
  overflow: hidden
  pointer-events: none

// The hit target is the whole winged silhouette and then some: a moving thing
// on a phone is tapped late and a little behind, never dead centre.
.fchest
  position: absolute
  width: clamp(76px, 18vmin, 112px)
  height: clamp(76px, 18vmin, 112px)
  translate: -50% -50%
  padding: 0
  border: none
  background: transparent
  cursor: pointer
  pointer-events: auto
  touch-action: none
  -webkit-tap-highlight-color: transparent

.fchest__glow
  position: absolute
  inset: 8%
  border-radius: 50%
  background: radial-gradient(circle, rgba(255, 214, 90, 0.55) 0%, rgba(255, 214, 90, 0) 70%)
  animation: fchest-glow 1.1s ease-in-out infinite alternate

.fchest__chest
  position: absolute
  left: 22%
  top: 26%
  width: 56%
  height: 56%
  object-fit: contain
  filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.45))
  animation: fchest-bob 0.9s ease-in-out infinite alternate

// Each wing is anchored at its SHOULDER — the left edge, 60 % down — which is
// where the flap rotates about. The left wing is the right one flipped about
// that same edge, so it grows leftwards from the chest's left shoulder.
.fchest__wing
  position: absolute
  top: 14%
  width: 46%
  height: 36%
  transform-origin: 0 60%

  &.is-right
    left: 66%

  &.is-left
    left: 34%
    scale: -1 1

.fchest__flap
  position: relative
  display: block
  width: 100%
  height: 100%
  transform-origin: 0 60%
  animation: fchest-flap 0.32s ease-in-out infinite alternate

.fchest__wing-art
  display: block
  width: 100%
  height: 100%
  object-fit: contain
  object-position: left center
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.35))

  // A painting is PLACED by `paintedWingStyle` — sized to the chest and shifted
  // onto the shoulder — not fitted into the drawn wing's box. `max-width: none`
  // undoes the reset that would clamp it to the box and move the pivot.
  &.is-painted
    position: absolute
    max-width: none
    object-fit: fill

// Inked cel look, like the cast: a flat pale fill, one shade step, a dark line.
.fchest__feathers
  fill: #fff4dc
  stroke: #2a1607
  stroke-width: 2.4
  stroke-linejoin: round

.fchest__covert
  fill: #f1dcb4
  stroke: #2a1607
  stroke-width: 1.6
  stroke-linejoin: round

.fchest__quill
  fill: none
  stroke: #b89a6c
  stroke-width: 1.6
  stroke-linecap: round

// Held: everything freezes where it is, flap and all.
.fchest.is-held
  .fchest__glow, .fchest__chest, .fchest__flap
    animation-play-state: paused

.fchest.is-open
  pointer-events: none

  .fchest__chest
    animation: fchest-pop 0.45s ease-out forwards

  .fchest__wing
    animation: fchest-fade 0.3s ease-out forwards

.fchest__burst
  position: absolute
  inset: 0
  border-radius: 50%
  border: 4px solid rgba(255, 226, 120, 0.95)
  animation: fchest-burst 0.45s ease-out forwards

@keyframes fchest-flap
  from
    rotate: -26deg
  to
    rotate: 16deg

@keyframes fchest-bob
  from
    translate: 0 -5%
  to
    translate: 0 5%

@keyframes fchest-glow
  from
    opacity: 0.55
  to
    opacity: 1

@keyframes fchest-pop
  0%
    scale: 1
    opacity: 1
  45%
    scale: 1.4
    opacity: 1
  100%
    scale: 1.6
    opacity: 0

@keyframes fchest-fade
  to
    opacity: 0

@keyframes fchest-burst
  from
    scale: 0.4
    opacity: 1
  to
    scale: 1.8
    opacity: 0

// Motion is the point of the chest — it has to cross the sky to be a chest at
// all — so reduced motion keeps the crossing and gives up the flutter.
@media (prefers-reduced-motion: reduce)
  .fchest__flap, .fchest__chest, .fchest__glow
    animation: none
</style>

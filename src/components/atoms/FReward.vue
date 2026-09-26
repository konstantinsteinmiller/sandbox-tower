<template lang="pug">
  Transition(name="fade")
    //- Ensure classes with special characters are in parentheses
    div.fixed.inset-0.flex.flex-col.items-center.justify-center.backdrop-blur-md.touch-none.cursor-pointer(
      v-if="modelValue"
      class="bg-[var(--ui-scrim)]"
      :class="[isAdShowing ? 'z-0' : 'z-[100]', isCompact ? 'p-2' : 'p-4']"
      :style="{\
        paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',\
        paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',\
        paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))',\
        paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))'\
      }"
      @click="handleOverlayClick"
    )
      //- Ribbon header: a toy-plastic banner drawn in CSS (no bitmap) — a
      //- red plastic band with the sunshine rim over two notched tails. The
      //- slot content (or a fallback "Rewards" label) renders on top of the
      //- band, centred on it. A painted slim banner still replaces it when
      //- the art layer has one.
      div.ribbon-wrap.relative.mb-10.shrink-0(
        v-if="$slots.ribbon"
        :class="{ 'is-compact': isCompact, 'is-desktop': !isCompact && !isMobilePortrait }"
      )
        div.ribbon-banner(
          :class="{ 'is-slim': slimRibbon }"
          :style="slimRibbon ? { backgroundImage: `url('${slimRibbon}')` } : undefined"
        )
          span.ribbon-shape(v-if="!slimRibbon" aria-hidden="true")
            i.ribbon-shape__tails
            i.ribbon-shape__band
          div.ribbon-content
            slot(name="ribbon")
              span.text-white.font-black.uppercase.italic.game-text {{ t('rewards') }}

      //- Content area — centred when it fits, scrollable when it does not.
      //-
      //- It used to be `justify-center` with `h-full` outside compact mode,
      //- which centres beautifully right up until the content is taller than
      //- the box and then clips it with no way to reach the rest. Flexbox
      //- centring overflows in BOTH directions, so the top of a tall panel goes
      //- off the screen and is unreachable — and the defeat screen is exactly
      //- the panel that grows, because it gains a record line, a rank, a
      //- rewarded offer, a continue offer and a tip depending on the run.
      //-
      //- `margin: auto` on the inner wrapper does what `justify-center` was
      //- meant to: it centres while there is slack and collapses to zero when
      //- there is not, leaving the scroll to do the rest.
      div.f-reward__body.relative.w-full.flex.flex-col.items-center.flex-1.min-h-0(
        :class="isCompact ? 'py-1' : ''"
      )
        div.f-reward__center
          slot

      //- Tap-to-continue hint. In landscape it sits INLINE in the flow (shrink-0)
      //- so it can never overlap the centred reward content; otherwise it floats
      //- at the bottom of the viewport as before.
      Transition(name="fade")
        div.flex.justify-center.animate-pulse.pointer-events-none(
          v-if="showContinue"
          :class="isCompact ? 'shrink-0 pt-1 pb-1' : 'absolute bottom-8 left-0 right-0 sm:bottom-12'"
        )
          div.text-white.font-black.uppercase.italic.tracking-widest.brawl-text(
            :class="isCompact ? 'text-xs' : 'text-sm md:text-2xl'"
          )
            | {{ isMobile ? t('tapToContinue') : t('clickToContinue') }}
</template>

<script setup lang="ts">
import { computed, ref, useSlots, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { isMobileLandscape, isMobilePortrait, isShortViewport } from '@/use/useUser'
import { spriteFor, onArtChanged } from '@/game/art'

// "Compact" layout = the short-viewport treatment: mobile landscape OR any
// short embed (≤500px tall, e.g. a CG iframe on a Chromebook). In both cases
// the centred desktop layout overflows, so the ribbon shrinks and the
// tap/click-to-continue hint flows INLINE below the content (shrink-0) instead
// of floating absolutely at the bottom — where it otherwise overlapped the
// reward button.
const isCompact = computed(() => isMobileLandscape.value || isShortViewport.value)
// Sink the reward overlay below the ad layer whenever an interstitial/rewarded
// is on screen. GameMonetize (and several other portals) inject their ad
// container at a z-index lower than this modal's z-[100], so without this the
// modal — including its backdrop-blur — paints OVER the playing ad.
import { isAdShowing } from '@/use/useGamePause'

const props = defineProps<{
  modelValue: boolean
  showContinue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'continue'): void
}>()

const { t } = useI18n()
const slots = useSlots()

const isMobile = computed(() => {
  return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
})

/**
 * The painted 5:1 title band, when the art layer has one.
 *
 * The CSS ribbon keeps the old 553x188 bitmap's 2.94:1 box and hides a quarter
 * of its height under the tails the label has to dodge — which is why the wrap
 * below carries four media queries whose only job is to claw that height back.
 * The painted banner is a flat band with its writing panel centred, so the same
 * width costs 41% less vertical room and the content's -14% lift can go.
 *
 * Null until the bitmap decodes, and null forever with art overrides off — in
 * which case every rule here falls back to the CSS ribbon and the screen
 * looks exactly as it does today. The probe subscribes because it is async and
 * the first paint happens before the image is in.
 */
const slimRibbon = ref<string | null>(null)
const syncRibbon = (): void => { slimRibbon.value = spriteFor('bg', 'ribbon')?.src ?? null }
let stopArt: (() => void) | null = null

// Probed on MOUNT rather than on open: this component is mounted with the game
// scene and only shown when a siege ends, so the request goes out minutes
// before the result screen needs it and the band never pops in.
onMounted(() => {
  syncRibbon()
  stopArt = onArtChanged(syncRibbon)
})

const handleOverlayClick = () => {
  if (props.showContinue) emit('continue')
}

// Desktop shortcut: Space / Enter triggers the same "continue" action
// the overlay click does, but only while the reward is up AND in
// continue-mode. Listener is attached only when the modal becomes
// visible so background views aren't intercepting these keys.
const onContinueKey = (e: KeyboardEvent) => {
  if (!props.modelValue || !props.showContinue) return
  if (e.code !== 'Space' && e.code !== 'Enter' && e.code !== 'NumpadEnter') return
  // Skip when focus is on a typing target — players might be editing
  // toolbar inputs in the background.
  const t = e.target
  if (t instanceof HTMLElement) {
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return
    if (t.isContentEditable) return
  }
  e.preventDefault()
  emit('continue')
}

watch(() => props.modelValue, (open) => {
  if (open) window.addEventListener('keydown', onContinueKey)
  else window.removeEventListener('keydown', onContinueKey)
}, { immediate: true })

onUnmounted(() => {
  window.removeEventListener('keydown', onContinueKey)
  stopArt?.()
})
</script>

<style scoped lang="sass">
.fade-enter-active, .fade-leave-active
  transition: opacity 0.4s ease

.fade-enter-from, .fade-leave-to
  opacity: 0

.brawl-text
  text-shadow: 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000

// ─── Content area ───────────────────────────────────────────────────────────

.f-reward__body
  overflow-y: auto
  overflow-x: hidden
  // A dialog that has to scroll should say so with its own scrollbar rather
  // than by handing the gesture to the page behind it.
  overscroll-behavior: contain
  // iOS keeps momentum scrolling inside a `touch-none` ancestor only if the
  // scrollable child opts back in.
  touch-action: pan-y

.f-reward__center
  display: flex
  flex-direction: column
  align-items: center
  width: 100%
  // The centring. Collapses to 0 the moment the content is taller than the
  // body, which is what keeps the top reachable — see the template note.
  margin-block: auto

// ─── Ribbon ─────────────────────────────────────────────────────────────────

.ribbon-wrap
  position: relative
  width: 80vw
  max-width: 480px

  // Short-viewport treatment. Replaces the old `scale-90` utility, which
  // shrank the ribbon's PAINT but not its layout box, leaving a dead band of
  // margin exactly where vertical room was scarcest.
  &.is-compact
    width: 62vw
    max-width: 340px
    margin-top: -0.25rem
    margin-bottom: 0.25rem

  &.is-desktop
    @media (min-height: 501px)
      width: 70vw
      max-width: 360px

// The banner box keeps the old bitmap's 553×188 proportions, so every width
// below (tuned by portal QA) still produces the same height and nothing on the
// result screen moves. The ribbon itself is drawn in CSS (`.ribbon-shape`).
// `background-*` stays for the painted slim banner, which arrives as an inline
// `background-image`.
.ribbon-banner
  position: relative
  aspect-ratio: 553 / 188
  width: 100%
  background-repeat: no-repeat
  background-position: center
  background-size: contain
  display: flex
  align-items: center
  justify-content: center
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))

  // Painted slim banner (1280×256). A flat 5:1 band instead of 2.94:1, which
  // is a 41% cut in height at every one of the widths below — none of them
  // move, so nothing that portal QA tuned on the horizontal axis changes.
  // Its writing panel is centred by contract, so the lift below goes to zero.
  &.is-slim
    aspect-ratio: 5 / 1

    .ribbon-content
      margin-top: 0

.ribbon-content
  position: relative
  z-index: 1
  // The band sits in the upper part of the box (the tails hang below it),
  // so the content lifts a little to land centred on the band.
  margin-top: -6%
  display: flex
  align-items: center
  justify-content: center
  text-align: center
  // Leave generous horizontal room on each side so wider labels don't
  // crash into the tail folds.
  padding: 0 18%

// ─── The CSS ribbon ─────────────────────────────────────────────────────────
//
// One outlined silhouette: the parent's four 1.5px drop-shadows trace the ink
// line around the band AND the clipped tails together (a filter on the clipped
// element itself would be clipped away with it).
.ribbon-shape
  position: absolute
  inset: 0
  pointer-events: none
  filter: drop-shadow(1.5px 0 0 var(--ui-line)) drop-shadow(-1.5px 0 0 var(--ui-line)) drop-shadow(0 1.5px 0 var(--ui-line)) drop-shadow(0 -1.5px 0 var(--ui-line))

  i
    position: absolute
    display: block

// The two tails: one bar with a V-notch at each end, its middle hidden behind
// the band. The dark stripes just inside the band's ends are the folds.
.ribbon-shape__tails
  left: 0
  right: 0
  top: 36%
  bottom: 8%
  clip-path: polygon(0 0, 100% 0, 93% 50%, 100% 100%, 0 100%, 7% 50%)
  background-image: linear-gradient(to right, #c23a30 0%, #d8473b 11%, #7e1d16 13.5%, #8c2219 16%, #8c2219 84%, #7e1d16 86.5%, #d8473b 89%, #c23a30 100%)

// The band: red toy plastic, sunshine rim, gloss along the top.
.ribbon-shape__band
  left: 12%
  right: 12%
  top: 12%
  bottom: 30%
  border: clamp(2px, 0.8vw, 4px) solid var(--ui-rim)
  border-radius: clamp(5px, 1.6vw, 12px)
  background-image: linear-gradient(to bottom, var(--btn-red-from), var(--btn-red-to) 70%, #c93a2f)
  box-shadow: inset 0 clamp(2px, 0.7vw, 5px) 0 rgba(255, 255, 255, 0.3), inset 0 calc(-1 * clamp(2px, 0.6vw, 4px)) 0 rgba(120, 20, 12, 0.25)

// Landscape phone: 30% smaller than the compact treatment above (62vw/340px
// → 43vw/238px). The banner is decoration and the short axis is the scarce
// one — at 340px wide it stood 116px tall, nearly a third of a 390px-high
// viewport spent on a title, and the CTAs below it fell off the bottom.
//
// `.is-compact` is always on in mobile landscape and is a compound selector,
// so it outranks a bare `.ribbon-wrap` here however far down the file it sits.
// This has to match the compound form too or it loses silently.
@media (orientation: landscape) and (max-height: 500px)
  .ribbon-wrap,
  .ribbon-wrap.is-compact
    width: 43vw
    max-width: 238px

// Short but not landscape-mobile (e.g. CG iframe in landscape with the
// portal chrome bar visible — ~700–860 px viewport). The default desktop
// ribbon (max 400 px wide → ~136 px tall) eats too much vertical room
// here, leaving no space for the result text + wheel + spin-again
// buttons. Cap it tighter so the roulette overlay's chrome fits the
// viewport. CG QA caught the overflow 2026-05-05.
@media (orientation: landscape) and (min-height: 501px) and (max-height: 860px)
  .ribbon-wrap.is-desktop
    width: 50vw
    max-width: 320px

</style>

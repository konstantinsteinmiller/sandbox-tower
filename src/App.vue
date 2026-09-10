<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { mobileCheck } from '@/utils/function'
import { useMusic } from '@/use/useSound'
import { useExtensionGuard } from '@/use/useExtensionGuard'
import { windowWidth, windowHeight } from '@/use/useUser'
import { isDebug } from '@/use/useMatch'
import useAssets from '@/use/useAssets'
import FLogoProgress from '@/components/atoms/FLogoProgress.vue'
import FPerfMeter from '@/components/atoms/FPerfMeter.vue'
import SaveStatusBanner from '@/components/atoms/SaveStatusBanner.vue'
import AdsBlockedModal from '@/components/atoms/AdsBlockedModal.vue'
import VConsoleHideButton from '@/components/atoms/VConsoleHideButton.vue'
import { useCrazyMuteSync } from '@/use/useCrazyMuteSync'
import useCheats, { installDebugUnlock } from '@/use/useCheats'
import { isCrazyWeb, isWaveDash, isItch, isGlitch, isGameDistribution, isPlaygama, isGamepix, isGameMonetize, isYandex, isPoki, isNative, orientation } from '@/use/useUser'
import { glitchLicenseStatus } from '@/use/useGlitchLicense'
import { resolveCapabilities } from '@/platforms/capabilities'
import { getPlattformText } from '@/platforms/plattformText'

const { t } = useI18n()
const { initMusic, pauseMusic, continueMusic } = useMusic()
useExtensionGuard()
const { resourceCache } = useAssets()
useCrazyMuteSync()
// Attach the "cmarc" debug-unlock key listener at app boot (App.vue is eager),
// so typing it anywhere flips debug mode — the lazy game scene used to be the
// only importer, which tree-shook the listener out of production builds.
installDebugUnlock()
// Mount the cheat keyboard shortcuts (stage jumps, +coins, item-box spawn) for
// the whole app lifetime. The factory self-gates on `localStorage.cheat` and
// returns inert when cheats are off, so this is a no-op for normal players —
// but without CALLING it the keydown listeners were never attached at all
// (it was previously only imported for `installDebugUnlock`, never invoked).
useCheats()

initMusic()

const portraitQuery = window.matchMedia('(orientation: portrait)')
const onTouchStart = (event: any) => {
  if (event.touches.length > 1) {
    event.preventDefault() // Block multitouch (pinch)
  }
}

const onGestureStart = (event: any) => {
  event.preventDefault() // Block specific Safari zoom gestures
}
const onOrientationChange = (event: any) => {
  if (event.matches) {
    orientation.value = 'portrait'
  } else {
    orientation.value = 'landscape'
  }
}

const onContextMenu = (event: any) => {
  event.preventDefault() // Block right-click context menu
}

const handleVisibilityChange = async () => {
  try {
    if (document.hidden) {
      pauseMusic()
      // console.log('App moved to background - Pausing Music')
    } else {
      continueMusic()
      // console.log('App back in focus - Resuming Music')
    }
  } catch (error) {
    // console.log('error: ', error)
  }
}

const updateGlobalDimensions = () => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
  orientation.value = mobileCheck() && windowWidth.value > windowHeight.value ? 'landscape' : 'portrait'
}

const dimensionsInterval = ref<any | null>(null)
// Ensure listeners are active
const delayedUpdateGlobalDimensions = () => setTimeout(updateGlobalDimensions, 300)
onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateGlobalDimensions)

    dimensionsInterval.value = setInterval(() => {
      windowWidth.value = window.innerWidth
      windowHeight.value = window.innerHeight
    }, 400)
    window.addEventListener('orientationchange', delayedUpdateGlobalDimensions)
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }
})
onUnmounted(() => {
  window.removeEventListener('resize', updateGlobalDimensions)
  window.removeEventListener('orientationchange', delayedUpdateGlobalDimensions)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  clearInterval(dimensionsInterval.value)
})

onMounted(() => {
  document.addEventListener('contextmenu', onContextMenu)
  document.addEventListener('touchstart', onTouchStart, { passive: false })
  document.addEventListener('gesturestart', onGestureStart)
  portraitQuery.addEventListener('change', onOrientationChange)
})
onUnmounted(() => {
  document.removeEventListener('contextmenu', onContextMenu)
  document.removeEventListener('touchstart', onTouchStart)
  document.removeEventListener('gesturestart', onGestureStart)
  portraitQuery.removeEventListener('change', onOrientationChange)
})

// Capability gates for the per-platform render fork in the template
// below — single source of truth lives in `@/platforms/capabilities`.
// `parentOrigin` is the iframe parent's origin (only meaningful for Glitch
// where the game runs on a CDN iframe-embedded into glitch.fun).
const hostname = window.location.hostname
const parentOrigin = window.location.ancestorOrigins?.[0] ?? document.referrer ?? ''
const platformFlags = {
  isCrazyWeb, isWaveDash, isItch, isGlitch, isGameDistribution, isPlaygama, isGamepix, isGameMonetize, isYandex, isPoki
}
const capabilities = computed(() => resolveCapabilities({
  flags: platformFlags,
  hostname,
  parentOrigin,
  glitchLicenseStatus: glitchLicenseStatus.value
}))

const isGameShowAllowed = computed(() =>
  capabilities.value.allowedToShowOnCrazyGames ||
  capabilities.value.allowedToShowOnWaveDash ||
  capabilities.value.allowedToShowOnItch ||
  capabilities.value.allowedToShowOnGlitch ||
  capabilities.value.allowedToShowOnGameDistribution ||
  capabilities.value.allowedToShowOnPlaygama ||
  capabilities.value.allowedToShowOnGamepix ||
  capabilities.value.allowedToShowOnGameMonetize ||
  capabilities.value.allowedToShowOnYandex ||
  capabilities.value.allowedToShowOnPoki ||
  location.hostname.includes('localhost')
)
const isGlitchDenied = computed(() => capabilities.value.isGlitchDenied)
const showOnlyAvailableText = computed(() => capabilities.value.showOnlyAvailableText)
// Sourced from `@/platforms/plattformText` — that file is in the obfuscator's
// exclude list so its env-literal ladder DCEs cleanly per build and only the
// active build's hostname survives in the bundle. See the comment in
// `plattformText.ts` for why a separate file (and why exclusion is required).
const plattformText = computed(() => getPlattformText())
</script>

<template lang="pug">
  div(v-if="isGameShowAllowed" id="app-root" class="h-screen h-dvh w-screen app-container root-protection game-ui-immune")
    FLogoProgress
    FPerfMeter(v-if="isDebug" :offset-y="52")
    SaveStatusBanner
    AdsBlockedModal
    VConsoleHideButton
    RouterView

  div.relative.w-full.h-full(v-else-if="isGlitchDenied")
    h1.absolute.text-red-500(class="left-1/2 -translate-x-[50%] top-1/2 -translate-y-[50%] text-3xl") {{ t('license.denied') }}


  div.relative.w-full.h-full(v-else-if="showOnlyAvailableText")
    h1.absolute(class="left-1/2 -translate-x-[50%] top-1/2 -translate-y-[50%] text-3xl") {{ t('crazyGamesOnly') }}
      span.ml-2.text-amber-500 {{ plattformText }}
</template>

<style lang="sass">
*
  font-family: 'Angry', sans-serif
  user-select: none
  outline: none
  // Standard
  -webkit-user-select: none
  // Safari
  -moz-user-select: none
  // Firefox
  -ms-user-select: none
  // IE10+

  // Optional: prevent the "tap highlight" color on mobile
  -webkit-tap-highlight-color: transparent

img
  pointer-events: none

// ─── Reduced HUD effects ────────────────────────────────────────────────────
//
// `useAdaptiveQuality` stamps `data-hud-fx="off"` on `#app-root` when measured
// frame time says this machine cannot afford the HUD's decoration. Everything
// dropped here shares one property: it is per-frame COMPOSITOR or PAINT work
// that no amount of canvas tuning can reach, and that no probe in this project
// has ever measured, because `usePerfProbe` brackets `update` + `render` inside
// the canvas and all of this lands outside that bracket.
//
// What was actually on screen in the 18 fps playtest, in a wave-1 build phase
// with four blocks and no enemies — i.e. with the canvas very nearly idle:
//
//   • two `backdrop-filter` elements (the control hint, the mute button) over a
//     canvas that invalidates on every single frame. A backdrop filter forces
//     the compositor to re-read the region behind the element and re-blur it
//     each time that region changes, into its own render surface. On a 2-CU
//     integrated GPU this is not a rounding error.
//   • a keyframe animating `filter: drop-shadow()` on the HUD buttons. Filters
//     do not composite: every frame is a full re-raster of the element plus a
//     blur pass, on the main thread.
//   • a keyframe animating `box-shadow` on the call-wave button, which was in
//     its urgent state at the time. Same story — `box-shadow` is a paint
//     property, so this repaints the button 60 times a second.
//   • a keyframe animating `background-position` on the coin badge. Also paint.
//
// The animations are neutralised rather than deleted: each one is a real
// affordance (the tech-tree button's glow is how a player finds it), so the
// element keeps its FINAL, most-visible appearance and simply stops moving.
// A player on a weak machine still sees a glowing tech-tree button; it just
// does not cost them four frames a second to look at it.
//
// Transforms and opacity are deliberately left alone throughout: those DO
// composite, they cost the GPU almost nothing, and stripping them would take
// away the motion that makes the HUD readable for no measurable return.

[data-hud-fx="off"]
  // Reaches Tailwind's `backdrop-blur-*` utilities and hand-written rules alike.
  *
    backdrop-filter: none !important
    -webkit-backdrop-filter: none !important

  // `filter` animations: hold the lit end of the cycle, stop animating. The
  // `.is-bounce` pairing has to be named too — it declares BOTH animations in
  // one shorthand, so a rule that only killed `.is-attention` would leave the
  // shorthand on the more specific selector intact.
  .f-hud-button.is-attention,
  .f-hud-button.is-attention.is-bounce
    animation: none !important
    filter: drop-shadow(0 0 8px rgba(255, 200, 0, 0.75)) !important

  // `box-shadow` animation on the urgent call-wave button: hold the ring.
  .call-wave__btn.is-urgent .call-wave__body
    animation: none !important
    box-shadow: 0 0 0 4px rgba(255, 210, 60, 0.55) !important

  // `background-position` sweep on the coin badge — a `::before` overlay.
  .coin-badge::before
    animation: none !important

  // The build tray's travelling gloss and the hint's breathing are composited
  // (`translate` / `opacity`) and stay. The hint's blur is gone via the rule
  // above, which is what actually cost anything there.

// ─── Non-Latin scripts ─────────────────────────────────────────────────────
//
// 'Angry' is a Latin-only display face. Every non-Latin locale this game ships
// — zh, ja, ko, ar, th, hi — therefore falls through to whatever `sans-serif`
// happens to resolve to, which varies by device and is the usual cause of a
// "the content did not display in <language>" ticket. Naming the platform's
// real face for each script first makes the result predictable, and costs
// nothing to download: these are all system fonts. Never inline a CJK webfont
// — 3-8 MB blows a portal's bundle budget on its own.
//
// Keyed off the `lang` attribute that `applyDocumentLocale` stamps on <html>,
// so a mid-session portal language switch re-picks the stack with no reload.
// One attribute selector out-specifies the bare `*` above.

html[lang="zh"] *
  font-family: 'Angry', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif

html[lang="ja"] *
  font-family: 'Angry', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', Meiryo, 'Noto Sans CJK JP', sans-serif

html[lang="ko"] *
  font-family: 'Angry', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans CJK KR', sans-serif

html[lang="ar"] *
  font-family: 'Angry', 'Geeza Pro', 'Segoe UI', Tahoma, 'Noto Naskh Arabic', sans-serif

html[lang="th"] *
  font-family: 'Angry', Thonburi, 'Leelawadee UI', 'Noto Sans Thai', sans-serif

html[lang="hi"] *
  font-family: 'Angry', 'Kohinoor Devanagari', 'Nirmala UI', 'Noto Sans Devanagari', sans-serif

// Letter-spacing is a Latin idiom. Arabic is CURSIVE JOINED, so ANY tracking —
// positive or negative — pulls the letters apart at the joins and renders words
// as disconnected glyphs; Han and Kana have no need for it either, and the
// negative values shear them. The overrides are per-component (`.class[data-v]`
// out-specifies a plain attribute selector), so this needs `!important` to
// reach them. That is the point: it is a script-level correction, not a style
// preference.
html[dir="rtl"] *,
html[lang="zh"] *,
html[lang="ja"] *,
html[lang="ko"] *
  letter-spacing: normal !important
</style>
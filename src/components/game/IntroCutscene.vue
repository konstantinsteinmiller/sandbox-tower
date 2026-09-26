<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import IncomingBanner from '@/components/game/IncomingBanner.vue'
import { INTRO_LAND_HIT_MS, introBeatStart } from '@/game/introCutscene'
import { introBanner, introBeat, introCard, introClock, skipIntro } from '@/use/useIntroCutscene'

/**
 * ─── The opening cutscene: everything that is not the camera ────────────────
 *
 * The cutscene itself is a camera move over the battlefield canvas — the army
 * is real game units drawn by the real renderer, which is the whole reason it
 * looks like the game and not like a video. This component is the frame around
 * that: the letterbox, the vignette, the three lines of premise, the whip flash
 * on the way home, and the way out.
 *
 * ── Everything animates off the director's clock, not off CSS ──
 *
 * There is not a single keyframe animation on the timed elements, and that is
 * deliberate. A CSS animation runs on its own clock, which means it keeps
 * running while the game is paused behind an interstitial (the director's clock
 * does not — see `stepIntro`) and it cannot be moved when the player skips. The
 * result of both would be type and camera drifting out of step with each other,
 * which on a ten-second sequence is the difference between a cutscene and a
 * bug. So the opacity of every timed element is a `computed` over `introClock`,
 * and the whole overlay is correct at any millisecond, in any order, including
 * the ones a skip jumps over.
 *
 * ── The way out ──
 *
 * The backdrop swallows pointer events and skips on the first one. Swallowing
 * is not optional: the battlefield underneath is live and its pointer handlers
 * place blocks, so without this the tap that dismisses the cutscene would build
 * a wall in whatever column the player happened to touch. The window-level
 * first-interaction watch is on the CAPTURE phase (see `useFirstInteraction`),
 * so that tap still counts as the player's first gesture — which is what opens
 * the portal's gameplay bracket and is exactly right.
 *
 * `hud.skip` gets a real button as well, bottom-trailing, because "tap anywhere"
 * is a convention and a label is a promise.
 */

const { t } = useI18n()

const WHIP_AT = introBeatStart('whip')

/** How tall the cinema bars are, in vh. */
const BAR_VH = 7.5
/** The bars slide in over this, and back out over the same at the end. */
const BAR_IN_MS = 420
const BAR_OUT_MS = 300
/** Cross-fade window at each end of a premise card, ms. */
const CARD_FADE_MS = 280

const clampU = (u: number): number => (u < 0 ? 0 : u > 1 ? 1 : u)
/** Cubic ease-out — the curve every fade and slide here uses. */
const easeOut = (u: number): number => 1 - Math.pow(1 - clampU(u), 3)

/**
 * 1 while the cinematic frame is closed, 0 at either end.
 *
 * It opens over the first shot and comes off across the WHIP — not across the
 * last three hundred milliseconds of the cutscene, which is where it used to
 * be. The two were the same thing until the closing shot grew: the camera now
 * lands on the tower and holds for nearly two seconds while three riders
 * gallop in, and a letterbox still clamped over that would be framing a
 * playable board. So the bars retract as the camera turns for home, and the
 * arrival, the interface coming back and the frame lifting are one motion.
 */
const framing = computed(() => {
  const ms = introClock.value
  const opening = easeOut(ms / BAR_IN_MS)
  const closing = easeOut((ms - WHIP_AT) / BAR_OUT_MS)
  return opening * (1 - closing)
})

/**
 * The letterbox.
 *
 * In over the first shot, out over the whip: by the time the camera lands on
 * the tower the bars are gone and the HUD is coming back, so the handover
 * reads as one motion rather than as a cutscene ending and a game starting.
 */
const barHeight = computed(() => `${(BAR_VH * framing.value).toFixed(3)}vh`)

const cardOpacity = computed(() => {
  const card = introCard.value
  if (!card) return 0
  const ms = introClock.value
  return Math.min(
    easeOut((ms - card.from) / CARD_FADE_MS),
    easeOut((card.to - ms) / CARD_FADE_MS)
  )
})

/**
 * A card rises slightly as it arrives.
 *
 * Six pixels, once, and it is not decoration: three lines appearing in the same
 * place over ten seconds are easy to read as one line changing its words. A
 * little travel on each entrance says a new thing has been said.
 */
const cardShift = computed(() => `${(1 - cardOpacity.value) * 6}px`)

/**
 * The focus pull on the money shot.
 *
 * Every shot before the siege line is a SWEEP — the eye tracks the motion and
 * the composition is the whole width of the frame. The hold is the only shot
 * with a subject, and a hold framed exactly like a sweep is where a player's
 * attention drifts along the rank instead of landing on the machines. So the
 * vignette closes further, over about three quarters of a second, and opens
 * again as the camera leaves.
 *
 * On its own clock like everything else here: a CSS transition between two
 * gradients is not reliably interpolable, and a `background` that snapped at
 * the beat boundary would be a visible pop on the one frame that matters.
 */
const siegeFocus = computed(() => {
  const ms = introClock.value
  const from = introBeatStart('siege')
  if (ms < from || ms >= WHIP_AT) return 0
  return easeOut((ms - from) / 750) * (1 - easeOut((ms - (WHIP_AT - 260)) / 260))
})

/**
 * The whip.
 *
 * Two things at once, both peaking at the midpoint of the move: a set of
 * horizontal speed streaks, and a brief lift in brightness. A whip-pan across a
 * near-static backdrop has almost nothing in it for the eye to track — the
 * parallax that sells a slow pan is the same parallax that makes a fast one
 * read as a jump cut — so the streaks are what turn the 400 ms into travel.
 *
 * Deliberately over before the camera settles: streaks still on screen when the
 * tower arrives would blur the frame the player is meant to be reading.
 */
const whipStrength = computed(() => {
  const ms = introClock.value
  if (ms < WHIP_AT || ms > INTRO_LAND_HIT_MS) return 0
  const u = (ms - WHIP_AT) / Math.max(1, INTRO_LAND_HIT_MS - WHIP_AT)
  // A sine hump: nothing at either end, everything in the middle.
  return Math.sin(clampU(u) * Math.PI)
})

/**
 * The skip button's own entrance and exit — on the director's clock, like
 * everything else here rather than on a Vue transition.
 *
 * It arrives WITH the letterbox rather than a beat later, because the player
 * who wants it wants it in the first second, and it retires before the whip:
 * there is nothing left to skip once the camera is already on its way home, and
 * a button that outlives its own function is a button players press and watch
 * do nothing.
 */
const skipOpacity = computed(() => {
  const ms = introClock.value
  return Math.min(
    easeOut((ms - 120) / 380),
    1 - easeOut((ms - (WHIP_AT - 260)) / 260)
  )
})

const canSkip = computed(() => skipOpacity.value > 0.01)

/** A short slide in from the corner on the way in, and back out on the way
 *  out — the corner is the busiest part of a wide shot, and a control that
 *  simply fades up there is easy not to notice at all. */
const skipShift = computed(() => `${(1 - Math.min(1, skipOpacity.value)) * 16}px`)

const onBackdrop = (): void => { skipIntro() }

const onSkip = (e: Event): void => {
  e.stopPropagation()
  skipIntro()
}
</script>

<template lang="pug">
  //- The beat as a class: nothing styles it, and that is on purpose. It is the
  //- inspection hatch for a sequence that is otherwise pure canvas — with
  //- `?tut=intro` it is how a screenshot, a DOM snapshot or a QA note can say
  //- WHICH shot it was taken on, in the same spirit as `?perf=1`.
  div.intro(:class="`is-${introBeat}`" :style="{ '--intro-frame': framing }")
    //- The tap catcher. It has to be a real, full-bleed, interactive layer —
    //- see the note on swallowing above — and it sits UNDER the type so the
    //- skip button can take its own clicks.
    div.intro__catch(@pointerdown="onBackdrop")

    //- ── The frame ──
    div.intro__bar.is-top(:style="{ height: barHeight }")
    div.intro__bar.is-bottom(:style="{ height: barHeight }")
    div.intro__vignette(:style="{ opacity: framing * 0.9 }")
    //- A second, tighter vignette that fades up over the siege hold — the one
    //- shot in the sequence with a subject. See `siegeFocus`.
    div.intro__focus(v-if="siegeFocus > 0.01" :style="{ opacity: siegeFocus }")

    //- ── The premise, three lines across ten seconds ──
    //- Keyed on the card so a change of line re-enters rather than morphing a
    //- word at a time, which at this size reads as a glitch.
    div.intro__card(
      v-if="introCard"
      :key="introCard.key"
      :style="{ opacity: cardOpacity, transform: `translate(-50%, ${cardShift})` }"
    )
      span.intro__line {{ t(introCard.key) }}

    //- ── The line the game already owns, over the siege line ──
    //- `IncomingBanner` rather than a fourth card: it is the same sentence, in
    //- the same type, with the monster-and-Gate pictogram under it, and showing
    //- it HERE — against the army it is talking about — is the whole point of
    //- moving it off the opening board.
    IncomingBanner(v-if="introBanner")

    //- ── The way home ──
    div.intro__whip(v-if="whipStrength > 0.01" :style="{ opacity: whipStrength }")
    div.intro__flash(v-if="whipStrength > 0.01" :style="{ opacity: whipStrength * 0.22 }")

    //- ── The way out ──
    //- Bottom right, on every device and in every language — see the note on
    //- `.intro__skip`. The chevron is filled rather than outlined so it reads
    //- as a transport control at a glance and not as an arrow pointing at
    //- something.
    button.intro__skip(
      v-if="canSkip"
      type="button"
      :style="{ opacity: skipOpacity, transform: `translateX(${skipShift})` }"
      @pointerdown.stop
      @click="onSkip"
    )
      span {{ t('hud.skip') }}
      svg(viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round")
        path(d="M5 4.5l9.5 7.5L5 19.5z")
        path(d="M18.5 4.5v15" fill="none" stroke-width="2.6")
</template>

<style scoped lang="sass">
.intro
  position: absolute
  inset: 0
  // Over the HUD, which the scene has faded out under it, and over the
  // battlefield it is framing.
  z-index: 40
  overflow: hidden
  // Children opt in individually; only the catcher and the button take input.
  pointer-events: none
  // The `fade` transition on the skip button is inherited from the app-level
  // stylesheet, like every other `Transition(name="fade")` in the scene.

// ─── Paint order ────────────────────────────────────────────────────────────
//
// Stated once, explicitly, because two of the layers here come from elsewhere
// and cannot be reasoned about from this file alone. `.intro` carries a
// `z-index`, so it is a stacking context and these numbers are local to it —
// but `IncomingBanner` brings its own `z-index: 12` from the HUD it normally
// lives in, and without a scale that accounts for it the banner would paint
// over the letterbox it is supposed to sit inside.
//
//    1  the tap catcher        (under everything; it only needs to be hit)
//    5  the vignette, and the tighter one that fades up over the siege hold
//   12  IncomingBanner         (its own, inherited — see above)
//   15  the premise cards
//   20  the letterbox bars     (over the banner and the type: they are the FRAME)
//   25  the whip streaks and flash
//   30  the skip button        (never obscured, always pressable)

.intro__catch
  position: absolute
  inset: 0
  z-index: 1
  pointer-events: auto
  // Nothing to see: the battlefield IS the picture. The layer exists to stop
  // the dismissing tap reaching the board's block-placement handlers.
  background: transparent

// ─── The frame ──────────────────────────────────────────────────────────────
//
// Real bars rather than a `letterbox` filter, because the thing behind them is
// a canvas the renderer is culling against — the world outside the bars is
// still being drawn, and hiding it is the point.

.intro__bar
  position: absolute
  left: 0
  right: 0
  z-index: 20
  background: #05080f
  // A hairline of warm light where the bar meets the picture. Without it a
  // black bar over a night sky has no edge at all and the frame is invisible
  // for the first and last shots of the day cycle.
  box-shadow: 0 0 0 0 transparent

  &.is-top
    top: 0
    border-bottom: 1px solid rgba(255, 226, 170, 0.14)

  &.is-bottom
    bottom: 0
    border-top: 1px solid rgba(255, 226, 170, 0.14)

// A soft darkening at the corners. It does two jobs: it holds the eye in the
// middle of a very wide shot, and it is what makes the type legible over
// whatever the day cycle has done to the sky behind it.
.intro__vignette
  position: absolute
  inset: 0
  z-index: 5
  background: radial-gradient(ellipse at 50% 52%, rgba(4, 8, 16, 0) 44%, rgba(4, 8, 16, 0.42) 82%, rgba(4, 8, 16, 0.66) 100%)

// Tighter and deeper, and centred a little lower — the engines are on the
// ground line, not in the middle of the frame. Fades up and down on the
// director's clock (`siegeFocus`), which is why it is a second element rather
// than a state on the one above.
.intro__focus
  position: absolute
  inset: 0
  z-index: 5
  background: radial-gradient(ellipse at 50% 58%, rgba(4, 8, 16, 0) 26%, rgba(4, 8, 16, 0.4) 66%, rgba(4, 8, 16, 0.6) 100%)
  will-change: opacity

// ─── The premise ────────────────────────────────────────────────────────────

.intro__card
  position: absolute
  z-index: 15
  left: 50%
  // Under the upper bar and clear of the horizon, which sits at 64-72 % of the
  // frame across the shot list — so the type never lands on the army it is
  // describing.
  top: 17%
  width: min(90vw, 44rem)
  text-align: center
  will-change: opacity, transform

.intro__line
  display: block
  // The same fluid sizing `IncomingBanner` uses, a size down: that banner is
  // the shout at the end of the sequence and these are the voice leading up to
  // it, so they must not compete with it. Bounded at both ends because this
  // ships in 21 languages and the phone it has to fit on may be 320 px wide.
  font-size: clamp(1.05rem, 5.1vw, 2.35rem)
  line-height: 1.16
  font-weight: 800
  letter-spacing: 0.015em
  color: #fff6e2
  // Long words wrap rather than overflow, and a wrapped line breaks evenly —
  // German and Vietnamese both wrap on a portrait phone.
  overflow-wrap: anywhere
  text-wrap: balance
  // A ring of dark shadows rather than one drop shadow: a single offset leaves
  // the opposite edge of each letter on bare sky, which at midday is the same
  // near-white as the fill. Same reasoning as `IncomingBanner`.
  text-shadow: 0 0 0.09em rgba(4, 12, 24, 0.95), 0.04em 0.04em 0 rgba(4, 12, 24, 0.95), -0.04em 0.04em 0 rgba(4, 12, 24, 0.95), 0.04em -0.04em 0 rgba(4, 12, 24, 0.95), -0.04em -0.04em 0 rgba(4, 12, 24, 0.95), 0 0.1em 0.28em rgba(4, 12, 24, 0.7)

// No font-family, on purpose: `App.vue` sets the display face and, per locale,
// the CJK / Arabic / Thai / Devanagari fallbacks behind it. Naming a family
// here would quietly drop that chain for the languages most likely to lose it.

// ─── The way home ──────────────────────────────────────────────────────────

// Horizontal speed streaks. A repeating gradient rather than a set of elements,
// so the whole effect is one paint on one layer for the four frames it exists.
.intro__whip
  position: absolute
  z-index: 25
  inset: -10% 0
  background: repeating-linear-gradient(90deg, rgba(255, 246, 226, 0) 0, rgba(255, 246, 226, 0.085) 2px, rgba(255, 246, 226, 0) 5px, rgba(255, 246, 226, 0) 26px)
  mix-blend-mode: screen
  will-change: opacity

.intro__flash
  position: absolute
  z-index: 25
  inset: 0
  background: #fff6e2
  mix-blend-mode: screen
  will-change: opacity

// ─── The way out ───────────────────────────────────────────────────────────

// The bottom-right corner, on every device and in every language.
//
// PHYSICALLY right, not `inset-inline-end`, and the chevron is not mirrored
// under RTL either. That looks like an i18n bug and is the opposite: this is a
// media transport control, and transport controls map to a TIMELINE rather than
// to text direction — "forward" is to the right on a scrub bar whatever script
// the label is in, which is why neither Material nor Apple mirrors play or
// fast-forward. Every skip affordance a player has met, in any language, has
// been in this corner; moving it for Arabic would cost recognition and buy
// nothing.
//
// It has to be found in the first second by someone who did not ask for a
// cutscene, so it is a solid control rather than the quiet chip this used to
// be: a 48 px floor, full-contrast cream on a near-opaque ground, a warm rim
// and a real shadow to lift it off whatever the day cycle is doing behind it.
.intro__skip
  position: absolute
  z-index: 30
  right: max(0.9rem, env(safe-area-inset-right, 0px))
  // Above the lower cinema bar, which is 7.5 vh tall at full close and retracts
  // with `--intro-frame` — so the button rides down with it on the way out
  // instead of jumping once the bar has gone.
  bottom: calc(max(0.9rem, env(safe-area-inset-bottom, 0px)) + 7.5vh * var(--intro-frame, 1))
  display: inline-flex
  align-items: center
  gap: 0.5rem
  padding: 0.62rem 1.05rem
  // Pool-blue plastic pill with a soft sunshine rim (theme.sass).
  border: 2px solid var(--ui-rim-soft)
  border-radius: 999px
  background: rgba(31, 90, 160, 0.8)
  color: #fff6e2
  font-size: clamp(0.82rem, 3.4vw, 1.02rem)
  font-weight: 800
  letter-spacing: 0.07em
  text-transform: uppercase
  white-space: nowrap
  cursor: pointer
  pointer-events: auto
  // Lifted off the battlefield. The vignette darkens the corners, so without a
  // shadow of its own the button's edge disappears into the frame exactly where
  // it sits.
  box-shadow: 0 0 0 1.5px var(--ui-line), 0 0.3rem 1rem rgba(4, 12, 24, 0.45), inset 0 2px 0 var(--ui-gloss-soft)
  // A 48 px target at every size, whatever the label's language does to the box.
  // "Überspringen" and "O'tkazib yuborish" are both a good deal longer than
  // "Skip", so the box is allowed to grow sideways and never to shrink below the
  // thumb floor.
  min-height: 3rem
  // No 300 ms tap delay, and no double-tap zoom on the one control the player
  // may be reaching for in a hurry.
  touch-action: manipulation
  transition: border-color 140ms ease, background 140ms ease, transform 90ms ease

  svg
    width: 1.15em
    height: 1.15em
    opacity: 0.92

  &:hover,
  &:focus-visible
    border-color: var(--ui-rim)
    background: rgba(42, 108, 184, 0.9)

  &:focus-visible
    outline: 2px solid rgba(255, 246, 226, 0.75)
    outline-offset: 3px

  // Touch feedback on a control with no hover state to give any.
  &:active
    transform: scale(0.96)

// Portrait phones put the tray's own controls in this corner during play, so
// the button is nudged in a little further from the very edge — and a narrow
// screen has less room for the shadow to read against.
@media (max-width: 26rem)
  .intro__skip
    padding: 0.6rem 0.9rem
    letter-spacing: 0.05em

@media (prefers-reduced-motion: reduce)
  // The cutscene is declined outright under this preference (see
  // `shouldPlayIntro`), so nothing here should ever render. Kept as a floor in
  // case it is ever forced on for QA: no streaks, no flash.
  .intro__whip,
  .intro__flash
    display: none
</style>

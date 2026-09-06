<script setup lang="ts">
import { useI18n } from 'vue-i18n'

/**
 * ─── The one thing the game never said ──────────────────────────────────────
 *
 * A player who opens this game is shown a tower, a hand of blocks and a
 * countdown, and is told none of what any of it is FOR. The premise — monsters
 * are coming for your tower, keep it standing — was communicated only by
 * monsters eventually arriving, which is a minute too late for someone
 * deciding in five seconds whether this is a game they want to play.
 *
 * So it is said outright, once, in the largest type on the screen, over the
 * first thing they see. It is shown to first-time players ONLY — someone who
 * has survived a wave has been told by the game itself — and it leaves on
 * their first touch, because the moment they act they no longer need it.
 *
 * Two properties carry it, and both are easy to lose:
 *
 *   1. `pointer-events: none`. The banner sits over the battlefield, and the
 *      gesture that dismisses it must reach the game underneath — otherwise
 *      the first tap of the player's first session is swallowed by a label.
 *   2. It has to fit. This ships in 21 languages, and "Monsters incoming!" is
 *      three words in English, one in Japanese and a good deal longer in
 *      German and Vietnamese; the phone it has to fit on may be 320 px wide.
 *      So the size is fluid, the box is bounded, and the line is allowed to
 *      wrap rather than run off the screen — see the sizing note below.
 *
 * No font-family here on purpose: `App.vue` sets the display face and, per
 * locale, the CJK / Arabic / Thai / Devanagari fallbacks behind it. Naming a
 * family in this file would quietly drop that chain for exactly the languages
 * most likely to lose it.
 */

const { t } = useI18n()
</script>

<template lang="pug">
  div.incoming(aria-hidden="true")
    span.incoming__text {{ t('hud.monstersIncoming') }}
</template>

<style scoped lang="sass">
.incoming
  position: absolute
  // Across the top third of the play area: clear of the status strip above it
  // and of the tower itself, which is the thing it is talking about.
  top: 16%
  left: 50%
  transform: translateX(-50%)
  width: min(92vw, 46rem)
  display: flex
  justify-content: center
  text-align: center
  // The gesture that dismisses this has to reach the battlefield underneath.
  pointer-events: none
  z-index: 12

.incoming__text
  // Fluid between a floor that is still legible on a 320 px phone and a
  // ceiling that stops it becoming a wall of type on a desktop monitor. The
  // viewport term is the one doing the work; the two rem bounds are the
  // guarantee that no language and no screen can push it out of range.
  font-size: clamp(1.35rem, 7.2vw, 3.25rem)
  line-height: 1.05
  font-weight: 900
  letter-spacing: 0.01em
  text-transform: uppercase
  color: #fff6e2
  // Long words wrap instead of overflowing, and a wrapped line breaks evenly
  // rather than leaving one word stranded — German and Vietnamese both wrap on
  // a portrait phone, and a lone trailing word reads as a layout bug.
  overflow-wrap: anywhere
  text-wrap: balance
  // Readable over every sky the day cycle produces, and over the mountains,
  // the water and the tower. A ring of dark shadows rather than one drop
  // shadow: a single offset leaves the opposite edge of each letter sitting on
  // bare background, which at midday is the same near-white as the fill.
  text-shadow: 0 0 0.08em rgba(4, 12, 24, 0.95), 0.045em 0.045em 0 rgba(4, 12, 24, 0.95), -0.045em 0.045em 0 rgba(4, 12, 24, 0.95), 0.045em -0.045em 0 rgba(4, 12, 24, 0.95), -0.045em -0.045em 0 rgba(4, 12, 24, 0.95), 0 0.12em 0.3em rgba(4, 12, 24, 0.6)
  animation: incoming-in 420ms cubic-bezier(0.2, 1.3, 0.5, 1) both, incoming-breathe 2.6s ease-in-out 420ms infinite

@keyframes incoming-in
  from
    opacity: 0
    transform: scale(0.82)
  to
    opacity: 1
    transform: scale(1)

// A slow swell, not a flash: this sits under the player's eye for as long as
// they take to touch the screen, and anything faster becomes something to look
// away from.
@keyframes incoming-breathe
  0%, 100%
    transform: scale(1)
  50%
    transform: scale(1.045)

@media (prefers-reduced-motion: reduce)
  .incoming__text
    animation: none
</style>

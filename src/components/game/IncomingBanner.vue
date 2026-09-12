<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BlockTile from '@/components/game/BlockTile.vue'
import MonsterTile from '@/components/game/MonsterTile.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import { GATE_ID } from '@/game/blocks'

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
 *
 * ── The stakes, drawn ──
 *
 * "Monsters incoming" says what is coming, not what to DO about it, and the
 * 2026-09-11 blind playtest bore that out: not one of ten first-time players
 * was told the goal in words, and every one of them had to infer it. So under
 * the line, a strip that needs no language: the monster that is about to walk
 * in, marching toward the Gate, and the Gate wearing a heart — the thing whose
 * life this game is about. The heart on the Gate is the same mark the HUD puts
 * on the Gate's health bar, so the banner also teaches that bar.
 */

const { t } = useI18n()

/** Backing size of the strip's canvases, CSS px; shown via the stylesheet. */
const TILE_PX = 72
</script>

<template lang="pug">
  div.incoming(aria-hidden="true")
    span.incoming__text {{ t('hud.monstersIncoming') }}
    span.incoming__stakes
      span.incoming__monsters
        //- Rear first, so the front one paints over it.
        span.incoming__monster.is-rear
          MonsterTile(enemy="grunt" :size="TILE_PX" :phase="0.45")
        span.incoming__monster
          MonsterTile(enemy="grunt" :size="TILE_PX")
      span.incoming__march
        span.incoming__chevron
        span.incoming__chevron
        span.incoming__chevron
      span.incoming__gate
        BlockTile(:type-id="GATE_ID" :size="TILE_PX" :glyph="false")
        span.incoming__heart
          GameIcon(name="heart")
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
  flex-direction: column
  align-items: center
  gap: clamp(0.3rem, 1.6vw, 0.6rem)
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

// ─── The stakes strip ───────────────────────────────────────────────────────
//
// Sized off the same fluid term as the line above it, so a phone gets a strip
// its own width and a desktop monitor does not get a mural. A dark pill behind
// it for the same reason the text carries a ring of shadow: it sits over every
// sky the day cycle paints.
.incoming__stakes
  --tile: clamp(2.4rem, 11vw, 4rem)
  display: flex
  align-items: flex-end
  gap: clamp(0.3rem, 1.6vw, 0.7rem)
  padding: 0.2rem clamp(0.5rem, 2.4vw, 0.9rem)
  border-radius: 999px
  background: rgba(6, 12, 26, 0.55)
  box-shadow: inset 0 0 0 2px rgba(255, 246, 226, 0.12)
  animation: incoming-in 420ms cubic-bezier(0.2, 1.3, 0.5, 1) 120ms both

.incoming__monsters
  display: flex
  align-items: flex-end

.incoming__monster
  display: block
  width: var(--tile)
  height: var(--tile)
  // Walking toward the Gate: a small push forward on each stride.
  animation: incoming-advance 1.8s ease-in-out infinite

  :deep(canvas)
    width: 100% !important
    height: 100% !important

  // The second one a step behind and a size smaller — a crowd, not a clone.
  &.is-rear
    width: calc(var(--tile) * 0.78)
    height: calc(var(--tile) * 0.78)
    margin-right: calc(var(--tile) * -0.28)
    opacity: 0.85
    animation-delay: -0.9s

.incoming__march
  display: flex
  align-items: center
  gap: 0.12rem
  height: var(--tile)

// Three chevrons lighting in sequence, left to right: the direction of travel,
// without an arrow shaft that would read as "swipe".
.incoming__chevron
  display: block
  width: calc(var(--tile) * 0.2)
  height: calc(var(--tile) * 0.2)
  border-top: calc(var(--tile) * 0.07) solid #ffcf5a
  border-right: calc(var(--tile) * 0.07) solid #ffcf5a
  transform: rotate(45deg)
  filter: drop-shadow(0 1px 0 rgba(4, 12, 24, 0.9))
  opacity: 0.25
  animation: incoming-chevron 1.2s ease-in-out infinite

  &:nth-child(2)
    animation-delay: 0.2s

  &:nth-child(3)
    animation-delay: 0.4s

.incoming__gate
  position: relative
  display: block
  width: var(--tile)
  height: var(--tile)

  :deep(canvas)
    width: 100% !important
    height: 100% !important

// The Gate's life. Red, beating slowly: the one thing on the strip that is
// alive, and the thing the monsters are walking at.
.incoming__heart
  position: absolute
  right: -12%
  top: -12%
  width: 48%
  height: 48%
  color: #ff4d5e
  filter: drop-shadow(0 0 0.12rem rgba(4, 12, 24, 0.95)) drop-shadow(0 1px 0 rgba(4, 12, 24, 0.95))
  animation: incoming-beat 1.1s ease-in-out infinite

  :deep(svg)
    display: block
    width: 100%
    height: 100%

@keyframes incoming-advance
  0%, 100%
    transform: translateX(0)
  50%
    transform: translateX(8%)

@keyframes incoming-chevron
  0%, 100%
    opacity: 0.25
  40%
    opacity: 1

@keyframes incoming-beat
  0%, 60%, 100%
    transform: scale(1)
  15%
    transform: scale(1.18)
  30%
    transform: scale(1.04)
  45%
    transform: scale(1.14)

@media (prefers-reduced-motion: reduce)
  .incoming__text,
  .incoming__stakes,
  .incoming__monster,
  .incoming__heart
    animation: none

  // The direction still has to read in a still frame: all three lit.
  .incoming__chevron
    animation: none
    opacity: 0.9
</style>

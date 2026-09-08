<script setup lang="ts">
/**
 * The tech-tree glyph, painted loud on purpose.
 *
 * The version this replaces was four `currentColor` circles and four
 * connecting lines: flat line-art inside a green HUD chip, sitting in a row
 * beside a slate cog, two gold chips and a gold coin badge. At 24px it was one
 * more thin monochrome drawing in a line of thin monochrome drawings, so the
 * eye swept past it — and the consequence is not cosmetic. Players who never
 * open the tree never spend their meta currency, and players who never spend
 * churn holding a wallet full of upgrades they never saw. An unopened tech
 * tree is a retention bug wearing an icon.
 *
 * So this one does not borrow the chip's colour, it bakes its own: a violet
 * root feeding cyan branch nodes under a magenta-and-gold crown. That palette
 * is picked to sit as far from green and gold as the wheel allows, so it is
 * the one chip in the row that cannot be mistaken for its neighbours at a
 * glance.
 *
 * The node-and-edge DIAMOND is kept exactly as the old icon had it, and that
 * is deliberate on two counts. A returning player still recognises the button
 * they know — only the paint changed. And the drafts that redrew it as a trunk
 * with branching arms all failed the same way: two diagonals converging on a
 * vertical shaft is a downward ARROW, and at chip size the glyph read as
 * "collapse this panel" no matter how it was coloured.
 *
 * The motion is two sparks climbing the outer edges into the crown, which
 * flares as they land: "power flows up here, spend into the top". It is
 * `opacity` and `transform` on four hairline elements and nothing else — no
 * SVG filters, no animated `blur`, no keyframed `box-shadow`. This draws over
 * a canvas battle sim on every frame of the game, so an effect that dirties
 * the whole layer is not affordable however good it looks standing still.
 */

interface Props {
  /** Lit state — the parent passes true when there is something affordable to
   *  spend on, so the glyph can burn brighter rather than only the chip glowing. */
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false
})
</script>

<template lang="pug">
  //- Every gradient id carries the `techGlyph` prefix. Several inline SVGs are
  //- live in the document at once and gradient ids are document-global, so a
  //- bare `#core` here would silently repaint another icon (or be repainted by
  //- one) with no error anywhere. Same rule as `#tutArrowFill`.
  svg.tech-glyph(
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :class="{ 'is-active': active }"
    aria-hidden="true"
    focusable="false"
  )
    defs
      //- Bottom-to-top: violet at the root, cyan at the branches, so the shape
      //- says "energy rising" before anything has moved.
      linearGradient#techGlyphArm(x1="0" y1="1" x2="0" y2="0")
        stop(offset="0" stop-color="#7b3fe4")
        stop(offset="0.55" stop-color="#4f7bff")
        stop(offset="1" stop-color="#22e0ff")
      radialGradient#techGlyphNode(cx="0.35" cy="0.3" r="0.85")
        stop(offset="0" stop-color="#e6feff")
        stop(offset="0.45" stop-color="#3fd8f5")
        stop(offset="1" stop-color="#1668c4")
      radialGradient#techGlyphRoot(cx="0.35" cy="0.25" r="0.9")
        stop(offset="0" stop-color="#a97bff")
        stop(offset="1" stop-color="#4a1e9e")
      //- Gold core inside a magenta shell. The crown is the only warm thing on
      //- the glyph, which is what makes it read as the payoff node rather than
      //- as one more circle.
      radialGradient#techGlyphCrown(cx="0.36" cy="0.3" r="0.9")
        stop(offset="0" stop-color="#fff6cf")
        stop(offset="0.28" stop-color="#ffd166")
        stop(offset="0.52" stop-color="#ff4fd8")
        stop(offset="1" stop-color="#9b1fd8")
      //- A gradient that fades to zero alpha, NOT a blur filter: the same soft
      //- halo without paying a filter on every frame of a canvas game.
      radialGradient#techGlyphHalo(cx="0.5" cy="0.5" r="0.5")
        stop(offset="0.38" stop-color="#ff5fe0" stop-opacity="0.62")
        stop(offset="0.7" stop-color="#c04bff" stop-opacity="0.28")
        stop(offset="1" stop-color="#c04bff" stop-opacity="0")

    //- Crown halo. Wrapped in a translated group so the circle sits on its own
    //- origin, which lets CSS `scale()` pivot on the crown centre without
    //- relying on `transform-origin` / `transform-box` — browsers still
    //- disagree about those for SVG children.
    g(transform="translate(12 6.3)")
      circle.tech-glyph__halo(cx="0" cy="0" r="5.2" fill="url(#techGlyphHalo)")

    //- The four edges as ONE closed path, drawn before the nodes so every join
    //- is hidden under a node. Dark casing first, colour on top: a two-stroke
    //- edge keeps its silhouette against the light green chip AND against the
    //- dark battlefield behind a translucent HUD, which one bright stroke on
    //- its own does not.
    path(d="M12 20.3 L5.2 13.3 L12 6.3 L18.8 13.3 Z" fill="none" stroke="#0b0530" stroke-width="4.4" stroke-linejoin="round")
    path(d="M12 20.3 L5.2 13.3 L12 6.3 L18.8 13.3 Z" fill="none" stroke="url(#techGlyphArm)" stroke-width="2.4" stroke-linejoin="round")

    //- Root, then the two branch nodes, then the crown last so it overlaps
    //- everything that feeds it.
    circle(cx="12" cy="20.3" r="2.3" fill="url(#techGlyphRoot)" stroke="#0b0530" stroke-width="1.2")
    circle(cx="5.2" cy="13.3" r="2.45" fill="url(#techGlyphNode)" stroke="#0b0530" stroke-width="1.2")
    circle(cx="18.8" cy="13.3" r="2.45" fill="url(#techGlyphNode)" stroke="#0b0530" stroke-width="1.2")
    circle(cx="4.4" cy="12.5" r="0.78" fill="#f2ffff" opacity="0.7")
    circle(cx="18" cy="12.5" r="0.78" fill="#f2ffff" opacity="0.7")

    //- Affordability ring. Gold, because gold is what the player spends here,
    //- and present only while there is something to spend it on.
    circle.tech-glyph__ring(cx="12" cy="6.3" r="4.7" fill="none" stroke="#ffd166" stroke-width="0.85")
    circle(cx="12" cy="6.3" r="3.5" fill="url(#techGlyphCrown)" stroke="#0b0530" stroke-width="1.3")
    circle.tech-glyph__glint(cx="10.6" cy="4.9" r="1.1" fill="#fffdf2")

    //- The two travelling sparks: tiny, gold, and the only things that move.
    //- They start stacked on the root and split up the two outer edges.
    circle.tech-glyph__spark.is-left(cx="12" cy="20.3" r="0.9" fill="#ffdf6e")
    circle.tech-glyph__spark.is-right(cx="12" cy="20.3" r="0.9" fill="#ffdf6e")
</template>

<style scoped lang="sass">
// `FHudButton` sizes the slotted icon to 62% of the chip and its `:slotted()`
// rule outranks this one, so this is the fallback for any host that states no
// size — without it the glyph falls through to the SVG default 300x150 box.
.tech-glyph
  display: block
  width: 100%
  height: 100%

// ─── Motion ─────────────────────────────────────────────────────────────────
//
// One 2.8s timeline shared by every animated element, so the crown flares on
// the frame the sparks reach it. Staggering with `animation-delay` instead
// would drift out of sync the moment a duration is retuned.

.tech-glyph__spark
  opacity: 0
  animation: 2.8s linear infinite

.tech-glyph__spark.is-left
  animation-name: tech-glyph-spark-l

.tech-glyph__spark.is-right
  animation-name: tech-glyph-spark-r

.tech-glyph__halo
  opacity: 0.34
  animation: tech-glyph-flare 2.8s ease-in-out infinite

.tech-glyph__glint
  opacity: 0.55
  animation: tech-glyph-glint 2.8s ease-in-out infinite

// Dark by default: no gold ring until the parent says there is something the
// player can actually afford. A permanent "buy now" ring is a ring nobody
// believes the third time they see it.
.tech-glyph__ring
  opacity: 0
  transition: opacity 200ms ease-out

.tech-glyph.is-active
  .tech-glyph__ring
    opacity: 0.9

  .tech-glyph__halo
    animation-name: tech-glyph-flare-hot

  .tech-glyph__spark,
  .tech-glyph__halo,
  .tech-glyph__glint
    animation-duration: 1.9s

// The 30% stop is the branch node, i.e. the corner of the diamond. Without it
// the tween runs straight from root to crown through the middle of the glyph
// and the spark visibly leaves the edge it is supposed to be climbing.
@keyframes tech-glyph-spark-l
  0%, 5%
    opacity: 0
    transform: translate(0, 0)
  11%
    opacity: 1
  30%
    opacity: 1
    transform: translate(-6.8px, -7px)
  54%
    opacity: 1
    transform: translate(0, -14px)
  60%
    opacity: 0
    transform: translate(0, -14px)
  61%, 100%
    opacity: 0
    transform: translate(0, 0)

@keyframes tech-glyph-spark-r
  0%, 5%
    opacity: 0
    transform: translate(0, 0)
  11%
    opacity: 1
  30%
    opacity: 1
    transform: translate(6.8px, -7px)
  54%
    opacity: 1
    transform: translate(0, -14px)
  60%
    opacity: 0
    transform: translate(0, -14px)
  61%, 100%
    opacity: 0
    transform: translate(0, 0)

@keyframes tech-glyph-flare
  0%, 40%
    opacity: 0.3
    transform: scale(0.86)
  56%
    opacity: 0.8
    transform: scale(1.08)
  74%, 100%
    opacity: 0.3
    transform: scale(0.86)

// Same shape, brighter floor and ceiling: an affordable tree glows even
// between pulses, so the lit state is still legible in a frozen frame.
@keyframes tech-glyph-flare-hot
  0%, 40%
    opacity: 0.55
    transform: scale(0.95)
  56%
    opacity: 1
    transform: scale(1.14)
  74%, 100%
    opacity: 0.55
    transform: scale(0.95)

@keyframes tech-glyph-glint
  0%, 44%
    opacity: 0.5
  56%
    opacity: 1
  74%, 100%
    opacity: 0.5

@media (prefers-reduced-motion: reduce)
  // Every selector here matches the `.is-active` block above blow for blow. A
  // media query contributes NO specificity, so a bare
  // `.tech-glyph__halo { animation: none }` would lose the cascade to
  // `.tech-glyph.is-active .tech-glyph__halo { animation-name: … }` and the
  // glyph would keep pulsing in the state it pulses hardest in, for exactly
  // the player who asked it not to.
  //
  // Motion stops; the colour must not. Everything falls back to its resting
  // declaration — sparks hidden, halo and glint lit, gold ring still answering
  // `active` — because the palette is the whole reason this button gets found.
  .tech-glyph .tech-glyph__spark,
  .tech-glyph .tech-glyph__halo,
  .tech-glyph .tech-glyph__glint,
  .tech-glyph.is-active .tech-glyph__spark,
  .tech-glyph.is-active .tech-glyph__halo,
  .tech-glyph.is-active .tech-glyph__glint
    animation: none

  .tech-glyph .tech-glyph__halo
    opacity: 0.5

  .tech-glyph.is-active .tech-glyph__halo
    opacity: 0.85
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import IconGold from '@/components/icons/IconGold.vue'
import GameIcon from '@/components/icons/GameIcon.vue'

/**
 * One-tap "patch the whole tower" for the DESKTOP scene.
 *
 * Repairing block by block through `BlockInspector` costs a click, a read and a
 * confirm per wounded block. After a bad wave that is a dozen of them, and the
 * player either spends the entire build phase inside the inspector or — far
 * more often — calls the next wave on a tower they never fixed and loses to
 * damage they had the gold to undo. The parent only mounts this once at least
 * two blocks are hurt: a permanent button that is usually a no-op is a button
 * the eye stops seeing.
 *
 * **It shows the FULL bill, never what the purse can afford.** The number here
 * is what finishing the job costs, so the player can plan against it. A
 * headline that silently shrank to the wallet would teach them the tower is
 * cheaper to fix than it is, and they would call the wave believing they had
 * bought a complete repair. The press stays allowed on a partial purse — the
 * engine patches most-damaged-first, which is the order the player would pick
 * anyway — because refusing the click leaves gold sitting unspent in front of a
 * wave that is about to take the tower apart.
 *
 * The gap between "what it costs" and "what I can pay" is drawn, not written: a
 * green bar fills `spend / totalCost` of the pill. Wordless is the house rule
 * for HUD state — see `TutorialOverlay`'s doc comment for why — and a fraction
 * of a bar answers "can I afford this?" faster than a second number could, in
 * all 21 shipped locales at once and without a new key in any of them.
 *
 * `compact` exists because `.scene__bottom`'s `meta` track is measured, not
 * chosen (see its doc comment): at 700px the meta cluster has ~162px to stay on
 * ONE row, and a pill carrying "Alles reparieren" or "Починить всё" pushes past
 * that, wraps the cluster into a vertical stack and takes the width out of the
 * build tray. In that mode the word is dropped to the accessible name and the
 * fill bar becomes the ONLY signal that the purse is short, which is why it is
 * drawn in both modes rather than treated as decoration on the wide one.
 */

interface Props {
  /** Blocks damaged at all. The parent only renders this when >= 2. */
  damaged: number
  /** Gold to patch EVERYTHING — this is the number the button shows. */
  totalCost: number
  /** Gold the purse would actually spend right now, most-damaged-first. */
  spend: number
  /** How many blocks that gold would actually patch. */
  repairs: number
  /** Build phase + purse covers at least one block. */
  canRepair: boolean
  /** Drop the word label and show glyph + cost only. The bottom bar's meta
   *  track is width-tuned and a translated label overflows it. */
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})

defineEmits<{ (e: 'repair'): void }>()

const { t } = useI18n()

/**
 * Pulse threshold, derived here rather than passed in: the parent wires a fixed
 * prop list, and "badly hurt" is a presentation decision about when this button
 * is worth pulling the eye off the battlefield. Four wounded blocks is the
 * point where fixing them one at a time stops fitting inside a build phase,
 * which is exactly when the shortcut has earned a nudge.
 */
const HURT_ENOUGH_TO_NUDGE = 4

/** The purse cannot finish the job — the state the fill bar exists to show. */
const isPartial = computed<boolean>(() => props.canRepair && props.repairs < props.damaged)

/**
 * Guarded against a zero bill. The parent should never mount this with nothing
 * damaged, but `0 / 0` would paint a `NaN%` width — the bar would quietly
 * collapse to empty and tell the player they can afford none of a repair that
 * costs nothing, instead of failing where someone would notice.
 */
const fillPct = computed<number>(() => {
  if (props.totalCost <= 0) return 0
  const pct = (props.spend / props.totalCost) * 100
  return Math.max(0, Math.min(100, pct))
})

const label = computed<string>(() => t('mobile.repairAll'))
</script>

<template lang="pug">
  //- `title` is bound only in compact mode — on the labelled pill a tooltip
  //- would just repeat the word the player is already reading.
  button.repair-all(
    type="button"
    :class="{ 'is-poor': !canRepair, 'is-partial': isPartial, 'is-compact': compact, 'is-urgent': canRepair && damaged >= HURT_ENOUGH_TO_NUDGE }"
    :disabled="!canRepair"
    :aria-label="label"
    :title="compact ? label : undefined"
    @click="$emit('repair')"
  )
    //- Purely a gauge; it must never swallow the click aimed at the button.
    span.repair-all__fill(
      v-if="isPartial"
      aria-hidden="true"
      :style="{ width: fillPct + '%' }"
    )
    span.repair-all__body
      //- The same glyph as the mobile board's `.bar__repair` and the block
      //- inspector's own patch button, from the one place all three now read it
      //- from: the two layouts are one game, and the glyph is what the player
      //- recognises before they read anything.
      GameIcon.repair-all__icon(name="repair")
      span.repair-all__label(v-if="!compact") {{ label }}
      //- Compact only: a hairline between the glyph and the bill, so the two
      //- are read as two fields rather than as one expression. See the cost
      //- rule in the stylesheet for what that is defending against.
      span.repair-all__rule(v-if="compact" aria-hidden="true")
      span.repair-all__cost
        IconGold.repair-all__gold
        | {{ totalCost }}
</template>

<style scoped lang="sass">
// A wide pill, not a square chip: it carries a number and a word, and it sits
// on a row of its own above the meta cluster where width is free and height is
// not. Green is this game's "gives hit points back" colour — the same family as
// `BlockInspector`'s field-repair button, so the player meets one repair colour
// on both boards.
.repair-all
  position: relative
  // Shrink-wraps and refuses to grow, so the parent can right-align it with
  // `align-self: flex-end` and get a pill rather than a bar. Declared here
  // rather than left to the caller: stretched across the row it would read as a
  // primary action, and it is a convenience.
  display: inline-flex
  align-items: center
  justify-content: center
  flex: 0 0 auto
  align-self: flex-end
  justify-self: end
  max-width: 100%
  // Fluid with a hard floor — the narrowest supported viewport is 320x658 and
  // the pill still has to be a legal tap target there. Deliberately shorter
  // than the `FHudButton` row beneath it (which floors at 2.5rem): matching
  // heights would read as matching importance, and this row is secondary.
  min-height: 2rem
  height: clamp(2rem, 7vw, 2.5rem)
  padding: 0 clamp(0.4rem, 1.8vw, 0.7rem)
  overflow: hidden
  border: 2px solid #0f1a30
  border-radius: clamp(0.45rem, 2vw, 0.7rem)
  background-image: linear-gradient(to bottom, #67d68c, #248a4c)
  color: #fff
  cursor: pointer
  pointer-events: auto
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: transform 90ms ease-out, filter 90ms ease-out

  &:hover:not(:disabled)
    filter: brightness(1.08)

  &:active:not(:disabled)
    transform: translateY(2px) scale(0.97)

  // Partial purse: the pill goes dark so the fill has something to fill
  // AGAINST. Over the bright green base a 40% bar is invisible, and that bar is
  // the only thing telling the player this press will not finish the job.
  &.is-partial
    background-image: linear-gradient(to bottom, #2f4a3c, #1d3029)

  // Compact drops the word, so the pill loses most of its width — and with it
  // the tap area the label was providing. It buys that back in HEIGHT: a 44px
  // floor on both axes, the platform minimum, which is why the wordless form is
  // TALLER than the labelled one rather than a shrunken copy of it. That also
  // lands it in `FHudButton`'s height language, which is the row it now reads
  // as a sibling of.
  &.is-compact
    min-width: 2.75rem
    min-height: 2.75rem
    height: clamp(2.75rem, 9vw, 3.2rem)
    padding: 0 clamp(0.45rem, 2vw, 0.75rem)

  // Nothing to press: the build phase is over, or the purse cannot cover even
  // one block. Dimmed rather than removed, so the player can still read the
  // bill they are saving for — the same reasoning as the build tray's
  // unaffordable tiles.
  &.is-poor
    filter: grayscale(0.75) brightness(0.68)
    cursor: not-allowed

// Fills left to right at `spend / totalCost`. The horizontal twin of the Arrow
// Rain charge meter (`.scene__rain-fill`), which answers the same question —
// "how much of this do I have?" — with the same shape, so the idiom is learned
// once and read everywhere. It sits UNDER the label rather than tinting it: a
// bar that recoloured the text halfway through a word would be unreadable.
.repair-all__fill
  position: absolute
  left: 0
  top: 0
  bottom: 0
  background-image: linear-gradient(to right, rgba(103, 214, 140, 0.95), rgba(103, 214, 140, 0.55))
  pointer-events: none
  transition: width 260ms ease-out

.repair-all__body
  position: relative
  z-index: 1
  display: inline-flex
  align-items: center
  gap: clamp(0.2rem, 1vw, 0.4rem)
  min-width: 0

// Nested one level deeper than it needs to be, on purpose.
//
// `GameIcon`'s own scoped rule sizes `.game-icon` to fill its box, which is
// the same specificity as a bare `.repair-all__icon` — so which of the two
// sizes the glyph would come down to the order Vite happened to emit the two
// stylesheets in. A glyph that fills its flex parent instead of measuring a
// rem is not a subtle bug, and it is not one a unit test would ever catch;
// the extra selector makes the answer independent of build order.
.repair-all .repair-all__icon
  flex: 0 0 auto
  width: clamp(0.85rem, 3.4vw, 1.1rem)
  height: clamp(0.85rem, 3.4vw, 1.1rem)
  filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.45))

.repair-all__label
  min-width: 0
  overflow: hidden
  // The longest shipped label is German's "Alles reparieren". It must never
  // wrap: a second line grows the bottom bar and pushes the battlefield up on
  // exactly the screens that can least afford it.
  white-space: nowrap
  text-overflow: ellipsis
  font-weight: 900
  font-size: clamp(0.5rem, 2.2vw, 0.68rem)
  text-transform: uppercase
  line-height: 1
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.6)

.repair-all__cost
  flex: 0 0 auto
  display: inline-flex
  align-items: center
  gap: 0.15rem
  color: #ffd93c
  font-weight: 900
  font-size: clamp(0.6rem, 2.6vw, 0.8rem)
  // In compact mode this IS the button's content, so it must never break: a
  // four-figure bill wrapped mid-number reads as two prices.
  white-space: nowrap
  // Tabular figures: the bill changes on every hit the tower takes, and
  // proportional digits make the pill twitch each time it repaints.
  font-variant-numeric: tabular-nums
  text-shadow: 1px 1px 0 #000

.repair-all__gold
  flex: 0 0 auto
  width: clamp(0.7rem, 2.8vw, 0.9rem)
  height: clamp(0.7rem, 2.8vw, 0.9rem)

// ── The compact pill must not read as a reward ──────────────────────────────
//
// Measured 2026-09-15: a blind tester clicked this expecting to be GIVEN five
// gold and watched their purse fall from 9 to 4. The `repair` glyph is a cross
// knocked out of a rounded plate, and at HUD size the plate reads as button
// chrome and the cross as a plus — so a green capsule containing "cross, coin,
// 5" and no word scans as "+5", which is the universal grammar of a gift.
//
// The word cannot come back: in compact mode the meta cluster stands up, this
// pill sets `metaCol`, and `metaCol` is width taken off the build hand (see
// `bottomBarLayout`). So the fix is composition, not copy.
//
// It used to be that BOTH marks grew here, which made the plus the biggest
// thing in the button and its own price a footnote. Now the bill takes the
// growth and the glyph stays at its base size, with a hairline between them:
// the price is what the eye lands on, and a cross fielded off from a number can
// no longer bind to it as a sign. The glyph still identifies the button — it is
// simply no longer competing with the thing it is charging for.
.repair-all.is-compact
  .repair-all__cost
    font-size: clamp(0.8rem, 3.4vw, 1.02rem)

  .repair-all__gold
    width: clamp(0.85rem, 3.4vw, 1.05rem)
    height: clamp(0.85rem, 3.4vw, 1.05rem)

// Sits inside the body's flex gap, so it needs no margin of its own. Drawn from
// the button's own shadow colour rather than a new token: it is a crease in the
// pill, not a border between two components.
.repair-all__rule
  flex: 0 0 auto
  align-self: stretch
  width: 1px
  background: rgba(0, 0, 0, 0.3)
  box-shadow: 1px 0 0 rgba(255, 255, 255, 0.12)

// Deliberately quieter than `.scene__spotlight`: that one is a coach mark for a
// mechanic the player has not found yet, this is a shortcut for one they
// already know. A slow breath on the rim only — no hop, no opacity flash — so
// it is findable in peripheral vision without competing with the battlefield.
.repair-all.is-urgent:not(.is-poor)
  animation: repair-all-breathe 2.4s ease-in-out infinite

@keyframes repair-all-breathe
  0%, 100%
    box-shadow: 0 0 0 0 rgba(140, 255, 170, 0)
  50%
    box-shadow: 0 0 0 3px rgba(140, 255, 170, 0.4)

// A player who asked the OS for less motion still has to be able to find the
// button, so the nudge becomes a static rim rather than nothing at all.
@media (prefers-reduced-motion: reduce)
  .repair-all.is-urgent:not(.is-poor)
    animation: none
    box-shadow: 0 0 0 2px rgba(140, 255, 170, 0.45)

  .repair-all__fill
    transition: none
</style>

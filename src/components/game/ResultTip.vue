<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BlockTile from '@/components/game/BlockTile.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import IconGold from '@/components/icons/IconGold.vue'
import TechTreeGlyph from '@/components/icons/TechTreeGlyph.vue'
import { tipPictogram } from '@/game/deathTips'
import { tierStyle } from '@/game/tierStyle'
import { availableBlocks } from '@/use/useTowerProgress'

/**
 * The defeat screen's one line of advice, with the thing it is about beside it.
 *
 * The line stays as it was; what is new is that it no longer names a block the
 * player has to go and find. The tile next to it is the SAME tile the tray
 * deals (`BlockTile` draws both), so "banners" is the flag card they have been
 * dealt all run, and a producer they cannot build yet carries a padlock and the
 * tech tree's glyph — the pair reads "unlock it in the tree" in every language
 * the game ships in.
 *
 * The merge tip draws its rule instead of a row: two identical guns, and the
 * one they become wearing the tier-2 colour the battlefield paints it in.
 */

interface Props {
  tipId: string
}

const props = defineProps<Props>()
const { t } = useI18n()

/** Backing size of each tile canvas, CSS px; shown smaller by the stylesheet. */
const TILE_PX = 40

const picto = computed(() => tipPictogram(props.tipId))

const tiles = computed(() =>
  picto.value.blocks.map((id) => ({ id, locked: !availableBlocks.value.has(id) }))
)

const hasPicto = computed(() =>
  picto.value.merge || picto.value.tech || picto.value.gold || tiles.value.length > 0
)

/** The tier-2 colour, so the merged tile is the "green one" the board shows. */
const tier2 = tierStyle(2).hex
</script>

<template lang="pug">
  div.result-tip
    svg.result-tip__icon(viewBox="0 0 24 24" fill="currentColor" aria-hidden="true")
      path(d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z")
      rect(x="9" y="18.5" width="6" height="1.8" rx="0.9")
      rect(x="10" y="21" width="4" height="1.6" rx="0.8")

    span.result-tip__picto(v-if="hasPicto" aria-hidden="true")
      //- The rule, drawn: two of the same gun, and the one they become.
      template(v-if="picto.merge")
        span.result-tip__tile
          BlockTile(type-id="cannon" :size="TILE_PX")
        span.result-tip__op +
        span.result-tip__tile
          BlockTile(type-id="cannon" :size="TILE_PX")
        span.result-tip__op =
        span.result-tip__tile.is-merged(:style="{ '--tier': tier2 }")
          BlockTile(type-id="cannon" :size="TILE_PX")
      template(v-else)
        IconGold.result-tip__gold(v-if="picto.gold")
        span.result-tip__tech(v-if="picto.tech")
          TechTreeGlyph(:active="true")
        span.result-tip__tile(
          v-for="tile in tiles"
          :key="tile.id"
          :class="{ 'is-locked': tile.locked }"
        )
          BlockTile(:type-id="tile.id" :size="TILE_PX")
          //- Locked: a padlock on the tile, and the tree that opens it.
          template(v-if="tile.locked")
            span.result-tip__lock
              GameIcon(name="lock")
            span.result-tip__tree
              TechTreeGlyph

    span.result-tip__text {{ t(`tips.${tipId}`) }}
</template>

<style scoped lang="sass">
// ─── Death-screen tip ───────────────────────────────────────────────────────
//
// One line, and it must never be the reason a CTA moves. It is capped in height
// and scrolls internally past that cap, so a long translation cannot grow the
// dialog: German and Vietnamese run ~40 % longer than English here, which is
// exactly the width at which a "one line" tip quietly becomes three.

.result-tip
  display: flex
  align-items: center
  gap: clamp(0.35rem, 2vw, 0.6rem)
  width: 100%
  padding: clamp(0.28rem, 1.5vw, 0.5rem) clamp(0.45rem, 2.6vw, 0.8rem)
  border-radius: 0.7rem
  background: var(--ui-well-a)
  box-shadow: inset 0 0 0 2px var(--ui-rim-soft)

.result-tip__icon
  flex: 0 0 auto
  width: clamp(0.9rem, 4vw, 1.25rem)
  height: clamp(0.9rem, 4vw, 1.25rem)
  color: #ffd35c
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.6))

// The tiles ride at the tip's own type scale, so a short viewport that shrinks
// the line shrinks them with it.
.result-tip__picto
  --tile: clamp(1.45rem, 6.4vw, 2rem)
  flex: 0 0 auto
  display: inline-flex
  align-items: center
  gap: 0.2rem

.result-tip__tile
  position: relative
  flex: 0 0 auto
  display: block
  width: var(--tile)
  height: var(--tile)

  // BlockTile sizes its canvas for the backing store; the box decides.
  :deep(canvas)
    width: 100% !important
    height: 100% !important

  // The weld's product, in its tier's colour — the same ring the board draws.
  &.is-merged
    border-radius: 0.3rem
    box-shadow: 0 0 0 2px var(--tier), 0 0 8px var(--tier)

  // Not yet placeable: dimmed, so the padlock is the brightest thing on it.
  &.is-locked :deep(canvas)
    filter: grayscale(0.85) brightness(0.7)

.result-tip__op
  flex: 0 0 auto
  color: #ffe9a8
  font-weight: 900
  font-size: calc(var(--tile) * 0.55)
  line-height: 1
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.7)

.result-tip__lock
  position: absolute
  left: 50%
  top: 50%
  width: 58%
  height: 58%
  transform: translate(-50%, -50%)
  color: #ffe08a
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.8))

  :deep(svg)
    display: block
    width: 100%
    height: 100%

// The tree that holds the key, pinned to the tile's corner.
.result-tip__tree
  position: absolute
  right: -0.3rem
  bottom: -0.3rem
  width: 58%
  height: 58%
  padding: 1px
  border-radius: 999px
  background: rgba(16, 70, 38, 0.95)
  box-shadow: 0 0 0 1.5px var(--ui-line)

.result-tip__tech
  flex: 0 0 auto
  display: block
  width: calc(var(--tile) * 0.95)
  height: calc(var(--tile) * 0.95)

.result-tip__gold
  flex: 0 0 auto
  width: calc(var(--tile) * 0.85)
  height: calc(var(--tile) * 0.85)

.result-tip__text
  min-width: 0
  color: var(--ui-text-soft)
  font-weight: 700
  line-height: 1.28
  font-size: clamp(0.56rem, 2.6vw, 0.8rem)
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.55)
  // Three lines is the ceiling. Past that the tip scrolls rather than pushing
  // the buttons below it down the screen.
  max-height: 3.9em
  overflow-y: auto
  overscroll-behavior: contain

// Short viewports: the tip has the least claim on the scarce axis, so it takes
// the tightest treatment and a two-line ceiling instead of three.
@media (max-height: 640px)
  .result-tip
    padding: 0.12rem 0.5rem
    border-radius: 0.5rem
    gap: 0.35rem

  .result-tip__icon
    width: 0.85rem
    height: 0.85rem

  .result-tip__picto
    --tile: 1.3rem

  .result-tip__text
    font-size: clamp(0.5rem, 2.2vh, 0.66rem)
    max-height: 2.6em
</style>

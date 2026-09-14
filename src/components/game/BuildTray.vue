<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import IconGold from '@/components/icons/IconGold.vue'
import IconStone from '@/components/icons/IconStone.vue'
import IconWood from '@/components/icons/IconWood.vue'
import ShapeTile from '@/components/game/ShapeTile.vue'
import PointerArrow from '@/components/game/PointerArrow.vue'
import { shapeDef, shapeCost, shapeBlockTypes, shapeHasRoof, shapeBounds } from '@/game/shapes'
import {
  blockDef, ENHANCED_HP_MUL, ENHANCED_DAMAGE_MUL, ROOF_HP_MUL
} from '@/game/blocks'
import { windowHeight, windowWidth } from '@/use/useUser'

/**
 * The build hand (reference images 1 / 3).
 *
 * Four offered SHAPES rather than a full block palette. The player builds with
 * what they are dealt, which turns every placement into a small spatial puzzle
 * and stops the optimal tower from being the same tower every run.
 *
 * A shape the player cannot afford is dimmed but never hidden — "what am I
 * saving for, and how close am I" is the question the tray exists to answer.
 *
 * Layout: horizontal strip on portrait/desktop, vertical rail on a landscape
 * phone so it never eats the short axis.
 */

interface Props {
  /** Offer slot index currently armed, or null. */
  selected: number | null
  /** The four offered shape ids. */
  offers: string[]
  /** Per-slot reinforced flag — parallel to `offers`. */
  enhanced?: boolean[]
  wood: number
  stone: number
  /** Run gold — the third build currency, spent by the tech-gated pieces. */
  coins: number
  /** Whole seconds left on EACH slot's reroll cooldown; 0 means ready.
   *  Per-slot, so swapping one piece never freezes the other three. */
  rerollSeconds?: number[]
  /** Hide the per-tile swap buttons. Set while the tutorial is teaching with a
   *  specific piece, which a reroll would take out of the player's hand. */
  hideReroll?: boolean
  /**
   * The player has gone a while without building while something here is
   * affordable (`useIdleNudge`): pulse the tiles they CAN pay for. The dimmed
   * ones stay still — a nudge towards a piece they cannot buy is an
   * instruction they cannot follow.
   */
  nudge?: boolean
  /**
   * One slot the game is actively POINTING AT: a fat yellow arrow over it and
   * a hop, until the player acts.
   *
   * Distinct from `nudge`, which pulses every affordable tile in a blue ring
   * because the player has gone quiet. This one names a single tile and says
   * "that one" in the same gold the coach marks use — today, the weapon in the
   * hand after wave 1 is cleared, so a first-time player's second wave is met
   * with two guns instead of one. `null` for "pointing at nothing", which is
   * almost always.
   */
  pointSlot?: number | null
  /**
   * A won piece is waiting: slot 0 shows the scene's `gift` slot (the gift
   * tile, handed this tray's tile size) in place of its offer until the gift
   * is placed. Slot 0 is the structure lane — walls — so borrowing it takes
   * nothing from the hand the player will miss, and the wall is still dealt
   * underneath for when the gift is gone.
   */
  giftFirst?: boolean
  /**
   * The piece waiting in the gift slot, so the panel can describe it like any
   * other card.
   *
   * The gift is rendered through the `gift` SLOT — the tray never sees the
   * queue — so the one card on the row that could not explain itself was the
   * unfamiliar one: a chest prize is usually a gun the player has not unlocked
   * and cannot look up anywhere else, and hovering it did nothing while every
   * neighbour answered. Reported from play, 2026-09-12.
   */
  giftPiece?: { typeId: string; tier: number; wood: number; stone: number; coins: number; free: boolean } | null
  /**
   * Bumped by the scene the moment the reinforced hand is actually PAID for.
   *
   * The purchase had no moment of its own: on the coin-priced builds the first
   * tap previews the hand — the cards flip gold there and then — so the tap
   * that spends the coins changed nothing on screen, and the player who paid
   * reported the hand "looked identical". A counter rather than a boolean, so
   * paying twice in a row plays twice.
   */
  paidAt?: number
}

const props = withDefaults(defineProps<Props>(), {
  enhanced: () => [],
  rerollSeconds: () => [],
  hideReroll: false,
  nudge: false,
  pointSlot: null,
  giftFirst: false,
  giftPiece: null,
  paidAt: 0
})

/** True for one beat after the hand is paid for — the cards spark and their
 *  numbers pop in, so the spend has something to point at. */
const justPaid = ref(false)
let paidTimer = 0
watch(() => props.paidAt, (at) => {
  if (!at) return
  justPaid.value = true
  window.clearTimeout(paidTimer)
  paidTimer = window.setTimeout(() => { justPaid.value = false }, 1_100)
})
onUnmounted(() => window.clearTimeout(paidTimer))

/** Seconds left on `slot`, or 0 when it is ready to swap. */
const coolingFor = (slot: number): number => props.rerollSeconds[slot] ?? 0

const emit = defineEmits<{
  (e: 'select', slot: number | null): void
  (e: 'reroll', slot: number): void
}>()

const { t } = useI18n()

/** The reinforced bonus as whole percentages, derived from the constants the
 *  simulation actually applies rather than restated in prose per language. */
const enhancedHpPct = Math.round((ENHANCED_HP_MUL - 1) * 100)
const enhancedDmgPct = Math.round((ENHANCED_DAMAGE_MUL - 1) * 100)

/**
 * Thumbnail size, derived from the width the tray ACTUALLY gets.
 *
 * Sizing off the viewport was wrong: the tray is one column of a three-column
 * bottom bar, so on a 500 px phone it receives about 230 px while the viewport
 * formula sized its tiles for 500. Two of the four offers then sat outside the
 * scroll area — invisible, with nothing to suggest they were there. The hand is
 * the core decision of the build phase, so it has to fit.
 *
 * Measured rather than estimated, because the meta cluster beside it wraps and
 * changes width as buttons appear.
 *
 * The measured element is the tray's ROOT, which stretches to its grid track —
 * not the scroller, which shrink-wraps its tiles. That distinction is the whole
 * point. While the track was `auto` the two were the same number, so this
 * measured the width the hand had TAKEN rather than the width it was ALLOWED,
 * and no amount of arithmetic on a self-referential input can decide whether
 * the hand fits. (It is also why `chrome` below used to have to under-count
 * deliberately: over-count a circular estimate and it walks itself down to the
 * minimum.) `GameScene` now gives the track a share of the viewport that the
 * hand does not influence, so this reads the real budget.
 */
const rootEl = ref<HTMLElement | null>(null)
const trackW = ref(0)
let ro: ResizeObserver | null = null

onMounted(() => {
  if (!rootEl.value || typeof ResizeObserver === 'undefined') return
  ro = new ResizeObserver(([entry]) => {
    trackW.value = entry?.contentRect.width ?? 0
  })
  ro.observe(rootEl.value)
})

onUnmounted(() => {
  ro?.disconnect()
  ro = null
})

/** One CSS `clamp(<min>rem, <n>vw, <max>rem)` in pixels, at viewport width `w`.
 *  Assumes a 16px root, which is the browser default and what this app ships. */
const clampPx = (minRem: number, vw: number, maxRem: number, w: number): number =>
  Math.min(maxRem * 16, Math.max(minRem * 16, (vw / 100) * w))

/**
 * Every pixel of the tray that is NOT thumbnail, for `slots` tiles.
 *
 * Mirrors the stylesheet below — the scroller's border and padding, the gap
 * between slots, and each tile body's own border and padding. Kept honest
 * rather than approximate: now that `trackW` is a real budget instead of a
 * self-referential one, over-counting only costs a pixel or two of thumbnail,
 * while under-counting overflows the scroller and hides the last offer.
 */
const trayChrome = (w: number, slots: number): number =>
  4                                                   // .build-tray__scroll border
  + 2 * clampPx(0.12, 0.7, 0.28, w)                   // .build-tray__scroll padding
  + Math.max(0, slots - 1) * clampPx(0.12, 0.8, 0.28, w) // gap between slots
  + slots * (4 + 2 * clampPx(0.04, 0.3, 0.1, w))      // .build-tray__body border + padding

const tileSize = computed(() => {
  // A 44 px floor is the tap-target minimum; below that the tile stops being
  // reliably hittable and horizontal scrolling is the lesser evil.
  //
  // The height term is what lets the tray live in the bottom bar on a landscape
  // phone: there the short axis is the scarce one, and a hand sized off the
  // width alone would eat a third of it.
  const viewportCap = Math.min(72, windowWidth.value * 0.135, windowHeight.value * 0.14)
  const slots = Math.max(1, props.offers.length)
  if (trackW.value <= 0) return Math.round(Math.max(44, viewportCap))

  // Straight division now that `trackW` is the room available rather than the
  // room taken: whatever is left after the tray's own furniture, split between
  // the offers, and never above what the viewport can carry.
  const perSlot = (trackW.value - trayChrome(windowWidth.value, slots)) / slots
  return Math.round(Math.max(44, Math.min(viewportCap, perSlot)))
})

// ─── Where the pointer arrow goes ───────────────────────────────────────────
//
// Measured off the live tile rather than derived from `tileSize` and the gap.
// The arithmetic above already exists and would be cheaper, but it answers for
// the tray's own furniture, not for the row's actual layout — the gift borrows
// slot 0, the scroller centres itself in a track it does not fill, and on a
// narrow hand the row scrolls sideways under a fixed arrow. One rect is right
// in all of those and cannot drift out of step with the stylesheet.

const scrollEl = ref<HTMLElement | null>(null)
/** Centre of the pointed tile, px from the tray root's left edge. */
const pointerX = ref<number | null>(null)

const measurePointer = (): void => {
  const root = rootEl.value
  const slot = props.pointSlot
  if (!root || slot === null || slot === undefined) { pointerX.value = null; return }
  const tile = root.querySelector<HTMLElement>(`[data-slot="${slot}"]`)
  if (!tile) { pointerX.value = null; return }
  const a = tile.getBoundingClientRect()
  const b = root.getBoundingClientRect()
  pointerX.value = Math.round(a.left - b.left + a.width / 2)
}

// Everything that can move the tile under the arrow: which slot is pointed at,
// the hand itself, the gift borrowing slot 0, and any resize — `tileSize`
// stands in for the last, since it is derived from the observed track width.
watch(
  () => [props.pointSlot, props.offers, props.giftFirst, tileSize.value],
  () => { void nextTick(measurePointer) },
  { deep: true }
)

onMounted(() => {
  // A hand narrow enough to scroll sideways slides its tiles under an arrow
  // that is anchored outside the scroller; the rect is re-read, not guessed.
  scrollEl.value?.addEventListener('scroll', measurePointer, { passive: true })
  void nextTick(measurePointer)
})

onUnmounted(() => {
  scrollEl.value?.removeEventListener('scroll', measurePointer)
})

interface Entry {
  slot: number
  shapeId: string
  wood: number
  stone: number
  coins: number
  affordable: boolean
  roof: boolean
  enhanced: boolean
  /** Reinforced AND carrying a gun — the case where the damage bonus applies
   *  and is worth advertising on the tile itself. */
  weaponBoost: boolean
  /**
   * What the reinforced hand bought, ON the card: "+75% / +50%", or "+75%" for
   * a piece with no gun to improve.
   *
   * Numbers, not adjectives, and on every reinforced card rather than only on
   * the guns. The 2026-09-11 rerun found the purchase unreadable from either
   * side of it: D1 never tapped the button at all, so it read as a label; P10
   * saw the tick and the gold borders and never learned what they meant; and
   * P6 — who paid — reported that "the hand looked identical", because the
   * preview had already turned the cards gold on the first tap and the payment
   * added nothing a player could point at. A gold glow says "better"; it does
   * not say better by how much, and only the guns were saying even that.
   */
  boostChip: string | null
  /** Translated display name, derived from the piece's dominant block type. */
  name: string
}

const entries = computed<Entry[]>(() =>
  props.offers.map((shapeId, slot) => {
    const cost = shapeCost(shapeId)
    return {
      slot,
      shapeId,
      wood: cost.wood,
      stone: cost.stone,
      coins: cost.coins,
      affordable:
        props.wood >= cost.wood && props.stone >= cost.stone && props.coins >= cost.coins,
      roof: shapeHasRoof(shapeId),
      enhanced: props.enhanced[slot] === true,
      weaponBoost:
        props.enhanced[slot] === true
        && shapeBlockTypes(shapeId).some((id) => !!blockDef(id).weapon),
      free: false,
      boostChip: props.enhanced[slot] !== true
        ? null
        : shapeBlockTypes(shapeId).some((id) => !!blockDef(id).weapon)
          ? `+${enhancedHpPct}% / +${enhancedDmgPct}%`
          : `+${enhancedHpPct}%`,
      // Shape ids (`w1`, `cannonMount`, `sL`) are NOT block ids, so they have
      // no `blocks.names.*` entry — feeding one straight to `t()` leaked the
      // raw key into the button's accessible name. The dominant block type is
      // what the piece is actually made of, and it does have a translation.
      name: t(`blocks.names.${shapeBlockTypes(shapeId)[0] ?? 'wood'}`)
    }
  })
)

const onTile = (slot: number): void => {
  // Tapping the armed tile again disarms it — the escape hatch that stops a
  // player from being stuck in placement mode with no obvious way out.
  emit('select', props.selected === slot ? null : slot)
}

/**
 * Reroll one offer.
 *
 * The button sits ON the tile rather than beside the tray, because "swap THIS
 * piece" is the question the player is actually asking. `stop` keeps the tap
 * from also arming the tile underneath it.
 */
const onReroll = (slot: number): void => {
  if (coolingFor(slot) > 0) return
  emit('reroll', slot)
}

// ─── Info box ───────────────────────────────────────────────────────────────
//
// Hover on a pointer device, long-press on touch. It reports the exact resource
// requirement and what the piece is made of, because the thumbnail alone can't
// say "this costs 45 wood AND 45 stone".

/** An offer index, or `'gift'` for the prize standing in the first slot. */
const infoSlot = ref<number | 'gift' | null>(null)
let pressTimer: ReturnType<typeof setTimeout> | null = null

const openInfo = (slot: number | 'gift'): void => { infoSlot.value = slot }
const closeInfo = (): void => { infoSlot.value = null }

const onPressStart = (slot: number | 'gift'): void => {
  if (pressTimer) clearTimeout(pressTimer)
  pressTimer = setTimeout(() => { pressTimer = null; openInfo(slot) }, 380)
}
const onPressEnd = (): void => {
  if (pressTimer) { clearTimeout(pressTimer); pressTimer = null }
}

/**
 * The gift as a panel entry — the same shape an offer makes, so one panel
 * describes both.
 *
 * A gift is a BLOCK at a tier rather than a dealt shape, so its footprint and
 * parts are derived from the tier (one cell, or the square a weld makes) and
 * its price comes from the queue rather than from the deck.
 */
const giftEntry = computed(() => {
  const g = props.giftPiece
  if (!g) return null
  const side = g.tier >= 3 ? 2 : 1
  const d = blockDef(g.typeId)
  return {
    slot: -1,
    shapeId: '',
    name: t(`blocks.names.${g.typeId}`),
    wood: g.wood,
    stone: g.stone,
    coins: g.coins,
    affordable: props.wood >= g.wood && props.stone >= g.stone && props.coins >= g.coins,
    roof: false,
    enhanced: false,
    weaponBoost: false,
    boostChip: null,
    free: g.free,
    footprint: `${side * (g.tier === 2 ? 2 : 1)}×${side}`,
    parts: [{
      id: g.typeId,
      name: t(`blocks.names.${g.typeId}`),
      desc: t(`blocks.descriptions.${g.typeId}`),
      count: 2 ** Math.max(0, Math.min(2, g.tier - 1)),
      hp: Math.round(d.hp),
      boostedHp: false,
      dmg: d.weapon ? Math.round(d.weapon.damage) : 0,
      boostedDmg: false
    }]
  }
})

const infoEntry = computed(() => {
  if (infoSlot.value === 'gift') return giftEntry.value
  if (infoSlot.value == null) return null
  const e = entries.value[infoSlot.value]
  if (!e) return null
  const { w, h } = shapeBounds(e.shapeId)
  const roofed = shapeHasRoof(e.shapeId)
  return {
    ...e,
    // Named after its dominant block, plus the footprint — "Wood Crate 2×2"
    // is far more useful than a made-up piece name nobody will learn.
    footprint: `${w}×${h}`,
    parts: shapeBlockTypes(e.shapeId).map((id) => {
      const d = blockDef(id)
      // The numbers a REINFORCED piece will actually land with. A reinforced
      // hand is bought with a rewarded video, so what it bought has to be
      // legible on the piece itself — "extra damage" is not a number, and a
      // panel that keeps printing the base 16 while the block places at 24
      // makes the purchase look like it did nothing.
      const hpMul = (e.enhanced ? ENHANCED_HP_MUL : 1) * (roofed ? ROOF_HP_MUL : 1)
      const dmg = d.weapon
        ? Math.round(d.weapon.damage * (e.enhanced ? ENHANCED_DAMAGE_MUL : 1))
        : 0
      return {
        id,
        name: t(`blocks.names.${id}`),
        // What the block is FOR, in one line. These strings ship translated into
        // every locale and had no consumer — including `archer: "Hits fliers."`,
        // which was the only place the game ever explained anti-air.
        desc: t(`blocks.descriptions.${id}`),
        count: shapeDef(e.shapeId).cells.filter(([, , tId]) => tId === id).length,
        hp: Math.round(d.hp * hpMul),
        boostedHp: hpMul > 1,
        dmg,
        boostedDmg: e.enhanced && dmg > 0
      }
    })
  }
})
</script>

<template lang="pug">
  div.build-tray(ref="rootEl")
    //- ── Info box ────────────────────────────────────────────────────────
    Transition(name="info")
      div.build-tray__info(v-if="infoEntry")
        div.build-tray__info-head
          span.build-tray__info-name {{ infoEntry.name }}
          span.build-tray__info-size {{ infoEntry.footprint }}
        ul.build-tray__parts
          li(v-for="part in infoEntry.parts" :key="part.id")
            span.build-tray__part-n ×{{ part.count }}
            span.build-tray__part-name {{ part.name }}
            span.build-tray__part-stats
              span.build-tray__part-hp(:class="{ 'is-boosted': part.boostedHp }")
                | {{ part.hp }} {{ t('blocks.stats.hp') }}
              span.build-tray__part-dmg(v-if="part.dmg > 0" :class="{ 'is-boosted': part.boostedDmg }")
                | {{ part.dmg }} {{ t('blocks.stats.dmg') }}
            span.build-tray__part-desc(v-if="part.desc") {{ part.desc }}
        div.build-tray__info-cost
          //- A chest's first prize on a board costs nothing; every one after it
          //- is half price. Said in the panel, not only on the tile's ribbon.
          span.build-tray__cost-free(v-if="infoEntry.free") {{ t('gift.free') }}
          span.build-tray__cost-item(v-if="infoEntry.wood > 0" :class="{ 'is-short': wood < infoEntry.wood }")
            IconWood.build-tray__cost-icon
            | {{ infoEntry.wood }} {{ t('resources.wood') }}
          span.build-tray__cost-item(v-if="infoEntry.stone > 0" :class="{ 'is-short': stone < infoEntry.stone }")
            IconStone.build-tray__cost-icon
            | {{ infoEntry.stone }} {{ t('resources.stone') }}
          span.build-tray__cost-item(v-if="infoEntry.coins > 0" :class="{ 'is-short': coins < infoEntry.coins }")
            IconGold.build-tray__cost-icon
            | {{ infoEntry.coins }} {{ t('resources.gold') }}
        div.build-tray__roof-note(v-if="infoEntry.roof") {{ t('blocks.roofNote') }}
        div.build-tray__enhanced-note(v-if="infoEntry.enhanced")
          | {{ t('blocks.enhancedNote', { hp: enhancedHpPct, dmg: enhancedDmgPct }) }}

    //- The gold arrow, over the one tile the game is asking for.
    //-
    //- A sibling of the scroller rather than a child of the slot, and measured
    //- rather than nested: the scroller is `overflow-y: hidden` (it scrolls
    //- sideways on a narrow hand), so anything drawn ABOVE a tile from inside
    //- it is clipped away. The info box escapes the same box the same way.
    div.build-tray__pointer(
      v-if="pointerX !== null"
      aria-hidden="true"
      :style="{ left: pointerX + 'px' }"
    )
      PointerArrow(side="top" :length="2.2" :gap="0.25")

    div.build-tray__scroll(ref="scrollEl")
      //- `data-slot` is the tutorial's handle on ONE offer. Its first beat cuts
      //- a hole over a single tile — the free archer it deals into the weapon
      //- slot — so it needs to address that tile and no other.
      //- The gift, standing in slot 0 while it waits — at this tray's own tile
      //- size, so the hand stays one row of equal tiles.
      div.build-tray__slot(
        v-if="giftFirst"
        data-slot="gift"
        @pointerenter="openInfo('gift')"
        @pointerleave="closeInfo"
        @pointerdown="onPressStart('gift')"
        @pointerup="onPressEnd"
        @pointercancel="onPressEnd"
      )
        slot(name="gift" :size="tileSize")
      div.build-tray__slot(
        v-for="e in entries"
        v-show="!(giftFirst && e.slot === 0)"
        :key="e.slot"
        :data-slot="e.slot"
      )
        button.build-tray__tile(
          type="button"
          :class="{ 'is-selected': selected === e.slot, 'is-poor': !e.affordable, 'is-enhanced': e.enhanced, 'is-nudge': nudge && e.affordable, 'is-point': pointSlot === e.slot, 'is-paid': justPaid && e.enhanced }"
          :style="{ '--tile-w': tileSize + 'px', '--slot': e.slot }"
          :aria-label="e.name"
          @click="onTile(e.slot)"
          @pointerenter="openInfo(e.slot)"
          @pointerleave="closeInfo"
          @pointerdown="onPressStart(e.slot)"
          @pointerup="onPressEnd"
          @pointercancel="onPressEnd"
        )
          span.build-tray__shadow(aria-hidden="true")
          span.build-tray__body
            //- Reinforced pieces get a slow sweep of light so they read as
            //- "better" at a glance without needing a legend.
            span.build-tray__shine(v-if="e.enhanced" aria-hidden="true")
            ShapeTile(:shape-id="e.shapeId" :size="tileSize")
            //- Roofed pieces cap their column for good, so they are flagged on
            //- the tile itself rather than only in the info box.
            span.build-tray__roof-badge(v-if="e.roof") ⌂
            //- What the rewarded video actually bought, in numbers, on every
            //- reinforced card — HP first because every piece gets it, damage
            //- after it where there is a gun to improve. The full sentence is
            //- on the chip's title for anyone who wants the words.
            span.build-tray__dmg-badge(
              v-if="e.boostChip"
              :title="t('blocks.enhancedNote', { hp: enhancedHpPct, dmg: enhancedDmgPct })"
            ) {{ e.boostChip }}
          //- Price chips. Only the resources the shape actually costs are shown,
          //- so a wood-only piece never displays a misleading "0 stone". A piece
          //- can carry all three at once, which is why the row is width-capped
          //- to the thumbnail below rather than allowed to widen the tile.
          span.build-tray__cost
            span.build-tray__cost-item(v-if="e.wood > 0" :class="{ 'is-short': wood < e.wood }")
              i.build-tray__dot.is-wood
              | {{ e.wood }}
            span.build-tray__cost-item(v-if="e.stone > 0" :class="{ 'is-short': stone < e.stone }")
              i.build-tray__dot.is-stone
              | {{ e.stone }}
            span.build-tray__cost-item(v-if="e.coins > 0" :class="{ 'is-short': coins < e.coins }")
              i.build-tray__dot.is-gold
              | {{ e.coins }}

        //- Swap this piece for a fresh draw. Each slot carries its OWN timer,
        //- so the countdown a tile shows is the cost of the swap the player
        //- made on that tile — nothing else in the hand is charged for it.
        //-
        //- Gone entirely while the tutorial has the floor: it sits ON the lit
        //- tile, so it is inside the one hole the coach mark leaves live, and a
        //- first-time player who hits it swaps the archer they were about to be
        //- taught with for a random piece they cannot necessarily afford.
        button.build-tray__reroll(
          v-if="!hideReroll"
          type="button"
          :class="{ 'is-cooling': coolingFor(e.slot) > 0 }"
          :disabled="coolingFor(e.slot) > 0"
          :aria-label="t('blocks.reroll')"
          @click.stop="onReroll(e.slot)"
          @pointerdown.stop
          @pointerenter.stop
        )
          svg(v-if="coolingFor(e.slot) === 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round")
            path(d="M20 11a8 8 0 1 0-2.3 6.3")
            path(d="M20 4v7h-7")
          span.build-tray__reroll-timer(v-else) {{ coolingFor(e.slot) }}
</template>

<style scoped lang="sass">
.build-tray
  position: relative
  pointer-events: auto
  // Stretch to the grid track rather than shrink-wrap the tiles. This element
  // is what `tileSize` measures, and it has to report the room AVAILABLE — see
  // the note beside the ResizeObserver. The scroller inside still shrink-wraps
  // and centres, so a track wider than the hand needs (any desktop) looks
  // exactly as before.
  width: 100%
  max-width: 100%

// A zero-size anchor parked on the top edge of the hand, over the pointed
// tile's centre. `PointerArrow` hangs off it tip-down, so the tip lands just
// above the tile and the shape stands clear of the scroller that would clip it.
.build-tray__pointer
  position: absolute
  top: 0
  z-index: 6
  width: 0
  height: 0
  pointer-events: none

// Deliberately tight.
//
// The tray is the biggest object on the bottom bar and it was mostly air: an
// outer pad, a gap, a per-tile pad and a border around each thumbnail, four
// times over. None of that is doing work — the tiles are already separated by
// their own dark panels — and every pixel it took was a pixel of battlefield.
.build-tray__scroll
  display: flex
  flex-direction: row
  align-items: flex-end
  // Shrink-wrapped and centred inside the (stretched) root, so the panel hugs
  // the offers instead of spanning a track that may be much wider than them.
  width: max-content
  max-width: 100%
  margin-inline: auto
  gap: clamp(0.12rem, 0.8vw, 0.28rem)
  padding: clamp(0.12rem, 0.7vw, 0.28rem)
  border: 2px solid #0f1a30
  border-radius: clamp(0.45rem, 2.2vw, 0.8rem)
  background-image: linear-gradient(to bottom, rgba(38, 56, 96, 0.92), rgba(18, 30, 56, 0.92))
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45)
  overflow-x: auto
  overflow-y: hidden
  overscroll-behavior-x: contain
  scrollbar-width: none
  -webkit-overflow-scrolling: touch

  &::-webkit-scrollbar
    display: none

.build-tray__slot
  position: relative
  flex: 0 0 auto
  display: flex
  flex-direction: column
  align-items: center
  // Room for the reroll pip, which overhangs the tile's top-right corner.
  padding-top: 0.2rem

.build-tray__tile
  position: relative
  flex: 0 0 auto
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.06rem
  // Floors so a tile can never be squeezed into an untappable sliver.
  min-width: 2.6rem
  min-height: 2.6rem
  padding: 0
  border: 0
  background: none
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: transform 110ms ease-out, filter 110ms ease-out

  &:active
    transform: translateY(2px) scale(0.94)

  &.is-poor
    // Dimmed, NOT hidden: the player should always see what they're saving for.
    filter: grayscale(0.7) brightness(0.62)

  &.is-selected
    transform: translateY(-4px)

    .build-tray__body
      border-color: #7fe0ff
      box-shadow: 0 0 0 2px rgba(127, 224, 255, 0.55), 0 0 14px rgba(127, 224, 255, 0.6)

  // The idle nudge: a slow swell, and a ring breathing out of the thumbnail.
  // On `scale` and a pseudo-element rather than `transform` / `box-shadow`, so
  // it composes with the selected lift and the reinforced glow instead of
  // overwriting them.
  &.is-nudge
    animation: build-tray-nudge 1.1s ease-in-out infinite

    .build-tray__body::after
      content: ''
      position: absolute
      inset: -4px
      border: 2px solid rgba(127, 224, 255, 0.9)
      border-radius: clamp(0.35rem, 1.7vw, 0.6rem)
      pointer-events: none
      animation: build-tray-nudge-ring 1.1s ease-out infinite

  // The pointed-at tile: a hop rather than a pulse, in the coach marks' gold.
  //
  // A different MOTION from `is-nudge` on purpose, not just a different colour.
  // The two can be live at once (a player who has gone quiet while the arrow is
  // up), and two rings breathing in the same rhythm on the same row reads as
  // one effect with a colour bug. A tile that jumps is unambiguous.
  &.is-point
    animation: build-tray-point 0.78s ease-in-out infinite

    .build-tray__body::after
      content: ''
      position: absolute
      inset: -4px
      border: 2px solid rgba(255, 214, 80, 0.95)
      border-radius: clamp(0.35rem, 1.7vw, 0.6rem)
      box-shadow: 0 0 14px rgba(255, 200, 60, 0.5)
      pointer-events: none

@keyframes build-tray-nudge
  0%, 100%
    scale: 1
  45%
    scale: 1.08

@keyframes build-tray-point
  0%, 100%
    translate: 0 0
  40%
    translate: 0 -7px
  70%
    translate: 0 0

@keyframes build-tray-nudge-ring
  0%
    opacity: 0.95
    scale: 1
  100%
    opacity: 0
    scale: 1.26

@media (prefers-reduced-motion: reduce)
  .build-tray__tile.is-nudge
    animation: none

    .build-tray__body::after
      animation: none
      opacity: 0.85

  // The ring stays — it is the half of the cue that carries the meaning.
  .build-tray__tile.is-point
    animation: none

.build-tray__shadow
  position: absolute
  inset-inline: 0
  top: 0
  height: 100%
  transform: translateY(3px)
  border-radius: clamp(0.4rem, 2vw, 0.65rem)
  background-color: #0d1830
  pointer-events: none

.build-tray__body
  position: relative
  display: flex
  align-items: center
  justify-content: center
  padding: clamp(0.04rem, 0.3vw, 0.1rem)
  border: 2px solid #24345a
  border-radius: clamp(0.3rem, 1.5vw, 0.5rem)
  background-color: rgba(10, 18, 36, 0.85)
  transition: border-color 110ms ease-out, box-shadow 110ms ease-out

// ─── Reinforced shine ───────────────────────────────────────────────────────
//
// A single translated gradient rather than a filter animation: it composites on
// the GPU and costs nothing per frame, which matters because up to four of
// these can sit on screen for the whole build phase.
.build-tray__tile.is-enhanced .build-tray__body
  border-color: #ffd54a
  box-shadow: 0 0 0 1px rgba(255, 213, 74, 0.5), 0 0 10px rgba(255, 190, 40, 0.45)
  // The moment a tile turns gold it FLIPS: edge-on, then back with the gold
  // side up, one card after another. It is the reinforced-hand preview (the
  // button's first tap) and the payout both, so what the coins buy is shown
  // on the pieces themselves. On `rotate`, clear of the tile's `transform`.
  animation: tray-flip-gold 460ms cubic-bezier(0.3, 1.4, 0.5, 1) calc(var(--slot, 0) * 80ms) both

@keyframes tray-flip-gold
  0%, 49.9%
    border-color: #24345a
    box-shadow: none
  0%
    rotate: y 0deg
  50%
    rotate: y 90deg
  100%
    rotate: y 0deg

@media (prefers-reduced-motion: reduce)
  .build-tray__tile.is-enhanced .build-tray__body
    animation: none

.build-tray__shine
  position: absolute
  inset: 0
  border-radius: inherit
  overflow: hidden
  pointer-events: none

  &::after
    content: ''
    position: absolute
    top: -50%
    left: -60%
    width: 45%
    height: 200%
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0))
    rotate: 18deg
    animation: tray-shine 2.4s ease-in-out infinite

@keyframes tray-shine
  0%
    translate: 0 0
  55%, 100%
    translate: 380% 0

@media (prefers-reduced-motion: reduce)
  .build-tray__shine::after
    animation: none
    opacity: 0.35
    translate: 190% 0

// ─── The payment's own moment ───────────────────────────────────────────────
//
// The gold flip above belongs to the PREVIEW — on a coin-priced build it has
// already played by the time the player pays, so the tap that actually spent
// the coins had nothing to show for itself and the hand "looked identical".
// Paying now sparks each card and pops its numbers in, one after another down
// the row, so the spend lands on the pieces it bought.
.build-tray__tile.is-paid .build-tray__body
  animation: tray-paid-spark 620ms ease-out calc(var(--slot, 0) * 70ms) both

.build-tray__tile.is-paid .build-tray__dmg-badge
  animation: tray-chip-pop 520ms cubic-bezier(0.2, 1.5, 0.4, 1) calc(var(--slot, 0) * 70ms + 90ms) both

@keyframes tray-paid-spark
  0%
    box-shadow: 0 0 0 1px rgba(255, 213, 74, 0.5), 0 0 10px rgba(255, 190, 40, 0.45)
  35%
    box-shadow: 0 0 0 3px rgba(255, 243, 196, 0.95), 0 0 26px 6px rgba(255, 205, 70, 0.85)
  100%
    box-shadow: 0 0 0 1px rgba(255, 213, 74, 0.5), 0 0 10px rgba(255, 190, 40, 0.45)

@keyframes tray-chip-pop
  0%
    opacity: 0
    scale: 0.4
  60%
    opacity: 1
    scale: 1.35
  100%
    opacity: 1
    scale: 1

@media (prefers-reduced-motion: reduce)
  .build-tray__tile.is-paid .build-tray__body,
  .build-tray__tile.is-paid .build-tray__dmg-badge
    animation: none

// ─── Reroll pip ─────────────────────────────────────────────────────────────

.build-tray__reroll
  position: absolute
  top: 0
  right: 0
  z-index: 2
  display: flex
  align-items: center
  justify-content: center
  width: clamp(0.95rem, 3.8vw, 1.2rem)
  height: clamp(0.95rem, 3.8vw, 1.2rem)
  padding: 0.12rem
  border: 2px solid #0f1a30
  border-radius: 999px
  background-image: linear-gradient(to bottom, #6fd3ff, #2f8fe0)
  color: #04203a
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: transform 110ms ease-out, filter 110ms ease-out

  &:active:not(.is-cooling)
    transform: scale(0.88)

  &.is-cooling
    background-image: linear-gradient(to bottom, #4a5a7d, #2b3654)
    color: #c8d6f2
    cursor: not-allowed

  svg
    width: 100%
    height: 100%

.build-tray__reroll-timer
  font-weight: 900
  font-size: clamp(0.5rem, 2.1vw, 0.68rem)
  line-height: 1

.build-tray__dmg-badge
  position: absolute
  top: 0
  left: 0
  translate: -18% -30%
  padding: 0 0.25em
  border: 1px solid rgba(0, 0, 0, 0.7)
  border-radius: 999px
  background-image: linear-gradient(to bottom, #ffd54a, #e0951c)
  color: #2a1a02
  font-weight: 900
  font-size: 0.5rem
  line-height: 1.25
  white-space: nowrap

.build-tray__roof-badge
  position: absolute
  top: 0
  right: 0
  translate: 25% -25%
  display: flex
  align-items: center
  justify-content: center
  min-width: 1rem
  height: 1rem
  padding-inline: 0.15em
  border: 1px solid rgba(0, 0, 0, 0.6)
  border-radius: 999px
  background-color: #b8332c
  color: #fff
  font-weight: 900
  font-size: 0.6rem
  line-height: 1

// Capped to the thumbnail width, and allowed to wrap.
//
// The tile is a shrink-to-fit column, so its WIDEST child sets its width. With
// a third price chip the row overtook the body and every tile grew past the
// width `tileSize` budgeted for it — enough to push the 4th offer outside the
// scroll viewport, with nothing on screen to suggest it was there.
//
// The cap restores the invariant that a tile is sized by its body alone, so a
// three-chip piece lays out exactly like a one-chip piece. A row too long for
// the cap wraps to a second line instead, which costs a few pixels of height
// the tray has to spare rather than width it does not. This is deliberately
// unconditional: the squeeze depends on the track the tray is dealt (one
// column of the bottom bar, ~230 px on a 500 px phone), not on the viewport,
// so a media query alone would miss it.
.build-tray__cost
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  max-width: var(--tile-w, 2.6rem)
  gap: 0.1em 0.18em
  line-height: 1

.build-tray__cost-free
  padding: 0 0.5em
  border-radius: 999px
  background-color: rgba(110, 235, 140, 0.18)
  color: #8ef0a8
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.04em

.build-tray__cost-item
  display: inline-flex
  align-items: center
  gap: 0.15em
  color: #dbe6ff
  font-weight: 900
  font-size: clamp(0.5rem, 2.2vw, 0.7rem)
  text-shadow: 1px 1px 0 #000

  &.is-short
    color: #ff8f8f

// The card spells the cost out in words and has the room for real glyphs, so it
// uses the SAME wood, stone and gold the top resource bar does — the player
// reads a price here and checks their balance there, and two drawings of one
// resource make that a comparison rather than a confirmation.
.build-tray__cost-icon
  flex: 0 0 auto
  width: 1.5em
  height: 1.5em
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.45))

// The TILE chips keep the coloured dot, and deliberately.
//
// They render at 0.5em of a 0.5-0.7rem type ramp — about five pixels, and four
// on a 320 px screen. A stacked cord of logs with growth rings is mush at that
// size, where a flat colour still reads instantly; and the three-chip row is
// budgeted to the pixel against the tile's 44 px tap-target floor, which a
// glyph three times the width would blow straight through.
.build-tray__dot
  display: inline-block
  width: 0.5em
  height: 0.5em
  border-radius: 999px

  &.is-wood
    background-color: #a9682f
  &.is-stone
    background-color: #8b939d
  &.is-gold
    background-color: #ffd93c

// ─── Narrow screens ─────────────────────────────────────────────────────────
//
// At 320 px the tile is pinned to its 44 px tap-target floor, so the only
// slack left is chrome. Shrinking the dot and gaps keeps the common two-digit
// three-chip row on ONE line (≈43 px against the 44 px cap) instead of wrapping
// every gold-costed piece to two.
//
// The tray padding and body padding come down for a second reason: `perSlot`
// budgets the THUMBNAIL, but each tile also spends body padding and a 2 px
// border, so 4 × chrome + 3 × gap ran ~14 px past the measured track before the
// 44 px floor was even reached. Trimming both brings that back inside it.
@media (max-width: 24rem)
  .build-tray__cost
    gap: 0.1em 0.15em

  .build-tray__cost-item
    gap: 0.1em

  .build-tray__dot
    width: 0.4em
    height: 0.4em

  .build-tray__scroll
    gap: 0.12rem
    padding: 0.12rem

  .build-tray__body
    padding: 0.03rem

// ─── Info box ───────────────────────────────────────────────────────────────

.build-tray__info
  position: absolute
  bottom: calc(100% + 0.4rem)
  left: 50%
  translate: -50% 0
  z-index: 5
  display: flex
  flex-direction: column
  gap: 0.15rem
  width: max-content
  max-width: min(88vw, 17rem)
  padding: clamp(0.35rem, 1.8vw, 0.6rem) clamp(0.5rem, 2.4vw, 0.85rem)
  border: 2px solid #7fe0ff
  border-radius: clamp(0.5rem, 2.4vw, 0.9rem)
  background-image: linear-gradient(to bottom, rgba(28, 44, 82, 0.98), rgba(14, 24, 46, 0.98))
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.55)
  pointer-events: none
  text-align: left

.build-tray__info-head
  display: flex
  align-items: baseline
  justify-content: space-between
  gap: 0.6rem

.build-tray__info-name
  color: #fff
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.65rem, 3vw, 0.9rem)
  text-shadow: 2px 2px 0 #000

.build-tray__info-size
  color: #9fb6de
  font-weight: 900
  font-size: clamp(0.55rem, 2.4vw, 0.72rem)

.build-tray__parts
  display: flex
  flex-direction: column
  gap: 0.05rem
  margin: 0
  padding: 0
  list-style: none

  li
    // The description wraps onto its own line under the stats rather than
    // competing with them for the row — at 320 px "Hits fliers." and "16 dmg"
    // on one line means neither is legible.
    display: flex
    flex-wrap: wrap
    align-items: baseline
    gap: 0.35em
    font-size: clamp(0.55rem, 2.4vw, 0.72rem)

.build-tray__part-n
  color: #ffd93c
  font-weight: 900

.build-tray__part-name
  color: #dbe6ff
  flex: 1

.build-tray__part-desc
  flex-basis: 100%
  margin-left: 1.9em
  color: #93a6c8
  font-weight: 700
  line-height: 1.2
  font-size: 0.92em

.build-tray__part-stats
  display: inline-flex
  align-items: baseline
  gap: 0.5em
  white-space: nowrap

.build-tray__part-hp,
.build-tray__part-dmg
  color: #9fb6de

  // Above the block's printed base — a gable, or the reinforced hand. Gold
  // plus the arrow, so it survives a washed-out phone screen and colour
  // blindness alike.
  &.is-boosted
    color: #ffd93c
    font-weight: 900

    &::before
      content: '▲'
      margin-right: 0.2em
      font-size: 0.75em

// Wraps because this row spells the resources out in words — three of them in
// a locale with long nouns would otherwise stretch the box past its max-width.
.build-tray__info-cost
  display: flex
  flex-wrap: wrap
  align-items: center
  gap: 0.15rem 0.6rem
  margin-top: 0.15rem
  padding-top: 0.2rem
  border-top: 1px solid rgba(255, 255, 255, 0.14)

.build-tray__roof-note
  color: #ff9d9d
  font-size: clamp(0.5rem, 2.2vw, 0.68rem)
  line-height: 1.2

.build-tray__enhanced-note
  color: #ffd54a
  font-weight: 900
  font-size: clamp(0.5rem, 2.2vw, 0.68rem)
  line-height: 1.2

.info-enter-active, .info-leave-active
  transition: opacity 130ms ease-out, translate 130ms ease-out

.info-enter-from, .info-leave-to
  opacity: 0
  translate: -50% 0.35rem
</style>

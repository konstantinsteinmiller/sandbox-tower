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
import { trayTilePx } from '@/utils/trayFit'
import { deniedSeq, traySlotKey } from '@/use/useResourceBlink'

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
   * affordable (`useIdleNudge`): pulse ONE tile they can pay for — which one is
   * `nudgeSlot`'s decision. A dimmed tile is never the one chosen; a nudge
   * towards a piece they cannot buy is an instruction they cannot follow.
   */
  nudge?: boolean
  /**
   * One slot the game is actively POINTING AT: a fat yellow arrow over it and
   * a hop, until the player acts.
   *
   * Distinct from `nudge`, which pulses one affordable tile in a blue ring
   * because the player has gone quiet. This one names a single tile and says
   * "that one" in the same gold the coach marks use — today, the weapon in the
   * hand after wave 1 is cleared, so a first-time player's second wave is met
   * with two guns instead of one. `null` for "pointing at nothing", which is
   * almost always. It OUTRANKS the idle nudge: while this is set, nothing else
   * in the row moves.
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
  /**
   * A press LANDED on a tile — every pointer type, every press, before it is
   * known to be anything.
   *
   * Deliberately not a decision. The tray cannot tell a tap from the start of a
   * drag without owning the whole gesture, and it must not: the scene already
   * runs pan, pinch, long-press and block-carry off the same pointer stream and
   * is the only place that can arbitrate between them. So this reports the
   * press and the scene decides whether travel past its own slop threshold
   * turns it into a carried piece. The tile's own `click` still arms the slot
   * exactly as it always has, so a plain tap is untouched and a scene that
   * ignores this event loses nothing.
   */
  (e: 'drag-start', slot: number, ev: PointerEvent): void
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

const tileSize = computed(() =>
  // The arithmetic moved to `@/utils/trayFit` so the bottom bar can ask the
  // same question before it decides how much width to hand over — see
  // `bottomBarLayout`. Sizing off the viewport alone was wrong for the same
  // reason it always was: the tray is one column of a three-column bar and
  // receives far less than the viewport.
  trayTilePx(trackW.value, windowWidth.value, windowHeight.value, props.offers.length)
)

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
  // The SLOT wrapper, not the tile button inside it — both carry `data-slot`
  // now (the tile's is the drag gesture's handle) and the wrapper is the box
  // the arrow is measured against.
  const tile = root.querySelector<HTMLElement>(`.build-tray__slot[data-slot="${slot}"]`)
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

/**
 * The ONE tile the idle nudge pulses.
 *
 * It used to pulse every affordable offer at once: four boxes swelling in the
 * same rhythm with a ring breathing out of each, plus the gift breathing beside
 * them and the reinforced cards sweeping. Reported from play as the hand
 * looking like it was malfunctioning rather than like an invitation — and a
 * nudge that points at four things is not a nudge, it is the tray flashing.
 *
 * One tile says the same thing louder. The cheapest affordable offer is the one
 * that is hardest to argue with — whatever else the player cannot pay for, they
 * can pay for this — and pieces priced in GOLD are never chosen for it: gold is
 * the run's scarce currency and spending it is a decision the game should not
 * lean on a player to make while they are only idle.
 *
 * Null while the game is POINTING at a tile. The two used to be allowed to run
 * together on the argument that a hop and a pulse read as different cues; with
 * the rest of the row quietened down that is no longer worth the noise, and the
 * gold arrow is a specific instruction that should not have a second tile
 * pulsing beside it in another colour.
 */
const nudgeSlot = computed<number | null>(() => {
  if (!props.nudge || props.pointSlot != null) return null
  let best: Entry | null = null
  for (const e of entries.value) {
    // Slot 0 is `v-show`n away while the gift stands in it — pulsing a hidden
    // tile pulses nothing, and the nudge would silently do nothing at all.
    if (!e.affordable || (props.giftFirst && e.slot === 0)) continue
    // Never the armed tile. It is not idle — and since a desktop drag holds the
    // piece SELECTED for the whole carry, a nudge here would pulse under the
    // player's own cursor from the moment they picked the piece up.
    if (e.slot === props.selected) continue
    if (!best) { best = e; continue }
    const rank = (x: Entry): [number, number] => [x.coins > 0 ? 1 : 0, x.wood + x.stone]
    const [ac, ar] = rank(e)
    const [bc, br] = rank(best)
    if (ac < bc || (ac === bc && ar < br)) best = e
  }
  return best?.slot ?? null
})

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
          :class="{ 'is-selected': selected === e.slot, 'is-poor': !e.affordable, 'is-enhanced': e.enhanced, 'is-nudge': nudgeSlot === e.slot, 'is-point': pointSlot === e.slot, 'is-paid': justPaid && e.enhanced }"
          :style="{ '--tile-w': tileSize + 'px', '--slot': e.slot }"
          :data-slot="e.slot"
          :aria-label="e.name"
          @click="onTile(e.slot)"
          @pointerenter="openInfo(e.slot)"
          @pointerleave="closeInfo"
          @pointerdown="onPressStart(e.slot); emit('drag-start', e.slot, $event)"
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
            //- "Not right now": a pale wash laid OVER the thumbnail, and the
            //- last child so it covers the badges and the reinforced sweep too.
            //- Inside the body rather than on the tile, so the price chips
            //- below keep their full colour — including the red on the pile
            //- that is short, which is the answer to the question the wash
            //- raises. See `.is-poor`.
            span.build-tray__poor(v-if="!e.affordable" aria-hidden="true")
            //- "I heard you, and the answer is no." Keyed on the refusal
            //- counter so re-pressing the same tile restarts the strobe rather
            //- than landing on an element that has already played.
            span.build-tray__deny(
              v-if="deniedSeq(traySlotKey(e.slot))"
              :key="deniedSeq(traySlotKey(e.slot))"
              aria-hidden="true"
            )
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
// `build-tray__scroll` is LOAD-BEARING as a NAME, not just as a style hook.
// The scene resolves it with `closest('.build-tray__scroll')` on a touch press
// to tell a sideways scroll of the hand from a drag of a piece onto the board;
// if that selector ever returns null, every touch becomes a drag and the hand
// stops scrolling on phones. Rename or restructure this only together with
// `GameScene`'s pointer handling.
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
  // The toy box: pool-blue plastic, sunshine rim, gloss along the top.
  border: 2px solid var(--ui-rim)
  border-radius: clamp(0.45rem, 2.2vw, 0.8rem)
  background-image: linear-gradient(to bottom, var(--ui-panel-top-a), var(--ui-panel-bot-a))
  box-shadow: 0 0 0 1.5px var(--ui-line), inset 0 2px 0 var(--ui-gloss), 0 6px 14px rgba(0, 0, 0, 0.28)
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

  // ── Cannot be paid for right now ──
  //
  // A pale wash, not a dimming, and the distinction is the whole point.
  // `brightness(0.62)` made an unaffordable piece HARDER to read than an
  // affordable one — a dark tile against a dark tray, with its art sunk into
  // the background — so the player could see that something was unavailable
  // without being able to see WHAT. That is backwards: the tile they cannot
  // buy yet is precisely the one they are deciding whether to save for, and
  // deciding means recognising the gun, the buff or the producer on it.
  //
  // So the piece is pushed AWAY from the eye rather than into the dark: most of
  // its colour goes, and a light grey veil (`.build-tray__poor`) settles over
  // the thumbnail. Silhouette, glyph and colour relationships all survive it —
  // an archer still reads as an archer — while the row splits at a glance into
  // "now" and "not yet".
  //
  // The filter is on the BODY, not on the tile: the price chips under it must
  // keep their real colours, because the red on a short pile is the answer to
  // the question the wash just asked.
  &.is-poor .build-tray__body
    filter: grayscale(0.62)

  // An armed tile is STILL — a lift and a steady rim, never a loop.
  //
  // This matters more than it used to. Arming was once a discrete tap, so a
  // selected tile was a momentary state; a drag now holds the carried piece
  // selected for as long as the player's finger is down, and any animation left
  // running here would beat away under their cursor for the whole gesture.
  // `nudgeSlot` already refuses to choose this tile — this covers `is-point`,
  // which is a prop the tray does not get to overrule.
  &.is-selected
    transform: translateY(-4px)
    animation: none

    // The picked-up toy: the sunshine rim, ringed in white so it never reads
    // as the gold of a reinforced card.
    .build-tray__body
      border-color: var(--ui-rim)
      box-shadow: 0 0 0 2px #fff, 0 0 14px rgba(255, 214, 90, 0.75)

    .build-tray__body::after
      animation: none

  // The idle nudge: a slow swell, and a ring breathing out of the thumbnail.
  // On `scale` and a pseudo-element rather than `transform` / `box-shadow`, so
  // it composes with the selected lift and the reinforced glow instead of
  // overwriting them.
  // THREE swells, not `infinite`. The loop used to run until the next
  // placement, so a player who was deliberately saving — or just watching the
  // wave — had a tile breathing at them for as long as they held out, which
  // reads as a fault rather than as an invitation. The count and the 1.1 s are
  // the same numbers `useIdleNudge` holds the flag up for (`NUDGE_LOOPS`,
  // `NUDGE_LOOP_MS`); change one and change the other.
  &.is-nudge
    animation: build-tray-nudge 1.1s ease-in-out 3

    .build-tray__body::after
      content: ''
      position: absolute
      // 1px, not 4: the halo's growth has to fit in the side budget above, and
      // its starting box is part of that sum.
      inset: -1px
      border: 2px solid rgba(127, 224, 255, 0.9)
      border-radius: clamp(0.35rem, 1.7vw, 0.6rem)
      pointer-events: none
      animation: build-tray-nudge-ring 1.1s ease-out 3

  // The pointed-at tile: a hop rather than a pulse, in the coach marks' gold.
  //
  // A different MOTION from `is-nudge` on purpose, not just a different colour.
  // The two can no longer be live together — `nudgeSlot` stands down while this
  // is up — but they still have to be told apart across the seconds between
  // them, and two rings breathing in the same rhythm read as one effect with a
  // colour bug. A tile that jumps is unambiguous.
  &.is-point
    animation: build-tray-point 0.78s ease-in-out infinite

    .build-tray__body::after
      content: ''
      position: absolute
      // 2px: this ring is static, but the tile under it hops, so its distance
      // from the tile and the hop's height share one budget.
      inset: -2px
      border: 2px solid rgba(255, 214, 80, 0.95)
      border-radius: clamp(0.35rem, 1.7vw, 0.6rem)
      box-shadow: 0 0 14px rgba(255, 200, 60, 0.5)
      pointer-events: none

// ─── The attention budget ───────────────────────────────────────────────────
//
// Everything below grows or lifts a tile, and the scroller around them CLIPS:
// `.build-tray__scroll` is `overflow-x: auto` for a hand that does not fit, and
// a scroll container clips on both axes whatever `overflow-y` says. So these
// numbers are not a taste question, they are a budget, and it is small.
//
// Measured on a landscape phone (860px wide, a 67px tile — the tightest layout
// that ships): the scroller pads itself by `clamp(0.12rem, 0.7vw, 0.28rem)` =
// 4.5px, and `.build-tray__slot` adds 3.2px above the tile for the reroll pip.
// That is ~7.7px of room ABOVE a tile, ~4.5px BELOW it, and ~4.5px to the SIDE
// for the first and last tile in the row (between tiles the gap absorbs it).
//
// These were all authored well past that and were being sliced every cycle —
// the expanding ring worst of all, at 13.75px beyond the tile against a 4.5px
// side budget, which is what the player was seeing cut off. Reported from play
// with a screenshot, 2026-09-15.
//
// The rule for anything added here: a cue may leave the tile by ~4px sideways
// and ~7px upward, and no more. A swell the player can see is worth more than a
// big one they see the edge of.

@keyframes build-tray-nudge
  0%, 100%
    scale: 1
  45%
    // 67px tile → +1.3px a side. Compounds with the ring inside it, which is
    // why both had to come down rather than just one.
    scale: 1.04

@keyframes build-tray-point
  0%, 100%
    translate: 0 0
  40%
    // -4px, plus the 2px the gold ring sits outside the tile: 6px of the 7.7px
    // above. The hop still reads — it is the only tile in the row moving.
    translate: 0 -4px
  70%
    translate: 0 0

// A halo that swells and fades, not a ring that flies off the tile.
//
// At 1.26 out of a box already inset 4px this reached ~13.75px beyond a 67px
// tile — three times the side budget — so the outer two thirds of every pulse
// was sliced by the scroller and what the player saw was a ring with a flat
// edge. Inside the budget the travel is small, so the FADE carries the motion.
@keyframes build-tray-nudge-ring
  0%
    opacity: 0.95
    scale: 1
  100%
    opacity: 0
    scale: 1.05

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
  background-color: var(--ui-line)
  pointer-events: none

.build-tray__body
  position: relative
  display: flex
  align-items: center
  justify-content: center
  padding: clamp(0.04rem, 0.3vw, 0.1rem)
  // A sunk toy-box slot: a deeper pool-blue well, lit from the top edge.
  border: 2px solid var(--ui-line)
  border-radius: clamp(0.3rem, 1.5vw, 0.5rem)
  background-color: var(--ui-well-deep)
  background-image: linear-gradient(to bottom, var(--ui-well), var(--ui-well-deep))
  transition: border-color 110ms ease-out, box-shadow 110ms ease-out, filter 110ms ease-out

// The unaffordable wash. Light, so the art stays legible THROUGH it — a veil
// over the thumbnail rather than a lid on it — and `inherit` on the radius so
// it never squares off the corner it covers.
.build-tray__poor
  position: absolute
  inset: 0
  border-radius: inherit
  background-color: rgba(214, 223, 238, 0.4)
  pointer-events: none

// ─── The refusal strobe ─────────────────────────────────────────────────────
//
// The wash above is a STATE — "you cannot afford this". This is an EVENT — "the
// press you just made was refused" — and the 2026-09-15 playtest found that
// players do not infer the second from the first. One tester re-placed the same
// piece three times and read every rejection as a click that had been missed,
// because the only thing that answered was a ghost shaking under the cursor.
//
// Sits on the body with the wash, so a card that is both unaffordable and just
// refused shows the veil with the strobe over it. Never takes input.
.build-tray__deny
  position: absolute
  inset: 0
  border-radius: inherit
  pointer-events: none
  animation: build-tray-deny 460ms steps(1, end)

@keyframes build-tray-deny
  0%, 50%
    background-color: rgba(255, 46, 46, 0.5)
    box-shadow: inset 0 0 0 2px rgba(255, 90, 90, 0.95)
  25%, 75%
    background-color: rgba(255, 46, 46, 0.12)
    box-shadow: inset 0 0 0 2px rgba(255, 90, 90, 0.3)
  100%
    background-color: transparent
    box-shadow: none

// The colour is the message; the strobe rate is not. Halved, and held.
@media (prefers-reduced-motion: reduce)
  .build-tray__deny
    animation: build-tray-deny-slow 460ms steps(1, end)

  @keyframes build-tray-deny-slow
    0%, 70%
      background-color: rgba(255, 46, 46, 0.4)
      box-shadow: inset 0 0 0 2px rgba(255, 90, 90, 0.8)
    100%
      background-color: transparent
      box-shadow: none

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
    border-color: var(--ui-line)
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
    // The chip already overhangs the tile's top-left corner by a third of its
    // own height; a 1.35 overshoot on top of that put it through the scroller's
    // edge on the first slot in the row.
    scale: 1.2
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
  // Toy-orange: the secondary candy plastic, clear of the blue tray.
  border: 2px solid var(--ui-line)
  border-radius: 999px
  background-image: linear-gradient(to bottom, var(--btn-orange-from), var(--btn-orange-to))
  color: var(--ui-ink)
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: transform 110ms ease-out, filter 110ms ease-out

  &:active:not(.is-cooling)
    transform: scale(0.88)

  &.is-cooling
    background-image: linear-gradient(to bottom, var(--ui-well), var(--ui-well-deep))
    color: var(--ui-text-soft)
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
  background-color: var(--btn-red-to)
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
  color: var(--ui-text-soft)
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

  // Sand and grey-blue pebbles, matching IconWood / IconStone.
  &.is-wood
    background-color: #e3c07e
    box-shadow: inset 0 0 0 1px #8d673a
  &.is-stone
    background-color: #8594a6
    box-shadow: inset 0 0 0 1px #34404e
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
  border: 2px solid var(--ui-rim)
  border-radius: clamp(0.5rem, 2.4vw, 0.9rem)
  background-image: linear-gradient(to bottom, var(--ui-panel-top), var(--ui-panel-bot))
  box-shadow: 0 0 0 1.5px var(--ui-line), inset 0 2px 0 var(--ui-gloss), 0 8px 18px rgba(0, 0, 0, 0.35)
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
  color: var(--ui-text-soft)
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
  color: var(--ui-text)
  flex: 1

.build-tray__part-desc
  flex-basis: 100%
  margin-left: 1.9em
  color: var(--ui-text-soft)
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
  color: var(--ui-text-soft)

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
  border-top: 1px solid rgba(255, 255, 255, 0.22)

.build-tray__roof-note
  color: #ffb4a8
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

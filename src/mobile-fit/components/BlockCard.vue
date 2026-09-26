<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import IconGold from '@/components/icons/IconGold.vue'
import IconWood from '@/components/icons/IconWood.vue'
import {
  blockDef, GATE_ID, ENHANCED_DAMAGE_MUL, MAX_BLOCK_LEVEL, blockUpgradeCost,
  upgradePowerMul, mergePowerMul, tierOf
} from '@/game/blocks'
import { tierStyle } from '@/game/tierStyle'
import { damageMul, mergeDamageMul } from '@/use/useTowerProgress'
import { runCoins, towerVersion, maxHpFor, sellRefundAt } from '@/use/useTowerGame'
import type { Block } from '@/game/types'

/**
 * The phone board's card for one block: its rank, what the next rank buys,
 * and the two things a player can do to a block they already own — rank it up
 * with run gold, or sell it.
 *
 * The drop board used to have only a long-press sell bubble, and the press had
 * to land while nothing was in hand — which on a board that keeps the last
 * piece armed after every drop was almost never. So a player who dropped the
 * wrong piece could not take it back, and the run's gold had nothing to buy:
 * ranks, the desktop tower's whole gold sink, did not exist here at all. The
 * simulation always supported them on any board; this is the door to them.
 *
 * Smaller than the desktop inspector on purpose — it opens over the board, on
 * the block, with a wave running. Two stat rows (HP, and damage for a gun),
 * each with the value the next rank would give; the button that buys it; the
 * button that sells. The Gate can be ranked but never sold.
 */

interface Props {
  block: Block | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'upgrade'): void
  (e: 'sell'): void
  (e: 'close'): void
}>()

const { t } = useI18n()

/**
 * A snapshot of the live block, re-read on every tower change. The simulation
 * mutates its blocks in place — a rank bought is `level + 1` on the same
 * object — so nothing here would notice without `towerVersion`, which every
 * structural change and every upgrade bumps (see `BlockInspector`).
 */
const live = computed(() => {
  void towerVersion.value
  const b = props.block
  if (!b) return null
  return {
    typeId: b.typeId,
    c: b.c,
    r: b.r,
    maxHp: b.maxHp,
    enhanced: b.enhanced === true,
    roof: b.roof === true,
    level: b.level ?? 0,
    tier: tierOf(b.tier),
    buffMul: b.buffMul ?? 1
  }
})

const level = computed(() => live.value?.level ?? 0)
const isMax = computed(() => level.value >= MAX_BLOCK_LEVEL)
const isGate = computed(() => live.value?.typeId === GATE_ID)

const cost = computed(() =>
  live.value ? blockUpgradeCost(live.value.typeId, level.value) : Infinity
)
const affordable = computed(() => !isMax.value && runCoins.value >= cost.value)

/** The name plate wears the block's weld colour once it is merged, the same
 *  tier colour as the plate on the block itself. */
const tierVars = computed(() => {
  const tier = live.value?.tier ?? 1
  if (tier <= 1) return undefined
  const ts = tierStyle(tier)
  return { '--tier-rgb': ts.rgb.join(', ') }
})

interface Row { key: 'hp' | 'dmg'; now: number; next: number | null }

/** Effective damage at `lvl`, run through the same multipliers the gun fires
 *  with — tech, the reinforced hand, the weld and the neighbour buff. */
const dmgAt = (b: NonNullable<typeof live.value>, lvl: number): number | null => {
  const w = blockDef(b.typeId).weapon
  if (!w) return null
  const merge = b.tier > 1 ? mergePowerMul(b.tier) * mergeDamageMul.value : 1
  const enh = b.enhanced ? ENHANCED_DAMAGE_MUL : 1
  return Math.round(w.damage * damageMul.value * enh * upgradePowerMul(lvl) * merge * b.buffMul)
}

const rows = computed<Row[]>(() => {
  const b = live.value
  if (!b) return []
  const nextLevel = isMax.value ? null : b.level + 1
  const out: Row[] = [{
    key: 'hp',
    now: b.maxHp,
    next: nextLevel == null ? null : maxHpFor(b.typeId, b.enhanced, b.roof, nextLevel, b.tier)
  }]
  const now = dmgAt(b, b.level)
  if (now != null) out.push({ key: 'dmg', now, next: nextLevel == null ? null : dmgAt(b, nextLevel) })
  return out
})

const refund = computed(() => {
  const b = live.value
  return b ? sellRefundAt(b.c, b.r) : null
})
</script>

<template lang="pug">
  div.card(v-if="live" :class="{ 'is-merged': live.tier > 1 }" :style="tierVars")
    div.card__head
      span.card__name {{ t(`blocks.names.${live.typeId}`) }}
      button.card__close(type="button" :aria-label="t('close')" @click="emit('close')")
        svg(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round")
          path(d="M6 18L18 6M6 6l12 12")

    //- Rank pips, so "how much more is there" needs no reading.
    div.card__pips(aria-hidden="true")
      i.card__pip(v-for="n in MAX_BLOCK_LEVEL" :key="n" :class="{ 'is-on': n <= level }")

    dl.card__stats
      template(v-for="row in rows" :key="row.key")
        dt {{ t(`blocks.stats.${row.key}`) }}
        dd
          span {{ row.now }}
          template(v-if="row.next != null")
            span.card__arrow(aria-hidden="true") ▸
            span.card__next {{ row.next }}

    //- Enabled while it cannot be afforded, like the tray's pieces: a press on
    //- it is refused out loud (the gold pile blinks), which a disabled button
    //- could never say.
    button.card__upgrade(
      type="button"
      :class="{ 'is-poor': !affordable, 'is-max': isMax }"
      :disabled="isMax"
      @click="emit('upgrade')"
    )
      template(v-if="isMax")
        span {{ t('blocks.upgradeMax') }}
      template(v-else)
        svg.card__upgrade-icon(viewBox="0 0 24 24" fill="currentColor" aria-hidden="true")
          path(d="M12 3 21 12h-5v8h-8v-8H3z")
        span {{ t('blocks.upgrade') }}
        span.card__price
          IconGold.card__res
          | {{ cost }}

    button.card__sell(v-if="!isGate && refund" type="button" @click="emit('sell')")
      span {{ t('blocks.sell') }}
      span.card__price
        template(v-if="refund.wood > 0")
          | +{{ refund.wood }}
          IconWood.card__res
        template(v-if="refund.coins > 0")
          | +{{ refund.coins }}
          IconGold.card__res
</template>

<style scoped lang="sass">
.card
  display: flex
  flex-direction: column
  gap: 0.25rem
  width: 9.5rem
  padding: 0.35rem 0.45rem 0.45rem
  // Pool-blue plastic card, sunshine rim (theme.sass).
  border: 2px solid var(--ui-rim)
  border-radius: 0.6rem
  background-image: linear-gradient(to bottom, var(--ui-panel-top), var(--ui-panel-bot))
  box-shadow: 0 0 0 1.5px var(--ui-line), 0 8px 18px rgba(30, 50, 80, 0.45), inset 0 2px 0 var(--ui-gloss)
  pointer-events: auto

  &.is-merged
    border-color: rgb(var(--tier-rgb, 127, 224, 255))

.card__head
  display: flex
  align-items: center
  gap: 0.3rem

.card__name
  flex: 1
  min-width: 0
  color: #fff
  font-size: 0.72rem
  font-weight: 900
  text-transform: uppercase
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  text-shadow: 1px 1px 0 #000

.card__close
  flex: 0 0 auto
  display: flex
  align-items: center
  justify-content: center
  width: 1.5rem
  height: 1.5rem
  padding: 0
  border: 0
  border-radius: 0.35rem
  background-color: rgba(255, 255, 255, 0.16)
  color: #fff
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent

  svg
    width: 55%
    height: 55%

.card__pips
  display: flex
  gap: 0.2rem

.card__pip
  flex: 1
  height: 0.24rem
  border-radius: 999px
  background-color: var(--ui-well-a)

  &.is-on
    background-color: #ffd93c

.card__stats
  display: grid
  grid-template-columns: auto 1fr
  gap: 0.05rem 0.4rem
  margin: 0

  dt
    color: var(--ui-text-soft)
    font-size: 0.58rem
    text-transform: uppercase
    letter-spacing: 0.05em
    align-self: center

  dd
    margin: 0
    color: #fff
    font-size: 0.7rem
    font-weight: 900
    font-variant-numeric: tabular-nums
    text-align: right

.card__arrow
  margin: 0 0.25em
  color: var(--ui-text-soft)

// What the rank buys, in the gold every boosted number on the desktop card
// uses.
.card__next
  color: #ffd93c

.card__upgrade,
.card__sell
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: 0.15em 0.35em
  min-height: 2.25rem
  padding: 0.2rem 0.5rem
  border: 2px solid var(--ui-line)
  border-radius: 0.5rem
  box-shadow: inset 0 2px 0 var(--ui-gloss)
  color: #fff
  font-size: 0.72rem
  font-weight: 900
  text-transform: uppercase
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.6)
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent

  &:active:not(:disabled)
    translate: 0 2px
    scale: 0.97

.card__upgrade
  background-image: linear-gradient(to bottom, var(--btn-green-from), var(--btn-green-to))

  // Short of gold: grey, with the price still legible — it is the answer to
  // "how much more do I need".
  &.is-poor
    background-image: linear-gradient(to bottom, var(--ui-well), var(--ui-well-deep))

  &.is-max
    background-image: linear-gradient(to bottom, var(--btn-yellow-from), var(--btn-yellow-drop))
    cursor: default

.card__sell
  background-image: linear-gradient(to bottom, var(--btn-red-from), var(--btn-red-to))

.card__upgrade-icon
  width: 0.85em
  height: 0.85em
  flex: 0 0 auto

.card__price
  display: inline-flex
  align-items: center
  gap: 0.15em
  font-variant-numeric: tabular-nums

.card__res
  flex: 0 0 auto
  width: 1.25em
  height: 1.25em
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.45))
</style>

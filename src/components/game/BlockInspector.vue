<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BlockTile from '@/components/game/BlockTile.vue'
import IconGold from '@/components/icons/IconGold.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import IconStone from '@/components/icons/IconStone.vue'
import IconWood from '@/components/icons/IconWood.vue'
import {
  blockDef, GATE_ID, sellRefund, ENHANCED_DAMAGE_MUL, ROOF_TOP_DEFENSE_DIV,
  FORTIFY_TARGET, canFortifyType, fortifyCost,
  MAX_BLOCK_LEVEL, blockUpgradeCost, upgradePowerMul, upgradeArmorBonus,
  tierOf, mergePowerMul
} from '@/game/blocks'
import { tierStyle } from '@/game/tierStyle'
import {
  damageMul, fireRateMul, splashMul, thornsMul, armorBonus,
  buffPowerMul, economyMul, availableBlocks,
  mergeDamageMul, navalDamageMul
} from '@/use/useTowerProgress'
import {
  runCoins, towerVersion, canFortifyBlock, moveCost, cheapMovesLeft, CHEAP_MOVES,
  repairCostAt, repairWaitAt, canRepairBlock, effectiveRangeMul,
  canMoveBlock, canAffordMove, MOVE_COST
} from '@/use/useTowerGame'
import type { Block } from '@/game/types'

/**
 * Stat card for the selected block (reference image 3).
 *
 * Every number here is the EFFECTIVE one — base stats run through the player's
 * tech, the reinforced multiplier, the gable's HP bonus and whatever ranks the
 * block has been upgraded to. Showing base numbers would quietly make the tech
 * tree, the rewarded reinforced hand AND the upgrade button all feel like they
 * do nothing, because the card is where the player goes to check.
 *
 * Rows that are above the block's printed base are flagged `boosted` and drawn
 * in gold, so "why is this crate on 210 HP" answers itself.
 */

interface Props {
  block: Block | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'sell'): void
  (e: 'close'): void
  (e: 'upgrade'): void
  (e: 'fortify'): void
  (e: 'repair'): void
  (e: 'reposition'): void
}>()

const { t } = useI18n()

/**
 * Ticks the repair lockout down.
 *
 * Four times a second is enough for a countdown printed in whole seconds, and
 * it runs for the lifetime of the card rather than being started and stopped
 * per block — the card only exists while something is selected, and one 250 ms
 * timer is cheaper than the bookkeeping to avoid it.
 */
const repairTick = ref(0)
const repairTimer = window.setInterval(() => { repairTick.value++ }, 250)
onBeforeUnmount(() => window.clearInterval(repairTimer))

const def = computed(() => (props.block ? blockDef(props.block.typeId) : null))
const isGate = computed(() => props.block?.typeId === GATE_ID)

/**
 * A SNAPSHOT of the live block, re-read whenever the tower changes.
 *
 * `props.block` is a PLAIN object out of the simulation's non-reactive grid, so
 * mutating its rank or max HP fires no dependency of its own. `towerVersion` is
 * bumped by every structural change including an upgrade, which is what makes
 * this card repaint the instant the player buys a rank.
 *
 * It must return a NEW object rather than the block itself. A computed that
 * re-evaluates to the identical reference is treated as unchanged by Vue and
 * notifies nobody — which is exactly what happened: the upgrade charged the
 * gold, the simulation applied the rank, and the card kept showing the old
 * numbers because `props.block` was still the same object it always was.
 */
const live = computed(() => {
  void towerVersion.value
  const b = props.block
  if (!b) return null
  return {
    typeId: b.typeId,
    hp: b.hp,
    maxHp: b.maxHp,
    roof: b.roof === true,
    enhanced: b.enhanced === true,
    level: b.level ?? 0,
    tier: tierOf(b.tier),
    // Derived from where the block STANDS, so it has to come off the live
    // instance rather than being recomputed from its type.
    buffMul: b.buffMul ?? 1,
    buffArmor: b.buffArmor ?? 0,
    // The footprint, so the chip can say what SHAPE the weld produced —
    // a 4×1 battery and a 2×2 bastion are both tier 3 and play differently.
    w: b.w ?? 1,
    h: b.h ?? 1
  }
})

const level = computed(() => live.value?.level ?? 0)
const isMaxLevel = computed(() => level.value >= MAX_BLOCK_LEVEL)

/** The merge chip wears the weld's tier colour — the same one as its plate. */
const mergeTagStyle = computed(() => {
  const ts = tierStyle(live.value?.tier ?? 2)
  return { '--tier-rgb': ts.rgb.join(', '), '--tier-text': ts.plateTop }
})

interface Row { key: string; value: string; boosted?: boolean }

const stats = computed<Row[]>(() => {
  const d = def.value
  const b = live.value
  if (!d || !b) return []

  // A merged block's output curve, plus the forge-weld tech that rides on it.
  const merge = b.tier > 1 ? mergePowerMul(b.tier) * mergeDamageMul.value : 1
  const power = upgradePowerMul(b.level) * merge
  const enh = b.enhanced ? ENHANCED_DAMAGE_MUL : 1
  const rows: Row[] = [
    // `maxHp` already carries tech, the reinforced bonus, the gable and the
    // ranks — it is the number the simulation actually defends with.
    { key: 'hp', value: `${Math.ceil(b.hp)} / ${b.maxHp}`, boosted: b.maxHp > d.hp }
  ]

  // Armour is FLAT damage reduction and the Iron Plating node adds it to every
  // block, including ones whose printed armour is zero — so this row has to be
  // computed, never read straight off the definition.
  // Neighbouring buff blocks raise armour flatly and everything else by a
  // product — the card has to show the numbers the block is actually fighting
  // with, or a banner is a stat sheet the player cannot check.
  const armor = (d.armor ?? 0) + armorBonus.value + upgradeArmorBonus(b.level) + b.buffArmor
  if (armor > 0) rows.push({ key: 'armor', value: `${armor}`, boosted: armor > (d.armor ?? 0) })

  // A gable divides every hit that lands on top of it by three.
  if (b.roof) rows.push({ key: 'topDefense', value: `×${ROOF_TOP_DEFENSE_DIV}`, boosted: true })

  if (d.weapon) {
    // A hull is scaled by the HARBOUR's gunnery line, never the tower's damage
    // tech — `stepTurrets` picks between them on `waterOnly`, and this card has
    // to quote the same branch or a ship advertises damage it will never deal.
    const dmgMul = d.waterOnly ? navalDamageMul.value : damageMul.value
    const dmg = d.weapon.damage * dmgMul * enh * power * b.buffMul
    rows.push({ key: 'dmg', value: `${Math.round(dmg)}`, boosted: dmg > d.weapon.damage + 0.5 })
    // Cooldown shrinks as fire rate grows, so present it already divided.
    rows.push({
      key: 'cooldown',
      value: `${(d.weapon.cooldownMs / fireRateMul.value / 1000).toFixed(1)}s`,
      boosted: fireRateMul.value > 1
    })
    // Spotters are in here as well as the tech ranks: the whole point of the
    // buff is that the player can see it reach further, and a card that still
    // printed the un-buffed number would read as the purchase not working.
    rows.push({
      key: 'range',
      value: `${(d.weapon.range * effectiveRangeMul.value).toFixed(1)}`,
      boosted: effectiveRangeMul.value > 1
    })
    if (d.weapon.splash) {
      rows.push({
        key: 'splash',
        value: `${(d.weapon.splash * splashMul.value).toFixed(1)}`,
        boosted: splashMul.value > 1
      })
    }
  }
  if (d.economy) {
    const yieldMul = power * economyMul.value
    const yields: Array<[string, number | undefined]> = [
      ['yieldWood', d.economy.wood],
      ['yieldStone', d.economy.stone],
      ['yieldGold', d.economy.gold],
      ['yieldCoins', d.economy.coins]
    ]
    for (const [key, base] of yields) {
      if (!base) continue
      rows.push({ key, value: `+${Math.round(base * yieldMul)}`, boosted: yieldMul > 1 })
    }
  }

  // What this block gives its neighbours — the whole value of a buff block, and
  // invisible everywhere else on the card because it changes nothing about the
  // block itself.
  if (d.buff) {
    const mul = 1 + (d.buff.statMul - 1) * buffPowerMul.value
    rows.push({
      key: 'buff',
      value: `×${mul.toFixed(2)} · +${d.buff.armor}`,
      boosted: buffPowerMul.value > 1
    })
  }
  if (d.utility?.repairPerWave) {
    rows.push({
      key: 'repair',
      value: `+${Math.round(d.utility.repairPerWave * power)}`,
      boosted: power > 1
    })
  }
  if (d.utility?.deathExplosion) {
    rows.push({
      key: 'blast',
      value: `${Math.round(d.utility.deathExplosion.damage * power)}`,
      boosted: power > 1
    })
  }
  // Thorns is shown already multiplied, like weapon damage — the number in the
  // panel should be the number the enemy actually takes.
  if (d.utility?.thorns) {
    const thorns = d.utility.thorns * thornsMul.value * power
    rows.push({ key: 'thorns', value: `${Math.round(thorns)}`, boosted: thorns > d.utility.thorns + 0.5 })
  }
  return rows
})

const upgradeCost = computed(() =>
  live.value ? blockUpgradeCost(live.value.typeId, level.value) : Infinity
)
const canUpgrade = computed(() =>
  !isMaxLevel.value && runCoins.value >= upgradeCost.value
)

/**
 * Turning this wall into a spiked one.
 *
 * Only offered on a plain wall, and only once the spiked wall itself is
 * unlocked — the button is a shortcut past the offer deck, not past the tech
 * node. Hidden rather than disabled when it does not apply: a greyed-out
 * "Fortify" on a cannon is a question the card should never raise.
 */
const fortify = computed(() => {
  const b = props.block
  void towerVersion.value
  if (!b || !canFortifyType(b.typeId) || !availableBlocks.value.has(FORTIFY_TARGET)) return null
  return {
    cost: fortifyCost(b.typeId, (b.w ?? 1) * (b.h ?? 1)),
    can: canFortifyBlock(b.c, b.r)
  }
})

/**
 * Patching this block back to full.
 *
 * Offered only on a WOUNDED block: a Repair button on something at full health
 * is a button that can only take money. While the block is cooling down it
 * stays visible with the wait on it rather than vanishing, because a control
 * that disappears the moment you use it reads as broken.
 *
 * `towerVersion` is touched so this recomputes when the simulation mutates the
 * block in place — the inspector holds a plain, non-reactive `Block`.
 */
const repair = computed(() => {
  const b = props.block
  const l = live.value
  // The lockout is wall-clock, not structural, so `towerVersion` alone would
  // leave the countdown frozen on whatever second it was opened at.
  void repairTick.value
  if (!b || !l || l.hp >= l.maxHp) return null
  const wait = repairWaitAt(b.c, b.r)
  return {
    cost: repairCostAt(b.c, b.r),
    wait: Math.ceil(wait / 1000),
    can: canRepairBlock(b.c, b.r)
  }
})

/**
 * Picking this block up and putting it somewhere else.
 *
 * Null — the button is not rendered at all — when the block cannot be moved on
 * principle: the Gate never moves, and nothing moves mid-battle. Both of those
 * are `canMoveBlock`'s answer rather than a second copy of the rule here, so
 * the card can never offer a move the simulation would refuse.
 *
 * `can` is the PRICE, and it is deliberately a separate axis from whether the
 * button exists. "This can never be moved" and "you are short of gold" are
 * different facts — one is permanent, the other is one kill away — so the first
 * hides the control and the second greys it, exactly as Upgrade and Fortify
 * already distinguish the two.
 *
 * `towerVersion` is touched for the usual reason (the inspector holds a plain,
 * non-reactive `Block`); `canAffordMove` reads `runCoins`, which is reactive on
 * its own, so the button ungreys the moment a payout lands.
 */
/**
 * The reposition offer: what the next move costs, and whether it is affordable.
 *
 * `moveCost` rather than the base `MOVE_COST`, because the price escalates
 * after three moves in a three-wave window (see the allowance section in
 * `useTowerGame`). A card that always quoted 10 would be advertising a price
 * the simulation does not charge — the exact failure the early-call badge had.
 *
 * `cheap` is what the pips below count down: three base-price moves, then the
 * doubling. Shown BEFORE the price jumps rather than after, because "that cost
 * twice what the card said" is the one thing a spend must never be.
 */
const reposition = computed(() => {
  const b = props.block
  void towerVersion.value
  if (!b || !canMoveBlock(b.c, b.r)) return null
  return {
    cost: moveCost.value,
    can: canAffordMove(),
    cheapLeft: cheapMovesLeft.value,
    /** The price has already left the base rate. */
    surged: moveCost.value > MOVE_COST
  }
})

const refund = computed(() =>
  live.value
    ? sellRefund(live.value.typeId, live.value.w * live.value.h, live.value.level)
    : { wood: 0, stone: 0, coins: 0 }
)
</script>

<template lang="pug">
  Transition(name="inspector")
    div.inspector(v-if="block")
      span.inspector__shadow(aria-hidden="true")
      div.inspector__body
        div.inspector__head
          BlockTile(:type-id="block.typeId" :size="34")
          div.inspector__title
            span.inspector__name {{ t(`blocks.names.${block.typeId}`) }}
            span.inspector__kind {{ t(`blocks.kinds.${def?.kind}`) }}
          button.inspector__close(
            type="button"
            :aria-label="t('close')"
            @click="emit('close')"
          )
            svg(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round")
              path(d="M6 18L18 6M6 6l12 12")

        //- Why this block's numbers are above the printed base. Chips rather
        //- than prose: the card is read mid-siege with a wave incoming.
        div.inspector__tags(v-if="live?.enhanced || live?.roof || level > 0 || (live?.tier ?? 1) > 1")
          span.inspector__tag.is-merge(v-if="(live?.tier ?? 1) > 1" :style="mergeTagStyle")
            | {{ t('blocks.mergeTier', { n: live?.tier ?? 1 }) }}
            //- Pure geometry — no words to translate, and the only honest way
            //- to say "this one is long" vs "this one is square".
            span.inspector__span(v-if="(live?.w ?? 1) * (live?.h ?? 1) > 1")
              | &nbsp;· {{ live?.w }}×{{ live?.h }}
          span.inspector__tag.is-gold(v-if="live?.enhanced") {{ t('blocks.reinforced') }}
          span.inspector__tag.is-red(v-if="live?.roof") {{ t('blocks.roofed') }}
          span.inspector__tag.is-gold(v-if="level > 0")
            | {{ t('blocks.rank', { n: level, max: MAX_BLOCK_LEVEL }) }}

        dl.inspector__stats
          template(v-for="row in stats" :key="row.key")
            dt {{ t(`blocks.stats.${row.key}`) }}
            dd(:class="{ 'is-boosted': row.boosted }") {{ row.value }}

        //- First aid, above Upgrade because it is the urgent one: a rank is a
        //- plan and a patch is a wall that is about to go. Only ever rendered
        //- on a wounded block.
        button.inspector__repair(
          v-if="repair"
          type="button"
          :class="{ 'is-cooling': repair.wait > 0 }"
          :disabled="!repair.can"
          @click="emit('repair')"
        )
          GameIcon.inspector__repair-icon(name="repair")
          span {{ t('blocks.repair') }}
          span.inspector__repair-cost(v-if="repair.wait > 0")
            | {{ t('blocks.repairCooldown', { n: repair.wait }) }}
          span.inspector__repair-cost(v-else)
            IconGold.inspector__res-icon
            | {{ repair.cost }}

        //- Spend the run's gold on the tower you already have. Sits above
        //- Sell because it is the constructive half of the pair.
        button.inspector__upgrade(
          type="button"
          :class="{ 'is-maxed': isMaxLevel }"
          :disabled="!canUpgrade"
          @click="emit('upgrade')"
        )
          template(v-if="isMaxLevel")
            span {{ t('blocks.upgradeMax') }}
          template(v-else)
            svg.inspector__upgrade-icon(viewBox="0 0 24 24" fill="currentColor" aria-hidden="true")
              path(d="M12 3 21 12h-5v8h-8v-8H3z")
            span {{ t('blocks.upgrade') }}
            span.inspector__upgrade-cost
              IconGold.inspector__res-icon
              | {{ upgradeCost }}

        //- Turn a plain wall into a spiked one without waiting for the deck to
        //- deal one. Sits between Upgrade and Sell because it is the third
        //- thing a player can do to a block they already own.
        button.inspector__fortify(
          v-if="fortify"
          type="button"
          :disabled="!fortify.can"
          @click="emit('fortify')"
        )
          span {{ t('blocks.fortify') }}
          span.inspector__fortify-cost
            template(v-if="fortify.cost.wood > 0")
              span {{ fortify.cost.wood }}
              IconWood.inspector__res-icon
            template(v-if="fortify.cost.stone > 0")
              span {{ fortify.cost.stone }}
              IconStone.inspector__res-icon
            template(v-if="fortify.cost.coins > 0")
              span {{ fortify.cost.coins }}
              IconGold.inspector__res-icon

        //- Pick this block up and set it down somewhere else, for run gold.
        //-
        //- WORDLESS on purpose — glyph, price, coin and nothing else. It is the
        //- only button on this card whose meaning is a direction rather than a
        //- noun, and a four-way arrow says "anywhere" in every language the
        //- game ships in, where the verb would need a translation that fits a
        //- 9.5rem card in Vietnamese. That makes the `aria-label` the only name
        //- it has, so it is not optional: a screen reader would otherwise
        //- announce "10".
        button.inspector__move(
          v-if="reposition"
          type="button"
          :disabled="!reposition.can"
          :aria-label="t('blocks.reposition')"
          :title="t('blocks.reposition')"
          @click="emit('reposition')"
        )
          GameIcon.inspector__move-icon(name="move")
          span.inspector__move-cost(:class="{ 'is-surged': reposition.surged }")
            | {{ reposition.cost }}
            IconGold.inspector__res-icon
          //- The allowance, as pips rather than a sentence: three base-price
          //- moves per three-wave window, then the price doubles. Pips because
          //- the button has no room for words and because this is the same
          //- "how much is left" question the rank pips below already answer
          //- this way. They vanish once the allowance is spent — at that point
          //- the number itself is the message.
          span.inspector__move-pips(v-if="reposition.cheapLeft > 0" aria-hidden="true")
            i.inspector__move-pip(
              v-for="n in CHEAP_MOVES"
              :key="n"
              :class="{ 'is-on': n <= reposition.cheapLeft }"
            )

        //- Rank pips, so "how much more is there" is answerable without maths.
        div.inspector__pips(v-if="!isMaxLevel || level > 0" :aria-hidden="true")
          i.inspector__pip(
            v-for="n in MAX_BLOCK_LEVEL"
            :key="n"
            :class="{ 'is-on': n <= level }"
          )

        //- The Gate is the run's lose condition and can never be sold.
        button.inspector__sell(
          v-if="!isGate"
          type="button"
          @click="emit('sell')"
        )
          span {{ t('blocks.sell') }}
          span.inspector__sell-refund
            span(v-if="refund.wood > 0") +{{ refund.wood }}
            IconWood.inspector__res-icon(v-if="refund.wood > 0")
            span(v-if="refund.stone > 0") +{{ refund.stone }}
            IconStone.inspector__res-icon(v-if="refund.stone > 0")
            span(v-if="refund.coins > 0") +{{ refund.coins }}
            IconGold.inspector__res-icon(v-if="refund.coins > 0")
</template>

<style scoped lang="sass">
.inspector
  position: relative
  pointer-events: auto
  width: clamp(9.5rem, 46vw, 14rem)

.inspector__shadow
  position: absolute
  inset: 0
  transform: translateY(3px)
  border-radius: clamp(0.5rem, 2.4vw, 0.9rem)
  background-color: var(--ui-drop)
  box-shadow: 0 0 0 1.5px var(--ui-line)

.inspector__body
  position: relative
  display: flex
  flex-direction: column
  gap: clamp(0.25rem, 1.2vw, 0.45rem)
  padding: clamp(0.35rem, 1.8vw, 0.65rem)
  // Pool-blue plastic card, sunshine rim (theme.sass).
  border: 2px solid var(--ui-rim)
  border-radius: clamp(0.5rem, 2.4vw, 0.9rem)
  background-image: linear-gradient(to bottom, var(--ui-panel-top), var(--ui-panel-bot))
  box-shadow: 0 0 0 1.5px var(--ui-line), inset 0 2px 0 var(--ui-gloss)

.inspector__head
  display: flex
  align-items: center
  gap: clamp(0.25rem, 1.4vw, 0.5rem)

.inspector__title
  display: flex
  flex-direction: column
  min-width: 0
  flex: 1

.inspector__name
  color: #fff
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.03em
  font-size: clamp(0.7rem, 3.2vw, 0.95rem)
  line-height: 1.1
  text-shadow: 2px 2px 0 #000
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.inspector__kind
  color: var(--ui-text-soft)
  text-transform: uppercase
  letter-spacing: 0.08em
  font-size: clamp(0.45rem, 2vw, 0.6rem)

.inspector__close
  flex: 0 0 auto
  display: flex
  align-items: center
  justify-content: center
  width: 1.5rem
  height: 1.5rem
  min-width: 1.5rem
  min-height: 1.5rem
  padding: 0
  border: 0
  border-radius: 0.35rem
  background-color: var(--ui-well-a)
  color: var(--ui-text-soft)
  cursor: pointer

  svg
    width: 55%
    height: 55%

  &:active
    scale: 0.9

.inspector__stats
  display: grid
  grid-template-columns: 1fr auto
  gap: 0.1rem clamp(0.3rem, 2vw, 0.7rem)
  margin: 0

  dt
    color: var(--ui-text-soft)
    text-transform: uppercase
    letter-spacing: 0.05em
    font-size: clamp(0.45rem, 2.1vw, 0.62rem)
    text-align: left

  dd
    margin: 0
    color: #fff
    font-weight: 900
    font-variant-numeric: tabular-nums
    font-size: clamp(0.55rem, 2.5vw, 0.75rem)
    text-align: right

    // Anything above the block's printed base — tech, a gable, the reinforced
    // hand, a bought rank. The arrow carries the meaning where colour alone
    // would not (colour-blind players, washed-out phone screens in daylight).
    &.is-boosted
      color: #ffd93c

      &::before
        content: '▲'
        margin-right: 0.25em
        font-size: 0.7em
        vertical-align: 0.08em

.inspector__tags
  display: flex
  flex-wrap: wrap
  gap: 0.2rem

.inspector__tag
  padding: 0.05rem 0.35rem
  border-radius: 999px
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.04em
  font-size: clamp(0.4rem, 1.9vw, 0.55rem)

  &.is-gold
    background-color: rgba(255, 217, 60, 0.18)
    border: 1px solid rgba(255, 217, 60, 0.55)
    color: #ffd93c
  &.is-red
    background-color: rgba(229, 72, 59, 0.3)
    border: 1px solid rgba(255, 140, 128, 0.75)
    color: #ffc2bb
  // In the tier's own colour (`tierStyle`), so the chip on the card and the
  // plate on the block are visibly the same thing. The rgb triplet arrives as
  // a custom property; the pale gold is only the fallback.
  &.is-merge
    background-color: rgba(var(--tier-rgb, 255, 240, 168), 0.22)
    border: 1px solid rgba(var(--tier-rgb, 255, 240, 168), 0.8)
    color: var(--tier-text, #fff0a8)

.inspector__span
  opacity: 0.75
  font-variant-numeric: tabular-nums

.inspector__upgrade
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: 0.2em 0.35em
  min-height: 1.9rem
  margin-top: 0.15rem
  padding: 0.2rem 0.5rem
  border: 2px solid var(--ui-line)
  border-radius: 0.5rem
  background-image: linear-gradient(to bottom, var(--btn-green-from), var(--btn-green-to))
  box-shadow: inset 0 2px 0 var(--ui-gloss)
  color: #fff
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.5rem, 2.3vw, 0.7rem)
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.6)
  cursor: pointer
  -webkit-tap-highlight-color: transparent

  &:active
    translate: 0 2px
    scale: 0.97

  // Disabled means "you cannot afford this yet", which is information, so the
  // price stays legible rather than being greyed into the background.
  &:disabled
    background-image: linear-gradient(to bottom, var(--ui-well), var(--ui-well-deep))
    cursor: default
    opacity: 0.85

    &:active
      translate: 0
      scale: 1

  &.is-maxed
    background-image: linear-gradient(to bottom, #c9a227, #7a5f12)
    opacity: 1

.inspector__upgrade-icon
  width: 0.85em
  height: 0.85em
  flex: 0 0 auto

.inspector__upgrade-cost
  display: inline-flex
  align-items: center
  gap: 0.15em
  font-variant-numeric: tabular-nums

.inspector__pips
  display: flex
  justify-content: center
  gap: 0.2rem

.inspector__pip
  width: 0.85rem
  height: 0.22rem
  border-radius: 999px
  background-color: var(--ui-well-a)

  &.is-on
    background-color: #ffd93c

// Wraps: a three-resource refund (the Mint and the Bombard both return wood,
// stone AND gold) alongside a long localised verb can outrun the panel width.
// Steel-blue, between the green Upgrade and the red Sell: it is neither
// growth nor disposal, it is a conversion.
.inspector__fortify
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: 0.2em 0.4em
  min-height: 1.9rem
  margin-top: 0.25rem
  padding: 0.2rem 0.5rem
  // Toy-blue plastic: a conversion, between green growth and red disposal.
  border: 2px solid var(--ui-line)
  border-radius: 0.5rem
  background-image: linear-gradient(to bottom, var(--btn-blue-from), var(--btn-blue-to))
  box-shadow: inset 0 2px 0 var(--ui-gloss)
  color: #fff
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.5rem, 2.3vw, 0.7rem)
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.6)
  cursor: pointer
  -webkit-tap-highlight-color: transparent

  &:active:not(:disabled)
    translate: 0 2px
    scale: 0.97

  &:disabled
    background-image: linear-gradient(to bottom, var(--ui-well), var(--ui-well-deep))
    cursor: not-allowed
    opacity: 0.85

.inspector__fortify-cost
  display: inline-flex
  align-items: center
  gap: 0.15em 0.3em
  font-variant-numeric: tabular-nums

// Field repair. Green, because it is the only button on this card that gives
// hit points back — Upgrade is gold, Sell is red, and a player reaching for
// "stop this from dying" should not have to read three labels to find it.
.inspector__repair
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: 0.2em 0.4em
  min-height: 1.9rem
  margin-top: 0.35rem
  padding: 0.2rem 0.5rem
  border: 2px solid var(--ui-line)
  border-radius: 0.5rem
  background-image: linear-gradient(to bottom, var(--btn-green-from), var(--btn-green-to))
  box-shadow: inset 0 2px 0 var(--ui-gloss)
  color: #fff
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.5rem, 2.3vw, 0.7rem)
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.6)
  cursor: pointer
  -webkit-tap-highlight-color: transparent

  &:active:not(:disabled)
    translate: 0 2px
    scale: 0.97

  &:disabled
    background-image: linear-gradient(to bottom, var(--ui-well), var(--ui-well-deep))
    cursor: not-allowed
    opacity: 0.85

  // Cooling down is not the same as unaffordable: it says "not yet", so it
  // keeps a hint of its own colour rather than going fully dead.
  &.is-cooling:disabled
    background-image: linear-gradient(to bottom, #3f7a45, var(--btn-green-drop))
    opacity: 0.9

// Nested one level deeper than it needs to be, on purpose.
//
// `GameIcon`'s own scoped rule sizes `.game-icon` to fill its box, which is
// the same specificity as a bare `.inspector__repair-icon` — so which of the two
// sizes the glyph would come down to the order Vite happened to emit the two
// stylesheets in. A glyph that fills its flex parent instead of measuring a
// rem is not a subtle bug, and it is not one a unit test would ever catch;
// the extra selector makes the answer independent of build order.
.inspector__repair .inspector__repair-icon
  width: 1.1em
  height: 1.1em
  flex: 0 0 auto

.inspector__repair-cost
  display: inline-flex
  align-items: center
  gap: 0.15em 0.3em
  font-variant-numeric: tabular-nums

// Violet: the fourth action colour on a card that already spends green on
// building up (repair, upgrade), blue on hardening (fortify) and red on tearing
// down (sell). A move is none of those three — it neither adds, hardens nor
// removes — so it gets a hue of its own rather than borrowing one and reading
// as a variant of it. Violet is also the furthest thing on the wheel from the
// blue next to it at the same value, which is what keeps the two apart for a
// player with a red-green deficiency.
.inspector__move
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: 0.2em 0.4em
  min-height: 1.9rem
  margin-top: 0.25rem
  padding: 0.2rem 0.5rem
  border: 2px solid var(--ui-line)
  border-radius: 0.5rem
  background-image: linear-gradient(to bottom, #b98ae8, #6a3cab)
  box-shadow: inset 0 2px 0 var(--ui-gloss)
  color: #fff
  font-weight: 900
  font-size: clamp(0.5rem, 2.3vw, 0.7rem)
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.6)
  cursor: pointer
  -webkit-tap-highlight-color: transparent

  &:active:not(:disabled)
    translate: 0 2px
    scale: 0.97

  // Disabled here means "you cannot afford this yet", which is information, so
  // the price stays legible rather than being greyed into the background.
  &:disabled
    background-image: linear-gradient(to bottom, var(--ui-well), var(--ui-well-deep))
    cursor: not-allowed
    opacity: 0.85

// Nested a level deeper than it needs to be, for the reason spelled out over
// `.inspector__repair .inspector__repair-icon`: `GameIcon`'s own scoped rule
// sizes `.game-icon` to fill its box at the same specificity as a bare class
// here, so which of the two wins would come down to stylesheet emit order.
.inspector__move .inspector__move-icon
  width: 1.2em
  height: 1.2em
  flex: 0 0 auto

.inspector__move-cost
  display: inline-flex
  align-items: center
  gap: 0.15em 0.3em
  font-variant-numeric: tabular-nums

  // Past the base rate. Amber rather than red: the price has gone up, which is
  // a thing to notice before spending, not a refusal — `:disabled` above is
  // what says "you cannot".
  &.is-surged
    color: #ffd93c

// The allowance, three pips wide. Same vocabulary as the rank pips at the
// bottom of the card, deliberately: a player who has learned that a row of
// small lights means "how many of these you have left" does not have to learn
// it twice.
.inspector__move-pips
  display: inline-flex
  align-items: center
  gap: 0.18em
  flex: 0 0 auto

.inspector__move-pip
  width: 0.34em
  height: 0.34em
  border-radius: 50%
  background-color: rgba(12, 44, 88, 0.5)

  &.is-on
    background-color: #fff6e2
    box-shadow: 0 0 0.2em rgba(255, 246, 226, 0.7)

.inspector__sell
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: 0.2em 0.4em
  min-height: 1.9rem
  margin-top: 0.1rem
  padding: 0.2rem 0.5rem
  border: 2px solid var(--ui-line)
  border-radius: 0.5rem
  background-image: linear-gradient(to bottom, var(--btn-red-from), var(--btn-red-to))
  box-shadow: inset 0 2px 0 var(--ui-gloss)
  color: #fff
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.5rem, 2.3vw, 0.7rem)
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.6)
  cursor: pointer
  -webkit-tap-highlight-color: transparent

  &:active
    translate: 0 2px
    scale: 0.97

.inspector__sell-refund
  display: inline-flex
  align-items: center
  gap: 0.15em

// The same wood, stone and gold the top resource bar draws. Every number on
// this card is a price or a payout the player will go and check against that
// bar, so the two have to be reading from one set of glyphs.
.inspector__res-icon
  flex: 0 0 auto
  width: 1.35em
  height: 1.35em
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.45))

.inspector-enter-active, .inspector-leave-active
  transition: opacity 160ms ease-out, translate 160ms ease-out

.inspector-enter-from, .inspector-leave-to
  opacity: 0
  translate: -0.5rem 0
</style>

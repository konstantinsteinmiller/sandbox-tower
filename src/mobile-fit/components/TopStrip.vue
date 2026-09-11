<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import IconWood from '@/components/icons/IconWood.vue'
import IconGold from '@/components/icons/IconGold.vue'
import CoinBadge from '@/components/organisms/CoinBadge.vue'
import { resourceBlink, isBlinking } from '@/use/useResourceBlink'

/**
 * The one-row HUD strip at the top of the portrait board.
 *
 * Wave on the left, the run's two currencies and the wallet on the right, and
 * the CENTRE left empty on purpose: Poki's navigation pill sits top-centre on
 * phones, and a strip that put a number under it would lose that number on
 * every Poki session.
 *
 * There is deliberately NO Gate health bar here. It used to sit beside the
 * wave, and during a battle the wave group grows an enemy count, which pushed
 * the bar into the materials icon — on a 360 px phone there is not enough row
 * to hold both. The Gate already carries a health bar on the block itself,
 * which is where the player is looking when it matters, so the duplicate is
 * what gives way.
 */

interface Props {
  wave: number
  bestWave: number
  /** Wood — the one materials pile once stone is folded into it. */
  materials: number
  gold: number
  phase: 'build' | 'battle' | 'defeat'
  enemiesLeft: number
}

const props = defineProps<Props>()
const { t } = useI18n()

const isRecord = computed(() => props.wave > 0 && props.wave >= props.bestWave)

/**
 * The refusal blink (`useResourceBlink`). This board folds stone into wood, so
 * a refused piece is only ever short of `wood` — the materials pile — or of
 * `coins`, the gold; the sim never names a `stone` this strip has no icon for.
 * Keyed on the refusal counter so a second refusal restarts the blink.
 */
const blink = computed(() => resourceBlink.value)
const denied = computed(() => {
  void resourceBlink.value
  return { wood: isBlinking('wood'), coins: isBlinking('coins') }
})

const coinBadgeRef = ref<InstanceType<typeof CoinBadge> | null>(null)
/** The wallet's element, for coin-fly animations to land on. */
const coinEl = computed<HTMLElement | null>(() => coinBadgeRef.value?.rootEl ?? null)
defineExpose({ coinEl })
</script>

<template lang="pug">
  div.strip
    div.strip__left
      div.strip__wave
        span.strip__label {{ t('hud.wave') }}
        span.strip__value(:class="{ 'is-record': isRecord }") {{ wave }}
        template(v-if="phase === 'battle'")
          span.strip__sep ·
          span.strip__value.is-enemies {{ enemiesLeft }}
    div.strip__right
      span.strip__res
        span.res-deny(:key="'w' + blink.wood.n" :class="{ 'is-denied': denied.wood }" data-res="wood")
          IconWood.strip__icon.res-deny__icon
          span.strip__num.res-deny__value {{ materials }}
      span.strip__res
        span.res-deny(:key="'c' + blink.coins.n" :class="{ 'is-denied': denied.coins }" data-res="coins")
          IconGold.strip__icon.res-deny__icon
          span.strip__num.is-gold.res-deny__value {{ gold }}
      CoinBadge.strip__wallet(ref="coinBadgeRef")
</template>

<style scoped lang="sass">
@use '../../components/game/denyBlink'

.strip
  display: flex
  align-items: center
  justify-content: space-between
  gap: 0.5rem
  min-height: 2.75rem
  padding: calc(0.25rem + env(safe-area-inset-top, 0px)) 0.5rem 0.25rem
  background-image: linear-gradient(to bottom, rgba(14, 22, 44, 0.94), rgba(14, 22, 44, 0.7))
  border-bottom: 2px solid #0f1a30
  pointer-events: auto

.strip__left,
.strip__right
  display: flex
  align-items: center
  gap: 0.45rem
  min-width: 0

.strip__wave
  display: flex
  align-items: baseline
  gap: 0.25rem
  white-space: nowrap

.strip__label
  color: #9fb6de
  font-size: 0.6rem
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.04em

.strip__value
  color: #fff
  font-size: 1.05rem
  font-weight: 900
  line-height: 1
  text-shadow: 2px 2px 0 #000

  &.is-record
    color: #ffd93c

  &.is-enemies
    color: #ff9d9d
    font-size: 0.9rem

.strip__sep
  color: #5a6d94
  font-size: 0.8rem

.strip__res
  display: inline-flex
  align-items: center
  gap: 0.2rem
  white-space: nowrap

.strip__icon
  width: 1.1rem
  height: 1.1rem
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5))

.strip__num
  color: #fff
  font-size: 0.95rem
  font-weight: 900
  text-shadow: 2px 2px 0 #000

  &.is-gold
    color: #ffd93c

.strip__wallet
  transform: scale(0.82)
  transform-origin: right center
</style>

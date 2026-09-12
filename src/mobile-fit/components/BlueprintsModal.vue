<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import TechIcon from '@/components/game/TechIcon.vue'
import BlockTile from '@/components/game/BlockTile.vue'
import PointerArrow from '@/components/game/PointerArrow.vue'
import { effectTotal, firstHpNodeId, nextRankGain } from '@/game/tech'
import { shouldSpotlightFirstUpgrade } from '@/use/useTechDiscovery'
import useTowerProgress from '@/use/useTowerProgress'
import useSounds from '@/use/useSound'
import { playFx } from '@/use/useTowerAudio'
import { coins } from '@/use/useTowerEconomy'
import { getState, setState } from '@/use/useTowerState'
import { M2_TECH_INTRO_KEY, M2_TECH_INTRO_P1_KEY } from '@/keys'
import { TECH_NODES_DROPMERGE, CARD_NAME_KEY } from '../tech'

/**
 * Blueprints: the mobile-fit tree as a list of cards, bought in order.
 *
 * One screen, one scroll, one button per card. The desktop's DAG needs a
 * pannable board and a detail card; a phone needs to answer "what can I buy
 * right now" in one glance, so the NEXT card is lit and everything else is
 * either owned or dimmed.
 */

const model = defineModel<boolean>({ required: true })

const props = defineProps<{
  /** Run the first-death explainer when the modal opens. */
  intro?: boolean
}>()

const { t } = useI18n()
const { playSound } = useSounds()
const progress = useTowerProgress()

// ─── First-death intro ──────────────────────────────────────────────────────

const INTRO_STEPS = 3
const introStep = ref(0)
const introOpen = ref(false)
/** Only the first card this time (a mid-run first open). */
const introFirstOnly = ref(false)

// The first card on the first open from ANYWHERE — see the desktop tree's
// `startIntro` for why; the rest waits for a defeat.
const startIntro = (fromDefeat: boolean): void => {
  if (getState<boolean>(M2_TECH_INTRO_KEY, false)) return
  const firstSeen = getState<boolean>(M2_TECH_INTRO_P1_KEY, false)
  if (!fromDefeat && firstSeen) return
  introFirstOnly.value = !fromDefeat
  introStep.value = fromDefeat && firstSeen ? 1 : 0
  introOpen.value = true
}

const advanceIntro = (): void => {
  playFx('uiTap')
  if (introStep.value === 0) setState(M2_TECH_INTRO_P1_KEY, true)
  if (!introFirstOnly.value && introStep.value < INTRO_STEPS - 1) { introStep.value++; return }
  introOpen.value = false
  if (!introFirstOnly.value) setState(M2_TECH_INTRO_KEY, true)
}

watch(model, (open) => {
  if (!open) { introOpen.value = false; return }
  startIntro(!!props.intro)
})

// ─── Cards ──────────────────────────────────────────────────────────────────

type CardState = 'maxed' | 'affordable' | 'available' | 'locked'

interface Card {
  id: string
  nameKey: string
  level: number
  maxLevel: number
  /** A one-off unlock. Rank cards have no ceiling and never report one. */
  capped: boolean
  unlock: string
  /** What the NEXT rank adds — the number the description interpolates. Not a
   *  flat per-rank figure: Foundations' first rank is front-loaded (+50 %). */
  n: number
  /** What the ranks bought add up to (`+58%`), or `''` for an unbought or
   *  unlock card. */
  total: string
  cost: number
  state: CardState
  icon: string
}

const cards = computed<Card[]>(() =>
  TECH_NODES_DROPMERGE.map((node) => {
    const level = progress.levelOf(node.id)
    const effect = node.effect as { kind: string; blockId?: string; pct?: number; add?: number }
    let state: CardState = 'locked'
    if (progress.isUnlocked(node.id)) {
      state = level >= node.maxLevel ? 'maxed' : progress.canBuy(node.id) ? 'affordable' : 'available'
    }
    return {
      id: node.id,
      nameKey: CARD_NAME_KEY[node.id] ?? node.id,
      level,
      maxLevel: node.maxLevel,
      capped: node.maxLevel <= 1,
      unlock: effect.kind === 'unlock' ? (effect.blockId ?? '') : '',
      n: nextRankGain(node.effect, level),
      total: level > 0 && effect.kind !== 'unlock'
        ? `+${Math.round(effectTotal(node.effect, level) * 100) / 100}${effect.pct !== undefined ? '%' : ''}`
        : '',
      cost: progress.costOf(node.id),
      state,
      icon: node.icon
    }
  })
)

const buy = (id: string): void => {
  if (progress.buyTech(id)) {
    playSound('level-up', 0.07)
    return
  }
  playSound('obstacle-hit', 0.03)
}

// ─── First-upgrade spotlight ────────────────────────────────────────────────
//
// The strip's first card is Foundations (+50 % block HP on its first rank).
// From stage 2, on a strip nothing has been bought on, it glows gold and the
// yellow arrow points at its buy button until it is bought once. After the
// first-death intro, never under it: intro first says what the screen is,
// then the arrow says what to do on it.

const FIRST_HP = firstHpNodeId(TECH_NODES_DROPMERGE) ?? 'm2_foundations'

const spotlightFirst = computed(() =>
  !introOpen.value && shouldSpotlightFirstUpgrade(TECH_NODES_DROPMERGE, progress.levelOf)
)
</script>

<template lang="pug">
  FModal(v-model="model" :title="t('tech.blueprints.title')")
    div.bp
      div.bp__wallet
        IconCoin(class="bp__wallet-icon")
        span.bp__wallet-value {{ coins }}

      ul.bp__list
        li.bp__card(
          v-for="card in cards"
          :key="card.id"
          :class="[`is-${card.state}`, { 'is-spotlight': spotlightFirst && card.id === FIRST_HP }]"
        )
          span.bp__glyph
            BlockTile(v-if="card.unlock" :type-id="card.unlock" :size="36")
            TechIcon(v-else :icon="card.icon")
          div.bp__text
            span.bp__name {{ t(`tech.names.${card.nameKey}`) }}
            span.bp__desc {{ t(`tech.descriptions.${card.nameKey}`, { n: card.n }) }}
            //- A rank card has no ceiling, so it reports the rank it is at —
            //- "3 / 9999" would be absurd. Only the binary unlocks are capped.
            //- With the running total, as on the desktop tree: the description
            //- shows the NEXT rank's gain, so after the front-loaded first rank
            //- it drops from +50 % to +8 %, and without the total beside it
            //- that reads as the bonus having shrunk.
            span.bp__rank(v-if="!card.capped && card.level > 0")
              | {{ card.total ? t('tech.atRank', { r: card.level, n: card.total }) : t('tech.rankOpen', { n: card.level }) }}
          div.bp__action
            span.bp__owned(v-if="card.state === 'maxed'") {{ t('tech.owned') }}
            FButton(
              v-else-if="card.state !== 'locked'"
              size="sm"
              :is-disabled="card.state !== 'affordable'"
              @click="buy(card.id)"
            )
              span.bp__buy
                IconCoin(class="bp__buy-icon")
                | {{ card.cost }}
            span.bp__locked(v-else) 🔒
            //- Below the button, pointing up. Left of it would sit on this
            //- card's own description — the line that says +50 % — and above
            //- it the list's scroll edge would clip it; below it overlaps only
            //- the next card's padlock.
            PointerArrow(
              v-if="spotlightFirst && card.id === FIRST_HP"
              side="bottom"
              :length="2.1"
            )

      //- The three-beat explainer, once per save.
      div.bp__intro(v-if="introOpen")
        p.bp__intro-text {{ t(`tech.intro${introStep + 1}`) }}
        FButton(size="sm" @click="advanceIntro") {{ introStep < 2 && !introFirstOnly ? t('tech.introNext') : t('tech.introDone') }}
</template>

<style scoped lang="sass">
.bp
  position: relative
  display: flex
  flex-direction: column
  gap: 0.5rem
  max-height: 70vh
  max-height: 70dvh

.bp__wallet
  display: flex
  align-items: center
  justify-content: center
  gap: 0.3rem
  color: #ffd93c
  font-size: 1.1rem
  font-weight: 900
  text-shadow: 2px 2px 0 #000

.bp__wallet-icon
  width: 1.3rem
  height: 1.3rem

.bp__list
  display: flex
  flex-direction: column
  gap: 0.35rem
  margin: 0
  padding: 0 0.1rem 0.5rem
  list-style: none
  overflow-y: auto
  -webkit-overflow-scrolling: touch

.bp__card
  display: flex
  align-items: center
  gap: 0.5rem
  padding: 0.35rem 0.5rem
  border: 2px solid #24345a
  border-radius: 0.6rem
  background-image: linear-gradient(to bottom, rgba(38, 56, 96, 0.95), rgba(18, 30, 56, 0.95))

  &.is-affordable
    border-color: #ffd54a
    box-shadow: 0 0 10px rgba(255, 190, 40, 0.35)

  &.is-maxed
    border-color: #57a37c

  &.is-locked
    opacity: 0.45

.bp__glyph
  display: flex
  align-items: center
  justify-content: center
  flex: 0 0 auto
  width: 2.4rem
  height: 2.4rem
  color: #cfe4ff

  :deep(svg)
    width: 1.6rem
    height: 1.6rem

.bp__text
  display: flex
  flex-direction: column
  flex: 1 1 auto
  min-width: 0
  gap: 0.1rem

.bp__name
  color: #fff
  font-size: 0.85rem
  font-weight: 900
  text-transform: uppercase

.bp__desc
  color: #9fb6de
  font-size: 0.65rem
  line-height: 1.2

.bp__rank
  color: #ffd93c
  font-size: 0.6rem
  font-weight: 900

.bp__action
  position: relative
  flex: 0 0 auto
  display: flex
  align-items: center
  justify-content: center
  min-width: 4rem

// The same pulsing gold as the coach mark's ring, so the arrow and the glow
// read as one instruction: this card, this button.
.bp__card.is-spotlight
  border-color: #ffd93c
  animation: bp-spotlight 1.5s ease-in-out infinite

@keyframes bp-spotlight
  0%, 100%
    box-shadow: 0 0 0 2px rgba(255, 214, 80, 0.25), 0 0 10px rgba(255, 200, 60, 0.35)
  50%
    box-shadow: 0 0 0 4px rgba(255, 214, 80, 0.55), 0 0 22px rgba(255, 200, 60, 0.8)

@media (prefers-reduced-motion: reduce)
  .bp__card.is-spotlight
    animation: none
    box-shadow: 0 0 0 3px rgba(255, 214, 80, 0.5), 0 0 16px rgba(255, 200, 60, 0.6)

.bp__buy
  display: inline-flex
  align-items: center
  gap: 0.2rem

.bp__buy-icon
  width: 1rem
  height: 1rem

.bp__owned
  color: #7ef0a0
  font-size: 0.7rem
  font-weight: 900
  text-transform: uppercase

.bp__locked
  font-size: 1rem

.bp__intro
  position: absolute
  inset: auto 0.5rem 0.5rem
  z-index: 3
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.5rem
  padding: 0.75rem
  border: 2px solid #7fe0ff
  border-radius: 0.8rem
  background-image: linear-gradient(to bottom, rgba(28, 44, 82, 0.98), rgba(14, 24, 46, 0.98))
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.55)

.bp__intro-text
  margin: 0
  color: #fff
  font-size: 0.85rem
  font-weight: 900
  text-align: center
  text-shadow: 2px 2px 0 #000
</style>

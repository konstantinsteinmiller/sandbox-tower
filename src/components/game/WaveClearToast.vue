<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { canOfferReward, adInFlight } from '@/use/useAdGate'
import FRewardButton from '@/components/atoms/FRewardButton.vue'

/**
 * The "wave survived" banner.
 *
 * One line: which wave was cleared, and the early-call bonus it was cleared
 * for. Nothing else — and that is the design, not an omission.
 *
 * It used to be a card carrying a kill tally and a full payout table, parked in
 * the middle of the screen for three and a half seconds. Two problems, both
 * fatal at the moment it appears. The tally answered a question nobody asks
 * (the count of grunts killed changes no decision the player is about to make),
 * and the payout table said what the wave paid somewhere OTHER than at the
 * numbers it paid into — while covering the tower, which is the one thing the
 * player is actually trying to read while deciding what to build next.
 *
 * So the payout moved to where it belongs: `useResourceFloats` sends a "+n"
 * rising into each figure in the resource bar. What is left here is the single
 * fact a banner is good at — you survived that one — and it gets out of the
 * way in a second and a half.
 */

interface Reward {
  wave: number
  coins: number
  bonusPct: number
}

interface Props {
  reward: Reward | null
}

const props = defineProps<Props>()
import { isRewardGated } from '@/use/useAdGate'

const emit = defineEmits<{ (e: 'triple'): void }>()
const { t } = useI18n()

/**
 * How long the banner lingers.
 *
 * One short line needs about as long as it takes to read, and the payout it
 * used to carry is now animating into the resource bar on its own clock — so
 * there is nothing left on this card worth covering the tower for. But when it
 * is also carrying the triple-coins offer it is a DECISION, and a decision that
 * expires in a second and a half is a decision the player will miss and resent
 * missing, so that case keeps its own much longer window.
 */
const PLAIN_MS = 1500
const OFFER_MS = 8000

const visible = ref(false)
/** Wave number whose triple has already been taken, so it cannot be re-claimed. */
const claimedWave = ref(-1)
let hideTimer: ReturnType<typeof setTimeout> | null = null

/**
 * The triple is only offered on a wave that actually paid something — and only
 * where there is a video to pay for it.
 *
 * Off-portal the reward would simply be free, and a button that triples the
 * payout for nothing is not an offer, it is a "make the game easier" toggle
 * sitting in the middle of the screen after every wave.
 */
const canTriple = computed(() =>
  isRewardGated
  && !!props.reward
  && props.reward.coins > 0
  && claimedWave.value !== props.reward.wave
  && canOfferReward.value
)

watch(() => props.reward, (r) => {
  if (hideTimer) clearTimeout(hideTimer)
  if (!r) { visible.value = false; return }
  visible.value = true
  hideTimer = setTimeout(() => { visible.value = false }, canTriple.value ? OFFER_MS : PLAIN_MS)
}, { immediate: true })

onUnmounted(() => { if (hideTimer) clearTimeout(hideTimer) })

const onTriple = (): void => {
  const r = props.reward
  if (!r || adInFlight.value) return
  claimedWave.value = r.wave
  emit('triple')
}

</script>

<template lang="pug">
  Transition(name="toast")
    div.wave-toast(v-if="visible && reward" :class="{ 'is-interactive': canTriple }")
      span.wave-toast__shadow(aria-hidden="true")
      div.wave-toast__body
        div.wave-toast__title.text-white
          | {{ t('result.waveCleared', { n: reward.wave }) }}
          span.text-white.wave-toast__bonus(v-if="reward.bonusPct > 0") +{{ reward.bonusPct }}%

        //- Triple the wave payout for a video. Offered here rather than on the
        //- defeat screen because this is the moment the number is on screen and
        //- the player can see exactly what they are tripling.
        FRewardButton(
          v-if="canTriple"
          tone="green"
          size="sm"
          :label="t('result.tripleWave', { n: reward.coins * 3 })"
          @click="onTriple"
        )
</template>

<style scoped lang="sass">
.wave-toast
  position: relative
  // Interactive only while it is carrying the triple-coins offer; a payout
  // readout must never eat a tap meant for the tower behind it.
  pointer-events: none
  max-width: min(92vw, 26rem)

.wave-toast.is-interactive
  pointer-events: auto

.wave-toast__shadow
  position: absolute
  inset: 0
  transform: translateY(4px)
  border-radius: clamp(0.6rem, 3vw, 1rem)
  background-color: var(--ui-drop)
  box-shadow: 0 0 0 1.5px var(--ui-line)

.wave-toast__body
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.15rem, 1vw, 0.35rem)
  padding: clamp(0.35rem, 1.8vw, 0.7rem) clamp(0.7rem, 4vw, 1.4rem)
  border: 2px solid var(--ui-rim)
  border-radius: clamp(0.6rem, 3vw, 1rem)
  background-image: linear-gradient(to bottom, var(--ui-panel-top), var(--ui-panel-bot))
  box-shadow: 0 0 0 1.5px var(--ui-line), inset 0 2px 0 var(--ui-gloss), 0 0 22px rgba(255, 210, 60, 0.35)

.wave-toast__title
  display: flex
  align-items: center
  gap: 0.4em
  color: #ffd93c
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.04em
  text-align: center
  font-size: clamp(0.75rem, 3.6vw, 1.15rem)
  text-shadow: 2px 2px 0 #000

.wave-toast__bonus
  color: rgb(255, 255, 255)
  background-color: var(--btn-green-to)
  border-radius: 999px
  padding: 0 0.4em
  font-size: 0.72em

// The kill tally, the payout table and their chip styling all lived here. They
// went with the markup: what the wave paid is now announced by a float rising
// into the resource bar, at the number it changed.

.toast-enter-active
  transition: opacity 160ms ease-out, translate 240ms cubic-bezier(0.34, 1.56, 0.64, 1)
// Tightened with the shorter dwell. A 400 ms fade on top of a 1.5 s banner is a
// third again as long as the banner was asked to be there for.
.toast-leave-active
  transition: opacity 260ms ease-in, translate 260ms ease-in

.toast-enter-from, .toast-leave-to
  opacity: 0
  translate: 0 0.75rem
</style>

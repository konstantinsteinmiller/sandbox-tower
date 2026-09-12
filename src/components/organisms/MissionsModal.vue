<script setup lang="ts">
import { ref, computed, type ComponentPublicInstance } from 'vue'
import { resolveAnchor } from '@/use/useCoinExplosion'
import FHudButton from '@/components/atoms/FHudButton.vue'
import FHudBadge from '@/components/atoms/FHudBadge.vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import useMissions from '@/use/useMissions'
import useSounds from '@/use/useSound'

const props = withDefaults(defineProps<{
  /**
   * The corner copy: the button exists only while there is something to
   * collect, and leaves once it has all been collected.
   *
   * The phone keeps the missions board in its `…` drawer, and the blind
   * playtest's five phone players claimed nothing between them — three
   * finished missions sat there all session behind a menu none of them had a
   * reason to open. So the phone also mounts this copy on the open playfield,
   * where it turns up on the wave clear that finishes a goal. It stays mounted
   * while its own panel is open, so claiming the last reward never yanks the
   * sheet out from under the tap that emptied it.
   */
  onlyWhenClaimable?: boolean
}>(), {
  onlyWhenClaimable: false
})

const emit = defineEmits<{
  (e: 'coins-awarded', sourceEl: HTMLElement): void
  /** Fired just before the panel is shown, so the owner can flush live
   *  progress into the dailies — otherwise the numbers are as stale as the
   *  last wave clear. */
  (e: 'opened'): void
}>()

const { t } = useI18n()
const { playSound } = useSounds()
const { missions, claim, claimableMissionCount, allRemainingClaimable } = useMissions()

const isOpen = ref(false)

const isVisible = computed(() =>
  !props.onlyWhenClaimable || claimableMissionCount.value > 0 || isOpen.value
)

const open = (): void => {
  // Ask for a refresh BEFORE showing, so the first frame the player sees is
  // already correct rather than visibly ticking up a moment later.
  emit('opened')
  isOpen.value = true
}
// The ref sits on FHudButton — a COMPONENT — so what lands here is Vue's
// public instance, not an element. `resolveAnchor` unwraps it; typing this as
// `HTMLElement` (as it was) made the mistake invisible until the claim threw.
const rootEl = ref<ComponentPublicInstance | HTMLElement | null>(null)

interface MissionView {
  index: number
  type: string
  label: string
  progress: number
  target: number
  fraction: number
  reward: number
  claimed: boolean
  claimable: boolean
}

const cards = computed<MissionView[]>(() =>
  missions.value.map((m, i) => {
    // Defensive: never let a stray NaN reach the template (the "NaN /" bug).
    const target = Number.isFinite(m.target) && m.target > 0 ? m.target : 1
    const progress = Number.isFinite(m.progress) ? Math.max(0, m.progress) : 0
    return {
      index: i,
      type: m.type,
      label: t('missions.types.' + m.type, { n: target }),
      progress: Math.min(progress, target),
      target,
      fraction: Math.max(0, Math.min(1, progress / target)),
      reward: m.reward,
      claimed: m.claimed,
      claimable: !m.claimed && progress >= target
    }
  })
)

const onClaim = (index: number): void => {
  if (claim(index)) {
    playSound('reward-continue', 0.06)
    const el = resolveAnchor(rootEl.value)
    if (el) emit('coins-awarded', el)
  } else {
    playSound('barricade', 0.04)
  }
}
</script>

<template lang="pug">
  //- The corner copy pops in on the wave clear that finishes a goal and out
  //- once it has all been collected; the drawer copy never leaves, so for it
  //- the transition is inert.
  Transition(name="missions-pop")
    FHudButton(
      v-if="isVisible"
      ref="rootEl"
      tone="blue"
      :attention="allRemainingClaimable"
      :aria-label="t('missions.title')"
      @click="open"
    )
      //- Checklist / clipboard glyph for the missions board.
      svg(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white")
        path(d="M9 3 h6 v3 h-6 z M6 5 h2 M16 5 h2 v16 h-12 v-16 h2")
        path(d="M9 11 l1.5 1.5 L13 10 M9 16 l1.5 1.5 L13 15")
      template(#badge)
        //- Keyed on the count so each newly finished goal re-mounts the badge
        //- and it pops: the number going up is SHOWN, not just changed.
        FHudBadge.missions-badge(
          v-if="claimableMissionCount > 0"
          :key="claimableMissionCount"
          tone="red"
        ) {{ claimableMissionCount }}

  FModal(v-model="isOpen" :title="t('missions.title')")
    div.flex.flex-col.gap-2.p-2
      p.text-center.text-white.game-text.opacity-80(class="text-xs sm:text-sm") {{ t('missions.subtitle') }}
      div.flex.flex-col.gap-2
        div.flex.items-center.gap-3.rounded-xl.border-2.p-2.text-left(
          v-for="card in cards"
          :key="card.index"
          class="bg-black/30"
          :class="card.claimable ? 'border-yellow-300' : 'border-white/15'"
        )
          div.flex-1.min-w-0
            div.font-black.game-text.text-white(class="text-xs sm:text-sm") {{ card.label }}
            //- Progress bar
            div.relative.mt-1.h-2.w-full.overflow-hidden.rounded-full(class="bg-black/40")
              div.absolute.inset-y-0.left-0.rounded-full(
                class="bg-gradient-to-r from-yellow-300 to-amber-500"
                :style="{ width: (card.fraction * 100) + '%' }"
              )
            div.text-white.game-text.opacity-70(class="text-[10px] mt-0.5") {{ card.progress }} / {{ card.target }}
          div.shrink-0.flex.flex-col.items-end.gap-1
            div.flex.items-center.gap-1
              IconCoin(class="w-3.5 h-3.5 text-yellow-300")
              span.text-yellow-200.game-text.font-black(class="text-xs") {{ card.reward }}
            div.text-center.text-emerald-300.font-black.game-text(v-if="card.claimed" class="text-[10px]") {{ t('missions.done') }}
            FButton(
              v-else-if="card.claimable"
              size="sm"
              @click="onClaim(card.index)"
            ) {{ t('missions.claim') }}
</template>

<style scoped lang="sass">
// The corner copy arriving and leaving. A spring-in scale says "this just
// appeared for you"; the exit is a plain shrink so it never competes with the
// coins flying out of it.
.missions-pop-enter-active
  transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 180ms ease-out

.missions-pop-leave-active
  transition: transform 200ms ease-in, opacity 200ms ease-in

.missions-pop-enter-from,
.missions-pop-leave-to
  transform: scale(0.4)
  opacity: 0

.missions-badge
  animation: missions-badge-pop 420ms cubic-bezier(0.34, 1.56, 0.64, 1)

@keyframes missions-badge-pop
  0%
    transform: scale(0.3)
  60%
    transform: scale(1.35)
  100%
    transform: scale(1)

// The count still changes; it just stops jumping.
@media (prefers-reduced-motion: reduce)
  .missions-pop-enter-active,
  .missions-pop-leave-active
    transition: opacity 150ms linear

  .missions-pop-enter-from,
  .missions-pop-leave-to
    transform: none

  .missions-badge
    animation: none
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FButton from '@/components/atoms/FButton.vue'
import TechTreeGlyph from '@/components/icons/TechTreeGlyph.vue'
import useTowerProgress from '@/use/useTowerProgress'

/**
 * The defeat screen's door into the tech tree — the SAME door as the HUD's.
 *
 * It used to wear a shopping cart. In the 2026-09-11 blind playtest the phone
 * testers read that cart as a store and left it alone for two full runs, which
 * on a run-based game means the permanent upgrades — the reason to play run 2 —
 * stayed unseen by exactly the players who had just earned the coins for them.
 *
 * So it wears the tech tree's own painted diamond on the HUD's green, and it
 * glows gold while there is something in the tree the wallet can pay for:
 * "the thing you know from the battlefield, and it has something for you". One
 * component for both boards, so the two defeat screens cannot drift apart.
 */

interface Props {
  isDisabled?: boolean
}

withDefaults(defineProps<Props>(), { isDisabled: false })
defineEmits<{ (e: 'click'): void }>()

const { t } = useI18n()
const progress = useTowerProgress()

/** Something in the tree is affordable right now. */
const canSpend = computed(() => progress.affordableCount.value > 0)
</script>

<template lang="pug">
  FButton.result-upgrade(
    size="md"
    type="success"
    icon-only
    :class="{ 'is-glow': canSpend }"
    :aria-label="t('result.upgrade')"
    :is-disabled="isDisabled"
    @click="$emit('click')"
  )
    template(#icon)
      TechTreeGlyph(:active="canSpend")
</template>

<style scoped lang="sass">
// The HUD's gold aura (`FHudButton`'s `hud-pulse`), so "glowing gold" means the
// same thing on this screen as it does on the battlefield.
.result-upgrade.is-glow:not(.is-disabled)
  animation: result-upgrade-glow 1.6s ease-in-out infinite

@keyframes result-upgrade-glow
  0%, 100%
    filter: drop-shadow(0 0 0 rgba(255, 200, 0, 0))
  50%
    filter: drop-shadow(0 0 10px rgba(255, 200, 0, 0.8))

// Motion stops; the aura must not — it is the whole message.
@media (prefers-reduced-motion: reduce)
  .result-upgrade.is-glow:not(.is-disabled)
    animation: none
    filter: drop-shadow(0 0 7px rgba(255, 200, 0, 0.75))
</style>

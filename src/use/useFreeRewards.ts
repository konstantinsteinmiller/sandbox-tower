// ─── The house's first rewarded grants ──────────────────────────────────────
//
// The first `FREE_REWARDS` rewarded placements a player activates are granted
// WITHOUT a video: they tap "double the payout", and the coins simply double.
//
// This is an onboarding cost, not a monetization one. A player meeting the game
// for the first time does not yet know what a rewarded perk buys them, so the
// first tap is a leap of faith — and answering it with thirty seconds of
// advertising is how a playtest turns into "the game is full of ads" before
// anyone has seen a second wave. Letting the first two through teaches the
// perk, and the player who then chooses to watch the third one is a player who
// knows what they are buying.
//
// Two, not one: the first grant teaches that the button pays, and the second
// lets the player USE that knowledge somewhere they chose. It is a lifetime
// allowance, not per run or per session — a returning player has already
// learned this.
//
// Deliberately NOT wired into what the UI advertises. The buttons keep their
// "watch a video" affordance because that is what the placement is; a free
// grant is a pleasant surprise, and the alternative — a FREE badge on the first
// two — would need a locale key in every shipped language to say something the
// player finds out by tapping anyway.

import { computed } from 'vue'
import { getState, setState } from '@/use/useTowerState'
import { FREE_REWARDS_KEY } from '@/keys'

/** How many rewarded activations are on the house, per player, ever. */
export const FREE_REWARDS = 2

/**
 * How many have been spent.
 *
 * Read live off the state blob rather than mirrored into a ref, because the
 * blob is not the only thing that writes it: a cloud hydrate landing mid-boot
 * replaces it wholesale, and a cached count would hand a veteran on their
 * second device two grants they had already spent. Same reasoning as
 * `isFirstSession`. `towerState` is itself a ref, so the computeds below track
 * both the spend and the hydrate.
 */
const spent = (): number => {
  const v = getState<unknown>(FREE_REWARDS_KEY, 0)
  const n = typeof v === 'number' ? v : Number.parseInt(String(v ?? ''), 10)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

/** Free rewarded grants this player has left. */
export const freeRewardsLeft = computed(() => Math.max(0, FREE_REWARDS - spent()))

/** Is the next rewarded activation on the house? */
export const hasFreeReward = computed(() => freeRewardsLeft.value > 0)

/**
 * Spend one free grant, if there is one left.
 *
 * Returns true when the caller should grant the perk with no ad at all. Called
 * on the ACTIVATION, not on a successful watch: a tap that would have opened a
 * video is what this replaces, so there is no no-fill or dismissal to account
 * for.
 */
export const consumeFreeReward = (): boolean => {
  const used = spent()
  if (used >= FREE_REWARDS) return false
  setState(FREE_REWARDS_KEY, used + 1)
  return true
}

/** Test seam — hands the allowance back. */
export const __resetFreeRewardsForTests = (): void => {
  setState(FREE_REWARDS_KEY, 0)
}

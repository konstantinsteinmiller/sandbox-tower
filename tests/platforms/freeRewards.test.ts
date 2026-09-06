import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

/**
 * ─── The house's first rewarded grants ──────────────────────────────────────
 *
 * A player's first `FREE_REWARDS` rewarded activations are granted with no
 * video. The reason is onboarding, not generosity: the first tap on a rewarded
 * perk is a leap of faith — the player does not yet know what it buys — and
 * answering it with thirty seconds of advertising is how a playtest becomes
 * "this game is full of ads" before anyone has seen a second wave.
 *
 * Two properties carry the feature, and both are easy to lose in a refactor:
 *
 *   1. a free grant asks the ad SDK for NOTHING. No impression is requested,
 *      no pause gate is raised, nothing is written to the watch budget — so
 *      the allowance cannot be laundered into extra ad capacity;
 *   2. it is a LIFETIME allowance, so it survives a reload. A per-session
 *      count would hand a player two free grants every time they came back,
 *      which is a monetization hole rather than an onboarding gift.
 */

const mockProvider = {
  name: 'mock',
  isReady: ref(true),
  isRewardedReady: ref(true),
  isInterstitialReady: ref(true),
  isAdsBlocked: ref(false),
  init: vi.fn(async () => {}),
  showRewardedAd: vi.fn(async () => true),
  showMidgameAd: vi.fn(async () => {})
}

vi.mock('@/platforms/resolveAdProvider', () => ({
  resolveAdProvider: () => mockProvider
}))

/** Re-import the ad layer. Storage is NOT cleared, so a spec can reload the
 *  game the way a player does — with their save still on the device. */
const importAds = async () => {
  vi.resetModules()
  mockProvider.isRewardedReady.value = true
  mockProvider.showRewardedAd.mockClear()
  mockProvider.showRewardedAd.mockResolvedValue(true)
  return await import('@/use/useAds')
}

describe('free rewarded grants', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('grants the first two without asking the provider for a video', async () => {
    const ads = await importAds()
    const { FREE_REWARDS } = await import('@/use/useFreeRewards')

    for (let i = 0; i < FREE_REWARDS; i++) {
      await expect(ads.requestRewardedGrant()).resolves.toBe(true)
    }
    expect(mockProvider.showRewardedAd).not.toHaveBeenCalled()
  })

  it('sends the next activation to the provider like any other', async () => {
    const ads = await importAds()
    const { FREE_REWARDS } = await import('@/use/useFreeRewards')

    for (let i = 0; i < FREE_REWARDS; i++) await ads.requestRewardedGrant()
    await expect(ads.requestRewardedGrant()).resolves.toBe(true)

    expect(mockProvider.showRewardedAd).toHaveBeenCalledTimes(1)
  })

  it('spends nothing from the watch budget — a free grant was not a watch',
    async () => {
      const ads = await importAds()
      const throttle = await import('@/use/useRewardedThrottle')
      const { FREE_REWARDS } = await import('@/use/useFreeRewards')

      for (let i = 0; i < FREE_REWARDS; i++) await ads.requestRewardedGrant()

      // The throttle counts videos the player actually sat through. Charging
      // the free ones to it would shorten the budget of the player who has
      // seen the fewest ads.
      expect(throttle.isRewardedThrottled.value).toBe(false)
      await ads.requestRewardedGrant()
      for (let i = 1; i < throttle.MAX_REWARDED; i++) await ads.requestRewardedGrant()
      expect(throttle.isRewardedThrottled.value).toBe(true)
    })

  it('never raises the ad pause gate for a free grant', async () => {
    const ads = await importAds()
    const pause = await import('@/use/useGamePause')

    // `isAdShowing` mutes audio and freezes the simulation. Nothing opened, so
    // nothing should have been frozen — and it must be back down either way.
    await ads.requestRewardedGrant()
    expect(pause.isAdShowing.value).toBe(false)
  })

  it('is a lifetime allowance — a reload does not refill it', async () => {
    const first = await importAds()
    const { FREE_REWARDS } = await import('@/use/useFreeRewards')
    for (let i = 0; i < FREE_REWARDS; i++) await first.requestRewardedGrant()

    // Same device, same save, fresh modules: the player closed the tab and
    // came back. The state layer debounces its writes, so the flush the real
    // page-hide handler performs has to happen here too.
    const state = await import('@/use/useTowerState')
    state.flushPersist()

    const second = await importAds()
    await expect(second.requestRewardedGrant()).resolves.toBe(true)
    expect(mockProvider.showRewardedAd).toHaveBeenCalledTimes(1)
  })

  it('leaves `showRewardedAd` meaning exactly what it says', async () => {
    const ads = await importAds()

    // The free grants live in `requestRewardedGrant`. A caller that asks for a
    // video gets one, first activation or not — which is what keeps every
    // provider-level spec honest.
    await expect(ads.showRewardedAd()).resolves.toBe(true)
    expect(mockProvider.showRewardedAd).toHaveBeenCalledTimes(1)
  })

  it('reaches the perks through the real gate, with no video and no coins',
    async () => {
      // The wiring test. Everything above exercises the ad layer directly;
      // this one runs a perk through the REAL `useAdGate` on a build where the
      // video is the price, because that is the path a player takes and the
      // one a refactor can quietly reroute back to `showRewardedAd`.
      vi.resetModules()
      mockProvider.showRewardedAd.mockClear()
      mockProvider.showRewardedAd.mockResolvedValue(true)
      vi.doMock('@/use/useUser', () => ({
        isCrazyWeb: false, isWaveDash: false, isItch: false, isGlitch: false,
        isGameDistribution: false, isPlaygama: false, isGamepix: false,
        isGameMonetize: false, isYandex: false, isPoki: true,
        isNative: false, showMediatorAds: false
      }))
      vi.doMock('@/use/useMatch', () => ({
        isCrazyGamesFullRelease: false,
        isDebug: ref(false)
      }))
      const economy = await import('@/use/useTowerEconomy')
      economy.coins.value = 1000
      const gate = await import('@/use/useAdGate')
      const { FREE_REWARDS } = await import('@/use/useFreeRewards')
      expect(gate.isRewardGated).toBe(true)

      const grant = vi.fn()
      for (let i = 0; i < FREE_REWARDS; i++) {
        await expect(gate.claimReward(grant)).resolves.toBe(true)
      }
      expect(grant).toHaveBeenCalledTimes(FREE_REWARDS)
      expect(mockProvider.showRewardedAd).not.toHaveBeenCalled()
      // Free means free: the wallet is not the fallback price either.
      expect(economy.coins.value).toBe(1000)

      await expect(gate.claimReward(grant)).resolves.toBe(true)
      expect(mockProvider.showRewardedAd).toHaveBeenCalledTimes(1)
    })

  it('reports what is left, and stops at zero', async () => {
    const ads = await importAds()
    const free = await import('@/use/useFreeRewards')

    expect(free.freeRewardsLeft.value).toBe(free.FREE_REWARDS)
    expect(free.hasFreeReward.value).toBe(true)

    await ads.requestRewardedGrant()
    expect(free.freeRewardsLeft.value).toBe(free.FREE_REWARDS - 1)

    for (let i = 0; i < free.FREE_REWARDS; i++) await ads.requestRewardedGrant()
    expect(free.freeRewardsLeft.value).toBe(0)
    expect(free.hasFreeReward.value).toBe(false)
  })
})

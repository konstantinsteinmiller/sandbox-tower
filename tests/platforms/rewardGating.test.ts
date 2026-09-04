// ─── `isRewardGated` must list EVERY portal that can serve a rewarded video ──
//
// `src/use/useAdGate.ts` decides whether a perk is paid for with a video or with
// wallet coins. When a portal is missing from that predicate the build takes the
// ungated arm: `claimReward()` grants instantly with NO ad, `canOfferReward`
// stops consulting `isRewardedReady`, and the buttons advertise a coin price
// while a live rewarded unit sits behind them.
//
// That is a silent, revenue-losing failure that looks like an SDK bug — it was
// reported against the Poki build as "the rewarded ads don't show, it just
// grants the reward" (2026-09-01), and the file's own doc comment shows the same
// thing had already happened to every portal added after CrazyGames.
//
// The predicate does NOT live under `src/platforms/` and is not named
// `resolve*`, so neither the registry tests nor a grep of the platform folder
// catches an omission. Hence this table: adding a portal that ships an ad
// provider means adding a row here, and the test fails until the predicate
// agrees.

import { afterEach, describe, expect, it, vi } from 'vitest'

/** Every build flag whose `AdProvider` can actually serve a rewarded video. */
const REWARDED_CAPABLE_BUILDS = [
  'VITE_APP_GAME_DISTRIBUTION',
  'VITE_APP_PLAYGAMA',
  'VITE_APP_GAMEPIX',
  'VITE_APP_GAME_MONETIZE',
  'VITE_APP_YANDEX',
  'VITE_APP_POKI'
] as const

/** Builds with no rewarded inventory — perks are coin-priced there instead. */
const NO_INVENTORY_BUILDS = [
  'VITE_APP_ITCH',
  'VITE_APP_WAVEDASH',
  'VITE_APP_GLITCH'
] as const

const loadGate = async () => {
  vi.resetModules()
  return await import('@/use/useAdGate')
}

describe('isRewardGated', () => {
  afterEach(() => vi.unstubAllEnvs())

  it.each(REWARDED_CAPABLE_BUILDS)('is TRUE on a %s build', async (flag) => {
    vi.stubEnv(flag, 'true')
    const { isRewardGated, isRewardCoinPriced } = await loadGate()
    expect(isRewardGated, `${flag} is missing from isRewardGated in useAdGate.ts`).toBe(true)
    // The two must stay exact opposites, or a build both charges coins AND
    // plays a video for the same perk.
    expect(isRewardCoinPriced).toBe(false)
  })

  it.each(NO_INVENTORY_BUILDS)('is FALSE on a %s build (coin-priced instead)', async (flag) => {
    vi.stubEnv(flag, 'true')
    const { isRewardGated, isRewardCoinPriced } = await loadGate()
    expect(isRewardGated).toBe(false)
    expect(isRewardCoinPriced).toBe(true)
  })

  it('is FALSE on a plain web build with no platform flag', async () => {
    const { isRewardGated } = await loadGate()
    expect(isRewardGated).toBe(false)
  })

  it('gates rewards on the Poki build specifically', async () => {
    // The regression this file exists for. Kept as its own named case so a
    // failure points straight at the cause rather than at a table row.
    vi.stubEnv('VITE_APP_POKI', 'true')
    const { isRewardGated } = await loadGate()
    expect(
      isRewardGated,
      'Poki ships a rewarded provider — without this, claimReward() grants with no ad'
    ).toBe(true)
  })
})

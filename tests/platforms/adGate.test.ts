import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The ad gate decides two things that are easy to get subtly wrong and
 * expensive to get wrong in review:
 *
 *   1. WHICH BUILDS charge for a perk. Shipping a gated perk on a build with no
 *      ad inventory makes the perk permanently unavailable.
 *   2. HOW OFTEN an interstitial may fire. Portals reject builds that stack
 *      breaks back to back, and the very first seconds of a session are the
 *      worst possible moment for one.
 */

const loadGate = async (opts: {
  crazy?: boolean; fullRelease?: boolean; rewardedReady?: boolean
  /** Any other portal build whose ad SDK can serve a rewarded video. */
  playgama?: boolean
  /** Starting wallet balance, for the coin-priced (ungated) path. */
  wallet?: number
} = {}) => {
  vi.resetModules()
  localStorage.clear()
  // Seed the wallet through the persisted blob rather than by adding coins:
  // `addCoins(0)` is a deliberate no-op, so a zero-balance case would inherit
  // whatever another test file left in this worker's storage.
  localStorage.setItem('tower_state', JSON.stringify({ ts_coins: opts.wallet ?? 1000 }))
  vi.doMock('@/use/useUser', () => ({
    isCrazyWeb: opts.crazy ?? false,
    isGameDistribution: false,
    isPlaygama: opts.playgama ?? false,
    isGamepix: false,
    isGameMonetize: false,
    isYandex: false
  }))
  vi.doMock('@/use/useMatch', () => ({ isCrazyGamesFullRelease: opts.fullRelease ?? false }))
  const showRewardedAd = vi.fn(async () => true)
  vi.doMock('@/use/useAds', async () => {
    const { ref } = await import('vue')
    return { isRewardedReady: ref(opts.rewardedReady ?? true), showRewardedAd }
  })
  const economy = await import('@/use/useTowerEconomy')
  // ...and then set the balance on the ref as well.
  //
  // Seeding storage alone is not enough: the state layer DEBOUNCES its writes,
  // so a pending write from whichever test file ran before this one can land
  // after the `localStorage.clear()` above and put its balance back. That made
  // this file fail intermittently in full runs and pass in isolation, which is
  // the worst kind of test — it looks like whatever change happened to be in
  // flight. Writing the ref is immune to the race.
  economy.coins.value = opts.wallet ?? 1000
  const mod = await import('@/use/useAdGate')
  return { ...mod, showRewardedAd, wallet: economy.coins }
}

beforeEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('reward gating', () => {
  it('charges wallet coins instead of a video off the CG full release', async () => {
    const gate = await loadGate({ crazy: false, fullRelease: false, wallet: 100 })
    const grant = vi.fn()
    expect(gate.isRewardGated).toBe(false)
    await expect(gate.claimReward(grant)).resolves.toBe(true)
    expect(grant).toHaveBeenCalledTimes(1)
    expect(gate.showRewardedAd).not.toHaveBeenCalled()
    expect(gate.wallet.value).toBe(100 - gate.REWARD_COIN_COST)
  })

  it('charges coins on a CrazyGames build that is not the full release', async () => {
    // The pre-release QA build has no ad inventory. Granting for free there
    // made every perk an unlimited button and left QA testing a build that
    // behaved nothing like the one players get — so it pays in coins instead.
    const gate = await loadGate({ crazy: true, fullRelease: false, wallet: 100 })
    const grant = vi.fn()
    expect(gate.isRewardGated).toBe(false)
    await gate.claimReward(grant)
    expect(grant).toHaveBeenCalledTimes(1)
    expect(gate.showRewardedAd).not.toHaveBeenCalled()
    expect(gate.wallet.value).toBe(100 - gate.REWARD_COIN_COST)
  })

  it('plays a rewarded video on a portal build that has one — not a coin price', async () => {
    // The bug this pins: every portal added after CrazyGames inherited the
    // "no ad inventory" arm and priced its perks in wallet gold, so Playgama's
    // QA tool saw a coin cost sitting in front of a live rewarded unit.
    const gate = await loadGate({ playgama: true, wallet: 100 })
    const grant = vi.fn()
    expect(gate.isRewardGated).toBe(true)
    await expect(gate.claimReward(grant)).resolves.toBe(true)
    expect(gate.showRewardedAd).toHaveBeenCalledTimes(1)
    expect(gate.wallet.value).toBe(100)
  })

  it('refuses, and grants nothing, when the coins are not there', async () => {
    const gate = await loadGate({ crazy: true, fullRelease: false, wallet: 5 })
    const grant = vi.fn()
    await expect(gate.claimReward(grant)).resolves.toBe(false)
    expect(grant).not.toHaveBeenCalled()
    expect(gate.wallet.value).toBe(5)
  })

  it('never charges coins where the video IS the price', async () => {
    const gate = await loadGate({ crazy: true, fullRelease: true, wallet: 100 })
    await gate.claimReward(vi.fn())
    expect(gate.showRewardedAd).toHaveBeenCalledTimes(1)
    expect(gate.wallet.value).toBe(100)
  })

  it('leaves an explicitly free perk free — it is the way out of a run', async () => {
    const gate = await loadGate({ crazy: true, fullRelease: false, wallet: 0 })
    const grant = vi.fn()
    await expect(gate.claimReward(grant, { free: true })).resolves.toBe(true)
    expect(grant).toHaveBeenCalledTimes(1)
    expect(gate.wallet.value).toBe(0)
  })

  it('plays a rewarded video on the CrazyGames full release', async () => {
    const gate = await loadGate({ crazy: true, fullRelease: true })
    const grant = vi.fn()
    expect(gate.isRewardGated).toBe(true)
    await expect(gate.claimReward(grant)).resolves.toBe(true)
    expect(gate.showRewardedAd).toHaveBeenCalledTimes(1)
    expect(grant).toHaveBeenCalledTimes(1)
  })

  it('grants nothing when the video does not complete', async () => {
    const gate = await loadGate({ crazy: true, fullRelease: true })
    ;(gate.showRewardedAd as ReturnType<typeof vi.fn>).mockResolvedValueOnce(false)
    const grant = vi.fn()
    await expect(gate.claimReward(grant)).resolves.toBe(false)
    expect(grant).not.toHaveBeenCalled()
  })

  it('refuses to start a second video while one is in flight', async () => {
    const gate = await loadGate({ crazy: true, fullRelease: true })
    let release: (v: boolean) => void = () => {}
    ;(gate.showRewardedAd as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise<boolean>((r) => { release = r })
    )
    const grantA = vi.fn()
    const grantB = vi.fn()
    const first = gate.claimReward(grantA)
    expect(gate.adInFlight.value).toBe(true)
    await expect(gate.claimReward(grantB)).resolves.toBe(false)
    expect(grantB).not.toHaveBeenCalled()
    release(true)
    await first
    expect(grantA).toHaveBeenCalledTimes(1)
    expect(gate.adInFlight.value).toBe(false)
  })

  it('clears the in-flight flag even when the provider throws', async () => {
    const gate = await loadGate({ crazy: true, fullRelease: true })
    ;(gate.showRewardedAd as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('no fill'))
    await expect(gate.claimReward(vi.fn())).rejects.toThrow('no fill')
    // A stuck flag would disable every reward button for the rest of the run.
    expect(gate.adInFlight.value).toBe(false)
  })

  it('hides the offer on a gated build with no ad ready', async () => {
    const gate = await loadGate({ crazy: true, fullRelease: true, rewardedReady: false })
    expect(gate.canOfferReward.value).toBe(false)
  })

  it('always offers the perk on an ungated build, ad inventory or not', async () => {
    const gate = await loadGate({ crazy: false, fullRelease: false, rewardedReady: false })
    expect(gate.canOfferReward.value).toBe(true)
  })
})

describe('interstitial pacing', () => {
  it('never fires in the opening seconds of a session', async () => {
    const gate = await loadGate()
    gate.__resetInterstitialClock()
    // The opening minutes are when a player decides whether the game is worth
    // their time; an ad there is the most reliable way to lose them. Session
    // start IS the previous break, so no special first-call case is needed.
    expect(gate.canShowInterstitial()).toBe(false)
  })

  it('lets the death screen take the opening break without waiting it out', async () => {
    const gate = await loadGate()
    gate.__resetInterstitialClock()
    // The floor exists to stop breaks STACKING. Before the first one there is
    // nothing to stack against, and the end of a first run is the moment a
    // player is least likely to resent one.
    expect(gate.canShowInterstitial({ firstIsExempt: true })).toBe(true)
  })

  it('spends the opening exemption on the first break from ANY placement', async () => {
    vi.useFakeTimers()
    const gate = await loadGate()
    gate.__resetInterstitialClock()

    // A wave-clear break lands once the floor has elapsed...
    vi.advanceTimersByTime(121_000)
    expect(gate.canShowInterstitial()).toBe(true)
    gate.markInterstitialShown()

    // ...and the player dies ten seconds later. "The first one is free" must
    // not mean two ads inside the same minute.
    vi.advanceTimersByTime(10_000)
    expect(gate.canShowInterstitial({ firstIsExempt: true })).toBe(false)
  })

  it('puts the death screen back on the clock after its own first break', async () => {
    vi.useFakeTimers()
    const gate = await loadGate()
    gate.__resetInterstitialClock()

    expect(gate.canShowInterstitial({ firstIsExempt: true })).toBe(true)
    gate.markInterstitialShown()

    // Second run, ended quickly: no second break so soon after the first.
    vi.advanceTimersByTime(30_000)
    expect(gate.canShowInterstitial({ firstIsExempt: true })).toBe(false)

    vi.advanceTimersByTime(91_000)
    expect(gate.canShowInterstitial({ firstIsExempt: true })).toBe(true)
  })

  it('keeps the wave-clear break behind the floor even as the first of a session', async () => {
    vi.useFakeTimers()
    const gate = await loadGate()
    gate.__resetInterstitialClock()

    // Without this, a fast first wave spends the opening break 40 seconds in,
    // on a player who has not finished a run yet.
    vi.advanceTimersByTime(40_000)
    expect(gate.canShowInterstitial()).toBe(false)
  })

  it('holds the break for a full 121 seconds', async () => {
    vi.useFakeTimers()
    const gate = await loadGate()
    gate.__resetInterstitialClock()

    vi.advanceTimersByTime(120_000)
    // 120 s exactly is the Playgama bridge's own floor — asking there is a
    // coin toss between "shown" and "refused for pacing", so we don't ask.
    expect(gate.canShowInterstitial()).toBe(false)

    vi.advanceTimersByTime(1_000)
    expect(gate.canShowInterstitial()).toBe(true)
  })

  it('lets the FIRST opportunity through once the gap has elapsed', async () => {
    vi.useFakeTimers()
    const gate = await loadGate()
    gate.__resetInterstitialClock()

    // The clock used to start lazily on the first call, so a player who
    // reached their first wave clear late got an ad-free run for free.
    vi.advanceTimersByTime(121_000)
    expect(gate.canShowInterstitial()).toBe(true)
  })

  it('restarts the clock once a break is actually shown', async () => {
    vi.useFakeTimers()
    const gate = await loadGate()
    gate.__resetInterstitialClock()

    vi.advanceTimersByTime(121_000)
    expect(gate.canShowInterstitial()).toBe(true)
    gate.markInterstitialShown()

    // Immediately after a break, the next one is a full gap away again — this
    // is what stops a fast run from stacking two breaks in a row.
    expect(gate.canShowInterstitial()).toBe(false)
    expect(gate.interstitialCooldownLeft()).toBeGreaterThan(120)

    vi.advanceTimersByTime(121_000)
    expect(gate.canShowInterstitial()).toBe(true)
  })
})

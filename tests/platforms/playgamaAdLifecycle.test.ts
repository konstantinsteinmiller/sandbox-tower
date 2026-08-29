import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * When the Playgama ad wrappers are allowed to RESOLVE.
 *
 * This is the ad-before-the-result-screen contract, seen from underneath.
 * `presentDefeat` awaits the interstitial and only then reveals the death
 * screen, so the moment this promise resolves IS the moment the screen appears.
 * Resolve it early and the screen is revealed while the ad is still on its way —
 * the ad then lands on top of it, which from the outside looks exactly like
 * "the interstitial fired after the death screen".
 *
 * `bridge.advertisement.showInterstitial()` resolves when the request is
 * DISPATCHED, not when the ad opens, so it can never be the settle signal. The
 * lifecycle events are. The old code gave a silent bridge 800 ms measured from
 * dispatch — shorter than a normal waterfall takes to render.
 */

const load = async () => {
  vi.resetModules()
  const listeners: Record<string, Array<(s: string) => void>> = {}
  const calls: string[] = []
  const bridge = {
    EVENT_NAME: {
      INTERSTITIAL_STATE_CHANGED: 'interstitial_state_changed',
      REWARDED_STATE_CHANGED: 'rewarded_state_changed'
    },
    advertisement: {
      on: (name: string, cb: (s: string) => void) => {
        (listeners[name] = listeners[name] ?? []).push(cb)
        return () => {}
      },
      showInterstitial: () => { calls.push('interstitial'); return Promise.resolve() },
      showRewarded: () => { calls.push('rewarded'); return Promise.resolve() }
    }
  }
  ;(globalThis as any).window = globalThis as any
  ;(globalThis as any).bridge = bridge

  vi.doMock('@/use/useUser', () => ({ isPlaygama: true }))

  const mod = await import('@/utils/playgamaPlugin')
  // The show wrappers await the init singleton first; it resolves immediately
  // on a non-Playgama-flagged module, and here the bridge is already present.
  const emit = (event: string, state: string) => {
    for (const cb of listeners[event] ?? []) cb(state)
  }
  return { ...mod, emit, calls }
}

/** Let the awaited init singleton + dispatch promise flush. */
const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

beforeEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('interstitial resolution', () => {
  it('does NOT resolve on dispatch — an ad that opens late still gets its turn', async () => {
    vi.useFakeTimers()
    const m = await load()

    let settled = false
    void m.showInterstitialPG().then(() => { settled = true })

    // Flush the init + dispatch promises without moving the clock.
    await vi.advanceTimersByTimeAsync(0)

    // 1.5 s later the ad finally reports in — well past the old 800 ms bail.
    await vi.advanceTimersByTimeAsync(1_500)
    m.emit('interstitial_state_changed', 'opened')
    expect(settled).toBe(false)

    // Still open ten seconds in. The death screen must still be waiting.
    await vi.advanceTimersByTimeAsync(10_000)
    expect(settled).toBe(false)

    m.emit('interstitial_state_changed', 'closed')
    await vi.advanceTimersByTimeAsync(0)
    expect(settled).toBe(true)
  })

  it('settles immediately on a real no-fill, so the player is not left waiting', async () => {
    vi.useFakeTimers()
    const m = await load()

    let settled = false
    void m.showInterstitialPG().then(() => { settled = true })
    await vi.advanceTimersByTimeAsync(0)

    m.emit('interstitial_state_changed', 'failed')
    await vi.advanceTimersByTimeAsync(0)
    expect(settled).toBe(true)
  })

  it('gives up on a bridge that never says anything at all', async () => {
    vi.useFakeTimers()
    const m = await load()

    let settled = false
    void m.showInterstitialPG().then(() => { settled = true })
    await vi.advanceTimersByTimeAsync(0)

    await vi.advanceTimersByTimeAsync(3_000)
    expect(settled).toBe(false)

    await vi.advanceTimersByTimeAsync(1_500)
    expect(settled).toBe(true)
  })
})

describe('rewarded resolution', () => {
  it('grants on the `rewarded` edge, which can arrive before `closed`', async () => {
    vi.useFakeTimers()
    const m = await load()

    let granted: boolean | null = null
    void m.showRewardedPG().then((v) => { granted = v })
    await vi.advanceTimersByTimeAsync(0)

    await vi.advanceTimersByTimeAsync(2_000)
    m.emit('rewarded_state_changed', 'opened')
    m.emit('rewarded_state_changed', 'rewarded')
    expect(granted).toBe(null)

    m.emit('rewarded_state_changed', 'closed')
    await vi.advanceTimersByTimeAsync(0)
    expect(granted).toBe(true)
  })

  it('grants nothing when the player closes without watching', async () => {
    vi.useFakeTimers()
    const m = await load()

    let granted: boolean | null = null
    void m.showRewardedPG().then((v) => { granted = v })
    await vi.advanceTimersByTimeAsync(0)

    m.emit('rewarded_state_changed', 'opened')
    m.emit('rewarded_state_changed', 'closed')
    await vi.advanceTimersByTimeAsync(0)
    expect(granted).toBe(false)
  })
})

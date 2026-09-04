// ─── Poki gameplay-bracket guard ────────────────────────────────────────────
//
// This is the highest-value test in the Poki integration, because the bug it
// guards against is INVISIBLE at runtime: it costs revenue and reports nothing.
//
// De-minifying the shipped `poki-sdk-core` bundle gives:
//
//   Jc.set(this, () => badEvents >= 10)            // gate on start/stop/commercialBreak
//   // gameplayStop:  lastStopAt = performance.now()
//   // gameplayStart: if (lastStopAt && lastStopAt > performance.now() - 50) badEvents++
//   setInterval(() => { badEvents = Math.max(badEvents - 1, 0) }, 1000)
//
// A `gameplayStart()` within 50 ms of the preceding `gameplayStop()` is scored a
// "bad event". At ten of them, `gameplayStart`, `gameplayStop` AND
// `commercialBreak` all become no-ops for the rest of the session — the game
// keeps running and simply stops earning.
//
// This project drives the bracket from `watch(isLiveGameplay, …)` in GameScene,
// and `isLiveGameplay` is a computed over FOUR reactive inputs (phase /
// showResult / isAnyModalOpen / isAdShowing). A modal closing in the same tick
// an ad opens produces exactly the sub-50 ms stop→start pair the SDK penalises,
// so the guard has to live in the plugin rather than at the call site.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Emitted = { kind: 'start' | 'stop', at: number }

const GUARD_MS = 120

const loadPlugin = async () => {
  vi.resetModules()
  return await import('@/utils/pokiPlugin')
}

/** Minimal PokiSDK double that records the ORDER and TIMING of the two
 *  bracket events — the only two things the bad-event counter looks at. */
const installSdkSpy = (): Emitted[] => {
  const emitted: Emitted[] = []
  ;(window as unknown as { PokiSDK: unknown }).PokiSDK = {
    gameplayStart: () => emitted.push({ kind: 'start', at: performance.now() }),
    gameplayStop: () => emitted.push({ kind: 'stop', at: performance.now() }),
    gameLoadingFinished: () => {},
    init: () => Promise.resolve(),
    commercialBreak: () => Promise.resolve(),
    rewardedBreak: () => Promise.resolve(false),
    measure: () => {},
    captureError: () => {},
    getLanguage: () => 'en',
    getDeviceInfo: () => ({ category: 'desktop' })
  }
  return emitted
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('poki gameplay bracket', () => {
  beforeEach(() => { installSdkSpy() })
  afterEach(() => { delete (window as unknown as { PokiSDK?: unknown }).PokiSDK })

  it('never emits a start within the SDK bad-event window of a stop', async () => {
    const emitted = installSdkSpy()
    const { pokiGameplayStart, pokiGameplayStop } = await loadPlugin()

    // The pathological case: a reactive boolean thrashing inside one tick.
    for (let i = 0; i < 30; i++) {
      pokiGameplayStart()
      pokiGameplayStop()
    }
    await wait(GUARD_MS * 3)

    expect(emitted.length).toBeGreaterThan(0)
    emitted.forEach((e, i) => {
      if (i === 0) return
      const prev = emitted[i - 1]
      // No duplicate consecutive events (an explicit Poki quality requirement).
      expect(e.kind).not.toBe(prev.kind)
      // And no start inside the guard window of the preceding stop.
      if (e.kind === 'start') {
        expect(e.at - prev.at).toBeGreaterThanOrEqual(GUARD_MS)
      }
    })
  })

  it('collapses duplicate consecutive starts and stops', async () => {
    const emitted = installSdkSpy()
    const { pokiGameplayStart, pokiGameplayStop } = await loadPlugin()

    pokiGameplayStart()
    pokiGameplayStart()
    pokiGameplayStart()
    pokiGameplayStop()
    pokiGameplayStop()
    await wait(GUARD_MS * 2)

    expect(emitted.map((e) => e.kind)).toEqual(['start', 'stop'])
  })

  it('drops a deferred start entirely when a stop arrives before it fires', async () => {
    const emitted = installSdkSpy()
    const { pokiGameplayStart, pokiGameplayStop } = await loadPlugin()

    pokiGameplayStart()   // emits immediately (no preceding stop)
    pokiGameplayStop()    // emits, arms the guard window
    pokiGameplayStart()   // inside the window -> deferred, not emitted yet
    pokiGameplayStop()    // cancels the pending start
    await wait(GUARD_MS * 3)

    // The deferred start never reached the SDK, so no unmatched stop follows it.
    expect(emitted.map((e) => e.kind)).toEqual(['start', 'stop'])
  })

  it('still delivers a deferred start once the window has passed', async () => {
    const emitted = installSdkSpy()
    const { pokiGameplayStart, pokiGameplayStop } = await loadPlugin()

    pokiGameplayStart()
    pokiGameplayStop()
    pokiGameplayStart()   // deferred by the guard
    await wait(GUARD_MS * 3)

    // Deferred, NOT dropped — the bracket still reaches Poki, just late enough
    // that the SDK doesn't score it.
    expect(emitted.map((e) => e.kind)).toEqual(['start', 'stop', 'start'])
    const [, stop, start] = emitted
    expect(start.at - stop.at).toBeGreaterThanOrEqual(GUARD_MS)
  })

  it('emits normally when the game paces itself outside the window', async () => {
    const emitted = installSdkSpy()
    const { pokiGameplayStart, pokiGameplayStop } = await loadPlugin()

    pokiGameplayStart()
    pokiGameplayStop()
    await wait(GUARD_MS * 2)
    pokiGameplayStart()
    await wait(10)

    expect(emitted.map((e) => e.kind)).toEqual(['start', 'stop', 'start'])
  })

  it('sends gameLoadingFinished exactly once', async () => {
    let count = 0
    installSdkSpy()
    ;(window as unknown as { PokiSDK: { gameLoadingFinished: () => void } })
      .PokiSDK.gameLoadingFinished = () => { count++ }

    const { pokiGameLoadingFinished } = await loadPlugin()
    pokiGameLoadingFinished()
    pokiGameLoadingFinished()
    pokiGameLoadingFinished()

    expect(count).toBe(1)
  })

  it('is inert when the SDK never loaded (ad-blocked / CDN down)', async () => {
    delete (window as unknown as { PokiSDK?: unknown }).PokiSDK
    const { pokiGameplayStart, pokiGameplayStop, pokiGameLoadingFinished } = await loadPlugin()

    // Poki requires the game to stay fully playable with an ad blocker active,
    // so none of these may throw when `window.PokiSDK` is absent.
    expect(() => {
      pokiGameplayStart()
      pokiGameplayStop()
      pokiGameLoadingFinished()
    }).not.toThrow()
  })
})

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

/**
 * Load the plugin with the interaction gate ALREADY OPEN.
 *
 * Every spec below this exercises the bad-event debounce, which now sits
 * behind Poki's "no gameplayStart before a real gesture" rule. Opening the
 * gate here keeps those tests testing the thing they were written for; the
 * gate itself is covered by its own describe block.
 */
const loadPlugin = async () => {
  const mod = await loadPluginGated()
  mod.pokiNoteUserInteraction()
  return mod
}

/**
 * The module instance the running spec is using.
 *
 * Held so `afterEach` can clear its PENDING deferred start. `vi.resetModules()`
 * orphans a module but not its timers, and an orphaned `setTimeout` that fires
 * later still calls `getSdk()` — which by then is the NEXT spec's spy. The
 * phantom event that lands in it is invisible until the ordering assertions
 * fail on a loaded machine and pass on a quiet one.
 */
let loaded: { __resetPokiGameplayBracketForTests: () => void } | null = null

/** Load the plugin with the gate still shut. */
const loadPluginGated = async () => {
  vi.resetModules()
  const mod = await import('@/utils/pokiPlugin')
  loaded = mod
  return mod
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

/**
 * Wait until `n` events have been emitted, or give up.
 *
 * The specs below are about ORDER and SPACING, not about how promptly a timer
 * fires — but a fixed sleep asserts both, and the second one is not this
 * project's to guarantee: under a loaded parallel run the deferred start can
 * land a few tens of milliseconds late and the spec fails on something no
 * player would ever see. Polling for the emission keeps every real assertion
 * (including the >= 120 ms gap) and drops the one that was measuring the CI
 * machine.
 */
const waitForEvents = async (emitted: Emitted[], n: number, budget = 2000): Promise<void> => {
  const until = performance.now() + budget
  while (emitted.length < n && performance.now() < until) await wait(10)
}

describe('poki gameplay bracket', () => {
  beforeEach(() => { installSdkSpy() })
  afterEach(() => {
    // Order matters: retire the spec's own pending timer BEFORE the next one
    // installs its spy, or the timer lands in that one's event list.
    loaded?.__resetPokiGameplayBracketForTests()
    loaded = null
    delete (window as unknown as { PokiSDK?: unknown }).PokiSDK
  })

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
    await waitForEvents(emitted, 2)

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
    await waitForEvents(emitted, 3)

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
    await waitForEvents(emitted, 3)

    expect(emitted.map((e) => e.kind)).toEqual(['start', 'stop', 'start'])
  })

  // ── The interaction gate ──
  //
  // Poki rejects a build that reports `gameplayStart()` before the player has
  // touched the page, and nothing throws when you break it: the numbers just
  // look better (every bounce counts as a conversion) until QA sends it back.
  // A game with no menu — which is what this one is — opens its bracket
  // during mount, so the gate is the only thing standing between the design
  // and the rejection.

  it('holds the first start until the player actually interacts', async () => {
    const emitted = installSdkSpy()
    const { pokiGameplayStart, pokiNoteUserInteraction } = await loadPluginGated()

    pokiGameplayStart()
    await wait(GUARD_MS)
    expect(emitted).toEqual([])           // the mount-time start, withheld

    pokiNoteUserInteraction()
    await wait(10)
    expect(emitted.map((e) => e.kind)).toEqual(['start'])
  })

  it('does not open the gate for an untrusted event', async () => {
    const emitted = installSdkSpy()
    const { pokiGameplayStart } = await loadPluginGated()

    pokiGameplayStart()
    // A synthetic event is not a player. `isTrusted` is false for anything
    // `dispatchEvent` produces, which is exactly the point.
    window.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await wait(GUARD_MS)

    expect(emitted).toEqual([])
  })

  it('emits nothing at all when the bracket closes while a start is held',
    async () => {
      const emitted = installSdkSpy()
      const { pokiGameplayStart, pokiGameplayStop, pokiNoteUserInteraction } =
        await loadPluginGated()

      pokiGameplayStart()   // held behind the gate
      pokiGameplayStop()    // a modal opened before the player ever acted
      pokiNoteUserInteraction()
      await wait(GUARD_MS)

      // No start reached the SDK, so a stop would be unmatched — itself a bad
      // event — and the released gesture must not resurrect a closed bracket.
      expect(emitted).toEqual([])
    })

  it('starts immediately when the player interacted before the bracket opened',
    async () => {
      const emitted = installSdkSpy()
      const { pokiGameplayStart, pokiNoteUserInteraction } = await loadPluginGated()

      // A tap during the splash. The listeners are armed at init, so by the
      // time the stage goes live the gate is already open and the player is
      // not asked for a second gesture.
      pokiNoteUserInteraction()
      pokiGameplayStart()
      await wait(10)

      expect(emitted.map((e) => e.kind)).toEqual(['start'])
    })

  it('opens the gate from sticky user activation when it arms too late',
    async () => {
      const emitted = installSdkSpy()
      // The player tapped while the SDK script was still in flight, so our
      // own listeners never saw it — but the document is activated.
      Object.defineProperty(navigator, 'userActivation', {
        value: { hasBeenActive: true, isActive: true },
        configurable: true
      })
      try {
        const { pokiPlugin, pokiGameplayStart } = await loadPluginGated()
        await pokiPlugin()
        pokiGameplayStart()
        await wait(10)
        expect(emitted.map((e) => e.kind)).toEqual(['start'])
      } finally {
        delete (navigator as { userActivation?: unknown }).userActivation
      }
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

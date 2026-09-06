import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * ─── No gameplayStart before the player has touched the game ────────────────
 *
 * The game boots straight into a live stage — no menu, by design, and on the
 * Drop & Merge board wave 1 is already walking in by the time the loader
 * clears. So `isLiveGameplay` goes true during mount, and the scene's
 * `watch(…, { immediate: true })` would report a start before anyone had
 * moved.
 *
 * Poki rejects that by hand in QA, but the reason is the same on every portal:
 * conversion-to-play is measured on the FIRST start, so one fired on load
 * counts every bounce as a player. It flatters the number and makes it useless.
 *
 * The fan-out therefore holds the OPENING edge until the first trusted
 * gesture. A stop is never held — every plugin behind this no-ops a stop for a
 * bracket it never opened, and a start that is still waiting when the game
 * goes quiet must be dropped rather than delivered late.
 */

const load = async () => {
  vi.resetModules()
  const calls: string[] = []
  vi.doMock('@/use/useCrazyGames', () => ({
    syncGameplayLifecycle: (live: boolean) => calls.push(live ? 'start' : 'stop')
  }))
  vi.doMock('@/utils/pokiPlugin', () => ({
    pokiGameplayStart: () => {},
    pokiGameplayStop: () => {}
  }))
  const gate = await import('@/use/useFirstInteraction')
  const mod = await import('@/use/useGameplayLifecycle')
  return { ...mod, gate, calls }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('gameplay lifecycle gate', () => {
  it('holds the first start until the player acts', async () => {
    const m = await load()
    m.gate.armFirstInteraction()

    m.syncGameplayLifecycle(true)
    expect(m.calls).toEqual([])

    m.gate.noteUserInteraction()
    expect(m.calls).toEqual(['start'])
  })

  it('reports normally once the gate is open', async () => {
    const m = await load()
    m.gate.armFirstInteraction()
    m.gate.noteUserInteraction()

    m.syncGameplayLifecycle(true)
    m.syncGameplayLifecycle(false)
    m.syncGameplayLifecycle(true)
    expect(m.calls).toEqual(['start', 'stop', 'start'])
  })

  it('drops a held start when play stops before the gesture arrives', async () => {
    const m = await load()
    m.gate.armFirstInteraction()

    // A modal or an ad opened while the player was still reading the page.
    m.syncGameplayLifecycle(true)
    m.syncGameplayLifecycle(false)
    m.gate.noteUserInteraction()

    // The start never happened, so the stop has nothing to close — and the
    // gesture must not resurrect a bracket the game has already closed.
    expect(m.calls).toEqual(['stop'])
  })

  it('delivers a start that is still wanted when the gesture lands', async () => {
    const m = await load()
    m.gate.armFirstInteraction()

    m.syncGameplayLifecycle(true)
    m.syncGameplayLifecycle(false)
    m.syncGameplayLifecycle(true)
    expect(m.calls).toEqual(['stop'])

    m.gate.noteUserInteraction()
    expect(m.calls).toEqual(['stop', 'start'])
  })

  it('does not gate a headless run — the watch has to be armed', async () => {
    const m = await load()
    // Nothing armed the gesture watch, so there is no player to wait for and
    // the fan-out behaves exactly as it did before the gate existed.
    m.syncGameplayLifecycle(true)
    expect(m.calls).toEqual(['start'])
  })
})

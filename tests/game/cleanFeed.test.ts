import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * ─── The clean-feed flag ────────────────────────────────────────────────────
 *
 * `?clean=1` is what the preview-video recorder (`tools/preview-video`) uses to
 * switch off the interface the RENDERER paints — damage bars, the build
 * overlay, the merge-tier plates, the world cues — for a portal clip that must
 * be "pure gameplay: no text, counters, UI or logos". The recorder can hide the
 * DOM and no-op canvas text on its own; it cannot reach those.
 *
 * Two properties are worth pinning, and neither is visible in play:
 *
 *  • it reads the param out of EITHER half of the URL. The router is on hash
 *    history, so `?clean=1#/` (what the recorder opens) and `#/?clean=1` (what
 *    a route push leaves behind) must both work — this is the same trap
 *    `useDeviceTier` and `art.ts` each have their own parser for.
 *  • it is OFF in a production build no matter what the URL says. A portal
 *    reviewer one query parameter away from a HUD-less game is a bug report,
 *    and `CLEAN_FEED` is a module-load constant, so the guard has to be there
 *    rather than at the call sites.
 */

const at = (href: string): void => {
  vi.stubGlobal('window', { location: { href } } as unknown as Window & typeof globalThis)
}

const loadFlag = async (href: string, dev: boolean): Promise<boolean> => {
  vi.resetModules()
  at(href)
  vi.stubEnv('DEV', dev)
  const mod = await import('@/game/cleanFeed')
  return mod.CLEAN_FEED
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('clean-feed query', () => {
  it('reads the flag from a plain query and from the hash', async () => {
    const { __readCleanParam } = await import('@/game/cleanFeed')
    for (const href of [
      'http://localhost:2063/?clean=1',
      'http://localhost:2063/?clean=1#/',
      'http://localhost:2063/#/?clean=1',
      'http://localhost:2063/?tier=high&clean=on#/',
      'http://localhost:2063/#/?fit=dropmerge&clean=true'
    ]) {
      at(href)
      expect(__readCleanParam(), href).toBe(true)
    }
  })

  it('stays off with no param, an empty value or an unrelated one', async () => {
    const { __readCleanParam } = await import('@/game/cleanFeed')
    for (const href of [
      'http://localhost:2063/',
      'http://localhost:2063/#/',
      'http://localhost:2063/?clean=0',
      'http://localhost:2063/?clean=off',
      'http://localhost:2063/?cleanup=1',
      'http://localhost:2063/?tier=high#/'
    ]) {
      at(href)
      expect(__readCleanParam(), href).toBe(false)
    }
  })
})

describe('clean feed is a development seam', () => {
  it('is on in dev when the param is set', async () => {
    expect(await loadFlag('http://localhost:2063/?clean=1', true)).toBe(true)
  })

  it('is off in a production build however the URL is dressed up', async () => {
    expect(await loadFlag('http://localhost:2063/?clean=1', false)).toBe(false)
    expect(await loadFlag('http://localhost:2063/#/?clean=1', false)).toBe(false)
  })
})

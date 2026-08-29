import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type { LocalStorageAccessor } from '@/utils/save/types'

/**
 * Playgama cloud saves.
 *
 * `hydrate()` used to be a no-op that reported `success-with-data` regardless.
 * That is invisible in exactly the wrong way: writes still reached the bridge,
 * so the integration looked healthy, but nothing was ever read back — a second
 * device (or the same device after the portal iframe's storage was cleared)
 * booted at defaults, and the fake terminal state also disabled SaveManager's
 * "never push before a successful hydrate" rule, so those defaults were then
 * published over the real save.
 *
 * These tests pin the read, the merge, and the refusal to push before the
 * cloud has been read.
 */

const STATE_KEY = 'tower_state'
const META_KEY = '__save_meta__'

interface BridgeHarness {
  sets: Array<[string, string, string]>
  deletes: string[]
  cloud: Map<string, string>
  cloudAvailable: boolean
  getCalls: Array<{ keys: unknown; type: unknown; tryParseJson: unknown }>
  /** When true, `get` answers an array query with a keyed object instead. */
  answerAsObject: boolean
}

const makeLocal = (seed: Record<string, string> = {}): LocalStorageAccessor => {
  const map = new Map(Object.entries(seed))
  return {
    get: (k) => map.get(k) ?? null,
    set: (k, v) => { map.set(k, v) },
    remove: (k) => { map.delete(k) },
    keys: () => [...map.keys()]
  }
}

const meta = (score: number, savedAt: string) => JSON.stringify({
  savedAt, progressScore: score, schemaVersion: 1, maxStage: Math.floor(score / 500)
})

const load = async (opts: {
  cloud?: Record<string, string>
  cloudAvailable?: boolean
  sdkActive?: boolean
  answerAsObject?: boolean
} = {}) => {
  vi.resetModules()
  const h: BridgeHarness = {
    sets: [],
    deletes: [],
    cloud: new Map(Object.entries(opts.cloud ?? {})),
    cloudAvailable: opts.cloudAvailable ?? true,
    getCalls: [],
    answerAsObject: opts.answerAsObject ?? false
  }

  const storage = {
    isAvailable: (type: string) => type === 'platform_internal' ? h.cloudAvailable : true,
    get: (keys: unknown, type: unknown, tryParseJson: unknown) => {
      h.getCalls.push({ keys, type, tryParseJson })
      const list = Array.isArray(keys) ? keys : [keys]
      if (h.answerAsObject) {
        const out: Record<string, string | null> = {}
        for (const k of list) out[String(k)] = h.cloud.get(String(k)) ?? null
        return Promise.resolve(out)
      }
      return Promise.resolve(list.map((k) => h.cloud.get(String(k)) ?? null))
    },
    set: (k: string, v: string, type: string) => {
      h.sets.push([k, v, type])
      h.cloud.set(k, v)
      return Promise.resolve()
    },
    delete: (k: string) => { h.deletes.push(k); h.cloud.delete(k); return Promise.resolve() }
  }

  const sdkActive = ref(opts.sdkActive ?? true)
  vi.doMock('@/utils/playgamaPlugin', () => ({
    isPlaygamaSdkActive: sdkActive,
    getPlaygamaBridge: () => ({ storage }),
    playgamaPlugin: async () => {}
  }))

  const { PlaygamaStrategy } = await import('@/utils/save/PlaygamaStrategy')
  return { strategy: new PlaygamaStrategy(), h, sdkActive }
}

/** The write path drains through awaited bridge calls. */
const settle = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('Playgama hydrate', () => {
  it('reads the cloud with tryParseJson disabled', async () => {
    // The real signature is `get(keys, storageType, tryParseJson = true)`. The
    // payload IS a JSON string, so the default hands back a parsed object and
    // the obvious `typeof value === "string"` check drops the whole save.
    const { strategy, h } = await load({ cloud: { [STATE_KEY]: '{"ts_coins":5}' } })
    await strategy.hydrate(makeLocal())

    expect(h.getCalls).toHaveLength(1)
    expect(h.getCalls[0]!.tryParseJson).toBe(false)
    expect(h.getCalls[0]!.type).toBe('platform_internal')
  })

  it('seeds local from the cloud for a player with nothing on this device', async () => {
    const { strategy } = await load({
      cloud: {
        [STATE_KEY]: '{"ts_best_wave":12}',
        [META_KEY]: meta(6000, '2026-08-01T00:00:00.000Z')
      }
    })
    const local = makeLocal()
    await strategy.hydrate(local)

    expect(local.get(STATE_KEY)).toBe('{"ts_best_wave":12}')
    expect(strategy.hydrateState).toBe('success-with-data')
  })

  it('accepts a keyed-object answer as well as a positional array', async () => {
    const { strategy } = await load({
      cloud: { [STATE_KEY]: '{"ts_best_wave":3}' },
      answerAsObject: true
    })
    const local = makeLocal()
    await strategy.hydrate(local)

    expect(local.get(STATE_KEY)).toBe('{"ts_best_wave":3}')
  })

  it('keeps the local save when it is further along, and pushes it up', async () => {
    const { strategy, h } = await load({
      cloud: {
        [STATE_KEY]: '{"ts_best_wave":2}',
        [META_KEY]: meta(1000, '2026-08-01T00:00:00.000Z')
      }
    })
    const local = makeLocal({
      [STATE_KEY]: '{"ts_best_wave":20}',
      [META_KEY]: meta(10_000, '2026-08-02T00:00:00.000Z')
    })
    await strategy.hydrate(local)
    await settle()

    expect(local.get(STATE_KEY)).toBe('{"ts_best_wave":20}')
    expect(h.sets.map(([k]) => k)).toContain(STATE_KEY)
  })

  it('refuses to publish anything before the cloud has been read', async () => {
    // The bridge never came up. Local writes must queue, not overwrite a
    // remote save this session has never looked at.
    const { strategy, h, sdkActive } = await load({ sdkActive: false })
    await strategy.hydrate(makeLocal())

    expect(strategy.hydrateState).toBe('failed-retrying')

    strategy.onLocalSet(STATE_KEY, '{"ts_coins":1}')
    await settle()
    expect(h.sets).toHaveLength(0)

    sdkActive.value = true
    strategy.dispose()
  })

  it('warns loudly when only local storage is reachable', async () => {
    // `platform_internal` is gated on `allowAnonymousCloudSave || isAuthorized`.
    // A silent fallback here looks exactly like a working integration.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { strategy } = await load({ cloudAvailable: false })
    await strategy.hydrate(makeLocal())

    expect(warn.mock.calls.some(
      (c) => String(c[0]).includes('allowAnonymousCloudSave')
    )).toBe(true)
  })
})

describe('Playgama writes', () => {
  it('mirrors payload keys through the bridge even on local storage', async () => {
    // The QA tool watches `bridge.storage.set` as its "Game Saves" signal, so
    // skipping the call on a local-only context fails the gate at 0% however
    // much local state actually lands.
    const { strategy, h } = await load({ cloudAvailable: false })
    await strategy.hydrate(makeLocal())

    strategy.onLocalSet(STATE_KEY, '{"ts_coins":7}')
    await settle()

    expect(h.sets).toEqual([[STATE_KEY, '{"ts_coins":7}', 'local_storage']])
  })

  it('does not mirror keys that are not part of the save payload', async () => {
    const { strategy, h } = await load()
    await strategy.hydrate(makeLocal())

    strategy.onLocalSet('li-module-enabled', 'true')
    strategy.onLocalSet('vConsole_switch_x', '42')
    await settle()

    expect(h.sets).toHaveLength(0)
  })

  it('short-circuits the bridge write-back that would recurse forever', async () => {
    // The bridge's local adapter calls `localStorage.setItem` inside `set`,
    // which re-enters `onLocalSet` through SaveManager's patched setItem. The
    // guard has to hold for the whole awaited lifetime of the outbound call.
    const { strategy, h } = await load()
    await strategy.hydrate(makeLocal())

    let echoed = false
    const echo = () => {
      if (echoed) return
      echoed = true
      // Exactly what the bridge's own localStorage write triggers.
      strategy.onLocalSet(STATE_KEY, '{"a":1}')
    }
    // Wrap the harness's `set` so it echoes back synchronously, like the real
    // adapter does, while our call is still in flight.
    const bridge = (await import('@/utils/playgamaPlugin')).getPlaygamaBridge() as any
    const original = bridge.storage.set
    bridge.storage.set = (k: string, v: string, t: string) => {
      const p = original(k, v, t)
      echo()
      return p
    }

    strategy.onLocalSet(STATE_KEY, '{"a":1}')
    await settle()
    await settle()

    expect(echoed).toBe(true)
    // One write, not an unbounded recursion.
    expect(h.sets).toEqual([[STATE_KEY, '{"a":1}', 'platform_internal']])
    strategy.dispose()
  })
})

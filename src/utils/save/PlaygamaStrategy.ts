// ─── Playgama save strategy ────────────────────────────────────────────────
//
// Mirrors every meaningful `localStorage` write through `bridge.storage`.
// Prefers cloud (`platform_internal`) and falls back to `local_storage`
// when the active Playgama context (or QA tool) doesn't expose cloud.
//
// **Two non-obvious rules** baked into this implementation — both are
// rejection-grade issues on the Playgama QA Tool:
//
//   1. **Never skip the bridge call when storageType === 'local_storage'.**
//      The "Game Saves" certification check watches `bridge.storage.set` as
//      its detection signal. A "local-only → skip" optimization breaks the
//      gate at 0% even when local writes are landing fine.
//
//   2. **Break the SaveManager↔bridge re-entrancy with `writeInFlight`,
//      NOT a local-mode skip.** The bridge's local adapter calls
//      `window.localStorage.setItem` internally during `storage.set`. That
//      hits SaveManager's patched setItem → `strategy.onLocalSet` → us →
//      another `storage.set` → ∞. The guard short-circuits the re-entrant
//      `onLocalSet` for the duration of an outbound `set` call.
//
// Hydrate READS the cloud. It used to be a no-op with a hard-coded
// `hydrateState = 'success-with-data'`, which is invisible in exactly the wrong
// way: writes still reached the bridge, so the integration looked healthy, but
// nothing was ever read back. A player on a second device — or the same device
// after the portal iframe's storage was cleared — booted at defaults, and the
// fake terminal state ALSO disabled SaveManager's boot sanity guard and its
// "never push before a successful hydrate" rule, so those defaults were then
// published over the real save.
//
// The read is only possible because `main.ts` now AWAITS `playgamaPlugin()`
// before constructing the SaveManager: the bridge's `storage` getter throws
// `Before using the SDK you must initialize it` pre-init. `hydrate()` awaits
// the same (idempotent, singleton) promise as a second line of defence.

import { ref } from 'vue'
import type {
  HydrateNotice,
  HydrateNoticeListener,
  HydrateState,
  LocalStorageAccessor,
  SaveStrategy
} from './types'
import {
  META_KEY,
  computeMeta,
  decideMerge,
  isPayloadKey,
  parseMeta,
  serializeMeta,
  type SaveMeta
} from './SaveMergePolicy'
import { STATE_KEY } from '@/use/useTowerState'
import {
  getPlaygamaBridge,
  isPlaygamaSdkActive,
  playgamaPlugin
} from '@/utils/playgamaPlugin'

const FLUSH_POLL_MS = 250
/** Floor between hydrate retries driven by the flush poll. */
const HYDRATE_RETRY_MS = 3_000

/** Storage types the bridge accepts as the third arg of `set`/`get`. */
type StorageType = 'platform_internal' | 'local_storage'

/** Subset of `bridge.storage` we touch — defensively typed so future bridge
 *  versions can add fields without us breaking. */
interface BridgeStorage {
  defaultType?: StorageType
  isAvailable?: (type: StorageType) => boolean | Promise<boolean>
  set?: (key: string, value: string, type?: StorageType) => unknown
  // The real signature is `get(key | key[], storageType?, tryParseJson = true)`.
  // The default hands back a PARSED object for a JSON payload — and ours is a
  // JSON string — so the obvious `typeof value === 'string'` check would drop
  // the player's whole save on the floor. Always pass `false`.
  get?: (key: string | string[], type?: StorageType, tryParseJson?: boolean) => unknown
  delete?: (key: string | string[], type?: StorageType) => unknown
}

const getBridgeStorage = (): BridgeStorage | null => {
  // Gate on `isPlaygamaSdkActive` first: the bridge's `storage` getter
  // throws `Before using the SDK you must initialize it` when accessed
  // before `initialize()` has resolved. Without the gate, hydrate (which
  // SaveManager calls synchronously at boot) crashes the boot path.
  if (!isPlaygamaSdkActive.value) return null
  const bridge = getPlaygamaBridge()
  try {
    const storage = bridge?.storage
    if (!storage) return null
    return storage as BridgeStorage
  } catch {
    // Belt-and-braces: even with the active gate, some bridge versions
    // throw on `storage` access during teardown / ad takeover. Return
    // null and let the dirty-queue retry on the next tick.
    return null
  }
}

const resolveStorageType = async (storage: BridgeStorage): Promise<StorageType> => {
  if (typeof storage.isAvailable !== 'function') {
    return storage.defaultType ?? 'local_storage'
  }
  try {
    const cloud = await Promise.resolve(storage.isAvailable('platform_internal'))
    if (cloud) return 'platform_internal'
  } catch (e) {
    console.warn('[playgama-save] isAvailable(platform_internal) threw', e)
  }
  return 'local_storage'
}

/** Keys that round-trip through the bridge at hydrate time. Everything the
 *  game persists lives in the single `sandbox_state` blob; `__save_meta__` is the
 *  merge scorecard beside it. */
const CLOUD_KEYS = [STATE_KEY, META_KEY] as const

/**
 * Normalise one value out of `bridge.storage.get`.
 *
 * Even with `tryParseJson = false` the cloud adapter is JSON on the wire and
 * some hosts hand back an already-parsed object. Re-serialize rather than
 * discard: a save that came back in the wrong shape is still the player's save.
 */
const normalizeCloudValue = (v: unknown): string | null => {
  if (typeof v === 'string') return v.length > 0 ? v : null
  if (v === null || v === undefined) return null
  try {
    const json = JSON.stringify(v)
    return json && json !== 'null' ? json : null
  } catch {
    return null
  }
}

/** True when the local snapshot holds anything worth defending in a merge. */
const anyLocalPayload = (local: LocalStorageAccessor): boolean => {
  const blob = local.get(STATE_KEY)
  if (blob != null && blob.length > 2) return true
  return local.keys().some((k) => k !== META_KEY && isPayloadKey(k))
}

export class PlaygamaStrategy implements SaveStrategy {
  readonly name = 'playgama'

  // ─── Hydrate state ──────────────────────────────────────────────────────
  // A real lifecycle now, not a constant. `pending` until the bridge answers;
  // the terminal value reports what the CLOUD actually said, which is what
  // SaveManager's "never push before a successful hydrate" rule reads.
  private _hydrateState: HydrateState = 'pending'

  /** Reactive mirror of the same value, for the on-screen save-status banner. */
  readonly _state = ref<HydrateState>('pending')

  private noticeListeners = new Set<HydrateNoticeListener>()
  private local: LocalStorageAccessor | null = null
  /** Guards the flush poll from stacking hydrate retries on top of each other. */
  private hydrateInFlight = false
  private lastHydrateAttemptAt = 0

  // Queue of writes that arrived BEFORE the bridge resolved. The bridge
  // takes ~50 ms (MOCK) to multiple seconds (production cold) to come up,
  // and SaveManager patches `localStorage.setItem` immediately at boot —
  // so without this queue the first dozen writes (mirrorRefs flush,
  // splash-time toggles, etc.) silently miss the cloud.
  private dirty = new Map<string, string | null>()
  private flushTimer: ReturnType<typeof setInterval> | null = null

  // Re-entrancy guard: any key whose `storage.set` / `storage.delete` is
  // in flight short-circuits `onLocalSet` / `onLocalRemove`. The bridge's
  // local adapter calls `localStorage.setItem` synchronously inside its
  // `set` — that re-enters our onLocalSet through SaveManager's patched
  // setItem and recurses infinitely without this guard.
  private writeInFlight = new Set<string>()

  private storageType: StorageType = 'local_storage'
  private storageTypeResolved = false
  private loggedQueueWrite = false

  get hydrateState(): HydrateState {
    return this._hydrateState
  }

  onHydrateNotice(listener: HydrateNoticeListener): () => void {
    this.noticeListeners.add(listener)
    return () => this.noticeListeners.delete(listener)
  }

  async hydrate(local: LocalStorageAccessor): Promise<void> {
    this.local = local
    // Block on `bridge.initialize()`. The 15 s INIT_TIMEOUT_MS caps the
    // worst-case latency and the call is a singleton promise, so awaiting it
    // here is idempotent with `main.ts`'s own await. Local writes that land
    // during the wait queue into `dirty` and drain on the flush poll.
    try {
      await playgamaPlugin()
    } catch (e) {
      console.warn('[playgama-save] plugin init threw', e)
    }
    await this.runHydrateAttempt(local)
  }

  async retryHydrate(local: LocalStorageAccessor): Promise<HydrateState> {
    this.local = local
    await this.runHydrateAttempt(local)
    return this._hydrateState
  }

  /** One attempt at reading the cloud and merging it into local. Never throws:
   *  a hydrate that throws is indistinguishable to SaveManager from a wiped
   *  save, and this path runs on every boot. */
  private async runHydrateAttempt(local: LocalStorageAccessor): Promise<void> {
    this.lastHydrateAttemptAt = Date.now()
    const storage = getBridgeStorage()
    if (!storage?.get) {
      // The bridge never came up (script blocked, handshake timed out). Local
      // is all we have. `failed-retrying` rather than a success state, so
      // SaveManager keeps treating the cloud as unread and does not publish
      // local defaults over a save it has not seen.
      this.setState('failed-retrying', 'bridge unavailable — local only')
      return
    }

    await this.ensureStorageType()
    if (this.storageType === 'local_storage') {
      // Loud on purpose. `platform_internal` is gated on
      // `allowAnonymousCloudSave || player.isAuthorized`, and guests — most
      // portal traffic, and the reviewer's first run — are not authorized. A
      // silent fallback here looks exactly like a working integration because
      // localStorage still holds everything.
      console.warn(
        '[playgama-save] cloud storage NOT available — progress will not sync to the '
        + 'Playgama remote. Check that playgama-bridge-config.json ships '
        + '{"storage":{"allowAnonymousCloudSave":true}}.'
      )
    }

    const remote = new Map<string, string>()
    try {
      // `tryParseJson = false` — see the `get` signature note above.
      const raw = await Promise.resolve(
        storage.get([...CLOUD_KEYS], this.storageType, false)
      )
      // The bridge answers an array query with a positional array, but some
      // adapters answer with a keyed object. Accept both.
      if (Array.isArray(raw)) {
        CLOUD_KEYS.forEach((key, i) => {
          const v = normalizeCloudValue(raw[i])
          if (v !== null) remote.set(key, v)
        })
      } else if (raw && typeof raw === 'object') {
        for (const key of CLOUD_KEYS) {
          const v = normalizeCloudValue((raw as Record<string, unknown>)[key])
          if (v !== null) remote.set(key, v)
        }
      }
    } catch (e) {
      console.warn('[playgama-save] hydrate get() threw', e)
      this.setState('failed-retrying', 'cloud read failed')
      return
    }

    const remoteMeta: SaveMeta | null =
      parseMeta(remote.get(META_KEY) ?? null)
      ?? (remote.has(STATE_KEY)
        ? computeMeta({ get: (k) => remote.get(k) ?? null })
        : null)

    const localMeta: SaveMeta | null =
      parseMeta(local.get(META_KEY))
      ?? (anyLocalPayload(local) ? computeMeta({ get: (k) => local.get(k) }) : null)

    const resolution = decideMerge(localMeta, remoteMeta)

    switch (resolution.kind) {
      case 'remote-only':
      case 'remote-wins': {
        const blob = remote.get(STATE_KEY)
        if (blob != null) local.set(STATE_KEY, blob)
        if (remoteMeta) local.set(META_KEY, serializeMeta(remoteMeta))
        break
      }
      case 'local-wins': {
        // Local is ahead — queue it so the cloud catches up on the next drain.
        for (const key of CLOUD_KEYS) {
          const v = local.get(key)
          if (v != null) this.dirty.set(key, v)
        }
        break
      }
      case 'tie-keep-local':
      case 'local-only':
        break
    }

    const hasData = remote.size > 0 || anyLocalPayload(local)
    this.setState(hasData ? 'success-with-data' : 'success-empty', resolution.kind)
    if (this.dirty.size > 0) void this.drainDirty()
  }

  private setState(state: HydrateState, reason: string): void {
    this._hydrateState = state
    this._state.value = state
    const notice: HydrateNotice = { state, reason }
    for (const fn of this.noticeListeners) {
      try { fn(notice) }
      catch (e) { console.warn('[playgama-save] notice listener threw', e) }
    }
  }

  onLocalSet(key: string, value: string): void {
    if (this.writeInFlight.has(key)) return // ← re-entrancy guard
    // Only the persisted payload goes to the cloud. Without this filter the
    // bridge received every stray localStorage entry on the page — vConsole
    // layout, the ad waterfall's own experiment flags (`prebid11_*`,
    // `li-module-enabled`, ...), dev toggles — which bloats the remote row and
    // gives the QA reviewer a misleading picture of what the game stores.
    if (!isPayloadKey(key)) return
    this.dirty.set(key, value)
    if (!this.canPush()) {
      this.ensureFlushPoll()
      return
    }
    void this.drainDirty()
  }

  onLocalRemove(key: string): void {
    if (this.writeInFlight.has(key)) return // ← re-entrancy guard
    if (!isPayloadKey(key)) return
    this.dirty.set(key, null)
    if (!this.canPush()) {
      this.ensureFlushPoll()
      return
    }
    void this.drainDirty()
  }

  async flush(): Promise<void> {
    if (this.dirty.size === 0) return
    await this.drainDirty()
  }

  /** The bridge's storage type after resolution. Exposed for the release-QA
   *  console check: `local_storage` here means nothing is reaching the remote. */
  get cloudStorageType(): string {
    return this.storageType
  }

  dispose(): void {
    if (this.flushTimer != null) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    this.noticeListeners.clear()
    this.local = null
  }

  // ─── Internal ───────────────────────────────────────────────────────────

  /**
   * May a queued write be published to the cloud yet?
   *
   * The SaveStrategy contract: until hydrate has reached a terminal SUCCESS
   * state, a strategy must hold its writes locally. This is the rule that stops
   * a boot which could not read the cloud from publishing fresh defaults over
   * a save that was there all along.
   */
  private canPush(): boolean {
    if (!isPlaygamaSdkActive.value || !getBridgeStorage()) return false
    return this._hydrateState === 'success-with-data'
      || this._hydrateState === 'success-empty'
  }

  private ensureFlushPoll(): void {
    if (this.flushTimer != null) return
    if (!this.loggedQueueWrite) {
      this.loggedQueueWrite = true
      console.info('[playgama-save] queueing writes — bridge not ready yet')
    }
    this.flushTimer = setInterval(() => {
      if (!isPlaygamaSdkActive.value || !getBridgeStorage()) return
      // The bridge came up after a hydrate that could not reach it. Read the
      // cloud NOW, before draining: publishing the queue first would push this
      // session's state over a remote save we have never looked at.
      if (!this.canPush()) {
        if (this.hydrateInFlight || !this.local) return
        // Spaced out. The poll ticks four times a second; a hydrate that keeps
        // failing (a context where `storage.get` throws) would otherwise
        // hammer the bridge and bury the QA console in the same warning.
        if (Date.now() - this.lastHydrateAttemptAt < HYDRATE_RETRY_MS) return
        this.lastHydrateAttemptAt = Date.now()
        this.hydrateInFlight = true
        void this.runHydrateAttempt(this.local).finally(() => {
          this.hydrateInFlight = false
        })
        return
      }
      void this.drainDirty().then(() => {
        if (this.dirty.size === 0 && this.flushTimer != null) {
          clearInterval(this.flushTimer)
          this.flushTimer = null
        }
      })
    }, FLUSH_POLL_MS)
  }

  private async ensureStorageType(): Promise<void> {
    if (this.storageTypeResolved) return
    const storage = getBridgeStorage()
    if (!storage) return
    this.storageType = await resolveStorageType(storage)
    this.storageTypeResolved = true
  }

  private async drainDirty(): Promise<void> {
    if (!this.canPush()) {
      this.ensureFlushPoll()
      return
    }
    await this.ensureStorageType()
    if (this.dirty.size === 0) return
    const snapshot = Array.from(this.dirty.entries())
    this.dirty.clear()
    for (const [key, value] of snapshot) {
      if (value === null) {
        await this.deleteKey(key)
      } else {
        await this.writeKey(key, value)
      }
    }
  }

  private async writeKey(key: string, value: string): Promise<void> {
    const storage = getBridgeStorage()
    if (!storage?.set) {
      // Bridge went away mid-flight (rare, but defensible). Re-queue.
      this.dirty.set(key, value)
      this.ensureFlushPoll()
      return
    }
    this.writeInFlight.add(key)
    try {
      // Always call through the bridge — even when storageType is
      // `local_storage`. The Playgama QA Tool's "Game Saves" check watches
      // this exact call as its detection signal; skipping breaks cert.
      await Promise.resolve(storage.set(key, value, this.storageType))
    } catch (e) {
      console.warn(`[playgama-save] set(${key}) threw`, e)
      this.dirty.set(key, value)
      this.ensureFlushPoll()
    } finally {
      this.writeInFlight.delete(key)
    }
  }

  private async deleteKey(key: string): Promise<void> {
    const storage = getBridgeStorage()
    if (!storage?.delete) {
      this.dirty.set(key, null)
      this.ensureFlushPoll()
      return
    }
    this.writeInFlight.add(key)
    try {
      await Promise.resolve(storage.delete(key, this.storageType))
    } catch (e) {
      console.warn(`[playgama-save] delete(${key}) threw`, e)
      this.dirty.set(key, null)
      this.ensureFlushPoll()
    } finally {
      this.writeInFlight.delete(key)
    }
  }
}

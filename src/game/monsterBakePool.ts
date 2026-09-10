import type { BakeReply, BakeRequest } from '@/game/monsterBakeWorker'

/**
 * ─── Monster bake pool ──────────────────────────────────────────────────────
 *
 * A small pool of workers that bake monster designs, and a `null` when the
 * environment cannot give us one.
 *
 * The `null` is not defensive padding — it is a path that ships. The GamePix
 * build inlines the entire bundle into `index.html` via `vite-plugin-singlefile`
 * (their CDN refuses separate chunks), and a worker is by definition a separate
 * chunk: on that build the request for it 404s. jsdom, used by the test suite,
 * has neither `Worker` nor `OffscreenCanvas`. So `monsterSprites` keeps its
 * idle-time bake in full working order and this is strictly an accelerator.
 *
 * Failure is absorbed rather than reported upward, for the same reason: a
 * design that does not come back from a worker is a design the caller bakes
 * itself, and the player sees the older procedural body in the meantime. There
 * is no state in which a broken worker costs anything but speed.
 */

/**
 * How many workers to run.
 *
 * The whole cast is roughly 600 ms of drawing on a developer's machine and
 * three to five times that on the hardware this exists for, so there is real
 * work to spread — but each worker instantiates its own copy of the monster
 * modules and its own `OffscreenCanvas`, and the machines that need this most
 * are also the ones with the least memory to spend on it. Scaled off the core
 * count and capped low: the goal is to get the bake out of the player's way,
 * not to finish it as fast as the silicon possibly could.
 */
const poolSize = (): number => {
  const cores = (typeof navigator === 'undefined' ? 0 : navigator.hardwareConcurrency) || 0
  if (cores >= 8) return 3
  if (cores >= 4) return 2
  return 1
}

interface Pending {
  resolve: (frames: ImageBitmap[]) => void
  reject: (reason: Error) => void
}

interface Slot {
  worker: Worker
  /** Requests in flight on this worker, by sequence number. */
  pending: Map<number, Pending>
}

let slots: Slot[] | null = null
let unavailable = false
let seq = 0
let nextSlot = 0

const supported = (): boolean =>
  typeof Worker !== 'undefined'
  && typeof OffscreenCanvas !== 'undefined'
  // `transferToImageBitmap` is what the worker actually returns frames with.
  // Safari shipped `OffscreenCanvas` before it shipped a 2D context for one, so
  // the constructor existing is not enough to go on.
  && typeof OffscreenCanvas.prototype.transferToImageBitmap === 'function'
  && typeof createImageBitmap === 'function'

/**
 * Tear the pool down and refuse to build another.
 *
 * Called on any worker-level error. One failed design could be retried, but a
 * worker that errors at the top level has usually failed to load its module at
 * all — in which case every subsequent request would hang rather than fail, and
 * the caller would wait forever for frames that are never coming.
 */
const disable = (why: unknown): void => {
  unavailable = true
  for (const slot of slots ?? []) {
    for (const p of slot.pending.values()) p.reject(new Error('bake pool disabled'))
    slot.pending.clear()
    slot.worker.terminate()
  }
  slots = null
  if (import.meta.env.DEV) console.warn('[bake] worker pool unavailable, falling back to idle bake', why)
}

const spawn = (): Slot | null => {
  try {
    const worker = new Worker(new URL('@/game/monsterBakeWorker.ts', import.meta.url), {
      type: 'module',
      name: 'monster-bake'
    })
    const slot: Slot = { worker, pending: new Map() }
    worker.onmessage = (ev: MessageEvent<BakeReply>): void => {
      const reply = ev.data
      const p = slot.pending.get(reply.seq)
      if (!p) return
      slot.pending.delete(reply.seq)
      if (reply.ok) p.resolve(reply.frames)
      else p.reject(new Error(reply.reason))
    }
    // A module worker that fails to fetch its script reports here and nowhere
    // else — this is the GamePix single-file case.
    worker.onerror = (e): void => disable(e.message || e)
    return slot
  } catch (e) {
    disable(e)
    return null
  }
}

const pool = (): Slot[] | null => {
  if (unavailable) return null
  if (slots) return slots
  if (!supported()) { unavailable = true; return null }
  const built: Slot[] = []
  for (let i = 0; i < poolSize(); i++) {
    const s = spawn()
    if (!s) return null
    built.push(s)
  }
  slots = built
  return slots
}

/** Is off-thread baking available at all? Cheap, and settles on first call. */
export const bakePoolAvailable = (): boolean => pool() !== null

/**
 * Bake one design off-thread.
 *
 * Resolves with one `ImageBitmap` per frame of the cycle, or rejects — and a
 * rejection always means "bake it yourself", never "this design is broken".
 *
 * Work is handed out round-robin rather than to the least-loaded worker: every
 * design costs within a small factor of every other, the queue is seventeen
 * items long once per session, and a scheduler smart enough to matter here
 * would be more code than the thing it schedules.
 */
export const bakeDesign = (id: string): Promise<ImageBitmap[]> => {
  const p = pool()
  if (!p) return Promise.reject(new Error('no bake pool'))
  const slot = p[nextSlot % p.length]!
  nextSlot++
  const mySeq = seq++
  return new Promise<ImageBitmap[]>((resolve, reject) => {
    slot.pending.set(mySeq, { resolve, reject })
    const req: BakeRequest = { id, seq: mySeq }
    try {
      slot.worker.postMessage(req)
    } catch (e) {
      slot.pending.delete(mySeq)
      reject(e instanceof Error ? e : new Error(String(e)))
    }
  })
}

/**
 * Shut the pool down once the cast is baked.
 *
 * Three idle workers holding a copy of the monster modules each is 30-40 MB
 * that will never be read again — worth reclaiming on a machine with 4 GB, and
 * the pool rebuilds itself on the next request if one ever comes.
 */
export const releaseBakePool = (): void => {
  for (const slot of slots ?? []) {
    if (slot.pending.size > 0) return // still working; try again later
  }
  for (const slot of slots ?? []) slot.worker.terminate()
  slots = null
}

/** Test seam: forget that the environment was found wanting. */
export const __resetBakePool = (): void => {
  slots = null
  unavailable = false
  seq = 0
  nextSlot = 0
}

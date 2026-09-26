import { MONSTERS, type MonsterDef } from '@/game/monsters'
import { withHatching } from '@/game/inkArt'
import { drawShadowSpec, withoutShadows } from '@/game/monsterKit'
import { stripFrame } from '@/game/spriteStrip'
import { spriteFor } from '@/game/art'
import { bakeDesign, bakePoolAvailable, releaseBakePool } from '@/game/monsterBakePool'
import {
  FRAMES, PX, FRAME_H, SPRITE_S, MONSTER_FRAME_ASPECT
} from '@/game/monsterFrameBox'

/**
 * ─── Baked monster frames ───────────────────────────────────────────────────
 *
 * The cast in `monsters.ts` is drawn for a design bench: one character per
 * canvas, a hundred-odd path operations each, at whatever cost looks best. The
 * battlefield asks a different question — twenty of them at once, on a phone,
 * next to a tower, particles and projectiles.
 *
 * So each design is rendered ONCE into a short strip of frames covering exactly
 * one locomotion cycle, and the battlefield blits from that strip. Two things
 * follow from "exactly one cycle":
 *
 *   * the loop closes, so a unit can play the strip forever without a pop;
 *   * playback is decoupled from authoring — a strip baked over an 880 ms cycle
 *     can be played at any speed, which is what lets a fast enemy and a slow
 *     one share a body and still move at their own rates.
 *
 * Baking happens OFF the main thread where the browser allows it — see
 * `monsterBakePool`. This is the one part of the game that genuinely
 * parallelises: pure procedural drawing, no shared state, no DOM, and an answer
 * that depends on nothing but the design id.
 *
 * Where a worker is not available (the GamePix single-file build inlines the
 * bundle and has no separate chunk to fetch; jsdom has neither `Worker` nor
 * `OffscreenCanvas`), it falls back to the original idle-time bake below. One
 * frame of the heaviest design costs ~10 ms — over half a frame budget — so any
 * per-frame allowance small enough to be safe would be too small to ever bake
 * it, which is why that path uses `requestIdleCallback` rather than a slice of
 * each frame. A wave never arrives during the build phase, so the strips are
 * ready by the time anything needs them either way, and a design that has not
 * finished baking simply draws the older procedural body rather than stalling.
 */

/** The slice of `IdleDeadline` we use; not in every TS lib target. */
interface IdleTime { timeRemaining: () => number }

// ── Frame geometry ──
//
// Moved to its own module so `monsterBakeWorker` can share it. A worker cannot
// import this file (it reaches `art` and `spriteStrip`, which want `Image` and
// `document`), and two copies of the frame box is a contract nothing enforces.
export {
  FRAMES, PX, FRAME_H, SPRITE_S,
  SPRITE_FOOT, SPRITE_HEIGHT, SPRITE_FOOT_R, SPRITE_HEIGHT_R, MONSTER_FRAME_ASPECT
} from '@/game/monsterFrameBox'

const CACHE = new Map<string, HTMLCanvasElement[]>()

/**
 * Every frame the bake produced, main thread or worker — so a caller can tell a
 * baked frame (which carries its own shadow) from a PAINTED one (which does
 * not) without a lookup that allocates. See `paintedMonsterShadow`.
 */
const BAKED = new WeakSet<HTMLCanvasElement>()
const DEFS = new Map<string, MonsterDef>(MONSTERS.map((m) => [m.id, m]))

let queue: string[] = []
let building: { id: string; def: MonsterDef; frames: HTMLCanvasElement[] } | null = null

let scheduled = false

/** Designs currently out with a worker, so `schedule` does not re-issue them. */
const inFlight = new Set<string>()

/**
 * Ask for designs to be baked. Cheap and idempotent — safe to call every time a
 * wave is composed.
 */
export const primeMonsterSprites = (
  ids: readonly string[], opts: { fetch?: boolean } = {}
): void => {
  for (const id of ids) {
    // Start the painted strip decoding on the same signal, unless the caller
    // is only after the bake: the battlefield primes the whole cast's frames
    // on its first tick, and fetching seventeen strips there is exactly what
    // `artPreload` exists to stage instead. A design whose strip has not
    // arrived simply plays the procedural bake rather than holding the game.
    if (opts.fetch !== false && DEFS.has(id)) spriteFor('monster', id)
    if (CACHE.has(id) || queue.includes(id) || inFlight.has(id) || building?.id === id) continue
    if (DEFS.has(id)) queue.push(id)
  }
  schedule()
}

const bakeFrame = (def: MonsterDef, i: number): HTMLCanvasElement => {
  const c = document.createElement('canvas')
  c.width = PX
  c.height = FRAME_H
  const ctx = c.getContext('2d')
  if (ctx) {
    ctx.translate(PX / 2, FRAME_H / 2)
    // The one place the cast is drawn that is NOT per frame, so the pen
    // hatching in `cel` is free here and ruinous anywhere else.
    withHatching(() => def.draw(ctx, SPRITE_S, (i / FRAMES) * def.cycleMs))
  }
  BAKED.add(c)
  return c
}

/**
 * Draw one frame of a design into a `w x h` panel at the context's origin.
 *
 * Exists so the art bench can export the reference sheet through the SAME
 * transform `bakeFrame` uses. The panel is the bake's frame box scaled up, so a
 * strip painted over this reference drops straight back in — get this out of
 * step with the bake and every painted character stands at the wrong height.
 *
 * Not used at run time.
 */
export const paintMonsterFrame = (
  ctx: CanvasRenderingContext2D,
  id: string, i: number, frames: number, w: number, h: number
): void => {
  const def = DEFS.get(id)
  if (!def) return
  ctx.save()
  ctx.translate(w / 2, h / 2)
  // No contact shadow: the painter is told not to paint one, and the slicer
  // registers a return by the bottom of this drawing — see `withoutShadows`.
  withoutShadows(() =>
    withHatching(() => def.draw(ctx, SPRITE_S * (h / FRAME_H), (i / frames) * def.cycleMs)))
  ctx.restore()
}

/**
 * What one `bakeFrame` has actually cost on THIS device, ms.
 *
 * The slice guard below used to be the constant 12 — the cost of the cast's
 * most expensive frame, measured on a developer's laptop. A mid-range phone
 * pays three to five times that, so the guard was reading "13 ms left, a frame
 * costs 12, start one" and then overrunning the idle slice by 30-40 ms. An
 * overrun inside `requestIdleCallback` is a dropped frame, and it repeated for
 * every slice until the whole cast was baked — which is most of the early
 * game, on exactly the devices least able to absorb it.
 *
 * So the floor is measured instead of assumed. A rolling MAX rather than a
 * mean, because the guard's job is to be safe for the next frame, and the next
 * frame may be the treant. It decays slowly so one unlucky sample (a GC
 * landing mid-bake) does not stall the queue forever.
 */
let bakeCostMs = 12

/**
 * Bake while the browser says it has room, then hand control back.
 *
 * Progress is measured per FRAME, not per design: a treant costs five times
 * what an imp does, so committing to a whole design in one slice would blow
 * any deadline. One frame is always baked — without that the queue could never
 * advance on a device whose idle slices are all shorter than a single frame —
 * and every FURTHER frame in the slice has to fit in the time left.
 */
const pump = (deadline?: IdleTime): void => {
  scheduled = false
  do {
    if (!building) {
      const id = queue.shift()
      if (!id) return
      const def = DEFS.get(id)
      if (!def) continue
      building = { id, def, frames: [] }
    }
    const t0 = performance.now()
    building.frames.push(bakeFrame(building.def, building.frames.length))
    const cost = performance.now() - t0
    bakeCostMs = cost > bakeCostMs ? cost : bakeCostMs * 0.98 + cost * 0.02
    if (building.frames.length >= FRAMES) {
      CACHE.set(building.id, building.frames)
      building = null
    }
  } while ((deadline?.timeRemaining() ?? 0) > bakeCostMs)
  schedule()
}

/**
 * Adopt a worker's frames into the cache.
 *
 * The bitmaps are blitted into ordinary canvases rather than kept as
 * `ImageBitmap`s, because `monsterFrame` hands its result to drawing code typed
 * on `HTMLCanvasElement` and shared with the painted-strip path, which really
 * does produce canvases. Widening that whole chain to `CanvasImageSource` would
 * be a larger and riskier edit than this blit is expensive: a blit of an
 * already-decoded bitmap is a fraction of a millisecond, against the ~10 ms the
 * procedural draw it replaces used to cost — the expensive half is what moved
 * off the thread, and that is the half that mattered.
 *
 * The bitmaps are closed explicitly. They are transferred, so nothing else
 * holds them, and leaving seventeen designs' worth to a GC that has no idea how
 * much native memory they pin is how a 4 GB machine starts swapping.
 */
const adoptFrames = (bitmaps: ImageBitmap[]): HTMLCanvasElement[] => {
  const frames: HTMLCanvasElement[] = []
  for (const bmp of bitmaps) {
    const c = document.createElement('canvas')
    c.width = PX
    c.height = FRAME_H
    c.getContext('2d')?.drawImage(bmp, 0, 0)
    bmp.close()
    BAKED.add(c)
    frames.push(c)
  }
  return frames
}

/**
 * Hand the whole queue to the worker pool.
 *
 * Everything at once, deliberately: a worker processes its messages serially,
 * so the pool is its own queue and an in-flight limit here would only add
 * bookkeeping. Seventeen designs across two or three workers is a handful each.
 *
 * Returns false when there is no pool, which is the signal to use the idle bake.
 */
const dispatchToPool = (): boolean => {
  if (!bakePoolAvailable()) return false
  while (queue.length > 0) {
    const id = queue.shift()!
    if (CACHE.has(id) || inFlight.has(id)) continue
    inFlight.add(id)
    bakeDesign(id)
      .then((bitmaps) => { CACHE.set(id, adoptFrames(bitmaps)) })
      .catch(() => {
        // Always "bake it yourself", never "this design is broken" — put it
        // back and let `schedule` pick whichever path is still working.
        if (!CACHE.has(id)) queue.push(id)
      })
      .finally(() => {
        inFlight.delete(id)
        if (queue.length > 0 || building) schedule()
        else if (inFlight.size === 0) releaseBakePool()
      })
  }
  return true
}

const schedule = (): void => {
  if (queue.length === 0 && !building) return
  // The pool takes the whole queue and needs no scheduling of its own; only
  // the fallback pump has to be spaced out across idle slices.
  if (!building && dispatchToPool()) return
  if (scheduled) return
  scheduled = true
  const ric = (globalThis as { requestIdleCallback?: (cb: (d: IdleTime) => void, o?: { timeout: number }) => void })
    .requestIdleCallback
  // Without idle scheduling, fall back to one frame per macrotask — slower to
  // finish, but it still never lands inside a paint.
  if (typeof ric === 'function') ric(pump, { timeout: 2000 })
  else setTimeout(() => pump(), 0)
}

/**
 * The frame for a design at a normalised cycle position, or `null` if it has
 * not been baked yet.
 */
export const monsterFrame = (id: string, cycle01: number): HTMLCanvasElement | null => {
  const c01 = ((cycle01 % 1) + 1) % 1
  // Paint wins when it is there. Both strips cover exactly one cycle, so the
  // same normalised position indexes either of them and a design can swap from
  // the bake to the painting mid-stride without a pop.
  const paint = stripFrame('monster', id, MONSTER_FRAME_ASPECT, c01)
  if (paint) return paint

  const frames = CACHE.get(id)
  if (!frames) return null
  return frames[Math.floor(c01 * FRAMES) % FRAMES] ?? null
}

const SHADOWS = new Map<string, HTMLCanvasElement | null>()

/**
 * The contact shadow to lay under a PAINTED frame of a design, or null.
 *
 * A baked frame has the shadow in it — the design's own `draw` put it there.
 * A painted strip replaces the whole frame, and a painter cannot paint a soft
 * shadow over a chroma key (and is told not to), so without this a painted bug
 * floated. The shadow is baked once per design into a canvas with the bake's
 * own frame box, so it is blitted with exactly the transform the frame is and
 * lands where the drawn one did. Null for a baked frame, and for a design
 * with no shadow (the swimmers).
 */
export const paintedMonsterShadow = (id: string, frame: HTMLCanvasElement): HTMLCanvasElement | null => {
  if (BAKED.has(frame)) return null
  const known = SHADOWS.get(id)
  if (known !== undefined) return known
  const sh = DEFS.get(id)?.shadow
  let c: HTMLCanvasElement | null = null
  if (sh && typeof document !== 'undefined') {
    c = document.createElement('canvas')
    c.width = PX
    c.height = FRAME_H
    const ctx = c.getContext('2d')
    if (ctx) {
      ctx.translate(PX / 2, FRAME_H / 2)
      drawShadowSpec(ctx, SPRITE_S, sh)
    }
  }
  SHADOWS.set(id, c)
  return c
}

/** Which way a design is drawn, for the battlefield's mirroring. */
export const monsterFaces = (id: string): 'left' | 'right' | 'front' =>
  DEFS.get(id)?.faces ?? 'front'

/** How a design hangs off its position — by the feet, or by the body's middle. */
export const monsterAnchor = (id: string): 'feet' | 'centre' =>
  DEFS.get(id)?.anchor ?? 'feet'

/**
 * Pick one design for a unit from its type's binding.
 *
 * Keyed on the uid so an individual keeps the same body for its whole life —
 * picking per frame would make it flicker between species.
 */
export const pickMonster = (binding: string | string[] | undefined, uid: number): string | null => {
  if (!binding) return null
  if (typeof binding === 'string') return binding
  if (binding.length === 0) return null
  return binding[Math.abs(uid) % binding.length] ?? null
}

/** Every design any enemy type can use — for priming at load. */
export const allMonsterIds = (): string[] => [...DEFS.keys()]

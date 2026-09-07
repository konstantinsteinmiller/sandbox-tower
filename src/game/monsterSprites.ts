import { MONSTERS, type MonsterDef } from '@/game/monsters'
import { withHatching } from '@/game/inkArt'
import { stripFrame } from '@/game/spriteStrip'
import { spriteFor } from '@/game/art'

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
 * Baking runs in IDLE time, not in the render loop. One frame of the heaviest
 * design costs ~10 ms — over half a frame budget — so any per-frame allowance
 * small enough to be safe would be too small to ever bake it. A wave never
 * arrives during the build phase, so the strips are always ready by the time
 * anything needs them, and a design that has not finished baking simply falls
 * back to the older procedural body instead of stalling the frame.
 */

/** The slice of `IdleDeadline` we use; not in every TS lib target. */
interface IdleTime { timeRemaining: () => number }

/** Frames per cycle. Sixteen is the low end of what still reads as a walk. */
const FRAMES = 16

/**
 * Baked frame WIDTH, px.
 *
 * Big enough that a unit at maximum zoom on a 3× screen is still downsampling,
 * small enough that the whole cast fits in a sane amount of canvas memory
 * (13 designs × 16 frames × 156 × 176 × 4 B ≈ 23 MB, and most runs never
 * unlock all thirteen).
 */
const PX = 156

/**
 * Baked frame HEIGHT, px.
 *
 * Taller than it is wide, for two reasons that arrived together.
 *
 * The cast is authored feet-at-+1, crown-at-−1.05, but the frame only ever had
 * 1.17 units of headroom — a margin thin enough that one design reaching for a
 * tall silhouette (Thornwick, whose canopy is the character) came out of the
 * bake with its foliage sliced flat. A contract with no slack in it is a
 * contract that gets broken silently, in a strip nobody looks at directly.
 *
 * And the origin now sits at the frame's EXACT vertical centre. The sea
 * creatures are drawn centred on the frame rather than anchored by their feet,
 * so any gap between "middle of the canvas" and "the point the artist drew
 * around" showed up as every fish floating slightly high.
 */
const FRAME_H = 176

/**
 * Character scale inside a frame.
 *
 * The drawing convention is feet at y = +1, crown at −1.05, and up to ±1.05
 * wide, so 2.25 units across the frame leaves a hair of margin for the ink to
 * bleed into without clipping. Vertically there is now real slack: half of
 * `FRAME_H` is about 1.27 units.
 */
const SPRITE_S = PX / 2.25

/** Where the character's feet sit inside a frame, in px from the top. */
export const SPRITE_FOOT = FRAME_H / 2 + SPRITE_S

/** Total character height inside a frame, in px. */
export const SPRITE_HEIGHT = 2.05 * SPRITE_S

/**
 * The two numbers above, as FRACTIONS of the frame rather than pixel counts.
 *
 * A painted strip is the bake's frame box at a different resolution — the sheet
 * the painter works on is the same box scaled up, and the slicer cuts it on the
 * same grid without trimming. So the feet line and the character height are the
 * same proportions of the frame whatever size it arrives at, and every caller
 * measures off the frame it was handed instead of off the bake's constants.
 * For a baked frame these are algebraically what the old code computed.
 */
export const SPRITE_FOOT_R = SPRITE_FOOT / FRAME_H
export const SPRITE_HEIGHT_R = SPRITE_HEIGHT / FRAME_H

// ─── Painted strips ─────────────────────────────────────────────────────────
//
// A drop-in `images/monsters/<design>.webp` is one horizontal strip covering
// the same single locomotion cycle the bake covers, in the same frame
// proportions. Slicing and frame counting live in `spriteStrip`, shared with
// the siege engines, which run the identical trick on a square frame box.
//
// The export ships eight panels: every extra frame is another chance for a
// painter to drift a jerkin, a snout or a limb length, and eight is the
// shortest strip that still reads as a walk rather than a stutter.

/** The frame box's width:height. A painted panel is this box, scaled up. */
export const MONSTER_FRAME_ASPECT = PX / FRAME_H



const CACHE = new Map<string, HTMLCanvasElement[]>()
const DEFS = new Map<string, MonsterDef>(MONSTERS.map((m) => [m.id, m]))

let queue: string[] = []
let building: { id: string; def: MonsterDef; frames: HTMLCanvasElement[] } | null = null

let scheduled = false

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
    if (CACHE.has(id) || queue.includes(id) || building?.id === id) continue
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
  withHatching(() => def.draw(ctx, SPRITE_S * (h / FRAME_H), (i / frames) * def.cycleMs))
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

const schedule = (): void => {
  if (scheduled || (queue.length === 0 && !building)) return
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

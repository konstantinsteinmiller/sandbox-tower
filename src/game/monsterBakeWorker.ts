/// <reference lib="webworker" />

import { MONSTERS, type MonsterDef } from '@/game/monsters'
import { withHatching } from '@/game/inkArt'
import { FRAMES, FRAME_H, PX, SPRITE_S } from '@/game/monsterFrameBox'

/**
 * ─── Monster bake worker ────────────────────────────────────────────────────
 *
 * Draws a design's whole locomotion cycle off the main thread and ships the
 * frames back as `ImageBitmap`s.
 *
 * Why this one and not the rest of the game: it is the only genuinely
 * parallelisable work here. Canvas rasterisation cannot be split across
 * threads, the HUD's compositor cost is unreachable from a worker, and moving
 * the simulation would mean either structured-cloning the world every frame or
 * a `SharedArrayBuffer` — and SAB needs COOP/COEP headers that portal iframes
 * do not set. The bake, by contrast, is pure procedural drawing with no shared
 * state and no DOM: seventeen designs × sixteen frames, each of them a hundred
 * or so path operations, and the answer depends on nothing but the design id.
 *
 * It matters most on exactly the machines this whole change is for. The bake
 * runs in idle slices, and a device at 18 fps has no idle: `pump` still bakes
 * at least one frame per slice — it has to, or the queue could never advance —
 * so on a weak machine it spent the early game stealing a frame at a time from
 * a player who could least afford it.
 *
 * ── What may be imported here ─────────────────────────────────────────────
 *
 * There is no `document` and no `Image` in a worker. `monsters` reaches only
 * `inkArt`, `monsterKit`, `monstersAir` and `monstersSea`, none of which touch
 * either at module scope, and the one place `inkArt` calls
 * `document.createElement` is `grainPattern`, which belongs to the backdrop and
 * is never on a monster's path. Do not import `monsterSprites`, `art` or
 * `spriteStrip` from here — all three are main-thread modules, and the shared
 * geometry they need is in `monsterFrameBox` for exactly that reason.
 */

const DEFS = new Map<string, MonsterDef>(MONSTERS.map((m) => [m.id, m]))

/**
 * One canvas, reused for every frame of every design.
 *
 * `transferToImageBitmap` detaches the backing store and hands it over, leaving
 * the canvas cleared and ready — which is precisely the lifecycle a bake wants,
 * and why there is no `clearRect` below.
 */
const canvas = new OffscreenCanvas(PX, FRAME_H)
const ctx = canvas.getContext('2d')

export interface BakeRequest {
  id: string
  /** Echoed back, so a reply can be matched to its request. */
  seq: number
}

export type BakeReply =
  | { ok: true; id: string; seq: number; frames: ImageBitmap[] }
  | { ok: false; id: string; seq: number; reason: string }

const bake = (def: MonsterDef): ImageBitmap[] => {
  const frames: ImageBitmap[] = []
  for (let i = 0; i < FRAMES; i++) {
    const c = ctx!
    c.save()
    c.translate(PX / 2, FRAME_H / 2)
    // The one place the cast is drawn that is NOT per frame, so the pen
    // hatching in `cel` is free here and ruinous anywhere else.
    withHatching(() => def.draw(c as unknown as CanvasRenderingContext2D, SPRITE_S, (i / FRAMES) * def.cycleMs))
    c.restore()
    frames.push(canvas.transferToImageBitmap())
  }
  return frames
}

self.onmessage = (ev: MessageEvent<BakeRequest>): void => {
  const { id, seq } = ev.data
  const def = DEFS.get(id)
  const post = self.postMessage.bind(self) as (m: BakeReply, t?: Transferable[]) => void

  if (!def || !ctx) {
    post({ ok: false, id, seq, reason: !def ? 'unknown design' : 'no 2d context' })
    return
  }

  try {
    const frames = bake(def)
    // Transferred, not copied: a structured clone of sixteen 156×176 bitmaps
    // per design would put the cost straight back on the main thread in the
    // form of a deserialise, which is the thing being avoided.
    post({ ok: true, id, seq, frames }, frames)
  } catch (e) {
    post({ ok: false, id, seq, reason: e instanceof Error ? e.message : String(e) })
  }
}

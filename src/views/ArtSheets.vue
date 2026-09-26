<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  SHEETS, CELL, EXPORT_SCALES, sheetRows,
  ALL_STRIPS, STRIP_SCALE,
  SINGLES, SINGLE_SIZE,
  SCENERY, WALKS, promptDocs,
  type SheetSpec, type SheetCell, type StripSpec, type SingleSpec, type WalkSpec
} from '@/game/artSheet'
import { blockDef, isShip } from '@/game/blocks'
import { blockGlyph } from '@/game/blockGlyph'
import { themedPalette } from '@/game/art'
import { MONSTERS } from '@/game/monsters'
import { paintMonsterFrame } from '@/game/monsterSprites'
import { ENEMY_DEFS } from '@/game/enemies'
import { drawSiegeMachine } from '@/game/siegeArt'
import { drawCavalry, CAVALRY_CYCLE_MS } from '@/game/cavalryArt'
import { SHIP_ART, SHIP_DRAFT } from '@/game/shipArt'
import {
  paintBlockBody, paintBlockFixture, paintTierFixture, paintShipBlock, fixtureSpanForTier,
  gunSpanForTier, FIXTURE_BOX,
  paintTierPlate, paintProjectile, paintTree, celestialDisc, SIEGE_ART_BOX,
  ALLY_ART_BOX
} from '@/use/useTowerArt'
import { prependBaseUrl } from '@/utils/function'

/**
 * `/art-sheets` — the contact-sheet bench.
 *
 * Sandbox Tower has no art folder. Every block, enemy and engine is a few hundred
 * canvas operations, which is exactly what you want in a bundle and exactly
 * what you cannot hand to somebody who paints. This screen bakes the whole cast
 * onto the lattice described in `artSheet.ts` and writes the sheets into
 * `art-sheets/` through a dev-only endpoint, so the art can go out to be
 * repainted and come back as drop-in bitmaps.
 *
 * THREE RULES, and they are all about the return trip.
 *
 *   1. Every cell is clipped to its exact rect. One barrel bleeding into the
 *      neighbouring cell and the whole sheet has to be sliced by hand.
 *   2. Nothing is written inside a cell. Captions live on the key sheet, which
 *      is rendered from the same manifest at 2x — text inside a frame is text
 *      an image model will dutifully repaint as art.
 *   3. The clean sheets have a TRANSPARENT ground. The renderer composites
 *      block and enemy art with alpha, so a sheet baked onto a colour would
 *      come back with that colour welded into every sprite.
 *
 * Everything animated is frozen at a fixed phase rather than at the wall clock,
 * so re-exporting produces a byte-identical sheet and a diff means the art
 * actually changed.
 */

// ─── Frozen clock ───────────────────────────────────────────────────────────
//
// A pose, not a moment. Guns sit a little above the horizontal because a barrel
// aimed flat along +x reads as a pipe, and the wheeled engines are drawn
// engaged and mid-reload because that is the instant a still has to sell.

const POSE_T = 1_200
const GUN_AIM = 0.3
const SIEGE_CYCLE = 0.45

const status = ref('idle')
const busy = ref(false)
const previews = ref<{ id: string; title: string; url: string; dims: string }[]>([])
const bitmaps = new Map<string, HTMLImageElement>()

// ─── Fitting ────────────────────────────────────────────────────────────────
//
// On the battlefield a gun deliberately overflows its carriage, an enemy is
// drawn at its own scale against every other enemy, and a molotov is a few
// pixels wide. All three are right there and all three are wrong in a frame:
// the first gets sheared off by the cell clip, the second wastes most of the
// cell, and the third is too small to repaint.
//
// So anything that is not bound by the override contract is MEASURED and
// refitted. Draw it once at nominal scale, take the alpha bounding box, then
// draw it AGAIN at the scale that fills the cell — a second draw rather than an
// upscale of the first, because the art is vector and redrawing it bigger is
// sharp where a blit would be soft.
//
// The two exceptions are the block body and the tray icon. Their edges ARE the
// cell edges — that is the contract the renderer blits against — so they are
// drawn at exactly the cell size and never touched.
//
// The cost of fitting is that relative scale between cells is gone: a bat and a
// siege golem come out the same size. That is the right trade for a sheet whose
// cells each become one file (the renderer scales the bitmap by the enemy's own
// `scale` anyway), and the real figure is on the key sheet and in the index.

type CellDraw = (c: CanvasRenderingContext2D, cx: number, cy: number, k: number) => void

/** Reused across every cell — a fresh canvas per cell is pure GC pressure. */
const scratch = document.createElement('canvas')

const bboxOf = (
  c: CanvasRenderingContext2D, side: number, alpha: number
): { x: number; y: number; w: number; h: number } | null => {
  const { data } = c.getImageData(0, 0, side, side)
  let x0 = side, y0 = side, x1 = -1, y1 = -1
  for (let y = 0; y < side; y++) {
    const row = y * side
    for (let x = 0; x < side; x++) {
      if (data[(row + x) * 4 + 3]! > alpha) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }
}

const drawInto = (side: number, draw: CellDraw, k: number): CanvasRenderingContext2D => {
  scratch.width = side
  scratch.height = side
  const c = scratch.getContext('2d')!
  draw(c, side / 2, side / 2, k)
  return c
}

const paintFitted = (
  ctx: CanvasRenderingContext2D, size: number, draw: CellDraw,
  opts: { margin?: number; alpha?: number; maxK?: number } = {}
): void => {
  // A soft glow tapers to nothing, so "any pixel at all" would measure the
  // fade rather than the object. The sky bodies need a real floor.
  const alpha = opts.alpha ?? 8
  const fit = size * (1 - (opts.margin ?? 0.06))

  // Pass one is generous: a tier-3 gun spans 2.2 cells before it is fitted.
  const probeSide = Math.ceil(size * 3)
  const probe = bboxOf(drawInto(probeSide, draw, 1), probeSide, alpha)
  if (!probe) return

  // Pass two only has to hold something the size of the cell, so it is a much
  // smaller image to scan.
  const k = Math.min(fit / probe.w, fit / probe.h, opts.maxK ?? 6)
  const side = Math.ceil(size * 1.9)
  const c = drawInto(side, draw, k)
  const box = bboxOf(c, side, alpha)
  if (!box) return
  ctx.drawImage(scratch, box.x, box.y, box.w, box.h,
    (size - box.w) / 2, (size - box.h) / 2, box.w, box.h)
}

// ─── Cell painting ──────────────────────────────────────────────────────────

/**
 * A fused block, squared up into one cell.
 *
 * On the battlefield a merge keeps the cells its halves stood on, so a tier-3
 * is a 2x2 bastion and a tier-2 is a 2x1 weld. Squaring that into a single
 * frame means the BODY can no longer carry the tier — every cell is the same
 * square — so the ratio has to be preserved on the other side of the equation:
 * the gun is drawn at its real span DIVIDED by the footprint it straddles.
 *
 * Which is why the tier-2 gun looks small. A 1.43-cell gun on a two-cell-wide
 * weld is still narrower than the weld, and pretending otherwise would be
 * inventing a design the game does not have. Weapons take the span the tower
 * actually draws them at (`gunSpanForTier`); support fixtures never grow past
 * the footprint's short side.
 */
const footprintOf = (tier: number): number => (tier <= 1 ? 1 : 2)

/**
 * A hull, with its wake cropped off.
 *
 * `drawShip` paints a bow wave and three trailing wake bands that reach about
 * 1.5 scale units to port and 1.3 to starboard — more than twice the width of
 * the boat. Left in, they are what the fit MEASURES, and the ship comes out a
 * third of the size it should be with two thirds of the cell given over to
 * ripples. The water is the sea's art, not the ship's, so it is clipped to a
 * box around the hull and rig before anything is measured.
 */
const paintHull = (
  c: CanvasRenderingContext2D, typeId: string, cx: number, cy: number, s: number
): void => {
  c.save()
  c.translate(cx, cy)
  c.beginPath()
  c.rect(-s * 0.8, -s * 1.35, s * 1.6, s * 1.95)
  c.clip()
  paintShipBlock(c, typeId, s, { aim: GUN_AIM, t: POSE_T, seed: 3 })
  c.restore()
}

const paintCell = (ctx: CanvasRenderingContext2D, cell: SheetCell, size: number): void => {
  const a = cell.art

  switch (a.kind) {
    // The body row and only the body row is full-bleed: `drawBlock` blits an
    // override across the whole cell, so the file's edges have to be the cell's
    // edges or every block in the game gains a transparent border.
    case 'blockBody': {
      if (isShip(a.typeId)) {
        paintFitted(ctx, size, (c, cx, cy, k) => paintHull(c, a.typeId, cx, cy, size * k))
      } else {
        paintBlockBody(ctx, a.typeId, size)
      }
      break
    }

    case 'blockAssembled': {
      const tier = a.tier ?? 1
      const fp = footprintOf(tier)
      const span = (blockDef(a.typeId).weapon ? gunSpanForTier(tier) : fixtureSpanForTier(tier)) / fp

      paintFitted(ctx, size, (c, cx, cy, k) => {
        const s = size * k
        if (isShip(a.typeId)) {
          paintHull(c, a.typeId, cx, cy, s * span)
        } else {
          c.save()
          c.translate(cx - s / 2, cy - s / 2)
          paintBlockBody(c, a.typeId, s)
          c.restore()
          paintBlockFixture(c, a.typeId, cx, cy, s * span,
            { aim: GUN_AIM, recoil: 0, t: POSE_T, seed: 3 })
        }
      })

      // Pinned to the FRAME, after the fit, rather than carried along with the
      // art. Riveted to the block it would drift with every silhouette — and on
      // a ship, whose hull sits low in the cell, it floated in open sky.
      if (tier > 1) paintTierPlate(ctx, tier, size * 0.82, size * 0.18, size)
      break
    }

    case 'blockGlyph': {
      // The build-tray tile, reproduced exactly: body, dark backing disc,
      // near-white pictogram. The disc is load-bearing — a pale glyph vanishes
      // on stone and a dark one vanishes on the gate, and no single ink colour
      // survives both palettes.
      const def = blockDef(a.typeId)
      paintBlockBody(ctx, a.typeId, size)
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size * 0.29, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(8,12,20,0.46)'
      ctx.fill()
      ctx.save()
      ctx.translate(size / 2, size / 2)
      ctx.scale(size * 0.54, size * 0.54)
      ctx.fillStyle = '#f4f8ff'
      blockGlyph(a.typeId, def.kind)(ctx)
      ctx.restore()
      break
    }

    case 'monster': {
      const def = MONSTERS.find((m) => m.id === a.designId)
      if (!def) break
      paintFitted(ctx, size, (c, cx, cy, k) => {
        c.save()
        c.translate(cx, cy)
        // The override contract is "author facing right". A design drawn facing
        // left is mirrored HERE rather than left for the painter to notice, so
        // what leaves this bench already obeys the contract it comes back into.
        if (def.faces === 'left') c.scale(-1, 1)
        // Authored feet-at-+1, crown-at-−1.05, so the body straddles the origin.
        c.translate(0, size * k * 0.02)
        def.draw(c, (size * k) / 2.2, def.cycleMs * 0.12)
        c.restore()
      })
      break
    }

    case 'siege': {
      const def = ENEMY_DEFS[a.engineId]
      if (!def) break
      paintFitted(ctx, size, (c, cx, cy, k) => {
        c.save()
        c.translate(cx, cy)
        drawSiegeMachine(c, a.engineId, (size * k) / 2.4, themedPalette(def.palette), {
          spin: 0.8, engaged: true, t: POSE_T, cycle: SIEGE_CYCLE, flaming: false
        })
        c.restore()
      })
      break
    }

    case 'cavalry':
      paintFitted(ctx, size, (c, cx, cy, k) => {
        c.save()
        c.translate(cx, cy)
        drawCavalry(c, (size * k) / 2.3, themedPalette('cavalry'),
          { phase: 0.2, striking: false, t: POSE_T })
        c.restore()
      })
      break

    case 'projectile':
      // A round is a handful of pixels in flight. Fitted hard, because this is
      // the one category where the sheet has to INVENT resolution the game
      // never draws at — a 12 px molotov cannot be repainted.
      paintFitted(ctx, size, (c, cx, cy, k) => {
        paintProjectile(c, a.round, cx, cy, size * k, POSE_T)
      }, { maxK: 8 })
      break

    case 'tree':
      paintFitted(ctx, size, (c, cx, cy, k) => {
        paintTree(c, a.species, cx, cy + size * k * 0.43, size * k * 0.86, a.seed)
      })
      break

    case 'celestial':
      // The sprite is nine radii wide because the rays reach far past the disc,
      // fading to nothing. Measured at a hard alpha floor so the fit lands on
      // the disc and its visible rays rather than on the edge of the fade.
      paintFitted(ctx, size, (c, cx, cy, k) => {
        const disc = celestialDisc(a.night, (size * k) / 4.2, a.tier)
        c.drawImage(disc, cx - disc.width / 2, cy - disc.height / 2)
      }, { alpha: 70, maxK: 3 })
      break

    case 'bitmap': {
      const img = bitmaps.get(a.src)
      if (!img?.naturalWidth) break
      // Letterboxed, aspect preserved. The ribbon is 3:1 and the movie icon is
      // 4:3 — stretching either to a square would hand the painter a distorted
      // reference and get a distorted asset back.
      const k = Math.min(size / img.naturalWidth, size / img.naturalHeight) * 0.92
      const w = img.naturalWidth * k
      const h = img.naturalHeight * k
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
      break
    }
  }
}

// ─── Sheet composition ──────────────────────────────────────────────────────

const renderSheet = (spec: SheetSpec, scale: number): HTMLCanvasElement => {
  const size = CELL * scale
  const cv = document.createElement('canvas')
  cv.width = spec.cols * size
  cv.height = sheetRows(spec) * size
  const ctx = cv.getContext('2d')!

  for (const cell of spec.cells) {
    ctx.save()
    // Rule 1. Nothing leaves its own frame.
    ctx.beginPath()
    ctx.rect(cell.col * size, cell.row * size, cell.cw * size, cell.ch * size)
    ctx.clip()
    ctx.translate(cell.col * size, cell.row * size)
    paintCell(ctx, cell, size)
    ctx.restore()
  }
  return cv
}

/**
 * One row of a sheet, on its own, at double size.
 *
 * Same painter, same cells, same lattice — only the framing changes. The cells
 * are laid out at their real column so a strip and its parent sheet stay
 * interchangeable, which is what lets one index describe both.
 */
const renderStrip = (strip: StripSpec): HTMLCanvasElement => {
  const size = CELL * STRIP_SCALE
  const cv = document.createElement('canvas')
  cv.width = strip.cols * size
  cv.height = size
  const ctx = cv.getContext('2d')!

  for (const cell of strip.cells) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(cell.col * size, 0, cell.cw * size, cell.ch * size)
    ctx.clip()
    ctx.translate(cell.col * size, 0)
    paintCell(ctx, cell, size)
    ctx.restore()
  }
  return cv
}

/**
 * One cell, alone, on a big canvas.
 *
 * No lattice, no neighbours, nothing to stay aligned with — which is the whole
 * point. What comes back is judged on its own and resized to the target square.
 */
const renderSingle = (single: SingleSpec): HTMLCanvasElement => {
  const cv = document.createElement('canvas')
  cv.width = SINGLE_SIZE
  cv.height = SINGLE_SIZE
  const ctx = cv.getContext('2d')!
  paintCell(ctx, single.cell, SINGLE_SIZE)
  return cv
}

/**
 * One design's walk cycle, laid out as a grid of panels on flat magenta.
 *
 * Deliberately plain: no borders, no numbers, no captions. Three passes of the
 * lattice sheets came back with the chrome painted IN as though the guides were
 * scenery, and a border welded into a frame is a border the slicer then keys
 * out of the character. The grid is described in the prompt instead, and the
 * panels are legible without it because each creature is centred in its own.
 */
/**
 * Where the reference actually SITS inside its panels, as fractions of one.
 *
 * Measured, not declared, because it is the thing a painter is most likely to
 * change without noticing: every returned siege sheet so far came back with the
 * machine enlarged to fill the panel and dropped to the bottom — the catapult at
 * more than double size. A chassis at the wrong scale still looks fine on its
 * own; what gives it away is the live arm, which is drawn from the geometry and
 * suddenly belongs to a smaller machine.
 *
 * The slicer reads this back and normalises what it gets to match.
 */
const walkFits = new Map<string, { h: number; w: number; bottom: number; cx: number }>()

/**
 * Alpha floor for the fit measurement.
 *
 * Deliberately high. The procedural machines cast a soft ground shadow and the
 * painted returns do not — the background rule forbids one — so measuring at
 * "any pixel at all" compared a silhouette-plus-shadow against a silhouette,
 * and aligning those two bottoms sank the siege tower into the grass by the
 * depth of a shadow nobody painted. At 140 a 32%-opacity shadow is not part of
 * the object on either side.
 */
const FIT_ALPHA = 140

/** Alpha bbox of one rectangle of a canvas, in that rectangle's own pixels. */
const unionBox = (
  cv: HTMLCanvasElement, ox: number, oy: number, W: number, H: number
): { x0: number; y0: number; x1: number; y1: number } | null => {
  const d = cv.getContext('2d')!.getImageData(ox, oy, W, H).data
  let x0 = W, y0 = H, x1 = -1, y1 = -1
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (d[(y * W + x) * 4 + 3]! <= FIT_ALPHA) continue
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
  }
  return x1 < 0 ? null : { x0, y0, x1, y1 }
}

/**
 * A fixture sheet's reference, into one panel whose origin `c` is at.
 *
 * The panel is the fixture's own sprite box, and the pose is the one the
 * runtime turns FROM: clock zero, lane zero, aim zero, no recoil. Anything else
 * bakes half a swing into the still and the game then adds the other half on
 * top of it.
 *
 * A merged tier's sheet draws its WEAPON's gun (`paintTierFixture`): one gun
 * in the plain fixture's outline, which is what its painting replaces — the
 * game grows the painting by the weld's span itself. Called for the magenta
 * sheet and for the transparent probe alike, so the fit is measured off exactly
 * what the painter was shown.
 */
const paintFixtureRef = (c: CanvasRenderingContext2D, walk: WalkSpec): void => {
  const s = walk.panelW / FIXTURE_BOX
  if (walk.fixtureType && walk.fixtureTier) {
    paintTierFixture(c, walk.fixtureType, walk.panelW / 2, walk.panelH / 2, s, walk.fixtureTier)
    return
  }
  paintBlockFixture(
    c, walk.id, walk.panelW / 2, walk.panelH / 2, s,
    { aim: 0, recoil: 0, t: 0, seed: 0, layer: 'weapon' }
  )
}

const renderWalk = (walk: WalkSpec): HTMLCanvasElement => {
  const cv = document.createElement('canvas')
  cv.width = walk.w
  cv.height = walk.h
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = '#ff00ff'
  ctx.fillRect(0, 0, cv.width, cv.height)

  for (let i = 0; i < walk.frames; i++) {
    ctx.save()
    ctx.translate((i % walk.cols) * walk.panelW, Math.floor(i / walk.cols) * walk.panelH)
    if (walk.kind === 'siege' || walk.kind === 'siegeArm') {
      // The STATIC layer only, at the same box the renderer blits — so what
      // comes back drops onto the same rectangle, with the arm still drawn live
      // over it. Painting the arm into the reference would guarantee two of
      // them on screen.
      ctx.save()
      ctx.translate(walk.panelW / 2, walk.panelH / 2)
      const def = ENEMY_DEFS[walk.id]
      if (def) {
        drawSiegeMachine(ctx, walk.id, walk.panelH / SIEGE_ART_BOX, themedPalette(def.palette), {
          // One full revolution across the strip: the wheels are the cycle.
          spin: (i / walk.frames) * Math.PI * 2,
          // The arm is baked across its RELOAD, which is what `cycle` measures,
          // and the chassis across its wheels. Two different clocks, and each
          // sheet only ever shows the layer it is asking to have painted.
          engaged: walk.kind === 'siegeArm',
          cycle: i / walk.frames,
          t: 0,
          layer: walk.kind === 'siegeArm' ? 'moving' : 'static'
        })
      }
      ctx.restore()
    } else if (walk.kind === 'fixture') {
      paintFixtureRef(ctx, walk)
    } else if (walk.kind === 'ship') {
      // The panel IS `SHIP_ART`, the rectangle a painted hull is blitted back
      // into, so the return needs no fit step. `drawShip` applies its own draft before clipping, so that is
      // taken back out here — otherwise the waterline lands 0.42 units low
      // and every painted boat rides that much deeper than the drawn one.
      const S = walk.panelW / SHIP_ART.w
      ctx.save()
      ctx.translate(-SHIP_ART.x * S, -(SHIP_ART.y + SHIP_DRAFT) * S)
      paintShipBlock(ctx, walk.id, S, { aim: 0, t: POSE_T, seed: 1, layer: 'hull' })
      ctx.restore()
    } else if (walk.kind === 'ally') {
      // The rider goes into a SQUARE box centred on its middle, the way a
      // siege engine does — `drawCavalry` puts the hooves at +0.5 of its own
      // scale, so the ground line lands where the renderer expects it.
      ctx.save()
      ctx.translate(walk.panelW / 2, walk.panelH / 2)
      drawCavalry(ctx, walk.panelH / ALLY_ART_BOX, themedPalette('cavalry'), {
        // Phase 0, and one whole gallop across the strip: the painted frames
        // then line up with `gait()` at run time, which is what indexes them.
        phase: 0,
        striking: false,
        t: (i / walk.frames) * CAVALRY_CYCLE_MS,
        // The kicked-up dust is the rider's live layer and is drawn under the
        // painted strip at run time, so it must not be in the reference.
        dust: false
      })
      ctx.restore()
    } else {
      // Straight through the renderer's own frame painter, so the reference is
      // provably the frame box the game draws rather than a lookalike.
      paintMonsterFrame(ctx, walk.id, i, walk.frames, walk.panelW, walk.panelH)
    }
    ctx.restore()
  }

  // Measure the reference on a TRANSPARENT copy of the same draw — the sheet
  // itself is flooded with magenta, which has no alpha to measure.
  const probe = document.createElement('canvas')
  probe.width = walk.panelW * walk.cols
  probe.height = walk.panelH * walk.rows
  const pc = probe.getContext('2d')!
  for (let i = 0; i < walk.frames; i++) {
    pc.save()
    pc.translate((i % walk.cols) * walk.panelW, Math.floor(i / walk.cols) * walk.panelH)
    if (walk.kind === 'siege' || walk.kind === 'siegeArm') {
      pc.save()
      pc.translate(walk.panelW / 2, walk.panelH / 2)
      const d = ENEMY_DEFS[walk.id]
      if (d) {
        drawSiegeMachine(pc, walk.id, walk.panelH / SIEGE_ART_BOX, themedPalette(d.palette), {
          spin: (i / walk.frames) * Math.PI * 2,
          engaged: walk.kind === 'siegeArm',
          cycle: i / walk.frames,
          t: 0,
          layer: walk.kind === 'siegeArm' ? 'moving' : 'static'
        })
      }
      pc.restore()
    } else if (walk.kind === 'fixture') {
      paintFixtureRef(pc, walk)
    } else if (walk.kind === 'ship') {
      // The panel IS `SHIP_ART`, the rectangle a painted hull is blitted back
      // into, so the return needs no fit step. `drawShip` applies its own draft before clipping, so that is
      // taken back out here — otherwise the waterline lands 0.42 units low
      // and every painted boat rides that much deeper than the drawn one.
      const S = walk.panelW / SHIP_ART.w
      pc.save()
      pc.translate(-SHIP_ART.x * S, -(SHIP_ART.y + SHIP_DRAFT) * S)
      paintShipBlock(pc, walk.id, S, { aim: 0, t: POSE_T, seed: 1, layer: 'hull' })
      pc.restore()
    } else if (walk.kind === 'ally') {
      // The rider goes into a SQUARE box centred on its middle, the way a
      // siege engine does — `drawCavalry` puts the hooves at +0.5 of its own
      // scale, so the ground line lands where the renderer expects it.
      pc.save()
      pc.translate(walk.panelW / 2, walk.panelH / 2)
      drawCavalry(pc, walk.panelH / ALLY_ART_BOX, themedPalette('cavalry'), {
        // Phase 0, and one whole gallop across the strip: the painted frames
        // then line up with `gait()` at run time, which is what indexes them.
        phase: 0,
        striking: false,
        t: (i / walk.frames) * CAVALRY_CYCLE_MS,
        // The kicked-up dust is the rider's live layer and is drawn under the
        // painted strip at run time, so it must not be in the reference.
        dust: false
      })
      pc.restore()
    } else {
      paintMonsterFrame(pc, walk.id, i, walk.frames, walk.panelW, walk.panelH)
    }
    pc.restore()
  }
  // Folded back into ONE panel: every frame is the same box, so the union of
  // each frame's own box describes where the character sits in a single panel.
  const w = walk.panelW, h = walk.panelH
  let x0 = w, y0 = h, x1 = -1, y1 = -1
  for (let i = 0; i < walk.frames; i++) {
    const b = unionBox(probe, (i % walk.cols) * w, Math.floor(i / walk.cols) * h, w, h)
    if (!b) continue
    if (b.x0 < x0) x0 = b.x0
    if (b.y0 < y0) y0 = b.y0
    if (b.x1 > x1) x1 = b.x1
    if (b.y1 > y1) y1 = b.y1
  }
  if (x1 >= 0) {
    // Keyed by KIND as well as id: a siege chassis and its arm are two sheets
    // with the same engine name, and letting them share a slot gave the
    // chassis the arm's box to be normalised onto.
    walkFits.set(`${walk.kind}/${walk.id}`, {
      h: (y1 - y0 + 1) / h,
      // The WIDTH as well, because height alone does not describe a box. A
      // painted cannon barrel came back longer and slimmer than the drawn one:
      // height-matched it was correct by the only number anyone had, and two
      // cells long on a one-cell block.
      w: (x1 - x0 + 1) / w,
      bottom: (y1 + 1) / h,
      cx: ((x0 + x1) / 2) / w
    })
  }
  return cv
}

/**
 * The human half of the pair.
 *
 * Same lattice, same cells, art knocked back so the captions read over it. At
 * 2x purely so the type is comfortable — divide every coordinate by two to get
 * back to the clean sheet's pixels, or read the index, which is already in
 * clean-sheet pixels.
 */
const renderKey = (spec: SheetSpec): HTMLCanvasElement => {
  const scale = 2
  const size = CELL * scale
  const cv = document.createElement('canvas')
  cv.width = spec.cols * size
  cv.height = sheetRows(spec) * size
  const ctx = cv.getContext('2d')!

  ctx.fillStyle = '#11151c'
  ctx.fillRect(0, 0, cv.width, cv.height)

  for (const cell of spec.cells) {
    const x = cell.col * size
    const y = cell.row * size

    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, cell.cw * size, cell.ch * size)
    ctx.clip()
    ctx.translate(x, y)
    ctx.globalAlpha = 0.4
    paintCell(ctx, cell, size)
    ctx.restore()

    // A cell with a target is one whose repaint has somewhere to go. Marking
    // that on the key is the difference between "paint all of this" and "paint
    // all of this, and these are the eighteen files that actually ship".
    ctx.strokeStyle = cell.target ? 'rgba(120,224,255,0.75)' : 'rgba(255,255,255,0.16)'
    ctx.lineWidth = cell.target ? 3 : 1
    ctx.strokeRect(x + 1.5, y + 1.5, cell.cw * size - 3, cell.ch * size - 3)

    ctx.fillStyle = 'rgba(6,9,14,0.82)'
    ctx.fillRect(x, y + size - 46, cell.cw * size, 46)

    ctx.fillStyle = '#eef4fb'
    ctx.font = '700 19px ui-sans-serif, system-ui, sans-serif'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(cell.label, x + 8, y + size - 26, cell.cw * size - 16)

    ctx.fillStyle = cell.target ? '#7fe0ff' : '#8e9aa8'
    ctx.font = '500 15px ui-sans-serif, system-ui, sans-serif'
    ctx.fillText(cell.sub, x + 8, y + size - 8, cell.cw * size - 16)

    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = '600 14px ui-monospace, monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`c${cell.col} r${cell.row}`, x + cell.cw * size - 8, y + 22)
    ctx.textAlign = 'left'
  }
  return cv
}

// ─── The index ──────────────────────────────────────────────────────────────

/** True pixel size of a shipped bitmap, so a slice can be restored to shape. */
const nativeSize = (src: string): { w: number; h: number } | undefined => {
  const img = bitmaps.get(src)
  return img?.naturalWidth ? { w: img.naturalWidth, h: img.naturalHeight } : undefined
}

const buildIndex = () => ({
  generated: new Date().toISOString(),
  cell: CELL,
  scales: [...EXPORT_SCALES],
  note:
    'Rects are in CLEAN-SHEET pixels (scale 1). For the @2x sheet multiply every '
    + 'x/y/w/h by 2; the key sheet is also 2x. `target` is the path under public/ '
    + 'a repainted slice belongs at — a cell without one has no override hook yet.',
  // Landscape assets: their own shapes, not lattice cells.
  scenery: SCENERY.map((a) => ({
    id: a.id,
    file: `${a.file}.png`,
    width: a.w,
    height: a.h,
    tileable: a.tileable,
    // The slicer must know this: an opaque band has no background to key, and
    // keying one anyway flooded the meadow and the lake almost entirely away.
    bg: a.bg,
    target: a.target
  })),
  // Walk cycles: a grid of panels that gets cut into one horizontal strip. The
  // slicer needs the grid and the frame order; everything else about a strip
  // (how many frames, how tall) the runtime reads back off the image itself.
  walks: WALKS.map((w) => ({
    id: w.id,
    file: `${w.file}.png`,
    width: w.w,
    height: w.h,
    cols: w.cols,
    rows: w.rows,
    frames: w.frames,
    kind: w.kind,
    panel: { w: w.panelW, h: w.panelH },
    // Where the reference sits in a panel. The slicer normalises a returned
    // sheet onto this, so a machine painted twice its size still lines up
    // with the arm that is drawn live over it.
    ...(walkFits.has(`${w.kind}/${w.id}`) ? { fit: walkFits.get(`${w.kind}/${w.id}`) } : {}),
    faces: w.faces,
    anchor: w.anchor,
    target: w.target
  })),
  sheets: SHEETS.map((s) => ({
    id: s.id,
    title: s.title,
    brief: s.brief,
    files: {
      clean: `${s.file}.png`,
      clean2x: `${s.file}@2x.png`,
      key: `${s.file}-key.png`
    },
    cols: s.cols,
    rows: sheetRows(s),
    width: s.cols * CELL,
    height: sheetRows(s) * CELL,
    cells: s.cells.map((c) => ({
      id: c.id,
      label: c.label,
      variant: c.sub,
      x: c.col * CELL,
      y: c.row * CELL,
      w: c.cw * CELL,
      h: c.ch * CELL,
      ...(c.target ? { target: c.target } : {}),
      // A cell holding an EXISTING bitmap was letterboxed to fit the square —
      // the ribbon is 3:1 and the movie icon 4:3. Without its true size here,
      // the slicer would write a padded square back over a 553x188 file and
      // quietly wreck the result screen. With it, the slicer trims the
      // transparent margin and restores the original shape.
      ...(c.art.kind === 'bitmap' ? { letterboxed: nativeSize(c.art.src) } : {}),
      ...(c.note ? { note: c.note } : {})
    })),
    // One image per object: the rect is the whole image, so a repaint has
    // nothing to stay aligned with and cannot drift out of a lattice.
    singles: SINGLES.filter((t) => t.sheet === s.id).map((t) => ({
      id: t.id,
      file: `${t.file}.png`,
      width: SINGLE_SIZE,
      height: SINGLE_SIZE,
      cells: [{
        id: t.cell.id,
        label: t.cell.label,
        variant: t.cell.sub,
        x: 0, y: 0, w: SINGLE_SIZE, h: SINGLE_SIZE,
        target: t.cell.target,
        ...(t.cell.art.kind === 'bitmap' ? { letterboxed: nativeSize(t.cell.art.src) } : {})
      }]
    })),
    // Row strips carry their own rects because a strip is a different image
    // with a different origin — the slicer has to be able to take either.
    strips: ALL_STRIPS.filter((t) => t.sheet === s.id).map((t) => ({
      id: t.id,
      file: `${t.file}.png`,
      row: t.row,
      width: t.width,
      height: t.height,
      cell: CELL * STRIP_SCALE,
      cells: t.cells.map((c) => ({
        id: c.id,
        label: c.label,
        variant: c.sub,
        x: c.col * CELL * STRIP_SCALE,
        y: 0,
        w: c.cw * CELL * STRIP_SCALE,
        h: c.ch * CELL * STRIP_SCALE,
        ...(c.target ? { target: c.target } : {}),
        ...(c.art.kind === 'bitmap' ? { letterboxed: nativeSize(c.art.src) } : {})
      }))
    }))
  }))
})

// ─── Export ─────────────────────────────────────────────────────────────────

const save = async (name: string, payload: { dataUrl?: string; text?: string }): Promise<void> => {
  const res = await fetch('/__art/save-sheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, ...payload })
  })
  if (!res.ok) throw new Error(`${name}: ${res.status} ${await res.text()}`)
}

const loadBitmaps = async (): Promise<void> => {
  const srcs = new Set<string>()
  for (const s of SHEETS) {
    for (const c of s.cells) if (c.art.kind === 'bitmap') srcs.add(c.art.src)
  }
  await Promise.all([...srcs].map((src) => new Promise<void>((done) => {
    const img = new Image()
    img.addEventListener('load', () => { bitmaps.set(src, img); done() }, { once: true })
    // A missing UI bitmap is not worth failing the whole export over — the cell
    // simply comes out empty and the key sheet still names it.
    img.addEventListener('error', () => done(), { once: true })
    img.src = prependBaseUrl(src)
  })))
}

const preview = async (): Promise<void> => {
  await loadBitmaps()
  previews.value = SHEETS.map((s) => {
    const cv = renderSheet(s, 1)
    return {
      id: s.id,
      title: s.title,
      url: cv.toDataURL('image/png'),
      dims: `${cv.width}x${cv.height} · ${s.cols}x${sheetRows(s)} cells · ${s.cells.length} frames`
    }
  })
}

const exportAll = async (): Promise<void> => {
  busy.value = true
  try {
    await loadBitmaps()
    for (const s of SHEETS) {
      for (const scale of EXPORT_SCALES) {
        status.value = `rendering ${s.file} @${scale}x`
        await new Promise((r) => requestAnimationFrame(r))
        const cv = renderSheet(s, scale)
        await save(`${s.file}${scale === 1 ? '' : `@${scale}x`}.png`,
          { dataUrl: cv.toDataURL('image/png') })
      }
      status.value = `rendering ${s.file}-key`
      await new Promise((r) => requestAnimationFrame(r))
      await save(`${s.file}-key.png`, { dataUrl: renderKey(s).toDataURL('image/png') })
    }
    // Strips: one row each, double size, with the prompt that goes with them.
    for (const strip of ALL_STRIPS) {
      status.value = `rendering ${strip.file}`
      await new Promise((r) => requestAnimationFrame(r))
      await save(`${strip.file}.png`, { dataUrl: renderStrip(strip).toDataURL('image/png') })
    }

    // One image per object. No lattice, so nothing can drift out of one.
    for (const single of SINGLES) {
      status.value = `rendering ${single.file}`
      await new Promise((r) => requestAnimationFrame(r))
      await save(`${single.file}.png`, { dataUrl: renderSingle(single).toDataURL('image/png') })
    }

    // One sheet per monster design: the walk cycle the battlefield actually
    // plays, which a single still cannot replace without freezing the unit.
    for (const walk of WALKS) {
      status.value = `rendering ${walk.file}`
      await new Promise((r) => requestAnimationFrame(r))
      await save(`${walk.file}.png`, { dataUrl: renderWalk(walk).toDataURL('image/png') })
    }

    // The prompt text belongs to the manifest, which renders it identically for
    // `pnpm art:prompts` — the Art Desk sends what it parses back out of these.
    const docs = promptDocs()
    for (const [name, text] of Object.entries(docs)) await save(name, { text })

    await save('sheet-index.json', { text: JSON.stringify(buildIndex(), null, 2) + '\n' })
    status.value = `wrote ${SHEETS.length * 3 + ALL_STRIPS.length + SINGLES.length + WALKS.length + Object.keys(docs).length + 1} files to art-sheets/`
  } catch (e) {
    status.value = `FAILED — ${(e as Error).message}`
  } finally {
    busy.value = false
  }
}

onMounted(preview)
</script>

<template lang="pug">
  .art-sheets
    header
      h1 Art sheets
      p.lede
        | Every drawable in the game, baked onto a {{ CELL }} px lattice.
        |  Clean sheets are transparent and caption-free; the key sheet carries the
        |  labels. Export writes into #[code art-sheets/].
      .bar
        button(:disabled="busy" @click="exportAll") {{ busy ? 'Exporting…' : 'Export all sheets' }}
        button.ghost(:disabled="busy" @click="preview") Re-render preview
        span.status {{ status }}

    section.sheet(v-for="p in previews" :key="p.id")
      h2 {{ p.title }}
      p.dims {{ p.dims }}
      .frame
        img(:src="p.url" :alt="p.title")
</template>

<style scoped lang="sass">
.art-sheets
  min-height: 100vh
  padding: 24px
  background: #0d1117
  color: #e6edf3
  font: 14px/1.5 ui-sans-serif, system-ui, sans-serif

h1
  margin: 0 0 6px
  font-size: 22px

.lede
  max-width: 70ch
  margin: 0 0 14px
  color: #9aa7b4

code
  padding: 1px 5px
  border-radius: 4px
  background: #1b222c
  font-family: ui-monospace, monospace

.bar
  display: flex
  align-items: center
  gap: 10px
  margin-bottom: 28px

button
  padding: 9px 16px
  border: 1px solid #2f7d9e
  border-radius: 7px
  background: #14364a
  color: #cfeeff
  font: inherit
  font-weight: 600
  cursor: pointer

  &:disabled
    opacity: 0.5
    cursor: default

  &.ghost
    border-color: #2a323d
    background: transparent
    color: #9aa7b4

.status
  color: #7fe0ff
  font-family: ui-monospace, monospace
  font-size: 13px

.sheet
  margin-bottom: 30px

h2
  margin: 0 0 2px
  font-size: 16px

.dims
  margin: 0 0 8px
  color: #7d8894
  font-family: ui-monospace, monospace
  font-size: 12px

.frame
  display: inline-block
  padding: 8px
  border: 1px solid #242c36
  border-radius: 8px
  // A checker, so a transparent ground is visibly transparent rather than
  // looking like a black one that would come back welded into every sprite.
  background-color: #1a2029
  background-image: linear-gradient(45deg, #232b35 25%, transparent 25%), linear-gradient(-45deg, #232b35 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #232b35 75%), linear-gradient(-45deg, transparent 75%, #232b35 75%)
  background-size: 16px 16px
  background-position: 0 0, 0 8px, 8px -8px, -8px 0

img
  display: block
  max-width: 100%
  height: auto
  image-rendering: pixelated
</style>

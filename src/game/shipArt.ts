import {
  rough, hard, fillShape, ink, stroke, tones, noise2, trace, blob,
  type Pt, type CelTones
} from '@/game/inkArt'
import { INK, LINE, paint } from '@/game/monsterKit'
import { mixHex, spriteFor, type Palette } from '@/game/art'

/**
 * ─── Ships: bath toys on the paddling pool ──────────────────────────────────
 *
 * The harbour's three hulls are the toys a kid would float in the moat:
 *
 *   * skiff    → a folded Paper Boat, notebook paper, a toothpick spear;
 *   * longship → a Rubber Duck with a dart harpoon strapped to its back;
 *   * galley   → a plastic Toy Pirate Ship with two cork cannons.
 *
 * Drawn from the same vocabulary as everything else — one key light, the
 * kit's three line weights, its ink colour and its cel tone cuts — so the
 * fleet reads as part of the same sandbox as the castle above it.
 *
 * What ships get that the blocks do not is WATER. Three things sell it, and
 * all three are cheap:
 *
 *   * The hull is cut off at the waterline by a clip, so it sits IN the pool
 *     rather than on top of it. A boat drawn whole always looks beached.
 *   * Everything above the line rolls and heaves on its own slow clock, with
 *     the tall parts leaning further because they are further from the pivot.
 *     Two ships never roll in step.
 *   * A bow wave and a wake, drawn as flat light shapes ON the water rather
 *     than as foam sprites, because the pool itself is flat colour.
 *
 * Convention, shared with the block renderer that calls this: origin at the
 * CELL centre, which for the water row lands exactly on the waterline; `S` is
 * the cell size; authored FACING +X, and the caller mirrors nothing. The deck
 * weapons are bolted down exactly where the muzzle recipes in `useTowerArt`
 * expect them (`ox`/`oy`), so a shot still leaves the gun that fired it.
 */

/** Toy-blue plastic: the duck's harpoon launcher and saddle. */
const TOY_BLUE = tones('#2f7de1', 1.1)
/** Toy-orange foam: every dart in the sandbox. */
const FOAM = tones('#ff8a2b', 1.0)
/** A pale toothpick / popsicle-stick wood. */
const STICK = tones('#efd5a0', 0.9)
/** Black plastic for the pirate ship's cannons. */
const GUNMETAL = tones('#3d414b', 1.2)
/** Cork. */
const CORK = tones('#c99a62', 1.0)
/** An even ink weight, for round toy shapes the kit's swelling pen muddies. */
const EVEN = (_t: number, na: number): number => 0.8 + 0.2 * Math.sin(na)

export interface ShipParts {
  timber: CelTones
  timberDark: CelTones
  /** Sail and livery colour. */
  accent: string
  accent2: string
}

export const shipParts = (p: Palette): ShipParts => ({
  timber: tones(p.mid, 1.12),
  // Mixed DOWN from the mid tone: `tones()` rotates its shadows toward violet,
  // which turns a near-black brown into a purple slab.
  timberDark: tones(mixHexHex(p.mid, p.dark, 0.6), 0.9),
  accent: p.accent,
  accent2: p.accent2
})

/**
 * `mixHex` for `tones()`: it hands back `rgb()`, which `tones` cannot parse —
 * the base survived but every shadow it derived came out black.
 */
const mixHexHex = (a: string, b: string, t: number): string => {
  const m = mixHex(a, b, t).match(/\d+/g)!
  return '#' + m.slice(0, 3).map((v) => Number(v).toString(16).padStart(2, '0')).join('')
}

/** An authored hard-edged part: corners kept, then a hand-drawn wobble. */
const slab = (pts: Pt[], amount: number, seed: number): Pt[] =>
  rough(hard(pts), amount, seed)

/**
 * Point a deck weapon at its target.
 *
 * `Block.aim` is a WORLD angle — `atan2(target.y − by, …)` with +y pointing up
 * — while the canvas has +y pointing down. Every turret in the game therefore
 * rotates by `−aim`. Flipping across the gun's own axis once it points astern
 * keeps its top face up through the whole arc.
 */
const aimTransform = (ctx: CanvasRenderingContext2D, aim: number): void => {
  ctx.rotate(-aim)
  if (Math.cos(aim) < 0) ctx.scale(1, -1)
}

/** A straight part between two points, `th` thick — a stick, a mast, a post. */
const plank = (
  ctx: CanvasRenderingContext2D, S: number,
  a: Pt, b: Pt, th: number, t: CelTones, seed: number
): void => {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1
  const nx = (-dy / len) * th * 0.5
  const ny = (dx / len) * th * 0.5
  const shape = slab([
    [a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny],
    [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]
  ], th * 0.05, seed)
  paint(ctx, S, shape, t, seed, { line: LINE.fine, amp: 0.05, breakUp: 0.2 })
}

/** A flat, crisp-edged facet: paper and plastic, not flesh. */
const facet = (
  ctx: CanvasRenderingContext2D, pts: Pt[], color: string, S: number, seed: number, line: number = LINE.fine
): void => {
  const shape = hard(pts, 0.06)
  fillShape(ctx, shape, color)
  ink(ctx, shape, { width: line * S, color: INK, seed, breakUp: 0.2 })
}

/**
 * Water furniture: bow wave, wake and the shadow the hull casts into the pool.
 *
 * Drawn as flat light shapes rather than particles, because the water itself
 * is flat colour — a soft foam sprite would be the only soft thing on screen.
 */
const waterLine = (
  ctx: CanvasRenderingContext2D, S: number, halfW: number, t: number, seed: number
): void => {
  // The hull's shadow under the surface, so it reads as displacing water.
  ctx.save()
  ctx.globalAlpha = 0.2
  fillShape(ctx, [
    [-halfW * 0.95 * S, 0.02 * S], [halfW * 0.95 * S, 0.02 * S],
    [halfW * 0.7 * S, 0.16 * S], [-halfW * 0.7 * S, 0.16 * S]
  ], '#0f5a78')
  ctx.restore()

  // Bow wave and wake, breathing on their own clock.
  const swell = 0.5 + 0.5 * Math.sin(t / 620 + seed)
  ctx.save()
  ctx.globalAlpha = 0.55
  fillShape(ctx, [
    [halfW * 0.86 * S, 0.02 * S],
    [(halfW * 1.16 + swell * 0.06) * S, -0.03 * S],
    [(halfW * 1.24 + swell * 0.08) * S, 0.03 * S],
    [halfW * 0.9 * S, 0.06 * S]
  ], '#f2fdff')
  for (let i = 0; i < 3; i++) {
    const d = halfW + 0.16 + i * 0.22
    const a = 0.36 - i * 0.09
    ctx.globalAlpha = a
    fillShape(ctx, [
      [-d * S, (0.0 + i * 0.03) * S],
      [(-d - 0.2 - swell * 0.05) * S, (0.01 + i * 0.03) * S],
      [(-d - 0.2 - swell * 0.05) * S, (0.045 + i * 0.03) * S],
      [-d * S, (0.05 + i * 0.03) * S]
    ], '#e4fbff')
  }
  ctx.restore()
}

// ─── The hulls ──────────────────────────────────────────────────────────────

/**
 * Paper Boat — the cheap picket boat.
 *
 * A boat folded from a page of a school notebook: ruled blue lines, a red
 * margin, the tall centre fold, and a toothpick wedged in as a spear. It has
 * to read as SMALL and FLIMSY, because it is what the player buys first and
 * what everything else in the harbour is measured against.
 */
const drawSkiff = (
  ctx: CanvasRenderingContext2D, S: number, m: ShipParts,
  roll: number, aim: number, t: number, layer: ShipLayer
): void => {
  const deck = -0.1
  if (layer === 'fixtures') { skiffGun(ctx, S, aim, deck); return }
  const paper = m.timber
  const lean = roll * 0.35

  // The centre fold, behind the hull's front flap: a lit half and a half in
  // the fold's shadow.
  const apex: Pt = [-0.06 * S + lean, (deck - 0.46) * S]
  facet(ctx, [[-0.3 * S, (deck + 0.02) * S], apex, [-0.06 * S, (deck + 0.02) * S]], paper.lit!, S, 501)
  facet(ctx, [apex, [0.18 * S, (deck + 0.02) * S], [-0.06 * S, (deck + 0.02) * S]], paper.shade, S, 502)
  // Ruled lines carry on up the fold.
  ctx.save()
  ctx.beginPath()
  trace(ctx, hard([[-0.3 * S, (deck + 0.02) * S], apex, [0.18 * S, (deck + 0.02) * S]], 0.06))
  ctx.clip()
  for (let i = 0; i < 3; i++) {
    const y = (deck - 0.08 - i * 0.1) * S
    stroke(ctx, [[-0.4 * S, y], [0.3 * S, y]], 0.012 * S, 0.012 * S, 'rgba(90,155,230,0.55)', 503 + i)
  }
  ctx.restore()

  // Hull: the front flap, wide at the brim and pinched at the keel, its two
  // ends folded up into points.
  const hull: Pt[] = [
    [-0.48 * S, (deck - 0.07) * S], [-0.36 * S, (deck + 0.01) * S], [0.4 * S, (deck - 0.02) * S],
    [0.52 * S, (deck - 0.11) * S], [0.34 * S, 0.2 * S], [-0.3 * S, 0.2 * S]
  ]
  facet(ctx, hull, paper.base, S, 505, LINE.mid)
  ctx.save()
  ctx.beginPath(); trace(ctx, hard(hull, 0.06)); ctx.clip()
  for (let i = 0; i < 3; i++) {
    const y = (deck + 0.08 + i * 0.07) * S
    stroke(ctx, [[-0.5 * S, y], [0.54 * S, y - 0.01 * S]], 0.012 * S, 0.012 * S, 'rgba(90,155,230,0.6)', 506 + i)
  }
  // The red margin, and the diagonal creases where the flap was folded.
  stroke(ctx, [[-0.2 * S, (deck - 0.02) * S], [-0.17 * S, 0.22 * S]], 0.014 * S, 0.014 * S, withA(m.accent2, 0.7), 509)
  stroke(ctx, [[-0.36 * S, (deck + 0.01) * S], [-0.26 * S, 0.2 * S]], 0.012 * S, 0.01 * S, 'rgba(90,110,140,0.45)', 510)
  stroke(ctx, [[0.4 * S, (deck - 0.02) * S], [0.3 * S, 0.2 * S]], 0.012 * S, 0.01 * S, 'rgba(90,110,140,0.45)', 511)
  // The flap's folded brim, a double layer of paper along the top.
  fillShape(ctx, [
    [-0.5 * S, (deck - 0.08) * S], [0.54 * S, (deck - 0.12) * S],
    [0.5 * S, (deck - 0.04) * S], [-0.46 * S, deck * S]
  ], 'rgba(120,140,170,0.22)')
  ctx.restore()

  if (layer !== 'hull') skiffGun(ctx, S, aim, deck)
}

/**
 * The paper boat's toothpick spear, wedged into a pink eraser.
 *
 * Split out because it AIMS. Everything else about a hull holds still
 * enough to be a bitmap; a weapon that tracks its target cannot be, so it
 * is the one layer that carries on being drawn live over painted art —
 * the same bargain a block strikes with its fixture.
 */
const skiffGun = (
  ctx: CanvasRenderingContext2D, S: number, aim: number, deck: number
): void => {
  ctx.save()
  ctx.translate(0.22 * S, (deck - 0.02) * S)
  // The eraser it is stuck in.
  paint(ctx, S, slab([
    [-0.05 * S, 0], [0.05 * S, 0], [0.045 * S, -0.12 * S], [-0.045 * S, -0.12 * S]
  ], 0.004 * S, 512), tones('#ff9bb8', 1.0), 512, { line: LINE.fine, amp: 0.05 })
  ctx.translate(0, -0.13 * S)
  aimTransform(ctx, aim)
  // The toothpick itself, pointed at the business end.
  const pick: Pt[] = hard([
    [-0.12 * S, -0.018 * S], [0.22 * S, -0.018 * S], [0.33 * S, 0],
    [0.22 * S, 0.018 * S], [-0.12 * S, 0.018 * S], [-0.16 * S, 0]
  ], 0.08)
  fillShape(ctx, pick, STICK.base)
  ink(ctx, pick, { width: LINE.hair * S, color: INK, seed: 513, breakUp: 0.1 })
  // A rubber band lashing it down.
  stroke(ctx, [[0.02 * S, -0.04 * S], [0.02 * S, 0.04 * S]], 0.024 * S, 0.024 * S, '#c2453b', 514)
  ctx.restore()
}


/**
 * Rubber Duck — the workhorse.
 *
 * A fat yellow bath duck with a toy dart harpoon strapped to its back. It
 * faces the shore it guards (−X), so the harpoon rides on its back over the
 * tail, where the old longship bolted its thrower down.
 */
const drawLongship = (
  ctx: CanvasRenderingContext2D, S: number, m: ShipParts,
  roll: number, aim: number, t: number, layer: ShipLayer
): void => {
  const deck = -0.14
  if (layer === 'fixtures') { longshipGun(ctx, S, aim, deck); return }
  const duck = m.timber

  // Body: a plump breast on the left, a perky tail on the right.
  const body: Pt[] = [
    [-0.46 * S, -0.1 * S], [-0.56 * S, 0.02 * S], [-0.52 * S, 0.16 * S], [-0.38 * S, 0.26 * S],
    [0.3 * S, 0.26 * S], [0.5 * S, 0.14 * S], [0.58 * S, -0.04 * S], [0.62 * S, -0.3 * S],
    [0.5 * S, -0.26 * S], [0.36 * S, -0.16 * S], [0.08 * S, -0.17 * S], [-0.2 * S, -0.16 * S]
  ]
  paint(ctx, S, rough(body, 0.008 * S, 530), duck, 531, { line: LINE.major, amp: 0.06 })
  // The wing, tucked along the flank.
  const wing: Pt[] = [
    [-0.02 * S, -0.06 * S], [0.2 * S, -0.1 * S], [0.4 * S, -0.04 * S], [0.34 * S, 0.02 * S],
    [0.38 * S, 0.06 * S], [0.26 * S, 0.1 * S], [0.06 * S, 0.08 * S]
  ]
  paint(ctx, S, wing, tones(mixHexHex(m.timber.base, m.accent, 0.35), 0.8), 533,
    { line: false, amp: 0.06, deep: false })
  ink(ctx, wing, { width: LINE.hair * S, color: INK, seed: 532, breakUp: 0.1, weight: EVEN })

  // Head, bobbing on its own clock about the neck. Moves, never reshapes.
  const bob = layer === 'hull' ? 0 : Math.sin(t / 760 + 1.3) * 0.06
  ctx.save()
  ctx.translate(-0.3 * S + roll * 0.4, -0.16 * S)
  ctx.rotate(bob)
  const head = blob(0, -0.2 * S, 0.17 * S, 0.16 * S, 534, 0.03)
  // Inked by hand at an even weight: the kit's pen swells 6x on an underside,
  // and under a round head that swell reads as a beard.
  paint(ctx, S, head, duck, 535, { line: false, amp: 0.08, deep: false })
  ink(ctx, head, { width: LINE.mid * S, color: INK, seed: 536, breakUp: 0.15, weight: EVEN })
  // Beak, and the line of its smile.
  const beak: Pt[] = [
    [-0.13 * S, -0.22 * S], [-0.3 * S, -0.2 * S], [-0.33 * S, -0.15 * S],
    [-0.24 * S, -0.1 * S], [-0.12 * S, -0.12 * S]
  ]
  paint(ctx, S, rough(beak, 0.004 * S, 536), tones(m.accent, 1.1), 537, { line: LINE.mid, amp: 0.05, deep: false })
  stroke(ctx, [[-0.3 * S, -0.16 * S], [-0.2 * S, -0.155 * S], [-0.13 * S, -0.165 * S]], 0.012 * S, 0.008 * S, INK, 538)
  // A big, friendly eye.
  fillShape(ctx, blob(-0.06 * S, -0.26 * S, 0.042 * S, 0.05 * S, 539, 0.04), '#1b1310')
  fillShape(ctx, blob(-0.074 * S, -0.28 * S, 0.016 * S, 0.016 * S, 540, 0.1), 'rgba(255,255,255,0.95)')
  // Cheek blush.
  ctx.save()
  ctx.globalAlpha = 0.35
  fillShape(ctx, blob(0.02 * S, -0.16 * S, 0.045 * S, 0.03 * S, 541, 0.05), '#ff7a3c')
  ctx.restore()
  ctx.restore()

  // The harpoon's saddle, strapped across the back.
  paint(ctx, S, slab([
    [0.24 * S, (deck - 0.02) * S], [0.44 * S, (deck - 0.05) * S],
    [0.46 * S, (deck + 0.05) * S], [0.24 * S, (deck + 0.07) * S]
  ], 0.004 * S, 542), TOY_BLUE, 543, { line: LINE.fine, amp: 0.05, deep: false })

  if (layer !== 'hull') longshipGun(ctx, S, aim, deck)
}

/**
 * The duck's dart harpoon: a toy-blue launcher tube with a foam dart loaded.
 *
 * Split out because it AIMS — the one layer that carries on being drawn live
 * over a painted hull.
 */
const longshipGun = (
  ctx: CanvasRenderingContext2D, S: number, aim: number, deck: number
): void => {
  ctx.save()
  ctx.translate(0.34 * S, (deck - 0.04) * S)
  plank(ctx, S, [0, 0], [0, -0.14 * S], 0.06 * S, TOY_BLUE, 550)
  ctx.translate(0, -0.15 * S)
  aimTransform(ctx, aim)
  // The dart sticking out of the muzzle: orange foam, blue suction cup.
  plank(ctx, S, [0.12 * S, 0], [0.3 * S, 0], 0.045 * S, FOAM, 553)
  paint(ctx, S, slab([
    [0.29 * S, -0.026 * S], [0.36 * S, -0.05 * S], [0.39 * S, -0.05 * S],
    [0.39 * S, 0.05 * S], [0.36 * S, 0.05 * S], [0.29 * S, 0.026 * S]
  ], 0.003 * S, 554), TOY_BLUE, 555, { line: LINE.fine, amp: 0.04, deep: false })
  // The launcher tube.
  paint(ctx, S, slab([
    [-0.12 * S, -0.045 * S], [0.16 * S, -0.04 * S], [0.16 * S, 0.04 * S], [-0.12 * S, 0.045 * S]
  ], 0.004 * S, 551), TOY_BLUE, 552, { line: LINE.mid, amp: 0.04 })
  // A yellow band round the muzzle — the toy's trim.
  fillShape(ctx, [
    [0.1 * S, -0.043 * S], [0.14 * S, -0.042 * S], [0.14 * S, 0.042 * S], [0.1 * S, 0.043 * S]
  ], '#ffc93c')
  ctx.restore()
}


/**
 * Toy Pirate Ship — the capital ship.
 *
 * Brown moulded plastic with gold trim, a stern castle with battlements, a
 * striped sail, a little skull flag snapping at the masthead and two cork
 * cannons on deck. It is the biggest thing the player can put on the water
 * and it is drawn to be worth what it costs.
 */
const drawGalley = (
  ctx: CanvasRenderingContext2D, S: number, m: ShipParts,
  roll: number, aim: number, t: number, layer: ShipLayer
): void => {
  const deck = -0.16
  if (layer === 'fixtures') { galleyBattery(ctx, S, aim, deck); return }

  const hull = slab([
    [-0.56 * S, (deck - 0.02) * S], [0.5 * S, (deck - 0.04) * S],
    [0.62 * S, 0.04 * S], [0.36 * S, 0.26 * S],
    [-0.36 * S, 0.26 * S], [-0.6 * S, 0.04 * S]
  ], 0.01 * S, 570)
  paint(ctx, S, hull, m.timber, 571, { line: LINE.major, amp: 0.05 })
  ctx.save()
  ctx.beginPath(); trace(ctx, hull); ctx.clip()
  // Moulded plank lines, and a gold stripe along the sheer.
  for (let i = 0; i < 3; i++) {
    const y = (deck + 0.1 + i * 0.07) * S
    stroke(ctx, [[-0.62 * S, y], [0.64 * S, y - 0.014 * S]],
      0.014 * S, 0.012 * S, m.timber.deep!, 572 + i)
  }
  stroke(ctx, [[-0.62 * S, (deck + 0.035) * S], [0.64 * S, (deck + 0.015) * S]],
    0.04 * S, 0.034 * S, m.accent, 575)
  ctx.restore()
  // Gun ports: black portholes ringed in gold.
  for (const px of [-0.38, -0.12, 0.14, 0.38]) {
    fillShape(ctx, blob(px * S, (deck + 0.13) * S, 0.042 * S, 0.042 * S, 576 + px * 10, 0.03), m.accent)
    fillShape(ctx, blob(px * S, (deck + 0.13) * S, 0.026 * S, 0.026 * S, 577 + px * 10, 0.03), '#1d1512')
  }

  // Gold figurehead at the bow — where the galley once carried its ram.
  const bow = slab([
    [0.5 * S, 0.0 * S], [0.74 * S, -0.02 * S],
    [0.78 * S, 0.06 * S], [0.5 * S, 0.11 * S]
  ], 0.006 * S, 578)
  paint(ctx, S, bow, tones(m.accent, 1.2), 579, { line: LINE.mid, amp: 0.05 })

  // Stern castle, with plastic battlements.
  const castle = slab([
    [-0.56 * S, (deck - 0.3) * S], [-0.24 * S, (deck - 0.3) * S],
    [-0.24 * S, (deck + 0.0) * S], [-0.56 * S, (deck + 0.0) * S]
  ], 0.008 * S, 584)
  paint(ctx, S, castle, m.timberDark, 585, { line: LINE.mid, amp: 0.05 })
  for (const mx of [-0.56, -0.44, -0.32]) {
    paint(ctx, S, slab([
      [mx * S, (deck - 0.38) * S], [(mx + 0.08) * S, (deck - 0.38) * S],
      [(mx + 0.08) * S, (deck - 0.29) * S], [mx * S, (deck - 0.29) * S]
    ], 0.005 * S, 586), m.timberDark, 587, { line: LINE.hair, amp: 0.04, deep: false })
  }
  // A stern window, lit.
  fillShape(ctx, blob(-0.4 * S, (deck - 0.15) * S, 0.05 * S, 0.06 * S, 588, 0.04), '#ffd86b')

  // Mast, a striped sail, and the skull flag.
  const mx = 0.02 * S
  const top = deck - 0.72
  const lean = roll * 0.5
  plank(ctx, S, [mx, deck * S], [mx + lean, top * S], 0.05 * S, m.timberDark, 590)
  const belly = 0.1 + Math.sin(t / 900 + 3) * 0.04
  const yl = mx - 0.24 * S + lean * 0.8
  const yr = mx + 0.26 * S + lean * 0.8
  const st = (top + 0.1) * S
  const sb = (top + 0.5) * S
  const sailShape: Pt[] = []
  for (let i = 0; i <= 8; i++) {
    const k = i / 8
    sailShape.push([yl + (yr - yl) * k, st + Math.sin(k * Math.PI) * belly * 0.3 * S])
  }
  for (let i = 8; i >= 0; i--) {
    const k = i / 8
    sailShape.push([yl + (yr - yl) * k + roll * 0.2, sb + Math.sin(k * Math.PI) * belly * S])
  }
  paint(ctx, S, sailShape, tones('#fff4dc', 1.0), 591, { line: LINE.mid, amp: 0.1, breakUp: 0.3 })
  ctx.save()
  ctx.beginPath(); trace(ctx, sailShape); ctx.clip()
  for (const k of [0.3, 0.62]) {
    const y = st + (sb - st) * k + belly * 0.5 * S
    stroke(ctx, [[yl - 0.02 * S, y], [yr + 0.02 * S, y]], 0.07 * S, 0.07 * S, withA(m.accent2, 0.85), 592)
  }
  ctx.restore()
  // Yard across the head of the sail.
  plank(ctx, S, [yl - 0.03 * S, st], [yr + 0.03 * S, st], 0.034 * S, m.timberDark, 593)

  // The flag snaps on its own clock — the one thing up here that never rests.
  const flap = layer === 'hull' ? 0 : Math.sin(t / 260 + 1.1) * 0.025
  const fx = mx + lean
  const fy = top * S
  const flag: Pt[] = [
    [fx, fy], [fx + 0.1 * S, fy - (0.01 + flap) * S], [fx + 0.2 * S, fy + (0.005 - flap) * S],
    [fx + 0.19 * S, fy + (0.1 + flap * 0.5) * S], [fx + 0.1 * S, fy + (0.09 + flap) * S], [fx, fy + 0.1 * S]
  ]
  paint(ctx, S, flag, tones('#26211f', 1.0), 594, { line: LINE.fine, amp: 0.04, deep: false, lit: false })
  fillShape(ctx, blob(fx + 0.09 * S, fy + 0.045 * S, 0.028 * S, 0.026 * S, 595, 0.06), '#f6efe0')

  if (layer !== 'hull') galleyBattery(ctx, S, aim, deck)
}

/**
 * The pirate ship's broadside — two cork cannons, fore and aft of the mast.
 *
 * TWO because the galley is the capital ship and the top of the harbour tree,
 * and a single gun made it read as a duck with a nicer hull. Both track the
 * same target.
 *
 * Split out because it AIMS, and so is the one layer that carries on being
 * drawn live over a painted hull.
 */
const galleyBattery = (
  ctx: CanvasRenderingContext2D, S: number, aim: number, deck: number
): void => {
  const cannon = (x: number, scale: number, seed: number): void => {
    ctx.save()
    ctx.translate(x * S, (deck - 0.06) * S)
    // A red plastic carriage.
    plank(ctx, S, [-0.09 * S * scale, 0], [0.09 * S * scale, 0], 0.07 * S, tones('#d8453a', 1.0), seed)
    ctx.translate(0, -0.07 * S)
    aimTransform(ctx, aim)
    ctx.scale(scale, scale)
    paint(ctx, S, slab([
      [-0.1 * S, -0.058 * S], [0.26 * S, -0.045 * S],
      [0.26 * S, 0.045 * S], [-0.1 * S, 0.058 * S]
    ], 0.006 * S, seed + 1), GUNMETAL, seed + 2, { line: LINE.mid, amp: 0.04 })
    // A gold band, and the cork jammed in the muzzle.
    fillShape(ctx, [
      [0.02 * S, -0.056 * S], [0.06 * S, -0.054 * S], [0.06 * S, 0.054 * S], [0.02 * S, 0.056 * S]
    ], '#ffc93c')
    paint(ctx, S, slab([
      [0.25 * S, -0.04 * S], [0.33 * S, -0.048 * S], [0.33 * S, 0.048 * S], [0.25 * S, 0.04 * S]
    ], 0.003 * S, seed + 3), CORK, seed + 4, { line: LINE.fine, amp: 0.04, deep: false })
    ctx.restore()
  }

  // The aft gun is drawn a little smaller: it sits further from the viewer on
  // the far side of the mast, and matching them exactly reads as a decal.
  cannon(-0.18, 0.86, 596)
  cannon(0.3, 1, 600)
}

/** `rgba()` from a hex colour — local, so this module needs nothing else. */
const withA = (hex: string, a: number): string => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

/**
 * How far below its cell centre a hull is drawn, in cells.
 *
 * The water row's centre lands exactly on `SEA_LEVEL`, which is the SHORELINE
 * — and in this side-on projection the pool reads as the band below the sand,
 * not as the line where they meet. A boat drawn on that line looks beached
 * against the bank behind it. Dropping it clear of the shore strip is what
 * puts it visibly on open water.
 */
export const SHIP_DRAFT = 0.42

/**
 * Which half of a ship to draw.
 *
 * `hull` is everything that holds still — the paper, the duck, the pirate
 * ship's hull and sail — and is what a painted bitmap replaces. `fixtures` is
 * the deck weapon, which aims at whatever the ship is shooting at and so can
 * never be baked. The ships are blocks in every way that matters: a base, with
 * a gun on top.
 */
export type ShipLayer = 'all' | 'hull' | 'fixtures'

/**
 * The band of a hull that is actually visible, in units of S, measured from
 * the waterline origin.
 *
 * It IS the clip rectangle below — everything outside it is cut away — which
 * makes it the one honest box to hand a painter and to blit a return into.
 * Exported so the art bench renders the reference at exactly the rectangle
 * the renderer will draw it back into.
 */
export const SHIP_CLIP = { x: -1.2, y: -1.6, w: 2.4, h: 1.82 } as const

/**
 * The rectangle a PAINTED hull occupies, in the same units.
 *
 * Not the clip band, which is sized for the wake — three trailing bands that
 * reach well over a boat-length to either side. These numbers are measured
 * off the three drawn hulls rather than chosen: the widest (the pirate ship,
 * figurehead to stern) runs -0.61..+0.79 and the tallest masthead reaches
 * -0.90, so the box is those with a little air. Its bottom IS the clip, which
 * is what makes the waterline the frame's own bottom edge.
 */
export const SHIP_ART = { x: -0.7, y: -1.0, w: 1.6, h: 1.22 } as const

/** Hulls with a painted bitmap to look for. */
const SHIP_HULLS = new Set(['skiff', 'longship', 'galley'])

/**
 * Draw one moored ship.
 *
 * `aim` is the deck weapon's angle in radians; `t` the render clock. Everything
 * above the waterline rolls, and the hull is clipped at it.
 */
export const drawShip = (
  ctx: CanvasRenderingContext2D, id: string, S: number, p: Palette,
  opts: { aim: number; t: number; seed: number; layer?: ShipLayer }
): void => {
  const m = shipParts(p)
  const { aim, t, seed } = opts
  const layer = opts.layer ?? 'all'
  // Every hull rolls and heaves on its own phase, so a line of moored ships
  // never moves as one object.
  // A reference bake sits DEAD LEVEL. The roll is applied to the bitmap at
  // run time, so baking a tilt into it would tilt the hull twice.
  const phase = layer === 'hull' ? 0 : seed * 1.7
  const roll = layer === 'hull' ? 0 : Math.sin(t / 1450 + phase) * 0.05 * S
  const heave = layer === 'hull' ? 0 : Math.sin(t / 1100 + phase * 1.3) * 0.022 * S

  ctx.save()
  ctx.translate(0, SHIP_DRAFT * S)

  // The wake belongs to the water, not to the ship: it stays live, and it is
  // never part of what a painter is asked for. The duck swims the other way
  // round, so its bow wave is at its breast and its wake trails the tail.
  if (layer !== 'hull') {
    ctx.save()
    if (id === 'longship') ctx.scale(-1, 1)
    waterLine(ctx, S, id === 'skiff' ? 0.5 : id === 'longship' ? 0.58 : 0.62, t, phase)
    ctx.restore()
  }

  ctx.save()
  // Clip away everything below the waterline: the origin of the water row IS
  // the surface, so a boat drawn whole always looks beached on the pool.
  ctx.beginPath()
  ctx.rect(SHIP_CLIP.x * S, SHIP_CLIP.y * S, SHIP_CLIP.w * S, SHIP_CLIP.h * S)
  ctx.clip()
  ctx.translate(0, heave)
  ctx.rotate(roll / S * 0.5)

  const draw = (l: ShipLayer): void => {
    if (id === 'longship') drawLongship(ctx, S, m, roll, aim, t, l)
    else if (id === 'galley') drawGalley(ctx, S, m, roll, aim, t, l)
    else drawSkiff(ctx, S, m, roll, aim, t, l)
  }

  // A painted hull, if one has been dropped in.
  //
  // Blitted into the clip rectangle it was drawn against, INSIDE the roll and
  // heave, so a painted boat still moves on the water — and the deck weapon
  // carries on being drawn live on top, still tracking its target. Never
  // consulted while baking a reference (`layer` is explicit then), which is
  // what stops the bench painting last week's return into this week's sheet.
  const painted = layer === 'all' && SHIP_HULLS.has(id) ? spriteFor('ship', id) : null
  if (painted) {
    ctx.drawImage(
      painted,
      SHIP_ART.x * S, SHIP_ART.y * S, SHIP_ART.w * S, SHIP_ART.h * S
    )
    draw('fixtures')
  } else {
    draw(layer)
  }

  ctx.restore()
  ctx.restore()
  void noise2
}

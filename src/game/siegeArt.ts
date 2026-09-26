import {
  rough, hard, fillShape, ink, shrink, stroke, tones, noise2, trace, blob,
  type Pt, type CelTones
} from '@/game/inkArt'
import { INK, LINE, paint, groundShadow, footStep } from '@/game/monsterKit'
import type { Palette } from '@/game/art'

/**
 * ─── Contraptions (siege engines) ───────────────────────────────────────────
 *
 * Sandbox Tower's six siege engines are ANT ENGINEERING: machines a colony has
 * cobbled together out of whatever the kid left lying in the backyard. Timber
 * became popsicle sticks and pencils, cart wheels became bottle caps, buttons
 * and toy-car wheels, rope became string and rubber bands, and iron became tin.
 * The crews are little black ants.
 *
 * They are still drawn from the SAME vocabulary as the bug cast: one key light,
 * the kit's three line weights, the kit's ink colour, and cel tone cuts from
 * `tones()`. What the machines get that creatures do not is a MATERIAL
 * vocabulary — birch popsicle stick, hex-barrelled pencil, crimped bottle cap,
 * rubber band, cardboard, tin — and using those consistently is what makes the
 * six read as one colony's workshop output.
 *
 * Drawing convention, shared with the enemy pipeline that calls this: origin at
 * the engine's centre of mass, `S` is the unit scale, the ground line sits at
 * `y = +0.5`, and everything is authored FACING +X. The caller has already
 * applied the mirror for direction.
 *
 * The mechanics are the old machines' mechanics, untouched: wheel radii and
 * positions, the arms' pivots, lengths and cock-and-release curves, the ram's
 * swing, the tower's ramp hinge and drop, and which parts are baked (`static`)
 * versus drawn live against the machine's own reload (`moving`).
 */

/**
 * Where the wheels meet the earth, in units of S.
 *
 * Not a look-right number: ground units spawn at `y = scale / 2`, and `S` is
 * `scale × zoom`, so `+0.5 S` below the origin is exactly the world's ground
 * line. Anything else and the engine floats or paddles.
 */
const GROUND = 0.5
const TAU = Math.PI * 2

// ─── Toy-junk materials ─────────────────────────────────────────────────────

/** Birch popsicle stick — the timber of every contraption. */
const STICK = tones('#efcd92', 0.95)
/** A stick set further back: a step down in value, never a new hue. */
const STICK_BACK = tones('#d2a86a', 0.9)
/** School-pencil yellow. */
const PENCIL = tones('#ffc93c', 1.0)
/** Pink pencil eraser. */
const ERASER = tones('#ff8ea4', 1.0)
/** The crimped aluminium band that holds an eraser on. */
const FERRULE = tones('#c9cfd6', 1.25)
/** Freshly sharpened cedar. */
const SHAVED = tones('#f3d6a6', 0.85)
const GRAPHITE = '#3e3a44'
/** Soup-tin metal: bright and cold. Darts do nothing to it. */
const TIN = tones('#b7c0cb', 1.3)
/** Dinner-fork steel, a notch brighter than the tin. */
const STEEL = tones('#d3dae2', 1.3)
/** Kitchen string — the new rope. */
const TWINE = tones('#f0e4c6', 0.9)
/** Corrugated cardboard. */
const CARD = tones('#cf9f62', 1.0)
/** Grey garden pebble. */
const PEBBLE = tones('#9aa3ad', 1.15)
/** A packed clod of damp sand. */
const CLOD = tones('#cfa15e', 1.05)
/** Toy-car tyre rubber and its chrome hub. */
const RUBBER = tones('#3a3540', 1.1)
const CHROME = tones('#d8dee6', 1.3)
/** Wind-up-key brass. */
const BRASS = tones('#e2b447', 1.1)
/** Foam dart, from the player's blasters, stuck on by its suction cup. */
const DART_FOAM = '#ff8a2b'
const DART_CUP = '#2f7de1'

type Tones = Required<CelTones>

export interface SiegeParts {
  /** The engine's own toy colour: car paint, carton print, spoon plastic. */
  toy: Tones
  /** A step darker, for parts sitting behind. */
  toyBack: Tones
  /** Second colour: rubber bands, caps, labels. */
  accent: string
  accent2: string
}

/**
 * Mix two `#rrggbb` colours, returning `#rrggbb`.
 *
 * Not `art.mixHex`: that returns an `rgb()` string, which `tones()` cannot
 * parse — its shade steps come back as near-black.
 */
const mix = (a: string, b: string, t: number): string => {
  const pa = parseInt(a.slice(1, 7), 16)
  const pb = parseInt(b.slice(1, 7), 16)
  let out = '#'
  for (const sh of [16, 8, 0]) {
    const ca = (pa >> sh) & 255
    const cb = (pb >> sh) & 255
    out += Math.round(ca + (cb - ca) * t).toString(16).padStart(2, '0')
  }
  return out
}

/**
 * Derive the material set from the engine's palette.
 *
 * `toyBack` is mixed DOWN from the mid tone rather than taken from `p.dark`,
 * so a part further back reads as the same plastic in shadow rather than as a
 * different material.
 */
export const siegeParts = (p: Palette): SiegeParts => ({
  toy: tones(p.mid, 1.05),
  toyBack: tones(mix(p.mid, p.dark, 0.45), 0.95),
  accent: p.accent,
  accent2: p.accent2
})

// ─── Geometry helpers ───────────────────────────────────────────────────────

/** An authored part: hard corners, then a hand-drawn wobble. */
const slab = (pts: Pt[], amount: number, seed: number): Pt[] =>
  rough(hard(pts), amount, seed)

/** A segment's own frame: `at(u, v)` is `u` along a→b and `v` across it. */
const frame = (a: Pt, b: Pt): { len: number; at: (u: number, v: number) => Pt } => {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1e-4
  const ux = dx / len
  const uy = dy / len
  return { len, at: (u, v) => [a[0] + ux * u - uy * v, a[1] + uy * u + ux * v] }
}

/** A stick with ROUNDED ends — the single tell that it is a popsicle stick. */
const capsule = (a: Pt, b: Pt, th: number): Pt[] => {
  const f = frame(a, b)
  const r = th / 2
  const L = Math.max(f.len, th)
  const pts: Pt[] = [f.at(r, -r), f.at(L - r, -r)]
  for (let i = 1; i < 4; i++) {
    const k = -Math.PI / 2 + (i / 4) * Math.PI
    pts.push(f.at(L - r + Math.cos(k) * r, Math.sin(k) * r))
  }
  pts.push(f.at(L - r, r), f.at(r, r))
  for (let i = 1; i < 4; i++) {
    const k = Math.PI / 2 + (i / 4) * Math.PI
    pts.push(f.at(r + Math.cos(k) * r, Math.sin(k) * r))
  }
  return pts
}

/** A rotated ellipse, for small parts drawn live (no noise to compute). */
const oval = (cx: number, cy: number, rx: number, ry: number, ang = 0, n = 16): Pt[] => {
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU
    const x = Math.cos(a) * rx
    const y = Math.sin(a) * ry
    pts.push([cx + x * c - y * s, cy + x * s + y * c])
  }
  return pts
}

// ─── Material vocabulary ────────────────────────────────────────────────────

/**
 * A popsicle stick from `a` to `b`.
 *
 * Rounded ends and a couple of fine grain lines along it. The grain stays
 * inside the stick's width, so no clip is needed.
 */
const stick = (
  ctx: CanvasRenderingContext2D, S: number,
  a: Pt, b: Pt, th: number, t: CelTones, seed: number, grain = 2
): void => {
  paint(ctx, S, capsule(a, b, th), t, seed, { line: LINE.fine, amp: 0.05, breakUp: 0.25 })
  const f = frame(a, b)
  if (f.len < th * 2.2) return
  for (let i = 0; i < grain; i++) {
    const off = (noise2(i * 1.7, seed, seed) - 0.5) * th * 0.6
    stroke(ctx, [
      f.at(th * 0.7, off), f.at(f.len * 0.5, off + th * 0.05), f.at(f.len - th * 0.7, off)
    ], th * 0.05, th * 0.03, t.shade, seed + i * 3)
  }
}

/**
 * A flat-coloured part with an ink edge — no cel cut, so no clip.
 *
 * For the small pieces that ride the LIVE layers (the pencil's eraser, ferrule
 * and cone, a wind-up key): at the size they are drawn a tone cut is
 * invisible, and each `paint` call opens a clip, which is where a live layer's
 * frame budget quietly goes.
 */
const flat = (
  ctx: CanvasRenderingContext2D, S: number, shape: Pt[], color: string, seed: number,
  line: number = LINE.fine
): void => {
  fillShape(ctx, shape, color)
  ink(ctx, shape, { width: line * S, color: INK, seed, breakUp: 0.2 })
}

/**
 * A pencil from its back end `a` to its point `b`.
 *
 * Read from back to front: pink eraser, crimped ferrule, a hex barrel in
 * pencil yellow with its facet stripes, the scalloped edge where the paint
 * meets the sharpened cedar, and the graphite point. Every one of those is a
 * separate recognisable shape, which is what lets a pencil stay a pencil at
 * forty pixels.
 */
const pencil = (
  ctx: CanvasRenderingContext2D, S: number,
  a: Pt, b: Pt, th: number, seed: number, o: { eraser?: boolean } = {}
): void => {
  const f = frame(a, b)
  const L = f.len
  const r = th / 2
  const eL = o.eraser === false ? 0 : th * 0.85
  const fL = o.eraser === false ? 0 : th * 0.6
  const bodyA = eL + fL
  const bodyB = L - th * 1.6

  // Drawn from flat parts and stripes rather than `paint`: pencils ride the
  // live layer (the ram's ram, the trebuchet's beam), and the facet stripes
  // already do the shading a cel cut would.
  if (eL > 0) {
    flat(ctx, S, [
      f.at(eL + th * 0.08, -r * 0.9), f.at(th * 0.18, -r * 0.9), f.at(0, -r * 0.45),
      f.at(0, r * 0.45), f.at(th * 0.18, r * 0.9), f.at(eL + th * 0.08, r * 0.9)
    ], ERASER.base, seed)
    stroke(ctx, [f.at(th * 0.2, -r * 0.5), f.at(eL, -r * 0.5)], r * 0.22, r * 0.22, ERASER.lit, seed + 9)
  }

  // Sharpened cone, then the lead, both UNDER the painted barrel's scallops.
  flat(ctx, S, hard([
    f.at(bodyB, -r * 0.98), f.at(L - th * 0.5, -r * 0.34), f.at(L, 0),
    f.at(L - th * 0.5, r * 0.34), f.at(bodyB, r * 0.98)
  ], 0.08), SHAVED.base, seed + 1)
  stroke(ctx, [f.at(bodyB + th * 0.2, r * 0.45), f.at(L - th * 0.5, r * 0.18)], r * 0.28, r * 0.1, SHAVED.shade, seed + 10)
  const lead: Pt[] = hard([
    f.at(L - th * 0.55, -r * 0.37), f.at(L + th * 0.03, 0), f.at(L - th * 0.55, r * 0.37)
  ], 0.1)
  fillShape(ctx, lead, GRAPHITE)

  // Barrel, ending in three scallops — one per visible facet.
  const s0 = bodyB
  const body: Pt[] = [
    f.at(bodyA, -r), f.at(s0 + th * 0.1, -r),
    f.at(s0 + th * 0.32, -r * 0.66), f.at(s0 + th * 0.12, -r * 0.33),
    f.at(s0 + th * 0.34, 0), f.at(s0 + th * 0.12, r * 0.33),
    f.at(s0 + th * 0.32, r * 0.66), f.at(s0 + th * 0.1, r),
    f.at(bodyA, r)
  ]
  fillShape(ctx, body, PENCIL.base)
  // Facet stripes: lit on one side, shaded on the other, running the length.
  stroke(ctx, [f.at(bodyA + th * 0.1, -r * 0.55), f.at(s0, -r * 0.55)],
    r * 0.3, r * 0.3, PENCIL.lit, seed + 3)
  stroke(ctx, [f.at(bodyA + th * 0.1, r * 0.42), f.at(s0, r * 0.42)],
    r * 0.34, r * 0.34, PENCIL.shade, seed + 4)
  stroke(ctx, [f.at(bodyA + th * 0.1, -r * 0.1), f.at(s0, -r * 0.1)],
    r * 0.07, r * 0.07, PENCIL.deep, seed + 5)
  ink(ctx, body, { width: LINE.mid * S, color: INK, seed: seed + 11, breakUp: 0.3 })

  if (fL > 0) {
    flat(ctx, S, hard([
      f.at(eL, -r * 1.04), f.at(bodyA + th * 0.04, -r * 1.04),
      f.at(bodyA + th * 0.04, r * 1.04), f.at(eL, r * 1.04)
    ], 0.12), FERRULE.base, seed + 6)
    stroke(ctx, [f.at(eL + fL * 0.1, -r * 0.6), f.at(bodyA, -r * 0.6)], r * 0.24, r * 0.24, FERRULE.lit, seed + 12)
    for (const k of [0.33, 0.66]) {
      stroke(ctx, [f.at(eL + fL * k, -r * 0.95), f.at(eL + fL * k, r * 0.95)],
        th * 0.05, th * 0.05, FERRULE.deep, seed + 7)
    }
  }
  ink(ctx, lead, { width: th * 0.1, color: INK, seed: seed + 8, breakUp: 0.1 })
}

/** A rubber band: an ink edge, the band, and a thin sheen along it. */
const band = (
  ctx: CanvasRenderingContext2D, pts: Pt[], w: number, color: string, seed: number
): void => {
  stroke(ctx, pts, w * 1.9, w * 1.9, INK, seed)
  stroke(ctx, pts, w, w, color, seed + 1)
}

/**
 * Kitchen string, drawn with its LAY — the twist of the strands. A plain line
 * reads as wire; two offset passes over a base stroke read as cord.
 */
const twine = (
  ctx: CanvasRenderingContext2D, pts: Pt[], w: number, seed: number
): void => {
  stroke(ctx, pts, w * 1.5, w * 1.5, INK, seed)
  stroke(ctx, pts, w, w, TWINE.base, seed)
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!
    const b = pts[i + 1]!
    for (let k = 0; k < 3; k++) {
      const t0 = k / 3
      const t1 = (k + 0.55) / 3
      stroke(ctx, [
        [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0],
        [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1]
      ], w * 0.34, w * 0.34, TWINE.deep, seed + i * 5 + k)
    }
  }
}

/**
 * A wad of rubber bands wound round a stick end — the spring that replaces a
 * torsion skein. Banded in several colours so it reads as "lots of rubber
 * bands" rather than as a painted drum.
 */
const bandWad = (
  ctx: CanvasRenderingContext2D, S: number,
  x: number, y: number, r: number, colors: readonly string[], seed: number
): void => {
  const drum = slab([
    [x - r * 0.6, y - r], [x + r * 0.6, y - r],
    [x + r * 0.6, y + r], [x - r * 0.6, y + r]
  ], r * 0.06, seed)
  paint(ctx, S, drum, tones(colors[0]!, 1.1), seed, { line: LINE.fine, amp: 0.05 })
  for (let i = 0; i < 5; i++) {
    const yy = y - r + (r * 2 * (i + 0.5)) / 5
    const col = colors[i % colors.length]!
    stroke(ctx, [[x - r * 0.64, yy], [x + r * 0.64, yy + r * 0.06]],
      r * 0.34, r * 0.3, INK, seed + i)
    stroke(ctx, [[x - r * 0.6, yy], [x + r * 0.6, yy + r * 0.06]],
      r * 0.24, r * 0.2, col, seed + i + 10)
    stroke(ctx, [[x - r * 0.4, yy - r * 0.05], [x + r * 0.2, yy - r * 0.03]],
      r * 0.06, r * 0.05, 'rgba(255,255,255,0.45)', seed + i + 20)
  }
}

// ─── Wheels ─────────────────────────────────────────────────────────────────
//
// `spin` turns the PRINT on each wheel — the star on a cap, the holes in a
// button, the hub holes on a toy wheel. Wheels are driven by distance
// travelled rather than by time, so a halted engine's wheels stop: the clearest
// possible signal that it has set up to fire.

/** A crown bottle cap rolled on its edge, crimp teeth and a printed star. */
const capWheel = (
  ctx: CanvasRenderingContext2D, S: number,
  x: number, y: number, r: number, spin: number, t: Tones, seed: number
): void => {
  const N = 21
  const skirt: Pt[] = []
  for (let i = 0; i < N * 2; i++) {
    const a = spin + (i / (N * 2)) * TAU
    const rr = r * (i % 2 === 0 ? 1 : 0.9)
    skirt.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr])
  }
  paint(ctx, S, skirt, t, seed, { line: LINE.fine, amp: 0.04, deep: false, hatch: false })
  const crown = oval(x, y, r * 0.72, r * 0.72, 0, 24)
  fillShape(ctx, crown, t.lit)
  ink(ctx, crown, { width: r * 0.09, color: t.deep, seed: seed + 2, breakUp: 0.3 })
  const star: Pt[] = []
  for (let i = 0; i < 10; i++) {
    const a = spin + (i / 10) * TAU - Math.PI / 2
    const rr = r * (i % 2 === 0 ? 0.5 : 0.21)
    star.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr])
  }
  fillShape(ctx, hard(star, 0.1), '#fff6e0')
  // Enamel gloss on the lit shoulder.
  stroke(ctx, [
    [x - r * 0.78, y - r * 0.2], [x - r * 0.6, y - r * 0.56], [x - r * 0.24, y - r * 0.8]
  ], r * 0.08, r * 0.05, 'rgba(255,255,255,0.7)', seed + 3)
}

/** A sewing button: dished face, four holes and the thread through them. */
const buttonWheel = (
  ctx: CanvasRenderingContext2D, S: number,
  x: number, y: number, r: number, spin: number, t: Tones, seed: number
): void => {
  paint(ctx, S, oval(x, y, r, r, 0, 28), t, seed, { line: LINE.fine, amp: 0.04, deep: false, hatch: false })
  fillShape(ctx, oval(x + r * 0.04, y + r * 0.04, r * 0.7, r * 0.7, 0, 22), t.shade)
  const holes: Pt[] = []
  for (let i = 0; i < 4; i++) {
    const a = spin + Math.PI / 4 + (i / 4) * TAU
    holes.push([x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3])
  }
  stroke(ctx, [holes[0]!, holes[2]!], r * 0.12, r * 0.12, '#fbf3df', seed + 1)
  stroke(ctx, [holes[1]!, holes[3]!], r * 0.12, r * 0.12, '#fbf3df', seed + 2)
  for (const h of holes) fillShape(ctx, oval(h[0], h[1], r * 0.1, r * 0.1, 0, 10), t.deep)
  stroke(ctx, [
    [x - r * 0.84, y - r * 0.1], [x - r * 0.66, y - r * 0.55], [x - r * 0.26, y - r * 0.82]
  ], r * 0.08, r * 0.05, 'rgba(255,255,255,0.65)', seed + 3)
}

/** A die-cast toy-car wheel: black tyre, chrome hub with five holes. */
const toyWheel = (
  ctx: CanvasRenderingContext2D, S: number,
  x: number, y: number, r: number, spin: number, seed: number
): void => {
  paint(ctx, S, blob(x, y, r, r, seed, 0.02, 1.9, 32), RUBBER, seed, { line: LINE.fine, amp: 0.04, hatch: false })
  const hub = oval(x, y, r * 0.56, r * 0.56, 0, 22)
  paint(ctx, S, hub, CHROME, seed + 1, { line: LINE.hair, amp: 0.05, hatch: false, deep: false })
  for (let i = 0; i < 5; i++) {
    const a = spin + (i / 5) * TAU
    fillShape(ctx, oval(x + Math.cos(a) * r * 0.32, y + Math.sin(a) * r * 0.32, r * 0.09, r * 0.09, 0, 8), '#5b6370')
  }
  fillShape(ctx, oval(x, y, r * 0.12, r * 0.12, 0, 10), CHROME.lit)
}

// ─── Crew ───────────────────────────────────────────────────────────────────

const ANT_BODY = '#342b31'
const ANT_LIT = '#62535c'
const ANT_INK = '#150f12'
const ANT_LEG = '#231b20'
const ANT_GLOSS = 'rgba(255,255,255,0.62)'
/** The acorn-cap helmet one ant per engine gets to wear. */
const ACORN = tones('#a26d36', 1.1)

interface AntOpts {
  /** 0 crawling flat, 1 standing up like a cartoon ant. */
  lean?: number
  /** Walk phase, 0..1; omitted, the ant stands still. */
  step?: number
  /** Where the front pair of legs hold on — a pencil, a key, a bow. */
  grab?: Pt
  helmet?: boolean
  /** Clock for the antenna twitch. */
  t: number
  seed: number
}

/** One glossy body segment: a dark edge, the chitin, a lit side, a sheen. */
const chitin = (
  ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number,
  ang: number, ow: number
): void => {
  const shape = oval(cx, cy, rx, ry, ang, 16)
  fillShape(ctx, shrink(shape, 1 + ow / ((rx + ry) / 2), cx, cy), ANT_INK)
  fillShape(ctx, shape, ANT_BODY)
  fillShape(ctx, oval(cx - rx * 0.18, cy - ry * 0.28, rx * 0.62, ry * 0.5, ang, 12), ANT_LIT)
  fillShape(ctx, oval(cx - rx * 0.3, cy - ry * 0.48, rx * 0.26, ry * 0.15, ang - 0.3, 10), ANT_GLOSS)
}

/**
 * A little black ant, facing +X, standing on `(x, y)`.
 *
 * Drawn with plain fills rather than `paint` because crew ride on the LIVE
 * layers: an ant is a dozen cheap fills and strokes, never a clip. Big head,
 * narrow waist, elbowed antennae, six legs with their knees up — the four
 * things that make an ant an ant in silhouette — and one white eye so it reads
 * as a character rather than a speck.
 *
 * Animation only MOVES parts: lean rotates the body, the walk moves the feet,
 * the antennae twitch at their joints. No contour depends on time.
 */
const ant = (
  ctx: CanvasRenderingContext2D, x: number, y: number, sz: number, o: AntOpts
): void => {
  const lean = o.lean ?? 0
  const A = -lean * 1.1
  const cA = Math.cos(A)
  const sA = Math.sin(A)
  const Ag = A * 0.4
  const wx = x
  const wy = y - (0.4 + lean * 0.3) * sz
  const B = (u: number, v: number): Pt => [wx + (u * cA - v * sA) * sz, wy + (u * sA + v * cA) * sz]
  const G = (u: number, v: number): Pt => [
    wx + (u * Math.cos(Ag) - v * Math.sin(Ag)) * sz,
    wy + (u * Math.sin(Ag) + v * Math.cos(Ag)) * sz
  ]
  const ow = 0.08 * sz
  const legW = 0.08 * sz
  const arms = o.grab !== undefined || lean >= 0.5

  const roots: Pt[] = [B(0.46, 0.1), B(0.32, 0.13), B(0.18, 0.1)]
  const rest = lean < 0.5
    ? [x + 0.74 * sz, x + 0.26 * sz, x - 0.34 * sz]
    : [x + 0.4 * sz, x + 0.2 * sz, x - 0.3 * sz]

  const leg = (i: number, far: boolean): void => {
    const root = roots[i]!
    let foot: Pt
    let knee: Pt
    if (i === 0 && arms) {
      const g: Pt = o.grab ?? B(0.95, 0.55)
      foot = far ? [g[0] - 0.05 * sz, g[1] + 0.04 * sz] : g
      knee = [(root[0] + foot[0]) / 2, Math.max(root[1], foot[1]) + 0.16 * sz]
    } else {
      let fx = rest[i]! - (far ? 0.08 * sz : 0)
      let fy = y
      if (o.step !== undefined) {
        const st = footStep(o.step + (((i % 2 === 0) !== far) ? 0 : 0.5), 0.3 * sz, 0.14 * sz)
        fx += st[0]
        fy += st[1]
      }
      foot = [fx, fy]
      knee = [root[0] + (foot[0] - root[0]) * 0.55, Math.min(root[1], foot[1]) - 0.15 * sz]
    }
    stroke(ctx, [root, knee, foot], legW * 1.15, legW * 0.6, far ? ANT_INK : ANT_LEG, o.seed + i)
  }

  for (let i = 0; i < 3; i++) leg(i, true)

  // Gaster, waist node, thorax.
  const g = G(-0.44, 0.06)
  chitin(ctx, g[0], g[1], 0.42 * sz, 0.32 * sz, Ag, ow)
  const pet = B(0.02, 0.03)
  fillShape(ctx, oval(pet[0], pet[1], 0.09 * sz, 0.08 * sz), ANT_INK)
  const th = B(0.3, 0)
  chitin(ctx, th[0], th[1], 0.27 * sz, 0.17 * sz, A, ow)

  // Head, and the antennae growing out of it.
  const h = B(0.8, -0.06)
  const hx = h[0]
  const hy = h[1]
  const tw = Math.sin(o.t / 170 + o.seed * 1.7) * 0.06 * sz
  const tw2 = Math.sin(o.t / 230 + o.seed * 2.3) * 0.06 * sz
  const antenna = (dx: number, dy: number, wig: number, col: string, sd: number): void => {
    const base: Pt = [hx + (0.06 + dx) * sz, hy - (0.24 - dy) * sz]
    const elbow: Pt = [hx + (0.02 + dx) * sz + wig * 0.3, hy - (0.62 - dy) * sz]
    const tip: Pt = [hx + (0.4 + dx) * sz + wig, hy - (0.78 - dy) * sz + wig * 0.5]
    stroke(ctx, [base, elbow], 0.07 * sz, 0.06 * sz, col, sd)
    stroke(ctx, [elbow, tip], 0.06 * sz, 0.05 * sz, col, sd + 1)
    fillShape(ctx, oval(tip[0], tip[1], 0.05 * sz, 0.05 * sz, 0, 8), col)
  }
  antenna(-0.1, 0.03, tw2, ANT_INK, o.seed + 30)
  chitin(ctx, hx, hy, 0.31 * sz, 0.29 * sz, 0, ow)

  // One big eye, looking where it is going.
  fillShape(ctx, oval(hx + 0.1 * sz, hy - 0.01 * sz, 0.12 * sz, 0.14 * sz, 0, 10), '#fffaf0')
  fillShape(ctx, oval(hx + 0.15 * sz, hy + 0.01 * sz, 0.065 * sz, 0.085 * sz, 0, 8), '#140e12')
  // Mandible.
  stroke(ctx, [[hx + 0.24 * sz, hy + 0.12 * sz], [hx + 0.38 * sz, hy + 0.2 * sz], [hx + 0.3 * sz, hy + 0.28 * sz]],
    0.07 * sz, 0.04 * sz, ANT_INK, o.seed + 40)

  if (o.helmet) {
    // Acorn cap: a scaly dome sitting back on the head, and a stalk on top.
    const cap: Pt[] = []
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI + (i / 8) * Math.PI
      cap.push([hx - 0.05 * sz + Math.cos(a) * 0.37 * sz, hy - 0.1 * sz + Math.sin(a) * 0.32 * sz])
    }
    cap.push([hx + 0.3 * sz, hy - 0.04 * sz], [hx - 0.4 * sz, hy - 0.02 * sz])
    fillShape(ctx, shrink(cap, 1.14, hx - 0.05 * sz, hy - 0.2 * sz), ANT_INK)
    fillShape(ctx, cap, ACORN.base)
    fillShape(ctx, oval(hx - 0.14 * sz, hy - 0.26 * sz, 0.16 * sz, 0.09 * sz, -0.2, 10), ACORN.lit)
    for (const k of [-0.22, 0, 0.2]) {
      stroke(ctx, [[hx + (k - 0.1) * sz, hy - 0.36 * sz], [hx + (k + 0.08) * sz, hy - 0.08 * sz]],
        0.035 * sz, 0.03 * sz, ACORN.deep, o.seed + 50)
    }
    stroke(ctx, [[hx - 0.38 * sz, hy - 0.05 * sz], [hx + 0.3 * sz, hy - 0.07 * sz]],
      0.07 * sz, 0.07 * sz, ACORN.shade, o.seed + 51)
    stroke(ctx, [[hx - 0.06 * sz, hy - 0.4 * sz], [hx - 0.1 * sz, hy - 0.54 * sz], [hx - 0.18 * sz, hy - 0.58 * sz]],
      0.07 * sz, 0.05 * sz, '#5b3a1c', o.seed + 52)
  }
  antenna(0, 0, tw, ANT_LEG, o.seed + 33)

  for (let i = 0; i < 3; i++) leg(i, false)
}

// ─── Small props ────────────────────────────────────────────────────────────

/** A rough garden pebble: never a circle, never twice the same. */
const blobStone = (x: number, y: number, r: number): Pt[] => [
  [x - r, y - r * 0.3], [x - r * 0.5, y - r], [x + r * 0.4, y - r * 0.9],
  [x + r, y - r * 0.1], [x + r * 0.6, y + r * 0.8], [x - r * 0.5, y + r]
]

/** A pebble or a clod of packed sand, the ammunition of every thrower. */
const ammo = (
  ctx: CanvasRenderingContext2D, S: number, x: number, y: number, r: number,
  clod: boolean, seed: number
): void => {
  paint(ctx, S, rough(blobStone(x, y, r), r * 0.14, seed),
    clod ? CLOD : PEBBLE, seed + 1, { line: LINE.fine, amp: 0.16 })
  if (clod) {
    // Grains on the clod: what separates damp sand from a brown rock.
    for (let i = 0; i < 3; i++) {
      const a = seed * 1.3 + i * 2.1
      fillShape(ctx, oval(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.4, r * 0.1, r * 0.08, 0, 6), CLOD.deep)
    }
  }
}

/**
 * Foam darts from the player's blasters, stuck uselessly by their suction
 * cups — a unit's story, told without a tooltip. Each spot is the cup's
 * position and the direction the shaft sticks OUT.
 */
const stuckDarts = (
  ctx: CanvasRenderingContext2D, S: number,
  spots: ReadonlyArray<readonly [number, number, number]>
): void => {
  for (const [ax, ay, aa] of spots) {
    const x0 = ax * S
    const y0 = ay * S
    const x1 = x0 + Math.cos(aa) * S * 0.22
    const y1 = y0 + Math.sin(aa) * S * 0.22
    stroke(ctx, [[x0, y0], [x1, y1]], S * 0.058, S * 0.058, INK, 41)
    stroke(ctx, [[x0, y0], [x1, y1]], S * 0.04, S * 0.04, DART_FOAM, 42)
    stroke(ctx, [
      [x0 + Math.cos(aa) * S * 0.05, y0 + Math.sin(aa) * S * 0.05],
      [x1 - Math.cos(aa) * S * 0.02, y1 - Math.sin(aa) * S * 0.02]
    ], S * 0.01, S * 0.01, 'rgba(255,255,255,0.5)', 43)
    const cup = oval(x0, y0, S * 0.028, S * 0.044, aa, 10)
    fillShape(ctx, shrink(cup, 1.35, x0, y0), INK)
    fillShape(ctx, cup, DART_CUP)
  }
}

/** A paper pennant on a toothpick, fluttering on its own clock. */
const pennant = (
  ctx: CanvasRenderingContext2D, S: number, x: number, y0: number, y1: number,
  color: string, t: number, seed: number
): void => {
  stroke(ctx, [[x, y0], [x, y1]], S * 0.024, S * 0.018, INK, seed)
  stroke(ctx, [[x, y0], [x, y1]], S * 0.014, S * 0.01, '#f3dcae', seed + 1)
  const w = Math.sin(t / 240 + seed) * 0.03 * S
  paint(ctx, S, [
    [x, y1 + 0.01 * S], [x + 0.2 * S + w, y1 + 0.05 * S + w * 0.4], [x, y1 + 0.12 * S]
  ], tones(color, 1.05), seed + 2, { line: LINE.hair, amp: 0.08, deep: false })
}

// ─── Rubber-Band Crossbow (ballista) ────────────────────────────────────────

/**
 * How far the band is back, and how hard the machine is still kicking.
 *
 * `cycle` is this crossbow's OWN reload: 0 the frame the toothpick left, 1 the
 * frame the next one does. The shape of the curve is the snap:
 *
 *   0.00–0.10  RECOIL. Band forward, toothpick gone, whole engine kicked back.
 *   0.10–0.70  the crew wind it back.
 *   0.70–1.00  HELD at full draw, loaded and still.
 *
 * Holding the last third is what makes the release read as sudden: the eye has
 * time to settle on a tense, motionless machine, and then it is simply gone.
 */
const ballistaAction = (engaged: boolean, cycle: number): { draw: number; recoil: number } => {
  if (!engaged) return { draw: 0.15, recoil: 0 }
  const c = ((cycle % 1) + 1) % 1
  if (c < 0.1) return { draw: 0, recoil: 1 - c / 0.1 }
  if (c < 0.7) {
    const k = (c - 0.1) / 0.6
    // Ease out: the first turns of the key move the band furthest.
    return { draw: 1 - (1 - k) * (1 - k), recoil: 0 }
  }
  return { draw: 1, recoil: 0 }
}

const drawBallistaFrame = (
  ctx: CanvasRenderingContext2D, S: number, m: SiegeParts, spin: number
): void => {
  // Two bottle caps under a real carriage — the mass has to be visibly carried.
  capWheel(ctx, S, -0.34 * S, GROUND * S - 0.14 * S, 0.14 * S, spin, m.toy, 58)
  capWheel(ctx, S, 0.26 * S, GROUND * S - 0.14 * S, 0.14 * S, spin, m.toy, 60)

  // Carriage bed.
  stick(ctx, S, [-0.52 * S, 0.28 * S], [0.48 * S, 0.28 * S], 0.1 * S, STICK, 61, 2)
  // Trail stick down to a thumbtack in the sand, so the recoil has somewhere
  // to go. A crossbow that is not braced is a toy on wheels.
  stick(ctx, S, [-0.46 * S, 0.28 * S], [-0.72 * S, GROUND * S - 0.02 * S], 0.06 * S, STICK_BACK, 63, 1)
  paint(ctx, S, oval(-0.72 * S, 0.44 * S, 0.06 * S, 0.035 * S, -0.3, 14),
    tones(m.accent, 1.1), 62, { line: LINE.hair, amp: 0.05, deep: false })

  // ── The stock: a tongue depressor with the toothpick groove along it ──
  stick(ctx, S, [-0.56 * S, 0.1 * S], [0.54 * S, 0.02 * S], 0.19 * S, STICK, 64, 3)
  stroke(ctx, [[-0.46 * S, 0.02 * S], [0.48 * S, -0.05 * S]],
    0.04 * S, 0.034 * S, STICK.deep, 65)
  // Standards tying the stock down to the bed.
  stick(ctx, S, [-0.34 * S, 0.14 * S], [-0.34 * S, 0.3 * S], 0.06 * S, STICK_BACK, 66, 0)
  stick(ctx, S, [0.3 * S, 0.1 * S], [0.3 * S, 0.3 * S], 0.06 * S, STICK_BACK, 67, 0)

  // ── Upright frame carrying the band wads ──
  stick(ctx, S, [0.14 * S, -0.42 * S], [0.18 * S, 0.16 * S], 0.08 * S, STICK, 68, 2)
  stick(ctx, S, [0.08 * S, -0.36 * S], [0.46 * S, -0.28 * S], 0.07 * S, STICK, 69, 2)

  drawBallistaRest(ctx, S, m)
}

/**
 * The parts that move: band wads, arms, the rubber-band string, the wind-up
 * key with the ant working it, and the toothpick in the groove.
 *
 * Painted LIVE over the cached frame, so every crossbow on the field animates
 * against its own reload rather than in unison.
 */
const drawBallistaArm = (
  ctx: CanvasRenderingContext2D, S: number, m: SiegeParts,
  engaged: boolean, cycle: number, t: number
): void => {
  const { draw, recoil } = ballistaAction(engaged, cycle)
  const bands = [m.accent, mix(m.accent, '#ffffff', 0.35)]

  ctx.save()
  // The whole assembly rides back on the shot and settles against the trail.
  ctx.translate(-recoil * 0.05 * S, 0)

  // FAR wad and arm, a tone down and set back.
  bandWad(ctx, S, 0.17 * S, -0.2 * S, 0.13 * S, bands, 70)
  const farAng = -0.62 + draw * 0.55
  const farTip: Pt = [
    0.17 * S + Math.cos(farAng) * 0.5 * S,
    -0.3 * S + Math.sin(farAng) * 0.5 * S
  ]
  stick(ctx, S, [0.17 * S, -0.3 * S], farTip, 0.07 * S, STICK_BACK, 72, 1)

  // NEAR wad and arm.
  bandWad(ctx, S, 0.24 * S, -0.02 * S, 0.14 * S, bands, 74)
  const nearAng = 0.55 - draw * 0.55
  const armTip: Pt = [
    0.24 * S + Math.cos(nearAng) * 0.54 * S,
    -0.02 * S + Math.sin(nearAng) * 0.54 * S
  ]
  stick(ctx, S, [0.24 * S, 0.0 * S], armTip, 0.08 * S, STICK, 76, 1)

  // ── The string: one fat rubber band, pulled back to the nock ──
  const nockX = (0.34 - draw * 0.55) * S
  band(ctx, [farTip, [nockX, -0.05 * S], armTip], 0.026 * S, m.accent, 80)

  // ── Wind-up key on the tail of the stock ──
  //
  // It turns only through the WINDING phase. A key still spinning while the
  // machine sits at full draw says the crew are working when the shot is
  // already loaded, and it is the small motion that gives the pause away.
  const winding = engaged && draw > 0.01 && draw < 0.995
  const crank = winding ? -draw * 26 : 0.9
  const kx = -0.46 * S
  const ky = 0.06 * S
  stroke(ctx, [[kx, ky], [kx - 0.02 * S, ky - 0.02 * S]], 0.05 * S, 0.05 * S, BRASS.deep, 84)
  const lobe = (k: number): Pt => [kx + Math.cos(crank) * 0.075 * S * k, ky + Math.sin(crank) * 0.075 * S * k]
  stroke(ctx, [lobe(-1), lobe(1)], 0.05 * S, 0.05 * S, INK, 85)
  stroke(ctx, [lobe(-1), lobe(1)], 0.032 * S, 0.032 * S, BRASS.base, 86)
  for (const k of [-1, 1]) {
    const c = lobe(k)
    flat(ctx, S, oval(c[0], c[1], 0.055 * S, 0.055 * S, 0, 12), BRASS.base, 87 + k, LINE.hair)
    fillShape(ctx, oval(c[0], c[1], 0.022 * S, 0.022 * S, 0, 8), BRASS.deep)
  }
  // The winder stands on the tail and hangs onto whichever lobe is nearer.
  const near = lobe(1)[0] < lobe(-1)[0] ? lobe(1) : lobe(-1)
  ant(ctx, -0.66 * S, -0.005 * S, 0.1 * S, {
    lean: 0.62, grab: near, t, seed: 88
  })

  // ── The toothpick in the groove ──
  //
  // Absent through the recoil: it is in the air. A crossbow that still has its
  // toothpick the instant after loosing is the clearest possible tell that
  // nothing was actually fired.
  if (recoil > 0.02) { ctx.restore(); return }
  const bx = nockX
  const pick: Pt[] = hard([
    [bx, -0.075 * S], [bx + 0.58 * S, -0.075 * S], [bx + 0.76 * S, -0.05 * S],
    [bx + 0.58 * S, -0.025 * S], [bx, -0.025 * S]
  ], 0.06)
  paint(ctx, S, pick, SHAVED, 82, { line: LINE.hair, amp: 0.04, deep: false })
  // Paper flight at the tail.
  for (const f of [-1, 1]) {
    fillShape(ctx, [
      [bx + 0.02 * S, -0.05 * S],
      [bx + 0.12 * S, -0.05 * S + f * 0.06 * S],
      [bx + 0.17 * S, -0.05 * S]
    ], m.accent2)
    ink(ctx, [
      [bx + 0.02 * S, -0.05 * S],
      [bx + 0.12 * S, -0.05 * S + f * 0.06 * S],
      [bx + 0.17 * S, -0.05 * S]
    ], { width: 0.01 * S, color: INK, seed: 83 + f, breakUp: 0.2 })
  }

  ctx.restore()
}

/** Frame parts drawn after the stock: cardboard shield, toothpick rack, eraser wedge. */
const drawBallistaRest = (
  ctx: CanvasRenderingContext2D, S: number, m: SiegeParts
): void => {
  // ── Cardboard shield ──
  //
  // The board the crew hide behind, taped across the front with a slot for the
  // toothpick. It gives the silhouette a solid vertical to hang off instead of
  // a lattice of sticks, and it explains at a glance why the machine can sit in
  // the open under fire.
  const shield = slab([
    [0.36 * S, -0.4 * S], [0.42 * S, -0.44 * S], [0.46 * S, -0.39 * S], [0.5 * S, -0.37 * S],
    [0.52 * S, 0.12 * S], [0.38 * S, 0.18 * S]
  ], 0.012 * S, 88)
  paint(ctx, S, shield, CARD, 89, { line: LINE.major, amp: 0.06 })
  // Flutes showing through the paper, and the torn corrugated top edge.
  for (const px of [0.41, 0.455]) {
    stroke(ctx, [[px * S, -0.36 * S], [(px + 0.01) * S, 0.12 * S]],
      0.012 * S, 0.01 * S, CARD.shade, 90)
  }
  const wave: Pt[] = []
  for (let i = 0; i <= 6; i++) {
    const k = i / 6
    wave.push([(0.37 + k * 0.13) * S, (-0.38 + k * 0.02 + (i % 2 ? 0.015 : -0.01)) * S])
  }
  stroke(ctx, wave, 0.01 * S, 0.01 * S, CARD.deep, 91)
  // A strip of masking tape holding it on.
  paint(ctx, S, slab([
    [0.33 * S, -0.26 * S], [0.54 * S, -0.3 * S], [0.55 * S, -0.24 * S], [0.34 * S, -0.2 * S]
  ], 0.004 * S, 92), tones('#f3e2a6', 0.8), 93, { line: LINE.hair, amp: 0.05, deep: false })
  // The slot the toothpick flies through.
  fillShape(ctx, [
    [0.34 * S, -0.09 * S], [0.54 * S, -0.09 * S],
    [0.54 * S, -0.01 * S], [0.34 * S, -0.01 * S]
  ], '#2a1c14')

  // ── Spare toothpicks, standing in a bottle cap ──
  for (let i = 0; i < 3; i++) {
    const bx = (-0.24 + i * 0.06) * S
    stroke(ctx, [[bx, 0.22 * S], [bx + 0.05 * S, -0.16 * S]],
      0.03 * S, 0.012 * S, INK, 94 + i)
    stroke(ctx, [[bx, 0.22 * S], [bx + 0.05 * S, -0.15 * S]],
      0.018 * S, 0.006 * S, SHAVED.base, 97 + i)
  }
  paint(ctx, S, slab([
    [-0.3 * S, 0.12 * S], [-0.06 * S, 0.12 * S], [-0.08 * S, 0.23 * S], [-0.28 * S, 0.23 * S]
  ], 0.006 * S, 100), m.toy, 101, { line: LINE.fine, amp: 0.05, hatch: false })
  for (let i = 0; i < 5; i++) {
    const cx = (-0.27 + i * 0.045) * S
    stroke(ctx, [[cx, 0.13 * S], [cx, 0.22 * S]], 0.012 * S, 0.012 * S, m.toy.deep, 102)
  }

  // ── Eraser wedge ──
  //
  // The pink wedge the stock rests on — how the thing is aimed. Without it the
  // machine has no way to be elevated, which the eye notices even when it
  // cannot name what is missing.
  paint(ctx, S, slab([
    [-0.14 * S, 0.23 * S], [0.08 * S, 0.23 * S], [0.08 * S, 0.1 * S]
  ], 0.006 * S, 95), ERASER, 96, { line: LINE.fine, amp: 0.05 })
}

// ─── Spoon Catapult ─────────────────────────────────────────────────────────
//
// A plastic spoon sprung out of a wad of rubber bands, authored facing +X like
// everything else. The mechanism is the old onager's, because it is the one
// that reads: the spoon is winched DOWN AND BACK until the bowl is low over the
// tail, then the bands snap it up, over and FORWARD into a sponge buffer at the
// front, which stops it dead and lets the pebble go toward the target. That is
// a 165° sweep that passes straight through the vertical, and a machine doing
// it cannot be mistaken about which way it is pointed.

/** Spring centre — the pivot the spoon is sprung out of. Low, and at the BACK. */
const CAT_PIVOT: Pt = [-0.22, 0.04]
/** Spoon length, pivot to bowl. */
const CAT_ARM = 0.72

// Arm angle from +x, canvas convention (y DOWN):
//   0 forward · π/2 straight down · π backward · 3π/2 (or -π/2) straight up.
/** Winched back, bowl held out low over the tail. */
const CAT_COCKED = 2.95
/**
 * Hard against the buffer, arm up and forward. This is where the pebble goes.
 *
 * Expressed as `-0.33 + 2π` rather than as `-0.33`, and that is load-bearing:
 * the number decides which WAY round the arm travels. Sweeping UP from 2.95 to
 * 5.95 passes through 3π/2 — straight up — which is the arc a catapult makes;
 * sweeping down would drag the bowl through the sand on every shot.
 */
const CAT_STOP = 5.95

// Cycle landmarks. `cycle` is 0 the instant the pebble leaves and 1 at the next
// shot, so the throw lives at the END of the window and the release lands on
// the frame the simulation spawns the round.
const CAT_RECOIL_END = 0.14
const CAT_HOLD_START = 0.82
const CAT_THROW_START = 0.93

/** Arm angle at a point in the shot cycle. */
const catapultArm = (c: number): number => {
  if (c < CAT_RECOIL_END) {
    // Slammed into the sponge and shuddering there.
    const u = c / CAT_RECOIL_END
    return CAT_STOP - Math.exp(-u * 4) * Math.sin(u * 15) * 0.16
  }
  if (c < CAT_HOLD_START) {
    // The crew on the spool, hauling the spoon back down against the bands.
    // Deliberately the long phase: an engine that spends its time between
    // shots visibly reloading is one the player can time a sortie against.
    const u = (c - CAT_RECOIL_END) / (CAT_HOLD_START - CAT_RECOIL_END)
    return CAT_STOP + (CAT_COCKED - CAT_STOP) * (u * u * (3 - 2 * u))
  }
  if (c < CAT_THROW_START) {
    // Loaded, held on the trigger, creaking against the bands.
    return CAT_COCKED + Math.sin(c * 90) * 0.006
  }
  // The release. Ease-OUT: a sprung arm is at maximum force the instant it is
  // let go and decelerates into the buffer.
  const u = (c - CAT_THROW_START) / (1 - CAT_THROW_START)
  return CAT_COCKED + (CAT_STOP - CAT_COCKED) * (1 - Math.pow(1 - u, 2.2))
}

/** A cotton-reel spool: two wooden flanges and a drum of coloured thread. */
const spool = (
  ctx: CanvasRenderingContext2D, S: number,
  x0: number, y0: number, x1: number, y1: number, thread: string, seed: number
): void => {
  const w = x1 - x0
  const h = y1 - y0
  paint(ctx, S, slab([
    [x0 + w * 0.12, y0 + h * 0.14], [x1 - w * 0.12, y0 + h * 0.14],
    [x1 - w * 0.12, y1 - h * 0.14], [x0 + w * 0.12, y1 - h * 0.14]
  ], 0.004 * S, seed), tones(thread, 1.1), seed + 1, { line: LINE.fine, amp: 0.05 })
  for (let i = 0; i < 4; i++) {
    const yy = y0 + h * (0.22 + i * 0.19)
    stroke(ctx, [[x0 + w * 0.14, yy], [x1 - w * 0.14, yy + h * 0.04]],
      h * 0.03, h * 0.03, tones(thread).deep, seed + 2 + i)
  }
  for (const fx of [x0, x1 - w * 0.16]) {
    paint(ctx, S, slab([
      [fx, y0], [fx + w * 0.16, y0], [fx + w * 0.16, y1], [fx, y1]
    ], 0.004 * S, seed + 7), STICK_BACK, seed + 8, { line: LINE.fine, amp: 0.05 })
  }
}

/**
 * The parts of the catapult that never move — what gets baked into the shared
 * sprite cache. The spoon is drawn live on top, per machine, against its own
 * reload.
 */
const drawCatapultFrame = (
  ctx: CanvasRenderingContext2D, S: number, m: SiegeParts, spin: number, t: number
): void => {
  const capT = tones(m.accent, 1.05)
  capWheel(ctx, S, -0.34 * S, GROUND * S - 0.14 * S, 0.14 * S, spin, capT, 100)
  capWheel(ctx, S, 0.32 * S, GROUND * S - 0.14 * S, 0.14 * S, spin, capT, 101)

  // ── Frame: a stack of popsicle sticks, not a lattice ──
  stick(ctx, S, [-0.56 * S, 0.37 * S], [0.52 * S, 0.37 * S], 0.08 * S, STICK_BACK, 99, 1)
  stick(ctx, S, [-0.58 * S, 0.3 * S], [0.54 * S, 0.3 * S], 0.09 * S, STICK, 102, 2)
  stick(ctx, S, [-0.44 * S, 0.28 * S], [-0.24 * S, -0.04 * S], 0.09 * S, STICK_BACK, 103, 1)
  stick(ctx, S, [0.44 * S, 0.28 * S], [0.2 * S, -0.3 * S], 0.09 * S, STICK, 104, 2)
  // Collar tie — the stick that stops the frame splaying.
  stick(ctx, S, [-0.24 * S, -0.02 * S], [0.2 * S, -0.16 * S], 0.07 * S, STICK_BACK, 105, 1)

  // ── The spring: a big wad of rubber bands, low and at the back ──
  bandWad(ctx, S, CAT_PIVOT[0] * S, CAT_PIVOT[1] * S, 0.16 * S,
    [m.accent, mix(m.accent, '#ff8a2b', 0.4)], 112)

  // ── Buffer: a kitchen sponge ──
  //
  // The pad the spoon slams into — it is what stops the arm and converts the
  // stop into a throw. Placed against the arm's stop pose rather than by eye:
  // at `CAT_STOP` the spoon runs from the spring out to (0.46, -0.20), so the
  // sponge's underside has to lie along that line or the spoon visibly stops
  // in mid-air short of the thing that is supposed to be stopping it.
  stick(ctx, S, [0.13 * S, -0.17 * S], [0.42 * S, -0.27 * S], 0.08 * S, STICK_BACK, 114, 1)
  const sponge = rough(hard([
    [0.1 * S, -0.3 * S], [0.39 * S, -0.4 * S],
    [0.44 * S, -0.23 * S], [0.15 * S, -0.13 * S]
  ], 0.12), 0.008 * S, 116)
  paint(ctx, S, sponge, tones('#ffd23f', 1.0), 117, { line: LINE.mid, amp: 0.1, hatch: false })
  // The green scourer on top, and the sponge's pores.
  paint(ctx, S, rough(hard([
    [0.09 * S, -0.335 * S], [0.38 * S, -0.435 * S], [0.395 * S, -0.39 * S], [0.105 * S, -0.29 * S]
  ], 0.15), 0.004 * S, 118), tones('#3fa84a', 1.0), 119, { line: LINE.fine, amp: 0.1, deep: false, hatch: false })
  for (let i = 0; i < 9; i++) {
    const k = ((i * 0.37) % 1) * 0.8 + 0.1
    const d = ((i * 0.61) % 1) * 0.7 + 0.15
    fillShape(ctx, oval(
      (0.12 + k * 0.28 + d * 0.03) * S, (-0.27 - k * 0.1 + d * 0.13) * S, 0.014 * S, 0.01 * S, 0, 8
    ), '#d7a21c')
  }
  for (const k of [0.2, 0.34]) {
    band(ctx, [[k * S, (-0.16 - (k - 0.13) * 0.34) * S], [(k + 0.012) * S, (-0.1 - (k - 0.13) * 0.34) * S]], 0.014 * S, m.accent, 120)
  }

  // ── Spool at the tail: how the spoon gets hauled back down ──
  spool(ctx, S, -0.58 * S, 0.06 * S, -0.36 * S, 0.24 * S, m.accent, 121)

  // ── Ammunition: pebbles and sand clods on the deck ──
  ammo(ctx, S, -0.02 * S, 0.21 * S, 0.06 * S, false, 124)
  ammo(ctx, S, 0.1 * S, 0.22 * S, 0.05 * S, true, 126)
  ammo(ctx, S, 0.04 * S, 0.13 * S, 0.05 * S, false, 128)

  // ── A loader, holding the next pebble up, waiting its turn ──
  const bob = Math.sin(t / 300) * 0.008 * S
  ant(ctx, 0.2 * S, 0.26 * S, 0.09 * S, {
    lean: 1, grab: [0.27 * S, 0.02 * S + bob], t, seed: 130, helmet: true
  })
  ammo(ctx, S, 0.27 * S, -0.01 * S + bob, 0.045 * S, false, 132)
}

/**
 * The throwing assembly: spoon, pebble, and the string hauling it down.
 *
 * Drawn live rather than baked, because this is the part that has to agree with
 * the simulation. `cycle` is the machine's own progress toward its next shot.
 *
 * `flaming` is the late-game round: past the wave where catapults switch to
 * burning shot, the thing in the spoon is already alight while the crew are
 * still winching, which is the only warning the player gets.
 */
const drawCatapultArm = (
  ctx: CanvasRenderingContext2D, S: number, m: SiegeParts,
  engaged: boolean, cycle: number, flaming: boolean
): void => {
  // A machine still rolling up carries the spoon winched down and lashed.
  const c = engaged ? Math.min(0.999, Math.max(0, cycle)) : 0.86
  const phi = catapultArm(c)
  const cs = Math.cos(phi)
  const sn = Math.sin(phi)
  const px = CAT_PIVOT[0] * S
  const py = CAT_PIVOT[1] * S
  /** A point on the spoon, `u` along it and `v` to its cupped side. */
  const R = (u: number, v: number): Pt => [px + (u * cs - v * sn) * S, py + (u * sn + v * cs) * S]

  // The winch string, from the spool to wherever the spoon currently is.
  const armMid = R(CAT_ARM * 0.55, 0)
  const hauling = c >= CAT_RECOIL_END && c < CAT_THROW_START
  twine(ctx, [
    [-0.47 * S, 0.12 * S],
    [(-0.47 * S + armMid[0]) / 2, (0.12 * S + armMid[1]) / 2 + (hauling ? 0.01 : 0.09) * S],
    armMid
  ], 0.014 * S, 123)

  // ── The spoon ──
  const spoonT = m.toy
  const handle: Pt[] = [
    R(-0.04, -0.035), R(CAT_ARM - 0.16, -0.028), R(CAT_ARM - 0.1, -0.05),
    R(CAT_ARM - 0.1, 0.07), R(CAT_ARM - 0.16, 0.028), R(-0.04, 0.035)
  ]
  paint(ctx, S, handle, spoonT, 106, { line: LINE.mid, amp: 0.05, deep: false, hatch: false })
  stroke(ctx, [R(0.02, -0.012), R(CAT_ARM - 0.2, -0.012)], 0.012 * S, 0.01 * S, 'rgba(255,255,255,0.6)', 107)
  // Bowl: an oval cupped on the side the pebble rides, with the hollow inside.
  const bc = R(CAT_ARM, 0.03)
  const bowl = oval(bc[0], bc[1], 0.14 * S, 0.1 * S, phi, 20)
  paint(ctx, S, bowl, spoonT, 108, { line: LINE.mid, amp: 0.05, deep: false, hatch: false })
  const hollow = R(CAT_ARM + 0.01, 0.045)
  fillShape(ctx, oval(hollow[0], hollow[1], 0.1 * S, 0.064 * S, phi, 16), spoonT.shade)
  const sheen = R(CAT_ARM - 0.05, 0.0)
  fillShape(ctx, oval(sheen[0], sheen[1], 0.035 * S, 0.014 * S, phi, 8), 'rgba(255,255,255,0.7)')
  // Rubber band lashing where the handle meets the spring.
  const l0 = R(0.1, -0.05)
  const l1 = R(0.1, 0.05)
  band(ctx, [l0, l1], 0.02 * S, m.accent, 109)

  // ── The pebble ──
  //
  // In the spoon from the moment the crew load it until the frame it is
  // thrown, and NOT one frame longer: after release the pebble the player
  // should be watching is the round the simulation just spawned. Drawn OUTSIDE
  // the spoon's rotation so a flame stands up rather than lying along it.
  const loaded = engaged ? c >= CAT_HOLD_START - 0.06 : true
  if (!loaded) return
  const b = R(CAT_ARM + 0.02, 0.07)
  const bx = b[0]
  const by = b[1]
  if (flaming) {
    // A glowing ember of a round, already alight: three cuts of one fan, the
    // same shape burning fuel takes everywhere else.
    const fan: Pt[] = [
      [bx - 0.085 * S, by], [bx - 0.05 * S, by - 0.2 * S],
      [bx - 0.005 * S, by - 0.1 * S], [bx + 0.04 * S, by - 0.26 * S],
      [bx + 0.07 * S, by - 0.08 * S], [bx + 0.09 * S, by]
    ]
    fillShape(ctx, fan, '#7a2408')
    fillShape(ctx, shrink(fan, 0.66), '#e0621c')
    fillShape(ctx, shrink(fan, 0.34), '#ffc24a')
  }
  paint(ctx, S, rough(
    blobStone(bx, by, 0.08 * S), 0.012 * S, 110
  ), flaming ? tones('#8a5a3a', 1.15) : PEBBLE, 111, { line: LINE.fine, amp: 0.16 })
}

// ─── Pencil Ram (ram) ───────────────────────────────────────────────────────

/**
 * A die-cast toy car with a popsicle-stick gantry over it, and a pencil slung
 * from the gantry in two rubber bands.
 *
 * Split so the pencil can swing live over a baked car: the car and gantry are
 * `static`, and the pencil, its bands and the ant riding it are `moving`. The
 * pencil hangs clear of the car roof, so painting it last is always correct.
 */
const drawRam = (
  ctx: CanvasRenderingContext2D, S: number, m: SiegeParts,
  spin: number, striking: boolean, t: number, layer: 'all' | 'static' | 'moving' = 'all'
): void => {
  const swing = striking ? Math.sin(t / 220) * 0.15 * S : 0
  if (layer !== 'moving') drawRamCar(ctx, S, m, spin, t)
  if (layer === 'static') return

  // ── The pencil ──
  //
  // Slung LOW enough to be the loudest thing on the machine and running well
  // past the car's nose. The thing that does the damage has to be the thing
  // you see.
  const py = -0.2 * S
  for (const bx of [-0.26, 0.1]) {
    band(ctx, [[bx * S, -0.45 * S], [bx * S + swing * 0.9, py - 0.07 * S]], 0.018 * S, m.accent, 136)
  }
  pencil(ctx, S, [-0.46 * S + swing, py], [0.86 * S + swing, py], 0.15 * S, 138)
  // The near strand of each band, wrapped round the front of the pencil.
  for (const bx of [-0.26, 0.1]) {
    const x = bx * S + swing
    band(ctx, [[x - 0.01 * S, py - 0.085 * S], [x + 0.012 * S, py + 0.085 * S]], 0.018 * S, m.accent, 137)
  }
  // An ant in an acorn helmet rides the pencil in like a jouster.
  ant(ctx, -0.12 * S + swing, py - 0.07 * S, 0.085 * S, {
    lean: 0.35, grab: [0.0 * S + swing, py - 0.07 * S], helmet: true, t, seed: 139
  })
}

/** The car, the gantry and the driver — everything on the ram that is baked. */
const drawRamCar = (
  ctx: CanvasRenderingContext2D, S: number, m: SiegeParts, spin: number, t: number
): void => {
  // Gantry posts first, so their feet tuck in behind the body.
  stick(ctx, S, [-0.36 * S, 0.12 * S], [-0.3 * S, -0.5 * S], 0.07 * S, STICK_BACK, 133, 1)
  stick(ctx, S, [0.24 * S, 0.12 * S], [0.18 * S, -0.5 * S], 0.07 * S, STICK_BACK, 134, 1)

  // ── Car body ──
  const body = slab([
    [-0.6 * S, 0.33 * S], [-0.63 * S, 0.14 * S], [-0.55 * S, 0.06 * S], [-0.36 * S, 0.05 * S],
    [-0.28 * S, -0.08 * S], [-0.22 * S, -0.11 * S], [0.06 * S, -0.11 * S], [0.16 * S, 0.04 * S],
    [0.4 * S, 0.07 * S], [0.56 * S, 0.12 * S], [0.61 * S, 0.22 * S], [0.57 * S, 0.33 * S]
  ], 0.006 * S, 132)
  paint(ctx, S, body, m.toy, 135, { line: LINE.major, amp: 0.04, hatch: false })

  ctx.save()
  ctx.beginPath(); trace(ctx, body); ctx.clip()
  // Racing stripe down the flank.
  stroke(ctx, [[-0.64 * S, 0.17 * S], [0.62 * S, 0.17 * S]], 0.055 * S, 0.055 * S, m.accent, 140)
  stroke(ctx, [[-0.64 * S, 0.215 * S], [0.62 * S, 0.215 * S]], 0.014 * S, 0.014 * S, m.accent2, 141)
  // Wheel arches.
  for (const wx of [-0.34, 0.3]) {
    fillShape(ctx, oval(wx * S, 0.37 * S, 0.165 * S, 0.165 * S, 0, 20), '#2a1a1c')
  }
  ctx.restore()

  // Windows, glass with a gloss streak, and the driver's head behind them.
  const glass1: Pt[] = hard([
    [-0.27 * S, 0.02 * S], [-0.2 * S, -0.07 * S], [-0.07 * S, -0.07 * S], [-0.07 * S, 0.02 * S]
  ], 0.12)
  const glass2: Pt[] = hard([
    [-0.02 * S, -0.07 * S], [0.05 * S, -0.07 * S], [0.12 * S, 0.02 * S], [-0.02 * S, 0.02 * S]
  ], 0.12)
  fillShape(ctx, glass1, '#bfe3ec')
  fillShape(ctx, glass2, '#bfe3ec')
  // A little driver peering out, antennae bent against the roof.
  fillShape(ctx, oval(-0.13 * S, -0.01 * S, 0.045 * S, 0.042 * S, 0, 12), ANT_BODY)
  fillShape(ctx, oval(-0.11 * S, -0.02 * S, 0.016 * S, 0.019 * S, 0, 8), '#fffaf0')
  fillShape(ctx, oval(-0.105 * S, -0.018 * S, 0.009 * S, 0.012 * S, 0, 8), '#140e12')
  stroke(ctx, [[-0.12 * S, -0.045 * S], [-0.1 * S, -0.065 * S], [-0.06 * S, -0.06 * S]],
    0.008 * S, 0.006 * S, ANT_INK, 142)
  for (const g of [glass1, glass2]) {
    ink(ctx, g, { width: 0.014 * S, color: INK, seed: 143, breakUp: 0.2 })
  }
  stroke(ctx, [[-0.2 * S, 0.0 * S], [-0.15 * S, -0.06 * S]], 0.012 * S, 0.01 * S, 'rgba(255,255,255,0.8)', 144)
  stroke(ctx, [[0.02 * S, 0.0 * S], [0.05 * S, -0.05 * S]], 0.01 * S, 0.008 * S, 'rgba(255,255,255,0.8)', 145)

  // Die-cast gloss along the roof and bonnet, head- and tail-lights, bumpers.
  stroke(ctx, [[0.2 * S, 0.075 * S], [0.48 * S, 0.11 * S]], 0.018 * S, 0.012 * S, 'rgba(255,255,255,0.72)', 146)
  stroke(ctx, [[-0.2 * S, -0.095 * S], [0.02 * S, -0.095 * S]], 0.014 * S, 0.01 * S, 'rgba(255,255,255,0.72)', 147)
  fillShape(ctx, oval(0.57 * S, 0.16 * S, 0.03 * S, 0.025 * S, 0, 10), '#fff2a8')
  fillShape(ctx, oval(-0.61 * S, 0.17 * S, 0.02 * S, 0.028 * S, 0, 10), '#8f1d17')
  paint(ctx, S, capsule([0.5 * S, 0.3 * S], [0.64 * S, 0.28 * S], 0.04 * S), CHROME, 148,
    { line: LINE.hair, amp: 0.04, hatch: false, deep: false })
  paint(ctx, S, capsule([-0.66 * S, 0.29 * S], [-0.54 * S, 0.3 * S], 0.04 * S), CHROME, 149,
    { line: LINE.hair, amp: 0.04, hatch: false, deep: false })

  // Wheels, in their arches.
  toyWheel(ctx, S, -0.34 * S, GROUND * S - 0.13 * S, 0.13 * S, spin, 130)
  toyWheel(ctx, S, 0.3 * S, GROUND * S - 0.13 * S, 0.13 * S, spin, 131)

  // Gantry crossbar and a lookout on it with a paper flag.
  stick(ctx, S, [-0.4 * S, -0.48 * S], [0.28 * S, -0.5 * S], 0.075 * S, STICK, 150, 2)
  ant(ctx, -0.08 * S, -0.53 * S, 0.075 * S, { lean: 0.8, t, seed: 151 })
  pennant(ctx, S, -0.34 * S, -0.52 * S, -0.8 * S, m.accent, t, 152)

  stuckDarts(ctx, S, [[-0.5, 0.2, -2.7], [0.36, 0.1, -1.1]])
}

// ─── Tin-Can Ram (ironRam) ──────────────────────────────────────────────────

/**
 * A soup tin on its side, on a popsicle sled, with a dinner fork for a ram.
 *
 * Cold, bright, ridged metal: the only engine the player's darts cannot hurt,
 * and the tin has to say so before any tooltip does. Bands of specular along
 * its length (a lying cylinder's highlight runs WITH it), the pressed ridges
 * across it, rolled rims at both ends and darts stuck uselessly on it.
 */
const drawIronRam = (
  ctx: CanvasRenderingContext2D, S: number, m: SiegeParts,
  spin: number, striking: boolean, t: number, layer: 'all' | 'static' | 'moving' = 'all'
): void => {
  const hit = striking ? Math.sin(t / 200) * 0.14 * S : 0
  if (layer !== 'moving') {
    const capT = tones('#4a4f58', 1.2)
    capWheel(ctx, S, -0.34 * S, GROUND * S - 0.13 * S, 0.13 * S, spin, capT, 160)
    capWheel(ctx, S, 0.32 * S, GROUND * S - 0.13 * S, 0.13 * S, spin, capT, 161)
    stick(ctx, S, [-0.58 * S, 0.3 * S], [0.58 * S, 0.3 * S], 0.09 * S, STICK, 162, 2)
    drawTinCan(ctx, S, m, t)
  }
  if (layer === 'static') return

  // ── The fork ──
  //
  // It starts in the tin's dark mouth, which is what lets it ride the live
  // layer over a baked can: the handle slides out of the tin and back in, and
  // nothing behind it needs repainting.
  const hx = 0.62 * S + hit
  paint(ctx, S, hard([
    [0.47 * S, 0.065 * S], [hx + 0.01 * S, 0.075 * S],
    [hx + 0.01 * S, 0.135 * S], [0.47 * S, 0.145 * S]
  ], 0.1), STEEL, 164, { line: LINE.mid, amp: 0.04, hatch: false })
  const head: Pt[] = [[hx - 0.01 * S, 0.075 * S], [hx + 0.07 * S, 0.0 * S], [hx + 0.11 * S, -0.03 * S]]
  const tines = 4
  for (let k = 0; k < tines; k++) {
    const y0 = -0.03 + k * 0.07
    const y1 = y0 + 0.042
    head.push([hx + 0.34 * S, y0 * S], [hx + 0.35 * S, ((y0 + y1) / 2) * S], [hx + 0.34 * S, y1 * S])
    if (k < tines - 1) head.push([hx + 0.15 * S, (y1 + 0.014) * S])
  }
  head.push([hx + 0.11 * S, 0.24 * S], [hx + 0.07 * S, 0.21 * S], [hx - 0.01 * S, 0.135 * S])
  paint(ctx, S, hard(head, 0.08), STEEL, 166, { line: LINE.mid, amp: 0.04, hatch: false })
  stroke(ctx, [[0.5 * S, 0.09 * S], [hx + 0.08 * S, 0.02 * S], [hx + 0.3 * S, -0.015 * S]],
    0.014 * S, 0.01 * S, 'rgba(255,255,255,0.8)', 167)
}

/** The tin itself, split out so it can be baked with the sled. */
const drawTinCan = (
  ctx: CanvasRenderingContext2D, S: number, m: SiegeParts, t: number
): void => {
  const top = -0.46
  const bot = 0.26
  const mid = (top + bot) / 2
  const rad = (bot - top) / 2
  /** The open mouth of the tin, facing the target: an upright ellipse. */
  const mouthX = 0.44
  const can = hard([
    [-0.54 * S, top * S], [mouthX * S, top * S], [mouthX * S, bot * S], [-0.54 * S, bot * S]
  ], 0.05)
  paint(ctx, S, can, TIN, 169, { line: false, amp: 0.03, hatch: false, lit: false, deep: false })

  // The commander, head and shoulders out of a hatch punched in the top. Drawn
  // clipped ABOVE the tin, so the tin itself hides everything below the lip.
  ctx.save()
  ctx.beginPath()
  ctx.rect(-0.45 * S, -1.0 * S, 0.5 * S, (top + 1.0) * S)
  ctx.clip()
  ant(ctx, -0.24 * S, -0.36 * S, 0.12 * S, { lean: 1, helmet: true, t, seed: 172 })
  ctx.restore()

  ctx.save()
  ctx.beginPath(); trace(ctx, can); ctx.clip()
  // Pressed beads running round the tin — across it, seen from the side — in
  // two bands, with plain metal between them for the light to sit on.
  for (const x0 of [-0.46, 0.2]) {
    for (let i = 0; i < 3; i++) {
      const x = (x0 + i * 0.07) * S
      stroke(ctx, [[x, top * S], [x, bot * S]], 0.018 * S, 0.018 * S, TIN.shade, 170 + i)
      stroke(ctx, [[x + 0.02 * S, top * S], [x + 0.02 * S, bot * S]], 0.012 * S, 0.012 * S, TIN.lit, 190 + i)
    }
  }
  // A torn scrap of label: enough to say "soup", not enough to hide the metal.
  const label = rough([
    [-0.2 * S, top * S], [0.06 * S, top * S], [0.1 * S, -0.34 * S], [0.04 * S, -0.2 * S],
    [0.11 * S, -0.06 * S], [0.03 * S, 0.06 * S], [0.08 * S, bot * S], [-0.2 * S, bot * S]
  ], 0.008 * S, 173)
  fillShape(ctx, label, m.accent)
  fillShape(ctx, oval(-0.07 * S, -0.1 * S, 0.09 * S, 0.07 * S, 0, 16), m.accent2)
  fillShape(ctx, oval(-0.07 * S, -0.09 * S, 0.042 * S, 0.04 * S, 0, 12), '#e0442f')
  stroke(ctx, [[-0.07 * S, -0.13 * S], [-0.04 * S, -0.155 * S]], 0.02 * S, 0.01 * S, '#3f9a3c', 174)
  ink(ctx, label, { width: 0.012 * S, color: INK, seed: 175, breakUp: 0.4 })
  // Cylinder light: a hard specular band along the top, a softer one below it,
  // and the turned-away underside. It is the highlight RUNNING WITH the tin
  // that makes it a lying cylinder rather than a grey box.
  ctx.globalAlpha = 0.85
  fillShape(ctx, [[-0.6 * S, -0.37 * S], [0.6 * S, -0.37 * S], [0.6 * S, -0.31 * S], [-0.6 * S, -0.31 * S]], '#ffffff')
  ctx.globalAlpha = 0.3
  fillShape(ctx, [[-0.6 * S, -0.27 * S], [0.6 * S, -0.27 * S], [0.6 * S, -0.17 * S], [-0.6 * S, -0.17 * S]], '#ffffff')
  ctx.globalAlpha = 0.5
  fillShape(ctx, [[-0.6 * S, 0.1 * S], [0.6 * S, 0.1 * S], [0.6 * S, 0.3 * S], [-0.6 * S, 0.3 * S]], TIN.deep)
  ctx.globalAlpha = 1
  ctx.restore()
  ink(ctx, can, { width: LINE.major * S, color: INK, seed: 176, breakUp: 0.3 })

  // The hatch lip: a jagged tin edge round the commander's waist.
  const lip: Pt[] = []
  for (let i = 0; i <= 8; i++) {
    lip.push([(-0.36 + i * 0.03) * S, (top + (i % 2 ? -0.03 : 0.0)) * S])
  }
  stroke(ctx, lip, 0.04 * S, 0.04 * S, INK, 177)
  stroke(ctx, lip, 0.022 * S, 0.022 * S, TIN.lit, 178)

  // Rolled rim at the back.
  paint(ctx, S, hard([
    [-0.585 * S, (top - 0.03) * S], [-0.515 * S, (top - 0.03) * S],
    [-0.515 * S, (bot + 0.03) * S], [-0.585 * S, (bot + 0.03) * S]
  ], 0.2), TIN, 179, { line: LINE.mid, amp: 0.03, hatch: false, deep: false })
  stroke(ctx, [[-0.565 * S, (top - 0.01) * S], [-0.565 * S, (bot + 0.01) * S]],
    0.014 * S, 0.012 * S, 'rgba(255,255,255,0.85)', 180)

  // ── The mouth ──
  //
  // The round end is THE tin-can tell, so the front is turned a little toward
  // us: a bright rolled rim round a dark inside, with the inner wall catching
  // light on the far side. The fork comes out of it.
  const mouth = oval(mouthX * S, mid * S, 0.11 * S, (rad + 0.03) * S, 0, 28)
  paint(ctx, S, mouth, TIN, 183, { line: LINE.major, amp: 0.03, hatch: false, deep: false })
  fillShape(ctx, oval((mouthX + 0.01) * S, mid * S, 0.075 * S, rad * 0.93 * S, 0, 24), '#23262c')
  fillShape(ctx, oval((mouthX + 0.035) * S, (mid + 0.02) * S, 0.04 * S, rad * 0.8 * S, 0, 20), '#4d535d')
  stroke(ctx, [
    [(mouthX - 0.07) * S, (mid - 0.2) * S], [(mouthX - 0.09) * S, mid * S], [(mouthX - 0.07) * S, (mid + 0.2) * S]
  ], 0.016 * S, 0.012 * S, 'rgba(255,255,255,0.85)', 184)

  // The lid, cut round with a can opener and bent up off the top of the mouth
  // like a visor — serrated along the cut.
  const la = 0.75
  const hx = (mouthX + 0.01) * S
  const hy = (top + 0.01) * S
  const lcx = hx + Math.sin(la) * rad * S
  const lcy = hy - Math.cos(la) * rad * S
  const lid = oval(lcx, lcy, 0.085 * S, rad * S, la, 26)
  paint(ctx, S, lid, TIN, 181, { line: LINE.mid, amp: 0.04, hatch: false, deep: false })
  fillShape(ctx, oval(lcx - Math.cos(la) * 0.012 * S, lcy - Math.sin(la) * 0.012 * S, 0.05 * S, rad * 0.8 * S, la, 20), TIN.shade)
  for (let i = 0; i < 7; i++) {
    const u = -0.8 + (i / 6) * 1.6
    const px = lcx + Math.sin(la) * u * rad * S + Math.cos(la) * 0.085 * S
    const py = lcy - Math.cos(la) * u * rad * S + Math.sin(la) * 0.085 * S
    fillShape(ctx, [
      [px - Math.sin(la) * 0.02 * S, py + Math.cos(la) * 0.02 * S],
      [px + Math.cos(la) * 0.03 * S, py + Math.sin(la) * 0.03 * S],
      [px + Math.sin(la) * 0.02 * S, py - Math.cos(la) * 0.02 * S]
    ], TIN.deep)
  }

  stuckDarts(ctx, S, [[-0.42, -0.08, -2.5], [0.16, top, -1.3], [-0.3, 0.18, 2.3]])
}

// ─── Juice-Box Tower (siegeTower) ───────────────────────────────────────────

/** A juice box on button wheels: the only engine that puts bugs ON the wall. */
const drawSiegeTower = (
  ctx: CanvasRenderingContext2D, S: number, m: SiegeParts,
  spin: number, docked: boolean, t: number, layer: 'all' | 'static' | 'moving' = 'all'
): void => {
  if (layer === 'moving') { drawSiegeTowerTop(ctx, S, m, docked, t); return }

  // The carton: a narrow side panel in shadow, then the printed front.
  const side = slab([
    [-0.42 * S, 0.42 * S], [-0.4 * S, -0.95 * S], [-0.28 * S, -0.95 * S], [-0.28 * S, 0.42 * S]
  ], 0.006 * S, 192)
  paint(ctx, S, side, m.toyBack, 193, { line: LINE.fine, amp: 0.05, hatch: false, deep: false, breakUp: 0.1 })
  const front = slab([
    [-0.28 * S, 0.42 * S], [-0.28 * S, -0.95 * S], [0.38 * S, -0.95 * S], [0.4 * S, 0.42 * S]
  ], 0.006 * S, 194)
  paint(ctx, S, front, m.toy, 195, { line: LINE.major, amp: 0.05, hatch: false })

  ctx.save()
  ctx.beginPath(); trace(ctx, front); ctx.clip()
  // White top band, and a wave of green along the foot.
  fillShape(ctx, rough([
    [-0.32 * S, -1.0 * S], [0.44 * S, -1.0 * S], [0.44 * S, -0.66 * S],
    [0.2 * S, -0.7 * S], [0.0 * S, -0.63 * S], [-0.18 * S, -0.69 * S], [-0.32 * S, -0.66 * S]
  ], 0.006 * S, 196), '#fff6e4')
  fillShape(ctx, rough([
    [-0.32 * S, 0.24 * S], [-0.1 * S, 0.18 * S], [0.14 * S, 0.25 * S], [0.44 * S, 0.19 * S],
    [0.44 * S, 0.46 * S], [-0.32 * S, 0.46 * S]
  ], 0.006 * S, 197), '#43b649')
  // The fruit: an orange slice, pips and all, with a leaf.
  const fx = 0.04 * S
  const fy = -0.24 * S
  fillShape(ctx, oval(fx, fy, 0.25 * S, 0.25 * S, 0, 28), '#fff6e4')
  fillShape(ctx, oval(fx, fy, 0.215 * S, 0.215 * S, 0, 28), '#ffb13b')
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + 0.2
    stroke(ctx, [[fx, fy], [fx + Math.cos(a) * 0.2 * S, fy + Math.sin(a) * 0.2 * S]],
      0.02 * S, 0.012 * S, '#fff1c8', 198 + i)
  }
  fillShape(ctx, oval(fx, fy, 0.035 * S, 0.035 * S, 0, 10), '#fff1c8')
  ink(ctx, oval(fx, fy, 0.25 * S, 0.25 * S, 0, 28), { width: 0.018 * S, color: '#c85a14', seed: 206, breakUp: 0.3 })
  paint(ctx, S, [
    [fx + 0.14 * S, fy - 0.2 * S], [fx + 0.26 * S, fy - 0.34 * S], [fx + 0.33 * S, fy - 0.27 * S], [fx + 0.22 * S, fy - 0.17 * S]
  ], tones('#43b649', 1.0), 207, { line: LINE.hair, amp: 0.1, deep: false })
  // Carton shading down the far edge and the fold line at the top.
  ctx.globalAlpha = 0.18
  fillShape(ctx, [[0.24 * S, -1 * S], [0.46 * S, -1 * S], [0.46 * S, 0.46 * S], [0.26 * S, 0.46 * S]], '#5a2a10')
  ctx.globalAlpha = 1
  stroke(ctx, [[-0.3 * S, -0.88 * S], [0.42 * S, -0.88 * S]], 0.012 * S, 0.012 * S, 'rgba(90,50,20,0.35)', 208)
  ctx.restore()

  // The folded "ear" on the side panel, and the sealed fin along the top.
  paint(ctx, S, [
    [-0.405 * S, -0.94 * S], [-0.29 * S, -0.94 * S], [-0.35 * S, -0.8 * S]
  ], m.toyBack, 209, { line: LINE.fine, amp: 0.05, hatch: false, deep: false })
  paint(ctx, S, hard([
    [-0.42 * S, -0.99 * S], [0.4 * S, -0.99 * S], [0.4 * S, -0.94 * S], [-0.42 * S, -0.94 * S]
  ], 0.15), tones('#fff6e4', 0.9), 210, { line: LINE.fine, amp: 0.04, hatch: false, deep: false })

  stuckDarts(ctx, S, [[0.4, -0.2, -0.25], [0.4, -0.66, -0.7]])

  // Button wheels, in front of the carton's foot.
  const btn = tones(m.accent, 1.05)
  buttonWheel(ctx, S, -0.3 * S, GROUND * S - 0.12 * S, 0.12 * S, spin, btn, 190)
  buttonWheel(ctx, S, 0.28 * S, GROUND * S - 0.12 * S, 0.12 * S, spin, btn, 191)

  if (layer === 'all') drawSiegeTowerTop(ctx, S, m, docked, t)
}

/**
 * Everything above the carton: ramp, straw and flag, crew, and the bottle-cap
 * fighting top.
 *
 * Drawn in the order the old tower drew its ramp, banner, crew and merlons, so
 * lifting it into the live layer changes no z-order: the cap's crimp still
 * covers the crew to the waist, which is what makes the archers read as
 * standing INSIDE the top rather than on it.
 */
const drawSiegeTowerTop = (
  ctx: CanvasRenderingContext2D, S: number, m: SiegeParts, docked: boolean, t: number
): void => {
  // ── Drop ramp: a strip of cardboard ──
  //
  // Hinged at the FRONT of the fighting top and always falling forward, so the
  // side it reaches from is the side the wall is on: raised it leans
  // forward-up over the wall, dropped it lies flat across it.
  ctx.save()
  ctx.translate(0.34 * S, -0.9 * S)
  ctx.rotate(-1.0 + (docked ? 1.0 : 0))
  paint(ctx, S, hard([
    [0, -0.045 * S], [0.66 * S, -0.045 * S], [0.66 * S, 0.045 * S], [0, 0.045 * S]
  ], 0.08), CARD, 206, { line: LINE.mid, amp: 0.05, hatch: false })
  // Corrugation showing along the cut edge — the rungs the crew cross on.
  for (let i = 0; i < 7; i++) {
    const k = 0.08 + i * 0.085
    stroke(ctx, [[k * S, -0.03 * S], [k * S, 0.03 * S]], 0.016 * S, 0.016 * S, CARD.deep, 212 + i)
  }
  ctx.restore()

  // ── A bendy straw for a flagpole, with a paper flag taped to it ──
  const wave = Math.sin(t / 260) * 0.05 * S
  const sx = -0.2 * S
  stroke(ctx, [[sx, -1.0 * S], [sx, -1.44 * S]], 0.05 * S, 0.05 * S, INK, 209)
  stroke(ctx, [[sx, -1.0 * S], [sx, -1.44 * S]], 0.034 * S, 0.034 * S, '#fbf6ee', 215)
  for (const y of [-1.08, -1.2, -1.32]) {
    stroke(ctx, [[sx - 0.017 * S, y * S], [sx + 0.017 * S, (y - 0.035) * S]], 0.014 * S, 0.014 * S, m.accent, 216)
  }
  stroke(ctx, [[sx, -1.44 * S], [sx + 0.1 * S, -1.56 * S]], 0.05 * S, 0.05 * S, INK, 217)
  stroke(ctx, [[sx, -1.44 * S], [sx + 0.1 * S, -1.56 * S]], 0.034 * S, 0.034 * S, '#fbf6ee', 218)
  for (let i = 0; i < 3; i++) {
    const y = -1.42 - i * 0.022
    stroke(ctx, [[sx - 0.02 * S, y * S], [sx + 0.02 * S, (y - 0.01) * S]], 0.008 * S, 0.008 * S, '#b9b0a4', 219)
  }
  paint(ctx, S, slab([
    [sx + 0.01 * S, -1.42 * S], [0.06 * S + wave, -1.36 * S],
    [0.0 * S, -1.28 * S], [0.06 * S + wave, -1.18 * S],
    [sx + 0.01 * S, -1.14 * S]
  ], 0.01 * S, 210), tones(m.accent, 1.1), 211, { line: LINE.fine, amp: 0.1, deep: false })

  // ── The crew ──
  //
  // Ant archers, drawn BEFORE the cap so its crimp covers them to the waist.
  // They are why height is not safety: the simulation lets this engine's crew
  // strike three rows up the wall, and they are what explains that rule.
  antArcher(ctx, S, -0.06 * S, -1.03 * S, docked, t, 0, true)
  antArcher(ctx, S, 0.22 * S, -1.05 * S, docked, t, 1.9, false)

  // ── Bottle-cap fighting top: its crimp teeth are the crenellations ──
  const capT = tones(m.accent, 1.05)
  const y0 = -1.12
  const y1 = -0.92
  const cap: Pt[] = [[-0.42 * S, y1 * S]]
  const teeth = 9
  for (let i = 0; i <= teeth; i++) {
    const x = (-0.42 + (i / teeth) * 0.86) * S
    cap.push([x, (y0 + (i % 2 ? 0.035 : 0)) * S])
  }
  cap.push([0.44 * S, y1 * S])
  paint(ctx, S, hard(cap, 0.06), capT, 207, { line: LINE.mid, amp: 0.04, deep: false, hatch: false })
  for (let i = 0; i < 6; i++) {
    const x = (-0.35 + i * 0.15) * S
    stroke(ctx, [[x, (y0 + 0.05) * S], [x, (y1 - 0.02) * S]], 0.02 * S, 0.014 * S, capT.shade, 220 + i)
  }
  stroke(ctx, [[-0.38 * S, (y0 + 0.06) * S], [0.4 * S, (y0 + 0.06) * S]], 0.012 * S, 0.012 * S, 'rgba(255,255,255,0.55)', 230)
}

/**
 * An ant archer in the fighting top, working a toothpick bow.
 *
 * The draw cycle is asymmetric — a slow pull and a fast loose — because an
 * archer nocking on a sine wave reads as someone doing exercises.
 */
const antArcher = (
  ctx: CanvasRenderingContext2D, S: number,
  x: number, y: number, loosing: boolean, t: number, phase: number, helmet: boolean
): void => {
  const cycle = ((t / 900 + phase) % 1)
  const draw = loosing ? (cycle < 0.75 ? cycle / 0.75 : 0) : 0.25
  const sz = 0.1 * S
  const bx = x + 0.16 * S
  const by = y - 0.14 * S
  const nock = bx - 0.04 * S - draw * 0.07 * S
  // Bow: a bent toothpick with a thread string, held out front.
  ant(ctx, x, y, sz, { lean: 1, grab: [bx, by], helmet, t, seed: 224 + phase * 10 })
  stroke(ctx, [
    [bx - 0.02 * S, by - 0.12 * S], [bx + 0.03 * S, by], [bx - 0.02 * S, by + 0.12 * S]
  ], 0.022 * S, 0.022 * S, INK, 225)
  stroke(ctx, [
    [bx - 0.02 * S, by - 0.12 * S], [bx + 0.03 * S, by], [bx - 0.02 * S, by + 0.12 * S]
  ], 0.012 * S, 0.012 * S, SHAVED.base, 226)
  stroke(ctx, [
    [bx - 0.02 * S, by - 0.12 * S], [nock, by], [bx - 0.02 * S, by + 0.12 * S]
  ], 0.007 * S, 0.007 * S, '#fbf6ee', 227)
  // The toothpick on the string, only while there is one on the string.
  if (draw > 0.05) {
    stroke(ctx, [[nock, by], [nock + 0.2 * S, by]], 0.016 * S, 0.008 * S, INK, 228)
    stroke(ctx, [[nock, by], [nock + 0.2 * S, by]], 0.009 * S, 0.004 * S, SHAVED.base, 229)
  }
}

// ─── Pencil Trebuchet ───────────────────────────────────────────────────────
//
// Authored facing +X like every other machine, and NOT mirrored by the caller.
// The geometry is the animation: the long arm (a pencil) winches DOWN and
// BACK, away from the target, which lifts the eraser counterweight over the
// target side; the weight then falls and drives the pencil up and over through
// nearly half a turn, and the pebble leaves at the top.
//
// Only the FRAME has to respect the sprite box (`SIEGE_BOX` = 2.4 × scale, so
// nothing baked may pass ±1.2 S from the origin). The throwing assembly is not
// baked — it is drawn straight onto the battlefield — so it is free to sweep
// out past that. What it does have to stay inside is the tint scratch layer a
// slowed or flashing unit is composited through, which is padded to 2.8 S.

/** Pivot height above the machine's origin. */
const TREB_PIVOT = -0.34
/** Counterweight (short) arm. */
const TREB_SHORT = 0.23
/** Sling (long) arm. */
const TREB_LONG = 0.74
/** Sling string, tip to pouch. */
const TREB_SLING = 0.31

// Long-arm angle from +x, canvas convention (y DOWN):
//   π/2 straight down · π pointing back · 3π/2 straight up · 0 forward.
/** Winched down and back, counterweight raised over the target side. */
const PHI_COCKED = 2.5
/** Top of the sweep, up and forward — where the sling lets go. */
const PHI_RELEASE = 5.55
/** Where the arm rocks to a stop afterwards. */
const PHI_SPENT = 5.86

// Cycle landmarks. `cycle` is 0 the instant the pebble leaves and 1 at the next
// shot, so the throw lives at the END of the window and the release lands
// exactly on the frame the simulation spawns the projectile.
const TREB_FOLLOW_END = 0.16
const TREB_HOLD_START = 0.78
const TREB_THROW_START = 0.9

/** Long-arm angle at a point in the shot cycle. */
const trebPhi = (c: number): number => {
  if (c < TREB_FOLLOW_END) {
    // Coasting to the stop, rocking once against the buffer.
    const u = c / TREB_FOLLOW_END
    return PHI_SPENT + (PHI_RELEASE - PHI_SPENT) * Math.exp(-u * 3.4) * Math.cos(u * 7)
  }
  if (c < TREB_HOLD_START) {
    // The crew on the spool, hauling the long arm back down. Steady, with soft
    // ends — a winch starts and stops against a ratchet, it does not snap.
    const u = (c - TREB_FOLLOW_END) / (TREB_HOLD_START - TREB_FOLLOW_END)
    return PHI_SPENT + (PHI_COCKED - PHI_SPENT) * (u * u * (3 - 2 * u))
  }
  if (c < TREB_THROW_START) return PHI_COCKED
  // The throw. Sine ease-in-out: the arm ACCELERATES under the falling weight
  // and then slows at the top as the energy goes into the sling — and it is
  // that deceleration that whips the pouch forward past the arm.
  const u = (c - TREB_THROW_START) / (1 - TREB_THROW_START)
  return PHI_COCKED + (PHI_RELEASE - PHI_COCKED) * (0.5 - 0.5 * Math.cos(Math.PI * u))
}

/** Angular velocity, per unit cycle. Differenced rather than derived so the
 *  easing above can be retuned without a second formula falling out of step. */
const trebOmega = (c: number): number => {
  const h = 0.004
  return (trebPhi(Math.min(1, c + h)) - trebPhi(Math.max(0, c - h))) / (2 * h)
}

/**
 * Where the pouch hangs, and how tight the strings are.
 *
 * The sling is a pouch on two strings, and every frame it is doing one of two
 * things: hanging under gravity, or trailing behind a tip that is moving
 * faster than it is. Blending those two by how fast the tip is actually going
 * gives all of the behaviour the machine needs from one expression.
 */
const trebPouch = (
  S: number, phi: number, omega: number, c: number
): { tip: Pt; pouch: Pt; taut: number } => {
  const tip: Pt = [
    Math.cos(phi) * TREB_LONG * S,
    TREB_PIVOT * S + Math.sin(phi) * TREB_LONG * S
  ]
  // Tip velocity, in canvas axes.
  const vx = -Math.sin(phi) * omega * TREB_LONG
  const vy = Math.cos(phi) * omega * TREB_LONG
  // Gravity pulls the pouch down (+y); the tip running away from it pulls the
  // string the other way. 0.09 is the weight that makes the trailing term win
  // through the throw and lose everywhere else.
  const wx0 = -vx * 0.09
  let wy = 1 - vy * 0.09
  let wx = wx0
  // The empty sling swinging itself out after the pebble has gone.
  if (c < 0.42) {
    wx += Math.exp(-c * 7) * Math.sin(c * 46) * 0.5
  }
  const len = Math.hypot(wx, wy) || 1
  let theta = Math.atan2(wy / len, wx / len)

  // ── The whip ──
  //
  // The balance above has no INERTIA, so as the arm slows at the top of the
  // sweep the pouch would drop straight down — the one pose a trebuchet never
  // makes at the moment it lets go. What really happens is that the pouch
  // keeps the speed the arm just gave it, swings THROUGH the beam's line and
  // releases ahead of it; that overshoot is modelled outright.
  let whip = 0
  if (c >= TREB_THROW_START) {
    const u = (c - TREB_THROW_START) / (1 - TREB_THROW_START)
    const k = Math.min(1, Math.max(0, (u - 0.45) / 0.55))
    whip = k * k * (3 - 2 * k)
  } else if (c < 0.12) {
    // Just released: the strings are still streaming out along the beam and
    // fall slack over the next fraction of a second rather than snapping down.
    whip = Math.exp(-c / 0.035)
  }
  if (whip > 0) {
    let d = (phi - theta) % (Math.PI * 2)
    if (d > Math.PI) d -= Math.PI * 2
    if (d < -Math.PI) d += Math.PI * 2
    theta += d * whip * 0.95
  }

  const pouch: Pt = [
    tip[0] + Math.cos(theta) * TREB_SLING * S,
    tip[1] + Math.sin(theta) * TREB_SLING * S
  ]
  // The pouch cannot go through the sand. A cocked trebuchet's sling genuinely
  // lies on the ground under the beam, which is where the crew load it from.
  const floor = (GROUND - 0.02) * S
  if (pouch[1] > floor) pouch[1] = floor

  // How taut the strings are, for the sag on the draw.
  const taut = Math.min(1, Math.max(Math.abs(omega) * TREB_LONG * 0.06, whip))
  return { tip, pouch, taut }
}

/**
 * The parts of the trebuchet that never move: popsicle A-frame, wheels, spool,
 * ammunition and a crew ant. This is what gets baked into the shared sprite
 * cache; the pencil is drawn live on top of it, per machine.
 */
const drawTrebuchetFrame = (
  ctx: CanvasRenderingContext2D, S: number, m: SiegeParts, spin: number, t: number
): void => {
  capWheel(ctx, S, -0.34 * S, GROUND * S - 0.13 * S, 0.13 * S, spin, m.toy, 250)
  capWheel(ctx, S, 0.34 * S, GROUND * S - 0.13 * S, 0.13 * S, spin, m.toy, 251)

  // Sill, riding on the axles.
  stick(ctx, S, [-0.56 * S, 0.3 * S], [0.56 * S, 0.3 * S], 0.1 * S, STICK, 230, 2)
  // A-frame legs up to the pivot.
  stick(ctx, S, [-0.42 * S, 0.28 * S], [-0.02 * S, TREB_PIVOT * S], 0.085 * S, STICK_BACK, 231, 2)
  stick(ctx, S, [0.42 * S, 0.28 * S], [0.02 * S, TREB_PIVOT * S], 0.085 * S, STICK, 232, 2)
  // Collar tie — the joint that stops the frame splaying under the throw.
  stick(ctx, S, [-0.25 * S, -0.02 * S], [0.25 * S, -0.02 * S], 0.06 * S, STICK_BACK, 233, 1)
  // Raking braces to the sill: without them the A-frame reads as a stepladder.
  stick(ctx, S, [-0.52 * S, 0.26 * S], [-0.16 * S, -0.06 * S], 0.05 * S, STICK_BACK, 244, 1)
  stick(ctx, S, [0.52 * S, 0.26 * S], [0.16 * S, -0.06 * S], 0.05 * S, STICK_BACK, 245, 1)
  // Rubber bands lashing the joints.
  for (const [x, y] of [[-0.2, -0.02], [0.2, -0.02]] as const) {
    band(ctx, [[x * S, (y - 0.045) * S], [(x + 0.02) * S, (y + 0.045) * S]], 0.016 * S, m.accent, 249)
  }

  // ── Spool at the tail: how the long arm gets hauled back down ──
  spool(ctx, S, -0.52 * S, 0.06 * S, -0.3 * S, 0.24 * S, m.accent, 246)

  // ── Ammunition on the sill ──
  ammo(ctx, S, 0.06 * S, 0.19 * S, 0.062 * S, false, 252)
  ammo(ctx, S, 0.19 * S, 0.21 * S, 0.05 * S, true, 254)
  ammo(ctx, S, 0.13 * S, 0.11 * S, 0.05 * S, false, 256)

  // ── The crew: an ant in an acorn helmet hauling the next pebble to the
  // sling, which lies on the sand at the tail while the arm is cocked ──
  const bob = Math.sin(t / 280) * 0.008 * S
  ant(ctx, -0.76 * S, GROUND * S, 0.1 * S, {
    lean: 1, grab: [-0.68 * S, 0.27 * S + bob], helmet: true, t, seed: 258
  })
  ammo(ctx, S, -0.68 * S, 0.24 * S + bob, 0.045 * S, false, 259)
}

/**
 * The throwing assembly: pencil beam, eraser counterweight, sling, pebble.
 *
 * Drawn live rather than baked, because this is the part that has to agree with
 * the simulation. `cycle` is the machine's own progress toward its next shot —
 * 0 the frame the pebble leaves, 1 the frame the next one does.
 */
const drawTrebuchetArm = (
  ctx: CanvasRenderingContext2D, S: number, m: SiegeParts,
  engaged: boolean, cycle: number
): void => {
  // A machine still rolling up carries the arm winched down and lashed.
  const c = engaged ? Math.min(0.999, Math.max(0, cycle)) : 0.84
  const phi = trebPhi(c)
  const omega = engaged ? trebOmega(c) : 0
  const cs = Math.cos(phi)
  const sn = Math.sin(phi)
  const px = 0
  const py = TREB_PIVOT * S

  // ── Counterweight: a big pink eraser on a paperclip ──
  //
  // Hangs from the SHORT arm on its own pin, so it stays upright however far
  // the beam has swung — what makes the fall read as a weight dropping rather
  // than a block welded to a stick.
  const wx = px - cs * TREB_SHORT * S
  const wy = py - sn * TREB_SHORT * S
  // The paperclip it hangs from.
  stroke(ctx, [[wx, wy], [wx, wy + 0.07 * S]], 0.03 * S, 0.03 * S, INK, 254)
  stroke(ctx, [[wx, wy], [wx, wy + 0.07 * S]], 0.016 * S, 0.016 * S, FERRULE.lit, 255)
  // 0.32 deep: the weight passes its lowest point mid-throw, and any deeper
  // would clip into the top of the sill it swings over.
  const box = slab([
    [wx - 0.16 * S, wy + 0.1 * S], [wx + 0.16 * S, wy + 0.1 * S],
    [wx + 0.16 * S, wy + 0.31 * S], [wx - 0.16 * S, wy + 0.31 * S]
  ], 0.006 * S, 235)
  paint(ctx, S, box, ERASER, 236, { line: LINE.mid, amp: 0.05, deep: false })
  // The bevelled top face every pink eraser has.
  paint(ctx, S, hard([
    [wx - 0.16 * S, wy + 0.1 * S], [wx - 0.11 * S, wy + 0.045 * S],
    [wx + 0.11 * S, wy + 0.045 * S], [wx + 0.16 * S, wy + 0.1 * S]
  ], 0.1), tones(ERASER.lit, 0.8), 237, { line: LINE.fine, amp: 0.04, deep: false, hatch: false })
  // A crumb-worn corner: the eraser has been used.
  fillShape(ctx, oval(wx + 0.12 * S, wy + 0.28 * S, 0.035 * S, 0.025 * S, 0.5, 10), ERASER.shade)

  // ── The beam: a pencil, eraser end at the counterweight ──
  pencil(ctx, S,
    [px - cs * (TREB_SHORT + 0.06) * S, py - sn * (TREB_SHORT + 0.06) * S],
    [px + cs * (TREB_LONG + 0.08) * S, py + sn * (TREB_LONG + 0.08) * S],
    0.085 * S, 234)
  // Rubber bands where the beam takes the most strain, either side of the pin.
  for (const k of [-0.14, 0.16]) {
    const bx = px + cs * k * S
    const by = py + sn * k * S
    band(ctx, [
      [bx + sn * 0.055 * S, by - cs * 0.055 * S], [bx - sn * 0.055 * S, by + cs * 0.055 * S]
    ], 0.018 * S, m.accent, 256)
  }

  // ── Sling ──
  const { tip, pouch, taut } = trebPouch(S, phi, omega, c)
  // Two strings, not one: a pouch between a fixed string and a release string,
  // which is what separates a sling from a pebble tied to a thread.
  const sag = (1 - taut) * TREB_SLING * 0.26 * S
  for (const off of [-0.035, 0.035]) {
    const ox = off * S
    twine(ctx, [
      [tip[0] + ox * 0.4, tip[1]],
      [(tip[0] + pouch[0]) / 2 + ox, (tip[1] + pouch[1]) / 2 + sag],
      [pouch[0] + ox * 0.6, pouch[1]]
    ], 0.013 * S, 239)
  }
  // The pouch: a scrap of cloth, cupped while it is carrying and slack once
  // it is not.
  const loaded = engaged ? c >= TREB_HOLD_START - 0.02 : false
  const cup = loaded ? 1 : 0.45
  paint(ctx, S, slab([
    [pouch[0] - 0.1 * S, pouch[1] - 0.05 * S],
    [pouch[0] + 0.1 * S, pouch[1] - 0.05 * S],
    [pouch[0] + 0.07 * S * cup, pouch[1] + 0.09 * S * cup],
    [pouch[0] - 0.07 * S * cup, pouch[1] + 0.09 * S * cup]
  ], 0.012 * S, 257), tones(m.accent2, 1.05), 258, { line: LINE.fine, amp: 0.14 })

  // ── The pebble ──
  //
  // In the pouch from the moment the crew load it until the frame it is
  // thrown, and NOT one frame longer: two pebbles on screen — one flying, one
  // still sitting in the sling — is the whole reason a throw fails to read.
  if (loaded) {
    paint(ctx, S, rough(
      blobStone(pouch[0], pouch[1] - 0.01 * S, 0.075 * S), 0.012 * S, 240
    ), PEBBLE, 241, { line: LINE.fine, amp: 0.16 })
  }

  // ── Pushpin axle ──
  //
  // Last, so it caps the beam rather than hiding under it.
  paint(ctx, S, oval(px, py, 0.07 * S, 0.07 * S, 0, 18), m.toy, 242,
    { line: LINE.fine, amp: 0.05, deep: false, hatch: false })
  fillShape(ctx, oval(px - 0.022 * S, py - 0.024 * S, 0.024 * S, 0.016 * S, -0.5, 8), 'rgba(255,255,255,0.75)')
}

/**
 * A contraption's contact shadow.
 *
 * Part of the baked static layer — and so gone when a painted chassis
 * replaces that layer, since a painter cannot paint a soft shadow over a
 * chroma key and is told not to. The battlefield lays this under a painted
 * chassis instead, so an adopted engine still stands on the sand.
 */
export const drawSiegeShadow = (ctx: CanvasRenderingContext2D, S: number): void =>
  groundShadow(ctx, S, 0.62, GROUND + 0.03, 0.32)

/**
 * Draw one siege engine.
 *
 * `spin` drives the wheels; `engaged` is "has a target" — the flag that
 * switches every engine from travelling to working.
 *
 * `layer` splits each machine into what can be shared and what cannot:
 *   · `static` — everything cacheable (the default for a baked sprite)
 *   · `moving` — only the parts that must agree with this machine's own clock
 *   · `all`    — both, for the uncached fallback path
 *
 * `cycle` is progress toward this machine's next shot: 0 the frame its round
 * leaves, 1 the frame the next one does.
 */
export const drawSiegeMachine = (
  ctx: CanvasRenderingContext2D, id: string, S: number, p: Palette,
  opts: {
    spin: number
    engaged: boolean
    t: number
    cycle?: number
    layer?: 'all' | 'static' | 'moving'
    /** Late-game catapults load burning shot; the spoon is alight before the
     *  shot, which is the only warning the player gets. */
    flaming?: boolean
  }
): void => {
  const m = siegeParts(p)
  const layer = opts.layer ?? 'all'
  const wantStatic = layer !== 'moving'
  const wantMoving = layer !== 'static'

  // The shadow belongs to the baked pass. Re-stamping it in the live pass would
  // double its opacity every frame the two are composited together.
  if (wantStatic) drawSiegeShadow(ctx, S)

  // The three throwers are split into a baked frame and a live arm, so each
  // machine animates against its OWN reload rather than every catapult on the
  // field flapping in unison on a wall clock unrelated to when they fire.
  if (id === 'trebuchet') {
    if (wantStatic) drawTrebuchetFrame(ctx, S, m, opts.spin, opts.t)
    if (wantMoving) drawTrebuchetArm(ctx, S, m, opts.engaged, opts.cycle ?? 0)
    return
  }
  if (id === 'ballista') {
    if (wantStatic) drawBallistaFrame(ctx, S, m, opts.spin)
    if (wantMoving) drawBallistaArm(ctx, S, m, opts.engaged, opts.cycle ?? 0, opts.t)
    return
  }
  if (id === 'catapult') {
    if (wantStatic) drawCatapultFrame(ctx, S, m, opts.spin, opts.t)
    if (wantMoving) {
      drawCatapultArm(ctx, S, m, opts.engaged, opts.cycle ?? 0, opts.flaming === true)
    }
    return
  }

  // The other three split at the one place their own z-order allows: the
  // ram's pencil rides over its car, the tin ram's fork slides out of its tin,
  // and the tower's ramp, straw, crew and cap lift off the carton.
  switch (id) {
    case 'ram': drawRam(ctx, S, m, opts.spin, opts.engaged, opts.t, layer); break
    case 'ironRam': drawIronRam(ctx, S, m, opts.spin, opts.engaged, opts.t, layer); break
    case 'siegeTower': drawSiegeTower(ctx, S, m, opts.spin, opts.engaged, opts.t, layer); break
  }
}

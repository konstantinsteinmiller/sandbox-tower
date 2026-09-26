import type { BlockKind } from './types'

/**
 * ─── Block glyphs ───────────────────────────────────────────────────────────
 *
 * One bold pictogram per block type, drawn into a unit square centred on the
 * origin (−0.5 … +0.5 on both axes) and scaled by the caller.
 *
 * WHY THIS EXISTS
 * A tray thumbnail gives a block roughly 14–20 px. At that size the in-world
 * material detail — mould ridges, pebbles, speckle — collapses into noise, and
 * every sand block looks like every other sand block. The tray previously
 * leaned on "silhouette plus accent colour", which is exactly the cue that
 * fails first: a colour-blind player, a dimmed unaffordable tile, or simply
 * two sand-family blocks side by side, and the hand becomes unreadable.
 *
 * So the thumbnail carries a GLYPH instead, and the rules are the rules of a
 * road sign rather than of an illustration:
 *
 *   · one shape per block, distinguishable by outline alone at 14 px
 *   · filled masses, not thin strokes — a 1 px line disappears under a
 *     hairline of anti-aliasing on a phone
 *   · drawn light-on-dark with a dark backing plate, so contrast never depends
 *     on the block's own palette
 *   · nothing smaller than about 8% of the cell
 *
 * Each glyph is the TOY the block is in Sandbox Tower — a foam dart, a squirt
 * gun, a bug zapper, a piggy bank — so the tray, the inspector and the tech
 * tree name the same object the castle shows.
 *
 * Holes (the Gate's arch, the X pressed into packed sand, the zapper's bolt)
 * are cut with the non-zero winding rule: `shape` winds the outline one way
 * and every hole the other, so a single `fill()` leaves them open.
 *
 * Shared by the build tray, the block inspector and the tech tree, so a block
 * looks the same everywhere the player meets it.
 */

export interface GlyphCtx {
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  arc(x: number, y: number, r: number, a0: number, a1: number, ccw?: boolean): void
  ellipse(x: number, y: number, rx: number, ry: number, rot: number, a0: number, a1: number): void
  quadraticCurveTo(cx: number, cy: number, x: number, y: number): void
  closePath(): void
  beginPath(): void
  fill(): void
  rect(x: number, y: number, w: number, h: number): void
}

/** Draw `id`'s pictogram as filled paths in a unit square around the origin. */
export type GlyphFn = (c: GlyphCtx) => void

type P = readonly [number, number]

/** Twice the signed area; positive is clockwise on a y-down canvas. */
const area2 = (pts: readonly P[]): number => {
  let a = 0
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!
    const q = pts[(i + 1) % pts.length]!
    a += p[0] * q[1] - q[0] * p[1]
  }
  return a
}

/** Add one closed polygon to the current path, wound clockwise or not. */
const ring = (c: GlyphCtx, pts: readonly P[], clockwise: boolean): void => {
  const list = (area2(pts) > 0) === clockwise ? pts : [...pts].reverse()
  list.forEach(([x, y], i) => { if (i === 0) c.moveTo(x, y); else c.lineTo(x, y) })
  c.closePath()
}

/** An outline with holes, filled in one go. */
const shape = (c: GlyphCtx, outer: readonly P[], holes: ReadonlyArray<readonly P[]> = []): void => {
  c.beginPath()
  ring(c, outer, true)
  for (const h of holes) ring(c, h, false)
  c.fill()
}

const poly = (c: GlyphCtx, pts: readonly P[]): void => shape(c, pts)

const box = (c: GlyphCtx, x: number, y: number, w: number, h: number): void => {
  c.beginPath()
  c.rect(x, y, w, h)
  c.fill()
}

const dot = (c: GlyphCtx, x: number, y: number, r: number): void => {
  c.beginPath()
  c.arc(x, y, r, 0, Math.PI * 2)
  c.fill()
}

const oval = (c: GlyphCtx, x: number, y: number, rx: number, ry: number, rot = 0): void => {
  c.beginPath()
  c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2)
  c.fill()
}

/** A thick straight bar from a to b, `t` wide. */
const bar = (c: GlyphCtx, ax: number, ay: number, bx: number, by: number, t: number): void => {
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  const nx = (-dy / len) * t * 0.5
  const ny = (dx / len) * t * 0.5
  poly(c, [[ax + nx, ay + ny], [bx + nx, by + ny], [bx - nx, by - ny], [ax - nx, ay - ny]])
}

/** Polygon points rotated by `a` about the origin, then moved to (x, y). */
const turn = (pts: readonly P[], a: number, x = 0, y = 0): P[] => {
  const cs = Math.cos(a)
  const sn = Math.sin(a)
  return pts.map(([px, py]) => [x + px * cs - py * sn, y + px * sn + py * cs] as P)
}

/** Points on an arc, for polygons that need a curved edge. */
const arcPts = (x: number, y: number, rx: number, ry: number, a0: number, a1: number, n = 10): P[] => {
  const out: P[] = []
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n
    out.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry])
  }
  return out
}

/** A four-point sparkle. */
const sparkle = (c: GlyphCtx, x: number, y: number, r: number): void => {
  const q = r * 0.3
  poly(c, [[x, y - r], [x + q, y - q], [x + r, y], [x + q, y + q], [x, y + r], [x - q, y + q], [x - r, y], [x - q, y - q]])
}

export const BLOCK_GLYPHS: Record<string, GlyphFn> = {
  // ── Core ────────────────────────────────────────────────────────────────
  // A crenellated gatehouse with its arch cut out. The only glyph with an arch
  // AND battlements, so the Castle Gate is never confused with a wall block.
  gate: (c) => {
    shape(c, [
      [-0.38, 0.44], [-0.38, -0.42], [-0.22, -0.42], [-0.22, -0.3], [-0.08, -0.3], [-0.08, -0.42],
      [0.08, -0.42], [0.08, -0.3], [0.22, -0.3], [0.22, -0.42], [0.38, -0.42], [0.38, 0.44]
    ], [[
      [-0.17, 0.44], [0.17, 0.44], [0.17, 0.08], ...arcPts(0, 0.08, 0.17, 0.17, 0, -Math.PI, 8).slice(1, -1), [-0.17, 0.08]
    ]])
  },

  // ── Structure ───────────────────────────────────────────────────────────
  // A bucket-moulded block: tapered like the bucket it came out of, with the
  // two mould ridges showing as gaps.
  wood: (c) => {
    const hw = (y: number): number => 0.33 + (y + 0.4) * 0.12
    const hole = (x: number, y: number): P[] => arcPts(x, y, 0.035, 0.035, 0, Math.PI * 2, 6).slice(0, -1)
    const band = (y0: number, y1: number, holes: P[][]): void => {
      shape(c, [[-hw(y0), y0], [hw(y0), y0], [hw(y1), y1], [-hw(y1), y1]], holes)
    }
    // Grain speckle, cut through: the one thing a plain block of sand has.
    band(-0.4, -0.16, [hole(-0.16, -0.28), hole(0.18, -0.25)])
    band(-0.09, 0.14, [hole(0.02, 0.02), hole(-0.24, 0.05)])
    band(0.21, 0.42, [hole(0.2, 0.31), hole(-0.1, 0.33)])
  },
  // A slab of packed sand with a bold X pressed through it — the X is the
  // whole identity of the brace.
  brace: (c) => {
    const a = 0.25
    const e = 0.07
    shape(c, [[-0.4, -0.4], [0.4, -0.4], [0.4, 0.4], [-0.4, 0.4]], [[
      [-a + e, -a - e], [0, -2 * e], [a - e, -a - e], [a + e, -a + e], [2 * e, 0], [a + e, a - e],
      [a - e, a + e], [0, 2 * e], [-a + e, a + e], [-a - e, a - e], [-2 * e, 0], [-a - e, -a + e]
    ]])
  },
  // A mosaic of pebbles. Round and many — never mistaken for sand.
  stone: (c) => {
    oval(c, -0.19, -0.26, 0.17, 0.12, 0.1)
    oval(c, 0.18, -0.27, 0.16, 0.12, -0.1)
    oval(c, -0.31, 0.0, 0.11, 0.12)
    oval(c, 0.02, 0.0, 0.16, 0.12, 0.05)
    oval(c, 0.32, 0.01, 0.1, 0.12)
    oval(c, -0.16, 0.27, 0.17, 0.12, -0.08)
    oval(c, 0.2, 0.27, 0.15, 0.12, 0.1)
  },

  // ── Weapons ─────────────────────────────────────────────────────────────
  // A foam dart in flight: suction cup, shaft, fins. The dart IS the weapon.
  archer: (c) => {
    // A foam dart in flight, up and to the right: a fat foam body, its rounded
    // rubber tip split off by a groove, and three speed lines behind it.
    const a = -Math.PI / 4
    const tip = arcPts(0.24, 0, 0.13, 0.13, -Math.PI / 2, Math.PI / 2, 8)
    poly(c, turn([[0.12, -0.13], [0.24, -0.13], ...tip.slice(1, -1), [0.24, 0.13], [0.12, 0.13]], a))
    poly(c, turn([[-0.3, -0.12], [0.08, -0.12], [0.08, 0.12], [-0.3, 0.12]], a))
    for (const [y, x0] of [[-0.12, -0.5], [0, -0.56], [0.12, -0.5]] as const) {
      poly(c, turn([[x0, y - 0.03], [-0.36, y - 0.03], [-0.36, y + 0.03], [x0, y + 0.03]], a))
    }
  },
  // A squirt gun: grip, body, nozzle, the round tank on top — and a drop.
  cannon: (c) => {
    box(c, -0.36, -0.08, 0.54, 0.18)
    box(c, 0.16, -0.05, 0.24, 0.1)
    poly(c, [[-0.32, 0.08], [-0.1, 0.08], [-0.16, 0.42], [-0.38, 0.42]])
    c.beginPath()
    c.moveTo(-0.34, -0.08)
    c.lineTo(-0.34, -0.2)
    c.arc(-0.17, -0.2, 0.17, Math.PI, 0)
    c.lineTo(0, -0.08)
    c.closePath()
    c.fill()
    // The drop leaving the nozzle.
    c.beginPath()
    c.moveTo(0.4, -0.36)
    c.quadraticCurveTo(0.33, -0.22, 0.4, -0.18)
    c.quadraticCurveTo(0.47, -0.22, 0.4, -0.36)
    c.fill()
  },
  // A toy bucket tipped up as a tube, with its mud ball on the way out.
  mortar: (c) => {
    // Tipped back like a mortar, its mud ball already away along the bore.
    const a = 0.42
    poly(c, turn([[-0.14, 0.34], [0.14, 0.34], [0.21, -0.14], [-0.21, -0.14]], a, -0.06, 0.02))
    poly(c, turn([[-0.27, -0.24], [0.27, -0.24], [0.27, -0.12], [-0.27, -0.12]], a, -0.06, 0.02))
    poly(c, [[-0.42, 0.44], [0.2, 0.44], [0.08, 0.3], [-0.3, 0.3]])
    dot(c, 0.28, -0.3, 0.12)
  },
  // A water balloon, knotted, over its sunk pit.
  bombard: (c) => {
    // A water balloon, knotted, its string curling down to the launcher.
    shape(c, turn(arcPts(0, 0, 0.23, 0.27, 0, Math.PI * 2, 18).slice(0, -1), 0.3, 0.06, -0.16),
      [turn(arcPts(0, 0, 0.05, 0.1, 0, Math.PI * 2, 8).slice(0, -1), 0.5, -0.06, -0.27)])
    poly(c, [[-0.06, 0.14], [0.06, 0.12], [0.02, 0.2], [-0.04, 0.2]])
    bar(c, -0.01, 0.2, -0.1, 0.3, 0.05)
    bar(c, -0.1, 0.3, 0.0, 0.38, 0.05)
    bar(c, 0.0, 0.38, -0.08, 0.46, 0.05)
  },
  // A bug zapper: hanging ring, cap, a grid lantern with a bolt cut through.
  tesla: (c) => {
    c.beginPath()
    c.arc(0, -0.4, 0.09, 0, Math.PI * 2)
    c.arc(0, -0.4, 0.045, 0, Math.PI * 2, true)
    c.fill()
    poly(c, [[-0.3, -0.2], [-0.16, -0.32], [0.16, -0.32], [0.3, -0.2]])
    shape(c, [[-0.26, -0.2], [0.26, -0.2], [0.26, 0.34], [-0.26, 0.34]], [[
      [0.07, -0.14], [-0.13, 0.08], [-0.01, 0.08], [-0.07, 0.28], [0.14, 0.02], [0.02, 0.02]
    ]])
    box(c, -0.33, 0.34, 0.66, 0.1)
  },
  // An ice pop on its stick, one bite missing, two flavours.
  frost: (c) => {
    // An ice pop on its stick, one big bite out of it.
    const top = arcPts(0, -0.18, 0.25, 0.25, Math.PI, Math.PI * 1.55, 8)
    poly(c, [
      [-0.25, 0.18], ...top, [0.08, -0.43], [0.06, -0.3], [0.14, -0.2], [0.25, -0.2], [0.25, 0.18]
    ])
    c.beginPath()
    c.moveTo(-0.055, 0.18)
    c.lineTo(0.055, 0.18)
    c.lineTo(0.055, 0.41)
    c.arc(0, 0.41, 0.055, 0, Math.PI)
    c.closePath()
    c.fill()
  },

  // ── Utility ─────────────────────────────────────────────────────────────
  // A sand block bristling with toothpicks on all four sides.
  spikes: (c) => {
    // A sand block bristling with toothpicks, splayed like a hedgehog's.
    box(c, -0.24, -0.24, 0.48, 0.48)
    const pick = (bx: number, by: number, tx: number, ty: number): void => {
      const dx = tx - bx
      const dy = ty - by
      const len = Math.hypot(dx, dy) || 1
      const nx = (-dy / len) * 0.04
      const ny = (dx / len) * 0.04
      poly(c, [[bx + nx, by + ny], [tx, ty], [bx - nx, by - ny]])
    }
    pick(-0.14, -0.2, -0.3, -0.52); pick(0, -0.2, 0, -0.55); pick(0.14, -0.2, 0.3, -0.52)
    pick(-0.2, -0.1, -0.54, -0.22); pick(-0.2, 0.12, -0.54, 0.22)
    pick(0.2, -0.1, 0.54, -0.22); pick(0.2, 0.12, 0.54, 0.22)
    pick(-0.12, 0.2, -0.22, 0.54); pick(0.12, 0.2, 0.22, 0.54)
  },
  // A bucket and spade.
  repair: (c) => {
    poly(c, [[-0.4, -0.1], [0.12, -0.1], [0.06, 0.42], [-0.34, 0.42]])
    box(c, -0.44, -0.2, 0.6, 0.12)
    c.beginPath()
    c.arc(-0.14, -0.18, 0.24, Math.PI, 0)
    c.arc(-0.14, -0.18, 0.17, 0, Math.PI, true)
    c.closePath()
    c.fill()
    bar(c, 0.38, -0.44, 0.3, 0.1, 0.08)
    poly(c, [[0.19, 0.06], [0.41, 0.1], [0.38, 0.34], [0.28, 0.46], [0.19, 0.32]])
  },

  // ── Economy ─────────────────────────────────────────────────────────────
  // A sand sifter: the sieve, sand falling through it, the heap underneath.
  lumberHut: (c) => {
    box(c, -0.44, -0.36, 0.88, 0.1)
    shape(c, [[-0.38, -0.26], [0.38, -0.26], ...arcPts(0, -0.26, 0.38, 0.24, 0, Math.PI, 10).slice(1, -1)], [
      arcPts(-0.14, -0.14, 0.04, 0.04, 0, Math.PI * 2, 8).slice(0, -1),
      arcPts(0.02, -0.12, 0.04, 0.04, 0, Math.PI * 2, 8).slice(0, -1),
      arcPts(0.17, -0.15, 0.04, 0.04, 0, Math.PI * 2, 8).slice(0, -1)
    ])
    dot(c, -0.08, 0.1, 0.045)
    dot(c, 0.09, 0.16, 0.045)
    dot(c, -0.01, 0.26, 0.045)
    c.beginPath()
    c.ellipse(0, 0.46, 0.34, 0.13, 0, Math.PI, Math.PI * 2)
    c.closePath()
    c.fill()
  },
  // A toy digger: tracks, cab, arm and scoop.
  stonepit: (c) => {
    shape(c, [[-0.46, 0.26], [0.12, 0.26], [0.16, 0.34], [0.12, 0.42], [-0.46, 0.42], [-0.5, 0.34]])
    shape(c, [[-0.38, -0.1], [0.04, -0.1], [0.04, 0.24], [-0.38, 0.24]], [[[-0.3, -0.03], [-0.1, -0.03], [-0.1, 0.1], [-0.3, 0.1]]])
    bar(c, -0.02, 0.06, 0.2, -0.36, 0.11)
    bar(c, 0.2, -0.36, 0.38, -0.06, 0.09)
    poly(c, [[0.26, -0.06], [0.48, -0.06], [0.46, 0.14], [0.32, 0.12]])
    dot(c, 0.36, 0.34, 0.08)
  },
  // A piggy bank with a coin dropping in.
  coffer: (c) => {
    c.beginPath()
    c.ellipse(-0.02, 0.06, 0.38, 0.26, 0, 0, Math.PI * 2)
    c.arc(0.2, -0.02, 0.04, 0, Math.PI * 2, true)
    c.fill()
    box(c, 0.3, -0.02, 0.15, 0.16)
    poly(c, [[0.04, -0.14], [0.16, -0.34], [0.24, -0.1]])
    box(c, -0.28, 0.2, 0.12, 0.2)
    box(c, 0.08, 0.2, 0.12, 0.2)
    dot(c, -0.42, 0.0, 0.05)
    dot(c, -0.12, -0.37, 0.11)
  },

  // ── Buffs ──
  // A paper flag on a toothpick and a glowing seashell. Both read as "not a
  // weapon and not a wall" at 14 px, which is the distinction that matters: the
  // player has to be able to spot the block that only works because of what is
  // beside it.
  banner: (c) => {
    poly(c, [[-0.21, -0.46], [-0.12, -0.46], [-0.12, 0.3], [-0.165, 0.4], [-0.21, 0.3]])
    poly(c, [[-0.12, -0.44], [0.44, -0.4], [0.28, -0.25], [0.44, -0.1], [-0.12, -0.08]])
    c.beginPath()
    c.ellipse(-0.16, 0.46, 0.3, 0.12, 0, Math.PI, Math.PI * 2)
    c.closePath()
    c.fill()
  },
  obelisk: (c) => {
    const fan: P[] = []
    const lobes = 5
    for (let i = 0; i <= lobes * 2; i++) {
      const a = Math.PI + 0.3 + (i / (lobes * 2)) * (Math.PI - 0.6)
      const r = i % 2 === 0 ? 0.4 : 0.46
      fan.push([Math.cos(a) * r, 0.24 + Math.sin(a) * r])
    }
    const ribs: P[][] = []
    for (let i = 1; i < lobes; i++) {
      const a = Math.PI + 0.3 + (i / lobes) * (Math.PI - 0.6)
      const x = (r: number): P => [Math.cos(a) * r, 0.24 + Math.sin(a) * r]
      const n: P = [-Math.sin(a) * 0.022, Math.cos(a) * 0.022]
      const p0 = x(0.14)
      const p1 = x(0.34)
      ribs.push([[p0[0] + n[0], p0[1] + n[1]], [p1[0] + n[0], p1[1] + n[1]], [p1[0] - n[0], p1[1] - n[1]], [p0[0] - n[0], p0[1] - n[1]]])
    }
    shape(c, [[0.1, 0.28], ...fan, [-0.1, 0.28]], ribs)
    box(c, -0.18, 0.24, 0.36, 0.14)
    sparkle(c, 0.36, -0.34, 0.12)
  },

  // ── Ships ──
  // Three bath toys on one waterline, each its own silhouette: the folded
  // boat's peak, the duck's head, the pirate ship's mast and flag.
  skiff: (c) => {
    // A folded paper boat: deep hull, the tall centre fold, a toothpick spear.
    poly(c, [[-0.48, -0.02], [-0.24, -0.02], [0, -0.44], [0.24, -0.02], [0.48, -0.02], [0.3, 0.3], [-0.3, 0.3]])
    bar(c, 0.16, -0.08, 0.48, -0.3, 0.055)
  },
  longship: (c) => {
    // Faces left, as the duck in the harbour does — a harpoon on its back.
    c.beginPath()
    c.ellipse(0.04, 0.14, 0.4, 0.2, 0, 0, Math.PI * 2)
    c.fill()
    poly(c, [[0.28, 0.04], [0.5, -0.14], [0.42, 0.14]])
    c.beginPath()
    c.arc(-0.24, -0.18, 0.17, 0, Math.PI * 2)
    c.arc(-0.27, -0.23, 0.04, 0, Math.PI * 2, true)
    c.fill()
    poly(c, [[-0.38, -0.19], [-0.52, -0.13], [-0.38, -0.08]])
    bar(c, 0.08, -0.02, 0.3, -0.3, 0.07)
    poly(c, [[0.24, -0.34], [0.38, -0.4], [0.34, -0.26]])
  },
  galley: (c) => {
    poly(c, [[-0.48, 0.1], [0.48, 0.06], [0.32, 0.36], [-0.34, 0.36]])
    box(c, -0.46, -0.06, 0.22, 0.17)
    box(c, -0.02, -0.48, 0.06, 0.56)
    shape(c, [[-0.22, -0.38], [0.26, -0.38], [0.22, -0.06], [-0.18, -0.06]],
      [arcPts(0.02, -0.23, 0.055, 0.055, 0, Math.PI * 2, 8).slice(0, -1)])
    poly(c, [[0.04, -0.48], [0.24, -0.44], [0.04, -0.4]])
  }
}

// The producers' palette names, kept as aliases so anything still asking by the
// old deep-tier ids gets the same picture as the block that replaced them.
BLOCK_GLYPHS.sawmill = BLOCK_GLYPHS.lumberHut!
BLOCK_GLYPHS.quarry = BLOCK_GLYPHS.stonepit!
BLOCK_GLYPHS.mint = BLOCK_GLYPHS.coffer!

/** Fallback pictograms when a block has no bespoke glyph. */
const KIND_FALLBACK: Record<BlockKind, GlyphFn> = {
  core: BLOCK_GLYPHS.gate!,
  structure: BLOCK_GLYPHS.wood!,
  weapon: BLOCK_GLYPHS.cannon!,
  economy: BLOCK_GLYPHS.coffer!,
  utility: BLOCK_GLYPHS.repair!,
  ship: BLOCK_GLYPHS.skiff!,
  // Buff blocks both have bespoke glyphs today, so this arm only fires for a
  // future support block — but its absence was a type error, and the fallback
  // it silently took was the sand block, which reads as a structure block.
  buff: BLOCK_GLYPHS.banner!
}

export const blockGlyph = (typeId: string, kind: BlockKind): GlyphFn =>
  BLOCK_GLYPHS[typeId] ?? KIND_FALLBACK[kind] ?? BLOCK_GLYPHS.wood!

import { mixHex, withAlpha, type Palette } from '@/game/art'

/**
 * ─── The sandcastle: block bodies ───────────────────────────────────────────
 *
 * Every block body in Sandbox Tower is moulded sand. What it is moulded INTO
 * is what the player reads:
 *
 *   * Sand Block (`wood`)     — dry, pale, bucket-moulded: faint horizontal
 *                               ridges where the bucket's ribs were, speckle.
 *   * Packed Sand (`brace`)   — darker wet sand with an X pressed deep into it.
 *   * Pebble Wall (`stone`)   — grey-blue pebbles set in sand. Visibly heavier.
 *   * Toothpick Wall          — golden sand with toothpicks stuck in its face.
 *   * Castle Gate             — a crenellated gatehouse with a lit arch, a
 *                               popsicle-stick door and a shell over the arch.
 *   * every TOY block         — a sand plinth with a plastic band in the toy's
 *                               own colour, so the gun on top reads as clipped
 *                               onto the castle rather than floating on it.
 *
 * Everything here is painted ONCE into the block sprite cache (per type, damage
 * stage and zoom bucket — see `getBlockSprite`) and blitted thereafter, so the
 * detail costs nothing per frame. The one exception is the roof cap, which is
 * baked into its own little cache by size.
 *
 * All coordinates below are in units of the body's side `w`, with the origin at
 * its top-left corner. Nothing is random: every speckle and pebble is seeded
 * on a constant, so a block always looks like itself.
 */

const INK = '#3b2a21'

export interface Ramp { light: string; mid: string; dark: string }

/** The moulded-sand pedestal every toy stands on. */
export const SAND_PLINTH: Ramp = { light: '#f3dca8', mid: '#dcb676', dark: '#ab7c42' }
/** The Magic Seashell's pedestal: sand with a pearly lilac cast. */
const MAGIC_SAND: Ramp = { light: '#fbeefa', mid: '#e8cde4', dark: '#ae88b6' }

/** Blocks whose palette ramp IS their material (see `PALETTES`). */
const MATERIAL_BLOCKS = new Set(['wood', 'brace', 'stone', 'spikes', 'gate'])

export interface BodyLook {
  /** The body's base ramp. */
  ramp: Ramp
  /** The inner rim colour — the material edge, or the toy's plastic. */
  rim: string
  /** Rim weight: the Gate wears a heavier gilt edge than any other block. */
  rimK: number
}

export const bodyLook = (typeId: string, p: Palette): BodyLook => {
  if (typeId === 'gate') return { ramp: p, rim: p.accent, rimK: 1.8 }
  if (MATERIAL_BLOCKS.has(typeId)) return { ramp: p, rim: p.accent, rimK: 1 }
  if (typeId === 'obelisk') return { ramp: MAGIC_SAND, rim: p.mid, rimK: 1 }
  return { ramp: SAND_PLINTH, rim: p.mid, rimK: 1 }
}

// ─── Small helpers ──────────────────────────────────────────────────────────

/** Deterministic 0..1 from a constant. */
const h1 = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export const roundRectPath = (
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number
): void => {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

/** A closed polygon with every corner rounded by its own radius. */
const roundedPoly = (
  ctx: CanvasRenderingContext2D, pts: ReadonlyArray<readonly [number, number, number]>
): void => {
  const n = pts.length
  const a = pts[n - 1]!
  const b = pts[0]!
  ctx.beginPath()
  ctx.moveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
  for (let i = 0; i < n; i++) {
    const cur = pts[i]!
    const nxt = pts[(i + 1) % n]!
    ctx.arcTo(cur[0], cur[1], nxt[0], nxt[1], cur[2])
  }
  ctx.closePath()
}

const polyPath = (ctx: CanvasRenderingContext2D, w: number, pts: ReadonlyArray<readonly [number, number]>): void => {
  ctx.beginPath()
  pts.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x * w, y * w); else ctx.lineTo(x * w, y * w) })
}

/** Many dots, one fill. `n` dots scattered over the face from a constant seed. */
const speckle = (
  ctx: CanvasRenderingContext2D, w: number, seed: number, n: number,
  color: string, rMin: number, rMax: number, y0 = 0, y1 = 1
): void => {
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const x = h1(seed + i * 3.1) * w
    const y = (y0 + h1(seed + i * 3.1 + 1.3) * (y1 - y0)) * w
    const r = (rMin + h1(seed + i * 3.1 + 2.7) * (rMax - rMin)) * w
    ctx.moveTo(x + r, y)
    ctx.arc(x, y, r, 0, Math.PI * 2)
  }
  ctx.fill()
}

/**
 * The ribs a sand bucket leaves on what comes out of it: a lit lip over a
 * shadowed groove, faintly wavy because it was packed by hand.
 */
const mouldRidges = (
  ctx: CanvasRenderingContext2D, w: number, ys: readonly number[],
  lit: string, shade: string, seed: number
): void => {
  ctx.lineCap = 'round'
  const lw = Math.max(1, w * 0.024)
  for (let i = 0; i < ys.length; i++) {
    const y = ys[i]! * w
    const sag = (h1(seed + i) - 0.5) * w * 0.035
    for (const [dy, col] of [[lw * 0.9, shade], [0, lit]] as const) {
      ctx.strokeStyle = col
      ctx.lineWidth = lw
      ctx.beginPath()
      ctx.moveTo(-w * 0.02, y + dy)
      ctx.quadraticCurveTo(w * 0.5, y + dy + sag, w * 1.02, y + dy - sag * 0.4)
      ctx.stroke()
    }
  }
}

// ─── Body silhouette ────────────────────────────────────────────────────────

/** Where the Castle Gate's two crenels are cut, as [x0, x1] of the width. */
const CRENELS: ReadonlyArray<readonly [number, number]> = [[0.23, 0.38], [0.62, 0.77]]
const CRENEL_DEPTH = 0.12

/**
 * The body outline. A rounded square for every block but the Gate, which is
 * the one block with battlements — a silhouette no other block shares, so the
 * heart of the castle is findable as a shape before it is a colour.
 */
export const traceBlockBody = (
  ctx: CanvasRenderingContext2D, typeId: string, w: number, r: number
): void => {
  if (typeId !== 'gate') { roundRectPath(ctx, 0, 0, w, w, r); return }
  const d = CRENEL_DEPTH * w
  const c = Math.min(r * 0.45, w * 0.035)
  const pts: Array<[number, number, number]> = [[0, 0, r]]
  for (const [x0, x1] of CRENELS) {
    pts.push([x0 * w, 0, c], [x0 * w, d, c * 0.6], [x1 * w, d, c * 0.6], [x1 * w, 0, c])
  }
  pts.push([w, 0, r], [w, w, r], [0, w, r])
  roundedPoly(ctx, pts)
}

// ─── Materials ──────────────────────────────────────────────────────────────

/** Per-material surface, drawn clipped to the body shape. */
export const paintBlockMaterial = (
  ctx: CanvasRenderingContext2D, typeId: string, p: Palette, w: number
): void => {
  const look = bodyLook(typeId, p)
  switch (typeId) {
    case 'wood': sandBlock(ctx, p, w); break
    case 'brace': packedSand(ctx, p, w); break
    case 'stone': pebbleWall(ctx, p, w); break
    case 'gate': gatehouse(ctx, p, w); break
    case 'spikes': toothpickWall(ctx, p, w); break
    case 'bombard': plinth(ctx, look.ramp, w, 0); balloonPit(ctx, p, look.ramp, w); break
    case 'banner': plinth(ctx, look.ramp, w, 0); bunting(ctx, p, w); break
    case 'obelisk': plinth(ctx, look.ramp, w, 0); shellInlay(ctx, p, w); break
    default: {
      plinth(ctx, look.ramp, w, 0)
      plasticBand(ctx, p, w)
      if (typeId === 'frost') rime(ctx, w)
    }
  }
}

/** Sand Block — dry, pale, bucket-moulded. */
const sandBlock = (ctx: CanvasRenderingContext2D, p: Palette, w: number): void => {
  // The packed flat top of the cube catches the sky.
  ctx.fillStyle = withAlpha(p.light, 0.55)
  ctx.fillRect(0, 0, w, w * 0.13)
  ctx.fillStyle = withAlpha(p.dark, 0.28)
  ctx.fillRect(0, w * 0.13, w, Math.max(1, w * 0.022))
  mouldRidges(ctx, w, [0.38, 0.62, 0.85], withAlpha('#fff6dc', 0.55), withAlpha(p.dark, 0.42), 11)
  speckle(ctx, w, 101, 22, withAlpha(p.dark, 0.5), 0.011, 0.02)
  speckle(ctx, w, 211, 14, 'rgba(255,251,238,0.7)', 0.01, 0.018)
  // One crumb of shell, the kind that ends up in every bucket of sand.
  ctx.fillStyle = '#fff3ea'
  ctx.beginPath(); ctx.ellipse(w * 0.74, w * 0.5, w * 0.035, w * 0.022, -0.4, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = withAlpha(p.dark, 0.6)
  ctx.lineWidth = Math.max(0.6, w * 0.01)
  ctx.stroke()
}

/** Packed Sand — wet, dark, an X pressed deep into it. */
const packedSand = (ctx: CanvasRenderingContext2D, p: Palette, w: number): void => {
  // Wet blotches, where the water sits.
  ctx.fillStyle = withAlpha(p.dark, 0.26)
  for (const [x, y, rx, ry] of [[0.24, 0.3, 0.2, 0.12], [0.72, 0.7, 0.24, 0.13], [0.8, 0.22, 0.12, 0.08]] as const) {
    ctx.beginPath(); ctx.ellipse(x * w, y * w, rx * w, ry * w, 0.2, 0, Math.PI * 2); ctx.fill()
  }
  speckle(ctx, w, 307, 20, withAlpha('#5a3d1d', 0.45), 0.01, 0.02)

  // The X, pressed deep with the edge of a spade — debossed: a lit lower-right
  // wall, a dark floor and a deeper shadow under the upper-left lip. No frame:
  // a framed X is a crate, and this is sand.
  const g = w * 0.16
  const o = w * 0.026
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const x = (): void => {
    ctx.beginPath()
    ctx.moveTo(w * 0.17, w * 0.2); ctx.quadraticCurveTo(w * 0.5, w * 0.47, w * 0.83, w * 0.8)
    ctx.moveTo(w * 0.83, w * 0.2); ctx.quadraticCurveTo(w * 0.5, w * 0.53, w * 0.17, w * 0.8)
  }
  ctx.save(); ctx.translate(o, o)
  ctx.strokeStyle = withAlpha(p.light, 0.85); ctx.lineWidth = g; x(); ctx.stroke()
  ctx.restore()
  ctx.strokeStyle = withAlpha(p.dark, 0.95); ctx.lineWidth = g * 0.86; x(); ctx.stroke()
  ctx.save(); ctx.translate(-o * 0.5, -o * 0.5)
  ctx.strokeStyle = 'rgba(58,36,14,0.55)'; ctx.lineWidth = g * 0.38; x(); ctx.stroke()
  ctx.restore()
  // Damp crumbs thrown up along the groove lips.
  speckle(ctx, w, 353, 10, withAlpha(p.light, 0.8), 0.012, 0.02, 0.15, 0.85)

  // Wet gloss: two short glints on the upper left.
  ctx.strokeStyle = 'rgba(255,250,235,0.5)'
  ctx.lineWidth = Math.max(1, w * 0.025)
  ctx.beginPath()
  ctx.moveTo(w * 0.36, w * 0.06); ctx.lineTo(w * 0.5, w * 0.06)
  ctx.moveTo(w * 0.05, w * 0.4); ctx.lineTo(w * 0.05, w * 0.5)
  ctx.stroke()
}

/** Pebbles of a Pebble Wall: cx, cy, rx, ry, rotation, tone 0..1. */
const PEBBLES: ReadonlyArray<readonly [number, number, number, number, number, number]> = [
  [0.14, 0.15, 0.16, 0.125, 0.2, 0.5], [0.47, 0.13, 0.17, 0.12, -0.1, 0.78], [0.82, 0.16, 0.16, 0.13, 0.3, 0.4],
  [-0.02, 0.46, 0.1, 0.14, 0, 0.62], [0.27, 0.45, 0.18, 0.145, -0.2, 0.7], [0.63, 0.45, 0.16, 0.14, 0.15, 0.36],
  [0.95, 0.47, 0.12, 0.15, 0, 0.66],
  [0.11, 0.79, 0.15, 0.135, 0.1, 0.42], [0.44, 0.78, 0.17, 0.14, -0.15, 0.6], [0.79, 0.79, 0.16, 0.135, 0.2, 0.8],
  [0.31, 0.26, 0.05, 0.04, 0.3, 0.9], [0.65, 0.29, 0.055, 0.04, -0.2, 0.3], [0.62, 0.62, 0.05, 0.04, 0.4, 0.85],
  [0.26, 0.63, 0.045, 0.04, 0, 0.35], [0.95, 0.96, 0.08, 0.05, 0, 0.5]
]
/** A little hue drift between pebbles, so the mosaic is not one grey. */
const PEBBLE_TINTS = ['#8f9aa6', '#a1a6ae', '#7c8896', '#9aa3ad', '#b1b8c1', '#8a8e98', '#95a2b0']

/** Pebble Wall — grey-blue pebbles pressed into sand. The heavy one. */
const pebbleWall = (ctx: CanvasRenderingContext2D, p: Palette, w: number): void => {
  // Sand grout, a little damp.
  ctx.fillStyle = '#c9a466'
  ctx.fillRect(0, 0, w, w)
  speckle(ctx, w, 401, 16, 'rgba(120,84,40,0.5)', 0.01, 0.018)
  const lw = Math.max(0.8, w * 0.018)
  PEBBLES.forEach(([x, y, rx, ry, rot, tone], i) => {
    const base = mixHex(PEBBLE_TINTS[i % PEBBLE_TINTS.length]!, tone > 0.5 ? p.light : p.dark, Math.abs(tone - 0.5) * 0.7)
    const X = x * w, Y = y * w, RX = rx * w, RY = ry * w
    // Shadow side first, then the body pulled toward the light, which leaves a
    // crescent of shade on the lower right.
    ctx.fillStyle = mixHex(p.dark, '#3b3f4a', 0.25)
    ctx.beginPath(); ctx.ellipse(X, Y, RX, RY, rot, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = base
    ctx.beginPath(); ctx.ellipse(X - RX * 0.1, Y - RY * 0.14, RX * 0.88, RY * 0.84, rot, 0, Math.PI * 2); ctx.fill()
    // A soft glint up and to the left.
    ctx.fillStyle = 'rgba(255,255,255,0.42)'
    ctx.beginPath(); ctx.ellipse(X - RX * 0.38, Y - RY * 0.42, RX * 0.32, RY * 0.2, rot - 0.3, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = withAlpha(INK, 0.62)
    ctx.lineWidth = lw
    ctx.beginPath(); ctx.ellipse(X, Y, RX, RY, rot, 0, Math.PI * 2); ctx.stroke()
  })
}

/** Castle Gate — crenellated gatehouse, lit arch, popsicle door, a shell. */
const gatehouse = (ctx: CanvasRenderingContext2D, p: Palette, w: number): void => {
  const d = CRENEL_DEPTH * w
  // Merlon tops catch the light; the string course under the battlements.
  ctx.fillStyle = withAlpha(p.light, 0.7)
  ctx.fillRect(0, 0, w, d * 0.55)
  mouldRidges(ctx, w, [0.19], withAlpha('#fffaf0', 0.7), withAlpha(p.dark, 0.6), 5)
  mouldRidges(ctx, w, [0.5, 0.78], withAlpha('#fffaf0', 0.4), withAlpha(p.dark, 0.3), 7)
  speckle(ctx, w, 503, 16, withAlpha(p.dark, 0.45), 0.01, 0.018)

  const cx = w * 0.5
  const spring = w * 0.64
  // Archivolt: a raised band of packed sand around the opening.
  const outer = w * 0.31
  const inner = w * 0.23
  ctx.beginPath()
  ctx.moveTo(cx - outer, w * 1.02)
  ctx.lineTo(cx - outer, spring)
  ctx.arc(cx, spring, outer, Math.PI, 0)
  ctx.lineTo(cx + outer, w * 1.02)
  ctx.closePath()
  ctx.fillStyle = mixHex(p.light, p.mid, 0.3)
  ctx.fill()
  ctx.strokeStyle = withAlpha(p.dark, 0.85)
  ctx.lineWidth = Math.max(1, w * 0.03)
  ctx.stroke()
  // Voussoir joints.
  ctx.strokeStyle = withAlpha(p.dark, 0.5)
  ctx.lineWidth = Math.max(0.8, w * 0.016)
  ctx.beginPath()
  for (let i = 1; i < 6; i++) {
    const a = Math.PI + (i / 6) * Math.PI
    ctx.moveTo(cx + Math.cos(a) * inner, spring + Math.sin(a) * inner)
    ctx.lineTo(cx + Math.cos(a) * outer, spring + Math.sin(a) * outer)
  }
  ctx.stroke()

  // The opening, and the warm light inside it.
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(cx - inner, w * 1.02)
  ctx.lineTo(cx - inner, spring)
  ctx.arc(cx, spring, inner, Math.PI, 0)
  ctx.lineTo(cx + inner, w * 1.02)
  ctx.closePath()
  ctx.fillStyle = '#5a2f14'
  ctx.fill()
  ctx.clip()
  // Brightest low in the doorway, where the light pours out: it is the one
  // warm, glowing hole in the whole castle, and that is how the eye finds it.
  const glow = ctx.createRadialGradient(cx - w * 0.04, w * 0.78, 0, cx - w * 0.04, w * 0.78, w * 0.34)
  glow.addColorStop(0, '#fffbe0')
  glow.addColorStop(0.4, '#ffe27a')
  glow.addColorStop(0.75, withAlpha(p.accent2, 0.95))
  glow.addColorStop(1, 'rgba(236,128,44,0.9)')
  ctx.fillStyle = glow
  ctx.fillRect(cx - inner, spring - inner, inner * 2, w)

  // Popsicle-stick door, standing ajar against the right jamb: two sticks and
  // a batten, in the shadow of the arch.
  const stick = (x: number, y: number, sw: number, sh: number, fill: string): void => {
    roundRectPath(ctx, x, y, sw, sh, Math.min(sw, sh) / 2)
    ctx.fillStyle = fill
    ctx.fill()
    ctx.strokeStyle = withAlpha(INK, 0.8)
    ctx.lineWidth = Math.max(0.8, w * 0.016)
    ctx.stroke()
  }
  const doorTop = w * 0.58
  stick(cx + w * 0.055, doorTop + w * 0.02, w * 0.085, w * 0.46, '#e6c283')
  stick(cx + w * 0.135, doorTop - w * 0.01, w * 0.085, w * 0.48, '#d9b06e')
  stick(cx + w * 0.045, w * 0.76, w * 0.19, w * 0.065, '#e6c283')
  ctx.restore()

  // The seashell over the arch.
  scallop(ctx, cx, w * 0.335, w * 0.1, '#ff9f86', '#e0674f', w)
}

/** A scallop shell, hinge at (x, y), fanning upward. */
const scallop = (
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number,
  fill: string, rib: string, w: number
): void => {
  const lobes = 5
  ctx.beginPath()
  ctx.moveTo(x - r * 0.28, y)
  for (let i = 0; i <= lobes; i++) {
    const a = Math.PI + 0.35 + (i / lobes) * (Math.PI - 0.7)
    const px = x + Math.cos(a) * r
    const py = y - r * 0.12 + Math.sin(a) * r
    if (i === 0) ctx.lineTo(px, py)
    else {
      const am = a - ((Math.PI - 0.7) / lobes) / 2
      ctx.quadraticCurveTo(x + Math.cos(am) * r * 1.16, y - r * 0.12 + Math.sin(am) * r * 1.16, px, py)
    }
  }
  ctx.lineTo(x + r * 0.28, y)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = rib
  ctx.lineWidth = Math.max(0.6, w * 0.012)
  ctx.beginPath()
  for (let i = 1; i < lobes; i++) {
    const a = Math.PI + 0.35 + (i / lobes) * (Math.PI - 0.7)
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(a) * r * 0.92, y - r * 0.12 + Math.sin(a) * r * 0.92)
  }
  ctx.stroke()
  // Hinge ears.
  ctx.fillStyle = fill
  ctx.fillRect(x - r * 0.42, y - r * 0.12, r * 0.84, r * 0.2)
  ctx.strokeStyle = withAlpha(INK, 0.8)
  ctx.lineWidth = Math.max(0.8, w * 0.016)
  ctx.strokeRect(x - r * 0.42, y - r * 0.12, r * 0.84, r * 0.2)
  ctx.beginPath()
  ctx.moveTo(x - r * 0.28, y - r * 0.1)
  for (let i = 0; i <= lobes; i++) {
    const a = Math.PI + 0.35 + (i / lobes) * (Math.PI - 0.7)
    const px = x + Math.cos(a) * r
    const py = y - r * 0.12 + Math.sin(a) * r
    if (i === 0) ctx.lineTo(px, py)
    else {
      const am = a - ((Math.PI - 0.7) / lobes) / 2
      ctx.quadraticCurveTo(x + Math.cos(am) * r * 1.16, y - r * 0.12 + Math.sin(am) * r * 1.16, px, py)
    }
  }
  ctx.lineTo(x + r * 0.28, y - r * 0.1)
  ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - r * 0.62, r * 0.2, r * 0.12, -0.6, 0, Math.PI * 2); ctx.fill()
}

/** Toothpick Wall — golden sand with toothpicks jammed into its face. */
const toothpickWall = (ctx: CanvasRenderingContext2D, p: Palette, w: number): void => {
  mouldRidges(ctx, w, [0.5], withAlpha('#fff6dc', 0.5), withAlpha(p.dark, 0.45), 21)
  speckle(ctx, w, 601, 18, withAlpha(p.dark, 0.5), 0.01, 0.02)
  const lw = Math.max(0.8, w * 0.016)
  for (const [x, y, a] of [[0.2, 0.28, -2.2], [0.52, 0.22, -1.9], [0.83, 0.3, -1.2],
    [0.18, 0.72, -2.5], [0.5, 0.68, -2.0], [0.82, 0.74, -1.4]] as const) {
    const X = x * w, Y = y * w
    // The hole it was pushed into.
    ctx.fillStyle = withAlpha(p.dark, 0.85)
    ctx.beginPath(); ctx.ellipse(X, Y, w * 0.04, w * 0.026, 0, 0, Math.PI * 2); ctx.fill()
    // The stub sticking out toward the viewer: a pale tapered stick.
    const L = w * 0.16
    const ex = X + Math.cos(a) * L
    const ey = Y + Math.sin(a) * L
    const nx = -Math.sin(a) * w * 0.022
    const ny = Math.cos(a) * w * 0.022
    ctx.beginPath()
    ctx.moveTo(X + nx, Y + ny)
    ctx.lineTo(ex + nx * 0.25, ey + ny * 0.25)
    ctx.lineTo(ex - nx * 0.25, ey - ny * 0.25)
    ctx.lineTo(X - nx, Y - ny)
    ctx.closePath()
    ctx.fillStyle = '#f7e4b4'
    ctx.fill()
    ctx.strokeStyle = withAlpha(INK, 0.8)
    ctx.lineWidth = lw
    ctx.stroke()
  }
}

/**
 * A toy's pedestal: moulded sand with a cornice lip at the top. `ridge` adds
 * the faint bucket rib; the plastic that makes it a TOY's plinth is separate.
 */
const plinth = (ctx: CanvasRenderingContext2D, r: Ramp, w: number, seed: number): void => {
  ctx.fillStyle = withAlpha(r.light, 0.65)
  ctx.fillRect(0, 0, w, w * 0.12)
  ctx.fillStyle = withAlpha(r.dark, 0.45)
  ctx.fillRect(0, w * 0.12, w, Math.max(1, w * 0.024))
  mouldRidges(ctx, w, [0.42], withAlpha('#fff6dc', 0.45), withAlpha(r.dark, 0.35), 31 + seed)
  speckle(ctx, w, 701 + seed, 16, withAlpha(r.dark, 0.5), 0.01, 0.018)
  speckle(ctx, w, 761 + seed, 10, 'rgba(255,251,238,0.7)', 0.009, 0.016)
}

/** The toy's plastic band across the plinth, in the toy's own colour. */
const plasticBand = (ctx: CanvasRenderingContext2D, p: Palette, w: number): void => {
  const x = w * 0.06, y = w * 0.64, bw = w * 0.88, bh = w * 0.22, r = w * 0.07
  roundRectPath(ctx, x, y, bw, bh, r)
  ctx.fillStyle = p.mid
  ctx.fill()
  // Lower half in the plastic's shadow tone.
  ctx.save()
  ctx.clip()
  ctx.fillStyle = withAlpha(p.dark, 0.7)
  ctx.fillRect(x, y + bh * 0.58, bw, bh)
  ctx.restore()
  roundRectPath(ctx, x, y, bw, bh, r)
  ctx.strokeStyle = withAlpha(INK, 0.85)
  ctx.lineWidth = Math.max(1, w * 0.024)
  ctx.stroke()
  // Gloss along the top edge — plastic, unlike everything around it.
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineCap = 'round'
  ctx.lineWidth = Math.max(1, w * 0.024)
  ctx.beginPath(); ctx.moveTo(x + bw * 0.1, y + bh * 0.2); ctx.lineTo(x + bw * 0.5, y + bh * 0.2); ctx.stroke()
  // Two studs, the toy-brick tell.
  for (const sx of [0.2, 0.8]) {
    ctx.beginPath(); ctx.arc(w * sx, y + bh * 0.46, w * 0.04, 0, Math.PI * 2)
    ctx.fillStyle = p.light
    ctx.fill()
    ctx.strokeStyle = withAlpha(INK, 0.7)
    ctx.lineWidth = Math.max(0.8, w * 0.014)
    ctx.stroke()
  }
}

/** Frost rime creeping over an Ice Pop's cornice. */
const rime = (ctx: CanvasRenderingContext2D, w: number): void => {
  ctx.fillStyle = 'rgba(230,251,255,0.9)'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(w, 0)
  ctx.lineTo(w, w * 0.12)
  const drips = [[0.86, 0.2], [0.7, 0.14], [0.52, 0.24], [0.34, 0.15], [0.16, 0.21], [0, 0.13]] as const
  let px = w
  for (const [x, dy] of drips) {
    const X = x * w
    ctx.quadraticCurveTo((px + X) / 2, dy * w + w * 0.04, X, w * 0.12)
    px = X
  }
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(92,196,234,0.8)'
  ctx.lineWidth = Math.max(0.8, w * 0.016)
  ctx.stroke()
}

/** The Balloon Launcher's firing pit: a crater ringed in its teal plastic. */
const balloonPit = (ctx: CanvasRenderingContext2D, p: Palette, r: Ramp, w: number): void => {
  const cx = w * 0.5, cy = w * 0.44, rx = w * 0.33, ry = w * 0.16
  ctx.fillStyle = '#6e4a24'
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill()
  // The far wall of the pit, lit.
  ctx.fillStyle = withAlpha(r.mid, 0.9)
  ctx.beginPath(); ctx.ellipse(cx, cy + ry * 0.35, rx * 0.8, ry * 0.55, 0, Math.PI, 0); ctx.fill()
  ctx.lineWidth = w * 0.065
  ctx.strokeStyle = withAlpha(INK, 0.85)
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke()
  ctx.lineWidth = w * 0.045
  ctx.strokeStyle = p.mid
  ctx.stroke()
  ctx.lineWidth = Math.max(1, w * 0.016)
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke()
  // Sand heaped up round the foot of the pit, three mounds of it.
  for (let i = 0; i < 3; i++) {
    const x = w * (0.18 + i * 0.32)
    ctx.beginPath()
    ctx.ellipse(x, w * 0.9, w * 0.2, w * 0.17, 0, Math.PI, 0)
    ctx.closePath()
    ctx.fillStyle = withAlpha(r.light, 0.95)
    ctx.fill()
    ctx.strokeStyle = withAlpha(INK, 0.55)
    ctx.lineWidth = Math.max(0.8, w * 0.016)
    ctx.stroke()
    ctx.fillStyle = withAlpha(r.dark, 0.35)
    ctx.beginPath(); ctx.ellipse(x + w * 0.05, w * 0.88, w * 0.11, w * 0.07, 0, 0, Math.PI * 2); ctx.fill()
  }
}

/**
 * The Paper Flag's plinth: a pastel paper frill round its foot, cut with
 * pinking shears, in the flag's heraldic magenta and gilt. Deliberately NOT a
 * second flag — the fixture on top is the only one, so the frill is a band.
 */
const bunting = (ctx: CanvasRenderingContext2D, p: Palette, w: number): void => {
  const y0 = w * 0.62
  const y1 = w * 0.88
  const teeth = 7
  ctx.beginPath()
  ctx.moveTo(-w * 0.02, y1)
  ctx.lineTo(-w * 0.02, y0 + w * 0.04)
  for (let i = 0; i < teeth; i++) {
    const x0 = (i / teeth) * w
    ctx.lineTo(x0 + w / teeth / 2, y0 - w * 0.03)
    ctx.lineTo(x0 + w / teeth, y0 + w * 0.04)
  }
  ctx.lineTo(w * 1.02, y1)
  ctx.closePath()
  ctx.fillStyle = withAlpha(p.light, 0.95)
  ctx.fill()
  ctx.strokeStyle = withAlpha(INK, 0.7)
  ctx.lineWidth = Math.max(0.8, w * 0.016)
  ctx.stroke()
  // A magenta stripe with gilt dots, like a paper party hat.
  ctx.fillStyle = withAlpha(p.mid, 0.9)
  ctx.fillRect(0, w * 0.72, w, w * 0.07)
  ctx.fillStyle = withAlpha(p.accent, 0.95)
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const x = w * (0.08 + i * 0.168)
    ctx.moveTo(x + w * 0.026, w * 0.755)
    ctx.arc(x, w * 0.755, w * 0.026, 0, Math.PI * 2)
  }
  ctx.fill()
  ctx.strokeStyle = withAlpha(INK, 0.6)
  ctx.lineWidth = Math.max(0.8, w * 0.014)
  ctx.beginPath(); ctx.moveTo(0, y1); ctx.lineTo(w, y1); ctx.stroke()
}

/**
 * The Magic Seashell's plinth: pearly lilac sand that glitters. No shells in
 * it — the glowing shell on top is the only one, and a second would blur the
 * fixture into the body.
 */
const shellInlay = (ctx: CanvasRenderingContext2D, p: Palette, w: number): void => {
  // A mother-of-pearl sheen, in two soft bands.
  ctx.fillStyle = withAlpha(p.mid, 0.28)
  ctx.fillRect(0, w * 0.52, w, w * 0.1)
  ctx.fillStyle = withAlpha(p.accent, 0.18)
  ctx.fillRect(0, w * 0.66, w, w * 0.07)
  // Glitter.
  ctx.fillStyle = withAlpha(p.accent2, 0.95)
  for (const [x, y, r] of [[0.16, 0.3, 0.07], [0.86, 0.36, 0.06], [0.22, 0.82, 0.05], [0.8, 0.8, 0.055], [0.5, 0.9, 0.04]] as const) {
    const X = x * w, Y = y * w, R = r * w, q = R * 0.28
    ctx.beginPath()
    ctx.moveTo(X, Y - R); ctx.lineTo(X + q, Y - q); ctx.lineTo(X + R, Y); ctx.lineTo(X + q, Y + q)
    ctx.lineTo(X, Y + R); ctx.lineTo(X - q, Y + q); ctx.lineTo(X - R, Y); ctx.lineTo(X - q, Y - q)
    ctx.closePath()
    ctx.fill()
  }
  speckle(ctx, w, 811, 12, withAlpha(p.accent2, 0.9), 0.008, 0.014)
}

// ─── Damage: sand crumbling ─────────────────────────────────────────────────
//
// Stage 1 chips an edge and cracks the face; stage 2 knocks whole chunks off
// the corners. The chunks are ERASED from the sprite, so a battered block has a
// battered silhouette — at 14 px that reads where a crack line cannot — and
// grains trickle out of every break.

type Poly = ReadonlyArray<readonly [number, number]>

// Each bite runs well past the body so it takes the outline with it.
const CHIP: Poly = [[0.6, -0.08], [0.67, 0.05], [0.74, 0.09], [0.8, 0.05], [0.87, -0.08]]
const CHUNK_CORNER: Poly = [[-0.08, 0.27], [0.08, 0.22], [0.14, 0.14], [0.22, 0.1], [0.29, -0.08]]
const CHUNK_SIDE: Poly = [[1.08, 0.42], [0.94, 0.48], [0.89, 0.57], [0.93, 0.66], [1.08, 0.72]]

const CRACKS_1: Poly[] = [
  [[0.3, 0], [0.36, 0.14], [0.29, 0.27], [0.4, 0.42], [0.35, 0.54]],
  [[0.36, 0.14], [0.47, 0.2]]
]
const CRACKS_2: Poly[] = [
  ...CRACKS_1,
  [[0.9, 0.57], [0.77, 0.6], [0.7, 0.74], [0.75, 0.86], [0.67, 1]],
  [[0.14, 0.18], [0.21, 0.35], [0.13, 0.5], [0.22, 0.64]],
  [[0.4, 0.42], [0.55, 0.47]]
]

const breakAway = (ctx: CanvasRenderingContext2D, typeId: string, w: number, poly: Poly, r: Ramp): void => {
  // The exposed inner sand along the break, then the bite itself, then an ink
  // edge so the break reads as a broken face and not as a clean cut. The two
  // strokes are held inside the body, or their tails would hang off the block.
  const edge = (): void => { polyPath(ctx, w, poly) }
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.save()
  traceBlockBody(ctx, typeId, w, w * 0.105)
  ctx.clip()
  edge()
  ctx.strokeStyle = withAlpha(r.dark, 0.95)
  ctx.lineWidth = w * 0.1
  ctx.stroke()
  ctx.restore()
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  edge()
  ctx.closePath()
  ctx.fillStyle = '#000'
  ctx.fill()
  ctx.restore()
  ctx.save()
  traceBlockBody(ctx, typeId, w, w * 0.105)
  ctx.clip()
  edge()
  ctx.strokeStyle = withAlpha(INK, 0.9)
  ctx.lineWidth = Math.max(1, w * 0.04)
  ctx.stroke()
  ctx.restore()
}

const trickle = (
  ctx: CanvasRenderingContext2D, w: number, x: number, y: number, n: number, r: Ramp, seed: number
): void => {
  ctx.fillStyle = withAlpha(r.dark, 0.85)
  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const X = (x + (h1(seed + i) - 0.5) * 0.03) * w
    const Y = (y + i * 0.055) * w
    const R = w * (0.014 - i * 0.0012)
    ctx.moveTo(X + R, Y)
    ctx.arc(X, Y, Math.max(0.5, R), 0, Math.PI * 2)
  }
  ctx.fill()
}

export const paintSandDamage = (
  ctx: CanvasRenderingContext2D, typeId: string, r: Ramp, w: number, stage: 1 | 2
): void => {
  const crackInk = typeId === 'stone' ? 'rgba(40,34,30,0.7)' : withAlpha(mixHexToHex(r.dark, INK, 0.55), 0.85)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const c of stage === 1 ? CRACKS_1 : CRACKS_2) {
    polyPath(ctx, w, c)
    ctx.strokeStyle = 'rgba(255,248,226,0.35)'
    ctx.lineWidth = Math.max(1, w * 0.05)
    ctx.stroke()
    polyPath(ctx, w, c)
    ctx.strokeStyle = crackInk
    ctx.lineWidth = Math.max(1, w * 0.026)
    ctx.stroke()
  }
  breakAway(ctx, typeId, w, CHIP, r)
  trickle(ctx, w, 0.74, 0.14, 4, r, 11)
  if (stage === 2) {
    breakAway(ctx, typeId, w, CHUNK_CORNER, r)
    breakAway(ctx, typeId, w, CHUNK_SIDE, r)
    trickle(ctx, w, 0.13, 0.28, 5, r, 23)
    trickle(ctx, w, 0.9, 0.72, 4, r, 37)
    // A little heap of what already fell, against the foot of the block.
    ctx.fillStyle = withAlpha(r.dark, 0.7)
    ctx.beginPath(); ctx.ellipse(w * 0.3, w, w * 0.14, w * 0.06, 0, Math.PI, 0); ctx.fill()
  }
}

/** `mixHex` hands back `rgb()`; the helpers here want a hex string. */
const mixHexToHex = (a: string, b: string, t: number): string => {
  const m = mixHex(a, b, t).match(/\d+/g)!
  return '#' + m.slice(0, 3).map((v) => Number(v).toString(16).padStart(2, '0')).join('')
}

// ─── Roof cap: the upside-down red bucket ───────────────────────────────────
//
// Same footprint as the gable it replaces: the rim overhangs the cell by a
// tenth either side and sits on the same eaves shadow (0.62 cells). A bucket is
// taller than a gable, so its castle-mould top stands 0.54 over the block where
// the ridge stood at 0.42 — only ever over sky, since nothing is built on a
// roof. Red, because no block wears red — "can I build on this?" is one glance.
// The bucket's own castle-mould bottom makes it read as the turret it builds.
//
// Baked per size: the old gable was six live canvas ops per roof per frame,
// and the bucket has more parts than that, so it is a bitmap and one blit.

interface RoofSprite { cv: HTMLCanvasElement; ox: number; oy: number }
const roofCache = new Map<number, RoofSprite>()
const ROOF_CACHE_MAX = 16

const RED = { light: '#ff7b68', mid: '#e5483b', dark: '#a9261c' }

const bakeRoof = (s: number): RoofSprite => {
  const halfW = s * 0.62
  // A bucket is taller than a gable is: its castle-mould top stands 0.5 of a
  // cell over the block where the ridge stood at 0.42. Nothing is ever built
  // on a roofed block, so the extra height only ever covers sky.
  const peak = s * 0.54
  const pad = Math.ceil(s * 0.06 + 2)
  const cv = document.createElement('canvas')
  cv.width = Math.ceil(halfW * 2 + pad * 2)
  cv.height = Math.ceil(peak + s * 0.14 + pad * 2)
  const c = cv.getContext('2d')!
  // Local frame: x = 0 at the cell centre, y = 0 at the block's top edge.
  const ox = pad + halfW
  const oy = pad + peak
  c.translate(ox, oy)
  const lw = Math.max(1, s * 0.045)

  // Eaves shadow on the block below.
  c.fillStyle = 'rgba(40,20,10,0.28)'
  c.beginPath()
  c.moveTo(-halfW, s * 0.06); c.lineTo(halfW, s * 0.06)
  c.lineTo(halfW * 0.86, s * 0.13); c.lineTo(-halfW * 0.86, s * 0.13)
  c.closePath(); c.fill()

  const rimY = s * 0.06
  const rimH = s * 0.12
  const bodyBot = rimY - rimH
  const mer = s * 0.11
  const top = -peak + mer
  const botHalf = s * 0.47
  const topHalf = s * 0.33
  // Body with a castle-mould top: three merlons.
  const gap = s * 0.075
  const mw = (topHalf * 2 - gap * 2) / 3
  const body = (): void => {
    c.beginPath()
    c.moveTo(-botHalf, bodyBot)
    c.lineTo(-topHalf, top)
    let x = -topHalf
    for (let i = 0; i < 3; i++) {
      c.lineTo(x, top - mer)
      c.lineTo(x + mw, top - mer)
      c.lineTo(x + mw, top)
      x += mw
      if (i < 2) { c.lineTo(x + gap, top); x += gap }
    }
    c.lineTo(topHalf, top)
    c.lineTo(botHalf, bodyBot)
    c.closePath()
  }
  body()
  const g = c.createLinearGradient(-botHalf, 0, botHalf, 0)
  g.addColorStop(0, RED.light)
  g.addColorStop(0.42, RED.mid)
  g.addColorStop(1, RED.dark)
  c.fillStyle = g
  c.fill()
  // Merlon tops a touch lighter, a moulded rib just above the rim, and the
  // mould's own relief: a little arched window, so the bucket reads as the
  // turret it makes.
  c.save()
  body(); c.clip()
  c.fillStyle = 'rgba(255,255,255,0.18)'
  c.fillRect(-topHalf, top - mer, topHalf * 2, mer * 0.4)
  const ribY = bodyBot - s * 0.065
  c.strokeStyle = 'rgba(120,20,14,0.55)'
  c.lineWidth = Math.max(1, s * 0.032)
  c.beginPath(); c.moveTo(-botHalf, ribY); c.lineTo(botHalf, ribY); c.stroke()
  c.strokeStyle = 'rgba(255,190,180,0.5)'
  c.lineWidth = Math.max(1, s * 0.018)
  c.beginPath(); c.moveTo(-botHalf, ribY - s * 0.026); c.lineTo(botHalf, ribY - s * 0.026); c.stroke()
  const winW = s * 0.055
  const winTop = top + s * 0.07
  const winBot = ribY - s * 0.05
  c.beginPath()
  c.moveTo(-winW, winBot)
  c.lineTo(-winW, winTop + winW)
  c.arc(0, winTop + winW, winW, Math.PI, 0)
  c.lineTo(winW, winBot)
  c.closePath()
  c.fillStyle = '#8e1d15'
  c.fill()
  c.strokeStyle = 'rgba(255,170,160,0.55)'
  c.lineWidth = Math.max(1, s * 0.016)
  c.beginPath(); c.moveTo(winW + s * 0.012, winTop + winW); c.lineTo(winW + s * 0.012, winBot); c.stroke()
  // Plastic gloss: a bright stripe down the lit side.
  c.fillStyle = 'rgba(255,255,255,0.5)'
  c.beginPath()
  c.moveTo(-topHalf * 0.62, top + s * 0.03)
  c.lineTo(-topHalf * 0.4, top + s * 0.03)
  c.lineTo(-botHalf * 0.5, bodyBot - s * 0.02)
  c.lineTo(-botHalf * 0.72, bodyBot - s * 0.02)
  c.closePath(); c.fill()
  c.restore()
  body()
  c.strokeStyle = withAlpha(INK, 0.95)
  c.lineWidth = lw
  c.lineJoin = 'round'
  c.stroke()

  // The rolled rim.
  const rimHalf = s * 0.6
  roundRectPath(c, -rimHalf, bodyBot, rimHalf * 2, rimH, rimH * 0.5)
  c.fillStyle = RED.mid
  c.fill()
  c.fillStyle = 'rgba(255,255,255,0.35)'
  c.fillRect(-rimHalf * 0.8, bodyBot + rimH * 0.18, rimHalf * 1.1, rimH * 0.22)
  roundRectPath(c, -rimHalf, bodyBot, rimHalf * 2, rimH, rimH * 0.5)
  c.strokeStyle = withAlpha(INK, 0.95)
  c.lineWidth = lw
  c.stroke()
  // Handle lugs.
  for (const sx of [-1, 1]) {
    c.beginPath(); c.arc(sx * botHalf * 0.84, bodyBot - s * 0.07, s * 0.04, 0, Math.PI * 2)
    c.fillStyle = RED.dark
    c.fill()
    c.strokeStyle = withAlpha(INK, 0.8)
    c.lineWidth = Math.max(0.8, s * 0.02)
    c.stroke()
  }
  return { cv, ox, oy }
}

/**
 * Draw the roof cap for the cell centred at (cx, cy). The bucket's rim sits on
 * the block's top edge and the whole cap overhangs it, exactly as the gable did.
 */
export const drawBucketRoof = (
  ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number
): void => {
  const q = Math.max(6, Math.round(size))
  let sp = roofCache.get(q)
  if (!sp) {
    sp = bakeRoof(q)
    roofCache.set(q, sp)
    if (roofCache.size > ROOF_CACHE_MAX) {
      const first = roofCache.keys().next().value
      if (first !== undefined && first !== q) roofCache.delete(first)
    }
  }
  const k = size / q
  ctx.drawImage(sp.cv, cx - sp.ox * k, cy - size * 0.5 - sp.oy * k, sp.cv.width * k, sp.cv.height * k)
}

/**
 * The roof cap's silhouette as ONE path, for the places that draw it flat —
 * the build tray's shape preview. `y` is the block's top edge; the path is left
 * open for the caller to fill and stroke in its own colours. `tall` squashes it
 * vertically, for a thumbnail that only reserved a gable's worth of headroom.
 */
export const bucketCapPath = (
  ctx: CanvasRenderingContext2D, cx: number, y: number, s: number, tall = 1
): void => {
  const rimHalf = s * 0.6
  const botHalf = s * 0.47
  const topHalf = s * 0.33
  const rimTop = y - s * 0.06 * tall
  const top = y - s * 0.43 * tall
  const mer = s * 0.11 * tall
  const gap = s * 0.075
  const mw = (topHalf * 2 - gap * 2) / 3
  ctx.beginPath()
  ctx.moveTo(cx - rimHalf, y + s * 0.06)
  ctx.lineTo(cx + rimHalf, y + s * 0.06)
  ctx.lineTo(cx + rimHalf, rimTop)
  ctx.lineTo(cx + botHalf, rimTop)
  ctx.lineTo(cx + topHalf, top)
  let x = cx + topHalf
  for (let i = 0; i < 3; i++) {
    ctx.lineTo(x, top - mer)
    ctx.lineTo(x - mw, top - mer)
    ctx.lineTo(x - mw, top)
    x -= mw
    if (i < 2) { ctx.lineTo(x - gap, top); x -= gap }
  }
  ctx.lineTo(cx - botHalf, rimTop)
  ctx.lineTo(cx - rimHalf, rimTop)
  ctx.closePath()
}

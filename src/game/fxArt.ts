/**
 * ─── Sandbox Tower: toy rounds and splashes ─────────────────────────────────
 *
 * The drawn half of the backyard siege's ammunition. Everything a gun throws
 * is a toy or a piece of the garden now — foam darts, water blobs, mud balls,
 * water balloons, toothpicks, pebbles, honey bombs, embers — and every one of
 * them is drawn in the house style the bugs are drawn in: flat cel tones lit
 * from the upper left under a broken ink line, never a gradient.
 *
 * Light is applied in SCREEN space. A round turns to its heading, but the sun
 * does not turn with it: the contour is rotated in JS and the highlight stays
 * up and to the left, so a water blob diving at a bug still shines on top.
 *
 * Nothing in here allocates a canvas or a gradient. Each round is a handful of
 * short point lists and fills per frame, cheaper than the iron and powder it
 * replaced (the old smoke trail was an inked blob per trail sample).
 */
import { blob, fillShape, ink, noise2, shrink, stroke as inkStroke, type Pt } from '@/game/inkArt'

/** The house ink (`#3b2a21`). */
export const FX_INK = '#3b2a21'

export interface OrbPal { deep: string; mid: string; lit: string; line: string }

/** Squirt-gun water — deeper than the moat so a blob still reads on the sky. */
export const WATER_ORB: OrbPal = { deep: '#1a78a8', mid: '#3cbde2', lit: '#b4f4fa', line: '#0c3550' }
export const PEBBLE_ORB: OrbPal = { deep: '#6e7782', mid: '#9aa3ad', lit: '#d5dbe0', line: '#262a31' }
export const CLOD_ORB: OrbPal = { deep: '#a8793c', mid: '#dcb472', lit: '#f6e2ae', line: '#4a3015' }
export const MUD_ORB: OrbPal = { deep: '#57391c', mid: '#876036', lit: '#bb8e57', line: '#22150a' }
export const HONEY_ORB: OrbPal = { deep: '#c5700a', mid: '#f5a51d', lit: '#ffdb66', line: '#4a2604' }

/** Water-balloon rubber: pink, blue, green, yellow — picked per round. */
export const BALLOON_ORBS: OrbPal[] = [
  { deep: '#c23b7c', mid: '#ff6fae', lit: '#ffc4de', line: '#461329' },
  { deep: '#1c56aa', mid: '#2f7de1', lit: '#a2cbff', line: '#0e244c' },
  { deep: '#26812e', mid: '#43b649', lit: '#b2e9a8', line: '#103613' },
  { deep: '#cf9010', mid: '#ffc93c', lit: '#fff1a8', line: '#4a3004' }
]
/** The same four, as particle colours for the rubber a popped balloon sheds. */
export const BALLOON_RGB: [number, number, number][] = [
  [255, 111, 174], [47, 125, 225], [67, 182, 73], [255, 201, 60]
]

// ─── Small helpers ──────────────────────────────────────────────────────────

/** Rotate a local point list by `ang` and move it to (x, y), in place. */
const place = (pts: Pt[], x: number, y: number, ang: number): Pt[] => {
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  for (const p of pts) {
    const px = p[0]
    const py = p[1]
    p[0] = x + px * c - py * s
    p[1] = y + px * s + py * c
  }
  return pts
}

/** A hard-cornered polygon. `fillShape` rounds every corner — right for a
 *  blob, wrong for a moulded plastic toy. */
const poly = (ctx: CanvasRenderingContext2D, pts: Pt[], color: string): void => {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(pts[0]![0], pts[0]![1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]![0], pts[i]![1])
  ctx.closePath()
  ctx.fill()
}

const dot = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void => {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, Math.max(0.4, r), 0, Math.PI * 2)
  ctx.fill()
}

/** Three cel tones and an ink line over a contour already in screen space. */
const litBody = (
  ctx: CanvasRenderingContext2D, body: Pt[], cx: number, cy: number, r: number,
  pal: OrbPal, seed: number, inked: boolean, lineK = 0.3
): void => {
  fillShape(ctx, body, pal.deep)
  fillShape(ctx, shrink(body, 0.8, cx - r * 0.5, cy - r * 0.6), pal.mid)
  fillShape(ctx, shrink(body, 0.34, cx - r * 0.62, cy - r * 0.7), pal.lit)
  if (inked) ink(ctx, body, { width: Math.max(1, r * lineK), color: pal.line, breakUp: 0.3, seed: seed + 2 })
}

/** A glossy pip — one hard white dot is what makes wet or rubber read wet. */
const gloss = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void => {
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(x - r * 0.42, y - r * 0.46, r * 0.2, r * 0.13, -0.6, 0, Math.PI * 2)
  ctx.fill()
}

const ease = (u: number): number => 1 - Math.pow(1 - Math.min(1, Math.max(0, u)), 3)

// ─── Shafted rounds (drawn in local space, pointing +x) ─────────────────────

/**
 * A foam dart: orange foam shaft, blue suction cup, two little fins.
 *
 * Same footprint as the arrow it replaces (−1.75u … +2.5u around the origin),
 * because a projectile is positioned by its point of impact and the volley
 * stands landed darts on that point. Fatter than an arrow — foam is — which is
 * also what keeps it readable against pale sand at 10 px.
 *
 * `rich` gates the ink, the expensive pass: a Dart Rain draws seventy.
 */
export const drawFoamDart = (
  ctx: CanvasRenderingContext2D, u: number, seed: number, rich: boolean
): void => {
  const h = u * 0.32
  const x0 = -u * 1.55
  const x1 = u * 1.4

  // Fins first, so the shaft sits over their roots.
  for (const f of [-1, 1]) {
    poly(ctx, [[-u * 0.85, f * h], [-u * 1.75, f * u * 0.82], [-u * 1.58, f * h]], '#2f7de1')
  }
  poly(ctx, [[-u * 0.95, -h], [-u * 1.7, -u * 0.74], [-u * 1.6, -u * 0.6]], '#8fbcff')

  // Foam shaft: a capsule with a rounded tail.
  ctx.fillStyle = '#f07420'
  ctx.beginPath()
  ctx.moveTo(x1, -h)
  ctx.lineTo(x0, -h)
  ctx.arc(x0, 0, h, -Math.PI / 2, Math.PI / 2, true)
  ctx.lineTo(x1, h)
  ctx.closePath()
  ctx.fill()
  // Lit top band and a pale stripe, so the cylinder reads round.
  ctx.fillStyle = '#ff9a3c'
  ctx.fillRect(x0, -h, x1 - x0, h * 1.15)
  ctx.fillStyle = '#ffc990'
  ctx.fillRect(x0 + u * 0.1, -h * 0.72, x1 - x0 - u * 0.2, h * 0.34)

  // Suction cup: a short neck and a flared bell.
  poly(ctx, [[x1 - u * 0.05, -u * 0.22], [u * 1.62, -u * 0.22], [u * 1.62, u * 0.22], [x1 - u * 0.05, u * 0.22]], '#1d58ad')
  const cup: Pt[] = [
    [u * 1.56, -u * 0.26], [u * 2.18, -u * 0.62], [u * 2.4, -u * 0.52],
    [u * 2.4, u * 0.52], [u * 2.18, u * 0.62], [u * 1.56, u * 0.26]
  ]
  poly(ctx, cup, '#2f7de1')
  poly(ctx, [[u * 1.6, -u * 0.24], [u * 2.16, -u * 0.56], [u * 2.3, -u * 0.5], [u * 2.3, -u * 0.08], [u * 1.6, -u * 0.06]], '#6fa9ff')
  // The cup's rim: a dark lip across the front face.
  ctx.fillStyle = '#123b78'
  ctx.fillRect(u * 2.3, -u * 0.52, u * 0.12, u * 1.04)

  if (rich) {
    const outline: Pt[] = [
      [x0, -h], [x1, -h], [u * 1.56, -u * 0.26], [u * 2.18, -u * 0.62], [u * 2.4, -u * 0.52],
      [u * 2.4, u * 0.52], [u * 2.18, u * 0.62], [u * 1.56, u * 0.26], [x1, h], [x0, h],
      [x0 - h * 0.7, h * 0.7], [x0 - h, 0], [x0 - h * 0.7, -h * 0.7]
    ]
    ink(ctx, outline, { width: u * 0.16, color: FX_INK, breakUp: 0.25, seed: seed + 7 })
  }
}

/**
 * A party toothpick — the rubber-band crossbow's bolt.
 *
 * Set against the dart on purpose: thin where the dart is fat, pale wood where
 * the dart is bright plastic, sharp at BOTH ends, and carrying a red cellophane
 * frill at the tail. The frill is the tell: the one shot the player has to see
 * coming wears the one hot colour on it.
 */
export const drawToothpick = (
  ctx: CanvasRenderingContext2D, u: number, seed: number, rich: boolean
): void => {
  const w = u * 0.26
  const pick: Pt[] = [[-u * 1.5, 0], [-u * 1.0, -w], [u * 1.5, -w], [u * 2.05, 0], [u * 1.5, w], [-u * 1.0, w]]
  poly(ctx, pick, '#d9b06c')
  poly(ctx, [[-u * 1.2, -w * 0.4], [-u * 1.0, -w], [u * 1.5, -w], [u * 1.85, -w * 0.4]], '#f6dfae')
  if (rich) ink(ctx, pick, { width: u * 0.13, color: FX_INK, breakUp: 0.3, seed: seed + 3 })

  // Cellophane frill — a ragged rosette of cut ribbon round the tail.
  const cx = -u * 0.72
  const rr = u * 0.66
  const frill: Pt[] = []
  const n = 12
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const r = i % 2 ? rr * 0.46 : rr * (0.86 + noise2(i * 1.3, seed, seed) * 0.28)
    frill.push([cx + Math.cos(a) * r * 0.62, Math.sin(a) * r])
  }
  poly(ctx, frill, '#e5483b')
  dot(ctx, cx - rr * 0.12, -rr * 0.2, rr * 0.26, '#ff9a8e')
  if (rich) ink(ctx, frill, { width: u * 0.11, color: FX_INK, breakUp: 0.4, seed: seed + 9 })
}

// ─── Round bodies (screen space) ────────────────────────────────────────────

/**
 * A squirt-gun water blob: a droplet whose tail points back along its flight.
 * `ang` is the SCREEN heading.
 */
export const drawWaterBlob = (
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number, ang: number,
  seed: number, rich: boolean, t: number
): void => {
  // A slow jelly wobble — water in flight is never quite round.
  const jig = 1 + Math.sin(t / 70 + seed) * 0.06
  const pts: Pt[] = []
  const n = rich ? 20 : 14
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const bx = Math.cos(a)
    const by = Math.sin(a)
    const k = Math.max(0, -bx)
    pts.push([r * bx * (1 + 0.95 * k * k) * jig, r * by * (1 - 0.4 * Math.pow(k, 1.5)) / jig])
  }
  place(pts, x, y, ang)
  litBody(ctx, pts, x, y, r, WATER_ORB, seed, rich, 0.3)
  gloss(ctx, x, y, r * 1.2)
}

/** A catapult's pebble, or — every third throw — a crumbling sand clod. */
export const drawPebble = (
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number, spin: number,
  seed: number, rich: boolean, clod: boolean
): void => {
  const body = place(blob(0, 0, r, r * (clod ? 0.9 : 0.78), seed, clod ? 0.24 : 0.08, clod ? 2.9 : 1.6, rich ? 18 : 12), x, y, spin)
  litBody(ctx, body, x, y, r, clod ? CLOD_ORB : PEBBLE_ORB, seed, rich, 0.32)
  if (clod) {
    // Grains shaken loose, riding along with it.
    for (let i = 0; i < 3; i++) {
      const a = spin * 0.7 + i * 2.1
      dot(ctx, x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.2, r * 0.14, i ? '#b88c4c' : '#f6e2ae')
    }
  } else if (rich) {
    // One speckle: pebbles are never flat grey.
    dot(ctx, x + Math.cos(spin) * r * 0.35, y + Math.sin(spin) * r * 0.3, r * 0.12, '#5c646e')
  }
}

/** The mud mortar's round: a lumpy wet ball flicking two drips behind it. */
export const drawMudBall = (
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number, ang: number,
  seed: number, rich: boolean
): void => {
  const bx = -Math.cos(ang)
  const by = -Math.sin(ang)
  for (let i = 0; i < 2; i++) {
    const d = r * (1.25 + i * 0.6)
    const dr = r * (0.34 - i * 0.12)
    fillShape(ctx, blob(x + bx * d, y + by * d, dr, dr * 0.8, seed + i * 3, 0.2, 2, 10), MUD_ORB.deep)
  }
  const body = blob(x, y, r, r * 0.92, seed, 0.2, 2.8, rich ? 20 : 12)
  litBody(ctx, body, x, y, r, MUD_ORB, seed, rich, 0.3)
  // Wet shine.
  dot(ctx, x - r * 0.4, y - r * 0.42, r * 0.14, '#d9b98a')
}

/**
 * A water balloon: rubber in one of four toy colours, knot trailing, squashing
 * and stretching as it flies.
 */
export const drawBalloon = (
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number, ang: number,
  hue: number, seed: number, rich: boolean, t: number
): void => {
  const pal = BALLOON_ORBS[((hue % 4) + 4) % 4]!
  const sq = Math.sin(t / 65 + seed) * 0.07
  const rx = r * 1.12 * (1 + sq)
  const ry = r * 0.96 * (1 - sq)
  const n = rich ? 20 : 14
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const bx = Math.cos(a)
    // Pinched toward the knot (the tail, −x).
    const pinch = 1 - 0.28 * Math.pow(Math.max(0, -bx), 2)
    pts.push([bx * rx, Math.sin(a) * ry * pinch])
  }
  place(pts, x, y, ang)
  // The knot, then its tied-off lip.
  const knot = place([[-rx * 0.9, -r * 0.16], [-rx * 1.24, -r * 0.2], [-rx * 1.24, r * 0.2], [-rx * 0.9, r * 0.16]], x, y, ang)
  poly(ctx, knot, pal.deep)
  const kx = x - Math.cos(ang) * rx * 1.3
  const ky = y - Math.sin(ang) * rx * 1.3
  dot(ctx, kx, ky, r * 0.15, pal.mid)
  litBody(ctx, pts, x, y, r, pal, seed, rich, 0.28)
  gloss(ctx, x, y, r * 1.25)
  if (rich) dot(ctx, x - r * 0.12, y - r * 0.62, r * 0.07, '#ffffff')
}

/** A bumblebee's honey bomb: a golden drop with honey hanging off its belly. */
export const drawHoneyBomb = (
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number,
  seed: number, rich: boolean, t: number
): void => {
  // Drips hang DOWN whatever the bomb is doing — gravity, not the heading.
  const drips: [number, number, number][] = [[-0.45, 0.55, 0.2], [0.08, 0.9, 0.24], [0.5, 0.42, 0.16]]
  for (let i = 0; i < drips.length; i++) {
    const [dx, len0, w0] = drips[i]!
    const len = r * len0 * (0.85 + 0.15 * Math.sin(t / 120 + i * 1.7))
    const w = r * w0
    const px = x + dx * r
    const top = y + r * 0.35
    const bot = top + r * 0.5 + len
    ctx.fillStyle = HONEY_ORB.deep
    ctx.beginPath()
    ctx.moveTo(px - w, top)
    ctx.lineTo(px - w * 0.7, bot)
    ctx.arc(px, bot, w * 0.95, Math.PI, 0, true)
    ctx.lineTo(px + w, top)
    ctx.closePath()
    ctx.fill()
    dot(ctx, px - w * 0.3, bot - w * 0.2, w * 0.35, HONEY_ORB.lit)
  }
  const body = blob(x, y, r, r * 0.94, seed, 0.08, 2, rich ? 20 : 12)
  litBody(ctx, body, x, y, r, HONEY_ORB, seed, rich, 0.3)
  gloss(ctx, x, y, r * 1.2)
}

/** A glowing ember — the firefly's drop, and the catapult's late pitch shot. */
export const drawEmberCore = (
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number, spin: number,
  seed: number, rich: boolean
): void => {
  const body = place(blob(0, 0, r, r * 0.8, seed, 0.26, 2.8, rich ? 16 : 10), x, y, spin)
  fillShape(ctx, body, '#3a130a')
  fillShape(ctx, shrink(body, 0.72, x - r * 0.3, y - r * 0.3), '#a42c0e')
  fillShape(ctx, shrink(body, 0.4, x - r * 0.35, y - r * 0.4), '#ff8a2b')
  dot(ctx, x - r * 0.28, y - r * 0.32, r * 0.18, '#fff0b0')
  if (rich) ink(ctx, body, { width: Math.max(1, r * 0.28), color: '#200a04', breakUp: 0.35, seed: seed + 2 })
}

// ─── Trails ─────────────────────────────────────────────────────────────────

/**
 * A trail of loose matter — droplets, grains, flecks — one dot per sample,
 * shrinking and thinning toward the tail. Replaces the powder-smoke lobes the
 * cannon and mortar used to leave: water does not smoke.
 */
export const dropTrail = (
  ctx: CanvasRenderingContext2D, pts: number[], toX: (x: number) => number, toY: (y: number) => number,
  r0: number, color: string, accent: string | null, sag: number, step: number
): void => {
  const n = pts.length / 2
  if (n < 3) return
  for (let i = 0; i < n - 1; i += step) {
    // 1 at the oldest sample, 0 at the round.
    const age = 1 - i / (n - 1)
    const r = r0 * (1 - age * 0.65)
    if (r < 0.5) continue
    ctx.globalAlpha = 0.85 * (1 - age * 0.8)
    const px = toX(pts[i * 2]!)
    // Older drops have had longer to fall off the line.
    const py = toY(pts[i * 2 + 1]!) + sag * age * age
    dot(ctx, px, py, r, accent && i % 4 === 0 ? accent : color)
  }
  ctx.globalAlpha = 1
}

// ─── Impact shapes (ctx already translated to the hit) ──────────────────────

export interface SplashPal { core: string; mid: string; deep: string; ink: string; smoke: string }

/** A cartoon splash crown: spiky, taller on top, the way thrown water climbs. */
const splashStar = (br: number, seed: number, tongues: number, n: number): Pt[] => {
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const s = Math.sin(a)
    const tongue = Math.pow(Math.abs(Math.cos(a * tongues * 0.5 + seed * 0.37)), 0.7)
    const lift = 1 + 0.4 * Math.max(0, -s)
    const r = br * (0.58 + 0.46 * tongue * lift * (0.8 + noise2(i * 0.9, seed, seed) * 0.4))
    pts.push([Math.cos(a) * r, s * r * 0.86])
  }
  return pts
}

/** Round drops thrown from a hit, falling as they go. */
const flingDrops = (
  ctx: CanvasRenderingContext2D, u: number, R: number, stable: number, pal: SplashPal,
  n: number, up: boolean, big: number, rich: boolean
): void => {
  const a0 = 1 - Math.max(0, (u - 0.55) / 0.45)
  if (a0 <= 0.03) return
  const alpha = ctx.globalAlpha
  ctx.globalAlpha = alpha * a0
  for (let i = 0; i < n; i++) {
    const j = noise2(i * 1.7, stable, stable)
    const k = noise2(i * 2.9 + 4, stable, stable)
    const a = up
      ? -Math.PI / 2 + (i / Math.max(1, n - 1) - 0.5) * 3.1 + (j - 0.5) * 0.7
      : (i / n) * Math.PI * 2 + stable * 0.7 + (j - 0.5) * 0.5
    // Uneven throw: some drops barely leave, some fly — a ring of equal beads
    // reads as a decoration, not as thrown water.
    const d = R * (0.45 + ease(u * 1.5) * 1.35) * (0.45 + k * 1.1)
    const gx = Math.cos(a) * d
    const gy = Math.sin(a) * d * (up ? 1 : 0.8) + R * 1.3 * u * u
    const dr = R * big * (0.55 + j * 0.9) * (1 - u * 0.45)
    if (dr < 0.6) continue
    if (rich) dot(ctx, gx, gy, dr + Math.max(0.6, dr * 0.3), pal.ink)
    dot(ctx, gx, gy, dr, pal.mid)
    dot(ctx, gx - dr * 0.3, gy - dr * 0.35, dr * 0.35, pal.core)
  }
  ctx.globalAlpha = alpha
}

/**
 * Water hitting something: a broken ring, a spiky crown in three tones, and
 * drops thrown up and falling. No fire and no smoke — it is water.
 */
export const drawSplashBlast = (
  ctx: CanvasRenderingContext2D, u: number, R: number, seed: number, stable: number,
  pal: SplashPal, rich: boolean
): void => {
  const alpha = ctx.globalAlpha
  const ringA = 1 - u * 1.8
  if (ringA > 0.03) {
    const rr = R * (0.5 + ease(u * 2.2) * 1.15)
    ctx.globalAlpha = alpha * ringA * 0.8
    ink(ctx, blob(0, 0, rr, rr * 0.6, seed + 3, 0.14, 2.2, 28), {
      width: Math.max(1.2, R * 0.1 * (1 - u * 0.7)), color: pal.deep, breakUp: 0.5, seed: seed + 11
    })
  }
  const bodyA = u < 0.42 ? 1 : Math.max(0, 1 - (u - 0.42) / 0.4)
  if (bodyA > 0.03) {
    const br = R * (0.42 + ease(u * 2) * 0.62)
    const crown = splashStar(br, stable, 7, rich ? 30 : 20)
    ctx.globalAlpha = alpha * bodyA
    fillShape(ctx, crown, pal.deep)
    fillShape(ctx, shrink(crown, 0.74, -br * 0.1, -br * 0.18), pal.mid)
    fillShape(ctx, shrink(crown, 0.3, -br * 0.25, -br * 0.32), pal.core)
    if (rich) ink(ctx, crown, { width: br * 0.12, color: pal.ink, breakUp: 0.35, seed: seed + 2 })
  }
  ctx.globalAlpha = alpha
  flingDrops(ctx, u, R, stable, pal, rich ? 8 : 5, true, 0.13, rich)
}

/**
 * Something sticky landing — mud, honey. A flat splat with knobs, gobs thrown
 * out, and (for honey) drips sagging off the underside.
 */
export const drawSplatBlast = (
  ctx: CanvasRenderingContext2D, u: number, R: number, seed: number, stable: number,
  pal: SplashPal, rich: boolean, drippy: boolean
): void => {
  const alpha = ctx.globalAlpha
  const bodyA = u < 0.55 ? 1 : Math.max(0, 1 - (u - 0.55) / 0.45)
  if (bodyA > 0.03) {
    const br = R * (0.48 + ease(u * 2.4) * 0.5)
    ctx.globalAlpha = alpha * bodyA
    if (drippy) {
      for (let k = 0; k < 2; k++) {
        const dx = (k ? 0.38 : -0.3) * br
        const len = br * (0.25 + ease(u * 1.4) * 0.9) * (k ? 0.7 : 1)
        const w = br * 0.14
        ctx.fillStyle = pal.deep
        ctx.beginPath()
        ctx.moveTo(dx - w, br * 0.3)
        ctx.lineTo(dx - w * 0.75, br * 0.5 + len)
        ctx.arc(dx, br * 0.5 + len, w * 0.9, Math.PI, 0, true)
        ctx.lineTo(dx + w, br * 0.3)
        ctx.closePath()
        ctx.fill()
      }
    }
    // Knobs round the rim, fixed to the blast so they do not hop between holds.
    for (let i = 0; i < 5; i++) {
      const j = noise2(i * 2.3, stable, stable)
      const a = (i / 5) * Math.PI * 2 + stable * 0.9
      const d = br * (0.95 + j * 0.35) * ease(u * 2.4)
      const kr = br * (0.14 + j * 0.12)
      dot(ctx, Math.cos(a) * d, Math.sin(a) * d * 0.75, kr, pal.deep)
    }
    const splat = blob(0, 0, br, br * 0.76, seed, 0.3, 3.1, rich ? 28 : 18)
    fillShape(ctx, splat, pal.deep)
    fillShape(ctx, shrink(splat, 0.7, -br * 0.15, -br * 0.2), pal.mid)
    fillShape(ctx, shrink(splat, 0.26, -br * 0.3, -br * 0.34), pal.core)
    if (rich) ink(ctx, splat, { width: br * 0.13, color: pal.ink, breakUp: 0.3, seed: seed + 2 })
    // Wet shine: two hard pips are what separate mud from a rock.
    dot(ctx, -br * 0.34, -br * 0.36, br * 0.09, '#ffffff')
    dot(ctx, br * 0.22, -br * 0.18, br * 0.05, '#ffffff')
  }
  ctx.globalAlpha = alpha
  flingDrops(ctx, u, R, stable, pal, rich ? 6 : 4, false, 0.16, rich)
}

/**
 * A puff of sand: lobes that swell and lift, lit on top and inked only on the
 * underside, with a few grains flicked out. What a pebble, a clod, a toothpick
 * or a crumbling block throws when it lands on the castle.
 */
export const drawPuffBlast = (
  ctx: CanvasRenderingContext2D, u: number, R: number, stable: number,
  pal: SplashPal, rich: boolean
): void => {
  const alpha = ctx.globalAlpha
  const a = (u < 0.3 ? Math.min(1, u * 6) : Math.max(0, 1 - (u - 0.3) / 0.7)) * 0.9
  if (a > 0.03) {
    ctx.globalAlpha = alpha * a
    const n = rich ? 4 : 3
    for (let i = 0; i < n; i++) {
      const j = noise2(i * 3.1, stable, stable)
      const ang = (i / n) * Math.PI * 2 + stable * 0.7
      const d = R * (0.18 + ease(u * 1.6) * 0.65)
      const pr = R * (0.4 + j * 0.22) * (0.7 + u * 0.6)
      const px = Math.cos(ang) * d
      const py = Math.sin(ang) * d * 0.6 - u * R * 0.5
      const puff = blob(px, py, pr, pr * 0.84, stable + i * 5, 0.2, 2.4, rich ? 20 : 14)
      fillShape(ctx, puff, pal.deep)
      fillShape(ctx, shrink(puff, 0.64, px - pr * 0.3, py - pr * 0.36), pal.mid)
      if (rich) {
        ink(ctx, puff, {
          width: pr * 0.14, color: pal.ink, breakUp: 0.8, seed: stable + i,
          weight: (_t, na) => Math.max(0, Math.sin(na)) * 1.3 + 0.05
        })
      }
    }
  }
  ctx.globalAlpha = alpha
  // Grains: small, dark, and falling.
  const ga = 1 - Math.max(0, (u - 0.45) / 0.55)
  if (ga > 0.03) {
    ctx.globalAlpha = alpha * ga
    for (let i = 0; i < (rich ? 7 : 4); i++) {
      const j = noise2(i * 1.9, stable + 3, stable)
      const ang = -Math.PI / 2 + (i / 6 - 0.5) * 3.4 + (j - 0.5) * 0.4
      const d = R * (0.5 + ease(u * 1.4) * 1.1) * (0.7 + j * 0.6)
      const s = Math.max(1, R * 0.07 * (0.8 + j))
      ctx.fillStyle = i % 3 ? pal.ink : pal.deep
      ctx.fillRect(Math.cos(ang) * d - s / 2, Math.sin(ang) * d + R * 1.4 * u * u - s / 2, s, s)
    }
    ctx.globalAlpha = alpha
  }
}

// ─── The dart's in-flight smear ─────────────────────────────────────────────

/** The motion smear behind a falling dart (Dart Rain), local space. */
export const dartSmear = (ctx: CanvasRenderingContext2D, u: number, streak: number, seed: number): void => {
  inkStroke(ctx, [[-u * 1.7 - streak, 0], [-u * 1.7, 0]], u * 0.02, u * 0.24, 'rgba(255,250,240,0.6)', seed)
}

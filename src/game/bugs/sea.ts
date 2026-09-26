import {
  blob, rough, densify, trace, fillShape, ink, stroke, hatch, occlude, noise2, tones,
  type Pt, type CelTones
} from '@/game/inkArt'
import { INK, LINE, paint, eye, horn, pivot, gait, blink } from '@/game/monsterKit'

/**
 * ─── Sea bugs ───────────────────────────────────────────────────────────────
 *
 * The water half of the garden cast: the things that live in the paddling-pool
 * moat and surface to bite the sandcastle's lowest blocks. Same vocabulary as
 * the walkers in `monsters.ts`, same three rules — silhouette first, asymmetry
 * everywhere, nothing re-decides the shared light, line weights or tonal steps.
 *
 * What is structural about a swimmer, and did not change with the reskin:
 *
 *   * **Authored side-on and centred.** No feet to line up, so these designs
 *     declare `anchor: 'centre'` and the battlefield hangs them off the middle
 *     of the body — which is also the point the waterline is measured against.
 *   * **Drawn twice around the waterline.** A dimmed silhouette below, the full
 *     drawing above, split by a horizontal clip that tilts nose-up as the bug
 *     rears to bite. So every design keeps its tell in the FRONT half — the
 *     sickle jaws, the eyes over the yellow rim, the mask, the raptorial arms —
 *     and nothing important depends on both halves being seen together.
 *   * **Locomotion is a travelling wave or a rowing stroke, not a gait.** The
 *     long soft bodies (the larva, the nymph) flex along a spine whose
 *     amplitude grows from the head backwards; the hard ones (the two true
 *     bugs) stay rigid and row.
 *
 * A segmented body is a spine with RINGS on it: the outline pinches slightly at
 * every segment boundary and each ring carries its own band, all indexed by the
 * ring's position along the body and never by time. The wave moves the rings;
 * it never re-decides where they are. That is the monster rule ("animation
 * MOVES parts, never reshapes them") applied to a body with no bones in it, and
 * it is also what makes these read as bugs rather than as eels with stripes:
 * the silhouette notches at every segment.
 *
 * FRAME BUDGET: everything lives inside x, y ∈ [−1, 1] (the bake frame allows a
 * hair more sideways). Oars, masks and lures that swing are checked at the
 * extremes of their cycle, not at rest.
 *
 * LOOPS: the strip is baked over exactly `cycleMs`, so every oscillation here
 * runs at a WHOLE multiple of the cycle, and each `blink` offset is picked so
 * the baked window never lands on a blink — a strip that blinks on every loop
 * reads as a nervous tic. The bench still blinks them on the real clock.
 */

// ─── Rigging ────────────────────────────────────────────────────────────────

/** A spine function: `u` runs 0 at the HEAD to 1 at the tail tip, in pixels. */
type SpineFn = (u: number) => Pt

/** Where a rigid part sits on a spine, and which way it faces (toward the head). */
interface Pose { x: number; y: number; a: number }

const poseOn = (f: SpineFn, u: number): Pose => {
  const e = 0.012
  const [x, y] = f(u)
  const ahead = f(Math.max(0, u - e))
  const behind = f(Math.min(1, u + e))
  return { x, y, a: Math.atan2(ahead[1] - behind[1], ahead[0] - behind[0]) }
}

/** Authored local points (+x toward the head, +y down) carried onto a pose. */
const place = (pts: Pt[], p: Pose): Pt[] => pivot(pts, p.x, p.y, p.a)
const at = (p: Pose, lx: number, ly: number): Pt => place([[lx, ly]], p)[0]!

/**
 * An authored outline, wobbled once and resampled along its own curve.
 *
 * `ink` walks the points it is given with straight segments, so a six-point
 * polygon inks as six facets however smoothly `trace` fills it. Densifying
 * first makes the line follow the same curve as the fill.
 *
 * The outlines here are authored front → back → belly, which is the opposite
 * winding to `blob`. `ink` takes its outward normal from the winding, so an
 * unreversed outline puts the heavy line on the lit BACK and the hairline on
 * the belly — reversed, the weight sits under the form like the rest of the
 * cast.
 */
const shapeOf = (pts: Pt[], amount: number, seed: number, per = 5): Pt[] =>
  densify(rough(pts, amount, seed), per).reverse()

/**
 * The travelling wave that drives the soft bodies.
 *
 * Amplitude grows with `u`: a sine applied evenly along a body slithers
 * sideways like a shaken rope, while one that starts at nothing under the head
 * and opens toward the tail looks like it is PUSHING against water.
 */
const swimWave = (u: number, phase: number, amp: number, waves = 1.15): number =>
  Math.sin(u * Math.PI * 2 * waves - phase) * amp * (0.12 + u * 0.88)

/** 0..1 ease, both ends soft. */
const ease = (k: number): number => {
  const c = Math.max(0, Math.min(1, k))
  return c * c * (3 - 2 * c)
}

/**
 * A rowing stroke over one cycle: 0 = legs forward (recovered), 1 = swept back.
 *
 * The power stroke is quick and the recovery slow, which is the whole read of
 * rowing — an even sine is legs waving, not legs pushing.
 */
const rowStroke = (g: number, power = 0.38): number => {
  const u = ((g % 1) + 1) % 1
  return u < power ? ease(u / power) : 1 - ease((u - power) / (1 - power))
}

/** Piecewise-linear lookup in a `[u, value]` table sorted by `u`. */
const lerpTable = (tab: [number, number][], u: number): number => {
  if (u <= tab[0]![0]) return tab[0]![1]
  for (let i = 1; i < tab.length; i++) {
    const [u1, v1] = tab[i]!
    if (u <= u1) {
      const [u0, v0] = tab[i - 1]!
      return v0 + (v1 - v0) * ((u - u0) / (u1 - u0))
    }
  }
  return tab[tab.length - 1]![1]
}

/** Point on a quadratic Bézier. */
const quad = (a: Pt, c: Pt, b: Pt, k: number): Pt => [
  (1 - k) * (1 - k) * a[0] + 2 * (1 - k) * k * c[0] + k * k * b[0],
  (1 - k) * (1 - k) * a[1] + 2 * (1 - k) * k * c[1] + k * k * b[1]
]

// ─── Ringed bodies ──────────────────────────────────────────────────────────

interface Ringed {
  outline: Pt[]
  /** Sample a point across the body at `u`: `side` +1 is the back, −1 the belly. */
  across: (u: number, side: number) => Pt
  /** Half-width at `u`, in pixels. */
  r: (u: number) => number
}

/**
 * A segmented body along a spine, from `bounds[0]` to the tail.
 *
 * The outline pinches by `notch` at every ring boundary and swells a touch
 * mid-ring, so the silhouette itself says "segments" at thumbnail size. The
 * pinch is a function of the ring's `u`, never of `t`.
 */
const ringed = (f: SpineFn, bounds: number[], R: (u: number) => number, notch: number): Ringed => {
  const normal = (u: number): Pt => {
    const a = f(Math.max(0, u - 0.01))
    const b = f(Math.min(1, u + 0.01))
    const tx = b[0] - a[0]
    const ty = b[1] - a[1]
    const l = Math.hypot(tx, ty) || 1
    // +n is the BACK: travel runs toward −x, so this points up on a flat body.
    return [-ty / l, tx / l]
  }
  const across = (u: number, side: number): Pt => {
    const [x, y] = f(u)
    const [nx, ny] = normal(u)
    const w = R(u) * side
    return [x + nx * w, y + ny * w]
  }
  const top: Pt[] = []
  const bot: Pt[] = []
  for (let k = 0; k < bounds.length - 1; k++) {
    const ua = bounds[k]!
    const d = bounds[k + 1]! - ua
    for (const [q, m] of [[0, k === 0 ? 1 : 1 - notch], [0.36, 1 + notch * 0.2], [0.7, 1 + notch * 0.15]] as const) {
      top.push(across(ua + d * q, m))
      bot.unshift(across(ua + d * q, -m))
    }
  }
  const end = bounds[bounds.length - 1]!
  top.push(across(end, 1))
  bot.unshift(across(end, -1))
  // Wound the same way as `blob`, so `ink` puts its weight on the belly.
  //
  // NOT densified: `ink` jitters its width per point, so a long body sampled
  // at a few hundred points inks with a furry, ragged belly. Three samples a
  // ring keeps the jitter at the scale of a pen, which is what it is for.
  return { outline: top.concat(bot).reverse(), across, r: R }
}

/** A strip across a ringed body between `u0` and `u1`, from `s0` to `s1` sides. */
const strip = (b: Ringed, u0: number, u1: number, s0: number, s1: number, steps = 5): Pt[] => {
  const a: Pt[] = []
  const c: Pt[] = []
  for (let i = 0; i <= steps; i++) {
    const u = u0 + (u1 - u0) * (i / steps)
    a.push(b.across(u, s0))
    c.unshift(b.across(u, s1))
  }
  return a.concat(c)
}

// ─── Parts ──────────────────────────────────────────────────────────────────

/**
 * An insect leg: a chain of tapered segments, inked, with a lit stripe.
 *
 * All the ink goes down before any of the colour, so the joints fuse into one
 * limb instead of reading as sticks laid end to end. The last segment tapers
 * nearly to a point — a leg that ends square reads as a plank.
 */
const bugLeg = (
  ctx: CanvasRenderingContext2D, pts: Pt[], w: number, T: CelTones, seed: number,
  bleed: number, taper = 0.5
): void => {
  const n = pts.length - 1
  const wAt = (i: number): number => i === n ? w * 0.18 : w * (1 - (1 - taper) * (i / n))
  for (let i = 0; i < n; i++) stroke(ctx, [pts[i]!, pts[i + 1]!], wAt(i) + bleed, wAt(i + 1) + bleed, INK, seed + i)
  for (let i = 1; i < n; i++) {
    const j = pts[i]!
    const r = (wAt(i) + bleed) * 0.5
    fillShape(ctx, blob(j[0], j[1], r, r, seed + 30 + i, 0.1, 1.4, 16), INK)
  }
  for (let i = 0; i < n; i++) stroke(ctx, [pts[i]!, pts[i + 1]!], wAt(i), wAt(i + 1), T.base, seed + 10 + i)
  for (let i = 1; i < n; i++) {
    const j = pts[i]!
    const r = wAt(i) * 0.5
    fillShape(ctx, blob(j[0], j[1], r, r, seed + 40 + i, 0.1, 1.4, 16), T.shade)
  }
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i]!
    const b = pts[i + 1]!
    stroke(ctx, [
      [a[0] - wAt(i) * 0.14, a[1] - wAt(i) * 0.18],
      [b[0] - wAt(i + 1) * 0.14, b[1] - wAt(i + 1) * 0.18]
    ], wAt(i) * 0.3, wAt(i + 1) * 0.24, T.lit ?? T.base, seed + 20 + i)
  }
}

/** Chain `[len, angle]` bones into points from a root. Angles are absolute. */
const chain = (root: Pt, bones: [number, number][]): Pt[] => {
  const out: Pt[] = [root]
  let [x, y] = root
  for (const [len, a] of bones) {
    x += Math.cos(a) * len
    y += Math.sin(a) * len
    out.push([x, y])
  }
  return out
}

/**
 * Swimming hairs along a leg or paddle.
 *
 * `spread` is the angle off the segment: wide on the power stroke (a paddle),
 * folded along it on the recovery (a stick). The hairs rotate; they never
 * change length, so at sprite size they read as a fan opening and closing
 * rather than as a shape swelling.
 */
const fringe = (
  ctx: CanvasRenderingContext2D, a: Pt, b: Pt, count: number, len: number,
  spread: number, side: 1 | -1, color: string, seed: number
): void => {
  const dir = Math.atan2(b[1] - a[1], b[0] - a[0])
  for (let i = 0; i < count; i++) {
    const k = (i + 0.5) / count
    const x = a[0] + (b[0] - a[0]) * k
    const y = a[1] + (b[1] - a[1]) * k
    const h = len * (0.75 + noise2(i * 1.9, seed, seed) * 0.45) * (0.7 + k * 0.4)
    const ang = dir + Math.PI + side * spread * (0.85 + k * 0.25)
    stroke(ctx, [[x, y], [x + Math.cos(ang) * h, y + Math.sin(ang) * h]], len * 0.13, len * 0.02, color, seed + i)
  }
}

/**
 * A flat oar: a leaf-shaped paddle hinged at `root`, fringed on its trailing
 * edge. One constant shape rotated about its hinge.
 */
const paddle = (
  ctx: CanvasRenderingContext2D, S: number, root: Pt, angle: number, len: number, w: number,
  T: CelTones, seed: number, spread: number, hair: string
): void => {
  const a = pivot([[0, 0]], root[0], root[1], angle)[0]!
  const b = pivot([[len * S, 0]], root[0], root[1], angle)[0]!
  // Hairs on the trailing (lower) edge, and a shorter row on the leading edge.
  fringe(ctx, pivot([[len * 0.2 * S, w * 0.3 * S]], root[0], root[1], angle)[0]!, b,
    11, 0.085 * S * (len / 0.3), spread, -1, hair, seed + 50)
  fringe(ctx, pivot([[len * 0.35 * S, -w * 0.3 * S]], root[0], root[1], angle)[0]!, b,
    6, 0.05 * S * (len / 0.3), spread * 0.8, 1, hair, seed + 70)
  const shape = pivot(shapeOf([
    [-0.01 * S, -w * 0.35 * S], [len * 0.45 * S, -w * 0.55 * S], [len * 0.92 * S, -w * 0.3 * S],
    [len * S, 0], [len * 0.9 * S, w * 0.4 * S], [len * 0.4 * S, w * 0.6 * S], [-0.01 * S, w * 0.35 * S]
  ], 0.004 * S, seed), root[0], root[1], angle)
  paint(ctx, S, shape, T, seed + 1, { line: LINE.fine, breakUp: 0.25, deep: false, amp: 0.05 })
  stroke(ctx, [a, b], 0.01 * S, 0.004 * S, 'rgba(60,36,14,0.45)', seed + 2)
}

/** A soap-film air bubble: pale rim, a white catch-light. */
const bubble = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, seed: number): void => {
  const b = blob(x, y, r, r, seed, 0.04, 1.4, 24)
  fillShape(ctx, b, 'rgba(226,250,255,0.6)')
  ink(ctx, b, { width: r * 0.3, color: 'rgba(30,84,104,0.85)', seed, breakUp: 0.3 })
  fillShape(ctx, blob(x - r * 0.35, y - r * 0.35, r * 0.3, r * 0.22, seed + 1, 0.1, 1.4, 12), '#ffffff')
}

// ─── 1 · Water Tiger (sliverfin) ────────────────────────────────────────────
//
// The diving-beetle larva. A long ringed body with a big flat head and two
// sickle jaws on the front — the thinnest silhouette in the water, a line that
// whips. The jaws never close: that open pincer is the whole character, and it
// is what still shows when only the front of it is above the surface.

export const drawWaterTiger = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  const g = gait(t, 700)
  const phase = g * Math.PI * 2
  // A good wave and a bit along the body: fewer reads as a fish, more as a worm.
  const f: SpineFn = (u) => [(0.47 - 1.26 * u) * S, (swimWave(u, phase, 0.13, 1.2) + 0.03) * S]

  const HIDE = tones('#d6b24c', 1.05)
  const BAND = '#735424'
  const BELLY = '#efe3ad'
  const HEAD = tones('#c29a42', 1.05)
  const JAW = tones('#8e4a22', 1.1)
  const LEG = tones('#b89d56', 0.95)
  const FAR = tones('#86733c', 0.95)

  const R = (u: number): number => S * lerpTable([
    [0.06, 0.07], [0.14, 0.074], [0.3, 0.088], [0.46, 0.098], [0.6, 0.09],
    [0.76, 0.068], [0.9, 0.044], [1, 0.026]
  ], u)
  // Three thoracic rings, then eight abdominal.
  const BOUNDS = [0.06, 0.15, 0.23, 0.31, 0.39, 0.47, 0.55, 0.63, 0.71, 0.79, 0.87, 0.94, 1]
  const body = ringed(f, BOUNDS, R, 0.1)

  /** A thoracic leg: hangs down and back, paddling a beat behind the one ahead. */
  const legPts = (i: number, far: boolean): Pt[] => {
    const u = (BOUNDS[i]! + BOUNDS[i + 1]!) / 2
    const p = poseOn(f, u)
    const lp = phase - i * 0.9 + (far ? Math.PI : 0)
    const base = [1.3, 1.65, 1.95][i]!
    const a1 = base + Math.sin(lp) * 0.3
    const a2 = a1 + 0.9 + Math.cos(lp) * 0.2
    const local = chain([far ? -0.02 * S : 0, R(u) * 0.55 - (far ? 0.015 * S : 0)], [
      [0.1 * S, a1], [0.105 * S, a2], [0.05 * S, a2 + 0.5]
    ])
    return place(local, p)
  }

  // ── Far legs, behind everything ──
  for (let i = 0; i < 3; i++) bugLeg(ctx, legPts(i, true), 0.02 * S, FAR, 700 + i * 7, 0.009 * S)

  // ── Tail bristles (cerci), rooted under the last ring ──
  const tail = poseOn(f, 0.985)
  for (const [k, dy] of [[0, -0.05], [1, 0.045]] as const) {
    const lag = Math.sin(phase - 1.2 - k * 0.5) * 0.02 * S
    const pts = place([[0.01 * S, 0], [-0.09 * S, dy * 0.5 * S + lag * 0.5], [-0.19 * S, dy * S + lag]], tail)
    stroke(ctx, pts, 0.03 * S, 0.006 * S, INK, 720 + k)
    stroke(ctx, pts, 0.017 * S, 0.003 * S, HIDE.shade, 722 + k)
    for (let h = 0; h < 3; h++) {
      const q = pts[1]!
      const r = pts[2]!
      const kk = 0.15 + h * 0.3
      const x = q[0] + (r[0] - q[0]) * kk
      const y = q[1] + (r[1] - q[1]) * kk
      stroke(ctx, [[x, y], [x - 0.025 * S, y + (k ? 0.028 : -0.028) * S]], 0.008 * S, 0.001 * S, INK, 724 + k * 4 + h)
    }
  }

  // ── Body ──
  paint(ctx, S, body.outline, HIDE, 740, { line: false, amp: 0.08 })
  ctx.save()
  ctx.beginPath(); trace(ctx, body.outline); ctx.clip()
  fillShape(ctx, strip(body, BOUNDS[0]!, 1, -0.3, -1.3, 40), BELLY)
  for (let k = 0; k < BOUNDS.length - 1; k++) {
    const ua = BOUNDS[k]!
    const ub = BOUNDS[k + 1]!
    // A dark saddle over the rear of each ring: the larva's banding.
    fillShape(ctx, strip(body, ua + (ub - ua) * 0.42, ub, 1.3, -0.05, 4), BAND)
    if (k > 0) {
      stroke(ctx, [body.across(ua, 0.95), body.across(ua - 0.008, 0), body.across(ua, -0.95)],
        0.012 * S, 0.012 * S, 'rgba(46,30,12,0.55)', 750 + k)
    }
  }
  // One pale catch-light along the back, so the tube has a top.
  stroke(ctx, [0.2, 0.36, 0.52, 0.66].map((u) => body.across(u, 0.62)), 0.02 * S, 0.008 * S,
    'rgba(255,246,206,0.3)', 766)
  ctx.restore()
  ink(ctx, body.outline, { width: LINE.mid * S, color: INK, seed: 767, breakUp: 0.34 })

  // Swimming hairs on the last rings, where the larva actually has them.
  for (let i = 0; i < 4; i++) {
    const u = 0.8 + i * 0.05
    for (const side of [-1, 1] as const) {
      const root = body.across(u, side * 0.92)
      const tip = body.across(u + 0.035, side * 1.55)
      stroke(ctx, [root, tip], 0.009 * S, 0.001 * S, 'rgba(59,42,33,0.8)', 790 + i * 2 + (side > 0 ? 1 : 0))
    }
  }

  // ── Near legs ──
  for (let i = 0; i < 3; i++) bugLeg(ctx, legPts(i, false), 0.026 * S, LEG, 800 + i * 7, 0.011 * S)

  // ── Head ──
  const hp = poseOn(f, 0.0)
  // Sickle jaws first, so their roots tuck under the head. They snap, but the
  // gape never drops below a third: the mouth is always open.
  // `horn` is polar — the tip sits at `angle + curve` from the root — so the
  // two sickles bow outward and hook back in without their tips ever crossing.
  const snap = 0.5 + 0.5 * Math.sin(phase * 2 - 0.6)
  const gape = 0.15 + snap * 0.2
  const upperRoot = at(hp, 0.2 * S, -0.045 * S)
  const lowerRoot = at(hp, 0.195 * S, 0.05 * S)
  horn(ctx, lowerRoot[0], lowerRoot[1], 0.22 * S, 0.04 * S, hp.a + 0.45 + gape, -(0.5 + gape * 0.6), JAW, 830)
  horn(ctx, upperRoot[0], upperRoot[1], 0.25 * S, 0.046 * S, hp.a - 0.45 - gape, 0.5 + gape * 0.6, JAW, 832)

  // Far eye, peeking over the crown behind the near one.
  const lid = blink(t, 210)
  const farEye = at(hp, 0.1 * S, -0.115 * S)
  eye(ctx, farEye[0], farEye[1], 0.056 * S, { iris: '#b8e04a', pupil: 0.46, lid: Math.max(0.14, lid), seed: 836 })

  const skull = place(shapeOf([
    [0.25 * S, -0.012 * S], [0.18 * S, -0.095 * S], [0.0, -0.13 * S], [-0.14 * S, -0.11 * S],
    [-0.18 * S, 0.0], [-0.12 * S, 0.095 * S], [0.09 * S, 0.105 * S], [0.24 * S, 0.055 * S]
  ], 0.006 * S, 840), hp)
  paint(ctx, S, skull, HEAD, 841, { line: LINE.mid, breakUp: 0.28, amp: 0.07 })
  ctx.save()
  ctx.beginPath(); trace(ctx, skull); ctx.clip()
  // Dark cap over the crown and a pale jaw line — the head keeps the body's
  // banding language instead of becoming a separate flat colour.
  fillShape(ctx, place(blob(-0.1 * S, -0.135 * S, 0.14 * S, 0.07 * S, 842, 0.12, 1.4, 24), hp), BAND)
  fillShape(ctx, place(blob(0.05 * S, 0.125 * S, 0.2 * S, 0.05 * S, 843, 0.1, 1.4, 24), hp), BELLY)
  ctx.restore()
  // A crooked little grin between the jaw roots: the jaws do the biting, the
  // grin says it is looking forward to it.
  stroke(ctx, [at(hp, 0.05 * S, 0.045 * S), at(hp, 0.13 * S, 0.065 * S), at(hp, 0.21 * S, 0.035 * S)],
    0.018 * S, 0.012 * S, 'rgba(59,36,20,0.85)', 845)
  occlude(ctx, skull, 0.2, 0.45, 0.028 * S, 'rgba(40,26,18,0.55)', 844)

  // Little antennae off the front corner, trailing the snap a beat late.
  const antLag = Math.sin(phase * 2 - 1.5) * 0.015 * S
  const antRoot = at(hp, 0.18 * S, -0.08 * S)
  const antTip = at(hp, 0.3 * S, -0.16 * S)
  stroke(ctx, [antRoot, [antTip[0], antTip[1] + antLag]], 0.018 * S, 0.004 * S, INK, 846)

  const nearEye = at(hp, 0.04 * S, -0.06 * S)
  eye(ctx, nearEye[0], nearEye[1], 0.085 * S, {
    iris: '#b8e04a', pupil: 0.44, lid: Math.max(0.12, lid), brow: 0.6, seed: 848
  })
}

// ─── 2 · Diving Beetle (gnashfin) ───────────────────────────────────────────
//
// A glossy dark oval with a yellow rim and two huge oars. Stiff: the shell does
// not bend at all, and everything that moves is the rowing — a quick power
// stroke with the fringes spread, a slow feathered recovery. That stiffness is
// the read next to the larva, the same way the shark read heavy next to the eel.

export const drawDivingBeetle = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  const g = gait(t, 900)
  const st = rowStroke(g)
  const powering = ((g % 1) + 1) % 1 < 0.38
  // The shell lurches forward on the stroke and coasts back on the recovery.
  const surge = (st - 0.5) * 0.04 * S
  const bob = Math.sin(g * Math.PI * 2 - 0.8) * 0.012 * S

  const SHELL = tones('#40602c', 1.15)
  const HEADT = tones('#58793a', 1.1)
  const RIM = '#ffc93c'
  const RIM_SHADE = '#d99a28'
  const UNDER = tones('#3a2c1a', 0.9)
  const LEG = tones('#c29040', 1.0)
  const FAR = tones('#8a6430', 1.0)
  const HAIR = 'rgba(255,238,178,0.9)'
  const FAR_HAIR = 'rgba(214,190,130,0.7)'

  ctx.save()
  ctx.translate(surge, bob)

  /**
   * One oar: a femur from under the shell, then a flat fringed paddle.
   *
   * The paddle sweeps from hanging DOWN (recovered, fringe folded) to pointing
   * straight BACK (the power stroke, fringe fanned). Quick back, slow forward.
   */
  const oar = (
    hip: Pt, femur: number, len: number, w: number, s: number,
    T: CelTones, seed: number, hair: string, lw: number
  ): void => {
    const a1 = 2.2 + s * 0.4
    const a2 = 1.8 + s * 1.2
    const knee = chain(hip, [[femur * S, a1]])[1]!
    const spread = powering ? 0.4 + s * 1.0 : 0.25 + s * 0.3
    bugLeg(ctx, [hip, knee], lw * S, T, seed + 5, lw * 0.4 * S, 0.9)
    paddle(ctx, S, knee, a2, len, w, T, seed, spread, hair)
  }

  // ── Far legs ──
  oar([-0.02 * S, 0.03 * S], 0.18, 0.42, 0.1, st, FAR, 900, FAR_HAIR, 0.05)
  oar([0.18 * S, 0.04 * S], 0.11, 0.22, 0.07, rowStroke(g - 0.1), FAR, 910, FAR_HAIR, 0.036)

  // ── Belly, under the shell ──
  const belly = shapeOf([
    [0.44 * S, 0.06 * S], [0.1 * S, 0.18 * S], [-0.3 * S, 0.17 * S],
    [-0.55 * S, 0.08 * S], [-0.2 * S, 0.06 * S], [0.2 * S, 0.04 * S]
  ], 0.008 * S, 920)
  paint(ctx, S, belly, UNDER, 921, { line: LINE.fine, deep: false, amp: 0.06 })

  // ── Near mid leg and the near oar, rooted under the shell's edge ──
  oar([0.2 * S, 0.1 * S], 0.12, 0.24, 0.075, rowStroke(g - 0.1), LEG, 930, HAIR, 0.04)
  oar([-0.04 * S, 0.1 * S], 0.2, 0.46, 0.11, st, LEG, 940, HAIR, 0.056)

  // ── Antennae, behind the head ──
  const tw = Math.sin(g * Math.PI * 2 * 2) * 0.01 * S
  stroke(ctx, [[0.64 * S, -0.11 * S], [0.76 * S, -0.2 * S + tw], [0.9 * S, -0.22 * S + tw * 1.6]],
    0.02 * S, 0.004 * S, INK, 950)
  stroke(ctx, [[0.6 * S, -0.14 * S], [0.69 * S, -0.27 * S - tw], [0.8 * S, -0.33 * S - tw * 1.4]],
    0.016 * S, 0.003 * S, INK, 951)

  // Far eye, peeking over the top of the head.
  const lid = blink(t, 1300)
  eye(ctx, 0.665 * S, -0.15 * S, 0.058 * S, { iris: '#ffb640', pupil: 0.5, lid: Math.max(0.22, lid), seed: 986 })

  // ── Head: tucked under the pronotum, but big enough to carry a face ──
  // Mandibles first: a small pair of pincers under the chin.
  horn(ctx, 0.66 * S, 0.07 * S, 0.12 * S, 0.03 * S, 0.45, 1.25, UNDER, 954)
  const head = shapeOf([
    [0.73 * S, -0.03 * S], [0.67 * S, -0.16 * S], [0.46 * S, -0.2 * S],
    [0.34 * S, -0.03 * S], [0.42 * S, 0.12 * S], [0.65 * S, 0.1 * S]
  ], 0.006 * S, 952)
  paint(ctx, S, head, HEADT, 953, { line: LINE.mid, breakUp: 0.3, amp: 0.06 })
  // A set, determined mouth — a flat line with one corner tucked down.
  stroke(ctx, [[0.61 * S, 0.045 * S], [0.67 * S, 0.05 * S], [0.715 * S, 0.035 * S]],
    0.016 * S, 0.01 * S, 'rgba(24,20,10,0.85)', 955)

  // ── Elytra: the glossy shell ──
  const elytra = shapeOf([
    [0.24 * S, -0.3 * S], [0.0, -0.4 * S], [-0.32 * S, -0.37 * S], [-0.56 * S, -0.24 * S],
    [-0.67 * S, -0.06 * S], [-0.58 * S, 0.07 * S], [-0.3 * S, 0.13 * S], [0.02 * S, 0.13 * S],
    [0.24 * S, 0.09 * S], [0.3 * S, -0.1 * S]
  ], 0.006 * S, 960)
  paint(ctx, S, elytra, SHELL, 961, { line: false, amp: 0.06 })
  ctx.save()
  ctx.beginPath(); trace(ctx, elytra); ctx.clip()
  // The yellow margin: a band laid ALONG the lower edge and up round the tail
  // tip, clipped inside the shell so the ink closes over it.
  const rimPath: Pt[] = [
    [0.32 * S, 0.02 * S], [0.1 * S, 0.125 * S], [-0.2 * S, 0.125 * S], [-0.45 * S, 0.075 * S],
    [-0.61 * S, -0.02 * S], [-0.68 * S, -0.14 * S]
  ]
  stroke(ctx, rimPath, 0.11 * S, 0.1 * S, RIM_SHADE, 962)
  stroke(ctx, rimPath.map(([x, y]) => [x, y - 0.014 * S] as Pt), 0.075 * S, 0.065 * S, RIM, 963)
  // Faint striae down the wing case.
  for (let i = 0; i < 3; i++) {
    stroke(ctx, [
      [0.18 * S, (-0.22 + i * 0.08) * S], [-0.2 * S, (-0.26 + i * 0.09) * S], [-0.5 * S, (-0.15 + i * 0.07) * S]
    ], 0.01 * S, 0.006 * S, 'rgba(20,30,12,0.35)', 964 + i)
  }
  // Gloss: one long curved catch-light over the dome and a short second hit.
  // A cartoon beetle IS glossy — the one surface in the cast allowed a
  // specular.
  stroke(ctx, [[0.14 * S, -0.31 * S], [-0.06 * S, -0.345 * S], [-0.28 * S, -0.32 * S]],
    0.055 * S, 0.012 * S, 'rgba(236,255,220,0.75)', 968)
  stroke(ctx, [[-0.4 * S, -0.27 * S], [-0.48 * S, -0.21 * S]], 0.03 * S, 0.008 * S, 'rgba(236,255,220,0.6)', 969)
  ctx.restore()
  ink(ctx, elytra, { width: LINE.major * S, color: INK, seed: 970, breakUp: 0.36 })

  // The air bubble it carries under the wing tips.
  bubble(ctx, -0.67 * S, 0.02 * S, 0.055 * S, 972)

  // ── Pronotum, over the join between head and shell ──
  const pronotum = shapeOf([
    [0.46 * S, -0.16 * S], [0.36 * S, -0.28 * S], [0.2 * S, -0.31 * S],
    [0.16 * S, -0.1 * S], [0.2 * S, 0.1 * S], [0.4 * S, 0.1 * S], [0.49 * S, 0.0]
  ], 0.005 * S, 974)
  paint(ctx, S, pronotum, SHELL, 975, { line: false, amp: 0.06 })
  ctx.save()
  ctx.beginPath(); trace(ctx, pronotum); ctx.clip()
  const proRim: Pt[] = [[0.18 * S, 0.1 * S], [0.4 * S, 0.1 * S], [0.5 * S, -0.02 * S], [0.46 * S, -0.17 * S]]
  stroke(ctx, proRim, 0.1 * S, 0.09 * S, RIM_SHADE, 976)
  stroke(ctx, proRim.map(([x, y]) => [x - 0.006 * S, y - 0.012 * S] as Pt), 0.065 * S, 0.055 * S, RIM, 977)
  stroke(ctx, [[0.36 * S, -0.25 * S], [0.24 * S, -0.275 * S]], 0.03 * S, 0.008 * S, 'rgba(236,255,220,0.7)', 978)
  ctx.restore()
  ink(ctx, pronotum, { width: LINE.mid * S, color: INK, seed: 979, breakUp: 0.3 })

  // ── Front leg: a small grabbing hook tucked under the head ──
  const fl = Math.sin(g * Math.PI * 2 + 0.5) * 0.12
  bugLeg(ctx, chain([0.4 * S, 0.08 * S], [
    [0.1 * S, 1.25 + fl], [0.1 * S, 0.5 + fl], [0.06 * S, 1.0 + fl]
  ]), 0.03 * S, LEG, 984, 0.013 * S)

  // ── Near eye: determined — a flat brow, not a scowl ──
  eye(ctx, 0.56 * S, -0.075 * S, 0.088 * S, {
    iris: '#ffb640', pupil: 0.44, lid: Math.max(0.18, lid), brow: 0.42, seed: 988
  })

  ctx.restore()
}

// ─── 3 · Dragonfly Nymph (tidewyrm) ─────────────────────────────────────────
//
// The heavy. A fat ringed abdomen, wing pads on the back, six long legs and
// the one weapon nothing else in the pond has: a hinged "mask" folded under the
// face that SHOOTS out with two hooked palps on the end. It is the one with
// hands, and the hands are on its chin.

export const drawDragonflyNymph = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  const g = gait(t, 1500)
  const phase = g * Math.PI * 2
  // Slow and deep: a heavy body moving a lot of water.
  const f: SpineFn = (u) => [(0.56 - 1.4 * u) * S, (swimWave(u, phase, 0.12, 0.85) - 0.02) * S]

  const HIDE = tones('#83a13f', 1.1)
  const MOTTLE = '#5a7430'
  const BELLY = '#d5d48c'
  const PAD = tones('#857a38', 1.05)
  const LEG = tones('#8ea44a', 0.95)
  const FAR = tones('#5b7030', 0.95)
  const MASK = tones('#bdbf6c', 1.0)
  const HOOK = tones('#6a3f1c', 1.1)

  const R = (u: number): number => S * lerpTable([
    [0.3, 0.15], [0.42, 0.2], [0.56, 0.225], [0.7, 0.2], [0.84, 0.14], [0.94, 0.08], [1, 0.035]
  ], u)
  const BOUNDS = [0.3, 0.4, 0.49, 0.58, 0.67, 0.755, 0.835, 0.905, 0.96, 1]
  const body = ringed(f, BOUNDS, R, 0.09)
  const thx = poseOn(f, 0.22)
  const hp = poseOn(f, 0.03)

  /** Six long legs off the thorax, knees up, paddling slowly out of step. */
  const legPts = (i: number, far: boolean): Pt[] => {
    const lp = phase + i * 1.1 + (far ? 2.2 : 0)
    const sw = Math.sin(lp) * 0.18
    const roots: Pt[] = [[0.1 * S, 0.1 * S], [0.0, 0.12 * S], [-0.1 * S, 0.11 * S]]
    // Front leg reaches forward to grab; the hind leg trails.
    const femur = [0.45, 1.3, 2.05][i]! + sw
    const tibia = [1.6, 2.05, 2.55][i]! + sw * 1.3
    const r = roots[i]!
    const local = chain([r[0] - (far ? 0.035 * S : 0), r[1] - (far ? 0.03 * S : 0)], [
      [[0.16, 0.16, 0.19][i]! * S, femur],
      [[0.18, 0.2, 0.22][i]! * S, tibia],
      [0.07 * S, tibia - 0.55]
    ])
    return place(local, thx)
  }

  // ── Far legs ──
  for (let i = 0; i < 3; i++) bugLeg(ctx, legPts(i, true), 0.026 * S, FAR, 1000 + i * 7, 0.01 * S)

  // ── Tail spines (the anal pyramid), under the last ring ──
  const tail = poseOn(f, 0.99)
  for (const [k, dy] of [[0, -0.04], [1, 0.0], [2, 0.04]] as const) {
    const pts = place([[0.02 * S, dy * 0.3 * S], [-0.1 * S, dy * S]], tail)
    stroke(ctx, pts, 0.044 * S, 0.008 * S, INK, 1030 + k)
    stroke(ctx, pts, 0.026 * S, 0.004 * S, HIDE.shade, 1033 + k)
  }

  // ── Abdomen ──
  paint(ctx, S, body.outline, HIDE, 1040, { line: false, amp: 0.08 })
  ctx.save()
  ctx.beginPath(); trace(ctx, body.outline); ctx.clip()
  fillShape(ctx, strip(body, BOUNDS[0]!, 1, -0.52, -1.3, 36), BELLY)
  for (let k = 0; k < BOUNDS.length - 1; k++) {
    const ua = BOUNDS[k]!
    const ub = BOUNDS[k + 1]!
    // Mottling: a soft dark patch per ring, placed by the ring index so the
    // pattern rides with the body instead of sliding under it.
    const um = ua + (ub - ua) * (0.35 + noise2(k * 1.3, 1080, 1080) * 0.3)
    const c = body.across(um, 0.5 + noise2(k * 2.1, 1081, 1081) * 0.25)
    const rw = (ub - ua) * 1.4 * 0.36 * S
    fillShape(ctx, blob(c[0], c[1], rw, body.r(um) * 0.22, 1082 + k, 0.22, 1.4, 20), MOTTLE)
    if (k > 0) {
      stroke(ctx, [body.across(ua, 1.0), body.across(ua - 0.012, 0.2), body.across(ua, -1.0)],
        0.016 * S, 0.012 * S, 'rgba(44,40,14,0.6)', 1050 + k)
    }
  }
  stroke(ctx, [0.36, 0.48, 0.6, 0.72].map((u) => body.across(u, 0.7)), 0.03 * S, 0.012 * S,
    'rgba(250,255,200,0.35)', 1066)
  ctx.restore()
  ink(ctx, body.outline, { width: LINE.mid * S, color: INK, seed: 1067, breakUp: 0.34 })

  // ── Thorax ──
  const thorax = place(shapeOf([
    [0.2 * S, -0.08 * S], [0.1 * S, -0.19 * S], [-0.1 * S, -0.2 * S], [-0.2 * S, -0.08 * S],
    [-0.18 * S, 0.1 * S], [-0.02 * S, 0.17 * S], [0.16 * S, 0.12 * S]
  ], 0.008 * S, 1090), thx)
  paint(ctx, S, thorax, HIDE, 1091, { line: LINE.major, breakUp: 0.32, amp: 0.08 })
  ctx.save()
  ctx.beginPath(); trace(ctx, thorax); ctx.clip()
  fillShape(ctx, place(blob(0, 0.2 * S, 0.24 * S, 0.1 * S, 1092, 0.08, 1.4, 24), thx), BELLY)
  fillShape(ctx, place(blob(-0.04 * S, -0.1 * S, 0.08 * S, 0.05 * S, 1093, 0.2, 1.4, 20), thx), MOTTLE)
  ctx.restore()

  // ── Wing pads: two leaves lying back along the top ──
  const padShape = (len: number, w: number, seed: number): Pt[] => shapeOf([
    [0.06 * S, -w * 0.2 * S], [-len * 0.4 * S, -w * S], [-len * 0.85 * S, -w * 0.55 * S], [-len * S, 0],
    [-len * 0.9 * S, w * 0.45 * S], [-len * 0.4 * S, w * 0.7 * S], [0.04 * S, w * 0.4 * S]
  ], 0.005 * S, seed)
  const padLift = Math.sin(phase - 1.0) * 0.04
  const fr = at(thx, 0.02 * S, -0.2 * S)
  const nr = at(thx, -0.03 * S, -0.16 * S)
  const farPad = pivot(padShape(0.42, 0.065, 1094), fr[0], fr[1], thx.a - 0.16 + padLift)
  paint(ctx, S, farPad, tones('#4c5a24', 1.05), 1095, { line: LINE.fine, deep: false, amp: 0.05 })
  const nearPad = pivot(padShape(0.46, 0.08, 1096), nr[0], nr[1], thx.a - 0.05 + padLift * 0.6)
  paint(ctx, S, nearPad, PAD, 1097, { line: LINE.mid, breakUp: 0.3, amp: 0.05 })
  // Veins, so the pads read as folded wings rather than as leaves stuck on.
  for (let i = 0; i < 2; i++) {
    const tip = pivot([[-0.38 * S, (-0.025 + i * 0.045) * S]], nr[0], nr[1], thx.a - 0.05 + padLift * 0.6)[0]!
    const mid = pivot([[-0.18 * S, (-0.018 + i * 0.03) * S]], nr[0], nr[1], thx.a - 0.05 + padLift * 0.6)[0]!
    stroke(ctx, [nr, mid, tip], 0.013 * S, 0.004 * S, 'rgba(214,220,150,0.7)', 1098 + i)
  }

  // ── Near legs ──
  for (let i = 0; i < 3; i++) bugLeg(ctx, legPts(i, false), 0.034 * S, LEG, 1110 + i * 7, 0.013 * S)

  // ── The mask ──
  //
  // Folded, the postmentum points back from its hinge under the head and the
  // prementum lies forward along the chin with the palps shut over the mouth.
  // On the strike both swing forward and the palps open. Two rigid parts on
  // two hinges — the whole shot is joint angles.
  const gg = ((g % 1) + 1) % 1
  const shoot = gg < 0.52 ? 0
    : gg < 0.6 ? ease((gg - 0.52) / 0.08)
      : gg < 0.68 ? 1
        : gg < 0.86 ? 1 - ease((gg - 0.68) / 0.18) : 0
  const hinge = at(hp, -0.06 * S, 0.14 * S)
  const aPost = hp.a + Math.PI - 0.3 - shoot * (Math.PI - 0.75)
  const postLen = 0.16 * S
  const elbow: Pt = [hinge[0] + Math.cos(aPost) * postLen, hinge[1] + Math.sin(aPost) * postLen]
  const aPre = hp.a - 0.1 + shoot * 0.02
  const post = pivot(shapeOf([
    [-0.01 * S, -0.028 * S], [0.16 * S, -0.022 * S], [0.16 * S, 0.022 * S], [-0.01 * S, 0.03 * S]
  ], 0.004 * S, 1120), hinge[0], hinge[1], aPost)
  const pre = pivot(shapeOf([
    [-0.02 * S, -0.03 * S], [0.16 * S, -0.055 * S], [0.28 * S, -0.035 * S], [0.29 * S, 0.035 * S], [0.1 * S, 0.05 * S]
  ], 0.004 * S, 1122), elbow[0], elbow[1], aPre)
  const tip = pivot([[0.27 * S, 0.0]], elbow[0], elbow[1], aPre)[0]!

  // Palps: two hooks at the end of the mask, shut at rest, flung open to grab.
  // Shut, the two sickles cross over the mouth; open, they bow apart into a
  // claw. `horn` is polar, so the tip sits `curve` round from where it starts.
  const open = shoot * 0.9
  horn(ctx, tip[0], tip[1] + 0.015 * S, 0.13 * S, 0.034 * S, aPre + 0.35 + open * 1.1, -1.3, HOOK, 1124)
  horn(ctx, tip[0], tip[1] - 0.015 * S, 0.14 * S, 0.036 * S, aPre - 0.35 - open * 1.1, 1.3, HOOK, 1126)

  // ── Head ──
  const lid = blink(t, 700)
  const farEyeP = at(hp, -0.01 * S, -0.19 * S)
  eye(ctx, farEyeP[0], farEyeP[1], 0.085 * S, { iris: '#ffc94a', pupil: 0.44, lid: Math.max(0.1, lid), seed: 1130 })

  const skull = place(shapeOf([
    [0.17 * S, 0.0], [0.12 * S, -0.11 * S], [-0.02 * S, -0.16 * S], [-0.14 * S, -0.11 * S],
    [-0.16 * S, 0.05 * S], [-0.05 * S, 0.14 * S], [0.12 * S, 0.11 * S]
  ], 0.008 * S, 1132), hp)
  paint(ctx, S, skull, HIDE, 1133, { line: LINE.major, breakUp: 0.3, amp: 0.07 })
  occlude(ctx, skull, 0.22, 0.48, 0.035 * S, 'rgba(40,30,16,0.55)', 1134)

  // The mask goes over the chin: folded, it IS the lower face.
  paint(ctx, S, post, MASK, 1136, { line: LINE.fine, deep: false, amp: 0.05 })
  paint(ctx, S, pre, MASK, 1138, { line: LINE.mid, breakUp: 0.25, amp: 0.05 })
  // A mouth-line smile on the mask: the one cheeky note on the heavy.
  const sm0 = pivot([[0.08 * S, 0.0]], elbow[0], elbow[1], aPre)[0]!
  const sm1 = pivot([[0.17 * S, 0.012 * S]], elbow[0], elbow[1], aPre)[0]!
  const sm2 = pivot([[0.25 * S, -0.012 * S]], elbow[0], elbow[1], aPre)[0]!
  stroke(ctx, [sm0, sm1, sm2], 0.018 * S, 0.012 * S, 'rgba(59,42,33,0.85)', 1139)

  // Big bulging eye on the near side, set high like a dome.
  const eyeP = at(hp, 0.06 * S, -0.09 * S)
  eye(ctx, eyeP[0], eyeP[1], 0.118 * S, {
    iris: '#ffc94a', pupil: 0.4, lid: Math.max(0.06, lid), brow: 0.5, seed: 1140
  })
  // Stubby antennae over the brow.
  const aRoot = at(hp, 0.13 * S, -0.1 * S)
  const aTip = at(hp, 0.24 * S, -0.18 * S)
  stroke(ctx, [aRoot, aTip], 0.018 * S, 0.004 * S, INK, 1142)
}

// ─── 4 · Toe-Biter (brinemaw) ───────────────────────────────────────────────
//
// The giant water bug: the deep bruiser that ends a run. A big flat brown oval
// that barely moves, two huge raptorial arms held up in front — femur forward,
// tibia jackknifed down, claw hooked back — and a snorkel at the back. It still
// hangs its little green light out in front: the one cool light in the water,
// and the thing a player tracks.
//
// Drawn a little from above as well as from the side, so the flat back — and
// the crossed wings on it — is part of the silhouette. Strictly side-on, a flat
// bug is a line.

export const drawToeBiter = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  const g = gait(t, 1800)
  const phase = g * Math.PI * 2
  const bob = Math.sin(phase) * 0.018 * S
  const st = rowStroke(g, 0.42)

  const BODY = tones('#9a5c28', 1.15)
  const WING = tones('#b97a3e', 1.05)
  const MEMB = '#5c3a20'
  const VEIN = 'rgba(232,196,132,0.5)'
  const RIM = '#c99458'
  const UNDER = tones('#4e301a', 0.9)
  const ARM = tones('#c98d4c', 1.1)
  const FAR = tones('#7a4e28', 1.0)
  const CLAW = tones('#553118', 1.05)
  const LEG = tones('#9a6c3c', 1.0)
  const HAIR = 'rgba(244,222,170,0.85)'

  ctx.save()
  ctx.translate(0, bob)

  /** A flattened swimming leg, rowing slowly: femur then a fringed paddle. */
  const swimLeg = (
    hip: Pt, femur: number, len: number, w: number, s: number,
    T: CelTones, seed: number, lw: number
  ): void => {
    const a1 = 2.05 + s * 0.45
    const a2 = 1.75 + s * 1.15
    const knee = chain(hip, [[femur * S, a1]])[1]!
    bugLeg(ctx, [hip, knee], lw * S, T, seed + 5, lw * 0.4 * S, 0.9)
    paddle(ctx, S, knee, a2, len, w, T, seed, 0.35 + s * 0.6, HAIR)
  }

  /**
   * A raptorial arm: a thick femur held forward, the tibia hanging from the
   * knee with a hooked claw curling back toward the body — a "7" in front of
   * the face. `open` is the knee angle off fully folded, in radians.
   */
  const arm = (hip: Pt, aF: number, open: number, T: CelTones, seed: number, k: number, reach = 0.56): void => {
    const len = reach * k * S
    const femur = pivot(shapeOf([
      [-0.03 * S, -0.045 * S * k], [len * 0.45, -0.095 * S * k], [len * 0.9, -0.065 * S * k],
      [len * 1.05, 0.0], [len * 0.9, 0.055 * S * k], [len * 0.45, 0.085 * S * k], [-0.02 * S, 0.05 * S * k]
    ], 0.005 * S, seed), hip[0], hip[1], aF)
    const knee = pivot([[len * 0.97, 0.0]], hip[0], hip[1], aF)[0]!
    // The tibia hangs from the knee, nearly straight, and the claw on its end
    // hooks back toward the body. Drawn first, so the knee covers its root.
    // (A single long curved horn here swept back under the head and read as a
    // grinning mouth; the arm has to come DOWN before it hooks.)
    const aT = aF + Math.PI - open
    const tl = 0.34 * k * S
    const tip: Pt = [knee[0] + Math.cos(aT + 0.2) * tl * 0.92, knee[1] + Math.sin(aT + 0.2) * tl * 0.92]
    horn(ctx, tip[0], tip[1], 0.13 * k * S, 0.034 * k * S, aT + 1.9, 1.0, CLAW, seed + 3)
    horn(ctx, knee[0], knee[1], tl, 0.07 * k * S, aT, 0.2, T, seed + 2)
    paint(ctx, S, femur, T, seed + 4, { line: LINE.mid, breakUp: 0.28, amp: 0.06 })
    // A row of little teeth along the femur's underside, where the tibia shuts.
    for (let i = 0; i < 3; i++) {
      const q = 0.45 + i * 0.16
      const p = pivot([[len * q, 0.06 * S * k]], hip[0], hip[1], aF)[0]!
      const e = pivot([[len * q - 0.025 * S, 0.1 * S * k]], hip[0], hip[1], aF)[0]!
      stroke(ctx, [p, e], 0.018 * S * k, 0.002 * S, INK, seed + 10 + i)
    }
    // Knee knuckle.
    const kn = blob(knee[0], knee[1], 0.04 * S * k, 0.038 * S * k, seed + 20, 0.1, 1.4, 20)
    paint(ctx, S, kn, T, seed + 21, { line: LINE.fine, deep: false, amp: 0.05 })
  }

  const twitch = Math.sin(phase * 2 - 0.4)

  // ── Far arm and far legs, behind the body ──
  arm([0.18 * S, 0.08 * S], -0.7 + Math.sin(phase + 1.3) * 0.05, 0.85 + 0.1 * twitch, FAR, 1200, 0.9, 0.5)
  swimLeg([0.0, 0.06 * S], 0.18, 0.28, 0.08, rowStroke(g - 0.12, 0.42), FAR, 1210, 0.04)
  swimLeg([-0.3 * S, 0.06 * S], 0.22, 0.36, 0.1, st, FAR, 1220, 0.046)

  // ── Breathing tube at the back ──
  for (const [k, dy] of [[0, -0.022], [1, 0.022]] as const) {
    const pts: Pt[] = [[-0.8 * S, (-0.03 + dy) * S], [-0.9 * S, (-0.07 + dy * 1.5) * S], [-0.98 * S, (-0.09 + dy * 1.9) * S]]
    stroke(ctx, pts, 0.044 * S, 0.024 * S, INK, 1230 + k)
    stroke(ctx, pts, 0.026 * S, 0.012 * S, UNDER.lit, 1232 + k)
  }

  // ── Body: the underside, then the flat back ──
  const hull = shapeOf([
    [0.34 * S, 0.0], [0.22 * S, 0.14 * S], [-0.1 * S, 0.2 * S], [-0.46 * S, 0.18 * S],
    [-0.76 * S, 0.08 * S], [-0.84 * S, -0.04 * S], [-0.5 * S, -0.02 * S], [0.0, -0.02 * S]
  ], 0.008 * S, 1240)
  paint(ctx, S, hull, UNDER, 1241, { line: LINE.major, breakUp: 0.3, deep: false, amp: 0.06 })

  const back = shapeOf([
    [0.34 * S, -0.06 * S], [0.22 * S, -0.2 * S], [-0.08 * S, -0.3 * S], [-0.44 * S, -0.3 * S],
    [-0.72 * S, -0.2 * S], [-0.87 * S, -0.05 * S], [-0.76 * S, 0.07 * S], [-0.42 * S, 0.13 * S],
    [-0.08 * S, 0.13 * S], [0.22 * S, 0.07 * S]
  ], 0.008 * S, 1242)
  paint(ctx, S, back, BODY, 1243, { line: false, amp: 0.08 })
  ctx.save()
  ctx.beginPath(); trace(ctx, back); ctx.clip()
  // The abdomen's edge showing under the wings, ticked at every segment — the
  // detail that says "flat water bug" rather than "beetle".
  const edge: Pt[] = [[0.24 * S, 0.06 * S], [-0.08 * S, 0.125 * S], [-0.42 * S, 0.125 * S], [-0.74 * S, 0.06 * S], [-0.88 * S, -0.04 * S]]
  stroke(ctx, edge, 0.1 * S, 0.09 * S, RIM, 1244)
  for (let i = 0; i < 6; i++) {
    const x = (0.1 - i * 0.15) * S
    const y = (0.13 - Math.pow((i - 2.2) / 4, 2) * 0.14) * S
    stroke(ctx, [[x, y - 0.045 * S], [x - 0.01 * S, y + 0.02 * S]], 0.018 * S, 0.012 * S, 'rgba(70,40,18,0.6)', 1245 + i)
  }
  // Folded wings: a paler leathery half and a dark membrane at the tip.
  const wing = shapeOf([
    [0.08 * S, -0.24 * S], [-0.5 * S, -0.34 * S], [-0.92 * S, -0.1 * S],
    [-0.72 * S, 0.04 * S], [-0.3 * S, 0.06 * S], [0.06 * S, 0.0]
  ], 0.008 * S, 1252)
  paint(ctx, S, wing, WING, 1253, { line: false, deep: false, amp: 0.06 })
  const memb = shapeOf([
    [-0.52 * S, -0.36 * S], [-0.96 * S, -0.1 * S], [-0.74 * S, 0.1 * S], [-0.48 * S, 0.02 * S], [-0.44 * S, -0.16 * S]
  ], 0.01 * S, 1254)
  fillShape(ctx, memb, MEMB)
  for (let i = 0; i < 4; i++) {
    stroke(ctx, [[-0.5 * S, (-0.16 + i * 0.05) * S], [-0.66 * S, (-0.17 + i * 0.08) * S], [-0.86 * S, (-0.16 + i * 0.1) * S]],
      0.012 * S, 0.004 * S, VEIN, 1255 + i)
  }
  // Where the two wings cross, and the scutellum between their roots.
  stroke(ctx, [[0.04 * S, -0.08 * S], [-0.4 * S, -0.1 * S], [-0.9 * S, -0.06 * S]], 0.02 * S, 0.01 * S, 'rgba(46,26,10,0.6)', 1260)
  fillShape(ctx, shapeOf([[0.08 * S, -0.24 * S], [-0.2 * S, -0.12 * S], [0.06 * S, -0.04 * S]], 0.004 * S, 1261), BODY.shade)
  hatch(ctx, shapeOf([[-0.1 * S, -0.3 * S], [-0.44 * S, -0.32 * S], [-0.4 * S, -0.18 * S], [-0.1 * S, -0.16 * S]], 0.01 * S, 1262),
    -0.5, 0.03 * S, 0.007 * S, 'rgba(60,34,14,0.22)', 1263)
  stroke(ctx, [[0.0, -0.24 * S], [-0.3 * S, -0.28 * S]], 0.03 * S, 0.01 * S, 'rgba(255,236,200,0.35)', 1264)
  ctx.restore()
  ink(ctx, back, { width: LINE.major * S, color: INK, seed: 1265, breakUp: 0.36 })

  // ── Near swimming legs ──
  swimLeg([0.02 * S, 0.15 * S], 0.18, 0.3, 0.085, rowStroke(g - 0.12, 0.42), LEG, 1270, 0.044)
  swimLeg([-0.28 * S, 0.15 * S], 0.24, 0.4, 0.11, st, LEG, 1280, 0.054)

  // ── Pronotum ──
  const pronotum = shapeOf([
    [0.36 * S, -0.08 * S], [0.28 * S, -0.2 * S], [0.1 * S, -0.27 * S], [0.02 * S, -0.1 * S],
    [0.08 * S, 0.08 * S], [0.3 * S, 0.06 * S]
  ], 0.006 * S, 1290)
  paint(ctx, S, pronotum, BODY, 1291, { line: LINE.mid, breakUp: 0.3, amp: 0.06 })
  stroke(ctx, [[0.3 * S, -0.18 * S], [0.14 * S, -0.235 * S]], 0.03 * S, 0.008 * S, 'rgba(255,236,200,0.45)', 1292)

  // ── Lure: a stalk off the crown with a green glowing bubble hung on it ──
  // Whole multiples of the cycle only: the old kraken bobbed its lure at 1.3×
  // and the baked strip jumped every time it wrapped.
  const bobA = Math.sin(phase + 0.7) * 0.04 * S
  const s0: Pt = [0.4 * S, -0.2 * S]
  const s1: Pt = [0.42 * S, -0.62 * S + bobA * 0.3]
  const s2: Pt = [0.76 * S, -0.56 * S + bobA]
  const stalk: Pt[] = []
  for (let i = 0; i <= 8; i++) stalk.push(quad(s0, s1, s2, i / 8))
  stroke(ctx, stalk, 0.036 * S, 0.014 * S, INK, 1293)
  stroke(ctx, stalk, 0.021 * S, 0.007 * S, BODY.base, 1294)
  const swayL = Math.sin(phase - 0.3) * 0.02 * S
  const lx = s2[0] + swayL
  const ly = s2[1] + 0.1 * S
  stroke(ctx, [s2, [lx, ly - 0.05 * S]], 0.008 * S, 0.006 * S, 'rgba(59,42,33,0.9)', 1295)
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, 0.22 * S)
  glow.addColorStop(0, 'rgba(170,255,150,0.6)')
  glow.addColorStop(1, 'rgba(170,255,150,0)')
  ctx.fillStyle = glow
  ctx.beginPath(); ctx.arc(lx, ly, 0.22 * S, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
  const bulb = blob(lx, ly, 0.055 * S, 0.055 * S, 1296, 0.05, 1.4, 24)
  fillShape(ctx, bulb, '#b6ff8c')
  ink(ctx, bulb, { width: 0.016 * S, color: '#3c7a3a', seed: 1297, breakUp: 0.3 })
  fillShape(ctx, blob(lx - 0.018 * S, ly - 0.02 * S, 0.02 * S, 0.016 * S, 1298, 0.1, 1.4, 12), '#ffffff')

  // ── Head: small and pointed, with the beak underneath ──
  const lid = blink(t, 1100)
  eye(ctx, 0.54 * S, -0.22 * S, 0.066 * S, { iris: '#f2e27a', pupil: 0.32, lid: Math.max(0.18, lid), seed: 1320 })
  stroke(ctx, [[0.5 * S, -0.02 * S], [0.58 * S, 0.06 * S], [0.6 * S, 0.14 * S]], 0.054 * S, 0.014 * S, INK, 1300)
  stroke(ctx, [[0.5 * S, -0.02 * S], [0.58 * S, 0.06 * S], [0.6 * S, 0.14 * S]], 0.034 * S, 0.006 * S, CLAW.lit, 1301)
  const head = shapeOf([
    [0.65 * S, -0.08 * S], [0.57 * S, -0.21 * S], [0.38 * S, -0.23 * S],
    [0.28 * S, -0.07 * S], [0.36 * S, 0.05 * S], [0.56 * S, 0.03 * S]
  ], 0.006 * S, 1302)
  paint(ctx, S, head, BODY, 1303, { line: LINE.mid, breakUp: 0.3, amp: 0.06 })

  // ── Near arm, over everything but the eye ──
  arm([0.2 * S, 0.15 * S], -0.42 + Math.sin(phase + 0.2) * 0.05, 1.08 + 0.14 * Math.max(0, twitch), ARM, 1310, 1)

  eye(ctx, 0.45 * S, -0.13 * S, 0.1 * S, {
    iris: '#f2e27a', pupil: 0.28, lid: Math.max(0.14, lid), brow: 0.62, seed: 1324
  })

  ctx.restore()
}

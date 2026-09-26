import {
  blob, egg, rough, shrink, densify, trace, fillShape, ink, stroke, cel, terminator, occlude, tones,
  type Pt, type CelTones
} from '@/game/inkArt'
import {
  INK, SHADOW_DIR, LINE, paint, blink, gait, footStep, bodyBob, ik, pivot,
  type PaintOpts, drawShadowSpec, type ShadowSpec
} from '@/game/monsterKit'

/**
 * ─── Ground bugs, part A ────────────────────────────────────────────────────
 *
 * The four walkers the player sees most: the Black Ant (the baseline grunt),
 * its Red Ant sibling, the Cockroach (the fast one) and the Rhino Beetle (the
 * heavy one).
 *
 * All four are drawn SIDE-ON, facing LEFT (`faces: 'left'` in the registry), so
 * the battlefield's one extra flip turns them to face the tower. Same drawing
 * contract as the rest of the cast: origin at the centre of mass, unit `S`,
 * feet on `y = +1`, and every contour seeded on constants — the walk MOVES
 * parts and never reshapes them.
 *
 * Three things every insect here shares, because they are what make the four
 * read as one family of garden bugs rather than four unrelated drawings:
 *
 *   * **A real hexapod gait.** Two alternating tripods — near front, far
 *     middle and near hind swing together, then the other three. It is the one
 *     motion that says "insect" before the eye has resolved a single leg.
 *   * **Legs that end ON the ground.** Every leg is solved by IK to a stepped
 *     foot and finished with a tarsus lying along the sand, so nothing stands on
 *     a point.
 *   * **Gloss, not chalk.** The kit's `lit` band is deliberately matte. A bug's
 *     shell is the opposite, so each shell also gets a hard specular streak and
 *     a catch-light dot — baked once, so it costs nothing at run time.
 *
 * `footStep` is authored for a walker facing +x; these face −x, so every foot
 * uses `neutral − step.x`. Get that sign wrong and the bug moonwalks.
 *
 * Every periodic motion runs a WHOLE number of turns per `cycleMs`, so the
 * baked strip closes without a pop. Blinks are offset so they never land inside
 * the baked window — they show on the design bench only.
 */

const TAU = Math.PI * 2

/** A whole-number oscillation over the cycle, so the baked loop closes. */
const osc = (g: number, turns: number, phase = 0): number => Math.sin((g * turns + phase) * TAU)

/** Blink offset that keeps every blink out of the first 1.4 s (the bake). */
const BLINK_AT = 1200

/**
 * Resample an authored polygon along the curve `trace` draws.
 *
 * `ink` rides the POINTS, `trace` rides the curve through their midpoints. On a
 * sparse eight-point shell the two part company by a visible margin — the
 * outline runs straight across the top of the dome while the fill bulges above
 * it. Densifying first puts both on the same curve.
 */
const smooth = (pts: Pt[]): Pt[] => densify(pts, 6)

/** Heads keep their face in the light: the shadow cuts sit further back. */
const FACE: PaintOpts = { shade: 0.24, deep: 0.8, lit: 0.5 }

// ─── Shared parts ───────────────────────────────────────────────────────────

/**
 * A tapered, curving spike as a closed contour — mandibles, horns, cerci.
 *
 * Grows from (x, y) along `angle` and turns `bend` radians over its length,
 * biased toward the tip so it reads as a hook rather than an arc.
 */
const spike = (
  x: number, y: number, len: number, thick: number,
  angle: number, bend: number, tip = 0.1, n = 12
): { outline: Pt[]; spine: Pt[] } => {
  const spine: Pt[] = []
  let px = x
  let py = y
  const step = len / n
  for (let i = 0; i <= n; i++) {
    spine.push([px, py])
    const a = angle + bend * (i / n) ** 1.6
    px += Math.cos(a) * step
    py += Math.sin(a) * step
  }
  const left: Pt[] = []
  const right: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const k = i / n
    const w = thick * ((1 - k) ** 0.85 * (1 - tip) + tip) / 2
    const p = spine[i]!
    const q = spine[Math.min(n, i + 1)]!
    const r = spine[Math.max(0, i - 1)]!
    const tx = q[0] - r[0]
    const ty = q[1] - r[1]
    const l = Math.hypot(tx, ty) || 1
    left.push([p[0] + (ty / l) * w, p[1] - (tx / l) * w])
    right.unshift([p[0] - (ty / l) * w, p[1] + (tx / l) * w])
  }
  return { outline: left.concat(right), spine }
}

/** A hard specular streak inside a shell: clipped to the form, never past it. */
const gloss = (
  ctx: CanvasRenderingContext2D, shape: Pt[],
  x: number, y: number, rx: number, ry: number, angle: number,
  color: string, seed: number, dot?: number
): void => {
  ctx.save()
  ctx.beginPath(); trace(ctx, shape); ctx.clip()
  fillShape(ctx, pivot(blob(0, 0, rx, ry, seed, 0.12), x, y, angle), color)
  if (dot) {
    const dx = x - Math.cos(angle) * rx * 0.55
    const dy = y - Math.sin(angle) * rx * 0.55
    fillShape(ctx, blob(dx, dy, dot, dot * 0.8, seed + 1, 0.2), 'rgba(255,255,255,0.92)')
  }
  ctx.restore()
}

/** One segment of a leg: the fill, and a lit edge along its top. */
const segment = (
  ctx: CanvasRenderingContext2D, pts: Pt[], w0: number, w1: number,
  fill: string, seed: number, lit?: string
): void => {
  stroke(ctx, pts, w0, w1, fill, seed)
  if (lit) {
    stroke(ctx, pts.map(([x, y]) => [x - w0 * 0.16, y - w0 * 0.2] as Pt),
      w0 * 0.3, w1 * 0.26, lit, seed + 1)
  }
}

/** A small round nub with its ink bleed — knees, coxae, elbows. */
const nub = (
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number,
  tone: CelTones, inkC: string, bleed: number, seed: number
): void => {
  const k = blob(x, y, r, r * 0.92, seed, 0.12)
  fillShape(ctx, shrink(k, 1 + bleed / r, x, y), inkC)
  cel(ctx, k, tone, { shade: terminator(k, SHADOW_DIR, 0.05, 0.14, seed) })
}

interface LegSpec {
  hip: Pt
  foot: Pt
  femur: number
  tibia: number
  /** Which side of the hip→foot line the knee falls on — see `ik`. */
  bend: number
  /** Femur width, world units. */
  w: number
  tone: CelTones
  ink: string
  /** Which way the tarsus lies along the ground: −1 forward, +1 back. */
  toe: number
  seed: number
  /** Teeth along the outer edge of the tibia. */
  teeth?: number
  /** Tarsus length as a multiple of `w`. */
  tarsus?: number
}

/**
 * An insect leg: femur, tibia and a tarsus lying along the ground, solved by IK
 * to its stepped foot. Returns the knee.
 *
 * All the ink goes down first and every fill over it, so the three segments
 * read as one jointed limb rather than three sticks with their own outlines.
 */
const bugLeg = (ctx: CanvasRenderingContext2D, L: LegSpec): Pt => {
  const knee = ik(L.hip, L.foot, L.femur, L.tibia, L.bend)
  const ol = L.w * 0.55
  const wK = L.w * 0.72
  const wF = L.w * 0.5
  const tl = L.w * (L.tarsus ?? 1.9)
  const fm: Pt = [(L.hip[0] + knee[0]) / 2, (L.hip[1] + knee[1]) / 2]
  const tarsus: Pt[] = [
    L.foot,
    [L.foot[0] + L.toe * tl * 0.55, L.foot[1] + L.w * 0.08],
    [L.foot[0] + L.toe * tl, L.foot[1] + L.w * 0.02]
  ]

  // Tibia teeth, raked toward the foot on the outer edge.
  const teeth: Pt[][] = []
  if (L.teeth) {
    const dx = L.foot[0] - knee[0]
    const dy = L.foot[1] - knee[1]
    const l = Math.hypot(dx, dy) || 1
    const ux = dx / l
    const uy = dy / l
    // The outer edge is the side the tarsus points to.
    const s = Math.sign(-uy * L.toe) || 1
    const nx = -uy * s
    const ny = ux * s
    for (let i = 0; i < L.teeth; i++) {
      const k = 0.3 + (i / Math.max(1, L.teeth)) * 0.62
      const bx = knee[0] + dx * k + nx * wK * 0.35
      const by = knee[1] + dy * k + ny * wK * 0.35
      teeth.push([[bx, by], [bx + nx * L.w * 0.55 + ux * L.w * 0.35, by + ny * L.w * 0.55 + uy * L.w * 0.35]])
    }
  }

  for (const tooth of teeth) stroke(ctx, tooth, L.w * 0.34, L.w * 0.02, L.ink, L.seed + 9)
  stroke(ctx, [L.hip, fm, knee], L.w + ol, wK + ol, L.ink, L.seed)
  stroke(ctx, [knee, L.foot], wK + ol, wF + ol, L.ink, L.seed + 2)
  stroke(ctx, tarsus, wF + ol * 0.8, ol * 0.5, L.ink, L.seed + 4)

  segment(ctx, [L.hip, fm, knee], L.w, wK, L.tone.base, L.seed, L.tone.lit)
  segment(ctx, [knee, L.foot], wK, wF, L.tone.base, L.seed + 2, L.tone.lit)
  stroke(ctx, tarsus, wF, L.w * 0.1, L.tone.shade, L.seed + 4)

  // The knee: a small hard nub, which is what makes the leg read as jointed.
  nub(ctx, knee[0], knee[1], wK * 0.6, L.tone, L.ink, ol * 0.6, L.seed + 6)
  return knee
}

interface EyeSpec {
  /** Resting lid, 0 open … 1 shut. The frown lives here. */
  lid: number
  /** Lid edge slope; positive lowers the +x end. */
  slant: number
  /** Where the pupil is looking, −1…1 each axis. */
  look: Pt
  pupil?: number
  iris?: string
  lidTone: string
  ink: string
  seed: number
}

/**
 * A cartoon bug eye: big sclera, big pupil, and a heavy slanted LID.
 *
 * The lid is the whole expression. A brow line floating over an open eye reads
 * as surprise at 30 px; a lid cutting straight across the top of the pupil
 * reads as "determined" at any size, and slanting it toward the nose turns
 * determined into up-to-no-good.
 */
const bugEye = (
  ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number,
  o: EyeSpec, t: number
): void => {
  const lid = Math.max(o.lid, blink(t, BLINK_AT))
  const ball = blob(x, y, rx, ry, o.seed, 0.04)
  cel(ctx, ball, { base: '#fffcf4', shade: '#e4d9c6' }, {
    shade: terminator(ball, SHADOW_DIR, 0.34, 0.1, o.seed)
  })
  ctx.save()
  ctx.beginPath(); trace(ctx, ball); ctx.clip()
  const r = Math.min(rx, ry)
  const px = x + o.look[0] * rx * 0.34
  const py = y + o.look[1] * ry * 0.3
  const pr = r * (o.pupil ?? 0.56)
  if (o.iris) fillShape(ctx, blob(px, py, pr * 1.32, pr * 1.36, o.seed + 1, 0.05), o.iris)
  fillShape(ctx, blob(px, py, pr, pr * 1.06, o.seed + 2, 0.05), '#140e12')
  fillShape(ctx, blob(px - pr * 0.34, py - pr * 0.4, pr * 0.38, pr * 0.3, o.seed + 3, 0.2), 'rgba(255,255,255,0.95)')
  fillShape(ctx, blob(px + pr * 0.4, py + pr * 0.38, pr * 0.15, pr * 0.12, o.seed + 4, 0.2), 'rgba(255,255,255,0.6)')

  // The lid: flat across, slightly sagging in the middle like a real eyelid.
  const edge = y - ry + lid * ry * 2
  const w = rx * 1.6
  const yl = edge - o.slant * w
  const yr = edge + o.slant * w
  ctx.beginPath()
  ctx.moveTo(x - w, y - ry * 2.2)
  ctx.lineTo(x + w, y - ry * 2.2)
  ctx.lineTo(x + w, yr)
  ctx.quadraticCurveTo(x, edge + ry * 0.16, x - w, yl)
  ctx.closePath()
  ctx.fillStyle = o.lidTone
  ctx.fill()
  ctx.restore()

  ink(ctx, ball, { width: r * 0.26, color: o.ink, seed: o.seed + 5, breakUp: 0.12 })
  // Lash line along the lid edge, running a touch past the eye: at game size
  // this one mark IS the eyebrow.
  if (lid < 0.97) {
    const pts: Pt[] = []
    for (let i = 0; i <= 8; i++) {
      const u = (i / 8) * 2 - 1
      pts.push([x + u * rx * 1.18, edge + o.slant * u * w + ry * 0.16 * (1 - u * u) - ry * 0.02])
    }
    stroke(ctx, pts, r * 0.22, r * 0.34, o.ink, o.seed + 6)
  } else {
    stroke(ctx, [[x - rx, y + ry * 0.1], [x, y + ry * 0.2], [x + rx, y + ry * 0.1]], r * 0.2, r * 0.2, o.ink, o.seed + 6)
  }
}

/**
 * An elbowed antenna: a long straight scape, a knee pointing up, then a whip
 * that droops forward to a club. Angles are absolute; the caller adds the lag.
 */
const antenna = (
  ctx: CanvasRenderingContext2D, base: Pt,
  scape: number, scapeA: number, whip: number, whipA: number, whipBend: number,
  w: number, fill: string, inkC: string, seed: number
): void => {
  const elbow: Pt = [base[0] + Math.cos(scapeA) * scape, base[1] + Math.sin(scapeA) * scape]
  const n = 7
  const pts: Pt[] = [elbow]
  let p = elbow
  for (let i = 0; i < n; i++) {
    const a = whipA + whipBend * (i / (n - 1))
    p = [p[0] + Math.cos(a) * whip / n, p[1] + Math.sin(a) * whip / n]
    pts.push(p)
  }
  const ol = w * 0.6
  stroke(ctx, [base, elbow], w + ol, w * 0.85 + ol, inkC, seed)
  stroke(ctx, pts, w * 0.85 + ol, w * 0.7 + ol, inkC, seed + 1)
  stroke(ctx, [base, elbow], w, w * 0.85, fill, seed)
  stroke(ctx, pts, w * 0.85, w * 0.7, fill, seed + 1)
  const k = blob(elbow[0], elbow[1], w * 0.6, w * 0.6, seed + 3, 0.1)
  fillShape(ctx, shrink(k, 1 + ol / (w * 0.6), elbow[0], elbow[1]), inkC)
  fillShape(ctx, k, fill)
  const tip = pts[n]!
  const c = egg(tip[0], tip[1], w * 0.78, w * 0.9, 0.9, seed + 4, 0.1)
  fillShape(ctx, shrink(c, 1 + ol / w, tip[0], tip[1]), inkC)
  fillShape(ctx, c, fill)
}

/**
 * A long whip antenna: a chain of segments turning a little at each joint,
 * with a travelling wave running down it so it whips rather than waves.
 */
const whipAntenna = (
  ctx: CanvasRenderingContext2D, base: Pt, len: number, angle: number,
  curl: number, wave: number, g: number, phase: number,
  w: number, fill: string, inkC: string, seed: number
): void => {
  const n = 16
  const pts: Pt[] = [base]
  let a = angle
  let p = base
  for (let i = 0; i < n; i++) {
    const k = i / n
    // The wave travels tip-ward and grows along the whip: the base barely
    // moves, the tip lashes.
    a += curl / n + osc(g, 1, phase - k * 0.8) * wave * k / n * 3
    p = [p[0] + Math.cos(a) * len / n, p[1] + Math.sin(a) * len / n]
    pts.push(p)
  }
  stroke(ctx, pts, w * 1.9, w * 0.7, inkC, seed)
  stroke(ctx, pts, w, w * 0.2, fill, seed + 1)
}

/** Abdomen plates: curved bands across a hinged segment, clipped to it. */
const bands = (
  ctx: CanvasRenderingContext2D, S: number, shape: Pt[], at: Pt, angle: number,
  xs: readonly number[], top: number, bottom: number, color: string, seed: number, rim?: string
): void => {
  ctx.save()
  ctx.beginPath(); trace(ctx, shape); ctx.clip()
  xs.forEach((bx, i) => {
    const band = pivot([
      [bx * S, top * S], [(bx + 0.045) * S, (top + bottom) * 0.5 * S], [(bx + 0.03) * S, bottom * S]
    ], at[0], at[1], angle)
    stroke(ctx, band, 0.012 * S, 0.02 * S, color, seed + i * 2)
    if (rim) stroke(ctx, band.map(([x, y]) => [x + 0.02 * S, y] as Pt), 0.005 * S, 0.01 * S, rim, seed + i * 2 + 1)
  })
  ctx.restore()
}

// ─── Ants ───────────────────────────────────────────────────────────────────

/** Ant palette. The black ant's ink is near-black: a brown line round a black body glows. */
interface AntLook {
  body: Required<CelTones>
  gaster: Required<CelTones>
  leg: CelTones
  far: CelTones
  jaw: CelTones
  ink: string
  spec: string
  lid: string
  band: string
  bandRim?: string
}

const BLACK_ANT: AntLook = {
  body: { base: '#3e3d58', shade: '#2b2a3f', deep: '#1d1c29', lit: '#5d6588' },
  gaster: { base: '#393851', shade: '#28273a', deep: '#1b1a26', lit: '#565d80' },
  leg: { base: '#3a3952', shade: '#26253a', lit: '#5a6184' },
  far: { base: '#26253a', shade: '#1b1a26', lit: '#34334a' },
  jaw: { base: '#4b4a66', shade: '#2b2a3f', lit: '#6a7196' },
  ink: '#15101a',
  spec: 'rgba(170,206,255,0.9)',
  lid: '#46456a',
  band: 'rgba(12,10,18,0.55)',
  bandRim: 'rgba(120,140,190,0.35)'
}

const RED_ANT: AntLook = {
  body: tones('#dd4b2b', 1.05),
  gaster: tones('#b93822', 1.05),
  leg: { base: '#cf4a2a', shade: '#9e2f1a', lit: '#ec7d55' },
  far: { base: '#9e2f1a', shade: '#74200f', lit: '#b93822' },
  jaw: { base: '#a8321c', shade: '#7a2210', lit: '#d8603c' },
  ink: INK,
  spec: 'rgba(255,226,196,0.9)',
  lid: '#c64024',
  band: 'rgba(70,16,8,0.5)'
}

type LegRow = readonly [number, number, number, number, number, number, number, number]

/**
 * One side's walking legs. `far` legs hang a touch higher and further back and
 * swing on the other tripod.
 */
const antLegs = (
  ctx: CanvasRenderingContext2D, S: number, g: number, bob: number,
  rows: readonly LegRow[], far: boolean, L: AntLook, stride: number, lift: number,
  w: number, seed: number
): void => {
  rows.forEach(([hx0, hy0, fx, fe, ti, bend, ph, toe], i) => {
    const st = footStep(g + ph + (far ? 0.5 : 0), stride * S, lift * S)
    const hip: Pt = [(hx0 + (far ? 0.04 : 0)) * S, (hy0 - (far ? 0.05 : 0)) * S + bob]
    const foot: Pt = [(fx + (far ? 0.07 : 0)) * S - st[0], (far ? 0.95 : 1.0) * S + st[1]]
    bugLeg(ctx, {
      hip, foot, femur: fe * S, tibia: ti * S, bend,
      w: (far ? w * 0.88 : w) * S, tone: far ? L.far : L.leg, ink: L.ink,
      toe, seed: seed + i * 12 + (far ? 6 : 0)
    })
  })
}

// ─── 1 · Black Ant (grumpling) ──────────────────────────────────────────────

/** Its contact shadow — baked into the frames, and laid under a painted strip. */
export const BLACK_ANT_SHADOW: ShadowSpec = { w: 0.7, y: 1.02, a: 0.24 }

/**
 * The Black Ant — the baseline, and the most common thing on screen.
 *
 * Three glossy beads on six legs: a big round head, a small humped thorax, a
 * fat striped abdomen. Everything cute about it is in the head, and everything
 * evil is in the lids.
 */
export const drawBlackAnt = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  const L = BLACK_ANT
  const g = gait(t, 880)
  // Two tripods, two footfalls, two dips per cycle.
  const bob = bodyBob(g, 0.014) * S
  // The head rides a narrow neck and arrives late; the antennae later still.
  const lag = (bodyBob(g - 0.12, 0.014) - bodyBob(g, 0.014)) * S
  const lag2 = (bodyBob(g - 0.24, 0.014) - bodyBob(g, 0.014)) / 0.014

  drawShadowSpec(ctx, S, BLACK_ANT_SHADOW)

  // Tripod A = near front, far middle, near hind; B the other three.
  // hipX, hipY, footX, femur, tibia, bend, phase, toe
  const LEGS: readonly LegRow[] = [
    [-0.2, 0.5, -0.62, 0.36, 0.42, 1, 0.0, -1],
    [-0.08, 0.54, 0.02, 0.3, 0.34, -1, 0.5, 1],
    [0.02, 0.52, 0.5, 0.42, 0.44, -1, 0.0, 1]
  ]
  antLegs(ctx, S, g, bob, LEGS, true, L, 0.2, 0.085, 0.07, 3000)

  const hx = -0.46 * S
  const hy = 0.17 * S + bob + lag * 1.4

  // ── Far antenna and far mandible sit behind the head ──
  const aSway = osc(g, 1, 0.3) * 0.06
  antenna(ctx, [hx - 0.24 * S, hy - 0.22 * S], 0.27 * S, -1.98 - lag2 * 0.05 + aSway,
    0.3 * S, -2.6 - lag2 * 0.1 + aSway * 1.6, -0.75, 0.036 * S, L.far.base, L.ink, 3100)

  const chomp = osc(g, 2) * 0.1
  const farJaw = spike(hx - 0.28 * S, hy + 0.19 * S, 0.19 * S, 0.075 * S, Math.PI + 0.1 - chomp, -1.2, 0.12)
  paint(ctx, S, farJaw.outline, { base: '#2c2b40', shade: '#1b1a26' }, 3110,
    { line: LINE.fine, inkColor: L.ink, deep: false, lit: false, breakUp: 0.1 })

  // ── Gaster: the big glossy abdomen, hinged at the waist ──
  const waist: Pt = [0.18 * S, 0.47 * S + bob]
  const tilt = -0.2 + osc(g, 1, 0.2) * 0.045
  const gaster = pivot(egg(0.3 * S, -0.05 * S, 0.35 * S, 0.28 * S, 0.92, 3120, 0.04), waist[0], waist[1], tilt)
  paint(ctx, S, gaster, L.gaster, 3121, { line: LINE.major, inkColor: L.ink, amp: 0.1, breakUp: 0.18 })
  bands(ctx, S, gaster, waist, tilt, [0.14, 0.32, 0.48], -0.4, 0.3, L.band, 3124, L.bandRim)
  const gc = pivot([[0.24 * S, -0.18 * S]], waist[0], waist[1], tilt)[0]!
  gloss(ctx, gaster, gc[0], gc[1], 0.19 * S, 0.055 * S, tilt - 0.3, L.spec, 3130, 0.026 * S)

  // ── Petiole: the little knot at the waist ──
  const pet = blob(0.15 * S, 0.45 * S + bob, 0.065 * S, 0.08 * S, 3135, 0.08)
  paint(ctx, S, pet, L.body, 3136, { line: LINE.mid, inkColor: L.ink, deep: false, breakUp: 0.1 })

  // ── Near legs: the thorax overlaps their roots, so they hang FROM it ──
  antLegs(ctx, S, g, bob, LEGS, false, L, 0.2, 0.085, 0.07, 3000)

  // ── Thorax: humped at the front, where the legs hang from ──
  const thorax = smooth(rough([
    [-0.32 * S, 0.4 * S + bob],
    [-0.24 * S, 0.29 * S + bob],
    [-0.08 * S, 0.3 * S + bob],
    [0.04 * S, 0.36 * S + bob],
    [0.12 * S, 0.46 * S + bob],
    [0.04 * S, 0.56 * S + bob],
    [-0.16 * S, 0.57 * S + bob],
    [-0.3 * S, 0.5 * S + bob]
  ], 0.008 * S, 3140))
  paint(ctx, S, thorax, L.body, 3141, { line: LINE.mid, inkColor: L.ink, amp: 0.1, breakUp: 0.14 })
  gloss(ctx, thorax, -0.16 * S, 0.34 * S + bob, 0.1 * S, 0.028 * S, -0.25, L.spec, 3142, 0.018 * S)

  // ── Neck ──
  const neck: Pt[] = [[-0.3 * S, 0.42 * S + bob], [hx + 0.2 * S, hy + 0.14 * S]]
  stroke(ctx, neck, 0.13 * S, 0.12 * S, L.ink, 3145)
  stroke(ctx, neck, 0.08 * S, 0.08 * S, L.body.shade, 3146)

  // ── Head: the character. Big, round, glossy ──
  const head = blob(hx, hy, 0.35 * S, 0.32 * S, 3150, 0.045)
  paint(ctx, S, head, L.body, 3151, { ...FACE, line: LINE.major, inkColor: L.ink, amp: 0.1, breakUp: 0.16 })
  gloss(ctx, head, hx + 0.03 * S, hy - 0.21 * S, 0.17 * S, 0.05 * S, -0.3, L.spec, 3152, 0.028 * S)
  // Cheek catching the sky — a cool rim on the lower front, so the face has a
  // plane to sit on even though the head is nearly black.
  ctx.save()
  ctx.beginPath(); trace(ctx, head); ctx.clip()
  fillShape(ctx, blob(hx - 0.31 * S, hy + 0.12 * S, 0.1 * S, 0.14 * S, 3153, 0.1), 'rgba(120,150,210,0.22)')
  ctx.restore()

  // ── Face: big eyes under heavy lids, the far one foreshortened ──
  bugEye(ctx, hx - 0.26 * S, hy - 0.05 * S, 0.08 * S, 0.12 * S, {
    lid: 0.34, slant: 0.34, look: [-0.8, 0.15], lidTone: L.lid, ink: L.ink, seed: 3160, pupil: 0.6
  }, t)
  bugEye(ctx, hx - 0.05 * S, hy - 0.03 * S, 0.13 * S, 0.145 * S, {
    lid: 0.3, slant: -0.3, look: [-0.7, 0.15], lidTone: L.lid, ink: L.ink, seed: 3170
  }, t)
  // A small, set frown: the corners pulled down, the near side more.
  stroke(ctx, [
    [hx - 0.31 * S, hy + 0.18 * S], [hx - 0.24 * S, hy + 0.145 * S],
    [hx - 0.15 * S, hy + 0.15 * S], [hx - 0.09 * S, hy + 0.19 * S]
  ], 0.012 * S, 0.02 * S, L.ink, 3180)

  // ── Near mandible, chomping twice a cycle ──
  const jaw = spike(hx - 0.22 * S, hy + 0.23 * S, 0.22 * S, 0.09 * S, Math.PI + 0.05 + chomp, -1.25, 0.12)
  paint(ctx, S, jaw.outline, L.jaw, 3185, { line: LINE.mid, inkColor: L.ink, deep: false, breakUp: 0.1 })
  // One tooth on the inside edge — enough to say "bitey".
  const jt = jaw.spine[6]!
  stroke(ctx, [jt, [jt[0] + 0.005 * S, jt[1] + 0.04 * S]], 0.03 * S, 0.004 * S, L.ink, 3186)

  // ── Near antenna: the elbow sways, the whip lags behind it ──
  antenna(ctx, [hx - 0.1 * S, hy - 0.28 * S], 0.3 * S, -1.74 - lag2 * 0.06 + aSway * 0.8,
    0.32 * S, -2.5 - lag2 * 0.14 + aSway * 1.8, -0.8, 0.042 * S, L.body.base, L.ink, 3190)
}

// ─── 2 · Red Ant (rattlejack) ───────────────────────────────────────────────

const PEBBLE = tones('#9aa3ad', 1.05)

/** Its contact shadow — baked into the frames, and laid under a painted strip. */
export const RED_ANT_SHADOW: ShadowSpec = { w: 0.62, y: 1.02, a: 0.26 }

/**
 * The Red Ant: the Black Ant's hot-headed sibling.
 *
 * Leaner and taller — it walks on four legs and holds a pebble over its head
 * with the front two. That pebble is the silhouette: at 20 px the two ants are
 * a round black shape and a red shape with a rock on top.
 */
export const drawRedAnt = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  const L = RED_ANT
  const g = gait(t, 760)
  const bob = bodyBob(g, 0.018) * S
  const lag = (bodyBob(g - 0.12, 0.018) - bodyBob(g, 0.018)) * S
  const lag2 = (bodyBob(g - 0.24, 0.018) - bodyBob(g, 0.018)) / 0.018

  drawShadowSpec(ctx, S, RED_ANT_SHADOW)

  // Four walking legs, trotting in diagonal pairs.
  const LEGS: readonly LegRow[] = [
    [-0.06, 0.48, -0.32, 0.36, 0.4, 1, 0.0, -1],
    [0.06, 0.48, 0.44, 0.4, 0.44, -1, 0.5, 1]
  ]
  antLegs(ctx, S, g, bob, LEGS, true, L, 0.22, 0.1, 0.064, 3300)

  const hx = -0.36 * S
  const hy = -0.02 * S + bob + lag * 1.4

  // The pebble rides on the arms, a beat behind the head.
  const px = hx + 0.1 * S
  const py = hy - 0.52 * S + lag * 2.6
  const tilt = osc(g, 1, 0.1) * 0.05

  // ── Far arm: behind the head, reaching up to the pebble ──
  bugLeg(ctx, {
    hip: [-0.16 * S, 0.3 * S + bob], foot: [px - 0.16 * S, py + 0.13 * S],
    femur: 0.4 * S, tibia: 0.36 * S, bend: -1,
    w: 0.05 * S, tone: L.far, ink: L.ink, toe: -1, seed: 3330, tarsus: 1.2
  })

  // ── Far antenna ──
  const aSway = osc(g, 1, 0.3) * 0.07
  antenna(ctx, [hx - 0.25 * S, hy - 0.2 * S], 0.22 * S, -2.1 - lag2 * 0.05 + aSway,
    0.24 * S, -2.7 - lag2 * 0.1 + aSway * 1.6, -0.8, 0.03 * S, L.far.base, L.ink, 3340)

  const chomp = osc(g, 2) * 0.12
  const farJaw = spike(hx - 0.27 * S, hy + 0.19 * S, 0.18 * S, 0.07 * S, Math.PI + 0.25 - chomp, -1.3, 0.12)
  paint(ctx, S, farJaw.outline, { base: L.far.base, shade: L.far.shade }, 3345,
    { line: LINE.fine, deep: false, lit: false, breakUp: 0.1 })

  // ── Gaster: longer and leaner than the black ant's, darker at the tip ──
  const waist: Pt = [0.26 * S, 0.44 * S + bob]
  const gt = -0.14 + osc(g, 1, 0.2) * 0.05
  const gaster = pivot(egg(0.3 * S, -0.02 * S, 0.33 * S, 0.21 * S, 0.9, 3350, 0.04), waist[0], waist[1], gt)
  paint(ctx, S, gaster, L.gaster, 3351, { line: LINE.major, amp: 0.1, breakUp: 0.2 })
  bands(ctx, S, gaster, waist, gt, [0.16, 0.33, 0.48], -0.3, 0.25, L.band, 3354)
  // The stinger end, a shade darker.
  const tip = pivot([[0.6 * S, 0.0]], waist[0], waist[1], gt)[0]!
  ctx.save()
  ctx.beginPath(); trace(ctx, gaster); ctx.clip()
  fillShape(ctx, blob(tip[0], tip[1], 0.1 * S, 0.14 * S, 3359, 0.1), 'rgba(90,20,10,0.45)')
  ctx.restore()
  const gc = pivot([[0.26 * S, -0.12 * S]], waist[0], waist[1], gt)[0]!
  gloss(ctx, gaster, gc[0], gc[1], 0.17 * S, 0.04 * S, gt - 0.2, L.spec, 3360, 0.022 * S)

  // ── Two petiole nodes: the fire ant's double waist ──
  for (const [nx, ny, r, sd] of [[0.2, 0.43, 0.055, 3362], [0.11, 0.45, 0.06, 3364]] as const) {
    const node = blob(nx * S, ny * S + bob, r * S, r * 1.2 * S, sd, 0.08)
    paint(ctx, S, node, L.body, sd + 1, { line: LINE.mid, deep: false, breakUp: 0.1 })
  }

  antLegs(ctx, S, g, bob, LEGS, false, L, 0.22, 0.1, 0.064, 3300)

  // ── Thorax: reared up at the front, so the head and the rock sit high ──
  const thorax = smooth(rough([
    [-0.22 * S, 0.22 * S + bob],
    [-0.12 * S, 0.15 * S + bob],
    [0.0 * S, 0.22 * S + bob],
    [0.08 * S, 0.34 * S + bob],
    [0.1 * S, 0.45 * S + bob],
    [0.02 * S, 0.52 * S + bob],
    [-0.1 * S, 0.5 * S + bob],
    [-0.2 * S, 0.38 * S + bob]
  ], 0.008 * S, 3370))
  paint(ctx, S, thorax, L.body, 3371, { line: LINE.mid, amp: 0.1, breakUp: 0.16 })
  gloss(ctx, thorax, -0.1 * S, 0.22 * S + bob, 0.08 * S, 0.024 * S, -0.7, L.spec, 3372, 0.015 * S)

  // ── Neck ──
  const neck: Pt[] = [[-0.18 * S, 0.24 * S + bob], [hx + 0.14 * S, hy + 0.2 * S]]
  stroke(ctx, neck, 0.12 * S, 0.11 * S, L.ink, 3375)
  stroke(ctx, neck, 0.075 * S, 0.075 * S, L.body.shade, 3376)

  // ── Head: bigger than the black ant's, a little squarer in the jaw ──
  const head = egg(hx, hy, 0.34 * S, 0.31 * S, 1.06, 3380, 0.045)
  paint(ctx, S, head, L.body, 3381, { ...FACE, line: LINE.major, amp: 0.1, breakUp: 0.18 })
  gloss(ctx, head, hx + 0.03 * S, hy - 0.2 * S, 0.15 * S, 0.045 * S, -0.3, L.spec, 3382, 0.026 * S)

  // Mismatched: the far eye squints harder — this one is enjoying itself.
  bugEye(ctx, hx - 0.26 * S, hy - 0.04 * S, 0.075 * S, 0.105 * S, {
    lid: 0.46, slant: 0.4, look: [-0.8, 0.2], lidTone: L.lid, ink: L.ink, seed: 3390, iris: '#ffcf3f', pupil: 0.5
  }, t)
  bugEye(ctx, hx - 0.05 * S, hy - 0.02 * S, 0.125 * S, 0.14 * S, {
    lid: 0.28, slant: -0.34, look: [-0.75, 0.2], lidTone: L.lid, ink: L.ink, seed: 3395, iris: '#ffcf3f', pupil: 0.46
  }, t)
  // A lopsided grin: up at the back corner, which is the mischief.
  stroke(ctx, [
    [hx - 0.3 * S, hy + 0.15 * S], [hx - 0.22 * S, hy + 0.19 * S],
    [hx - 0.12 * S, hy + 0.18 * S], [hx - 0.05 * S, hy + 0.12 * S]
  ], 0.012 * S, 0.022 * S, L.ink, 3398)

  const jaw = spike(hx - 0.21 * S, hy + 0.23 * S, 0.21 * S, 0.085 * S, Math.PI + 0.2 + chomp, -1.35, 0.12)
  paint(ctx, S, jaw.outline, L.jaw, 3400, { line: LINE.mid, deep: false, breakUp: 0.1 })

  // ── The pebble, held overhead ──
  const rock = smooth(pivot(rough([
    [-0.24 * S, 0.03 * S], [-0.17 * S, -0.14 * S], [0.02 * S, -0.19 * S], [0.19 * S, -0.12 * S],
    [0.24 * S, 0.05 * S], [0.12 * S, 0.17 * S], [-0.12 * S, 0.17 * S]
  ], 0.014 * S, 3410), px, py, tilt))
  paint(ctx, S, rock, PEBBLE, 3411, { line: LINE.major, amp: 0.08, breakUp: 0.2 })
  // Speckle, so it reads as stone rather than a grey egg.
  ctx.save()
  ctx.beginPath(); trace(ctx, rock); ctx.clip()
  for (const [sx, sy, sr, sd] of [
    [-0.1, 0.03, 0.026, 3412], [0.07, -0.07, 0.019, 3413], [0.12, 0.07, 0.024, 3414], [-0.02, 0.1, 0.014, 3415]
  ] as const) {
    fillShape(ctx, blob(px + sx * S, py + sy * S, sr * S, sr * 0.8 * S, sd, 0.2), 'rgba(60,66,78,0.45)')
  }
  ctx.restore()
  gloss(ctx, rock, px - 0.07 * S, py - 0.1 * S, 0.1 * S, 0.035 * S, -0.3, 'rgba(236,242,248,0.7)', 3416)

  // ── Near arm: up behind the eyes, hand on the rock's near side ──
  bugLeg(ctx, {
    hip: [-0.12 * S, 0.3 * S + bob], foot: [px + 0.15 * S, py + 0.13 * S],
    femur: 0.42 * S, tibia: 0.38 * S, bend: -1,
    w: 0.06 * S, tone: L.leg, ink: L.ink, toe: -1, seed: 3420, tarsus: 1.3
  })

  // ── Near antenna ──
  antenna(ctx, [hx - 0.12 * S, hy - 0.27 * S], 0.24 * S, -1.95 - lag2 * 0.06 + aSway * 0.8,
    0.26 * S, -2.65 - lag2 * 0.14 + aSway * 1.8, -0.85, 0.036 * S, L.body.base, L.ink, 3430)
}

// ─── 3 · Cockroach (cinderhound) ────────────────────────────────────────────

const ROACH = tones('#9a4a20', 1.1)
const ROACH_FAR: CelTones = { base: ROACH.shade, shade: ROACH.deep, lit: ROACH.base }
const ROACH_HEAD = tones('#8e4520', 1.05)
const ROACH_LEG: CelTones = { base: '#ab6531', shade: '#7c4321', lit: '#d0935a' }
const ROACH_LEG_FAR: CelTones = { base: '#7c4321', shade: '#5a2e16', lit: '#96562f' }

/** Its contact shadow — baked into the frames, and laid under a painted strip. */
export const COCKROACH_SHADOW: ShadowSpec = { w: 0.86, y: 1.02, a: 0.26 }

/**
 * The Cockroach: low, long and glossy, with antennae longer than its body.
 *
 * Built as the inverse of the ants: where they are three round beads on tall
 * legs, this is one long glossy oval skimming the sand on splayed, spiny ones.
 * Its antennae sweep up and back over it like hair in a slipstream — the part
 * that says FAST before it has moved.
 *
 * The runner is drawn at the smallest scale in the roster, so the body fills
 * as much of the frame as a "low" silhouette allows: long and deep rather than
 * a flat sliver, or it vanishes against the sandbox's plank edge.
 */
export const drawCockroach = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  const g = gait(t, 620)
  const bob = bodyBob(g, 0.008) * S
  // A skitter rocks the long body nose-down on each footfall.
  const pitch = osc(g, 2, 0.15) * 0.018

  drawShadowSpec(ctx, S, COCKROACH_SHADOW)

  const LEGS = [
    [-0.36, 0.72, -0.8, 0.34, 0.38, 1, 0.0, -1],
    [-0.14, 0.74, -0.08, 0.3, 0.32, -1, 0.5, 1],
    [0.08, 0.74, 0.68, 0.44, 0.48, -1, 0.0, 1]
  ] as const
  const legs = (far: boolean): void => {
    LEGS.forEach(([hx0, hy0, fx, fe, ti, bend, ph, toe], i) => {
      const st = footStep(g + ph + (far ? 0.5 : 0), 0.28 * S, 0.075 * S)
      const hip: Pt = [(hx0 + (far ? 0.05 : 0)) * S, (hy0 - (far ? 0.05 : 0)) * S + bob]
      const foot: Pt = [(fx + (far ? 0.1 : 0)) * S - st[0], (far ? 0.95 : 1.0) * S + st[1]]
      bugLeg(ctx, {
        hip, foot, femur: fe * S, tibia: ti * S, bend,
        w: (far ? 0.06 : 0.068) * S, tone: far ? ROACH_LEG_FAR : ROACH_LEG, ink: INK,
        toe, seed: 3500 + i * 12 + (far ? 6 : 0), teeth: 3, tarsus: 2.0
      })
    })
  }
  legs(true)

  // Head: out in front of the shield, low, face forward.
  const hx = -0.76 * S
  const hy = 0.69 * S + bob

  // ── Far antenna: behind everything, whipping on its own phase ──
  whipAntenna(ctx, [hx + 0.04 * S, hy - 0.16 * S], 1.5 * S, -1.95, 2.2, 0.5, g, 0.45,
    0.028 * S, ROACH.shade, INK, 3520)

  // ── Cerci: two little prongs at the tail ──
  const tail: Pt = [0.86 * S, 0.6 * S + bob]
  for (const [a, l, sd] of [[-0.35, 0.2, 3525], [0.05, 0.17, 3527]] as const) {
    const c = spike(tail[0] - 0.04 * S, tail[1], l * S, 0.05 * S, a + osc(g, 2, sd) * 0.08, -0.2, 0.15, 6)
    paint(ctx, S, c.outline, ROACH_FAR, sd, { line: LINE.fine, deep: false, lit: false, breakUp: 0.1 })
  }

  // ── Body: one long oval — wing cases over the abdomen ──
  const pv = (pts: Pt[]): Pt[] => pivot(pts, 0.02 * S, 0.56 * S + bob, pitch)
  const body = smooth(pv(rough([
    [-0.4 * S, -0.12 * S],
    [-0.1 * S, -0.27 * S],
    [0.26 * S, -0.29 * S],
    [0.58 * S, -0.21 * S],
    [0.82 * S, -0.05 * S],
    [0.88 * S, 0.06 * S],
    [0.7 * S, 0.17 * S],
    [0.3 * S, 0.23 * S],
    [-0.12 * S, 0.23 * S],
    [-0.38 * S, 0.14 * S]
  ], 0.008 * S, 3530)))
  paint(ctx, S, body, ROACH, 3531, { line: LINE.major, amp: 0.08, breakUp: 0.16 })
  // Belly: the ringed abdomen showing under the wing cases' edge.
  ctx.save()
  ctx.beginPath(); trace(ctx, body); ctx.clip()
  const belly = pv(rough([
    [-0.3 * S, 0.12 * S], [0.1 * S, 0.08 * S], [0.5 * S, 0.08 * S], [0.84 * S, 0.04 * S],
    [0.84 * S, 0.34 * S], [-0.3 * S, 0.34 * S]
  ], 0.006 * S, 3532))
  fillShape(ctx, belly, '#733617')
  for (let i = 0; i < 5; i++) {
    const x = (-0.12 + i * 0.18) * S
    stroke(ctx, pv([[x, 0.1 * S], [x + 0.03 * S, 0.24 * S]]), 0.014 * S, 0.007 * S, 'rgba(30,14,6,0.55)', 3533 + i)
  }
  ctx.restore()
  // The wing-case edge: one long confident line down the flank.
  stroke(ctx, pv([
    [-0.3 * S, 0.03 * S], [0.1 * S, 0.08 * S], [0.48 * S, 0.07 * S], [0.82 * S, 0.0 * S]
  ]), 0.014 * S, 0.024 * S, 'rgba(40,20,10,0.75)', 3540)
  // Wing-case seam near the top, where the two cases meet.
  stroke(ctx, pv([
    [-0.1 * S, -0.23 * S], [0.3 * S, -0.23 * S], [0.64 * S, -0.13 * S]
  ]), 0.007 * S, 0.014 * S, 'rgba(40,20,10,0.45)', 3541)
  // The long glossy streak: the whole reason a roach looks like a roach.
  const bc = pv([[0.22 * S, -0.16 * S]])[0]!
  gloss(ctx, body, bc[0], bc[1], 0.4 * S, 0.045 * S, 0.03 + pitch, 'rgba(255,214,170,0.82)', 3542, 0.028 * S)

  // ── Near legs, over the body ──
  legs(false)

  // ── Pronotum: the shield over the head, with its pale leading rim ──
  const shield = smooth(pv(egg(-0.46 * S, -0.05 * S, 0.31 * S, 0.22 * S, 0.8, 3555, 0.04)))
  paint(ctx, S, shield, tones('#843f1b', 1.1), 3556, { line: LINE.major, amp: 0.08, breakUp: 0.12 })
  occlude(ctx, shield, 0.44, 0.78, 0.06 * S, 'rgba(244,214,160,0.95)', 3557)
  const sc = pv([[-0.44 * S, -0.16 * S]])[0]!
  gloss(ctx, shield, sc[0], sc[1], 0.15 * S, 0.035 * S, -0.15, 'rgba(255,232,200,0.85)', 3559, 0.022 * S)

  // ── Head: round, tucked under the shield's lip ──
  const head = blob(hx, hy, 0.2 * S, 0.18 * S, 3550, 0.05)
  paint(ctx, S, head, ROACH_HEAD, 3551, { ...FACE, line: LINE.mid, amp: 0.1, breakUp: 0.15 })
  gloss(ctx, head, hx + 0.02 * S, hy - 0.11 * S, 0.09 * S, 0.028 * S, -0.3, 'rgba(255,220,180,0.7)', 3552)
  // Mouthparts: two stubby palps under the chin.
  for (const [dx, sd] of [[-0.13, 3553], [-0.05, 3554]] as const) {
    stroke(ctx, [[hx + dx * S, hy + 0.13 * S], [hx + (dx - 0.04) * S, hy + 0.22 * S]], 0.034 * S, 0.02 * S, INK, sd)
  }

  // ── Face: sly. A big near eye, a squinting far one, and a smirk ──
  bugEye(ctx, hx - 0.12 * S, hy - 0.02 * S, 0.062 * S, 0.09 * S, {
    lid: 0.42, slant: 0.4, look: [-0.8, 0.1], lidTone: ROACH_HEAD.base, ink: INK, seed: 3560, pupil: 0.62
  }, t)
  bugEye(ctx, hx + 0.035 * S, hy - 0.02 * S, 0.095 * S, 0.105 * S, {
    lid: 0.36, slant: -0.36, look: [-0.8, 0.1], lidTone: ROACH_HEAD.base, ink: INK, seed: 3565
  }, t)
  // A smirk: flat, then hooking up at the back.
  stroke(ctx, [
    [hx - 0.15 * S, hy + 0.11 * S], [hx - 0.06 * S, hy + 0.12 * S], [hx + 0.03 * S, hy + 0.09 * S]
  ], 0.011 * S, 0.02 * S, INK, 3570)

  // ── Near antenna: the long whip, sweeping up and back over the body ──
  whipAntenna(ctx, [hx - 0.02 * S, hy - 0.17 * S], 1.6 * S, -2.12, 2.3, 0.6, g, 0.0,
    0.032 * S, ROACH.base, INK, 3575)
}

// ─── 4 · Rhino Beetle (snaggletusk) ─────────────────────────────────────────

const SHELL = tones('#6c2c19', 1.12)
const HEAD_SHELL = tones('#7a3520', 1.1)
const BEETLE_LEG: CelTones = { base: '#6c2e1a', shade: '#4a1d10', lit: '#a45c3c' }
const BEETLE_LEG_FAR: CelTones = { base: '#4a1d10', shade: '#2e120a', lit: '#6c2e1a' }
const SHELL_SPEC = 'rgba(255,206,168,0.88)'

/** Its contact shadow — baked into the frames, and laid under a painted strip. */
export const RHINO_BEETLE_SHADOW: ShadowSpec = { w: 0.8, y: 1.02, a: 0.3 }

/**
 * The Rhino Beetle: a battering ram with legs.
 *
 * Everything leans forward — a tall domed back, the pronotum lower, the head
 * lowest of all, and the horn sweeping up off the very front. The weight is in
 * the back and the point is in the front, which is exactly the job: hit a wall.
 */
export const drawRhinoBeetle = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  const g = gait(t, 1350)
  // Heavy: a deeper dip on each tripod's landing, and a shove forward with it.
  const bob = bodyBob(g, 0.018) * S
  const shove = osc(g, 2, 0.1) * 0.012 * S
  const lag = (bodyBob(g - 0.1, 0.018) - bodyBob(g, 0.018)) * S

  drawShadowSpec(ctx, S, RHINO_BEETLE_SHADOW)

  const LEGS = [
    [-0.34, 0.66, -0.66, 0.3, 0.36, 1, 0.0, -1],
    [0.02, 0.72, 0.06, 0.3, 0.32, -1, 0.5, 1],
    [0.3, 0.72, 0.66, 0.36, 0.38, -1, 0.0, 1]
  ] as const
  const legs = (far: boolean): void => {
    LEGS.forEach(([hx0, hy0, fx, fe, ti, bend, ph, toe], i) => {
      const st = footStep(g + ph + (far ? 0.5 : 0), 0.15 * S, 0.06 * S)
      const hip: Pt = [(hx0 + (far ? 0.05 : 0)) * S + shove, (hy0 - (far ? 0.06 : 0)) * S + bob]
      const foot: Pt = [(fx + (far ? 0.08 : 0)) * S - st[0], (far ? 0.95 : 1.0) * S + st[1]]
      bugLeg(ctx, {
        hip, foot, femur: fe * S, tibia: ti * S, bend,
        w: (far ? 0.09 : 0.1) * S, tone: far ? BEETLE_LEG_FAR : BEETLE_LEG, ink: INK,
        toe, seed: 3700 + i * 12 + (far ? 6 : 0), teeth: 3, tarsus: 1.6
      })
    })
  }
  legs(true)

  const ox = shove
  const oy = bob

  // ── Elytra: the big glossy dome ──
  const dome = smooth(rough([
    [-0.1 * S + ox, 0.3 * S + oy],
    [0.16 * S + ox, 0.12 * S + oy],
    [0.46 * S + ox, 0.1 * S + oy],
    [0.72 * S + ox, 0.22 * S + oy],
    [0.86 * S + ox, 0.46 * S + oy],
    [0.8 * S + ox, 0.68 * S + oy],
    [0.52 * S + ox, 0.8 * S + oy],
    [0.1 * S + ox, 0.8 * S + oy],
    [-0.1 * S + ox, 0.66 * S + oy]
  ], 0.008 * S, 3720))
  paint(ctx, S, dome, SHELL, 3721, { line: LINE.major, amp: 0.08, breakUp: 0.14 })
  // The shell's lower rim: a hard edge where the case folds under.
  stroke(ctx, [
    [0.0 * S + ox, 0.68 * S + oy], [0.3 * S + ox, 0.72 * S + oy], [0.6 * S + ox, 0.68 * S + oy], [0.8 * S + ox, 0.58 * S + oy]
  ], 0.014 * S, 0.022 * S, 'rgba(34,12,6,0.7)', 3722)
  // A strong highlight: a long band and a hot core, then the dot.
  gloss(ctx, dome, 0.34 * S + ox, 0.2 * S + oy, 0.3 * S, 0.07 * S, 0.12, 'rgba(255,190,150,0.42)', 3723)
  gloss(ctx, dome, 0.3 * S + ox, 0.19 * S + oy, 0.2 * S, 0.032 * S, 0.1, SHELL_SPEC, 3724, 0.03 * S)

  // ── Near legs sit under the shell's rim, over the far ones ──
  legs(false)

  // ── Pronotum: a lower dome in front of the shell ──
  const pro = blob(-0.26 * S + ox, 0.44 * S + oy, 0.3 * S, 0.27 * S, 3730, 0.04)

  // The small second horn, jutting forward off the pronotum's brow. Drawn
  // first, so the pronotum's own outline seats its root.
  const small = spike(-0.4 * S + ox, 0.3 * S + oy, 0.24 * S, 0.12 * S, Math.PI + 0.2, 0.55, 0.14)
  paint(ctx, S, small.outline, SHELL, 3735, { line: LINE.mid, amp: 0.08, deep: false, breakUp: 0.1 })

  paint(ctx, S, pro, SHELL, 3731, { line: LINE.major, amp: 0.08, breakUp: 0.14 })
  gloss(ctx, pro, -0.24 * S + ox, 0.27 * S + oy, 0.15 * S, 0.04 * S, -0.1, SHELL_SPEC, 3732, 0.024 * S)

  // ── The horn: thick at the root, sweeping up and back to a point. Drawn
  // BEFORE the head, so the head overlaps its root and it grows out of it ──
  const hx = -0.56 * S + ox
  const hy = 0.6 * S + oy + lag * 0.8
  const horn = spike(hx - 0.1 * S, hy - 0.04 * S, 0.8 * S, 0.24 * S, Math.PI + 0.45, 1.45, 0.08, 16)
  paint(ctx, S, horn.outline, SHELL, 3745, { line: LINE.major, amp: 0.06, breakUp: 0.12 })
  // Gloss running up the horn's lit front edge.
  const hs = horn.spine
  stroke(ctx, hs.slice(3, 13).map(([x, y], i) => [x - 0.035 * S * (1 - i / 11), y + 0.012 * S] as Pt),
    0.03 * S, 0.008 * S, 'rgba(255,206,168,0.7)', 3746)

  // ── Head: low, at the front, carrying the big horn ──
  const head = blob(hx, hy, 0.24 * S, 0.2 * S, 3740, 0.05)
  paint(ctx, S, head, HEAD_SHELL, 3741, { ...FACE, line: LINE.mid, amp: 0.1, breakUp: 0.14 })

  // ── Face: a stubborn, heavy-lidded glare under the horn ──
  bugEye(ctx, hx - 0.13 * S, hy + 0.01 * S, 0.066 * S, 0.092 * S, {
    lid: 0.4, slant: 0.42, look: [-0.8, 0.2], lidTone: HEAD_SHELL.base, ink: INK, seed: 3750, pupil: 0.6, iris: '#ffb347'
  }, t)
  bugEye(ctx, hx + 0.05 * S, hy + 0.01 * S, 0.11 * S, 0.12 * S, {
    lid: 0.38, slant: -0.4, look: [-0.8, 0.2], lidTone: HEAD_SHELL.base, ink: INK, seed: 3755, iris: '#ffb347', pupil: 0.5
  }, t)
  // Clamped jaw: a flat, determined line with a downturn at the back.
  stroke(ctx, [
    [hx - 0.18 * S, hy + 0.14 * S], [hx - 0.07 * S, hy + 0.14 * S], [hx + 0.03 * S, hy + 0.17 * S]
  ], 0.012 * S, 0.02 * S, INK, 3760)

  // A little dust kick as the front feet plant.
  const plant = Math.max(0, osc(g, 2, 0.05))
  if (plant > 0.6) {
    ctx.save()
    ctx.globalAlpha = (plant - 0.6) * 1.2
    for (let i = 0; i < 3; i++) {
      fillShape(ctx, blob((-0.76 - i * 0.08) * S, (0.97 - i * 0.03) * S,
        (0.04 + i * 0.015) * S, (0.03 + i * 0.01) * S, 3765 + i, 0.25), '#f3dfb0')
    }
    ctx.restore()
  }
}

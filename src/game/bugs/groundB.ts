import {
  blob, egg, rough, hard, fillShape, ink, stroke, cel, terminator, occlude, trace,
  noise2, tones, type Pt, type CelTones
} from '@/game/inkArt'
import {
  INK, SHADOW_DIR, LINE, paint, gait, footStep, bodyBob, weightShift, limb, ik,
  groundShadow, spines, pivot
} from '@/game/monsterKit'

/**
 * ─── Ground bugs, set B ─────────────────────────────────────────────────────
 *
 * Four garden bugs for Sandbox Tower, drawn to the same contract as the rest of
 * the cast (`monsters.ts` header): origin at the centre of mass, unit `S`, feet
 * on `y = +1`, crown near `y = -1.05`, shared light, ink and tone ramp from
 * `monsterKit` / `inkArt`, and a locomotion cycle that MOVES parts and never
 * reshapes them.
 *
 *   * Spitting Spider (`bonecap`)     — round fuzzy jumping spider, the slinger.
 *   * Bombardier Beetle (`blorp`)     — orange and gloss-blue, smoking, nervous.
 *   * Roly-Poly (`marrowknight`)      — seven plates and a bottle-cap shield.
 *   * Stag Beetle (`thornwick`)       — the boss: antlers first, very slowly.
 *
 * All four are registered `faces: 'front'`, like the designs they replace, and
 * are drawn as a three-quarter view turned toward +x. The battlefield mirrors
 * every unit by its travel direction (`scale(dir, 1)`), so +x is always the
 * side that meets the tower — which is where the roly-poly's shield has to be.
 *
 * Every periodic term below is a whole-number harmonic of the design's own
 * cycle, so the sixteen baked frames close into a loop without a pop. The kit's
 * `breathe` / `blink` run on fixed millisecond periods that do not divide the
 * cycle, so they are deliberately not used here.
 */

const TAU = Math.PI * 2

/** A sine locked to the cycle: `k` whole oscillations per loop. */
const wave = (u: number, k = 1, off = 0): number => Math.sin((u * k + off) * TAU)

/**
 * A blink that lives on the cycle, 0 open → 1 shut.
 *
 * Wide enough that the 16-frame bake always lands one sample on it.
 */
const cycleBlink = (u: number, at: number, width = 0.125): number => {
  const d = (((u - at) % 1) + 1) % 1
  return d < width ? Math.sin((d / width) * Math.PI) : 0
}

/** Point along a segment. */
const lerp = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]

/** Unit normal of a segment (left-hand). */
const normal = (a: Pt, b: Pt): Pt => {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const l = Math.hypot(dx, dy) || 1
  return [-dy / l, dx / l]
}

/** Map an authored unit shape into place: scaled, then moved. */
const place = (pts: Pt[], x: number, y: number, k: number): Pt[] =>
  pts.map(([px, py]) => [x + px * k, y + py * k] as Pt)

interface LegOpts {
  width: number
  taper?: number
  /** Spines on the outer edge of the lower segment (stag beetle tibia). */
  spurs?: boolean
  /** Dark tarsal claw at the foot. */
  claw?: boolean
}

/**
 * A two-bone beetle leg solved by IK, with the details that make it an
 * ARTHROPOD leg rather than a noodle: an ink bleed so it holds an edge at
 * 20 px, and optional spurs and a claw — placed at fixed fractions along the
 * bones, so they ride the leg instead of being redrawn per frame.
 */
const bugLeg = (
  ctx: CanvasRenderingContext2D, S: number, hip: Pt, foot: Pt,
  l1: number, l2: number, bend: number, T: CelTones, seed: number, o: LegOpts
): Pt => {
  const knee = limb(ctx, hip, foot, l1, l2, bend, T, seed, {
    width: o.width, taper: o.taper ?? 0.6, outline: 0.024 * S, joint: 0.5
  })
  const lowW = o.width * (1 + (o.taper ?? 0.6)) / 2
  if (o.spurs) {
    const n = normal(knee, foot)
    // Outer edge: the side facing away from the body.
    const out = n[0] * Math.sign(foot[0] - hip[0] || 1) > 0 ? 1 : -1
    for (const k of [0.25, 0.47, 0.69]) {
      const m = lerp(knee, foot, k)
      const w = lowW * 0.5
      const b0: Pt = [m[0] + n[0] * w * out, m[1] + n[1] * w * out]
      stroke(ctx, [b0, [b0[0] + n[0] * 0.07 * S * out, b0[1] + n[1] * 0.07 * S * out - 0.02 * S]],
        0.03 * S, 0.004 * S, INK, seed + 80 + Math.round(k * 10))
    }
  }
  if (o.claw) {
    const dir = Math.sign(foot[0] - hip[0]) || 1
    stroke(ctx, [[foot[0], foot[1] - 0.01 * S], [foot[0] + dir * 0.05 * S, foot[1] + 0.01 * S], [foot[0] + dir * 0.07 * S, foot[1] - 0.015 * S]],
      0.028 * S, 0.006 * S, INK, seed + 90)
  }
  return knee
}

/**
 * A cartoon eye with a look direction.
 *
 * The kit's `eye` pins the iris; a nervous beetle and a watchful beetle both
 * need to point theirs, so this one takes `look` (−1..1 per axis) and moves the
 * iris and pupil — translation, never a new shape.
 */
const toonEye = (
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number,
  o: { seed: number; look?: Pt; lid?: number; pupil?: number; iris?: string; sclera?: string; slit?: boolean }
): void => {
  const open = Math.max(0.08, 1 - (o.lid ?? 0))
  const ball = blob(x, y, r, r * open, o.seed, 0.04)
  cel(ctx, ball, { base: o.sclera ?? '#fdf7e8', shade: '#d3c3a6' }, {
    shade: terminator(ball, SHADOW_DIR, -0.05, 0.1, o.seed)
  }, { hatch: false })
  const lx = (o.look?.[0] ?? 0) * r * 0.36
  const ly = (o.look?.[1] ?? 0) * r * 0.3 * open
  ctx.save()
  ctx.beginPath(); trace(ctx, ball); ctx.clip()
  if (o.iris) fillShape(ctx, blob(x + lx, y + ly, r * 0.64, r * 0.64, o.seed + 2, 0.05), o.iris)
  const pr = r * (o.pupil ?? 0.34)
  fillShape(ctx, blob(x + lx * 1.1, y + ly * 1.1, o.slit ? pr * 0.42 : pr, o.slit ? pr * 1.55 : pr, o.seed + 3, 0.06), '#150e12')
  ctx.restore()
  if (open > 0.35) {
    fillShape(ctx, blob(x - r * 0.34 + lx * 0.3, y - r * 0.36 * open, r * 0.24, r * 0.19 * open, o.seed + 5, 0.2), 'rgba(255,255,255,0.95)')
    fillShape(ctx, blob(x + r * 0.3, y + r * 0.3 * open, r * 0.1, r * 0.08 * open, o.seed + 6, 0.2), 'rgba(255,255,255,0.55)')
  }
  ink(ctx, ball, { width: r * 0.26, color: INK, seed: o.seed, breakUp: 0.18 })
}

/** A brow: a tapered ink stroke with a slant (+ = inner end down). */
const brow = (
  ctx: CanvasRenderingContext2D, x: number, y: number, len: number, slant: number,
  w: number, seed: number, color = INK
): void => {
  const pts: Pt[] = []
  for (let i = 0; i <= 6; i++) {
    const k = i / 6
    pts.push([x - len / 2 + len * k, y + slant * len * (k - 0.5) - Math.sin(k * Math.PI) * len * 0.12])
  }
  stroke(ctx, pts, w, w * 0.45, color, seed)
}

/** A crisp specular streak — the gloss on shell and chitin. */
const gloss = (
  ctx: CanvasRenderingContext2D, pts: Pt[], w: number, seed: number, color = 'rgba(255,255,255,0.85)'
): void => {
  stroke(ctx, pts, w * 0.25, w, color, seed)
}

/**
 * A smooth open run through control points (Catmull-Rom), `per` samples per
 * span — `stroke` joins its points with straight chords, so anything meant to
 * curve has to arrive already dense.
 */
const curve = (ctrl: Pt[], per = 6): Pt[] => {
  const out: Pt[] = []
  const last = ctrl.length - 1
  for (let k = 0; k < last; k++) {
    const a = ctrl[Math.max(0, k - 1)]!
    const b0 = ctrl[k]!
    const c = ctrl[k + 1]!
    const d = ctrl[Math.min(last, k + 2)]!
    for (let i = 0; i < per; i++) {
      const f = i / per
      const f2 = f * f
      const f3 = f2 * f
      const cr = (p0: number, p1: number, p2: number, p3: number): number =>
        0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 + (-p0 + 3 * p1 - 3 * p2 + p3) * f3)
      out.push([cr(a[0], b0[0], c[0], d[0]), cr(a[1], b0[1], c[1], d[1])])
    }
  }
  out.push(ctrl[last]!)
  return out
}

// ─── 1 · Spitting Spider (bonecap) ──────────────────────────────────────────

/**
 * A jumping-spider eye: a wet black dome with a warm retina glow that slides as
 * it looks around, under a big catch-light. The slide is the spider's own
 * trick — its retinas move inside fixed lenses.
 */
const spiderEye = (
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number, seed: number, lx: number, ly: number
): void => {
  const ball = blob(x, y, r, r * 0.98, seed, 0.03)
  fillShape(ctx, ball, '#1d1520')
  ctx.save()
  ctx.beginPath(); trace(ctx, ball); ctx.clip()
  // Retina glow: a warm ring low in the lens, then the pupil dark over it.
  const gx = x + lx * r * 0.22
  const gy = y + r * 0.22 + ly * r * 0.15
  fillShape(ctx, blob(gx, gy, r * 0.62, r * 0.56, seed + 1, 0.05), '#7a4a34')
  fillShape(ctx, blob(gx, gy - r * 0.06, r * 0.42, r * 0.38, seed + 2, 0.05), '#140d14')
  ctx.restore()
  fillShape(ctx, blob(x - r * 0.34, y - r * 0.36, r * 0.3, r * 0.22, seed + 3, 0.2), 'rgba(255,255,255,0.95)')
  fillShape(ctx, blob(x + r * 0.36, y + r * 0.34, r * 0.1, r * 0.08, seed + 4, 0.2), 'rgba(255,255,255,0.6)')
  ink(ctx, ball, { width: r * 0.24, color: INK, seed: seed + 5, breakUp: 0.15 })
}

/**
 * A spider leg: femur up to a high knee (carried rigidly by the body), then an
 * IK pair — tibia and metatarsus — bending outward at the ankle to the foot.
 * Chunky at the hip and banded below, with a few bristles; every detail sits
 * at a fixed fraction along its bone.
 */
const spiderLeg = (
  ctx: CanvasRenderingContext2D, S: number, hip: Pt, knee: Pt, foot: Pt,
  bone: number, bend: number, T: CelTones, seed: number, hair: string, band: string
): void => {
  const ankle = ik(knee, foot, bone, bone, bend)
  const ol = 0.026 * S
  const segs: [Pt, Pt, number, number][] = [
    [hip, knee, 0.105 * S, 0.095 * S],
    [knee, ankle, 0.09 * S, 0.075 * S],
    [ankle, foot, 0.07 * S, 0.045 * S]
  ]
  segs.forEach(([p, q, w0, w1], k) => {
    stroke(ctx, [p, q], w0 + ol, w1 + ol, INK, seed + k)
  })
  segs.forEach(([p, q, w0, w1], k) => {
    stroke(ctx, [p, q], w0, w1, T.base, seed + k)
    // Shade along the underside of each bone, lit ridge along the top.
    const n = normal(p, q)
    const dn = n[1] > 0 ? 1 : -1
    stroke(ctx, [[p[0] + n[0] * w0 * 0.22 * dn, p[1] + n[1] * w0 * 0.22 * dn], [q[0] + n[0] * w1 * 0.22 * dn, q[1] + n[1] * w1 * 0.22 * dn]],
      w0 * 0.5, w1 * 0.5, T.shade, seed + 5 + k)
    stroke(ctx, [[p[0] - n[0] * w0 * 0.24 * dn, p[1] - n[1] * w0 * 0.24 * dn], [q[0] - n[0] * w1 * 0.24 * dn, q[1] - n[1] * w1 * 0.24 * dn]],
      w0 * 0.3, w1 * 0.26, T.lit ?? T.base, seed + 8 + k)
    if (k > 0) {
      // Pale rings: one per lower bone, just past its joint.
      const m = lerp(p, q, 0.28)
      const w = (w0 * 0.72 + w1 * 0.28) * 0.5
      stroke(ctx, [[m[0] + n[0] * w, m[1] + n[1] * w], [m[0] - n[0] * w, m[1] - n[1] * w]], 0.035 * S, 0.035 * S, band, seed + 11 + k)
    }
    // Bristles on the outer edge.
    const dx = q[0] - p[0]
    const dy = q[1] - p[1]
    const l = Math.hypot(dx, dy) || 1
    for (const f of [0.45, 0.8]) {
      const m = lerp(p, q, f)
      const w = (w0 + (w1 - w0) * f) * 0.5
      const len = 0.045 * S
      stroke(ctx, [
        [m[0] - n[0] * w * dn, m[1] - n[1] * w * dn],
        [m[0] - n[0] * (w + len) * dn + (dx / l) * len * 0.8, m[1] - n[1] * (w + len) * dn + (dy / l) * len * 0.8]
      ], 0.018 * S, 0.004 * S, hair, seed + 14 + k * 2 + (f > 0.5 ? 1 : 0))
    }
  })
  // Joint knobs, so the bones read as hinged.
  for (const [j, r, sd] of [[knee, 0.055, 1], [ankle, 0.046, 2]] as const) {
    const kb = blob(j[0], j[1], r * S, r * 0.9 * S, seed + 20 + sd, 0.14)
    fillShape(ctx, blob(j[0], j[1], r * S + ol * 0.5, r * 0.9 * S + ol * 0.5, seed + 20 + sd, 0.14), INK)
    cel(ctx, kb, T, { shade: terminator(kb, SHADOW_DIR, 0.1, 0.14, seed + 22 + sd) }, { hatch: false })
  }
  // A little dark tarsal tuft at the tip.
  fillShape(ctx, blob(foot[0], foot[1] - 0.005 * S, 0.035 * S, 0.025 * S, seed + 30, 0.2), INK)
}

/**
 * A round fuzzy jumping spider: a big furry face with two enormous glossy eyes,
 * a charcoal abdomen with an orange racing stripe riding behind it like a
 * backpack, teal fangs, and eight banded legs on a tetrapod gait.
 *
 * Cute comes from the eyes — huge, wet, with a retina glint that slides as it
 * looks around. Evil comes from the white fur brows set in a V and the little
 * fangs poking out under a smirk.
 */
export const drawSpider = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  const C = 1300
  const g = gait(t, C)
  // Two footfalls a cycle (one per leg group), so the body dips twice.
  const b = bodyBob(g, 0.024) * S
  const sway = weightShift(g, 0.018) * S
  // The abdomen is a heavy sack on a thin waist: it arrives late.
  const lag = (bodyBob(g - 0.12, 0.024) - bodyBob(g, 0.024)) * S * 2.2

  const HEAD = tones('#9a7452')
  const BACK = tones('#4d4852')
  const LEG = tones('#765945')
  const STRIPE = tones('#ff8a2b')
  const JAW = tones('#2cb9a5')
  const PALP = tones('#f3e6c8', 0.75)
  const HAIR = '#3b2a21'

  groundShadow(ctx, S, 0.84, 1.02, 0.26)

  const hx = 0.05 * S + sway
  const hy = 0.36 * S + b
  const ax = -0.3 * S + sway * 0.7
  const ay = -0.12 * S + b * 0.8 + lag

  // ── Abdomen: the round backpack, behind everything ──
  const abd = blob(ax, ay, 0.5 * S, 0.43 * S, 501, 0.05)
  // Fur first, so the body paints over the roots and only the tips stand out.
  spines(ctx, abd, 0.4, 1.04, 46, 0.04 * S, 0.028 * S, (i) => i % 3 ? HAIR : BACK.shade, 502, 0.8, 0.4)
  cel(ctx, abd, BACK, {
    shade: terminator(abd, SHADOW_DIR, 0.08, 0.12, 503),
    deep: terminator(abd, SHADOW_DIR, 0.48, 0.1, 504),
    lit: terminator(abd, SHADOW_DIR + Math.PI, 0.56, 0.12, 505)
  })
  ctx.save()
  ctx.beginPath(); trace(ctx, abd); ctx.clip()
  // The accent stripe: a bold orange band curving over the top of the sack.
  const band: Pt[] = []
  for (let i = 0; i <= 10; i++) {
    const k = i / 10
    band.push([ax + (-0.56 + k * 1.1) * S, ay + (-0.24 + 0.15 * (1 - ((k - 0.5) / 0.5) ** 2)) * S])
  }
  stroke(ctx, band, 0.12 * S, 0.15 * S, STRIPE.shade, 506)
  stroke(ctx, band.map(([x, y]) => [x - 0.01 * S, y - 0.018 * S] as Pt), 0.09 * S, 0.11 * S, STRIPE.base, 507)
  stroke(ctx, band.slice(1, 5).map(([x, y]) => [x - 0.01 * S, y - 0.045 * S] as Pt), 0.02 * S, 0.035 * S, STRIPE.lit, 508)
  // Three pale spots under it — the jumping-spider "face" on its back.
  for (const [sx, sy, sr, sd] of [[-0.18, 0.06, 0.06, 509], [0.08, 0.1, 0.055, 510], [-0.04, 0.24, 0.045, 511]] as const) {
    fillShape(ctx, blob(ax + sx * S, ay + sy * S, sr * S, sr * 0.85 * S, sd, 0.14), '#f1e6cf')
  }
  ctx.restore()
  ink(ctx, abd, { width: LINE.major * S, color: INK, seed: 512, breakUp: 0.35 })

  // Spinneret, and a silk drag-line anchored to the sand behind it.
  const sp: Pt = [ax - 0.47 * S, ay + 0.2 * S]
  stroke(ctx, [sp, [sp[0] - 0.2 * S, sp[1] + 0.3 * S], [-0.9 * S, 0.62 * S], [-1.0 * S, 0.98 * S]],
    0.012 * S, 0.008 * S, 'rgba(255,255,255,0.7)', 513)
  paint(ctx, S, blob(sp[0], sp[1], 0.065 * S, 0.05 * S, 514, 0.12), BACK, 515, { line: LINE.fine, deep: false })

  // ── Legs: eight, banded and bristled, on a tetrapod gait ──
  // Left 1 & 3 step with right 2 & 4, then swap. A little metachronal ripple
  // runs front to back inside each group so it scuttles instead of marching.
  //
  // Three bones, not two. The femur is carried by the body and rises to a high
  // knee; below it an IK pair bends OUTWARD at the ankle and plants the foot.
  // That up-over-and-down arch is what a spider leg looks like — a two-bone
  // leg reaching the ground from a high knee is a straight stick, and eight of
  // them read as the bars of a cage.
  const FEMUR = [[0.15, -0.14], [0.27, -0.3], [0.3, -0.33], [0.27, -0.35]] as const
  const FOOT_X = [0.58, 0.86, 0.92, 0.84]
  const FOOT_Y = [1.0, 0.97, 0.92, 0.86]
  const drawLeg = (s: 1 | -1, i: number): void => {
    // The far (−x) side is a touch narrower and higher: the turn toward +x.
    const far = s < 0 ? 0.94 : 1
    const hip0: Pt = [0.05 * S + s * (0.28 + i * 0.04) * S, 0.36 * S + (0.12 - i * 0.08) * S]
    const fem: Pt = [s * FEMUR[i]![0] * S * far, FEMUR[i]![1] * S]
    const foot0: Pt = [0.04 * S + s * FOOT_X[i]! * S * far, FOOT_Y[i]! * S - (s < 0 ? 0.02 * S : 0)]
    const reach = Math.hypot(foot0[0] - hip0[0] - fem[0], foot0[1] - hip0[1] - fem[1])
    const bone = reach * 0.54
    const groupA = (s < 0) === (i % 2 === 0)
    const st = footStep(g + (groupA ? 0 : 0.5) - i * 0.04, 0.12 * S, (i === 0 ? 0.15 : 0.1) * S)
    const hip: Pt = [hip0[0] + sway, hip0[1] + b]
    const knee: Pt = [hip[0] + fem[0], hip[1] + fem[1]]
    const foot: Pt = [foot0[0] + st[0], foot0[1] + st[1]]
    spiderLeg(ctx, S, hip, knee, foot, bone, -s, LEG, 520 + i * 10 + (s > 0 ? 5 : 0), HAIR, '#cfb08a')
  }
  for (const i of [3, 2, 1]) { drawLeg(-1, i); drawLeg(1, i) }

  // ── Head: the whole face, round and furry ──
  const head = egg(hx, hy, 0.5 * S, 0.44 * S, 0.9, 560, 0.045)
  spines(ctx, head, 0.44, 1.06, 42, 0.045 * S, 0.03 * S, (i) => i % 3 ? HAIR : HEAD.shade, 561, 0.8, 0.4)
  cel(ctx, head, HEAD, {
    shade: terminator(head, SHADOW_DIR, 0.1, 0.12, 562),
    deep: terminator(head, SHADOW_DIR, 0.5, 0.1, 563),
    lit: terminator(head, SHADOW_DIR + Math.PI, 0.58, 0.12, 564)
  })
  // A darker eye-field mask across the brow, so the eyes sit in a frame.
  ctx.save()
  ctx.beginPath(); trace(ctx, head); ctx.clip()
  fillShape(ctx, blob(hx + 0.02 * S, hy - 0.12 * S, 0.5 * S, 0.2 * S, 565, 0.1), 'rgba(58,40,32,0.45)')
  // Cream cheek fur, low on the face.
  fillShape(ctx, blob(hx + 0.02 * S, hy + 0.3 * S, 0.34 * S, 0.14 * S, 566, 0.16), 'rgba(243,230,200,0.55)')
  ctx.restore()
  ink(ctx, head, { width: LINE.major * S, color: INK, seed: 567, breakUp: 0.3 })
  occlude(ctx, abd, 0.18, 0.34, 0.05 * S, 'rgba(28,20,24,0.55)', 568)

  // Front legs come off the lower face and sit in front of it.
  drawLeg(-1, 0)
  drawLeg(1, 0)

  // ── Chelicerae: iridescent teal, with little fangs ──
  for (const s of [-1, 1] as const) {
    const cx = hx + s * 0.1 * S + 0.01 * S
    const cy = hy + 0.28 * S
    const jaw = egg(cx, cy, 0.1 * S, 0.12 * S, 1.15, 570 + s, 0.06)
    paint(ctx, S, jaw, JAW, 571 + s, { line: LINE.mid, deep: false, breakUp: 0.2 })
    gloss(ctx, [[cx - 0.05 * S, cy - 0.06 * S], [cx - 0.03 * S, cy + 0.02 * S]], 0.025 * S, 573 + s, 'rgba(210,255,245,0.8)')
    // Fang, hooked inward.
    stroke(ctx, [[cx + s * 0.02 * S, cy + 0.1 * S], [cx - s * 0.01 * S, cy + 0.16 * S], [cx - s * 0.05 * S, cy + 0.17 * S]],
      0.035 * S, 0.006 * S, '#fff6e0', 575 + s)
  }

  // ── Pedipalps: two fuzzy mitts, drumming out of step ──
  for (const s of [-1, 1] as const) {
    const lift = Math.max(0, wave(g, 2, s > 0 ? 0.5 : 0)) * 0.05 * S
    const root: Pt = [hx + s * 0.22 * S, hy + 0.2 * S]
    const tip: Pt = [hx + s * 0.27 * S, hy + 0.44 * S - lift]
    stroke(ctx, [root, lerp(root, tip, 0.5), tip], 0.07 * S, 0.055 * S, INK, 580 + s)
    stroke(ctx, [root, lerp(root, tip, 0.5), tip], 0.045 * S, 0.035 * S, LEG.base, 581 + s)
    const mitt = blob(tip[0], tip[1] + 0.02 * S, 0.075 * S, 0.065 * S, 582 + s, 0.14)
    spines(ctx, mitt, 0, 1, 10, 0.03 * S, 0.022 * S, () => PALP.shade, 583 + s, 0.6, 0.4)
    paint(ctx, S, mitt, PALP, 584 + s, { line: LINE.fine, deep: false, breakUp: 0.3 })
  }

  // ── Eyes: two enormous glossy fronts, two small side ones ──
  const lookX = wave(g, 1) * 0.8
  const lookY = wave(g, 2, 0.25) * 0.25
  spiderEye(ctx, hx + 0.42 * S, hy - 0.15 * S, 0.075 * S, 590, lookX, lookY)
  spiderEye(ctx, hx - 0.41 * S, hy - 0.13 * S, 0.068 * S, 591, lookX, lookY)
  spiderEye(ctx, hx - 0.17 * S, hy - 0.03 * S, 0.165 * S, 592, lookX, lookY)
  spiderEye(ctx, hx + 0.2 * S, hy - 0.045 * S, 0.18 * S, 593, lookX, lookY)
  // Tiny rear eyes on the crown.
  fillShape(ctx, blob(hx - 0.28 * S, hy - 0.33 * S, 0.035 * S, 0.03 * S, 594, 0.1), '#1e1620')
  fillShape(ctx, blob(hx + 0.3 * S, hy - 0.345 * S, 0.035 * S, 0.03 * S, 595, 0.1), '#1e1620')

  // White fur brows in a V: the whole of the "evil".
  for (const s of [-1, 1] as const) {
    const bx = hx + (s < 0 ? -0.17 : 0.2) * S
    const by = hy - (s < 0 ? 0.24 : 0.265) * S
    for (let k = 0; k < 4; k++) {
      const u = k / 3
      const x0 = bx + s * (0.16 - u * 0.24) * S
      const y0 = by - (0.04 - u * 0.08) * S
      stroke(ctx, [[x0, y0], [x0 - s * 0.07 * S, y0 + 0.035 * S]], 0.05 * S, 0.012 * S, INK, 596 + k + (s > 0 ? 5 : 0))
      stroke(ctx, [[x0, y0 - 0.005 * S], [x0 - s * 0.065 * S, y0 + 0.028 * S]], 0.036 * S, 0.008 * S, '#fbf3df', 606 + k + (s > 0 ? 5 : 0))
    }
  }
}

// ─── 2 · Bombardier Beetle (blorp) ──────────────────────────────────────────

/** One authored steam puff, reused at every size — scaled, never re-seeded. */
const PUFF: Pt[] = blob(0, 0, 1, 0.84, 701, 0.16, 2.4, 36)

/**
 * Bright orange head and legs, a glossy blue-black wing case, and a backside
 * that will not stop smoking. It walks up to the wall grinning through its
 * teeth like it knows exactly what happens next — which it does.
 *
 * The smoke is four puffs cycling out of the tail: each one is the same shape
 * at a growing scale, drifting up and back and fading, so the wisp moves
 * without anything boiling.
 */
export const drawBombardier = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  const C = 1250
  const g = gait(t, C)
  const b = bodyBob(g, 0.016) * S
  // A nervous shiver on top of the walk.
  const jit = wave(g, 9) * 0.005 * S
  const sway = weightShift(g, 0.014) * S

  const ORANGE = tones('#ff8a2b')
  const LEGT = tones('#f47a22')
  const SHELL = tones('#2c3a6e', 1.05)
  const STEAM: CelTones = { base: '#fbf4e2', shade: '#dccdb0' }

  groundShadow(ctx, S, 0.82, 1.01, 0.26)

  const ex = -0.08 * S + sway + jit
  const ey = 0.3 * S + b
  const px = 0.28 * S + sway * 1.1 + jit
  const py = 0.4 * S + b * 1.1
  const hx = 0.44 * S + sway * 1.2 + jit
  const hy = 0.46 * S + b * 1.25

  const nozzle: Pt = [ex - 0.63 * S, ey + 0.1 * S]

  // ── Smoke, behind the shell ──
  const puff = (i: number, front: boolean): void => {
    const p = (((g * 2 + i / 4) % 1) + 1) % 1
    // Up and a little back, curling as it goes; the frame box ends at ±1.1.
    const x = nozzle[0] - (0.08 + p * 0.16) * S + wave(p, 1) * 0.05 * S
    const y = nozzle[1] - (0.05 + p * 0.9) * S
    const r = (0.06 + p * 0.13) * S
    const a = p < 0.12 ? p / 0.12 : 1 - (p - 0.12) / 0.88
    if (a <= 0.02) return
    const shape = place(PUFF, x, y, r)
    ctx.save()
    ctx.globalAlpha = Math.min(1, a * 1.15) * (front ? 0.9 : 1)
    cel(ctx, shape, STEAM, { shade: terminator(shape, SHADOW_DIR, 0.15, 0.14, 702 + i) }, { hatch: false })
    ink(ctx, shape, { width: 0.022 * S, color: 'rgba(59,42,33,0.55)', seed: 710 + i, breakUp: 0.5 })
    ctx.restore()
  }
  for (let i = 0; i < 4; i++) puff(i, false)

  // ── Legs: six, orange, on a tripod gait ──
  const drawLeg = (s: 1 | -1, i: number): void => {
    const far = s < 0 ? 0.92 : 1
    const hip0: Pt = [(0.1 - i * 0.14) * S + s * (0.16 + i * 0.06) * S, 0.64 * S]
    const knee0: Pt = [hip0[0] + s * (0.16 + i * 0.03) * S * far, hip0[1] - (0.1 + i * 0.02) * S]
    const foot0: Pt = [(0.14 - i * 0.16) * S + s * (0.4 + i * 0.13) * S * far, (1.0 - i * 0.035) * S]
    const l1 = Math.hypot(knee0[0] - hip0[0], knee0[1] - hip0[1])
    const l2 = Math.hypot(foot0[0] - knee0[0], foot0[1] - knee0[1])
    const groupA = (s < 0) === (i % 2 === 0)
    const st = footStep(g + (groupA ? 0 : 0.5), 0.1 * S, 0.09 * S)
    const hip: Pt = [hip0[0] + sway + jit, hip0[1] + b]
    const foot: Pt = [foot0[0] + st[0], foot0[1] + st[1]]
    bugLeg(ctx, S, hip, foot, l1, l2, -s, LEGT, 720 + i * 10 + (s > 0 ? 5 : 0), {
      width: 0.08 * S, taper: 0.55, claw: true
    })
  }
  for (const i of [2, 1, 0]) { drawLeg(-1, i); drawLeg(1, i) }

  // ── Wing case: glossy blue-black dome ──
  const shell = egg(ex, ey, 0.64 * S, 0.5 * S, 0.9, 740, 0.035)
  paint(ctx, S, shell, SHELL, 741, { line: LINE.major, hatch: false, amp: 0.08, breakUp: 0.3 })
  ctx.save()
  ctx.beginPath(); trace(ctx, shell); ctx.clip()
  // Striae: fine grooves running back over the dome, parallel to the seam.
  for (let k = 0; k < 5; k++) {
    const o = (k - 1.6) * 0.1
    stroke(ctx, [
      [ex + (0.3 + o * 0.4) * S, ey + (0.08 + o) * S],
      [ex + (0.02 + o * 0.2) * S, ey + (-0.28 + o * 0.7) * S],
      [ex + (-0.34 + o * 0.1) * S, ey + (-0.38 + o * 0.9) * S]
    ], 0.012 * S, 0.008 * S, k % 2 ? 'rgba(12,16,40,0.5)' : 'rgba(110,135,210,0.35)', 742 + k)
  }
  // The gloss: one crisp bright streak and a spot. This is what says "shell".
  gloss(ctx, [[ex - 0.5 * S, ey + 0.02 * S], [ex - 0.4 * S, ey - 0.26 * S], [ex - 0.16 * S, ey - 0.4 * S]], 0.05 * S, 748, 'rgba(200,220,255,0.9)')
  fillShape(ctx, blob(ex - 0.04 * S, ey - 0.35 * S, 0.05 * S, 0.03 * S, 749, 0.2), 'rgba(235,242,255,0.95)')
  ctx.restore()
  // The elytral seam, bending round the dome.
  stroke(ctx, [
    [ex + 0.36 * S, ey + 0.02 * S], [ex + 0.12 * S, ey - 0.3 * S], [ex - 0.22 * S, ey - 0.46 * S]
  ], 0.03 * S, 0.012 * S, INK, 750)

  // ── Pronotum ──
  const pro = blob(px, py, 0.3 * S, 0.22 * S, 755, 0.06)
  paint(ctx, S, pro, ORANGE, 756, { line: LINE.mid, breakUp: 0.3 })
  gloss(ctx, [[px - 0.2 * S, py - 0.02 * S], [px - 0.08 * S, py - 0.15 * S]], 0.03 * S, 757, 'rgba(255,245,220,0.8)')
  occlude(ctx, shell, 0.02, 0.2, 0.045 * S, 'rgba(28,20,24,0.6)', 758)

  // ── Antennae: beaded, twitching ──
  for (const s of [-1, 1] as const) {
    const root: Pt = [hx + s * 0.12 * S, hy - 0.2 * S]
    const base = s < 0 ? -2.05 : -1.15
    const tw = wave(g, 3, s > 0 ? 0.3 : 0) * 0.12
    let a = base + tw
    let p = root
    for (let k = 0; k < 6; k++) {
      a += 0.13
      const q: Pt = [p[0] + Math.cos(a) * 0.075 * S, p[1] + Math.sin(a) * 0.075 * S]
      stroke(ctx, [p, q], 0.035 * S, 0.03 * S, INK, 760 + k + (s > 0 ? 8 : 0))
      stroke(ctx, [p, q], 0.02 * S, 0.018 * S, '#b4561d', 761 + k + (s > 0 ? 8 : 0))
      p = q
    }
    fillShape(ctx, blob(p[0], p[1], 0.03 * S, 0.028 * S, 776 + s, 0.1), INK)
  }

  // ── Head: bright orange, all eyes and teeth ──
  const head = egg(hx, hy, 0.31 * S, 0.27 * S, 0.86, 780, 0.05)
  paint(ctx, S, head, ORANGE, 781, { line: LINE.major, breakUp: 0.28 })
  // Little dark mandibles either side of the grin.
  for (const s of [-1, 1] as const) {
    stroke(ctx, [[hx + s * 0.18 * S, hy + 0.18 * S], [hx + s * 0.16 * S, hy + 0.27 * S], [hx + s * 0.08 * S, hy + 0.29 * S]],
      0.045 * S, 0.01 * S, INK, 782 + s)
  }
  // The grin: clenched, too wide, one corner higher — the look of something
  // that has just heard its own fuse.
  const gx = hx + 0.01 * S
  const gy = hy + 0.12 * S
  const grin: Pt[] = rough([
    [gx - 0.17 * S, gy - 0.02 * S], [gx - 0.06 * S, gy + 0.005 * S], [gx + 0.07 * S, gy], [gx + 0.18 * S, gy - 0.045 * S],
    [gx + 0.16 * S, gy + 0.05 * S], [gx + 0.05 * S, gy + 0.09 * S], [gx - 0.07 * S, gy + 0.09 * S], [gx - 0.16 * S, gy + 0.05 * S]
  ], 0.004 * S, 785)
  fillShape(ctx, grin, '#fffaf0')
  ctx.save()
  ctx.beginPath(); trace(ctx, grin); ctx.clip()
  stroke(ctx, [[gx - 0.18 * S, gy + 0.035 * S], [gx, gy + 0.045 * S], [gx + 0.18 * S, gy + 0.02 * S]], 0.014 * S, 0.014 * S, 'rgba(59,42,33,0.8)', 786)
  for (let k = 0; k < 5; k++) {
    const tx = gx + (-0.12 + k * 0.06) * S
    stroke(ctx, [[tx, gy - 0.04 * S], [tx + 0.004 * S, gy + 0.1 * S]], 0.01 * S, 0.01 * S, 'rgba(59,42,33,0.55)', 787 + k)
  }
  ctx.restore()
  ink(ctx, grin, { width: 0.026 * S, color: INK, seed: 793, breakUp: 0.1 })

  // Eyes: wide, tiny pupils, darting — and worried brows over them.
  const dart = wave(g, 2) > 0 ? 1 : -1
  const look: Pt = [dart * 0.7, -0.35]
  const lid = cycleBlink(g, 0.62)
  toonEye(ctx, hx - 0.12 * S, hy - 0.06 * S, 0.1 * S, { seed: 794, look, lid, pupil: 0.3, iris: '#3b2a21' })
  toonEye(ctx, hx + 0.12 * S, hy - 0.075 * S, 0.115 * S, { seed: 798, look, lid, pupil: 0.3, iris: '#3b2a21' })
  brow(ctx, hx - 0.13 * S, hy - 0.2 * S, 0.14 * S, -0.45, 0.034 * S, 802)
  brow(ctx, hx + 0.13 * S, hy - 0.225 * S, 0.15 * S, 0.5, 0.034 * S, 803)

  // A sweat drop that trembles with the rest of it.
  const dx = hx - 0.28 * S
  const dy = hy - 0.16 * S + wave(g, 2) * 0.006 * S
  const drop: Pt[] = [
    [dx, dy - 0.07 * S], [dx + 0.035 * S, dy], [dx + 0.03 * S, dy + 0.03 * S],
    [dx, dy + 0.045 * S], [dx - 0.03 * S, dy + 0.03 * S], [dx - 0.035 * S, dy]
  ]
  paint(ctx, S, drop, { base: '#a9e4ff', shade: '#6fc3f7', lit: '#e6f8ff' }, 804, { line: LINE.hair, deep: false, breakUp: 0.1 })

  // ── The business end: a hot little puff right at the nozzle ──
  const hot = 0.5 + 0.5 * wave(g, 4)
  const burst = place(PUFF, nozzle[0] - 0.03 * S, nozzle[1] - 0.02 * S, (0.05 + hot * 0.025) * S)
  ctx.save()
  ctx.globalAlpha = 0.65 + hot * 0.35
  fillShape(ctx, burst, '#ffe27a')
  fillShape(ctx, place(PUFF, nozzle[0] - 0.035 * S, nozzle[1] - 0.025 * S, 0.028 * S), '#fffbe6')
  ctx.restore()
  puff(3, true)
}

// ─── 3 · Roly-Poly (marrowknight) ───────────────────────────────────────────

/** Plate seams along the dome, back to front, as fractions of its length. */
const PLATES = 7

/**
 * A pill bug in seven overlapping grey plates, scurrying on a ripple of tiny
 * legs, holding a bottle cap out in front as a shield. The cap is on +x — the
 * leading side after the battlefield mirrors it — because the bulwark's whole
 * mechanic is frontal armour, and the shield is the tell.
 *
 * Its eyes peek over the rim of the cap: small, smug and entirely unbothered.
 */
export const drawRolyPoly = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  const C = 1700
  const g = gait(t, C)
  // Many small legs: a quick shallow bob (four per cycle) and a slow rock.
  const b = (Math.cos(g * TAU * 4) * 0.008 + bodyBob(g, 0.01)) * S
  const rock = wave(g, 1) * 0.022
  const lag = wave(g, 4, -0.15) * 0.014 * S

  const SHELL = tones('#9aa3ad', 1.05)
  const BELLY = tones('#6e7782')
  const HEADT = tones('#7d8693')
  const LEGT = tones('#b3adb5')
  const CAP = tones('#e5483b')
  const RIM = tones('#d1d6dc', 1.1)
  const SEAM = 'rgba(52,46,62,0.9)'

  groundShadow(ctx, S, 0.96, 1.02, 0.3)

  // Body frame: pivot about the belly so the rock tips it forward and back.
  // Sized so tail prongs to cap rim fits the ±1.1 frame box.
  const RX = 0.76
  const RY = 1.08
  const bx = -0.25 * S
  const by = 0.74 * S + b
  const tilt = -0.05 + rock
  const P = (x: number, y: number): Pt => pivot([[x * S, y * S]], bx, by, tilt)[0]!

  // ── Legs: fourteen, in a ripple running back to front ──
  // Far side first (darker, higher, out of step), then the near side.
  const legRow = (far: boolean): void => {
    for (let j = 0; j < PLATES; j++) {
      const u = j / (PLATES - 1)
      const lx = -0.56 + u * 1.02 + (far ? 0.05 : 0)
      const hip = P(lx + 0.06, far ? -0.08 : -0.02)
      const ph = g * 2 - u * 0.55 + (far ? 0.5 : 0)
      const st = footStep(ph, 0.1 * S, 0.06 * S)
      const foot: Pt = [bx + (lx - 0.04) * S + st[0], (far ? 0.955 : 1.0) * S + st[1]]
      limb(ctx, hip, foot, 0.16 * S, 0.16 * S, 1, far ? BELLY : LEGT, 820 + j * 3 + (far ? 1 : 0), {
        width: 0.055 * S, taper: 0.6, outline: 0.022 * S, joint: 0.45
      })
    }
  }
  legRow(true)

  // ── Dome: seven plates with a scalloped skirt ──
  const top: Pt[] = []
  for (let i = 0; i <= 36; i++) {
    const a = Math.PI + (i / 36) * Math.PI
    // A touch fuller toward the head end: the thorax plates are the tallest.
    const lean = 1 + Math.cos(a) * 0.06
    top.push([Math.cos(a) * RX, Math.sin(a) * RY * lean])
  }
  // Skirt: one lobe per plate, running front to back along the underside.
  const skirt: Pt[] = []
  for (let j = PLATES - 1; j >= 0; j--) {
    const x0 = -RX + (j + 1) * (2 * RX) / PLATES
    const x1 = -RX + j * (2 * RX) / PLATES
    skirt.push([x0 - 0.02, 0.02], [(x0 + x1) / 2, 0.1], [x1 + 0.02, 0.02])
  }
  const domeLocal: Pt[] = rough(top.concat(skirt), 0.008, 830)
  const dome = domeLocal.map(([x, y]) => P(x, y))
  cel(ctx, dome, SHELL, {
    shade: terminator(dome, SHADOW_DIR, 0.1, 0.1, 831),
    deep: terminator(dome, SHADOW_DIR, 0.52, 0.08, 832),
    lit: terminator(dome, SHADOW_DIR + Math.PI, 0.46, 0.1, 833)
  })
  ctx.save()
  ctx.beginPath(); trace(ctx, dome); ctx.clip()
  // Seams: each plate's rear lip overlaps the one behind it. The seam bows
  // toward the back — a ring round the body, seen from front three-quarter —
  // the plate in front catches a highlight on its lip, and the one behind sits
  // in the thin shadow that lip casts.
  const seams: Pt[][] = []
  for (let j = 1; j < PLATES; j++) {
    const xl = -RX + j * (2 * RX) / PLATES
    const seam: Pt[] = []
    for (let k = 0; k <= 10; k++) {
      const v = k / 10
      seam.push(P(xl - Math.sin(v * Math.PI * 0.9) * 0.16 + v * 0.02, -RY * 1.12 + v * (RY * 1.12 + 0.12)))
    }
    seams.push(seam)
  }
  // Every other plate a shade darker, so the bands still count at 20 px.
  for (let j = 0; j < PLATES; j += 2) {
    const a = j === 0 ? [P(-RX - 0.3, -RY * 1.2), P(-RX - 0.3, 0.2)] : seams[j - 1]!
    const c = j === PLATES - 1 ? [P(RX + 0.3, -RY * 1.2), P(RX + 0.3, 0.2)] : seams[j]!
    fillShape(ctx, a.concat(c.slice().reverse()), 'rgba(70,64,90,0.1)')
  }
  seams.forEach((seam, j) => {
    stroke(ctx, seam.map(([x, y]) => [x - 0.035 * S, y] as Pt), 0.02 * S, 0.06 * S, 'rgba(60,54,70,0.35)', 834 + j)
    stroke(ctx, seam.map(([x, y]) => [x + 0.024 * S, y] as Pt), 0.032 * S, 0.014 * S, SHELL.lit, 842 + j)
    stroke(ctx, seam, 0.024 * S, 0.016 * S, SEAM, 850 + j)
  })
  // Pale mottles scattered over the plates, fixed.
  for (let k = 0; k < 9; k++) {
    const lx = -0.56 + (k / 8) * 1.1 + noise2(k, 3, 857) * 0.08
    const ly = -0.25 - noise2(k * 1.7, 5, 858) * 0.5
    const m = P(lx, ly)
    fillShape(ctx, blob(m[0], m[1], 0.028 * S, 0.02 * S, 858 + k, 0.2), 'rgba(226,231,236,0.5)')
  }
  // Skirt shadow: the lower plates turn away from the light.
  fillShape(ctx, [P(-RX - 0.2, -0.12), P(RX + 0.2, -0.12), P(RX + 0.2, 0.3), P(-RX - 0.2, 0.3)], 'rgba(60,54,70,0.2)')
  ctx.restore()
  ink(ctx, dome, { width: LINE.major * S, color: INK, seed: 870, breakUp: 0.3 })
  // Tail prongs (uropods), poking out behind.
  for (const [dy, sd] of [[0.0, 871], [0.07, 872]] as const) {
    const r = P(-RX + 0.04, 0.02 + dy)
    stroke(ctx, [r, [r[0] - 0.09 * S, r[1] + 0.03 * S]], 0.05 * S, 0.012 * S, INK, sd)
    stroke(ctx, [r, [r[0] - 0.08 * S, r[1] + 0.027 * S]], 0.03 * S, 0.006 * S, BELLY.lit, sd + 2)
  }

  legRow(false)

  // ── Head ──
  // Raised to peek over the rim of its own shield.
  const hc = P(RX - 0.03, -0.44)
  const hx = hc[0]
  const hy = hc[1]
  const head = blob(hx, hy, 0.26 * S, 0.24 * S, 880, 0.06)
  paint(ctx, S, head, HEADT, 881, { line: LINE.major, breakUp: 0.28 })
  occlude(ctx, dome, 0.0, 0.1, 0.045 * S, 'rgba(28,20,24,0.55)', 882)

  // Antennae: short, elbowed, bobbing a beat behind the body.
  for (const s of [0, 1] as const) {
    const root: Pt = [hx + (0.02 + s * 0.11) * S, hy - 0.18 * S]
    const mid: Pt = [root[0] + (0.03 + s * 0.05) * S, root[1] - (0.16 - s * 0.03) * S + lag * 0.6]
    const elbow: Pt = [mid[0] + (0.08 + s * 0.02) * S, mid[1] - 0.08 * S + lag]
    const tip: Pt = [elbow[0] + (0.14 - s * 0.02) * S, elbow[1] + (0.03 + s * 0.04) * S + lag * 1.6]
    const feeler = curve([root, mid, elbow, tip], 10)
    stroke(ctx, feeler, 0.062 * S, 0.034 * S, INK, 884 + s)
    stroke(ctx, feeler, 0.036 * S, 0.016 * S, LEGT.base, 888 + s)
    fillShape(ctx, blob(tip[0], tip[1], 0.026 * S, 0.022 * S, 890 + s, 0.1), INK)
  }

  // Eyes over the rim: smug, a flat unimpressed lid.
  const lid = Math.max(0.3, cycleBlink(g, 0.4, 0.1))
  toonEye(ctx, hx + 0.03 * S, hy - 0.05 * S, 0.085 * S, { seed: 892, look: [0.75, 0], lid, pupil: 0.46, iris: '#2a2230' })
  toonEye(ctx, hx + 0.19 * S, hy - 0.07 * S, 0.078 * S, { seed: 896, look: [0.75, 0], lid, pupil: 0.46, iris: '#2a2230' })
  brow(ctx, hx + 0.1 * S, hy - 0.17 * S, 0.3 * S, 0.22, 0.04 * S, 900)
  // Cheek, and a little smirk at the corner the cap does not cover.
  stroke(ctx, [[hx - 0.12 * S, hy + 0.08 * S], [hx - 0.05 * S, hy + 0.11 * S], [hx + 0.01 * S, hy + 0.08 * S]], 0.012 * S, 0.02 * S, INK, 901)

  // ── The bottle cap: held out on the leading side ──
  const CR = 0.19 * S
  const R = 0.34 * S
  const cx = hx + 0.29 * S
  const cy = hy + 0.37 * S + lag * 0.5
  const capTilt = -0.1 + rock * 0.6
  // The crimped rim band, seen past the face toward the back.
  const crimp: Pt[] = []
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * TAU
    const k = i % 2 ? 1.0 : 1.08
    crimp.push([Math.cos(a) * CR * 1.08 * k, Math.sin(a) * R * 1.03 * k])
  }
  const rim = pivot(crimp, cx - 0.055 * S, cy + 0.01 * S, capTilt)
  paint(ctx, S, rim, RIM, 902, { line: LINE.mid, breakUp: 0.15, hatch: false })
  // Front legs gripping the back of the rim.
  for (const s of [0, 1] as const) {
    const root: Pt = [hx + 0.02 * S, hy + (0.12 + s * 0.08) * S]
    const grip: Pt = [cx - 0.19 * S, cy + (-0.1 + s * 0.2) * S]
    stroke(ctx, [root, grip], 0.06 * S, 0.05 * S, INK, 904 + s)
    stroke(ctx, [root, grip], 0.038 * S, 0.032 * S, LEGT.base, 906 + s)
  }
  const face = pivot(blob(0, 0, CR, R, 908, 0.02), cx, cy, capTilt)
  paint(ctx, S, face, CAP, 909, { line: LINE.major, breakUp: 0.15, hatch: false, amp: 0.06 })
  // Printed ring and star, the way a toy cap is decorated.
  const ring = pivot(blob(0, 0, CR * 0.7, R * 0.7, 910, 0.02), cx + 0.005 * S, cy, capTilt)
  ink(ctx, ring, { width: 0.045 * S, color: '#ffc93c', seed: 911, breakUp: 0 })
  const star: Pt[] = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i / 10) * TAU
    const rr = i % 2 ? 0.42 : 1
    star.push([Math.cos(a) * CR * 0.42 * rr, Math.sin(a) * R * 0.42 * rr])
  }
  fillShape(ctx, pivot(star, cx + 0.005 * S, cy, capTilt), '#fff3d6')
  // Gloss on the painted tin.
  gloss(ctx, pivot([[-CR * 0.62, R * 0.2], [-CR * 0.6, -R * 0.35], [-CR * 0.2, -R * 0.72]], cx, cy, capTilt), 0.035 * S, 912, 'rgba(255,240,230,0.85)')
  // Two little toes hooked over the rim.
  for (const s of [0, 1] as const) {
    const tp: Pt = [cx - 0.18 * S, cy + (-0.12 + s * 0.22) * S]
    stroke(ctx, [[tp[0] - 0.02 * S, tp[1]], [tp[0] + 0.045 * S, tp[1] + 0.012 * S]], 0.045 * S, 0.022 * S, INK, 914 + s)
    stroke(ctx, [[tp[0] - 0.015 * S, tp[1]], [tp[0] + 0.034 * S, tp[1] + 0.01 * S]], 0.026 * S, 0.012 * S, LEGT.lit, 916 + s)
  }
}

// ─── 4 · Stag Beetle (thornwick) ────────────────────────────────────────────

/**
 * One mandible, authored for the RIGHT side as a spine of control points
 * relative to its root: out, up, and hooking back IN at the tip, so the pair
 * reads as pincers rather than as a bull's horns. The left one is its mirror
 * with its own proportions and tines, so the pair is never a reflection.
 */
const JAW_R: Pt[] = [[0, 0], [0.2, -0.15], [0.36, -0.38], [0.42, -0.64], [0.35, -0.88], [0.18, -1.02], [-0.06, -1.04]]
const JAW_L: Pt[] = [[0, 0], [0.18, -0.17], [0.33, -0.4], [0.38, -0.64], [0.31, -0.86], [0.15, -0.98], [-0.04, -0.99]]

/** Width of a mandible at fraction `k` along it. */
const jawW = (k: number, S: number): number => (0.11 * (1 - k) ** 0.75 + 0.02) * S

/**
 * A tapered antler-mandible along a smoothed spine, with tines on the inner
 * edge. Tines are painted first so the blade covers their roots and the two
 * read as one piece of chitin.
 */
const mandible = (
  ctx: CanvasRenderingContext2D, S: number, spine: Pt[], m: 1 | -1, root: Pt,
  angle: number, T: CelTones, seed: number, tines: number[]
): void => {
  const pts = curve(spine, 4)
  const n = pts.length - 1
  const world = pivot(pts.map(([x, y]) => [x * S, y * S] as Pt), root[0], root[1], angle, m)
  const nrm = (i: number): Pt => normal(world[Math.max(0, i - 1)]!, world[Math.min(n, i + 1)]!)

  // Tines: on the edge facing the other mandible, raking forward.
  tines.forEach((tk, j) => {
    const i = Math.round(tk * n)
    const p = world[i]!
    let nn = nrm(i)
    if (nn[0] * -m < 0) nn = [-nn[0], -nn[1]]
    const o = world[Math.max(0, i - 1)]!
    const q = world[Math.min(n, i + 1)]!
    const tl = Math.hypot(q[0] - o[0], q[1] - o[1]) || 1
    const along: Pt = [(q[0] - o[0]) / tl, (q[1] - o[1]) / tl]
    const w = jawW(tk, S)
    const len = (0.17 - j * 0.045) * S
    const tine = hard([
      [p[0] - along[0] * w * 1.1, p[1] - along[1] * w * 1.1],
      [p[0] + nn[0] * (w + len) + along[0] * len * 0.7, p[1] + nn[1] * (w + len) + along[1] * len * 0.7],
      [p[0] + along[0] * w * 1.3, p[1] + along[1] * w * 1.3]
    ], 0.18)
    paint(ctx, S, tine, T, seed + 10 + j, { line: LINE.mid, deep: false, breakUp: 0.1, hatch: false })
  })

  const left: Pt[] = []
  const right: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const w = jawW(i / n, S)
    const p = world[i]!
    const nn = nrm(i)
    left.push([p[0] + nn[0] * w, p[1] + nn[1] * w])
    right.unshift([p[0] - nn[0] * w, p[1] - nn[1] * w])
  }
  const shape = left.concat(right)
  paint(ctx, S, shape, T, seed, { line: LINE.major, breakUp: 0.2, hatch: false, amp: 0.08 })
  // Gloss along the lit (outer-upper) edge.
  const hi: Pt[] = []
  for (let i = 2; i <= n - 6; i++) {
    const w = jawW(i / n, S)
    let nn = nrm(i)
    if (nn[0] * m < 0) nn = [-nn[0], -nn[1]]
    const p = world[i]!
    const k = m > 0 ? -0.4 : 0.45
    hi.push([p[0] + nn[0] * w * k, p[1] + nn[1] * w * k])
  }
  gloss(ctx, hi, 0.032 * S, seed + 20, 'rgba(255,214,190,0.75)')
  // Dark tip, like lacquer worn through.
  const tip = world[n]!
  fillShape(ctx, blob(tip[0], tip[1], 0.03 * S, 0.026 * S, seed + 21, 0.1), 'rgba(40,14,10,0.85)')
}

/**
 * The boss: a stag beetle in full threat posture, head raised and antler
 * mandibles spread like a crown. Glossy black-red, slow, and heavy — each
 * tripod lands with a dip, a lagging nod of the antlers and a scuff of sand.
 */
export const drawStagBeetle = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  const C = 3200
  const g = gait(t, C)
  const b = bodyBob(g, 0.03) * S
  // Heavy things roll more and bounce less.
  const sway = weightShift(g, 0.04) * S
  // The antlers are heavy and hinged at the head: they nod a beat late.
  const nod = (bodyBob(g - 0.1, 0.03) - bodyBob(g, 0.03)) * 1.4

  const BLACK = tones('#422629', 1.05)
  const PRO = tones('#62241f', 1.05)
  const RED = tones('#8c2a1d', 1.1)
  const JAW = tones('#a8391f')
  const LEGT = tones('#43292b', 1.05)
  const DUST = '#e9cf98'

  groundShadow(ctx, S, 1.04, 1.02, 0.34)

  const ex = -0.1 * S + sway * 0.8
  const ey = 0.16 * S + b * 0.9
  const px = 0.04 * S + sway
  const py = 0.38 * S + b
  const hx = 0.06 * S + sway * 1.15
  const hy = 0.05 * S + b * 1.2

  // ── Legs: six, long, spurred, stomping a tripod ──
  const FEET: Pt[] = [[0.52, 1.0], [0.88, 0.97], [1.0, 0.9]]
  const legAt = (s: 1 | -1, i: number): { hip: Pt; foot: Pt; l1: number; l2: number; land: number } => {
    const far = s < 0 ? 0.94 : 1
    const hip0: Pt = [0.04 * S + s * (0.32 + i * 0.06) * S, (0.5 - i * 0.08) * S]
    const knee0: Pt = [hip0[0] + s * (0.28 + i * 0.05) * S * far, hip0[1] - (0.16 + i * 0.04) * S]
    const foot0: Pt = [0.04 * S + s * FEET[i]![0] * S * far, FEET[i]![1] * S - (s < 0 ? 0.015 * S : 0)]
    const l1 = Math.hypot(knee0[0] - hip0[0], knee0[1] - hip0[1])
    const l2 = Math.hypot(foot0[0] - knee0[0], foot0[1] - knee0[1])
    const groupA = (s < 0) === (i % 2 === 0)
    const ph = g + (groupA ? 0 : 0.5)
    const st = footStep(ph, 0.1 * S, 0.14 * S)
    return {
      hip: [hip0[0] + sway, hip0[1] + b],
      foot: [foot0[0] + st[0], foot0[1] + st[1]],
      l1, l2,
      // 0 at the moment of touchdown, rising through the stance.
      land: ((ph % 1) + 1) % 1
    }
  }
  const drawLeg = (s: 1 | -1, i: number): void => {
    const L = legAt(s, i)
    bugLeg(ctx, S, L.hip, L.foot, L.l1, L.l2, -s, LEGT, 950 + i * 10 + (s > 0 ? 5 : 0), {
      width: 0.12 * S, taper: 0.5, spurs: true, claw: true
    })
  }
  // Sand scuffs where a foot has just come down.
  const dust = (s: 1 | -1, i: number): void => {
    const L = legAt(s, i)
    if (L.land > 0.3) return
    const d = L.land / 0.3
    ctx.save()
    ctx.globalAlpha = (1 - d) * 0.8
    for (const k of [-1, 1] as const) {
      const r = (0.035 + d * 0.05) * S
      const x = L.foot[0] + k * (0.06 + d * 0.14) * S
      const y = L.foot[1] - (0.02 + d * 0.06) * S
      fillShape(ctx, place(PUFF, x, y, r), DUST)
    }
    ctx.restore()
  }
  for (const i of [2, 1]) { drawLeg(-1, i); drawLeg(1, i) }

  // ── Wing case: glossy mahogany, bulging behind the pronotum ──
  const shell = egg(ex, ey, 0.66 * S, 0.48 * S, 0.94, 920, 0.035)
  paint(ctx, S, shell, RED, 921, { line: LINE.major, hatch: false, amp: 0.08, breakUp: 0.3 })
  ctx.save()
  ctx.beginPath(); trace(ctx, shell); ctx.clip()
  stroke(ctx, [[ex - 0.02 * S, ey + 0.1 * S], [ex - 0.08 * S, ey - 0.2 * S], [ex - 0.2 * S, ey - 0.48 * S]],
    0.03 * S, 0.012 * S, INK, 922)
  gloss(ctx, [[ex - 0.58 * S, ey + 0.06 * S], [ex - 0.5 * S, ey - 0.2 * S], [ex - 0.28 * S, ey - 0.4 * S]], 0.055 * S, 923, 'rgba(255,200,180,0.8)')
  gloss(ctx, [[ex + 0.2 * S, ey - 0.38 * S], [ex + 0.38 * S, ey - 0.3 * S]], 0.03 * S, 924, 'rgba(255,200,180,0.55)')
  ctx.restore()

  // Front legs come off under the shield: drawn before it, so only the
  // forearm shows beside the head rather than a whole femur across the chest.
  drawLeg(-1, 0)
  drawLeg(1, 0)

  // ── Pronotum: a wide black-red shield ──
  const pro = rough([
    [px - 0.6 * S, py + 0.02 * S], [px - 0.52 * S, py - 0.18 * S], [px - 0.22 * S, py - 0.26 * S],
    [px + 0.24 * S, py - 0.27 * S], [px + 0.55 * S, py - 0.18 * S], [px + 0.62 * S, py + 0.02 * S],
    [px + 0.46 * S, py + 0.21 * S], [px, py + 0.26 * S], [px - 0.46 * S, py + 0.2 * S]
  ], 0.01 * S, 930)
  paint(ctx, S, pro, PRO, 931, { line: LINE.major, amp: 0.08, breakUp: 0.25, hatch: false })
  gloss(ctx, [[px - 0.48 * S, py + 0.02 * S], [px - 0.4 * S, py - 0.13 * S], [px - 0.16 * S, py - 0.19 * S]], 0.045 * S, 932, 'rgba(255,215,205,0.75)')
  stroke(ctx, [[px + 0.24 * S, py - 0.13 * S], [px + 0.44 * S, py - 0.09 * S]], 0.012 * S, 0.022 * S, 'rgba(255,215,205,0.45)', 933)
  occlude(ctx, shell, 0.02, 0.22, 0.05 * S, 'rgba(20,10,12,0.7)', 934)

  for (const s of [-1, 1] as const) for (const i of [0, 1, 2]) dust(s, i)

  // ── Antennae: elbowed, ending in little combs ──
  for (const s of [-1, 1] as const) {
    const root: Pt = [hx + s * 0.4 * S, hy - 0.02 * S]
    const elbow: Pt = [root[0] + s * 0.22 * S, root[1] - 0.1 * S + nod * S * 0.5]
    const tip: Pt = [elbow[0] + s * 0.07 * S, elbow[1] + 0.15 * S + nod * S]
    stroke(ctx, [root, elbow], 0.045 * S, 0.038 * S, INK, 940 + s)
    stroke(ctx, [elbow, tip], 0.038 * S, 0.032 * S, INK, 942 + s)
    for (let k = 0; k < 3; k++) {
      const c = lerp(elbow, tip, 0.45 + k * 0.25)
      stroke(ctx, [c, [c[0] + s * 0.065 * S, c[1] + 0.012 * S]], 0.034 * S, 0.02 * S, INK, 944 + k + (s > 0 ? 3 : 0))
    }
  }

  // ── Antler mandibles, spread like a crown ──
  const jawAngle = nod * 0.9
  mandible(ctx, S, JAW_L, -1, [hx - 0.27 * S, hy - 0.12 * S], -jawAngle - 0.04, JAW, 960, [0.48])
  mandible(ctx, S, JAW_R, 1, [hx + 0.27 * S, hy - 0.13 * S], jawAngle + 0.02, JAW, 980, [0.42, 0.66])

  // ── Head: wide and flat, a scowl built into the carapace ──
  const head = rough([
    [hx - 0.5 * S, hy + 0.04 * S], [hx - 0.45 * S, hy - 0.14 * S], [hx - 0.22 * S, hy - 0.21 * S],
    [hx + 0.01 * S, hy - 0.13 * S], [hx + 0.24 * S, hy - 0.22 * S], [hx + 0.48 * S, hy - 0.15 * S],
    [hx + 0.53 * S, hy + 0.04 * S], [hx + 0.38 * S, hy + 0.2 * S], [hx, hy + 0.24 * S], [hx - 0.36 * S, hy + 0.19 * S]
  ], 0.008 * S, 1000)
  paint(ctx, S, head, BLACK, 1001, { line: LINE.major, amp: 0.08, breakUp: 0.22, hatch: false })
  gloss(ctx, [[hx - 0.4 * S, hy - 0.02 * S], [hx - 0.31 * S, hy - 0.13 * S], [hx - 0.14 * S, hy - 0.15 * S]], 0.04 * S, 1002, 'rgba(255,215,205,0.75)')

  // Eyes: amber, slit-pupilled, glaring from under a heavy brow ridge.
  const lid = Math.max(0.24, cycleBlink(g, 0.8, 0.09))
  toonEye(ctx, hx - 0.26 * S, hy - 0.02 * S, 0.105 * S, { seed: 1004, look: [0.4, 0.15], lid, pupil: 0.5, iris: '#ffb428', sclera: '#ffe9a8', slit: true })
  toonEye(ctx, hx + 0.27 * S, hy - 0.035 * S, 0.115 * S, { seed: 1008, look: [0.4, 0.15], lid, pupil: 0.5, iris: '#ffb428', sclera: '#ffe9a8', slit: true })
  // The ridge catches a warm light along its top, then the dark brow under it.
  brow(ctx, hx - 0.25 * S, hy - 0.145 * S, 0.26 * S, 0.5, 0.03 * S, 1011, 'rgba(190,110,96,0.8)')
  brow(ctx, hx + 0.26 * S, hy - 0.16 * S, 0.28 * S, -0.5, 0.03 * S, 1010, 'rgba(190,110,96,0.8)')
  brow(ctx, hx - 0.25 * S, hy - 0.12 * S, 0.26 * S, 0.5, 0.065 * S, 1012)
  brow(ctx, hx + 0.26 * S, hy - 0.135 * S, 0.28 * S, -0.5, 0.065 * S, 1013)

  // Mouthparts: a gruff little moustache of golden palps.
  for (const s of [-1, 1] as const) {
    const r: Pt = [hx + s * 0.08 * S, hy + 0.17 * S]
    stroke(ctx, [r, [r[0] + s * 0.07 * S, r[1] + 0.07 * S], [r[0] + s * 0.035 * S, r[1] + 0.13 * S]],
      0.045 * S, 0.022 * S, INK, 1014 + s)
    stroke(ctx, [r, [r[0] + s * 0.065 * S, r[1] + 0.065 * S], [r[0] + s * 0.033 * S, r[1] + 0.12 * S]],
      0.026 * S, 0.012 * S, '#e8a844', 1016 + s)
  }
  // Frown line under the brow — where the clypeus folds.
  stroke(ctx, [[hx - 0.11 * S, hy + 0.11 * S], [hx, hy + 0.075 * S], [hx + 0.12 * S, hy + 0.11 * S]], 0.024 * S, 0.02 * S, 'rgba(20,10,12,0.85)', 1018)
}

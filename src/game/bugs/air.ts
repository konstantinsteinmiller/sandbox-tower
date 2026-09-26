import {
  blob, egg, rough, trace, fillShape, ink, stroke, cel, terminator, occlude,
  noise2, tones, type Pt
} from '@/game/inkArt'
import {
  INK, SHADOW_DIR, LINE, paint, blink, eye, gait, swing, pivot, SPORE_LIGHT, EMBER_LIGHT, type SocketLight,
  drawShadowSpec, type ShadowSpec
} from '@/game/monsterKit'

/**
 * ─── The flying bugs ────────────────────────────────────────────────────────
 *
 * Housefly, Mosquito, Hornet, Bumblebee and Firefly: the garden's air force.
 * Same vocabulary, same key light and the same tonal ramp as the walkers —
 * these are the same cast solving a different problem.
 *
 * What an insect flyer needs that the old bats and birds did not:
 *
 *   * **Glass wings.** Membranes are drawn translucent with visible veins and
 *     a dark rim, so the sky reads through them but the silhouette still holds.
 *     They are authored ONCE in local space and placed with `pivot`, so a wing
 *     is rigid and only its angle changes — the house rule.
 *   * **A buzz, not a flap.** A wing beats several times per locomotion cycle,
 *     and a faint ghost of the wing sits at the opposite end of its stroke, so
 *     even a frozen frame reads as "vibrating". The ghost is symmetrical about
 *     the stroke, so it reads the same whichever way the beat is sampled.
 *   * **Beat counts that survive the bake.** In game a design is 16 frames
 *     replayed over roughly 0.7 s, whatever `cycleMs` says. A beat count that
 *     is ≡ ±4 (mod 16) lands the 16 frames on up / mid / down / mid, four times
 *     over: a clean, readable wingbeat. Anything else aliases into flicker. So
 *     every beat count below is 4, 12 or 20 — the bench then plays them at a
 *     proper buzz while the game still sees a clean stroke.
 *   * **Dangling legs.** Legs are cargo in the air. They hang and trail the
 *     body's bob by a quarter cycle, which is what makes it look carried.
 */

// ─── Shared parts ───────────────────────────────────────────────────────────

const TAU = Math.PI * 2

/**
 * Map authored unit-space points into world space: scaled by `S·k`, mirrored
 * for the left-hand side, rotated about a shoulder.
 *
 * `a` is the angle for the RIGHT-hand part. The left one gets `-a` as well as
 * the mirror, so one number flaps a pair symmetrically — pass the same `a` to
 * both sides and they beat together, rather than see-sawing.
 */
const poser = (S: number, sx: number, sy: number, a: number, side: 1 | -1, k = 1) =>
  (pts: Pt[]): Pt[] =>
    pivot(pts.map(([x, y]) => [x * S * k, y * S * k] as Pt), sx, sy, a * side, side)

interface Glass {
  /** Membrane fill — translucent. */
  fill: string
  /** Sheen along the leading edge. */
  sheen: string
  /** Oil-slick tint near the trailing edge. */
  tint: string
  vein: string
  rim: string
}

const CLEAR_GLASS: Glass = {
  fill: 'rgba(226,242,255,0.5)',
  sheen: 'rgba(255,255,255,0.55)',
  tint: 'rgba(255,160,220,0.2)',
  vein: 'rgba(58,44,52,0.6)',
  rim: 'rgba(59,42,33,0.9)'
}
const AMBER_GLASS: Glass = {
  fill: 'rgba(255,205,120,0.5)',
  sheen: 'rgba(255,246,214,0.6)',
  tint: 'rgba(255,140,60,0.22)',
  vein: 'rgba(96,44,20,0.7)',
  rim: 'rgba(59,42,33,0.95)'
}
const SMOKE_GLASS: Glass = {
  fill: 'rgba(208,214,236,0.52)',
  sheen: 'rgba(255,255,255,0.5)',
  tint: 'rgba(170,255,200,0.2)',
  vein: 'rgba(52,44,64,0.6)',
  rim: 'rgba(59,42,33,0.9)'
}

/**
 * One membrane wing, already posed.
 *
 * Sheen and tint are authored as bands in the wing's own space and clipped to
 * it, so they ride along with the wing instead of sliding across it.
 */
const glassWing = (
  ctx: CanvasRenderingContext2D, S: number, pose: (p: Pt[]) => Pt[],
  shape: Pt[], veins: Pt[][], glass: Glass, seed: number, alpha = 1
): void => {
  const w = pose(shape)
  ctx.save()
  ctx.globalAlpha = alpha
  fillShape(ctx, w, glass.fill)
  if (alpha >= 1) {
    ctx.save()
    ctx.beginPath(); trace(ctx, w); ctx.clip()
    fillShape(ctx, pose([[0, -0.4], [1.2, -0.4], [1.2, -0.05], [0.5, -0.03], [0, 0]]), glass.sheen)
    fillShape(ctx, pose([[0.2, 0.06], [1.2, 0.02], [1.2, 0.4], [0.2, 0.4]]), glass.tint)
    veins.forEach((v, i) => {
      stroke(ctx, pose(v), LINE.hair * S * 1.3, LINE.hair * S * 0.5, glass.vein, seed + 10 + i)
    })
    ctx.restore()
    ink(ctx, w, { width: LINE.fine * S, color: glass.rim, seed, breakUp: 0.3 })
  } else {
    ink(ctx, w, { width: LINE.hair * S, color: glass.rim, seed, breakUp: 0.5 })
  }
  ctx.restore()
}

/** A soft additive glow — the socket-light ramp without the socket. */
const glow = (
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number,
  light: SocketLight, alpha = 1
): void => {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = alpha
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, light.hot)
  g.addColorStop(0.42, light.mid)
  g.addColorStop(1, light.out)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fill()
  ctx.restore()
}

/**
 * A jointed insect leg through the given points, inked, with optional pale
 * bands at the inner joints. Legs are thin, so they carry their own ink bleed
 * rather than relying on an outline that would swallow them.
 */
const bugLeg = (
  ctx: CanvasRenderingContext2D, pts: Pt[], w0: number, w1: number,
  color: string, seed: number, band?: string
): void => {
  const bleed = w0 * 0.55
  stroke(ctx, pts, w0 + bleed, w1 + bleed, INK, seed)
  stroke(ctx, pts, w0, w1, color, seed)
  if (band) {
    for (let i = 1; i < pts.length - 1; i++) {
      const p = pts[i]!
      const q = pts[i + 1]!
      const k = 0.16
      stroke(ctx, [p, [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]],
        w0 * 0.9, w0 * 0.8, band, seed + 20 + i)
    }
  }
}

/**
 * A compound eye, cartoon-first: a glossy dome with a faint facet grid, a big
 * pupil so it can LOOK somewhere, and a lid for the blink. The facets are what
 * say "insect"; the pupil is what says "character".
 */
const compoundEye = (
  ctx: CanvasRenderingContext2D, S: number,
  x: number, y: number, rx: number, ry: number, seed: number,
  o: { base: string; look: Pt; lid: number; lidColor: string; pupil?: number }
): void => {
  const dome = egg(x, y, rx, ry, 0.9, seed, 0.035)
  const T = tones(o.base, 1.1)
  cel(ctx, dome, T, {
    shade: terminator(dome, SHADOW_DIR, 0.02, 0.1, seed + 1),
    deep: terminator(dome, SHADOW_DIR, 0.52, 0.08, seed + 2),
    lit: terminator(dome, SHADOW_DIR + Math.PI, 0.5, 0.1, seed + 3)
  }, { hatch: false })

  ctx.save()
  ctx.beginPath(); trace(ctx, dome); ctx.clip()
  // Facets: a hex grid of faint dimples. Constant layout, so it never crawls.
  const step = Math.min(rx, ry) * 0.24
  ctx.fillStyle = 'rgba(60,0,14,0.2)'
  for (let row = -6; row <= 6; row++) {
    for (let col = -6; col <= 6; col++) {
      const px = x + (col + (row & 1) * 0.5) * step
      const py = y + row * step * 0.87
      if (((px - x) / rx) ** 2 + ((py - y) / ry) ** 2 > 1.1) continue
      ctx.beginPath(); ctx.arc(px, py, step * 0.3, 0, TAU); ctx.fill()
    }
  }
  const pk = o.pupil ?? 0.46
  const px = x + o.look[0] * rx
  const py = y + o.look[1] * ry
  fillShape(ctx, blob(px, py, rx * pk, ry * pk * 1.05, seed + 4, 0.06), '#26060c')
  fillShape(ctx, blob(px - rx * pk * 0.36, py - ry * pk * 0.4, rx * pk * 0.36, ry * pk * 0.3, seed + 5, 0.2),
    'rgba(255,255,255,0.95)')
  fillShape(ctx, blob(px + rx * pk * 0.34, py + ry * pk * 0.36, rx * pk * 0.15, ry * pk * 0.13, seed + 6, 0.2),
    'rgba(255,255,255,0.6)')
  // The gloss: a long soft crescent on the lit shoulder of the dome. This one
  // mark is most of what makes the eye read as wet rather than painted.
  fillShape(ctx, pivot(blob(0, 0, rx * 0.44, ry * 0.15, seed + 7, 0.1), x - rx * 0.28, y - ry * 0.58, -0.62, 1),
    'rgba(255,255,255,0.5)')
  if (o.lid > 0.03) {
    const top = y - ry * 1.15
    const edge = top + ry * 2.3 * o.lid
    fillShape(ctx, [[x - rx * 1.3, top], [x + rx * 1.3, top], [x + rx * 1.3, edge], [x - rx * 1.3, edge + ry * 0.08]],
      o.lidColor)
    stroke(ctx, [[x - rx * 1.2, edge + ry * 0.07], [x, edge + ry * 0.05], [x + rx * 1.2, edge]],
      LINE.fine * S, LINE.fine * S, INK, seed + 9)
  }
  ctx.restore()
  ink(ctx, dome, { width: LINE.mid * S, color: INK, seed: seed + 8, breakUp: 0.18 })
}

/** A thick ink brow — a mood in one stroke. `tilt` > 0 slants the inner end down. */
const brow = (
  ctx: CanvasRenderingContext2D, S: number, x: number, y: number,
  len: number, tilt: number, side: 1 | -1, seed: number
): void => {
  // `side` says which way is "inner": +1 for a right-hand brow.
  const dx = Math.cos(tilt) * len / 2
  const dy = Math.sin(tilt) * len / 2
  stroke(ctx, [
    [x + side * dx, y + dy],
    [x, y - len * 0.08],
    [x - side * dx, y - dy]
  ], 0.05 * S, 0.02 * S, INK, seed)
}


// ─── 6 · Housefly (nibbler) ─────────────────────────────────────────────────

const FLY_WING: Pt[] = [
  [0.0, -0.035], [0.16, -0.12], [0.42, -0.17], [0.66, -0.14], [0.8, -0.05],
  [0.8, 0.04], [0.68, 0.11], [0.44, 0.13], [0.2, 0.09], [0.04, 0.04]
]
const FLY_VEINS: Pt[][] = [
  [[0.02, -0.02], [0.36, -0.1], [0.72, -0.1]],
  [[0.04, 0.0], [0.42, -0.02], [0.78, 0.0]],
  [[0.06, 0.02], [0.4, 0.06], [0.7, 0.08]],
  [[0.46, -0.13], [0.5, -0.02], [0.48, 0.1]]
]

/** Its contact shadow — baked into the frames, and laid under a painted strip. */
export const HOUSEFLY_SHADOW: ShadowSpec = { w: 0.24, y: 1.02, a: 0.14 }

export const drawHousefly = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  const g = gait(t, 860)
  // Twelve beats a cycle: a real buzz on the bench, four clean strokes in the
  // baked strip.
  const beat = Math.sin(g * TAU * 12)
  // Lift arrives late: the body rises after the downstroke, never with it.
  const bob = Math.cos((g - 0.12) * TAU) * 0.06 * S
  const lean = Math.sin((g - 0.3) * TAU) * 0.02 * S

  const BODY = tones('#5b6072', 1.05)
  const ABD = tones('#7b7560', 1)
  const FACE = tones('#d9d4c4', 0.85)
  const LEG = '#2f2c35'

  drawShadowSpec(ctx, S, HOUSEFLY_SHADOW)

  const cx = lean
  const cy = 0.12 * S + bob

  // ── Wings: behind everything, held out in a V, buzzing ──
  for (const side of [-1, 1] as const) {
    const sx = cx + side * 0.22 * S
    const sy = cy - 0.06 * S
    const amp = side === 1 ? 0.44 : 0.4
    glassWing(ctx, S, poser(S, sx, sy, -0.48 - beat * amp, side), FLY_WING, [], CLEAR_GLASS, 700 + side, 0.32)
    glassWing(ctx, S, poser(S, sx, sy, -0.48 + beat * amp, side), FLY_WING, FLY_VEINS, CLEAR_GLASS, 710 + side)
  }

  // ── Abdomen: a fat olive-grey barrel hanging behind ──
  const abd = egg(cx + 0.02 * S, cy + 0.38 * S, 0.29 * S, 0.26 * S, 1.12, 720, 0.05)
  paint(ctx, S, abd, ABD, 721, { line: LINE.major, breakUp: 0.22 })
  ctx.save()
  ctx.beginPath(); trace(ctx, abd); ctx.clip()
  // Chequered tergites: dark saddles, the housefly's actual pattern.
  for (const [dx, dy, sd] of [[-0.13, 0.36, 722], [0.14, 0.37, 723], [0.0, 0.52, 724]] as const) {
    fillShape(ctx, blob(cx + dx * S, cy + dy * S, 0.09 * S, 0.06 * S, sd, 0.2), 'rgba(40,34,30,0.35)')
  }
  ctx.restore()

  // ── Thorax: the hairy grey core, broad-shouldered, striped ──
  const thorax = blob(cx, cy + 0.12 * S, 0.4 * S, 0.3 * S, 730, 0.05, 7.5, 96)
  paint(ctx, S, thorax, BODY, 731, { line: LINE.major, breakUp: 0.2 })
  ctx.save()
  ctx.beginPath(); trace(ctx, thorax); ctx.clip()
  for (const dx of [-0.24, -0.08, 0.08, 0.24]) {
    stroke(ctx, [[cx + dx * S, cy - 0.1 * S], [cx + dx * 1.15 * S, cy + 0.36 * S]],
      0.05 * S, 0.022 * S, 'rgba(30,30,40,0.35)', 732 + Math.round(dx * 100))
  }
  ctx.restore()
  // Bristles on the shoulders and flanks: a housefly is hairy, and a few black
  // hairs on the silhouette are what separate "fly" from "bead".
  for (let i = 0; i < 14; i++) {
    const side = i < 7 ? -1 : 1
    const k = (i % 7) / 6
    const a = side < 0 ? Math.PI * (0.78 + k * 0.42) : Math.PI * (2.22 - k * 0.42)
    const bx = cx + Math.cos(a) * 0.39 * S
    const by = cy + 0.12 * S + Math.sin(a) * 0.29 * S
    const len = (0.05 + noise2(i * 1.7, 3, 740) * 0.05) * S
    stroke(ctx, [[bx, by], [bx + Math.cos(a) * len, by + Math.sin(a) * len - 0.015 * S]],
      0.02 * S, 0.003 * S, INK, 741 + i)
  }

  // ── Legs: six, dangling, trailing the bob ──
  const drag = (Math.cos((g - 0.37) * TAU) - Math.cos((g - 0.12) * TAU)) * 0.05 * S
  for (const side of [-1, 1] as const) {
    for (let i = 0; i < 3; i++) {
      const hip: Pt = [cx + side * (0.07 + i * 0.08) * S, cy + (0.34 - i * 0.03) * S]
      const sw = swing(g - 0.25 - i * 0.08, 0.02) * S
      const knee: Pt = [hip[0] + side * (0.08 + i * 0.05) * S + sw, hip[1] + 0.14 * S + drag * 0.5]
      const foot: Pt = [knee[0] + side * (i - 0.6) * 0.03 * S + sw * 1.6, knee[1] + (0.2 - i * 0.02) * S + drag]
      bugLeg(ctx, [hip, knee, foot], 0.038 * S, 0.02 * S, LEG, 750 + i * 3 + (side > 0 ? 0 : 20))
      fillShape(ctx, blob(foot[0], foot[1] + 0.01 * S, 0.03 * S, 0.02 * S, 760 + i + side, 0.2), LEG)
    }
  }

  // ── Head: silver face between two enormous red eyes ──
  const hx = cx - 0.005 * S
  const hy = cy - 0.14 * S
  const head = blob(hx, hy, 0.29 * S, 0.24 * S, 770, 0.04)
  paint(ctx, S, head, BODY, 771, { line: LINE.major, breakUp: 0.2 })
  const face = egg(hx + 0.005 * S, hy + 0.06 * S, 0.11 * S, 0.13 * S, 0.7, 772, 0.05)
  paint(ctx, S, face, FACE, 773, { line: LINE.fine, deep: false, breakUp: 0.3 })

  const bl = blink(t, 1900)
  // Mismatched on purpose: one eye bigger, both looking off the same way —
  // towards +x, the side it travels towards — like it has just spotted your
  // sandwich.
  compoundEye(ctx, S, hx - 0.17 * S, hy - 0.05 * S, 0.19 * S, 0.215 * S, 780,
    { base: '#e0362d', look: [0.28, 0.1], lid: bl, lidColor: BODY.shade })
  compoundEye(ctx, S, hx + 0.165 * S, hy - 0.04 * S, 0.17 * S, 0.2 * S, 790,
    { base: '#e0362d', look: [0.2, 0.12], lid: Math.max(bl, 0.16), lidColor: BODY.shade, pupil: 0.44 })
  // Brows: one cocked, one scowling. That is the whole mischief.
  brow(ctx, S, hx - 0.17 * S, hy - 0.3 * S, 0.2 * S, -0.3, -1, 800)
  brow(ctx, S, hx + 0.17 * S, hy - 0.27 * S, 0.18 * S, 0.34, 1, 801)

  // Smirk, lopsided.
  stroke(ctx, [
    [hx - 0.055 * S, hy + 0.1 * S], [hx + 0.0 * S, hy + 0.125 * S], [hx + 0.06 * S, hy + 0.095 * S]
  ], 0.016 * S, 0.022 * S, INK, 805)
  // Proboscis with its sponge pad — the fly's one tool, dangling like a tongue.
  const tip: Pt = [hx + 0.02 * S + swing(g - 0.3, 0.012) * S, hy + 0.27 * S]
  bugLeg(ctx, [[hx + 0.005 * S, hy + 0.13 * S], [hx + 0.012 * S, hy + 0.2 * S], tip], 0.05 * S, 0.04 * S, FACE.shade, 806)
  const pad = blob(tip[0], tip[1] + 0.015 * S, 0.06 * S, 0.035 * S, 807, 0.14)
  paint(ctx, S, pad, tones('#d98f8a', 0.9), 808, { line: LINE.fine, deep: false })
}

// ─── 4 · Mosquito (wispling) ────────────────────────────────────────────────

const MOSQ_WING: Pt[] = [
  [0.0, -0.025], [0.18, -0.065], [0.42, -0.085], [0.6, -0.06], [0.67, -0.005],
  [0.62, 0.045], [0.42, 0.06], [0.18, 0.045], [0.02, 0.025]
]
const MOSQ_VEINS: Pt[][] = [
  [[0.02, -0.01], [0.34, -0.045], [0.62, -0.035]],
  [[0.03, 0.01], [0.36, 0.015], [0.63, 0.015]]
]
const MOSQ_ABD: Pt[] = [
  [0.0, -0.08], [0.16, -0.11], [0.36, -0.14], [0.56, -0.16], [0.7, -0.12],
  [0.78, 0.0], [0.71, 0.12], [0.56, 0.17], [0.36, 0.15], [0.16, 0.11], [0.0, 0.08]
]

/** Its contact shadow — baked into the frames, and laid under a painted strip. */
export const MOSQUITO_SHADOW: ShadowSpec = { w: 0.22, y: 1.02, a: 0.12 }

export const drawMosquito = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  // A hover rather than a flight: rise, drift, settle, with the drift trailing
  // the rise so the pair reads as swimming rather than orbiting.
  const g = gait(t, 2600)
  const beat = Math.sin(g * TAU * 20)
  const bob = Math.sin(g * TAU) * 0.06 * S
  const sway = Math.sin((g - 0.2) * TAU) * 0.05 * S
  // What the dangling parts lag behind.
  const lagY = (Math.sin((g - 0.22) * TAU) - Math.sin(g * TAU)) * 0.06 * S
  const lagX = (Math.sin((g - 0.42) * TAU) - Math.sin((g - 0.2) * TAU)) * 0.05 * S
  // Authored needle-to-the-left, drawn mirrored: the battlefield treats +x as
  // the leading side, and a mosquito leads with the needle. Mirroring the
  // COORDINATES rather than the canvas keeps the key light on the upper left.
  const M = -1
  // A size up from the unit grid: a lanky bug is mostly air, and it shares a
  // rank with the housefly, so it has to carry the same weight.
  const s = S * 1.08

  const BODY = tones('#6d3f86', 1.05)
  const HEAD = tones('#694380', 1.05)
  const STRIPE = '#f7eed8'
  const LEG = '#3b2a44'
  const LEG_FAR = '#2c1f33'

  drawShadowSpec(ctx, S, MOSQUITO_SHADOW)

  const ox = sway
  const oy = bob - 0.02 * s
  const P = (x: number, y: number): Pt => [ox + M * x * s, oy + y * s]
  const side = (k: 1 | -1): 1 | -1 => (k * M) as 1 | -1

  // ── Far wing ──
  const [fwx, fwy] = P(-0.02, -0.08)
  glassWing(ctx, S, poser(s, fwx, fwy, -0.95 - beat * 0.36, side(-1), 1.0), MOSQ_WING, [], CLEAR_GLASS, 900, 0.3)
  glassWing(ctx, S, poser(s, fwx, fwy, -0.95 + beat * 0.36, side(-1), 1.0), MOSQ_WING, MOSQ_VEINS, CLEAR_GLASS, 902)

  // ── Legs: six, very long, banded. The hind pair curls UP — the mosquito's
  // signature pose, and half its silhouette ──
  const leg = (pts: [number, number][], seed: number, far: boolean): void => {
    const world = pts.map(([x, y], i) => {
      const k = i / (pts.length - 1)
      return [ox + M * x * s + lagX * k * 1.4, oy + y * s + lagY * k * 1.6] as Pt
    })
    // Bands on the near legs only: on all six they turn to speckle at game size.
    bugLeg(ctx, world, (far ? 0.034 : 0.046) * s, 0.016 * s, far ? LEG_FAR : LEG, seed, far ? undefined : STRIPE)
  }
  // Far side first, a tone down.
  leg([[-0.03, 0.13], [-0.26, 0.3], [-0.36, 0.56], [-0.4, 0.8]], 910, true)
  leg([[-0.01, 0.15], [-0.4, 0.12], [-0.58, 0.38], [-0.64, 0.66]], 912, true)
  leg([[0.03, 0.16], [-0.22, 0.4], [-0.5, 0.28], [-0.66, 0.06]], 914, true)

  // ── Abdomen: long, striped, the end a little swollen and rosy ──
  const [ax, ay] = P(0.12, 0.12)
  const abdPose = poser(s, ax, ay, 1.0 + swing(g - 0.3, 0.07), side(1))
  const abd = abdPose(MOSQ_ABD)
  paint(ctx, S, abd, BODY, 920, { line: LINE.major, breakUp: 0.2 })
  ctx.save()
  ctx.beginPath(); trace(ctx, abd); ctx.clip()
  // The last meal, showing through: a warm rosy blush in the swollen end, with
  // a wet highlight. Rosy, not red — this is a pest, not a horror.
  fillShape(ctx, abdPose([[0.3, -0.3], [0.9, -0.3], [0.9, 0.3], [0.26, 0.3]]), 'rgba(244,72,108,0.58)')
  for (let i = 0; i < 5; i++) {
    const x0 = 0.1 + i * 0.13
    fillShape(ctx, abdPose([[x0, -0.3], [x0 + 0.04, -0.3], [x0 + 0.055, 0.3], [x0 + 0.015, 0.3]]), STRIPE)
  }
  fillShape(ctx, abdPose(blob(0.52, -0.08, 0.13, 0.03, 921, 0.1)), 'rgba(255,255,255,0.55)')
  ctx.restore()

  // ── Thorax: a small humped saddle with one white stripe down it ──
  const [tx, ty] = P(0.04, 0.03)
  const thorax = egg(tx, ty, 0.2 * s, 0.18 * s, 0.8, 930, 0.05)
  paint(ctx, S, thorax, BODY, 931, { line: LINE.major, breakUp: 0.2 })
  ctx.save()
  ctx.beginPath(); trace(ctx, thorax); ctx.clip()
  stroke(ctx, [P(0.03, -0.14), P(0.05, 0.02), P(0.04, 0.16)], 0.036 * s, 0.014 * s, STRIPE, 932)
  ctx.restore()

  // Near legs, over the body.
  leg([[0.0, 0.15], [0.3, 0.28], [0.36, 0.54], [0.36, 0.82]], 940, false)
  leg([[0.06, 0.16], [0.42, 0.14], [0.6, 0.4], [0.66, 0.7]], 942, false)
  leg([[0.09, 0.17], [0.4, 0.44], [0.62, 0.3], [0.76, 0.06]], 944, false)

  // ── Near wing, narrow and fast ──
  const [nwx, nwy] = P(0.1, -0.1)
  glassWing(ctx, S, poser(s, nwx, nwy, -0.9 - beat * 0.4, side(1), 1.12), MOSQ_WING, [], CLEAR_GLASS, 950, 0.3)
  glassWing(ctx, S, poser(s, nwx, nwy, -0.9 + beat * 0.4, side(1), 1.12), MOSQ_WING, MOSQ_VEINS, CLEAR_GLASS, 952)

  // ── Head: round, all eyes and needle ──
  const [hx, hy] = P(-0.16, -0.16)

  // Feathery antennae — the barbs are what say "mosquito" at a glance.
  for (const [bx, by, mx, my, ex, ey, sd] of [
    [-0.23, -0.29, -0.33, -0.44, -0.42, -0.6, 960],
    [-0.1, -0.31, -0.03, -0.46, 0.08, -0.58, 968]
  ] as const) {
    const base = P(bx, by)
    const mid: Pt = [P(mx, my)[0] + lagX * 0.4, P(mx, my)[1]]
    const tip: Pt = [P(ex, ey)[0] + lagX * 0.8, P(ex, ey)[1]]
    stroke(ctx, [base, mid, tip], 0.026 * s, 0.008 * s, LEG_FAR, sd)
    for (let i = 1; i <= 6; i++) {
      const k = i / 7
      const q: Pt = k < 0.5
        ? [base[0] + (mid[0] - base[0]) * k * 2, base[1] + (mid[1] - base[1]) * k * 2]
        : [mid[0] + (tip[0] - mid[0]) * (k - 0.5) * 2, mid[1] + (tip[1] - mid[1]) * (k - 0.5) * 2]
      const len = (0.08 - k * 0.045) * s
      stroke(ctx, [q, [q[0] - len, q[1] + len * 0.25]], 0.01 * s, 0.002 * s, LEG, sd + i)
      stroke(ctx, [q, [q[0] + len, q[1] + len * 0.1]], 0.01 * s, 0.002 * s, LEG, sd + 10 + i)
    }
  }

  // The proboscis: long, straight, aimed low and forward — unmistakable, and
  // on a different angle from every leg so it never reads as a seventh one.
  const needle: Pt[] = [P(-0.25, -0.07), P(-0.43, 0.06), P(-0.66, 0.2)]
  stroke(ctx, needle, 0.062 * s, 0.018 * s, INK, 970)
  stroke(ctx, needle, 0.038 * s, 0.006 * s, '#8a5470', 970)
  stroke(ctx, [P(-0.26, -0.08), P(-0.42, 0.04)], 0.01 * s, 0.004 * s, 'rgba(255,236,246,0.7)', 971)
  const nt = needle[2]!
  fillShape(ctx, blob(nt[0], nt[1] - 0.014 * s, 0.014 * s, 0.012 * s, 972, 0.2), 'rgba(255,255,255,0.95)')
  bugLeg(ctx, [P(-0.28, -0.03), P(-0.4, 0.06)], 0.034 * s, 0.018 * s, HEAD.shade, 973)
  bugLeg(ctx, [P(-0.2, 0.0), P(-0.3, 0.1)], 0.032 * s, 0.018 * s, HEAD.shade, 974)

  const head = blob(hx, hy, 0.18 * s, 0.165 * s, 980, 0.05)
  paint(ctx, S, head, HEAD, 981, { line: LINE.major, breakUp: 0.2 })
  // Sly, heavy-lidded, and both looking at you. The lids never lift all the
  // way — this one is not surprised by anything. Brows flip with the mirror,
  // or the scowl would turn into a worried look.
  const bl = blink(t, 2100)
  const [e1x, e1y] = P(-0.235, -0.17)
  const [e2x, e2y] = P(-0.07, -0.155)
  eye(ctx, e1x, e1y, 0.095 * s, {
    iris: '#c4ee3a', pupil: 0.5, lid: Math.max(0.36, bl), brow: 0.25 * M, seed: 982
  })
  eye(ctx, e2x, e2y, 0.084 * s, {
    iris: '#c4ee3a', pupil: 0.52, lid: Math.max(0.42, bl), brow: -0.12 * M, seed: 986
  })
}

// ─── 12 · Hornet (skewer) ───────────────────────────────────────────────────

const HORNET_WING: Pt[] = [
  [0.0, -0.03], [0.2, -0.09], [0.48, -0.12], [0.7, -0.085], [0.8, -0.015],
  [0.74, 0.05], [0.48, 0.08], [0.22, 0.06], [0.03, 0.03]
]
const HORNET_VEINS: Pt[][] = [
  [[0.02, -0.02], [0.4, -0.08], [0.72, -0.07]],
  [[0.04, 0.0], [0.38, 0.0], [0.62, 0.02]],
  [[0.4, -0.08], [0.46, 0.0], [0.44, 0.06]]
]
const HORNET_ABD: Pt[] = [
  [0.0, -0.1], [0.12, -0.2], [0.3, -0.26], [0.5, -0.25], [0.66, -0.17],
  [0.78, -0.06], [0.82, 0.02], [0.76, 0.11], [0.58, 0.21], [0.34, 0.26],
  [0.14, 0.2], [0.02, 0.1]
]

/** Its contact shadow — baked into the frames, and laid under a painted strip. */
export const HORNET_SHADOW: ShadowSpec = { w: 0.3, y: 1.02, a: 0.16 }

export const drawHornet = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  // The fastest cycle in the cast. Faces LEFT: the head leads at −x.
  const g = gait(t, 480)
  const beat = Math.sin(g * TAU * 4)
  const bob = Math.cos((g - 0.15) * TAU) * 0.045 * S

  const YEL = tones('#ffc21f', 1.05)
  const FACE = tones('#ffb81f', 1.05)
  const RUST = tones('#8e3a22', 1.1)
  const BAND = '#2a1d1c'
  const LEG = '#eaa21c'
  const LEG_FAR = '#a8641a'

  drawShadowSpec(ctx, S, HORNET_SHADOW)

  const cy = 0.16 * S + bob
  const P = (x: number, y: number): Pt => [x * S, cy + y * S]

  // ── Far wings, behind the body ──
  const wingA = -1.32 + beat * 0.55
  const ghostA = -1.32 - beat * 0.55
  for (const [dx, k, sd, lag] of [[-0.1, 0.62, 1200, 0.14], [-0.14, 0.9, 1204, 0.1]] as const) {
    const [sx, sy] = P(dx, -0.17)
    glassWing(ctx, S, poser(S, sx, sy, ghostA - lag, 1, k), HORNET_WING, [], AMBER_GLASS, sd, 0.25)
    glassWing(ctx, S, poser(S, sx, sy, wingA - lag, 1, k), HORNET_WING, HORNET_VEINS, AMBER_GLASS, sd + 2)
  }

  // ── Far legs: short and dark, set back — they only need to fill the gaps ──
  const legSw = swing(g - 0.3, 0.025) * S
  for (const [hx0, kx, ky, fx, fy, sd] of [
    [-0.28, -0.42, 0.18, -0.46, 0.32, 1210],
    [-0.14, -0.08, 0.3, -0.02, 0.46, 1212],
    [-0.04, 0.2, 0.26, 0.32, 0.44, 1214]
  ] as const) {
    bugLeg(ctx, [P(hx0, 0.06), P(kx, ky), [P(fx, fy)[0] + legSw, P(fx, fy)[1]]],
      0.032 * S, 0.02 * S, LEG_FAR, sd)
  }

  // ── Abdomen: the big striped weapon, stinger out ──
  const abdPose = poser(S, 0.03 * S, cy + 0.07 * S, 0.56 + swing(g - 0.35, 0.05), 1)
  // Stinger first, so the abdomen's own ink closes over its root.
  const sting = abdPose([[0.74, -0.05], [1.06, 0.05], [1.09, 0.07], [0.74, 0.08]])
  fillShape(ctx, sting, BAND)
  ink(ctx, sting, { width: LINE.fine * S, color: INK, seed: 1219, breakUp: 0.1 })
  stroke(ctx, abdPose([[0.8, -0.005], [1.02, 0.045]]), 0.012 * S, 0.003 * S, 'rgba(255,245,220,0.85)', 1220)
  const abd = abdPose(HORNET_ABD)
  paint(ctx, S, abd, YEL, 1221, { line: LINE.major, breakUp: 0.18, amp: 0.1 })
  ctx.save()
  ctx.beginPath(); trace(ctx, abd); ctx.clip()
  // Bands with a notch in the leading edge — the hornet's actual marking, and
  // what stops it reading as a bee.
  fillShape(ctx, abdPose([[-0.1, -0.4], [0.1, -0.4], [0.1, 0.4], [-0.1, 0.4]]), RUST.base)
  for (const [x0, x1] of [[0.2, 0.3], [0.42, 0.52], [0.62, 0.7]] as const) {
    fillShape(ctx, abdPose([
      [x0, -0.4], [x1, -0.4], [x1 - 0.02, -0.12], [x1 + 0.03, 0.0], [x1 - 0.02, 0.12], [x1, 0.4],
      [x0, 0.4], [x0 + 0.05, 0.0]
    ]), BAND)
  }
  fillShape(ctx, abdPose([[0.76, -0.4], [1.0, -0.4], [1.0, 0.4], [0.76, 0.4]]), BAND)
  // A hard, glossy shell: one long highlight along the top.
  fillShape(ctx, abdPose(blob(0.4, -0.15, 0.24, 0.035, 1222, 0.1)), 'rgba(255,255,240,0.55)')
  ctx.restore()

  // ── Thorax: rust-brown and fuzzy, with the waist pinched in ──
  fillShape(ctx, blob(0.03 * S, cy + 0.06 * S, 0.06 * S, 0.05 * S, 1225, 0.1), BAND)
  const thorax = blob(-0.2 * S, cy - 0.01 * S, 0.22 * S, 0.19 * S, 1226, 0.045, 7, 90)
  paint(ctx, S, thorax, RUST, 1227, { line: LINE.major, breakUp: 0.18 })
  ctx.save()
  ctx.beginPath(); trace(ctx, thorax); ctx.clip()
  fillShape(ctx, blob(-0.26 * S, cy - 0.11 * S, 0.1 * S, 0.05 * S, 1228, 0.2), YEL.shade)
  fillShape(ctx, blob(-0.07 * S, cy + 0.09 * S, 0.06 * S, 0.05 * S, 1229, 0.2), YEL.base)
  ctx.restore()

  // ── Near legs: yellow, dark-tipped, spread fore and aft so they read as
  // three legs rather than a bundle — the front one reaching ──
  for (const [hx0, kx, ky, fx, fy, sd, lag] of [
    [-0.32, -0.52, 0.2, -0.58, 0.38, 1230, 0.0],
    [-0.2, -0.24, 0.36, -0.16, 0.54, 1233, 0.08],
    [-0.08, 0.12, 0.3, 0.22, 0.56, 1236, 0.16]
  ] as const) {
    const sw = swing(g - 0.3 - lag, 0.03) * S
    const hip = P(hx0, 0.12)
    const knee = P(kx, ky)
    const foot: Pt = [P(fx, fy)[0] + sw, P(fx, fy)[1]]
    bugLeg(ctx, [hip, [knee[0] + sw * 0.4, knee[1]], foot], 0.044 * S, 0.026 * S, LEG, sd)
    stroke(ctx, [foot, [foot[0] - 0.045 * S, foot[1] + 0.03 * S]], 0.026 * S, 0.006 * S, BAND, sd + 1)
  }

  // ── Head: a yellow face under a dark cap, angry and armed ──
  const [hx, hy] = P(-0.6, -0.08)
  // Antennae first — they come out from under the brow.
  const tw = swing(g - 0.2, 0.03) * S
  for (const [bx, sd, dy] of [[-0.06, 1240, 0], [0.04, 1242, 0.04]] as const) {
    const base: Pt = [hx + bx * S, hy - 0.17 * S]
    const elbow: Pt = [hx + (bx - 0.08) * S, hy - (0.4 - dy) * S]
    const tip: Pt = [hx + (bx - 0.3) * S + tw, hy - (0.32 - dy) * S + tw * 0.5]
    stroke(ctx, [base, elbow], 0.04 * S, 0.03 * S, INK, sd)
    stroke(ctx, [elbow, [elbow[0] - 0.12 * S, elbow[1] - 0.02 * S + tw * 0.3], tip], 0.03 * S, 0.018 * S, INK, sd + 1)
  }

  // Mandibles: two toothed pincers, open, clacking twice a cycle. Authored as
  // plates with the teeth on their INNER edge, so the pair bites towards each
  // other rather than hooking away.
  const clack = Math.sin(g * TAU * 2) * 0.16
  const MAND = tones('#4a2616', 1.05)
  const JAW: Pt[] = [
    [0.0, -0.045], [0.1, -0.05], [0.17, -0.02], [0.2, 0.02], [0.15, 0.015],
    [0.13, 0.04], [0.1, 0.02], [0.07, 0.05], [0.04, 0.03], [0.0, 0.045]
  ]
  // The front jaw points down-and-forward and needs its teeth on local −y to
  // face its partner; the back jaw points down and keeps them on +y.
  for (const [jx, jy, a, flip, sd] of [
    [-0.16, 0.12, 2.15 + clack, -1, 1256],
    [-0.04, 0.16, 1.4 - clack, 1, 1258]
  ] as const) {
    const jaw = poser(S, hx + jx * S, hy + jy * S, a, 1)(JAW.map(([x, y]) => [x, y * flip] as Pt))
    paint(ctx, S, jaw, MAND, sd, { line: LINE.fine, deep: false, breakUp: 0.1, amp: 0.06 })
  }

  const head = egg(hx, hy, 0.22 * S, 0.21 * S, 0.9, 1250, 0.04)
  paint(ctx, S, head, FACE, 1251, { line: LINE.major, breakUp: 0.18 })
  ctx.save()
  ctx.beginPath(); trace(ctx, head); ctx.clip()
  // Dark crown sweeping back — the "helmet" that makes the face read as a mask.
  fillShape(ctx, rough([
    [hx - 0.3 * S, hy - 0.36 * S], [hx + 0.36 * S, hy - 0.36 * S], [hx + 0.36 * S, hy + 0.16 * S],
    [hx + 0.14 * S, hy + 0.0 * S], [hx - 0.02 * S, hy - 0.12 * S], [hx - 0.26 * S, hy - 0.15 * S]
  ], 0.01 * S, 1252), RUST.shade)
  ctx.restore()
  occlude(ctx, head, 0.05, 0.3, 0.035 * S, 'rgba(40,20,16,0.6)', 1253)

  // Eyes: a big mean near eye and a smaller far one, red irises, lids down,
  // and the brows meeting in a V between them — the only bug in the sky that
  // is not playing. In a 3/4 view "angry" is the INNER end of each brow down,
  // which is the opposite slant on each eye.
  const bl = blink(t, 1100)
  eye(ctx, hx - 0.15 * S, hy - 0.02 * S, 0.075 * S, {
    iris: '#e8321e', pupil: 0.42, lid: Math.max(0.3, bl), brow: 0.75, seed: 1260, sclera: '#fff3d0'
  })
  eye(ctx, hx + 0.01 * S, hy - 0.03 * S, 0.108 * S, {
    iris: '#e8321e', pupil: 0.38, lid: Math.max(0.26, bl), brow: -0.7, seed: 1264, sclera: '#fff3d0'
  })

  // ── Near wings, over everything, amber and fast ──
  for (const [dx, k, sd, lag] of [[-0.08, 0.62, 1270, 0.04], [-0.12, 0.95, 1274, 0]] as const) {
    const [sx, sy] = P(dx, -0.16)
    glassWing(ctx, S, poser(S, sx, sy, ghostA - lag, 1, k), HORNET_WING, [], AMBER_GLASS, sd, 0.25)
    glassWing(ctx, S, poser(S, sx, sy, wingA - lag, 1, k), HORNET_WING, HORNET_VEINS, AMBER_GLASS, sd + 2)
  }
}

// ─── 13 · Bumblebee (gloomcrow) ─────────────────────────────────────────────

const BEE_WING: Pt[] = [
  [0.0, -0.03], [0.12, -0.12], [0.3, -0.15], [0.42, -0.1], [0.46, -0.01],
  [0.4, 0.07], [0.24, 0.1], [0.08, 0.06]
]
const BEE_VEINS: Pt[][] = [
  [[0.02, -0.01], [0.22, -0.07], [0.4, -0.06]],
  [[0.03, 0.01], [0.24, 0.02], [0.4, 0.03]]
]

/** Its contact shadow — baked into the frames, and laid under a painted strip. */
export const BUMBLEBEE_SHADOW: ShadowSpec = { w: 0.32, y: 1.02, a: 0.16 }

export const drawBumblebee = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  const g = gait(t, 780)
  // Tiny wings, big body: they have to go flat out.
  const beat = Math.sin(g * TAU * 12)
  // Heavy — it sags after every stroke and hauls itself back up.
  const bob = Math.cos((g - 0.13) * TAU) * 0.055 * S
  const tilt = Math.sin((g - 0.3) * TAU) * 0.018 * S
  // Drawn a size up from the unit grid: a round body carries less visual mass
  // than a spread of wings, and it has to hold its own beside the hornet.
  const s = S * 1.1

  const FUR = tones('#ffc42e', 1.05)
  const BLACK = tones('#3a2c30', 1.1)
  const TAIL = tones('#fff1d8', 0.9)
  const HONEY = tones('#ffb319', 1.05)
  const POLLEN = tones('#ff9a2a', 0.95)

  drawShadowSpec(ctx, S, BUMBLEBEE_SHADOW)

  const cx = tilt
  const cy = -0.04 * s + bob

  // ── Wings: tiny, on top, a blur of effort ──
  for (const side of [-1, 1] as const) {
    const sx = cx + side * 0.2 * s
    const sy = cy - 0.14 * s
    const amp = side === 1 ? 0.62 : 0.56
    glassWing(ctx, S, poser(s, sx, sy, -0.95 - beat * amp, side, 1.05), BEE_WING, [], CLEAR_GLASS, 1400 + side, 0.35)
    glassWing(ctx, S, poser(s, sx, sy, -0.95 + beat * amp, side, 1.05), BEE_WING, BEE_VEINS, CLEAR_GLASS, 1404 + side)
    // Effort lines around the tip of the stroke.
    for (let i = 0; i < 2; i++) {
      const r = (0.52 + i * 0.07) * s
      const arc: Pt[] = []
      for (let j = 0; j <= 6; j++) {
        const a = -1.57 + (j / 6) * 1.24
        arc.push([sx + side * Math.cos(a) * r, sy + Math.sin(a) * r])
      }
      stroke(ctx, arc, 0.006 * s, 0.006 * s, 'rgba(255,255,255,0.6)', 1408 + i + side)
    }
  }

  // ── Hind legs, out to the sides, pollen baskets loaded ──
  const drag = (Math.cos((g - 0.38) * TAU) - Math.cos((g - 0.13) * TAU)) * 0.05 * S
  for (const side of [-1, 1] as const) {
    const hip: Pt = [cx + side * 0.26 * s, cy + 0.3 * s]
    const knee: Pt = [cx + side * 0.42 * s, cy + 0.36 * s + drag * 0.5]
    const foot: Pt = [cx + side * 0.44 * s + swing(g - 0.3, 0.02) * S, cy + 0.56 * s + drag]
    bugLeg(ctx, [hip, knee, foot], 0.045 * s, 0.026 * s, BLACK.base, 1420 + side)
    const basket = blob(knee[0] + side * 0.01 * s, knee[1] + 0.07 * s, 0.06 * s, 0.075 * s, 1422 + side, 0.12)
    paint(ctx, S, basket, POLLEN, 1424 + side, { line: LINE.fine, deep: false })
  }

  // ── Body: one big fuzzy ball, banded ──
  const body = blob(cx, cy + 0.12 * s, 0.43 * s, 0.39 * s, 1430, 0.045, 8, 120)
  cel(ctx, body, FUR, {
    shade: terminator(body, SHADOW_DIR, 0.1, 0.14, 1431),
    deep: terminator(body, SHADOW_DIR, 0.5, 0.12, 1432),
    lit: terminator(body, SHADOW_DIR + Math.PI, 0.52, 0.14, 1433)
  })
  ctx.save()
  ctx.beginPath(); trace(ctx, body); ctx.clip()
  // Bands curve with the ball — a straight band flattens it into a disc.
  const band = (y0: number, y1: number, color: string, sd: number): void => {
    const pts: Pt[] = []
    for (let i = 0; i <= 10; i++) {
      const u = (i / 10) * 2 - 1
      pts.push([cx + u * 0.5 * s, cy + (y0 + 0.09 * Math.sqrt(1 - u * u)) * s])
    }
    for (let i = 10; i >= 0; i--) {
      const u = (i / 10) * 2 - 1
      pts.push([cx + u * 0.5 * s, cy + (y1 + 0.09 * Math.sqrt(1 - u * u)) * s])
    }
    fillShape(ctx, rough(pts, 0.008 * s, sd), color)
  }
  band(-0.04, 0.12, BLACK.base, 1434)
  band(0.25, 0.37, BLACK.base, 1435)
  band(0.44, 0.7, TAIL.base, 1436)
  // Re-cut the shadow over the bands, so they sit ON the ball.
  ctx.globalAlpha = 0.28
  fillShape(ctx, terminator(body, SHADOW_DIR, 0.1, 0.14, 1431), '#5a2a10')
  ctx.globalAlpha = 1
  ctx.restore()
  ink(ctx, body, { width: LINE.major * S, color: INK, seed: 1437, breakUp: 0.2 })
  // Fuzz: tufts on the silhouette.
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU + 0.2
    const bx = cx + Math.cos(a) * 0.42 * s
    const by = cy + 0.12 * s + Math.sin(a) * 0.38 * s
    const len = (0.03 + noise2(i * 1.3, 2, 1438) * 0.035) * s
    stroke(ctx, [[bx, by], [bx + Math.cos(a) * len, by + Math.sin(a) * len]],
      0.022 * s, 0.004 * s, INK, 1439 + i)
  }

  // ── The honey bomb, hugged tight ──
  const [bx, by] = [cx + 0.02 * s, cy + 0.62 * s]
  const drip: Pt[] = [
    [bx - 0.05 * s, by + 0.1 * s], [bx - 0.02 * s, by + 0.21 * s], [bx - 0.045 * s, by + 0.25 * s],
    [bx - 0.075 * s, by + 0.21 * s], [bx - 0.1 * s, by + 0.1 * s]
  ]
  paint(ctx, S, drip, HONEY, 1450, { line: LINE.fine, deep: false })
  const ball = blob(bx, by, 0.17 * s, 0.165 * s, 1452, 0.05)
  cel(ctx, ball, HONEY, {
    shade: terminator(ball, SHADOW_DIR, 0.05, 0.12, 1453),
    deep: terminator(ball, SHADOW_DIR, 0.55, 0.1, 1454),
    lit: terminator(ball, SHADOW_DIR + Math.PI, 0.45, 0.12, 1455)
  }, { hatch: false })
  ctx.save()
  ctx.beginPath(); trace(ctx, ball); ctx.clip()
  // Honeycomb, faint: says "honey" rather than "orange".
  ctx.globalAlpha = 0.35
  for (let row = -2; row <= 2; row++) {
    for (let col = -2; col <= 2; col++) {
      const hx = bx + (col + (row & 1) * 0.5) * 0.09 * s
      const hy = by + row * 0.078 * s
      const hex: Pt[] = []
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU + Math.PI / 6
        hex.push([hx + Math.cos(a) * 0.048 * s, hy + Math.sin(a) * 0.048 * s])
      }
      hex.push(hex[0]!)
      stroke(ctx, hex, 0.008 * s, 0.008 * s, '#b8620c', 1460 + row * 5 + col)
    }
  }
  ctx.globalAlpha = 1
  // Wet gloss.
  fillShape(ctx, pivot(blob(0, 0, 0.07 * s, 0.03 * s, 1470, 0.1), bx - 0.07 * s, by - 0.08 * s, -0.7, 1),
    'rgba(255,255,240,0.8)')
  ctx.restore()
  ink(ctx, ball, { width: LINE.mid * S, color: INK, seed: 1471, breakUp: 0.15 })
  // A second drip running down the front.
  const run: Pt[] = [
    [bx + 0.06 * s, by - 0.02 * s], [bx + 0.1 * s, by + 0.1 * s], [bx + 0.085 * s, by + 0.2 * s],
    [bx + 0.06 * s, by + 0.14 * s], [bx + 0.04 * s, by + 0.04 * s]
  ]
  paint(ctx, S, run, HONEY, 1472, { line: LINE.hair, deep: false })
  // A drop letting go, once a cycle.
  if (g < 0.8) {
    ctx.save()
    ctx.globalAlpha = Math.min(1, (0.8 - g) * 4)
    const drop = egg(bx - 0.06 * s, by + 0.28 * s + g * g * 0.24 * s, 0.022 * s, 0.03 * s, 0.5, 1474, 0.05)
    paint(ctx, S, drop, HONEY, 1475, { line: LINE.hair, deep: false, lit: false })
    ctx.restore()
  }

  // ── Front legs, wrapped round the bomb ──
  for (const side of [-1, 1] as const) {
    const hip: Pt = [cx + side * 0.12 * s, cy + 0.42 * s]
    const knee: Pt = [bx + side * 0.2 * s, by - 0.02 * s]
    const hand: Pt = [bx + side * 0.1 * s, by + 0.12 * s]
    bugLeg(ctx, [hip, knee, hand], 0.044 * s, 0.03 * s, BLACK.base, 1480 + side)
  }

  // ── Head: small and dark on the front of the ball ──
  const hx = cx - 0.01 * s
  const hy = cy - 0.14 * s
  // Antennae, elbowed, knobbed.
  for (const [side, sd] of [[-1, 1490], [1, 1494]] as const) {
    const base: Pt = [hx + side * 0.07 * s, hy - 0.15 * s]
    const elbow: Pt = [hx + side * 0.12 * s, hy - 0.31 * s]
    const tip: Pt = [hx + side * (0.24 + (side > 0 ? 0.03 : 0)) * s, hy - (0.37 - (side > 0 ? 0.05 : 0)) * s]
    stroke(ctx, [base, elbow, tip], 0.034 * s, 0.024 * s, INK, sd)
    fillShape(ctx, blob(tip[0], tip[1], 0.03 * s, 0.028 * s, sd + 1, 0.15), INK)
  }
  const head = blob(hx, hy, 0.25 * s, 0.2 * s, 1500, 0.05, 7, 96)
  paint(ctx, S, head, BLACK, 1501, { line: LINE.major, breakUp: 0.2 })
  // Cheeks: it is working very hard, and it is pleased with itself.
  ctx.save()
  ctx.globalAlpha = 0.5
  fillShape(ctx, blob(hx - 0.17 * s, hy + 0.08 * s, 0.05 * s, 0.03 * s, 1502, 0.2), '#ff7a8a')
  fillShape(ctx, blob(hx + 0.17 * s, hy + 0.085 * s, 0.045 * s, 0.028 * s, 1503, 0.2), '#ff7a8a')
  ctx.restore()
  const bl = blink(t, 900)
  eye(ctx, hx - 0.095 * s, hy - 0.02 * s, 0.085 * s, {
    iris: '#3b2416', pupil: 0.62, lid: bl, brow: 0.35, seed: 1504
  })
  eye(ctx, hx + 0.1 * s, hy - 0.01 * s, 0.075 * s, {
    iris: '#3b2416', pupil: 0.62, lid: Math.max(0.12, bl), brow: -0.25, seed: 1508
  })
  // A grin, all mischief.
  stroke(ctx, [
    [hx - 0.07 * s, hy + 0.1 * s], [hx - 0.01 * s, hy + 0.135 * s], [hx + 0.07 * s, hy + 0.095 * s]
  ], 0.016 * s, 0.02 * s, '#f5ecd6', 1512)
  stroke(ctx, [
    [hx - 0.075 * s, hy + 0.095 * s], [hx - 0.01 * s, hy + 0.14 * s], [hx + 0.075 * s, hy + 0.09 * s]
  ], 0.008 * s, 0.012 * s, 'rgba(20,10,10,0.4)', 1513)
}

// ─── 11 · Firefly (dustmoth) ────────────────────────────────────────────────

const FIRE_WING: Pt[] = [
  [0.0, -0.04], [0.18, -0.14], [0.44, -0.18], [0.64, -0.12], [0.7, -0.02],
  [0.62, 0.08], [0.4, 0.13], [0.16, 0.1], [0.03, 0.04]
]
const FIRE_VEINS: Pt[][] = [
  [[0.02, -0.02], [0.36, -0.12], [0.62, -0.08]],
  [[0.03, 0.01], [0.38, 0.02], [0.62, 0.04]]
]
const ELYTRON: Pt[] = [
  [0.0, -0.06], [0.14, -0.11], [0.34, -0.11], [0.5, -0.06], [0.55, 0.01],
  [0.48, 0.07], [0.28, 0.1], [0.08, 0.07]
]

/** Its contact shadow — baked into the frames, and laid under a painted strip. */
export const FIREFLY_SHADOW: ShadowSpec = { w: 0.24, y: 1.02, a: 0.12 }

export const drawFirefly = (ctx: CanvasRenderingContext2D, S: number, t: number): void => {
  const g = gait(t, 1500)
  const beat = Math.sin(g * TAU * 12)
  const bob = Math.cos((g - 0.14) * TAU) * 0.05 * S
  // The lantern breathes once a cycle.
  const pulse = 0.72 + 0.28 * Math.sin((g - 0.1) * TAU)
  // A slim beetle has little mass of its own, so it is drawn well up from the
  // unit grid — the late, tanky flier has to look it.
  const s = S * 1.3

  const SHELL = tones('#3d3447', 1.1)
  const MARGIN = '#ffd85c'
  const HOOD = tones('#f26c52', 1.05)
  const BODY = tones('#40333c', 1.05)
  const LAMP = tones('#eaff8a', 0.8)
  const LEG = '#2e2530'

  drawShadowSpec(ctx, S, FIREFLY_SHADOW)

  const cx = swing(g - 0.2, 0.015) * S
  const cy = -0.05 * s + bob
  const P = (x: number, y: number): Pt => [cx + x * s, cy + y * s]

  // ── The lantern's light, behind everything ──
  const [lx, ly] = P(0.01, 0.46)
  // Radius kept inside the frame box: a glow clipped by the bake's bottom edge
  // leaves a faint straight line under every firefly.
  glow(ctx, lx, ly, 0.5 * s, SPORE_LIGHT, 0.55 + 0.45 * pulse)

  // ── Hind wings: smoky, the ones doing the work ──
  for (const side of [-1, 1] as const) {
    const [sx, sy] = P(side * 0.1, -0.01)
    const amp = side === 1 ? 0.46 : 0.42
    glassWing(ctx, S, poser(s, sx, sy, -0.22 - beat * amp, side), FIRE_WING, [], SMOKE_GLASS, 1100 + side, 0.3)
    glassWing(ctx, S, poser(s, sx, sy, -0.22 + beat * amp, side), FIRE_WING, FIRE_VEINS, SMOKE_GLASS, 1104 + side)
  }

  // ── Elytra: hard wing-cases held up in a V, yellow-rimmed ──
  for (const side of [-1, 1] as const) {
    const [sx, sy] = P(side * 0.07, -0.05)
    const pose = poser(s, sx, sy, -0.78 + beat * 0.08, side)
    const e = pose(ELYTRON)
    paint(ctx, S, e, SHELL, 1110 + side, { line: LINE.mid, breakUp: 0.2, amp: 0.08 })
    ctx.save()
    ctx.beginPath(); trace(ctx, e); ctx.clip()
    fillShape(ctx, pose([[0.0, -0.2], [0.7, -0.2], [0.6, -0.08], [0.3, -0.075], [0.0, -0.035]]), MARGIN)
    stroke(ctx, pose([[0.08, 0.02], [0.3, 0.03], [0.48, 0.0]]), 0.014 * s, 0.006 * s, 'rgba(255,255,255,0.35)', 1114 + side)
    ctx.restore()
  }

  // ── Legs: dangling at the back ──
  const drag = (Math.cos((g - 0.39) * TAU) - Math.cos((g - 0.14) * TAU)) * 0.05 * S
  for (const side of [-1, 1] as const) {
    for (const [hx0, hy0, kx, ky, fx, fy, sd] of [
      [0.06, 0.1, 0.22, 0.2, 0.26, 0.38, 1120],
      [0.07, 0.14, 0.18, 0.34, 0.16, 0.54, 1124]
    ] as const) {
      const sw = swing(g - 0.3, 0.02) * S
      bugLeg(ctx, [P(side * hx0, hy0), [P(side * kx, ky)[0] + sw * 0.5, P(0, ky)[1] + drag * 0.5],
        [P(side * fx, fy)[0] + sw, P(0, fy)[1] + drag]], 0.03 * s, 0.018 * s, LEG, sd + side)
    }
  }

  // ── Abdomen: two dark segments, then the lamp ──
  for (const [y, rx, ry, sd] of [[0.12, 0.12, 0.08, 1130], [0.22, 0.135, 0.08, 1132]] as const) {
    const seg = blob(cx, cy + y * s, rx * s, ry * s, sd, 0.05)
    paint(ctx, S, seg, BODY, sd + 1, { line: LINE.mid, breakUp: 0.25, deep: false })
  }
  const lamp = egg(lx, ly, 0.17 * s, 0.2 * s, 1.15, 1134, 0.04)
  cel(ctx, lamp, LAMP, {
    shade: terminator(lamp, SHADOW_DIR, 0.25, 0.12, 1135),
    lit: terminator(lamp, SHADOW_DIR + Math.PI, 0.35, 0.12, 1136)
  }, { hatch: false })
  ctx.save()
  ctx.beginPath(); trace(ctx, lamp); ctx.clip()
  for (const [dy, sd] of [[-0.06, 1137], [0.06, 1138]] as const) {
    stroke(ctx, [P(-0.2, 0.46 + dy + 0.03), P(0.01, 0.46 + dy + 0.06), P(0.22, 0.46 + dy + 0.03)],
      0.012 * s, 0.012 * s, 'rgba(120,150,20,0.35)', sd)
  }
  ctx.restore()
  // The hot core, over the paint: this is what makes it read as LIT, not yellow.
  glow(ctx, lx, ly + 0.02 * s, 0.2 * s, SPORE_LIGHT, 0.5 + 0.5 * pulse)
  ink(ctx, lamp, { width: LINE.mid * S, color: 'rgba(59,42,33,0.85)', seed: 1139, breakUp: 0.35 })

  // ── Thorax ──
  const thorax = blob(cx, cy + 0.03 * s, 0.12 * s, 0.1 * s, 1140, 0.05)
  paint(ctx, S, thorax, BODY, 1141, { line: LINE.mid, breakUp: 0.25, deep: false })

  // ── The ember, held out on the leading side (+x), where it will be dropped ──
  const [ex, ey] = P(0.26, 0.3)
  glow(ctx, ex, ey, 0.3 * s, EMBER_LIGHT, 0.85)
  const ember = rough([
    [ex - 0.07 * s, ey - 0.03 * s], [ex - 0.02 * s, ey - 0.075 * s], [ex + 0.06 * s, ey - 0.055 * s],
    [ex + 0.08 * s, ey + 0.02 * s], [ex + 0.03 * s, ey + 0.07 * s], [ex - 0.05 * s, ey + 0.06 * s]
  ], 0.006 * s, 1150)
  paint(ctx, S, ember, tones('#ff6d1f', 0.9), 1151, { line: LINE.fine, hatch: false, deep: false })
  fillShape(ctx, blob(ex + 0.005 * s, ey - 0.005 * s, 0.04 * s, 0.035 * s, 1152, 0.2), '#ffd46a')
  stroke(ctx, [[ex - 0.05 * s, ey + 0.02 * s], [ex - 0.01 * s, ey + 0.01 * s], [ex + 0.02 * s, ey + 0.05 * s]],
    0.01 * s, 0.006 * s, 'rgba(110,30,10,0.7)', 1153)
  // Sparks lifting off it, twice a cycle.
  for (let i = 0; i < 3; i++) {
    const ph = (g * 2 + i / 3) % 1
    const sx = ex + (noise2(i * 3.1, 1, 1154) - 0.5) * 0.12 * s + Math.sin(ph * 6 + i) * 0.02 * s
    const sy = ey - 0.08 * s - ph * 0.26 * s
    ctx.save()
    ctx.globalAlpha = (1 - ph) * 0.9
    fillShape(ctx, blob(sx, sy, 0.014 * s, 0.014 * s, 1155 + i, 0.2), '#ffcf5a')
    ctx.restore()
  }
  // Front legs round it.
  for (const [side, sd] of [[-1, 1160], [1, 1162]] as const) {
    const hip = P(side * 0.05, 0.05)
    const knee = P(side > 0 ? 0.2 : -0.02, side > 0 ? 0.14 : 0.24)
    const hand: Pt = [ex + (side > 0 ? 0.06 : -0.06) * s, ey + (side > 0 ? -0.02 : 0.03) * s]
    bugLeg(ctx, [hip, knee, hand], 0.03 * s, 0.02 * s, LEG, sd)
  }

  // ── Head under its hood ──
  const [hx, hy] = P(0, -0.15)
  const head = blob(hx, hy, 0.16 * s, 0.145 * s, 1170, 0.05)
  paint(ctx, S, head, BODY, 1171, { line: LINE.mid, breakUp: 0.22 })
  // Antennae, from under the hood's rim.
  for (const [side, sd, bend] of [[-1, 1172, 0.04], [1, 1176, -0.02]] as const) {
    const base = P(side * 0.06, -0.22)
    const mid = P(side * 0.15, -0.36 + bend)
    const tip = P(side * 0.27 + swing(g - 0.3, 0.02), -0.44 + bend * 2)
    stroke(ctx, [base, mid, tip], 0.026 * s, 0.01 * s, INK, sd)
  }
  // The pronotum: a salmon hood with a black spot and a yellow rim. It is the
  // firefly's own marking, and it reads as a little helmet.
  const hood = rough([
    [hx - 0.24 * s, hy - 0.02 * s], [hx - 0.23 * s, hy - 0.16 * s], [hx - 0.1 * s, hy - 0.27 * s],
    [hx + 0.08 * s, hy - 0.28 * s], [hx + 0.23 * s, hy - 0.17 * s], [hx + 0.25 * s, hy - 0.02 * s],
    [hx + 0.12 * s, hy - 0.08 * s], [hx - 0.12 * s, hy - 0.08 * s]
  ], 0.008 * s, 1180)
  paint(ctx, S, hood, HOOD, 1181, { line: LINE.mid, breakUp: 0.2 })
  ctx.save()
  ctx.beginPath(); trace(ctx, hood); ctx.clip()
  fillShape(ctx, blob(hx + 0.01 * s, hy - 0.18 * s, 0.06 * s, 0.05 * s, 1182, 0.15), '#2a2026')
  ctx.restore()
  stroke(ctx, [
    [hx - 0.23 * s, hy - 0.04 * s], [hx - 0.12 * s, hy - 0.1 * s], [hx + 0.12 * s, hy - 0.1 * s], [hx + 0.24 * s, hy - 0.04 * s]
  ], 0.022 * s, 0.022 * s, MARGIN, 1183)

  const bl = blink(t, 600)
  // Big, dark, glossy, and sleepy-sly: it has done this before.
  eye(ctx, hx - 0.07 * s, hy + 0.01 * s, 0.072 * s, {
    iris: '#2a1c2c', pupil: 0.7, lid: Math.max(0.3, bl), brow: 0.25, seed: 1184
  })
  eye(ctx, hx + 0.075 * s, hy + 0.015 * s, 0.064 * s, {
    iris: '#2a1c2c', pupil: 0.7, lid: Math.max(0.36, bl), brow: -0.15, seed: 1188
  })
  stroke(ctx, [[hx - 0.04 * s, hy + 0.095 * s], [hx + 0.02 * s, hy + 0.11 * s], [hx + 0.06 * s, hy + 0.09 * s]],
    0.012 * s, 0.016 * s, INK, 1192)

  // ── Motes: little green sparks drifting off the lamp ──
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 5; i++) {
    const ph = (g + i * 0.2) % 1
    const mx = lx + (noise2(i * 2.7, 2, 1195) - 0.5) * 0.7 * s + Math.sin(ph * 5 + i) * 0.03 * s
    const my = ly + 0.12 * s + ph * 0.3 * s
    ctx.globalAlpha = (1 - ph) * 0.8
    ctx.fillStyle = '#d8ff7a'
    ctx.beginPath(); ctx.arc(mx, my, (0.01 + noise2(i, 7, 1196) * 0.01) * s, 0, TAU); ctx.fill()
  }
  ctx.restore()
}

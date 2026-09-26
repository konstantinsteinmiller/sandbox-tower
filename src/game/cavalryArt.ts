import {
  rough, hard, fillShape, ink, stroke, tones, trace, blob,
  type Pt, type CelTones
} from '@/game/inkArt'
import { INK, LINE, paint, groundShadow, limb, gait } from '@/game/monsterKit'
import type { Palette } from '@/game/art'

/**
 * ─── Toy Knights (cavalry) ──────────────────────────────────────────────────
 *
 * The player's own unit, and the only friendly body on the field: a blue
 * plastic toy knight on a white plastic toy horse, straight out of the kid's
 * toy box. It is what they bought with the gold they were saving, at the moment
 * a contraption parked out of reach — the charge arriving should feel like
 * relief, and it should look like the kid's favourite toy joining in.
 *
 * Built on the same kit as the bug cast — one key light, the kit's line
 * weights — but lit as MOULDED PLASTIC rather than as a living thing:
 *
 *   * **Flat colour, one shade cut and a gloss.** No deep core shadow and no
 *     pen hatching; instead a hard white sheen along the lit edge of each
 *     part, which is what makes a surface read as shiny toy plastic.
 *   * **Seam lines.** The fine line where the two halves of the mould met,
 *     running along the horse's crest and back and down the knight's helm.
 *     It is the detail that says "toy" once the unit is big enough to see it.
 *   * **Painted details.** A dot-and-glint painted eye, gold-painted trim,
 *     painted-on reins — the way a toy is decorated, not the way a horse is.
 *   * **The livery is the loudest thing.** Toy-blue caparison, knight, shield
 *     and plume-socket, gold trim and a gold pennant. The warm bugs and their
 *     warm contraptions never use this blue, so from across the sandbox at any
 *     zoom the blue shape says "mine" before any detail resolves.
 *
 * The horse itself is still built anatomically, and still gallops for real —
 * point of shoulder, withers, loin, croup, gaskin in the silhouette, and a
 * four-beat transverse gallop with a suspension phase — because a toy that
 * moves like a horse is the charm; a toy that slides is a glitch.
 *
 * Convention, shared with the caller: origin at the horse's centre of mass, `S`
 * is the unit scale, hooves land on the ground line at `y = +0.5`, and the
 * whole rider is authored FACING +X.
 */

/** Where the hooves land, in units of S. Ground units sit at `y = scale / 2`. */
const GROUND = 0.5

/**
 * One gallop, ms.
 *
 * Exported because a painted strip has to be cut across the SAME cycle the
 * drawing runs on. A second copy of the number in the art bench is a second
 * copy that goes stale — which shows up as a rider whose painted hooves beat
 * at a different rate from the one it was drawn at.
 */
export const CAVALRY_CYCLE_MS = 500

/**
 * Where this rider is in its gallop, 0..1.
 *
 * The renderer indexes a painted strip with this and `drawCavalry` steps its
 * legs with the same call, so the two cannot drift apart: a painted hoof
 * lands on the beat the drawn one did, at the same per-rider phase offset
 * that keeps a squad of three out of lockstep.
 */
export const cavalryCycle01 = (t: number, phase: number): number =>
  gait(t, CAVALRY_CYCLE_MS, phase)

/** White toy-horse plastic. A touch warm, so it is not the sky. */
const HORSE = tones('#f6f1e6', 0.9)
/** The far pair of legs, a full step down. Depth by value, never by outline. */
const HORSE_BACK = tones('#d8cfbf', 0.85)
/** Moulded mane and tail, painted gold like the trim. */
const MANE = tones('#f2b52c', 1.0)
/** Painted hooves. */
const HOOF = tones('#7d8490', 1.0)
/** Painted reins and saddle. */
const LEATHER = tones('#9a6238', 1.0)
/** The lance's white plastic, and its silver-painted head. */
const LANCE_WHITE = '#fbf8f1'
const SILVER = tones('#cfd6de', 1.2)
const GLOSS = 'rgba(255,255,255,0.78)'
const SEAM = 'rgba(70,60,70,0.35)'

/**
 * One moulded plastic part: flat colour, a single shade cut, a clean outline,
 * and a hard gloss along its first edge.
 *
 * The contour goes through `hard` first: a toy is moulded with crisp edges,
 * and `trace` would otherwise round a helm into a pebble.
 */
const plastic = (
  ctx: CanvasRenderingContext2D, S: number, authored: Pt[], t: CelTones, seed: number,
  line: number = LINE.mid
): void => {
  const shape = rough(hard(authored), S * 0.003, seed)
  paint(ctx, S, shape, t, seed, { line, amp: 0.04, deep: false, hatch: false, breakUp: 0.2 })
  const a = authored[0]!
  const b = authored[1] ?? a
  ctx.save()
  ctx.beginPath(); trace(ctx, shape); ctx.clip()
  stroke(ctx, [
    [a[0] + S * 0.01, a[1] + S * 0.012],
    [b[0] + S * 0.01, b[1] + S * 0.012]
  ], S * 0.016, S * 0.008, GLOSS, seed + 1)
  ctx.restore()
}

/**
 * Where one hoof is in the cycle.
 *
 * Two distinct halves, because that is what a leg does: STANCE, where the hoof
 * is planted and travels backwards under the body carrying weight, and SWING,
 * where it leaves the ground and is thrown forward. A hoof moved on a sine wave
 * skates — it is never actually still against the earth.
 */
const hoofPath = (k: number, reach: number, lift: number): Pt => {
  const STANCE = 0.42
  if (k < STANCE) {
    const u = k / STANCE
    return [(0.5 - u) * reach, 0]
  }
  const u = (k - STANCE) / (1 - STANCE)
  return [(-0.5 + u) * reach, -Math.sin(u * Math.PI) * lift]
}

/**
 * One leg, solved to its hoof, ending in a painted hoof.
 *
 * The bones are sized only a few percent longer than half the hip-to-hoof span,
 * per the note on `limb`: slack bones throw the joint sideways and the leg
 * reads as broken rather than as relaxed.
 */
const leg = (
  ctx: CanvasRenderingContext2D, S: number,
  hip: Pt, hoof: Pt, bend: number, w: number,
  t: CelTones, seed: number
): void => {
  const d = Math.hypot(hoof[0] - hip[0], hoof[1] - hip[1])
  const bone = Math.sqrt((0.08 * S) ** 2 + (d / 2) ** 2)
  limb(ctx, hip, hoof, bone, bone, bend, t, seed,
    { width: w * S, taper: 0.5, joint: 0.4, outline: S * 0.014 })

  paint(ctx, S, rough([
    [hoof[0] - 0.038 * S, hoof[1] - 0.045 * S],
    [hoof[0] + 0.042 * S, hoof[1] - 0.05 * S],
    [hoof[0] + 0.05 * S, hoof[1] + 0.028 * S],
    [hoof[0] - 0.044 * S, hoof[1] + 0.028 * S]
  ], 0.004 * S, seed + 40), HOOF, seed + 41, { line: LINE.hair, amp: 0.05, deep: false, hatch: false })
}

/**
 * The sand a gallop kicks up, thickest at push-off.
 *
 * Its own function because it is the rider's LIVE layer, the way a deck gun is
 * a ship's: four pale puffs trailing up to a body-length behind the horse, at
 * a quarter alpha. That is exactly what a painted strip must not contain —
 * over the magenta it keys to a pink smudge rather than to nothing, and it is
 * transient in a way a frame of a gait is not. So it is left out of the
 * reference and drawn under the painted rider instead.
 */
export const drawCavalryDust = (
  ctx: CanvasRenderingContext2D, S: number, t: number, phase: number
): void => {
  const g = gait(t, CAVALRY_CYCLE_MS, phase)
  const kick = Math.max(0, -Math.sin(g * Math.PI * 2))
  ctx.save()
  ctx.globalAlpha = 0.34
  for (let i = 0; i < 4; i++) {
    const d = 0.4 + i * 0.24
    const r = (0.16 - i * 0.028) * (0.55 + 0.55 * kick) * S
    fillShape(ctx, blob(-d * S, GROUND * S - r * 0.35, r, r * 0.6, 300 + i, 0.24), '#f1d9a2')
  }
  ctx.restore()
}

/**
 * The rider's contact shadow at this moment of the gallop — narrower and
 * fainter while every hoof is off the ground.
 *
 * Its own function because a PAINTED gallop strip replaces the whole rider and
 * carries no shadow (a soft shadow cannot be painted over a chroma key), so
 * the battlefield lays this one under it, on the same beat.
 */
export const drawCavalryShadow = (
  ctx: CanvasRenderingContext2D, S: number, t: number, phase: number
): void => {
  const g = gait(t, CAVALRY_CYCLE_MS, phase)
  const airborne = Math.max(0, Math.sin(g * Math.PI * 2 + 0.6))
  groundShadow(ctx, S, 0.5 - airborne * 0.13, GROUND + 0.04, 0.26 - airborne * 0.1)
}

/**
 * Draw one rider.
 *
 * `phase` is the individual's gait offset so a squad of three never moves in
 * lockstep; `striking` couches the lance and drives the thrust.
 */
export const drawCavalry = (
  ctx: CanvasRenderingContext2D, S: number, p: Palette,
  opts: { phase: number; striking: boolean; t: number; dust?: boolean }
): void => {
  const { phase, striking, t } = opts

  // Livery from the ally palette, so a theme change carries the whole unit.
  // The knight is a step deeper than the caparison so the two blues separate.
  const CLOTH = tones(p.light, 0.95)
  const KNIGHT = tones(p.mid, 1.0)
  const TRIM = p.accent
  const GOLD = tones(p.accent, 0.9)

  // ── The gallop ──
  const g = gait(t, CAVALRY_CYCLE_MS, phase)
  // Suspension: every hoof clear of the ground, body at its highest.
  const airborne = Math.max(0, Math.sin(g * Math.PI * 2 + 0.6))
  const bob = -airborne * 0.07 * S
  // The spine flexes — the horse gathers under itself, then extends.
  const gather = Math.cos(g * Math.PI * 2) * 0.028 * S

  drawCavalryShadow(ctx, S, t, phase)

  if (opts.dust !== false) drawCavalryDust(ctx, S, t, phase)

  ctx.save()
  ctx.translate(0, bob)

  /** Transverse gallop: near hind, far hind, far fore, near fore. */
  const hoofAt = (offset: number, atX: number, reach: number, lift: number): Pt => {
    const st = hoofPath(gait(t, CAVALRY_CYCLE_MS, phase + offset), reach * S, lift * S)
    return [atX * S + st[0], GROUND * S + st[1]]
  }

  // ── Far pair, a full tone down ──
  leg(ctx, S, [-0.24 * S, 0.06 * S], hoofAt(0.1, -0.3, 0.34, 0.16), 1, 0.1, HORSE_BACK, 310)
  leg(ctx, S, [0.28 * S, 0.04 * S], hoofAt(0.55, 0.3, 0.32, 0.15), 1, 0.09, HORSE_BACK, 316)

  // ── Tail: moulded gold locks, streaming off the croup ──
  const tail = Math.sin(t / 280 + phase * 6) * 0.05 * S
  for (let i = 0; i < 3; i++) {
    const pts: Pt[] = [
      [-0.4 * S, -0.08 * S],
      [-0.56 * S, 0.0 * S + tail * 0.5 + i * 0.03 * S],
      [-0.66 * S, 0.14 * S + tail + i * 0.04 * S]
    ]
    stroke(ctx, pts, 0.075 * S, 0.02 * S, INK, 340 + i)
    stroke(ctx, pts, 0.055 * S, 0.012 * S, i === 1 ? MANE.base : MANE.shade, 344 + i)
  }

  // ── Barrel ──
  //
  // Every vertex here is a landmark: point of shoulder, withers, back, loin,
  // croup, point of buttock, gaskin, belly, girth. Get those and the toy is a
  // horse in silhouette; miss them and no amount of shading rescues it.
  const barrel = rough([
    [0.38 * S, -0.08 * S],   // point of shoulder
    [0.30 * S, -0.26 * S],   // withers
    [0.08 * S, -0.28 * S],   // back
    [-0.16 * S, -0.24 * S + gather], // loin
    [-0.34 * S, -0.14 * S],  // croup
    [-0.42 * S, 0.04 * S],   // point of buttock
    [-0.3 * S, 0.2 * S],     // gaskin
    [-0.08 * S, 0.24 * S],   // flank
    [0.16 * S, 0.22 * S],    // belly
    [0.36 * S, 0.1 * S]      // girth / elbow
  ], 0.01 * S, 320)
  paint(ctx, S, barrel, HORSE, 321, { line: LINE.major, breakUp: 0.2, deep: false, hatch: false, amp: 0.08 })
  // Plastic gloss along the back, and the mould seam running under it.
  stroke(ctx, [[-0.3 * S, -0.16 * S], [-0.12 * S, -0.22 * S + gather], [0.1 * S, -0.24 * S]],
    0.022 * S, 0.012 * S, GLOSS, 322)
  stroke(ctx, [[-0.36 * S, -0.08 * S], [-0.14 * S, -0.18 * S + gather], [0.2 * S, -0.2 * S]],
    0.006 * S, 0.006 * S, SEAM, 323)

  // ── Caparison ──
  //
  // The livery skirt, with a scalloped gold hem that flies against the stride.
  // This is the shape that has to survive being twenty pixels tall.
  const fly = Math.sin(g * Math.PI * 2 + 1.2) * 0.045 * S
  const hem: Pt[] = []
  for (let i = 0; i <= 5; i++) {
    const u = i / 5
    hem.push([(0.28 - u * 0.66) * S, (0.2 + Math.sin(u * Math.PI) * 0.11) * S - fly * u])
  }
  const skirt = rough([
    [0.3 * S, -0.06 * S],
    [-0.02 * S, -0.16 * S],
    [-0.36 * S, -0.06 * S],
    ...hem.slice().reverse()
  ], 0.012 * S, 326)
  paint(ctx, S, skirt, CLOTH, 327, { line: LINE.mid, breakUp: 0.25, amp: 0.12, deep: false, hatch: false })
  stroke(ctx, hem, 0.034 * S, 0.028 * S, TRIM, 328)
  // Painted-on device down the cloth: three gold stars, big enough to read as
  // decoration without becoming noise.
  for (let i = 0; i < 3; i++) {
    const cx = (0.14 - i * 0.18) * S
    const cy = 0.06 * S
    const star: Pt[] = []
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2 - Math.PI / 2
      const r = (k % 2 === 0 ? 0.05 : 0.022) * S
      star.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
    }
    fillShape(ctx, hard(star, 0.1), TRIM)
  }

  // ── Near hind leg, over the cloth ──
  leg(ctx, S, [-0.24 * S, 0.06 * S], hoofAt(0, -0.24, 0.36, 0.18), 1, 0.115, HORSE, 330)

  // ── Neck: arched, crest up. A straight neck is a cart horse ──
  const neck = rough([
    [0.24 * S, -0.24 * S],
    [0.44 * S, -0.48 * S],
    [0.62 * S, -0.6 * S],
    [0.7 * S, -0.48 * S],
    [0.52 * S, -0.3 * S],
    [0.4 * S, -0.06 * S]
  ], 0.01 * S, 344)
  paint(ctx, S, neck, HORSE, 345, { line: LINE.major, breakUp: 0.22, deep: false, hatch: false, amp: 0.08 })
  stroke(ctx, [[0.46 * S, -0.34 * S], [0.62 * S, -0.5 * S]], 0.02 * S, 0.01 * S, GLOSS, 346)

  // Mane: moulded gold locks along the crest, a fringe of chunky plastic.
  for (let i = 0; i < 5; i++) {
    const u = i / 4
    const bx = (0.3 + u * 0.32) * S
    const by = (-0.3 - u * 0.28) * S
    const pts: Pt[] = [
      [bx, by],
      [bx - 0.09 * S, by + 0.03 * S + Math.sin(t / 220 + i + phase * 4) * 0.016 * S],
      [bx - 0.15 * S, by + 0.12 * S]
    ]
    stroke(ctx, pts, 0.055 * S, 0.018 * S, INK, 350 + i)
    stroke(ctx, pts, 0.04 * S, 0.01 * S, i % 2 ? MANE.base : MANE.shade, 356 + i)
  }

  // ── Head, in a toy chanfron ──
  //
  // Short and deep, with a rounded muzzle — a toy horse's friendly face, not a
  // war-horse's long skull.
  const head = rough([
    [0.6 * S, -0.62 * S], [0.8 * S, -0.58 * S],
    [0.89 * S, -0.46 * S], [0.85 * S, -0.35 * S],
    [0.68 * S, -0.34 * S], [0.58 * S, -0.44 * S]
  ], 0.008 * S, 356)
  paint(ctx, S, head, HORSE, 357, { line: LINE.mid, breakUp: 0.2, deep: false, hatch: false, amp: 0.08 })
  // Face plate in the livery, with a gold ridge.
  plastic(ctx, S, [
    [0.64 * S, -0.62 * S], [0.8 * S, -0.58 * S],
    [0.84 * S, -0.5 * S], [0.72 * S, -0.5 * S]
  ], KNIGHT, 359, LINE.fine)
  stroke(ctx, [[0.66 * S, -0.605 * S], [0.82 * S, -0.54 * S]],
    0.016 * S, 0.01 * S, TRIM, 360)
  // Muzzle and nostril.
  fillShape(ctx, blob(0.845 * S, -0.405 * S, 0.018 * S, 0.012 * S, 361, 0.1), '#b9a894')
  // A painted toy eye: a dark dot with a hard white glint.
  fillShape(ctx, blob(0.71 * S, -0.47 * S, 0.028 * S, 0.03 * S, 362, 0.05), '#1d1a22')
  fillShape(ctx, blob(0.7 * S, -0.482 * S, 0.01 * S, 0.01 * S, 363, 0.05), '#ffffff')
  // Ears, one flicking back to listen.
  for (const [ex, ey, k] of [[0.6, -0.66, 0], [0.65, -0.64, 1]] as const) {
    const pts: Pt[] = [
      [ex * S, ey * S],
      [(ex - 0.02) * S, (ey - 0.1) * S + Math.sin(t / 620 + k * 2) * 0.012 * S]
    ]
    stroke(ctx, pts, 0.056 * S, 0.012 * S, INK, 363 + k)
    stroke(ctx, pts, 0.042 * S, 0.006 * S, k ? HORSE.shade : HORSE.base, 365 + k)
  }

  // Painted bridle, then the reins back to the hand.
  stroke(ctx, [[0.66 * S, -0.5 * S], [0.8 * S, -0.42 * S]], 0.016 * S, 0.016 * S, LEATHER.base, 367)
  stroke(ctx, [
    [0.8 * S, -0.42 * S], [0.5 * S, -0.34 * S], [0.24 * S, -0.36 * S]
  ], 0.014 * S, 0.014 * S, LEATHER.shade, 368)

  // ── Peytral: the chest plate, in the livery ──
  plastic(ctx, S, [
    [0.3 * S, -0.14 * S], [0.44 * S, -0.04 * S],
    [0.42 * S, 0.14 * S], [0.24 * S, 0.06 * S]
  ], KNIGHT, 369)
  fillShape(ctx, blob(0.36 * S, 0.02 * S, 0.026 * S, 0.026 * S, 370, 0.08), TRIM)

  // ── Near fore leg, in front of everything on the horse ──
  leg(ctx, S, [0.3 * S, 0.02 * S], hoofAt(0.48, 0.34, 0.34, 0.17), 1, 0.105, HORSE, 336)

  // ── Saddle ──
  const seatY = -0.34 * S + gather * 0.5
  paint(ctx, S, rough([
    [-0.14 * S, seatY + 0.02 * S], [-0.08 * S, seatY - 0.06 * S],
    [0.16 * S, seatY - 0.02 * S], [0.2 * S, seatY + 0.12 * S],
    [-0.12 * S, seatY + 0.16 * S]
  ], 0.006 * S, 371), LEATHER, 372, { line: LINE.fine, amp: 0.08, deep: false, hatch: false })

  // ── The knight: one moulded blue figure ──
  //
  // Far arm first, a tone down, so the near side reads in front.
  stroke(ctx, [[0.02 * S, seatY + 0.02 * S], [0.0 * S, seatY + 0.24 * S]],
    0.055 * S, 0.045 * S, KNIGHT.shade, 373)

  // Near leg: thigh, then the lower leg in the gold stirrup.
  plastic(ctx, S, [
    [-0.06 * S, seatY + 0.02 * S], [0.09 * S, seatY + 0.04 * S],
    [0.07 * S, seatY + 0.19 * S], [-0.08 * S, seatY + 0.17 * S]
  ], KNIGHT, 374)
  plastic(ctx, S, [
    [-0.07 * S, seatY + 0.16 * S], [0.05 * S, seatY + 0.18 * S],
    [0.02 * S, seatY + 0.33 * S], [-0.07 * S, seatY + 0.32 * S]
  ], KNIGHT, 375)
  stroke(ctx, [
    [-0.09 * S, seatY + 0.31 * S], [-0.03 * S, seatY + 0.36 * S], [0.04 * S, seatY + 0.31 * S]
  ], 0.02 * S, 0.02 * S, GOLD.base, 376)

  // Body armour, with a gold belt.
  plastic(ctx, S, [
    [-0.08 * S, seatY - 0.26 * S], [0.1 * S, seatY - 0.24 * S],
    [0.14 * S, seatY + 0.02 * S], [-0.1 * S, seatY + 0.04 * S]
  ], KNIGHT, 377)
  stroke(ctx, [[-0.09 * S, seatY - 0.02 * S], [0.13 * S, seatY - 0.04 * S]],
    0.03 * S, 0.03 * S, TRIM, 378)
  stroke(ctx, [[0.0 * S, seatY - 0.24 * S], [0.02 * S, seatY - 0.05 * S]], 0.006 * S, 0.006 * S, SEAM, 379)

  // Shoulder, then the arm with its gauntlet on the lance.
  plastic(ctx, S, [
    [-0.04 * S, seatY - 0.3 * S], [0.14 * S, seatY - 0.26 * S],
    [0.16 * S, seatY - 0.12 * S], [-0.06 * S, seatY - 0.16 * S]
  ], KNIGHT, 381)
  stroke(ctx, [[0.06 * S, seatY - 0.2 * S], [0.14 * S, seatY - 0.06 * S]],
    0.055 * S, 0.046 * S, KNIGHT.shade, 382)
  plastic(ctx, S, [
    [0.1 * S, seatY - 0.1 * S], [0.19 * S, seatY - 0.08 * S],
    [0.18 * S, seatY - 0.0 * S], [0.09 * S, seatY - 0.02 * S]
  ], GOLD, 383, LINE.fine)

  // Bucket helm: a moulded pot with a dark visor slit, a gold crown band,
  // and the mould seam straight down its face.
  const helmY = seatY - 0.32 * S
  plastic(ctx, S, [
    [-0.04 * S, helmY - 0.12 * S], [0.1 * S, helmY - 0.11 * S],
    [0.13 * S, helmY + 0.02 * S], [0.1 * S, helmY + 0.08 * S],
    [-0.03 * S, helmY + 0.08 * S], [-0.06 * S, helmY - 0.02 * S]
  ], KNIGHT, 384)
  fillShape(ctx, [
    [0.0 * S, helmY - 0.035 * S], [0.13 * S, helmY - 0.025 * S],
    [0.13 * S, helmY + 0.01 * S], [0.0 * S, helmY - 0.0 * S]
  ], '#14182a')
  stroke(ctx, [[-0.045 * S, helmY - 0.085 * S], [0.11 * S, helmY - 0.075 * S]],
    0.022 * S, 0.02 * S, TRIM, 385)
  stroke(ctx, [[0.065 * S, helmY + 0.015 * S], [0.07 * S, helmY + 0.075 * S]], 0.006 * S, 0.006 * S, SEAM, 386)

  // Plume, streaming back with the charge: moulded, painted gold.
  const plume = Math.sin(t / 190 + phase * 5) * 0.035 * S
  paint(ctx, S, rough([
    [0.03 * S, helmY - 0.13 * S],
    [-0.1 * S, helmY - 0.26 * S + plume],
    [-0.28 * S, helmY - 0.2 * S + plume * 1.7],
    [-0.16 * S, helmY - 0.12 * S],
    [-0.04 * S, helmY - 0.09 * S]
  ], 0.01 * S, 387), GOLD, 388, { line: LINE.fine, amp: 0.2, deep: false, hatch: false })

  // Heater shield on the near side: blue, gold border, gold cross.
  const shieldPts: Pt[] = [
    [-0.2 * S, seatY - 0.14 * S], [-0.04 * S, seatY - 0.18 * S],
    [-0.03 * S, seatY + 0.04 * S], [-0.12 * S, seatY + 0.2 * S],
    [-0.21 * S, seatY + 0.04 * S]
  ]
  const shield = rough(hard(shieldPts), 0.004 * S, 389)
  paint(ctx, S, shield, KNIGHT, 390, { line: LINE.mid, amp: 0.04, deep: false, hatch: false })
  ctx.save()
  ctx.beginPath(); trace(ctx, shield); ctx.clip()
  stroke(ctx, [[-0.125 * S, seatY - 0.2 * S], [-0.12 * S, seatY + 0.22 * S]],
    0.04 * S, 0.04 * S, TRIM, 391)
  stroke(ctx, [[-0.24 * S, seatY - 0.04 * S], [0.0 * S, seatY - 0.06 * S]],
    0.04 * S, 0.04 * S, TRIM, 392)
  stroke(ctx, [[-0.19 * S, seatY - 0.12 * S], [-0.07 * S, seatY - 0.15 * S]],
    0.016 * S, 0.01 * S, GLOSS, 393)
  ctx.restore()
  ink(ctx, shield, { width: 0.02 * S, color: GOLD.shade, seed: 394, breakUp: 0.15 })

  // ── Lance, couched under the arm ──
  //
  // The thrust is a short forward jab on the attack beat, not a continuous
  // wave: a lance that oscillates reads as a fishing rod. Toy plastic, white
  // with blue candy-stripes, so it cannot be mistaken for a bug's stinger.
  const thrust = striking ? Math.max(0, Math.sin(t / 110)) * 0.16 * S : 0
  const buttX = -0.3 * S
  const tipX = 0.96 * S + thrust
  const lanceY = seatY - 0.06 * S
  const lance: Pt[] = [[buttX, lanceY + 0.05 * S], [tipX, lanceY - 0.06 * S]]
  stroke(ctx, lance, 0.058 * S, 0.04 * S, INK, 395)
  stroke(ctx, lance, 0.042 * S, 0.026 * S, LANCE_WHITE, 396)
  for (let i = 0; i < 6; i++) {
    const u = 0.35 + i * 0.1
    const x = buttX + (tipX - buttX) * u
    const y = lanceY + 0.05 * S - 0.11 * S * u
    stroke(ctx, [[x - 0.02 * S, y + 0.018 * S], [x + 0.02 * S, y - 0.02 * S]],
      0.024 * S, 0.02 * S, KNIGHT.base, 397 + i)
  }
  // Vamplate: the cone at the grip that protects the hand — the most
  // recognisable thing on a couched lance — painted gold.
  paint(ctx, S, rough([
    [0.1 * S + thrust, lanceY - 0.11 * S],
    [0.19 * S + thrust, lanceY - 0.02 * S],
    [0.1 * S + thrust, lanceY + 0.06 * S],
    [0.04 * S + thrust, lanceY - 0.02 * S]
  ], 0.004 * S, 403), GOLD, 404, { line: LINE.hair, amp: 0.05, deep: false, hatch: false })
  // Head, silver-painted plastic.
  const headPts: Pt[] = [
    [tipX + 0.15 * S, lanceY - 0.07 * S],
    [tipX - 0.02 * S, lanceY - 0.13 * S],
    [tipX - 0.02 * S, lanceY - 0.01 * S]
  ]
  fillShape(ctx, headPts, SILVER.base)
  ink(ctx, headPts, { width: 0.014 * S, color: INK, seed: 405, breakUp: 0.1 })
  // Gold pennant just behind the head.
  const flick = Math.sin(t / 150 + phase * 7) * 0.022 * S
  const pen: Pt[] = [
    [tipX - 0.07 * S, lanceY - 0.07 * S],
    [tipX - 0.26 * S, lanceY - 0.16 * S + flick],
    [tipX - 0.2 * S, lanceY - 0.06 * S],
    [tipX - 0.26 * S, lanceY + 0.03 * S + flick]
  ]
  fillShape(ctx, pen, TRIM)
  ink(ctx, pen, { width: 0.012 * S, color: INK, seed: 406, breakUp: 0.3 })

  ctx.restore()
}

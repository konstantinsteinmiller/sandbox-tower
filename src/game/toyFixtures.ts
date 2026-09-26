/**
 * ─── Toy fixtures (Sandbox Tower) ───────────────────────────────────────────
 *
 * The moving and standing parts bolted on top of a block — the kid's toy
 * weapons and gadgets stuck into the sandcastle. `drawFixture` in
 * `useTowerArt.ts` owns every PIVOT, aim rotation, recoil and lob angle; it
 * sets the transform up exactly as the old iron fixtures had it and then calls
 * one painter from here, which draws in that frame.
 *
 * Conventions every painter follows:
 *
 *   · Units are CELLS. Each painter scales by `s` itself, so the geometry below
 *     reads as fractions of a block, the way the old code's `s * 0.34` did.
 *   · +x is the way a gun points; canvas +y is down. A gun that flips across
 *     its own axis to keep its top face up is flipped by the caller.
 *   · Toy plastic, cel-shaded: a hard-stopped three-tone ramp (lit crown, base,
 *     shaded underside) in ONE gradient fill, a gloss streak, and the house ink
 *     line. One fill per part, no clips on the fixtures that re-bake on the
 *     clock (zapper, ice pop, toothpicks), so a bake costs what the iron one
 *     did.
 *   · Muzzles stay where the muzzle flashes expect them (`MUZZLE_RECIPES`):
 *     squirt gun 0.55, dart blaster ~0.3, mud mortar 0.45, balloon tube 0.3.
 *
 * Merged tiers: the caller already bakes a merged weapon at a bigger span and
 * washes/rims it in the tier's colour. What a tier adds HERE is the "forged
 * heavier" read for a toy — stickers from tier 2, and an extra part from
 * tier 3 (a bigger tank, a dart drum, a crown of ice) — inside the same
 * outline, so nothing grows past the box it was sized for.
 */
import { tierStyle } from '@/game/tierStyle'

const INK = '#3b2a21'

interface Ramp { lit: string; base: string; shade: string }

const TOY = {
  orange: { lit: '#ffb877', base: '#ff8a2b', shade: '#d9621b' },
  blue: { lit: '#72b4ff', base: '#2f7de1', shade: '#1d56ad' },
  yellow: { lit: '#ffe792', base: '#ffc93c', shade: '#df9b1e' },
  green: { lit: '#95e486', base: '#43b649', shade: '#2b8636' },
  pink: { lit: '#ffb6d6', base: '#ff6fae', shade: '#d6488a' },
  violet: { lit: '#9b8cff', base: '#6552d6', shade: '#3f309e' },
  kraft: { lit: '#e9c28c', base: '#cc9a5e', shade: '#9d6c3a' },
  wood: { lit: '#fbe6bd', base: '#ecc98f', shade: '#c79a5c' },
  sand: { lit: '#f6e2ae', base: '#e3c07e', shade: '#b88c4c' },
  mud: { lit: '#b9814c', base: '#8a5a2e', shade: '#5f3b1c' },
  ice: { lit: '#dcf7ff', base: '#6fd0ff', shade: '#3a97df' },
  shell: { lit: '#fff3f6', base: '#ffc6d6', shade: '#ee92b2' },
  plum: { lit: '#cf72ad', base: '#a0418a', shade: '#6d2a5d' },
  pebble: { lit: '#c9d0d6', base: '#9aa3ad', shade: '#6e7782' }
} as const satisfies Record<string, Ramp>

/** A line width in cell units that never drops under one screen pixel. */
const W = (s: number, k: number): number => Math.max(1, s * k) / s

/**
 * One fill that carries a whole cel ramp: lit crown, base, shaded underside,
 * with HARD stops so it reads as painted bands rather than as an airbrush.
 */
const cel = (
  ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number,
  r: Ramp, litTo = 0.24, shadeFrom = 0.64
): CanvasGradient => {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  g.addColorStop(0, r.lit)
  g.addColorStop(litTo, r.lit)
  g.addColorStop(litTo, r.base)
  g.addColorStop(shadeFrom, r.base)
  g.addColorStop(shadeFrom, r.shade)
  g.addColorStop(1, r.shade)
  return g
}

/** Fill the current path, then ink it. */
const paint = (
  ctx: CanvasRenderingContext2D, s: number, fill: string | CanvasGradient, k = 0.034
): void => {
  ctx.fillStyle = fill
  ctx.fill()
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.strokeStyle = INK
  ctx.lineWidth = W(s, k)
  ctx.stroke()
}

const rrect = (
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number
): void => {
  const q = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + q, y)
  ctx.arcTo(x + w, y, x + w, y + h, q)
  ctx.arcTo(x + w, y + h, x, y + h, q)
  ctx.arcTo(x, y + h, x, y, q)
  ctx.arcTo(x, y, x + w, y, q)
  ctx.closePath()
}

const disc = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void => {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
}

/** The plastic shine: a short round-capped white streak. */
const gloss = (
  ctx: CanvasRenderingContext2D, s: number,
  x0: number, y0: number, x1: number, y1: number, k = 0.03, a = 0.75
): void => {
  ctx.strokeStyle = `rgba(255,255,255,${a})`
  ctx.lineWidth = W(s, k)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1, y1)
  ctx.stroke()
}

/** An inked stroke along a path: ink first, colour inside it. */
const tube = (
  ctx: CanvasRenderingContext2D, s: number, pts: ReadonlyArray<readonly [number, number]>,
  k: number, color: string
): void => {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.strokeStyle = INK
  ctx.lineWidth = W(s, k) + W(s, 0.034) * 2
  ctx.stroke()
  ctx.strokeStyle = color
  ctx.lineWidth = W(s, k)
  ctx.stroke()
}

/** A four-point twinkle. */
const twinkle = (
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string
): void => {
  const w = r * 0.26
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.lineTo(x + w, y - w)
  ctx.lineTo(x + r, y)
  ctx.lineTo(x + w, y + w)
  ctx.lineTo(x, y + r)
  ctx.lineTo(x - w, y + w)
  ctx.lineTo(x - r, y)
  ctx.lineTo(x - w, y - w)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

const starPath = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void => {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 === 0 ? r : r * 0.46
    const px = x + Math.cos(a) * rr
    const py = y + Math.sin(a) * rr
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
  }
  ctx.closePath()
}

/**
 * A star sticker in the tier's colour: a white die-cut border, the star, and
 * a hairline of ink so it survives on any plastic under it. The first thing a
 * weld adds to a toy — "more stickers" is how a kid upgrades a blaster.
 */
const sticker = (
  ctx: CanvasRenderingContext2D, s: number, x: number, y: number, r: number, tier: number
): void => {
  starPath(ctx, x, y, r * 1.28)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.lineWidth = W(s, 0.016)
  ctx.lineJoin = 'round'
  ctx.stroke()
  starPath(ctx, x, y, r)
  ctx.fillStyle = tierStyle(tier).hex
  ctx.fill()
}

/** A racing stripe in the tier colour, for tier 2 and up. */
const tierStripe = (
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, tier: number
): void => {
  rrect(ctx, x, y, w, h, h / 2)
  ctx.fillStyle = tierStyle(tier).hex
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  rrect(ctx, x + h * 0.4, y + h * 0.18, w - h * 0.8, h * 0.28, h * 0.14)
  ctx.fill()
}

// ─── Squirt Gun (cannon) ────────────────────────────────────────────────────

/** The swivel stand the squirt gun sits on — BLOCK space, never rotated. */
export const drawSquirtMount = (ctx: CanvasRenderingContext2D, s: number): void => {
  ctx.save()
  ctx.scale(s, s)
  // Post up to the pivot.
  rrect(ctx, -0.045, -0.01, 0.09, 0.19, 0.03)
  paint(ctx, s, cel(ctx, -0.045, 0, 0.045, 0, TOY.yellow, 0.3, 0.7))
  // Swivel foot: a low blue dome sitting on the plinth.
  ctx.beginPath()
  ctx.moveTo(-0.17, 0.2)
  ctx.quadraticCurveTo(-0.16, 0.12, 0, 0.12)
  ctx.quadraticCurveTo(0.16, 0.12, 0.17, 0.2)
  ctx.closePath()
  paint(ctx, s, cel(ctx, 0, 0.12, 0, 0.2, TOY.blue, 0.34, 0.8))
  ctx.restore()
}

/**
 * The squirt gun itself, pointing +x from its pivot.
 *
 * `hx, hy` is the WORLD horizontal expressed in the gun's own frame, so the
 * water in the tank lies level however the gun is tilted — it costs nothing,
 * because the sprite is re-baked per aim bucket anyway.
 */
export const drawSquirtGun = (
  ctx: CanvasRenderingContext2D, s: number, recoil: number, tier: number, hx: number, hy: number
): void => {
  ctx.save()
  ctx.scale(s, s)
  const big = tier >= 3

  // Grip, behind the body.
  ctx.beginPath()
  ctx.moveTo(-0.15, 0.06)
  ctx.lineTo(-0.02, 0.06)
  ctx.quadraticCurveTo(-0.03, 0.17, -0.05, 0.27)
  ctx.quadraticCurveTo(-0.06, 0.31, -0.1, 0.31)
  ctx.lineTo(-0.16, 0.31)
  ctx.quadraticCurveTo(-0.21, 0.31, -0.2, 0.26)
  ctx.quadraticCurveTo(-0.17, 0.17, -0.15, 0.06)
  ctx.closePath()
  paint(ctx, s, cel(ctx, -0.2, 0, -0.02, 0, TOY.green, 0.2, 0.6))
  ctx.strokeStyle = TOY.green.shade
  ctx.lineWidth = W(s, 0.016)
  ctx.beginPath()
  ctx.moveTo(-0.17, 0.18); ctx.lineTo(-0.06, 0.18)
  ctx.moveTo(-0.175, 0.23); ctx.lineTo(-0.065, 0.23)
  ctx.stroke()

  // Trigger.
  ctx.beginPath()
  ctx.moveTo(0.0, 0.07)
  ctx.quadraticCurveTo(0.055, 0.1, 0.035, 0.18)
  ctx.quadraticCurveTo(0.005, 0.14, -0.012, 0.08)
  ctx.closePath()
  paint(ctx, s, TOY.orange.base, 0.026)

  // Pump slide under the nozzle.
  rrect(ctx, 0.1, 0.035, 0.25, 0.09, 0.04)
  paint(ctx, s, cel(ctx, 0, 0.035, 0, 0.125, TOY.orange))
  ctx.strokeStyle = TOY.orange.shade
  ctx.lineWidth = W(s, 0.016)
  ctx.beginPath()
  for (const x of [0.17, 0.22, 0.27]) { ctx.moveTo(x, 0.055); ctx.lineTo(x, 0.105) }
  ctx.stroke()

  // Nozzle barrel and its tip.
  rrect(ctx, 0.26, -0.062, 0.24, 0.1, 0.035)
  paint(ctx, s, cel(ctx, 0, -0.062, 0, 0.038, TOY.yellow))
  rrect(ctx, 0.455, -0.078, 0.09, 0.132, 0.03)
  paint(ctx, s, cel(ctx, 0, -0.078, 0, 0.054, TOY.orange))
  ctx.fillStyle = '#1b3a52'
  disc(ctx, 0.548, -0.012, 0.02); ctx.fill()

  // Rear knob.
  disc(ctx, -0.27, -0.025, 0.06)
  paint(ctx, s, cel(ctx, 0, -0.085, 0, 0.035, TOY.orange))

  // Body.
  ctx.beginPath()
  ctx.moveTo(-0.28, -0.08)
  ctx.quadraticCurveTo(-0.28, -0.135, -0.22, -0.135)
  ctx.lineTo(0.24, -0.125)
  ctx.quadraticCurveTo(0.315, -0.12, 0.315, -0.06)
  ctx.lineTo(0.315, 0.025)
  ctx.quadraticCurveTo(0.31, 0.085, 0.25, 0.085)
  ctx.lineTo(-0.2, 0.092)
  ctx.quadraticCurveTo(-0.28, 0.092, -0.28, 0.02)
  ctx.closePath()
  paint(ctx, s, cel(ctx, 0, -0.135, 0, 0.092, TOY.green, 0.22, 0.66))
  // Orange stripe decal down the side.
  rrect(ctx, -0.23, 0.0, 0.5, 0.036, 0.018)
  ctx.fillStyle = TOY.orange.base
  ctx.fill()
  if (tier >= 2) {
    tierStripe(ctx, -0.23, 0.045, 0.5, 0.028, tier)
    sticker(ctx, s, 0.2, -0.055, 0.045, tier)
  }
  if (big) {
    // Pressure gauge: the fancy-toy tell.
    disc(ctx, -0.16, -0.05, 0.05)
    paint(ctx, s, '#ffffff', 0.024)
    ctx.strokeStyle = '#e5483b'
    ctx.lineWidth = W(s, 0.018)
    ctx.beginPath(); ctx.moveTo(-0.16, -0.05); ctx.lineTo(-0.13, -0.075); ctx.stroke()
  }
  gloss(ctx, s, -0.2, -0.105, 0.2, -0.1, 0.028, 0.7)

  // Water tank on top: clear plastic, water lying level in the world.
  const tx0 = big ? -0.24 : -0.2
  const tx1 = big ? 0.22 : 0.16
  const ty0 = big ? -0.335 : -0.315
  const ty1 = -0.115
  // Filler cap first, so the tank overlaps its foot.
  rrect(ctx, tx0 + 0.05, ty0 - 0.04, 0.08, 0.055, 0.02)
  paint(ctx, s, TOY.orange.base, 0.026)
  rrect(ctx, tx0, ty0, tx1 - tx0, ty1 - ty0, 0.09)
  ctx.fillStyle = 'rgba(222,246,255,0.82)'
  ctx.fill()
  ctx.save()
  ctx.clip()
  const cx = (tx0 + tx1) / 2
  const cy = (ty0 + ty1) / 2
  // Gravity in the gun's frame is the horizontal turned a quarter clockwise.
  const gx = -hy
  const gy = hx
  const lvl = 0.01 + recoil * 0.02
  const px = cx + gx * lvl
  const py = cy + gy * lvl
  ctx.beginPath()
  ctx.moveTo(px - hx, py - hy)
  ctx.lineTo(px + hx, py + hy)
  ctx.lineTo(px + hx + gx, py + hy + gy)
  ctx.lineTo(px - hx + gx, py - hy + gy)
  ctx.closePath()
  ctx.fillStyle = '#34b3d1'
  ctx.fill()
  ctx.strokeStyle = '#8fe8f2'
  ctx.lineWidth = W(s, 0.022)
  ctx.beginPath()
  ctx.moveTo(px - hx, py - hy)
  ctx.lineTo(px + hx, py + hy)
  ctx.stroke()
  ctx.restore()
  rrect(ctx, tx0, ty0, tx1 - tx0, ty1 - ty0, 0.09)
  ctx.strokeStyle = INK
  ctx.lineWidth = W(s, 0.034)
  ctx.stroke()
  gloss(ctx, s, tx0 + 0.06, ty0 + 0.045, tx0 + 0.16, ty0 + 0.045, 0.028, 0.9)
  // Tank straps.
  ctx.fillStyle = TOY.yellow.base
  for (const x of [tx0 + 0.05, tx1 - 0.07]) {
    rrect(ctx, x, ty1 - 0.03, 0.03, 0.05, 0.01)
    paint(ctx, s, TOY.yellow.base, 0.018)
  }

  // A drip hanging off the nozzle right after a shot.
  if (recoil > 0.15) {
    ctx.beginPath()
    ctx.moveTo(0.585, -0.02)
    ctx.quadraticCurveTo(0.625, 0.04, 0.585, 0.06)
    ctx.quadraticCurveTo(0.545, 0.04, 0.585, -0.02)
    ctx.closePath()
    paint(ctx, s, '#7fe0ec', 0.02)
  }
  ctx.restore()
}

// ─── Dart Blaster (archer) ──────────────────────────────────────────────────

/** Tripod the blaster swivels on — BLOCK space, never rotated. */
export const drawBlasterMount = (ctx: CanvasRenderingContext2D, s: number): void => {
  ctx.save()
  ctx.scale(s, s)
  tube(ctx, s, [[0, 0.03], [0, 0.2]], 0.045, TOY.blue.shade)
  tube(ctx, s, [[0, 0.03], [-0.17, 0.2]], 0.05, TOY.blue.base)
  tube(ctx, s, [[0, 0.03], [0.17, 0.2]], 0.05, TOY.blue.base)
  for (const x of [-0.17, 0, 0.17]) {
    ctx.beginPath()
    ctx.ellipse(x, 0.205, 0.05, 0.028, 0, 0, Math.PI * 2)
    paint(ctx, s, TOY.yellow.base, 0.024)
  }
  disc(ctx, 0, 0.035, 0.06)
  paint(ctx, s, cel(ctx, 0, -0.025, 0, 0.095, TOY.yellow))
  ctx.restore()
}

/**
 * The foam-dart blaster. Loaded at rest — the dart's suction cup peeks out of
 * the muzzle — and empty, with its priming slide racked back, while the shot
 * is still leaving (the caller's `recoil`).
 */
export const drawDartBlaster = (
  ctx: CanvasRenderingContext2D, s: number, recoil: number, tier: number
): void => {
  ctx.save()
  ctx.scale(s, s)
  const loaded = recoil < 0.2
  const pull = recoil * 0.08

  // Grip.
  ctx.beginPath()
  ctx.moveTo(-0.14, 0.05)
  ctx.lineTo(-0.03, 0.05)
  ctx.lineTo(-0.055, 0.24)
  ctx.quadraticCurveTo(-0.065, 0.28, -0.105, 0.28)
  ctx.lineTo(-0.15, 0.28)
  ctx.quadraticCurveTo(-0.195, 0.28, -0.185, 0.235)
  ctx.closePath()
  paint(ctx, s, cel(ctx, -0.19, 0, -0.03, 0, TOY.blue, 0.22, 0.62))
  // Trigger.
  ctx.beginPath()
  ctx.moveTo(-0.005, 0.06)
  ctx.quadraticCurveTo(0.045, 0.09, 0.03, 0.16)
  ctx.quadraticCurveTo(0.0, 0.12, -0.02, 0.07)
  ctx.closePath()
  paint(ctx, s, TOY.yellow.base, 0.024)

  // A rotating dart drum from tier 3: the "more blaster" read.
  if (tier >= 3) {
    disc(ctx, 0.07, 0.1, 0.095)
    paint(ctx, s, cel(ctx, 0, 0.005, 0, 0.195, TOY.yellow))
    ctx.fillStyle = TOY.orange.base
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      disc(ctx, 0.07 + Math.cos(a) * 0.058, 0.1 + Math.sin(a) * 0.058, 0.02)
      ctx.fill()
    }
    ctx.fillStyle = TOY.blue.base
    disc(ctx, 0.07, 0.1, 0.022); ctx.fill()
  }

  // The loaded dart, behind the barrel: only its tip shows.
  if (loaded) {
    rrect(ctx, 0.14, -0.054, 0.28, 0.068, 0.02)
    paint(ctx, s, cel(ctx, 0, -0.054, 0, 0.014, TOY.orange, 0.3, 0.7), 0.024)
    // The suction cup: a fat blue dome, the loaded-dart tell at any size.
    ctx.beginPath()
    ctx.moveTo(0.405, -0.078)
    ctx.quadraticCurveTo(0.49, -0.08, 0.49, -0.02)
    ctx.quadraticCurveTo(0.49, 0.04, 0.405, 0.038)
    ctx.closePath()
    paint(ctx, s, cel(ctx, 0, -0.08, 0, 0.04, TOY.blue), 0.026)
  }

  // Barrel and muzzle ring.
  rrect(ctx, 0.06, -0.074, 0.25, 0.104, 0.03)
  paint(ctx, s, cel(ctx, 0, -0.074, 0, 0.03, TOY.blue))
  ctx.strokeStyle = TOY.blue.shade
  ctx.lineWidth = W(s, 0.016)
  ctx.beginPath()
  ctx.moveTo(0.17, -0.05); ctx.lineTo(0.17, 0.01)
  ctx.moveTo(0.21, -0.05); ctx.lineTo(0.21, 0.01)
  ctx.stroke()
  rrect(ctx, 0.27, -0.09, 0.055, 0.136, 0.022)
  paint(ctx, s, cel(ctx, 0, -0.09, 0, 0.046, TOY.orange), 0.028)
  if (!loaded) {
    ctx.fillStyle = '#1e2a44'
    ctx.beginPath(); ctx.ellipse(0.326, -0.022, 0.012, 0.04, 0, 0, Math.PI * 2); ctx.fill()
  }

  // Priming slide at the back, racked by the shot.
  tube(ctx, s, [[-0.25, -0.075], [-0.31 - pull, -0.075]], 0.025, TOY.yellow.shade)
  rrect(ctx, -0.36 - pull, -0.125, 0.055, 0.1, 0.02)
  paint(ctx, s, cel(ctx, 0, -0.125, 0, -0.025, TOY.yellow))

  // Sight fin (a scope from tier 3).
  if (tier >= 3) {
    rrect(ctx, -0.12, -0.205, 0.2, 0.065, 0.03)
    paint(ctx, s, cel(ctx, 0, -0.205, 0, -0.14, TOY.blue))
    disc(ctx, 0.08, -0.172, 0.028)
    paint(ctx, s, '#bff0ff', 0.02)
  } else {
    ctx.beginPath()
    ctx.moveTo(0.0, -0.11)
    ctx.lineTo(0.02, -0.17)
    ctx.lineTo(0.07, -0.17)
    ctx.lineTo(0.08, -0.11)
    ctx.closePath()
    paint(ctx, s, TOY.blue.base, 0.026)
  }

  // Body: chunky orange receiver with a hump over the chamber.
  ctx.beginPath()
  ctx.moveTo(-0.265, -0.06)
  ctx.quadraticCurveTo(-0.265, -0.125, -0.2, -0.125)
  ctx.lineTo(-0.04, -0.125)
  ctx.quadraticCurveTo(0.03, -0.16, 0.1, -0.12)
  ctx.quadraticCurveTo(0.155, -0.11, 0.155, -0.06)
  ctx.lineTo(0.155, 0.03)
  ctx.quadraticCurveTo(0.155, 0.075, 0.11, 0.075)
  ctx.lineTo(-0.215, 0.075)
  ctx.quadraticCurveTo(-0.265, 0.075, -0.265, 0.025)
  ctx.closePath()
  paint(ctx, s, cel(ctx, 0, -0.14, 0, 0.075, TOY.orange, 0.26, 0.66))
  // Blue side panel with two screws.
  rrect(ctx, -0.2, -0.055, 0.25, 0.07, 0.025)
  paint(ctx, s, TOY.blue.base, 0.02)
  ctx.fillStyle = TOY.yellow.base
  disc(ctx, -0.17, -0.02, 0.016); ctx.fill()
  disc(ctx, 0.02, -0.02, 0.016); ctx.fill()
  if (tier >= 2) {
    tierStripe(ctx, -0.23, 0.03, 0.36, 0.026, tier)
    sticker(ctx, s, 0.1, -0.055, 0.04, tier)
  }
  gloss(ctx, s, -0.21, -0.1, -0.06, -0.1, 0.026, 0.75)
  ctx.restore()
}

// ─── Mud Mortar (mortar) ────────────────────────────────────────────────────

/**
 * A toy sand bucket turned into a mortar tube, mouth along +x, with a mud
 * ball waiting in it. Bucket handle hangs down its side.
 */
export const drawMudMortar = (
  ctx: CanvasRenderingContext2D, s: number, recoil: number, tier: number
): void => {
  ctx.save()
  ctx.scale(s, s)

  // The bucket, narrow at its base and flaring to the mouth.
  ctx.beginPath()
  ctx.moveTo(0.0, -0.13)
  ctx.lineTo(0.4, -0.195)
  ctx.lineTo(0.4, 0.195)
  ctx.lineTo(0.0, 0.13)
  ctx.quadraticCurveTo(-0.035, 0.13, -0.035, 0.095)
  ctx.lineTo(-0.035, -0.095)
  ctx.quadraticCurveTo(-0.035, -0.13, 0.0, -0.13)
  ctx.closePath()
  paint(ctx, s, cel(ctx, 0, -0.2, 0, 0.2, TOY.blue, 0.22, 0.66))
  // Moulded ridges round the bucket.
  ctx.strokeStyle = TOY.blue.shade
  ctx.lineWidth = W(s, 0.02)
  ctx.beginPath()
  for (const x of [0.09, 0.19]) {
    const h = 0.13 + (x / 0.4) * 0.065
    ctx.moveTo(x, -h + 0.01); ctx.lineTo(x, h - 0.01)
  }
  ctx.stroke()
  if (tier >= 3) {
    rrect(ctx, 0.23, -0.175, 0.045, 0.35, 0.02)
    paint(ctx, s, TOY.yellow.base, 0.02)
  }
  if (tier >= 2) sticker(ctx, s, 0.14, 0.035, 0.05, tier)
  gloss(ctx, s, 0.04, -0.105, 0.33, -0.15, 0.026, 0.7)

  // Thick rolled rim.
  rrect(ctx, 0.36, -0.215, 0.09, 0.43, 0.035)
  paint(ctx, s, cel(ctx, 0, -0.215, 0, 0.215, TOY.yellow, 0.2, 0.68))
  // Mouth, full of mud.
  ctx.fillStyle = '#4a2f18'
  ctx.beginPath(); ctx.ellipse(0.448, 0, 0.034, 0.18, 0, 0, Math.PI * 2); ctx.fill()

  // The mud ball, until it has just been fired.
  if (recoil < 0.3) {
    disc(ctx, 0.46, 0.0, 0.11)
    paint(ctx, s, cel(ctx, 0.4, -0.1, 0.54, 0.1, TOY.mud, 0.2, 0.62))
    ctx.fillStyle = TOY.mud.shade
    disc(ctx, 0.49, 0.045, 0.017); ctx.fill()
    disc(ctx, 0.44, 0.055, 0.012); ctx.fill()
    ctx.fillStyle = 'rgba(255,240,220,0.55)'
    disc(ctx, 0.435, -0.05, 0.024); ctx.fill()
  }
  // A mud drip down the outside of the rim.
  ctx.beginPath()
  ctx.moveTo(0.43, -0.2)
  ctx.quadraticCurveTo(0.42, -0.24, 0.34, -0.225)
  ctx.quadraticCurveTo(0.3, -0.2, 0.34, -0.19)
  ctx.closePath()
  paint(ctx, s, TOY.mud.base, 0.022)

  // Handle, hanging down against the side.
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0.37, -0.19)
  ctx.quadraticCurveTo(0.07, 0.0, 0.37, 0.19)
  ctx.strokeStyle = INK
  ctx.lineWidth = W(s, 0.05)
  ctx.stroke()
  ctx.strokeStyle = TOY.yellow.base
  ctx.lineWidth = W(s, 0.026)
  ctx.stroke()

  // Pivot hub.
  disc(ctx, 0.02, 0, 0.075)
  paint(ctx, s, cel(ctx, 0, -0.075, 0, 0.075, TOY.yellow))
  ctx.fillStyle = TOY.blue.base
  disc(ctx, 0.02, 0, 0.03); ctx.fill()
  ctx.restore()
}

// ─── Balloon Launcher (bombard) ─────────────────────────────────────────────

/**
 * A fat cardboard launch tube on a plastic pivot, a water balloon sitting in
 * its mouth. The caller sinks it into its pit on the recoil.
 */
export const drawBalloonLauncher = (
  ctx: CanvasRenderingContext2D, s: number, recoil: number, tier: number, left: boolean
): void => {
  ctx.save()
  ctx.scale(s, s)

  // Pivot cheeks.
  disc(ctx, 0, 0, 0.16)
  paint(ctx, s, cel(ctx, 0, -0.16, 0, 0.16, TOY.yellow))
  ctx.strokeStyle = TOY.yellow.shade
  ctx.lineWidth = W(s, 0.02)
  disc(ctx, 0, 0, 0.1); ctx.stroke()

  // The tube: a straight cardboard roll with a rounded butt. Straight on
  // purpose — a flared one read as a paper cup holding a scoop of ice cream.
  const H = 0.175
  ctx.beginPath()
  ctx.moveTo(-0.02, -H)
  ctx.lineTo(0.28, -H)
  ctx.lineTo(0.28, H)
  ctx.lineTo(-0.02, H)
  ctx.quadraticCurveTo(-0.09, H, -0.09, 0)
  ctx.quadraticCurveTo(-0.09, -H, -0.02, -H)
  ctx.closePath()
  paint(ctx, s, cel(ctx, 0, -H, 0, H, TOY.kraft, 0.24, 0.66))
  // Spiral seams of a cardboard tube.
  ctx.strokeStyle = TOY.kraft.shade
  ctx.lineWidth = W(s, 0.018)
  ctx.beginPath()
  for (const x of [-0.05, 0.05, 0.15]) {
    ctx.moveTo(x, -H + 0.012)
    ctx.lineTo(x + 0.09, H - 0.012)
  }
  ctx.stroke()
  // Toy-blue bands (a third from tier 3).
  for (const x of tier >= 3 ? [0.0, 0.1, 0.2] : [0.03, 0.17]) {
    rrect(ctx, x, -H - 0.012, 0.045, H * 2 + 0.024, 0.015)
    paint(ctx, s, cel(ctx, 0, -H, 0, H, TOY.blue), 0.02)
  }
  if (tier >= 2) sticker(ctx, s, 0.11, 0.05, 0.05, tier)
  gloss(ctx, s, -0.04, -0.12, 0.24, -0.12, 0.026, 0.6)

  // Plastic collar and the dark mouth.
  ctx.beginPath(); ctx.ellipse(0.29, 0, 0.055, 0.215, 0, 0, Math.PI * 2)
  paint(ctx, s, cel(ctx, 0, -0.215, 0, 0.215, TOY.orange, 0.22, 0.64))
  ctx.fillStyle = '#2a1d12'
  ctx.beginPath(); ctx.ellipse(0.3, 0, 0.033, 0.15, 0, 0, Math.PI * 2); ctx.fill()

  // The water balloon, until it has just been lobbed: fatter than the mouth,
  // a knot at its tail, glossy. Its colour is the flank's, so a tower throws
  // a spread of toy colours.
  if (recoil < 0.3) {
    const rmp = left ? TOY.green : TOY.pink
    const r = tier >= 3 ? 0.155 : 0.14
    const bx = 0.3 + r * 0.72
    ctx.beginPath()
    ctx.moveTo(0.29, -0.03)
    ctx.lineTo(0.33, -0.05)
    ctx.lineTo(0.33, 0.05)
    ctx.lineTo(0.29, 0.03)
    ctx.closePath()
    paint(ctx, s, rmp.shade, 0.02)
    ctx.beginPath(); ctx.ellipse(bx, 0, r * 1.02, r, 0, 0, Math.PI * 2)
    paint(ctx, s, cel(ctx, bx - r, -r, bx + r * 0.4, r, rmp, 0.2, 0.62))
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.beginPath(); ctx.ellipse(bx + r * 0.2, -r * 0.48, r * 0.3, r * 0.16, 0.35, 0, Math.PI * 2); ctx.fill()
    disc(ctx, bx + r * 0.58, -r * 0.1, r * 0.08); ctx.fill()
  }
  ctx.restore()
}

// ─── Bug Zapper (tesla) ─────────────────────────────────────────────────────

/**
 * The zapper's pulsing glow, behind the lantern.
 *
 * Split out, with the crackle, because they are the part that MOVES: a
 * painted lantern replaces the body and keeps these live around it, and the
 * art-sheet reference leaves them out so they are not painted in as well.
 */
export const drawZapperGlow = (
  ctx: CanvasRenderingContext2D, s: number, pulse: number, pal: { accent2: string }
): void => {
  ctx.save()
  ctx.scale(s, s)
  const gr = 0.3 * (0.72 + pulse * 0.4)
  const glow = ctx.createRadialGradient(0, -0.22, 0, 0, -0.22, gr + 0.06)
  glow.addColorStop(0, withA(pal.accent2, 0.85))
  glow.addColorStop(0.45, 'rgba(150,120,255,0.42)')
  glow.addColorStop(1, 'rgba(150,120,255,0)')
  ctx.fillStyle = glow
  disc(ctx, 0, -0.22, gr + 0.06); ctx.fill()
  ctx.restore()
}

/** The idle crackle that jumps the grid near the top of each pulse. */
export const drawZapperCrackle = (ctx: CanvasRenderingContext2D, s: number, pulse: number): void => {
  if (pulse <= 0.82) return
  ctx.save()
  ctx.scale(s, s)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = W(s, 0.02)
  ctx.beginPath()
  ctx.moveTo(-0.105, -0.22)
  ctx.lineTo(-0.06, -0.19)
  ctx.lineTo(-0.02, -0.23)
  ctx.lineTo(0.03, -0.18)
  ctx.lineTo(0.055, -0.21)
  ctx.stroke()
  ctx.restore()
}

/**
 * A blue-violet bug-zapper lantern: wire grid over a glowing UV tube, a hook
 * on top where the chain lightning leaves from. `pulse` is 0..1 and drives
 * the glow; an idle crackle jumps the grid near the top of each pulse.
 * `live: false` leaves out the glow and the crackle (see `drawZapperGlow`).
 */
export const drawBugZapper = (
  ctx: CanvasRenderingContext2D, s: number, pulse: number, tier: number,
  pal: { accent: string; accent2: string }, live = true
): void => {
  if (live) drawZapperGlow(ctx, s, pulse, pal)
  ctx.save()
  ctx.scale(s, s)

  // Cage interior and the tube.
  ctx.fillStyle = '#261b52'
  ctx.fillRect(-0.15, -0.34, 0.3, 0.28)
  rrect(ctx, -0.055, -0.315, 0.11, 0.24, 0.05)
  ctx.fillStyle = `rgba(214,236,255,${0.72 + pulse * 0.28})`
  ctx.fill()
  ctx.fillStyle = withA(pal.accent, 0.55 + pulse * 0.35)
  rrect(ctx, -0.022, -0.3, 0.044, 0.21, 0.022)
  ctx.fill()

  // Wire grid in front.
  ctx.strokeStyle = 'rgba(208,202,255,0.9)'
  ctx.lineWidth = W(s, 0.014)
  ctx.beginPath()
  for (const x of [-0.105, -0.055, 0, 0.055, 0.105]) { ctx.moveTo(x, -0.335); ctx.lineTo(x, -0.065) }
  for (const y of [-0.25, -0.15]) { ctx.moveTo(-0.15, y); ctx.lineTo(0.15, y) }
  ctx.stroke()
  // Corner posts and the cage outline.
  ctx.strokeStyle = INK
  ctx.lineWidth = W(s, 0.034)
  ctx.strokeRect(-0.15, -0.34, 0.3, 0.28)
  ctx.strokeStyle = TOY.violet.lit
  ctx.lineWidth = W(s, 0.024)
  ctx.beginPath()
  ctx.moveTo(-0.15, -0.34); ctx.lineTo(-0.15, -0.06)
  ctx.moveTo(0.15, -0.34); ctx.lineTo(0.15, -0.06)
  ctx.stroke()

  // Idle crackle across the grid.
  if (live) {
    ctx.restore()
    drawZapperCrackle(ctx, s, pulse)
    ctx.save()
    ctx.scale(s, s)
  }

  // Base.
  ctx.beginPath()
  ctx.moveTo(-0.19, -0.075)
  ctx.lineTo(0.19, -0.075)
  ctx.lineTo(0.15, 0.035)
  ctx.lineTo(-0.15, 0.035)
  ctx.closePath()
  paint(ctx, s, cel(ctx, 0, -0.075, 0, 0.035, TOY.violet, 0.28, 0.66))
  // Roof.
  ctx.beginPath()
  ctx.moveTo(-0.19, -0.33)
  ctx.lineTo(0.19, -0.33)
  ctx.lineTo(0.11, -0.405)
  ctx.lineTo(-0.11, -0.405)
  ctx.closePath()
  paint(ctx, s, cel(ctx, 0, -0.405, 0, -0.33, TOY.violet, 0.3, 0.7))
  // Hook.
  ctx.strokeStyle = INK
  ctx.lineWidth = W(s, 0.045)
  disc(ctx, 0, -0.44, 0.035); ctx.stroke()
  ctx.strokeStyle = '#d6d2f0'
  ctx.lineWidth = W(s, 0.02)
  disc(ctx, 0, -0.44, 0.035); ctx.stroke()

  if (tier >= 2) sticker(ctx, s, 0.095, -0.02, 0.035, tier)
  if (tier >= 3) {
    // Twin charge coils on the roof.
    for (const x of [-0.14, 0.14]) {
      tube(ctx, s, [[x, -0.36], [x, -0.44]], 0.022, '#d6d2f0')
      disc(ctx, x, -0.45, 0.03)
      paint(ctx, s, withA(pal.accent2, 0.95), 0.02)
    }
  }
  ctx.restore()
}

// ─── Ice Pop (frost) ────────────────────────────────────────────────────────

/** The ice pop's breathing cold glow, behind it — live over a painting too. */
export const drawIcePopGlow = (ctx: CanvasRenderingContext2D, s: number, pulse: number): void => {
  ctx.save()
  ctx.scale(s, s)
  const glow = ctx.createRadialGradient(0, -0.28, 0, 0, -0.28, 0.32)
  glow.addColorStop(0, `rgba(215,250,255,${0.42 + pulse * 0.25})`)
  glow.addColorStop(1, 'rgba(215,250,255,0)')
  ctx.fillStyle = glow
  disc(ctx, 0, -0.28, 0.32); ctx.fill()
  ctx.restore()
}

/** The frost glints twinkling on the pop, out of step with each other. */
export const drawIcePopGlints = (ctx: CanvasRenderingContext2D, s: number, pulse: number): void => {
  ctx.save()
  ctx.scale(s, s)
  twinkle(ctx, -0.07, -0.37, 0.06 * (0.55 + 0.45 * pulse), '#ffffff')
  twinkle(ctx, 0.065, -0.17, 0.05 * (1 - 0.45 * pulse), '#ffffff')
  twinkle(ctx, -0.085, -0.12, 0.035 * (0.6 + 0.4 * pulse), '#f2fdff')
  ctx.restore()
}

/**
 * A giant ice pop on its stick, one bite out of the top, frost glints
 * twinkling on it. `pulse` 0..1 breathes the cold glow and the glints.
 * `live: false` leaves both out — they are what a painted pop keeps live.
 */
export const drawIcePop = (
  ctx: CanvasRenderingContext2D, s: number, pulse: number, tier: number, live = true
): void => {
  if (live) drawIcePopGlow(ctx, s, pulse)
  ctx.save()
  ctx.scale(s, s)

  // Stick.
  rrect(ctx, -0.045, -0.12, 0.09, 0.34, 0.045)
  paint(ctx, s, cel(ctx, -0.045, 0, 0.045, 0, TOY.wood, 0.3, 0.68))

  // The pop: rounded top, a bite out of the right shoulder.
  ctx.beginPath()
  ctx.moveTo(-0.16, -0.08)
  ctx.lineTo(-0.16, -0.32)
  ctx.arc(0, -0.32, 0.16, Math.PI, Math.PI * 1.72)
  ctx.quadraticCurveTo(0.07, -0.37, 0.115, -0.33)
  ctx.quadraticCurveTo(0.1, -0.28, 0.16, -0.255)
  ctx.lineTo(0.16, -0.08)
  ctx.quadraticCurveTo(0.16, -0.045, 0.125, -0.045)
  ctx.lineTo(-0.125, -0.045)
  ctx.quadraticCurveTo(-0.16, -0.045, -0.16, -0.08)
  ctx.closePath()
  paint(ctx, s, cel(ctx, -0.16, 0, 0.16, 0, TOY.ice, 0.26, 0.68))
  // Moulded ridges.
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = W(s, 0.018)
  ctx.beginPath()
  ctx.moveTo(-0.12, -0.2); ctx.lineTo(0.12, -0.2)
  ctx.moveTo(-0.12, -0.13); ctx.lineTo(0.12, -0.13)
  ctx.stroke()
  if (tier >= 2) {
    tierStripe(ctx, -0.13, -0.285, 0.24, 0.035, tier)
    sticker(ctx, s, 0.0, 0.1, 0.035, tier)
  }
  gloss(ctx, s, -0.115, -0.33, -0.115, -0.1, 0.03, 0.8)
  // A melt drop gathering under the pop.
  ctx.beginPath()
  ctx.moveTo(0.1, -0.05)
  ctx.quadraticCurveTo(0.125, 0.0, 0.1, 0.012)
  ctx.quadraticCurveTo(0.075, 0.0, 0.1, -0.05)
  ctx.closePath()
  paint(ctx, s, TOY.ice.base, 0.018)

  // A crown of ice crystals from tier 3 — the old frost spire, frozen on.
  if (tier >= 3) {
    for (const [x, y, k] of [[-0.115, -0.43, 0.7], [-0.03, -0.505, 1], [0.065, -0.49, 0.62]] as const) {
      ctx.beginPath()
      ctx.moveTo(x, y - 0.07 * k)
      ctx.lineTo(x + 0.04 * k, y)
      ctx.lineTo(x, y + 0.07 * k)
      ctx.lineTo(x - 0.04 * k, y)
      ctx.closePath()
      paint(ctx, s, '#e6fdff', 0.02)
    }
  }

  ctx.restore()
  // Frost glints, breathing out of step with each other.
  if (live) drawIcePopGlints(ctx, s, pulse)
}

// ─── Toothpick Wall (spikes) ────────────────────────────────────────────────

/** Small fixed tilts so the toothpicks look pushed in by hand, not machined. */
const PICK_TILT = [0.09, -0.06, 0.12, -0.1, 0.04, -0.13, 0.07, -0.03, 0.11, -0.08, 0.02, -0.12, 0.1, -0.05]

/** The glints twinkling at the toothpicks' points — live over a painting too. */
export const drawToothpickGlints = (ctx: CanvasRenderingContext2D, s: number, glint: number): void => {
  ctx.save()
  ctx.scale(s, s)
  ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.45 * glint})`
  for (const [gx, gy] of [[0.63, -0.19], [0.63, 0.19], [-0.63, 0], [0, -0.64], [0, 0.64]] as const) {
    disc(ctx, gx, gy, 0.028); ctx.fill()
  }
  ctx.restore()
}

/**
 * Toothpicks bristling out of all four faces — the thorns fire whichever face
 * is hit, so the art says so on every side. `glint` 0..1 twinkles the points;
 * `live: false` leaves the glints out.
 */
export const drawToothpicks = (
  ctx: CanvasRenderingContext2D, s: number, glint: number, live = true
): void => {
  ctx.save()
  ctx.scale(s, s)
  let k = 0
  for (const [ang, count] of [[0, 3], [Math.PI, 3], [-Math.PI / 2, 4], [Math.PI / 2, 4]] as const) {
    ctx.save()
    ctx.rotate(ang)
    for (let i = 0; i < count; i++) {
      const off = (i - (count - 1) / 2) * 0.19
      const len = 0.22 + (i % 2) * 0.05
      ctx.save()
      ctx.translate(0.36, off)
      ctx.rotate(PICK_TILT[k++ % PICK_TILT.length]!)
      ctx.beginPath()
      ctx.moveTo(-0.05, -0.028)
      ctx.lineTo(len - 0.06, -0.028)
      ctx.lineTo(len + 0.02, 0)
      ctx.lineTo(len - 0.06, 0.028)
      ctx.lineTo(-0.05, 0.028)
      ctx.closePath()
      paint(ctx, s, TOY.wood.base, 0.026)
      ctx.strokeStyle = TOY.wood.lit
      ctx.lineWidth = W(s, 0.014)
      ctx.beginPath()
      ctx.moveTo(-0.02, -0.01); ctx.lineTo(len - 0.07, -0.01)
      ctx.stroke()
      ctx.restore()
    }
    ctx.restore()
  }
  ctx.restore()
  if (live) drawToothpickGlints(ctx, s, glint)
}

// ─── Paper Flag (banner) ────────────────────────────────────────────────────

/**
 * A paper swallowtail flag on a toothpick mast, in the banner's heraldic plum
 * and gold. Everything stays inside the cell (see the note in `drawFixture`).
 */
export const drawPaperFlag = (ctx: CanvasRenderingContext2D, s: number, sway: number): void => {
  ctx.save()
  ctx.scale(s, s)
  // Mast: a toothpick, point up.
  ctx.beginPath()
  ctx.moveTo(0, -0.475)
  ctx.lineTo(0.028, -0.41)
  ctx.lineTo(0.028, 0.37)
  ctx.lineTo(-0.028, 0.37)
  ctx.lineTo(-0.028, -0.41)
  ctx.closePath()
  paint(ctx, s, cel(ctx, -0.028, 0, 0.028, 0, TOY.wood, 0.3, 0.66), 0.028)

  ctx.translate(0.025, -0.4)
  // Paper, rippling on a fixed curl.
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(0.14 + sway, -0.04, 0.33 + sway, 0.02)
  ctx.lineTo(0.24 + sway, 0.155)
  ctx.lineTo(0.33 + sway, 0.3)
  ctx.quadraticCurveTo(0.14 + sway, 0.25, 0, 0.3)
  ctx.closePath()
  paint(ctx, s, cel(ctx, 0, -0.02, 0, 0.3, TOY.plum, 0.24, 0.7))
  // Gold band and a gold star: the heraldry.
  ctx.beginPath()
  ctx.moveTo(0.0, 0.11)
  ctx.quadraticCurveTo(0.12, 0.09, 0.26 + sway, 0.115)
  ctx.lineTo(0.245 + sway, 0.16)
  ctx.quadraticCurveTo(0.12, 0.15, 0.0, 0.17)
  ctx.closePath()
  ctx.fillStyle = '#ffd35c'
  ctx.fill()
  starPath(ctx, 0.12, 0.14, 0.065)
  paint(ctx, s, '#ffe38a', 0.02)
  // The fold where the paper wraps the toothpick.
  ctx.fillStyle = 'rgba(40,10,30,0.28)'
  ctx.fillRect(0.0, 0.0, 0.03, 0.3)
  gloss(ctx, s, 0.05, 0.035, 0.2, 0.02, 0.02, 0.55)
  ctx.restore()
}

// ─── Magic Seashell (obelisk) ───────────────────────────────────────────────

/** A glowing scallop shell in a soft aura, with a sparkle or two. */
export const drawMagicShell = (
  ctx: CanvasRenderingContext2D, s: number, pal: { accent: string; accent2: string }
): void => {
  ctx.save()
  ctx.scale(s, s)
  const aura = ctx.createRadialGradient(0, -0.08, 0.05, 0, -0.08, 0.46)
  aura.addColorStop(0, withA(pal.accent, 0.6))
  aura.addColorStop(1, withA(pal.accent, 0))
  ctx.fillStyle = aura
  disc(ctx, 0, -0.08, 0.46); ctx.fill()

  // Hinge "ears".
  ctx.beginPath()
  ctx.moveTo(-0.15, 0.18)
  ctx.lineTo(0.15, 0.18)
  ctx.lineTo(0.09, 0.285)
  ctx.lineTo(-0.09, 0.285)
  ctx.closePath()
  paint(ctx, s, TOY.shell.shade)

  // The fan, scalloped along its rim.
  const hx = 0, hy = 0.22, R = 0.46
  const a0 = -Math.PI / 2 - 0.92
  const a1 = -Math.PI / 2 + 0.92
  const lobes = 7
  const at = (a: number, r: number): [number, number] => [hx + Math.cos(a) * r, hy + Math.sin(a) * r]
  ctx.beginPath()
  ctx.moveTo(-0.05, 0.215)
  let [px, py] = at(a0, R)
  ctx.lineTo(px, py)
  for (let i = 0; i < lobes; i++) {
    const am = a0 + ((i + 0.5) / lobes) * (a1 - a0)
    const an = a0 + ((i + 1) / lobes) * (a1 - a0)
    const [cx, cy] = at(am, R * 1.13)
    ;[px, py] = at(an, R)
    ctx.quadraticCurveTo(cx, cy, px, py)
  }
  ctx.lineTo(0.05, 0.215)
  ctx.closePath()
  paint(ctx, s, cel(ctx, 0, -0.28, 0, 0.22, TOY.shell, 0.3, 0.72))
  // Ribs.
  ctx.strokeStyle = TOY.shell.shade
  ctx.lineWidth = W(s, 0.02)
  ctx.beginPath()
  for (let i = 1; i < lobes; i++) {
    const a = a0 + (i / lobes) * (a1 - a0)
    const [x0, y0] = at(a, 0.1)
    const [x1, y1] = at(a, R * 0.97)
    ctx.moveTo(x0, y0); ctx.lineTo(x1, y1)
  }
  ctx.stroke()
  gloss(ctx, s, -0.2, -0.12, -0.08, -0.2, 0.03, 0.75)

  // A pearl at the hinge, and a couple of sparkles.
  disc(ctx, 0, 0.17, 0.055)
  paint(ctx, s, cel(ctx, 0, 0.115, 0, 0.225, { lit: '#ffffff', base: pal.accent2, shade: pal.accent }, 0.35, 0.75), 0.022)
  twinkle(ctx, 0.3, -0.3, 0.075, pal.accent2)
  twinkle(ctx, -0.33, -0.2, 0.05, '#ffffff')
  twinkle(ctx, 0.36, 0.06, 0.04, pal.accent2)
  ctx.restore()
}

// ─── Sand Sifter (lumberHut) ────────────────────────────────────────────────

/** A toy sand wheel: sand pours from the funnel onto the paddles and out. */
export const drawSandSifter = (ctx: CanvasRenderingContext2D, s: number): void => {
  ctx.save()
  ctx.scale(s, s)
  const wy = -0.1

  // A heap of sifted sand at its feet.
  ctx.beginPath()
  ctx.moveTo(-0.32, 0.27)
  ctx.quadraticCurveTo(0, 0.07, 0.32, 0.27)
  ctx.closePath()
  paint(ctx, s, cel(ctx, 0, 0.12, 0, 0.27, TOY.sand, 0.3, 0.75), 0.026)

  // A-frame legs.
  tube(ctx, s, [[0, wy], [-0.22, 0.24]], 0.05, TOY.blue.base)
  tube(ctx, s, [[0, wy], [0.22, 0.24]], 0.05, TOY.blue.base)

  // Sand trickling off the bottom of the wheel.
  ctx.fillStyle = TOY.sand.base
  for (const [x, y, r] of [[0.03, 0.12, 0.02], [0.0, 0.16, 0.018], [0.035, 0.195, 0.016], [0.07, 0.1, 0.018]] as const) {
    disc(ctx, x, y, r); ctx.fill()
  }

  // The paddle wheel, held at a fixed quarter-turn.
  ctx.lineCap = 'round'
  for (let i = 0; i < 8; i++) {
    const a = 0.2 + (i * Math.PI) / 4
    const x = Math.cos(a) * 0.2, y = wy + Math.sin(a) * 0.2
    ctx.beginPath(); ctx.moveTo(0, wy); ctx.lineTo(x, y)
    ctx.strokeStyle = INK; ctx.lineWidth = W(s, 0.06); ctx.stroke()
    ctx.strokeStyle = TOY.yellow.base; ctx.lineWidth = W(s, 0.035); ctx.stroke()
  }
  ctx.beginPath(); ctx.arc(0, wy, 0.2, 0, Math.PI * 2)
  ctx.strokeStyle = INK; ctx.lineWidth = W(s, 0.07); ctx.stroke()
  ctx.strokeStyle = TOY.orange.base; ctx.lineWidth = W(s, 0.042); ctx.stroke()
  // Paddle cups on the rim.
  for (let i = 0; i < 8; i++) {
    const a = 0.2 + (i * Math.PI) / 4
    ctx.save()
    ctx.translate(Math.cos(a) * 0.2, wy + Math.sin(a) * 0.2)
    ctx.rotate(a + Math.PI / 2)
    rrect(ctx, -0.05, -0.03, 0.1, 0.06, 0.02)
    paint(ctx, s, TOY.orange.base, 0.024)
    ctx.restore()
  }
  disc(ctx, 0, wy, 0.06)
  paint(ctx, s, cel(ctx, 0, wy - 0.06, 0, wy + 0.06, TOY.blue))

  // Funnel with its heap of sand, and the stream onto the wheel.
  ctx.fillStyle = TOY.sand.base
  for (const [x, y] of [[0, -0.33], [0.012, -0.36]] as const) { disc(ctx, x, y, 0.017); ctx.fill() }
  ctx.beginPath()
  ctx.moveTo(-0.17, -0.45)
  ctx.quadraticCurveTo(0, -0.555, 0.17, -0.45)
  ctx.closePath()
  paint(ctx, s, TOY.sand.lit, 0.024)
  ctx.beginPath()
  ctx.moveTo(-0.21, -0.45)
  ctx.lineTo(0.21, -0.45)
  ctx.lineTo(0.05, -0.36)
  ctx.lineTo(0.045, -0.32)
  ctx.lineTo(-0.045, -0.32)
  ctx.lineTo(-0.05, -0.36)
  ctx.closePath()
  paint(ctx, s, cel(ctx, 0, -0.45, 0, -0.32, TOY.green, 0.26, 0.7))
  gloss(ctx, s, -0.15, -0.43, -0.02, -0.43, 0.022, 0.7)
  ctx.restore()
}

// ─── Pebble Digger (stonepit) ───────────────────────────────────────────────

/** A little yellow toy digger, scoop full of pebbles, beside its pebble heap. */
export const drawPebbleDigger = (ctx: CanvasRenderingContext2D, s: number): void => {
  ctx.save()
  ctx.scale(s, s)
  const pebble = (x: number, y: number, rx: number, ry: number, r: Ramp): void => {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
    paint(ctx, s, cel(ctx, x, y - ry, x, y + ry, r, 0.3, 0.7), 0.026)
  }
  const warm = { lit: '#d8d2c8', base: '#b3aaa0', shade: '#857d74' }

  // The heap.
  pebble(-0.27, 0.2, 0.1, 0.075, TOY.pebble)
  pebble(-0.08, 0.215, 0.09, 0.065, warm)
  pebble(-0.18, 0.1, 0.085, 0.065, warm)
  pebble(0.0, 0.12, 0.06, 0.05, TOY.pebble)
  pebble(-0.33, 0.07, 0.05, 0.04, TOY.pebble)

  // Tracks and cab.
  rrect(ctx, 0.07, 0.15, 0.36, 0.11, 0.055)
  paint(ctx, s, '#4d443c')
  ctx.fillStyle = '#9aa3ad'
  for (const x of [0.13, 0.25, 0.37]) { disc(ctx, x, 0.205, 0.03); ctx.fill() }
  rrect(ctx, 0.12, -0.08, 0.27, 0.235, 0.045)
  paint(ctx, s, cel(ctx, 0, -0.08, 0, 0.155, TOY.yellow, 0.22, 0.66))
  rrect(ctx, 0.24, -0.05, 0.11, 0.09, 0.025)
  paint(ctx, s, '#bfe8ff', 0.022)
  gloss(ctx, s, 0.26, -0.03, 0.32, -0.03, 0.02, 0.9)

  // Pebbles riding in the scoop, drawn first so they peek over its lip.
  pebble(-0.29, -0.3, 0.045, 0.038, TOY.pebble)
  pebble(-0.2, -0.305, 0.05, 0.04, warm)

  // Arm: boom up, stick down to the scoop.
  tube(ctx, s, [[0.17, 0.0], [0.03, -0.38]], 0.075, TOY.yellow.base)
  tube(ctx, s, [[0.03, -0.38], [-0.17, -0.25]], 0.06, TOY.yellow.base)
  tube(ctx, s, [[0.21, -0.07], [0.08, -0.28]], 0.022, '#c9d0d6')
  ctx.fillStyle = INK
  for (const [x, y] of [[0.17, 0.0], [0.03, -0.38], [-0.17, -0.25]] as const) {
    disc(ctx, x, y, 0.028); ctx.fill()
  }

  // Scoop.
  ctx.beginPath()
  ctx.moveTo(-0.36, -0.29)
  ctx.lineTo(-0.12, -0.285)
  ctx.quadraticCurveTo(-0.11, -0.13, -0.24, -0.13)
  ctx.quadraticCurveTo(-0.37, -0.15, -0.36, -0.29)
  ctx.closePath()
  paint(ctx, s, cel(ctx, -0.36, 0, -0.11, 0, TOY.yellow, 0.26, 0.66))
  ctx.fillStyle = INK
  for (const x of [-0.34, -0.3]) {
    ctx.beginPath(); ctx.moveTo(x, -0.29); ctx.lineTo(x - 0.02, -0.33); ctx.lineTo(x + 0.02, -0.29); ctx.fill()
  }
  ctx.restore()
}

// ─── Piggy Bank (coffer) ────────────────────────────────────────────────────

/** A pink piggy bank, a gold coin hovering over its slot. */
export const drawPiggyBank = (ctx: CanvasRenderingContext2D, s: number): void => {
  ctx.save()
  ctx.scale(s, s)
  // Far legs and far ear, a shade darker.
  for (const x of [-0.11, 0.2]) {
    rrect(ctx, x - 0.045, 0.14, 0.09, 0.14, 0.035)
    paint(ctx, s, TOY.pink.shade)
  }
  ctx.beginPath()
  ctx.moveTo(0.06, -0.15); ctx.lineTo(0.1, -0.27); ctx.lineTo(0.16, -0.16); ctx.closePath()
  paint(ctx, s, TOY.pink.shade, 0.026)
  // Curly tail.
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-0.29, -0.01)
  ctx.bezierCurveTo(-0.39, -0.03, -0.38, -0.12, -0.33, -0.11)
  ctx.bezierCurveTo(-0.29, -0.1, -0.31, -0.05, -0.35, -0.06)
  ctx.strokeStyle = INK; ctx.lineWidth = W(s, 0.05); ctx.stroke()
  ctx.strokeStyle = TOY.pink.base; ctx.lineWidth = W(s, 0.026); ctx.stroke()

  // Body.
  ctx.beginPath(); ctx.ellipse(0, 0.03, 0.31, 0.22, 0, 0, Math.PI * 2)
  paint(ctx, s, cel(ctx, 0, -0.19, 0, 0.25, TOY.pink, 0.22, 0.7))
  // Near legs.
  for (const x of [-0.19, 0.1]) {
    rrect(ctx, x - 0.05, 0.16, 0.1, 0.135, 0.035)
    paint(ctx, s, cel(ctx, 0, 0.16, 0, 0.295, TOY.pink, 0.1, 0.6))
  }
  // Near ear.
  ctx.beginPath()
  ctx.moveTo(0.13, -0.16); ctx.lineTo(0.19, -0.29); ctx.lineTo(0.25, -0.14); ctx.closePath()
  paint(ctx, s, TOY.pink.base, 0.026)
  // Snout.
  ctx.beginPath(); ctx.ellipse(0.31, 0.06, 0.06, 0.085, 0, 0, Math.PI * 2)
  paint(ctx, s, TOY.pink.lit)
  ctx.fillStyle = TOY.pink.shade
  ctx.beginPath(); ctx.ellipse(0.3, 0.035, 0.012, 0.02, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(0.3, 0.085, 0.012, 0.02, 0, 0, Math.PI * 2); ctx.fill()
  // Eye and blush.
  ctx.fillStyle = INK
  disc(ctx, 0.19, -0.035, 0.028); ctx.fill()
  ctx.fillStyle = '#ffffff'
  disc(ctx, 0.198, -0.045, 0.01); ctx.fill()
  ctx.fillStyle = 'rgba(229,72,59,0.35)'
  ctx.beginPath(); ctx.ellipse(0.17, 0.06, 0.045, 0.025, 0, 0, Math.PI * 2); ctx.fill()
  gloss(ctx, s, -0.2, -0.1, -0.06, -0.16, 0.035, 0.7)
  // Coin slot.
  ctx.strokeStyle = INK
  ctx.lineWidth = W(s, 0.035)
  ctx.beginPath(); ctx.moveTo(-0.1, -0.175); ctx.lineTo(0.02, -0.18); ctx.stroke()

  // The coin, dropping in edge-on.
  ctx.beginPath(); ctx.ellipse(-0.04, -0.3, 0.05, 0.085, 0, 0, Math.PI * 2)
  paint(ctx, s, cel(ctx, -0.09, 0, 0.01, 0, TOY.yellow, 0.3, 0.7), 0.028)
  ctx.strokeStyle = TOY.yellow.shade
  ctx.lineWidth = W(s, 0.016)
  ctx.beginPath(); ctx.ellipse(-0.04, -0.3, 0.028, 0.055, 0, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = W(s, 0.014)
  ctx.beginPath()
  ctx.moveTo(-0.1, -0.23); ctx.lineTo(-0.1, -0.2)
  ctx.moveTo(0.02, -0.23); ctx.lineTo(0.02, -0.2)
  ctx.stroke()
  ctx.restore()
}

// ─── Bucket & Spade (repair) ────────────────────────────────────────────────

/** A little green bucket with a first-aid cross, a yellow spade leaning on it. */
export const drawBucketSpade = (ctx: CanvasRenderingContext2D, s: number): void => {
  ctx.save()
  ctx.scale(s, s)
  // Handle arching over the bucket.
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-0.3, -0.29)
  ctx.quadraticCurveTo(-0.13, -0.6, 0.05, -0.29)
  ctx.strokeStyle = INK; ctx.lineWidth = W(s, 0.05); ctx.stroke()
  ctx.strokeStyle = TOY.yellow.base; ctx.lineWidth = W(s, 0.026); ctx.stroke()

  // Bucket.
  ctx.beginPath()
  ctx.moveTo(-0.31, -0.29)
  ctx.lineTo(0.06, -0.29)
  ctx.lineTo(0.02, 0.02)
  ctx.quadraticCurveTo(0.02, 0.04, 0.0, 0.04)
  ctx.lineTo(-0.25, 0.04)
  ctx.quadraticCurveTo(-0.27, 0.04, -0.27, 0.02)
  ctx.closePath()
  paint(ctx, s, cel(ctx, -0.31, 0, 0.06, 0, TOY.green, 0.24, 0.68))
  rrect(ctx, -0.33, -0.34, 0.41, 0.07, 0.03)
  paint(ctx, s, cel(ctx, 0, -0.34, 0, -0.27, TOY.yellow))
  // First-aid cross sticker: the repair tell.
  const cx = -0.125, cy = -0.12, a = 0.035, b = 0.1
  ctx.beginPath()
  ctx.moveTo(cx - a, cy - b); ctx.lineTo(cx + a, cy - b); ctx.lineTo(cx + a, cy - a)
  ctx.lineTo(cx + b, cy - a); ctx.lineTo(cx + b, cy + a); ctx.lineTo(cx + a, cy + a)
  ctx.lineTo(cx + a, cy + b); ctx.lineTo(cx - a, cy + b); ctx.lineTo(cx - a, cy + a)
  ctx.lineTo(cx - b, cy + a); ctx.lineTo(cx - b, cy - a); ctx.lineTo(cx - a, cy - a)
  ctx.closePath()
  paint(ctx, s, '#ffffff', 0.022)
  gloss(ctx, s, -0.27, -0.24, -0.25, -0.02, 0.026, 0.55)

  // Spade leaning in front of the bucket's right side.
  tube(ctx, s, [[0.3, -0.42], [0.17, -0.13]], 0.045, TOY.yellow.base)
  tube(ctx, s, [[0.24, -0.45], [0.36, -0.4]], 0.045, TOY.yellow.base)
  ctx.beginPath()
  ctx.moveTo(0.11, -0.16)
  ctx.lineTo(0.24, -0.1)
  ctx.quadraticCurveTo(0.23, 0.02, 0.12, 0.06)
  ctx.quadraticCurveTo(0.05, 0.0, 0.11, -0.16)
  ctx.closePath()
  paint(ctx, s, cel(ctx, 0.06, 0, 0.24, 0, TOY.orange, 0.26, 0.66))
  ctx.restore()
}

const withA = (hex: string, a: number): string => {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

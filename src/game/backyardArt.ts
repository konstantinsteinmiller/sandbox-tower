/**
 * ─── Backyard backdrop (Sandbox Tower) ──────────────────────────────────────
 *
 * The world behind the sandcastle: a summer back garden seen from inside the
 * sandbox. Every painter here draws into the CACHED background canvas that
 * `renderBackground` in `useTowerArt.ts` owns, so none of it is paid per frame
 * — except `paintStars` and `paintFireflies`, which are a handful of rects and
 * small blits, and only do anything at night.
 *
 * Layer map (old → new), back to front:
 *
 *   clouds                                         (new, parallax 0.04)
 *   far mountains  → house roofs + garden trees     `paintYardFar`   (0.10)
 *   near mountains → leafy trees, hedge, washing
 *                    line, white picket fence       `paintYardNear`  (0.18)
 *   far tree line  → flower-bed foliage, tall grass `paintBedBack`   (0.26)
 *   forest trees   → sunflowers / hollyhocks and
 *                    tulip, daisy, dandelion and
 *                    clover clumps                  `paintTallFlower`,
 *                                                   `paintFlowerClump` (0.34)
 *   horizon line   → the sandbox's far plank edge   `paintSandboxFrame` (1.0)
 *   meadow         → sand, pebbles, shells, toys    `paintSand`      (1.0)
 *   lake           → paddling-pool moat + wet bank  `paintMoat`      (1.0)
 *
 * Colour: every scenery colour goes through `T()`, which applies the current
 * scene light (golden hour, summer night, the boss-wave storm sunset) and an
 * optional pull toward the horizon colour for distance. The light is set ONCE
 * per re-bake (`setBackyardLight`) and the results are memoised, so tinting is
 * a map lookup, never a per-frame cost.
 *
 * Placement is anchored to the WORLD (slot index × step − scroll), never to the
 * screen, so nothing shimmers while the camera pans.
 */
import { stroke as inkStroke, type Pt } from '@/game/inkArt'

const TAU = Math.PI * 2
const INK = '#3b2a21'

type RGB = readonly [number, number, number]

/** '#rrggbb' or 'rgb(r,g,b)' / 'rgba(…)' → channels. `mixHex` returns rgb(), hence both. */
export const toRgb = (s: string): RGB => {
  if (s.charCodeAt(0) === 35) {
    const p = parseInt(s.slice(1, 7), 16)
    return [(p >> 16) & 255, (p >> 8) & 255, p & 255]
  }
  const m = s.match(/-?[\d.]+/g)
  return m && m.length >= 3 ? [+m[0]!, +m[1]!, +m[2]!] : [0, 0, 0]
}

const css = (r: number, g: number, b: number, a = 1): string =>
  a >= 1
    ? `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`
    : `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`

/** Blend two CSS colours (hex or rgb()), returning rgb(). */
export const mixCss = (a: string, b: string, t: number): string => {
  const x = toRgb(a)
  const y = toRgb(b)
  return css(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t)
}

/** Any CSS colour (hex or rgb()) at an alpha. */
export const cssAlpha = (s: string, a: number): string => {
  const c = toRgb(s)
  return css(c[0], c[1], c[2], a)
}

const smooth01 = (t: number): number => {
  const u = Math.max(0, Math.min(1, t))
  return u * u * (3 - 2 * u)
}

/** Deterministic 0..1 hash — the same one `useTowerArt` uses for placement. */
const hash = (n: number): number => {
  const s = Math.sin(n * 127.1) * 43758.5453
  return s - Math.floor(s)
}

/** Slot range covering the screen for a world-anchored row of `step` px. */
const slots = (scroll: number, w: number, step: number, margin = 2): [number, number] =>
  [Math.floor(scroll / step) - margin, Math.ceil((scroll + w) / step) + margin]

// ─── Scene light ────────────────────────────────────────────────────────────

/**
 * How deep into the night a day phase is: 0 = full day, 1 = summer night.
 * Phase: 0 sunrise, 0.25 noon, 0.5 sunset, 0.75 midnight.
 */
export const nightOf = (p: number): number => {
  if (p < 0.06) return 0.32 * (1 - smooth01(p / 0.06))
  if (p < 0.46) return 0
  if (p < 0.62) return smooth01((p - 0.46) / 0.16)
  if (p < 0.9) return 1
  return 1 - 0.68 * smooth01((p - 0.9) / 0.1)
}

/** Golden-hour warmth: the late afternoon into sunset, and a little at dawn. */
export const warmOf = (p: number): number => {
  const bump = (c: number, w: number): number => {
    const d = (p - c) / w
    return d * d >= 1 ? 0 : (1 - d * d) * (1 - d * d)
  }
  return Math.min(1, bump(0.44, 0.12) + 0.5 * (bump(0, 0.07) + bump(1, 0.07)))
}

/**
 * The boss-wave storm sunset, 0..1 over the night half of the cycle. Eased in
 * and out rather than switched, so a boss wave rolls a storm in instead of
 * cutting to it.
 */
export const stormOf = (p: number): number =>
  p < 0.44 ? 0 : p < 0.54 ? smooth01((p - 0.44) / 0.1) : p < 0.94 ? 1 : 1 - smooth01((p - 0.94) / 0.06)

/** The storm sky the boss override blends toward: [top, mid, horizon]. */
export const STORM_SKY: readonly [string, string, string] = ['#3a2466', '#94508e', '#ff9448']

const WARM: RGB = [255, 196, 138]
const NIGHT: RGB = [88, 100, 196]
const STORM: RGB = [232, 146, 176]

let night = 0
let warm = 0
let storm = 0
let haze: RGB = [214, 240, 255]
const memo = new Map<string, string>()

/** Set the light the next re-bake is painted under. */
export const setBackyardLight = (phase: number, horizon: string, stormAmt: number): void => {
  storm = stormAmt
  night = nightOf(phase) * (1 - stormAmt * 0.55)
  warm = Math.max(warmOf(phase), stormAmt * 0.6)
  haze = toRgb(horizon)
  memo.clear()
}

/** The night factor the backdrop was last baked under (drives the fireflies). */
export const backyardNight = (): number => night

/**
 * A scenery colour under the current light. `atmos` pulls it toward the
 * horizon colour — distance — and `alpha` makes it translucent.
 */
export const T = (hex: string, atmos = 0, alpha = 1): string => {
  const key = `${hex}|${atmos}|${alpha}`
  const hit = memo.get(key)
  if (hit) return hit
  const c = toRgb(hex)
  let r = c[0]
  let g = c[1]
  let b = c[2]
  const mul = (k: number, m: RGB): void => {
    r *= 1 - k + (k * m[0]) / 255
    g *= 1 - k + (k * m[1]) / 255
    b *= 1 - k + (k * m[2]) / 255
  }
  if (warm > 0) mul(warm * 0.28, WARM)
  if (storm > 0) mul(storm * 0.42, STORM)
  if (night > 0) mul(night * 0.62, NIGHT)
  if (atmos > 0) {
    r += (haze[0] - r) * atmos
    g += (haze[1] - g) * atmos
    b += (haze[2] - b) * atmos
  }
  const out = css(r, g, b, alpha)
  memo.set(key, out)
  return out
}

// ─── Shape helpers ──────────────────────────────────────────────────────────

/**
 * Add discs to a path, given as flat (x, y, r) triples. Each disc is scaled by
 * `k`, grown by `grow` px and moved by (`fx`, `fy`) × its OWN radius — so a lit
 * pass can nudge every disc up-left by an amount that keeps it inside itself.
 */
const discs = (
  c: PathSink, d: readonly number[], grow = 0, fx = 0, fy = 0, k = 1
): void => {
  for (let i = 0; i + 2 < d.length; i += 3) {
    const r0 = d[i + 2]!
    const r = r0 * k + grow
    if (r <= 0.25) continue
    const x = d[i]! + fx * r0
    const y = d[i + 1]! + fy * r0
    c.moveTo(x + r, y)
    c.arc(x, y, r, 0, TAU)
  }
}

interface PuffStyle {
  ink: string
  lw: number
  shade: string
  base: string
  lit?: string
  /** A rectangle unioned with the discs — a hedge's or a bed's body. */
  rect?: readonly [number, number, number, number]
  /** Where the lit part of the rectangle starts, below its top (px). */
  rectLitDrop?: number
}

/**
 * A cel-shaded clump of overlapping discs with ONE ink outline round the union:
 * the discs grown by the line width in ink, the body in the shade tone, then
 * the lit mass — every disc shrunk and nudged up-left, which by construction
 * stays inside the disc it came from — so the shade survives only as a
 * crescent along each disc's lower right. No clip, four fills, however many
 * discs: this is what every bush, crown and cloud is.
 */
const puff = (c: CanvasRenderingContext2D, d: readonly number[], s: PuffStyle): void => {
  const R = s.rect
  c.beginPath()
  discs(c, d, s.lw)
  if (R) c.rect(R[0] - s.lw, R[1] - s.lw, R[2] + s.lw * 2, R[3] + s.lw * 2)
  c.fillStyle = s.ink
  c.fill()
  c.beginPath()
  discs(c, d)
  if (R) c.rect(R[0], R[1], R[2], R[3])
  c.fillStyle = s.shade
  c.fill()
  // Shift 0.1r left, 0.125r up (0.16r in all) at 0.83r: always inside.
  c.beginPath()
  discs(c, d, 0, -0.1, -0.125, 0.83)
  if (R) {
    const drop = s.rectLitDrop ?? 0
    c.rect(R[0], R[1] + drop, R[2], R[3] - drop)
  }
  c.fillStyle = s.base
  c.fill()
  if (s.lit) {
    c.beginPath()
    discs(c, d, 0, -0.26, -0.3, 0.46)
    c.fillStyle = s.lit
    c.fill()
  }
}

/** A pointed leaf from (x, y) along `ang`, added to the current path. */
const leafPath = (
  c: PathSink, x: number, y: number, len: number, ang: number, wid: number
): void => {
  const ca = Math.cos(ang)
  const sa = Math.sin(ang)
  const tx = x + ca * len
  const ty = y + sa * len
  const mx = x + ca * len * 0.45
  const my = y + sa * len * 0.45
  const nx = -sa * wid
  const ny = ca * wid
  c.moveTo(x, y)
  c.quadraticCurveTo(mx + nx, my + ny, tx, ty)
  c.quadraticCurveTo(mx - nx, my - ny, x, y)
}

/** An ellipse as its own sub-path (no joining line from the previous one). */
const ellipsePath = (
  c: PathSink, x: number, y: number, rx: number, ry: number, rot: number
): void => {
  c.moveTo(x + Math.cos(rot) * rx, y + Math.sin(rot) * rx)
  c.ellipse(x, y, rx, ry, rot, 0, TAU)
}

/**
 * A petal radiating from (cx, cy) at angle `a`, from `r0` out to `r1`, `wid`
 * wide — two quadratics, a good deal cheaper to fill than a rotated ellipse.
 */
const petalPath = (
  c: PathSink, cx: number, cy: number, a: number, r0: number, r1: number, wid: number
): void => {
  leafPath(c, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, r1 - r0, a, wid)
}

/** A spiky ring — petals as a star polygon, all straight segments. */
const starPath = (
  c: PathSink, cx: number, cy: number, rOut: number, rIn: number, n: number, rot: number
): void => {
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i / (n * 2)) * TAU
    const r = i % 2 === 0 ? rOut : rIn
    if (i === 0) c.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    else c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
  }
  c.closePath()
}

/** A world-anchored wobbly horizontal line, for a pen contour along an edge. */
const edgeLine = (
  scroll: number, w: number, y: number, step: number, amp: number, seed: number
): Pt[] => {
  const [k0, k1] = slots(scroll, w, step, 1)
  const pts: Pt[] = []
  for (let k = k0; k <= k1; k++) pts.push([k * step - scroll, y + (hash(k * 1.73 + seed) - 0.5) * amp])
  return pts
}

// ─── Sky: sun, moon, stars, clouds ──────────────────────────────────────────

/**
 * The friendly sun, centred on (x, y): a soft halo, a fan of rounded rays, an
 * inked disc and a sleepy little smile. Baked once per size by the caller.
 */
export const paintSunSprite = (
  c: CanvasRenderingContext2D, x: number, y: number, r: number, tier: number
): void => {
  const halo = c.createRadialGradient(x, y, r * 0.8, x, y, r * 3.1)
  halo.addColorStop(0, 'rgba(255,230,140,0.55)')
  halo.addColorStop(1, 'rgba(255,230,140,0)')
  c.fillStyle = halo
  c.beginPath()
  c.arc(x, y, r * 3.1, 0, TAU)
  c.fill()

  // Rays: long and short alternating, round-tipped — a child's-drawing sun,
  // turned a little per wave tier so consecutive tiers never look identical.
  const n = 12
  c.beginPath()
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + tier * 0.21
    const long = i % 2 === 0
    const r0 = r * 1.16
    const r1 = r * (long ? 1.95 : 1.58)
    const hw = long ? 0.14 : 0.115
    c.moveTo(x + Math.cos(a - hw) * r0, y + Math.sin(a - hw) * r0)
    c.lineTo(x + Math.cos(a - hw * 0.3) * r1 * 0.96, y + Math.sin(a - hw * 0.3) * r1 * 0.96)
    c.quadraticCurveTo(
      x + Math.cos(a) * r1 * 1.03, y + Math.sin(a) * r1 * 1.03,
      x + Math.cos(a + hw * 0.3) * r1 * 0.96, y + Math.sin(a + hw * 0.3) * r1 * 0.96
    )
    c.lineTo(x + Math.cos(a + hw) * r0, y + Math.sin(a + hw) * r0)
    c.closePath()
  }
  c.fillStyle = '#ffd84a'
  c.fill()
  c.strokeStyle = 'rgba(214,122,40,0.85)'
  c.lineWidth = Math.max(1, r * 0.06)
  c.lineJoin = 'round'
  c.stroke()

  const disc = c.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r)
  disc.addColorStop(0, '#fff8cf')
  disc.addColorStop(0.55, '#ffd940')
  disc.addColorStop(1, '#ffb42c')
  c.fillStyle = disc
  c.beginPath()
  c.arc(x, y, r, 0, TAU)
  c.fill()
  c.strokeStyle = '#d9782a'
  c.lineWidth = Math.max(1, r * 0.08)
  c.stroke()

  c.lineCap = 'round'
  c.strokeStyle = 'rgba(255,255,255,0.7)'
  c.lineWidth = Math.max(1, r * 0.1)
  c.beginPath()
  c.arc(x, y, r * 0.76, Math.PI * 1.05, Math.PI * 1.42)
  c.stroke()

  // The face: happy closed eyes, a small smile, rosy cheeks.
  c.strokeStyle = '#b8601f'
  c.lineWidth = Math.max(1, r * 0.085)
  c.beginPath()
  c.arc(x - r * 0.32, y + r * 0.02, r * 0.13, Math.PI * 1.1, Math.PI * 1.9)
  c.moveTo(x + r * 0.32 + Math.cos(Math.PI * 1.1) * r * 0.13, y + r * 0.02 + Math.sin(Math.PI * 1.1) * r * 0.13)
  c.arc(x + r * 0.32, y + r * 0.02, r * 0.13, Math.PI * 1.1, Math.PI * 1.9)
  c.moveTo(x + Math.cos(Math.PI * 0.2) * r * 0.26, y + r * 0.14 + Math.sin(Math.PI * 0.2) * r * 0.26)
  c.arc(x, y + r * 0.14, r * 0.26, Math.PI * 0.2, Math.PI * 0.8)
  c.stroke()
  c.fillStyle = 'rgba(255,120,96,0.38)'
  c.beginPath()
  ellipsePath(c, x - r * 0.56, y + r * 0.24, r * 0.15, r * 0.1, 0)
  ellipsePath(c, x + r * 0.56, y + r * 0.24, r * 0.15, r * 0.1, 0)
  c.fill()
}

/** The soft moon: a cream disc, a lavender crescent of shade and a sleepy face. */
export const paintMoonSprite = (c: CanvasRenderingContext2D, x: number, y: number, r: number): void => {
  const halo = c.createRadialGradient(x, y, r * 0.8, x, y, r * 3.1)
  halo.addColorStop(0, 'rgba(222,218,255,0.5)')
  halo.addColorStop(1, 'rgba(222,218,255,0)')
  c.fillStyle = halo
  c.beginPath()
  c.arc(x, y, r * 3.1, 0, TAU)
  c.fill()

  const disc = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r)
  disc.addColorStop(0, '#fffcee')
  disc.addColorStop(0.6, '#f6ecd0')
  disc.addColorStop(1, '#e6d6b2')
  c.fillStyle = disc
  c.beginPath()
  c.arc(x, y, r, 0, TAU)
  c.fill()

  c.save()
  c.beginPath()
  c.arc(x, y, r, 0, TAU)
  c.clip()
  // Crescent of shade on the right: the moon minus a slightly offset disc.
  c.fillStyle = 'rgba(150,138,210,0.3)'
  c.beginPath()
  c.arc(x, y, r, 0, TAU)
  c.arc(x - r * 0.3, y - r * 0.1, r * 1.02, 0, TAU)
  c.fill('evenodd')
  // A few soft craters, kept off the face.
  c.fillStyle = 'rgba(206,188,150,0.55)'
  c.beginPath()
  ellipsePath(c, x - r * 0.45, y - r * 0.52, r * 0.16, r * 0.13, 0)
  ellipsePath(c, x + r * 0.5, y - r * 0.4, r * 0.11, r * 0.09, 0)
  ellipsePath(c, x + r * 0.18, y + r * 0.66, r * 0.13, r * 0.09, 0)
  c.fill()
  c.restore()

  c.strokeStyle = 'rgba(170,150,112,0.9)'
  c.lineWidth = Math.max(1, r * 0.06)
  c.beginPath()
  c.arc(x, y, r, 0, TAU)
  c.stroke()

  // Sleeping: closed eyes curving down, a tiny smile.
  c.lineCap = 'round'
  c.strokeStyle = 'rgba(150,126,90,0.9)'
  c.lineWidth = Math.max(1, r * 0.07)
  c.beginPath()
  c.moveTo(x - r * 0.42, y - r * 0.02)
  c.quadraticCurveTo(x - r * 0.3, y + r * 0.1, x - r * 0.18, y - r * 0.02)
  c.moveTo(x + r * 0.14, y - r * 0.02)
  c.quadraticCurveTo(x + r * 0.26, y + r * 0.1, x + r * 0.38, y - r * 0.02)
  c.moveTo(x - r * 0.12, y + r * 0.28)
  c.quadraticCurveTo(x - r * 0.02, y + r * 0.36, x + r * 0.08, y + r * 0.28)
  c.stroke()
  c.fillStyle = 'rgba(255,150,160,0.3)'
  c.beginPath()
  ellipsePath(c, x - r * 0.52, y + r * 0.2, r * 0.13, r * 0.08, 0)
  ellipsePath(c, x + r * 0.46, y + r * 0.2, r * 0.13, r * 0.08, 0)
  c.fill()
}

/**
 * Stars, painted live over the sky gradient at night. Three twinkle groups,
 * one fill each — a few dozen rects, no gradients.
 */
export const paintStars = (
  c: CanvasRenderingContext2D, w: number, skyH: number, amount: number, t: number
): void => {
  if (amount < 0.03 || skyH <= 0) return
  const n = Math.min(84, Math.round(w / 13))
  for (let grp = 0; grp < 3; grp++) {
    const tw = 0.62 + 0.38 * Math.sin(t / 900 + grp * 2.1)
    c.fillStyle = `rgba(255,246,214,${(Math.min(1, amount) * tw).toFixed(3)})`
    c.beginPath()
    for (let i = grp; i < n; i += 3) {
      const x = hash(i * 3.71 + 0.5) * w
      const y = Math.pow(hash(i * 9.13 + 0.2), 1.35) * skyH * 0.82
      const s = 1 + hash(i * 5.57) * 1.5
      c.rect(x - s / 2, y - s / 2, s, s)
      if (i % 7 === 0) {
        const L = s * 2.4
        c.rect(x - L, y - 0.4, L * 2, 0.8)
        c.rect(x - 0.4, y - L, 0.8, L * 2)
      }
    }
    c.fill()
  }
}

/** One cumulus: a flat-ish row of small puffs under a crown of bigger ones. */
const cloud = (c: CanvasRenderingContext2D, cx: number, cy: number, cw: number, k: number): void => {
  const n = 4 + Math.floor(hash(k * 1.3) * 3)
  const d: number[] = []
  const base = cw * 0.15
  for (let i = 0; i <= n; i++) {
    const f = i / n - 0.5
    d.push(cx + f * cw * 0.84, cy, base * (0.85 + hash(k * 9 + i) * 0.3))
  }
  for (let i = 0; i < n - 1; i++) {
    const f = (i + 0.5) / (n - 1) - 0.5
    const r = cw * (0.21 - Math.abs(f) * 0.17) * (0.85 + hash(k * 13 + i) * 0.35)
    d.push(cx + f * cw * 0.72, cy - r * 0.72 - base * 0.25, r)
  }
  const stormy = storm > 0.05
  puff(c, d, stormy
    ? {
        ink: T('#2e1d40', 0, 0.5), lw: Math.max(1, cw * 0.01),
        // Lit from below by the storm sunset: the "shade" crescent is the glow.
        shade: T('#ff9a5c'), base: T('#6e4f8c')
      }
    : {
        ink: T('#6d7db6', 0.25, 0.4), lw: Math.max(1, cw * 0.01),
        shade: T('#c3cff0', 0.12), base: T('#ffffff', 0.04)
      })
}

/** Summer clouds, far back (parallax ≈ 0.04). A storm brings more of them. */
export const paintClouds = (
  c: CanvasRenderingContext2D, w: number, h: number, groundY: number, scroll: number
): void => {
  if (groundY < h * 0.2) return
  const S = Math.max(w * 0.42, h * 0.46)
  const [k0, k1] = slots(scroll, w, S, 1)
  const stormy = storm > 0.05
  for (let k = k0; k <= k1; k++) {
    if (!stormy && hash(k * 3.71 + 1) < 0.32) continue
    const cw = S * (0.34 + hash(k * 5.3) * 0.24) * (stormy ? 1.35 : 1)
    const cx = k * S - scroll + hash(k * 2.9) * S * 0.5
    const cy = groundY * (0.12 + hash(k * 7.7) * 0.26)
    cloud(c, cx, cy, cw, k)
  }
}

// ─── Far yard: houses and garden trees (was: far mountains) ─────────────────

const FAR_WALLS = ['#f4e4c6', '#cfe1ee', '#f6e6a8', '#f2d2c4', '#e2ecd0'] as const
const FAR_ROOFS: ReadonlyArray<readonly [string, string]> = [
  ['#d0694c', '#a94f3a'], ['#7289ad', '#56688c'], ['#b8584a', '#8e4036'], ['#8d6f9e', '#6c547d']
]

const farHouse = (
  c: CanvasRenderingContext2D, x: number, g: number, U: number, h: number, k: number
): void => {
  const A = 0.42
  const lw = Math.max(1, U * 0.03)
  const inkC = T(INK, 0.5, 0.5)
  const wallW = U * (2.3 + hash(k * 3.1) * 0.9)
  const wallH = h * (0.23 + hash(k * 5.7) * 0.05)
  const l = x - wallW / 2
  const r = x + wallW / 2
  const top = g - wallH
  const wall = FAR_WALLS[Math.floor(hash(k * 2.2) * FAR_WALLS.length)]!
  const [roof, roofShade] = FAR_ROOFS[Math.floor(hash(k * 6.6) * FAR_ROOFS.length)]!
  const gable = hash(k * 8.3) < 0.55
  const ov = U * 0.16
  const rh = gable ? wallW * 0.34 : U * 0.95
  const eave = top + U * 0.04
  const roofYAt = (px: number): number => {
    if (gable) return eave - rh * Math.max(0, 1 - Math.abs(px - x) / (wallW / 2 + ov))
    const inset = U * 0.5
    if (px < l + inset) return eave - rh * Math.max(0, (px - l + ov) / (inset + ov))
    if (px > r - inset) return eave - rh * Math.max(0, (r + ov - px) / (inset + ov))
    return top - rh
  }

  // Chimney first, so the roof overlaps its foot.
  const chx = x + wallW * (gable ? 0.2 : 0.26) * (hash(k * 4.4) < 0.5 ? -1 : 1)
  const chTop = roofYAt(chx) - U * 0.34
  const chH = roofYAt(chx) - chTop + U * 0.2
  c.fillStyle = T('#b8674d', A)
  c.fillRect(chx - U * 0.14, chTop, U * 0.28, chH)
  c.strokeStyle = inkC
  c.lineWidth = lw
  c.strokeRect(chx - U * 0.14, chTop, U * 0.28, chH)
  c.fillStyle = T('#8e4b3a', A)
  c.fillRect(chx - U * 0.19, chTop - U * 0.07, U * 0.38, U * 0.09)

  // Wall, with the shadow the eaves throw across its top.
  c.fillStyle = T(wall, A)
  c.fillRect(l, top, wallW, g - top + 2)
  c.fillStyle = T('#5b4a7a', A, 0.2)
  c.fillRect(l, top, wallW, U * 0.2)
  c.fillStyle = T('#5b4a7a', A, 0.12)
  c.fillRect(r - wallW * 0.16, top, wallW * 0.16, g - top + 2)
  c.strokeStyle = inkC
  c.strokeRect(l, top, wallW, g - top + 2)

  // Upper-floor windows — the ground floor is behind the hedge anyway. At
  // night a few are lit: someone is home.
  const cols = wallW > U * 2.9 ? 3 : 2
  const ww = U * 0.4
  const wh = U * 0.5
  const wy = top + U * 0.38
  const glass = T('#a6d8f2', A)
  c.beginPath()
  for (let i = 0; i < cols; i++) {
    const wx = l + (wallW * (i + 0.5)) / cols
    c.rect(wx - ww / 2 - U * 0.05, wy - U * 0.05, ww + U * 0.1, wh + U * 0.1)
  }
  c.fillStyle = T('#ffffff', A)
  c.fill()
  c.stroke()
  for (let i = 0; i < cols; i++) {
    const wx = l + (wallW * (i + 0.5)) / cols
    const lit = night > 0.3 && hash(k * 11 + i) > 0.45
    c.fillStyle = lit ? mixCss(glass, '#ffd27a', Math.min(1, night * 1.1)) : glass
    c.fillRect(wx - ww / 2, wy, ww, wh)
  }
  c.beginPath()
  for (let i = 0; i < cols; i++) {
    const wx = l + (wallW * (i + 0.5)) / cols
    c.moveTo(wx, wy)
    c.lineTo(wx, wy + wh)
    c.moveTo(wx - ww / 2, wy + wh * 0.45)
    c.lineTo(wx + ww / 2, wy + wh * 0.45)
  }
  c.strokeStyle = T('#ffffff', A)
  c.lineWidth = Math.max(1, U * 0.04)
  c.stroke()

  // Roof.
  c.beginPath()
  if (gable) {
    c.moveTo(l - ov, eave)
    c.lineTo(x, top - rh)
    c.lineTo(r + ov, eave)
  } else {
    c.moveTo(l - ov, eave)
    c.lineTo(l + U * 0.5, top - rh)
    c.lineTo(r - U * 0.5, top - rh)
    c.lineTo(r + ov, eave)
  }
  c.closePath()
  c.fillStyle = T(roof, A)
  c.fill()
  c.strokeStyle = inkC
  c.lineWidth = lw
  c.stroke()
  c.fillStyle = T(roofShade, A)
  c.beginPath()
  if (gable) {
    c.moveTo(x, top - rh)
    c.lineTo(r + ov, eave)
    c.lineTo(x, eave)
    c.closePath()
    c.fill()
    // A round attic window in the gable.
    c.beginPath()
    c.arc(x, eave - rh * 0.4, U * 0.12, 0, TAU)
    c.fillStyle = T('#ffffff', A)
    c.fill()
    c.stroke()
    c.beginPath()
    c.arc(x, eave - rh * 0.4, U * 0.075, 0, TAU)
    c.fillStyle = night > 0.3 && hash(k * 17) > 0.5 ? mixCss(glass, '#ffd27a', night) : glass
    c.fill()
  } else {
    // Tile courses across a side-gabled roof.
    c.rect(l - ov * 0.6, eave - U * 0.12, wallW + ov * 1.2, U * 0.12)
    c.fill()
    c.beginPath()
    for (let i = 1; i <= 2; i++) {
      const yy = eave - (rh * i) / 3
      c.moveTo(l - ov + (U * 0.5 + ov) * (i / 3), yy)
      c.lineTo(r + ov - (U * 0.5 + ov) * (i / 3), yy)
    }
    c.strokeStyle = T(roofShade, A)
    c.lineWidth = Math.max(1, U * 0.035)
    c.stroke()
  }
}

const farTree = (
  c: CanvasRenderingContext2D, x: number, g: number, U: number, h: number, k: number
): void => {
  const A = 0.4
  const lw = Math.max(1, U * 0.028)
  const tall = hash(k * 9.7) < 0.3
  const H = h * (0.24 + hash(k * 6.1) * 0.12)
  c.fillStyle = T('#7d5d48', A)
  c.fillRect(x - U * 0.07, g - H * 0.55, U * 0.14, H * 0.55)
  const d: number[] = []
  if (tall) {
    // A poplar: a stack of narrow puffs.
    const R = U * (0.34 + hash(k * 2.9) * 0.12)
    for (let i = 0; i < 4; i++) {
      d.push(x + (hash(k * 3 + i) - 0.5) * R * 0.4, g - H + R + i * R * 0.95, R * (1 + i * 0.06))
    }
  } else {
    const R = U * (0.55 + hash(k * 2.9) * 0.3)
    const cy = g - H + R
    d.push(
      x, cy, R,
      x - R * 0.8, cy + R * 0.55, R * 0.72,
      x + R * 0.82, cy + R * 0.5, R * 0.78,
      x - R * 0.25, cy + R * 0.95, R * 0.7,
      x + R * 0.35, cy + R * 1.0, R * 0.66
    )
  }
  puff(c, d, {
    ink: T(INK, 0.5, 0.45), lw,
    shade: T('#4c8f4a', A), base: T('#6fb35a', A), lit: T('#94cf73', A)
  })
}

/** The neighbours' trees as one pale bumpy line, just showing over the hedge. */
const farCanopy = (
  c: CanvasRenderingContext2D, w: number, g: number, U: number, h: number, scroll: number
): void => {
  const step = U * 0.7
  const [k0, k1] = slots(scroll, w, step)
  const d: number[] = []
  for (let k = k0; k <= k1; k++) {
    d.push(k * step - scroll, g - h * 0.165 - hash(k * 2.71 + 3) * U * 0.3, U * (0.38 + hash(k * 1.37 + 5) * 0.28))
  }
  const top = g - h * 0.165
  puff(c, d, {
    ink: T(INK, 0.55, 0.35), lw: Math.max(1, U * 0.026),
    shade: T('#5a9a55', 0.48), base: T('#78b866', 0.48),
    rect: [-4, top, w + 8, g - top + 2], rectLitDrop: U * 0.2
  })
}

/**
 * The far layer (parallax 0.1): house fronts and roof lines, garden trees in
 * front of them, and the neighbours' canopy along the bottom. Pale — the
 * horizon colour is mixed into every tone — so it sits back.
 */
export const paintYardFar = (
  c: CanvasRenderingContext2D, w: number, h: number, groundY: number, scroll: number
): void => {
  const U = h * 0.1
  const S = U * 3.3
  const [k0, k1] = slots(scroll, w, S)
  const at = (k: number): number => k * S - scroll + (hash(k * 1.9) - 0.5) * S * 0.3
  for (let k = k0; k <= k1; k++) {
    if (hash(k * 7.13 + 2) < 0.46) farHouse(c, at(k), groundY, U, h, k)
  }
  for (let k = k0; k <= k1; k++) {
    if (hash(k * 7.13 + 2) >= 0.46) farTree(c, at(k), groundY, U, h, k)
    // Now and then a tree standing in front of a house corner.
    else if (hash(k * 4.1 + 6) > 0.62) farTree(c, at(k) + S * 0.5, groundY, U, h, k + 0.5)
  }
  farCanopy(c, w, groundY, U, h, scroll)
}

// ─── Near yard: trees, hedge, washing line, picket fence (was: near mountains)

const nearTree = (
  c: CanvasRenderingContext2D, x: number, g: number, U: number, h: number, k: number
): void => {
  const A = 0.14
  const H = h * (0.27 + hash(k * 4.9) * 0.07)
  const R = U * (0.8 + hash(k * 3.3) * 0.3)
  const lw = Math.max(1.2, U * 0.034)
  const inkC = T(INK, 0.2, 0.6)
  const cy = g - H + R
  const tw = U * 0.22

  c.beginPath()
  c.moveTo(x - tw * 0.65, g + 2)
  c.lineTo(x - tw * 0.4, cy + R * 0.6)
  c.lineTo(x - R * 0.45, cy + R * 0.2)
  c.lineTo(x - R * 0.36, cy + R * 0.1)
  c.lineTo(x - tw * 0.1, cy + R * 0.45)
  c.lineTo(x + tw * 0.1, cy + R * 0.2)
  c.lineTo(x + R * 0.4, cy + R * 0.05)
  c.lineTo(x + R * 0.48, cy + R * 0.16)
  c.lineTo(x + tw * 0.4, cy + R * 0.62)
  c.lineTo(x + tw * 0.6, g + 2)
  c.closePath()
  c.fillStyle = T('#8a6446', A)
  c.fill()
  c.strokeStyle = inkC
  c.lineWidth = lw
  c.lineJoin = 'round'
  c.stroke()
  c.fillStyle = T('#6a4a34', A)
  c.fillRect(x + tw * 0.12, cy + R * 0.6, tw * 0.4, g - cy - R * 0.6)

  const j = (n: number): number => (hash(k * 7.3 + n) - 0.5) * R * 0.2
  const d = [
    x + j(1), cy + j(2), R,
    x - R * 0.95 + j(3), cy + R * 0.42, R * 0.76,
    x + R * 0.98 + j(4), cy + R * 0.38, R * 0.8,
    x - R * 0.45, cy + R * 0.92 + j(5), R * 0.66,
    x + R * 0.5, cy + R * 0.95 + j(6), R * 0.68,
    x + R * 0.12 + j(7), cy - R * 0.42, R * 0.72
  ]
  puff(c, d, {
    ink: inkC, lw,
    shade: T('#3d8a34', A), base: T('#5fb046', A), lit: T('#8ed061', A)
  })
  // Leaf-cluster ticks, so the crown reads as foliage rather than a balloon.
  c.beginPath()
  for (let i = 0; i < 7; i++) {
    const a = hash(k * 5.1 + i) * TAU
    const rr = R * (0.2 + hash(k * 3.9 + i) * 0.75)
    const tx = x + Math.cos(a) * rr
    const ty = cy + R * 0.3 + Math.sin(a) * rr * 0.8
    const s = R * 0.12
    c.moveTo(tx - s, ty + s * 0.35)
    c.quadraticCurveTo(tx, ty - s * 0.6, tx + s, ty + s * 0.35)
  }
  c.strokeStyle = T('#3d8a34', A, 0.85)
  c.lineWidth = Math.max(1, lw * 0.8)
  c.lineCap = 'round'
  c.stroke()
}

const hedge = (
  c: CanvasRenderingContext2D, w: number, g: number, U: number, h: number, scroll: number
): void => {
  const step = U * 0.44
  const [k0, k1] = slots(scroll, w, step)
  const d: number[] = []
  for (let k = k0; k <= k1; k++) {
    d.push(k * step - scroll, g - h * 0.15 - hash(k * 1.9 + 2) * U * 0.1, U * (0.3 + hash(k * 3.3 + 1) * 0.1))
  }
  const top = g - h * 0.15
  const A = 0.08
  puff(c, d, {
    ink: T(INK, 0.1, 0.55), lw: Math.max(1, U * 0.03),
    shade: T('#2f7a33', A), base: T('#4ea341', A),
    rect: [-4, top, w + 8, g - top + 2], rectLitDrop: U * 0.16
  })
  // Leaf ticks across the face of the hedge.
  const ts = U * 0.3
  const [t0, t1] = slots(scroll, w, ts)
  c.beginPath()
  for (let k = t0; k <= t1; k++) {
    const tx = k * ts - scroll + hash(k * 2.3 + 9) * ts
    const ty = top - U * 0.15 + hash(k * 4.7 + 1) * (g - top) * 0.8
    const s = U * 0.06
    c.moveTo(tx - s, ty + s * 0.35)
    c.quadraticCurveTo(tx, ty - s * 0.6, tx + s, ty + s * 0.35)
  }
  c.strokeStyle = T('#2a6a2e', A, 0.6)
  c.lineWidth = Math.max(1, U * 0.022)
  c.lineCap = 'round'
  c.stroke()
}

const TOY_COLOURS = ['#e5483b', '#ffc93c', '#2f7de1', '#43b649', '#ff8a2b', '#ff6fae', '#8fd3f4'] as const

const washingLine = (
  c: CanvasRenderingContext2D, x: number, g: number, U: number, h: number, k: number
): void => {
  const A = 0.1
  const span = U * (3 + hash(k * 2.2) * 0.8)
  const poleH = h * 0.27
  const x0 = x - span / 2
  const x1 = x + span / 2
  const y0 = g - poleH + U * 0.06
  const lw = Math.max(1, U * 0.028)
  const inkC = T(INK, 0.1, 0.65)

  c.lineCap = 'round'
  c.beginPath()
  for (const xp of [x0, x1]) {
    c.moveTo(xp, g)
    c.lineTo(xp, g - poleH)
    c.moveTo(xp - U * 0.16, g - poleH)
    c.lineTo(xp + U * 0.16, g - poleH)
  }
  c.strokeStyle = inkC
  c.lineWidth = U * 0.09 + lw * 2
  c.stroke()
  c.strokeStyle = T('#ece6da', A)
  c.lineWidth = U * 0.09
  c.stroke()

  const sag = U * 0.3
  c.beginPath()
  c.moveTo(x0, y0)
  c.quadraticCurveTo(x, y0 + sag * 2, x1, y0)
  c.strokeStyle = T('#6b5a50', A, 0.9)
  c.lineWidth = lw
  c.stroke()

  const items = 3 + Math.floor(hash(k * 4.4) * 2)
  for (let i = 0; i < items; i++) {
    const t = (i + 0.75) / (items + 0.5)
    const px = x0 + span * t
    const py = y0 + 4 * sag * t * (1 - t)
    const kind = hash(k * 9 + i * 3.3)
    const col = TOY_COLOURS[Math.floor(hash(k * 5 + i * 1.7) * TOY_COLOURS.length)]!
    c.beginPath()
    if (kind < 0.4) {
      // T-shirt, pegged by the shoulders.
      const sw = U * 0.3
      c.moveTo(px - sw, py)
      c.lineTo(px - sw * 1.45, py + sw * 0.45)
      c.lineTo(px - sw * 1.1, py + sw * 0.7)
      c.lineTo(px - sw * 0.8, py + sw * 0.52)
      c.lineTo(px - sw * 0.78, py + sw * 1.9)
      c.lineTo(px + sw * 0.78, py + sw * 1.9)
      c.lineTo(px + sw * 0.8, py + sw * 0.52)
      c.lineTo(px + sw * 1.1, py + sw * 0.7)
      c.lineTo(px + sw * 1.45, py + sw * 0.45)
      c.lineTo(px + sw, py)
      c.quadraticCurveTo(px, py + sw * 0.45, px - sw, py)
    } else if (kind < 0.72) {
      // Towel.
      c.rect(px - U * 0.24, py, U * 0.48, U * 0.72)
    } else {
      // A pair of socks.
      for (const dx of [-U * 0.13, U * 0.13]) {
        c.moveTo(px + dx - U * 0.08, py)
        c.lineTo(px + dx - U * 0.08, py + U * 0.38)
        c.quadraticCurveTo(px + dx - U * 0.08, py + U * 0.5, px + dx + U * 0.04, py + U * 0.5)
        c.lineTo(px + dx + U * 0.16, py + U * 0.5)
        c.lineTo(px + dx + U * 0.16, py + U * 0.38)
        c.lineTo(px + dx + U * 0.08, py + U * 0.36)
        c.lineTo(px + dx + U * 0.08, py)
        c.closePath()
      }
    }
    c.fillStyle = T(col, A)
    c.fill()
    c.save()
    c.clip()
    c.fillStyle = T('#3a2a5a', A, 0.2)
    c.fillRect(px + U * 0.06, py, U * 0.6, U)
    if (kind >= 0.4 && kind < 0.72) {
      c.fillStyle = T('#ffffff', A, 0.85)
      c.fillRect(px - U * 0.3, py + U * 0.5, U * 0.6, U * 0.06)
      c.fillRect(px - U * 0.3, py + U * 0.6, U * 0.6, U * 0.03)
    }
    c.restore()
    c.strokeStyle = inkC
    c.lineWidth = lw
    c.lineJoin = 'round'
    c.stroke()
    // Pegs.
    c.fillStyle = T('#c99a62', A)
    c.fillRect(px - U * 0.2, py - U * 0.06, U * 0.05, U * 0.12)
    c.fillRect(px + U * 0.15, py - U * 0.06, U * 0.05, U * 0.12)
  }
}

/**
 * White picket fence, pointed pickets on two rails with a post every eighth.
 * Three fills and two strokes for the whole run, however long it is.
 */
const fence = (
  c: CanvasRenderingContext2D, w: number, g: number, U: number, h: number, scroll: number
): void => {
  const P = U * 0.27
  const pw = P * 0.64
  const ph = h * 0.125
  const tip = pw * 0.6
  const lw = Math.max(1, U * 0.028)
  const inkC = T(INK, 0.06, 0.6)
  const [k0, k1] = slots(scroll, w, P)
  const railH = pw * 0.5

  c.beginPath()
  for (const ry of [g - ph * 0.3, g - ph * 0.72]) c.rect(-4, ry - railH / 2, w + 8, railH)
  c.fillStyle = T('#e4dfec', 0.05)
  c.fill()
  c.strokeStyle = inkC
  c.lineWidth = lw
  c.stroke()

  const shape = (k: number): [number, number, number, boolean] => {
    const post = ((k % 8) + 8) % 8 === 0
    const x = k * P - scroll
    const hw = post ? pw * 0.66 : pw / 2
    const top = g - ph * (post ? 1.08 : 1 + (hash(k * 1.3) - 0.5) * 0.05)
    return [x, hw, top, post]
  }
  const body = (): void => {
    c.beginPath()
    for (let k = k0; k <= k1; k++) {
      const [x, hw, top, post] = shape(k)
      c.moveTo(x - hw, g + 2)
      if (post) {
        c.lineTo(x - hw, top)
        c.lineTo(x + hw, top)
      } else {
        c.lineTo(x - hw, top + tip)
        c.lineTo(x, top)
        c.lineTo(x + hw, top + tip)
      }
      c.lineTo(x + hw, g + 2)
      c.closePath()
    }
  }
  body()
  c.fillStyle = T('#fffaf0', 0.04)
  c.fill()
  // Shade down the right-hand side of each picket.
  c.beginPath()
  for (let k = k0; k <= k1; k++) {
    const [x, hw, top, post] = shape(k)
    const sx = x + hw * 0.36
    c.moveTo(sx, g + 2)
    if (post) {
      c.lineTo(sx, top)
      c.lineTo(x + hw, top)
    } else {
      c.lineTo(sx, top + tip * (1 - 0.36))
      c.lineTo(x + hw, top + tip)
    }
    c.lineTo(x + hw, g + 2)
    c.closePath()
  }
  c.fillStyle = T('#d6d0e6', 0.04)
  c.fill()
  body()
  c.strokeStyle = inkC
  c.lineJoin = 'round'
  c.stroke()
  // Post caps.
  c.beginPath()
  for (let k = k0; k <= k1; k++) {
    const [x, hw, top, post] = shape(k)
    if (post) c.rect(x - hw * 1.25, top - pw * 0.28, hw * 2.5, pw * 0.3)
  }
  c.fillStyle = T('#f3eee6', 0.04)
  c.fill()
  c.stroke()
}

/**
 * The near layer (parallax 0.18): big leafy trees behind a clipped hedge, a
 * washing line now and then, and the white picket fence across the front.
 */
export const paintYardNear = (
  c: CanvasRenderingContext2D, w: number, h: number, groundY: number, scroll: number
): void => {
  const U = h * 0.1
  const S = U * 4.4
  const [k0, k1] = slots(scroll, w, S)
  for (let k = k0; k <= k1; k++) {
    if (hash(k * 5.31 + 7) < 0.58) continue
    nearTree(c, k * S - scroll + (hash(k * 2.3) - 0.5) * S * 0.5, groundY, U, h, k)
  }
  hedge(c, w, groundY, U, h, scroll)
  const SW = U * 9
  const [l0, l1] = slots(scroll, w, SW)
  for (let k = l0; k <= l1; k++) {
    if (hash(k * 3.17 + 11) < 0.62) continue
    washingLine(c, k * SW - scroll + hash(k * 6.1) * SW * 0.4, groundY, U, h, k)
  }
  fence(c, w, groundY, U, h, scroll)
}

// ─── The flower bed (was: the forest band) ──────────────────────────────────

/**
 * The bed's foliage and tall grass (parallax 0.26): a low leafy mass the
 * flowers stand in, with grass blades above it.
 */
export const paintBedBack = (
  c: CanvasRenderingContext2D, w: number, h: number, groundY: number, scroll: number
): void => {
  const U = h * 0.1
  const g = groundY
  const step = Math.max(8, U * 0.34)
  const [k0, k1] = slots(scroll, w, step)
  const d: number[] = []
  for (let k = k0; k <= k1; k++) {
    d.push(k * step - scroll, g - h * 0.022 - hash(k * 3.3 + 1) * U * 0.12, U * (0.17 + hash(k * 1.7 + 4) * 0.12))
  }
  const top = g - h * 0.022
  const A = 0.05
  puff(c, d, {
    ink: T(INK, A, 0.5), lw: Math.max(1, U * 0.024),
    shade: T('#2c6b2c', A), base: T('#3f8f37', A),
    rect: [-4, top, w + 8, g - top + 4], rectLitDrop: U * 0.08
  })

  // Tall grass: two tones, one fill each.
  const bs = Math.max(4, U * 0.13)
  const [b0, b1] = slots(scroll, w, bs)
  for (const pass of [0, 1]) {
    c.beginPath()
    for (let k = b0; k <= b1; k++) {
      if ((hash(k * 8.9) > 0.62 ? 1 : 0) !== pass) continue
      const x = k * bs - scroll + (hash(k * 2.2) - 0.5) * bs
      const bh = h * (0.026 + hash(k * 5.9) * 0.04)
      const lean = (hash(k * 7.3) - 0.5) * bh * 0.7
      const bw = Math.max(0.9, U * 0.034)
      c.moveTo(x - bw, g)
      c.quadraticCurveTo(x - bw * 0.3 + lean * 0.2, g - bh * 0.6, x + lean, g - bh)
      c.quadraticCurveTo(x + bw * 0.4 + lean * 0.2, g - bh * 0.55, x + bw, g)
      c.closePath()
    }
    c.fillStyle = pass ? T('#78c455', A) : T('#3a8733', A)
    c.fill()
  }
}

const inkW = (H: number): number => Math.max(0.7, H * 0.022)

/** Round a line width to a quarter pixel, so near-equal widths share a batch. */
const q = (v: number): number => Math.max(0.5, Math.round(v * 4) / 4)

/**
 * The slice of the path API the painters use — satisfied by a 2D context and by
 * the `Rec` recorder below.
 */
interface PathSink {
  moveTo (x: number, y: number): void
  lineTo (x: number, y: number): void
  quadraticCurveTo (cx: number, cy: number, x: number, y: number): void
  arc (x: number, y: number, r: number, a0: number, a1: number): void
  ellipse (x: number, y: number, rx: number, ry: number, rot: number, a0: number, a1: number): void
  closePath (): void
}

/**
 * A recorded path, replayed into the context at flush time. Not `Path2D`:
 * replaying through the context works everywhere a context does (the jsdom
 * test stub included, which also checks every number it is handed).
 */
class Rec implements PathSink {
  readonly d: number[] = []
  moveTo (x: number, y: number): void { this.d.push(0, x, y) }
  lineTo (x: number, y: number): void { this.d.push(1, x, y) }
  quadraticCurveTo (cx: number, cy: number, x: number, y: number): void { this.d.push(2, cx, cy, x, y) }
  arc (x: number, y: number, r: number, a0: number, a1: number): void { this.d.push(3, x, y, r, a0, a1) }
  ellipse (x: number, y: number, rx: number, ry: number, rot: number, a0: number, a1: number): void {
    this.d.push(4, x, y, rx, ry, rot, a0, a1)
  }

  closePath (): void { this.d.push(5) }

  replay (c: CanvasRenderingContext2D): void {
    const d = this.d
    c.beginPath()
    for (let i = 0; i < d.length;) {
      switch (d[i]) {
        case 0: c.moveTo(d[i + 1]!, d[i + 2]!); i += 3; break
        case 1: c.lineTo(d[i + 1]!, d[i + 2]!); i += 3; break
        case 2: c.quadraticCurveTo(d[i + 1]!, d[i + 2]!, d[i + 3]!, d[i + 4]!); i += 5; break
        case 3: c.arc(d[i + 1]!, d[i + 2]!, d[i + 3]!, d[i + 4]!, d[i + 5]!); i += 6; break
        case 4: c.ellipse(d[i + 1]!, d[i + 2]!, d[i + 3]!, d[i + 4]!, d[i + 5]!, d[i + 6]!, d[i + 7]!); i += 8; break
        default: c.closePath(); i += 1
      }
    }
  }
}

/**
 * A flower bed's worth of paths, batched by style.
 *
 * Sixty plants drawn one at a time cost several hundred fills and strokes per
 * re-bake; gathered into one path per colour they cost a few dozen, and at
 * this size nobody can tell which neighbour's petal went down first. Layers
 * flush in `order` (stems, leaves, heads), each filled and then outlined.
 */
class Bed {
  private readonly layers = new Map<string, { o: number; path: Rec; fill?: string; ink?: string; width: number }>()

  constructor (readonly lw: number) {}

  /** The path for a style: filled with `fill`, then outlined in `ink` at `width`. */
  at (o: number, fill?: string, ink?: string, width = 0): Rec {
    const key = `${o}|${fill ?? ''}|${ink ?? ''}|${width}`
    let l = this.layers.get(key)
    if (!l) {
      l = { o, path: new Rec(), fill, ink, width }
      this.layers.set(key, l)
    }
    return l.path
  }

  flush (c: CanvasRenderingContext2D): void {
    const all = [...this.layers.values()].sort((a, b) => a.o - b.o)
    c.lineCap = 'round'
    c.lineJoin = 'round'
    for (const l of all) {
      l.path.replay(c)
      if (l.fill) {
        c.fillStyle = l.fill
        c.fill()
      }
      if (l.ink) {
        c.strokeStyle = l.ink
        c.lineWidth = l.width
        c.stroke()
      }
    }
    this.layers.clear()
  }
}

const bedInk = (): string => T(INK, 0, 0.74)

/** A stem: an ink stroke with the green laid down its middle. */
const stem = (
  b: Bed, x0: number, y0: number, x1: number, y1: number, bend: number, sw: number
): void => {
  const w = q(sw)
  for (const p of [b.at(10, undefined, T(INK, 0, 0.72), q(w + b.lw * 1.8)), b.at(11, undefined, T('#4e9a3a', 0.03), w)]) {
    p.moveTo(x0, y0)
    p.quadraticCurveTo(x0 + bend, (y0 + y1) / 2, x1, y1)
  }
}

const sunflower = (b: Bed, x: number, g: number, H: number, seed: number): void => {
  const lw = b.lw
  const inkC = bedInk()
  const R = H * 0.15
  const lean = (hash(seed * 4.7) - 0.5) * H * 0.16
  const hx = x + lean
  const hy = g - H + R
  stem(b, x, g, hx, hy + R * 0.3, -lean * 0.5, Math.max(1, H * 0.035))
  const lp = b.at(20, T('#56a843', 0.03), inkC, q(lw))
  leafPath(lp, x + lean * 0.2, g - H * 0.36, H * 0.22, Math.PI + 0.45, H * 0.065)
  leafPath(lp, x + lean * 0.4, g - H * 0.54, H * 0.2, -0.42, H * 0.06)

  // A ring of petals over a darker orange disc that shows between them.
  const n = 11
  const back = b.at(40, T('#e8932a', 0.03))
  back.moveTo(hx + R * 0.78, hy)
  back.arc(hx, hy, R * 0.78, 0, TAU)
  const front = b.at(41, T('#ffcf33', 0.03), inkC, q(lw * 0.75))
  starPath(front, hx, hy, R * 0.98, R * 0.58, n, 0)
  const disc = b.at(42, T('#6b3f1f', 0.03), inkC, q(lw))
  disc.moveTo(hx + R * 0.45, hy)
  disc.arc(hx, hy, R * 0.45, 0, TAU)
  const lit = b.at(43, T('#9a5f2c', 0.03))
  lit.moveTo(hx - R * 0.1 + R * 0.22, hy - R * 0.12)
  lit.arc(hx - R * 0.1, hy - R * 0.12, R * 0.22, 0, TAU)
}

const HOLLYHOCK: ReadonlyArray<readonly [string, string]> = [
  ['#ff8fc0', '#e0609a'], ['#fff3f6', '#e6c6d8'], ['#e0567a', '#b23a5e'], ['#ffd0e0', '#e79ab8']
]

const hollyhock = (b: Bed, x: number, g: number, H: number, seed: number): void => {
  const lw = b.lw
  const inkC = bedInk()
  const lean = (hash(seed * 4.7) - 0.5) * H * 0.08
  stem(b, x, g, x + lean, g - H, 0, Math.max(1, H * 0.028))
  const lp = b.at(21, T('#4f9e3d', 0.03), inkC, q(lw))
  leafPath(lp, x, g - H * 0.14, H * 0.2, Math.PI + 0.3, H * 0.08)
  leafPath(lp, x, g - H * 0.22, H * 0.2, -0.3, H * 0.08)
  const [fill, shade] = HOLLYHOCK[Math.floor(hash(seed * 2.3) * HOLLYHOCK.length)]!
  // Buds at the tip, then blossoms climbing the spike, smaller as they go.
  const buds = b.at(48, T('#6cb34e', 0.03), inkC, q(lw * 0.8))
  ellipsePath(buds, x + lean, g - H, H * 0.028, H * 0.045, 0)
  ellipsePath(buds, x + lean * 0.9 + H * 0.03, g - H * 0.92, H * 0.026, H * 0.04, 0.3)
  // Outline as an ink halo under the fills, so overlapping blossoms read as
  // one spike rather than as circles drawn through each other.
  const halo = b.at(49, inkC)
  const body = b.at(50, T(fill, 0.03))
  const dark = b.at(51, T(shade, 0.03))
  const eye = b.at(52, T('#ffe07a', 0.03))
  for (let i = 4; i >= 0; i--) {
    const t = 0.36 + i * 0.12
    const bx = x + lean * t + (i % 2 ? 1 : -1) * H * 0.035
    const by = g - H * t
    const br = H * (0.078 - i * 0.009)
    halo.moveTo(bx + br + lw * 0.8, by)
    halo.arc(bx, by, br + lw * 0.8, 0, TAU)
    body.moveTo(bx + br, by)
    body.arc(bx, by, br, 0, TAU)
    dark.moveTo(bx + br * 0.3 + Math.cos(-0.2) * br * 0.6, by + br * 0.25 + Math.sin(-0.2) * br * 0.6)
    dark.arc(bx + br * 0.3, by + br * 0.25, br * 0.6, -0.2, Math.PI * 0.9)
    dark.closePath()
    eye.moveTo(bx + br * 0.26, by)
    eye.arc(bx, by, br * 0.26, 0, TAU)
  }
}

const tallFlower = (b: Bed, x: number, g: number, H: number, seed: number): void => {
  if (hash(seed * 6.7) < 0.68) sunflower(b, x, g, H, seed)
  else hollyhock(b, x, g, H, seed)
}

const TULIP: ReadonlyArray<readonly [string, string]> = [
  ['#e5483b', '#b3302a'], ['#ffc93c', '#e0a01e'], ['#ff6fae', '#d9468a'], ['#ff8a2b', '#d9661a'], ['#f25c7a', '#c23a5a']
]

const flowerClump = (b: Bed, x: number, g: number, H: number, seed: number): void => {
  const lw = b.lw
  const inkC = bedInk()
  const kind = hash(seed * 5.1)

  const heads: Array<[number, number]> = []
  const n = kind < 0.34 ? 2 + (hash(seed * 2.7) > 0.5 ? 1 : 0)
    : kind < 0.64 ? 3 + Math.floor(hash(seed * 2.7) * 3)
      : 3
  for (let i = 0; i < n; i++) {
    const sx = x + (i - (n - 1) / 2) * H * 0.11
    const tall = kind < 0.34 ? 0.72 + hash(seed * 11 + i) * 0.28
      : kind < 0.64 ? 0.48 + hash(seed * 11 + i) * 0.4
        : kind < 0.84 ? 0.5 + hash(seed * 11 + i) * 0.4
          : 0.34 + hash(seed * 11 + i) * 0.26
    const tx = sx + (hash(seed * 13 + i) - 0.5) * H * 0.12
    const ty = g - H * tall
    heads.push([tx, ty])
    stem(b, sx, g, tx, ty, (hash(seed * 17 + i) - 0.5) * H * 0.1,
      Math.max(0.9, H * 0.028) * (kind < 0.34 ? 1 : 0.75))
  }

  // Leaves over the stems' feet (clover keeps its own, lower down).
  if (kind < 0.84) {
    const lp = b.at(20, T('#56a843', 0.03), inkC, q(lw))
    for (let i = 0; i < 3; i++) {
      const ang = -Math.PI / 2 + (i - 1) * 0.55 + (hash(seed * 3 + i) - 0.5) * 0.2
      const len = H * (0.3 + hash(seed * 7 + i) * 0.16)
      leafPath(lp, x + (i - 1) * H * 0.04, g, len, ang, H * (kind < 0.34 ? 0.07 : 0.055))
    }
  }

  if (kind < 0.34) {
    // Tulips: the cup, a shaded right-hand petal, then the outline.
    const [col, shade] = TULIP[Math.floor(hash(seed * 1.9) * TULIP.length)]!
    const cw = H * 0.17
    const ch = H * 0.2
    const cupFill = b.at(30, T(col, 0.03))
    const cupShade = b.at(31, T(shade, 0.03))
    const cupInk = b.at(32, undefined, inkC, q(lw))
    for (const [tx, ty] of heads) {
      for (const p of [cupFill, cupInk]) {
        p.moveTo(tx - cw / 2, ty - ch * 0.75)
        p.quadraticCurveTo(tx - cw * 0.55, ty, tx, ty)
        p.quadraticCurveTo(tx + cw * 0.55, ty, tx + cw / 2, ty - ch * 0.75)
        p.lineTo(tx + cw * 0.22, ty - ch * 0.5)
        p.lineTo(tx, ty - ch)
        p.lineTo(tx - cw * 0.22, ty - ch * 0.5)
        p.closePath()
      }
      cupShade.moveTo(tx + cw * 0.06, ty - ch * 0.02)
      cupShade.quadraticCurveTo(tx + cw * 0.52, ty - ch * 0.1, tx + cw / 2, ty - ch * 0.75)
      cupShade.lineTo(tx + cw * 0.22, ty - ch * 0.5)
      cupShade.closePath()
    }
  } else if (kind < 0.64) {
    // Daisies.
    const r = H * 0.08
    const petals = b.at(33, T('#ffffff', 0.03), inkC, q(lw * 0.7))
    const eyes = b.at(34, T('#ffc93c', 0.03), inkC, q(lw * 0.7))
    heads.forEach(([tx, ty], hI) => {
      for (let i = 0; i < 5; i++) {
        petalPath(petals, tx, ty, (i / 5) * TAU + hI * 0.7, r * 0.1, r * 1.05, r * 0.62)
      }
      eyes.moveTo(tx + r * 0.36, ty)
      eyes.arc(tx, ty, r * 0.36, 0, TAU)
    })
  } else if (kind < 0.84) {
    // Dandelions: two yellow pompoms and a seed clock.
    const r = H * 0.075
    const pom = b.at(35, T('#ffd23c', 0.03), inkC, q(lw * 0.6))
    for (let hI = 0; hI < heads.length - 1; hI++) {
      const [tx, ty] = heads[hI]!
      starPath(pom, tx, ty, r, r * 0.72, 9, hI)
    }
    const [cx, cy] = heads[heads.length - 1]!
    const cr = H * 0.1
    const puffP = b.at(36, T('#ffffff', 0.03, 0.45))
    puffP.moveTo(cx + cr, cy)
    puffP.arc(cx, cy, cr, 0, TAU)
    const rays = b.at(37, undefined, T('#ffffff', 0.03, 0.9), q(lw * 0.5))
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU
      rays.moveTo(cx, cy)
      rays.lineTo(cx + Math.cos(a) * cr, cy + Math.sin(a) * cr)
    }
    const seedP = b.at(38, T('#a08a5a', 0.03))
    seedP.moveTo(cx + cr * 0.18, cy)
    seedP.arc(cx, cy, cr * 0.18, 0, TAU)
  } else {
    // Clover: trefoil leaves low down, round pink-or-white heads above.
    const lr = H * 0.05
    const leaves = b.at(22, T('#4f9e3d', 0.03), inkC, q(lw * 0.7))
    for (let i = 0; i < 4; i++) {
      const lx = x + (i - 1.5) * H * 0.11
      const ly = g - H * (0.1 + hash(seed * 19 + i) * 0.16)
      for (let j = 0; j < 3; j++) {
        const a = -Math.PI / 2 + (j - 1) * 2.1
        const px = lx + Math.cos(a) * lr * 0.9
        const py = ly + Math.sin(a) * lr * 0.9
        leaves.moveTo(px + lr, py)
        leaves.arc(px, py, lr, 0, TAU)
      }
    }
    const pink = hash(seed * 23) > 0.4
    const headP = b.at(39, T(pink ? '#f5a3c7' : '#fbf3f6', 0.03), inkC, q(lw * 0.7))
    const headS = b.at(39.5, T(pink ? '#d8739f' : '#e0c8d4', 0.03))
    for (const [tx, ty] of heads) {
      headP.moveTo(tx + H * 0.07, ty)
      headP.arc(tx, ty, H * 0.07, 0, TAU)
      headS.moveTo(tx + H * 0.035, ty + H * 0.02)
      headS.arc(tx, ty + H * 0.02, H * 0.035, 0, Math.PI)
    }
  }
}

/**
 * A tall flower (was: a conifer): mostly sunflowers, sometimes a hollyhock
 * spike. Stands on `baseY`, `hgt` from root to crown.
 */
export const paintTallFlower = (
  c: CanvasRenderingContext2D, x: number, baseY: number, hgt: number, seed: number
): void => {
  const b = new Bed(inkW(hgt))
  tallFlower(b, x, baseY, hgt, seed)
  b.flush(c)
}

/**
 * A flower clump (was: a broadleaf tree): a fan of leaves under tulips,
 * daisies, dandelions or clover.
 */
export const paintFlowerClump = (
  c: CanvasRenderingContext2D, x: number, baseY: number, hgt: number, seed: number
): void => {
  const b = new Bed(inkW(hgt))
  flowerClump(b, x, baseY, hgt, seed)
  b.flush(c)
}

/**
 * The whole flower bed (parallax 0.34): a tall flower about one slot in four,
 * clumps in between — rhythm rather than a repeating sawtooth. World-anchored
 * (slot k is always the same plant), so panning slides the bed rather than
 * reshuffling it, and batched into one `Bed`.
 *
 * With `plant` given, each plant is handed to it instead — the painted-art
 * path, which blits one bitmap per plant.
 */
export const paintFlowerBed = (
  c: CanvasRenderingContext2D, w: number, h: number, groundY: number, scroll: number,
  plant?: (x: number, baseY: number, hgt: number, seed: number, tall: boolean) => void
): void => {
  const step = Math.max(11, w / 52)
  const [k0, k1] = slots(scroll, w, step, 1)
  const b = new Bed(inkW(h * 0.05))
  for (let k = k0; k <= k1; k++) {
    const x = k * step - scroll + (hash(k * 2.1) - 0.5) * step * 0.8
    const scale = 0.7 + hash(k * 7.7) * 0.6
    const tall = hash(k * 3.3) > 0.74
    const hgt = h * (tall ? 0.07 : 0.04) * scale
    if (plant) plant(x, groundY, hgt, k, tall)
    else if (tall) tallFlower(b, x, groundY, hgt, k)
    else flowerClump(b, x, groundY, hgt, k)
  }
  b.flush(c)
}

// ─── The sandbox ────────────────────────────────────────────────────────────

const pebble = (c: CanvasRenderingContext2D, x: number, y: number, r: number, k: number): void => {
  const rx = r * (1 + hash(k * 1.1) * 0.5)
  const ry = r * 0.7
  const tones = ['#9aa3ad', '#b3a595', '#c9d0d6', '#6e7782'] as const
  c.beginPath()
  ellipsePath(c, x + r * 0.2, y + ry * 0.55, rx, ry * 0.45, 0)
  c.fillStyle = T('#a0763f', 0, 0.3)
  c.fill()
  c.beginPath()
  ellipsePath(c, x, y, rx, ry, (hash(k * 2.3) - 0.5) * 0.6)
  c.fillStyle = T(tones[Math.floor(hash(k * 3.7) * tones.length)]!)
  c.fill()
  c.strokeStyle = T(INK, 0, 0.6)
  c.lineWidth = Math.max(0.8, r * 0.18)
  c.stroke()
  c.beginPath()
  ellipsePath(c, x - rx * 0.3, y - ry * 0.35, rx * 0.35, ry * 0.22, -0.3)
  c.fillStyle = T('#ffffff', 0, 0.5)
  c.fill()
}

const shell = (c: CanvasRenderingContext2D, x: number, y: number, r: number, k: number): void => {
  c.save()
  c.translate(x, y)
  c.rotate((hash(k * 3.1) - 0.5) * 0.9)
  const ribs = 5
  const a0 = Math.PI * 1.12
  const a1 = Math.PI * 1.88
  const hy = r * 0.5
  c.beginPath()
  c.moveTo(-r * 0.22, hy)
  for (let i = 0; i < ribs; i++) {
    const aa = a0 + ((a1 - a0) * i) / ribs
    const ab = a0 + ((a1 - a0) * (i + 1)) / ribs
    const am = (aa + ab) / 2
    c.lineTo(Math.cos(aa) * r, hy + Math.sin(aa) * r)
    c.quadraticCurveTo(Math.cos(am) * r * 1.2, hy + Math.sin(am) * r * 1.2, Math.cos(ab) * r, hy + Math.sin(ab) * r)
  }
  c.lineTo(r * 0.22, hy)
  c.closePath()
  c.fillStyle = T(hash(k * 5.5) > 0.5 ? '#ffd9c4' : '#fff0dc')
  c.fill()
  c.strokeStyle = T(INK, 0, 0.6)
  c.lineWidth = Math.max(0.8, r * 0.12)
  c.lineJoin = 'round'
  c.stroke()
  c.beginPath()
  for (let i = 1; i < ribs; i++) {
    const a = a0 + ((a1 - a0) * i) / ribs
    c.moveTo(0, hy)
    c.lineTo(Math.cos(a) * r * 0.92, hy + Math.sin(a) * r * 0.92)
  }
  c.strokeStyle = T('#e3a17f', 0, 0.9)
  c.lineWidth = Math.max(0.6, r * 0.08)
  c.stroke()
  c.restore()
}

/** A plastic spade someone left lying on the sand. */
const spade = (c: CanvasRenderingContext2D, x: number, y: number, L: number, k: number): void => {
  c.save()
  c.translate(x, y)
  c.rotate(-0.14 + hash(k * 4.4) * 0.28)
  if (hash(k * 7.7) < 0.5) c.scale(-1, 1)
  const lw = Math.max(1, L * 0.035)
  const inkC = T(INK, 0, 0.8)
  // Blade colours: [plastic, shade, lit ridge].
  const [blade0, blade1, blade2] = ([
    ['#e5483b', '#b3302a', '#ff9a8a'], ['#2f7de1', '#1f5aa8', '#8fbcf5'], ['#43b649', '#2e8a35', '#9be39e']
  ] as const)[Math.floor(hash(k * 8.8) * 3)]!
  c.beginPath()
  ellipsePath(c, L * 0.02, L * 0.12, L * 0.56, L * 0.09, 0)
  c.fillStyle = T('#9d7240', 0, 0.28)
  c.fill()
  // Handle and grip.
  const hw = L * 0.075
  c.beginPath()
  c.rect(-L * 0.48, -hw / 2, L * 0.56, hw)
  c.rect(-L * 0.56, -L * 0.1, L * 0.09, L * 0.2)
  c.fillStyle = T('#ffc93c')
  c.fill()
  c.fillStyle = T('#e0a21e')
  c.fillRect(-L * 0.48, 0, L * 0.56, hw / 2)
  c.beginPath()
  c.rect(-L * 0.48, -hw / 2, L * 0.56, hw)
  c.rect(-L * 0.56, -L * 0.1, L * 0.09, L * 0.2)
  c.strokeStyle = inkC
  c.lineWidth = lw
  c.lineJoin = 'round'
  c.stroke()
  // Blade.
  const blade = (): void => {
    c.beginPath()
    c.moveTo(L * 0.05, -L * 0.12)
    c.lineTo(L * 0.3, -L * 0.15)
    c.quadraticCurveTo(L * 0.52, -L * 0.1, L * 0.53, 0)
    c.quadraticCurveTo(L * 0.52, L * 0.1, L * 0.3, L * 0.15)
    c.lineTo(L * 0.05, L * 0.12)
    c.closePath()
  }
  blade()
  c.fillStyle = T(blade0)
  c.fill()
  c.save()
  c.clip()
  c.fillStyle = T(blade1)
  c.fillRect(0, L * 0.03, L * 0.6, L * 0.2)
  c.restore()
  c.strokeStyle = inkC
  c.stroke()
  c.beginPath()
  c.moveTo(L * 0.09, -L * 0.02)
  c.lineTo(L * 0.42, -L * 0.02)
  c.strokeStyle = T(blade2, 0, 0.9)
  c.lineWidth = lw * 0.9
  c.lineCap = 'round'
  c.stroke()
  c.fillStyle = T('#e3c07e')
  c.beginPath()
  c.arc(L * 0.36, L * 0.06, L * 0.035, 0, TAU)
  c.arc(L * 0.28, L * 0.08, L * 0.025, 0, TAU)
  c.fill()
  c.restore()
}

const star = (c: CanvasRenderingContext2D, R: number, inner: number): void => {
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i / 10) * TAU
    const rr = i % 2 === 0 ? R : R * inner
    if (i === 0) c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr)
    else c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
  }
  c.closePath()
}

/** A star sand mould lying face-down, and sometimes the sand star it made. */
const starMould = (c: CanvasRenderingContext2D, x: number, y: number, R: number, k: number): void => {
  const col = (['#2f7de1', '#43b649', '#ff6fae', '#ff8a2b'] as const)[Math.floor(hash(k * 2.1) * 4)]!
  const inkC = T(INK, 0, 0.8)
  const lw = Math.max(1, R * 0.08)
  const pile = hash(k * 6.3) > 0.45
  c.save()
  c.translate(x, y)
  c.scale(1, 0.6)
  c.rotate((hash(k * 3.3) - 0.5) * 0.7)
  c.beginPath()
  c.save()
  c.translate(R * 0.1, R * 0.22)
  star(c, R, 0.5)
  c.restore()
  c.fillStyle = T('#9d7240', 0, 0.28)
  c.fill()
  c.beginPath()
  star(c, R, 0.5)
  c.fillStyle = T(col)
  c.fill()
  c.strokeStyle = inkC
  c.lineWidth = lw
  c.lineJoin = 'round'
  c.stroke()
  c.beginPath()
  star(c, R * 0.62, 0.48)
  c.fillStyle = T('#ffffff', 0, 0.3)
  c.fill()
  c.restore()
  if (pile) {
    c.save()
    c.translate(x + R * 2.3, y + R * 0.1)
    c.scale(1, 0.6)
    c.rotate(0.3)
    c.beginPath()
    star(c, R * 0.95, 0.52)
    c.fillStyle = T('#f2d596')
    c.fill()
    c.strokeStyle = T('#b88c4c', 0, 0.9)
    c.lineWidth = lw
    c.stroke()
    c.beginPath()
    star(c, R * 0.55, 0.5)
    c.fillStyle = T('#fff0c8', 0, 0.7)
    c.fill()
    c.restore()
  }
}

/**
 * The sand strip the castle stands on (was: the meadow), world-anchored at
 * parallax 1: a dry-to-damp gradient, soft tonal patches, wind ripples, grain
 * speckle, the odd pebble or shell and, now and then, a dropped toy for scale.
 */
export const paintSand = (
  c: CanvasRenderingContext2D, w: number, groundY: number, seaY: number, zoom: number, scroll: number
): void => {
  const g = groundY
  const landH = Math.max(2, seaY - g)
  const gr = c.createLinearGradient(0, g, 0, seaY)
  gr.addColorStop(0, T('#f6e2ae'))
  gr.addColorStop(0.45, T('#eed49a'))
  gr.addColorStop(1, T('#e0bb7a'))
  c.fillStyle = gr
  c.fillRect(0, g, w, landH + 1)

  // Soft patches of lighter and darker sand.
  const ps = Math.max(36, zoom * 2.2)
  const [p0, p1] = slots(scroll, w, ps, 1)
  for (let k = p0; k <= p1; k++) {
    if (hash(k * 1.31 + 2) < 0.5) continue
    const px = k * ps - scroll + hash(k * 2.1) * ps
    const py = g + (0.2 + hash(k * 3.7) * 0.7) * landH
    const ry = Math.max(2, landH * 0.4)
    const rx = ps * (0.35 + hash(k * 4.3) * 0.4)
    const light = hash(k * 4.9) > 0.5
    c.save()
    c.translate(px, py)
    c.scale(rx / ry, 1)
    const pg = c.createRadialGradient(0, 0, 0, 0, 0, ry)
    pg.addColorStop(0, light ? T('#fff3cf', 0, 0.45) : T('#c99d5e', 0, 0.25))
    pg.addColorStop(1, light ? T('#fff3cf', 0, 0) : T('#c99d5e', 0, 0))
    c.fillStyle = pg
    c.fillRect(-ry, -ry, ry * 2, ry * 2)
    c.restore()
  }

  // Wind ripples: a dark groove with a lit lip above it.
  const rs = Math.max(14, zoom * 0.7)
  const [r0, r1] = slots(scroll, w, rs)
  const rlw = Math.max(1, zoom * 0.016)
  for (const lit of [false, true]) {
    c.beginPath()
    for (let k = r0; k <= r1; k++) {
      if (hash(k * 5.3 + 1) < 0.35) continue
      const rx = k * rs - scroll + hash(k * 1.9) * rs * 0.6
      const ry = g + landH * (0.22 + hash(k * 8.1) * 0.56) - (lit ? rlw * 1.2 : 0)
      const len = zoom * (0.25 + hash(k * 2.6) * 0.3)
      const bow = zoom * 0.03
      c.moveTo(rx, ry)
      c.quadraticCurveTo(rx + len / 2, ry - bow, rx + len, ry)
    }
    c.strokeStyle = lit ? T('#fff6dc', 0, 0.65) : T('#c49a5c', 0, 0.5)
    c.lineWidth = rlw
    c.lineCap = 'round'
    c.stroke()
  }

  // Grain speckle: three tones, one fill each.
  const ss = Math.max(2.5, zoom * 0.06)
  const [s0, s1] = slots(scroll, w, ss)
  const tones = [T('#b88c4c', 0, 0.55), T('#fffaf0', 0, 0.75), T('#8f949b', 0, 0.55)]
  for (let tI = 0; tI < 3; tI++) {
    c.beginPath()
    for (let k = s0; k <= s1; k++) {
      const v = hash(k * 4.7 + 0.3)
      if ((v < 0.45 ? 0 : v < 0.82 ? 1 : 2) !== tI) continue
      const x = k * ss - scroll + hash(k * 1.7) * ss
      const y = g + 1 + hash(k * 2.3) * (landH - 2)
      const s = Math.max(1, zoom * (0.012 + hash(k * 3.1) * 0.014))
      c.rect(x, y, s, s)
    }
    c.fillStyle = tones[tI]!
    c.fill()
  }

  // Pebbles and shells.
  const bs = Math.max(20, zoom * 1.5)
  const [q0, q1] = slots(scroll, w, bs)
  for (let k = q0; k <= q1; k++) {
    const v = hash(k * 6.13 + 3)
    if (v < 0.62) continue
    const bx = k * bs - scroll + hash(k * 2.7) * bs
    const by = g + landH * (0.28 + hash(k * 3.9) * 0.5)
    if (v < 0.9) pebble(c, bx, by, Math.max(1.2, zoom * (0.035 + hash(k * 5.1) * 0.03)), k)
    else shell(c, bx, by, Math.max(2, zoom * 0.075), k)
  }

  // A dropped toy every so often.
  const ts = zoom * 12
  const [t0, t1] = slots(scroll, w, ts, 1)
  for (let k = t0; k <= t1; k++) {
    const v = hash(k * 9.71 + 5)
    if (v < 0.55) continue
    const tx = k * ts - scroll + (0.15 + hash(k * 3.3) * 0.7) * ts
    const ty = g + landH * 0.5
    if (hash(k * 2.9) < 0.5) spade(c, tx, ty, zoom * 0.8, k)
    else starMould(c, tx, ty, zoom * 0.17, k)
  }
}

/** Run `fn` under plain daylight, then put the scene's light back. */
const withDaylight = (fn: () => void): void => {
  const saved = { night, warm, storm, haze }
  night = 0
  warm = 0
  storm = 0
  haze = [214, 240, 255]
  memo.clear()
  try {
    fn()
  } finally {
    night = saved.night
    warm = saved.warm
    storm = saved.storm
    haze = saved.haze
    memo.clear()
  }
}

const sandTiles = new Map<number, HTMLCanvasElement | null>()

/**
 * The drawn sand as a tile `hPx` tall (at 2x), baked once per height under
 * daylight — for scenes that repaint the ground every frame (the tutorial
 * demos) and must not pay for its gradients each time. Null without a 2D
 * canvas. Tiles horizontally through `tileBand`'s mirrored repeat.
 */
export const sandTile = (hPx: number): HTMLCanvasElement | null => {
  const H = Math.max(6, Math.round(hPx))
  const hit = sandTiles.get(H)
  if (hit !== undefined) return hit
  if (typeof document === 'undefined') return null
  const zoom = H * 2
  const W = Math.round(zoom * 12)
  const cv = document.createElement('canvas')
  cv.width = W * 2
  cv.height = H * 2
  const c = cv.getContext('2d')
  if (!c) {
    sandTiles.set(H, null)
    return null
  }
  c.scale(2, 2)
  withDaylight(() => paintSand(c, W, 0, H, zoom, 0))
  if (sandTiles.size > 8) sandTiles.clear()
  sandTiles.set(H, cv)
  return cv
}

/**
 * The sandbox's far plank edge along the horizon (was: the horizon ink line):
 * a board seen edge-on with a lit top, grain, the odd butt joint and nails,
 * and the shadow it drops onto the sand in front of it.
 */
export const paintSandboxFrame = (
  c: CanvasRenderingContext2D, w: number, groundY: number, zoom: number, scroll: number
): void => {
  const g = groundY
  const pH = Math.max(3, zoom * 0.16)
  const top = g - pH
  const lw = Math.max(1, zoom * 0.022)

  const sh = c.createLinearGradient(0, g, 0, g + zoom * 0.14)
  sh.addColorStop(0, T('#8d673a', 0, 0.35))
  sh.addColorStop(1, T('#8d673a', 0, 0))
  c.fillStyle = sh
  c.fillRect(0, g, w, zoom * 0.14)

  const face = c.createLinearGradient(0, top, 0, g)
  face.addColorStop(0, T('#e2b57a'))
  face.addColorStop(1, T('#b98450'))
  c.fillStyle = face
  c.fillRect(-4, top, w + 8, pH + 1)
  c.fillStyle = T('#f6d9a4')
  c.fillRect(-4, top, w + 8, Math.max(1, pH * 0.26))

  // Grain.
  const gs = Math.max(8, zoom * 0.35)
  c.beginPath()
  for (const f of [0.5, 0.76]) {
    const pts = edgeLine(scroll, w, top + pH * f, gs, pH * 0.12, f * 50)
    pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py)))
  }
  c.strokeStyle = T('#9b6a3a', 0, 0.45)
  c.lineWidth = Math.max(0.7, zoom * 0.01)
  c.stroke()

  // Butt joints with a nail either side.
  const js = zoom * 6
  const [j0, j1] = slots(scroll, w, js, 1)
  c.beginPath()
  for (let k = j0; k <= j1; k++) {
    const jx = k * js - scroll + zoom * 1.3
    c.moveTo(jx, top)
    c.lineTo(jx, g)
  }
  c.strokeStyle = T('#6e4524', 0, 0.8)
  c.lineWidth = lw
  c.stroke()
  c.beginPath()
  const nr = Math.max(0.8, zoom * 0.02)
  for (let k = j0; k <= j1; k++) {
    const jx = k * js - scroll + zoom * 1.3
    for (const dx of [-zoom * 0.13, zoom * 0.13]) {
      c.moveTo(jx + dx + nr, top + pH * 0.55)
      c.arc(jx + dx, top + pH * 0.55, nr, 0, TAU)
    }
  }
  c.fillStyle = T('#7d828a')
  c.fill()

  // Pen contours along the top and the foot.
  const step = Math.max(11, w / 60)
  inkStroke(c, edgeLine(scroll, w, top, step, Math.max(0.6, zoom * 0.012), 3),
    Math.max(1, zoom * 0.026), Math.max(0.6, zoom * 0.014), T(INK, 0, 0.6), 63)
  inkStroke(c, edgeLine(scroll, w, g, step, Math.max(0.6, zoom * 0.012), 7),
    Math.max(1, zoom * 0.03), Math.max(0.6, zoom * 0.016), T(INK, 0, 0.55), 64)
}

/**
 * The moat / paddling-pool water in front of the castle (was: the lake), and
 * the wet-sand bank above it. `painted` skips the drawn water body when a
 * painted water band has already been laid, keeping the bank, the foam and the
 * ripples either way — the old lake did the same with its shore.
 */
export const paintMoat = (
  c: CanvasRenderingContext2D, w: number, h: number, seaY: number, zoom: number, scroll: number,
  painted: boolean
): void => {
  const depth = h - seaY
  if (depth <= 0) return

  if (!painted) {
    // Shallow, clear water: sand shows through right at the edge, then it
    // turns turquoise and only deepens to pool blue far down the frame.
    const shelf = Math.min(0.4, (zoom * 0.45) / depth)
    const wg = c.createLinearGradient(0, seaY, 0, h)
    wg.addColorStop(0, T('#b7e6cf'))
    wg.addColorStop(shelf * 0.45, T('#8fe4e6'))
    wg.addColorStop(shelf, T('#6fd6e8'))
    wg.addColorStop(Math.min(0.95, shelf + 0.4), T('#38b5d3'))
    wg.addColorStop(1, T('#1f86b0'))
    c.fillStyle = wg
    c.fillRect(0, seaY, w, depth)
  }

  // Ripples: scattered wavelet glints — a lit crest with a darker trough just
  // under it — in loose rows that spread out and grow with depth, so the
  // surface recedes. Scattered, not ruled: rows of evenly spaced dashes read
  // as a hatch pattern, not as water.
  const rlw = Math.max(1, zoom * 0.018)
  for (const dark of [true, false]) {
    c.beginPath()
    for (let i = 0; i < 9; i++) {
      const f = (i + 0.6) / 9
      const yRow = seaY + zoom * 0.2 + depth * f * f
      if (yRow > h + zoom) break
      const seg = zoom * (1.1 + f * 2.2)
      const [k0, k1] = slots(scroll, w, seg, 1)
      for (let k = k0; k <= k1; k++) {
        if (hash(k * 1.7 + i * 13.1) < 0.4) continue
        const L = seg * (0.22 + hash(k * 2.9 + i) * 0.34)
        const xa = k * seg - scroll + hash(k * 3.1 + i * 7.7) * (seg - L)
        const y = yRow + (hash(k * 5.3 + i * 3.3) - 0.5) * zoom * (0.12 + f * 0.3) + (dark ? rlw * 1.4 : 0)
        const xs = dark ? xa + L * 0.18 : xa
        const xe = dark ? xa + L * 0.82 : xa + L
        c.moveTo(xs, y)
        c.quadraticCurveTo((xs + xe) / 2, y + L * 0.14, xe, y)
      }
    }
    c.strokeStyle = dark ? T('#1b7fa8', 0, 0.3) : T('#f0fdff', 0, 0.6)
    c.lineWidth = rlw
    c.lineCap = 'round'
    c.stroke()
  }

  // The bank: damp sand darkening toward the waterline, with a scalloped edge
  // where it meets the dry sand.
  const bandTop = seaY - zoom * 0.15
  const step = Math.max(8, zoom * 0.3)
  const shorePts = edgeLine(scroll, w, bandTop + zoom * 0.03, step, zoom * 0.06, 11)
  const bank = c.createLinearGradient(0, bandTop, 0, seaY)
  bank.addColorStop(0, T('#d9b477', 0, 0.9))
  bank.addColorStop(0.5, T('#c79a5c'))
  bank.addColorStop(1, T('#8d673a'))
  c.fillStyle = bank
  c.beginPath()
  c.moveTo(-10, seaY + 1)
  for (const [px, py] of shorePts) c.lineTo(px, py)
  c.lineTo(w + 10, seaY + 1)
  c.closePath()
  c.fill()
  inkStroke(c, shorePts, Math.max(0.8, zoom * 0.016), Math.max(0.5, zoom * 0.01), T('#8d673a', 0, 0.55), 90)

  // The waterline, drawn.
  inkStroke(c, edgeLine(scroll, w, seaY, Math.max(9, w / 70), zoom * 0.012, 21),
    Math.max(1, zoom * 0.026), Math.max(0.6, zoom * 0.013), T(INK, 0, 0.45), 91)

  // Foam lace lapping at the sand: a bright line, and a fainter broken one.
  const fs = Math.max(9, zoom * 0.28)
  const [f0, f1] = slots(scroll, w, fs, 1)
  c.beginPath()
  for (let k = f0; k <= f1; k++) {
    const x = k * fs - scroll
    const y = seaY + zoom * 0.035 + Math.sin(k * 1.3) * zoom * 0.012
    if (k === f0) c.moveTo(x, y)
    else c.lineTo(x, y)
  }
  c.strokeStyle = T('#ffffff', 0, 0.85)
  c.lineWidth = Math.max(1, zoom * 0.024)
  c.lineJoin = 'round'
  c.stroke()
  c.beginPath()
  for (let k = f0; k <= f1; k++) {
    if (hash(k * 3.9 + 4) < 0.45) continue
    const x = k * fs - scroll
    const y = seaY + zoom * 0.09 + Math.sin(k * 0.9 + 1) * zoom * 0.014
    c.moveTo(x, y)
    c.quadraticCurveTo(x + fs * 0.5, y + zoom * 0.02, x + fs, y)
  }
  c.strokeStyle = T('#ffffff', 0, 0.42)
  c.lineWidth = Math.max(1, zoom * 0.016)
  c.stroke()
}

// ─── Fireflies ──────────────────────────────────────────────────────────────

let glow: HTMLCanvasElement | null = null

/** The firefly glow, baked once — or null where there is no 2D canvas. */
const glowSprite = (): HTMLCanvasElement | null => {
  if (glow) return glow
  const cv = document.createElement('canvas')
  cv.width = 32
  cv.height = 32
  const g = cv.getContext('2d')
  if (!g) return null
  const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16)
  gr.addColorStop(0, 'rgba(255,255,214,1)')
  gr.addColorStop(0.24, 'rgba(236,255,150,0.95)')
  gr.addColorStop(0.45, 'rgba(196,240,96,0.3)')
  gr.addColorStop(1, 'rgba(196,240,96,0)')
  g.fillStyle = gr
  g.fillRect(0, 0, 32, 32)
  glow = cv
  return cv
}

/**
 * Fireflies drifting over the flower bed on a summer night. Live, because they
 * blink — but a dozen small blits of one pre-baked glow, and nothing at all by
 * day.
 */
export const paintFireflies = (
  c: CanvasRenderingContext2D, w: number, h: number, groundY: number, t: number
): void => {
  if (night < 0.35 || groundY <= 0) return
  const fade = (night - 0.35) / 0.65
  const n = Math.max(5, Math.min(14, Math.round(w / 95)))
  const img = glowSprite()
  if (!img) return
  const R = Math.max(7, h * 0.017)
  const prev = c.globalAlpha
  for (let i = 0; i < n; i++) {
    const blink = Math.sin(t / (700 + hash(i * 3.3) * 900) + i * 2.4)
    if (blink <= 0) continue
    const x = (((hash(i * 7.1) * w + Math.sin(t / (2600 + i * 170) + i) * w * 0.05) % w) + w) % w
    const y = groundY - h * (0.012 + hash(i * 2.9) * 0.14) + Math.sin(t / (1500 + i * 90) + i * 1.3) * h * 0.012
    c.globalAlpha = Math.min(1, blink * blink * 1.4) * fade
    c.drawImage(img, x - R, y - R, R * 2, R * 2)
  }
  c.globalAlpha = prev
}


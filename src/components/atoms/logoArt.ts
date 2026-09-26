/**
 * The "Sandbox Tower" logo and app icon, drawn in code.
 *
 * Until painted art exists (see `sandbox-reskin.md` § UI chrome) the logo is
 * procedural: chunky bucket-moulded sand letters with a dark brown contour, a
 * darker sand extrusion under them, faint mould ridges and grain speckle, and a
 * red paper flag on a toothpick planted in the wordmark. The bitmaps under
 * `public/images/logo/` and `public/favicon.ico` are rendered FROM these two
 * functions (a throwaway headless-Chrome script imports this module through
 * the dev server), so the splash `<img>`, the PWA icons and the live canvas in
 * `FLogoProgress` are one drawing.
 *
 * Everything is seeded on constants — no `Math.random` — so every render of
 * the logo is the same picture.
 */

export const LOGO_FONT_FAMILY = 'Angry'

const INK = '#3b2a21'
const OUTLINE = '#5a3a1c'
const SAND_LIGHT = '#f6e2ae'
const SAND_MID = '#e3c07e'
const SAND_DARK = '#b88c4c'
const WET_SAND_DARK = '#8d673a'
const TOY_RED = '#e5483b'
const TOY_YELLOW = '#ffc93c'

/** Resolves once the game font can be used on a canvas (false if it can't). */
export const ensureLogoFont = async (): Promise<boolean> => {
  try {
    await document.fonts.load(`700 64px ${LOGO_FONT_FAMILY}`)
    return document.fonts.check(`700 64px ${LOGO_FONT_FAMILY}`)
  } catch {
    return false
  }
}

/** Deterministic 0..1 sequence (xorshift), so speckle is the same every time. */
const seeded = (seed: number): (() => number) => {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13; s >>>= 0
    s ^= s >>> 17
    s ^= s << 5; s >>>= 0
    return s / 4294967296
  }
}

// Per-letter tilt (radians) and baseline lift (× font size): the letters sit
// like sand blocks stacked by hand rather than typeset.
const TILT = [-0.07, 0.045, -0.03, 0.06, -0.05, 0.035, -0.06, 0.04]
const LIFT = [0.015, -0.03, 0.01, -0.02, 0.03, -0.012, 0.02, -0.018]

interface Glyph { ch: string; x: number; y: number; rot: number }

type Ctx = CanvasRenderingContext2D

const layoutWord = (ctx: Ctx, word: string, cx: number, baseline: number, size: number, seedOffset: number): Glyph[] => {
  ctx.font = `700 ${size}px ${LOGO_FONT_FAMILY}`
  const chars = [...word]
  const widths = chars.map((ch) => ctx.measureText(ch).width)
  const spacing = -size * 0.015
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
  let x = cx - total / 2
  return chars.map((ch, i): Glyph => {
    const w = widths[i] ?? 0
    const k = (i + seedOffset) % TILT.length
    const g = { ch, x: x + w / 2, y: baseline + (LIFT[k] ?? 0) * size, rot: TILT[k] ?? 0 }
    x += w + spacing
    return g
  })
}

const eachGlyph = (ctx: Ctx, glyphs: Glyph[], dx: number, dy: number, fn: (g: Glyph) => void): void => {
  for (const g of glyphs) {
    ctx.save()
    ctx.translate(g.x + dx, g.y + dy)
    ctx.rotate(g.rot)
    fn(g)
    ctx.restore()
  }
}

/** Width of a word at a given size, for fitting. */
const measureWord = (ctx: Ctx, word: string, size: number): number => {
  ctx.font = `700 ${size}px ${LOGO_FONT_FAMILY}`
  const chars = [...word]
  return chars.reduce((a, ch) => a + ctx.measureText(ch).width, 0) - size * 0.015 * (chars.length - 1)
}

/**
 * One word of sand letters: drop shadow, extrusion, contour, textured face,
 * gloss. Drawn onto `ctx` at the current transform.
 */
const drawSandWord = (ctx: Ctx, glyphs: Glyph[], size: number, seed: number): void => {
  const depth = size * 0.085
  const line = Math.max(2, size * 0.13)
  const W = ctx.canvas.width
  const H = ctx.canvas.height

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `700 ${size}px ${LOGO_FONT_FAMILY}`
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2

  // Soft ground shadow.
  ctx.save()
  ctx.fillStyle = 'rgba(59, 42, 33, 0.28)'
  eachGlyph(ctx, glyphs, size * 0.03, depth + size * 0.06, (g) => {
    ctx.lineWidth = line
    ctx.strokeStyle = 'rgba(59, 42, 33, 0.28)'
    ctx.strokeText(g.ch, 0, 0)
    ctx.fillText(g.ch, 0, 0)
  })
  ctx.restore()

  // Contour of the whole block (face + extrusion) in one dark line.
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = line
  const steps = Math.max(2, Math.ceil(depth / 1.5))
  for (let s = steps; s >= 0; s--) {
    eachGlyph(ctx, glyphs, 0, (depth * s) / steps, (g) => ctx.strokeText(g.ch, 0, 0))
  }
  // Extrusion: the packed, darker sand under the lit face.
  ctx.fillStyle = WET_SAND_DARK
  for (let s = steps; s >= 1; s--) {
    ctx.fillStyle = s === steps ? '#7a5530' : SAND_DARK
    eachGlyph(ctx, glyphs, 0, (depth * s) / steps, (g) => ctx.fillText(g.ch, 0, 0))
  }

  // Face on its own layer, so texture and gloss can be clipped to it with
  // `source-atop` without touching the contour.
  const layer = document.createElement('canvas')
  layer.width = W
  layer.height = H
  const lc = layer.getContext('2d')
  if (!lc) return
  lc.setTransform(ctx.getTransform())
  lc.textAlign = 'center'
  lc.textBaseline = 'alphabetic'
  lc.font = ctx.font
  const top = Math.min(...glyphs.map((g) => g.y)) - size * 0.78
  const bottom = Math.max(...glyphs.map((g) => g.y)) + size * 0.05
  const face = lc.createLinearGradient(0, top, 0, bottom)
  face.addColorStop(0, '#fbe6b0')
  face.addColorStop(0.3, '#f2d49a')
  face.addColorStop(0.68, SAND_MID)
  face.addColorStop(1, '#cf9f5e')
  lc.fillStyle = face
  eachGlyph(lc, glyphs, 0, 0, (g) => lc.fillText(g.ch, 0, 0))

  lc.globalCompositeOperation = 'source-atop'
  // Bucket-mould ridges: faint horizontal bands.
  const minX = Math.min(...glyphs.map((g) => g.x)) - size
  const maxX = Math.max(...glyphs.map((g) => g.x)) + size
  lc.fillStyle = 'rgba(160, 112, 56, 0.2)'
  const band = size * 0.2
  for (let y = top + band * 0.8; y < bottom; y += band) {
    lc.fillRect(minX, y, maxX - minX, Math.max(1, size * 0.028))
  }
  // Grain speckle.
  const rnd = seeded(seed)
  const n = Math.round((maxX - minX) * (bottom - top) / (size * size) * 60)
  for (let i = 0; i < n; i++) {
    const x = minX + rnd() * (maxX - minX)
    const y = top + rnd() * (bottom - top)
    const r = size * (0.008 + rnd() * 0.014)
    lc.fillStyle = rnd() < 0.62 ? 'rgba(150, 104, 52, 0.45)' : 'rgba(255, 250, 230, 0.75)'
    lc.beginPath()
    lc.arc(x, y, r, 0, Math.PI * 2)
    lc.fill()
  }
  // Wet-look gloss across the upper third.
  const gloss = lc.createLinearGradient(0, top, 0, top + (bottom - top) * 0.5)
  gloss.addColorStop(0, 'rgba(255, 252, 238, 0.4)')
  gloss.addColorStop(1, 'rgba(255, 255, 255, 0)')
  lc.fillStyle = gloss
  lc.fillRect(minX, top, maxX - minX, (bottom - top) * 0.5)
  // A thin light edge just inside each letter — the lit rim of a moulded
  // block. On the face layer, so it can never spill onto the contour.
  lc.lineWidth = Math.max(1, size * 0.03)
  lc.strokeStyle = 'rgba(255, 248, 226, 0.55)'
  eachGlyph(lc, glyphs, 0, 0, (g) => lc.strokeText(g.ch, 0, 0))

  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.drawImage(layer, 0, 0)
  ctx.restore()
}

/** A red paper pennant on a toothpick, planted at (x, y) — the stick's foot. */
const drawFlag = (ctx: Ctx, x: number, y: number, h: number, lean = -0.08): void => {
  const lw = Math.max(1.5, h * 0.045)
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(lean)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  // Toothpick.
  const sw = Math.max(2, h * 0.07)
  ctx.fillStyle = '#f7e6bf'
  ctx.strokeStyle = INK
  ctx.lineWidth = lw
  ctx.beginPath()
  ctx.moveTo(-sw / 2, 0)
  ctx.lineTo(-sw / 2, -h)
  ctx.quadraticCurveTo(0, -h - sw * 1.2, sw / 2, -h)
  ctx.lineTo(sw / 2, 0)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  // Pennant: a paper triangle with a soft wave.
  const fw = h * 0.62
  const fh = h * 0.42
  const fy = -h + sw * 0.4
  ctx.beginPath()
  ctx.moveTo(sw / 2, fy)
  ctx.quadraticCurveTo(sw / 2 + fw * 0.5, fy + fh * 0.1, sw / 2 + fw, fy + fh * 0.52)
  ctx.quadraticCurveTo(sw / 2 + fw * 0.5, fy + fh * 0.7, sw / 2, fy + fh)
  ctx.closePath()
  const pg = ctx.createLinearGradient(0, fy, 0, fy + fh)
  pg.addColorStop(0, '#ff6e5e')
  pg.addColorStop(1, TOY_RED)
  ctx.fillStyle = pg
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.lineWidth = lw
  ctx.stroke()
  // Paper fold crease.
  ctx.beginPath()
  ctx.moveTo(sw / 2 + fw * 0.42, fy + fh * 0.2)
  ctx.lineTo(sw / 2 + fw * 0.38, fy + fh * 0.78)
  ctx.strokeStyle = 'rgba(140, 30, 22, 0.55)'
  ctx.lineWidth = Math.max(1, lw * 0.6)
  ctx.stroke()
  // Yellow dot emblem.
  ctx.beginPath()
  ctx.arc(sw / 2 + fw * 0.2, fy + fh * 0.5, fh * 0.13, 0, Math.PI * 2)
  ctx.fillStyle = TOY_YELLOW
  ctx.fill()
  ctx.restore()
}

/** A small red toy bucket with a yellow rim and handle, base at (x, y). */
const drawBucket = (ctx: Ctx, x: number, y: number, h: number): void => {
  const lw = Math.max(1.5, h * 0.07)
  const topW = h * 0.95
  const botW = h * 0.68
  ctx.save()
  ctx.translate(x, y)
  ctx.lineJoin = 'round'
  ctx.strokeStyle = INK
  ctx.lineWidth = lw
  // Handle.
  ctx.beginPath()
  ctx.ellipse(0, -h * 0.84, topW * 0.46, h * 0.52, 0, Math.PI * 1.05, Math.PI * 1.95)
  ctx.stroke()
  // Body.
  ctx.beginPath()
  ctx.moveTo(-topW / 2, -h * 0.84)
  ctx.lineTo(topW / 2, -h * 0.84)
  ctx.lineTo(botW / 2, 0)
  ctx.quadraticCurveTo(0, h * 0.08, -botW / 2, 0)
  ctx.closePath()
  const bg = ctx.createLinearGradient(-topW / 2, 0, topW / 2, 0)
  bg.addColorStop(0, '#ff7a66')
  bg.addColorStop(0.55, TOY_RED)
  bg.addColorStop(1, '#b8332c')
  ctx.fillStyle = bg
  ctx.fill()
  ctx.stroke()
  // Rim.
  ctx.beginPath()
  ctx.roundRect(-topW / 2 - lw * 0.6, -h, topW + lw * 1.2, h * 0.2, h * 0.08)
  ctx.fillStyle = TOY_YELLOW
  ctx.fill()
  ctx.stroke()
  // Shine.
  ctx.beginPath()
  ctx.moveTo(-topW * 0.3, -h * 0.72)
  ctx.lineTo(-botW * 0.26, -h * 0.12)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)'
  ctx.lineWidth = lw * 0.9
  ctx.lineCap = 'round'
  ctx.stroke()
  ctx.restore()
}

/**
 * The wordmark, fitted into a `w × h` box at the origin of `ctx`'s current
 * transform: "SANDBOX" over a larger "TOWER", a flag planted in the top line
 * and a bucket beside the bottom one. Transparent background.
 */
export const drawLogo = (ctx: Ctx, w: number, h: number): void => {
  ctx.save()
  const s = Math.min(w, h)
  const ox = (w - s) / 2
  const oy = (h - s) / 2
  ctx.translate(ox, oy)

  // Fit "SANDBOX" to ~90 % of the width; "TOWER" a size up.
  const probe = 100
  const w1 = measureWord(ctx, 'SANDBOX', probe)
  const size1 = Math.min(s * 0.29, (s * 0.9) / (w1 / probe))
  const w2 = measureWord(ctx, 'TOWER', probe)
  const size2 = Math.min(size1 * 1.28, (s * 0.72) / (w2 / probe))

  const base1 = s * 0.31 + size1 * 0.78
  const base2 = base1 + size2 * 0.98
  const cx = s / 2

  const top = layoutWord(ctx, 'SANDBOX', cx, base1, size1, 0)
  const bottom = layoutWord(ctx, 'TOWER', cx - s * 0.085, base2, size2, 3)

  // The flag goes in first so the letter it is planted in covers its foot.
  const host = top[4] // the "B"
  if (host) drawFlag(ctx, host.x + size1 * 0.04, host.y - size1 * 0.5, s * 0.25, 0.1)

  drawSandWord(ctx, top, size1, 17)
  drawSandWord(ctx, bottom, size2, 41)

  const last = bottom[bottom.length - 1]
  if (last) drawBucket(ctx, last.x + size2 * 0.74, base2 + size2 * 0.07, size2 * 0.58)

  ctx.restore()
}

/**
 * The square app icon (PWA icons, favicon): a sandcastle with a paper flag on
 * a sky-blue rounded square, standing on sand. Drawn into `size × size`.
 */
export const drawIcon = (ctx: Ctx, size: number): void => {
  const s = size
  const small = s <= 64
  ctx.save()
  const r = s * 0.2
  // Sky tile.
  ctx.beginPath()
  ctx.roundRect(0, 0, s, s, r)
  ctx.save()
  ctx.clip()
  const sky = ctx.createLinearGradient(0, 0, 0, s)
  sky.addColorStop(0, '#4fb2ef')
  sky.addColorStop(0.6, '#a9dcf9')
  sky.addColorStop(1, '#d6f0ff')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, s, s)
  if (!small) {
    // Sun.
    const sun = ctx.createRadialGradient(s * 0.8, s * 0.2, 0, s * 0.8, s * 0.2, s * 0.22)
    sun.addColorStop(0, 'rgba(255, 246, 200, 1)')
    sun.addColorStop(0.45, 'rgba(255, 236, 150, 0.9)')
    sun.addColorStop(1, 'rgba(255, 236, 150, 0)')
    ctx.fillStyle = sun
    ctx.fillRect(0, 0, s, s)
  }
  // Sand dune.
  ctx.beginPath()
  ctx.moveTo(0, s * 0.8)
  ctx.quadraticCurveTo(s * 0.5, s * 0.7, s, s * 0.8)
  ctx.lineTo(s, s)
  ctx.lineTo(0, s)
  ctx.closePath()
  const dune = ctx.createLinearGradient(0, s * 0.72, 0, s)
  dune.addColorStop(0, SAND_LIGHT)
  dune.addColorStop(1, SAND_MID)
  ctx.fillStyle = dune
  ctx.fill()
  ctx.restore()

  // Castle: three bucket tiers, crenellated top, a dark gate arch.
  const lw = Math.max(1.2, s * (small ? 0.045 : 0.03))
  const ground = s * 0.8
  const tiers = [
    { w: 0.62, h: 0.2 },
    { w: 0.46, h: 0.17 },
    { w: 0.32, h: 0.15 }
  ]
  const cx = s / 2
  let y = ground
  const shapes: Array<{ x0: number; x1: number; y0: number; y1: number; inset: number }> = []
  for (const t of tiers) {
    const tw = t.w * s
    const th = t.h * s
    shapes.push({ x0: cx - tw / 2, x1: cx + tw / 2, y0: y - th, y1: y, inset: tw * 0.06 })
    y -= th
  }
  const top = shapes[shapes.length - 1]
  // Flag before the castle so the top tier covers the toothpick's foot.
  if (top) drawFlag(ctx, cx + s * 0.01, top.y0 + s * 0.03, s * 0.3, 0.06)

  ctx.lineJoin = 'round'
  shapes.forEach((sh, i) => {
    ctx.beginPath()
    if (i === shapes.length - 1) {
      // Crenellated top tier.
      const mw = (sh.x1 - sh.x0) / 5
      const mh = s * 0.045
      ctx.moveTo(sh.x0, sh.y1)
      ctx.lineTo(sh.x0, sh.y0)
      for (let m = 0; m < 5; m++) {
        const mx = sh.x0 + m * mw
        if (m % 2 === 0) {
          ctx.lineTo(mx + mw, sh.y0)
          if (m < 4) ctx.lineTo(mx + mw, sh.y0 + mh)
        } else {
          ctx.lineTo(mx + mw, sh.y0 + mh)
          ctx.lineTo(mx + mw, sh.y0)
        }
      }
      ctx.lineTo(sh.x1, sh.y1)
    } else {
      ctx.moveTo(sh.x0, sh.y1)
      ctx.lineTo(sh.x0 + sh.inset, sh.y0)
      ctx.lineTo(sh.x1 - sh.inset, sh.y0)
      ctx.lineTo(sh.x1, sh.y1)
    }
    ctx.closePath()
    const g = ctx.createLinearGradient(sh.x0, 0, sh.x1, 0)
    g.addColorStop(0, '#fbecc4')
    g.addColorStop(0.35, SAND_LIGHT)
    g.addColorStop(0.7, SAND_MID)
    g.addColorStop(1, SAND_DARK)
    ctx.fillStyle = g
    ctx.fill()
    if (!small) {
      // Mould ridges.
      ctx.save()
      ctx.clip()
      ctx.fillStyle = 'rgba(150, 105, 50, 0.25)'
      for (let ry = sh.y0 + s * 0.05; ry < sh.y1; ry += s * 0.05) ctx.fillRect(sh.x0, ry, sh.x1 - sh.x0, Math.max(1, s * 0.008))
      ctx.restore()
    }
    ctx.strokeStyle = OUTLINE
    ctx.lineWidth = lw
    ctx.stroke()
  })
  // Gate arch in the bottom tier.
  const base = shapes[0]
  if (!base) { ctx.restore(); return }
  const aw = s * 0.085
  const ah = (base.y1 - base.y0) * 0.72
  ctx.beginPath()
  ctx.moveTo(cx - aw, base.y1)
  ctx.lineTo(cx - aw, base.y1 - ah + aw)
  ctx.arc(cx, base.y1 - ah + aw, aw, Math.PI, 0)
  ctx.lineTo(cx + aw, base.y1)
  ctx.closePath()
  ctx.fillStyle = '#6e4d2a'
  ctx.fill()

  // Tile rim: a soft yellow plastic edge.
  ctx.beginPath()
  ctx.roundRect(lw / 2, lw / 2, s - lw, s - lw, r - lw / 2)
  ctx.strokeStyle = small ? 'rgba(23, 58, 102, 0.9)' : '#ffd65a'
  ctx.lineWidth = lw
  ctx.stroke()
  ctx.restore()
}

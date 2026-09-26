import { blockDef, GATE_ID, isShip, tierOf } from '@/game/blocks'
import { CLEAN_FEED } from '@/game/cleanFeed'
import { rulesNow } from '@/game/rules'
import { tierStyle, TIER_RUNGS } from '@/game/tierStyle'
import { TIER_ART_WEAPONS, tierFixtureArt, tierFixtureId, enemyStillArt } from '@/game/paintedArt'
import { enemyDef } from '@/game/enemies'
import {
  themedPalette, spriteFor, withAlpha, mixHex, onArtChanged, type Palette
} from '@/game/art'
import { isBossWave } from '@/game/waves'
import {
  monsterFrame, monsterFaces, monsterAnchor, pickMonster, primeMonsterSprites,
  allMonsterIds, SPRITE_FOOT_R, SPRITE_HEIGHT_R
} from '@/game/monsterSprites'
import { stripFrame } from '@/game/spriteStrip'
import {
  drawSquirtMount, drawSquirtGun, drawBlasterMount, drawDartBlaster, drawMudMortar,
  drawBalloonLauncher, drawBugZapper, drawIcePop, drawToothpicks, drawPaperFlag,
  drawMagicShell, drawSandSifter, drawPebbleDigger, drawPiggyBank, drawBucketSpade
} from '@/game/toyFixtures'
import {
  blob, fillShape, grain, ink, noise2, shrink, stroke as inkStroke, withHatching,
  type Pt
} from '@/game/inkArt'
import {
  drawFoamDart, drawToothpick, drawWaterBlob, drawPebble, drawMudBall, drawBalloon,
  drawHoneyBomb, drawEmberCore, dropTrail, drawSplashBlast, drawSplatBlast, drawPuffBlast,
  dartSmear, BALLOON_RGB
} from '@/game/fxArt'

/**
 * ─── Drawn scenery ──────────────────────────────────────────────────────────
 *
 * The cast is inked; the landscape was not. Mountains were a vertical gradient
 * with a hairline stroke, the tree line a flat polygon, the lake a flat wash —
 * competent, and unmistakably generated. A reviewer who sees hand-drawn
 * characters standing in front of gradient scenery reads the whole screen as
 * machine-made, which is precisely the note this game came back with.
 *
 * All of it goes into `bgCanvas`, which is cached and only re-rendered when the
 * camera moves far enough to matter, so contours and paper tooth here cost
 * nothing per frame.
 */
/**
 * Painted scenery, when there is any.
 *
 * The blocks proved the point: a hand-painted bitmap reads as hand-painted, and
 * no amount of tuning shared drawing constants gets procedural code there. The
 * scenery is the larger half of the screen and almost none of it animates, so
 * it takes bitmaps far more comfortably than the cast does.
 *
 * Every one of these is OPTIONAL. A missing file leaves the procedural drawing
 * exactly as it was, so the landscape can be adopted one piece at a time.
 */
const bgSprite = (id: string): HTMLImageElement | null => spriteFor('bg', id)

/**
 * The opaque bounds of a drop-in bitmap, in its own pixels.
 *
 * A painted tree arrives with transparent margin around it — the conifer has 26
 * px of empty space under its trunk out of 512. Blitting the whole frame with
 * its bottom on the ground line therefore stands the tree 5% of its height in
 * the air, which is exactly what "the trees are floating" looks like.
 *
 * Measured once per image and cached: the scan is a full `getImageData`, and
 * the answer cannot change for a decoded bitmap.
 */
const spriteBoxes = new WeakMap<HTMLImageElement, { x: number; y: number; w: number; h: number }>()

const spriteBox = (img: HTMLImageElement): { x: number; y: number; w: number; h: number } => {
  const hit = spriteBoxes.get(img)
  if (hit) return hit
  const W = img.naturalWidth
  const H = img.naturalHeight
  let box = { x: 0, y: 0, w: W, h: H }
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const c = cv.getContext('2d')
  if (c) {
    c.drawImage(img, 0, 0)
    const d = c.getImageData(0, 0, W, H).data
    let x0 = W, y0 = H, x1 = -1, y1 = -1
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (d[(y * W + x) * 4 + 3]! < 8) continue
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
    if (x1 >= 0) box = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }
  }
  spriteBoxes.set(img, box)
  return box
}

/**
 * Blit a painted tree standing ON `baseY`, at `hgt` from root to crown.
 *
 * Sized and placed from the artwork's own bounds rather than the frame's, so
 * the trunk meets the ground whatever margin the painter left.
 */
const paintedTree = (
  c: CanvasRenderingContext2D, img: HTMLImageElement,
  x: number, baseY: number, hgt: number
): void => {
  const b = spriteBox(img)
  const w = hgt * (b.w / b.h)
  c.drawImage(img, b.x, b.y, b.w, b.h, x - w / 2, baseY - hgt, w, hgt)
}

/**
 * Blit a horizontally tileable band, scrolled by its own parallax.
 *
 * The ridges and the ground bands are generated from noise across an infinite
 * world, so their replacement cannot be one image pinned to the frame — it has
 * to repeat, and it has to slide at the same rate the procedural version did or
 * the depth cue breaks.
 */
const tileBand = (
  c: CanvasRenderingContext2D, img: HTMLImageElement | HTMLCanvasElement,
  x0: number, y: number, w: number, h: number, offset: number
): void => {
  const iw = 'naturalWidth' in img ? img.naturalWidth : img.width
  const ih = 'naturalHeight' in img ? img.naturalHeight : img.height
  const scale = h / ih
  const tw = Math.max(1, iw * scale)

  // MIRROR every other tile.
  //
  // The prompt asks for a seamless left-to-right join and the painter does not
  // reliably deliver one — the lake shipped with a hard vertical line every
  // tile width, which is the most obvious possible tell that the background is
  // a repeated image.
  //
  // Flipping alternate copies makes the join continuous by CONSTRUCTION: tile
  // N's right-hand column and the mirrored tile N+1's left-hand column are the
  // same pixels, so there is nothing to match up and nothing to get wrong. The
  // cost is a mirrored repeat, which on water, grass and rock reads as nothing
  // at all — and a period of two tiles rather than one actually makes the
  // repetition harder to spot.
  const period = tw * 2
  const start = x0 - (((offset % period) + period) % period)
  for (let i = 0; start + i * tw < x0 + w; i++) {
    const sx = start + i * tw
    if (sx + tw <= x0 - tw) continue
    // One pixel of overlap. `tw` is fractional, so abutting tiles land on
    // sub-pixel boundaries and leave a hairline of whatever is behind showing
    // through — which on a lake reads as a scratch down the water.
    const over = tw + 1
    if (i % 2 === 0) {
      c.drawImage(img, sx, y, over, h)
    } else {
      c.save()
      c.translate(sx + tw, y)
      c.scale(-1, 1)
      c.drawImage(img, -1, 0, over, h)
      c.restore()
    }
  }
}

import { rotatedShape, SHAPE_BY_ID } from '@/game/shapes'
import { drawSiegeMachine } from '@/game/siegeArt'
import { drawShip, type ShipLayer } from '@/game/shipArt'
import {
  bodyLook, traceBlockBody, paintBlockMaterial, paintSandDamage, drawBucketRoof
} from '@/game/sandBlockArt'
import { drawCavalry, cavalryCycle01, drawCavalryDust } from '@/game/cavalryArt'
import { ALLY_DEFS } from '@/game/allies'
import { GRASS_DEPTH, SEA_LEVEL } from '@/game/world'
import {
  setBackyardLight, backyardNight, nightOf, stormOf, STORM_SKY, mixCss, cssAlpha,
  paintSunSprite, paintMoonSprite, paintStars, paintClouds, paintYardFar, paintYardNear,
  paintBedBack, paintTallFlower, paintFlowerClump, paintFlowerBed, paintSand, paintSandboxFrame,
  paintMoat, paintFireflies, sandTile
} from '@/game/backyardArt'
import type { Ally, Block, Enemy, EnemyDef, Projectile } from '@/game/types'
import {
  getBlocks, getTowerBlocks, getEnemies, getProjectiles, getAllies, getDebris, nowMs, phase,
  wave, gameSpeed, spanW, spanH, centreX, centreY, isFlamingSiege, effectiveRangeMul
} from '@/use/useTowerGame'
import {
  worldToScreenX, worldToScreenY, getZoom, viewRect, updateCamera
} from '@/use/useTowerCamera'
import {
  drainFx, emit, emitText, emitDecal, stepParticles, stepTexts, stepDecals,
  drawParticles, getTexts, getDecals, sampleFrame, quality, setParticleCap, setTextCap,
  type FxEvent
} from '@/use/useTowerVfx'
import type { RenderProfile } from '@/use/useDeviceTier'
import { override } from '@/use/perfVariants'
import { perf } from '@/use/usePerfProbe'
import { useScreenshake } from '@/use/useScreenshake'
import { playFx } from '@/use/useTowerAudio'
import {
  noteLostBlock, lostMarkSlots, lostMarkFade, noteGateHit, gateAlarm, vignette,
  rejectFlash, rejectShake, isStranded, prefersReducedMotion,
  gatePopScale, gateBlinkWhite, gateBlinkRed
} from '@/use/useWorldCues'

/**
 * ─── Renderer ───────────────────────────────────────────────────────────────
 *
 * Everything is drawn procedurally with Canvas 2D — no gameplay bitmaps ship
 * with the game. That buys resolution independence (crisp at any DPR and any
 * zoom), a near-zero art payload, and the ability to restyle the whole tower
 * from a palette table.
 *
 * Layer order (back → front):
 *   1  sky gradient + sun/moon/stars, tinted by the time of day
 *   2  backyard: clouds, houses, trees, hedge, picket fence  (parallax 0.04–0.18)
 *   3  flower bed                   (parallax 0.26–0.34)
 *   4  sandbox plank + sand lane    (parallax 1.0)
 *   5  moat water + mirrored tower reflection
 *   6  ground decals (craters)
 *   7  air enemies behind the tower, then blocks, then ground enemies
 *   8  projectiles + trails
 *   9  particles (normal pass, then additive pass)
 *  10  floating combat text, HP bars
 *  11  world-space build UI (grid, ghost, range circle)
 *
 * Layers 1–3 are cached into an offscreen canvas and only re-rendered when the
 * camera moves enough to matter — they are the most expensive and the least
 * likely to change frame-to-frame.
 */

const { triggerShake } = useScreenshake()

// ─── Block body sprite cache ────────────────────────────────────────────────
//
// The body of a block is static for a given (type, theme, damage stage, size).
// Rendering it once into an offscreen canvas and blitting thereafter turns
// ~14 canvas ops per block per frame into one `drawImage`. With 300 blocks on
// screen that is the difference between 60 fps and a slideshow on a mid phone.
//
// Size is bucketed to 6 px so a smooth zoom doesn't thrash the cache.

const spriteCache = new Map<string, HTMLCanvasElement>()
const SIZE_BUCKET = 6

const bucketed = (px: number): number => Math.max(12, Math.round(px / SIZE_BUCKET) * SIZE_BUCKET)

/**
 * Below this on-screen size, the reinforced sweep and the buff glow are two or
 * three pixels of gradient nobody can see — but they still cost a gradient and
 * a full-block fill each, per block, every frame. The RIM stays at every size,
 * because that is the part that actually carries the information.
 */
const SHINE_MIN_PX = 22

/**
 * Above this many blocks the animated shine is switched off tower-wide.
 *
 * The sweep and the buff glow are per-block animated gradients, so their cost
 * scales with the tower while their VALUE scales inversely: on a 20-block tower
 * a shimmering reinforced crate is a highlight, and on a 300-block one it is
 * three hundred things twinkling at once, which reads as visual noise and costs
 * a gradient plus a full-block fill for every one of them.
 *
 * The RIMS are never dropped. They are what tell the player a block is
 * reinforced or buffed; the shimmer is only decoration on top of them.
 */
const SHINE_MAX_BLOCKS = 50

/** Recomputed once per frame in `drawScene` — never per block. */
let shineOn = true

/** Damage stage 0 (pristine) → 2 (about to break). Drives the crack overlay. */
const damageStage = (b: Block): 0 | 1 | 2 => {
  const f = b.hp / b.maxHp
  return f > 0.66 ? 0 : f > 0.33 ? 1 : 2
}

const getBlockSprite = (typeId: string, stage: 0 | 1 | 2, sizePx: number): HTMLCanvasElement => {
  const size = bucketed(sizePx)
  const key = `${typeId}|${stage}|${size}`
  const hit = spriteCache.get(key)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  drawBlockBody(ctx, typeId, stage, size)
  spriteCache.set(key, canvas)

  // Bound the cache. Blocks × 3 stages × a handful of zoom buckets stays well
  // under this; the eviction is a safety net for pathological zoom scrubbing.
  if (spriteCache.size > 260) {
    const firstKey = spriteCache.keys().next().value
    if (firstKey) spriteCache.delete(firstKey)
  }
  return canvas
}

/**
 * The image to blit for one block face.
 *
 * Drop-in art if a bitmap has decoded for this block, the procedural bake
 * otherwise. EVERY path that paints a block body goes through here.
 *
 * It exists because the override check used to be inlined in `drawBlock` alone,
 * and two other places paint block bodies: the build-mode ghost preview and the
 * mirrored tower in the water. Both kept drawing the procedural body after real
 * art had loaded, so the piece under the pointer did not match the piece it
 * became, and the tower's own reflection disagreed with the tower.
 */
const blockFace = (
  typeId: string, stage: 0 | 1 | 2, sizePx: number
): CanvasImageSource => spriteFor('block', typeId) ?? getBlockSprite(typeId, stage, sizePx)

// ─── Block body drawing ─────────────────────────────────────────────────────

/**
 * Paint one block body into a `size × size` context at the origin.
 *
 * The shading model is deliberately consistent across every material so a tower
 * built from five block types still reads as one object: light comes from the
 * upper left, so every block gets a bright top-left bevel, a mid-tone face, an
 * ambient-occlusion gradient in the lower right, and a dark outline.
 */
const drawBlockBody = (
  ctx: CanvasRenderingContext2D,
  typeId: string,
  stage: 0 | 1 | 2,
  size: number
): void => {
  const def = blockDef(typeId)
  const p = themedPalette(def.palette)
  // Sand for the material blocks, a sand plinth wearing the toy's colour for
  // everything that carries a toy — see `sandBlockArt.ts`.
  const look = bodyLook(typeId, p)
  const ramp = look.ramp
  const inset = Math.max(1, size * 0.03)
  const w = size - inset * 2
  const radius = size * 0.1

  ctx.save()
  ctx.translate(inset, inset)

  // ── Body ──
  traceBlockBody(ctx, typeId, w, radius)
  const body = ctx.createLinearGradient(0, 0, w * 0.35, w)
  body.addColorStop(0, ramp.light)
  body.addColorStop(0.45, ramp.mid)
  body.addColorStop(1, ramp.dark)
  ctx.fillStyle = body
  ctx.fill()

  // ── Ambient occlusion in the lower-right corner ──
  // Warm, not black: shadow on sand is brown, and a grey one turns it to mud.
  const ao = ctx.createRadialGradient(w * 0.95, w * 0.95, w * 0.05, w * 0.95, w * 0.95, w * 0.95)
  ao.addColorStop(0, 'rgba(92,52,18,0.3)')
  ao.addColorStop(1, 'rgba(92,52,18,0)')
  ctx.fillStyle = ao
  traceBlockBody(ctx, typeId, w, radius)
  ctx.fill()

  // ── Material detail ──
  ctx.save()
  traceBlockBody(ctx, typeId, w, radius)
  ctx.clip()
  drawMaterial(ctx, typeId, p, w)

  // ── Specular sheen ──
  // A single soft diagonal band across the upper-left face. Sand is matte, so
  // it is fainter than it was on timber — but it is still what makes a flat
  // square read as a solid with a surface.
  const sheen = ctx.createLinearGradient(0, 0, w * 0.9, w * 0.9)
  sheen.addColorStop(0, 'rgba(255,252,238,0.2)')
  sheen.addColorStop(0.34, 'rgba(255,252,238,0.05)')
  sheen.addColorStop(0.52, 'rgba(255,252,238,0)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, w, w)
  // Grounded lower edge: a dark band along the bottom so blocks stack with a
  // visible seam instead of melting into one another.
  const foot = ctx.createLinearGradient(0, w * 0.8, 0, w)
  foot.addColorStop(0, 'rgba(80,44,14,0)')
  foot.addColorStop(1, 'rgba(80,44,14,0.36)')
  ctx.fillStyle = foot
  ctx.fillRect(0, w * 0.8, w, w * 0.2)

  // ── Top-left bevel highlight ──
  // Clipped with the rest: the Gate's battlements would otherwise have it
  // drawn straight across their gaps.
  ctx.strokeStyle = 'rgba(255,250,232,0.42)'
  ctx.lineWidth = Math.max(1, w * 0.05)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(radius * 0.8, w * 0.05)
  ctx.lineTo(w - radius * 0.8, w * 0.05)
  ctx.moveTo(w * 0.05, radius * 0.8)
  ctx.lineTo(w * 0.05, w - radius * 0.8)
  ctx.stroke()
  ctx.restore()

  // ── Outline ──
  // Two strokes: a warm ink contact line first, then the rim inside it — the
  // material's own edge, or the toy's plastic on a plinth. The ink pass is what
  // separates the castle from a busy background at small zooms.
  traceBlockBody(ctx, typeId, w, radius)
  ctx.lineJoin = 'round'
  ctx.strokeStyle = 'rgba(59,42,33,0.9)'
  ctx.lineWidth = Math.max(1.5, w * 0.075)
  ctx.stroke()
  ctx.strokeStyle = withAlpha(look.rim, 0.9)
  ctx.lineWidth = Math.max(1, w * 0.04 * look.rimK)
  ctx.stroke()

  // ── Damage: sand crumbling ──
  if (stage === 1 || stage === 2) drawCracks(ctx, w, stage, typeId, ramp)

  ctx.restore()
}

/** Per-material surface pattern, drawn clipped to the body shape. */
const drawMaterial = (ctx: CanvasRenderingContext2D, typeId: string, p: Palette, w: number): void => {
  paintBlockMaterial(ctx, typeId, p, w)
}

/** Deterministic sand crumbling — same block always crumbles the same way, so
 *  the damage read is stable rather than shimmering between frames. Stage 2
 *  knocks real chunks out of the sprite, so it reads in silhouette too. */
const drawCracks = (
  ctx: CanvasRenderingContext2D, w: number, stage: 1 | 2,
  typeId: string, ramp: { light: string; mid: string; dark: string }
): void => {
  paintSandDamage(ctx, typeId, ramp, w, stage)
}

/**
 * The roof cap on a roofed block: an upside-down red toy bucket.
 *
 * It has to be readable at a glance from across the tower, because "can I build
 * on this?" is a question the player asks constantly — so it is drawn OUTSIDE
 * the cell (overhanging the top edge) in a saturated toy red that no block
 * material uses. One blit, impossible to miss.
 */
const drawRoof = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void => {
  const halfW = size * 0.62
  const peak = size * 0.42
  const baseY = cy - size * 0.5

  // A painted gable, when there is one.
  //
  // The roof is stacked on TOP of whatever the block bitmap is, so a flat red
  // vector gable over a hand-painted crate is the one seam a player cannot
  // help seeing — the block changed and the thing sitting on it did not.
  //
  // Drawn from the artwork's own bounds and overhanging the cell exactly as the
  // drawn gable does, so a roofed shape keeps the footprint it always had.
  const painted = bgSprite('roof')
  if (painted?.naturalWidth) {
    const b = spriteBox(painted)
    const rw = halfW * 2
    const rh = rw * (b.h / b.w)
    ctx.drawImage(painted, b.x, b.y, b.w, b.h, cx - halfW, baseY + size * 0.1 - rh, rw, rh)
    return
  }

  // The upside-down red toy bucket — a turret cap with a castle-mould top.
  // Same overhang and height as the gable it replaced, baked per size.
  drawBucketRoof(ctx, cx, cy, size)
}

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void => {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

// ─── Weapon fixtures (drawn live — they rotate and recoil) ──────────────────

/** Elevation of a mortar tube, radians above horizontal. Shared with the
 *  muzzle flash so the flame leaves the actual mouth of the actual barrel. */
const MORTAR_ELEV = 0.98
/** The bombard drops it just over the wall, so it sits far steeper. */
const BOMBARD_ELEV = 1.24

const drawFixture = (
  ctx: CanvasRenderingContext2D, b: Block, cx: number, cy: number, s: number,
  t: number, layer: FixtureLayer = 'all'
): void => {
  const def = blockDef(b.typeId)
  const p = themedPalette(def.palette)
  const recoil = b.recoil * s * 0.12
  // The weld depth, for the toy's stickers and extra parts (see toyFixtures).
  const tier = tierOf(b.tier)
  // A gun with a grip and a top face flips across its own axis once it points
  // back over the tower, so it never hangs upside-down (as `shipArt` does).
  const flip = Math.cos(b.aim) < 0

  ctx.save()
  ctx.translate(cx, cy)

  switch (b.typeId) {
    case 'cannon': {
      // Squirt Gun. The swivel stand first, in BLOCK space — it does not
      // rotate with the gun.
      if (layer !== 'weapon') drawSquirtMount(ctx, s)

      ctx.rotate(-b.aim)
      ctx.translate(-recoil, 0)
      if (flip) ctx.scale(1, -1)
      // The world's horizontal in the gun's frame, so the tank water lies level.
      drawSquirtGun(ctx, s, b.recoil, tier, Math.cos(b.aim), flip ? -Math.sin(b.aim) : Math.sin(b.aim))
      break
    }
    case 'archer': {
      // Dart Blaster. Its tripod stands in block space, like the old parapet.
      if (layer !== 'weapon') drawBlasterMount(ctx, s)

      ctx.rotate(-b.aim)
      ctx.translate(-recoil * 0.6, 0)
      if (flip) ctx.scale(1, -1)
      // Loaded at rest; the dart is gone and the slide racked while `recoil`
      // is still up, which is what reads as "it just fired".
      drawDartBlaster(ctx, s, b.recoil, tier)
      break
    }
    case 'mortar': {
      // Fixed steep angle — mortars lob, they don't track. The tube is built
      // along +x like the cannon's and then rotated onto its elevation, so one
      // angle serves the drawing, the recoil and the muzzle flash. (Built
      // pointing "up" and mirrored by negating the angle, a right-hand column
      // aimed its mouth down into its own carriage.)
      // Mud Mortar: a toy sand bucket for a tube, a mud ball in its mouth.
      // Flipped across its own axis on the left flank so the handle hangs
      // down and the lit side stays up.
      const lob = lobAngle(b.c, MORTAR_ELEV)
      ctx.rotate(-lob)
      ctx.translate(-recoil, 0)
      if (Math.cos(lob) < 0) ctx.scale(1, -1)
      drawMudMortar(ctx, s, b.recoil, tier)
      break
    }
    case 'tesla': {
      // Bug Zapper: a glowing grid lantern; the pulse telegraphs "this one
      // chains", and the arcs leave from the hook on its roof.
      const pulse = 0.5 + 0.5 * Math.sin(t / 150)
      drawBugZapper(ctx, s, pulse, tier, p)
      break
    }
    case 'frost': {
      // Ice Pop: a giant ice pop on its stick; the old crystals are its
      // frost glints now, breathing on the same clock.
      const pulse = 0.5 + 0.5 * Math.sin(t / 320)
      drawIcePop(ctx, s, pulse, tier)
      break
    }
    case 'spikes': {
      // Toothpicks on all four faces. They point OUT of the block on every
      // side because the thorns rule fires no matter which face gets hit, and
      // art that only spiked the top would lie about that.
      const glint = 0.55 + 0.45 * Math.sin(t / 420 + b.c * 1.7)
      drawToothpicks(ctx, s, glint)
      break
    }
    case 'bombard': {
      // Squat wide-mouthed barrel on a steep fixed elevation. Unlike the mortar
      // it recoils straight DOWN into its pit, which is the visual difference
      // between "lobs far" and "drops it just over the wall".
      // Balloon Launcher: a cardboard launch tube on a plastic pivot, a water
      // balloon sitting in its mouth.
      const lob = lobAngle(b.c, BOMBARD_ELEV)
      ctx.rotate(-lob)
      ctx.translate(-recoil * 1.4, 0)
      if (Math.cos(lob) < 0) ctx.scale(1, -1)
      drawBalloonLauncher(ctx, s, b.recoil, tier, b.c < 0)
      break
    }
    // ── Buffs ──
    //
    // Both are drawn ABOVE the cell rather than on its face, so a banner wedged
    // into a wall still reads as a banner and not as a differently-coloured
    // crate. The aura itself is drawn separately, over the blocks it feeds —
    // see `drawBuffAura`.
    case 'banner': {
      // ── Everything here stays INSIDE the cell ──
      //
      // Blocks are drawn one after another, body then fixture, so anything a
      // fixture paints outside its own cell is painted over by whatever is
      // built next to it. The pennant used to reach x 0.59 and the finial y
      // -0.61 against a cell that ends at 0.5 — so the moment the player put a
      // block to the right or on top, the flag was sliced off mid-flap and the
      // block looked broken rather than decorated.
      //
      // The sway is part of that budget: at its extreme the tip must still be
      // inside the cell, which is what caps it at 0.09 rather than 0.14.
      // Held mid-curve rather than flat: a banner with no bend in it reads
      // as a painted plank, and stillness is not supposed to cost the cloth.
      // Paper Flag: a paper swallowtail on a toothpick mast, in the banner's
      // heraldic plum and gold, held mid-ripple.
      const sway = 0.05
      drawPaperFlag(ctx, s, sway * 0.4)
      break
    }
    case 'obelisk': {
      // Magic Seashell: a glowing scallop in its aura (the obelisk's stronger
      // aura). Its crown stays inside the cell for the banner's reason.
      drawMagicShell(ctx, s, p)
      break
    }

    // ── Early economy ──
    //
    // STILL. The support blocks stopped animating: nine fixture types each
    // re-baking a sprite every 50 ms, per lane, bought motion nobody watches
    // on a block that is not shooting — and it doubled the art, because a
    // moving part cannot be one painted still. So the wheel, the digger and
    // the coin are each drawn at one telling pose.
    case 'lumberHut': {
      // Sand Sifter: a toy sand wheel, sand pouring through it.
      drawSandSifter(ctx, s)
      break
    }
    case 'stonepit': {
      // Pebble Digger: a toy digger, its scoop full over a pebble heap.
      drawPebbleDigger(ctx, s)
      break
    }
    case 'coffer': {
      // Piggy Bank: a gold coin dropping into the slot.
      drawPiggyBank(ctx, s)
      break
    }

    case 'repair': {
      // Bucket & Spade: the old wrench is the spade.
      drawBucketSpade(ctx, s)
      break
    }
  }

  ctx.restore()
}

// ─── Fixture sprite cache ───────────────────────────────────────────────────
//
// The block BODY has been cached since the start; the fixture bolted on top of
// it never was, on the reasoning that fixtures rotate and recoil and so cannot
// be baked. That held at forty blocks and broke badly at four hundred. Every
// turret, banner and waterwheel re-tessellated a dozen vector paths and a
// couple of gradients EVERY frame, which past wave 20 is ~3,400 GPU draw calls
// per frame. Measured on a 400-block tower it pegged the raster thread at
// ~17 ms/frame while the main thread sat at 4 ms: 30 fps with the CPU idle, and
// no hot JS function to blame it on.
//
// Fixtures do animate, so they are cached against a QUANTISED copy of the state
// they animate from, and repainted only when that copy changes:
//   · aim    → 48 steps (7.5°, under a pixel at the tip of a 30 px turret)
//   · recoil → 4 steps; a shot is over in a handful of frames anyway
//   · clock  → 50 ms, with per-block offsets folded into 8 lanes, so a row of
//              banners still ripples out of step without each banner demanding
//              a sprite of its own
//
// Lanes are staggered against the clock so they do not all fall stale on the
// same frame — otherwise every repaint in the scene bunches into one spike
// three times a second, which is worse than the problem being solved.

/** Sprite box for a fixture, as a multiple of the fixture's own scale. It is
 *  also the box a painted weapon or mount is authored and blitted in. */
export const FIXTURE_BOX = 2
const FIXTURE_LANES = 8
const FIXTURE_PHASE_MS = 50
const FIXTURE_AIM_STEPS = 48
const FIXTURE_CACHE_MAX = 640
const TAU = Math.PI * 2

/**
 * Which part of a block's fixture to draw.
 *
 * `weapon` is everything past `ctx.rotate(-b.aim)` — the part that tracks a
 * target — and leaves out what it is bolted to: the squirt gun's swivel stand,
 * the dart blaster's tripod. Only those two have such a part, and only the art bench
 * ever asks for this: a painted gun has to be authored WITHOUT its carriage,
 * or the wheels swing through the air every time the block turns.
 *
 * The carriage itself is not painted. It was going to be — there were mount
 * sheets for both — and a barrel sitting straight on the block turned out to
 * read fine, so two sheets and a whole probed folder came back out.
 */
export type FixtureLayer = 'all' | 'weapon'

/** Fixtures whose art tracks a target. */
const AIMED_FIXTURES = new Set(['cannon', 'archer'])
/**
 * How much bigger a painted fixture is blitted than the box it was fitted to.
 *
 * A deliberate override of the fit, not a correction to it, and it is per
 * fixture because the reason is per fixture.
 *
 * FROST: the drawn emitter is a small crystal cluster inside a wide soft
 * glow, and the glow is most of what a player sees. The painting has no glow,
 * so a crystal fitted to the drawn crystal reads as a chip of ice on an empty
 * plate. Its return also measures larger than it is — half-keyed speckle from
 * the glow it was painted with survives the key and inflates the box the fit
 * is computed from — so the fit lands it at two thirds of even that.
 *
 * TESLA: no such story. It just reads small next to the coil it replaces.
 */
const FIXTURE_ART_SCALE: Record<string, number> = {
  // Re-trimmed when the fit moved from "inside the box" to "the box's
  // area": every painting got its height back, so each knob had to give up
  // the share of the growth the fit is now doing itself. They are targets
  // against the DRAWN fixture — frost about 1.6x it, tesla about 1.2x,
  // the hut about level — not multipliers anyone should read on their own.
  frost: 1.5,
  tesla: 1.12,
  archer: 1.25,
  // The drawn crane is a small thing in a big box; the painting matched it
  // faithfully and read as a matchstick on a crate.
  repair: 1.7,
  // The drawn hut carries a curl of smoke the painting leaves out, so the
  // reference box is taller than the roof that has to fill it.
  lumberHut: 1.35
}

/**
 * Where a painted fixture sits, nudged, in fractions of its sprite box.
 *
 * Empty on purpose. It held the banner (dragged back to centre) and the
 * lumber hut (lifted back onto its block) while the slicer registered a
 * fixture against the drawing it replaced; the slicer now centres every
 * fixture in its box, so both corrections would push a centred part OFF
 * centre by the same amount. Kept as the knob for the next one-off.
 */
const FIXTURE_ART_NUDGE: Record<string, [number, number]> = {}

/**
 * Where a painted fixture's ink actually sits inside its file, 0..1.
 *
 * Measured once per bitmap, off a thumbnail — a bounding box does not need
 * full resolution — and kept on a WeakMap so it dies with the image.
 *
 * Growing a sprite has to happen about its CONTENT. A fixture file is mostly
 * empty, and its part is not in the middle of it: the frost crystal sits a
 * fifteenth of a box below centre, so scaling about the middle at 2.25x also
 * pushed it a fifth of a cell downwards, into the block it stands on. "Make
 * it bigger" must not also mean "and move it".
 */
const artCentres = new WeakMap<HTMLImageElement, { x: number; y: number }>()

const artCentre = (img: HTMLImageElement): { x: number; y: number } => {
  const known = artCentres.get(img)
  if (known) return known
  const centre = { x: 0.5, y: 0.5 }
  const w = img.naturalWidth, h = img.naturalHeight
  if (w > 0 && h > 0) {
    const c = document.createElement('canvas')
    c.width = Math.max(1, Math.round(w / 8))
    c.height = Math.max(1, Math.round(h / 8))
    const cc = c.getContext('2d', { willReadFrequently: true })
    if (cc) {
      cc.drawImage(img, 0, 0, c.width, c.height)
      const d = cc.getImageData(0, 0, c.width, c.height).data
      let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1
      for (let y = 0; y < c.height; y++) {
        for (let x = 0; x < c.width; x++) {
          if (d[(y * c.width + x) * 4 + 3]! <= 24) continue
          if (x < x0) x0 = x
          if (x > x1) x1 = x
          if (y < y0) y0 = y
          if (y > y1) y1 = y
        }
      }
      if (x1 >= 0) {
        centre.x = ((x0 + x1 + 1) / 2) / c.width
        centre.y = ((y0 + y1 + 1) / 2) / c.height
      }
    }
  }
  artCentres.set(img, centre)
  return centre
}

/** Fixtures a painted bitmap is looked for: all thirteen. */
const FIXTURE_ART = new Set([
  'cannon', 'archer', 'mortar', 'bombard', 'tesla', 'frost', 'spikes',
  'banner', 'obelisk', 'lumberHut', 'stonepit', 'coffer', 'repair'
])

/** Fixtures that kick when they fire. */
const RECOIL_FIXTURES = new Set(['cannon', 'archer', 'mortar', 'bombard'])
/** Lobbers: fixed elevation, but mirrored by which side of the tower they sit on. */
const LOBBED_FIXTURES = new Set(['mortar', 'bombard'])
/**
 * Fixtures that animate off the clock rather than off combat.
 *
 * Three, and they are all WEAPONS. The nine support blocks used to be here
 * too — a spinning blade, a rocking pick, a swaying banner, a bobbing stack
 * of coins — and each one of them meant a fresh sprite bake every 50 ms, per
 * lane, for every support type on the board. That is a per-frame cost paid
 * continuously for motion on the blocks a player is not looking at, and it
 * also doubled the art: a part that moves cannot be one painted still, so
 * each of the nine would have needed a cycle strip. They are drawn at a
 * fixed pose now and bake once per type and scale, for the life of the page.
 */
const TIMED_FIXTURES = new Set(['tesla', 'frost', 'spikes'])

type FixtureSprite = { cv: HTMLCanvasElement; c2d: CanvasRenderingContext2D; box: number; phase: number }

const fixtureCache = new Map<string, FixtureSprite>()
let fixtureDpr = 0

/** Stand-in Block carrying only the six fields `drawFixture` reads. Reused
 *  rather than reallocated: painting is synchronous, so one is always enough.
 *  `tier` is already in the sprite key; the toy reads it for its stickers. */
const fixtureProxy = { typeId: '', aim: 0, recoil: 0, uid: 0, c: 0, tier: 1 } as unknown as Block

/**
 * Paint one block's fixture at `cx, cy`, cached sprite or live drawing.
 *
 * The tower, the build ghost and the playground all go through here, so what
 * a test scene shows is what the battlefield draws — down to which of the two
 * paths a given fixture took.
 */
const blitFixture = (
  ctx: CanvasRenderingContext2D, b: Block, cx: number, cy: number, s: number, t: number
): void => {
  const sprite = getFixtureSprite(b, s, t)
  if (sprite) {
    const box = s * FIXTURE_BOX
    ctx.drawImage(sprite.cv, cx - box / 2, cy - box / 2, box, box)
  } else {
    drawFixture(ctx, b, cx, cy, s, t)
  }
}

/**
 * The sprite for `b`'s fixture at scale `s`, painting it first if this is a new
 * bucket or if its clock bucket has moved on.
 */
const getFixtureSprite = (b: Block, s: number, t: number): FixtureSprite | null => {
  const type = b.typeId
  const aimed = AIMED_FIXTURES.has(type)
  const timed = TIMED_FIXTURES.has(type)
  const lobbed = LOBBED_FIXTURES.has(type)
  // Nothing about a support fixture varies any more — and that is a reason
  // to cache it, not a reason to skip it. Freezing the nine took them out of
  // every one of these sets, this gate started returning null for them, and
  // the caller fell back to drawing them live: painted art never got a look
  // in, and a static fixture paid a full procedural draw on every frame of
  // every block. Anything with a fixture at all is cached; the ones that do
  // not move simply bake once and are blitted forever.
  if (!aimed && !timed && !lobbed && !RECOIL_FIXTURES.has(type)
    && !FIXTURE_ART.has(type)) return null

  const scale = bucketed(s)
  const aimQ = aimed
    ? ((Math.round((b.aim / TAU) * FIXTURE_AIM_STEPS) % FIXTURE_AIM_STEPS) + FIXTURE_AIM_STEPS) % FIXTURE_AIM_STEPS
    : 0
  const recQ = RECOIL_FIXTURES.has(type) ? Math.min(3, Math.max(0, Math.round(b.recoil * 3))) : 0
  const side = lobbed && b.c < 0 ? 1 : 0
  const lane = timed ? ((((b.uid | 0) * 7 + (b.c | 0)) % FIXTURE_LANES) + FIXTURE_LANES) % FIXTURE_LANES : 0
  const phase = timed
    ? Math.floor((t + (lane * FIXTURE_PHASE_MS) / FIXTURE_LANES) / FIXTURE_PHASE_MS)
    : -1

  // The weld depth is part of what the sprite shows (see `paintTieredFixture`).
  // `paintLiveFixture` hands in tier 0 for "no block", hence the floor.
  const tier = Math.min(TIER_RUNGS, Math.max(1, tierOf(b.tier)))
  const key = `${type}|${scale}|${aimQ}|${recQ}|${side}|${lane}|${tier}`
  let e = fixtureCache.get(key)
  if (e) {
    // Re-inserting is what keeps the Map in least-recently-used order.
    fixtureCache.delete(key)
    fixtureCache.set(key, e)
    if (e.phase === phase) return e
  } else {
    const ss = Math.min(2, Math.max(1, fixtureDpr || 1))
    const box = Math.max(8, Math.round(scale * FIXTURE_BOX))
    const cv = document.createElement('canvas')
    cv.width = Math.round(box * ss)
    cv.height = Math.round(box * ss)
    const c2d = cv.getContext('2d')!
    c2d.scale(ss, ss)
    e = { cv, c2d, box, phase: Number.NaN }
    fixtureCache.set(key, e)
    if (fixtureCache.size > FIXTURE_CACHE_MAX) {
      const oldest = fixtureCache.keys().next().value
      if (oldest !== undefined && oldest !== key) fixtureCache.delete(oldest)
    }
  }

  // Paint from the QUANTISED state, never from `b` directly: two blocks sharing
  // a key must agree about what the cached image shows, and whichever of them
  // happened to paint it does not get to decide.
  const px = fixtureProxy as unknown as { typeId: string; aim: number; recoil: number; uid: number; c: number; tier: number }
  px.typeId = type
  px.aim = aimed ? (aimQ / FIXTURE_AIM_STEPS) * TAU : b.aim
  px.recoil = recQ / 3
  px.uid = lane
  px.c = lobbed ? (side ? -1 : 1) : lane
  px.tier = tier

  const g = e.c2d
  g.clearRect(0, 0, e.box, e.box)
  const clock = timed ? phase * FIXTURE_PHASE_MS : t

  // A painted weapon, if one has been dropped in.
  //
  // It goes into the SAME cached sprite the drawing goes into, which is what
  // makes this cheap: the cache is already bucketed by aim, recoil and side,
  // so one still at aim zero serves all 48 firing angles and is re-blitted
  // only when a block actually swings. The mount is laid down first and
  // unrotated — painted too, if there is art for it, and drawn otherwise —
  // because a carriage that turns with its barrel swings its wheels through
  // the air.
  const gun = FIXTURE_ART.has(type) ? spriteFor('fixture', type) : null
  if (tier <= 1) {
    paintOneGun(g, gun, e.box, type, aimed, side, scale, clock, 0, 0, 1, 'all')
  } else {
    paintTieredFixture(e, gun, type, aimed, side, scale, clock, tier)
  }
  e.phase = phase
  return e
}

/**
 * One copy of a fixture into `g`, whose origin is the sprite's top-left.
 *
 * `ox, oy` shift it in the GUN'S OWN frame — along the barrel and across it —
 * and `k` scales it, both in units of the fixture scale. Every fixture on the
 * battlefield is the one copy at (0, 0, 1), merged or not: a merged gun grows
 * through the span it is baked at (see `fixtureArtSpan`), never through more
 * copies of itself.
 *
 * `artId` names the painting `gun` is, for its size and placement knobs: a
 * painted merged tier (`cannon-t2`) may carry its own, and falls back to its
 * weapon's — it was painted by the same hand, over the same kind of drawing,
 * and comes back with the same habits.
 */
const paintOneGun = (
  g: CanvasRenderingContext2D, gun: HTMLImageElement | null, box: number,
  type: string, aimed: boolean, side: number, scale: number, clock: number,
  ox: number, oy: number, k: number, layer: FixtureLayer, artId: string = type
): void => {
  const px = fixtureProxy as unknown as { aim: number; recoil: number }
  if (gun) {
    g.save()
    g.translate(box / 2, box / 2)
    if (aimed) g.rotate(-px.aim)
    // Lobbers do not aim; they are mirrored by which side of the tower they
    // stand on, so both flanks throw outward.
    if (side) g.scale(-1, 1)
    g.translate(ox * scale - px.recoil * scale * 0.12, oy * scale)
    if (k !== 1) g.scale(k, k)
    // Grown about its own ink, so a fixture that reads too small next to the
    // drawing it replaces can be given back the size without re-slicing it —
    // and without sliding out of the place the fit put it.
    const grow = FIXTURE_ART_SCALE[artId] ?? FIXTURE_ART_SCALE[type] ?? 1
    const [nx, ny] = FIXTURE_ART_NUDGE[artId] ?? FIXTURE_ART_NUDGE[type] ?? [0, 0]
    if (grow === 1) {
      g.drawImage(gun, -box / 2 + nx * box, -box / 2 + ny * box, box, box)
    } else {
      const gw = box * grow
      const c = artCentre(gun)
      // Solve for the offset that leaves the content's centre where it was:
      // it sits at (c - 0.5) * box today, and at (c - 0.5) * gw once grown.
      const off = (v: number): number => (v - 0.5) * (box - gw)
      g.drawImage(
        gun,
        -gw / 2 + off(c.x) + nx * box,
        -gw / 2 + off(c.y) + ny * box,
        gw, gw
      )
    }
    g.restore()
    return
  }
  // The drawing rotates itself, so the gun-frame offset is rotated here to
  // land in the same place the painted path's `translate` puts it.
  let dx = ox
  let dy = oy
  if (aimed) {
    const ca = Math.cos(px.aim)
    const sa = Math.sin(px.aim)
    dx = ox * ca + oy * sa
    dy = -ox * sa + oy * ca
  }
  drawFixture(g, fixtureProxy, box / 2 + dx * scale, box / 2 + dy * scale, scale * k, clock, layer)
}

// ─── Merged weapons ─────────────────────────────────────────────────────────
//
// A tier-3 gun hits nine times as hard as the one it was welded from, and it
// looked exactly like it: the same barrel with a small grey "III" in the
// corner. Players read the plate as a label, not as a reason — and stopped
// welding at tier 2. So a merged weapon LOOKS like more gun.
//
// It is still ONE gun. For a while it was a twin at tier 2 and a triple
// battery from tier 3 — copies of the barrel side by side on one mount — and a
// player looking at a block reasonably asked how one box can hold two cannons:
// the weld made one block, so the picture has to be one weapon. What a weld
// buys is a BIGGER gun of the same design:
//
//   · it grows with the weld — through the span it is baked at, which is the
//     footprint's short side on the tower plus a bonus along the long side of
//     a wide weld (`gunGrowthFor`), and a step per tier on the one-cell board
//     (`fixtureSpanForCellTier`) — so tier 2 is visibly heavier than tier 1
//     and tier 3 heavier again, without a barrel swallowing the neighbours;
//   · it is washed in the tier's colour and outlined in it, so "the green one"
//     and "the blue one" are how a player tells them apart across the board;
//   · from tier 3 a soft glow of the same colour sits behind it.
//
// All of it goes into the same cached sprite the plain gun does, one bake per
// (type, tier, scale bucket), so a merged weapon costs nothing per frame
// beyond a plain one. And because it is built from whichever copy of the gun
// is in force, a PAINTED cannon grows and takes its tier colour with no new
// art.
//
// Each weapon's tier 2 and tier 3 may also be painted outright
// (`tierFixtureArt`, `src/game/paintedArt.ts`) — the same gun forged heavier,
// in the tier's trim — and a painting replaces the drawn one whole: no colour
// wash, since the painter was asked for the tier's colour and has put it in,
// and a lighter rim, so a painted blue gun and a drawn one still read as the
// same rung of the ladder. With no painting on disk nothing here changes.

/** The weapons a weld grows. Everything else keeps the plain fixture's size. */
const TIERED_WEAPONS: ReadonlySet<string> = new Set<string>(TIER_ART_WEAPONS)

/** Extra size for a gun on a weld WIDER than it is tall — 2×1, 4×2. */
export const GUN_GROWTH_WIDE = 1.3
/** The same for a TALLER-than-wide weld — 1×2, 2×4 — kept gentler, because
 *  the barrel points sideways and the room beside a tall weld is one column. */
export const GUN_GROWTH_TALL = 1.15

/**
 * How much a merged WEAPON outgrows the span its footprint's short side gives
 * it, on the tower (`mergeArt: 'footprint'`).
 *
 * The short side is what keeps a gun inside its block, and it only widens
 * every OTHER tier — 2×1 at tier 2 is as short as a single cell, so a tier-2
 * gun sized off it alone was a tier 1 with a green rim. A wide weld has a whole
 * extra cell along the barrel's own axis, and that is the room this spends:
 * at 1.3 a 2×1's cannon reaches 0.82 of a cell from its centre, inside the
 * one cell either side it stands on, while its wheels stay above the block's
 * underside. A square weld already grew both axes and gets nothing more.
 */
export const gunGrowthFor = (w: number, h: number): number =>
  w > h ? GUN_GROWTH_WIDE : h > w ? GUN_GROWTH_TALL : 1

/** Eight directions, for the rim: the silhouette stamped around itself. */
const RIM_TAPS: ReadonlyArray<readonly [number, number]> = [
  [1, 0], [-1, 0], [0, 1], [0, -1], [0.71, 0.71], [-0.71, 0.71], [0.71, -0.71], [-0.71, -0.71]
]

/**
 * Two scratch canvases for the tiered bake: the gun, and its silhouette.
 * Grown on demand and never shrunk; only the top-left `w × h` is used.
 */
let tierScratchA: HTMLCanvasElement | null = null
let tierScratchB: HTMLCanvasElement | null = null

const tierScratch = (
  w: number, h: number
): { a: CanvasRenderingContext2D; b: CanvasRenderingContext2D } => {
  if (!tierScratchA || !tierScratchB) {
    tierScratchA = document.createElement('canvas')
    tierScratchB = document.createElement('canvas')
  }
  for (const cv of [tierScratchA, tierScratchB]) {
    if (cv.width < w) cv.width = w
    if (cv.height < h) cv.height = h
  }
  return { a: tierScratchA.getContext('2d')!, b: tierScratchB.getContext('2d')! }
}

/** How strongly the tier rim is laid over a PAINTED merged weapon. */
const PAINTED_TIER_RIM_ALPHA = 0.6

const paintTieredFixture = (
  e: FixtureSprite, gun: HTMLImageElement | null, type: string,
  aimed: boolean, side: number, scale: number, clock: number, tier: number
): void => {
  const pw = e.cv.width
  const ph = e.cv.height
  const ss = pw / e.box
  const { a, b } = tierScratch(pw, ph)
  const ts = tierStyle(tier)
  const [r, gr, bl] = ts.rgb
  // A painting of this very tier, when there is one on disk and it has
  // decoded. Probed only here, on the first bake of a merged gun, so a player
  // who never welds never fetches it.
  const painting = tierFixtureArt(type, tier)

  // ── The gun ──
  //
  // ONE gun, painted exactly as the plain fixture is — the sprite's scale is
  // already the merged span, so a bigger weld hands this a bigger `scale` and
  // the gun grows without a second barrel ever going on.
  a.setTransform(1, 0, 0, 1, 0, 0)
  a.globalCompositeOperation = 'source-over'
  a.globalAlpha = 1
  a.clearRect(0, 0, pw, ph)
  a.setTransform(ss, 0, 0, ss, 0, 0)
  if (painting) {
    // The tier's own painting, authored at rest and pointing right like the
    // plain fixture, so it takes the plain fixture's aim, recoil and
    // mirroring — and no wash: the painter has put the tier's colour in.
    paintOneGun(a, painting, e.box, type, aimed, side, scale, clock, 0, 0, 1, 'all',
      tierFixtureId(type, tier))
  } else {
    paintOneGun(a, gun, e.box, type, aimed, side, scale, clock, 0, 0, 1, 'all')
    // The tier's colour washed over the toy, lightly: enough that the gun
    // itself is "the blue one", not so much that the candy plastic greys out.
    // The toy carries the tier colour itself now too — a racing stripe and a
    // star sticker from tier 2 (see `toyFixtures`) — so the wash can be light.
    a.globalCompositeOperation = 'source-atop'
    a.fillStyle = `rgba(${r},${gr},${bl},${tier >= 3 ? 0.1 : 0.07})`
    a.fillRect(0, 0, e.box, e.box)
    a.globalCompositeOperation = 'source-over'
  }

  // ── Its silhouette, in the tier's colour ──
  b.setTransform(1, 0, 0, 1, 0, 0)
  b.globalCompositeOperation = 'source-over'
  b.clearRect(0, 0, pw, ph)
  b.drawImage(a.canvas, 0, 0, pw, ph, 0, 0, pw, ph)
  b.globalCompositeOperation = 'source-in'
  b.fillStyle = ts.hex
  b.fillRect(0, 0, pw, ph)
  b.globalCompositeOperation = 'source-over'

  // ── Composed into the sprite ──
  const g = e.c2d
  if (tier >= 3) {
    const c = e.box / 2
    const glow = g.createRadialGradient(c, c, 0, c, c, scale * 0.62)
    glow.addColorStop(0, `rgba(${r},${gr},${bl},0.42)`)
    glow.addColorStop(1, `rgba(${r},${gr},${bl},0)`)
    g.fillStyle = glow
    g.beginPath()
    g.arc(c, c, scale * 0.62, 0, TAU)
    g.fill()
  }
  // ONE CSS pixel, at every size. The sprite's units are CSS px (its context
  // is pre-scaled by the DPR), so `d = 1` is a hairline on any screen.
  //
  // It used to grow with the gun — 4.5 % of the scale, three pixels and more
  // on a phone cell — and a band that thick in a flat tier colour round an
  // inked, hand-painted gun read as a sticker stuck on the art rather than as
  // part of it. The tier is still said three other ways: the wash on the metal,
  // the plate in the corner, and (from tier 3) the glow behind.
  //
  // Over a painting it is see-through as well: the painting already says
  // "blue" in its own trim. It stays at all so that a painted tier and a
  // composited one are visibly the same rung.
  const d = 1
  g.globalAlpha = painting ? PAINTED_TIER_RIM_ALPHA : 1
  for (const [tx, ty] of RIM_TAPS) {
    g.drawImage(b.canvas, 0, 0, pw, ph, tx * d, ty * d, e.box, e.box)
  }
  g.globalAlpha = 1
  g.drawImage(a.canvas, 0, 0, pw, ph, 0, 0, e.box, e.box)
}

/**
 * The DRAWN gun for a merged weapon, for the art-sheet bench.
 *
 * This is the reference a tier painting is registered against: ONE gun, in the
 * plain fixture's own box and pose, the weapon layer only (no carriage, no
 * parapet — the mount is never painted). The same outline as the plain
 * fixture's reference, on purpose: the game grows a merged gun by the span it
 * bakes it at, painted or drawn, so a tier painting that filled more of the
 * box than the plain one would be grown twice. The painting makes it HEAVIER
 * inside that outline — the prompt says how.
 *
 * It deliberately leaves out the rim, the wash and the glow. Those are laid on
 * at run time over a painting too, and a reference that showed them would be
 * painted in and then drawn again on top — a double outline on every merged
 * gun.
 *
 * Authored the way every fixture sheet is: aim zero, no recoil, clock zero.
 * The outline does not change with `tier`; the toy's tier stickers and extra
 * parts (a bigger tank, a dart drum) are drawn inside it, so the painter sees
 * what "forged heavier" means for a plastic toy.
 */
export const paintTierFixture = (
  ctx: CanvasRenderingContext2D, typeId: string,
  cx: number, cy: number, s: number, tier: number
): void => {
  const px = fixtureProxy as unknown as { typeId: string; aim: number; recoil: number; uid: number; c: number; tier: number }
  px.typeId = typeId
  px.aim = 0
  px.recoil = 0
  px.uid = 0
  px.c = 0
  px.tier = tier
  const aimed = AIMED_FIXTURES.has(typeId)
  const box = s * FIXTURE_BOX
  ctx.save()
  ctx.translate(cx - box / 2, cy - box / 2)
  paintOneGun(ctx, null, box, typeId, aimed, 0, s, 0, 0, 0, 1, 'weapon')
  ctx.restore()
}

// ─── Unit tint layer ────────────────────────────────────────────────────────
//
// Hit flashes and the frost chill are drawn with `source-atop` so they only
// light up the unit's own pixels. Composited straight onto the battlefield that
// operator sees an opaque background underneath and paints a glowing RECTANGLE
// over the scenery. So a tinted unit is painted into this scratch layer — which
// is transparent everywhere it has not drawn — and the finished, tinted result
// is stamped back onto the scene.
//
// One shared canvas, grown on demand and never shrunk: at most one unit is
// being composited at a time, and reallocating per unit would churn the GPU.

let tintCanvas: HTMLCanvasElement | null = null
let tintCtx: CanvasRenderingContext2D | null = null
let tintSize = 0
let tintDpr = 1

/**
 * Begin painting a unit into the scratch layer.
 *
 * Returns a context pre-translated so that the caller's usual
 * `translate(cx, cy)` lands on the centre of the layer — the drawing code is
 * therefore identical whether or not it is being tinted.
 */
const beginUnitLayer = (cx: number, cy: number, pad: number): CanvasRenderingContext2D => {
  const size = Math.max(16, Math.ceil(pad * 2))
  if (!tintCanvas) {
    tintCanvas = document.createElement('canvas')
    tintCtx = tintCanvas.getContext('2d')
  }
  if (size > tintSize || tintCanvas.width !== Math.ceil(size * tintDpr)) {
    tintSize = Math.max(size, tintSize)
    tintCanvas.width = Math.ceil(tintSize * tintDpr)
    tintCanvas.height = Math.ceil(tintSize * tintDpr)
  }
  const c = tintCtx!
  c.setTransform(1, 0, 0, 1, 0, 0)
  c.clearRect(0, 0, tintCanvas.width, tintCanvas.height)
  c.globalCompositeOperation = 'source-over'
  c.globalAlpha = 1
  c.setTransform(tintDpr, 0, 0, tintDpr, (pad - cx) * tintDpr, (pad - cy) * tintDpr)
  return c
}

/** Apply the tints and stamp the finished unit back onto the scene. */
const endUnitLayer = (
  target: CanvasRenderingContext2D,
  cx: number, cy: number, pad: number, tints: string[]
): void => {
  const c = tintCtx
  if (!c || !tintCanvas) return
  const size = Math.max(16, Math.ceil(pad * 2))
  c.setTransform(tintDpr, 0, 0, tintDpr, 0, 0)
  c.globalAlpha = 1
  c.globalCompositeOperation = 'source-atop'
  for (const tint of tints) {
    c.fillStyle = tint
    c.fillRect(0, 0, size, size)
  }
  c.globalCompositeOperation = 'source-over'
  target.drawImage(
    tintCanvas,
    0, 0, Math.ceil(size * tintDpr), Math.ceil(size * tintDpr),
    cx - pad, cy - pad, size, size
  )
}


// ─── Siege machine sprite cache ─────────────────────────────────────────────
//
// Monsters have been baked into sprite strips for a long time; the siege
// engines never were, and they are by far the most expensive thing on the
// field. Measured on a 337-block tower: 34 brutes and 45 grunts together cost
// nothing at all, while seventeen ballistae cost 12 ms a frame and eight
// catapults cost 8 ms — roughly ONE MILLISECOND per machine, because each is a
// carriage, two spoked wheels, a frame, an arm and a winch re-tessellated from
// scratch every frame.
//
// Cached against a quantised copy of what they animate from, exactly like the
// block fixtures:
//   · spin   → 16 steps, and only while ROLLING; an engaged engine has stopped
//              its wheels, so every engaged machine of a type shares one sprite
//   · clock  → 50 ms, which is what drives the reload cycle
//
// Facing is deliberately NOT in the key. Every machine is authored pointing
// right and the caller already has a `scale(facing, 1)` in force, so one sprite
// serves both directions.

/** Sprite box as a multiple of the machine's scale. Exported so the art bench
 *  lays its reference panels out on the exact rectangle the game blits. */
export const SIEGE_ART_BOX = 2.4

/**
 * The rider's sprite box, as a multiple of its scale.
 *
 * 2.3 rather than the siege engines' 2.4, and it is not a taste: it is the
 * number the art bench has always fitted a cavalry cell at, so a painted
 * strip cut against that reference drops onto exactly this rectangle. The
 * horse is as long as it is tall once the lance is counted, which is why the
 * box is square while a monster's is portrait.
 */
export const ALLY_ART_BOX = 2.3

/** Allies with a painted gallop strip to look for. */
const ALLY_STRIPS = new Set(['cavalry'])
const SIEGE_BOX = SIEGE_ART_BOX

/**
 * Every engine can take a painted chassis.
 *
 * All six now draw their moving part on a separate live layer, so the bitmap
 * replaces the frame and the machine keeps working: the arm still swings
 * against its own reload, the ram's log still strikes, the tower's ramp still
 * falls. The three that were whole-static each needed one small concession to
 * z-order first — see `drawSiegeMachine`.
 */
/**
 * Engines whose ARM can be replaced by a painted strip.
 *
 * The three throwing engines, because their arm is drawn from `cycle` — a real
 * loop keyed to the reload. The ram, the iron ram and the tower move their parts
 * on a wall clock and against `engaged`, which is not a cycle a strip can hold.
 */
const SIEGE_ARM_STRIPS = new Set(['ballista', 'catapult', 'trebuchet'])

/**
 * Where a painted arm sits when the engine is only rolling.
 *
 * The drawn arms hold near the end of their reload while not engaged — a
 * catapult rolls up already winched, which is what makes it read as loaded — so
 * the strip is held at the same place rather than at frame zero.
 */
const SIEGE_ARM_REST = 0.86

const SIEGE_STRIPS = new Set([
  'ballista', 'catapult', 'trebuchet', 'ram', 'ironRam', 'siegeTower'
])
const SIEGE_SPIN_STEPS = 16
const SIEGE_PHASE_MS = 50
const SIEGE_CACHE_MAX = 96

const siegeCache = new Map<string, FixtureSprite>()

/**
 * The sprite for one siege engine, painting it if this is a new bucket or its
 * clock bucket has moved on.
 */
const getSiegeSprite = (
  id: string, s: number, engaged: boolean, spin: number, t: number
): FixtureSprite | null => {
  if (!(s > 0) || !Number.isFinite(s)) return null
  const scale = bucketed(s)
  const spinQ = engaged
    ? 0
    : ((Math.round((spin / TAU) * SIEGE_SPIN_STEPS) % SIEGE_SPIN_STEPS) + SIEGE_SPIN_STEPS) % SIEGE_SPIN_STEPS
  // Staggered by bucket so a column of engines does not all fall stale on the
  // same frame and bunch every repaint into one spike.
  const phase = Math.floor((t + (spinQ * SIEGE_PHASE_MS) / SIEGE_SPIN_STEPS) / SIEGE_PHASE_MS)

  const key = `${id}|${scale}|${engaged ? 1 : 0}|${spinQ}`
  let e = siegeCache.get(key)
  if (e) {
    siegeCache.delete(key)
    siegeCache.set(key, e)
    if (e.phase === phase) return e
  } else {
    const ss = Math.min(2, Math.max(1, fixtureDpr || 1))
    const box = Math.max(16, Math.round(scale * SIEGE_BOX))
    const cv = document.createElement('canvas')
    cv.width = Math.round(box * ss)
    cv.height = Math.round(box * ss)
    const c2d = cv.getContext('2d')!
    c2d.scale(ss, ss)
    e = { cv, c2d, box, phase: Number.NaN }
    siegeCache.set(key, e)
    if (siegeCache.size > SIEGE_CACHE_MAX) {
      const oldest = siegeCache.keys().next().value
      if (oldest !== undefined && oldest !== key) siegeCache.delete(oldest)
    }
  }

  const g = e.c2d
  g.save()
  g.clearRect(0, 0, e.box, e.box)
  g.translate(e.box / 2, e.box / 2)
  // Painted from the QUANTISED spin and clock, so every machine sharing this
  // key agrees about what the image shows.
  // The static chassis is cached, so pen hatching is free here. The moving
  // layer is NOT wrapped: it is repainted every frame by the caller.
  withHatching(() => drawSiegeMachine(g, id, scale, themedPalette(enemyDef(id).palette), {
    spin: engaged ? 0 : (spinQ / SIEGE_SPIN_STEPS) * TAU,
    engaged,
    t: phase * SIEGE_PHASE_MS,
    // Only what is safe to share. A trebuchet's throwing assembly is keyed to
    // its OWN reload and is painted live over this by the caller; every other
    // engine draws itself completely here, as it always has.
    layer: 'static'
  }))
  g.restore()
  e.phase = phase
  return e
}

// ─── Enemies ────────────────────────────────────────────────────────────────

/**
 * Procedurally drawn characters. Each silhouette is built from a handful of
 * primitives with the walk cycle driven by `e.phase`, so no two individuals are
 * in step and a crowd reads as a crowd. Shapes are deliberately chunky and
 * high-contrast so they stay legible at the zoom levels a phone actually uses.
 */
const drawEnemy = (target: CanvasRenderingContext2D, e: Enemy, t: number): void => {
  const def = enemyDef(e.typeId)
  const p = themedPalette(def.palette)
  const zoom = getZoom()
  const s = def.scale * zoom
  const cx = worldToScreenX(e.x)
  const cy = worldToScreenY(e.y)
  // Every procedural body is authored facing RIGHT (club, sling, shield and
  // speed-streaks all sit on +x), and `dir` is +1 for an enemy travelling
  // right. Mirroring by `-dir` therefore turned every unit to face AWAY from
  // the tower it was walking into.
  const facing = e.dir

  // Drop-out on death: shrink + fade so bodies don't linger as clutter.
  const dieT = e.dying > 0 ? e.dying / 320 : 1

  // A unit that needs a colour wash is painted into the scratch layer instead
  // of straight onto the battlefield — see `beginUnitLayer`.
  const tints: string[] = []
  if (e.slowPct > 0) tints.push('rgba(140,230,255,0.35)')
  if (e.flash > 0.02) tints.push(`rgba(255,255,255,${Math.min(1, e.flash) * 0.75})`)
  const tinted = tints.length > 0
  const pad = Math.max(24, s * 2.8)
  const ctx = tinted ? beginUnitLayer(cx, cy, pad) : target
  const stamp = (): void => { if (tinted) endUnitLayer(target, cx, cy, pad, tints) }

  // Listed ids only. The slot has no files behind it and probing it for
  // whatever was walking is what put `images/enemies/grunt.webp` and
  // `…/bat.webp` in CrazyGames' QA log as missing resources.
  const override = enemyStillArt(e.typeId)
  if (override) {
    ctx.save()
    ctx.globalAlpha = dieT
    ctx.translate(cx, cy)
    ctx.scale(facing * dieT, dieT)
    ctx.drawImage(override, -s / 2, -s / 2, s, s)
    ctx.restore()
    stamp()
    return
  }

  ctx.save()
  ctx.globalAlpha = dieT
  ctx.translate(cx, cy)
  ctx.scale(facing, 1)

  // Siege engines are machines, not people: no torso, no legs, no walk cycle.
  // They get their own module, drawn from the same ink/cel kit as the monsters.
  if (def.siege) {
    // Wheels turn with distance travelled, not with time, so a halted engine's
    // wheels stop — the clearest signal that it has set up to fire.
    const engaged = e.targetUid >= 0
    // This machine's own progress toward its next shot: 0 the frame its round
    // left, 1 the frame the next one does. Read from `e.cd`, the same counter
    // the simulation fires on, so the arm cannot drift out of step with the
    // stone. The old art ran every engine of a type off one wall clock at a
    // period unrelated to `attackCooldownMs` — which is why a trebuchet mimed
    // a throw roughly twice per shot and never at the moment it shot.
    const cycle = def.attackCooldownMs > 0
      ? Math.min(1, Math.max(0, 1 - e.cd / def.attackCooldownMs))
      : 0
    // Read from the same predicate the simulation loads the round with, so the
    // bowl cannot be burning while a plain rock leaves it.
    const flaming = isFlamingSiege(def, wave.value)
    // A painted chassis, if one has been dropped in for this engine.
    //
    // It replaces the STATIC layer only — the wheels, the frame, the hide — and
    // the arm carries on being drawn live over it. That split already existed
    // for exactly this reason on the three throwing engines: the arm is keyed
    // to each machine's own reload, so it can never be baked into a shared
    // frame. It is the same bargain the blocks struck, with the fixture on top.
    //
    // The strip covers ONE wheel revolution, which is what `spin` measures, so
    // a rolling engine's painted wheels turn at the speed it is travelling.
    const painted = SIEGE_STRIPS.has(def.id)
      ? stripFrame('siege', def.id, 1, (engaged ? 0 : e.x * 1.6) / TAU)
      : null
    if (painted) {
      const box = s * SIEGE_BOX
      ctx.drawImage(painted, -box / 2, -box / 2, box, box)
      // A painted ARM too, where one has been dropped in. It is indexed by the
      // machine's own reload rather than by a wall clock, which is the whole
      // reason the arm was ever a separate layer — and at rest it holds the
      // frame the drawn arm holds, so a rolling engine is not caught mid-throw.
      const arm = SIEGE_ARM_STRIPS.has(def.id)
        ? stripFrame('siegeArm', def.id, 1, engaged ? cycle : SIEGE_ARM_REST)
        : null
      if (arm) ctx.drawImage(arm, -box / 2, -box / 2, box, box)
      else {
        drawSiegeMachine(ctx, def.id, s, p, {
          spin: engaged ? 0 : e.x * 1.6, engaged, t, cycle, flaming, layer: 'moving'
        })
      }
      ctx.restore()
      stamp()
      if (e.hp < e.maxHp && e.dying <= 0) {
        drawHpBar(target, cx, cy - s * 0.92, s * 0.86, Math.max(2, s * 0.085), e.hp / e.maxHp, def.boss)
      }
      return
    }

    const machine = getSiegeSprite(def.id, s, engaged, engaged ? 0 : e.x * 1.6, t)
    if (machine) {
      // The caller's `scale(facing, 1)` is still in force, so the one
      // right-facing sprite serves both directions.
      const box = s * SIEGE_BOX
      ctx.drawImage(machine.cv, -box / 2, -box / 2, box, box)
      // Anything that has to agree with this machine's clock, painted live on
      // top of the shared frame. A no-op for every engine but the two that
      // throw.
      drawSiegeMachine(ctx, def.id, s, p, {
        spin: engaged ? 0 : e.x * 1.6, engaged, t, cycle, flaming, layer: 'moving'
      })
    } else {
      drawSiegeMachine(ctx, def.id, s, p, {
        spin: engaged ? 0 : e.x * 1.6, engaged, t, cycle, flaming
      })
    }
    ctx.restore()
    stamp()
    if (e.hp < e.maxHp && e.dying <= 0) {
      drawHpBar(target, cx, cy - s * 0.92, s * 0.86, Math.max(2, s * 0.085), e.hp / e.maxHp, def.boss)
    }
    return
  }

  // Sea creatures are fish, not humanoids — they get a bespoke body and
  // skip the torso/legs/head pipeline entirely. A baked design replaces that
  // body when one is bound and ready; anything not yet baked keeps swimming as
  // the older drawn fish rather than popping out of existence.
  if (def.movement === 'sea') {
    const seaId = pickMonster(def.monster, e.uid)
    // Swimmers play their cycle slower than a walk: a tail beat is a longer
    // stroke than a footfall, and driving it at gait speed makes a shark look
    // like it is sprinting on the spot.
    const seaFrame = seaId ? monsterFrame(seaId, e.phase * 1.5 / (Math.PI * 2)) : null
    if (seaFrame) drawSeaSprite(ctx, e, p, seaFrame, seaId !== null && monsterFaces(seaId) === 'left', s)
    else drawSeaCreature(ctx, e, def, p, s, t)
    ctx.restore()
    stamp()
    // Only show the bar once it has broken the surface — a bar floating over
    // open water for an untargetable creature is misleading.
    if (e.hp < e.maxHp && e.dying <= 0 && (e.surfaced ?? 0) > 0.35) {
      drawHpBar(target, cx, cy - s * 0.9, s * 0.68, Math.max(2, s * 0.075), e.hp / e.maxHp)
    }
    return
  }

  // ── Monster designs ──
  // A baked design replaces the whole procedural body: silhouette, walk cycle
  // and contact shadow all come from the strip, so none of the generic torso /
  // legs / head / prop work below runs for it. Anything not yet baked falls
  // through to that older body rather than popping in and out of existence.
  const monsterId = pickMonster(def.monster, e.uid)
  if (monsterId) {
    // `e.phase` is the game's own walk clock — one leg cycle every 2π/2.4 of
    // it — so driving the strip from it keeps a fast unit's feet moving fast
    // without the strip needing to know anything about speed.
    const frame = monsterFrame(monsterId, e.phase * 2.4 / (Math.PI * 2))
    if (frame) {
      // Designs drawn facing left need one more flip: the battlefield authors
      // everything facing right and mirrors by travel direction.
      if (monsterFaces(monsterId) === 'left') ctx.scale(-1, 1)
      // Measured off the frame the strip handed back, not off the bake's own
      // pixel constants: a painted strip is the same frame box at a bigger
      // resolution, and hard-coding the bake's size would draw it 1.5x too big.
      const k = (s * 1.3) / (frame.height * SPRITE_HEIGHT_R)
      const w = frame.width * k
      const h = frame.height * k
      // Line the strip up by the FEET, not by its centre: the designs differ in
      // how much headroom they use, and centring them would leave the tall ones
      // hovering and the wide ones sunk. A design that declares itself centred
      // — a swimmer, which has no feet — is honoured here too, so the anchor
      // means the same thing wherever a strip is drawn.
      const top = monsterAnchor(monsterId) === 'centre'
        ? -h * 0.5
        : s * 0.5 - frame.height * SPRITE_FOOT_R * k
      ctx.drawImage(frame, -w * 0.5, top, w, h)
      ctx.restore()
      stamp()
      if (e.hp < e.maxHp && e.dying <= 0) {
        drawHpBar(target, cx, cy - s * 0.82, s * 0.68, Math.max(2, s * 0.075), e.hp / e.maxHp, def.boss)
      }
      return
    }
  }

  // Contact shadow grounds the character on the battlefield.
  if (def.movement === 'ground') {
    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    ctx.beginPath()
    ctx.ellipse(0, s * 0.52, s * 0.36, s * 0.1, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  const walk = Math.sin(e.phase * 2.4)
  const bob = def.movement === 'air' ? Math.sin(e.phase * 3) * s * 0.06 : Math.abs(walk) * s * 0.035
  ctx.translate(0, -bob)

  if (def.movement === 'air') {
    // Wings behind the body, flapping on the phase.
    const flap = Math.sin(e.phase * 9)
    ctx.fillStyle = withAlpha(p.dark, 0.95)
    for (const dir of [-1, 1]) {
      ctx.save()
      ctx.scale(dir, 1)
      ctx.rotate(flap * 0.55)
      ctx.beginPath()
      ctx.moveTo(s * 0.1, -s * 0.05)
      ctx.quadraticCurveTo(s * 0.55, -s * 0.42, s * 0.62, -s * 0.02)
      ctx.quadraticCurveTo(s * 0.42, s * 0.04, s * 0.1, s * 0.08)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
  } else {
    // Legs — a simple two-bar walk cycle is enough at this scale.
    ctx.strokeStyle = p.dark
    ctx.lineWidth = Math.max(1.4, s * 0.11)
    ctx.lineCap = 'round'
    for (const side of [-1, 1]) {
      const swing = walk * side * s * 0.16
      ctx.beginPath()
      ctx.moveTo(side * s * 0.11, s * 0.16)
      ctx.lineTo(side * s * 0.11 + swing, s * 0.46)
      ctx.stroke()
    }
  }

  // Torso.
  const body = ctx.createLinearGradient(-s * 0.3, -s * 0.3, s * 0.3, s * 0.3)
  body.addColorStop(0, p.light)
  body.addColorStop(0.55, p.mid)
  body.addColorStop(1, p.dark)
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.ellipse(0, 0, s * 0.28, s * 0.32, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = withAlpha('#000', 0.45)
  ctx.lineWidth = Math.max(1, s * 0.035)
  ctx.stroke()

  // Head.
  ctx.fillStyle = p.mid
  ctx.beginPath()
  ctx.arc(s * 0.04, -s * 0.36, s * 0.19, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = withAlpha('#000', 0.45)
  ctx.stroke()

  // Eyes — a single glowing pair reads as "hostile" instantly.
  ctx.fillStyle = p.accent2
  ctx.beginPath(); ctx.arc(s * 0.12, -s * 0.38, s * 0.045, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath(); ctx.arc(s * 0.135, -s * 0.38, s * 0.022, 0, Math.PI * 2); ctx.fill()

  // Per-type signature prop.
  drawEnemyProp(ctx, e, def.id, p, s, walk, t)

  ctx.restore()
  stamp()

  // HP bar in screen space (never mirrored), shown only once damaged so a full
  // wave of untouched enemies isn't a wall of bars.
  if (e.hp < e.maxHp && e.dying <= 0) {
    drawHpBar(target, cx, cy - s * 0.72, s * 0.68, Math.max(2, s * 0.075), e.hp / e.maxHp, def.boss)
  }
}

/**
 * Cavalry — the player's own units.
 *
 * The body itself lives in `cavalryArt`; this handles only what the battlefield
 * owns: where the rider sits, which way it faces, the hit flash, and the fade
 * as its contract expires (`life`), so a rider vanishing never looks like a bug.
 */
const drawAlly = (target: CanvasRenderingContext2D, a: Ally, t: number): void => {
  const def = ALLY_DEFS[a.typeId]
  if (!def) return
  const p = themedPalette(def.palette)
  const zoom = getZoom()
  const s = def.scale * zoom
  const cx = worldToScreenX(a.x)
  const cy = worldToScreenY(a.y)
  const dieT = a.dying > 0 ? a.dying / 320 : 1
  // Fade out over the last second of the contract, so the rider disappearing
  // never looks like a bug.
  const expiring = Math.min(1, a.life / 1000)

  const tinted = a.flash > 0.02
  const pad = Math.max(24, s * 2.8)
  const ctx = tinted ? beginUnitLayer(cx, cy, pad) : target
  const stamp = (): void => {
    if (tinted) endUnitLayer(target, cx, cy, pad, [`rgba(255,255,255,${Math.min(1, a.flash) * 0.7})`])
  }

  ctx.save()
  ctx.globalAlpha = dieT * expiring
  ctx.translate(cx, cy)
  // By `facing`, not `dir`: the flank it was sent to is not the way it is
  // pointed once something has got past it.
  ctx.scale(a.facing, 1)

  // A painted rider, if one has been dropped in.
  //
  // The strip covers ONE gallop and is indexed by the same `gait()` the
  // drawing runs on, at the same phase offset — so a squad of three still
  // moves out of lockstep, and a painted hoof lands on the beat the drawn one
  // did rather than on a wall clock of its own.
  //
  // It replaces the WHOLE rider, unlike a siege engine's chassis: the lance
  // is couched under the arm and its thrust travels through the shoulder and
  // the seat, so there is no seam to split the strike out along. The cost is
  // that an adopted rider gallops through its attack instead of thrusting.
  // Swapping mid-charge would be worse — a unit that pops between painted and
  // drawn every time it finds a target reads as a glitch, not as an animation.
  const painted = ALLY_STRIPS.has(a.typeId)
    ? stripFrame('ally', a.typeId, 1, cavalryCycle01(t, a.phase))
    : null
  if (painted) {
    // The caller's `scale(a.dir, 1)` is still in force, so the one
    // right-facing strip serves both directions.
    // The dust stays live and stays UNDER the rider, the same way a ship's
    // wake does: it is transient, it is off the body, and over the magenta of
    // a reference sheet it would key to a pink smudge instead of to nothing.
    drawCavalryDust(ctx, s, t, a.phase)
    const box = s * ALLY_ART_BOX
    ctx.drawImage(painted, -box / 2, -box / 2, box, box)
  } else {
    // The whole rider is drawn by its own module, from the same ink/cel kit as
    // the monster cast — see `cavalryArt`.
    drawCavalry(ctx, s, p, {
      phase: a.phase,
      striking: a.targetUid >= 0,
      t
    })
  }
  ctx.restore()
  stamp()

  if (a.hp < a.maxHp && a.dying <= 0) {
    drawHpBar(target, cx, cy - s * 0.7, s * 0.6, Math.max(2, s * 0.07), a.hp / a.maxHp)
  }
}

/**
 * A sea creature.
 *
 * Deliberately FISH-shaped rather than humanoid: a deep body, a sweeping
 * caudal fin, a dorsal ridge and a single round eye. Nothing about the
 * silhouette should be mistakable for the infantry marching in on the grass,
 * because the answer to it is different — most weapons cannot reach it at all
 * until it surfaces.
 *
 * Two presentations, because a creature that is invisible until it bites is not
 * a threat the player can answer — it is just damage arriving from nowhere:
 *
 *   SUBMERGED — a dark silhouette gliding under the surface plus a travelling
 *               V-wake on the waterline. Visible, clearly located, and clearly
 *               out of reach (weapons genuinely cannot target it yet).
 *   SURFACED  — the body breaches to strike. `surfaced` drives both the
 *               animation and the targetability rule, so what the player sees
 *               and what the simulation allows are the same thing.
 */
const drawSeaCreature = (
  ctx: CanvasRenderingContext2D, e: Enemy, def: EnemyDef,
  p: Palette, s: number, t: number
): void => {
  const surfaced = e.surfaced ?? 0
  const zoom = getZoom()
  // Screen-space offset from the creature's origin down to the waterline.
  // Positive means part of the body is ABOVE the water.
  const waterY = (e.y - SEA_LEVEL) * zoom
  const swim = t / 190 + e.phase
  // Tail beat drives everything: the fin sweeps, and the body counter-rotates
  // slightly against it, which is what makes a fish look like it is swimming
  // rather than being dragged.
  const beat = Math.sin(swim)
  const isKraken = def.id === 'kraken'

  /** Body, fins and head. `tint` flattens everything for the silhouette pass. */
  const drawBody = (tint: string | null): void => {
    const flat = tint !== null
    ctx.save()
    ctx.rotate(beat * 0.09)

    // ── Caudal (tail) fin ──
    const sweep = beat * s * 0.3
    ctx.fillStyle = flat ? tint! : withAlpha(p.dark, 0.95)
    ctx.beginPath()
    ctx.moveTo(-s * 0.38, 0)
    ctx.quadraticCurveTo(-s * 0.62, sweep * 0.4 - s * 0.36, -s * 0.86, sweep - s * 0.3)
    ctx.quadraticCurveTo(-s * 0.66, sweep * 0.6, -s * 0.86, sweep + s * 0.3)
    ctx.quadraticCurveTo(-s * 0.62, sweep * 0.4 + s * 0.36, -s * 0.38, 0)
    ctx.closePath()
    ctx.fill()
    if (!flat) {
      ctx.strokeStyle = withAlpha('#000', 0.35)
      ctx.lineWidth = Math.max(1, s * 0.025)
      ctx.stroke()
      // Fin rays.
      ctx.strokeStyle = withAlpha(p.accent, 0.5)
      ctx.lineWidth = Math.max(1, s * 0.018)
      for (const f of [-0.6, 0, 0.6]) {
        ctx.beginPath()
        ctx.moveTo(-s * 0.4, 0)
        ctx.lineTo(-s * 0.8, sweep + f * s * 0.26)
        ctx.stroke()
      }
    }

    // ── Dorsal fin ──
    ctx.fillStyle = flat ? tint! : withAlpha(p.accent, 0.6 + surfaced * 0.4)
    ctx.beginPath()
    ctx.moveTo(-s * 0.2, -s * 0.2)
    ctx.lineTo(-s * 0.02, -s * (isKraken ? 0.66 : 0.54))
    ctx.lineTo(s * 0.2, -s * 0.22)
    ctx.closePath()
    ctx.fill()

    // ── Pelvic fin, angled against the beat ──
    ctx.fillStyle = flat ? tint! : withAlpha(p.dark, 0.8)
    ctx.beginPath()
    ctx.moveTo(-s * 0.08, s * 0.18)
    ctx.lineTo(-s * 0.24, s * 0.44 - beat * s * 0.06)
    ctx.lineTo(s * 0.06, s * 0.22)
    ctx.closePath()
    ctx.fill()

    // ── Main body: deep at the shoulder, tapering to the tail ──
    if (flat) {
      ctx.fillStyle = tint!
    } else {
      const g = ctx.createLinearGradient(0, -s * 0.34, 0, s * 0.3)
      g.addColorStop(0, p.light)
      g.addColorStop(0.42, p.mid)
      g.addColorStop(1, p.dark)
      ctx.fillStyle = g
    }
    ctx.beginPath()
    ctx.moveTo(s * 0.52, 0)
    ctx.quadraticCurveTo(s * 0.24, -s * 0.36, -s * 0.1, -s * 0.28)
    ctx.quadraticCurveTo(-s * 0.32, -s * 0.2, -s * 0.4, 0)
    ctx.quadraticCurveTo(-s * 0.32, s * 0.2, -s * 0.1, s * 0.28)
    ctx.quadraticCurveTo(s * 0.24, s * 0.36, s * 0.52, 0)
    ctx.closePath()
    ctx.fill()

    if (flat) {
      ctx.restore()
      return
    }

    ctx.strokeStyle = withAlpha('#000', 0.42)
    ctx.lineWidth = Math.max(1, s * 0.032)
    ctx.stroke()

    // Pale belly.
    ctx.fillStyle = withAlpha(p.light, 0.3)
    ctx.beginPath()
    ctx.moveTo(-s * 0.3, s * 0.08)
    ctx.quadraticCurveTo(s * 0.1, s * 0.34, s * 0.46, s * 0.03)
    ctx.quadraticCurveTo(s * 0.1, s * 0.2, -s * 0.3, s * 0.08)
    ctx.closePath()
    ctx.fill()

    // Scale rows — three arcs is enough to read as scales without becoming
    // a texture that costs anything at this size.
    ctx.strokeStyle = withAlpha(p.dark, 0.45)
    ctx.lineWidth = Math.max(1, s * 0.016)
    for (const sx of [-0.14, 0.04, 0.22]) {
      ctx.beginPath()
      ctx.arc(s * sx, 0, s * 0.24, -1.05, 1.05)
      ctx.stroke()
    }

    // Gill slit.
    ctx.strokeStyle = withAlpha(p.dark, 0.7)
    ctx.lineWidth = Math.max(1, s * 0.026)
    ctx.beginPath()
    ctx.arc(s * 0.3, 0, s * 0.16, -1.2, 1.2)
    ctx.stroke()

    // Pectoral fin, in front of the gill.
    ctx.fillStyle = withAlpha(p.accent, 0.75)
    ctx.beginPath()
    ctx.moveTo(s * 0.22, s * 0.06)
    ctx.quadraticCurveTo(s * 0.1, s * 0.34 + beat * s * 0.05, s * 0.3, s * 0.28)
    ctx.closePath()
    ctx.fill()

    // ── Jaw, opening as it strikes ──
    const gape = surfaced * 0.55
    ctx.fillStyle = '#2a0d12'
    ctx.beginPath()
    ctx.moveTo(s * 0.36, s * 0.02)
    ctx.lineTo(s * 0.56, -s * (0.02 + gape * 0.2))
    ctx.lineTo(s * 0.54, s * (0.1 + gape * 0.26))
    ctx.closePath()
    ctx.fill()
    // Teeth.
    ctx.fillStyle = '#fbf4e6'
    for (let i = 0; i < 3; i++) {
      const tx = s * (0.4 + i * 0.055)
      ctx.beginPath()
      ctx.moveTo(tx, s * 0.0)
      ctx.lineTo(tx + s * 0.02, s * (0.06 + gape * 0.1))
      ctx.lineTo(tx + s * 0.045, s * 0.0)
      ctx.closePath()
      ctx.fill()
    }

    // ── Eye ──
    ctx.fillStyle = p.accent2
    ctx.beginPath(); ctx.arc(s * 0.34, -s * 0.09, s * 0.07, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = withAlpha('#000', 0.5)
    ctx.lineWidth = Math.max(1, s * 0.016)
    ctx.stroke()
    ctx.fillStyle = '#000'
    ctx.beginPath(); ctx.arc(s * 0.355, -s * 0.09, s * 0.032, 0, Math.PI * 2); ctx.fill()

    // A kraken keeps its tentacles — it is the boss of the water, and the
    // extra limbs are what separate it from the ordinary fish at a glance.
    if (isKraken) {
      ctx.strokeStyle = withAlpha(p.mid, 0.9)
      ctx.lineWidth = Math.max(1.4, s * 0.055)
      ctx.lineCap = 'round'
      for (let i = 0; i < 4; i++) {
        const ph = swim + i * 1.3
        ctx.beginPath()
        ctx.moveTo(s * 0.3, s * (0.1 + i * 0.04))
        ctx.quadraticCurveTo(
          s * (0.62 + Math.sin(ph) * 0.1), s * (0.3 + i * 0.1),
          s * (0.5 + Math.cos(ph) * 0.24), s * (0.56 + i * 0.12)
        )
        ctx.stroke()
      }
    }

    ctx.restore()
  }

  // ── Underwater silhouette ──
  // Clipped to BELOW the waterline so it can never bleed onto the shore.
  ctx.save()
  ctx.beginPath()
  ctx.rect(-s * 3, waterY, s * 6, s * 8)
  ctx.clip()
  ctx.globalAlpha = 0.5 + surfaced * 0.3
  drawBody(withAlpha(p.dark, 0.85))
  ctx.restore()
  ctx.globalAlpha = 1

  // ── Above-water body ──
  // The clip runs from well above the crown DOWN TO the waterline, so its
  // height is the distance between them — not `waterY`, which is only the
  // waterline's own offset. Passing that as the height put the visible band at
  // [-4s, -4s + waterY]: entirely above the creature. The body was drawn, then
  // clipped away, and a sea monster rearing up to bite vanished at exactly the
  // moment the player needed to see it.
  if (waterY > -s * 4) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(-s * 3, -s * 4, s * 6, waterY + s * 4)
    ctx.clip()
    drawBody(null)
    ctx.restore()
  }

  drawSeaSurface(ctx, p, s, waterY, surfaced)
}

/**
 * What the water does about the thing under it.
 *
 * A travelling wake while submerged, widening into foam as it breaches, and the
 * dorsal fin cutting the surface. This is the player's only warning that
 * something is coming out of the water, so it is drawn unconditionally — for
 * the drawn fish and the baked designs alike — rather than only when the body
 * happens to show.
 */
const drawSeaSurface = (
  ctx: CanvasRenderingContext2D, p: Palette, s: number, waterY: number, surfaced: number
): void => {
  const zoom = getZoom()
  const foam = 0.3 + surfaced * 0.7
  ctx.save()
  ctx.globalAlpha = 0.6
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = Math.max(1, zoom * 0.03)
  ctx.beginPath()
  ctx.ellipse(0, waterY, s * (0.35 + foam * 0.55), s * 0.13, 0, 0, Math.PI * 2)
  ctx.stroke()
  // Trailing V-wake, so the direction of travel is readable at a glance.
  ctx.globalAlpha = 0.3
  ctx.lineWidth = Math.max(1, zoom * 0.022)
  for (let i = 1; i <= 2; i++) {
    const spread = s * 0.5 * i
    ctx.beginPath()
    ctx.moveTo(-spread * 0.2, waterY)
    ctx.lineTo(-spread * 1.6, waterY - spread * 0.28)
    ctx.moveTo(-spread * 0.2, waterY)
    ctx.lineTo(-spread * 1.6, waterY + spread * 0.28)
    ctx.stroke()
  }
  // A water bug's back breaking the surface while submerged, trailing a few
  // bubbles — the pool's version of the dorsal fin, and the same tell.
  if (surfaced < 0.5) {
    ctx.globalAlpha = 0.6
    ctx.fillStyle = withAlpha(p.dark, 0.9)
    ctx.beginPath()
    ctx.ellipse(s * 0.02, waterY, s * 0.2, s * 0.1, 0, Math.PI, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = Math.max(1, zoom * 0.016)
    const bt = nowMs() / 900
    for (let i = 0; i < 3; i++) {
      const u = (bt + i / 3) % 1
      ctx.globalAlpha = 0.75 * (1 - u)
      ctx.beginPath()
      ctx.arc(-s * (0.12 + i * 0.13), waterY - s * (0.03 + u * 0.24), s * (0.03 + i * 0.012), 0, Math.PI * 2)
      ctx.stroke()
    }
  }
  ctx.restore()
  ctx.globalAlpha = 1
}

/** Canvas filters darken the submerged pass cheaply; Safari &lt;17 lacks them,
 *  where the alpha drop alone still reads as depth over dark water. */
const CAN_FILTER = typeof CanvasRenderingContext2D !== 'undefined' &&
  'filter' in CanvasRenderingContext2D.prototype

/**
 * A sea creature drawn from its baked design strip.
 *
 * Same two presentations as the procedural fish — a dimmed silhouette below the
 * waterline, the full drawing above it — but the body is now one of the cast in
 * `bugs/sea.ts` rather than a generic gradient fish, and the strip carries
 * its own swim cycle.
 *
 * The rear-up is a ROTATION of the whole sprite rather than a second baked
 * pose. A strip per attack state would double the bake for every design; a
 * nose-up tilt driven by `surfaced` costs nothing and reads as exactly what it
 * is — an animal levering itself out of the water to reach the wall.
 */
const drawSeaSprite = (
  ctx: CanvasRenderingContext2D, e: Enemy, p: Palette,
  frame: HTMLCanvasElement, faceLeft: boolean, s: number
): void => {
  const surfaced = e.surfaced ?? 0
  const zoom = getZoom()
  // Screen-space offset from the creature's origin down to the waterline.
  // Positive means part of the body is ABOVE the water.
  const waterY = (e.y - SEA_LEVEL) * zoom

  const k = (s * 1.5) / (frame.height * SPRITE_HEIGHT_R)
  const w = frame.width * k
  const h = frame.height * k

  /**
   * Levering out of the water, not levitating over it.
   *
   * A fully surfaced creature's origin sits most of a cell ABOVE the waterline
   * — that is what lets it reach the lowest blocks — so a body drawn centred on
   * it stands clear of the sea altogether and reads as beached on the grass.
   * Dropping the drawing back toward the water as it rears keeps the tail wet
   * and puts the head at the wall, which is the pose the whole mechanic
   * describes. `e.y` is left alone: it is the simulation's idea of where the
   * animal is, and the wake is measured from it.
   */
  const dip = surfaced * 0.36 * zoom
  const rear = -surfaced * 0.85

  /** One pass of the body, clipped to a band and optionally dimmed. */
  const pass = (top: number, height: number, alpha: number, dim: boolean): void => {
    if (height <= 0) return
    ctx.save()
    // The clip stays on the TRUE waterline while the body moves inside it, so
    // the split follows the drawing rather than the simulation's origin.
    ctx.beginPath()
    ctx.rect(-s * 3, top, s * 6, height)
    ctx.clip()
    ctx.globalAlpha *= alpha
    if (dim && CAN_FILTER) ctx.filter = 'brightness(0.5) saturate(0.6)'
    ctx.translate(0, dip)
    // +x is forward and screen y runs down, so a negative rotation lifts the
    // head. Mirroring happens outside this, so it reads the same both ways.
    ctx.rotate(rear)
    if (faceLeft) ctx.scale(-1, 1)
    ctx.drawImage(frame, -w * 0.5, -h * 0.5, w, h)
    if (dim && CAN_FILTER) ctx.filter = 'none'
    ctx.restore()
  }

  pass(waterY, s * 8, 0.55 + surfaced * 0.25, true)
  pass(-s * 4, waterY + s * 4, 1, false)

  drawSeaSurface(ctx, p, s, waterY, surfaced)
}

const drawEnemyProp = (
  ctx: CanvasRenderingContext2D, e: Enemy, id: string,
  p: Palette, s: number, walk: number, t: number
): void => {
  switch (id) {
    case 'grunt': {
      // Club, raised on the attack beat.
      const swing = e.targetUid >= 0 ? Math.sin(t / 90) * 0.6 : walk * 0.25
      ctx.save()
      ctx.translate(s * 0.24, -s * 0.02)
      ctx.rotate(-0.6 + swing)
      ctx.fillStyle = p.accent2
      ctx.fillRect(0, -s * 0.035, s * 0.3, s * 0.07)
      ctx.beginPath(); ctx.arc(s * 0.32, 0, s * 0.09, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
      break
    }
    case 'runner': {
      // Speed streaks trailing the body.
      ctx.strokeStyle = withAlpha(p.accent2, 0.4)
      ctx.lineWidth = Math.max(1, s * 0.03)
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(-s * (0.34 + i * 0.12), -s * 0.1 + i * s * 0.12)
        ctx.lineTo(-s * (0.5 + i * 0.12), -s * 0.1 + i * s * 0.12)
        ctx.stroke()
      }
      break
    }
    case 'slinger': {
      const spin = t / 110
      ctx.save()
      ctx.translate(s * 0.2, -s * 0.18)
      ctx.strokeStyle = p.accent2
      ctx.lineWidth = Math.max(1, s * 0.022)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(spin) * s * 0.24, Math.sin(spin) * s * 0.24)
      ctx.stroke()
      // Sandbox Tower: a spider's web ball on its thread, not a sling stone.
      ctx.fillStyle = '#f4f4ee'
      ctx.beginPath()
      ctx.arc(Math.cos(spin) * s * 0.24, Math.sin(spin) * s * 0.24, s * 0.05, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      break
    }
    case 'brute': {
      // Shoulder pauldrons + a two-handed maul.
      ctx.fillStyle = p.dark
      ctx.beginPath(); ctx.ellipse(-s * 0.2, -s * 0.2, s * 0.14, s * 0.1, -0.4, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(s * 0.2, -s * 0.2, s * 0.14, s * 0.1, 0.4, 0, Math.PI * 2); ctx.fill()
      ctx.save()
      ctx.translate(s * 0.26, 0)
      ctx.rotate(-0.5 + (e.targetUid >= 0 ? Math.sin(t / 110) * 0.7 : 0))
      ctx.fillStyle = p.accent2
      ctx.fillRect(0, -s * 0.04, s * 0.34, s * 0.08)
      ctx.fillRect(s * 0.3, -s * 0.14, s * 0.12, s * 0.28)
      ctx.restore()
      break
    }
    case 'bomber': {
      // The payload, pulsing brighter as it closes — a legible warning.
      const pulse = 0.5 + 0.5 * Math.sin(t / 90)
      ctx.fillStyle = mixHex('#2a2a2a', '#ff3a10', pulse)
      ctx.beginPath(); ctx.arc(0, -s * 0.04, s * 0.2, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = withAlpha('#000', 0.5); ctx.lineWidth = Math.max(1, s * 0.03); ctx.stroke()
      const g = ctx.createRadialGradient(0, -s * 0.04, 0, 0, -s * 0.04, s * 0.36 * pulse)
      g.addColorStop(0, `rgba(255,90,20,${0.35 * pulse})`)
      g.addColorStop(1, 'rgba(255,90,20,0)')
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(0, -s * 0.04, s * 0.36, 0, Math.PI * 2); ctx.fill()
      break
    }
    case 'bulwark': {
      // Tower shield on the leading side — the thing you have to shoot around.
      ctx.fillStyle = p.accent
      roundRect(ctx, s * 0.2, -s * 0.36, s * 0.16, s * 0.7, s * 0.05)
      ctx.fill()
      ctx.strokeStyle = withAlpha('#000', 0.5); ctx.lineWidth = Math.max(1, s * 0.03); ctx.stroke()
      ctx.fillStyle = withAlpha(p.accent2, 0.7)
      ctx.beginPath(); ctx.arc(s * 0.28, 0, s * 0.05, 0, Math.PI * 2); ctx.fill()
      break
    }
    case 'bombardier':
    case 'firebug': {
      // A slung gondola under the body with visible ordnance in it. The load is
      // drawn because the threat has to be legible from the ground: the player
      // needs to see a bomber and think "that is going for my roof".
      const fire = id === 'firebug'
      ctx.fillStyle = p.dark
      roundRect(ctx, -s * 0.2, s * 0.14, s * 0.4, s * 0.22, s * 0.06)
      ctx.fill()
      ctx.strokeStyle = withAlpha('#000', 0.45)
      ctx.lineWidth = Math.max(1, s * 0.025)
      ctx.stroke()
      // Rigging up to the body.
      ctx.strokeStyle = withAlpha(p.accent2, 0.6)
      ctx.lineWidth = Math.max(1, s * 0.018)
      ctx.beginPath()
      ctx.moveTo(-s * 0.16, s * 0.14); ctx.lineTo(-s * 0.1, s * 0.02)
      ctx.moveTo(s * 0.16, s * 0.14); ctx.lineTo(s * 0.1, s * 0.02)
      ctx.stroke()

      // The payload itself, swinging slightly as it flies.
      const sway = Math.sin(e.phase * 2.2) * s * 0.02
      if (fire) {
        // Sandbox Tower: a firefly's glowing ember (a coal), lit from within.
        ctx.fillStyle = '#7a220c'
        roundRect(ctx, -s * 0.05 + sway, s * 0.17, s * 0.1, s * 0.12, s * 0.05)
        ctx.fill()
        const flick = 0.6 + 0.4 * Math.sin(t / 70)
        const g = ctx.createRadialGradient(sway, s * 0.15, 0, sway, s * 0.15, s * 0.11 * flick)
        g.addColorStop(0, '#fff3c0')
        g.addColorStop(0.45, '#ff9a2a')
        g.addColorStop(1, 'rgba(255,110,20,0)')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(sway, s * 0.15, s * 0.12 * flick, 0, Math.PI * 2); ctx.fill()
      } else {
        // Sandbox Tower: a honey bomb — a golden drop with a drip hanging off.
        ctx.fillStyle = '#f5a51d'
        ctx.beginPath()
        ctx.ellipse(sway, s * 0.24, s * 0.09, s * 0.09, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#c5700a'
        ctx.beginPath()
        ctx.ellipse(sway + s * 0.02, s * 0.35, s * 0.025, s * 0.04, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ffdb66'
        ctx.beginPath()
        ctx.arc(sway - s * 0.03, s * 0.21, s * 0.025, 0, Math.PI * 2)
        ctx.fill()
      }

      // Goggles / helm, so it reads as a crewed machine rather than a beast.
      ctx.fillStyle = withAlpha(p.accent, 0.9)
      ctx.beginPath()
      ctx.ellipse(s * 0.1, -s * 0.4, s * 0.13, s * 0.07, -0.2, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'wyvern': {
      // Horned skull crest + a barbed tail, so it reads as "bigger, meaner bat"
      // rather than a recoloured one.
      ctx.fillStyle = p.accent
      ctx.beginPath()
      ctx.moveTo(-s * 0.02, -s * 0.5)
      ctx.lineTo(s * 0.1, -s * 0.66)
      ctx.lineTo(s * 0.14, -s * 0.44)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = p.dark
      ctx.lineWidth = Math.max(1.2, s * 0.05)
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(-s * 0.22, s * 0.1)
      ctx.quadraticCurveTo(-s * 0.55, s * 0.24, -s * 0.62, -s * 0.06)
      ctx.stroke()
      ctx.fillStyle = p.accent
      ctx.beginPath()
      ctx.moveTo(-s * 0.62, -s * 0.06)
      ctx.lineTo(-s * 0.76, -s * 0.02)
      ctx.lineTo(-s * 0.6, s * 0.08)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'golem': {
      // Molten seams that glow through the rock — boss-scale telegraphing.
      const pulse = 0.5 + 0.5 * Math.sin(t / 260)
      ctx.strokeStyle = `rgba(255,122,31,${0.5 + pulse * 0.4})`
      ctx.lineWidth = Math.max(1.5, s * 0.035)
      ctx.beginPath()
      ctx.moveTo(-s * 0.2, -s * 0.16); ctx.lineTo(-s * 0.02, 0); ctx.lineTo(-s * 0.14, s * 0.2)
      ctx.moveTo(s * 0.18, -s * 0.2); ctx.lineTo(s * 0.06, s * 0.02)
      ctx.stroke()
      // Rock shoulders.
      ctx.fillStyle = p.light
      for (const [ox, oy, rr] of [[-0.26, -0.24, 0.11], [0.26, -0.22, 0.12], [0.0, -0.5, 0.09]] as const) {
        ctx.beginPath(); ctx.arc(ox * s, oy * s, rr * s, 0, Math.PI * 2); ctx.fill()
      }
      break
    }
  }
}

const drawHpBar = (
  ctx: CanvasRenderingContext2D, cx: number, cy: number,
  w: number, h: number, frac: number, boss = false
): void => {
  // A damage bar is interface, not battlefield — gated here rather than at the
  // seven call sites (see `src/game/cleanFeed.ts`).
  if (CLEAN_FEED) return
  const x = cx - w / 2
  ctx.fillStyle = 'rgba(0,0,0,0.62)'
  roundRect(ctx, x - 1, cy - 1, w + 2, h + 2, h)
  ctx.fill()
  // Green → amber → red so the player can triage at a glance.
  const col = frac > 0.55 ? '#4ade80' : frac > 0.28 ? '#fbbf24' : '#f87171'
  ctx.fillStyle = boss ? '#ff7a1f' : col
  roundRect(ctx, x, cy, Math.max(1, w * Math.max(0, frac)), h, h)
  ctx.fill()
}

// ─── Background ─────────────────────────────────────────────────────────────
//
// The backyard (clouds, houses, trees, hedge, fence, flower bed, sand, moat —
// drawn by `src/game/backyardArt.ts`) is cached into an offscreen canvas keyed
// by the camera state, and only re-rendered once the camera has drifted enough
// that the parallax would visibly lag. Everything is generated from a
// deterministic hash so the horizon is stable across frames and sessions.

let bgCanvas: HTMLCanvasElement | null = null
let bgCtx: CanvasRenderingContext2D | null = null
let bgKey = ''

/** Sunrise to sunset — the sun's whole visible arc. */
export const DAY_ARC_MS = 90_000

/** A full sunrise → sunset → midnight → sunrise turn: the day plus its night. */
export const DAY_CYCLE_MS = DAY_ARC_MS * 2

let skyEpoch = 0

/**
 * Position in the day, read from the WALL CLOCK rather than accumulated frame
 * deltas.
 *
 * Ninety seconds has to mean ninety seconds. The render loop clamps its delta
 * to 120 ms so a stall cannot blow up the simulation, which means summing those
 * deltas loses real time on every dropped frame — a backgrounded tab drops to
 * roughly one frame a second and the sun crawls at an eighth speed. Reading the
 * clock is immune to all of it, and to the 2x battle speed as well: the sun
 * should not sprint because the fight did.
 */
const skyNow = (): number => {
  if (skyEpoch === 0) skyEpoch = performance.now()
  return performance.now() - skyEpoch
}

/**
 * Position in the day, 0..1.
 *
 * 0 = sunrise, 0.25 = noon, 0.5 = sunset, 0.75 = midnight. The sun's arc, the
 * moon's arc and the sky gradient are all driven from this one number, which is
 * what keeps them agreeing: a sunset sky with the sun still overhead is the
 * kind of mismatch that reads as broken even when nobody can say why.
 */
export const dayPhase = (): number =>
  fxDayCycle ? (skyNow() % DAY_CYCLE_MS) / DAY_CYCLE_MS : fxStaticPhase

/**
 * Sky keyframes around the cycle. Interpolated, not switched.
 *
 * The sky used to step between five fixed moods every five waves, which meant
 * it never MOVED — it cut. Blending between keys means every wave looks a
 * little different from the last, which is most of what makes a backdrop feel
 * alive rather than painted.
 */
const SKY_KEYS: Array<[number, string, string, string]> = [
  [0.00, '#6a8fd0', '#f3b9c4', '#ffd79c'], // sunrise: pink and peach
  [0.10, '#5fb4ee', '#b8e2fa', '#fdf0cf'], // summer morning
  [0.25, '#5fbcf5', '#9fd8f8', '#d6f0ff'], // noon
  [0.36, '#62ade8', '#bfe0f0', '#ffe2a6'], // golden afternoon
  [0.45, '#6b78c8', '#f2a28e', '#ffc266'], // sunset
  [0.55, '#434a9a', '#8a68b0', '#e9909a'], // dusk
  [0.75, '#27306e', '#3d4a92', '#5d5aa2'], // warm summer night — blue-violet, never black
  [0.92, '#34407e', '#5b5a9e', '#8f76a8'], // before dawn
  [1.00, '#6a8fd0', '#f3b9c4', '#ffd79c']  // back to sunrise
]

/** Sky gradient right now, blended between keyframes. */
const skyFor = (w: number): [string, string, string] => {
  const t = dayPhase()
  let i = 0
  while (i < SKY_KEYS.length - 2 && t > SKY_KEYS[i + 1]![0]) i++
  const a = SKY_KEYS[i]!
  const b = SKY_KEYS[i + 1]!
  const k = (t - a[0]) / Math.max(1e-6, b[0] - a[0])
  const blend: [string, string, string] = [
    mixHex(a[1], b[1], k), mixHex(a[2], b[2], k), mixHex(a[3], b[3], k)
  ]
  // A boss night still turns the sky over — the escalation the old tiers were
  // reaching for, kept as an EVENT rather than as a permanent step. In the
  // backyard it is a storm rolling in at sunset: purple overhead, a burning
  // orange horizon, eased in and out rather than cut to. (`mixCss`, not
  // `mixHex`: the blend is already rgb(), which `mixHex` cannot parse.)
  const s = isBossWave(w) ? stormOf(t) : 0
  if (s > 0) {
    return [
      mixCss(blend[0], STORM_SKY[0], s * 0.85),
      mixCss(blend[1], STORM_SKY[1], s * 0.85),
      mixCss(blend[2], STORM_SKY[2], s * 0.85)
    ]
  }
  return blend
}

/** Deterministic 0..1 hash — used for ridge lines and tree placement so the
 *  scenery never shimmers between frames. */
const hash = (n: number): number => {
  const s = Math.sin(n * 127.1) * 43758.5453
  return s - Math.floor(s)
}

/**
 * Sun or moon, depending on how deep the run is.
 *
 * Built from five stacked passes — outer bloom, warm halo, ray fan, disc,
 * limb-darkened rim — because a single flat circle reads as a sticker. All of
 * it is baked into the cached background canvas, so the cost is paid once per
 * camera move rather than once per frame.
 */
/**
 * Sun and moon are baked once and blitted.
 *
 * Everything about a body except WHERE it is — halo, ray fan, disc, limb
 * detail — is fixed, and this now runs on every frame rather than once per
 * cached background. Redrawing sixteen gradients a frame to move a sprite
 * across the sky is work for nothing; the only pass that genuinely depends on
 * position is the wide atmospheric bloom, and that is a single fill.
 */
const bodySprites = new Map<string, HTMLCanvasElement>()

const celestialSprite = (isNight: boolean, r: number, tier: number): HTMLCanvasElement => {
  // Rays reach ~4.3r, so the sprite has to be a good deal wider than the disc.
  const reach = Math.ceil(r * 4.6)
  const size = reach * 2
  const key = `${isNight ? 'moon' : 'sun'}|${Math.round(r)}|${tier}`
  const hit = bodySprites.get(key)
  if (hit) return hit

  const cv = document.createElement('canvas')
  cv.width = size
  cv.height = size
  const c = cv.getContext('2d')!
  const x = reach
  const y = reach

  // The friendly sun (rays, inked disc, a sleepy smile) or the soft moon
  // (cream disc, lavender crescent, closed eyes) — see `backyardArt.ts`.
  if (isNight) paintMoonSprite(c, x, y, r)
  else paintSunSprite(c, x, y, r, tier)

  // Only a handful of variants ever exist (two bodies x a few sizes), but a
  // resize sweep could mint one per pixel width if this were unbounded.
  if (bodySprites.size > 12) bodySprites.clear()
  bodySprites.set(key, cv)
  return cv
}

const drawCelestial = (
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  groundY: number,
  waveNo: number,
  isNight: boolean,
  /** This body's own phase: 0 = rising, 0.25 = highest, 0.5 = setting. */
  bodyPhase: number
): void => {
  const tier = Math.floor(Math.max(0, waveNo) / 5) % 5
  // Below the horizon for the other half of its cycle — the hills are drawn
  // after this, so a body sitting low is occluded by them and rises out of the
  // ridgeline rather than fading in over it.
  if (bodyPhase >= 0.5) return

  const r = Math.max(10, Math.min(w, h) * 0.055)
  // Arc east to west. `sin` gives the ease at both horizons for free, so the
  // body lingers at sunrise and sunset and sweeps through noon.
  const t = bodyPhase / 0.5
  const x = w * (0.08 + 0.84 * t)
  const base = Math.max(groundY, h * 0.55) + r * 0.55
  const y = base - (base - h * 0.1) * Math.sin(Math.PI * t)

  const glow = isNight ? '214,212,255' : '255,226,140'
  // Tier 4 and a boss storm both burn orange: the stormy sunset, never red.
  const stormy = isBossWave(waveNo) && stormOf(dayPhase()) > 0.3
  const bloomTint = tier === 4 || stormy ? '255,158,92' : glow

  // The one pass that has to follow the body: a wide wash of light across the
  // whole sky, which is what makes a low sun feel like it is IN the scene
  // rather than pasted over it.
  const bloom = c.createRadialGradient(x, y, r * 0.4, x, y, Math.min(w, h) * 0.5)
  bloom.addColorStop(0, `rgba(${bloomTint},0.34)`)
  bloom.addColorStop(0.22, `rgba(${bloomTint},0.12)`)
  bloom.addColorStop(1, `rgba(${bloomTint},0)`)
  c.fillStyle = bloom
  c.fillRect(0, 0, w, Math.max(0, groundY))

  // A painted disc replaces the drawn one outright. The bloom above is kept
  // either way: it is a wash across the whole sky, not part of the body.
  const painted = bgSprite(isNight ? 'moon' : 'sun')
  if (painted?.naturalWidth) {
    const d = r * 4.6
    c.drawImage(painted, x - d / 2, y - d / 2, d, d)
    return
  }
  const sprite = celestialSprite(isNight, r, tier)
  c.drawImage(sprite, x - sprite.width / 2, y - sprite.height / 2)
}

/**
 * A conifer: stacked canopy tiers with a lit right edge.
 *
 * Drawn as overlapping trapezoids rather than one triangle so the silhouette
 * has the notched profile a spruce actually has at this size.
 */
const drawConifer = (
  c: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  hgt: number,
  seed: number
): void => {
  // Painted tree, planted on `baseY` by its own artwork bounds.
  const painted = bgSprite('conifer')
  if (painted?.naturalWidth) {
    paintedTree(c, painted, x, baseY, hgt)
    return
  }
  // The flower bed's tall flower: a sunflower, now and then a hollyhock.
  paintTallFlower(c, x, baseY, hgt, seed)
}

/**
 * A broadleaf tree: a forked trunk under three overlapping canopy lobes.
 *
 * The lobes are deliberately off-centre and unequal — a symmetrical blob is
 * the single clearest "programmer art" tell in a tree line.
 */
const drawBroadleaf = (
  c: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  hgt: number,
  seed: number
): void => {
  // Painted tree, planted on `baseY` by its own artwork bounds.
  const painted = bgSprite('broadleaf')
  if (painted?.naturalWidth) {
    paintedTree(c, painted, x, baseY, hgt)
    return
  }
  // The flower bed's clump: tulips, daisies, dandelions or clover.
  paintFlowerClump(c, x, baseY, hgt, seed)
}

/**
 * Sky gradient and the two bodies, painted fresh every frame.
 *
 * Cheap by design: two linear/radial gradient fills plus whichever body is
 * above the horizon. Everything expensive about the backdrop — ridges, tree
 * line, water — stays in the cached layer that goes on top of this.
 */
const drawSky = (c: CanvasRenderingContext2D, w: number, h: number): void => {
  const wv = wave.value
  const [top, mid, low] = skyFor(wv)
  const groundY = worldToScreenY(0)

  const sky = c.createLinearGradient(0, 0, 0, Math.max(groundY, h * 0.7))
  sky.addColorStop(0, top)
  sky.addColorStop(0.62, mid)
  sky.addColorStop(1, low)
  c.fillStyle = sky
  c.fillRect(0, 0, w, Math.max(0, groundY))

  // Summer-night stars: a few dozen rects in three twinkle groups, and nothing
  // at all by day or under a boss storm's clouds.
  const phase = dayPhase()
  const storm = isBossWave(wv) ? stormOf(phase) : 0
  paintStars(c, w, groundY, nightOf(phase) * (1 - storm), performance.now())

  // Both bodies, half a cycle apart, so dusk actually shows the sun going down
  // on one side while the moon comes up on the other.
  drawCelestial(c, w, h, groundY, wv, true, (phase + 0.5) % 1)
  drawCelestial(c, w, h, groundY, wv, false, phase)
}

const renderBackground = (w: number, h: number, dpr: number): void => {
  const zoom = getZoom()
  const rect = viewRect()
  // Quantise the key: re-render only on a meaningful camera move.
  //
  // The day phase is in the key because the haze, the water and the ridge
  // tones are all mixed from the sky colour — but ONLY while the sky moves.
  // With the cycle frozen it was costing a full re-bake of the ridges, both
  // tree lines, the meadow and the grain pass forty times a day cycle, i.e.
  // every 4.5 s, for a wash whose colour had not visibly changed. On a fixed
  // camera that timer was the ONLY thing invalidating the cache, so freezing
  // it turns the backdrop into a bake-once layer. See PERF-LEDGER.md (E2).
  const day = fxDayCycle ? Math.round(dayPhase() * 40) : 0
  const key = `${w}x${h}|${Math.round(rect.l * 4)}|${Math.round(rect.b * 4)}|${Math.round(zoom)}|${wave.value}|${day}|${quality.value}`
  if (key === bgKey && bgCanvas) return
  bgKey = key

  if (!bgCanvas) {
    bgCanvas = document.createElement('canvas')
    bgCtx = bgCanvas.getContext('2d')
  }
  if (bgCanvas.width !== Math.round(w * dpr) || bgCanvas.height !== Math.round(h * dpr)) {
    bgCanvas.width = Math.round(w * dpr)
    bgCanvas.height = Math.round(h * dpr)
  }
  const c = bgCtx!
  c.setTransform(dpr, 0, 0, dpr, 0, 0)
  c.clearRect(0, 0, w, h)

  // The sky and the two bodies are painted live UNDERNEATH this canvas while
  // the day cycle runs — they change every frame and this canvas is cached
  // across many, so its sky band is simply left transparent for them to show
  // through. The scenery on top is opaque, so it composites exactly as it did
  // when it was one layer.
  //
  // Once the cycle is frozen that reasoning inverts: the sky is now the same
  // full-screen gradient plus the same celestial bloom every single frame, so
  // it belongs in the cache with everything else and the frame stops paying
  // for two whole-viewport gradient fills it cannot tell apart.
  if (fxBakedSky) drawSky(c, w, h)
  const wv = wave.value
  const ph = dayPhase()
  const [, mid, low] = skyFor(wv)
  const horizon = mixCss(mid, low, 0.5)
  // One light for the whole re-bake. Every scenery colour below is tinted by
  // it — golden hour, summer night, a boss-wave storm — and pulled toward the
  // horizon colour for distance (see `backyardArt.ts`). Set here, once, so the
  // tint costs a memo lookup per colour rather than anything per frame.
  setBackyardLight(ph, horizon, isBossWave(wv) ? stormOf(ph) : 0)
  const groundY = worldToScreenY(0)

  // ── Clouds, then the yard beyond the sandbox (was: two mountain ranges) ──
  //
  // Far: house fronts, roof lines and garden trees, pale with distance. Near:
  // big leafy trees behind a hedge, a washing line, and the white picket
  // fence. Both are generated along an infinite world at their own parallax,
  // so a painted replacement still has to tile (see `tileBand`).
  paintClouds(c, w, h, groundY, rect.l * zoom * 0.04)
  for (const [idx, cfg] of [
    { par: 0.1, amp: 0.16, base: 0.62 },
    { par: 0.18, amp: 0.22, base: 0.78 }
  ].entries()) {
    const yBase = groundY - h * (1 - cfg.base) * 0.62

    // A painted band replaces the whole generated layer.
    //
    // Tiled rather than stretched: these layers run across an infinite world,
    // so the art has to repeat, and it has to slide at this layer's own
    // parallax or the two stop reading as different distances.
    const range = bgSprite(idx === 0 ? 'mountains-far' : 'mountains-near')
    if (range?.naturalWidth) {
      const bandH = h * cfg.amp + (groundY - yBase) + h * cfg.amp * 0.2
      const bandY = yBase - h * cfg.amp
      tileBand(c, range, -10, bandY, w + 20, bandH, rect.l * zoom * cfg.par)
      continue
    }
    if (idx === 0) {
      paintYardFar(c, w, h, groundY, rect.l * zoom * cfg.par)
      // Aerial haze between the far yard and the near one. Ramps in from
      // nothing, so it has no top edge to read as a band.
      const hzTop = groundY - h * 0.42
      const haze = c.createLinearGradient(0, hzTop, 0, groundY)
      haze.addColorStop(0, cssAlpha(horizon, 0))
      haze.addColorStop(1, cssAlpha(horizon, 0.3))
      c.fillStyle = haze
      c.fillRect(0, hzTop, w, groundY - hzTop)
    } else {
      paintYardNear(c, w, h, groundY, rect.l * zoom * cfg.par)
    }
  }

  // ── The flower bed (was: the forest band) ──
  //
  // Standing ON the ground, not hovering above it — a trunk (or a stem) that
  // stops in mid-air is simply a floating plant. Distance is carried by scale,
  // parallax and haze instead.
  const farBase = groundY
  // A painted far line, when there is painted art to draw it with: the same
  // bitmap, smaller and hazed back, so the line recedes by ATMOSPHERE rather
  // than by being a cruder shape.
  const farTree = bgSprite('conifer')
  if (farTree?.naturalWidth) {
    const step = Math.max(9, w / 90)
    c.save()
    c.globalAlpha = 0.72
    for (let sx = -step; sx <= w + step; sx += step) {
      const wx = (sx + rect.l * zoom * 0.26) / 17
      const seed = Math.floor(wx)
      const jitter = (hash(seed * 2.9) - 0.5) * step * 0.9
      const hgt = h * 0.032 * (0.72 + hash(seed * 5.3) * 0.6)
      paintedTree(c, farTree, sx + jitter, farBase, hgt)
    }
    c.restore()
  } else {
    // The bed's leafy mass and tall grass, behind the flowers.
    paintBedBack(c, w, h, farBase, rect.l * zoom * 0.26)
  }

  // The flowers themselves, a little smaller than the units that walk in
  // front of them so the lane reads as running along the bed, not through it.
  //
  // World-anchored (slot k is always the same plant), so panning slides the
  // bed rather than reshuffling it; drawn as ONE batch of paths per colour.
  // Painted plants, when there are any, go through the per-plant path.
  const nearScroll = rect.l * zoom * 0.34
  if (bgSprite('conifer')?.naturalWidth || bgSprite('broadleaf')?.naturalWidth) {
    paintFlowerBed(c, w, h, groundY, nearScroll, (x, baseY, hgt, seed, tall) => {
      if (tall) drawConifer(c, x, baseY, hgt, seed)
      else drawBroadleaf(c, x, baseY, hgt, seed)
    })
  } else {
    paintFlowerBed(c, w, h, groundY, nearScroll)
  }

  // ── Ground ──
  // A narrow strip of sand the castle stands on, the sandbox's far plank edge
  // along the horizon behind it, then the wet bank and the moat filling the
  // rest of the frame. The moat is the reference silhouette: the tower is
  // mirrored in it, and the water bugs legibly come FROM it.
  if (groundY < h) {
    const seaY = worldToScreenY(SEA_LEVEL)
    const landH = Math.max(2, seaY - groundY)

    // A painted strip replaces the drawn sand AND everything on it — patches,
    // ripples, grain, pebbles, toys. Drawing those on top would double them.
    const meadow = bgSprite('grass')
    if (meadow?.naturalWidth) tileBand(c, meadow, 0, groundY, w, landH, rect.l * zoom)
    else paintSand(c, w, groundY, seaY, zoom, rect.l * zoom)

    // The horizon, drawn: the sandbox's far plank rather than a hard fill edge
    // — a perfectly straight edge across the whole width is the most "vector"
    // line a screen can have.
    paintSandboxFrame(c, w, groundY, zoom, rect.l * zoom)

    // ── Water ──
    if (seaY < h) {
      const lake = bgSprite('water')
      // The painted water is still, so it does not scroll with the camera — a
      // moving water texture under a mirrored tower reads as the tower sliding.
      if (lake?.naturalWidth) tileBand(c, lake, 0, seaY, w, h - seaY, 0)
      paintMoat(c, w, h, seaY, zoom, rect.l * zoom, !!lake?.naturalWidth)
    }
  }

  // ── Paper tooth ──
  //
  // The last pass, over everything. Watercolour on paper is never perfectly
  // smooth, and a faint irregular tooth across the whole frame is what stops a
  // gradient sky from reading as a gradient. It is drawn into the CACHED
  // canvas, so this costs nothing per frame — it is repainted only when the
  // camera moves far enough to rebuild the scenery anyway.
  //
  // Fixed in screen space on purpose: the paper is the screen, not the world,
  // so it must not slide around under the scenery.
  //
  // Skipped on the phone tiers. It is a whole-viewport fill in `multiply`
  // blend, which is the slowest composite a 2D canvas has, and at phone size
  // the tooth is below the threshold anyone can see anyway.
  if (fxGrain) grain(c, w, h, 0.055, 11)
}

// ─── FX event → presentation ────────────────────────────────────────────────

/**
 * Convert one semantic simulation event into particles, text, decals, shake and
 * sound. Keeping this translation in ONE place means the sim never has to know
 * how loud or how sparkly anything is.
 */
/**
 * Particles shed by a body when it is struck.
 *
 * Small, and deliberately not gratuitous: a couple of droplets sold as the
 * right SUBSTANCE does more than a shower of red. What matters is that a
 * skeleton throws bone chips, a slime throws slime, and a ghost throws nothing
 * at all — the same red spray on every enemy is the sort of detail nobody
 * articulates and everybody registers as cheap.
 *
 * `dir` is the side to spray toward (away from whatever landed the hit); 0
 * sprays both ways. `amount` only nudges the count, so a big hit reads bigger
 * without a chip-damage tick producing a fountain.
 */
const emitGore = (
  gore: string, x: number, y: number, dir: number, amount: number, density: number
): void => {
  if (gore === 'none') return
  const heavy = Math.min(1.8, 0.7 + amount / 40)
  const n = Math.round(4 * heavy * density)
  if (n <= 0) return
  /** Away from the hit, or both ways when the direction is unknown. */
  const side = (): number => (dir === 0 ? (Math.random() < 0.5 ? -1 : 1) : dir)

  // Sandbox Tower: every bug is a BUG. Nothing bleeds — a hit sheds goo, and
  // a hard one flicks off a little leg. The kinds still differ in what comes
  // with the goo (shell chips, sparks, a ghostly nothing), so the "right
  // substance" rule above still holds.
  switch (gore) {
    case 'bone':
      // Armoured bugs: dark chitin chips, a little goo behind them.
      for (let i = 0; i < n; i++) {
        emit({
          x, y, vx: side() * (0.6 + Math.random() * 2.6), vy: -0.4 - Math.random() * 2.2,
          life: 420, size: 0.055 + Math.random() * 0.05, color: i % 2 ? GORE_CHITIN : GORE_CHITIN_LIT,
          gravity: 11, drag: 1.2, shape: 1, rot: Math.random() * 6.28, vrot: (Math.random() - 0.5) * 14
        })
      }
      emit({ x, y, vx: side() * 1.2, vy: -0.6, life: 420, size: 0.1, color: GORE_GOO, gravity: 9, drag: 1 })
      break

    case 'ooze':
      for (let i = 0; i < n; i++) {
        emit({
          x, y, vx: side() * (0.5 + Math.random() * 2), vy: -0.3 - Math.random() * 1.6,
          life: 560, size: 0.08 + Math.random() * 0.07, color: i % 3 === 0 ? GORE_GOO_LIT : GORE_GOO,
          gravity: 7, drag: 0.8
        })
      }
      break

    case 'sap':
      for (let i = 0; i < n; i++) {
        emit({
          x, y, vx: side() * (0.5 + Math.random() * 2), vy: -0.4 - Math.random() * 1.8,
          life: 500, size: 0.06 + Math.random() * 0.05,
          color: i % 3 === 0 ? GORE_GOO_DARK : GORE_GOO, gravity: 9, drag: 1
        })
      }
      break

    case 'ember':
      for (let i = 0; i < n + 2; i++) {
        emit({
          x, y, vx: side() * (0.8 + Math.random() * 2.4), vy: -1 - Math.random() * 2.2,
          life: 480, size: 0.05 + Math.random() * 0.04, color: [255, 176, 72],
          additive: true, gravity: -1.4, drag: 2, shape: 2
        })
      }
      break

    case 'spectral':
      for (let i = 0; i < n; i++) {
        emit({
          x, y, vx: side() * (0.4 + Math.random() * 1.2), vy: -0.8 - Math.random() * 1.4,
          life: 620, size: 0.09 + Math.random() * 0.07, color: [172, 240, 232],
          additive: true, alpha: 0.6, drag: 1.6
        })
      }
      break

    case 'metal':
      for (let i = 0; i < n; i++) {
        emit({
          x, y, vx: side() * (1.4 + Math.random() * 4), vy: -0.6 - Math.random() * 2.6,
          life: 260, size: 0.045, color: [255, 232, 170], additive: true, shape: 2,
          gravity: 10, drag: 3
        })
      }
      // Toy-junk contraptions: popsicle-stick splinters and tin flakes.
      for (let i = 0; i < Math.round(n * 0.5); i++) {
        emit({
          x, y, vx: side() * (0.6 + Math.random() * 1.8), vy: -0.4 - Math.random() * 1.6,
          life: 420, size: 0.06, color: i % 2 ? [226, 190, 128] : [172, 180, 190], gravity: 12, drag: 1.2, shape: 1,
          rot: Math.random() * 6.28, vrot: (Math.random() - 0.5) * 12
        })
      }
      break

    default:
      // Bug goo (every kind with no substance of its own — 'blood' included).
      for (let i = 0; i < n; i++) {
        emit({
          x, y, vx: side() * (0.7 + Math.random() * 2.8), vy: -0.5 - Math.random() * 2.4,
          life: 400, size: 0.05 + Math.random() * 0.055, color: i % 3 === 2 ? GORE_GOO_DARK : GORE_GOO,
          gravity: 12, drag: 1.1
        })
      }
      // A little fine mist, so the spray has a soft edge rather than reading as
      // a handful of discrete dots.
      for (let i = 0; i < Math.round(n * 0.6); i++) {
        emit({
          x, y, vx: side() * (0.3 + Math.random() * 1.4), vy: -0.3 - Math.random() * 1.2,
          life: 300, size: 0.09, color: GORE_GOO_LIT, alpha: 0.4, drag: 2.4
        })
      }
  }
  // A hard hit knocks a little leg loose — the "it's a bug" tell. At most one,
  // so a chip-damage tick never becomes a shower of limbs.
  if (gore !== 'spectral' && gore !== 'ember' && amount >= 12 && Math.random() < 0.5 * density) {
    emitLeg(x, y, side())
  }
}

/** Bug goo, green-yellow (sandbox-reskin.md: `#b7d63f` / `#6f9a22`). */
const GORE_GOO: [number, number, number] = [183, 214, 63]
const GORE_GOO_DARK: [number, number, number] = [111, 154, 34]
const GORE_GOO_LIT: [number, number, number] = [214, 236, 120]
/** Dark beetle shell. */
const GORE_CHITIN: [number, number, number] = [58, 44, 40]
const GORE_CHITIN_LIT: [number, number, number] = [104, 84, 70]

/** One little bug leg: a dark ink streak tumbling off along its own fall. */
const emitLeg = (x: number, y: number, side: number): void => {
  emit({
    x, y, vx: side * (1 + Math.random() * 2.2), vy: 1 + Math.random() * 1.8,
    life: 520, size: 0.09 + Math.random() * 0.04, color: [59, 42, 33],
    gravity: 12, drag: 0.8, shape: 2
  })
}

/**
 * Water thrown up by a round that lands in the lake.
 *
 * The tower's guns hit dirt and stone, so every impact recipe throws grit and
 * soot. A ship's does not: its rounds come down on open water, and dust over a
 * lake reads as a bug. This is the naval half of the impact — a column of spray
 * off the surface, a ring of droplets, and the foam ring left behind.
 *
 * Drawn at the SURFACE, not at the round's depth: a plume that starts a metre
 * down is a plume nobody sees.
 */
const waterImpact = (x: number, depth: number, power: number, density: number): void => {
  const n = Math.round(9 * power * density)
  for (let i = 0; i < n; i++) {
    // Narrow and fast up the middle, wide and slow at the skirt — one spread
    // for both reads as a hemisphere of confetti.
    const t = Math.random()
    const a = -Math.PI / 2 + (t - 0.5) * (0.5 + t * 1.9)
    const sp = (2.4 + Math.random() * 4.6) * power
    emit({
      x: x + (Math.random() - 0.5) * 0.3 * power, y: SEA_LEVEL,
      vx: Math.cos(a) * sp * 0.5, vy: -Math.sin(a) * sp,
      life: 380 + Math.random() * 320, size: (0.07 + Math.random() * 0.1) * power,
      color: i % 3 === 0 ? [255, 255, 255] : [127, 224, 236],
      alpha: 0.9, gravity: 12, drag: 1.1, shape: 2
    })
  }
  // The column itself: a couple of soft lobes so the spray has a body and not
  // just an outline of droplets.
  for (let i = 0; i < Math.round(3 * density); i++) {
    emit({
      x: x + (Math.random() - 0.5) * 0.2, y: SEA_LEVEL + i * 0.12 * power,
      vx: (Math.random() - 0.5) * 0.7, vy: (2.2 - i * 0.5) * power,
      life: 340 + Math.random() * 220, size: (0.26 + i * 0.06) * power,
      color: [214, 248, 252], alpha: 0.5, gravity: 9, drag: 1.6, shape: 0
    })
  }
  // Foam ring spreading on the surface — the tell that says WHERE it landed.
  for (let i = 0; i < Math.round(6 * density); i++) {
    const dir = i % 2 ? 1 : -1
    emit({
      x, y: SEA_LEVEL, vx: dir * (1.4 + Math.random() * 1.8) * power, vy: 0.15,
      life: 420, size: 0.1 * power, color: [245, 254, 255], alpha: 0.7, drag: 3.4
    })
  }
  // Bubbles rising back out of the hole the round punched.
  if (depth < SEA_LEVEL - 0.2) {
    for (let i = 0; i < Math.round(4 * density); i++) {
      emit({
        x: x + (Math.random() - 0.5) * 0.4, y: depth,
        vx: (Math.random() - 0.5) * 0.3, vy: 0.9 + Math.random() * 0.7,
        life: 620, size: 0.06 + Math.random() * 0.05,
        color: [200, 244, 250], alpha: 0.5, drag: 0.9
      })
    }
  }
}

// ─── Sandbox Tower: what each round is made of ──────────────────────────────
//
// The sim knows four heavy round kinds; the reskin draws seven things. A mortar
// and a balloon launcher both fire `shell`, and the player's squirt gun and an
// ant catapult both fire `ball` — so what a round LOOKS like is decided here,
// on the renderer's side, from the round itself (who fired it, and whether it
// is hostile). Ids, kinds and the event stream are untouched.

type RoundLook =
  | 'dart' | 'toothpick' | 'water' | 'pebble' | 'clod' | 'mud' | 'balloon'
  | 'honey' | 'ember' | 'ice'

const lookOfRound = (p: Projectile): RoundLook => {
  switch (p.kind) {
    case 'bolt': return 'dart'
    case 'quarrel': return 'toothpick'
    case 'ball': return p.hostile ? (p.uid % 3 === 0 ? 'clod' : 'pebble') : 'water'
    case 'shell': return getTowerBlocks().get(p.sourceUid)?.typeId === 'bombard' ? 'balloon' : 'mud'
    case 'bomb': return 'honey'
    case 'fire': return 'ember'
    case 'frost': return 'ice'
    default: return 'dart'
  }
}

/**
 * The last place each round in flight was DRAWN, and what it was drawn as.
 *
 * A detonation event carries the round's kind but not its source, and by the
 * time the renderer drains it the round is gone. The round's last drawn
 * position was one frame earlier and within a fraction of a cell of the hit,
 * so the nearest recent sighting of the same kind is the round that went off —
 * which is how a balloon pops into a splash and a mud ball lands as mud.
 * A miss (a hidden tab, say) falls back to the kind's commoner look.
 */
interface SeenRound { kind: string; look: RoundLook; hue: number; x: number; y: number; at: number }
const seenRounds = new Map<number, SeenRound>()

/** Returned for the kinds whose look is never ambiguous — nothing to remember. */
const PLAIN_ROUND: SeenRound = { kind: '', look: 'dart', hue: 0, x: 0, y: 0, at: 0 }

const sightRound = (p: Projectile): SeenRound => {
  if (p.kind !== 'ball' && p.kind !== 'shell') {
    PLAIN_ROUND.kind = p.kind
    PLAIN_ROUND.look = lookOfRound(p)
    PLAIN_ROUND.hue = p.uid % 4
    return PLAIN_ROUND
  }
  const now = performance.now()
  let s = seenRounds.get(p.uid)
  if (!s || s.kind !== p.kind || now - s.at > 1500) {
    if (seenRounds.size > 96) {
      for (const [id, o] of seenRounds) if (now - o.at > 2500) seenRounds.delete(id)
    }
    s = { kind: p.kind, look: lookOfRound(p), hue: p.uid % 4, x: p.x, y: p.y, at: now }
    seenRounds.set(p.uid, s)
  }
  s.x = p.x
  s.y = p.y
  s.at = now
  return s
}

const roundThatHit = (kind: string | undefined, x: number, y: number): SeenRound | null => {
  if (!kind) return null
  const now = performance.now()
  let best: SeenRound | null = null
  let bestId = -1
  let bestD = 2.25
  for (const [id, s] of seenRounds) {
    // Generous on age: a slow device can go a good fraction of a second
    // between drawn frames, and distance + kind already pin the round down.
    if (s.kind !== kind || now - s.at > 2000) continue
    const d = (s.x - x) * (s.x - x) + (s.y - y) * (s.y - y)
    if (d < bestD) { bestD = d; best = s; bestId = id }
  }
  if (bestId >= 0) seenRounds.delete(bestId)
  return best
}

/**
 * The blast look for a detonation: the round's own when it was seen, else the
 * kind's commoner one. A detonation with no round at all is either a dying
 * block (`quiet`: a sand puff) or a bombardier beetle going pop.
 */
const blastLookOf = (kindOf: string | undefined, seen: SeenRound | null, quiet?: boolean): string => {
  if (seen) {
    return seen.look === 'pebble' || seen.look === 'clod' || seen.look === 'toothpick' ? 'sand'
      : seen.look === 'dart' ? 'bolt' : seen.look === 'ice' ? 'frost' : seen.look === 'ember' ? 'fire'
        : seen.look
  }
  switch (kindOf) {
    case undefined: return quiet ? 'sand' : 'pop'
    case 'ball': return 'water'
    case 'shell': return 'mud'
    case 'bomb': return 'honey'
    case 'quarrel': return 'sand'
    case 'fire': return 'fire'
    default: return kindOf
  }
}

// Sand, as particles (sandbox-reskin.md world palette).
const SAND_LIGHT: [number, number, number] = [246, 226, 174]
const SAND_MID: [number, number, number] = [227, 192, 126]
const SAND_DARK: [number, number, number] = [184, 140, 76]
/** A sand-dust puff — what used to be grey dust and soot. */
const SAND_DUST: [number, number, number] = [236, 214, 166]
const WATER_WHITE: [number, number, number] = [255, 255, 255]
const WATER_LIGHT: [number, number, number] = [127, 224, 236]
const WATER_MID: [number, number, number] = [52, 179, 209]
const WATER_MIST: [number, number, number] = [222, 248, 252]
const MUD_RGB: [number, number, number][] = [[122, 86, 48], [88, 58, 30], [166, 124, 76]]
const HONEY_RGB: [number, number, number][] = [[245, 165, 29], [255, 219, 102], [197, 112, 10]]

/** Block palettes that are moulded sand, and the one that is a pebble wall. */
const SAND_BLOCKS = new Set(['gate', 'wood', 'brace', 'spikes'])
const PEBBLE_BLOCKS = new Set(['stone'])
/** Blast looks that kick a skirt of sand off the ground. */
const GRITTY = new Set(['mud', 'sand', 'pop'])

/**
 * The particle half of a splash detonation, per look. Same budget the old
 * fireball spent (26 embers + 12 smoke at full density), spent on the right
 * substance: water throws drops and mist, mud throws gobs, honey throws slow
 * golden gobs, sand throws grains and a dust cloud, and a bombardier beetle
 * pops in yellow-orange and leaves a green stink hanging.
 */
const burstMatter = (look: string, x: number, y: number, r: number, density: number, hue: number): void => {
  const n = Math.round(26 * density)
  const m = Math.round(12 * density)
  const rnd = Math.random
  switch (look) {
    case 'water':
    case 'balloon': {
      for (let i = 0; i < n; i++) {
        const a = Math.PI / 2 + (rnd() - 0.5) * 2.8
        const sp = (1.5 + rnd() * 6) * r * 0.5
        emit({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp + 0.8,
          life: 420 + rnd() * 320, size: 0.1 + rnd() * 0.13,
          color: i % 3 === 0 ? WATER_WHITE : i % 3 === 1 ? WATER_LIGHT : WATER_MID,
          alpha: 0.95, gravity: 11, drag: 1.2, shape: i % 4 === 0 ? 2 : 0
        })
      }
      for (let i = 0; i < Math.round(m * 0.5); i++) {
        emit({
          x, y, vx: (rnd() - 0.5) * 2 * r, vy: 0.4 + rnd() * 1.2,
          life: 700 + rnd() * 300, size: 0.45 * r, color: WATER_MIST,
          alpha: 0.4, gravity: -0.4, drag: 1.6, shape: 3
        })
      }
      if (look === 'balloon') {
        // Shreds of the balloon's own rubber.
        const rub = BALLOON_RGB[hue % 4]!
        for (let i = 0; i < Math.round(6 * density); i++) {
          const a = rnd() * Math.PI * 2
          const sp = 2 + rnd() * 3.5
          emit({
            x, y, vx: Math.cos(a) * sp, vy: Math.abs(Math.sin(a)) * sp + 1,
            life: 620 + rnd() * 300, size: 0.12 + rnd() * 0.1, color: rub,
            gravity: 9, drag: 1.4, shape: 1, rot: rnd() * 6.28, vrot: (rnd() - 0.5) * 16
          })
        }
      }
      break
    }
    case 'mud':
    case 'honey': {
      const honey = look === 'honey'
      const pal = honey ? HONEY_RGB : MUD_RGB
      for (let i = 0; i < Math.round(n * 0.75); i++) {
        const a = Math.PI / 2 + (rnd() - 0.5) * 3.2
        const sp = (1.2 + rnd() * 5) * r * 0.5
        emit({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp + 0.9,
          life: 480 + rnd() * 360, size: 0.1 + rnd() * 0.14, color: pal[i % 3]!,
          gravity: honey ? 9 : 14, drag: honey ? 1.8 : 0.9
        })
      }
      for (let i = 0; i < Math.round(m * 0.5); i++) {
        emit({
          x, y, vx: (rnd() - 0.5) * 2.4 * r, vy: 0.5 + rnd() * 1.4,
          life: 800 + rnd() * 400, size: 0.45 * r, color: honey ? [255, 228, 150] : SAND_DUST,
          alpha: 0.4, gravity: -0.9, drag: 1.4, shape: 3
        })
      }
      break
    }
    case 'pop': {
      // Bombardier beetle: a comic yellow-orange pop and a stink that hangs.
      emit({ x, y, life: 130, size: r * 0.5 * BLAST_SCALE, color: [255, 246, 200], alpha: 0.5, additive: true })
      for (let i = 0; i < Math.round(n * 0.65); i++) {
        const a = rnd() * Math.PI * 2
        const sp = (1 + rnd() * 5) * r * 0.5
        emit({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp + 1.2,
          life: 380 + rnd() * 300, size: 0.16 + rnd() * 0.2,
          color: i % 3 === 0 ? [255, 240, 170] : i % 3 === 1 ? [255, 206, 72] : [255, 146, 48],
          gravity: 2, drag: 2.4
        })
      }
      // The stink: thin at first so the pop reads yellow-orange, then hanging
      // on after it as a lazy green cloud.
      for (let i = 0; i < m; i++) {
        emit({
          x: x + (rnd() - 0.5) * r * 0.6, y: y + r * 0.2,
          vx: (rnd() - 0.5) * 2.2 * r, vy: 0.4 + rnd() * 1.3,
          life: 1300 + rnd() * 600, size: 0.45 * r,
          color: i % 2 ? [156, 196, 72] : [124, 164, 56],
          alpha: 0.32, gravity: -0.7, drag: 1.5, shape: 3
        })
      }
      for (let i = 0; i < Math.round(4 * density); i++) {
        emit({
          x, y, vx: (rnd() - 0.5) * 4, vy: 1 + rnd() * 2.4,
          life: 520, size: 0.08 + rnd() * 0.06, color: GORE_GOO, gravity: 11, drag: 1
        })
      }
      break
    }
    default: {
      // Sand: a pebble, a clod or a toothpick landing, or a block crumbling.
      for (let i = 0; i < Math.round(n * 0.75); i++) {
        const a = Math.PI / 2 + (rnd() - 0.5) * 3
        const sp = (1.2 + rnd() * 5.5) * r * 0.5
        emit({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp + 0.6,
          life: 420 + rnd() * 360, size: 0.06 + rnd() * 0.07,
          color: i % 3 === 0 ? SAND_LIGHT : i % 3 === 1 ? SAND_MID : SAND_DARK,
          gravity: 13, drag: 1
        })
      }
      for (let i = 0; i < Math.round(m * 0.8); i++) {
        emit({
          x, y, vx: (rnd() - 0.5) * 3 * r, vy: 0.5 + rnd() * 1.8,
          life: 800 + rnd() * 500, size: 0.5 * r, color: SAND_DUST,
          alpha: 0.5, gravity: -1, drag: 1.4, shape: 3
        })
      }
    }
  }
}

const consumeFx = (ev: FxEvent): void => {
  const q = quality.value
  const density = q === 'high' ? 1 : q === 'medium' ? 0.6 : 0.32

  switch (ev.kind) {
    case 'place': {
      const p = themedPalette(ev.palette)
      for (let i = 0; i < Math.round(14 * density); i++) {
        const a = Math.PI + Math.random() * Math.PI
        emit({
          x: ev.x + (Math.random() - 0.5) * 0.7, y: ev.y - 0.45,
          vx: Math.cos(a) * 1.6, vy: Math.abs(Math.sin(a)) * 1.4,
          life: 420 + Math.random() * 240, size: 0.14,
          color: SAND_DUST, alpha: 0.6, gravity: 3, drag: 2.2, shape: 3
        })
      }
      emit({ x: ev.x, y: ev.y, vx: 0, vy: 0, life: 220, size: 1.1, color: hexToRgb(p.accent2), alpha: 0.5, additive: true })
      playFx('place')
      break
    }
    case 'merge': {
      // Louder than a placement on purpose: a fused block is worth three of the
      // piece that made it, and the tell has to say so. The block's own accent
      // bursts outward, a ring swells over it, and the multiplier lands as text
      // so "×3" is learned the first time it happens rather than explained.
      //
      // In the NEW tier's colour, not the block's accent: the burst is the
      // moment the plate changes colour, and it should be the colour the plate
      // changes to.
      const ts = tierStyle(Math.max(2, ev.tier))
      const rgb: [number, number, number] = [ts.rgb[0], ts.rgb[1], ts.rgb[2]]
      for (let i = 0; i < Math.round(18 * density); i++) {
        const a = Math.random() * Math.PI * 2
        const v = 1.4 + Math.random() * 2.2
        emit({
          x: ev.x, y: ev.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          life: 420 + Math.random() * 200, size: 0.1 + Math.random() * 0.06,
          color: rgb, alpha: 0.9, additive: true, drag: 2.4
        })
      }
      emit({ x: ev.x, y: ev.y, vx: 0, vy: 0, life: 320, size: 1.6, color: rgb, alpha: 0.55, additive: true })
      emitText({
        x: ev.x, y: ev.y + 0.6, vy: 1.4, life: 900,
        text: `×${Math.pow(3, Math.max(1, ev.tier) - 1)}`,
        color: ts.hex, size: 0.42 + 0.05 * Math.min(4, Math.max(0, ev.tier - 2)), crit: true
      })
      playFx('place')
      break
    }
    case 'sell': {
      for (let i = 0; i < Math.round(10 * density); i++) {
        emit({
          x: ev.x, y: ev.y,
          vx: (Math.random() - 0.5) * 2.4, vy: 1 + Math.random() * 2,
          life: 500, size: 0.12, color: [255, 214, 92], alpha: 0.9, gravity: 5, additive: true
        })
      }
      playFx('sell')
      break
    }
    case 'blockHit': {
      // The castle is sand: a knock sheds grains, not splinters.
      for (let i = 0; i < Math.round(4 * density); i++) {
        emit({
          x: ev.x, y: ev.y,
          vx: (Math.random() - 0.5) * 3.2, vy: Math.random() * 2.4,
          life: 300, size: 0.07 + Math.random() * 0.04, color: i % 2 ? SAND_MID : SAND_DARK,
          alpha: 0.9, gravity: 9
        })
      }
      break
    }
    case 'shatter': {
      const p = themedPalette(ev.palette)
      // What a block breaks INTO depends on what it is made of: moulded sand
      // crumbles into grains and a few clumps, the pebble wall drops round
      // pebbles, and a toy (every fixture) snaps into plastic chips over the
      // sand plinth it stood on.
      const matter = SAND_BLOCKS.has(ev.palette) ? 'sand' : PEBBLE_BLOCKS.has(ev.palette) ? 'pebble' : 'toy'
      for (let i = 0; i < Math.round(18 * density); i++) {
        const a = Math.random() * Math.PI * 2
        const sp = 1.5 + Math.random() * 4.5
        const grain = matter === 'sand' ? i % 3 !== 0 : matter === 'toy' && i % 3 === 0
        emit({
          x: ev.x, y: ev.y,
          vx: Math.cos(a) * sp, vy: Math.abs(Math.sin(a)) * sp * 1.2,
          life: 700 + Math.random() * 500,
          size: grain ? 0.07 + Math.random() * 0.06
            : matter === 'pebble' ? 0.15 + Math.random() * 0.12 : 0.13 + Math.random() * 0.12,
          color: grain && matter === 'toy' ? SAND_MID : p.debris, gravity: 16, drag: 0.4,
          // Round pebbles and grains; only clumps and plastic keep the tumbling quad.
          shape: grain || matter === 'pebble' ? 0 : 1,
          rot: Math.random() * 6.28, vrot: (Math.random() - 0.5) * 14
        })
      }
      for (let i = 0; i < Math.round(8 * density); i++) {
        emit({
          x: ev.x, y: ev.y,
          vx: (Math.random() - 0.5) * 2, vy: 0.6 + Math.random() * 1.4,
          life: 800, size: 0.4, color: SAND_DUST, alpha: 0.45, gravity: -1.2, drag: 1.4, shape: 3
        })
      }
      triggerShake('small')
      playFx('shatter')
      // Leave a ghost where it stood — see `drawLostMarks`.
      if (ev.w) noteLostBlock(ev.x, ev.y, ev.w, ev.h ?? 1, performance.now())
      break
    }
    case 'explosion': {
      const r = ev.radius
      // A splash detonation is drawn with the palette of the ROUND that made
      // it. Every splash used to bloom as the same orange fireball, which meant
      // a frost shell — a weapon whose entire identity is that it is cold —
      // exploded in fire.
      const cold = ev.kindOf === 'frost'
      // Sandbox Tower: nothing here is powder. A squirt-gun blob or a balloon
      // bursts into a splash, a mud ball lands as mud, a honey bomb as honey, a
      // catapult pebble (or a crumbling block) as a puff of sand, and a
      // bombardier beetle goes POP. See `blastLookOf`.
      const seen = cold ? null : roundThatHit(ev.kindOf, ev.x, ev.y)
      const wet = ev.y < SEA_LEVEL
      // A boat breaking up on the moat splashes; it does not puff sand.
      const look = cold ? 'frost' : wet && ev.quiet ? 'water' : blastLookOf(ev.kindOf, seen, ev.quiet)
      spawnBlast(ev.x, ev.y, Math.min(1.3, r * 0.7), look, 0,
        { life: cold ? 420 : 480, radial: true, dust: GRITTY.has(look) && !wet && ev.y < 1.1 })
      // A splash round throws a column of water proportional to its blast.
      if (wet) waterImpact(ev.x, ev.y, Math.min(1.6, 0.7 + r * 0.4), density)
      if (!cold) {
        burstMatter(look, ev.x, ev.y, r, density, seen?.hue ?? 0)
        // A damp patch (water, mud, honey) or a scuff (sand) where it landed.
        if (ev.y < 1.4 && look !== 'pop') emitDecal(ev.x, 0.06, r * 0.9, look === 'sand' ? 0.28 : 0.42)
        triggerShake(r > 2 ? 'strong' : 'small')
        if (!ev.quiet) playFx('explosion')
        break
      }
      // A soft additive bloom UNDER the drawn fireball. Kept small: it is there
      // to make the drawing glow, not to be the effect.
      emit({
        // Trimmed with the drawing it sits under: a glow that keeps its old
        // radius around a smaller fireball stops being a glow and becomes the
        // effect, which is the thing being cut back.
        x: ev.x, y: ev.y, life: 130, size: r * 0.5 * BLAST_SCALE,
        color: cold ? [212, 246, 255] : [255, 250, 220], alpha: 0.45, additive: true
      })
      for (let i = 0; i < Math.round(26 * density); i++) {
        const a = Math.random() * Math.PI * 2
        const sp = (1 + Math.random() * 6) * r * 0.5
        emit({
          x: ev.x, y: ev.y,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp + (cold ? 0.6 : 1.5),
          life: 380 + Math.random() * 320, size: 0.2 + Math.random() * 0.24,
          color: cold
            ? (i % 3 === 0 ? [240, 253, 255] : [150, 226, 255])
            : (i % 3 === 0 ? [255, 240, 180] : [255, 140, 40]),
          gravity: cold ? 5 : 3, drag: 2.4, additive: true,
          shape: cold && i % 2 === 0 ? 1 : 0,
          rot: Math.random() * 6.28, vrot: (Math.random() - 0.5) * 9
        })
      }
      for (let i = 0; i < Math.round(12 * density); i++) {
        emit({
          x: ev.x, y: ev.y,
          vx: (Math.random() - 0.5) * 3 * r, vy: 0.8 + Math.random() * 2.4,
          life: 900 + Math.random() * 500, size: 0.55 * r,
          color: cold ? [186, 216, 228] : [70, 66, 62],
          alpha: cold ? 0.35 : 0.5, gravity: -1.4, drag: 1.3, shape: 3
        })
      }
      if (!cold && ev.y < 1.4) emitDecal(ev.x, 0.06, r * 0.9, 0.5)
      triggerShake(r > 2 ? 'strong' : 'small')
      if (!ev.quiet) playFx(cold ? 'frost' : 'explosion')
      break
    }
    case 'impact': {
      // Every round used to land as the same eight-dot radial puff, in one of
      // two colours. A weapon's hit is the only feedback the player gets that
      // it did anything, so each one now lands differently — and along the
      // round's own line of travel, because a radial burst reads as a decal
      // stamped on the scene rather than as something arriving.
      const a0 = ev.angle
      /** A cone of debris thrown FORWARD along the round's path. */
      const spray = (
        n: number, speed: number, spread: number, life: number, size: number,
        color: [number, number, number],
        o: { additive?: boolean; shape?: 0 | 1 | 2 | 3; gravity?: number; drag?: number } = {}
      ): void => {
        for (let i = 0; i < Math.round(n * density); i++) {
          const a = a0 + (Math.random() - 0.5) * spread
          const sp = speed * (0.55 + Math.random() * 0.9)
          emit({
            x: ev.x, y: ev.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
            life: life * (0.7 + Math.random() * 0.6), size: size * (0.7 + Math.random() * 0.7),
            color, additive: o.additive, shape: o.shape ?? 2,
            gravity: o.gravity ?? 0, drag: o.drag ?? 3,
            rot: Math.random() * 6.28, vrot: (Math.random() - 0.5) * 10
          })
        }
      }
      /** A thin ring perpendicular to the impact — the concussion tell. */
      const ring = (n: number, speed: number, life: number, size: number, color: [number, number, number], additive = false): void => {
        for (let i = 0; i < Math.round(n * density); i++) {
          const a = a0 + Math.PI / 2 + (i % 2 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.9
          emit({
            x: ev.x, y: ev.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
            life, size, color, additive, drag: 4
          })
        }
      }

      // Below the shoreline this landed in the lake, so the dirt recipe is
      // wrong twice over: no dust skirt, and a plume of water instead.
      const wet = ev.y < SEA_LEVEL
      // What actually landed (see `roundThatHit`): the kind alone cannot tell a
      // water blob from a catapult pebble, or a mud ball from a balloon.
      const seen = ev.kindOf === 'ball' || ev.kindOf === 'shell' ? roundThatHit(ev.kindOf, ev.x, ev.y) : null
      const look = ev.kindOf === 'frost' || ev.kindOf === 'zap' ? ev.kindOf : blastLookOf(ev.kindOf, seen)
      spawnBlast(ev.x, ev.y, BLAST_R[ev.kindOf] ?? 0.45, look, a0, {
        life: ev.kindOf === 'bolt' ? 260 : 340,
        // Only the heavy rounds kick up a skirt, and only near the ground.
        dust: !wet && ev.y < 0.9 && GRITTY.has(look)
      })
      if (wet) waterImpact(ev.x, ev.y, ev.kindOf === 'bolt' ? 0.7 : 1, density)

      switch (ev.kindOf) {
        case 'bolt':
          // Dart Blaster: fast, small, and over instantly — a foam dart goes
          // BOINK. A white pin-flash, a tight cone of white impact lines and a
          // couple of orange foam crumbs; nothing that lingers.
          emit({ x: ev.x, y: ev.y, life: 80, size: 0.18, color: [255, 250, 236], additive: true, alpha: 0.7 })
          spray(5, 4.2, 1.1, 170, 0.07, [255, 255, 255], { drag: 5 })
          spray(3, 2.2, 2.4, 260, 0.05, [255, 150, 56], { gravity: 7, shape: 0, drag: 2 })
          break

        case 'ball': {
          // Squirt gun: the blob bursts. A ring of drops standing across the
          // hit sells the stop; the spray carries on along the line of flight.
          ring(6, 3.2, 300, 0.14, WATER_LIGHT)
          spray(8, 4.6, 1.0, 340, 0.1, WATER_MID, { gravity: 9, shape: 0, drag: 2 })
          spray(5, 1.6, 2.0, 520, 0.16, WATER_WHITE, { gravity: 4, shape: 0, drag: 1.6 })
          triggerShake('small')
          break
        }

        case 'shell': {
          // Mud mortar / balloon launcher without a splash radius: the heaviest
          // single round, landing as a splat of mud or a popped balloon.
          const balloon = look === 'balloon'
          ring(8, 4.4, 340, 0.18, balloon ? WATER_LIGHT : MUD_RGB[1]!)
          spray(10, 5.4, 1.3, 480, 0.12, balloon ? WATER_MID : MUD_RGB[0]!, { gravity: 12, shape: 0, drag: 1.4 })
          spray(7, 2.0, 2.4, 700, 0.26, balloon ? WATER_MIST : SAND_DUST, { gravity: -1.1, shape: 3, drag: 1.4 })
          if (balloon) {
            spray(5, 3, 3, 620, 0.14, BALLOON_RGB[(seen?.hue ?? 0) % 4]!, { gravity: 9, shape: 1, drag: 1.4 })
          }
          if (q !== 'low') emitDecal(ev.x, ev.y, 0.5, 0.4)
          triggerShake('strong')
          break
        }

        case 'zap': {
          // Bug zapper: no debris at all. Electricity does not throw chips of
          // the thing it hits — it flashes, and it forks, blue-violet.
          emit({ x: ev.x, y: ev.y, life: 90, size: 0.3, color: [244, 240, 255], additive: true, alpha: 0.7 })
          for (let i = 0; i < Math.round(9 * density); i++) {
            const a = Math.random() * Math.PI * 2
            const sp = 5.5 + Math.random() * 4
            emit({
              x: ev.x, y: ev.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
              life: 130 + Math.random() * 90, size: 0.05, color: [182, 166, 255],
              additive: true, shape: 2, drag: 9
            })
          }
          break
        }

        case 'frost': {
          // Frost: slow, crystalline, and it hangs. The lingering mist is the
          // point — this is the weapon whose effect outlasts its hit.
          emit({ x: ev.x, y: ev.y, life: 260, size: 0.34, color: [206, 244, 255], additive: true, alpha: 0.5 })
          spray(7, 3.0, 2.6, 480, 0.09, [176, 234, 255], { shape: 1, drag: 4, gravity: 3 })
          for (let i = 0; i < Math.round(5 * density); i++) {
            const a = Math.random() * Math.PI * 2
            emit({
              x: ev.x, y: ev.y, vx: Math.cos(a) * 0.8, vy: Math.sin(a) * 0.8 - 0.4,
              life: 900, size: 0.24, color: [214, 240, 255], alpha: 0.5, drag: 1.2
            })
          }
          break
        }

        default:
          // Anything else (a toothpick, a stray): a flick of sand grains.
          spray(7, 3.6, 1.6, 260, 0.09, SAND_MID, { gravity: 8, shape: 0, drag: 3 })
      }
      playFx(ev.kindOf === 'frost' ? 'frost' : 'impact')
      break
    }
    case 'muzzle': {
      // The flash itself is DRAWN (see `drawMuzzle`); particles only carry the
      // embers and grit that a drawn shape can't animate convincingly.
      const rec = MUZZLE_RECIPES[ev.weapon]
      if (!rec) { playFx('shoot'); break }

      // A lobbing gun fires on its own fixed elevation, and the tesla straight
      // up out of its coil — following the aim would hang the flame in mid-air
      // beside a barrel that never moved.
      const ang = rec.up ? Math.PI / 2
        : rec.elev !== undefined ? lobAngle(ev.x, rec.elev)
        : ev.angle
      // Start at the gun's mount, then run out along the barrel.
      const gx = ev.x + (rec.ox ?? 0)
      const gy = ev.y + (rec.oy ?? 0)
      const mx = gx + Math.cos(ang) * rec.reach
      const my = gy + Math.sin(ang) * rec.reach + (rec.rise ?? 0)
      spawnMuzzle(mx, my, ang, rec)

      if (q !== 'low') {
        if (rec.style === 'gun' || rec.style === 'lob') {
          // What rides out of the mouth: water drops off a squirt gun, mud
          // flecks off the mud mortar, a puff of air off a spring launcher —
          // and, for the heavy tubes, a cloud falling back round the mouth
          // (mist, or sand dust). Same counts the powder grains and soot had.
          const heavy = rec.style === 'lob'
          const grit = rec.grit ?? 1
          const matter = rec.matter ?? 'water'
          for (let i = 0; i < Math.round((heavy ? 4 : 6) * density * grit); i++) {
            const a = ang + (Math.random() - 0.5) * rec.spread * 1.6
            const sp = (heavy ? 3 : 6) * (0.5 + Math.random()) * grit
            emit({
              x: mx, y: my, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
              life: 200 + Math.random() * 180, size: (matter === 'mud' ? 0.09 : 0.07) * grit,
              color: matter === 'mud' ? MUD_RGB[i % 3]!
                : matter === 'air' ? [255, 250, 238]
                  : i % 2 ? WATER_WHITE : WATER_LIGHT,
              gravity: matter === 'air' ? 0 : 8, shape: i % 2 ? 2 : 0, drag: 4.5
            })
          }
          if (heavy) {
            for (let i = 0; i < Math.round(3 * density); i++) {
              emit({
                x: mx, y: my, vx: (Math.random() - 0.5) * 1.6, vy: 0.6 + Math.random() * 1.2,
                life: 700 + Math.random() * 400, size: 0.26,
                color: matter === 'mud' ? SAND_DUST : WATER_MIST, alpha: 0.45, gravity: -1, drag: 1.5, shape: 3
              })
            }
            triggerShake('small')
          }
        } else if (rec.style === 'bow') {
          // A puff of air off the dart blaster's barrel — no light at all.
          const grit = rec.grit ?? 1
          for (let i = 0; i < Math.round(3 * density * grit); i++) {
            emit({
              x: mx, y: my, vx: (Math.random() - 0.5) * 1.4, vy: -0.3 - Math.random() * 0.8,
              life: 320, size: 0.07 * grit, color: [255, 248, 236],
              alpha: 0.7, gravity: 5, drag: 2.6
            })
          }
        }
      }
      playFx('shoot')
      break
    }
    case 'lightning': {
      // The bolt itself is drawn by `drawLightning` from a short-lived record;
      // here we only add the sparks at each strike point.
      lightningBolts.push({ points: ev.points.slice(), life: 190, maxLife: 190 })
      for (let i = 2; i < ev.points.length; i += 2) {
        for (let k = 0; k < Math.round(6 * density); k++) {
          const a = Math.random() * Math.PI * 2
          emit({
            x: ev.points[i]!, y: ev.points[i + 1]!,
            vx: Math.cos(a) * 4, vy: Math.sin(a) * 4,
            life: 260, size: 0.09, color: k % 2 ? [196, 182, 255] : [170, 214, 255], additive: true, shape: 2, drag: 3.5
          })
        }
      }
      screenFlash = Math.max(screenFlash, 0.24)
      playFx('zap')
      break
    }
    case 'enemyHit': {
      if (ev.amount >= 1) {
        emitText({
          x: ev.x, y: ev.y + 0.45, vy: 1.5, life: 620,
          text: String(Math.max(1, Math.round(ev.amount))),
          color: '#ffe08a', size: 0.34, crit: ev.amount >= 25
        })
      }
      // What comes out depends on what was hit. Every enemy used to shed the
      // same red droplets, skeletons included.
      emitGore(ev.gore, ev.x, ev.y, ev.dir, ev.amount, density)
      break
    }
    case 'enemyDie': {
      const p = themedPalette(ev.palette)
      const n = ev.boss ? 40 : 14
      // A bug comes apart as shell bits in its own colour, a splash of goo and
      // a couple of little legs — the same budget the chunks alone used to take.
      const all = Math.round(n * density)
      const legs = Math.max(1, Math.round(all * 0.14))
      const goo = Math.round(all * 0.22)
      for (let i = 0; i < all; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = 1.5 + Math.random() * (ev.boss ? 7 : 3.5)
        if (i < legs) {
          emitLeg(ev.x, ev.y, Math.cos(a) < 0 ? -1 : 1)
          continue
        }
        const isGoo = i < legs + goo
        emit({
          x: ev.x, y: ev.y,
          vx: Math.cos(a) * sp, vy: Math.abs(Math.sin(a)) * sp,
          life: 520 + Math.random() * 420, size: isGoo ? 0.1 + Math.random() * 0.08 : 0.11 + Math.random() * 0.1,
          color: isGoo ? (i % 2 ? GORE_GOO : GORE_GOO_DARK) : p.debris, gravity: 13, drag: 0.7,
          shape: isGoo ? 0 : 1,
          rot: Math.random() * 6.28, vrot: (Math.random() - 0.5) * 12
        })
      }
      // Coin pop — the reward beat every kill needs.
      for (let i = 0; i < Math.min(6, ev.coins); i++) {
        emit({
          x: ev.x, y: ev.y,
          vx: (Math.random() - 0.5) * 2.4, vy: 2.6 + Math.random() * 1.6,
          life: 700, size: 0.16, color: [255, 214, 80], gravity: 11, additive: true
        })
      }
      emitText({
        x: ev.x, y: ev.y + 0.7, vy: 1.9, life: 720,
        text: `+${ev.coins}`, color: '#ffd24a', size: 0.32, crit: false
      })
      // The kill's cut of the wave's materials, in the resource bar's own
      // colours, one row above the coin — the purse just moved, and this says
      // which pile and by how much, at the monster that paid it. Side by side
      // when both piles moved, so the row reads as one payout.
      {
        const w = ev.wood ?? 0
        const s = ev.stone ?? 0
        const both = w > 0 && s > 0
        if (w > 0) {
          emitText({
            x: ev.x - (both ? 0.3 : 0), y: ev.y + 1.05, vy: 1.7, life: 820,
            text: `+${w}`, color: '#ffc27a', size: 0.28, crit: false
          })
        }
        if (s > 0) {
          emitText({
            x: ev.x + (both ? 0.3 : 0), y: ev.y + 1.05, vy: 1.7, life: 820,
            text: `+${s}`, color: '#dce4ee', size: 0.28, crit: false
          })
        }
      }
      if (ev.boss) { triggerShake('big'); playFx('bossDie') } else playFx('enemyDie')
      break
    }
    case 'enemyAttack': {
      if (ev.ranged) {
        // A ranged attacker used to deal its damage with NO visual at all —
        // just a sound. The slinger stood off at four cells lobbing invisible
        // rocks, which reads as a broken enemy that has stopped attacking.
        //
        // Solve for the launch velocity that puts a ballistic round on the
        // target in `T`, so the round actually arrives where the damage did.
        const T = 0.34
        const G = 12
        const vx = (ev.tx - ev.x) / T
        const vy = (ev.ty - ev.y) / T - 0.5 * G * T
        // The spitting spider's web ball: a white ball over an ink disc one
        // size up (drawn first, so it sits underneath as the outline) — white
        // alone vanishes against a cloud or the picket fence…
        emit({
          x: ev.x, y: ev.y - 0.15, vx, vy, gravity: G,
          life: T * 1000, size: 0.27, color: [59, 42, 33], alpha: 0.85
        })
        emit({
          x: ev.x, y: ev.y - 0.15, vx, vy, gravity: G,
          life: T * 1000, size: 0.2, color: [250, 250, 246]
        })
        // …trailing a thread. Each strand is a thin streak launched on the SAME
        // parabola a moment earlier in time (position and velocity wound back
        // by `d`), so the four of them follow the ball exactly and read as one
        // line spooling out behind it.
        for (let k = 1; k <= 4; k++) {
          const d = 0.012 * k
          emit({
            x: ev.x - vx * d, y: ev.y - 0.15 - vy * d - 0.5 * G * d * d,
            vx, vy: vy + G * d, gravity: G,
            life: (T + d) * 1000, size: 0.07, color: [226, 226, 220], alpha: 0.9, shape: 2
          })
        }
        // A puff at the throw, and wisps of web where it lands.
        for (let i = 0; i < Math.round(2 * density); i++) {
          emit({
            x: ev.x, y: ev.y, vx: (Math.random() - 0.5) * 1.6, vy: -Math.random() * 1.2,
            life: 320, size: 0.11, color: SAND_DUST, alpha: 0.6, drag: 2
          })
        }
        for (let i = 0; i < Math.round(4 * density); i++) {
          emit({
            x: ev.tx, y: ev.ty, vx: (Math.random() - 0.5) * 2.6, vy: -Math.random() * 1.8,
            life: 360, size: 0.08, color: [242, 242, 236], alpha: 0.9, gravity: 4, drag: 3
          })
        }
      } else {
        // Bitten sand: grains off the block face.
        for (let i = 0; i < Math.round(5 * density); i++) {
          emit({
            x: ev.tx, y: ev.ty,
            vx: (Math.random() - 0.5) * 3, vy: Math.random() * 2,
            life: 260, size: 0.08, color: i % 2 ? SAND_MID : SAND_LIGHT, gravity: 9
          })
        }
        // The attacker sheds a little of itself on a melee swing too.
        emitGore(ev.gore, ev.x, ev.y, 0, 4, density * 0.5)
      }
      playFx(ev.ranged ? 'throw' : 'hit')
      break
    }
    case 'collapse': {
      triggerShake(ev.count > 4 ? 'big' : 'strong')
      playFx('collapse')
      break
    }
    case 'waveStart': {
      screenFlash = Math.max(screenFlash, ev.boss ? 0.5 : 0.18)
      if (ev.boss) triggerShake('strong')
      playFx(ev.boss ? 'bossHorn' : 'waveStart')
      break
    }
    case 'waveClear': {
      playFx('waveClear')
      break
    }
    case 'coinPayout': {
      // The wave reward lands in the wallet, so it needs to be SEEN leaving the
      // battlefield — a number that changes off-screen isn't a reward.
      const n = Math.min(18, 6 + Math.round(ev.amount / 4))
      for (let i = 0; i < Math.round(n * density); i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.4
        emit({
          x: (Math.random() - 0.5) * 3, y: 1 + Math.random() * 2,
          vx: Math.cos(a) * 3, vy: Math.abs(Math.sin(a)) * 5,
          life: 900, size: 0.2, color: [255, 214, 80], gravity: 5, additive: true
        })
      }
      emitText({
        x: 0, y: 3.2, vy: 2.2, life: 1100,
        text: `+${ev.amount}`, color: '#ffd24a', size: 0.5, crit: true
      })
      break
    }
    case 'thorns': {
      // Spiked-wall reflection. Deliberately reads as the WALL hurting the
      // attacker, not the other way round: sparks fly outwards from the block
      // face and the number floats above the enemy that took it.
      for (let i = 0; i < Math.round(9 * density); i++) {
        const a = Math.random() * Math.PI * 2
        const sp = 2.4 + Math.random() * 3.4
        emit({
          x: ev.x, y: ev.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1,
          life: 260 + Math.random() * 160, size: 0.1,
          color: [232, 226, 214], gravity: 9, additive: true
        })
      }
      playFx('hit')
      break
    }
    case 'arrowRain': {
      // The volley itself is drawn (see `drawArrowVolley`); the particle work
      // here is the WEATHER around it — dust kicked off the ground the flight
      // buries itself in, and a scorch over the beaten zone so the strip the
      // player aimed at stays readable for the second it matters.
      spawnArrowVolley(ev.x, ev.radius, density)
      for (let i = 0; i < Math.round(30 * density); i++) {
        const px = ev.x + (Math.random() * 2 - 1) * ev.radius
        emit({
          x: px, y: 0.1,
          vx: (Math.random() - 0.5) * 2.2, vy: 1.4 + Math.random() * 2.6,
          life: 620 + Math.random() * 420, size: 0.22 + Math.random() * 0.2,
          color: i % 3 ? SAND_DUST : SAND_MID, alpha: 0.55, gravity: 3.2, drag: 1.9
        })
      }
      emitDecal(ev.x, 0.05, ev.radius * 0.85, 0.25)
      triggerShake('small')
      playFx('throw')
      break
    }
    case 'repair': {
      // A patch, not a heal spell. Green motes rising off the block plus a
      // hammer-tap spark, so it reads as work done to the wall rather than as
      // something cast on it — the game has no magic anywhere else.
      for (let i = 0; i < Math.round(14 * density); i++) {
        const a = Math.random() * Math.PI * 2
        emit({
          x: ev.x + Math.cos(a) * 0.4, y: ev.y + Math.sin(a) * 0.4,
          vx: Math.cos(a) * 0.7, vy: 1.4 + Math.random() * 1.6,
          life: 480 + Math.random() * 260, size: 0.13 + Math.random() * 0.08,
          color: i % 3 === 0 ? [214, 255, 220] : [110, 226, 140],
          gravity: -1.2, drag: 1.6, additive: true
        })
      }
      emitText({
        x: ev.x, y: ev.y + 0.5, vy: 1.7, life: 700,
        text: '+HP', color: '#7ce09a', size: 0.32, crit: false
      })
      playFx('place')
      break
    }
    case 'deflect': {
      // A hard, metallic spark fan plus a "NO" readout. This is the only
      // teaching moment the immunity gets, so it is loud on purpose — a player
      // whose arrows silently stopped working concludes the game is broken.
      for (let i = 0; i < Math.round(8 * density); i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2
        const sp = 3 + Math.random() * 4
        emit({
          x: ev.x, y: ev.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 200 + Math.random() * 120, size: 0.08,
          color: [226, 236, 248], gravity: 12, additive: true
        })
      }
      emitText({
        x: ev.x, y: ev.y + 0.7, vy: 1.4, life: 620,
        text: 'CLANG', color: '#cfe0f5', size: 0.34, crit: false
      })
      playFx('impact')
      break
    }
    case 'crush': {
      // The moment the falling wall connects. Loud, because this is the payoff
      // for losing a block — and because a boss surviving it needs to look
      // like it SURVIVED it rather than like the block passed through.
      const rgb = themedPalette(ev.palette).debris
      const n = Math.round((ev.boss ? 22 : 14) * density)
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4
        const sp = 3 + Math.random() * 5
        emit({
          x: ev.x, y: ev.y,
          vx: Math.cos(a) * sp * 1.4, vy: Math.abs(Math.sin(a)) * sp,
          life: 300 + Math.random() * 300, size: 0.14 + Math.random() * 0.14,
          color: rgb, gravity: 8, drag: 1.2
        })
      }
      // A hard white flash ring at the point of contact.
      for (let i = 0; i < Math.round(8 * density); i++) {
        const a = Math.random() * Math.PI * 2
        emit({
          x: ev.x, y: ev.y, vx: Math.cos(a) * 6, vy: Math.sin(a) * 3 + 1,
          life: 190, size: 0.1, color: [255, 250, 232], gravity: 4, additive: true
        })
      }
      if (ev.boss) {
        emitText({
          x: ev.x, y: ev.y + 1.1, vy: 2, life: 900,
          text: 'CRUSHED!', color: '#ffd24a', size: 0.5, crit: true
        })
      }
      triggerShake(ev.boss ? 'strong' : 'small')
      playFx('shatter')
      break
    }
    case 'blockLand': {
      // Rubble hitting the tower. Scaled entirely by `impact` so a one-cell
      // slump is a puff and a five-cell drop is a real crash — the player has
      // to be able to tell "that was fine" from "that just cost me a wall".
      const rgb = themedPalette(ev.palette).debris
      const n = Math.round((5 + ev.impact * 16) * density)
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6
        const sp = (1 + Math.random() * 2.6) * (0.5 + ev.impact)
        emit({
          x: ev.x + (Math.random() - 0.5) * 0.8, y: ev.y - 0.4,
          vx: Math.cos(a) * sp * 1.6, vy: Math.abs(Math.sin(a)) * sp,
          life: 380 + Math.random() * 320, size: 0.12 + Math.random() * 0.16,
          color: rgb, gravity: 6, drag: 1.4
        })
      }
      // Dust sheet along the ground, which is what sells weight.
      for (let i = 0; i < Math.round(6 * density * (0.4 + ev.impact)); i++) {
        emit({
          x: ev.x + (Math.random() - 0.5) * 1.4, y: ev.y - 0.45,
          vx: (Math.random() - 0.5) * 3, vy: 0.4 + Math.random(),
          life: 620, size: 0.26, color: SAND_DUST, gravity: -0.4, drag: 2.4
        })
      }
      emitDecal(ev.x, Math.max(0, ev.y - 0.5), 0.5 + ev.impact * 0.6, 0.25 + ev.impact * 0.3)
      if (ev.impact > 0.35) triggerShake(ev.impact > 0.75 ? 'strong' : 'small')
      playFx(ev.impact > 0.6 ? 'collapse' : 'hit')
      break
    }
    case 'bombDrop': {
      // A puff at the bomb bay, warm for a molotov and grey for a bomb, so the
      // player can tell WHICH kind is falling before it lands on them.
      // Sandbox Tower: sparks off a firefly's ember, golden drips off a
      // bumblebee's honey bomb (drips FALL — honey does not puff).
      for (let i = 0; i < Math.round(5 * density); i++) {
        emit({
          x: ev.x + (Math.random() - 0.5) * 0.3, y: ev.y - 0.2,
          vx: (Math.random() - 0.5) * 0.8, vy: -0.4 - Math.random(),
          life: 420, size: ev.fire ? 0.12 : 0.1,
          color: ev.fire ? (i % 2 ? [255, 150, 60] : [255, 214, 110]) : HONEY_RGB[i % 3]!,
          gravity: ev.fire ? -0.6 : 5, drag: 2, additive: ev.fire
        })
      }
      playFx('throw')
      break
    }
    case 'firebomb': {
      // Molotov: a short bright flash, then a spreading pool of flame that
      // keeps licking upward long enough to read as "this is still burning".
      screenFlash = Math.max(screenFlash, 0.1)
      triggerShake('small')
      const r = ev.radius
      // The drawn bloom the particles sit inside. Slower and sootier than a
      // shell's, which is the whole difference between fuel and powder.
      spawnBlast(ev.x, ev.y, Math.min(1.2, r * 0.8), 'fire', 0, { life: 620, radial: true, dust: ev.y < 1.1 })
      for (let i = 0; i < Math.round(26 * density); i++) {
        const a = Math.random() * Math.PI * 2
        const sp = (0.4 + Math.random()) * r * 2.2
        emit({
          x: ev.x, y: ev.y,
          vx: Math.cos(a) * sp, vy: Math.abs(Math.sin(a)) * sp * 0.9 + 1.4,
          life: 520 + Math.random() * 520, size: 0.2 + Math.random() * 0.24,
          color: Math.random() < 0.6 ? [255, 150, 40] : [255, 216, 120],
          gravity: -1.4, drag: 1.5, additive: true
        })
      }
      // Soot, so the fire has something dark to read against.
      for (let i = 0; i < Math.round(10 * density); i++) {
        emit({
          x: ev.x + (Math.random() - 0.5) * r, y: ev.y,
          vx: (Math.random() - 0.5) * 1.4, vy: 1 + Math.random() * 1.8,
          life: 900, size: 0.26, color: [58, 50, 46], gravity: -0.8, drag: 1.8
        })
      }
      emitDecal(ev.x, 0, r * 0.9, 0.5)
      playFx('explosion')
      break
    }
    case 'siegeShot': {
      // A siege engine loosing from standoff range. The muzzle burst is smoky
      // and slow rather than bright and fast, so it never gets confused with
      // one of the player's own guns firing.
      const ang = Math.atan2(ev.ty - ev.y, ev.tx - ev.x)
      for (let i = 0; i < Math.round(10 * density); i++) {
        const spread = ang + (Math.random() - 0.5) * 0.5
        const sp = 1.6 + Math.random() * 3
        emit({
          x: ev.x, y: ev.y, vx: Math.cos(spread) * sp, vy: Math.sin(spread) * sp + 1.2,
          life: 520 + Math.random() * 320, size: 0.24 + Math.random() * 0.16,
          color: i % 3 ? SAND_DUST : SAND_MID, gravity: -1.2, drag: 1.6
        })
      }
      triggerShake('small')
      playFx('throw')
      break
    }
    case 'cavalryOut': {
      // The charge leaving the gate: a dust kick in the direction of travel and
      // a rally text, so a purchase the player made off-screen is unmistakable.
      for (let i = 0; i < Math.round(16 * density); i++) {
        emit({
          x: ev.x, y: ev.y + Math.random() * 0.4,
          vx: ev.dir * (1.5 + Math.random() * 4), vy: Math.random() * 2.4,
          life: 620 + Math.random() * 320, size: 0.2 + Math.random() * 0.18,
          color: i % 3 ? SAND_DUST : SAND_MID, gravity: 2.4, drag: 1.9
        })
      }
      emitText({
        x: ev.x, y: ev.y + 1.6, vy: 1.9, life: 900,
        text: 'CHARGE!', color: '#7fd4ff', size: 0.46, crit: true
      })
      playFx('waveStart')
      break
    }
    case 'allyStrike': {
      // Lance hit. Cool sparks, to keep the player's own damage visually
      // distinct from the warm sparks the tower's weapons throw.
      const a = Math.atan2(ev.ty - ev.y, ev.tx - ev.x)
      for (let i = 0; i < Math.round(7 * density); i++) {
        const sp = 2.6 + Math.random() * 3.4
        const j = a + (Math.random() - 0.5) * 1.1
        emit({
          x: ev.tx, y: ev.ty, vx: Math.cos(j) * sp, vy: Math.sin(j) * sp + 1,
          life: 220 + Math.random() * 140, size: 0.09,
          color: [180, 226, 255], gravity: 8, additive: true
        })
      }
      playFx('impact')
      break
    }
    case 'allyDown': {
      for (let i = 0; i < Math.round(12 * density); i++) {
        const a = Math.random() * Math.PI * 2
        emit({
          x: ev.x, y: ev.y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3 + 1.5,
          life: 480, size: 0.16, color: [31, 106, 168], gravity: 7
        })
      }
      emitDecal(ev.x, 0, 0.6, 0.35)
      playFx('enemyDie')
      break
    }
    case 'allyLeave': {
      // Contract expired. A quiet puff — no death sound, because nothing died.
      for (let i = 0; i < Math.round(8 * density); i++) {
        emit({
          x: ev.x, y: ev.y + Math.random() * 0.5,
          vx: (Math.random() - 0.5) * 1.6, vy: 1 + Math.random() * 1.6,
          life: 560, size: 0.2, color: SAND_DUST, gravity: -0.6, drag: 2.2
        })
      }
      break
    }
    case 'gateFell': {
      screenFlash = Math.max(screenFlash, 0.7)
      triggerShake('big')
      playFx('gateFell')
      break
    }
    case 'gateHit': {
      noteGateHit(ev.side, performance.now())
      break
    }
  }
}

/**
 * ONE arrow, drawn in local space: nock at the origin's left, head to the right.
 *
 * An arrow is a drawn object, not a lit one — a tapered shaft, a flat steel head
 * with a single bright facet, and fletching that reads even at eight pixels
 * because it is the only warm note on the round.
 *
 * Shared by the Archery block's round and by Arrow Rain, and that sharing is
 * the point. The volley used to be drawn with bare `ctx.stroke()` lines: flat,
 * even-width, unlit, with none of the ink kit the rest of the field is built
 * from — a hundred of them at once made the one moment the skill is on screen
 * the ugliest thing in the game. There is exactly one arrow in this project now.
 *
 * `u` is the unit (an arrow is ~4.2u long) and `rich` gates the inked outline,
 * which is the expensive pass and the first thing to drop when a volley puts
 * seventy of these on screen at once.
 */
const drawArrowShape = (
  ctx: CanvasRenderingContext2D, u: number, seed: number, rich: boolean
): void => {
  // Sandbox Tower: the arrow is a FOAM DART (orange foam, blue suction cup,
  // little fins) — same footprint, same origin. See `fxArt.drawFoamDart`.
  drawFoamDart(ctx, u, seed, rich)
}

/**
 * The siege ballista's quarrel — a machine's round, not an archer's.
 *
 * It shared the arrow's drawing until the two were split, and at a few pixels
 * across that made the engine's shot read as a stray arrow: the one round in
 * the game the player is supposed to see coming and answer.
 *
 * Everything here is set against `drawArrowShape` on purpose. SHORTER, so the
 * silhouette is a stub rather than a needle. THICKER, in dark oiled timber
 * rather than pale ash. A blunt iron bodkin instead of a bright leaf-shaped
 * broadhead — a bolt punches, an arrow slices. And stiff leather vanes rather
 * than feather fletching, because a quarrel is spun by a machine.
 */
const drawQuarrelShape = (
  ctx: CanvasRenderingContext2D, u: number, seed: number, rich: boolean
): void => {
  // Sandbox Tower: the rubber-band crossbow's bolt is a party TOOTHPICK —
  // thin pale wood, sharp both ends, a red cellophane frill at the tail. Still
  // set against the dart on purpose. See `fxArt.drawToothpick`.
  drawToothpick(ctx, u, seed, rich)
}

/**
 * Build a volley for the beaten zone at `x`.
 *
 * Two things make this read as a VOLLEY rather than as confetti:
 *
 *  · every arrow is loosed on a stagger, densest in the middle of the window,
 *    so the sheet arrives, peaks and thins out the way a loosed flight does
 *    rather than switching on and off;
 *  · they all lean the SAME way, by the same small angle plus a hair of
 *    scatter. Arrows fanning in every direction read as a explosion; arrows
 *    raked together read as something that was aimed.
 *
 * Each one lands on whatever is under it — the tower's crown where there is
 * tower, the ground where there is not — so the flight stops at the silhouette
 * instead of sinking through it.
 */
const spawnArrowVolley = (x: number, radius: number, density: number): void => {
  // Trimmed from 110. Every arrow is now the full inked object rather than two
  // flat strokes, so the budget buys fewer of them — and a raked flight of
  // seventy reads denser than a hundred and ten scattered ones did.
  const count = Math.max(22, Math.round(70 * density))
  const arrows: RainArrow[] = []
  // One shared rake for the whole flight, so they arrive as a formation.
  const rake = 0.12 + Math.random() * 0.1
  for (let i = 0; i < count; i++) {
    const ax = x + (Math.random() * 2 - 1) * radius
    // Where the ground or the tower's crown stops it.
    let floor = 0.12
    for (const b of getTowerBlocks().values()) {
      const l = b.c - 0.5
      const r = b.c + spanW(b) - 0.5
      if (ax < l || ax > r) continue
      const top = b.r + spanH(b) - 0.5
      if (top > floor) floor = top
    }
    // Triangular stagger: two uniform draws averaged, which bunches the loose
    // around the middle of the window without any curve fitting.
    const delay = (Math.random() + Math.random()) * 0.5 * 420
    arrows.push({
      x: ax,
      y0: 13 + Math.random() * 5,
      yEnd: floor,
      vy: 26 + Math.random() * 12,
      delay,
      lean: rake + (Math.random() - 0.5) * 0.07,
      stick: 900 + Math.random() * 900,
      seed: Math.floor(Math.random() * 4096)
    })
  }
  arrowVolleys.push({ x, radius, arrows, age: 0, life: 2200 })
}

/**
 * Draw one volley.
 *
 * Every arrow is the SAME drawn arrow the Archery block looses (`drawArrowShape`)
 * — that is the whole fix. What changes between an arrow in the air and one in
 * the dirt is what is drawn AROUND it:
 *
 *  · in flight it trails a motion streak along its own line, because at 30
 *    cells a second the eye resolves a smear with an arrowhead on the end of
 *    it, not a crisp object;
 *  · landed, it stands in whatever stopped it with its head buried, rocks once
 *    on impact, and fades.
 *
 * The inked outline is dropped below the top quality tier: it is the expensive
 * pass, and seventy arrows carrying it is the one thing here that can cost a
 * frame.
 */
const drawArrowVolley = (ctx: CanvasRenderingContext2D, v: ArrowVolley): void => {
  const zoom = getZoom()
  // Smaller than a fired bolt on purpose. These arrive seventy at a time, and a
  // volley of full-size arrows reads as a fence rather than as a flight.
  const u = zoom * 0.075
  const rich = quality.value === 'high'
  if (u < 0.6) return

  for (const a of v.arrows) {
    const t = v.age - a.delay
    if (t <= 0) continue
    const fallen = (t / 1000) * a.vy
    const y = a.y0 - fallen
    // Screen angle. World y grows UP and screen y grows down, so a falling
    // arrow points along +y on screen: that is +π/2, leaned by the rake.
    const ang = Math.PI / 2 - a.lean

    if (y > a.yEnd) {
      const sx = worldToScreenX(a.x)
      const sy = worldToScreenY(y)
      ctx.save()
      ctx.translate(sx, sy)
      ctx.rotate(ang)
      // The smear, behind the nock and along the shaft. Tapered from nothing so
      // it reads as speed rather than as a stick glued to the tail.
      const streak = a.vy * 0.05 * zoom
      dartSmear(ctx, u, streak, a.seed + 11)
      drawArrowShape(ctx, u, a.seed, rich)
      ctx.restore()
      continue
    }

    // Landed. Time since impact drives the fade and a short settle wobble.
    const since = ((a.y0 - a.yEnd) / a.vy) * 1000
    const held = t - since
    if (held > a.stick) continue
    const fade = 1 - Math.max(0, held - a.stick * 0.6) / (a.stick * 0.4)
    // A foam dart on a suction cup does not sink in — it sticks and BOINGS, a
    // springier, longer wobble than a buried arrowhead's.
    const wob = Math.exp(-held / 160) * 0.16 * Math.sin(held / 26)
    const la = ang + wob
    const hx = worldToScreenX(a.x)
    const hy = worldToScreenY(a.yEnd)

    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, fade))
    // Anchored by the cup's face, flush on the surface it stuck to.
    const bury = u * 2.36
    ctx.translate(hx - Math.cos(la) * bury, hy - Math.sin(la) * bury)
    ctx.rotate(la)
    drawArrowShape(ctx, u, a.seed, rich)
    ctx.restore()
    ctx.globalAlpha = 1
  }
}

const hexToRgb = (hex: string): [number, number, number] => {
  const p = parseInt(hex.slice(1), 16)
  return [(p >> 16) & 255, (p >> 8) & 255, p & 255]
}

// ─── Transient overlays ─────────────────────────────────────────────────────

interface Bolt { points: number[]; life: number; maxLife: number }
const lightningBolts: Bolt[] = []

/**
 * One arrow in a called volley.
 *
 * The whole effect is a hundred of these, so an arrow is four numbers and no
 * object graph: where it started, how fast it falls, when it was loosed and
 * where it stops. Everything else is derived at draw time.
 */
interface RainArrow {
  x: number
  /** World y it was loosed from — well above the crown, off the top of frame. */
  y0: number
  /** World y it buries itself at. */
  yEnd: number
  /** Fall speed, cells/second. */
  vy: number
  /** Ms before this one is loosed, so the volley arrives as a sheet. */
  delay: number
  /** Slight lean, radians from vertical. */
  lean: number
  /** How long it stays stuck once it lands, ms. */
  stick: number
  /** Per-arrow ink seed, so seventy arrows are seventy hand-drawn arrows
   *  rather than one arrow stamped seventy times. */
  seed: number
}
interface ArrowVolley {
  x: number
  radius: number
  arrows: RainArrow[]
  age: number
  life: number
}
const arrowVolleys: ArrowVolley[] = []
/** 0..1 full-screen white flash, decays every frame. */
let screenFlash = 0

/**
 * The bolt, drawn rather than glowed.
 *
 * Three even-width strokes stacked into a bloom is how you fake light, and it
 * was the one mark on the field that looked airbrushed. What replaces it is the
 * same silhouette laid in as INK ribbons — a dark outer edge so the bolt reads
 * against a bright sky, a cyan body, a white core, each tapering along its own
 * length — plus hairs forking off the joints, which is the drawn shorthand for
 * electricity that no amount of blur supplies.
 */
const drawLightning = (ctx: CanvasRenderingContext2D, bolt: Bolt): void => {
  const t = bolt.life / bolt.maxLife
  const zoom = getZoom()
  const rich = quality.value !== 'low'
  // Snaps to full width and thins away, rather than dimming uniformly.
  const w = Math.min(1, t * 2.2)
  ctx.globalAlpha = Math.min(1, t * 1.7)

  for (let seg = 0; seg + 3 < bolt.points.length; seg += 2) {
    const x1 = worldToScreenX(bolt.points[seg]!)
    const y1 = worldToScreenY(bolt.points[seg + 1]!)
    const x2 = worldToScreenX(bolt.points[seg + 2]!)
    const y2 = worldToScreenY(bolt.points[seg + 3]!)

    // Jitter scaled to the SPAN, and enough steps to carry it. A fixed seven
    // kinks of a fixed amplitude across a link that might be ten cells long is
    // how a bolt ends up looking like a drawn sword blade.
    const dx = x2 - x1
    const dy = y2 - y1
    const span = Math.hypot(dx, dy) || 1
    const steps = Math.max(6, Math.min(16, Math.round(span / (zoom * 0.45))))
    const amp = Math.min(zoom * 0.9, span * 0.16)
    // Perpendicular, so the kinks cut ACROSS the run instead of sliding along it.
    const px = -dy / span
    const py = dx / span

    const path: Pt[] = [[x1, y1]]
    for (let i = 1; i < steps; i++) {
      const f = i / steps
      // Deterministic per-segment jitter so the bolt doesn't crawl while alive.
      const j = (hash(seg * 13.7 + i * 3.1) - 0.5) * 2 * amp * (1 - Math.abs(f - 0.5) * 1.4)
      path.push([x1 + dx * f + px * j, y1 + dy * f + py * j])
    }
    path.push([x2, y2])

    const seed = seg * 7 + 3
    // Sandbox Tower: a bug zapper's arc — blue-violet body under a deep indigo
    // edge, white core. Still electric; just the zapper's colour.
    if (rich) inkStroke(ctx, path, zoom * 0.15 * w, zoom * 0.07 * w, '#1f1650', seed)
    inkStroke(ctx, path, zoom * 0.1 * w, zoom * 0.042 * w, '#9c8cff', seed + 1)
    inkStroke(ctx, path, zoom * 0.042 * w, zoom * 0.016 * w, '#ffffff', seed + 2)

    // Forks. Two hairs peeling off mid-run, thinning to nothing — the bolt
    // spending charge on air it isn't going to reach.
    if (!rich) continue
    for (let k = 0; k < 2; k++) {
      const at = 2 + Math.floor(hash(seg * 5.3 + k * 11.7) * (steps - 3))
      const from = path[at]!
      const dx = path[at + 1]![0] - from[0]
      const dy = path[at + 1]![1] - from[1]
      const side = k ? 1 : -1
      const len = 0.55 + hash(seg * 3.9 + k) * 0.9
      const hair: Pt[] = [
        from,
        [from[0] + (dx * 0.9 - dy * side * 0.8) * len, from[1] + (dy * 0.9 + dx * side * 0.8) * len],
        [from[0] + (dx * 1.9 - dy * side * 0.5) * len, from[1] + (dy * 1.9 + dx * side * 1.3) * len]
      ]
      inkStroke(ctx, hair, zoom * 0.05 * w, zoom * 0.004, k ? '#cbbfff' : '#a8dcff', seed + 5 + k)
    }
  }
  ctx.globalAlpha = 1
}

// ─── Projectiles ────────────────────────────────────────────────────────────

// ─── Impact blasts ───────────────────────────────────────────────────────────

/**
 * A hit is DRAWN, not only sprayed.
 *
 * Particles give a hit its energy but never its shape: a cone of additive dots
 * reads much the same whether a bolt landed or a shell did, and it shares no
 * language at all with the monsters it lands on, which are cel-shaded under
 * broken ink. A blast is the drawn half of the hit — a lumpy fireball in three
 * flat tones, a hand-drawn shock ring, a few hard shards and inked smoke — with
 * the particle system left to do embers and debris on top of it.
 */
interface BlastPalette {
  /** Hot centre. */
  core: string
  /** The body of the fireball — the tone that identifies the weapon. */
  mid: string
  /** Shadow side and the shock ring. */
  deep: string
  ink: string
  smoke: string
  /**
   * How the hit is DRAWN. `burst` (the default) is the fireball-and-smoke
   * recipe; the sandbox's wet and gritty rounds have their own shapes — a
   * water `splash`, a mud or honey `splat` (`drippy` for honey), a sand `puff`.
   * See `fxArt.ts`.
   */
  style?: 'burst' | 'splash' | 'splat' | 'puff'
  drippy?: boolean
}

interface Blast {
  x: number
  y: number
  /** Peak radius, world units. */
  r: number
  life: number
  maxLife: number
  seed: number
  /** Screen-space heading the shards are thrown along. */
  angle: number
  /** No line of travel to throw along — shards go all the way round instead. */
  radial: boolean
  pal: BlastPalette
  /** Suppresses the hot core, for hits that should not read as fire. */
  cold: boolean
  /** Detonated on (or just above) the ground: throws a sheet of dust sideways. */
  dust: boolean
}

const BLAST_PALETTES: Record<string, BlastPalette> = {
  // Sandbox Tower. A foam dart landing: a white BOINK with an orange rim and a
  // pale puff — no fire anywhere in it.
  bolt: { core: '#ffffff', mid: '#fff3d8', deep: '#ff8a2b', ink: '#5a3312', smoke: '#f7efe0' },
  // Squirt-gun water, a popped balloon (same water), mud, honey, sand.
  water: { core: '#ffffff', mid: '#8fe6f0', deep: '#2aa5cf', ink: '#0d3b57', smoke: '#e2f7fb', style: 'splash' },
  balloon: { core: '#ffffff', mid: '#8fe6f0', deep: '#2aa5cf', ink: '#0d3b57', smoke: '#e2f7fb', style: 'splash' },
  mud: { core: '#d0a468', mid: '#9a7143', deep: '#6a4722', ink: '#2b1a0c', smoke: '#d9bf8f', style: 'splat' },
  honey: { core: '#fff1a8', mid: '#ffc23a', deep: '#d98a10', ink: '#5a2e05', smoke: '#ffe08a', style: 'splat', drippy: true },
  sand: { core: '#fff8e2', mid: '#f3dfab', deep: '#d6b474', ink: '#8d673a', smoke: '#ecd9ac', style: 'puff' },
  // A bombardier beetle going pop: a yellow-orange puff whose smoke is a
  // green stink cloud.
  pop: { core: '#fffbe0', mid: '#ffd23f', deep: '#ff8a2b', ink: '#5a2a08', smoke: '#9fc24e' },
  // The old powder palettes, kept for any caller that still names a kind.
  ball: { core: '#ffffff', mid: '#8fe6f0', deep: '#2aa5cf', ink: '#0d3b57', smoke: '#e2f7fb', style: 'splash' },
  shell: { core: '#c79a5c', mid: '#8d673a', deep: '#5e3f1e', ink: '#2b1a0c', smoke: '#d9bf8f', style: 'splat' },
  // The bug zapper: blue-violet.
  zap: { core: '#ffffff', mid: '#ddd4ff', deep: '#6f55f0', ink: '#1d1446', smoke: '#a79ed6' },
  // Stepped hard, on purpose: a cold blast built from three near-whites reads
  // as a smudge of steam rather than as ice breaking.
  frost: { core: '#ffffff', mid: '#b7ecff', deep: '#3f9fd8', ink: '#123244', smoke: '#93b6c4' },
  // Burning fuel: sootier and redder than gunpowder, so a molotov landing on
  // the tower never reads as one of the player's own rounds going off.
  fire: { core: '#fff2c2', mid: '#ff8f2a', deep: '#a52d0e', ink: '#28100a', smoke: '#4f463f' }
}

/** Peak radius per weapon, world units. Range matters more than the values. */
const BLAST_R: Record<string, number> = {
  bolt: 0.32, ball: 0.5, shell: 0.62, zap: 0.42, frost: 0.44
}

const blasts: Blast[] = []
let blastSeq = 0

/**
 * Global size trim for every drawn blast.
 *
 * The hits were sized to read on their own and, in a fight, read as a wall:
 * a splash detonation covered its whole neighbourhood and hid the monster it
 * had just landed on — and a hit you cannot see land is feedback lost, not
 * feedback delivered. Applied here rather than at the three call sites so the
 * relative sizes of an arrow, a cannonball and a mortar shell stay exactly as
 * authored, and there is one number to tune.
 */
const BLAST_SCALE = 0.7

const spawnBlast = (
  x: number, y: number, r: number, kind: string, angle: number,
  o: { life?: number; radial?: boolean; dust?: boolean } = {}
): void => {
  const q = quality.value
  if (q === 'low' && blasts.length >= 3) return
  // A hard cap. Overlapping blasts add nothing legible and each one is real
  // path work; the oldest goes, so the newest hit is always among those drawn.
  if (blasts.length >= (q === 'high' ? 14 : 8)) blasts.shift()
  const life = o.life ?? 340
  blastSeq = (blastSeq + 1) % 997
  blasts.push({
    x, y, r: r * BLAST_SCALE,
    life, maxLife: life,
    seed: blastSeq * 7.13,
    // World angles run y-up, the canvas runs y-down.
    angle: -angle,
    radial: o.radial ?? false,
    pal: BLAST_PALETTES[kind] ?? BLAST_PALETTES.ball!,
    cold: kind === 'frost' || kind === 'zap',
    dust: o.dust ?? false
  })
}

/** Snaps out and settles — a detonation is not a linear tween. */
const blastEase = (u: number): number => 1 - Math.pow(1 - Math.min(1, Math.max(0, u)), 3)

const drawBlast = (ctx: CanvasRenderingContext2D, b: Blast): void => {
  const u = 1 - b.life / b.maxLife
  const R = b.r * getZoom()
  if (R < 3) return

  // Redrawn in three HOLDS rather than tweened continuously. Limited animation
  // is what a hand-drawn effect actually does, and the small jump in the
  // contour between holds is exactly what a smoothly scaled sprite can't have.
  const hold = Math.min(2, Math.floor(u * 3))
  const seed = b.seed + hold * 17.3

  ctx.save()
  ctx.translate(worldToScreenX(b.x), worldToScreenY(b.y))

  // ── Sandbox Tower: wet and gritty hits ──
  // A splash, a splat or a sand puff replaces the ring, shards, fireball and
  // smoke below outright; only the ground skirt is shared.
  const style = b.pal.style ?? 'burst'
  const burst = style === 'burst'
  if (!burst) {
    const rich = quality.value !== 'low'
    ctx.globalAlpha = 1
    if (style === 'splash') drawSplashBlast(ctx, u, R, seed, b.seed, b.pal, rich)
    else if (style === 'splat') drawSplatBlast(ctx, u, R, seed, b.seed, b.pal, rich, b.pal.drippy ?? false)
    else drawPuffBlast(ctx, u, R, b.seed, b.pal, rich)
  }

  // ── Shock ring ──
  // Wide, broken, and gone before the smoke arrives.
  const ringA = 1 - u * 1.7
  if (burst && ringA > 0.03) {
    const rr = R * (0.55 + blastEase(u * 2.2) * 1.2)
    ctx.globalAlpha = ringA * 0.85
    ink(ctx, blob(0, 0, rr, rr * 0.8, seed + 3, 0.16, 2.4, 34), {
      width: Math.max(1.2, R * 0.11 * (1 - u * 0.7)),
      color: b.pal.deep,
      breakUp: 0.5,
      seed: seed + 11
    })
  }

  // ── Shards ──
  // The only hard edges in the whole effect: the fireball and the smoke are all
  // curves, so the sharpness that says "impact" has to come from somewhere.
  const shardA = 1 - u * 2.2
  if (burst && shardA > 0.03) {
    ctx.globalAlpha = shardA
    ctx.fillStyle = b.pal.mid
    const n = 5
    for (let i = 0; i < n; i++) {
      const off = b.radial
        ? (i / n) * Math.PI * 2
        : (i / (n - 1) - 0.5) * 2.2
      const a = b.angle + off + noise2(i * 1.7, seed, seed) * 0.34
      const len = R * (1.1 + noise2(i * 2.3, seed + 5, seed) * 1.0) * (0.75 + blastEase(u * 1.6) * 0.7)
      const base = R * 0.3
      const w = R * 0.15
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * len, Math.sin(a) * len)
      ctx.lineTo(Math.cos(a) * base + Math.cos(a + 1.5708) * w, Math.sin(a) * base + Math.sin(a + 1.5708) * w)
      ctx.lineTo(Math.cos(a) * base - Math.cos(a + 1.5708) * w, Math.sin(a) * base - Math.sin(a + 1.5708) * w)
      ctx.closePath()
      ctx.fill()
    }
  }

  // ── Fireball ──
  // Three flat tones and an inked contour. The moment a gradient goes in here
  // it stops matching the monsters, which is the whole point of drawing it.
  const bodyA = u < 0.5 ? 1 : Math.max(0, 1 - (u - 0.5) / 0.38)
  if (burst && bodyA > 0.03) {
    const br = R * (0.5 + blastEase(u * 1.9) * 0.62)
    const body = blob(0, 0, br, br * 0.9, seed, 0.24, 2.7, 40)
    ctx.globalAlpha = bodyA
    fillShape(ctx, body, b.pal.deep)
    fillShape(ctx, shrink(body, 0.74, -br * 0.16, -br * 0.2), b.pal.mid)
    fillShape(ctx, shrink(body, b.cold ? 0.26 : 0.31, -br * 0.3, -br * 0.36), b.pal.core)
    ink(ctx, body, { width: br * 0.17, color: b.pal.ink, breakUp: 0.28, seed: seed + 2 })
  }

  // ── Dust sheet ──
  // A round that goes off ON the ground does not throw a sphere: it throws a
  // low, wide skirt of dirt sideways, and that skirt is most of what makes a
  // mortar hit look like it landed rather than like it happened in mid-air.
  if (b.dust && quality.value !== 'low') {
    const dustA = Math.min(1, u * 4) * Math.max(0, 1 - Math.max(0, u - 0.35) / 0.65) * 0.75
    if (dustA > 0.04) {
      ctx.globalAlpha = dustA
      const ground = worldToScreenY(0) - worldToScreenY(b.y)
      const spread = R * (0.7 + blastEase(u * 1.8) * 1.5)
      for (const side of [-1, 1]) {
        const px = side * spread
        const pr = R * (0.42 + u * 0.5)
        const puff = blob(px, ground - pr * 0.35, pr * 1.15, pr * 0.62, b.seed + side * 3, 0.22, 2.3, 22)
        // Sand, kicked sideways off the sandbox floor.
        fillShape(ctx, puff, '#d6b474')
        fillShape(ctx, shrink(puff, 0.6, px - pr * 0.4, ground - pr * 0.7), '#f3dfab')
        ink(ctx, puff, { width: pr * 0.14, color: '#8d673a', breakUp: 0.55, seed: b.seed + side })
      }
    }
  }

  // ── Smoke ──
  // Lobes that push outward and lift, each its own inked silhouette so the
  // cloud reads as drawn shapes rather than as a soft mass. Seeded off the
  // blast rather than the hold, so it DRIFTS while the fireball pops.
  const smokeA = Math.min(1, Math.max(0, (u - 0.22) / 0.22)) * Math.max(0, 1 - Math.max(0, u - 0.6) / 0.4) * 0.7
  if (burst && smokeA > 0.04 && quality.value !== 'low') {
    const n = quality.value === 'high' ? 4 : 3
    ctx.globalAlpha = smokeA
    const lit = mixHex(b.pal.smoke, '#ffffff', 0.34)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + b.seed * 0.7
      const d = R * (0.45 + u * 0.95)
      const pr = R * (0.3 + noise2(i * 3.1, b.seed, b.seed) * 0.24) * (0.7 + u * 0.7)
      const px = Math.cos(a) * d
      const py = Math.sin(a) * d * 0.7 - u * R * 0.7
      const puff = blob(px, py, pr, pr * 0.86, b.seed + i * 5, 0.2, 2.4, 24)
      fillShape(ctx, puff, b.pal.smoke)
      fillShape(ctx, shrink(puff, 0.6, px - pr * 0.3, py - pr * 0.34), lit)
      ink(ctx, puff, { width: pr * 0.17, color: b.pal.ink, breakUp: 0.5, seed: b.seed + i })
    }
  }

  ctx.restore()
}

// ─── Muzzle flashes ─────────────────────────────────────────────────────────
//
// A shot leaving a barrel used to be one additive blob and five streaks —
// the same mark for a bow, a cannon and a mortar, and the only pure-glow thing
// on a field where the monsters, the blocks and the impact blasts are all flat
// tones under broken ink.
//
// A shot is DRAWN now. The flame is a fan cut into tongues, filled in three cel
// tones and inked; the smoke is its own inked silhouette; and the whole thing
// is redrawn in three HOLDS rather than tweened, because the small jump in the
// contour between holds is exactly what a scaled sprite cannot fake.

type FlashStyle = 'gun' | 'lob' | 'bow' | 'coil' | 'chill'

interface FlashPalette {
  /** Hot centre. */
  core: string
  /** Body of the flame — the tone that identifies the gun. */
  mid: string
  /** Shadow side, and the ring. */
  deep: string
  ink: string
  smoke: string
}

const FLASH_PALETTES: Record<string, FlashPalette> = {
  // Loose powder: yellow-hot and quick.
  powder: { core: '#fffdf0', mid: '#ffce67', deep: '#e0651c', ink: '#2a1408', smoke: '#7d7267' },
  // A heavy charge under a short tube: redder, and mostly smoke.
  heavy: { core: '#fff7dc', mid: '#ffb246', deep: '#c2451c', ink: '#231208', smoke: '#615950' },
  // Sandbox Tower: the bug zapper's crack, blue-violet.
  arc: { core: '#ffffff', mid: '#ddd4ff', deep: '#7058f0', ink: '#1d1446', smoke: '#a79ed6' },
  rime: { core: '#ffffff', mid: '#e2f8ff', deep: '#5cbde2', ink: '#123244', smoke: '#9dbecc' },
  dust: { core: '#fdf4e0', mid: '#e3d2b0', deep: '#a08a6a', ink: '#3a2a18', smoke: '#8f8069' },
  // Sandbox Tower. A squirt gun's jet: the flame fan's tongues, in water, read
  // as a spray; its "smoke" is mist.
  water: { core: '#ffffff', mid: '#aef3f9', deep: '#3bb8df', ink: '#0d3b57', smoke: '#e4f8fc' },
  // The mud mortar's splurt, and the sand dust it coughs.
  mud: { core: '#c79a5c', mid: '#8d673a', deep: '#5e3f1e', ink: '#2b1a0c', smoke: '#e3cb98' },
  // A spring or air launcher (balloons, dart harpoons): a white "thwump".
  puff: { core: '#ffffff', mid: '#fffaf0', deep: '#e6d6bf', ink: '#8a6a4a', smoke: '#f6f1e8' },
  // The dart blaster's release: a white flick with an orange wake.
  foam: { core: '#ffffff', mid: '#ffb46b', deep: '#ff8a2b', ink: '#3b2a21', smoke: '#f3ead8' }
}

interface FlashRecipe {
  style: FlashStyle
  pal: FlashPalette
  /** Block centre → barrel mouth, world units. Keeps the flame ON the gun. */
  reach: number
  /** Flame length at full extension, world units. */
  len: number
  /** Half-angle of the fan. */
  spread: number
  life: number
  /**
   * Fixed elevation in radians for the guns that lob instead of tracking,
   * mirrored for columns left of the gate. Absent means "along the aim".
   */
  elev?: number
  /** Straight up out of the cell, whatever the block is pointing at. */
  up?: boolean
  /** Extra lift, world units — for fixtures that sit on top of their block. */
  rise?: number
  /**
   * Fixed offset from the block centre to the gun's PIVOT, world units.
   *
   * Land turrets sit in the middle of their cell, so `reach` along the aim was
   * enough. A deck gun does not: it is bolted to the foredeck, forward of the
   * mast and above the waterline, and a flash centred on the cell bloomed out
   * of the middle of the hull.
   */
  ox?: number
  oy?: number
  /**
   * Scales the grit and embers thrown with the flash. Ships fire far smaller
   * pieces than the tower's siege guns, and the standard burst buried them.
   */
  grit?: number
  /** What rides out of the mouth as particles (`consumeFx` 'muzzle'). */
  matter?: 'water' | 'mud' | 'air'
}

/**
 * Elevation of the lobbing guns, as a WORLD angle (y-up).
 *
 * Mortars and bombards do not track: they sit at a steep fixed angle pointing
 * AWAY from the gate, so a column on the left of the tower answers the left
 * lane and one on the right answers the right.
 */
const lobAngle = (c: number, elev: number): number => (c < 0 ? Math.PI - elev : elev)

const MUZZLE_RECIPES: Record<string, FlashRecipe> = {
  // Sandbox Tower: squirt gun (water jet), mud mortar (mud splurt), balloon
  // launcher (an air thwump), dart blaster (a white flick). Geometry, reach
  // and timing are the old guns' own.
  cannon: { style: 'gun', pal: FLASH_PALETTES.water!, reach: 0.56, len: 0.95, spread: 0.6, life: 260, matter: 'water' },
  mortar: { style: 'lob', pal: FLASH_PALETTES.mud!, reach: 0.46, len: 0.8, spread: 0.52, life: 460, elev: MORTAR_ELEV, matter: 'mud' },
  bombard: { style: 'lob', pal: FLASH_PALETTES.puff!, reach: 0.34, len: 0.66, spread: 0.66, life: 400, elev: BOMBARD_ELEV, matter: 'water' },
  archer: { style: 'bow', pal: FLASH_PALETTES.foam!, reach: 0.26, len: 0.46, spread: 0.9, life: 180 },
  tesla: { style: 'coil', pal: FLASH_PALETTES.arc!, reach: 0.38, len: 0.44, spread: 1.5, life: 200, up: true },
  // The frost fixture is a cluster of crystals sitting ON TOP of its block, so
  // the vapour has to leave from up there — along the aim, but lifted.
  frost: { style: 'chill', pal: FLASH_PALETTES.rime!, reach: 0.32, len: 0.52, spread: 0.85, life: 320, rise: 0.26 },

  // ── Deck guns ──────────────────────────────────────────────────────────
  //
  // Every one of these is deliberately SMALL. A hull is drawn at roughly half
  // the visual mass of a tower block — it is clipped at the waterline and it
  // rides low — so the land recipes' flame lengths (0.66–0.95) swallowed the
  // boat whole and the player saw a fireball where their ship used to be. The
  // flash is sized to the gun that made it, not to the cell it sits in: barely
  // longer than the barrel, with the grit cut to match.
  //
  // `ox`/`oy` put the origin on the foredeck mount, matching where `shipArt`
  // actually bolts each weapon down.
  // Sandbox Tower: the paper boat and the rubber duck spring their darts (an
  // air puff); the toy pirate ship's cork cannon squirts.
  skiff: {
    style: 'gun', pal: FLASH_PALETTES.puff!,
    ox: 0.22, oy: -0.17, reach: 0.3, len: 0.3, spread: 0.62, life: 150, grit: 0.45, matter: 'air'
  },
  longship: {
    style: 'gun', pal: FLASH_PALETTES.puff!,
    ox: 0.34, oy: -0.09, reach: 0.38, len: 0.38, spread: 0.58, life: 180, grit: 0.55, matter: 'air'
  },
  // The capital ship, and the only one that burns real powder — so it gets the
  // longest flame of the three and still only half the land cannon's.
  galley: {
    style: 'gun', pal: FLASH_PALETTES.water!,
    ox: 0.3, oy: -0.13, reach: 0.34, len: 0.48, spread: 0.55, life: 230, grit: 0.6, matter: 'water'
  }
}

interface Muzzle {
  x: number
  y: number
  /** Screen-space heading (canvas y runs down). */
  angle: number
  life: number
  maxLife: number
  seed: number
  rec: FlashRecipe
}

const muzzles: Muzzle[] = []
let muzzleSeq = 0

const spawnMuzzle = (x: number, y: number, worldAngle: number, rec: FlashRecipe): void => {
  const q = quality.value
  const cap = q === 'high' ? 10 : q === 'medium' ? 6 : 3
  if (muzzles.length >= cap) muzzles.shift()
  muzzleSeq = (muzzleSeq + 1) % 991
  muzzles.push({
    x, y,
    angle: -worldAngle,
    life: rec.life, maxLife: rec.life,
    seed: muzzleSeq * 5.77,
    rec
  })
}

/**
 * The flame: a fan opening along +x whose leading edge is cut into tongues.
 *
 * A smooth cone reads as a cone. It is the tongues — and the fact that no two
 * are the same length — that make a discharge look like burning gas instead of
 * a lighting effect stuck on the end of a barrel.
 */
const flameFan = (
  len: number, base: number, spread: number, tongues: number, seed: number, n = 22
): Pt[] => {
  const pts: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const u = i / n
    const a = (u - 0.5) * 2 * spread
    // Clamped: 1.5708 overshoots π/2, so the cosine goes microscopically
    // negative at the rim and a fractional power of that is NaN.
    const fall = Math.pow(Math.max(0, Math.cos((a / spread) * 1.5708)), 0.55)
    const cut = 0.56 + 0.44 * Math.abs(Math.cos(u * Math.PI * tongues + seed * 0.7))
    const jitter = 0.82 + noise2(u * 6.1, seed, seed) * 0.42
    const r = base + (len - base) * fall * cut * jitter
    pts.push([Math.cos(a) * r, Math.sin(a) * r])
  }
  // Close around the mouth rather than across it, so the fill is a solid form
  // and not a wedge with a straight chord cut through its throat.
  for (let i = n; i >= 0; i--) {
    const u = i / n
    const a = (u - 0.5) * 2 * spread
    pts.push([Math.cos(a) * base * 0.18, Math.sin(a) * base * 0.7])
  }
  return pts
}

/**
 * One smoke lobe. Every puff a gun makes is drawn by this, so a mortar plume
 * and a cannon's powder smoke are unmistakably the same material.
 *
 * Deliberately pale and thinly drawn: at full opacity with a heavy contour a
 * lobe stops being smoke and becomes a boulder, and a stack of them turns a
 * mortar into a chimney with rocks coming out of it.
 */
const smokePuff = (
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number,
  pal: FlashPalette, seed: number, inked: boolean
): void => {
  const puff = blob(x, y, r, r * 0.82, seed, 0.26, 2.5, 18)
  fillShape(ctx, puff, mixHex(pal.smoke, '#ffffff', 0.22))
  fillShape(ctx, shrink(puff, 0.55, x - r * 0.34, y - r * 0.4), mixHex(pal.smoke, '#ffffff', 0.62))
  // Only the underside carries a line — the lit crown of a cloud has no edge.
  if (inked) {
    ink(ctx, puff, {
      width: r * 0.1, color: pal.ink, breakUp: 0.85, seed: seed + 3,
      weight: (_t, na) => Math.max(0, Math.sin(na)) * 1.3 + 0.05
    })
  }
}

const drawMuzzle = (ctx: CanvasRenderingContext2D, m: Muzzle): void => {
  const Z = getZoom()
  const rec = m.rec
  const L0 = rec.len * Z
  if (L0 < 4) return

  const u = 1 - m.life / m.maxLife
  const q = quality.value
  const rich = q !== 'low'
  // Three holds, as with the impact blasts: limited animation, not a tween.
  const hold = Math.min(2, Math.floor(u * 3))
  const seed = m.seed + hold * 19.7
  const pal = rec.pal
  // World "up" expressed in the rotated local frame, so smoke lifts vertically
  // no matter which way the gun is pointing.
  const upx = -Math.sin(m.angle)
  const upy = -Math.cos(m.angle)

  ctx.save()
  ctx.translate(worldToScreenX(m.x), worldToScreenY(m.y))
  ctx.rotate(m.angle)

  switch (rec.style) {
    case 'gun':
    case 'lob': {
      const heavy = rec.style === 'lob'
      // Punches out over the first third of its life and is pulled back into
      // the bore over the rest. A discharge does not fade in place.
      const flameU = Math.min(1, u / (heavy ? 0.45 : 0.62))
      const grow = flameU < 0.42 ? blastEase(flameU / 0.42) : 1 - ((flameU - 0.42) / 0.58) * 0.72
      const L = L0 * Math.max(0, grow)
      const base = L * 0.32
      const fade = 1 - Math.max(0, (flameU - 0.4) / 0.6)

      // Fine linework is a lie at play scale: a cell is ~25 px on screen, so a
      // ring and a spray of slivers drawn at a tenth of that land as stray
      // hairs beside the gun. They are worth drawing only once the camera is
      // close enough for them to be shapes.
      const detail = rich && L0 >= 16

      // ── Shards ──
      // Burning grains thrown clear of the mouth. The only hard edges here:
      // everything else is curves, so the "bang" has to come from somewhere.
      if (detail && flameU < 0.55) {
        ctx.globalAlpha = (1 - flameU / 0.55) * 0.9
        ctx.fillStyle = pal.mid
        const shards = heavy ? 3 : 4
        for (let i = 0; i < shards; i++) {
          const a = (i / (shards - 1) - 0.5) * rec.spread * 2.3 + noise2(i * 2.7, seed, seed) * 0.3
          const len = L * (0.85 + noise2(i * 1.9, seed + 4, seed) * 0.7)
          const w = L * 0.12
          ctx.beginPath()
          ctx.moveTo(Math.cos(a) * len, Math.sin(a) * len)
          ctx.lineTo(Math.cos(a) * base + Math.cos(a + 1.5708) * w, Math.sin(a) * base + Math.sin(a + 1.5708) * w)
          ctx.lineTo(Math.cos(a) * base - Math.cos(a + 1.5708) * w, Math.sin(a) * base - Math.sin(a + 1.5708) * w)
          ctx.closePath()
          ctx.fill()
        }
      }

      // ── Flame ──
      if (fade > 0.03 && L > 3) {
        ctx.globalAlpha = fade
        const fan = flameFan(L, base, rec.spread, heavy ? 3 : 4, seed, rich ? 22 : 14)
        fillShape(ctx, fan, pal.deep)
        fillShape(ctx, shrink(fan, 0.66), pal.mid)
        fillShape(ctx, shrink(fan, heavy ? 0.3 : 0.36), pal.core)
        if (rich) ink(ctx, fan, { width: L * 0.11, color: pal.ink, breakUp: 0.45, seed: seed + 6 })
      }

      // ── Blast ring ──
      // The pressure wave leaving the mouth: a broken ink ellipse standing
      // across the barrel, wide and gone before the smoke arrives. Only the
      // flat-shooting guns get one — a mortar's charge stays in the tube, and
      // a ring drawn round a near-vertical mouth read as a stray scratch.
      const ringA = 1 - u * 3.4
      if (detail && !heavy && ringA > 0.04) {
        const d = L0 * (0.25 + blastEase(u * 2.4) * 0.8)
        const rr = L0 * (0.35 + blastEase(u * 2.2) * 0.5)
        ctx.globalAlpha = ringA * 0.75
        ink(ctx, blob(d, 0, rr * 0.5, rr, seed + 9, 0.18, 2.2, 24), {
          width: Math.max(1.5, L0 * 0.12 * (1 - u)),
          color: pal.deep,
          breakUp: 0.4,
          seed: seed + 12
        })
      }

      // ── Smoke ──
      // The cannon coughs a little; the mortar is mostly smoke, and its plume
      // outlives the flame by half a second. That difference is the whole
      // reason the two guns don't sound alike on screen.
      const smokeA = Math.min(1, Math.max(0, (u - 0.12) / 0.2)) *
        Math.max(0, 1 - Math.max(0, u - (heavy ? 0.5 : 0.4)) / (heavy ? 0.5 : 0.6)) *
        (heavy ? 0.5 : 0.34)
      if (rich && smokeA > 0.04) {
        const n = heavy ? (q === 'high' ? 3 : 2) : 2
        for (let i = 0; i < n; i++) {
          // Pushed out of the muzzle, then lifted — smoke leaves along the
          // barrel and immediately forgets about it. Each lobe further along
          // the plume is thinner than the one behind it, which is what keeps
          // the column from reading as a stack of identical objects.
          const wob = noise2(i * 3.3, m.seed, m.seed)
          const along = L0 * (0.25 + i * 0.3) * (0.5 + u * 0.8)
          const lift = L0 * u * (heavy ? 0.95 : 0.6) * (0.4 + i * 0.3)
          const drift = (wob - 0.5) * L0 * 0.35
          const pr = L0 * (0.2 + wob * 0.22) * (0.55 + u * 0.9)
          ctx.globalAlpha = smokeA * (1 - i * 0.24)
          smokePuff(ctx, along + upx * lift - upy * drift, upy * lift + upx * drift, pr, pal, m.seed + i * 7, true)
        }
      }
      break
    }

    case 'bow': {
      // No fire — a bow releases air. Two motion arcs snapping shut across the
      // string's path, and a flick of grit off the rail.
      const a = 1 - u
      if (a <= 0.02) break
      ctx.globalAlpha = a * 0.85
      for (const k of [0, 1]) {
        const r = L0 * (0.42 + k * 0.3 + u * 0.55)
        const arc: Pt[] = []
        for (let i = 0; i <= 8; i++) {
          const th = (i / 8 - 0.5) * rec.spread * 2
          arc.push([Math.cos(th) * r, Math.sin(th) * r * 1.15])
        }
        // Dark line first, pale one chasing it: a release reads as a flick of
        // light escaping a dark stroke, and one tone alone reads as a smudge.
        inkStroke(ctx, arc, L0 * 0.02, L0 * (0.09 - k * 0.04), k ? '#f6ead2' : pal.ink, seed + k * 3)
      }
      // The shaft's own wake: a thin line already leaving along the aim.
      ctx.globalAlpha = a * 0.5
      inkStroke(ctx, [[L0 * 0.2, 0], [L0 * (0.9 + u * 1.4), 0]], L0 * 0.05, L0 * 0.008, pal.mid, seed + 7)
      break
    }

    case 'coil': {
      // The coil dumping its charge: hard zigzag hairs, no soft glow — the
      // lightning that follows is the light, this is the crack.
      const a = 1 - u * 1.4
      if (a <= 0.02) break
      ctx.globalAlpha = Math.min(1, a)
      const arms = rich ? 5 : 3
      for (let i = 0; i < arms; i++) {
        const th = (i / arms) * Math.PI * 2 + m.seed * 0.9
        const len = L0 * (0.6 + noise2(i * 2.1, seed, seed) * 0.9) * (0.5 + blastEase(u * 2) * 0.8)
        const hair: Pt[] = [[0, 0]]
        for (let k = 1; k <= 3; k++) {
          const f = k / 3
          const j = (noise2(i * 3.1 + k, seed + 2, seed) - 0.5) * len * 0.45
          hair.push([Math.cos(th) * len * f - Math.sin(th) * j, Math.sin(th) * len * f + Math.cos(th) * j])
        }
        inkStroke(ctx, hair, L0 * 0.09, L0 * 0.012, pal.deep, seed + i)
        inkStroke(ctx, hair, L0 * 0.045, L0 * 0.006, pal.core, seed + i + 40)
      }
      break
    }

    case 'chill': {
      // Frost: vapour, not flame. Pale lobes that bloom and sag, with a few
      // hard crystal slivers thrown along the barrel.
      const a = Math.min(1, (1 - u) * 1.6)
      if (a <= 0.02) break
      ctx.globalAlpha = a * 0.9
      const spread = L0 * (0.3 + blastEase(u * 1.8) * 0.75)
      for (let i = 0; i < (rich ? 3 : 2); i++) {
        const th = (i / 3 - 0.33) * rec.spread * 1.8
        const pr = L0 * (0.3 + noise2(i * 2.9, m.seed, m.seed) * 0.16) * (0.7 + u * 0.6)
        const cxx = Math.cos(th) * spread + upx * L0 * u * 0.3
        const cyy = Math.sin(th) * spread + upy * L0 * u * 0.3
        const puff = blob(cxx, cyy, pr, pr * 0.82, seed + i * 4, 0.24, 2.6, 18)
        fillShape(ctx, puff, pal.deep)
        fillShape(ctx, shrink(puff, 0.62, cxx - pr * 0.28, cyy - pr * 0.3), pal.mid)
        if (rich) ink(ctx, puff, { width: pr * 0.16, color: pal.ink, breakUp: 0.5, seed: seed + i })
      }
      if (rich && u < 0.6) {
        ctx.globalAlpha = (1 - u / 0.6) * 0.95
        ctx.fillStyle = pal.core
        for (let i = 0; i < 4; i++) {
          const th = (i / 3 - 0.5) * rec.spread * 2
          const len = L0 * (0.7 + noise2(i * 1.7, seed + 1, seed) * 0.8)
          const w = L0 * 0.05
          ctx.beginPath()
          ctx.moveTo(Math.cos(th) * len, Math.sin(th) * len)
          ctx.lineTo(Math.cos(th) * L0 * 0.2 + Math.cos(th + 1.5708) * w, Math.sin(th) * L0 * 0.2 + Math.sin(th + 1.5708) * w)
          ctx.lineTo(Math.cos(th) * L0 * 0.2 - Math.cos(th + 1.5708) * w, Math.sin(th) * L0 * 0.2 - Math.sin(th + 1.5708) * w)
          ctx.closePath()
          ctx.fill()
        }
      }
      break
    }
  }

  ctx.restore()
  ctx.globalAlpha = 1
}

// Sandbox Tower: the rounds' bodies (water blob, pebble, mud ball, balloon,
// honey bomb, ember) are drawn by `src/game/fxArt.ts` — the same three flat
// cel tones under ink that `celOrb` gave the old iron, lit in screen space.

/**
 * How long a painted round is drawn, in world units per unit of zoom.
 *
 * The drawn arrow spans −1.75u to +2.5u at u = 0.1 zoom, so 0.425. A painted
 * round is fitted to its cell by the export bench, which means the bitmap's own
 * proportions are whatever the painter drew — only the LENGTH can be pinned,
 * and the height follows from the image.
 */
const ROUND_ART_SPAN = 0.44

/**
 * Where the round's origin sits along that span, as a fraction from the left.
 *
 * The drawn arrow straddles its origin unevenly — 1.75u of shaft behind, 2.5u of
 * head in front — because a projectile is positioned by its point of impact,
 * not by its middle. A painted round has to hang the same way or it lands early.
 */
const ROUND_ART_ORIGIN = 1.75 / 4.25

const drawProjectile = (ctx: CanvasRenderingContext2D, p: Projectile): void => {
  const zoom = getZoom()
  const x = worldToScreenX(p.x)
  const y = worldToScreenY(p.y)
  const q = quality.value
  const rich = q === 'high'
  // Deterministic per-round seed: the wobble has to stay put frame to frame,
  // or a cannonball boils on its way across the sky.
  const seed = (p.uid % 97) * 3.7
  // Sandbox Tower: what this round is drawn AS (a water blob or a pebble, a
  // mud ball or a balloon…), remembered per round so its detonation can be
  // drawn in the same substance. See `sightRound`.
  const seen = sightRound(p)
  const look = seen.look

  // ── Trail ──
  // Two characters, because a trail is half of what identifies a shot at speed.
  // Anything with mass leaves a trail of its own MATTER — drops of water, mud
  // flecks, sand grains, honey — and the small fast rounds leave a tapered ink
  // whisk. (The powder smoke that used to follow the cannonball is gone: none
  // of the sandbox's rounds burn.)
  const n = p.trail.length / 2
  if (n >= 3) {
    const matter = look === 'water' ? ['#bff4ff', '#ffffff']
      : look === 'mud' ? ['#7a5630', '#ad8250']
        : look === 'pebble' ? ['#ecd9ac', null]
          : look === 'clod' ? ['#d6b474', '#f6e2ae']
            : look === 'honey' ? ['#f5a51d', '#ffdb66']
              : null
    if (matter) {
      dropTrail(ctx, p.trail, worldToScreenX, worldToScreenY, zoom * (look === 'water' ? 0.045 : 0.035),
        matter[0]!, matter[1] ?? null, look === 'honey' || look === 'mud' ? zoom * 0.12 : 0, q === 'low' ? 3 : 2)
    } else if (look === 'balloon') {
      // A balloon leaks nothing: a faint white speed whisk is all it leaves.
      const path: Pt[] = []
      for (let i = 0; i < p.trail.length; i += 2) {
        path.push([worldToScreenX(p.trail[i]!), worldToScreenY(p.trail[i + 1]!)])
      }
      ctx.globalAlpha = 0.45
      inkStroke(ctx, path, zoom * 0.004, zoom * 0.06, '#ffffff', seed + 5)
      ctx.globalAlpha = 1
    } else {
      // A whisk: nocked thin at the tail, swelling toward the round. Drawn as
      // ink rather than stroked, so it belongs to the same hand as everything
      // it flies past.
      const path: Pt[] = []
      for (let i = 0; i < p.trail.length; i += 2) {
        path.push([worldToScreenX(p.trail[i]!), worldToScreenY(p.trail[i + 1]!)])
      }
      const cold = p.kind === 'frost'
      // Warm behind an ember, white-and-orange behind a foam dart or a
      // toothpick, icy behind a frost shard.
      const warm = look === 'ember'
      ctx.globalAlpha = cold ? 0.5 : 0.42
      inkStroke(ctx, path, zoom * 0.005, zoom * (cold ? 0.1 : 0.07), cold ? '#9fe9ff' : warm ? '#ffd79a' : '#ffcf9e', seed + 5)
      ctx.globalAlpha = cold ? 0.9 : 0.75
      inkStroke(ctx, path, zoom * 0.002, zoom * (cold ? 0.045 : 0.03), cold ? '#eafcff' : warm ? '#fff3d4' : '#ffffff', seed + 9)
      ctx.globalAlpha = 1
    }
  }

  // ── A merged gun's round ──
  // Bigger, and haloed in the tier's colour, so a tier-3 shot is visibly a
  // different thing leaving the barrel rather than the same ball with a bigger
  // number behind it. The halo is a baked disc (see `tierHalo`) — no gradient
  // is built per round per frame.
  const tier = p.tier ?? 1
  const grown = tier > 1 && !p.hostile
  if (grown) {
    const halo = tierHalo(tier)
    const hr = zoom * (0.2 + 0.035 * Math.min(4, tier - 1))
    const prevOp = ctx.globalCompositeOperation
    ctx.globalCompositeOperation = 'lighter'
    ctx.drawImage(halo, x - hr, y - hr, hr * 2, hr * 2)
    ctx.globalCompositeOperation = prevOp
    const k = 1 + 0.14 * Math.min(4, tier - 1)
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(k, k)
    ctx.translate(-x, -y)
  }

  switch (p.kind) {
    case 'bolt':
    case 'quarrel': {
      const ang = Math.atan2(-p.vy, p.vx)
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(ang)
      // Drop-in art, if a round has been painted. Authored pointing right, so
      // the rotation above serves every heading — the same trick the drawn
      // shape uses, and the reason one still is enough for a projectile.
      const painted = spriteFor('round', p.kind)
      if (painted?.naturalWidth) {
        const w = zoom * ROUND_ART_SPAN
        const h = w * (painted.naturalHeight / painted.naturalWidth)
        ctx.drawImage(painted, -w * ROUND_ART_ORIGIN, -h / 2, w, h)
      } else if (p.kind === 'quarrel') {
        drawQuarrelShape(ctx, zoom * 0.1, seed, rich)
      } else {
        drawArrowShape(ctx, zoom * 0.1, seed, rich)
      }
      ctx.restore()
      break
    }

    case 'ball': {
      // Sandbox Tower. The player's squirt gun throws a WATER BLOB — a droplet
      // with its tail streaming back along the flight; an ant catapult throws a
      // grey PEBBLE (or, every third throw, a crumbling sand clod), tumbling.
      // Both keep the cannonball's size and its round silhouette.
      const r = zoom * 0.11
      if (r < 1.5) { ctx.fillStyle = look === 'water' ? '#3cbde2' : '#9aa3ad'; ctx.fillRect(x - 1, y - 1, 2, 2); break }
      if (look === 'water') {
        drawWaterBlob(ctx, x, y, r, Math.atan2(-p.vy, p.vx), seed, rich, p.life)
      } else {
        drawPebble(ctx, x, y, r, p.life / 160, seed, rich, look === 'clod')
      }
      break
    }

    case 'shell': {
      // The mud mortar's MUD BALL, flicking drips behind it — or, off the
      // balloon launcher, a WATER BALLOON in one of four toy colours, knot
      // trailing, squashing as it flies. Sized to the finned shell they replace.
      const u = zoom * 0.1
      if (u < 1.5) { ctx.fillStyle = look === 'balloon' ? '#ff6fae' : '#7a5630'; ctx.fillRect(x - 1, y - 1, 2, 2); break }
      const ang = Math.atan2(-p.vy, p.vx)
      if (look === 'balloon') drawBalloon(ctx, x, y, u * 1.08, ang, seen.hue, seed, rich, p.life)
      else drawMudBall(ctx, x, y, u * 1.02, ang, seed, rich)
      break
    }

    case 'bomb': {
      // A bumblebee's HONEY BOMB: a golden drop with honey hanging off its
      // belly. The drips hang straight down whatever it is doing — the
      // player's cue to look up.
      const u = zoom * 0.1
      if (u < 1.5) { ctx.fillStyle = '#f5a51d'; ctx.fillRect(x - 1, y - 1, 2, 2); break }
      drawHoneyBomb(ctx, x, y, u * 0.98, seed, rich, p.life)
      break
    }

    case 'fire': {
      // A firefly's GLOWING EMBER (and the catapult's late pitch shot): a
      // tumbling coal under its own small flame. The flame is the same fan the
      // guns used to fire, pointed at the sky and re-cut every 90 ms, so
      // burning looks the same wherever it appears — the blocks it lights
      // still burn the old way.
      const u = zoom * 0.1
      const spin = (p.life / 90) % (Math.PI * 2)
      const fire = themedPalette('fire')
      const hold = Math.floor(p.life / 90)

      ctx.save()
      ctx.translate(x, y)
      // Flame climbs, whichever way the ember is tumbling.
      const fan = flameFan(u * 2.5, u * 0.7, 0.9, 3, hold * 4.3 + seed, rich ? 18 : 12)
      ctx.rotate(-Math.PI / 2)
      fillShape(ctx, fan, fire.dark)
      fillShape(ctx, shrink(fan, 0.72), fire.mid)
      fillShape(ctx, shrink(fan, 0.4), fire.light)
      fillShape(ctx, shrink(fan, 0.18), fire.accent)
      if (rich) ink(ctx, fan, { width: u * 0.26, color: '#3a1206', breakUp: 0.5, seed: seed + 6 })
      ctx.restore()

      drawEmberCore(ctx, x, y + u * 0.15, u * 0.62, spin, seed, rich)
      break
    }

    case 'frost': {
      // A shard of ice rather than a ball of light: three flat pale tones under
      // a cold outline, turning slowly so it catches differently each frame.
      const r = zoom * 0.11
      if (r < 1.5) { ctx.fillStyle = '#cdf2ff'; ctx.fillRect(x - 1, y - 1, 2, 2); break }
      const spin = p.life / 260
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(spin)
      const crystal: Pt[] = [
        [0, -r * 1.5], [r * 0.5, -r * 0.35], [r * 1.15, 0],
        [r * 0.5, r * 0.4], [0, r * 1.35], [-r * 0.5, r * 0.4],
        [-r * 1.15, 0], [-r * 0.5, -r * 0.35]
      ]
      fillShape(ctx, crystal, '#4f9dbe')
      fillShape(ctx, shrink(crystal, 0.66, -r * 0.2, -r * 0.3), '#b6ecff')
      fillShape(ctx, shrink(crystal, 0.28, -r * 0.35, -r * 0.5), '#ffffff')
      if (rich) ink(ctx, crystal, { width: r * 0.26, color: '#123244', breakUp: 0.4, seed: seed + 3 })
      ctx.restore()
      // Two chips tumbling alongside, so the round reads as ice breaking off it.
      ctx.globalAlpha = 0.8
      for (let i = 0; i < 2; i++) {
        const a = spin * (i ? -1.6 : 1.3) + i * 2.1
        fillShape(ctx, blob(x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5, r * 0.28, r * 0.2, seed + i * 6, 0.3, 2, 8), '#dcf6ff')
      }
      ctx.globalAlpha = 1
      break
    }
  }
  if (grown) ctx.restore()
}

/**
 * The glow behind a merged gun's round, one bitmap per tier colour.
 *
 * A radial gradient built per round per frame is the kind of cost this file
 * spends a lot of comments getting rid of; the disc never changes, so it is
 * painted once and stretched.
 */
const haloCache = new Map<number, HTMLCanvasElement>()

const tierHalo = (tier: number): HTMLCanvasElement => {
  const key = Math.min(TIER_RUNGS, Math.max(2, tier))
  const hit = haloCache.get(key)
  if (hit) return hit
  const size = 64
  const cv = document.createElement('canvas')
  cv.width = size
  cv.height = size
  const c = cv.getContext('2d')!
  const [r, g, b] = tierStyle(key).rgb
  const grad = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, `rgba(${r},${g},${b},0.85)`)
  grad.addColorStop(0.45, `rgba(${r},${g},${b},0.35)`)
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
  c.fillStyle = grad
  c.fillRect(0, 0, size, size)
  haloCache.set(key, cv)
  return cv
}

// ─── Build-mode world UI ────────────────────────────────────────────────────

/** One column of the drop board, as the overlay needs to draw it. */
export interface DropGuide {
  /** The column. */
  c: number
  /** The row the armed piece would come to rest in. */
  r: number
  /** Whether the column still has room for it. */
  valid: boolean
  /**
   * The welds the drop would make there, strongest first — the block each one
   * ends as and the cell it comes to rest in (`previewDropMerge`). Absent or
   * empty when the piece would just stand there.
   */
  merges?: ReadonlyArray<{ c: number; r: number; typeId: string; tier: number }>
}

export interface BuildOverlay {
  /** Shape the player has armed in the tray, or null. */
  selectedShape: string | null
  /** Cell under the pointer (the shape's bottom-left anchor), or null. */
  hoverC: number | null
  hoverR: number | null
  /** Whether the hovered anchor is a legal, affordable placement. */
  hoverValid: boolean
  /** Quarter-turns the player has applied to the armed shape. */
  selectedRot: number
  /** Anchor cells where the armed shape would fit — drawn as faint sockets. */
  slots: Array<[number, number]>
  /** Block whose inspector is open (draws its range circle). */
  inspectC: number | null
  inspectR: number | null
  /** Centre column of an armed Arrow Rain, or null when not aiming. */
  aimX: number | null
  /** Half-width of that beaten zone, in cells. */
  aimRadius: number
  /** Column a drop is armed over (the mobile-fit board), or null. */
  dropColumn: number | null
  /** Whether that column still has room for the piece. */
  dropValid: boolean
  /** The board's ceiling row — how tall the drop band is drawn. */
  dropRows: number
  /**
   * Every column the piece in hand could go to. Empty when nothing is armed.
   */
  dropGuides: ReadonlyArray<DropGuide>
  /**
   * The piece in hand on the drop board, as a shape id, or null.
   *
   * Drawn as a ghost in the cell it would land in — faint in every open
   * column, solid in the one under the finger. Without it an armed board only
   * showed WHERE: lit columns and empty dashed cells, never WHAT. A blind
   * playtest (2026-09-11) had two players read "tap the board" as "attack
   * that monster", spending a piece on every tap without seeing one leave the
   * hand. Null on the desktop board, which has its own ghost.
   */
  dropShape: string | null
  /** Ground units still walking in beyond each edge of the frame. */
  edgeLeft: number
  edgeRight: number
}

let overlay: BuildOverlay = {
  selectedShape: null, selectedRot: 0, hoverC: null, hoverR: null, hoverValid: false,
  slots: [], inspectC: null, inspectR: null, aimX: null, aimRadius: 4,
  dropColumn: null, dropValid: false, dropRows: 0, dropGuides: [], dropShape: null,
  edgeLeft: 0, edgeRight: 0
}

export const setBuildOverlay = (next: Partial<BuildOverlay>): void => {
  overlay = { ...overlay, ...next }
}

/**
 * The "nothing may go here" cross, drawn in the cell ABOVE a gable.
 *
 * A roofed cell seals its column, and until this existed the only feedback was
 * the ghost outline turning red once the player had already aimed at the dead
 * slot — which reads as "the game refused my tap", not as a rule. Marking the
 * sealed cell itself, before the tap, turns the same rule into something the
 * player can see and plan around.
 *
 * Drawn as a disc plus a thick cross so it survives being 14 px wide on a
 * zoomed-out phone, where a bare stroked ✕ dissolves into the sky.
 */
const drawSealMark = (
  ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, alpha: number
): void => {
  const r = size * 0.3
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = 'rgba(24, 6, 10, 0.55)'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#ff4d4d'
  ctx.lineWidth = Math.max(1.5, size * 0.09)
  ctx.lineCap = 'round'
  const a = r * 0.62
  ctx.beginPath()
  ctx.moveTo(cx - a, cy - a)
  ctx.lineTo(cx + a, cy + a)
  ctx.moveTo(cx + a, cy - a)
  ctx.lineTo(cx - a, cy + a)
  ctx.stroke()
  ctx.restore()
}

/**
 * Stroke the CURRENT path twice — dark first, bright on top.
 *
 * The build UI is drawn over a backdrop that moves: the sky runs from a
 * near-white midday blue to a near-black midnight over ninety seconds, and the
 * tower itself stands against pale painted mountains, water and trees. A
 * single light-blue outline is tuned for exactly one of those. At night it
 * read fine; at noon, against the mountains, the placement sockets disappeared
 * completely — players could not see where they were allowed to build, which
 * is the one thing the build phase has to communicate.
 *
 * A dark stroke laid down first and a narrower bright one over it means one of
 * the two always has contrast, whatever is behind it — the same trick the HUD
 * numbers already use (black `strokeText` under white `fillText`). It costs
 * one extra stroke of a path that is already built.
 */
const strokeTwoTone = (
  ctx: CanvasRenderingContext2D, width: number, dark: string, light: string
): void => {
  ctx.lineWidth = width * 2.5
  ctx.strokeStyle = dark
  ctx.stroke()
  ctx.lineWidth = width
  ctx.strokeStyle = light
  ctx.stroke()
}

/** Stand-in Block for the ghost — the same five fields `drawFixture` reads. */
const ghostProxy = { typeId: '', aim: 0, recoil: 0, uid: 0, c: 0 } as unknown as Block

/**
 * One cell of the build ghost: the body, AND the thing bolted on top of it.
 *
 * The fixture is the whole reason this exists. Under drop-in art a ballista, a
 * cannon and a plain crate are the SAME painted wooden box — the shared bases
 * are deliberate, and the only thing that tells them apart is the bow, barrel or
 * coil sitting on the lid. The ghost drew the body alone, so every armed piece
 * previewed as an anonymous crate and the player could not see what they were
 * about to commit to until after they had committed to it.
 *
 * It goes through the same fixture cache the standing tower uses, so a ghost
 * hovering at the tower's zoom shares its sprite with the blocks already built
 * rather than re-drawing a gun every frame the pointer moves.
 */
const drawGhostCell = (
  ctx: CanvasRenderingContext2D, typeId: string, cx: number, cy: number, size: number,
  col: number, t: number
): void => {
  // A hull is not a crate with a boat on it — same divergence as `drawBlock`.
  if (isShip(typeId)) {
    ctx.save()
    ctx.translate(cx, cy)
    drawShip(ctx, typeId, size, themedPalette(blockDef(typeId).palette), { aim: 0, t, seed: 1 })
    ctx.restore()
    return
  }

  ctx.drawImage(blockFace(typeId, 0, size), cx - size / 2, cy - size / 2, size, size)

  // Aim 0 and recoil 0: the ghost is a piece at rest, and a resting gun points
  // flat along the lane, which is the pose that reads as a weapon in a still.
  // The column is real, though — a lobbed fixture leans toward the side it will
  // actually fire from once placed.
  ghostProxy.typeId = typeId
  ghostProxy.c = col
  blitFixture(ctx, ghostProxy, cx, cy, size, t)
}

/**
 * The drop board's piece in hand, standing in the cell it would land in.
 *
 * A drop piece is one column wide, so its cells stack straight up from the
 * landing row — bottom cell first, exactly as `dropOffer` releases them.
 * Cells past the board's ceiling are left out rather than drawn into the sky.
 * Reads the shape's own cell list (no copy), so a frame of ghosts allocates
 * nothing.
 */
const drawDropGhost = (
  ctx: CanvasRenderingContext2D, shapeId: string, c: number, r: number,
  zoom: number, t: number, alpha: number
): void => {
  const def = SHAPE_BY_ID[shapeId]
  if (!def) return
  ctx.save()
  ctx.globalAlpha = alpha
  for (const [, dy, typeId] of def.cells) {
    const rr = r + dy
    if (rr > overlay.dropRows) continue
    drawGhostCell(ctx, typeId, worldToScreenX(c), worldToScreenY(rr + 0.5), zoom, c, t)
  }
  ctx.restore()
}

/** Stand-in Block for a merge preview's upgraded gun: the fields `blitFixture`
 *  and `mergeArtSpan` read. Reused — painting is synchronous. */
const previewProxy = {
  typeId: '', aim: 0, recoil: 0, uid: 0, c: 0, r: 0, w: 1, h: 1, tier: 1
} as unknown as Block

/**
 * What a drop would weld into, drawn over the block it would weld INTO.
 *
 * The block as it stands is veiled, and the gun it would become is drawn over
 * it — one bigger gun, in its tier's colour — with that
 * colour's outline round the cell and its plate in the corner, exactly where
 * the real plate will be riveted. A chevron runs from the cell the piece lands
 * in to the cell the weld comes to rest in, because a sideways weld or a
 * cascade ends somewhere other than where the finger is.
 *
 * Everything here comes out of a cache — the face, the fixture sprite (keyed
 * by tier), the plate — so a preview costs a handful of blits and two strokes.
 */
const drawMergePreview = (
  ctx: CanvasRenderingContext2D,
  landC: number, landR: number,
  m: { c: number; r: number; typeId: string; tier: number },
  zoom: number, pulse: number, t: number, strength: number
): void => {
  const ts = tierStyle(m.tier)
  const size = zoom
  const l = worldToScreenX(m.c - 0.5)
  const top = worldToScreenY(m.r + 1)
  const cx = l + size / 2
  const cy = top + size / 2

  ctx.save()
  if (landC !== m.c || landR !== m.r) {
    const lx = worldToScreenX(landC)
    const ly = worldToScreenY(landR + 0.5)
    const len = Math.hypot(cx - lx, cy - ly) || 1
    const ux = (cx - lx) / len
    const uy = (cy - ly) / len
    const mx = lx + (cx - lx) * 0.5
    const my = ly + (cy - ly) * 0.5
    const s = size * 0.32
    ctx.globalAlpha = strength
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(mx - ux * s * 0.35 - uy * s * 0.6, my - uy * s * 0.35 + ux * s * 0.6)
    ctx.lineTo(mx + ux * s * 0.45, my + uy * s * 0.45)
    ctx.lineTo(mx - ux * s * 0.35 + uy * s * 0.6, my - uy * s * 0.35 - ux * s * 0.6)
    strokeTwoTone(ctx, Math.max(1.5, zoom * 0.05), 'rgba(8,12,22,0.7)', ts.hex)
  }

  // The block as it stands, veiled, so the gun it becomes reads over it.
  ctx.globalAlpha = 0.72 * strength
  ctx.drawImage(blockFace(m.typeId, 0, size), l, top, size, size)

  previewProxy.typeId = m.typeId
  previewProxy.tier = m.tier
  previewProxy.c = m.c
  const span = mergeArtSpan(previewProxy)
  ctx.globalAlpha = (0.62 + 0.3 * pulse) * strength
  blitFixture(ctx, previewProxy, cx, cy - size * Math.max(0, (span - 1) / 2) * 0.6, size * span, t)

  ctx.globalAlpha = strength
  roundRect(ctx, l + 1, top + 1, size - 2, size - 2, size * 0.12)
  strokeTwoTone(ctx, Math.max(1.5, zoom * (0.035 + 0.02 * pulse)), 'rgba(8,12,22,0.7)', ts.hex)
  drawTierPlate(ctx, m.tier, cx + size / 2 - size * 0.2, cy - size / 2 + size * 0.17, size)
  ctx.restore()
}

/**
 * A chevron with a count on one edge of the frame: ground units still walking
 * in from that side.
 *
 * On the portrait board the approach lane is a cell and a half wide, so a unit
 * is on screen for its last two seconds of a seven-second walk. The arrow
 * carries the rest, and a wall that starts taking hits is never hit "from
 * nowhere" — which reads as unfair even when the wave was announced.
 */
const drawEdgeArrow = (
  ctx: CanvasRenderingContext2D, side: 1 | -1, count: number, zoom: number, pulse: number
): void => {
  if (count <= 0) return
  const rect = viewRect()
  const x = side === 1
    ? worldToScreenX(rect.r) - zoom * 0.85
    : worldToScreenX(rect.l) + zoom * 0.85
  const y = worldToScreenY(0.55)
  const s = zoom * 0.34
  // Pointing INTO the frame, the way the units are walking.
  const dir = -side
  ctx.save()
  ctx.globalAlpha = 0.72 + pulse * 0.28
  ctx.strokeStyle = '#ff7a4a'
  ctx.lineWidth = Math.max(2, zoom * 0.09)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(x - dir * s * 0.5, y - s)
  ctx.lineTo(x + dir * s * 0.5, y)
  ctx.lineTo(x - dir * s * 0.5, y + s)
  ctx.stroke()
  const label = String(count)
  const tx = x - dir * s * 1.4
  ctx.font = `900 ${Math.max(11, Math.round(zoom * 0.42))}px Angry, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineWidth = Math.max(2, zoom * 0.08)
  ctx.strokeStyle = 'rgba(0,0,0,0.85)'
  ctx.strokeText(label, tx, y)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(label, tx, y)
  ctx.restore()
}

const drawBuildOverlay = (ctx: CanvasRenderingContext2D, t: number): void => {
  const zoom = getZoom()
  const pulse = 0.5 + 0.5 * Math.sin(t / 420)

  // ── Drop guides (the mobile-fit board) ──
  //
  // A piece in hand and the tutorial saying "tap a column" used to be the
  // whole of it: the columns themselves were invisible until a finger was
  // already on the board, so the instruction named a target the player could
  // not see. Arming a piece now lights every column it could go to.
  //
  // Neighbouring columns are separated by alternating band strengths rather
  // than by divider lines — five bands and six lines on a 50 px grid is a
  // cage, and the board has to stay readable underneath. Each column also
  // shows the cell the piece would land in, dashed so it never competes with
  // the solid outline the aimed column gets below. A full column goes red and
  // loses its landing cell: there is nowhere for the piece to rest.
  if (overlay.dropGuides.length > 0) {
    const gTop = worldToScreenY(overlay.dropRows + 1)
    const gGround = worldToScreenY(0)
    // A refused drop (a full column, an empty purse): every column that WOULD
    // take the piece flashes its landing cell green — the drop board's "not
    // there; here", the same answer the tower board's sockets give.
    const refusedDrop = rejectFlash(performance.now())
    ctx.save()
    for (const g of overlay.dropGuides) {
      if (refusedDrop > 0.01 && g.valid) {
        const beat = prefersReducedMotion() ? 1 : 0.75 + 0.25 * Math.sin(t / 70)
        const fl = worldToScreenX(g.c - 0.5)
        const fy = worldToScreenY(g.r + 1)
        roundRect(ctx, fl + zoom * 0.04, fy + zoom * 0.04, zoom * 0.92, zoom * 0.92, zoom * 0.14)
        ctx.fillStyle = `rgba(94,240,138,${0.34 * refusedDrop * beat})`
        ctx.fill()
        strokeTwoTone(ctx, Math.max(2, zoom * 0.06), `rgba(4,26,10,${0.6 * refusedDrop})`, `rgba(140,255,170,${refusedDrop})`)
      }
      const gl = worldToScreenX(g.c - 0.5)
      ctx.fillStyle = g.valid
        ? `rgba(150,215,255,${Math.abs(g.c) % 2 === 1 ? 0.055 : 0.11})`
        : 'rgba(255,110,110,0.14)'
      ctx.fillRect(gl, gTop, zoom, gGround - gTop)
      // A hairline down each side. The bands alone vanish where the column
      // crosses the pale mountains behind the board.
      ctx.fillStyle = 'rgba(205,238,255,0.2)'
      ctx.fillRect(gl, gTop, Math.max(1, zoom * 0.02), gGround - gTop)
      ctx.fillRect(gl + zoom - Math.max(1, zoom * 0.02), gTop, Math.max(1, zoom * 0.02), gGround - gTop)
      if (!g.valid || g.c === overlay.dropColumn) continue
      // The cell the piece would come to rest in: filled and dashed, so the
      // column reads as "this far down" and not merely as a lit stripe. In
      // the weld's colour when it would weld, so the landing cell and the
      // preview it points at read as one event.
      const gy = worldToScreenY(g.r + 1)
      const weld = g.merges && g.merges.length > 0 ? tierStyle(g.merges[0]!.tier).rgb : null
      ctx.fillStyle = `rgba(150,225,255,${0.08 + pulse * 0.05})`
      ctx.fillRect(gl, gy, zoom, zoom)
      ctx.setLineDash([zoom * 0.17, zoom * 0.13])
      ctx.lineWidth = Math.max(2, zoom * 0.055)
      ctx.strokeStyle = weld
        ? `rgba(${weld[0]},${weld[1]},${weld[2]},${0.7 + pulse * 0.25})`
        : `rgba(175,238,255,${0.6 + pulse * 0.2})`
      roundRect(ctx, gl + zoom * 0.09, gy + zoom * 0.09, zoom * 0.82, zoom * 0.82, zoom * 0.13)
      ctx.stroke()
      ctx.setLineDash([])
      // What would land there, faintly — the piece itself, not just its slot.
      // A column that welds shows the weld instead (the preview below).
      if (overlay.dropShape && !weld) {
        drawDropGhost(ctx, overlay.dropShape, g.c, g.r, zoom, t, 0.26 + pulse * 0.08)
      }
    }
    ctx.restore()
  }

  // ── Drop column (the mobile-fit board) ──
  //
  // The whole column is the target, so the whole column lights: a band from
  // the ground to the board's ceiling, and a hard outline on the cell the
  // piece will come to rest in. Red when the column is full.
  if (overlay.dropColumn != null) {
    const c = overlay.dropColumn
    const l = worldToScreenX(c - 0.5)
    const top = worldToScreenY(overlay.dropRows + 1)
    const ground = worldToScreenY(0)
    ctx.fillStyle = overlay.dropValid
      ? `rgba(120,220,255,${0.1 + pulse * 0.06})`
      : `rgba(255,90,90,${0.12 + pulse * 0.06})`
    ctx.fillRect(l, top, zoom, ground - top)
    // The piece under the finger, at full strength in the cell it will take,
    // BEFORE the finger lifts: pressing the board says "this piece, here". A
    // weld is already drawn as its preview below, so it is not doubled here.
    if (overlay.dropShape && overlay.dropValid && overlay.hoverR != null) {
      let welds = false
      for (const g of overlay.dropGuides) {
        if (g.c === c) { welds = (g.merges?.length ?? 0) > 0; break }
      }
      if (!welds) drawDropGhost(ctx, overlay.dropShape, c, overlay.hoverR, zoom, t, 0.78)
    }
    if (overlay.hoverR != null) {
      ctx.lineWidth = Math.max(2, zoom * 0.06)
      ctx.strokeStyle = overlay.dropValid ? '#5ef08a' : '#ff5a5a'
      roundRect(ctx, l, worldToScreenY(overlay.hoverR + 1), zoom, zoom, zoom * 0.12)
      ctx.stroke()
    }
  }

  // ── Merge previews (the mobile-fit board) ──
  //
  // Over everything else in the drop UI: the weld a column would make is the
  // most important thing it can say. Every column that welds shows it, so the
  // player can SEE which drop makes the tier 3; once a finger is on a column,
  // that column's preview stays at full strength and the rest step back.
  for (const g of overlay.dropGuides) {
    if (!g.valid || !g.merges || g.merges.length === 0) continue
    const strength = overlay.dropColumn == null || overlay.dropColumn === g.c ? 1 : 0.6
    for (const m of g.merges) drawMergePreview(ctx, g.c, g.r, m, zoom, pulse, t, strength)
  }

  // ── Edge arrows (the mobile-fit board) ──
  drawEdgeArrow(ctx, -1, overlay.edgeLeft, zoom, pulse)
  drawEdgeArrow(ctx, 1, overlay.edgeRight, zoom, pulse)
  // Rotated here rather than at the call site so the ghost, the footprint
  // outline and the seal markers all read the SAME cells the placement check
  // will run against.
  const shape = overlay.selectedShape
    ? rotatedShape(overlay.selectedShape, overlay.selectedRot)
    : null

  // Legal anchor sockets.
  //
  // Only the ANCHOR cell is marked, not the whole footprint of every candidate,
  // and sockets fade with distance from the pointer: a twenty-block tower has
  // fifty legal anchors, and drawing every one at full strength wallpapers the
  // sky and hides the tower the player is trying to read.
  //
  // What the fade must never do is take a socket below "visible". It used to:
  // a 5 % cyan fill under a 22 % cyan outline, times a falloff that bottomed
  // out at 0.12, is a mark that exists only against a night sky. At midday,
  // against the painted mountains, there was nothing on screen at all — the
  // player had to guess where the game would accept a block, and the ones who
  // guessed wrong concluded it was broken and left. So the floor is high
  // enough to read, and every mark is drawn two-tone (see `strokeTwoTone`) so
  // the backdrop cannot swallow it at any hour.
  if (shape && overlay.slots.length > 0) {
    const stroke = Math.max(1.5, zoom * 0.035)
    const hasHover = overlay.hoverC != null && overlay.hoverR != null
    const FALLOFF = 7
    /** Distant sockets are SECONDARY, never invisible. */
    const FAR_FLOOR = 0.45
    for (const [c, r] of overlay.slots) {
      let near = 1
      if (hasHover) {
        const d = Math.hypot(c - overlay.hoverC!, r - overlay.hoverR!)
        near = Math.max(FAR_FLOOR, 1 - d / FALLOFF)
      }
      const x = worldToScreenX(c - 0.5)
      const y = worldToScreenY(r + 1)
      roundRect(ctx, x, y, zoom, zoom, zoom * 0.12)
      ctx.fillStyle = `rgba(140,232,255,${(0.17 + pulse * 0.07) * near})`
      ctx.fill()
      strokeTwoTone(
        ctx, stroke,
        `rgba(4,14,26,${0.6 * near})`,
        `rgba(214,248,255,${(0.88 + pulse * 0.12) * near})`
      )
    }

    // A refused click: every legal anchor flashes green at full strength, the
    // falloff suspended — "not there; HERE". The answer to a refusal is where
    // the piece CAN go, and that is exactly the list these sockets already are.
    const refused = rejectFlash(performance.now())
    if (refused > 0.01) {
      const beat = prefersReducedMotion() ? 1 : 0.75 + 0.25 * Math.sin(t / 70)
      for (const [c, r] of overlay.slots) {
        const x = worldToScreenX(c - 0.5)
        const y = worldToScreenY(r + 1)
        roundRect(ctx, x, y, zoom, zoom, zoom * 0.12)
        ctx.fillStyle = `rgba(94,240,138,${0.3 * refused * beat})`
        ctx.fill()
        strokeTwoTone(ctx, stroke * 1.3, `rgba(4,26,10,${0.6 * refused})`, `rgba(140,255,170,${refused})`)
      }
    }
  }

  // Cells already sealed by a gable somewhere in the standing tower.
  //
  // Only while a piece is armed — outside build mode these would be pure noise —
  // and faded with distance from the pointer, on the same falloff as the
  // sockets, so a tower with a dozen roofs doesn't turn into a field of crosses.
  if (shape) {
    const hasHover = overlay.hoverC != null && overlay.hoverR != null
    for (const b of getTowerBlocks().values()) {
      if (!b.roof) continue
      const top = b.r + spanH(b) - 1
      for (let ix = 0; ix < spanW(b); ix++) {
        const c = b.c + ix
        let near = 0.55
        if (hasHover) {
          const d = Math.hypot(c - overlay.hoverC!, top + 1 - overlay.hoverR!)
          near = Math.max(0.14, 0.85 - d / 7)
        }
        drawSealMark(ctx, worldToScreenX(c), worldToScreenY(top + 1.5), zoom, near)
      }
    }
  }

  // A refused ghost shakes its head (a tenth of a cell of jitter for half a
  // second, none under reduced motion), so the red outline reads as "no" and
  // never as a block that landed. The translate covers the ghost, its verdict
  // outline and its seal marks alike.
  ctx.save()
  ctx.translate(rejectShake(performance.now()) * zoom, 0)

  // Ghost preview — the WHOLE shape, drawn from the anchor under the pointer,
  // so the player sees the exact footprint they are committing to.
  if (shape && overlay.hoverC != null && overlay.hoverR != null) {
    const roofs = new Set(shape.roofs ?? [])
    ctx.save()
    ctx.globalAlpha = 0.72
    shape.cells.forEach(([dx, dy, typeId], i) => {
      const cc = overlay.hoverC! + dx
      const rr = overlay.hoverR! + dy
      const x = worldToScreenX(cc - 0.5)
      const y = worldToScreenY(rr + 1)
      drawGhostCell(ctx, typeId, x + zoom / 2, y + zoom / 2, zoom, cc, t)
      if (roofs.has(i)) drawRoof(ctx, worldToScreenX(cc), worldToScreenY(rr + 0.5), zoom)
    })
    ctx.restore()

    // The verdict on the cell under the pointer. Two-tone as well: a green
    // outline on a sunlit mountain is exactly as hard to see as a blue one,
    // and this is the mark that says whether the tap will be accepted.
    const verdict = Math.max(2, zoom * 0.06)
    const light = overlay.hoverValid ? '#5ef08a' : '#ff5a5a'
    for (const [dx, dy] of shape.cells) {
      const x = worldToScreenX(overlay.hoverC! + dx - 0.5)
      const y = worldToScreenY(overlay.hoverR! + dy + 1)
      roundRect(ctx, x, y, zoom, zoom, zoom * 0.12)
      strokeTwoTone(ctx, verdict, 'rgba(4,14,26,0.7)', light)
    }

    // What THIS piece would seal if the player commits, at full strength — the
    // cost of a roofed shape is the cell it takes off the board above itself,
    // and that has to be visible before the tap, not after.
    const own = new Set(shape.cells.map(([dx, dy]) => `${dx},${dy}`))
    shape.cells.forEach(([dx, dy], i) => {
      if (!roofs.has(i)) return
      // A gable under another cell of the same piece is already illegal and is
      // flagged by the red footprint outline; a second marker there is noise.
      if (own.has(`${dx},${dy + 1}`)) return
      const cx = worldToScreenX(overlay.hoverC! + dx)
      const cy = worldToScreenY(overlay.hoverR! + dy + 1.5)
      drawSealMark(ctx, cx, cy, zoom, 0.75 + pulse * 0.25)
    })
  }
  ctx.restore()

  // ── Arrow Rain's beaten zone ──
  //
  // Drawn as a shaft of light standing on the strip it will hit, because the
  // volley comes from ABOVE and a flat footprint on the ground would say
  // nothing about that. The edges are hard: the difference between a block
  // being inside and outside this band is a tenth of its hit points, so a soft
  // gradient here would be lying about where the line is.
  if (overlay.aimX != null) {
    const l = worldToScreenX(overlay.aimX - overlay.aimRadius)
    const rgt = worldToScreenX(overlay.aimX + overlay.aimRadius)
    const ground = worldToScreenY(0)
    const top = worldToScreenY(16)
    const g = ctx.createLinearGradient(0, top, 0, ground)
    g.addColorStop(0, 'rgba(255,224,120,0.02)')
    g.addColorStop(1, `rgba(255,224,120,${0.16 + pulse * 0.1})`)
    ctx.fillStyle = g
    ctx.fillRect(l, top, rgt - l, ground - top)
    ctx.strokeStyle = `rgba(255,236,160,${0.5 + pulse * 0.3})`
    ctx.lineWidth = Math.max(2, zoom * 0.04)
    ctx.setLineDash([zoom * 0.3, zoom * 0.2])
    ctx.beginPath()
    ctx.moveTo(l, top); ctx.lineTo(l, ground)
    ctx.moveTo(rgt, top); ctx.lineTo(rgt, ground)
    ctx.stroke()
    ctx.setLineDash([])
    // The ground line it lands on, solid — this is the part that is about to
    // be underneath a hundred arrows.
    ctx.strokeStyle = '#ffec9f'
    ctx.beginPath(); ctx.moveTo(l, ground); ctx.lineTo(rgt, ground); ctx.stroke()
  }

  // Range circle for the inspected turret — the clearest way to teach reach.
  if (overlay.inspectC != null && overlay.inspectR != null) {
    const b = getBlocks().get(`${overlay.inspectC},${overlay.inspectR}`)
    const w = b ? blockDef(b.typeId).weapon : null
    if (b && w) {
      const cx = worldToScreenX(centreX(b))
      const cy = worldToScreenY(centreY(b))
      // `effectiveRangeMul` — Long Sight / Artillery Doctrine, plus any Siege
      // Spotters buff — must be in here. The turret has always FIRED at
      // `w.range * mRange` (see `stepTurrets`), but this circle drew the
      // unmodified base reach, so the one thing in the game that teaches reach
      // was the one thing the range tech did not move. Read live rather than
      // from the wave-start cache so a rank bought with the inspector open
      // redraws immediately, matching `BlockInspector`.
      const rr = w.range * effectiveRangeMul.value * zoom

      // DOUBLE-STROKED: a fat dark pass under a bright thin one.
      //
      // A single translucent cyan line is only visible against something darker
      // than it, and most of what this ring crosses is not — daylit sky, snow on
      // the far peaks, pale stone, the water. It read as a faint scratch at
      // noon and vanished outright where it crossed a bright peak, which makes
      // the one overlay in the game that TEACHES reach unreadable exactly when
      // the player is using it.
      //
      // Backing it with its own dark outline is the same fix the rank chevrons
      // use, and it is background-independent: the halo supplies the contrast,
      // so the ring holds at every hour of the day cycle without the overlay
      // having to know what time it is. Both passes share the dash pattern, so
      // the dark is an outline around each dash rather than a solid ring behind
      // a dotted one.
      const dash: [number, number] = [zoom * 0.22, zoom * 0.16]
      const lw = Math.max(2, zoom * 0.045)

      /**
       * The reachable region, as a path.
       *
       * A radial weapon is a circle. A PLUNGING one is a circle only ABOVE the
       * muzzle — below it, height is free, so the region is a column of the
       * same width falling away to the ground and past it. Drawing that as a
       * dome on top of two verticals is the whole rule in one shape: "this far
       * to either side, and anything under it".
       *
       * Canvas angles run clockwise on screen because y points down, so the
       * half ABOVE the muzzle is π → 2π (left, over the top, to right).
       */
      const region = (): void => {
        ctx.beginPath()
        if (!w.plunging) {
          ctx.arc(cx, cy, rr, 0, Math.PI * 2)
          return
        }
        // Past the bottom of the frame, because the reach genuinely does not
        // stop — a bottom edge drawn anywhere would be inventing a limit.
        const floor = ctx.canvas.height + lw * 4
        ctx.moveTo(cx - rr, floor)
        ctx.lineTo(cx - rr, cy)
        ctx.arc(cx, cy, rr, Math.PI, Math.PI * 2)
        ctx.lineTo(cx + rr, floor)
      }

      ctx.setLineDash(dash)
      ctx.lineCap = 'round'

      ctx.strokeStyle = `rgba(6,18,34,${0.5 + pulse * 0.28})`
      ctx.lineWidth = lw * 2.4
      region(); ctx.stroke()

      // Near-opaque on top. The pulse now rides the top of the range rather
      // than the bottom — it should read as breathing, never as fading out.
      ctx.strokeStyle = `rgba(150,232,255,${0.82 + pulse * 0.18})`
      ctx.lineWidth = lw
      region(); ctx.stroke()

      ctx.setLineDash([])
      ctx.lineCap = 'butt'

      // The disc stays a whisper. It covers a huge area of hand-painted
      // scenery, and anything strong enough to help on its own would wash the
      // art out — the ring is what carries the read.
      ctx.fillStyle = 'rgba(120,220,255,0.07)'
      region(); ctx.closePath(); ctx.fill()
    }
    // Selection ring on the block itself, backed the same way. It sits on
    // pale stone and painted crates rather than on sky, so it was never as
    // badly off as the range ring — but a selection that half-disappears
    // against a light block is the same bug one step smaller.
    //
    // On EVERY inspected block, not only guns: a wall or a gate being upgraded
    // has a card open over it too, and without the ring nothing on the board
    // said which block the card was about.
    if (b) {
      const sw = Math.max(2, zoom * 0.06)
      const sx = worldToScreenX(b.c - 0.5)
      const sy = worldToScreenY(b.r + spanH(b))
      ctx.strokeStyle = 'rgba(6,18,34,0.7)'
      ctx.lineWidth = sw * 2
      roundRect(ctx, sx, sy, zoom * spanW(b), zoom * spanH(b), zoom * 0.12)
      ctx.stroke()
      ctx.strokeStyle = '#7fe0ff'
      ctx.lineWidth = sw
      roundRect(ctx, sx, sy, zoom * spanW(b), zoom * spanH(b), zoom * 0.12)
      ctx.stroke()
    }
  }
}

// ─── Block drawing ──────────────────────────────────────────────────────────

/**
 * How big the WEAPON on a merged block is drawn, in cells.
 *
 * A merge no longer shrinks two blocks into one cell — the fused block keeps
 * every cell its halves stood on. So the body has a footprint to fill, and the
 * only thing left to scale is the fixture bolted to it: one gun, centred on the
 * whole span, overflowing it by a tenth so it reads as too much cannon for the
 * carriage. Doubling per tier puts a tier-3 at 2.2 cells — a single siege piece
 * straddling four blocks' worth of masonry.
 */
const mergeArtSpan = (b: Block): number => {
  if (tierOf(b.tier) <= 1) return 1
  if (rulesNow().mergeArt === 'cell') return fixtureSpanForCellTier(tierOf(b.tier))
  // The SHORTEST side, not the tier. A weld doubles its footprint's AREA every
  // tier but only widens both axes every other one — 2×1, 2×2, 4×2, 4×4 — so
  // doubling the gun per tier (what this used to do) put a 4.4-cell barrel on
  // a two-cell-tall tier-4 and hung it out into the sky. Measured off the
  // short side it overflows by the same tenth at every tier, which is the
  // "too much cannon for the carriage" read the merged art is going for.
  return 1.1 * Math.min(spanW(b), spanH(b))
}

/**
 * The span a block's FIXTURE is drawn at: `mergeArtSpan`, plus the extra a
 * merged WEAPON gets on a weld that is longer one way than the other
 * (`gunGrowthFor`). That extra is what a tier-2 gun on a 2×1 is made of — it
 * is the one gun growing into its weld instead of a second barrel beside it.
 *
 * Only weapons, and only on the tower: support fixtures were never doubled and
 * keep their size, ships draw their own hull off `mergeArtSpan`, and the
 * one-cell board's per-tier step is already in `fixtureSpanForCellTier`.
 */
const fixtureArtSpan = (b: Block): number => {
  const span = mergeArtSpan(b)
  if (span === 1 || rulesNow().mergeArt === 'cell' || !TIERED_WEAPONS.has(b.typeId)) return span
  return span * gunGrowthFor(spanW(b), spanH(b))
}

/**
 * The plate that says how deep the weld goes — in the TIER'S colour.
 *
 * It was one steel grey at every depth, which told the player "merged" and
 * nothing else: a tier 3 looked no more special than a tier 2, so nothing on
 * the board argued for the second weld. Each tier now has its own rung of the
 * loot ladder (`tierStyle`), and the plate is filled with it.
 *
 * NO gold. Gold means ONE thing on this battlefield — reinforced, bought with a
 * rewarded video — and a merged block wearing it made the two
 * indistinguishable at a glance. The ladder skips it for that reason.
 *
 * Riveted INSIDE the top-right corner of the footprint. It hung outside the
 * corner for a while, to keep it clear of the gun — but anything outside the
 * block belongs to the cell next door, and the moment the player built there
 * the plate was buried. It is drawn after the fixture instead, so it sits on
 * top of the barrel rather than dodging it.
 */
/**
 * What the plate says.
 *
 * Roman through III, which is every tier the desktop board can reach and the
 * only thing that ever fitted the stamped-steel look. An uncapped board goes
 * past that, and "VIII" in a plate a third of a cell wide is a smear — so from
 * four up it is the Arabic number, which never exceeds two characters.
 */
const tierLabel = (tier: number): string =>
  tier >= 4 ? String(tier) : tier >= 3 ? 'III' : 'II'

/**
 * The merge-tier badge, baked once per (tier, size).
 *
 * Drop & Merge puts one of these on nearly every block on the board, and the
 * honest version paid a rounded-rect fill, a stroke, a `ctx.font` assignment
 * built as a fresh template string, and a `fillText` — per block, per frame.
 * Text rasterisation is the expensive half and the string was a per-frame
 * allocation on top; at forty blocks it was the single heaviest named function
 * in a 6x-throttled profile. Nothing about the badge changes between frames,
 * so it is a bitmap.
 *
 * Keyed on the rounded cell size as well as the tier because the desktop scene
 * zooms; on the fixed mobile camera there is exactly one size and the cache
 * holds a handful of entries for the life of the run.
 */
interface PlateSprite { cv: HTMLCanvasElement; ox: number; oy: number; w: number; h: number }
const plateCache = new Map<string, PlateSprite>()
const PLATE_CACHE_MAX = 24

const tierPlate = (tier: number, size: number): PlateSprite => {
  const q = Math.max(4, Math.round(size))
  const key = `${tier}|${q}|${Math.round(tintDpr * 4)}`
  const hit = plateCache.get(key)
  if (hit) return hit

  // The badge sits from -0.15..+0.17 of a cell across and ±0.12 down, and the
  // stroke straddles that edge — so the bitmap needs a margin or the outline
  // comes back clipped on two sides.
  const pad = q * 0.05 + 2
  const w = q * 0.32 + pad * 2
  const h = q * 0.24 + pad * 2
  const ss = Math.min(3, Math.max(1, tintDpr || 1))
  const cv = document.createElement('canvas')
  cv.width = Math.max(1, Math.round(w * ss))
  cv.height = Math.max(1, Math.round(h * ss))
  const c = cv.getContext('2d')!
  c.scale(ss, ss)

  const ts = tierStyle(tier)
  const fill = c.createLinearGradient(0, pad, 0, pad + q * 0.24)
  fill.addColorStop(0, ts.plateTop)
  fill.addColorStop(1, ts.plateBottom)
  c.fillStyle = fill
  // A moulded plastic badge rather than a stamped iron one: rounder corners, a
  // glossy top half, and the warm ink keyline every toy in the sandbox wears —
  // so a green plate on sand and a blue one on the sky still have an edge.
  roundRect(c, pad, pad, q * 0.32, q * 0.24, q * 0.09)
  c.fill()
  c.fillStyle = 'rgba(255,255,255,0.38)'
  roundRect(c, pad + q * 0.03, pad + q * 0.022, q * 0.26, q * 0.085, q * 0.04)
  c.fill()
  roundRect(c, pad, pad, q * 0.32, q * 0.24, q * 0.09)
  c.strokeStyle = 'rgba(59,42,33,0.92)'
  c.lineWidth = Math.max(1, q * 0.03)
  c.stroke()
  c.font = `900 ${Math.round(q * 0.24)}px sans-serif`
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  const tx = pad + q * 0.15
  const ty = pad + q * 0.12 + q * 0.01
  // Outlined numerals: a white II on a pale green plate is otherwise a smudge.
  c.lineJoin = 'round'
  c.lineWidth = Math.max(1, q * 0.045)
  c.strokeStyle = ts.ink === '#ffffff' ? 'rgba(10,14,24,0.7)' : 'rgba(255,255,255,0.5)'
  c.strokeText(tierLabel(tier), tx, ty)
  c.fillStyle = ts.ink
  c.fillText(tierLabel(tier), tx, ty)

  const sprite: PlateSprite = { cv, ox: pad + q * 0.15, oy: pad + q * 0.12, w, h }
  plateCache.set(key, sprite)
  if (plateCache.size > PLATE_CACHE_MAX) {
    const oldest = plateCache.keys().next().value
    if (oldest !== undefined && oldest !== key) plateCache.delete(oldest)
  }
  return sprite
}

const drawTierPlate = (
  ctx: CanvasRenderingContext2D, tier: number, bx: number, by: number, size: number
): void => {
  // The plate is a badge with a NUMBER on it. The recorder's canvas-text gate
  // takes the digit and would leave the badge behind it — so the whole plate
  // goes, and a weld reads by its size and its tier colour, as it does anyway.
  if (CLEAN_FEED) return
  const s = tierPlate(tier, size)
  ctx.drawImage(s.cv, bx - s.ox, by - s.oy, s.w, s.h)
}

/** Where a merged gun's glint can land, as fractions of the gun's span. */
const TWINKLE_SPOTS: ReadonlyArray<readonly [number, number]> = [
  [0.3, -0.26], [-0.28, -0.1], [0.16, 0.2], [-0.12, -0.3]
]
const TWINKLE_MS = 1300

/**
 * A glint that hops around a tier-3-or-better gun.
 *
 * The one moving part of a merged weapon, and it is there to catch the eye of
 * a player scanning the board for their best gun — a still rim is learned and
 * then ignored, a sparkle is looked at. One four-point star, one path fill, and
 * only on the tiers rare enough that there are a handful on the board.
 */
const drawTierTwinkle = (
  ctx: CanvasRenderingContext2D, b: Block, cx: number, cy: number, span: number, t: number
): void => {
  const clock = t + (b.uid | 0) * 373
  const k = (clock % TWINKLE_MS) / TWINKLE_MS
  const a = Math.sin(k * Math.PI)
  if (a < 0.08) return
  const [sx, sy] = TWINKLE_SPOTS[Math.floor(clock / TWINKLE_MS) % TWINKLE_SPOTS.length]!
  const x = cx + sx * span
  const y = cy + sy * span
  const r = span * 0.12 * a
  const w = r * 0.28
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = 0.9 * a
  ctx.fillStyle = tierStyle(tierOf(b.tier)).plateTop
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
  ctx.fill()
  // A white-hot core: the glint off shiny plastic, not a star on a shield.
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(x, y, w * 0.9, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

const drawBlock = (ctx: CanvasRenderingContext2D, b: Block, t: number, fallOffset = 0, fallRot = 0, fallDx = 0): void => {
  const zoom = getZoom()
  const size = zoom
  // The footprint, in cells and in pixels. Everything below is measured off
  // this rect rather than off a single cell, so a 2×1 wall gets a 2-cell body,
  // a 2-cell-wide HP bar and its badges pinned to its real corners.
  const cw = spanW(b)
  const ch = spanH(b)
  const fw = size * cw
  const fh = size * ch
  const cx = worldToScreenX(centreX(b) + fallDx)
  const cy = worldToScreenY(centreY(b) + fallOffset)

  // Placement pop-in: elastic squash-stretch over 260 ms.
  const age = t - b.bornAt
  let sx = 1
  let sy = 1
  if (age >= 0 && age < 260) {
    const k = age / 260
    const e = 1 - Math.pow(1 - k, 3)
    sx = 1 + (1 - e) * 0.35
    sy = 1 - (1 - e) * 0.3
  }

  // The Gate, struck: a cartoon hop and a white/red blink (`useWorldCues`).
  // Page clock, like every world cue — the run clock resets per run.
  const isGateBody = b.typeId === GATE_ID && fallOffset === 0
  const cueNow = isGateBody ? performance.now() : 0
  const gatePop = isGateBody ? gatePopScale(cueNow) : 1

  ctx.save()
  ctx.translate(cx, cy)
  if (fallRot !== 0) ctx.rotate(fallRot)
  if (gatePop !== 1) {
    // About the BASE, not the centre, so the Gate hops up off the ground
    // instead of sinking into it; a touch wider than tall, like a squash.
    ctx.translate(0, fh / 2)
    ctx.scale(1 + (gatePop - 1) * 1.1, 1 + (gatePop - 1) * 0.9)
    ctx.translate(0, -fh / 2)
  }
  ctx.scale(sx, sy)

  // A hull is not a cube of material: it has its own module, it is clipped at
  // the waterline, and it rolls. It also skips the pop-in squash, the damage
  // stages and the roof cap, none of which mean anything for a boat.
  if (isShip(b.typeId)) {
    // A fused fleet is one bigger hull, so the whole ship scales with the span
    // rather than being tiled — two skiffs lashed together are a longship.
    drawShip(ctx, b.typeId, size * mergeArtSpan(b),
      themedPalette(blockDef(b.typeId).palette), { aim: b.aim, t, seed: b.uid })
    ctx.restore()
    if (b.hp < b.maxHp && fallOffset === 0) {
      drawHpBar(ctx, cx, cy - fh * 0.72, fw * 0.72, Math.max(2, size * 0.07),
        b.hp / b.maxHp, false)
    }
    if (tierOf(b.tier) > 1 && fallOffset === 0) {
      drawTierPlate(ctx, tierOf(b.tier), cx + fw / 2 - size * 0.2, cy - fh / 2 + size * 0.17, size)
    }
    return
  }

  // ONE box, at the size of the whole footprint.
  //
  // Tiling the cell sprite drew a merged block as four little crates stacked in
  // a square, which is exactly what a merge is supposed to stop looking like.
  // A tier-3 is a single big box two cells wide and two cells high — the panel
  // lines, rivets and rim all scale with it, so the thing reads as one forged
  // object rather than as a neat pile.
  //
  // The sprite is baked at the footprint's LONGEST edge so the detail is cut
  // for the size it is actually drawn at, not upscaled from a 1-cell bake.
  const sprite = blockFace(b.typeId, damageStage(b), Math.max(fw, fh))
  ctx.drawImage(sprite, -fw / 2, -fh / 2, fw, fh)
  if (isGateBody) drawGateBlink(ctx, fw, fh, size, cueNow)

  // Reinforced blocks: a gold rim plus a shine that sweeps across the face.
  // The sweep is phase-offset per cell so a wall of them shimmers rather than
  // pulsing in lockstep, and it is additive so it never muddies the material.
  if (b.enhanced) {
    // FILL THE PATH — never clip.
    //
    // This used to `clip()` to the block's rounded rect and then `fillRect`
    // across it. Visually identical, and ruinously more expensive: a clip is a
    // rasteriser-level mask, and a tower of 230 blocks was setting up ~400 of
    // them every frame. That cost does not show up in a JS profile at all — the
    // draw calls record in microseconds and the compositor pays for them later
    // — which is why the frame budget vanished with no hot function to blame.
    // Filling the rounded-rect path directly bounds the gradient the same way.
    if (shineOn && size >= SHINE_MIN_PX) {
      const k = ((t / 1900 + (b.c * 0.17 + b.r * 0.11)) % 1)
      const sweep = -fw / 2 - size + k * (fw + size * 2)
      const gl = ctx.createLinearGradient(sweep - size * 0.32, -fh / 2, sweep + size * 0.32, fh / 2)
      gl.addColorStop(0, 'rgba(255,238,170,0)')
      gl.addColorStop(0.5, 'rgba(255,246,205,0.5)')
      gl.addColorStop(1, 'rgba(255,238,170,0)')
      const prevOp = ctx.globalCompositeOperation
      ctx.globalCompositeOperation = 'lighter'
      ctx.fillStyle = gl
      roundRect(ctx, -fw / 2, -fh / 2, fw, fh, size * 0.1)
      ctx.fill()
      ctx.globalCompositeOperation = prevOp
    }

    roundRect(ctx, -fw / 2, -fh / 2, fw, fh, size * 0.1)
    ctx.strokeStyle = 'rgba(255,206,74,0.85)'
    ctx.lineWidth = Math.max(1, size * 0.05)
    ctx.stroke()
  }

  // ── Buff aura ──
  //
  // A buffed block has to LOOK buffed, or the whole mechanic is an invisible
  // number and the player never learns that where a banner goes is the
  // question. Drawn as an inner rim that brightens with the multiplier, so a
  // block fed from two sides is visibly hotter than one fed from one — which is
  // exactly the thing the product curve is rewarding.
  const bMul = b.buffMul ?? 1
  if (bMul > 1.001) {
    // Floored, then ramped. A single banner is the COMMON case and a linear
    // ramp put it at 0.17 — invisible against the block's own accent trim, which
    // meant the one thing the player has to see in order to learn the mechanic
    // was the one thing they could not. The floor makes "buffed at all" legible;
    // the ramp is what still separates one banner from four.
    const heat = 0.42 + 0.58 * Math.min(1, (bMul - 1) / 1.45)
    const pulse = 0.72 + 0.28 * Math.sin(t / 620 + b.uid * 1.7)
    // Path fill, not clip + fillRect — see the note on the reinforced sweep.
    if (shineOn && size >= SHINE_MIN_PX) {
      const glow = ctx.createLinearGradient(0, fh / 2, 0, -fh / 2)
      glow.addColorStop(0, `rgba(255, 226, 140, ${0.38 * heat * pulse})`)
      glow.addColorStop(1, `rgba(214, 240, 255, ${0.12 * heat * pulse})`)
      const prevOp = ctx.globalCompositeOperation
      ctx.globalCompositeOperation = 'lighter'
      ctx.fillStyle = glow
      roundRect(ctx, -fw / 2, -fh / 2, fw, fh, size * 0.1)
      ctx.fill()
      ctx.globalCompositeOperation = prevOp
    }

    roundRect(ctx, -fw / 2, -fh / 2, fw, fh, size * 0.1)
    ctx.strokeStyle = `rgba(255, 240, 190, ${(0.4 + 0.5 * heat) * pulse})`
    ctx.lineWidth = Math.max(1, size * (0.03 + 0.035 * heat))
    ctx.stroke()
  }

  ctx.restore()

  // Roof caps sit above the block body and outside its cells — one gable per
  // column of the TOP row, so a fused wall is roofed end to end.
  const topY = cy - fh / 2 + size / 2
  if (b.roof) {
    for (let ix = 0; ix < cw; ix++) {
      drawRoof(ctx, cx - fw / 2 + size * (ix + 0.5), topY, size)
    }
  }
}

/**
 * The per-block SECOND pass: the gun, and everything else that has to sit on
 * top of the tower rather than inside it.
 *
 * Split out of `drawBlock` because a weapon mount is bigger than the cell it
 * stands on. The gun art overflows its footprint by design — a carriage, a
 * barrel and two wheels do not fit inside one crate — so while it was drawn
 * with the block body, ANY block that happened to be drawn later painted over
 * it. Map order is placement order, so whether your cannon had a barrel came
 * down to whether you built the wall beside it before or after the gun.
 *
 * The same argument covers the burn, the hit flash, the HP bar and the badges:
 * every one of them is a readout ABOUT the block, and a readout half-hidden
 * behind the neighbour is worse than no readout.
 *
 * Runs after every body and before the enemies, so mounts stack over the tower
 * but still pass under the units, projectiles and VFX in front of it.
 */
const drawBlockOverlays = (ctx: CanvasRenderingContext2D, b: Block, t: number): void => {
  // Hulls draw their own gun inside `drawShip` and carry their badges with it.
  if (isShip(b.typeId)) return

  const zoom = getZoom()
  const size = zoom
  const cw = spanW(b)
  const ch = spanH(b)
  const fw = size * cw
  const fh = size * ch
  const cx = worldToScreenX(centreX(b))
  const cy = worldToScreenY(centreY(b))
  // ONE gun for the whole span, CENTRED on the footprint in both axes.
  //
  // The lift is only what the art overflows below the footprint's underside: a
  // 2.2-cell gun on a 2×2 bastion barely spills at all and sits dead centre,
  // while a big gun on a one-cell-tall 4×1 weld would otherwise have half its
  // carriage buried in the ground.
  //
  // Blitted from a cached sprite rather than re-drawn — see the fixture cache.
  const artSpan = fixtureArtSpan(b)
  {
    const fs = size * artSpan
    const fy = cy - size * (Math.max(0, (artSpan - ch) / 2) * 0.6)
    blitFixture(ctx, b, cx, fy, fs, t)
    if (tierOf(b.tier) >= 3 && shineOn && size >= SHINE_MIN_PX && blockDef(b.typeId).weapon) {
      drawTierTwinkle(ctx, b, cx, fy, fs, t)
    }
  }

  // Burning — a molotov left this block alight and it is still losing HP.
  //
  // Drawn from a handful of cheap sine-driven tongues rather than particles:
  // a fire that lasts five seconds on a dozen blocks at once would otherwise
  // dominate the particle budget for the whole wave, and the flame has to keep
  // burning during the build phase where nothing else is emitting.
  if (b.burnMs && b.burnMs > 0) {
    // Fade the last 700 ms so the fire visibly dies rather than blinking out.
    const fade = Math.min(1, b.burnMs / 700)
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = fade
    const seed = b.c * 3.7 + b.r * 1.9
    const tongues = 5 * cw
    for (let i = 0; i < tongues; i++) {
      const ph = t / 190 + seed + i * 1.27
      const fx = cx + (i / (tongues - 1) - 0.5) * fw * 0.62 + Math.sin(ph * 1.7) * size * 0.06
      const base = cy + fh * 0.42
      const hgt = size * (0.36 + 0.24 * (0.5 + 0.5 * Math.sin(ph)))
      const wid = size * 0.15

      const g = ctx.createLinearGradient(fx, base, fx, base - hgt)
      g.addColorStop(0, 'rgba(255,120,20,0.85)')
      g.addColorStop(0.45, 'rgba(255,186,60,0.7)')
      g.addColorStop(1, 'rgba(255,244,200,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(fx - wid, base)
      ctx.quadraticCurveTo(fx - wid * 0.5, base - hgt * 0.55, fx + Math.sin(ph * 2.3) * wid * 0.5, base - hgt)
      ctx.quadraticCurveTo(fx + wid * 0.6, base - hgt * 0.5, fx + wid, base)
      ctx.closePath()
      ctx.fill()
    }
    // Ember glow washing over the block face, so the block itself looks hot.
    const gr = Math.max(fw, fh) * 0.8
    const glow = ctx.createRadialGradient(cx, cy + size * 0.2, 0, cx, cy + size * 0.2, gr)
    glow.addColorStop(0, 'rgba(255,120,30,0.3)')
    glow.addColorStop(1, 'rgba(255,90,20,0)')
    ctx.fillStyle = glow
    ctx.beginPath(); ctx.arc(cx, cy + size * 0.2, gr, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }

  // Hit flash — a warm-white wash over the block.
  //
  // Additive at 0.7 blew the whole cell out to flat white and took the material
  // with it, so a struck block briefly stopped reading as wood or stone. Half
  // that, in a slightly warm tone, still punches at 60 fps while leaving the
  // block recognisable.
  if (b.flash > 0.02) {
    ctx.save()
    ctx.globalAlpha = Math.min(1, b.flash) * 0.42
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = '#fff4d8'
    roundRect(ctx, cx - fw / 2, cy - fh / 2, fw, fh, size * 0.12)
    ctx.fill()
    ctx.restore()
  }

  // Damage bar — only on wounded blocks, and never on debris. It spans the
  // footprint, which is also the clearest read of how much block is at stake.
  if (b.hp < b.maxHp) {
    drawHpBar(ctx, cx, cy - fh / 2 - size * 0.1, fw * 0.72, Math.max(2, size * 0.07),
      b.hp / b.maxHp, b.typeId === GATE_ID)
  }
  if (b.typeId === GATE_ID) drawGateAlarm(ctx, cx, cy, fw, fh, size, performance.now())

  // ── Merge tier ──
  if (tierOf(b.tier) > 1) {
    drawTierPlate(ctx, tierOf(b.tier), cx + fw / 2 - size * 0.2, cy - fh / 2 + size * 0.17, size)
  }

  // Upgrade rank, in the bottom-left corner — see `rankInsignia`.
  const rank = b.level ?? 0
  if (rank > 0) drawRankInsignia(ctx, rank, cx - fw / 2 + size * 0.14, cy + fh / 2 - size * 0.14, size)
}

// ─── Rank insignia ──────────────────────────────────────────────────────────
//
// A block's rank, bought with run gold, worn like a soldier's: one, two and
// three CHEVRONS, then a LIEUTENANT'S STAR, then a MAJOR'S LAUREL WREATH around
// the star. Stacking a fourth and fifth chevron made the top ranks look like
// more of the same — five notches is just a taller pile than three — when the
// last two are the most expensive purchases on the block. A new SHAPE says a
// new standing; a playtest's first question about a star was what it took to
// get one.
//
// Pictures rather than numbers: at 20 px a cell no digit is legible, but a
// notch count, a star and a wreath all are, from across the tower.

export type RankInsignia =
  | { kind: 'chevrons'; n: number }
  | { kind: 'star' }
  | { kind: 'wreath' }

/** What rank `rank` wears, or null for an unranked block. */
export const rankInsignia = (rank: number): RankInsignia | null => {
  if (rank <= 0) return null
  if (rank <= 3) return { kind: 'chevrons', n: rank }
  return rank === 4 ? { kind: 'star' } : { kind: 'wreath' }
}

/**
 * The insignia's box around its anchor, in cells: `left`/`top` are how far the
 * box reaches left of and above the anchor. Wide and tall enough for a wreath
 * — the biggest of them — with its outline.
 */
const RANK_BOX = { left: 0.26, top: 0.46, w: 0.64, h: 0.62 } as const
/** Baked at this cell size and scaled on the blit — one bitmap per rank for
 *  the life of the page, never a re-bake while the desktop camera zooms. */
const RANK_BAKE_PX = 96
const rankCache = new Map<string, HTMLCanvasElement>()

const INSIGNIA_INK = 'rgba(0,0,0,0.75)'
const INSIGNIA_GOLD = '#ffd93c'

/** A five-point star centred on (x, y), outer radius `r`. */
const starPath = (c: CanvasRenderingContext2D, x: number, y: number, r: number): void => {
  c.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 === 0 ? r : r * 0.42
    const px = x + Math.cos(a) * rr
    const py = y + Math.sin(a) * rr
    if (i === 0) c.moveTo(px, py)
    else c.lineTo(px, py)
  }
  c.closePath()
}

/** A gold star with a dark keyline under it, as the chevrons have. */
const paintStar = (c: CanvasRenderingContext2D, x: number, y: number, r: number, s: number): void => {
  starPath(c, x, y, r)
  c.lineJoin = 'round'
  c.strokeStyle = INSIGNIA_INK
  c.lineWidth = s * 0.07
  c.stroke()
  const g = c.createLinearGradient(x, y - r, x, y + r)
  g.addColorStop(0, '#fff4b0')
  g.addColorStop(0.5, INSIGNIA_GOLD)
  g.addColorStop(1, '#c98a12')
  c.fillStyle = g
  c.fill()
}

/** Paint `rank`'s insignia around the anchor at (0, 0), cell size `s`. */
const paintRankInsignia = (c: CanvasRenderingContext2D, rank: number, s: number): void => {
  const ins = rankInsignia(rank)
  if (!ins) return
  c.lineCap = 'round'
  c.lineJoin = 'round'
  if (ins.kind === 'chevrons') {
    // Separated from the block behind it by a dark UNDER-STROKE, not by a
    // shadow — `shadowBlur` is the most expensive thing a 2D canvas can be
    // asked for. Fat and dark, then thin and gold: the same read for two
    // ordinary strokes.
    const w = s * 0.11
    for (const [colour, width] of [[INSIGNIA_INK, s * 0.105], [INSIGNIA_GOLD, s * 0.055]] as const) {
      c.strokeStyle = colour
      c.lineWidth = width
      for (let i = 0; i < ins.n; i++) {
        const y = -i * s * 0.11
        c.beginPath()
        c.moveTo(-w, y)
        c.lineTo(0, y - w * 0.8)
        c.lineTo(w, y)
        c.stroke()
      }
    }
    return
  }
  // Star and wreath share a centre a little up and in from the corner, so the
  // insignia grows out of the same spot the chevrons stacked from.
  const x = s * 0.05
  const y = -s * 0.15
  if (ins.kind === 'star') {
    paintStar(c, x, y, s * 0.16, s)
    return
  }
  // The wreath: two laurel branches rising from a knot under the star and
  // curving up either side of it, leaves pointing along the branch. Drawn in
  // two passes like everything else here — every leaf's dark keyline first,
  // then every leaf's gold — so the branch reads as one inked shape.
  const R = s * 0.2
  const leaves: Array<[number, number, number]> = []
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      // From the knot at the bottom (a = 90°) up to the top (a ≈ -40° / 220°).
      const k = (i + 0.6) / 5.4
      const a = Math.PI / 2 - side * k * (Math.PI * 0.78)
      const lx = x + Math.cos(a) * R
      const ly = y + Math.sin(a) * R
      // Along the branch, tipped outward.
      const tangent = a - side * Math.PI / 2
      leaves.push([lx, ly, tangent + side * 0.45])
    }
  }
  const leaf = (lx: number, ly: number, rot: number, grow: number): void => {
    c.beginPath()
    c.ellipse(lx, ly, s * 0.058 + grow, s * 0.028 + grow, rot, 0, Math.PI * 2)
  }
  c.fillStyle = INSIGNIA_INK
  for (const [lx, ly, rot] of leaves) { leaf(lx, ly, rot, s * 0.022); c.fill() }
  c.fillStyle = INSIGNIA_GOLD
  for (const [lx, ly, rot] of leaves) { leaf(lx, ly, rot, 0); c.fill() }
  // The knot the two branches are tied with.
  c.beginPath()
  c.arc(x, y + R, s * 0.04, 0, Math.PI * 2)
  c.fillStyle = INSIGNIA_INK
  c.fill()
  c.beginPath()
  c.arc(x, y + R, s * 0.022, 0, Math.PI * 2)
  c.fillStyle = INSIGNIA_GOLD
  c.fill()
  // And the lieutenant's star it was earned on top of, held inside it.
  paintStar(c, x, y - s * 0.01, s * 0.105, s)
}

const rankSprite = (rank: number): HTMLCanvasElement => {
  const ss = Math.min(2, Math.max(1, tintDpr || 1))
  const key = `${rank}|${ss}`
  const hit = rankCache.get(key)
  if (hit) return hit
  const P = RANK_BAKE_PX
  const cv = document.createElement('canvas')
  cv.width = Math.max(1, Math.round(RANK_BOX.w * P * ss))
  cv.height = Math.max(1, Math.round(RANK_BOX.h * P * ss))
  const c = cv.getContext('2d')!
  c.scale(ss, ss)
  c.translate(RANK_BOX.left * P, RANK_BOX.top * P)
  paintRankInsignia(c, rank, P)
  rankCache.set(key, cv)
  return cv
}

/** Blit `rank`'s insignia with its anchor at (ax, ay), for cell size `size`. */
const drawRankInsignia = (
  ctx: CanvasRenderingContext2D, rank: number, ax: number, ay: number, size: number
): void => {
  if (rank <= 0) return
  const sp = rankSprite(Math.min(rank, 5))
  ctx.drawImage(sp, ax - RANK_BOX.left * size, ay - RANK_BOX.top * size, RANK_BOX.w * size, RANK_BOX.h * size)
}

// ─── Reflection ─────────────────────────────────────────────────────────────

/**
 * Mirror the tower into the water strip below the ground line. Cheap version of
 * a real reflection: re-draw the blocks flipped, at low alpha, with a horizontal
 * sine wobble applied per scanline band.
 *
 * Two gates, and they answer different questions. `renderProfile.reflection` is
 * the device's standing answer, decided at boot and never revisited — a phone
 * simply does not draw the tower twice. `quality` is the rolling tier, which
 * still takes it away from a desktop that has started to struggle. Without the
 * first gate a phone got the reflection for as long as its opening seconds
 * looked fast, then lost it mid-wave, then got it back: the tower's mirror
 * blinking in and out is more distracting than never having had one.
 */
const drawReflection = (ctx: CanvasRenderingContext2D, t: number): void => {
  if (!fxReflection || quality.value !== 'high') return
  const zoom = getZoom()
  const h = ctx.canvas.height

  // Clip to the WATER only. Mirroring onto the strip of grass in front of the
  // tower made the land look like a second lake.
  const seaY = worldToScreenY(SEA_LEVEL)
  if (seaY > h) return
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, seaY, ctx.canvas.width, h - seaY)
  ctx.clip()
  ctx.globalAlpha = 0.22
  ctx.translate(0, seaY * 2)
  ctx.scale(1, -1)
  // Slow horizontal shear makes the mirrored image ripple.
  ctx.transform(1, 0, Math.sin(t / 900) * 0.02, 1, 0, 0)

  for (const b of getTowerBlocks().values()) {
    // Hulls are already sitting ON the surface; mirroring one would print a
    // second boat upside-down through the one the player is looking at.
    if (isShip(b.typeId)) continue
    const size = zoom
    // Same single big box as the real thing — a mirror that tiled while the
    // block above it did not would give the merge away as a trick.
    const fw = size * spanW(b)
    const fh = size * spanH(b)
    const sprite = blockFace(b.typeId, damageStage(b), Math.max(fw, fh))
    const cx = worldToScreenX(centreX(b))
    const cy = worldToScreenY(centreY(b))
    ctx.drawImage(sprite, cx - fw / 2, cy - fh / 2, fw, fh)
    if (b.roof) {
      const top = b.r + spanH(b) - 1
      for (let ix = 0; ix < spanW(b); ix++) {
        drawRoof(ctx, worldToScreenX(b.c + ix), worldToScreenY(top + 0.5), size)
      }
    }
  }

  ctx.restore()
  ctx.globalAlpha = 1
}

// ─── Public API ─────────────────────────────────────────────────────────────

// ─── Render profile ─────────────────────────────────────────────────────────
//
// What the device can afford, decided once at boot by the scene (see
// `useDeviceTier`). The desktop scene never sets one, so these defaults ARE the
// desktop's behaviour.

let renderProfile: RenderProfile = {
  dpr: 2, drawEvery: 1, shine: true, particleCap: null, textCap: null,
  dayCycle: true, staticDayPhase: 0.18, reflection: true, grain: true
}

// ─── Backdrop fidelity, resolved once ───────────────────────────────────────
//
// The profile decides; a `?perf.<name>=on|off` from the A/B runner overrides
// exactly one decision so a rep can measure it in isolation. Both are read at
// module load / `setRenderProfile` time and cached in plain module bindings —
// a flag consulted inside the frame would be the regression under measurement.
// See `perfVariants.ts` and PERF-LEDGER.md.
const OV_STATICSKY = override('staticsky')
const OV_BAKEDSKY = override('bakedsky')
const OV_REFLECTION = override('reflection')
const OV_GRAIN = override('grain')

let fxDayCycle = true
let fxStaticPhase = 0.18
let fxBakedSky = false
let fxReflection = true
let fxGrain = true

const applyFidelity = (p: RenderProfile): void => {
  fxDayCycle = OV_STATICSKY === null ? p.dayCycle : !OV_STATICSKY
  fxStaticPhase = p.staticDayPhase
  fxReflection = OV_REFLECTION === null ? p.reflection : OV_REFLECTION
  fxGrain = OV_GRAIN === null ? p.grain : OV_GRAIN
  // Baking the sky into the cached layer is only sound while that sky is
  // standing still. A moving sun behind a cached backdrop would either freeze
  // mid-arc or drag the whole scenery re-bake along with it — which is the
  // cost this was removing in the first place.
  const wants = OV_BAKEDSKY === null ? !fxDayCycle : OV_BAKEDSKY
  fxBakedSky = wants && !fxDayCycle
  // The cached layer's contents now depend on these, so anything already baked
  // under the old answers has to go.
  bgKey = ''
}

export const setRenderProfile = (p: RenderProfile): void => {
  renderProfile = p
  applyFidelity(p)
  setParticleCap(p.particleCap)
  setTextCap(p.textCap)
}


/**
 * Only these monster designs are pre-baked, or null for the whole cast.
 *
 * The bake costs ~10 ms a frame per design and ~1.7 MB of canvas each; a mode
 * that fields nine enemies has no use for the other eight.
 */
let monsterPrimeFilter: string[] | null = null
export const setMonsterPrimeFilter = (ids: string[] | null): void => { monsterPrimeFilter = ids }

/**
 * ─── Scenery hulls: the intro's fleet ───────────────────────────────────────
 *
 * Ships moored far out on the lake, drawn and nothing else. The opening
 * cutscene sails a flotilla of each hull type past the horde so a first-time
 * player has seen a galley before they have any idea the harbour exists — the
 * whole purpose is the thought "wait, can I build those?", which is the one
 * question a tech tree cannot ask on the player's behalf.
 *
 * They are NOT blocks. A hull in the `blocks` map would be part of the tower:
 * counted by `blockCount`, measured by `towerBounds` (which would drag the
 * camera's auto-fit forty cells west the moment the cutscene ended), priced
 * into `measureTower`, saved into the run snapshot, and shot at. So the
 * renderer keeps its own list and the simulation never learns they exist.
 *
 * `drawBlock`'s ship branch is reused rather than reimplemented, because the
 * point is that these are the REAL hulls — same painted art, same roll on the
 * swell, same waterline clip. It early-returns for `isShip`, so none of the
 * block machinery below it (damage stages, buff aura, merge plate) is reached.
 */
let decorShips: Block[] = []

/**
 * Stand a scenery fleet on the water. Pass `[]` to strike it.
 *
 * Shaped as plain `Block`s so they can go straight through `drawBlock`. They
 * must be undamaged (`hp === maxHp`) and tier 1 or that branch draws a health
 * bar and a tier plate over decoration, and `bornAt` must be in the past or
 * they arrive doing the placement squash of a block the player just built.
 */
export const setDecorShips = (ships: readonly Block[]): void => {
  decorShips = [...ships]
}

let lastFrame = 0

/**
 * Draw one frame. `dtMs` is the real elapsed time; the caller has already
 * stepped the simulation.
 */
let monstersPrimed = false

export const drawScene = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dtMs: number,
  dpr: number
): void => {
  const t = nowMs()
  // Monster strips bake in idle time. Priming the whole cast up front is safe:
  // the build phase gives it orders of magnitude more idle than the ~620 ms of
  // work involved, and anything still unbaked draws its older body.
  perf.phase('prime')
  if (!monstersPrimed) {
    monstersPrimed = true
    // Bake only. The strips — and every other painted bitmap — are fetched by
    // `artPreload` in debut order: behind the splash for what wave 1 can put
    // on screen, on idle slots at low priority for the rest. Firing all sixty
    // probes from here on the first frame was how a first-time player paid
    // for the trebuchet at wave 0.
    primeMonsterSprites(monsterPrimeFilter ?? allMonsterIds(), { fetch: false })
  }
  perf.phase('vfx')
  tintDpr = dpr
  if (fixtureDpr !== dpr) {
    fixtureDpr = dpr
    fixtureCache.clear()
    siegeCache.clear()
    plateCache.clear()
  }
  shineOn = renderProfile.shine && getTowerBlocks().size <= SHINE_MAX_BLOCKS
  sampleFrame(dtMs)
  updateCamera(dtMs)

  // Translate this tick's simulation events into presentation.
  for (const ev of drainFx()) consumeFx(ev)
  stepParticles(dtMs)
  stepTexts(dtMs)
  stepDecals(dtMs)
  for (let i = arrowVolleys.length - 1; i >= 0; i--) {
    const v = arrowVolleys[i]!
    v.age += dtMs
    if (v.age >= v.life) arrowVolleys.splice(i, 1)
  }
  for (let i = lightningBolts.length - 1; i >= 0; i--) {
    lightningBolts[i]!.life -= dtMs
    if (lightningBolts[i]!.life <= 0) lightningBolts.splice(i, 1)
  }
  for (let i = blasts.length - 1; i >= 0; i--) {
    blasts[i]!.life -= dtMs
    if (blasts[i]!.life <= 0) blasts.splice(i, 1)
  }
  for (let i = muzzles.length - 1; i >= 0; i--) {
    muzzles[i]!.life -= dtMs
    if (muzzles[i]!.life <= 0) muzzles.splice(i, 1)
  }
  if (screenFlash > 0) screenFlash = Math.max(0, screenFlash - dtMs / 260)

  ctx.clearRect(0, 0, w, h)

  // 1–4. Cached background.
  //
  // Two shapes, depending on the profile:
  //   • desktop    — live sky, then the cached scenery copied over it
  //   • baked sky  — sky inside the cache, so the frame is one copy
  perf.phase('backdrop')
  if (!fxBakedSky) drawSky(ctx, w, h)
  renderBackground(w, h, dpr)
  if (bgCanvas) ctx.drawImage(bgCanvas, 0, 0, w, h)
  // Summer-night fireflies over the flower bed: a dozen small blits of one
  // baked glow, nothing by day, and never on the baked-sky (phone) profile.
  if (!fxBakedSky) paintFireflies(ctx, w, h, worldToScreenY(0), t)

  const zoom = getZoom()
  const rect = viewRect()

  // 5. Reflection (under everything else on the ground).
  drawReflection(ctx, t)

  // 6. Ground decals.
  //
  // A fresh radial gradient per decal per frame, and it stays that way: a
  // cached alpha-ramp sprite scaled into place measured no better and possibly
  // worse (PERF-LEDGER.md E13). A GPU rasterises a small radial about as
  // cheaply as it filters a scaled blit, and the sprite path wanted a
  // `globalAlpha` set and reset around every one.
  for (const d of getDecals()) {
    const a = (d.life / d.maxLife) * d.dark
    if (a <= 0.02) continue
    const x = worldToScreenX(d.x)
    const y = worldToScreenY(d.y)
    const g = ctx.createRadialGradient(x, y, 0, x, y, d.r * zoom)
    // Sandbox Tower: a damp, scuffed patch of wet sand (`#8d673a`-ish), not a
    // black scorch — nothing in the sandbox burns a crater.
    g.addColorStop(0, `rgba(112,78,40,${a})`)
    g.addColorStop(1, 'rgba(112,78,40,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.ellipse(x, y, d.r * zoom, d.r * zoom * 0.34, 0, 0, Math.PI * 2); ctx.fill()
  }

  // 7a. Air enemies BEHIND the tower — depth without a z-buffer.
  //
  // Bombers are excluded: they fly ABOVE the crown, not around it, so hiding
  // one behind the tower when it happens to cross the centre column would put
  // the thing currently dropping bombs on the player out of sight.
  const enemies = getEnemies()
  for (const e of enemies) {
    const d = enemyDef(e.typeId)
    if (d.movement !== 'air' || d.bombRun) continue
    if (e.x < rect.l - 3 || e.x > rect.r + 3) continue
    if (Math.abs(e.x) < 1.2) drawEnemy(ctx, e, t)
  }

  perf.phase('blocks')
  // 7a-ii. The intro's scenery fleet, if one is moored (see `setDecorShips`).
  //
  // Before the tower and before the enemies: these sit far out on the water and
  // are backdrop, so anything nearer has to paint over them. Culled on x alone
  // — they are all on the water row, which the frame either includes or does
  // not — and the list is empty on every frame of every normal game.
  for (const ship of decorShips) {
    if (ship.c < rect.l - 2 || ship.c > rect.r + 2) continue
    drawBlock(ctx, ship, t)
  }

  // 7b. Block BODIES — culled to the visible rect.
  for (const b of getTowerBlocks().values()) {
    if (b.c + spanW(b) - 1 < rect.l - 1 || b.c > rect.r + 1) continue
    if (b.r + spanH(b) - 0.5 < rect.b - 1 || b.r + 0.5 > rect.t + 1) continue
    drawBlock(ctx, b, t)
  }
  // Collapsing debris draws with the tower so it tumbles in-plane.
  for (const b of getDebris()) {
    const f = b.falling!
    drawBlock(ctx, b, t, f.dy, f.rot, f.dx)
  }

  // 7b-ii. Weapon mounts and per-block readouts, over EVERY body.
  //
  // A separate pass because a gun is bigger than the cell it stands on, so
  // drawing it with its own block let the next block in map order paint over
  // the barrel — and map order is placement order, which made it look random.
  // See `drawBlockOverlays`. Still before the enemies, so a mount is part of
  // the tower rather than something floating in front of the battle.
  //
  // The cull is a cell wider than the body pass on purpose: a mount whose block
  // is just off-screen still has half a carriage inside the frame.
  for (const b of getTowerBlocks().values()) {
    if (b.c + spanW(b) - 1 < rect.l - 2 || b.c > rect.r + 2) continue
    if (b.r + spanH(b) - 0.5 < rect.b - 2 || b.r + 0.5 > rect.t + 2) continue
    drawBlockOverlays(ctx, b, t)
  }

  // 7b-iii. Ghosts of blocks that just died, where they stood — under the
  // enemies, so whatever broke through is drawn in front of the gap it made.
  // Cues run on the page clock, not the run clock (see `useWorldCues`).
  const cueNow = performance.now()
  if (!CLEAN_FEED) drawLostMarks(ctx, zoom, cueNow)

  perf.phase('enemies')
  // 7c. Everything else in front.
  for (const e of enemies) {
    if (e.x < rect.l - 3 || e.x > rect.r + 3) continue
    const d = enemyDef(e.typeId)
    const behind = d.movement === 'air' && !d.bombRun && Math.abs(e.x) < 1.2
    if (behind) continue // already drawn behind the tower
    drawEnemy(ctx, e, t)
  }

  // 7d. Allies, in front of the enemies they are riding into.
  for (const a of getAllies()) drawAlly(ctx, a, t)

  // 8. Muzzle flashes, over the barrels that made them.
  for (const m of muzzles) drawMuzzle(ctx, m)

  // 8a. Projectiles.
  for (const p of getProjectiles()) drawProjectile(ctx, p)
  for (const bolt of lightningBolts) drawLightning(ctx, bolt)

  // 8b. Drawn impact blasts — over the monster that was hit, under the embers.
  for (const b of blasts) drawBlast(ctx, b)

  // 8c. A called arrow volley, over everything it is falling onto — it comes
  // from above the frame, so anything it drew UNDER would be standing on top of
  // arrows that had not reached it yet.
  for (const v of arrowVolleys) drawArrowVolley(ctx, v)

  perf.phase('particles')
  // 9. Particles.
  drawParticles(ctx, worldToScreenX, worldToScreenY, zoom)

  // 10. Floating combat text.
  //
  // The recorder no-ops `fillText`, so a clean feed would draw nothing here
  // anyway — skipped outright so it does not pay for the stroke-then-fill pass
  // per number on a 900-frame capture.
  if (!CLEAN_FEED) drawFloatingTexts(ctx, zoom)

  // 10a. "Nothing can reach it" marks, over the enemies they are about.
  if (!CLEAN_FEED) drawStrandedMarks(ctx, enemies, zoom, cueNow)

  perf.phase('overlay')
  // 11. Build UI — the placement grid, the ghost cell, the drop ghost, the
  // merge preview and the off-screen edge arrows. All interface.
  if (phase.value !== 'defeat' && !CLEAN_FEED) drawBuildOverlay(ctx, t)

  // Full-screen flash for lightning / wave start / gate fall.
  if (screenFlash > 0.01) {
    ctx.fillStyle = `rgba(255,255,255,${screenFlash})`
    ctx.fillRect(0, 0, w, h)
  }

  // Speed-up vignette so 2× is unmistakable.
  if (gameSpeed.value > 1 && phase.value === 'battle') {
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75)
    v.addColorStop(0, 'rgba(0,0,0,0)')
    v.addColorStop(1, 'rgba(255,140,40,0.13)')
    ctx.fillStyle = v
    ctx.fillRect(0, 0, w, h)
  }

  // The Gate is being hit: a red wash on the edge the blow came from.
  drawGateVignette(ctx, w, h, cueNow)

  lastFrame = t
  void lastFrame
}

// ─── World cues ─────────────────────────────────────────────────────────────
//
// What the battlefield SHOWS so nothing has to be said (state and timing live
// in `useWorldCues`; see there for why each exists). All four are cheap by
// construction: a handful of path ops each, nothing cached, nothing allocated
// except the two edge gradients and only on the frames a vignette is up.

/**
 * A ghost of every block that died in the last ~1.2 s, standing where it stood.
 *
 * Dashed and red, with a crack through it: BROKEN, not merely gone — the debris
 * the shatter throws is spectacular and over in half a second, and a player who
 * was looking at the other side of the tower came back to a gap and no idea
 * what used to fill it.
 */
const drawLostMarks = (ctx: CanvasRenderingContext2D, zoom: number, now: number): void => {
  const rect = viewRect()
  const lw = Math.max(1.5, zoom * 0.045)
  for (const m of lostMarkSlots()) {
    const a = lostMarkFade(m, now)
    if (a <= 0) continue
    if (m.x + m.w / 2 < rect.l - 1 || m.x - m.w / 2 > rect.r + 1) continue
    const l = worldToScreenX(m.x - m.w / 2)
    const top = worldToScreenY(m.y + m.h / 2)
    const w = m.w * zoom
    const h = m.h * zoom
    ctx.save()
    ctx.globalAlpha = a
    roundRect(ctx, l + 1, top + 1, w - 2, h - 2, zoom * 0.12)
    ctx.fillStyle = 'rgba(255,70,56,0.16)'
    ctx.fill()
    ctx.setLineDash([zoom * 0.16, zoom * 0.1])
    strokeTwoTone(ctx, lw, 'rgba(24,4,4,0.6)', 'rgba(255,104,88,0.95)')
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.moveTo(l + w * 0.22, top + h * 0.12)
    ctx.lineTo(l + w * 0.48, top + h * 0.44)
    ctx.lineTo(l + w * 0.36, top + h * 0.58)
    ctx.lineTo(l + w * 0.74, top + h * 0.9)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    strokeTwoTone(ctx, Math.max(1.2, zoom * 0.03), 'rgba(24,4,4,0.45)', 'rgba(255,138,118,0.9)')
    ctx.restore()
  }
}

/**
 * The Gate's blink when struck: sharp white and red over its body, drawn in
 * the body's own (hopping) transform so the flash moves with it. A rounded
 * rect is the silhouette — the Gate's face fills its cell.
 */
const drawGateBlink = (
  ctx: CanvasRenderingContext2D, fw: number, fh: number, size: number, now: number
): void => {
  const white = gateBlinkWhite(now)
  const red = gateBlinkRed(now)
  if (white <= 0.01 && red <= 0.01) return
  ctx.save()
  roundRect(ctx, -fw / 2, -fh / 2, fw, fh, size * 0.1)
  if (white > 0.01) {
    ctx.globalAlpha = white
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  }
  if (red > 0.01) {
    ctx.globalAlpha = red
    ctx.fillStyle = '#ff2626'
    ctx.fill()
  }
  ctx.restore()
}

/**
 * The Gate while blows are landing on it: a red outline round its footprint and
 * a red ring round its health bar, beating in time — "this is where you lose".
 * Called from `drawBlockOverlays` with the Gate's own geometry. Under reduced
 * motion the beat stops and the outline simply holds.
 */
const drawGateAlarm = (
  ctx: CanvasRenderingContext2D, cx: number, cy: number,
  fw: number, fh: number, size: number, now: number
): void => {
  // Half of it rings the health BAR, which a clean feed has already taken away
  // — left on, it is a rectangle beating around nothing.
  if (CLEAN_FEED) return
  const k = gateAlarm(now)
  if (k <= 0) return
  const beat = prefersReducedMotion() ? 1 : 0.6 + 0.4 * Math.sin(now / 95)
  const a = Math.min(1, k * 1.4) * beat
  const pad = size * 0.06
  ctx.save()
  roundRect(ctx, cx - fw / 2 - pad, cy - fh / 2 - pad, fw + pad * 2, fh + pad * 2, size * 0.16)
  strokeTwoTone(ctx, Math.max(1.5, size * 0.05), `rgba(40,4,4,${0.55 * a})`, `rgba(255,72,60,${0.95 * a})`)
  const bw = fw * 0.72
  const bh = Math.max(2, size * 0.07)
  const by = cy - fh / 2 - size * 0.1
  roundRect(ctx, cx - bw / 2 - 3, by - 3, bw + 6, bh + 6, bh)
  ctx.lineWidth = Math.max(1.5, size * 0.035)
  ctx.strokeStyle = `rgba(255,90,70,${0.9 * a})`
  ctx.stroke()
  ctx.restore()
}

/**
 * A red wash on the screen edge the Gate's latest blow came from — the phone
 * has no Gate bar in its HUD at all, and on either board the Gate is often
 * off the middle of the player's attention when it starts losing. A blow with
 * no side (a bomb, a fire) washes both edges at a lower strength.
 */
const drawGateVignette = (ctx: CanvasRenderingContext2D, w: number, h: number, now: number): void => {
  const both = vignette(0, now) * 0.6
  const left = Math.max(vignette(-1, now), both)
  const right = Math.max(vignette(1, now), both)
  if (left <= 0.01 && right <= 0.01) return
  const band = Math.max(40, Math.min(w * 0.2, h * 0.35))
  if (left > 0.01) {
    const g = ctx.createLinearGradient(0, 0, band, 0)
    g.addColorStop(0, `rgba(214,28,28,${0.34 * left})`)
    g.addColorStop(1, 'rgba(214,28,28,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, band, h)
  }
  if (right > 0.01) {
    const g = ctx.createLinearGradient(w, 0, w - band, 0)
    g.addColorStop(0, `rgba(214,28,28,${0.34 * right})`)
    g.addColorStop(1, 'rgba(214,28,28,0)')
    ctx.fillStyle = g
    ctx.fillRect(w - band, 0, band, h)
  }
}

/**
 * The "nothing can reach it" mark: a crosshair with a red slash through it.
 *
 * Drawn on its own dark disc because it has to hold over sky, snow and water
 * at every hour of the day cycle — the same reason the build marks are
 * two-tone.
 */
const drawNoReachGlyph = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void => {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r * 1.3, 0, TAU)
  ctx.fillStyle = 'rgba(10,14,26,0.72)'
  ctx.fill()
  ctx.lineCap = 'round'
  ctx.lineWidth = Math.max(1.5, r * 0.18)
  ctx.strokeStyle = '#f4e8e2'
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.72, 0, TAU)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx, cy - r * 1.05); ctx.lineTo(cx, cy - r * 0.42)
  ctx.moveTo(cx, cy + r * 0.42); ctx.lineTo(cx, cy + r * 1.05)
  ctx.moveTo(cx - r * 1.05, cy); ctx.lineTo(cx - r * 0.42, cy)
  ctx.moveTo(cx + r * 0.42, cy); ctx.lineTo(cx + r * 1.05, cy)
  ctx.stroke()
  ctx.lineWidth = Math.max(2, r * 0.26)
  ctx.strokeStyle = '#ff4a42'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.9, cy + r * 0.9)
  ctx.lineTo(cx + r * 0.9, cy - r * 0.9)
  ctx.stroke()
  ctx.restore()
}

/**
 * The mark over every engaged enemy no gun on the tower can hit (the reach
 * scan's list — see `scanUnreachable`). A fight that cannot end reads as a
 * frozen game; a crossed-out crosshair over the enemy says "your guns cannot
 * touch this" in the one place the player is already looking.
 */
const drawStrandedMarks = (
  ctx: CanvasRenderingContext2D, enemies: readonly Enemy[], zoom: number, now: number
): void => {
  if (phase.value !== 'battle') return
  const rect = viewRect()
  const bob = prefersReducedMotion() ? 0 : Math.sin(now / 260)
  const r = Math.max(7, zoom * 0.2) * (1 + 0.05 * bob)
  for (const e of enemies) {
    if (e.dying > 0 || !isStranded(e.uid)) continue
    if (e.x < rect.l - 1 || e.x > rect.r + 1) continue
    const s = enemyDef(e.typeId).scale * zoom
    drawNoReachGlyph(ctx, worldToScreenX(e.x), worldToScreenY(e.y) - s * 1.02 - r, r)
  }
}

const drawFloatingTexts = (ctx: CanvasRenderingContext2D, zoom: number): void => {
  const texts = getTexts()
  if (texts.length === 0) return
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  for (const t of texts) {
    const a = Math.min(1, (t.life / t.maxLife) * 2)
    const px = Math.max(10, t.size * zoom * (t.crit ? 1.35 : 1))
    ctx.font = `900 ${px}px Angry, sans-serif`
    ctx.globalAlpha = a
    const x = worldToScreenX(t.x)
    const y = worldToScreenY(t.y)
    ctx.lineWidth = Math.max(2, px * 0.22)
    ctx.strokeStyle = 'rgba(0,0,0,0.85)'
    ctx.strokeText(t.text, x, y)
    ctx.fillStyle = t.color
    ctx.fillText(t.text, x, y)
  }
  ctx.globalAlpha = 1
}

/**
 * Drop the drawn transients the renderer owns — flashes, blasts, bolts.
 *
 * `resetVfx` only reaches the particle/text/decal pools that live in the VFX
 * module, so without this a mortar that fired the instant the player died had
 * its smoke still hanging over the first frame of the next run.
 */
export const resetDrawnFx = (): void => {
  muzzles.length = 0
  blasts.length = 0
  lightningBolts.length = 0
  arrowVolleys.length = 0
  screenFlash = 0
}

/** Drop every cached sprite. Called when the block theme changes. */
export const invalidateSprites = (): void => {
  spriteCache.clear()
  fixtureCache.clear()
  siegeCache.clear()
  plateCache.clear()
  bgKey = ''
}

// ── …and whenever the art layer itself changes ──
//
// These caches bake a DECISION, not just pixels: each entry was drawn either
// from a painted bitmap or from the procedural fallback, depending on whether
// the probe had decoded at the moment that bucket was first needed. Probing is
// asynchronous, so the buckets touched during the first second of a run were
// baked before the art arrived — and they kept the drawing for the life of the
// page. Zooming to any OTHER bucket baked a fresh one, with art. The result
// was a tower that showed painted guns at most camera distances and drawn ones
// at a few specific distances, which reads as a rendering fault rather than as
// a cache.
//
// It is also what made `__art.refresh()` look like it did nothing: it forgets
// the probes, but every sprite already baked from a miss survived it.
onArtChanged(invalidateSprites)

// ─── Portrait API, for the art-sheet bench ──────────────────────────────────
//
// `/art-sheets` bakes the whole cast onto a pixel lattice so it can leave the
// renderer and be repainted. It needs the same drawing code the battlefield
// uses — a bench that reimplements the art would be baking a picture of a
// different game — but it does NOT want the battlefield's context: no camera,
// no sprite cache bucketing, no live simulation.
//
// So these are thin adapters, not new art. Each one takes an explicit size and
// an explicit position, calls straight into the private painter, and leaves the
// context exactly as it found it. Nothing below is used at run time.

/** A block's static body, with no fixture and no damage, at an exact size. */
export const paintBlockBody = (
  ctx: CanvasRenderingContext2D, typeId: string, size: number, stage: 0 | 1 | 2 = 0
): void => {
  drawBlockBody(ctx, typeId, stage, size)
}

/**
 * A block face the way the WORLD draws it, for a test scene.
 *
 * `paintBlockBody` below paints the procedural body — the tray tile with its
 * coloured rim — which is not what stands in the tower once art has loaded.
 * This goes through `blockFace`, the one path every world-side block body
 * takes: the painted bitmap when it has decoded, the bake otherwise.
 */
export const paintWorldBlock = (
  ctx: CanvasRenderingContext2D, typeId: string, x: number, y: number, size: number
): void => {
  ctx.drawImage(blockFace(typeId, 0, size), x, y, size, size)
}

/**
 * The battlefield's ground strip — the sand — for a test scene.
 *
 * The painted strip when there is one; otherwise the drawn sand, baked once
 * per band height into a tile (`sandTile`), so a demo that repaints every
 * frame pays one mirrored blit rather than the sand's gradients.
 *
 * Returns FALSE only when neither exists (no 2D canvas at all), so the caller
 * keeps its own drawn ground rather than getting a blank band. That is the
 * whole contract: a scene that assumed the painting was there rendered its
 * tower standing on nothing for the first second of every load.
 *
 * Goes through `tileBand`, not a plain `drawImage` loop, so a bench scene gets
 * the same mirrored repeat the battlefield does — the seam the mirroring exists
 * to hide is exactly the kind of thing a test scene is supposed to reveal, and
 * a private tiling would hide a different one.
 */
export const paintMeadowBand = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, offset = 0
): boolean => {
  const meadow = bgSprite('grass')
  if (meadow?.naturalWidth) {
    tileBand(ctx, meadow, x, y, w, h, offset)
    return true
  }
  const sand = sandTile(h)
  if (!sand) return false
  tileBand(ctx, sand, x, y, w, h, offset)
  return true
}

/**
 * The moving part bolted to a block — barrel, bow, coil, blade, wrench.
 *
 * `aim` and `recoil` are the two things the battlefield varies, so they are the
 * two the bench chooses: a gun frozen at aim 0 points flat along the lane,
 * which is the pose that reads as a weapon in a still.
 */
export const paintBlockFixture = (
  ctx: CanvasRenderingContext2D, typeId: string,
  cx: number, cy: number, s: number,
  opts: {
    aim?: number; recoil?: number; t?: number; seed?: number; layer?: FixtureLayer
  } = {}
): void => {
  const stand = {
    uid: opts.seed ?? 1, c: 0, r: 0, typeId,
    hp: 1, maxHp: 1, cd: 0,
    aim: opts.aim ?? 0, recoil: opts.recoil ?? 0
  } as unknown as Block
  drawFixture(ctx, stand, cx, cy, s, opts.t ?? 0, opts.layer ?? 'all')
}

/**
 * A fixture painted the way the BATTLEFIELD paints it, for a test scene.
 *
 * `paintBlockFixture` above is the bench's painter and goes straight to the
 * drawing — right for a reference sheet, useless for checking what ships,
 * because it never consults the painted bitmap. This is the live path: same
 * cache, same aim buckets, same overrides.
 */
export const paintLiveFixture = (
  ctx: CanvasRenderingContext2D, typeId: string, cx: number, cy: number, s: number,
  opts: { aim?: number; recoil?: number; t?: number; uid?: number; col?: number; tier?: number } = {}
): void => {
  const b = {
    uid: opts.uid ?? 1, c: opts.col ?? 0, r: 0, typeId,
    hp: 1, maxHp: 1, cd: 0, tier: opts.tier ?? 0,
    aim: opts.aim ?? 0, recoil: opts.recoil ?? 0
  } as unknown as Block
  blitFixture(ctx, b, cx, cy, s, opts.t ?? 0)
}

/** A whole hull, for the three ship blocks — they bypass the block body path. */
export const paintShipBlock = (
  ctx: CanvasRenderingContext2D, typeId: string, s: number,
  opts: { aim?: number; t?: number; seed?: number; layer?: ShipLayer } = {}
): void => {
  drawShip(ctx, typeId, s, themedPalette(blockDef(typeId).palette),
    { aim: opts.aim ?? 0, t: opts.t ?? 0, seed: opts.seed ?? 1, layer: opts.layer })
}

/**
 * How wide a merged block's gun is drawn, in cells, for the CANONICAL
 * footprint of a tier — the art-sheet tool has a tier but no block.
 *
 * A tier-n weld covers 2^(n-1) cells, squared up as far as it goes, so its
 * short side is 2^floor((n-1)/2). Agrees with `mergeArtSpan` on every
 * footprint the board actually builds.
 */
export const fixtureSpanForTier = (tier: number): number =>
  tier <= 1 ? 1 : 1.1 * Math.pow(2, Math.floor((tier - 1) / 2))

/**
 * How big a merged WEAPON is drawn, in cells, on the canonical footprint of a
 * tier — `fixtureArtSpan` for a block the art tools and the teaching cards do
 * not have. The canonical ladder widens first (1×1, 2×1, 2×2, 4×2, 4×4), so
 * every even tier is a wide weld and takes the wide growth:
 *
 *   tier   1     2      3     4      5
 *   span   1     1.43   2.2   2.86   4.4
 *
 * Strictly bigger at every rung, which the twin-and-triple composite it
 * replaces only managed by adding barrels.
 */
export const gunSpanForTier = (tier: number): number =>
  fixtureSpanForTier(tier) * (tier >= 2 && tier % 2 === 0 ? GUN_GROWTH_WIDE : 1)

/**
 * The same, on a board whose welds stay in ONE cell (`mergeArt: 'cell'`).
 *
 * There is no footprint to grow into, so the gun used to stay exactly the size
 * of an unmerged one at every tier — a tier-5 weld looked like a tier 1 with a
 * sticker on it. It grows a step per tier and stops at 1.34.
 *
 * The steps are sized against the neighbours, not the gun: a cannon's muzzle
 * reaches 0.57 of its span from the cell's centre, so at 1.34 it spills a
 * quarter of a cell into the next column when it fires sideways — what the
 * triple battery at 1.3 used to spill, now with half its bulk across the
 * barrel. Past that it hides the blocks beside it, which on a five-column board
 * is a fifth of the tower. Tier 2 at 1.2 is the smallest step that still reads
 * as a heavier gun and not the same one.
 */
export const fixtureSpanForCellTier = (tier: number): number =>
  tier <= 1 ? 1 : tier === 2 ? 1.2 : tier === 3 ? 1.28 : 1.34

/** The roof cap a roofed block wears, centred on the cell at (cx, cy). */
export const paintRoof = (
  ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number
): void => {
  drawRoof(ctx, cx, cy, size)
}

/** The riveted steel plate that says how deep a weld goes. */
export const paintTierPlate = (
  ctx: CanvasRenderingContext2D, tier: number, bx: number, by: number, size: number
): void => {
  drawTierPlate(ctx, tier, bx, by, size)
}

/**
 * One projectile, centred in a box of `size` px.
 *
 * `drawProjectile` measures everything off the camera — the round's size is a
 * fraction of the live zoom, and its position comes out of `worldToScreen`.
 * Rather than fake a camera, the transform is inverted: place the round at the
 * world origin, then translate by whatever the camera maps that origin to and
 * scale by the ratio between the size we want and the size the zoom gives. The
 * mapping is affine, so this lands the round dead centre whatever the camera is
 * currently doing.
 *
 * The trail is left EMPTY on purpose. Powder smoke and the ink whisk are VFX
 * that belong to a shot in flight, not to the round as an asset.
 */
export const paintProjectile = (
  ctx: CanvasRenderingContext2D, kind: Projectile['kind'],
  cx: number, cy: number, size: number, t = 0, tier = 1
): void => {
  const zoom = getZoom()
  // A round's art spans roughly 0.32 zoom units; fill about 70% of the cell.
  const k = (size * 0.7) / (zoom * 0.32)
  const round = {
    uid: 7, kind, x: 0, y: 0,
    // A flat rightward velocity: the finned rounds rotate to their heading, and
    // a horizontal one is the pose that reads in a grid.
    vx: 1, vy: 0,
    damage: 1, splash: 0, ballistic: false, targetUid: -1,
    life: t, slowPct: 0, slowMs: 0, sourceUid: -1, trail: [] as number[], tier
  } as unknown as Projectile

  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(k, k)
  ctx.translate(-worldToScreenX(0), -worldToScreenY(0))
  drawProjectile(ctx, round)
  ctx.restore()
}

/** A background tree, standing on `baseY`. */
export const paintTree = (
  ctx: CanvasRenderingContext2D, species: 'conifer' | 'broadleaf',
  x: number, baseY: number, height: number, seed: number
): void => {
  if (species === 'conifer') drawConifer(ctx, x, baseY, height, seed)
  else drawBroadleaf(ctx, x, baseY, height, seed)
}

/**
 * The sun or moon disc with its rays, as a standalone canvas.
 *
 * The wide sky bloom that `drawCelestial` paints behind the body is not part of
 * this — it is a wash across the whole sky and has no meaning inside a cell.
 */
export const celestialDisc = (night: boolean, radius: number, tier: number): HTMLCanvasElement =>
  celestialSprite(night, radius, tier)

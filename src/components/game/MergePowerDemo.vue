<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ENEMY_DEFS } from '@/game/enemies'
import {
  monsterAnchor, monsterFaces, monsterFrame, pickMonster, primeMonsterSprites,
  SPRITE_FOOT_R, SPRITE_HEIGHT_R
} from '@/game/monsterSprites'
import {
  paintLiveFixture, paintMeadowBand, paintProjectile, paintTierPlate, paintWorldBlock,
  fixtureSpanForCellTier, fixtureSpanForTier
} from '@/use/useTowerArt'
import { tierStyle } from '@/game/tierStyle'

/**
 * ─── Merge power demo ───────────────────────────────────────────────────────
 *
 * Six seconds, once, straight after the merge ladder: the same monster is shot
 * by a plain cannon and then by a tier-3 one, and its health bar does the
 * talking. −10 %, then −75 %.
 *
 * WHY IT EXISTS. Players merge once — the tutorial makes them — and then stop
 * at tier 2. The ladder card shows that welds keep going; it does not show why
 * anyone would want them to. A tier-3 gun hits nine times as hard as a plain
 * one, and nothing on the battlefield said so except a small plate in a corner
 * and a number that floats up for a second at the moment of the weld. The one
 * thing every player reads without being taught is a health bar, so the lesson
 * is staged as two shots at one bar.
 *
 * THE NUMBERS UNDERSTATE IT, on purpose. The real ratio is ×9 (`mergePowerMul`):
 * a shot that takes 10 % would take 90 % from a tier 3. The demo says 75 % — a
 * monster that survives the big shot and dies to the next one is a better beat
 * than one that evaporates, and a demo that promises LESS than the game
 * delivers is one the player is pleasantly wrong about.
 *
 * Built the way `TrapTutorial` is — its own canvas, its own scripted clock, and
 * the battlefield's own PAINTERS (`paintWorldBlock`, `paintLiveFixture`,
 * `paintTierPlate`, `paintProjectile`, the monster strips) at the battlefield's
 * arithmetic. So the tier-3 gun here is the tier-3 gun the player will build,
 * twin barrels, colour and all. It reads no game state and writes none: the run
 * behind it is held, not driven.
 *
 * WORDLESS, like every teaching screen in this game. The percentages are
 * formatted by the locale (`Intl.NumberFormat`), so each language writes them
 * its own way, and the only copy is the shared tap-to-continue hint.
 */

interface Props {
  /** Open state. */
  modelValue: boolean
  /**
   * The board the demo stands in for. `footprint` is the desktop tower, where a
   * tier 3 is a 2×2 block carrying a gun twice the size; `cell` is Drop &
   * Merge, where every weld stays in one cell and the gun grows a little per
   * tier. The demo shows each board the gun it actually builds.
   */
  variant?: 'footprint' | 'cell'
}

const props = withDefaults(defineProps<Props>(), { variant: 'footprint' })

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  /** The demo finished, or the player tapped through its second half. */
  (e: 'continue'): void
}>()

const { t, locale } = useI18n()

const isMobile = computed(() =>
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
)

// ─── The staged scene, in cells ─────────────────────────────────────────────
//
// Ground at y = 0, the gun's block on the left, the monster on the right, the
// two result chips across the top. `x` grows right, `y` grows UP, as on the
// board.

const CONTENT_W = 6.6
const CONTENT_H = 4.9
const MARGIN = 0.3
const GROUND_BAND = 0.8

/** The gun's block stands here, its bottom-left corner on the ground. */
const BLOCK_X = 0.2
/** The monster's centre line. It is grown a little: this is a close-up, and the
 *  health bar has to sit over a body big enough to be worth one. */
const MON_X = 5.2
const DEMO_ENEMY = 'brute'
const MON_GROW = 1.3

/** The two tiers being compared, and what each takes off the bar. */
const LOW_TIER = 1
const HIGH_TIER = 3
const HIT_LOW = 0.1
const HIT_HIGH = 0.75

// ─── The beat sheet, ms from open ───────────────────────────────────────────

const B_FIRE_1 = 550
const B_HIT_1 = 900
const B_GHOSTS = 1650
const B_SLAM = 2150
const B_HEALED = 2550
const B_FIRE_2 = 2850
const B_HIT_2 = 3150
const B_FIRE_3 = 3950
const B_HIT_3 = 4250
/** Taps before this are ignored. The lesson is the SECOND shot, and a player
 *  tapping impatiently through the first would skip the only part that
 *  matters — and the click that closed the card before this one lands in the
 *  same window. After it, a tap ends the demo. */
const B_SKIPPABLE = 3350
const B_FADE = 5650
const B_END = 6000

// ─── The gun, as each board builds it ───────────────────────────────────────

interface GunGeom {
  /** Block footprint, in cells. */
  w: number
  h: number
  /** Gun centre, and the span `drawBlockOverlays` would draw it at. */
  x: number
  y: number
  span: number
}

const gunGeom = (tier: number): GunGeom => {
  if (props.variant === 'footprint' && tier >= 3) {
    // The desktop's tier 3: a 2×2 bastion, the gun centred on it at the
    // footprint's short side plus a tenth (`fixtureSpanForTier`).
    const span = fixtureSpanForTier(tier)
    return { w: 2, h: 2, x: BLOCK_X + 1, y: 1 + Math.max(0, (span - 2) / 2) * 0.6, span }
  }
  const span = props.variant === 'cell' ? fixtureSpanForCellTier(tier) : 1
  return { w: 1, h: 1, x: BLOCK_X + 0.5, y: 0.5 + Math.max(0, (span - 1) / 2) * 0.6, span }
}

const monScale = (): number => (ENEMY_DEFS[DEMO_ENEMY]?.scale ?? 0.85) * MON_GROW

/** Aim at the monster's chest, lifted a touch so the barrel reads as a gun. */
const aimFrom = (g: GunGeom): number => Math.atan2(monScale() * 0.5 - g.y, MON_X - g.x) + 0.06

// ─── Mutable scene state (allocated once, reset in place) ───────────────────

interface Mote { x: number; y: number; vx: number; vy: number; r: number; age: number; ttl: number; gold: boolean }
const mote = (): Mote => ({ x: 0, y: 0, vx: 0, vy: 0, r: 0, age: 0, ttl: -1, gold: false })
const sparks: Mote[] = Array.from({ length: 36 }, mote)

/** Deterministic noise, so the demo plays identically every time it is shown. */
let seed = 1
const rnd = (): number => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}

/** Health, 0..1, and the pale "just lost" chunk that drains behind it. */
let hp = 1
let ghostHp = 1
let hitFlash = 0
let shake = 0
let fired1 = false
let hit1 = false
let slammed = false
let fired2 = false
let hit2 = false
let fired3 = false
let hit3 = false
let dyingMs = -1
let recoil = 0
let muzzle = 0

const resetScene = (): void => {
  seed = 1
  hp = 1
  ghostHp = 1
  hitFlash = 0
  shake = 0
  fired1 = hit1 = slammed = fired2 = hit2 = fired3 = hit3 = false
  dyingMs = -1
  recoil = 0
  muzzle = 0
  for (const m of sparks) m.ttl = -1
}

/** Wake up to `n` dead sparks. Never grows the pool: a burst that wants more
 *  than exist simply draws fewer, which nobody can see. */
const burst = (n: number, x: number, y: number, speed: number, gold: boolean): void => {
  let used = 0
  for (const m of sparks) {
    if (used >= n) return
    if (m.ttl > 0 && m.age < m.ttl) continue
    const a = rnd() * Math.PI * 2
    const v = speed * (0.5 + rnd() * 0.8)
    m.x = x
    m.y = y
    m.vx = Math.cos(a) * v
    m.vy = Math.sin(a) * v + (gold ? 2.6 : 0.8)
    m.r = gold ? 0.09 + rnd() * 0.04 : 0.05 + rnd() * 0.05
    m.age = 0
    m.ttl = gold ? 0.9 : 0.45 + rnd() * 0.25
    m.gold = gold
    used++
  }
}

// ─── Canvas and layout ──────────────────────────────────────────────────────

const canvasRef = ref<HTMLCanvasElement | null>(null)
const skippable = ref(false)

let raf = 0
let last = 0
let clockMs = 0
let cell = 40
let originX = 0
let groundY = 0

/** Reduced motion keeps the demo — the lesson IS the motion — and gives up the
 *  impact shake, which is the part that provokes. `TrapTutorial` makes the
 *  same call for the same reason. */
let reduced = false

const cx = (x: number): number => originX + x * cell
const cy = (y: number): number => groundY - y * cell

const easeOut = (k: number): number => 1 - (1 - k) ** 3
const clamp01 = (k: number): number => (k < 0 ? 0 : k > 1 ? 1 : k)

const pct = (v: number): string => {
  try {
    return new Intl.NumberFormat(locale.value, { style: 'percent', signDisplay: 'always' }).format(v)
  } catch {
    return `${v < 0 ? '−' : '+'}${Math.round(Math.abs(v) * 100)}%`
  }
}

const roundRectPath = (
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number
): void => {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

// ─── Painters ───────────────────────────────────────────────────────────────

let monsterId: string | null = null

const drawMonster = (ctx: CanvasRenderingContext2D, ms: number): void => {
  const s = monScale()
  const dieT = dyingMs >= 0 ? clamp01(1 - dyingMs / 380) : 1
  if (dieT <= 0) return
  // A flinch on each hit: shoved away from the gun, springing back.
  const px = cx(MON_X + hitFlash * 0.12)
  const py = cy(s / 2)
  ctx.save()
  ctx.translate(px, py)
  const squash = dyingMs >= 0 ? dieT : 1
  ctx.scale(1 / (0.35 + 0.65 * squash), squash)
  const frame = monsterId ? monsterFrame(monsterId, ms / 900) : null
  if (frame && monsterId) {
    // Facing LEFT, toward the gun. The battlefield authors every design facing
    // right and mirrors by travel; a design painted facing left is already
    // there.
    if (monsterFaces(monsterId) !== 'left') ctx.scale(-1, 1)
    const k = (s * cell * 1.3) / (frame.height * SPRITE_HEIGHT_R)
    const w = frame.width * k
    const h = frame.height * k
    const top = monsterAnchor(monsterId) === 'centre'
      ? -h * 0.5
      : s * cell * 0.5 - frame.height * SPRITE_FOOT_R * k
    ctx.globalAlpha *= dieT
    ctx.drawImage(frame, -w * 0.5, top, w, h)
    if (hitFlash > 0.02) {
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha *= hitFlash * 0.55
      ctx.drawImage(frame, -w * 0.5, top, w, h)
    }
  } else {
    // The strip bakes asynchronously; a silhouette holds the staging until it
    // lands rather than hanging a health bar over empty grass.
    ctx.globalAlpha *= dieT
    ctx.fillStyle = 'rgba(30, 24, 40, 0.9)'
    ctx.beginPath()
    ctx.ellipse(0, s * cell * 0.15, s * cell * 0.35, s * cell * 0.36, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

const drawHpBar = (ctx: CanvasRenderingContext2D): void => {
  if (dyingMs > 300) return
  const s = monScale()
  const w = cell * 1.9
  const h = Math.max(8, cell * 0.24)
  const x = cx(MON_X) - w / 2
  const y = cy(s + 0.42) - h / 2
  ctx.save()
  ctx.fillStyle = 'rgba(8, 10, 18, 0.88)'
  roundRectPath(ctx, x - 2, y - 2, w + 4, h + 4, h / 2 + 2)
  ctx.fill()
  if (ghostHp > hp) {
    ctx.fillStyle = 'rgba(255, 244, 214, 0.9)'
    roundRectPath(ctx, x, y, w * ghostHp, h, h / 2)
    ctx.fill()
  }
  if (hp > 0.001) {
    const low = hp < 0.35
    const g = ctx.createLinearGradient(0, y, 0, y + h)
    g.addColorStop(0, low ? '#ff9a7a' : '#8cf07a')
    g.addColorStop(1, low ? '#d8321e' : '#2f9e2c')
    ctx.fillStyle = g
    roundRectPath(ctx, x, y, w * hp, h, h / 2)
    ctx.fill()
  }
  ctx.restore()
}

/** A floating damage number: pops, rises, fades. */
const drawFloat = (
  ctx: CanvasRenderingContext2D, text: string, sinceMs: number, size: number, fill: string
): void => {
  if (sinceMs < 0 || sinceMs > 1300) return
  const k = sinceMs / 1300
  const pop = sinceMs < 160
    ? 0.6 + 0.6 * easeOut(sinceMs / 160)
    : 1.2 - 0.2 * clamp01((sinceMs - 160) / 200)
  const s = monScale()
  ctx.save()
  ctx.globalAlpha *= k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3
  ctx.translate(cx(MON_X), cy(s + 0.95 + k * 0.7))
  ctx.scale(pop, pop)
  ctx.font = `900 ${Math.round(size * cell)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(3, size * cell * 0.18)
  ctx.strokeStyle = 'rgba(8, 10, 18, 0.92)'
  ctx.strokeText(text, 0, 0)
  ctx.fillStyle = fill
  ctx.fillText(text, 0, 0)
  ctx.restore()
}

/**
 * One result chip — the gun that fired, and what it took — pinned across the
 * top, so the two shots end the demo side by side. That pairing is the lesson;
 * each float on its own is gone in a second.
 */
const drawChip = (
  ctx: CanvasRenderingContext2D, centreX: number, tier: number, text: string,
  sinceMs: number, ms: number
): void => {
  if (sinceMs < 0) return
  const pop = sinceMs < 220 ? easeOut(sinceMs / 220) : 1
  const w = cell * 2.5
  const h = cell * 0.95
  const ts = tierStyle(Math.max(2, tier))
  ctx.save()
  ctx.translate(cx(centreX), cy(CONTENT_H - 0.55))
  ctx.scale(pop, pop)
  ctx.fillStyle = 'rgba(12, 20, 34, 0.9)'
  ctx.strokeStyle = tier > 1 ? ts.hex : 'rgba(255, 255, 255, 0.28)'
  ctx.lineWidth = Math.max(1.5, cell * 0.05)
  roundRectPath(ctx, -w / 2, -h / 2, w, h, h * 0.3)
  ctx.fill()
  ctx.stroke()
  // The gun in its own tier's dress — the twin-and-triple battery IS the
  // badge here, and it is the same battery the tower will show.
  const gunCell = h * 0.82
  const span = props.variant === 'cell' ? fixtureSpanForCellTier(tier) : tier > 1 ? 1.2 : 1
  paintLiveFixture(ctx, 'cannon', -w / 2 + h * 0.62, 0, gunCell * span, {
    aim: 0.12, t: ms, uid: 3 + tier, col: 1, tier
  })
  if (tier > 1) paintTierPlate(ctx, tier, -w / 2 + h * 1.02, -h * 0.28, gunCell)
  ctx.font = `900 ${Math.round(h * 0.5)}px sans-serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(2, h * 0.09)
  ctx.strokeStyle = 'rgba(8, 10, 18, 0.9)'
  ctx.strokeText(text, w / 2 - h * 0.25, h * 0.02)
  ctx.fillStyle = tier > 1 ? ts.plateTop : '#f4f1e8'
  ctx.fillText(text, w / 2 - h * 0.25, h * 0.02)
  ctx.restore()
}

/** A round in flight from the muzzle to the monster, on a shallow arc. */
const drawShot = (ctx: CanvasRenderingContext2D, k: number, tier: number, ms: number): void => {
  const g = gunGeom(tier)
  const aim = aimFrom(g)
  const x0 = g.x + Math.cos(aim) * 0.5 * g.span
  const y0 = g.y + Math.sin(aim) * 0.5 * g.span
  const x1 = MON_X - 0.2
  const y1 = monScale() * 0.5
  const x = x0 + (x1 - x0) * k
  const y = y0 + (y1 - y0) * k + Math.sin(k * Math.PI) * 0.35
  paintProjectile(ctx, 'ball', cx(x), cy(y), cell * (tier > 1 ? 0.55 : 0.42), ms, tier)
}

/** Three plain cannons flying into the block: with the one already there, the
 *  four that make a tier 3. */
const GHOST_FROM: ReadonlyArray<readonly [number, number]> = [[-0.9, 2.5], [0.7, 3.1], [2.3, 2.5]]

const drawGhosts = (ctx: CanvasRenderingContext2D, ms: number): void => {
  if (ms < B_GHOSTS || ms >= B_SLAM) return
  const k = easeOut(clamp01((ms - B_GHOSTS) / (B_SLAM - B_GHOSTS)))
  const to = gunGeom(HIGH_TIER)
  const from = gunGeom(LOW_TIER)
  for (let i = 0; i < GHOST_FROM.length; i++) {
    const [fx, fy] = GHOST_FROM[i]!
    ctx.save()
    ctx.globalAlpha *= 0.55 + 0.45 * k
    paintLiveFixture(ctx, 'cannon', cx(fx + (to.x - fx) * k), cy(fy + (to.y - fy) * k),
      cell * from.span * (1 - 0.25 * k), { aim: aimFrom(from), t: ms, uid: 20 + i, col: 1, tier: 1 })
    ctx.restore()
  }
}

const drawGun = (ctx: CanvasRenderingContext2D, ms: number, fade: number): void => {
  const tier = ms >= B_SLAM ? HIGH_TIER : LOW_TIER
  const g = gunGeom(tier)
  const aim = aimFrom(g)

  // The body, one face stretched over the footprint — as `drawBlock` paints a
  // weld, not the cell sprite tiled.
  const fw = g.w * cell
  const fh = g.h * cell
  const face = Math.max(fw, fh)
  ctx.save()
  ctx.translate(cx(BLOCK_X), cy(g.h))
  ctx.scale(fw / face, fh / face)
  paintWorldBlock(ctx, 'cannon', 0, 0, face)
  ctx.restore()

  paintLiveFixture(ctx, 'cannon', cx(g.x), cy(g.y), cell * g.span, {
    aim, recoil, t: ms, uid: 9, col: 1, tier
  })

  if (tier > 1) {
    // The plate pops in on the weld, riveted where the battlefield rivets it.
    const since = ms - B_SLAM
    const pop = since < 260
      ? 0.4 + 0.6 * easeOut(since / 260) + Math.sin((since / 260) * Math.PI) * 0.25
      : 1
    ctx.save()
    ctx.translate(cx(BLOCK_X + g.w) - cell * 0.2, cy(g.h) + cell * 0.17)
    ctx.scale(pop, pop)
    paintTierPlate(ctx, tier, 0, 0, cell)
    ctx.restore()
  }

  if (muzzle > 0.02) {
    // A flash at every barrel the gun has: one, then three.
    const ts = tierStyle(Math.max(2, tier))
    const offsets = tier > 1 ? [-0.2, 0, 0.2] : [0]
    const reach = 0.55 * g.span
    for (const off of offsets) {
      const mx = g.x + Math.cos(aim) * reach - Math.sin(aim) * off * g.span
      const my = g.y + Math.sin(aim) * reach + Math.cos(aim) * off * g.span
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = fade * muzzle
      ctx.fillStyle = tier > 1 ? ts.plateTop : '#ffe7a8'
      ctx.beginPath()
      ctx.arc(cx(mx), cy(my), cell * (0.12 + 0.14 * muzzle) * (tier > 1 ? 1.25 : 1), 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  // The weld itself: a ring and a flash in the new tier's colour.
  if (ms >= B_SLAM && ms < B_SLAM + 520) {
    const k = (ms - B_SLAM) / 520
    const ts = tierStyle(HIGH_TIER)
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = fade * (1 - k)
    ctx.strokeStyle = ts.hex
    ctx.lineWidth = Math.max(2, cell * 0.12 * (1 - k))
    ctx.beginPath()
    ctx.arc(cx(g.x), cy(g.y), cell * (0.4 + k * 1.3) * Math.max(1, g.w * 0.75), 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = ts.plateTop
    ctx.globalAlpha = fade * (1 - k) * 0.55
    ctx.beginPath()
    ctx.arc(cx(g.x), cy(g.y), cell * 0.8 * (1 - k * 0.5) * Math.max(1, g.w * 0.75), 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

// ─── The frame ──────────────────────────────────────────────────────────────

const step = (prevMs: number, ms: number, dtMs: number): void => {
  const dt = dtMs / 1000
  const crossed = (beat: number): boolean => prevMs < beat && ms >= beat
  const chest = monScale() * 0.5

  if (!fired1 && crossed(B_FIRE_1)) { fired1 = true; recoil = 1; muzzle = 1 }
  if (!hit1 && crossed(B_HIT_1)) {
    hit1 = true
    ghostHp = hp
    hp = 1 - HIT_LOW
    hitFlash = 0.6
    burst(6, MON_X - 0.2, chest, 2.2, false)
  }
  if (!slammed && crossed(B_SLAM)) {
    slammed = true
    shake = reduced ? 0 : 0.35
    const g = gunGeom(HIGH_TIER)
    burst(14, g.x, g.y, 3.6, false)
  }
  if (!fired2 && crossed(B_FIRE_2)) { fired2 = true; recoil = 1; muzzle = 1 }
  if (!hit2 && crossed(B_HIT_2)) {
    hit2 = true
    ghostHp = hp
    hp = 1 - HIT_HIGH
    hitFlash = 1
    shake = reduced ? 0 : 1
    burst(16, MON_X - 0.2, chest, 4.2, false)
  }
  if (!fired3 && crossed(B_FIRE_3)) { fired3 = true; recoil = 1; muzzle = 1 }
  if (!hit3 && crossed(B_HIT_3)) {
    hit3 = true
    ghostHp = hp
    hp = 0
    hitFlash = 1
    shake = reduced ? 0 : 0.7
    dyingMs = 0
    burst(12, MON_X - 0.2, chest, 3.8, false)
    burst(9, MON_X, monScale() * 0.6, 2.4, true)
  }

  // The same monster, whole again, for the second gun — the refill is its own
  // beat, so it is plainly the same bar being tested twice.
  if (ms >= B_SLAM && ms < B_HEALED) {
    hp = 1 - HIT_LOW + HIT_LOW * easeOut((ms - B_SLAM) / (B_HEALED - B_SLAM))
    ghostHp = hp
  } else if (ms >= B_HEALED && ms < B_HIT_2) {
    hp = 1
    ghostHp = 1
  }
  if (ghostHp > hp) ghostHp = Math.max(hp, ghostHp - dt * 0.9)
  hitFlash = Math.max(0, hitFlash - dt * 4)
  recoil = Math.max(0, recoil - dt * 5)
  muzzle = Math.max(0, muzzle - dt * 9)
  shake = Math.max(0, shake - dt * 3.4)
  if (dyingMs >= 0) dyingMs += dtMs
  for (const m of sparks) {
    if (m.ttl <= 0 || m.age >= m.ttl) continue
    m.age += dt
    m.vy -= (m.gold ? 11 : 4) * dt
    m.x += m.vx * dt
    m.y += m.vy * dt
    if (m.y < 0) { m.y = 0; m.vy *= -0.3; m.vx *= 0.6 }
  }
}

const paint = (now: number): void => {
  raf = requestAnimationFrame(paint)

  // The clock runs BEFORE anything is asked of the canvas. This beat holds the
  // tutorial — and on the phone board the wave — until it ends, so a canvas
  // that could not be drawn to (no box yet, a context the browser refused)
  // must still reach its end rather than leave the player behind a scrim.
  //
  // Clamped: a backgrounded tab hands back a multi-second delta, and the beat
  // sheet must not be skipped through in one step.
  const dtMs = last === 0 ? 16 : Math.min(50, now - last)
  last = now
  const prevMs = clockMs
  clockMs += dtMs
  const ms = clockMs

  if (ms >= B_SKIPPABLE && !skippable.value) skippable.value = true
  if (ms >= B_END) { finish(); return }
  step(prevMs, ms, dtMs)

  const cv = canvasRef.value
  if (!cv) return
  const ctx = cv.getContext('2d')
  if (!ctx) return

  // ── Canvas box ──
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const W = cv.clientWidth
  const H = cv.clientHeight
  if (W === 0 || H === 0) return
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
    cv.width = Math.round(W * dpr)
    cv.height = Math.round(H * dpr)
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, W, H)

  // Fit both axes, centred in what the hint leaves, and capped so a desktop
  // does not blow one cannon up into a mural.
  const boxW = CONTENT_W + MARGIN * 2
  const boxH = CONTENT_H + MARGIN + GROUND_BAND
  const avail = H - Math.min(48, H * 0.13)
  cell = Math.min((W * 0.94) / boxW, (avail * 0.94) / boxH, 92)
  originX = (W - cell * boxW) / 2 + cell * MARGIN
  groundY = (avail - cell * boxH) / 2 + cell * (MARGIN + CONTENT_H)

  const fade = ms < 250 ? ms / 250 : ms > B_FADE ? clamp01((B_END - ms) / (B_END - B_FADE)) : 1
  ctx.globalAlpha = fade

  // ── Ground: the battlefield's own meadow where the art layer has one ──
  const band = cell * GROUND_BAND
  if (!paintMeadowBand(ctx, 0, groundY, W, band, originX)) {
    const meadow = ctx.createLinearGradient(0, groundY, 0, groundY + band)
    meadow.addColorStop(0, '#63a34a')
    meadow.addColorStop(0.35, '#4d8a38')
    meadow.addColorStop(1, '#2c5220')
    ctx.fillStyle = meadow
    ctx.fillRect(0, groundY, W, band)
  }

  ctx.save()
  if (shake > 0) {
    const a = shake * shake * cell * 0.16
    ctx.translate((rnd() - 0.5) * a, (rnd() - 0.5) * a)
  }

  drawGun(ctx, ms, fade)
  drawGhosts(ctx, ms)
  drawMonster(ctx, ms)
  drawHpBar(ctx)
  if (fired1 && !hit1) drawShot(ctx, clamp01((ms - B_FIRE_1) / (B_HIT_1 - B_FIRE_1)), LOW_TIER, ms)
  if (fired2 && !hit2) drawShot(ctx, clamp01((ms - B_FIRE_2) / (B_HIT_2 - B_FIRE_2)), HIGH_TIER, ms)
  if (fired3 && !hit3) drawShot(ctx, clamp01((ms - B_FIRE_3) / (B_HIT_3 - B_FIRE_3)), HIGH_TIER, ms)

  for (const m of sparks) {
    if (m.ttl <= 0 || m.age >= m.ttl) continue
    const k = 1 - m.age / m.ttl
    ctx.save()
    ctx.globalAlpha = fade * clamp01(k * 1.5)
    ctx.fillStyle = m.gold ? '#ffd93c' : '#fff1c2'
    ctx.beginPath()
    ctx.arc(cx(m.x), cy(m.y), m.r * cell, 0, Math.PI * 2)
    ctx.fill()
    if (m.gold) {
      ctx.strokeStyle = '#8a6a12'
      ctx.lineWidth = Math.max(1, cell * 0.02)
      ctx.stroke()
    }
    ctx.restore()
  }

  drawFloat(ctx, pct(-HIT_LOW), ms - B_HIT_1, 0.42, '#fff4d8')
  drawFloat(ctx, pct(-HIT_HIGH), ms - B_HIT_2, 0.7, tierStyle(HIGH_TIER).plateTop)
  ctx.restore()

  // ── The verdict, side by side ──
  drawChip(ctx, CONTENT_W * 0.27, LOW_TIER, pct(-HIT_LOW), ms - (B_HIT_1 + 200), ms)
  drawChip(ctx, CONTENT_W * 0.73, HIGH_TIER, pct(-HIT_HIGH), ms - (B_HIT_2 + 200), ms)
}

// ─── Lifecycle ──────────────────────────────────────────────────────────────

let finished = false

const stop = (): void => {
  if (raf !== 0) cancelAnimationFrame(raf)
  raf = 0
  last = 0
}

/** Latched: the auto-finish and a tap can land on the same frame, and the
 *  tutorial must advance exactly once. */
const finish = (): void => {
  if (finished) return
  finished = true
  stop()
  emit('update:modelValue', false)
  emit('continue')
}

const begin = (): void => {
  stop()
  resetScene()
  clockMs = 0
  finished = false
  skippable.value = false
  monsterId = pickMonster(ENEMY_DEFS[DEMO_ENEMY]?.monster, 0)
  // Shared with the battlefield's cache, so on a board that has already met a
  // brute this costs nothing.
  if (monsterId) primeMonsterSprites([monsterId])
  raf = requestAnimationFrame(paint)
}

const onTap = (): void => {
  if (!props.modelValue || finished) return
  if (clockMs < B_SKIPPABLE) return
  finish()
}

const onKey = (e: KeyboardEvent): void => {
  if (!props.modelValue) return
  if (e.code !== 'Space' && e.code !== 'Enter' && e.code !== 'NumpadEnter') return
  const el = e.target
  if (el instanceof HTMLElement) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return
    if (el.isContentEditable) return
  }
  e.preventDefault()
  onTap()
}

watch(() => props.modelValue, (open) => {
  if (open) {
    window.addEventListener('keydown', onKey)
    // One frame of slack so the canvas has a box to measure before it paints —
    // a zero-width canvas lays the scene out at cell 0.
    requestAnimationFrame(() => { if (props.modelValue) begin() })
  } else {
    window.removeEventListener('keydown', onKey)
    stop()
  }
}, { immediate: true })

onMounted(() => {
  reduced = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

// A rAF that outlives its component keeps a whole scene painting behind
// whatever the player went to next.
onBeforeUnmount(() => {
  stop()
  window.removeEventListener('keydown', onKey)
})
</script>

<template lang="pug">
  Transition(name="mp-fade")
    div.merge-power(v-if="modelValue" @click="onTap")
      canvas.merge-power__canvas(ref="canvasRef" aria-hidden="true")
      //- Only once the lesson has landed — before that a tap does nothing, and
      //- a hint inviting one would be a hint that lies.
      Transition(name="mp-fade")
        div.merge-power__hint.animate-pulse(v-if="skippable")
          div.text-white.font-black.uppercase.italic.tracking-widest.brawl-text(
            :class="isMobile ? 'text-xs' : 'text-sm md:text-2xl'"
          )
            | {{ isMobile ? t('tapToContinue') : t('clickToContinue') }}
</template>

<style scoped lang="sass">
// Same layer as the merge ladder it follows (45: above the coach marks), and
// the same flat scrim — see MergeGuide for why there is no backdrop filter.
.merge-power
  position: fixed
  inset: 0
  z-index: 45
  background-color: rgba(6, 10, 20, 0.84)
  cursor: pointer
  touch-action: none
  -webkit-tap-highlight-color: transparent

.merge-power__canvas
  position: absolute
  inset: 0
  width: 100%
  height: 100%

.merge-power__hint
  position: absolute
  left: 0
  right: 0
  bottom: calc(1rem + env(safe-area-inset-bottom, 0px))
  display: flex
  justify-content: center
  pointer-events: none

.brawl-text
  text-shadow: 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000

.mp-fade-enter-active, .mp-fade-leave-active
  transition: opacity 0.25s ease

.mp-fade-enter-from, .mp-fade-leave-to
  opacity: 0

@media (prefers-reduced-motion: reduce)
  .mp-fade-enter-active, .mp-fade-leave-active
    transition: none

  .merge-power .animate-pulse
    animation: none
</style>

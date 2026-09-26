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
  fixtureSpanForCellTier, gunSpanForTier
} from '@/use/useTowerArt'
import { tierStyle } from '@/game/tierStyle'

/**
 * ─── Merge power demo ───────────────────────────────────────────────────────
 *
 * Six seconds, once, straight after the merge ladder: a two-block tower with a
 * plain cannon on its left and a tier-3 cannon on its right, a grumpling walking
 * in on each flank. Both guns fire twice, IN STEP. The left grumpling loses a
 * tenth and then another; the right one loses three quarters, then it is gone.
 * The last four seconds are the verdict held on screen: one bar empty, the
 * other barely scratched, and the survivor still walking at the wall.
 *
 * THE BARS ARE THE LESSON, so they are built to be read. At the battlefield's
 * size a tenth of a grumpling's bar was a few pixels and nobody saw it go.
 * They are twice that size here, pinned over each half above the grumpling's
 * head, framed in a small red-to-gold glow — and every hit leaves the chunk it
 * took behind as a damage trail: white for a blink, then gold, holding a beat
 * before it drains onto the new health, so the SIZE of what was lost is on
 * screen long enough to compare.
 *
 * WHY IT EXISTS. Players merge once — the tutorial makes them — and then stop
 * at tier 2. The ladder card shows that welds keep going; it does not show why
 * anyone would want them to. A tier-3 gun hits nine times as hard as a plain
 * one, and nothing on the battlefield said so except a small plate in a corner
 * and a number that floats up for a second at the moment of the weld.
 *
 * SIDE BY SIDE, not one after the other. It used to shoot the same monster with
 * each gun in turn, with a weld animation and a heal in between — six seconds
 * spent explaining a comparison that needs none. Two identical monsters, two
 * guns, the same two volleys at the same moments: the only thing that differs
 * is the tier, so the only thing the eye can land on is the result. One monster
 * is dead and the other is still walking at the wall, which is the reason to
 * merge — the tower that welded survives the wave.
 *
 * It is the game's own layout on purpose: a tower in the middle, monsters coming
 * from both flanks, the grumpling from wave 1. A demo staged like the board is
 * one the player recognises the moment the card closes.
 *
 * THE NUMBERS UNDERSTATE IT, on purpose. The real ratio is ×9 (`mergePowerMul`):
 * a shot that takes 10 % would take 90 % from a tier 3. The demo says 75 % — so
 * the kill takes the second shot, in step with the plain gun's second shot, and
 * the comparison is read at one moment instead of being over before the eye
 * gets there. A demo that promises less than the game delivers is one the player
 * is pleasantly wrong about.
 *
 * Built the way `TrapTutorial` is — its own canvas, its own scripted clock, and
 * the battlefield's own PAINTERS (`paintWorldBlock`, `paintLiveFixture`,
 * `paintTierPlate`, `paintProjectile`, the monster strips) at the battlefield's
 * arithmetic. So the tier-3 gun here is the tier-3 gun the player will build —
 * one bigger gun, colour and all. It reads no game state and writes none: the run
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
  /** The demo finished, or the player tapped through once the kill landed. */
  (e: 'continue'): void
}>()

const { t, locale } = useI18n()

const isMobile = computed(() =>
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
)

// ─── The staged scene, in cells ─────────────────────────────────────────────
//
// Ground at y = 0, `x` grows right and `y` grows UP, as on the board. From the
// left: a grumpling, the plain gun's block, the tier-3 gun's block, a grumpling.
// The result chips ride across the top, one over each half.

/** Tall enough for the grumpling, its bar, a damage number rising off the bar
 *  and the verdict chips above that, without any two touching. */
const CONTENT_H = 4.3
const MARGIN = 0.3
const GROUND_BAND = 0.8
/** From the wall to where a grumpling starts, plus half a cell — measured from
 *  the BLOCK's outer edge on both sides, so a 2×2 weld does not stand its
 *  grumpling nearer. Nothing may differ between the halves except the tier.
 *  Wide enough for a bar three cells long over each half (`barBox`). */
const LANE = 3.0
/** A grumpling's centre, in from the edge of the scene. */
const FLANK = 0.8
/** How fast they walk in, cells/s: slow enough to stay clear of the wall for
 *  the whole six seconds, fast enough that the survivor reads as COMING. */
const WALK = 0.28

/** The health bars, in cells: twice the length and height of the bar this
 *  demo started with, which was the battlefield's own proportions. */
const BAR_W = 3.3
const BAR_H = 0.46
/** Clear air between a grumpling's head and the underside of its bar. */
const BAR_GAP = 0.18
/** A hit's chunk flashes white this long at the moment it is lost… */
const TRAIL_FLASH_MS = 130
/** …then stays up in gold this long… */
const TRAIL_HOLD_MS = 450
/** …and drains onto the new health over this long. */
const TRAIL_DRAIN_MS = 650

/** The wave-1 monster. Its own def picks the body, so the demo stages the
 *  monster the player has already watched walk in. */
const DEMO_ENEMY = 'grunt'
/** Grown a little: a close-up, and the bar has to sit over a body worth it. */
const MON_GROW = 1.5

/** The two tiers, and what each shot takes off a bar. */
const LOW_TIER = 1
const HIGH_TIER = 3
const HIT_LOW = 0.1
const HIT_HIGH = 0.75

// ─── The beat sheet, ms from open ───────────────────────────────────────────
//
// Two volleys, both guns firing on the same frame each time.

const B_FIRE_1 = 450
const B_HIT_1 = 750
const B_FIRE_2 = 1550
const B_HIT_2 = 1850
/** Taps before this are ignored. The lesson is the right grumpling dying and
 *  its bar draining empty beside a bar that barely moved — the trail of the
 *  kill shot is still going at 3 s — and the click that closed the card before
 *  this one lands in the same window. After it, a tap ends the demo. */
const B_SKIPPABLE = 3000
const B_FADE = 5650
const B_END = 6000

// ─── The two halves ─────────────────────────────────────────────────────────

interface Gun {
  tier: number
  /** Block footprint and its bottom-left corner, in cells. */
  bx: number
  w: number
  h: number
  /** Gun centre, and the span `drawBlockOverlays` would draw it at. */
  x: number
  y: number
  span: number
}

/** A gun of `tier` standing with its block's left edge at `bx`. */
const gunAt = (tier: number, bx: number): Gun => {
  if (props.variant === 'footprint' && tier >= 3) {
    // The desktop's tier 3: a 2×2 bastion, the gun centred on it at the
    // span the tower draws a weapon at on that footprint (`gunSpanForTier`).
    const span = gunSpanForTier(tier)
    return { tier, bx, w: 2, h: 2, x: bx + 1, y: 1 + Math.max(0, (span - 2) / 2) * 0.6, span }
  }
  const span = props.variant === 'cell' ? fixtureSpanForCellTier(tier) : 1
  return { tier, bx, w: 1, h: 1, x: bx + 0.5, y: 0.5 + Math.max(0, (span - 1) / 2) * 0.6, span }
}

interface Layout { low: Gun; high: Gun; leftStart: number; rightStart: number; width: number }

const layout = computed<Layout>(() => {
  const low = gunAt(LOW_TIER, FLANK + LANE - 0.5)
  const high = gunAt(HIGH_TIER, low.bx + low.w)
  const rightStart = high.bx + high.w + LANE - 0.5
  return { low, high, leftStart: FLANK, rightStart, width: rightStart + FLANK }
})

/** What moves on one side of the tower. `dir` is which way that grumpling
 *  walks: +1 in from the left, −1 in from the right. */
interface Side {
  dir: 1 | -1
  hp: number
  /** Where the damage trail started from — the bar as it stood when the last
   *  hit landed — and when that was, ms (−1: no hit yet). See `trailOf`. */
  trailFrom: number
  trailAt: number
  hitFlash: number
  /** ms since it died; < 0 while alive. */
  dyingMs: number
  recoil: number
  muzzle: number
}

const side = (dir: 1 | -1): Side => ({
  dir, hp: 1, trailFrom: 1, trailAt: -1, hitFlash: 0, dyingMs: -1, recoil: 0, muzzle: 0
})
const left = side(1)
const right = side(-1)

/** The gun each side's grumpling walks at, and what one of its shots takes. */
const gunOf = (s: Side): Gun => (s === left ? layout.value.low : layout.value.high)
const hitOf = (s: Side): number => (s === left ? HIT_LOW : HIT_HIGH)

const monScale = (): number => (ENEMY_DEFS[DEMO_ENEMY]?.scale ?? 0.62) * MON_GROW

/** Where a side's grumpling stands `ms` into the demo — it walks until it dies. */
const monX = (s: Side, ms: number): number => {
  const start = s === left ? layout.value.leftStart : layout.value.rightStart
  const walked = WALK * Math.max(0, ms) / 1000
  return start + s.dir * walked
}

/**
 * A gun's aim at its grumpling's chest, in the gun's OWN frame — as if it
 * pointed right. The left gun is drawn mirrored (`drawGun`), exactly as the
 * trap demo mirrors the guns covering its left lane, so one angle serves both.
 */
const aimOf = (s: Side, ms: number): number => {
  const g = gunOf(s)
  const dx = Math.abs(monX(s, ms) - g.x)
  return Math.atan2(monScale() * 0.5 - g.y, dx) + 0.06
}

// ─── Mutable scene state (allocated once, reset in place) ───────────────────

interface Mote { x: number; y: number; vx: number; vy: number; r: number; age: number; ttl: number; gold: boolean }
const mote = (): Mote => ({ x: 0, y: 0, vx: 0, vy: 0, r: 0, age: 0, ttl: -1, gold: false })
const sparks: Mote[] = Array.from({ length: 40 }, mote)

/** Deterministic noise, so the demo plays identically every time it is shown. */
let seed = 1
const rnd = (): number => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}

let shake = 0
let fired1 = false
let hit1 = false
let fired2 = false
let hit2 = false

const resetScene = (): void => {
  seed = 1
  shake = 0
  fired1 = hit1 = fired2 = hit2 = false
  for (const s of [left, right]) {
    s.hp = 1
    s.trailFrom = 1
    s.trailAt = -1
    s.hitFlash = 0
    s.dyingMs = -1
    s.recoil = 0
    s.muzzle = 0
  }
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
const easeInOut = (k: number): number => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2)
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

const drawMonster = (ctx: CanvasRenderingContext2D, s: Side, ms: number): void => {
  const sc = monScale()
  const dieT = s.dyingMs >= 0 ? clamp01(1 - s.dyingMs / 380) : 1
  if (dieT <= 0) return
  // A flinch on each hit: shoved back the way it came, springing forward.
  const x = monX(s, ms) - s.dir * s.hitFlash * 0.14
  ctx.save()
  ctx.translate(cx(x), cy(sc / 2))
  const squash = s.dyingMs >= 0 ? dieT : 1
  ctx.scale(1 / (0.35 + 0.65 * squash), squash)
  // Two grumplings out of step, so the pair reads as two monsters rather than
  // one sprite stamped twice.
  const frame = monsterId ? monsterFrame(monsterId, ms / 800 + (s === left ? 0 : 0.37)) : null
  if (frame && monsterId) {
    // Facing the tower. The battlefield authors every design facing right and
    // mirrors by travel; a design painted facing left carries its own flip.
    const facesLeft = monsterFaces(monsterId) === 'left'
    const wantLeft = s.dir === -1
    if (facesLeft !== wantLeft) ctx.scale(-1, 1)
    const k = (sc * cell * 1.3) / (frame.height * SPRITE_HEIGHT_R)
    const w = frame.width * k
    const h = frame.height * k
    const top = monsterAnchor(monsterId) === 'centre'
      ? -h * 0.5
      : sc * cell * 0.5 - frame.height * SPRITE_FOOT_R * k
    ctx.globalAlpha *= dieT
    ctx.drawImage(frame, -w * 0.5, top, w, h)
    if (s.hitFlash > 0.02) {
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha *= s.hitFlash * 0.55
      ctx.drawImage(frame, -w * 0.5, top, w, h)
    }
  } else {
    // The strip bakes asynchronously; a silhouette holds the staging until it
    // lands rather than hanging a health bar over empty grass.
    ctx.globalAlpha *= dieT
    ctx.fillStyle = 'rgba(30, 24, 40, 0.9)'
    ctx.beginPath()
    ctx.ellipse(0, sc * cell * 0.15, sc * cell * 0.35, sc * cell * 0.36, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/** The top of a grumpling's painted body, in cells above the ground. */
const monTop = (): number => monScale() * 1.3

/** Where a side's bar sits, in cells: its centre and its underside. */
const barAnchor = (s: Side): { x: number; y: number } => {
  const L = layout.value
  const g = gunOf(s)
  // Centred over the open ground between the scene's edge and the gun's block
  // — pinned there rather than riding on the grumpling, so a bar three cells
  // long never swings in over the tower, and the two bars read side by side.
  const x = s === left ? (-MARGIN + g.bx) / 2 : (g.bx + g.w + L.width + MARGIN) / 2
  return { x, y: monTop() + BAR_GAP }
}

/**
 * Where a side's damage trail stands `ms` in: the bar as it was before the
 * last hit, held for a beat, then easing down onto the health that is left.
 */
const trailOf = (s: Side, ms: number): number => {
  if (s.trailAt < 0 || s.trailFrom <= s.hp) return s.hp
  const k = clamp01((ms - s.trailAt - TRAIL_HOLD_MS) / TRAIL_DRAIN_MS)
  return s.hp + (s.trailFrom - s.hp) * (1 - easeInOut(k))
}

/**
 * A side's health bar: dark frame with a small red-to-gold glow round its
 * border, the red health, and the damage trail — the chunk the last hit took,
 * white at the moment it goes, then gold until it drains. Square-ended inside
 * the frame, and notched at the quarters, so "a tenth" and "three quarters"
 * can be told apart at a glance. Stays up after the kill, empty: an empty bar
 * beside a full one IS the comparison.
 */
const drawHpBar = (ctx: CanvasRenderingContext2D, s: Side, ms: number): void => {
  const a = barAnchor(s)
  const w = BAR_W * cell
  const h = Math.max(14, BAR_H * cell)
  const x = cx(a.x) - w / 2
  const y = cy(a.y) - h
  const pad = Math.max(2, h * 0.16)
  const r = h * 0.3
  const trail = trailOf(s, ms)

  ctx.save()
  // The frame, its glow thrown by the fill's shadow, then the gradient border.
  ctx.shadowColor = 'rgba(255, 128, 48, 0.8)'
  ctx.shadowBlur = Math.max(5, cell * 0.22)
  ctx.fillStyle = 'rgba(10, 8, 16, 0.94)'
  roundRectPath(ctx, x - pad, y - pad, w + pad * 2, h + pad * 2, r + pad)
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
  const edge = ctx.createLinearGradient(x - pad, 0, x + w + pad, 0)
  edge.addColorStop(0, '#ff4a2e')
  edge.addColorStop(0.55, '#ff8a3a')
  edge.addColorStop(1, '#ffd24a')
  ctx.strokeStyle = edge
  ctx.lineWidth = Math.max(1.5, h * 0.12)
  ctx.stroke()

  // Everything inside is clipped to the track, so the segments are square.
  roundRectPath(ctx, x, y, w, h, r * 0.6)
  ctx.clip()

  if (trail > s.hp) {
    const since = ms - s.trailAt
    ctx.fillStyle = since < TRAIL_FLASH_MS ? '#ffffff' : '#ffd86a'
    ctx.fillRect(x + w * s.hp, y, w * (trail - s.hp), h)
  }
  if (s.hp > 0.001) {
    const g = ctx.createLinearGradient(0, y, 0, y + h)
    g.addColorStop(0, '#ff7a66')
    g.addColorStop(0.5, '#e8321f')
    g.addColorStop(1, '#a8160f')
    ctx.fillStyle = g
    ctx.fillRect(x, y, w * s.hp, h)
    // A lit top edge, so the red reads as a bar and not a stripe of paint.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)'
    ctx.fillRect(x, y + h * 0.1, w * s.hp, h * 0.2)
  }
  ctx.fillStyle = 'rgba(10, 8, 16, 0.75)'
  const tick = Math.max(1, h * 0.08)
  for (const q of [0.25, 0.5, 0.75]) ctx.fillRect(x + w * q - tick / 2, y, tick, h)
  ctx.restore()
}

/** A floating damage number over a side's grumpling: pops, rises, fades. */
const drawFloat = (
  ctx: CanvasRenderingContext2D, s: Side, text: string, sinceMs: number, size: number,
  fill: string, ms: number
): void => {
  if (sinceMs < 0 || sinceMs > 1000) return
  const k = sinceMs / 1000
  const pop = sinceMs < 140
    ? 0.6 + 0.6 * easeOut(sinceMs / 140)
    : 1.2 - 0.2 * clamp01((sinceMs - 140) / 180)
  // Rising off the top of the bar, over the grumpling that took the hit.
  const top = barAnchor(s).y + BAR_H
  ctx.save()
  ctx.globalAlpha *= k < 0.65 ? 1 : 1 - (k - 0.65) / 0.35
  ctx.translate(cx(monX(s, ms)), cy(top + 0.38 + k * 0.5))
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
 * One result chip over a half — the gun, in its own tier's dress, and what one
 * of its shots takes. Up from the first volley, so the two halves are labelled
 * before the second volley decides between them.
 */
const drawChip = (
  ctx: CanvasRenderingContext2D, centreX: number, tier: number, text: string,
  sinceMs: number, ms: number
): void => {
  if (sinceMs < 0) return
  const pop = sinceMs < 220 ? easeOut(sinceMs / 220) : 1
  const w = cell * 2.3
  const h = cell * 0.9
  const ts = tierStyle(Math.max(2, tier))
  ctx.save()
  ctx.translate(cx(centreX), cy(CONTENT_H - 0.5))
  ctx.scale(pop, pop)
  ctx.fillStyle = 'rgba(20, 63, 117, 0.92)' // --ui-well-deep: pool-blue plastic
  ctx.strokeStyle = tier > 1 ? ts.hex : 'rgba(255, 255, 255, 0.4)'
  ctx.lineWidth = Math.max(1.5, cell * 0.05)
  roundRectPath(ctx, -w / 2, -h / 2, w, h, h * 0.3)
  ctx.fill()
  ctx.stroke()
  // The gun in its own tier's dress — its colour, rim and glow ARE the badge
  // here, and they are the same the tower will show.
  const gunCell = h * 0.8
  const span = props.variant === 'cell' ? fixtureSpanForCellTier(tier) : tier > 1 ? 1.2 : 1
  paintLiveFixture(ctx, 'cannon', -w / 2 + h * 0.6, 0, gunCell * span, {
    aim: 0.12, t: ms, uid: 3 + tier, col: 1, tier
  })
  if (tier > 1) paintTierPlate(ctx, tier, -w / 2 + h * 0.98, -h * 0.26, gunCell)
  ctx.font = `900 ${Math.round(h * 0.5)}px sans-serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(2, h * 0.09)
  ctx.strokeStyle = 'rgba(8, 10, 18, 0.9)'
  ctx.strokeText(text, w / 2 - h * 0.22, h * 0.02)
  ctx.fillStyle = tier > 1 ? ts.plateTop : '#f4f1e8'
  ctx.fillText(text, w / 2 - h * 0.22, h * 0.02)
  ctx.restore()
}

/** Where a side's gun's muzzle is, `off` barrels across (a battery's flank). */
const muzzleAt = (s: Side, ms: number, off = 0): { x: number; y: number } => {
  const g = gunOf(s)
  const a = aimOf(s, ms)
  const reach = 0.55 * g.span
  // In the gun's own frame, then flipped for the left gun, which faces left.
  const fx = Math.cos(a) * reach - Math.sin(a) * off * g.span
  const fy = Math.sin(a) * reach + Math.cos(a) * off * g.span
  return { x: g.x - s.dir * fx, y: g.y + fy }
}

/** A round in flight from a side's muzzle to its grumpling, on a shallow arc. */
const drawShot = (
  ctx: CanvasRenderingContext2D, s: Side, fireMs: number, hitMs: number, ms: number
): void => {
  const k = clamp01((ms - fireMs) / (hitMs - fireMs))
  const from = muzzleAt(s, fireMs)
  const tx = monX(s, hitMs) + s.dir * 0.15
  const ty = monScale() * 0.5
  const x = from.x + (tx - from.x) * k
  const y = from.y + (ty - from.y) * k + Math.sin(k * Math.PI) * 0.3
  const tier = gunOf(s).tier
  paintProjectile(ctx, 'ball', cx(x), cy(y), cell * (tier > 1 ? 0.55 : 0.42), ms, tier)
}

const drawGun = (ctx: CanvasRenderingContext2D, s: Side, ms: number, fade: number): void => {
  const g = gunOf(s)

  // The body, one face stretched over the footprint — as `drawBlock` paints a
  // weld, not the cell sprite tiled.
  const fw = g.w * cell
  const fh = g.h * cell
  const face = Math.max(fw, fh)
  ctx.save()
  ctx.translate(cx(g.bx), cy(g.h))
  ctx.scale(fw / face, fh / face)
  paintWorldBlock(ctx, 'cannon', 0, 0, face)
  ctx.restore()

  // The gun, facing its own flank: the right one as authored, the left one
  // mirrored about its centre.
  ctx.save()
  ctx.translate(cx(g.x), cy(g.y))
  if (s.dir === 1) ctx.scale(-1, 1)
  paintLiveFixture(ctx, 'cannon', 0, 0, cell * g.span, {
    aim: aimOf(s, ms), recoil: s.recoil, t: ms, uid: s === left ? 9 : 10, col: 1, tier: g.tier
  })
  ctx.restore()

  // The plate, riveted where the battlefield rivets it.
  if (g.tier > 1) paintTierPlate(ctx, g.tier, cx(g.bx + g.w) - cell * 0.2, cy(g.h) + cell * 0.17, cell)

  if (s.muzzle > 0.02) {
    // A flash at every barrel the gun has: one, or the battery's three.
    const ts = tierStyle(Math.max(2, g.tier))
    const offsets = g.tier > 1 ? [-0.2, 0, 0.2] : [0]
    for (const off of offsets) {
      const m = muzzleAt(s, ms, off)
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = fade * s.muzzle
      ctx.fillStyle = g.tier > 1 ? ts.plateTop : '#ffe7a8'
      ctx.beginPath()
      ctx.arc(cx(m.x), cy(m.y), cell * (0.12 + 0.14 * s.muzzle) * (g.tier > 1 ? 1.25 : 1), 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }
}

// ─── The frame ──────────────────────────────────────────────────────────────

/** A volley lands on one side. */
const land = (s: Side): void => {
  // The trail restarts from wherever it has got to, so a hit landing while the
  // last one's chunk is still draining keeps both chunks on the bar.
  s.trailFrom = trailOf(s, clockMs)
  s.trailAt = clockMs
  s.hp = Math.max(0, s.hp - hitOf(s))
  s.hitFlash = s === right ? 1 : 0.6
  const chest = monScale() * 0.5
  const x = monX(s, clockMs)
  burst(s === right ? 12 : 6, x, chest, s === right ? 3.8 : 2.2, false)
  if (s.hp <= 0 && s.dyingMs < 0) {
    s.dyingMs = 0
    burst(9, x, monScale() * 0.6, 2.4, true)
  }
}

const step = (prevMs: number, ms: number, dtMs: number): void => {
  const dt = dtMs / 1000
  const crossed = (beat: number): boolean => prevMs < beat && ms >= beat

  if (!fired1 && crossed(B_FIRE_1)) {
    fired1 = true
    for (const s of [left, right]) { s.recoil = 1; s.muzzle = 1 }
  }
  if (!hit1 && crossed(B_HIT_1)) {
    hit1 = true
    land(left)
    land(right)
    shake = reduced ? 0 : 0.5
  }
  if (!fired2 && crossed(B_FIRE_2)) {
    fired2 = true
    for (const s of [left, right]) { s.recoil = 1; s.muzzle = 1 }
  }
  if (!hit2 && crossed(B_HIT_2)) {
    hit2 = true
    land(left)
    land(right)
    shake = reduced ? 0 : 0.8
  }

  for (const s of [left, right]) {
    s.hitFlash = Math.max(0, s.hitFlash - dt * 4)
    s.recoil = Math.max(0, s.recoil - dt * 5)
    s.muzzle = Math.max(0, s.muzzle - dt * 9)
    if (s.dyingMs >= 0) s.dyingMs += dtMs
  }
  shake = Math.max(0, shake - dt * 3.4)
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
  // does not blow two cannons up into a mural.
  const L = layout.value
  const boxW = L.width + MARGIN * 2
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
    // Sandbox sand (sandbox-reskin.md: sand-light → sand-mid → sand-dark).
    meadow.addColorStop(0, '#f0d69a')
    meadow.addColorStop(0.35, '#e3c07e')
    meadow.addColorStop(1, '#b88c4c')
    ctx.fillStyle = meadow
    ctx.fillRect(0, groundY, W, band)
  }

  ctx.save()
  if (shake > 0) {
    const a = shake * shake * cell * 0.14
    ctx.translate((rnd() - 0.5) * a, (rnd() - 0.5) * a)
  }

  for (const s of [left, right]) drawGun(ctx, s, ms, fade)
  for (const s of [left, right]) {
    drawMonster(ctx, s, ms)
    drawHpBar(ctx, s, ms)
  }
  if (fired1 && !hit1) for (const s of [left, right]) drawShot(ctx, s, B_FIRE_1, B_HIT_1, ms)
  if (fired2 && !hit2) for (const s of [left, right]) drawShot(ctx, s, B_FIRE_2, B_HIT_2, ms)

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

  const lowText = pct(-HIT_LOW)
  const highText = pct(-HIT_HIGH)
  const highFill = tierStyle(HIGH_TIER).plateTop
  for (const hitMs of [B_HIT_1, B_HIT_2]) {
    drawFloat(ctx, left, lowText, ms - hitMs, 0.4, '#fff4d8', ms)
    drawFloat(ctx, right, highText, ms - hitMs, 0.62, highFill, ms)
  }
  ctx.restore()

  // ── The verdict, one chip over each half, over its bar ──
  drawChip(ctx, barAnchor(left).x, LOW_TIER, lowText, ms - (B_HIT_1 + 150), ms)
  drawChip(ctx, barAnchor(right).x, HIGH_TIER, highText, ms - (B_HIT_1 + 150), ms)
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
  // Shared with the battlefield's cache: the grumpling is wave 1's monster, so
  // by the time this card opens it has almost always been baked already.
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

/** For the tests: the two halves' health, 0..1, as the demo stands — and
 *  where each bar's damage trail has got to. */
defineExpose({
  healthOf: () => ({ left: left.hp, right: right.hp }),
  trailOf: () => ({ left: trailOf(left, clockMs), right: trailOf(right, clockMs) })
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
  // The modal scrim's blue, held dark enough to carry the card on its own.
  background-color: rgba(14, 42, 80, 0.84)
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

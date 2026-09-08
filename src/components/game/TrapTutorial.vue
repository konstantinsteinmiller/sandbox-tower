<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ENEMY_DEFS } from '@/game/enemies'
import {
  monsterAnchor, monsterFaces, monsterFrame, pickMonster, primeMonsterSprites,
  SPRITE_FOOT_R, SPRITE_HEIGHT_R
} from '@/game/monsterSprites'
import { paintLiveFixture, paintMeadowBand, paintWorldBlock } from '@/use/useTowerArt'
import BlockTile from '@/components/game/BlockTile.vue'
import IconGold from '@/components/icons/IconGold.vue'

/**
 * ─── Trap tutorial ───────────────────────────────────────────────────────────
 *
 * The collapse-crush is this game's best trick and almost nobody finds it.
 *
 * `settleSupport` drops any block that can no longer reach the ground, and a
 * landing block kills everything short of a boss underneath it outright — so an
 * overhang undermined ON PURPOSE is a free wave clear. Players do not discover
 * that by playing: selling a block reads as "get rid of a mistake", and nothing
 * in the build loop suggests that demolishing your own tower is an attack. They
 * die for hours without ever aiming a collapse. So the first death shows them,
 * once, deliberately.
 *
 * WHY A CANNED ANIMATION AND NOT A LIVE SANDBOX.
 *
 * This runs on the defeat screen. The run is over but its state is not yet
 * disposable — the result screen is still reading the snapshot it grades, ads
 * and the save flush hang off the back of it, and a "just let them try it"
 * sandbox driving the real `useTowerGame` would spawn enemies, mutate resources
 * and push FX into the very board being summarised. There is no version of that
 * cheaper than drawing our own scene, so this component owns a canvas, a
 * scripted clock and nothing else. It reads no game state and writes none.
 *
 * WHAT IT STILL BORROWS. The DRAWABLES, and only those: `paintWorldBlock`,
 * `paintLiveFixture` and the `monsterSprites` strips are the battlefield's own
 * painters, blitted with the battlefield's own arithmetic. A demo drawn from a
 * private copy of the art would teach a tower the player has never seen — the
 * whole point is that they recognise the wall, the pillar and the SELL button
 * when they meet them for real ten seconds from now.
 *
 * WORDLESS, like `TutorialOverlay`. It ships to children on portals in twenty-one
 * locales and a prose panel is where they leave. The only copy is the shared
 * tap/click-to-continue hint and the sell button's own existing label.
 */

interface Props {
  /** Open state. */
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  /** The player clicked/tapped through. */
  (e: 'continue'): void
}>()

const { t } = useI18n()

const isMobile = computed(() => {
  return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
})

// ─── The staged scene, in cells ──────────────────────────────────────────────
//
// Grid coordinates match the board's: `c` grows right, `r` grows UP, and row 0
// stands on the ground. A block's footprint hangs off its bottom-left cell, so
// the pillar occupies rows 0-2 and the arm resting on it is row 3.
//
// The layout exists to make ONE reading unmissable: five blocks of arm, one
// pillar. Anything wider stops fitting a 320px portrait board; anything shorter
// stops looking like a cantilever and starts looking like a bridge.

/** Cells of scene, left edge to right edge. */
const CONTENT_W = 6
/** Cells above the ground line — the cannon's barrel needs the slack. */
const CONTENT_H = 5.8
/** Breathing room around the content so nothing kisses the canvas edge. */
const MARGIN = 0.35
/** Meadow drawn below the ground line, so the ground reads as ground. */
const GROUND_BAND = 0.9

/** Where the arm sits. Three cells of air under it is the whole drop. */
const ARM_ROW = 3
/** Columns of arm, left to right. The rightmost butts against the trunk. */
const ARM_COLS = [0, 1, 2, 3, 4] as const
/** Mixed, so the falling rubble is not five identical crates. */
const ARM_TYPES = ['wood', 'wood', 'stone', 'wood', 'stone'] as const
/** The lonely pillar: one merged 1x3 block, the only thing under the arm. */
const PILLAR_COL = 0
const PILLAR_H = 3
/** The trunk the arm grows out of, and the gun that crowns it. */
const TRUNK_COL = 5
const TRUNK_ROWS = 4

/**
 * The trunk is a DISPLAY CASE, not four crates.
 *
 * Almost nobody reads the tech tree. They open it once, see a graph of nodes
 * with names attached, close it, and go on playing the game with the two
 * weapons the deck happened to deal them — which is the version of this game
 * that gets boring. Copy does not fix that; a screenshot does. This animation
 * already has the player's full attention on the frame after their first death,
 * and it already needs something standing on the right of the lane, so the
 * something is a tower bristling with the guns they have not unlocked yet.
 *
 * The trunk was four identical stone blocks doing nothing but holding the arm
 * up. Swapping them costs no extra cell of scene — which matters, because the
 * board is fitted to a 320 px portrait and one more column would shrink every
 * monster in it.
 *
 * Bottom to top, ordered by silhouette rather than by tier: the squat emitters
 * low, the coil high where its spire has air to stand in, the cannon crowning
 * it because the cannon is the one the player already owns and it anchors the
 * unfamiliar four to something they recognise.
 */
const TRUNK_STACK = ['frost', 'bombard', 'mortar', 'tesla'] as const
const TRUNK_CROWN = 'cannon'

/**
 * Gravity, cells/s². Mirrors `GRAVITY` in `useTowerGame`, which is module-private
 * — and must stay a copy rather than becoming an export, because importing the
 * simulation into a defeat-screen animation is exactly the coupling the header
 * argues against. If the sim's value moves, the demo falls a shade slower than
 * the real thing and nothing else breaks.
 */
const GRAVITY = 26

/** The wave-1 enemy. Its own def picks the bodies, so the demo can never stage
 *  a monster the player has not already been killed by. */
const DEMO_ENEMY = 'grunt'

// ─── The beat sheet, in ms from the top of each loop ─────────────────────────

const B_HOLD = 800
const B_MOVE_A = B_HOLD + 1000
const B_CLICK_A = B_MOVE_A + 220
const B_PANEL = B_CLICK_A + 200
const B_DWELL = B_PANEL + 1000
const B_MOVE_B = B_DWELL + 700
const B_SELL = B_MOVE_B + 180
/** How long three cells of free fall actually takes, from the same maths the
 *  debris step runs. Scheduling the loop off a guess would either cut the
 *  aftermath short or leave dead air after the dust had settled. */
const FALL_MS = Math.sqrt((2 * ARM_ROW) / GRAVITY) * 1000
const B_AFTERMATH = B_SELL + FALL_MS + 1200
const LOOP_MS = B_AFTERMATH + 600

/** Clicks inside this window after opening are the PREVIOUS screen's click
 *  still arriving. Without the guard the tap that dismissed the defeat panel
 *  eats the whole demo before a frame of it has drawn. */
const OPEN_GUARD_MS = 600

// ─── Mutable scene state ─────────────────────────────────────────────────────
//
// Every one of these is allocated once and reset in place. The loop runs with
// the battle sim stopped, but on the same phone that just lost to it, and a
// demo churning garbage while the result screen animates is a stutter the
// player reads as the game dying.

interface Body {
  /** Cell offset from the block's staged row. Negative is downward, as the
   *  simulation's `falling.dy` is. */
  dy: number
  vy: number
  rot: number
  vrot: number
  landed: boolean
}

const arm: Body[] = ARM_COLS.map(() => ({ dy: 0, vy: 0, rot: 0, vrot: 0, landed: false }))

interface Mote {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  rot: number
  vrot: number
  /** Seconds lived; dead once past `ttl`. */
  age: number
  ttl: number
}

const mote = (): Mote => ({ x: 0, y: 0, vx: 0, vy: 0, r: 0, rot: 0, vrot: 0, age: 0, ttl: -1 })
const dust: Mote[] = Array.from({ length: 34 }, mote)
const chips: Mote[] = Array.from({ length: 16 }, mote)
const coins: Mote[] = Array.from({ length: 8 }, mote)

interface Mon {
  id: string | null
  /** Centre, in cells from the scene's left edge. */
  x: number
  phase: number
  /** Milliseconds since it was crushed; < 0 while alive. */
  dying: number
}

const monsters: Mon[] = []

/** Deterministic per-loop noise. `Math.random` would reseed the tumble every
 *  loop, and a demo that plays differently each time reads as a simulation the
 *  player might be influencing — which is the one thing this is not. */
let seed = 1
const rnd = (): number => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}

let sold = false
let impacted = false
let shake = 0
/** Multiplies everything the scene paints. Carries the crossfade at the loop
 *  seam — cutting straight from a flattened battlefield back to an intact one
 *  read as a rendering glitch rather than as "watch it again". */
let sceneAlpha = 1

const resetLoop = (): void => {
  seed = 1
  sold = false
  impacted = false
  shake = 0
  for (const b of arm) {
    b.dy = 0
    b.vy = 0
    b.rot = 0
    b.vrot = 0
    b.landed = false
  }
  for (const m of dust) m.ttl = -1
  for (const m of chips) m.ttl = -1
  for (const m of coins) m.ttl = -1
  for (const m of monsters) m.dying = -1
}

/** Wake the first `n` dead motes in a pool. Never grows the pool: a burst that
 *  wants more particles than exist simply draws fewer, which is invisible, and
 *  the alternative is allocating mid-collapse. */
const burst = (
  pool: Mote[], n: number, fill: (m: Mote, i: number) => void
): void => {
  let used = 0
  for (const m of pool) {
    if (used >= n) return
    if (m.ttl > 0 && m.age < m.ttl) continue
    m.age = 0
    fill(m, used)
    used++
  }
}

// ─── Canvas ──────────────────────────────────────────────────────────────────

const canvasRef = ref<HTMLCanvasElement | null>(null)
/**
 * The pointer gets its OWN canvas, stacked above the mock inspector.
 *
 * On the scene canvas it vanished under the card at the exact beat it presses
 * the sell button — the one frame the whole demo is built around. Repainting the
 * scene above the card was not an option (the card is DOM, for the real button's
 * styling), so the pointer is lifted onto a layer of its own and only its own
 * dirty rect is cleared each frame.
 */
const cursorRef = ref<HTMLCanvasElement | null>(null)
const sellRef = ref<HTMLButtonElement | null>(null)

/** Panel placement plus the scene's cell size, handed to CSS so the mock
 *  inspector scales with the SCENE instead of with the viewport. A card sized
 *  in `vw` swallowed the whole board on a short landscape phone, where the
 *  scene shrinks to fit the height while the viewport is still 900px wide. */
const panelStyle = ref<Record<string, string>>({ left: '0px', top: '0px', '--cell': '40px' })
const panelOpen = ref(false)
const sellPressed = ref(false)

/**
 * Reduced motion does NOT freeze this.
 *
 * A still frame of a tower with a pillar under it teaches nothing at all — the
 * lesson IS the movement, and a player who cannot see the arm fall has been
 * shown a picture. So the demo keeps playing and gives up the two things that
 * actually provoke motion sickness: the impact's screen shake and the camera
 * bounce. It also runs slower, which makes each beat easier to follow.
 */
const reduced = ref(false)
let motionQuery: MediaQueryList | null = null
const syncMotion = (): void => { reduced.value = motionQuery?.matches === true }

let raf = 0
let last = 0
/** Milliseconds into the current loop. */
let loopT = 0
/** Milliseconds since the overlay opened — the fixture's own animation clock. */
let clock = 0
let openedAt = 0
let needMeasure = true

/** Layout, recomputed every frame off the canvas box and cached so the panel's
 *  DOM styles are written only when they actually changed. */
let cell = 40
let originX = 0
let groundY = 0

/** The sell button's centre in canvas-client px, measured rather than derived:
 *  its real size comes out of the shared inspector styling, and a cursor that
 *  lands beside the button instead of on it undoes the whole beat. */
let sellX = 0
let sellY = 0

const cursor = { x: 0, y: 0 }
/** Last frame's pointer box, so the cursor layer clears a hundred pixels rather
 *  than a whole 4-megapixel desktop canvas every frame. */
const cursorDirty = { x: 0, y: 0, s: 0 }

const easeInOut = (k: number): number =>
  k < 0.5 ? 2 * k * k : 1 - ((-2 * k + 2) ** 2) / 2

const clamp01 = (k: number): number => (k < 0 ? 0 : k > 1 ? 1 : k)

const cx = (c: number): number => originX + c * cell
const cy = (r: number): number => groundY - r * cell

/**
 * One block body, at the footprint arithmetic `drawBlock` uses.
 *
 * The face is baked at the footprint's LONGEST edge and then stretched into the
 * rect — which is why the 1x3 pillar is one tall block rather than three crates
 * in a stack, exactly as a merged block renders on the board. Baking at the
 * short edge instead drew a soft pillar that read as a different material.
 */
const drawBody = (
  ctx: CanvasRenderingContext2D, typeId: string,
  c: number, r: number, w: number, h: number, rot: number
): void => {
  const fw = cell * w
  const fh = cell * h
  const bake = Math.max(fw, fh)
  ctx.save()
  ctx.translate(cx(c + w / 2), cy(r + h / 2))
  if (rot !== 0) ctx.rotate(rot)
  ctx.scale(fw / bake, fh / bake)
  paintWorldBlock(ctx, typeId, -bake / 2, -bake / 2, bake)
  ctx.restore()
}

/** One of the trunk's guns, mirrored to face the lane the monsters come up. */
const drawTrunkGun = (
  ctx: CanvasRenderingContext2D, typeId: string, r: number, uid: number, aim: number
): void => {
  ctx.save()
  ctx.translate(cx(TRUNK_COL + 0.5), cy(r + 0.5))
  ctx.scale(-1, 1)
  paintLiveFixture(ctx, typeId, 0, 0, cell, { aim, t: clock, uid, col: -1 })
  ctx.restore()
}

/**
 * A monster, blitted the way `drawEnemy` blits one.
 *
 * Sized off the frame the strip handed back and lined up by the FEET, so a
 * design with more headroom than another does not hover here while standing
 * correctly in the game. `s` is `def.scale` in cells — the same number the
 * battlefield multiplies by its zoom.
 */
const drawMonster = (
  ctx: CanvasRenderingContext2D, m: Mon, s: number, cycle: number
): void => {
  const dieT = m.dying >= 0 ? clamp01(1 - m.dying / 320) : 1
  if (dieT <= 0) return
  const px = cx(m.x)
  // The sprite box is `s` cells tall and centred on the unit, whose own centre
  // sits half a box above the ground — the same `spawnY = def.scale / 2` the
  // simulation gives a walker.
  const py = cy(s / 2)
  ctx.save()
  ctx.globalAlpha = dieT * sceneAlpha
  ctx.translate(px, py)
  // Crushed, not shot: the body FLATTENS as it fades. A uniform shrink read as
  // "wandered off" and lost the entire point of the beat.
  const squash = m.dying >= 0 ? dieT : 1
  ctx.scale(1 / (0.35 + 0.65 * squash), squash)
  const frame = m.id ? monsterFrame(m.id, cycle) : null
  if (frame) {
    if (m.id && monsterFaces(m.id) === 'left') ctx.scale(-1, 1)
    const k = (s * cell * 1.3) / (frame.height * SPRITE_HEIGHT_R)
    const w = frame.width * k
    const h = frame.height * k
    const top = m.id && monsterAnchor(m.id) === 'centre'
      ? -h * 0.5
      : s * cell * 0.5 - frame.height * SPRITE_FOOT_R * k
    ctx.drawImage(frame, -w * 0.5, top, w, h)
  } else {
    // The bake is async and this overlay opens the instant the player dies. A
    // silhouette holds the staging until the strip lands; skipping the draw
    // would show an arm falling onto empty grass.
    const bw = s * cell * 0.62
    const bh = s * cell
    ctx.fillStyle = 'rgba(24, 30, 22, 0.85)'
    ctx.beginPath()
    ctx.ellipse(0, bh * 0.18, bw * 0.5, bh * 0.32, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(0, -bh * 0.2, bw * 0.36, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/** The fake pointer. Painted rather than DOM so it shares the scene's transform
 *  — a DOM cursor drifted off the button whenever the shake was running. */
const drawCursor = (ctx: CanvasRenderingContext2D, pulse: number): void => {
  const s = Math.max(16, cell * 0.46)
  ctx.clearRect(cursorDirty.x, cursorDirty.y, cursorDirty.s, cursorDirty.s)
  cursorDirty.x = cursor.x - s * 1.5
  cursorDirty.y = cursor.y - s * 1.5
  cursorDirty.s = s * 3.2
  ctx.globalAlpha = sceneAlpha
  if (pulse > 0) {
    const k = 1 - pulse
    ctx.save()
    ctx.strokeStyle = `rgba(255, 233, 120, ${pulse * 0.9})`
    ctx.lineWidth = Math.max(2, cell * 0.05)
    ctx.beginPath()
    ctx.arc(cursor.x, cursor.y, s * (0.25 + k * 0.9), 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
  ctx.save()
  ctx.translate(cursor.x, cursor.y)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, s)
  ctx.lineTo(s * 0.26, s * 0.75)
  ctx.lineTo(s * 0.44, s * 1.06)
  ctx.lineTo(s * 0.6, s * 0.98)
  ctx.lineTo(s * 0.42, s * 0.68)
  ctx.lineTo(s * 0.7, s * 0.62)
  ctx.closePath()
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#0f1a30'
  ctx.lineWidth = Math.max(1.5, cell * 0.035)
  ctx.lineJoin = 'round'
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

const stepMotes = (pool: Mote[], dt: number, gravity: number, drag: number): void => {
  for (const m of pool) {
    if (m.ttl <= 0 || m.age >= m.ttl) continue
    m.age += dt
    m.vy -= gravity * dt
    m.vx *= drag
    m.x += m.vx * dt
    m.y += m.vy * dt
    m.rot += m.vrot * dt
    if (m.y < 0) {
      m.y = 0
      m.vy *= -0.25
      m.vx *= 0.6
    }
  }
}

const paint = (now: number): void => {
  raf = requestAnimationFrame(paint)
  const cv = canvasRef.value
  if (!cv) return
  const ctx = cv.getContext('2d')
  if (!ctx) return

  // Clamped: a backgrounded tab hands back a multi-second delta, and
  // integrating that in one step drops the arm through the floor before a
  // single frame of the collapse has been drawn.
  const dtMs = last === 0 ? 16 : Math.min(50, now - last)
  last = now
  const rate = reduced.value ? 0.66 : 1
  clock += dtMs
  loopT += dtMs * rate
  if (loopT >= LOOP_MS) {
    loopT -= LOOP_MS
    resetLoop()
  }
  // Crossfade at the seam: out over the tail of the loop, in over the head.
  sceneAlpha = loopT < 240
    ? loopT / 240
    : loopT > LOOP_MS - 380 ? (LOOP_MS - loopT) / 380 : 1
  const dt = (dtMs * rate) / 1000

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
  ctx.globalAlpha = sceneAlpha

  // ── Layout ──
  //
  // Scaled to fit BOTH axes and then centred, so the arm and the monsters
  // survive a 320px portrait board and a 340px-tall landscape one alike. The
  // 86px ceiling stops a desktop blowing five blocks up into a mural — past
  // that the reading gets no clearer, only bigger.
  const boxW = CONTENT_W + MARGIN * 2
  const boxH = CONTENT_H + MARGIN + GROUND_BAND
  // The continue hint owns the bottom strip, and the scene is centred in what
  // is LEFT. Centring in the full height instead parked the meadow underneath
  // the hint on a landscape phone, where the fit is decided by the height and
  // there is nothing spare to bleed into.
  const avail = H - Math.min(48, H * 0.13)
  const nextCell = Math.min((W * 0.94) / boxW, (avail * 0.94) / boxH, 86)
  const nextOriginX = (W - nextCell * boxW) / 2 + nextCell * MARGIN
  const nextGroundY = (avail - nextCell * boxH) / 2 + nextCell * (MARGIN + CONTENT_H)
  if (nextCell !== cell || nextOriginX !== originX || nextGroundY !== groundY) {
    // Carry the measured sell point across the resize instead of dropping it.
    // The card is positioned in world cells and sized off `--cell`, so it moves
    // exactly as the scene does — and re-measuring instead would leave the
    // cursor aiming at last frame's button for the rest of the loop.
    if (sellX > 0) {
      const wx = (sellX - originX) / cell
      const wy = (groundY - sellY) / cell
      sellX = nextOriginX + wx * nextCell
      sellY = nextGroundY - wy * nextCell
    }
    cell = nextCell
    originX = nextOriginX
    groundY = nextGroundY
    // The card is anchored by its BOTTOM edge (see `translateY(-100%)`) and
    // parked just over the monsters' heads, so it grows UP into the void the
    // cantilever makes and stops short of the arm. Hanging it off the arm's
    // underside instead — the obvious placement — laid a card an inch and a
    // half tall straight across four of the five blocks whose length is the
    // entire point of the staging. Anchoring low also means a locale that
    // wraps the sell label grows the card into empty air rather than over the
    // thing being taught.
    panelStyle.value = {
      left: `${Math.round(cx(PILLAR_COL + 1.15))}px`,
      top: `${Math.round(cy(1.05))}px`,
      '--cell': `${cell}px`
    }
    needMeasure = true
  }

  // Measured only once the card has finished its pop, and only in the second of
  // slack before the cursor sets off for it. A rect read mid-transition is the
  // rect of a card still at 0.82 scale about a bottom-left origin, which put
  // the click seven pixels off the button it was supposed to press.
  if (needMeasure && sellRef.value && loopT >= B_PANEL + 80 && loopT < B_DWELL) {
    const a = sellRef.value.getBoundingClientRect()
    const b = cv.getBoundingClientRect()
    if (a.width > 0) {
      sellX = a.left - b.left + a.width / 2
      sellY = a.top - b.top + a.height / 2
      needMeasure = false
    }
  }

  const def = ENEMY_DEFS[DEMO_ENEMY]
  const mScale = def?.scale ?? 0.62

  // ── Script ──
  // The card closes ON the sale, as the real one does — `sellBlock` clears the
  // inspected block before the collapse resolves. Leaving it up for a beat
  // afterwards had the arm tumbling down behind a panel for the block that was
  // no longer there.
  panelOpen.value = loopT >= B_CLICK_A && loopT < B_SELL
  sellPressed.value = loopT >= B_MOVE_B && loopT < B_SELL

  const startX = W + cell
  const startY = cy(2.2)
  const pillarX = cx(PILLAR_COL + 0.5)
  const pillarY = cy(PILLAR_H * 0.55)
  const targetX = sellX > 0 ? sellX : pillarX
  const targetY = sellY > 0 ? sellY : pillarY
  if (loopT < B_HOLD) {
    cursor.x = startX
    cursor.y = startY
  } else if (loopT < B_MOVE_A) {
    const k = easeInOut((loopT - B_HOLD) / (B_MOVE_A - B_HOLD))
    cursor.x = startX + (pillarX - startX) * k
    cursor.y = startY + (pillarY - startY) * k
  } else if (loopT < B_DWELL) {
    cursor.x = pillarX
    cursor.y = pillarY
  } else if (loopT < B_MOVE_B) {
    const k = easeInOut((loopT - B_DWELL) / (B_MOVE_B - B_DWELL))
    cursor.x = pillarX + (targetX - pillarX) * k
    cursor.y = pillarY + (targetY - pillarY) * k
  } else {
    cursor.x = targetX
    cursor.y = targetY
  }

  let pulse = 0
  if (loopT >= B_MOVE_A && loopT < B_CLICK_A) {
    pulse = 1 - (loopT - B_MOVE_A) / (B_CLICK_A - B_MOVE_A)
  }
  if (loopT >= B_MOVE_B && loopT < B_SELL + 140) {
    pulse = Math.max(pulse, 1 - (loopT - B_MOVE_B) / (B_SELL + 140 - B_MOVE_B))
  }

  // ── The sale, and everything it sets in motion ──
  if (!sold && loopT >= B_SELL) {
    sold = true
    const sx = PILLAR_COL + 0.5
    const sy = PILLAR_H * 0.6
    burst(coins, 7, (m, i) => {
      m.x = sx + (rnd() - 0.5) * 0.5
      m.y = sy + (rnd() - 0.5) * 1.4
      m.vx = (i % 2 === 0 ? 1 : -1) * (0.4 + rnd() * 0.9)
      m.vy = 3.4 + rnd() * 1.8
      m.r = 0.11 + rnd() * 0.05
      m.rot = 0
      m.vrot = 0
      m.ttl = 0.9
    })
    burst(dust, 10, (m) => {
      m.x = sx + (rnd() - 0.5) * 1.1
      m.y = rnd() * PILLAR_H
      m.vx = (rnd() - 0.5) * 1.6
      m.vy = 0.6 + rnd() * 1.2
      m.r = 0.16 + rnd() * 0.16
      m.rot = 0
      m.vrot = 0
      m.ttl = 0.75
    })
    // Seeded exactly as `resolveOrphans` seeds a collapse: a little spin so the
    // rubble tumbles, and deliberately NO horizontal drift — the blocks land
    // back on the columns they fell down.
    for (const b of arm) b.vrot = (rnd() - 0.5) * 3.2
  }

  // ── The falling arm ──
  if (sold) {
    let justLanded = false
    for (const b of arm) {
      if (b.landed) continue
      b.vy -= GRAVITY * dt
      b.dy += b.vy * dt
      b.rot += b.vrot * dt
      if (ARM_ROW + b.dy <= 0) {
        b.dy = -ARM_ROW
        b.rot = 0
        b.landed = true
        justLanded = true
      }
    }
    // Fired off the LANDING, not off a scheduled millisecond: the dust and the
    // deaths belong to the frame the rubble arrives, however the frame budget
    // has drifted by then.
    if (justLanded && !impacted) {
      impacted = true
      shake = reduced.value ? 0 : 1
      for (const m of monsters) if (m.dying < 0) m.dying = 0
      burst(dust, 24, (m) => {
        m.x = 0.2 + rnd() * (ARM_COLS.length - 0.4)
        m.y = rnd() * 0.35
        m.vx = (rnd() - 0.5) * 5.2
        m.vy = 1.4 + rnd() * 2.6
        m.r = 0.2 + rnd() * 0.26
        m.rot = 0
        m.vrot = 0
        m.ttl = 1.1 + rnd() * 0.4
      })
      burst(chips, 14, (m) => {
        m.x = 0.3 + rnd() * (ARM_COLS.length - 0.6)
        m.y = 0.3 + rnd() * 0.5
        m.vx = (rnd() - 0.5) * 7
        m.vy = 2.2 + rnd() * 3.4
        m.r = 0.06 + rnd() * 0.07
        m.rot = rnd() * 6.28
        m.vrot = (rnd() - 0.5) * 14
        m.ttl = 1.3
      })
    }
  }

  for (const m of monsters) if (m.dying >= 0) m.dying += dtMs * rate
  stepMotes(dust, dt, -1.1, 0.94)
  stepMotes(chips, dt, 20, 0.99)
  stepMotes(coins, dt, 11, 0.99)
  shake = Math.max(0, shake - dt * 3.2)

  // ── Paint ──
  const skyTop = cy(CONTENT_H + MARGIN)
  const sky = ctx.createLinearGradient(0, skyTop, 0, groundY)
  sky.addColorStop(0, 'rgba(20, 30, 52, 0)')
  sky.addColorStop(1, 'rgba(24, 40, 62, 0.55)')
  ctx.fillStyle = sky
  ctx.fillRect(0, skyTop, W, groundY - skyTop)

  // The battlefield's OWN meadow, so the demo's ground is the ground the player
  // just lost on rather than a green shelf.
  //
  // The painted strip when the art layer has one — same `tileBand`, same
  // mirrored repeat, so the field the player was looking at ten seconds ago is
  // the field the trick is demonstrated on. A flat gradient beside a painted
  // battlefield reads as a different game, and the whole point of this screen
  // is that what it shows is a thing that happens in THIS one.
  //
  // The gradient survives as the fallback, and it is not dead code: it is what
  // an art-overrides-off build draws, and what every build draws for the second
  // or so before the bitmap decodes.
  const band = cell * GROUND_BAND
  if (!paintMeadowBand(ctx, 0, groundY, W, band, originX)) {
    const meadow = ctx.createLinearGradient(0, groundY, 0, groundY + band)
    meadow.addColorStop(0, '#63a34a')
    meadow.addColorStop(0.3, '#4d8a38')
    meadow.addColorStop(0.72, '#3a6c2a')
    meadow.addColorStop(1, '#2c5220')
    ctx.fillStyle = meadow
    ctx.fillRect(0, groundY, W, band)
  }
  ctx.fillStyle = 'rgba(18, 34, 22, 0.5)'
  ctx.fillRect(0, groundY - Math.max(1, cell * 0.03), W, Math.max(1, cell * 0.03))

  ctx.save()
  if (shake > 0) {
    const a = shake * shake * cell * 0.14
    ctx.translate((rnd() - 0.5) * a, (rnd() - 0.5) * a)
  }

  // Trunk, and the guns on it covering the lane the monsters walk.
  TRUNK_STACK.forEach((id, r) => drawBody(ctx, id, TRUNK_COL, r, 1, 1, 0))
  drawBody(ctx, TRUNK_CROWN, TRUNK_COL, TRUNK_ROWS, 1, 1, 0)
  // Bodies first, then every fixture — so a barrel that overhangs the block
  // above it is drawn OVER that block rather than buried under it, which is the
  // order the battlefield paints a stacked tower in.
  //
  // Each is mirrored by the CALLER, as the battlefield mirrors it. Every
  // fixture is authored pointing +x and `paintLiveFixture` does not flip — so a
  // gun on the right of the lane, left to itself, sweeps the empty sky behind
  // the tower while the monsters walk in under its breech.
  //
  // Phase-shifted per rung, and that is the point of the whole stack: five guns
  // idling in lockstep read as one decal repeated, five on their own clocks
  // read as a tower that is manned.
  TRUNK_STACK.forEach((id, r) => {
    drawTrunkGun(ctx, id, r, 11 + r, Math.sin(clock / 1600 + r * 1.3) * 0.22 + 0.1)
  })
  drawTrunkGun(ctx, TRUNK_CROWN, TRUNK_ROWS, 7, Math.sin(clock / 1600) * 0.3 + 0.16)

  // The pillar, while it still exists.
  if (!sold) {
    drawBody(ctx, 'stone', PILLAR_COL, 0, 1, PILLAR_H, 0)
    if (loopT >= B_CLICK_A) {
      // Inspected. A ring rather than a tint: the player has to still be able
      // to read WHICH block is about to be sold, and a colour wash hid the
      // material that identifies it.
      const ring = 0.5 + 0.5 * Math.sin(clock / 190)
      ctx.save()
      ctx.strokeStyle = `rgba(255, 217, 60, ${0.55 + ring * 0.45})`
      ctx.lineWidth = Math.max(2, cell * 0.07)
      ctx.strokeRect(
        cx(PILLAR_COL) - cell * 0.04, cy(PILLAR_H) - cell * 0.04,
        cell * 1.08, cell * PILLAR_H + cell * 0.08
      )
      ctx.restore()
    }
  }

  // Monsters BEFORE the arm: the rubble has to land ON TOP of them, or the
  // crush reads as blocks falling politely behind the crowd.
  const cycle = clock / 780
  monsters.forEach((m, i) => { drawMonster(ctx, m, mScale, cycle + m.phase + i * 0.17) })

  ARM_COLS.forEach((c, i) => {
    const b = arm[i]
    if (!b) return
    drawBody(ctx, ARM_TYPES[i] ?? 'wood', c, ARM_ROW + b.dy, 1, 1, b.rot)
  })

  for (const m of chips) {
    if (m.ttl <= 0 || m.age >= m.ttl) continue
    const k = 1 - m.age / m.ttl
    ctx.save()
    ctx.globalAlpha = clamp01(k * 1.6) * sceneAlpha
    ctx.translate(cx(m.x), cy(m.y))
    ctx.rotate(m.rot)
    ctx.fillStyle = '#8b7a5e'
    ctx.fillRect(-m.r * cell, -m.r * cell, m.r * cell * 2, m.r * cell * 2)
    ctx.restore()
  }

  for (const m of dust) {
    if (m.ttl <= 0 || m.age >= m.ttl) continue
    const k = m.age / m.ttl
    ctx.save()
    // Thin and warm. At half opacity over a dark scrim the same puffs read as
    // grey smoke bubbles sitting in front of the tower rather than as dust
    // kicked off the ground by it.
    ctx.globalAlpha = (1 - k) * 0.3 * sceneAlpha
    ctx.fillStyle = '#e6d8ba'
    ctx.beginPath()
    ctx.arc(cx(m.x), cy(m.y), m.r * cell * (0.6 + k * 1.2), 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  for (const m of coins) {
    if (m.ttl <= 0 || m.age >= m.ttl) continue
    const k = 1 - m.age / m.ttl
    ctx.save()
    ctx.globalAlpha = clamp01(k * 1.4) * sceneAlpha
    ctx.beginPath()
    ctx.arc(cx(m.x), cy(m.y), m.r * cell, 0, Math.PI * 2)
    ctx.fillStyle = '#ffd93c'
    ctx.fill()
    ctx.lineWidth = Math.max(1, cell * 0.02)
    ctx.strokeStyle = '#8a6a12'
    ctx.stroke()
    ctx.restore()
  }

  ctx.restore()

  const cur = cursorRef.value
  const cctx = cur?.getContext('2d') ?? null
  if (cur && cctx) {
    if (cur.width !== Math.round(W * dpr) || cur.height !== Math.round(H * dpr)) {
      cur.width = Math.round(W * dpr)
      cur.height = Math.round(H * dpr)
      cursorDirty.s = 0
    }
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawCursor(cctx, pulse)
  }
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────

const stage = (): void => {
  monsters.length = 0
  const def = ENEMY_DEFS[DEMO_ENEMY]
  // Three of them, spread across the middle of the arm's shadow. The uids are
  // fixed, so the grunt's pair of bodies alternates the same way every loop.
  const xs = [1.7, 2.9, 4.1]
  const ids: string[] = []
  xs.forEach((x, i) => {
    const id = pickMonster(def?.monster, i)
    if (id) ids.push(id)
    monsters.push({ id, x, phase: i * 0.31, dying: -1 })
  })
  // Bake before the first draw. The strips are shared with the battlefield's
  // cache, so on a second death this costs nothing at all.
  if (ids.length > 0) primeMonsterSprites(ids)
}

const stop = (): void => {
  if (raf !== 0) cancelAnimationFrame(raf)
  raf = 0
  last = 0
}

const begin = (): void => {
  stop()
  stage()
  resetLoop()
  loopT = 0
  clock = 0
  needMeasure = true
  openedAt = performance.now()
  raf = requestAnimationFrame(paint)
}

const dismiss = (): void => {
  // The click that closed the previous screen is still in flight for a few
  // frames. Without this the demo opens and vanishes inside one gesture and
  // the player never learns the trick they just died for want of.
  if (performance.now() - openedAt < OPEN_GUARD_MS) return
  emit('update:modelValue', false)
  emit('continue')
}

const onContinueKey = (e: KeyboardEvent): void => {
  if (!props.modelValue) return
  if (e.code !== 'Space' && e.code !== 'Enter' && e.code !== 'NumpadEnter') return
  // Skip when focus is on a typing target — the debug toolbar's inputs live
  // behind this overlay.
  const el = e.target
  if (el instanceof HTMLElement) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return
    if (el.isContentEditable) return
  }
  e.preventDefault()
  dismiss()
}

watch(() => props.modelValue, (open) => {
  if (open) {
    // Stamped HERE rather than in `begin`, which runs a frame later: the root
    // element is clickable from the moment it renders, and a guard that starts
    // late is a guard the stale click walks straight through.
    openedAt = performance.now()
    window.addEventListener('keydown', onContinueKey)
    // One frame of slack, so the canvas has a box to measure before the first
    // paint — a zero-width canvas lays the scene out at cell 0 and the first
    // thing the player sees is a blank screen.
    requestAnimationFrame(begin)
  } else {
    window.removeEventListener('keydown', onContinueKey)
    stop()
  }
}, { immediate: true })

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    syncMotion()
    motionQuery.addEventListener('change', syncMotion)
  }
})

// A rAF that outlives its component keeps a whole scene alive and repaints it
// forever behind whatever the player navigated to.
onBeforeUnmount(() => {
  stop()
  window.removeEventListener('keydown', onContinueKey)
  motionQuery?.removeEventListener('change', syncMotion)
  motionQuery = null
})
</script>

<template lang="pug">
  Transition(name="trap-fade")
    div.trap(v-if="modelValue" @click="dismiss")
      canvas.trap__canvas(ref="canvasRef")

      //- The mock inspector. It is never interactive — the fake cursor
      //- "presses" it — but it is styled off the real card so the SELL control
      //- the player meets on their next run is one they have watched work.
      div.trap__panel(:style="panelStyle")
        div.trap__card(:class="{ 'is-open': panelOpen }")
          div.trap__card-head
            BlockTile(type-id="stone" :size="22")
            div.trap__card-bars
              i.trap__bar
              i.trap__bar.is-short
          button.trap__sell(
            ref="sellRef"
            type="button"
            tabindex="-1"
            aria-hidden="true"
            :class="{ 'is-pressed': sellPressed }"
          )
            span {{ t('blocks.sell') }}
            span.trap__sell-refund
              span +3
              IconGold.trap__res-icon

      //- After the card in the DOM, so the pointer is over it rather than under.
      canvas.trap__cursor(ref="cursorRef")

      div.trap__hint.animate-pulse
        div.text-white.font-black.uppercase.italic.tracking-widest.brawl-text(
          :class="isMobile ? 'text-xs' : 'text-sm md:text-2xl'"
        )
          | {{ isMobile ? t('tapToContinue') : t('clickToContinue') }}
</template>

<style scoped lang="sass">
// Above the coach marks (40) AND above the result screen (100): this is shown
// ON the defeat panel, and a demo painted underneath it is a demo nobody sees.
.trap
  position: fixed
  inset: 0
  z-index: 120
  background-color: rgba(6, 10, 18, 0.86)
  // NO `backdrop-filter`. Chrome drops this element's own background-colour
  // when a backdrop filter is on it and the layer underneath is a large
  // canvas — the scrim vanishes and the card is drawn straight over a live
  // battlefield, which is unreadable. Reproduced in a headless capture at
  // 1280x800 and fixed by removing the filter alone; the same software
  // compositing path is what a cheap Android falls back to, and this card
  // ships to phones on portals. The flat scrim below carries the contrast on
  // its own, so the blur was buying nothing that could be risked.
  cursor: pointer
  touch-action: none
  -webkit-tap-highlight-color: transparent

.trap__canvas,
.trap__cursor
  position: absolute
  inset: 0
  width: 100%
  height: 100%

.trap__cursor
  pointer-events: none

// ─── Mock inspector ─────────────────────────────────────────────────────────
//
// Sized off `--cell` rather than off the viewport, and anchored by its bottom
// edge so no height measurement is needed to hang it off the arm.

.trap__panel
  position: absolute
  pointer-events: none
  width: calc(var(--cell) * 3.1)
  transform: translateY(-100%)

.trap__card
  display: flex
  flex-direction: column
  gap: calc(var(--cell) * 0.09)
  padding: calc(var(--cell) * 0.13)
  border: 2px solid #0f1a30
  border-radius: calc(var(--cell) * 0.2)
  background-image: linear-gradient(to bottom, rgba(38, 56, 96, 0.96), rgba(18, 30, 56, 0.96))
  box-shadow: 0 3px 0 #0d1830
  font-size: calc(var(--cell) * 0.24)
  transform-origin: 20% 100%
  opacity: 0
  scale: 0.82
  transition: opacity 140ms ease-out, scale 140ms ease-out

  &.is-open
    opacity: 1
    scale: 1

.trap__card-head
  display: flex
  align-items: center
  gap: calc(var(--cell) * 0.1)

.trap__card-bars
  display: flex
  flex-direction: column
  gap: 0.28em
  flex: 1

// Stand-ins for the card's stat rows. Deliberately blank: the real card is a
// wall of localised numbers, and this demo needs the player looking at the
// button, not reading a spec sheet for a block that does not exist.
.trap__bar
  height: 0.42em
  border-radius: 999px
  background-color: rgba(255, 255, 255, 0.22)

  &.is-short
    width: 55%
    background-color: rgba(255, 255, 255, 0.13)

// The real sell button's gradient, rim, radius and weight — recognition is the
// entire job of this element.
.trap__sell
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: 0.2em 0.4em
  min-height: 1.9em
  padding: 0.2em 0.5em
  border: 2px solid #0f1a30
  border-radius: 0.5em
  background-image: linear-gradient(to bottom, #ff8a5a, #c62828)
  color: #fff
  font-weight: 900
  text-transform: uppercase
  font-size: 0.92em
  line-height: 1.05
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.6)
  transition: translate 90ms ease-out, scale 90ms ease-out

  &.is-pressed
    translate: 0 2px
    scale: 0.97

.trap__sell-refund
  display: inline-flex
  align-items: center
  gap: 0.15em
  font-variant-numeric: tabular-nums

.trap__res-icon
  flex: 0 0 auto
  width: 1.35em
  height: 1.35em

// ─── Continue hint ──────────────────────────────────────────────────────────

.trap__hint
  position: absolute
  left: 0
  right: 0
  bottom: calc(1rem + env(safe-area-inset-bottom, 0px))
  display: flex
  justify-content: center
  pointer-events: none

.brawl-text
  text-shadow: 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000

.trap-fade-enter-active, .trap-fade-leave-active
  transition: opacity 260ms ease

.trap-fade-enter-from, .trap-fade-leave-to
  opacity: 0

// Reduced motion gives up the CHROME's motion only. The demo itself keeps
// running — slower, and without the impact shake — because freezing it would
// leave a still life of a tower with a pillar under it, which teaches nothing.
@media (prefers-reduced-motion: reduce)
  .trap__hint
    animation: none

  .trap__card
    transition: none

  .trap__sell
    transition: none
</style>

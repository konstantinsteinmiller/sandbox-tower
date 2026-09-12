<template lang="pug">
  Transition(name="mg-fade")
    //- The whole overlay is the button. There is no control to find, no Next
    //- and no X — anywhere on the screen advances, which is the only affordance
    //- a five-year-old and a player two seconds from closing the tab both hit.
    div.merge-guide(
      v-if="modelValue"
      @click="onTap"
    )
      canvas.merge-guide__canvas(ref="canvasEl" aria-hidden="true")

      //- The same tap/click hint the reward screen uses, so "this screen is
      //- waiting for you" looks identical everywhere in the game.
      div.flex.justify-center.animate-pulse.pointer-events-none(
        :class="isCompact ? 'shrink-0 pt-1 pb-1' : 'absolute bottom-8 left-0 right-0 sm:bottom-12'"
      )
        div.text-white.font-black.uppercase.italic.tracking-widest.brawl-text(
          :class="isCompact ? 'text-xs' : 'text-sm md:text-2xl'"
        )
          | {{ isMobile ? t('tapToContinue') : t('clickToContinue') }}
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { isMobileLandscape, isShortViewport } from '@/use/useUser'
import { onArtChanged } from '@/game/art'
import {
  paintWorldBlock, paintLiveFixture, paintTierPlate, gunSpanForTier, fixtureSpanForCellTier
} from '@/use/useTowerArt'

/**
 * ─── Merge guide ────────────────────────────────────────────────────────────
 *
 * The one beat of the first run that is not about a button.
 *
 * Merging is what holds playtime — the long runs are the ones where the player
 * is still welding at wave 30 — but the tutorial can only make them perform ONE
 * merge, by standing a cannon next to a cannon. A player who fuses once has
 * learned that two blocks stick together. That is not the mechanic. The
 * mechanic is that THE LADDER KEEPS GOING: the thing they just made is itself
 * an ingredient, and four welds deep there is a single gun straddling eight
 * cells of masonry. Nothing on the battlefield says so until the player has
 * already built it, which is the loop they have to believe in to reach.
 *
 * So this card fires the instant their first merge lands, while they are still
 * looking at the thing they made, and it shows them where it goes.
 *
 * TWO RULES:
 *
 *   1. **WORDLESS.** Same argument as the coach marks — see TutorialOverlay's
 *      header, rule 2. This ships to children on portals in twenty-odd
 *      languages, reading is where they leave, and no sentence beats a picture
 *      of two cannons becoming a bigger cannon. The `+`, the arrow and the
 *      growing footprints ARE the sentence. The tap hint is the only copy on
 *      screen and it reuses a key that already exists in every locale.
 *   2. **It is drawn by the BATTLEFIELD'S painters, at the battlefield's
 *      arithmetic** — `paintWorldBlock`, `paintLiveFixture`, `paintTierPlate`
 *      and the same `gunSpanForTier` / footprint-centre / plate-corner
 *      maths `drawBlock` and `drawBlockOverlays` use. A promise drawn from a
 *      private copy of the geometry is a promise about a different game: retune
 *      the merged art and a lookalike quietly starts lying about the reward,
 *      and nobody finds out, because the card agrees with itself. See
 *      Playground's header, rule 1.
 */

interface Props {
  /** Open state. */
  modelValue: boolean
  /**
   * Which merge the board actually performs.
   *
   * `footprint` is the desktop tower: a weld KEEPS its halves' cells, so the
   * ladder is about the thing getting physically bigger — 2x1, 2x2, 4x2.
   * `cell` is the Drop & Merge board (`mergeArt: 'cell'`, `maxMergeTier:
   * Infinity`), where the weld always lands in ONE cell and the footprint never
   * changes; there the ladder is about DEPTH, and the growing-rectangle picture
   * would be a promise the board does not keep.
   */
  variant?: 'footprint' | 'cell'
}
const props = withDefaults(defineProps<Props>(), { variant: 'footprint' })

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  /** The player clicked/tapped through. Parent advances the tutorial. */
  (e: 'continue'): void
}>()

const { t } = useI18n()

// Short-viewport treatment, the same split FReward makes: mobile landscape OR
// any short embed. In both the hint has to flow INLINE rather than float at the
// bottom, where it otherwise lands on top of the bottom rung of the ladder.
const isCompact = computed(() => isMobileLandscape.value || isShortViewport.value)

const isMobile = computed(() => {
  return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
})

// ─── The ladder ─────────────────────────────────────────────────────────────
//
// Footprints per tier, as the board actually welds them: a tier doubles the
// AREA but widens one axis at a time — 1×1, 2×1, 2×2, 4×2, 4×4. Written out
// rather than derived, because a wrong footprint here is a wrong promise, and a
// literal is the thing someone can check against the board.

interface Rung {
  /** One input's footprint in cells, and its tier. Unused when `open`. */
  inW: number
  inH: number
  inTier: number
  /** What two of them weld into. */
  outW: number
  outH: number
  outTier: number
  /** The "and it keeps going" rung: an ellipsis and a ghost, no inputs. */
  open: boolean
}

/** The desktop tower: the weld keeps both halves' cells. */
const RUNGS_FOOTPRINT: Rung[] = [
  { inW: 1, inH: 1, inTier: 1, outW: 2, outH: 1, outTier: 2, open: false },
  { inW: 2, inH: 1, inTier: 2, outW: 2, outH: 2, outTier: 3, open: false },
  { inW: 2, inH: 2, inTier: 3, outW: 4, outH: 2, outTier: 4, open: false },
  { inW: 0, inH: 0, inTier: 0, outW: 4, outH: 4, outTier: 5, open: true }
]

/**
 * The Drop & Merge board: every weld collapses back into ONE cell.
 *
 * Same footprint on both sides of every arrow, and that identity IS the lesson.
 * On a five-column board the thing a player has to believe before they will
 * spend a column on it is that a single cell can hold an arbitrarily deep gun —
 * the tier climbs, the frontage does not, and the only price is the space they
 * gave up stacking twins on top of each other. A ladder of growing rectangles
 * here would teach the opposite of the board they are playing.
 *
 * So the plate carries the whole story, which is why this variant is allowed a
 * bigger cell: with nothing widening, the pixels go into making the number on
 * the plate unmistakable.
 */
const RUNGS_CELL: Rung[] = [
  { inW: 1, inH: 1, inTier: 1, outW: 1, outH: 1, outTier: 2, open: false },
  { inW: 1, inH: 1, inTier: 2, outW: 1, outH: 1, outTier: 3, open: false },
  { inW: 1, inH: 1, inTier: 3, outW: 1, outH: 1, outTier: 4, open: false },
  { inW: 0, inH: 0, inTier: 0, outW: 1, outH: 1, outTier: 5, open: true }
]

const rungs = computed(() => props.variant === 'cell' ? RUNGS_CELL : RUNGS_FOOTPRINT)

/** The block the tutorial just put in their hands. The ladder has to be ITS. */
const BLOCK_ID = 'cannon'

// Everything below is in CELLS until the very last multiply, so one `cell`
// number reflows the whole card and no gap can drift out of proportion with
// the art it is separating.
const GLYPH = 0.9
const ARROW = 1.08
const GAP = 0.5
/** Headroom above a footprint for the gun, which overflows its block by design. */
const HEAD = 0.8
const PAD_C = 0.45
const ROW_GAP = 0.55
const COL_GAP = 0.7
/** Past this, a desktop card is just a very large picture of a cannon. The cell
 *  ladder gets more room because nothing in it grows — every pixel it is given
 *  goes into the tier plate, which is the only thing that changes down the
 *  rungs and therefore the only thing carrying the lesson. */
const CELL_MAX_FOOTPRINT = 54
const CELL_MAX_CELL = 78

const rungW = (r: Rung): number => r.open
  ? GLYPH * 1.5 + GAP + ARROW + GAP + r.outW
  : r.inW + GAP + GLYPH + GAP + r.inW + GAP + ARROW + GAP + r.outW

const rungH = (r: Rung): number => Math.max(r.inH, r.outH) + HEAD

/** Every rung gets the widest rung's box, so the four read as one ladder. */
const panelW = computed(() => Math.max(...rungs.value.map(rungW)) + PAD_C * 2)
const cellMax = computed(() => props.variant === 'cell' ? CELL_MAX_CELL : CELL_MAX_FOOTPRINT)

// ─── Painting ───────────────────────────────────────────────────────────────

const canvasEl = ref<HTMLCanvasElement | null>(null)

const YELLOW_TOP = '#ffe98a'
const YELLOW_MID = '#ffd02a'
const YELLOW_BOT = '#f79000'
const INK = '#5a3200'

const roundRect = (
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

const goldFill = (
  ctx: CanvasRenderingContext2D, top: number, bottom: number
): CanvasGradient => {
  const g = ctx.createLinearGradient(0, top, 0, bottom)
  g.addColorStop(0, YELLOW_TOP)
  g.addColorStop(0.45, YELLOW_MID)
  g.addColorStop(1, YELLOW_BOT)
  return g
}

/**
 * One block of the ladder, painted the way `drawBlock` and `drawBlockOverlays`
 * paint a merged block.
 *
 * The three things that must not drift from the battlefield:
 *
 *   - the BODY is ONE face stretched across the whole footprint, baked at the
 *     footprint's LONGEST edge — not the cell sprite tiled, which is the "neat
 *     pile of little crates" look a merge exists to stop looking like.
 *     `paintWorldBlock` is square-only, so the stretch happens in the
 *     transform; that lands the identical
 *     `drawImage(blockFace(id, 0, max(fw, fh)), …, fw, fh)`.
 *   - ONE gun for the whole span, centred on the footprint, sized by
 *     `gunSpanForTier` (the weapon's `fixtureArtSpan` on the canonical
 *     footprint) and lifted by only what overhangs the underside — the `* 0.6`
 *     is the battlefield's, not a number that looked right here.
 *   - the plate is riveted INSIDE the top-right corner at the same two offsets,
 *     so how deep a weld goes reads the same here as it does in the tower.
 */
const drawRungBlock = (
  ctx: CanvasRenderingContext2D,
  leftX: number, bottomY: number,
  cells: { w: number; h: number; tier: number },
  cell: number, aim: number, tMs: number, uid: number
): void => {
  const fw = cells.w * cell
  const fh = cells.h * cell
  const topY = bottomY - fh
  const face = Math.max(fw, fh)

  ctx.save()
  ctx.translate(leftX, topY)
  ctx.scale(fw / face, fh / face)
  paintWorldBlock(ctx, BLOCK_ID, 0, 0, face)
  ctx.restore()

  // `mergeArtSpan` answers the cell ladder's small per-tier growth when the
  // ruleset says `mergeArt: 'cell'`, so a card drawn for that board has to as
  // well — a gun that spilled further here would be advertising a block the
  // board never builds.
  const span = props.variant === 'cell'
    ? fixtureSpanForCellTier(cells.tier)
    : gunSpanForTier(cells.tier)
  const cx = leftX + fw / 2
  const cy = topY + fh / 2
  const fy = cy - cell * (Math.max(0, (span - cells.h) / 2) * 0.6)
  // With the tier, so each rung shows the gun that tier actually fields — one
  // gun, heavier at every rung — in its colour.
  paintLiveFixture(ctx, BLOCK_ID, cx, fy, cell * span, { aim, t: tMs, uid, col: 1, tier: cells.tier })

  if (cells.tier > 1) {
    paintTierPlate(ctx, cells.tier, leftX + fw - cell * 0.2, topY + cell * 0.17, cell)
  }
}

/** The `+`. Two blocks are a sum, and a sum is the same glyph in every locale. */
const drawPlus = (
  ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number
): void => {
  const arm = s * 0.5
  const th = s * 0.235
  ctx.save()
  ctx.fillStyle = goldFill(ctx, cy - arm, cy + arm)
  ctx.strokeStyle = INK
  ctx.lineWidth = Math.max(1.5, s * 0.1)
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - th / 2, cy - arm)
  ctx.lineTo(cx + th / 2, cy - arm)
  ctx.lineTo(cx + th / 2, cy - th / 2)
  ctx.lineTo(cx + arm, cy - th / 2)
  ctx.lineTo(cx + arm, cy + th / 2)
  ctx.lineTo(cx + th / 2, cy + th / 2)
  ctx.lineTo(cx + th / 2, cy + arm)
  ctx.lineTo(cx - th / 2, cy + arm)
  ctx.lineTo(cx - th / 2, cy + th / 2)
  ctx.lineTo(cx - arm, cy + th / 2)
  ctx.lineTo(cx - arm, cy - th / 2)
  ctx.lineTo(cx - th / 2, cy - th / 2)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

/** The fuse arrow — same gold and same dark outline as the coach-mark arrow,
 *  so the two tutorial beats are visibly the same voice talking. */
const drawArrow = (
  ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number
): void => {
  const half = s * 0.5
  const shaft = s * 0.24
  const headW = s * 0.42
  const headH = s * 0.62
  ctx.save()
  ctx.fillStyle = goldFill(ctx, cy - headH / 2, cy + headH / 2)
  ctx.strokeStyle = INK
  ctx.lineWidth = Math.max(1.5, s * 0.1)
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - half, cy - shaft / 2)
  ctx.lineTo(cx + half - headW, cy - shaft / 2)
  ctx.lineTo(cx + half - headW, cy - headH / 2)
  ctx.lineTo(cx + half, cy)
  ctx.lineTo(cx + half - headW, cy + headH / 2)
  ctx.lineTo(cx + half - headW, cy + shaft / 2)
  ctx.lineTo(cx - half, cy + shaft / 2)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

/** Three dots — "and on, and on". The entire reason the fourth rung is there. */
const drawEllipsis = (
  ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number
): void => {
  const r = s * 0.115
  const step = s * 0.36
  ctx.save()
  ctx.fillStyle = goldFill(ctx, cy - r, cy + r)
  ctx.strokeStyle = INK
  ctx.lineWidth = Math.max(1, s * 0.07)
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    ctx.arc(cx + i * step, cy, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }
  ctx.restore()
}

const drawRung = (
  ctx: CanvasRenderingContext2D, r: Rung, index: number,
  x: number, y: number, w: number, h: number, cell: number, tMs: number, aim: number
): void => {
  // A plate behind each rung. The card floats over a live battlefield, and dark
  // block art on a dark tower is where a picture stops being a picture.
  ctx.save()
  ctx.fillStyle = 'rgba(12, 20, 34, 0.55)'
  ctx.strokeStyle = 'rgba(255, 214, 80, 0.22)'
  ctx.lineWidth = 1
  roundRect(ctx, x, y, w, h, cell * 0.3)
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  const contentW = rungW(r) * cell
  let cx = x + (w - contentW) / 2
  // Every footprint in a rung stands on the SAME line, so the row reads as
  // blocks on ground rather than as three diagrams floating at three heights.
  const bottomY = y + h - PAD_C * cell
  const midY = bottomY - Math.max(r.inH, r.outH) * cell * 0.5

  if (r.open) {
    // The ghost rung, faded on purpose. A fourth SOLID panel reads as the last
    // item of a four-item list, which is the exact opposite of the point: the
    // ladder does not stop at 4×2, it stops where the player stops.
    drawEllipsis(ctx, cx + GLYPH * 0.75 * cell, midY, GLYPH * 1.5 * cell)
    cx += GLYPH * 1.5 * cell + GAP * cell
    drawArrow(ctx, cx + ARROW * cell * 0.5, midY, ARROW * cell)
    cx += ARROW * cell + GAP * cell
    ctx.save()
    ctx.globalAlpha = 0.4
    drawRungBlock(ctx, cx, bottomY,
      { w: r.outW, h: r.outH, tier: r.outTier }, cell, aim, tMs, index * 10 + 3)
    ctx.restore()
    return
  }

  const input = { w: r.inW, h: r.inH, tier: r.inTier }
  drawRungBlock(ctx, cx, bottomY, input, cell, aim, tMs, index * 10 + 1)
  cx += r.inW * cell + GAP * cell
  drawPlus(ctx, cx + GLYPH * cell * 0.5, midY, GLYPH * cell)
  cx += GLYPH * cell + GAP * cell
  drawRungBlock(ctx, cx, bottomY, input, cell, aim, tMs, index * 10 + 2)
  cx += r.inW * cell + GAP * cell
  drawArrow(ctx, cx + ARROW * cell * 0.5, midY, ARROW * cell)
  cx += ARROW * cell + GAP * cell
  drawRungBlock(ctx, cx, bottomY,
    { w: r.outW, h: r.outH, tier: r.outTier }, cell, aim, tMs, index * 10 + 3)
}

/**
 * How many columns, and how big a cell.
 *
 * Both candidate layouts are costed and the roomier one wins, rather than
 * branching on an orientation flag. The card has to survive a 320×658 phone —
 * where one column at roughly 22 px a cell is the only thing that fits — AND a
 * landscape phone barely 320 px tall, where one column is seventeen cells of
 * height and there is no cell size at which that works. A measured choice
 * cannot be wrong about the viewport nobody thought to test.
 */
const chooseLayout = (availW: number, availH: number): { cols: number; cell: number } => {
  let best = { cols: 1, cell: 0 }
  for (const cols of [1, 2]) {
    const rows: Rung[][] = []
    const list = rungs.value
    for (let i = 0; i < list.length; i += cols) rows.push(list.slice(i, i + cols))
    const gridW = panelW.value * cols + COL_GAP * (cols - 1)
    const gridH = rows.reduce(
      (acc, row) => acc + Math.max(...row.map(rungH)) + PAD_C * 2, 0
    ) + ROW_GAP * (rows.length - 1)
    const cell = Math.min(availW / gridW, availH / gridH)
    if (cell > best.cell) best = { cols, cell }
  }
  best.cell = Math.min(best.cell, cellMax.value)
  return best
}

const paint = (now: number): void => {
  const cv = canvasEl.value
  if (!cv) return
  const ctx = cv.getContext('2d')
  if (!ctx) return

  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const W = cv.clientWidth
  const H = cv.clientHeight
  if (W <= 0 || H <= 0) return
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
    cv.width = Math.round(W * dpr)
    cv.height = Math.round(H * dpr)
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, W, H)

  const tMs = motionOK ? now : 0
  // A barrel frozen dead flat reads as a pipe. A few degrees of elevation is
  // what makes the silhouette a cannon in a still — which is all this card ever
  // is for a player who has motion turned off.
  const aim = motionOK ? -0.22 + Math.sin(now / 1600) * 0.16 : -0.22

  const margin = Math.min(W, H) * 0.04
  const availW = Math.max(1, W - margin * 2)
  const availH = Math.max(1, H - margin * 2)
  const { cols, cell } = chooseLayout(availW, availH)

  const rows: Rung[][] = []
  const list = rungs.value
  for (let i = 0; i < list.length; i += cols) rows.push(list.slice(i, i + cols))
  const rowH = rows.map(row => Math.max(...row.map(rungH)) * cell + PAD_C * 2 * cell)
  const gridW = (panelW.value * cols + COL_GAP * (cols - 1)) * cell
  const gridH = rowH.reduce((a, b) => a + b, 0) + ROW_GAP * cell * (rows.length - 1)

  const originX = (W - gridW) / 2
  let y = (H - gridH) / 2
  let index = 0
  rows.forEach((row, ri) => {
    // A short row — the last one, when the count does not divide — centres
    // rather than hanging off the left edge of the grid.
    const rowW = (panelW.value * row.length + COL_GAP * (row.length - 1)) * cell
    const height = rowH[ri] ?? 0
    let x = originX + (gridW - rowW) / 2
    for (const r of row) {
      drawRung(ctx, r, index, x, y, panelW.value * cell, height, cell, tMs, aim)
      x += (panelW.value + COL_GAP) * cell
      index++
    }
    y += height + ROW_GAP * cell
  })
}

// ─── Repaint scheduling ─────────────────────────────────────────────────────
//
// The art layer is ASYNC: a painted cannon decodes some frames after this card
// opens, and a canvas that paints once captures the procedural look and keeps
// it forever — the bug `onArtChanged` exists for. With motion allowed the loop
// covers that for free; it is one card on a paused screen. With motion
// suppressed there is no loop, so the art subscription and the resize observer
// are the only things keeping the picture current.

const motionOK = typeof window === 'undefined' || typeof window.matchMedia !== 'function'
  ? true
  : !window.matchMedia('(prefers-reduced-motion: reduce)').matches

let raf = 0
let pending = 0
let active = false
let stopArt: (() => void) | null = null
let ro: ResizeObserver | null = null

const loop = (now: number): void => {
  raf = requestAnimationFrame(loop)
  paint(now)
}

/** One coalesced frame, for the no-motion path where nothing else repaints. */
const requestPaint = (): void => {
  if (raf || pending) return
  pending = requestAnimationFrame((now) => { pending = 0; paint(now) })
}

const stopPainting = (): void => {
  active = false
  if (raf) { cancelAnimationFrame(raf); raf = 0 }
  if (pending) { cancelAnimationFrame(pending); pending = 0 }
  stopArt?.()
  stopArt = null
  ro?.disconnect()
  ro = null
}

// Idempotent, because two paths race to call it on the very first open: the
// immediate watcher (which has to defer a frame, having run before the canvas
// existed) and `onMounted`. Without the guard the second call tears down the
// loop and the art subscription the first one just made.
const startPainting = (): void => {
  if (active) return
  active = true
  if (motionOK) raf = requestAnimationFrame(loop)
  else requestPaint()
  stopArt = onArtChanged(() => { if (!motionOK) requestPaint() })
  const cv = canvasEl.value
  if (cv && typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => requestPaint())
    ro.observe(cv)
  }
}

// ─── Dismissal ──────────────────────────────────────────────────────────────

// Latched, not just gated on `modelValue`: props do not change until the parent
// has reacted, so a double-tap — or a tap plus the Space its own hint invited —
// would otherwise advance the tutorial twice and skip the `call` beat entirely.
let dismissed = false

const onTap = (): void => {
  if (!props.modelValue || dismissed) return
  dismissed = true
  // Closes itself as well as reporting: the card has nothing left to say once
  // it has been read, and a parent that only listens for `continue` would
  // otherwise leave it standing over the beat it just handed off to.
  emit('update:modelValue', false)
  emit('continue')
}

// Desktop shortcut: Space / Enter does exactly what the tap does. Attached only
// while the card is up, so the game scene behind it keeps its own keys the rest
// of the time — and removed on unmount, or a closed card goes on eating them.
const onContinueKey = (e: KeyboardEvent): void => {
  if (!props.modelValue) return
  if (e.code !== 'Space' && e.code !== 'Enter' && e.code !== 'NumpadEnter') return
  // Skip when focus is on a typing target — the dev toolbar has inputs, and
  // eating a space inside one of them is maddening to diagnose.
  const target = e.target
  if (target instanceof HTMLElement) {
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return
    if (target.isContentEditable) return
  }
  e.preventDefault()
  onTap()
}

watch(() => props.modelValue, (open) => {
  if (open) {
    dismissed = false
    window.addEventListener('keydown', onContinueKey)
    // The canvas is created by this same flip, so it does not exist yet — and a
    // canvas measured before layout has a client size of zero and paints
    // nothing.
    requestAnimationFrame(() => { if (props.modelValue) startPainting() })
  } else {
    window.removeEventListener('keydown', onContinueKey)
    stopPainting()
  }
}, { immediate: true })

onMounted(() => { if (props.modelValue) startPainting() })

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onContinueKey)
  stopPainting()
})
</script>

<style scoped lang="sass">
.merge-guide
  position: fixed
  inset: 0
  // Above the coach marks (z-index 40). This beat fires while the tutorial is
  // still running, and underneath them the card would sit behind the dim layer.
  z-index: 45
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  background-color: rgba(6, 10, 20, 0.82)
  // NO `backdrop-filter`. Chrome drops this element's own background-colour
  // when a backdrop filter is on it and the layer underneath is a large
  // canvas — the scrim vanishes and the card is drawn straight over a live
  // battlefield, which is unreadable. Reproduced in a headless capture at
  // 1280x800 and fixed by removing the filter alone; the same software
  // compositing path is what a cheap Android falls back to, and this card
  // ships to phones on portals. The flat scrim below carries the contrast on
  // its own, so the blur was buying nothing that could be risked.
  cursor: pointer
  // The card is the click target and the battlefield behind it is mid-tutorial:
  // a scroll or a pinch that reached it would move the board under the lesson.
  touch-action: none
  padding-top: calc(0.75rem + env(safe-area-inset-top, 0px))
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px))
  padding-left: calc(0.75rem + env(safe-area-inset-left, 0px))
  padding-right: calc(0.75rem + env(safe-area-inset-right, 0px))

.merge-guide__canvas
  display: block
  width: 100%
  // `min-height: 0` is what lets the canvas give room back to the inline hint
  // in the compact layout instead of pushing it off the bottom of the screen.
  flex: 1 1 auto
  min-height: 0

.brawl-text
  text-shadow: 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000

.mg-fade-enter-active, .mg-fade-leave-active
  transition: opacity 0.25s ease

.mg-fade-enter-from, .mg-fade-leave-to
  opacity: 0

// Nothing here is load-bearing motion: the aim sweep, the fade and the hint's
// pulse are decoration, and the picture is complete without any of them.
@media (prefers-reduced-motion: reduce)
  .mg-fade-enter-active, .mg-fade-leave-active
    transition: none

  .merge-guide .animate-pulse
    animation: none
</style>

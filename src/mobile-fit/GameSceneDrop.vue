<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  phase, wave, wood, runCoins, enemiesLeft, buildTimeLeft, gameSpeed,
  lastWaveReward, isBossIncoming, towerVersion, waveVersion,
  currentHoardTier, getBlocks, getTowerBlocks, getEnemies, offers, offerEnhanced,
  rerollReadyIn, arrowRainCharge, arrowRainReady, arrowRainWavesLeft, callArrowRain,
  startRun, resumeRun, callWave, setGameSpeed, step, runSummary, saveRunSnapshot,
  manualReroll, canManualReroll, dealEnhancedOffers, speedBuffLeft, grantSpeedBuff,
  graceAvailable, continueRun, isFirstSession, seedScriptedOpening, applyRules,
  dropOffer, canDropAt, columnTop, repairAll, repairAllCost, canAffordShape, sellBlock,
  blockCount, CONTINUE_WOOD, CONTINUE_STONE
} from '@/use/useTowerGame'
import {
  setViewport, setFixedFrame, clearFixedFrame, screenToWorldX, screenToWorldY,
  worldToScreenX, worldToScreenY, getZoom, viewRect
} from '@/use/useTowerCamera'
import {
  drawScene, resetDrawnFx, setBuildOverlay, setRenderProfile, setMonsterPrimeFilter,
  type DropGuide
} from '@/use/useTowerArt'
import { resetVfx } from '@/use/useTowerVfx'
import { warmAudio, playFx } from '@/use/useTowerAudio'
import useTowerProgress, { bestWave } from '@/use/useTowerProgress'
import useTowerEconomy from '@/use/useTowerEconomy'
import useMissions, { beginMissionRun } from '@/use/useMissions'
import useAchievements from '@/use/useAchievements'
import useBattlePass from '@/use/useBattlePass'
import { blockDef, GATE_ID } from '@/game/blocks'
import { ENEMY_DEFS, enemyDef } from '@/game/enemies'
import { SHAPE_BY_ID } from '@/game/shapes'
import { earlyCallBonus } from '@/game/waves'
import { spriteFor } from '@/game/art'
import type { Block } from '@/game/types'

import { getState, setState } from '@/use/useTowerState'
import { DAILY_BONUS_DAY_KEY, M2_ONBOARDED_KEY, M2_TUTORIAL_KEY } from '@/keys'
import useSounds, { useMusic } from '@/use/useSound'
import { useScreenshake } from '@/use/useScreenshake'
import { isGamePaused, isAdShowing, acquireAppPause } from '@/use/useGamePause'
import { windowWidth, windowHeight, isCrazyWeb } from '@/use/useUser'
import { isFullscreen, installFullscreenWatch } from '@/use/useFullscreen'
import { spawnCoinExplosion } from '@/use/useCoinExplosion'
import { isInterstitialReady, showMidgameAd } from '@/use/useAds'
import {
  claimReward, canOfferReward, adInFlight, canShowInterstitial, markInterstitialShown
} from '@/use/useAdGate'
import { signalGameplayLoaded } from '@/use/useCrazyGames'
import { syncGameplayLifecycle } from '@/use/useGameplayLifecycle'
import { isAnyModalOpen } from '@/use/useModalState'
import { playFirstStartInterstitial } from '@/use/useFirstStartInterstitial'
import { initDeviceTier, type RenderProfile } from '@/use/useDeviceTier'

import {
  DROPMERGE_RULES, BOARD_HALF_WIDTH, BOARD_MAX_ROW, SKY_ROWS, GROUND_ROWS, LANE_CELLS, STONE_FOLD
} from './rules'
import { DROPMERGE_ROSTER } from './roster'
import { PIECE_BLOCK_IDS } from './pieces'

import TopStrip from './components/TopStrip.vue'
import DropTray from './components/DropTray.vue'
import WaveBar from './components/WaveBar.vue'
import BlueprintsModal from './components/BlueprintsModal.vue'
import RotateOverlay from './components/RotateOverlay.vue'
import ControlHint, { type HintId } from '@/components/game/ControlHint.vue'
import WaveClearToast from '@/components/game/WaveClearToast.vue'
import TutorialOverlay, { type TutorialStep } from '@/components/game/TutorialOverlay.vue'
import TutorialPrompt from '@/components/game/TutorialPrompt.vue'
import FReward from '@/components/atoms/FReward.vue'
import FButton from '@/components/atoms/FButton.vue'
import FRewardButton from '@/components/atoms/FRewardButton.vue'
import FMuteButton from '@/components/atoms/FMuteButton.vue'
import FHudButton from '@/components/atoms/FHudButton.vue'
import MissionsModal from '@/components/organisms/MissionsModal.vue'
import TreasureChest from '@/components/organisms/TreasureChest.vue'
import OptionsModal from '@/components/organisms/OptionsModal.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import IconGold from '@/components/icons/IconGold.vue'
import IconWood from '@/components/icons/IconWood.vue'

/**
 * ─── Drop & Merge Siege — the portrait phone scene ──────────────────────────
 *
 * The same simulation, renderer, save layer and platform plumbing as the
 * desktop tower, played on a five-column board with one thumb: tap a column and
 * the offered piece drops into it; land it on its twin and the two fuse.
 * See `mobile-fit.md` §6 and `game-implementation-plan-mobile-fit-2.md`.
 *
 * The rules are applied in setup, before anything reads the hand, and the
 * camera is FIXED — the whole board is on screen at a cell size chosen from the
 * viewport, so there is no pan, no pinch and no auto-fit: every touch on the
 * canvas is a game action.
 */

applyRules(DROPMERGE_RULES)

const profile: RenderProfile = initDeviceTier()
setRenderProfile(profile)

/** The monster designs this board ever fields — the only ones worth baking. */
const rosterMonsters = (): string[] =>
  [...DROPMERGE_ROSTER].flatMap((id) => {
    const m = ENEMY_DEFS[id]?.monster
    return !m ? [] : Array.isArray(m) ? m : [m]
  })
setMonsterPrimeFilter(rosterMonsters())

const { t } = useI18n()
const progress = useTowerProgress()
const { addCoins } = useTowerEconomy()
const { recordRun } = useMissions()
const { recordRun: recordAchievementRun } = useAchievements()
const { awardWaveCleared, awardRunFinished } = useBattlePass()
const { startBattleMusic, stopBattleMusic } = useMusic()
const { playSound } = useSounds()
const { shakeStyle } = useScreenshake()

// ─── Canvas, frame and loop ─────────────────────────────────────────────────

const canvasRef = ref<HTMLCanvasElement | null>(null)
const stripRef = ref<InstanceType<typeof TopStrip> | null>(null)
const bottomRef = ref<HTMLElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let rafId = 0
let lastT = 0
let cssW = 0
let cssH = 0
let dpr = 1
let frameNo = 0
let drawAccum = 0

/** How many rows of sky the frame currently shows (drops to one on a very
 *  short screen, so cells stay a thumb wide). */
let skyRows = SKY_ROWS
/** Where the free band sits, for the overlays that live in screen space. */
const band = ref({ top: 0, bottom: 0 })

const stripEl = (): HTMLElement | null => (stripRef.value?.$el as HTMLElement | undefined) ?? null

/**
 * Fit the board into whatever the HUD leaves free.
 *
 * `cell` is the smaller of what the width allows (five columns plus a lane and
 * a quarter either side) and what the height allows (the board, a row of beach
 * and the sky). Below forty pixels a cell is no longer a thumb, so the sky
 * gives way first. See the plan's §4.2 for the per-device table.
 */
const layoutFrame = (): void => {
  if (cssW <= 0 || cssH <= 0) return
  const top = stripEl()?.getBoundingClientRect().bottom ?? 0
  const bottom = bottomRef.value?.getBoundingClientRect().top ?? cssH
  const freeH = Math.max(120, bottom - top)
  const cols = BOARD_HALF_WIDTH * 2 + 1 + LANE_CELLS * 2
  let sky = SKY_ROWS
  let rows = BOARD_MAX_ROW + 1 + GROUND_ROWS + sky
  let cell = Math.min((cssW - 16) / cols, freeH / rows)
  if (cell < 40 && sky > 1) {
    sky = 1
    rows -= 1
    cell = Math.min((cssW - 16) / cols, freeH / rows)
  }
  cell = Math.max(36, Math.min(72, cell))
  skyRows = sky
  // The frame spans y ∈ [−GROUND_ROWS, maxRow + 1 + sky]; its centre has to
  // land on the free band's centre, not the screen's.
  fitCell = cell
  fitCentreY = (BOARD_MAX_ROW + 1 + sky - GROUND_ROWS) / 2
  fitScreenCentre = (top + bottom) / 2
  band.value = { top, bottom }
  setViewport(cssW, cssH, top, cssH - bottom)
  applyFrame()
}

// ─── Zoom ───────────────────────────────────────────────────────────────────
//
// The frame stays FIXED — no panning, the board is never somewhere the player
// has to go and find. What the fit costs is the flanks and the sky, which is
// exactly where the wave comes from: a walker is on screen for the last two
// seconds of its approach and a wyvern drops in from just above the ceiling.
// So the one camera control that survives is a zoom OUT, from the fit down to
// half of it, on a slider and on a pinch.
//
// There is deliberately no zoom IN past the fit. The fit is already the
// largest the board can be drawn at without pushing a column off the screen,
// and a player who zoomed past it would be tapping columns they cannot see.

const ZOOM_MIN = 0.5
const ZOOM_MAX = 1
/** 1 is the fitted frame; below it the board shrinks and the world widens. */
const zoomLevel = ref(ZOOM_MAX)
/** What the fit alone decided, before the player's zoom is applied. */
let fitCell = 48
let fitCentreY = 0
let fitScreenCentre = 0

const clampZoom = (z: number): number => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z))

/**
 * Push the fit and the player's zoom to the camera as one frame.
 *
 * The anchor is the GROUND LINE, not the board's centre. Centred, a zoom-out
 * shrinks the board toward the middle of the band and spends half of what it
 * frees on more empty water in the foreground — the one direction nothing ever
 * comes from. Pinned to the ground, the fort stays where the thumb expects it
 * and every pixel the zoom buys goes to sky and flanks, which is where the
 * wave is.
 *
 * `worldToScreenY(0)` is `cssH / 2 + camY · cell`, so holding it at the value
 * the fit gives is one division. At zoom 1 this is exactly the old framing.
 */
const applyFrame = (): void => {
  const cell = Math.max(14, fitCell * zoomLevel.value)
  const groundOffset = fitCell * fitCentreY + fitScreenCentre - cssH / 2
  setFixedFrame({ cell, x: 0, y: groundOffset / cell })
}

const isZoomed = computed(() => zoomLevel.value < ZOOM_MAX - 0.001)

/** The slider speaks in whole percent; the camera in a multiplier. */
const zoomPercent = computed({
  get: () => Math.round(zoomLevel.value * 100),
  set: (v: number) => { setZoom(v / 100) }
})

const setZoom = (z: number): void => {
  const next = clampZoom(z)
  if (Math.abs(next - zoomLevel.value) < 0.0005) return
  zoomLevel.value = next
  applyFrame()
}

const resetZoom = (): void => {
  if (!isZoomed.value) return
  setZoom(ZOOM_MAX)
  playSound('modal-open', 0.04)
}

/**
 * The rail drives the slider, not the other way round.
 *
 * A native range knows how to be dragged with a mouse; with a finger it waits
 * on the browser's gesture recogniser, and a rotated one is exactly the case
 * where that goes quiet — the thumb simply does not follow the touch. Since
 * this control exists for phones, the whole capsule takes the pointer and
 * computes the value from where the finger is. The `<input>` stays for what it
 * is good at: the thumb's paint, the keyboard, and the accessible name.
 *
 * The full rail is the hit target, so a thumb never has to find a 20 px knob.
 */
const zoomRailRef = ref<HTMLElement | null>(null)
/** Padding at each end, so the extremes are reachable without pixel accuracy. */
const ZOOM_RAIL_PAD_PX = 14

const zoomFromRail = (clientY: number): void => {
  const el = zoomRailRef.value
  if (!el) return
  const b = el.getBoundingClientRect()
  const span = Math.max(1, b.height - ZOOM_RAIL_PAD_PX * 2)
  // Top of the rail is the fit; the bottom is as far out as it goes.
  const frac = Math.max(0, Math.min(1, 1 - (clientY - b.top - ZOOM_RAIL_PAD_PX) / span))
  setZoom(ZOOM_MIN + frac * (ZOOM_MAX - ZOOM_MIN))
}

const onZoomRailMove = (e: PointerEvent): void => { zoomFromRail(e.clientY) }

const onZoomRailUp = (): void => {
  window.removeEventListener('pointermove', onZoomRailMove)
  window.removeEventListener('pointerup', onZoomRailUp)
  window.removeEventListener('pointercancel', onZoomRailUp)
}

const onZoomRailDown = (e: PointerEvent): void => {
  e.preventDefault()
  zoomFromRail(e.clientY)
  window.addEventListener('pointermove', onZoomRailMove)
  window.addEventListener('pointerup', onZoomRailUp)
  window.addEventListener('pointercancel', onZoomRailUp)
}

const resize = (): void => {
  const canvas = canvasRef.value
  if (!canvas) return
  // The device tier caps the backing store; the HUD is DOM and stays crisp.
  dpr = Math.min(window.devicePixelRatio || 1, profile.dpr)
  cssW = window.innerWidth
  cssH = window.innerHeight
  canvas.width = Math.round(cssW * dpr)
  canvas.height = Math.round(cssH * dpr)
  canvas.style.width = `${cssW}px`
  canvas.style.height = `${cssH}px`
  ctx = canvas.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  layoutFrame()
}

/** Edge-arrow counts, pushed to the overlay only when they change. */
let edgeL = -1
let edgeR = -1
const updateEdgeArrows = (): void => {
  const rect = viewRect()
  let l = 0
  let r = 0
  for (const e of getEnemies()) {
    if (e.dying > 0 || enemyDef(e.typeId).movement !== 'ground') continue
    if (e.x < rect.l) l++
    else if (e.x > rect.r) r++
  }
  if (l !== edgeL || r !== edgeR) {
    edgeL = l
    edgeR = r
    setBuildOverlay({ edgeLeft: l, edgeRight: r })
  }
}

const loop = (t: number): void => {
  rafId = requestAnimationFrame(loop)
  const dt = lastT ? Math.min(t - lastT, 120) : 16
  lastT = t

  // The pause gate covers ads, hidden tabs and platform pauses; the rotate
  // overlay and the result screen hold the clock as well.
  if (!isGamePaused.value && !showResult.value && !rotateBlocked.value) step(dt)

  // On the low tier every second frame is skipped; the VFX get the accumulated
  // time so motion stays honest.
  frameNo++
  drawAccum += dt
  if (frameNo % profile.drawEvery !== 0) return
  if (ctx) {
    updateEdgeArrows()
    drawScene(ctx, cssW, cssH, drawAccum, dpr)
  }
  drawAccum = 0
}

// ─── Rotation ───────────────────────────────────────────────────────────────
//
// A portrait board. Sideways, a phone gets the overlay and the clock stops.

const rotateBlocked = computed(
  () => windowWidth.value > windowHeight.value
    && Math.min(windowWidth.value, windowHeight.value) < 600
)
let releaseRotatePause: (() => void) | null = null
watch(rotateBlocked, (blocked) => {
  if (blocked && !releaseRotatePause) releaseRotatePause = acquireAppPause()
  if (!blocked && releaseRotatePause) { releaseRotatePause(); releaseRotatePause = null }
}, { immediate: true })

// ─── Hand and drops ─────────────────────────────────────────────────────────

/** Index of the armed offer slot, or null. */
const selectedSlot = ref<number | null>(null)
/** Column the pointer is over while a piece is armed, or null. */
const armedColumn = ref<number | null>(null)
/** The block a long-press opened the sell bubble on. */
const sellTarget = ref<Block | null>(null)

// Declared up here, ahead of every computed that reads them: `watch()` evaluates
// its source the moment it is created, and the tutorial's watcher reads
// `showResult` through `inFirstStage` — a `const` declared further down would
// still be in its temporal dead zone at that point.
const showResult = ref(false)
const showBlueprints = ref(false)
const blueprintsIntro = ref(false)

const cellsOf = (shapeId: string | undefined): number =>
  shapeId ? (SHAPE_BY_ID[shapeId]?.cells.length ?? 1) : 1

/** The column under a screen x, or null when the pointer is off the board. */
const columnAt = (clientX: number): number | null => {
  const wx = screenToWorldX(clientX)
  if (Math.abs(wx) > BOARD_HALF_WIDTH + 0.5) return null
  return Math.max(-BOARD_HALF_WIDTH, Math.min(BOARD_HALF_WIDTH, Math.round(wx)))
}

const tryDrop = (slot: number, c: number): void => {
  if (!dropOffer(slot, c)) {
    playSound('obstacle-hit', 0.03)
    return
  }
  playFx('uiTap')
  markHintDone('dropBlock')
  completeTutorialStep('drop')
  // Keep the slot armed only while the piece that refilled it is affordable;
  // otherwise the player would be holding something they cannot drop.
  const next = offers.value[slot]
  if (!next || !canAffordShape(next)) selectedSlot.value = null
}

const onSelectSlot = (slot: number | null): void => {
  selectedSlot.value = slot
  sellTarget.value = null
  if (slot != null) playFx('uiTap')
}

// The tray reports a PRESS; whether it was a tap (arm the piece) or a drag
// (carry it to a column) is decided here from how far the finger travels.
const DRAG_SLOP_PX = 10
let dragSlot: number | null = null
let dragStart = { x: 0, y: 0 }
let dragMoved = false

const onDragMove = (e: PointerEvent): void => {
  if (dragSlot == null) return
  if (!dragMoved && Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y) > DRAG_SLOP_PX) {
    dragMoved = true
    selectedSlot.value = dragSlot
    sellTarget.value = null
  }
  if (dragMoved) armedColumn.value = columnAt(e.clientX)
}

const onDragEnd = (e: PointerEvent): void => {
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
  window.removeEventListener('pointercancel', onDragEnd)
  const slot = dragSlot
  dragSlot = null
  if (slot == null) return
  if (!dragMoved) {
    onSelectSlot(selectedSlot.value === slot ? null : slot)
    return
  }
  const c = e.type === 'pointercancel' ? null : columnAt(e.clientX)
  armedColumn.value = null
  if (c != null) tryDrop(slot, c)
  else selectedSlot.value = null
}

const onTilePress = (slot: number, e: PointerEvent): void => {
  dragSlot = slot
  dragStart = { x: e.clientX, y: e.clientY }
  dragMoved = false
  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', onDragEnd)
  window.addEventListener('pointercancel', onDragEnd)
}

// ─── Canvas pointer ─────────────────────────────────────────────────────────
//
// With a piece armed, the board is one big target: press anywhere on it and
// the column under the finger lights, lift and the piece drops there. With
// nothing armed, holding on a block opens the sell bubble.

const LONG_PRESS_MS = 450
let pressing = false
let pressStart = { x: 0, y: 0 }
let pressMoved = false
let longPressTimer: ReturnType<typeof setTimeout> | null = null

const clearLongPress = (): void => {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
}

const blockAtScreen = (clientX: number, clientY: number): Block | null => {
  const c = Math.round(screenToWorldX(clientX))
  const r = Math.floor(screenToWorldY(clientY))
  return getBlocks().get(`${c},${r}`) ?? null
}

// ─── Pinch ──────────────────────────────────────────────────────────────────
//
// Two fingers on the board is always a zoom, never a drop. The second finger
// therefore CANCELS whatever the first one had started — an armed column, a
// long-press heading for the sell bubble — and `pinched` keeps the release
// from being read as a tap once the fingers come off, which would otherwise
// drop a piece into whichever column the last finger happened to leave from.

const touches = new Map<number, { x: number; y: number }>()
let pinchStartDist = 0
let pinchStartZoom = 1
let pinched = false

const pinchSpan = (): number => {
  const [a, b] = [...touches.values()]
  return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0
}

const beginPinchGesture = (): void => {
  clearLongPress()
  sellTarget.value = null
  armedColumn.value = null
  pinchStartDist = Math.max(1, pinchSpan())
  pinchStartZoom = zoomLevel.value
  pinched = true
}

const onCanvasDown = (e: PointerEvent): void => {
  try { window.focus() } catch { /* a cross-origin parent may refuse */ }
  e.preventDefault()
  try { canvasRef.value?.setPointerCapture(e.pointerId) } catch { /* ignore */ }
  touches.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (touches.size >= 2) {
    beginPinchGesture()
    return
  }
  pressing = true
  pressStart = { x: e.clientX, y: e.clientY }
  pressMoved = false
  clearLongPress()

  if (selectedSlot.value != null) {
    armedColumn.value = columnAt(e.clientX)
    return
  }
  sellTarget.value = null
  const b = blockAtScreen(e.clientX, e.clientY)
  if (!b || b.typeId === GATE_ID) return
  longPressTimer = setTimeout(() => {
    longPressTimer = null
    if (pressMoved) return
    sellTarget.value = b
    playSound('modal-open', 0.05)
  }, LONG_PRESS_MS)
}

const onCanvasMove = (e: PointerEvent): void => {
  if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (touches.size >= 2) {
    const span = pinchSpan()
    if (span > 0 && pinchStartDist > 0) setZoom(pinchStartZoom * (span / pinchStartDist))
    return
  }
  if (!pressing) return
  if (!pressMoved && Math.hypot(e.clientX - pressStart.x, e.clientY - pressStart.y) > DRAG_SLOP_PX) {
    pressMoved = true
    clearLongPress()
  }
  if (selectedSlot.value != null) armedColumn.value = columnAt(e.clientX)
}

const onCanvasUp = (e: PointerEvent): void => {
  touches.delete(e.pointerId)
  clearLongPress()
  // The last finger of a pinch closes the gesture; the piece stays in the hand.
  if (pinched) {
    if (touches.size === 0) {
      pinched = false
      pressing = false
      pinchStartDist = 0
    }
    return
  }
  if (!pressing) return
  pressing = false
  if (selectedSlot.value == null) return
  const c = e.type === 'pointercancel' ? null : (armedColumn.value ?? columnAt(e.clientX))
  armedColumn.value = null
  if (c != null) tryDrop(selectedSlot.value, c)
}

const onSell = (): void => {
  const b = sellTarget.value
  sellTarget.value = null
  if (!b) return
  if (!sellBlock(b.c, b.r)) {
    playSound('obstacle-hit', 0.03)
    return
  }
  playSound('coin-pickup', 0.05)
}

/**
 * Where the sell bubble sits: above the block.
 *
 * The overlays live inside the band BELOW the top strip, so a viewport
 * coordinate has the strip's height subtracted. Placed at the viewport value
 * the bubble sat one strip lower — over the block itself — and the finger
 * lifting off a long-press landed on the Sell button it had just opened.
 */
const sellBubbleStyle = computed(() => {
  const b = sellTarget.value
  void towerVersion.value
  if (!b) return {}
  const x = worldToScreenX(b.c)
  const y = worldToScreenY(b.r + 1) - 8 - band.value.top
  return { left: `${Math.round(x)}px`, top: `${Math.round(y)}px` }
})

/**
 * Where a piece in hand would come to rest, column by column.
 *
 * Only ever a board's width of entries (five), recomputed when the hand, the
 * tower or the phase changes — the renderer holds the array and reads it every
 * frame, so it must not be rebuilt in the loop.
 */
const dropGuidesFor = (shapeId: string | undefined): DropGuide[] => {
  if (shapeId == null) return []
  const cells = cellsOf(shapeId)
  const guides: DropGuide[] = []
  for (let c = -BOARD_HALF_WIDTH; c <= BOARD_HALF_WIDTH; c++) {
    guides.push({
      c,
      r: Math.min(BOARD_MAX_ROW, columnTop(c) + 1),
      valid: canDropAt(c, cells)
    })
  }
  return guides
}

// The overlay is the renderer's copy of the input state.
watch([selectedSlot, armedColumn, towerVersion, phase], () => {
  const c = armedColumn.value
  const id = selectedSlot.value != null ? offers.value[selectedSlot.value] : undefined
  setBuildOverlay({
    selectedShape: null,
    slots: [],
    aimX: null,
    dropColumn: c,
    dropValid: c != null && canDropAt(c, cellsOf(id)),
    dropRows: BOARD_MAX_ROW,
    dropGuides: dropGuidesFor(id),
    hoverC: c,
    hoverR: c != null ? Math.min(BOARD_MAX_ROW, columnTop(c) + 1) : null
  })
})

// ─── Volley ─────────────────────────────────────────────────────────────────
//
// Auto-aimed at the flank with more hit points walking up it. Nothing on this
// board is aimed by hand.

const denserFlank = (): number => {
  let left = 0
  let right = 0
  let leftX = 0
  let rightX = 0
  let nl = 0
  let nr = 0
  for (const e of getEnemies()) {
    if (e.dying > 0 || enemyDef(e.typeId).movement === 'air') continue
    if (e.x < 0) { left += e.maxHp; leftX += e.x; nl++ } else { right += e.maxHp; rightX += e.x; nr++ }
  }
  const outer = BOARD_HALF_WIDTH + 2.5
  if (left === 0 && right === 0) return outer
  const side = left > right ? -1 : 1
  const mean = side < 0 ? leftX / Math.max(1, nl) : rightX / Math.max(1, nr)
  // Centre on the crowd, but never so far in that the volley lands on the
  // board's own crown.
  return side * Math.max(BOARD_HALF_WIDTH + 1.5, Math.min(outer + 2, Math.abs(mean)))
}

const onVolley = (): void => {
  if (!arrowRainReady.value || phase.value !== 'battle') {
    playSound('obstacle-hit', 0.03)
    return
  }
  if (!callArrowRain(denserFlank())) {
    playSound('obstacle-hit', 0.03)
    return
  }
  playSound('barricade', 0.06)
}

// ─── Reroll, repair, speed ──────────────────────────────────────────────────

const onReroll = (slot: number): void => {
  if (!canManualReroll(slot)) {
    playSound('obstacle-hit', 0.03)
    return
  }
  if (manualReroll(slot)) {
    if (selectedSlot.value === slot) selectedSlot.value = null
    playSound('barricade', 0.04)
  }
}

const repairCost = computed(() => {
  void towerVersion.value
  void waveVersion.value
  void phase.value
  return repairAllCost()
})
const canRepair = computed(() => phase.value === 'build' && repairCost.value > 0 && runCoins.value >= repairCost.value)

const onRepairAll = (): void => {
  if (!repairAll()) {
    playSound('obstacle-hit', 0.03)
    return
  }
  playSound('level-up', 0.05)
}

const onSetSpeed = (n: number): void => {
  if (!setGameSpeed(n)) return
  playSound('barricade', 0.03)
}

const onBuySpeed = async (target: number): Promise<void> => {
  if (adInFlight.value) return
  await claimReward(() => {
    grantSpeedBuff(target)
    playSound('level-up', 0.07)
  })
}

// ─── Wave control and warnings ──────────────────────────────────────────────

const callBonusPct = computed(() =>
  phase.value === 'build' ? Math.round((earlyCallBonus(buildTimeLeft.value) - 1) * 100) : 0
)

const onCallWave = (): void => {
  markHintDone('callWave')
  completeTutorialStep('call')
  selectedSlot.value = null
  sellTarget.value = null
  callWave()
}

const waveWarnings = computed<{ id: string; n: number; m?: number }[]>(() => {
  if (phase.value !== 'build') return []
  void towerVersion.value
  void waveVersion.value
  void wood.value
  void runCoins.value
  // Only the hoard surcharge survives; the lane chips are gone for the reason
  // the desktop scene records. On a five-column board they cost a row of the
  // HUD to say what the sky says by itself.
  const hoard = currentHoardTier()
  return [
    { id: 'hoard', n: hoard === 3 ? 100 : hoard === 2 ? 50 : hoard === 1 ? 25 : 0 }
  ].filter((w) => w.n > 0)
})

// ─── Menu drawer ────────────────────────────────────────────────────────────

const menuOpen = ref(false)
const showOptions = ref(false)
const coinEl = computed<HTMLElement | null>(() => stripRef.value?.coinEl ?? null)
const showMuteButton = computed(() => !isCrazyWeb || isFullscreen.value)

const fireCoinExplosion = (sourceEl: HTMLElement): void => {
  if (coinEl.value) spawnCoinExplosion({ sourceEl, targetEl: coinEl.value })
}

// ─── Control hints ──────────────────────────────────────────────────────────

const hintsDone = ref<Set<HintId>>(new Set())
const onboarded = ref(getState<boolean>(M2_ONBOARDED_KEY, false) === true)

const markHintDone = (id: HintId): void => {
  if (hintsDone.value.has(id)) return
  const next = new Set(hintsDone.value)
  next.add(id)
  hintsDone.value = next
}

const merged = computed(() => {
  void towerVersion.value
  for (const b of getTowerBlocks().values()) if ((b.tier ?? 1) > 1) return true
  return false
})
watch(merged, (m) => { if (m) markHintDone('mergeBlock') })

const activeHint = computed<HintId | null>(() => {
  if (onboarded.value || showResult.value || isAnyModalOpen.value || tutorialActive.value) return null
  if (phase.value === 'defeat') return null
  if (!hintsDone.value.has('dropBlock')) return 'dropBlock'
  if (!hintsDone.value.has('callWave') && phase.value === 'build' && wave.value === 0) return 'callWave'
  if (!hintsDone.value.has('mergeBlock') && wave.value >= 1 && blockCount.value > 2) return 'mergeBlock'
  return null
})

watch(wave, (w) => {
  if (w >= 2 && !onboarded.value) {
    onboarded.value = true
    setState(M2_ONBOARDED_KEY, true)
  }
})

// ─── Tutorial ───────────────────────────────────────────────────────────────
//
// Three beats: drop, merge, call. The merge beat deals a cannon into the
// weapon slot so the twin of the fort's cannon is in the player's hand.

const TUTORIAL_STEPS: TutorialStep[] = ['drop', 'merge', 'call']
const tutorialDone = ref(getState<boolean>(M2_TUTORIAL_KEY, false) === true)
const tutorialActive = ref(false)
const tutorialIndex = ref(0)
const tutorialRect = ref<{ x: number; y: number; w: number; h: number } | null>(null)
const tutorialTick = ref(0)
let tutorialTimer = 0

const inFirstStage = computed(() =>
  !tutorialDone.value && wave.value <= 1 && !showResult.value && !isAnyModalOpen.value
)
const tutorialStep = computed<TutorialStep | null>(() => {
  if (!inFirstStage.value || !tutorialActive.value) return null
  return TUTORIAL_STEPS[tutorialIndex.value] ?? null
})
const showTutorialPrompt = computed(() => inFirstStage.value && !tutorialActive.value && !rotateBlocked.value)

const PROMPT_WIDTH_PX = 190
const tutorialPromptPos = computed(() => {
  void tutorialTick.value
  void band.value
  const x = Math.max(10, Math.min(cssW - PROMPT_WIDTH_PX - 10, Math.round(cssW / 2 - PROMPT_WIDTH_PX / 2)))
  return { x, y: Math.round(worldToScreenY(BOARD_MAX_ROW + 1.2)), onRight: true }
})

/** The first empty column beside the fort, for the drop beat. */
const tutorialDropColumn = (): number => {
  void towerVersion.value
  for (const c of [-2, 2, -1, 1]) if (columnTop(c) < 0) return c
  return 2
}

const measureTutorialTarget = (): void => {
  const step = tutorialStep.value
  if (!step) { tutorialRect.value = null; return }
  const cell = getZoom()
  if (step === 'call') {
    const el = document.querySelector('.call-wave__btn')
    const b = el?.getBoundingClientRect()
    tutorialRect.value = b && b.width > 0 ? { x: b.x, y: b.y, w: b.width, h: b.height } : null
    return
  }
  // The drop and merge beats cut the hole over the WHOLE column: the dim layer
  // blocks every touch outside it, and a column is tapped anywhere along its
  // height. The piece itself is armed for the player when the beat starts
  // (see the watcher below), so the tray need not be reachable.
  const c = step === 'drop' ? tutorialDropColumn() : 0
  tutorialRect.value = {
    x: worldToScreenX(c - 0.5),
    y: worldToScreenY(BOARD_MAX_ROW + 1),
    w: cell,
    h: cell * (BOARD_MAX_ROW + 1)
  }
}

const startTutorial = (): void => {
  tutorialActive.value = true
  tutorialIndex.value = 0
  measureTutorialTarget()
}

const finishTutorial = (): void => {
  tutorialDone.value = true
  tutorialActive.value = false
  setState(M2_TUTORIAL_KEY, true)
}

const advanceTutorial = (): void => {
  tutorialIndex.value++
  if (tutorialIndex.value >= TUTORIAL_STEPS.length) finishTutorial()
}

const completeTutorialStep = (step: TutorialStep): void => {
  if (tutorialStep.value !== step) return
  advanceTutorial()
}

// Each beat arms the piece it is about to teach with, so the only thing left
// to do is tap the lit column. The merge beat also needs a twin in the hand —
// a cannon, like the fort's — and puts one in the weapon slot.
watch(tutorialStep, (step) => {
  measureTutorialTarget()
  if (step === 'drop') {
    selectedSlot.value = 0
    return
  }
  if (step !== 'merge') return
  if (!offers.value.some((id) => id === 'b_cannon')) {
    offers.value = offers.value.map((id, i) => (i === 1 ? 'b_cannon' : id))
  }
  selectedSlot.value = offers.value.indexOf('b_cannon')
})
watch(merged, (m) => { if (m) completeTutorialStep('merge') })

// ─── Result flow ────────────────────────────────────────────────────────────
//
// The same ordering the desktop scene is graded on: the interstitial is
// requested and awaited BEFORE the result screen is revealed.

const twoXUsed = ref(false)
const firstRunBonusActive = ref(false)
const summary = ref(runSummary())
const rewardCoinRef = ref<HTMLElement | null>(null)
const todayKey = (): string => new Date().toISOString().slice(0, 10)
const RESULT_COIN_MULTIPLIER = 3
const RESULT_INTERSTITIAL_DELAY_MS = 600
const AD_GATE_SETTLE_TIMEOUT_MS = 30_000
const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** What a continue grants, in the one materials pile this board shows. */
const continueMaterials = CONTINUE_WOOD + Math.round(CONTINUE_STONE * STONE_FOLD)

const twoXAvailable = computed(() =>
  !twoXUsed.value && summary.value.coins > 0 && canOfferReward.value
)

const maybeShowInterstitial = async (opts: { firstIsExempt?: boolean } = {}): Promise<void> => {
  if (!isInterstitialReady.value) return
  if (!canShowInterstitial(opts)) return
  markInterstitialShown()
  await wait(RESULT_INTERSTITIAL_DELAY_MS)
  await showMidgameAd()
}

const waitForAdGateClear = async (): Promise<void> => {
  if (!isAdShowing.value) return
  const deadline = Date.now() + AD_GATE_SETTLE_TIMEOUT_MS
  while (isAdShowing.value && Date.now() < deadline) await wait(100)
}

const feedMissions = (): void => {
  const s = runSummary()
  recordRun({ waves: s.wavesCleared, kills: s.kills, coins: s.coinsEarned, height: s.height, blocks: s.blocksPlaced })
}

const presentDefeat = async (): Promise<void> => {
  const s = runSummary()
  summary.value = s
  twoXUsed.value = false
  selectedSlot.value = null
  sellTarget.value = null
  stopBattleMusic()

  const run = { waves: s.wavesCleared, kills: s.kills, coins: s.coinsEarned, height: s.height, blocks: s.blocksPlaced }
  recordRun(run)
  recordAchievementRun(run)
  awardRunFinished()
  progress.recordRunEnd({
    wave: s.wave, kills: s.kills, score: s.score, wavesCleared: s.wavesCleared,
    height: s.height, blocks: s.blocks, blocksPlaced: s.blocksPlaced
  })
  firstRunBonusActive.value = getState<string>(DAILY_BONUS_DAY_KEY, '') !== todayKey()

  await maybeShowInterstitial({ firstIsExempt: true })
  await waitForAdGateClear()

  showResult.value = true
  void grantRunCoins()
}

const grantRunCoins = async (): Promise<void> => {
  const total = summary.value.coins
  if (total <= 0) return
  addCoins(total)
  await nextTick()
  const el = rewardCoinRef.value
  if (el && coinEl.value) {
    spawnCoinExplosion({ sourceEl: el, targetEl: coinEl.value, count: Math.min(40, 12 + Math.round(total / 6)) })
  }
}

const onTwoX = async (): Promise<void> => {
  if (adInFlight.value || !twoXAvailable.value) return
  const bonus = summary.value.coins * (RESULT_COIN_MULTIPLIER - 1)
  await claimReward(() => {
    addCoins(bonus)
    twoXUsed.value = true
    const el = rewardCoinRef.value
    if (el && coinEl.value) spawnCoinExplosion({ sourceEl: el, targetEl: coinEl.value, count: 26 })
  })
}

const consumeFirstRunBonus = (): void => {
  if (!firstRunBonusActive.value) return
  firstRunBonusActive.value = false
  setState(DAILY_BONUS_DAY_KEY, todayKey())
}

const beginRun = (): void => {
  startRun()
  if (isFirstSession()) seedScriptedOpening()
}

const startFreshRun = (): void => {
  beginMissionRun()
  showResult.value = false
  selectedSlot.value = null
  sellTarget.value = null
  resetVfx()
  resetDrawnFx()
  beginRun()
  progress.recordRunStart()
  layoutFrame()
  startBattleMusic()
}

const onRebuild = (): void => {
  if (adInFlight.value) return
  consumeFirstRunBonus()
  startFreshRun()
}

const onUpgrade = (): void => {
  if (adInFlight.value) return
  consumeFirstRunBonus()
  showResult.value = false
  blueprintsIntro.value = true
  showBlueprints.value = true
}

const onContinueRun = async (): Promise<void> => {
  if (adInFlight.value || !graceAvailable.value) return
  await claimReward(() => {
    if (!continueRun()) return
    showResult.value = false
    selectedSlot.value = null
    sellTarget.value = null
    resetVfx()
    resetDrawnFx()
    playSound('level-up', 0.07)
  })
}

const openBlueprints = (): void => {
  menuOpen.value = false
  showBlueprints.value = true
}

// Closing the blueprints after a defeat returns to the result screen.
watch(showBlueprints, (open, wasOpen) => {
  if (open) return
  blueprintsIntro.value = false
  if (wasOpen && phase.value === 'defeat') showResult.value = true
})

watch(phase, (p, prev) => {
  if (p === 'defeat' && prev !== 'defeat') void presentDefeat()
  if (p === 'battle' && prev === 'build') {
    startBattleMusic()
    sellTarget.value = null
  }
})

const toastHeld = ref(false)
watch(lastWaveReward, async (r) => {
  if (!r) return
  awardWaveCleared()
  feedMissions()
  toastHeld.value = true
  await maybeShowInterstitial()
  toastHeld.value = false
})

/** The toast sits on the beach row, under the board and over nothing —
 *  measured inside the band, like the bubble. */
const toastTop = computed(() => {
  void towerVersion.value
  const y = Math.min(band.value.bottom - 56, worldToScreenY(-0.2))
  return Math.round(y - band.value.top)
})

const onTripleWave = async (): Promise<void> => {
  const base = lastWaveReward.value?.coins ?? 0
  if (base <= 0 || adInFlight.value) return
  await claimReward(() => {
    addCoins(base * 2)
    playSound('level-up', 0.07)
    const el = coinEl.value
    if (el) spawnCoinExplosion({ sourceEl: el, targetEl: el, count: 24 })
  })
}

// ─── Reinforced hand ────────────────────────────────────────────────────────

const enhancedHandOffered = computed(() =>
  phase.value === 'build' && !offerEnhanced.value.some(Boolean)
)

const onEnhancedHand = async (): Promise<void> => {
  if (adInFlight.value) return
  await claimReward(() => {
    dealEnhancedOffers()
    selectedSlot.value = null
    playSound('level-up', 0.07)
  })
}

// ─── Keyboard (a phone with a keyboard is still a phone) ────────────────────

const onKey = (e: KeyboardEvent): void => {
  const tgt = e.target
  if (tgt instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(tgt.tagName)) return
  if (e.code === 'Escape') { selectedSlot.value = null; sellTarget.value = null; return }
  if (e.repeat) return
  if ((e.code === 'Space' || e.code === 'Enter') && phase.value === 'build' && !showResult.value) {
    e.preventDefault()
    onCallWave()
    return
  }
  const digit = Number(e.key)
  if (Number.isInteger(digit) && digit >= 1 && digit <= offers.value.length) onSelectSlot(digit - 1)
}

// ─── Gameplay lifecycle ─────────────────────────────────────────────────────

const isLiveGameplay = computed(
  () => phase.value !== 'defeat'
    && !showResult.value
    && !isAnyModalOpen.value
    && !isAdShowing.value
    && !rotateBlocked.value
)
watch(isLiveGameplay, syncGameplayLifecycle, { immediate: true })

// ─── Boot ───────────────────────────────────────────────────────────────────

let booting = false

const boot = async (): Promise<void> => {
  if (booting) return
  booting = true
  try {
    await playFirstStartInterstitial()
    if (!resumeRun()) {
      beginRun()
      progress.recordRunStart()
    }
    beginMissionRun()
    await nextTick()
    resize()
    startBattleMusic()
    signalGameplayLoaded()
  } finally {
    booting = false
  }
}

const onOrientationChange = (): void => { setTimeout(resize, 250) }
let layoutTimer = 0

onMounted(() => {
  void boot()
  installFullscreenWatch()
  window.addEventListener('resize', resize)
  window.addEventListener('orientationchange', onOrientationChange)
  window.addEventListener('keydown', onKey)
  rafId = requestAnimationFrame(loop)

  // Only this board's blocks and monsters are probed here — a phone on a slow
  // connection must not fetch the desktop's whole cast during wave one. (The
  // staged preload in `artPreload` still fetches the late cast at low priority
  // once the early game has settled; that is idle-time work, not the first
  // minute's.)
  const idle = (window as any).requestIdleCallback as ((cb: () => void, o?: any) => number) | undefined
  const warm = (): void => {
    warmAudio()
    for (const id of PIECE_BLOCK_IDS) spriteFor('block', id)
    spriteFor('block', GATE_ID)
    for (const id of rosterMonsters()) spriteFor('monster', id)
  }
  if (typeof idle === 'function') idle(warm, { timeout: 2500 })
  else setTimeout(warm, 400)

  // The HUD's height moves (warnings appear, the repair button comes and goes);
  // re-fit the board on a slow cadence rather than observing every element.
  layoutTimer = window.setInterval(layoutFrame, 1000)
  tutorialTimer = window.setInterval(() => {
    if (tutorialDone.value) return
    tutorialTick.value++
    if (tutorialStep.value) measureTutorialTarget()
  }, 250)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resize)
  window.removeEventListener('orientationchange', onOrientationChange)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
  window.removeEventListener('pointercancel', onDragEnd)
  onZoomRailUp()
  clearInterval(layoutTimer)
  clearInterval(tutorialTimer)
  clearLongPress()
  releaseRotatePause?.()
  clearFixedFrame()
  stopBattleMusic()
  saveRunSnapshot()
  // The overlay is a module singleton shared with the desktop scene: leave
  // none of this board's columns behind in it.
  setBuildOverlay({ dropColumn: null, dropGuides: [], dropRows: 0, edgeLeft: 0, edgeRight: 0 })
})
</script>

<template lang="pug">
  div.drop
    canvas.drop__canvas(
      ref="canvasRef"
      :style="shakeStyle"
      @pointerdown="onCanvasDown"
      @pointermove="onCanvasMove"
      @pointerup="onCanvasUp"
      @pointercancel="onCanvasUp"
      @contextmenu.prevent
    )

    div.drop__hud
      TopStrip(
        ref="stripRef"
        :wave="wave"
        :best-wave="bestWave"

        :materials="wood"
        :gold="runCoins"
        :phase="phase"
        :enemies-left="enemiesLeft"
      )

      div.drop__mid
        //- Zoom, top-right of the playfield: how much of the approach the
        //- player wants to see. The recentre button only exists while the
        //- view is away from the fit, exactly as on the desktop scene.
        div.drop__zoom
          div.drop__zoom-rail(ref="zoomRailRef" @pointerdown="onZoomRailDown")
            input.drop__zoom-range(
              type="range"
              :min="ZOOM_MIN * 100"
              :max="ZOOM_MAX * 100"
              step="1"
              v-model.number="zoomPercent"
              :aria-label="t('mobile.zoom')"
            )
          Transition(name="fade")
            button.drop__zoom-reset(
              v-if="isZoomed"
              type="button"
              :aria-label="t('hud.recenter')"
              @click="resetZoom"
            )
              svg(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round")
                path(d="M12 3v3M12 18v3M3 12h3M18 12h3")
                circle(cx="12" cy="12" r="4")

        div.drop__hint
          ControlHint(:hint="activeHint")

        div.drop__toast(:style="{ top: toastTop + 'px' }")
          WaveClearToast(:reward="toastHeld ? null : lastWaveReward" @triple="onTripleWave")

        //- Long-press sell bubble, anchored above the block.
        div.drop__bubble(v-if="sellTarget" :style="sellBubbleStyle")
          span.drop__bubble-name {{ t(`blocks.names.${sellTarget.typeId}`) }}
          button.drop__bubble-sell(type="button" @click="onSell") {{ t('blocks.sell') }}

        //- Rewarded perk, floating just above the hand.
        div.drop__perks
          FRewardButton(
            v-if="enhancedHandOffered"
            tone="gold"
            size="sm"
            :label="t('blocks.enhancedHand')"
            @click="onEnhancedHand"
          )

        //- Menu drawer.
        div.drop__menu-backdrop(v-if="menuOpen" @click="menuOpen = false")
        div.drop__menu(v-if="menuOpen")
          FMuteButton(v-if="showMuteButton")
          FHudButton(tone="slate" :aria-label="t('options.title')" @click="menuOpen = false; showOptions = true")
            svg(viewBox="0 0 24 24" fill="currentColor")
              path(d="M12 4 a1 1 0 0 1 1 1 v1.6 a6 6 0 0 1 1.8 0.7 l1.1 -1.1 a1 1 0 0 1 1.4 1.4 l -1.1 1.1 a6 6 0 0 1 0.7 1.8 H18 a1 1 0 1 1 0 2 h-1.6 a6 6 0 0 1 -0.7 1.8 l1.1 1.1 a1 1 0 0 1 -1.4 1.4 l-1.1 -1.1 a6 6 0 0 1 -1.8 0.7 V18 a1 1 0 1 1 -2 0 v -1.6 a6 6 0 0 1 -1.8 -0.7 l-1.1 1.1 a1 1 0 0 1 -1.4 -1.4 l1.1 -1.1 a6 6 0 0 1 -0.7 -1.8 H6 a1 1 0 1 1 0 -2 h1.6 a6 6 0 0 1 0.7 -1.8 L7.2 7.6 a1 1 0 0 1 1.4 -1.4 l1.1 1.1 a6 6 0 0 1 1.8 -0.7 V5 a1 1 0 0 1 1 -1 Z M12 9 a3 3 0 1 0 0 6 a3 3 0 0 0 0 -6 Z")
          FHudButton(tone="green" :aria-label="t('tech.blueprints.title')" @click="openBlueprints")
            svg(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
              rect(x="4" y="3" width="16" height="18" rx="2")
              path(d="M8 8h8M8 12h8M8 16h5")
            template(#badge)
              span.drop__badge(v-if="progress.affordableCount.value > 0") {{ progress.affordableCount.value }}
          MissionsModal(@opened="feedMissions" @coins-awarded="fireCoinExplosion")
          TreasureChest(:target-el="coinEl")

      div.drop__bottom(ref="bottomRef")
        DropTray(
          :offers="offers"
          :enhanced="offerEnhanced"
          :selected="selectedSlot"
          :materials="wood"
          :gold="runCoins"
          :reroll-seconds="rerollReadyIn"
          :volley-ready="arrowRainReady"
          :in-battle="phase === 'battle'"
          :volley-charge="arrowRainCharge"
          :volley-waves-left="arrowRainWavesLeft"
          @press="onTilePress"
          @reroll="onReroll"
          @volley="onVolley"
        )
        WaveBar(
          :phase="phase"
          :time-left="buildTimeLeft"
          :bonus-pct="callBonusPct"
          :speed="gameSpeed"
          :boss-incoming="isBossIncoming"
          :speed-buff-left="speedBuffLeft"
          :speeds="DROPMERGE_RULES.abilities.speeds"
          :repair-cost="repairCost"
          :can-repair="canRepair"
          :warnings="waveWarnings"
          :menu-open="menuOpen"
          @call="onCallWave"
          @set-speed="onSetSpeed"
          @buy-speed="onBuySpeed"
          @repair-all="onRepairAll"
          @menu="menuOpen = !menuOpen"
        )

    //- ── Defeat screen ─────────────────────────────────────────────────────
    FReward(v-model="showResult" :show-continue="false")
      template(#ribbon)
        span.drop__ribbon {{ t('result.towerFell') }}
      div.dresult
        span.dresult__wave {{ t('result.reachedWave', { n: summary.wave }) }}
        span.dresult__record(v-if="summary.wave >= bestWave && summary.wave > 0") {{ t('result.newRecord') }}
        div.dresult__coins(ref="rewardCoinRef")
          IconGold(class="dresult__coin-icon")
          span.dresult__coin-value +{{ summary.coins }}
        div.dresult__cta
          FRewardButton(
            v-if="twoXAvailable"
            tone="gold"
            label=""
            :aria-label="firstRunBonusActive ? t('result.firstRunBonus') : t('result.tripleCoins')"
            @click="onTwoX"
          )
            span.dresult__twox
              span(v-if="firstRunBonusActive") {{ t('result.firstRunBonus') }}
              template(v-else)
                span {{ RESULT_COIN_MULTIPLIER }}×
                IconCoin(class="dresult__twox-icon")
          FRewardButton(
            v-if="graceAvailable"
            tone="green"
            :label="t('result.continueRun')"
            @click="onContinueRun"
          )
            span.dresult__continue
              span {{ t('result.continueRun') }}
              span.dresult__continue-bonus
                span +{{ continueMaterials }}
                IconWood.dresult__res-icon
          div.dresult__actions
            //- Glyphs, not captions — and the two i18n keys live on as the
            //- accessible names. See the desktop scene's note.
            FButton(
              size="md"
              icon="shop"
              icon-only
              :aria-label="t('result.upgrade')"
              :is-disabled="adInFlight"
              @click="onUpgrade"
            )
            FRewardButton(
              tone="blue"
              free
              icon="skip-forward"
              icon-only
              :label="t('result.defendAgain')"
              @click="onRebuild"
            )

    TutorialPrompt(
      v-if="showTutorialPrompt"
      :x="tutorialPromptPos.x"
      :y="tutorialPromptPos.y"
      :on-right="tutorialPromptPos.onRight"
      @start="startTutorial"
      @skip="finishTutorial"
    )
    TutorialOverlay(
      :step="tutorialStep"
      :target="tutorialRect"
      :seeded="false"
      @next="advanceTutorial"
      @skip="finishTutorial"
    )

    OptionsModal(:is-open="showOptions" @close="showOptions = false")
    BlueprintsModal(v-model="showBlueprints" :intro="blueprintsIntro")
    RotateOverlay(v-if="rotateBlocked")
</template>

<style scoped lang="sass">
.drop
  position: relative
  width: 100vw
  height: 100vh
  height: 100dvh
  overflow: hidden
  background-color: #0a1224

.drop__canvas
  position: absolute
  inset: 0
  display: block
  touch-action: none

.drop__hud
  position: absolute
  inset: 0
  display: flex
  flex-direction: column
  pointer-events: none

.drop__mid
  position: relative
  flex: 1 1 auto
  min-height: 0

// ─── Zoom ───────────────────────────────────────────────────────────────────
//
// Against the right edge, where a right thumb reaches without crossing the
// board.
//
// The slider is an ORDINARY HORIZONTAL range stood on end with a rotation,
// which is worth the extra wrapper. Standing one up the native way needs
// `writing-mode: vertical-rl` and `-webkit-appearance: slider-vertical`, and
// the two disagree about which axis the thumb's centring margin applies to —
// the handle came out sitting off the side of its own rail. A rotated
// horizontal slider has one well-understood centring hack (`margin-top`),
// renders identically everywhere, and still drags correctly: CSS transforms
// map hit-testing too, so the thumb follows the finger through the rotation.
//
// It rides in a dark capsule, the same one the recentre button wears. The sky
// behind it runs from near-white at noon to deep blue at dusk, and a control
// painted straight onto that is legible at neither end.
.drop__zoom
  position: absolute
  top: 0.5rem
  right: calc(0.4rem + env(safe-area-inset-right, 0px))
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.4rem
  pointer-events: auto

.drop__zoom-rail
  display: flex
  align-items: center
  justify-content: center
  width: 2.5rem
  height: 7.75rem
  border: 2px solid rgba(255, 255, 255, 0.25)
  border-radius: 999px
  background-color: rgba(8, 14, 28, 0.72)
  cursor: pointer
  touch-action: none
  -webkit-tap-highlight-color: transparent

// Sized as the horizontal control it is: `width` is the rail's HEIGHT.
.drop__zoom-range
  -webkit-appearance: none
  appearance: none
  width: 6.75rem
  height: 2rem
  margin: 0
  rotate: -90deg
  background: transparent
  // The rail above owns the gesture; the input is the paint and the keyboard.
  pointer-events: none
  touch-action: none

  &::-webkit-slider-runnable-track
    height: 0.4rem
    border-radius: 999px
    background-color: rgba(255, 255, 255, 0.24)

  &::-moz-range-track
    height: 0.4rem
    border-radius: 999px
    background-color: rgba(255, 255, 255, 0.24)

  &::-webkit-slider-thumb
    -webkit-appearance: none
    width: 1.3rem
    height: 1.3rem
    // (track 0.4rem − thumb 1.3rem) / 2 — the one centring hack.
    margin-top: -0.45rem
    border: 2px solid #0b1224
    border-radius: 999px
    background-image: linear-gradient(to bottom, #9fe9ff, #2f8fe0)
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.55)

  &::-moz-range-thumb
    width: 1.3rem
    height: 1.3rem
    border: 2px solid #0b1224
    border-radius: 999px
    background-color: #6fd3ff
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.55)

.drop__zoom-reset
  display: flex
  align-items: center
  justify-content: center
  width: 2.5rem
  height: 2.5rem
  padding: 0
  border: 2px solid rgba(255, 255, 255, 0.25)
  border-radius: 999px
  background-color: rgba(8, 14, 28, 0.72)
  color: #cfe4ff
  cursor: pointer
  -webkit-tap-highlight-color: transparent

  svg
    width: 55%
    height: 55%

  &:active
    scale: 0.92

.drop__hint
  position: absolute
  top: 0.5rem
  left: 50%
  translate: -50% 0
  pointer-events: none

.drop__toast
  position: absolute
  left: 50%
  translate: -50% 0
  pointer-events: none

.drop__bubble
  position: absolute
  translate: -50% -100%
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.25rem
  padding: 0.35rem 0.5rem
  border: 2px solid #7fe0ff
  border-radius: 0.6rem
  background-image: linear-gradient(to bottom, rgba(28, 44, 82, 0.98), rgba(14, 24, 46, 0.98))
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.55)
  pointer-events: auto

.drop__bubble-name
  color: #fff
  font-size: 0.7rem
  font-weight: 900
  text-transform: uppercase
  white-space: nowrap

.drop__bubble-sell
  min-width: 4rem
  min-height: 2.25rem
  padding: 0.25rem 0.75rem
  border: 2px solid #0f1a30
  border-radius: 0.5rem
  background-image: linear-gradient(to bottom, #ff8a8a, #c62f2f)
  color: #fff
  font-size: 0.8rem
  font-weight: 900
  text-transform: uppercase
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent

.drop__perks
  position: absolute
  left: 50%
  bottom: 0.25rem
  translate: -50% 0
  display: flex
  gap: 0.35rem
  pointer-events: auto

.drop__menu-backdrop
  position: fixed
  inset: 0
  pointer-events: auto

.drop__menu
  position: absolute
  left: 0.5rem
  bottom: 0.25rem
  z-index: 2
  display: flex
  flex-wrap: wrap
  align-items: flex-end
  gap: 0.4rem
  max-width: calc(100vw - 1rem)
  padding: 0.5rem
  border: 2px solid #0f1a30
  border-radius: 0.8rem
  background-image: linear-gradient(to bottom, rgba(38, 56, 96, 0.96), rgba(18, 30, 56, 0.96))
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.55)
  pointer-events: auto

.drop__badge
  display: inline-flex
  align-items: center
  justify-content: center
  min-width: 1.1rem
  height: 1.1rem
  padding: 0 0.25em
  border-radius: 999px
  background-color: #c62f2f
  color: #fff
  font-size: 0.6rem
  font-weight: 900

.drop__bottom
  position: relative
  display: flex
  flex-direction: column
  background-image: linear-gradient(to top, rgba(10, 18, 36, 0.9), rgba(10, 18, 36, 0.35))
  pointer-events: none

  > *
    pointer-events: auto

.drop__ribbon
  color: #fff
  font-weight: 900

// ─── Result ─────────────────────────────────────────────────────────────────

.dresult
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.5rem
  width: 100%

.dresult__wave
  color: #fff
  font-size: 1.2rem
  font-weight: 900
  text-shadow: 2px 2px 0 #000

.dresult__record
  color: #ffd93c
  font-size: 0.8rem
  font-weight: 900
  text-transform: uppercase

.dresult__coins
  display: flex
  align-items: center
  gap: 0.3rem

.dresult__coin-icon
  width: 1.8rem
  height: 1.8rem

.dresult__coin-value
  color: #ffd93c
  font-size: 1.8rem
  font-weight: 900
  text-shadow: 2px 2px 0 #000

.dresult__cta
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.4rem
  width: 100%

.dresult__twox
  display: inline-flex
  align-items: center
  gap: 0.25rem
  font-size: 1.3rem
  font-weight: 900

.dresult__twox-icon
  width: 1.4rem
  height: 1.4rem

.dresult__continue
  display: inline-flex
  align-items: center
  gap: 0.4rem

.dresult__continue-bonus
  display: inline-flex
  align-items: center
  gap: 0.15rem
  font-size: 0.8rem

.dresult__res-icon
  width: 1rem
  height: 1rem

.dresult__actions
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 0.5rem
</style>

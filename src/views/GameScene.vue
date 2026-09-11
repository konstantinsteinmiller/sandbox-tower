<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

import useTowerGame, {
  phase, wave, wood, stone, runCoins,
  enemiesLeft, enemiesTotal, gateHpPct, buildTimeLeft, gameSpeed,
  lastWaveReward, isBossIncoming, towerVersion, waveVersion, wavePlan, previewNextWave,
  currentHoardTier,
  fortifyBlock,
  blockCount,
  getBlocks, getTowerBlocks, spanW, spanH, offers,
  offerEnhanced, rerollReadyIn, allyCount,
  CONTINUE_WOOD, CONTINUE_STONE,
  arrowRainCharge, arrowRainReady, arrowRainWavesLeft, callArrowRain, ARROW_RAIN_RADIUS,
  startRun, resumeRun, placeShape, sellBlock, upgradeBlock, repairBlock, canPlaceShapeAt,
  canAffordShape, callWave, toggleSpeed, setGameSpeed, step, runSummary, saveRunSnapshot,
  manualReroll, canManualReroll, dealEnhancedOffers, summonCavalry, cavalryCost,
  bestWeaponReach, unreachableSiege, isCavalryFree, isRangeBuffed, grantRangeBuff,
  RANGE_BUFF_MUL, effectiveRangeMul,
  halfWidthAt, UPPER_HALF_WIDTH, WATER_ROW, speedBuffLeft, grantSpeedBuff, graceAvailable,
  continueRun, isFirstSession, seedScriptedOpening, buildClockHeld,
  repairAll, repairAllPlan, canRepairAll, seedTutorialRankGold, missingFor
} from '@/use/useTowerGame'
import { denyPurchase } from '@/use/useResourceBlink'
import { idleNudge, noteBuildAction, useIdleNudge } from '@/use/useIdleNudge'
import {
  setViewport, snapToFit, screenToCell, panBy, zoomAt,
  beginPinch, updatePinch, endPinch, recenter, isManual,
  getZoom, worldToScreenX, worldToScreenY
} from '@/use/useTowerCamera'
import { drawScene, resetDrawnFx, setBuildOverlay } from '@/use/useTowerArt'
import {
  initAdaptiveQuality, sampleAdaptiveFrame, stopAdaptiveQuality
} from '@/use/useAdaptiveQuality'
import { PROFILES, type RenderProfile } from '@/use/useDeviceTier'
import { perf } from '@/use/usePerfProbe'
import { resetVfx } from '@/use/useTowerVfx'
import { warmAudio, playFx } from '@/use/useTowerAudio'
import useTowerProgress, { bestWave } from '@/use/useTowerProgress'
import { awaitingFirstInteraction } from '@/use/useFirstInteraction'
import {
  reportRun, rankFor, playerTotal, leaderboardEnabled, leaderboardPending
} from '@/use/useLeaderboard'
import useTowerEconomy from '@/use/useTowerEconomy'
import useMissions, { beginMissionRun } from '@/use/useMissions'
import useAchievements from '@/use/useAchievements'
import useBattlePass from '@/use/useBattlePass'
import { isShip, blockDef, tierOf } from '@/game/blocks'
import { OFFER_SLOTS, WEAPON_SLOT, canRotateShape, normRot, rotatedShape } from '@/game/shapes'
import { ENEMY_DEFS } from '@/game/enemies'
import {
  earlyCallBonus, countSiege, countOutranged, deepestStandoff
} from '@/game/waves'
import { SEA_LEVEL } from '@/game/world'
import type { Block } from '@/game/types'

import { getState, setState } from '@/use/useTowerState'
import { readTutorialCheat, type TutorialCheat } from '@/use/useTutorialCheat'
import {
  ONBOARDED_KEY, TECH_SPOTLIGHT_KEY, TIP_CURSOR_KEY, TUTORIAL_KEY,
  MERGE_GUIDE_KEY, TRAP_TUTORIAL_KEY
} from '@/keys'
import useSounds, { useMusic } from '@/use/useSound'
import { useScreenshake } from '@/use/useScreenshake'
import { isGamePaused, isAdShowing } from '@/use/useGamePause'
import { isMobileLandscape, isCrazyWeb } from '@/use/useUser'
import { isFullscreen, installFullscreenWatch } from '@/use/useFullscreen'
import { isCrazyGamesFullRelease } from '@/use/useMatch'
import { spawnCoinExplosion } from '@/use/useCoinExplosion'
import { pushResourceFloat, clearResourceFloats } from '@/use/useResourceFloats'
import { isInterstitialReady, showMidgameAd } from '@/use/useAds'
import {
  claimReward, canOfferReward, adInFlight, isRewardGated,
  canShowInterstitial, markInterstitialShown
} from '@/use/useAdGate'
import { signalGameplayLoaded } from '@/use/useCrazyGames'
import { syncGameplayLifecycle } from '@/use/useGameplayLifecycle'
import { isAnyModalOpen } from '@/use/useModalState'
import { playFirstStartInterstitial } from '@/use/useFirstStartInterstitial'

import WaveHud from '@/components/game/WaveHud.vue'
import ResourceBar from '@/components/game/ResourceBar.vue'
import BuildTray from '@/components/game/BuildTray.vue'
import BlockInspector from '@/components/game/BlockInspector.vue'
import CallWaveButton from '@/components/game/CallWaveButton.vue'
import ControlHint, { type HintId } from '@/components/game/ControlHint.vue'
import WaveClearToast from '@/components/game/WaveClearToast.vue'
import TutorialOverlay, { type TutorialStep } from '@/components/game/TutorialOverlay.vue'
import MergeGuide from '@/components/game/MergeGuide.vue'
import MergePowerDemo from '@/components/game/MergePowerDemo.vue'
import TrapTutorial from '@/components/game/TrapTutorial.vue'
import RepairAllButton from '@/components/game/RepairAllButton.vue'
import FHudButton from '@/components/atoms/FHudButton.vue'
import FHudBadge from '@/components/atoms/FHudBadge.vue'
import FMuteButton from '@/components/atoms/FMuteButton.vue'
import FReward from '@/components/atoms/FReward.vue'
import FButton from '@/components/atoms/FButton.vue'
import FRewardButton from '@/components/atoms/FRewardButton.vue'
import CoinBadge from '@/components/organisms/CoinBadge.vue'
import TreasureChest from '@/components/organisms/TreasureChest.vue'
import FlyingChest from '@/components/game/FlyingChest.vue'
import GiftTile from '@/components/game/GiftTile.vue'
import DailyRewards from '@/components/organisms/DailyRewards.vue'
import AdRewardButton from '@/components/organisms/AdRewardButton.vue'
import BattlePass from '@/components/organisms/BattlePass.vue'
import AchievementsButton from '@/components/organisms/AchievementsButton.vue'
import MissionsModal from '@/components/organisms/MissionsModal.vue'
import OptionsModal from '@/components/organisms/OptionsModal.vue'
import TechTreeModal from '@/components/organisms/TechTreeModal.vue'
import { markTechFound, refreshTechFound, techNudge } from '@/use/useTechDiscovery'
import IconCoin from '@/components/icons/IconCoin.vue'
import TechTreeGlyph from '@/components/icons/TechTreeGlyph.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import IncomingBanner from '@/components/game/IncomingBanner.vue'
import IconStone from '@/components/icons/IconStone.vue'
import IconWood from '@/components/icons/IconWood.vue'
import IconMovie from '@/components/icons/IconMovie.vue'

const { t } = useI18n()
void useTowerGame // the composable surface is imported directly above
const progress = useTowerProgress()
const { coins, addCoins, spendCoins } = useTowerEconomy()
const { recordRun } = useMissions()
const { recordRun: recordAchievementRun } = useAchievements()
const { awardWaveCleared, awardRunFinished } = useBattlePass()
const { startBattleMusic, stopBattleMusic } = useMusic()
const { playSound } = useSounds()
const { shakeStyle } = useScreenshake()

// ─── Canvas + render loop ───────────────────────────────────────────────────

const canvasRef = ref<HTMLCanvasElement | null>(null)
const topBarRef = ref<HTMLElement | null>(null)
const bottomBarRef = ref<HTMLElement | null>(null)
const trayPerksRef = ref<HTMLElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let rafId = 0
let lastT = 0
let cssW = 0
let cssH = 0
let dpr = 1

/**
 * ─── Adaptive quality ───────────────────────────────────────────────────────
 *
 * The desktop scene used to render at one fixed fidelity forever: it never
 * called `setRenderProfile`, so `useTowerArt`'s defaults were its permanent
 * behaviour and every subtraction the phone tiers had measured (a frozen sky, a
 * baked sky, no water reflection, no paper grain) was gated off for it. That is
 * fine on a discrete GPU and ruinous on a 2-CU integrated one, which is a large
 * share of the laptops this ships to.
 *
 * `useAdaptiveQuality` watches real frame deltas and steps the whole package
 * down when the machine demonstrably is not holding the target. The scene owns
 * the two parts of a profile the renderer cannot apply for itself: the canvas
 * backing-store resolution (`resize`) and the draw cadence (`loop`).
 *
 * Read per frame off a plain object, deliberately — a reactive read in the loop
 * would be the regression this is trying to remove.
 *
 * Seeded with the historical desktop behaviour and replaced by
 * `initAdaptiveQuality` below, once `resize` exists for the controller to call.
 */
let quality: RenderProfile = PROFILES.high

/** Frames since mount, and time owed to the renderer when a draw is skipped. */
let frameNo = 0
let drawAccum = 0

/** HUD insets fed to the camera so auto-fit never frames the tower under the
 *  top bar or behind the build tray. Measured from the real elements rather
 *  than guessed, so a wrapped title or a taller tray is accounted for. */
const measureInsets = (): { top: number; bottom: number } => {
  if (isMobileLandscape.value) {
    return { top: (topBarRef.value?.getBoundingClientRect().height ?? 0) + 8, bottom: 8 }
  }
  // The perk row floats ABOVE the bottom bar (out of flow, so it doesn't
  // stretch it), which means the bar's own rect stops short of the highest
  // thing actually covering the battlefield. Taking the union keeps the Gate
  // from ending up behind the "Reinforced hand" button on a phone.
  const barTop = bottomBarRef.value?.getBoundingClientRect().top ?? window.innerHeight
  const perkTop = trayPerksRef.value?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
  const coveredFrom = Math.min(barTop, perkTop)
  return {
    top: (topBarRef.value?.getBoundingClientRect().height ?? 0) + 8,
    bottom: Math.max(0, window.innerHeight - coveredFrom) + 8
  }
}

/**
 * The same insets, mirrored into a ref.
 *
 * `measureInsets` is called imperatively for the camera; the payout toast is
 * positioned in SCREEN space against the world, so it needs the same numbers
 * reactively in order to stay clear of the top bar and the build tray.
 */
const hudInset = ref({ top: 0, bottom: 0 })

/**
 * Whether the in-game mute button is shown at all.
 *
 * Everywhere but CrazyGames: always. On CrazyGames the platform toolbar carries
 * its own mute, and QA treats a second in-game toggle as one control fighting
 * another — the two do not track each other, so the player ends up with a
 * muted button and audible game. In fullscreen that toolbar is not on screen,
 * so the in-game button comes back rather than leaving no way to silence it.
 *
 * The volume sliders in Options are untouched either way: they are settings,
 * not a competing toggle.
 */
const showMuteButton = computed(() => !isCrazyWeb || isFullscreen.value)

const resize = (): void => {
  const canvas = canvasRef.value
  if (!canvas) return
  // Clamp DPR to the tier's cap — 2 at `high`, which is where this has always
  // sat: past that the pixel cost doubles again for no perceptible gain, and it
  // is the difference between 60 fps and 40 on mid-tier Android.
  //
  // Below `high` the cap is the single biggest lever there is, because it is
  // quadratic: dropping a 1.5-DPR laptop to 1.0 removes 56 % of the pixels
  // every full-screen pass has to touch, and the frame has four of those (the
  // clear, the sky gradient, the celestial bloom, the backdrop blit) before it
  // has drawn a single block.
  dpr = Math.min(window.devicePixelRatio || 1, quality.dpr)
  cssW = window.innerWidth
  cssH = window.innerHeight
  canvas.width = Math.round(cssW * dpr)
  canvas.height = Math.round(cssH * dpr)
  canvas.style.width = `${cssW}px`
  canvas.style.height = `${cssH}px`
  cssHRef.value = cssH
  ctx = canvas.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  const insets = measureInsets()
  hudInset.value = insets
  setViewport(cssW, cssH, insets.top, insets.bottom)
  // Re-frame only when the VIEWPORT moved, not merely the backing store.
  //
  // `snapToFit` forces the camera to its auto-fit target with no animation and
  // drops `isManual`, which is right for a window resize and wrong for a
  // devicePixelRatio change: the adaptive controller re-sizes the canvas when a
  // tier lowers the DPR cap, and without this guard a player who had panned or
  // zoomed to line up a shot would have their view yanked back to centre by a
  // decision that was supposed to be invisible.
  if (cssW !== framedW || cssH !== framedH) {
    framedW = cssW
    framedH = cssH
    snapToFit()
  }
}

/** The viewport `snapToFit` was last run for. */
let framedW = 0
let framedH = 0

// Started here rather than at the top of setup because a tier change calls
// `resize` to re-size the backing store, and `resize` has to exist by then.
// The starting profile comes back as the return value, so nothing is applied
// through the callback before this line.
quality = initAdaptiveQuality({
  onProfile: (p) => {
    quality = p
    resize()
  }
})

/**
 * Screen Y of the shoreline in CSS px — where the grass gives way to water.
 *
 * Tracked so the payout toast can sit ON that line instead of near the top bar,
 * where it covered the crown of the tower for three and a half seconds after
 * every single wave. Written from the render loop with a half-pixel deadband so
 * a settled camera stops re-triggering the layout.
 */
const shorelineY = ref(0)

/** Height of the toast, measured — it changes with the triple-coins offer. */
const toastH = ref(0)
const toastRef = ref<HTMLElement | null>(null)
let toastRo: ResizeObserver | null = null

/**
 * Where the toast is pinned, clamped into the band the HUD leaves free.
 *
 * Below the shoreline the water band is only a couple of cells tall, so on a
 * portrait phone the clamp is what actually decides this — and it has to prefer
 * the BOTTOM of the free band, since the whole point is to keep the tower clear.
 */
const toastTop = computed(() => {
  const lo = hudInset.value.top + 6
  const hi = Math.max(lo, cssHRef.value - hudInset.value.bottom - toastH.value - 6)
  return Math.round(Math.min(hi, Math.max(lo, shorelineY.value)))
})

/** `cssH` as a ref — the toast's clamp needs the viewport height reactively. */
const cssHRef = ref(0)

const loop = (t: number): void => {
  rafId = requestAnimationFrame(loop)
  const dt = lastT ? Math.min(t - lastT, 120) : 16
  lastT = t

  // The probe is inert (a few branches a frame) unless `?perf=1`,
  // `localStorage.perf` or `?bench=` is set, so this ships as-is.
  //
  // It was missing here, and its absence is why "what actually costs the 18 fps
  // on that laptop" is still an open question: `drawScene` is already dotted
  // with `perf.phase('backdrop' | 'blocks' | 'enemies' | ...)` calls, but
  // without a frame bracket around them they accumulate into nothing. Only the
  // mobile-fit scene ever opened one, so every phase number in PERF-LEDGER.md
  // is a mobile-fit number. Now `?perf=1` then `__perf.report()` answers the
  // question on whichever machine is actually slow.
  perf.beginFrame(t)

  // The pause gate covers ads, hidden tabs and platform SDK pauses. The render
  // loop keeps running (so the frame under an ad isn't a frozen artefact) but
  // the simulation clock does not advance.
  perf.phase('update')
  const running = !isGamePaused.value && !showResult.value
  if (running) step(dt)

  // On the low tier every second frame is skipped; the simulation still steps
  // every frame, and the renderer is handed the accumulated time so particles
  // and animations move at the right speed rather than at half.
  frameNo++
  drawAccum += dt
  if (frameNo % quality.drawEvery !== 0) {
    perf.endFrame()
    return
  }

  perf.phase('render')
  if (ctx) drawScene(ctx, cssW, cssH, drawAccum, dpr)

  // Fed AFTER the cadence gate and with the accumulated delta, so what the
  // controller measures is the interval between frames the player actually
  // saw — the thing they experience as smooth or not. Feeding it the raw RAF
  // delta would tell it a machine drawing every second frame was managing 60.
  //
  // Only while running: a frame under an ad, behind the result screen or on a
  // paused tab is cheap for reasons that say nothing about the hardware.
  if (running) sampleAdaptiveFrame(drawAccum)
  drawAccum = 0

  const sea = worldToScreenY(SEA_LEVEL)
  if (Math.abs(sea - shorelineY.value) > 0.5) shorelineY.value = sea
  perf.endFrame()
}

// ─── Build state ────────────────────────────────────────────────────────────

/** Index of the armed offer slot (0-3), or null when nothing is selected. */
const selectedSlot = ref<number | null>(null)
const inspected = ref<Block | null>(null)
const hoverCell = ref<{ c: number; r: number } | null>(null)

/** The shape id in the armed slot. */
const selectedShape = computed<string | null>(() =>
  selectedSlot.value == null ? null : (offers.value[selectedSlot.value] ?? null)
)

/**
 * Quarter-turns applied to the armed piece.
 *
 * Deliberately NOT remembered per slot. The hand rerolls under the player
 * constantly, so a stored angle would keep re-applying itself to whatever piece
 * happened to land in that slot next — the piece would arrive already turned,
 * for a reason the player has no way to see. Arming a slot always starts from
 * the orientation drawn on the tile.
 */
const selectedRot = ref(0)

/**
 * Is the player aiming an Arrow Rain?
 *
 * Declared up here with the other build-mode state rather than down beside its
 * handlers: the overlay watch below reads it, and that watch runs long before
 * the skill's own section.
 */
const arrowRainArmed = ref(false)

/** Can the armed piece be turned at all? Single cells cannot. */
const canRotate = computed(() =>
  !!selectedShape.value && canRotateShape(selectedShape.value)
)

/** Anticlockwise: the left-hand and downward keys, plus Q. */
const ROTATE_LEFT_KEYS = new Set([
  'KeyQ', 'KeyA', 'ArrowLeft', 'KeyS', 'ArrowDown'
])
/** Clockwise: the right-hand and upward keys, plus E. */
const ROTATE_RIGHT_KEYS = new Set([
  'KeyE', 'KeyD', 'ArrowRight', 'KeyW', 'ArrowUp'
])

const rotateBy = (step: number): void => {
  if (!canRotate.value) return
  selectedRot.value = normRot(selectedRot.value + step)
  playFx('uiTap')
}

// A new piece is a new puzzle: it starts the way the tray drew it.
watch(selectedShape, () => { selectedRot.value = 0 })

/**
 * Every legal ANCHOR cell for the armed shape.
 *
 * Recomputed only when the tower's occupancy or the armed shape changes, never
 * per frame. The scan band is widened by the shape's own footprint so a piece
 * whose anchor sits outside the tower (an L reaching in from the side) is still
 * offered as a candidate.
 */
const legalSlots = computed<Array<[number, number]>>(() => {
  const shapeId = selectedShape.value
  if (!shapeId) return []
  void towerVersion.value
  const def = rotatedShape(shapeId, selectedRot.value)
  if (def.cells.length === 0) return []

  let shapeW = 1
  let shapeH = 1
  for (const [dx, dy] of def.cells) {
    if (dx + 1 > shapeW) shapeW = dx + 1
    if (dy + 1 > shapeH) shapeH = dy + 1
  }

  // Scan wide enough to cover BOTH caps.
  //
  // The foundation's width is `halfWidthAt(0)` and grows with the foundation
  // tech; the floors above it are bounded only by `UPPER_HALF_WIDTH`, and a
  // cantilevered arm can legally reach past the footing. Scanning the
  // foundation width alone silently withheld every overhang slot — the piece
  // was placeable by tapping, but nothing ever lit up to say so. Bounded by the
  // tower's own extent plus a piece-width of reach, so this stays a small scan
  // on a small tower instead of always sweeping 45 columns.
  let maxR = 0
  let reach = 0
  for (const b of getTowerBlocks().values()) {
    if (b.r + spanH(b) - 1 > maxR) maxR = b.r + spanH(b) - 1
    const w = Math.max(Math.abs(b.c), Math.abs(b.c + spanW(b) - 1))
    if (w > reach) reach = w
  }
  // A naval piece is moored, not built: its only legal row is the water, and
  // its width is the dock's rather than the tower's.
  const naval = def.cells.every(([, , typeId]) => isShip(typeId))
  const halfW = naval
    ? halfWidthAt(WATER_ROW)
    : Math.min(UPPER_HALF_WIDTH, Math.max(halfWidthAt(0), reach + shapeW + 1))
  const rowFrom = naval ? WATER_ROW : 0
  const rowTo = naval ? WATER_ROW : maxR + 1

  const out: Array<[number, number]> = []
  for (let c = -halfW; c <= halfW - shapeW + 1; c++) {
    for (let r = rowFrom; r <= rowTo; r++) {
      if (canPlaceShapeAt(shapeId, c, r, selectedRot.value)) out.push([c, r])
    }
  }
  void shapeH
  return out
})

// Publish the build overlay to the renderer whenever any input changes.
watch(
  [selectedShape, selectedRot, hoverCell, legalSlots, inspected, arrowRainArmed],
  () => {
    const hover = hoverCell.value
    const shapeId = selectedShape.value
    const valid = !!(shapeId && hover
      && canPlaceShapeAt(shapeId, hover.c, hover.r, selectedRot.value)
      && canAffordShape(shapeId))
    setBuildOverlay({
      selectedShape: shapeId,
      selectedRot: selectedRot.value,
      hoverC: hover?.c ?? null,
      hoverR: hover?.r ?? null,
      hoverValid: valid,
      slots: legalSlots.value,
      inspectC: inspected.value?.c ?? null,
      inspectR: inspected.value?.r ?? null,
      aimX: arrowRainArmed.value ? (hover?.c ?? 0) : null,
      aimRadius: ARROW_RAIN_RADIUS
    })
  },
  { immediate: true, deep: false }
)

// ─── Pointer handling ───────────────────────────────────────────────────────
//
// One handler set drives tap-to-place, tap-to-inspect, drag-to-pan,
// pinch-to-zoom and long-press-to-inspect. Tap vs drag is decided by a movement
// threshold, so a slightly shaky finger still places a block instead of
// silently nudging the camera two pixels.

const TAP_SLOP_PX = 10
const LONG_PRESS_MS = 450

const pointers = new Map<number, { x: number; y: number }>()
let downX = 0
let downY = 0
let downAt = 0
let lastX = 0
let lastY = 0
let moved = false
let panning = false
let longPressFired = false
let longPressTimer: ReturnType<typeof setTimeout> | null = null

const clearLongPress = (): void => {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
}

const onPointerDown = (e: PointerEvent): void => {
  // In a portal iframe the frame does not hold keyboard focus on load, and the
  // `preventDefault` below cancels the implicit focus transfer a click would
  // otherwise cause — so claim focus explicitly, or Space/Enter never arrive.
  try { window.focus() } catch { /* a cross-origin parent may refuse */ }
  e.preventDefault()

  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  try { canvasRef.value?.setPointerCapture(e.pointerId) } catch { /* ignore */ }

  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    beginPinch(Math.hypot(a!.x - b!.x, a!.y - b!.y))
    clearLongPress()
    panning = false
    return
  }

  downX = lastX = e.clientX
  downY = lastY = e.clientY
  downAt = performance.now()
  moved = false
  panning = false
  longPressFired = false

  // Long-press opens the inspector for an existing block. The press itself is
  // never destructive — selling lives behind the inspector's own button.
  clearLongPress()
  longPressTimer = setTimeout(() => {
    longPressTimer = null
    if (moved) return
    const cell = screenToCell(downX, downY)
    const block = getBlocks().get(`${cell.c},${cell.r}`)
    if (!block) return
    longPressFired = true
    inspected.value = block
    selectedSlot.value = null
    playSound('modal-open', 0.05)
  }, LONG_PRESS_MS)
}

const onPointerMove = (e: PointerEvent): void => {
  if (!pointers.has(e.pointerId)) {
    // Mouse hover with no button held: preview the placement cell, or the
    // strip an armed volley would come down on.
    if (e.pointerType === 'mouse' && (selectedShape.value || arrowRainArmed.value)) {
      hoverCell.value = screenToCell(e.clientX, e.clientY)
    }
    return
  }
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

  if (pointers.size >= 2) {
    const [a, b] = [...pointers.values()]
    updatePinch(
      Math.hypot(a!.x - b!.x, a!.y - b!.y),
      (a!.x + b!.x) / 2,
      (a!.y + b!.y) / 2
    )
    return
  }

  if (!moved && Math.hypot(e.clientX - downX, e.clientY - downY) > TAP_SLOP_PX) {
    moved = true
    panning = true
    clearLongPress()
  }
  if (panning) {
    // Per-frame delta, so the world tracks the finger 1:1.
    panBy(e.clientX - lastX, e.clientY - lastY)
    markHintDone('camera')
  }
  lastX = e.clientX
  lastY = e.clientY
  if (selectedShape.value || arrowRainArmed.value) {
    hoverCell.value = screenToCell(e.clientX, e.clientY)
  }
}

const onPointerUp = (e: PointerEvent): void => {
  const wasSingle = pointers.size === 1
  pointers.delete(e.pointerId)
  if (pointers.size < 2) endPinch()
  clearLongPress()

  if (!wasSingle || moved || longPressFired) { panning = false; return }

  const cell = screenToCell(e.clientX, e.clientY)

  // Aiming the volley outranks everything: it is a mode the player entered on
  // purpose and the next tap is the whole interaction.
  if (arrowRainArmed.value) {
    fireArrowRain(cell.c)
    return
  }

  if (selectedSlot.value != null) {
    tryPlace(cell.c, cell.r)
    return
  }

  // Nothing armed: tap a block to inspect it, tap empty space to dismiss.
  inspected.value = getBlocks().get(`${cell.c},${cell.r}`) ?? null
  // The beat's contract is "you opened THIS block", not "you opened something":
  // the panel it hands off to is about the weld, and the rank beat that follows
  // measures the button inside it.
  //
  // Compared by UID, never by identity. `inspected` is a deep `ref`, so reading
  // it back hands out a reactive PROXY of the block while `mergedBlock` returns
  // the raw object out of the simulation's own map — `===` between the two is
  // false for the very block the player just tapped, and the beat could never
  // be completed.
  if (tutorialStep.value === 'inspectMerged') {
    const weld = mergedBlock()
    if (weld && inspected.value?.uid === weld.uid) completeTutorialStep('inspectMerged')
  }
}

const onWheel = (e: WheelEvent): void => {
  zoomAt(e.deltaY < 0 ? 1.12 : 0.89, e.clientX, e.clientY)
  markHintDone('camera')
}

const tryPlace = (c: number, r: number): void => {
  const slot = selectedSlot.value
  const shapeId = selectedShape.value
  if (slot == null || !shapeId) return

  // A price the player cannot meet is refused OUT LOUD, and before the cell is
  // even looked at: the short piles blink in the resource bar and a heavier
  // knock plays (`useResourceBlink`). An illegal cell and an empty purse are
  // different problems with different fixes, so they get different answers.
  if (denyPurchase(missingFor(shapeId))) return
  if (!canPlaceShapeAt(shapeId, c, r, selectedRot.value)) {
    // A short negative click is better feedback than silence — it confirms the
    // tap registered and the placement was rejected, not missed.
    playSound('obstacle-hit', 0.03)
    return
  }
  if (!placeShape(slot, c, r, selectedRot.value)) return
  noteBuildAction()

  // Captured BEFORE the beat is completed — completing it moves the index, so
  // afterwards there is no way to tell that this placement was the taught one.
  const taughtPlacement = tutorialStep.value === 'place'

  markHintDone('placeBlock')
  completeTutorialStep('place')

  if (taughtPlacement) {
    // The tutorial's placement ALWAYS disarms the hand, whatever the reroll
    // dealt into the slot.
    //
    // The pointer has not moved, so the hover cell is still the cell the piece
    // just went into — and the slot rerolls on placement. Left armed, the
    // renderer draws the NEW shape's ghost (an archer, say) directly on top of
    // the block the player just placed, and the tutorial's next beat is spent
    // looking at two blocks in one cell. The player is not being asked to build
    // again here: what follows is a pictogram, then a block to tap, and both
    // are worse with a piece stuck under the cursor.
    selectedSlot.value = null
  } else {
    // The slot has already rerolled to a new piece, and it STAYS armed even
    // when that piece is unaffordable.
    //
    // It used to disarm, so the player would not be left holding a shape they
    // could not place with its ghost stuck red under the pointer. But a player
    // who has just spent their last wood carries on clicking where they are
    // building, and with nothing armed each click quietly inspected a block
    // instead — no placement, and no word about why. Armed, the red ghost now
    // has an explanation the moment they click (the refusal blink above), and
    // once a kill's payout lands the same click places the piece.
    if (!offers.value[slot]) selectedSlot.value = null
  }
  if (phase.value === 'build') saveRunSnapshot()
}

const onSelectSlot = (slot: number | null): void => {
  selectedSlot.value = slot
  inspected.value = null
  if (slot != null) {
    markHintDone('selectBlock')
    // Only the slot the coach mark lit. Nothing else is reachable while it is
    // up, but the beat's contract is "you armed the archer", not "you armed
    // something".
    if (slot === TUTORIAL_SLOT) completeTutorialStep('pick')
    // Picking a piece the player cannot pay for still arms it — the tray has
    // always let them look at what they are saving for — but the pick itself
    // is told what is missing, by click or by number key alike.
    const shapeId = offers.value[slot]
    if (shapeId) denyPurchase(missingFor(shapeId))
  }
}

// ─── Idle nudge ─────────────────────────────────────────────────────────────
//
// Fifteen seconds of nothing built while something in the hand is affordable,
// and the affordable tiles pulse until the next placement (`useIdleNudge`).
// The clock only runs while the game is actually in front of the player —
// tutorial finished, no card, demo, modal or ad — so it measures their
// idleness, not the time the game spent waiting on something else.
useIdleNudge({
  eligible: () => tutorialOver.value && isLiveGameplay.value && !isGamePaused.value
    && !showMergeGuide.value && !showMergePower.value && !showTrap.value,
  anyAffordable: () => offers.value.some((id) => canAffordShape(id))
})

// ─── Control hints ──────────────────────────────────────────────────────────
//
// One hint at a time, chosen by "what does the player most need to know now",
// each retiring permanently the first time the action is performed.

const hintsDone = ref<Set<HintId>>(new Set())
const onboarded = ref(getState<boolean>(ONBOARDED_KEY, false) === true)

const markHintDone = (id: HintId): void => {
  if (hintsDone.value.has(id)) return
  const next = new Set(hintsDone.value)
  next.add(id)
  hintsDone.value = next
}

const activeHint = computed<HintId | null>(() => {
  // Never nag a veteran, and never talk over a result screen.
  if (onboarded.value || showResult.value || isAnyModalOpen.value) return null
  // Never over the coach marks either: they are deliberately wordless, and a
  // hint bubble is the one thing on screen that would put copy back on them.
  if (tutorialStep.value) return null
  if (phase.value === 'defeat') return null
  if (!hintsDone.value.has('selectBlock') && selectedSlot.value == null) return 'selectBlock'
  if (!hintsDone.value.has('placeBlock') && selectedSlot.value != null) return 'placeBlock'
  if (!hintsDone.value.has('callWave') && phase.value === 'build' && wave.value === 0) return 'callWave'
  if (!hintsDone.value.has('camera') && wave.value >= 1) return 'camera'
  // The inspector is where run gold is spent — block upgrades, ranks, the
  // effective stats of a reinforced or roofed block. It opens on a long-press,
  // which nothing ever taught: this hint has been written and translated into
  // every locale since the inspector shipped and was never once emitted, so
  // in practice no player was told the upgrade button exists.
  if (!hintsDone.value.has('inspect') && wave.value >= 1 && blockCount.value > 1) return 'inspect'
  return null
})

// After the second wave the player has seen every primer that matters; persist
// that so a returning player is never re-onboarded.
watch(wave, (w) => {
  if (w >= 2 && !onboarded.value) {
    onboarded.value = true
    setState(ONBOARDED_KEY, true)
  }
})

// ─── Result flow ────────────────────────────────────────────────────────────

const showResult = ref(false)
const showOptions = ref(false)
const showTech = ref(false)
/** Ask the tech tree to run its first-death explainer. Set only by "Upgrade!". */
const techIntro = ref(false)
const isAdInFlight = ref(false)
const twoXUsed = ref(false)
const summary = ref(runSummary())

// ── Leaderboard ──
// Everything here degrades to "not shown". A board that is unset, unreachable
// or still loading must never keep the player on the defeat screen.
// The headline number is the player's BEST, with its rank — a rank computed
// from a weak run would drop every time they played badly, which reads as the
// board punishing them for playing. Showing the record standing, with this
// run's score beside it, makes "I did not beat it" the obvious reading and
// leaves the reason to play again on screen.
const bestScoreValue = computed(() => Math.max(progress.bestScore.value, summary.value.score))
const isRecordRun = computed(
  () => summary.value.score > 0 && summary.value.score >= bestScoreValue.value
)
const rankValue = computed(() => rankFor(bestScoreValue.value))
const rankPending = computed(() => leaderboardPending.value && rankValue.value === 0)
const showRank = computed(
  () => leaderboardEnabled && bestScoreValue.value > 0 && (rankPending.value || rankValue.value !== 0)
)
/**
 * Formatted in script, not in the template: `#{…}` is Pug's own interpolation
 * syntax, so a literal `#` in front of a mustache is a parse error.
 *
 * THERE IS NO "#100+" BRANCH ANY MORE, and putting one back is a regression.
 * The published rows stop at 100 and this board has 361 players, so the old
 * sentinel was shown to 72 % of them — a non-answer delivered to exactly the
 * players who most needed a number. `rankFor` now returns a real placing for
 * every score: exact from the Worker's score histogram wherever one is in
 * hand, and otherwise estimated and pinned for the session. It has no sentinel
 * left to render, which is what stops this being re-broken by the next screen
 * that shows a rank.
 */
const rankDisplay = computed(() => {
  if (rankPending.value) return '…'
  return `#${rankValue.value.toLocaleString()}`
})

const rewardCoinRef = ref<HTMLElement | null>(null)
const coinBadgeRef = ref<InstanceType<typeof CoinBadge> | null>(null)
const coinBadgeEl = computed<HTMLElement | null>(() => coinBadgeRef.value?.rootEl ?? null)

/**
 * What the rewarded video multiplies the run's coin payout to.
 *
 * One source of truth: the button's own label renders this number, so the offer
 * and the payout cannot drift apart the way a hard-coded "2×" in a translated
 * string silently did.
 */
const RESULT_COIN_MULTIPLIER = 3

/**
 * Deaths before the 3× offer appears at all.
 *
 * A player meeting a rewarded video on the screen that ends their FIRST run
 * learns that dying is the moment the game asks them for something. `runs` is
 * counted at run START, so the second defeat screen is the first one where it
 * reads 2.
 */
const RESULT_TWOX_MIN_DEATHS = 2

const twoXAvailable = computed(() =>
  !twoXUsed.value
  && summary.value.coins > 0
  && progress.runs.value >= RESULT_TWOX_MIN_DEATHS
  && canOfferReward.value
)

/**
 * The wave the continue hands the tower back at.
 *
 * The last wave actually BEATEN, not the one that killed the run: a continue
 * restores the snapshot from before the fatal wave, so what the player gets is
 * another build phase on the tower that cleared `wavesCleared` — a chance to
 * fortify against the wave that broke through rather than to replay it as-is.
 * Floored at 1: a run that ends before clearing anything still comes back to a
 * wave rather than to wave zero.
 */
const continueWave = computed(() => Math.max(1, summary.value.wavesCleared))

const RESULT_INTERSTITIAL_DELAY_MS = 600
const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/**
 * Show an interstitial, if one is due.
 *
 * Two gates: the provider must actually have inventory, and at least 121 s must
 * have passed since the last midgame ad — session start counts as one, so the
 * opening two minutes are never interrupted. Both in-run placements go through
 * here (the end of a wave and the defeat screen) so the pacing rule lives in
 * one place instead of each call site guessing.
 *
 * `firstIsExempt` lets the DEFEAT placement take the session's opening break
 * without waiting out the floor — see `useInterstitialPacing`. The wave-clear
 * placement deliberately does not pass it: a fast first wave would otherwise
 * spend that break 40 seconds in, on a player who has not finished a run yet.
 *
 * The clock is stamped up front, not after the ad. `showMidgameAd` stamps it
 * too, but only once the audio kill has run; claiming the slot before the
 * `RESULT_INTERSTITIAL_DELAY_MS` wait closes the window where a wave clear and
 * a defeat land inside the same second and both pass the gate.
 */
const maybeShowInterstitial = async (
  opts: { firstIsExempt?: boolean } = {}
): Promise<void> => {
  if (!isInterstitialReady.value) return
  if (!canShowInterstitial(opts)) return
  markInterstitialShown()
  await wait(RESULT_INTERSTITIAL_DELAY_MS)
  await showMidgameAd()
}

/**
 * Block until no ad is on screen.
 *
 * `maybeShowInterstitial` covers the ad THIS call decided to show. It does not
 * cover an ad that was already running — the wave-clear break spends
 * `RESULT_INTERSTITIAL_DELAY_MS` waiting before it even requests, so a gate that
 * falls inside that window finds the pacing slot already claimed, skips its own
 * request, and reveals the death screen straight into an interstitial that is
 * about to open.
 *
 * So the reveal waits on the gate itself rather than on any one request. Capped,
 * because a stuck gate must never be able to strand the player on a dead
 * battlefield with no way forward.
 */
const AD_GATE_SETTLE_TIMEOUT_MS = 30_000

const waitForAdGateClear = async (): Promise<void> => {
  if (!isAdShowing.value) return
  const deadline = Date.now() + AD_GATE_SETTLE_TIMEOUT_MS
  while (isAdShowing.value && Date.now() < deadline) {
    await wait(100)
  }
}

/**
 * Present the defeat screen.
 *
 * Ad ordering is deliberate: the interstitial is requested and AWAITED before
 * the result screen is revealed. Revealing first made the defeat sting play for
 * a beat and then get cut off the instant the ad covered the screen — a QA
 * finding that is easy to reintroduce by "simplifying" this function.
 *
 * The defeat sound is NOT played here. `endRun()` already emits a `gateFell`
 * FX event and the audio bus plays the sting the moment the Gate breaks;
 * playing it again here stacked two copies of the same sample.
 */
/**
 * The one thing this run would most have benefited from knowing.
 *
 * CONTEXTUAL, not random. A tip about merging is noise to a player who merged
 * all run and the whole point to one who has never seen it, and the death
 * screen only has room for a single line — so it goes to whichever mechanic
 * this particular tower did without.
 *
 * Candidates are gathered in priority order (income first: the wave-12 wall is
 * an attrition wall long before it is a damage one), then a stored cursor
 * rotates through whichever of them are eligible, so a player who keeps dying
 * the same way still learns something new each time.
 */
const tipCursor = ref(getState<number>(TIP_CURSOR_KEY, 0) ?? 0)
const deathTip = ref<string | null>(null)

const pickDeathTip = (): string | null => {
  const blocks = [...getTowerBlocks().values()]
  const kinds = new Set(blocks.map((b) => blockDef(b.typeId).kind))
  const merged = blocks.some((b) => (b.tier ?? 1) > 1)

  const eligible: string[] = []

  // ── Reaching a trebuchet ──
  //
  // The one threat whose answer is not "build more" but "build a DIFFERENT
  // thing". A trebuchet parks at its standoff and shells the tower from beyond
  // every cheap gun in the game — archer 7.5, cannon 8.5, bombard 9 — so a
  // player whose whole answer to everything so far has been another Archery
  // block simply watches it work, and nothing on screen explains why.
  //
  // Offered only to a player who has actually MET one and owns nothing that
  // reaches, so it never fires as trivia. Reach is measured through the live
  // range multiplier rather than off the printed range: enough ranks of Long
  // Sight genuinely do walk a bombard out to a trebuchet, and telling that
  // player they cannot reach would be the tip lying to them.
  const treb = ENEMY_DEFS.trebuchet
  const standoff = treb?.siege?.standoff
  if (standoff !== undefined && wave.value >= (treb?.minWave ?? Infinity)) {
    const reaches = blocks.some((b) => {
      const w = blockDef(b.typeId).weapon
      return !!w && w.range * effectiveRangeMul.value > standoff
    })
    if (!reaches) eligible.push('siegeReach')
  }

  if (!kinds.has('economy')) eligible.push('eco')
  if (!kinds.has('buff')) eligible.push('buff')
  if (!merged) eligible.push('merge')
  if (progress.affordableCount.value > 0) eligible.push('spend')
  eligible.push('branches', 'shape', 'gold')

  if (eligible.length === 0) return null
  const id = eligible[tipCursor.value % eligible.length]!
  tipCursor.value = (tipCursor.value + 1) % 1000
  setState(TIP_CURSOR_KEY, tipCursor.value)
  return id
}

const presentDefeat = async (): Promise<void> => {
  const s = runSummary()
  summary.value = s
  // Read the tower BEFORE anything clears it, and freeze the choice so it
  // cannot change under the player while they are reading it.
  deathTip.value = pickDeathTip()
  twoXUsed.value = false
  stopBattleMusic()

  // Feed the run into every meta system BEFORE the screen renders, so the
  // numbers the player sees already include this run.
  //
  // The dailies have already been credited up to the last wave clear; this
  // catches the partial wave the player died in. It is a delta credit, so the
  // overlap costs nothing. Achievements are LIFETIME totals with a `runs`
  // counter, so they must be fed exactly once — here, and nowhere else.
  const run = { waves: s.wavesCleared, kills: s.kills, coins: s.coinsEarned, height: s.height, blocks: s.blocksPlaced }
  recordRun(run)
  recordAchievementRun(run)
  awardRunFinished()
  progress.recordRunEnd({
    wave: s.wave,
    kills: s.kills,
    score: s.score,
    wavesCleared: s.wavesCleared,
    height: s.height,
    blocks: s.blocks,
    blocksPlaced: s.blocksPlaced
  })
  // `recordRunEnd` has already folded this run into the stored best, so
  // `bestScore` is now the highest the player has ever managed — which is both
  // the number the board holds and the number the rank belongs to. Never
  // awaited: a slow or dead endpoint must not hold up the defeat screen.
  void reportRun(progress.bestScore.value, Math.max(s.wave, 1))

  // The session's FIRST break belongs here, on the first death screen, however
  // early it arrives — the 121 s floor is there to stop breaks stacking, and
  // before the first one there is nothing to stack against.
  await maybeShowInterstitial({ firstIsExempt: true })
  // The ordering QA grades: the break plays BEFORE the death screen, never over
  // the top of it. `maybeShowInterstitial` only awaits an ad it started itself,
  // so this catches one that was already in flight.
  await waitForAdGateClear()

  // The trick demo goes in the gap the break just left, BEFORE the result
  // screen — never over the top of it. Two reasons it belongs here rather than
  // after: the ordering QA grades is break → screen, and a full-screen
  // animation covering a screen that has a rewarded offer on it is the exact
  // shape a portal reviewer rejects. It resolves immediately for everyone who
  // has already seen it, which is every player after their first death.
  await runTrapTutorial()

  showResult.value = true
  void grantRunCoins()
}

const grantRunCoins = async (): Promise<void> => {
  const total = summary.value.coins
  if (total <= 0) return
  addCoins(total)
  await nextTick()
  const el = rewardCoinRef.value
  if (el && coinBadgeEl.value) {
    spawnCoinExplosion({
      sourceEl: el,
      targetEl: coinBadgeEl.value,
      count: Math.min(40, 12 + Math.round(total / 6))
    })
  }
}

const onTwoX = async (): Promise<void> => {
  if (adInFlight.value || !twoXAvailable.value) return
  // `grantRunCoins` has already paid the run out once, so the ad tops the
  // payout up to the full multiple rather than paying it again.
  const bonus = summary.value.coins * (RESULT_COIN_MULTIPLIER - 1)
  await claimReward(() => {
    addCoins(bonus)
    twoXUsed.value = true
    const el = rewardCoinRef.value
    if (el && coinBadgeEl.value) {
      spawnCoinExplosion({ sourceEl: el, targetEl: coinBadgeEl.value, count: 26 })
    }
  })
}

/**
 * Begin a brand-new siege.
 *
 * A player who has not yet finished a first session gets the scripted opening:
 * a free starter fort on the foundation. It stays on offer until they clear
 * wave 2 — a run that ended on wave 1 is exactly the run that needed it, and
 * taking the help away after the first failure is the wrong lesson.
 */
const beginRun = (): void => {
  startRun()
  // Last run's payout must not still be drifting up into a fresh bar.
  clearResourceFloats()
  if (isFirstSession()) seedScriptedOpening()
  // The first beat points at one tile; that tile has to hold the cannon before
  // the player is looking at it.
  armTutorialHand()
}

/** Wipe the battlefield and start a fresh siege. */
const startFreshRun = (): void => {
  beginMissionRun()
  showResult.value = false
  selectedSlot.value = null
  inspected.value = null
  resetVfx()
  resetDrawnFx()
  beginRun()
  progress.recordRunStart()
  snapToFit()
  startBattleMusic()
}

/**
 * "Defend again" — start a fresh siege from the result screen.
 *
 * Deliberately NOT behind a rewarded video, on any build. This is the way OUT
 * of a finished run: gating it means a player whose ad fails to fill is stuck
 * staring at the defeat screen with no way back into the game. The rewarded
 * placements are the 2× payout and the reinforced hand — things the player can
 * decline and carry on without.
 */
const onRebuild = (): void => {
  if (adInFlight.value) return
  startFreshRun()
}

/**
 * "Upgrade!" — jump straight into the tech tree with the run's coins banked.
 *
 * `techIntro` asks the tree to run its three-beat explainer. It is set only on
 * this path: arriving here means the player has just LOST, which is the one
 * moment they have coins, a reason to spend them, and no idea that the screen
 * they are being shown is permanent progression rather than another tower
 * upgrade. The tree itself only shows the intro once per save.
 */
const onUpgrade = (): void => {
  if (adInFlight.value) return
  showResult.value = false
  techIntro.value = true
  showTech.value = true
}

// Closing the tech tree after a defeat returns the player to the RESULT screen,
// not into a fresh siege.
//
// It used to start the run immediately, on the reasoning that they had left the
// result screen through "Upgrade!" and wanted to play. In practice it punished
// the exact player the tree exists for: a first-timer taps "Upgrade!", does not
// understand the graph, closes it to think — and the game restarts, spending
// nothing and dropping them back on wave 0 with the tower they just lost with.
// Handing back the screen they came from costs one tap and loses nothing.
watch(showTech, (open, wasOpen) => {
  // The tree is FOUND the moment it opens, by whatever route — the HUD button,
  // or the defeat screen's Upgrade button. Watching the modal rather than
  // marking it at each call site is deliberate: there are already two ways in,
  // and a third added later would otherwise leave the nudge bouncing at a
  // player who is looking straight at the screen it points to.
  if (open) { markTechFound(); return }
  techIntro.value = false
  if (wasOpen && phase.value === 'defeat') showResult.value = true
})

watch(phase, (p, prev) => {
  if (p === 'defeat' && prev !== 'defeat') void presentDefeat()
  if (p === 'battle' && prev === 'build') {
    startBattleMusic()
    // Building during a battle is allowed, but the inspector's range circle is
    // clutter once the shooting starts.
    inspected.value = null
  }
})

/** Suppresses the wave-clear toast while a post-wave interstitial is on screen. */
const toastHeld = ref(false)

// A cleared wave feeds the battle pass, and is the natural interstitial beat:
// the player has just finished something and has not yet started the next
// thing. The ad is awaited BEFORE the wave-clear toast is allowed to run its
// animation, so the reward readout is never covered mid-flight. The 120 s floor
// in `useAdGate` keeps a fast run from stacking one break onto another.
watch(lastWaveReward, async (r) => {
  if (!r) return
  awardWaveCleared()
  // Daily missions tick here, not only at the end of the run. A wave clear is
  // the natural checkpoint: the player has just finished something, the numbers
  // are settled, and it is the moment they are most likely to open the panel.
  feedMissions()
  toastHeld.value = true
  await maybeShowInterstitial()
  toastHeld.value = false

  // What the wave paid, announced AT the numbers it paid into.
  //
  // After the interstitial, not before: the floats are a second-long animation
  // and playing them under an ad spends them on a screen nobody is looking at.
  // Wallet coins are absent on purpose — those already fly to the badge in the
  // corner via `coinPayout`, and a second readout of the same coins would say
  // the wave paid twice. The same logic now covers the materials: most of them
  // were paid kill by kill and announced on each kill, so only what landed AT
  // the clear rises into the bar here.
  pushResourceFloat('wood', r.atClear.wood)
  pushResourceFloat('stone', r.atClear.stone)
  pushResourceFloat('gold', r.atClear.gold)
})

// ─── First-stage tutorial ───────────────────────────────────────────────────
//
// THE FIRST STAGE OF THE FIRST SESSION, once, for everybody — and there is no
// way past it but through it.
//
// Three beats, no words, no buttons: arm the cannon, place it BESIDE ITS TWIN,
// call the wave. Each one dims the screen except for the single thing it wants
// tapped and drops a fat yellow arrow on it, so the only move available is the
// move being taught. Nothing advances on a "Next"; every beat
// advances on the ACTION it exists to teach.
//
// THE FIRST PLACEMENT IS A MERGE, and that is the whole point of the beat. The
// tutorial used to hand over a lone archer and ask for it to be put down
// anywhere legal, which taught "blocks go on the tower" — true, and something
// the player would have worked out unaided. Merging is what the game is
// actually about, and it used to be a 200-coin node in a screen most players
// never opened, so most players never met it at all. Now their FIRST move
// fuses two cannons into one that hits three times as hard, in front of them,
// before they have read a single word.
//
// What it replaced, and why none of it comes back:
//
//   * An OFFER ("Need a tutorial?" — Start / Skip). A first-time player is not
//     equipped to answer that question, and the ones who most needed the answer
//     were the likeliest to tap the smaller, quieter button. Nobody is asked
//     any more; the tutorial simply happens.
//   * A "Protect the Gate" intro beat. It was two lines of prose about a thing
//     the game demonstrates by itself thirty seconds later, and it stood
//     between the player and the first thing they could actually do.
//   * A NEXT button on every beat. It let a player finish the tutorial without
//     placing a single block, which is the one thing the tutorial is for.
//   * Every line of copy. This ships to children on portals, and reading is
//     where they leave. A spotlight and an arrow need no locale.

/**
 * `mergeGuide` sits between the placement and the wave because that is where
 * the "Aha!" happens, not where it would be convenient to explain it.
 *
 * The `place` beat is aimed at a cell where the dealt cannon FUSES with the
 * starter fort's cannon (see `tutorialCell`), so the player's first placement
 * is also their first merge — and merging is the single mechanic that moved
 * average playtime most. What they do not learn from one accidental fusion is
 * that the ladder continues: 2×1, then 2×2, then 4×2, then on. One pictogram,
 * on the frame they just felt it work, is where that lands.
 *
 * It is CONDITIONAL. A board that offered no fusing neighbour never produced
 * the moment, and explaining a payoff to somebody who has not had it is the
 * kind of tutorial beat players skip past and resent — `advanceTutorial` steps
 * over it in that case.
 *
 * `mergePower` follows the ladder: six seconds of `MergePowerDemo`, the same
 * monster shot by a plain cannon (−10 %) and then a tier 3 (−75 %). The ladder
 * shows that welds keep going; players still stopped at tier 2, because
 * nothing showed them what the next weld is FOR.
 */
const TUTORIAL_STEPS: TutorialStep[] = [
  'pick', 'place', 'mergeGuide', 'mergePower', 'inspectMerged', 'rankUp', 'call'
]

/**
 * The three beats that only exist for a player who has just fused something.
 *
 * They are skipped together, never individually: a board that offered the
 * dealt cannon no partner produced no weld, so there is no ladder to explain,
 * nothing worth inspecting and nothing to rank. Showing any one of them to that
 * player is a beat about a thing that did not happen.
 */
const MERGE_BEATS = new Set<TutorialStep>(['mergeGuide', 'mergePower', 'inspectMerged', 'rankUp'])

/**
 * The piece the tutorial teaches with, dealt into the weapon slot.
 *
 * A lone cannon, and it has to be a cannon: the scripted opening's fort already
 * has one standing on the Gate, so this is the piece that TWINS with what is
 * already on the board. Put it beside its twin and the two fuse on the spot —
 * the lesson, delivered by the player's own hand rather than by a tip.
 *
 * It is affordable on every first run (25 wood + 10 stone against a 120/40
 * opening purse), it is one cell — so it fits anywhere the spotlight can point
 * and cannot be placed "wrong" by rotation — and it is a WEAPON, which is the
 * second lesson: a tower of crates loses, some blocks shoot.
 */
const TUTORIAL_SHAPE = 'cannon1'
/** The block that shape puts down — what a merge partner has to match. */
const TUTORIAL_BLOCK = 'cannon'
const TUTORIAL_SLOT = WEAPON_SLOT

// Two states, only one of which is persisted.
//
//   not done  → the coach marks, from the first frame, unconditionally
//   done      → nothing, ever again
//
// The answer goes through `setState`, which the SaveManager mirrors to whichever
// backend the build actually has — the platform SDK's cloud store on
// CrazyGames / Playgama / Yandex, plain localStorage everywhere else. So a
// player taught on their phone is not taught again on their desktop.
const tutorialDone = ref(getState<boolean>(TUTORIAL_KEY, false) === true)
const tutorialIndex = ref(0)
/** Rect of the element the current beat points at, in screen space. */
const tutorialRect = ref<{ x: number; y: number; w: number; h: number } | null>(null)

/** True while the first stage is still the right moment to teach anything. */
const inFirstStage = computed(() =>
  !tutorialDone.value
  && wave.value <= 1
  && !showResult.value
  && !isAnyModalOpen.value
)

/**
 * The tutorial is behind this RUN: finished, or past the wave its coach marks
 * can show on. The flying chest and the idle nudge wait on this rather than on
 * `tutorialDone` alone, so a tutorial that is abandoned rather than finished
 * does not also withhold them — the phone board's is, for every player a blind
 * playtest watched, and both boards read the same signal.
 */
const tutorialOver = computed(() => tutorialDone.value || wave.value > 1)

const tutorialStep = computed<TutorialStep | null>(() => {
  if (!inFirstStage.value) return null
  return TUTORIAL_STEPS[tutorialIndex.value] ?? null
})

/**
 * Where the cannon goes.
 *
 * A preference list walked through the real placement rule, not a fixed cell:
 * the beat has to point at somewhere the piece can actually go, and what is
 * legal depends on what is standing. First choice is the shoulder of the
 * scripted opening's starter fort, beside its cannon — which is both "add to
 * your tower" rather than "start a second one" AND, now that the hand holds a
 * cannon too, the cell where the two fuse.
 *
 * Every candidate is checked for a merge partner before it is checked for mere
 * legality, so the beat lands on a fusing cell whenever the board has one. A
 * board that offers none still has to be finishable — there is no Skip button
 * anywhere — so the plain legal cell is the second answer rather than no
 * answer: that player is taught less, not stranded.
 */
const TUTORIAL_CELLS: ReadonlyArray<readonly [number, number]> = [
  [-1, 1], [1, 1], [0, 2], [-2, 0], [2, 0], [-1, 0], [1, 0]
]

/** The four cells a merge reaches from — the simulation's own list. */
const MERGE_NEIGHBOURS = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const

/**
 * Would the tutorial piece fuse with something already standing, put here?
 *
 * Read off the live occupancy map, so it answers for the board as it actually
 * is rather than the one the opening was supposed to build: an orthogonal
 * neighbour of the same block at the same tier is what the merge rule looks
 * for, and tier 1 is the only tier a lone piece can join.
 */
const tutorialMergesAt = (c: number, r: number): boolean => {
  const cells = getBlocks()
  for (const [dx, dy] of MERGE_NEIGHBOURS) {
    const n = cells.get(`${c + dx},${r + dy}`)
    if (n && n.typeId === TUTORIAL_BLOCK && tierOf(n.tier) === 1) return true
  }
  return false
}

const tutorialCell = computed<{ c: number; r: number }>(() => {
  void towerVersion.value
  const legal = (c: number, r: number): boolean => canPlaceShapeAt(TUTORIAL_SHAPE, c, r, 0)

  for (const [c, r] of TUTORIAL_CELLS) if (legal(c, r) && tutorialMergesAt(c, r)) return { c, r }
  for (const [c, r] of TUTORIAL_CELLS) if (legal(c, r)) return { c, r }

  // Nothing on the list is legal — an odd board, a resumed run. Take a legal
  // cell anywhere on the foundation's span rather than point at a cell the
  // player cannot build on, still preferring one that fuses.
  const span: Array<[number, number]> = []
  for (let r = 0; r < 6; r++) {
    const half = halfWidthAt(r)
    for (let c = -half; c <= half; c++) if (legal(c, r)) span.push([c, r])
  }
  const [c, r] = span.find(([cc, rr]) => tutorialMergesAt(cc, rr)) ?? span[0] ?? [-2, 0]
  return { c, r }
})

/**
 * Put the cannon in the player's hand.
 *
 * The hand is dealt at random, and a tutorial that has to say "tap whichever of
 * these five happens to be a weapon" is not the tutorial being built here. So
 * the weapon slot is overwritten with the piece the beats are drawn around —
 * on a fresh run and on a resumed one, since the snapshot restores whatever was
 * dealt before the reload.
 *
 * Not reinforced: the gold sweep a reinforced tile carries is a second thing to
 * look at on the one screen that must have exactly one.
 */
const armTutorialHand = (): void => {
  if (tutorialDone.value) return
  if (offers.value[TUTORIAL_SLOT] === TUTORIAL_SHAPE) return
  const next = offers.value.slice()
  next[TUTORIAL_SLOT] = TUTORIAL_SHAPE
  offers.value = next
  if (offerEnhanced.value[TUTORIAL_SLOT]) {
    const flags = offerEnhanced.value.slice()
    flags[TUTORIAL_SLOT] = false
    offerEnhanced.value = flags
  }
}

// ─── The tutorial holds the opening countdown ───────────────────────────────
//
// Wave 1 lands three seconds after the player's first gesture, and those three
// seconds are meant to be THEIRS. While the tutorial has the floor they are
// not: every beat waits on an action only the player can take. Its last beat is
// the Call Wave button, so a countdown running underneath would fire the wave
// out from under the tutorial and leave the player on a step whose button is no
// longer on screen — a tutorial that can never be finished, and so is never
// recorded as done.
//
// The hold lifts the moment the tutorial ends, which now has exactly one route:
// the player performed all three actions.
//
// `immediate`, and it has to be: the first beat is live on the very first
// evaluation now that nothing has to be accepted first, so a watcher that only
// fires on a CHANGE would never see the tutorial open — it would only ever see
// it close, and the countdown would run underneath the whole thing.
watch(
  () => tutorialStep.value !== null,
  (held) => { buildClockHeld.value = held },
  { immediate: true }
)

/** Persist it. The only caller is the last beat completing. */
const finishTutorial = (): void => {
  tutorialDone.value = true
  setState(TUTORIAL_KEY, true)
}

/**
 * The weld the player just made, or null if they made none.
 *
 * Read live off the tower rather than remembered from the placement, and by
 * UID rather than by cell, so a two-cell block is one answer instead of two.
 * The deepest weld wins, which on this beat is the only one there is — but it
 * keeps the coach mark pointing at the biggest thing on the board if a resumed
 * run ever reaches here with more.
 */
const mergedBlock = (): Block | null => {
  let best: Block | null = null
  for (const b of getTowerBlocks().values()) {
    if (tierOf(b.tier) <= 1) continue
    if (!best || tierOf(b.tier) > tierOf(best.tier)) best = b
  }
  return best
}

const advanceTutorial = (): void => {
  tutorialIndex.value++
  // Step over the whole merge arc when there is no weld to talk about — that
  // player is taught less, not stranded, which is the same rule `tutorialCell`
  // follows when no fusing cell is legal. A loop rather than one `if` because
  // the three beats are consecutive and skipping only the first would land the
  // player on a coach mark pointing at a block that does not exist.
  while (
    tutorialIndex.value < TUTORIAL_STEPS.length
    && MERGE_BEATS.has(TUTORIAL_STEPS[tutorialIndex.value]!)
    && !mergedBlock()
  ) {
    tutorialIndex.value++
  }
  if (tutorialIndex.value >= TUTORIAL_STEPS.length) finishTutorial()
}

/** Advance when the player performs the step's action. It is the only way. */
const completeTutorialStep = (step: TutorialStep): void => {
  if (tutorialStep.value !== step) return
  advanceTutorial()
}

/**
 * Measure whatever the current beat is pointing at.
 *
 * Polled rather than observed: the targets are a canvas cell, one tray tile and
 * a HUD button that all move as the layout settles, and three ResizeObservers
 * plus a canvas-to-screen projection is a lot of machinery for three beats that
 * only ever run once.
 *
 * A null here is load-bearing. The overlay renders nothing without a rect, so a
 * target that is missing or not laid out yet leaves the player in a normal,
 * fully playable game rather than under a dim layer with no hole in it — which,
 * with no Skip button anywhere, would be unescapable.
 */
const measureTutorialTarget = (): void => {
  const step = tutorialStep.value
  if (!step) { tutorialRect.value = null; return }

  const fromEl = (sel: string): { x: number; y: number; w: number; h: number } | null => {
    const el = document.querySelector(sel)
    if (!el) return null
    const b = el.getBoundingClientRect()
    if (b.width <= 0 || b.height <= 0) return null
    return { x: b.x, y: b.y, w: b.width, h: b.height }
  }

  // ONE tile, not the whole tray: the player is being told to take this piece,
  // and a hole over five offers is a menu, which is a decision, which is the
  // thing this beat is designed not to ask for.
  if (step === 'pick') {
    tutorialRect.value = fromEl(`.build-tray__slot[data-slot="${TUTORIAL_SLOT}"]`)
    return
  }
  if (step === 'call') { tutorialRect.value = fromEl('.call-wave__btn'); return }

  // The pictogram beat owns the whole screen through `MergeGuide`, and the
  // power demo after it through `MergePowerDemo`. A coach mark underneath
  // either would cut a hole in a card that has nothing behind it worth
  // reaching, so these steps deliberately measure nothing and the overlay's
  // no-hole rule renders them away.
  if (step === 'mergeGuide' || step === 'mergePower') { tutorialRect.value = null; return }

  // The weld itself, projected from world space — the hole has to cover BOTH
  // its cells or the arrow points at a block whose left half is the only live
  // pixel on the screen, and a player who taps the other half is tapping a dim
  // layer that does nothing.
  if (step === 'inspectMerged') {
    const b = mergedBlock()
    if (!b) { tutorialRect.value = null; return }
    const x = worldToScreenX(b.c - 0.5)
    const y = worldToScreenY(b.r + spanH(b))
    tutorialRect.value = {
      x,
      y,
      w: worldToScreenX(b.c + spanW(b) - 0.5) - x,
      h: worldToScreenY(b.r) - y
    }
    return
  }

  // The rank button inside the inspector the previous beat just opened. A null
  // here — the panel not laid out yet on the frame the beat flips — leaves the
  // player in a normal game for a frame rather than under a holeless dim.
  if (step === 'rankUp') { tutorialRect.value = fromEl('.inspector__upgrade'); return }

  // A beat that cannot be performed must not be forced. The cannon is 25 wood
  // and 10 stone against a 120/40 opening purse, so this is only reachable by a
  // resumed run that spent itself down while the overlay had nothing to point
  // at — but there is no Skip button to rescue anyone from it, so it is
  // answered with the same null the missing-target path uses: no rect, no dim,
  // normal game.
  if (!canAffordShape(TUTORIAL_SHAPE)) { tutorialRect.value = null; return }

  // `place` points at the battlefield, which lives on the canvas — so the rect
  // is projected from world space rather than read from the DOM. Exactly one
  // cell wide: the hole is the only place a tap survives the dim layer, so its
  // size IS the placement's tolerance.
  const cell = getZoom()
  const { c, r } = tutorialCell.value
  tutorialRect.value = {
    x: worldToScreenX(c - 0.5),
    y: worldToScreenY(r + 0.5) - cell / 2,
    w: cell,
    h: cell
  }
}

/** Bumped by the poll below so the screen-space positions recompute. */
const tutorialTick = ref(0)
let tutorialTimer = 0

// NOT `immediate`. `tutorialStep` reads `showResult`, which is declared further
// down — an immediate watcher evaluates the computed during setup and dies in
// the temporal dead zone. The first measurement happens on mount instead, by
// which time every ref exists and the layout is real.
watch(tutorialStep, (step) => {
  // Re-armed on the beat rather than only at boot: a tech unlock rerolls two
  // slots mid-run, and the hand has to still hold the piece the arrow is
  // pointing at.
  if (step === 'pick') armTutorialHand()

  // Keep the hand empty for the whole merge arc.
  //
  // `tryPlace` already disarms on the taught placement, which is what stops the
  // rerolled ghost landing on top of the block that was just placed. This is
  // the backstop for every other way a slot can end up armed while these beats
  // are live — a tech unlock rerolling the hand, a resumed run, a stray tap
  // before the dim layer went up. It matters most on `inspectMerged`: with a
  // piece in hand a tap on the battlefield BUILDS, so the player told to tap
  // their new weld would drop a crate on it instead and the beat could never be
  // completed.
  if (step === 'mergeGuide' || step === 'mergePower' || step === 'inspectMerged') selectedSlot.value = null

  // The tutorial buys the rank it is about to teach — see `seedTutorialRankGold`
  // for why the first run cannot afford its own lesson. A zero back means there
  // is nothing to rank after all (no weld, or somehow already maxed), and the
  // beat retires rather than pointing at a button that can never light up.
  if (step === 'rankUp') {
    const b = mergedBlock()
    if (!b || seedTutorialRankGold(b.c, b.r) <= 0) {
      completeTutorialStep('rankUp')
      return
    }
  }

  measureTutorialTarget()
})

// The wave starting by any other route retires the beat that asks for it. A
// coach mark aimed at a button the battle has just replaced with the speed
// switch can never be completed, and an unfinished tutorial is never recorded
// as done — so the player would meet it again next session.
watch(phase, (p) => { if (p !== 'build') completeTutorialStep('call') })

// ─── The merge pictogram ────────────────────────────────────────────────────

/** Open exactly while its beat is live — the tutorial index IS the state, so
 *  the card cannot get out of step with the sequence around it. `forcedMerge`
 *  is the replay hatch (see `Tutorial replay`), kept as a separate OR rather
 *  than by rewinding the index, so a replay on wave 9 cannot resurrect the
 *  coach marks around it. */
const forcedMerge = ref(false)
const showMergeGuide = computed(() => forcedMerge.value || tutorialStep.value === 'mergeGuide')

/**
 * Remembered separately from `TUTORIAL_KEY`.
 *
 * The beat is conditional, so "finished the tutorial" and "was shown the merge
 * ladder" are different facts about a save, and a player who was stepped over
 * because their first cannon found no partner should still meet the card the
 * first time something on their board actually fuses. Folding it into the
 * tutorial flag loses that player the explanation permanently.
 */
const onMergeGuideContinue = (): void => {
  if (forcedMerge.value) { forcedMerge.value = false; return }
  setState(MERGE_GUIDE_KEY, true)
  completeTutorialStep('mergeGuide')
}

// ─── The merge power demo ───────────────────────────────────────────────────
//
// Straight after the ladder, and on the same terms: a beat of the tutorial, so
// the build countdown stays held while it plays (`buildClockHeld`), and part of
// the merge arc, so a first run that fused nothing never sees it.

const forcedPower = ref(false)
const showMergePower = computed(() => forcedPower.value || tutorialStep.value === 'mergePower')

const onMergePowerContinue = (): void => {
  if (forcedPower.value) { forcedPower.value = false; return }
  completeTutorialStep('mergePower')
}

// ─── The collapse-trap demonstration ────────────────────────────────────────
//
// Shown once, after the player's FIRST death, in the gap the defeat screen was
// about to fill.
//
// Dropping a wall on a monster is the best thing in this game and almost nobody
// finds it: the support rule is invisible until you break it on purpose, and
// nothing in the build loop suggests selling a block you just paid for. So it
// is demonstrated rather than hinted — a canned animation of a cursor selling
// the one pillar under a long arm, and the arm burying what was standing under
// it.
//
// The moment is chosen, not convenient. A player who has just lost is asking
// "what could I have done differently", which is the one second in a session
// where a trick is welcome rather than an interruption.

const trapSeen = ref(getState<boolean>(TRAP_TUTORIAL_KEY, false) === true)
const showTrap = ref(false)
/** Resolves `presentDefeat`'s await. Held so the result screen cannot appear
 *  underneath the demo, and so an unmount can never strand the promise. */
let trapResolve: (() => void) | null = null

const runTrapTutorial = (): Promise<void> => {
  if (trapSeen.value) return Promise.resolve()
  showTrap.value = true
  return new Promise<void>((resolve) => { trapResolve = resolve })
}

const onTrapContinue = (): void => {
  showTrap.value = false
  trapSeen.value = true
  setState(TRAP_TUTORIAL_KEY, true)
  trapResolve?.()
  trapResolve = null
}

// ─── Repair all ─────────────────────────────────────────────────────────────
//
// The per-block patch lives in the inspector, which means repairing a battered
// tower is one selection and one press PER BLOCK — a dozen interactions in the
// fifteen seconds before the next wave, on the exact turn the player is also
// trying to decide what to build. This is the same spend as one button.
//
// It appears only with TWO or more wounds on the board, because with one the
// inspector already answers it and a second control saying the same thing is
// noise.

const repairPlan = computed(() => {
  void towerVersion.value
  void waveVersion.value
  void phase.value
  void runCoins.value
  return repairAllPlan()
})

const showRepairAll = computed(() =>
  phase.value === 'build' && !showResult.value && repairPlan.value.damaged >= 2
)

const repairAllReady = computed(() => {
  void towerVersion.value
  void runCoins.value
  void phase.value
  return canRepairAll()
})

const onRepairAll = (): void => {
  if (!repairAll()) {
    playSound('obstacle-hit', 0.03)
    return
  }
  playSound('level-up', 0.05)
}

// ─── Tutorial replay ────────────────────────────────────────────────────────
//
// Both new beats fire ONCE per save, on moments that cannot be re-entered: the
// pictogram on the first fusion of a first run, the trap demo on the first
// death ever. Testing either meant wiping the save and replaying the opening,
// which is how a teaching screen ships with its layout broken on a phone —
// nobody looks at it twice.
//
// So there is one hatch, and it only ever replays teaching UI: no resources, no
// wave jumps, nothing that changes a run. It is reachable from a URL in EVERY
// build on purpose — these screens break on the real device and the real
// portal shell, which is exactly where a dev-only switch cannot reach.
//
//   ?tut=merge   the merge ladder, now
//   ?tut=power   the merge power demo, now
//   ?tut=trap    the collapse demo, now
//   ?tut=reset   forget all of it, so the next run teaches it again
//
// The keyboard shortcuts (Shift+M / Shift+T / Shift+N) are DEV only — a stray
// modifier chord in a shipped build is a bug report nobody can reproduce.

const replayTutorial = (what: TutorialCheat): void => {
  if (what === 'merge') { forcedMerge.value = true; return }
  if (what === 'power') { forcedPower.value = true; return }
  if (what === 'trap') { showTrap.value = true; return }
  setState(MERGE_GUIDE_KEY, false)
  setState(TRAP_TUTORIAL_KEY, false)
  setState(TUTORIAL_KEY, false)
  trapSeen.value = false
  tutorialDone.value = false
  tutorialIndex.value = 0
  armTutorialHand()
}

// ─── Early-call bonus preview ───────────────────────────────────────────────

const callBonusPct = computed(() =>
  phase.value === 'build' ? Math.round((earlyCallBonus(buildTimeLeft.value) - 1) * 100) : 0
)

const onCallWave = (): void => {
  markHintDone('callWave')
  completeTutorialStep('call')
  selectedSlot.value = null
  callWave()
}

/**
 * Push the live run totals into the daily missions.
 *
 * `recordRun` credits deltas, so calling this often is free and calling it
 * twice for the same state is a no-op — which is what lets it run on a wave
 * clear, on the panel opening, and at the end of the run without any of them
 * having to know about the others.
 */
const feedMissions = (): void => {
  const s = runSummary()
  recordRun({
    waves: s.wavesCleared,
    kills: s.kills,
    coins: s.coinsEarned,
    height: s.height,
    blocks: s.blocksPlaced
  })
}

/**
 * Sell the block the inspector is open on.
 *
 * The inspector closes either way: after a sale the block is gone, and if the
 * sale was refused (the Gate cannot be sold) leaving the panel open on a button
 * that does nothing is worse than closing it.
 */
const onSellInspected = (): void => {
  const b = inspected.value
  inspected.value = null
  if (!b) return
  if (!sellBlock(b.c, b.r)) {
    playSound('obstacle-hit', 0.03)
    return
  }
  playSound('coin-pickup', 0.05)
}

/**
 * Buy one rank on the inspected block with run gold.
 *
 * The panel stays OPEN, unlike a sale: the whole point of the button is to show
 * the numbers on the card move, and closing over the moment they change would
 * throw away the only feedback the purchase has.
 */
const onUpgradeInspected = (): void => {
  const b = inspected.value
  if (!b) return
  if (!upgradeBlock(b.c, b.r)) {
    playSound('obstacle-hit', 0.03)
    return
  }
  completeTutorialStep('rankUp')
  playSound('level-up', 0.05)
}

/** Convert a standing wall into a spiked one. */
/**
 * Patch the inspected block back to full for run gold.
 *
 * Cheap, instant and on a per-block lockout — the answer to "this wall dies to
 * the next hit and I have ten seconds", which upgrading (priced as a permanent
 * rank) and the Repair Bay (a whole cell, and only between waves) both refuse
 * to be.
 */
const onRepairInspected = (): void => {
  const b = inspected.value
  if (!b) return
  if (!repairBlock(b.c, b.r)) {
    playSound('obstacle-hit', 0.03)
    return
  }
  playSound('level-up', 0.045)
}

const onFortifyInspected = (): void => {
  const b = inspected.value
  if (!b) return
  if (!fortifyBlock(b.c, b.r)) {
    playSound('obstacle-hit', 0.03)
    return
  }
  playSound('barricade', 0.05)
}

/**
 * "3× coins" — triple the wave payout for a rewarded video.
 *
 * The wave's base payout has already been banked by `completeWave`, so this
 * grants the remaining 2× rather than the full amount. The figure is captured
 * BEFORE the ad plays: the next wave can complete while a video is on screen,
 * and paying out against whatever `lastWaveReward` had become by then would
 * either short-change the player or quietly overpay them.
 */
const onTripleWave = async (): Promise<void> => {
  const base = lastWaveReward.value?.coins ?? 0
  if (base <= 0 || adInFlight.value) return
  await claimReward(() => {
    addCoins(base * 2)
    playSound('level-up', 0.07)
    const el = coinBadgeEl.value
    if (el) spawnCoinExplosion({ sourceEl: el, targetEl: el, count: 24 })
  })
}

/**
 * Buy fast-forward with a rewarded video.
 *
 * Five minutes, not one wave: a per-wave charge would have the player watching
 * an ad every ninety seconds, which is the kind of pacing portals reject. It
 * also extends rather than replaces, so a second video mid-buff never costs the
 * player time they already paid for.
 *
 * `target` is the rung they tapped. One purchase unlocks the whole ladder, so
 * the video is charged once and the player lands where they pressed rather
 * than always at 2x.
 */
const onBuySpeed = async (target: number): Promise<void> => {
  if (adInFlight.value) return
  await claimReward(() => {
    grantSpeedBuff(target)
    playSound('level-up', 0.07)
  })
}

/** Move to a rung that is already paid for. */
const onSetSpeed = (n: number): void => {
  if (!setGameSpeed(n)) return
  playSound('barricade', 0.03)
}

// ─── Reinforced hand (rewarded) ─────────────────────────────────────────────

/**
 * Swap the whole hand for four reinforced shapes.
 *
 * Offered during the build phase only — mid-battle it would be a "pay to undo
 * a bad wave" button, which is exactly the pattern portals reject.
 */
const onEnhancedHand = async (): Promise<void> => {
  if (adInFlight.value) return
  // The wallet price where no video plays is charged by `claimReward` itself,
  // at the same rate as every other perk — see `REWARD_COIN_COST`. It used to
  // be a bespoke 20 run-coins here, which meant this one button was priced in a
  // different currency from the rest and had to be kept in sync by hand.
  await claimReward(() => {
    dealEnhancedOffers()
    selectedSlot.value = null
    playSound('level-up', 0.07)
  })
}

// ─── Flying chest and gift pieces ───────────────────────────────────────────
//
// A chest once a wave, from the moment the tutorial ends; tapping it queues a
// free welded piece, which waits in the gift tile over the hand (see
// `useGifts`). Both are self-contained — this scene only says when they may
// run, and puts down whatever it was holding when a gift is picked up.

const chestReady = computed(() => tutorialOver.value && !showResult.value && phase.value !== 'defeat')
const chestPaused = computed(() =>
  showResult.value || showMergeGuide.value || showMergePower.value || showTrap.value
)
const giftDisabled = computed(() =>
  showResult.value || phase.value === 'defeat' || tutorialStep.value !== null
)

const onGiftArmed = (): void => {
  selectedSlot.value = null
  inspected.value = null
  arrowRainArmed.value = false
}

/**
 * One grace continue per run: rebuild the tower exactly as it stood and go back
 * into the build phase for the wave that beat them.
 *
 * Restores from the same snapshot the resume-after-reload path uses, so it is
 * the real layout and the real resources rather than an approximation. The
 * result screen is dismissed only if the restore actually succeeded.
 */
const onContinueRun = async (): Promise<void> => {
  if (adInFlight.value || !graceAvailable.value) return
  await claimReward(() => {
    if (!continueRun()) return
    showResult.value = false
    selectedSlot.value = null
    inspected.value = null
    resetVfx()
    resetDrawnFx()
    playSound('level-up', 0.07)
  })
}

/**
 * Show the game's premise over the opening frame.
 *
 * `bestWave` is the whole audience test: a player who has survived a wave has
 * been told what this game is by playing it, and telling them again is noise.
 * `awaitingFirstInteraction` is the dismissal — the same edge that starts the
 * opening wave's countdown and opens the portal's gameplay bracket, so the
 * banner is on screen for exactly as long as the game is waiting for them.
 */
const showIncoming = computed(() => bestWave.value === 0 && awaitingFirstInteraction.value)

const enhancedHandOffered = computed(() =>
  phase.value === 'build' && !offerEnhanced.value.some(Boolean)
)

// ─── Arrow Rain ─────────────────────────────────────────────────────────────
//
// The one attack the player aims themselves, so unlike every other button on
// the HUD it does not fire on the tap — it ARMS, and the next tap on the
// battlefield decides where the volley lands. A skill that hit the moment it
// was pressed would have to guess, and the whole reason it exists is to let the
// player answer something their turrets cannot reach.

const onArrowRain = (): void => {
  if (!arrowRainReady.value) {
    playSound('obstacle-hit', 0.03)
    return
  }
  // Arming is a mode, and two modes at once is how a player ends up placing a
  // wall where they meant to call a volley.
  arrowRainArmed.value = !arrowRainArmed.value
  if (arrowRainArmed.value) {
    selectedSlot.value = null
    inspected.value = null
    // Touch has no hover, so without a seed the band would not appear until
    // the tap that already fired it. Over the Gate is the honest default.
    hoverCell.value = { c: 0, r: 0 }
  }
  playFx('uiTap')
}

const fireArrowRain = (x: number): void => {
  arrowRainArmed.value = false
  if (!callArrowRain(x)) {
    playSound('obstacle-hit', 0.03)
    return
  }
  playSound('barricade', 0.06)
}

// The skill going on cooldown under them must not leave the player holding a
// targeting cursor that no longer does anything.
watch([arrowRainReady, phase], () => {
  if (!arrowRainReady.value || phase.value === 'defeat') arrowRainArmed.value = false
})

// ─── Cavalry ────────────────────────────────────────────────────────────────

/**
 * What a sortie costs right now.
 *
 * Zero while the field holds an engine no gun on the tower can reach and no
 * rider is already out — see `isCavalryFree`. Charging for the only move left
 * on the board is what turns "I was outplayed" into "the game took my coins and
 * killed me anyway", and it is the moment players quit.
 */
const cavalryPrice = computed(() => (isCavalryFree.value ? 0 : cavalryCost()))
const canAffordCavalry = computed(() => coins.value >= cavalryPrice.value)

const onCavalry = (): void => {
  if (!canAffordCavalry.value) {
    playSound('obstacle-hit', 0.03)
    return
  }
  // A free sortie must not touch the purse at all — `spendCoins(0)` is a no-op
  // on every economy that guards against it, but going through the wallet for
  // something priced at nothing invites exactly the rounding bug that would
  // charge the player for the mercy.
  if (cavalryPrice.value > 0 && !spendCoins(cavalryPrice.value)) return
  summonCavalry()
  playSound('barricade', 0.05)
}

// ─── Out of reach ───────────────────────────────────────────────────────────
//
// The rage-quit this whole block exists to remove: a trebuchet parks at twelve
// cells, every gun on the tower fires at nothing, and the player has no way to
// know why or what to do about it. Three answers, in the order the player meets
// them — a warning before the wave, a free sortie during it, and a paid reach
// extension for anyone who would rather not ride out.

/** Reach the tower can currently manage, in cells. */
const towerReach = computed(() => {
  void towerVersion.value
  void effectiveRangeMul.value
  return bestWeaponReach()
})

/** Engines in the NEXT wave that would park beyond every gun the tower has. */
const outrangedNext = computed(() => {
  if (phase.value !== 'build') return { n: 0, need: 0 }
  void towerVersion.value
  void waveVersion.value
  void effectiveRangeMul.value
  const plan = previewNextWave()
  return { n: countOutranged(plan, towerReach.value), need: Math.ceil(deepestStandoff(plan)) }
})

/** True while the player has no answer on the field but cavalry. */
const outOfReachNow = computed(() => phase.value === 'battle' && unreachableSiege.value > 0)

/**
 * Reach extension, bought with a rewarded video.
 *
 * Offered ONLY while something is actually out of reach — before the wave when
 * the plan says so, during it when the battlefield does. A permanent button
 * would be a range upgrade sold outside the tech tree; this one is an answer to
 * a specific machine, on the wave that machine arrives.
 */
const rangeBoostOffered = computed(() =>
  !isRangeBuffed.value && (outOfReachNow.value || outrangedNext.value.n > 0)
)

const rangeBoostPct = Math.round((RANGE_BUFF_MUL - 1) * 100)

const onRangeBoost = async (): Promise<void> => {
  if (adInFlight.value) return
  await claimReward(() => {
    grantRangeBuff()
    playSound('level-up', 0.07)
  })
}

/**
 * How much siege is actually on the field — the cavalry button's whole reason
 * to exist.
 *
 * Read from the director's own plan (`wavePlan`), NOT re-planned here. The old
 * code called `planWave(wave.value)` with the default difficulty scalar, so on
 * most waves past 14 the HUD and the battlefield disagreed — the cavalry button
 * stayed hidden while a ram was already chewing the wall.
 *
 * Counts only siege. This used to be one `threats` object counting air, sea and
 * bombers alongside it, of which nothing ever read anything but `.siege` — and
 * its bomber count called a `countBombers` that was never imported, so the
 * whole computed threw on every evaluation. That took `cavalryOffered` down
 * with it and left the button dead for the entire battle phase. The warning
 * chips below do the air/sea/blast counting, and they do it for the NEXT wave,
 * which is the only point at which a warning is worth anything.
 */
const siegeIncoming = computed(() => {
  void waveVersion.value
  return countSiege(wavePlan())
})

const cavalryOffered = computed(() => phase.value === 'battle' && siegeIncoming.value > 0)

/**
 * The build-phase chip row.
 *
 * It used to carry a chip per incoming lane — air, sea, bombers, siege, and a
 * sixth for siege parked past every gun. They were accurate and nobody used
 * them: five chips that all say "brace" are wallpaper by wave three, and the
 * wave itself arrives four seconds later and says the same thing louder. Their
 * counters stay in `waves.ts`, and `outrangedNext` still drives the reach
 * warning on the Mortar — that was the one lane cue that told the player to
 * SPEND rather than to worry.
 *
 * What is left is the hoard surcharge, which is not a description of the next
 * wave at all. It is a price on THIS build phase, it is the one number the
 * player can act on right now, and it is shown as the percentage added because
 * that is what the wave is actually multiplied by.
 *
 * Only while the wave is being ASSEMBLED (build phase) — once the shooting has
 * started the enemies themselves are the warning.
 */
const waveWarnings = computed<{ id: string; n: number; m?: number }[]>(() => {
  if (phase.value !== 'build') return []
  void towerVersion.value
  void waveVersion.value
  void wood.value
  void stone.value
  void runCoins.value
  const hoard = currentHoardTier()
  return [
    { id: 'hoard', n: hoard === 3 ? 100 : hoard === 2 ? 50 : hoard === 1 ? 25 : 0 }
  ].filter((w) => w.n > 0)
})

// ─── Manual reroll ──────────────────────────────────────────────────────────

/**
 * Trade one offered shape for a new draw.
 *
 * Without this a run could deadlock into four unaffordable or useless offers;
 * the five-second per-slot cooldown is what stops it becoming a free "reroll
 * until perfect" without punishing the rest of the hand for one bad piece.
 */
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

// ─── Tech spotlight (one-shot) ──────────────────────────────────────────────

const techSpotlightSeen = ref(getState<boolean>(TECH_SPOTLIGHT_KEY, false) === true)
const showTechSpotlight = computed(() =>
  !techSpotlightSeen.value && progress.affordableCount.value > 0 && !showResult.value
)
const openTech = (): void => {
  showTech.value = true
  if (!techSpotlightSeen.value) {
    techSpotlightSeen.value = true
    setState(TECH_SPOTLIGHT_KEY, true)
  }
}

// ─── Keyboard ───────────────────────────────────────────────────────────────

const onKey = (e: KeyboardEvent): void => {
  const tgt = e.target
  if (tgt instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(tgt.tagName)) return

  if (e.code === 'Escape') {
    selectedSlot.value = null
    inspected.value = null
    arrowRainArmed.value = false
    return
  }
  if (e.repeat) return

  // Tutorial replay chords. DEV only — folded out of every shipped bundle by
  // the `import.meta.env.DEV` literal, so a portal build has no chord at all.
  if (import.meta.env.DEV && e.shiftKey) {
    if (e.code === 'KeyM') { e.preventDefault(); replayTutorial('merge'); return }
    if (e.code === 'KeyP') { e.preventDefault(); replayTutorial('power'); return }
    if (e.code === 'KeyT') { e.preventDefault(); replayTutorial('trap'); return }
    if (e.code === 'KeyN') { e.preventDefault(); replayTutorial('reset'); return }
  }

  if ((e.code === 'Space' || e.code === 'Enter') && phase.value === 'build' && !showResult.value) {
    e.preventDefault()
    onCallWave()
    return
  }
  if (e.code === 'KeyF' && phase.value === 'battle') {
    toggleSpeed()
    return
  }

  // ── Turning the armed piece ──
  //
  // Read as a dial rather than as a direction pad: anything pointing left or
  // down turns it anticlockwise, anything pointing right or up turns it
  // clockwise. That way WASD, the arrow keys and Q/E all agree with each other
  // instead of each meaning something slightly different, and a player who
  // reaches for whichever one their hand is already on gets the turn they
  // expected. Q and E are the pair the on-screen buttons advertise.
  if (canRotate.value) {
    if (ROTATE_LEFT_KEYS.has(e.code)) { e.preventDefault(); rotateBy(-1); return }
    if (ROTATE_RIGHT_KEYS.has(e.code)) { e.preventDefault(); rotateBy(1); return }
  }
  // 1-4 arm the matching offer slot — the desktop speed-build path.
  const digit = Number(e.key)
  if (Number.isInteger(digit) && digit >= 1 && digit <= OFFER_SLOTS) {
    onSelectSlot(digit - 1)
  }
}

// ─── CrazyGames gameplay lifecycle ──────────────────────────────────────────
//
// The scene only reports whether play is live; `useCrazyGames` decides which
// events that turns into, because WHICH events to send is a platform contract
// and not a view concern (and was untestable while it lived here).
const isLiveGameplay = computed(
  () => phase.value !== 'defeat'
    && !showResult.value
    && !isAnyModalOpen.value
    && !isAdShowing.value
)
watch(isLiveGameplay, syncGameplayLifecycle, { immediate: true })

// ─── Boot ───────────────────────────────────────────────────────────────────

let booting = false

/**
 * Enter the game.
 *
 * A persisted `ts_run` snapshot is RESUMED rather than discarded — a player who
 * reloads mid-siege (or opens the game on another device after a cloud sync)
 * gets their tower back. This is also the visible half of the hydration
 * guarantee: had the cloud read silently failed, the player would land on an
 * empty foundation, which is exactly the "treated as a fresh user" bug the save
 * layer's boot-sanity guard exists to prevent.
 */
const boot = async (): Promise<void> => {
  if (booting) return
  booting = true
  try {
    // Moderation-mandated first-play interstitial on the networks that require
    // it; a no-op fast path everywhere else.
    await playFirstStartInterstitial()
    if (!resumeRun()) {
      beginRun()
      progress.recordRunStart()
    }
    // A resumed run deals from its snapshot, which was written before the
    // tutorial existed for this player — arm the hand either way.
    armTutorialHand()
    beginMissionRun()
    await nextTick()
    resize()
    snapToFit()
    startBattleMusic()
    // Loading is genuinely finished here: the run is resumed or started, the
    // canvas is sized, and the first frame is about to draw.
    signalGameplayLoaded()

    // `?tut=` is applied AFTER the run exists: `reset` re-arms the tutorial
    // hand, and a card opened before there is a board behind it has nothing to
    // return the player to.
    const cheat = readTutorialCheat()
    if (cheat) replayTutorial(cheat)
  } finally {
    booting = false
  }
}

const fireCoinExplosion = (sourceEl: HTMLElement): void => {
  if (coinBadgeEl.value) spawnCoinExplosion({ sourceEl, targetEl: coinBadgeEl.value })
}

const onOrientationChange = (): void => { setTimeout(resize, 250) }

let insetTimer = 0

onMounted(() => {
  void boot()
  installFullscreenWatch()
  // Re-read after boot: on a platform build the cloud save may not have landed
  // when `useTechDiscovery` first read it, and a returning player must not be
  // told about a screen they already use.
  refreshTechFound()
  window.addEventListener('resize', resize)
  window.addEventListener('orientationchange', onOrientationChange)
  window.addEventListener('keydown', onKey)
  rafId = requestAnimationFrame(loop)

  // Warm the audio synthesis path on an idle slot, so it does not compete with
  // the first frame. Drop-in art is no longer probed from here: `artPreload`
  // stages it, and this used to fire a probe per enemy TYPE at the still path
  // nothing ships to — twenty-one guaranteed 404s on every start.
  const idle = (window as any).requestIdleCallback as ((cb: () => void, o?: any) => number) | undefined
  const warm = (): void => {
    warmAudio()
  }
  if (typeof idle === 'function') idle(warm, { timeout: 2500 })
  else setTimeout(warm, 400)

  // The HUD's height changes as its content does (a wrapped title, a tray that
  // gains a row). Re-measuring on a 1 s cadence is two `getBoundingClientRect`
  // reads — cheaper and far more robust than observing a dozen elements.
  insetTimer = window.setInterval(() => {
    if (cssW === 0) return
    const insets = measureInsets()
    hudInset.value = insets
    setViewport(cssW, cssH, insets.top, insets.bottom)
  }, 1000)

  // The toast grows a whole button when the triple-coins offer is on it, and
  // its clamp is measured off the bottom edge — so the height has to be real.
  if (toastRef.value && typeof ResizeObserver !== 'undefined') {
    toastRo = new ResizeObserver(([entry]) => {
      toastH.value = entry?.contentRect.height ?? 0
    })
    toastRo.observe(toastRef.value)
  }

  // The tutorial's spotlight tracks a camera that is still easing into place,
  // so it re-measures on a short cadence while it is up — and not at all once
  // it is finished, which for all but the first run is immediately.
  measureTutorialTarget()
  // The spotlight is positioned in screen space from a camera that is still
  // easing, so it re-measures on a short cadence — and not at all once the
  // tutorial is done, which for every run after the first is immediately.
  tutorialTimer = window.setInterval(() => {
    if (tutorialDone.value) return
    tutorialTick.value++
    if (tutorialStep.value) measureTutorialTarget()
  }, 250)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  // The defeat flow is parked on this promise. Leaving it unresolved keeps
  // `presentDefeat` alive on a scene that no longer exists, and the result
  // screen it was about to show never gets its turn.
  trapResolve?.()
  trapResolve = null
  window.removeEventListener('resize', resize)
  window.removeEventListener('orientationchange', onOrientationChange)
  window.removeEventListener('keydown', onKey)
  clearInterval(insetTimer)
  clearInterval(tutorialTimer)
  toastRo?.disconnect()
  toastRo = null
  clearLongPress()
  stopBattleMusic()
  // Releases the scene callback as well as stopping the sampler — without it a
  // tier change after unmount would call `resize` on a dead canvas ref.
  stopAdaptiveQuality()
  // Module-level state: a scene that unmounts mid-tutorial must not leave the
  // next one with a frozen build clock.
  buildClockHeld.value = false
  // A tab close mid-build must never cost the player their tower.
  saveRunSnapshot()
})
</script>

<template lang="pug">
  div.scene
    canvas.scene__canvas(
      ref="canvasRef"
      :style="shakeStyle"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel.prevent="onWheel"
      @contextmenu.prevent
    )

    //- ── HUD overlay ───────────────────────────────────────────────────────
    //- Non-interactive by default; individual controls opt back in.
    div.scene__hud
      //- The flying chest crosses the sky once a wave. First in the HUD, so
      //- every panel and button after it paints over it rather than under.
      FlyingChest(
        :tutorial-done="tutorialOver"
        :ready="chestReady"
        :paused="chestPaused"
        :wave="wave"
        :phase="phase"
      )
      //- The game's premise, said once, in the biggest type on the screen.
      //- First-time players only, and gone on their first touch — see
      //- `showIncoming`.
      Transition(name="fade")
        IncomingBanner(v-if="showIncoming")
      //- Top bar: wave status (left), resources (centre), wallet (right).
      div.scene__top(ref="topBarRef")
        WaveHud(
          :wave="wave"
          :enemies-left="enemiesLeft"
          :enemies-total="enemiesTotal"
          :gate-hp-pct="gateHpPct"
          :phase="phase"
          :best-wave="bestWave"
        )
        ResourceBar(:wood="wood" :stone="stone" :coins="runCoins")
        div.scene__wallet
          CoinBadge(ref="coinBadgeRef")
          TreasureChest(:target-el="coinBadgeEl")

      //- Wave-clear payout toast, pinned to the shoreline rather than to the
      //- top bar — anywhere higher and it sits over the tower the player is
      //- trying to look at while deciding what to build next.
      div.scene__toast(ref="toastRef" :style="{ top: toastTop + 'px' }")
        WaveClearToast(
          :reward="toastHeld ? null : lastWaveReward"
          @triple="onTripleWave"
        )

      //- Control primer.
      div.scene__hint
        ControlHint(:hint="activeHint")

      //- Recenter appears only while the player has panned away.
      Transition(name="fade")
        button.scene__recenter(
          v-if="isManual"
          type="button"
          :aria-label="t('hud.recenter')"
          @click="recenter"
        )
          svg(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round")
            path(d="M12 3v3M12 18v3M3 12h3M18 12h3")
            circle(cx="12" cy="12" r="4")

      //- Block inspector (bottom-left, above the meta row).
      div.scene__inspector
        BlockInspector(
          :block="inspected"
          @sell="onSellInspected"
          @upgrade="onUpgradeInspected"
          @fortify="onFortifyInspected"
          @repair="onRepairInspected"
          @close="inspected = null"
        )

      //- ── Bottom bar ────────────────────────────────────────────────────
      div.scene__bottom(ref="bottomBarRef")
        //- Meta buttons, with Repair-All on its own row directly above them.
        //-
        //- The repair pill is NOT in the settings row. That row's grid track is
        //- width-tuned to the pixel (see `.scene__bottom`), and a control that
        //- comes and goes with the tower's damage would make the hand beside it
        //- resize every wave. A row of its own, right-aligned to the cluster it
        //- belongs to, costs the tray nothing.
        div.scene__meta-col
          Transition(name="fade")
            RepairAllButton(
              v-if="showRepairAll"
              compact
              :damaged="repairPlan.damaged"
              :total-cost="repairPlan.totalCost"
              :spend="repairPlan.spend"
              :repairs="repairPlan.repairs"
              :can-repair="repairAllReady"
              @repair="onRepairAll"
            )
          div.scene__meta
            //- On CrazyGames the platform toolbar owns the mute control and QA
            //- rejects a second one competing with it — except in fullscreen,
            //- where that toolbar is gone and this is the only way to shut the
            //- game up.
            FMuteButton(v-if="showMuteButton")
            FHudButton(
              tone="slate"
              :aria-label="t('options.title')"
              @click="showOptions = true"
            )
              svg(viewBox="0 0 24 24" fill="currentColor")
                path(d="M12 4 a1 1 0 0 1 1 1 v1.6 a6 6 0 0 1 1.8 0.7 l1.1 -1.1 a1 1 0 0 1 1.4 1.4 l -1.1 1.1 a6 6 0 0 1 0.7 1.8 H18 a1 1 0 1 1 0 2 h-1.6 a6 6 0 0 1 -0.7 1.8 l1.1 1.1 a1 1 0 0 1 -1.4 1.4 l-1.1 -1.1 a6 6 0 0 1 -1.8 0.7 V18 a1 1 0 1 1 -2 0 v -1.6 a6 6 0 0 1 -1.8 -0.7 l-1.1 1.1 a1 1 0 0 1 -1.4 -1.4 l1.1 -1.1 a6 6 0 0 1 -0.7 -1.8 H6 a1 1 0 1 1 0 -2 h1.6 a6 6 0 0 1 0.7 -1.8 L7.2 7.6 a1 1 0 0 1 1.4 -1.4 l1.1 1.1 a6 6 0 0 1 1.8 -0.7 V5 a1 1 0 0 1 1 -1 Z M12 9 a3 3 0 1 0 0 6 a3 3 0 0 0 0 -6 Z")
            //DailyRewards(@coins-awarded="fireCoinExplosion")
            MissionsModal(@opened="feedMissions" @coins-awarded="fireCoinExplosion")
            //AchievementsButton(@coins-awarded="fireCoinExplosion")
            //AdRewardButton(@coins-awarded="fireCoinExplosion")
            //BattlePass(@coins-awarded="fireCoinExplosion")

        //- Build tray.
        div.scene__tray
          //- Rewarded perks that act on the hand sit directly above it, so the
          //- thing they change is always in view when the player taps them.
          div.scene__tray-perks(ref="trayPerksRef")
            //- The battle-phase half of the outranged warning. Without it the
            //- player watches every turret hold fire with no way to learn that
            //- the engine is simply too far away — which is the moment they
            //- quit rather than the moment they adapt. It takes a row of its
            //- own so the two answers sit directly underneath the problem.
            div.scene__reach-hint(v-if="outOfReachNow") {{ t('allies.outOfReachHint') }}
            //- A gift a chest or a first clear paid out, waiting to be placed.
            GiftTile(
              variant="footprint"
              :canvas="canvasRef"
              :slot-armed="selectedSlot != null"
              :disabled="giftDisabled"
              @armed="onGiftArmed"
            )
            FRewardButton(
              v-if="enhancedHandOffered"
              tone="gold"
              size="sm"
              :label="t('blocks.enhancedHand')"
              @click="onEnhancedHand"
            )
            //- Reach extension. Offered only on the wave that needs it — see
            //- `rangeBoostOffered` — so it can never read as a range upgrade
            //- sold around the tech tree.
            FRewardButton(
              v-if="rangeBoostOffered"
              tone="blue"
              size="sm"
              :label="t('hud.extendRange', { n: rangeBoostPct })"
              @click="onRangeBoost"
            )
            button.scene__cavalry(
              v-if="cavalryOffered"
              type="button"
              :class="{ 'is-poor': !canAffordCavalry, 'is-free': isCavalryFree }"
              :aria-label="isCavalryFree ? t('allies.cavalryFree') : t('allies.cavalry')"
              @click="onCavalry"
            )
              svg.scene__cavalry-icon(viewBox="0 0 24 24" fill="currentColor")
                path(d="M6 19l1-6 4-3 2-5 3 2-1 4 4 3-1 5h-2l1-4-3-2-3 3-1 3z")
                path(d="M15 4l3 1-1 2z")
              span.scene__cavalry-label {{ t('allies.cavalry') }}
              span.scene__cavalry-free(v-if="isCavalryFree") {{ t('allies.free') }}
              //- Amount then glyph, matching `FRewardButton` — the two sit
              //- side by side in this row, and a coin leading one price while
              //- trailing the other reads as two different currencies.
              span.scene__cavalry-cost(v-else)
                | {{ cavalryPrice }}
                IconCoin(class="scene__cavalry-coin")
              FHudBadge(v-if="allyCount > 0" tone="green") {{ allyCount }}

          //- Turn the armed piece. Only rendered while something turnable is
          //- armed — a rotate control with nothing to rotate is a control the
          //- player has to learn to ignore. Sits directly over the tray so the
          //- piece it acts on is in view, and each half carries its keyboard
          //- shortcut so the desktop binding is discoverable without a manual.
          div.scene__rotate(v-if="canRotate")
            button.scene__rotate-btn(
              type="button"
              :aria-label="t('hud.rotateLeft')"
              :title="`${t('hud.rotateLeft')} (Q)`"
              @click="rotateBy(-1)"
            )
              svg.scene__rotate-icon(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round")
                path(d="M9 4 4 9l5 5")
                path(d="M4 9h8a7 7 0 1 1-7 7")
              span.scene__rotate-key Q
            button.scene__rotate-btn(
              type="button"
              :aria-label="t('hud.rotateRight')"
              :title="`${t('hud.rotateRight')} (E)`"
              @click="rotateBy(1)"
            )
              svg.scene__rotate-icon(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round")
                path(d="M15 4l5 5-5 5")
                path(d="M20 9h-8a7 7 0 1 0 7 7")
              span.scene__rotate-key E

          BuildTray(
            :selected="selectedSlot"
            :offers="offers"
            :enhanced="offerEnhanced"
            :wood="wood"
            :stone="stone"
            :coins="runCoins"
            :reroll-seconds="rerollReadyIn"
            :hide-reroll="tutorialStep !== null"
            :nudge="idleNudge"
            @select="onSelectSlot"
            @reroll="onReroll"
          )

        //- Tech tree, themes, and the wave control.
        div.scene__right
          div.scene__right-buttons
            //- Arrow Rain, left of the tech tree. Both are "spend something to
            //- change the fight", but this one spends a charge and resolves in
            //- the next second, so it sits first along the thumb's path.
            button.scene__rain(
              type="button"
              :class="{ 'is-ready': arrowRainReady, 'is-armed': arrowRainArmed }"
              :aria-label="t('hud.arrowRain')"
              :title="t('hud.arrowRain')"
              @click="onArrowRain"
            )
              svg.scene__rain-icon(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round")
                path(d="M5 3v10")
                path(d="M2.6 10.2 5 13.4l2.4-3.2")
                path(d="M12 5v11")
                path(d="M9.6 13.2 12 16.4l2.4-3.2")
                path(d="M19 3v10")
                path(d="M16.6 10.2 19 13.4l2.4-3.2")
                path(d="M3 20.5h18" stroke-width="2.6")
              //- The charge, as a ring that fills rather than a number: "two
              //- thirds of the way there" is the question being asked, and a
              //- number answers it in a unit nobody thinks in.
              span.scene__rain-fill(:style="{ height: `${Math.round(arrowRainCharge * 100)}%` }")
              FHudBadge(v-if="!arrowRainReady" tone="red") {{ arrowRainWavesLeft }}

            div.scene__tech-wrap
              span.scene__spotlight(v-if="showTechSpotlight") {{ t('tech.spotlight') }}
              //- Two reasons this button can be lit, and they arrive in the
              //- opposite order to the one you would guess: the DISCOVERY
              //- nudge fires first (wave 1, before the player can afford
              //- anything), and the "Spend!" spotlight only once there is
              //- something to buy. The bounce belongs to the first — a player
              //- who already knows the screen does not need to be jumped at.
              FHudButton(
                tone="green"
                :attention="showTechSpotlight || techNudge"
                :bounce="techNudge"
                :aria-label="t('tech.title')"
                @click="openTech"
              )
                //- Its own palette, not `currentColor`. The flat line-art node
                //- graph that used to live here was the same colour as the chip
                //- behind it and the same weight as the cog beside it, and the
                //- tree went unopened — which on a run-based game means the meta
                //- currency is never spent and the player never gets stronger.
                TechTreeGlyph(:active="showTechSpotlight || techNudge || progress.affordableCount.value > 0")
                template(#badge)
                  FHudBadge(v-if="progress.affordableCount.value > 0" tone="red") {{ progress.affordableCount.value }}

          //- What the armed volley is waiting for. Sits with the warnings
          //- because it occupies the same slot in the player's attention: a
          //- short line above the wave control saying what happens next.
          div.scene__aim-hint(v-if="arrowRainArmed") {{ t('hud.arrowRainAim') }}

          //- What the next wave brings that the player may have no answer to.
          //- Sits directly above Call Wave because that is the button the
          //- warning is asking them to think twice about pressing.
          div.scene__warnings(v-if="waveWarnings.length > 0")
            span.scene__warning(
              v-for="w in waveWarnings"
              :key="w.id"
              :class="`is-${w.id}`"
            ) {{ t(`warnings.${w.id}`, { n: w.n, m: w.m ?? 0 }) }}

          CallWaveButton(
            :phase="phase"
            :time-left="buildTimeLeft"
            :bonus-pct="callBonusPct"
            :speed="gameSpeed"
            :boss-incoming="isBossIncoming"
            :speed-buff-left="speedBuffLeft"
            :attention="tutorialStep === 'call'"
            @call="onCallWave"
            @set-speed="onSetSpeed"
            @buy-speed="onBuySpeed"
          )

    //- ── Defeat screen ─────────────────────────────────────────────────────
    FReward(
      v-model="showResult"
      :show-continue="false"
    )
      template(#ribbon)
        span.scene__ribbon {{ t('result.towerFell') }}

      div.result
        //- Two halves — the numbers and the buttons.
        //-
        //- In portrait these wrappers are `display: contents`, so the children
        //- lay out in one column exactly as they always have. In landscape they
        //- become real columns side by side, because a phone on its side has
        //- 360 px of height for a ribbon, five stat lines and four CTAs — and
        //- stacking them there pushed the two most important buttons off the
        //- bottom. The long axis is the one with room; this spends it.
        div.result__info
          div.result__headline
            span.result__wave {{ t('result.reachedWave', { n: summary.wave }) }}

          //- The record sits BESIDE the payout rather than on a line of its
          //- own. `rewardCoinRef` stays wrapped tightly around the coin so the
          //- payout explosion still originates on the coin, not the whole row.
          div.result__payout
            span.result__record(v-if="summary.wave >= bestWave && summary.wave > 0") {{ t('result.newRecord') }}
            //- The wallet coin, not the gold ingot: `grantRunCoins` pays this
            //- straight into the purse the tech tree spends from, so the glyph
            //- has to be the one on the coin badge it flies to.
            div.result__coins(ref="rewardCoinRef")
              IconCoin(class="result__coin-icon")
              span.result__coin-value +{{ summary.coins }}

          //- Score, and where it stands. One strip, two cells: they stay side
          //- by side at every width because both are short, and the rank cell
          //- simply drops out when there is no board to rank against.
          div.result__stats
            div.result__stat
              span.result__stat-label {{ t('result.bestLabel') }}
              span.result__stat-value {{ bestScoreValue.toLocaleString() }}
              //- This run, beside the record it did or did not beat. Hidden on
              //- a record run, where the two numbers are the same one.
              span.result__stat-note(v-if="!isRecordRun") {{ t('result.scoreCurrent', { n: summary.score.toLocaleString() }) }}
            div.result__stat(v-if="showRank")
              span.result__stat-label {{ t('result.rankLabel') }}
              span.result__stat-value {{ rankDisplay }}
              span.result__stat-note(v-if="playerTotal > 0") {{ t('result.rankOf', { n: playerTotal.toLocaleString() }) }}

          //- One line about whatever this run did without. It closes the
          //- numbers column because that is the order the player reads in —
          //- what happened, then why, then what to do about it.
          div.result__tip(v-if="deathTip")
            svg.result__tip-icon(viewBox="0 0 24 24" fill="currentColor" aria-hidden="true")
              path(d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z")
              rect(x="9" y="18.5" width="6" height="1.8" rx="0.9")
              rect(x="10" y="21" width="4" height="1.6" rx="0.8")
            span.result__tip-text {{ t(`tips.${deathTip}`) }}

        div.result__cta
          //- 2× rewarded video.
          //- The offer reads as "3× 🪙" rather than as a sentence: it is the
          //- loudest button on the screen and the number is the whole message.
          //- The accessible name still spells it out.
          FRewardButton(
            v-if="twoXAvailable"
            tone="gold"
            label=""
            :aria-label="t('result.tripleCoins')"
            @click="onTwoX"
          )
            span.result__twox
              span {{ RESULT_COIN_MULTIPLIER }}×
              IconCoin(class="result__twox-icon")

          //- One grace continue per run. Offered ABOVE the restart CTAs so it
          //- reads as the alternative to ending the run rather than a variant
          //- of restarting it.
          FRewardButton(
            v-if="graceAvailable"
            tone="green"
            :label="t('result.continueRun')"
            @click="onContinueRun"
          )
            //- What the video actually buys, in the only notation that needs no
            //- translation. The tower coming back is worth nothing on its own —
            //- it is the same wall that just failed — so the materials are the
            //- offer, and they have to be ON the button rather than discovered
            //- after the ad has already played.
            span.result__continue
              GameIcon.result__continue-icon(name="fast-forward")
              span {{ t('result.continueWave', { n: continueWave }) }}
              span.result__continue-bonus
                span +{{ CONTINUE_WOOD }}
                IconWood.result__res-icon
                span +{{ CONTINUE_STONE }}
                IconStone.result__res-icon

          //- The two CTAs from reference image 2.
          div.result__actions
            //- Both captions are glyphs now. `result.upgrade` and
            //- `result.defendAgain` are NOT dead keys: they moved from being
            //- read on screen to being read aloud, as the accessible name of
            //- an icon-only control. Do not prune them.
            FButton(
              size="md"
              icon="shop"
              icon-only
              :aria-label="t('result.upgrade')"
              :is-disabled="adInFlight"
              @click="onUpgrade"
            )
            //- No movie badge: restarting is the way OUT of a finished run, and
            //- a player who cannot get past it because an ad will not fill is
            //- stuck on the defeat screen. `free` keeps the reward-button
            //- styling and disabled handling while dropping the video
            //- affordance.
            FRewardButton(
              tone="blue"
              free
              icon="skip-forward"
              icon-only
              :label="t('result.defendAgain')"
              @click="onRebuild"
            )


    //- First-stage coach marks. Outside `.scene__ui` so its dim layer covers
    //- the whole screen rather than sitting inside the HUD's stacking context.
    //- No handlers: it emits nothing, because there is nothing on it to press.
    TutorialOverlay(
      :step="tutorialStep"
      :target="tutorialRect"
    )

    //- The merge ladder, on the frame the player's first fusion landed. Its own
    //- beat of the tutorial sequence, so the build countdown stays held while it
    //- is up (see `buildClockHeld`) and the wave cannot fire out from under it.
    MergeGuide(
      :model-value="showMergeGuide"
      @continue="onMergeGuideContinue"
    )

    //- Six seconds after the ladder: a plain cannon against a tier 3, one
    //- health bar between them. A tutorial beat, so the countdown stays held.
    MergePowerDemo(
      :model-value="showMergePower"
      @continue="onMergePowerContinue"
    )

    //- The collapse trap, once, in the beat between the first death's ad break
    //- and the defeat screen. `presentDefeat` awaits it.
    TrapTutorial(
      v-model="showTrap"
      @continue="onTrapContinue"
    )

    OptionsModal(:is-open="showOptions" @close="showOptions = false")
    TechTreeModal(v-model="showTech" :intro="techIntro")
</template>

<style scoped lang="sass">
.scene
  position: relative
  width: 100vw
  height: 100vh
  height: 100dvh
  overflow: hidden
  background-color: #0a1224

.scene__canvas
  position: absolute
  inset: 0
  display: block
  // The canvas owns every gesture; the browser must not steal them for
  // scrolling, pull-to-refresh or double-tap zoom.
  touch-action: none

.scene__hud
  position: absolute
  inset: 0
  pointer-events: none
  display: flex
  flex-direction: column

// ─── Top bar ────────────────────────────────────────────────────────────────

.scene__top
  display: flex
  align-items: flex-start
  justify-content: space-between
  gap: clamp(0.25rem, 2vw, 0.75rem)
  padding: calc(clamp(0.3rem, 1.6vw, 0.6rem) + env(safe-area-inset-top, 0px)) calc(clamp(0.3rem, 1.6vw, 0.6rem) + env(safe-area-inset-right, 0px)) 0 calc(clamp(0.3rem, 1.6vw, 0.6rem) + env(safe-area-inset-left, 0px))

.scene__wallet
  display: flex
  flex-direction: column
  align-items: flex-end
  // The chest hangs a payout / countdown chip below itself, out of flow. The
  // gap has to clear that chip or the next thing in the column sits on top of
  // it — and the chest is nudged in from the right edge so the chip, which is
  // wider than the chest, is not clipped by the viewport.
  gap: clamp(0.6rem, 3vw, 1rem)
  padding-right: clamp(0.15rem, 1.2vw, 0.4rem)
  padding-bottom: clamp(0.9rem, 3.6vw, 1.2rem)
  pointer-events: auto

// Taken out of the HUD column and positioned in screen space, so it can track
// the world's shoreline instead of stacking under the top bar.
.scene__toast
  position: absolute
  left: 0
  right: 0
  display: flex
  justify-content: center
  padding-inline: 0.5rem
  pointer-events: none

.scene__hint
  display: flex
  justify-content: center
  margin-top: clamp(0.3rem, 1.6vw, 0.6rem)
  padding-inline: 0.5rem

.scene__recenter
  position: absolute
  top: 50%
  right: calc(clamp(0.4rem, 2vw, 0.8rem) + env(safe-area-inset-right, 0px))
  translate: 0 -50%
  display: flex
  align-items: center
  justify-content: center
  width: 2.5rem
  height: 2.5rem
  min-width: 2.5rem
  min-height: 2.5rem
  padding: 0
  border: 2px solid rgba(255, 255, 255, 0.25)
  border-radius: 999px
  background-color: rgba(8, 14, 28, 0.72)
  color: #cfe4ff
  cursor: pointer
  pointer-events: auto
  -webkit-tap-highlight-color: transparent

  svg
    width: 55%
    height: 55%

  &:active
    scale: 0.92

// ─── Inspector ──────────────────────────────────────────────────────────────

.scene__inspector
  position: absolute
  left: calc(clamp(0.35rem, 2vw, 0.7rem) + env(safe-area-inset-left, 0px))
  // Sits above the bottom bar. The bar's height varies with content, so anchor
  // from a generous constant rather than chasing it every frame.
  bottom: calc(clamp(7.5rem, 24vh, 10rem) + env(safe-area-inset-bottom, 0px))
  pointer-events: auto

// ─── Bottom bar ─────────────────────────────────────────────────────────────

.scene__bottom
  margin-top: auto
  display: grid
  // meta | tray | wave control.
  //
  // `1fr auto 1fr` — NOT `auto 1fr auto`. With the tray in the flexible middle
  // column its centre followed the midpoint between the meta cluster and the
  // wave control, so whenever those two had different widths (which is most of
  // the time — the meta row grows and shrinks with claimable rewards) the hand
  // drifted off-centre and, at some sizes, ended up hard against the right edge
  // over the battlefield. Sizing the tray to its content and letting the two
  // side columns split whatever is left pins it to the middle of the SCREEN.
  //
  // Two changes from `minmax(0, 1fr) auto minmax(0, 1fr)`, and they only work
  // together.
  //
  // `min-content` — NOT 0 — as the side minimum. At 0 the two side tracks were
  // squeezed to nothing while the content-sized tray track kept its full
  // max-content width, and a track narrower than its contents does not clip
  // them: the wave control overflowed LEFT (it is `justify-self: end`) and
  // painted straight through the hand, while the meta cluster wrapped into a
  // vertical stack of single buttons. Both were visible on a ~700x640 embed.
  //
  // And the middle track is a SHARE of the viewport, not `auto`. `auto` meant
  // the track was sized to the hand and the hand was sized to the track, so
  // `BuildTray` could measure its own width but never learn how much room it
  // actually had — the whole reason its `chrome` term had to under-count to
  // converge. A share the tray does not influence breaks that loop: the tiles
  // now shrink to whatever is left over, which is what makes the hand able to
  // give way at all.
  //
  // 46vw is measured, not chosen: at 700px the meta cluster needs 162px to stay
  // on ONE row and the wave control 163px at its widest shipped label (Spanish
  // "LLAMAR OLEADA"; German "WELLE RUFEN" is close behind). Those plus the gaps
  // and this bar's padding leave the hand ~331px. Give it more and the meta
  // cluster wraps into a vertical stack, which is taller and reads as broken
  // even when nothing overlaps.
  //
  // On a wide screen the track is simply roomier than the hand needs — the
  // scroller inside shrink-wraps and centres, so nothing looks stretched.
  grid-template-columns: minmax(min-content, 1fr) minmax(0, 46vw) minmax(min-content, 1fr)
  grid-template-areas: 'meta tray right'
  align-items: end
  gap: clamp(0.25rem, 1.6vw, 0.7rem)
  padding: 0 calc(clamp(0.35rem, 2vw, 0.7rem) + env(safe-area-inset-right, 0px)) calc(clamp(0.35rem, 2vw, 0.7rem) + env(safe-area-inset-bottom, 0px)) calc(clamp(0.35rem, 2vw, 0.7rem) + env(safe-area-inset-left, 0px))

// The `meta` grid cell holds TWO rows: the repair pill and the settings cluster.
//
// The wrapper — not `.scene__meta` — owns the grid area, and it shrink-wraps
// (`justify-self: start`), so its width is whatever its widest row needs. That
// keeps the track's min-content the width of the settings row, which is the
// figure `.scene__bottom`'s column comment is measured against; a repair pill
// that widened the track would take it straight out of the hand beside it.
// `align-items: flex-end` is what right-aligns the pill to the cluster below.
.scene__meta-col
  grid-area: meta
  justify-self: start
  display: flex
  flex-direction: column
  align-items: flex-end
  gap: clamp(0.15rem, 1vw, 0.35rem)
  min-width: 0
  max-width: 40vw
  pointer-events: auto

.scene__meta
  display: flex
  // `nowrap` is load-bearing for the BAR, not just for this cluster.
  //
  // A wrapping flex container's min-content is its widest single CHILD, so the
  // grid track beside the hand was told this cluster could live in ~54px. It
  // duly handed the rest to the hand and let the cluster wrap into a vertical
  // stack of single buttons — taller, and it reads as broken. Refusing to wrap
  // makes min-content the width of the whole row, which the track then has to
  // reserve, and the hand is what gives instead. No overflow guard is needed
  // here: `BuildTray` shrinks its tiles to whatever is left.
  flex-wrap: nowrap
  align-items: flex-end
  gap: clamp(0.15rem, 1vw, 0.35rem)
  pointer-events: auto

.scene__tray
  position: relative
  grid-area: tray
  display: flex
  flex-direction: column
  align-items: center
  justify-content: flex-end
  min-width: 0
  pointer-events: auto

// Rotation, pinned to the right EDGE of the tray rather than above it.
//
// Above is already taken by the perk row, and the two would collide exactly
// when both are showing — which is most of a build phase. On the edge they are
// also where a thumb already is on a phone held in one hand, and out of flow
// they cost the bottom bar no height.
.scene__rotate
  position: absolute
  right: 0
  bottom: calc(100% + 0.25rem)
  display: flex
  align-items: center
  gap: clamp(0.15rem, 0.9vw, 0.3rem)
  pointer-events: auto

.scene__rotate-btn
  position: relative
  display: inline-flex
  align-items: center
  justify-content: center
  width: clamp(1.75rem, 8vw, 2.3rem)
  height: clamp(1.75rem, 8vw, 2.3rem)
  padding: 0
  border: 2px solid #0f1a30
  border-radius: 0.5rem
  background-image: linear-gradient(to bottom, #7fa8c8, #3d6a92)
  color: #fff
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent

  &:active
    translate: 0 2px
    scale: 0.96

.scene__rotate-icon
  width: 62%
  height: 62%
  filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.6))

// The keyboard shortcut, as a keycap on the button it belongs to. Hidden where
// there is no keyboard to press it with.
.scene__rotate-key
  position: absolute
  right: -0.15rem
  bottom: -0.2rem
  min-width: 0.95em
  padding: 0 0.18em
  border-radius: 0.25rem
  background-color: rgba(10, 18, 34, 0.92)
  color: #cfe4ff
  font-size: clamp(0.42rem, 1.9vw, 0.58rem)
  font-weight: 900
  line-height: 1.35
  text-align: center

@media (pointer: coarse)
  .scene__rotate-key
    display: none

// Floated ABOVE the tray rather than stacked on top of it. In flow these two
// controls added ~46 px to a bottom bar that already owns a third of a phone
// screen; out of flow they cost nothing and still sit right next to the hand
// they act on.
.scene__tray-perks
  position: absolute
  bottom: calc(100% + 0.25rem)
  left: 50%
  translate: -50% 0
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: clamp(0.2rem, 1.2vw, 0.45rem)
  max-width: 100%

// ─── Cavalry ────────────────────────────────────────────────────────────────

// The battle-phase "your guns cannot reach that" line. Red rather than the
// aim-hint's gold: this is not an instruction for something the player already
// chose to do, it is the game explaining why nothing is shooting.
//
// A row of its own inside the perk strip (`flex: 0 0 100%`), so the reach
// extension and the free sortie wrap underneath it. It used to sit in the
// bottom-right stack beside the warning chips, which works on a desktop frame
// and fails at 320 px: that column is a row of HUD buttons during a battle, and
// a whole sentence landed on top of one of them in every long locale.
.scene__reach-hint
  flex: 0 0 100%
  max-width: 22rem
  margin: 0 auto 0.15rem
  padding: 0.2rem 0.6rem
  border: 2px solid #ff6a5c
  border-radius: 0.5rem
  background-color: rgba(122, 25, 20, 0.92)
  color: #fff
  font-weight: 900
  font-size: clamp(0.5rem, 2.2vw, 0.7rem)
  line-height: 1.25
  text-align: center
  text-shadow: 1px 1px 0 #000
  pointer-events: none
  animation: scene-warn 900ms ease-in-out infinite

  @media (prefers-reduced-motion: reduce)
    animation: none

.scene__cavalry
  position: relative
  display: inline-flex
  align-items: center
  gap: clamp(0.2rem, 1.2vw, 0.4rem)
  // Tap-target floor; the control must never shrink below a thumb.
  min-height: 2.25rem
  padding: clamp(0.2rem, 1.2vw, 0.4rem) clamp(0.4rem, 2.4vw, 0.8rem)
  border: 2px solid #0f1a30
  border-radius: clamp(0.5rem, 2.4vw, 0.9rem)
  background-image: linear-gradient(to bottom, #ff9d55, #e0632a)
  color: #fff
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: transform 100ms ease-out, filter 100ms ease-out

  &:active
    transform: translateY(2px) scale(0.96)

  &.is-poor
    filter: grayscale(0.75) brightness(0.68)

  // A free sortie is the ONLY move left on the board, so the button stops being
  // one control among several and starts asking for the tap. Green, because
  // that is the tray's "this costs you nothing" colour, and a pulse rather than
  // a hard blink — the player is reading a battlefield behind it.
  &.is-free
    background-image: linear-gradient(to bottom, #67e08a, #1f9d4d)
    animation: scene-cavalry-call 900ms ease-in-out infinite

    // Respect the OS setting: a control that strobes is a real accessibility
    // problem, and the colour change alone still marks it out.
    @media (prefers-reduced-motion: reduce)
      animation: none
      box-shadow: 0 0 0 3px rgba(140, 255, 170, 0.55)

@keyframes scene-cavalry-call
  0%, 100%
    box-shadow: 0 0 0 0 rgba(140, 255, 170, 0)
    filter: brightness(1)
  50%
    box-shadow: 0 0 0 5px rgba(140, 255, 170, 0.45)
    filter: brightness(1.22)

.scene__cavalry-free
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.6rem, 2.6vw, 0.85rem)
  line-height: 1
  text-shadow: 2px 2px 0 #000

.scene__cavalry-icon
  width: clamp(1.1rem, 4.4vw, 1.5rem)
  height: clamp(1.1rem, 4.4vw, 1.5rem)
  flex: 0 0 auto

.scene__cavalry-label
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.6rem, 2.6vw, 0.85rem)
  line-height: 1
  text-shadow: 2px 2px 0 #000
  // Vanishes on the narrowest phones, where the icon plus price already says it.
  @media (max-width: 22rem)
    display: none

.scene__cavalry-cost
  display: inline-flex
  align-items: center
  gap: 0.22em
  font-weight: 900
  font-size: clamp(0.6rem, 2.6vw, 0.85rem)
  line-height: 1
  // Fully outlined, like the reward button's price: the cavalry body is a warm
  // orange and a single bottom-right shadow leaves the digits swimming in it.
  text-shadow: 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000

.scene__cavalry-coin
  width: 1em
  height: 1em

.scene__right
  grid-area: right
  justify-self: end
  display: flex
  flex-direction: column
  align-items: flex-end
  gap: clamp(0.25rem, 1.4vw, 0.5rem)
  pointer-events: auto

// On a phone the three columns leave the tray about 130–230 px. Four tap-sized
// tiles plus their chrome need ~250, so two of the four offers end up outside
// the scroll area — invisible, with nothing to suggest they are there. The hand
// is the core decision of the build phase and has to be visible in full, so
// below this width the tray takes a row of its own.
//
// The meta cluster keeps its full width in this layout ON PURPOSE: constrained
// to 29vw it wrapped to three rows and the bottom bar grew to 44% of a 659 px
// screen, which is worse than the problem it was solving. One wide row of small
// buttons is shorter than three narrow ones.
//
// Restricted to PORTRAIT because a landscape phone turns the tray into a
// vertical rail, where a full-width row would eat the short axis instead.
//
// Deliberately NOT widened past 37rem. Three columns stop fitting five
// tap-sized tiles at about 41rem — below that the hand scrolls by a tile's
// width — but buying those pixels with a second row costs far more than it
// returns: measured on a 640x629 embed the bar goes from ~145px to 243px, 39%
// of the screen, and the battlefield is what pays. A hand whose last tile is
// two-thirds visible still reads as scrollable; a bottom bar that eats the
// board does not read as anything but broken.
@media (max-width: 37rem) and (orientation: portrait)
  .scene__bottom
    grid-template-columns: minmax(0, 1fr) auto
    grid-template-areas: 'tray tray' 'meta right'
    justify-items: stretch
    row-gap: clamp(0.15rem, 1vw, 0.35rem)
    column-gap: clamp(0.15rem, 1vw, 0.4rem)

  .scene__meta
    max-width: none
    flex-wrap: nowrap
    // Tighter than the desktop gap: with five controls sharing this row on a
    // phone, the spacing between them is the cheapest width to give back.
    gap: clamp(0.1rem, 0.7vw, 0.25rem)
    // The cluster is the one thing here that may scroll: every button in it
    // opens a modal the player can also reach later, unlike the offers.
    overflow-x: auto
    overscroll-behavior-x: contain
    scrollbar-width: none

    &::-webkit-scrollbar
      display: none

.scene__right-buttons
  display: flex
  align-items: flex-end
  gap: clamp(0.15rem, 1vw, 0.35rem)

// ─── Incoming-threat warnings ───────────────────────────────────────────────
//
// Deliberately terse chips rather than a sentence: they are read in the last
// seconds of a build phase, next to a countdown, and a paragraph there is a
// paragraph nobody reads.

.scene__warnings
  display: flex
  flex-direction: column
  align-items: flex-end
  gap: 0.15rem
  margin-bottom: 0.25rem
  pointer-events: none

.scene__warning
  padding: 0.1em 0.5em
  border: 2px solid #0f1a30
  border-radius: 999px
  background-color: rgba(10, 16, 30, 0.82)
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.5rem, 2.2vw, 0.66rem)
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.6)
  white-space: nowrap
  animation: scene-warn 1.8s ease-in-out infinite

  &.is-air
    color: #9ad8ff
    border-color: #2b5a80
  &.is-sea
    color: #7fe0d0
    border-color: #226055
  &.is-bombers
    color: #ffb46a
    border-color: #7a4418
  &.is-siege
    color: #ff9a92
    border-color: #7d2b24
  //- The one chip that is not "brace" but "buy something". It carries a reach
  //- figure and a locale can make that a sentence, so it is the only chip
  //- allowed to wrap rather than run off a 320 px screen.
  &.is-outOfReach
    max-width: min(16rem, 72vw)
    color: #fff
    background-color: rgba(122, 25, 20, 0.92)
    border-color: #ff6a5c
    white-space: normal
    text-align: right
    animation: scene-warn 900ms ease-in-out infinite
  //- Gold, and it does not pulse: the lane chips warn about something arriving,
  //- this one reports a standing state the player chose and can undo.
  &.is-hoard
    color: #ffd93c
    border-color: #7a5c10
    animation: none

@keyframes scene-warn
  0%, 100%
    opacity: 0.72
  50%
    opacity: 1

.scene__aim-hint
  align-self: flex-end
  max-width: 12rem
  padding: 0.2rem 0.5rem
  border: 2px solid #7a5a00
  border-radius: 0.5rem
  background-color: rgba(24, 18, 4, 0.88)
  color: #ffe08a
  font-weight: 900
  font-size: clamp(0.5rem, 2.2vw, 0.68rem)
  line-height: 1.25
  text-align: right
  text-shadow: 1px 1px 0 #000

// ── Arrow Rain ──
//
// Sized to match FHudButton so the row reads as one set of controls rather than
// as a bespoke thing bolted onto the side of the tech tree.
.scene__rain
  position: relative
  display: inline-flex
  align-items: center
  justify-content: center
  flex: 0 0 auto
  // Deliberately the same figures as `FHudButton`, not similar ones: this sits
  // shoulder to shoulder with the tech-tree chip and the row only reads as one
  // set of controls if they are the same size at every breakpoint.
  min-width: 2.5rem
  min-height: 2.5rem
  width: clamp(2.5rem, 11vw, 3.4rem)
  height: clamp(2.5rem, 11vw, 3.4rem)
  padding: 0
  overflow: hidden
  border: 2px solid #0f1a30
  border-radius: clamp(0.45rem, 2vw, 0.7rem)
  background-image: linear-gradient(to bottom, #4a5a72, #2b3548)
  color: #8fa3bd
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: filter 90ms ease-out

  &:active
    translate: 0 2px
    scale: 0.96

  // Ready: it lights up. This is the only state where pressing it does
  // anything, so it is the only state that looks like a live control.
  &.is-ready
    background-image: linear-gradient(to bottom, #ffcd00, #f7a000)
    color: #3a2b00

  // Armed: the next tap on the field is the shot. Pulsed, because the player is
  // now in a mode and a mode you cannot see is a mode you fire by accident.
  &.is-armed
    animation: rain-armed 0.7s ease-in-out infinite

.scene__rain-icon
  position: relative
  z-index: 1
  // 62% is `FHudButton`'s glyph fraction — a row of mixed icons only reads as
  // one set if they fill their chips identically.
  width: 62%
  height: 62%
  filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.45))

// Fills from the bottom as the charge comes back.
.scene__rain-fill
  position: absolute
  left: 0
  right: 0
  bottom: 0
  background-image: linear-gradient(to top, rgba(255, 205, 0, 0.55), rgba(255, 205, 0, 0.12))
  pointer-events: none
  transition: height 260ms ease-out

.scene__rain.is-ready .scene__rain-fill
  opacity: 0

@keyframes rain-armed
  0%, 100%
    box-shadow: 0 0 0 0 rgba(255, 224, 120, 0)
  50%
    box-shadow: 0 0 0 5px rgba(255, 224, 120, 0.6)

.scene__tech-wrap
  position: relative
  display: flex
  align-items: center

// Sits ABOVE the tech chip, not beside it. `right: 100%` put the pill in the
// space the Arrow Rain button occupies, so the coach mark covered the very
// control the player is most likely to want mid-build. Above the row there is
// nothing but battlefield, and the pill is right-aligned to the chip it is
// pointing at so the association still reads.
.scene__spotlight
  position: absolute
  right: 0
  bottom: 100%
  margin-bottom: 0.35rem
  // Never a tap target: it is a label on a button, and swallowing the tap that
  // was aimed at the button underneath it is worse than not showing it at all.
  pointer-events: none
  padding: 0.15em 0.5em
  border: 2px solid #0f1a30
  border-radius: 0.5rem
  background-image: linear-gradient(to bottom, #ffcd00, #f7a000)
  color: #fff
  font-weight: 900
  text-transform: uppercase
  white-space: nowrap
  font-size: clamp(0.5rem, 2.2vw, 0.68rem)
  text-shadow: 2px 2px 0 #000
  animation: spotlight-pulse 1.2s ease-in-out infinite

@keyframes spotlight-pulse
  0%, 100%
    opacity: 1
  50%
    opacity: 0.6

// ─── Portrait phone ─────────────────────────────────────────────────────────
//
// The narrowest supported viewport is 320×658. There the three-column bottom
// bar cannot fit side by side, so it becomes two stacked rows: the tray takes a
// full-width row of its own (it is the primary control) and the buttons share
// the row beneath it.
@media (max-width: 30rem)
  .scene__bottom
    grid-template-columns: minmax(0, 1fr) auto
    grid-template-areas: "tray tray" "meta right"
    gap: clamp(0.25rem, 1.6vw, 0.5rem)

  .scene__tray
    grid-area: tray

  .scene__meta-col
    grid-area: meta
    max-width: none

  .scene__right
    grid-area: right
    flex-direction: row
    align-items: center

  .scene__inspector
    bottom: calc(11rem + env(safe-area-inset-bottom, 0px))

// ─── Landscape phone ────────────────────────────────────────────────────────
//
// Vertical space is the scarce resource, but the hand STAYS in the bottom bar.
//
// It used to fly out to a right-hand rail here, on the theory that a vertical
// strip costs no height. Two things were wrong with that. The rail's media
// query is not gated on touch while the component's rail LAYOUT is (it keys off
// `isMobileLandscape`, which needs a mobile UA), so any short desktop or portal
// embed got the absolute positioning without the vertical stacking — a
// horizontal tray floating in the middle of the battlefield. And a control that
// changes corner depending on the viewport is one the player has to hunt for.
//
// It is compact here instead: the tile cap follows the short axis (see
// `BuildTray.tileSize`) so a full hand still costs a thin strip of height.
@media (orientation: landscape) and (max-height: 30rem)
  // Every millimetre of the short axis the bar gives back is battlefield.
  .scene__bottom
    padding-bottom: calc(0.2rem + env(safe-area-inset-bottom, 0px))
    gap: 0.2rem

  .scene__right
    flex-direction: row
    align-items: flex-end

  .scene__inspector
    bottom: calc(3.75rem + env(safe-area-inset-bottom, 0px))

  .scene__recenter
    top: auto
    bottom: calc(3.5rem + env(safe-area-inset-bottom, 0px))
    right: calc(5.5rem + env(safe-area-inset-right, 0px))
    translate: none

// ─── Result screen ──────────────────────────────────────────────────────────

.scene__ribbon
  color: #fff
  font-weight: 900
  font-style: italic
  text-transform: uppercase
  font-size: clamp(0.8rem, 3.6vw, 1.4rem)

.result
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.4rem, 2vw, 0.9rem)
  width: 100%
  max-width: 26rem

// The two halves are LAYOUT-NEUTRAL in portrait: `display: contents` drops
// them out of the box tree entirely, so their children remain direct flex items
// of `.result` and the single-column layout is byte-identical to before.
.result__info,
.result__cta
  display: contents

.result__headline
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.15rem

.result__wave
  color: #fff
  font-weight: 900
  text-transform: uppercase
  text-align: center
  font-size: clamp(1rem, 5vw, 1.9rem)
  text-shadow: 3px 3px 0 #000

.result__payout
  // `1fr auto 1fr`, so the coin stays centred on the SCREEN and the record
  // hangs off its left rather than shoving it sideways. Same reasoning as the
  // bottom bar's tray column.
  display: grid
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr)
  align-items: center
  gap: clamp(0.35rem, 2vw, 0.8rem)
  width: 100%

.result__record
  grid-column: 1
  justify-self: end
  text-align: right
  color: #ffd93c
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.65rem, 3vw, 0.95rem)
  text-shadow: 2px 2px 0 #000
  animation: spotlight-pulse 1.1s ease-in-out infinite

.result__coins
  grid-column: 2
  display: flex
  align-items: center
  gap: 0.4rem

.result__coin-icon
  width: clamp(1.3rem, 6vw, 2rem)
  height: clamp(1.3rem, 6vw, 2rem)
  color: #ffd93c

.result__coin-value
  color: #ffd93c
  font-weight: 900
  font-size: clamp(1.2rem, 6vw, 2.2rem)
  text-shadow: 3px 3px 0 #000

// ── Score / rank strip ──
// Two cells on one row at every width. Both values are short (a score is three
// or four digits, a rank four or five), so stacking them would waste the one
// axis the defeat screen is actually short of — height, on a phone in
// landscape, where four CTAs already have to fit underneath.
.result__stats
  display: flex
  align-items: stretch
  justify-content: center
  gap: clamp(0.4rem, 2.5vw, 0.9rem)
  width: 100%
  padding: clamp(0.3rem, 1.6vw, 0.55rem) clamp(0.5rem, 3vw, 1rem)
  border-radius: 0.75rem
  background: rgba(8, 14, 28, 0.5)
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.08)

.result__stat
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 0.05rem
  // Equal halves, so the divider sits dead centre whatever the numbers are.
  flex: 1 1 0
  min-width: 0

  & + &
    border-left: 2px solid rgba(255, 255, 255, 0.1)
    padding-left: clamp(0.4rem, 2.5vw, 0.9rem)

.result__stat-label
  color: rgba(214, 228, 255, 0.72)
  font-weight: 800
  text-transform: uppercase
  letter-spacing: 0.04em
  font-size: clamp(0.55rem, 2.6vw, 0.78rem)

.result__stat-value
  color: #fff
  font-weight: 900
  line-height: 1.05
  font-size: clamp(1rem, 4.6vw, 1.6rem)
  text-shadow: 2px 2px 0 #000
  // Tabular figures stop the rank jittering sideways when it updates from a
  // derived guess to the number the server returned.
  font-variant-numeric: tabular-nums
  white-space: nowrap

.result__stat-note
  color: rgba(214, 228, 255, 0.6)
  font-weight: 700
  font-size: clamp(0.5rem, 2.3vw, 0.7rem)
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  max-width: 100%

// ─── Death-screen tip ───────────────────────────────────────────────────────
//
// One line, and it must never be the reason a CTA moves. It is capped in height
// and scrolls internally past that cap, so a long translation cannot grow the
// dialog: German and Vietnamese run ~40 % longer than English here, which is
// exactly the width at which a "one line" tip quietly becomes three.

.result__tip
  display: flex
  align-items: center
  gap: clamp(0.35rem, 2vw, 0.6rem)
  width: 100%
  padding: clamp(0.28rem, 1.5vw, 0.5rem) clamp(0.45rem, 2.6vw, 0.8rem)
  border-radius: 0.7rem
  background: rgba(8, 14, 28, 0.5)
  box-shadow: inset 0 0 0 2px rgba(255, 214, 92, 0.22)

.result__tip-icon
  flex: 0 0 auto
  width: clamp(0.9rem, 4vw, 1.25rem)
  height: clamp(0.9rem, 4vw, 1.25rem)
  color: #ffd35c
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.6))

.result__tip-text
  min-width: 0
  color: rgba(226, 236, 255, 0.94)
  font-weight: 700
  line-height: 1.28
  font-size: clamp(0.56rem, 2.6vw, 0.8rem)
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.55)
  // Three lines is the ceiling. Past that the tip scrolls rather than pushing
  // the buttons below it down the screen.
  max-height: 3.9em
  overflow-y: auto
  overscroll-behavior: contain

.result__twox
  display: inline-flex
  align-items: center
  gap: 0.35em
  white-space: nowrap

.result__twox-icon
  // `flex: none` and the explicit ratio are both load-bearing: as a flex item
  // the coin was being squashed to 18x13 from a square source, which reads as
  // a slightly wrong coin rather than as an obvious bug.
  flex: 0 0 auto
  width: 1.25em
  height: 1.25em
  aspect-ratio: 1
  object-fit: contain

// The default slot REPLACES `label`, so the label is restated here rather than
// passed — the chips have to sit with it, not instead of it.
.result__continue
  display: inline-flex
  align-items: center
  flex-wrap: wrap
  justify-content: center
  gap: 0.15em 0.5em

// The materials a grace continue pays out, riding beside the button's label.
//
// The SAME glyphs the resource bar uses, not a colour-coded stand-in. This
// button and that bar are the only two places wood and stone are named, so a
// player reads the promise here and checks it there — and two drawings of one
// resource make that a comparison rather than a confirmation.
.result__continue-bonus
  display: inline-flex
  align-items: center
  gap: 0.3em
  font-weight: 900
  font-variant-numeric: tabular-nums
  white-space: nowrap

.result__res-icon
  flex: 0 0 auto
  width: 1.35em
  height: 1.35em
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.45))

// The fast-forward mark that opens the caption. It replaces the words "Rebuild
// & continue", which wrapped onto two lines in German and Vietnamese and made
// the button the tallest control on the screen. Sized off the label rather
// than fixed, so it tracks the button's own type scale.
.result__continue-icon
  flex: 0 0 auto
  width: 1.15em
  height: 1.15em
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.45))

.result__actions
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: clamp(0.35rem, 2vw, 0.75rem)
  width: 100%

// Mobile landscape has ~390px of height to hold a headline, the payout and
// four CTAs. Every size above is driven by `vw` — the LONG axis here — so the
// defaults open up widest exactly where there is least room, and the bottom
// row of buttons falls past the edge. Drive the same values off the short axis.
// ─── Short viewports ────────────────────────────────────────────────────────
//
// Keyed on HEIGHT, not orientation. The old rules were
// `(orientation: landscape) and (max-height: 500px)` plus a portrait twin, which
// left a hole: a 1365x533 desktop embed is landscape but taller than 500, so it
// matched neither and overflowed with three CTAs below the fold. Height is the
// scarce axis on this screen whichever way the device is held, so height is
// what the query should ask about.
@media (max-height: 640px)
  .result
    // 0.3rem left the dialog ~9px taller than a 764x385 Chromebook embed, which
    // is not a cut-off button but IS a scrollbar over the defeat screen. The
    // gap is the cheapest place to find it: the alternative was dropping the
    // "(137 this run)" note, which is the half of the strip that tells the
    // player why to press Defend Again.
    gap: 0.12rem

  // Every size here is driven off the SHORT axis. Driven off `vw` — as the
  // defaults are — they open up widest exactly where there is least room.
  .result__wave
    font-size: clamp(0.95rem, 4vh, 1.3rem)

  .result__coin-icon
    width: 1.5rem
    height: 1.5rem

  .result__coin-value
    font-size: 1.5rem

  .result__stats
    padding: 0.14rem 0.6rem
    border-radius: 0.55rem

  .result__stat-label
    font-size: 0.6rem

  .result__stat-value
    font-size: clamp(0.9rem, 3.4vh, 1.2rem)

  .result__stat-note
    font-size: 0.55rem

  // The tip has the least claim on the scarce axis, so it takes the tightest
  // treatment and a two-line ceiling instead of three.
  .result__tip
    padding: 0.12rem 0.5rem
    border-radius: 0.5rem
    gap: 0.35rem

  .result__tip-icon
    width: 0.85rem
    height: 0.85rem

  .result__tip-text
    font-size: clamp(0.5rem, 2.2vh, 0.66rem)
    max-height: 2.6em

// ── Two columns ──
//
// Short AND wide enough to split. Stacked, this screen needs ~290px of height
// for the ribbon, the numbers and four CTAs — more than a phone on its side
// has once the ribbon is drawn — and the two most important buttons ended up
// below the fold, reachable only by scrolling, which is the one thing a defeat
// screen must never ask for.
//
// Side by side each column carries half the height, and the long axis — the
// one a short viewport actually has — does the work. Gated on width so a tall
// narrow phone never gets two 140px columns.
//
// 28rem, not 34: a 480x320 landscape phone is 30rem wide, and at the higher
// threshold it fell back to one column and pushed both restart buttons off the
// bottom — the exact device the two-column layout exists for.
@media (max-height: 640px) and (min-width: 28rem)
  .result
    flex-direction: row
    align-items: center
    justify-content: center
    // In a row this is the gap BETWEEN the two columns; each column sets its
    // own tighter vertical rhythm below.
    gap: clamp(0.5rem, 3vw, 1.1rem)
    max-width: 46rem

  .result__info,
  .result__cta
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    min-width: 0
    gap: 0.18rem

  // The CTA column takes the width it needs and the numbers take the rest.
  // Equal halves clipped "Defend again" off the right edge at 568px: two
  // buttons plus their gap do not fit in half of that.
  .result__info
    flex: 1 1 0

  .result__cta
    flex: 0 1 auto
    // Enough for the widest CTA at the compact font, capped as a share of the
    // dialog so the numbers column is never squeezed to nothing.
    min-width: min(15rem, 48vw)



@media (min-width: 48rem) and (orientation: portrait)
  .result
    max-width: 30rem

  .result__stats
    padding: 0.6rem 1.2rem

  .result__stat-value
    font-size: 1.7rem

.fade-enter-active, .fade-leave-active
  transition: opacity 220ms ease
.fade-enter-from, .fade-leave-to
  opacity: 0
</style>

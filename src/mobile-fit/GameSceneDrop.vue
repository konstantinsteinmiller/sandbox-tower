<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  previewDropMerge,
  phase, wave, wood, runCoins, enemiesLeft, buildTimeLeft, gameSpeed,
  lastWaveReward, isBossIncoming, towerVersion, waveVersion,
  currentHoardTier, getBlocks, getTowerBlocks, getEnemies, offers, offerEnhanced,
  rerollReadyIn, arrowRainCharge, arrowRainReady, arrowRainWavesLeft, callArrowRain,
  startRun, resumeRun, callWave, setGameSpeed, step, runSummary, saveRunSnapshot,
  manualReroll, canManualReroll, dealEnhancedOffers, speedBuffLeft, grantSpeedBuff,
  graceAvailable, continueRun, isFirstSession, seedScriptedOpening, applyRules,
  dropOffer, canDropAt, columnTop, repairAll, repairAllCost, canRepairAll, canAffordShape, sellBlock,
  upgradeBlock, upgradeCostAt, seedTutorialRankGold, spanW, spanH,
  blockCount, CONTINUE_WOOD, CONTINUE_STONE, missingFor
} from '@/use/useTowerGame'
import { denyPurchase } from '@/use/useResourceBlink'
import { idleNudge, noteBuildAction, useIdleNudge } from '@/use/useIdleNudge'
import { isStranded, requestRejectFlash, strandedCount } from '@/use/useWorldCues'
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
import { awaitingFirstInteraction } from '@/use/useFirstInteraction'
import useTowerEconomy from '@/use/useTowerEconomy'
import useMissions, { beginMissionRun } from '@/use/useMissions'
import useAchievements from '@/use/useAchievements'
import useBattlePass from '@/use/useBattlePass'
import { blockDef, GATE_ID } from '@/game/blocks'
import { CLEAN_FEED } from '@/game/cleanFeed'
import { ENEMY_DEFS, enemyDef } from '@/game/enemies'
import { SHAPE_BY_ID } from '@/game/shapes'
import { earlyCallBonus } from '@/game/waves'
import { spriteFor } from '@/game/art'
import type { Block } from '@/game/types'

import { getState, setState } from '@/use/useTowerState'
import { M2_DROP_LEARNED_KEY, M2_MERGE_GUIDE_KEY, M2_ONBOARDED_KEY, M2_TUTORIAL_KEY } from '@/keys'
import useSounds, { useMusic } from '@/use/useSound'
import { useScreenshake } from '@/use/useScreenshake'
import { isGamePaused, isAdShowing, acquireAppPause } from '@/use/useGamePause'
import { windowWidth, windowHeight, isCrazyWeb } from '@/use/useUser'
import { isFullscreen, installFullscreenWatch } from '@/use/useFullscreen'
import { spawnCoinExplosion } from '@/use/useCoinExplosion'
import { isInterstitialReady, showMidgameAd } from '@/use/useAds'
import {
  claimReward, canOfferReward, adInFlight, isRewardCoinPriced, canShowInterstitial,
  markInterstitialShown
} from '@/use/useAdGate'
import { signalGameplayLoaded } from '@/use/useCrazyGames'
import { syncGameplayLifecycle } from '@/use/useGameplayLifecycle'
import { isAnyModalOpen } from '@/use/useModalState'
import { playFirstStartInterstitial } from '@/use/useFirstStartInterstitial'
import { initDeviceTier, type RenderProfile } from '@/use/useDeviceTier'
import {
  reportRun, rankFor, playerTotal, leaderboardEnabled, leaderboardPending
} from '@/use/useLeaderboard'
import { perf } from '@/use/usePerfProbe'
import { debugSetWave } from '@/use/useTowerGame'

import {
  DROPMERGE_RULES, BOARD_HALF_WIDTH, BOARD_MAX_ROW, SKY_ROWS, GROUND_ROWS, LANE_CELLS, STONE_FOLD
} from './rules'
import { DROPMERGE_ROSTER } from './roster'
import { PIECE_BLOCK_IDS } from './pieces'
import {
  COACH_MARK_LAST_WAVE, WELD_AFTER_DROP_MS, firstBeatIndex, mergeLessonSeenFromSave,
  shouldOpenMergeLesson, shouldReplayDropLesson, shouldRetireCoachMarks
} from './coachMarks'

import TopStrip from './components/TopStrip.vue'
import DropTray from './components/DropTray.vue'
import BlockCard from './components/BlockCard.vue'
import ShapeTile from '@/components/game/ShapeTile.vue'
import WaveBar from './components/WaveBar.vue'
import BlueprintsModal from './components/BlueprintsModal.vue'
import { markTechFound, refreshTechFound, techNudge } from '@/use/useTechDiscovery'
import RotateOverlay from './components/RotateOverlay.vue'
import ControlHint, { type HintId } from '@/components/game/ControlHint.vue'
import WaveClearToast from '@/components/game/WaveClearToast.vue'
import TutorialOverlay, { type TutorialStep } from '@/components/game/TutorialOverlay.vue'
import TutorialHand from '@/components/game/TutorialHand.vue'
import { useAutoHand, type HandPoint } from '@/use/useAutoHand'
import type { DimBox } from '@/components/game/dimRects'
import DropDemo from './components/DropDemo.vue'
import MergeGuide from '@/components/game/MergeGuide.vue'
import MergePowerDemo from '@/components/game/MergePowerDemo.vue'
import { readTutorialCheat, type TutorialCheat } from '@/use/useTutorialCheat'
import IncomingBanner from '@/components/game/IncomingBanner.vue'
import FReward from '@/components/atoms/FReward.vue'
import FRewardButton from '@/components/atoms/FRewardButton.vue'
import FMuteButton from '@/components/atoms/FMuteButton.vue'
import FHudButton from '@/components/atoms/FHudButton.vue'
import MissionsModal from '@/components/organisms/MissionsModal.vue'
import TreasureChest from '@/components/organisms/TreasureChest.vue'
import FlyingChest from '@/components/game/FlyingChest.vue'
import GiftTile from '@/components/game/GiftTile.vue'
import { nextGift, reloadGifts } from '@/use/useGifts'
import OptionsModal from '@/components/organisms/OptionsModal.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import RebuiltGlyph from '@/components/game/RebuiltGlyph.vue'
import IconWood from '@/components/icons/IconWood.vue'
import ResultUpgradeButton from '@/components/game/ResultUpgradeButton.vue'

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

/** Scripted autoplay, installed only under a bench flag — see `benchDriver.ts`. */
let benchStep: ((dtMs: number) => void) | null = null

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
  // A clean feed has no strip and no tray on screen, but both still have their
  // boxes (the recorder hides the HUD with `visibility: hidden`, so nothing
  // reflows mid-take). Measuring them would park the board in a band with dead
  // space above and below it; the whole screen is the free band instead.
  // `src/game/cleanFeed.ts` — DEV only, and false in every portal build.
  const top = CLEAN_FEED ? 0 : (stripEl()?.getBoundingClientRect().bottom ?? 0)
  const bottom = CLEAN_FEED ? cssH : (bottomRef.value?.getBoundingClientRect().top ?? cssH)
  const freeH = Math.max(120, bottom - top)
  const cols = BOARD_HALF_WIDTH * 2 + 1 + LANE_CELLS * 2
  // One row of sky in a clean feed rather than two. With the HUD gone the
  // frame is the whole screen, and two rows of empty sky over a board that
  // rarely fills its own seven rows leaves the game sitting small in the
  // bottom third of a preview clip. Recording only — see `src/game/cleanFeed.ts`.
  let sky = CLEAN_FEED ? 1 : SKY_ROWS
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
/**
 * Where the camera opens: a quarter out from the fitted frame.
 *
 * The fit is the largest the board can be drawn at, and it spends every spare
 * pixel on the board itself — which is the one part of the screen where
 * nothing ever surprises the player. A quarter out costs a little cell size
 * and buys the flanks and the sky back, so the opening wave is visible walking
 * in rather than arriving already at the wall. That matters here more than it
 * would anywhere else, because this board calls its first wave as soon as the
 * game has loaded.
 *
 * The player still owns the control: the rail runs from here in both
 * directions, and `resetZoom` returns to the fit.
 */
const ZOOM_START = 0.75
/** 1 is the fitted frame; below it the board shrinks and the world widens. */
const zoomLevel = ref(ZOOM_START)
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

/**
 * Has the player moved the view off the opening one?
 *
 * Measured against `ZOOM_START`, not the fit: the recenter button restores the
 * DEFAULT view, and a button that is already lit on the first frame reads as
 * something the player is supposed to fix.
 */
const zoomMoved = computed(() => Math.abs(zoomLevel.value - ZOOM_START) > 0.001)

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
  if (!zoomMoved.value) return
  setZoom(ZOOM_START)
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

/**
 * A frame-counted benchmark runs the clock off the frame counter, not the
 * wall: one nominal 60 Hz tick per rendered frame, whatever the frame actually
 * cost. Two variants then step the simulation identically and the only thing
 * that differs between them is how long the frames took — which is the thing
 * being measured. Zero outside `?benchframes=`, and the branch folds to a
 * constant comparison the JIT hoists out of the loop.
 */
const FIXED_BENCH_DT = perf.benchFrames > 0 ? 1000 / 60 : 0

const loop = (t: number): void => {
  rafId = requestAnimationFrame(loop)
  const dt = FIXED_BENCH_DT || (lastT ? Math.min(t - lastT, 120) : 16)
  lastT = t
  perf.beginFrame(t)

  // The pause gate covers ads, hidden tabs and platform pauses; the rotate
  // overlay and the result screen hold the clock as well.
  perf.phase('update')
  // In a clean feed the result screen and the teaching cards are hidden — but
  // each of them HOLDS THE CLOCK, and a held clock in a recording is a frozen
  // frame nobody can explain. Recording only.
  if (!isGamePaused.value && !rotateBlocked.value
    && (CLEAN_FEED || (!showResult.value && !showMergeGuide.value
      && !showMergePower.value && !handLessonHold.value))) {
    if (benchStep) benchStep(dt)
    step(dt)
  }

  // On the low tier every second frame is skipped; the VFX get the accumulated
  // time so motion stays honest.
  frameNo++
  drawAccum += dt
  if (frameNo % profile.drawEvery !== 0) {
    perf.endFrame()
    return
  }
  if (ctx) {
    updateEdgeArrows()
    perf.phase('render')
    // Drawn even when the simulation is held: the effects keep their own
    // time, so the Gate's collapse dust settles (see the desktop scene).
    drawScene(ctx, cssW, cssH, drawAccum, dpr)
  }
  drawAccum = 0
  perf.endFrame()
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
/**
 * The block whose card is open (`BlockCard`: rank up, sell), or null.
 *
 * Shallow: the simulation's blocks are plain objects it mutates in place, and a
 * deep ref would hand the card a reactive proxy of one — compared against the
 * simulation's own object it is never `===`, and the card's numbers are kept
 * fresh by `towerVersion` anyway.
 */
const inspected = shallowRef<Block | null>(null)

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
  // Whatever happens next, the player has aimed at the board — the lesson has
  // been understood and the ghost gets out of the way.
  cancelDropNudge()
  // A piece the player cannot pay for is refused OUT LOUD, in the place the
  // answer lives: the short piles blink in the strip and a knock plays. See
  // `useResourceBlink` for why a silent no was the bug.
  const shapeId = offers.value[slot]
  if (shapeId && denyPurchase(missingFor(shapeId))) return
  if (!dropOffer(slot, c)) {
    playSound('obstacle-hit', 0.03)
    // Shown as well as heard: every column that would take the piece flashes
    // its landing cell green (`drawBuildOverlay`).
    requestRejectFlash()
    return
  }
  playFx('uiTap')
  markHintDone('dropBlock')
  // ANY drop teaches the drop — this column or another, a tap or a drag. The
  // beat only asks for the gesture; the lit column is a suggestion.
  learnDrop()
  lastDropAt = performance.now()
  completeTutorialStep('drop')
  noteBuildAction()
  // The slot STAYS armed, even when the piece that refilled it is unaffordable.
  //
  // It used to disarm, on the reasoning that the player would otherwise be
  // holding something they could not drop. What that produced was a player
  // who had just run out of materials hammering the column they were building,
  // every tap now doing nothing and saying nothing — nothing was armed any
  // more. Armed, the next tap is refused loudly, and once a kill's payout
  // lands the same tap drops the piece, which is what the hammering meant.
  if (!offers.value[slot]) selectedSlot.value = null
}

const onSelectSlot = (slot: number | null): void => {
  cancelHandPreview()
  // TRAY TAPS WITH NO BOARD TOUCH BETWEEN THEM: a player who has not
  // understood where the first tap sent the piece.
  //
  // Measured, 2026-09-11: P10 tapped the lit card three times, then spent
  // about seventy seconds tapping tray cards before it tried the lane at 83 s
  // — and credited the merge chart that eventually followed to "tapping the
  // tower". Every one of those taps armed or disarmed a card and answered with
  // nothing, because from the tray's point of view nothing was wrong.
  //
  // Counted rather than triggered on the second tap, because one tap to change
  // your mind about which piece to hold is an ordinary thing to do and must
  // not be nagged at. Three is the count that playtest actually produced.
  //
  // And the answer is the lesson, not a rule: the ghost lifts off the card the
  // player pressed and rides into a column it would really land in, with the
  // landing cells flashing under it. Shown, never performed — a tray tap that
  // silently dropped the piece would put pieces where players did not mean them.
  trayTapsSincePlay++
  const lesson = shouldReplayDropLesson({
    taps: trayTapsSincePlay,
    armed: slot != null,
    step: tutorialStep.value
  })
  if (lesson && slot != null) showDropNudge(slot)
  else hideDropNudge()
  selectedSlot.value = slot
  inspected.value = null
  if (slot == null) return
  // Armed even when it cannot be paid for yet (see `tryDrop`) — but the tap
  // that armed it is told why it will not go in, rather than finding out on
  // the column.
  const shapeId = offers.value[slot]
  if (shapeId && denyPurchase(missingFor(shapeId))) return
  playFx('uiTap')
}

// ─── Idle nudge ─────────────────────────────────────────────────────────────
//
// Fifteen seconds of nothing built while something in the hand is affordable,
// and the affordable tiles pulse until the next drop (`useIdleNudge`). The
// clock only runs while the game is actually in front of the player — the
// tutorial finished, no card, modal, ad, rotate prompt or open menu — so it
// measures their idleness, not the time the game spent waiting on something
// else.
useIdleNudge({
  eligible: () => tutorialOver.value && isLiveGameplay.value
    && !isGamePaused.value && !menuOpen.value,
  anyAffordable: () => offers.value.some((id) => canAffordShape(id))
})

// The tray reports a PRESS; whether it was a tap (arm the piece) or a drag
// (carry it to a column) is decided here from how far the finger travels.
const DRAG_SLOP_PX = 10
let dragSlot: number | null = null
let dragStart = { x: 0, y: 0 }
let dragMoved = false
/**
 * A finger is on the tray or the board. The drop demo stands down while one
 * is — a ghost gliding across the screen under the player's own drag is two
 * pieces moving where there should be one.
 */
const handDown = ref(false)

/**
 * The piece being carried, drawn under the finger — viewport px, or null.
 *
 * The drag always worked, but nothing MOVED: the card stayed in the tray and
 * the only answer to the finger was a faint column tint on the board. The drop
 * beat's demo shows a piece riding the finger up into the column, so a player
 * who copied it and saw nothing follow them concluded that dragging was not a
 * thing this game does, and went back to tapping. The carried piece is the
 * demo's ghost made real.
 */
const dragGhost = ref<{ x: number; y: number } | null>(null)
const dragGhostStyle = computed(() => {
  const g = dragGhost.value
  return g ? { left: `${Math.round(g.x)}px`, top: `${Math.round(g.y)}px` } : undefined
})

/** Is the finger back over the tray? Letting go there puts the piece back
 *  instead of dropping it into whichever column it happens to be level with. */
const overTray = (clientY: number): boolean => {
  const top = bottomRef.value?.getBoundingClientRect().top
  return top != null && top > 0 && clientY >= top
}

const onDragMove = (e: PointerEvent): void => {
  if (dragSlot == null) return
  if (!dragMoved && Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y) > DRAG_SLOP_PX) {
    dragMoved = true
    // A drag IS the gesture the ghost was demonstrating.
    cancelDropNudge()
    selectedSlot.value = dragSlot
    inspected.value = null
  }
  if (!dragMoved) return
  dragGhost.value = { x: e.clientX, y: e.clientY }
  armedColumn.value = overTray(e.clientY) ? null : columnAt(e.clientX)
}

const endDrag = (): void => {
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
  window.removeEventListener('pointercancel', onDragEnd)
  dragSlot = null
  dragGhost.value = null
  handDown.value = false
}

const onDragEnd = (e: PointerEvent): void => {
  const slot = dragSlot
  endDrag()
  if (slot == null) return
  // While a coach mark is teaching with this card, the card stays in the hand
  // whatever the gesture did: toggling it out would leave the lit column with
  // nothing to drop, and the beat with no way to be finished.
  const teaching = tutorialStep.value === 'drop' || tutorialStep.value === 'merge'
  if (!dragMoved) {
    onSelectSlot(selectedSlot.value === slot && !teaching ? null : slot)
    return
  }
  // A cancel is the browser taking the gesture over, not the player letting
  // go somewhere — nothing is dropped on it.
  const c = e.type === 'pointercancel' || overTray(e.clientY) ? null : columnAt(e.clientX)
  armedColumn.value = null
  if (c != null) tryDrop(slot, c)
  else if (!teaching) selectedSlot.value = null
}

const onTilePress = (slot: number, e: PointerEvent): void => {
  dragSlot = slot
  dragStart = { x: e.clientX, y: e.clientY }
  dragMoved = false
  handDown.value = true
  // Captured to the card for the whole gesture, mouse as well as touch (touch
  // captures implicitly; a mouse does not), so the lift is always delivered
  // however far the finger travelled and whatever it crossed on the way.
  const tile = (e.target as Element | null)?.closest?.('button')
  try { tile?.setPointerCapture(e.pointerId) } catch { /* ignore */ }
  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', onDragEnd)
  window.addEventListener('pointercancel', onDragEnd)
}

// ─── Canvas pointer ─────────────────────────────────────────────────────────
//
// A TAP ON A BLOCK is the block's: it opens its card (`BlockCard` — rank it up,
// sell it), whether or not a piece is in hand. Everywhere else, a piece in
// hand owns the board: press on open sky or ground and the column under the
// finger lights, lift and the piece drops there — and a press that SLIDES is
// aiming, wherever it started, blocks included. The piece stays in hand while
// a card is open, so the next tap on open space still drops it.
//
// It used to be that a piece in hand owned every tap, blocks and all, and the
// only way to a block was a long-press with nothing armed. The hand re-arms
// after every drop, so "nothing armed" almost never happened: a player could
// not sell the piece they had just dropped by mistake — the one undo a merge
// board has — and ranks, the run's gold sink, had no door at all.
//
// The coach marks teaching the drop are the exception: in their lit column
// every tap drops. The merge beat's column is the fort's own, and its lesson
// is precisely "drop the twin ON the block".
//
// Holding on a block opens the same card without waiting for the lift.

const LONG_PRESS_MS = 450
let pressing = false
let pressStart = { x: 0, y: 0 }
let pressMoved = false
let longPressTimer: ReturnType<typeof setTimeout> | null = null
/** The block this press started on, when a tap there would open its card. */
let pressBlock: Block | null = null

const clearLongPress = (): void => {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
}

const blockAtScreen = (clientX: number, clientY: number): Block | null => {
  const c = Math.round(screenToWorldX(clientX))
  const r = Math.floor(screenToWorldY(clientY))
  return getBlocks().get(`${c},${r}`) ?? null
}

/** A coach mark is teaching the drop, and every tap in its column is one. */
const teachingDrop = (): boolean =>
  tutorialStep.value === 'drop' || tutorialStep.value === 'merge'

/**
 * Set when a long-press opened the card, so the lift that ends that same press
 * is not ALSO read as a tap — or as a drop into the column it happened over.
 */
let inspectPressFired = false

/** Open the card on `b`. The piece in hand, if any, stays there. */
const inspectBlock = (b: Block): void => {
  armedColumn.value = null
  const same = inspected.value?.uid === b.uid
  inspected.value = b
  if (!same) playSound('modal-open', 0.05)
}

/** Start the long-press that opens the card on `b`. */
const armInspectPress = (b: Block): void => {
  longPressTimer = setTimeout(() => {
    longPressTimer = null
    if (pressMoved) return
    inspectPressFired = true
    inspectBlock(b)
  }, LONG_PRESS_MS)
}

// ─── Pinch ──────────────────────────────────────────────────────────────────
//
// Two fingers on the board is always a zoom, never a drop. The second finger
// therefore CANCELS whatever the first one had started — an armed column, a
// long-press heading for the block card — and `pinched` keeps the release
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
  pressBlock = null
  inspected.value = null
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
  handDown.value = true
  // A finger on the BOARD is the thing the ghost was asking for, whatever it
  // goes on to do there.
  cancelDropNudge()
  if (touches.size >= 2) {
    beginPinchGesture()
    return
  }
  pressing = true
  pressStart = { x: e.clientX, y: e.clientY }
  pressMoved = false
  inspectPressFired = false
  clearLongPress()

  const b = teachingDrop() ? null : blockAtScreen(e.clientX, e.clientY)
  pressBlock = b
  // A press anywhere else closes the card; a press on its own block leaves it
  // up, so tapping the block again does not blink it shut and open again.
  if (inspected.value && inspected.value.uid !== b?.uid) inspected.value = null
  if (b) {
    armInspectPress(b)
    return
  }
  if (selectedSlot.value != null) armedColumn.value = columnAt(e.clientX)
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
  // A slide with a piece in hand is aiming, even one that started on a block.
  if (selectedSlot.value != null && (pressMoved || !pressBlock) && !inspectPressFired) {
    armedColumn.value = columnAt(e.clientX)
  }
}

const onCanvasUp = (e: PointerEvent): void => {
  touches.delete(e.pointerId)
  if (touches.size === 0) handDown.value = false
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
  const b = pressBlock
  pressBlock = null
  // This press became a long-press that opened the card; lifting the finger
  // is the end of that gesture, not a tap and not a drop.
  if (inspectPressFired) {
    inspectPressFired = false
    armedColumn.value = null
    return
  }
  if (e.type === 'pointercancel') {
    armedColumn.value = null
    return
  }
  // A tap on a block opens its card, piece in hand or not.
  if (b && !pressMoved) {
    inspectBlock(b)
    return
  }
  if (selectedSlot.value == null) return
  const c = armedColumn.value ?? columnAt(e.clientX)
  armedColumn.value = null
  if (c != null) tryDrop(selectedSlot.value, c)
}

/** Sell the block the card is open on. The card closes either way — after a
 *  sale there is no block left for it to be about. */
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
 * Buy one rank on the block the card is open on.
 *
 * The card stays OPEN: the purchase's only feedback is its numbers moving and
 * the rank pip lighting, and closing over that moment throws it away. Short of
 * gold, the press is refused the way a piece is — the gold pile blinks and a
 * knock plays (`useResourceBlink`) — rather than by a dead button.
 */
const onUpgradeInspected = (): void => {
  const b = inspected.value
  if (!b) return
  const cost = upgradeCostAt(b.c, b.r)
  if (!Number.isFinite(cost)) return
  if (denyPurchase(runCoins.value < cost ? ['coins'] : [])) return
  if (!upgradeBlock(b.c, b.r)) {
    playSound('obstacle-hit', 0.03)
    return
  }
  completeTutorialStep('rankUp')
  playSound('level-up', 0.05)
  noteBuildAction()
}

/** The card's rough size, for keeping it on screen before it has laid out. */
const CARD_W = 152
const CARD_H = 170

/**
 * Where the card sits: above the block, or below it when the block is too
 * near the top of the band for the card to fit — and slid sideways so a block
 * in an edge column does not push half the card off the screen.
 *
 * The overlays live inside the band BELOW the top strip, so a viewport
 * coordinate has the strip's height subtracted. Placed at the viewport value
 * the card sat one strip lower — over the block itself — and the finger
 * lifting off a long-press landed on the button it had just opened.
 */
const cardStyle = computed(() => {
  const b = inspected.value
  void towerVersion.value
  if (!b) return {}
  const vw = typeof window === 'undefined' ? 390 : window.innerWidth
  const half = CARD_W / 2 + 8
  const x = Math.max(half, Math.min(vw - half, worldToScreenX(b.c)))
  const above = worldToScreenY(b.r + 1) - 8 - band.value.top
  if (above >= CARD_H) {
    return { left: `${Math.round(x)}px`, top: `${Math.round(above)}px`, translate: '-50% -100%' }
  }
  const below = worldToScreenY(b.r) + 8 - band.value.top
  return { left: `${Math.round(x)}px`, top: `${Math.round(below)}px`, translate: '-50% 0' }
})

// The card follows its block: closed the moment the block is gone — destroyed,
// sold, or welded into its twin — and ringed on the board while it is up.
watch(towerVersion, () => {
  const b = inspected.value
  if (b && getBlocks().get(`${b.c},${b.r}`)?.uid !== b.uid) inspected.value = null
  // A weld lost while its own lesson is up — the wave is held, but a cascade
  // can still fold it into a deeper one — leaves the arc pointing at nothing.
  // Retire it rather than dim the screen around an empty cell.
  const step = tutorialStep.value
  if ((step === 'inspectMerged' || step === 'rankUp') && !mergedBlock()) {
    completeTutorialStep(step)
  }
})
watch(inspected, (b) => {
  setBuildOverlay({ inspectC: b?.c ?? null, inspectR: b?.r ?? null })
  // The `inspectMerged` beat IS this: the card, open on a weld. Only the weld
  // is reachable while the beat is up (the dim eats everything else), so any
  // welded block arriving here is the one that was pointed at.
  if (b && (b.tier ?? 1) > 1) completeTutorialStep('inspectMerged')
})

/**
 * Where a piece in hand would come to rest, column by column — and what it
 * would weld into there (`previewDropMerge`).
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
    const valid = canDropAt(c, cells)
    guides.push({
      c,
      r: Math.min(BOARD_MAX_ROW, columnTop(c) + 1),
      valid,
      merges: valid ? previewDropMerge(shapeId, c) : []
    })
  }
  return guides
}

/** The piece in hand, as a shape id. */
const armedShape = computed(() =>
  selectedSlot.value != null ? offers.value[selectedSlot.value] : undefined
)

/**
 * The guides, cached against what they depend on: the piece in hand, the tower
 * and the phase.
 *
 * A computed rather than part of the overlay watcher, because that watcher also
 * fires on every column a dragging finger crosses, and none of that changes
 * where anything lands. The hand is read through `offers`, so a slot that stays
 * armed across a drop picks up the piece that refilled it — and `columnTop`
 * counts the piece still falling, which the preview lands first.
 */
const dropGuides = computed(() => {
  void towerVersion.value
  void phase.value
  return dropGuidesFor(armedShape.value)
})

// The overlay is the renderer's copy of the input state.
watch([armedShape, armedColumn, dropGuides, phase], () => {
  const c = armedColumn.value
  const id = armedShape.value
  setBuildOverlay({
    selectedShape: null,
    slots: [],
    aimX: null,
    dropColumn: c,
    dropValid: c != null && canDropAt(c, cellsOf(id)),
    dropRows: BOARD_MAX_ROW,
    dropGuides: dropGuides.value,
    // WHAT would drop, drawn in the cell it would take: faint in every open
    // column, solid under the finger before it lifts (see `BuildOverlay`).
    dropShape: id ?? null,
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

/**
 * Where the enemies nothing on the board can reach are standing, if there are
 * any — the flank the volley should come down on instead of the denser one.
 *
 * While such an enemy is on the field the Volley pulses as ITS answer (and the
 * enemy wears a crossed-out crosshair, see `useWorldCues`), so the volley has
 * to keep that promise: aiming at the bigger crowd on the other flank would
 * teach the player the pulse was lying.
 */
const strandedFlank = (): number | null => {
  let sum = 0
  let n = 0
  for (const e of getEnemies()) {
    if (e.dying > 0 || !isStranded(e.uid)) continue
    sum += e.x
    n++
  }
  if (n === 0) return null
  const mean = sum / n
  const side = mean < 0 ? -1 : 1
  return side * Math.max(BOARD_HALF_WIDTH + 1.5, Math.min(BOARD_HALF_WIDTH + 4.5, Math.abs(mean)))
}

/** An enemy stands where nothing reaches it and the Volley is loaded: pulse the
 *  Volley, because it is the one thing on the board that does reach. */
const volleyUrgent = computed(() =>
  arrowRainReady.value && phase.value === 'battle' && strandedCount.value > 0
)

const onVolley = (): void => {
  if (!arrowRainReady.value || phase.value !== 'battle') {
    playSound('obstacle-hit', 0.03)
    return
  }
  if (!callArrowRain(strandedFlank() ?? denserFlank())) {
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
// Not `runCoins >= repairCost` any more. `repairAll` spends most-damaged-first
// and stops when the purse does, so a player who can afford SOME of the bill
// gets the blocks that matter most patched — gating the button on the full
// total left the one player who most needed it staring at a dead control.
const canRepair = computed(() => {
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
  selectedSlot.value = null
  inspected.value = null
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

/**
 * The deepest weld standing — what the rank arc teaches on.
 *
 * Deepest rather than first, so the beat points at the block the player is
 * proudest of and the one a rank is worth most on. Null when a bat ate it
 * between beats, which every caller treats as "there is nothing to teach here".
 */
const mergedBlock = (): Block | null => {
  void towerVersion.value
  let best: Block | null = null
  for (const b of getTowerBlocks().values()) {
    if ((b.tier ?? 1) <= 1) continue
    if (!best || (b.tier ?? 1) > (best.tier ?? 1)) best = b
  }
  return best
}

const activeHint = computed<HintId | null>(() => {
  // Never over the coach marks: they are deliberately wordless, and a hint
  // bubble is the one thing on screen that would put copy back on them.
  if (onboarded.value || showResult.value || isAnyModalOpen.value) return null
  if (tutorialStep.value) return null
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
// Two beats: drop, then merge. The merge beat deals a cannon into the weapon
// slot so the twin of the fort's cannon is in the player's hand.
//
// Wordless and unskippable, like the desktop board's — it starts on the first
// frame with no offer to accept, carries no copy and no buttons, and each beat
// ends only when the player performs it. Everything outside the lit column and
// the armed card is inert while it is up, so there is nothing else to do but
// the lesson — and `DropDemo` plays that lesson for them on a loop, since a
// lit column alone never said what it was lit FOR.
//
// There is no third "call the wave" beat here, unlike the desktop board. This
// one calls its own opening wave the moment the game has loaded, so the wave is
// already walking in — and a coach mark pointing at a Call Wave button that the
// battle has replaced with the speed switch is a step the player can never
// complete, which leaves the tutorial unfinished and therefore never recorded
// as done. What the beat taught is now taught by the game: the wave comes, and
// the button is there for the waves after it.
//
// The pictogram is the third beat and the power demo the fourth; after them
// comes the RANK ARC, the same three beats the desktop board teaches — open the
// weld's card, buy it a rank, then watch the hand buy one for the Gate. It is
// here for the same reason it is there: the 2026-09-11 blind playtest found the
// upgrade tree late or never, and the Gate — the one block whose loss ends the
// run — was never read as a block you can spend on at all. Nothing about a
// board of five columns changes that.
//
// There is still no Call Wave beat at the end: this board calls its own opening
// wave, so the arc ends on the Gate's rank.
//
// It carries the `cell` ladder, not the desktop's. A weld here collapses back
// into ONE cell whatever its tier (`mergeArt: 'cell'`, `maxMergeTier:
// Infinity`), so the growing-rectangle picture the tower game shows would be a
// promise this board never keeps — and on five columns the belief the player
// actually needs is the opposite one: that a single cell is worth stacking
// twins into, because the frontage never grows however deep the gun goes.
const TUTORIAL_STEPS: TutorialStep[] = [
  'drop', 'merge', 'mergeGuide', 'mergePower', 'inspectMerged', 'rankUp', 'rankGate'
]

/** The three beats of the rank arc: open the weld, rank it, watch the Gate. */
const RANK_BEATS = new Set<TutorialStep>(['inspectMerged', 'rankUp', 'rankGate'])
const tutorialDone = ref(getState<boolean>(M2_TUTORIAL_KEY, false) === true)

/**
 * Has this player ever dropped a piece on this board? Set by the first drop of
 * any kind — see `tryDrop` — and never unset (short of the `?tut=reset`
 * hatch). A player who has done it is never walked through it again: a reload
 * or a new run starts the coach marks at the merge beat, and a stage that ends
 * with them unfinished retires them (the watcher below).
 */
const dropLearned = ref(getState<boolean>(M2_DROP_LEARNED_KEY, false) === true)
const learnDrop = (): void => {
  if (dropLearned.value) return
  dropLearned.value = true
  setState(M2_DROP_LEARNED_KEY, true)
}

const tutorialIndex = ref(firstBeatIndex(dropLearned.value, tutorialDone.value))
const tutorialRect = ref<DimBox | null>(null)
/** The drop beats' second window: the armed tray card (`TutorialOverlay`). */
const tutorialPassage = ref<DimBox | null>(null)
/** The cell the lesson's piece would land in — where the demo's ghost settles. */
const tutorialLanding = ref<DimBox | null>(null)
const tutorialTick = ref(0)
let tutorialTimer = 0

const inFirstStage = computed(() =>
  !tutorialDone.value
  // Through wave 2, not just wave 1. This board does not hold the clock for
  // the coach marks — a held clock over a merge beat whose partner a bat has
  // just eaten would never release — so the lesson simply ends when its stage
  // does. With the short early breaks wave 2 now arrives about ten seconds in,
  // which is a tight window for two beats; one more wave of room costs nothing,
  // since the fort holds wave 2 by itself.
  && wave.value <= COACH_MARK_LAST_WAVE
  && !showResult.value
  && !isAnyModalOpen.value
  // A rotate prompt owns the whole screen; a spotlight measured behind it
  // points at wherever the board happened to be before the turn.
  && !rotateBlocked.value
)

/**
 * The tutorial is behind this RUN: finished for good, or past the last wave its
 * coach marks can show on (`inFirstStage` above lets go after wave 2 without
 * marking the tutorial done).
 *
 * The flying chest and the idle nudge wait on THIS, not on `tutorialDone`. A
 * blind playtest (2026-09-11) had no phone player finish the drop beat, so
 * anything gated on the tutorial's completion was something no phone player
 * would ever meet. Past wave 2 the coach marks cannot come back this run, which
 * is the one thing those two features need to know.
 */
const tutorialOver = computed(() => tutorialDone.value || wave.value > COACH_MARK_LAST_WAVE)

/**
 * Show the game's premise over the opening frame.
 *
 * `bestWave` is the whole audience test — and it is this board's own record,
 * not the desktop tower's, so a player meeting the phone game for the first
 * time is told what it is even if they have played the other one. It leaves on
 * their first touch: this board's wave 1 is already walking in by then, so the
 * banner names the thing they are about to watch happen.
 */
const showIncoming = computed(() => bestWave.value === 0 && awaitingFirstInteraction.value)
const tutorialStep = computed<TutorialStep | null>(() => {
  if (!inFirstStage.value) return null
  return TUTORIAL_STEPS[tutorialIndex.value] ?? null
})

/**
 * The automatic hand is playing, so the wave stands still for it.
 *
 * Only for `rankGate`, and only because that beat is BOUNDED: it is three
 * seconds of script that ends on its own, with every touch on the screen taken
 * by the hand's layer. The two beats before it wait on the player and are
 * therefore left running, like every other coach mark on this board — a held
 * clock that waits on a tap nobody makes never releases, and the stage's own
 * expiry (`COACH_MARK_LAST_WAVE`) is what retires them instead.
 *
 * Read by the loop and by `isLiveGameplay`, exactly as the teaching cards are.
 */
const handLessonHold = computed(() => tutorialStep.value === 'rankGate')

/**
 * The Blueprints button's stage-2 nudge, held back while a coach mark is up.
 * This board keeps its coach marks through wave 2 — the same wave `techNudge`
 * starts on — and two yellow arrows on one screen point at nothing.
 */
const blueprintsNudge = computed(() => techNudge.value && tutorialStep.value === null)

/** The first empty column beside the fort, for the drop beat. */
const tutorialDropColumn = (): number => {
  void towerVersion.value
  for (const c of [-2, 2, -1, 1]) if (columnTop(c) < 0) return c
  return 2
}

/** Same rect, to the pixel? The poll re-measures four times a second and a
 *  fresh object every time would re-render the overlay and the demo for
 *  nothing. */
const sameBox = (a: DimBox | null, b: DimBox | null): boolean =>
  a === b || (!!a && !!b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h)

const setBox = (target: { value: DimBox | null }, next: DimBox | null): void => {
  if (!sameBox(target.value, next)) target.value = next
}

/** A DOM element's rect, or null while it is missing or not laid out yet. */
const elementBox = (sel: string): DimBox | null => {
  const b = document.querySelector(sel)?.getBoundingClientRect()
  if (!b || b.width <= 0) return null
  return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }
}

/** The tray card in `slot`, on screen, or null while the tray is not laid out. */
const trayTileRect = (slot: number | null): DimBox | null => {
  if (slot == null) return null
  const el = bottomRef.value?.querySelectorAll<HTMLElement>('.tray__tile')[slot]
  const b = el?.getBoundingClientRect()
  if (!b || b.width <= 0) return null
  return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }
}

/** The cell a piece dropped into column `c` would come to rest in, on screen. */
const landingRect = (c: number): DimBox => {
  const cell = getZoom()
  const r = Math.min(BOARD_MAX_ROW, columnTop(c) + 1)
  return {
    x: Math.round(worldToScreenX(c - 0.5)),
    y: Math.round(worldToScreenY(r + 1)),
    w: Math.round(cell),
    h: Math.round(cell)
  }
}

// ─── "Now tap a column", shown on demand ────────────────────────────────────
//
// The same ghost the coach marks use (`DropDemo`), played once outside them —
// see `onSelectSlot` for the moment it answers. It exists because the arm-then-
// tap gesture has no feedback of its own: an armed card looks exactly like an
// armed card whether the player understood where the next tap goes or not.

/** The one-shot replay: the card it lifts off, and the cell it lands in. */
const dropNudge = ref<{ shapeId: string; from: DimBox; to: DimBox } | null>(null)
let dropNudgeTimer = 0
/** Tray taps since the player last touched the BOARD — see `onSelectSlot`. */
let trayTapsSincePlay = 0

/** Take the ghost off the screen. Leaves the tap count alone — a player who
 *  disarms a card and arms another is still tapping the tray. */
const hideDropNudge = (): void => {
  if (dropNudgeTimer) { clearTimeout(dropNudgeTimer); dropNudgeTimer = 0 }
  if (dropNudge.value) dropNudge.value = null
}

/** The player touched the BOARD: the lesson is answered and the count starts
 *  again from there. */
const cancelDropNudge = (): void => {
  trayTapsSincePlay = 0
  hideDropNudge()
}

/**
 * Where the ghost goes: the deepest weld the piece could make, and failing
 * that the emptiest legal column. The same reading the guides already draw, so
 * the demo points at a cell the board is lighting anyway rather than at a
 * column of its own choosing.
 */
const nudgeColumn = (shapeId: string): number | null => {
  let best: { c: number; score: number } | null = null
  for (const g of dropGuidesFor(shapeId)) {
    if (!g.valid) continue
    const score = (g.merges?.[0]?.tier ?? 0) * 10 + (BOARD_MAX_ROW - g.r)
    if (!best || score > best.score) best = { c: g.c, score }
  }
  return best?.c ?? null
}

const showDropNudge = (slot: number): void => {
  const shapeId = offers.value[slot]
  const from = trayTileRect(slot)
  if (!shapeId || !from) return
  const c = nudgeColumn(shapeId)
  if (c == null) return
  hideDropNudge()
  // Counted from here: the lesson has been given once, so the next one needs
  // another three unanswered taps rather than following on the next one.
  trayTapsSincePlay = 0
  dropNudge.value = { shapeId, from, to: landingRect(c) }
  // The board answers in the same beat: every column that would take the piece
  // flashes its landing cell (`drawBuildOverlay`'s refused-drop flash — "not
  // there; HERE", which is exactly what a tap on the tray meant).
  requestRejectFlash()
  // Two loops of the ghost and it stands down. The player is being shown
  // something, not held up by it.
  dropNudgeTimer = window.setTimeout(hideDropNudge, 5_200)
}

const measureTutorialTarget = (): void => {
  const step = tutorialStep.value
  const teaching = step === 'drop' || step === 'merge'
  if (!teaching) {
    setBox(tutorialPassage, null)
    setBox(tutorialLanding, null)
  }
  if (!step) { tutorialRect.value = null; return }
  // The pictogram and the demo each own the whole screen; a hole cut in a card
  // with nothing reachable behind it is a dim layer over a dim layer.
  if (step === 'mergeGuide' || step === 'mergePower') { tutorialRect.value = null; return }
  const cell = getZoom()
  if (step === 'call') {
    setBox(tutorialRect, elementBox('.call-wave__btn'))
    return
  }

  // The weld itself, projected from world space. The hole covers its WHOLE
  // footprint: a block whose left half is the only live pixel on the screen
  // sends the player tapping a dim layer that does nothing.
  if (step === 'inspectMerged') {
    const b = mergedBlock()
    setBox(tutorialRect, b && {
      x: Math.round(worldToScreenX(b.c - 0.5)),
      y: Math.round(worldToScreenY(b.r + spanH(b))),
      w: Math.round(cell * spanW(b)),
      h: Math.round(cell * spanH(b))
    })
    return
  }

  // The rank button inside the card the beat before it opened. A null — the
  // card not laid out yet on the frame the beat flips — leaves the player in a
  // normal game for a frame rather than under a dim with no hole in it.
  if (step === 'rankUp') { setBox(tutorialRect, elementBox('.card__upgrade')); return }

  // Played by the automatic hand, not pointed at: no hole, no arrow, and its
  // own layer holds the player's touches while it demonstrates (`runGateDemo`).
  if (step === 'rankGate') { setBox(tutorialRect, null); return }
  // The drop and merge beats cut the hole over the WHOLE column: the dim layer
  // blocks every touch outside it, and a column is tapped anywhere along its
  // height. The piece itself is armed for the player when the beat starts
  // (see the watcher below) — and its tray card gets a window of its own, so
  // pressing it and dragging it up works too. That is the gesture every phone
  // player in the 2026-09-11 blind playtest reached for first, and under the
  // single-hole overlay it went dead against the dim.
  const c = step === 'drop' ? tutorialDropColumn() : 0
  setBox(tutorialRect, {
    x: worldToScreenX(c - 0.5),
    y: worldToScreenY(BOARD_MAX_ROW + 1),
    w: cell,
    h: cell * (BOARD_MAX_ROW + 1)
  })
  setBox(tutorialPassage, trayTileRect(selectedSlot.value))
  setBox(tutorialLanding, landingRect(c))
}

/**
 * Play the drop for the player, until they play it themselves.
 *
 * Only on the beats that hand the player a piece, only once both ends of the
 * trip are measured, and never under a finger — see `DropDemo`.
 */
const demoVisible = computed(() =>
  (tutorialStep.value === 'drop' || tutorialStep.value === 'merge')
  && tutorialRect.value != null
  && tutorialPassage.value != null
  && tutorialLanding.value != null
  && armedShape.value != null
  && !handDown.value
)

/**
 * Persist it. Called by the last beat completing — or by a stage that ended
 * with the beats unfinished after the player had dropped something (the
 * retire watcher below), or by the merge lesson arriving by its own door.
 */
const finishTutorial = (): void => {
  tutorialDone.value = true
  setState(M2_TUTORIAL_KEY, true)
  // Retiring early can leave the merge cards unshown. Say so in the save, so
  // the next boot does not read this as an old save that finished the whole
  // sequence (a done tutorial with no merge flag at all means exactly that).
  if (!mergeLessonSeen.value) setState(M2_MERGE_GUIDE_KEY, false)
}

const advanceTutorial = (): void => {
  tutorialIndex.value++
  if (tutorialIndex.value >= TUTORIAL_STEPS.length) finishTutorial()
}

const completeTutorialStep = (step: TutorialStep): void => {
  if (tutorialStep.value !== step) return
  advanceTutorial()
}

// ─── The Gate's rank, shown by the automatic hand ───────────────────────────
//
// The beat after the weld's rank, and the same script the desktop board plays.
// The player has just pressed Upgrade on their weld; the hand takes over from
// that button, taps the Gate — the card opens on it, exactly as the player's
// own tap would — and presses its Upgrade once. About three seconds, every tap
// in it real: the Gate really gains the rank.
//
// Paid for like the weld's lesson (`seedTutorialRankGold`): the purse is topped
// UP to the price, so the player finishes the beat where they started it.

const autoHand = useAutoHand()

const gateBlock = (): Block | null => {
  for (const b of getTowerBlocks().values()) if (b.typeId === GATE_ID) return b
  return null
}

/** The Gate's centre on screen — its whole footprint, however it was built. */
const gateOnScreen = (): HandPoint | null => {
  const g = gateBlock()
  if (!g) return null
  return {
    x: worldToScreenX(g.c - 0.5 + spanW(g) / 2),
    y: worldToScreenY(g.r + spanH(g) / 2)
  }
}

/** The card's Upgrade button, once the card has laid itself out. */
const upgradeButtonOnScreen = (): HandPoint | null => {
  const b = elementBox('.card__upgrade')
  return b ? { x: b.x + b.w / 2, y: b.y + b.h / 2 } : null
}

const runGateDemo = async (): Promise<void> => {
  const gate = gateBlock()
  // Nothing to show — no Gate, or already at the top rank: the beat retires,
  // as the weld's does when there is nothing to rank.
  if (!gate || seedTutorialRankGold(gate.c, gate.r) <= 0) {
    completeTutorialStep('rankGate')
    return
  }
  // From the button the player just pressed; from the lower middle when the
  // card has already gone.
  const start = upgradeButtonOnScreen()
    ?? { x: window.innerWidth * 0.5, y: window.innerHeight * 0.72 }
  const outcome = await autoHand.run([
    { kind: 'wait', ms: 350 },
    { kind: 'move', to: gateOnScreen, ms: 650 },
    {
      kind: 'press',
      ms: 180,
      then: () => {
        const g = gateBlock()
        if (g) inspectBlock(g)
      }
    },
    // The card re-renders for the Gate — and moves, since it is anchored on the
    // block — before the hand goes looking for its button.
    { kind: 'wait', ms: 420 },
    { kind: 'move', to: upgradeButtonOnScreen, ms: 550 },
    {
      kind: 'press',
      ms: 180,
      then: () => {
        const g = gateBlock()
        if (g && upgradeBlock(g.c, g.r)) playSound('level-up', 0.05)
      }
    },
    // Long enough to see the Gate's numbers move on the card.
    { kind: 'wait', ms: 800 }
  ], start)
  // Cancelled: the beat was taken away and plays again from the top when it
  // comes back.
  if (outcome === 'cancelled') return
  // Done — or a target that never appeared, which must not strand a tutorial
  // with no Skip button anywhere in it: either way the lesson is over.
  inspected.value = null
  completeTutorialStep('rankGate')
}

/** The merge beat's piece: a twin of the fort's cannon, in hand. */
const armMergePiece = (): void => {
  if (!offers.value.some((id) => id === 'b_cannon')) {
    offers.value = offers.value.map((id, i) => (i === 1 ? 'b_cannon' : id))
  }
  const at = offers.value.indexOf('b_cannon')
  if (selectedSlot.value !== at) selectedSlot.value = at
}

// Each beat arms the piece it is about to teach with, so the only thing left
// to do is tap the lit column. The merge beat also needs a twin in the hand —
// a cannon, like the fort's — and puts one in the weapon slot.
//
// `immediate`, and it has to be. The first beat is live on the very first
// evaluation now that nothing has to be accepted first, so a watcher that only
// fired on a CHANGE would never arm the drop piece — leaving the player behind
// a dim layer whose one live column drops nothing, with no way out.
watch(tutorialStep, (step) => {
  // The hand only ever plays inside its own beat. Anything that takes the beat
  // away — the result screen, a turn to landscape — stops it where it is.
  if (step !== 'rankGate') autoHand.cancel()
  measureTutorialTarget()
  if (step === 'drop') {
    selectedSlot.value = 0
    return
  }
  if (step === 'merge') { armMergePiece(); return }
  if (!step || !RANK_BEATS.has(step)) return

  // Nothing may be in hand for the rank arc: a tap on a block opens its card,
  // but a piece still armed means the player who misses the weld drops a crate
  // on their own tower instead — and the beat can never be finished.
  selectedSlot.value = null
  armedColumn.value = null

  if (step === 'inspectMerged') {
    // A weld that has just been eaten leaves nothing to teach on; the beat
    // retires rather than pointing at a block that is not there.
    if (!mergedBlock()) completeTutorialStep('inspectMerged')
    return
  }
  // The tutorial buys the rank it is about to teach — see `seedTutorialRankGold`
  // for why a run this young cannot afford its own lesson. A zero back means
  // there is nothing to rank after all, and the beat retires rather than
  // pointing at a button that can never light up.
  if (step === 'rankUp') {
    const b = mergedBlock()
    if (!b || seedTutorialRankGold(b.c, b.r) <= 0) completeTutorialStep('rankUp')
    return
  }
  void runGateDemo()
}, { immediate: true })
watch(merged, (m) => { if (m) completeTutorialStep('merge') })

// The card has a window of its own now, so the cannon can be carried somewhere
// other than onto its twin — and a merge beat whose hand no longer holds a
// cannon could never be finished. Deal it again.
watch(offers, () => {
  if (tutorialStep.value === 'merge' && armedShape.value !== 'b_cannon') armMergePiece()
}, { deep: true })

// ─── The merge pictogram ────────────────────────────────────────────────────

/** Open exactly while its beat is live. `forcedMerge` is the replay hatch,
 *  kept as a separate OR so a replay cannot resurrect the coach marks. */
const forcedMerge = ref(false)

// The ladder and the demo are beats of the coach-mark sequence, and a
// sequence that retires early (see `dropLearned`) never reaches them. So they
// also have a door of their own: the first weld the player's own drop makes on
// this board, if they have not been shown the pair here yet. They hold the
// clock exactly as they do as beats — `showMergeGuide`/`showMergePower` are
// what the loop and `isLiveGameplay` read.
const savedMergeGuide = getState<boolean | null>(M2_MERGE_GUIDE_KEY, null)
/**
 * The pair has been shown on this board. A save with the tutorial done and no
 * flag at all finished the whole sequence before this flag existed, so it saw
 * both cards; an early retirement writes an explicit `false` (`finishTutorial`)
 * so the two cases can be told apart.
 */
const mergeLessonSeen = ref(mergeLessonSeenFromSave(savedMergeGuide, tutorialDone.value))
const lessonMerge = ref(false)
const lessonPower = ref(false)
const markMergeLessonSeen = (): void => {
  mergeLessonSeen.value = true
  setState(M2_MERGE_GUIDE_KEY, true)
}

const showMergeGuide = computed(() =>
  forcedMerge.value || lessonMerge.value || tutorialStep.value === 'mergeGuide'
)

const onMergeGuideContinue = (): void => {
  if (forcedMerge.value) { forcedMerge.value = false; return }
  if (lessonMerge.value) {
    lessonMerge.value = false
    lessonPower.value = true
    return
  }
  completeTutorialStep('mergeGuide')
}

// ─── The merge power demo ───────────────────────────────────────────────────
//
// The ladder says welds keep going; this says why anyone would want them to.
// Four seconds, straight after the ladder: a plain cannon and a tier-3 one side
// by side, two volleys each at their own grumpling — one grumpling is left with
// most of its bar, the other is gone. It holds the wave clock exactly as the
// ladder does (see the loop and `isLiveGameplay`).

const forcedPower = ref(false)
const showMergePower = computed(() =>
  forcedPower.value || lessonPower.value || tutorialStep.value === 'mergePower'
)

const onMergePowerContinue = (): void => {
  if (forcedPower.value) { forcedPower.value = false; return }
  markMergeLessonSeen()
  if (lessonPower.value) {
    lessonPower.value = false
    // The lesson came by its own door: whatever the coach marks still had to
    // say has been said, by the player's own drop and weld.
    if (!tutorialDone.value && dropLearned.value) finishTutorial()
    return
  }
  completeTutorialStep('mergePower')
}

// ─── Spotting the player's own weld ─────────────────────────────────────────

/** `performance.now()` of the player's last successful drop (`tryDrop`). */
let lastDropAt = -Infinity

/**
 * How deep the tower's welds go, summed: every weld deepens one block by one
 * tier, so this rises by exactly one per weld, cascades included — and falls
 * only when a welded block is lost.
 */
const weldDepth = computed(() => {
  void towerVersion.value
  let depth = 0
  for (const b of getTowerBlocks().values()) depth += Math.max(0, (b.tier ?? 1) - 1)
  return depth
})

// Only a weld the player's own drop made opens the lesson — see
// `shouldOpenMergeLesson` for what else holds it back.
watch(weldDepth, (now, before) => {
  // The merge beat is performed by a weld — ANY weld the player's drop makes.
  // `merged` above only flips once per board, so a run that already had a
  // welded block standing could never have finished the beat by it.
  if (now > before && tutorialStep.value === 'merge'
    && performance.now() - lastDropAt <= WELD_AFTER_DROP_MS) {
    completeTutorialStep('merge')
    return
  }
  if (!shouldOpenMergeLesson({
    depthNow: now,
    depthBefore: before,
    seen: mergeLessonSeen.value,
    msSinceDrop: performance.now() - lastDropAt,
    cardUp: showMergeGuide.value || showMergePower.value || showResult.value,
    step: tutorialStep.value
  })) return
  lessonMerge.value = true
})

// ─── Retiring the coach marks ───────────────────────────────────────────────
//
// They used to re-arm on every run until all four beats had been performed in
// one sitting, and the stage lets go of them after wave 2 without recording
// anything — so a player who had built thirty blocks by their own route met
// the dimmed screen and the dead tray again on every new run and every reload.
// Now a stage that ends with them unfinished retires them for good, as long
// as the player has dropped something at least once: the drop is learned, and
// the merge cards still have their own door (above). A player who never
// dropped anything is shown the drop beat again next run.
watch([wave, dropLearned], ([w, learned]) => {
  if (shouldRetireCoachMarks({ tutorialDone: tutorialDone.value, dropLearned: learned, wave: w })) {
    finishTutorial()
  }
}, { immediate: true })

// ─── Tutorial replay ────────────────────────────────────────────────────────
//
// `?tut=merge` shows the ladder now, `?tut=power` the power demo, `?tut=reset`
// forgets the tutorial so the next run teaches it again. `trap` belongs to the
// desktop board — the collapse trick is a thing you do to a cantilevered tower,
// and this board has columns — so it is accepted and ignored rather than
// special-cased at the parser.

const replayTutorial = (what: TutorialCheat): void => {
  if (what === 'merge') { forcedMerge.value = true; return }
  if (what === 'power') { forcedPower.value = true; return }
  if (what !== 'reset') return
  setState(M2_TUTORIAL_KEY, false)
  setState(M2_DROP_LEARNED_KEY, false)
  setState(M2_MERGE_GUIDE_KEY, false)
  tutorialDone.value = false
  dropLearned.value = false
  mergeLessonSeen.value = false
  tutorialIndex.value = 0
}

// ─── Result flow ────────────────────────────────────────────────────────────
//
// The same ordering the desktop scene is graded on: the interstitial is
// requested and awaited BEFORE the result screen is revealed.

const twoXUsed = ref(false)
const summary = ref(runSummary())
const rewardCoinRef = ref<HTMLElement | null>(null)

// ─── Where this run leaves the player, globally ─────────────────────────────
//
// The lifetime best, not this run's score: the board is a table of bests, and
// ranking a single run against it would show a player their placing FALL after
// a bad game.
const bestScoreValue = computed(() => Math.max(progress.bestScore.value, summary.value.score))
const rankValue = computed(() => rankFor(bestScoreValue.value))
const rankPending = computed(() => leaderboardPending.value && rankValue.value === 0)
const showRank = computed(
  () => leaderboardEnabled && bestScoreValue.value > 0 && (rankPending.value || rankValue.value !== 0)
)
/** Built in script, not the template: `#{…}` is Pug's own interpolation, so a
 *  literal `#` in front of a mustache is a parse error, not a hash sign.
 *
 *  No "#100+" branch — `rankFor` has no sentinel to return. */
const rankDisplay = computed(() =>
  rankPending.value ? '…' : `#${rankValue.value.toLocaleString()}`
)
const RESULT_COIN_MULTIPLIER = 3
const RESULT_INTERSTITIAL_DELAY_MS = 600
const AD_GATE_SETTLE_TIMEOUT_MS = 30_000
const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** What a continue grants, in the one materials pile this board shows. */
const continueMaterials = CONTINUE_WOOD + Math.round(CONTINUE_STONE * STONE_FOLD)

/** Deaths before the 3× offer appears. See the desktop scene's note: `runs`
 *  is counted at run START, so the second defeat screen is the first to read 2. */
const RESULT_TWOX_MIN_DEATHS = 2

const twoXAvailable = computed(() =>
  !twoXUsed.value
  && summary.value.coins > 0
  && progress.runs.value >= RESULT_TWOX_MIN_DEATHS
  && canOfferReward.value
)

/** The wave a continue hands the tower back at: the last one actually beaten,
 *  which is the build phase the snapshot was taken in. Floored at 1. */
const continueWave = computed(() => Math.max(1, summary.value.wavesCleared))

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

// ─── The kill cam is gone ───────────────────────────────────────────────────
//
// It held the board for three seconds on the unit that struck the Gate's last
// blow. That answered "what killed me" for the blind playtest's agent testers;
// for a human it is three seconds of a dead screen at the exact moment they
// are deciding whether to go again. See the desktop scene's note.

const presentDefeat = async (): Promise<void> => {
  const s = runSummary()
  summary.value = s
  twoXUsed.value = false
  selectedSlot.value = null
  inspected.value = null
  stopBattleMusic()

  const run = { waves: s.wavesCleared, kills: s.kills, coins: s.coinsEarned, height: s.height, blocks: s.blocksPlaced }
  recordRun(run)
  recordAchievementRun(run)
  awardRunFinished()
  progress.recordRunEnd({
    wave: s.wave, kills: s.kills, score: s.score, wavesCleared: s.wavesCleared,
    height: s.height, blocks: s.blocks, blocksPlaced: s.blocksPlaced
  })
  // The board, from THIS board too. It was only ever wired on the desktop
  // scene, so every run played on a phone — which is every run Poki serves —
  // went unreported: the player never appeared on the leaderboard and never
  // saw a rank.
  //
  // Fire-and-forget, never awaited, and deliberately AFTER `recordRunEnd` so it
  // posts the lifetime best this run just updated rather than the one before
  // it. Awaiting would put a captive-portal login page between the player and
  // their result screen for the request's full 6 s timeout; `reportRun`
  // swallows every failure by contract.
  void reportRun(progress.bestScore.value, Math.max(s.wave, 1))

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

const beginRun = (): void => {
  startRun()
  if (isFirstSession()) seedScriptedOpening()
}

const startFreshRun = (): void => {
  beginMissionRun()
  showResult.value = false
  selectedSlot.value = null
  inspected.value = null
  resetVfx()
  resetDrawnFx()
  beginRun()
  progress.recordRunStart()
  layoutFrame()
  startBattleMusic()
}

const onRebuild = (): void => {
  if (adInFlight.value) return
  startFreshRun()
}

const onUpgrade = (): void => {
  if (adInFlight.value) return
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
    inspected.value = null
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
  // The tree is FOUND the moment it opens, by whatever route — the HUD button,
  // or the defeat screen's Upgrade button. Watching the modal rather than
  // marking it at each call site is deliberate: there are already two ways in,
  // and a third added later would otherwise leave the nudge bouncing at a
  // player who is looking straight at the screen it points to.
  if (open) { markTechFound(); return }
  blueprintsIntro.value = false
  if (wasOpen && phase.value === 'defeat') showResult.value = true
})

watch(phase, (p, prev) => {
  if (p === 'defeat' && prev !== 'defeat') void presentDefeat()
  if (p === 'battle' && prev === 'build') {
    startBattleMusic()
    inspected.value = null
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

// Coin-priced builds preview before they charge: the first tap flips the hand
// gold in place and turns the button into a tick, the second tap pays. See the
// desktop scene's `onEnhancedHand` for the rerun finding behind it.
const HAND_PREVIEW_MS = 4000
const handPreview = ref(false)
let handPreviewTimer = 0
const cancelHandPreview = (): void => {
  window.clearTimeout(handPreviewTimer)
  handPreview.value = false
}
const trayEnhanced = computed(() => (handPreview.value ? offers.value.map(() => true) : offerEnhanced.value))
watch(phase, (p) => { if (p !== 'build') cancelHandPreview() })

const onEnhancedHand = async (): Promise<void> => {
  if (adInFlight.value) return
  if (isRewardCoinPriced && !handPreview.value) {
    handPreview.value = true
    playSound('modal-open', 0.04, 1.2)
    window.clearTimeout(handPreviewTimer)
    handPreviewTimer = window.setTimeout(cancelHandPreview, HAND_PREVIEW_MS)
    return
  }
  cancelHandPreview()
  await claimReward(() => {
    dealEnhancedOffers()
    selectedSlot.value = null
    playSound('level-up', 0.07)
    // The spend gets a beat of its own on the cards it bought (`DropTray`'s
    // `paidAt`): the preview has already turned them gold, so without it the
    // tap that pays changes nothing on screen.
    handPaidAt.value = Date.now()
  })
}

/** When the reinforced hand was last PAID for (not previewed). */
const handPaidAt = ref(0)

// ─── Flying chest and gift pieces ───────────────────────────────────────────
//
// One chest five seconds after the tutorial is behind the player and one
// every forty-five seconds after that (the phone keeps the short gap — see the
// desktop scene's `CHEST_EVERY_MS`); tapping it queues a welded piece, which
// waits in the hand's FIRST slot (see `useGifts` and DropTray's `giftFirst`)
// until it is dropped — free the first time a chest is ever opened, half price
// after. Both are self-contained — this
// scene only says when they may run, and stands its own hand down when a gift
// is picked up.


/**
 * The chest paid coins instead of a piece: it has introduced everything it
 * carries this run (`rollChestGift`). Banked here, and burst out of the chest
 * toward the coin badge so the payout is seen where it happened.
 */
const onChestCoins = ({ amount, el }: { amount: number; el: HTMLElement | null }): void => {
  addCoins(amount)
  playSound('coin-collect', 0.05)
  spawnCoinExplosion({ sourceEl: el, targetEl: coinEl.value, count: 26 })
}

const chestReady = computed(() => tutorialOver.value && !showResult.value && phase.value !== 'defeat')
const chestPaused = computed(() =>
  showResult.value || rotateBlocked.value || showMergeGuide.value || showMergePower.value
  || handLessonHold.value
)
const giftDisabled = computed(() =>
  showResult.value || phase.value === 'defeat' || tutorialStep.value !== null
)

/** A gift is waiting and on offer: it borrows the first slot of the hand. */
const giftFirst = computed(() => !!nextGift.value && !giftDisabled.value)
const giftTileRef = ref<InstanceType<typeof GiftTile> | null>(null)

// The wall armed in slot 0 is UNDER the gift once the gift takes the slot.
// Left armed, the next tap on the board would drop a piece the player can no
// longer see in their hand.
watch(giftFirst, (on) => { if (on && selectedSlot.value === 0) selectedSlot.value = null })

const onGiftArmed = (): void => {
  selectedSlot.value = null
  armedColumn.value = null
  inspected.value = null
}

// ─── Keyboard (a phone with a keyboard is still a phone) ────────────────────

const onKey = (e: KeyboardEvent): void => {
  const tgt = e.target
  if (tgt instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(tgt.tagName)) return
  if (e.code === 'Escape') { selectedSlot.value = null; inspected.value = null; return }
  if (e.repeat) return
  if ((e.code === 'Space' || e.code === 'Enter') && phase.value === 'build' && !showResult.value) {
    e.preventDefault()
    onCallWave()
    return
  }
  const digit = Number(e.key)
  // "1" is the first slot — which is the gift while one is waiting there.
  if (digit === 1 && giftFirst.value) { giftTileRef.value?.arm(); return }
  if (Number.isInteger(digit) && digit >= 1 && digit <= offers.value.length) onSelectSlot(digit - 1)
}

// ─── Gameplay lifecycle ─────────────────────────────────────────────────────

// The card HOLDS THE CLOCK here, unlike on the desktop board.
//
// This board opens its wave the instant the game loads (`firstBuildMs: 0`), so
// unlike the tower game there is no build phase for a full-screen card to sit
// inside — without the hold the player reads a pictogram while a grunt eats
// their gate, and the beat that was supposed to sell them the mechanic is the
// one they remember losing to. A held clock is also a gameplay STOP as far as
// the portal is concerned, which is what the line below is for.
const isLiveGameplay = computed(
  () => phase.value !== 'defeat'
    && !showResult.value
    && !isAnyModalOpen.value
    && !isAdShowing.value
    && !rotateBlocked.value
    && !showMergeGuide.value
    && !showMergePower.value
    && !handLessonHold.value
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

    // Applied AFTER the run exists: `reset` re-arms a tutorial whose first beat
    // arms a piece, and a card opened over an empty board has nothing to return
    // the player to.
    const cheat = readTutorialCheat()
    if (cheat) replayTutorial(cheat)
  } finally {
    booting = false
  }
}

const onOrientationChange = (): void => { setTimeout(resize, 250) }
let layoutTimer = 0

/**
 * Scripted autoplay for the A/B runner. Dynamically imported so the driver
 * never reaches a player's bundle, and gated on the same `?bench=` /
 * `?benchframes=` flags the probe reads — without one of those nothing here
 * runs and `benchStep` stays null.
 */
const installBenchDriver = (): void => {
  if (!perf.benchMs && !perf.benchFrames) return
  const q = new URLSearchParams(location.search)
  void import('./benchDriver').then(({ makeBenchDriver }) => {
    benchStep = makeBenchDriver(
      {
        phase, wave, wood, offers,
        callWave, dropOffer, canDropAt, debugSetWave, setGameSpeed
      },
      Number(q.get('seed')) || 7,
      Number(q.get('benchwave')) || 12
    )
  })
}

onMounted(() => {
  void boot()
  installBenchDriver()
  // The gift tile used to mount with the scene and re-read the queue itself;
  // now it only exists while a gift is showing, so a queue that arrives with a
  // late cloud hydrate is read here instead.
  reloadGifts()
  // Re-read after boot: on a platform build the cloud save may not have landed
  // when `useTechDiscovery` first read it, and a returning player must not be
  // told about a screen they already use.
  refreshTechFound()
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
  cancelDropNudge()
  releaseRotatePause?.()
  clearFixedFrame()
  stopBattleMusic()
  saveRunSnapshot()
  // The overlay is a module singleton shared with the desktop scene: leave
  // none of this board's columns behind in it.
  setBuildOverlay({ dropColumn: null, dropGuides: [], dropShape: null, dropRows: 0, edgeLeft: 0, edgeRight: 0 })
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
      //- The game's premise, said once, in the biggest type on the screen.
      //- First-time players only, and gone on their first touch — see
      //- `showIncoming`.
      Transition(name="fade")
        IncomingBanner(v-if="showIncoming")

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
        //- The flying chest crosses the sky band on its own timer. Under every
        //- other overlay in this band, so it never flies over a bubble or a
        //- toast the player is reading.
        FlyingChest(
          :ready="chestReady"
          :paused="chestPaused"
          :wave="wave"
          @coins="onChestCoins"
        )

        //- Daily missions, out of the drawer while there is something to
        //- collect: top-left of the playfield, the one corner nothing else
        //- claims (zoom holds the right, the hint the centre, the chest flies
        //- under it). It turns up on the wave clear that finishes a goal and
        //- leaves once everything collectable is collected. The drawer copy
        //- stays for the player who goes looking.
        div.drop__corner-missions
          MissionsModal(
            only-when-claimable
            @opened="feedMissions"
            @coins-awarded="fireCoinExplosion"
          )

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
              v-if="zoomMoved"
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

        //- The tapped block's card — rank it up, sell it — anchored on the
        //- block.
        div.drop__card(v-if="inspected" :style="cardStyle")
          BlockCard(
            :block="inspected"
            @upgrade="onUpgradeInspected"
            @sell="onSellInspected"
            @close="inspected = null"
          )

        //- Rewarded perk, floating just above the hand. (The gift a chest or a
        //- first clear paid out waits IN the hand — the tray's first slot.)
        div.drop__perks
          FRewardButton(
            v-if="enhancedHandOffered"
            tone="gold"
            size="sm"
            :class="{ 'is-confirming': handPreview }"
            :label="t('blocks.enhancedHand')"
            :icon="handPreview ? 'check' : undefined"
            :icon-only="handPreview"
            @click="onEnhancedHand"
          )

        //- Menu drawer.
        div.drop__menu-backdrop(v-if="menuOpen" @click="menuOpen = false")
        div.drop__menu(v-if="menuOpen")
          FMuteButton(v-if="showMuteButton")
          FHudButton(tone="slate" :aria-label="t('options.title')" @click="menuOpen = false; showOptions = true")
            svg(viewBox="0 0 24 24" fill="currentColor")
              path(d="M12 4 a1 1 0 0 1 1 1 v1.6 a6 6 0 0 1 1.8 0.7 l1.1 -1.1 a1 1 0 0 1 1.4 1.4 l -1.1 1.1 a6 6 0 0 1 0.7 1.8 H18 a1 1 0 1 1 0 2 h-1.6 a6 6 0 0 1 -0.7 1.8 l1.1 1.1 a1 1 0 0 1 -1.4 1.4 l-1.1 -1.1 a6 6 0 0 1 -1.8 0.7 V18 a1 1 0 1 1 -2 0 v -1.6 a6 6 0 0 1 -1.8 -0.7 l-1.1 1.1 a1 1 0 0 1 -1.4 -1.4 l1.1 -1.1 a6 6 0 0 1 -0.7 -1.8 H6 a1 1 0 1 1 0 -2 h1.6 a6 6 0 0 1 0.7 -1.8 L7.2 7.6 a1 1 0 0 1 1.4 -1.4 l1.1 1.1 a6 6 0 0 1 1.8 -0.7 V5 a1 1 0 0 1 1 -1 Z M12 9 a3 3 0 1 0 0 6 a3 3 0 0 0 0 -6 Z")
          //- Blueprints is not in here any more: it lives in the bottom bar
          //- beside this drawer's button (see WaveBar), so the tree is one tap
          //- from anywhere instead of two taps behind a "…".
          MissionsModal(@opened="feedMissions" @coins-awarded="fireCoinExplosion")
          TreasureChest(:target-el="coinEl")

      div.drop__bottom(ref="bottomRef" :class="{ 'is-volley-urgent': volleyUrgent }")
        DropTray(
          :offers="offers"
          :enhanced="trayEnhanced"
          :selected="selectedSlot"
          :materials="wood"
          :gold="runCoins"
          :reroll-seconds="rerollReadyIn"
          :volley-ready="arrowRainReady"
          :in-battle="phase === 'battle'"
          :volley-charge="arrowRainCharge"
          :volley-waves-left="arrowRainWavesLeft"
          :nudge="idleNudge"
          :gift-first="giftFirst"
          :paid-at="handPaidAt"
          @press="onTilePress"
          @reroll="onReroll"
          @volley="onVolley"
        )
          //- The gift a chest or a first clear paid out, standing in the first
          //- slot until it is dropped.
          template(#gift)
            GiftTile(
              ref="giftTileRef"
              variant="cell"
              in-tray
              :size="52"
              :canvas="canvasRef"
              :slot-armed="selectedSlot != null"
              :disabled="giftDisabled"
              @armed="onGiftArmed"
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
          :blueprints-affordable="progress.affordableCount.value"
          :blueprints-attention="blueprintsNudge"
          @call="onCallWave"
          @set-speed="onSetSpeed"
          @buy-speed="onBuySpeed"
          @repair-all="onRepairAll"
          @menu="menuOpen = !menuOpen"
          @blueprints="openBlueprints"
        )

    //- ── Defeat screen ─────────────────────────────────────────────────────
    FReward(v-model="showResult" :show-continue="false")
      template(#ribbon)
        span.drop__ribbon {{ t('result.towerFell') }}
      div.dresult
        //- The record rides with the wave it is a record of — it used to sit
        //- directly over the coin payout, where it read as a record score.
        div.dresult__headline
          span.dresult__wave {{ t('result.reachedWave', { n: summary.wave }) }}
          span.dresult__record(v-if="summary.wave >= bestWave && summary.wave > 0") {{ t('result.newRecord') }}
        //- The one number on this screen that is not about this run: it is
        //- about everyone else. Drops out entirely when there is no board to
        //- rank against, rather than leaving an empty plaque.
        span.dresult__rank(v-if="showRank")
          | {{ t('result.rankLabel') }} {{ rankDisplay }}
          //- Its own element, not a leading space in the text: Pug trims the
          //- whitespace at the head of an inline text block, so a source-level
          //- gap silently rendered "#47of 361" in every language. The gap has
          //- to come from CSS.
          span.dresult__rank-note(v-if="playerTotal > 0") {{ t('result.rankOf', { n: playerTotal.toLocaleString() }) }}
        //- The wallet coin: this payout is added straight to the purse the
        //- tech tree spends from, so it must not wear the run-gold ingot.
        div.dresult__coins(ref="rewardCoinRef")
          IconCoin(class="dresult__coin-icon")
          span.dresult__coin-value +{{ summary.coins }}
        div.dresult__cta
          FRewardButton(
            v-if="twoXAvailable"
            tone="gold"
            label=""
            :aria-label="t('result.tripleCoins')"
            @click="onTwoX"
          )
            span.dresult__twox
              span {{ RESULT_COIN_MULTIPLIER }}×
              IconCoin(class="dresult__twox-icon")
          FRewardButton(
            v-if="graceAvailable"
            tone="green"
            :label="t('result.continueRun')"
            @click="onContinueRun"
          )
            span.dresult__continue
              //- Rubble standing back up as a tower, large and first — the
              //- offer as a picture. See the desktop scene's note and
              //- RebuiltGlyph.
              RebuiltGlyph.dresult__continue-pic
              span.dresult__continue-text
                span.dresult__continue-wave {{ t('result.continueWave', { n: continueWave }) }}
                span.dresult__continue-bonus
                  span +{{ continueMaterials }}
                  IconWood.dresult__res-icon
              //- Once per run, said as a token. See the desktop scene's note.
              span.dresult__once(aria-hidden="true") 1×
          div.dresult__actions
            //- Glyphs, not captions — and the two i18n keys live on as the
            //- accessible names. See the desktop scene's note: the upgrade door
            //- is the Blueprints glyph now (the cart read as a store), and
            //- restarting is a replay arrow rather than skip-forward.
            ResultUpgradeButton(:is-disabled="adInFlight" @click="onUpgrade")
            FRewardButton(
              tone="blue"
              free
              icon="replay"
              icon-only
              :label="t('result.defendAgain')"
              @click="onRebuild"
            )

    //- No handlers: it emits nothing, because there is nothing on it to press.
    //- On the drop beats the armed tray card gets a window of its own, so the
    //- press-and-drag every first-timer reaches for works too.
    TutorialOverlay(
      :step="tutorialStep"
      :target="tutorialRect"
      :passage="tutorialPassage"
    )

    //- The lesson, played for the player until they play it: the card's piece
    //- rides a finger up into the lit column. Inert and wordless.
    DropDemo(
      v-if="demoVisible"
      :shape-id="armedShape ?? null"
      :from="tutorialPassage"
      :to="tutorialLanding"
    )

    //- The same lesson, replayed once for a player who armed a card and then
    //- tapped the tray again instead of a column (`showDropNudge`).
    DropDemo(
      v-else-if="dropNudge"
      :shape-id="dropNudge.shapeId"
      :from="dropNudge.from"
      :to="dropNudge.to"
    )

    //- The Gate's rank, played rather than pointed at: the hand taps the Gate
    //- and presses Upgrade on its card, and its own layer holds every touch
    //- while it does (see `runGateDemo`).
    TutorialHand(:hand="autoHand.hand")

    //- The piece a drag is carrying, riding just above the finger so the thumb
    //- does not cover it. Over the coach-mark dim, and inert.
    div.drop__carry(v-if="dragGhost && armedShape" aria-hidden="true" :style="dragGhostStyle")
      ShapeTile(:shape-id="armedShape" :size="52")

    //- The merge ladder, in its one-cell form. Holds the wave clock while it is
    //- up — see `isLiveGameplay`.
    MergeGuide(
      variant="cell"
      :model-value="showMergeGuide"
      @continue="onMergeGuideContinue"
    )

    //- Four seconds, after the ladder: a plain cannon and a tier 3 side by
    //- side, one grumpling each. Holds the clock like the ladder.
    MergePowerDemo(
      variant="cell"
      :model-value="showMergePower"
      @continue="onMergePowerContinue"
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

// Mirrors the zoom rail's inset on the other side. The wrapper is empty (and
// takes no taps) whenever there is nothing to collect.
.drop__corner-missions
  position: absolute
  top: 0.5rem
  left: calc(0.4rem + env(safe-area-inset-left, 0px))
  pointer-events: auto

.drop__toast
  position: absolute
  left: 50%
  translate: -50% 0
  pointer-events: none

// The carried piece. Fixed, because it follows a viewport coordinate across
// every band of the screen; over the coach-mark dim (40) and the drop demo
// (41), so it is the one thing moving during the drop beat.
.drop__carry
  position: fixed
  z-index: 42
  width: 52px
  height: 52px
  margin: -70px 0 0 -26px
  opacity: 0.92
  pointer-events: none
  filter: drop-shadow(0 0 10px rgba(127, 224, 255, 0.85)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))

// Placed by `cardStyle`, which also picks the side of the block it hangs on
// (its `translate`).
.drop__card
  position: absolute
  z-index: 2
  pointer-events: auto

.drop__perks
  position: absolute
  left: 50%
  bottom: 0.25rem
  translate: -50% 0
  display: flex
  gap: 0.35rem
  pointer-events: auto

// The reinforced hand waiting on its second tap (see the desktop scene).
.drop__perks .is-confirming
  animation: perk-confirm 0.9s ease-in-out infinite

@keyframes perk-confirm
  0%, 100%
    scale: 1
    filter: drop-shadow(0 0 0 rgba(255, 213, 74, 0))
  50%
    scale: 1.08
    filter: drop-shadow(0 0 8px rgba(255, 213, 74, 0.95))

@media (prefers-reduced-motion: reduce)
  .drop__perks .is-confirming
    animation: none
    filter: drop-shadow(0 0 6px rgba(255, 213, 74, 0.9))

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

.drop__bottom
  position: relative
  display: flex
  flex-direction: column
  background-image: linear-gradient(to top, rgba(10, 18, 36, 0.9), rgba(10, 18, 36, 0.35))
  pointer-events: none

  > *
    pointer-events: auto

  // The Volley as the answer to an enemy nothing else reaches. Styled from here
  // rather than inside the tray, which only knows "ready" and has no business
  // knowing why it is urgent.
  &.is-volley-urgent :deep(.tray__volley.is-ready)
    animation: drop-volley-urgent 0.9s ease-in-out infinite

@keyframes drop-volley-urgent
  0%, 100%
    box-shadow: 0 0 12px rgba(255, 190, 40, 0.5), 0 0 0 0 rgba(255, 96, 64, 0)
    scale: 1
  45%
    box-shadow: 0 0 18px rgba(255, 190, 40, 0.8), 0 0 0 5px rgba(255, 96, 64, 0.75)
    scale: 1.08

// The ring stays, the swell goes.
@media (prefers-reduced-motion: reduce)
  .drop__bottom.is-volley-urgent :deep(.tray__volley.is-ready)
    animation: none
    box-shadow: 0 0 12px rgba(255, 190, 40, 0.5), 0 0 0 4px rgba(255, 96, 64, 0.8)

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

// The wave and its record on one row when they fit; the record wraps under the
// wave when a long translation does not leave room beside it.
.dresult__headline
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: 0.2rem 0.45rem

.dresult__wave
  color: #fff
  font-size: 1.2rem
  font-weight: 900
  text-shadow: 2px 2px 0 #000

// Gold, and a step down in size from the wave line: it is the second thing
// read on this screen, not the first, and gold is what the rest of the game
// uses for "this is about the wider world" (coins, records).
.dresult__rank
  color: #ffd93c
  font-size: 0.95rem
  font-weight: 800
  text-shadow: 2px 2px 0 #000

.dresult__rank-note
  margin-left: 0.35em

// A gold plaque on the wave it belongs to.
.dresult__record
  padding: 0.05em 0.5em
  border-radius: 999px
  border: 2px solid rgba(255, 217, 60, 0.75)
  background: rgba(60, 40, 0, 0.45)
  color: #ffd93c
  font-size: 0.8rem
  font-weight: 900
  text-transform: uppercase
  white-space: nowrap
  text-shadow: 1px 1px 0 #000

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
  gap: 0.5rem

.dresult__continue-pic
  font-size: 1.9em

.dresult__continue-text
  display: inline-flex
  flex-direction: column
  align-items: flex-start
  gap: 0.05rem
  line-height: 1.15

.dresult__continue-wave
  font-weight: 900

.dresult__continue-bonus
  display: inline-flex
  align-items: center
  gap: 0.15rem
  // Under the wave, and quieter than it: the materials are what comes WITH
  // the rebuild, not what the button is.
  font-size: 0.72rem
  opacity: 0.9

.dresult__res-icon
  width: 1rem
  height: 1rem

// "Once per run", pinned to the button's corner — see the desktop scene's
// `.result__once`, which this matches.
.dresult__once
  position: absolute
  top: -0.65em
  right: -0.55em
  display: inline-grid
  place-items: center
  min-width: 1.85em
  height: 1.85em
  padding: 0 0.3em
  border: 2px solid #0f1a30
  border-radius: 999px
  background-image: linear-gradient(to bottom, #fff3b0, #ffc83d)
  box-shadow: 0 2px 0 #0f1a30
  color: #3a2400
  font-size: 0.62em
  font-weight: 900
  line-height: 1
  text-shadow: none
  pointer-events: none

.dresult__actions
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 0.5rem
</style>

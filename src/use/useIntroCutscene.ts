import { computed, ref } from 'vue'
import {
  DESKTOP_TABLEAU, INTRO_FLEET, INTRO_LAND_HIT_MS, INTRO_RIDERS, INTRO_SIEGE_HIT_MS,
  buildIntroCast, introBannerAt, introBeatAt, introCardAt, introCastTypes,
  introDurationMs, introFleetTypes, introRiderAt, introSkipMs, sampleIntroCamera,
  type IntroBeat, type IntroTableau
} from '@/game/introCutscene'
import {
  clearCameoCast, spawnCameoCast, spawnCameoRiders, buildClockHeld, phase, wave,
  WATER_ROW, type CameoPlacement
} from '@/use/useTowerGame'
import { SIEGE_ARM_STRIPS, setDecorShips } from '@/use/useTowerArt'
import { pushFx } from '@/use/useTowerVfx'
import { blockDef } from '@/game/blocks'
import type { Ally, Block } from '@/game/types'
import { clearCinematicFrame, homeFrame, setCinematicFrame } from '@/use/useTowerCamera'
import { playFx } from '@/use/useTowerAudio'
import { useScreenshake } from '@/use/useScreenshake'
import { preloadArtOverrides, type ArtWant } from '@/game/art'
import { primeMonsterSprites } from '@/game/monsterSprites'
import { ENEMY_DEFS } from '@/game/enemies'
import { flushPersist, getState, setState } from '@/use/useTowerState'
import { INTRO_SEEN_KEY } from '@/keys'
import { CLEAN_FEED } from '@/game/cleanFeed'
import { isGamePaused } from '@/use/useGamePause'

/**
 * ─── The opening cutscene: the director ─────────────────────────────────────
 *
 * `src/game/introCutscene.ts` holds the storyboard. This runs it: it dresses
 * the set, drives the camera, fires the two audio cues, and — the part that
 * actually matters — guarantees the set is struck again afterwards, by every
 * route out that exists.
 *
 * ── The contract with the scene ──
 *
 * Two lines in a render loop and one at boot:
 *
 *     if (shouldPlayIntro()) void playIntro({ tableau, onDone })   // boot
 *     stepIntro(dt, cssW, cssH)                                    // per frame,
 *                                                                  // before drawScene
 *
 * …plus `introActive` in whatever the scene uses to hide its HUD and hold its
 * coach marks. Everything else — the cast, the frame, the flag in the save, the
 * skip, the teardown — is in here.
 *
 * ── Why it steps from the render loop instead of owning a timer ──
 *
 * Because the thing it is synchronised to is FRAMES. The camera is written once
 * per frame and read by `drawScene` on that same frame, so a director on its own
 * `setInterval` would write a frame the renderer had already drawn past and the
 * pan would judder in a way no amount of easing can fix. Stepping from the loop
 * also means the cutscene inherits, for free, every reason the loop has to stop:
 * a hidden tab, an ad, a platform pause. Those are exactly the moments a
 * cutscene must not be playing to an empty room — see `stepIntro`.
 *
 * ── Why it is not a Vue animation ──
 *
 * The moving part is a world-space camera over a canvas. There is nothing in the
 * DOM to transition.
 */

// ─── State ──────────────────────────────────────────────────────────────────

/** Elapsed cutscene time, ms. */
const clock = ref(0)
const running = ref(false)
/**
 * The cutscene has played (or been skipped) in THIS session.
 *
 * Distinct from the save flag: the save flag is what stops a returning player
 * ever seeing it again, while this is what stops `IncomingBanner` reappearing
 * over the board the moment the cutscene ends. The banner's own audience test
 * is "first-timer who has not touched the game yet", which is still true of a
 * player who has just watched ten seconds of cutscene without touching
 * anything — and showing them the line a second time, now over an empty lawn,
 * would undo the whole reason it was moved into the cutscene.
 */
const shown = ref(false)
let castUids: number[] = []
/** The closing shot's riders, held so the director can drive them. */
let riders: Ally[] = []
let ridersOut = false
let onDone: (() => void) | null = null
let keysDuration = introDurationMs()
/** Cues already fired this run, so a paused-then-resumed frame cannot re-fire
 *  a horn the player already heard. */
let firedSiege = false
let firedLand = false
/** Released when the cutscene ends — the build clock is ours while it runs. */
let heldClock = false

const { triggerShake } = useScreenshake()

// ─── What the scene reads ───────────────────────────────────────────────────

/** True while the cutscene owns the camera and the screen. */
export const introActive = computed(() => running.value)
/** Elapsed ms — the overlay animates against this rather than its own clock,
 *  so a skip moves the type and the camera in the same frame. */
export const introClock = computed(() => clock.value)
export const introBeat = computed<IntroBeat>(() => introBeatAt(clock.value))
/** The premise card currently up — key and window — or null. The overlay needs
 *  the window as well as the key, so it can cross-fade rather than cut. */
export const introCard = computed(() => (running.value ? introCardAt(clock.value) : null))
/** Is `IncomingBanner` on screen right now? */
export const introBanner = computed(() => running.value && introBannerAt(clock.value))
/** Has the cutscene already had its turn this session? See `shown`. */
export const introShown = computed(() => shown.value)

// ─── Should it run at all? ──────────────────────────────────────────────────

/**
 * Has this save seen the cutscene?
 *
 * Read through `useTowerState`, so it rides the platform's cloud store on the
 * portals that have one — a player introduced to the game on their phone is not
 * introduced to it again on their desktop.
 */
export const introSeen = (): boolean => getState<boolean>(INTRO_SEEN_KEY, false) === true

/**
 * May the cutscene play?
 *
 * Every clause is a way it would otherwise be wrong, and none of them are
 * hypothetical:
 *
 *   · `introSeen` — once per save. It is an introduction.
 *   · `phase` / `wave` — an untouched opening build phase and nothing else. A
 *     RESUMED run lands mid-siege at wave seven, and flying the camera off to
 *     look at scenery while a wave is walking in is not a cutscene, it is a
 *     hijack. This is also what makes a reload mid-tutorial safe.
 *   · `CLEAN_FEED` — the preview-video recorder. A store video that opens with
 *     ten seconds of camera move shows a portal reviewer no gameplay at all,
 *     and the recorder's whole purpose is gameplay.
 *   · reduced motion — see `prefersReducedMotion`.
 *   · `running` — it is not re-entrant.
 */
export const shouldPlayIntro = (): boolean =>
  !running.value
  && !shown.value
  && !CLEAN_FEED
  && !prefersReducedMotion()
  && !introSeen()
  && phase.value === 'build'
  && wave.value === 0

/**
 * The one player this cutscene is not for.
 *
 * A ten-second full-screen camera move across a scrolling parallax background
 * is close to the canonical example of what `prefers-reduced-motion` is asking
 * about — the same class of thing as the screen shake `useScreenshake` already
 * refuses, and considerably longer. It is not a fidelity setting and it cannot
 * be answered by turning off the letterbox animation: the flight IS the motion.
 *
 * So the whole cutscene is declined, and the save flag is NOT written — the
 * player simply gets the board and `IncomingBanner`, which is the premise in
 * words over a still frame and is exactly what shipped before this existed.
 * Should they turn the preference off later, the introduction is still waiting
 * for them.
 */
const prefersReducedMotion = (): boolean => {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  } catch { return false }
}

// ─── Art ────────────────────────────────────────────────────────────────────

export const introArtWants = (types: readonly string[]): ArtWant[] => {
  const wants: ArtWant[] = []
  for (const id of types) {
    const def = ENEMY_DEFS[id]
    if (!def) continue
    if (def.siege) {
      wants.push(['siege', id])
      // The throwing engines carry their arm as a separate layer, keyed to
      // their own reload. Without it the chassis is painted and the arm is
      // drawn, which is the one combination that reads as broken. ONLY the
      // throwing engines: the ram, iron ram and tower have no arm sheet, and
      // asking for one is a 404 a portal's QA console reports as a broken build.
      if (SIEGE_ARM_STRIPS.has(id)) wants.push(['siegeArm', id])
      continue
    }
    const monster = def.monster
    for (const m of typeof monster === 'string' ? [monster] : monster ?? []) {
      wants.push(['monster', m])
    }
  }
  return wants
}

/**
 * The scenery fleet, as plain blocks the renderer can draw.
 *
 * Undamaged and tier 1, so `drawBlock`'s ship branch paints a hull and nothing
 * else — damaged would add a health bar, welded would add a tier plate, and
 * both would be HUD furniture over scenery. `bornAt` is well in the past so
 * they are already moored rather than arriving with the placement squash of a
 * block the player just built.
 *
 * Negative uids because `uid` seeds each hull's roll on the swell. These never
 * share an array with a real block, but a collision with the simulation's own
 * counter would put two of them rocking in identical sync, which is the one
 * thing that would give away that they are copies.
 */
const fleetBlocks = (): Block[] =>
  INTRO_FLEET.map((f, i) => ({
    uid: -1000 - i,
    c: f.x,
    r: WATER_ROW,
    typeId: f.typeId,
    hp: blockDef(f.typeId).hp,
    maxHp: blockDef(f.typeId).hp,
    cd: 0,
    flash: 0,
    bornAt: -10_000,
    recoil: 0,
    aim: 0
  }))

/**
 * Ask for everything the tableau needs, at high priority, and do NOT wait.
 *
 * The tableau is deliberately full of things a first-time player has no
 * business having downloaded: `artPreload` holds the splash for wave 1's cast
 * and pushes the trebuchet to a low-priority idle slot twenty minutes later,
 * for the excellent reason that a phone should not pay at wave 0 for a machine
 * that debuts at wave 22. The cutscene then shows it at second seven.
 *
 * So it re-asks for the whole cast at high priority — and starts immediately,
 * which is the important half. Waiting was tried and is worse in both
 * directions:
 *
 *   · The first 2.3 seconds of the flight show nothing but grumplings, whose
 *     strip is already in tier 0 because they debut on wave 1. There is
 *     literally nothing to wait FOR at the front of the sequence, and the
 *     siege line is six and a half seconds away — a lifetime on any connection
 *     that loaded the game at all.
 *   · Waiting puts a gap between the board appearing and the cutscene starting,
 *     and in that gap the player sees the full interface, which then fades out
 *     under the letterbox. A flash of HUD is a far more visible defect than a
 *     plainer trebuchet, and it lands on the one frame that matters most.
 *
 * And the fallback is not a hole: a design whose strip has not arrived draws
 * its procedural body, which is the same ink-and-cel kit the paintings were
 * made from and is exactly what the game looks like with art overrides off.
 */
const warmIntroArt = (tableau: IntroTableau): void => {
  const wants = introArtWants(introCastTypes(tableau))
  // The procedural bakes first — they are the fallback, and on the phone board
  // the prime filter is the roster, which this cast stays inside.
  primeMonsterSprites(
    wants.filter(([kind]) => kind === 'monster').map(([, id]) => id),
    { fetch: false }
  )
  // The hulls and the rider, which are neither monsters nor engines. Both sit
  // deep in `artPreload`'s tier 2 — a harbour is a tech-tree purchase and a
  // sortie costs forty coins, so a first-time player has no business having
  // paid for either — and this cutscene puts all four on screen inside twelve
  // seconds.
  for (const id of introFleetTypes()) wants.push(['ship', id])
  wants.push(['ally', 'cavalry'])
  void preloadArtOverrides(wants)
}

// ─── Running it ─────────────────────────────────────────────────────────────

export interface PlayIntroOpts {
  /** Which army. The phone board has no siege engines — see `DROPMERGE_TABLEAU`. */
  tableau?: IntroTableau
  /** Run when the cutscene has ended and the set is struck. The scene uses it
   *  to stand the opening vanguard and let the coach marks begin. */
  onDone?: () => void
}

/**
 * Dress the set and start the flight.
 *
 * Marks the save BEFORE the first frame, deliberately. A cutscene that wrote
 * its flag on completion would replay in full for every player who closed the
 * tab during it — and a player who closed the tab during an intro is the last
 * person who should be shown it twice.
 */
export const playIntro = (opts: PlayIntroOpts = {}): void => {
  if (!shouldPlayIntro()) return
  const tableau = opts.tableau ?? DESKTOP_TABLEAU

  shown.value = true
  setState(INTRO_SEEN_KEY, true)
  // Flushed rather than left to the state layer's debounce. The write happens
  // on the first frame of a ten-second sequence a player may well close the tab
  // during — which is precisely the player the flag exists to protect — and
  // losing it costs them the whole introduction a second time.
  flushPersist()
  onDone = opts.onDone ?? null

  warmIntroArt(tableau)

  const cast: CameoPlacement[] = buildIntroCast(tableau).map((u) => ({
    typeId: u.typeId, x: u.x, y: u.y, pose: u.pose, dir: 1
  }))
  castUids = spawnCameoCast(cast)
  // The scenery fleet. Set once rather than driven: the hulls never move, and
  // which of them is on screen is decided by where the camera is.
  setDecorShips(fleetBlocks())
  riders = []
  ridersOut = false

  clock.value = 0
  firedSiege = false
  firedLand = false
  keysDuration = introDurationMs()
  // The opening countdown belongs to the player, and the cutscene is not their
  // time. On the phone board this is not a nicety: its `firstBuildMs` is zero,
  // so wave 1 is called on the first stepped frame unless the clock is held.
  buildClockHeld.value = true
  heldClock = true
  running.value = true
  // The camera has to be right on the FIRST frame the renderer draws, not one
  // frame later — the alternative is a single frame of the game's own view
  // spliced in front of the cutscene, which reads as a flash.
  writeFrame(0, 0)
}

/**
 * Advance the cutscene by one frame and write the camera.
 *
 * Called from the scene's render loop with the same delta the simulation gets,
 * and BEFORE `drawScene`, which reads the camera this writes.
 *
 * The clock does not advance while the game is paused — an ad, a hidden tab, a
 * portal `pauseGame()`. This is the whole reason the director has no timer of
 * its own: a cutscene that ran to completion behind a thirty-second interstitial
 * would put the player back on a board with the intro already over, having been
 * shown nothing at all.
 */
export const stepIntro = (dtMs: number, viewW: number, viewH: number): void => {
  if (!running.value) return
  if (!isGamePaused.value) clock.value = Math.min(keysDuration, clock.value + dtMs)
  writeFrame(viewW, viewH)
  fireCues()
  rideHome(dtMs)
  if (clock.value >= keysDuration) finish()
}

const writeFrame = (viewW: number, viewH: number): void => {
  setCinematicFrame(sampleIntroCamera(clock.value, homeFrame(), viewW, viewH))
}

/**
 * The two punctuation marks.
 *
 * Two, and not one per rank. A cue on every band would be a drum machine, and
 * the shot list is built so that all the escalation is carried by the picture;
 * the horn exists to mark the single moment the picture changes meaning — the
 * frame the siege engines come into view — and the impact exists so the return
 * to the tower lands rather than merely stops.
 *
 * Both may well be silent, and that is expected: a browser keeps its audio
 * context suspended until the player has touched the page, and a player who is
 * watching the intro has by definition not. `playFx` skips rather than queues
 * (see `useTowerAudio`), so nothing arrives late over the tutorial.
 */
const fireCues = (): void => {
  if (!firedSiege && clock.value >= INTRO_SIEGE_HIT_MS) {
    firedSiege = true
    playFx('bossHorn')
    triggerShake('strong')
  }
  if (!firedLand && clock.value >= INTRO_LAND_HIT_MS) {
    firedLand = true
    playFx('impact')
    triggerShake('small')
  }
}

/**
 * The closing shot: three knights galloping into the Gate.
 *
 * They are put on the field mid siege-hold, off camera, and their POSITION is
 * read from the clock rather than integrated here (see `introRiderAt`) — which
 * is what makes a skip correct for nothing: whatever millisecond the player
 * jumps to, that is where the riders are. Only the gait is integrated, because
 * a gallop cycle is about how the horse looks rather than about where it is.
 *
 * `life` is the fade. `drawAlly` dims a rider over the last second of its
 * contract, so spending that last second as they cross the Gate is the vanish —
 * the same visual the real sortie ends on, which is the point: the player is
 * being shown the end of a mechanic before they have met the beginning of it.
 */
const rideHome = (dtMs: number): void => {
  const ms = clock.value
  if (!ridersOut) {
    if (ms < INTRO_RIDERS.spawnAt) return
    ridersOut = true
    riders = spawnCameoRiders(
      Array.from({ length: INTRO_RIDERS.count }, (_, i) => ({
        x: introRiderAt(i, ms).x,
        facing: -1 as const
      }))
    )
  }

  const dtSec = dtMs / 1000
  for (const [i, a] of riders.entries()) {
    const at = introRiderAt(i, ms)
    // Already home. Left in the array rather than spliced — `finish` sweeps
    // every cameo by flag, and a rider at zero opacity costs one draw call for
    // the last fraction of a second of a cutscene.
    if (at.done) {
      if (a.life > 0) {
        a.life = 0
        // The same puff the real sortie ends on, at the Gate rather than out on
        // the field: the rider does not stop, it goes IN.
        pushFx({ kind: 'allyLeave', x: a.x, y: a.y })
      }
      continue
    }
    a.x = at.x
    // `drawAlly`'s expiry fade is `min(1, life / 1000)`.
    a.life = at.alpha * 1000
    // The gallop, on its own clock so three riders are not in lockstep — the
    // phases were seeded apart at spawn.
    a.phase += dtSec * 5
  }
}

/**
 * The player asked out.
 *
 * The clock jumps to the top of the whip rather than to the end, so the camera
 * still flies home — see `introSkipMs`. The siege cue is marked as spent on the
 * way past: a horn that blew on the frame the player skipped would be the last
 * thing they heard from a cutscene they had just dismissed.
 */
export const skipIntro = (): void => {
  if (!running.value) return
  const to = introSkipMs()
  // Already past the whip — the camera is home and the riders are coming in.
  // A tap here is "I have seen enough", and the only thing left to cut is the
  // closing shot, so it ends. Returning early (which this used to do) left the
  // overlay swallowing taps over a board that looked playable for another two
  // seconds and was not.
  if (clock.value >= to) { clock.value = keysDuration; return }
  clock.value = to
  firedSiege = true
}

/**
 * Strike the set.
 *
 * Idempotent, and called from every exit: the end of the flight, a skip that
 * runs to its end, a board that moved under the cutscene while its art loaded,
 * and `stopIntro` on unmount. The order is load-bearing — the cast comes off the
 * field and the camera is handed back BEFORE `onDone`, because what the scene
 * does in `onDone` is frame the opening and stand the vanguard against it, and
 * both of those read the things this line releases.
 */
const finish = (): void => {
  running.value = false
  setDecorShips([])
  riders = []
  ridersOut = false
  // The clock is deliberately LEFT at the end rather than zeroed. Everything
  // the overlay reads is derived from it, and a finished cutscene that reports
  // `clock = 0` reports the beat, the card and the letterbox of its own FIRST
  // frame — so any consumer that reads one of those a tick late (a watcher, a
  // render that has not yet seen `introActive` go false) sees the opening shot
  // rather than the landing. `playIntro` zeroes it on the way in, which is the
  // only place that is correct.
  castUids = []
  clearCameoCast()
  clearCinematicFrame()
  if (heldClock) {
    buildClockHeld.value = false
    heldClock = false
  }
  const done = onDone
  onDone = null
  done?.()
}

/**
 * Abandon the cutscene without running the scene's completion work.
 *
 * For `onUnmounted`. A scene that is going away must still take its monsters
 * off the field and give the camera back — this module's state is shared
 * between the two boards, and a cast left standing would be inherited by
 * whichever scene mounted next.
 */
export const stopIntro = (): void => {
  if (!running.value && castUids.length === 0) {
    // Not running, but a previous cast may still be standing if a teardown
    // raced a spawn. Cheap to be sure.
    clearCameoCast()
    return
  }
  onDone = null
  finish()
}

/**
 * Put the director back to "this session has not shown it yet".
 *
 * The `?tut=intro` hatch, which lets the cutscene be watched more than once per
 * save — see `useTutorialCheat`. It clears the SESSION flag only; the caller
 * owns the save flag, because clearing that is what makes the difference
 * between "let me look at this again" and "un-introduce this player".
 */
export const resetIntroForReplay = (): void => {
  onDone = null
  running.value = false
  setDecorShips([])
  riders = []
  ridersOut = false
  shown.value = false
  clock.value = 0
  castUids = []
  clearCameoCast()
  clearCinematicFrame()
  if (heldClock) {
    buildClockHeld.value = false
    heldClock = false
  }
}

/** Test seam — puts the module back to "no player has ever seen this". */
export const __resetIntroForTests = (): void => {
  onDone = null
  running.value = false
  setDecorShips([])
  riders = []
  ridersOut = false
  shown.value = false
  clock.value = 0
  castUids = []
  firedSiege = false
  firedLand = false
  if (heldClock) {
    buildClockHeld.value = false
    heldClock = false
  }
  clearCameoCast()
  clearCinematicFrame()
}

export default function useIntroCutscene() {
  return {
    introActive, introBeat, introCard, introBanner, introClock, introShown,
    shouldPlayIntro, playIntro, stepIntro, skipIntro, stopIntro, resetIntroForReplay
  }
}

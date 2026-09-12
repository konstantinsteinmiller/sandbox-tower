import type { ShapeDef } from './shapes'
import type { TechNode } from './types'
import { SHAPE_DEFS, OFFER_SLOTS, WEAPON_SLOT, SUPPORT_SLOT } from './shapes'
import { TECH_NODES } from './tech'
import { PREVIEWS, type PreviewTable } from './waves'
import {
  TECH_KEY, RUN_KEY, BEST_WAVE_KEY, ONBOARDED_KEY, TUTORIAL_KEY
} from '@/keys'

// ─── Rule sets ──────────────────────────────────────────────────────────────
//
// Everything about the simulation that a MODE may change, in one object.
//
// The desktop game and the mobile-fit game share one simulation
// (`useTowerGame.ts`) and one renderer. They differ in the board they play on,
// the pieces they deal, the enemies they field, the tree they buy from and the
// keys they save under — and every one of those used to be a module constant.
// Forking the 4,000-line simulation to change them would drift within a week;
// threading a rules object through the call sites keeps ONE truth per rule.
//
// `DESKTOP_RULES` reproduces every constant exactly as it was before this seam
// existed, and `tests/game/rules.test.ts` pins that. A mode ships its own rule
// set from its own package (see `src/mobile-fit/rules.ts`) and applies it once,
// before its first run starts.

export type SupportRule = 'graph' | 'column'
export type MergeRule = 'adjacency' | 'landing' | 'off'
export type MergeTypes = 'weapons' | 'all'
export type AirSpawn = 'sides' | 'top'
export type SpawnAt = 'offscreen' | 'viewEdge'
export type OfferLane = ShapeDef['lane'] | 'any'

export interface RuleSet {
  /** Stable id, written into run snapshots so a save from one mode is never
   *  restored into another. */
  id: string
  board: {
    /** Foundation half-width: a number, or `'tech'` for the desktop's
     *  foundation nodes (`buildHalfWidth`). */
    groundHalfWidth: number | 'tech'
    /** Half-width of every floor above the ground. */
    upperHalfWidth: number
    /** Highest buildable row. `Infinity` for the desktop's open sky. */
    maxRow: number
    /** Whether hulls may be moored on the water row. */
    waterRow: boolean
  }
  /** `graph`: flood-fill from the Gate, orphans fall. `column`: a block rests on
   *  the block below it or the ground, nothing else. */
  support: SupportRule
  /** `adjacency`: twins fuse into rectangles when placed (desktop).
   *  `landing`: a dropped block fuses DOWN into the twin it lands on. */
  merge: MergeRule
  mergeTypes: MergeTypes
  /**
   * Which neighbours a landed block may fuse with, in `landing` mode.
   *
   * Read only by the landing rule — `adjacency` has its own rectangle scan and
   * ignores this. Scanned in order, so the first entry wins a tie: down first,
   * because gravity is the direction a dropped piece is already moving in.
   */
  mergeDirs: ReadonlyArray<readonly [number, number]>
  /**
   * Highest tier a weld can reach, or `Infinity` for no ceiling.
   *
   * `Infinity` on both boards today. The desktop capped at three while a tier 4
   * looked like a problem — an eight-cell slab under one gun — and it turned
   * out to be the appeal: the tower gets grander as it concentrates, and the
   * frontage given up is already the price. The field stays so a mode can put
   * a ceiling back without forking the simulation.
   */
  maxMergeTier: number
  /** `footprint`: the fused fixture grows with the SHORTEST side of the cells
   *  its halves stood on. `cell`: it stays inside its one cell, because that is
   *  all a merged block occupies here. */
  mergeArt: 'footprint' | 'cell'
  fall: {
    /** Falling this many cells destroys a block outright. */
    killCells: number
    /** Column-support settling falls deal no damage. */
    gentleSettle: boolean
  }
  offers: {
    slots: number
    lanes: ReadonlyArray<OfferLane>
    weaponSlot: number
    /** The strict works slot, or null when producers are dealt through `any`. */
    supportSlot: number | null
    pool: ReadonlyArray<ShapeDef>
    rotation: boolean
    rerollMs: number
    /** Slots rerolled when a tech unlock lands mid-run. */
    unlockRerollSlots: ReadonlyArray<number>
  }
  blocks: {
    /** Block ids this mode ever deals, or null for the whole catalogue. */
    catalogue: ReadonlySet<string> | null
    /** When set, stone costs are charged as wood × this and stone never
     *  appears — one "materials" currency on a small screen. */
    foldStoneIntoWood: number | null
  }
  enemies: {
    /** Enemy ids this mode fields, or null for the whole roster. */
    roster: ReadonlySet<string> | null
    /** Live enemies allowed on the field at once; the director queues the rest. */
    maxOnField: number
    /** Bomber cruising height above the crown, or null for each def's own. */
    bomberAltitude: number | null
    /** Ground travel speed multiplier. */
    speedMul: number
    airSpawn: AirSpawn
    /**
     * Where an enemy is put on the field.
     *
     * `offscreen` — two cells past the edge of the frame, so the entrance is a
     * walk-on (the desktop, whose camera frames a whole tower and its lane).
     *
     * `viewEdge` — just INSIDE the frame's own edge, wherever the player's zoom
     * has put that edge: the sides for walkers, the top for divers. On a phone
     * the frame is barely wider than the board, the guns outrange it, and an
     * enemy placed off-screen was routinely shot dead before it had ever been
     * on screen at all — the opening wave cleared without the player seeing a
     * single monster. There, being SEEN is worth more than the walk-on.
     */
    spawnAt: SpawnAt
    /** Per-enemy `minWave` replacements. */
    minWaveOverride: Readonly<Record<string, number>>
  }
  waves: {
    budgetMul: number
    buildMs: number
    /**
     * Build windows after the first few waves, in order — the window after
     * wave 1, after wave 2, … — before `buildMs` takes over. Empty for "always
     * `buildMs`".
     *
     * The early waves are the ones a tower was already built to hold, so the
     * full window there is a countdown over an empty field, and it lands
     * exactly where a new player is deciding whether to stay.
     */
    earlyBuildMs: ReadonlyArray<number>
    /**
     * Budget scale for a first session's opening waves — wave 1, wave 2, … —
     * and 1 past the end. See `firstRunBudgetScale`.
     */
    firstRunScale: ReadonlyArray<number>
    /**
     * The flyers' share of a wave, from `airFromWave`: `base`, growing by
     * `slope` a wave, never past `cap`. See `airShare`.
     */
    airShare: { base: number; slope: number; cap: number }
    /**
     * The build window before the OPENING wave, which is a different problem
     * from every wave after it.
     *
     * The game boots into a live stage with a tower already standing (the
     * scripted opening's fort on a first session, the player's own opener
     * after that), and wave 1 is the one wave that tower is guaranteed to
     * hold. A full build window there is not a decision — it is the player
     * watching a countdown before anything has happened, which is the most
     * expensive place in the whole run to spend fifteen seconds.
     *
     * The clock does not start until the player has actually touched the game
     * (`awaitingFirstInteraction`), so this is three seconds of THEIRS, not
     * three seconds of the page loading. Building carries on during the
     * battle, so nothing is taken away — only the waiting.
     */
    firstBuildMs: number
    /** All spawning finishes inside this window. */
    spawnWindowMs: number
    /** Past this, every remaining order is released at once. */
    flushAtMs: number
    bossEvery: number
    bossBudget: number
    airFromWave: number
    seaFromWave: number | null
    siegeFromWave: number | null
    previews: PreviewTable
    /** Scales `expectedPower` — a smaller board fields a smaller tower. */
    expectedPowerMul: number
    hpSlope: number
    /** Scales the wood/stone wave reward; coins are never scaled. */
    rewardMul: number
  }
  difficulty: {
    /** Divides the hoarding thresholds. */
    hoardDivisor: number
  }
  economy: { startWood: number; startStone: number }
  tech: { nodes: ReadonlyArray<TechNode>; stateKey: string }
  abilities: {
    arrowRain: 'aim' | 'auto'
    cavalry: boolean
    rangeBoost: boolean
    speeds: ReadonlyArray<number>
  }
  save: {
    runKey: string
    bestWaveKey: string
    onboardedKey: string
    tutorialKey: string
  }
  camera: 'auto' | 'fixed'
}

/** Exactly the game as it shipped before the seam existed. */
export const DESKTOP_RULES: RuleSet = {
  id: 'desktop',
  board: { groundHalfWidth: 'tech', upperHalfWidth: 22, maxRow: Infinity, waterRow: true },
  support: 'graph',
  merge: 'adjacency',
  mergeTypes: 'weapons',
  // Unused under `adjacency`; kept honest rather than empty.
  mergeDirs: [[0, -1]],
  maxMergeTier: Infinity,
  mergeArt: 'footprint',
  fall: { killCells: 5, gentleSettle: false },
  offers: {
    slots: OFFER_SLOTS,
    lanes: ['structure', 'weapon', 'any', 'any', 'support'],
    weaponSlot: WEAPON_SLOT,
    supportSlot: SUPPORT_SLOT,
    pool: SHAPE_DEFS,
    rotation: true,
    rerollMs: 3_000,
    unlockRerollSlots: [2, 3]
  },
  blocks: { catalogue: null, foldStoneIntoWood: null },
  enemies: {
    roster: null,
    maxOnField: Infinity,
    bomberAltitude: null,
    speedMul: 1,
    airSpawn: 'sides',
    spawnAt: 'offscreen',
    minWaveOverride: {}
  },
  waves: {
    budgetMul: 1,
    buildMs: 15_000,
    earlyBuildMs: [],
    firstRunScale: [0.6, 0.8],
    airShare: { base: 0.1, slope: 0.022, cap: 0.35 },
    firstBuildMs: 3_000,
    spawnWindowMs: 82_000,
    flushAtMs: 96_000,
    bossEvery: 10,
    bossBudget: 0.6,
    airFromWave: 9,
    seaFromWave: 12,
    siegeFromWave: 14,
    previews: PREVIEWS,
    expectedPowerMul: 1,
    hpSlope: 0.135,
    rewardMul: 1
  },
  difficulty: { hoardDivisor: 1 },
  economy: { startWood: 120, startStone: 40 },
  tech: { nodes: TECH_NODES, stateKey: TECH_KEY },
  abilities: { arrowRain: 'aim', cavalry: true, rangeBoost: true, speeds: [1, 1.5, 3] },
  save: {
    runKey: RUN_KEY,
    bestWaveKey: BEST_WAVE_KEY,
    onboardedKey: ONBOARDED_KEY,
    tutorialKey: TUTORIAL_KEY
  },
  camera: 'auto'
}

// ─── The active rules ───────────────────────────────────────────────────────
//
// A plain holder rather than a Vue ref: this is the domain layer, and the two
// reactive consumers (`useTowerProgress`, the scenes) subscribe through
// `onRulesChange` and bump their own refs. The simulation reads
// `activeRules.current` directly — sixty times a second, from hot loops — and
// a proxy there would be paid for on every tick.

type RulesListener = (rules: RuleSet) => void
const listeners = new Set<RulesListener>()

export const activeRules: { current: RuleSet } = { current: DESKTOP_RULES }

/** The rules in force right now. */
export const rulesNow = (): RuleSet => activeRules.current

/**
 * Swap the active rule set and tell every subscriber.
 *
 * Legal before a run starts and between runs; `useTowerGame.applyRules` is the
 * entry point the scenes use, because it also resizes the sim's own per-slot
 * state. Calling this mid-run is not supported — a run is played to one set of
 * rules from its first tick to its last.
 */
export const setActiveRules = (rules: RuleSet): void => {
  activeRules.current = rules
  for (const fn of listeners) fn(rules)
}

export const onRulesChange = (fn: RulesListener): (() => void) => {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

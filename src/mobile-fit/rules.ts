import type { RuleSet } from '@/game/rules'
import { PIECE_DEFS } from './pieces'
import { TECH_NODES_DROPMERGE } from './tech'
import {
  DROPMERGE_ROSTER, DROPMERGE_MIN_WAVE, DROPMERGE_PREVIEWS, DROPMERGE_BLOCKS
} from './roster'
import {
  M2_RUN_KEY, M2_TECH_KEY, M2_BEST_WAVE_KEY, M2_ONBOARDED_KEY, M2_TUTORIAL_KEY
} from '@/keys'

// ─── Drop & Merge Siege ─────────────────────────────────────────────────────
//
// The portrait phone game. Five columns, seven rows, one thumb: tap a column
// and the offered block drops into it; land it on its twin and the two fuse.
// See `mobile-fit.md` §6 for the design and
// `game-implementation-plan-mobile-fit-2.md` for every number below.

/** Columns either side of the Gate. */
export const BOARD_HALF_WIDTH = 2
/** Highest row a block may come to rest on. */
export const BOARD_MAX_ROW = 6
/** Rows of sky framed above the board — the air lane. */
export const SKY_ROWS = 2
/** Rows of beach and water framed below the ground line. */
export const GROUND_ROWS = 1
/** Cells of lane framed either side of the board. */
export const LANE_CELLS = 1.25
/** Stone is worth this much wood when the two are one pile. */
export const STONE_FOLD = 1.4

export const DROPMERGE_RULES: RuleSet = {
  id: 'dropmerge',
  board: {
    groundHalfWidth: BOARD_HALF_WIDTH,
    upperHalfWidth: BOARD_HALF_WIDTH,
    maxRow: BOARD_MAX_ROW,
    waterRow: false
  },
  support: 'column',
  merge: 'landing',
  mergeTypes: 'all',
  // A landed block fuses with ANY twin it touches, not just the one it landed
  // on. Two mortars that end up side by side are as obviously a pair as two
  // stacked ones, and leaving them unfused read as the board missing a merge
  // the player had already made. Down leads: it is where the piece was going.
  mergeDirs: [[0, -1], [-1, 0], [1, 0], [0, 1]],
  // No ceiling. The desktop's tier-3 cap exists because a merged block there
  // keeps its halves' footprint; here the weld always lands in ONE cell, so
  // the only thing a deeper tier costs is the frontage the player gave up to
  // build it — which is the bet the mechanic is made of.
  maxMergeTier: Infinity,
  mergeArt: 'cell',
  // A settle is one row at a time and costs nothing; nothing here can fall far
  // enough to matter, so the kill distance is never reached.
  fall: { killCells: 99, gentleSettle: true },
  offers: {
    slots: 3,
    lanes: ['structure', 'weapon', 'any'],
    weaponSlot: 1,
    supportSlot: null,
    pool: PIECE_DEFS,
    rotation: false,
    rerollMs: 5_000,
    unlockRerollSlots: [2]
  },
  blocks: { catalogue: DROPMERGE_BLOCKS, foldStoneIntoWood: STONE_FOLD },
  enemies: {
    roster: DROPMERGE_ROSTER,
    maxOnField: 10,
    // Two rows of sky above a seven-row board: the desktop's 3.2 would put the
    // bombers out of the frame.
    bomberAltitude: 1.6,
    speedMul: 0.8,
    airSpawn: 'top',
    // Just inside the frame, wherever the zoom has put its edge. Placed two
    // cells OFF it, as the desktop does, the opening wave's only grunt was shot
    // dead by the fort's cannon (range 8.5) before it ever reached a frame
    // barely five cells either side of the Gate — measured, a first session's
    // first monster came on screen fifteen seconds in, after the first wave had
    // already been won unseen. Players were leaving in that window.
    spawnAt: 'viewEdge',
    minWaveOverride: DROPMERGE_MIN_WAVE
  },
  waves: {
    // 0.5, not the 0.4 the plan started from: at 0.4 the opening waves were a
    // grunt or two — an empty first minute rather than a gentle one. Half the
    // desktop's budget lands two grunts and the preview bat on wave 1.
    budgetMul: 0.5,
    buildMs: 10_000,
    // Short breaks between the first waves. Building carries on DURING a wave
    // on this board, so the build phase buys nothing a player needs early on —
    // and two ten-second countdowns inside the first forty seconds were two
    // stretches of empty field exactly where first sessions were ending.
    // Four seconds after wave 1: the starter fort's gun holds waves 1 and 2 on
    // its own, so the only thing a longer gap buys there is waiting.
    earlyBuildMs: [4_000, 6_000, 8_000],
    // No first-session discount. The budget is already halved, and the old
    // 60 % opening made wave 1 a single grunt — the fort killed it off-screen
    // and the first wave was over before it had begun. Undiscounted it is a
    // grunt or two and a bat (the preview) against a fort that cannot lose
    // them: busy, not dangerous.
    firstRunScale: [1, 1],
    // The sky is most of a portrait screen, and the one lane the whole board
    // can see coming — so it carries far more of each wave than on the
    // desktop: 28 % from wave 2, climbing to 45 %. Every gun but the bombard
    // shoots up, so it is pressure the hand can always answer.
    //
    // NOT with a guaranteed flyer per wave on top. That was tried: a share of a
    // small wave comes to less than a bat, so a floor only ever bites on small
    // waves — and a wave is small mostly because the director is trimming it
    // for a tower that is struggling. It handed a wall-skipping flyer to
    // exactly that player, and measured, an average player's 5-minute survival
    // fell from 10 in 12 to 3 in 8, with deaths inside the three-minute window.
    airShare: { base: 0.28, slope: 0.02, cap: 0.45 },
    // ZERO, where the desktop board waits three seconds for the player's first
    // gesture.
    //
    // A five-column board with nothing on it is not a calm opening, it is a
    // game that has not started: there is no tower to admire, no lane to read
    // and nothing coming, so the first thing the player does is wait. Wave 1
    // here is a handful of monsters against a fort that already stands — the
    // threat IS the introduction, and it should be on screen by the time the
    // loader clears.
    //
    // A zero window also means the opening does not wait on the gesture gate
    // (see `isBuildClockHeld`). The gesture still gates what the PORTAL is
    // told — `gameplayStart` is held until the player touches the game — but
    // it no longer gates what the player is shown.
    firstBuildMs: 0,
    spawnWindowMs: 35_000,
    flushAtMs: 45_000,
    bossEvery: 8,
    bossBudget: 0.5,
    // Was 4, and did nothing: the bat's own `minWave` is 9, so the air pool
    // was empty until then and waves 4-8 fielded no flyers at all. The roster
    // now unlocks the bat at 2 (`DROPMERGE_MIN_WAVE`) to match.
    airFromWave: 2,
    seaFromWave: null,
    siegeFromWave: null,
    previews: DROPMERGE_PREVIEWS,
    // A 34-cell board fields roughly two fifths of a desktop tower. Fitted
    // against the replay harness — see the plan's §7.3.
    expectedPowerMul: 0.4,
    hpSlope: 0.1,
    rewardMul: 0.6
  },
  difficulty: { hoardDivisor: 2 },
  // Ninety materials; stone is folded, so there is no separate stone stock.
  economy: { startWood: 90, startStone: 0 },
  tech: { nodes: TECH_NODES_DROPMERGE, stateKey: M2_TECH_KEY },
  // Two rungs, and the fast one is now FREE.
  //
  // This board has always refused the tower game's third rung — a phone bar has
  // no room for a third segment beside the wave control, and a five-column
  // board clears a wave far faster than a tower does, so the wave-skipping case
  // 3x exists for barely arises here. The old pair was 1x and a video-gated 2x;
  // that 2x becomes the free 1.5x, which leaves this board with NO paid speed
  // rung at all. That is a rewarded placement given up on purpose: the
  // alternative was keeping a toll on the one nudge the tower game now gives
  // away, and having the two boards disagree about what 1.5x costs.
  abilities: { arrowRain: 'auto', cavalry: false, rangeBoost: false, speeds: [1, 1.5] },
  save: {
    runKey: M2_RUN_KEY,
    bestWaveKey: M2_BEST_WAVE_KEY,
    onboardedKey: M2_ONBOARDED_KEY,
    tutorialKey: M2_TUTORIAL_KEY
  },
  camera: 'fixed'
}

/**
 * ─── The seeded leaderboard ─────────────────────────────────────────────────
 *
 * Builds a synthetic board — `data/leaderboard-seed.json` — in exactly the
 * shape `scripts/leaderboard-snapshot.mjs` writes, so `vite.config.ts` can bake
 * either one into `virtual:leaderboard-snapshot` without the game knowing which
 * it got.
 *
 * WHY A SYNTHETIC BOARD EXISTS AT ALL. Poki forbids every external runtime
 * request, so the build ships `VITE_LEADERBOARD_URL` empty and the client is
 * read-only by construction: it cannot POST a score, which means the board a
 * Poki player is ranked against can NEVER grow a row. Yandex is the same
 * setting for a different reason (its moderators reject third-party storage
 * URLs). A board that can never grow has to be born plausible — a snapshot
 * fetched from a Worker with eleven real rows would tell every Poki player they
 * are in the top twelve, which is worse than showing no rank at all.
 *
 * So these builds get a POPULATION rather than a recording: a stage-quit curve
 * of the shape hybrid-casual funnels actually have, priced into scores with the
 * game's own kill economy. It is not real data and is not presented as such
 * anywhere — the only player-facing surface is "#1,842 of 2,871" on the result
 * screen, and every number in it comes from the curve below.
 *
 * DETERMINISTIC. Same inputs, same bytes: the file is committed, the generator
 * is seeded, and `tests/game/leaderboardSeed.test.ts` regenerates it and
 * compares. A board that quietly reshuffled on every build would move a
 * player's rank between two sessions of the same game.
 *
 * Run it by hand:
 *
 *     pnpm leaderboard:seed
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const SEED_FILE = resolve(
  fileURLToPath(new URL('../data/leaderboard-seed.json', import.meta.url))
)

// ─── The curve ────────────────────────────────────────────────────
//
// Where players stop. `STAGE_HEAD[s - 1]` is the fraction of the population
// whose best stage is exactly `s`, for the first ten stages — the part of a
// funnel that is a design decision rather than a decay. Past that it is one
// power law, because that is the shape a retention tail actually has: fast at
// first and flatter the deeper it goes, with no second knee.
//
// The brief, and where each clause of it lives:
//
//   • a few wash out on stages 1-2      →  9.5 %  STAGE_HEAD[0..1]
//   • the quit mode is stages 3-4       → 27.0 %  STAGE_HEAD[2..3], the peak
//   • most who stay stop between 5-10   → 38.8 %  STAGE_HEAD[4..9]
//   • only ~8 % get past stage 20       →  8.2 %  PAST_20_SHARE — the tail's
//                                                  exponent is SOLVED for this
//   • the best reach 40+                →  1.2 %, with #1 on stage MAX_STAGE
//
// Stage 1-2 being SMALL is the deliberate part. A first stage nobody survives
// would put the mode at 1, and this game's opening wave is a handful of
// monsters against a fort that already stands — players who leave that early
// left the page, they did not lose.

/** Best-stage shares for stages 1-10, authored outright. Stage `s` is index
 *  `s - 1`. */
export const STAGE_HEAD = [
  0.034, // 1
  0.061, // 2
  0.128, // 3  ─┐ the quit mode
  0.142, // 4  ─┘
  0.104, // 5
  0.082, // 6
  0.066, // 7
  0.054, // 8
  0.045, // 9
  0.037  // 10
]

/** The deepest stage anyone on this board reached — the seeded #1 stands here. */
export const MAX_STAGE = 48

/**
 * Share of the population whose best stage is past 20.
 *
 * The one number the tail is FITTED TO rather than a consequence of it: the
 * exponent below is solved so that stages 21..MAX_STAGE carry exactly this
 * mass. Written this way round because "~8 % go past stage 20" is the claim
 * about the game, and an exponent is only ever the way it got satisfied.
 */
export const PAST_20_SHARE = 0.082

/** Everything the head does not carry. */
const TAIL_MASS = 1 - STAGE_HEAD.reduce((a, b) => a + b, 0)

/** Unnormalised power-law weight of stage `s` under exponent `a`. */
const tailWeight = (stage, a) => Math.pow(stage, -a)

/**
 * The exponent that makes the tail carry `PAST_20_SHARE` past stage 20.
 *
 * Bisection rather than a fitted constant: the head, `MAX_STAGE` and
 * `PAST_20_SHARE` are all things someone will want to edit, and each of them
 * moves this. Solving it here means the curve is still the curve afterwards
 * instead of silently drifting off the brief. The share of the tail sitting
 * past stage 20 falls monotonically as `a` rises, so a plain bisection is exact
 * to the last bit in 200 steps.
 */
const solveTailExponent = () => {
  const pastShare = (a) => {
    let all = 0
    let past = 0
    for (let s = 11; s <= MAX_STAGE; s++) {
      const w = tailWeight(s, a)
      all += w
      if (s > 20) past += w
    }
    return (TAIL_MASS * past) / all
  }
  let lo = 0.1
  let hi = 8
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (pastShare(mid) > PAST_20_SHARE) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export const TAIL_EXPONENT = solveTailExponent()

/** `shares[s]` = fraction of players whose best stage is exactly `s`.
 *  Index 0 is unused so the array reads by stage number. */
export const stageShares = () => {
  const shares = [0, ...STAGE_HEAD]
  let weightSum = 0
  for (let s = 11; s <= MAX_STAGE; s++) weightSum += tailWeight(s, TAIL_EXPONENT)
  for (let s = 11; s <= MAX_STAGE; s++) {
    shares.push((tailWeight(s, TAIL_EXPONENT) / weightSum) * TAIL_MASS)
  }
  return shares
}

// ─── The kill economy ───────────────────────────────────────────────────────
//
// `CUM_KILLS[ruleset][s]` = the leaderboard score of a player who has cleared
// every wave up to and including `s` at difficulty 1 — one point per enemy,
// five for a boss, exactly as `runScore` counts it.
//
// MEASURED, not modelled: produced by walking the real `planWave` from
// `src/game/waves.ts` with each ruleset's own `waves` options. That is why
// `leaderboardSeed.test.ts` recomputes both rows from `planWave` and fails if
// they have drifted — a balance change that makes waves 30 % fatter also makes
// every score on this board 30 % too small, and nothing else would notice.
//
// Difficulty is left at 1 here and applied as a per-player multiplier in
// `buildSeedBoard`: the adaptive director scales the wave BUDGET linearly, and
// the measured curves confirm the kill count follows it to within ~2 %.

// Re-measured 2026-09-14, after the grumpling was retuned to fewer-and-tankier
// (65 HP at cost 24, was 22 at 10). The director spends a budget, so a costlier
// unit means fewer bodies per wave and fewer points per stage — every number
// below came down, most sharply in the opening.
export const CUM_KILLS = {
  /** The landscape tower-defence scene — `DESKTOP_RULES`. */
  desktop: [
    0, 2, 5, 15, 30, 42, 55, 68, 84, 100, 114, 133, 152, 173, 194, 220, 244,
    267, 292, 321, 338, 362, 384, 406, 432, 455, 480, 506, 536, 563, 587,
    617, 647, 676, 704, 739, 768, 802, 836, 870, 898, 932, 974, 1016, 1058,
    1102, 1144, 1190, 1232
  ],
  /** The portrait Drop & Merge scene — `DROPMERGE_RULES`, half the budget. */
  dropmerge: [
    0, 1, 3, 8, 15, 21, 26, 34, 42, 51, 58, 65, 73, 81, 91, 101, 112, 126,
    138, 160, 173, 188, 204, 218, 233, 253, 274, 293, 314, 338, 361, 384,
    398, 422, 448, 477, 501, 530, 557, 581, 599, 629, 661, 697, 729, 762,
    798, 832, 855
  ]
}

/**
 * Share of the seeded population playing the portrait board.
 *
 * Poki's traffic is overwhelmingly mobile and the two scenes are split by
 * device, so three quarters of the board is Drop & Merge. It matters because
 * the two price a stage very differently — stage 20 is 183 kills on the phone
 * and 381 on the desktop — and a board built from one curve alone would rank
 * the other device's players against a population that does not exist.
 */
export const MOBILE_SHARE = 0.75

/**
 * The adaptive director's multiplier for a player whose best stage is `s`.
 *
 * Deep runs are not just longer, they are denser: `adaptiveFactor` prices each
 * wave against what the player has standing, so someone who reached stage 40
 * has been fighting waves about half again the size of the ones a stage-4
 * player met. A flat multiplier would compress the top of the board into the
 * middle, and the whole point of a tail is that it is out of reach.
 *
 * Stays inside `[MIN_ADAPTIVE, MAX_ADAPTIVE]` from `src/game/difficulty.ts` by
 * a wide margin — this is where players sit, not where the clamp is.
 */
const difficultyFor = (stage, jitter) =>
  Math.max(0.8, Math.min(2, 0.92 + 0.016 * (stage - 1) + jitter))

// ─── Identities ─────────────────────────────────────────────────────────────

/**
 * The word list `makeAnonName` mints from, copied from
 * `src/use/usePlayerIdentity.ts`.
 *
 * Poki hands out no player id and no display name, so EVERY real row on a Poki
 * board would be one of these plus six digits. Pinned against the source by the
 * test rather than by this comment.
 */
export const ANON_WORDS = [
  'Anonymous', 'Warden', 'Bastion', 'Rampart', 'Sentinel',
  'Bulwark', 'Keeper', 'Vanguard', 'Watcher', 'Mason'
]

// ─── Generation ─────────────────────────────────────────────────────────────

/** mulberry32 — small, seedable, and identical on every Node version. */
const makeRng = (seed) => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Split `total` players across the curve by LARGEST REMAINDER.
 *
 * Not by sampling. Sampling a few thousand draws would leave the shipped board
 * a percentage point or two off the curve it is supposed to be, and "~8 % past
 * stage 20" is a claim about the file, not about its expectation. Rounding
 * error goes to the stages with the largest fractional part, so the counts sum
 * to `total` exactly and the curve survives the trip through integers.
 *
 * Index 0 is the unused stage-zero slot and is never awarded a remainder.
 */
const allocate = (shares, total) => {
  const counts = shares.map((s) => Math.floor(s * total))
  let left = total - counts.reduce((a, b) => a + b, 0)
  const order = shares
    .map((s, i) => ({ i, frac: s * total - Math.floor(s * total) }))
    .slice(1)
    .sort((a, b) => b.frac - a.frac || a.i - b.i)
  for (let k = 0; left > 0; k++, left--) counts[order[k % order.length].i] += 1
  return counts
}

/** How many rows the board publishes — the same cut the Worker's `/top` uses. */
export const PUBLISHED_ROWS = 100

/** Players on the seeded board. Not a round number on purpose: it is read back
 *  to the player verbatim as "of 2,871". */
export const PLAYER_TOTAL = 2871

/** Fixed so the committed file is reproducible. Changing it reshuffles every
 *  name and every score, which is a deliberate act, not a rebuild. */
export const RNG_SEED = 0x7047_5311

/**
 * Build the whole board.
 *
 * @param {{ players?: number, seed?: number, now?: number }} [opts]
 * @returns the snapshot shape `vite.config.ts` bakes: `updatedAt`, `total`,
 *          `entries` (the published rows) and `dist` (the score histogram over
 *          the WHOLE population, which is what every rank is derived from).
 */
export const buildSeedBoard = (opts = {}) => {
  const players = Math.max(1, Math.trunc(opts.players ?? PLAYER_TOTAL))
  const rng = makeRng(opts.seed ?? RNG_SEED)
  const now = opts.now ?? Date.now()

  const counts = allocate(stageShares(), players)

  /** @type {{ score: number, stage: number }[]} */
  const population = []
  for (let stage = 1; stage < counts.length; stage++) {
    for (let n = 0; n < counts[stage]; n++) {
      const table = rng() < MOBILE_SHARE ? CUM_KILLS.dropmerge : CUM_KILLS.desktop
      // Waves 1..stage-1 were cleared outright; the stage they died on is
      // charged a slice, because a run ends mid-wave and the kills up to that
      // point are already on the tally.
      const cleared = table[Math.min(stage - 1, table.length - 1)]
      const nextWave = table[Math.min(stage, table.length - 1)] - cleared
      const partial = nextWave * (0.1 + rng() * 0.8)
      // Triangular jitter: two uniforms, so most players sit near the curve and
      // the outliers are rare rather than evenly spread.
      const jitter = (rng() + rng() - 1) * 0.13
      const score = Math.round((cleared + partial) * difficultyFor(stage, jitter))
      population.push({ score: Math.max(1, score), stage })
    }
  }

  population.sort((a, b) => b.score - a.score || b.stage - a.stage)

  // ── The histogram ──
  // Score-DESC, one bucket per distinct score. This is the whole reason the
  // board is worth baking: `rankFromDist` walks it for an EXACT rank at any
  // score, including the 96 % of players who sit far below the published cut.
  /** @type {[number, number][]} */
  const dist = []
  for (const p of population) {
    const last = dist[dist.length - 1]
    if (last && last[0] === p.score) last[1] += 1
    else dist.push([p.score, 1])
  }

  // ── The published rows ──
  // Ranks tie exactly as the Worker's `COUNT(*) WHERE score > ?` does: two
  // players on the same score are both #7 and nobody is #8.
  const used = new Set()
  const name = () => {
    for (let attempt = 0; attempt < 50; attempt++) {
      const word = ANON_WORDS[Math.floor(rng() * ANON_WORDS.length)]
      const digits = String(Math.floor(rng() * 1_000_000)).padStart(6, '0')
      const candidate = `${word}${digits}`
      if (!used.has(candidate)) { used.add(candidate); return candidate }
    }
    return `Anonymous${String(used.size).padStart(6, '0')}`
  }

  const entries = []
  let above = 0
  let prevScore = Number.POSITIVE_INFINITY
  let prevRank = 1
  for (let i = 0; i < Math.min(PUBLISHED_ROWS, population.length); i++) {
    const p = population[i]
    const rank = p.score === prevScore ? prevRank : above + 1
    entries.push({ rank, name: name(), score: p.score, wave: p.stage })
    prevScore = p.score
    prevRank = rank
    above += 1
  }

  return {
    // Marks the file for anyone who opens it. `vite.config.ts` reads only the
    // board fields, so it never reaches the bundle.
    synthetic: true,
    source: 'seed',
    generator: 'scripts/leaderboard-seed.mjs',
    // Midnight UTC of the generation day, not the exact instant: the file has
    // to regenerate byte-identically for the freshness test to be able to say
    // "this is stale" and mean it.
    updatedAt: Math.floor(now / 86_400_000) * 86_400_000,
    total: population.length,
    entries,
    dist
  }
}

/** Read whatever is committed, or `null`. Same contract as `readSnapshot`. */
export const readSeed = () => {
  if (!existsSync(SEED_FILE)) return null
  try {
    const parsed = JSON.parse(readFileSync(SEED_FILE, 'utf-8'))
    if (!parsed || !Array.isArray(parsed.entries) || !Array.isArray(parsed.dist)) return null
    if (!(Number(parsed.total) > 0)) return null
    return parsed
  } catch {
    return null
  }
}

export const writeSeed = (board) => {
  mkdirSync(dirname(SEED_FILE), { recursive: true })
  writeFileSync(SEED_FILE, JSON.stringify(board, null, 2) + '\n', 'utf-8')
  return board
}

// ─── CLI ────────────────────────────────────────────────────────────────────

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const board = writeSeed(buildSeedBoard())
  const shares = stageShares()
  const past20 = shares.slice(21).reduce((a, b) => a + b, 0)
  const past40 = shares.slice(40).reduce((a, b) => a + b, 0)
  console.log(
    `[leaderboard] seeded ${board.total} players, ${board.entries.length} published rows, `
    + `top score ${board.dist[0][0]} (stage ${board.entries[0].wave}), `
    + `${board.dist.length} score buckets`
  )
  console.log(
    `[leaderboard] curve: ${(past20 * 100).toFixed(1)}% past stage 20, `
    + `${(past40 * 100).toFixed(2)}% at stage 40+`
  )
  console.log(`[leaderboard] wrote ${SEED_FILE}`)
}

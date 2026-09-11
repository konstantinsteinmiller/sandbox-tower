import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  ANON_WORDS, CUM_KILLS, MAX_STAGE, PAST_20_SHARE, PLAYER_TOTAL, PUBLISHED_ROWS,
  SEED_FILE, STAGE_HEAD, TAIL_EXPONENT, buildSeedBoard, readSeed, stageShares
} from '../../scripts/leaderboard-seed.mjs'
import { planWave } from '@/game/waves'
import { ENEMY_DEFS } from '@/game/enemies'
import { DESKTOP_RULES, type RuleSet } from '@/game/rules'
import { DROPMERGE_RULES } from '@/mobile-fit/rules'
import { rankFromDist, type BoardSnapshot } from '@/use/leaderboardSnapshot'

/**
 * ─── The seeded board ───────────────────────────────────────────────────────
 *
 * Poki's client is read-only by construction — no runtime request means no
 * POST — so the board it ranks players against can never gain a row. It is
 * therefore generated rather than recorded, and everything a recording would
 * have got for free has to be asserted here instead:
 *
 *   • the CURVE is the one that was asked for, not one that drifted;
 *   • the SCORES are the ones this game's waves actually pay out, so a player's
 *     rank moves the way clearing a stage should move it;
 *   • the FILE on disk is the one the generator produces today.
 *
 * The third is the quiet one. The board is committed, so a curve edited without
 * a regenerate ships the old population under the new documentation, and no
 * other test in the suite would notice.
 */

// ─── The curve ──────────────────────────────────────────────────────────────

describe('the stage-quit curve', () => {
  const shares = stageShares()
  /** Share of the population whose best stage is in `[from, to]`. */
  const band = (from: number, to: number) =>
    shares.slice(from, to + 1).reduce((a: number, b: number) => a + b, 0)

  it('is a probability distribution over stages 1..MAX_STAGE', () => {
    expect(shares).toHaveLength(MAX_STAGE + 1)
    expect(shares[0]).toBe(0)
    expect(band(1, MAX_STAGE)).toBeCloseTo(1, 10)
    for (let s = 1; s <= MAX_STAGE; s++) expect(shares[s]).toBeGreaterThan(0)
  })

  it('puts the quit mode on stages 3 and 4', () => {
    const peak = Math.max(...shares.slice(1))
    expect(shares.indexOf(peak)).toBe(4)
    // The biggest two-stage block on the board, ahead of 5-6 and of 1-2.
    expect(band(3, 4)).toBeGreaterThan(band(5, 6))
    expect(band(3, 4)).toBeGreaterThan(band(1, 2))
    expect(band(3, 4)).toBeGreaterThan(0.25)
  })

  it('loses only a few players on stages 1 and 2', () => {
    expect(band(1, 2)).toBeLessThan(0.12)
    // Fewer on stage 1 than on stage 2: the opening wave is one grunt against a
    // fort that already stands, so a stage-1 exit is a player who left the page.
    expect(shares[1]).toBeLessThan(shares[2])
  })

  it('keeps most of the rest between stages 5 and 10', () => {
    expect(band(5, 10)).toBeGreaterThan(0.35)
    expect(band(5, 10)).toBeGreaterThan(band(11, MAX_STAGE))
  })

  it('lets ~8% past stage 20', () => {
    expect(band(21, MAX_STAGE)).toBeGreaterThan(0.07)
    expect(band(21, MAX_STAGE)).toBeLessThan(0.09)
    // The tail's exponent is SOLVED for this share, so the two agree exactly —
    // if they ever stop agreeing, the bisection failed to converge.
    expect(band(21, MAX_STAGE)).toBeCloseTo(PAST_20_SHARE, 10)
    expect(TAIL_EXPONENT).toBeGreaterThan(1)
    expect(TAIL_EXPONENT).toBeLessThan(4)
  })

  it('leaves a thin band of players at stage 40+', () => {
    expect(band(40, MAX_STAGE)).toBeGreaterThan(0.003)
    expect(band(40, MAX_STAGE)).toBeLessThan(0.015)
    expect(MAX_STAGE).toBeGreaterThanOrEqual(40)
  })

  it('never rises again once it has started falling', () => {
    for (let s = 4; s < MAX_STAGE; s++) {
      expect(shares[s + 1], `stage ${s + 1} vs ${s}`).toBeLessThan(shares[s])
    }
    expect(STAGE_HEAD).toHaveLength(10)
  })

  it('joins its authored head to its solved tail without a step', () => {
    // The join is the one place a two-piece curve shows the seam — a cliff or a
    // shelf at stage 11 is a funnel nobody has. Every step from 8 to 13 falls
    // at roughly the same rate.
    const step = (s: number) => shares[s + 1] / shares[s]
    for (let s = 8; s <= 13; s++) {
      expect(step(s), `step ${s}→${s + 1}`).toBeGreaterThan(0.78)
      expect(step(s), `step ${s}→${s + 1}`).toBeLessThan(0.9)
    }
    // And it flattens with depth, the way a retention tail does.
    expect(step(30)).toBeGreaterThan(step(12))
  })
})

// ─── The kill economy the scores are priced in ──────────────────────────────

/**
 * The score a player holds after clearing every wave up to `wave`, straight
 * from the real director: one point per enemy, five for a boss, exactly as
 * `runScore` counts it.
 */
const cumulativeKills = (rules: RuleSet, upTo: number): number[] => {
  const w = rules.waves
  const cum = [0]
  let total = 0
  for (let wave = 1; wave <= upTo; wave++) {
    // Every option `useTowerGame.waveOpts` hands the director — a field left
    // out here measures a different director from the one the game runs.
    const plan = planWave(wave, 1, false, {
      budgetMul: w.budgetMul,
      roster: rules.enemies.roster,
      minWaveOverride: rules.enemies.minWaveOverride,
      airFromWave: w.airFromWave,
      airShare: w.airShare,
      firstRunScale: w.firstRunScale,
      seaFromWave: w.seaFromWave,
      siegeFromWave: w.siegeFromWave,
      previews: w.previews,
      spawnWindowMs: w.spawnWindowMs,
      bossEvery: w.bossEvery,
      bossBudget: w.bossBudget
    })
    for (const order of plan.orders) total += ENEMY_DEFS[order.typeId]?.boss ? 5 : 1
    cum.push(total)
  }
  return cum
}

describe('the baked kill curves', () => {
  /**
   * THE DRIFT GUARD.
   *
   * `CUM_KILLS` is measured from `planWave`, and nothing at runtime re-derives
   * it. Rebalance the waves 30 % fatter and every score on the seeded board is
   * 30 % too small — a real stage-6 player would rank where the curve says a
   * stage-8 player sits, and the only symptom is a leaderboard that flatters.
   *
   * Ten per cent of slack, because a one-enemy shift in a single wave is noise
   * and re-seeding for it would be churn. Anything wider is a balance change
   * that wants `pnpm leaderboard:seed` run after it.
   */
  it.each([
    ['dropmerge', DROPMERGE_RULES, CUM_KILLS.dropmerge],
    ['desktop', DESKTOP_RULES, CUM_KILLS.desktop]
  ])('%s still matches what planWave pays out', (_name, rules, baked: number[]) => {
    expect(baked).toHaveLength(MAX_STAGE + 1)
    const real = cumulativeKills(rules as RuleSet, MAX_STAGE)
    for (let stage = 1; stage <= MAX_STAGE; stage++) {
      expect(
        Math.abs(baked[stage]! - real[stage]!) / real[stage]!,
        `stage ${stage}: baked ${baked[stage]}, planWave now pays ${real[stage]} `
        + '— rerun `pnpm leaderboard:seed`'
      ).toBeLessThan(0.1)
    }
  })

  it('prices the portrait board below the landscape one at every stage', () => {
    // Half the wave budget on a five-column board. A seed built from one curve
    // alone would rank the other device's players against a population that
    // does not exist.
    for (let stage = 1; stage <= MAX_STAGE; stage++) {
      expect(CUM_KILLS.dropmerge[stage]).toBeLessThan(CUM_KILLS.desktop[stage])
    }
  })

  it('is strictly increasing — a cleared wave always pays something', () => {
    for (const table of [CUM_KILLS.dropmerge, CUM_KILLS.desktop]) {
      for (let stage = 1; stage <= MAX_STAGE; stage++) {
        expect(table[stage]).toBeGreaterThan(table[stage - 1])
      }
    }
  })
})

// ─── The generated board ────────────────────────────────────────────────────

const board = buildSeedBoard({ now: 1_700_000_000_000 })

describe('the generated board', () => {
  it('holds exactly the requested population', () => {
    expect(board.total).toBe(PLAYER_TOTAL)
    expect(board.dist.reduce((a: number, [, n]: [number, number]) => a + n, 0)).toBe(PLAYER_TOTAL)
  })

  it('gives every stage on the curve at least one player', () => {
    // Largest-remainder, not sampling: "~8 % past stage 20" is a claim about
    // the shipped file, not about its expectation — and the deepest stage still
    // has somebody standing on it, so the board has a real #1.
    const shares = stageShares()
    for (let s = 1; s <= MAX_STAGE; s++) {
      expect(Math.round(shares[s] * PLAYER_TOTAL), `stage ${s}`).toBeGreaterThanOrEqual(1)
    }
    expect(board.entries[0]!.wave).toBeGreaterThanOrEqual(40)
  })

  it('orders the histogram score-DESC with no duplicate buckets', () => {
    // `rankFromDist` walks it and stops at the first bucket that is not
    // strictly greater. Out of order, every rank below that point is wrong.
    for (let i = 1; i < board.dist.length; i++) {
      expect(board.dist[i]![0]).toBeLessThan(board.dist[i - 1]![0])
    }
    for (const [score, n] of board.dist) {
      expect(score).toBeGreaterThan(0)
      expect(n).toBeGreaterThan(0)
      expect(Number.isInteger(score) && Number.isInteger(n)).toBe(true)
    }
  })

  it('publishes a top slice that is a fraction of the population', () => {
    // The cut sits far above where a first-session player ever gets — which is
    // why the histogram is baked alongside the rows rather than the rows alone.
    expect(board.entries).toHaveLength(PUBLISHED_ROWS)
    expect(board.entries.length / board.total).toBeLessThan(0.05)
    for (let i = 1; i < board.entries.length; i++) {
      expect(board.entries[i]!.score).toBeLessThanOrEqual(board.entries[i - 1]!.score)
    }
  })

  it('ranks the published rows the way the Worker counts them', () => {
    // `COUNT(*) WHERE score > ?` + 1 — ties share a rank and the next player
    // takes the rank their position implies, not the one after the tie.
    for (const e of board.entries) {
      expect(e.rank).toBe(rankFromDist(board.dist, e.score))
    }
    expect(board.entries[0]!.rank).toBe(1)
  })

  it('labels rows the way this game mints anonymous names', () => {
    // Poki hands out no player id and no display name, so every real row on a
    // Poki board would be one of these plus six digits.
    const pattern = new RegExp(`^(${ANON_WORDS.join('|')})\\d{6}$`)
    for (const e of board.entries) expect(e.name).toMatch(pattern)
    expect(new Set(board.entries.map((r: { name: string }) => r.name)).size)
      .toBe(board.entries.length)
  })

  it('pins its word list to the one the game actually mints from', async () => {
    const { ANON_WORDS: fromGame } = await import('@/use/usePlayerIdentity')
    expect(ANON_WORDS).toEqual([...fromGame])
  })

  it('keeps every published row inside the stage range that could reach it', () => {
    for (const e of board.entries) {
      expect(e.wave).toBeGreaterThanOrEqual(1)
      expect(e.wave).toBeLessThanOrEqual(MAX_STAGE)
      // Nobody can outscore what the landscape board pays for their stage at
      // the difficulty ceiling — a row above that line is a generator bug, and
      // it would sit at the very top where it is most visible.
      expect(e.score).toBeLessThanOrEqual(CUM_KILLS.desktop[e.wave]! * 2.6)
    }
  })

  it('is deterministic — same inputs, same bytes', () => {
    const again = buildSeedBoard({ now: 1_700_000_000_000 })
    expect(JSON.stringify(again)).toBe(JSON.stringify(board))
  })

  it('does not move a player between two sessions of the same day', () => {
    // `updatedAt` is the generation DAY, not the instant. A board that
    // reshuffled per build would show one player two different ranks for the
    // same score.
    const morning = buildSeedBoard({ now: Date.UTC(2023, 10, 14, 6) })
    const evening = buildSeedBoard({ now: Date.UTC(2023, 10, 14, 21) })
    expect(evening.dist).toEqual(morning.dist)
    expect(evening.updatedAt).toBe(morning.updatedAt)
  })
})

// ─── The committed file ─────────────────────────────────────────────────────

describe('data/leaderboard-seed.json', () => {
  it('is what the generator produces today', () => {
    const onDisk = readSeed()
    expect(onDisk, `no seed at ${SEED_FILE} — run \`pnpm leaderboard:seed\``).not.toBeNull()
    const fresh = buildSeedBoard({ now: onDisk!.updatedAt })
    expect(
      { total: onDisk!.total, entries: onDisk!.entries, dist: onDisk!.dist },
      'the committed seed is stale — run `pnpm leaderboard:seed`'
    ).toEqual({ total: fresh.total, entries: fresh.entries, dist: fresh.dist })
  })

  it('says on its face that it is synthetic', () => {
    // The one place anyone opening the repo finds out. Nothing player-facing
    // reads these fields — `vite.config.ts` copies only the board fields into
    // the bundle.
    const raw = JSON.parse(readFileSync(SEED_FILE, 'utf-8'))
    expect(raw.synthetic).toBe(true)
    expect(raw.generator).toBe('scripts/leaderboard-seed.mjs')
  })

  it('stays small enough to bundle', () => {
    // It ships inside the JS, and Poki weighs the bundle.
    const bytes = JSON.stringify(readSeed()).length
    expect(bytes).toBeLessThan(40_000)
  })
})

// ─── What the player is actually shown ──────────────────────────────────────

describe('the rank a Poki player sees', () => {
  /** What a run that ends on `stage` scores on the phone board, mid-wave. */
  const scoreAt = (stage: number) => {
    const cleared = CUM_KILLS.dropmerge[stage - 1]!
    return Math.round(cleared + (CUM_KILLS.dropmerge[stage]! - cleared) * 0.5)
  }

  it('improves on every stage cleared', () => {
    let previous = Number.POSITIVE_INFINITY
    for (let stage = 1; stage <= 20; stage++) {
      const rank = rankFromDist(board.dist, scoreAt(stage))
      expect(rank, `stage ${stage}`).toBeLessThan(previous)
      previous = rank
    }
  })

  it('starts a first-timer near the bottom, with room to climb', () => {
    // The whole point of the curve. A stage-3 exit is the modal outcome, so it
    // has to read as "most of the board is above you" — and one more stage has
    // to visibly move it.
    const third = rankFromDist(board.dist, scoreAt(3))
    expect(third / board.total).toBeGreaterThan(0.7)
    expect(third / board.total).toBeLessThan(0.95)
    expect(rankFromDist(board.dist, scoreAt(6)) / board.total).toBeLessThan(0.6)
    expect(rankFromDist(board.dist, scoreAt(10)) / board.total).toBeLessThan(0.4)
  })

  it('never claims a rank the board cannot hold', () => {
    for (const score of [1, 5, 50, 500, 5_000, 1_000_000]) {
      const rank = rankFromDist(board.dist, score)
      expect(rank).toBeGreaterThanOrEqual(1)
      expect(rank).toBeLessThanOrEqual(board.total)
    }
    // Beating the seeded #1 is possible, and it says #1 rather than #0.
    expect(rankFromDist(board.dist, board.dist[0]![0] + 1)).toBe(1)
  })

  it('reaches the top only by outplaying the top of the curve', () => {
    // The seeded leader sits at stage 40+; a stage-20 run must not be #1.
    expect(rankFromDist(board.dist, scoreAt(20))).toBeGreaterThan(50)
  })
})

// ─── End to end, on a build with no endpoint ────────────────────────────────

describe('a build with no endpoint, ranking against the seed', () => {
  it('shows a rank and makes no request', async () => {
    const fetchSpy = vi.fn()
    vi.stubEnv('VITE_LEADERBOARD_URL', '')
    vi.stubEnv('VITE_LEADERBOARD_SECRET', '')
    vi.stubGlobal('fetch', fetchSpy)
    vi.resetModules()
    vi.doMock('@/use/leaderboardSnapshot', async (importOriginal) => ({
      ...(await importOriginal<typeof import('@/use/leaderboardSnapshot')>()),
      boardSnapshot: {
        updatedAt: board.updatedAt,
        total: board.total,
        entries: board.entries,
        dist: board.dist
      } satisfies BoardSnapshot
    }))
    const lb = await import('@/use/useLeaderboard')

    expect(lb.leaderboardEnabled).toBe(true)
    expect(lb.playerTotal.value).toBe(PLAYER_TOTAL)

    const rank = lb.rankFor(CUM_KILLS.dropmerge[4]!)
    expect(rank).toBeGreaterThan(1)
    expect(rank).toBeLessThan(PLAYER_TOTAL)

    // A run also reports itself. On a read-only build that must resolve
    // quietly, without a single request.
    await lb.reportRun(CUM_KILLS.dropmerge[4]!, 5, { force: true })
    expect(fetchSpy).not.toHaveBeenCalled()

    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.doUnmock('@/use/leaderboardSnapshot')
    vi.resetModules()
  })
})

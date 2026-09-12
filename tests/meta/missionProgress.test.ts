import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MissionRun } from '@/use/useMissions'

/**
 * Daily mission progress.
 *
 * The bug this guards: `recordRun` was called exactly once per run, when the
 * Gate fell. A player forty kills into a siege who opened the panel — which is
 * precisely when they would — saw 0/120, and concluded the missions were
 * broken. Progress is now credited in deltas so it can be fed continuously.
 */

/**
 * A date whose rotation contains coins, waves AND kills.
 *
 * The triplet is generated from a hash of the day, so without pinning the clock
 * these tests would silently assert nothing on roughly a quarter of days —
 * whichever ones happen to drop the type under test.
 */
const PINNED_DAY = '2026-01-05T12:00:00.000Z'

const load = async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(PINNED_DAY))
  vi.resetModules()
  localStorage.clear()
  // Imported AFTER the clock is pinned: the module generates the day's missions
  // during its own evaluation.
  const mod = await import('@/use/useMissions')
  mod.beginMissionRun()
  const api = mod.default()
  const types = api.missions.value.map((x) => x.type)
  expect(types, 'pinned day should contain the types these tests assert on')
    .toEqual(expect.arrayContaining(['coins', 'waves', 'kills']))
  return { ...mod, ...api }
}

/** Progress on the mission of a given type, or null when today lacks it. */
const progressOf = (missions: { value: Array<{ type: string; progress: number }> }, type: string) =>
  missions.value.find((m) => m.type === type)?.progress ?? null

const run = (o: Partial<MissionRun>): MissionRun => ({
  waves: 0, kills: 0, coins: 0, blocks: 0, height: 0, ...o
})

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('mission progress is credited in deltas', () => {
  it('advances mid-run, not only when the run ends', async () => {
    const m = await load()
    m.recordRun(run({ kills: 12, coins: 30, blocks: 4 }))

    // Whichever three types today rolled, at least one of them moved.
    const moved = m.missions.value.some((x) => x.progress > 0)
    expect(moved).toBe(true)
  })

  it('never double-counts when called repeatedly with the same totals', async () => {
    const m = await load()
    m.recordRun(run({ kills: 50, coins: 100, blocks: 10 }))
    const snapshot = m.missions.value.map((x) => x.progress)

    // The wave-clear feed, the panel-open feed and the end-of-run feed can all
    // land on the same state; none of them may credit it again.
    m.recordRun(run({ kills: 50, coins: 100, blocks: 10 }))
    m.recordRun(run({ kills: 50, coins: 100, blocks: 10 }))

    expect(m.missions.value.map((x) => x.progress)).toEqual(snapshot)
  })

  it('credits only the increment as a run continues', async () => {
    const m = await load()
    const kills = () => progressOf(m.missions, 'kills')

    m.recordRun(run({ kills: 10 }))
    expect(kills()).toBe(10)
    m.recordRun(run({ kills: 25 }))
    expect(kills()).toBe(25)
    m.recordRun(run({ kills: 26 }))
    expect(kills()).toBe(26)
  })

  it('accumulates across runs rather than restarting', async () => {
    const m = await load()
    const kills = () => progressOf(m.missions, 'kills')

    m.recordRun(run({ kills: 30 }))
    m.beginMissionRun()
    m.recordRun(run({ kills: 20 }))
    // A daily total is the day's total, not the last run's.
    expect(kills()).toBe(50)
  })

  it('re-baselines on its own when a counter goes backwards', async () => {
    // A new run without anyone calling `beginMissionRun` — a resumed snapshot,
    // or a call site that forgot. Crediting a negative delta would claw back
    // progress the player earned.
    const m = await load()
    const kills = () => progressOf(m.missions, 'kills')

    m.recordRun(run({ kills: 40 }))
    expect(kills()).toBe(40)
    m.recordRun(run({ kills: 5 }))
    expect(kills()).toBe(45)
  })

  it('treats waves as a best-single-run goal, so it cannot be farmed', async () => {
    const m = await load()
    const waves = () => progressOf(m.missions, 'waves')

    m.recordRun(run({ waves: 6 }))
    expect(waves()).toBe(6)
    m.beginMissionRun()
    // Three short runs must not add up to a "survive to wave 9".
    m.recordRun(run({ waves: 3 }))
    m.beginMissionRun()
    m.recordRun(run({ waves: 3 }))
    expect(waves()).toBe(6)
  })

  it('stops crediting a mission once it has been claimed', async () => {
    const m = await load()
    const idx = m.missions.value.findIndex((x) => x.type === 'kills')

    m.recordRun(run({ kills: m.missions.value[idx]!.target }))
    expect(m.claim(idx)).toBe(true)
    const after = m.missions.value[idx]!.progress
    m.beginMissionRun()
    m.recordRun(run({ kills: 500 }))
    expect(m.missions.value[idx]!.progress).toBe(after)
  })

  it('survives a NaN that crept into the persisted blob', async () => {
    const m = await load()
    const idx = m.missions.value.findIndex((x) => x.type === 'kills')
    ;(m.missions.value[idx] as { progress: number }).progress = Number.NaN

    m.recordRun(run({ kills: 7 }))
    expect(Number.isFinite(m.missions.value[idx]!.progress)).toBe(true)
    expect(m.missions.value[idx]!.progress).toBe(7)
  })
})

/**
 * The day's first goal is always "hold two waves", so every player meets the
 * badge, the corner button and the coin shower inside their first siege —
 * the rerun found the easiest goal otherwise landed around wave 8-10.
 */
describe('the starter goal', () => {
  it('leads every day\'s list, and is the day\'s only waves goal', async () => {
    for (const day of ['2026-01-05T12:00:00.000Z', '2026-03-17T08:00:00.000Z', '2026-09-11T20:00:00.000Z', '2027-02-28T23:30:00.000Z']) {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(day))
      vi.resetModules()
      localStorage.clear()
      const mod = await import('@/use/useMissions')
      const list = mod.default().missions.value
      expect(list, day).toHaveLength(3)
      expect(list[0], day).toMatchObject({ type: 'waves', target: 2, progress: 0, claimed: false })
      expect(list.filter((x) => x.type === 'waves'), day).toHaveLength(1)
      expect(new Set(list.map((x) => x.type)).size, day).toBe(3)
    }
  })

  it('deals every goal a real target, every day', async () => {
    // A signed shift on the day's hash dealt `undefined` targets on about half
    // of all days (2026-09-11 among them): "0/undefined", never claimable.
    const start = Date.UTC(2026, 0, 1)
    for (let d = 0; d < 120; d++) {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(start + d * 86_400_000 + 12 * 3_600_000))
      vi.resetModules()
      localStorage.clear()
      const mod = await import('@/use/useMissions')
      for (const x of mod.default().missions.value) {
        expect(Number.isFinite(x.target) && x.target > 0, `${new Date(start + d * 86_400_000).toISOString().slice(0, 10)} ${x.type}`).toBe(true)
      }
    }
  })

  it('is ready to claim on the second wave, not before', async () => {
    const m = await load()
    m.recordRun(run({ waves: 1 }))
    expect(m.claimableMissionCount.value).toBe(0)
    m.recordRun(run({ waves: 2 }))
    expect(m.claimableMissionCount.value).toBe(1)
    expect(m.claim(0)).toBe(true)
  })
})

/**
 * The badge counts what can be claimed; the gold glow is stricter — it lights
 * only when EVERY mission still standing is ready, i.e. when opening the panel
 * would empty it. The phone's corner button follows the count.
 */
describe('the collect signals', () => {
  const targetOf = (m: Awaited<ReturnType<typeof load>>, type: string): number =>
    m.missions.value.find((x) => x.type === type)!.target
  const indexOf = (m: Awaited<ReturnType<typeof load>>, type: string): number =>
    m.missions.value.findIndex((x) => x.type === type)

  it('counts every ready goal but glows only when none is left unfinished', async () => {
    const m = await load()
    expect(m.claimableMissionCount.value).toBe(0)
    expect(m.allRemainingClaimable.value).toBe(false)

    m.recordRun(run({ kills: targetOf(m, 'kills') }))
    expect(m.claimableMissionCount.value).toBe(1)
    expect(m.allRemainingClaimable.value).toBe(false)

    m.recordRun(run({
      kills: targetOf(m, 'kills'),
      coins: targetOf(m, 'coins'),
      waves: targetOf(m, 'waves')
    }))
    expect(m.claimableMissionCount.value).toBe(3)
    expect(m.allRemainingClaimable.value).toBe(true)
  })

  it('judges "remaining" after claims, and goes dark once nothing is left', async () => {
    const m = await load()
    m.recordRun(run({ kills: targetOf(m, 'kills'), coins: targetOf(m, 'coins') }))
    expect(m.allRemainingClaimable.value).toBe(false)

    expect(m.claim(indexOf(m, 'kills'))).toBe(true)
    expect(m.claim(indexOf(m, 'coins'))).toBe(true)
    // The one goal still standing is unfinished: nothing to collect, no glow.
    expect(m.claimableMissionCount.value).toBe(0)
    expect(m.allRemainingClaimable.value).toBe(false)

    m.recordRun(run({
      kills: targetOf(m, 'kills'),
      coins: targetOf(m, 'coins'),
      waves: targetOf(m, 'waves')
    }))
    // Now the last one is ready, and it is everything that remains.
    expect(m.claimableMissionCount.value).toBe(1)
    expect(m.allRemainingClaimable.value).toBe(true)

    expect(m.claim(indexOf(m, 'waves'))).toBe(true)
    expect(m.claimableMissionCount.value).toBe(0)
    expect(m.allRemainingClaimable.value).toBe(false)
  })
})

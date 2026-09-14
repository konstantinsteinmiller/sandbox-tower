import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The adaptive quality controller.
 *
 * What makes this worth a test rather than a look is that every interesting
 * property is a NEGATIVE, and every one of them is invisible in play:
 *
 *   • a healthy machine must never lose fidelity — and "it looked fine when I
 *     tried it" is not evidence, because the developer's machine is the one
 *     device guaranteed to pass;
 *   • a struggling machine must not be judged on its loading screen, and must
 *     not be judged on the frames it spends behind an ad;
 *   • it must not oscillate, because every tier change re-bakes the whole
 *     scenery layer and a flickering sky is worse than either tier;
 *   • and at `drawEvery: 2` the thresholds have to scale, or the bottom tier
 *     reads as permanently failing at the exact cadence it was told to run.
 *
 * None of that shows up as a wrong pixel. It shows up as a player on a laptop
 * getting a slideshow, or a player on a desktop quietly losing the reflection
 * they paid for, and neither reaches a bug report.
 *
 * The clock is stubbed rather than faked with timers: the controller only ever
 * asks `performance.now()`, so controlling that is the whole of it, and the
 * sampling loop stays synchronous and readable.
 */

const setRenderProfile = vi.fn()
const setEnemyFieldCap = vi.fn()

vi.mock('@/use/useTowerArt', () => ({
  setRenderProfile,
  dayPhase: () => 0.42
}))
vi.mock('@/use/useTowerGame', () => ({ setEnemyFieldCap }))

let clock = 0

const loadController = async () => {
  vi.resetModules()
  setRenderProfile.mockClear()
  setEnemyFieldCap.mockClear()
  clock = 1000
  vi.spyOn(performance, 'now').mockImplementation(() => clock)
  return import('@/use/useAdaptiveQuality')
}

/**
 * Feed `n` frames of `dt`, advancing the stubbed clock by the same amount.
 *
 * Deltas and wall time have to move together or the window never closes: a
 * window ends on whichever of its frame count and its duration arrives first,
 * and a test that advanced only one of them would be measuring a machine that
 * does not exist.
 */
const feed = (
  sample: (dt: number) => void, n: number, dt: number
): void => {
  for (let i = 0; i < n; i++) {
    clock += dt
    sample(dt)
  }
}

beforeEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = '<div id="app-root"></div>'
  delete (window as unknown as { location?: unknown }).location
  ;(window as unknown as { location: { search: string; hash: string } }).location = { search: '', hash: '' }
})

describe('adaptive quality — a healthy machine', () => {
  it('never leaves the top tier at a steady 60 fps', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()

    // Two full minutes of 16.7 ms frames — well past the audition.
    feed(q.sampleAdaptiveFrame, 7200, 16.7)

    expect(q.activeTier.value).toBe('high')
    // One call: the initial application. No tier change ever followed.
    expect(setRenderProfile).toHaveBeenCalledTimes(1)
    expect(setEnemyFieldCap).toHaveBeenCalledWith(null)
  })

  it('keeps the top tier through an isolated bad patch once the audition is over', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()

    // Establish a healthy machine and run the audition out.
    feed(q.sampleAdaptiveFrame, 1800, 16.7)
    expect(q.activeTier.value).toBe('high')
    const settled = setRenderProfile.mock.calls.length

    // A boss wave landing: ~2.4 s where a third of frames blow the budget. It
    // deliberately straddles a window boundary, so its tail lands in the next
    // window too — the shape that used to read as two consecutive failures.
    feed(q.sampleAdaptiveFrame, 60, 40)
    // ...and then it recovers.
    feed(q.sampleAdaptiveFrame, 600, 16.7)

    expect(q.activeTier.value).toBe('high')
    expect(setRenderProfile).toHaveBeenCalledTimes(settled)
  })
})

describe('adaptive quality — a struggling machine', () => {
  it('steps down inside the first ten seconds at 18 fps', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()
    expect(q.activeTier.value).toBe('high')

    // 55 ms/frame is the playtest that prompted all of this.
    feed(q.sampleAdaptiveFrame, 400, 55)

    expect(q.activeTier.value).toBe('low')
    // The bottom tier is the one that narrows the field.
    expect(setEnemyFieldCap).toHaveBeenLastCalledWith(12)
  })

  it('steps down one tier at a time rather than jumping to the floor', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()

    // Enough for exactly ONE window to close and be judged: 40 frames of
    // warmup, then a window that ends on its 1600 ms duration rather than on
    // its frame count, because at 55 ms a frame there are only ~30 of them.
    feed(q.sampleAdaptiveFrame, 72, 55)
    expect(q.activeTier.value).toBe('mid')
  })

  it('turns the HUD effects off below the top tier', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()
    const root = document.getElementById('app-root')!
    expect(root.getAttribute('data-hud-fx')).toBeNull()

    feed(q.sampleAdaptiveFrame, 72, 55)

    expect(root.getAttribute('data-hud-fx')).toBe('off')
    expect(root.getAttribute('data-quality')).toBe('mid')
  })

  it('cannot fall below the bottom tier however bad it gets', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()

    feed(q.sampleAdaptiveFrame, 3000, 90)

    expect(q.activeTier.value).toBe('low')
    // Fifty seconds of it, and the floor still only cost ONE change on top of
    // the initial application — the controller settles rather than thrashing a
    // full scenery re-bake every window against a wall it cannot get past.
    expect(setRenderProfile).toHaveBeenCalledTimes(2)
  })

  /**
   * 90 ms is 11 fps. Walking such a machine through `mid` costs it an extra
   * scenery re-bake and an extra window at 11 fps before the tier that might
   * actually help arrives, to arrive at a fidelity that was never going to
   * rescue it. Below `COLLAPSE_P50_MS` the controller stops being polite.
   */
  it('skips the middle tier when the machine is nowhere near the line', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()

    feed(q.sampleAdaptiveFrame, 200, 90)

    expect(q.activeTier.value).toBe('low')
    expect(setRenderProfile.mock.calls.map(([p]) => p.drawEvery)).toEqual([1, 2])
  })
})

describe('adaptive quality — what it refuses to measure', () => {
  it('ignores the opening frames, so a slow boot cannot cost a tier', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()

    // A full warmup's worth of genuinely terrible frames — art decoding, the
    // platform SDK, the splash coming down. Under the frame floor either way.
    feed(q.sampleAdaptiveFrame, 30, 60)

    expect(q.activeTier.value).toBe('high')
    expect(setRenderProfile).toHaveBeenCalledTimes(1)
  })

  /**
   * This test used to feed THREE HUNDRED consecutive 120 ms frames and assert
   * that nothing happened — i.e. it pinned the blind spot as intended
   * behaviour. Three hundred consecutive 120 ms frames is thirty-six seconds at
   * 8 fps, which is not a tab switch by any reading; it is the exact stream a
   * 2-5 fps playtest produced for three minutes while the controller judged
   * nothing at all.
   *
   * What actually distinguishes a stall from a slow machine is not the size of
   * the delta but its ISOLATION, so that is what the test feeds now.
   */
  it('discards an isolated stall, so a tab switch is not evidence', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()
    feed(q.sampleAdaptiveFrame, 200, 16.7)
    const settled = setRenderProfile.mock.calls.length

    // Nine seconds behind another tab, then straight back to 60 fps. Repeated,
    // because a player switching away and back is not a once-per-session event.
    for (let i = 0; i < 20; i++) {
      clock += 9000
      q.sampleAdaptiveFrame(9000)
      feed(q.sampleAdaptiveFrame, 120, 16.7)
    }

    expect(q.activeTier.value).toBe('high')
    expect(setRenderProfile).toHaveBeenCalledTimes(settled)
    expect(q.adaptiveReport().stallsDropped).toBe(20)
  })

  it('discards a GC hitch or a synchronous decode, which is two frames at most', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()
    feed(q.sampleAdaptiveFrame, 200, 16.7)
    const settled = setRenderProfile.mock.calls.length

    for (let i = 0; i < 30; i++) {
      feed(q.sampleAdaptiveFrame, 2, 300)
      feed(q.sampleAdaptiveFrame, 100, 16.7)
    }

    expect(q.activeTier.value).toBe('high')
    expect(setRenderProfile).toHaveBeenCalledTimes(settled)
  })

  it('stops sampling once the scene has been torn down', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()
    q.stopAdaptiveQuality()

    feed(q.sampleAdaptiveFrame, 600, 80)

    expect(q.activeTier.value).toBe('high')
    expect(setRenderProfile).toHaveBeenCalledTimes(1)
  })
})

describe('adaptive quality — the cadence scaling', () => {
  /**
   * The bug this pins: `low` draws every second frame, so on a 60 Hz panel a
   * healthy `low` presents at 33 ms. Judged against the unscaled 22 ms
   * threshold that reads as "still struggling", the controller would try to
   * step down from the bottom tier forever, and the single permitted upgrade
   * could never fire however well the machine was actually doing.
   */
  it('reads a healthy bottom tier as healthy, not as still failing', async () => {
    const q = await loadController()
    q.initAdaptiveQuality({ startTier: 'low' })

    // 33.3 ms between PRESENTED frames is 60 fps of RAF at drawEvery 2 — a
    // machine doing exactly what the bottom tier asked of it.
    feed(q.sampleAdaptiveFrame, 2000, 33.3)

    // The proof is that the single permitted upgrade was SPENT: the controller
    // can only reach for it after five consecutive windows it judged
    // comfortable, so a `low` tier that was being read as "still failing" could
    // never get here. (It then falls back, correctly — this feed keeps
    // presenting at 33 ms after the upgrade removed the frame skipping, which
    // means the machine did not in fact have the headroom.)
    expect(q.adaptiveReport().upgradesLeft).toBe(0)
    const reachedMid = setRenderProfile.mock.calls.some(([p]) => p.drawEvery === 1)
    expect(reachedMid).toBe(true)
  })
})

describe('adaptive quality — the manual override', () => {
  it('pins the tier and stops measuring on ?tier=', async () => {
    const q = await loadController()
    ;(window as unknown as { location: { search: string; hash: string } })
      .location = { search: '?tier=high', hash: '' }
    q.initAdaptiveQuality()

    feed(q.sampleAdaptiveFrame, 2000, 90)

    expect(q.activeTier.value).toBe('high')
    expect(q.adaptiveReport().pinned).toBe(true)
    expect(setRenderProfile).toHaveBeenCalledTimes(1)
  })

  it('reads a tier out of a hash query, since the router owns the hash', async () => {
    const q = await loadController()
    ;(window as unknown as { location: { search: string; hash: string } })
      .location = { search: '', hash: '#/?tier=low' }
    q.initAdaptiveQuality()

    expect(q.activeTier.value).toBe('low')
    expect(setEnemyFieldCap).toHaveBeenCalledWith(12)
  })
})

describe('adaptive quality — the day phase', () => {
  /**
   * `PROFILES.mid` freezes the sky at 0.18, mid-morning. That is the right
   * answer at boot and the wrong one at runtime: a player downgraded during a
   * night wave would watch the sky snap to morning, which is a far more
   * noticeable artefact than the frame it saved.
   */
  it('freezes the sky where it already is, not at the profile constant', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()

    feed(q.sampleAdaptiveFrame, 72, 55)

    const applied = setRenderProfile.mock.calls.at(-1)![0]
    expect(applied.dayCycle).toBe(false)
    expect(applied.staticDayPhase).toBe(0.42)
  })
})

/**
 * ─── The 2026-09-14 playtest ────────────────────────────────────────────────
 *
 * Intel UHD 630 · ANGLE D3D11 · 8 cores · DPR 1.25 · Edge 153, desktop scene:
 * **2-5 fps sustained for three minutes**, at the top tier the whole way.
 *
 * Three independent decisions had to be wrong at once for that to be possible,
 * and each of them looked defensible on its own:
 *
 *   1. the scene fed the controller its CLAMPED simulation delta, so no frame
 *      could ever report worse than 120 ms;
 *   2. the outlier rule discarded everything at or over 118 ms as "the page
 *      stopped", which is every frame a sub-8.5 fps machine produces;
 *   3. and both the warmup gate and the window floor were counted in FRAMES, so
 *      even with (1) and (2) fixed a 3 fps machine waits thirteen seconds to be
 *      looked at and then never collects the eighteen samples a window needs.
 *
 * Every case below fails on the shipped 3.0.1 build.
 */
describe('adaptive quality — the machines it could not see', () => {
  it('steps down at 4 fps', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()

    feed(q.sampleAdaptiveFrame, 200, 250)

    expect(q.activeTier.value).toBe('low')
    expect(q.adaptiveReport().windowsJudged).toBeGreaterThan(0)
  })

  it('steps down at 2 fps — the floor of the report', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()

    feed(q.sampleAdaptiveFrame, 120, 500)

    expect(q.activeTier.value).toBe('low')
  })

  it('reaches the bottom tier inside the three minutes the player actually sat there', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()

    // 15 s of 3 fps is 45 frames.
    feed(q.sampleAdaptiveFrame, 45, 333)

    expect(q.activeTier.value).toBe('low')
  })

  it('still sees a machine that is merely bad, not catastrophic', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()

    // 9 fps — under the old 118 ms ceiling by a hair, so this one was always
    // visible. Pinned so the run-length rule cannot regress it.
    feed(q.sampleAdaptiveFrame, 400, 111)

    expect(q.activeTier.value).toBe('low')
  })

  it('does not wait for forty frames when forty frames is thirteen seconds', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()

    // 10 s at 3 fps: 30 frames, well under WARMUP_FRAMES.
    feed(q.sampleAdaptiveFrame, 30, 333)

    expect(q.activeTier.value).not.toBe('high')
  })

  it('judges a window that can never hold eighteen frames', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()

    feed(q.sampleAdaptiveFrame, 60, 200)

    // The point is not the tier but that windows CLOSED: at 5 fps a 1.6 s
    // window holds eight frames, and the old floor discarded every one of them.
    expect(q.adaptiveReport().windowsJudged).toBeGreaterThan(0)
  })

  it('reports the frame time it saw, so the next playtest needs no guessing', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()

    feed(q.sampleAdaptiveFrame, 200, 250)

    const r = q.adaptiveReport()
    expect(r.lastP50).toBeGreaterThan(100)
    expect(r.tier).toBe('low')
  })
})

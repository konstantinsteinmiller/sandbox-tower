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
    // high -> mid -> low is two changes on top of the initial application.
    expect(setRenderProfile).toHaveBeenCalledTimes(3)
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

  it('discards clamped frames, so a tab switch is not evidence', async () => {
    const q = await loadController()
    q.initAdaptiveQuality()
    feed(q.sampleAdaptiveFrame, 200, 16.7)
    const settled = setRenderProfile.mock.calls.length

    // The scene clamps its own delta to 120 ms, so 120 means "the page
    // stopped", not "this frame was slow".
    feed(q.sampleAdaptiveFrame, 300, 120)

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

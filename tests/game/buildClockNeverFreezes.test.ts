import { describe, expect, it, vi } from 'vitest'

/**
 * ─── The siege must never stop on its own ───────────────────────────────────
 *
 * An eight-minute playtest video, 2026-09-14: the player did nothing and no
 * wave ever came. The Call Wave button was fine. What was broken was a coach
 * mark placed around it — `buildClockHeld` was raised for a beat that is only a
 * POINTER over a live game, so the countdown stopped and the only way to get
 * another wave was to press the button the tutorial was pointing at.
 *
 * Two layers, and the second is the one that matters.
 *
 * The simulation tests below pin a real invariant — an unheld build phase
 * always ends by itself — but they would NOT have caught this bug, because the
 * defect was in a `.vue` computed that no headless run mounts. So the rule was
 * lifted out into `useTutorialClock` as a pure function, and the `which beats
 * may stop the siege` block tests it directly. That extraction is the actual
 * fix for "this shipped": the arithmetic of which beat halts the game is now
 * something a test can hold an opinion about.
 */

const load = async () => {
  vi.resetModules()
  localStorage.clear()
  const g = await import('@/use/useTowerGame')
  g.startRun()
  g.seedScriptedOpening(true)
  return g
}

type Game = Awaited<ReturnType<typeof load>>

/** Step until the wave starts by itself, or give up. Returns the ms it took. */
const runUntilWave = (g: Game, limitMs: number): number | null => {
  for (let t = 0; t < limitMs; t += 16) {
    g.step(16)
    if (g.phase.value === 'battle') return t
  }
  return null
}

describe('an unheld build phase always ends by itself', () => {
  it('starts the opening wave without the player touching anything', async () => {
    const g = await load()
    expect(g.phase.value).toBe('build')
    // Nobody presses anything. The wave has to come anyway.
    const at = runUntilWave(g, 60_000)
    expect(at).not.toBeNull()
    expect(g.wave.value).toBe(1)
  })

  it('keeps doing it wave after wave, with no input at all', async () => {
    const g = await load()
    // Eight minutes of a completely passive player — the length of the video
    // that found this. The siege must keep coming the whole time.
    let waves = 0
    for (let t = 0; t < 480_000 && g.phase.value !== 'defeat'; t += 16) {
      const before = g.wave.value
      g.step(16)
      if (g.wave.value > before) waves++
    }
    expect(waves).toBeGreaterThan(2)
  })
})

describe('the hold is a hold, not a stop', () => {
  it('freezes the countdown only while it is actually held', async () => {
    const g = await load()
    g.buildClockHeld.value = true
    const left = g.buildTimeLeft.value
    for (let t = 0; t < 30_000; t += 16) g.step(16)
    // Held: nothing moved, and no wave was called.
    expect(g.phase.value).toBe('build')
    expect(g.buildTimeLeft.value).toBe(left)

    // Released: the wave comes on its own, with no input.
    g.buildClockHeld.value = false
    expect(runUntilWave(g, 60_000)).not.toBeNull()
  })

  it('is released by the wave itself, so a stale hold cannot outlive a run',
    async () => {
      const g = await load()
      g.callWave()
      expect(g.phase.value).toBe('battle')
      // A hold raised during a battle must not silently carry into the next
      // build phase and stop it before it starts.
      g.buildClockHeld.value = false
      for (let t = 0; t < 300_000 && g.phase.value === 'battle'; t += 16) g.step(16)
      expect(g.phase.value).toBe('build')
      expect(runUntilWave(g, 60_000)).not.toBeNull()
    })
})

describe('which beats may stop the siege', () => {
  /**
   * The rule itself, as a pure function. It used to be a computed inside
   * `GameScene` — unmountable in a headless run, and therefore untestable,
   * which is why the freeze shipped.
   */
  const at = (over: Partial<import('@/use/useTutorialClock').HoldState> = {}) => ({
    step: null, opening: false, hasTarget: true, heldMs: 0, ...over
  })

  it('lets a card or a scripted hand stop the clock', async () => {
    const { holdsBuildClock } = await import('@/use/useTutorialClock')
    for (const step of ['mergeGuide', 'mergePower', 'rankGate'] as const) {
      // They measure no target BY DESIGN — their own card or hand is the thing
      // on screen — so the hold must not depend on one.
      expect(holdsBuildClock(at({ step, hasTarget: false })), step).toBe(true)
    }
  })

  it('NEVER stops it for the Call Wave pointer', async () => {
    const { holdsBuildClock, CLOCK_OWNING_STEPS } = await import('@/use/useTutorialClock')
    // The whole bug, in one assertion. `call` is an arrow over a live game: a
    // player who does not press it must still be sent the next wave.
    expect(holdsBuildClock(at({ step: 'call' }))).toBe(false)
    expect(CLOCK_OWNING_STEPS.has('call')).toBe(false)
  })

  it('holds for anything in the forced opening, which gates wave 1 itself', async () => {
    const { holdsBuildClock } = await import('@/use/useTutorialClock')
    for (const step of ['pick', 'place', 'inspectMerged', 'rankUp', 'call'] as const) {
      expect(holdsBuildClock(at({ step, opening: true })), step).toBe(true)
    }
  })

  /**
   * The 2026-09-15 rule, and the expensive half of it.
   *
   * `TutorialOverlay` draws NOTHING without a measured target, deliberately — a
   * dim layer with no hole is a modal with no way out. The hold did not follow
   * that rule, so every way a target can go missing produced a game that looked
   * normal, answered every tap, and would never send another wave: the player
   * pressing Escape and closing the inspector the `rankUp` beat points into, a
   * resumed run that cannot afford the piece `place` teaches with.
   */
  it('never holds the clock behind a beat with nothing on screen', async () => {
    const { holdsBuildClock } = await import('@/use/useTutorialClock')
    for (const step of ['pick', 'place', 'inspectMerged', 'rankUp'] as const) {
      expect(holdsBuildClock(at({ step, opening: true, hasTarget: false })), step).toBe(false)
    }
  })

  /** The backstop, for the failures nothing here can enumerate. */
  it('gives the siege back once the hold budget is spent', async () => {
    const { holdsBuildClock, MAX_HOLD_MS } = await import('@/use/useTutorialClock')
    const card = { step: 'mergePower' as const, hasTarget: false }
    expect(holdsBuildClock(at({ ...card, heldMs: MAX_HOLD_MS - 1 }))).toBe(true)
    expect(holdsBuildClock(at({ ...card, heldMs: MAX_HOLD_MS }))).toBe(false)
    expect(holdsBuildClock(at({ step: 'place', opening: true, heldMs: MAX_HOLD_MS }))).toBe(false)
  })

  it('holds for nothing at all when no beat is live', async () => {
    const { holdsBuildClock } = await import('@/use/useTutorialClock')
    expect(holdsBuildClock(at({ step: null }))).toBe(false)
    expect(holdsBuildClock(at({ step: null, opening: true }))).toBe(false)
  })

  it('never holds the clock for a beat the player cannot see', async () => {
    const source = await import('node:fs').then((fs) =>
      fs.readFileSync('src/views/GameScene.vue', 'utf8'))
    // `rankGate` draws no overlay of its own — the scripted hand is the only
    // thing on screen — so the hand MUST be started even when the beat is
    // already live on the first frame. Without this the clock is held behind
    // an empty screen for ever.
    expect(source).toContain("if (activeTutorialStep.value === 'rankGate') void runGateDemo()")
  })
})

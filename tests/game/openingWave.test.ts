import { describe, expect, it, vi } from 'vitest'

/**
 * ─── The opening wave ───────────────────────────────────────────────────────
 *
 * Wave 1 arrives three seconds after the player first touches the game, and
 * not one second after the page finished loading. Two halves, and the feature
 * is only worth anything with both:
 *
 *   * a SHORT window, because the tower that meets wave 1 is already standing
 *     (the scripted opening's fort, or the player's own opener) and a full
 *     build phase there is fifteen seconds of watching a countdown before
 *     anything has happened — the most expensive dead air in the run, and
 *     measured in installs on a portal;
 *
 *   * gated on a REAL GESTURE, because a game that boots straight into a live
 *     stage has no idea whether anyone is looking at it yet. Starting the
 *     clock on load would hand wave 1 to a player who is still reading the
 *     page around the frame, which is the opposite of the intent.
 *
 * The gate is only in force once something arms it (`armFirstInteraction`), so
 * a headless run of the sim — every other spec in this suite — is unaffected.
 */

const loadGame = async () => {
  vi.resetModules()
  localStorage.clear()
  // Imported together, after the reset, so both see the same module instance.
  const gate = await import('@/use/useFirstInteraction')
  const g = await import('@/use/useTowerGame')
  return { g, gate }
}

/** Run the fixed-step sim for `ms` of simulated time. */
const advance = (g: { step: (ms: number) => void }, ms: number): void => {
  for (let t = 0; t < ms; t += 16) g.step(16)
}

/** Call one wave and hold the field clear until the sim returns to build. */
const clearOneWave = (g: {
  step: (ms: number) => void
  callWave: () => void
  getEnemies: () => unknown[]
  phase: { value: string }
}): void => {
  g.callWave()
  for (let t = 0; t < 200_000; t += 16) {
    g.getEnemies().length = 0
    g.step(16)
    if (g.phase.value === 'build') return
  }
  throw new Error('wave never cleared')
}

describe('opening wave', () => {
  it('gives the opening three seconds and the wave-2 break five', async () => {
    const { g } = await loadGame()
    g.startRun()

    expect(g.phase.value).toBe('build')
    expect(g.wave.value).toBe(0)
    expect(g.buildTimeLeft.value).toBe(3_000)

    clearOneWave(g)
    expect(g.wave.value).toBe(1)
    // Five, not the full fifteen. This is the one break in the game a player
    // meets before they have learned Call Wave exists — the button is taught in
    // this very window — so for its whole length their model is "waves arrive
    // when the game sends them", and fifteen seconds of that is a countdown
    // over an empty field on a wave the scripted fort survives untouched.
    // See `earlyBuildMs` in the rule set.
    expect(g.buildTimeLeft.value).toBe(5_000)
  })

  it('calls the wave itself once those three seconds are up', async () => {
    const { g } = await loadGame()
    g.startRun()

    advance(g, 2_500)
    expect(g.phase.value).toBe('build')

    advance(g, 700)
    expect(g.phase.value).toBe('battle')
    expect(g.wave.value).toBe(1)
  })

  it('does not start the clock until the player has actually touched the game',
    async () => {
      const { g, gate } = await loadGame()
      gate.armFirstInteraction()
      g.startRun()

      // A player who has not acted yet: the stage is live, the tower is up, and
      // the countdown has not moved.
      advance(g, 30_000)
      expect(g.phase.value).toBe('build')
      expect(g.wave.value).toBe(0)
      expect(g.buildTimeLeft.value).toBe(3_000)

      gate.noteUserInteraction()
      advance(g, 2_500)
      expect(g.phase.value).toBe('build')
      advance(g, 700)
      expect(g.phase.value).toBe('battle')
    })

  it('leaves a headless sim exactly as it was — the gate has to be armed', async () => {
    const { g, gate } = await loadGame()
    // Nothing armed it, so there is no player whose gesture could be pending.
    expect(gate.awaitingFirstInteraction.value).toBe(false)
    g.startRun()

    advance(g, 3_200)
    expect(g.phase.value).toBe('battle')
  })

  it('freezes the countdown while the tutorial has the floor', async () => {
    const { g } = await loadGame()
    g.startRun()
    g.buildClockHeld.value = true

    // What the scene holds this for: the tutorial's offer box is a question
    // waiting to be answered, and its last beat is the Call Wave button. A
    // timer running underneath either one would fire the wave out from under
    // the tutorial and strand the player on a step they can no longer
    // complete. The hold lifts on SKIP, on that last beat, or on a cancel.
    advance(g, 30_000)
    expect(g.phase.value).toBe('build')
    expect(g.buildTimeLeft.value).toBe(3_000)

    g.buildClockHeld.value = false
    advance(g, 3_200)
    expect(g.phase.value).toBe('battle')
  })

  it('holds a wave the player has already seen, too, while the hold is on', async () => {
    const { g } = await loadGame()
    g.startRun()
    clearOneWave(g)

    g.buildClockHeld.value = true
    advance(g, 30_000)
    expect(g.phase.value).toBe('build')
    expect(g.wave.value).toBe(1)
  })
})

/**
 * ─── The Drop & Merge opening ───────────────────────────────────────────────
 *
 * The phone board inverts the rule above: it opens with NO build window at all
 * and calls wave 1 on its first tick.
 *
 * Five empty columns and nothing walking in is not a calm opening, it is a
 * game that looks like it has not started — there is no tower to read and no
 * threat to answer, so the player's first experience of the game is waiting
 * for it. The wave IS the introduction here, and it should already be on its
 * way when the loader clears.
 *
 * What the gesture still gates is what the PORTAL is told: `gameplayStart` is
 * held until the player touches the game (`useGameplayLifecycle`), which is
 * the requirement the wait used to be conflated with.
 */
describe('opening wave — Drop & Merge', () => {
  const loadDrop = async () => {
    const { g, gate } = await loadGame()
    const { DROPMERGE_RULES } = await import('@/mobile-fit/rules')
    g.applyRules(DROPMERGE_RULES)
    g.startRun()
    return { g, gate }
  }

  it('opens with no build window at all', async () => {
    const { g } = await loadDrop()
    expect(g.phase.value).toBe('build')
    expect(g.buildTimeLeft.value).toBe(0)
  })

  it('calls wave 1 on the first tick, without waiting for a gesture', async () => {
    const { g, gate } = await loadDrop()
    // Armed and untouched: on the desktop board this is exactly the state that
    // parks the countdown. Here there is no countdown to park.
    gate.armFirstInteraction()
    expect(gate.awaitingFirstInteraction.value).toBe(true)

    // One whole fixed tick — the sim accumulates into 60 Hz substeps, so a
    // shorter frame would not advance the build clock at all.
    g.step(1000 / 60)
    expect(g.phase.value).toBe('battle')
    expect(g.wave.value).toBe(1)
  })

  // The breaks between the first waves are short, then the full ten seconds.
  // Building carries on during a wave on this board, so an early build phase
  // buys nothing — and two ten-second countdowns inside the first forty
  // seconds were two stretches of empty field exactly where first sessions
  // were ending. Pinned as literals: an assertion that read the rule back
  // would pass for any value, including the ten seconds it replaced.
  it('breaks for 4 s, 6 s and 8 s after waves 1-3, then the full window', async () => {
    const { g } = await loadDrop()
    const breaks: number[] = []
    for (let w = 1; w <= 5; w++) {
      clearOneWave(g)
      expect(g.wave.value).toBe(w)
      breaks.push(g.buildTimeLeft.value)
    }
    expect(breaks).toEqual([4_000, 6_000, 8_000, 10_000, 10_000])
  })

  it('gives the desktop board one short break and then its full window', async () => {
    // The desktop does not ramp the way the phone board above does: it has ONE
    // shortened break, between waves 1 and 2, and every window after that is
    // the full fifteen. The step up is deliberate — the five seconds are
    // justified by the player not yet knowing about Call Wave, and by wave 3
    // they have been shown the arrow over it.
    const { g } = await loadGame()
    g.startRun()
    const breaks: number[] = []
    for (let w = 1; w <= 3; w++) {
      clearOneWave(g)
      breaks.push(g.buildTimeLeft.value)
    }
    expect(breaks).toEqual([5_000, 15_000, 15_000])
  })
})

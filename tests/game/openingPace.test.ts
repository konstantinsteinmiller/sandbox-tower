import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * ─── How fast the opening moves ─────────────────────────────────────────────
 *
 * Two changes to the first minute of a siege, made together because they are
 * the same complaint: the opening is slow in a way that has nothing to do with
 * difficulty.
 *
 *   1. The break between wave 1 and wave 2 is FIVE seconds, not fifteen. It is
 *      the only window in the game a player meets before they have learned
 *      that Call Wave exists — the button is taught in this very window — so
 *      for its whole length their model of the game is "waves arrive when the
 *      game sends them". Fifteen seconds of that is a countdown over an empty
 *      field, against a wave 2 the scripted fort survives untouched.
 *
 *   2. A run OPENS at 1.5x rather than 1x. The opening stretch is a handful of
 *      grumplings walking the width of the screen at one cell a second, at a
 *      tower that kills them without the player doing anything. 1.5x is free
 *      on every board, changes no number in the fight, and just removes the
 *      waiting.
 *
 * ── The reason they are pinned in ONE file ──
 *
 * Because they can silently destroy each other, and the failure is invisible
 * on screen. `step` multiplies its delta by `gameSpeed` — and if it ever did
 * so during the BUILD phase, the five-second window would really be 3.3
 * seconds of the player's life, a third of it gone to a feature that was
 * supposed to be about the battle. `step` guards that today
 * (`phase === 'battle' ? gameSpeed : 1`), and "the build countdown is real
 * time" is therefore a load-bearing property of the fast-forward system rather
 * than an incidental one. `the two do not interact` below is the whole reason
 * this file exists.
 */

const loadGame = async () => {
  vi.resetModules()
  localStorage.clear()
  return import('@/use/useTowerGame')
}

/**
 * A fresh module instance over the EXISTING save — a page reload.
 *
 * Deliberately not `loadGame`, which clears storage and so would throw the
 * snapshot away. A new module is the point: `gameSpeed` is a module-level ref
 * and comes back at its initial 1x, which is exactly the state the resume path
 * has to correct.
 */
const reloadGame = async () => {
  vi.resetModules()
  return import('@/use/useTowerGame')
}

/** Step the fixed-step sim for `ms` of REAL (unscaled) time. */
const advance = (g: { step: (ms: number) => void }, ms: number): void => {
  for (let t = 0; t < ms; t += 16) g.step(16)
}

/**
 * Call one wave and run it to its end, keeping the field clear.
 *
 * The enemies are emptied every frame rather than fought: what is under test
 * is the CLOCK between waves, and a wave that is actually fought takes a
 * different length of time on every balance change.
 */
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

/**
 * How long the sim actually waited before calling the next wave, in ms of real
 * time, measured by stepping rather than by reading the window back.
 *
 * Reading `buildTimeLeft` would only prove the constant was copied into a ref.
 * This proves the countdown that consumes it runs at the rate the player
 * experiences — which is the half of it that a speed multiplier can break.
 */
const msUntilNextWave = (g: {
  step: (ms: number) => void
  phase: { value: string }
  wave: { value: number }
}): number => {
  const from = g.wave.value
  for (let t = 0; t <= 60_000; t += 16) {
    g.step(16)
    if (g.wave.value > from) return t + 16
  }
  throw new Error('the wave was never called')
}

beforeEach(() => { localStorage.clear() })

describe('the break before wave 2', () => {
  it('is five seconds, measured by waiting it out', async () => {
    const g = await loadGame()
    g.startRun()
    clearOneWave(g)
    expect(g.wave.value).toBe(1)

    const waited = msUntilNextWave(g)
    expect(g.wave.value).toBe(2)
    // One fixed tick of slack either side — the countdown is decremented in
    // 16 ms substeps, so it cannot land on the millisecond.
    expect(waited).toBeGreaterThan(4_950)
    expect(waited).toBeLessThan(5_100)
  })

  it('leaves every later break at the full window', async () => {
    // The step up from five to fifteen is deliberate. The short break is
    // justified by a condition that has expired by wave 3: the player has now
    // seen two waves and the coach mark over Call Wave, so the full window is a
    // decision they can use rather than a wait they cannot shorten.
    const g = await loadGame()
    g.startRun()
    const breaks: number[] = []
    for (let w = 1; w <= 4; w++) {
      clearOneWave(g)
      breaks.push(g.buildTimeLeft.value)
    }
    expect(breaks).toEqual([5_000, 15_000, 15_000, 15_000])
  })

  it('does not touch the opening window, which is its own rule', async () => {
    // `firstBuildMs` is a separate clause and a separate promise: three seconds
    // that start on the player's first GESTURE rather than on page load.
    const g = await loadGame()
    g.startRun()
    expect(g.wave.value).toBe(0)
    expect(g.buildTimeLeft.value).toBe(3_000)
  })

  it('is still the player\'s to cut short by calling the wave early', async () => {
    // A shorter window must not become a window the player cannot act inside.
    const g = await loadGame()
    g.startRun()
    clearOneWave(g)
    advance(g, 1_000)
    g.callWave()
    expect(g.wave.value).toBe(2)
    expect(g.phase.value).toBe('battle')
  })
})

describe('the rung a run opens on', () => {
  it('is 1.5x on a brand-new siege', async () => {
    const g = await loadGame()
    g.startRun()
    expect(g.gameSpeed.value).toBe(1.5)
  })

  it('costs nothing — no buff, no video, no purchase', async () => {
    // The point of opening here rather than at 3x. A default the player has
    // not bought is a default; a default they have not bought that needs a
    // buff is a trailer.
    const g = await loadGame()
    g.startRun()
    expect(g.isSpeedBuffed.value).toBe(false)
    expect(g.speedBuffLeft.value).toBe(0)
    expect(g.needsSpeedBuff(g.gameSpeed.value)).toBe(false)
  })

  it('is a rung the mode actually offers', async () => {
    // Derived from the ladder rather than written as 1.5, so a mode that
    // reshapes its rungs still opens on one of its own.
    const g = await loadGame()
    g.startRun()
    expect([...g.GAME_SPEEDS]).toContain(g.gameSpeed.value)
  })

  it('opens a RESUMED run on the same rung', async () => {
    // The speed is not in the run snapshot — it is a live control, not run
    // state — so a reload lands on the module's initial 1x unless the resume
    // path opens it too. A returning player dropped a rung below the one they
    // were playing at has no way to know why.
    const g = await loadGame()
    g.startRun()
    clearOneWave(g)
    g.saveRunSnapshot()
    // The state layer debounces its writes, and a fresh module reads from
    // storage rather than from the ref the old one was holding.
    const state = await import('@/use/useTowerState')
    state.flushPersist()
    expect(g.wave.value).toBe(1)

    const again = await reloadGame()
    expect(again.gameSpeed.value).toBe(1)
    expect(again.resumeRun()).toBe(true)
    expect(again.wave.value).toBe(1)
    expect(again.gameSpeed.value).toBe(1.5)
  })

  it('leaves a paid rung alone when the buff still has time on it', async () => {
    // Five minutes of 3x is five minutes of the player's life that they bought.
    // A fresh run inside that window must not quietly hand back the difference.
    const g = await loadGame()
    g.startRun()
    g.grantSpeedBuff(3)
    expect(g.gameSpeed.value).toBe(3)

    g.startRun()
    expect(g.gameSpeed.value).toBe(3)
    expect(g.isSpeedBuffed.value).toBe(true)
  })

  it('re-opens at the free rung once a purchase has expired', async () => {
    const g = await loadGame()
    g.startRun()
    g.grantSpeedBuff(3)
    // The buff ticks on REAL time, so this is the honest way to expire it.
    advance(g, g.SPEED_BUFF_MS + 1_000)
    expect(g.isSpeedBuffed.value).toBe(false)
    expect(g.gameSpeed.value).toBe(1.5)

    g.startRun()
    expect(g.gameSpeed.value).toBe(1.5)
  })

  it('still lets the player slow down to 1x and come back, unpaid', async () => {
    // The opening rung is a default, not a floor. 1x is the one rung that must
    // always be reachable — a player who finds 1.5x too fast has to be able to
    // say so, and to change their mind again.
    const g = await loadGame()
    g.startRun()
    expect(g.setGameSpeed(1)).toBe(true)
    expect(g.gameSpeed.value).toBe(1)
    expect(g.setGameSpeed(1.5)).toBe(true)
    expect(g.gameSpeed.value).toBe(1.5)
    expect(g.isSpeedBuffed.value).toBe(false)
    // …and the rung above is still bought, not given.
    expect(g.setGameSpeed(3)).toBe(false)
    expect(g.gameSpeed.value).toBe(1.5)
  })

  it('does not survive as a preference across runs when it was chosen at 1x',
    async () => {
      // A speed choice belongs to the run it was made in, like the tower. The
      // next siege opens at the default whatever the last one ended on.
      const g = await loadGame()
      g.startRun()
      g.setGameSpeed(1)
      g.startRun()
      expect(g.gameSpeed.value).toBe(1.5)
    })
})

describe('the two do not interact', () => {
  it('runs the build countdown in real time at the opening speed', async () => {
    // THE regression this file exists for. If `step` ever applied `gameSpeed`
    // during the build phase, the five-second break would really be 3.3
    // seconds — a third of the window silently eaten by a feature that is
    // supposed to be about the battle, and nothing on screen would say so.
    const g = await loadGame()
    g.startRun()
    expect(g.gameSpeed.value).toBe(1.5)
    clearOneWave(g)

    const waited = msUntilNextWave(g)
    expect(waited).toBeGreaterThan(4_950)
    expect(waited).toBeLessThan(5_100)
  })

  it('takes exactly as long at 1x as at 1.5x', async () => {
    // Stated as a comparison as well as an absolute, because an absolute alone
    // would still pass if BOTH arms were scaled by the same wrong factor.
    const at = async (speed: number): Promise<number> => {
      const g = await loadGame()
      g.startRun()
      expect(g.setGameSpeed(speed)).toBe(true)
      clearOneWave(g)
      expect(g.gameSpeed.value).toBe(speed)
      return msUntilNextWave(g)
    }
    const slow = await at(1)
    const fast = await at(1.5)
    expect(fast).toBe(slow)
  })

  it('still accelerates the BATTLE, which is the whole point of the rung',
    async () => {
      // The other half of the guard: proving the build phase is unscaled must
      // not be satisfied by a speed multiplier that does nothing at all.
      const travelled = async (speed: number): Promise<number> => {
        const g = await loadGame()
        g.startRun()
        g.grantSpeedBuff(3)
        expect(g.setGameSpeed(speed)).toBe(true)
        g.callWave()
        // Let the first walkers get on screen, then measure how far the field
        // moves over a fixed slice of real time.
        advance(g, 500)
        const before = g.getEnemies().map((e) => e.x)
        advance(g, 1_000)
        const after = g.getEnemies().map((e) => e.x)
        const n = Math.min(before.length, after.length)
        expect(n).toBeGreaterThan(0)
        let sum = 0
        for (let i = 0; i < n; i++) sum += Math.abs(after[i]! - before[i]!)
        return sum / n
      }
      const slow = await travelled(1)
      const fast = await travelled(1.5)
      // Not an exact 1.5 — enemies stop when they reach something to hit — but
      // unmistakably further.
      expect(fast).toBeGreaterThan(slow * 1.25)
    })
})

describe('a short window still pays the full early-call bonus', () => {
  /**
   * The third thing these two changes could have broken between them, and the
   * only one that is invisible from the outside.
   *
   * `earlyCallBonus` prices the unused build time as a multiplier on the wave's
   * WOOD AND STONE, and its rate used to be derived from the DEFAULT window
   * (`BUILD_TIME_MS`, 15 s) rather than the window the player is standing in.
   * Cut the window before wave 2 to 5 s and the best bonus obtainable there
   * silently falls from +39 % to +13 % — in exactly the window where the
   * `lateCall` coach mark is teaching the player that calling early pays.
   * `waves.test.ts` pins the arithmetic; this pins that the simulation
   * actually uses it.
   */
  const materialsFromWave2 = async (callAfterMs: number): Promise<number> => {
    const g = await loadGame()
    g.startRun()
    g.seedScriptedOpening(true)
    // Through wave 1 and into the short window.
    g.callWave()
    for (let t = 0; t < 200_000 && g.phase.value === 'battle'; t += 16) g.step(16)
    expect(g.wave.value).toBe(1)
    expect(g.phase.value).toBe('build')
    // The window the payout is about to be priced against.
    expect(g.buildWindowTotal.value).toBe(5_000)

    if (callAfterMs > 0) advance(g, callAfterMs)
    const before = g.wood.value + g.stone.value
    if (g.phase.value === 'build') g.callWave()
    for (let t = 0; t < 200_000 && g.phase.value === 'battle'; t += 16) g.step(16)
    return g.wood.value + g.stone.value - before
  }

  it('reaches the cap by calling the instant the five-second window opens', async () => {
    const { EARLY_CALL_MAX_BONUS } = await import('@/game/waves')
    const atOnce = await materialsFromWave2(0)
    // Called with the window spent: the wave starts itself and pays no bonus.
    const spent = await materialsFromWave2(5_200)

    expect(spent).toBeGreaterThan(0)
    const gained = atOnce / spent - 1
    // Within rounding of the advertised cap. Not exact: the payout is split
    // over the wave's kills and rounded a kill at a time. The number that
    // matters is that it is nowhere near the +13 % the old rate would give.
    expect(gained).toBeGreaterThan(EARLY_CALL_MAX_BONUS * 0.85)
    expect(gained).toBeLessThanOrEqual(EARLY_CALL_MAX_BONUS + 0.02)
  })
})

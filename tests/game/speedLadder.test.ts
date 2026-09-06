import { beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Fast-forward ladder ────────────────────────────────────────────────────
//
// One purchase unlocks 1x/2x/3x and the player picks a rung. What is asserted
// here is the part a switch cannot show: that 1x is never gated (the player can
// always slow down), that nothing above 1x is free, and that the substep budget
// actually delivers the multiplier rather than silently clamping it back.

const loadGame = async () => {
  vi.resetModules()
  localStorage.clear()
  return import('@/use/useTowerGame')
}

beforeEach(() => {
  localStorage.clear()
})

describe('the speed ladder', () => {
  it('offers exactly the rungs the switch draws, slowest first', async () => {
    const g = await loadGame()
    expect([...g.GAME_SPEEDS]).toEqual([1, 2, 3])
    expect(g.MAX_GAME_SPEED).toBe(3)
    expect(g.GAME_SPEEDS[0]).toBe(1)
    expect(Math.max(...g.GAME_SPEEDS)).toBe(g.MAX_GAME_SPEED)
  })

  it('refuses anything above 1x until it is paid for', async () => {
    const g = await loadGame()
    g.startRun()
    expect(g.setGameSpeed(2)).toBe(false)
    expect(g.setGameSpeed(3)).toBe(false)
    expect(g.gameSpeed.value).toBe(1)
  })

  it('always lets the player slow back down', async () => {
    // 1x is never a purchase. A player who cannot return to normal speed has
    // been sold a one-way door.
    const g = await loadGame()
    g.startRun()
    g.grantSpeedBuff(3)
    expect(g.gameSpeed.value).toBe(3)
    expect(g.setGameSpeed(1)).toBe(true)
    expect(g.gameSpeed.value).toBe(1)
  })

  it('lands on the rung that was actually tapped', async () => {
    const g = await loadGame()
    g.startRun()
    g.grantSpeedBuff(3)
    expect(g.gameSpeed.value).toBe(3)
  })

  it('unlocks the whole ladder with ONE purchase', async () => {
    // The video buys fast-forward; how fast is a preference, not a second
    // transaction.
    const g = await loadGame()
    g.startRun()
    g.grantSpeedBuff(2)
    expect(g.setGameSpeed(3)).toBe(true)
    expect(g.gameSpeed.value).toBe(3)
  })

  it('clamps a nonsense target instead of running the sim at it', async () => {
    const g = await loadGame()
    g.startRun()
    g.grantSpeedBuff(99)
    expect(g.gameSpeed.value).toBe(g.MAX_GAME_SPEED)
    g.setGameSpeed(0)
    expect(g.gameSpeed.value).toBe(1)
  })

  it('drops to 1x when the buff runs out', async () => {
    const g = await loadGame()
    g.startRun()
    g.grantSpeedBuff(3)
    g.callWave()
    // `step` bills the buff in REAL time, so one oversized call retires it.
    g.step(g.SPEED_BUFF_MS + 1000)
    expect(g.speedBuffLeft.value).toBe(0)
    expect(g.gameSpeed.value).toBe(1)
    expect(g.setGameSpeed(2)).toBe(false)
  })

  it('cycles every rung from the keyboard and wraps home', async () => {
    const g = await loadGame()
    g.startRun()
    g.grantSpeedBuff(2)
    g.setGameSpeed(1)
    const seen: number[] = []
    for (let i = 0; i < 4; i++) { g.toggleSpeed(); seen.push(g.gameSpeed.value) }
    expect(seen).toEqual([2, 3, 1, 2])
  })

  it('pins the toggle at 1x while nothing is bought', async () => {
    const g = await loadGame()
    g.startRun()
    g.toggleSpeed()
    expect(g.gameSpeed.value).toBe(1)
  })
})

describe('the substep budget actually delivers 3x', () => {
  it('advances three times as much simulated time at 3x as at 1x', async () => {
    // Regression guard for the real trap: `step` clamps how much simulated time
    // one frame may advance, and at the old ceiling a 3x frame was cut back to
    // roughly 2x on a 30 Hz device. Nothing on screen said so — the player paid
    // for a multiplier the clamp then quietly ate.
    //
    // Measured at 30 Hz on purpose. At 60 Hz the old ceiling was wide enough
    // and this passes either way; the bug only exists on the slower devices
    // that most need the fast-forward.
    const FRAME_MS = 1000 / 30
    const simTimeAt = async (speed: number): Promise<number> => {
      const g = await loadGame()
      g.startRun()
      g.grantSpeedBuff(speed)
      g.callWave()
      const before = g.nowMs()
      for (let i = 0; i < 20; i++) g.step(FRAME_MS)
      return g.nowMs() - before
    }

    const at1 = await simTimeAt(1)
    const at3 = await simTimeAt(3)
    // A tick of slack either way for accumulator rounding at the boundaries.
    expect(at3 / at1).toBeGreaterThan(2.8)
    expect(at3 / at1).toBeLessThan(3.2)
  })
})

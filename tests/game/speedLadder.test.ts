import { beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Fast-forward ladder ────────────────────────────────────────────────────
//
// 1x / 1.5x / 3x, where the middle rung is FREE and only the top one is bought.
// What is asserted here is the part a switch cannot show: that 1x is never
// gated (the player can always slow down), that 1.5x costs nothing and 3x costs
// a purchase, that a fractional rung survives every clamp between the tap and
// the simulation, and that the substep budget actually delivers the multiplier
// rather than silently clamping it back.
//
// The fractional rung is the trap worth a test of its own. Every entry point
// into the speed system used to round its argument to an integer, which turned
// a tap on 1.5x into a request for a 2x that is on no ladder at all — the
// segment simply did nothing, and nothing in the type system had an opinion
// about it.

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
    expect([...g.GAME_SPEEDS]).toEqual([1, 1.5, 3])
    expect(g.MAX_GAME_SPEED).toBe(3)
    expect(g.GAME_SPEEDS[0]).toBe(1)
    expect(Math.max(...g.GAME_SPEEDS)).toBe(g.MAX_GAME_SPEED)
  })

  it('gives the middle rung away and charges only for the top one', async () => {
    const g = await loadGame()
    expect(g.needsSpeedBuff(1)).toBe(false)
    expect(g.needsSpeedBuff(g.FREE_MAX_SPEED)).toBe(false)
    expect(g.needsSpeedBuff(3)).toBe(true)
  })

  it('lets an unpaid player reach 1.5x and no further', async () => {
    const g = await loadGame()
    g.startRun()
    expect(g.setGameSpeed(1.5)).toBe(true)
    expect(g.gameSpeed.value).toBe(1.5)
    expect(g.setGameSpeed(3)).toBe(false)
    expect(g.gameSpeed.value).toBe(1.5)
  })

  it('does not round the fractional rung into a rung that does not exist', async () => {
    // The whole failure mode in one assertion: `Math.round(1.5)` is 2, 2 is not
    // on the ladder, and a segment that silently refuses every tap looks
    // exactly like a segment that is merely slow to respond.
    const g = await loadGame()
    g.startRun()
    expect(g.setGameSpeed(1.5)).toBe(true)
    expect(g.gameSpeed.value).toBe(1.5)
    expect(g.setGameSpeed(2)).toBe(false)
    expect(g.gameSpeed.value).toBe(1.5)
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

  it('unlocks every paid rung with ONE purchase', async () => {
    // The video buys fast-forward; how fast is a preference, not a second
    // transaction.
    const g = await loadGame()
    g.startRun()
    g.grantSpeedBuff(1.5)
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

  it('falls back to the free rung when the buff runs out, not to a stop', async () => {
    // The player paid for the difference between 1.5x and 3x. Taking 1.5x away
    // at expiry confiscates something that was never sold — and a battle that
    // lurches from 3x to 1x mid-wave reads as the game freezing.
    const g = await loadGame()
    g.startRun()
    g.grantSpeedBuff(3)
    g.callWave()
    // `step` bills the buff in REAL time, so one oversized call retires it.
    g.step(g.SPEED_BUFF_MS + 1000)
    expect(g.speedBuffLeft.value).toBe(0)
    expect(g.gameSpeed.value).toBe(g.FREE_MAX_SPEED)
    expect(g.setGameSpeed(3)).toBe(false)
    expect(g.setGameSpeed(1.5)).toBe(true)
  })

  it('cycles every rung from the keyboard and wraps home', async () => {
    const g = await loadGame()
    g.startRun()
    g.grantSpeedBuff(3)
    g.setGameSpeed(1)
    const seen: number[] = []
    for (let i = 0; i < 4; i++) { g.toggleSpeed(); seen.push(g.gameSpeed.value) }
    expect(seen).toEqual([1.5, 3, 1, 1.5])
  })

  it('cycles only the free rungs while nothing is bought', async () => {
    // It used to pin at 1x, which was right when every rung above it was behind
    // a video and is now a key that refuses to do the free thing it points at.
    //
    // The cycle STARTS from 1.5x because that is where a run opens (see
    // `openSpeedForRun`), so the first press is the one that slows the game
    // down. What matters is the pair it walks and the rung it never reaches.
    const g = await loadGame()
    g.startRun()
    expect(g.gameSpeed.value).toBe(1.5)
    const seen: number[] = []
    for (let i = 0; i < 3; i++) { g.toggleSpeed(); seen.push(g.gameSpeed.value) }
    expect(seen).toEqual([1, 1.5, 1])
    expect(seen).not.toContain(3)
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

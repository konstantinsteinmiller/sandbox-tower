import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  resourceFloats, pushResourceFloat, clearResourceFloats, FLOAT_LIFE_MS
} from '@/use/useResourceFloats'

// ─── Wave payout floats ─────────────────────────────────────────────────────
//
// The queue that replaced the wave-clear toast's payout table. Everything here
// is about it not becoming litter: a float that never expires is a number stuck
// over the resource bar for the rest of the run.

beforeEach(() => {
  clearResourceFloats()
  vi.useRealTimers()
})

describe('resource payout floats', () => {
  it('queues one float per resource', () => {
    pushResourceFloat('wood', 33)
    pushResourceFloat('stone', 24)
    expect(resourceFloats.value.map((f) => `${f.id}+${f.amount}`)).toEqual(['wood+33', 'stone+24'])
  })

  it('drops anything that did not actually pay', () => {
    // A "+0 stone" float teaches the player that the animation is noise.
    pushResourceFloat('wood', 0)
    pushResourceFloat('stone', -5)
    pushResourceFloat('gold', Number.NaN)
    expect(resourceFloats.value).toEqual([])
  })

  it('rounds, so a fractional payout never prints a decimal over the bar', () => {
    pushResourceFloat('gold', 12.6)
    expect(resourceFloats.value[0]!.amount).toBe(13)
  })

  it('expires on its own', () => {
    vi.useFakeTimers()
    pushResourceFloat('wood', 12)
    expect(resourceFloats.value).toHaveLength(1)
    vi.advanceTimersByTime(FLOAT_LIFE_MS + 10)
    expect(resourceFloats.value).toEqual([])
  })

  it('caps how many can stack over the bar at once', () => {
    // Selling a row of blocks fires one per sale; unbounded they would pile
    // into an illegible column.
    for (let i = 1; i <= 20; i++) pushResourceFloat('wood', i)
    expect(resourceFloats.value.length).toBeLessThanOrEqual(8)
    // The ones kept are the most recent.
    expect(resourceFloats.value.at(-1)!.amount).toBe(20)
  })

  it('clears outright, so a new run starts with an empty bar', () => {
    pushResourceFloat('wood', 5)
    pushResourceFloat('gold', 5)
    clearResourceFloats()
    expect(resourceFloats.value).toEqual([])
  })
})

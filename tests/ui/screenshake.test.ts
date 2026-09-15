import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

/**
 * The battlefield has to be STILL between hits.
 *
 * Reported from play: "the screen keeps moving left and right on attacks."
 * Not one dramatic shake — a constant low jitter for the length of a battle,
 * from two compounding defects. Every `triggerShake` started its own rAF loop
 * against one shared style ref and never stopped the last one, and the force
 * curve carried a `+ 4` floor so a finished shake still displaced the canvas.
 * Overlap a dozen of those at a few per second and the picture never settles.
 */

/** Drive the rAF chain by hand, so a shake's whole life is a few sync steps. */
const driveFrames = (): { tick: (ms: number) => void } => {
  let now = 0
  let queued: ((t: number) => void)[] = []
  vi.stubGlobal('requestAnimationFrame', (cb: (t: number) => void) => {
    queued.push(cb)
    return queued.length
  })
  vi.stubGlobal('performance', { now: () => now })
  return {
    tick: (ms: number) => {
      now += ms
      const due = queued
      queued = []
      for (const cb of due) cb(now)
    }
  }
}

const translateOf = (style: { transform?: string }): { x: number; y: number } => {
  const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(style.transform ?? '')
  return m ? { x: parseFloat(m[1]!), y: parseFloat(m[2]!) } : { x: 0, y: 0 }
}

const load = async () => {
  vi.resetModules()
  const { useScreenshake } = await import('@/use/useScreenshake')
  return useScreenshake()
}

beforeEach(() => {
  vi.unstubAllGlobals()
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
})
afterEach(() => vi.unstubAllGlobals())

describe('screen shake', () => {
  it('comes to a complete stop, rather than settling at a floor', async () => {
    const frames = driveFrames()
    const { shakeStyle, triggerShake } = await load()
    triggerShake('small')
    // Past the 300ms 'small' duration.
    for (let i = 0; i < 25; i++) frames.tick(16)
    expect(translateOf(shakeStyle.value)).toEqual({ x: 0, y: 0 })
  })

  it('does not stack: a wave of hits leaves ONE shake running', async () => {
    const frames = driveFrames()
    const { shakeStyle, triggerShake } = await load()
    // A busy battle — a hit every other frame for half a second.
    for (let i = 0; i < 16; i++) {
      triggerShake('small')
      frames.tick(16)
    }
    // Once the last one has had its 300ms, everything is still. With loops
    // stacking, some other loop was always mid-decay and this never held.
    for (let i = 0; i < 25; i++) frames.tick(16)
    expect(translateOf(shakeStyle.value)).toEqual({ x: 0, y: 0 })
  })

  it('never displaces further than the intensity it was asked for', async () => {
    const frames = driveFrames()
    const { shakeStyle, triggerShake } = await load()
    let peak = 0
    triggerShake('small')
    for (let i = 0; i < 25; i++) {
      frames.tick(16)
      const { x, y } = translateOf(shakeStyle.value)
      peak = Math.max(peak, Math.abs(x), Math.abs(y))
    }
    // 'small' is a force of 5, spread over ±half of it.
    expect(peak).toBeLessThanOrEqual(2.5)
  })

  it('lets a bigger shake take over, and refuses to be downgraded by a smaller one', async () => {
    const frames = driveFrames()
    const { shakeStyle, triggerShake } = await load()
    triggerShake('big')
    frames.tick(16)
    // An arrow landing must not cut a boss death short.
    triggerShake('small')
    let peak = 0
    for (let i = 0; i < 10; i++) {
      frames.tick(16)
      const { x, y } = translateOf(shakeStyle.value)
      peak = Math.max(peak, Math.abs(x), Math.abs(y))
    }
    expect(peak).toBeGreaterThan(2.5)
  })

  it('does not shake at all when the player asked for reduced motion', async () => {
    const frames = driveFrames()
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduced-motion') }))
    const { shakeStyle, triggerShake } = await load()
    triggerShake('big')
    for (let i = 0; i < 10; i++) frames.tick(16)
    expect(translateOf(shakeStyle.value)).toEqual({ x: 0, y: 0 })
  })
})

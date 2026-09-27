import { describe, expect, it } from 'vitest'

/**
 * ─── Shadows under painted art ──────────────────────────────────────────────
 *
 * A design's contact shadow is part of its baked frame. A PAINTED strip
 * replaces the whole frame, and a painter cannot paint a soft shadow over a
 * chroma key (the prompts forbid it), so the battlefield lays the design's
 * shadow under a painted strip from the numbers the design declares — and the
 * art bench leaves shadows out of every reference, because the slicer
 * registers a return by the bottom of the reference's ink.
 *
 * Both halves fail silently: a missing spec is a painted bug hovering over the
 * sand, and a shadow left in a reference lands every painted character a
 * shadow's depth too low. Neither shows until somebody paints.
 */

/** A context that counts every drawing call made on it. */
const countingContext = (): { ctx: CanvasRenderingContext2D; calls: () => number } => {
  let n = 0
  const ctx = new Proxy({}, {
    get: (_t, key) => (key === 'canvas' ? undefined : () => { n++ }),
    set: () => true
  }) as unknown as CanvasRenderingContext2D
  return { ctx, calls: () => n }
}

describe('contact shadows and painted art', () => {
  it('declares a shadow for every walking and flying design, and none for a swimmer', async () => {
    const { MONSTERS } = await import('@/game/monsters')
    for (const m of MONSTERS) {
      if ((m.anchor ?? 'feet') === 'centre') {
        expect(m.shadow, `${m.id} swims and has no shadow`).toBeUndefined()
      } else {
        expect(m.shadow, `${m.id} needs a shadow spec for its painted strip`).toBeDefined()
        expect(m.shadow!.a).toBeGreaterThan(0)
        expect(m.shadow!.w).toBeGreaterThan(0)
      }
    }
  })

  it('draws no shadow at all inside withoutShadows, and draws one outside it', async () => {
    const { groundShadow, withoutShadows } = await import('@/game/monsterKit')
    const off = countingContext()
    withoutShadows(() => groundShadow(off.ctx, 40, 0.7, 1.02, 0.24))
    expect(off.calls()).toBe(0)

    const on = countingContext()
    groundShadow(on.ctx, 40, 0.7, 1.02, 0.24)
    expect(on.calls()).toBeGreaterThan(0)
  })

  it('restores shadows after withoutShadows, even when the body throws', async () => {
    const { groundShadow, withoutShadows } = await import('@/game/monsterKit')
    expect(() => withoutShadows(() => { throw new Error('boom') })).toThrow('boom')
    const after = countingContext()
    groundShadow(after.ctx, 40, 0.7)
    expect(after.calls()).toBeGreaterThan(0)
  })
})

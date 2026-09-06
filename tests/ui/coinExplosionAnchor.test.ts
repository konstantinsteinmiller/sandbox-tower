import { describe, expect, it, vi } from 'vitest'

// ─── The coin burst's anchors ───────────────────────────────────────────────
//
// `ref="x"` on a COMPONENT hands back Vue's public instance, not the element.
// The two are indistinguishable at the call site, and the difference only
// showed up as `sourceEl.getBoundingClientRect is not a function` — thrown from
// inside a click handler, AFTER the reward had already been banked, so the
// player kept the coins and lost the rest of the handler.
//
// Six components emit `coins-awarded`. These pin the resolution so a seventh
// cannot reintroduce it.

vi.mock('@/use/useSound', () => ({
  default: () => ({ playSound: () => undefined })
}))
vi.mock('@/utils/function', () => ({ prependBaseUrl: (p: string) => p }))

describe('resolveAnchor', () => {
  it('passes a real element straight through', async () => {
    const { resolveAnchor } = await import('@/use/useCoinExplosion')
    const el = document.createElement('div')
    expect(resolveAnchor(el)).toBe(el)
  })

  it('unwraps a component instance to its root element', async () => {
    const { resolveAnchor } = await import('@/use/useCoinExplosion')
    const el = document.createElement('button')
    expect(resolveAnchor({ $el: el } as never)).toBe(el)
  })

  it('returns null for a null ref, or a component with no element yet', async () => {
    const { resolveAnchor } = await import('@/use/useCoinExplosion')
    expect(resolveAnchor(null)).toBeNull()
    expect(resolveAnchor(undefined)).toBeNull()
    expect(resolveAnchor({} as never)).toBeNull()
    // A comment placeholder is what an unmounted `v-if` root leaves behind.
    expect(resolveAnchor({ $el: document.createComment('v-if') } as never)).toBeNull()
  })
})

describe('spawnCoinExplosion', () => {
  it('bursts from a component ref without throwing', async () => {
    const { spawnCoinExplosion } = await import('@/use/useCoinExplosion')
    const source = document.createElement('div')
    const target = document.createElement('div')
    document.body.append(source, target)
    expect(() => spawnCoinExplosion({
      sourceEl: { $el: source } as never, targetEl: target, count: 3
    })).not.toThrow()
  })

  it('drops the animation rather than throwing when an anchor is missing', async () => {
    const { spawnCoinExplosion } = await import('@/use/useCoinExplosion')
    const target = document.createElement('div')
    document.body.appendChild(target)
    expect(() => spawnCoinExplosion({ sourceEl: null, targetEl: target })).not.toThrow()
    expect(() => spawnCoinExplosion({ sourceEl: target, targetEl: null })).not.toThrow()
  })
})

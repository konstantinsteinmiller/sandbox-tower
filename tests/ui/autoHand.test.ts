import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { useAutoHand, type HandStep } from '@/use/useAutoHand'
import TutorialHand from '@/components/game/TutorialHand.vue'

/**
 * ─── The automatic hand plays its script, and nothing after it is stopped ───
 *
 * The desktop tutorial hands the Gate's rank to a scripted hand: glide to the
 * Gate, tap it, glide to Upgrade, tap it. Every tap is a real one — the second
 * buys a rank — so the properties that matter are about ORDER and about
 * STOPPING: each action fires once, as its finger lifts, in sequence; a
 * cancelled script never fires another; and a target that cannot be found ends
 * the script instead of leaving a hand hovering over a tutorial with no Skip.
 */

describe('useAutoHand', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  const script = (log: string[], gate = { x: 100, y: 200 }, button: { x: number; y: number } | null = { x: 300, y: 400 }): HandStep[] => [
    { kind: 'wait', ms: 100 },
    { kind: 'move', to: () => gate, ms: 500 },
    { kind: 'press', ms: 150, then: () => log.push('tap gate') },
    { kind: 'wait', ms: 300 },
    { kind: 'move', to: () => button, ms: 400 },
    { kind: 'press', ms: 150, then: () => log.push('tap upgrade') },
    { kind: 'wait', ms: 600 }
  ]

  it('glides, taps as the finger lifts, and taps in order — then goes away', async () => {
    const { hand, run } = useAutoHand()
    const log: string[] = []
    const done = run(script(log), { x: 10, y: 20 })

    expect(hand.visible).toBe(true)
    expect([hand.x, hand.y]).toEqual([10, 20])

    await vi.advanceTimersByTimeAsync(100)
    expect([hand.x, hand.y]).toEqual([100, 200])
    expect(hand.moveMs).toBe(500)

    await vi.advanceTimersByTimeAsync(500)
    // Pressing: the finger is down, and nothing has been tapped yet.
    expect(hand.pressing).toBe(true)
    expect(log).toEqual([])

    await vi.advanceTimersByTimeAsync(150)
    expect(hand.pressing).toBe(false)
    expect(log).toEqual(['tap gate'])

    await vi.advanceTimersByTimeAsync(300 + 400 + 150)
    expect(log).toEqual(['tap gate', 'tap upgrade'])
    expect(hand.visible).toBe(true)

    await vi.advanceTimersByTimeAsync(600)
    await expect(done).resolves.toBe('done')
    expect(hand.visible).toBe(false)
  })

  it('never taps again once cancelled', async () => {
    const { hand, run, cancel } = useAutoHand()
    const log: string[] = []
    const done = run(script(log), { x: 0, y: 0 })

    await vi.advanceTimersByTimeAsync(100 + 500 + 150)
    expect(log).toEqual(['tap gate'])
    cancel()
    expect(hand.visible).toBe(false)

    await vi.advanceTimersByTimeAsync(5_000)
    await expect(done).resolves.toBe('cancelled')
    expect(log).toEqual(['tap gate'])
  })

  it('cancels mid-press without landing the tap', async () => {
    const { run, cancel } = useAutoHand()
    const log: string[] = []
    const done = run(script(log), { x: 0, y: 0 })
    await vi.advanceTimersByTimeAsync(100 + 500 + 50)
    cancel()
    await vi.advanceTimersByTimeAsync(5_000)
    await expect(done).resolves.toBe('cancelled')
    expect(log).toEqual([])
  })

  it('ends as lost when a target is not there, and taps nothing after it', async () => {
    const { hand, run } = useAutoHand()
    const log: string[] = []
    const done = run(script(log, { x: 1, y: 1 }, null), { x: 0, y: 0 })
    await vi.advanceTimersByTimeAsync(5_000)
    await expect(done).resolves.toBe('lost')
    expect(log).toEqual(['tap gate'])
    expect(hand.visible).toBe(false)
  })

  it('lets a newer script take over from an older one, which then taps nothing', async () => {
    const { run } = useAutoHand()
    const first: string[] = []
    const second: string[] = []
    const a = run(script(first), { x: 0, y: 0 })
    await vi.advanceTimersByTimeAsync(200)
    const b = run(script(second), { x: 0, y: 0 })
    await vi.advanceTimersByTimeAsync(5_000)
    await expect(a).resolves.toBe('cancelled')
    await expect(b).resolves.toBe('done')
    expect(first).toEqual([])
    expect(second).toEqual(['tap gate', 'tap upgrade'])
  })
})

describe('TutorialHand', () => {
  it('draws nothing while hidden, and puts the fingertip on the point when shown', async () => {
    const { hand } = useAutoHand()
    const w = mount(TutorialHand, { props: { hand }, attachTo: document.body })
    expect(w.find('.thand-layer').exists()).toBe(false)

    hand.visible = true
    hand.x = 120
    hand.y = 340
    hand.moveMs = 650
    await nextTick()
    const el = w.find('.thand').element as HTMLElement
    expect(el.style.left).toBe('120px')
    expect(el.style.top).toBe('340px')
    expect(el.style.transitionDuration).toBe('650ms')
    w.unmount()
  })

  it('holds the player\'s taps while it demonstrates', async () => {
    const { hand } = useAutoHand()
    hand.visible = true
    const w = mount(TutorialHand, { props: { hand }, attachTo: document.body })
    const reached = vi.fn()
    document.body.addEventListener('click', reached)
    await w.find('.thand-layer').trigger('click')
    expect(reached).not.toHaveBeenCalled()
    document.body.removeEventListener('click', reached)
    w.unmount()
  })
})

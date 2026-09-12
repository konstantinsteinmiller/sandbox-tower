import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DropDemo from '@/mobile-fit/components/DropDemo.vue'

/**
 * ─── The drop, shown ─────────────────────────────────────────────────────────
 *
 * The phone's first lesson plays itself: a ghost of the armed piece rides a
 * finger from its tray card into the lit column. It sits OVER the coach-mark
 * dim, so the two things it must never do are say anything and catch a touch.
 */

const FROM = { x: 150, y: 700, w: 60, h: 70 }
const TO = { x: 100, y: 400, w: 48, h: 48 }

const demo = (props: Record<string, unknown>) =>
  mount(DropDemo, { props, global: { stubs: { ShapeTile: true } } })

describe('drop demo', () => {
  it('draws the piece, a finger and the release — and nothing to read', () => {
    const w = demo({ shapeId: 'b_wood', from: FROM, to: TO })
    expect(w.find('.demo__ghost').exists()).toBe(true)
    expect(w.find('.demo__touch').exists()).toBe(true)
    expect(w.find('.demo__ripple').exists()).toBe(true)
    expect(w.text().trim()).toBe('')
    expect(w.findAll('button')).toHaveLength(0)
    w.unmount()
  })

  it('is hidden from assistive tech — it is a picture of a gesture', () => {
    const w = demo({ shapeId: 'b_wood', from: FROM, to: TO })
    expect(w.find('.demo').attributes('aria-hidden')).toBe('true')
    w.unmount()
  })

  it('travels from the card centre to the landing cell centre', () => {
    const w = demo({ shapeId: 'b_wood', from: FROM, to: TO })
    const s = (w.find('.demo').element as HTMLElement).style
    expect(s.getPropertyValue('--x0')).toBe('180px')
    expect(s.getPropertyValue('--y0')).toBe('735px')
    expect(s.getPropertyValue('--dx')).toBe(`${124 - 180}px`)
    expect(s.getPropertyValue('--dy')).toBe(`${424 - 735}px`)
    // Painted at the tray's 52 px and scaled down to the cell.
    expect(Number(s.getPropertyValue('--s1'))).toBeCloseTo(48 / 52, 3)
    w.unmount()
  })

  it.each([
    ['no piece', { shapeId: null, from: FROM, to: TO }],
    ['no card', { shapeId: 'b_wood', from: null, to: TO }],
    ['no landing cell', { shapeId: 'b_wood', from: FROM, to: null }]
  ])('renders nothing with %s', (_label, props) => {
    const w = demo(props)
    expect(w.find('.demo').exists()).toBe(false)
    w.unmount()
  })
})

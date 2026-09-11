import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'

vi.mock('@/use/useSound', () => ({
  default: () => ({ playSound: () => null })
}))

// A camera with one cell every 40 px and the Gate's column at x = 200, ground
// at y = 400 — so a tap lands on a cell the test can name.
vi.mock('@/use/useTowerCamera', () => ({
  screenToWorldX: (x: number) => (x - 200) / 40,
  screenToCell: (x: number, y: number) => ({ c: Math.round((x - 200) / 40), r: Math.floor((400 - y) / 40) })
}))

/**
 * ─── The gift tile ──────────────────────────────────────────────────────────
 *
 * It owns its whole gesture, so the scenes' placement handlers never learn
 * about gifts. What must hold: a tap on the tile arms it (and tells the scene
 * to put its hand down), the next short tap on the board places the gift where
 * it landed, a drag on the board is left to the scene, and arming a piece from
 * the hand stands the gift down.
 */

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: { en: { gift: { free: 'Free', tile: 'Free {name}', pair: 'Pair {name}', firstClear: 'Wave {n}' } } }
})

const pointer = (type: string, x: number, y: number, id = 1): MouseEvent => {
  const ev = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y })
  Object.defineProperty(ev, 'pointerId', { value: id })
  return ev
}

const setup = async (variant: 'cell' | 'footprint') => {
  vi.resetModules()
  localStorage.clear()
  const game = await import('@/use/useTowerGame')
  if (variant === 'cell') {
    const { DROPMERGE_RULES } = await import('@/mobile-fit/rules')
    game.applyRules(DROPMERGE_RULES)
  }
  game.startRun()
  game.buildClockHeld.value = true
  const gifts = await import('@/use/useGifts')
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  const { default: GiftTile } = await import('@/components/game/GiftTile.vue')
  const w = mount(GiftTile, {
    props: { variant, canvas, slotArmed: false },
    global: { plugins: [i18n] },
    attachTo: document.body
  })
  return { w, game, gifts, canvas }
}

/** Tap the tile: a press and a release in place. */
const tapTile = async (w: Awaited<ReturnType<typeof setup>>['w']): Promise<void> => {
  const tile = w.find('.gift__tile').element
  tile.dispatchEvent(pointer('pointerdown', 10, 10))
  window.dispatchEvent(pointer('pointerup', 10, 10))
  await w.vm.$nextTick()
}

const tapBoard = (canvas: HTMLCanvasElement, x: number, y: number, moveTo?: [number, number]): void => {
  canvas.dispatchEvent(pointer('pointerdown', x, y))
  const [ux, uy] = moveTo ?? [x, y]
  canvas.dispatchEvent(pointer('pointerup', ux, uy))
}

describe('gift tile', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('shows only while there is a gift to place', async () => {
    const { w, gifts } = await setup('footprint')
    expect(w.find('.gift__tile').exists()).toBe(false)
    gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    await w.vm.$nextTick()
    expect(w.find('.gift__tile').exists()).toBe(true)
    w.unmount()
  })

  it('arms on a tap, and places on the tower where the board is tapped', async () => {
    const { w, game, gifts, canvas } = await setup('footprint')
    gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    await w.vm.$nextTick()
    await tapTile(w)
    expect(w.emitted('armed')).toHaveLength(1)
    // Cell (1, 0): one column right of the Gate, on the ground.
    tapBoard(canvas, 240, 390)
    await w.vm.$nextTick()
    const b = game.getBlocks().get('1,0')
    expect(b?.typeId).toBe('tesla')
    expect(b?.tier).toBe(2)
    expect(w.emitted('placed')).toHaveLength(1)
    expect(gifts.gifts.value).toHaveLength(0)
    w.unmount()
  })

  it('leaves a drag on the board to the scene', async () => {
    const { w, game, gifts, canvas } = await setup('footprint')
    gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    await w.vm.$nextTick()
    await tapTile(w)
    tapBoard(canvas, 240, 390, [320, 390])
    expect(game.getBlocks().has('1,0')).toBe(false)
    expect(gifts.gifts.value).toHaveLength(1)
    w.unmount()
  })

  it('does nothing with board taps until it is armed', async () => {
    const { w, game, gifts, canvas } = await setup('footprint')
    gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    await w.vm.$nextTick()
    tapBoard(canvas, 240, 390)
    expect(game.getBlocks().has('1,0')).toBe(false)
    w.unmount()
  })

  it('stands down when the hand arms a piece', async () => {
    const { w, game, gifts, canvas } = await setup('footprint')
    gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    await w.vm.$nextTick()
    await tapTile(w)
    await w.setProps({ slotArmed: true })
    tapBoard(canvas, 240, 390)
    expect(game.getBlocks().has('1,0')).toBe(false)
    expect(gifts.gifts.value).toHaveLength(1)
    w.unmount()
  })

  it('drops into the tapped column on the drop board', async () => {
    const { w, game, gifts, canvas } = await setup('cell')
    gifts.grantGift({ typeId: 'frost', tier: 2, source: 'chest' })
    await w.vm.$nextTick()
    await tapTile(w)
    // Column −2: 80 px left of the Gate's column, anywhere up its height.
    tapBoard(canvas, 120, 100)
    for (let i = 0; i < 400 && game.getDebris().length > 0; i++) game.step(1000 / 60)
    expect(game.getBlocks().get('-2,0')?.typeId).toBe('frost')
    expect(game.getBlocks().get('-2,0')?.tier).toBe(2)
    w.unmount()
  })
})

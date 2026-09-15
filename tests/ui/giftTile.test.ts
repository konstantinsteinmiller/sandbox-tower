import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
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
  messages: {
    en: {
      gift: {
        free: 'Free',
        tile: 'Free {name}',
        pair: 'Pair {name}',
        tilePaid: '{name}, half price',
        pairPaid: 'Pair {name}, half price',
        discount: '-{n}%',
        firstClear: 'Wave {n}'
      }
    }
  }
})

const pointer = (type: string, x: number, y: number, id = 1): MouseEvent => {
  const ev = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y })
  Object.defineProperty(ev, 'pointerId', { value: id })
  return ev
}

const setup = async (variant: 'cell' | 'footprint', props: Record<string, unknown> = {}) => {
  vi.resetModules()
  localStorage.clear()
  const game = await import('@/use/useTowerGame')
  if (variant === 'cell') {
    const { DROPMERGE_RULES } = await import('@/mobile-fit/rules')
    game.applyRules(DROPMERGE_RULES)
  }
  game.startRun()
  game.buildClockHeld.value = true
  // A chest piece past the player's first costs half of building its cells
  // (`giftPrice`); these are gesture tests, so the purse never refuses one.
  game.wood.value = 9_999
  game.stone.value = 9_999
  game.runCoins.value = 9_999
  const gifts = await import('@/use/useGifts')
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  const { default: GiftTile } = await import('@/components/game/GiftTile.vue')
  const w = mount(GiftTile, {
    props: { variant, canvas, slotArmed: false, ...props },
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

  it('refuses a gift the purse cannot pay for, and keeps it in hand', async () => {
    const { w, game, gifts, canvas } = await setup('footprint')
    gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    game.wood.value = 0
    game.stone.value = 0
    game.runCoins.value = 0
    await w.vm.$nextTick()
    // The tile shows a price rather than FREE, and the tap that would place
    // it is refused — the piece stays on the tray for when the payout lands.
    expect(w.find('.gift__free.is-price').exists()).toBe(true)
    await tapTile(w)
    tapBoard(canvas, 240, 390)
    await w.vm.$nextTick()
    expect(game.getBlocks().has('1,0')).toBe(false)
    expect(gifts.gifts.value).toHaveLength(1)
    w.unmount()
  })

  it('says FREE on a free gift and nothing about a discount', async () => {
    const { w, gifts } = await setup('footprint')
    gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest', free: true })
    await w.vm.$nextTick()
    expect(w.find('.gift__free').text()).toBe('Free')
    expect(w.find('.gift__off').exists()).toBe(false)
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

  // The reported bug: a gift won while the tile was disabled (a result screen,
  // a tutorial card) showed up as a gold FREE tile with nothing in it. The tile
  // is v-if'd on disabled, so its canvas mounted when disabled fell — and only
  // a change of GIFT used to repaint it.
  it('paints the piece when the tile appears after being disabled', async () => {
    const { w, gifts } = await setup('cell')
    await w.setProps({ disabled: true })
    gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    await w.vm.$nextTick()
    expect(w.find('canvas.gift__art').exists()).toBe(false)

    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    await w.setProps({ disabled: false })
    await w.vm.$nextTick()
    await w.vm.$nextTick()
    expect(w.find('canvas.gift__art').exists()).toBe(true)
    // `paint` asks the tile's canvas for its context; nothing else does.
    const painted = spy.mock.contexts.some((el) => (el as Element).classList?.contains('gift__art'))
    expect(painted).toBe(true)
    spy.mockRestore()
    w.unmount()
  })

  it('sizes its preview to the tray it stands in', async () => {
    const { w, gifts } = await setup('footprint')
    gifts.grantGift({ typeId: 'frost', tier: 2, source: 'chest' })
    await w.setProps({ inTray: true, size: 64 })
    await w.vm.$nextTick()
    expect(w.find('.gift').classes()).toContain('is-tray')
    const tile = w.find('.gift__tile').element as HTMLElement
    expect(tile.style.getPropertyValue('--gift-art')).toBe('64px')
    w.unmount()
  })
})

/**
 * ─── Nothing the hand's scroller can slice ──────────────────────────────────
 *
 * The tile stands in `BuildTray`'s first slot, and that tray's `__scroll` is a
 * scroll container — `overflow-x: auto`, because a narrow hand scrolls
 * sideways. A scroll container clips on BOTH axes whatever `overflow-y` says,
 * so everything the tile hung outside itself was being cut away: the arrival
 * pill above it was never visible at all, and at the left end of a scrolled row
 * the red count badge showed as a sliced wedge against the panel edge. Both
 * came back from CrazyGames QA as screenshots.
 *
 * The cue leaves the box (teleported, placed in screen space) and the corner
 * badges move inside the tile. What is pinned here is the PROPERTY that fixes
 * them — neither may depend on an ancestor choosing not to clip.
 */
describe('the gift tile overhangs nothing', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('draws the arrival cue outside the component, not inside the tile', async () => {
    const { w, gifts } = await setup('footprint', { inTray: true })
    gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    await w.vm.$nextTick()
    await w.vm.$nextTick()
    const cue = document.querySelector('.gift__cue')
    expect(cue, 'the cue should be on screen after a gift lands').not.toBeNull()
    // Teleported: it is NOT a descendant of the tile that would be clipped.
    expect(w.find('.gift__cue').exists()).toBe(false)
    // The property that actually fixes the bug: the pill is not inside the
    // component's own tree, so no ancestor of the tile can clip it.
    expect(w.element.contains(cue)).toBe(false)
    expect(document.body.contains(cue)).toBe(true)
    // And placed in screen space. `position: fixed` itself lives in the scoped
    // stylesheet, which jsdom never loads — what IS observable here is that the
    // component hands it viewport coordinates rather than leaving it to flow
    // inside whatever it was mounted in.
    const style = (cue as HTMLElement).getAttribute('style') ?? ''
    expect(style).toMatch(/left:\s*\d+px/)
    expect(style).toMatch(/bottom:\s*\d+px/)
    w.unmount()
  })

  it('takes the cue away with the component', async () => {
    const { w, gifts } = await setup('footprint', { inTray: true })
    gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    await w.vm.$nextTick()
    await w.vm.$nextTick()
    expect(document.querySelector('.gift__cue')).not.toBeNull()
    w.unmount()
    await nextTick()
    // A teleported node is the one kind that can outlive its component and sit
    // on screen forever; it must not.
    expect(document.querySelector('.gift__cue')).toBeNull()
  })

  it('carries the handle the coach finds it by', async () => {
    const { w, gifts } = await setup('footprint', { inTray: true })
    gifts.grantGift({ typeId: 'tesla', tier: 2, source: 'chest' })
    await w.vm.$nextTick()
    expect(w.find('[data-gift-tile]').exists()).toBe(true)
    w.unmount()
  })
})

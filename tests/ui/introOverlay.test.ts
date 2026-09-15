import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'

// The banner's strip bakes on a real canvas; nothing here is about the art.
vi.mock('@/game/monsterSprites', () => ({
  monsterAnchor: () => 'feet',
  monsterFaces: () => 'right',
  monsterFrame: () => null,
  pickMonster: () => 'grumpling',
  primeMonsterSprites: () => {},
  allMonsterIds: () => ['grumpling'],
  SPRITE_FOOT_R: 0.9,
  SPRITE_HEIGHT_R: 0.8
}))

/**
 * ─── The cutscene's frame ───────────────────────────────────────────────────
 *
 * The flight itself is a camera move on the canvas; this component is the
 * letterbox, the three lines of premise, the whip flash and the way out. Four
 * things about it are worth a tripwire:
 *
 *   1. it says the premise IN WORDS, through i18n, at the right moment — the
 *      whole reason the cutscene exists is that the game never explained why
 *      the player is there;
 *   2. `IncomingBanner` — the line the game already owned — appears over the
 *      siege line and nowhere else in the sequence;
 *   3. a tap ANYWHERE gets the player out, and that tap does not reach the
 *      live battlefield underneath it;
 *   4. every timed element is derived from the director's clock, so a skip
 *      moves the type and the camera on the same frame.
 */

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    en: {
      hud: { skip: 'Skip', monstersIncoming: 'Monsters incoming!' },
      intro: {
        premise: 'Your tower is the last thing standing.',
        horde: 'The horde is already marching.',
        siege: 'And they are bringing engines.'
      }
    }
  }
})

const g = { global: { plugins: [i18n] } }

/**
 * Mount the overlay with the director's clock parked at `ms`.
 *
 * The clock is advanced through the real director rather than mocked, so what
 * is asserted is the shipped wiring: `stepIntro` moves the clock, the computeds
 * over it move the DOM.
 */
const atMs = async (ms: number) => {
  vi.resetModules()
  localStorage.clear()
  const game = await import('@/use/useTowerGame')
  const intro = await import('@/use/useIntroCutscene')
  intro.__resetIntroForTests()
  game.startRun()
  intro.playIntro()
  // One frame per 16 ms, as the render loop does.
  for (let t = 0; t < ms; t += 16) intro.stepIntro(16, 1600, 900)
  const { default: IntroCutscene } = await import('@/components/game/IntroCutscene.vue')
  const w = mount(IntroCutscene, g)
  await nextTick()
  return { w, intro, game }
}

afterEach(() => { vi.useRealTimers() })

describe('the premise, in words', () => {
  it('says why the player is there, over the tower', async () => {
    const { w, intro } = await atMs(900)
    expect(intro.introBeat.value).toBe('tower')
    expect(w.find('.intro__line').text()).toBe('Your tower is the last thing standing.')
    w.unmount()
  })

  it('names the horde over the horde, and the engines over the engines', async () => {
    const horde = await atMs(5000)
    expect(horde.w.find('.intro__line').text()).toBe('The horde is already marching.')
    horde.w.unmount()

    const siege = await atMs(7100)
    expect(siege.w.find('.intro__line').text()).toBe('And they are bringing engines.')
    siege.w.unmount()
  })

  it('shows nothing between the lines', async () => {
    // The gaps are deliberate: three cards over ten seconds, each on a shot
    // that is holding. A caption that never leaves is furniture.
    const { w } = await atMs(3200)
    expect(w.find('.intro__card').exists()).toBe(false)
    w.unmount()
  })
})

describe('the line the game already owned', () => {
  it('shows IncomingBanner over the siege line and nowhere else', async () => {
    const early = await atMs(2000)
    expect(early.w.find('.incoming').exists()).toBe(false)
    early.w.unmount()

    const hold = await atMs(8600)
    expect(hold.w.find('.incoming').exists()).toBe(true)
    expect(hold.w.text()).toContain('Monsters incoming!')
    hold.w.unmount()
  })
})

describe('the frame', () => {
  it('closes the letterbox over the first shot and opens it on the way home', async () => {
    const vhOf = (w: any, which: string): number =>
      Number.parseFloat((w.find(`.intro__bar.is-${which}`).attributes('style') ?? '')
        .replace(/[^0-9.]/g, '') || '0')

    const shut = await atMs(1200)
    expect(vhOf(shut.w, 'top')).toBeGreaterThan(7)
    expect(vhOf(shut.w, 'bottom')).toBeGreaterThan(7)
    shut.w.unmount()

    // The bars retract across the whip, so by the time the camera lands they
    // are gone and the HUD is already coming back — one motion, not two.
    const { w } = await atMs(10_680)
    expect(vhOf(w, 'top')).toBeLessThan(1)
    w.unmount()
  })

  it('streaks on the way home, and only there', async () => {
    const flying = await atMs(6000)
    expect(flying.w.find('.intro__whip').exists()).toBe(false)
    flying.w.unmount()

    const whip = await atMs(10_300)
    expect(whip.w.find('.intro__whip').exists()).toBe(true)
    expect(whip.w.find('.intro__flash').exists()).toBe(true)
    whip.w.unmount()
  })
})

describe('the way out', () => {
  it('skips on a tap anywhere, and that tap never reaches the board', async () => {
    const { w, intro } = await atMs(1500)
    const catcher = w.find('.intro__catch')
    // The catcher has to be a real, full-bleed, interactive layer: the
    // battlefield underneath is live and its pointer handlers place blocks, so
    // without it the dismissing tap would build a wall.
    expect(catcher.exists()).toBe(true)

    await catcher.trigger('pointerdown')
    const { introSkipMs } = await import('@/game/introCutscene')
    expect(intro.introClock.value).toBe(introSkipMs())
    // Still running: a skip flies home rather than cutting to the board.
    expect(intro.introActive.value).toBe(true)
    w.unmount()
  })

  it('offers a labelled button while there is still flight to skip', async () => {
    const { w, intro } = await atMs(1500)
    const btn = w.find('.intro__skip')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Skip')
    // Fully up, not a ghost: a player who did not ask for a cutscene has to be
    // able to find this without hunting for it.
    expect(btn.attributes('style')).toContain('opacity: 1')

    await btn.trigger('click')
    expect(intro.introClock.value).toBeGreaterThan(1500)
    w.unmount()
  })

  it('is already on screen inside the first second', async () => {
    // It arrives WITH the letterbox rather than a beat later. The player who
    // wants out wants out immediately, and a skip that appears after the intro
    // has already started talking is a skip they have stopped looking for.
    const { w } = await atMs(560)
    const btn = w.find('.intro__skip')
    expect(btn.exists()).toBe(true)
    expect(Number.parseFloat(
      (btn.attributes('style') ?? '').match(/opacity:\s*([\d.]+)/)?.[1] ?? '0'
    )).toBeGreaterThan(0.8)
    w.unmount()
  })

  it('retires the button once the camera is already on its way home', async () => {
    // A button that outlives its own function is a button players press and
    // watch do nothing.
    const { w } = await atMs(10_300)
    expect(w.find('.intro__skip').exists()).toBe(false)
    w.unmount()
  })
})

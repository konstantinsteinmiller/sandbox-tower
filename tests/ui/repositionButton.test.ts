import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'

// The tile bakes on a real canvas; nothing here is about the art.
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
 * ─── The inspector's Reposition button ──────────────────────────────────────
 *
 * The card's fourth action, and the only WORDLESS one: a four-way arrow, the
 * price, and a coin. That makes three things worth a tripwire, because each of
 * them fails silently:
 *
 *   1. it is not offered on the Gate. The Gate is the run's loss condition and
 *      can never move, and a button that is refused every time it is pressed is
 *      worse than no button;
 *   2. it carries NO word — the whole reason it is glyph-only is that "Move
 *      this block" does not fit a 9.5 rem card in Vietnamese — which makes the
 *      `aria-label` the only name it has. A screen reader would otherwise
 *      announce it as "10";
 *   3. "you cannot afford this" greys it rather than hiding it. Hiding a
 *      control the player could use ten seconds later is how a feature becomes
 *      invisible; the price has to stay legible while it is out of reach.
 */

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    en: {
      close: 'Close',
      blocks: {
        names: { wood: 'Crate', gate: 'Gate' },
        kinds: { structure: 'Structure', core: 'Core' },
        stats: { hp: 'HP' },
        repair: 'Repair',
        reposition: 'Move this block',
        sell: 'Sell',
        upgrade: 'Upgrade',
        upgradeMax: 'Fully upgraded',
        fortify: 'Add spikes',
        rank: 'Lv {n}/{max}'
      }
    }
  }
})

const g = { global: { plugins: [i18n] } }

/**
 * A live run with one crate on the foundation, and the card mounted on it.
 *
 * The block has to be REAL: the button's own guard is `canMoveBlock`, which
 * reads the simulation's grid, so a hand-built object would be refused for the
 * honest reason that no such block is standing.
 */
const openOn = async (cell: [number, number] | 'gate', gold = 9_999) => {
  vi.resetModules()
  localStorage.clear()
  const game = await import('@/use/useTowerGame')
  game.startRun()
  game.wood.value = 9_999
  game.stone.value = 9_999
  game.placeBlock('wood', -3, 0)
  game.runCoins.value = gold

  const key = cell === 'gate' ? '0,0' : `${cell[0]},${cell[1]}`
  const block = game.getBlocks().get(key)!
  expect(block).toBeTruthy()

  const { default: BlockInspector } = await import('@/components/game/BlockInspector.vue')
  const w = mount(BlockInspector, { props: { block }, ...g })
  await nextTick()
  return { w, game }
}

describe('when it is offered', () => {
  it('is on an ordinary block', async () => {
    const { w } = await openOn([-3, 0])
    expect(w.find('.inspector__move').exists()).toBe(true)
    w.unmount()
  })

  it('is never on the Gate', async () => {
    const { w } = await openOn('gate')
    // Not merely disabled — absent. The Gate cannot be moved at any price.
    expect(w.find('.inspector__move').exists()).toBe(false)
    w.unmount()
  })

  it('is gone once the fighting starts', async () => {
    const { w, game } = await openOn([-3, 0])
    expect(w.find('.inspector__move').exists()).toBe(true)

    game.callWave()
    expect(game.phase.value).toBe('battle')
    await nextTick()

    // A gun that teleports out of a fight is a way to dodge damage rather than
    // to build, so `canMoveBlock` refuses mid-battle — and the card has to
    // follow it rather than keep offering a move that would be refused.
    expect(w.find('.inspector__move').exists()).toBe(false)
    w.unmount()
  })
})

describe('what it shows', () => {
  it('is the glyph, the price and a coin — and not one word', async () => {
    const { w, game } = await openOn([-3, 0])
    const btn = w.find('.inspector__move')

    // The only text in the button is the number. Everything else is a glyph.
    expect(btn.text()).toBe(String(game.MOVE_COST))
    expect(btn.text()).toBe('10')
    // The move glyph, and the gold icon beside the price.
    expect(btn.find('.inspector__move-icon').exists()).toBe(true)
    expect(btn.find('.inspector__res-icon').exists()).toBe(true)
    w.unmount()
  })

  it('carries its name for anyone who cannot see the glyph', async () => {
    const { w } = await openOn([-3, 0])
    const btn = w.find('.inspector__move')
    // Routed through i18n, like every other meaningful label in the game.
    expect(btn.attributes('aria-label')).toBe('Move this block')
    expect(btn.attributes('title')).toBe('Move this block')
    w.unmount()
  })
})

describe('when it cannot be paid for', () => {
  it('greys out one coin short, and keeps the price readable', async () => {
    const { w, game } = await openOn([-3, 0], 9)
    const btn = w.find('.inspector__move')

    expect(btn.exists()).toBe(true)
    expect(btn.attributes('disabled')).toBeDefined()
    // Still says what it would cost: "you need 10" is information, and a
    // control greyed into the background answers nothing.
    expect(btn.text()).toBe(String(game.MOVE_COST))
    w.unmount()
  })

  it('is live at exactly the price', async () => {
    const { w } = await openOn([-3, 0], 10)
    expect(w.find('.inspector__move').attributes('disabled')).toBeUndefined()
    w.unmount()
  })
})

describe('what pressing it does', () => {
  it('asks the scene to arm the move rather than moving anything itself',
    async () => {
      const { w, game } = await openOn([-3, 0])
      const before = game.runCoins.value

      await w.find('.inspector__move').trigger('click')

      // The card only emits. Nothing is moved and nothing is charged until the
      // player has chosen a destination on the board — which is the whole of
      // "falling boxes don't happen until the new position is chosen".
      expect(w.emitted('reposition')).toHaveLength(1)
      expect(game.runCoins.value).toBe(before)
      expect(game.getBlocks().get('-3,0')).toBeTruthy()
      w.unmount()
    })

  it('emits nothing when it is greyed out', async () => {
    const { w } = await openOn([-3, 0], 9)
    await w.find('.inspector__move').trigger('click')
    expect(w.emitted('reposition')).toBeUndefined()
    w.unmount()
  })
})

/**
 * ─── The price the card prints ──────────────────────────────────────────────
 *
 * Three base-price moves per three-wave window, then doubling. The card is the
 * only place a player ever sees that, so what is pinned here is that it prints
 * the price the simulation is about to take — the exact failure the early-call
 * bonus badge had one HUD over, where a fixed rate advertised a payout the
 * simulation would not make.
 */
describe('the reshuffle allowance, on the card', () => {
  /** Shuffle the crate between two legal ground cells `n` times. */
  const spend = (game: Awaited<ReturnType<typeof openOn>>['game'], n: number): void => {
    for (let i = 0; i < n; i++) {
      const from = game.getBlocks().has('-3,0') ? -3 : 3
      expect(game.moveBlock(from, 0, from === -3 ? 3 : -3, 0)).toBe(true)
    }
  }

  it('quotes the escalated price, not the base one', async () => {
    const { w, game } = await openOn([-3, 0])
    expect(w.find('.inspector__move-cost').text()).toContain(String(game.MOVE_COST))

    // Three moves spend the allowance; the fourth is priced at double.
    spend(game, game.CHEAP_MOVES)
    await nextTick()
    expect(w.find('.inspector__move-cost').text()).toContain('20')
    w.unmount()
  })

  it('marks the price as surged once it leaves the base rate', async () => {
    const { w, game } = await openOn([-3, 0])
    // Amber, not red: the price has gone up, which is a thing to notice before
    // spending — `:disabled` is what says "you cannot".
    expect(w.find('.inspector__move-cost').classes()).not.toContain('is-surged')
    spend(game, game.CHEAP_MOVES)
    await nextTick()
    expect(w.find('.inspector__move-cost').classes()).toContain('is-surged')
    w.unmount()
  })

  it('counts the cheap moves down in pips, then stops showing them', async () => {
    const { w, game } = await openOn([-3, 0])
    const lit = (): number => w.findAll('.inspector__move-pip.is-on').length
    expect(w.findAll('.inspector__move-pip')).toHaveLength(game.CHEAP_MOVES)
    expect(lit()).toBe(game.CHEAP_MOVES)

    spend(game, 1)
    await nextTick()
    expect(lit()).toBe(game.CHEAP_MOVES - 1)

    spend(game, game.CHEAP_MOVES - 1)
    await nextTick()
    // Spent: the pips retire and the number itself is the message.
    expect(w.findAll('.inspector__move-pip')).toHaveLength(0)
    w.unmount()
  })

  it('greys out against the ESCALATED price, not the base one', async () => {
    // The subtle one. A player holding 15 gold can afford a base-price move and
    // not a surged one, so affordability has to be judged against what this
    // move actually costs — otherwise the button invites a spend the
    // simulation will refuse, which reads as the button being broken.
    const { w, game } = await openOn([-3, 0])
    spend(game, game.CHEAP_MOVES)
    game.runCoins.value = 15
    await nextTick()
    expect(w.find('.inspector__move-cost').text()).toContain('20')
    expect(w.find('.inspector__move').attributes('disabled')).toBeDefined()

    game.runCoins.value = 20
    await nextTick()
    expect(w.find('.inspector__move').attributes('disabled')).toBeUndefined()
    w.unmount()
  })
})

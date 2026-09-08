import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STATE_KEY } from '@/use/useTowerState'
import {
  M2_TECH_KEY, TECH_FOUND_KEY, TECH_KEY, TECH_SPOTLIGHT_KEY
} from '@/keys'

/**
 * ─── The "there is a tech tree" nudge ───────────────────────────────────────
 *
 * Nothing in the game forces a player to open the tech tree, and one who never
 * opens it plays a materially shallower game. So after their first wave the
 * path to it lights up, and stays lit until they take it.
 *
 * Two things make this worth pinning rather than eyeballing:
 *
 *   • It must fire for a first-timer and NEVER for a veteran. The flag that
 *     stops it only exists from this feature onward, so recognising a player
 *     who already knows the screen is inference, not a lookup — and getting it
 *     wrong means nagging the entire existing player base about a screen they
 *     have used for weeks.
 *   • It must retire on the tree being OPENED, by any route, not on the button
 *     being pressed. There are already two ways in.
 *
 * Every case re-imports the module under `vi.resetModules()`, because the flag
 * is seeded once at module load from the save — which is exactly the behaviour
 * under test.
 */

/** Seed the one persisted blob the game reads everything out of. */
const seedSave = (fields: Record<string, unknown>): void => {
  localStorage.setItem(STATE_KEY, JSON.stringify(fields))
}

const load = async () => {
  vi.resetModules()
  const tech = await import('@/use/useTechDiscovery')
  const game = await import('@/use/useTowerGame')
  const progress = await import('@/use/useTowerProgress')
  return { ...tech, game, progress }
}

/**
 * Put the player mid-wave-N.
 *
 * `wave` is the wave being FOUGHT, not the number survived — the distinction
 * this whole nudge turned on, so the tests say which they mean out loud.
 */
const fighting = (g: { wave: { value: number } }, n: number): void => { g.wave.value = n }

beforeEach(() => {
  localStorage.clear()
})
afterEach(() => {
  localStorage.clear()
  vi.resetModules()
})

describe('when the nudge appears', () => {
  it('stays quiet before a wave has even started', async () => {
    seedSave({})
    const { techNudge, game } = await load()
    fighting(game, 0)
    expect(techNudge.value).toBe(false)
  })

  it('stays quiet WHILE wave 1 is being fought', async () => {
    // The bug this pins: `wave` is the wave in progress, so a naive `>= 1`
    // fired a few seconds after boot, while the player was still meeting their
    // first monster.
    seedSave({})
    const { techNudge, game } = await load()
    fighting(game, 1)
    expect(techNudge.value).toBe(false)
  })

  it('lights up once wave 1 is finished and wave 2 has begun', async () => {
    seedSave({})
    const { techNudge, game } = await load()
    fighting(game, 2)
    expect(techNudge.value).toBe(true)
  })

  it('keeps pulling until the tree is actually opened', async () => {
    seedSave({})
    const { techNudge, game } = await load()
    fighting(game, 6)
    expect(techNudge.value).toBe(true)
  })

  it('lights up from the start of a later run for a player who died on wave 1', async () => {
    // They cleared a wave in an earlier run; the lifetime count is banked, so
    // they should not have to reach wave 2 again to be told about the tree.
    seedSave({})
    const { techNudge, game, progress } = await load()
    fighting(game, 0)
    progress.totalWaves.value = 3
    expect(techNudge.value).toBe(true)
  })
})

describe('how it retires', () => {
  it('stops the moment the tree is opened, and stays stopped', async () => {
    seedSave({})
    const { techNudge, markTechFound, game } = await load()
    fighting(game, 3)
    expect(techNudge.value).toBe(true)

    markTechFound()
    expect(techNudge.value).toBe(false)

    // Later waves must not bring it back — the player has seen the screen.
    fighting(game, 20)
    expect(techNudge.value).toBe(false)
  })

  it('persists, so the next session does not start nagging again', async () => {
    seedSave({})
    const first = await load()
    first.markTechFound()

    const next = await load()
    next.game.wave.value = 5
    expect(next.techNudge.value).toBe(false)
    expect(next.techFound.value).toBe(true)
  })

  it('is idempotent — marking twice is not an error and writes one value', async () => {
    seedSave({})
    const { markTechFound, techFound } = await load()
    markTechFound()
    markTechFound()
    expect(techFound.value).toBe(true)
    const blob = JSON.parse(localStorage.getItem(STATE_KEY) ?? '{}')
    expect(blob[TECH_FOUND_KEY]).toBe(true)
  })
})

describe('recognising a player who already knows the tree', () => {
  it('never nudges someone who dismissed the older "Spend!" spotlight', async () => {
    // That spotlight is only cleared by opening the tree, so its presence is
    // proof the player has been there.
    seedSave({ [TECH_SPOTLIGHT_KEY]: true })
    const { techNudge, game } = await load()
    fighting(game, 4)
    expect(techNudge.value).toBe(false)
  })

  it('never nudges someone who has bought a node on the desktop tower', async () => {
    seedSave({ [TECH_KEY]: { levels: { 'foundation': 2 } } })
    const { techNudge, game } = await load()
    fighting(game, 4)
    expect(techNudge.value).toBe(false)
  })

  it('never nudges someone who has bought a node on the phone board', async () => {
    // One save, two boards: finding the tree on the phone counts everywhere.
    seedSave({ [M2_TECH_KEY]: { levels: { 'foundation': 1 } } })
    const { techNudge, game } = await load()
    fighting(game, 4)
    expect(techNudge.value).toBe(false)
  })

  it('DOES nudge a player whose tech state exists but is all zeroes', async () => {
    // A blob is written the first time anything touches it, so its existence
    // proves nothing. Only a level above zero is a purchase.
    seedSave({ [TECH_KEY]: { levels: { 'foundation': 0 } } })
    const { techNudge, game } = await load()
    fighting(game, 4)
    expect(techNudge.value).toBe(true)
  })

  it('survives a malformed tech blob rather than throwing', async () => {
    seedSave({ [TECH_KEY]: 'not an object', [M2_TECH_KEY]: { levels: null } })
    const { techNudge, game } = await load()
    fighting(game, 4)
    expect(techNudge.value).toBe(true)
  })
})

describe('a cloud save that lands late', () => {
  it('retires the nudge when the hydrated blob turns out to know the tree', async () => {
    // On a platform build the module is read before the SDK's save arrives, so
    // a returning player can start the session looking like a first-timer.
    seedSave({})
    const { techNudge, refreshTechFound, game } = await load()
    fighting(game, 2)
    expect(techNudge.value).toBe(true)

    // How a hydrate actually lands: the SDK writes the blob and the save layer
    // reloads the in-memory record from it. Writing localStorage alone would
    // not be seen — `getState` reads the record, not the string.
    seedSave({ [TECH_FOUND_KEY]: true })
    const { reloadTowerState } = await import('@/use/useTowerState')
    reloadTowerState()
    refreshTechFound()
    expect(techNudge.value).toBe(false)
  })

  it('never un-finds a tree already found in this session', async () => {
    seedSave({})
    const { markTechFound, refreshTechFound, techFound, game } = await load()
    fighting(game, 2)
    markTechFound()

    // A hydrate carrying an older blob must not reopen the question.
    seedSave({})
    const { reloadTowerState } = await import('@/use/useTowerState')
    reloadTowerState()
    refreshTechFound()
    expect(techFound.value).toBe(true)
  })
})

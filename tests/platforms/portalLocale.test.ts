import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The portal-language rules, which have their own certification check and have
 * been filed as the SAME ticket against sibling projects more than once.
 *
 * Three behaviours, and they only work together:
 *   1. an explicit in-game choice survives a reload of a steady portal,
 *   2. a portal that CHANGES language outranks that choice (this is the flow
 *      Playgama's guided testing drives, and "player choice always wins" fails
 *      it by design),
 *   3. a stored value with no provenance flag — written by an older build that
 *      seeded the portal locale straight into the player key — loses to the
 *      portal, so a poisoned cloud row self-heals instead of outranking the
 *      portal forever.
 */
const load = async () => {
  vi.resetModules()
  localStorage.clear()
  const state = await import('@/use/useTowerState')
  const mod = await import('@/use/usePortalLocale')
  mod.__resetPortalLocale()
  return { ...mod, ...state }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('portal locale precedence', () => {
  it('falls back when neither the portal nor the player has an opinion', async () => {
    const m = await load()
    expect(m.resolveActiveLocale(null, 'en')).toBe('en')
  })

  it('uses the portal language for a player who has never chosen one', async () => {
    const m = await load()
    m.portalLocale.value = 'de'
    expect(m.resolveActiveLocale(null, 'en')).toBe('de')
  })

  it('keeps an explicit choice while the portal language is steady', async () => {
    const m = await load()
    m.portalLocale.value = 'en'
    m.setState('ts_user_language', 'es')
    m.markLanguageChosenByPlayer()

    expect(m.resolveActiveLocale('es', 'en')).toBe('es')
    // A reload of the same portal must not undo it.
    expect(m.resolveActiveLocale('es', 'en')).toBe('es')
  })

  it('lets a CHANGED portal language outrank an explicit choice', async () => {
    const m = await load()
    m.portalLocale.value = 'en'
    m.setState('ts_user_language', 'es')
    m.markLanguageChosenByPlayer()
    expect(m.resolveActiveLocale('es', 'en')).toBe('es')

    // The QA harness switches the portal to Japanese mid-session.
    m.portalLocale.value = 'ja'
    expect(m.resolveActiveLocale('es', 'en')).toBe('ja')
  })

  it('clears the stale choice on a portal change so it cannot fight back', async () => {
    const m = await load()
    m.portalLocale.value = 'en'
    m.setState('ts_user_language', 'es')
    m.markLanguageChosenByPlayer()
    m.resolveActiveLocale('es', 'en')

    m.portalLocale.value = 'ja'
    m.resolveActiveLocale('es', 'en')

    expect(m.hasExplicitLanguageChoice()).toBe(false)
    expect(m.getState('ts_user_language')).toBeUndefined()
  })

  it('lets the portal beat a stored value that carries no provenance flag', async () => {
    const m = await load()
    // Exactly the shape an older build left behind: the portal's own answer
    // written into the player-choice key, with nothing marking it as a choice.
    m.setState('ts_user_language', 'es')
    m.portalLocale.value = 'de'

    expect(m.hasExplicitLanguageChoice()).toBe(false)
    expect(m.resolveActiveLocale('es', 'en')).toBe('de')
  })

  it('honours an unflagged stored value when no portal has answered', async () => {
    const m = await load()
    // A plain web build, or a bridge that never came up. With nothing to
    // outrank it, a legacy row is still the best hint available.
    expect(m.resolveActiveLocale('es', 'en')).toBe('es')
  })

  it('ignores a stored language the game does not ship', async () => {
    const m = await load()
    expect(m.resolveActiveLocale('xx', 'en')).toBe('en')
  })
})

describe('provenance', () => {
  it('is stamped by the settings setter and nothing else', async () => {
    vi.resetModules()
    localStorage.clear()
    const portal = await import('@/use/usePortalLocale')
    portal.__resetPortalLocale()
    const state = await import('@/use/useTowerState')

    expect(portal.hasExplicitLanguageChoice()).toBe(false)

    const { default: useUser } = await import('@/use/useUser')
    useUser().setSettingValue('language', 'fr')

    expect(state.getState('ts_user_language')).toBe('fr')
    expect(portal.hasExplicitLanguageChoice()).toBe(true)
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * ─── The first-gesture gate ─────────────────────────────────────────────────
 *
 * Two very different things hang off this one edge, which is exactly why it is
 * one module and not two watches:
 *
 *   * Poki rejects a build that reports `gameplayStart()` before the player
 *     has touched the page (`pokiPlugin`), and
 *   * the opening wave's three-second countdown starts here (`useTowerGame`).
 *
 * The awkward parts are all below: a synthetic event is not a player, the
 * battlefield swallows bubbling pointer events, and a tap during the splash
 * must not cost the player a second one.
 */

const load = async () => {
  vi.resetModules()
  return import('@/use/useFirstInteraction')
}

/**
 * A NOTE ON `isTrusted`.
 *
 * The gate ignores any event whose `isTrusted` is false, and jsdom cannot
 * forge one: `dispatchEvent` sets the flag to false on the way through, which
 * is precisely the unforgeability the guard leans on. So the specs below open
 * the gate through `noteUserInteraction` — the same door the gesture listener
 * uses — and pin the refusal side, which jsdom CAN express. The listener's own
 * wiring (capture phase, on `window`, past the battlefield's
 * `stopPropagation`) is only provable in a real browser.
 */

afterEach(() => {
  delete (navigator as { userActivation?: unknown }).userActivation
})

describe('first interaction', () => {
  it('is not "awaiting" anything until something arms it', async () => {
    const gate = await load()
    // The property the domain layer leans on: an unarmed environment — the
    // test suite, the balance harness — has no player to wait for, so the
    // simulation there behaves exactly as it did before the gate existed.
    expect(gate.awaitingFirstInteraction.value).toBe(false)

    gate.armFirstInteraction()
    expect(gate.awaitingFirstInteraction.value).toBe(true)
  })

  it('opens on the first gesture and stays open', async () => {
    const gate = await load()
    gate.armFirstInteraction()

    gate.noteUserInteraction()
    expect(gate.hasUserInteracted.value).toBe(true)
    expect(gate.awaitingFirstInteraction.value).toBe(false)
  })

  it('ignores a synthetic event', async () => {
    const gate = await load()
    gate.armFirstInteraction()

    // `dispatchEvent` leaves `isTrusted` false, which is the whole test: a
    // script cannot claim a player was there.
    window.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(gate.hasUserInteracted.value).toBe(false)
  })

  it('counts a tap that landed before it was armed', async () => {
    const gate = await load()
    // Sticky for the life of the document, so it catches the gesture our own
    // listeners were too late for — a tap on the splash. Asking for a second
    // one is the friction this exists to avoid.
    Object.defineProperty(navigator, 'userActivation', {
      value: { hasBeenActive: true, isActive: true },
      configurable: true
    })

    gate.armFirstInteraction()
    expect(gate.hasUserInteracted.value).toBe(true)
  })

  it('runs a waiting callback once, and runs a late one immediately', async () => {
    const gate = await load()
    gate.armFirstInteraction()

    let early = 0
    const fn = (): void => { early++ }
    // Registered twice — a caller that re-arms on every bracket it opens (which
    // `pokiPlugin` does) must not queue the same handler twice.
    gate.onFirstInteraction(fn)
    gate.onFirstInteraction(fn)
    gate.noteUserInteraction()
    expect(early).toBe(1)

    let late = 0
    gate.onFirstInteraction(() => { late++ })
    expect(late).toBe(1)
  })
})

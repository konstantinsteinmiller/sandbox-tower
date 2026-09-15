import { describe, expect, it } from 'vitest'
import {
  activeControlHint, CONTROL_HINT_RETIRE_WAVE,
  type ControlHintState, type HintId
} from '@/components/game/ControlHint.vue'

/**
 * ─── The control primers, and when they stop ────────────────────────────────
 *
 * Seven one-line hints that teach the desktop board's non-obvious gestures.
 * They are the first copy a new player reads and the first copy a competent
 * player resents, so the only thing that matters about them is that they GO.
 *
 * Two failures are pinned here, and the second one shipped:
 *
 *   1. No primer may outlive the second wave. That used to be an emergent
 *      consequence of `ts_onboarded` — a persisted flag whose real job is the
 *      second-wave build nudge — so "the hints have retired" depended on a
 *      watcher writing a save field for an unrelated feature. It is now a
 *      clause of its own (`CONTROL_HINT_RETIRE_WAVE`), and this file is what
 *      stops a future edit to `onboarded` quietly bringing them back.
 *
 *   2. `inspect` — "Click a block to inspect it" — had NO retirement path at
 *      all. Every other primer is marked done by the handler for the gesture
 *      it teaches; `markHintDone('inspect')` existed nowhere in the project.
 *      So a player who clicked a block to inspect it was told to click a block
 *      to inspect it for the rest of the wave. That is the reported bug, and
 *      the last two cases below are the tripwire for it.
 *
 * The rule is a pure function in `ControlHint.vue` rather than a computed in
 * `GameScene`, for the same reason `useTutorialClock.holdsBuildClock` is: a
 * computed inside that scene is unmountable in a headless run and therefore
 * untestable, which is how the build-clock freeze shipped.
 */

/** A first-time player mid-run, with nothing covering the screen. */
const at = (over: Partial<ControlHintState> = {}): ControlHintState => ({
  done: new Set<HintId>(),
  onboarded: false,
  wave: 1,
  busy: false,
  defeated: false,
  armed: false,
  building: true,
  blocks: 4,
  ...over
})

/** Every primer the desktop board can emit, whatever the board state. */
const DESKTOP_HINTS: readonly HintId[] = [
  'selectBlock', 'placeBlock', 'callWave', 'camera', 'inspect'
]

/**
 * Sweep every board the rule can be asked about at `wave`, and collect what it
 * would show. Used for the "nothing survives wave 2" claims, where the point is
 * that NO combination produces a hint — not that one particular one does not.
 */
const everythingShownAt = (wave: number): Set<HintId | null> => {
  const out = new Set<HintId | null>()
  for (const armed of [false, true]) {
    for (const building of [false, true]) {
      for (const blocks of [0, 1, 4]) {
        for (const done of [new Set<HintId>(), new Set<HintId>(['camera'])]) {
          out.add(activeControlHint(at({ wave, armed, building, blocks, done })))
        }
      }
    }
  }
  return out
}

describe('the primers retire for good once the second wave is cleared', () => {
  it('shows nothing at all once wave 2 is behind the player, on any board', () => {
    // The user-facing promise, and the edge is "wave 2 CLEARED" rather than
    // "wave 2 started". `wave` holds the wave in progress and `building` says
    // the fight is over, so the retirement edge is the build phase that opens
    // on the far side of wave 2 — see `onboardingDone`.
    for (const wave of [3, 7, 40]) {
      expect(everythingShownAt(wave), `wave ${wave}`).toEqual(new Set([null]))
    }
    for (const armed of [false, true]) {
      for (const blocks of [0, 1, 4]) {
        expect(activeControlHint(
          at({ wave: CONTROL_HINT_RETIRE_WAVE, building: true, armed, blocks })
        )).toBe(null)
      }
    }
  })

  it('lets them live through the second FIGHT, and not past it', () => {
    // The off-by-one, pinned in both directions. It used to retire a wave early
    // — while its own prose said "after the second wave" — and that one wave
    // matters: `inspect` points at the screen where run gold is spent, and with
    // the build window before wave 2 cut to 5 s its whole remaining life is
    // this fight and the window after it.
    expect(activeControlHint(
      at({ wave: CONTROL_HINT_RETIRE_WAVE, building: false })
    )).not.toBe(null)
    expect(activeControlHint(
      at({ wave: CONTROL_HINT_RETIRE_WAVE, building: true })
    )).toBe(null)
    // Never the other way round: a LATER wave is over whatever the phase says.
    expect(activeControlHint(
      at({ wave: CONTROL_HINT_RETIRE_WAVE + 1, building: false })
    )).toBe(null)
  })

  it('does not depend on ts_onboarded to do it', () => {
    // The whole reason the clause exists. `onboarded` is persisted, is written
    // by a watcher, and is read by an unrelated feature; if it is ever false
    // here — a cloud hydrate that has not landed, a refactor that moves the
    // watcher — the primers must still be gone.
    expect(activeControlHint(at({ wave: 2, building: true, onboarded: false }))).toBe(null)
    expect(activeControlHint(at({ wave: 5, onboarded: false, blocks: 9 }))).toBe(null)
  })

  it('still shows them on the waves they are FOR', () => {
    // The fix is a retirement, not a deletion. A primer that never appears is
    // the bug this hint spent months in — written, translated into 21 locales,
    // and never once emitted.
    expect(activeControlHint(at({ wave: 0 }))).not.toBe(null)
    expect(activeControlHint(at({ wave: 1 }))).not.toBe(null)
    expect(activeControlHint(at({ wave: CONTROL_HINT_RETIRE_WAVE - 1 }))).not.toBe(null)
  })

  it('retires on the wave AFTER the last one it may show on', () => {
    // Pins the off-by-one, which is the only interesting thing about the
    // constant: 2 means "wave 1 is the last wave a primer may appear on".
    const lastShown = activeControlHint(at({ wave: CONTROL_HINT_RETIRE_WAVE - 1 }))
    const firstSilent = activeControlHint(at({ wave: CONTROL_HINT_RETIRE_WAVE }))
    expect(lastShown).not.toBe(null)
    expect(firstSilent).toBe(null)
  })
})

describe('a returning player is never onboarded twice', () => {
  it('shows nothing on any wave once ts_onboarded is set', () => {
    for (const wave of [0, 1, 2]) {
      expect(activeControlHint(at({ wave, onboarded: true })), `wave ${wave}`).toBe(null)
    }
  })
})

describe('the inspect primer takes yes for an answer', () => {
  it('appears once the player has a tower worth inspecting', () => {
    // It waits for wave 1 and for a second block: on the opening board there is
    // nothing standing that has stats worth reading, and the inspector is where
    // run gold is spent.
    const board = at({ done: new Set<HintId>(['selectBlock', 'placeBlock', 'camera']) })
    expect(activeControlHint(board)).toBe('inspect')
  })

  it('is gone the moment the player opens the inspector', () => {
    // The reported bug. `done` gains `inspect` when `inspected` becomes
    // non-null — see the watcher in `GameScene`, pinned as source below —
    // and from then on the hint must never come back.
    const done = new Set<HintId>(['selectBlock', 'placeBlock', 'camera'])
    expect(activeControlHint(at({ done }))).toBe('inspect')
    done.add('inspect')
    expect(activeControlHint(at({ done }))).toBe(null)
  })

  it('waits for something to point at', () => {
    // A primer telling the player to click a block, on a board with one block,
    // is an instruction about the Gate — which has no stats to read and cannot
    // be ranked.
    // Every OTHER primer marked done, so `inspect` is the only candidate left
    // and a null answer can only mean it declined.
    const done = new Set<HintId>(['selectBlock', 'placeBlock', 'camera', 'callWave'])
    expect(activeControlHint(at({ done, blocks: 1 }))).toBe(null)
    // …and not before the first wave has been fought, where the only thing
    // standing is the scripted fort the player did not build.
    expect(activeControlHint(at({ done, wave: 0 }))).toBe(null)
  })
})

describe('nothing talks over something that owns the screen', () => {
  it('goes quiet behind a result screen, a modal or a coach mark', () => {
    // `busy` is all three: a hint bubble over a deliberately wordless coach
    // mark is the one thing that would put copy back on it.
    expect(activeControlHint(at({ busy: true }))).toBe(null)
    expect(activeControlHint(at({ wave: 0, busy: true }))).toBe(null)
  })

  it('goes quiet on a lost run', () => {
    expect(activeControlHint(at({ defeated: true }))).toBe(null)
  })
})

describe('every primer has a way to retire', () => {
  it('leaves nothing showing once all of them are done', () => {
    // The guarantee that broke: a primer with no `markHintDone` call site can
    // only be retired by the wave clause, so it nags for a whole wave. If a new
    // `HintId` is added without a retirement, this fails.
    const done = new Set<HintId>(DESKTOP_HINTS)
    for (const wave of [0, 1]) {
      for (const armed of [false, true]) {
        expect(activeControlHint(at({ wave, armed, done })), `wave ${wave}`).toBe(null)
      }
    }
  })

  it('wires the inspect retirement in the scene', async () => {
    // The half a pure function cannot cover: SOMETHING has to put `inspect`
    // into `done`. `markHintDone('inspect')` had no call site in the whole
    // project, which is why the hint would not go away — so the wiring is
    // asserted as source, the way `buildClockNeverFreezes` pins the scripted
    // hand's start.
    const source = await import('node:fs').then((fs) =>
      fs.readFileSync('src/views/GameScene.vue', 'utf8'))
    expect(source).toContain("watch(inspected, (block) => { if (block) markHintDone('inspect') })")
  })
})

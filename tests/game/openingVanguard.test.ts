import { describe, expect, it, vi } from 'vitest'

/**
 * ─── The opening vanguard ───────────────────────────────────────────────────
 *
 * Monsters standing on the field before the first wave is called, dormant, so
 * a first-time player's opening frame has a siege in it rather than an empty
 * lawn — and so the fight starts at conversational range instead of at the far
 * edge of the screen where the starter cannon was quietly winning it off
 * camera.
 *
 * Three claims carry the feature, and each of them is a thing that breaks
 * silently:
 *
 *   1. they are VISIBLE and they STAY (nothing shoots them, nothing moves
 *      them) for as long as the player is being taught;
 *   2. calling the wave wakes them, and the wave then counts them — a "3 left"
 *      over nine monsters is the readout lying about the fight on screen;
 *   3. wave 1 is still the wave a first-session player is guaranteed to
 *      survive. That promise is what the whole scripted opening is built on,
 *      and the vanguard is the single biggest thing ever added to the wave.
 */

const loadGame = async () => {
  vi.resetModules()
  localStorage.clear()
  return import('@/use/useTowerGame')
}

/**
 * The opening as a first-session player actually meets it.
 *
 * `view` is the camera span the scene pushes in before seeding (see
 * `setViewSpan`); a desktop frames roughly ±10 cells on wave 1. Passing it is
 * not decoration — without a frame the vanguard falls back to "just out of
 * reach", which is FURTHER out than the director's own walk-on margin, and a
 * test written against that geometry is testing a screen nobody has.
 */
const openFirstSession = async (view: number | null = 10) => {
  const g = await loadGame()
  g.startRun()
  g.seedScriptedOpening()
  if (view !== null) g.setViewSpan(-view, view)
  g.seedOpeningVanguard()
  // The tutorial holds the opening countdown while its coach marks run; every
  // test that steps through a build phase needs the same hold, or the wave
  // starts itself three seconds in and the field it was inspecting is gone.
  g.buildClockHeld.value = true
  return g
}

/** Run the current wave to its end. Returns false if the run died. */
const playWave = (g: any): boolean => {
  g.buildClockHeld.value = false
  g.callWave()
  for (let t = 0; t < 200_000; t += 16) {
    g.step(16)
    if (g.phase.value === 'defeat') return false
    if (g.phase.value === 'build' && t > 1_000) return true
  }
  return g.phase.value !== 'defeat'
}

describe('standing the vanguard', () => {
  it('puts two grumplings on each flank and one flyer behind the right pair', async () => {
    const g = await openFirstSession()
    const field = g.getEnemies()

    expect(field).toHaveLength(5)
    expect(field.filter((e) => e.typeId === 'grunt')).toHaveLength(4)

    const left = field.filter((e) => e.x < 0)
    const right = field.filter((e) => e.x > 0)
    expect(left.map((e) => e.typeId).sort()).toEqual(['grunt', 'grunt'])
    expect(right.map((e) => e.typeId).sort()).toEqual(['bat', 'grunt', 'grunt'])

    // The flyer is the outermost thing on its side, and it is in the air.
    const bat = field.find((e) => e.typeId === 'bat')!
    expect(bat.x).toBeGreaterThan(Math.max(...right.filter((e) => e !== bat).map((e) => e.x)))
    expect(bat.y).toBeGreaterThan(2)
  })

  it('stands them outside the reach of every gun when the frame has room', async () => {
    // A wide monitor: the whole formation clears the starter cannon's 8.5
    // cells and still fits on screen, which is the shape the design asks for.
    const g = await openFirstSession(14)
    const reach = g.bestWeaponReach()
    expect(reach).toBeGreaterThan(0)
    for (const e of g.getEnemies()) expect(Math.abs(e.x)).toBeGreaterThan(reach)
  })

  it('keeps the whole formation on screen, at every frame width', async () => {
    // Two laptops and a wide monitor. Off-screen is the one outcome that makes
    // the feature pointless, so it is pinned across the range rather than at
    // one convenient width.
    for (const half of [7, 8.5, 10, 14]) {
      const g = await openFirstSession(half)
      const field = g.getEnemies()
      expect(field).toHaveLength(5)
      for (const e of field) {
        expect(Math.abs(e.x)).toBeLessThan(half)
        // ...and never standing on the tower either.
        expect(Math.abs(e.x)).toBeGreaterThan(4)
      }
    }
  })

  it('compresses the formation rather than shoving its front rank onto the wall',
    async () => {
      const tight = await openFirstSession(7)
      const wide = await openFirstSession(14)
      const depthOf = (g: any): number => {
        const right = g.getEnemies().filter((e) => e.x > 0).map((e) => e.x)
        return Math.max(...right) - Math.min(...right)
      }
      // The tight frame squeezes the ranks together; it does not answer by
      // parking four monsters against the Gate.
      expect(depthOf(tight)).toBeLessThan(depthOf(wide))
      expect(Math.min(...tight.getEnemies().map((e) => Math.abs(e.x)))).toBeGreaterThan(4)
    })

  it('refuses anything but an untouched opening build phase', async () => {
    const g = await openFirstSession()
    // A second call would double the field.
    expect(g.seedOpeningVanguard()).toBe(false)
    expect(g.getEnemies()).toHaveLength(5)

    g.callWave()
    // Mid-wave it would drop monsters into a fight in progress.
    expect(g.seedOpeningVanguard()).toBe(false)
  })

  it('is never seeded into a wave the player has already reached', async () => {
    const g = await loadGame()
    g.startRun()
    g.seedScriptedOpening()
    expect(playWave(g)).toBe(true)
    expect(g.wave.value).toBe(1)
    expect(g.seedOpeningVanguard()).toBe(false)
  })
})

describe('while the player is being taught', () => {
  it('does not move and cannot be shot', async () => {
    const g = await openFirstSession()
    const before = g.getEnemies().map((e) => ({ x: e.x, y: e.y, hp: e.hp }))

    // Twenty seconds of build phase — longer than any tutorial takes, and long
    // enough for the starter cannon to have fired a dozen times.
    for (let t = 0; t < 20_000; t += 16) g.step(16)

    const after = g.getEnemies().map((e) => ({ x: e.x, y: e.y, hp: e.hp }))
    expect(after).toEqual(before)
    expect(after).toHaveLength(5)
  })

  it('keeps the flyer flapping, and parks the walkers on their standing frame',
    async () => {
      const g = await openFirstSession()
      const bat = g.getEnemies().find((e) => e.typeId === 'bat')!
      const walker = g.getEnemies().find((e) => e.typeId === 'grunt')!
      // `phase` is the clock the monster's own frame is picked from. Zero is
      // legs-together; a random one parks a waiting grumpling mid-stride.
      expect(walker.phase).toBe(0)
      const flap = bat.phase
      const perch = { x: bat.x, y: bat.y }

      for (let t = 0; t < 2_000; t += 16) g.step(16)

      // A bat hanging in the air with its wings stopped reads as a hung game.
      expect(bat.phase).toBeGreaterThan(flap)
      expect(walker.phase).toBe(0)
      // Animating, not flying: the wings move and the unit does not.
      expect({ x: bat.x, y: bat.y }).toEqual(perch)
      expect(walker.hp).toBe(walker.maxHp)
    })

  it('never damages the tower while it waits', async () => {
    const g = await openFirstSession()
    const hp = g.gateHpPct.value
    for (let t = 0; t < 20_000; t += 16) g.step(16)
    expect(g.gateHpPct.value).toBe(hp)
    expect(g.getBlocks().size).toBe(4)
  })

  it('holds even when the player builds a gun that reaches them', async () => {
    const g = await openFirstSession()
    const at = Math.abs(g.getEnemies()[0]!.x)

    // A second cannon on the flank — its muzzle is two cells further out than
    // the fort's, so arithmetic alone would put the vanguard under fire.
    g.offers.value = ['cannon1', 'cannon1', ...g.offers.value.slice(2)]
    expect(g.placeShape(0, 2, 0, 0)).toBe(true)
    expect(g.bestWeaponReach() + 2).toBeGreaterThan(at)

    for (let t = 0; t < 20_000; t += 16) g.step(16)
    expect(g.getEnemies().every((e) => e.hp === e.maxHp)).toBe(true)
  })
})

describe('calling the wave', () => {
  it('wakes them and folds them into the wave the HUD counts', async () => {
    const g = await openFirstSession()
    g.callWave()
    expect(g.getEnemies().every((e) => !e.dormant)).toBe(true)
    expect(g.enemiesLeft.value).toBe(g.enemiesTotal.value)

    // Exactly five more than the same wave without a vanguard: the bar has to
    // drain over everything the player has to kill, not over the director's
    // share of it. Compared against a second run rather than a re-derived plan,
    // because the wave is priced against the tower and both runs have the same
    // one standing.
    const plain = await loadGame()
    plain.startRun()
    plain.seedScriptedOpening()
    plain.callWave()
    expect(g.enemiesTotal.value).toBe(plain.enemiesTotal.value + 5)
  })

  it('sends the director\'s own wave in from the edges behind them', async () => {
    const g = await openFirstSession()
    const at = Math.max(...g.getEnemies().map((e) => Math.abs(e.x)))
    g.callWave()

    // Two seconds in, the vanguard has closed and the wave is walking on from
    // outside the frame — further out than the vanguard ever stood.
    for (let t = 0; t < 2_000; t += 16) g.step(16)
    const field = g.getEnemies()
    expect(field.length).toBeGreaterThan(5)
    expect(Math.max(...field.map((e) => Math.abs(e.x)))).toBeGreaterThan(at)
  })

  it('closes them on the tower rather than leaving them parked', async () => {
    const g = await openFirstSession()
    // By uid: three seconds in, the director's own wave is also on the field,
    // walking on from outside the frame, and "everything is nearer than it
    // was" is not true of those.
    const start = new Map<number, number>(
      g.getEnemies().map((e) => [e.uid, Math.abs(e.x)])
    )
    g.callWave()
    for (let t = 0; t < 3_000; t += 16) g.step(16)

    let moved = 0
    for (const e of g.getEnemies()) {
      const was = start.get(e.uid)
      if (was === undefined || e.dying > 0) continue
      expect(Math.abs(e.x)).toBeLessThan(was)
      moved++
    }
    // Some of them are meant to have died on the way in, but not all of them —
    // a vanguard that evaporates before it arrives is the old wave 1.
    expect(moved).toBeGreaterThan(0)
  })

  it('pays the wave\'s materials over every kill, vanguard included', async () => {
    const g = await openFirstSession()
    g.buildClockHeld.value = false
    g.callWave()
    const total = g.enemiesTotal.value
    // Sampled on the last battle frame: `completeWave` settles the remainder
    // and drops the split, so reading it afterwards reads a null.
    let paid = g.killSharePaid()
    for (let t = 0; t < 200_000 && g.phase.value === 'battle'; t += 16) {
      g.step(16)
      if (g.phase.value === 'battle') paid = g.killSharePaid()
    }
    // Every monster on the field paid a cut — the split is over the whole
    // wave, so the last one to die is not dropping nothing.
    expect(paid.kills).toBe(total)
    expect(paid.wood).toBeGreaterThan(0)
  })
})

describe('the guaranteed opening win survives it', () => {
  it('a first-session player who only calls the wave still lives', async () => {
    const g = await openFirstSession()
    expect(playWave(g)).toBe(true)
    expect(g.wave.value).toBe(1)
    // The whole scripted opening rests on this: wave 1 is the wave that TEACHES
    // rather than the wave that wipes. A Gate below half is a player who has
    // learned they are losing.
    expect(g.gateHpPct.value).toBeGreaterThan(0.5)
  })

  it('a player who takes the tutorial\'s own merge comes out comfortably ahead',
    async () => {
      const g = await openFirstSession()
      // The coach marks' one placement: a cannon on the fort's shoulder, which
      // fuses with the fort's own into a tier 2.
      g.offers.value = ['cannon1', 'cannon1', ...g.offers.value.slice(2)]
      expect(g.placeShape(1, -1, 1, 0)).toBe(true)

      expect(playWave(g)).toBe(true)
      expect(g.gateHpPct.value).toBeGreaterThan(0.8)
    })

  it('clears the field — the wave cannot end with a vanguard unit still alive',
    async () => {
      const g = await openFirstSession()
      expect(playWave(g)).toBe(true)
      expect(g.getEnemies()).toHaveLength(0)
    })

  it('hands the vanguard baseline monsters, not the last run\'s scaling',
    async () => {
      const g = await openFirstSession()
      const { ENEMY_DEFS } = await import('@/game/enemies')
      // A wave-20 grumpling in front of a first-time player would be the same
      // bug as a wave-20 wave: `waveHpMul` is reset with the rest of the run.
      for (const e of g.getEnemies()) {
        expect(e.maxHp).toBe(ENEMY_DEFS[e.typeId]!.hp)
      }
    })

  it('resets that scaling even after a hard run', async () => {
    const g = await openFirstSession()
    g.debugSetWave(20)
    g.callWave()
    for (let t = 0; t < 3_000; t += 16) g.step(16)

    g.startRun()
    g.seedScriptedOpening()
    g.seedOpeningVanguard()
    const { ENEMY_DEFS } = await import('@/game/enemies')
    for (const e of g.getEnemies()) expect(e.maxHp).toBe(ENEMY_DEFS[e.typeId]!.hp)
  })
})

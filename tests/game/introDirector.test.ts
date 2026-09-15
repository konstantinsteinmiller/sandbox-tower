import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * ─── The opening cutscene, against the real simulation ─────────────────────
 *
 * `introCutscene.test.ts` pins the storyboard. This pins the part that can
 * actually damage a player's game: the cutscene borrows the live enemy array to
 * stand seventy monsters in, and everything about it being an introduction
 * rather than a wave is in the guarantees below.
 *
 * Each of these is a bug that would ship silently:
 *
 *   · the cast counted as a wave — a "70 left" bar, seventy kills' worth of
 *     materials, and an opening the player cannot survive;
 *   · the cast left standing — `callWave` adopts it and wave 1 arrives with
 *     seventy free monsters walking at a three-block fort;
 *   · the build clock running underneath — this board's opening window is
 *     three seconds on desktop and ZERO on the phone, so wave 1 would be
 *     called somewhere over the third rank;
 *   · the tower shot at, or the cast shot at, while the camera is away;
 *   · the save flag written on completion rather than on the first frame, so a
 *     player who closed the tab during it meets it again;
 *   · a resumed run hijacked — the camera flying off to look at scenery while
 *     wave 7 walks in.
 */

const load = async () => {
  vi.resetModules()
  localStorage.clear()
  const game = await import('@/use/useTowerGame')
  const camera = await import('@/use/useTowerCamera')
  const intro = await import('@/use/useIntroCutscene')
  const board = await import('@/game/introCutscene')
  intro.__resetIntroForTests()
  return { game, camera, intro, board }
}

/** A desktop opening: a fresh run with the scripted fort standing on it. */
const openFirstSession = async () => {
  const mods = await load()
  mods.game.startRun()
  mods.game.seedScriptedOpening(true)
  mods.camera.setViewport(1600, 900, 60, 180)
  mods.camera.snapToFit()
  return mods
}

/** Run the cutscene from wherever it is to its end, a frame at a time. */
const playOut = (intro: Awaited<ReturnType<typeof load>>['intro'], game: any): void => {
  for (let i = 0; i < 2000 && intro.introActive.value; i++) {
    game.step(16)
    intro.stepIntro(16, 1600, 900)
  }
}

beforeEach(() => { localStorage.clear() })

describe('whether it plays at all', () => {
  it('plays for a player who has never been introduced', async () => {
    const { intro } = await openFirstSession()
    expect(intro.shouldPlayIntro()).toBe(true)
  })

  it('never plays twice on one save', async () => {
    const { intro, game } = await openFirstSession()
    intro.playIntro()
    playOut(intro, game)
    expect(intro.introSeen()).toBe(true)
    expect(intro.shouldPlayIntro()).toBe(false)
  })

  it('marks the save on the FIRST frame, not on the last', async () => {
    // A player who closed the tab ten seconds into an introduction is the last
    // person who should be shown it again.
    const { intro } = await openFirstSession()
    intro.playIntro()
    expect(intro.introActive.value).toBe(true)
    expect(intro.introSeen()).toBe(true)
  })

  it('refuses a resumed run', async () => {
    const { game, intro } = await openFirstSession()
    // Any board that is not an untouched opening. Flying the camera seventy
    // cells west while a wave walks in is not a cutscene, it is a hijack.
    game.debugSetWave(7)
    expect(game.wave.value).toBeGreaterThan(0)
    expect(intro.shouldPlayIntro()).toBe(false)
  })

  it('refuses mid-battle', async () => {
    const { game, intro } = await openFirstSession()
    game.callWave()
    expect(game.phase.value).toBe('battle')
    expect(intro.shouldPlayIntro()).toBe(false)
  })
})

describe('the cast it stands on the field', () => {
  it('is dormant, undamaged, and not part of any wave', async () => {
    const { game, intro, board } = await openFirstSession()
    const before = game.getEnemies().length
    intro.playIntro()

    const cast = game.getEnemies().filter((e: any) => e.cameo)
    expect(cast.length).toBe(board.buildIntroCast(board.DESKTOP_TABLEAU).length)
    expect(game.getEnemies().length).toBe(before + cast.length)

    for (const e of cast) {
      expect(e.dormant).toBe(true)
      // A health bar only draws on a damaged unit, so full HP is what keeps the
      // tableau clear of HUD furniture.
      expect(e.hp).toBe(e.maxHp)
      // Base HP, never the last run's wave scaling.
      const { ENEMY_DEFS } = await import('@/game/enemies')
      expect(e.maxHp).toBe(ENEMY_DEFS[e.typeId]!.hp)
      // Facing the tower it is walking at.
      expect(e.dir).toBe(1)
    }

    // The readout must not move. A counter that said "70" for ten seconds and
    // then "8" is the one thing a player would remember about the cutscene.
    expect(game.enemiesLeft.value).toBe(0)
    expect(game.enemiesTotal.value).toBe(0)
  })

  it('stands west of the tower, spread over the ground the wave comes over', async () => {
    const { game, intro } = await openFirstSession()
    intro.playIntro()
    const xs = game.getEnemies().filter((e: any) => e.cameo).map((e: any) => e.x)
    expect(Math.max(...xs)).toBeLessThan(-9)
    expect(Math.min(...xs)).toBeLessThan(-70)
  })

  it('cannot be shot, and cannot touch the tower', async () => {
    const { game, intro } = await openFirstSession()
    intro.playIntro()
    const gate = game.gateHpPct.value
    const cells = game.getBlocks().size
    const posed = game.getEnemies()
      .filter((e: any) => e.cameo)
      .map((e: any) => ({ x: e.x, y: e.y, hp: e.hp }))

    // Twenty seconds — twice the cutscene's length, and long enough for the
    // fort's cannon to have fired twenty times.
    for (let t = 0; t < 20_000; t += 16) game.step(16)

    expect(game.getEnemies().filter((e: any) => e.cameo)
      .map((e: any) => ({ x: e.x, y: e.y, hp: e.hp }))).toEqual(posed)
    expect(game.gateHpPct.value).toBe(gate)
    expect(game.getBlocks().size).toBe(cells)
  })

  it('keeps the flyers flapping and the walkers frozen mid-stride', async () => {
    const { game, intro } = await openFirstSession()
    intro.playIntro()
    const { enemyDef } = await import('@/game/enemies')
    const cast = game.getEnemies().filter((e: any) => e.cameo)
    const flyer = cast.find((e: any) => enemyDef(e.typeId).movement === 'air')!
    const walker = cast.find((e: any) => enemyDef(e.typeId).movement === 'ground')!
    const flap = flyer.phase
    const pose = walker.phase

    for (let t = 0; t < 2_000; t += 16) game.step(16)

    // A bat hanging in the air with its wings stopped reads as a hung game.
    expect(flyer.phase).toBeGreaterThan(flap)
    // A walker frozen on its own frame of the cycle is a photograph of a march.
    expect(walker.phase).toBe(pose)
  })
})

describe('the build clock', () => {
  it('is held for the whole cutscene and released at the end', async () => {
    const { game, intro } = await openFirstSession()
    intro.playIntro()
    expect(game.buildClockHeld.value).toBe(true)

    // Long enough that every opening window in the game — three seconds on
    // desktop, zero on the phone board — would have elapsed several times.
    for (let t = 0; t < 12_000; t += 16) game.step(16)
    expect(game.wave.value).toBe(0)
    expect(game.phase.value).toBe('build')

    playOut(intro, game)
    expect(game.buildClockHeld.value).toBe(false)
  })
})

describe('striking the set', () => {
  it('clears the field, hands the camera back and reports done', async () => {
    const { game, intro, camera } = await openFirstSession()
    let done = 0
    intro.playIntro({ onDone: () => { done++ } })
    expect(camera.isCinematic.value).toBe(true)

    playOut(intro, game)

    expect(done).toBe(1)
    expect(intro.introActive.value).toBe(false)
    expect(camera.isCinematic.value).toBe(false)
    expect(game.getEnemies().filter((e: any) => e.cameo)).toHaveLength(0)
  })

  it('flies home on a skip rather than cutting', async () => {
    const { game, intro, board } = await openFirstSession()
    intro.playIntro()
    intro.stepIntro(16, 1600, 900)

    intro.skipIntro()
    // Still running, and still on the far side of the world: the whip has yet
    // to play. A skip that ended the cutscene outright would be a screen change
    // rather than a return.
    expect(intro.introActive.value).toBe(true)
    expect(intro.introClock.value).toBe(board.introSkipMs())

    playOut(intro, game)
    expect(intro.introActive.value).toBe(false)
    expect(game.getEnemies().filter((e: any) => e.cameo)).toHaveLength(0)
  })

  it('strikes the set on an unmount mid-flight, without running the scene work', async () => {
    const { game, intro, camera } = await openFirstSession()
    let done = 0
    intro.playIntro({ onDone: () => { done++ } })
    for (let i = 0; i < 40; i++) intro.stepIntro(16, 1600, 900)

    intro.stopIntro()
    expect(intro.introActive.value).toBe(false)
    expect(camera.isCinematic.value).toBe(false)
    expect(game.getEnemies().filter((e: any) => e.cameo)).toHaveLength(0)
    expect(game.buildClockHeld.value).toBe(false)
    // The scene is going away — framing an opening it will never draw would be
    // work against a dead canvas.
    expect(done).toBe(0)
  })

  it('sweeps a leaked cast rather than letting a wave adopt it', async () => {
    // The last line of defence. Every exit the director has clears its own
    // cast; if one ever fails, the cost is a wave with seventy free monsters in
    // it, walking at a three-block fort.
    const { game, board } = await openFirstSession()
    const cast = board.buildIntroCast(board.DESKTOP_TABLEAU)
      .map((u) => ({ typeId: u.typeId, x: u.x, y: u.y, pose: u.pose }))
    expect(game.spawnCameoCast(cast).length).toBe(cast.length)

    game.callWave()

    expect(game.getEnemies().filter((e: any) => e.cameo)).toHaveLength(0)
    expect(game.enemiesTotal.value).toBeLessThan(30)
    expect(game.enemiesLeft.value).toBe(game.enemiesTotal.value)
  })

  it('refuses to stand a cast on anything but an untouched opening', async () => {
    const { game } = await openFirstSession()
    game.callWave()
    expect(game.spawnCameoCast([{ typeId: 'grunt', x: -20 }])).toEqual([])
  })
})

describe('the camera it hands back', () => {
  it('publishes no spawn span while it is away', async () => {
    // `publishSpan` tells the simulation where off-screen is. During the
    // cutscene that would be seventy cells west of the tower — so a wave called
    // on the frame it ended would walk on from a mile away, and the opening
    // vanguard would be stood somewhere the player is not looking.
    const { game, intro, camera } = await openFirstSession()
    const vanguardBefore = (() => {
      game.seedOpeningVanguard()
      const at = Math.max(...game.getEnemies().map((e: any) => Math.abs(e.x)))
      game.getEnemies().length = 0
      return at
    })()

    intro.playIntro()
    for (let i = 0; i < 300; i++) { game.step(16); intro.stepIntro(16, 1600, 900) }
    // Mid-flight, with the camera far to the west.
    expect(camera.getCenter().x).toBeLessThan(-20)

    playOut(intro, game)
    camera.snapToFit()
    expect(game.seedOpeningVanguard()).toBe(true)
    const at = Math.max(...game.getEnemies().map((e: any) => Math.abs(e.x)))
    expect(at).toBeCloseTo(vanguardBefore, 3)
  })

  it('ignores pan and pinch while it is running', async () => {
    const { intro, camera } = await openFirstSession()
    intro.playIntro()
    intro.stepIntro(16, 1600, 900)
    const before = { ...camera.getCenter(), zoom: camera.getZoom() }

    camera.panBy(200, 120)
    camera.zoomAt(2, 800, 450)

    expect({ ...camera.getCenter(), zoom: camera.getZoom() }).toEqual(before)
    expect(camera.isManual.value).toBe(false)
  })

  it('is not stomped by the phone board re-deriving its own fit', async () => {
    // The phone board re-measures its strip and bottom bar on a one-second
    // cadence and pushes a fresh fixed frame each time (`layoutFrame`). Every
    // one of those lands in `setFixedFrame`, so without the cinematic guard
    // there the cutscene's camera was yanked back to the board once a second,
    // all the way through the flight.
    const { intro, camera } = await openFirstSession()
    camera.setFixedFrame({ cell: 48, x: 0, y: 2 })
    intro.playIntro()
    for (let i = 0; i < 200; i++) intro.stepIntro(16, 412, 915)
    const flying = { ...camera.getCenter(), zoom: camera.getZoom() }
    expect(flying.x).toBeLessThan(-5)

    camera.setFixedFrame({ cell: 48, x: 0, y: 2 })

    expect({ ...camera.getCenter(), zoom: camera.getZoom() }).toEqual(flying)
    // …and the board gets its frame back the moment the cutscene lets go.
    intro.stopIntro()
    camera.setFixedFrame({ cell: 48, x: 0, y: 2 })
    expect(camera.getCenter().x).toBe(0)
    expect(camera.getZoom()).toBe(48)
    camera.clearFixedFrame()
  })

  it('lands on the frame the game itself would choose', async () => {
    const { game, intro, camera } = await openFirstSession()
    const home = camera.homeFrame()
    intro.playIntro()
    playOut(intro, game)
    camera.snapToFit()
    expect(camera.getCenter().x).toBeCloseTo(home.x, 6)
    expect(camera.getZoom()).toBeCloseTo(home.zoom, 6)
  })
})

describe('what the overlay is told', () => {
  it('runs its beats, its cards and its banner in order', async () => {
    const { game, intro } = await openFirstSession()
    intro.playIntro()
    const beats: string[] = []
    const cards: string[] = []
    let bannerFrames = 0
    for (let i = 0; i < 2000 && intro.introActive.value; i++) {
      game.step(16)
      intro.stepIntro(16, 1600, 900)
      if (beats[beats.length - 1] !== intro.introBeat.value) beats.push(intro.introBeat.value)
      const key = intro.introCard.value?.key
      if (key && cards[cards.length - 1] !== key) cards.push(key)
      if (intro.introBanner.value) bannerFrames++
    }
    expect(beats).toEqual(['tower', 'march', 'horde', 'siege', 'whip', 'land'])
    expect(cards).toEqual(['intro.premise', 'intro.horde', 'intro.siege'])
    // Roughly the 2.6 s window the storyboard gives it, at 16 ms a frame.
    expect(bannerFrames).toBeGreaterThan(120)
  })

  it('reports nothing once it is over', async () => {
    const { game, intro } = await openFirstSession()
    intro.playIntro()
    playOut(intro, game)
    expect(intro.introCard.value).toBe(null)
    expect(intro.introBanner.value).toBe(false)
    // …but `introShown` stays true, which is what keeps `IncomingBanner` off
    // the board the cutscene has just said the same line over.
    expect(intro.introShown.value).toBe(true)
  })
})

describe('the closing shot: riders home', () => {
  /**
   * Three knights galloping into the Gate on the last beat — a sortie played
   * backwards, so the player is shown that something leaves this tower before
   * they have been told it can.
   *
   * They go into the live `allies` array, which is what makes them look like
   * the real thing and also what makes them dangerous: an ally the simulation
   * decides to step would ride the OTHER way (`stepAllies` patrols outward
   * when it finds nothing to target), and one left standing would be a forty-
   * gold unit the player never bought.
   */
  it('puts three riders on the field, east of the tower, inert', async () => {
    const { game, intro, board } = await openFirstSession()
    intro.playIntro()
    // Nothing until the siege hold — they are created off camera, mid-preview.
    intro.stepIntro(16, 1600, 900)
    expect(game.getAllies()).toHaveLength(0)

    for (let i = 0; i < 2000 && intro.introClock.value < board.INTRO_RIDERS.spawnAt; i++) {
      game.step(16)
      intro.stepIntro(16, 1600, 900)
    }
    const cast = game.getAllies()
    expect(cast).toHaveLength(board.INTRO_RIDERS.count)
    for (const a of cast) {
      expect(a.cameo).toBe(true)
      expect(a.x).toBeGreaterThan(0)
      expect(a.facing).toBe(-1)
    }
    // Not a unit the player owns: the sortie counter must not move.
    expect(game.allyCount.value).toBe(0)
  })

  it('rides them at the Gate, not out to patrol', async () => {
    // The whole reason for the cameo flag. `stepAllies` with nothing to target
    // walks a rider OUTWARD at half speed — so a cutscene rider the simulation
    // stepped would gallop away from the Gate it is supposed to be arriving at.
    const { game, intro, board } = await openFirstSession()
    intro.playIntro()
    let prev: number[] = []
    let moved = 0
    for (let i = 0; i < 2000 && intro.introActive.value; i++) {
      game.step(16)
      intro.stepIntro(16, 1600, 900)
      if (intro.introClock.value < board.INTRO_RIDERS.runFrom) continue
      const xs = game.getAllies().map((a) => a.x)
      if (prev.length === xs.length && xs.length > 0) {
        for (let k = 0; k < xs.length; k++) {
          expect(xs[k]!).toBeLessThanOrEqual(prev[k]! + 1e-9)
          if (xs[k]! < prev[k]!) moved++
        }
      }
      prev = xs
    }
    expect(moved).toBeGreaterThan(50)
  })

  it('takes them off the field when the cutscene ends', async () => {
    const { game, intro } = await openFirstSession()
    intro.playIntro()
    playOut(intro, game)
    expect(game.getAllies()).toHaveLength(0)
    expect(game.allyCount.value).toBe(0)
  })

  it('takes them off on a skip and on an unmount too', async () => {
    for (const bail of ['skip', 'stop'] as const) {
      const { game, intro } = await openFirstSession()
      intro.playIntro()
      // Far enough in that the riders exist.
      for (let i = 0; i < 700; i++) { game.step(16); intro.stepIntro(16, 1600, 900) }
      expect(game.getAllies().length).toBeGreaterThan(0)

      if (bail === 'stop') intro.stopIntro()
      else {
        // A tap during the closing shot ends it rather than doing nothing.
        intro.skipIntro()
        intro.skipIntro()
        intro.stepIntro(16, 1600, 900)
      }
      expect(game.getAllies(), bail).toHaveLength(0)
    }
  })

  it('never lets a rider survive into a wave', async () => {
    // The last line of defence, the same one the monster cast has: a leaked
    // rider is a free unit, and `stepAllies` skips it, so it would stand on the
    // field for the rest of the run.
    const { game, board } = await openFirstSession()
    expect(game.spawnCameoRiders(
      Array.from({ length: board.INTRO_RIDERS.count }, (_, i) => ({ x: 9 + i }))
    )).toHaveLength(3)
    game.callWave()
    expect(game.getAllies()).toHaveLength(0)
  })

  it('refuses riders on anything but an untouched opening', async () => {
    const { game } = await openFirstSession()
    game.callWave()
    expect(game.spawnCameoRiders([{ x: 9 }])).toEqual([])
  })
})

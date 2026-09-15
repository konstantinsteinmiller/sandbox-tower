import { describe, expect, it } from 'vitest'
import {
  DESKTOP_TABLEAU, DROPMERGE_TABLEAU, INTRO_BANNER, INTRO_BEATS, INTRO_KEYS,
  INTRO_FLEET, INTRO_LAND_HIT_MS, INTRO_MAX_ROWS, INTRO_POSE_CYCLE, INTRO_RIDERS,
  INTRO_SIEGE_HIT_MS, INTRO_ZOOM_MAX, INTRO_ZOOM_MIN, introFleetTypes, introRiderAt,
  buildIntroCast, introBannerAt, introBeatAt, introBeatStart, introCardAt,
  introCastTypes, introDurationMs, introSkipMs, resolveIntroAnchor, sampleIntroCamera,
  type IntroTableau
} from '@/game/introCutscene'
import { ENEMY_DEFS } from '@/game/enemies'
import { DROPMERGE_ROSTER } from '@/mobile-fit/roster'

/**
 * ─── The opening cutscene's storyboard ──────────────────────────────────────
 *
 * Ten seconds of camera over an army of seventy, once per save, on the first
 * frame a player ever sees. It is the hardest thing in the game to check by
 * eye and the easiest to break silently: nudge one span in the shot list and
 * the siege engines the whole sequence builds to are off the side of a phone
 * screen; add a monster to a rank and the phone board promises a unit it never
 * fields.
 *
 * So the claims that carry it are pinned here, on the pure module, with no
 * canvas and no clock:
 *
 *   1. the CAST is real, deterministic, entirely west of the tower, and never
 *      promises a unit the board it is playing on cannot send;
 *   2. the escalation is real — each rank is denser and heavier than the last,
 *      which is the whole of "ever growing amounts";
 *   3. the CAMERA flies west, holds on the peak, and comes home, inside the
 *      zoom range the game itself uses, at every aspect ratio;
 *   4. the peak is actually IN FRAME during the hold — including on a portrait
 *      phone, which sees about a quarter of what a monitor does;
 *   5. a SKIP still flies home rather than cutting.
 */

// Two real viewports, and they are the two that break things: a 16:9 monitor,
// where the shot's own width decides the zoom, and a portrait phone, where the
// height cap does (see `INTRO_MAX_ROWS`).
const DESKTOP = { w: 1600, h: 900 }
const PHONE = { w: 412, h: 915 }
/** Whatever the game's auto-fit produced for the opening board. */
const HOME = { x: 0, y: 3.4, zoom: 62 }

const frameAt = (ms: number, view = DESKTOP) =>
  sampleIntroCamera(ms, HOME, view.w, view.h)

/** Half-width of the framed world at a sampled frame, in cells. */
const halfSpan = (ms: number, view = DESKTOP): number =>
  view.w / 2 / frameAt(ms, view).zoom

describe('the cast', () => {
  it('names only enemies the game actually has', () => {
    for (const tableau of [DESKTOP_TABLEAU, DROPMERGE_TABLEAU]) {
      for (const id of introCastTypes(tableau)) {
        expect(ENEMY_DEFS[id], `unknown enemy "${id}"`).toBeDefined()
      }
    }
  })

  it('never promises the phone board a unit the phone board cannot send', () => {
    // The Drop & Merge roster is ten of the desktop's twenty-one: no siege
    // engines, no slingers, no sea lane. An introduction that showed a
    // trebuchet to a player of that board would be advertising a game they are
    // not about to play — which is a worse outcome than no introduction.
    for (const id of introCastTypes(DROPMERGE_TABLEAU)) {
      expect(DROPMERGE_ROSTER.has(id), `"${id}" is not on the phone roster`).toBe(true)
    }
  })

  it('builds to siege engines on the board that has them', () => {
    const engines = DESKTOP_TABLEAU.placed.filter((p) => !!ENEMY_DEFS[p.typeId]?.siege)
    // The peak of the threat, and the reason the camera goes west at all.
    expect(engines.length).toBeGreaterThanOrEqual(5)
    // …and the one that matters is the heaviest thing in the game's roster.
    expect(engines.map((e) => e.typeId)).toContain('trebuchet')
  })

  it('is deterministic — the same tableau lays out the same way twice', () => {
    // Load-bearing rather than tidy: this is the frame every store screenshot
    // and preview video gets cut from, and a composition that reshuffles on
    // each load cannot be art-directed at all.
    expect(buildIntroCast(DESKTOP_TABLEAU)).toEqual(buildIntroCast(DESKTOP_TABLEAU))
    expect(buildIntroCast(DESKTOP_TABLEAU, 1)).not.toEqual(buildIntroCast(DESKTOP_TABLEAU, 2))
  })

  it('stands entirely west of the tower and never on the board', () => {
    for (const tableau of [DESKTOP_TABLEAU, DROPMERGE_TABLEAU]) {
      for (const u of buildIntroCast(tableau)) {
        // West, and far enough out that the opening shot — which frames the
        // tower — has none of it in view. The army is something the camera
        // GOES to; a grumpling visible over the fort on frame one gives the
        // whole sequence away before it starts.
        expect(u.x).toBeLessThan(-9)
        expect(u.x).toBeGreaterThan(-95)
      }
    }
  })

  it('freezes every unit on its own frame of the walk cycle', () => {
    const cast = buildIntroCast(DESKTOP_TABLEAU)
    for (const u of cast) {
      expect(u.pose).toBeGreaterThanOrEqual(0)
      expect(u.pose).toBeLessThan(INTRO_POSE_CYCLE)
    }
    // A photograph of a charge, not a parade at attention: the poses have to
    // actually differ, or seventy monsters stand in identical mid-stride.
    expect(new Set(cast.map((u) => u.pose.toFixed(3))).size).toBeGreaterThan(cast.length * 0.8)
  })

  it('puts the flyers in the sky and the walkers on the ground line', () => {
    for (const rank of DESKTOP_TABLEAU.ranks) {
      if (!rank.air || !rank.airCount) continue
      const [lo] = rank.sky!
      expect(lo).toBeGreaterThan(2.5)
    }
    // Ground units carry no `y` at all — the director stands them at the def's
    // own height, exactly as `spawnEnemy` does for a walker.
    const ground = buildIntroCast(DESKTOP_TABLEAU).filter((u) => u.y === undefined)
    expect(ground.length).toBeGreaterThan(30)
  })
})

describe('the escalation is real', () => {
  /** Units per cell of ground — the thing the eye reads as "how many". */
  const densityOf = (tableau: IntroTableau, i: number): number => {
    const rank = tableau.ranks[i]!
    const air = rank.airCount ?? 0
    return (rank.count + air) / Math.abs(rank.far - rank.near)
  }

  it('packs each rank tighter than the one before it', () => {
    for (const tableau of [DESKTOP_TABLEAU, DROPMERGE_TABLEAU]) {
      for (let i = 1; i < tableau.ranks.length - 1; i++) {
        expect(densityOf(tableau, i)).toBeGreaterThan(densityOf(tableau, i - 1))
      }
    }
  })

  it('opens on a band sparse enough to read as survivable', () => {
    // Wave one, and it is supposed to look like something the fort can handle.
    // If the first band is already a wall there is nothing for the rest of the
    // flight to escalate from.
    expect(densityOf(DESKTOP_TABLEAU, 0)).toBeLessThan(1.1)
    expect(densityOf(DESKTOP_TABLEAU, DESKTOP_TABLEAU.ranks.length - 2)).toBeGreaterThan(1.4)
  })

  it('gets heavier as well as denser', () => {
    // Density alone could be met with seventy grumplings. `cost` is the wave
    // director's own price for a unit — the game's measure of how dangerous it
    // is — and what the player reads off a band is the WORST thing in it, not
    // its average: a rank with a thornwick in it is a rank with a thornwick in
    // it, however many grumplings are standing around it.
    const worstOf = (tableau: IntroTableau, i: number): number => {
      const rank = tableau.ranks[i]!
      return Math.max(...[...rank.ground, ...(rank.air ?? [])]
        .map((id) => ENEMY_DEFS[id]?.cost ?? 0))
    }
    for (const tableau of [DESKTOP_TABLEAU, DROPMERGE_TABLEAU]) {
      expect(worstOf(tableau, 2)).toBeGreaterThan(worstOf(tableau, 0))
      expect(worstOf(tableau, 3)).toBeGreaterThan(worstOf(tableau, 2))
    }
  })
})

describe('the flight', () => {
  it('opens and closes on the frame the game itself would choose', () => {
    // Neither edge of the cutscene may be a cut. The first frame is the frame
    // the player would have been looking at anyway, and the last is the frame
    // the game hands back a moment later through `snapToFit`.
    expect(frameAt(0)).toEqual(HOME)
    expect(frameAt(introDurationMs())).toEqual(HOME)
  })

  it('travels west and never doubles back', () => {
    const whip = introBeatStart('whip')
    let last = frameAt(0).x
    for (let ms = 0; ms <= whip; ms += 50) {
      const x = frameAt(ms).x
      expect(x).toBeLessThanOrEqual(last + 1e-9)
      last = x
    }
    // …and gets a long way from the tower before it stops.
    expect(last).toBeLessThan(-65)
  })

  it('comes home, fast, at the end', () => {
    const whip = introBeatStart('whip')
    expect(frameAt(whip).x).toBeLessThan(-65)
    expect(frameAt(introDurationMs()).x).toBe(HOME.x)
    // A whip, not a scroll: the MOVE is under half a second. Measured to the
    // landing rather than to the end of the cutscene — those were the same
    // instant until the closing shot grew, and "duration − whip" would now
    // silently pass for any whip at all.
    expect(INTRO_LAND_HIT_MS - whip).toBeLessThan(700)
    expect(INTRO_LAND_HIT_MS - whip).toBeGreaterThan(250)
  })

  it('holds on the tower after it lands, long enough to watch the riders in', () => {
    // The closing shot. Two hundred milliseconds of tower was a cut — the
    // camera arrived and the cutscene ended before the player had focused on
    // what it arrived at — and it is now the beat the cavalry gallop home
    // across, so it has to outlast the slowest of them.
    const hold = introDurationMs() - INTRO_LAND_HIT_MS
    expect(hold).toBeGreaterThan(1200)
    const last = INTRO_RIDERS.count - 1
    const arrives = INTRO_RIDERS.runFrom
      + ((INTRO_RIDERS.startX + INTRO_RIDERS.gap * last) / INTRO_RIDERS.speed) * 1000
    expect(arrives + INTRO_RIDERS.fadeMs).toBeLessThanOrEqual(introDurationMs())
    // …and the camera does not drift while it holds.
    expect(frameAt(INTRO_LAND_HIT_MS + 200)).toEqual(HOME)
    expect(frameAt(introDurationMs())).toEqual(HOME)
  })

  it('stays inside the zoom range the game itself uses, on every screen', () => {
    // A cinematic frame outside the range `useTowerCamera` can produce would
    // hand the player back a view that jumps on the first frame after the
    // cutscene.
    for (const view of [DESKTOP, PHONE, { w: 1280, h: 720 }, { w: 915, h: 412 }]) {
      for (let ms = 0; ms <= introDurationMs(); ms += 100) {
        const z = frameAt(ms, view).zoom
        expect(z).toBeGreaterThanOrEqual(INTRO_ZOOM_MIN)
        expect(z).toBeLessThanOrEqual(INTRO_ZOOM_MAX)
      }
    }
  })

  it('pulls back as it goes, so more of the army fits every second', () => {
    // The span opening IS the "ever growing amounts": the ranks are laid out at
    // a rising density, and the camera keeps widening over them.
    expect(halfSpan(2300)).toBeGreaterThan(halfSpan(800))
    expect(halfSpan(4100)).toBeGreaterThan(halfSpan(2300))
    expect(halfSpan(5600)).toBeGreaterThan(halfSpan(4100))
  })

  it('never frames more than the height cap allows', () => {
    // The clause that makes a portrait phone survivable. Without it the phone
    // frames sixty-five cells of world vertically and the army is a line of
    // ants along the bottom.
    for (const view of [DESKTOP, PHONE]) {
      for (let ms = 100; ms <= introBeatStart('whip'); ms += 100) {
        expect(view.h / frameAt(ms, view).zoom).toBeLessThanOrEqual(INTRO_MAX_ROWS + 1e-9)
      }
    }
  })

  it('puts the ground line where the shot asked, on any viewport', () => {
    // `worldToScreenY(0)` is `viewH / 2 + y · zoom`; the shot names that as a
    // fraction of the viewport so the horizon sits in the same place on a
    // monitor and on a phone.
    for (const view of [DESKTOP, PHONE]) {
      for (const ground of [0.64, 0.72]) {
        const f = resolveIntroAnchor({ x: -40, span: 40, ground }, HOME, view.w, view.h)
        expect(view.h / 2 + f.y * f.zoom).toBeCloseTo(ground * view.h, 6)
      }
    }
  })

  it('falls back to home before the viewport is known', () => {
    // Headless tests, and the one frame between `playIntro` and the loop's
    // first `stepIntro`. A zero viewport must not produce an infinite zoom.
    expect(sampleIntroCamera(3000, HOME, 0, 0)).toEqual(HOME)
  })
})

describe('the hold on the peak', () => {
  /** Is `x` inside the framed world at `ms`? */
  const inFrame = (x: number, ms: number, view = DESKTOP): boolean =>
    Math.abs(x - frameAt(ms, view).x) < halfSpan(ms, view)

  it('holds still, and long enough', () => {
    const from = INTRO_SIEGE_HIT_MS
    const to = introBeatStart('whip')
    // Three seconds is what the design asks for; the hold is that plus the beat
    // the horn needs to land.
    expect(to - from).toBeGreaterThanOrEqual(3000)
    // Still, but not frozen: a dead-static hold on a static tableau reads as
    // the game having hung, so the camera creeps — under a cell a second.
    const drift = Math.abs(frameAt(to).x - frameAt(from + 400).x)
    expect(drift).toBeGreaterThan(0)
    expect(drift / ((to - from - 400) / 1000)) .toBeLessThan(1)
  })

  it('frames the heaviest engines on a monitor AND on a portrait phone', () => {
    // The phone sees about a quarter of the width a monitor does, so the
    // arrangement has to put the two biggest machines around the hold centre
    // rather than spread across the whole line.
    const hold = introBeatStart('whip') - 200
    const heavy = ['trebuchet', 'catapult']
    for (const view of [DESKTOP, PHONE]) {
      for (const id of heavy) {
        const at = DESKTOP_TABLEAU.placed.find((p) => p.typeId === id)!
        expect(inFrame(at.x, hold, view), `${id} off screen at ${view.w}x${view.h}`).toBe(true)
      }
    }
    // The whole siege train is on a monitor, which is the shot it was drawn for.
    for (const p of DESKTOP_TABLEAU.placed) expect(inFrame(p.x, hold, DESKTOP)).toBe(true)
  })

  it('frames the phone tableau peak on a phone', () => {
    const hold = introBeatStart('whip') - 200
    const framed = DROPMERGE_TABLEAU.placed.filter((p) => inFrame(p.x, hold, PHONE))
    expect(framed.length).toBeGreaterThanOrEqual(2)
  })
})

describe('skipping', () => {
  it('cuts the flight but never the landing', () => {
    const to = introSkipMs()
    // Before the whip, so a player who taps out is still flown home and still
    // arrives knowing where they now are. A skip that cut to black would be a
    // screen change rather than a return.
    expect(to).toBeLessThan(introBeatStart('whip') + 1)
    expect(to).toBeGreaterThan(0)
    // Measured to the LANDING: what a skip still costs the player is the whip,
    // not the closing shot the whip leads into (a second tap ends that — see
    // `skipIntro`).
    expect(INTRO_LAND_HIT_MS - to).toBeLessThan(900)
  })

  it('degrades to the end when there is no whip to land on', () => {
    const keys = INTRO_KEYS.filter((k) => k.ease !== 'whip')
    expect(introSkipMs(keys)).toBe(introDurationMs(keys))
  })
})

describe('the beats, the cards and the banner', () => {
  it('runs its beats in order, once each', () => {
    const seen: string[] = []
    for (let ms = 0; ms <= introDurationMs(); ms += 25) {
      const beat = introBeatAt(ms)
      if (seen[seen.length - 1] !== beat) seen.push(beat)
    }
    expect(seen).toEqual(INTRO_BEATS.map(([id]) => id))
  })

  it('shows three lines, never two at once, all inside the flight', () => {
    const windows: Array<[number, number]> = []
    let last: string | null = null
    for (let ms = 0; ms <= introDurationMs(); ms += 10) {
      const card = introCardAt(ms)
      const key = card?.key ?? null
      if (key !== last) {
        if (key) windows.push([card!.from, card!.to])
        last = key
      }
    }
    expect(windows).toHaveLength(3)
    for (let i = 1; i < windows.length; i++) {
      expect(windows[i]![0]).toBeGreaterThanOrEqual(windows[i - 1]![1])
    }
    // Nothing still on screen while the camera is whipping home: a caption over
    // a whip-pan is a caption on a blur.
    expect(windows[2]![1]).toBeLessThanOrEqual(introBeatStart('whip'))
    // And long enough to actually read, in 21 languages.
    for (const [from, to] of windows) expect(to - from).toBeGreaterThanOrEqual(1000)
  })

  it('gives the banner the back of the siege hold, and about three seconds', () => {
    const [from, to] = INTRO_BANNER
    // `hud.monstersIncoming` — the line the game already owned, said here
    // against the army it is about rather than over the opening board.
    expect(from).toBeGreaterThanOrEqual(INTRO_SIEGE_HIT_MS)
    expect(to).toBeLessThanOrEqual(introBeatStart('whip'))
    expect(to - from).toBeGreaterThanOrEqual(2000)
    expect(introBannerAt(from)).toBe(true)
    expect(introBannerAt(to)).toBe(false)
    expect(introBannerAt(0)).toBe(false)
  })

  it('blows the horn on the frame the engines come into view', () => {
    expect(introBeatAt(INTRO_SIEGE_HIT_MS)).toBe('siege')
    expect(introBeatAt(INTRO_SIEGE_HIT_MS - 1)).not.toBe('siege')
  })
})

describe('the promises it plants', () => {
  /**
   * Two things in the cutscene are not threats — they are things the player
   * cannot build yet and is meant to want. Both are easy to break silently: a
   * fleet that drifts onto the player's own dock stops reading as scenery, and
   * a rider whose numbers no longer line up with the closing shot either
   * arrives before the camera does or is still off screen when the cutscene
   * ends.
   */

  it('sails every hull type twice, out past any dock the player can own', () => {
    // Each type twice, so the harbour ladder is shown whole rather than
    // sampled. `dockHalfWidth` starts at 3 and reaches single figures fully
    // upgraded, so 15 cells out is unmistakably not the player's water —
    // nobody can mistake these for something they own, and nothing they later
    // build can collide with where these were.
    const byType = new Map<string, number>()
    for (const f of INTRO_FLEET) byType.set(f.typeId, (byType.get(f.typeId) ?? 0) + 1)
    expect([...byType.keys()].sort()).toEqual(['galley', 'longship', 'skiff'])
    for (const [id, n] of byType) expect(n, id).toBe(2)
    for (const f of INTRO_FLEET) expect(Math.abs(f.x)).toBeGreaterThan(15)
  })

  it('moors the fleet where the fly-over actually passes it', () => {
    // Geometry decides when they are on screen — there is no timing and no
    // state — so the hulls have to sit inside the stretch the camera crosses.
    const seen = INTRO_FLEET.filter((f) => {
      for (let ms = introBeatStart('march'); ms <= introBeatStart('siege'); ms += 50) {
        const half = halfSpan(ms)
        if (Math.abs(f.x - frameAt(ms).x) < half) return true
      }
      return false
    })
    expect(seen).toHaveLength(INTRO_FLEET.length)
    expect(introFleetTypes()).toHaveLength(3)
  })

  it('rides three knights in from the empty flank, not through the horde', () => {
    // Every monster in the tableau is west of the tower. The riders come from
    // the east, across ground the player has just been shown is clear — which
    // is what makes them read as friendly before the art has to.
    expect(INTRO_RIDERS.count).toBe(3)
    expect(INTRO_RIDERS.startX).toBeGreaterThan(0)
    for (const u of buildIntroCast(DESKTOP_TABLEAU)) expect(u.x).toBeLessThan(0)
  })

  it('starts them closer to the tower than anything the cutscene spawned', () => {
    // The brief: closer in than the pre-spawned monsters. A rider that began
    // seventy cells out would spend the whole closing shot as a dot.
    const nearestMonster = Math.min(
      ...buildIntroCast(DESKTOP_TABLEAU).map((u) => Math.abs(u.x))
    )
    const furthestRider = INTRO_RIDERS.startX + INTRO_RIDERS.gap * (INTRO_RIDERS.count - 1)
    expect(furthestRider).toBeLessThan(nearestMonster)
  })

  it('has them galloping before the camera turns, and arriving after it lands', () => {
    // A cutscene that ended on three horses standing still, waiting to be
    // looked at, would be a diorama rather than an arrival — so they are
    // already moving when the whip starts. And none of them may reach the Gate
    // before the camera does, or the payoff happens off screen.
    expect(INTRO_RIDERS.spawnAt).toBeLessThan(introBeatStart('whip'))
    expect(INTRO_RIDERS.runFrom).toBeLessThan(introBeatStart('whip'))
    for (let i = 0; i < INTRO_RIDERS.count; i++) {
      expect(introRiderAt(i, introBeatStart('whip')).x, `rider ${i} at the whip`)
        .toBeGreaterThan(0)
      expect(introRiderAt(i, INTRO_LAND_HIT_MS).x, `rider ${i} at the landing`)
        .toBeGreaterThan(0)
    }
  })

  it('walks each rider in, stops it at the Gate and fades it out there', () => {
    for (let i = 0; i < INTRO_RIDERS.count; i++) {
      let last = Infinity
      let stoppedAt: number | null = null
      for (let ms = INTRO_RIDERS.runFrom; ms <= introDurationMs(); ms += 20) {
        const r = introRiderAt(i, ms)
        // Never backwards, and never through the foundation and out the far
        // side: it goes IN.
        expect(r.x).toBeLessThanOrEqual(last + 1e-9)
        expect(r.x).toBeGreaterThanOrEqual(0)
        if (r.x === 0 && stoppedAt === null) stoppedAt = ms
        last = r.x
      }
      expect(stoppedAt, `rider ${i} never reached the Gate`).not.toBe(null)
      // Opaque on the way in, gone shortly after arriving.
      expect(introRiderAt(i, stoppedAt! - 100).alpha).toBe(1)
      expect(introRiderAt(i, stoppedAt! + INTRO_RIDERS.fadeMs + 20).done).toBe(true)
      // …and gone before the cutscene is.
      expect(introRiderAt(i, introDurationMs()).done).toBe(true)
    }
  })

  it('staggers them, so three riders are not one wide rider', () => {
    const at = introBeatStart('whip')
    const xs = Array.from({ length: INTRO_RIDERS.count }, (_, i) => introRiderAt(i, at).x)
    expect(new Set(xs.map((x) => x.toFixed(3))).size).toBe(INTRO_RIDERS.count)
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(0.5)
  })
})

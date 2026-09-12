/**
 * ─── FAIL, 30 s: "won the wave, lost the run" ───────────────────────────────
 *
 * The mirror of `success-30s`, and the harder of the two to get right: thirty
 * seconds is long enough for a viewer to decide the player deserved it, so the
 * first twenty have to be a player doing WELL.
 *
 * WHAT THE VIEWER SEES
 *
 *   landscape — a boss wave, and at first it goes the tower's way: the escort
 *   dies on the walls, riders ride out, the guns hold the line. Then the golem
 *   arrives and nothing changes its mind. Blocks come off a floor at a time;
 *   the player spends everything — a second charge, a volley that clears every
 *   other thing on the field — and it is not the escort that was the problem.
 *   The Gate goes. The board wipes, and the next siege is already standing.
 *
 *   portrait — the phone board two waves past its build. Welds keep landing,
 *   the columns keep coming down, and the last weld is one column too late.
 *
 * WITH NO INTERFACE
 *   Nothing announces the defeat. It is read off the board: the tower shrinking
 *   floor by floor while the horde does not, the Gate's collapse and the white
 *   flash — and then a full board standing where a ruin was, which is the
 *   retry, happening.
 *
 * BEAT SHEET (ms into `record`)
 *
 *   0–4     the wave arrives; the tower is winning
 *   4–12    it keeps winning — kills, riders, the line holds
 *   12–18   the boss reaches the wall. The tower starts coming down.
 *   18–22   everything the player has: a charge, a volley. The field empties.
 *           The one that matters is still there.
 *   22–27   THE GATE FALLS (measured at 22.1 s on the landscape take; the clip
 *           rolls to it rather than cutting, so it moves with the wave)
 *   27–30   back in: a fresh siege on the same ground, already under way
 */

import * as g from './_drive.mjs'

/** The Gate is staged wounded so the fall lands on the beat rather than
 *  wherever the boss's swing timer happens to put it (`gateHp`), and the
 *  pre-roll is short because this clip WANTS the wave's early, winning half. */
const PLAN = {
  // Wave 30 and a Gate on 70, and it took four takes to land both.
  //
  // Thirty seconds is long enough for the player's own answers to WORK: a
  // charge puts riders between the boss and the Gate, and a volley clears the
  // field. At wave 20 this beat sheet won the boss wave outright (`build w20,
  // gate 23%`) — a fail clip with no fail in it. Wave 30's escort is heavy
  // enough that clearing it is not the same as surviving it; and even there a
  // Gate on 120 came through on 12 % with one enemy left, which is a near miss
  // rather than a defeat. The clip is about losing, so the siege is staged in
  // the trouble it is about to lose to.
  desktop: { wave: 30, gateHp: 70, preroll: 6_000 },
  dropmerge: { wave: 14, gateHp: 200, preroll: 2_000 }
}

export default {
  id: 'fail-30s',
  label: 'Won the wave, lost the run',

  async setup(ctx) {
    const board = g.boardFor(ctx)
    const plan = PLAN[board]
    await g.boot(ctx, {
      wave: g.waveFor(plan.wave),
      snapshot: g.runSnapshot(board, g.waveFor(plan.wave), { gateHp: plan.gateHp })
    })
    const called = await g.callWave(ctx)
    ctx.log.info(`wave ${called.wave}: ${called.total} enemies${called.boss ? ' (BOSS)' : ''}`)
    // Held until the thing that will actually end the run is CLOSE — the boss
    // on the desktop board, anything on the walls on the phone.
    //
    // A plain contact condition is not enough here and the difference is the
    // whole clip: the escort reaches the tower in seconds and dies on it,
    // while the golem takes half a minute to arrive. Timed off the escort, the
    // thirty seconds were spent on a fight the tower was winning and the Gate
    // was never touched — a fail clip with no fail in it, measured twice.
    if (board === 'dropmerge') {
      await g.prerollToContact(ctx, { floorMs: plan.preroll, within: 4, maxMs: 8_000 })
    } else {
      await g.prerollUntil(ctx, {
        floorMs: plan.preroll,
        maxMs: 26_000,
        label: 'the boss is in range of the walls',
        until: () => window.__ts.getEnemies().some(
          (e) => e.dying <= 0 && Math.abs(e.x) < 9 && !!window.__ts.ENEMY_DEFS[e.typeId]?.boss
        )
      })
    }
    await g.log(ctx, 'frame 0')
  },

  async record(ctx) {
    const board = g.boardFor(ctx)
    const t = g.budget(ctx)
    const end = ctx.durationMs

    ctx.beat('open')

    if (board === 'dropmerge') {
      // ── 0–4  the wave is on the board and the guns are answering ──
      await t.until(3_500)

      // ── 4–12  the player is winning: two welds, bigger guns ──
      const w1 = await g.weldNow(ctx)
      ctx.log.info(`weld 1: ${w1.id} → column ${w1.c} (merge tier ${w1.merged ?? 0})`)
      await t.until(6_500)
      const w2 = await g.weldNow(ctx)
      ctx.log.info(`weld 2: ${w2.id} → column ${w2.c} (merge tier ${w2.merged ?? 0})`)
      await t.until(9_500)
      await g.weldNow(ctx)
      await t.until(12_000)

      // ── 12–18  the columns start coming down faster than they go up ──
      await g.log(ctx, 'the turn')
      await g.weldNow(ctx)
      await t.until(15_000)
      await g.weldNow(ctx)
      await t.until(18_000)

      // ── 18–24  the last weld, and it is one column too late ──
      const last = await g.weldNow(ctx)
      ctx.log.info(`last weld: ${last.id} → column ${last.c} (merge tier ${last.merged ?? 0})`)
      await t.until(21_000)
    } else {
      // ── 0–4  the boss wave walks in ──
      await t.until(4_000)

      // ── 4–12  the tower is winning: the escort dies on the walls ──
      await g.cavalry(ctx)
      await t.until(7_500)
      await g.log(ctx, 'the tower is ahead')
      await t.until(12_000)

      // ── 12–18  the golem reaches the wall. Floors start coming off. ──
      await ctx.stepUntil(
        () => window.__ts.getEnemies().some((e) => e.dying <= 0 && Math.abs(e.x) < 2.2),
        { timeoutMs: 3_000, label: 'the boss reaches the wall' }
      )
      await g.log(ctx, 'the boss is on the tower')
      await t.until(18_000)

      // ── 18–24  everything the player has. It clears the field, not the boss. ──
      await g.cavalry(ctx)
      await t.until(19_500)
      const volley = await g.arrowRain(ctx)
      ctx.log.info(`arrow rain at x=${volley.at} over ${volley.covered} enemies`)
      await t.until(21_500)
      await g.log(ctx, 'after the volley')
    }

    // ── THE GATE FALLS ──
    const fell = await ctx.stepUntil(
      () => window.__ts.phase.value === 'defeat',
      { timeoutMs: Math.max(2_000, end - t.spent() - 3_000), label: 'the Gate falls' }
    )
    if (fell) {
      // Half a second after the blow, not on it: the Gate's death washes the
      // whole screen white, which is the best beat and the worst still.
      await t.until(t.spent() + 500)
      await g.poster(ctx, { needEnemies: false })
    } else {
      ctx.beat('holding')
      ctx.log.warn('the Gate held — the clip ends mid-siege instead of on a defeat')
    }
    await g.log(ctx, fell ? 'defeat' : 'still standing')

    // ── the collapse, held long enough to read ──
    //
    // Short, because there is nothing after it: the game's defeat flow holds
    // the board still behind a result screen the clean feed has hidden, so
    // every further frame is the same frame until the retry starts.
    await t.until(Math.max(t.spent(), end - 2_800))

    // ── back in: a fresh siege, and the first wave of it already called ──
    await g.playAgain(ctx)
    ctx.beat('retry')
    await t.until(Math.max(t.spent(), end - 1_800))
    await g.callWave(ctx)
    await t.until(end)
    await g.log(ctx, 'last frame')
  }
}

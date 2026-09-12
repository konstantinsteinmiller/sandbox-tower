/**
 * ─── SUCCESS (10 s, and 16 s for CrazyGames) ────────────────────────────────
 *
 * WHAT THE VIEWER SEES
 *
 *   landscape / square — the desktop tower, mid-siege: guns firing, a horde at
 *   the walls, a block shattering. Three riders come out of the Gate into the
 *   pack, then a volley of arrows falls out of the sky and takes four of them
 *   at once. The wave breaks, and the tower immediately grows a new gun.
 *
 *   portrait — the phone board. The same fight in five columns, and the thing
 *   only this board does: one dropped archer fuses DOWN into its twin and the
 *   weld fuses again SIDEWAYS, so a single tap turns two small guns into one
 *   tier-3 gun standing over the Gate. Then a second weld, on the cannons.
 *
 * WITH NO INTERFACE
 *   There is no wave counter, no health bar and no payout banner. The stakes
 *   are read off the board: how close the horde is, how much of the tower is
 *   still standing, and — the whole point — the guns visibly getting BIGGER.
 *   A weld is drawn as a burst in the tier's colour and a larger gun; nothing
 *   has to be written for it to read.
 *
 * BEAT SHEET (ms into `record`; the 16 s cut spends its extra six seconds on
 * one more exchange, never on longer holds)
 *
 *   0.0–1.8   already at the walls. Frame 1 moves.
 *   1.8–4.2   the player commits: cavalry out / the first weld
 *   4.2–7.0   THE PAYOFF: the volley, or the cascade into a tier 3
 *   7.0–10.0  the second wind — what is left of the wave closes, a second
 *             charge goes out to meet it, another weld lands
 *   10.0–16.0 (16 s only) the wave breaks, the tower GROWS on camera, and the
 *             next wave is called in early
 */

import * as g from './_drive.mjs'

/**
 * Both wave numbers were found by recording them, not by reasoning about them
 * — the director prices a wave against the tower it is facing (see the
 * README). Wave 17 is where the desktop keep stops killing the horde at range:
 * 21 enemies at difficulty 0.75, fourteen of them alive and on the walls at
 * frame 0. Below that the volley had nothing to fall on. Wave 10 on the phone
 * board comes out at difficulty 2.28 — the same fight, from the other side.
 */
const PLAN = {
  desktop: { wave: 17, preroll: 7_000, within: 3 },
  dropmerge: { wave: 10, preroll: 3_000, within: 2 }
}

export default {
  id: 'success',
  label: 'The volley that breaks the wave',

  async setup(ctx) {
    const board = g.boardFor(ctx)
    const plan = PLAN[board]
    await g.boot(ctx, { wave: g.waveFor(plan.wave) })
    const called = await g.callWave(ctx)
    ctx.log.info(
      `wave ${called.wave}: ${called.total} enemies${called.boss ? ' (BOSS)' : ''} ` +
      `at difficulty ${called.difficulty} — ${called.roster}`
    )
    // The pre-roll. Frame 0 has to be a fight, not a walk-on: a wave spends its
    // first seconds crossing an empty field, and that is six of the ten
    // seconds this clip has. Virtual time, so it is the same on every machine.
    await g.prerollToContact(ctx, { floorMs: plan.preroll, within: plan.within })
    await g.log(ctx, 'frame 0')
  },

  async record(ctx) {
    const board = g.boardFor(ctx)
    const t = g.budget(ctx)
    const long = ctx.durationMs > 12_000

    ctx.beat('open')

    if (board === 'dropmerge') {
      // ── 0.0–1.2  the fight as it stands ──
      await t.until(1_200)

      // ── 1.2–4.0  THE PAYOFF: one drop, two welds, a tier-3 gun ──
      // Column 1 holds an archer's twin and column 0 the tier 2 beside it, so
      // this single drop cascades (see DROP_TOWER in _drive.mjs). `weldNow`
      // reads the board and deals itself the piece that fuses deepest, so the
      // beat lands even after the wave has rearranged the columns.
      const weld = await g.weldNow(ctx)
      ctx.log.info(`weld 1: ${weld.id} → column ${weld.c} (merge tier ${weld.merged ?? 0})`)
      // The piece falls, lands, fuses, and the burst plays — ~0.9 s all told.
      await t.until(2_600)
      await g.poster(ctx)
      await t.until(4_000)

      // ── 4.0–6.5  and again, on whatever the wave has left standing ──
      const weld2 = await g.weldNow(ctx)
      ctx.log.info(`weld 2: ${weld2.id} → column ${weld2.c} (merge tier ${weld2.merged ?? 0})`)
      await t.until(6_500)

      // ── 6.5–10.0  the bigger guns go to work; one more piece goes down ──
      await g.weldNow(ctx)
      await t.until(long ? 10_000 : ctx.durationMs)

      if (long) {
        // ── 10.0–16.0  two more welds, then the board holds ──
        await g.weldNow(ctx)
        await t.until(12_500)
        await g.weldNow(ctx)
        await t.until(ctx.durationMs)
      }
      await g.log(ctx, 'last frame')
      return
    }

    // ── desktop / square ──
    //
    // ── 0.0–1.8  the siege as it stands: guns firing, the horde closing ──
    await t.until(1_800)

    // ── 1.8–4.2  the player commits: three riders out of the Gate ──
    await g.cavalry(ctx)
    await t.until(4_200)

    // ── 4.2–7.0  THE PAYOFF: a volley out of the sky onto the thickest pack ──
    const volley = await g.arrowRain(ctx)
    ctx.log.info(`arrow rain at x=${volley.at} over ${volley.covered} enemies`)
    // The poster is half a second AFTER the volley lands: at the moment of
    // impact the screen is a wash of arrows and dust, which is the best beat
    // and the worst still.
    await t.until(4_900)
    await g.poster(ctx)
    await t.until(7_000)

    // ── 7.0–10.0  the second wind ──
    //
    // What is left of the wave closes again and a second charge goes out to
    // meet it, so the clip ends ON the fight rather than watching a field
    // empty. The tower only GROWS on camera if the wave is actually broken —
    // the desktop game does not let a player build mid-battle, and a block
    // appearing while the horde is on the walls is a beat that reads as a lie
    // to anyone who has played it.
    await g.cavalry(ctx)
    await t.until(long ? 9_000 : ctx.durationMs)

    if (long) {
      // ── 9.0–16.0  (CrazyGames' 16 s) the wave breaks, and the tower grows ──
      const clear = await ctx.stepUntil(
        () => window.__ts.phase.value === 'build',
        { timeoutMs: 3_500, label: 'the wave breaks' }
      )
      if (clear) {
        await g.setHand(ctx, ['w2h', 'cannon1', 'archer1'])
        const put = await g.placeWhereLegal(ctx, 1, [[0, 7], [1, 5], [-1, 5], [2, 3], [-2, 3], [3, 1], [-3, 1]])
        ctx.log.info(`placed ${put.id} at (${put.c}, ${put.r}): ${put.ok}`)
        await t.until(12_000)
        await g.setHand(ctx, ['s2h', 'archer1', 'cannon1'])
        const put2 = await g.placeWhereLegal(ctx, 1, [[-1, 5], [1, 5], [0, 7], [-2, 3], [2, 3]])
        ctx.log.info(`placed ${put2.id} at (${put2.c}, ${put2.r}): ${put2.ok}`)
        await t.until(13_500)
        const next = await g.callWave(ctx)
        ctx.log.info(`called wave ${next.wave}: ${next.total} enemies — ${next.roster}`)
      } else {
        // Still fighting: spend the extra seconds on the fight, not on a beat
        // that needs a lull it never got.
        await t.until(12_500)
        const volley = await g.arrowRain(ctx)
        ctx.log.info(`second volley at x=${volley.at} over ${volley.covered} enemies`)
      }
      await t.until(ctx.durationMs)
    }
    await g.log(ctx, 'last frame')
  }
}

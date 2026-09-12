/**
 * ─── SUCCESS, 30 s: "two waves, and the tower grows between them" ───────────
 *
 * Not the ten-second clip held longer. Thirty seconds is a whole stretch of a
 * run in miniature — seven or eight exchanges with an escalation a viewer can
 * see — and the escalation here is the TOWER ITSELF: it ends the clip visibly
 * bigger and better armed than it started, which is the only thing this game
 * is selling.
 *
 * WHAT THE VIEWER SEES
 *
 *   landscape — one long wave, met twice. Riders go out; a volley comes down
 *   on the pack at the wall; the wave keeps arriving and takes a block off the
 *   tower; a second charge and a second volley break it for good. Only then,
 *   with the field clear, does the player build — two new guns onto the crown
 *   — and call the next wave in early.
 *
 *   portrait — the phone board. Four welds across the clip, each one a bigger
 *   gun than the last: two archers fuse and the weld fuses again into a tier 3
 *   over the Gate, then the cannons, then the wave that arrives afterwards
 *   meets a board that has doubled its firepower without gaining a column.
 *
 * BEAT SHEET (ms into `record`)
 *
 *   0–4     in motion: the wave is on the tower, guns firing
 *   4–8     the player commits — riders / the first weld — and wins an exchange
 *   8–12    the first volley (landscape) / the cascade into a tier 3 (portrait)
 *   then    the landscape cut stops counting seconds and follows the GAME: the
 *           wave breaks → two guns go up in the lull → the next wave is called
 *           early → it reaches the walls → THE PAYOFF, the second volley → the
 *           rest of the clip is the fight the bigger tower is now winning.
 *           (Fixed times there fired the payoff over an empty field: wave 17
 *           empties at ~19 s and the next one takes ~7 s to walk on.)
 *   12–24   portrait: a weld per exchange, the biggest of them at 18–24
 *   24–30   portrait: the wave breaks, one more piece, the next wave called
 */

import * as g from './_drive.mjs'

/**
 * Wave 17 on the desktop board, not 12, and the arc changed with it.
 *
 * The first draft told a two-wave story: hold wave 12, build in the lull, call
 * the next one. Wave 12 is 14 enemies that this keep kills at range — the log
 * read `0 alive` six seconds in, and the clip spent six of its thirty seconds
 * on an empty field waiting for a wave that had not been called yet. Dead air
 * is worse than a missing beat, so the 30 s cut is now ONE long wave with two
 * payoffs in it, and the build beat happens at the end, where the wave
 * actually breaks.
 */
const PLAN = {
  desktop: { wave: 17, preroll: 7_000 },
  dropmerge: { wave: 10, preroll: 4_000 }
}

export default {
  id: 'success-30s',
  label: 'Two waves, and the tower grows between them',

  async setup(ctx) {
    const board = g.boardFor(ctx)
    const plan = PLAN[board]
    await g.boot(ctx, { wave: g.waveFor(plan.wave) })
    const called = await g.callWave(ctx)
    ctx.log.info(`wave ${called.wave}: ${called.total} enemies${called.boss ? ' (BOSS)' : ''}`)
    await g.prerollToContact(ctx, { floorMs: plan.preroll, within: board === 'dropmerge' ? 2 : 3.5 })
    await g.log(ctx, 'frame 0')
  },

  async record(ctx) {
    const board = g.boardFor(ctx)
    const t = g.budget(ctx)

    ctx.beat('open')

    if (board === 'dropmerge') {
      // ── 0–4  the wave is on the board ──
      await t.until(3_800)

      // ── 4–9  the cascade: one drop, two welds, a tier-3 gun ──
      const w1 = await g.weldNow(ctx)
      ctx.log.info(`weld 1: ${w1.id} → column ${w1.c} (merge tier ${w1.merged ?? 0})`)
      await t.until(5_600)
      // First offer of the cover, and usually the winning one: a full board, a
      // horde on it, and a tier-3 gun that has just appeared over the Gate.
      await g.poster(ctx)
      await t.until(6_200)
      const w2 = await g.weldNow(ctx)
      ctx.log.info(`weld 2: ${w2.id} → column ${w2.c} (merge tier ${w2.merged ?? 0})`)
      await t.until(9_000)

      // ── 9–13  the guns answer; the walls go back up ──
      await g.weldNow(ctx)
      await t.until(11_000)
      await g.weldNow(ctx)
      await t.until(13_500)

      // ── 13–18  keep answering: a drop per exchange ──
      await g.weldNow(ctx)
      await t.until(16_000)
      await g.weldNow(ctx)
      await t.until(18_000)

      // ── 18–24  THE PAYOFF: the biggest weld of the clip ──
      const big = await g.weldNow(ctx)
      ctx.log.info(`payoff weld: ${big.id} → column ${big.c} (merge tier ${big.merged ?? 0})`)
      await t.until(19_400)
      // Second offer: taken only if the first was refused AND there is still a
      // wave on the board to photograph.
      await g.poster(ctx)
      await t.until(24_000)

      // ── 24–27  the wave breaks ──
      await g.log(ctx, 'after the payoff')
      await t.until(26_500)

      // ── 27–30  back in: one more piece, and whatever is next ──
      await g.weldNow(ctx)
      await ctx.stepUntil(() => window.__ts.phase.value === 'build', { timeoutMs: 1_200 })
      await g.callWave(ctx)
      await t.until(ctx.durationMs)
      await g.log(ctx, 'last frame')
      return
    }

    // ── desktop: one long wave, two payoffs ──
    //
    // ── 0–4  the wave is at the walls ──
    await t.until(3_600)

    // ── 4–8  riders out; the exchange goes the player's way ──
    await g.cavalry(ctx)
    await t.until(6_500)
    await g.log(ctx, 'first exchange')
    await t.until(8_000)

    // ── 8–12  the first volley, on whatever is thickest right now ──
    //
    // Aimed by PROXIMITY, not by head count: a wave is at its fullest the
    // moment it is called, with all of it out at the edges of the field, so a
    // volley fired on "five alive" once landed at x=-13 over three stragglers.
    // What the shot needs is a pack standing ON the tower.
    await ctx.stepUntil(
      () => window.__ts.getEnemies().filter((e) => e.dying <= 0 && Math.abs(e.x) < 7).length >= 3,
      { timeoutMs: 3_000, label: 'a pack on the walls' }
    )
    const first = await g.arrowRain(ctx)
    ctx.log.info(`volley 1 at x=${first.at} over ${first.covered} enemies`)
    await t.until(9_400)
    // First offer of the cover: the wreckage of a volley, with the wave still
    // coming. Refused if the field happens to be empty (see `poster`).
    await g.poster(ctx)

    // ── the wave breaks, and the tower GROWS — the loop, on camera ──
    //
    // Driven by the GAME's phase from here, not by the clock. Wave 17 empties
    // about nineteen seconds in, and a beat sheet that held its second payoff
    // for second 21 fired a volley over an empty field and left the middle of
    // the clip with nothing in it — measured, twice. So the lull begins the
    // moment the field is actually clear, and the next wave is called as soon
    // as the new guns are up.
    //
    // `placeShape` is legal at any phase in the simulation, but the desktop
    // GAME only offers the tray between waves, so this waits rather than
    // building mid-battle: a gun appearing while the horde is on the walls
    // reads as a lie to anyone who has played it.
    const clear = await ctx.stepUntil(
      () => window.__ts.phase.value === 'build',
      { timeoutMs: 12_000, label: 'the wave breaks' }
    )
    if (clear) {
      await g.log(ctx, 'the lull')
      await g.setHand(ctx, ['w2h', 'cannon1', 'archer1'])
      const p1 = await g.placeWhereLegal(ctx, 1, [[0, 7], [1, 5], [-1, 5], [2, 3], [-2, 3]])
      ctx.log.info(`placed ${p1.id} at (${p1.c}, ${p1.r}): ${p1.ok}`)
      await t.wait(1_400)
      await g.setHand(ctx, ['s2h', 'archer1', 'cannon1'])
      const p2 = await g.placeWhereLegal(ctx, 1, [[-1, 5], [1, 5], [0, 7], [-2, 3], [2, 3], [3, 1]])
      ctx.log.info(`placed ${p2.id} at (${p2.c}, ${p2.r}): ${p2.ok}`)
      await t.wait(1_200)
      // Called EARLY, which is a real decision in this game — unused build
      // time pays a bonus — and the reason the clip never stands still.
      const next = await g.callWave(ctx)
      ctx.log.info(`called wave ${next.wave}: ${next.total} enemies${next.boss ? ' (BOSS)' : ''}`)
    }

    // ── the next wave walks in, bigger, and meets a bigger tower ──
    await g.cavalry(ctx)
    await ctx.stepUntil(
      () => window.__ts.getEnemies().filter((e) => e.dying <= 0 && Math.abs(e.x) < 7).length >= 3,
      { timeoutMs: 9_000, label: 'the new wave reaches the walls' }
    )

    // ── THE PAYOFF: the second volley, on the pack at the walls ──
    const volley = await g.arrowRain(ctx)
    ctx.log.info(`volley 2 at x=${volley.at} over ${volley.covered} enemies`)
    await t.wait(1_300)
    // A beat after the impact wash, where the wreckage reads.
    await g.poster(ctx)

    // ── and the rest of the clip is the fight this tower is now winning ──
    await t.until(ctx.durationMs)
    await g.log(ctx, 'last frame')
  }
}

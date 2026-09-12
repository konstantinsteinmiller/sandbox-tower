/**
 * ─── FAIL (10 s, and 16 s for CrazyGames) ───────────────────────────────────
 *
 * WHAT THE VIEWER SEES
 *
 *   landscape / square — a boss wave. The golem is already at the wall, taking
 *   the tower apart a block at a time. The player answers with everything they
 *   have: riders out of the Gate, then a volley that wipes the escort — and it
 *   works, the field empties. One thing is left standing, and it is the one
 *   thing that was never going to die. The Gate goes, the screen whites out,
 *   and a fresh siege is already starting.
 *
 *   portrait — the phone board, two waves past what it was built for. The
 *   player keeps welding as brutes chew through the outer columns; a weld
 *   lands, and it is one column too late.
 *
 * WHY THIS ONE CONVERTS
 *   The loss has to read as AVOIDABLE. So the clip is not a rout: the player is
 *   visibly winning the exchange in the middle of it — the escort dies, the
 *   guns are still firing — and loses anyway to the single thing they could
 *   not kill. "I was ahead and I threw it" is the feeling; the retry beat at
 *   the end is where the viewer puts themselves in the seat.
 *
 * WITH NO INTERFACE
 *   No "DEFEAT", no retry button, no health bar counting down. The loss is
 *   drawn by the game: the Gate's own collapse and the white flash — and then
 *   the board WIPES and a new tower stands there with a wave already walking
 *   on. The retry happens; it is not offered.
 *
 * BEAT SHEET (ms into `record`)
 *
 *   0.0–1.5   already losing blocks — the killer is on screen from frame 1
 *   1.5–4.0   the answer: cavalry, then the volley
 *   4.0–5.5   it worked — the field empties, all but the one that matters
 *   5.5–6.6   THE GATE FALLS  (measured; the clip rolls to it, so it moves)
 *   6.6–10.0  straight back in: a fresh siege, and a wave already walking on
 */

import * as g from './_drive.mjs'

/**
 * Desktop: wave 20 is a boss wave (`bossEvery: 10`) and the golem is the only
 * thing in the game that reliably takes this tower apart. Phone: wave 14 kills
 * this board at ~24 s with no help at all.
 *
 * On both, the Gate is staged ALREADY WOUNDED and the pre-roll then waits for
 * it to be UNDER ATTACK. Both halves are needed: the beats this clip is about
 * — riders out, a volley — put allies between the horde and the Gate and buy
 * the tower several seconds, so a full-health Gate does not fall inside ten
 * seconds, and a take that promises a defeat and does not deliver one is not a
 * fail clip.
 */
const PLAN = {
  desktop: { wave: 20, gateHp: 130, preroll: 16_000 },
  dropmerge: { wave: 14, gateHp: 200, preroll: 6_000 }
}

export default {
  id: 'fail',
  label: 'Everything but the one that mattered',

  async setup(ctx) {
    const board = g.boardFor(ctx)
    const plan = PLAN[board]
    await g.boot(ctx, {
      wave: g.waveFor(plan.wave),
      snapshot: g.runSnapshot(board, g.waveFor(plan.wave), { gateHp: plan.gateHp })
    })
    const called = await g.callWave(ctx)
    ctx.log.info(`wave ${called.wave}: ${called.total} enemies${called.boss ? ' (BOSS)' : ''}`)
    // Open with the Gate ALREADY LOSING HEALTH. Timed off contact instead, the
    // fall lands wherever the horde's own progress puts it: measured, the same
    // beat sheet produced a defeat at 1 s in one take (nothing left to watch)
    // and no defeat at all in another (a clip that promises a loss and does not
    // deliver one). Under attack, the Gate has a few known seconds left.
    await g.prerollToGatePressure(ctx, { floorMs: plan.preroll, lost: 0.08, maxMs: 22_000 })
    await g.log(ctx, 'frame 0')
  },

  async record(ctx) {
    const board = g.boardFor(ctx)
    const t = g.budget(ctx)
    const long = ctx.durationMs > 12_000
    const end = ctx.durationMs

    ctx.beat('open')

    if (board === 'dropmerge') {
      // ── 0.0–1.4  the board is being chewed ──
      await t.until(1_400)

      // ── 1.4–4.5  the player fights back: a weld, and it lands ──
      const weld = await g.weldNow(ctx)
      ctx.log.info(`weld: ${weld.id} → column ${weld.c} (merge tier ${weld.merged ?? 0})`)
      await t.until(3_000)
      await g.weldNow(ctx)
      await t.until(long ? 8_000 : 4_500)

      if (long) {
        await g.weldNow(ctx)
        await t.until(10_500)
      }
    } else {
      // ── 0.0–1.5  the golem at the wall, blocks coming off ──
      await t.until(1_500)

      // ── 1.5–4.0  the answer: riders, then the volley ──
      await g.cavalry(ctx)
      await t.until(2_800)
      const volley = await g.arrowRain(ctx)
      ctx.log.info(`arrow rain at x=${volley.at} over ${volley.covered} enemies`)
      await t.until(4_000)

      // ── 4.0–6.5  it worked. The escort is gone. The boss is not. ──
      await g.log(ctx, 'after the volley')
      await t.until(long ? 9_000 : 5_500)

      if (long) {
        // The 16 s cut has room for one more exchange the player also wins.
        await g.cavalry(ctx)
        await t.until(10_500)
      }
    }

    // ── THE GATE FALLS ──
    //
    // Rolled to rather than waited for. `stepUntil` advances the CLIP a frame
    // at a time until the game says `defeat`, so a wave that lands the blow a
    // beat early or late still gets its own frames rather than a cut.
    const fell = await ctx.stepUntil(
      () => window.__ts.phase.value === 'defeat',
      { timeoutMs: Math.max(1_500, end - t.spent() - 2_400), label: 'the Gate falls' }
    )
    if (fell) {
      // NOT on the blow itself. The Gate's death is a full-screen white flash
      // — the best beat in the clip and the worst still image in it; the
      // measured portrait cover came back as a washed-out frame with a sun in
      // it. Half a second later the wreckage reads and the killer is visible.
      await t.until(t.spent() + 500)
      await g.poster(ctx, { needEnemies: false })
    } else {
      ctx.beat('holding')
      ctx.log.warn('the Gate held — the clip ends mid-siege instead of on a defeat')
    }

    // ── the blow, held just long enough to read ──
    //
    // A beat, not a pause. Once the Gate is down the game's own defeat flow
    // holds the board still behind a result screen the clean feed has hidden,
    // so every frame after this one is the same frame until the retry starts.
    await t.until(Math.max(t.spent(), end - 3_400))

    // ── back in: a fresh siege on the same ground, and a wave already on it ──
    //
    // The wave is what makes this a beat rather than a photograph of a small
    // fort: the last seconds of the clip have monsters walking back on.
    await g.playAgain(ctx)
    ctx.beat('retry')
    await t.until(Math.max(t.spent(), end - 2_600))
    const again = await g.callWave(ctx)
    ctx.log.info(`retry: wave ${again.wave}, ${again.total} enemies`)
    await t.until(end)
    await g.log(ctx, 'last frame')
  }
}

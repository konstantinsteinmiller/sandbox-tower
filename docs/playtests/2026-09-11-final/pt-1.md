# Playtester 1 — desktop, persona: casual portal browser

## Summary (5 lines max)
A tower-defense/base-builder where you stack blocks and cannons on a castle to survive waves, with real meta-progression (tech tree, daily missions, leaderboard rank) between waves. The core loop (build → call wave → watch cannons auto-fire → repeat) became clear within about 30-40 seconds through trial and error, not through explicit teaching. Health stayed at 100% for 9 straight waves, then the wave-10 boss reached the gate and destroyed it within a single observation tick, with no visible ramp-up or warning — an abrupt, slightly unfair-feeling death after a long stretch of feeling invincible. The DESTROYED result screen (new record, leaderboard rank #260/361, resource rewards) was genuinely motivating. Several UI elements (the "-10%/-75%" cannon labels, the "REINFORCED HAND 30" tag, the coin vs. gold vs. wood/stone distinction) were never explained and stayed mysteries the whole session.

## Run 1 — what happened (timeline with game-time stamps)
- **~0-3s:** Loaded to a plain dark blue gradient screen with nothing on it (0002-shot.jpg) — looked broken for a moment until it resolved into the game.
- **~3s:** First real frame: "MONSTERS INCOMING!" banner, WAVE 0, resources (wood/stone/gold) top-center, a highlighted toolbar tile with a tutorial arrow (0003-wait.jpg). No text told me what the goal was yet.
- **~6-10s:** Clicking the highlighted tile spent wood+stone and visibly reinforced part of the castle wall. A choice popup with two cannons labeled "-10%" and "-75%" appeared over a single walking goblin, with no label explaining what the percentages meant (0005-wait.jpg). A "CLICK TO CONTINUE" prompt gated progress.
- **~10s:** Clicked the castle door out of curiosity and got a "GATE — CORE, HP 300/300, ARMOUR 3" panel — this was the first moment the actual objective (defend this structure) became legible (0013-shot.jpg).
- **~10-22s:** A short forced tutorial loop repeated: arrow → click cannon → click UPGRADE → arrow → click gate → click UPGRADE → arrow → click CALL WAVE. Functional, but slow and over-explained for how simple the action was.
- **~22s:** Wave 1 started (3 enemies). New UI appeared: "Drag to pan · Scroll to zoom" hint and 1x/1.5x/3x speed toggles (0023-click.jpg).
- **~30-45s:** Between waves 1 and 2, discovered the build system by trial: clicking a toolbar icon opened a piece description ("WOOD CRATE, 2x1, 40 HP — cheap filler, the backbone of every early tower — 20 wood") with a placement grid; clicking a highlighted grid cell placed it (0027/0029-click.jpg). A bigger 2x2 crate later showed no valid placement slots at all, which was confusing (0032-click.jpg).
- **~47s:** Discovered the "TECH TREE" (permanent meta-upgrades, "everything you buy here carries into every future run") by clicking an unlabeled green diamond icon bottom-right — not signposted by any tutorial arrow (0036-click.jpg).
- **~60s:** Discovered "DAILY MISSIONS" the same way, via an unlabeled clipboard icon with a red notification badge (0044-click.jpg) — claimed a completed mission for +40 coins.
- **~65-90s:** Spent coins on two tech-tree nodes (Foundations: +50% block HP; Sharpened Bolts: +damage). Bought a second, "FREE" cannon after wave 3, doubling firepower (0058/0059-click.jpg).
- **~2:00-2:15:** Wave 4 cleared with "WAVE 4 HELD!" confirmation text — clear, satisfying feedback (0061/0062-wait.jpg). Switched to 3x game speed to move through waves faster; this worked well and didn't feel like it hid anything important.
- **~3:00-4:35:** Waves 5 through 9 cleared cleanly, health bar staying at 100% throughout — the tower felt very strong and the threat level felt low/flat for a long stretch.
- **~4:35:** "CALL WAVE" button changed to a red "CALL BOSS" button — a clear, well-communicated escalation signal (0083-wait.jpg).
- **~4:45-4:55:** Wave 10 boss (a skeleton) appeared already standing right at the gate; on the very next check the health bar was completely empty and the screen had zoomed into a "SELL +3" panel over the ruined gate (0085-wait.jpg) — the transition from "totally fine" to "destroyed" happened with no perceivable warning phase in between.
- **RUN 1 END (~4:47 game time):** Result screen: "DESTROYED!", "YOU SURVIVED TO WAVE 10", "NEW RECORD!", +294 coins, Best Score 176, Rank #260 of 361, a gameplay tip, and a claimable Wave 9 completion reward (0086-click.jpg).

## Run 2 — what happened (time ran out)
Claimed the Wave 9 reward, then clicked the blue restart icon on the result screen. Instead of starting a fresh siege at wave 1, it resumed at WAVE 9 with the gate/cannons already rebuilt and all resources carried over (wood 395, stone 295, gold 270, coins 374) — unclear whether this is an intentional "continue" checkpoint or the restart button doing something unexpected (0089-click.jpg). The time budget ran out here (TIME UP at ~299s of 300s) while still on wave 9 of this continuation, health full, before another wave could be watched or a genuine second full run attempted.

## Information gaps
1. **No stated goal at load.** What I saw: a blank screen then "MONSTERS INCOMING!" with no objective text. What I didn't understand: what I was defending or why, until I happened to click the castle door ~10s in. Screenshot: 0003-wait.jpg (unclear state) vs 0013-shot.jpg (goal became clear). Severity: medium.
2. **Unlabeled "-10%/-75%" cannon overlays.** Appeared repeatedly above cannons during combat and choice popups, never explained (damage falloff? spread? a stat comparison for a pick?). Screenshots: 0005-wait.jpg, 0014-click.jpg. Stayed unexplained the entire session. Severity: low-medium.
3. **Currency confusion.** Four different counters — wood, stone, a "worker/gold" icon (used for tower upgrades), and a separate star "coins" icon (used for the tech tree) — with no tooltip or legend distinguishing them. Had to infer purpose entirely from what each UI panel's cost icon matched. Screenshot: 0003-wait.jpg through 0009-shot.jpg. Severity: medium.
4. **Build placement inconsistency.** The first two block types placed cleanly by click after selecting from the toolbar; a bigger 2x2 crate showed zero valid highlighted slots, leaving me unsure whether it needed dragging instead of clicking, or simply had nowhere to go. Screenshot: 0032-click.jpg. Severity: low-medium.
5. **"REINFORCED HAND 30" label.** Sat above the toolbar for the entire session (visible in nearly every screenshot, e.g. 0021-click.jpg) with no explanation and no response to clicking. Never resolved. Severity: low.
6. **Boss telegraph missing.** No countdown, warning animation, or health-drain-over-time was visible before the gate went from full HP to destroyed between two ~10-second checks. Screenshots: 0083-wait.jpg (healthy, wave 9 cleared) → 0085-wait.jpg (boss already at the gate, health empty). This reads as a difficulty/fairness gap as much as an information gap — a player would not know what killed them or how to react next time. Severity: high.
7. **Restart button behavior.** Clicking restart from the DESTROYED screen resumed mid-siege at wave 9 with old resources rather than clearly starting over or clearly saying "continue." Screenshot: 0089-click.jpg. Severity: medium.

## Incentive gaps
1. **Meta-progression was well-designed but poorly signposted.** The Tech Tree (permanent upgrades) and Daily Missions (coin rewards) are strong retention hooks, but neither was pointed to by any tutorial arrow — I only found them by curiosity-clicking unlabeled icons around minute 1. A first-time player who doesn't explore idly could easily finish a whole run without ever discovering them. Screenshots: 0036-click.jpg, 0044-click.jpg. Severity: medium-high (these are exactly the systems that create a reason to come back).
2. **Long flat-difficulty stretch.** Health stayed at 100% for waves 1 through 9 with no visible close calls, which is reassuring early but risks boredom for a longer session — there was little tension or feeling of "growing danger" before the boss suddenly ended the run. Severity: low-medium.
3. **No mid-run indication of what the boss fight would look like or how it differs from normal waves** (attack pattern, whether normal cannons can even reach it) before it arrived and immediately ended the run. Severity: medium.
4. Restart ambiguity (see Info Gap 7) also undercuts the "want to play again" moment — the result screen itself was motivating, but the very next click didn't clearly deliver a fresh do-over.

## What worked
- The core "place a block → watch cannons fire → survive the wave" loop was intuitive once discovered, and combat needs zero manual input, matching a casual low-effort session.
- "WAVE X HELD!" confirmation banners after every wave gave clean, satisfying positive feedback (0061-wait.jpg, 0070-wait.jpg).
- The escalation cue from "CALL WAVE" to a red "CALL BOSS" button was an excellent, unambiguous signal that something bigger was coming (0083-wait.jpg).
- The DESTROYED result screen was strong: "NEW RECORD!" badge, a numeric global leaderboard rank (#260 of 361), a resource reward, and a genuinely useful gameplay tip all in one screen (0086-click.jpg).
- The 1x/1.5x/3x speed toggle was a welcome, low-effort way to skip downtime without losing information.
- The free second cannon reward after wave 3 gave a visible, immediate sense of growing stronger (0059-click.jpg).

## Quit points
- **~0-25s (tutorial gate):** A stretch of blank loading, then several stacked "CLICK TO CONTINUE" popups and a forced click-through tutorial before wave 1 even began. A truly impatient portal browser (this persona) could plausibly have bounced here if the very first screen (0002-shot.jpg) had lasted even a couple seconds longer with nothing to click.
- **~4:47 (the boss death):** Losing from full health to zero between two checks, with no clear cause-and-effect to learn from, is the most likely real quit point for this persona — "I don't know what happened or what to do differently" is a classic close-the-tab moment even though the result screen itself tried hard to pull me back in.

## Would you play a 3rd run? (1-5)
**4/5.** The result screen's leaderboard rank, new-record badge, and resource carryover made me want to see if I could beat wave 10 next time, and the tech tree gives a clear reason to grind. The single change that would raise this to a 5: show *something* — a health bar drain, an attack animation, a warning banner — during the boss's approach so a loss feels earned/learnable rather than instant and arbitrary.

## Scorecard
- goal understood (y/n, at game time): y, ~10s (inferred by clicking the gate; never stated directly by the game)
- controls understood (y/n, at game time): y, ~45s (build placement, upgrades, call wave all pieced together by trial)
- run 1 reached (wave/level/score as shown): Wave 10 (boss), DESTROYED, Best Score 176, Rank #260 of 361
- run 2 reached (or "no run 2 — time up at X s"): no clean run 2 — restart resumed a wave-9 checkpoint rather than a fresh siege; TIME UP at ~299s of 300s while still in that continuation
- felt progress between runs (1-5, or n/a): n/a (didn't complete a distinct second run), but in-run progress (tech tree ranks, second cannon, upgrades) felt strong, ~4/5
- desire to continue when the session ended (1-5): 4
- clarity overall (1-5): 3

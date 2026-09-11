# Playtester 8 — mobile, persona: competitive teen

## Summary (5 lines max)
Tower Siege is a merge-tower-defense game where you drag/tap cards onto a vertical tower to build and merge weapons that auto-fire at incoming waves. Core loop is fun once discovered, and there's a real leaderboard rank plus a permanent "Blueprints" upgrade shop that would keep a competitive player like me hooked — but I only found the upgrade shop by accident, two full runs in, by curiosity-tapping an unlabeled icon on the death screen. There is zero tutorial or onscreen explanation for card selection, merging, placement slots, repair, "Reinforced Hand," or the continue/revive offer; everything was learned by trial and error, including once accidentally blowing most of my premium currency on a reroll I didn't understand. Both runs ended on the Wave 8 boss with an identical leaderboard rank (#320 of 361), which felt anticlimactic despite a much stronger base on run 2.

## Run 1 — what happened (timeline with game-time stamps)
- **~0-4s**: Loading screen, then straight into "WAVE 1.1, MONSTERS INCOMING!" No goal text, no menu, no tutorial. A lane is highlighted with a down arrow; bottom bar shows a VOLLEY button and 3 unlabeled cards (22/20/10 gold).
- **~5-6s**: Tapped a card by accident half-expecting to drag it; it turned out tapping a card selects it, then tapping the lane places a tower there for its gold cost. A cannon appeared, unexplained.
- **~9-17s**: Learned the "CALL WAVE" countdown gives a shrinking bonus (+12% → +1%) the longer you wait; enemies (goblins) walk in from both screen edges.
- **~34-46s**: Discovered by accident that tapping an occupied build slot MERGES the new piece with the existing one (green "x3" icon). Nothing on screen ever taught this — it's the core mechanic and I found it by misplacing a piece.
- **~46s**: Tapped "REINFORCED HAND 30" out of curiosity — no tooltip, no confirmation — and it instantly spent 30 of my ~36 star (premium) coins to reroll all 3 shop offers.
- **~74-124s**: Built up a small tower (wall/crossbow/cannon/telescope stack) through waves 2-6, occasionally confused about where a placed piece would land (merge vs. new slot vs. wrong column).
- **~124s**: Between two checks, my entire tower structure vanished except the bare door, with two enemies standing next to it — no clear "destruction" moment registered.
- **~128s**: "Destroyed!" — died on Wave 6. End screen: "You survived to wave 6," **Rank #352 of 361**, "NEW RECORD!", +44 star coins, and a green "WAVE 5 +240 [wood] — 30 [star coin]" button.
- **~131s**: Tapped the green button — it revived me at Wave 5 with restored structures and +240 gold for 30 star coins, no ad shown. Very motivating comeback moment.
- **~132-217s**: Rebuilt a fuller base (4 towers + door), reached and held Wave 7; "CALL WAVE" turned into a red "CALL BOSS" button — well-telegraphed.
- **~217-258s**: Wave 8 boss (a tree/treant monster) slowly "CRUSHED!" my towers one by one despite rebuilding.
- **RUN 1 END ~258s**: "Destroyed!" — died on the Wave 8 boss. "You survived to wave 8," **Rank #320 of 361**, "NEW RECORD!", +62 star coins. This time no continue offer, just a shopping-cart icon and a skip-forward icon.

## Run 2 — what happened
- **RUN 2 START ~259s**: Tapped the blue skip-forward icon; went straight to a fresh Wave 1. Gold reset to 90, second currency reset to 0, but **star coins persisted at 172** — confirms it's the meta/permanent currency.
- Applied lessons from Run 1: built a single tall center column instead of spreading out, which turned out to be efficient. Also confirmed cards go visibly darker/greyed when unaffordable (this explains an earlier "why won't this card select" confusion from Run 1 — it was probably just insufficient gold with no denial feedback).
- Discovered side build "satellite" plots unlock progressively (they weren't available at Wave 1 but appeared later next to the main tower).
- Held waves 1 through 7 comfortably, repairing and rebuilding between waves with plenty of spare gold (peaked around 298-300 star coins total across the run).
- **RUN 2 END ~419s**: Died again on the Wave 8 boss (same tree monster). "You survived to wave 8," **Rank #320 of 361 — the exact same rank as Run 1's final result**, despite a visibly stronger base this run. "NEW RECORD!" again, +67 star coins. This time an extra orange "3x [star coin] — 30 [icon]" button appeared above the green continue button (unexplained). I declined both continue offers here to end the run at this defeat.
- **Post-run exploration**: Tapped the previously-unexplored orange cart icon on the death screen — it opened a "BLUEPRINTS" permanent-upgrade shop (365 star coins on hand): Sharpened Bolts (+8% dmg/rank, 20 coins, unlocked) plus six visibly padlocked nodes (Braced Crates, Foundations, Bombard, Rapid Fire, Gate Armour, Spiked Wall...). A tutorial popup explained "Everything you buy here is permanent. It carries into every future run" and "Coins come from every siege, win or lose." Bought Sharpened Bolts Rank 1, which instantly unlocked the next node. This is a strong, well-designed progression system — but I never saw it flagged, badged, or mentioned anywhere during either run.

## Information gaps
1. **No goal statement at game start.** What I saw: "WAVE 1.1, MONSTERS INCOMING!" with no objective text. What I didn't understand: what "winning" means (survive forever? reach a target wave? just get a high score?). When: 0s. How long unclear: never fully explained. Screenshot: `0002-wait.jpg`. Severity: medium.
2. **Card tap-to-select, tap-to-place mechanic never explained.** I had to guess by trial (dragging first, which did nothing). Screenshot: `0004-drag.jpg`, `0005-tap.jpg`. Severity: high (this is the entire input model).
3. **Merging is undiscoverable by design intent — only by accident.** No tutorial, hint arrow, or highlight ever suggested placing a card on an occupied slot would merge it. Screenshot: `0004-drag.jpg` moment vs `0028-tap.jpg` (first merge). Severity: high — this is the core mechanic ("merge tower defense") and a player could play the whole game without ever discovering it.
4. **Unpredictable placement destination.** Tapping the same occupied slot twice gave different results once (merge) and once (stacked in a different slot above). No preview of where a piece will land before spending gold. Screenshot: `0028-tap.jpg` vs `0032-tap.jpg`. Severity: medium.
5. **"REINFORCED HAND 30" had zero explanation and instantly spent almost all my premium currency** on first tap. No confirmation dialog. Screenshot: `0022-tap.jpg`. Severity: high — this is a real-money-adjacent currency spent blind.
6. **Can't visually distinguish "I hit the enemy" from "the enemy hit me."** Both render as a burst/explosion sprite with a floating number, no consistent color-coding I could detect. Screenshot: `0034-wait.jpg`. Severity: medium — during a chaotic wave I genuinely couldn't tell if I was winning or losing at a glance.
7. **Structure destruction happens invisibly.** My whole tower vanished between two ~3s checks with no collapse animation or clear moment registered. Screenshot: `0035-wait.jpg` → `0036-wait.jpg`. Severity: medium.
8. **Cards silently do nothing when unaffordable** — no shake, no red flash, no "not enough gold" message, they just quietly stay grey. Read as a bug the first time it happened. Screenshot: `0070-tap.jpg`, `0074-wait.jpg`. Severity: medium.
9. **Side "satellite" build plots appear/disappear across waves with no explanation** of the unlock condition (wave number? gold spent? random?). Screenshot: `0067-tap.jpg` vs `0072-wait.jpg`. Severity: low.
10. **The continue/revive offer is inconsistent and unexplained** — appeared after the Wave 6 death, did not appear after either Wave 8 death, with no visible rule communicated (cooldown? one per session? random?). Screenshot: `0038-wait.jpg` vs `0065-wait.jpg`. Severity: medium.
11. **The permanent "Blueprints" upgrade shop is buried behind an unlabeled cart icon on the death screen** — the single biggest information gap in the whole session. Never mentioned, never badged, no notification dot, no in-run reference to it. Screenshot: `0095-tap.jpg`. Severity: high.

## Incentive gaps
1. **Rank shown is discouraging on a first run.** "Rank #352 of 361" (bottom 3%) right after "NEW RECORD!" sends a mixed signal — technically positive framing, but the number itself reads as "you are bad at this," which for a competitive player is more deflating than motivating on attempt #1. Screenshot: `0038-wait.jpg`. Severity: medium.
2. **Identical rank (#320 of 361) on both runs' final deaths**, despite Run 2 clearly having a stronger, taller, better-defended base than Run 1's final state. As a score-driven player this reads as "nothing I did mattered," which is deflating. Screenshot: `0065-wait.jpg` vs `0094-wait.jpg`. Severity: high.
3. **The one system that answers "why keep playing" (permanent Blueprints upgrades) is invisible for the first two full runs.** If I'd been a real player without the patience to poke every icon on a death screen, I would have quit after Run 2 with zero sense of long-term progression beyond "wave number went up sometimes." Screenshot: `0095-tap.jpg`. Severity: high.
4. **No visible power/level feedback during a run** beyond icon shape changes on merged towers — no damage numbers on the tower itself, no explicit "your tower is now level 3," nothing that says my merges are making me measurably stronger. Severity: medium.
5. **The gold/second-currency/star-coin triple economy is not explained anywhere** — I inferred star coins are the persistent one only because they didn't reset between runs. A first-time player would likely not realize this on their own. Severity: medium.

## What worked (things that were clear or motivating)
- Tap-card-then-tap-slot placement, once discovered, felt tactile and satisfying.
- The wave counter and "WAVE X HELD!" banner gave a clean, legible sense of progress within a run.
- **CALL WAVE turning red and relabeling to CALL BOSS** ahead of Wave 8 was excellent, unambiguous foreshadowing — the single best piece of UI communication in the game.
- The post-death "Destroyed!" screen with wave reached, leaderboard rank, and a counting-up currency reward is a strong, well-produced moment structurally (the execution of the rank number itself is the problem, not the format).
- The continue/revive-with-bonus offer (when it appeared) was a genuinely exciting comeback mechanic — restoring my whole base plus bonus gold for a currency cost, no forced ad.
- The Blueprints permanent upgrade tree, once found, is a well-built, clearly-explained (via its own in-context tooltips) progression system that directly answers what long-term goal a player is working toward.

## Quit points
- **~124-128s (Run 1, first death on Wave 6):** If the continue offer hadn't appeared, and given "Rank #352 of 361" right under "NEW RECORD," I think a real first-time player in my persona would have closed the tab here — the rank reads as "you're near the bottom," there's no visible reason shown to try again, and nothing on screen points to the Blueprints shop.
- **~258-259s (Run 1, second death on Wave 8, no continue offered):** With no continue and no visible next goal beyond "tap skip to restart from zero," this is the most likely real quit point of the whole session — I only continued because the task required a second run.
- **~419s (Run 2, second death, identical rank to Run 1):** Getting the exact same leaderboard rank after a visibly better run is deflating; a player without patience to explore the death screen's unlabeled icons would plausibly stop here for good.

## Would you play a 3rd run? (1-5, why, and the single change that would raise it)
**3/5.** The merge-tower mechanic is fun once you know it, the boss fights have real tension, and the Blueprints shop is a legitimately good hook — but I had to work hard to find any of that, I burned premium currency by accident, and my two deaths produced an identical score despite different amounts of effort. The single change that would raise this most: **surface the Blueprints/permanent-upgrade shop immediately after the first death**, with a highlighted button or badge, instead of hiding it behind an unlabeled cart icon — that's the actual retention engine and it's currently invisible.

## Scorecard
- goal understood (y/n, at game time): **n** — never explicitly told; inferred "survive waves" only from context, never confirmed
- controls understood (y/n, at game time): **y, ~74s** (merge mechanic) / partial understanding of tap-select-place from ~6s
- run 1 reached (wave/level/score as shown): **Wave 8 held, died to boss; Rank #320 of 361 (final, after one continue from an earlier Wave 6 death at Rank #352)**
- run 2 reached: **Wave 8 held, died to boss; Rank #320 of 361 (same as run 1's final rank)**
- felt progress between runs (1-5): **2** (star coins carried over, but I didn't understand what they were for until after Run 2 ended; identical final rank undercut the sense of progress)
- desire to continue after run 2 (1-5): **3** (would have been 4-5 if the Blueprints shop had been surfaced earlier)
- clarity overall (1-5): **2** (core mechanics — selection, merging, placement, currencies, continue rules — were all learned by trial and error with no tutorial or tooltips during actual gameplay)

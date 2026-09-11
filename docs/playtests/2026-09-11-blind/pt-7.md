# Playtester 7 — mobile, persona: puzzle/strategy fan

## Summary (5 lines max)
A tower-defense/tower-building hybrid where you drag/tap cards to stack blocks (cannons, bows, walls) on 3 columns that auto-fight waves of enemies. Core loop is legible after 3-4 waves of trial and error, and a genuine merge/combo flourish ("x3" tag) plus a permanent meta-progression shop ("Blueprints") landed well for a puzzle/merge fan once I found them. But almost nothing is explained on-screen: no tutorial, no button tooltips, no HP numbers, the card-selection mechanic and the "which column is threatened" arrow are never stated, and the entire meta-progression shop (the whole point of the star currency) is hidden behind an unlabeled cart icon on the death screen. Both runs ended in real defeats (wave 11, then wave 8); I would have closed the tab around the 45-second "stalled" wave 11 fight if I hadn't found the hidden speed toggle.

## Run 1 — what happened (timeline with game-time stamps)
- **~0s (first impression):** Wave 1.2, "MONSTERS INCOMING!" banner with a downward arrow highlighting the left lane. Top bar shows three unlabeled currencies (90 / 0 / 0). Bottom bar has a VOLLEY button and three cost cards (22/39/20). No goal statement, no instructions.
- **~5-10s:** A bat-like enemy flies down the highlighted lane. I tap VOLLEY blind — nothing visibly happens (later learned it needs a cooldown/charge).
- **~11s:** "WAVE 1 HELD!" appears with zero input from me — confusing, since I hadn't built anything or clearly done anything.
- **~15-60s:** I discover by trial and error that tapping a tray card selects it (blue border) and tapping a column then places that block type in the next empty slot, costing the shown currency. Stacking 3 identical crates produced a green "x3" combo tag — a genuinely fun surprise for a merge-fan, but never explained.
- **~130s:** First "REPAIR ALL" button appears after Wave 2, revealing that blocks take invisible damage (no HP bar was shown during combat).
- **~150-165s:** Wave 8 gets tough: a wolf/elk-type enemy destroys my entire left column, including a block I placed mid-fight that got "CRUSHED!! 1044" instantly. Real stakes, real tension — this was the most engaging moment of Run 1.
- **~170-215s:** Wave 8 held after losing/rebuilding the column. "CALL BOSS" button replaces "CALL WAVE" — clear, motivating escalation signal.
- **~260-303s:** Wave 11 appears stuck: 2 remaining enemies (a standing knight, a hovering bird) don't move or attack for 45+ seconds of game time at normal speed. I nearly wrote this off as a hard stall/bug and considered quitting. Discovered the 1.5x speed toggle (bottom-right, never highlighted or explained) only now — flipping it made the fight resolve immediately, suggesting this was just very slow real-time pacing, not a bug, but it read exactly like one.
- **~303s: RUN 1 END.** "Destroyed!" screen: "You survived to wave 11," "Rank #316 of 361," "New record!," +145 star currency.

## Run 2 — what happened
- Tapped the blue skip-forward icon on the death screen, which silently started a brand-new run at Wave 1 — no confirmation, no summary of what carried over. Noticed the star currency (195→340) persisted through death, a good progression signal, but its purpose was still unexplained at this point.
- Applied Run 1 lessons immediately: proactively built defenses in the highlighted lane at Wave 1 instead of waiting, noticed the highlighted "incoming" lane changes column each wave (inferred, never stated).
- Played faster and more confidently through waves 1-7, using VOLLEY on cooldown, repairing and rebuilding between waves, buying "REINFORCED HAND" once for a card-quality refresh.
- Wave 7 held, "CALL BOSS" appeared again.
- **Wave 8:** a tree-monster attack tore down the left column again; this time the tower didn't recover in time.
- **~430s: RUN 2 END.** "Destroyed!" — "You survived to wave 8" (worse than Run 1), same "Rank #316 of 361" shown (looked static/possibly stale — no visible change despite a worse run), +59 star currency (lower reward, sensible but unexplained).
- **Between-runs exploration:** tapped the previously-unexplored cart icon on the death screen and found the "BLUEPRINTS" shop — a permanent meta-progression tree (Sharpened Bolts, Braced Crates, Foundations, Bombard, Rapid Fire, Gate Armour, Spiked Wall, Lumber Hut, Lightning Coil…) bought with the star currency, with onboarding tooltips explaining "Coins come from every siege, win or lose. This is where you spend them" and the gold/blue/dim afford-ability color coding. I bought "Sharpened Bolts" rank 1 for 20 stars. This was the single clearest, most rewarding moment of the whole session — and I only found it by chance, two full runs in.

## Information gaps
1. **No stated goal at any point.** I never saw a sentence like "defend the tower from waves of monsters" — I inferred it entirely from the "MONSTERS INCOMING!" banner and trial and error. Screenshot: `0001-shot.jpg`. Stayed unclear the whole session (never resolved). Severity: high.
2. **Card selection / placement mechanic never explained.** Figuring out that tapping a tray card "selects" it (blue border) and tapping a column places it there cost me roughly 4 waves (~60s) of confused taps, including one where I tapped a placed block hoping for an inspector popup and instead accidentally triggered a placement elsewhere. Screenshots: `0019-tap.jpg` through `0027-tap.jpg`. Severity: high.
3. **No tooltip/inspector for placed blocks.** I tapped bow, cannon, wall and crate blocks repeatedly hoping for a description of what each does (damage type, range, HP) and got none, ever, in either run — I had to guess purely from visuals (cannon = fires at ground enemies, bow = ranged, wall/crate = plain HP). Screenshot: `0025-tap.jpg`. Never resolved. Severity: high.
4. **No visible HP numbers on tower blocks**, only thin colored bars that appear after damage (green/yellow/red), and only sometimes. I could not tell how close a block was to being destroyed until it was already gone. Screenshot: `0039-wait.jpg` (a block vanishes between two consecutive screenshots with no clear warning). Severity: medium.
5. **Three top-bar currencies never labeled.** Bricks (used for building), a puzzle-piece icon (used for repair/reinforced hand), and a star/coin icon (meta-currency) are shown from second 1 with no names or icons explained. I inferred their roles only through spending them. Screenshot: `0001-shot.jpg`. Stayed unclear ~430s until the Blueprints shop explained the star currency. Severity: high.
6. **"REINFORCED HAND" and its gold-glow effect on cards were never explained** — I could tell something changed (new items, gold borders) but not why it's good or what "reinforced" means mechanically. Screenshot: `0018-tap.jpg`. Never resolved. Severity: medium.
7. **The "incoming" lane-highlight arrow's meaning was never stated.** I inferred (from repetition across two runs) that it marks the column under the heaviest threat, worth reinforcing, but the game never says so. Screenshot: `0072-wait.jpg`. Severity: medium.
8. **1.5x speed toggle is unlabeled and undiscovered for 280+ seconds.** It sits in the bottom-right corner with no call-out, no default recommendation, and no explanation of what it changes. Finding it fixed what looked like a stalled/broken game. Screenshots: `0066-wait.jpg` (stuck), `0067-tap.jpg` (found the toggle). Severity: high.
9. **Wave 11's final 2 enemies appeared frozen for ~45 seconds of game time**, not approaching or attacking, with my own defenses also not firing at them (I had no attack blocks left). Whether this is intended slow pacing or a genuine stall, the player experience is identical: nothing to do, nothing happening. Screenshots: `0062-wait.jpg`, `0065-wait.jpg`, `0066-wait.jpg`. Severity: high.
10. **The meta-progression "BLUEPRINTS" shop is hidden behind an unlabeled shopping-cart icon on the death screen only**, with zero in-run mention that it exists or that the star currency is for it. A player who doesn't experiment with every icon on the death screen (most casual players won't) never discovers the game's actual permanent-progression system. Screenshot: `0089-tap.jpg`. Took 430 seconds / 2 full runs to discover. Severity: high.
11. **Rank number ("#316 of 361") looked identical after two very different runs** (wave 11 vs wave 8 finish), which reads as a static/fake placeholder rather than a real leaderboard rank, undermining trust in the number. Screenshots: `0069-wait.jpg`, `0088-wait.jpg`. Severity: medium.

## Incentive gaps
1. **No visible "next unlock" or goal to chase during a run.** Waves just count up; there's no stated milestone ("reach wave 15 to unlock X") to pull me forward beyond curiosity about the next wave's difficulty. The "CALL BOSS" button was the one exception and it worked well as a hook. Severity: medium.
2. **The star currency's purpose was invisible for the entire first two runs.** Since it's the core meta-progression resource and the shop that spends it is the game's actual retention hook, hiding it behind an unlabeled cart icon means most of the incentive structure is invisible exactly when it matters most — the first session. Severity: high.
3. **Death screen reward numbers (+145, then +59) are unexplained** — no breakdown of what wave/kills/time contributed, so the reward doesn't feel earned or strategic, just a number that appears. Severity: medium.
4. **Repeated resets to Wave 1 with the same slow opening pacing.** Both runs began with the same near-static ~10-15 seconds (arrow, banner, one enemy trickling in) before anything meaningful happens — for a second/third run this drags rather than rewarding returning-player momentum (e.g., no faster early-wave pacing, no acknowledgment of previous progress at the start of a new run). Severity: medium.
5. **No comparative feedback ("worse than last time" / "your best: wave 11")** shown on the Run 2 death screen despite Run 2 objectively doing worse (wave 8 vs wave 11) — the flat repeated "Rank #316 of 361" undercuts the sense that my second run mattered. Severity: medium.

## What worked (things that were clear or motivating)
- The "x3" combo tag when stacking identical blocks was immediately satisfying and on-brand for a merge/match player — clearest positive moment in Run 1.
- "CALL BOSS" replacing "CALL WAVE" was an unambiguous, well-communicated difficulty/story escalation cue.
- Visible, chunky damage numbers and gold pickups ("+18", "+9 +2") during combat gave good moment-to-moment feedback that actions were doing something.
- The BLUEPRINTS shop, once found, was well-explained via its own three-step tooltip sequence (unlike the rest of the game) and the gold/blue/dim afford-ability coding was intuitive on sight.
- Star currency persisting through death (and growing from combat kills, not just wave completion) is a good, standard "always be earning something" hook.
- Losing a whole tower column mid-fight (Wave 8, Run 1) and racing to rebuild it created genuine tension — the best "I want to see how this turns out" moment of the session.

## Quit points (moments a real player like you would likely have closed the tab)
- **~260-303s (Run 1, Wave 11):** the apparent stall with 2 unmoving enemies for 45+ seconds at default speed. Without stumbling onto the 1.5x toggle, I would have assumed the game froze or bugged out and closed the tab here. This is the single clearest churn risk in the whole session.
- **~0-15s (both runs' openings):** if I hadn't been instructed to persist, the total absence of any stated goal or instruction in the first 15 seconds ("what am I even trying to do?") is a plausible early bounce point for a portal player used to a one-line objective banner.

## Would you play a 3rd run? (1–5, why, and the single change that would raise it)
**3/5.** The combo/merge flourish and the Blueprints shop are genuinely appealing to me as a puzzle/strategy player, and losing towers mid-fight has real tension — but I only discovered both of those by accident, very late, and the apparent Wave-11 stall nearly made me quit outright. The single change that would raise this most: surface the Blueprints shop and star-currency purpose immediately after Run 1's very first death (not buried behind an unlabeled cart icon), since that's the system that actually explains why to keep playing.

## Scorecard
- goal understood (y/n, at game time): **n** — never explicitly stated; inferred only from the "MONSTERS INCOMING!" banner at ~0s and confirmed by playing.
- controls understood (y/n, at game time): **y, ~60s** — card-select-then-tap-column mechanic understood only after several waves of trial and error.
- run 1 reached (wave/level/score as shown): **Wave 11 (Rank #316 of 361, "New record")**
- run 2 reached: **Wave 8 (Rank #316 of 361, same rank shown)**
- felt progress between runs (1–5): **3** — star currency visibly carried over and grew, but its purpose was hidden until after Run 2.
- desire to continue after run 2 (1–5): **3** — boosted specifically by finding the Blueprints shop right at the end; would have been a 1-2 without that discovery.
- clarity overall (1–5): **2** — almost every mechanic (currencies, card selection, block roles, HP, lane-highlight meaning, speed toggle, shop) had to be reverse-engineered with no in-game explanation.

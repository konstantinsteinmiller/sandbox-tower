# Blind Playtest #5 — Tower Siege

Game time budget used: ~148.5s / 180s. Desktop, 1280x720.

## 1. Persona & first 30 seconds

First frame (shot 0001, t=1.5s) reads as a night-time tower-defense castle screen: a health bar top-left (4 red segments, full), a resource bar top-center (wood/stone/gold-looking icons: 120/40/0), and a card tray at the bottom with a tutorial arrow forcing my hand onto a highlighted "REINFORCED HAND" card. My first assumption: this is a Kingdom-Rush-style tower defense with a merge/deck-building twist, played from a fixed side-on castle view.

What I tried first was exactly what the arrow told me to try — click the card, click the glowing tile it wanted, watch a forced "before/after" comparison screen (-10% vs -75% damage reduction) explaining that a basic cannon becomes a reinforced one. Every single action in the first ~35 seconds was scripted by an arrow; I had zero freedom and zero real choice. The tutorial did not let me fail or wander.

## 2. Funnel timeline

| Milestone | Game-second | Notes |
|---|---|---|
| First frame of real gameplay | 14.5s (shot 0010) | Wave 1 spawns, "Enemies: 8" counter, cannon auto-fires |
| First input that affected the board | 3.7s (shot 0003) | Placing the tutorial-forced Reinforced Hand cannon (still scripted, not a free choice) |
| First **unforced** input affecting the board | 37.2s (shot 0023) | Placed a Stone Block on my own initiative after the tutorial let go |
| Core loop performed unaided | 37.2s (shot 0023) | Same as above — place a block, spend a resource, watch it auto-fight |
| Meta/progression layer visible | 40.5s (shot 0026-0027) | Accidentally opened the Tech Tree modal (mis-clicked what I thought was a speed toggle) — "Everything you buy here is permanent. It carries into every future run." |
| First moment of genuine tension | **Never** | See section 5 |
| First failure | **Never** | Base HP bar never dropped from 100% across 8 waves / ~150s |

## 3. Quit moment

There is no dramatic quit moment because nothing dramatic ever happens. The honest answer: a real acquired player closes the tab around **t=110–130s** (somewhere in the Wave 4–6 "HELD!" banner loop, e.g. shot 0063/0066/0068), not out of frustration but out of total disengagement — the fourth identical "WAVE N HELD!" banner in a row with a still-full health bar and a pile of unspent resources is the moment a portal player thinks "I already know how this ends" and bounces. There was no rage-quit candidate because the game never generated rage, fear, or urgency — only mild administrative busywork (place block, watch numbers, click continue).

Closest thing to a "wait, this is it?" moment: shot 0075 (t=148.5s), Wave 8 HELD, health bar still pristine, resource counts sitting at 229/160/172 with nothing costing anywhere near that much. That's the moment I'd have closed the tab if this weren't a timed test.

## 4. Boredom / flatline log

- **t≈42–54s** (shots 0044-0046): 15+ seconds of pure countdown-watching between waves 2 and 3 — no enemies, no animation, just the "CALL WAVE 0:14 → 0:00" timer ticking down while I had nothing left to buy. Logged live as a note at the time.
- **Every "WAVE N HELD!" banner** (shots 0032/0039/0050/0063/0066/0068/0075): identical layout, identical full health bar, differing only in the % bonus number. By wave 4 this is visually indistinguishable from wave 8 — no escalation signal, no new enemy silhouette worth reacting to until the wolf/bear-type enemies quietly appeared around wave 6-7 (shot 0068/0069) with no callout or fanfare.
- **Resource bar climbing with nothing to spend on**: by t=148.5s wood/stone/food sat at 229/160/172 while towers cost 20-64 and the one deep tech-tree node I could afford was 20 coins. The economy is not remotely a constraint after wave 3 — there's no meaningful decision about what to build next because you can afford almost everything.

## 5. Tension curve

The base health bar (top-left, 4 red segments = presumably the Gate's 300 HP, confirmed via the Gate inspector panel in shot 0034) **never moved once** in 8 waves and ~150 seconds of continuous play, including two waves of 19-21 enemies. Individual towers and wall segments took visible damage (green mini health-bars over structures, one wall segment was fully destroyed and required a 5-currency "repair" click at shot 0019), but that never once threatened the core health total shown to the player. There was no wave, no enemy type, and no moment across the entire test where I doubted the outcome. On a scale of "will I survive this," the game sat at a flat 10/10 confidence the entire time. A blind, first-time player gets no signal that losing is even possible.

## 6. Decisions or dominated choices

- **Which card to buy from the tray** — largely a dominated choice: every early card (Archery, Stone Block, Lightning Coil, Wood Crate) is strictly additive to defense with no trade-off communicated (no "this weakens X to strengthen Y"), and resources vastly outpace costs, so the real answer is "buy everything, in any order." Not a decision, a checklist.
- **Where to place a block** — this looked like it could be a real spatial puzzle (Tetris-style pieces, rotate Q/E), but I was never punished for placement — no enemy ever breached because of a gap, so the puzzle layer never got to matter in the tested window.
- **Tech tree node purchase** — the one place with real branching (3 visible branches, ~40 nodes) and a genuine "what do I commit currency to permanently" choice. But it's introduced far too early (wave 2, before the player has any sense of what matters) and the first node's own tooltip contradicts itself (see bug list) — undermining the one authentic decision point in the build.
- **Call Wave early vs. wait for timer** — a real but low-stakes decision; I never found a reason to wait since nothing was gained by delaying and the countdown itself is a boredom sink (section 4).

## 7. Bugs & inconsistencies

- **Tech tree math self-contradiction** (shot 0056, t=93.7s): the "Foundations" node reads "Every tower block starts with +6% HP" directly above "At rank 1: +50% total." A player cannot reconcile +6% (implied per-rank) with +50% (actual rank-1 total) — one of these numbers is wrong or mislabeled.
- **Two visually-identical currencies**: the top-right star-coin icon and the top-center third resource icon (brown food/plank-looking icon) are both round token icons with no text label distinguishing them, yet they are spent in completely different systems (star-coin = permanent tech tree; the other = the "instant repair" prompt and presumably a card cost). I confused them in the field notes myself at t≈33s (shot 0019) — a first-timer will too.
- **Ambiguous speed-control icon**: the green diamond icon sitting directly beside the 1x/1.5x/3x speed buttons (shot 0025/0026) is actually the Tech Tree entry point, not a speed control. I clicked it expecting a 4th speed tier and instead got a full-screen permanent-upgrade modal mid-wave. No tooltip on hover, no visual differentiation from a speed button.

## 8. Unreadable / unclear

- **"REINFORCED HAND 30" label** hovering above the tray persisted for 3+ waves after I'd already bought and merged the card it refers to (visible in shots 0033-0075) — looks like a stale tutorial nudge that never dismisses, actively misleading since the card in that slot had long since changed.
- **The Gate's HP total (300/300, shown in shot 0034) vs. the top-left health bar (4 discrete segments)** — there's no numeric readout tying the segmented bar to the 300 HP figure; a player has to open the Gate panel manually to learn what "full health" even means in absolute terms.
- **Tech tree node icons** are tiny (≈24px), monochrome, and unlabeled outside the single selected node's tooltip — with ~40 nodes on screen simultaneously (shot 0027/0055), there's no way to scan the tree and understand the build's shape without clicking every single node.
- **Card tray icon changes silently** after a purchase (e.g., shot 0022→0023, the Stone Block slot became a different icon with no explanation) — unclear whether this means "sold out," "on cooldown" (there is a small circular cooldown icon top-right of each card, never explained), or "replaced by a new offer."

## 9. Portal verdict

**No — this would not hold a first-time player for 3 minutes on CrazyGames/Poki.** The single reason: there is no failure state visible or threatened anywhere in the tested 150-second window across 8 full waves, so the core defense-genre promise ("protect your base or lose it") never pays off, and by the third identical "WAVE N HELD!" banner the player has no reason to expect the next click to matter. A 3-minute portal gate needs an early scare or a near-loss to sell the second session; this build offers neither.

## 10. Top 3 changes, ranked by expected retention impact

1. **Make the base health bar move.** Either raise incoming damage or reduce starting defense so that by wave 3-4 a first-timer sees a real dent in the health bar and feels a spike of adrenaline. Right now "Medium/balanced" difficulty (confirmed in Settings, shot 0071) produces a game that cannot lose in the tested window — that is the single biggest retention risk in the build.
2. **Compress or delay the Tech Tree reveal.** Dumping a 40-node permanent meta-progression screen on the player at wave 2 (t=40s) before they've even seen a threat is overwhelming and premature; it also contains a numeric self-contradiction (item 7) that will erode trust in every other number in the game. Gate it behind wave 5+ or a clear "new!" callout with 3-5 starter nodes only.
3. **Fix the ambiguous speed/tech-tree icon collision and the stale tutorial label.** Both are small UI-polish items but both actively mislead: one causes an unwanted full-screen interrupt mid-combat, the other keeps pointing at a card that's already been resolved. Cheap fixes, real first-session friction removed.

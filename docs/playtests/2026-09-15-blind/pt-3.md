# Blind Playtest #3 — Tower Siege

Persona: 15, hundreds of hours in Bloons TD 6 / Kingdom Rush / PvZ. Here for strategy and numbers.
Budget used: 137.5 game-seconds of the 180s allowance (stopped early — the data had already flattened out).

## 1. Persona & first 30 seconds

First frame (`0001-wait.jpg`, sec 1.5) is a "MONSTERS INCOMING!" banner over a castle wall with goblins already visible on both sides, a build tray at the bottom, and a big yellow arrow pointing at a tray slot labeled "REINFORCED HAND 30." I assumed this was a standard lane tower-defense (à la Kingdom Rush) — build slots on a wall, enemies walk in from both edges toward a central gate.

First thing I tried: hover every tray icon to see what it does before spending anything, because in a real TD the first tower choice is the first real decision. Slot 1 gave a genuine tooltip (Cannon, 60 HP, 16 Damage, splash, cost) — good sign. Slot 2 gave nothing on hover even after 800ms (locked, no preview). I placed the cannon, which immediately triggered an unexplained "-10% vs -75%" comparison screen with no labels (`0006`–`0008`, sec 8.9–12.8) before I'd even seen combat. That was my first bad sign: a system firing at me before I understood the base game.

## 2. Quit moment

I never rage-quit, but the moment a real me would have tabbed out is **sec 106.6** (`0058-wait.jpg`): "WAVE 4 HELD! +27%", 20 enemies spawned and killed, and the castle health bar (top-left, 4 red segments) had not lost a single pixel. That's the point where "let's see if this gets harder" stops being curiosity and starts being obligation. I kept going another 30 seconds purely to confirm the pattern (waves 5, 6, 7 — all zero damage, `0060`, `0062`, `0064`–`0066`), and it never broke. If I weren't testing this for a report I would have closed the tab at wave 4.

## 3. Boredom log

- **sec 38.5–42.9** (`0028-wait.jpg`): Wave 1 already held, nothing on screen but idle towers and a stuck "REINFORCED HAND 30" label. No prompt, no timer visibly doing anything useful, just waiting.
- **sec 99.6–103.6** (`0056-wait.jpg`): mid Wave 4, "ENEMIES 8" but literally nothing visible on screen — no enemies in frame, no projectiles, just towers standing still for a full 3+ seconds of watched time.
- **sec 53–137.5, roughly 85 of the last ~100 seconds**: once I had 5 towers down (by sec 90) the entire rest of the session was "click Call Wave → watch numbers scroll → Wave Held → repeat." Waves 2 through 7 required literally zero input from me beyond the Call Wave button and occasionally clicking a reward popup. That is the majority of the play session spent as a spectator.

## 4. Did my decisions matter?

- **Tower type choice (Cannon / Archery / Mortar):** tooltips actually differentiate them on paper — Cannon is slow/splash ("melts packed crowds"), Archery is fast/single-target and explicitly "hits fliers," Mortar is long-range arcing but "cannot hit fliers" (`0014`, `0019`). That's a real rock-paper-scissors setup. But I never once needed to use it — every combination I placed cleared every wave with zero damage taken, so the tradeoff was never tested by the game itself. A choice that's never wrong isn't a choice.
- **Cannon upgrade (24→37 gold):** real, visible stat increase — HP 120→156, Damage 48→59, Armour 0→1 (`0010` vs `0012`). Good, legible number-crunching.
- **Gate upgrade (8→12 gold):** also real — HP 300→390, Armour 3→4 (`0039` vs `0040`). But I triggered this by accidentally misclicking what I thought was a panel's close button (the panel had shifted position between screenshots). Worked out fine, but it was luck, not intent.
- **"Reinforced Hand" (30 gold, +75%/+50% buff):** real economic choice, real cost, real effect on tray badges (`0045`–`0046`). But it took **68 seconds** of the label sitting on screen with zero affordance before I even realized it was clickable (see section 6).
- **Merge system (2 identical towers → stronger merged tower):** entirely automatic, no player input, decided for me the instant I had two cannons in range of each other. Not a choice, just a windfall — but it was *presented* as a choice-looking screen (two stat cards side by side, one glowing blue as if "better"), which is actively misleading the first time you see it.
- **Health bar / actual threat:** never moved. Not once, across 7 waves and roughly 90 enemies killed on screen. I bought upgrades and placed towers with completely free money — wood/stone/gold all climbed continuously (ended at 290 wood / 182 stone / 139 gold) with nothing meaningfully competing for it.

**Verdict: no choice I made was ever punished or rewarded in a way I could observe**, because there was no failure state anywhere near reach. Every tower placement, every upgrade, every "wrong" option (not upgrading, not buying the buff) would have looked identical on the health bar.

## 5. Bugs & inconsistencies

- **White rendering glitch on tower placement** — placing the Mortar produced a solid white box over the wall segment for at least one frame (`0022-wait.jpg`, sec 32.2), before resolving to a plain wall (the Mortar itself didn't even appear to have been placed at that point — see next bug).
- **Placement sometimes silently fails** — clicking a highlighted (red-bordered) grid cell after selecting a tower from the tray does not reliably place it. I had to reselect and reclick the Mortar three separate times (`0020`→`0026`, sec 29.4–37.1) before it actually got built. No error message, no sound, no shake — the game just... didn't do it, with no way to tell success from failure except checking the gold counter.
- **Placement mode gets stuck "on"** — after successfully placing the Archery tower, the ghost preview kept following my cursor (including onto the water, an invalid tile, still shown in red) for multiple actions afterward. Right-click didn't cancel it; clicking empty space didn't cancel it. Only re-clicking the same tray slot toggled it off (`0030`–`0034`, sec 44.4–50).
- **A "reward" button that's actually a purchase** — a green "+5" button appeared after Wave 1 with no label. Clicking it *dropped* my gem-like currency from 9 to 4 (`0026` vs `0027`, sec 37.1→38.5) — it cost 5, it didn't give 5. No confirmation dialog for what reads exactly like a free-reward icon.
- **Icon draw bug after buying the buff** — right after purchasing "Reinforced Hand," tray slots 1 and 2 rendered as blank vertical gold lines instead of their icons (`0046-wait.jpg`, sec 73.3).
- **UI panels shift position between opens**, which directly caused a misclick: I aimed for a panel's "X" close button and instead hit the "UPGRADE" button underneath because the panel had grown taller since the previous screenshot (`0039`→`0040`, sec 62.9–64.6).
- **A resource appeared out of nowhere before combat even started** — the third currency (crate icon, distinct from wood/stone and from the top-right star-coin) jumped from 0 to 24 during the very first tower-placement animation (`0009`→`0010`, sec 12.8–14.3), before any enemy had been killed. Never explained what generated it.

## 6. Unreadable / unclear

- **"REINFORCED HAND 30"** sat on screen, unstyled (no button border, no background) from **second 2 to second 70** before I discovered by blind-clicking that it's an actual purchasable ability. For over a minute of play I logged it as a stuck tutorial artifact/bug, not a feature — it has zero visual affordance as an interactive element.
- **The merge comparison screen** (`0006`–`0008`, sec 8.9–12.8) shows two cards with "-10%" and "-75%" and no label for what stat is being reduced (reload time? recoil? nobody knows), framed to look like a choice ("CLICK TO CONTINUE") when it's actually just a non-interactive reveal of an automatic merge.
- **"MERGED 2x · 2x1"** tag on the tower detail panel (`0010`, sec 14.3) has no tooltip and uses cryptic shorthand I never fully parsed.
- **Four separate currencies** (wood, stone, a crate-icon resource, and a star-icon "gold" in the top-right) are never given text names anywhere I found, and none of the resource icons produced a tooltip on hover.
- **The reroll/shuffle icon** bottom-right of the tray (had a red "1"/"2" badge at various points) never produced a tooltip on hover (`0067`, sec 137.5) — I still don't know what it does.
- **Locked tray slots show nothing on hover** — you can't preview an unowned tower's stats before it unlocks, so there's no way to plan ahead.

## 7. What kept me playing

Honestly, mostly professional obligation past wave 4. The one genuine hook was the tower tooltips themselves — Cannon/Archery/Mortar read like they'd support real positioning decisions (splash vs. single-target vs. anti-air vs. can't-hit-fliers), and watching damage numbers stack ("555" at sec 128, `0064-wait.jpg`) has a little bit of number-crunching satisfaction. I also stayed curious whether the wave-count ramp (8→9→20→12→14→11 enemies) would eventually threaten the gate — that curiosity is the only reason I pushed past the wave-4 quit point, and it was never rewarded.

## 8. Top 3 changes

1. **Make the health bar move.** Seven waves and ~90 kills with zero damage means the tower-choice tooltips are decoration. Either raise enemy pressure or lower starting tower power until a wrong build actually costs HP.
2. **Fix placement feedback.** Silent placement failures, a placement-mode ghost that gets stuck, and a "reward" button that's secretly a purchase are all the same underlying problem: the game doesn't tell me whether my click did what I think it did. Every build/buy action needs a clear success/fail signal.
3. **Give "Reinforced Hand" (and the merge system) actual UI.** An unstyled label with no border sitting on screen for over a minute before I realize it's clickable is a real lost mechanic. The merge reveal screen should either be an actual choice or clearly framed as "here's what just happened," not something that looks like a decision but isn't one.

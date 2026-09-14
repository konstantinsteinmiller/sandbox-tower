# Blind playtest — 2026-09-14 — "bored 10–15 year old"

Three Sonnet testers, desktop, **3 minutes of game time each**, briefed to play
as an impatient teenager and to name the exact second they would have closed
the tab. Run against the working tree of 2026-09-14, which already includes
that morning's **opening vanguard** (monsters standing on the field from the
first frame) and the second-wave pointer nudge.

Raw logs: `pt-1.md`, `pt-2.md`, `pt-3.md`. Harness and method: `harness/README.md`.

---

## The one-line finding

> **All three testers played 5–9 waves and the Gate never took a single point of
> damage.** Two of them named that as the reason they were done.

This is not bad luck in three samples. It is deterministic, and it is worse
than "the early game is easy".

---

## The measurement that settles it

A policy sim over the real simulation, six waves, first session, scripted fort
plus the tutorial's own merge:

| Wave | **Builder** (places a piece each build phase) | **Careless** (places nothing) |
|---|---|---|
| 1 | 7 enemies · Gate **100 %** · blocks 5 → 5 | 7 enemies · Gate 100 % · 5 → 5 |
| 2 | 6 enemies · Gate **100 %** · blocks 7 → 7 | 5 enemies · Gate 100 % · 5 → 5 |
| 3 | 14 enemies · Gate **100 %** · blocks 10 → 10 | 12 enemies · Gate 100 % · 5 → 5 |
| 4 | 18 enemies · Gate **100 %** · blocks 12 → 12 | 15 enemies · Gate 99 % · 5 → **4** |
| 5 | 19 enemies · Gate **100 %** · blocks 15 → 15 | 14 enemies · Gate 93 % · 4 → **3** |
| 6 | 17 enemies · Gate **100 %** · blocks 15 → 15 | 13 enemies · Gate 68 % · 3 → 3 |

Read the two columns against each other. **The engaged player is the one who is
never in danger.** Building ten extra blocks across six waves bought a flat
100 % Gate and zero losses; the player who ignored the game entirely is the only
one who ever saw the health bar move.

`adaptiveFactor` prices each wave against the tower it measures. That is correct
at wave 15 and inverted at wave 3: **it converts engagement into safety, and
safety into boredom.** Every hour spent on better teaching is spent persuading
players to opt into the version of the game with less tension in it.

This promotes `onboarding-roadmap.md` **#6 (first-blood floor)** from "the
biggest single item in the file" — which was an argument — to the measured
top of the list.

---

## Quit points

| | Persona | Quit | What they were looking at |
|---|---|---|---|
| **pt-3** | 13, portal browser, five tabs open | **20 s** | Still on tutorial popups. No monster had appeared. |
| **pt-2** | 14, tower-defence player | **121 s** | Wave 5 held, ~65 enemies, zero damage. |
| **pt-1** | 11, Roblox/Brawl Stars | *never* (closest ≈ 62 s) | Tech tree: 40 icons, 10 coins, nothing affordable. |

pt-1 is the outlier worth reading carefully: they did not quit, and their reason
is **spectacle, not engagement** — "explosions with floating damage numbers at
3× speed", the flying chest, the day/night sky. They stayed for the screensaver.
That is a thin thread to hang retention on, and it is the one currently holding.

---

## Three failure clusters

### 1. The opening is a slideshow (0–33 s)

pt-3 reached **20.3 s having seen no enemy at all**, and quit. pt-1 called
5–24 s their worst boredom stretch: *"it's not a game yet, it's a slide deck…
I just mashed click to continue."*

pt-3's first wave did not begin until **33 s**. Both testers named that first
wave as the first moment the game felt real.

→ Roadmap **#1** (tutorial during the fight), **#2** (move `mergePower` out),
**#4** (cut eight beats to three), **#5** (three seconds of premise).

### 2. There is no danger, ever

pt-2 is the cleanest statement of it, and they are the target player — a
14-year-old who plays this genre by choice:

> *"Not because nothing was happening — stuff was always exploding — but
> because nothing I did seemed to be under any pressure… It's a slot-filling
> loop, not a battle I'm fighting."*

And on whether their upgrades mattered:

> *"I could never tell… The base took zero damage whether my towers were
> upgraded or not, across 9 straight waves. The missing feedback is a failure
> state or a near-miss — some sign that a weaker build would have actually
> lost."*

→ Roadmap **#6** (first blood), **#12** (tap-to-damage), **#13** (combo meter).

### 3. Dead air between waves

Named independently by two testers who never saw each other's sessions:

- pt-1: **92–98 s** and **130–140 s** — *"staring at a number ticking down with
  nothing to click."*
- pt-3: **132–144 s** — *"the build screen just sat there… nothing to click that
  changed anything."*

`DESKTOP_RULES.waves.earlyBuildMs` is `[]`, so every build phase is the full
15 s. The phone board already ships `[4_000, 6_000, 8_000]`.

→ Roadmap **#7** (shorter early windows — one line), **#8** (auto-shrink a
build phase the player ignored).

---

## Two bugs the roadmap does not cover

These are not design opinions. Both were hit by multiple testers, and both are
taxing the exact 30 seconds the game can least afford.

### A. The tutorial cards replay

**Evidence.** pt-3: *"the merge chart and the damage-comparison card each showed
twice, identical."* pt-1: *"a merge chart pops up twice"*, and again at 47–53 s
*"went through the SAME merge-chart tutorial screen a second time."* Confirmed
from the screenshots: `MergePowerDemo`'s comparison is on screen at **game
8.0 s** and again at **17.8 s** — 9.75 s apart, against a demo that auto-finishes
at `B_END = 6000` ms. Resources fell 95/30 → 70/20 in between, so the player was
placing blocks while it was up.

**Mechanism (code-grounded, not yet reproduced in a test).** `GameScene`:

```ts
const completeTutorialStep = (step: TutorialStep): void => {
  if (tutorialStep.value !== step) return   // silent no-op
  advanceTutorial()
}
```

`tutorialStep` is null whenever `inFirstStage` is false — `showResult`,
`isAnyModalOpen`, or `wave > 1`. `MergePowerDemo` finishes on its **own rAF
timer** and calls this. If that instant lands while the step is masked, the
index never advances, nothing retries, and the card remounts and replays from
`clockMs = 0`. The click-dismissed `MergeGuide` has the same hole.

**Fix shape:** latch the completion by index rather than by liveness — advance
if `TUTORIAL_STEPS[tutorialIndex] === step`, independent of `inFirstStage`.

> **Fixed 2026-09-14.** `completeTutorialStep` now latches on the index. The
> index is the tutorial's actual position; whether the overlay happened to be on
> screen at that instant was a rendering question that never governed whether
> the lesson was performed.

### B. The gift card cannot be placed — and this is the second round it has happened

pt-1 (109–115 s): *"Tried to place the free cannon like 3 times, clicked all
around the tower, no red squares ever showed up. Never figured out why."*
pt-3 (44–65 s): *"it visually got stuck following my cursor as a red ghost
outline through several clicks."*

The comment above `giftAnchors` in `src/use/useGifts.ts` records the previous
round: *"both blind-playtest testers who held a gift gave up on it."* The
anchor-socket work was the fix for that. **Two of three testers have now hit it
again** — four testers across two rounds, on the same object, after a fix.

Worth noting `placeGiftAt` refuses on `canAffordCost(giftPrice(gift))` while
`giftAnchors` does not consult price at all, so an unaffordable gift can show
sockets that reject every tap. Not confirmed as the cause here; it is the first
place to look.

> **Fixed 2026-09-14**, and the cause was neither of the guesses above. Two
> defects, both in how the board was OFFERED rather than in whether the gift
> could land:
>
> 1. `giftAnchors` scanned `FOOTPRINTS[tier][0]` alone — the flat 2×1 — so a
>    tier-2 gift advertised only the cells where it could lie down while
>    `giftPlacementAt` would happily stand it up. On a narrow opening tower that
>    is roughly half the legal board, unlit.
> 2. A refused tap had no forgiveness. The footprint snap only ever shifted by
>    the piece's own width, so a tap one cell wide of a legal spot buzzed at a
>    player who was pointing straight at it.
>
> Both now hold: every orientation lights up, and a miss snaps to the nearest
> legal socket within two cells before it is refused.

### Also: merging placed towers

pt-2 tried to drag one cannon onto another to merge them and got a camera pan.
Merging is placement-time adjacency only, and nothing on screen says so. For a
game whose whole hook is merging, the gesture every player tries first silently
does something else.

> **Fixed 2026-09-14** — and the diagnosis in this report was wrong. Merging is
> NOT placement-time only: `settleMerges` already fuses any two adjacent twins
> on every structural change, so "if they are adjacent, they fuse" is the rule
> the game plays by. What was missing was the only way a player could
> deliberately make two standing blocks adjacent: **there was no move verb at
> all.**
>
> So no merge code was written. Dragging a placed block now moves it — build
> phase only, never the Gate, refused out loud where it cannot go — and the
> fusion falls out of the settle pass that was already running. The gesture pt-2
> tried does what they expected it to.

---

## What the opening vanguard actually bought

Honest read on the change shipped that morning. **It fixed what it was aimed at
and nothing more.**

- Wave 1 went from 2 enemies to 6–7. Both pt-1 and pt-3 named wave 1 as the
  first moment the game felt like a game.
- It did **not** create danger: the Gate still finished wave 1 at 100 %, and the
  tower kills the vanguard on the walk in.
- pt-3 still quit at 20 s, because the vanguard stands *behind the tutorial* —
  dormant, in a frame the player never reaches before the popups have spent
  their patience.

Which is the argument for roadmap #1 in one sentence: **the monsters are already
on the field, and the tutorial is standing in front of them.**

---

## Revised sprint 1

Reordered against this round's evidence, not the original guesses:

| | Item | Why now |
|---|---|---|
| 1 | **Bug A** — tutorial cards replay | Costs 10–15 s of the opening 30. Cheap. Two testers. |
| 2 | **Bug B** — gift card unplaceable | Four testers, two rounds. The reward is a frustration. |
| 3 | **#7** — `earlyBuildMs: [5_000, 7_000, 9_000, 12_000]` | One line. Kills both named dead-air windows. |
| 4 | **#6** — first-blood floor on waves 2–3 | Now measured, not argued. The single biggest item. |
| 5 | **#2 + #4** — move `mergePower`, cut to three beats | Directly answers pt-3's 20 s quit. |
| 6 | **#20** — funnel instrumentation | So round four is graded rather than guessed. |

Items #1 (tutorial during the fight) and #12/#13 (tap-to-damage, combo) are the
next batch, and they are the ones that answer pt-2 — the tester who was not
bored by the screen but by the absence of a decision. Nothing in sprint 1
touches that player.

## Caveats

- Three testers, one device class, three minutes each. Quit *seconds* are
  self-reported by a model in persona; treat them as ordering, not as data.
- The Gate-damage finding is the exception: that one is reproduced in the sim
  and does not depend on the testers at all.
- pt-2's session was interrupted at 140 s by a harness restart and resumed on
  the same browser and save; its timeline is continuous.

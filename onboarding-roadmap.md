# Tower Siege — Early-Stickiness Roadmap

> 20 ideas aimed at ONE number: the share of players who are still there at
> **three minutes**. Not day-1 retention, not monetisation — those are
> `retention-roadmap.md`'s job, and several of its items have shipped. This
> file is about the players who never get far enough for any of that to matter.
>
> Effort key: **S** ≈ half a day · **M** ≈ 1–2 days · **L** ≈ 3–5 days
>
> Every entry is written against the code that exists today, with the file it
> would live in. Where a number is quoted it was measured, not remembered.

---

## The diagnosis this is built on

Four facts, from the code and from the 2026-09-11 blind playtests:

1. **The first wave is two monsters.** `waveBudget(1) = 60`, times
   `firstRunBudgetScale(1) = 0.6`, times the adaptive factor against the
   scripted fort → a plan of **2 grunts, cleared in 8.4 seconds** (measured
   2026-09-14). The opening vanguard lifts that to 7, but the director's own
   contribution is still two.
2. **Nothing threatens the tower for minutes.** Every desktop tester in the
   blind round reported the Gate bar never moving through waves 1–13. The
   adaptive director prices each wave against the tower it measures, so a
   player who builds is rewarded with a wave that cannot hurt them.
3. **The player's hands are empty between decisions.** A build phase is 15 s
   (`BUILD_TIME_MS`), a wave is 30–90 s, and for most of that there is nothing
   to press. Blind tester 1: *"mostly watched the cannon auto-fire."*
4. **The tutorial spends the player's first 20 seconds before a monster has
   moved.** `TUTORIAL_STEPS` is eight beats — `pick, place, mergeGuide,
   mergePower, inspectMerged, rankUp, rankGate, call` — two of which are
   full-screen cards and one of which is a four-second animated demo, all of
   them in front of a still field.

The through-line: **the game withholds its own premise.** It is a siege game
that opens with no siege, teaches merging before it shows a fight, and then
protects the player from danger for ten minutes. A bored teenager closes the
tab somewhere in the middle of that, and they are not wrong to.

---

## Tier 1 — the first twenty seconds

### 1. Run the tutorial DURING the fight, not in front of it — Effort M
**Why:** Today the coach marks hold `buildClockHeld` so nothing moves while
they run. The player's first 20 seconds are a slideshow. A siege game's
premise is "monsters are coming for your door" and it is never demonstrated
before the player is asked to sit through four lessons.

**What the player sees:** The game opens already in battle. The vanguard is
walking in, the cannon is firing, monsters are dying on screen. The first
coach mark cuts its hole over the weapon tile *while that is happening*, and
the dim sheet is lighter (40 %, not 72 %) so the fight stays visible behind it.

**Implementation:** `GameScene.beginRun` calls `callWave()` immediately for a
first session, and `TUTORIAL_STEPS` drops `call` (its last beat) since the wave
is already running — the beat becomes "call wave 2", which the second-wave
nudge already covers. Remove the `buildClockHeld` watcher's hold for the
tutorial; keep it only for `awaitingFirstInteraction`. `TutorialOverlay`'s
`.tutorial__dim` background-color drops to `rgba(6,10,20,0.42)`. The risk to
manage is that `place` needs a legal cell and the board is being shot at — the
existing `tutorialCell` recompute on `towerVersion` already handles that.

### 2. Move the merge teaching out of the opening — Effort S
> **Shipped 2026-09-14**, with one change of target: the ladder PICTOGRAM
> (`mergeGuide`) moved to the top of wave 3, and the `mergePower` demo
> stayed. A tester called the −10 %/−75 % comparison "a genuinely good way
> to teach the core hook in five seconds", so the card that earns its place
> before the fighting is the one that was kept.

**Why:** `MergePowerDemo` is four seconds of two cannons shooting two
grumplings, shown before the player has seen a real grumpling. It is a good
card answering a question nobody has yet asked. The question — *"why would I
merge instead of building two guns?"* — arrives the first time a wave actually
hurts, which is wave 4–6 at the earliest.

**What the player sees:** The demo fires on the first build phase after the
player loses a block, with the line "your wall broke — here is what a merged
gun does."

**Implementation:** `showMergePower` already exists as a forced flag
(`forcedPower`). Drop `'mergePower'` from `TUTORIAL_STEPS`; trigger it from
the existing `lostBlockThisWave` signal in `useTowerGame`, once per save under
a new `MERGE_POWER_KEY`. Pure re-timing, no new UI.

### 3. A stated objective, from the first frame — Effort S
**Why:** The game never says what winning looks like. `bestWave` is a number in
the corner; the only ending is death. A player with no goal cannot feel
progress toward one, and "survive forever" is not a goal a bored player adopts
in the first minute.

**What the player sees:** A slim chip under the wave HUD: **`SURVIVE TO WAVE
10`** with a 10-segment pip bar that fills per wave, and a chest icon on
segments 5 and 10. Clearing 10 pops a real **Chapter Complete** screen
(see #19).

**Implementation:** New `src/components/game/ObjectiveChip.vue` reading
`wave` and `bestWave`. No new state — the milestone chests ride the existing
`useGifts` queue via `grantGift()`. Roughly 120 lines plus i18n keys in all
shipped locales.

### 4. Cut the opening to three beats — Effort S
> **Mostly shipped 2026-09-14**: eight beats down to five. `call` now runs
> after wave 1 is won (so wave 1 starts itself and the opening is
> uninterrupted), and `mergeGuide` + `rankGate` run back to back at the top of
> wave 3 — the ladder, then the hand that shows the Gate takes a rank. That
> pairing is deliberate: one teaching sitting, three waves in, instead of four
> beats stacked in front of a player who has not met a monster.
> `inspectMerged` / `rankUp` are what remain in front of the first wave.

**Why:** Eight beats is four too many. `inspectMerged` and `rankUp` teach the
inspector and block ranks — genuinely important, and genuinely not urgent.
`rankGate` drives an automatic hand that plays for the player, which is the
least interactive thing in the game sitting in its most fragile minute.

**What the player sees:** `pick → place → mergeGuide`, then they are playing.
The inspector, ranks and the Gate's rank are taught on the **second** build
phase, as small pointer arrows (the `PointerArrow` + `is-point` pattern this
repo already uses) rather than dim-sheet coach marks.

**Implementation:** `TUTORIAL_STEPS` shrinks; the removed beats become a second
list keyed off `wave.value === 1 && phase === 'build'`, reusing
`openingSecondWave` from `GameScene`. `runGateDemo`/`useAutoHand` stays for the
second phase where a player who is already engaged will tolerate it.

### 5. Three seconds of premise before the board — Effort M
**Why:** The game drops straight from a 100 % loading bar into wave 0 with an
"Incoming!" banner. Blind tester 1: *"No title/menu/goal screen was shown to
me at any point."* Portal players arrive from a thumbnail with no idea what
they clicked.

**What the player sees:** Three seconds, skippable by any input: the camera
pans along a horde, then whips to the Gate, then the title stamps over it.
Entirely drawn by the existing renderer — it is the same scene, a scripted
camera path and a word.

**Implementation:** `useTowerCamera` already has `setFixedFrame`/
`clearFixedFrame`. A `src/use/useOpeningShot.ts` drives a keyframed camera over
a `seedOpeningVanguard`-style field, then hands control back. Because it runs
before `awaitingFirstInteraction` is cleared, it costs the player no game time
and doubles as the first-interaction gate the portals need.

---

## Tier 2 — making the first three minutes dangerous

### 6. A "first blood" floor on wave 2 or 3 — Effort M
> **Shipped 2026-09-14**, and earlier than this entry proposed: the opening
> surcharge (`FIRST_RUN_SCALE` 2.4 / 2.2) puts it on wave **1**. Measured, a
> first wave now takes an outer wall down for every player, built or not, and
> the player who answers by building holds at 99 % from there while the one
> who ignores it is at 69 % by wave 6. Nobody dies in the opening.

**Why:** This is the biggest single item in the file. `adaptiveFactor` measures
the tower and prices the wave against it, which is exactly right for wave 15
and exactly wrong for wave 2: it guarantees the early game cannot hurt. A
tower-defence game where nothing is ever destroyed has no verbs — the player
never learns that blocks break, never learns to rebuild, and never feels a
stake.

**What the player sees:** On wave 2 or 3, one outer crate is chewed down and
collapses, with the `useWorldCues` red ghost where it stood. The next build
phase opens with the arrow already on a wall tile.

**Implementation:** In `callWave`, when `isFirstSession() && next <= 3`, bypass
the adaptive clamp and target a plan whose total HP is ~1.3× what the tower can
kill in the walk-in window — the numbers are derivable from `measureTower()`
and `bestWeaponReach()`, both of which already exist. Verify with a policy-sim
probe (see `policy-sim-probe` memory): careless policy must lose 1–2 blocks and
must NOT lose the Gate.

### 7. Shrink the early build windows — Effort S
**Why:** `DESKTOP_RULES.waves.earlyBuildMs` is `[]`, so every build phase after
wave 1 is the full 15 seconds. The phone board already ships
`[4_000, 6_000, 8_000]` for exactly this reason. Fifteen seconds of countdown
over a field with nothing on it, four times in the first three minutes, is a
minute of dead air.

**What the player sees:** Waves 2–4 come fast. There is time to place one
piece, not to deliberate.

**Implementation:** One line: `earlyBuildMs: [5_000, 7_000, 9_000, 12_000]` in
`DESKTOP_RULES`. `buildWindowMs()` already reads it. The early-call bonus is
derived from `BUILD_TIME_MS` so it is unaffected.

### 8. Auto-shrink a build phase the player ignored — Effort S
**Why:** The complementary rule to #7. A player who places nothing is telling
you the build phase is not where their interest is; making them watch the rest
of the countdown is a punishment for the game's own pacing mistake.

**What the player sees:** Place nothing for 4 seconds with the wave ready, and
the countdown visibly jumps to 3 and the Call Wave button flashes once.

**Implementation:** `useIdleNudge` already tracks presence-weighted idle time
and `noteBuildAction()` already fires on every placement. When the idle clock
passes 4 s during `phase === 'build'`, clamp `buildDeadline` to
`min(buildDeadline, 3000)`. Never on wave 1 (the tutorial owns it) and never
while a modal is open — `useIdleNudge`'s `eligible` predicate covers both.

### 9. Make the early monsters MOVE — Effort S
**Why:** A grunt walks at 1.0 cells/s. From the walk-on edge that is eight to
eleven seconds of nothing happening per monster, and with a two-monster wave
that IS the wave. Slow approach reads as tension when the outcome is in doubt
and as loading when it is not.

**What the player sees:** Waves 1–5 arrive at a jog.

**Implementation:** `RuleSet.enemies.speedMul` already exists and is already
applied in `stepEnemies`. Make it a curve rather than a constant for the
opening: `speedMul * (wave <= 5 ? 1.5 : 1)`, threaded through `waveOpts()`.
Cheap to try, cheap to revert, and it is the one change that makes every other
pacing item feel faster too.

### 10. An enemy that arrives on the CROWN in the first minute — Effort M
**Why:** Air is the first threat that invalidates a shape of tower rather than
a quantity of it, and today the first flyer a player meets is a preview bat at
wave 4 (or, with the opening vanguard, one dormant bat they never fight). The
lesson "the sky is a lane" lands best when it costs one crate, not a run.

**What the player sees:** Wave 3 opens with two bats diving the crown while
grunts hold the flanks. The camera nudges up. A crate on the roof dies.

**Implementation:** `PREVIEWS` already has the mechanism and already carries
`4: [['bat', 2]]`. Move it to 3, add a third bat, and let `airShare` start
from wave 6 instead of 9 for a first session via `WaveRuleOpts.airFromWave`.
Re-measure the careless policy's survival before shipping.

---

## Tier 3 — giving the player something to do every few seconds

### 11. Arrow Rain in the tutorial's hands — Effort S
**Why:** The one attack the player aims themselves already exists
(`callArrowRain`, `arrowRainStock`, `ARROW_RAIN_WAVES = 3`) and starts a run
fully charged — and no blind tester ever pressed it. It is the single most
active thing in the game and it is an unlabelled icon in a corner.

**What the player sees:** The tutorial's third beat is "the sky button". The
screen dims, the arrow points at the Arrow Rain button, they press it, the
battlefield goes into aim mode, they click the horde, and forty arrows land.
That is the moment this game should be selling in its first fifteen seconds.

**Implementation:** Add `'rain'` to `TUTORIAL_STEPS` after `place`, with
`measureTutorialTarget` pointing at `.scene__rain`. The beat completes on
`arrowRainArmed` → volley fired. Depends on #1 (there must be monsters to aim
at).

### 12. Tap-to-damage — Effort M
**Why:** Between placements the player's mouse does nothing. Every successful
casual tower-defence on a portal gives the hands a low-stakes job: a tap that
chips a monster, gathers a coin, or speeds a reload. It converts "watching" into
"playing" without changing the balance.

**What the player sees:** Clicking a monster does a small hit (a few % of its
max HP, capped per second) with a satisfying pop. Clicking the ground does
nothing.

**Implementation:** `GameScene` already hit-tests the canvas for block
selection; extend `screenToCell` picking to enemies via `enemiesByUid`. Damage
is `maxHp * 0.04` with a 3/second rate cap, credited to no block so
`killShare` and `blowBy` accounting is untouched. The cap is what stops it
becoming the dominant strategy; tune it so it is worth ~8 % of a wave's HP.

### 13. A kill combo meter — Effort S
**Why:** Kills already pay coins and materials, but each one is a silent
+2. A combo counter turns a wave from a queue into a performance.

**What the player sees:** Kills within 1.5 s of each other stack a counter at
the top of the screen — `x4`, `x9` — with a rising pitch and a coin multiplier
on the streak.

**Implementation:** A `useKillCombo.ts` fed by the existing kill path in
`stepEnemies`; the multiplier rides `payKillShare`'s coin cut only, so
materials stay deterministic and `killShareOf`'s exactness is preserved. The
existing `pushFx` channel draws it.

### 14. Loot that lands on the battlefield — Effort M
**Why:** The flying chest is good and rare (one early, one per 45 s). Kills pay
invisibly into a bar. A bored player needs something to *reach for*.

**What the player sees:** Roughly one in eight kills drops a coin or a wood
chip that arcs to the ground and sits there for 6 seconds. Clicking collects
it; ignoring it loses it.

**Implementation:** A new `drop` kind in the existing FX/debris channel with a
hit test in `GameScene`. The value comes OUT of the kill's existing payout
rather than being added, so the economy is unchanged and the only thing that
changes is whether the player has a reason to look at the battlefield.

### 15. Put the tech tree in the tray — Effort S
**Why:** Blind tester 1 found Daily Missions by clicking an unlabelled
clipboard. The tech tree is behind a diamond icon in a row of five. `techNudge`
bounces it once, and after that it is furniture. The tree is where the run
stops being "stack blocks" and becomes a build.

**What the player sees:** A sixth tile in the build hand — a card, in the row
their eyes already live in, showing the next affordable node and its price.
Clicking it opens the tree.

**Implementation:** `BuildTray` already renders an arbitrary slot via its
`gift` slot mechanism (`giftFirst`). A second named slot rendering a
`TechNextCard` reading `progress.affordableCount` and `firstHpNodeId`.

---

## Tier 4 — presentation and payoff

### 16. A juice pass on the first thirty seconds — Effort M
**Why:** The thing that reads as "cheap" to a 13-year-old in five seconds is
not art quality, it is feedback weight. Hits need stop-frames, deaths need
knockback, and the numbers need to be big.

**What the player sees:** A 60 ms hit-stop on every kill in waves 1–3, +40 %
screen shake, damage numbers that pop and arc, and a slow-motion pinch on the
last kill of each of the first three waves.

**Implementation:** `useScreenshake` and the FX channel exist. Hit-stop is a
scalar on `step`'s `dtMs` for a few frames — the fixed-step accumulator makes
this safe. Gate the extra weight to `wave <= 3 || isBossWave(wave)` so it stays
a first-impression device and never becomes a tax on late waves.

### 17. Escalating music and a wave-start stinger — Effort S
**Why:** `startBattleMusic` plays one bed. A wave that sounds identical to the
last one is a wave that feels identical.

**What the player sees:** Build phases duck to a quiet loop; calling a wave
fires a short stinger and the bed comes up a layer. Boss waves swap the bed.

**Implementation:** `useTowerAudio` / `useSound` already own the bed. Three
layered loops crossfaded on `phase` and `isBossWave(wave)`. The mute guarantee
around ads (see the playbook's ad-audio phase) must be re-verified after.

### 18. Name the monsters, on screen — Effort S
**Why:** `ENEMY_DEFS` has real designs with real names — grumpling, rattlejack,
cinderhound, bonecap, marrowknight — and the player never sees one. A named
enemy is a thing you can have an opinion about; an unnamed one is a sprite.

**What the player sees:** The first time each type appears, a small nameplate
rises off it and fades: *"Grumpling"*. Once per type per save.

**Implementation:** `pickMonster(binding, uid)` already picks the design. A `Set` of seen
design ids in `tower_state`, and a `nameplate` FX kind. i18n keys exist for
some of these already via the death-tip pictograms.

### 19. Chapter 1 ends at wave 10, and you can WIN it — Effort M
**Why:** The only ending this game has is losing. For a player deciding in
three minutes whether this is worth their afternoon, "you can only ever fail"
is a heavy thing to carry. A first, reachable, unambiguous **win** converts a
session into a return.

**What the player sees:** Clearing wave 10 (already a boss wave —
`isBossWave(10)`) shows a **CHAPTER 1 CLEARED** screen with the run's stats, a
fat coin payout, and two buttons: *Keep going (endless)* and *Bank it & rebuild*.
The run continues either way; the difference is that the player has now won
something.

**Implementation:** The result screen (`FReward` + the `result` block in
`GameScene`) already renders stats, rank and payout — this is a second variant
of it, triggered from `completeWave` when `wave === 10` and
`!getState(CHAPTER1_KEY)`. The boss wave and its banner already exist.

### 20. Instrument the first three minutes, per second — Effort S
**Why:** Everything above is a hypothesis. Today nothing records when a player
left, so every one of these ships blind. This is the item that makes the other
nineteen falsifiable.

**What the player sees:** Nothing.

**Implementation:** A `useFunnel.ts` writing a compact per-session breadcrumb
to the existing platform analytics hook (CrazyGames `happytime`, GamePix
`gamePixHappyMoment`, console shim elsewhere): `t+Ns: {event}` for
`boot, first_input, tutorial_step_N, wave_N_start, wave_N_clear, block_lost,
first_block_placed, tech_opened, defeat, tab_hidden`. The one number to watch
is **the median event index at `tab_hidden`** — it names the beat players quit
on, which is the only way to know which of the above actually mattered.

---

## Sequencing

| Sprint | Items | Rationale |
|---|---|---|
| 0 | **20** | Ship the funnel first or none of the rest can be graded. |
| 1 | **7, 9, 2, 4** | Four small edits — two constants, two re-timings — that together cut ~45 seconds of dead air out of the first three minutes. Cheapest possible test of "is it pacing?" |
| 2 | **6, 1, 11** | The dangerous opening and the tutorial that happens inside it. This is the batch most likely to move the number. |
| 3 | **3, 19, 13** | Give the player a goal, a win, and a score. |
| 4 | **12, 14, 16, 17** | Moment-to-moment agency and feedback weight. |
| 5 | **5, 10, 15, 18** | Framing and discovery, once the loop underneath is proven. |

## What to watch

Two numbers, both from #20:

- **Share of sessions still live at 180 s.** This is the number this whole
  file exists to move.
- **Median event at `tab_hidden`.** If it clusters on `tutorial_step_*`, the
  opening is the problem and sprint 1–2 are right. If it clusters on
  `wave_4_clear` through `wave_8_clear`, the problem is the safe mid-game and
  #6 / #12 / #13 matter most. Do not guess between those two — the data is
  cheap and the guess has already been wrong once.

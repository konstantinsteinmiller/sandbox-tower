# Blind playtest — 2026-09-15 — five personas, 3 minutes each

Five Sonnet testers, blind (no source, no docs, screenshots only), **180 s of
game time each**, on the uncommitted working tree of 2026-09-15. Brief: find
inconsistencies and reasons to quit; name the exact game-second you would have
closed the tab; report bugs and hard-to-read gameplay/tutorials.

Raw reports: `pt-1.md` … `pt-5.md` (+ `.notes.md` live logs).
Harness and method: `harness/README.md`.

| | persona | device | played | quit second |
|---|---|---|---|---|
| **pt-1** | 7 y/o, skips all text | desktop | 164 s, wave 10 | never (closest ~47 s and ~164 s) |
| **pt-2** | 12 y/o Roblox/Brawl Stars | phone | 154 s, died wave 8 | never (closest ~73 s and ~44 s) |
| **pt-3** | 15 y/o Bloons TD veteran | desktop | 137 s, wave 7 | **~107 s** |
| **pt-4** | senior mobile UI/UX | phone | **73 s — blocked** | **~30–40 s** |
| **pt-5** | hybrid-casual F2P designer | desktop | 148 s, wave 8 | **~110–130 s** |

---

## The two headline findings

### 1. Phone: the merge beat can price the player out of its own tutorial — VERIFIED IN CODE

pt-4 was hard-blocked from **t=8.5 s** and never recovered, across two reloads.
This is not a gesture problem and not a one-off: the mechanism is exact.

`armMergePiece` (`src/mobile-fit/GameSceneDrop.vue:1680`) writes a `b_cannon`
into the weapon slot and arms it **without checking whether the player can pay
for it**, and re-arms a fresh one after every drop that did not weld
(`:1760`). Every attempt is charged in full. Three things then interlock:

- The `merge` beat holds the build countdown (`coachHold` → `buildClockHeld`),
  so **no wave runs and no income arrives**.
- `holdsBuildClock` is supposed to release the hold when the beat has nothing to
  point at — but the card *is* on screen, merely unaffordable, so `hasTarget`
  stays true. The guard in `useTutorialClock.ts` was written for a **missing**
  card, not a **priced-out** one. Its own doc comment anticipates "a resumed run
  that cannot afford the piece `place` teaches with" — this is that bug, arrived
  at from the other direction.
- `ensureAffordableWeapon()` exists precisely to guarantee the hand is never
  entirely unaffordable, and will even floor the purse to the price of one gun.
  `armMergePiece` mutates `offers` directly and bypasses it — and its
  `reliefGiven` flag resets per build phase, which is the very thing being held.

Arithmetic: the board starts at 90 wood (`rules.ts:157`). pt-4 paid 22 for the
drop beat's piece and 39 for a cannon that missed the weld, leaving **29 against
a 39-cost card the tutorial will not stop pointing at.** The game then stands
still for **45 s** (`MAX_HOLD_MS`) before the backstop releases it — a
motionless screen that keeps glowing at the player to do the one thing it will
not let them do.

pt-2, the other phone tester, never saw it — they welded on the first try. So
this fires for the players who miss, which is the population the tutorial exists
for.

> pt-4: *"more corrosive than boredom: it reads as the app being broken, which
> is a harder bounce than a slow game."*

**Fix:** deal the merge beat's twin free (or floor the purse to its price before
arming it), and treat "target present but unaffordable" as no-target in
`holdsBuildClock`.

### 2. Desktop: the Gate is still never threatened — third run in a row

| tester | waves survived | damage taken |
|---|---|---|
| pt-3 | 7 (~90 kills) | **health bar never moved once** |
| pt-5 | 8 (~150 s) | **health bar never moved once** |
| pt-1 | 10 | HP bar red by wave 9–10 |

The inversion measured on 2026-09-14 reproduced exactly. **The only desktop
tester who ever saw the health bar move was the 7-year-old who barely engaged**
— pt-1, who skipped the text, bought upgrades blind and played worst. The two
testers who actually understood the game were never in danger for a single
second of three minutes.

> pt-3: *"from ~sec 53 onward the game is pure spectator mode — click Call Wave,
> watch, repeat, with zero required input."*
>
> pt-5, portal verdict: **No** — *"the defense genre's core promise (you can
> lose) never once paid off in the tested window."*

pt-3 quit at 107 s for this reason and this reason alone; pt-5 disengaged at
110–130 s after the fourth identical "WAVE HELD!" banner over a full health bar.
This promotes `onboarding-roadmap.md` **#6 (first-blood floor)** for the second
consecutive run, now with two more independent confirmations.

---

## 3. Silent failure — 3 of 5 testers, both devices

Every tester who tried something the game refused reported that the refusal was
invisible.

- **pt-3** (desktop): had to re-place a Mortar **three times** — *"no error
  message, no sound, no shake — the game just… didn't do it, with no way to tell
  success from failure except checking the gold counter."*
- **pt-2** (phone): a **FREE** reward card with no empty tower slot to place it
  in. Tapped every structure on the board; every tap silently eaten, no toast.
- **pt-4** (phone): *"every non-functional tap or drag looks identical to a
  functional one right up until it silently does nothing."*

The cues do exist — `denyPurchase` blinks the short piles, `requestRejectFlash`
flashes valid landing cells, and a knock plays at 0.03 volume. They are landing
in the wrong place (a blink at the top of the screen while the player's
attention is on the tray at the bottom), and they are shorter than the gap
between screenshots. **The refused control itself never changes.** pt-4's
sharpest observation: the `VOLLEY` card is correctly dimmed when locked, so the
game already owns a disabled style — it just isn't applied to the card that is
actually blocking the player.

## 4. The green "+5" that takes your money — VERIFIED IN CODE

pt-3 clicked a green post-wave "+5" expecting a reward and watched their
currency fall from 9 to 4 (`0026`→`0027`, sec 37.1→38.5). *"No confirmation
dialog for what reads exactly like a free-reward icon."*

This matches the **compact Repair All pill** (`RepairAllButton.vue`). In compact
mode the word label is dropped (`v-if="!compact"`), leaving a green pill whose
entire content is: the `repair` glyph — which is **a plus sign** punched out of
a rounded square (`iconPaths.ts:325`) — a gold coin, and a number.

Green + a plus sign + a number, with no word, is the universal grammar of a
reward. The component's own comment says *"the glyph is what identifies the
button once the label is no longer there to do it."* It doesn't identify it; it
actively misreads as a gain. pt-1 independently hit the mirror-image confusion
with the Sell button's "+3" refund.

## 5. Unlabeled currencies — 4 of 5 testers

- **pt-4**: three top-HUD pills (sack, creature, coin), no labels, no tooltips —
  *"I could not tell you which is wood, which is gems, which is score."*
- **pt-5**: the star-coin and the third resource icon are both round unlabeled
  tokens spent in completely different systems; pt-5 confused them *in their own
  field notes* at t≈33 s.
- **pt-3**: a third currency *"jumped from 0 to 24 during the very first
  tower-placement animation, before any enemy had been killed. Never explained
  what generated it."*
- **pt-2**: top-bar icons *"hard to distinguish at phone size."*

## 6. The tech tree is a wall of unlabeled icons

Named by all five, and it is simultaneously the best hook and the worst screen.

- **pt-2** found it and it worked: *"Blueprints… stars survive death"* was the
  single thing that made them start a second run.
- **pt-1** *"bought two upgrades essentially blind"* — a dense grid of tiny grey
  unlabeled icons, and nearly quit at ~47 s over it (40 icons, 10 coins, nothing
  affordable).
- **pt-5**: a 40-node tree dumped at wave 2 *"before any stakes are
  established."*
- **pt-3**: 68 seconds of "REINFORCED HAND 30" sitting on screen with **zero
  button affordance** before discovering by blind-clicking that it was
  interactive.
- **pt-5**: the tree's entry point is a green diamond sitting in the row of
  1×/1.5×/3× speed buttons — clicked expecting a fourth speed tier, got a
  full-screen modal mid-wave.

### The Foundations number that looks like a lie

pt-5, shot 0056: *"Every tower block starts with +6% HP"* directly above *"At
rank 1: +50% total."*

Both numbers are correct by design — `perRank` deliberately reports the **next**
rank's gain (the node front-loads its first rank) and `nodeTotal` reports what
the player **owns** (`TechTreeModal.vue:385-424`). Nothing is miscomputed. But
neither line says which is which, so a careful reader concludes the card
contradicts itself. This is a labelling defect, not a maths one — and it was
found by the only tester who read the numbers closely.

## 7. Things die silently

Still open from 2026-09-11, and it cost pt-2 the run:

- **pt-1** (~161 s): a cannon *"silently became a placeholder icon… no clear
  'tower destroyed!' message, explosion animation, or confirmation."*
- **pt-2**: towers vanished between shots with no death beat — then **died on
  wave 8 sitting on 185 wood and 105 stone, completely unspent**, while three of
  four tower slots were destroyed one at a time. *"That reads as a
  fairness/feedback bug more than 'I lost because I was bad.'"*

A player with more than enough material to rebuild, losing because nothing ever
told them their defence was dying, is the cleanest retention bug in this run
after the soft-lock.

## 8. Dead air between waves

pt-1, pt-3 and pt-5 all independently named the inter-wave countdown as the dead
stretch — *"static waiting screens, just a countdown ticking, nothing moving"*
(pt-1), who went hunting for a repair button *just to have something to do*.
pt-5 adds the economic half: **resource income vastly outpaces any sink by
wave 3**, so the waiting is not even spent planning.

## 9. Phone ergonomics (pt-4, measured)

- `CALL WAVE`, the primary CTA, is **≈39 CSS px tall** (under the 44 px floor)
  with its bottom edge **≈5 CSS px from the frame bottom** — inside the gesture
  home-indicator zone on a real phone.
- Reroll arrows ≈24–27 CSS px; the "…" menu and mode icon ≈40×35 CSS px.
- "REINFORCED HAND 30" and the "3" plot badges render at ~9–10 CSS px grey on
  dark grey — below the arm's-length legibility floor, and neither is tappable
  or explained.
- A decorative idle-pulse animation drifts over the `•39` cost text and at one
  frame reads as `•35` — on the one card whose price is the whole story.

## 10. Smaller bugs worth a ticket

| tester | shot / sec | bug |
|---|---|---|
| pt-3 | `0030`–`0034`, 44–50 s | Placement ghost sticks to the cursor after a successful build, follows onto invalid water tiles; right-click and empty-space click both fail to cancel — only re-clicking the tray slot does |
| pt-3 | `0039`→`0040`, 63–65 s | UI panels change height between opens; aimed for the "X" and hit "UPGRADE" underneath |
| pt-3 | `0022`, 32 s | Solid white box over the wall segment for ≥1 frame on Mortar placement |
| pt-3 | `0046`, 73 s | Tray slots 1–2 render as blank vertical gold lines right after buying Reinforced Hand |
| pt-1 | `0054`, 164 s | Hard camera cut to a tight zoom with a "SELL +3" popup after wave 10, no transition — *"I couldn't tell if this was a menu, a bug, or part of the fight"* |
| pt-1 | `0003`–`0004`, 6–9 s | The −10 % / −75 % cannon comparison card fires right after the first placement with no explanation of what stat is changing |
| pt-4 | `0033`, 68 s | Built structure's sprite renders detached over the road for one frame after a cancelled drag |
| pt-4 | `0021`, 40 s | Right-edge vertical slider looks draggable, doesn't respond — decorative or broken |
| pt-2 | `0002` | Resource deduction is instant and silent; *"the first time it looks like a UI glitch"* |
| pt-1 | 0016/0021/0036 | The tech-tree button's red badge counts up (1→2→3→4) as if something new is ready, but always opens the same screen |

---

## Ranked recommendations

1. **Unblock the phone tutorial.** Deal the merge twin free or floor the purse to
   its price in `armMergePiece`; treat present-but-unaffordable as no-target in
   `holdsBuildClock`. This is a hard first-session block on the exact players the
   tutorial exists for.
2. **Make the early game able to hurt.** Third consecutive run where the engaged
   desktop player takes zero damage in three minutes. Both analytical testers
   quit over it and the F2P designer failed the portal on it alone. Roadmap #6.
3. **Answer every refused action on the control that refused it** — dim or redden
   the unaffordable card (the `VOLLEY` dim style already exists), shake the
   rejected placement, and put the message where the player is looking.
4. **Give the Repair All pill its word back**, or stop drawing its cost with a
   plus-shaped glyph on a green ground. A spend must never look like a gift.
5. **Label the currencies.** Four of five testers could not name them; one
   confused two of them in their own notes.
6. **Say when a tower dies**, and warn a player sitting on unspent material while
   their defence is being dismantled.
7. **Label the tech tree's two numbers** ("next rank" vs "owned"), and give
   Reinforced Hand a button's affordance.

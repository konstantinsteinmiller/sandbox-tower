# Blind Playtest #4 Report

Tester: senior UI/UX designer / accessibility auditor persona, phone (390x844 CSS px, DPR 1.5, screenshots 585x1266 px). All coordinates below are **screenshot px** unless marked "CSS px" (screenshot ÷ 1.5).

Game time used: **72.9 s of the 180 s budget.** I stopped early and said so honestly: past ~t=8s the game is in a fully reproducible soft-lock (confirmed across two independent reloads) that makes every subsequent second identical. Burning the rest of the clock on the same dead screen would not have produced more signal.

---

## 1. Persona & first 30 seconds

Landed directly into what I first read as a tutorial: "MONSTERS INCOMING!" banner (shot 0001, t=1.5s), a big arrow pointing at one highlighted vertical lane on a wall/mountain backdrop, and a card tray at the bottom with 3 cards, one glowing. My read: *this is a tower-defense/card-building hybrid — drag the glowing card into the glowing lane to build a defense before monsters arrive.*

The interface's primary directive was clear enough visually (arrow + glow = "do this"), and I did it: a plain tap did nothing (no shake, no error — silent failure, shot 0002), then a drag from the card to the lane worked (shot 0003, t=4.8s) and correctly deducted currency (90→68) and advanced the card to an upgrade tier. Good, legible cause-and-effect *the first time*.

I repeated the drag for the next highlighted card (shot 0004, t=6.6s) — currency went 68→29, tray reshuffled, and a **new** highlighted card appeared costing 39. I had 29. From that point on (t≈8.5s onward) nothing I did moved the game forward. See "Quit moment" below.

## 2. Quit moment

**A real player in my seat closes the tab around t=30–40 seconds**, on a screen identical to shot 0009/0016/0024/0031 (all interchangeable — literally nothing changes): the tutorial arrow still points at the lane, the same card (icon: dial/wrench, cost "•39") is still glowing as if playable, and every input — drag the highlighted card (7 different drop points and 2 drag speeds tried), drag the *other, affordable* cards, tap `CALL WAVE`, long-press `CALL WAVE`, tap the reroll arrows, tap the "..." menu, tap the green diamond icon, tap the greyed "REINFORCED HAND 30" label, tap the right-edge vertical slider, drag the built structure back to the tray (looking for a sell/refund) — produces **zero response**. No shake, no red flash, no toast, no sound cue, no partial progress. I reloaded the page twice (t=38.6s and t=72.9s) and landed in the *exact same stuck state* both times, proving this is a persisted-save bug, not a client glitch.

I do not believe this is a gesture-technique problem on my end: the same `drag` command placed two earlier cards successfully (shot 0003, 0004) using identical syntax. My best explanation, stated as a hypothesis for the dev team, not a code-read finding: **the tutorial's starting currency (90) is not enough to complete its own scripted sequence.** Wall (22) + first upgrade (39) = 61, leaving 29 for a *second* mandatory 39-cost step — a 10-currency shortfall — while the one plausible income source (`CALL WAVE`, which presumably pays out after a cleared wave) is itself disabled until that same step is completed. That's a circular dependency with no escape hatch and no message telling the player any of this.

If I hadn't been told to probe dead ends for this report, I would have given up after my 3rd or 4th failed drag (~t=15s) and uninstalled.

## 3. Boredom log

- **t=8.5s onward: total, not partial.** There is no "nothing demands anything of me" idle stretch in the traditional sense (no waiting for a timer) — worse, the game keeps *visually demanding* an action (glowing card, arrow, no dimming) it will not let me perform. That's more corrosive than boredom: it reads as the app being broken, which is a harder bounce than a slow game.
- Idled 6 seconds straight (shot 0032, t=61→67s) specifically to check for a delayed "stuck player" hint (bouncing hand icon, tooltip, anything). Nothing appeared. A first-time player gets no rescue.

## 4. UX audit

Ranked by severity. Sizes converted from screenshot px to CSS px by ÷1.5 as instructed.

1. **BLOCKER — Tutorial soft-lock, unaffordable mandatory step, no recovery path.**
   Shots: 0004→0031 (t=6.6s–69.5s), reproduced fresh after reload at shot 0035 (t=72.9s).
   Element: the highlighted card in tray slot 2 (screenshot pos ~339,1080), cost "•39", and the `CALL WAVE` CTA (screenshot pos ~452–578, 1200–1258).
   Problem: player is left with 29 currency, the only interactive card the tutorial permits costs 39, and the button that would plausibly unblock everything (`CALL WAVE`) does not respond to tap or long-press. No error state, no currency-shortfall indicator, no alternate path. Deterministic — every fresh load reaches the identical state.
   Fix: either seed enough starting currency to complete the scripted sequence, let `CALL WAVE` fire regardless of whether the tutorial build step is "complete," or unlock all three tray cards (not just the spotlighted one) so the player has an alternative affordable action.

2. **MAJOR — Zero feedback on failed/invalid actions anywhere in the UI.**
   Shots: 0002 (plain tap on card, t=3s), 0005–0009 (failed drags, t=8.5–15.8s), 0018 (dead "..." menu tap, t=34s), 0023 ("REINFORCED HAND" label tap, t=43.8s).
   Problem: every non-functional tap or drag looks identical to a functional one right up until it silently does nothing. No shake, no greyscale, no "insufficient funds" toast, no cursor/finger-reject cue. A player cannot distinguish "this control is disabled," "you can't afford this," and "you did something wrong" from each other, or from "the game is frozen."
   Fix: standard casual-game affordance grammar — red flash + haptic-style shake on invalid drop, a one-line toast ("Need 10 more wood"), and visually dim/desaturate anything not currently actionable (the game already has this pattern — see finding 3 — it's just not applied consistently).

3. **MAJOR — Inconsistent disabled-state styling misleads the player about what's interactive.**
   Shots: 0014 (VOLLEY card, t=27.4s) vs 0016 (the stuck 39-cost card, t=31.1s).
   Problem: the `VOLLEY` card in tray slot 0 is visibly dark/desaturated — a correct, legible "this is locked" signal. The stuck 39-cost card, by contrast, is *fully saturated, glowing, and outlined* — the exact same visual treatment as a genuinely playable card — while being just as unusable. The game clearly has a disabled-state style; it simply isn't applied to the card that's actually blocking the player.
   Fix: apply the `VOLLEY`-style dim treatment (or a red cost number) to any card the player currently cannot afford or place.

4. **MAJOR — Primary CTA (`CALL WAVE`) sits in/against the bottom safe area and is undersized.**
   Shot 0001 (t=1.5s), consistent in every subsequent shot.
   Measured: the button spans roughly y 1200–1258 screenshot px (**≈ 39 CSS px tall** — under the 44 CSS px minimum), and its bottom edge sits only ~8 screenshot px (**≈ 5 CSS px**) from the true bottom of the frame — effectively zero safe-area buffer. On a real phone with a gesture home-indicator bar, this button would be directly under or overlapping the swipe-up zone, at serious risk of accidental dismissal/mis-taps.
   Fix: pad the tray bottom by the device safe-area inset and grow the button to at least 44 CSS px tall.

5. **MAJOR — Icon-only currency HUD with three unlabeled resources.**
   Shot 0001 (t=1.5s), top bar (~365–560, 20–55 screenshot px).
   Problem: three pills — a sack/pouch icon + number, a small creature/bug icon + "0", and a round coin badge + "0" — with no text label on any of them. At arm's length none are distinguishable by silhouette alone; I could not tell you which is "wood," which is "gems," which is "score" without guessing from card costs.
   Fix: at minimum a persistent tooltip on first tap, ideally a short label under/beside each icon the first few sessions.

6. **MINOR — Reroll arrow controls under each card are under the tap-target minimum.**
   Shot 0001 (t=1.5s), circular refresh icons at ~(231,1161)/(339,1161)/(447,1161).
   Measured: roughly 36–40 screenshot px diameter (**≈ 24–27 CSS px**), well under the 44 CSS px (66 screenshot px) floor called out in this audit's brief.
   Fix: enlarge to at least 44 CSS px hit area (visual size can stay smaller with padding).

7. **MINOR — "..." menu and mode-icon (bottom-left) are undersized and unlabeled.**
   Shot 0001, ~(20–70, 1200–1255) for "...", ~(90–150, 1200–1255) for the green diamond icon.
   Measured: roughly 40x35 CSS px each (under 44 CSS px), and neither has a text label or produced any response when tapped (shots 0017, 0018, t=32.5–34s) — I still don't know what either does.
   Fix: label or add a first-use tooltip; enlarge to 44 CSS px.

8. **MINOR — Tiny, low-contrast microcopy.**
   "REINFORCED HAND 30" label (shot 0001, ~y=987) and the small "3" badges on the two dashed empty-plot outlines (shot 0004 onward, ~180,733 and ~310,733): both render at an estimated **9–10 CSS px**, in grey-on-dark-grey, below the 12 CSS px legibility floor for arm's-length phone reading. Neither responded to a tap, and I never learned what the "3" means (a level requirement? a wave number? a cost?).
   Fix: bump to ≥12 CSS px, raise contrast, and if these are inert decoration, remove them — if they're functional, make them tappable with a real state change.

9. **MINOR — Cost text can be visually obscured by the game's own idle-pulse animation.**
   Shot 0017 (t=32.5s): the pulsing white "hint" circle animation drifts to directly overlap the "•39" cost text on the highlighted card, at one frame nearly reading as "•35" or "•3•". Cosmetic, but on the one card whose cost is the whole story right now, that's a bad place for a z-order collision.
   Fix: keep decorative animation layers behind (or clear of) price text.

## 5. Bugs & inconsistencies

- **Soft-lock (see §2/§4-1).** Reproduced identically on two independent reloads (shots 0020 @t=38.6s and 0035 @t=72.9s) — this is not a one-off render glitch, it's a persisted, deterministic state.
- **Detached sprite glitch.** Shot 0033 (t=68.5s): after a "drag structure back to tray" experiment, the built structure's icon (dial-on-wall) briefly rendered floating outside the highlighted lane, partially over the road art, disconnected from its tower anchor. It self-corrected one screenshot later (shot 0034, t=69.5s) with no input from me. Minor/cosmetic but indicates the drag-cancel animation doesn't always clamp back to its container before the frame is drawn.
- **`CALL WAVE` shows a live-looking "0:00" countdown that never counts and never triggers.** Shot 0001 onward — if this is meant to communicate "ready now, tap to start," a static "0:00" reading as a *finished* countdown is a reasonable design, but combined with the button being completely inert (§4-1), it reads as broken rather than "ready."
- **Right-edge vertical slider control is unresponsive to drag.** Shot 0021 (t=40.5s): dragged the handle top→bottom, it didn't move at all. Either it's decorative (in which case it shouldn't look like a slider with a draggable thumb) or it's broken.

## 6. Unreadable / unclear

- Three top-HUD currency icons (sack, creature, coin badge) — no label, no tooltip on tap, couldn't identify any of them with confidence (shot 0001).
- "REINFORCED HAND 30" — never learned what this control does; tapping it does nothing (shot 0023, t=43.8s).
- The small "3" badge on the two dashed empty-plot outlines flanking the main lane — no unit, no label, never interactable (shot 0004 onward).
- The right-edge vertical slider — no icon, no label, doesn't respond to input; I still don't know if it's a settings control, a speed toggle, or decoration (shot 0001, 0021).
- The "..." menu and the green diamond icon bottom-left — icon-only, no tooltip, no response to tap (shots 0017, 0018).
- Card cost numbers ("•22", "•39", "•10") — the bullet icon in front of the number is presumably the same currency as the top-left HUD sack icon, but nothing on screen actually ties them together explicitly; I inferred the link, a first-time player might not.

## 7. What kept you playing

Honestly, only the fact that the first two placements gave genuinely satisfying, legible feedback (currency ticking down, the card visibly leveling up, shots 0003–0004) — that's real design know-how, it's just undercut completely by what happens one step later. If the tutorial's math had worked, I'd have kept going into the first wave with a decent first impression.

## 8. Top 3 changes

1. **Fix the tutorial's resource math (or unlock `CALL WAVE` unconditionally) so the scripted opening sequence is completable with the currency it grants.** This is the single blocker standing between "this is a competent, satisfying opening" and "the game is unplayable and I close the tab."
2. **Give every failed action feedback** — invalid drop, unaffordable card, disabled button — a consistent shake/flash/toast, and apply the existing dim/desaturate "disabled" style (already used correctly on the `VOLLEY` card) to any control the player currently cannot use.
3. **Move `CALL WAVE` and the bottom tray up out of the safe-area/home-indicator zone and grow it (and the reroll/menu icons) to at least 44 CSS px** — the primary CTA on a phone game cannot be flush with the bottom edge.

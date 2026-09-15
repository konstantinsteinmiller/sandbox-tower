# Blind Playtest #2 - Report

Persona: 12-year-old, phone player, Roblox/Brawl Stars background, 10-second patience budget.
Device: phone/portrait, 585x1266. Game-time budget: 180s (stopped at ~154s).

## 1. Persona & first 30 seconds

I got dropped straight in with no title screen - just a highlighted lane, a glowing card, and a big yellow arrow telling me to tap. I thought "ok, tower defense, but with card building." First thing I tried was tapping the glowing card (shot 0001-0002), which is exactly what the game wanted. It walked me through placing a cannon block, then popped a merge-mechanic diagram (cannon+cannon=green cannon, green+green=blue, etc, shot 0004) and a side-by-side damage comparison of a weak cannon vs a merged one killing goblins (shot 0005-0007). That's a lot of explaining before I got to touch anything for real. By ~13s I was finally let loose to place towers and the first wave started.

## 2. Quit moment

I never actually rage-quit, but my closest call was around **73-76s**, staring at a "CALL WAVE 0:0X +N%" countdown with literally nothing to tap and nothing on screen moving (shot 0045). If this were a real phone session and not a test I was told to sit through, that's the exact spot I'd flick to my other open tab and forget to come back. A countdown with no action available is a bad look on mobile.

Second-closest call: **44s**, when I got a "FREE" reward card but every tower slot was already full and tapping it did nothing (shot 0028). I spent about 4 taps trying to figure out where it wanted to go before giving up and moving on. That's the kind of dead-end that makes a 12-year-old close the tab, not because it's hard, just because it's confusing and doesn't respond.

## 3. Boredom log

- **8-13s**: Merge-mechanic and damage-comparison tutorial slides that only accept "tap to continue," no interactivity, before wave 1 even starts (shots 0004-0009).
- **44-46s**: FREE card is unplaceable because the board is full; I tap around blind with no feedback telling me why (shots 0026-0028).
- **73-76s**: CALL WAVE countdown, nothing to interact with, timer just ticking down a bonus percentage (shot 0045). This happened again with a shorter gap around 96s.
- Between-wave "REINFORCED HAND 30" button never seemed to do anything different when tapped and I never got clear feedback on what it was for - I just ignored it after wave 1.

## 4. Bugs & inconsistencies

- **FREE card placement is broken/unclear (shots 0024-0028, ~t=38-44s).** Got a "FREE" reward card, selected it (yellow highlight confirmed selection), then tapped every visible structure on the board and nothing happened. Only worked later (shot 0042-0043, ~t=69s) once a tower slot had actually been destroyed and was empty - so the real bug is that the game hands you a placeable card with **zero empty slots to place it in**, and gives no error/toast telling you that. It just silently eats your tap.
- **Tower slots silently disappear.** Between shots 0040 and 0041 (t=~65-67s) the right-hand "Wood Crate" tower vanished from the board with no visible death animation I could pin down - I only noticed because my later tap on that spot (0027) had shown a "Wood Crate" popup, then by 0041 it was gone/replaced. Structures dying without a clear "this got destroyed" beat makes it hard to know what's happening to your defense.
- **Total base wipe with resources unused (shot 0075, ~t=144s).** I died on wave 8 (boss tree monster) while sitting on 185 wood and 105 stone completely unspent, and multiple "no target" icons (crossed-out reticles) floating over my own dead tower slots (shot 0071-0072). The game let three of my four tower slots get destroyed one by one while I had more than enough resources to rebuild them, and never flagged "your towers are dying, spend your wood." That reads as a fairness/feedback bug more than "I lost because I was bad."
- Gold/stone numbers update instantly and silently when you tap a build card (90->68 in shot 0002) - fine once you know it, but the first time it looks like a UI glitch since nothing animates the deduction.

## 5. Unreadable / unclear

- The "REINFORCED HAND 30" pill at the bottom-center (visible in nearly every gameplay shot, e.g. 0010-0045) never explained itself. I don't know what it does or why it has a "30" on it. Never interacted with it because nothing invited me to.
- "HOARD +25%" tag (shot 0054, bottom-right) - no idea what Hoard means, no icon/tooltip.
- The small "-50%" gold card icon (shots 0053+) gives no unit for what's being reduced 50% of - looked like it might be a discount, might be a debuff. Never found out.
- Damage numbers popping off enemies (41, +18, 343, etc.) have no context for what's "good" - a 12-year-old wants to know if 343 is huge or normal, there's no scale/combo indicator.
- Currency icons (wood plank, stone/gem cluster, gold star) are distinguishable by color but the top bar is tiny on phone - I had to zoom the screenshot mentally to tell wood from stone at a glance.

## 6. What kept me playing

The **Blueprints permanent-upgrade shop** (shot 0021, found at ~33s) was the actual hook - a classic "spend a currency that survives death" progression system, similar to what keeps me in other games. Confirmed it actually works at ~146s when I died and restarted: stars carried over (254 on the new run) and wave count reset to 1, which is exactly the "die, get stronger, try again" loop that makes we want another go. The **boss fight at wave 8** (a big tree monster with its own health bar, shot 0069) was also a genuine excitement spike - first time the game felt like it had stakes. Getting a **"NEW RECORD!" + leaderboard rank (#324 of 367)** on death (shot 0075) softened the loss and gave me a number to chase. Daily missions with instant CLAIM buttons (shot 0030-0031) were a nice quick dopamine hit too.

It took about **33 seconds** to find the first real hook (Blueprints shop) and about **144 seconds** to feel the full loop (die -> reward -> restart stronger). That's too long for my patience budget in a real session - by the time the loop clicked I'd already had two "I'm bored/confused" moments (73s countdown, 44s dead card).

## 7. Top 3 changes

1. **Cut or shorten the opening tutorial slides** (merge chart + damage-comparison replay, shots 0004-0007). Let me learn merging by doing it, not by watching two non-interactive "tap to continue" screens before wave 1 even starts.
2. **Never hand out a placeable card with nowhere to place it**, or at minimum show a clear "no room - sell/wait" message instead of silently eating taps (the FREE-card dead end at ~44s).
3. **Warn me when my defenses are dying while I'm sitting on unspent resources.** A flashing "REBUILD!" prompt tied to the wood/stone counters would have saved my wave-8 run and turned a confusing wipe into a skill moment I could learn from.

# Tower Siege — Mobile Fit

> Findings from a code read of the whole gameplay layer plus a measured pass
> on three phone viewports and a CPU-throttled frame-time probe (2026-09-05),
> followed by two proposals for a mobile-friendly version. The two proposals
> are specified to implementation grade in
> [`game-implementation-plan-mobile-fit-1.md`](./game-implementation-plan-mobile-fit-1.md)
> (**Pocket Siege** — the same game re-cut for a fixed 7×6 board, landscape)
> and [`game-implementation-plan-mobile-fit-2.md`](./game-implementation-plan-mobile-fit-2.md)
> (**Drop & Merge Siege** — a re-cored column-drop game, portrait).
>
> **Status (2026-09-06):** Proposal 2 is implemented as the excludable
> `src/mobile-fit/` package behind `VITE_USE_MOBILE_FIT_GAME` (default on);
> see §11 for what is in, what is out, and where it deviates from the plan.
> Proposal 1 remains a plan.

---

## 0. The verdict in ten lines

1. The game is not mobile-hostile because of one bug; it is mobile-hostile
   because its **geometry is a desktop geometry**. Two-sided approach lanes plus
   a tower that grows to 13–17 cells wide need ~1,900 px of width to give every
   cell a finger-sized hit box. A 390 px phone gives each cell **43 px at wave 1
   and 22 px by wave 15** (measured, §3.1) — under the 44 px tap floor from
   about wave 3 and a fingertip covers 2×2 cells by wave 10.
2. Touch placement is **tap-only** today: any 10 px of finger travel turns the
   gesture into a camera pan and the tap is discarded (§3.2). Desktop has hover;
   touch has nothing between "finger down" and "committed".
3. The build phase is **15 s**. On desktop that is a pacing win; on a phone it is
   15 s to zoom, pan, pick, rotate and land polyominoes on 20 px cells.
4. Landscape phone is currently broken outright: the top HUD stacks to
   **145 px** and the camera frames the Gate **under the build tray** (§3.4,
   screenshot-verified). Fix regardless of what else happens.
5. Rendering, not simulation, is the CPU cost. With a 78-block tower and ~30
   enemies the frame is **~50 ms at a 4× CPU throttle** (≈ mid-range phone) and
   **~117 ms at 6×** (≈ low-end). A 42-block tower with 12 enemies sits at
   **33 ms at 4× / 50 ms at 6×** *before any optimisation*. Cost scales with
   blocks on screen first, enemies second, canvas pixels third (§3.5). The
   existing rolling quality tier sat at `low` (reflection off, 220 particles)
   for most of every throttled sample: the degradation that exists today
   never reaches the expensive passes.
6. The first minute fetches **~4 MB of art** on top of **357 KB gzipped JS/CSS**
   because every block, enemy, siege, ally, ship and fixture strip is probed at
   boot (§3.6). Poki's low-end audience is on 3G/4G.
7. The game has **~25 interacting systems** (§3.3). A phone session is 3–5
   minutes with one thumb; the mobile version needs a third of them.
8. Poki serves **one bundle** to desktop and mobile and tells the game the
   device category at runtime. The mobile fit is therefore a **runtime mode**
   inside the Poki (and CrazyGames) build, not a separate zip (§3.7).
9. Both proposals share one foundation: a **fixed camera** (no pan, no zoom, no
   auto-fit), a **fixed board** that is always fully on screen with cells
   ≥ 40 px, **≤ 3 offers**, **≤ 12 enemies on the field**, a **device tier**
   with a hard DPR cap and a 30 fps draw cadence on low-end, and a **RuleSet**
   seam in the simulation so the desktop game is not forked (§7).
10. Recommendation (§9): build **Proposal 1 (Pocket Siege)** first — it ships in
    roughly 60 % of the time, keeps the identity the desktop playtest validated,
    and every piece of its foundation is reused by Proposal 2. Switch to
    **Proposal 2** if portrait turns out to be a hard requirement for Poki
    mobile or if the first Pocket playtest shows placement error > 15 %.

---

## 1. Scope and method

**Read:** the full domain layer (`src/game/*`), the simulation
(`src/use/useTowerGame.ts`), camera, renderer, VFX, progress, the scene
(`src/views/GameScene.vue`), the build tray, the HUD components, the Poki
platform module, the build config, the existing plan and balance documents.

**Measured**, in a private headless Chrome driven over CDP (own
`--user-data-dir`, mobile UA, touch emulation, `Emulation.setDeviceMetricsOverride`)
against the dev server:

| What | How |
|---|---|
| HUD footprint and free battlefield band | `getBoundingClientRect` of `.scene__top`, `.scene__bottom`, `.scene__tray-perks`, tray tiles at 390×844 @3×, 360×640 @2×, 844×390 @3× |
| Px-per-cell the auto-fit produces per tower size | `useTowerCamera.computeAutoTarget` re-derived with the measured insets |
| Frame time under load | `requestAnimationFrame` deltas over 7–8 s windows with `Emulation.setCPUThrottlingRate` 4× and 6×, towers built through the `window.__tower` debug handle, waves jumped with `debugSetWave` |
| Payload | gzip of `dist/assets/*`, `du` of `public/` |
| Tower size by wave | `tools/balance-replay.ts` (greedy and naive policies, 25 waves) |

**Caveats that matter when reading the numbers.** Headless Chrome rasterises
Canvas 2D in software, so absolute frame times are pessimistic against a phone
with GPU raster; the *relative* deltas (tower size, enemy count, DPR) are what
the conclusions rest on. `p50` values quantise to vsync multiples
(16.7 / 33.3 / 50 ms) because rAF does. Chrome's 4× throttle is a common proxy
for a mid-range phone and 6× for a low-end one; they are proxies, and the
plans include a real-device gate.

Reproduction: the probe script is `cdp-mobile.mjs` in this session's
scratchpad; it needs only Node ≥ 22 and Chrome. It should be folded into
`tools/` when the perf work starts (Plan 1 §13 E0 / Plan 2 §13 E0).

Evidence is committed under [`docs/mobile-fit/`](./docs/mobile-fit/):
`doc-portrait-390x844-wave1.png` (first-session build phase),
`doc-landscape-844x390-wave1.png` (the landscape defect, §3.4),
`doc-portrait-390x844-wave16.png` (a 13-wide tower mid-battle, §3.1), plus the
raw HUD measurements (`hud-measurements.json`) and the frame-time samples
(`perf-pocket.json`, `perf-desktop-tower.json`). All screenshots are DPR 1.

---

## 2. What the game is, from a phone's point of view

The core loop is: be dealt five polyomino shapes (lane-locked: structure /
weapon / free / free / support) → place them on a tower whose ground floor is
nine cells wide and whose upper floors are unbounded → call a wave → auto-turrets
fight enemies walking in from **both** sides, flying over, swimming in, and
parking beyond every gun → collapse anything the Gate can no longer reach →
repeat. Meta progression is a 43-node tech DAG with three roots.

The desktop playtests on Poki and CrazyGames were strong, and the reasons are
visible in the code: an adaptive director that prices waves against the
standing tower, a hand system that turns every placement into a small puzzle,
four threat axes each punishing a lazy shape, and a renderer that makes the
tower the star. Every one of those strengths assumes **space**: horizontal
space for two approach lanes that are long enough to shoot down, vertical space
for a tower tall enough to make bombers and collapse matter, and pixel space for
a 2×2 or 3×1 piece to be aimed at a cell.

---

## 3. Findings

### 3.1 Space: the geometry problem, in numbers

**How big towers get.** `tools/balance-replay.ts` (greedy policy, the
"competent new player") rebuilds 99 blocks over 25 waves on top of the free
fort; the tower crosses ~25 blocks by wave 5, ~45 by wave 10, ~65 by wave 15.
In play those land as 9 wide × 4–5 tall around wave 8 and 13 wide × 8 tall by
wave 15 (the wave-16 screenshot below is 13×8 = 78 blocks). The foundation cap
is ±4 (`buildHalfWidth`), upper floors reach ±22 (`UPPER_HALF_WIDTH`).

**What the auto-fit gives each cell.** `computeAutoTarget` frames
`max(4.5, halfC + 3)` cells either side plus the water band; in portrait the
width is always the binding constraint:

| Viewport | Wave 1 (3w×2t) | Wave 8 (9w×5t) | Wave 15 (13w×8t) | Wave 20 (17w×11t) |
|---|---|---|---|---|
| 390×844 (iPhone 12–15 class) | **43 px** | 28 px | 22 px | 18 px |
| 360×640 (low-end Android class) | **40 px** | 26 px | 20 px | 16 px |
| 844×390 landscape (same phone) | 32 px | 22 px | 17 px | 14 px (clamped `MIN_ZOOM`) |

For scale, in physical units — on a phone one CSS px is 0.17–0.21 mm (390
CSS px across a 65 mm iPhone 14; 360 CSS px across a 75 mm Galaxy A12), not
the 0.26 mm CSS reference pixel: a fingertip contact patch of 7–10 mm is
**35–60 CSS px**; Apple's 44 pt and Material's 48 dp minimums are 7–10 mm
across. A 43 px wave-1 cell is 7–9 mm; a 22 px wave-15 cell is **3.7–4.6 mm**,
half a fingertip. By wave 10 the finger is wider than the cell it is aiming at
and **the piece under it is fully hidden**. The desktop compensates with hover preview, a
mouse-precise cursor and pinch/scroll zoom; the phone has pinch zoom, which
costs seconds out of a 15 s window and switches off auto-fit until the recentre
button is tapped (`isManual` stays true by design).

**Measured HUD footprint** (build phase, first session, tutorial declined):

| Viewport | Top bar | Bottom bar + perk row | Free battlefield band | Tray tile |
|---|---|---|---|---|
| 390×844 | 120 px | 140 + 36 px | **545 px (65 %)** | 59×69 px |
| 360×640 | 119 px | 131 + 36 px | **350 px (55 %)** | 54×63 px |
| 844×390 | **145 px** | 94 + 36 px | **111 px (28 %)** | 62×74 px |

The tray tiles themselves are fine (≥ 54 px). The controls around them are
not: the reroll pip is `clamp(0.95rem, 3.8vw, 1.2rem)` = **15 px** on a 390 px
phone and sits on the tile's corner (a miss arms the tile instead); the rotate
buttons are `clamp(1.75rem, 8vw, 2.3rem)` = **31 px**; the build-tray info box
opens on hover or a 380 ms press with no tap alternative.

**Polyominoes multiply the problem.** A 3-wide run or an L has one legal anchor
cell but the player is aiming the whole silhouette; rotation (Q/E on desktop)
is two more 31 px taps; roofed pieces seal a column permanently, which is a
permanent penalty for a mis-tap. `canPlaceShapeAt` requires the *anchor* cell
to be tapped — there is no "nearest legal fit" snap.

**Wave-16 on a 390 px phone**, for the record
(`docs/mobile-fit/doc-portrait-390x844-wave16.png`): the 13-wide tower renders
at 21.7 px per cell, enemies at the base are ~18 px tall, and the lake — where
the reflection is drawn on the `high` tier — occupies the bottom 40 % of the
screen doing nothing for play.

### 3.2 The touch input model, as shipped

`GameScene.vue` runs one pointer state machine for every gesture
(`onPointerDown/Move/Up`, `TAP_SLOP_PX = 10`, `LONG_PRESS_MS = 450`):

| Gesture on touch | What happens | Consequence |
|---|---|---|
| Tap a highlighted cell with a tile armed | `tryPlace` at the anchor cell under the finger | The only placement path. No preview before commit (no hover on touch); `hoverCell` is only updated during a move, and a move is a pan |
| Finger travels > 10 px | `panning = true`, `moved = true`; `onPointerUp` returns early | A shaky press silently pans the camera 10 px and discards the placement; the ghost is drawn under the moving finger while the world moves too |
| Hold 450 ms on a block | Inspector opens; tap consumed | Conflicts with "hold to see what I am placing"; also the only route to Repair / Upgrade / Fortify / Sell |
| Two fingers | Pinch zoom (`beginPinch`) and manual mode until recentre | Auto-fit stops; the enemy spawn edge follows the view (`setViewSpan`) |
| Tap a tray tile | Arms it; tapping again disarms | Fine |
| Press a tray tile 380 ms | Info box (hover-only on desktop) | Fires while the player is starting a drag they expect to work |

There is no drag-and-drop from the tray, no lifted ghost above the fingertip,
no snap-to-nearest-legal-slot, and no way to confirm before committing —
exactly the three things every mobile block-puzzle ships. With a fixed camera
(both proposals) the pan branch can simply disappear, which resolves the
tap/drag ambiguity by construction.

### 3.3 Systems inventory vs. a phone session

Counted from the source, not the docs:

| Area | Count / detail | Verdict for mobile |
|---|---|---|
| Block types | 20 (3 are hulls on the water row) | Keep 8–10 |
| Authored shapes | 52 + crate-ladder variants; up to 4 cells; rotation ×4; roofs | ≤ 3 cells, pre-rotated, no roofs |
| Offer slots | 5, lane-locked, per-slot 3 s reroll, reinforced hand | 3 |
| Structural rules | Gate-flood support, orphan fall with fall damage, crush, boss knockback, roofs seal columns, foundation cap vs free upper floors | Keep collapse + crush; drop overhang freedom |
| Merge | Adjacency fusion into rectangles, tiers 1–3, output ×3 / HP ×2 per tier, tech-gated | P1: off. P2: **the core** (landing merge) |
| Buffs | Banner / obelisk multiplicative adjacency auras, `rallyCry` scaling | Off |
| Per-block actions | Repair (gold, 20 s cooldown), Upgrade (5 ranks), Fortify, Sell — all behind the inspector | Repair + Upgrade + Sell as a 3-button bubble |
| Actives | Arrow Rain (aimed), cavalry sortie, range boost (rewarded), reinforced hand (rewarded), speed ladder 1/2/3× (rewarded) | One auto-aimed volley + reinforced hand + a single 2× |
| Currencies | wood, stone, run gold, wallet coins | P1: same. P2: materials + gold + coins |
| Tech | 43 nodes, 3 roots, 7 tiers, pannable DAG modal | 12 nodes in 3 strips (P1) / 10 linear blueprints (P2) |
| Enemies | 21 types across ground / air / sea / siege, previews, `resist`, bombers with burn, standoff engines needing cavalry | Ground + air, ≤ 10 types |
| Difficulty | adaptive (`expectedPower`), flawless streak, hoard tax, first-run scale, previews | Keep, re-fit constants |
| Pacing | 15 s build, waves ≤ 121 s, early-call bonus | 10–12 s build, waves ≤ 60–70 s |
| Retention/monetisation | missions, achievements, battle pass, daily, chest, leaderboard, 5 rewarded placements, interstitials at 120 s floor | Keep the plumbing; hide what does not fit the HUD |

A first-time desktop player can absorb this over a 20-minute run. A first-time
phone player on Poki has to be having fun in the first 60 seconds with one thumb.

### 3.4 Landscape phone is broken today

Measured at 844×390 with a mobile UA (so `isMobileLandscape` is true):

* `.scene__top` is **145 px** tall because the wallet column stacks the coin
  badge, the treasure chest and its "+100" chip vertically. The bottom bar is
  94 px plus a 36 px perk row.
* `measureInsets()` in landscape returns `{ top: topBar + 8, bottom: 8 }` — the
  bottom bar is deliberately ignored — so the auto-fit frames the tower into a
  band that the tray then covers. In the screenshot the starter fort's Gate sits
  directly under the "Reinforced hand" button.
* The visible battlefield band is **111 px** (28 % of the screen); a wave-8
  tower gets ~22 px cells there.

This is a defect in the current build's mobile QA surface irrespective of the
mobile fit. It is listed as a pre-step in both plans (Plan §A0) because it
needs to be fixed before anyone at Poki opens the game on a phone held
sideways.

### 3.5 Performance baseline

Frame-time probe, 390×844 viewport, `Emulation.setCPUThrottlingRate`:

| Scene | Blocks | Enemies | Throttle | DPR | p50 | p95 | % frames > 33 ms |
|---|---|---|---|---|---|---|---|
| Empty foundation | 0 | 0 | 1× | 2 | 16.7 | 18.1 | 0 |
| Starter fort, no sim | 10 | 0 | 4× | 2 | 16.7 | 17.4 | 0 |
| Starter fort, no sim | 10 | 0 | 6× | 2 | 16.8 | 49.5 | 16 |
| **Pocket tower**, build phase | 42 | 0 | 6× | 2 | 33.3 | 51.8 | 45 |
| Pocket tower, wave 9 | 42 | 12 | 4× | 2 | 33.3 | 50.6 | 40 |
| Pocket tower, wave 9 | 42 | 14 | 4× | **1.5** | 33.2 | 50.0 | **25** |
| Pocket tower, wave 9 | 42 | 12 | 6× | 2 | 50.6 | 99.8 | 81 |
| Pocket tower, wave 16 | 39 | 20 | 4× | 2 | 33.4 | 64.9 | 51 |
| **Desktop tower**, wave 1 | 78 | 6 | 4× | 2 | 33.2 | 50.3 | 37 |
| Desktop tower, wave 16 | 69 | 34 | 4× | 2 | 49.8 | 67.9 | 71 |
| Desktop tower, wave 16 | 66 | 31 | 4× | **1** | 33.8 | 66.8 | 63 |
| Desktop tower, wave 16 | 76 | 23 | 6× | 2 | **116.6** | 182 | 99 |

What it says:

1. **The tower is the first-order cost.** 42 blocks and *nothing else* already
   hold a 6× frame at 33 ms; 78 blocks with 6 enemies hold a 4× frame at 33 ms.
   Every standing block costs a body blit, a second overlay pass
   (`drawBlockOverlays`: fixture sprite, HP bar, tier plate), and — while the
   tower is ≤ 50 blocks (`SHINE_MAX_BLOCKS`) and cells are ≥ 22 px
   (`SHINE_MIN_PX`) — per-block animated gradients. The mirrored reflection
   pass is a third per-block cost on the `high` tier only; `drawReflection`
   returns early below it, so the throttled scenes above did **not** pay it.
2. **Enemies are second.** 34 enemies on top of 69 blocks move p50 from 33 to
   50 ms at 4×. Each enemy is a strip-frame blit plus HP bar plus tint layer.
3. **Pixels are third but real.** DPR 1.5 vs 2 at the same scene cuts the share
   of dropped frames from 40 % to 25 %; DPR 1 vs 2 on the big tower moves p50
   from 50 to 34 ms. The canvas at DPR 2 on a 390×844 phone is 1.3 MP; the
   full-screen passes (sky gradient every frame, background blit, reflection,
   water, speed vignette, screen flash) each touch all of it.
4. **The simulation is cheap.** `stepEnemies` scans all blocks per enemy
   (`groundFrontier`), `pickTarget` scans all enemies per ready turret,
   `scanUnreachable` scans both — at 12–34 enemies and ≤ 80 blocks that is
   tens of thousands of comparisons per second, far below the render cost.
   The 60 Hz fixed step can stay.

Specific hot spots found in the renderer that the plans address:

* `drawSky` builds a fresh linear gradient, fills the sky band (about half
  the canvas in portrait) and draws both celestial bodies **every frame**.
* `renderBackground` caches mountains, forest and meadow in an offscreen
  canvas, but its key quantises the camera rect to a **quarter cell** and the
  zoom to a whole pixel — so during every auto-fit spring (after each
  placement that widens the tower, and at every wave call) the whole
  background is re-rasterised at DPR on nearly every frame for ~1 s. With a
  fixed camera the key only changes with the day phase (every ~4.5 s).
* `drawReflection` mirrors the whole tower every frame — on the `high` tier
  only. On a phone the rolling tier drops below `high` within the first 60
  frames of a wave, so the reflection is mostly off already; the lever is
  worth nothing extra under load and is about *not re-evaluating* it every 60
  frames.
* `useTowerVfx.drawBucket` calls `createRadialGradient` **per smoke particle
  per frame**; decals do the same. A pre-baked radial sprite is one `drawImage`.
* Floating combat text uses `strokeText` + `fillText` with a custom font per
  entry per frame (up to 60).
* `primeMonsterSprites` bakes 13 designs × 16 frames × 156×176 px ≈ **23 MB**
  of canvas memory in idle time (≈ 620 ms of CPU, 2.5 s at 4×) even when
  painted strips are shipped, plus the fixture cache (up to 640 canvases) and
  the siege cache. iOS Safari caps total canvas memory per page; low-end
  Android has 2–3 GB shared with Chrome.
* The rolling quality tier scales **particle capacity** (900/500/220) and
  switches the reflection off below `high`; the per-block passes, the sky, the
  background re-bake, the fixture overlays and the enemy draw do not degrade
  at all — which is why the throttled scenes sit at 30–20 fps *with* the tier
  at `low`.

#### 3.5.1 Memory budget

Measured from the shipped art (`public/images`, 73 WebP files, 2.9 MB on
disk; decoded RGBA = width × height × 4):

| Pool | Size | Detail |
|---|---|---|
| Painted art, decoded | **86 MB** | monsters 30 MB (17 strips of 1824 × 256 = 8 frames of 228 × 256), fixtures 20 MB (13 × 640²), backgrounds 13 MB (mountains 2 × 1536 × 512, water 1024 × 512), blocks 7 MB, siege arms 6 MB (3 × 2048 × 256), icons 3 MB, siege 3 MB, allies 2 MB |
| Sliced strip frames (`spriteStrip.ts` copies every panel into its own canvas) | +30 MB (monsters) +8 MB (arms, cavalry) | a second copy of every strip in use |
| Procedural monster bake (`primeMonsterSprites`, 13 designs × 16 frames × 156 × 176) | up to 23 MB | any design whose painted strip has not decoded when priming runs (the first second of a run — see the `onArtChanged` note in `useTowerArt.ts`) |
| Fixture cache (`FIXTURE_CACHE_MAX 640`, a 2-cell box at zoom × DPR) | ≈ 16 MB per zoom bucket, up to **79 MB** at the cap | 48 aim steps × 2 aimed fixtures + 8 lanes × 3 timed fixtures ≈ 130 entries per bucket; every zoom the player pinches to adds a bucket |
| Block sprite cache (≤ 260 × ≤ 96²) | < 3 MB | — |
| Main canvas + background canvas at DPR 2 (390 × 844) | 2 × 5.3 MB | plus the tint scratch layer |
| **Plausible total, desktop mode on a phone** | **150–230 MB** | iOS Safari evicts canvases well before ~400 MB; low-end Android Chrome reloads the tab around 300 MB |
| **Mobile mode target** (50 % art, per-wave roster, no procedural bake, one zoom bucket, DPR ≤ 1.5) | **≤ 45 MB** | §7.4 |

### 3.6 Payload and load path

* Boot-path JS+CSS gzipped: `index` 145 KB + `GameScene` 111 KB +
  `useTowerGame` 32 KB + `monsters` 31 KB + CSS 22 KB + App 9 KB + `en` 7 KB
  = **357 KB**, plus the 30 KB font. Acceptable.
* `public/images` is **4.0 MB** on disk (monsters 1.2 MB, backgrounds 700 KB,
  blocks 528 KB, fixtures 224 KB, icons 192 KB, logo 132 KB, siege + arms
  164 KB, allies 76 KB, ships 56 KB; 2.9 MB of it is the WebP art that decodes
  to 86 MB — §3.5.1). `GameScene.onMounted` calls `warmSpriteProbes`
  for **every** block and enemy id on the first idle slot, and `drawScene`'s
  first frame probes every siege, ally, ship, fixture and siege-arm strip — so
  a first-session player on a phone pulls most of the 4 MB during wave 1
  whether or not those enemies exist yet. Poki's own loading-time metric
  counts against the game.
* Audio is 326 KB; fine.

### 3.7 Platform constraints (Poki first, CrazyGames second)

* Poki serves the **same bundle** to desktop and mobile; `getDeviceInfo().category`
  (`desktop | mobile | tablet`, already surfaced as `pokiDeviceCategory` in
  `pokiPlugin.ts`) is the switch, and Poki asks that **tablets get the mobile
  scheme**. The mobile fit must therefore be a runtime mode with a QA override
  (`?fit=…`), not a build flag alone. CrazyGames' separate mobile QA uses the
  same mode via `pointer: coarse` + viewport.
* Poki forbids external runtime requests (leaderboard already off), ships no
  CSP meta, mirrors localStorage/IndexedDB with a 1 MB gzip cap, and reserves
  the `poki_` prefix — all already handled in `PokiStrategy`.
* Poki's mobile nav pill overlaps the top HUD; `pokiMovePill` exists. Both
  proposals free the top-centre of the screen for it.
* Orientation: Poki lets a game declare its supported orientation on the game
  page and shows a rotate overlay for the other; both plans also ship an
  in-game rotate overlay so the behaviour is identical in the Inspector, P4D
  preview and production. Verify the P4D orientation setting when submitting.
* `gameplayStart/Stop`, `commercialBreak` before the result screen, rewarded
  readiness gating, the 120 s interstitial floor and the audio-mute guarantee
  are already implemented and are reused unchanged.
* Poki Kids (`?tag=kids`) and the ad-block path are handled in the SDK; nothing
  changes.

---

## 4. Design principles for the mobile fit

These are binding for both proposals; the plans reference them by number.

1. **The whole board is always on screen.** No camera the player can move. A
   fixed transform is computed once per viewport/orientation. Enemies still
   spawn off-screen and walk in (`spawnEnemy` already places them ≥ 2 cells
   beyond the view edge).
2. **Every cell the player can tap is ≥ 40 CSS px, ≥ 44 where the viewport
   allows.** Board size is chosen from that, not the other way round.
3. **Placement is drag-and-drop with a lifted ghost and snap.** The ghost sits
   ~1.25 cells above the fingertip; the nearest legal slot within 0.8 cells
   snaps; release places; release with no snap cancels. Tap-tile-then-tap-cell
   stays as the fallback. There is no pan gesture to confuse it with.
4. **Three offers, no rotation, no roofs, ≤ 3 cells per piece.** Every
   orientation the player might want is dealt as its own piece.
5. **One active ability, auto-aimed.** Aiming on a phone lane is not a skill
   the game should ask for.
6. **≤ 12 enemies on the field at once.** The director queues the rest. This
   bounds both the simulation and the VFX budget, and it is also better
   readability on a small screen.
7. **A run is 5–8 minutes to wave 10; a wave is ≤ 70 s; a build phase is
   10–12 s.** Mid-run resume already exists and stays.
8. **Every control lives in the thumb zone** (bottom third in portrait; the
   side rails in landscape). Nothing the player must tap during a wave sits at
   the top of the screen.
9. **Reduce, do not simplify the art.** The painted blocks and monsters are
   the game's strongest asset; they ship at a mobile resolution, not as a
   different style.
10. **Device tier decides quality once at boot**, the rolling-FPS tier only
    nudges within it. Low-end means DPR 1, 30 fps draw cadence, no reflection,
    no per-block gradients, 80 particles.

---

## 5. Proposal 1 — Pocket Siege (the same game on a fixed 7×6 board, landscape)

**One line:** Tower Siege exactly as the desktop player knows it — shapes,
turrets, collapse, waves from both sides — cut down to a 7-wide × 6-tall board
that fills a landscape phone, with drag-to-place, three offers, a 12-node tech
strip, and the ground + air lanes only.

### 5.1 Why landscape

Two-sided lanes are the identity of this game, and a phone in portrait has no
width for them: a 7-cell board at 44 px is 308 px of a 390 px screen, leaving
0.9 cells of approach per side. Landscape gives 844 px: the board takes 308,
two 120 px HUD rails take 240, and each lane is ~150 px = **3.4 cells on screen
plus ~2.7 cells walking in under the translucent rail**. Enemies are visible
for ~6 s before they reach the wall, which is the tower-defence beat the
desktop game is built on.

Portrait shows a rotate overlay (Poki-compliant; §3.7). A portrait variant of
Pocket Siege exists on paper — a one-sided 5-wide tower hugging the left edge
with a 4–5 cell lane on the right, Grow-Castle style — and is deliberately
deferred: it changes the game's identity more than Proposal 2 does while
keeping Proposal 1's input problem.

### 5.2 The board

* Columns −3…+3, rows 0…5. Gate at (0,0). 41 buildable cells.
* `halfWidthAt(r) = 3` for **every** row (no overhangs beyond the board), max
  row 5. Support rule unchanged (Gate flood fill, orphan fall, crush, boss
  knockback).
* Cell size: `cell = clamp(36, (H − 16) / 8.5, 72)` → 44 px at 390 tall, 40 px
  at 360, 48 px at 428, 72 px on tablets. 8.5 rows = 6 board + 1.0 beach/water
  + 1.5 sky (bats and wyverns dive at y ≤ 4.6 and are always in frame).
* No water row, no ships, no dock.

### 5.3 What is kept, what is cut

| Kept (unchanged code path) | Cut for v1 (data-gated by the RuleSet, not deleted) |
|---|---|
| Blocks: wood, brace, stone, archer, cannon, bombard, tesla, spikes, lumber hut | mortar, frost, repair, banner, obelisk, stonepit, coffer, skiff/longship/galley |
| Shapes ≤ 3 cells: mono, dominoes (h/v), L/J in all four turns as separate ids, archer perch, cannon mount, 2-wide spikes | 4-cell pieces, roofed pieces, rotation, crate variants beyond brace/spikes |
| Offer lanes structure / weapon / any; per-slot reroll (3 s); reinforced hand | Support lane, 5th slot |
| Enemies: grunt, runner, slinger, brute, bomber (suicide), bat, bulwark, wyvern, golem | Bombardier, firebug (bomb runs need sky above a 6-row board), eel/shark/kraken/seadrake (no water row), all six siege engines, cavalry |
| Adaptive difficulty, flawless streak, hoard tax (thresholds halved), previews (bats at 3–4), boss every 10 | Range boost (no standoff engines), speed 3× rung |
| Inspector: Repair, Upgrade (5 ranks), Sell | Fortify, merge, buffs |
| Arrow Rain — auto-aimed at the denser flank | Aimed volley |
| Wave-clear toast + 3× coins, defeat screen + 2×/continue, interstitial pacing | — |
| Missions, chest, achievements plumbing | Battle pass / daily UI in the rails (kept behind the "⋯" drawer) |

### 5.4 Tech: three strips of four

Rendered as three horizontal strips with no pan/zoom; each node is bought in
order within its strip. Effects reuse the existing `TechEffect` kinds so
`sumEffect` and every derived multiplier work unchanged; only the node table
and the state key (`ts_m_tech`) differ.

| Arms | Walls | Supply |
|---|---|---|
| Sharp Bolts +8 % dmg (5 ranks) | Foundations +8 % block HP (5) | Lumber Stock +20 start wood (5) |
| Unlock Bombard | Unlock Braced Crate | Rich Hauls +10 % wave reward (5) |
| Rapid Fire +8 % rate (5) | Gate Armour +15 % Gate HP (5) | Unlock Lumber Hut |
| Unlock Lightning Coil | Unlock Spiked Wall | Looting +12 % gold drops (5) |

### 5.5 HUD (landscape)

```
┌────────┬────────────────────────────────────────┬────────┐
│ W 7  ▮▮│  sky 1.5 rows                          │ [tile] │
│ gate ██│   ┌──┬──┬──┬──┬──┬──┬──┐               │ [tile] │
│ 🪵 240 │ ◄ │  │  │  │  │  │  │  │ ►  lane ≥3.4  │ [tile] │
│ 🪨  60 │   │  │  │  │G │  │  │  │    cells      │ [swap] │
│ 🪙  35 │   └──┴──┴──┴──┴──┴──┴──┘               │ CALL   │
│ ⓒ 120  │  beach / water 1 row                   │ WAVE   │
│ [⋯][🔊]│                                        │ [2×]   │
└────────┴────────────────────────────────────────┴────────┘
  rail 96–132 px        board 7 × cell (40–48 px)       rail
```

The canvas is full-screen; the rails are translucent DOM over it so enemies
walk in beneath them. Both rails are within thumb reach with the phone held in
two hands. The Poki pill goes top-centre.

### 5.6 Input

Drag from a rail tile → lifted ghost (−1.25 cells) → snap to the nearest
legal anchor within 0.8 cells (`legalSlots` already exists in the scene's build
state) → release places. Tap-tile-then-tap-cell fallback. Long-press a block
→ a three-button bubble (Repair / Upgrade / Sell). No pointer handler for pan
or pinch exists in the mobile scene.

### 5.7 Pacing and economy

Build 12 s; `budgetMul 0.5`; max 12 on field; spawn window 40 s; wave cap 70 s;
air share from wave 5; boss every 10 at 60 % budget; `expectedPower` re-fitted
with the replay tool against a pocket build policy (Plan 1 §7). Start 100 wood
/ 30 stone. The board fills around wave 8, after which run gold and block ranks
are the sink — that system already exists and is under-used on desktop.

### 5.8 What it preserves, what it risks

Preserves the identity, the art, the desktop player's mental model, and
~80 % of the code. Risks: landscape-only friction on Poki mobile (rotate
prompt); polyomino drag at 40–44 px cells is workable but remains the most
demanding input in the genre — the plan includes a placement-error telemetry
gate (Plan 1 §12); a 41-cell board caps the "build a huge tower" fantasy.

**Effort:** shared foundation (§7) ≈ 6 days + Pocket-specific ≈ 8 days.

### 5.9 The first minute, first session

| t | What the player sees and does |
|---|---|
| 0 s | Phone held upright → the rotate overlay, one flip. Held sideways → the fort (two crates and a cannon on the Gate) standing in the middle of the board, three tiles on the right rail, a coach mark from the top tile to a glowing slot beside the fort: *Drag a piece onto the tower* |
| 2–10 s | First drag: the piece lifts above the finger, the slot snaps green, release places it (beats 1–2 done). A second piece. Wood 100 → 70 |
| 12 s | Build timer expires (or CALL WAVE, +bonus): wave 1 at the first-session 60 % budget — six grunts, three per side, walking in under the rails |
| 12–35 s | The cannon fires on the approach; first kill → gold pops to the strip; a grunt reaches a crate and chews; the crate survives |
| 35–45 s | Wave cleared: toast on the top band (+wood/stone, coins into the wallet). Build phase 2, three new tiles, the board ~15 % full |
| 60 s | Wave 2 (80 % budget). No ad has been shown — the first interstitial opportunity is always declined (§7.6) |
| ~wave 5–7 | First defeat → result → the tech-strip intro → *Defend again* |

---

## 6. Proposal 2 — Drop & Merge Siege (a re-cored column-drop game, portrait)

**One line:** The tower is five columns wide; you tap a column and the offered
block drops into it; a block landing on its twin merges into a bigger one;
enemies hit the flanks from the sides and the crown from the sky; when a block
dies, everything above it drops. One thumb, portrait, no precision.

### 6.1 Why re-core

Proposal 1 shrinks the board until the desktop input fits a finger. Proposal 2
replaces the input with one that has no precision to lose: a **column** on a
360 px phone is 45 px wide and ~315 px tall (40 × 280 on a 320 px SE), an
un-missable target. It also
turns the portrait screen's shape into an advantage — the approach lanes are
short by design, and the sky above the tower becomes the air lane the desktop
game never had room to show. Merging on landing is the mobile hook: it is what
the player *does* during a wave.

### 6.2 The board and the drop

* Columns −2…+2, rows 0…6 (7 tall). Gate at (0,0). 34 buildable cells.
* A drop is one tap on a column (or drag a tile over it). The block spawns
  above row 6 and falls with the existing `falling` physics
  (`stepDebris` / `landingRowFor`); a full column refuses the drop.
* **Support is per column**, not a flood fill: a block rests on the block below
  it or on the ground. When a block dies, everything above it in that column
  falls one landing (`settleColumns`, replacing `resolveOrphans`); the fall is
  free of damage but crushes what it lands near (`crushEnemiesAt` unchanged).
* **Merge on landing**: if the block below is the same type and tier, the
  landed block fuses *down* into it (tier + 1, output ×3, HP ×2, the existing
  `mergePowerMul`/`mergeHpMul`), the landed cell empties, and the check repeats
  down the column so a chain reads as a cascade. Three tiers. No horizontal
  merging, no tech gate.
* Pieces are single blocks, plus one two-tall piece (crate with a gun on top)
  from wave 3 — the only shape.
* Cell size: `cell = min((W − 16) / 7.5, freeH / 10)` where the 7.5 is
  5 columns + 1.25 cells of lane each side and the 10 rows are 7 board +
  1 beach + 2 sky → **45 px on 360×640, 50 px on 390×844, 53 px on 412×915**
  (40 px on a 320×568 SE with the sky reduced to one row).

### 6.3 Threats

| Lane | Types | Where they appear |
|---|---|---|
| Ground (both sides) | grunt, runner, brute, bulwark, bomber (suicide) | Spawn ≥ 6 cells out (`SPAWN_MARGIN`) and walk ~7 s at 0.8 cells/s, but the lane is only ≈ 1.3–1.5 cells on screen — units are visible for the last ~2 s. Close quarters by design; an edge-arrow indicator with a count carries the rest of the approach (Plan 2 §6.1) |
| Air (from the top of the screen) | bat, wyvern, bombardier (altitude 2 above the crown, so it stays in the 2-row sky) | Dive at the crown; the crown's guns are the answer |
| Sea (v1.1) | eel, shark | Rise from the lake under the tower's feet; kept as a data-gated follow-up |
| Boss | golem every 8 waves | Enters alone |

Slinger, all siege engines, cavalry, firebug, kraken, seadrake are out.
Max 10 on the field.

### 6.4 Currencies, tech, abilities

* **Materials** (wood and stone folded together; stone-costed blocks cost
  ×1.4 materials) + **gold** (run) + **coins** (wallet). Two numbers on the
  HUD instead of three.
* **Blueprints**: a single linear track of 10 cards — buy the next one
  (repeatable rank cards interleaved with unlocks so every purchase is
  visible). No navigation.
* One active: **Volley** (Arrow Rain auto-aimed at the denser flank), charged
  by cleared waves. Rewarded: reinforced next-three-drops, 3× wave coins,
  continue, a single 2× speed.
* Repair all (gold) between waves; tap a block → its card (rank up with run
  gold, sell) — piece in hand or not (§11.9).

### 6.5 HUD (portrait)

```
┌──────────────────────────────────┐
│ W7 [gate ███░]   🪵 240  🪙 35  ⓒ 120│  44 px strip (Poki pill sits above)
├──────────────────────────────────┤
│  sky — 2 rows — air lane         │
│      ┌──┬──┬──┬──┬──┐            │
│      │  │  │  │  │  │            │  board 5 × 7, cells 45–53 px
│      │  │  │▓▓│  │  │            │  columns are the tap targets
│ ◄3   │  │  │G │  │  │   2►       │  ground lanes ≈ 1.3 cells; edge arrows count what is walking in
│      └──┴──┴──┴──┴──┘            │
│  beach / water — 1 row           │
├──────────────────────────────────┤
│ [Volley] [tile] [tile] [tile]    │  84 px tray
│ [⋯]            [CALL WAVE 0:09 +30%] [2×] │  56 px bar + safe area
└──────────────────────────────────┘
```

### 6.6 What it preserves, what it risks

Preserves the tower fantasy, the art, collapse and crush, waves, adaptive
difficulty, every platform/ads/save layer, and ~70 % of the simulation.
Changes what the player *does* — and that is unproven until played. Risks: a
new balance from scratch (short lanes mean most damage lands at the wall; the
game must be won by merging and repairing, and the numbers have to make that
true); merge cascades can hand out power in lumps; a 5-column tower is small.

**Effort:** shared foundation ≈ 6 days + Drop & Merge-specific ≈ 12 days
(≈ 12 if Proposal 1 shipped first, since the foundation is shared).

### 6.7 The first minute, first session

| t | What the player sees and does |
|---|---|
| 0 s | Phone upright: the fort in the middle three columns, three tiles at the thumb, a coach mark on the empty column beside the fort: *Tap a column to drop* |
| 1–4 s | Tap → the crate falls from the top of the board and lands on the ground with a puff (beat 1). Materials 90 → 80 |
| 4–10 s | The weapon tile is a cannon (forced once): *Drop a twin on a twin* — tap the Gate column → the cannon lands on the fort's cannon and **merges**: tier-2 plate, ×3 text (beat 2) |
| 10 s | Build timer expires: wave 1 at 60 % budget — six grunts, visible for the last two seconds of a seven-second walk; the edge arrows count them down |
| 10–35 s | The tier-2 cannon fires on both flanks; a grunt reaches the left crate; the crate survives |
| 35–45 s | Wave cleared; toast on the beach row; build phase 2 with a new hand — the structure tile is a twin of the left crate, the drop-to-merge is obvious |
| 60 s | Wave 2. No ad yet (§7.6) |
| ~wave 5–8 | First defeat (the wave-8 golem for a strong board) → result → the Blueprints intro → *Defend again* |

---

## 7. Shared foundation (both proposals)

### 7.1 Runtime mode, not a build

`src/use/useMobileFit.ts` exposes `fitMode: 'desktop' | 'pocket' | 'dropmerge'`,
resolved once at boot: URL override `?fit=` (QA) → `pokiDeviceCategory`
(`mobile`/`tablet` → mobile) → `pointer: coarse` and `min(innerW, innerH) < 600`
→ desktop. `GameScene.vue` stays the desktop scene; a new, small
`GameSceneMobile.vue` (or `GameSceneDrop.vue`) mounts for mobile modes and
shares every composable. The route decides at load, so the desktop chunk never
downloads on a phone.

### 7.2 The RuleSet seam in the simulation

`useTowerGame.ts` currently hard-codes board width, offer slots, water row,
merge rules, fall damage and spawn caps as module constants. Both proposals
need most of them to differ, and forking a 4,000-line file is not an option.
A `RuleSet` object (Plan 1 §3.2 lists every field and every call site) is
applied before `startRun()`; the desktop values become `DESKTOP_RULES` and the
existing tests pin them. `shapes.ts`, `tech.ts`, `waves.ts`, `enemies.ts` gain
`*_MOBILE` tables selected by the rules; nothing is deleted.

### 7.3 Save keys

Mobile runs and tech get their own fields in the same blob (`ts_m_run`,
`ts_m_tech`, `ts_m_best_wave`, `ts_m_onboarded`); the **wallet is shared**
(`ts_coins`) so progress follows the player across devices, and the
`SaveMergePolicy` progress score adds the mobile best wave. Leaderboard boards
are separate ids.

### 7.4 Performance plan

| Lever | Desktop today | Mobile mode | Expected effect (from §3.5) |
|---|---|---|---|
| Device tier at boot (`useDeviceTier.ts`: cores, `deviceMemory`, DPR, Poki category, a 300 ms blit micro-bench) | rolling-FPS tier only | fixed tier + FPS nudge | Removes the first 5 s of jank while the FPS average settles |
| DPR cap | 2 | 1.5 mid, 1.0 low | −15 pp dropped frames at 4× (measured) |
| Camera | spring auto-fit | fixed | Background + sky baked once; `bgKey` changes only with the day phase — no re-rasterisation during placement or wave call |
| Reflection | every frame on the `high` tier, off below it (rolling) | decided once at boot: off (low) / static mirrored blit updated on `towerVersion` (mid) / live (high) | No gain under load beyond today; stops the 60-frame re-evaluation and the flicker between tiers |
| Per-block gradients (`shineOn`, buff glow) | on ≤ 50 blocks | off | One gradient + fill per block per frame gone |
| Fixture cache | 48 aim steps × 8 lanes, 640 entries | 16 steps × 4 lanes, 192 entries | Memory and bake time ÷ 6 |
| Particles | 900 / 500 / 220, per-particle radial gradients | 220 / 150 / 80, baked radial sprites | Removes `createRadialGradient` from the hot loop |
| Floating text | 60, stroke + fill | 16, fill + shadow | — |
| Draw cadence | every rAF | every 2nd rAF on low (sim stays 60 Hz) | Halves render cost on the devices that need it |
| Enemy field cap | unbounded | 12 (P1) / 10 (P2) | Bounds sim + VFX + strips in memory |
| Monster sprites | procedural bake 156×176×16 for the whole cast + painted 8-frame strips (228×256 per frame) probed for all | painted strips only, halved to 114×128 per frame, probed **per wave roster** | −23 MB bake, −620 ms CPU, strips 30 MB → ≈ 2 MB resident for a wave's roster |
| Fixture cache | ≈ 16 MB per zoom bucket, up to 79 MB | one bucket (fixed zoom), 16 aim steps × 4 lanes, ≤ 192 entries | ≤ 6 MB |
| Art payload | 4.0 MB on disk / 86 MB decoded, probed at boot | `public/images/m/` at 50 % + lazy by wave | ≤ 1.5 MB transferred and ≤ 25 MB decoded before wave 1 |

**Gates** (must pass before submission): pocket wave-9 scene p95 ≤ 33 ms at 4×
in the CDP probe (today 50.6); ≥ 30 fps steady on a Samsung A12 / Redmi 9A
class device and ≥ 50 fps on an A52 / iPhone SE 2 class device; time to first
interactive frame ≤ 3 s on Chrome's "Slow 4G" profile; boot transfer ≤ 1.5 MB;
no long task > 100 ms after the first frame; canvas memory ≤ 100 MB.
Measurement uses the `web-game-performance-optimize` skill's A/B/A/B runner so
each lever is kept only if it beats the baseline.

### 7.5 Fix now, regardless of proposal

1. Landscape insets ignore the bottom bar; the wallet column stacks to 145 px
   (§3.4).
2. Reroll pip 15 px and rotate buttons 31 px on phones.
3. Tray info box has no tap path on touch.
4. `warmSpriteProbes` probes the whole cast at boot; probe by wave roster.
5. Per-particle `createRadialGradient` in `drawBucket` and per-frame decals.
6. `drawSky` gradient + two celestial bodies every frame.
7. `renderBackground` re-rasterises the whole background during every
   auto-fit spring (quarter-cell key); freeze the key while the camera is
   moving and re-bake once when it settles.

### 7.6 Ad and session cadence on mobile

Nothing here is new code; it is what the existing pacing produces once waves
are 35–60 s long:

* **Interstitials** (`maybeShowInterstitial` at wave clear and before the
  result, 120 s floor, first opportunity of a session always declined): the
  first break lands at the second or third wave clear (~2–3 min in), then one
  every 2–3 waves. A 6–8-minute run shows 2–3 breaks; Poki additionally
  throttles commercial breaks server-side, so the effective count is at or
  below that. The wave-clear toast is held until the break ends (`toastHeld`).
* **Rewarded** placements stay: reinforced hand (build phase), 3× wave coins
  (toast), 2× result coins and continue (defeat), a single 2× speed (battle) —
  all under the 6-per-5-minute allowance in `useAdGate`. Expect 1–2 views per
  run; every button is ≥ 44 px and carries the movie badge only when a video
  will actually play.
* **Session shape**: a run is 5–8 minutes to wave 10 (P7); mid-run resume
  (`ts_m_run`) means a backgrounded tab or a dropped session costs nothing.
  Poki's own dashboard is the source for playtime and retention (§ Plan 1 §12).

---

## 8. Comparison

| | Proposal 1 — Pocket Siege | Proposal 2 — Drop & Merge |
|---|---|---|
| Orientation | Landscape (rotate overlay in portrait) | Portrait (rotate overlay in landscape) |
| Core input | Drag a ≤ 3-cell piece, snap, release — 40–48 px cells | Tap a column — 42–53 × ~300 px targets |
| Precision demanded | Moderate | None |
| Board | 7 × 6, 41 cells, Gate flood support | 5 × 7, 34 cells, column support |
| Systems kept | ~60 % | ~45 % (merge promoted to core) |
| Code reuse | ~80 % | ~70 % |
| New balance work | Re-fit constants; replay tool exists | New build policy for the replay tool + hand tuning |
| Threat lanes | Ground + air | Ground (short) + air (vertical) (+ sea later) |
| Render load | ≤ 41 blocks, ≤ 12 enemies | ≤ 34 blocks, ≤ 10 enemies |
| Identity preserved | High | Medium (same world, different verb) |
| Poki-mobile fit | Good | Best |
| Fun risk | Low (validated core) | Medium (new verb) |
| Effort | ≈ 14 days | ≈ 18 days (≈ 12 after P1) |

---

## 9. Recommendation

Build **Proposal 1 first**. It is the smaller change to a core the desktop
playtest already validated, it puts the runtime-mode architecture, the RuleSet
seam, the device tiering and the Poki mobile QA loop in place, and Proposal 2
reuses all of that — so nothing is wasted if the second one follows.

Switch to **Proposal 2** (or go to it directly) if either holds:

* Poki confirms portrait is required or the rotate-overlay drop-off in the
  first mobile week exceeds ~30 % of mobile sessions; or
* the Pocket mobile playtest shows placement error (cancelled or mis-snapped
  drags ÷ attempted) above 15 %, or median mobile session length under
  3 minutes.

Both plans start with the same phase A (fix-now defects, mode resolution,
RuleSet seam, device tier, fixed camera) so the decision can be revisited after
a week of work without loss.

---

## 10. Open questions for you

None of these block starting phase A.

1. Is landscape-locked acceptable for Poki mobile in your experience, or do you
   want Proposal 2's portrait-first regardless of the effort delta?
2. Should the wallet (`ts_coins`) be shared between desktop and mobile runs
   (recommended — progress follows the player) or kept separate?
3. Do you want the mobile art set exported from the existing sheets at 50 %
   (`tools/slice-sheets.mjs` can take a scale) or hand-tuned per block?
4. For Proposal 2, is folding stone into "materials" acceptable, or is the
   three-resource identity worth its HUD cost?

---

## 11. Implementation status (2026-09-06)

Proposal 2 shipped first, behind a flag, as a separate package. The decision
rule in §9 still stands — this is the portrait build Poki's mobile audience
gets today, and the desktop scene is one env switch away.

### 11.1 The switch

| Lever | Where | Effect |
|---|---|---|
| `VITE_USE_MOBILE_FIT_GAME=true` (base `.env`) | build time | Router resolves phones/tablets to `src/mobile-fit/GameSceneDrop.vue`; desktop keeps `views/GameScene.vue`. Set to `false` and the whole package is dropped by Rollup (verified: no `GameSceneDrop-*.js` chunk) and every device gets the desktop scene as before. |
| `?fit=desktop` / `?fit=dropmerge` (`mobile` = `dropmerge`) | runtime | Force either scene; useful for testing the drop board on a desktop browser or the old scene on a phone. |
| `?tier=low|mid|high` | runtime | Force the device tier → render profile (DPR cap, draw cadence, shine, particle/text caps). |

Mode resolution (`src/use/useMobileFit.ts`): query override → Poki device
category (`mobile` / `tablet` → dropmerge) → coarse pointer or mobile UA with a
short side < 600 px → desktop. The router waits up to 1.5 s for the Poki
category before falling back to the UA heuristic.

### 11.2 What is in

- **Shared foundation (§7)**: `RuleSet` seam in the simulation
  (`src/game/rules.ts`, `DESKTOP_RULES` pinned by tests), runtime `fitMode`,
  device tier (`src/use/useDeviceTier.ts`), fixed camera frame, separate
  `ts_m2_*` save keys with the shared coin wallet.
- **Drop & Merge rules (§6)**: 5×7 board, column support (no flood fill),
  landing merge in **all four directions** for every block type with **no tier
  ceiling** (see below),
  gentle settles (no fall damage), stone folded into materials at ×1.4, three lanes
  [structure, weapon, any] with swap-under-tile, top-entering air, ten enemies
  on the field, 10 s build phase, boss every 8, speeds 1×/2×, auto-aimed
  Volley, ten linear Blueprint cards on their own key — the five rank cards
  uncapped, paced by a compounding price (Sharp Bolts is 114 coins at rank 5,
  5,850 at rank 20, 80,620 at rank 30) rather than by a ceiling.
- **Scene**: `TopStrip` (wave and currencies only — no Gate bar; in a battle
  the wave group grows an enemy count and pushed it into the materials icon,
  and the Gate carries a bar on the block itself) / `DropTray` / `WaveBar` /
  `RotateOverlay` / `BlueprintsModal`; tap-to-arm + tap-column and
  drag-to-column drops;
  tap-a-block card (rank up / sell); hints; three-beat tutorial (drop → merge → call);
  result flow and rewarded perks via the shared composables.
- **Column guides**: arming a piece lights every column it could go to —
  alternating bands with a hairline down each side, and a dashed outline on
  the cell the piece would come to rest in, red and outline-less where the
  column is full. The aimed column keeps its brighter band and solid outline
  on top. Without this, "tap a column" named a target the player could not
  see until a finger was already on the board.
- **Four-way welds, oldest wins**: a landed block fuses with any twin it
  touches — `mergeDirs` is `[down, left, right, up]`, down first because that
  is where the piece was already going. Two mortars that end up shoulder to
  shoulder are as obviously a pair as two stacked ones, and leaving them apart
  read as the board missing a merge the player had already made. The survivor
  is the **longest-living of the pair** (the lower `uid`, handed out in
  creation order): the piece just dropped slides into the tower rather than the
  tower sliding into it. Downward that is always the block below — a
  column-support board is built strictly bottom-up, so within a column older is
  always lower — which is why nothing about the original down-only rule moved.
  A sideways weld vacates a cell, and `stepDebris` settles the column in the
  same tick, so the blocks above it fall and merge in their turn.
- **Uncapped welds, one cell**: a weld here always lands in a single cell, so
  `maxMergeTier` is `Infinity` and `mergeArt` is `cell` — the fused gun stays
  inside its cell at every tier, and the plate reads `II` / `III` and then the
  Arabic number, which never needs more than two characters. Output still
  triples and hit points still double per tier, so a deep weld is the same bet
  it always was — more damage behind less frontage.
  The **desktop is uncapped too** now, on the strength of how the deep tiers
  played here. It keeps `mergeArt: 'footprint'`, where the gun grows with the
  SHORT side of the footprint (2×1 → 1.1, 2×2 → 2.2, 4×2 → 2.2, 4×4 → 4.4), so
  it overflows by the same tenth at every tier instead of hanging out into the
  sky. Lifting the tier cap alone did nothing there: `unionRect` also demanded
  a merged block fuse only into a SQUARE, and two 2×2 bastions make a 4×2. That
  rule is 2:1 now — the progression the art already assumed, still refusing the
  4×1 strip it was written to refuse.
- **Zoom**: the frame stays fixed (no panning), but a vertical slider in the
  top-right corner and a pinch on the board zoom **out** from the fit to half
  of it, with a recentre button that appears only while the view is away from
  the fit — the desktop scene's control, same crosshair. The zoom anchors the
  **ground line** rather than the board's centre, so what it buys goes to sky
  and flanks, where the wave is, instead of to more empty water. There is no
  zoom in past the fit: the fit is already the largest the board can be drawn
  without pushing a column off screen.
  The slider is an ordinary horizontal `input[type=range]` rotated ‑90° inside
  a dark capsule, and the **capsule** takes the pointer rather than the input:
  standing a range up natively (`writing-mode` + `-webkit-appearance:
  slider-vertical`) puts the thumb off its own rail, and a native range's touch
  drag waits on the browser's gesture recogniser, which a rotated one does not
  reliably get. The `<input>` keeps the paint, the keyboard and the accessible
  name; the rail computes the value from the finger. The capsule is what makes
  it legible against a noon sky.
- **Render profile v1**: DPR cap 2 / 1.5 / 1, draw every frame / every frame /
  every 2nd, shine off below high, 150 / 80 particle and 16 float-text caps on
  mid / low, roster-filtered monster sprite priming.
- **Shared with the desktop scene**: the incoming-lane chips (air / sea /
  bombers / siege / out-of-reach) are **gone from both**. They were accurate
  and unused — five chips that all say "brace" are wallpaper by wave three,
  and the wave itself says it louder four seconds later. The hoard surcharge
  stays, because it is a price on the current build phase rather than a
  description of the next wave. The counters remain in `waves.ts`, and
  `outrangedNext` still drives the Mortar's reach warning.
  The result screen's **Upgrade!** and **Defend again** buttons are now
  icon-only (`shop`, `skip-forward`) from the shared 44-glyph set installed
  under `src/components/icons/` — their i18n keys live on as the accessible
  names.
- **i18n**: every new string in all 21 locales; parity test green.
- **Tests**: `tests/game/rules.test.ts`, `tests/mobile-fit/dropmerge.test.ts`
  (board, hand, drops, landing merge, column support, enemies, repair, abilities,
  blueprints), `tests/mobile-fit/fitMode.test.ts`,
  `tests/mobile-fit/renderDrop.test.ts`.
- **Evidence**: `docs/mobile-fit/impl-drop-board-wave2.png` (390×844, wave 2
  with the flank arrows and a tier-2 wall) and
  `docs/mobile-fit/impl-drop-board-tutorial.png` (the merge beat).

### 11.3 What is out (plan-2 phases not yet run)

- C0 greybox gate with testers, and the 320×568 / 412×915 layout sweep.
- E0 perf-probe scenarios, the E1–E12 lever ledger beyond the render profile
  above, and the real-device pass.
- F: Poki Inspector run, CrazyGames QA, cloud-hydration proof for `ts_m2_run`.
- G: replay-harness fit of `expectedPowerMul` (0.4 is the plan's estimate, not
  a fitted value), the instrumented playtest and the v1.1 sea-lane decision.
- Per-wave art probing / a 50 % mobile art set — the drop scene reuses the
  desktop sprites at a capped DPR.

### 11.4 Deviations from the plan, and why

- `waves.budgetMul` is **0.5**, not 0.4: with the first session's own 60 %
  opening discount on top, wave 1 was a single grunt.
- Tutorial beats **auto-arm the piece** and the hole spans the whole column,
  because the dim layer would otherwise swallow the tray tap that the beat
  asks for. The merge beat forces a `b_cannon` deal for the twin.
- A settle that lands a block on its twin **also merges** (`settleColumns`
  calls `mergeOnLanding`), so a killed block below two twins fuses them —
  cheaper than a special case and it reads as a reward.
- Air units spawn **above the board** (`y = maxRow + 3.5`, dir toward the
  Gate) rather than off a flank, so the two rows of sky are the air lane.
- Bomber altitude is 1.6 rows (the desktop's 3.2 leaves the frame).

### 11.5 Early-hook pass (2026-09-11)

Players were leaving 20-40 s in. A headless probe of a first session on a
390 px phone at the opening zoom (±5.2 cells visible) showed why:

- **Wave 1's only grunt was shot dead off-screen at 2.2 s.** The fort's
  cannon (range 8.5) out-ranges a frame barely five cells either side of the
  Gate, and enemies were placed two cells *outside* it. The first monster on
  screen appeared at **15.3 s**, after a 10 s countdown. A player who builds
  normally saw their first monster at **27-28 s** and 1-2 s of monsters in the
  whole first minute — the stronger tower killed everything unseen.
- `airFromWave: 4` did nothing: the bat's own `minWave` is 9, so waves 4-8 had
  no flyers (~9 % of units over waves 1-16 were air).

What changed (rule-set fields, desktop values unchanged and pinned):

- `enemies.spawnAt: 'viewEdge'` — walkers stand just inside the frame's side
  edge and divers drop in from the visible top (under the HUD strip), wherever
  the zoom has put them; never closer than 1.5 cells to the board.
- `waves.earlyBuildMs: [4000, 6000, 8000]` — short breaks after waves 1-3.
- `waves.firstRunScale: [1, 1]` — no first-session discount (wave 1 is a grunt
  and a bat instead of one grunt).
- `waves.airShare: { base 0.28, slope 0.02, cap 0.45 }` from wave 2, a
  preview bat on waves 1-3 (the early slice is too small to buy one); bat
  unlocked at 2, wyvern 11, firebug added at 15 (preview at 13). A
  one-flyer-per-wave floor was tried and removed: it only bites on waves the
  director has trimmed for a struggling tower, and average-player 5-minute
  survival fell to 3 in 8 with deaths inside the three-minute window.
- The tutorial now stays up through wave 2 (the next wave arrives ~10 s in).
- `MergePowerDemo` — four seconds after the merge ladder, on both boards: a
  tier-1 and a tier-3 cannon side by side, two volleys each in step at their
  own grumpling (−10 % / −75 % a shot); the tier 3's grumpling dies on the
  second volley while the other is still walking in at 80 %.
- Merged weapons are drawn as ONE bigger gun per tier (a weld is one block, so
  it carries one gun — the twin/triple batteries this first shipped with read
  as "two cannons in one box"): a step per tier on the one-cell board
  (`fixtureSpanForCellTier` 1.2 / 1.28 / 1.34) and, on the tower, the
  footprint's short side plus `gunGrowthFor` along a wide weld's long side.
  Tier-coloured, and tier plates / merge bursts / shots use a colour ladder
  (`src/game/tierStyle.ts`).

Measured after (same probe, 12 seeds): first monster on screen at **0 s**;
~25 s of monsters on screen in the first minute; 30 % of units are flyers.
Trade-offs: a zero-input player (tutorial drops only) now dies at 128 s /
wave 7 (was 185 s / wave 8), and an average-policy player survives 5 minutes
in 10/12 seeds (was 12/12; the two losses at 238 s / wave 11 and 292 s /
wave 13). Slower walkers, a gentler HP slope and a smaller air share were all
probed as compensation and none beat this beyond seed noise. `CUM_KILLS
.dropmerge` and `data/leaderboard-seed.json` were re-measured for the new mix.

### 11.6 Economy, chest and feedback pass (2026-09-11, both boards)

- **Per-kill rewards** (`killShareOf` in `waves.ts`, `killEnemy`/`completeWave`):
  a wave's wood/stone reward is priced at `callWave` and paid per kill —
  kill i pays `floor(T·(i+1)/N) − floor(T·i/N)` — with any remainder settled
  at the clear, so the total is exact. Hut/coffer yields, repairs, the volley
  charge, the flawless streak and WALLET coins stay at the clear (outcome-
  dependent, or a save write per enemy). `lastWaveReward` still reports the
  wave total; `atClear` is what landed at the clear.
- **Can't-afford feedback** (`missingFor`, `useResourceBlink`): a refused
  purchase knocks (`obstacle-hit`, pitched down, throttled) and blinks each
  missing resource red↔white for 1.5 s. A piece now stays armed when its refill
  is unaffordable, so further taps fail loudly instead of silently.
- **Idle nudge** (`useIdleNudge`): 15 s of live, affordable idling pulses the
  affordable tray tiles until the next placement.
- **Merge preview** (phone, `previewDropMerge` / `previewGiftDrop`): a held
  piece shows the tier it would weld into, cascades included, on the cell the
  weld ends in. Desktop ghost not done (rectangle welds; a wrong preview is
  worse than none).
- **Flying chest + gifts** (`FlyingChest.vue`, `GiftTile.vue`, `useGifts.ts`):
  one chest 5 s after the tutorial is over for the run (see `tutorialOver` —
  finished, OR past the waves its coach marks can show on, because the
  2026-09-11 blind playtest had no phone player finish the drop beat), then one
  every 45 s of unpaused play. Tapping it queues a welded tesla/frost/mortar
  (tier 2, ~10 % tier 3) or an obelisk pair — free the first time a chest is
  ever opened on the board, half price (`giftPrice`) every time after; a one-time tier-2 cannon on the first clear of
  wave 3. Gifts persist per board (`ts_gifts` / `ts_m2_gifts`).
- **Painted tier art hooks** (`paintedArt.ts`): `<weapon>-t2/-t3` fixture
  paintings and `props/chest-wing` are allowlisted drop-ins; sheets + prompts in
  `art-sheets/` and `art-todo.md` §I. Nothing painted yet.
- Phone break after wave 1 is 4 s (`earlyBuildMs: [4000, 6000, 8000]`).

### 11.7 Show-don't-tell pass (2026-09-11, after the blind playtest)

Follows `docs/playtests/2026-09-11-blind/`. No new copy anywhere; every fix
is a pictogram, a glow or the mechanic played out.

- **First lesson, shown** (`DropDemo.vue`, `coachMarks.ts`, `TutorialOverlay`
  `passage` prop): the drop beat cuts a second live window over the armed tray
  card, loops a ghost of the piece travelling into the lit column, and accepts
  the drag as well as the tap. Any drop sets `ts_m2_drop_learned`; a stage that
  ends unfinished after a drop retires the coach marks for good. The merge
  ladder + power demo play on the player's first real weld if this board has
  not shown them (`ts_m2_merge_guide`). An armed piece ghosts at every open
  column's landing cell, solid under a pressed finger.
- **Blueprints on the bar** (`WaveBar.vue`): out of the `…` drawer, green chip
  with the affordable badge. The track now opens on Foundations
  (`m2_foundations` → `m2_sharpBolts` → `m2_brace` …); an owned card always
  counts as unlocked, so older saves never see a paid card padlocked.
- **First HP rank is +50 %** on both boards (`firstPct` on the `blockHp`
  effect, `firstCost` 20 on the phone card so it lands with the wave-2 clear),
  then the normal step. Balance not re-simulated; seed board not re-measured.
- **Stage-2 spotlight**: `PointerArrow` + gold aura on the tree button while
  `techNudge` (held back here while a coach mark is up), and on the Foundations
  buy button inside the tree until it is bought once.
- **Missions**: badge = claimable count; gold glow only when every unclaimed
  mission is claimable; a second button top-left of the playfield while
  anything is claimable.
- **Merged weapons are one gun** that grows with tier (§11.5 updated).
- **World cues** (`useWorldCues.ts`): lost-block ghosts, a gate-hit edge wash,
  a crossed-out crosshair over enemies nothing can reach, and the Volley pulses
  when it is the answer.
- **Defeat screen**: the tech-tree glyph instead of the cart, a replay arrow,
  NEW RECORD beside the wave, a "1×" token on the revive.

### 11.8 Rerun follow-ups (2026-09-11, both boards)

Follows `docs/playtests/2026-09-11-rerun/`. Still no new copy.

- **Gate health bar** (desktop `WaveHud`): a red segmented meter with 25/50/75
  ticks and a pale damage trail, so it cannot read as wave progress.
- **Gate hits** (`useWorldCues` `gatePopScale` / `gateBlinkWhite` /
  `gateBlinkRed`): white-red strobe plus a ~12 % cartoon hop with overshoot,
  re-armed at most every ~340 ms; reduced motion gets one red wash, no hop.
- **Kill cam** (`KillCam.vue`, `killingBlow` in `useTowerGame`): the sim holds
  for 3 s on the unit that struck the last blow — spotlight, gold ring, a crown
  — then the ad / defeat screen. Attribution: melee, splash, suicide and hostile
  rounds (`Projectile.byEnemy`) set `blowBy`; a blow with no attacker falls back
  to the last Gate attacker, then the nearest enemy. Effects keep time during
  the hold so the collapse dust clears off the killer.
- **Gift in hand**: legal sockets drawn while armed (`giftAnchors`), a refused
  tap flashes them green (the drop board flashes its landing cells) and keeps
  the gift armed.
- **Missions**: slot 0 is always "survive to wave 2" (40 coins); the other two
  come from coins / kills / blocks. Fixed a signed-shift bug that dealt
  `undefined` targets on about half of all days.
- **Upgrade screen intro**: its first card on the first open from anywhere
  (`ts_tech_intro_p1` / `ts_m2_tech_intro_p1`); the rest after a defeat.
- **Reinforced Hand** (coin-priced builds): first tap flips the hand gold in
  place and turns the button into a tick; second tap pays; 4 s or a phase
  change cancels. The payout now reinforces the current hand in place instead
  of re-dealing it.
- **Revive button**: `RebuiltGlyph` — the painted Gate springing up inside a
  rewind arrow, replacing the fast-forward mark testers read as "skip".
- **3× switch**: a "30 🪙" chip on the rung whenever the next tap charges, and
  a bar draining the paid time while the buff runs (desktop only; the phone
  switch has no 3×).

### 11.9 Hand, block card and chest economy (2026-09-12, both boards)

Follows a session of the phone build played on a real device. No new copy but
the three `gift.*` keys below (added to all 21 locales).

- **Drag actually looks like a drag** (`GameSceneDrop`): the piece a drag is
  carrying now rides just above the finger (`.drop__carry`), the tile takes an
  explicit `setPointerCapture` so a mouse behaves like a touch, `DropTray`'s
  tile cancels its own `touchstart` as well as setting `touch-action: none`
  (a page-level overscroll that claims the gesture ends it in a
  `pointercancel` halfway up the screen), and letting go back over the tray
  puts the piece down instead of dropping it into whatever column the finger
  was level with. The gesture always worked; nothing on screen moved with the
  finger, so players copied the drop beat's demo, saw nothing, and went back
  to tapping.
- **Block card** (`src/mobile-fit/components/BlockCard.vue`): a TAP on a block
  opens it — armed or not — with the block's rank pips, what the next rank
  buys (HP, and damage for a gun), Upgrade (run gold) and Sell. Long-press
  still opens it without waiting for the lift; the coach marks teaching the
  drop keep every tap in their column a drop. This is the phone board's first
  gold sink: `upgradeBlock` was always board-agnostic, but nothing on this
  board could reach it, and the hand re-arming after every drop meant the old
  long-press sell almost never fired. The inspected block is ringed on the
  board (the range ring's selection outline now draws for any inspected block,
  not only guns).
- **Chest schedule** (`FlyingChest`): one chest five seconds after the chest
  becomes possible, then one every 45 s of unpaused play measured from the
  moment the last one left the sky; a grounded chest (full gift tray) retries
  in 10 s. It was one per WAVE, which put three or four chests in a first
  minute. The `tutorialDone` and `phase` props are gone — `ready` already
  carries both.
- **Chest economy** (`useGifts`): the first chest a player ever opens on a
  board still pays out FREE; every chest after it is a HALF-PRICE BUY
  (`giftPrice` = half of building the weld's cells one at a time, so a tier 3
  costs twice a tier 2). The tile shows the bill and a `-50%` badge, and a
  short purse is refused out loud like any other piece. The first-clear
  present stays free. Persisted per board (`ts_first_chest_gift` /
  `ts_m2_first_chest_gift`); a gift saved by an older build is honoured as
  free.
- **Merge power demo** (`MergePowerDemo`): six seconds instead of four (the
  last four are the verdict held on screen), health bars at twice the size,
  pinned over each half above the grumpling, framed in a small red-to-gold
  glow, notched at the quarters — and each hit leaves a DAMAGE TRAIL: the
  chunk it took stays white for a blink, then gold, then drains onto the new
  health. Taps are ignored until 3 s so the kill and its drain are both seen.
- **Reroll cooldown**: 5 s → 3 s per slot, both boards.
- **Tier rim**: the tier colour round a merged weapon's fixture is one CSS
  pixel at every size (it grew with the gun: three pixels and more on a phone,
  which read as a sticker over the inked art). The wash, the plate and the
  tier-3 glow still carry the tier.
- **Gate repair** (`repairBlock`): re-syncs the Gate's HP refs, so a Gate
  patched in the build phase updates the wave badge's health bar at once
  instead of at the next wave's sync.

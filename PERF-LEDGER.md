# Performance ledger — Tower Siege (mobile-fit / Drop & Merge)

Every performance experiment run on this project, **including the ones that did
nothing**. Null results are the point: they are what stops the same idea being
re-tried next month, and next project.

Written by the `web-game-performance-optimize` skill. One row per experiment,
newest first. Never delete a row — supersede it with a new one.

## Budget

| | |
|---|---|
| Target device profile | 2020–2022 budget/mid Android (Galaxy A12 / Redmi 9A class), Chrome. Desktop proxy: headless Chrome **with the GPU on**, CPU throttle 4× (mid tier) or 6× (low tier), 412×915 @ DPR 2, phone UA |
| Target | 60 fps → **16.7 ms/frame** |
| Primary metric | p95 work-per-frame; for anything periodic, **frames > 33.3 ms** and **long-task count**, which are what the player actually feels |
| Benchmark scenario | Drop & Merge at `?benchwave=10`, scripted autoplay (`src/mobile-fit/benchDriver.ts`) keeping a wave permanently in flight on a full ~35-block board, seed 7, 1500 frames after 240 discarded |
| Commands | `pnpm perf:preview` then `pnpm perf:ab` (A/B verdict); `pnpm perf:profile-build` + `pnpm perf:profile` (attribution) |

### Four harness rules, each learned by getting a wrong answer first

1. **`--gpu` is not optional.** The skill's default `--disable-gpu` puts Skia on
   SwiftShader and software-rasterises every canvas fill. This game is fill-rate
   bound, so that is a 10–20× handicap *on top of* the CPU throttle and it
   saturates: the first attempt read p50 23 ms / p95 73 ms with 370 of 450
   frames over 33 ms and reported a **367 % noise floor**. With the GPU on, the
   same build reads p50 1.9 ms / p95 4.4 ms and the floor drops to ~11 %.
2. **Measure in FRAMES, not milliseconds** (`--frames`, not `--ms`). `step()`
   consumes the real frame delta and clamps its catch-up, so under a time-boxed
   window a slower variant loses simulated time and is measured on an *emptier*
   board — it looks faster for being slower. `?benchframes=` makes the scene
   drive its clock off the frame counter, so both variants run tick-for-tick the
   same simulation and only the wall time differs.
3. **Verify the scenario is the scenario.** The bench driver was gated on
   `perf.benchMs`, which is 0 in frame-counted mode, so it silently never
   installed and a whole afternoon of runs measured **wave 1 on a near-empty
   board** instead of wave 10 on a full one. Nothing in the numbers looked
   wrong. Screenshot the benchmark before believing it — `tools/` has no
   built-in check for this and the runner cannot know what it is looking at.
4. **Run nothing else on the machine.** A 6× run that reported "B is 17.4 %
   worse" had clean early reps (B ahead on every metric) and then both variants
   exploding in lockstep from rep 3 — which is when a `vitest` run and two vite
   builds were started alongside it. `MEASURING.md` lists background load as a
   pitfall; it costs an hour to relearn.

And a reading rule: the runner's "noise floor" is A's max−min spread, so one
cold rep pushes it past 300 % and every real win reads INCONCLUSIVE. Machine
state also drifts monotonically across a session (page cache, clocks), which
inflates that spread while affecting both variants equally. **Read the
per-rep pairs**, not just the verdict line.

## Current standing baseline

Built bundle, mobile-fit board, painted art on, 4× CPU, tier mid, wave 10.

| Date | work p50 | p95 | p99 | frames >33 ms | long tasks | `backdrop` mean |
|---|---|---|---|---|---|---|
| 2026-09-07 (before) | 19.60 ms | 34.50 ms | 47.10 ms | 166 / 1500 | 20 | 1.48 ms |
| 2026-09-07 (after)  | **15.85 ms** | **30.45 ms** | **40.10 ms** | **91 / 1500** | **12** | **0.86 ms** |

---

## Experiments

### 2026-09-10 — Adaptive quality on the DESKTOP scene · **SHIPPED UNMEASURED**

**Read this row's verdict first: nothing here has been A/B'd.** It is recorded
as a change, not as a result. The trigger was a playtest, not a harness:

```
AMD Radeon 610M (2 CU) · ANGLE D3D11 · 8 cores · DPR 1.5 · Chrome 152
wave 1, BUILD phase, four blocks on the board, no enemies, no particles
  observed: 18 fps
```

The canvas is very nearly idle in that frame. That single fact is what shaped
everything below — it rules out entity counts, particles and draw calls as the
explanation, and points at fixed per-frame cost plus work the probe cannot see.

**What was actually wrong, in order of confidence:**

1. **The desktop scene had no adaptive path at all.** `initDeviceTier` /
   `setRenderProfile` were called only from `GameSceneDrop.vue`. `GameScene.vue`
   never called them, so `useTowerArt`'s defaults *were* its behaviour, and every
   subtraction in the 2026-09-07 row above was gated off for it: live day/night
   sky, mirrored tower, paper grain, per-block shine, 900 particles, DPR 2.
2. **`resolveDeviceTier` would have said `high` anyway.** It scores a machine
   weak only when two signals agree, and none fire on a laptop (8 cores, not
   mobile, no Android major). It cannot see a weak GPU behind an adequate CPU,
   which is precisely this machine.
3. **DOM/compositor work no probe in this project has ever measured.**
   `usePerfProbe` brackets `update` + `render` inside the canvas; all of this is
   outside it, and all of it was on screen in that 18 fps frame:
   `backdrop-filter` on the control hint and the mute button, over a canvas that
   invalidates every frame; a keyframe animating `filter: drop-shadow()` on the
   HUD buttons; one animating `box-shadow` on the urgent call-wave button; one
   animating `background-position` on the coin badge. None of those composite.
4. **`buildTimeLeft` was written every fixed tick at ms precision**, re-rendering
   its consumers ~60×/s for the whole build phase.
5. **The desktop primed all 17 monster designs on its first frame**
   (`monsterPrimeFilter ?? allMonsterIds()`); mobile-fit filters to its roster.
   `pump` bakes at least one frame per idle slice — and a machine at 18 fps has
   no idle slices.

**What shipped:** `useAdaptiveQuality` — a 10 s audition on measured presented-
frame deltas, then hysteresis, stepping `high → mid → low` and applying the
existing `PROFILES` plus a HUD-effects switch (`data-hud-fx="off"`) and, at
`low` only, `maxOnField: 12`. Plus the two unconditional fixes (4) and (5), the
latter via an `OffscreenCanvas` worker pool.

**Costs, stated because the skill says a size regression vetoes a win:**

```
  monsterBakeWorker chunk   +70.97 kB raw / +27.0 kB gzip, lazily fetched
```

That is `monsters.ts` duplicated into the worker. It cannot be deduplicated
without splitting the cast's metadata from its draw functions, because the main
thread still needs both for `monsterFaces` / `paintMonsterFrame` / the fallback
bake. If the 27 kB is judged too expensive, delete `monsterBakePool` and
`monsterBakeWorker` — `monsterSprites` keeps its idle bake in full working
order and nothing else changes.

**What would make this a real row:** an A/B on that machine, or one like it.
`?tier=high` vs `?tier=low` pins the tiers and stops the controller, which is
what makes the comparison possible; `window.__quality()` reports which tier a
session settled on and on what evidence. Until someone runs that, the honest
claim is "the desktop can now degrade at all", not "the desktop is faster".

**Open, and deliberately not guessed at:** which of the five is actually
dominant at 18 fps. My ranking above is reasoning from the code plus the
measured rows below it, not from a trace on the affected hardware — and the
`bglayer` row is a standing reminder that this project has already been wrong
once about a GPU-side claim it could not measure locally.

### 2026-09-07 — The mobile fidelity package · **KEEP**

Five changes shipped together as the phone tiers' backdrop profile plus two
unconditional fixes. Measured as a package against the untouched renderer,
4 reps interleaved, uncontended:

```
4x CPU, 412x915 DPR2, tier mid, wave 10, seed 7, 1500 frames, 4 reps A/B/A/B
  work p50           A 19.60 ms  ->  B 15.85 ms   (-19.1 %)
  work p95           A 34.50 ms  ->  B 30.45 ms   (-11.7 %)
  work p99           A 47.10 ms  ->  B 40.10 ms   (-14.9 %)
  frames > 33.3 ms   A      166  ->  B       91   (-45.3 %)
  long tasks         A       20  ->  B       12   (-41.0 %)
  backdrop mean      A  1.48 ms  ->  B  0.86 ms   (-42.2 %)
  FCP (veto)         A   420 ms  ->  B   418 ms   (-0.5 %)   no regression
```

Per-rep, which is the honest read while the machine drifts:

| rep | A p95 | B p95 | A >33 ms | B >33 ms | A long tasks | B long tasks |
|---|---|---|---|---|---|---|
| 1 | 38.7 | **36.8** | 261 | **162** | 40 | **32** |
| 2 | 39.6 | **30.5** | 233 | **98** | 31 | **11** |
| 3 | 30.3 | **27.9** | 92 | **43** | 8 | **5** |
| 4 | 30.2 | 30.4 | 98 | **83** | 6 | 12 |

B is ahead in 4/4 on over-budget frames, 3/4 on p95, 3/4 on long tasks. The
runner prints INCONCLUSIVE because 11.7 % does not clear A's 27.2 % *unpaired*
spread — and that spread is drift (A's own p95 falls 38.7 → 30.2 across the
session as the page cache warms), not measurement noise within a pair.

Independent attribution, 25 s CPU profile on the same scenario:

```
                    baseline        package
  work p50            22.6 ms   ->   16.7 ms
  work max          1459.0 ms   ->  696.7 ms     (-52 %)
  long tasks         62 (6002 ms) -> 47 (3993 ms)
  backdrop mean/max  1.64 / 60.1  ->  1.11 / 35.2 ms
  blocks mean         3.30 ms   ->    1.84 ms    (-44 %)
  drawTierPlate      3.3 % self ->   absent from the top 10
  frames drawn        1231      ->    1443       (+17 %)
```

The five parts:

**E2a `staticsky` — freeze the day/night cycle on phone tiers.**
`renderBackground` keyed its cache on `Math.round(dayPhase() * 40)` against a
180 s cycle, so the whole scenery layer — two mountain ranges, two tree lines,
the meadow with its tufts and pebbles, the water, the shore ink and the grain
pass — re-rasterised **every 4.5 seconds, forever**. On the mobile board the
camera is FIXED, so that timer was the *only* thing invalidating the cache.
Frozen, the backdrop becomes a bake-once-per-wave layer. Isolated on the light
scenario it was a null on p95 and −58 % on `backdrop max`; its real value is as
the enabler for E2b and as the thing that stops the hitch recurring. Cost: the
phone loses a moving sun — a deliberate product decision, not a smuggled cut.

**E2b `bakedsky` — sky and celestial bloom into the cached layer.** With the
cycle frozen, `drawSky` painted identical pixels every frame: a full-viewport
linear gradient, a full-sky radial bloom, a `drawImage` of the sun, and three
`mixHex` string builds. Isolated: `backdrop mean` −38.4 %, p50 −10 %, p95 −13 %.

**E3 `reflection` — no mirrored tower on phone tiers.** `drawReflection`
re-draws every block flipped, plus its roofs, under a clip and a shear. It was
gated only on the ROLLING quality tier being `high`, which is worse than useless
on a phone: `high` for the first sixty frames, so the mirror appeared, vanished
mid-wave, and came back. Isolated: −52 % of the phase it lives in, −5.9 % p50,
−16 % work max, and the flicker is gone. The desktop keeps its reflection.

**E14 `tierplate` — bake the merge-tier badge.** `drawTierPlate` ran per block
per frame: a rounded-rect fill, a stroke, a `ctx.font` assignment built as a
**fresh template string every call**, and a `fillText`. Drop & Merge puts a badge
on nearly every block, so at ~40 blocks that is 40 string allocations, 40 font
sets and 40 text rasterisations a frame. It was the heaviest *named* function in
the profile at 3.3 % self time, above `drawScene` itself, and nothing about the
badge changes between frames. Now baked per `(tier, rounded cell size, dpr)` and
blitted; `blocks mean` −44 % and the function leaves the profile. Flag and losing
branch deleted.

**E15 `bakebudget` — measure the monster-bake slice.** `monsterSprites.pump`
baked while `deadline.timeRemaining() > 12`, the 12 being "the cost of the most
expensive single frame in the cast" measured on a developer's laptop. A budget
phone pays 3–5× that, so the guard read "13 ms left, a frame costs 12, start
one" and overran the idle slice by 30–40 ms. An overrun inside
`requestIdleCallback` is a dropped frame, and it repeated every slice until the
whole cast was baked — most of the early game, on exactly the devices least able
to absorb it. The floor is now a rolling **max** of what `bakeFrame` actually
costs here (max, not mean: the guard must be safe for the *next* frame, and the
next frame may be the treant), decaying slowly so one GC-hit sample cannot stall
the queue. Flag and constant deleted.

### 2026-09-07 — `img.decode()` before handing painted art to the renderer · **KEEP**

`spriteFor` set `decoding: 'async'` and marked the probe ready on `load`. But
`load` means the *bytes* arrived, and `decoding: 'async'` only governs how the
browser paints an `<img>` **in the document** — these images are never in the
document, they are blitted onto a canvas. So the WebP decode landed
synchronously on whichever frame first drew the sprite, inside `drawScene`.

Diagnostic, art on vs art off (`?art=`), 4× CPU, tier mid:

```
  enemies phase max   art on 62.7 ms  ->  art off  7.6 ms
  backdrop phase max  art on  120 ms  ->  art off   36 ms
  long tasks / 20 s   art on 8 (1291 ms) -> art off 5 (723 ms)
```

`img.decode()` moves that work off the frame and only then lets the renderer see
the image. A rejected decode falls back to the old behaviour, which is correct:
an aborted decode still leaves a usable `Image`.

### 2026-09-07 — E2c `bglayer`: backdrop on its own canvas element · **REVERTED (null)**

Put the cached scenery in a second `<canvas>` behind the game canvas so the
compositor blits it instead of `drawScene` copying it in every frame.

```
4x CPU, tier mid, seed 7, 2400 frames, 5 reps interleaved  (light scenario — see harness rule 3)
  work p50          A  1.40 ms  ->  B  1.30 ms   (-7.1 %)
  work p95          A  3.00 ms  ->  B  3.00 ms   ( 0.0 %)
  work p99          A  4.60 ms  ->  B  4.20 ms   (-8.7 %)
  backdrop mean     A  0.33 ms  ->  B  0.25 ms   (-22.4 %)
  work max          A  8.30 ms  ->  B 10.00 ms   (+20.5 %)
```

Flat on the primary metric, and it cost a second canvas element, a screen-shake
transform that had to stay in sync with the game canvas, and an unmount
teardown. Reverted per the ≤3 % rule.

**Worth retrying — on real hardware, and on the heavy board.** A desktop GPU
blits 824×1830 px for free; a phone's memory bandwidth does not. This is exactly
the class of claim `MEASURING.md` Recipe 4 says headless cannot settle. Any
future result here is `desktop-proxy-only` until a device confirms it.

### 2026-09-07 — E13 `decalsprite`: cached ground-shadow sprite · **REVERTED (null)**

Replace up to 28 per-frame `createRadialGradient` calls with one cached alpha
ramp and a scaled `drawImage`. Measured no better and possibly worse: a GPU
rasterises a small radial about as cheaply as it filters a scaled blit, and the
sprite path adds a `globalAlpha` set/reset per decal. The simpler code stays.

### 2026-09-07 — E6 `grain`: skip the paper tooth on phone tiers · **KEEP, on a non-measured argument**

The paper-tooth pass is a whole-viewport fill in `multiply` blend, the slowest
composite a 2D canvas has — and it runs **only on a backdrop bake**. With E2a in
place that is once per wave, so it cannot appear in a steady-state p95 at all;
no A/B of it means anything. It is dropped on the phone tiers because it is a
per-bake cost on the devices whose bakes are slowest, and because a paper tooth
at phone DPI is below the threshold anyone can see. Recorded as a judgement
call, not as a measured win.

---

## Not attempted / open

| Idea | Why not yet |
|---|---|
| **A/B the desktop adaptive package** | The 2026-09-10 row shipped on a playtest observation and code reading, with no harness run at all. `?tier=high` vs `?tier=low` on a Radeon 610M-class machine is the missing measurement. Top of the list with the row below. |
| **Attribute the desktop 18 fps** | Which of the five causes in that row dominates is still unknown. `GameScene.vue` now feeds the adaptive sampler but still does NOT call `perf.beginFrame` / `perf.endFrame`, so the phase timers already sprinkled through `drawScene` produce nothing on the desktop scene. Wiring that bracket is a two-line change and would answer it. |
| **Real-device pass** | **Every number here is a desktop proxy. Nothing in this ledger is confirmed on a phone.** |
| `bglayer` on real hardware | See E2c. |
| `enemies` phase | Still the largest phase at 5.74 ms mean, 69 ms max — the biggest remaining target by a distance. |
| Enemy field cap (plan-1 E11) | Untouched. |
| `ink` / `blob` / `noise2` | ~8 % of self time combined, from the procedural ink passes. Not yet attributed to a call site. |
| DOM HUD reactivity | The probe brackets `update` + `render` only; Vue's re-render lands outside it. Frame *delta* p50 sat at 16.7 ms with idle to spare on the proxy, so nothing was hiding there — but that is a desktop answer. |

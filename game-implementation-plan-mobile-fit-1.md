# Tower Siege — Implementation Plan, Mobile Fit 1: **Pocket Siege**

> Living document. If a session is interrupted, resume from the first unchecked
> item in **§13 Execution checklist**. Every decision that has already been
> made is recorded here so no re-derivation is needed. The analysis this plan
> rests on is [`mobile-fit.md`](./mobile-fit.md); its design principles (§4
> there) are referred to as **P1…P10** below. Nothing in this plan has been
> implemented.

---

## 1. What we are building

The desktop game, unchanged in identity, running as a **runtime mode** inside
the same bundle on phones and tablets:

* a fixed **7 × 6** board (columns −3…+3, rows 0…5) that is always fully on
  screen, cells 40–48 px on phones, no camera;
* **landscape** on phones (rotate overlay in portrait), either orientation on
  tablets ≥ 600 px short side;
* **drag-to-place** from a three-tile rail with a lifted ghost and snap, tap
  fallback, no rotation, no roofs, pieces ≤ 3 cells;
* the **ground and air** lanes with nine enemy types; no sea, no siege, no
  cavalry;
* a **12-node tech strip** (three lanes of four) on its own save key;
* a **device tier** driving DPR, draw cadence and every render lever;
* the existing save, ads, pause, lifecycle and platform layers untouched.

### Non-goals (v1)

Portrait play on phones · merging · buffs · water row / ships · siege engines ·
fortify · aimed abilities · the 3× speed rung · battle-pass / daily UI inside
the rails (they stay reachable behind the "⋯" drawer) · a separate zip.

---

## 2. Decisions already made (binding)

| # | Decision | Why |
|---|---|---|
| D1 | Mobile is a **runtime mode** (`fitMode`), resolved once at boot from `?fit=` → `pokiDeviceCategory` → `pointer: coarse` + short side < 600 | Poki serves one bundle and reports the device; tablets must get the mobile scheme (mobile-fit §3.7) |
| D2 | The simulation is parametrised by a **`RuleSet`**, not forked | `useTowerGame.ts` is 4,000 lines; two copies would drift within a week |
| D3 | Board **7 × 6**, `halfWidthAt(r) = 3` for every row, `maxRow = 5`, no water row | 8.5 framed rows fit 390 px tall at 44 px/cell (P2); lanes of ≥ 3.4 visible cells on an 844 px wide phone (mobile-fit §5.1) |
| D4 | **Landscape** on phones; rotate overlay in portrait | Two-sided lanes need width; portrait leaves 0.9 cells of approach |
| D5 | **3 offer slots**: `structure / weapon / any`; works pieces (lumber hut) are dealt through `any` | Five tiles do not fit a rail; a strict works slot with one un-gated piece would deal the same hut forever |
| D6 | **No rotation, no roofs, ≤ 3 cells.** L/J pieces are dealt pre-rotated as separate ids | Rotation is two 31 px taps in a 12 s window; a sealed column is a permanent penalty for a mis-tap |
| D7 | Placement = **drag, lifted ghost (−1.25 cells), snap ≤ 0.8 cells, release**; tap-then-tap fallback snaps ≤ 0.6 cells; no pan/pinch handlers exist in the mobile scene | P3; the tap/drag ambiguity disappears with the camera |
| D8 | Tech = **12 nodes in three strips**, `m_`-prefixed ids, state key `ts_m_tech`, rank nodes capped at 5 | A DAG needs a pannable board; a strip is one screen |
| D9 | Enemy roster: grunt, runner, slinger, brute, bomber, bat, bulwark, wyvern, golem; **≤ 12 on the field** | Bombers need sky a 6-row board cannot spare; sea needs a water row; siege needs cavalry (P6) |
| D10 | Wallet `ts_coins` is **shared** with desktop; run, tech, best-wave, onboarding get `ts_m_*` keys | Progress follows the player; trees differ |
| D11 | Device tier fixed at boot (`low / mid / high`), rolling-FPS tier may only step **down** within it | P10; the first five seconds must not jank while an average settles |
| D12 | Low tier: DPR 1, draw every 2nd rAF, no reflection, no shine, 80 particles, 16 texts | mobile-fit §7.4 |
| D13 | Art ships as a **mobile set** (`public/images/m/…`, 50 % of desktop) and is probed **per wave roster** | ≤ 1.5 MB before wave 1 |
| D14 | One active ability: **Volley** (Arrow Rain, auto-aimed at the denser flank) | P5 |
| D15 | The desktop scene is not modified beyond the fix-now defects and the extraction of two composables it keeps using | The desktop build is live on two portals |

---

## 3. Architecture

### 3.1 Mode resolution — `src/use/useMobileFit.ts` (new)

```ts
export type FitMode = 'desktop' | 'pocket'            // 'dropmerge' arrives with plan 2
export const fitMode: Readonly<Ref<FitMode>>          // resolved ONCE, before the router mounts
export const isMobileFit = computed(() => fitMode.value !== 'desktop')
export const resolveFitMode = (): FitMode
```

Resolution order, first match wins:

1. `?fit=desktop|pocket` in `location.search` or hash (QA / Poki Inspector).
2. `pokiDeviceCategory.value` is `'mobile'` or `'tablet'` → `'pocket'`;
   `'desktop'` → `'desktop'`. (Requires `pokiPlugin.init()` to have run —
   `main.ts` already awaits it before `App.vue` imports.)
3. `matchMedia('(pointer: coarse)').matches && Math.min(innerWidth, innerHeight) < 600`
   → `'pocket'` (CrazyGames mobile, GamePix, Playgama on phones).
4. `'desktop'`.

The value is frozen for the session; a resize does not switch scenes (a run
cannot change board mid-way). Rotation only toggles the rotate overlay.

`src/router/index.ts`: the `'/'` route's `component` becomes a function that
returns `import('@/views/GameSceneMobile.vue')` when `fitMode.value === 'pocket'`
and `import('@/views/GameScene.vue')` otherwise, so the desktop chunk (111 KB
gz) never downloads on a phone.

### 3.2 The RuleSet seam — `src/game/rules.ts` (new)

```ts
export interface RuleSet {
  id: 'desktop' | 'pocket'
  board: {
    groundHalfWidth: number | 'tech'   // desktop 'tech' (= buildHalfWidth), pocket 3
    upperHalfWidth: number              // desktop 22, pocket 3
    maxRow: number                      // desktop Infinity, pocket 5
    waterRow: boolean                   // desktop true, pocket false
  }
  support: 'graph'                      // 'column' arrives with plan 2
  fall: { killCells: number; freeCells: number }   // desktop { 5, 0 }, pocket { 5, 0 }; plan 2 uses freeCells
  offers: {
    slots: number                       // 5 / 3
    lanes: ReadonlyArray<'structure' | 'weapon' | 'support' | 'any'>
    weaponSlot: number                  // 1 / 1
    supportSlot: number | null          // 4 / null
    shapes: ReadonlyArray<ShapeDef>     // SHAPE_DEFS / SHAPE_DEFS_POCKET
    rotation: boolean                   // true / false
    rerollMs: number                    // 5000 / 5000
    unlockRerollSlots: number[]         // slots rerolled when a tech unlock lands: [2,3] / [2]
  }
  blocks: {
    catalogue: ReadonlySet<string>      // every id / the 9 pocket ids
    foldStoneIntoWood: number | null    // null in both (plan 2 uses it)
  }
  enemies: {
    roster: ReadonlySet<string>
    maxOnField: number                  // Infinity / 12
    bomberAltitude: number | null       // null (use def) / null (no bombers)
    speedMul: number                    // 1 / 1
    airSpawn: 'sides'                   // 'top' arrives with plan 2
  }
  waves: {
    budgetMul: number                   // 1 / 0.5
    buildMs: number                     // 15000 / 12000
    maxWaveMs: number                   // 121000 / 70000
    spawnWindowMs: number               // 82000 / 40000
    flushAtMs: number                   // 96000 / 55000
    bossEvery: number                   // 10 / 10
    bossBudget: number                  // 0.6 / 0.6
    airFromWave: number                 // 9 / 5
    seaFromWave: number | null          // 12 / null
    siegeFromWave: number | null        // 14 / null
    previews: Readonly<Record<number, ReadonlyArray<readonly [string, number]>>>
    expectedPowerMul: number            // 1 / fitted (§7.3), start 0.5
    hpSlope: number                     // 0.135 / 0.11
    rewardMul: number                   // 1 / 0.7
  }
  difficulty: { hoardDivisor: number }  // 1 / 2
  economy: { startWood: number; startStone: number }   // 120,40 / 100,30
  tech: { nodes: ReadonlyArray<TechNode>; stateKey: string }   // TECH_NODES,'ts_tech' / TECH_NODES_POCKET,'ts_m_tech'
  merge: 'adjacency' | 'off'            // 'adjacency' / 'off'
  abilities: {
    arrowRain: 'aim' | 'auto'           // 'aim' / 'auto'
    cavalry: boolean                    // true / false
    rangeBoost: boolean                 // true / false
    speeds: ReadonlyArray<number>       // [1,2,3] / [1,2]
  }
  save: { runKey: string; bestWaveKey: string; onboardedKey: string; tutorialKey: string }
  camera: 'auto' | 'fixed'
}
export const DESKTOP_RULES: RuleSet
export const POCKET_RULES: RuleSet
```

`useTowerGame.ts` gets `let rules: RuleSet = DESKTOP_RULES` and
`export const applyRules = (r: RuleSet): void` (only legal while
`phase === 'build'` with no run in progress, or before `startRun`). The
following constants and call sites route through `rules` — this is the whole
list, so the refactor can be verified by grep:

| Today | Becomes |
|---|---|
| `UPPER_HALF_WIDTH` (l.116), `halfWidthAt` (l.833) | `rules.board.upperHalfWidth`; `r > rules.board.maxRow → -1`; ground row = `groundHalfWidth === 'tech' ? buildHalfWidth.value : groundHalfWidth` |
| `WATER_ROW` checks in `halfWidthAt`, `canMoorAt`, `canPlaceAt`, `canPlaceShapeAt` | guarded by `rules.board.waterRow` |
| `canPlaceAt`, `canPlaceShapeAt` | additional `rr > rules.board.maxRow` → false |
| `OFFER_SLOTS`, `WEAPON_SLOT`, `SUPPORT_SLOT`, `SLOT_LANES` (shapes.ts) | `rollOffer(slot, wave, unlocked, exclude, rand, avoid, laneCfg)`, `rollOffers(wave, unlocked, rand, laneCfg)`, `pickAffordableWeapon(wave, unlocked, canAfford, rand, pool)`, `eligibleShapes(wave, unlocked, pool)`; `laneCfg = rules.offers` |
| `rollOffer`'s works/non-works split | when `supportSlot === null` the `any` lane draws from the **whole** catalogue |
| `dealOffers`, `dealEnhancedOffers`, `rerollOffer`, `ensureAffordableWeapon`, `rerollTimers`, `offerEnhanced` initialisers, `watch(unlockedKey)` rerolling `[2, 3]` | sized/indexed from `rules.offers`; the unlock watch rerolls `rules.offers.unlockRerollSlots` (`offerEnhanced` is initialised with 4 entries today against 5 slots — fix as part of this) |
| `REROLL_COOLDOWN_MS` | `rules.offers.rerollMs` |
| `shapeRotations`, `canRotateShape` (shapes.ts) | return 1/false when `!rules.offers.rotation` (passed in, the module stays pure) |
| `availableBlocks` (useTowerProgress) | intersected with `rules.blocks.catalogue` |
| `mergeAt`, `settleMerges` | early-return unless `rules.merge === 'adjacency'` |
| `FALL_KILL_CELLS` | `rules.fall.killCells` |
| `spawnEnemy` bomber altitude | `rules.enemies.bomberAltitude ?? def.bombRun.altitude`; ground speed × `rules.enemies.speedMul` in `stepEnemies` |
| `stepSpawns` | spawns only while `liveEnemies() < rules.enemies.maxOnField`; the flush at `flushAtMs` also respects the cap (it releases into the queue, not onto the field) |
| `callWave` → `planWave(next, mul, firstRun)` | `planWave(next, mul, firstRun, rules.waves, rules.enemies.roster)`: `enemyPool`/`siegePool` filter by roster; `airShare/seaShare/siegeShare` start at the rule's waves (null → 0); `waveBudget × budgetMul`; previews from the rule; `pacedInterval` uses `spawnWindowMs` |
| `buildTimeMs`, `MAX_WAVE_MS`, `SPAWN_FLUSH_AT_MS` | `rules.waves.buildMs / maxWaveMs / flushAtMs` |
| `enemyHpScale(wave)` | `enemyHpScale(wave, rules.waves.hpSlope)` |
| `waveReward(wave)` | `× rules.waves.rewardMul` on wood and stone (coins untouched — the wallet is shared) |
| `adaptiveFactor(wave, power)` | `adaptiveFactor(wave, power, rules.waves.expectedPowerMul)` |
| `hoardFactor(w, s, c)` / `hoardTier` | thresholds ÷ `rules.difficulty.hoardDivisor` |
| `startRun` `startWood/startStone` | `rules.economy.* + sumEffect(levels, 'startWood'/'startStone', rules.tech.nodes)` |
| `saveRunSnapshot`, `resumeRun`, `hasSavedRun` | `rules.save.runKey`; the snapshot gains `rules: rules.id` and a snapshot from another mode is ignored |
| `isFirstSession`, `ONBOARDED_KEY` / `TUTORIAL_KEY` readers | `rules.save.onboardedKey / tutorialKey` |
| `callArrowRain(x)` | unchanged; the **scene** computes `x` in `'auto'` mode (§6.4) |
| `summonCavalry`, `cavalryCost`, `unreachableSiege`, `grantRangeBuff` | inert when the rule is off (return false / stay 0) |
| `GAME_SPEEDS`, `setGameSpeed` | `rules.abilities.speeds` |
| `runSummary`, `recordRunEnd` (useTowerProgress) | best-wave to `rules.save.bestWaveKey`; lifetime counters (`ts_total_*`, `ts_runs`) stay shared |

`useTowerProgress.ts`: `tech` loads from `rules.tech.stateKey`; every
`sumEffect(levels, kind)` call passes `rules.tech.nodes`; `affordableCount`,
`canBuy`, `isUnlocked`, `buyTech`, `sellTech` iterate `rules.tech.nodes`.
The module-level `tech` ref is initialised at import time from `ts_tech`, so
`applyRules` must call the progress module's `refresh()` (already exported
for the hydrate watchers) after switching the key — otherwise the pocket scene
would run on the desktop levels until the next cloud hydrate. `bestWave` and
the other `ts_*` readers switch keys the same way; the lifetime counters
(`ts_total_*`, `ts_runs`, `ts_total_coins`) stay shared. `availableBlocks`
recomputes from the new levels ∩ `rules.blocks.catalogue`.

`difficulty.ts`, `waves.ts`, `tech.ts`, `shapes.ts`, `enemies.ts` stay pure:
they take the parameters; only `useTowerGame` / `useTowerProgress` read the
rules object. `DESKTOP_RULES` reproduces every current constant, and
`tests/game/rules.test.ts` pins that (§11).

### 3.3 Camera — `useTowerCamera.ts`

Add a fixed mode:

```ts
export const setFixedFrame = (f: { cell: number; centreX: number; centreY: number }): void
export const isFixed = ref(false)
```

* `setViewport(w, h, top, bottom)` in fixed mode recomputes the frame from the
  board rules (§4.2) instead of touching `isManual`.
* `updateCamera` skips the spring and the auto target when fixed; `x, y, zoom`
  are set directly and `publishSpan()` runs once per viewport change.
* `panBy`, `zoomAt`, `beginPinch`, `updatePinch`, `recenter` return early when
  fixed (the mobile scene never calls them, but the keyboard handler and tests
  might).
* `snapToFit` in fixed mode = `setFixedFrame` of the current viewport.

### 3.4 Device tier and render profile — `src/use/useDeviceTier.ts` (new)

```ts
export type DeviceTier = 'low' | 'mid' | 'high'
export interface RenderProfile {
  dpr: number                    // high 2, mid 1.5, low 1
  drawEvery: 1 | 2               // low 2: drawScene on every other rAF; sim still steps every frame
  reflection: 'live' | 'static' | 'off'
  shine: boolean                 // per-block animated gradients
  particleCap: number            // 220 / 150 / 80
  textCap: number                // 24 / 16 / 16
  fixtureAimSteps: number        // 48 / 24 / 16
  fixtureLanes: number           // 8 / 4 / 4
  fixtureCacheMax: number        // 640 / 320 / 192
  bakeMonsters: boolean          // desktop true; mobile false (painted strips only)
  stripFrames: 16 | 8            // 16 / 8 / 8
  smokeSprites: boolean          // mobile true: baked radial puff instead of createRadialGradient
  decalSprites: boolean
}
export const deviceTier: Readonly<Ref<DeviceTier>>
export const renderProfile: Readonly<Ref<RenderProfile>>
export const resolveDeviceTier = async (): Promise<DeviceTier>
```

Tier inputs, in two stages so the tier never delays loading:

1. **Synchronous, before the scene mounts**: `?tier=` override;
   `pokiDeviceCategory`; `navigator.hardwareConcurrency` (≤ 4 → low
   candidate); `navigator.deviceMemory` (≤ 3 → low candidate);
   `devicePixelRatio`; the UA's Android major version (≤ 9 → low candidate).
   Two candidates → `low`, one → `mid`, none → `high`. This is the profile the
   first frame renders with, and `gameLoadingFinished` / `signalGameplayLoaded`
   fire exactly as today.
2. **In the first build phase's idle time** (`requestIdleCallback`, before
   wave 1 is called): a 300 ms micro-benchmark that blits 400 cached 44 px
   sprites per frame into an offscreen canvas and counts frames (< 40 → low,
   < 55 → mid). It may only **lower** the tier; the render profile is
   re-applied before the wave (caches are cleared, the DPR cap re-runs
   `resize()`).

Desktop mode always resolves `high` with the existing behaviour (this file
must not change the desktop build's output — pinned by test).

The rolling-FPS tier in `useTowerVfx.sampleFrame` may only lower the effective
profile (particle cap, `drawEvery`) and never raise it above the boot tier.

### 3.5 Renderer — `useTowerArt.ts`

* `drawScene(ctx, w, h, dtMs, dpr, profile)`: reads `renderProfile`.
* **Sky + background**: when `isFixed`, `drawSky` renders into `bgCanvas`
  together with mountains/forest (`renderBackground`), re-baked only when
  `dayPhase()` has advanced ≥ 1/45 of the cycle (every 4 s) or the viewport
  changed; the per-frame full-canvas gradient fill goes away.
* **Reflection**: today `drawReflection` runs only while the rolling tier is
  `high`, so under load it is already off. The profile makes that a boot-time
  decision: `'static'` → a `reflCanvas` baked on `towerVersion` change
  (mirrored blit of the block bodies only, alpha 0.2); `'off'` → skipped;
  `'live'` → today's path. The rolling tier no longer toggles it.
* `shineOn = profile.shine && size <= SHINE_MAX_BLOCKS`.
* `FIXTURE_AIM_STEPS`, `FIXTURE_LANES`, `FIXTURE_CACHE_MAX` become profile reads
  (the cache key includes them).
* `primeMonsterSprites` is skipped when `!profile.bakeMonsters`. The painted
  strips are already 8 frames (1824 × 256 = 8 × 228 × 256), and the slicer
  (`spriteStrip.ts`) reads the frame count off the image, so the mobile set at
  50 % (912 × 128, 114 × 128 per frame) needs no code — only the export.
* Particle draw: `pshape === 3` (smoke) and decals blit a baked radial sprite
  (one 64 px canvas per colour, cached) when `profile.smokeSprites`.
* Floating text cap from the profile; on low tier `strokeText` is replaced by
  `fillText` with `shadowBlur 0` + a 1 px offset shadow.
* `drawEvery`: the scene's `loop` calls `drawScene` only on even frames when
  `profile.drawEvery === 2`; VFX stepping (`stepParticles`, `stepTexts`,
  `stepDecals`) then runs with the accumulated `dt` so motion stays correct.

### 3.6 Art probing — `art.ts`

* `spriteFor` folder root becomes `profile.dpr <= 1.5 ? '/images/m' : '/images'`
  (the mobile set is the same file names at 50 %). Falls back to the desktop
  folder on a 404 so a missing mobile file never shows a procedural body.
* `warmSpriteProbes(blockIds, enemyIds)` is called with the **current wave's
  roster + the next wave's** from `callWave` / `completeWave` (via
  `previewNextWave()`), not with the whole cast at boot. The first-frame prime
  of siege/ally/ship strips in `drawScene` is gated by `rules`.

### 3.7 Save keys — `keys.ts`

```ts
export const M_RUN_KEY = 'ts_m_run'
export const M_TECH_KEY = 'ts_m_tech'
export const M_BEST_WAVE_KEY = 'ts_m_best_wave'
export const M_ONBOARDED_KEY = 'ts_m_onboarded'
export const M_TUTORIAL_KEY = 'ts_m_tutorial'
```

`SaveMergePolicy.computeMeta` progress score adds `mBestWave × 500`;
`localLooksFresh` also checks `ts_m_best_wave`. Leaderboard board id gets a
`-m` suffix in `useLeaderboard` when `isMobileFit` (the Worker is off on Poki
anyway).

### 3.8 Scene composition

Two composables are **extracted from `GameScene.vue`** (behaviour-preserving;
the desktop scene consumes them first and its tests stay green):

* `src/use/useSceneFlow.ts` — the result flow: defeat → `maybeShowInterstitial`
  → result → tech → restart, `presentDefeat`, `recordRun` feeding, the
  first-run bonus, the grace continue, `twoXAvailable`, `deathTip`.
* `src/use/useRewardedPerks.ts` — enhanced hand, triple wave payout, speed
  buy, range boost, their readiness and the 6-per-5-min allowance glue.

New files:

* `src/views/GameSceneMobile.vue` — the pocket scene (§6). Small: canvas, two
  rails, the drag state machine, the bubble, overlays, `FReward` result,
  `TechStripsModal`, `OptionsModal`, `RotateOverlay`.
* `src/components/game/OfferRail.vue` — three `ShapeTile`s stacked, drag
  source, per-tile swap button (44 px), price chips.
* `src/components/game/StatusRail.vue` — wave, gate bar, wood/stone/gold,
  coin badge, Volley button, "⋯" drawer (options, mute, missions, chest).
* `src/components/game/BlockBubble.vue` — Repair / Upgrade / Sell.
* `src/components/organisms/TechStripsModal.vue` — three strips.
* `src/components/atoms/RotateOverlay.vue`.
* `src/game/pocket/shapes.ts`, `tech.ts`, `roster.ts`, `rules.ts` (the
  `POCKET_RULES` tables, §5).

---

## 4. Board and frame

### 4.1 Board

* Columns −3…+3, rows 0…5. Gate at (0,0), 41 buildable cells.
* Legal cell: empty, `|c| ≤ 3`, `0 ≤ r ≤ 5`, and (row 0 or orthogonally touching
  a block) — `canPlaceAt` unchanged apart from the bounds.
* Support: Gate flood fill, orphan fall, fall damage `min(1, cells/5)`, crush,
  boss knockback — unchanged.

### 4.2 Fixed frame (landscape)

```
rowsFramed  = 6 (board) + 1.0 (beach/water below row 0) + 1.5 (sky above row 5) = 8.5
cell        = clamp(36, (viewH − insetTop − insetBottom) / 8.5, 72)      // insets = safe areas only, the rails are beside the board
centreX     = 0
centreY     = (5 + 1 + 1.5 − 1.0) / 2 = 3.25 world units                 // frame spans y ∈ [−1.0, 7.5]
zoom        = cell px per world unit
```

| Viewport (landscape) | cell | board width | rail | visible lane per side |
|---|---|---|---|---|
| 640 × 360 (old 16:9 low-end) | 40 | 280 px | 96 px | 84 px ≈ 2.1 cells (+ ~2.4 under the rail) |
| 740 × 360 (18.5:9 low-end) | 40 | 280 px | 96 px | 134 px ≈ 3.4 cells |
| 844 × 390 (iPhone 12–15) | 44 | 308 px | 120 px | 148 px ≈ 3.4 cells |
| 926 × 428 (Pro Max) | 48 | 336 px | 132 px | 163 px ≈ 3.4 cells |
| 1024 × 768 (tablet) | 72 (cap) | 504 px | 132 px | 128 px ≈ 1.8 cells + under-rail |

Enemies keep spawning at `min(bounds.minC − 6, viewLeft − 2)`: on an 844 px
phone that is ≈ 11.6 cells out, an ~8 s walk to the wall, visible for ≈ 6 s.

Rails are DOM over the full-screen canvas (`pointer-events: auto` on the
rails, `none` on the HUD container) so units walk in beneath them. Rails carry
`padding-left/right: env(safe-area-inset-*)`.

### 4.3 Portrait on a phone

`RotateOverlay` covers the scene while `orientation === 'portrait'` and
`min(innerW, innerH) < 600`; the simulation pauses through `useGamePause`
(reason `'rotate'`) so an ad or a wave cannot run under it; audio follows the
pause gate. Tablets never show it.

---

## 5. Content tables (`src/game/pocket/*`)

### 5.1 Block catalogue

`wood, brace, stone, archer, cannon, bombard, tesla, spikes, lumberHut` —
definitions unchanged. `lumberHut` gains an `unlockNode` **only in the pocket
tech table** (via `rules.blocks.catalogue` ∩ `unlockedBlocks(levels)`; the
block def itself is untouched so the desktop stays un-gated). Start unlocked:
`wood, stone, archer, cannon`.

### 5.2 Shapes — `SHAPE_DEFS_POCKET`

All entries are existing ids unless marked *new*. `preRotated(id)` generates
`id~r1`, `id~r2`, `id~r3` from `rotatedShape` at module load; they carry the
base shape's weight ÷ 4 each and share its `shapeSignature`.

| Lane | Shapes | Notes |
|---|---|---|
| structure | `w1`, `w2h`, `w2v`, `w3h`, `wL` + `wL~r1..3`, `wJ` + `wJ~r1..3`, `s1`, `s2h`, `s2v`, `sL` + `sL~r1..3` | crate ladder (`wood → brace → spikes`) applies as today |
| weapon | `archer1`, `archerPerch`, `cannon1`, `cannonMount`, `bombard1`, `bombardPit`, `tesla1`, `teslaSpire`, `archerPair` (minWave 4) | all ≤ 3 cells |
| support / any | `spikes1`, `spikeWall` (minWave 5), `lumberHut1` | dealt through `any` |

Excluded: `wO`, `wT`, `wS`, `wZ`, `sO`, all `*Roof*`, mortar/frost/repair/
banner/obelisk/coffer/stonepit/naval pieces. `rotation: false`.

### 5.3 Tech — `TECH_NODES_POCKET`

`tier` = strip index (0 Arms, 1 Walls, 2 Supply), `col` = position 0…3;
each node `requires` the previous node in its strip. `icon` reuses the
desktop icons; names/descriptions reuse `tech.nodes.<desktopId>.*` keys where
the effect is identical and add `tech.nodes.m_lumberHut.*`.

| id | strip | pos | maxLevel | costBase | growth | effect |
|---|---|---|---|---|---|---|
| `m_sharpBolts` | Arms | 0 | 5 | 42 | 1.30 | damage +8 % |
| `m_bombard` | Arms | 1 | 1 | 180 | 1 | unlock `bombard` |
| `m_rapidFire` | Arms | 2 | 5 | 70 | 1.32 | fireRate +8 % |
| `m_tesla` | Arms | 3 | 1 | 265 | 1 | unlock `tesla` |
| `m_foundations` | Walls | 0 | 5 | 28 | 1.28 | blockHp +8 % |
| `m_brace` | Walls | 1 | 1 | 42 | 1 | unlock `brace` |
| `m_gateArmor` | Walls | 2 | 5 | 140 | 1.33 | gateHp +15 % |
| `m_spikes` | Walls | 3 | 1 | 63 | 1 | unlock `spikes` |
| `m_lumberStock` | Supply | 0 | 5 | 38 | 1.26 | startWood +20 |
| `m_richHauls` | Supply | 1 | 5 | 154 | 1.30 | waveReward +10 % |
| `m_lumberHut` | Supply | 2 | 1 | 110 | 1 | unlock `lumberHut` |
| `m_looting` | Supply | 3 | 5 | 250 | 1.31 | coinDrop +12 % |

`techCost` unchanged (first rank of a repeatable node half price). The coin
reward per wave (`6 + 3·wave`) is **not** scaled by `rewardMul` (the wallet is
shared with desktop), so a first run that dies on wave 5–7 pays ≈ 60–110
coins plus the `5 + 4·waves` floor: `m_foundations` r1 (14), `m_lumberStock`
r1 (19), `m_sharpBolts` r1 (21) and `m_brace` (42) are all reachable after the
first death — the visible unlock is in reach on run one.

### 5.4 Enemies and waves — `POCKET_RULES.enemies / waves`

Roster `grunt, runner, slinger, brute, bomber, bat, bulwark, wyvern, golem`
(`bulwark` minWave 12 → previewed at 9, in pool from 11 via the rule's
`minWaveOverride: { bulwark: 11, wyvern: 14 }`). `maxOnField 12`.

| Rule | Value |
|---|---|
| `budgetMul` | 0.5 |
| `buildMs` | 12 000 |
| `maxWaveMs` / `spawnWindowMs` / `flushAtMs` | 70 000 / 40 000 / 55 000 |
| `bossEvery` / `bossBudget` | 10 / 0.6 |
| `airFromWave` / cap | 5 / 0.35 (same slope as desktop, shifted) |
| `seaFromWave`, `siegeFromWave` | null |
| `previews` | 3: bat×1 · 4: bat×2 · 6: bomber×1 · 9: bulwark×1 |
| `hpSlope` | 0.11 |
| `rewardMul` | 0.7 (wood/stone only) |
| `expectedPowerMul` | 0.5 to start; fitted in §7.3 |
| `hoardDivisor` | 2 |
| `economy` | 100 wood / 30 stone |

`firstRunBudgetScale` (0.6 / 0.8) and the scripted opening fort apply as
today (the fort fits the board).

---

## 6. The mobile scene — `GameSceneMobile.vue`

### 6.1 Layout

```
┌──────────┬──────────────────────────────────────┬──────────┐
│ StatusRail│  canvas (full screen underneath)      │ OfferRail│
│ W 7  ▮▮▮ │                                      │ [tile 64]│
│ gate ████│      board 7 × 6, cell 40–48 px       │ [tile 64]│
│ 🪵 240   │                                      │ [tile 64]│
│ 🪨  60   │   ◄ lane          Gate          lane ►│ [swap ×3]│
│ 🪙  35   │                                      │ CALL WAVE│
│ ⓒ 120    │                                      │ 0:09 +30%│
│ [Volley] │                                      │ [1× 2×]  │
│ [⋯] [🔊] │                                      │          │
└──────────┴──────────────────────────────────────┴──────────┘
  96–132 px                                           96–132 px
```

* Every control ≥ 44 × 44 px; the swap buttons sit **below** each tile, not on
  its corner.
* Warnings (`waveWarnings`) render as one line above CALL WAVE in the right
  rail; the wave-clear toast pins to the top-centre band (the only free strip)
  and the Poki pill is moved there too (`pokiMovePill(50, 8)` — check the
  pill's real rect in the Inspector; it must not sit over the toast for more
  than its 3.4 s life, so the toast takes the band *below* the pill).
* The tutorial offer (`TutorialPrompt`) and coach marks reuse the existing
  components; their anchors project through the fixed camera.

### 6.2 Pointer state machine

```
IDLE
 ├─ pointerdown on OfferRail tile ──► PRESSED(slot, t0)
 │     ├─ move > 10 px ──► DRAGGING(slot)
 │     │      move: ghost = finger − (0, 1.25 cells); anchor = nearest legal anchor of the shape
 │     │            within 0.8 cells of the ghost's anchor cell (legalAnchors(shape) — computed
 │     │            once per towerVersion, ≤ 41 candidates); overlay shows silhouette + snap outline
 │     │      up:   anchor ? placeShape(slot, c, r, 0) : cancel; ──► IDLE (or ARMED if the
 │     │            refilled slot is affordable and the drag was placed — keeps the flow going)
 │     └─ up < 10 px ──► ARMED(slot)   (tap)
 ├─ ARMED(slot): tap board → nearest legal anchor ≤ 0.6 cells → placeShape, else refuse tick
 │     tap the same tile → IDLE; tap another tile → ARMED(other)
 ├─ pointerdown on canvas over a block, held 450 ms without moving ──► BUBBLE(block)
 │     tap Repair / Upgrade / Sell → action, stay in BUBBLE while it is affordable; tap elsewhere → IDLE
 ├─ tap Volley ──► fires at once (§6.4)
 └─ pointerdown on empty canvas + move ──► nothing (no pan exists)
```

Implementation notes:

* `legalAnchors(shapeId)` = every `(c, r)` in the board for which
  `canPlaceShapeAt(shapeId, c, r, 0)`; recomputed on `towerVersion`, cached per
  shape id. Snap distance is measured between the ghost's anchor cell (the
  shape's `[0,0]` cell under the lifted ghost) and the candidate anchor.
* `BuildOverlay` (renderer) gains `ghostX?: number; ghostY?: number` (world
  units, fractional) so `drawBuildOverlay` can draw the silhouette floating at
  the finger and the snapped outline at `(hoverC, hoverR)` in green, or the
  silhouette alone in red when no anchor is within reach.
* `pointercancel` (browser stole the gesture) → cancel the drag, no charge.
* `touch-action: none` on the canvas and rails is already the convention.
* The BuildTray's 380 ms info press is **not** reproduced; the bubble's
  "ⓘ" chip on a tile opens the same info box on tap (`blocks.descriptions.*`
  are already translated).

### 6.3 Boot

Same as the desktop `boot()`: `playFirstStartInterstitial` → `resumeRun()`
(reads `ts_m_run`) or `beginRun()` → `resize()` → `snapToFit()` (fixed frame)
→ `startBattleMusic` → `signalGameplayLoaded`. `applyRules(POCKET_RULES)` runs
in `setup` before any of it. `resolveDeviceTier()` is awaited in `main.ts`
after the platform init so the profile is known before the first frame.

### 6.4 Volley (Arrow Rain, auto)

`onVolley`: `x = denserFlank()` where the score per side is
`Σ (enemy.maxHp) over ground enemies with sign(x) = side` (ties → the side
whose nearest enemy is closer); `callArrowRain(x_centroid)` with the existing
`ARROW_RAIN_RADIUS`. Stock/charge logic unchanged; the rail button shows the
existing ring fill.

### 6.5 Result, tech, rewarded

`useSceneFlow` and `useRewardedPerks` (§3.8) provide the same behaviour as
desktop. The result modal uses the landscape two-column layout the desktop
already has (`@media (max-height: 640px) and (min-width: 28rem)`).
`TechStripsModal` replaces `TechTreeModal`: three horizontal strips, the
detail card below, coin balance in the header, the three-beat intro reused
(`ts_m_tech_intro`).

---

## 7. Balance work

### 7.1 What changes vs desktop and why

Half the board (41 vs ~80 cells in a competent wave-15 tower) → `budgetMul
0.5`; fewer, tougher units (`maxOnField 12`, `hpSlope 0.11`) so the wall is
bitten rather than swarmed; `rewardMul 0.7` so the board fills around wave 8
and run-gold ranks become the sink from there (the inspector's Upgrade already
does this; its cost curve `blockUpgradeCost` stays).

### 7.2 Replay harness

`tools/balance-replay.ts` gains `--rules pocket` which applies `POCKET_RULES`
(board cap of 41 blocks in the build policy, roster, budget, reward, hp slope)
and prints the same columns. The greedy and naive policies are kept; a third,
`pocket`, spends on ≤ 3-cell pieces and stops at the cap.

### 7.3 Fit `expectedPowerMul`

Run the replay for 20 waves with `expectedPowerMul` from 0.35 to 0.65 in 0.05
steps; pick the value where the greedy policy's mean `power / expected` is
1.00 ± 0.05 and the naive policy survives ≥ wave 12. Record the chosen value
and the table in `balancing.md` §10.

### 7.4 In-game checks

* Wave 1–2 first session: the fort survives untouched; wave 3 costs ≤ 1 block.
* Wave 8: board ≥ 80 % full for the greedy policy.
* Wave 10 boss: killable by a full board with two ranks on the cannons.
* No hand is fully unaffordable more than once per run (the relief in
  `ensureAffordableWeapon` still fires).

---

## 8. Performance work (phase E)

Each lever is an experiment against the baseline, measured with the
`web-game-performance-optimize` skill's A/B/A/B runner at 4× and 6× throttle
on the **pocket wave-9** and **pocket wave-16** scenes (the probe's
`perf3` mode is the seed for the scenario). Keep a lever only if it beats the
baseline; record null results in the ledger.

| # | Lever | Where | Gate |
|---|---|---|---|
| E1 | DPR cap from the profile | `GameSceneMobile.resize` | −10 pp frames > 33 ms at 4× |
| E2 | Fixed camera → sky + background baked; re-bake ≤ every 4 s (today the background re-rasterises on every quarter-cell camera move, i.e. throughout every auto-fit spring) | `useTowerArt.drawSky / renderBackground` | measurable at 6×; expected to be the largest single win after the enemy cap |
| E3 | Reflection decided at boot (static / off) | `drawReflection` | expected **null** under load (it is already off below the `high` rolling tier) — keep only if the ledger shows a gain at `mid`; the point is removing the tier flicker |
| E4 | Shine/buff gradients off | `SHINE_MAX_BLOCKS` → profile | measurable at 42 blocks |
| E5 | Fixture aim steps 16, lanes 4, cache 192 | `fixtureCache` | memory ≤ 100 MB (Chrome `performance.measureUserAgentSpecificMemory` where available, else `about:memory` on Android) |
| E6 | Particle caps 220/150/80 + baked smoke/decal sprites | `useTowerVfx` | no `createRadialGradient` in the frame profile |
| E7 | Text cap + no stroke on low | `drawFloatingTexts` | — |
| E8 | Draw every 2nd rAF on low | `GameSceneMobile.loop` | p50 ≤ 33 ms at 6× on wave 9 |
| E9 | No procedural monster bake; 8-frame strips at 96 px on low | `primeMonsterSprites`, `public/images/m/monsters` | no long task > 100 ms after the first frame |
| E10 | Probe by wave roster; mobile art set | `warmSpriteProbes`, `art.ts` | ≤ 1.5 MB transferred before wave 1 |
| E11 | Enemy field cap 12 | `stepSpawns` | — |

Exit gates for the phase: pocket wave-9 p95 ≤ 33 ms at 4× (today 50.6 ms);
wave-16 p95 ≤ 50 ms at 4×; p50 ≤ 33 ms at 6×; steady ≥ 30 fps on a Galaxy
A12 / Redmi 9A and ≥ 50 fps on a Galaxy A52 / iPhone SE 2 for a full run to
wave 12; first interactive frame ≤ 3 s on Chrome "Slow 4G"; no crash or
tab-reload on a 2 GB device across three consecutive runs.

---

## 9. Platform (Poki first)

* `pokiMovePill` to the top-centre band; verify the pill rect in the Inspector.
* `gameplayStart/Stop` bracket unchanged (`useGameplayLifecycle`); the rotate
  overlay and the bubble both go through `useGamePause` so `gameplayStop`
  fires while they are up.
* `commercialBreak` after wave clear (120 s floor) and before the result —
  unchanged; verify the toast is held while the break plays (existing
  `toastHeld`).
* Rewarded: reinforced hand, 3× wave, 2× result coins, continue, 2× speed — via
  `useAdGate`'s 6-per-5-min allowance. Buttons ≥ 44 px, all with the movie
  badge only when gated.
* No external requests: leaderboard off (`.env.poki`), art from the bundle.
* Save: `ts_m_*` fields inside the same blob; the blob stays far under 1 MB.
* Orientation: declare **landscape** on the P4D game page; keep the in-game
  overlay so the Inspector matches production.
* Inspector "Warnings" tab must be empty: the per-wave probe means no 404s
  for art that is not shipped; the mobile set must be complete for the pocket
  catalogue and roster (a test lists every path §11).
* CrazyGames mobile QA: the same mode through `pointer: coarse`; CG's own
  orientation setting → landscape.

---

## 10. i18n

New keys (English first, then every one of the 21 locales, key-parity test):
`mobile.rotate` ("Turn your phone sideways to play"), `hud.volley`,
`hud.swap`, `tech.strips.arms|walls|supply`, `tech.nodes.m_lumberHut.name|desc`,
`hints.dragToPlace` ("Drag a piece onto the tower"), `hints.dropToPlace`
("Let go on the glowing spot"), `blocks.bubble.repair|upgrade|sell` (reuse the
existing `blocks.repair|upgrade|sell` — no new keys), `tutorial.m.pick|place|call`.
Desktop node names are reused for `m_*` ids through a `TECH_NAME_KEY` map
(`m_sharpBolts → sharpBolts`, …) so no string is duplicated.

---

## 11. Tests

New files, all vitest:

| File | Pins |
|---|---|
| `tests/game/rules.test.ts` | `DESKTOP_RULES` equals every current constant; `applyRules` refuses mid-run; snapshot of another mode is ignored |
| `tests/game/pocketBoard.test.ts` | `halfWidthAt` = 3 for rows 0–5, −1 above; no water row; `canPlaceShapeAt` refuses row 6; support/collapse unchanged |
| `tests/game/pocketOffers.test.ts` | 3 lanes; no shape > 3 cells; no roofs; `lumberHut1` reachable through `any`; pre-rotated ids share a signature; reroll avoids the same signature; `offerEnhanced` length = slots |
| `tests/game/pocketTech.test.ts` | strip ordering (`requires` = previous); every `m_*` effect kind is one `sumEffect` understands; `ts_m_tech` never touches `ts_tech`; rank cap 5 |
| `tests/game/pocketWaves.test.ts` | roster filter (no sea/siege/bombardier ever); `maxOnField` cap incl. flush; previews; `budgetMul`; boss cadence; `expectedPowerMul` passed through |
| `tests/game/fixedCamera.test.ts` | cell table §4.2; board fully inside `[insetTop, viewH − insetBottom]`; `panBy`/`zoomAt` inert; `setViewSpan` published once per viewport |
| `tests/game/dragPlacement.test.ts` | `legalAnchors` vs brute force; snap ≤ 0.8 places, > 0.8 cancels; tap fallback ≤ 0.6; cancel never charges |
| `tests/game/renderProfile.test.ts` | tier → profile table; desktop mode always `high` and identical to today; rolling tier only lowers |
| `tests/game/volleyAuto.test.ts` | denser flank selection; tie-break |
| `tests/ui/mobileSceneLayout.test.ts` | jsdom sweep 640×360, 740×360, 844×390, 926×428, 1024×768: rails ≥ 96 px, board inside, every control ≥ 44 px (source-asserted like `slottedIconSizing.test.ts`) |
| `tests/save/mobileKeys.test.ts` | separate run/tech/best keys; shared wallet; merge-policy score includes `ts_m_best_wave`; `localLooksFresh` |
| `tests/platforms/fitMode.test.ts` | resolution order; `?fit=`; Poki tablet → pocket; desktop category → desktop; CG coarse pointer |
| `tests/art/mobileArtManifest.test.ts` | every block in the pocket catalogue and every monster in the roster has a file under `public/images/m/` |
| `tests/i18nParity.test.ts` | unchanged — it will catch missing locale keys |

Existing suites must stay green throughout; phase A2 is not done until they do
with `DESKTOP_RULES` in place.

---

## 12. Telemetry for the decision rule (mobile-fit §9)

Poki forbids external requests, so production telemetry is Poki's own P4D
dashboard (playtime, D1/D7, mobile share). Placement error rate is measured
in an **instrumented internal build** (`?telemetry=1`): the scene keeps
counters `placeAttempt`, `placeCancel`, `placeSnapDistance[]`,
`bubbleOpens`, `volleyUses`, `sessionMs`, printed to the console and to a
`ts_m_telemetry` field that is cleared on export. Ten playtesters × two
sessions is the sample; the switch condition is cancel ÷ attempt > 15 % after
the tutorial.

---

## 13. Execution checklist

Effort in engineer-days; "shared" items are reused by plan 2 unchanged.

### Phase A — foundation (shared) — ≈ 6 d
*Done when:* the desktop build is byte-for-byte equivalent in behaviour (full suite green, `DESKTOP_RULES` pinned), `?fit=pocket` mounts an empty mobile scene with a fixed frame on a phone UA, and the landscape defects are gone on the desktop scene.
- [ ] A0 Fix-now defects in the desktop scene: landscape `measureInsets` includes the bottom bar; wallet column no longer stacks the chest under the badge in landscape; reroll pip ≥ 32 px and moved off the tile corner; rotate buttons ≥ 44 px; tray info box opens on tap of an "ⓘ" chip (mobile-fit §7.5 1–3)
- [ ] A1 `useMobileFit.ts` + `?fit=` override + router split; `main.ts` resolves it after platform init
- [ ] A2 `src/game/rules.ts`, `DESKTOP_RULES`, `applyRules`, every call site in §3.2 routed; `tests/game/rules.test.ts`; full suite green
- [ ] A3 `useDeviceTier.ts` + `RenderProfile`; `renderProfile` read by `drawScene`, `useTowerVfx`, the scene loop; desktop output unchanged (test)
- [ ] A4 Fixed camera mode in `useTowerCamera.ts` (+ `setFixedFrame`, inert pan/zoom); `tests/game/fixedCamera.test.ts`
- [ ] A5 Extract `useSceneFlow.ts` and `useRewardedPerks.ts` from `GameScene.vue`; desktop consumes them; tests green
- [ ] A6 Per-wave art probing + `public/images/m/` root in `art.ts` (mobile set generated by `tools/slice-sheets.mjs --scale 0.5`; hand-check the 9 blocks + 11 monsters + fixtures)
- [ ] A7 Save keys `ts_m_*`, merge-policy score, `localLooksFresh`; `tests/save/mobileKeys.test.ts`

### Phase B — pocket rules — ≈ 2 d
*Done when:* a headless run under `POCKET_RULES` (tests) deals only pocket pieces, never places above row 5 or beyond ±3, never spawns a sea/siege/bomber unit, and holds ≤ 12 enemies on the field.
- [ ] B1 `src/game/pocket/shapes.ts` (`SHAPE_DEFS_POCKET`, `preRotated`), `tests/game/pocketOffers.test.ts`
- [ ] B2 `src/game/pocket/tech.ts` (`TECH_NODES_POCKET`, name-key map), `tests/game/pocketTech.test.ts`
- [ ] B3 `src/game/pocket/rules.ts` (`POCKET_RULES` incl. roster, waves, economy), `tests/game/pocketBoard.test.ts`, `tests/game/pocketWaves.test.ts`
- [ ] B4 Offer dealer generalised (lanes, `any` draws works when no support slot, `unlockRerollSlots`)

### Phase C — the mobile scene — ≈ 4 d
*Done when:* a full run to a defeat and a second run through the tech strips can be played one-handed on an 844×390 phone UA in the CDP harness with no control under 44 px, no pan/pinch handler registered, and a cancelled drag never charging.
- [ ] C1 `GameSceneMobile.vue` skeleton: canvas, loop with `drawEvery`, boot, resize → fixed frame, rotate overlay + pause reason
- [ ] C2 `StatusRail.vue`, `OfferRail.vue` (drag source, 44 px swap), price chips, "⋯" drawer (options, mute, missions, chest)
- [ ] C3 Pointer state machine §6.2, `legalAnchors`, `BuildOverlay.ghostX/Y` + renderer ghost; `tests/game/dragPlacement.test.ts`
- [ ] C4 `BlockBubble.vue` (Repair / Upgrade / Sell) on long-press
- [ ] C5 Volley auto-aim; `tests/game/volleyAuto.test.ts`
- [ ] C6 Result flow + rewarded perks wired through the extracted composables; `TechStripsModal.vue` with intro; warnings line; toast band
- [ ] C7 Tutorial: opening fort + three coach marks (drag / drop / call) on `ts_m_tutorial`
- [ ] C8 Layout sweep test `tests/ui/mobileSceneLayout.test.ts`; manual check at 640×360 and 926×428 in the CDP harness

### Phase D — i18n and art — ≈ 1 d
*Done when:* the parity test passes with every new key in all 21 locales and the mobile art manifest test finds a file for every pocket block, fixture and roster monster.
- [ ] D1 Keys in §10, English then all 21 locales; parity test green
- [ ] D2 `tests/art/mobileArtManifest.test.ts`; Inspector warnings empty

### Phase E — performance — ≈ 3 d
*Done when:* every gate in §8 is met on the throttle proxy and on the two real device classes, with the ledger recording each lever's A/B result (including the null ones).
- [ ] E0 Fold the CDP probe into `tools/perf-probe.mjs` (`shots`, `perf3` scenarios) and record the baseline in the perf ledger
- [ ] E1–E11 as §8, each A/B'd and recorded; exit gates met on the throttle proxy
- [ ] E12 Real-device pass: Galaxy A12 / Redmi 9A class, Galaxy A52 / iPhone SE 2 class, one tablet — full run to wave 12 each, fps + memory + no reload

### Phase F — platform and release QA — ≈ 1.5 d
*Done when:* the Poki Inspector shows no warnings, the gameplay/ad event log for one full run matches the expected bracket sequence, and a reload mid-run on a cloud-save platform restores the pocket tower.
- [ ] F1 Poki: pill position, orientation declared, `gameplayStart/Stop` around overlay/bubble/ads, commercial break before result, rewarded allowance, no external requests, Inspector clean
- [ ] F2 CrazyGames mobile QA pass with the same mode via coarse pointer
- [ ] F3 Playbook phase check (`new-web-game-playbook` release QA prompts: ad-audio mute, ad-before-result ordering, rewarded readiness)
- [ ] F4 Cloud-hydration proof for `ts_m_run` on a platform with cloud save (`verify-cloud-save-hydration`)

### Phase G — balance and playtest — ≈ 1.5 d
*Done when:* `expectedPowerMul` is recorded with its replay table in `balancing.md`, and the playtest counters plus the decision-rule verdict are appended to `mobile-fit.md`.
- [ ] G1 `tools/balance-replay.ts --rules pocket`; fit `expectedPowerMul` (§7.3); record in `balancing.md` §10
- [ ] G2 Instrumented playtest (§12); decision rule evaluated; findings appended to `mobile-fit.md`

---

## 14. Risks and rollback

| Risk | Mitigation |
|---|---|
| The RuleSet refactor changes desktop behaviour | `DESKTOP_RULES` test pins every constant; the full suite (671 tests) must stay green before any pocket value is added; ship the desktop build from the refactor commit only after a CG pre-release QA pass |
| Landscape-only hurts Poki mobile engagement | Decision rule in mobile-fit §9; plan 2 is the fallback and shares phase A |
| Drag placement still error-prone at 40 px | Snap radius is a constant (`SNAP_CELLS 0.8`) that can widen; the tap fallback stays; telemetry decides |
| 41 cells feel small | Ranks are the late sink; if runs stall, a 7×7 variant costs one constant (`maxRow 6`) and a re-check of §4.2 (cell drops to ~40 px at 390 tall) |
| Low-end devices still under 30 fps after E1–E11 | `drawEvery 3` is a one-line escalation; enemy cap 10; strips at 64 px |
| Poki rejects the rotate overlay | Declare landscape on P4D so the platform's own overlay is used and hide ours when `isPokiSdkActive` |

Rollback: `fitMode` is resolvable to `'desktop'` by URL and by a build flag
(`VITE_APP_FIT_FORCE=desktop`), which restores the current behaviour on every
platform without a code revert.

---

## 15. Open questions (do not block phase A)

1. Should tablets in **portrait** get the pocket scene rotated (rails top and
   bottom) or the rotate overlay? Default: overlay on phones only; tablets
   play either way with rails at the sides in landscape and at the bottom in
   portrait (a second grid template, same components).
2. Do we keep the 5-second per-slot swap cooldown or move to a shared 8 s one
   with three slots? Default: keep per-slot.
3. Should Volley cost gold instead of a wave charge on mobile (a visible sink
   for the gold that ranks do not absorb)? Default: keep the charge.

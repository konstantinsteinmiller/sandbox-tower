# Tower Siege — Implementation Plan, Mobile Fit 2: **Drop & Merge Siege**

> Living document. If a session is interrupted, resume from the first unchecked
> item in **§13 Execution checklist**. Every decision that has already been
> made is recorded here so no re-derivation is needed. The analysis this plan
> rests on is [`mobile-fit.md`](./mobile-fit.md); its design principles (§4
> there) are referred to as **P1…P10** below. Phase A is **identical to plan 1's
> phase A** — if Pocket Siege shipped first, phase A is already done and this
> plan starts at phase B.
>
> **Status (2026-09-06):** phases A–D are implemented as `src/mobile-fit/`
> behind `VITE_USE_MOBILE_FIT_GAME`; the checklist in §13 records what is
> ticked, and **§16** lists the implementation notes and deviations. Phases
> E (beyond the v1 render profile), F and G are open.

---

## 1. What we are building

A **portrait, one-thumb** re-core of Tower Siege that keeps the world, the
art, the turrets, the waves and the collapse, and replaces *placement* with a
column drop and *upgrading* with merging:

* a fixed **5 × 7** board (columns −2…+2, rows 0…6) that is always fully on
  screen, cells 42–53 px on phones, columns ≈ 300 px tall — the tap target is
  the column;
* **tap a column** (or drag a tile over it) and the offered block falls into
  it; a block landing on its twin **merges down** into a higher tier;
* **support is per column**: a block rests on the block below or on the
  ground; when a block dies, everything above it drops;
* threats from the **sides** (short ground lanes), the **sky** (air units enter
  from the top of the screen) and — v1.1 — the **lake** below;
* **materials + gold** in the run, coins in the wallet; a **10-card linear
  Blueprints** track instead of the tree;
* the same runtime mode, RuleSet seam, device tier, fixed camera, save keys
  and platform layers as plan 1.

### Non-goals (v1)

Landscape play on phones · polyominoes · rotation · roofs · the Gate flood-fill
support · buffs · ships / harbour · siege engines / cavalry · slingers (they
stand off-screen in portrait) · per-block inspector (Repair-all + long-press
Sell instead) · horizontal merging · sea lane (data-gated for v1.1).

---

## 2. Decisions already made (binding)

| # | Decision | Why |
|---|---|---|
| D1 | Runtime mode `fitMode = 'dropmerge'`, resolved exactly as plan 1 §3.1 (`?fit=dropmerge`, Poki category, coarse pointer) | One bundle; Poki reports the device |
| D2 | The same `RuleSet` seam (plan 1 §3.2) with three additions: `support: 'column'`, `merge: 'landing'`, `enemies.airSpawn: 'top'` | No fork of the simulation |
| D3 | Board **5 × 7**; `halfWidthAt(r) = 2` for every row, `maxRow = 6`; no water row for building | 10 framed rows fit a 360 × 640 phone at 45 px/cell with a 44 px strip and a 140 px tray (P2; table in §4.2) |
| D4 | **Portrait** on phones; rotate overlay in landscape; tablets either way | The column input is vertical; the sky is the air lane |
| D5 | Pieces are **single blocks**, plus one two-tall "perch" (crate + gun) from wave 3, dealt through the weapon lane | A column drop cannot place an L |
| D6 | **Merge on landing only**, down into the block below, same type and tier, all block kinds except the Gate, tiers 1–3, no tech gate; a landed block that merges frees its cell | One rule the player learns in the first minute; walls merging is what makes the wall survive |
| D7 | **Column support**: `settleColumns` replaces `resolveOrphans`; drops and settle-falls take **no fall damage**; crush on landing stays | A column game must be readable: "what is under it holds it up" |
| D8 | **Materials** = wood + stone (stone-costed blocks charge ×1.4 materials); gold and coins unchanged | Two numbers on a 44 px strip, not three |
| D9 | Roster: grunt, runner, brute, bulwark, bomber, bat, wyvern, bombardier, golem; **≤ 10 on the field**; air spawns **above the frame**; ground speed ×0.8 | Portrait has no width for standoff units; the sky has height for divers and bombers |
| D10 | Tech = **Blueprints**: 10 cards in one order, `m2_`-prefixed ids, key `ts_m2_tech`; rank cards capped at 5 and re-buyable at any time | One screen, one button |
| D11 | Wallet shared; run/tech/best/onboarding on `ts_m2_*` keys | As plan 1 D10, second namespace so a Pocket save and a Drop & Merge save can coexist |
| D12 | One active: **Volley**, auto-aimed; **Repair all** (gold) between waves; long-press a block → **Sell** | P5; no inspector on a 5-column board |
| D13 | Device tier, render profile, DPR cap, draw cadence, art set and per-wave probing exactly as plan 1 (D11–D13 there) | Shared |
| D14 | A **greybox gate** (§13 C0): the drop / merge / collapse loop must be fun with placeholder rails before any HUD polish | The verb is new; polish must not hide a dull loop |

---

## 3. Architecture

### 3.1 Mode resolution

Plan 1 §3.1 with `FitMode = 'desktop' | 'pocket' | 'dropmerge'`. When both
mobile modes exist in the bundle, the phone default is **`dropmerge`** and
`pocket` is reachable by `?fit=pocket` (or the reverse, one line in
`resolveFitMode`). The router maps `'dropmerge'` to
`import('@/views/GameSceneDrop.vue')`.

### 3.2 RuleSet additions

```ts
support: 'graph' | 'column'
merge: 'adjacency' | 'landing' | 'off'
mergeTypes: 'weapons' | 'all'                 // desktop 'weapons'; dropmerge 'all'
fall: { killCells: number; freeCells: number } // dropmerge { killCells: 99, freeCells: 99 } → never damages
enemies.airSpawn: 'sides' | 'top'
enemies.speedMul: number                       // dropmerge 0.8 (ground only)
blocks.foldStoneIntoWood: number | null        // dropmerge 1.4
offers.pieces: 'shapes' | 'blocks'             // dropmerge 'blocks' — the dealer draws block ids + the perch
```

`DROPMERGE_RULES` lives in `src/game/dropmerge/rules.ts`.

### 3.3 Simulation changes — `useTowerGame.ts`

All additions are gated on the rules; the desktop path is untouched and
pinned by `tests/game/rules.test.ts`.

**Column height and legality**

```ts
export const columnTop = (c: number): number      // highest occupied row in c, −1 if empty
export const canDropAt = (c: number): boolean     // |c| ≤ 2 && columnTop(c) < rules.board.maxRow && phase !== 'defeat'
```

**Dropping** — `export const dropOffer = (slot: number, c: number): boolean`

1. `offer = offers.value[slot]`; resolve it to a block list: a single id, or
   the perch `[crate, gun]` (bottom first). Refuse unless `canDropAt(c)` for
   the whole piece (`columnTop(c) + pieces ≤ maxRow`) and `canAffordPiece`.
2. Charge (materials via §3.5, gold), `blocksPlacedThisRun += n`.
3. For each block, bottom first: `spawnFallingBlock(typeId, c, fromRow = maxRow + 2 + i)`
   — builds the `Block` exactly as `spawnBlock` does but pushes it to `debris`
   with `falling = { dy: 0, vy: 0, rot: 0, vrot: 0, dx: 0, vx: 0, fromRow, gentle: true }`
   and does **not** occupy a cell.
4. `rerollOffer(slot)`; `saveRunSnapshot()` if in build phase.

`stepDebris` already integrates gravity and lands a block at
`landingRowFor(c, fromRow)`, re-occupies the cell, applies fall damage and
crush, then calls `resolveOrphans`. Changes: `falling.gentle` (or
`rules.fall.freeCells ≥ cells`) skips the damage; after landing it calls
`onLanded(b)` → `mergeOnLanding(b)` when `rules.merge === 'landing'`, then
`settleSupport()` which dispatches to `settleColumns` or `resolveOrphans`.

**Merge on landing** — `const mergeOnLanding = (b: Block): void`

```
loop:
  below = blockAt(b.c, b.r − 1)
  if !below || below.typeId === GATE_ID || !canMergeBlocks(b, below) (with mergeTypes 'all') → break
  missing = (b.maxHp − b.hp) + (below.maxHp − below.hp)
  below.tier = tierOf(below.tier) + 1
  below.level = max(below.level, b.level); below.enhanced = below.enhanced && b.enhanced
  below.maxHp = maxHpFor(below.typeId, below.enhanced, false, below.level, below.tier)
  below.hp = max(1, below.maxHp − missing); below.bornAt = clock
  release(b); blocksByUid.delete(b.uid)
  pushFx({ kind: 'merge', x: centreX(below), y: centreY(below), tier: below.tier, palette })
  b = below
```

`canMergeBlocks` gains a `types` parameter (`'weapons'` keeps today's
`canMergeType`; `'all'` allows every non-Gate id). Footprints never change
(`w`/`h` stay 1), so `unionRect` and `settleMerges` are not used in this mode.

**Column support** — `const settleColumns = (): void`

For every block with `r > 0`, if `!blocks.has(key(c, r − 1))` → release it,
delete from `blocksByUid`, push to `debris` with a gentle fall from `r`.
`stepDebris` lands it at `landingRowFor`, which is the block below the gap;
crush applies to enemies in `CRUSH_RADIUS` of the landing (`crushEnemiesAt`
unchanged — the edge columns' landings catch what is chewing them). Debris
resolves bottom-up within a tick as today.

**Air from the top** — `spawnEnemy`: when `rules.enemies.airSpawn === 'top'`
and `def.movement === 'air'`, `x = side × (0.5 + Math.random() × 1.5)`,
`y = rules.board.maxRow + 3.5` (above the 2-row sky), `dir = −sign(x) || 1`.
`airTarget` and the dive logic in `stepEnemies` already home on a block from
any position. Bombers: `bomberAltitude 1.6` above the crown, so the station
is ≤ `maxRow + 1 + 1.6 = 8.6`, inside the 2-row sky (frame top = 9).

**Ground speed** — `stepEnemies` multiplies ground movement by
`rules.enemies.speedMul`. Enemies still spawn at `min(bounds.minC − 6,
viewLeft − 2)` = 8 cells from the centre on a 360 px phone (the view edge is
only 4 cells out), a ≈ 7 s walk to the wall at 0.8 cells/s — but the lane is
1.3–1.5 cells on screen, so they are **visible for the last ≈ 2 s only**.
That is the design (§7.1), and it is why the scene shows an **edge arrow
with a count** on each side while ground units are inbound off-screen
(§6.1): the approach is legible without being visible.

**Repair all** — `export const repairAll = (): boolean`: cost = Σ over damaged
blocks of `ceil(missing / REPAIR_HP_PER_GOLD)`; only in `phase === 'build'`;
no per-block cooldown. Reuses `repairBlock`'s bookkeeping (`repairedSinceMeasure`).

### 3.4 Offers — `shapes.ts` dealer for `pieces: 'blocks'`

`src/game/dropmerge/pieces.ts` defines `PIECE_DEFS` as `ShapeDef`s of one
cell (`b_wood`, `b_stone`, `b_brace`, `b_spikes`, `b_archer`, `b_cannon`,
`b_bombard`, `b_tesla`, `b_lumberHut`) plus `perchArcher` (`wood` + `archer`,
minWave 3) and `perchCannon` (`wood` + `cannon`, minWave 5), lanes
`structure / weapon / support`. `rollOffer` needs no change beyond plan 1's
parametrisation; the crate ladder applies to `b_wood`. Three slots:
`structure / weapon / any`.

### 3.5 Materials — `foldStoneIntoWood`

When set, `canAfford`, `canAffordShape`, `placeBlock`, `dropOffer`,
`sellRefund`, `fortifyCost` (unused here) and `shapeCost` compute
`materials = wood + stone × fold` and charge/refund `wood` only; `stone.value`
stays 0 and is hidden. `waveReward` folds its stone into wood the same way
before `rewardMul`. `hoardFactor` receives `(materials, 0, gold)`. The
resource bar shows two chips. Tests pin that a desktop run with `fold = null`
is byte-identical.

### 3.6 Renderer additions — `useTowerArt.ts`

* `BuildOverlay.dropColumn?: number | null` — `drawBuildOverlay` paints a
  translucent column band from row 0 to `maxRow` and a landing outline at
  `(dropColumn, columnTop + 1)`; red band when the column is full.
* `FxEvent 'merge'` → a tier-coloured ring + a short "×3 / ×9" `emitText`
  and the existing `place` puff; the tier plate (`paintTierPlate`) already
  draws on merged blocks.
* Column mode draws the falling piece with the normal debris path
  (`drawBlock(ctx, b, t, f.dy, f.rot, f.dx)`); `vrot` is 0 for gentle drops
  so a dropped crate does not tumble.
* `BuildOverlay.edgeArrows?: { left: number; right: number }` — the count of
  ground units beyond each view edge (`e.x < rect.l` / `> rect.r`, alive,
  ground), drawn as a chevron with the number at the beach row on that edge,
  pulsing while the count changes. Updated by the scene from `getEnemies()`
  once per frame; no sim change.
* Everything in plan 1 §3.5 (baked sky/background, static/off reflection,
  profile-driven caches, sprites, cadence) applies.

### 3.7 Save keys — `keys.ts`

`ts_m2_run`, `ts_m2_tech`, `ts_m2_best_wave`, `ts_m2_onboarded`,
`ts_m2_tutorial`, `ts_m2_tech_intro`. Merge-policy score adds
`m2BestWave × 500`. Snapshot tuples already carry `tier`; `rules: 'dropmerge'`
is written and checked on resume.

### 3.8 Scene composition

* `src/views/GameSceneDrop.vue` — canvas, `TopStrip`, `DropTray`, `WaveBar`,
  the column input machine, `BlueprintsModal`, `OptionsModal`, `RotateOverlay`
  (landscape on phones), result via `useSceneFlow`, perks via
  `useRewardedPerks` (plan 1 §3.8).
* `src/components/game/TopStrip.vue` — wave, gate bar, materials, gold, coin
  badge (44 px, one row, `env(safe-area-inset-top)`).
* `src/components/game/DropTray.vue` — Volley + three `BlockTile`s (the perch
  uses `ShapeTile`), swap buttons below the tiles, drag source.
* `src/components/game/WaveBar.vue` — "⋯" drawer, Repair all (build phase),
  CALL WAVE with clock + bonus, the 1×/2× switch.
* `src/components/organisms/BlueprintsModal.vue` — the card list.
* `src/game/dropmerge/{rules,pieces,tech,roster}.ts`.

---

## 4. Board and frame

### 4.1 Board

Columns −2…+2, rows 0…6, Gate at (0,0). A column holds at most 7 blocks
(rows 0–6; the Gate column 1–6). Legal drop: the column has room. No
adjacency requirement — gravity is the support.

### 4.2 Fixed frame (portrait)

```
colsFramed  = 5 + 2 × 1.25 (visible lane each side)           = 7.5
rowsFramed  = 7 (board) + 1.0 (beach/water) + skyRows           = 10 (skyRows 2), 9 on very short screens
cell        = clamp(36, min((viewW − 16) / 7.5, freeH / rowsFramed), 72)
freeH       = viewH − topStrip(44 + safeTop) − tray(84) − bar(56 + safeBottom)
centreX     = 0 ; centreY = (6 + 1 + skyRows − 1) / 2 = 4                  // y ∈ [−1, 9]
```

| Viewport (portrait) | safe insets | freeH | binding axis | cell | lane on screen | column tap target |
|---|---|---|---|---|---|---|
| 320 × 568 (SE 1) | 0 / 0 | 384 | height (skyRows 1 → 9 rows) | **40** | 1.3 cells | 40 × 280 px |
| 360 × 640 (low-end Android) | 0 / 0 | 456 | both (45.6 / 45.9) | **45** | 1.3 cells | 45 × 315 px |
| 375 × 667 (iPhone 8) | 20 / 0 | 463 | height (46.3) | **46** | 1.4 cells | 46 × 322 px |
| 390 × 844 (iPhone 12–15) | 47 / 34 | 579 | width (49.9) | **50** | 1.25 cells | 50 × 350 px |
| 412 × 915 (Pixel / Galaxy) | 0 / 0 | 731 | width (52.8) | **53** | 1.25 cells | 53 × 371 px |
| 768 × 1024 (tablet) | — | 840 | cap | **72** | 2.7 cells | 72 × 504 px |

Worked example, 360 × 640: `freeH = 640 − 44 − 84 − 56 = 456`; height gives
`456 / 10 = 45.6`, width gives `(360 − 16) / 7.5 = 45.9`; cell = 45; the board
is 225 px wide and each lane `(344 − 225) / 2 = 60 px = 1.3 cells`.

`skyRows` drops to 1 only when the 2-row frame would push `cell` under 40 px
(the 320 × 568 case: 38.4 with two sky rows, 40.5 with one); bombers then
cruise at `bomberAltitude 0.8`.

### 4.3 Landscape on a phone

`RotateOverlay` ("Hold your phone upright to play") + `useGamePause` reason
`'rotate'`, as plan 1 §4.3 with the orientation inverted. Tablets get the same
portrait layout centred with wider margins in landscape (the board and tray
do not change), so no second template is needed.

---

## 5. Content tables (`src/game/dropmerge/*`)

### 5.1 Blocks

`wood, brace, stone, archer, cannon, bombard, tesla, spikes, lumberHut`
(definitions unchanged; costs folded per §3.5: stone 22 m, spikes 18 + 17 = 35 m,
cannon 25 + 14 = 39 m, bombard 20 + 31 m + 26 g, tesla 56 m + 32 g, brace 22 m).
Start unlocked: `wood, stone, archer, cannon`. `lumberHut` gated by
`m2_lumberHut`.

Merge tiers: output ×3 / tier, max HP ×2 / tier. A tier-3 wood crate is a
160 HP wall from four 10-m crates; a tier-3 cannon is nine cannons' damage in
one cell. `mergeDamageMul` (`forgeWelds`) is not in the Blueprints; the tiers
stand on their own.

**No ceiling, on either board** (changed after the first build — see §16).
This board's welds always land in ONE cell, so `maxMergeTier: Infinity` and
`mergeArt: 'cell'`: sixteen crates into one column is a tier-5 wall and the
plate switches from Roman to the Arabic number at four.

The desktop was uncapped too, once the deep tiers turned out to be the fun
part. Two things held it at three there and both had to go: `MAX_MERGE_TIER`,
and — the real one — `unionRect`'s demand that a merged block fuse only into a
SQUARE. Two 2×2 bastions make a 4×2 and nothing squares them, so lifting the
tier cap alone would have changed nothing. The rule is now 2:1, which gives the
progression the art already assumed (2×1, 2×2, 4×2, 4×4, 8×4) and still refuses
the 4×1 strip the square rule existed to refuse.

### 5.2 Pieces — `PIECE_DEFS`

| Lane | Pieces (weight) | minWave |
|---|---|---|
| structure | `b_wood` (14), `b_stone` (9), `b_brace`* (via crate ladder), `b_spikes`* (ladder) | — |
| weapon | `b_archer` (12), `b_cannon` (10), `b_bombard`* (8), `b_tesla`* (7), `perchArcher` (6), `perchCannon` (5) | perches 3 / 5 |
| support (dealt through `any`) | `b_lumberHut`* (10) | — |

\* tech-gated. `rotation: false`, `roofs: false`.

### 5.3 Blueprints — `TECH_NODES_DROPMERGE`

`tier` = card index (0…9), `col` = 0; card *k* `requires` card *k − 1* at
level ≥ 1. Rank cards can be bought again any time — the "next card" CTA
always targets the first card at level 0.

**No rank ceiling** (changed after the first build — see §16). The five rank
cards are `UNCAPPED`, exactly as the desktop tree's are; what paces them is the
compounding `costGrowth`, which is a wall that builds itself and lands wherever
the player's wave rewards say it should. Sharp Bolts at growth 1.3 runs 20 /
114 / 424 / 5,850 / 80,620 coins at ranks 1 / 5 / 10 / 20 / 30, and a mobile
run pays out at `rewardMul 0.6`, so those bite harder than the same numbers on
the desktop. The card reports `tech.rankOpen` ("Rank 12") rather than a
fraction, and only the binary unlocks ever read "Unlocked".

| # | id | maxLevel | costBase | growth | effect |
|---|---|---|---|---|---|
| 0 | `m2_sharpBolts` | 5 | 40 | 1.30 | damage +8 % |
| 1 | `m2_brace` | 1 | 60 | 1 | unlock `brace` |
| 2 | `m2_foundations` | 5 | 50 | 1.28 | blockHp +8 % |
| 3 | `m2_bombard` | 1 | 170 | 1 | unlock `bombard` |
| 4 | `m2_rapidFire` | 5 | 80 | 1.32 | fireRate +8 % |
| 5 | `m2_gateArmor` | 5 | 150 | 1.33 | gateHp +15 % |
| 6 | `m2_spikes` | 1 | 90 | 1 | unlock `spikes` |
| 7 | `m2_lumberHut` | 1 | 120 | 1 | unlock `lumberHut` |
| 8 | `m2_tesla` | 1 | 260 | 1 | unlock `tesla` |
| 9 | `m2_looting` | 5 | 240 | 1.31 | coinDrop +12 % |

The coin reward per wave (`6 + 3·wave`) is not scaled by `rewardMul` (the
wallet is shared), so a first run that ends on wave 5–8 pays ≈ 60–130 coins
plus the `5 + 4·waves` floor; card 0 r1 costs 20 and card 1 costs 60, so both
land after the first death and card 2 r1 (25) usually with them.

### 5.4 Enemies and waves — `DROPMERGE_RULES.enemies / waves`

Roster `grunt, runner, brute, bulwark, bomber, bat, wyvern, bombardier, golem`
with `minWaveOverride: { bulwark: 8, bombardier: 10, wyvern: 12 }`;
`maxOnField 10`; `airSpawn 'top'`; `bomberAltitude 1.6`; `speedMul 0.8`.

| Rule | Value |
|---|---|
| `budgetMul` | 0.4 |
| `buildMs` | 10 000 |
| `maxWaveMs` / `spawnWindowMs` / `flushAtMs` | 60 000 / 35 000 / 45 000 |
| `bossEvery` / `bossBudget` | 8 / 0.5 |
| `airFromWave` / cap | 4 / 0.4 |
| `seaFromWave` | null (v1.1: 8 with `eel`, `shark`) |
| `siegeFromWave` | null |
| `previews` | 3: bat×1 · 5: bomber×1 · 7: bulwark×1 · 9: bombardier×1 |
| `hpSlope` | 0.10 |
| `rewardMul` | 0.6 (materials only) |
| `expectedPowerMul` | 0.4 to start; fitted in §7.3 |
| `hoardDivisor` | 2 (materials 100/250/500 bands) |
| `economy` | 90 materials |

The scripted opening fort (`wood −1,0`, `wood 1,0`, `cannon 0,1`) fits the
board and stays.

---

## 6. The mobile scene — `GameSceneDrop.vue`

### 6.1 Layout

```
┌──────────────────────────────────┐ safe-top
│ W 7  [gate ████░]  🪵 240  🪙 35  ⓒ120 │ TopStrip 44 px   (Poki pill above it)
├──────────────────────────────────┤
│   sky — 2 rows — air units enter here          │
│        ┌───┬───┬───┬───┬───┐                   │
│        │   │   │   │   │   │                   │
│        │   │ ▓ │   │   │   │  board 5 × 7, cells 45–53 px │
│ ◄3     │ ▓ │ ▓ │ G │ ▓ │   │     2►  lanes ≈ 1.3 cells; edge arrows count off-screen units │
│        └───┴───┴───┴───┴───┘                   │
│   beach / water — 1 row                        │
├──────────────────────────────────┤
│ [Volley] [tile] [tile] [tile]    │ DropTray 84 px  (swap buttons under tiles)
│ [⋯]  [Repair all 12g] [CALL WAVE 0:09 +30%] [2×] │ WaveBar 56 px
└──────────────────────────────────┘ safe-bottom
```

Every control ≥ 44 px and inside the bottom 30 % of the screen. Warnings are
a single line above CALL WAVE; the wave-clear toast pins to the beach row.
The **edge arrows** (§3.6) sit at the beach row on each screen edge and show
how many ground units are still walking in from that side — the approach is
seven seconds long but only its last two are on screen, and a wall that
starts taking hits "from nowhere" reads as unfair without them.

### 6.2 Input state machine

```
IDLE
 ├─ tap a tray tile ──► ARMED(slot)      (tap again → IDLE)
 │     ARMED: pointerdown anywhere on the board → column = round(worldX) clamped to −2…2
 │            overlay: column band + landing outline (red if full)
 │            pointerup in the same column (< 10 px travel or any travel that ends in a column):
 │            canDropAt → dropOffer(slot, column) → stay ARMED if the refilled slot is affordable
 ├─ pointerdown on a tray tile + move > 10 px ──► DRAGGING(slot)
 │     move: the tile's thumbnail follows the finger; the column under the finger highlights
 │     up over the board → dropOffer(slot, column); up elsewhere → cancel ──► IDLE
 ├─ pointerdown on a placed block held 450 ms ──► SELL(block) bubble (Sell + refund) ; tap elsewhere → IDLE
 ├─ tap Volley ──► fires at the denser flank (plan 1 §6.4)
 ├─ tap Repair all (build phase only) ──► repairAll()
 └─ any other pointerdown on the canvas ──► nothing (no pan)
```

Column resolution: `c = clamp(round(screenToWorldX(x)), −2, 2)`; the whole
band from the beach to the sky is the target, so a tap on an enemy in the
lane beside the board is *not* a drop (`|worldX| > 2.5` → ignored).

### 6.3 Boot, result, tech, rewarded

As plan 1 §6.3 / §6.5 with `applyRules(DROPMERGE_RULES)`, `ts_m2_*` keys and
`BlueprintsModal` (three-beat intro reused on `ts_m2_tech_intro`).

### 6.4 Tutorial (three beats, `ts_m2_tutorial`)

1. "Tap a column to drop the piece" — spotlight the structure tile and the
   empty column beside the fort; advances on the drop.
2. "Drop a twin on a twin to merge" — the weapon lane is forced to deal the
   same gun as the one the fort has (`cannon`) once; spotlight the Gate
   column; advances on the merge.
3. "Call the wave" — spotlight CALL WAVE.

---

## 7. Balance work

### 7.1 What the design has to make true

Short lanes mean most damage lands at the wall. The run is won by three
things the player controls: **merging** (tier-2 walls survive a wave a
tier-1 wall does not), **repairing** between waves (gold sink), and **where
the guns sit** (the crown's guns are the anti-air; the flank columns' guns
cover the lanes). The director prices the standing tower (adaptive factor),
so a merge-heavy tower gets a heavier wave — the sub-linear exponent keeps
that a net win.

### 7.2 Replay harness

`tools/balance-replay.ts --rules dropmerge` with a `drop` policy: single
blocks only, board cap 34, merges modelled as "any two adjacent same-type
blocks in a column fuse" with the tier multipliers, `speedMul 0.8`,
`maxOnField 10`, air from the top (no change to the model).

### 7.3 Fit `expectedPowerMul`

Sweep 0.25–0.55 in 0.05 steps; choose the value where the `drop` policy's
mean `power / expected` is 1.00 ± 0.05 over 20 waves and a naive policy
survives ≥ wave 10. Record in `balancing.md` §11.

### 7.4 In-game checks

* Wave 1–2 first session: the fort survives untouched; the first merge
  happens by wave 3 without the tutorial forcing it.
* Wave 8 boss (golem): killable by a 5-column board with two tier-2 guns.
* The Gate is never reached before wave 5 by the greedy policy.
* Merge cascades: a tier-3 never appears before wave 6 in the replay.

---

## 8. Performance work (phase E)

Plan 1 §8 applies verbatim (levers E1–E11, the A/B runner, the exit gates)
with the scenes changed to **dropmerge wave-7** (10 enemies, ~25 blocks with
two tier-2) and **dropmerge wave-12**. The board is smaller than Pocket's, so
the gates should be met with fewer levers; the ledger records which were
unnecessary. Additional lever: **E12** — `merge` FX text capped at 2 concurrent
(cascades otherwise stack six texts).

---

## 9. Platform (Poki first)

Plan 1 §9, with: orientation declared **portrait** on P4D; the pill sits
above the 44 px top strip (`pokiMovePill(0, 8)` — verify the rect); the
rotate overlay covers landscape on phones. The `commercialBreak` after wave
clear must not fire while the tutorial's merge beat is pending (the
`toastHeld` path already gates on the toast; add the tutorial step to the
same predicate).

---

## 10. i18n

New keys (English first, all 21 locales, parity test): `mobile.rotatePortrait`
("Hold your phone upright to play"), `hud.dropHint` ("Tap a column to
drop"), `hud.mergeHint` ("Drop a twin on a twin to merge"), `hud.repairAll`,
`hud.columnFull`, `resources.materials`, `tech.blueprints.title`,
`tech.blueprints.next` ("Next blueprint"), `tech.nodes.m2_lumberHut.*`,
`tutorial.m2.drop|merge|call`, `warnings.air` reuse. Desktop node names reused
for `m2_*` through the same `TECH_NAME_KEY` map as plan 1.

---

## 11. Tests

Shared files from plan 1 §11 (`rules`, `renderProfile`, `fixedCamera` with the
portrait table, `fitMode`, `mobileKeys` with `ts_m2_*`, `mobileArtManifest`,
`volleyAuto`) plus:

| File | Pins |
|---|---|
| `tests/game/columnSupport.test.ts` | killing a row-0 block drops the column above one landing; no flood fill (an edge column stands without the Gate chain); the Gate never falls; gentle falls deal 0 damage; crush still kills a grunt under the landing; debris resolves bottom-up |
| `tests/game/landingMerge.test.ts` | same type + tier fuse down; tier cap 3; walls merge; the Gate never merges; wounds carry (two full blocks → full); cascade of three; `level`/`enhanced` rules; no horizontal merge |
| `tests/game/dropOffer.test.ts` | full column refused and not charged; perch = two blocks bottom first; charge + reroll + snapshot; `blocksPlacedThisRun` |
| `tests/game/materials.test.ts` | fold factor on cost, refund, reward; desktop with `fold = null` byte-identical; hoard bands |
| `tests/game/blueprints.test.ts` | linear gating; rank re-buy; `ts_m2_tech` isolation; every effect kind understood by `sumEffect` |
| `tests/game/airSpawnTop.test.ts` | air spawns above the frame within the board's x range; bombers station ≤ frame top; ground speed × 0.8; `maxOnField` 10 |
| `tests/game/repairAll.test.ts` | cost sum, build-phase only, `repairedSinceMeasure` |
| `tests/ui/dropSceneLayout.test.ts` | jsdom sweep 320×568, 360×640, 375×667, 390×844, 412×915, 768×1024: cell table §4.2, every control ≥ 44 px, controls inside the bottom 30 % |
| `tests/game/dropInput.test.ts` | column resolution and clamping; a tap in the lane is not a drop; drag-cancel never charges |

---

## 12. Telemetry for the decision rule

As plan 1 §12 with counters `dropAttempt`, `dropRefusedFull`, `merges`,
`cascades`, `repairAllUses`, `volleyUses`, `sessionMs`. Success criteria for
the greybox gate (§13 C0): median session ≥ 4 min, ≥ 1 merge per wave from
wave 3, ≥ 60 % of testers reach wave 8 in session two.

---

## 13. Execution checklist

Effort in engineer-days. If plan 1 shipped, phase A is complete — start at B.

### Phase A — foundation (shared with plan 1) — ≈ 6 d
- [x] A0–A7 — `useMobileFit` (+ `?fit=` override), RuleSet seam (`src/game/rules.ts`, `DESKTOP_RULES` pinned), device tier (`useDeviceTier.ts`, `?tier=` override), fixed camera frame (`setFixedFrame`), save keys (`ts_m2_*`). **Partial:** per-wave art probing is a roster-filtered sprite prime, no 50 % art set; the plan-1 "fix-now" landscape defects are untouched in the desktop scene (the drop scene shows `RotateOverlay` instead).

### Phase B — Drop & Merge rules and simulation — ≈ 4 d
*Done when:* a headless run under `DROPMERGE_RULES` (tests) drops, lands, merges down, settles columns without a flood fill, charges materials, refuses full columns, spawns air above the frame, and never damages a gently falling block.
- [x] B1 RuleSet additions §3.2; `DROPMERGE_RULES` (`src/mobile-fit/rules.ts`); `tests/game/rules.test.ts`
- [x] B2 `columnTop`, `canDropAt`, `spawnFallingBlock`, `dropOffer`, gentle falls — `tests/mobile-fit/dropmerge.test.ts` › *drops*
- [x] B3 `settleColumns` + `settleSupport` dispatch — › *column support*
- [x] B4 `mergeOnLanding`, `canMergeBlocks(types)`, `merge` FX event — › *landing merge*
- [x] B5 Materials fold §3.5 (`priceOf`, `priceOfShape`, `priceOfBlock`) — › *the hand*
- [x] B6 `PIECE_DEFS` via `registerShapeDefs`, `TECH_NODES_DROPMERGE`, roster + waves, `airSpawn 'top'`, `speedMul` — › *enemies*, *blueprints*
- [x] B7 `repairAll` — › *repair all*
  (The per-feature test files the plan named are folded into the one suite above.)

### Phase C — the scene — ≈ 5 d
*Done when:* the greybox gate (C0) has passed its §12 criteria, and a full run to a defeat plus a second run through the Blueprints can be played with one thumb on a 360×640 phone UA in the CDP harness with every control ≥ 44 px, a tap in the lane never dropping, and a cancelled drag never charging.
- [ ] C0 **Greybox gate** — skipped; needs testers. The CDP harness run at 390×844 stands in for the mechanical half (drops land, cancelled drags do not charge, long-press does not sell).
- [x] C1 Loop with `drawEvery`, boot, fixed portrait frame §4.2, `RotateOverlay`
- [x] C2 `TopStrip.vue`, `DropTray.vue` (drag source, swap under tiles), `WaveBar.vue` (Repair all, CALL WAVE with a 1×/2× ladder, menu)
- [x] C3 Input state machine §6.2 + `BuildOverlay.dropColumn/dropValid/dropRows` in the renderer
- [x] C4 Sell bubble on long-press
- [x] C5 Volley auto-aim (`denserFlank`), hints, toast on the beach row
- [x] C6 Result flow + rewarded perks via the shared composables; `BlueprintsModal.vue` with intro
- [x] C7 Tutorial §6.4 on `ts_m2_tutorial` (forced `b_cannon` twin deal for beat 2; beats auto-arm the piece — §16)
- [ ] C8 Layout sweep — `tests/mobile-fit/renderDrop.test.ts` covers the frame; the 320×568 / 412×915 manual check is open

### Phase D — i18n and art — ≈ 1 d
*Done when:* the parity test passes with every new key in all 21 locales and the mobile art manifest test finds a file for every block, fixture and roster monster (including `gloomcrow`).
- [x] D1 Keys §10, English then all 21 locales; parity green
- [ ] D2 Mobile art manifest — open; the scene primes only the roster's monster sprites (`setMonsterPrimeFilter`) and otherwise reuses the desktop art at the tier's DPR cap

### Phase E — performance — ≈ 2.5 d
*Done when:* every gate in plan 1 §8 is met on the throttle proxy for the dropmerge scenes and on the two real device classes, with the ledger recording each lever's result.
- [ ] E0 Probe scenarios `dropmerge-wave7` / `wave12` added to `tools/perf-probe.mjs`; baseline in the ledger
- [~] E1–E12 — the v1 render profile is in (`setRenderProfile`: DPR cap, `drawEvery`, shine off below high, particle/text caps); the remaining levers (smoke/decal sprites, fixture-cache size, roster-aware `artPreload`) are open
- [ ] E13 Real-device pass (same device classes as plan 1), full run to wave 12 each

### Phase F — platform and release QA — ≈ 1.5 d
*Done when:* the Poki Inspector shows no warnings, one full run's gameplay/ad event log matches the expected bracket sequence (including the tutorial-merge predicate holding the break), and a mid-run reload on a cloud-save platform restores the column tower with its tiers.
- [ ] F1 Poki: portrait declared, pill rect, `gameplayStart/Stop` around overlay/bubble/ads, break-before-result incl. the tutorial predicate, rewarded allowance, no external requests, Inspector clean
- [ ] F2 CrazyGames mobile QA pass
- [ ] F3 Playbook release-QA prompts
- [ ] F4 Cloud-hydration proof for `ts_m2_run`

### Phase G — balance and playtest — ≈ 2 d
*Done when:* `expectedPowerMul` is recorded with its replay table in `balancing.md`, the tier-3 timing check passes, and the playtest counters plus the sea-lane decision are appended to `mobile-fit.md`.
- [ ] G1 `tools/balance-replay.ts --rules dropmerge` + `drop` policy; fit `expectedPowerMul` (§7.3); record in `balancing.md` §11
- [ ] G2 Instrumented playtest (§12); findings appended to `mobile-fit.md`; v1.1 decision on the sea lane

---

## 14. Risks and rollback

| Risk | Mitigation |
|---|---|
| The verb is not fun | C0 greybox gate before any polish; the shared phase A is not wasted if the answer is no (plan 1 uses it) |
| Merge cascades hand out power in lumps | No tier cap here (§16) — so this now rests entirely on the adaptive director pricing the standing tower, `hoardDivisor 2`, and the frontage a deep weld gives up. The replay's tier-3 timing check (phase G) is the instrument that says whether that is enough |
| Enemies reach the wall too fast in portrait | `speedMul 0.8`; spawn margin ≥ 6 cells (existing); a one-sided variant (tower at the left edge, 5-cell lane) is a rules change — `board.oneSided: true` would mirror `groundFrontier` and spawn only on `+1` |
| Column support feels arbitrary next to the desktop's flood fill | It is a different game; the tutorial's first beat shows a drop resting on the stack |
| Materials fold changes block identity | `foldStoneIntoWood: null` restores three currencies at the cost of a third HUD chip; the top strip has room at ≥ 390 px |
| Low-end still under 30 fps | Board is ≤ 34 blocks and ≤ 10 enemies — the cheapest scene in the family; `drawEvery 3` escalation |

Rollback: as plan 1 — `?fit=desktop` / `VITE_APP_FIT_FORCE=desktop`.

---

## 15. Open questions (do not block phase A/B)

1. ~~Should a landed block also merge **sideways**?~~ **Answered: yes**, and
   upward too — `mergeDirs` is `[[0,-1], [-1,0], [1,0], [0,1]]`, scanned in
   that order so gravity wins a tie. Side-by-side twins sitting unfused read as
   the board missing a merge the player had already made. The survivor is the
   longest-living of the pair; see §16.
2. Sea lane in v1.1: eels striking row 0 from below use the existing
   submerged/surfaced rule — keep it, or make sea units always targetable on
   mobile? Default: always targetable (`hitsSubmerged` for every gun in this
   mode).
3. Should Repair all be free once per build phase (a rhythm) instead of a
   gold sink? Default: gold, because gold otherwise has no sink without ranks.

---

## 16. Implementation notes and deviations (2026-09-06)

Where the code differs from the sections above, the code is right and this
list says why. Everything else matches the plan.

| Topic | Plan | Shipped | Why |
|---|---|---|---|
| Package location | `src/game/dropmerge/*` | `src/mobile-fit/` (`rules.ts`, `pieces.ts`, `tech.ts`, `roster.ts`, `GameSceneDrop.vue`, `components/`) | One directory for everything the flag excludes; `src/game/` stays pure and shared. |
| Feature flag | runtime mode only | `VITE_USE_MOBILE_FIT_GAME` (base `.env`, default `true`; only the literal `'false'` disables) **and** the runtime `fitMode` | The router imports the scene inside an `import.meta.env` literal check so Rollup drops the chunk when the flag is off. |
| `waves.budgetMul` | 0.4 | **0.5** | With the first-session 60 % opening discount on top, 0.4 made wave 1 a single grunt. |
| Dealer for `pieces: 'blocks'` | new dealer | `registerShapeDefs(PIECE_DEFS)` + `OfferLaneConfig` on the existing `rollOffers` (`supportSlot: null` → the `any` lane draws the whole pool) | The polyomino dealer already handles 1-cell shapes; only the lane table needed to be data. |
| Tutorial beats | player taps the tile, then the column | Beat auto-arms the piece; the hole spans the whole column; merge beat forces a `b_cannon` deal | The tutorial dim layer swallows taps outside its hole, so a two-tap beat needs two holes or an armed piece. |
| Settle after a kill | blocks fall one row, no merge | `settleColumns` runs `mergeOnLanding` for each landed block | Cheaper than a special case, and twins fusing after a breach reads as a reward. |
| Air spawn | "above the frame" | `x = side · (0.4 + rand · 1.4)`, `y = maxRow + 3.5`, heading toward the Gate | Two rows of sky are the air lane; bombers fly at 1.6 rows. |
| Speeds | 1×/2× | `abilities.speeds: [1, 2]` fed to the shared `CallWaveButton` via a `speeds` prop | No fork of the button. |
| Tech tree state | `ts_m2_tech` | `ts_m2_tech`, read through `useTowerProgress` which now takes its node table and key from the active rules | Shared composable; the desktop tree is never touched by a mobile run (tested). |
| Render profile | E1–E12 ledger | `setRenderProfile({ dprCap, drawEvery, shine, particleCap, textCap })` from `useDeviceTier` | v1 subset; the rest of §8 is open. |
| Query overrides | — | `?fit=desktop|dropmerge|mobile`, `?tier=low|mid|high` (hash-URL aware) | Lets a desktop browser open the drop board and a phone open the old scene for comparison. |
| `expectedPowerMul` | fitted by replay | 0.4, the design estimate | Phase G not run yet. |
| Merge ceiling | `MAX_MERGE_TIER 3`, shared | `maxMergeTier: Infinity` on BOTH boards; `mergeArt: 'cell'` on this one | Here every weld is 1×1, so a fixture drawn at 2.2 cells overflowed into its neighbours. On the desktop the deep tiers are the appeal — the tower gets grander as it concentrates — so the cap went there too, along with `unionRect`'s square rule (2:1 now), which was the ceiling that actually bit. `MAX_MERGE_TIER` is gone; `canMergeBlocks` defaults to uncapped and `RuleSet.maxMergeTier` can still set one. |
| Landing merge direction | down only (§15 Q1 deferred) | `mergeDirs: [[0,-1], [-1,0], [1,0], [0,1]]`, survivor = lower `uid` | Two mortars side by side are a pair the player has already made. Age rather than position decides the survivor, which reproduces the old down-only behaviour exactly (a column is built bottom-up, so lower is always older) and gives the sideways case an answer a player predicts. |
| Blueprint ranks | `CARD_RANK_CAP = 5` | `UNCAPPED`, like the desktop tree | A ceiling turns the last purchase into the end of the screen. The compounding price is the real pacing, and it does not need a number written next to it — rank 20 of Sharp Bolts is 5,850 coins and rank 30 is 80,620. The modal shows `tech.rankOpen` instead of `n / 9999`. |
| Gate health bar in the top strip | wave + Gate bar on the left | bar removed | In a battle the wave group grows an enemy count and pushed the bar into the materials icon; a 360 px row does not hold both. The Gate carries a bar on the block itself, which is where the player is looking when it matters. |
| Camera | fixed, no zoom at all | fixed **framing**, plus a zoom-out slider (top-right), pinch, and a recentre button | The fit crops the flanks and the sky, which is where the wave comes from. Panning stays out; the zoom anchors the ground line so it buys sky and lane, not foreground water. |
| Lane warning chips | air / bombers chips in the wave bar | removed, on this board and the desktop | Unused in play; the hoard surcharge (a price, not a forecast) is the only chip left. |
| Result CTAs | text buttons | icon-only `shop` / `skip-forward` from the shared glyph set | The user's `game-ui-icon-set` skill; the i18n keys become the accessible names. |

Verification on 2026-09-06: `vue-tsc --build` clean, 79 test files / 912
tests green, `pnpm build` emits `GameSceneDrop-*.js` (≈ 17 KB gz) only with
the flag on; a CDP run on a 390×844 Android UA covered mode resolution both
ways, tap- and drag-drops, the sell bubble, a wood-on-wood tier-2 merge, two
waves at 1× and 2×, and the tutorial end to end with no console errors.

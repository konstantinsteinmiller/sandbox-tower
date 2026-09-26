# Sandbox Tower — reskin spec

**Sandbox Tower** (`sandbox-tower`) is a reskin of Tower Siege. The gameplay,
balance, ids and numbers are the same. Only what the player **sees and reads**
changes.

> A kid is building a sandcastle in the backyard sandbox. Bugs from the garden
> (ants, flies, mosquitoes, bees, beetles, and bugs from the paddling-pool
> moat) swarm in from both sides to knock it down. The kid defends it with toy
> weapons stuck into the castle.

Tone: sunny, warm, toy-like and **cute-evil**. The bugs are cartoon bugs with
big expressive eyes and a mischievous look, drawn the way the old monsters were
(ink outline, cel-shading, asymmetry, silhouette first). Nothing gory: when a
bug is hit it sheds green-yellow goo and legs, never blood.

This file is the contract for the procedural reskin. The painted-art pass
(`art-generation-pipeline`) comes later and repaints **from these drawings**.

---

## Hard rules (every worker)

1. **Keep every id.** Enemy ids (`grunt`, `bat`, …), monster design ids
   (`grumpling`, `nibbler`, …), block ids (`wood`, `cannon`, …), tech ids, FX
   kinds, projectile kinds and save keys are all unchanged. Tests, waves, the
   sim and the save format depend on them. Only draw code, palettes,
   `name`/`tagline`/`backdrop` dev-bench strings and i18n display text change.
2. **Keep all mechanics.** Do not touch balance numbers, hit boxes, ranges,
   timings, anchors, draw scales (`scale`, `FIXTURE_BOX`, `SIEGE_ART_BOX`, …),
   cycle lengths (`cycleMs`), facing conventions (`faces`, `anchor`) or the
   sprite cache and bake interfaces. A new drawing has to fit the same box, stand
   on the same feet line and loop over the same cycle as the drawing it
   replaces.
3. **Match the house style.** Reuse `inkArt.ts` and `monsterKit.ts` (ink line
   weights, cel tones, light from the upper left, `SHADOW_DIR`, `blink`,
   `breathe`, `gait`, `limb`, `ik`, …). The animation rule from `monsters.ts`
   still applies: animation MOVES parts and never reshapes them. Contours are
   seeded on constants only.
4. **Readable at 14–40 px.** Silhouette first. Every bug is identifiable as a
   black shape, and no two share a footprint. Keep saturated colour with dark
   ink outlines so bugs read against pale sand and a bright sky.
5. **Performance stays the same.** Everything that was baked or cached stays
   baked or cached. Do not add per-frame gradients or shadows where the old code
   had none.
6. **No hardcoded user-facing copy.** Anything a player reads goes through
   i18n (`src/i18n/locales/*.ts`, 21 locales). Dev-bench strings (MonsterLab
   names and taglines, Playground labels) are exempt.

---

## World palette (shared by every worker)

| Token | Hex | Use |
|---|---|---|
| sand-light | `#f6e2ae` | lit sand faces, dry sand |
| sand-mid | `#e3c07e` | sand body |
| sand-dark | `#b88c4c` | sand shadow, grooves |
| wet-sand | `#c79a5c` / dark `#8d673a` | packed / wet sand, moat bank |
| pebble | `#9aa3ad` / `#6e7782` / `#c9d0d6` | pebbles, grey stone |
| sky-top / sky-horizon (noon) | `#6fc3f7` / `#d6f0ff` | sky |
| leaf / leaf-dark | `#67bd48` / `#3d8a34` | grass, hedges, bushes |
| water-light / mid / deep | `#7fe0ec` / `#34b3d1` / `#1b7fa8` | moat and paddling-pool water |
| toy-red | `#e5483b` | bucket, roof, toy plastic |
| toy-yellow | `#ffc93c` | spade, plastic trim, highlights |
| toy-blue | `#2f7de1` | plastic, allies (toy knights) |
| toy-green | `#43b649` | plastic |
| toy-orange | `#ff8a2b` | foam darts, plastic |
| toy-pink | `#ff6fae` | balloons, plastic |
| ink | `#3b2a21` | outlines (the existing `INK`) |
| goo | `#b7d63f` / dark `#6f9a22` | bug hit particles |

---

## Backdrop (world)

The old layers become a backyard seen from inside the sandbox:

| Old layer | New layer |
|---|---|
| sky + sun/moon + day cycle | Bright summer sky. The day arc stays (morning → noon → golden afternoon → dusk → warm summer night with stars and fireflies). The old blood-moon tier becomes a dramatic stormy orange-purple sunset, not blood. The sun is friendly and the moon is soft. |
| far mountains | Backyard far layer: the house wall and roof line, far garden trees, a washing line or garden shed. Tiles horizontally. |
| near mountains | A white or pastel **wooden picket fence** in front of hedges and big leafy trees. Tiles horizontally. |
| forest band (conifers, broadleaf) | Garden flower bed and tall grass: sunflowers, tulips, daisies, dandelions, clover. |
| grass strip / ground | **Sand**: the sandbox surface, with grain speckle, the odd pebble or shell, and a dropped toy (a spade, a mould) for scale. The sandbox's wooden frame can show as a plank edge. |
| lake (water) | The **moat / paddling-pool water** in front of the castle: bright turquoise, clearer and shallower, with a wet-sand bank at the shoreline. Ripples stay. The mirrored reflection of the tower stays. |

Night must stay readable. Aim for dusky blue-violet, not near-black.

---

## Blocks (the sandcastle)

All ids are unchanged. The display name goes in i18n `blocks.names.*`.

| id | Old | **New** | Look |
|---|---|---|---|
| gate | Gate | **Castle Gate** | Sandcastle gatehouse: a packed-sand arch with a little popsicle-stick door and a seashell over the arch. Warm light inside. Still the "heart". |
| wood | Wood Crate | **Sand Block** | A bucket-moulded sand cube: light sand, faint horizontal mould ridges, grain speckle. |
| brace | Braced Crate | **Packed Sand** | Darker, wetter sand. Keep an X motif pressed in (the "braced" tell). |
| stone | Stone Block | **Pebble Wall** | Sand cube faced with grey-blue pebbles in a mosaic. Visibly heavier. |
| archer | Archery | **Dart Blaster** | An orange-and-blue toy foam-dart blaster on a sand plinth. It shoots foam darts with suction tips. |
| cannon | Cannon | **Squirt Gun** | A chunky toy water pistol, with a water tank on top and a bright plastic body. Its shots are water blobs that splash. |
| mortar | Mortar | **Mud Mortar** | A toy-bucket tube that lobs mud balls. |
| bombard | Bombard | **Balloon Launcher** | A sunk emplacement that lobs a water balloon straight up. |
| tesla | Lightning Coil | **Bug Zapper** | A blue-violet electric bug zapper: a grid lantern with coils. Keep the arcs. |
| frost | Frost Spire | **Ice Pop** | A giant ice pop (popsicle stick at the bottom) that fires icy shards. Keep the blue frost read. |
| spikes | Spiked Wall | **Toothpick Wall** | A sand wall bristling with toothpicks on all four sides. |
| repair | Repair Bay | **Bucket & Spade** | A small bucket with a spade. The live wrench becomes the spade. |
| banner | Banner | **Paper Flag** | A sandcastle paper flag on a toothpick (heraldic colours kept). |
| obelisk | Obelisk | **Magic Seashell** | A glowing conch or scallop shell (the stronger aura). |
| lumberHut | Lumber Hut | **Sand Sifter** | A toy sieve or sand-wheel that pays out **sand**. |
| stonepit | Stone Pit | **Pebble Digger** | A toy digger scoop that pays out **pebbles**. |
| coffer | Coffer | **Piggy Bank** | A pink piggy bank that mints gold. |
| skiff | Picket Skiff | **Paper Boat** | A folded paper boat with a toothpick spear. |
| longship | Longship | **Rubber Duck** | A rubber duck with a heavy dart harpoon on its back. |
| galley | War Galley | **Toy Pirate Ship** | A plastic toy pirate ship with a cork cannon. |

- **Roof**: the red gable becomes an **upside-down red toy bucket** (a turret
  cap). It stays red, a colour no block material uses, because "can I build on
  this?" has to read at a glance.
- **Cracks / damage stages** become sand crumbling: cracks, chunks missing,
  sand trickling.
- **Tier plates / merged weapons** keep their mechanics. Only the materials
  change (plastic, not iron).
- **Tray glyphs** (`blockGlyph.ts`) are redrawn to match the new objects.

Resources: `wood` → **sand**, `stone` → **pebbles**, `gold` → **gold** (buried
treasure). Meta-currency coins stay coins.

---

## Bugs (enemies)

Enemy ids and design ids are unchanged. The display name goes in i18n
`enemies.names.*`. `name`/`tagline`/`backdrop` in `MONSTERS` is the dev bench.

| enemy id | design id(s) | **New bug** | Notes |
|---|---|---|---|
| grunt | grumpling | **Black Ant** (display: Ant) | Baseline. Six legs, big head, antennae, a determined little frown. |
| grunt | rattlejack | **Red Ant** (fire ant) | The second grunt body. Red-orange, a slightly different build and a tiny pebble or crumb carried as its "weapon". |
| runner | cinderhound | **Cockroach** | Fast, low and long. Glossy brown, long whipping antennae, skittering legs. |
| slinger | bonecap | **Spitting Spider** (display: Spider) | Ranged. A round fuzzy jumping spider with big front eyes. It shoots **web balls**. |
| brute | snaggletusk | **Rhino Beetle** | Low, heavy and forward, with one big horn. Built to hit a wall. |
| bomber | blorp | **Bombardier Beetle** | Orange head, dark blue-black shell, a smoking backside. It walks up and goes pop. |
| bat | nibbler | **Housefly** (display: Fly) | Big red compound eyes, buzzing translucent wings. |
| bat | wispling | **Mosquito** | Lanky legs, long proboscis, striped abdomen. The second bat body. |
| bulwark | marrowknight | **Roly-Poly** (pill bug) | Grey segmented armour, holding a **bottle cap as a shield** on the leading side (the frontal-armour tell). |
| wyvern | skewer | **Hornet** | The late air threat: fast, tanky, a big stinger, yellow-black. |
| bombardier | gloomcrow | **Bumblebee** | Fuzzy, round, holding a **honey bomb** (a golden drip ball) to drop. |
| firebug | dustmoth | **Firefly** | A glowing abdomen, carrying a **glowing ember** to drop (the fire effect stays). |
| eel | sliverfin | **Water Tiger** (diving-beetle larva) | A long segmented ribbon swimmer with sickle jaws. The mouth is always open. |
| shark | gnashfin | **Diving Beetle** | A glossy oval shell, oar legs, stiff and fast. |
| kraken | brinemaw | **Toe-Biter** (giant water bug) | A big flat water bug with raptorial front arms. It hangs a little green glowing lure. |
| seadrake | tidewyrm | **Dragonfly Nymph** | A fat segmented nymph, wing pads, a hinged grabbing jaw. It is the one "with hands". |
| golem | thornwick | **Stag Beetle** (boss) | Huge antler mandibles, glossy black-red. Slow and patient. |

Swimmers keep the swimmer contract (side-on, centred anchor, travelling-wave
animation, drawn twice around the waterline).

### Contraptions (siege engines) — built by ants from toy junk

The wheels still turn with distance travelled, arms still cock and release, and
the ramp still drops. Crews become **ants**, and wood becomes popsicle sticks,
pencils and cardboard. Wheels become **bottle caps / buttons**, rope becomes a
**rubber band**, and iron becomes **tin**.

| id | **New** | Look |
|---|---|---|
| ram | **Pencil Ram** | A toy matchbox car carrying a sharpened pencil as the ram, with ants riding it. |
| ballista | **Rubber-Band Crossbow** | A popsicle-stick crossbow on bottle-cap wheels. It shoots toothpicks. |
| catapult | **Spoon Catapult** | A plastic spoon on a popsicle-stick frame. It lobs pebbles and sand clods. |
| siegeTower | **Juice-Box Tower** | A juice box on wheels with ant archers on top and a cardboard ramp. |
| trebuchet | **Pencil Trebuchet** | A long pencil arm on a popsicle A-frame, with an eraser counterweight. |
| ironRam | **Tin-Can Ram** | A soup tin on bottle-cap wheels with a fork as the ram. Darts bounce off tin. |

### Allies

| id | **New** | Look |
|---|---|---|
| cavalry | **Toy Knights** | A blue plastic toy knight on a toy horse (plastic, a little stiff, visible seam lines) with a gold pennant. Cool blue stays unmistakably friendly. |

---

## Projectiles & FX

| Old | **New** |
|---|---|
| arrows / arrow volley ("Arrow Rain") | foam darts: orange shaft, blue suction-cup tip ("Dart Rain") |
| cannonballs + fiery muzzle | water blobs + a water-spray muzzle; the impact is a splash with droplets, not fire |
| mortar shells | mud balls; the impact is a brown mud splat |
| bombard shells | water balloons (random toy colours); they pop into a splash |
| frost bolts | ice shards / ice-pop chips (stay blue) |
| lightning | stays electric (it is a bug zapper) |
| slinger stones | white web balls |
| ballista quarrels | toothpicks |
| catapult / trebuchet rocks | pebbles / sand clods |
| bomber explosion | a bombardier-beetle "pop": a small yellow-orange puff and a stink cloud |
| bombardier bombs | honey bombs: a golden drip splat |
| firebug molotovs | glowing embers (the fire effect stays) |
| gore (blood / bone / …) | goo (green-yellow), with legs and shell bits. No blood. |
| block debris | sand puffs and grains for sand blocks, pebbles for the pebble wall, plastic chips for toys |

---

## UI chrome

The dark-navy fantasy panels become a **toy-plastic summer** look:

- Panels: pool-blue plastic (`#1f5aa0` → `#2a6cb8`), a sunshine-yellow rim
  (`#ffd65a`), rounded and chunky, with a soft inner highlight.
- Buttons: candy plastic. Toy-green is primary, toy-orange secondary, toy-red is
  danger/close, and yellow is the call-to-action.
- Text stays white with a dark outline for contrast.
- Splash / page background: a sunny gradient from sky blue into sand, not night
  navy.
- Logo: **"Sandbox Tower"** in chunky sand-coloured letters with a darker
  outline, and a little flag or bucket accent. Until painted art exists it is
  drawn in code (canvas or SVG), with no bitmap from the old game.

---

## File ownership (parallel reskin)

| Worker | Owns |
|---|---|
| backdrop | `useTowerArt.ts` § Background (`skyFor`, `celestialSprite`, `drawCelestial`, `drawConifer`, `drawBroadleaf`, `drawSky`, `renderBackground`, `tileBand`, `paintedTree`, `paintMeadowBand`, `drawReflection`, `drawSeaSurface`), the water look |
| block-bodies | `art.ts` `PALETTES` (block entries), `useTowerArt.ts` `drawBlockBody` / `drawMaterial` / `drawCracks` / `drawRoof` / tier plates / `drawBlock` body parts, `blockGlyph.ts`, `shipArt.ts` |
| fixtures | `useTowerArt.ts` `drawFixture`, fixture sprites, `paintOneGun`, `paintTieredFixture` (weapon, economy and buff fixtures) |
| bugs-ground-a | designs grumpling, rattlejack, cinderhound, snaggletusk (new module `src/game/bugs/groundA.ts` + their `MONSTERS` entries) |
| bugs-ground-b | designs bonecap, blorp, marrowknight, thornwick (`src/game/bugs/groundB.ts`) |
| bugs-air | designs nibbler, wispling, skewer, gloomcrow, dustmoth (`src/game/bugs/air.ts`, replacing `monstersAir.ts`) |
| bugs-sea | designs sliverfin, gnashfin, tidewyrm, brinemaw (`src/game/bugs/sea.ts`, replacing `monstersSea.ts`) |
| contraptions | `siegeArt.ts`, `cavalryArt.ts`, the siege and ally palettes |
| fx | `useTowerArt.ts` § FX / Projectiles / Muzzle / Blasts / arrow volley / `drawEnemyProp` / gore colours |
| ui | Vue components' visual styling, `index.html` splash, the logo, resource icons, the `mobile-fit` components' styling |
| text | `src/i18n/locales/*.ts`, `README.md`, `package.json` name/scripts, meta tags, `manifest.json`, storage-key and leaderboard renames |

Shared files (`useTowerArt.ts`, `art.ts`, `monsters.ts`) are edited
concurrently. Use small targeted `Edit`s in your own section only. Never
`Write` a whole shared file, never reformat it, and re-read before retrying a
failed edit.

## Verifying (dev)

- The dev server is on **http://localhost:2061** (HMR). Do not start another
  one on 2050: that port belongs to a different project.
- `#/playground` shows every fixture, monster walk cycle and siege engine,
  moving.
- `#/monsters` shows the monster design cards (MonsterLab).
- `/` is the game. Seed `localStorage.sandbox_state` with
  `{ts_intro_seen:true, ts_m2_onboarded:true, ts_m2_tutorial:true}` to skip
  the intro.
- `?fit=desktop` and `?fit=dropmerge` force the desktop or phone scene.
- The screenshot helper is `node <scratchpad>/shot.mjs <url> <out.png> [w] [h]
  [waitMs] [mobile]`. It uses its own headless Chrome and a fresh profile, and
  the `PRELUDE` env var is injected as an init script.

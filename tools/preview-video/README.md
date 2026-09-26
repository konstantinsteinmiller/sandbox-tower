# Preview videos and trailers — Sandbox Tower

Scripted gameplay clips recorded out of the REAL game: the dev server, the real
renderer, the real simulation, driven to an exact state and stepped frame by
frame on a virtual clock. Nothing here is screen-captured, so a clip is
reproducible, frame-exact, and re-recordable after an art change instead of
re-filmable.

```bash
pnpm preview:video                      # every format — 14 clips, ~70 min
pnpm preview:video --quality high       # …and half that, without the masters
pnpm preview:video --formats crazygames # one deliverable
pnpm preview:video --scenarios success  # one scenario, every format
pnpm preview:video --no-clean           # with the HUD on, for a sanity look
pnpm preview:video --only-setup         # stop on the opening frame (authoring)
pnpm preview:video --help
```

Output is `preview-videos/` (git-ignored — a lossless 1080p 30 s master runs to
~300 MB). A format asked for SEVERAL qualities gets a folder per quality; a
format asked for one writes straight into the output directory, so the
CrazyGames and Poki clips sit at the top level next to the folders:

```
preview-videos/lossless/success-30s-landscape-1920x1080.mp4   (+ .png cover)
preview-videos/high/success-30s-landscape-1920x1080.mp4       (+ .png cover)
preview-videos/success-crazygames-portrait-1080x1620.mp4      (+ .png cover)
```

Anything at the top level with a size that is not in the table below is a draft
from the authoring loop — delete them before handing the folder to anyone.

## What gets recorded, and where it goes

| format | shape | for |
|---|---|---|
| `10s` | 720x1280 + 1280x720, 10 s | the generic preview pair |
| `30s` | 1080x1920 + 1920x1080, 30 s | the "MP4 · H.264 · 30 s · pure gameplay" trailer |
| `crazygames` | 1920x1080 + **1080x1620**, 16 s, `high` only | CrazyGames covers (their portrait slot is **2:3**, not 9:16; 50 MB cap) |
| `poki` | 1080x1080, 5 s, **60 fps**, `high` only | Poki's animated thumbnail (1:1, 4-6 s, 50 fps+) |

Two scenarios per format — `success` and `fail`. Ship both and let the portal's
A/B decide: a clean win sells "that looks satisfying", a near-miss sells "I
could do that better".

**Upload the `high/` file.** `lossless/` is `-qp 0 -pix_fmt yuv444p`: a master
for the archive that Safari and QuickTime will not play and most upload
validators reject. It is also what makes a full run long — `veryslow` at 4:4:4
encodes slower than the page renders and back-pressures the frame loop, so a
900-frame 1080p capture takes ~320 s against ~90 s for `high` alone.

## Two games in one bundle

Sandbox Tower ships a desktop tower game and a phone Drop & Merge board out of
the same build, chosen at runtime (`src/use/useMobileFit.ts`). The clips follow
the same rule, so every clip shows the game that shape of device actually gets:

| orientation | board | the shot |
|---|---|---|
| portrait | Drop & Merge (`?fit=dropmerge`) | one drop, two welds, a tier-3 gun over the Gate |
| landscape | the desktop tower (`?fit=desktop`) | riders out, then a volley that breaks the wave |
| square | the desktop tower | Poki's thumbnail is one square for both device types |

`scenarios/_drive.mjs` pins `?fit=` on the URL and asserts which scene mounted.
Do not rely on the resolver's own guess: Playwright's `isMobile`/`hasTouch` do
not reliably produce the coarse pointer and mobile UA `resolveFitMode` reads,
so an unpinned portrait take records the desktop game at phone size — which
looks almost right, and is the wrong game.

## The clean feed

Every clip is recorded as "pure gameplay: no text, counters, UI or logos".
Three levers, and all three are needed:

1. the recorder hides every DOM node but the game canvas (HUD, resource bar,
   build tray, result screen, toasts, coin badge, chest);
2. it no-ops canvas `fillText`/`strokeText` at document start (damage numbers,
   tier digits, payout figures);
3. **`?clean=1`** — `src/game/cleanFeed.ts`, DEV only — switches off the
   interface the RENDERER paints (damage bars, the build overlay and its drop
   ghost, edge arrows, "nothing can reach it" marks, ghosts of dead blocks,
   merge-tier plates), frames the board in the whole viewport instead of in the
   band the hidden HUD leaves free, and stops the result screen and the
   teaching cards HOLDING THE CLOCK — invisible holds that record as a frozen
   board.

`--no-clean` records with all of it back on.

## Authoring

The game-specific half is three files; `record.mjs` and `lib/` are the skill's,
copied verbatim, and should not be edited here.

| file | what it is |
|---|---|
| `preview.config.mjs` | formats, orientations, the clean block, URL params |
| `scenarios/_drive.mjs` | the save fixture, the staged towers, boot, and every verb a beat sheet uses |
| `scenarios/*.mjs` | the beat sheets — one per scenario per length |

The loop:

```bash
# frame 0 only, seconds a cycle
pnpm preview:video --only-setup --formats 10s --scenarios success --orientations portrait

# a fast draft: half the frames, a quarter of the pixels, the SAME layout
pnpm preview:video --formats 30s --scenarios fail --orientations landscape \
  --fps 15 --landscape 960x540 --dpr 1 --quality balanced --keep-frames

# which wave to stage is found by trying, not by reasoning (see below)
PREVIEW_WAVE=30 pnpm preview:video --only-setup --formats 30s --scenarios fail
```

## What cost the most to find

- **Never `import()` the simulation from the page.** The obvious handle —
  `import('/src/use/useTowerGame.ts')` in `page.evaluate` — is the live
  singleton exactly until someone edits a source file. Vite then serves the APP
  a version-stamped URL for the same module (`…ts?t=1757…`), and the unstamped
  import is a *different module*: a second, inert copy that answers every call
  and reports `blockCount 0` forever. Measured: eleven clips recorded fine off
  it, and then every clip of the next run timed out in boot because a component
  had been edited in between. `attachSim` takes the handle the app publishes
  (`window.__tower`, switched on by seeding `localStorage.cheat`) and the boot
  assertion names this specifically when the fallback is what answered.

- **The wave director prices a wave against the tower.** `adaptiveFactor` reads
  the staged tower's power, so the same wave number is not the same wave: wave
  12 came out at difficulty 0.75 on the desktop keep (14 enemies that died at
  range, never reaching the walls) and 2.03 on a phone board of mostly wood
  (which was then chewed from 21 blocks to 8 inside ten seconds). Arm the
  staged board properly and choose the wave by trying it — `PREVIEW_WAVE`.
- **A fail clip must be made to fail.** The beats the clip is built on — a
  cavalry charge, an arrow volley — are the player winning, and they buy the
  tower enough time that a healthy Gate outlives the clip. At wave 20 the 30 s
  fail beat sheet WON the boss wave twice over. The fix is both halves: stage
  the Gate wounded (`gateHp`) and open with it already under attack
  (`prerollToGatePressure`), and for the 30 s cut a heavier wave (30).
- **Pre-roll to a CONDITION, never to a number of seconds.** A wave spends its
  first seconds walking across an empty field, and how long that takes depends
  on the wave's own roll.
- **The budget must read the frame the capture loop is on.** `ctx.stepUntil`
  advances the clip too, so a budget that counts only its own waits drifts: the
  retry beat landed at 9.9 s of a 10 s clip instead of 8.4 s.
- **Choose the hand to match the board.** A "now weld something" beat that
  drops whatever was dealt welds about half the time; `weldNow` reads the
  column tops and deals itself the piece that fuses deepest.
- **`dropOffer` rerolls the slot as it fires**, so a log line that reads the
  offer afterwards names a piece that was never dropped.

Full generic contract: `CONTRACT.md`. The skill this came from — beat sheets,
portal specs, troubleshooting — is `gameplay-video-pipeline`.

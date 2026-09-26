# Drop repainted images here

Then run `pnpm slice-sheets` from the repo root — or just tell Claude, and it
will run it for you.

Strips and whole sheets can sit in here together. The filename only has to still
contain the target's name, so all of these work:

```
strip-blocks-r1.png
strip-blocks-r1-take3.png
gemini-strip-enemies-r0.png
sheet-blocks.png
```

The longest recognised name wins, so `strip-blocks-r1` is never mistaken for the
whole `blocks` sheet. If a name is unrecognisable, pass `--sheet <id>`.

**Prefer the single cells.** `cell-<id>.png` is one object per image with its
own prompt in `../PROMPTS-CELLS.md`. Three sheet and strip passes each lost the
grid a different way — drifted, squashed, and once by inventing a ninth object
in an eight-cell row. A single object has no grid to lose.

Strips (`strip-<id>-rN.png`, prompts in `../PROMPTS-STRIPS.md`) are still good
for a fast style test across eight related things at once.

`.sliced.json` is the slicer's receipt — which reference revision each painting
was cut against. `stale/` holds paintings of drawings that have since been
re-cut, and `replaced/` the ones the Art Desk swapped out; the slicer reads only
this top level, so neither is ever cut by accident.

## Enemies are walk cycles, not stills

`walk-<design>.png` (prompts in `../PROMPTS-WALKS.md`) is a 4x2 grid of the same
creature through one step. It slices into ONE horizontal strip at
`public/images/monsters/<design>.webp`, and the battlefield plays it from the
same clock that drives the procedural walk.

Use these rather than `cell-enemy/…`: a still in `images/enemies/` replaces the
whole walk cycle with one frozen pose that slides across the sand. The slicer
warns when you do it.

Named after the DESIGN, not the enemy type — one design can field several ranks,
and it is the design that owns the gait. `walk-grumpling.png` and a bare
`grumpling.png` both land.

## Contraptions roll

The siege engines are ant contraptions built from toy junk now — a toy car
with a pencil ram, a soup tin with a fork, a rubber-band crossbow, a spoon
catapult, a juice-box tower and a pencil trebuchet. The ids are unchanged.

`siege-<engine>.png` is ONE square image per engine, not a cycle. It shipped as
an eight-panel roll first; the wheels do turn, but nobody has ever watched a
spoke go round in game, and asking for eight views of one machine got eight
machines — the catapult came back at a different three-quarter angle in every
panel. A single image has no perspective to lose. They land at
`public/images/siege/<engine>.webp`.

`arm-<engine>.png` is the part that genuinely IS a cycle: eight panels across
the throwing arm's reload, for the ballista, catapult and trebuchet only. Their
arm is drawn from `cycle` — 0 the frame a round leaves, 1 the frame the next one
does — so the strip stays keyed to when the machine actually fires. It lands at
`public/images/siege-arms/<engine>.webp` and is composited over the chassis.
Paint the arm alone: no wheels, no carriage, no frame.

The reference shows the CARRIAGE ONLY. The crossbow arms and band, the spoon,
the pencil beam, the eraser weight and the sling are keyed to each machine's own reload and are still drawn live on top, exactly
as a block's fixture is drawn over its painted body. Paint an arm into the sheet
and the engine ends up with two.

All six engines have a sheet. The ram, the iron ram and the siege tower each
needed one concession to z-order first, which is why their references show less
than you might expect: the ram's toy car but not its pencil, the tin-can ram's
tin but not the fork sliding out of it, the juice box but not the ramp, the
straw flagpole, the bottle-cap fighting top or its ant archers. Those all
animate, so they all stay live.

## Rounds

`cell-projectile-bolt` and `cell-projectile-quarrel` land at
`public/images/rounds/<kind>.webp`. Both are drawn pointing RIGHT and rotated to
their heading in game, so one still covers every direction.

They are two different things and must look it: `bolt` is the dart blaster's
orange foam dart with a blue suction cup, `quarrel` is the rubber-band
crossbow's toothpick — thin, pale and sharp. The other rounds are reference
only; a water blob is drawn at its own radius and the mud ball, honey bomb and
ember each carry something live on top.

The grid is cut blind, so the slicer checks what it cannot see and reports it:
an empty panel, feet that wander between frames, a body that slides sideways, a
creature redrawn at a different size. Any of those means ask for it again.

Nothing in this folder is read by the game. It is an inbox.

`pnpm slice-sheets --dry` shows where every cell would land without writing
anything.

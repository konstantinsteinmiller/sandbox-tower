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

Strips (`strip-<id>-rN.png`, prompts in `../PROMPTS.md`) are still good for a
fast style test across eight related things at once.

## Enemies are walk cycles, not stills

`walk-<design>.png` (prompts in `../PROMPTS-WALKS.md`) is a 4x2 grid of the same
creature through one step. It slices into ONE horizontal strip at
`public/images/monsters/<design>.webp`, and the battlefield plays it from the
same clock that drives the procedural walk.

Use these rather than `cell-enemy/…`: a still in `images/enemies/` replaces the
whole walk cycle with one frozen pose that slides across the grass. The slicer
warns when you do it.

Named after the DESIGN, not the enemy type — one design can field several ranks,
and it is the design that owns the gait. `walk-grumpling.png` and a bare
`grumpling.png` both land.

The grid is cut blind, so the slicer checks what it cannot see and reports it:
an empty panel, feet that wander between frames, a body that slides sideways, a
creature redrawn at a different size. Any of those means ask for it again.

Nothing in this folder is read by the game. It is an inbox.

`pnpm slice-sheets --dry` shows where every cell would land without writing
anything.

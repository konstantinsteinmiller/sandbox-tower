# Per-strip prompts

Generated from `src/game/artSheet.ts` — do not hand-edit. Run `pnpm art:prompts`
(or export from the `/art-sheets` bench) after changing the manifest.

One strip per generation. Attach `art-sheets/strip-<id>.png` and paste the
matching block below. Every cell is named, because the first whole-sheet
pass inferred subjects from pixels and turned the gold mine into a bow.

Copy only the fenced block. The `##` heading is for you, not the model: it
names the image the block belongs to (the reference to attach, and the name
to save the return under) and, after the arrow, where the slice lands under
`public/`. `pnpm art:desk` finds any block by sprite name, copies reference
and prompt in one go, and files, slices and compresses the return.

## Blocks — assembled, body, glyph — row 0  (strip-blocks-r0.png)

```text
Repaint this strip of 8 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO cards, vignettes, matting or paper background. The block itself fills the
  square, and its coloured rim is part of the block, not a frame around it.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame. Its outer ink line runs along all four
  edges of the image — no margin, no gap, not even a few pixels. A block that
  stops short shows a seam in the middle of every wall it is stacked into.
· ROUNDED corners, rounded exactly as the reference rounds them: the radius is
  about a tenth of the side. Only the four little corner nicks outside that
  rounding show the background — solid magenta, all four of them, never white.
· THE RIM — keep it. A band in the block’s own rim colour (given below) runs
  all the way round the block just inside its outer edge, following the
  rounded corners. It is about 4% of the side wide, with the dark brown ink
  line along both sides of it. The rim is how a player tells one block from
  another at a glance, so it is part of the block and NOT a frame around a
  picture: never drop it, never thin it to a hairline, and never paint it in
  any colour but its own.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, bucket-shaped
  tops, wheels, peaked roof, rounded shoulders, legs or protruding parts. It
  is ONE cube cut from a sandcastle wall, not a little sandcastle. Anything
  above the top edge leaves the next block floating in mid-air. The only
  shape cut INTO the square is one the reference itself cuts — the Castle
  Gate’s two battlement notches — and those stay exactly as drawn, with the
  rim following them. A notch is EMPTY: it is background, solid magenta
  right down to the rim, like the corner nicks — never white, cream or sky.
  (The first gate came back with white notches, which the game would show
  as two white squares on top of the castle.)
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No drop shadow, no ground beneath it, no background around it.

WHAT EACH SQUARE IS, left to right:
1. Castle Gate: a sandcastle gatehouse block of bright dry sand — two shallow square notches cut down into its top edge leave three little merlons that stop exactly AT the top edge; a raised packed-sand arch with pressed joints frames a doorway FILLED with warm golden lamplight — bright pale yellow at its heart, deepening to orange up under the arch, like a lit window at dusk, never a dark opening — a popsicle-stick door standing ajar against the right jamb, and a coral-pink scallop shell set over the arch — the thing the whole game protects. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #eccb8c, shadows #b3803f, highlights #fff1cc, accent details #ffb42e. The RIM round the whole block is #ffb42e — a heavy gilt edge, nearly twice as wide as any other block’s.
2. Sand Block: a bucket-moulded cube of dry pale sand: a lighter packed band along the top, three wavy horizontal mould ridges, dark and light grain speckle, and one tiny white shell crumb. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #e3c07e, shadows #b88c4c, highlights #f6e2ae, accent details #9c7038. The RIM round the whole block is #9c7038.
3. Packed Sand: a cube of darker, wetter packed sand with a few damp blotches, and a big X pressed deep into its face from corner to corner — crumbs along the lips of the groove, a couple of wet glints at the upper left, and no frame around the X. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #c79a5c, shadows #8d673a, highlights #dcb57c, accent details #6e4c26. The RIM round the whole block is #6e4c26.
4. Pebble Wall: a cube of damp sand grout faced edge to edge with smooth grey-blue pebbles — about ten big ovals and five small ones in slightly different blue-greys, each with a white glint at its upper left — visibly heavier than sand. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #8f9aa6, shadows #5f6975, highlights #c9d0d6, accent details #454d57. The RIM round the whole block is #454d57.
5. Dart Blaster: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy ORANGE toy plastic running across its lower third, with a white gloss streak and two round studs, WITH an orange-and-blue toy foam-dart blaster mounted on it. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #ff8a2b, its lower half #c75416, studs and gloss #ffb56e. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #ff8a2b.
6. Squirt Gun: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy GREEN toy plastic running across its lower third, with a white gloss streak and two round studs, WITH a chunky green toy water pistol with a water tank on top mounted on it. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #43b649, its lower half #23833b, studs and gloss #86dc6e. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #43b649.
7. Mud Mortar: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy PURPLE toy plastic running across its lower third, with a white gloss streak and two round studs, WITH a blue toy bucket tube lobbing a mud ball mounted on it. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #8a5cd8, its lower half #5b36a8, studs and gloss #b895f0. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #8a5cd8.
8. Balloon Launcher: a square sand plinth with a sunken firing pit in the middle of its face — a dark oval crater ringed in glossy TEAL plastic with a white glint — and three little sand mounds along the bottom edge. No plastic band on this one, WITH a cardboard launch tube with a water balloon mounted on it. Colours: the plinth pale sand (around #f3dca8, shadows #ab7c42); the pit ring teal plastic around #1fb5a8 (shade #138a80); the crater dark brown #6e4a24. The RIM round the whole block is #1fb5a8.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 2048 x 256 pixels — 8 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Blocks — assembled, body, glyph — row 1  (strip-blocks-r1.png)

```text
Repaint this strip of 8 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO cards, vignettes, matting or paper background. The block itself fills the
  square, and its coloured rim is part of the block, not a frame around it.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame. Its outer ink line runs along all four
  edges of the image — no margin, no gap, not even a few pixels. A block that
  stops short shows a seam in the middle of every wall it is stacked into.
· ROUNDED corners, rounded exactly as the reference rounds them: the radius is
  about a tenth of the side. Only the four little corner nicks outside that
  rounding show the background — solid magenta, all four of them, never white.
· THE RIM — keep it. A band in the block’s own rim colour (given below) runs
  all the way round the block just inside its outer edge, following the
  rounded corners. It is about 4% of the side wide, with the dark brown ink
  line along both sides of it. The rim is how a player tells one block from
  another at a glance, so it is part of the block and NOT a frame around a
  picture: never drop it, never thin it to a hairline, and never paint it in
  any colour but its own.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, bucket-shaped
  tops, wheels, peaked roof, rounded shoulders, legs or protruding parts. It
  is ONE cube cut from a sandcastle wall, not a little sandcastle. Anything
  above the top edge leaves the next block floating in mid-air. The only
  shape cut INTO the square is one the reference itself cuts — the Castle
  Gate’s two battlement notches — and those stay exactly as drawn, with the
  rim following them. A notch is EMPTY: it is background, solid magenta
  right down to the rim, like the corner nicks — never white, cream or sky.
  (The first gate came back with white notches, which the game would show
  as two white squares on top of the castle.)
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No drop shadow, no ground beneath it, no background around it.

CRITICAL: this row is the BASE of each block with its toy REMOVED. No blasters, water pistols, tubes, zappers, ice pops, spades, flags, shells or piggy banks anywhere in this row. The game draws those on top at runtime — paint one in and the block ends up with two.

WHAT EACH SQUARE IS, left to right:
1. Castle Gate — the block BODY, which is the file that ships: a sandcastle gatehouse block of bright dry sand — two shallow square notches cut down into its top edge leave three little merlons that stop exactly AT the top edge; a raised packed-sand arch with pressed joints frames a doorway FILLED with warm golden lamplight — bright pale yellow at its heart, deepening to orange up under the arch, like a lit window at dusk, never a dark opening — a popsicle-stick door standing ajar against the right jamb, and a coral-pink scallop shell set over the arch — the thing the whole game protects. Nothing is drawn on top of this one, so it is the whole block. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #eccb8c, shadows #b3803f, highlights #fff1cc, accent details #ffb42e. The RIM round the whole block is #ffb42e — a heavy gilt edge, nearly twice as wide as any other block’s.
2. Sand Block — the block BODY, which is the file that ships: a bucket-moulded cube of dry pale sand: a lighter packed band along the top, three wavy horizontal mould ridges, dark and light grain speckle, and one tiny white shell crumb. Nothing is drawn on top of this one, so it is the whole block. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #e3c07e, shadows #b88c4c, highlights #f6e2ae, accent details #9c7038. The RIM round the whole block is #9c7038.
3. Packed Sand — the block BODY, which is the file that ships: a cube of darker, wetter packed sand with a few damp blotches, and a big X pressed deep into its face from corner to corner — crumbs along the lips of the groove, a couple of wet glints at the upper left, and no frame around the X. Nothing is drawn on top of this one, so it is the whole block. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #c79a5c, shadows #8d673a, highlights #dcb57c, accent details #6e4c26. The RIM round the whole block is #6e4c26.
4. Pebble Wall — the block BODY, which is the file that ships: a cube of damp sand grout faced edge to edge with smooth grey-blue pebbles — about ten big ovals and five small ones in slightly different blue-greys, each with a white glint at its upper left — visibly heavier than sand. Nothing is drawn on top of this one, so it is the whole block. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #8f9aa6, shadows #5f6975, highlights #c9d0d6, accent details #454d57. The RIM round the whole block is #454d57.
5. Dart Blaster — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy ORANGE toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws an orange-and-blue toy foam-dart blaster live ON TOP of this body, so paint NO orange-and-blue toy foam-dart blaster here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #ff8a2b, its lower half #c75416, studs and gloss #ffb56e. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #ff8a2b.
6. Squirt Gun — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy GREEN toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws a chunky green toy water pistol with a water tank on top live ON TOP of this body, so paint NO chunky green toy water pistol with a water tank on top here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #43b649, its lower half #23833b, studs and gloss #86dc6e. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #43b649.
7. Mud Mortar — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy PURPLE toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws a blue toy bucket tube lobbing a mud ball live ON TOP of this body, so paint NO blue toy bucket tube lobbing a mud ball here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #8a5cd8, its lower half #5b36a8, studs and gloss #b895f0. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #8a5cd8.
8. Balloon Launcher — the block BODY, which is the file that ships: a square sand plinth with a sunken firing pit in the middle of its face — a dark oval crater ringed in glossy TEAL plastic with a white glint — and three little sand mounds along the bottom edge. No plastic band on this one. The game draws a cardboard launch tube with a water balloon live ON TOP of this body, so paint NO cardboard launch tube with a water balloon here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth pale sand (around #f3dca8, shadows #ab7c42); the pit ring teal plastic around #1fb5a8 (shade #138a80); the crater dark brown #6e4a24. The RIM round the whole block is #1fb5a8.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 2048 x 256 pixels — 8 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Blocks — assembled, body, glyph — row 2  (strip-blocks-r2.png)

```text
Repaint this strip of 8 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

These are UI ICONS, not scenery: one bold flat pictogram per square on a dark round plate, readable at thumbnail size. Do not turn them into little paintings.

WHAT EACH SQUARE IS, left to right:
1. Build-tray ICON for the Castle Gate: a gatehouse with three merlons and a round arched doorway — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #eccb8c, shadows #b3803f, highlights #fff1cc, accent details #ffb42e. The RIM round the whole block is #ffb42e — a heavy gilt edge, nearly twice as wide as any other block’s.
2. Build-tray ICON for the Sand Block: a bucket-moulded sand block in three bands — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #e3c07e, shadows #b88c4c, highlights #f6e2ae, accent details #9c7038. The RIM round the whole block is #9c7038.
3. Build-tray ICON for the Packed Sand: a solid square with a thick X cut through it — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #c79a5c, shadows #8d673a, highlights #dcb57c, accent details #6e4c26. The RIM round the whole block is #6e4c26.
4. Build-tray ICON for the Pebble Wall: a cluster of seven oval pebbles — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #8f9aa6, shadows #5f6975, highlights #c9d0d6, accent details #454d57. The RIM round the whole block is #454d57.
5. Build-tray ICON for the Dart Blaster: a foam dart flying up and to the right — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #ff8a2b, its lower half #c75416, studs and gloss #ffb56e. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #ff8a2b.
6. Build-tray ICON for the Squirt Gun: a squirt gun with a dome tank and a water drop — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #43b649, its lower half #23833b, studs and gloss #86dc6e. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #43b649.
7. Build-tray ICON for the Mud Mortar: a tilted bucket tube with a mud ball flying out — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #8a5cd8, its lower half #5b36a8, studs and gloss #b895f0. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #8a5cd8.
8. Build-tray ICON for the Balloon Launcher: a knotted water balloon with a wiggly string — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colours: the plinth pale sand (around #f3dca8, shadows #ab7c42); the pit ring teal plastic around #1fb5a8 (shade #138a80); the crater dark brown #6e4a24. The RIM round the whole block is #1fb5a8.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 2048 x 256 pixels — 8 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Blocks — assembled, body, glyph — row 3  (strip-blocks-r3.png)

```text
Repaint this strip of 8 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO cards, vignettes, matting or paper background. The block itself fills the
  square, and its coloured rim is part of the block, not a frame around it.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame. Its outer ink line runs along all four
  edges of the image — no margin, no gap, not even a few pixels. A block that
  stops short shows a seam in the middle of every wall it is stacked into.
· ROUNDED corners, rounded exactly as the reference rounds them: the radius is
  about a tenth of the side. Only the four little corner nicks outside that
  rounding show the background — solid magenta, all four of them, never white.
· THE RIM — keep it. A band in the block’s own rim colour (given below) runs
  all the way round the block just inside its outer edge, following the
  rounded corners. It is about 4% of the side wide, with the dark brown ink
  line along both sides of it. The rim is how a player tells one block from
  another at a glance, so it is part of the block and NOT a frame around a
  picture: never drop it, never thin it to a hairline, and never paint it in
  any colour but its own.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, bucket-shaped
  tops, wheels, peaked roof, rounded shoulders, legs or protruding parts. It
  is ONE cube cut from a sandcastle wall, not a little sandcastle. Anything
  above the top edge leaves the next block floating in mid-air. The only
  shape cut INTO the square is one the reference itself cuts — the Castle
  Gate’s two battlement notches — and those stay exactly as drawn, with the
  rim following them. A notch is EMPTY: it is background, solid magenta
  right down to the rim, like the corner nicks — never white, cream or sky.
  (The first gate came back with white notches, which the game would show
  as two white squares on top of the castle.)
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No drop shadow, no ground beneath it, no background around it.

WHAT EACH SQUARE IS, left to right:
1. Bug Zapper: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy INDIGO toy plastic running across its lower third, with a white gloss streak and two round studs, WITH a glowing blue-violet bug-zapper lantern mounted on it. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #4d52d6, its lower half #2b2f8f, studs and gloss #8189f2. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #4d52d6.
2. Ice Pop: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy SKY-BLUE toy plastic running across its lower third, with a white gloss streak and two round studs, with icy white rime dripping in a wavy line over its top edge, WITH a giant blue ice pop on a wooden stick mounted on it. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #5cc4ea, its lower half #2382b5, studs and gloss #aaeaff. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #5cc4ea.
3. Toothpick Wall: a cube of golden sand with one mould ridge and grain speckle, and six short pale wooden toothpick stubs pushed into its face in two rows of three, angled upward, WITH long wooden toothpicks bristling out of all four sides mounted on it. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #d8ae6a, shadows #a57539, highlights #f2d9a0, accent details #7d5a2e. The RIM round the whole block is #7d5a2e.
4. Bucket & Spade: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy BLUE toy plastic running across its lower third, with a white gloss streak and two round studs, WITH a green toy bucket with a spade mounted on it. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #2f7de1, its lower half #1d5fb5, studs and gloss #72acf2. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #2f7de1.
5. Paper Flag: a square sand plinth with a paper party frill across its lower third — light rose paper cut with pinking-shear teeth, a deep plum-rose stripe along it dotted with six gold dots, WITH a paper swallowtail flag on a toothpick mounted on it. Colours: the plinth pale sand (around #f3dca8, shadows #ab7c42); the paper frill light rose #e685c6 with a deep plum-rose #b8479a stripe and gold #ffd35c dots. The RIM round the whole block is #b8479a.
6. Magic Seashell: a square pearly plinth — pale lilac mother-of-pearl rather than sand — with two soft sheen bands, one lilac and one pale cyan, and a scatter of little white four-point glitter stars, WITH a glowing pink scallop shell mounted on it. Colours: pearly lilac — body around #e8cde4, shadows #ae88b6, highlights #fbeefa; sheen bands #b99ae6 and #9be8ff; glitter #e6fbff. The RIM round the whole block is #b99ae6.
7. Sand Sifter: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy LIME-GREEN toy plastic running across its lower third, with a white gloss streak and two round studs, WITH a toy sand wheel under a funnel of sand mounted on it. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #94cc3a, its lower half #5c961d, studs and gloss #c8ee82. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #94cc3a.
8. Pebble Digger: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy SUNSHINE-YELLOW toy plastic running across its lower third, with a white gloss streak and two round studs, WITH a yellow toy digger scooping pebbles mounted on it. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #ffc21f, its lower half #c98a00, studs and gloss #ffe07a. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #ffc21f.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 2048 x 256 pixels — 8 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Blocks — assembled, body, glyph — row 4  (strip-blocks-r4.png)

```text
Repaint this strip of 8 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO cards, vignettes, matting or paper background. The block itself fills the
  square, and its coloured rim is part of the block, not a frame around it.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame. Its outer ink line runs along all four
  edges of the image — no margin, no gap, not even a few pixels. A block that
  stops short shows a seam in the middle of every wall it is stacked into.
· ROUNDED corners, rounded exactly as the reference rounds them: the radius is
  about a tenth of the side. Only the four little corner nicks outside that
  rounding show the background — solid magenta, all four of them, never white.
· THE RIM — keep it. A band in the block’s own rim colour (given below) runs
  all the way round the block just inside its outer edge, following the
  rounded corners. It is about 4% of the side wide, with the dark brown ink
  line along both sides of it. The rim is how a player tells one block from
  another at a glance, so it is part of the block and NOT a frame around a
  picture: never drop it, never thin it to a hairline, and never paint it in
  any colour but its own.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, bucket-shaped
  tops, wheels, peaked roof, rounded shoulders, legs or protruding parts. It
  is ONE cube cut from a sandcastle wall, not a little sandcastle. Anything
  above the top edge leaves the next block floating in mid-air. The only
  shape cut INTO the square is one the reference itself cuts — the Castle
  Gate’s two battlement notches — and those stay exactly as drawn, with the
  rim following them. A notch is EMPTY: it is background, solid magenta
  right down to the rim, like the corner nicks — never white, cream or sky.
  (The first gate came back with white notches, which the game would show
  as two white squares on top of the castle.)
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No drop shadow, no ground beneath it, no background around it.

CRITICAL: this row is the BASE of each block with its toy REMOVED. No blasters, water pistols, tubes, zappers, ice pops, spades, flags, shells or piggy banks anywhere in this row. The game draws those on top at runtime — paint one in and the block ends up with two.

WHAT EACH SQUARE IS, left to right:
1. Bug Zapper — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy INDIGO toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws a glowing blue-violet bug-zapper lantern live ON TOP of this body, so paint NO glowing blue-violet bug-zapper lantern here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #4d52d6, its lower half #2b2f8f, studs and gloss #8189f2. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #4d52d6.
2. Ice Pop — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy SKY-BLUE toy plastic running across its lower third, with a white gloss streak and two round studs, with icy white rime dripping in a wavy line over its top edge. The game draws a giant blue ice pop on a wooden stick live ON TOP of this body, so paint NO giant blue ice pop on a wooden stick here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #5cc4ea, its lower half #2382b5, studs and gloss #aaeaff. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #5cc4ea.
3. Toothpick Wall — the block BODY, which is the file that ships: a cube of golden sand with one mould ridge and grain speckle, and six short pale wooden toothpick stubs pushed into its face in two rows of three, angled upward. The game draws long wooden toothpicks bristling out of all four sides live ON TOP of this body, so paint NO long wooden toothpicks bristling out of all four sides here. Keep the face above the bottom edge plain: whatever is painted there ends up buried under the toy. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #d8ae6a, shadows #a57539, highlights #f2d9a0, accent details #7d5a2e. The RIM round the whole block is #7d5a2e.
4. Bucket & Spade — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy BLUE toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws a green toy bucket with a spade live ON TOP of this body, so paint NO green toy bucket with a spade here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #2f7de1, its lower half #1d5fb5, studs and gloss #72acf2. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #2f7de1.
5. Paper Flag — the block BODY, which is the file that ships: a square sand plinth with a paper party frill across its lower third — light rose paper cut with pinking-shear teeth, a deep plum-rose stripe along it dotted with six gold dots. The game draws a paper swallowtail flag on a toothpick live ON TOP of this body, so paint NO paper swallowtail flag on a toothpick here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth pale sand (around #f3dca8, shadows #ab7c42); the paper frill light rose #e685c6 with a deep plum-rose #b8479a stripe and gold #ffd35c dots. The RIM round the whole block is #b8479a.
6. Magic Seashell — the block BODY, which is the file that ships: a square pearly plinth — pale lilac mother-of-pearl rather than sand — with two soft sheen bands, one lilac and one pale cyan, and a scatter of little white four-point glitter stars. The game draws a glowing pink scallop shell live ON TOP of this body, so paint NO glowing pink scallop shell here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: pearly lilac — body around #e8cde4, shadows #ae88b6, highlights #fbeefa; sheen bands #b99ae6 and #9be8ff; glitter #e6fbff. The RIM round the whole block is #b99ae6.
7. Sand Sifter — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy LIME-GREEN toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws a toy sand wheel under a funnel of sand live ON TOP of this body, so paint NO toy sand wheel under a funnel of sand here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #94cc3a, its lower half #5c961d, studs and gloss #c8ee82. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #94cc3a.
8. Pebble Digger — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy SUNSHINE-YELLOW toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws a yellow toy digger scooping pebbles live ON TOP of this body, so paint NO yellow toy digger scooping pebbles here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #ffc21f, its lower half #c98a00, studs and gloss #ffe07a. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #ffc21f.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 2048 x 256 pixels — 8 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Blocks — assembled, body, glyph — row 5  (strip-blocks-r5.png)

```text
Repaint this strip of 8 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

These are UI ICONS, not scenery: one bold flat pictogram per square on a dark round plate, readable at thumbnail size. Do not turn them into little paintings.

WHAT EACH SQUARE IS, left to right:
1. Build-tray ICON for the Bug Zapper: a bug-zapper lantern with a hanging ring and a lightning bolt — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #4d52d6, its lower half #2b2f8f, studs and gloss #8189f2. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #4d52d6.
2. Build-tray ICON for the Ice Pop: an ice pop with a bite out of the top — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #5cc4ea, its lower half #2382b5, studs and gloss #aaeaff. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #5cc4ea.
3. Build-tray ICON for the Toothpick Wall: a small square with toothpicks splayed out on all four sides, like a hedgehog — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #d8ae6a, shadows #a57539, highlights #f2d9a0, accent details #7d5a2e. The RIM round the whole block is #7d5a2e.
4. Build-tray ICON for the Bucket & Spade: a bucket with an arched handle and a spade beside it — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #2f7de1, its lower half #1d5fb5, studs and gloss #72acf2. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #2f7de1.
5. Build-tray ICON for the Paper Flag: a swallowtail flag on a toothpick planted in a sand mound — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colours: the plinth pale sand (around #f3dca8, shadows #ab7c42); the paper frill light rose #e685c6 with a deep plum-rose #b8479a stripe and gold #ffd35c dots. The RIM round the whole block is #b8479a.
6. Build-tray ICON for the Magic Seashell: a ribbed scallop shell on a small base, with a sparkle — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colours: pearly lilac — body around #e8cde4, shadows #ae88b6, highlights #fbeefa; sheen bands #b99ae6 and #9be8ff; glitter #e6fbff. The RIM round the whole block is #b99ae6.
7. Build-tray ICON for the Sand Sifter: a sieve with falling grains over a sand heap — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #94cc3a, its lower half #5c961d, studs and gloss #c8ee82. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #94cc3a.
8. Build-tray ICON for the Pebble Digger: a toy digger with tracks, a cab and a scoop holding a pebble — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #ffc21f, its lower half #c98a00, studs and gloss #ffe07a. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #ffc21f.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 2048 x 256 pixels — 8 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Blocks — assembled, body, glyph — row 6  (strip-blocks-r6.png)

```text
Repaint this strip of 8 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO cards, vignettes, matting or paper background. The block itself fills the
  square, and its coloured rim is part of the block, not a frame around it.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame. Its outer ink line runs along all four
  edges of the image — no margin, no gap, not even a few pixels. A block that
  stops short shows a seam in the middle of every wall it is stacked into.
· ROUNDED corners, rounded exactly as the reference rounds them: the radius is
  about a tenth of the side. Only the four little corner nicks outside that
  rounding show the background — solid magenta, all four of them, never white.
· THE RIM — keep it. A band in the block’s own rim colour (given below) runs
  all the way round the block just inside its outer edge, following the
  rounded corners. It is about 4% of the side wide, with the dark brown ink
  line along both sides of it. The rim is how a player tells one block from
  another at a glance, so it is part of the block and NOT a frame around a
  picture: never drop it, never thin it to a hairline, and never paint it in
  any colour but its own.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, bucket-shaped
  tops, wheels, peaked roof, rounded shoulders, legs or protruding parts. It
  is ONE cube cut from a sandcastle wall, not a little sandcastle. Anything
  above the top edge leaves the next block floating in mid-air. The only
  shape cut INTO the square is one the reference itself cuts — the Castle
  Gate’s two battlement notches — and those stay exactly as drawn, with the
  rim following them. A notch is EMPTY: it is background, solid magenta
  right down to the rim, like the corner nicks — never white, cream or sky.
  (The first gate came back with white notches, which the game would show
  as two white squares on top of the castle.)
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No drop shadow, no ground beneath it, no background around it.

WHAT EACH SQUARE IS, left to right:
1. Piggy Bank: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy BUBBLE-GUM PINK toy plastic running across its lower third, with a white gloss streak and two round studs, WITH a pink piggy bank mounted on it. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #ffabbf, its lower half #d05a8e, studs and gloss #ffc8dc. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #ffabbf.
2. Paper Boat: a folded notebook-paper boat, blue ruled lines and a red margin line on the paper, WITH a toothpick spear stuck in a pink eraser mounted on it. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #e4ecf5, shadows #8ea3ba, highlights #ffffff, accent details #5a9be6. The RIM round the whole block is #e4ecf5.
3. Rubber Duck: a fat yellow rubber bath duck with an orange beak and a blue saddle strap, facing left, WITH a toy dart launcher on its back mounted on it. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #ffc93c, shadows #d99400, highlights #ffe78f, accent details #ff8a2b. The RIM round the whole block is #ffc93c.
4. Toy Pirate Ship: a brown moulded-plastic toy pirate ship with gold trim, portholes and a red-striped sail, WITH two cork cannons mounted on it. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #8c4d2b, shadows #4f2a18, highlights #bd7a45, accent details #ffc93c. The RIM round the whole block is #8c4d2b.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 2048 x 256 pixels — 8 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Blocks — assembled, body, glyph — row 7  (strip-blocks-r7.png)

```text
Repaint this strip of 8 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO cards, vignettes, matting or paper background. The block itself fills the
  square, and its coloured rim is part of the block, not a frame around it.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame. Its outer ink line runs along all four
  edges of the image — no margin, no gap, not even a few pixels. A block that
  stops short shows a seam in the middle of every wall it is stacked into.
· ROUNDED corners, rounded exactly as the reference rounds them: the radius is
  about a tenth of the side. Only the four little corner nicks outside that
  rounding show the background — solid magenta, all four of them, never white.
· THE RIM — keep it. A band in the block’s own rim colour (given below) runs
  all the way round the block just inside its outer edge, following the
  rounded corners. It is about 4% of the side wide, with the dark brown ink
  line along both sides of it. The rim is how a player tells one block from
  another at a glance, so it is part of the block and NOT a frame around a
  picture: never drop it, never thin it to a hairline, and never paint it in
  any colour but its own.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, bucket-shaped
  tops, wheels, peaked roof, rounded shoulders, legs or protruding parts. It
  is ONE cube cut from a sandcastle wall, not a little sandcastle. Anything
  above the top edge leaves the next block floating in mid-air. The only
  shape cut INTO the square is one the reference itself cuts — the Castle
  Gate’s two battlement notches — and those stay exactly as drawn, with the
  rim following them. A notch is EMPTY: it is background, solid magenta
  right down to the rim, like the corner nicks — never white, cream or sky.
  (The first gate came back with white notches, which the game would show
  as two white squares on top of the castle.)
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No drop shadow, no ground beneath it, no background around it.

CRITICAL: this row is the BASE of each block with its toy REMOVED. No blasters, water pistols, tubes, zappers, ice pops, spades, flags, shells or piggy banks anywhere in this row. The game draws those on top at runtime — paint one in and the block ends up with two.

WHAT EACH SQUARE IS, left to right:
1. Piggy Bank — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy BUBBLE-GUM PINK toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws a pink piggy bank live ON TOP of this body, so paint NO pink piggy bank here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #ffabbf, its lower half #d05a8e, studs and gloss #ffc8dc. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #ffabbf.
2. Reference only — the Paper Boat hull has its own sheet. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #e4ecf5, shadows #8ea3ba, highlights #ffffff, accent details #5a9be6. The RIM round the whole block is #e4ecf5.
3. Reference only — the Rubber Duck hull has its own sheet. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #ffc93c, shadows #d99400, highlights #ffe78f, accent details #ff8a2b. The RIM round the whole block is #ffc93c.
4. Reference only — the Toy Pirate Ship hull has its own sheet. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #8c4d2b, shadows #4f2a18, highlights #bd7a45, accent details #ffc93c. The RIM round the whole block is #8c4d2b.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 2048 x 256 pixels — 8 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Blocks — assembled, body, glyph — row 8  (strip-blocks-r8.png)

```text
Repaint this strip of 8 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

These are UI ICONS, not scenery: one bold flat pictogram per square on a dark round plate, readable at thumbnail size. Do not turn them into little paintings.

WHAT EACH SQUARE IS, left to right:
1. Build-tray ICON for the Piggy Bank: a piggy bank with a coin above its slot — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #ffabbf, its lower half #d05a8e, studs and gloss #ffc8dc. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #ffabbf.
2. Build-tray ICON for the Paper Boat: a paper boat with a toothpick spear angled up and to the right — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #e4ecf5, shadows #8ea3ba, highlights #ffffff, accent details #5a9be6. The RIM round the whole block is #e4ecf5.
3. Build-tray ICON for the Rubber Duck: a duck with a harpoon angled up and to the right — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #ffc93c, shadows #d99400, highlights #ffe78f, accent details #ff8a2b. The RIM round the whole block is #ffc93c.
4. Build-tray ICON for the Toy Pirate Ship: a hull with a stern castle, a mast and a sail — a bold, flat, near-white pictogram on a dark round plate over the block's body. Not a miniature painting. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #8c4d2b, shadows #4f2a18, highlights #bd7a45, accent details #ffc93c. The RIM round the whole block is #8c4d2b.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 2048 x 256 pixels — 8 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Merged blocks — tier I / II / III — row 0  (strip-merged-r0.png)

```text
Repaint this strip of 9 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

WHAT EACH SQUARE IS, left to right:
1. Dart Blaster: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy ORANGE toy plastic running across its lower third, with a white gloss streak and two round studs, with an orange-and-blue toy foam-dart blaster. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #ff8a2b, its lower half #c75416, studs and gloss #ffb56e. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #ff8a2b.
2. Squirt Gun: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy GREEN toy plastic running across its lower third, with a white gloss streak and two round studs, with a chunky green toy water pistol with a water tank on top. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #43b649, its lower half #23833b, studs and gloss #86dc6e. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #43b649.
3. Mud Mortar: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy PURPLE toy plastic running across its lower third, with a white gloss streak and two round studs, with a blue toy bucket tube lobbing a mud ball. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #8a5cd8, its lower half #5b36a8, studs and gloss #b895f0. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #8a5cd8.
4. Balloon Launcher: a square sand plinth with a sunken firing pit in the middle of its face — a dark oval crater ringed in glossy TEAL plastic with a white glint — and three little sand mounds along the bottom edge. No plastic band on this one, with a cardboard launch tube with a water balloon. Colours: the plinth pale sand (around #f3dca8, shadows #ab7c42); the pit ring teal plastic around #1fb5a8 (shade #138a80); the crater dark brown #6e4a24. The RIM round the whole block is #1fb5a8.
5. Bug Zapper: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy INDIGO toy plastic running across its lower third, with a white gloss streak and two round studs, with a glowing blue-violet bug-zapper lantern. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #4d52d6, its lower half #2b2f8f, studs and gloss #8189f2. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #4d52d6.
6. Ice Pop: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy SKY-BLUE toy plastic running across its lower third, with a white gloss streak and two round studs, with icy white rime dripping in a wavy line over its top edge, with a giant blue ice pop on a wooden stick. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #5cc4ea, its lower half #2382b5, studs and gloss #aaeaff. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #5cc4ea.
7. Paper Boat: a folded notebook-paper boat, blue ruled lines and a red margin line on the paper, with a toothpick spear stuck in a pink eraser. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #e4ecf5, shadows #8ea3ba, highlights #ffffff, accent details #5a9be6. The RIM round the whole block is #e4ecf5.
8. Rubber Duck: a fat yellow rubber bath duck with an orange beak and a blue saddle strap, facing left, with a toy dart launcher on its back. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #ffc93c, shadows #d99400, highlights #ffe78f, accent details #ff8a2b. The RIM round the whole block is #ffc93c.
9. Toy Pirate Ship: a brown moulded-plastic toy pirate ship with gold trim, portholes and a red-striped sail, with two cork cannons. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #8c4d2b, shadows #4f2a18, highlights #bd7a45, accent details #ffc93c. The RIM round the whole block is #8c4d2b.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 2304 x 256 pixels — 9 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Merged blocks — tier I / II / III — row 1  (strip-merged-r1.png)

```text
Repaint this strip of 9 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

WHAT EACH SQUARE IS, left to right:
1. Dart Blaster merged to tier II: the same orange-and-blue toy foam-dart blaster, made fancier — a stripe in the tier colour along the bottom of the body, and a sticker on its side. ONE toy, never a pair. Keep the small rounded plastic rank badge reading II crisp in the top-right corner. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #ff8a2b, its lower half #c75416, studs and gloss #ffb56e. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #ff8a2b.
2. Squirt Gun merged to tier II: the same chunky green toy water pistol with a water tank on top, made fancier — a racing stripe in the tier colour along the body under the orange decal, and a star sticker near the front. ONE toy, never a pair. Keep the small rounded plastic rank badge reading II crisp in the top-right corner. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #43b649, its lower half #23833b, studs and gloss #86dc6e. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #43b649.
3. Mud Mortar merged to tier II: the same blue toy bucket tube lobbing a mud ball, made fancier — a star sticker on the side of the bucket. ONE toy, never a pair. Keep the small rounded plastic rank badge reading II crisp in the top-right corner. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #8a5cd8, its lower half #5b36a8, studs and gloss #b895f0. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #8a5cd8.
4. Balloon Launcher merged to tier II: the same cardboard launch tube with a water balloon, made fancier — a sticker on the cardboard tube. ONE toy, never a pair. Keep the small rounded plastic rank badge reading II crisp in the top-right corner. Colours: the plinth pale sand (around #f3dca8, shadows #ab7c42); the pit ring teal plastic around #1fb5a8 (shade #138a80); the crater dark brown #6e4a24. The RIM round the whole block is #1fb5a8.
5. Bug Zapper merged to tier II: the same glowing blue-violet bug-zapper lantern, made fancier — a sticker on the base. ONE toy, never a pair. Keep the small rounded plastic rank badge reading II crisp in the top-right corner. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #4d52d6, its lower half #2b2f8f, studs and gloss #8189f2. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #4d52d6.
6. Ice Pop merged to tier II: the same giant blue ice pop on a wooden stick, made fancier — a stripe in the tier colour across the upper pop, and a sticker on the stick. ONE toy, never a pair. Keep the small rounded plastic rank badge reading II crisp in the top-right corner. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #5cc4ea, its lower half #2382b5, studs and gloss #aaeaff. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #5cc4ea.
7. Paper Boat merged to tier II: the same boat, grown bigger. Keep the small rounded plastic rank badge reading II crisp. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #e4ecf5, shadows #8ea3ba, highlights #ffffff, accent details #5a9be6. The RIM round the whole block is #e4ecf5.
8. Rubber Duck merged to tier II: the same boat, grown bigger. Keep the small rounded plastic rank badge reading II crisp. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #ffc93c, shadows #d99400, highlights #ffe78f, accent details #ff8a2b. The RIM round the whole block is #ffc93c.
9. Toy Pirate Ship merged to tier II: the same boat, grown bigger. Keep the small rounded plastic rank badge reading II crisp. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #8c4d2b, shadows #4f2a18, highlights #bd7a45, accent details #ffc93c. The RIM round the whole block is #8c4d2b.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 2304 x 256 pixels — 9 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Merged blocks — tier I / II / III — row 2  (strip-merged-r2.png)

```text
Repaint this strip of 9 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

WHAT EACH SQUARE IS, left to right:
1. Dart Blaster merged to tier III: the same orange-and-blue toy foam-dart blaster, made fancier — the stripe and the sticker, plus a yellow dart drum with six orange dart ends under the barrel, and the sight fin swapped for a blue scope with a pale lens. ONE toy, never a pair. Keep the small rounded plastic rank badge reading III crisp in the top-right corner. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #ff8a2b, its lower half #c75416, studs and gloss #ffb56e. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #ff8a2b.
2. Squirt Gun merged to tier III: the same chunky green toy water pistol with a water tank on top, made fancier — the stripe and the sticker, plus a white pressure gauge with a red needle on the rear of the body and a bigger water tank on top. ONE toy, never a pair. Keep the small rounded plastic rank badge reading III crisp in the top-right corner. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #43b649, its lower half #23833b, studs and gloss #86dc6e. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #43b649.
3. Mud Mortar merged to tier III: the same blue toy bucket tube lobbing a mud ball, made fancier — the sticker, plus a yellow band around the bucket. ONE toy, never a pair. Keep the small rounded plastic rank badge reading III crisp in the top-right corner. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #8a5cd8, its lower half #5b36a8, studs and gloss #b895f0. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #8a5cd8.
4. Balloon Launcher merged to tier III: the same cardboard launch tube with a water balloon, made fancier — the sticker, plus a third blue band on the tube and a bigger water balloon. ONE toy, never a pair. Keep the small rounded plastic rank badge reading III crisp in the top-right corner. Colours: the plinth pale sand (around #f3dca8, shadows #ab7c42); the pit ring teal plastic around #1fb5a8 (shade #138a80); the crater dark brown #6e4a24. The RIM round the whole block is #1fb5a8.
5. Bug Zapper merged to tier III: the same glowing blue-violet bug-zapper lantern, made fancier — the sticker, plus twin charge coils on the roof corners — pale rods topped with pale cyan balls. ONE toy, never a pair. Keep the small rounded plastic rank badge reading III crisp in the top-right corner. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #4d52d6, its lower half #2b2f8f, studs and gloss #8189f2. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #4d52d6.
6. Ice Pop merged to tier III: the same giant blue ice pop on a wooden stick, made fancier — the stripe and the sticker, plus a crown of three ice-crystal diamonds above the top. ONE toy, never a pair. Keep the small rounded plastic rank badge reading III crisp in the top-right corner. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #5cc4ea, its lower half #2382b5, studs and gloss #aaeaff. Keep that band bright and saturated. The plinth is the SAME pale sand as every other toy block in the game: do not tint the sand towards the band colour, and do not fade the band towards the sand. The RIM round the whole block is #5cc4ea.
7. Paper Boat merged to tier III: the same boat, grown bigger. Keep the small rounded plastic rank badge reading III crisp. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #e4ecf5, shadows #8ea3ba, highlights #ffffff, accent details #5a9be6. The RIM round the whole block is #e4ecf5.
8. Rubber Duck merged to tier III: the same boat, grown bigger. Keep the small rounded plastic rank badge reading III crisp. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #ffc93c, shadows #d99400, highlights #ffe78f, accent details #ff8a2b. The RIM round the whole block is #ffc93c.
9. Toy Pirate Ship merged to tier III: the same boat, grown bigger. Keep the small rounded plastic rank badge reading III crisp. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #8c4d2b, shadows #4f2a18, highlights #bd7a45, accent details #ffc93c. The RIM round the whole block is #8c4d2b.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 2304 x 256 pixels — 9 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Bugs — ground, air and water — row 0  (strip-enemies-r0.png)

```text
Repaint this strip of 6 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

WHAT EACH SQUARE IS, left to right:
1. Black Ant: a cartoon black ant seen from the side: three glossy beads — a big round head at the front, a small humped thorax and a fat egg-shaped abdomen tilted up at the back with three darker bands — joined by a tiny waist knot; six legs with little knee nubs, the feet flat on the sand; two elbowed antennae with club tips; two curved mandibles. Two white eyes with black pupils under heavy lids that slope together into a determined frown, and a small down-turned mouth. Facing RIGHT, drawn at 0.62 cells in game. Colours: blue-black slate — body #3e3d58, highlights #5d6588, legs #3a3952, mandibles #4b4a66 — with icy blue-white shine streaks. This one is inked in near-black (#15101a).
2. Cockroach: a cartoon cockroach, the lowest and longest shape in the cast: one long glossy oval of wing cases skimming the sand with a long cream shine streak along its back, a ringed belly showing below, a head shield with a cream front rim over a small round head tucked low at the front, two whip antennae longer than its whole body sweeping up and back, two tail prongs, and six splayed spiny legs. Sly V-shaped lids and a smirk. Facing RIGHT, drawn at 0.55 cells in game. Colours: glossy chestnut — wing cases #9a4a20, belly #733617, head shield #843f1b, legs #ab6531 (far legs #7c4321) — with a cream shine streak.
3. Spitting Spider: a round, fuzzy cartoon jumping spider in three-quarter view: a big furry tan head with a darker mask across the eyes and cream cheek fur, and a round charcoal abdomen riding behind it like a backpack, with a bold orange arcing stripe and three cream spots; eight legs with high arched knees and pale bands, the front pair crossed in front of its face; two cream fuzzy palps like mittens and small teal jaws with little white fangs. Two ENORMOUS glossy black front eyes (one bigger than the other), two small side eyes and two dots on the crown, under white fur brows in a menacing V. A thin white silk line trails from its rear down to the sand. Facing RIGHT, drawn at 0.6 cells in game. Colours: head tan #9a7452, abdomen charcoal #4d4852 with an orange #ff8a2b stripe, legs #765945 with pale bands #cfb08a, jaws teal #2cb9a5.
4. Rhino Beetle: a heavy rhino beetle seen from the side, leaning forward like a wedge: a tall glossy domed shell at the back, a lower dome in front, and the head lowest at the front with ONE big thick horn sweeping forward and curling up and back to a point, plus a small second horn jutting forward off the front dome; six thick toothed legs. Orange eyes under heavy V-shaped lids and a flat clamped mouth. Built to hit a wall and keep going. Facing RIGHT, drawn at 0.85 cells in game. Colours: glossy mahogany — shell and horns #6c2c19, head #7a3520, legs #6c2e1a — with a strong peach shine band on the dome and up the horn; eyes #ffb347.
5. Bombardier Beetle: a nervous bombardier beetle in three-quarter side view: a glossy navy-blue shell dome with fine grooves and a blue-white shine, an orange head and middle, six orange legs and two beaded antennae. A too-wide clenched white grin, wide eyes with tiny darting pupils, worried eyebrows and a blue sweat drop behind its head — and cream puffs of stink smoke curling up out of its backside, with a hot yellow puff at the tail. It is about to go pop. Facing RIGHT, drawn at 0.66 cells in game. Colours: shell navy #2c3a6e, head and body orange #ff8a2b, legs #f47a22, smoke puffs cream, sweat drop #a9e4ff.
6. Housefly: a cartoon housefly: a broad grey hairy thorax with four stripes and black bristles along its outline, an olive-grey barrel abdomen with dark chequer patches, six thin dark legs dangling, and two clear veined wings held out in a V behind it. Its silver face sits between two HUGE cherry-red compound eyes with big dark pupils looking to the right — one eye bigger, one brow cocked and one scowling — with a lopsided smirk and a dangling tube mouth. Facing RIGHT, drawn at 0.5 cells in game. Colours: thorax grey #5b6072, abdomen olive-grey #7b7560, face silver #d9d4c4, eyes cherry red #e0362d; the wings clear with a faint warm tint — never pink or magenta.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 1536 x 256 pixels — 6 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Bugs — ground, air and water — row 1  (strip-enemies-r1.png)

```text
Repaint this strip of 6 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

WHAT EACH SQUARE IS, left to right:
1. Roly-Poly: a roly-poly pill bug in three-quarter view: a tall half-dome of seven overlapping grey armour plates, every other plate a little darker, each with a light lip; many short legs rippling underneath; a small grey head peeking over the top front with two short elbowed antennae, smug flat eyelids and a small smirk. Held out on its RIGHT side, gripped by two front legs, is a red BOTTLE CAP used as a shield — crimped silver rim, a printed yellow ring and a cream star in the middle. That shield is how the player knows it is armoured in front: keep it big and clear. Facing RIGHT, drawn at 0.78 cells in game. Colours: plates grey #9aa3ad, head #7d8693, legs #b3adb5 (far legs #6e7782); bottle cap red #e5483b with a silver #d1d6dc rim, a yellow #ffc93c ring and a cream star.
2. Hornet: an angry cartoon hornet in side view: a yellow abdomen angled down and back with three near-black bands, ending in a dark tip and a stinger with a cream glint; a fuzzy rust-brown thorax with a pinched dark waist; a yellow face under a dark rust helmet like a mask, elbowed black antennae and two dark toothed pincers held open. Four amber-tinted wings raised over its back; three yellow legs near, three darker far. Red eyes with lowered lids and hard angry V brows. Facing RIGHT, drawn at 0.8 cells in game. Colours: abdomen yellow #ffc21f with near-black bands, thorax and helmet rust-brown #8e3a22, eyes red, wings amber-tinted.
3. Bumblebee: a round, fuzzy cartoon bumblebee — one big golden fuzz-ball body with two curved black bands and a cream tail band, fuzz tufts all round its outline, and tiny clear wings on top beating flat out with little white effort arcs. A small dark head with knobbed antennae, pink cheeks, big dark eyes and a cream grin. Its black hind legs stick out to the sides with orange pollen baskets, and its two front legs hug a golden HONEY BOMB under its belly — a ball of honey with a faint honeycomb pattern, a wet shine and drips. Facing RIGHT, drawn at 0.82 cells in game. Colours: body gold #ffc42e with black bands and a cream tail band, honey bomb #ffb319, pollen baskets orange, cheeks soft pink.
4. Firefly: a cartoon firefly carrying fire: a dark plum body, dark wing cases raised in a V with yellow edges, smoky clear hind wings spread to the sides, and a salmon-red hood over its head with a black spot and a yellow rim; big dark eyes with huge pupils and sleepy, sly lids. Its tail is a glowing pale-lime lantern. Held out in its front legs on its RIGHT side is a glowing orange ember with a gold core and a few rising sparks; four more legs dangle. Facing RIGHT, drawn at 0.9 cells in game. Colours: body plum #40333c, wing-case edges yellow #ffd85c, hood salmon #f26c52, lantern pale lime #eaff8a with its green glow kept tight, ember orange #ff6d1f with a gold core.
5. Water Tiger: a water tiger — a diving-beetle larva — swimming side-on: a long thin ribbon of twelve rings, pinched at every ring, with a dark saddle on the back of each ring and a cream belly, six short paddling legs and bristly tail prongs. A flat wedge head with a dark cap and two reddish-brown sickle jaws bowing out and hooking back in — they NEVER close, so its mouth is always open — with a crooked grin between them and lime eyes, the far eye peeking over the crown. Facing RIGHT, drawn at 0.85 cells in game. Colours: body ochre #d6b24c, saddles #735424, belly cream, jaws #8e4a22, eyes lime #b8e04a.
6. Diving Beetle: a diving beetle swimming side-on: a rigid glossy olive oval shell with a bright yellow rim along its lower edge and around the tail, an olive head at the front with a small chin pincer, a dark belly, an air bubble at its tail, and two big amber oar legs plus two smaller paddles fringed with cream hairs. Amber eyes under a flat, determined brow. Stiff as a pebble — its body never bends. Facing RIGHT, drawn at 1 cells in game. Colours: shell olive #40602c with a yellow #ffc93c rim and a pale-green catch-light, oar legs amber, fringes cream.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 1536 x 256 pixels — 6 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Bugs — ground, air and water — row 2  (strip-enemies-r2.png)

```text
Repaint this strip of 6 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

WHAT EACH SQUARE IS, left to right:
1. Toe-Biter: a toe-biter — a giant water bug — swimming side-on: a big flat brown oval body tipped slightly so its back shows, folded wings with a pale leathery half and a dark tip, a segment-ticked rim, twin breathing tubes trailing at the tail, and a small pointed head with a beak. Two grabbing arms shaped like a "7" held up in front of its face, each ending in a dark hooked claw; four fringed paddle legs. A stalk arches up off its crown to hang a small glowing pale-green bulb in front of its face, like an angler fish. Pale yellow eyes with tiny pupils under a menacing brow. Facing RIGHT, drawn at 1.25 cells in game. Colours: body brown #9a5c28, wings pale leather with dark tips, lure pale green #b6ff8c with its glow kept tight, eyes pale yellow.
2. Dragonfly Nymph: a fat dragonfly nymph swimming side-on: a moss-green nine-ringed abdomen with a darker mottle on each ring, a pale belly and three tail spikes; two leaf-like wing pads lying back along its top; six long legs with the knees up; one big bulging amber dome eye. Folded under its face is a pale khaki hinged lower lip with a smile line — its hands on its chin — that can shoot forward with two dark hooks flung open. Facing RIGHT, drawn at 1.4 cells in game. Colours: body moss green #83a13f, the hinged lip khaki #bdbf6c, hooks dark brown #6a3f1c, eye amber #ffc94a.
3. Stag Beetle: the boss: a huge stag beetle in a near-frontal crest pose — a wide flat black-maroon head with a scowl built into its outline, a wide shield behind it and a bulging mahogany wing case behind that; giant rust-red antler mandibles rising above the head, spreading out and hooking back in at dark tips like a crown (one inner prong on the left antler, two on the right); six long dark spurred legs, comb-tipped antennae and a golden moustache of palps. Amber eyes with slit pupils under heavy angry brow ridges. Slow, patient and enormous. Facing RIGHT, drawn at 1.45 cells in game. Colours: head #422629, shield #62241f, wing case #8c2a1d, antlers rust-red #a8391f, legs #43292b, palps gold #e8a844, eyes amber #ffb428.
4. Red Ant: a lean red fire ant, reared up on its four back legs, seen from the side: its front pair are raised as arms holding a big grey speckled pebble — about the size of its head — up over its head, and that pebble is its silhouette tell. A double waist knot, a longer banded abdomen with a darker tip, mandibles, yellow eyes under V-shaped lids with the front eye squinting harder, and a lopsided grin. Facing RIGHT. Colours: fire-ant red — body #dd4b2b, abdomen #b93822, legs #cf4a2a, mandibles #a8321c; eyes #ffcf3f; the pebble grey #9aa3ad.
5. Mosquito: a lanky cartoon mosquito in side profile: a small humped thorax with a cream stripe, a long abdomen angled down and back with five cream bands and a swollen rosy tip; six very long legs with cream-banded joints, the hind pair curled up high — the legs are half its silhouette; two narrow clear wings raised over its back, feathery antennae, and a long straight needle aimed low and forward with a white glint at the tip. Lime-green eyes under heavy lids. Facing RIGHT. Colours: body purple #6d3f86, bands cream #f7eed8, eyes lime #c4ee3a, the needle mauve with a white tip.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 1536 x 256 pixels — 6 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Ant contraptions (siege engines) — row 0  (strip-siege-r0.png)

```text
Repaint this strip of 3 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

WHAT EACH SQUARE IS, left to right:
1. Pencil Ram: a red die-cast toy car driven by ants, with a popsicle-stick gantry over its roof from which a sharpened yellow pencil hangs on two rubber bands as a battering ram, point forward, an ant in an acorn-cap helmet riding it like a jouster. Facing RIGHT, 1.15 cells in game. Colours: car red #e5483b with a yellow #ffc93c racing stripe, pencil yellow with a sharpened cedar tip, popsicle sticks #efcd92, ants glossy black #342b31.
2. Rubber-Band Crossbow: an ant-built crossbow on green bottle-cap wheels: a popsicle-stick carriage and stock, two popsicle-stick arms strung with a fat pink rubber band, a toothpick loaded in the groove, a corrugated-cardboard shield at the front, and an ant turning a brass wind-up key at the back. Facing RIGHT, 1.2 cells in game. Colours: popsicle sticks #efcd92, bottle caps green #43b649, rubber bands pink #ff5f8f, toothpicks #f3d6a6, cardboard #cf9f62, brass key #e2b447.
3. Spoon Catapult: an ant-built catapult on yellow bottle-cap wheels: a stacked popsicle-stick frame, a pink plastic spoon as the throwing arm sprung by a wad of rubber bands, a kitchen sponge at the front as its stop, a cotton reel of thread at the tail, and pebbles on the deck. Facing RIGHT, 1.45 cells in game. Colours: spoon pink #ff6fae, bottle caps and bands yellow #ffc93c, popsicle sticks #efcd92, sponge #ffd23f with a green #3fa84a scourer, pebbles grey #9aa3ad.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 768 x 256 pixels — 3 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Ant contraptions (siege engines) — row 1  (strip-siege-r1.png)

```text
Repaint this strip of 3 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

WHAT EACH SQUARE IS, left to right:
1. Juice-Box Tower: an orange juice box on red button wheels, with a red bottle cap on top as a fighting top holding two ant archers with toothpick bows, a striped bendy-straw flagpole with a red paper flag, and a cardboard ramp hinged at the top front. Facing RIGHT, 1.05 cells in game. Colours: carton orange #ff8a2b with a white top band and a green #43b649 wave, red #e5483b cap, buttons and flag, cardboard #cf9f62.
2. Pencil Trebuchet: an ant-built trebuchet on red bottle-cap wheels: a popsicle-stick A-frame lashed with green rubber bands, a long yellow pencil as the throwing beam on a red pushpin pivot, a big pink eraser hanging from a paperclip as the counterweight, and a string sling with a pale cloth pouch. Facing RIGHT, 1.7 cells in game. Colours: popsicle sticks #efcd92, bottle caps red #e5483b, bands green #43b649, pencil yellow #ffc93c, eraser pink #ff8ea4, pouch #ffe08a.
3. Tin-Can Ram: a soup tin lying on its side on a popsicle-stick sled with bottle-cap wheels, its can-opened lid bent up over the open mouth like a visor, a steel dinner fork sliding out of the mouth as the ram, and foam darts stuck uselessly to the tin — shiny cold TIN, never cardboard or plastic, because it is the only enemy foam darts cannot hurt. Facing RIGHT, 1.35 cells in game. Colours: tin #b7c0cb with bright specular bands, a torn red label #d8402f with a cream disc, fork steel #d3dae2, bottle caps dark grey #4a4f58.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 768 x 256 pixels — 3 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Toy Knight and projectiles — row 0  (strip-allies-r0.png)

```text
Repaint this strip of 8 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

WHAT EACH SQUARE IS, left to right:
1. Toy Knight: a blue plastic toy knight with a striped lance on a white plastic toy horse, gold pennant, facing RIGHT. The FRIENDLY unit — it must never read as something to shoot at. Colours: the knight, shield, chanfron and chest plate toy-blue around #2f7de1 (shade #1a4f9c); the caparison light blue #6fb0f5; gold trim, mane, tail, plume and pennant around #f2b52c; the horse warm white plastic #f6f1e6 with grey hooves; brown leather tack #9a6238; the lance white with blue candy stripes.
2. foam dart: a toy foam dart in flight: a fat orange foam shaft, a blue rubber suction cup on the front, two little blue fins at the tail, pointing right. Must stay recognisable at a few pixels across in flight.
3. toothpick: a party toothpick fired by an ant-built rubber-band crossbow: thin pale wood, sharp at both ends, a red cellophane frill round the tail. It must not be mistakable for the foam dart, pointing right. Must stay recognisable at a few pixels across in flight.
4. water blob: a squirt-gun water blob: a turquoise droplet with a white glint, tail streaming back (the ant catapult throws the same-sized round as a grey pebble or a sand clod). Must stay recognisable at a few pixels across in flight.
5. mud ball: a lumpy wet mud ball flicking two drips (the balloon launcher fires the same-sized round as a water balloon in pink, blue, green or yellow, knot trailing). Must stay recognisable at a few pixels across in flight.
6. honey bomb: a bumblebee’s honey bomb: a golden honey drop with drips hanging off its belly. Must stay recognisable at a few pixels across in flight.
7. ember: a firefly’s glowing ember: a tumbling coal under its own small flame. Must stay recognisable at a few pixels across in flight.
8. ice shard: an ice-pop shard of blue ice. Must stay recognisable at a few pixels across in flight.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 2048 x 256 pixels — 8 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

---

## Flowers, sky bodies and shipped UI — row 0  (strip-props-r0.png)

```text
Repaint this strip of 6 square game sprites.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
  At its heaviest the outer contour is about 2% of the shorter side of the
  picture: the weight of a brush pen, not of a technical pen. Hold the finished
  picture at thumbnail size — if the outline has thinned to a hairline there,
  it is several times too thin.
· FLAT CEL-STYLE COLOUR inside the lines: one base tone, one soft shadow
  tone, one small highlight, with the light from the UPPER LEFT. A little
  hand-painted texture in the fills, like gouache or marker on paper.
· BRIGHT, WARM, SUNNY COLOUR. Clean toy primaries, warm sand, leaf green and
  paddling-pool turquoise — saturated and cheerful, but never neon.
· MATERIALS READ AS WHAT THEY ARE: sand is grainy and crumbly, pebbles are
  smooth and matte, toy plastic is smooth with one soft highlight and a
  faint moulding seam, bug shells are glossy with a single glint.
· CUTE-EVIL, not scary: bugs are cartoon characters with big expressive
  eyes and a mischievous look. Toys look loved and a little worn.
· Chunky, readable shapes — silhouette first, detail second. Charming,
  slightly naive handmade craft, never slick.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. Much of the look
  above is easiest to picture on a bug, so on a sand block, a pebble, a toy
  or a flower it is easy to read "flat colour" as the whole brief and hand
  back a clip-art icon. A sand block or a squirt gun is painted to exactly
  the same standard as a bug: the same ink, the same light, the same texture
  in the fills and the same glint on anything glossy.

AVOID — these are the ways this goes wrong:
· NO airbrushed or 3D-rendered mobile-game look: no smooth CG gradients, no
  rendered volume, no bevel-and-emboss, no lens flare, no bloom.
· NO muddy, dusty, greyed, aged or parchment look. It is a sunny afternoon,
  not an old book.
· NO medieval fantasy: no stone keeps, iron, timber crates, real armour,
  goblins or monsters. Everything here is sand, toys, garden and bugs.
· NO realistic insects: no hairy macro-photo bugs, no creepy anatomy, no
  gore. Cartoon bugs only.
· NO uniform-weight black vector outlines (clip-art) — the ink is warm
  brown and hand-varied.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

WHAT EACH SQUARE IS, left to right:
1. A tall garden flower for the flower bed in front of the picket fence — a sunflower: bright yellow star petals round a brown centre with an orange ring, a green stem and two leaves. Seen small, so silhouette over detail.
2. A low clump of garden flowers for the same bed — tulip cups in red, yellow and pink among broad leaves, with a daisy or two. Must not read as the tall flower at distance.
3. The sun, drawn like a child’s drawing of one: a yellow disc with an orange edge, twelve round-tipped rays, and a happy face — closed smiling eyes, a smile and rosy cheeks.
4. The moon: a cream disc with a soft lavender crescent of shade on its right, three soft craters and a sleeping face with pink cheeks. No rays.
5. UI art: the coin, the game's everyday currency, shown small in the HUD (about 24–32 px) next to a number. A chunky round gold coin with a thick raised rim and a plump raised five-point star in the middle, facing us square on — the same design as the reference, repainted in the game's own hand: the warm dark-brown ink contour round the rim and the star, cel colour in warm golds (#ffd23f, shadows #d99a1c, highlights #fff3b0), one glossy highlight on the upper left, a faint moulded-plastic toy look. Bold silhouette, star readable at thumbnail size, no fine texture, no lettering, no sparkle rays around it.
6. UI art: the logo. Keep it clean, flat and high-contrast — it is interface, not scenery — and do not restyle any lettering.

BACKGROUND: fill every part of the image that is not an object with solid
pure magenta #FF00FF, edge to edge. Do NOT leave it transparent and do NOT
draw a grey-and-white checkerboard — the last attempt painted the
checkerboard in as if it were art. The magenta is keyed out automatically
on the way back in, so no object may contain magenta or hot pink; a pink
toy is a soft, warm bubble-gum pink.

OUTPUT: exactly 1536 x 256 pixels — 6 squares of 256 x 256 in a single row. Every object stays in its own square, at the same position and the same size, and the squares must stay SQUARE — do not letterbox, crop, pad or change the strip proportions. Do not add, remove, reorder, resize or re-centre anything, and put no labels, numbers or captions anywhere in the image.
```

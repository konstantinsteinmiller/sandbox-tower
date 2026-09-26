# Per-cell prompts — one object per generation

Generated from `src/game/artSheet.ts` — do not hand-edit. Run `pnpm art:prompts`
(or export from the `/art-sheets` bench) after changing the manifest.

Attach `art-sheets/cell-<id>.png` and paste the matching block below.
There is no grid to preserve here, which is the whole point: three sheet
and strip passes each lost the lattice a different way, and not one of
them lost the art.

Copy only the fenced block. The `##` heading is for you, not the model: it
names the image the block belongs to (the reference to attach, and the name
to save the return under) and, after the arrow, where the slice lands under
`public/`. `pnpm art:desk` finds any block by sprite name, copies reference
and prompt in one go, and files, slices and compresses the return.

## gate — body — SLICE THIS  (cell-block-gate-body.png → images/blocks/gate.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Castle Gate — the block BODY, which is the file that ships: a sandcastle gatehouse block of bright dry sand — two shallow square notches cut down into its top edge leave three little merlons that stop exactly AT the top edge; a raised packed-sand arch with pressed joints frames a dark doorway glowing with warm golden light, a popsicle-stick door standing ajar against the right jamb, and a coral-pink scallop shell set over the arch — the thing the whole game protects. Nothing is drawn on top of this one, so it is the whole block. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #eccb8c, shadows #b3803f, highlights #fff1cc, accent details #ffb42e.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## wood — body — SLICE THIS  (cell-block-wood-body.png → images/blocks/wood.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Sand Block — the block BODY, which is the file that ships: a bucket-moulded cube of dry pale sand: a lighter packed band along the top, three wavy horizontal mould ridges, dark and light grain speckle, and one tiny white shell crumb. Nothing is drawn on top of this one, so it is the whole block. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #e3c07e, shadows #b88c4c, highlights #f6e2ae, accent details #9c7038.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## brace — body — SLICE THIS  (cell-block-brace-body.png → images/blocks/brace.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Packed Sand — the block BODY, which is the file that ships: a cube of darker, wetter packed sand with a few damp blotches, and a big X pressed deep into its face from corner to corner — crumbs along the lips of the groove, a couple of wet glints at the upper left, and no frame around the X. Nothing is drawn on top of this one, so it is the whole block. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #c79a5c, shadows #8d673a, highlights #dcb57c, accent details #6e4c26.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## stone — body — SLICE THIS  (cell-block-stone-body.png → images/blocks/stone.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Pebble Wall — the block BODY, which is the file that ships: a cube of damp sand grout faced edge to edge with smooth grey-blue pebbles — about ten big ovals and five small ones in slightly different blue-greys, each with a white glint at its upper left — visibly heavier than sand. Nothing is drawn on top of this one, so it is the whole block. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #8f9aa6, shadows #5f6975, highlights #c9d0d6, accent details #454d57.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## archer — body — SLICE THIS  (cell-block-archer-body.png → images/blocks/archer.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Dart Blaster — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy ORANGE toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws an orange-and-blue toy foam-dart blaster live ON TOP of this body, so paint NO orange-and-blue toy foam-dart blaster here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #ff8a2b, its lower half #c75416, studs and gloss #ffb56e. Keep that band bright and saturated.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## cannon — body — SLICE THIS  (cell-block-cannon-body.png → images/blocks/cannon.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Squirt Gun — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy GREEN toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws a chunky green toy water pistol with a water tank on top live ON TOP of this body, so paint NO chunky green toy water pistol with a water tank on top here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #43b649, its lower half #23833b, studs and gloss #86dc6e. Keep that band bright and saturated.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## mortar — body — SLICE THIS  (cell-block-mortar-body.png → images/blocks/mortar.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Mud Mortar — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy PURPLE toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws a blue toy bucket tube lobbing a mud ball live ON TOP of this body, so paint NO blue toy bucket tube lobbing a mud ball here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #8a5cd8, its lower half #5b36a8, studs and gloss #b894f0. Keep that band bright and saturated.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## bombard — body — SLICE THIS  (cell-block-bombard-body.png → images/blocks/bombard.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Balloon Launcher — the block BODY, which is the file that ships: a square sand plinth with a sunken firing pit in the middle of its face — a dark oval crater ringed in glossy TEAL plastic with a white glint — and three little sand mounds along the bottom edge. No plastic band on this one. The game draws a cardboard launch tube with a water balloon live ON TOP of this body, so paint NO cardboard launch tube with a water balloon here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth pale sand (around #f3dca8, shadows #ab7c42); the pit ring teal plastic around #1fb5a8 (shade #138a80); the crater dark brown #6e4a24.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## tesla — body — SLICE THIS  (cell-block-tesla-body.png → images/blocks/tesla.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Bug Zapper — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy INDIGO toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws a glowing blue-violet bug-zapper lantern live ON TOP of this body, so paint NO glowing blue-violet bug-zapper lantern here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #4d52d6, its lower half #2b2f8f, studs and gloss #8189f2. Keep that band bright and saturated.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## frost — body — SLICE THIS  (cell-block-frost-body.png → images/blocks/frost.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Ice Pop — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy SKY-BLUE toy plastic running across its lower third, with a white gloss streak and two round studs, with icy white rime dripping in a wavy line over its top edge. The game draws a giant blue ice pop on a wooden stick live ON TOP of this body, so paint NO giant blue ice pop on a wooden stick here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #5cc4ea, its lower half #2382b5, studs and gloss #aaeaff. Keep that band bright and saturated.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## spikes — body — SLICE THIS  (cell-block-spikes-body.png → images/blocks/spikes.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Toothpick Wall — the block BODY, which is the file that ships: a cube of golden sand with one mould ridge and grain speckle, and six short pale wooden toothpick stubs pushed into its face in two rows of three, angled upward. The game draws long wooden toothpicks bristling out of all four sides live ON TOP of this body, so paint NO long wooden toothpicks bristling out of all four sides here. Keep the face above the bottom edge plain: whatever is painted there ends up buried under the toy. Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #d8ae6a, shadows #a57539, highlights #f2d9a0, accent details #7d5a2e.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## repair — body — SLICE THIS  (cell-block-repair-body.png → images/blocks/repair.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Bucket & Spade — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy BLUE toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws a green toy bucket with a spade live ON TOP of this body, so paint NO green toy bucket with a spade here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #2f7de1, its lower half #1d5fb5, studs and gloss #72acf2. Keep that band bright and saturated.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## banner — body — SLICE THIS  (cell-block-banner-body.png → images/blocks/banner.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Paper Flag — the block BODY, which is the file that ships: a square sand plinth with a paper party frill across its lower third — light rose paper cut with pinking-shear teeth, a deep plum-rose stripe along it dotted with six gold dots. The game draws a paper swallowtail flag on a toothpick live ON TOP of this body, so paint NO paper swallowtail flag on a toothpick here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth pale sand (around #f3dca8, shadows #ab7c42); the paper frill light rose #e685c6 with a deep plum-rose #b8479a stripe and gold #ffd35c dots.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## obelisk — body — SLICE THIS  (cell-block-obelisk-body.png → images/blocks/obelisk.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Magic Seashell — the block BODY, which is the file that ships: a square pearly plinth — pale lilac mother-of-pearl rather than sand — with two soft sheen bands, one lilac and one pale cyan, and a scatter of little white four-point glitter stars. The game draws a glowing pink scallop shell live ON TOP of this body, so paint NO glowing pink scallop shell here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: pearly lilac — body around #e8cde4, shadows #ae88b6, highlights #fbeefa; sheen bands #b99ae6 and #9be8ff; glitter #e6fbff.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## lumberHut — body — SLICE THIS  (cell-block-lumberHut-body.png → images/blocks/lumberHut.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Sand Sifter — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy LIME-GREEN toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws a toy sand wheel under a funnel of sand live ON TOP of this body, so paint NO toy sand wheel under a funnel of sand here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #94cc3a, its lower half #5c961d, studs and gloss #c8ee82. Keep that band bright and saturated.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## stonepit — body — SLICE THIS  (cell-block-stonepit-body.png → images/blocks/stonepit.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Pebble Digger — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy SUNSHINE-YELLOW toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws a yellow toy digger scooping pebbles live ON TOP of this body, so paint NO yellow toy digger scooping pebbles here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #ffc21f, its lower half #c98a00, studs and gloss #ffe07a. Keep that band bright and saturated.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## coffer — body — SLICE THIS  (cell-block-coffer-body.png → images/blocks/coffer.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Piggy Bank — the block BODY, which is the file that ships: a square sand plinth: pale packed sand with a lighter packed cap band across the top, one faint horizontal mould ridge and fine grain speckle, and a strip of glossy BUBBLE-GUM PINK toy plastic running across its lower third, with a white gloss streak and two round studs. The game draws a pink piggy bank live ON TOP of this body, so paint NO pink piggy bank here. Keep the face above the plastic band plain: whatever is painted there ends up buried under the toy. Colours: the plinth is pale sand (around #f3dca8, shadows #ab7c42, highlights #fbeecb); the plastic BAND only is the toy colour — around #ff8fbf, its lower half #d05a8e, studs and gloss #ffc3dc. Keep that band bright and saturated.

THIS IS A STACKABLE BUILDING BLOCK — the single most important rule here:
· A square block that FILLS the frame edge to edge and corner to corner. The
  material must TOUCH all four edges of the image — no margin, no gap, not
  even a few pixels. A block that stops short shows a seam on every side once
  it is stacked. Let the artwork BLEED off all four edges rather than leave a
  border: the frame is a crop of a wall, not a portrait of an object.
· SQUARE corners. Not rounded, not chamfered, not softened. Rounded corners
  leave four visible holes wherever four blocks meet.
· FLAT top, FLAT bottom, FLAT left and right sides. The player stacks these
  directly on top of and beside each other to build a tower.
· Nothing may stick out past the square: no sandcastle turrets, battlements or
  crenellations, no bucket-shaped tops, no wheels, no peaked roof, no rounded
  shoulders, no legs, no protruding parts. It is ONE cube cut from a sandcastle
  wall, not a little sandcastle. Anything above the top edge leaves the next
  block floating in mid-air.
· Detail belongs ON THE FRONT FACE of the cube, like fittings bolted to a
  wall. It is a face seen straight on, not an object standing in space.
· No margin, no drop shadow, no ground beneath it, no background around it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## grunt — grumpling · 0.62c  (cell-enemy-grunt.png → images/enemies/grunt.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Black Ant: a cartoon black ant seen from the side: three glossy beads — a big round head at the front, a small humped thorax and a fat egg-shaped abdomen tilted up at the back with three darker bands — joined by a tiny waist knot; six legs with little knee nubs, the feet flat on the sand; two elbowed antennae with club tips; two curved mandibles. Two white eyes with black pupils under heavy lids that slope together into a determined frown, and a small down-turned mouth. Facing RIGHT, drawn at 0.62 cells in game. Colours: blue-black slate — body #3e3d58, highlights #5d6588, legs #3a3952, mandibles #4b4a66 — with icy blue-white shine streaks. This one is inked in near-black (#15101a).

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## runner — cinderhound · 0.55c  (cell-enemy-runner.png → images/enemies/runner.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Cockroach: a cartoon cockroach, the lowest and longest shape in the cast: one long glossy oval of wing cases skimming the sand with a long cream shine streak along its back, a ringed belly showing below, a head shield with a cream front rim over a small round head tucked low at the front, two whip antennae longer than its whole body sweeping up and back, two tail prongs, and six splayed spiny legs. Sly V-shaped lids and a smirk. Facing RIGHT, drawn at 0.55 cells in game. Colours: glossy chestnut — wing cases #9a4a20, belly #733617, head shield #843f1b, legs #ab6531 (far legs #7c4321) — with a cream shine streak.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## slinger — bonecap · 0.6c  (cell-enemy-slinger.png → images/enemies/slinger.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Spitting Spider: a round, fuzzy cartoon jumping spider in three-quarter view: a big furry tan head with a darker mask across the eyes and cream cheek fur, and a round charcoal abdomen riding behind it like a backpack, with a bold orange arcing stripe and three cream spots; eight legs with high arched knees and pale bands, the front pair crossed in front of its face; two cream fuzzy palps like mittens and small teal jaws with little white fangs. Two ENORMOUS glossy black front eyes (one bigger than the other), two small side eyes and two dots on the crown, under white fur brows in a menacing V. A thin white silk line trails from its rear down to the sand. Facing RIGHT, drawn at 0.6 cells in game. Colours: head tan #9a7452, abdomen charcoal #4d4852 with an orange #ff8a2b stripe, legs #765945 with pale bands #cfb08a, jaws teal #2cb9a5.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## brute — snaggletusk · 0.85c  (cell-enemy-brute.png → images/enemies/brute.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Rhino Beetle: a heavy rhino beetle seen from the side, leaning forward like a wedge: a tall glossy domed shell at the back, a lower dome in front, and the head lowest at the front with ONE big thick horn sweeping forward and curling up and back to a point, plus a small second horn jutting forward off the front dome; six thick toothed legs. Orange eyes under heavy V-shaped lids and a flat clamped mouth. Built to hit a wall and keep going. Facing RIGHT, drawn at 0.85 cells in game. Colours: glossy mahogany — shell and horns #6c2c19, head #7a3520, legs #6c2e1a — with a strong peach shine band on the dome and up the horn; eyes #ffb347.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## bomber — blorp · 0.66c  (cell-enemy-bomber.png → images/enemies/bomber.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Bombardier Beetle: a nervous bombardier beetle in three-quarter side view: a glossy navy-blue shell dome with fine grooves and a blue-white shine, an orange head and middle, six orange legs and two beaded antennae. A too-wide clenched white grin, wide eyes with tiny darting pupils, worried eyebrows and a blue sweat drop behind its head — and cream puffs of stink smoke curling up out of its backside, with a hot yellow puff at the tail. It is about to go pop. Facing RIGHT, drawn at 0.66 cells in game. Colours: shell navy #2c3a6e, head and body orange #ff8a2b, legs #f47a22, smoke puffs cream, sweat drop #a9e4ff.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## bat — nibbler · 0.5c  (cell-enemy-bat.png → images/enemies/bat.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Housefly: a cartoon housefly: a broad grey hairy thorax with four stripes and black bristles along its outline, an olive-grey barrel abdomen with dark chequer patches, six thin dark legs dangling, and two clear veined wings held out in a V behind it. Its silver face sits between two HUGE cherry-red compound eyes with big dark pupils looking to the right — one eye bigger, one brow cocked and one scowling — with a lopsided smirk and a dangling tube mouth. Facing RIGHT, drawn at 0.5 cells in game. Colours: thorax grey #5b6072, abdomen olive-grey #7b7560, face silver #d9d4c4, eyes cherry red #e0362d; the wings clear with a faint warm tint — never pink or magenta.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## bulwark — marrowknight · 0.78c  (cell-enemy-bulwark.png → images/enemies/bulwark.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Roly-Poly: a roly-poly pill bug in three-quarter view: a tall half-dome of seven overlapping grey armour plates, every other plate a little darker, each with a light lip; many short legs rippling underneath; a small grey head peeking over the top front with two short elbowed antennae, smug flat eyelids and a small smirk. Held out on its RIGHT side, gripped by two front legs, is a red BOTTLE CAP used as a shield — crimped silver rim, a printed yellow ring and a cream star in the middle. That shield is how the player knows it is armoured in front: keep it big and clear. Facing RIGHT, drawn at 0.78 cells in game. Colours: plates grey #9aa3ad, head #7d8693, legs #b3adb5 (far legs #6e7782); bottle cap red #e5483b with a silver #d1d6dc rim, a yellow #ffc93c ring and a cream star.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## wyvern — skewer · 0.8c  (cell-enemy-wyvern.png → images/enemies/wyvern.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Hornet: an angry cartoon hornet in side view: a yellow abdomen angled down and back with three near-black bands, ending in a dark tip and a stinger with a cream glint; a fuzzy rust-brown thorax with a pinched dark waist; a yellow face under a dark rust helmet like a mask, elbowed black antennae and two dark toothed pincers held open. Four amber-tinted wings raised over its back; three yellow legs near, three darker far. Red eyes with lowered lids and hard angry V brows. Facing RIGHT, drawn at 0.8 cells in game. Colours: abdomen yellow #ffc21f with near-black bands, thorax and helmet rust-brown #8e3a22, eyes red, wings amber-tinted.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## bombardier — gloomcrow · 0.82c  (cell-enemy-bombardier.png → images/enemies/bombardier.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Bumblebee: a round, fuzzy cartoon bumblebee — one big golden fuzz-ball body with two curved black bands and a cream tail band, fuzz tufts all round its outline, and tiny clear wings on top beating flat out with little white effort arcs. A small dark head with knobbed antennae, pink cheeks, big dark eyes and a cream grin. Its black hind legs stick out to the sides with orange pollen baskets, and its two front legs hug a golden HONEY BOMB under its belly — a ball of honey with a faint honeycomb pattern, a wet shine and drips. Facing RIGHT, drawn at 0.82 cells in game. Colours: body gold #ffc42e with black bands and a cream tail band, honey bomb #ffb319, pollen baskets orange, cheeks soft pink.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## firebug — dustmoth · 0.9c  (cell-enemy-firebug.png → images/enemies/firebug.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Firefly: a cartoon firefly carrying fire: a dark plum body, dark wing cases raised in a V with yellow edges, smoky clear hind wings spread to the sides, and a salmon-red hood over its head with a black spot and a yellow rim; big dark eyes with huge pupils and sleepy, sly lids. Its tail is a glowing pale-lime lantern. Held out in its front legs on its RIGHT side is a glowing orange ember with a gold core and a few rising sparks; four more legs dangle. Facing RIGHT, drawn at 0.9 cells in game. Colours: body plum #40333c, wing-case edges yellow #ffd85c, hood salmon #f26c52, lantern pale lime #eaff8a with its green glow kept tight, ember orange #ff6d1f with a gold core.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## eel — sliverfin · 0.85c  (cell-enemy-eel.png → images/enemies/eel.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Water Tiger: a water tiger — a diving-beetle larva — swimming side-on: a long thin ribbon of twelve rings, pinched at every ring, with a dark saddle on the back of each ring and a cream belly, six short paddling legs and bristly tail prongs. A flat wedge head with a dark cap and two reddish-brown sickle jaws bowing out and hooking back in — they NEVER close, so its mouth is always open — with a crooked grin between them and lime eyes, the far eye peeking over the crown. Facing RIGHT, drawn at 0.85 cells in game. Colours: body ochre #d6b24c, saddles #735424, belly cream, jaws #8e4a22, eyes lime #b8e04a.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## shark — gnashfin · 1c  (cell-enemy-shark.png → images/enemies/shark.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Diving Beetle: a diving beetle swimming side-on: a rigid glossy olive oval shell with a bright yellow rim along its lower edge and around the tail, an olive head at the front with a small chin pincer, a dark belly, an air bubble at its tail, and two big amber oar legs plus two smaller paddles fringed with cream hairs. Amber eyes under a flat, determined brow. Stiff as a pebble — its body never bends. Facing RIGHT, drawn at 1 cells in game. Colours: shell olive #40602c with a yellow #ffc93c rim and a pale-green catch-light, oar legs amber, fringes cream.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## kraken — brinemaw · 1.25c  (cell-enemy-kraken.png → images/enemies/kraken.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Toe-Biter: a toe-biter — a giant water bug — swimming side-on: a big flat brown oval body tipped slightly so its back shows, folded wings with a pale leathery half and a dark tip, a segment-ticked rim, twin breathing tubes trailing at the tail, and a small pointed head with a beak. Two grabbing arms shaped like a "7" held up in front of its face, each ending in a dark hooked claw; four fringed paddle legs. A stalk arches up off its crown to hang a small glowing pale-green bulb in front of its face, like an angler fish. Pale yellow eyes with tiny pupils under a menacing brow. Facing RIGHT, drawn at 1.25 cells in game. Colours: body brown #9a5c28, wings pale leather with dark tips, lure pale green #b6ff8c with its glow kept tight, eyes pale yellow.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## seadrake — tidewyrm · 1.4c  (cell-enemy-seadrake.png → images/enemies/seadrake.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Dragonfly Nymph: a fat dragonfly nymph swimming side-on: a moss-green nine-ringed abdomen with a darker mottle on each ring, a pale belly and three tail spikes; two leaf-like wing pads lying back along its top; six long legs with the knees up; one big bulging amber dome eye. Folded under its face is a pale khaki hinged lower lip with a smile line — its hands on its chin — that can shoot forward with two dark hooks flung open. Facing RIGHT, drawn at 1.4 cells in game. Colours: body moss green #83a13f, the hinged lip khaki #bdbf6c, hooks dark brown #6a3f1c, eye amber #ffc94a.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## golem — thornwick · 1.45c  (cell-enemy-golem.png → images/enemies/golem.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Stag Beetle: the boss: a huge stag beetle in a near-frontal crest pose — a wide flat black-maroon head with a scowl built into its outline, a wide shield behind it and a bulging mahogany wing case behind that; giant rust-red antler mandibles rising above the head, spreading out and hooking back in at dark tips like a crown (one inner prong on the left antler, two on the right); six long dark spurred legs, comb-tipped antennae and a golden moustache of palps. Amber eyes with slit pupils under heavy angry brow ridges. Slow, patient and enormous. Facing RIGHT, drawn at 1.45 cells in game. Colours: head #422629, shield #62241f, wing case #8c2a1d, antlers rust-red #a8391f, legs #43292b, palps gold #e8a844, eyes amber #ffb428.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## ram — 1.15c  (cell-siege-ram.png → images/enemies/ram.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Pencil Ram: a red die-cast toy car driven by ants, with a popsicle-stick gantry over its roof from which a sharpened yellow pencil hangs on two rubber bands as a battering ram, point forward, an ant in an acorn-cap helmet riding it like a jouster. Facing RIGHT, 1.15 cells in game. Colours: car red #e5483b with a yellow #ffc93c racing stripe, pencil yellow with a sharpened cedar tip, popsicle sticks #efcd92, ants glossy black #342b31.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## ballista — 1.2c  (cell-siege-ballista.png → images/enemies/ballista.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Rubber-Band Crossbow: an ant-built crossbow on green bottle-cap wheels: a popsicle-stick carriage and stock, two popsicle-stick arms strung with a fat pink rubber band, a toothpick loaded in the groove, a corrugated-cardboard shield at the front, and an ant turning a brass wind-up key at the back. Facing RIGHT, 1.2 cells in game. Colours: popsicle sticks #efcd92, bottle caps green #43b649, rubber bands pink #ff5f8f, toothpicks #f3d6a6, cardboard #cf9f62, brass key #e2b447.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## catapult — 1.45c  (cell-siege-catapult.png → images/enemies/catapult.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Spoon Catapult: an ant-built catapult on yellow bottle-cap wheels: a stacked popsicle-stick frame, a pink plastic spoon as the throwing arm sprung by a wad of rubber bands, a kitchen sponge at the front as its stop, a cotton reel of thread at the tail, and pebbles on the deck. Facing RIGHT, 1.45 cells in game. Colours: spoon pink #ff6fae, bottle caps and bands yellow #ffc93c, popsicle sticks #efcd92, sponge #ffd23f with a green #3fa84a scourer, pebbles grey #9aa3ad.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## siegeTower — 1.05c  (cell-siege-siegeTower.png → images/enemies/siegeTower.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Juice-Box Tower: an orange juice box on red button wheels, with a red bottle cap on top as a fighting top holding two ant archers with toothpick bows, a striped bendy-straw flagpole with a red paper flag, and a cardboard ramp hinged at the top front. Facing RIGHT, 1.05 cells in game. Colours: carton orange #ff8a2b with a white top band and a green #43b649 wave, red #e5483b cap, buttons and flag, cardboard #cf9f62.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## trebuchet — 1.7c  (cell-siege-trebuchet.png → images/enemies/trebuchet.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Pencil Trebuchet: an ant-built trebuchet on red bottle-cap wheels: a popsicle-stick A-frame lashed with green rubber bands, a long yellow pencil as the throwing beam on a red pushpin pivot, a big pink eraser hanging from a paperclip as the counterweight, and a string sling with a pale cloth pouch. Facing RIGHT, 1.7 cells in game. Colours: popsicle sticks #efcd92, bottle caps red #e5483b, bands green #43b649, pencil yellow #ffc93c, eraser pink #ff8ea4, pouch #ffe08a.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## ironRam — 1.35c  (cell-siege-ironRam.png → images/enemies/ironRam.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: Tin-Can Ram: a soup tin lying on its side on a popsicle-stick sled with bottle-cap wheels, its can-opened lid bent up over the open mouth like a visor, a steel dinner fork sliding out of the mouth as the ram, and foam darts stuck uselessly to the tin — shiny cold TIN, never cardboard or plastic, because it is the only enemy foam darts cannot hurt. Facing RIGHT, 1.35 cells in game. Colours: tin #b7c0cb with bright specular bands, a torn red label #d8402f with a cream disc, fork steel #d3dae2, bottle caps dark grey #4a4f58.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## foam dart — round  (cell-projectile-bolt.png → images/rounds/bolt.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: foam dart: a toy foam dart in flight: a fat orange foam shaft, a blue rubber suction cup on the front, two little blue fins at the tail, pointing right. Must stay recognisable at a few pixels across in flight.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## toothpick — round  (cell-projectile-quarrel.png → images/rounds/quarrel.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: toothpick: a party toothpick fired by an ant-built rubber-band crossbow: thin pale wood, sharp at both ends, a red cellophane frill round the tail. It must not be mistakable for the foam dart, pointing right. Must stay recognisable at a few pixels across in flight.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## coin — shipped bitmap  (cell-ui-coin.png → images/props/coin_128x128.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: UI art: the coin. Keep it clean, flat and high-contrast — it is interface, not scenery — and do not restyle any lettering.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

---

## logo — splash  (cell-ui-logo.png → images/logo/logo_256x256.webp)

```text
Repaint this single game sprite.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour can
  be cut away cleanly; a near miss has to be flood-filled instead, and a flood
  fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle of
  any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· NOTHING may be see-through. Clear plastic, water tanks, glass and insect
  wings are painted as SOLID pale tints — pale icy blue, pale grey — even
  where the reference lets the magenta show through them. Anything the
  background shows through comes back pink, or with a hole in it.
· The object itself must contain no magenta, fuchsia or hot pink. A toy that
  IS pink — the piggy bank, the spoon catapult, a water balloon — is a soft,
  warm bubble-gum or salmon pink, clearly lighter and more orange than the
  background, never a purple-pink: nothing pinker than about #ffa8c8, and
  warmer is safer (#ff9aa8, #ffa99e). A stronger pink comes back half
  see-through and greyed, because the key takes it for background.

STYLE — a sunny, hand-drawn cartoon of a backyard summer day, like a page
from a children’s picture book or a hand-painted board game. The world is
a kid’s sandcastle in a sandbox, toy weapons stuck into it, and cartoon
garden bugs attacking it. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown (around
  #3b2a21, never pure black), with the line weight varying like a real brush
  pen — heavier on the outer silhouette, lighter inside. It should look drawn.
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

WHAT IT IS: UI art: the logo. Keep it clean, flat and high-contrast — it is interface, not scenery — and do not restyle any lettering.

Centre the object in the frame with a little clear space around it, and do not crop any part of it.

OUTPUT — read this twice, it is where every previous attempt failed:
· ONE image, exactly SQUARE (1:1), 512 x 512 pixels or larger.
  If your tool has an aspect-ratio control, set it to 1:1 / Square. Returns
  have twice come back at 1024x559, which is the tool default overriding
  this line — the setting wins, so change the setting.
· ONE object. Not two, not a comparison, not variants side by side, not a
  before-and-after pair. A single sprite, alone, filling the frame.
· No frame, border, card, label, caption, arrow, annotation or drop shadow.
```

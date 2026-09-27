# Scenery prompts — the landscape

Generated from `src/game/artSheet.ts` — do not hand-edit. Run `pnpm art:prompts`
(or export from the `/art-sheets` bench) after changing the manifest.

These are NOT on the 128 lattice and have no reference image. Attach the
finished BLOCK paintings named under each heading as style references,
so the landscape is painted by the same hand as the tower standing on it.

Drop results in `art-sheets/painted/`, named after the file in each
heading (e.g. `bg-mountains-far.png`), then run `pnpm slice-sheets`.

Copy only the fenced block. The `##` heading is for you, not the model: it
names the image the block belongs to (the reference to attach, and the name
to save the return under) and, after the arrow, where the slice lands under
`public/`. `pnpm art:desk` finds any block by sprite name, copies reference
and prompt in one go, and files, slices and compresses the return.

## sun  (bg-sun.png → images/bg/sun.webp)

Attach, in this order: `public/images/blocks/wood.webp`, `public/images/blocks/cannon.webp`

```text
Paint one background element for a sunny backyard tower-defence game: a kid’s sandcastle in a sandbox, defended with toys against garden bugs.

THE ATTACHED IMAGES ARE FINISH REFERENCES ONLY — finished paintings of two
blocks from this same game. Paint this in exactly their hand: the same warm
brown ink and its weight, the same colour, the same texture in the fills.
They show HOW to paint, never WHAT: no sand cube, plastic band, stud or
anything else from them may appear in this picture, and nothing about their
square shape applies to it.

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

WHAT IT IS: The sun, drawn the way a child draws one: a round yellow disc with a warm orange edge and a happy face — closed, smiling eyes, a smile and rosy cheeks — ringed by twelve round-tipped rays, alternately long and short, in sunshine yellow with an orange edge. The disc is a little under half the width of the frame and the ray tips reach nearly to its edges, with pure magenta #FF00FF everywhere around it. It sits high in a bright summer sky, so it wants to feel friendly and golden rather than blinding. No glow or bloom around it — the game paints the sky wash itself.

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

One object, centred in the frame.

OUTPUT: exactly 512 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## moon  (bg-moon.png → images/bg/moon.webp)

Attach, in this order: `public/images/blocks/wood.webp`, `public/images/blocks/cannon.webp`

```text
Paint one background element for a sunny backyard tower-defence game: a kid’s sandcastle in a sandbox, defended with toys against garden bugs.

THE ATTACHED IMAGES ARE FINISH REFERENCES ONLY — finished paintings of two
blocks from this same game. Paint this in exactly their hand: the same warm
brown ink and its weight, the same colour, the same texture in the fills.
They show HOW to paint, never WHAT: no sand cube, plastic band, stud or
anything else from them may appear in this picture, and nothing about their
square shape applies to it.

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

WHAT IT IS: The moon: a round cream disc with a soft lavender crescent of shade along its right side, three soft craters, and a peaceful sleeping face — closed eyes and pink cheeks. No rays. It shares the sun’s size, a little under half the width of the frame, with pure magenta #FF00FF around it. Calm and friendly. Keep any halo tight to the rim — a wide glow blends into the background and has to be reconstructed.

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

One object, centred in the frame.

OUTPUT: exactly 512 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## conifer  (bg-conifer.png → images/bg/conifer.webp)

Attach, in this order: `public/images/blocks/wood.webp`, `public/images/blocks/cannon.webp`

```text
Paint one background element for a sunny backyard tower-defence game: a kid’s sandcastle in a sandbox, defended with toys against garden bugs.

THE ATTACHED IMAGES ARE FINISH REFERENCES ONLY — finished paintings of two
blocks from this same game. Paint this in exactly their hand: the same warm
brown ink and its weight, the same colour, the same texture in the fills.
They show HOW to paint, never WHAT: no sand cube, plastic band, stud or
anything else from them may appear in this picture, and nothing about their
square shape applies to it.

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

WHAT IT IS: A single tall SUNFLOWER, whole and upright from the ground to the flower head: a sturdy green stem, two broad leaves, and a big head of bright yellow star-shaped petals round a brown seed centre with an orange ring. Pure magenta #FF00FF everywhere around it. It stands in the flower bed in front of the picket fence at only about 5–9% of the screen height, repeated along the bed — so the SILHOUETTE has to carry it: bold petals and leaves, no fine detail.

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

One object, centred in the frame.

OUTPUT: exactly 384 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## broadleaf  (bg-broadleaf.png → images/bg/broadleaf.webp)

Attach, in this order: `public/images/blocks/wood.webp`, `public/images/blocks/cannon.webp`

```text
Paint one background element for a sunny backyard tower-defence game: a kid’s sandcastle in a sandbox, defended with toys against garden bugs.

THE ATTACHED IMAGES ARE FINISH REFERENCES ONLY — finished paintings of two
blocks from this same game. Paint this in exactly their hand: the same warm
brown ink and its weight, the same colour, the same texture in the fills.
They show HOW to paint, never WHAT: no sand cube, plastic band, stud or
anything else from them may appear in this picture, and nothing about their
square shape applies to it.

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

WHAT IT IS: A single low clump of garden flowers, whole, standing on the ground: three or four TULIP cups in red, yellow and pink on short green stems among broad tulip leaves, with a couple of small white daisies at the front. Pure magenta #FF00FF everywhere around it. It stands in the same bed as the tall sunflower at only about 3–5% of the screen height, so it must stay LOW and ROUND and never read as the tall flower at distance.

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

One object, centred in the frame.

OUTPUT: exactly 384 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## mountains-far  (bg-mountains-far.png → images/bg/mountains-far.webp)

Attach, in this order: `public/images/blocks/wood.webp`, `public/images/blocks/cannon.webp`

```text
Paint one background element for a sunny backyard tower-defence game: a kid’s sandcastle in a sandbox, defended with toys against garden bugs.

THE ATTACHED IMAGES ARE FINISH REFERENCES ONLY — finished paintings of two
blocks from this same game. Paint this in exactly their hand: the same warm
brown ink and its weight, the same colour, the same texture in the fills.
They show HOW to paint, never WHAT: no sand cube, plastic band, stud or
anything else from them may appear in this picture, and nothing about their
square shape applies to it.

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

WHAT IT IS: The FAR layer of a suburban backyard: a row of neighbours’ houses seen over the garden — cream, pale-blue, butter-yellow and peach walls; terracotta, slate-blue and red roofs, some gabled with a little round attic window and some hipped; chimneys; white-framed upper windows — with round garden trees and a few tall poplars between them and a soft strip of treetops behind. Solid magenta sky above the rooftops and treetops, opaque artwork below. It is the most distant thing in the scene, so keep it soft and hazy, pulled toward a pale summer-sky blue, and low in contrast: detail here competes with the tower. The near garden is drawn over the bottom of this band. No writing, signs or numbers anywhere — the game mirrors every other copy.

BACKGROUND — read this before anything else.
Everything ABOVE the ridge line is sky, and it must be solid, flat, pure
magenta #FF00FF — a green-screen colour, keyed out automatically.
NOT transparent: transparency gets exported as a grey-and-white
CHECKERBOARD and then baked in as though the squares were paint. NOT
white, NOT pale blue, NOT a paper texture, and no gradient or haze in it.
BELOW the ridge the artwork is fully opaque, right down to the bottom
edge — do not fade it out, the ground is drawn over it.

SEAMLESSLY TILEABLE, HORIZONTALLY. This image is repeated end to end across
a landscape wider than the screen. The right edge must join the left edge
with no visible seam, no matching feature straddling the join, and no
vignette or fade at either side. It does NOT need to tile vertically.

OUTPUT: exactly 1536 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## mountains-near  (bg-mountains-near.png → images/bg/mountains-near.webp)

Attach, in this order: `public/images/blocks/wood.webp`, `public/images/blocks/cannon.webp`

```text
Paint one background element for a sunny backyard tower-defence game: a kid’s sandcastle in a sandbox, defended with toys against garden bugs.

THE ATTACHED IMAGES ARE FINISH REFERENCES ONLY — finished paintings of two
blocks from this same game. Paint this in exactly their hand: the same warm
brown ink and its weight, the same colour, the same texture in the fills.
They show HOW to paint, never WHAT: no sand cube, plastic band, stud or
anything else from them may appear in this picture, and nothing about their
square shape applies to it.

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

WHAT IT IS: The NEAR layer of the backyard: big round leafy garden trees standing behind a neatly clipped green hedge; in one or two places a washing line strung between two poles with toy-coloured T-shirts, towels and socks pegged on it; and a white wooden PICKET FENCE running right across the front along the bottom of the band — pointed pickets, two rails, a capped post every eighth picket — filling roughly the bottom third. Solid magenta sky above the treetops and poles, opaque artwork below. EVERY treetop stops well short of the top edge: the top fifth of the image is empty magenta sky from side to side, with no leaf, branch or pole reaching into it — a tree that touches the top edge is cut off flat along the top of the band in the game. Richer and closer than the far layer, but still background: it sits behind the tower and must not compete with it. No writing anywhere — the game mirrors every other copy.

BACKGROUND — read this before anything else.
Everything ABOVE the ridge line is sky, and it must be solid, flat, pure
magenta #FF00FF — a green-screen colour, keyed out automatically.
NOT transparent: transparency gets exported as a grey-and-white
CHECKERBOARD and then baked in as though the squares were paint. NOT
white, NOT pale blue, NOT a paper texture, and no gradient or haze in it.
BELOW the ridge the artwork is fully opaque, right down to the bottom
edge — do not fade it out, the ground is drawn over it.

SEAMLESSLY TILEABLE, HORIZONTALLY. This image is repeated end to end across
a landscape wider than the screen. The right edge must join the left edge
with no visible seam, no matching feature straddling the join, and no
vignette or fade at either side. It does NOT need to tile vertically.

OUTPUT: exactly 1536 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## grass  (bg-grass.png → images/bg/grass.webp)

Attach, in this order: `public/images/blocks/wood.webp`, `public/images/blocks/cannon.webp`

```text
Paint one background element for a sunny backyard tower-defence game: a kid’s sandcastle in a sandbox, defended with toys against garden bugs.

THE ATTACHED IMAGES ARE FINISH REFERENCES ONLY — finished paintings of two
blocks from this same game. Paint this in exactly their hand: the same warm
brown ink and its weight, the same colour, the same texture in the fills.
They show HOW to paint, never WHAT: no sand cube, plastic band, stud or
anything else from them may appear in this picture, and nothing about their
square shape applies to it.

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

WHAT IT IS: The SAND of the sandbox, which the bugs walk across: a long, LOW band of warm pale sand seen slightly from above, light at the top and a little deeper and warmer toward the bottom (around #f6e2ae down to #e0bb7a), with soft wind ripples, fine grain speckle, the odd small pebble and a scallop shell or two. Fully opaque, top to bottom. On screen it is only about half a cell tall, so keep the detail broad — single grains disappear. Units walk ON it, and busy sand makes a walking bug hard to see, so keep it calm. No toys, no plank edge and no water — the game draws those on top.

BACKGROUND: none. This band is FULLY OPAQUE from its top edge to its bottom
edge and from side to side. No transparency, no checkerboard, no magenta.

SEAMLESSLY TILEABLE, HORIZONTALLY. This image is repeated end to end across
a landscape wider than the screen. The right edge must join the left edge
with no visible seam, no matching feature straddling the join, and no
vignette or fade at either side. It does NOT need to tile vertically.

OUTPUT: exactly 1024 x 128 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## water  (bg-water.png → images/bg/water.webp)

Attach, in this order: `public/images/blocks/wood.webp`, `public/images/blocks/cannon.webp`

```text
Paint one background element for a sunny backyard tower-defence game: a kid’s sandcastle in a sandbox, defended with toys against garden bugs.

THE ATTACHED IMAGES ARE FINISH REFERENCES ONLY — finished paintings of two
blocks from this same game. Paint this in exactly their hand: the same warm
brown ink and its weight, the same colour, the same texture in the fills.
They show HOW to paint, never WHAT: no sand cube, plastic band, stud or
anything else from them may appear in this picture, and nothing about their
square shape applies to it.

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

WHAT IT IS: The paddling-pool moat in front of the sandcastle: clear, bright, shallow-looking water, pale minty aqua at the top edge deepening to turquoise and then to a strong pool blue at the bottom (around #b7e6cf → #34b3d1 → #1f86b0), with a few soft horizontal ripple bands. Fully opaque. The game draws the wet-sand bank, the waterline, the glints and a mirrored reflection of the tower on top of this, so keep the surface quiet — no strong highlights, no foam, no objects, nothing floating. It is a CROP of a larger surface, not a picture of a pool: no outline, rim, edge line, border or rounded corner anywhere — the water runs straight off all four edges, and one bank line along the top is the game’s job. (The first return came back as a rounded pool with an ink rim, which draws a dark seam every time the band repeats.)

BACKGROUND: none. This band is FULLY OPAQUE from its top edge to its bottom
edge and from side to side. No transparency, no checkerboard, no magenta.

SEAMLESSLY TILEABLE, HORIZONTALLY. This image is repeated end to end across
a landscape wider than the screen. The right edge must join the left edge
with no visible seam, no matching feature straddling the join, and no
vignette or fade at either side. It does NOT need to tile vertically.

OUTPUT: exactly 1024 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## roof  (bg-roof.png → images/bg/roof.webp)

Attach, in this order: `public/images/blocks/wood.webp`, `public/images/blocks/cannon.webp`

```text
Paint one background element for a sunny backyard tower-defence game: a kid’s sandcastle in a sandbox, defended with toys against garden bugs.

THE ATTACHED IMAGES ARE FINISH REFERENCES ONLY — finished paintings of two
blocks from this same game. Paint this in exactly their hand: the same warm
brown ink and its weight, the same colour, the same texture in the fills.
They show HOW to paint, never WHAT: no sand cube, plastic band, stud or
anything else from them may appear in this picture, and nothing about their
square shape applies to it.

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

WHAT IT IS: A red toy sand BUCKET turned UPSIDE DOWN and used as a turret cap, seen straight on from the front: its bottom — now its top — is a sandcastle mould with three square merlons; the tapered red plastic body has a moulded rib, a small arched window in relief and a white gloss stripe down its left side; and its wide rolled rim, with a little handle lug on each side, runs along the very bottom of the image. The rim is the widest part: it touches the left and right edges, the rim’s straight underside IS the bottom edge of the image, and the merlon tops touch the top edge. Nothing hangs below the rim — no handle, no shadow, no block, no sand. Glossy toy-red plastic (around #ff7b68 lit, #e5483b body, #a9261c shade). It is the ONLY red thing in the tower, deliberately, because it marks a block nothing can be built on top of.

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

FILL THE FRAME — the rule this asset lives or dies on.
The artwork must reach ALL FOUR EDGES of the image: left, right, top and
bottom. No margin, no padding, no breathing room, not even a few pixels.
Nothing is cropped or re-centred on the way back in, so a subject painted
small inside its frame is shipped small with the empty border baked in,
and it appears in the game as a shrunken version of itself surrounded by
dead space. Let the artwork run off every edge rather than leave a border.

OUTPUT: exactly 768 x 432 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## icon-wood  (icon-wood.png → images/icons/wood.webp)

Attach, in this order: `public/images/blocks/wood.webp`, `public/images/blocks/cannon.webp`

```text
Paint one background element for a sunny backyard tower-defence game: a kid’s sandcastle in a sandbox, defended with toys against garden bugs.

THE ATTACHED IMAGES ARE FINISH REFERENCES ONLY — finished paintings of two
blocks from this same game. Paint this in exactly their hand: the same warm
brown ink and its weight, the same colour, the same texture in the fills.
They show HOW to paint, never WHAT: no sand cube, plastic band, stud or
anything else from them may appear in this picture, and nothing about their
square shape applies to it.

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

WHAT IT IS: The SAND resource icon: a small heap of warm golden sand with a toy spade stuck into it at an angle — blue handle, light-blue grip, the yellow blade half-buried — and a few loose grains. It sits in the HUD bar at about 26 px, so it must read instantly at thumbnail size — bold shapes, strong silhouette, no fine detail.

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

One object, centred in the frame.

OUTPUT: exactly 512 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## icon-stone  (icon-stone.png → images/icons/stone.webp)

Attach, in this order: `public/images/blocks/wood.webp`, `public/images/blocks/cannon.webp`

```text
Paint one background element for a sunny backyard tower-defence game: a kid’s sandcastle in a sandbox, defended with toys against garden bugs.

THE ATTACHED IMAGES ARE FINISH REFERENCES ONLY — finished paintings of two
blocks from this same game. Paint this in exactly their hand: the same warm
brown ink and its weight, the same colour, the same texture in the fills.
They show HOW to paint, never WHAT: no sand cube, plastic band, stud or
anything else from them may appear in this picture, and nothing about their
square shape applies to it.

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

WHAT IT IS: The PEBBLES resource icon: three smooth, rounded grey-blue pebbles in a little pile, each with a soft highlight at its upper left. Read at about 26 px in the HUD bar, so keep it to bold shapes with a strong silhouette and no fine detail. It must not be mistakable for the sand icon at a glance.

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

One object, centred in the frame.

OUTPUT: exactly 512 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## icon-gold  (icon-gold.png → images/icons/gold.webp)

Attach, in this order: `public/images/blocks/wood.webp`, `public/images/blocks/cannon.webp`

```text
Paint one background element for a sunny backyard tower-defence game: a kid’s sandcastle in a sandbox, defended with toys against garden bugs.

THE ATTACHED IMAGES ARE FINISH REFERENCES ONLY — finished paintings of two
blocks from this same game. Paint this in exactly their hand: the same warm
brown ink and its weight, the same colour, the same texture in the fills.
They show HOW to paint, never WHAT: no sand cube, plastic band, stud or
anything else from them may appear in this picture, and nothing about their
square shape applies to it.

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

WHAT IT IS: The GOLD resource icon: a shiny gold INGOT — a single trapezoid bar of metal — with two small gold nuggets tucked behind it, in warm, bright gold with a strong highlight. Read at about 26 px in the HUD bar — bold shape, strong silhouette, no fine detail. It is the premium resource, so it should be the brightest and most eye-catching of the three. NOT a coin: coins are a different currency with their own icon. NOT a sandcastle, a sand pile or a block either — the first return was a little sandcastle, which is another icon’s job.

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

One object, centred in the frame.

OUTPUT: exactly 512 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## ribbon  (bg-ribbon.png → images/bg/ribbon.webp)

Attach, in this order: `public/images/blocks/wood.webp`, `public/images/blocks/cannon.webp`

```text
Paint one background element for a sunny backyard tower-defence game: a kid’s sandcastle in a sandbox, defended with toys against garden bugs.

THE ATTACHED IMAGES ARE FINISH REFERENCES ONLY — finished paintings of two
blocks from this same game. Paint this in exactly their hand: the same warm
brown ink and its weight, the same colour, the same texture in the fills.
They show HOW to paint, never WHAT: no sand cube, plastic band, stud or
anything else from them may appear in this picture, and nothing about their
square shape applies to it.

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

WHAT IT IS: The result screen TITLE BANNER: one long, flat, horizontal ribbon of glossy RED toy plastic seen straight on, with a sunshine-yellow rim around the band and a small folded tail at each end in a deeper red. SHAPE IS THE WHOLE JOB HERE — it is WIDE AND SHALLOW, a 5:1 band rather than a scroll, and it must use the entire frame: the left tail touches the left edge, the right tail touches the right edge, and the tallest part of the ribbon touches the top and the bottom edge. Leave no magenta margin on any side — a banner painted small inside the frame arrives on screen as a small banner with dead space around it, which is the exact fault this asset replaces. The middle 70% of the width is the WRITING PANEL: flat, straight, parallel top and bottom edges, at least 80% of the frame height, and VERTICALLY CENTRED — the game prints its title across it in white letters with a dark outline, so keep that panel an even, quiet, uncluttered red with one soft gloss along the top. Do not write anything on it: no words, no letters, no numerals, no monogram, no icon, no ornament in the centre. The ends carry ONE shallow fold each and nothing more — no deep curls, no rolled ends, no ribbon looping behind itself, no swallowtail notch deeper than a fifth of the width. Nothing may sit above or below the band: no pole, no cords, no tassels, no rings, no shadow and no ground. Every pixel of height that is not ribbon is height the result screen loses.

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

FILL THE FRAME — the rule this asset lives or dies on.
The artwork must reach ALL FOUR EDGES of the image: left, right, top and
bottom. No margin, no padding, no breathing room, not even a few pixels.
Nothing is cropped or re-centred on the way back in, so a subject painted
small inside its frame is shipped small with the empty border baked in,
and it appears in the game as a shrunken version of itself surrounded by
dead space. Let the artwork run off every edge rather than leave a border.

OUTPUT: exactly 1280 x 256 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## icon-chest  (icon-chest.png → images/icons/chest.webp)

Attach, in this order: `public/images/blocks/wood.webp`, `public/images/blocks/cannon.webp`

```text
Paint one background element for a sunny backyard tower-defence game: a kid’s sandcastle in a sandbox, defended with toys against garden bugs.

THE ATTACHED IMAGES ARE FINISH REFERENCES ONLY — finished paintings of two
blocks from this same game. Paint this in exactly their hand: the same warm
brown ink and its weight, the same colour, the same texture in the fills.
They show HOW to paint, never WHAT: no sand cube, plastic band, stud or
anything else from them may appear in this picture, and nothing about their
square shape applies to it.

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

WHAT IT IS: The daily TREASURE CHEST icon — the pirate treasure a kid dreams of digging up in the sandbox: a small, sturdy, CLOSED wooden chest seen straight on from the front — a domed lid, two dark bands running across the body, and a gold lock plate with a keyhole centred on the front. Warm wood browns, dark bands, one bright gold accent. It sits in the HUD at about 50 px and is the thing a player taps for their free coins, so it should look inviting and full: bold shapes, strong silhouette, no fine detail. The lid stays SHUT — the game plays the opening itself. Keep it ONE compact closed shape, with no dangling straps, no key, no spilled coins, no sand, no ground and no shadow beneath it: a cooldown shade is masked to this silhouette, so anything detached from the body becomes a floating fleck. It must not be mistakable for the gold resource icon at a glance — that one is the gold, this one is the box it came in.

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

One object, centred in the frame.

OUTPUT: exactly 512 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## prop-chest-wing  (prop-chest-wing.png → images/props/chest-wing.webp)

Attach, in this order: `public/images/blocks/wood.webp`, `public/images/blocks/cannon.webp`

```text
Paint ONE game sprite — a single wing — for a sunny backyard tower-defence game. Attach `images/icons/chest.webp` with this prompt: the wing belongs to that chest and has to look painted by the same hand.

THE ATTACHED IMAGES ARE FINISH REFERENCES ONLY — finished paintings of two
blocks from this same game. Paint this in exactly their hand: the same warm
brown ink and its weight, the same colour, the same texture in the fills.
They show HOW to paint, never WHAT: no sand cube, plastic band, stud or
anything else from them may appear in this picture, and nothing about their
square shape applies to it.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

WHAT IT IS: The WING of a flying treasure chest — ONE feathered bird wing, spread wide as if in the middle of a wingbeat. Soft layered feathers: small rounded coverts near the root, long flight feathers fanning out along the trailing edge. Warm cream-white feathers with a soft grey-brown shadow side, and the tips of the long flight feathers edged in the same warm GOLD as the chest’s lock plate, so the wing and the chest read as one magical object. The same hand-inked warm-brown contour as the chest, with a strong ink line all the way round the outside — the feathers are pale, and that line is what separates them from the background. It is drawn small in game, about the height of the chest itself, so keep it to bold overlapping feather shapes rather than fine barbs. No chest, no body, no bird, no arm bone sticking out, no glow, no sparkles, no motion lines.

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

PLACEMENT IS THE CONTRACT — the game flaps this wing by ROTATING it about
its root, so the root has to be exactly where this says, and the wing
must not be centred.
· The ROOT of the wing — the shoulder, where it meets the chest — sits 12%
  of the way in from the LEFT edge and 70% of the way down from the TOP.
  Make it a compact rounded root of small covert feathers, as if it comes
  out of the chest’s side.
· From the root the wing spreads out to the RIGHT and UP: its leading edge
  rises at about 25° above horizontal, the longest flight feathers reach
  about 94% of the way to the right edge, and the top of the wing comes
  within about 8% of the top edge.
· NOTHING of the wing lies to the LEFT of the root, and nothing hangs
  below about 88% of the height — the trailing feathers sweep back and
  down to the right, not down past the root.
· It is the RIGHT wing. Do not mirror it and do not paint a pair: the game
  mirrors this one for the other side.

OUTPUT: exactly 512 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

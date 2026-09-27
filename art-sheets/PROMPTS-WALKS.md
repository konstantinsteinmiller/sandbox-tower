# Walk-cycle prompts — one monster design per generation

Generated from `src/game/artSheet.ts` — do not hand-edit. Run `pnpm art:prompts`
(or export from the `/art-sheets` bench) after changing the manifest.

Attach the reference named in each heading — `walk-<id>.png` for a cycle,
`siege-<id>.png` and `arm-<id>.png` for an engine, `hull-<id>.png` for a
ship, `fixture-<id>.png` for a weapon — and paste the block beside it. A
merged tier (`fixture-cannon-t2.png`) also wants the plain painting
(`public/images/fixtures/cannon.webp`) attached: it is the design.
Most of these are a grid of panels showing ONE subject through ONE cycle,
and the whole job is that it comes back as one subject and not eight.

Drop results in `art-sheets/painted/`, keeping the `walk-<id>` in the name,
then run `pnpm slice-sheets`. The slicer cuts the grid by proportion, so an
off-size return is fine as long as the panels are where the grid says.

Copy only the fenced block. The `##` heading is for you, not the model: it
names the image the block belongs to (the reference to attach, and the name
to save the return under) and, after the arrow, where the slice lands under
`public/`. `pnpm art:desk` finds any block by sprite name, copies reference
and prompt in one go, and files, slices and compresses the return.

## grumpling — Black Ant  (walk-grumpling.png → images/monsters/grumpling.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE ABOVE EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one stands at the BOTTOM of a tall panel with open magenta above it.
  That band stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces LEFT, in side view. Keep that direction in all 8 panels.

WHAT IT IS: Black Ant — a cartoon black ant seen from the side: three glossy beads — a big round head at the front, a small humped thorax and a fat egg-shaped abdomen tilted up at the back with three darker bands — joined by a tiny waist knot; six legs with little knee nubs, the feet flat on the sand; two elbowed antennae with club tips; two curved mandibles. Two white eyes with black pupils under heavy lids that slope together into a determined frown, and a small down-turned mouth.

Colours: blue-black slate — body #3e3d58, highlights #5d6588, legs #3a3952, mandibles #4b4a66 — with icy blue-white shine streaks. This one is inked in near-black (#15101a).

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## bonecap — Spitting Spider  (walk-bonecap.png → images/monsters/bonecap.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE ABOVE EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one stands at the BOTTOM of a tall panel with open magenta above it.
  That band stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces RIGHT, turned three-quarters toward the viewer. Keep that direction in all 8 panels.

WHAT IT IS: Spitting Spider — a round, fuzzy cartoon jumping spider in three-quarter view: a big furry tan head with a darker mask across the eyes and cream cheek fur, and a round charcoal abdomen riding behind it like a backpack, with a bold orange arcing stripe and three cream spots; eight legs with high arched knees and pale bands, the front pair crossed in front of its face; two cream fuzzy palps like mittens and small teal jaws with little white fangs. Two ENORMOUS glossy black front eyes (one bigger than the other), two small side eyes and two dots on the crown, under white fur brows in a menacing V. A thin white silk line trails from its rear down to the sand.

Colours: head tan #9a7452, abdomen charcoal #4d4852 with an orange #ff8a2b stripe, legs #765945 with pale bands #cfb08a, jaws teal #2cb9a5.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## snaggletusk — Rhino Beetle  (walk-snaggletusk.png → images/monsters/snaggletusk.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE ABOVE EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one stands at the BOTTOM of a tall panel with open magenta above it.
  That band stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces LEFT, in side view. Keep that direction in all 8 panels.

WHAT IT IS: Rhino Beetle — a heavy rhino beetle seen from the side, leaning forward like a wedge: a tall glossy domed shell at the back, a lower dome in front, and the head lowest at the front with ONE big thick horn sweeping forward and curling up and back to a point, plus a small second horn jutting forward off the front dome; six thick toothed legs. Orange eyes under heavy V-shaped lids and a flat clamped mouth. Built to hit a wall and keep going.

Colours: glossy mahogany — shell and horns #6c2c19, head #7a3520, legs #6c2e1a — with a strong peach shine band on the dome and up the horn; eyes #ffb347.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## wispling — Mosquito  (walk-wispling.png → images/monsters/wispling.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE ABOVE EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one stands at the BOTTOM of a tall panel with open magenta above it.
  That band stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces RIGHT, in side profile. Keep that direction in all 8 panels.

WHAT IT IS: Mosquito — a lanky cartoon mosquito in side profile: a small humped thorax with a cream stripe, a long abdomen angled down and back with five cream bands and a swollen rosy tip; six very long legs with cream-banded joints, the hind pair curled up high — the legs are half its silhouette; two narrow clear wings raised over its back, feathery antennae, and a long straight needle aimed low and forward with a white glint at the tip. Lime-green eyes under heavy lids.

Colours: body purple #6d3f86, bands cream #f7eed8, eyes lime #c4ee3a, the needle mauve with a white tip.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## marrowknight — Roly-Poly  (walk-marrowknight.png → images/monsters/marrowknight.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE ABOVE EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one stands at the BOTTOM of a tall panel with open magenta above it.
  That band stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces RIGHT, turned three-quarters toward the viewer, the shield held out on the right. Keep that direction in all 8 panels.

WHAT IT IS: Roly-Poly — a roly-poly pill bug in three-quarter view: a tall half-dome of seven overlapping grey armour plates, every other plate a little darker, each with a light lip; many short legs rippling underneath; a small grey head peeking over the top front with two short elbowed antennae, smug flat eyelids and a small smirk. Held out on its RIGHT side, gripped by two front legs, is a red BOTTLE CAP used as a shield — crimped silver rim, a printed yellow ring and a cream star in the middle. That shield is how the player knows it is armoured in front: keep it big and clear.

Colours: plates grey #9aa3ad, head #7d8693, legs #b3adb5 (far legs #6e7782); bottle cap red #e5483b with a silver #d1d6dc rim, a yellow #ffc93c ring and a cream star.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## nibbler — Housefly  (walk-nibbler.png → images/monsters/nibbler.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE ABOVE EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one stands at the BOTTOM of a tall panel with open magenta above it.
  That band stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces the viewer, its eyes looking to the RIGHT. Keep that direction in all 8 panels.

WHAT IT IS: Housefly — a cartoon housefly: a broad grey hairy thorax with four stripes and black bristles along its outline, an olive-grey barrel abdomen with dark chequer patches, six thin dark legs dangling, and two clear veined wings held out in a V behind it. Its silver face sits between two HUGE cherry-red compound eyes with big dark pupils looking to the right — one eye bigger, one brow cocked and one scowling — with a lopsided smirk and a dangling tube mouth.

Colours: thorax grey #5b6072, abdomen olive-grey #7b7560, face silver #d9d4c4, eyes cherry red #e0362d; the wings clear with a faint warm tint — never pink or magenta.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## cinderhound — Cockroach  (walk-cinderhound.png → images/monsters/cinderhound.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE ABOVE EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one stands at the BOTTOM of a tall panel with open magenta above it.
  That band stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces LEFT, in side view. Keep that direction in all 8 panels.

WHAT IT IS: Cockroach — a cartoon cockroach, the lowest and longest shape in the cast: one long glossy oval of wing cases skimming the sand with a long cream shine streak along its back, a ringed belly showing below, a head shield with a cream front rim over a small round head tucked low at the front, two whip antennae longer than its whole body sweeping up and back, two tail prongs, and six splayed spiny legs. Sly V-shaped lids and a smirk.

Colours: glossy chestnut — wing cases #9a4a20, belly #733617, head shield #843f1b, legs #ab6531 (far legs #7c4321) — with a cream shine streak.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## blorp — Bombardier Beetle  (walk-blorp.png → images/monsters/blorp.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE ABOVE EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one stands at the BOTTOM of a tall panel with open magenta above it.
  That band stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces RIGHT (head at the right, tail at the left), in three-quarter side view. Keep that direction in all 8 panels.

WHAT IT IS: Bombardier Beetle — a nervous bombardier beetle in three-quarter side view: a glossy navy-blue shell dome with fine grooves and a blue-white shine, an orange head and middle, six orange legs and two beaded antennae. A too-wide clenched white grin, wide eyes with tiny darting pupils, worried eyebrows and a blue sweat drop behind its head — and cream puffs of stink smoke curling up out of its backside, with a hot yellow puff at the tail. It is about to go pop.

Colours: shell navy #2c3a6e, head and body orange #ff8a2b, legs #f47a22, smoke puffs cream, sweat drop #a9e4ff.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## thornwick — Stag Beetle  (walk-thornwick.png → images/monsters/thornwick.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE ABOVE EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one stands at the BOTTOM of a tall panel with open magenta above it.
  That band stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces the viewer, in a near-frontal crest pose. Keep that direction in all 8 panels.

WHAT IT IS: Stag Beetle — the boss: a huge stag beetle in a near-frontal crest pose — a wide flat black-maroon head with a scowl built into its outline, a wide shield behind it and a bulging mahogany wing case behind that; giant rust-red antler mandibles rising above the head, spreading out and hooking back in at dark tips like a crown (one inner prong on the left antler, two on the right); six long dark spurred legs, comb-tipped antennae and a golden moustache of palps. Amber eyes with slit pupils under heavy angry brow ridges. Slow, patient and enormous.

READ THE PANELS: Its eyes are half shut in panel 8 only — a blink. Keep that.

Colours: head #422629, shield #62241f, wing case #8c2a1d, antlers rust-red #a8391f, legs #43292b, palps gold #e8a844, eyes amber #ffb428.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## rattlejack — Red Ant  (walk-rattlejack.png → images/monsters/rattlejack.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE ABOVE EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one stands at the BOTTOM of a tall panel with open magenta above it.
  That band stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces LEFT, in side view. Keep that direction in all 8 panels.

WHAT IT IS: Red Ant — a lean red fire ant, reared up on its four back legs, seen from the side: its front pair are raised as arms holding a big grey speckled pebble — about the size of its head — up over its head, and that pebble is its silhouette tell. A double waist knot, a longer banded abdomen with a darker tip, mandibles, yellow eyes under V-shaped lids with the front eye squinting harder, and a lopsided grin.

Colours: fire-ant red — body #dd4b2b, abdomen #b93822, legs #cf4a2a, mandibles #a8321c; eyes #ffcf3f; the pebble grey #9aa3ad.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## dustmoth — Firefly  (walk-dustmoth.png → images/monsters/dustmoth.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE ABOVE EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one stands at the BOTTOM of a tall panel with open magenta above it.
  That band stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces the viewer, the ember held out on the RIGHT. Keep that direction in all 8 panels.

WHAT IT IS: Firefly — a cartoon firefly carrying fire: a dark plum body, dark wing cases raised in a V with yellow edges, smoky clear hind wings spread to the sides, and a salmon-red hood over its head with a black spot and a yellow rim; big dark eyes with huge pupils and sleepy, sly lids. Its tail is a glowing pale-lime lantern. Held out in its front legs on its RIGHT side is a glowing orange ember with a gold core and a few rising sparks; four more legs dangle.

Colours: body plum #40333c, wing-case edges yellow #ffd85c, hood salmon #f26c52, lantern pale lime #eaff8a with its green glow kept tight, ember orange #ff6d1f with a gold core.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## skewer — Hornet  (walk-skewer.png → images/monsters/skewer.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE ABOVE EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one stands at the BOTTOM of a tall panel with open magenta above it.
  That band stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces LEFT, in side view. Keep that direction in all 8 panels.

WHAT IT IS: Hornet — an angry cartoon hornet in side view: a yellow abdomen angled down and back with three near-black bands, ending in a dark tip and a stinger with a cream glint; a fuzzy rust-brown thorax with a pinched dark waist; a yellow face under a dark rust helmet like a mask, elbowed black antennae and two dark toothed pincers held open. Four amber-tinted wings raised over its back; three yellow legs near, three darker far. Red eyes with lowered lids and hard angry V brows.

Colours: abdomen yellow #ffc21f with near-black bands, thorax and helmet rust-brown #8e3a22, eyes red, wings amber-tinted.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## gloomcrow — Bumblebee  (walk-gloomcrow.png → images/monsters/gloomcrow.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE ABOVE EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one stands at the BOTTOM of a tall panel with open magenta above it.
  That band stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces the viewer. Keep that direction in all 8 panels.

WHAT IT IS: Bumblebee — a round, fuzzy cartoon bumblebee — one big golden fuzz-ball body with two curved black bands and a cream tail band, fuzz tufts all round its outline, and tiny clear wings on top beating flat out with little white effort arcs. A small dark head with knobbed antennae, pink cheeks, big dark eyes and a cream grin. Its black hind legs stick out to the sides with orange pollen baskets, and its two front legs hug a golden HONEY BOMB under its belly — a ball of honey with a faint honeycomb pattern, a wet shine and drips.

Colours: body gold #ffc42e with black bands and a cream tail band, honey bomb #ffb319, pollen baskets orange, cheeks soft pink.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## sliverfin — Water Tiger  (walk-sliverfin.png → images/monsters/sliverfin.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE AROUND EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one floats in the MIDDLE of a tall panel with open magenta above and
  below it. That space stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces RIGHT, swimming side-on. Keep that direction in all 8 panels.

WHAT IT IS: Water Tiger — a water tiger — a diving-beetle larva — swimming side-on: a long thin ribbon of twelve rings, pinched at every ring, with a dark saddle on the back of each ring and a cream belly, six short paddling legs and bristly tail prongs. A flat wedge head with a dark cap and two reddish-brown sickle jaws bowing out and hooking back in — they NEVER close, so its mouth is always open — with a crooked grin between them and lime eyes, the far eye peeking over the crown.

Colours: body ochre #d6b24c, saddles #735424, belly cream, jaws #8e4a22, eyes lime #b8e04a.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

This one SWIMS. It has no feet and is centred on the middle of its body, so
keep it centred vertically in the panel exactly as the reference has it.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## gnashfin — Diving Beetle  (walk-gnashfin.png → images/monsters/gnashfin.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE AROUND EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one floats in the MIDDLE of a tall panel with open magenta above and
  below it. That space stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces RIGHT, swimming side-on. Keep that direction in all 8 panels.

WHAT IT IS: Diving Beetle — a diving beetle swimming side-on: a rigid glossy olive oval shell with a bright yellow rim along its lower edge and around the tail, an olive head at the front with a small chin pincer, a dark belly, an air bubble at its tail, and two big amber oar legs plus two smaller paddles fringed with cream hairs. Amber eyes under a flat, determined brow. Stiff as a pebble — its body never bends.

Colours: shell olive #40602c with a yellow #ffc93c rim and a pale-green catch-light, oar legs amber, fringes cream.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

This one SWIMS. It has no feet and is centred on the middle of its body, so
keep it centred vertically in the panel exactly as the reference has it.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## tidewyrm — Dragonfly Nymph  (walk-tidewyrm.png → images/monsters/tidewyrm.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE AROUND EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one floats in the MIDDLE of a tall panel with open magenta above and
  below it. That space stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces RIGHT, swimming side-on. Keep that direction in all 8 panels.

WHAT IT IS: Dragonfly Nymph — a fat dragonfly nymph swimming side-on: a moss-green nine-ringed abdomen with a darker mottle on each ring, a pale belly and three tail spikes; two leaf-like wing pads lying back along its top; six long legs with the knees up; one big bulging amber dome eye. Folded under its face is a pale khaki hinged lower lip with a smile line — its hands on its chin — that can shoot forward with two dark hooks flung open.

READ THE PANELS: The hinged lip is folded under the face in every panel except panel 6, where it has shot fully forward with both hooks flung open, and panel 7, where it is pulling back in.

Colours: body moss green #83a13f, the hinged lip khaki #bdbf6c, hooks dark brown #6a3f1c, eye amber #ffc94a.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

This one SWIMS. It has no feet and is centred on the middle of its body, so
keep it centred vertically in the panel exactly as the reference has it.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## brinemaw — Toe-Biter  (walk-brinemaw.png → images/monsters/brinemaw.webp)

```text
Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE AROUND EACH CREATURE IS PART OF THE LAYOUT. In the reference
  every one floats in the MIDDLE of a tall panel with open magenta above and
  below it. That space stays empty — it is never room for another row.
  The whole image holds exactly 8 creatures: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical markings, identical number of legs, wings and
antennae. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A bug that is glossy black in one panel and brown in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces RIGHT, swimming side-on. Keep that direction in all 8 panels.

WHAT IT IS: Toe-Biter — a toe-biter — a giant water bug — swimming side-on: a big flat brown oval body tipped slightly so its back shows, folded wings with a pale leathery half and a dark tip, a segment-ticked rim, twin breathing tubes trailing at the tail, and a small pointed head with a beak. Two grabbing arms shaped like a "7" held up in front of its face, each ending in a dark hooked claw; four fringed paddle legs. A stalk arches up off its crown to hang a small glowing pale-green bulb in front of its face, like an angler fish. Pale yellow eyes with tiny pupils under a menacing brow.

Colours: body brown #9a5c28, wings pale leather with dark tips, lure pale green #b6ff8c with its glow kept tight, eyes pale yellow.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A creature does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
creatures sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each creature, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

This one SWIMS. It has no feet and is centred on the middle of its body, so
keep it centred vertically in the panel exactly as the reference has it.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## cavalry — Toy Knight  (walk-cavalry.png → images/allies/cavalry.webp)

```text
Repaint a GALLOP CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME horse and rider at a different moment of ONE gallop stride.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.
· THE EMPTY SPACE ABOVE EACH RIDER IS PART OF THE LAYOUT. In the reference
  every one stands at the BOTTOM of a tall panel with open magenta above it.
  That band stays empty — it is never room for another row.
  The whole image holds exactly 8 riders: 4 across the top half and 4 across the bottom half. Count them before you finish.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical props, identical proportions,
identical silhouette, identical plastic colours, identical saddle, shield and
pennant. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A knight who is blue in one panel and green in another is not one
  rider animated, it is several riders side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the rider must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· In the reference it faces RIGHT. Keep that direction in all 8 panels.

WHAT IT IS: Toy Knight — A blue plastic TOY knight at full gallop on a white plastic toy horse — a toy, glossy and a little stiff, with faint mould-seam lines, not a real knight. The horse: warm white plastic, a gold moulded mane and tail, grey hooves, a painted dot eye, a brown bridle and saddle, a light-blue caparison with a gold scalloped hem and three gold stars, and a blue chanfron and chest plate with gold trim. The knight: toy-blue, a bucket helm with a dark visor slit, a gold crown band and a gold plume streaming back, a gold belt, a blue heater shield with a gold cross, and a couched white lance with blue candy stripes, a gold vamplate, a silver head and a gold swallowtail pennant just behind the tip. This is the player’s OWN unit and the only friendly body on the field: the cool blue has to say “mine” across the battlefield before any detail resolves, and it must never read as something to shoot at.

READ THE PANELS: One full gallop: four hoof beats and a brief moment with every hoof in the air. Panel 1 is the near hind hoof striking the sand; the body rises to its highest around panel 2; panels 3 and 4 gather the legs toward the moment of suspension; the forelegs land in panels 5 and 6; and the hind legs swing back under to land again through panels 7 and 8. The lance, the shield and the knight’s seat stay put — it is the legs, the tail, the pennant and the plume that move.

Colours: the knight, shield, chanfron and chest plate toy-blue around #2f7de1 (shade #1a4f9c); the caparison light blue #6fb0f5; gold trim, mane, tail, plume and pennant around #f2b52c; the horse warm white plastic #f6f1e6 with grey hooves; brown leather tack #9a6238; the lance white with blue candy stripes.

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
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
A rider does NOT fill its panel — it is centred in it, at the size the
reference draws it, with clear magenta all round.
Never let a limb, tail, weapon or shadow cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges. No boxes, borders, gutters, guides, rules or
numbers — in ANY colour, magenta included. The magenta is the empty space the
riders sit in, not a grid to draw with: the space BETWEEN two panels is the
same flat background as the space around each rider, and nothing marks the
join. The panels are found by measuring, so a drawn line is not a help, it is
a mark that ends up welded into the sprite.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the rider bobs when it gallops.

OUTPUT: one image, 1440 x 720 pixels (2:1). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.
```

---

## ballista — Rubber-Band Crossbow carriage  (siege-ballista.png → images/siege/ballista.webp)

```text
Repaint ONE contraption, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Rubber-Band Crossbow carriage — The carriage of an ant-built rubber-band crossbow: two green bottle-cap wheels with a printed cream star; a popsicle-stick bed and a trail stick ending in a pink thumbtack; a wide tongue-depressor stock with a groove along it; an upright stick frame; a corrugated-cardboard shield at the front with a torn top, masking tape and a dark slot; three spare toothpicks standing in a green bottle cap; and a pink eraser wedge under the stock. Draw the CARRIAGE ONLY — no crossbow arms, no rubber band, no wind-up key, no winder ant, no loaded toothpick. Those are painted separately in game.

Colours: popsicle sticks #efcd92 (rear sticks #d2a86a), bottle caps green #43b649 with cream stars, cardboard #cf9f62, toothpicks #f3d6a6, eraser and thumbtack pink #ff8ea4.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving part — the throwing
spoon, the crossbow arms and band, the pencil beam and eraser weight,
the ram pencil or fork, the ramp, the flag straw, the fighting top and
its ant archers — is painted separately and animated on top of this in
the game. If you add one here the contraption ends up with two.
Anything the reference DOES show, including the pebbles on the deck
and the ants standing on it, stays.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
contraption on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· In the reference it faces RIGHT. Keep that direction.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 768 x 768 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## catapult — Spoon Catapult frame  (siege-catapult.png → images/siege/catapult.webp)

```text
Repaint ONE contraption, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Spoon Catapult frame — The frame of an ant-built spoon catapult: two yellow bottle-cap wheels; a stacked popsicle-stick frame with legs and a collar tie; a big wad of yellow and orange rubber bands low at the back (the spring); a yellow kitchen sponge with a green scourer on a stick at the front top (the stop); a cotton reel of yellow thread at the tail; two grey pebbles and a sand clod on the deck; and an ant in an acorn-cap helmet holding up a pebble. Draw the FRAME ONLY — no spoon, no string, no pebble in a bowl. The spoon swings separately in game.

Colours: popsicle sticks #efcd92, bottle caps and bands yellow #ffc93c with orange, sponge #ffd23f with a green #3fa84a scourer, pebbles grey #9aa3ad, sand clod #cfa15e, ant glossy black #342b31 with an acorn cap #a26d36.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving part — the throwing
spoon, the crossbow arms and band, the pencil beam and eraser weight,
the ram pencil or fork, the ramp, the flag straw, the fighting top and
its ant archers — is painted separately and animated on top of this in
the game. If you add one here the contraption ends up with two.
Anything the reference DOES show, including the pebbles on the deck
and the ants standing on it, stays.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
contraption on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· In the reference it faces RIGHT. Keep that direction.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 768 x 768 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## trebuchet — Pencil Trebuchet frame  (siege-trebuchet.png → images/siege/trebuchet.webp)

```text
Repaint ONE contraption, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Pencil Trebuchet frame — The frame of an ant-built pencil trebuchet: two red bottle-cap wheels; a popsicle-stick sill; an A-frame of sticks rising to the pivot, with a collar tie and raking braces; green rubber bands lashing the joints; a spool of green thread at the tail; two pebbles and a sand clod on the sill; and an ant in an acorn-cap helmet standing behind the tail holding a pebble. Draw the FRAME ONLY — no pencil beam, no eraser counterweight, no sling, no pushpin. The arm swings separately in game.

Colours: popsicle sticks #efcd92, bottle caps red #e5483b, bands and thread green #43b649, pebbles grey #9aa3ad, sand clod #cfa15e, ant glossy black #342b31.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving part — the throwing
spoon, the crossbow arms and band, the pencil beam and eraser weight,
the ram pencil or fork, the ramp, the flag straw, the fighting top and
its ant archers — is painted separately and animated on top of this in
the game. If you add one here the contraption ends up with two.
Anything the reference DOES show, including the pebbles on the deck
and the ants standing on it, stays.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
contraption on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· In the reference it faces RIGHT. Keep that direction.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 768 x 768 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## ram — Pencil Ram car  (siege-ram.png → images/siege/ram.webp)

```text
Repaint ONE contraption, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Pencil Ram car — A red die-cast toy car driven by ants: a yellow racing stripe with a thin cream line, dark wheel arches, pale-blue windows with a tiny ant driver peering out, a headlight, a tail light and chrome bumpers at both ends, and two toy-car wheels with black tyres and chrome hubs. A popsicle-stick gantry — two posts and a crossbar — stands over the roof, with a lookout ant on the crossbar and a yellow paper pennant on a toothpick; two orange foam darts are stuck to the car. Draw the CAR AND GANTRY ONLY — no pencil, no rubber bands, no riding ant. The pencil ram swings separately in game.

Colours: car red #e5483b with a yellow #ffc93c stripe, windows #bfe3ec, tyres #3a3540 with chrome hubs #d8dee6, popsicle sticks #efcd92, ants glossy black #342b31.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving part — the throwing
spoon, the crossbow arms and band, the pencil beam and eraser weight,
the ram pencil or fork, the ramp, the flag straw, the fighting top and
its ant archers — is painted separately and animated on top of this in
the game. If you add one here the contraption ends up with two.
Anything the reference DOES show, including the pebbles on the deck
and the ants standing on it, stays.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
contraption on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· In the reference it faces RIGHT. Keep that direction.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 768 x 768 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## ironRam — Tin-Can Ram  (siege-ironRam.png → images/siege/ironRam.webp)

```text
Repaint ONE contraption, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Tin-Can Ram — A soup tin lying on its side on a popsicle-stick sled with two dark-grey bottle-cap wheels: pressed bead ridges round the can, bright specular bands along the top and a darker underside, a torn red label with a cream disc and a tomato, and a rolled rim at the back. The open front mouth is turned toward the viewer, dark inside, with its can-opened lid bent up over it like a visor; a commander ant in an acorn-cap helmet pokes out of a jagged hatch on top; three foam darts are stuck uselessly to the tin. Shiny cold TIN — never cardboard or plastic. Draw the TIN AND SLED ONLY — no fork. The fork slides out of the mouth separately in game.

Colours: tin #b7c0cb with bright bands and a dark inside #23262c, label red #d8402f with a cream #fff4dc disc, bottle caps #4a4f58, popsicle sticks #efcd92, darts orange #ff8a2b with blue #2f7de1 cups.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving part — the throwing
spoon, the crossbow arms and band, the pencil beam and eraser weight,
the ram pencil or fork, the ramp, the flag straw, the fighting top and
its ant archers — is painted separately and animated on top of this in
the game. If you add one here the contraption ends up with two.
Anything the reference DOES show, including the pebbles on the deck
and the ants standing on it, stays.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
contraption on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· In the reference it faces RIGHT. Keep that direction.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 768 x 768 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## siegeTower — Juice-Box Tower  (siege-siegeTower.png → images/siege/siegeTower.webp)

```text
Repaint ONE contraption, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Juice-Box Tower — A juice box on wheels: an orange carton with a darker side panel at the left, a white top band with a wavy lower edge, a green wave along its foot, a big orange-slice picture with a green leaf, a folded side ear and a white sealed fin along the top, two foam darts stuck in it, and two red sewing-button wheels. Draw the CARTON ONLY — no cardboard ramp, no straw flagpole, no red bottle-cap fighting top, no ant archers. Those are all animated separately in game.

Colours: carton orange #ff8a2b with a white top band and a green #43b649 wave, orange slice #ffb13b, buttons red #e5483b.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving part — the throwing
spoon, the crossbow arms and band, the pencil beam and eraser weight,
the ram pencil or fork, the ramp, the flag straw, the fighting top and
its ant archers — is painted separately and animated on top of this in
the game. If you add one here the contraption ends up with two.
Anything the reference DOES show, including the pebbles on the deck
and the ants standing on it, stays.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
contraption on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· In the reference it faces RIGHT. Keep that direction.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 768 x 768 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## ballista — Rubber-Band Crossbow arm  (arm-ballista.png → images/siege-arms/ballista.webp)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A MACHINE.
One landscape image, 1440 x 720 pixels — twice as wide as it is tall —
holding 8 SEPARATE small drawings laid out 4 across and 2
down, on the same grid as the attached reference, read left to right along
the top row and then the bottom row. Each drawing is the same part at a
different moment of one shot.
· 8 panels. Not 1, not 6, not 16. Exactly 2 rows of 4 — do not add a row.
· ONE big drawing of a whole contraption filling the canvas is the wrong answer
  however well it is painted, and so is a square canvas. That is what came
  back last time, and none of it could be used.

THIS IS A PART, NOT A MACHINE — read this before anything else.
It is one moving assembly, lifted off the ant contraption it belongs to. In the
game it is painted ON TOP of a separate carriage that already exists, so
the carriage must not be here as well.
· Draw ONLY what the reference shows in each panel, and nothing else.
· NO wheels or bottle caps. NO cart, bed or stock. NO chassis, popsicle
  frame, A-frame, base or stand. NO ground, no shadow, no scenery, and no
  crew beyond what the reference shows. If it is not in the reference
  panel, it is not in the picture.
· Do not complete it into a whole contraption. Every panel is meant to
  look unfinished, like a part laid out on a bench — the missing half is
  painted separately, and anything you add here ends up doubled.
· The reference settles every argument about what belongs. If you are
  reaching for a part because the machine would "need" it to work, that
  part is already on the other layer.

WHAT IT IS: The crossbow assembly of an ant-built rubber-band crossbow, lifted off its carriage and seen from the side: two wads of wound pink rubber bands, one upright behind the other, with one popsicle-stick arm sweeping out of each — the far arm a tone darker and set back behind the near one; one fat pink rubber band strung between the two arm tips as the bowstring; a toothpick with a pale-yellow paper flight lying dead level in front of the band, point to the RIGHT; and away to the LEFT, clear of the rest, a brass wind-up key with two round lobes, turned by a glossy black ant standing beside it. NOTHING else: no wheels, no bottle caps, no bed, no stock, no cardboard shield, no ground. The two arms are separate straight sticks and the band is two straight runs meeting at the nock: do NOT draw one curved bow limb from tip to tip, and do not outline the assembly with a bow shape.

READ THE PANELS: Panel 1 is the instant AFTER the shot — the toothpick is gone, the band has been thrown forward and the two arms are sprung wide apart, one up and one down. Panels 2 to 6 are the ant winding the key: a fresh toothpick lies ready, the band comes further back in each panel and the arms close towards level. Panels 7 and 8 are held at full draw, loaded and dead still, both arms nearly level and pointing right — those two are all but identical. Every panel except the first has the toothpick in it, and the ant and the key are in every panel.

Colours: popsicle-stick arms #efcd92 (the far one #d2a86a), rubber bands pink #ff5f8f striped with a lighter pink, toothpick #f3d6a6 with a pale-yellow #fff0a8 flight, key brass #e2b447, ant glossy black #342b31.
It is the same contraption as the ballista carriage sheet, which is painted
in the same materials and is what this part gets laid on top of. Side
by side the two have to look like one object: the same sticks, the same
plastic, the same colours, the same wear. A part two shades paler than
the carriage it sits on reads as somebody else’s toy.

THE VIEW — a flat side elevation, square on from the side, the way a
toy’s instruction leaflet shows it.
· NO three-quarter view, no perspective, no vanishing point, no
  foreshortening, no tilt. Nothing turns to face the viewer, and no part
  is nearer the eye than another.
· Every stick, pencil and spoon keeps the angle the reference draws it at.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

ONE MECHANISM.
All 8 panels are the same assembly at a different moment of one
shot. Identical sticks, identical caps, identical rubber bands, identical
proportions and identical thickness in every panel. Only the POSE changes —
the arm swings, the band draws back, the weight falls — and it changes exactly
as the reference shows it, panel for panel.
· ONE colour scheme, taken from the reference, in all of them.
· Do not re-scale it between panels, and do not re-scale it from the
  reference: it has to keep meeting a carriage it cannot see.
· In the reference it faces RIGHT. Keep that direction throughout.

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

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
The mechanism is SMALL inside its panel and does not fill it. It floats
clear of all four panel edges with wide empty magenta around it, exactly as
the reference has it.

SIZE — measure it against the PANEL, not against the paper. In the
reference the assembly — ant and key included — spans about two thirds of the panel’s width (64% in most panels, 76% at the widest in panel 2, where the fresh toothpick reaches furthest) and never more than about two fifths of its height.
If yours reaches three quarters of the way across its panel it is about
twice the size it should be, and it will not meet the carriage under it.
Bigger is not clearer here: the empty space is where the machine goes.

WHERE it sits in its panel is not a composition choice — it is the point
the part bolts on to. The exact centre of a panel is the machine’s origin,
the spot a carriage you cannot see holds this part at, so keep every piece
the same distance and direction from that centre as the reference has it,
panel by panel — including the panels where the part sits well off to one
side or high up. Do not re-centre it on its own outline, do not tidy the
arrangement, do not even out the spacing.
Never let it cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included.

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
· The palette above is for the OBJECT. The ground is not part of the
  painting and is not warmed, softened or toned with it: it stays a
  vivid, eye-hurting #FF00FF whatever the object looks like.
  Dusty rose, pale pink and mauve are the failure this whole clause is
  about — they cannot be keyed, only flood-filled, and a flood fill eats
  pale paint.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 2 down, 8 in all.
· The canvas is landscape, twice as wide as it is tall.
· There is not one wheel, cart or frame anywhere in it.
· Nothing in any panel is anywhere near filling it — check the widest
  panel against the SIZE note above, in fractions of the panel.
· Every panel holds the same assembly, at the same size, in the same
  colours, facing RIGHT.
· Every pixel that is not the part itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1440 x 720 pixels (2:1, landscape). If your tool
has an aspect-ratio control, set it to 2:1 — a square return crushes the
grid and cannot be cut. No labels, captions, numbers or watermarks.
```

---

## catapult — Spoon Catapult arm  (arm-catapult.png → images/siege-arms/catapult.webp)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A MACHINE.
One landscape image, 1440 x 720 pixels — twice as wide as it is tall —
holding 8 SEPARATE small drawings laid out 4 across and 2
down, on the same grid as the attached reference, read left to right along
the top row and then the bottom row. Each drawing is the same part at a
different moment of one shot.
· 8 panels. Not 1, not 6, not 16. Exactly 2 rows of 4 — do not add a row.
· ONE big drawing of a whole contraption filling the canvas is the wrong answer
  however well it is painted, and so is a square canvas. That is what came
  back last time, and none of it could be used.

THIS IS A PART, NOT A MACHINE — read this before anything else.
It is one moving assembly, lifted off the ant contraption it belongs to. In the
game it is painted ON TOP of a separate carriage that already exists, so
the carriage must not be here as well.
· Draw ONLY what the reference shows in each panel, and nothing else.
· NO wheels or bottle caps. NO cart, bed or stock. NO chassis, popsicle
  frame, A-frame, base or stand. NO ground, no shadow, no scenery, and no
  crew beyond what the reference shows. If it is not in the reference
  panel, it is not in the picture.
· Do not complete it into a whole contraption. Every panel is meant to
  look unfinished, like a part laid out on a bench — the missing half is
  painted separately, and anything you add here ends up doubled.
· The reference settles every argument about what belongs. If you are
  reaching for a part because the machine would "need" it to work, that
  part is already on the other layer.

WHAT IT IS: The throwing arm of an ant-built spoon catapult, lifted off its frame and seen from the side: ONE pink plastic spoon — a long straight handle and an oval bowl with a darker hollow and a white sheen — with a yellow rubber band lashed round the handle near its pivot end, and a length of cream string running from the middle of the spoon back toward the tail. NOTHING else: no wheels, no bottle caps, no popsicle frame, no sponge, no rubber-band spring, no cotton reel, no ground.

READ THE PANELS: Panel 1 is the instant after the throw — the spoon has slammed forward against its stop, lying low and pointing up to the RIGHT with its bowl empty; panel 2 is the same, still shuddering. Panels 3 to 6 are the ants hauling it back: the spoon rises through upright (panels 4 and 5) and on over to the rear, the string pulled taut. Panel 7 is cocked, the spoon lying back and low with its bowl at the LEFT, still empty; panel 8 is the same pose with a grey pebble in the bowl — the only panel with one.

Colours: spoon pink #ff6fae with a deeper pink hollow and a white sheen, band yellow #ffc93c, string cream #f0e4c6, pebble grey #9aa3ad.
It is the same contraption as the catapult carriage sheet, which is painted
in the same materials and is what this part gets laid on top of. Side
by side the two have to look like one object: the same sticks, the same
plastic, the same colours, the same wear. A part two shades paler than
the carriage it sits on reads as somebody else’s toy.

THE VIEW — a flat side elevation, square on from the side, the way a
toy’s instruction leaflet shows it.
· NO three-quarter view, no perspective, no vanishing point, no
  foreshortening, no tilt. Nothing turns to face the viewer, and no part
  is nearer the eye than another.
· Every stick, pencil and spoon keeps the angle the reference draws it at.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

ONE MECHANISM.
All 8 panels are the same assembly at a different moment of one
shot. Identical sticks, identical caps, identical rubber bands, identical
proportions and identical thickness in every panel. Only the POSE changes —
the arm swings, the band draws back, the weight falls — and it changes exactly
as the reference shows it, panel for panel.
· ONE colour scheme, taken from the reference, in all of them.
· Do not re-scale it between panels, and do not re-scale it from the
  reference: it has to keep meeting a carriage it cannot see.
· In the reference it faces RIGHT. Keep that direction throughout.

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

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
The mechanism is SMALL inside its panel and does not fill it. It floats
clear of all four panel edges with wide empty magenta around it, exactly as
the reference has it.

SIZE — measure it against the PANEL, not against the paper. In the
reference the spoon spans a little under half the panel’s width — 45% at its longest, in panels 1 and 2 — and never more than about two fifths of its height, even standing upright.
If yours reaches three quarters of the way across its panel it is about
twice the size it should be, and it will not meet the carriage under it.
Bigger is not clearer here: the empty space is where the machine goes.

WHERE it sits in its panel is not a composition choice — it is the point
the part bolts on to. The exact centre of a panel is the machine’s origin,
the spot a carriage you cannot see holds this part at, so keep every piece
the same distance and direction from that centre as the reference has it,
panel by panel — including the panels where the part sits well off to one
side or high up. Do not re-centre it on its own outline, do not tidy the
arrangement, do not even out the spacing.
Never let it cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included.

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
· The palette above is for the OBJECT. The ground is not part of the
  painting and is not warmed, softened or toned with it: it stays a
  vivid, eye-hurting #FF00FF whatever the object looks like.
  Dusty rose, pale pink and mauve are the failure this whole clause is
  about — they cannot be keyed, only flood-filled, and a flood fill eats
  pale paint.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 2 down, 8 in all.
· The canvas is landscape, twice as wide as it is tall.
· There is not one wheel, cart or frame anywhere in it.
· Nothing in any panel is anywhere near filling it — check the widest
  panel against the SIZE note above, in fractions of the panel.
· Every panel holds the same assembly, at the same size, in the same
  colours, facing RIGHT.
· Every pixel that is not the part itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1440 x 720 pixels (2:1, landscape). If your tool
has an aspect-ratio control, set it to 2:1 — a square return crushes the
grid and cannot be cut. No labels, captions, numbers or watermarks.
```

---

## trebuchet — Pencil Trebuchet arm  (arm-trebuchet.png → images/siege-arms/trebuchet.webp)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A MACHINE.
One landscape image, 1440 x 720 pixels — twice as wide as it is tall —
holding 8 SEPARATE small drawings laid out 4 across and 2
down, on the same grid as the attached reference, read left to right along
the top row and then the bottom row. Each drawing is the same part at a
different moment of one shot.
· 8 panels. Not 1, not 6, not 16. Exactly 2 rows of 4 — do not add a row.
· ONE big drawing of a whole contraption filling the canvas is the wrong answer
  however well it is painted, and so is a square canvas. That is what came
  back last time, and none of it could be used.

THIS IS A PART, NOT A MACHINE — read this before anything else.
It is one moving assembly, lifted off the ant contraption it belongs to. In the
game it is painted ON TOP of a separate carriage that already exists, so
the carriage must not be here as well.
· Draw ONLY what the reference shows in each panel, and nothing else.
· NO wheels or bottle caps. NO cart, bed or stock. NO chassis, popsicle
  frame, A-frame, base or stand. NO ground, no shadow, no scenery, and no
  crew beyond what the reference shows. If it is not in the reference
  panel, it is not in the picture.
· Do not complete it into a whole contraption. Every panel is meant to
  look unfinished, like a part laid out on a bench — the missing half is
  painted separately, and anything you add here ends up doubled.
· The reference settles every argument about what belongs. If you are
  reaching for a part because the machine would "need" it to work, that
  part is already on the other layer.

WHAT IT IS: The throwing assembly of an ant-built pencil trebuchet, lifted off its frame and seen from the side: one long yellow pencil as the beam, pivoting near its pink-eraser end on a red pushpin, with two green rubber bands round it at the pivot; a big pink eraser block hanging from a silver paperclip off that short end as the counterweight, always hanging straight down however far the beam has swung; and two string cords trailing from the sharpened graphite end to a pale-yellow cloth pouch. NOTHING else: no wheels, no bottle caps, no popsicle A-frame, no ground.

READ THE PANELS: Panel 1 is the instant after the release — the long pencil end is thrown up to the upper RIGHT with the empty sling streaming out past its tip, and the eraser weight hangs low under the pivot. Panels 2 and 3 are the beam settling back and being winched round — the long end dips toward the right, then starts to rise; panel 4 stands it straight up; panels 5 and 6 carry it on over to the LEFT while the eraser weight swings up on the right. Panels 7 and 8 are cocked and still — the long end down at the LEFT with the pouch hanging below it, the eraser raised at the RIGHT — and the pebble is in the pouch in the last panel only.

Colours: pencil yellow #ffc93c with a sharpened cedar tip #f3d6a6 and a graphite point, eraser pink #ff8ea4, paperclip silver #c9cfd6, bands green #43b649, string cream #f0e4c6, pouch pale yellow #ffe08a, pushpin red #e5483b, pebble grey #9aa3ad.
It is the same contraption as the trebuchet carriage sheet, which is painted
in the same materials and is what this part gets laid on top of. Side
by side the two have to look like one object: the same sticks, the same
plastic, the same colours, the same wear. A part two shades paler than
the carriage it sits on reads as somebody else’s toy.

THE VIEW — a flat side elevation, square on from the side, the way a
toy’s instruction leaflet shows it.
· NO three-quarter view, no perspective, no vanishing point, no
  foreshortening, no tilt. Nothing turns to face the viewer, and no part
  is nearer the eye than another.
· Every stick, pencil and spoon keeps the angle the reference draws it at.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

ONE MECHANISM.
All 8 panels are the same assembly at a different moment of one
shot. Identical sticks, identical caps, identical rubber bands, identical
proportions and identical thickness in every panel. Only the POSE changes —
the arm swings, the band draws back, the weight falls — and it changes exactly
as the reference shows it, panel for panel.
· ONE colour scheme, taken from the reference, in all of them.
· Do not re-scale it between panels, and do not re-scale it from the
  reference: it has to keep meeting a carriage it cannot see.
· In the reference it faces RIGHT. Keep that direction throughout.

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

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
The mechanism is SMALL inside its panel and does not fill it. It floats
clear of all four panel edges with wide empty magenta around it, exactly as
the reference has it.

SIZE — measure it against the PANEL, not against the paper. In the
reference beam, eraser weight and sling together span about half the panel’s width — 52% at most — and a little over half its height at the tallest, in panel 4 where the pencil stands straight up.
If yours reaches three quarters of the way across its panel it is about
twice the size it should be, and it will not meet the carriage under it.
Bigger is not clearer here: the empty space is where the machine goes.

WHERE it sits in its panel is not a composition choice — it is the point
the part bolts on to. The exact centre of a panel is the machine’s origin,
the spot a carriage you cannot see holds this part at, so keep every piece
the same distance and direction from that centre as the reference has it,
panel by panel — including the panels where the part sits well off to one
side or high up. Do not re-centre it on its own outline, do not tidy the
arrangement, do not even out the spacing.
Never let it cross into a neighbouring panel.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included.

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
· The palette above is for the OBJECT. The ground is not part of the
  painting and is not warmed, softened or toned with it: it stays a
  vivid, eye-hurting #FF00FF whatever the object looks like.
  Dusty rose, pale pink and mauve are the failure this whole clause is
  about — they cannot be keyed, only flood-filled, and a flood fill eats
  pale paint.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 2 down, 8 in all.
· The canvas is landscape, twice as wide as it is tall.
· There is not one wheel, cart or frame anywhere in it.
· Nothing in any panel is anywhere near filling it — check the widest
  panel against the SIZE note above, in fractions of the panel.
· Every panel holds the same assembly, at the same size, in the same
  colours, facing RIGHT.
· Every pixel that is not the part itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1440 x 720 pixels (2:1, landscape). If your tool
has an aspect-ratio control, set it to 2:1 — a square return crushes the
grid and cannot be cut. No labels, captions, numbers or watermarks.
```

---

## skiff — Paper Boat hull  (hull-skiff.png → images/ships/skiff.webp)

```text
Repaint ONE ship, in a single landscape image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Paper Boat hull — A folded notebook-paper boat, seen side-on and facing RIGHT: a tall triangular centre fold standing up out of it — lit on its left half, shaded on its right — and a wide flap whose two ends fold up into points and pinch down toward a flat keel; blue ruled lines running across the paper, a red margin line near the left, soft grey creases and a double-thickness brim. No mast, no sail, no oars. Cut off flat at the waterline.

Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #e4ecf5, shadows #8ea3ba, highlights #ffffff, accent details #5a9be6.

DRAW ONLY WHAT THE REFERENCE SHOWS. A ship here is a BASE for a weapon,
the same way a block is: the deck weapon — the toothpick spear, the dart
launcher, the cork cannons — aims at whatever the ship is shooting at,
so it is drawn live on top of this and must NOT be painted in.
Everything the reference does show stays.

THE WATERLINE IS THE BOTTOM EDGE OF THE IMAGE. The hull runs straight
off the bottom of the frame and is cut flat by it, exactly as the
reference is — the game draws the water, the wake and the reflection
below that edge, and the boat sits down into them. So paint no water,
no foam, no ripples, no shadow, no reflection and no waterline of your
own, and leave no margin under the hull: the last row of pixels in the
image is the boat, not background.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
hull on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the waterline the hull is cut off at must land at the same height
from the bottom edge as the reference has it.
· In the reference it faces RIGHT. Keep that direction.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 960 x 732 pixels — landscape, and NOT square.
If your tool has an aspect-ratio control, set it to match: a square
return squashes the hull and puts the waterline in the wrong place.
No labels, captions or watermarks.
```

---

## longship — Rubber Duck hull  (hull-longship.png → images/ships/longship.webp)

```text
Repaint ONE ship, in a single landscape image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Rubber Duck hull — A fat yellow rubber bath duck, seen side-on and facing LEFT: a plump breast and a round head at the left, an orange beak with a smile line, a big glossy black eye with a white glint, orange cheek blush, a tucked wing shading toward orange, a perky tail rising at the upper right, and a toy-blue saddle strap across its back. Cut off flat at the waterline.

Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #ffc93c, shadows #d99400, highlights #ffe78f, accent details #ff8a2b.

DRAW ONLY WHAT THE REFERENCE SHOWS. A ship here is a BASE for a weapon,
the same way a block is: the deck weapon — the toothpick spear, the dart
launcher, the cork cannons — aims at whatever the ship is shooting at,
so it is drawn live on top of this and must NOT be painted in.
Everything the reference does show stays.

THE WATERLINE IS THE BOTTOM EDGE OF THE IMAGE. The hull runs straight
off the bottom of the frame and is cut flat by it, exactly as the
reference is — the game draws the water, the wake and the reflection
below that edge, and the boat sits down into them. So paint no water,
no foam, no ripples, no shadow, no reflection and no waterline of your
own, and leave no margin under the hull: the last row of pixels in the
image is the boat, not background.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
hull on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the waterline the hull is cut off at must land at the same height
from the bottom edge as the reference has it.
· In the reference it faces LEFT. Keep that direction.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 960 x 732 pixels — landscape, and NOT square.
If your tool has an aspect-ratio control, set it to match: a square
return squashes the hull and puts the waterline in the wrong place.
No labels, captions or watermarks.
```

---

## galley — Toy Pirate Ship hull  (hull-galley.png → images/ships/galley.webp)

```text
Repaint ONE ship, in a single landscape image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Toy Pirate Ship hull — A moulded brown-plastic toy pirate ship, seen side-on and facing RIGHT: a plank-lined hull with a gold stripe along the sheer and four gold-ringed black portholes, a gold wedge figurehead at the bow, a darker stern castle at the left with three little merlons and a lit window, a dark mast carrying a cream sail with two red stripes and a yard across its head, and a black pennant at the masthead with a plain off-white skull shape on it. No oars, no shields. Cut off flat at the waterline.

Colour identity (keep these hues, bright and sunny — never greyed, muddy or dusty): body around #8c4d2b, shadows #4f2a18, highlights #bd7a45, accent details #ffc93c.

DRAW ONLY WHAT THE REFERENCE SHOWS. A ship here is a BASE for a weapon,
the same way a block is: the deck weapon — the toothpick spear, the dart
launcher, the cork cannons — aims at whatever the ship is shooting at,
so it is drawn live on top of this and must NOT be painted in.
Everything the reference does show stays.

THE WATERLINE IS THE BOTTOM EDGE OF THE IMAGE. The hull runs straight
off the bottom of the frame and is cut flat by it, exactly as the
reference is — the game draws the water, the wake and the reflection
below that edge, and the boat sits down into them. So paint no water,
no foam, no ripples, no shadow, no reflection and no waterline of your
own, and leave no margin under the hull: the last row of pixels in the
image is the boat, not background.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
hull on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the waterline the hull is cut off at must land at the same height
from the bottom edge as the reference has it.
· In the reference it faces RIGHT. Keep that direction.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 960 x 732 pixels — landscape, and NOT square.
If your tool has an aspect-ratio control, set it to match: a square
return squashes the hull and puts the waterline in the wrong place.
No labels, captions or watermarks.
```

---

## cannon — Squirt Gun  (fixture-cannon.png → images/fixtures/cannon.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Squirt Gun — A chunky toy water pistol pointing RIGHT: a rounded green body with an orange stripe decal along its side, a green grip hanging below the rear with an orange trigger, an orange pump slide with three ribs under the barrel, a yellow nozzle barrel ending in an orange tip with a dark hole, an orange knob on the back end, and on top a pill-shaped water tank about half full of turquoise water, with an orange filler cap and two yellow straps. Paint the tank as SOLID pale icy blue above the water line, not see-through. NOTHING else — no stand, no block, no spray, no drips.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: level and pointing RIGHT, grip hanging down.
The game turns it to its own firing angle out of this one picture, so
do not draw it already aimed or tilted.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: level and pointing RIGHT, grip hanging down.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## archer — Dart Blaster  (fixture-archer.png → images/fixtures/archer.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Dart Blaster — A toy foam-dart blaster pointing RIGHT: a chunky orange body with a hump over the chamber, a blue side panel with two yellow screws, a blue grip with a yellow trigger, a small blue sight fin on top, a blue barrel with two darker rings and an orange muzzle ring, a yellow priming slide on a rod at the back, and a loaded dart just poking out of the muzzle — a stub of orange foam and a fat blue suction cup. NOTHING else — no tripod, no block, no flying darts.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: level and pointing RIGHT, grip hanging down.
The game turns it to its own firing angle out of this one picture, so
do not draw it already aimed or tilted.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: level and pointing RIGHT, grip hanging down.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## mortar — Mud Mortar  (fixture-mortar.png → images/fixtures/mortar.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Mud Mortar — A blue plastic sand bucket used as a mortar tube: flaring toward its mouth, two moulded ridges round it, a thick yellow rolled rim, a yellow U-shaped handle across its side, a mouth full of dark mud with a round mud ball sitting in it and one drip over the rim, and a yellow pivot hub with a blue centre at its base. NOTHING else — no block, no splatter, no flying mud.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: tilted at its fixed lobbing angle, about 56° up, mouth up and to the RIGHT, the pivot hub at the lower left.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: tilted at its fixed lobbing angle, about 56° up, mouth up and to the RIGHT, the pivot hub at the lower left.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## bombard — Balloon Launcher  (fixture-bombard.png → images/fixtures/bombard.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Balloon Launcher — A launch tube made from a kraft-cardboard tube with a rounded bottom end, diagonal spiral seams and two toy-blue bands; an orange plastic collar round its dark mouth; a glossy PINK water balloon sitting in the mouth, bigger than it, with its knot showing; and a yellow pivot disc at its base. NOTHING else — no block, no pit, no splash.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: tilted steeply at its fixed angle, about 71° up, mouth up and a little to the RIGHT, the pivot disc at the bottom.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: tilted steeply at its fixed angle, about 71° up, mouth up and a little to the RIGHT, the pivot disc at the bottom.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## tesla — Bug Zapper  (fixture-tesla.png → images/fixtures/tesla.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Bug Zapper — An electric bug-zapper lantern: a dark indigo cage with a pale UV tube glowing cyan inside it, a pale-lavender wire grid across the front with violet corner posts, a violet flared base, a sloped violet roof, and a pale hanging ring on top. NOTHING else — no zap, no spark, no glow around it, no bug, no block: the game pulses its own glow behind the lantern and throws its own spark across the grid.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: standing upright and symmetrical — it has no front and never turns.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: standing upright and symmetrical — it has no front and never turns.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## frost — Ice Pop  (fixture-frost.png → images/fixtures/frost.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Ice Pop — A giant ice-blue ice pop on a wooden stick: a rounded top with a bite taken out of the right shoulder, two white moulded ridges, a white gloss streak down the left, and one melt drop at the lower right. NOTHING else — no frost glints, no cold glow around it, no block, no puddle, no flying ice: the game twinkles its own glints on it and breathes its own glow behind it.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: standing upright on its stick, never turning.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: standing upright on its stick, never turning.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## stonepit — Pebble Digger  (fixture-stonepit.png → images/fixtures/stonepit.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Pebble Digger — A yellow toy digger facing LEFT: dark rubber tracks with grey wheels at the right, a yellow cab with a pale-blue window, and a yellow boom and arm with a grey ram reaching up and over to a yellow scoop at the top left with two pebbles in it, above a small heap of grey pebbles at the bottom left. NOTHING else: no block, no ground, no dust.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: facing LEFT, standing still, the scoop raised at the top left.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: facing LEFT, standing still, the scoop raised at the top left.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## banner — Paper Flag  (fixture-banner.png → images/fixtures/banner.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Paper Flag — A little paper flag on a wooden toothpick mast, point up: a plum-red paper swallowtail flying to the RIGHT from the top of the mast, with a gold band and a gold star, and a darker fold where it wraps the mast. NOTHING else: no block, no paper frill, no sand.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: the toothpick mast upright, the flag flying out to the RIGHT from its top in a slight ripple.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: the toothpick mast upright, the flag flying out to the RIGHT from its top in a slight ripple.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## obelisk — Magic Seashell  (fixture-obelisk.png → images/fixtures/obelisk.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Magic Seashell — A pearly-pink scallop shell standing on its hinge: seven scalloped lobes, six radial ribs in a deeper pink, a darker pink hinge piece at the bottom with a pale cyan-white pearl on it, and three small sparkles. A soft pale-cyan aura close behind it. NOTHING else: no block, no sand, no beam of light.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: standing upright, its fan opening upward from the hinge at the bottom.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: standing upright, its fan opening upward from the hinge at the bottom.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## lumberHut — Sand Sifter  (fixture-lumberHut.png → images/fixtures/lumberHut.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Sand Sifter — A toy sand wheel: a paddle wheel with yellow spokes, an orange rim, eight orange paddle cups and a blue hub, standing on blue A-frame legs over a small heap of sand, with a green funnel above it heaped with sand and a thin trickle of grains falling into the wheel. NOTHING else: no block, no ground, no sieve.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: standing upright and still.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: standing upright and still.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## coffer — Piggy Bank  (fixture-coffer.png → images/fixtures/coffer.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Piggy Bank — A soft-pink piggy bank facing RIGHT: a round body, darker far legs and ear, a curly tail at the left, a pale snout with two nostrils, a glossy dot eye, a red cheek blush, a slot on its back, and a gold coin, seen edge-on, hovering just above the slot with two little motion ticks. NOTHING else: no block, no pedestal, no pile of coins.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: facing RIGHT, standing still.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: facing RIGHT, standing still.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## repair — Bucket & Spade  (fixture-repair.png → images/fixtures/repair.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Bucket & Spade — A green toy sand bucket with a yellow rim, a yellow arched handle and a white first-aid-cross sticker on its side, with a toy spade — a yellow handle with a T-grip and an orange blade — leaning against its right side. NOTHING else: no block, no sand, no tools.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: standing upright, the spade leaning on the bucket’s right side.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: standing upright, the spade leaning on the bucket’s right side.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## spikes — Toothpick Wall  (fixture-spikes.png → images/fixtures/spikes.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Toothpick Wall — A ring of fourteen wooden toothpicks, points out: three poking out to the left, three to the right, four up and four down, each tilted a little by hand, starting well inside the square and reaching well past its edges, in pale wood with a lighter highlight line. The middle is EMPTY — the block goes there. NOTHING else: no block, no ground, no glints — the game twinkles its own at the points.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: symmetrical, pointing outward on all four sides — it has no front.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: symmetrical, pointing outward on all four sides — it has no front.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## cannon-t2 — Squirt Gun — tier 2  (fixture-cannon-t2.png → images/fixtures/cannon-t2.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Squirt Gun — tier 2 — ONE squirt gun — the plain toy made fancier: a racing stripe in the tier colour along the body under the orange decal, and a star sticker near the front. Otherwise exactly the plain toy — the same parts, the same colours, the same pose. One toy. NOTHING else — no stand, no block, no ammunition flying, no spray or smoke.

THIS IS A MERGED WEAPON — tier 2: the SAME toy as the plain
`images/fixtures/cannon.webp`, made fancier. Attach that
painting as well as the reference: it is the design. Same plastic, same
colours, same ink — and ONE toy, never two or three side by side. A merge
makes one block, so it carries one weapon.

KEEP ITS SIZE AND ITS PLACE. The reference is the plain toy’s own outline,
and the game makes a merged weapon bigger by itself; a painting that fills
more of the frame gets grown twice. Put the upgrade INSIDE that outline:
the stripe, the sticker and the extra part the reference shows.

THE TIER COLOUR IS GREEN, around #46d86a. It goes in the stripe and the
sticker the reference shows, and nowhere else: the toy keeps its own plastic
colours everywhere else, so it is still THIS toy.
This one accent may be brighter than the rest of the palette: it is how a
player tells a tier 2 from a plain toy at a glance.

IT HAS TO READ AS THE UPGRADED TOY AT 40 PX. A chunky stripe, a bold
sticker, a clear extra part and a strong ink line round one clear
silhouette. Fine detail that only shows at full size is the one way this
fails that looks fine at full size.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: level and pointing RIGHT, grip hanging down.
The game turns it to its own firing angle out of this one picture, so
do not draw it already aimed or tilted.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: level and pointing RIGHT, grip hanging down.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## cannon-t3 — Squirt Gun — tier 3  (fixture-cannon-t3.png → images/fixtures/cannon-t3.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Squirt Gun — tier 3 — ONE squirt gun — the plain toy made fancier: the stripe and the sticker, plus a white pressure gauge with a red needle on the rear of the body and a bigger water tank on top. Otherwise exactly the plain toy — the same parts, the same colours, the same pose. One toy. NOTHING else — no stand, no block, no ammunition flying, no spray or smoke.

THIS IS A MERGED WEAPON — tier 3: the SAME toy as the plain
`images/fixtures/cannon.webp`, made fancier again. Attach that
painting as well as the reference: it is the design. Same plastic, same
colours, same ink — and ONE toy, never two or three side by side. A merge
makes one block, so it carries one weapon.

KEEP ITS SIZE AND ITS PLACE. The reference is the plain toy’s own outline,
and the game makes a merged weapon bigger by itself; a painting that fills
more of the frame gets grown twice. Put the upgrade INSIDE that outline:
the stripe, the sticker and the extra part the reference shows.

THE TIER COLOUR IS BLUE, around #3fa2ff. It goes in the stripe and the
sticker the reference shows, and nowhere else: the toy keeps its own plastic
colours everywhere else, so it is still THIS toy.
This one accent may be brighter than the rest of the palette: it is how a
player tells a tier 3 from a tier 2 at a glance.

IT HAS TO READ AS THE UPGRADED TOY AT 40 PX. A chunky stripe, a bold
sticker, a clear extra part and a strong ink line round one clear
silhouette. Fine detail that only shows at full size is the one way this
fails that looks fine at full size.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: level and pointing RIGHT, grip hanging down.
The game turns it to its own firing angle out of this one picture, so
do not draw it already aimed or tilted.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: level and pointing RIGHT, grip hanging down.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## archer-t2 — Dart Blaster — tier 2  (fixture-archer-t2.png → images/fixtures/archer-t2.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Dart Blaster — tier 2 — ONE dart blaster — the plain toy made fancier: a stripe in the tier colour along the bottom of the body, and a sticker on its side. Otherwise exactly the plain toy — the same parts, the same colours, the same pose. One toy. NOTHING else — no stand, no block, no ammunition flying, no spray or smoke.

THIS IS A MERGED WEAPON — tier 2: the SAME toy as the plain
`images/fixtures/archer.webp`, made fancier. Attach that
painting as well as the reference: it is the design. Same plastic, same
colours, same ink — and ONE toy, never two or three side by side. A merge
makes one block, so it carries one weapon.

KEEP ITS SIZE AND ITS PLACE. The reference is the plain toy’s own outline,
and the game makes a merged weapon bigger by itself; a painting that fills
more of the frame gets grown twice. Put the upgrade INSIDE that outline:
the stripe, the sticker and the extra part the reference shows.

THE TIER COLOUR IS GREEN, around #46d86a. It goes in the stripe and the
sticker the reference shows, and nowhere else: the toy keeps its own plastic
colours everywhere else, so it is still THIS toy.
This one accent may be brighter than the rest of the palette: it is how a
player tells a tier 2 from a plain toy at a glance.

IT HAS TO READ AS THE UPGRADED TOY AT 40 PX. A chunky stripe, a bold
sticker, a clear extra part and a strong ink line round one clear
silhouette. Fine detail that only shows at full size is the one way this
fails that looks fine at full size.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: level and pointing RIGHT, grip hanging down.
The game turns it to its own firing angle out of this one picture, so
do not draw it already aimed or tilted.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: level and pointing RIGHT, grip hanging down.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## archer-t3 — Dart Blaster — tier 3  (fixture-archer-t3.png → images/fixtures/archer-t3.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Dart Blaster — tier 3 — ONE dart blaster — the plain toy made fancier: the stripe and the sticker, plus a yellow dart drum with six orange dart ends under the barrel, and the sight fin swapped for a blue scope with a pale lens. Otherwise exactly the plain toy — the same parts, the same colours, the same pose. One toy. NOTHING else — no stand, no block, no ammunition flying, no spray or smoke.

THIS IS A MERGED WEAPON — tier 3: the SAME toy as the plain
`images/fixtures/archer.webp`, made fancier again. Attach that
painting as well as the reference: it is the design. Same plastic, same
colours, same ink — and ONE toy, never two or three side by side. A merge
makes one block, so it carries one weapon.

KEEP ITS SIZE AND ITS PLACE. The reference is the plain toy’s own outline,
and the game makes a merged weapon bigger by itself; a painting that fills
more of the frame gets grown twice. Put the upgrade INSIDE that outline:
the stripe, the sticker and the extra part the reference shows.

THE TIER COLOUR IS BLUE, around #3fa2ff. It goes in the stripe and the
sticker the reference shows, and nowhere else: the toy keeps its own plastic
colours everywhere else, so it is still THIS toy.
This one accent may be brighter than the rest of the palette: it is how a
player tells a tier 3 from a tier 2 at a glance.

IT HAS TO READ AS THE UPGRADED TOY AT 40 PX. A chunky stripe, a bold
sticker, a clear extra part and a strong ink line round one clear
silhouette. Fine detail that only shows at full size is the one way this
fails that looks fine at full size.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: level and pointing RIGHT, grip hanging down.
The game turns it to its own firing angle out of this one picture, so
do not draw it already aimed or tilted.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: level and pointing RIGHT, grip hanging down.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## bombard-t2 — Balloon Launcher — tier 2  (fixture-bombard-t2.png → images/fixtures/bombard-t2.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Balloon Launcher — tier 2 — ONE balloon launcher — the plain toy made fancier: a sticker on the cardboard tube. Otherwise exactly the plain toy — the same parts, the same colours, the same pose. One toy. NOTHING else — no stand, no block, no ammunition flying, no spray or smoke.

THIS IS A MERGED WEAPON — tier 2: the SAME toy as the plain
`images/fixtures/bombard.webp`, made fancier. Attach that
painting as well as the reference: it is the design. Same plastic, same
colours, same ink — and ONE toy, never two or three side by side. A merge
makes one block, so it carries one weapon.

KEEP ITS SIZE AND ITS PLACE. The reference is the plain toy’s own outline,
and the game makes a merged weapon bigger by itself; a painting that fills
more of the frame gets grown twice. Put the upgrade INSIDE that outline:
the stripe, the sticker and the extra part the reference shows.

THE TIER COLOUR IS GREEN, around #46d86a. It goes in the stripe and the
sticker the reference shows, and nowhere else: the toy keeps its own plastic
colours everywhere else, so it is still THIS toy.
This one accent may be brighter than the rest of the palette: it is how a
player tells a tier 2 from a plain toy at a glance.

IT HAS TO READ AS THE UPGRADED TOY AT 40 PX. A chunky stripe, a bold
sticker, a clear extra part and a strong ink line round one clear
silhouette. Fine detail that only shows at full size is the one way this
fails that looks fine at full size.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: tilted steeply at its fixed angle, about 71° up, mouth up and a little to the RIGHT, the pivot disc at the bottom.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: tilted steeply at its fixed angle, about 71° up, mouth up and a little to the RIGHT, the pivot disc at the bottom.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## bombard-t3 — Balloon Launcher — tier 3  (fixture-bombard-t3.png → images/fixtures/bombard-t3.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Balloon Launcher — tier 3 — ONE balloon launcher — the plain toy made fancier: the sticker, plus a third blue band on the tube and a bigger water balloon. Otherwise exactly the plain toy — the same parts, the same colours, the same pose. One toy. NOTHING else — no stand, no block, no ammunition flying, no spray or smoke.

THIS IS A MERGED WEAPON — tier 3: the SAME toy as the plain
`images/fixtures/bombard.webp`, made fancier again. Attach that
painting as well as the reference: it is the design. Same plastic, same
colours, same ink — and ONE toy, never two or three side by side. A merge
makes one block, so it carries one weapon.

KEEP ITS SIZE AND ITS PLACE. The reference is the plain toy’s own outline,
and the game makes a merged weapon bigger by itself; a painting that fills
more of the frame gets grown twice. Put the upgrade INSIDE that outline:
the stripe, the sticker and the extra part the reference shows.

THE TIER COLOUR IS BLUE, around #3fa2ff. It goes in the stripe and the
sticker the reference shows, and nowhere else: the toy keeps its own plastic
colours everywhere else, so it is still THIS toy.
This one accent may be brighter than the rest of the palette: it is how a
player tells a tier 3 from a tier 2 at a glance.

IT HAS TO READ AS THE UPGRADED TOY AT 40 PX. A chunky stripe, a bold
sticker, a clear extra part and a strong ink line round one clear
silhouette. Fine detail that only shows at full size is the one way this
fails that looks fine at full size.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: tilted steeply at its fixed angle, about 71° up, mouth up and a little to the RIGHT, the pivot disc at the bottom.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: tilted steeply at its fixed angle, about 71° up, mouth up and a little to the RIGHT, the pivot disc at the bottom.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## mortar-t2 — Mud Mortar — tier 2  (fixture-mortar-t2.png → images/fixtures/mortar-t2.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Mud Mortar — tier 2 — ONE mud mortar — the plain toy made fancier: a star sticker on the side of the bucket. Otherwise exactly the plain toy — the same parts, the same colours, the same pose. One toy. NOTHING else — no stand, no block, no ammunition flying, no spray or smoke.

THIS IS A MERGED WEAPON — tier 2: the SAME toy as the plain
`images/fixtures/mortar.webp`, made fancier. Attach that
painting as well as the reference: it is the design. Same plastic, same
colours, same ink — and ONE toy, never two or three side by side. A merge
makes one block, so it carries one weapon.

KEEP ITS SIZE AND ITS PLACE. The reference is the plain toy’s own outline,
and the game makes a merged weapon bigger by itself; a painting that fills
more of the frame gets grown twice. Put the upgrade INSIDE that outline:
the stripe, the sticker and the extra part the reference shows.

THE TIER COLOUR IS GREEN, around #46d86a. It goes in the stripe and the
sticker the reference shows, and nowhere else: the toy keeps its own plastic
colours everywhere else, so it is still THIS toy.
This one accent may be brighter than the rest of the palette: it is how a
player tells a tier 2 from a plain toy at a glance.

IT HAS TO READ AS THE UPGRADED TOY AT 40 PX. A chunky stripe, a bold
sticker, a clear extra part and a strong ink line round one clear
silhouette. Fine detail that only shows at full size is the one way this
fails that looks fine at full size.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: tilted at its fixed lobbing angle, about 56° up, mouth up and to the RIGHT, the pivot hub at the lower left.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: tilted at its fixed lobbing angle, about 56° up, mouth up and to the RIGHT, the pivot hub at the lower left.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## mortar-t3 — Mud Mortar — tier 3  (fixture-mortar-t3.png → images/fixtures/mortar-t3.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Mud Mortar — tier 3 — ONE mud mortar — the plain toy made fancier: the sticker, plus a yellow band around the bucket. Otherwise exactly the plain toy — the same parts, the same colours, the same pose. One toy. NOTHING else — no stand, no block, no ammunition flying, no spray or smoke.

THIS IS A MERGED WEAPON — tier 3: the SAME toy as the plain
`images/fixtures/mortar.webp`, made fancier again. Attach that
painting as well as the reference: it is the design. Same plastic, same
colours, same ink — and ONE toy, never two or three side by side. A merge
makes one block, so it carries one weapon.

KEEP ITS SIZE AND ITS PLACE. The reference is the plain toy’s own outline,
and the game makes a merged weapon bigger by itself; a painting that fills
more of the frame gets grown twice. Put the upgrade INSIDE that outline:
the stripe, the sticker and the extra part the reference shows.

THE TIER COLOUR IS BLUE, around #3fa2ff. It goes in the stripe and the
sticker the reference shows, and nowhere else: the toy keeps its own plastic
colours everywhere else, so it is still THIS toy.
This one accent may be brighter than the rest of the palette: it is how a
player tells a tier 3 from a tier 2 at a glance.

IT HAS TO READ AS THE UPGRADED TOY AT 40 PX. A chunky stripe, a bold
sticker, a clear extra part and a strong ink line round one clear
silhouette. Fine detail that only shows at full size is the one way this
fails that looks fine at full size.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: tilted at its fixed lobbing angle, about 56° up, mouth up and to the RIGHT, the pivot hub at the lower left.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: tilted at its fixed lobbing angle, about 56° up, mouth up and to the RIGHT, the pivot hub at the lower left.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## tesla-t2 — Bug Zapper — tier 2  (fixture-tesla-t2.png → images/fixtures/tesla-t2.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Bug Zapper — tier 2 — ONE bug zapper — the plain toy made fancier: a sticker on the base. Otherwise exactly the plain toy — the same parts, the same colours, the same pose. One toy. NOTHING else — no stand, no block, no ammunition flying, no spray or smoke.

THIS IS A MERGED WEAPON — tier 2: the SAME toy as the plain
`images/fixtures/tesla.webp`, made fancier. Attach that
painting as well as the reference: it is the design. Same plastic, same
colours, same ink — and ONE toy, never two or three side by side. A merge
makes one block, so it carries one weapon.

KEEP ITS SIZE AND ITS PLACE. The reference is the plain toy’s own outline,
and the game makes a merged weapon bigger by itself; a painting that fills
more of the frame gets grown twice. Put the upgrade INSIDE that outline:
the stripe, the sticker and the extra part the reference shows.

THE TIER COLOUR IS GREEN, around #46d86a. It goes in the stripe and the
sticker the reference shows, and nowhere else: the toy keeps its own plastic
colours everywhere else, so it is still THIS toy.
This one accent may be brighter than the rest of the palette: it is how a
player tells a tier 2 from a plain toy at a glance.

IT HAS TO READ AS THE UPGRADED TOY AT 40 PX. A chunky stripe, a bold
sticker, a clear extra part and a strong ink line round one clear
silhouette. Fine detail that only shows at full size is the one way this
fails that looks fine at full size.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: standing upright and symmetrical — it has no front and never turns.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: standing upright and symmetrical — it has no front and never turns.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## tesla-t3 — Bug Zapper — tier 3  (fixture-tesla-t3.png → images/fixtures/tesla-t3.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Bug Zapper — tier 3 — ONE bug zapper — the plain toy made fancier: the sticker, plus twin charge coils on the roof corners — pale rods topped with pale cyan balls. Otherwise exactly the plain toy — the same parts, the same colours, the same pose. One toy. NOTHING else — no stand, no block, no ammunition flying, no spray or smoke.

THIS IS A MERGED WEAPON — tier 3: the SAME toy as the plain
`images/fixtures/tesla.webp`, made fancier again. Attach that
painting as well as the reference: it is the design. Same plastic, same
colours, same ink — and ONE toy, never two or three side by side. A merge
makes one block, so it carries one weapon.

KEEP ITS SIZE AND ITS PLACE. The reference is the plain toy’s own outline,
and the game makes a merged weapon bigger by itself; a painting that fills
more of the frame gets grown twice. Put the upgrade INSIDE that outline:
the stripe, the sticker and the extra part the reference shows.

THE TIER COLOUR IS BLUE, around #3fa2ff. It goes in the stripe and the
sticker the reference shows, and nowhere else: the toy keeps its own plastic
colours everywhere else, so it is still THIS toy.
This one accent may be brighter than the rest of the palette: it is how a
player tells a tier 3 from a tier 2 at a glance.

IT HAS TO READ AS THE UPGRADED TOY AT 40 PX. A chunky stripe, a bold
sticker, a clear extra part and a strong ink line round one clear
silhouette. Fine detail that only shows at full size is the one way this
fails that looks fine at full size.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: standing upright and symmetrical — it has no front and never turns.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: standing upright and symmetrical — it has no front and never turns.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## frost-t2 — Ice Pop — tier 2  (fixture-frost-t2.png → images/fixtures/frost-t2.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Ice Pop — tier 2 — ONE ice pop — the plain toy made fancier: a stripe in the tier colour across the upper pop, and a sticker on the stick. Otherwise exactly the plain toy — the same parts, the same colours, the same pose. One toy. NOTHING else — no stand, no block, no ammunition flying, no spray or smoke.

THIS IS A MERGED WEAPON — tier 2: the SAME toy as the plain
`images/fixtures/frost.webp`, made fancier. Attach that
painting as well as the reference: it is the design. Same plastic, same
colours, same ink — and ONE toy, never two or three side by side. A merge
makes one block, so it carries one weapon.

KEEP ITS SIZE AND ITS PLACE. The reference is the plain toy’s own outline,
and the game makes a merged weapon bigger by itself; a painting that fills
more of the frame gets grown twice. Put the upgrade INSIDE that outline:
the stripe, the sticker and the extra part the reference shows.

THE TIER COLOUR IS GREEN, around #46d86a. It goes in the stripe and the
sticker the reference shows, and nowhere else: the toy keeps its own plastic
colours everywhere else, so it is still THIS toy.
This one accent may be brighter than the rest of the palette: it is how a
player tells a tier 2 from a plain toy at a glance.

IT HAS TO READ AS THE UPGRADED TOY AT 40 PX. A chunky stripe, a bold
sticker, a clear extra part and a strong ink line round one clear
silhouette. Fine detail that only shows at full size is the one way this
fails that looks fine at full size.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: standing upright on its stick, never turning.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: standing upright on its stick, never turning.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

---

## frost-t3 — Ice Pop — tier 3  (fixture-frost-t3.png → images/fixtures/frost-t3.webp)

```text
Repaint ONE toy, in a single square image.
The attached reference shows exactly WHAT to paint, at exactly the size and
position it is drawn at. Match both.

THE ATTACHED REFERENCE IS A FLAT COMPUTER DRAWING standing in for a painting
that does not exist yet. FOLLOW its shape, its pose, its size and place in the
frame, and its colours — and take nothing else from it: not its line weight,
its flat fills, its hard-edged shading or its finish. A return that looks like
the same drawing neatly traced is unusable, because the game already draws
exactly that. Paint it.

WHAT IT IS: Ice Pop — tier 3 — ONE ice pop — the plain toy made fancier: the stripe and the sticker, plus a crown of three ice-crystal diamonds above the top. Otherwise exactly the plain toy — the same parts, the same colours, the same pose. One toy. NOTHING else — no stand, no block, no ammunition flying, no spray or smoke.

THIS IS A MERGED WEAPON — tier 3: the SAME toy as the plain
`images/fixtures/frost.webp`, made fancier again. Attach that
painting as well as the reference: it is the design. Same plastic, same
colours, same ink — and ONE toy, never two or three side by side. A merge
makes one block, so it carries one weapon.

KEEP ITS SIZE AND ITS PLACE. The reference is the plain toy’s own outline,
and the game makes a merged weapon bigger by itself; a painting that fills
more of the frame gets grown twice. Put the upgrade INSIDE that outline:
the stripe, the sticker and the extra part the reference shows.

THE TIER COLOUR IS BLUE, around #3fa2ff. It goes in the stripe and the
sticker the reference shows, and nowhere else: the toy keeps its own plastic
colours everywhere else, so it is still THIS toy.
This one accent may be brighter than the rest of the palette: it is how a
player tells a tier 3 from a tier 2 at a glance.

IT HAS TO READ AS THE UPGRADED TOY AT 40 PX. A chunky stripe, a bold
sticker, a clear extra part and a strong ink line round one clear
silhouette. Fine detail that only shows at full size is the one way this
fails that looks fine at full size.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is pale sand
(around #f3dca8, #dcb676 and #ab7c42), so keep this toy in its own bright
plastic colours from the reference, with no large sand-coloured, beige or
tan areas — a wooden stick or a toothpick is fine, but it needs its ink
line. Keep the warm brown ink line strong all the way round the outside
so the shape holds on its own. A toy the colour and value of sand
disappears into the block, which is the one way this drawing can fail
that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no sand block, no plinth, no wall, no ground, no shadow. Draw only the
toy itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it is fixed on.

DRAW IT AT REST, EXACTLY AS THE REFERENCE POSES IT: standing upright on its stick, never turning.
The game never turns it, so do not tilt, re-angle or re-pose it.
Add no motion blur, sparks, splashes, smoke or muzzle spray: movement
painted in here is movement the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
toy inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
toy on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, in the same place.
· Keep the pose the reference has: standing upright on its stick, never turning.
· Do not rotate it or change the viewing angle.
· No cast shadow on the ground. The game draws its own.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.
```

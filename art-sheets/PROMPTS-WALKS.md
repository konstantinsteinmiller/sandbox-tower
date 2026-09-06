# Walk-cycle prompts — one monster design per generation

Generated from the manifest — do not hand-edit, re-export instead.

Attach the reference named in each block — `walk-<id>.png` for a cycle,
`siege-<id>.png` and `arm-<id>.png` for an engine, `hull-<id>.png` for a
ship — and paste the block beside it.
Most of these are a grid of panels showing ONE subject through ONE cycle,
and the whole job is that it comes back as one subject and not eight.

Drop results in `art-sheets/painted/`, keeping the `walk-<id>` in the name,
then run `pnpm slice-sheets`. The slicer cuts the grid by proportion, so an
off-size return is fine as long as the panels are where the grid says.

# grumpling — Grumpling  (images/monsters/grumpling.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces the viewer in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Grumpling — Cute-evil imp. All head, tiny body, permanently unimpressed.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# bonecap — Bonecap  (images/monsters/bonecap.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces the viewer in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Bonecap — Fungal undead. The mushroom is driving; the skeleton is the host.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# snaggletusk — Snaggletusk  (images/monsters/snaggletusk.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces LEFT in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Snaggletusk — Boar-beast. Low, heavy, forward — built to hit a wall and keep going.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# wispling — Wispling  (images/monsters/wispling.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces the viewer in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Wispling — Little lantern ghost. Endearing until you notice it never blinks together.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# marrowknight — Marrow Knight  (images/monsters/marrowknight.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces the viewer in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Marrow Knight — Armoured skeleton. Waiting, not lurching — the one that outranks the rest.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# nibbler — Nibbler  (images/monsters/nibbler.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces the viewer in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Nibbler — Cute-evil bat. Ninety per cent ears, and fully aware of it.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# cinderhound — Cinderhound  (images/monsters/cinderhound.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces LEFT in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Cinderhound — Burning hound. All legs and ribs — the fast one, and it is starving.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# blorp — Blorp  (images/monsters/blorp.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces the viewer in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Blorp — Swamp ooze. Delighted to see you; still digesting the last one.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# thornwick — Thornwick  (images/monsters/thornwick.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces the viewer in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Thornwick — Bramble treant. Slow, patient, and entirely made of thorns.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# rattlejack — Rattlejack  (images/monsters/rattlejack.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces the viewer in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Rattlejack — Scrap skeleton. A cooking pot for a helm and no plan whatsoever.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# dustmoth — Dustmoth  (images/monsters/dustmoth.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces the viewer in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Dustmoth — Plush moth. Adorable — and the spots on the wings are watching you.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# skewer — Skewer  (images/monsters/skewer.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces LEFT in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Skewer — Wyrmling. Small, fast, and almost entirely the pointy end.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# gloomcrow — Gloomcrow  (images/monsters/gloomcrow.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces the viewer in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Gloomcrow — Bone crow. Carrying something gold it did not find lying around.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the creature bobs when it walks.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# sliverfin — Sliverfin  (images/monsters/sliverfin.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces RIGHT in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Sliverfin — Reef eel. A ribbon with a mouth on the front, and it is always open.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

This one SWIMS. It has no feet and is centred on the middle of its body, so
keep it centred vertically in the panel exactly as the reference has it.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# gnashfin — Gnashfin  (images/monsters/gnashfin.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces RIGHT in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Gnashfin — Reefshark. Stiff through the shoulders, and everything else is teeth.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

This one SWIMS. It has no feet and is centred on the middle of its body, so
keep it centred vertically in the panel exactly as the reference has it.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# tidewyrm — Tidewyrm  (images/monsters/tidewyrm.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces RIGHT in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Tidewyrm — Sea dragon. Crested, whiskered, and the only thing down there with hands.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

This one SWIMS. It has no feet and is centred on the middle of its body, so
keep it centred vertically in the panel exactly as the reference has it.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# brinemaw — Brinemaw  (images/monsters/brinemaw.webp)

Repaint a WALK CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME creature at a different moment of one step.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical markings, identical number of limbs and
horns. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A creature that is blue-grey in one panel and tan in another is not one
  creature animated, it is several creatures side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the creature must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces RIGHT in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Brinemaw — Deep kraken. Hangs a little green light out and waits for company.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A creature does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

This one SWIMS. It has no feet and is centred on the middle of its body, so
keep it centred vertically in the panel exactly as the reference has it.

OUTPUT: one image, 1280 x 720 pixels (16:9). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# cavalry — Cavalry  (images/allies/cavalry.webp)

Repaint a GALLOP CYCLE. The attached sheet is 4 columns x 2 rows
= EXACTLY 8 panels, read left to right along the top row and then the
bottom row. Every panel is the SAME horse and rider at a different moment of ONE gallop stride.

· 8 panels. Not 12, not 24. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual:
identical colours, identical clothing and gear, identical proportions,
identical silhouette, identical livery, identical barding, harness and
heraldry. Only the POSE changes, and it changes exactly as the reference
shows — same limb positions, same body lean, same head angle.
· ONE colour scheme, taken from the reference, in every panel. A rider whose livery is blue in one panel and green in another is not one
  rider animated, it is several riders side by side, and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· Do not turn it to face a different direction in any panel.
· Do not re-scale it: the rider must be the same size in every panel, and the
  same size it is in the reference. Do not move it around inside its panel.
· It faces RIGHT in the reference. Keep that direction in all 8 panels.

WHAT IT IS: Cavalry — An armoured knight at full gallop on a barded warhorse — cool blue livery with gold trim, a caparison with a scalloped hem, a couched lance behind a vamplate, a heater shield and a plumed great helm. This is the player’s OWN unit and the only friendly body on the field: the blue has to say “mine” across the battlefield before any detail resolves, and it must never read as something to shoot at.

READ THE PANELS: One full gallop, four beats and a suspension. Panel 1 is the moment of suspension with every hoof clear of the ground and the body at its highest; the panels after it land near hind, far hind, far fore, near fore in that order, gathering under the horse and then extending. The lance, the shield and the rider’s seat stay put — it is the legs, the tail, the pennon and the plume that move.

Colour identity (keep the HUE, but muted and paper-toned, never vivid): body around #1f6aa8, shadows #123a5e, highlights #42a3e0, accent details #ffd93c.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
ONE correction to the style note above: "fills the square edge to edge" is for
building blocks and is WRONG here. A rider does NOT fill its panel — it is
centred in it, at the size the reference draws it, with clear magenta all round.
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
· The object itself must contain no magenta or hot pink.

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the rider bobs when it gallops.

OUTPUT: one image, 1440 x 720 pixels (2:1). If your
tool has an aspect-ratio control, set it to match. No labels or watermarks.

---

# ballista — Bolt Thrower  (images/siege/ballista.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Bolt Thrower — A wheeled bolt thrower: two cart wheels, a heavy timber frame and a stock. Draw the CARRIAGE ONLY — no bow, no arms, no bolt. The weapon is painted on separately in game and must not appear here.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 768 x 768 pixels (square, 1:1).
No labels, captions or watermarks.

---

# catapult — Catapult  (images/siege/catapult.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Catapult — A wheeled catapult carriage: two cart wheels, a squat braced timber frame, a winch drum. Draw the CARRIAGE ONLY — no throwing arm, no bowl, no stone. The arm is painted on separately in game.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 768 x 768 pixels (square, 1:1).
No labels, captions or watermarks.

---

# trebuchet — Trebuchet  (images/siege/trebuchet.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Trebuchet — A trebuchet standing FRAME: two cart wheels, a heavy A-frame of timbers with a cross axle at the top, ropes and a winch. Draw the FRAME ONLY — no throwing arm, no counterweight, no sling. The arm swings separately in game and must not appear here.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 768 x 768 pixels (square, 1:1).
No labels, captions or watermarks.

---

# ram — Battering Ram  (images/siege/ram.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Battering Ram — A battering ram SHED: two cart wheels, a low timber cart, two corner posts, and a pitched roof covered in stitched hide sloping down to the right, with a couple of spent arrows stuck in it. Draw the CART AND ROOF ONLY — no log, no ropes, no iron head. The log swings separately in game.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 768 x 768 pixels (square, 1:1).
No labels, captions or watermarks.

---

# ironRam — Iron Ram  (images/siege/ironRam.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Iron Ram — An armoured ram CASEMATE: two iron-shod wheels, an iron chassis beam, and a riveted steel box over it with a shallow sloped lid, plate seams, a riveted band along the eaves and a dark vision slit near the top right. Cold grey armour. Draw the BOX ONLY — no log, no ram head. The log slides out of it separately in game.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 768 x 768 pixels (square, 1:1).
No labels, captions or watermarks.

---

# siegeTower — Siege Tower  (images/siege/siegeTower.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Siege Tower — A rolling siege tower BODY: two cart wheels under a tall boxy timber tower, roughly planked in uneven horizontal boards with cross-bracing, and a stitched hide panel down the right-hand face against fire arrows. Draw the BODY ONLY — no ramp, no banner, no crew, no battlements on top. Those are all animated separately in game.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 768 x 768 pixels (square, 1:1).
No labels, captions or watermarks.

---

# ballista — Bolt Thrower arm  (images/siege-arms/ballista.webp)

WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A MACHINE.
One landscape image, 1440 x 720 pixels — twice as wide as it is tall —
holding 8 SEPARATE small drawings laid out 4 across and 2
down, on the same grid as the attached reference, read left to right along
the top row and then the bottom row. Each drawing is the same part at a
different moment of one shot.
· 8 panels. Not 1, not 6, not 16. Exactly 2 rows of 4 — do not add a row.
· ONE big drawing of a siege engine filling the canvas is the wrong answer
  however well it is painted, and so is a square canvas. That is what came
  back last time, and none of it could be used.

THIS IS A PART, NOT A MACHINE — read this before anything else.
It is one moving assembly, lifted off the war engine it belongs to. In the
game it is painted ON TOP of a separate carriage that already exists, so
the carriage must not be here as well.
· Draw ONLY what the reference shows in each panel, and nothing else.
· NO wheels. NO cart, bed or stock. NO chassis, frame, A-frame, base or
  stand. NO ground, no shadow, no scenery, no crew. If it is not in the
  reference panel, it is not in the picture.
· Do not complete it into a whole siege engine. Every panel is meant to
  look unfinished, like a part laid out on a bench — the missing half is
  painted separately, and anything you add here ends up doubled.
· The reference settles every argument about what belongs. If you are
  reaching for a part because the machine would "need" it to work, that
  part is already on the other layer.

WHAT IT IS: The bow assembly of a bolt thrower, lifted off its carriage and seen from the side: two upright torsion skeins — short ribbed drums of bound sinew — with one stiff timber arm sweeping out of each, the far arm a tone darker and set back behind the near one; the bowstring strung between the two arm tips; a heavy bolt lying dead level in front of the string, steel head to the RIGHT and cut-leather fletching at its tail; and away to the LEFT, clear of the rest, the windlass that draws it — a small dark timber block with an iron crank handle. NOTHING else: no wheels, no carriage, no bed, no stock, no upright frame, no ground. The two arms are separate straight timbers and the string is two straight runs meeting at the nock: do NOT draw one curved bow limb from tip to tip, and do not outline the assembly with a bow shape.

READ THE PANELS: Panel 1 is the instant AFTER the loose — the bolt is gone, the string has been thrown forward and the two arms are sprung wide apart, one up and one down. Panels 2 to 6 are the crew winding it back: a fresh bolt lies ready, the string comes further back in each panel and the arms close towards each other. Panels 7 and 8 are held at full draw, loaded and dead still, both arms nearly level and pointing right — those two are all but identical. Every panel except the first has the bolt in it.

Colour identity (keep the HUE, but muted and paper-toned, never vivid): body around #705027, shadows #3d2c18, highlights #a37a42, accent details #b8bcc4.
It is the same machine as the ballista carriage sheet, which is painted
from this palette too and is what this part gets laid on top of. Side
by side the two have to look like one object: the same timber, the same
iron, the same age of wear. Pale straw, driftwood or bleached wood is
the wrong tree.

THE VIEW — a flat side elevation, square on from the side, the way a
woodcut or a joiner’s drawing shows a machine.
· NO three-quarter view, no perspective, no vanishing point, no
  foreshortening, no tilt. Nothing turns to face the viewer, and no part
  is nearer the eye than another.
· Every timber keeps the angle the reference draws it at.

ONE MECHANISM.
All 8 panels are the same assembly at a different moment of one
shot. Identical timbers, identical ironwork, identical rope, identical
proportions and identical thickness in every panel. Only the POSE changes —
the beam swings, the string draws, the weight falls — and it changes exactly
as the reference shows it, panel for panel.
· ONE colour scheme, taken from the reference, in all of them.
· Do not re-scale it between panels, and do not re-scale it from the
  reference: it has to keep meeting a carriage it cannot see.
· It faces RIGHT in the reference. Keep that direction throughout.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
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
reference the assembly spans a little over half the panel’s width — about 55%, and never more than two thirds even in panel 2 where the bolt is at full stretch — and about two fifths of its height.
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
· The object itself must contain no magenta or hot pink.
· The muted, dusty, low-contrast palette above is for the OBJECT. The
  ground is not part of the painting and is not toned down with it: it
  stays a vivid, eye-hurting #FF00FF however soft everything else is.
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

---

# catapult — Catapult arm  (images/siege-arms/catapult.webp)

WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A MACHINE.
One landscape image, 1440 x 720 pixels — twice as wide as it is tall —
holding 8 SEPARATE small drawings laid out 4 across and 2
down, on the same grid as the attached reference, read left to right along
the top row and then the bottom row. Each drawing is the same part at a
different moment of one shot.
· 8 panels. Not 1, not 6, not 16. Exactly 2 rows of 4 — do not add a row.
· ONE big drawing of a siege engine filling the canvas is the wrong answer
  however well it is painted, and so is a square canvas. That is what came
  back last time, and none of it could be used.

THIS IS A PART, NOT A MACHINE — read this before anything else.
It is one moving assembly, lifted off the war engine it belongs to. In the
game it is painted ON TOP of a separate carriage that already exists, so
the carriage must not be here as well.
· Draw ONLY what the reference shows in each panel, and nothing else.
· NO wheels. NO cart, bed or stock. NO chassis, frame, A-frame, base or
  stand. NO ground, no shadow, no scenery, no crew. If it is not in the
  reference panel, it is not in the picture.
· Do not complete it into a whole siege engine. Every panel is meant to
  look unfinished, like a part laid out on a bench — the missing half is
  painted separately, and anything you add here ends up doubled.
· The reference settles every argument about what belongs. If you are
  reaching for a part because the machine would "need" it to work, that
  part is already on the other layer.

WHAT IT IS: The throwing arm of a catapult, lifted off its carriage and seen from the side: ONE squared baulk of heavy dark timber — a single beam, not a bundle of canes, poles or reeds and not a rolled mat — bound with two iron straps, a shallow bowl at its outer end, and the winch rope trailing from it. NOTHING else: no wheels, no carriage, no frame, no buffer, no ground.

READ THE PANELS: Panel 1 is the instant after the throw — the beam has slammed up and forward against its stop, bowl empty and over to the RIGHT. Panels 2 to 6 are the crew winching it back down: the beam swings up through the vertical (panel 4 is near-upright) and on over to the rear. Panels 7 and 8 are cocked and still, the beam lying back and low with the bowl over the tail at the LEFT, and only the last panel has a stone in it.

Colour identity (keep the HUE, but muted and paper-toned, never vivid): body around #68431f, shadows #382412, highlights #9a6733, accent details #c07a2a.
It is the same machine as the catapult carriage sheet, which is painted
from this palette too and is what this part gets laid on top of. Side
by side the two have to look like one object: the same timber, the same
iron, the same age of wear. Pale straw, driftwood or bleached wood is
the wrong tree.

THE VIEW — a flat side elevation, square on from the side, the way a
woodcut or a joiner’s drawing shows a machine.
· NO three-quarter view, no perspective, no vanishing point, no
  foreshortening, no tilt. Nothing turns to face the viewer, and no part
  is nearer the eye than another.
· Every timber keeps the angle the reference draws it at.

ONE MECHANISM.
All 8 panels are the same assembly at a different moment of one
shot. Identical timbers, identical ironwork, identical rope, identical
proportions and identical thickness in every panel. Only the POSE changes —
the beam swings, the string draws, the weight falls — and it changes exactly
as the reference shows it, panel for panel.
· ONE colour scheme, taken from the reference, in all of them.
· Do not re-scale it between panels, and do not re-scale it from the
  reference: it has to keep meeting a carriage it cannot see.
· It faces RIGHT in the reference. Keep that direction throughout.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
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
reference the beam spans about two fifths of the panel’s width — 43% at its longest, in panel 1 — and never more than half. It never covers more than about a third of the panel’s height.
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
· The object itself must contain no magenta or hot pink.
· The muted, dusty, low-contrast palette above is for the OBJECT. The
  ground is not part of the painting and is not toned down with it: it
  stays a vivid, eye-hurting #FF00FF however soft everything else is.
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

---

# trebuchet — Trebuchet arm  (images/siege-arms/trebuchet.webp)

WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A MACHINE.
One landscape image, 1440 x 720 pixels — twice as wide as it is tall —
holding 8 SEPARATE small drawings laid out 4 across and 2
down, on the same grid as the attached reference, read left to right along
the top row and then the bottom row. Each drawing is the same part at a
different moment of one shot.
· 8 panels. Not 1, not 6, not 16. Exactly 2 rows of 4 — do not add a row.
· ONE big drawing of a siege engine filling the canvas is the wrong answer
  however well it is painted, and so is a square canvas. That is what came
  back last time, and none of it could be used.

THIS IS A PART, NOT A MACHINE — read this before anything else.
It is one moving assembly, lifted off the war engine it belongs to. In the
game it is painted ON TOP of a separate carriage that already exists, so
the carriage must not be here as well.
· Draw ONLY what the reference shows in each panel, and nothing else.
· NO wheels. NO cart, bed or stock. NO chassis, frame, A-frame, base or
  stand. NO ground, no shadow, no scenery, no crew. If it is not in the
  reference panel, it is not in the picture.
· Do not complete it into a whole siege engine. Every panel is meant to
  look unfinished, like a part laid out on a bench — the missing half is
  painted separately, and anything you add here ends up doubled.
· The reference settles every argument about what belongs. If you are
  reaching for a part because the machine would "need" it to work, that
  part is already on the other layer.

WHAT IT IS: The throwing assembly of a trebuchet, lifted off its frame and seen from the side: one long timber beam pivoting nearer one end, a heavy boxed counterweight hanging off the short end on its own pin so it stays upright however far the beam has swung, and a two-cord sling trailing from the long end. NOTHING else: no wheels, no carriage, no A-frame, no ground.

READ THE PANELS: Panel 1 is the instant after the release — the long end is thrown up to the RIGHT with the empty sling streaming out past it and the counterweight box down at the LEFT. Panels 2 to 4 wind it back: the long end rises to straight up (panel 4) while the box comes up under the pivot. Panels 5 and 6 carry it on over, and panels 7 and 8 are cocked and still — counterweight raised at the RIGHT, long end down at the LEFT with the sling hanging slack below it, and the stone loaded in the pouch in the last panel only.

Colour identity (keep the HUE, but muted and paper-toned, never vivid): body around #574024, shadows #2e2314, highlights #856439, accent details #6a8fbf.
It is the same machine as the trebuchet carriage sheet, which is painted
from this palette too and is what this part gets laid on top of. Side
by side the two have to look like one object: the same timber, the same
iron, the same age of wear. Pale straw, driftwood or bleached wood is
the wrong tree.

THE VIEW — a flat side elevation, square on from the side, the way a
woodcut or a joiner’s drawing shows a machine.
· NO three-quarter view, no perspective, no vanishing point, no
  foreshortening, no tilt. Nothing turns to face the viewer, and no part
  is nearer the eye than another.
· Every timber keeps the angle the reference draws it at.

ONE MECHANISM.
All 8 panels are the same assembly at a different moment of one
shot. Identical timbers, identical ironwork, identical rope, identical
proportions and identical thickness in every panel. Only the POSE changes —
the beam swings, the string draws, the weight falls — and it changes exactly
as the reference shows it, panel for panel.
· ONE colour scheme, taken from the reference, in all of them.
· Do not re-scale it between panels, and do not re-scale it from the
  reference: it has to keep meeting a carriage it cannot see.
· It faces RIGHT in the reference. Keep that direction throughout.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
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
reference beam, counterweight and sling together span about half the panel’s width — 52% at most — and a little over half its height in the tallest panel.
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
· The object itself must contain no magenta or hot pink.
· The muted, dusty, low-contrast palette above is for the OBJECT. The
  ground is not part of the painting and is not toned down with it: it
  stays a vivid, eye-hurting #FF00FF however soft everything else is.
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

---

# skiff — Skiff hull  (images/ships/skiff.webp)

Repaint ONE ship, in a single landscape image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Skiff hull — A small single-masted clinker-built timber boat, seen side-on and facing RIGHT: a shallow raked hull of overlapping planks, a gunwale rail along the sheer, and a stubby mast well aft carrying a scrap of blue livery sail. Cut off flat at the waterline.

Colour identity (keep the HUE, but muted and paper-toned, never vivid): body around #7d5c34, shadows #4a3520, highlights #b2874d, accent details #3f7fbf.

DRAW ONLY WHAT THE REFERENCE SHOWS. A ship here is a BASE for a weapon,
the same way a block is: the deck weapon — the swivel bolt-thrower, the
harpoon, the bombards — aims at whatever the ship is shooting at, so it
is drawn live on top of this and must NOT be painted in. Everything the
reference does show stays, sail and oars and shields included.

THE WATERLINE IS THE BOTTOM EDGE OF THE IMAGE. The hull runs straight
off the bottom of the frame and is cut flat by it, exactly as the
reference is — the game draws the water, the wake and the reflection
below that edge, and the boat sits down into them. So paint no water,
no foam, no ripples, no shadow, no reflection and no waterline of your
own, and leave no margin under the hull: the last row of pixels in the
image is planking, not background.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
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
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 960 x 732 pixels — landscape, and NOT square.
If your tool has an aspect-ratio control, set it to match: a square
return squashes the hull and puts the waterline in the wrong place.
No labels, captions or watermarks.

---

# longship — Longship hull  (images/ships/longship.webp)

Repaint ONE ship, in a single landscape image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Longship hull — A lean clinker-built longship, seen side-on and facing RIGHT: overlapping planks, a carved stem-post curling over the bow, a row of round shields hung along the sheer in red livery, four oars out, and a mast amidships with a red sail. Cut off flat at the waterline.

Colour identity (keep the HUE, but muted and paper-toned, never vivid): body around #755331, shadows #42301f, highlights #a87d49, accent details #c1543f.

DRAW ONLY WHAT THE REFERENCE SHOWS. A ship here is a BASE for a weapon,
the same way a block is: the deck weapon — the swivel bolt-thrower, the
harpoon, the bombards — aims at whatever the ship is shooting at, so it
is drawn live on top of this and must NOT be painted in. Everything the
reference does show stays, sail and oars and shields included.

THE WATERLINE IS THE BOTTOM EDGE OF THE IMAGE. The hull runs straight
off the bottom of the frame and is cut flat by it, exactly as the
reference is — the game draws the water, the wake and the reflection
below that edge, and the boat sits down into them. So paint no water,
no foam, no ripples, no shadow, no reflection and no waterline of your
own, and leave no margin under the hull: the last row of pixels in the
image is planking, not background.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
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
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 960 x 732 pixels — landscape, and NOT square.
If your tool has an aspect-ratio control, set it to match: a square
return squashes the hull and puts the waterline in the wrong place.
No labels, captions or watermarks.

---

# galley — War Galley hull  (images/ships/galley.webp)

Repaint ONE ship, in a single landscape image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: War Galley hull — A broad oared warship, seen side-on and facing RIGHT: a heavy planked hull, a bronze ram at the waterline on the bow, an armoured bulwark along the sheer with a row of shields above it, a timber fighting castle aft with battlements, five oars out, and a mast with a yellow livery sail. Cut off flat at the waterline.

Colour identity (keep the HUE, but muted and paper-toned, never vivid): body around #665534, shadows #38301f, highlights #96814f, accent details #d8a12c.

DRAW ONLY WHAT THE REFERENCE SHOWS. A ship here is a BASE for a weapon,
the same way a block is: the deck weapon — the swivel bolt-thrower, the
harpoon, the bombards — aims at whatever the ship is shooting at, so it
is drawn live on top of this and must NOT be painted in. Everything the
reference does show stays, sail and oars and shields included.

THE WATERLINE IS THE BOTTOM EDGE OF THE IMAGE. The hull runs straight
off the bottom of the frame and is cut flat by it, exactly as the
reference is — the game draws the water, the wake and the reflection
below that edge, and the boat sits down into them. So paint no water,
no foam, no ripples, no shadow, no reflection and no waterline of your
own, and leave no margin under the hull: the last row of pixels in the
image is planking, not background.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
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
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 960 x 732 pixels — landscape, and NOT square.
If your tool has an aspect-ratio control, set it to match: a square
return squashes the hull and puts the waterline in the wrong place.
No labels, captions or watermarks.

---

# cannon — Cannon barrel  (images/fixtures/cannon.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Cannon barrel — A cast-iron cannon barrel on its trunnions, lying dead level and pointing RIGHT: a fat breech and cascabel at the left end, two reinforcing rings, a swell at the muzzle. NOTHING else — no carriage, no wheels, no block, no smoke, no ball.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is painted
around #565c64 and its neighbouring tones, so do NOT
paint this part in those colours: pick materials that separate from
them — cold iron and steel, dark oiled
timber, blackened rope, a cool shadow side — and keep the ink line
strong enough to hold the shape on its own. A part in the same hue and
the same value as the block underneath disappears into it, which is
the one way this drawing can fail that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no crate, no stone face, no wall, no ground, no shadow. Draw only the
part itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it bolts on.

DRAW IT AT REST, level and pointing RIGHT, exactly as the reference
has it. The game turns it to its own firing angle out of this one
picture, so do not draw it already aimed, angled, tilted or
mid-swing, and add no motion blur, sparks, smoke or muzzle flash: a
tilt painted in here is a tilt the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
crystal inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.

---

# archer — Archery bow  (images/fixtures/archer.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Archery bow — A war bow seen side-on, drawn and level, pointing RIGHT: two recurved limbs meeting at a wrapped grip, the string back at full draw with a nocked arrow on it. NOTHING else — no parapet, no merlons, no archer, no block.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is painted
around #8a6a3a and its neighbouring tones, so do NOT
paint this part in those colours: pick materials that separate from
them — cold iron and steel, dark oiled
timber, blackened rope, a cool shadow side — and keep the ink line
strong enough to hold the shape on its own. A part in the same hue and
the same value as the block underneath disappears into it, which is
the one way this drawing can fail that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no crate, no stone face, no wall, no ground, no shadow. Draw only the
part itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it bolts on.

DRAW IT AT REST, level and pointing RIGHT, exactly as the reference
has it. The game turns it to its own firing angle out of this one
picture, so do not draw it already aimed, angled, tilted or
mid-swing, and add no motion blur, sparks, smoke or muzzle flash: a
tilt painted in here is a tilt the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
crystal inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.

---

# mortar — Mortar tube  (images/fixtures/mortar.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Mortar tube — A squat siege mortar tube on its bed, elevated at a steep fixed angle to lob over a wall, mouth up and to the RIGHT: a short fat bore, heavy trunnion straps, a scorched muzzle. NOTHING else — no block, no crew, no shell, no smoke.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is painted
around #5f5f6e and its neighbouring tones, so do NOT
paint this part in those colours: pick materials that separate from
them — cold iron and steel, dark oiled
timber, blackened rope, a cool shadow side — and keep the ink line
strong enough to hold the shape on its own. A part in the same hue and
the same value as the block underneath disappears into it, which is
the one way this drawing can fail that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no crate, no stone face, no wall, no ground, no shadow. Draw only the
part itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it bolts on.

DRAW IT AT REST, level and pointing RIGHT, exactly as the reference
has it. The game turns it to its own firing angle out of this one
picture, so do not draw it already aimed, angled, tilted or
mid-swing, and add no motion blur, sparks, smoke or muzzle flash: a
tilt painted in here is a tilt the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
crystal inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.

---

# bombard — Bombard barrel  (images/fixtures/bombard.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Bombard barrel — A stubby wrought-iron bombard, elevated to lob, mouth up and to the RIGHT: a thick banded barrel bound with hoops along its whole length, wider at the mouth than at the breech. NOTHING else — no block, no carriage, no shot.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is painted
around #5c564e and its neighbouring tones, so do NOT
paint this part in those colours: pick materials that separate from
them — cold iron and steel, dark oiled
timber, blackened rope, a cool shadow side — and keep the ink line
strong enough to hold the shape on its own. A part in the same hue and
the same value as the block underneath disappears into it, which is
the one way this drawing can fail that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no crate, no stone face, no wall, no ground, no shadow. Draw only the
part itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it bolts on.

DRAW IT AT REST, level and pointing RIGHT, exactly as the reference
has it. The game turns it to its own firing angle out of this one
picture, so do not draw it already aimed, angled, tilted or
mid-swing, and add no motion blur, sparks, smoke or muzzle flash: a
tilt painted in here is a tilt the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
crystal inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.

---

# tesla — Arc coil  (images/fixtures/tesla.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Arc coil — A lightning coil standing upright: an iron post wound with copper wire, a polished ball terminal on top, ceramic insulators at its foot and a faint cool blue charge glow around the terminal. Symmetrical — it has no front. NOTHING else — no arc, no bolt, no block.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is painted
around #33507a and its neighbouring tones, so do NOT
paint this part in those colours: pick materials that separate from
them — cold iron and steel, dark oiled
timber, blackened rope, a cool shadow side — and keep the ink line
strong enough to hold the shape on its own. A part in the same hue and
the same value as the block underneath disappears into it, which is
the one way this drawing can fail that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no crate, no stone face, no wall, no ground, no shadow. Draw only the
part itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it bolts on.

DRAW IT AT REST, level and pointing RIGHT, exactly as the reference
has it. The game turns it to its own firing angle out of this one
picture, so do not draw it already aimed, angled, tilted or
mid-swing, and add no motion blur, sparks, smoke or muzzle flash: a
tilt painted in here is a tilt the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
crystal inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.

---

# frost — Frost emitter  (images/fixtures/frost.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Frost emitter — A cluster of pale blue ice crystals growing from a rimed iron socket, tallest in the middle, with hoar frost creeping up their facets. Symmetrical — it has no front. NOTHING else — no mist, no projectile, no block.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is painted
around #356577 and its neighbouring tones, so do NOT
paint this part in those colours: pick materials that separate from
them — cold iron and steel, dark oiled
timber, blackened rope, a cool shadow side — and keep the ink line
strong enough to hold the shape on its own. A part in the same hue and
the same value as the block underneath disappears into it, which is
the one way this drawing can fail that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no crate, no stone face, no wall, no ground, no shadow. Draw only the
part itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it bolts on.

DRAW IT AT REST, level and pointing RIGHT, exactly as the reference
has it. The game turns it to its own firing angle out of this one
picture, so do not draw it already aimed, angled, tilted or
mid-swing, and add no motion blur, sparks, smoke or muzzle flash: a
tilt painted in here is a tilt the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
crystal inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.

---

# stonepit — Stone pit heap  (images/fixtures/stonepit.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Stone pit heap — A heap of three rounded pale stones with a quarryman’s pick held raised over them, angled back ready to strike down and to the LEFT: a dark timber haft and a curved iron head. NOTHING else: no block, no ground, no dust.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no crate, no stone face, no wall, no ground, no shadow. Draw only the
part itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it bolts on.

DRAW IT AT REST, level and pointing RIGHT, exactly as the reference
has it. The game turns it to its own firing angle out of this one
picture, so do not draw it already aimed, angled, tilted or
mid-swing, and add no motion blur, sparks, smoke or muzzle flash: a
tilt painted in here is a tilt the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
crystal inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.

---

# banner — Hanging banner  (images/fixtures/banner.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Hanging banner — A cloth banner hanging from a cross-staff, held in a gentle curve as if in a light breeze: deep rose cloth with a gilt edge and a swallow-tailed hem. NOTHING else: no pole below the hem, no block, no wall.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is painted
around #6f3059 and its neighbouring tones, so do NOT
paint this part in those colours: pick materials that separate from
them — cold iron and steel, dark oiled
timber, blackened rope, a cool shadow side — and keep the ink line
strong enough to hold the shape on its own. A part in the same hue and
the same value as the block underneath disappears into it, which is
the one way this drawing can fail that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no crate, no stone face, no wall, no ground, no shadow. Draw only the
part itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it bolts on.

DRAW IT AT REST, level and pointing RIGHT, exactly as the reference
has it. The game turns it to its own firing angle out of this one
picture, so do not draw it already aimed, angled, tilted or
mid-swing, and add no motion blur, sparks, smoke or muzzle flash: a
tilt painted in here is a tilt the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
crystal inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.

---

# obelisk — Arcane spire  (images/fixtures/obelisk.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Arcane spire — A tapered standing stone with a pale blue seam of glyphs lit up its face, floating just clear of its base. NOTHING else: no block, no ground, no beam of light.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is painted
around #3f3a63 and its neighbouring tones, so do NOT
paint this part in those colours: pick materials that separate from
them — cold iron and steel, dark oiled
timber, blackened rope, a cool shadow side — and keep the ink line
strong enough to hold the shape on its own. A part in the same hue and
the same value as the block underneath disappears into it, which is
the one way this drawing can fail that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no crate, no stone face, no wall, no ground, no shadow. Draw only the
part itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it bolts on.

DRAW IT AT REST, level and pointing RIGHT, exactly as the reference
has it. The game turns it to its own firing angle out of this one
picture, so do not draw it already aimed, angled, tilted or
mid-swing, and add no motion blur, sparks, smoke or muzzle flash: a
tilt painted in here is a tilt the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
crystal inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.

---

# lumberHut — Lumber hut roof  (images/fixtures/lumberHut.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Lumber hut roof — A steep shingled roof over stacked cut logs, with a thin curl of smoke rising from the ridge. NOTHING else: no block, no walls, no axe, no ground.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no crate, no stone face, no wall, no ground, no shadow. Draw only the
part itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it bolts on.

DRAW IT AT REST, level and pointing RIGHT, exactly as the reference
has it. The game turns it to its own firing angle out of this one
picture, so do not draw it already aimed, angled, tilted or
mid-swing, and add no motion blur, sparks, smoke or muzzle flash: a
tilt painted in here is a tilt the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
crystal inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.

---

# coffer — Open coffer  (images/fixtures/coffer.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Open coffer — An iron-banded strongbox with its lid held ajar and gold coins spilling over the near edge. NOTHING else: no block, no pedestal, no ground.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no crate, no stone face, no wall, no ground, no shadow. Draw only the
part itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it bolts on.

DRAW IT AT REST, level and pointing RIGHT, exactly as the reference
has it. The game turns it to its own firing angle out of this one
picture, so do not draw it already aimed, angled, tilted or
mid-swing, and add no motion blur, sparks, smoke or muzzle flash: a
tilt painted in here is a tilt the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
crystal inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.

---

# repair — Repair crane  (images/fixtures/repair.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Repair crane — A slim timber crane arm with an iron hook and a lit amber lamp at its head, angled up and to the RIGHT. NOTHING else: no block, no rope to the ground, no scaffolding.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is painted
around #356b52 and its neighbouring tones, so do NOT
paint this part in those colours: pick materials that separate from
them — cold iron and steel, dark oiled
timber, blackened rope, a cool shadow side — and keep the ink line
strong enough to hold the shape on its own. A part in the same hue and
the same value as the block underneath disappears into it, which is
the one way this drawing can fail that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no crate, no stone face, no wall, no ground, no shadow. Draw only the
part itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it bolts on.

DRAW IT AT REST, level and pointing RIGHT, exactly as the reference
has it. The game turns it to its own firing angle out of this one
picture, so do not draw it already aimed, angled, tilted or
mid-swing, and add no motion blur, sparks, smoke or muzzle flash: a
tilt painted in here is a tilt the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
crystal inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.

---

# spikes — Iron spikes  (images/fixtures/spikes.webp)

Repaint ONE machine, in a single square image.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: Iron spikes — A row of forged iron spikes on a bolted rail, points up, uneven in height and pitted with rust. Symmetrical — it has no front. NOTHING else — no block, no blood, no ground.

IT MUST READ AGAINST THE BLOCK IT SITS ON. That block is painted
around #6d6862 and its neighbouring tones, so do NOT
paint this part in those colours: pick materials that separate from
them — cold iron and steel, dark oiled
timber, blackened rope, a cool shadow side — and keep the ink line
strong enough to hold the shape on its own. A part in the same hue and
the same value as the block underneath disappears into it, which is
the one way this drawing can fail that looks fine on its own sheet.

THIS IS ONE PART OF A BLOCK, ON ITS OWN. In the game it is painted on
top of a block that is already there, so the block must not be here:
no crate, no stone face, no wall, no ground, no shadow. Draw only the
part itself, floating on the magenta exactly where the reference has
it — where it sits in the frame is where it bolts on.

DRAW IT AT REST, level and pointing RIGHT, exactly as the reference
has it. The game turns it to its own firing angle out of this one
picture, so do not draw it already aimed, angled, tilted or
mid-swing, and add no motion blur, sparks, smoke or muzzle flash: a
tilt painted in here is a tilt the game adds its own on top of.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the
background is measured as part of the object when the return is fitted
back onto the reference — a wide aura therefore comes back as a tiny
crystal inside a huge smear. It also cannot be keyed: soft light over
magenta turns pink rather than transparent. Any glow belongs inside
the shape’s own outline, or within a hair of it.

DRAW ONLY WHAT THE REFERENCE SHOWS. The moving weapon — the arm, the bow,
the counterweight, the sling — is painted separately and animated on top of
this in the game. If you add one here the machine ends up with two.
Anything the reference DOES show, including ammunition stacked on the bed,
stays.

STYLE — cozy hand-drawn medieval fantasy, like a page from an illustrated
storybook or a hand-painted board game. Match this in every square:
· INK FIRST. Visible hand-drawn contour lines in dark warm brown, slightly
  sketchy and uneven, with the line weight varying like a real pen. The
  drawing should look drawn, with the linework still showing.
· FLAT WATERCOLOUR WASHES inside the lines — chalky, softly mottled, a little
  uneven, with the texture of paint on paper. Minimal gradients, no gloss, no
  specular highlights, no rendered 3D volume.
· MUTED, DUSTY, PAPER-TONED colour. Desaturated and gentle: sage green, dusty
  blue, faded brick, weathered tan, soft warm grey. Aged and lived-in.
· LOW CONTRAST and warm overall, as if painted in ink and watercolour. Any
  paper tooth belongs to the OBJECT itself — never paint a sheet of
  paper, a parchment card or a cream backdrop behind it.
· Honest, slightly naive craft — charming rather than slick.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No shiny highlights, no
  smooth 3D-rendered shading, no bevelled plastic edges.
· NO saturated, candy-bright colour. If it looks vivid, it is wrong.
· NO heavy uniform black outlines and no hard cel-shaded banding.
· NO cold grey, gritty, weathered-industrial or grimdark look.
· NO frames, borders, cards, vignettes, matting or paper background inside a
  square. The object itself fills the square edge to edge, corner to corner.
· Do not invent content for a square that is blank. Leave it blank.
· Keep each object the same subject and silhouette it already has. This is a
  restyle, not a redesign.

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. The reference leaves air around the
machine on every side and that air is not waste — it
is where the parts that animate get drawn. Keep the subject the same
fraction of the frame that the reference has it, and standing on the same
line: the wheels and feet must sit at the same height from the bottom edge.
· It faces RIGHT in the reference. Keep that direction.
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
· The object itself must contain no magenta or hot pink.

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1).
No labels, captions or watermarks.

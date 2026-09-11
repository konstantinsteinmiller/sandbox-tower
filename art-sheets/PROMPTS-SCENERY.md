# Scenery prompts — the landscape

Generated from `src/game/artSheet.ts` — do not hand-edit. Run `pnpm art:prompts`
(or export from the `/art-sheets` bench) after changing the manifest.

These are NOT on the 128 lattice and have no reference image. Attach one
of your finished BLOCK bitmaps as a style reference alongside the prompt,
so the landscape is painted by the same hand as the tower standing on it.

Drop results in `art-sheets/painted/`, named after the file in each
heading (e.g. `bg-mountains-far.png`), then run `pnpm slice-sheets`.

Copy only the fenced block. The `##` heading is for you, not the model: it
names the image the block belongs to (the reference to attach, and the name
to save the return under) and, after the arrow, where the slice lands under
`public/`. `pnpm art:desk` finds any block by sprite name, copies reference
and prompt in one go, and files, slices and compresses the return.

## sun  (bg-sun.png → images/bg/sun.webp)

```text
Paint one background element for a cozy medieval-fantasy tower-defence game.

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

WHAT IT IS: The sun: a warm disc with a soft ray fan around it, sitting with pure magenta #FF00FF everywhere around it. It is drawn high in a daytime sky, so it wants to feel gentle and golden rather than blinding.

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

One object, centred in the frame.

OUTPUT: exactly 512 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## moon  (bg-moon.png → images/bg/moon.webp)

```text
Paint one background element for a cozy medieval-fantasy tower-defence game.

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

WHAT IT IS: The moon: a pale cratered disc with a soft, narrow halo close around its rim. Calm and cool, but still warm-toned in its shadows. Keep the halo tight — a wide glow blends into the background and has to be reconstructed.

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

One object, centred in the frame.

OUTPUT: exactly 512 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## conifer  (bg-conifer.png → images/bg/conifer.webp)

```text
Paint one background element for a cozy medieval-fantasy tower-defence game.

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

WHAT IT IS: A single spruce, standing upright, whole tree from root to tip, with pure magenta #FF00FF everywhere around it. It is repeated across a distant tree line at about 30 px tall, so the SILHOUETTE has to carry it — a notched, tiered canopy rather than fine needles.

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

One object, centred in the frame.

OUTPUT: exactly 384 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## broadleaf  (bg-broadleaf.png → images/bg/broadleaf.webp)

```text
Paint one background element for a cozy medieval-fantasy tower-defence game.

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

WHAT IT IS: A single round-crowned broadleaf tree, whole, upright, with pure magenta #FF00FF everywhere around it. It stands next to the spruce in the same tree line and must not read as the same shape at distance.

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

One object, centred in the frame.

OUTPUT: exactly 384 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## mountains-far  (bg-mountains-far.png → images/bg/mountains-far.webp)

```text
Paint one background element for a cozy medieval-fantasy tower-defence game.

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

WHAT IT IS: The FAR mountain range: a pale, hazy ridge line of peaks with a little snow on the highest tops, fading toward the sky. Solid magenta sky above the ridge line, opaque artwork below it — the near range and the forest are drawn over the bottom of this band. It is the most distant thing in the scene, so keep it low-contrast and blue-grey; detail here competes with the tower.

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

```text
Paint one background element for a cozy medieval-fantasy tower-defence game.

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

WHAT IT IS: The NEAR mountain range: darker, heavier peaks with more defined rock faces, standing in front of the far range. Solid magenta sky above the ridge line, opaque artwork below. Still background — richer than the far range, but it must sit behind the tower rather than compete with it.

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

```text
Paint one background element for a cozy medieval-fantasy tower-defence game.

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

WHAT IT IS: The meadow the enemies walk across: a long, LOW band of grass seen slightly from above, with tufts, a few small stones and gentle tonal variation. Fully opaque, top to bottom. It is drawn as a thin strip only about 25 px tall on screen, so keep the detail broad — fine blades disappear. Units walk ON it, and busy grass makes a walking enemy hard to see.

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

```text
Paint one background element for a cozy medieval-fantasy tower-defence game.

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

WHAT IT IS: The lake in front of the tower: calm water with soft horizontal ripple bands, darkening toward the bottom. Fully opaque. The tower is mirrored on top of this by the engine, so keep the surface quiet and avoid strong highlights that would fight the reflection.

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

```text
Paint one background element for a cozy medieval-fantasy tower-defence game.

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

WHAT IT IS: A roof GABLE seen straight on from the front: a simple pitched roof, deep red clay tiles or shingles, with eaves overhanging a little at each side and a visible ridge line. No walls, no building under it — just the roof, as if lifted off a house. It is composited on TOP of a wooden crate in game, so the underside must be a clean straight horizontal edge with nothing hanging below it. It is the ONLY red thing in the tower, deliberately, because it marks a block nothing can be built on top of.

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

One object, centred in the frame.

OUTPUT: exactly 512 x 384 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## icon-wood  (icon-wood.png → images/icons/wood.webp)

```text
Paint one background element for a cozy medieval-fantasy tower-defence game.

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

WHAT IT IS: The WOOD resource icon: a small stack of cut logs seen end-on, growth rings showing on the cut faces, warm timber browns. It sits in the HUD bar at about 26 px, so it must read instantly at thumbnail size — bold shapes, strong silhouette, no fine detail.

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

One object, centred in the frame.

OUTPUT: exactly 512 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## icon-stone  (icon-stone.png → images/icons/stone.webp)

```text
Paint one background element for a cozy medieval-fantasy tower-defence game.

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

WHAT IT IS: The STONE resource icon: two or three chunks of quarried grey rock with chipped facets. Read at about 26 px in the HUD bar, so keep it to bold shapes with a strong silhouette and no fine detail. It must not be mistakable for the wood icon at a glance.

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

One object, centred in the frame.

OUTPUT: exactly 512 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## icon-gold  (icon-gold.png → images/icons/gold.webp)

```text
Paint one background element for a cozy medieval-fantasy tower-defence game.

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

WHAT IT IS: The GOLD resource icon: a small bar or stack of coins in warm gold. Read at about 26 px in the HUD bar — bold shape, strong silhouette, no fine detail. It is the premium currency, so it should be the brightest and most eye-catching of the three.

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

One object, centred in the frame.

OUTPUT: exactly 512 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## ribbon  (bg-ribbon.png → images/bg/ribbon.webp)

```text
Paint one background element for a cozy medieval-fantasy tower-defence game.

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

WHAT IT IS: The result screen TITLE BANNER: one long, flat, horizontal parchment ribbon seen straight on, with a small folded tail at each end. Aged warm vellum, a soft ink border and a little foxing along the edges. SHAPE IS THE WHOLE JOB HERE — it is WIDE AND SHALLOW, a 5:1 band rather than a scroll, and it must use the entire frame: the left tail touches the left edge, the right tail touches the right edge, and the tallest part of the ribbon touches the top and the bottom edge. Leave no magenta margin on any side — a banner painted small inside the frame arrives on screen as a small banner with dead space around it, which is the exact fault this asset replaces. The middle 70% of the width is the WRITING PANEL: flat, straight, parallel top and bottom edges, at least 80% of the frame height, and VERTICALLY CENTRED — the game prints its title across it, so keep that panel an even, quiet, uncluttered surface in a mid parchment tone that white lettering with a dark outline will read on. Do not write anything on it: no words, no letters, no numerals, no monogram, no crest, no icon, no ornament in the centre. The ends carry ONE shallow fold each and nothing more — no deep curls, no rolled scroll ends, no ribbon looping behind itself, no swallowtail notch deeper than a fifth of the width. Nothing may sit above or below the band: no pole, no finial, no hanging cords, tassels, nails, rings, shadow or ground. Every pixel of height that is not ribbon is height the result screen loses.

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

```text
Paint one background element for a cozy medieval-fantasy tower-defence game.

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

WHAT IT IS: The daily TREASURE CHEST icon: a small, sturdy, CLOSED wooden chest seen straight on from the front — a domed lid, two dark iron bands running across the body, and a gold lock plate with a keyhole centred on the front. Warm timber browns, dark iron, one warm gold accent. It sits in the HUD at about 50 px and is the thing a player taps for their free coins, so it should look inviting and full: bold shapes, strong silhouette, no fine detail. The lid stays SHUT — the game plays the opening itself. Keep it ONE compact closed shape, with no dangling straps, no key, no spilled coins, no ground and no shadow beneath it: a cooldown shade is masked to this silhouette, so anything detached from the body becomes a floating fleck. It must not be mistakable for the gold resource icon at a glance — that one is the coins, this one is the box they came in.

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

One object, centred in the frame.

OUTPUT: exactly 512 x 512 pixels. If your tool has an aspect-ratio
control, set it to match. No labels, captions or watermarks.
```

---

## prop-chest-wing  (prop-chest-wing.png → images/props/chest-wing.webp)

```text
Paint ONE game sprite — a single wing — for a cozy medieval-fantasy tower-defence game. Attach `images/icons/chest.webp` with this prompt: the wing belongs to that chest and has to look painted by the same hand.

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
· The object itself must contain no magenta or hot pink.

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

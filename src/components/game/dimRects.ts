/** A screen-space rectangle, CSS pixels. */
export interface DimBox { x: number; y: number; w: number; h: number }

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))

/**
 * The dim layer around several holes, as plain rectangles.
 *
 * The coach-mark overlay cuts its holes with rects rather than a mask, because
 * a mask is not reliably click-through (see `TutorialOverlay`). One hole is
 * four rects; two holes need the same idea generalised: slice the screen into
 * horizontal bands at every hole edge, and in each band cover everything no
 * hole spans. Overlapping holes merge; holes hanging off the screen are
 * clipped to it. Every pixel outside the holes is covered exactly once.
 */
export const dimAround = (holes: ReadonlyArray<DimBox>, vw: number, vh: number): DimBox[] => {
  const edges = new Set<number>([0, vh])
  for (const h of holes) {
    edges.add(clamp(h.y, 0, vh))
    edges.add(clamp(h.y + h.h, 0, vh))
  }
  const ys = [...edges].sort((a, b) => a - b)

  const out: DimBox[] = []
  for (let i = 0; i < ys.length - 1; i++) {
    const y0 = ys[i]!
    const y1 = ys[i + 1]!
    if (y1 <= y0) continue
    const spans = holes
      .filter((h) => h.y < y1 && h.y + h.h > y0)
      .map((h) => [clamp(h.x, 0, vw), clamp(h.x + h.w, 0, vw)] as const)
      .sort((a, b) => a[0] - b[0])
    let x = 0
    for (const [l, r] of spans) {
      if (l > x) out.push({ x, y: y0, w: l - x, h: y1 - y0 })
      x = Math.max(x, r)
    }
    if (x < vw) out.push({ x, y: y0, w: vw - x, h: y1 - y0 })
  }
  return out
}

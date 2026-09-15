import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

/**
 * ─── Every mode that draws a ghost must follow the pointer ──────────────────
 *
 * The desktop scene has three modes in which something on the board previews
 * where the player's next click will land: an armed tray piece, an armed Arrow
 * Rain volley, and a block being carried — by drag, or armed from the
 * inspector's Reposition button. All three are drawn from one place, `hoverCell`
 * fed into `setBuildOverlay`, and all three depend on `onPointerMove` writing
 * that ref.
 *
 * `onPointerMove` writes it from THREE branches, because the three cases are
 * genuinely different: a mouse hovering with no button held, a pointer held
 * down mid-gesture, and (before the camera pan) a block being carried. The
 * modes that should be tracked were listed inline in each of them — and when
 * repositioning was added, it reached two of the three. The result was a
 * feature that looked completely broken while being almost entirely correct:
 * the legal sockets lit, the commit landed on the right cell, the touch path
 * worked, and a mouse user saw a ghost sitting motionless on the block they
 * were trying to move.
 *
 * ── Why this is a source test ──
 *
 * `onPointerMove` is a closure inside an SFC that owns a canvas, a render loop
 * and a device-tier sampler; there is no seam to call it through, and building
 * one for a three-line predicate would be a worse trade than this. What is
 * pinned is therefore narrow but exact: no branch of `onPointerMove` may decide
 * for itself which modes track the pointer. The same shape as the scripted-hand
 * and `markHintDone` assertions in `buildClockNeverFreezes` and
 * `controlHints`, and for the same reason.
 *
 * If this file ever becomes a nuisance, the honest fix is to lift the pointer
 * handling out of the scene, not to loosen the assertion.
 */

const SCENE = 'src/views/GameScene.vue'
const source = (): string => readFileSync(SCENE, 'utf8')

/** The body of `onPointerMove`, from its declaration to the next top-level one. */
const pointerMoveBody = (src: string): string => {
  const from = src.indexOf('const onPointerMove = (e: PointerEvent): void => {')
  expect(from, 'onPointerMove has been renamed').toBeGreaterThan(-1)
  const to = src.indexOf('\nconst onPointerUp', from)
  expect(to, 'onPointerUp no longer follows onPointerMove').toBeGreaterThan(from)
  return src.slice(from, to)
}

describe('the placement ghost tracks the pointer in every mode', () => {
  it('asks one predicate, in every branch that moves the ghost', () => {
    const body = pointerMoveBody(source())
    const writes = body.match(/hoverCell\.value = screenToCell\(/g) ?? []
    // Three today. The count is asserted so that a FOURTH branch added later
    // has to come past this test rather than quietly inheriting nothing.
    expect(writes.length).toBe(3)

    // Every write is guarded by the shared predicate or by "a block is being
    // carried" — never by a hand-written list of modes, which is the bug.
    for (const line of body.split('\n')) {
      if (!line.includes('hoverCell.value = screenToCell(')) continue
      const guard = line.includes('carried.value') || line.includes('tracksPointer.value')
      // A guard on the preceding `if` line counts too — two of the three are
      // written that way.
      if (guard) continue
      const idx = body.split('\n').indexOf(line)
      const prev = body.split('\n')[idx - 1] ?? ''
      expect(
        prev.includes('tracksPointer.value') || prev.includes('carried.value'),
        `unguarded hoverCell write: ${line.trim()}`
      ).toBe(true)
    }

    // And specifically: no branch names the individual modes any more.
    expect(body).not.toContain('selectedShape.value || arrowRainArmed.value')
  })

  it('counts a repositioned block as something that tracks the pointer', () => {
    // The predicate has to cover `carried`, which is the union of a dragged
    // block and one armed from the inspector — not `blockDrag` alone, which is
    // the drag half and was what the working branches happened to test.
    const src = source()
    const from = src.indexOf('const tracksPointer = computed(')
    expect(from, 'tracksPointer has been renamed or removed').toBeGreaterThan(-1)
    const decl = src.slice(from, src.indexOf('\n\n', from))
    expect(decl).toContain('carried.value')
    expect(decl).toContain('selectedShape.value')
    expect(decl).toContain('arrowRainArmed.value')

    const carried = src.slice(src.indexOf('const carried = computed('))
      .split('\n')[0]!
    expect(carried).toContain('blockDrag.value')
    expect(carried).toContain('repositioning.value')
  })

  it('publishes the overlay when the carried block or the hover cell changes', () => {
    // The other half of the path: `hoverCell` following the mouse buys nothing
    // if the watcher that pushes the overlay to the renderer is not listening
    // to it, or to the mode that is being previewed.
    const src = source()
    const from = src.indexOf('// Publish the build overlay to the renderer')
    expect(from).toBeGreaterThan(-1)
    const deps = src.slice(from, src.indexOf('() => {', from))
    for (const dep of ['hoverCell', 'blockDrag', 'repositioning', 'arrowRainArmed', 'selectedShape']) {
      expect(deps, `overlay watcher does not depend on ${dep}`).toContain(dep)
    }
  })
})

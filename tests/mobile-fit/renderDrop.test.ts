import { beforeEach, describe, expect, it, vi } from 'vitest'

// ─── The drop board through the renderer ────────────────────────────────────
//
// Same idea as `tests/game/renderIntegration.test.ts`: drive the fixed-camera
// board through hundreds of frames of drops, landings, merges and a wave
// against a recording 2D-context stub that validates every number it is given.

const makeCtx = () => {
  let saveDepth = 0
  const badNumbers: string[] = []
  const track = (name: string, args: unknown[] = []): void => {
    for (const a of args) {
      if (typeof a === 'number' && !Number.isFinite(a)) badNumbers.push(`${name}(${args.join(', ')})`)
    }
  }
  const gradient = {
    addColorStop: (offset: number) => {
      if (!Number.isFinite(offset) || offset < 0 || offset > 1) badNumbers.push(`addColorStop(${offset})`)
    }
  }
  const ctx: any = {
    canvas: { width: 390, height: 844 },
    ...Object.fromEntries([
      'beginPath', 'closePath', 'moveTo', 'lineTo', 'arc', 'arcTo', 'ellipse',
      'quadraticCurveTo', 'bezierCurveTo', 'rect', 'fill', 'stroke', 'clip',
      'fillRect', 'strokeRect', 'clearRect', 'fillText', 'strokeText',
      'drawImage', 'translate', 'rotate', 'scale', 'transform', 'setTransform',
      'setLineDash', 'measureText'
    ].map((name) => [name, (...args: unknown[]) => {
      track(name, args)
      if (name === 'measureText') return { width: 10 }
      return undefined
    }])),
    save: () => { saveDepth++ },
    restore: () => { saveDepth-- },
    createLinearGradient: (...args: number[]) => { track('createLinearGradient', args); return gradient },
    createRadialGradient: (...args: number[]) => { track('createRadialGradient', args); return gradient },
    createPattern: () => ({ __pattern: true })
  }
  for (const prop of [
    'fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'globalAlpha',
    'globalCompositeOperation', 'font', 'textAlign', 'textBaseline', 'filter'
  ]) ctx[prop] = ''
  return { ctx: ctx as CanvasRenderingContext2D, badNumbers, get saveDepth() { return saveDepth } }
}

const TICK = 1000 / 60

const loadBoard = async () => {
  vi.resetModules()
  localStorage.clear()
  const realCreate = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
    const el = realCreate(tag)
    if (tag === 'canvas') (el as any).getContext = () => makeCtx().ctx
    return el
  }) as typeof document.createElement)

  const game = await import('@/use/useTowerGame')
  const camera = await import('@/use/useTowerCamera')
  const art = await import('@/use/useTowerArt')
  const { DROPMERGE_RULES, BOARD_MAX_ROW } = await import('@/mobile-fit/rules')
  game.applyRules(DROPMERGE_RULES)
  game.startRun()
  camera.setViewport(390, 844, 44, 180)
  camera.setFixedFrame({ cell: 45, x: 0, y: 4 })
  return { game, camera, art, BOARD_MAX_ROW }
}

beforeEach(() => { vi.restoreAllMocks() })

describe('the drop board renders', () => {
  it('through drops, merges, the column overlay, edge arrows and a wave without a bad number', async () => {
    const { game, art, BOARD_MAX_ROW } = await loadBoard()
    const rec = makeCtx()
    game.wood.value = 20_000
    game.runCoins.value = 5_000

    game.placeBlock('wood', 1, 0)
    game.placeBlock('wood', -1, 0)
    game.placeBlock('cannon', 0, 1)
    art.setBuildOverlay({
      dropColumn: 2, dropValid: true, dropRows: BOARD_MAX_ROW, hoverC: 2, hoverR: 0,
      edgeLeft: 3, edgeRight: 2,
      // Armed: every column is guided, one of them full.
      dropGuides: [
        { c: -2, r: 0, valid: true }, { c: -1, r: 1, valid: true },
        { c: 0, r: 2, valid: true }, { c: 1, r: 0, valid: true },
        { c: 2, r: BOARD_MAX_ROW, valid: false }
      ]
    })
    for (let i = 0; i < 30; i++) {
      game.step(TICK)
      art.drawScene(rec.ctx, 390, 844, TICK, 2)
    }

    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    expect(game.dropOffer(0, 1)).toBe(true)
    game.offers.value = ['b_wood', 'b_archer', 'b_wood']
    expect(game.dropOffer(0, 1)).toBe(true)
    for (let i = 0; i < 120; i++) {
      game.step(TICK)
      art.drawScene(rec.ctx, 390, 844, TICK, 2)
    }
    expect(game.getBlocks().get('1,0')?.tier).toBe(2)

    art.setBuildOverlay({ dropColumn: null, dropGuides: [], edgeLeft: 0, edgeRight: 0 })
    game.debugSetWave(5)
    game.callWave()
    for (let i = 0; i < 400; i++) {
      game.step(TICK)
      art.drawScene(rec.ctx, 390, 844, TICK, 2)
    }
    expect(game.getEnemies().length).toBeGreaterThan(0)
    expect(rec.badNumbers).toEqual([])
    expect(rec.saveDepth).toBe(0)
  })

  it('keeps a fixed frame fixed: pans and pinches change nothing', async () => {
    const { camera } = await loadBoard()
    const before = camera.getCenter()
    const zoom = camera.getZoom()
    camera.panBy(50, 50)
    camera.zoomAt(1.5, 100, 100)
    camera.beginPinch(100)
    camera.updatePinch(200, 100, 100)
    camera.recenter()
    for (let i = 0; i < 60; i++) camera.updateCamera(TICK)
    expect(camera.getCenter()).toEqual(before)
    expect(camera.getZoom()).toBe(zoom)
    expect(camera.isFixed.value).toBe(true)
    expect(camera.isManual.value).toBe(false)
    camera.clearFixedFrame()
    expect(camera.isFixed.value).toBe(false)
  })
})

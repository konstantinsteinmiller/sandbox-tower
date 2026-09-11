import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * ─── Drop-in art that only exists once somebody paints it ───────────────────
 *
 * The merged-tier weapons and the chest wing are slots for paintings that do
 * not exist yet. Probing a slot with no file behind it is a guaranteed 404,
 * and a portal's QA console reads every one as a broken build — so these are
 * probed only once their id is listed in `src/game/paintedArt.ts`.
 *
 * Which makes the list the thing that can drift, in both directions: a
 * painting sliced in and never listed is art that silently never shows, and a
 * listed id with no file is the 404 the list exists to prevent. The first
 * describe holds the two in step against the real folders.
 */

const PUBLIC = resolve(__dirname, '../../public/images')

const filesIn = (dir: string): string[] => {
  try { return readdirSync(resolve(PUBLIC, dir)) } catch { return [] }
}

describe('the painted-art lists match what is on disk', () => {
  it('lists every merged-tier painting in public/images/fixtures, and nothing else', async () => {
    const { PAINTED_TIER_FIXTURES, TIER_ART_WEAPONS } = await import('@/game/paintedArt')
    const tierFile = new RegExp(`^(${TIER_ART_WEAPONS.join('|')})-t\\d+\\.webp$`)
    const onDisk = filesIn('fixtures').filter((f) => tierFile.test(f)).map((f) => f.replace(/\.webp$/, ''))
    for (const id of onDisk) {
      expect(PAINTED_TIER_FIXTURES.has(id),
        `public/images/fixtures/${id}.webp is on disk — add '${id}' to PAINTED_TIER_FIXTURES`).toBe(true)
    }
    for (const id of PAINTED_TIER_FIXTURES) {
      expect(onDisk.includes(id),
        `'${id}' is listed but public/images/fixtures/${id}.webp does not exist`).toBe(true)
    }
  })

  it('lists the chest wing exactly when its painting is on disk', async () => {
    const { PAINTED_PROPS, CHEST_WING_ID } = await import('@/game/paintedArt')
    const onDisk = filesIn('props').includes(`${CHEST_WING_ID}.webp`)
    expect(PAINTED_PROPS.has(CHEST_WING_ID),
      onDisk
        ? `public/images/props/${CHEST_WING_ID}.webp is on disk — add it to PAINTED_PROPS`
        : `'${CHEST_WING_ID}' is listed but its painting is not on disk`).toBe(onDisk)
  })
})

// ─── Probing ────────────────────────────────────────────────────────────────

interface FakeImg {
  src: string
  naturalWidth: number
  naturalHeight: number
}

/** A stand-in `Image` that "loads" whatever it is pointed at, and remembers
 *  every request by path so a test can ask both what was fetched and which
 *  bitmap a canvas was handed. */
const stubImages = (): { requested: string[]; bySuffix: (s: string) => FakeImg | undefined } => {
  const made: FakeImg[] = []
  class FakeImage {
    decoding = 'auto'
    naturalWidth = 512
    naturalHeight = 512
    private url = ''
    private onLoad: (() => void) | null = null
    addEventListener(type: string, fn: () => void): void { if (type === 'load') this.onLoad = fn }
    decode(): Promise<void> { return Promise.resolve() }
    set src(value: string) {
      this.url = value
      made.push(this as unknown as FakeImg)
      queueMicrotask(() => this.onLoad?.())
    }
    get src(): string { return this.url }
  }
  vi.stubGlobal('Image', FakeImage as unknown as typeof Image)
  return {
    get requested() { return made.map((m) => m.src) },
    bySuffix: (s: string) => made.find((m) => m.src.split('?')[0]!.endsWith(s))
  }
}

/** Every probe resolves on a microtask chain; let it run out. */
const flush = async (): Promise<void> => {
  for (let i = 0; i < 6; i++) await Promise.resolve()
}

const loadWithArt = async () => {
  vi.resetModules()
  vi.stubEnv('VITE_ENABLE_ART_OVERRIDES', 'true')
  const images = stubImages()
  const painted = await import('@/game/paintedArt')
  return { images, painted }
}

beforeEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('merged-tier paintings are probed only once listed', () => {
  it('asks for nothing while the list is empty', async () => {
    const { images, painted } = await loadWithArt()
    for (const type of painted.TIER_ART_WEAPONS) {
      for (const tier of [2, 3, 6]) expect(painted.tierFixtureArt(type, tier)).toBeNull()
    }
    expect(painted.propArt(painted.CHEST_WING_ID)).toBeNull()
    await flush()
    expect(images.requested).toEqual([])
  })

  it('fetches a listed painting, and reuses tier 3 for every deeper weld', async () => {
    const { images, painted } = await loadWithArt()
    ;(painted.PAINTED_TIER_FIXTURES as Set<string>).add('cannon-t3')
    expect(painted.tierFixtureArt('cannon', 5)).toBeNull() // still decoding
    await flush()
    const img = painted.tierFixtureArt('cannon', 5)
    expect(img).not.toBeNull()
    expect(painted.tierFixtureArt('cannon', 3)).toBe(img)
    expect(images.requested.every((u) => u.includes('images/fixtures/cannon-t3.webp'))).toBe(true)
    // Tier 1 is the plain fixture; tier 2 is not listed. Neither asks.
    expect(painted.tierFixtureArt('cannon', 1)).toBeNull()
    expect(painted.tierFixtureArt('cannon', 2)).toBeNull()
    await flush()
    expect(images.requested).toHaveLength(1)
  })

  it('spells the ids the slicer writes', async () => {
    const { painted } = await loadWithArt()
    expect(painted.tierFixtureId('cannon', 2)).toBe('cannon-t2')
    expect(painted.tierFixtureId('frost', 3)).toBe('frost-t3')
    expect(painted.tierFixtureId('archer', 9)).toBe('archer-t3')
  })
})

// ─── The renderer ───────────────────────────────────────────────────────────

/** A 2D context that records which bitmap every `drawImage` was handed. */
const recordingCtx = (drawn: unknown[]): CanvasRenderingContext2D => {
  const noop = (): void => {}
  const gradient = { addColorStop: noop }
  const ctx: Record<string, unknown> = {
    canvas: { width: 64, height: 64 },
    drawImage: (img: unknown) => { drawn.push(img) },
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    createPattern: () => ({}),
    measureText: () => ({ width: 10 }),
    getImageData: (_x: number, _y: number, w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) })
  }
  for (const name of [
    'save', 'restore', 'beginPath', 'closePath', 'moveTo', 'lineTo', 'arc', 'arcTo', 'ellipse',
    'quadraticCurveTo', 'bezierCurveTo', 'rect', 'fill', 'stroke', 'clip', 'fillRect',
    'strokeRect', 'clearRect', 'fillText', 'strokeText', 'translate', 'rotate', 'scale',
    'transform', 'setTransform', 'setLineDash'
  ]) ctx[name] = noop
  return ctx as unknown as CanvasRenderingContext2D
}

const loadRenderer = async () => {
  const { images, painted } = await loadWithArt()
  const drawn: unknown[] = []
  const realCreate = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
    const el = realCreate(tag)
    if (tag === 'canvas') (el as unknown as { getContext: () => unknown }).getContext = () => recordingCtx(drawn)
    return el
  }) as typeof document.createElement)
  const art = await import('@/use/useTowerArt')
  const gameArt = await import('@/game/art')
  return { images, painted, art, gameArt, drawn }
}

describe('a painted tier replaces the composite battery', () => {
  it('composites a twin out of two copies of the plain painting when no tier is painted', async () => {
    const { images, art, gameArt, drawn } = await loadRenderer()
    gameArt.spriteFor('fixture', 'cannon')
    await flush()
    const plain = images.bySuffix('images/fixtures/cannon.webp')
    expect(plain).toBeDefined()

    art.paintLiveFixture(recordingCtx(drawn), 'cannon', 40, 40, 40, { tier: 2 })
    expect(drawn.filter((d) => d === plain)).toHaveLength(2)
    // Nothing went looking for a tier painting that is not listed.
    expect(images.requested.some((u) => u.includes('-t2'))).toBe(false)
  })

  it('draws the listed painting ONCE, and the plain one not at all', async () => {
    const { images, painted, art, gameArt, drawn } = await loadRenderer()
    ;(painted.PAINTED_TIER_FIXTURES as Set<string>).add('cannon-t2')
    gameArt.spriteFor('fixture', 'cannon')
    painted.tierFixtureArt('cannon', 2)
    await flush()
    const plain = images.bySuffix('images/fixtures/cannon.webp')
    const twin = images.bySuffix('images/fixtures/cannon-t2.webp')
    expect(twin).toBeDefined()

    art.paintLiveFixture(recordingCtx(drawn), 'cannon', 40, 40, 40, { tier: 2 })
    expect(drawn.filter((d) => d === twin)).toHaveLength(1)
    expect(drawn.filter((d) => d === plain)).toHaveLength(0)
  })

  it('leaves the plain fixture alone at tier 1 even with a tier painted', async () => {
    const { images, painted, art, gameArt, drawn } = await loadRenderer()
    ;(painted.PAINTED_TIER_FIXTURES as Set<string>).add('cannon-t2')
    gameArt.spriteFor('fixture', 'cannon')
    painted.tierFixtureArt('cannon', 2)
    await flush()
    const plain = images.bySuffix('images/fixtures/cannon.webp')
    const twin = images.bySuffix('images/fixtures/cannon-t2.webp')

    art.paintLiveFixture(recordingCtx(drawn), 'cannon', 40, 40, 40, { tier: 1 })
    expect(drawn.filter((d) => d === plain)).toHaveLength(1)
    expect(drawn.filter((d) => d === twin)).toHaveLength(0)
  })
})

describe('the bench reference for a merged tier', () => {
  it('lays the rear rank through one shaded layer, and a plain fixture through none', async () => {
    const { art } = await loadRenderer()
    const once: unknown[] = []
    art.paintFixtureBattery(recordingCtx(once), 'cannon', 256, 256, 256, 3)
    expect(once).toHaveLength(1)
    const none: unknown[] = []
    art.paintFixtureBattery(recordingCtx(none), 'cannon', 256, 256, 256, 1)
    expect(none).toHaveLength(0)
  })
})

// ─── The manifest ───────────────────────────────────────────────────────────

describe('the art manifest carries the new sheets', () => {
  it('has a tier-2 and a tier-3 sheet for every merging weapon, targeted where the renderer looks', async () => {
    const { WALKS } = await import('@/game/artSheet')
    const { TIER_ART_WEAPONS, tierFixtureId } = await import('@/game/paintedArt')
    for (const type of TIER_ART_WEAPONS) {
      for (const tier of [2, 3]) {
        const id = tierFixtureId(type, tier)
        const w = WALKS.find((x) => x.id === id)
        expect(w, id).toBeDefined()
        expect(w!.kind).toBe('fixture')
        expect(w!.target).toBe(`images/fixtures/${id}.webp`)
        expect(w!.fixtureType).toBe(type)
        expect(w!.fixtureTier).toBe(tier)
        // The plain fixture's box, so the slicer fits a return the same way.
        expect([w!.panelW, w!.panelH, w!.frames]).toEqual([512, 512, 1])
      }
    }
  })

  it('writes a tier prompt that names the design, the tier colour and the 40 px test', async () => {
    const { WALKS, promptForWalk } = await import('@/game/artSheet')
    const { tierStyle } = await import('@/game/tierStyle')
    for (const tier of [2, 3]) {
      const text = promptForWalk(WALKS.find((x) => x.id === `cannon-t${tier}`)!)
      expect(text).toContain('images/fixtures/cannon.webp')
      expect(text).toContain(tierStyle(tier).hex)
      expect(text).toContain(tier === 2 ? 'TWO AT 40 PX' : 'THREE AT 40 PX')
      // It sits on the cannon's block, so it takes the cannon's contrast
      // clause — `cannon-t2` has no palette of its own.
      expect(text).toContain('IT MUST READ AGAINST THE BLOCK')
    }
  })

  it('carries the chest wing with its pivot, and leaves every other prop prompt as it was', async () => {
    const { SCENERY, promptForScenery } = await import('@/game/artSheet')
    const { CHEST_WING_BOX } = await import('@/game/paintedArt')
    const wing = SCENERY.find((a) => a.id === 'prop-chest-wing')!
    expect(wing.target).toBe('images/props/chest-wing.webp')
    const text = promptForScenery(wing)
    expect(text).toContain(`${Math.round(CHEST_WING_BOX.pivotX * 100)}%`)
    expect(text).toContain(`${Math.round(CHEST_WING_BOX.pivotY * 100)}%`)
    expect(text).toContain('images/icons/chest.webp')
    expect(text).not.toContain('One object, centred in the frame.')

    const sun = promptForScenery(SCENERY.find((a) => a.id === 'sun')!)
    expect(sun).toContain('Paint one background element')
    expect(sun).toContain('One object, centred in the frame.')
  })
})

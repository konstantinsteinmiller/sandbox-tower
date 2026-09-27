import { describe, expect, it } from 'vitest'
import { ENEMY_DEFS } from '@/game/enemies'
import { introArtWants } from '@/use/useIntroCutscene'
import { SIEGE_ARM_STRIPS } from '@/use/useTowerArt'

/**
 * The intro preloads the art its cast needs. It used to ask for a painted ARM
 * for every contraption, and only the three throwing engines have one: with
 * the art layer on, the ram, the iron ram and the tower each logged a missing
 * `images/siege-arms/<id>.webp` — which a portal's QA console reports as a
 * broken build.
 */
describe('intro art wants', () => {
  const siege = Object.keys(ENEMY_DEFS).filter((id) => ENEMY_DEFS[id]?.siege)
  const wants = introArtWants(siege)

  it('asks for every contraption chassis', () => {
    for (const id of siege) expect(wants).toContainEqual(['siege', id])
  })

  it('asks for an arm only where an arm sheet exists', () => {
    const arms = wants.filter(([kind]) => kind === 'siegeArm').map(([, id]) => id).sort()
    expect(arms).toEqual(siege.filter((id) => SIEGE_ARM_STRIPS.has(id)).sort())
    expect(arms).not.toContain('ram')
    expect(arms).not.toContain('ironRam')
    expect(arms).not.toContain('siegeTower')
  })
})

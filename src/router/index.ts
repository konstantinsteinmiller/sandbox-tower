import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { settleFitMode, fitMode } from '@/use/useMobileFit'

/**
 * The main scene, chosen per device.
 *
 * The env literal is deliberately inline: Vite substitutes it at build time,
 * so with `VITE_USE_MOBILE_FIT_GAME=false` the whole branch — and with it the
 * only import of `src/mobile-fit` — is dead code, and Rollup never emits the
 * package. (An imported boolean would not reliably fold; see the note in
 * `main.ts` about platform gates.) With the flag on, the phone game loads as
 * its own chunk and the desktop chunk never downloads on a phone.
 */
const mainScene = async () => {
  if (import.meta.env.VITE_USE_MOBILE_FIT_GAME !== 'false') {
    await settleFitMode()
    if (fitMode.value === 'dropmerge') return import('@/mobile-fit/GameSceneDrop.vue')
  }
  return import('@/views/GameScene.vue')
}

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'main', component: mainScene },
  // Design bench for the monster art direction. Lazy, so it costs a player who
  // never visits it nothing.
  { path: '/monsters', name: 'monsters', component: () => import('@/views/MonsterLab.vue') },
  // Art-sheet export bench. DEV ONLY — it exists to get the procedural cast out
  // to a painter, it POSTs to a dev-server endpoint that does not exist in a
  // build, and a portal reviewer finding an unreachable tooling screen in the
  // bundle is a question nobody needs to answer. The guard also keeps the whole
  // chunk out of every portal build.
  // Same guard, same reasons: a scene that draws every replaceable drawable
  // at once so the art can be checked without playing eleven waves to reach
  // the fixture in question.
  ...(import.meta.env.DEV
    ? [
      { path: '/art-sheets', name: 'art-sheets', component: () => import('@/views/ArtSheets.vue') },
      { path: '/playground', name: 'playground', component: () => import('@/views/Playground.vue') }
    ]
    : []),
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router

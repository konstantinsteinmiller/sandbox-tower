import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'main', component: () => import('@/views/GameScene.vue') },
  // Design bench for the monster art direction. Lazy, so it costs a player who
  // never visits it nothing.
  { path: '/monsters', name: 'monsters', component: () => import('@/views/MonsterLab.vue') },
  // Art-sheet export bench. DEV ONLY — it exists to get the procedural cast out
  // to a painter, it POSTs to a dev-server endpoint that does not exist in a
  // build, and a portal reviewer finding an unreachable tooling screen in the
  // bundle is a question nobody needs to answer. The guard also keeps the whole
  // chunk out of every portal build.
  ...(import.meta.env.DEV
    ? [{ path: '/art-sheets', name: 'art-sheets', component: () => import('@/views/ArtSheets.vue') }]
    : []),
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router

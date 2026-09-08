/**
 * ─── The tutorial replay hatch ──────────────────────────────────────────────
 *
 * Every teaching screen in this game fires ONCE per save, on a moment that
 * cannot be re-entered: the coach marks on the first stage of a first session,
 * the merge ladder on the first fusion, the collapse demo on the first death
 * ever. Checking one meant wiping the save and replaying the opening, which is
 * how a full-screen card ships with its layout broken in landscape — nobody
 * looks at a once-ever screen twice unless looking is cheap.
 *
 * It is a URL flag rather than a dev-only switch on purpose. These screens
 * break on the real device and inside the real portal shell, which is exactly
 * where a build-time gate cannot reach — so it ships, and it is kept to
 * replaying teaching UI: no resources, no wave jumps, nothing that changes the
 * run underneath it.
 *
 * Shared by both boards because the query has to be parsed the same way on
 * each. A portal can put the query on either side of the hash (`?tut=x#/` or
 * `#/?tut=x`) — the same problem `useMobileFit` solves for `?fit=`, and the
 * same answer.
 */

export type TutorialCheat = 'merge' | 'trap' | 'reset'

const CHEATS: readonly string[] = ['merge', 'trap', 'reset']

export const parseTutorialCheat = (query: string): TutorialCheat | null => {
  const v = new URLSearchParams(query).get('tut')
  return v && CHEATS.includes(v) ? (v as TutorialCheat) : null
}

/** The query, wherever the portal put it: `?tut=x#/` or `#/?tut=x`. */
export const readTutorialCheat = (): TutorialCheat | null => {
  if (typeof location === 'undefined') return null
  const hash = location.hash.includes('?')
    ? location.hash.slice(location.hash.indexOf('?') + 1)
    : ''
  const search = location.search.startsWith('?') ? location.search.slice(1) : location.search
  return parseTutorialCheat([search, hash].filter(Boolean).join('&'))
}

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
 * `?tut=intro` is the newest and the one that needed the hatch most: the
 * opening cutscene is ten seconds long, fires once per save on the very first
 * frame a player ever sees, and cannot be reached again from inside the game at
 * all. Checking a change to its pacing, its framing or its type at 21
 * languages' worth of string lengths would otherwise mean wiping the save and
 * reloading for every single look.
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

export type TutorialCheat = 'merge' | 'power' | 'trap' | 'intro' | 'reset'

const CHEATS: readonly string[] = ['merge', 'power', 'trap', 'intro', 'reset']

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

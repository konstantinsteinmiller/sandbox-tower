// Per-project settings for `pnpm deploy:poki`.
//
// `team` and `gameId` come straight out of the P4D URL of the game's Versions
// page:
//   https://app.poki.dev/<team>/games/<gameId>/versions

export default {
  team: 'hyperg8',
  gameName: 'Sandbox Tower',

  /** OPTIONAL. Left blank on purpose during the reskin: the old value here was
   *  tower-siege's Poki game id, and reusing it would push this game's build
   *  onto the OLD game's P4D entry. The pipeline resolves the game by
   *  `gameName` on `https://app.poki.dev/<team>` and prints the id it found
   *  once Sandbox Tower has its own P4D entry, which then gets pasted here to
   *  skip the lookup next time. */
  gameId: undefined,

  /** The project's OWN build script, always. `build:poki` ends with the
   *  `cd dist && tar -a -cf ../sandbox-tower-poki.zip *` idiom every portal
   *  script in this repo ends with — which from Git Bash is GNU tar and writes
   *  a TAR named `.zip`. That tail is harmless here: whatever it drops lands
   *  inside `dist`, `repack` excludes `.zip` from the archive it builds, and
   *  the same path is then overwritten with a real PKZIP. What gets uploaded is
   *  always this pipeline's archive. */
  build: 'pnpm build:poki',
  dist: 'dist',
  zip: 'dist/sandbox-tower-poki.zip',

  repack: true,
  /** `dist` may carry sibling `-original` backups from the image compressor
   *  (see the compress-images-pipeline notes); they are build input, not
   *  something a portal should ever be shipped. */
  zipExclude: (p) => /-original\.(png|jpe?g|webp)$/i.test(p),

  /** What the version is called in P4D. The number is the only thread tying a
   *  live build back to a commit. */
  versionName: (version) => `Sandbox Tower ${version}`,

  /** Extra hosts the gates and the runtime sweep should accept.
   *
   *  Empty, and that is a property of the Poki build rather than an oversight:
   *  `.env.poki` ships `VITE_LEADERBOARD_URL=` blank, so the board is served
   *  from the build-time snapshot and the game makes no runtime request of its
   *  own. Poki forbids external calls outright, so anything that shows up in
   *  the sweep is a regression, not a host to add here. */
  allowHosts: [],

  qa: {
    /** Long enough that a wave actually CLEARS during the pass. Both of this
     *  game's interstitial placements hang off a run boundary — the end of a
     *  wave and the defeat screen (`maybeShowInterstitial`) — so a pass that
     *  never finishes a wave can never reach one. */
    playMs: 60000,

    /** Above this game's own interstitial floor, which is the whole point.
     *  `INTERSTITIAL_MIN_GAP_MS` is 121 s and the clock is stamped at module
     *  load, so the default 120 s wait expires ONE SECOND before the first
     *  break is permitted — and every ad step then reports unproven for a
     *  reason that has nothing to do with the build. */
    adWaitMs: 180000,
  },

  /** Surfaces this game actually has.
   *
   *  Both false, checked rather than assumed: the app has no player-facing text
   *  input anywhere, and the leaderboard name is generated or supplied by the
   *  portal SDK (`usePlayerIdentity`) — never typed. There is no user-generated
   *  text in the build at all, so the username-filter and chat-moderation steps
   *  are genuinely not applicable rather than conveniently waived. */
  declares: {
    usernames: false,
    chat: false,
  },

  /** Expressions evaluated INSIDE the game's iframe during the QA pass. */
  hooks: {
    /** Everything this game persists lives in ONE blob (`sandbox_state`, see
     *  `useTowerState`), so a save that survives a reload is the whole
     *  contract. Key names plus value lengths rather than values: the blob
     *  carries a run snapshot whose timestamps move on every boot, and
     *  comparing values would fail a save that is working perfectly. */
    readProgress: `(() => {
      const skip = /^(poki_|inspector-|_ga|debug|fps)/
      const out = {}
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (!k || skip.test(k)) continue
        out[k] = (localStorage.getItem(k) || '').length
      }
      return out
    })()`,

    /** Left null deliberately. This game's rewarded placements all sit behind a
     *  real player decision (the result screen's 2x payout, the reinforced
     *  hand, the 3x speed rung), and there is no exposed entry point to drive
     *  one from outside. Reported as unproven rather than silently ticked. */
    triggerRewarded: null,
  },
}

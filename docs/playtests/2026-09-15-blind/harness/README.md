# 2026-09-15 — five-persona blind playtest

Five Sonnet subagents, **3 minutes of game time each**, blind (no source, no
docs, screenshots only). Personas span the range the user asked for — a bored
7-year-old up to professional UI/UX and F2P-design auditors:

| id | device | persona |
|---|---|---|
| pt-1 | desktop 1280x720 | 7 y/o, skips all text, clicks the brightest thing |
| pt-2 | phone 390x844 @1.5 | 12 y/o Roblox/Brawl Stars, judges in 10 s |
| pt-3 | desktop 1280x720 | 15 y/o Bloons TD/Kingdom Rush veteran, wants depth |
| pt-4 | phone 390x844 @1.5 | senior mobile UI/UX designer, accessibility audit |
| pt-5 | desktop 1280x720 | hybrid-casual F2P designer, retention funnel |

Brief: find inconsistencies and reasons to quit; name the exact game-second
you would have closed the tab; report bugs and hard-to-read gameplay/tutorials.

## How it was run

```
# one dev server, verified by its served <title>
npx vite --port 4415 --strictPort --host 127.0.0.1

# one headed Chrome per tester, each on its own profile, launched ~9 s apart
node pt-supervise.mjs --id N --mode <desktop|mobile> --url http://127.0.0.1:4415/ --x X --y Y
```

Run against the **uncommitted working tree of 2026-09-15** (ad chord, tray fit,
screenshake, bottom-bar compact, tutorial-clock and coach-mark changes on top of
`48abd64 ui improvements`).

The harness was copied to the session scratchpad and run from there, so Chrome
profiles, shots and logs never entered the repo. Only the reports were copied
back.

**Traps** (carried from the 2026-09-14 run, both still real):
- `pt-supervise.mjs` always passes `--keep`, and the daemon reads its own log
  file on resume — so `logs/pt-N.log` must exist before the first launch or the
  daemon exits 1 before writing a line. Create the empty log files first.
- Launch the daemons ~8-9 s apart; simultaneous cold Chrome starts exceed the
  daemon's 20 s wait for a page target.

Game time is held between commands, so an LLM's think time is not charged to the
siege and the 180 s cap is 180 s of actual play. The player CLI is `pt.mjs`
(see the header of that file).

# 2026-09-14 — "bored teenager" blind playtest

Three Sonnet subagents, desktop only, **3 minutes of game time each**, told to
play as a bored 10–15 year old and to name the exact moment they would have
closed the tab.

Run against the working tree of 2026-09-14 — which already includes that day's
opening-vanguard change (monsters standing on the field from the first frame)
and the second-wave pointer nudge.

## How it was run

```
# one dev server, verified by its served <title>
npx vite --port 4408 --strictPort --host 127.0.0.1

# one headed Chrome per tester, each on its own profile
node pt-supervise.mjs --id N --mode desktop --url http://127.0.0.1:4408/ --x X --y Y
```

**Trap:** `pt-supervise.mjs` always passes `--keep`, and the daemon reads its
own log file during resume — so `logs/pt-N.log` must exist before the first
launch or the daemon dies with exit 1 before it writes a single line. Create
the empty log files first. Launch the daemons ~8 s apart; three cold Chrome
starts at once exceed the daemon's 20 s wait for a page target.

The player CLI is `pt.mjs` (see the header of that file). Game time is held
between commands, so an LLM's think time is not charged to the siege and the
180 s cap is 180 s of actual play.

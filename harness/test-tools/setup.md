# Setup — from a fresh clone to a green suite

## Prerequisites

| Requirement | Version used here | Notes |
| --- | --- | --- |
| Node.js | v22.22.3 | ≥ 20 works; the loader needs `--import` (18.19+) and type stripping (22+) |
| npm | 10.9.8 | ships with Node |
| curl, jq, bash | system packages | only needed for evidence capture and the shell runners |
| MongoDB | **not required** | the database suite skips itself with an explanation |

## Steps

```bash
git clone <repo> && cd Project-Next-Snake-game
npm install                 # installs the app plus the single test-only dependency (jsdom)
npm run build               # suites run against the production build
npm test                    # unit → api → ui → performance → security → database
```

`npm test` prints a live spec log and writes the machine-readable artefacts.
Typical duration on the machine used for RUN-2026-001: **~15 seconds total**
(unit 2.4 s · api 1.2 s · ui 4.7 s · performance 0.9 s · security 0.8 s ·
database 2.0 s, plus build when `.next` is missing).

## What just happened

1. The runner built the app (skipped if `.next` exists; force with
   `HARNESS_FORCE_BUILD=1`).
2. It started the production server on **:3100** in its own process group and waited
   for it to answer.
3. Each suite ran under `node --test` with the harness loader registered.
4. Servers were stopped by process group; ports are left free.
5. `summarize.mjs --finalize` wrote the per-run summary and archived the TAP files.

## Reading the results

| What | Where |
| --- | --- |
| Immediate console log | the terminal, plus `harness/evidence/logs/<suite>-<RUN>.spec.txt` |
| Machine-readable results | `harness/test-results/latest/*.tap` |
| Human summary | `harness/test-results/latest/summary.md` |
| Per-run archive | `harness/test-results/summaries/<RUN>.md` + `historical/<RUN>/` |

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `EADDRINUSE :3100` | something else is on the port — `HARNESS_PORT=3110 npm test`, or stop the process. The runner *reuses* any listener it finds on the port, so a stale server can silently serve old code: kill it if in doubt. |
| Build fails | `npm run build` on its own shows the real error; the log is kept at `harness/evidence/logs/build-<RUN>.log`. |
| UI suite fails to resolve `@/…` | the loader must be registered: run tests through `npm run test:*`, never `node file.test.mjs` directly. |
| Database suite reports 5 skips | expected without `HARNESS_MONGODB_URL` — see [`mongodb-local.md`](mongodb-local.md). |
| Figures look stale | `performance-summary.json` is overwritten by each run; the `generatedAt` field tells you which run it belongs to. |

## Where the tools are documented

[`README.md`](README.md) indexes every tool with its purpose, installation,
configuration, run command, expected output, result location and limitations.

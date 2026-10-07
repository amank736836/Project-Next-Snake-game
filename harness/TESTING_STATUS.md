# Testing Status — Nagini · Snake Game

**Snapshot:** after `RUN-2026-001` (2026-10-07, commit `1849ac4`, production build
served with `npm start`, no `DATABASE_URL`).

## At a glance

| Metric | Value |
| --- | --- |
| Automated test cases written | 139 |
| Executed | 134 (5 skipped — need MongoDB) |
| Passed | 116 |
| Failed (unexplained) | 0 |
| Known-issue tests (expected failures, tracked as bugs) | 18 |
| Manual test cases documented, not executed | 20 |
| Bugs logged | 18 |
| Requirements traced | 62 (36 functional + 26 non-functional) + 12 business rules |

Machine-generated detail: `test-results/latest/summary.md` and
`test-results/summaries/RUN-2026-001.md`. Human analysis: `reports/`.

## Per suite (RUN-2026-001)

| Suite | Cases | Pass | Known issues | Skipped | Duration | Command |
| --- | --- | --- | --- | --- | --- | --- |
| unit | 29 | 24 | 5 | 0 | 2.49 s | `npm run test:unit` |
| api | 42 | 36 | 6 | 0 | 1.05 s | `npm run test:api` |
| ui | 33 | 32 | 1 | 0 | 4.25 s | `npm run test:ui` |
| performance | 6 | 6 | 0 | 0 | 0.70 s | `npm run test:performance` |
| security | 20 | 15 | 5 | 0 | 0.72 s | `npm run test:security` |
| database | 9 | 3 | 1 | 5 | 1.92 s | `npm run test:database` |
| **total** | **139** | **116** | **18** | **5** | **~15 s** | `npm test` |

## What is verified today

✅ **Game rules (highest confidence)** — movement per tick, portal wrap-around on
both axes, apple scoring and growth, apple repositioning, reversal protection,
WASD/arrow/space aliases, keyboard suppression while typing, the full speed ramp
(95 → 55 ms measured precisely), self-collision death, minimum-length death rule,
pause → obfuscated save → resume round-trip, session-best persistence, theme
persistence, leaderboard paging bounds, graceful degradation when the scores API fails.

✅ **API contract** — accepted/rejected payload matrix, score merge semantics
(best kept, latest tracked, visits counted, one row per name), pagination maths,
`score > 0` filtering, ordering by best score and by recency, method handling
(405/204), 404s for unknown and dotfile paths, no HTML content-type on the API.

✅ **Markup contract** — mission hub controls and alert, leaderboard rows/ranks/"you"
tag/skeleton/empty states/pagination, game-over dialog roles and copy, board and
d-pad accessible names, served HTML shell (title, description, theme bootstrap, loader).

✅ **Non-functional** — API p50 ≈ 2.4–3.1 ms and p95 ≤ 5.9 ms locally; 50/50
concurrent reads in 120 ms; write latency flat across 25 writes (5.7 → 3.2 ms); page
shell ≈ 12 KB served from cache; no committed secrets; only the database password can
come from the environment.

## What is NOT verified (be honest about this)

| Area | Status | Why | How to close it |
| --- | --- | --- | --- |
| MongoDB persistence, indexes, concurrency race | `NOT_EXECUTED` (TC-133…TC-137) | No MongoDB, no Docker in this environment | Start MongoDB, run `HARNESS_MONGODB_URL=… npm run test:database` |
| Visual appearance, motion, responsive breakpoints, touch/joystick feel | `NOT_EXECUTED` (TC-200…TC-219) | No browser binary available (no screenshots/video) | Run the manual cases on a browser-capable machine or agent |
| Production CDN/Vercel behaviour (edge caching, analytics delivery) | `NOT_EXECUTED` | No deployment credentials/target | Validate after the next deploy with the API smoke script |
| Cross-browser behaviour (Safari/Firefox) | `NOT_EXECUTED` | Only headless Chromium-class jsdom semantics were exercised | Manual pass on the supported browser matrix |
| Load beyond 50 concurrent requests | `NOT_EXECUTED` | Local guard only; no load-test tooling in the repo | Use the burst test as a template on a staging URL |

## Known defects currently open

18 `todo` tests exercise these (details in `bugs/known-issues.md`):

- **Data integrity / abuse:** BUG-001 (non-numeric or missing scores accepted),
  BUG-003 (no server-side name limits), BUG-013 (no payload cap, no rate limiting),
  BUG-016 (unauthenticated, unverifiable scores).
- **Correctness of the leaderboard:** BUG-002 (foul-word substring false positives),
  BUG-004 (all blocked names collapse into one `Anonymous` row), BUG-005
  (NaN page/limit produce `null` fields), BUG-012 (unbounded `limit`).
- **Robustness:** BUG-006 (infinite recursion when the board is full), BUG-007
  (save encryption throws on non-Latin1 names), BUG-011 (a corrupt save leaves the
  resume button permanently active), BUG-014 (raw error text returned to clients),
  BUG-017 (a failed DB connection is cached forever).
- **Hygiene:** BUG-008 (4 upper-case blocklist entries can never match), BUG-009
  (58 duplicate blocklist entries), BUG-015 (no security headers, framework banner),
  BUG-018 (no index/unique constraint on the identity field — needs a database).

## Next recommended actions

1. **Run the database suite against a real MongoDB** — it is the only unexecuted
   automated area and it hides a data-integrity risk (dupes on concurrent writes).
2. **Run the 20 manual cases** in `test-cases/manual/browser-and-visual.md` to cover
   motion, responsive layout and accessibility behaviour.
3. **Decide on the security posture:** header hardening, input validation and rate
   limiting are cheap at the edge (`next.config.ts` headers + platform rate limit)
   and would close BUG-003/013/014/015.
4. **Add the harness to CI** (`.github/workflows`), publishing
   `test-results/summaries/<RUN>.md` as the job summary.
5. Re-run `npm test` after every behavioural change; compare against
   `test-results/historical/RUN-2026-001/`.

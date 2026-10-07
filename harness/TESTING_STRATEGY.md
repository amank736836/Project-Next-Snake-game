# Testing Strategy — Nagini · Snake Game

## 1. Scope and risk profile

The project is a small, single-page arcade game with one persistence path. Risk is
therefore concentrated in a few places rather than spread evenly:

| Area | Risk | Why | Strategy |
| --- | --- | --- | --- |
| Game rules (`useSnakeGame`) | **High** — a bug here breaks the product | Movement, wrap-around, self-collision, scoring and the speed ramp all live in one hook | Automated, exhaustive logic tests in a real DOM (jsdom + React) with mocked timers |
| Score write path | **High** — the only data write | Any client can write; merge rules decide the leaderboard | API contract tests + hostile-input tests |
| Leaderboard reads | Medium | Wrong ordering/pagination misleads players | API contract tests with a deterministic seed dataset |
| Persistence & storage modes | **High** | Two very different backends behind one API | Demo-mode tests + degradation tests; MongoDB mode gated until an instance exists |
| UI/markup/a11y | Medium | Labels, roles and states are the interface for keyboard/screen-reader players | Server-rendered markup assertions |
| Motion & responsive layout | Medium | The page is animation-heavy and breakpoint-driven | Documented manual cases (no browser tool available here) |
| Security | Medium (low after the no-auth scope is accepted) | Public write endpoint, no limits | Header/CORS/input/abuse probes + static secret scan |
| Performance | Low–Medium | Static shell + tiny JSON responses | Latency/payload guardrails, reproducible JSON evidence |

## 2. Test pyramid used here

```
                 ┌──────────────────────────────┐
                 │ Manual / exploratory (TC-2xx)│  20 documented cases, NOT_EXECUTED
                 │  real browser, motion, a11y  │  (no browser automation available)
                 ├──────────────────────────────┤
                 │ End-to-end HTTP (TC-056…TC-093)  API + served HTML, real server
                 ├──────────────────────────────┤
                 │ Component / hook (TC-030…TC-055) jsdom + React 19, mocked timers
                 ├──────────────────────────────┤
                 │ Unit (TC-001…TC-029)             pure logic, no DOM
                 └──────────────────────────────┘
   Cross-cutting: performance (TC-100…105) · security (TC-110…125) · database (TC-130…137)
```

Ratios from RUN-2026-001: 29 unit · 39 API · 33 UI · 6 performance · 20 security ·
9 database = **136 automated test cases** plus 20 manual cases.

## 3. What is automated, and with what

| Suite | Runner | Environment | Command |
| --- | --- | --- | --- |
| unit | `node --test` | plain Node 22 | `npm run test:unit` |
| api | `node --test` | production server on `:3100` | `npm run test:api` |
| ui | `node --test` | jsdom + React 19 (`HARNESS_BROWSER_ENV=1`) and the server for the shell test | `npm run test:ui` |
| performance | `node --test` | production server | `npm run test:performance` |
| security | `node --test` | production server + repository scan | `npm run test:security` |
| database | `node --test` | server with `DATABASE_URL` (real or unreachable) | `npm run test:database` |
| everything | shell orchestration | builds, boots, runs, summarises | `npm test` |

No application source file had to be modified. The repository's own compiler
(`typescript`) and Node's test runner do the work; the only added dependency is
`jsdom` (dev-only, for DOM-based UI tests). See `test-tools/README.md`.

## 4. Conventions

- **IDs everywhere.** Requirements `REQ-xxx` / business rules `BR-xxx`, features
  `FEAT-xxx`, scenarios `SCN-xxx`, test cases `TC-xxx`, bugs `BUG-xxx`, executions
  `RUN-yyyy-nnn`.
- **Test names begin with their ID** (`TC-036 | keystrokes are ignored while the
  name input has focus`) so TAP output, coverage tables and bug reports line up.
- **Known defects are exercised, not hidden.** A defect gets a `todo` test whose
  body asserts the *desired* behaviour; the run reports it under "known issues"
  while the suite stays green. Never delete such a test to make a run look clean.
- **NOT_EXECUTED over assumed PASS.** Anything not actually run (manual cases,
  MongoDB mode) is labelled `NOT_EXECUTED` with the reason and the exact steps to
  execute it.
- **Evidence or it did not happen.** Every suite writes TAP + console logs;
  performance writes a JSON summary; HTTP evidence lands in `evidence/api-responses/`.
- **Deterministic data.** Suites namespace player names with a per-run tag and use
  fixtures from `test-data/`; no test depends on real user data.

## 5. Entry and exit criteria

**Entry** — a suite may run when: the build succeeds (`npm run build`), the target
server answers on `/`, and (for database suites) the intended `DATABASE_URL` is known
to be reachable or deliberately unreachable.

**Exit (per run)** — a run is complete when all six suites have produced TAP,
`summary.md` is regenerated, every failure is triaged into a `BUG-xxx`, and
coverage/traceability tables are updated.

**Release gate (see `reports/release-readiness.md`)** — no unexplained failing
tests; all blocker/high bugs either fixed or explicitly accepted; smoke scenarios
green; database mode either validated or explicitly declared out of scope for the
release.

## 6. Known limits of this environment

| Limit | Consequence | Mitigation |
| --- | --- | --- |
| No browser binary (Playwright/Chromium downloads are blocked) | No screenshots, no visual regression, no real-motion verification | 20 manual cases documented for a browser-capable machine/agent |
| No MongoDB, no Docker | Database CRUD, indexes and the concurrency race cannot be executed | Gated suite (TC-133…TC-137) runs unchanged once a database exists |
| Dev servers on shared ports | Suites could interfere | Scripts reuse a healthy server, otherwise boot their own; test data is namespaced |
| Time-dependent logic (speed ramp, timers) | Flaky wall-clock tests | `node:test` mock timers drive every interval/timeout |

## 7. Maintaining this harness

1. Change a feature → update its feature doc, scenarios and test cases, then run
   `npm test` and record a new `RUN-yyyy-nnn`.
2. Add an automated test → give it the next free `TC-xxx`, add it to the matching
   `test-cases/**` file and to `reports/traceability.md`.
3. Find a defect → log `BUG-xxx` in `bugs/open/`, add a `todo` regression test, and
   link both from the feature doc.
4. Never edit `test-results/**` by hand; regenerate it by running the suites.

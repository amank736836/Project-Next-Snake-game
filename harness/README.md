# 🐍 Nagini Test Harness

Everything known about **what this project does, what has been tested, how it was
tested, what passed or failed, and how to reproduce it** lives in this folder.
Application source code is **not** duplicated or modified here — the harness only
describes and exercises it.

> **Current status:** `RUN-2026-001` — **139 automated test cases, 116 passing,
> 0 unexplained failures, 18 known issues, 5 cases blocked on MongoDB**.
> Full detail: [`TESTING_STATUS.md`](TESTING_STATUS.md) ·
> [`reports/test-summary.md`](reports/test-summary.md).

---

## Quick start

```bash
npm install                # once

npm test                   # everything: unit → api → ui → performance → security → database
npm run test:unit          # pure logic, no server, ~3 s
npm run test:api           # HTTP contract tests (boots a production server on :3100)
npm run test:ui            # game engine in jsdom + component markup + served shell
npm run test:performance   # latency / payload / concurrency guardrails
npm run test:security      # headers, CORS, input abuse, secret scan
npm run test:database      # MongoDB mode (skips with a clear reason when unavailable)
npm run test:evidence      # re-capture raw HTTP evidence for the current RUN_ID
npm run lint               # unchanged project lint
```

After a run, read `test-results/latest/summary.md` (auto-generated) and the
console output printed by each suite.

---

## What is in here?

| Folder | What it answers |
| --- | --- |
| [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) | What is this product? Users, workflows, stack, APIs, data |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | How the system is put together, data flow, risks |
| [`TESTING_STRATEGY.md`](TESTING_STRATEGY.md) | What we test, why, on which level, and the conventions |
| [`TESTING_STATUS.md`](TESTING_STATUS.md) | Where testing stands **right now** |
| [`requirements/`](requirements/) | Functional requirements, non-functional requirements, business rules (`REQ-*`, `BR-*`) |
| [`features/`](features/) | One document per feature (`FEAT-*`) with behaviour, acceptance criteria, tests, known issues |
| [`test-scenarios/`](test-scenarios/) | Scenario catalogues by type — smoke, regression, functional, negative, edge, integration, API, DB, UI, performance, security (`SCN-*`) |
| [`test-cases/`](test-cases/) | Every test case with steps, data, expected result, status and evidence (`TC-*`) |
| [`test-tools/`](test-tools/) | Tool documentation: what exists, how to install/configure/run it, limitations |
| [`automation/`](automation/) | The executable suites, shared utilities and runner scripts |
| [`test-data/`](test-data/) | Reusable fixtures: valid, invalid, edge-case, leaderboard seed |
| [`test-results/`](test-results/) | Latest execution, historical runs, per-run summaries |
| [`evidence/`](evidence/) | Raw proof: logs, TAP, API responses, database results |
| [`bugs/`](bugs/) | Bug reports and the known-issues register (`BUG-*`) |
| [`reports/`](reports/) | Test summary, coverage, traceability, regression report, release readiness |
| [`ai/`](ai/) | Instructions, prompts and rules for AI agents working in this harness |

---

## Where do I find…?

| I want… | Go to |
| --- | --- |
| The list of features | [`features/README.md`](features/README.md) |
| Why a feature behaves the way it does | `features/<feature>.md` → *Business rules* / *Expected behaviour* |
| The test case for something specific | [`reports/traceability.md`](reports/traceability.md) (requirement → feature → scenario → case) |
| Proof that a test ran | [`evidence/`](evidence/) + the `Evidence:` line of the test case |
| Known defects | [`bugs/known-issues.md`](bugs/known-issues.md) |
| How to run tests | This file (Quick start) and [`test-tools/setup.md`](test-tools/setup.md) |
| What is not tested yet | [`TESTING_STATUS.md`](TESTING_STATUS.md) → *What is NOT verified* |
| Whether we can ship | [`reports/release-readiness.md`](reports/release-readiness.md) |

---

## How to…

### …run the whole suite and record a new execution

```bash
HARNESS_RUN_ID=RUN-2026-002 npm test
```

The run id flows into every artefact: TAP in `test-results/latest/`,
a copy in `test-results/historical/<RUN_ID>/`, a per-run markdown in
`test-results/summaries/<RUN_ID>.md`, and suite logs in `evidence/logs/`.

Useful environment variables: `HARNESS_PORT` (default 3100), `HARNESS_DB_PORT`
(3101), `HARNESS_BASE_URL` (test an already-running or remote server),
`HARNESS_MONGODB_URL` (enable real database tests), `HARNESS_KEEP_SERVER=1`
(leave the booted server running), `HARNESS_PERF_SAMPLES`.

### …add a new feature to the documentation

1. Copy the structure of an existing file in `features/`.
2. Assign the next free `FEAT-xxx` and add it to `features/README.md`.
3. Add requirements (`REQ-xxx`) and business rules (`BR-xxx`) it implements.
4. Add scenarios (`SCN-xxx`) in the matching `test-scenarios/*.md` files.
5. Add test cases (`TC-xxx`) in `test-cases/<module>/` and to
   `reports/traceability.md`.

### …add a new test

```bash
# pick the right suite folder and the next free TC id
harness/automation/{unit,api,ui,performance,security,database}/my-thing.test.mjs
```

Rules that keep the suite maintainable:

- Start the test name with its id: `test("TC-140 | what it proves", …)`.
- Use the shared helpers (`utilities/api-client.mjs`, `utilities/fixtures.mjs`)
  instead of new libraries.
- A test that documents a **defect** gets `{ todo: "BUG-xxx — …" }` and asserts the
  *desired* behaviour, so the gap stays visible without breaking the suite.
- Add a `t.diagnostic(...)` line when the number matters (performance, counts).

### …record a bug

1. Create `bugs/open/BUG-xxx.md` using the template in `bugs/README.md`.
2. Add a regression test (`{ todo: "BUG-xxx" }` while open, a normal test once fixed).
3. Add it to `bugs/known-issues.md` and mention it in the feature doc's *Known issues*.
4. Update `reports/coverage.md` and `reports/release-readiness.md`.

### …update coverage

Coverage is derived, never invented: run `npm test`, then update the tables in
`reports/coverage.md` from the generated `test-results/summaries/<RUN_ID>.md`.

---

## How an AI agent should use this harness

1. Read [`ai/test-agent-instructions.md`](ai/test-agent-instructions.md) — the
   operating manual (Analyze → Plan → Test → Record → Verify → Report).
2. Orient with `features/README.md` and the feature file for the area in question.
3. Pick work from `TESTING_STATUS.md` → *Next recommended actions* or from
   `bugs/known-issues.md`.
4. Follow [`ai/test-generation-rules.md`](ai/test-generation-rules.md) (ids, data,
   secrets, no fake results) and use [`ai/test-prompts.md`](ai/test-prompts.md) as
   starting prompts.
5. Never claim a test passed unless it was executed in this repo — mark anything
   else `NOT_EXECUTED`.

---

## Ground rules

- **Nothing is invented.** Every claim here traces to source, config or an executed
  test; unknowns are labelled `UNKNOWN / REQUIRES VALIDATION`.
- **Execution beats documentation.** `test-results/**` and `evidence/**` are
  generated files — regenerate them by running tests, never edit them.
- **No secrets.** Credentials come from environment variables
  (`${DATABASE_URL}`, `${HARNESS_MONGODB_URL}`); nothing sensitive is stored here.
- **Application code is off limits** unless a test genuinely requires a change; the
  current run required none.

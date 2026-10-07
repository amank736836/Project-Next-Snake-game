# Test Data

Reusable, version-controlled test data for every suite in this harness.

## Rules

1. **No real credentials, no personal data.** Connection strings and accounts come from
   environment variables (`${DATABASE_URL}`, `${HARNESS_BASE_URL}`) — never from a file here.
2. **Fixtures are JSON** so Node suites, manual testers and AI agents can all consume them.
3. **Names are namespaced per run.** Suites append `RUN_TAG` to every player name
   (`harness/automation/utilities/fixtures.mjs → tagName()`), so parallel runs never collide
   and leftovers can be identified (`NaginiXX3F2K`).
4. Data files describe *inputs and expected outcomes*; actual observed results belong in
   `harness/test-results/` and `harness/evidence/`.

## Layout

| Path | Purpose | Used by |
| --- | --- | --- |
| `valid/valid-scores.json` | Submissions that must be accepted (HTTP 201) with the exact stored shape | `automation/api/addScore.test.mjs` (TC-056…TC-060) |
| `invalid/invalid-scores.json` | Malformed / incomplete payloads that must be rejected | `automation/api/addScore.test.mjs` (TC-061…TC-066) |
| `edge-cases/edge-case-scores.json` | Boundary, hostile and ambiguous values + the *documented* current behaviour and *expected* behaviour | `automation/api/addScore.test.mjs` (TC-067…TC-069b), `automation/security/input-and-abuse.test.mjs` (TC-116…TC-121) |
| `fixtures/leaderboard-seed.json` | Deterministic dataset for ordering/pagination assertions | `automation/api/highestScore.test.mjs` (TC-070…TC-077) |
| `sample-data/curl-examples.md` | Copy-paste HTTP requests for manual exploration | humans |

The three fixture categories the harness does **not** need, and why:

| Category | Why absent |
| --- | --- |
| `large-data/` | The only collection is a demo store capped by distinct names; the growth test (TC-105) generates its own load in code rather than committing a big file. |
| `authorization/` | The product has no accounts, roles or tokens (`PROJECT_OVERVIEW.md` §9) — there is nothing to authorise, so a credentials fixture would be theatre. |
| `performance/` | Performance inputs are generated in `automation/performance/api-latency.test.mjs` so sample counts stay configurable (`HARNESS_PERF_SAMPLES`). |

## Cleaning up test data

**In-memory mode (no `DATABASE_URL`):** data lives only in the server process.
Restart the server (`npm start`) and every artefact is gone.

**MongoDB mode:** the scoreboard accumulates real documents. The harness never deletes data
automatically. Drop the seeded rows manually:

```bash
mongosh "$DATABASE_URL" --eval 'db.scores.deleteMany({ name: /X[0-9A-Z]{5}$/ })'
```

Adjust the pattern to the `RUN_TAG` values listed in `harness/test-results/historical/`.

## Status

- Valid / invalid / edge-case fixtures: **USED** by executed suites (see `harness/reports/test-summary.md`).
- Database-mode fixtures: **NOT_EXECUTED** — no MongoDB instance is available in this environment
  (see `harness/test-tools/mongodb-local.md` and `harness/automation/database/README.md`).

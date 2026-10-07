# Bash runner scripts

- **Tool:** `harness/automation/scripts/*.sh` — `run-all`, `run-unit`, `run-api`,
  `run-ui`, `run-performance`, `run-security`, `run-database`, `capture-evidence`, plus
  `lib/common.sh`.
- **Purpose:** the glue between "a Node test file" and "a reproducible execution":
  build if needed, start the servers the suite needs, run the suite with the loader and
  two reporters, then shut the servers down **by process group** so no `next-server`
  survives the run.
- **Installation:** none (bash + coreutils). Exposed through `package.json` scripts
  (`npm test`, `npm run test:api`, …).
- **Configuration (environment variables):**

  | Variable | Default | Effect |
  | --- | --- | --- |
  | `HARNESS_RUN_ID` | `RUN-<date>-<time>` | names every artefact; use the documented `RUN-YYYY-nnn` form for a recorded run |
  | `HARNESS_PORT` | `3100` | demo-mode server port |
  | `HARNESS_DB_PORT` | `3101` | DB-mode server port |
  | `HARNESS_BASE_URL` | `http://127.0.0.1:3100` | point the suites at an existing/staging server |
  | `HARNESS_MONGODB_URL` | — | enables the MongoDB suite (`HARNESS_MONGODB_READY=1` is then set automatically) |
  | `HARNESS_FORCE_BUILD` | `0` | rebuild even when `.next` exists |
  | `HARNESS_KEEP_SERVER` | `0` | leave servers running for debugging |
  | `HARNESS_PERF_SAMPLES` | `30` | sample count for the performance suite |

- **How to run:** `npm test` (everything) or an individual `npm run test:<suite>`.
- **Expected output:**
  ```
  [harness] execution id: RUN-2026-001
  [harness] ▶ api  (harness/automation/api/*.test.mjs)
  ✔ TC-056 | a standard submission is accepted with 201 and stored verbatim (12ms)
  …
  [harness] server stopped ✓   (implicit: ports free afterwards)
  ```
- **Where results are stored:** TAP + `summary.md` in `test-results/latest/`, console
  transcripts and server logs in `evidence/logs/`, per-run archive in
  `test-results/summaries/` + `test-results/historical/`.
- **Known limitations / gotchas:**
  - `ensure_server` **reuses any listener** already on the port. That is deliberate (so
    suites share one server) but dangerous with a stale process — check `ss -ltn` if
    results look impossible.
  - `run_suite` pipes through `tee`, so the *script's* exit code is not the suite's.
    Read the TAP/summary for pass/fail; the exit code is a smoke signal only.
  - The database suite degrades gracefully: without `HARNESS_MONGODB_URL` it starts a
    server with a deliberately unreachable database and runs the degradation cases
    (TC-130…TC-132) while the real MongoDB cases skip.
  - `capture-evidence.sh` starts its own servers; do not run it while `npm test` holds
    the same ports.

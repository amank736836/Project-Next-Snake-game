# curl + jq

- **Tool:** `curl` 8.x, `jq` 1.6+ (both present on the machine; no installation step).
- **Purpose:** two jobs only —
  1. **Raw evidence capture** (`scripts/capture-evidence.sh`) writes the literal bytes a
     server returns to `harness/evidence/**`, so reviews never rely on a test's summary
     of a response; and
  2. **Ad-hoc probing** while investigating a bug (the fuzzing that produced the
     validation findings behind BUG-001/003/013/014 was curl + jq).
- **Installation:** `apt-get install -y curl jq` (or the platform equivalent). Neither
  is required to run the suites — only the evidence-capture script and manual probing.
- **Configuration:** none. Requests point at `$HARNESS_BASE_URL` (default
  `http://127.0.0.1:3100`).
- **How to run:**
  ```bash
  HARNESS_RUN_ID=RUN-2026-002 npm run test:evidence      # regenerate all evidence
  curl -sS http://127.0.0.1:3100/api/snakeGame/latestScore | jq .
  ```
  Copy-paste request examples for manual exploration live in
  `../test-data/sample-data/curl-examples.md`.
- **Expected output:** HTTP status line and headers (`-D -`), body, or jq-formatted JSON.
  The evidence script writes one file per probe and never edits them afterwards.
- **Where results are stored:** `harness/evidence/api-responses/<RUN>/` (demo server) and
  `harness/evidence/database-results/<RUN>/` (DB-mode degradation), e.g.
  `addScore-valid.body.json`, `page-shell.headers.txt`.
- **Known limitations:**
  - curl has **no assertions** — it records, it does not judge. Deciding pass/fail is the
    suites' job; evidence is attached to cases, not the other way round.
  - `/usr/bin/time` is not available in this sandbox; the capture script uses curl's own
    `-w '%{time_total}'` instead (see `highestScore-degraded.txt`).
  - Evidence files contain timestamps and therefore differ between runs; never diff two
    runs byte-for-byte, compare the fields that matter.

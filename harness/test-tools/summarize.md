# summarize.mjs

- **Tool:** `harness/automation/utilities/summarize.mjs` (Node, no dependencies).
- **Purpose:** turn the raw TAP files of a run into the three artefacts humans actually
  read — `summary.md`, the per-run document `summaries/<RUN>.md`, and the archived
  `historical/<RUN>/` folder — and to count `todo` tests as **known issues**, never as
  failures, so a known defect cannot masquerade as either a regression or a pass.
- **Installation:** none.
- **Configuration:** reads whatever `test-results/latest/*.tap` files exist; the run id
  comes from `HARNESS_RUN_ID` / the environment helper. Calling it with a suite name
  (`… summarize.mjs ui`) is accepted for compatibility and simply refreshes
  `summary.md` from all current TAP files — that is what the single-suite runners do so
  the summary is never stale between suites. `--finalize` additionally writes the
  per-run documents and archives the TAP files.
- **How to run:**
  ```bash
  node harness/automation/utilities/summarize.mjs            # refresh summary.md
  node harness/automation/utilities/summarize.mjs --finalize # + archive the run
  ```
  `run-all.sh` calls it with `--finalize`; the individual runners call it once at the end.
- **Expected output:**
  ```
  [summarize] RUN-2026-001: 116/139 passed, 0 failed, 18 known issues
  [summarize] wrote …/summaries/RUN-2026-001.md and archived TAP to …/historical/RUN-2026-001
  ```
- **Where results are stored:** `test-results/latest/summary.md`,
  `test-results/summaries/<RUN>.md`, `test-results/historical/<RUN>/*.tap`.
- **Known limitations:**
  - It parses TAP by pattern. A Node version that changes TAP wording would need the
    parser updated — verify against the totals block printed by `node --test` if in doubt.
  - It reports counts, not verdicts: "0 failed, 18 known issues" is a passing run, but
    read the known-issue list to know what is still broken.
  - It never deletes old runs; prune `historical/` by hand if a repo ever needs to be
    slimmed down.

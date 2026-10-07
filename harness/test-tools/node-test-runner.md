# Node.js test runner

- **Tool:** `node --test` (Node.js built-in test runner, Node 22.22.3).
- **Purpose:** executes every suite; provides TAP output, `todo` (expected-failure)
  semantics, `skip` semantics, per-test diagnostics and the exit code the runner reads.
- **Installation:** none — it ships with Node. No Jest/Vitest/Mocha is used, so there is
  no runner dependency to maintain and no transform pipeline beyond the loader.
- **Configuration:**
  - `--import ./harness/automation/utilities/register.mjs` registers the TS/CSS/alias loader.
  - `--disable-warning=MODULE_TYPELESS_PACKAGE_JSON` silences Node's package-format notice
    (the repo has no `"type"` field, which is correct for a Next.js project).
  - `HARNESS_BROWSER_ENV=1` (UI suite only) adds jsdom globals.
  - Two reporters run at once: `spec` to stdout, `tap` to `test-results/latest/<suite>.tap`.
- **How to run:** `npm run test:unit|api|ui|performance|security|database`, or `npm test`
  for everything. Files are passed as globs (`harness/automation/<suite>/*.test.mjs`) —
  never as a directory, which would execute helper files too.
- **Expected output:** one line per case (`✔`/`✖`/`﹣` for skipped), `ℹ` diagnostics for
  recorded numbers, a totals block, and the list of failing tests at the end.
- **Where results are stored:** TAP in `harness/test-results/latest/<suite>.tap`, console
  transcript in `harness/evidence/logs/<suite>-<RUN_ID>.spec.txt`, archive in
  `harness/test-results/historical/<RUN_ID>/`.
- **Known limitations:**
  - No built-in coverage instrumentation — coverage in this harness is *catalogue*
    coverage (requirement → feature → case), not line coverage.
  - `todo` tests exit green by design: a known defect never breaks the build, which is
    exactly what we want, but it means `npm test`'s exit code alone cannot tell you the
    product is clean — read the summary.
  - Assertions use `node:assert/strict`; there is no snapshot support.

**Convention:** every test name starts with its case id — `test("TC-042 | …")` — so a
name can be traced to `../test-cases/<module>/*.md` and to `../reports/traceability.md`.

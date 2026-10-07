# Next.js build & ESLint

- **Tool:** `next build` (Next.js 16.1.6, Turbopack) and `eslint` (ESLint 9 with
  `eslint-config-next`) — both already part of the project.
- **Purpose:** the **pre-flight gate**. Every HTTP-level suite runs against the
  production build, so a compile error surfaces as a build failure rather than as
  twenty confusing API failures. ESLint catches the class of mistakes (unused imports,
  missing keys, hook-rule violations) that unit tests never see.
- **Installation:** `npm install` (dependencies already declared).
- **Configuration:** `next.config.ts`, `tsconfig.json`, `eslint.config.mjs` — untouched
  by the harness.
- **How to run:**
  ```bash
  npm run build     # 7 routes, ~6.6 s on the reference machine
  npm run lint      # no findings on the reviewed commit
  ```
  The runner scripts call `build` automatically when `.next` is missing
  (`HARNESS_FORCE_BUILD=1` to force a rebuild) and log to
  `evidence/logs/build-<RUN>.log`.
- **Expected output:**
  `✓ Compiled successfully`, a route table (`/` static, three `/api/…` dynamic routes),
  and `✔ No ESLint warnings or errors` for lint.
- **Where results are stored:** console output; the build log is kept only when the
  runner performs the build (`harness/evidence/logs/build-<RUN_ID>.log`).
- **Known limitations:**
  - `next build` does **not** fail on ESLint findings in this configuration; run
    `npm run lint` separately (as the release checklist does).
  - Build time varies with Turbopack cache state; do not read it as a performance signal.
  - The build is a snapshot: suites test the build that existed when they started, so
    after editing `src/` you must rebuild (`HARNESS_FORCE_BUILD=1`) or the results
    describe the previous code.

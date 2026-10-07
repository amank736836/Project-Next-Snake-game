# Automation

The executable part of the harness. Everything here is plain Node + bash — no test
framework was added, because Node's built-in runner already provides TAP output,
`todo` and `skip` semantics.

```text
automation/
├── scripts/          bash runners (build → server → suite → summary → clean shutdown)
│   ├── run-{all,unit,api,ui,performance,security,database}.sh
│   ├── capture-evidence.sh
│   └── lib/common.sh
├── utilities/        shared code used by the suites
│   ├── register.mjs  node --import entry (loader + optional jsdom)
│   ├── loader.mjs    TS/TSX transpile + `@/` alias + CSS stubs
│   ├── env.mjs       RUN_ID, BASE_URL, run tag, environment summary
│   ├── api-client.mjs fetch helpers with timing
│   ├── fixtures.mjs  test-data loader + per-run name tagging
│   └── summarize.mjs TAP → summary.md / per-run archive
├── unit/             pure logic            TC-001…TC-029
├── api/              HTTP contract         TC-056…TC-089c
├── ui/               jsdom + React         TC-030…TC-055b, TC-090…TC-093b
├── performance/      latency & throughput  TC-100…TC-105
├── security/         surface & abuse       TC-110…TC-125
└── database/         persistence           TC-130…TC-137   (see ./database/README.md)
```

## Rules this code follows

1. **A test name starts with its case id** — `test("TC-056 | …")` — and the same id is
   documented in `../test-cases/`. `summarize.mjs` relies on the `TC-… | KNOWN ISSUE (…)`
   prefix to classify expected failures.
2. **Known defects use `{ todo: "BUG-xxx — …" }`** and assert the *desired* behaviour.
   The suite stays green, the gap stays visible, and fixing the bug flips the case to a
   normal pass without rewriting it.
3. **Characterisation pairs.** When today's behaviour is wrong, the `todo` case states
   what should happen and a second case (`TC-060d`, `TC-069b`, `TC-089b`, `TC-119b`,
   `TC-120b`) pins what actually happens, so a fix visibly changes the diff.
4. **No shared mutable state between suites.** Names are tagged per run
   (`tagName()`), and ordering assertions are relative to the fixture rows, never
   absolute — the demo store accumulates data across runs.
5. **No new dependencies.** `jsdom` is the single dev-only exception, documented in
   `../test-tools/jsdom.md`.
6. **Servers are started and stopped by the scripts**, not by tests, so a crashed test
   cannot leak a process (`setsid` + process-group kill).

## Running a single file

```bash
node --import ./harness/automation/utilities/register.mjs \
     --disable-warning=MODULE_TYPELESS_PACKAGE_JSON \
     --test harness/automation/unit/game-utils.test.mjs
```

UI files additionally need `HARNESS_BROWSER_ENV=1` and a server for the shell tests
(`HARNESS_BASE_URL`, default `http://127.0.0.1:3100`).

## Adding a suite

1. Put the file in the matching folder (or add a folder + `run-*.sh` if it is a new
   layer).
2. Use the next free `TC-` ids; document each case in `../test-cases/<module>/`.
3. Use `utilities/api-client.mjs` and `utilities/fixtures.mjs` rather than new helpers.
4. Add the runner to `package.json`, `run-all.sh` and the table in
   `../test-tools/README.md`.

# AI test-agent instructions

You are working in a repository that has an existing test harness. Your job is to
extend it truthfully. Read this whole file before running a command.

## The loop — never skip a phase

### 1. Analyze
- Read the relevant feature doc in `../features/`, then the code it names.
- Read the existing cases in `../test-cases/` for that module **before** writing one:
  duplicating an existing case is the most common waste of an agent's time.
- Identify the requirement (`REQ-xxx`) and business rule (`BR-xxx`) the behaviour
  belongs to. If there is no requirement, say so and propose one; do not pretend one
  exists.
- Anything you cannot determine from the repository is `UNKNOWN / REQUIRES VALIDATION`.
  Write that down instead of guessing.

### 2. Plan
- Choose the lowest level that can prove the behaviour: unit → API → UI → manual. A
  browser-only claim stays manual.
- Take the **next free `TC-` id** (grep first: `grep -rhoE "TC-[0-9]{3}[a-z]?" harness/`)
  and put it in the test name: `test("TC-140 | …")`.
- Decide the data you need and where it comes from (`../test-data/`), and how the test
  will be kept independent of other runs (per-run name tags).
- Decide the evidence: which TAP file and which raw artefact will prove the result.

### 3. Test
- Write the test in `../automation/<layer>/`.
- Never add a dependency. Use the shared utilities in `../automation/utilities/`.
- Never modify application source unless the change is required for the test to be
  *possible* (not to make it pass), and never silently: record it in the run summary and
  in `../TESTING_STRATEGY.md` if it affects the strategy.
- If the behaviour is wrong, write a `todo` test asserting the correct behaviour and a
  characterisation test recording today's — then file a bug (`../bugs/README.md`).

### 4. Record
- Update the case documentation in `../test-cases/<module>/` with every template field,
  including the *Actual result* you observed and the evidence path.
- Update `../reports/traceability.md` and, if you touched a known defect,
  `../bugs/known-issues.md`.
- Run the suite and let the artefacts be generated — never hand-edit
  `test-results/**` or `evidence/**`.

### 5. Verify
- Re-read your own assertions: do they fail when the behaviour is broken? If you cannot
  answer yes, the test is decoration.
- Confirm the run left no stray processes (`ss -ltn | grep 3100`).
- Confirm the summary classifies your cases as you intended (PASS vs KNOWN ISSUE vs
  skipped).

### 6. Report
- State what you ran, the exact command, the counts, and the file paths.
- Distinguish "executed and green", "executed and failing by design (BUG-xxx)" and
  "not executed — blocked because …".
- If something failed unexpectedly, report it as a failure. Do not average it away.

## Hard rules

1. **No claim without execution.** "Should pass" is not a result. Unrun work is
   `NOT_EXECUTED`.
2. **No invented numbers.** Every figure traces to `test-results/**` or `evidence/**`,
   with the run id in the text.
3. **No fabricated evidence.** Never write a file that looks like a captured response
   but was typed by hand. Capture it with `npm run test:evidence`.
4. **No secrets.** Credentials come from the environment (`${DATABASE_URL}`,
   `${HARNESS_MONGODB_URL}`). Never write a token, key or real connection string into a
   file, a test or a report — not even as a "placeholder that looks real".
5. **No test weakening.** If an assertion fails, investigate. Changing the expectation
   to match the bug is only allowed as an explicitly-labelled characterisation test,
   paired with a bug id.
6. **No application-source edits to make tests pass.** The 2026-10-07 session tried
   adding `import type` to two source files; it was reverted in favour of a loader that
   handles it. If you are tempted, look for the harness-side solution first.
7. **No dependency additions** without an explicit, recorded justification
   (jsdom is the precedent, and it is documented twice).
8. **Keep ids consistent** (`REQ-`, `FEAT-`, `SCN-`, `TC-`, `BUG-`, `RUN-`) and never
   renumber an id that already exists anywhere in the repo.
9. **Report honestly, including about yourself.** If a run was partial, say so; if you
   could not verify something, list it under *Not verified*.
10. **Finish the job.** A test added without documentation, traceability and a summary
    line is not done.
11. **Never write to `test-results/historical/`** except by running the summarizer.

## Definition of done for any AI task in this repo

- [ ] New/changed cases have ids, are documented, and appear in the traceability table.
- [ ] The relevant suite was executed and its artefacts regenerated.
- [ ] Findings either pass, or are filed as bugs with regression tests.
- [ ] No secrets, no dependencies, no unrecorded source changes, no stray processes.
- [ ] The report separates verified facts from assumptions.

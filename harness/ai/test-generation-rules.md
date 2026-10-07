# Test generation rules

These are the concrete rules an AI agent (or a human) must follow when writing tests,
data or reports in this repository. Each rule exists because ignoring it produces
confident-looking output that is wrong.

## 1. Ids

| Prefix | Meaning | Format | Allocation |
| --- | --- | --- | --- |
| `REQ-xxx` | Requirement | `REQ-001`… | Next free number in the right section of `../requirements/` |
| `BR-xxx` | Business rule | `BR-001`… | Next free number in `../requirements/business-rules.md` |
| `FEAT-xxx` | Feature | `FEAT-001`… | One per product feature |
| `SCN-xxx` | Scenario | `SCN-001`… | Ranges per file, see `../test-scenarios/README.md` |
| `TC-xxx` | Test case | `TC-001`… + letter suffix for variants (`TC-060b`) | Next free number; the id goes in the test name |
| `BUG-xxx` | Defect | `BUG-001`… | Next free; never reused after closure |
| `RUN-YYYY-nnn` | Execution | `RUN-2026-001` | One per recorded execution; ad-hoc runs use the generated default |

Never renumber. Never reuse. If you delete a case, leave a tombstone note rather than
shifting ids.

## 2. Naming a test

```js
test("TC-140 | the behaviour being proven", { todo: "BUG-007 — why it fails today" }, async () => { … });
```

- The id and the behaviour, nothing else. The reader must know what breaks when it fails.
- `KNOWN ISSUE (BUG-xxx)` belongs in the name only when the case documents a defect.

## 3. Test data

- Put reusable data in `../test-data/`; generate run-specific data in code.
- **Tag every player name per run** so parallel or repeated runs cannot collide
  (`tagName()` in `utilities/fixtures.mjs`).
- **Never** commit a real email, password, token, API key or connection string. Use
  `${TEST_USER_EMAIL}`, `${DATABASE_URL}`-style placeholders and read them from the
  environment.
- Never assert on absolute board positions or absolute top scores that another test can
  change — compute the value at runtime (`top + 1`) or filter to your tagged rows.

## 4. Assertions

- Assert the **observable** behaviour (status code, stored row, rendered markup), not
  the internals you just read in the source — otherwise the test simply restates the
  implementation.
- One `assert` message per assertion, phrased as the expectation: `"the API must reject
  a score of 0"`.
- For numbers with variance (latency), assert a threshold and print the measurement with
  `t.diagnostic(...)` so the artefact carries the data.

## 5. Known defects

Three-part pattern, always:

| Part | Where | Purpose |
| --- | --- | --- |
| `todo` case | `automation/**` | States the correct behaviour; stays red in the summary as a known issue |
| Characterisation case | next to it | Records today's behaviour; changing it after the fix is the proof the fix worked |
| Bug report | `../bugs/open/BUG-xxx.md` | The human-readable record, with the regression test named |

Do **not** simply skip a failing case (`{ skip: true }` is for environment blockers,
not for defects).

## 6. Results

- A run is identified by `RUN-YYYY-nnn` and reported with: scope, environment, commit,
  counts (total/passed/failed/known/skipped), and the artefact paths.
- Never write a number you did not read from an artefact of that run.
- Never mark a case `PASS` because a similar case passed.

## 7. Source changes

Allowed only when a test is otherwise impossible, and then:
- keep the change behaviour-neutral,
- say so explicitly in the run report and the commit message,
- re-run the full suite, lint and build afterwards.

Precedent: the loader handles TypeScript/type-only imports precisely so that no
application file needs touching.

## 8. Dependencies

One dev-only dependency (`jsdom`) was ever added, documented in
`../test-tools/jsdom.md`. If you think you need another: prove the standard library,
Node, curl, jq and the existing devDependencies cannot do the job, then document the
addition in the same format. "It would be easier" is not a justification.

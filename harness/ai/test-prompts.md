# Prompts for AI-assisted testing

Reusable starting prompts, each pre-loaded with this repository's rules. Paste one,
then let the agent follow [`test-agent-instructions.md`](test-agent-instructions.md).

> **Before any of these:** the agent must have read `../features/README.md` and the
> feature doc for the area, plus `test-generation-rules.md`. Add that to the prompt if
> you are not sure it did.

## 1 — "Test this feature"

```text
Act as the test agent for this repository. Read harness/ai/test-agent-instructions.md.
Feature: FEAT-006 (leaderboard).
Task: extend the automated coverage for pagination boundaries.
Constraints: no new dependencies; do not modify src/; use the next free TC ids; if the
build disagrees with the documented expectation, file a BUG and add a todo test plus a
characterisation test. Run `npm run test:api`, then update harness/test-cases/,
harness/reports/traceability.md and harness/reports/coverage.md with the real results.
Report: command run, counts, files changed, anything not verified.
```

## 2 — "Hunt for validation gaps in this endpoint"

```text
Probe POST /api/snakeGame/addScore for input-validation gaps with curl (see
harness/test-data/sample-data/curl-examples.md), against a locally built server.
For every gap: capture the raw request/response into harness/evidence/, decide whether
it is a bug (severity + priority per harness/bugs/README.md), and either point at an
existing TC or allocate the next free TC ids (todo + characterisation pair).
Do not change src/. Finish with `npm run test:evidence` and a table of findings.
```

## 3 — "Turn a manual case into an automated one"

```text
Read harness/test-cases/manual/browser-and-visual.md, case TC-209 (name-field rules).
Decide whether it can be automated with jsdom under the existing harness (no new
dependencies, no browser binary). If yes: write the test, allocate the next free TC id,
move the documentation to harness/test-cases/ui-shell/ and keep the manual case only if
part of it stays un-automatable — state exactly which part and why.
If no: say so explicitly and leave the manual case alone.
```

## 4 — "Regenerate the reports for run RUN-2026-002"

```text
Read harness/test-results/summaries/RUN-2026-002.md and the TAP files, then update
harness/reports/{test-summary,coverage,regression-report,release-readiness}.md so every
number cites that run. Compare totals with RUN-2026-001 and list any case that changed
state, with the reason. Never invent a figure: if something is missing from the
artefacts, write UNKNOWN / REQUIRES VALIDATION and say what would settle it.
```

## 5 — "Fix a bug and prove it"

```text
Take BUG-017 (harness/bugs/open/BUG-017.md). Write the failing test first if it is not
already there, then the smallest fix in src/lib/db.ts that keeps TC-131's fast-failure
behaviour. Re-run `npm test`, promote TC-131b from todo to a normal case, move the bug
report to harness/bugs/resolved/ with the verification block filled in from the run,
and update harness/bugs/known-issues.md and the reports. If the fix does not work,
revert it and report honestly.
```

## 6 — "Review this harness"

```text
Audit harness/ for correctness rather than additions: ids duplicated or skipped, links
that do not resolve, numbers in reports that disagree with test-results/, cases claimed
PASS with no evidence, secrets, empty files, and any test that cannot fail.
Produce a numbered list of findings with file:line references and fix only the
mechanical issues; propose the rest.
```

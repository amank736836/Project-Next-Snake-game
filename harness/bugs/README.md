# Bug Reports

## Layout

| Path | Contents |
| --- | --- |
| `open/` | `BUG-001` … `BUG-018` — every defect found by this harness. None are fixed yet, so there is no `resolved/` directory; it will be created with the first verified fix. |
| `known-issues.md` | The register: one row per bug with severity, the tests that cover it and its release impact. |

`BUG-010` is in use ("unusable rows are persisted permanently"). Ids are never
reused or renumbered — a bug keeps its id for life, even after it is closed.

## Before you file one

1. **Reproduce it.** Run the suite (or the manual steps) and keep the raw output.
2. **Check the known issues.** If it is already there, add evidence rather than a new id.
3. **Decide the regression test while filing**, not later: a bug report without a
   regression test is a story, not a defect record. Use the `todo` mechanism described
   in `../automation/README.md` — the test states the correct behaviour and stays red
   in the summary until the fix lands.
4. **Never invent severity.** Severity = how bad the impact is; priority = when it
   should be fixed. An unreachable code path can be Low/Low even if the bug is real.

## Template (copy this)

```markdown
# BUG-xxx — <title>

| Field | Value |
| --- | --- |
| Bug ID | `BUG-xxx` |
| Title | <title> |
| Severity | Critical / High / Medium / Low / Unknown |
| Priority | P1 / P2 / P3 |
| Feature | FEAT-xxx |
| Environment | build + storage mode + platform |
| Status | OPEN / IN_PROGRESS / FIXED / VERIFIED / CLOSED |

**Preconditions:** what must be true first

## Steps to Reproduce
1. …

## Expected
…

## Actual
…

## Reproducible
YES / NO / INTERMITTENT — and how consistently

## Evidence
paths under `../evidence/` or TAP files, never a narrative

## Root Cause
the code path and why it behaves this way

## Fix
the suggested change

## Regression Test
the TC-xxx that proves the fix (and the `todo` case that flips green)

## Verification after the fix
re-run the suite, then fill in — never before:

| Field | Value |
| --- | --- |
| Verified by | <agent/human> |
| Verification run | RUN-YYYY-nnn |
| Result | VERIFIED / STILL FAILING |
| Evidence | path to the re-run TAP |
```

## Status vocabulary

| Status | Meaning |
| --- | --- |
| `OPEN` | Reproduced, not being worked on |
| `IN_PROGRESS` | A fix is being written |
| `FIXED` | Code changed; the regression test is now expected to pass |
| `VERIFIED` | Re-executed after the fix, regression test green, evidence attached |
| `CLOSED` | Verified and shipped in a release |

Moving a bug to `FIXED` without a verification run is not allowed; that is exactly
what the `todo` test prevents.

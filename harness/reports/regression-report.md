# Regression Report — RUN-2026-001

## Baseline

**RUN-2026-001 is the first recorded execution of this harness, so it establishes the
baseline.** There is no earlier run to regress from, and this report does not pretend
otherwise: "0 regressions" means *nothing was compared*, not *nothing could break*.

| | |
| --- | --- |
| Baseline run | `RUN-2026-001` (2026-10-07) |
| Baseline result | 139 cases · 116 pass · 0 unexpected failures · 18 known issues · 5 blocked |
| Baseline commit | `1849ac4` (+ harness only) |
| Comparison basis for future runs | the archived TAP in `test-results/historical/RUN-2026-001/` and `test-results/summaries/RUN-2026-001.md` |

## Regression suite executed

The ten regression scenarios (`SCN-025`…`SCN-034`) all ran, backed by 41 cases:

| Scenario | Protected behaviour | Cases | Result |
| --- | --- | --- | --- |
| SCN-025 | Score merge semantics (best kept, latest updated, visits counted) | TC-020, TC-057, TC-058, TC-073 | PASS |
| SCN-026 | Leaderboard ordering and the `score > 0` filter | TC-014, TC-016, TC-072, TC-074, TC-083 | PASS |
| SCN-027 | Pagination arithmetic and boundaries | TC-015, TC-070, TC-075, TC-076, TC-077 | PASS |
| SCN-028 | The game is still playable after refactors of the movement effect | TC-032…TC-039, TC-048 | PASS |
| SCN-029 | The speed ramp (95 → 55 ms) | TC-039 | PASS |
| SCN-030 | Pause/resume round-trip through obfuscated storage | TC-004, TC-005, TC-041 | PASS |
| SCN-031 | Corrupt browser storage cannot break a run | TC-006, TC-007, TC-042 | PASS (TC-042b → BUG-011) |
| SCN-032 | Component markup contracts | TC-049…TC-055b | PASS |
| SCN-033 | Pre-paint theme bootstrap and served shell | TC-090…TC-093 | PASS |
| SCN-034 | Demo-mode fallback without a database | TC-025, TC-059, TC-130, TC-132 | PASS |

## Smoke status

All eight smoke scenarios (`SCN-001`…`SCN-008`) passed in this run:
page shell and metadata, demo-mode server answering, score round-trip, recent hunts,
start/pause/resume in a real DOM, 404 handling, clean build and lint, JSON-only API.

## Comparison procedure for the next run

```bash
HARNESS_RUN_ID=RUN-2026-002 npm test
diff <(grep -E '^(ok|not ok)' harness/test-results/historical/RUN-2026-001/api.tap) \
     <(grep -E '^(ok|not ok)' harness/test-results/historical/RUN-2026-002/api.tap)
```

Judge a difference by the case, not the count:

| Change in a case | Meaning | Action |
| --- | --- | --- |
| PASS → fail (no bug id) | **Regression** | Stop and investigate; it blocks release |
| PASS → known issue | A defect was (re)discovered or a `todo` was added | Check the bug register |
| Known issue → PASS | The bug was fixed | Promote the case out of `todo`, update `bugs/`, coverage and readiness |
| PASS → skipped | Environment lost (e.g. database removed) | Re-run with the dependency |
| New case | Coverage grew | Update the traceability table |

## Known-issue trend

| Run | Cases | Pass | Known issues | Skipped | Regressions |
| --- | --- | --- | --- | --- | --- |
| RUN-2026-001 (baseline) | 139 | 116 | 18 | 5 | n/a |

Future rows are appended here by whoever records the run — never edited retroactively.

## Regression risk assessment (what the suite does *not* protect)

| Area | Risk | Why it is not covered | Mitigation |
| --- | --- | --- | --- |
| CSS layout and responsive behaviour | Medium — a stylesheet change is invisible to every automated suite | jsdom has no layout engine | Visual pass before release (TC-200…TC-205) |
| Animation and reduced motion | Low | needs a real browser | TC-206, TC-207 |
| MongoDB queries and indexes | Medium | no database in this environment | Run the gated suite in an environment that has one |
| Deployment/CDN behaviour | Medium | no deployment accessible | TC-219 after each deploy |
| Accessibility conformance | Medium | markup assertions are not a conformance audit | Browser a11y audit in the manual pass |

## Verdict

No unexpected failures, no flaky cases observed in two consecutive executions, and the
suite cleaned up after itself both times (no stray `next-server` processes, ports
3100/3101 free). The harness is fit to be treated as the regression baseline for
subsequent runs.

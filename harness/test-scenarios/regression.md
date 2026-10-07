# Regression Scenarios

Functionality that a change is likely to disturb. Each scenario names the change
that would endanger it and the tests that catch the damage. This list is the
checklist to walk whenever a matching area is touched.

| ID | Scenario | Endangered by | Test cases | Status |
| --- | --- | --- | --- | --- |
| SCN-025 | Score merge semantics (best kept, latest updated, visits counted, one row per name) still hold | Any edit to `addScore/route.ts`, `memoryScores.upsertScore`, or the `Score` schema | TC-020, TC-057, TC-058, TC-073 | PASS |
| SCN-026 | Leaderboard ordering and the `score > 0` filter are unchanged | Edits to either GET route, sort clauses or the store's list functions | TC-014, TC-016, TC-072, TC-074, TC-083 | PASS |
| SCN-027 | Pagination arithmetic (page, limit, totalPages, boundaries) is unchanged | Changes to pagination maths, `limit` defaults or the UI's page buttons | TC-015, TC-070, TC-075, TC-076, TC-077 | PASS |
| SCN-028 | The game remains playable after refactors of the movement effect | Changes to `useSnakeGame`, the interval, or the direction guard | TC-032…TC-039, TC-048 | PASS |
| SCN-029 | The speed ramp still starts at 95 ms and floors at 55 ms | Any change to the score formula (it is duplicated in two files) | TC-039 | PASS |
| SCN-030 | Pause/resume round-trips the run, including direction and apple position | Changes to the obfuscation format or `GameMissionData` | TC-004, TC-005, TC-041 | PASS |
| SCN-031 | Corrupt browser storage cannot break a live run | Changes to save reading/clearing | TC-006, TC-007, TC-042 | PASS |
| SCN-032 | Component markup contracts (labels, roles, empty and loading states) are stable | Refactors of MissionHub/Leaderboard/GameOver/Controls markup | TC-049…TC-055b | PASS |
| SCN-033 | The pre-paint theme bootstrap and the served shell are unchanged | Changes to `layout.tsx`, metadata or `SnakeGame`'s loader branch | TC-090, TC-091, TC-092, TC-093 | PASS |
| SCN-034 | Demo-mode fallback still works when no database is configured | Changes to `db.ts`, environment handling or the route branching | TC-025, TC-059, TC-130, TC-132 | PASS |

## Standing regression rules

1. **Every fixed bug gets a regression test.** When a `BUG-xxx` is closed, its `todo`
   test is promoted to a normal test (remove the `todo` option) and must stay green.
2. **Ordering tests are relative, not absolute.** Suite data is namespaced per run so
   accumulated demo data cannot turn a green suite red.
3. **Two formulas, one truth.** The speed ramp and the score filters exist in more
   than one place; the regression suite asserts the *observable* numbers (ms, rows)
   rather than internal constants, which is what catches a desynchronised copy.
4. **Rebuild before you re-test.** SCN-025…SCN-034 exercise the built app; the runner
   scripts build when `.next` is missing (`HARNESS_FORCE_BUILD=1` to force).

## Historical baseline

`RUN-2026-001` (2026-10-07) is the reference green run: 139 cases, 116 passed,
0 unexplained failures, 18 known issues, 5 blocked. Compare future runs with
`test-results/historical/RUN-2026-001/` and `test-results/summaries/`.

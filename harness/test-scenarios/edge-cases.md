# Edge-Case Scenarios

Boundaries, empties, maximums, duplicates, special characters, concurrency and
degenerate states — each with the behaviour observed in `RUN-2026-001`.

| ID | Scenario | Boundary | Observed | Expected | Test cases |
| --- | --- | --- | --- | --- | --- |
| SCN-047 | Score is exactly zero | `score = 0` | stored, invisible on both boards | same (BR-003) | TC-016, TC-074, TC-083 |
| SCN-048 | Score is missing / null | `score: undefined / null` | row stored with no score, never ranked | 400 (BUG-001, BUG-010) | TC-067, TC-069b |
| SCN-049 | Score is negative | `-5` | accepted, filtered out of boards | 400 | TC-069b (API path); `invalid-scores.json` fixture |
| SCN-050 | Score is fractional | `2.7` | accepted and ranked with the fraction | 400 | edge fixture, TC-069b |
| SCN-051 | Score is enormous | `999 999 999 + 1` | rank 1 immediately | plausibility check (BUG-016) | TC-119, TC-119b |
| SCN-052 | Name is empty or whitespace | `""`, `"   "` | stored untrimmed | 400 (BUG-003) | TC-069, TC-069b |
| SCN-053 | Name at the length boundary | 20 chars vs 5 000 chars | both accepted by the API | 20 max (BUG-003) | TC-069 |
| SCN-054 | Name with special characters | `<script>alert(1)</script>`, `Игрок`, `  Padded  ` | stored verbatim; React escapes on render | 400 / normalised (BUG-003) | TC-116, TC-069b |
| SCN-055 | Name contains a blocked substring inside a legitimate word | `Hancock`, `Bharat`, `Tattaglia` | silently renamed to `Anonymous` | accept the name (BUG-002) | TC-060b |
| SCN-056 | Two different blocked names in one session | `shit`, `bitch` | one shared `Anonymous` row, visits merged | distinct handling (BUG-004) | TC-060c, TC-060d |
| SCN-057 | Same name, different letter case | `Tester` vs `tester` | two separate players | documented behaviour (BR-006) | TC-022 |
| SCN-058 | Duplicate submissions in the same millisecond | 10 parallel POSTs, same name | one row, `visits: 10` in demo mode | one row (MongoDB path is unverified — BUG-018) | TC-089c |
| SCN-059 | Maximum page size requested | `?limit=100000` | accepted, whole board returned | cap the page size (BUG-012) | TC-079 |
| SCN-060 | Very large request body | 1.2 MB JSON | accepted in ~8 ms | 413 / cap (BUG-013) | TC-089, TC-089b |
| SCN-061 | Full board (every cell occupied) | 400-segment snake | `generateFood` recurses until the stack overflows | terminate gracefully (BUG-006) | TC-010 |
| SCN-062 | Corrupt / truncated browser save | random base64, half a save | unreadable save is ignored, run continues, save never cleared | drop the save (BUG-011) | TC-006, TC-007, TC-042, TC-042b |

## Additional degenerate states worth knowing

| State | Behaviour | Why it matters |
| --- | --- | --- |
| Apple spawns next to the head | normal play; eating is a single step | TC-032 asserts the first apple never spawns under the head |
| Snake fills a row and wraps | the wrap cell is occupied → death | the engine treats the body as blocking, wrap included (TC-034 + TC-040) |
| Pause → resume → pause | the newest run overwrites the save | one slot only |
| Game over with an API outage | the dialog still appears; the score is lost | no retry queue exists (`UNKNOWN / REQUIRES VALIDATION`) |
| localStorage disabled | game still playable, nothing persists | guarded by `try/catch` in every access (TC-042 pattern) |

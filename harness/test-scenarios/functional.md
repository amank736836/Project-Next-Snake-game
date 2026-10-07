# Functional Scenarios

Happy paths and alternate flows for every feature, including validation and
business-rule behaviour.

| ID | Scenario | Feature | Test cases | Status |
| --- | --- | --- | --- | --- |
| SCN-009 | A named player starts a mission from the hub and the board resets to a single segment | FEAT-001, FEAT-005 | TC-032, TC-037 | PASS |
| SCN-010 | The snake advances one cell per step and the body follows the head | FEAT-001 | TC-033 | PASS |
| SCN-011 | Portal walls wrap the snake on all four edges (no wall death) | FEAT-001 | TC-034 | PASS |
| SCN-012 | Eating an apple adds one point, one segment and respawns the apple off the body | FEAT-001, FEAT-002 | TC-002, TC-003, TC-038 | PASS |
| SCN-013 | The step time follows `max(95 − score, 55)` ms | FEAT-002 | TC-039 | PASS |
| SCN-014 | Self-collision ends the run and opens the game-over dialog with score, best and length | FEAT-001, FEAT-003 | TC-040, TC-054 | PASS |
| SCN-015 | A new record is celebrated differently from a normal defeat | FEAT-003 | TC-055 | PASS |
| SCN-016 | Pausing stores the run; the hub offers RESUME MISSION; resuming restores it exactly | FEAT-003, FEAT-009 | TC-041, TC-045, TC-050 | PASS |
| SCN-017 | Starting without a name is refused and the field is highlighted | FEAT-005 | TC-031, TC-050 | PASS |
| SCN-018 | Arrow keys, WASD and the D-pad all steer; reversals are ignored | FEAT-004 | TC-035 | PASS |
| SCN-019 | Typing in the name field never steers the snake | FEAT-004 | TC-036 | PASS |
| SCN-020 | The hall of fame shows the top players, ranked, with the current player tagged | FEAT-006 | TC-051, TC-072 | PASS |
| SCN-021 | Recent hunts list the five most recently updated players regardless of score | FEAT-006 | TC-081, TC-082 | PASS |
| SCN-022 | Paging shows exactly five rows per page and disables buttons at the bounds | FEAT-006 | TC-051, TC-070, TC-075, TC-077 | PASS |
| SCN-023 | A finished run is submitted once and merged into the player's existing row | FEAT-007 | TC-040, TC-057, TC-058 | PASS |
| SCN-024 | Theme and personal best survive a reload; a paused run survives too | FEAT-009, FEAT-010 | TC-041, TC-043, TC-044, TC-091 | PASS |

## Alternate flows worth keeping in the suite

| Flow | Expectation | Test case |
| --- | --- | --- |
| Second run is worse than the first | best score unchanged, latest score updated, visits +1 | TC-057 |
| Second run equals the first | still one row | TC-058 |
| Player reuses an existing name | merged, not duplicated | TC-073 |
| Player pauses twice in a row | the newer run replaces the save | TC-041 (save overwrite is implicit) |
| Player leaves the leaderboard open and pages back and forth | no out-of-range requests | TC-046 |

# Game engine — positive cases

Documented behaviour of the engine, its inputs and the session flow.
Executed **2026-10-07 · RUN-2026-001**. Automation: `automation/unit/game-utils.test.mjs`
(TC-001…TC-005), `automation/ui/game-hook.test.mjs` (TC-032…TC-045, jsdom + React `act`).
Evidence: `evidence/logs/unit-RUN-2026-001.spec.txt` / `evidence/logs/ui-RUN-2026-001.spec.txt`;
raw TAP in `test-results/latest/{unit,ui}.tap`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-001 | FEAT-001 | High | Unit | none | Import `utils.ts`, read `GRID_SIZE` and `INITIAL_SNAKE_BODY` | — | 20×20 grid, one segment at (5,5) | `20`, `[[5,5]]` | PASS | AUTOMATED | unit.tap | REQ-001, BR-009 | — |
| TC-002 | FEAT-001 | High | Unit | empty board | Call `generateFood` 500×, assert every cell is inside the board | 500 draws | All cells within `0…19` on both axes | 500/500 inside | PASS | AUTOMATED | unit.tap | REQ-004 | — |
| TC-003 | FEAT-001 | High | Unit | body occupying 200 cells | Call `generateFood` 300× against that body, count collisions | 300 draws | Food never lands on the body | 0 collisions | PASS | AUTOMATED | unit.tap | REQ-004 | — |
| TC-032 | FEAT-001, FEAT-005 | Critical | Integration (UI) | jsdom, `fetch` mocked, hook on the menu | Set a name, call `startGame()`, inspect state and board | name `Tester__TAG__` | State `playing`, one segment at (5,5) heading right, score 0 | as expected | PASS | AUTOMATED | ui.tap | REQ-001, REQ-012 | — |
| TC-033 | FEAT-001 | Critical | Integration (UI) | run in progress, apple not adjacent | Advance the 95 ms interval three times | mocked timers | Head moves one cell per tick, body follows, length constant | as expected | PASS | AUTOMATED | ui.tap | REQ-002 | — |
| TC-034 | FEAT-001 | High | Edge (UI) | head in column 19 | Steer right, advance one interval | mocked timers | Head wraps to column 0, run continues | wrapped, still `playing` | PASS | AUTOMATED | ui.tap | REQ-003, BR-009 | — |
| TC-035 | FEAT-004 | High | Integration (UI) | run in progress | Dispatch arrows, WASD, space; then a reversal | 9 key events | All aliases steer, reversal ignored | as expected | PASS | AUTOMATED | ui.tap | REQ-009, REQ-010 | — |
| TC-037 | FEAT-005 | Medium | Integration (UI) | menu with a valid name | Dispatch `ArrowUp`, inspect state and direction | name `Tester__TAG__` | Run starts and adopts the direction | started, direction up | PASS | AUTOMATED | ui.tap | REQ-014 | — |
| TC-038 | FEAT-002 | Critical | Integration (UI) | apple directly ahead | Advance one interval, compare score/length/apple | apple at head+1 | Score +1, length +1, apple respawns off-body | +1 score, +1 length | PASS | AUTOMATED | ui.tap | REQ-005 | — |
| TC-039 | FEAT-002 | High | Integration (UI) | safe play path | Measure the interval at scores 0,1,2 and at score 40 | interval readings | 95 → 94 → 93 ms, floor 55 ms | 95/94/93/55 ms | PASS | AUTOMATED | ui.tap | REQ-006, BR-008 | — |
| TC-041 | FEAT-003, FEAT-009 | Critical | Integration (UI) | run in progress, score > 0 | Pause → inspect the save → resume → compare state | mission snapshot | Save obfuscated (no name/JSON), resume restores everything, save deleted | restored exactly, save consumed | PASS | AUTOMATED | ui.tap | REQ-015…REQ-017 | — |
| TC-044 | FEAT-009 | Medium | Integration (UI) | `nagini_best` seeded before mount | Mount the hook, read `sessionBest` | `nagini_best = "17"` | Stored best score restored | `17` | PASS | AUTOMATED | ui.tap | REQ-020 | — |
| TC-045 | FEAT-003, FEAT-009 | Medium | Integration (UI) | valid save exists before mount | Mount the hook, read `hasSavedGame` | obfuscated mission | `hasSavedGame` true → RESUME offered | true | PASS | AUTOMATED | ui.tap | REQ-015 | — |

Steps for automated rows are the code in the named test file; the column states what
that code does so the case can be replayed by hand.

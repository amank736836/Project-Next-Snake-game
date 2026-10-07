# Game engine — regression cases

Cases that pin behaviour a change could silently alter. Executed
**2026-10-07 · RUN-2026-001**. Automation: `automation/unit/game-utils.test.mjs`
(TC-008), `automation/ui/game-hook.test.mjs` (TC-030, TC-042, TC-042b, TC-048).

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-008 | FEAT-001 | Medium | Regression (Unit) | none | Call `getSnakePartRotation` for the four direction vectors | `[1,0]`, `[-1,0]`, `[0,1]`, `[0,-1]` | right / left / down / up head classes | as expected | PASS | AUTOMATED | unit.tap | REQ-002 | — |
| TC-030 | FEAT-003, FEAT-006 | High | Regression (UI) | jsdom, `fetch` mocked | Mount the hook and inspect the screen and fetch calls | two endpoints | Starts on the menu screen and requests both leaderboards | menu + 2 calls | PASS | AUTOMATED | ui.tap | REQ-022 | — |
| TC-042 | FEAT-003, FEAT-009 | High | Regression (UI) | a corrupt save in storage, run in progress | Mount resuming state, play one interval | `snake_mission_save = "!!not-valid!!"` | The corrupt save is ignored and the current run is unaffected | run unaffected | PASS | AUTOMATED | ui.tap | REQ-016 | — |
| TC-042b | FEAT-003, FEAT-009 | Medium | Regression (UI) | a corrupt save in storage | Mount the hub, inspect `hasSavedGame` and the resume button | `snake_mission_save = "!!not-valid!!"` | The unusable save should be discarded so RESUME disappears | ❌ RESUME MISSION stays active forever | KNOWN ISSUE | AUTOMATED | ui.tap | REQ-015 | BUG-011 |
| TC-048 | FEAT-001, FEAT-002 | High | Regression (UI) | a two-segment snake (score 1) | Try every direction against its own body and advance | mocked timers | A snake shorter than four segments cannot die (minimum scoring run = 3 points) | still playing | PASS | AUTOMATED | ui.tap | REQ-008, BR-010 | — |

Why these are regression cases: TC-008 pins the visual mapping that CSS depends on,
TC-030 pins the data-loading contract between the hook and the API, TC-042/042b pin
the "bad data never breaks the game" guarantee, and TC-048 encodes a subtle business
rule (`BR-010`) that is easy to break when collision detection is refactored.

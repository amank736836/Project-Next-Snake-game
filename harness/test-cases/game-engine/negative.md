# Game engine — negative cases

Cases that prove the engine refuses, ignores or terminates invalid input.
Executed **2026-10-07 · RUN-2026-001**. Automation: `automation/ui/game-hook.test.mjs`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-031 | FEAT-005 | High | Negative (UI) | menu, name empty or whitespace | Call `startGame()`; read state and `alert` | `""`, `"   "` | State stays `menu`, `alert` becomes true | blocked, alert raised | PASS | AUTOMATED | ui.tap | REQ-012 | — |
| TC-036 | FEAT-004 | Medium | Negative (UI) | a text input is focused during play | Dispatch `keydown` with `document.activeElement` on the name field | `ArrowUp`, `w` | Direction unchanged; the keystroke never steers | unchanged | PASS | AUTOMATED | ui.tap | REQ-011 | — |
| TC-040 | FEAT-001, FEAT-003 | Critical | Negative (UI) | snake long enough to collide (≥ 4 segments) | Steer the head into the body, advance one interval | mocked timers | Run ends: state `gameOver`, best score persisted, save cleared, one POST to `addScore` | as expected, exactly one POST | PASS | AUTOMATED | ui.tap | REQ-007, REQ-019 | — |

The remaining negative surface lives in the modules that own it:
`score-api/negative.md` (invalid payloads), `leaderboard/negative.md` (invalid paging),
`security/negative.md` (abuse and hardening).

# Leaderboard — regression cases

Data-flow behaviour that a refactor could silently break. Executed
**2026-10-07 · RUN-2026-001**. Automation: `automation/ui/game-hook.test.mjs`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-046 | FEAT-006 | Medium | Regression (UI) | page 2 of a 3-page board loaded | Call `handlePageChange` forward past the last page and backward past page 1 | `totalPages = 3` | Requests never leave the valid range; the page indicator stays coherent | bounds respected | PASS | AUTOMATED | ui.tap | REQ-025 | — |
| TC-047 | FEAT-006, FEAT-012 | High | Regression (UI) | the scores API rejects (network error / 500) | Mount the hook and let the fetches fail | `fetch` rejects | Loading ends, both boards fall back to empty arrays, the game stays playable, no unhandled rejection | degraded gracefully | PASS | AUTOMATED | ui.tap | REQ-033, REQ-050 | — |

TC-047 is the single most valuable regression case in this module: it pins the
"backend trouble never breaks the game" guarantee that the client's `try/catch`
in `fetchScores` provides.

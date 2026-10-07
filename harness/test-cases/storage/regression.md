# Storage — regression cases

Ordering guarantees a refactor could quietly break. Executed
**2026-10-07 · RUN-2026-001**. Automation: `automation/unit/memory-scores.test.mjs`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-021 | FEAT-008 | Low | Regression (Unit) | an existing player | Record `updatedAt`, upsert a new score, compare timestamps | two writes | `updatedAt` is refreshed, so the player leads "recent hunts" after playing | refreshed | PASS | AUTOMATED | unit.tap | BR-005 | — |

`updatedAt` is the *only* thing that distinguishes recent hunts from the best-score
board (BR-005). If an upsert ever stopped refreshing it, the feature would silently
degrade to "first played, first listed" — which is exactly the kind of bug this case
exists to catch. TC-017 covers the ordering itself; this one guards the input to that
ordering.

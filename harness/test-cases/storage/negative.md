# Storage — negative cases

Failure behaviour: invalid paging in the store, and an unreachable database.
Executed **2026-10-07 · RUN-2026-001**. Automation:
`automation/unit/memory-scores.test.mjs` (TC-024) ·
`automation/database/degradation.test.mjs` (TC-130…TC-132, against a server started
with `DATABASE_URL=mongodb://127.0.0.1:27099/…`). Captured responses:
`evidence/database-results/RUN-2026-001/`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-024 | FEAT-008 | Medium | Negative (Unit) | one visible player | Call `listHighest(NaN, 5)` and `listHighest(1, NaN)` | `NaN` | An error, or a documented fallback — never a silent empty board with a non-zero total | ❌ both return an empty `scores` array | KNOWN ISSUE | AUTOMATED | unit.tap | REQ-025 | BUG-005 |
| TC-130 | FEAT-008 | High | Integration | server started with an unreachable `DATABASE_URL` | Call all three endpoints | `mongodb://127.0.0.1:27099/…` | A predictable failure (error status, no hang), bounded by the connect timeout | 400 with the driver error; first call 1.54 s, subsequent calls ≤ 12 ms | PASS | AUTOMATED | db.tap, `*-degraded.txt` | REQ-059 | — |
| TC-131 | FEAT-008 | High | Integration | as TC-130 | Measure the first and second failing calls | — | The rejected connection is cached (fast failure), no repeated 1.5 s stalls | 1.54 s → 0.009 s | PASS | AUTOMATED | db.tap | REQ-059 | — |
| TC-131b | FEAT-008 | High | Integration | server started with an unreachable `DATABASE_URL` | After the failure, call the read endpoint again and inspect the mode | — | The server should fall back to the in-memory board (or retry), not stay broken forever | ❌ the rejected promise is cached permanently; no recovery without a restart | KNOWN ISSUE | AUTOMATED | db.tap, `latestScore-degraded.txt` | REQ-059 | BUG-017 |
| TC-132 | FEAT-008, FEAT-012 | High | Integration | as TC-130 | Fetch the API and the page with the database down | — | The front end still receives JSON (no HTML error page) and keeps rendering | JSON 400 from the API; page served normally | PASS | AUTOMATED | db.tap | REQ-033, REQ-050 | — |

The distinction between TC-131 and TC-131b matters: caching a rejected promise makes
failures *fast* (good) but also *permanent* (bad). The fix for BUG-017 must keep the
first property while restoring recovery — e.g. clear the cached promise on rejection.

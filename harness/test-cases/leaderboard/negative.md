# Leaderboard — negative cases

Invalid paging input. Executed **2026-10-07 · RUN-2026-001**.
Automation: `automation/api/highestScore.test.mjs`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-078 | FEAT-006 | Medium | Negative (API) | non-empty board | `GET /highestScore?page=abc&limit=5` | `page=abc` | Invalid input rejected (400) or coerced to page 1 | ❌ `page: null` echoed back in `pagination` while rows are silently dropped | KNOWN ISSUE | AUTOMATED | api.tap | REQ-025 | BUG-005 |
| TC-078b | FEAT-006 | Medium | Characterisation (API) | non-empty board | Probe `page=0`, `limit=0`, `limit=abc` | invalid values | Documents today's exact behaviour so a fix is visible in the diff | `page 0` accepted, `limit 0/abc` → `limit: null`, `totalPages: null` | PASS (characterisation) | AUTOMATED | api.tap | REQ-025 | BUG-005 |

Both cases share one root cause: `parseInt()` results are used without validation in
`src/app/api/snakeGame/highestScore/route.ts`. `BUG-005` stays open until the route
validates its query parameters.

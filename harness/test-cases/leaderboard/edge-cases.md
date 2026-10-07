# Leaderboard — edge cases

Boundaries of the paging contract. Executed **2026-10-07 · RUN-2026-001**.
Automation: `automation/api/highestScore.test.mjs`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-076 | FEAT-006 | High | Edge (API) | a small board | Request a page beyond the last one | `page = 999` | Empty `scores` array, HTTP 200, coherent pagination — never an error | empty array, 200 | PASS | AUTOMATED | api.tap | REQ-025 | — |
| TC-079 | FEAT-006 | High | Edge (API) | a small board | Request an absurd page size | `limit = 100000` | A sane implementation caps the page size | ❌ the whole board is returned (unbounded limit = data-scraping and payload vector) | KNOWN ISSUE | AUTOMATED | api.tap | REQ-025, REQ-042 | BUG-012 |

**Boundary values worth adding when the API is hardened** (`NOT_EXECUTED`, no case id yet):
negative `page`/`limit`, `limit = 1`, `page = totalPages`, and a `limit` larger than the
number of stored players — the last two are covered indirectly by TC-075 and TC-077.

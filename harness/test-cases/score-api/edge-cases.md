# Score API — edge cases

Boundaries of the write path. Executed **2026-10-07 · RUN-2026-001**.
Automation: `automation/api/methods-and-body.test.mjs`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-089 | FEAT-007 | High | Edge (API) | server running | Send 60 rapid submissions without a size cap and check for a 413/429 | 60 small payloads | Some form of limit (413 or 429) | ❌ none — every write is accepted | KNOWN ISSUE | AUTOMATED | api.tap | REQ-049 | BUG-013 |
| TC-089b | FEAT-007 | Medium | Characterisation (API) | server running | POST a 1.2 MB JSON body | 1.2 MB string field | Documents the exact response and latency for an oversized body | 201 in ~8 ms (no cap, JSON body parsed) | PASS (characterisation) | AUTOMATED | api.tap | REQ-049 | BUG-013 |
| TC-089c | FEAT-007 | High | Edge (API) | server running | Fire 10 parallel submissions for the same fresh name, then read the board | 10 × `{ name, score: 1 }` | One row, `visits = 10` — no fork, no lost update | one row, visits 10 | PASS | AUTOMATED | api.tap | REQ-026, BR-001 | — |

TC-089c passes in demo mode because the in-memory store is single-threaded. The
equivalent check against MongoDB is **TC-135**, which is `NOT_EXECUTED` here and is
tracked as `BUG-018` (`UNKNOWN / REQUIRES VALIDATION`) because the route does
`findOne` + `save` without an atomic upsert or a unique index.

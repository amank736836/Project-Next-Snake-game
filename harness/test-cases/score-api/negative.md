# Score API — negative cases

Rejection of malformed and abusive payloads. Executed
**2026-10-07 · RUN-2026-001**. Automation: `automation/api/addScore.test.mjs`.
Captured raw responses: `evidence/api-responses/RUN-2026-001/addScore-missing-name.*`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-061 | FEAT-007 | High | Negative (API) | server running | POST a payload with no `name` | `{ "score": 5 }` | 400 with a JSON body | 400, but the message is the raw `TypeError` text | PASS (see BUG-014 for the message leak) | AUTOMATED | api.tap, `addScore-missing-name.*` | REQ-029 | BUG-014 |
| TC-062 | FEAT-007 | High | Negative (API) | server running | POST an empty object | `{}` | 400 | 400 | PASS | AUTOMATED | api.tap | REQ-029 | — |
| TC-063 | FEAT-007 | High | Negative (API) | server running | POST malformed JSON | `{"name":` | 400 with a JSON error body | 400 `Unexpected end of JSON input` | PASS | AUTOMATED | api.tap | REQ-029 | — |
| TC-064 | FEAT-007 | High | Negative (API) | server running | POST an empty body | `` | 400 | 400 | PASS | AUTOMATED | api.tap | REQ-029 | — |
| TC-065 | FEAT-007 | Medium | Negative (API) | server running | POST a JSON array | `[]` | 400 | 400 | PASS | AUTOMATED | api.tap | REQ-029 | — |
| TC-066 | FEAT-007 | High | Negative (API) | server running | POST a numeric name | `{ "name": 123, "score": 5 }` | 400 | 400 | PASS | AUTOMATED | api.tap | REQ-029, REQ-013 | — |
| TC-067 | FEAT-007 | High | Negative (API) | server running | POST a payload with no `score` | `{ "name": "NoScore__TAG__" }` | 400 — a score is mandatory | ❌ 201; the row is stored with `score: undefined` and never ranks | KNOWN ISSUE | AUTOMATED | api.tap | REQ-029 | BUG-001 |
| TC-068 | FEAT-007 | High | Negative (API) | server running | POST non-numeric scores | `"7"`, `{"$ne":1}`, `null` | 400 | ❌ all stored verbatim | KNOWN ISSUE | AUTOMATED | api.tap | REQ-029 | BUG-001 |
| TC-069 | FEAT-007 | High | Negative (API) | server running | POST names the UI would never allow | 5 000 `A`s, `""`, `"   "`, `<script>alert(1)</script>` | 400 (length/character/emptiness rules enforced server-side) | ❌ all accepted and echoed into leaderboard payloads | KNOWN ISSUE | AUTOMATED | api.tap | REQ-013 | BUG-003 |
| TC-069b | FEAT-007 | Medium | Characterisation (API) | server running | Run the same hostile inputs and record exact stored values | as above | Documents today's behaviour so the BUG-003 fix is visible in the diff | stored: 5000-char name, empty name, whitespace name, raw script tag | PASS (characterisation) | AUTOMATED | api.tap | REQ-013 | BUG-003 |

Related cases in the moderation module: TC-060c (blocked names merging) and TC-060d
(how today's build actually merges them). Score-type validation and name validation
share one root problem — the route destructures the JSON body and writes it with no
schema on the in-memory path — which is why BUG-001 and BUG-003 are separate bugs
against the same code.

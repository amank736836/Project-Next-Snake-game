# Score API — positive cases

The write endpoint and the HTTP contract around it. Executed
**2026-10-07 · RUN-2026-001**. Automation: `automation/api/addScore.test.mjs`
(TC-056…TC-059), `automation/api/methods-and-body.test.mjs` (TC-084…TC-087).
Raw responses for these cases are captured in
`evidence/api-responses/RUN-2026-001/`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-056 | FEAT-007 | Critical | API | server running, no database | `POST /addScore` with a fresh name; re-read it from the leaderboard | `{ name: "Nagini__TAG__", score: 42 }` | HTTP 201; the row is stored verbatim and immediately visible | 201 + row on the board | PASS | AUTOMATED | api.tap, `addScore-valid.*` | REQ-019, REQ-026 | — |
| TC-057 | FEAT-007 | Critical | API | a player already on the board | Submit a lower score for the same name | `42` then `9` | One row; `highestScore` stays 42, `latestScore` becomes 9, `visits` increments | as expected | PASS | AUTOMATED | api.tap | REQ-027, BR-002 | — |
| TC-058 | FEAT-007 | High | API | a player already on the board | Submit the same score again | `42` then `42` | No duplicate row | one row | PASS | AUTOMATED | api.tap | BR-001 | — |
| TC-059 | FEAT-007, FEAT-008 | High | API | no `DATABASE_URL` configured | Submit and read the response body | valid payload | Response carries `demo: true` and the stored row for immediate UI patching | `demo: true` present | PASS | AUTOMATED | api.tap | BR-012, REQ-031 | — |
| TC-084 | FEAT-007 | High | API | server running | Call each endpoint with the wrong method | `GET /addScore`, `DELETE /highestScore`, `PUT /latestScore` | Each answers 405 with `Allow` | 405 for all | PASS | AUTOMATED | api.tap, `addScore-get-405.*` | REQ-061 | — |
| TC-085 | FEAT-007 | Medium | API | server running | Send `OPTIONS /addScore` with preflight headers | `Origin`, `Access-Control-Request-Method` | 204 with `allow: OPTIONS, POST` | as expected | PASS | AUTOMATED | api.tap, `addScore-options-preflight.*` | REQ-062 | — |
| TC-086 | FEAT-012 | Low | API | server running | Send `HEAD /` and `HEAD` to the API | — | 200, no body, no crash | 200 | PASS | AUTOMATED | api.tap | REQ-061 | — |
| TC-087 | FEAT-007 | Low | API | server running | POST a JSON body **without** a `content-type` header | `{ "name": "NoCt__TAG__", "score": 1 }` | Documented behaviour: body is still parsed (Next.js reads the stream) | accepted | PASS | AUTOMATED | api.tap | — | — |

TC-087 is deliberately a *documented behaviour* case rather than an expectation: the
endpoint does not require the header, which is lenient but harmless. It is pinned so a
future framework upgrade that tightens this becomes visible.

# Moderation — positive cases

Rename behaviour of the foul-word filter. Executed **2026-10-07 · RUN-2026-001**.
Automation: `automation/api/addScore.test.mjs` (TC-060, TC-060b). Captured response:
`evidence/api-responses/RUN-2026-001/addScore-blocked-name.body.json`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-060 | FEAT-007 | High | API | server running | Submit a name that contains a whole blocked word | `{ name: "damn__TAG__", score: 3 }` | Stored as `Anonymous`; the request still succeeds (201) | 201, row named `Anonymous` | PASS | AUTOMATED | api.tap, `addScore-blocked-name.*` | REQ-028, BR-007 | — |
| TC-060b | FEAT-007 | Medium | Characterisation (API) | server running | Submit a legitimate name that contains a blocked substring | `Hancock` (contains `cock`) | Documents today's behaviour: silently renamed, so the false positive is visible in review | stored as `Anonymous` | PASS (characterisation) | AUTOMATED | api.tap | REQ-028 | BUG-002 |

Case TC-060b is a *characterisation* case: it asserts what the build does today so
that fixing BUG-002 (whole-word or boundary matching) will change this test
deliberately rather than silently. The same technique is used for TC-060d and TC-069b.

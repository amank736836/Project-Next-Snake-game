# Moderation — edge cases

What happens when several blocked names meet, and how today's build behaves.
Executed **2026-10-07 · RUN-2026-001**. Automation: `automation/api/addScore.test.mjs`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-060c | FEAT-007 | Medium | Edge (API) | server running | Submit two different blocked names for unrelated players, then read the board | `shit__TAG__` (50) and `bitch__TAG__` (10) | Each rename should be handled per submission so unrelated players never share a row | ❌ both collapse into one `Anonymous` record — the later, lower run merges into the earlier one | KNOWN ISSUE | AUTOMATED | api.tap | REQ-028, BR-001 | BUG-004 |
| TC-060d | FEAT-007 | Medium | Characterisation (API) | as TC-060c | Inspect the merged record's fields | same inputs | Documents the exact merge semantics (which value wins, how `visits` grows) | `Anonymous` keeps the highest score (50) and accumulates visits from all blocked submissions | PASS (characterisation) | AUTOMATED | api.tap | REQ-028 | BUG-004 |

The pair TC-060c/TC-060d is the template for defect work: one `todo` test states the
correct behaviour and stays red-until-fixed, the second records today's behaviour so
the fix visibly changes it. `BUG-004` is the only known issue in this module that
affects players (a legitimate blocked-name submission can overwrite another player's
best score).

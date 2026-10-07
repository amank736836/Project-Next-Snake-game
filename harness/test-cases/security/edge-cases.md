# Security — edge cases

Abuse scenarios at the boundary of what the product allows. Executed
**2026-10-07 · RUN-2026-001**. Automation: `automation/security/input-and-abuse.test.mjs`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-119 | FEAT-007 | High | Edge (Security) | server running | Submit an implausible top score from an anonymous client and read the board | name `TopForge__TAG__`, score = current top + 1 | Implausible scores rejected or signed; at minimum not silently trusted | ❌ the forged score lands in rank 1 | KNOWN ISSUE | AUTOMATED | security.tap | REQ-049 | BUG-016 |
| TC-119b | FEAT-007 | High | Characterisation (Security) | as TC-119 | Record the exact forged score and its rank | computed at runtime (`top + 1`, never hard-coded) | Documents today's behaviour so the mitigation is verifiable | forged row present with rank 1 | PASS (characterisation) | AUTOMATED | security.tap | REQ-049 | BUG-016 |
| TC-120 | FEAT-007 | High | Edge (Security) | server running | Send 50 rapid valid submissions and look for back-pressure | 50 writes | A rate limit should appear (429) under a flood | ❌ 50/50 accepted | KNOWN ISSUE | AUTOMATED | security.tap | REQ-049 | BUG-013 |
| TC-120b | FEAT-007 | High | Characterisation (Security) | as TC-120 | Record the observed status codes and timing | — | Documents the absence of throttling with numbers | all 201, no throttling | PASS (characterisation) | AUTOMATED | security.tap | REQ-049 | BUG-013 |

Why TC-119b computes its score at runtime: an earlier draft hard-coded
`999 999 999`, which both polluted the board and made the assertion depend on a
number that could itself be defeated by another test's forged score. Computing
`top + 1` makes the case honest and order-independent — a pattern to reuse for every
"must not be allowed to win" scenario.

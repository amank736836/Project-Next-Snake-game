# Moderation — regression cases

Properties of the list that must hold as it grows. Executed
**2026-10-07 · RUN-2026-001**. Automation: `automation/unit/foul-words.test.mjs`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-026 | FEAT-007 | Medium | Regression (Unit) | list imported | Assert the list loaded and is non-trivial | 632 entries | The list is imported and contains a meaningful number of entries (> 100), so a broken import cannot silently disable moderation | 632 entries | PASS | AUTOMATED | unit.tap | REQ-028, BR-007 | — |
| TC-027 | FEAT-007 | Medium | Regression (Unit) | list imported | Assert every entry is a non-empty string | 632 entries | No `null`, no whitespace-only entries — each would throw or never match | all valid | PASS | AUTOMATED | unit.tap | REQ-028 | — |

TC-026 is the guard against the most dangerous moderation failure: importing zero
words would make every test pass while the feature is completely off. It is the reason
"the list is non-trivial" is an assertion and not an assumption.

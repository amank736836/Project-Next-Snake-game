# Moderation — negative cases

Invariants of the foul-word list itself. Executed **2026-10-07 · RUN-2026-001**.
Automation: `automation/unit/foul-words.test.mjs`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-028 | FEAT-007 | Low | Negative (Unit) | list imported | Filter the list for entries that are not lower-case | 632 entries | Every entry lower-case, otherwise it can never match (the route compares against a lower-cased name) | ❌ upper-case entries exist and are dead weight | KNOWN ISSUE | AUTOMATED | unit.tap | REQ-028, BR-007 | BUG-008 |
| TC-029 | FEAT-007 | Low | Negative (Unit) | list imported | Find duplicate entries | 632 entries | No duplicates | ❌ duplicates exist (e.g. `tranny`, `kinky`) | KNOWN ISSUE | AUTOMATED | unit.tap | REQ-028, BR-007 | BUG-009 |

Both defects are *hygiene* bugs, not security bugs: dead entries enlarge the list
(and therefore every substring scan), while duplicates suggest entries were added
without checking. Neither makes the filter fail open or closed today, which is why
they are Low priority — but they are cheap to fix and are covered by tests that will
turn green automatically once the list is cleaned.

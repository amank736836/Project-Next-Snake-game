# UI shell — edge cases

Boundary behaviour of the served surface. Executed **2026-10-07 · RUN-2026-001**.
Automation: `automation/ui/served-shell.test.mjs`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-093b | FEAT-012 | Medium | Edge (Integration) | live server | Request all three API endpoints and inspect `content-type` | — | `application/json` everywhere — no HTML sniffing surface, no content-type confusion | JSON on all three | PASS | AUTOMATED | ui.tap | REQ-046 | — |

There is no `negative.md` in this module because the shell has no invalid-input
surface of its own: everything a user can type goes through the hub (TC-050) or the
API (see `score-api/negative.md`). Adding a negative file here would be padding.

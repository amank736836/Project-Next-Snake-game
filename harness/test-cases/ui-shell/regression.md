# UI shell — regression cases

Behaviour a styling or layout refactor could silently break. Executed
**2026-10-07 · RUN-2026-001**. Automation: `automation/ui/game-hook.test.mjs`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-043 | FEAT-010 | Medium | Regression (UI) | hook mounted | Call the theme toggle, inspect `document.documentElement.dataset.theme` and storage | — | The attribute flips and the choice is persisted | flipped + persisted | PASS | AUTOMATED | ui.tap | REQ-021 | — |

The rest of the responsive/theming surface is CSS-driven and cannot be asserted in
jsdom (no layout engine), so it is covered by the manual cases **TC-200…TC-208**
rather than by fake assertions here.

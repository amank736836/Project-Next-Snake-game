# UI shell — positive cases

Rendered markup, accessibility contract and the served HTML shell.
Executed **2026-10-07 · RUN-2026-001**. Automation:
`automation/ui/components-render.test.mjs` (TC-049…TC-055b) ·
`automation/ui/served-shell.test.mjs` (TC-090…TC-093, live server).
Markup assertions use `renderToStaticMarkup`, so they verify semantics, labels and
state — not pixels.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-049 | FEAT-005 | High | UI | render `MissionHub` with props | Inspect the markup for labels, the leader line and the selector state | leader `Nagini 42` | Brand exposed via `aria-label`, name field with a floating label, START MISSION, BUTTONS/JOYSTICK selector with `aria-pressed`, current leader named | all present | PASS | AUTOMATED | ui.tap | REQ-012, REQ-053 | — |
| TC-050 | FEAT-005, FEAT-003 | High | UI | render `MissionHub` twice | Inspect both variants | `alert = true`; `hasSavedGame = true` | Alert has `role="alert"`; RESUME MISSION appears only when a save exists | as expected | PASS | AUTOMATED | ui.tap | REQ-012, REQ-015, REQ-053 | — |
| TC-054 | FEAT-003 | Critical | UI | render `GameOver` with a run | Inspect the dialog contract | score 12, best 20, length 5 | `role="dialog"`, `aria-modal`, accessible name, score/best/length labels, three actions | as expected | PASS | AUTOMATED | ui.tap | REQ-018, REQ-053 | — |
| TC-055 | FEAT-003 | High | UI | render `GameOver` for a record run | Inspect the copy and celebration layer | `isRecord = true` | Dialog switches copy ("Legendary run") and renders the celebration layer | as expected | PASS | AUTOMATED | ui.tap | REQ-018 | — |
| TC-055b | FEAT-004, FEAT-006 | Medium | UI | render board, controls and header | Inspect accessible names and live state | 4-segment snake | Board `role="img"` with length/heading label, four D-pad buttons with names, header shows player and pause | as expected | PASS | AUTOMATED | ui.tap | REQ-053, REQ-052 | — |
| TC-090 | FEAT-012 | High | Integration | live server | `GET /` and inspect the document shell | — | Title, description, application name, icon link and the game root are present | as expected | PASS | AUTOMATED | ui.tap, `page-shell.headers.txt` | REQ-034 | — |
| TC-091 | FEAT-010 | High | Integration | live server | Search the served HTML for the pre-paint theme bootstrap | — | `data-theme="dark"` plus the inline script that reads the stored theme before hydration (no flash) | present | PASS | AUTOMATED | ui.tap | REQ-021 | — |
| TC-092 | FEAT-012 | Medium | Integration | live server | Search the pre-hydration markup for the loader | — | A loading placeholder with `role="status"` that hydration replaces | present | PASS | AUTOMATED | ui.tap | REQ-034 | — |
| TC-093 | FEAT-011 | Medium | Integration | live server | Inspect response headers of `/` | — | The static shell is served with a long-lived cache policy | `x-nextjs-cache: HIT`, `s-maxage=31536000`, `ETag`, 12 223 B | PASS | AUTOMATED | ui.tap, `page-shell.headers.txt` | REQ-035 | — |

Visual behaviour explicitly **not** covered here (no browser): focus rings, animation
timing, bar widths, backdrop blur. Those are the manual cases TC-200…TC-219.

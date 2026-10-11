# Visual / responsive / accessibility — positive cases (real browser)

Executed **2026-10-11** against a production `npm start` build in headless Chromium
153 (`playwright-core` + a system binary). Automation:
`automation/visual/responsive.test.mjs`, `automation/visual/accessibility.test.mjs`,
`automation/visual/interactions.test.mjs`. Evidence: `test-results/latest/visual.tap`,
`evidence/screenshots/<RUN_ID>/`.

These cases measure **rendered** behaviour — geometry, paint, focus and hit-testing.
The `ui/` suite asserts markup contracts with `renderToStaticMarkup`; it cannot see a
layout that overflows, a focus ring that a CSS rule removed, or a modal that never
receives focus. Both layers are kept, because they catch different defects.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-300 | FEAT-011 | Critical | UI | live server, no data assumptions | Load `/` at 15 viewports (320→2560, 200 %/400 % zoom, landscape) and compare `documentElement.scrollWidth` with the viewport | — | No horizontal overflow and no element escaping the viewport. `<body overflow-x: hidden>` must never be *needed* to hide content | 0 overflow at all 15 viewports | PASS | AUTOMATED | visual.tap, screenshots | REQ-025…REQ-029 | UI-01 (fixed) |
| TC-301 | FEAT-006, FEAT-011 | High | Edge | live server | POST a 23-character leader name, reload at 320 px, inspect the hub and the hall of fame | name `Extremelylongplayername`, score 99 | The ticker ellipsizes (`text-overflow: ellipsis`, `min-width: 0`) and the page stays 320 px wide | ticker truncates, doc width 320 | PASS | AUTOMATED | visual.tap | REQ-025, REQ-031 | UI-01 |
| TC-302 | FEAT-011 | High | UI | live server | Start a run at 320×180 (400 % zoom) and 844×390 (landscape phone) | name `Zoom` | Board and thumb controls fit without horizontal overflow | no overflow at either size | PASS | AUTOMATED | visual.tap, screenshots | REQ-027, REQ-029 | UI-06 (fixed) |
| TC-303 | FEAT-012 | High | UI | live server | Cold-load `/`, capture console, page errors and network | — | No console errors, no failed requests, no uncaught exceptions | clean (was: 404 on `/_vercel/insights/script.js`) | PASS | AUTOMATED | visual.tap | REQ-035, REQ-036 | UI-04 (fixed) |
| TC-304 | FEAT-011 | Medium | Regression | live server | Measure the x-offset of the three `.menu-content` children at 1440 px | — | Visual order stays highest → hub → recent after the hub was moved to the front of the DOM | order preserved via grid `order` | PASS | AUTOMATED | visual.tap | REQ-026 | UI-05 |
| TC-305 | FEAT-006 | Medium | Edge | live server | Put an over-long name in a leaderboard row at 390 px and 1024 px, compare `scrollWidth`/`clientWidth` | name 23 chars | The name truncates with an ellipsis instead of being cut mid-glyph | ellipsized at both widths | PASS | AUTOMATED | visual.tap | REQ-031 | UI-09 (fixed) |
| TC-310 | FEAT-005 | High | A11y | live server | Enumerate headings, then press Tab four times from the document start | — | `<h1>` is the first heading; the name field and START MISSION are the first controls in the tab order | `H1, H3, H3` and stops 2/3 correct | PASS | AUTOMATED | visual.tap | REQ-053 | UI-05 (fixed) |
| TC-311 | FEAT-005 | Medium | A11y | live server | Tab to the name field and read its computed outline | — | A ≥2px solid focus ring is rendered | `3px solid rgb(18,203,196)` | PASS | AUTOMATED | visual.tap | REQ-053 | UI-10 (fixed) |
| TC-312 | FEAT-003 | Critical | A11y | live server | Play until length ≥ 6, self-collide, then inspect the dialog | deterministic auto-steer + 180° reversal | Focus moves into the dialog, Tab is trapped for 8 presses, overlay stacks above the theme toggle, Escape closes | all four hold | PASS | AUTOMATED | visual.tap, screenshots | REQ-018, REQ-053 | UI-02, UI-03 (fixed) |
| TC-313 | FEAT-006 | Medium | A11y | live server | Open the hall of fame at 390 px and read the tab wiring | — | Two `role="tab"` with `aria-controls` resolving to two `role="tabpanel"` | wiring resolves | PASS | AUTOMATED | visual.tap | REQ-053 | UI-07 (fixed) |
| TC-314 | FEAT-011 | Medium | A11y | live server | Measure every interactive control at 320, 390 and 1280 | — | Nothing smaller than 24×24 px (WCAG 2.5.8) | 0 violations | PASS | AUTOMATED | visual.tap | REQ-028 | — |
| TC-315 | FEAT-005 | High | A11y | live server | Compute the accessible name of every control from label/`aria-label`/text | — | No unnamed control | 0 violations | PASS | AUTOMATED | visual.tap | REQ-053 | — |
| TC-316 | FEAT-010 | High | A11y | live server | Read the fill tokens in both themes and compute contrast against white | — | Every fill that carries a white label clears 4.5:1 at both gradient stops | ≥4.66:1 everywhere | PASS | AUTOMATED | visual.tap | REQ-020, REQ-054 | UI-08 (fixed) |
| TC-317 | FEAT-010 | High | A11y | live server | For every text node, composite the painted stack under it (`elementsFromPoint`) and compare against WCAG AA | dark + light, 390 + 1440, hub + hall of fame | No text below 4.5:1 (3:1 for large/bold) | 0 failures in all 8 combinations | PASS | AUTOMATED | visual.tap, screenshots | REQ-054 | UI-08, UI-11 (fixed) |
| TC-318 | FEAT-010 | High | A11y | live server | Load with `prefers-reduced-motion: reduce`, then again without it as a control | — | Canvas scene not painted, no animation >50 ms still running, `scroll-behavior: auto`; the control run must animate | reduce: 0 running animations; control: canvas visible | PASS | AUTOMATED | visual.tap | REQ-022, REQ-023 | — |
| TC-320 | FEAT-005 | Critical | Functional | live server | Click START with an empty name, then with a name | — | `role="alert"` explains the block, no run starts, then a valid name starts the run | as expected | PASS | AUTOMATED | visual.tap | REQ-010, REQ-011 | — |
| TC-321 | FEAT-007 | High | Negative | live server | Type markup, emoji and punctuation; then a 26-character name | `<script>alert(1)</script>😀!!!@@@` | Unsupported characters stripped, length capped at 20 | as expected | PASS | AUTOMATED | visual.tap | REQ-013 | — |
| TC-322 | FEAT-004 | Critical | Functional | live server | Press ArrowLeft while typing, then steer the snake with the keyboard after starting | — | Typing never launches a run; a real arrow key moves the head | as expected | PASS | AUTOMATED | visual.tap | REQ-014, REQ-016 | — |
| TC-323 | FEAT-003 | Critical | Functional | live server | Start, pause, inspect the hub, resume | — | Pause returns to the hub and offers RESUME MISSION; resume re-enters the run | as expected | PASS | AUTOMATED | visual.tap | REQ-015 | — |
| TC-324 | FEAT-005 | High | Abuse | live server | 24 rapid clicks on the control selector, 8 synchronous clicks on START, 8 on PAUSE | — | Exactly one game screen, consistent selector state, no uncaught errors | as expected | PASS | AUTOMATED | visual.tap | REQ-017, REQ-044 | — |
| TC-325 | FEAT-010 | High | Functional | live server | Toggle the theme, reload | — | `data-theme` flips, the choice persists to `localStorage`, survives reload with no flash | as expected | PASS | AUTOMATED | visual.tap | REQ-021 | — |
| TC-326 | FEAT-006 | High | Functional | live server | Open the hall of fame with 12 seeded scores, paginate, switch tabs, go back | 12 scores, limit 5 | Page indicator advances, RECENT swaps the card, BACK TO MISSION returns to the hub | as expected | PASS | AUTOMATED | visual.tap | REQ-030, REQ-032 | — |
| TC-327 | FEAT-006 | Medium | Functional | live server | Open the hall of fame, press browser Back, then Forward, then BACK TO MISSION | — | Back returns to the hub instead of leaving the site; Forward re-opens the board; leaving via the app pops the entry without pushing another | 5 history checks pass | PASS | AUTOMATED | visual.tap | REQ-032 | UI-13 (fixed) |
| TC-328 | FEAT-011 | Medium | UI | touch emulation | Read `-webkit-tap-highlight-color` / `touch-action` on hub, leaderboard and toggle controls, and `touch-action` on the joystick | — | Tap flash suppressed and the double-tap zoom delay skipped on every control, while the thumbstick keeps `touch-action: none` so dragging steers instead of scrolling | as expected | PASS | AUTOMATED | visual.tap | REQ-024, REQ-028 | UI-12 (fixed) |

## Notes

- **TC-300 counts the ambient layer out, deliberately.** The blurred blobs and the
  parallax grid are wider than the viewport by design (they are meant to bleed) and
  sit inside a fixed `aria-hidden` container. The probe ignores `pointer-events: none`
  and anything clipped by an `overflow: hidden` ancestor, and asserts on real content.
- **TC-312 and TC-322 are data-independent** — they drive the game itself rather than
  assuming a seeded leaderboard, so they pass on a cold server.
- **TC-317's backdrop is composited, not read.** `getComputedStyle(el).backgroundColor`
  returns `rgba(255,255,255,0.72)` for the glass panels and `transparent` for anything
  painted with a gradient, so a naive check both over- and under-reports. The probe walks
  the stack that the browser would actually hit-test at the text's centre and blends every
  translucent layer until an opaque one. Gradient-clipped wordmarks and colour-font emoji
  are excluded — they are not painted with `color`.

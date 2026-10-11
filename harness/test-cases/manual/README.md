# Manual test cases

Cases that cannot be executed in this environment because they need something the
harness does not have: a real browser (layout, paint, touch, motion, focus) or a
deployed environment (CDN, analytics, TLS).

- **[`browser-and-visual.md`](browser-and-visual.md)** — TC-200…TC-219.

All twenty cases are marked `NOT_EXECUTED` with the blocking reason recorded in the
*Actual Result* field. They are written as **full template blocks** (not table rows)
because a human has to follow them step by step.

## What the visual suite now automates

Since 2026-10-11 `automation/visual/*` (cases `TC-300…TC-328`) executes the geometry,
contrast, focus and keyboard parts of the list below on every run. The manual case is
kept — with its judgement calls — and marked here so nobody re-tests blind:

| Manual | Automated by | Still needs a human for |
| --- | --- | --- |
| TC-200, TC-201, TC-202, TC-203 | TC-300, TC-301, TC-304 | perceived balance/whitespace at each size |
| TC-204, TC-205 | TC-302, TC-300 (`zoom-200` / `zoom-400`) | real-device pinch zoom |
| TC-206 | TC-318 | the OS-level setting itself, visually |
| TC-209 | TC-320, TC-321 | — |
| TC-210, TC-215 | TC-310, TC-311, TC-322, TC-312 | whether the ring is *comfortable* to follow |
| TC-211 | TC-328 (`touch-action` on the stick) | a real drag on touch hardware |
| TC-216 | TC-312 (Escape) | Enter-to-replay feel, haptics |
| TC-218 | TC-303 (cold load) | console hygiene across a long session |
| TC-207, TC-208, TC-213, TC-214, TC-217, TC-219 | — | unchanged |

Nothing in this file is a claim. A case stays `NOT_EXECUTED` until someone runs it and
pastes the observed result and a screenshot/recording reference into the *Actual
Result* and *Evidence* fields.

## Environment needed

| Requirement | Notes |
| --- | --- |
| A desktop browser (Chrome, Firefox or Safari) with dev-tools | For console, network throttling, device emulation and the accessibility tree |
| A phone or device emulation | For touch, joystick and landscape checks |
| OS-level "reduce motion" setting | For TC-206 |
| A deployed URL | For TC-217 and TC-219 |
| ~45 minutes | All 20 cases, including setting up the device profiles |

```bash
npm run build && npm start        # http://localhost:3000 for local cases
```

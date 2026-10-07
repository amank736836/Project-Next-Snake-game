# Manual test cases

Cases that cannot be executed in this environment because they need something the
harness does not have: a real browser (layout, paint, touch, motion, focus) or a
deployed environment (CDN, analytics, TLS).

- **[`browser-and-visual.md`](browser-and-visual.md)** — TC-200…TC-219.

All twenty cases are marked `NOT_EXECUTED` with the blocking reason recorded in the
*Actual Result* field. They are written as **full template blocks** (not table rows)
because a human has to follow them step by step.

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

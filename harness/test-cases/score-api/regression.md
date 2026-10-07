# Score API — regression cases

Contract behaviour that must survive framework and refactor changes. Executed
**2026-10-07 · RUN-2026-001**. Automation: `automation/api/methods-and-body.test.mjs`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-088 | FEAT-012 | Medium | Regression (API) | server running | Request unknown API routes, an unknown page and dotfiles | `/api/nope`, `/does-not-exist`, `/.env`, `/.env.local`, `/api/.env` | 404 everywhere, no file contents, no stack traces | 404 for all five probes | PASS | AUTOMATED | api.tap, `dotfile-and-404-probes.txt` | REQ-030 | — |

TC-088 exists because the 404 path is where deployments leak: a misconfigured static
handler could serve `.env` or a directory listing. The captured probe file is kept as
evidence so the check can be re-run by hand in seconds.

# Security — negative cases

Hardening and hygiene gaps, all reproducible. Executed **2026-10-07 · RUN-2026-001**.
Automation: `automation/security/http-surface.test.mjs` (TC-110…TC-114b) ·
`automation/security/input-and-abuse.test.mjs` (TC-116…TC-118).

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-110 | FEAT-012 | Medium | Security | server running | Record exactly which security headers are present on `/` and the API | — | Documents the deployment's header posture | only `X-Powered-By` and framework headers; no CSP/nosniff/frame/referrer/HSTS | PASS (characterisation) | AUTOMATED | security.tap | REQ-048 | BUG-015 |
| TC-110b | FEAT-012 | High | Security | server running | Assert the standard hardening header set | CSP, nosniff, referrer, frame-ancestors, HSTS | All present | ❌ all missing | KNOWN ISSUE | AUTOMATED | security.tap | REQ-048 | BUG-015 |
| TC-111 | FEAT-012 | Low | Security | server running | Inspect `X-Powered-By` | — | Framework version not advertised | ❌ `X-Powered-By: Next.js` | KNOWN ISSUE | AUTOMATED | security.tap, `page-shell.headers.txt` | REQ-048 | BUG-015 |
| TC-114 | FEAT-007 | Medium | Security | server running | POST a payload with no `name`; inspect the error body | `{ "score": 5 }` | Generic error text | ❌ raw `TypeError` message echoed | KNOWN ISSUE | AUTOMATED | security.tap, `addScore-missing-name.body.json` | REQ-047 | BUG-014 |
| TC-114b | FEAT-008 | Medium | Security | server with an unreachable database | Call an endpoint and inspect the error body | — | Generic error text | ❌ `connect ECONNREFUSED 127.0.0.1:27099` — internal address disclosed | PASS (characterisation) | AUTOMATED | security.tap, `*-degraded.txt` | REQ-047 | BUG-014 |
| TC-116 | FEAT-007 | High | Security | server running | POST a script payload as the name; read it back from the board | `<script>alert(1)</script>` | Stored inert, never executed; echoed as JSON text | stored as text, returned inside a JSON string | PASS | AUTOMATED | security.tap | REQ-049 | BUG-003 |
| TC-117 | FEAT-007 | High | Security | server running | POST NoSQL-operator-shaped values | `{"$ne":1}`, `{"$gt":""}` | Operators must not be interpreted | demo mode stores them verbatim (data hygiene issue, not query injection); MongoDB mode rejects them at the cast layer | PASS | AUTOMATED | security.tap | REQ-049 | BUG-001 |
| TC-118 | FEAT-006 | High | Security | server running | Send `$`-prefixed query parameters to the read endpoints | `?page[$ne]=1` | Never turned into a query operator | ignored/coerced; no operator semantics | PASS | AUTOMATED | security.tap | REQ-049 | — |

The three BUG-015 cases describe one deployment gap with three symptoms (missing
headers, missing policy, framework fingerprinting). Fixing them is a single edge/CDN
or `next.config.ts` change, which is why they are grouped under one bug id.

# Security — positive cases

Controls that hold today. Executed **2026-10-07 · RUN-2026-001**. Automation:
`automation/security/http-surface.test.mjs` (TC-112, TC-113, TC-115) ·
`automation/security/input-and-abuse.test.mjs` (TC-121) ·
`automation/security/secrets-and-config.test.mjs` (TC-122…TC-125).

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-112 | FEAT-012 | Medium | Security | server running | POST with a foreign `Origin` and inspect the response headers | `Origin: https://evil.example` | No CORS blessing: no `Access-Control-Allow-Origin`, so browsers cannot read the response cross-origin | no ACAO header (the request itself still succeeds — recorded in TC-119b/BUG-016) | PASS | AUTOMATED | security.tap | REQ-048 | — |
| TC-113 | FEAT-012 | Medium | Security | server running | Send a preflight and inspect it | `Access-Control-Request-Method: POST` | No cross-origin grant; `allow` lists only the real methods | 204 with `allow: OPTIONS, POST`, no ACAO | PASS | AUTOMATED | security.tap, `addScore-options-preflight.*` | REQ-048, REQ-062 | — |
| TC-115 | FEAT-012 | Medium | Security | server running | Inspect `content-type` on success and error responses | — | JSON everywhere, so a browser can never sniff a response into markup | JSON on all three endpoints | PASS | AUTOMATED | security.tap | REQ-046 | — |
| TC-121 | FEAT-007 | High | Security | server running | Send several hostile payloads (10 000-char name, deeply nested JSON, `$`-operator object) and check the process afterwards | large/hostile bodies | The server stays up and keeps answering | still healthy after every payload | PASS | AUTOMATED | security.tap | REQ-049 | — |
| TC-122 | FEAT-012 | High | Security | repository available | Scan tracked files for credential filenames (`.env*`, `*.pem`, `id_rsa`, …) | git index | No credential file is committed | none found | PASS | AUTOMATED | security.tap | REQ-043 | — |
| TC-123 | FEAT-012 | High | Security | repository available | Regex-scan tracked source for secret-shaped strings (connection strings, API keys, tokens) | tracked files | No hard-coded secret | none found | PASS | AUTOMATED | security.tap | REQ-043, REQ-044 | — |
| TC-124 | FEAT-008 | High | Security | built bundle available | Search the compiled client bundle for a `mongodb://` connection string | `.next/static` | Credentials can only come from the environment | none found | PASS | AUTOMATED | security.tap | REQ-043, REQ-045 | — |
| TC-125 | FEAT-012 | Low | Security | built bundle available | Search the client bundle for server stack-trace text | `.next/static` | Server internals are not shipped to browsers | none found | PASS | AUTOMATED | security.tap | REQ-047 | — |

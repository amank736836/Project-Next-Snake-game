# Security Scenarios

The attack surface is deliberately small: no accounts, no sessions, no file uploads,
no third-party APIs. What remains is a public write endpoint, three public read
endpoints, browser storage and the CDN-cached shell. This file tests that surface
honestly — including the parts that currently fail.

## Authentication

| ID | Scenario | Expected | Actual | Test cases |
| --- | --- | --- | --- | --- |
| SCN-117 | A request without credentials reaches a protected resource | reject | **There is no protected resource** — the product has no authentication (documented, not a gap that can be "failed") | N/A |
| SCN-118 | The score endpoint cannot be used to impersonate a *system* identity | reject `system`, `admin`, reserved names | accepted (the data is decorative; recorded as BUG-016) | TC-119 |

## Authorisation

| ID | Scenario | Expected | Actual | Test cases |
| --- | --- | --- | --- | --- |
| SCN-119 | A client can only modify its own data | ownership check | any client can update any player's row by name (BUG-016) | TC-119b |
| SCN-120 | Privilege escalation via request content (role/platform fields) | ignored or rejected | extra fields are ignored by destructuring — verified | TC-118 |
| SCN-121 | Direct object reference tampering (`page`, `limit`, internal ids) | bounded values only | `limit` is unbounded (BUG-012), `page` echoes `null` (BUG-005) | TC-079, TC-078b |

## Input validation & injection

| ID | Scenario | Expected | Actual | Test cases |
| --- | --- | --- | --- | --- |
| SCN-122 | NoSQL-operator objects in `score`/`name` cannot alter queries | rejected | Mongoose casting rejects the object in DB mode; demo mode stores it verbatim (BUG-001) | TC-117 |
| SCN-123 | Script payloads in `name` cannot execute | stored/escaped, never executed | stored as text; React escapes on render — verified by inspecting the stored row | TC-116 |
| SCN-124 | Path traversal on static paths | 404 | `/.env`, `/../src/lib/db.ts`, `/api/.env` → 404 | TC-088 |
| SCN-125 | Oversized payloads are rejected | 413 / body cap | 1.2 MB accepted in ~8 ms (BUG-013) | TC-089, TC-089b |

## Data & transport exposure

| ID | Scenario | Expected | Actual | Test cases |
| --- | --- | --- | --- | --- |
| SCN-126 | Security headers present (CSP, nosniff, frame-ancestors, referrer) | present | **absent**; `X-Powered-By: Next.js` advertised (BUG-015) | TC-110, TC-110b, TC-111 |
| SCN-127 | CORS restricted to same origin | no wildcard | no `Access-Control-Allow-Origin` at all; `OPTIONS` → 204 with `allow` (browser-enforced same-origin) | TC-112, TC-113 |
| SCN-128 | Error responses do not leak internals | generic message | raw TypeError/JSON-parse/driver text returned (BUG-014) | TC-114, TC-114b |
| SCN-129 | No secrets, tokens or connection strings in the repository or responses | none | none found (scan of tracked files + compiled bundle) | TC-123, TC-124 |
| SCN-130 | Tokens/credentials never appear in browser storage | none | only obfuscated game state, best score and theme | TC-121 |

## API abuse

| ID | Scenario | Expected | Actual | Test cases |
| --- | --- | --- | --- | --- |
| SCN-131 | Rapid repeated writes are rate-limited | 429 after a threshold | 60/60 writes accepted (BUG-013) | TC-120, TC-120b |
| SCN-132 | Implausible scores are rejected or flagged | server-side plausibility | `999 999 999 999` lands in rank 1 (BUG-016) | TC-119b |
| SCN-133 | The public endpoint cannot be used as a free compute/storage amplifier | bounded work per request | each request is O(1) work and ≤ ~1 KB stored, aside from the unbounded name length | TC-089, TC-115 |

## Known security posture (summary)

| Area | Rating | Note |
| --- | --- | --- |
| Secrets management | ✅ good | environment-only, nothing in git or the bundle |
| Same-origin protection | ✅ acceptable | no CORS headers, JSON-only responses |
| Hardening headers | ❌ missing | BUG-015 |
| Input validation | ❌ weak | BUG-001, BUG-003, BUG-013 |
| Information disclosure | ❌ leaks internals | BUG-014 |
| Abuse resistance | ❌ none | BUG-013, BUG-016 |

Because the stored data is a decorative scoreboard with no personal data, these
findings are *medium* severity at most — but they are real, reproducible and belong
in the release decision (`reports/release-readiness.md`).

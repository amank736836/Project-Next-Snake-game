# Non-Functional Requirements

Quality attributes and constraints, with the measured evidence from
`RUN-2026-001` where one exists. Anything not measured is marked
`UNKNOWN / REQUIRES VALIDATION` or `NOT_EXECUTED` rather than assumed.

| ID | Requirement | Measured / observed | Status | Test cases |
| --- | --- | --- | --- | --- |
| REQ-035 | The pre-rendered shell must be served from cache with a long TTL | `x-nextjs-cache: HIT`, `Cache-Control: s-maxage=31536000`, ETag, 12 223 B | ✅ VERIFIED | TC-093 |
| REQ-036 | Shell response time (local, warm) must stay well under 1 s | p50 3.2 ms · p95 5.5 ms · max 38 ms (n=30) | ✅ VERIFIED | TC-100 |
| REQ-037 | Leaderboard reads must stay under 500 ms p95 locally | p50 2.4 ms · p95 5.2 ms, avg 698 B (n=30) | ✅ VERIFIED | TC-101 |
| REQ-038 | Recent-hunts reads must stay under 500 ms p95 locally | p50 2.3 ms · p95 4.1 ms, avg 598 B (n=30) | ✅ VERIFIED | TC-102 |
| REQ-039 | Score writes must stay under 500 ms p95 locally | p50 2.5 ms · p95 4.1 ms (n=30) | ✅ VERIFIED | TC-103 |
| REQ-040 | The server must survive a 50-request concurrent burst without errors | 50/50 OK in 116 ms (~430 req/s) | ✅ VERIFIED | TC-104 |
| REQ-041 | Write latency must not grow as the demo board grows | 2.96 ms first vs 2.44 ms after 25 inserts | ✅ VERIFIED | TC-105 |
| REQ-042 | A five-row leaderboard page must stay small enough for mobile networks | avg 698 B; a page containing a 5 000-char name grows to ~5.6 KB | ⚠️ PARTIAL — unbounded names inflate payloads (BUG-003, BUG-012) | TC-101, TC-079 |
| REQ-043 | No secrets, tokens or credentials may be committed | No credential files tracked; no secret patterns in tracked source; `.env*` ignored | ✅ VERIFIED | TC-122, TC-123, TC-124 |
| REQ-044 | Redis-style secret hygiene in the harness itself | Harness reads `${DATABASE_URL}` / `${HARNESS_MONGODB_URL}` only; fixtures contain placeholders | ✅ VERIFIED | TC-123 |
| REQ-045 | Only the documented environment variables may be required to run | `DATABASE_URL` only (`src/lib/db.ts`); everything else is optional | ✅ VERIFIED | PROJECT_OVERVIEW §13 |
| REQ-046 | The API must answer with JSON (no HTML sniffing surface) | `content-type: application/json` on all three endpoints | ✅ VERIFIED | TC-093b, TC-115 |
| REQ-047 | Error responses must not disclose internals | ❌ VIOLATED — raw exception text and driver errors are returned (e.g. `connect ECONNREFUSED 127.0.0.1:27099`) | ❌ VIOLATED | TC-114, TC-114b |
| REQ-048 | Standard security headers should be present | ❌ VIOLATED — no CSP, nosniff, frame options, Referrer-Policy, HSTS or Permissions-Policy; `X-Powered-By: Next.js` is exposed | ❌ VIOLATED | TC-110, TC-110b, TC-111 |
| REQ-049 | The write endpoint must resist abuse (size limits, rate limits, plausibility) | ❌ VIOLATED — a 1.2 MB body and 25 rapid writes are accepted; a forged top score lands in rank 1 | ❌ VIOLATED | TC-089, TC-119b, TC-120b |
| REQ-050 | The UI must remain usable when the backend fails | The page keeps rendering, boards fall back to empty states, no crash (verified in demo-client tests) | ✅ VERIFIED | TC-047 |
| REQ-051 | Animations must respect `prefers-reduced-motion` | Implemented in `useUiMotion`, `AmbientBackground`, `ThemeToggle`, `globals.css` (line ~908) | 🔒 NOT_EXECUTED (needs a real browser) | TC-206 |
| REQ-052 | Keyboard-only play must be possible and focus states visible | Buttons/roles/aria labels verified in markup; focus styling is CSS-only | ⚠️ PARTIAL (markup verified, visual focus not) | TC-055b, TC-215 |
| REQ-053 | Interactive controls must expose accessible names and states | Verified for the hub, leaderboard, dialog, board and D-pad in rendered markup | ✅ VERIFIED | TC-049…TC-055b |
| REQ-054 | The layout must adapt to phone, tablet, desktop and landscape without horizontal overflow | Container queries + breakpoints exist and are documented; not visually verified here | 🔒 NOT_EXECUTED | TC-200…TC-205 |
| REQ-055 | The application must build and lint cleanly | `next build` ✓ (7 routes, 6.6 s), `eslint` ✓ (no findings) | ✅ VERIFIED | RUN-2026-001 setup log |
| REQ-056 | The project must run on the Node version used by the team | Node v22.22.3 exercised end to end | ✅ VERIFIED | environment summary of RUN-2026-001 |
| REQ-057 | Score data must survive process restarts when a database is configured | 🔒 NOT_EXECUTED — MongoDB mode could not be run in this environment | TC-133, TC-134, TC-136 |
| REQ-058 | Concurrent first writes must not create duplicate player rows | ⚠️ UNKNOWN / REQUIRES VALIDATION — the route is a non-atomic read-then-write and `name` has no unique index | TC-135 (blocked), BUG-018 |
| REQ-059 | A transient database outage must not require a process restart | ❌ VIOLATED — the rejected connection promise is cached forever | TC-131b, BUG-017 |
| REQ-060 | Documentation must let a newcomer run and test the project | README + this harness; commands executed as documented | ✅ VERIFIED | This run |

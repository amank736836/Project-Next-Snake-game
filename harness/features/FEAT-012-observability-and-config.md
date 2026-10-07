# FEAT-012 — Configuration, demo-mode signalling and analytics

**Features:** `FEAT-012`
**Primary code:** `src/lib/db.ts` (`hasDatabase`), `src/app/layout.tsx` (`<Analytics />`, metadata), API routes (`demo: true` flag), `Leaderboard.tsx` (demo chip)

## Purpose
Make the runtime state of the deployment observable to the right people: the
deployer decides persistence with one environment variable, the player is told when
they are playing on a demo board, and page views are reported to Vercel Analytics.

## User
Deployer/operator (configuration), player (demo indicator), product owner (analytics).

## Entry Point
- `process.env.DATABASE_URL` (only required variable)
- `PORT` for `next start`
- `<Analytics />` in the root layout (no-ops off Vercel)
- `demo: true` in API responses → `demo` chip rendered by `Leaderboard`

## Dependencies
| Dependency | Requirement |
| --- | --- |
| `DATABASE_URL` | optional; presence switches storage mode |
| `PORT` | optional (default 3000) |
| `@vercel/analytics` | optional; requires the Vercel platform to deliver data |
| `NODE_ENV` | set by Next.js; controls demo seeding (production = empty board) |

## Inputs
Environment variables only; no config files are committed (`.env*` is git-ignored).

## Outputs
- `hasDatabase()` → storage branch per request
- `demo: true` in demo-mode responses, absent in MongoDB mode
- Page-view beacons (Vercel), metadata/OG tags in the served HTML

## Business Rules
- `BR-012` — demo mode must be explicit; production must not fake a leaderboard.
- Secrets stay in the environment (`REQ-043`, `REQ-044`).

## Expected Behavior
1. Without `DATABASE_URL`, development seeds six players; production starts empty
   and still answers successfully (`TC-013`, `TC-025`).
2. Responses and the UI both mark demo mode, and the marker is consistent
   (`TC-059`, `TC-051`).
3. The served shell carries title/description/application-name and the pre-paint
   theme script (`TC-090`, `TC-091`).
4. No `mongodb://` string is compiled into the source (`TC-124`).

## Error Handling
- A misconfigured `DATABASE_URL` makes every endpoint answer 400 with the driver
  error; the page still renders and shows empty boards (`TC-130`, `TC-132`).
- Invalid `PORT` values are rejected by the platform, not the app (`UNKNOWN /
  REQUIRES VALIDATION` — not tested).

## Permissions
Configuration is environment-level; there is no in-app admin surface.

## Related APIs
All three endpoints expose or depend on the storage mode.

## Related Database Tables
`scores` (existence of the DB decides the mode).

## Related UI
The `demo` chip on both leaderboard cards; the empty states a fresh production board shows.

## Existing Tests
| Test | What it proves | Status |
| --- | --- | --- |
| TC-025 | production seeds nothing | PASS |
| TC-059 | demo flag consistency across endpoints | PASS |
| TC-090, TC-092 | metadata, description and loader in the served shell | PASS |
| TC-124 | no compiled-in connection string; env-only credentials | PASS |
| TC-123 | no secrets in tracked files | PASS |

## Missing Tests
- Real Vercel Analytics delivery (needs a deployment) — `TC-217`, manual.
- Behaviour with a malformed `DATABASE_URL` (e.g. `not-a-uri`) — `NOT_EXECUTED`
  (the unreachable-host case is covered; a syntactically invalid URI is not).

## Known Issues
- `X-Powered-By: Next.js` is advertised by the framework (part of **BUG-015**).
- No request logging/metrics exist in the app; observability beyond analytics and
  the platform's own logs is `UNKNOWN / REQUIRES VALIDATION`.

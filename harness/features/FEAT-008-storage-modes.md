# FEAT-008 — Storage modes: MongoDB and the in-memory demo board

**Features:** `FEAT-008`
**Primary code:** `src/lib/db.ts`, `src/lib/memoryScores.ts`, `src/models/Score.ts`

## Purpose
Make score persistence optional: the same API works against MongoDB when a
connection string exists, and against a process-local store when it does not — so
the game is fully playable before any infrastructure is set up.

## User
Deployers/operators choose the mode by setting `DATABASE_URL`; players only see the
consequence (a `demo` chip in the leaderboard).

## Entry Point
`hasDatabase()` (`Boolean(process.env.DATABASE_URL)`) is evaluated on every request;
each route branches on it.

## Dependencies
- `mongoose` 9.2.1 (only backend dependency)
- `globalThis.mongoose` connection cache (one connection per process)
- `globalThis.__naginiScores` demo store (survives hot reloads in dev)

## Inputs
| Input | Effect |
| --- | --- |
| `DATABASE_URL` unset | demo mode: in-memory store, `demo: true` in responses |
| `DATABASE_URL` set and reachable | MongoDB mode: durable `scores` collection |
| `DATABASE_URL` set and unreachable | every request fails with 400 and the raw driver message (BUG-014, BUG-017) |
| `NODE_ENV` | demo store is seeded with six players only outside production (BR-012) |

## Outputs
- MongoDB mode: durable documents with timestamps, `demo` absent from responses
- Demo mode: `demo: true` + the full stored row in the POST response
- Development demo mode: six seeded players (`Nagini` 42, `Tom Riddle` 31, `Hermione` 27, `Draco` 18, `Ron` 12, `Dobby` 7)

## Business Rules
- `BR-012` — demo mode must be explicit in the API and visible in the UI.
- `BR-001`/`BR-002` — merge semantics are implemented twice (route + `upsertScore`)
  and must stay equivalent.

## Expected Behavior
1. Development without `DATABASE_URL` starts with six demo players (`TC-013`).
2. Production without `DATABASE_URL` starts with an **empty** board and still
   answers 200 with `demo: true` (`TC-025`, `TC-070`).
3. Write/read semantics in demo mode: create, merge, filter, paginate (`TC-014`…TC-023`).
4. With an unreachable database, all three endpoints answer 400 with the connection
   error and the failure is cached (fast failures) (`TC-130`, `TC-131`).
5. The UI stays functional when the API fails (`TC-132`, `TC-047`).

## Error Handling
| Situation | Behaviour |
| --- | --- |
| No `DATABASE_URL` | demo mode, never an error |
| Unreachable database | 400 + raw driver message; the rejected promise is cached for the process lifetime (**BUG-017**, no recovery without restart) |
| Mongoose validation/cast error | caught by the route → 400 |
| Duplicate concurrent first write (MongoDB) | possible duplicate rows: the route does read-then-write with no unique index (**BUG-018**, not executed) |

## Permissions
None. The database credentials live only in the environment (verified by TC-124).

## Related APIs
All three: `/addScore`, `/highestScore`, `/latestScore` branch on the storage mode.

## Related Database Tables
`scores` (see `PROJECT_OVERVIEW.md` §7 for the field-by-field schema). No indexes
beyond `_id`; no migrations or seeds are stored in the repository.

## Related UI
`Leaderboard` (demo chip), the empty states that a fresh production board produces.

## Existing Tests
| Test | What it proves | Status |
| --- | --- | --- |
| TC-013…TC-024 | in-memory store contract (seed, ordering, pagination, merge, NaN) | PASS (+ 1 known issue) |
| TC-025 | production starts empty | PASS |
| TC-059 | demo flag reported consistently | PASS |
| TC-130…TC-132 | degradation with an unreachable database | PASS (+ BUG-017 known issue) |
| TC-133…TC-137 | MongoDB mode CRUD, concurrency, timestamps, ordering | NOT_EXECUTED (no MongoDB) |

## Missing Tests
- Everything that needs a real MongoDB: durability across restarts, index behaviour,
  the concurrency race, Mongoose validation of hostile input. The suite exists and is
  gated behind `HARNESS_MONGODB_READY=1`.
- Demo-mode memory growth over a long-running process (`NOT_EXECUTED`).

## Known Issues
- **BUG-017** a rejected connection promise is cached forever — one blip needs a restart.
- **BUG-018** `name` has no unique index and the write path is not atomic; concurrent
  first writes for the same player can create duplicates.
- Query performance in MongoDB mode is unverified: `find({score: {$gt: 0}})` with
  `sort({highestScore: -1})` will do a collection scan without an index
  (`UNKNOWN / REQUIRES VALIDATION`).

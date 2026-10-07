# FEAT-007 — Score submission and profanity filtering

**Features:** `FEAT-007`
**Primary code:** `src/app/api/snakeGame/addScore/route.ts`, `src/lib/foulWords.ts`, `useSnakeGame.highestScoreSend`

## Purpose
Accept the result of a finished run, keep the leaderboard's data rules intact and
keep offensive names off the board. This is the only write path in the product.

## User
Every player who finishes a run (the call is automatic); indirectly, everyone who
reads the leaderboard afterwards.

## Entry Point
`POST /api/snakeGame/addScore` with `{ name, score }`, sent by `handleGameOver`.
Also directly callable by any HTTP client (see Permissions).

## Dependencies
- `foulWords` (632 entries) for the rename rule
- `hasDatabase()` to choose the storage backend (FEAT-008)
- `Score` model for the MongoDB path

## Inputs
| Field | Type | Validation today | Required by design |
| --- | --- | --- | --- |
| `name` | string | must be a string with `.toLowerCase()` (otherwise 400); foul-word rename | non-empty, ≤ 20 chars, `[a-zA-Z0-9 ]` |
| `score` | number | **none** (see BUG-001) | integer ≥ 0 (client always sends ≥ 3) |

## Outputs
| Storage | Success response | Failure response |
| --- | --- | --- |
| In-memory (demo) | `201 { message, score: StoredScore, demo: true }` | `400 { message }` |
| MongoDB | `201 { message }` | `400 { message }` (Mongoose cast/validation errors) |

## Business Rules
- `BR-001` — one row per name; a known name is updated, not duplicated.
- `BR-002` — best score is permanent, `latestScore` is overwritten, `visits` increments.
- `BR-007` — blocked names become `Anonymous` (substring, case-insensitive).
- `BR-003` — a stored `score <= 0` row is simply never ranked.

## Expected Behavior
1. A valid submission returns 201 and the row is visible on the leaderboard (`TC-056`).
2. A lower repeat run keeps the best score and updates the latest (`TC-057`).
3. An equal repeat run does not duplicate the row (`TC-058`).
4. A blocked name is stored as `Anonymous` (`TC-060`).
5. Malformed payloads are rejected with 400 (`TC-061`…TC-066`).
6. Demo mode is reported in the response so the UI can show the `demo` chip (`TC-059`).

## Error Handling
| Situation | Current behaviour |
| --- | --- |
| Missing/non-string `name` | `400 { message: "Cannot read properties of undefined (reading 'toLowerCase')" }` |
| Malformed/empty JSON | `400 { message: "Unexpected end of JSON input" }` |
| Unreachable database | `400 { message: "connect ECONNREFUSED …" }` (raw driver text — BUG-014) |
| Oversized body | accepted (no limit — BUG-013) |
| Foul-word match | silently renamed, still 201 |

## Permissions
**None.** The endpoint is public and unauthenticated: any client can write any score
for any name. This is an accepted scope for an arcade page but is recorded as
`BUG-016` (no plausibility control) so it is not mistaken for an oversight.

## Related APIs
This endpoint itself; the two GET routes (FEAT-006) expose its results.

## Related Database Tables
`scores` — insert or update of `name`, `score`, `highestScore`, `latestScore`, `visits`.

## Related UI
`GameOver` triggers the call; the hub's leader ticker and the leaderboard show the result.

## Existing Tests
| Test | What it proves | Status |
| --- | --- | --- |
| TC-056…TC-060 | happy path, merge rules, dedupe, demo flag, rename | PASS |
| TC-061…TC-066 | rejected payloads (missing name, empty object, malformed JSON, array, wrong type) | PASS |
| TC-067, TC-068 | missing/non-numeric score should be rejected | KNOWN ISSUE (BUG-001) |
| TC-069, TC-069b | name rules the API does not enforce, and what it does today | KNOWN ISSUE (BUG-003) |
| TC-060b, TC-060c, TC-060d | foul-word false positive and record merging | PASS / KNOWN ISSUE (BUG-004) |
| TC-089b, TC-120b | oversized body and rapid writes accepted | KNOWN ISSUE (BUG-013) |
| TC-116, TC-117 | script/NoSQL-shaped input stored as inert data | PASS |

## Missing Tests
- Mongoose validation behaviour for a non-numeric score (needs a database — `TC-134`).
- The submission path from a real browser (network failure, offline) — `TC-214`, manual.

## Known Issues
- **BUG-001** missing/non-numeric/negative/fractional scores are accepted and stored.
- **BUG-002** substring filtering anonymises legitimate names (`Hancock`, `Bharat`).
- **BUG-003** no server-side name validation (length, character set, emptiness).
- **BUG-004** every blocked name collapses into one shared `Anonymous` row.
- **BUG-010** unusable rows (score 0/null/undefined) are persisted forever.
- **BUG-013** no body-size limit and no rate limit on this endpoint.
- **BUG-014** raw exception text is returned to the caller.
- **BUG-016** scores are unauthenticated and unverifiable.

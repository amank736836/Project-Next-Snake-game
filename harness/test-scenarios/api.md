# API Scenarios

Contract-level scenarios for the three route handlers. All are black-box (HTTP) and
run against a production build; the same suite can be pointed at staging with
`HARNESS_BASE_URL`.

| ID | Scenario | Endpoint | Test cases | Status |
| --- | --- | --- | --- | --- |
| SCN-075 | A valid submission returns 201 and a stored row | POST /addScore | TC-056 | PASS |
| SCN-076 | Repeat submissions merge into one row with correct best/latest/visits | POST /addScore | TC-057, TC-058 | PASS |
| SCN-077 | Blocked names are renamed; different blocked names merge | POST /addScore | TC-060, TC-060c, TC-060d | PASS / KNOWN ISSUE (BUG-004) |
| SCN-078 | Invalid payloads produce 400 with a JSON body | POST /addScore | TC-061…TC-066 | PASS |
| SCN-079 | Scores that are missing or non-numeric are rejected | POST /addScore | TC-067, TC-068 | KNOWN ISSUE (BUG-001) |
| SCN-080 | The leaderboard returns `{scores, pagination}` with the documented maths | GET /highestScore | TC-070, TC-071, TC-077 | PASS |
| SCN-081 | Ordering is by best score descending; ties are stable | GET /highestScore | TC-072, TC-073 | PASS |
| SCN-082 | `score > 0` filtering applies to both boards | GET both | TC-074, TC-083 | PASS |
| SCN-083 | Pages do not overlap and a page past the end is empty | GET /highestScore | TC-075, TC-076 | PASS |
| SCN-084 | Invalid pagination values are handled sensibly | GET /highestScore | TC-078, TC-078b | KNOWN ISSUE (BUG-005) |
| SCN-085 | Recent hunts return ≤ 5 rows in recency order | GET /latestScore | TC-080, TC-081, TC-082 | PASS |
| SCN-086 | Method handling: 405 for unsupported verbs, 204 for OPTIONS with `allow` | all three | TC-084, TC-085 | PASS |
| SCN-087 | Responses are JSON with no HTML sniffing surface, and errors stay JSON | all three | TC-093b, TC-115 | PASS |
| SCN-088 | The demo flag is present exactly when no database is configured | all three | TC-059, TC-070 (absence in DB mode: TC-137, blocked) | PARTIAL (demo mode verified; MongoDB mode blocked) |

## Contract reference (executable truth)

```http
POST /api/snakeGame/addScore
Content-Type: application/json
{ "name": "Nagini", "score": 42 }

201 → { "message": "Score added/updated successfully (in-memory).",
        "score": { "name": "Nagini", "score": 42, "highestScore": 42,
                   "latestScore": 42, "visits": 1, "updatedAt": "…" },
        "demo": true }
400 → { "message": "<raw error text>" }

GET /api/snakeGame/highestScore?page=1&limit=5
200 → { "scores": [ … ], "pagination": { "total": 3, "page": 1, "limit": 5, "totalPages": 1 }, "demo": true }

GET /api/snakeGame/latestScore
200 → [ { "name": "Nagini", "score": 42, "latestScore": 42, "updatedAt": "…" }, … ]   // max 5
```

Captured responses: `evidence/api-responses/RUN-2026-001/`.

## Unverified API behaviour

| Area | Status | How to verify |
| --- | --- | --- |
| MongoDB-mode responses (`demo` absent, Mongoose casting, `createdAt`) | BLOCKED | `HARNESS_MONGODB_URL=… npm run test:database` (TC-133…TC-137) |
| Real deployment (CDN, proxy headers, timeouts) | NOT_EXECUTED | `HARNESS_BASE_URL=https://… npm run test:api` |
| Rate-limit/abuse controls | NOT_EXECUTED (none exist) | BUG-013 |

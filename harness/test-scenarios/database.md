# Database Scenarios

Persistence behaviour, schema expectations and degradation. The suite is written and
runnable; execution is gated on MongoDB availability, which this environment does
not have (`BLOCKED`).

| ID | Scenario | Expectation | Test cases | Status |
| --- | --- | --- | --- | --- |
| SCN-089 | A first-time player document is created and readable through the API | one document with the submitted values and timestamps | TC-133 | BLOCKED (needs MongoDB) |
| SCN-090 | A repeat submission updates the existing document instead of inserting | one document per player, `visits` incremented | TC-134 | BLOCKED |
| SCN-091 | Concurrent first writes for one name do not fork the player | one document | TC-135 | BLOCKED + flagged as `todo` (BUG-018) |
| SCN-092 | Documents carry `createdAt`/`updatedAt` because the schema enables timestamps | both fields present and increasing | TC-136 | BLOCKED |
| SCN-093 | MongoDB-mode reads follow the same ordering/pagination contract as demo mode | sorted, paginated, no `demo` flag | TC-137 | BLOCKED |
| SCN-094 | An unreachable database makes the API fail predictably without hanging | HTTP 400 with the driver error; first call bounded by the connect timeout | TC-130, TC-131 | PASS |
| SCN-095 | A rejected connection is cached so subsequent calls fail fast | second call ≤ first call + small delta | TC-131 | PASS (see BUG-017 for the permanent-cache consequence) |
| SCN-096 | The front end survives a database outage | page renders, boards empty, API still returns JSON | TC-132, TC-047 | PASS |

## Schema under test

```text
collection: scores
  _id            ObjectId
  name           String   required                ← identity key (findOne)
  score          Number   required                ← best score mirror
  highestScore   Number   default 0               ← sort key
  latestScore    Number   default 0               ← "recent hunts" value
  visits         Number   default 0               ← submission counter
  createdAt      Date     timestamps: true
  updatedAt      Date     timestamps: true
indexes: _id only (no index on score / highestScore / name)   ← BUG-018
```

## How to execute this suite (when a database exists)

```bash
# 1. start MongoDB (locally, in Docker, or use a staging cluster)
export HARNESS_MONGODB_URL='mongodb://127.0.0.1:27017/nagini_test'   # never commit real creds

# 2. build + boot a server that uses it, and run the gated suite
npm run build
HARNESS_MONGODB_URL="$HARNESS_MONGODB_URL" npm run test:database
```

The runner starts the server on port 3101 with `DATABASE_URL="$HARNESS_MONGODB_URL"`
and sets `HARNESS_MONGODB_READY=1`, which un-skips TC-133…TC-137.

Afterwards, clean up the namespaced test rows:

```bash
mongosh "$HARNESS_MONGODB_URL" --eval 'db.scores.deleteMany({ name: /[0-9a-z]{6}$/ })'
```

## Unverified database concerns

| Concern | Why it matters | Status |
| --- | --- | --- |
| Concurrent duplicate rows (SCN-091) | Two documents for one player would double-count a person on the board | UNKNOWN / REQUIRES VALIDATION → BUG-018 |
| Query performance without an index | `find({score:{$gt:0}}).sort({highestScore:-1})` scans the collection; fine at demo scale, not at 10⁵+ rows | NOT_EXECUTED (no dataset, no profiler) |
| Schema drift / migrations | No migrations exist; the schema is defined only by the Mongoose model | UNKNOWN / REQUIRES VALIDATION |
| Backups, retention, GDPR-style deletion | Not part of the codebase; no personal data beyond a self-chosen display name | UNKNOWN / REQUIRES VALIDATION (ops concern) |

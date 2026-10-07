# Database suite

Two files, two very different situations:

| File | Cases | Needs MongoDB? | Purpose |
| --- | --- | --- | --- |
| `degradation.test.mjs` | TC-130, TC-131, TC-131b, TC-132 | No — it *requires* the database to be unreachable | Proves the failure mode: bounded latency, cached failure, no HTML error page, front end survives |
| `mongodb-mode.test.mjs` | TC-133…TC-137 | Yes | Real persistence: create, update, timestamps, ordering, and the concurrency case TC-135 |

## How the runner behaves

`npm run test:database` starts a server on **:3101**. If `HARNESS_MONGODB_URL` is set it
is passed through as `DATABASE_URL` and the gated cases run; otherwise the server is
started against a deliberately unreachable host
(`mongodb://127.0.0.1:27099/nagini_test?serverSelectionTimeoutMS=1500`) and the gated
cases skip with a message that names the variable to set.

## Running against a real database

```bash
export HARNESS_MONGODB_URL='mongodb://127.0.0.1:27017/nagini_test'
npm run build && npm run test:database
```

See [`../../test-tools/mongodb-local.md`](../../test-tools/mongodb-local.md) for setup and
cleanup, and [`../../test-scenarios/database.md`](../../test-scenarios/database.md) for
the schema under test.

## Known gaps

- TC-135 is a `todo` case: the route does `findOne` + `save` with no unique index, so
  concurrent first writes can fork one player into two documents. It is written to fail
  until BUG-018 is fixed.
- No index exists on `name`, `score` or `highestScore`, so the read queries scan the
  collection. Query cost at scale is `UNKNOWN / REQUIRES VALIDATION` — there is no
  dataset or profiler run to support a claim either way.
- The suite does not clean up after itself; delete the throwaway database between runs
  if you want a stable `total`.

# MongoDB (for the gated database suite)

- **Tool:** MongoDB server 6/7 + `mongosh` (client). **Not installed in this
  environment**, which is why TC-133…TC-137 are `NOT_EXECUTED`.
- **Purpose:** execute the persistence suite for real: document creation, repeat-write
  updates, timestamps, ordering, and — most importantly — the concurrency case TC-135
  that decides whether `BUG-018` (duplicate player documents) is real.
- **Installation:** pick one (never commit credentials):
  ```bash
  docker run -d --name nagini-mongo -p 27017:27017 mongo:7      # container
  brew install mongodb-community && brew services start mongodb-community   # macOS
  ```
- **Configuration:** a single environment variable, read by the app and the harness:
  ```bash
  export HARNESS_MONGODB_URL='mongodb://127.0.0.1:27017/nagini_test'   # throwaway DB
  ```
  The runner starts the app with `DATABASE_URL="$HARNESS_MONGODB_URL"` and sets
  `HARNESS_MONGODB_READY=1`, which un-skips the suite. Never commit a real connection
  string; the harness scans for them (`TC-123`, `TC-124`).
- **How to run:**
  ```bash
  npm run build
  HARNESS_MONGODB_URL="$HARNESS_MONGODB_URL" npm run test:database
  ```
- **Expected output:** the five gated cases report `✔`/`✖` instead of `﹣ NOT_EXECUTED`,
  alongside the degradation cases that always run. TC-135 is written as a `todo` case, so
  it **will** fail loudly in the summary until BUG-018 is addressed — that is the point.
- **Where results are stored:** `test-results/latest/database.tap` plus the run archive;
  raw API responses can be captured with `npm run test:evidence` (the DB-mode section
  then targets the live database instead of the unreachable one).
- **Known limitations:**
  - No fixture loader: documents are created through the public API, so every run leaves
    data behind. Clean up with
    `mongosh "$HARNESS_MONGODB_URL" --eval 'db.scores.deleteMany({})'` (or delete the
    throwaway database).
  - The suite is **not** isolated per test in this version — it asserts relative
    positions (filtered per run tag), so it is safe on a shared test database but not
    snapshot-clean.
  - `mongodb-memory-server` was rejected as a dependency: it downloads a MongoDB binary
    at install time, which is heavier and less honest than pointing at a real server.

#!/usr/bin/env bash
# Database suite — MongoDB-mode behaviour and degradation.
#
#   default            : starts a server with an UNREACHABLE DATABASE_URL to test failure handling
#   HARNESS_MONGODB_URL: starts a server with that real connection string (needs a running MongoDB)
#
# Run: npm run test:database
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

ensure_build

if [ -n "${HARNESS_MONGODB_URL:-}" ]; then
  log "starting the server against the MongoDB instance in HARNESS_MONGODB_URL"
  ensure_server "$DB_PORT" "server-mongodb" DATABASE_URL="$HARNESS_MONGODB_URL"
  export HARNESS_MONGODB_READY=1
else
  log "no HARNESS_MONGODB_URL provided — testing degradation with an unreachable database"
  ensure_server "$DB_PORT" "server-db-unreachable" \
    DATABASE_URL="mongodb://127.0.0.1:27099/nagini_test?serverSelectionTimeoutMS=1500&connectTimeoutMS=1500"
fi

export HARNESS_DB_BASE_URL="http://127.0.0.1:$DB_PORT"
run_suite "database" "harness/automation/database/*.test.mjs"
node "$HARNESS_DIR/automation/utilities/summarize.mjs" database || true
log "TAP evidence: test-results/latest/database.tap"

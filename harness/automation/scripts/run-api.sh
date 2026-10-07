#!/usr/bin/env bash
# API contract suites — black-box HTTP against a production build.
# Run: npm run test:api
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

ensure_build
ensure_server "$DEFAULT_PORT" "server-inmemory"
export HARNESS_BASE_URL="http://127.0.0.1:$DEFAULT_PORT"

run_suite "api" "harness/automation/api/*.test.mjs"
node "$HARNESS_DIR/automation/utilities/summarize.mjs" api || true
log "TAP evidence: test-results/latest/api.tap"

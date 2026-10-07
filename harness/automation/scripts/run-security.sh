#!/usr/bin/env bash
# Security / VAPT suites — HTTP surface, input abuse and repository hygiene.
# Run: npm run test:security
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

ensure_build
ensure_server "$DEFAULT_PORT" "server-inmemory"
export HARNESS_BASE_URL="http://127.0.0.1:$DEFAULT_PORT"

run_suite "security" "harness/automation/security/*.test.mjs"
node "$HARNESS_DIR/automation/utilities/summarize.mjs" security || true
log "TAP evidence: test-results/latest/security.tap"

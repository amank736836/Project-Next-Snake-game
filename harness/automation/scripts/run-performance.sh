#!/usr/bin/env bash
# Performance guardrails — latency, payload size and a concurrent burst.
# Run: npm run test:performance
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

ensure_build
ensure_server "$DEFAULT_PORT" "server-inmemory"
export HARNESS_BASE_URL="http://127.0.0.1:$DEFAULT_PORT"

run_suite "performance" "harness/automation/performance/*.test.mjs"
node "$HARNESS_DIR/automation/utilities/summarize.mjs" performance || true
log "measurements: test-results/latest/performance-summary.json"

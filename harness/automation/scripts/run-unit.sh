#!/usr/bin/env bash
# Unit suites — pure logic, no server and no browser required.
# Run: npm run test:unit
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

run_suite "unit" "harness/automation/unit/*.test.mjs"
node "$HARNESS_DIR/automation/utilities/summarize.mjs" unit || true
log "TAP evidence: test-results/latest/unit.tap"

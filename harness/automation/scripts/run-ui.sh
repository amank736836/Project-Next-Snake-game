#!/usr/bin/env bash
# UI suites — game hook in jsdom, component markup, served HTML shell.
# Run: npm run test:ui
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

ensure_build
ensure_server "$DEFAULT_PORT" "server-inmemory"
export HARNESS_BASE_URL="http://127.0.0.1:$DEFAULT_PORT"

run_ui_suite "ui" "harness/automation/ui/*.test.mjs"
node "$HARNESS_DIR/automation/utilities/summarize.mjs" ui || true
log "TAP evidence: test-results/latest/ui.tap"

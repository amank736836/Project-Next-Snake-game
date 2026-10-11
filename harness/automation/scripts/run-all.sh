#!/usr/bin/env bash
# Full harness execution: unit → api → ui → performance → security → database → visual.
# The visual suite drives a real browser and reports SKIP (never a pass) when no
# Chromium binary is available.
# Run: npm test         (or: bash harness/automation/scripts/run-all.sh)
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log "execution id: $RUN_ID"
ensure_build
ensure_server "$DEFAULT_PORT" "server-inmemory"
export HARNESS_BASE_URL="http://127.0.0.1:$DEFAULT_PORT"
# NB: child scripts only stop servers they started themselves, so this one stays up
#     for the whole run and each suite reuses it.

HARNESS_PORT="$DEFAULT_PORT" bash "$SCRIPT_DIR/run-unit.sh"
HARNESS_PORT="$DEFAULT_PORT" bash "$SCRIPT_DIR/run-api.sh"
HARNESS_PORT="$DEFAULT_PORT" bash "$SCRIPT_DIR/run-ui.sh"
HARNESS_PORT="$DEFAULT_PORT" bash "$SCRIPT_DIR/run-performance.sh"
HARNESS_PORT="$DEFAULT_PORT" bash "$SCRIPT_DIR/run-security.sh"
HARNESS_PORT="$DEFAULT_PORT" bash "$SCRIPT_DIR/run-database.sh"
export QA_SHOT_DIR="$HARNESS_DIR/evidence/screenshots/$RUN_ID"
HARNESS_PORT="$DEFAULT_PORT" bash "$SCRIPT_DIR/run-visual.sh"

node "$HARNESS_DIR/automation/utilities/summarize.mjs" --finalize
log "artefacts: harness/test-results/latest/ · harness/test-results/historical/$RUN_ID/ · harness/test-results/summaries/$RUN_ID.md"

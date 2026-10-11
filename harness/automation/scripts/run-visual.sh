#!/usr/bin/env bash
# Visual / responsive / accessibility suites — real browser, Playwright driving
# a Chromium binary. Skips cleanly (SKIP, never a false pass) when no browser is
# installed: set QA_CHROME_PATH or run `npx playwright install chromium`.
#
# Run: npm run test:visual
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

ensure_build
ensure_server "$DEFAULT_PORT" "server-inmemory"
export HARNESS_BASE_URL="http://127.0.0.1:$DEFAULT_PORT"
export QA_SHOT_DIR="$HARNESS_DIR/evidence/screenshots/$RUN_ID"

run_suite "visual" "harness/automation/visual/*.test.mjs"
node "$HARNESS_DIR/automation/utilities/summarize.mjs" visual || true
log "TAP evidence: test-results/latest/visual.tap"
log "Screenshots: ${QA_SHOT_DIR#"$REPO_ROOT"/}"

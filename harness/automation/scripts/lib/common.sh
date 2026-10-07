#!/usr/bin/env bash
# Shared helpers for every harness suite script.
# Source this file, do not execute it directly.

set -euo pipefail

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
REPO_ROOT="$(cd "$HARNESS_DIR/.." && pwd)"
RESULTS_DIR="$HARNESS_DIR/test-results/latest"
EVIDENCE_DIR="$HARNESS_DIR/evidence"
LOG_DIR="$EVIDENCE_DIR/logs"

if [ -n "${HARNESS_RUN_ID:-}" ]; then
  RUN_ID="$HARNESS_RUN_ID"
else
  # Ad-hoc execution: clearly marked as such, because it replaces
  # test-results/latest/ but is not a recorded run (RUN-YYYY-nnn).
  RUN_ID="RUN-$(date -u +%Y-%m-%d)-adhoc-$(date -u +%H%M%S)"
fi
export HARNESS_RUN_ID="$RUN_ID"
HISTORY_DIR="$HARNESS_DIR/test-results/historical/$RUN_ID"

DEFAULT_PORT="${HARNESS_PORT:-3100}"
DB_PORT="${HARNESS_DB_PORT:-3101}"

mkdir -p "$RESULTS_DIR" "$LOG_DIR"

log()  { printf '\033[36m[harness]\033[0m %s\n' "$*"; }
warn() { printf '\033[33m[harness]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[31m[harness]\033[0m %s\n' "$*" >&2; exit 1; }

cd "$REPO_ROOT"

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
ensure_build() {
  if [ "${HARNESS_FORCE_BUILD:-0}" = "1" ] || [ ! -d "$REPO_ROOT/.next" ]; then
    log "building production bundle (npm run build)…"
    npm run build >"$LOG_DIR/build-$RUN_ID.log" 2>&1 || die "build failed — see $LOG_DIR/build-$RUN_ID.log"
  fi
}

# ---------------------------------------------------------------------------
# Servers
# ---------------------------------------------------------------------------
SERVER_PIDS=()

wait_for_http() {
  local url="$1" attempts="${2:-80}"
  for _ in $(seq 1 "$attempts"); do
    if curl -fsS -o /dev/null --max-time 2 "$url" 2>/dev/null; then return 0; fi
    sleep 0.25
  done
  return 1
}

# ensure_server <port> <log-name> [env assignments…]
ensure_server() {
  local port="$1" label="$2"; shift 2
  local url="http://127.0.0.1:$port/"
  local log_file="$LOG_DIR/$label-$RUN_ID.log"

  if curl -fsS -o /dev/null --max-time 2 "$url" 2>/dev/null; then
    log "reusing the server already listening on :$port"
    return 0
  fi

  log "starting $label on :$port (log: ${log_file#"$REPO_ROOT"/})"
  # setsid puts the server (and the next-server child it spawns) in its own
  # process group, so stop_servers can take the whole tree down cleanly.
  setsid env PORT="$port" "$@" npm start >"$log_file" 2>&1 &
  SERVER_PIDS+=("$!")
  if ! wait_for_http "$url"; then
    warn "server did not answer on $url — last log lines:"
    tail -n 20 "$log_file" >&2
    die "$label failed to start"
  fi
  log "$label ready (pid ${SERVER_PIDS[-1]})"
}

stop_servers() {
  [ "${HARNESS_KEEP_SERVER:-0}" = "1" ] && { log "leaving servers running (HARNESS_KEEP_SERVER=1)"; return 0; }
  for pid in "${SERVER_PIDS[@]:-}"; do
    [ -z "$pid" ] && continue
    kill -TERM -- "-$pid" 2>/dev/null || pkill -TERM -P "$pid" 2>/dev/null || true
    kill -TERM "$pid" 2>/dev/null || true
  done
  # give the tree a moment to shut down, then force anything still holding on
  for pid in "${SERVER_PIDS[@]:-}"; do
    [ -z "$pid" ] && continue
    for _ in 1 2 3 4 5 6 7 8 9 10; do
      kill -0 "$pid" 2>/dev/null || break
      sleep 0.2
    done
    if kill -0 "$pid" 2>/dev/null; then
      warn "server pid $pid did not exit — sending SIGKILL"
      kill -KILL -- "-$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true
    fi
  done
  SERVER_PIDS=()
}

# ---------------------------------------------------------------------------
# Test execution
# ---------------------------------------------------------------------------
# run_suite <suite-name> <glob> [node flags…]
run_suite() {
  local suite="$1" glob="$2"; shift 2
  local tap="$RESULTS_DIR/$suite.tap"
  local spec="$LOG_DIR/$suite-$RUN_ID.spec.txt"

  log "▶ $suite  ($glob)"
  set +e
  node --import ./harness/automation/utilities/register.mjs \
       --disable-warning=MODULE_TYPELESS_PACKAGE_JSON \
       --disable-warning=ExperimentalWarning \
       --test \
       --test-reporter=spec --test-reporter-destination=stdout \
       --test-reporter=tap --test-reporter-destination="$tap" \
       "$@" \
       "$glob" 2>&1 | tee "$spec"
  local code=${PIPESTATUS[0]}
  set -e

  if [ "$code" -ne 0 ]; then warn "$suite reported failures (exit $code)"; fi
  return 0
}

# Browsers/UI suites need the jsdom environment flag.
run_ui_suite() {
  HARNESS_BROWSER_ENV=1 run_suite "$@"
}

finish() {
  local exit_code=$?
  stop_servers
  exit "$exit_code"
}

trap finish EXIT

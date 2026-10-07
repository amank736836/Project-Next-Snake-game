#!/usr/bin/env bash
# Captures raw HTTP evidence for a run into harness/evidence/.
#
#   HARNESS_RUN_ID=RUN-2026-001 bash harness/automation/scripts/capture-evidence.sh
#
# Produces (overwrites for the same run id):
#   evidence/api-responses/<RUN_ID>/…      responses from a demo-mode server
#   evidence/database-results/<RUN_ID>/…   responses from a DB-mode server with
#                                          an unreachable database (degradation)
#
# The captured bytes are exactly what the server returned — no editing.
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

API_DIR="$EVIDENCE_DIR/api-responses/$RUN_ID"
DB_DIR="$EVIDENCE_DIR/database-results/$RUN_ID"
mkdir -p "$API_DIR" "$DB_DIR"

capture() {                     # capture <file> <curl args…>
  local out="$1"; shift
  { curl -sS -D - "$@" ; } >"$out" 2>&1 || true
}

json_post() {                   # json_post <file> <json> [url]
  local out="$1" body="$2" url="${3:-http://127.0.0.1:$DEFAULT_PORT/api/snakeGame/addScore}"
  { curl -sS -D "$out.headers.txt" -o "$out.body.json" \
        -H 'content-type: application/json' -X POST -d "$body" "$url"; } 2>&1 || true
}

# --------------------------------------------------------------------------
# 1. Demo-mode server (no DATABASE_URL)
# --------------------------------------------------------------------------
ensure_build
ensure_server "$DEFAULT_PORT" "server-inmemory"
BASE="http://127.0.0.1:$DEFAULT_PORT"
log "capturing api-responses → ${API_DIR#"$REPO_ROOT"/}"

json_post "$API_DIR/addScore-valid" '{"name":"Nagini","score":42}'
json_post "$API_DIR/addScore-blocked-name" '{"name":"damn","score":3}'
json_post "$API_DIR/addScore-missing-name" '{"score":5}'

curl -sS -o "$API_DIR/highestScore-demo.body.json" "$BASE/api/snakeGame/highestScore?page=1&limit=5" || true
curl -sS -o "$API_DIR/highestScore-invalid-page.body.json" "$BASE/api/snakeGame/highestScore?page=abc&limit=5" || true
capture "$API_DIR/addScore-get-405.headers.txt" -X GET "$BASE/api/snakeGame/addScore"
capture "$API_DIR/addScore-options-preflight.headers.txt" -X OPTIONS \
        -H 'Origin: https://example.test' -H 'Access-Control-Request-Method: POST' \
        "$BASE/api/snakeGame/addScore"
capture "$API_DIR/page-shell.headers.txt" -o /dev/null "$BASE/"

{
  for probe in /.env /.env.local /api/.env /does-not-exist; do
    code=$(curl -sS -o /dev/null -w '%{http_code}' "$BASE$probe")
    printf '%s -> %s\n' "$probe" "$code"
  done
} >"$API_DIR/dotfile-and-404-probes.txt"

# --------------------------------------------------------------------------
# 2. DB-mode server with an unreachable database (degradation evidence)
# --------------------------------------------------------------------------
export DATABASE_URL="${HARNESS_UNREACHABLE_DB_URL:-mongodb://127.0.0.1:27099/nagini_test?serverSelectionTimeoutMS=1500&connectTimeoutMS=1500}"
ensure_server "$DB_PORT" "server-db-unreachable" DATABASE_URL="$DATABASE_URL"
DB_BASE="http://127.0.0.1:$DB_PORT"
log "capturing database-results → ${DB_DIR#"$REPO_ROOT"/}"

for endpoint in "highestScore?page=1&limit=5" "latestScore"; do
  name=${endpoint%%\?*}
  {
    printf '# GET /api/snakeGame/%s\n' "$endpoint"
    curl -sS -D - -w '\n# wall time: %{time_total}s\n' "$DB_BASE/api/snakeGame/$endpoint"
  } >"$DB_DIR/$name-degraded.txt" 2>&1 || true
done

{
  printf '# POST /api/snakeGame/addScore\n'
  curl -sS -D - -H 'content-type: application/json' -X POST \
       -d '{"name":"DegradedProbe","score":1}' "$DB_BASE/api/snakeGame/addScore"
} >"$DB_DIR/addScore-degraded.txt" 2>&1 || true

{
  printf '# server log (%s) — exit paths only\n' "server-db-unreachable-$RUN_ID.log"
  tail -n 12 "$LOG_DIR/server-db-unreachable-$RUN_ID.log" 2>/dev/null || echo "(log not found)"
} >"$DB_DIR/server-log-tail.txt"

stop_servers
log "evidence captured for $RUN_ID"

# Copy-paste HTTP examples

For manual exploration against a running server. Start one first:

```bash
npm run build && PORT=3100 npm start        # terminal 1
BASE=http://127.0.0.1:3100                  # terminal 2
```

Replace `${BASE}` with `${HARNESS_BASE_URL}` when probing a deployment. **Never paste
a real connection string or token into this file or into a shell history you share.**

## Read the boards

```bash
curl -sS "$BASE/api/snakeGame/highestScore?page=1&limit=5" | jq .
curl -sS "$BASE/api/snakeGame/latestScore" | jq .
```

## Submit a score

```bash
curl -sS -D - -H 'content-type: application/json' \
     -d '{"name":"CurlProbe","score":7}' \
     "$BASE/api/snakeGame/addScore" | jq -s .
```

Expected: `201` with `{"message":"…","score":{…},"demo":true}` when no `DATABASE_URL`
is configured.

## Probe the validation rules (all of these currently succeed — see BUG-001/BUG-003)

```bash
# missing score
curl -sS -o /dev/null -w '%{http_code}\n' -H 'content-type: application/json' \
     -d '{"name":"NoScore"}' "$BASE/api/snakeGame/addScore"

# string score
curl -sS -H 'content-type: application/json' \
     -d '{"name":"StrScore","score":"7"}' "$BASE/api/snakeGame/addScore" | jq .

# 5000-character name (bounded here to 50 for readability)
LONG=$(printf 'A%.0s' $(seq 1 50))
curl -sS -H 'content-type: application/json' \
     -d "{\"name\":\"$LONG\",\"score\":1}" "$BASE/api/snakeGame/addScore" | jq -r .score.name

# foul-word rename + false positive
curl -sS -H 'content-type: application/json' -d '{"name":"damn","score":3}' \
     "$BASE/api/snakeGame/addScore" | jq -r .score.name      # Anonymous
curl -sS -H 'content-type: application/json' -d '{"name":"Hancock","score":3}' \
     "$BASE/api/snakeGame/addScore" | jq -r .score.name      # Anonymous (BUG-002)
```

## Method, CORS and error-surface probes

```bash
curl -sS -o /dev/null -w 'GET addScore → %{http_code}\n'        "$BASE/api/snakeGame/addScore"
curl -sS -D - -o /dev/null -X OPTIONS \
     -H 'Origin: https://example.test' -H 'Access-Control-Request-Method: POST' \
     "$BASE/api/snakeGame/addScore"
curl -sS -D - -o /dev/null -X POST -H 'Origin: https://evil.example' \
     -H 'content-type: application/json' -d '{"name":"CorsProbe","score":1}' \
     "$BASE/api/snakeGame/addScore"
curl -sS -o /dev/null -w '/.env → %{http_code}\n' "$BASE/.env"
```

## Shell and cache

```bash
curl -sS -D - -o /dev/null "$BASE/"          # x-nextjs-cache: HIT, s-maxage=31536000
curl -sS "$BASE/" | grep -o 'Summoning Nagini' | head -1
```

## Stop the server

`Ctrl-C` in terminal 1. In-memory scores vanish with the process — that is the
documented demo-mode behaviour (BR-012).

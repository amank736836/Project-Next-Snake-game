# Smoke Scenarios

The minimum set to run after every deployment: if any of these fails, the release
is broken. Total runtime in this harness: under 20 seconds.

| ID | Scenario | Feature | Test cases | Status |
| --- | --- | --- | --- | --- |
| SCN-001 | The home page responds 200 with the expected title, description and HTML shell | REQ-034 | TC-090, TC-092 | PASS |
| SCN-002 | The server starts in production mode without a database and answers the leaderboard with `demo: true` | REQ-031, REQ-032 | TC-025, TC-070 | PASS |
| SCN-003 | A score can be submitted and immediately read back from the leaderboard | REQ-019, REQ-026 | TC-056, TC-057 | PASS |
| SCN-004 | The recent-hunts endpoint answers with a JSON array of at most five rows | REQ-022 | TC-080, TC-081 | PASS |
| SCN-005 | A player can start, play a few steps, pause and resume a run in a real DOM | REQ-001, REQ-016 | TC-032, TC-033, TC-041 | PASS |
| SCN-006 | Unknown routes and dotfiles are not served | REQ-030 | TC-088 | PASS |
| SCN-007 | The build and the linter are clean on the release commit | REQ-055 | — (RUN-2026-001 setup) | PASS |
| SCN-008 | The API answers JSON (never HTML) so the client's `json()` path is safe | REQ-046 | TC-093b, TC-115 | PASS |

## How to run the smoke set

```bash
npm run test:unit   # ~2 s   — includes the store contract behind SCN-002
npm run test:api    # ~1 s   — SCN-001…004, SCN-006, SCN-008
npm run test:ui     # ~5 s   — SCN-005
```

## Notes

- SCN-001's HTML assertions intentionally cover only the shell: the game UI is
  client-rendered, so a browser-capable agent must additionally confirm the hub
  actually appears (`TC-210`, manual).
- On a deployed environment (not localhost), also run the API suite against the real
  URL: `HARNESS_BASE_URL=https://<deployment> npm run test:api`. That has not been
  executed yet — `NOT_EXECUTED`.

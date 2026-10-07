# FEAT-003 — Run lifecycle: start, pause, resume, game over, restart

**Features:** `FEAT-003`
**Primary code:** `src/components/game/hooks/useSnakeGame.ts` (`startGame`, `handlePause`, `handleResume`, `handleGameOver`, `restartGame`, `backToMenu`), `GameOver.tsx`, `SnakeGame.tsx`

## Purpose
Move the player through the four screens of a session — hub → playing → game over →
hub/leaderboard — and keep the state consistent at every transition, including
persisting a paused run so the player can come back.

## User
Every player; this is the spine of the session.

## Entry Point
`GameState = "menu" | "playing" | "gameOver"` drives `SnakeGame.tsx`; transitions
are triggered by the hub buttons, the pause button, arrow keys and collisions.

## Dependencies
- `GameOver` dialog (Enter = play again, Esc = main menu)
- `localStorage.nagini_best` and `localStorage.snake_mission_save`
- `obfuscate/deobfuscate` for the save slot
- `highestScoreSend` + `updateLocalScores` on death

## Inputs
| Input | Source |
| --- | --- |
| `onStart` / `onResume` | MissionHub buttons or an arrow key |
| `onPause` | GameHeader pause button |
| `onPlayAgain` / `onMainMenu` / `onViewLeaderboard` | GameOver buttons or Enter/Esc |
| self-collision | engine (FEAT-001) |

## Outputs
- Screen changes (`menu` / `playing` / `gameOver`)
- `lastRun` summary (`score`, `bestScore`, `length`, `isRecord`) for the dialog
- A `localStorage` save on pause, removed on resume and on death
- One `POST /addScore` per completed run

## Business Rules
- `BR-010` — a run cannot end at 0 points in normal play.
- `BR-011` — paused runs and personal bests live in the browser only.
- A run cannot start without a name (`REQ-012`).

## Expected Behavior
1. **Start:** requires a non-blank name; otherwise `alert = true` and the state
   stays `menu` (`TC-031`). A valid start resets snake, score, direction and apple (`TC-032`).
2. **Pause:** returns to the hub, writes an obfuscated save and shows RESUME MISSION (`TC-041`).
3. **Resume:** restores snake, score, direction, apple and name, then consumes the save (`TC-041`).
4. **Game over:** shows the summary dialog, persists the session best, clears the
   save, resets the board and submits the score exactly once (`TC-040`).
5. **Play again:** restarts immediately with the same player (`restartGame`).
6. **Main menu / Hall of fame:** clears `lastRun` and returns to the hub or the board view.

## Error Handling
- A corrupt save slot is ignored and the current run survives (`TC-042`) — but the
  stale save is never cleared, so RESUME MISSION stays active forever (`BUG-011`).
- `localStorage` access is wrapped in `try/catch`; in private/blocked-storage
  contexts the game still runs (session best is simply not persisted).
- The score POST is fire-and-forget: a failing API does not block the game-over screen.

## Permissions
None.

## Related APIs
`POST /api/snakeGame/addScore` on death (FEAT-007).

## Related Database Tables
`scores` (indirectly, through the submission).

## Related UI
`MissionHub` (START / RESUME), `GameHeader` (PAUSE), `GameOver` (TRY AGAIN / SLAY
AGAIN, HALL OF FAME, MAIN MENU).

## Existing Tests
| Test | What it proves | Status |
| --- | --- | --- |
| TC-031, TC-032 | start validation and reset | PASS |
| TC-040 | death → dialog state, best persisted, save cleared, one POST | PASS |
| TC-041 | pause → obfuscated save → resume round-trip | PASS |
| TC-042 | corrupt save does not disturb the current run | PASS |
| TC-042b | corrupt save leaves the resume button active | KNOWN ISSUE (BUG-011) |
| TC-044, TC-045 | session best and stale save are picked up on mount | PASS |
| TC-048 | minimum-length death rule | PASS |
| TC-054, TC-055 | dialog content for normal and record runs | PASS |

## Missing Tests
- Restart from the dialog with a changed name, and double-click on START.
- Behaviour when `localStorage` is unavailable (`getItem` throws) — code path is
  `try/catch`-guarded but not exercised.
- Reloading the page mid-run (no save is written until pause) — `NOT_EXECUTED`.

## Known Issues
- **BUG-011** a corrupt/unreadable save leaves RESUME MISSION clickable with no effect.
- `handleGameOver` is invoked from inside a `setSnake` updater via `setTimeout(..., 0)`;
  React strict-mode double invocation is handled defensively, but the pattern is
  fragile and worth simplifying (`UNKNOWN / REQUIRES VALIDATION` under React 19
  strict mode in dev).

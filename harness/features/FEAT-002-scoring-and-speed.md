# FEAT-002 — Scoring and the speed ramp

**Features:** `FEAT-002`
**Primary code:** `useSnakeGame.ts` (`scoreRef`, `score`, interval creation), `GameHeader.tsx` (`useCountUp`, speed meter)

## Purpose
Reward eating with points, and convert points into difficulty: every apple makes
the next step slightly faster, down to a floor that keeps the game playable.

## User
The active player; score and speed are constantly visible in the header.

## Entry Point
The eating effect in `useSnakeGame` (`useEffect` on `snake`, comparing head to
`foodRef`), and the movement effect that derives `speed` from `score`.

## Dependencies
- `scoreRef` (authoritative during a run) + `score` state (for rendering)
- `GameHeader` count-up animation (`useCountUp`) and the 5-bar speed meter

## Inputs
| Input | Source |
| --- | --- |
| Head position, apple position | engine (FEAT-001) |
| `score` | state, incremented on each apple |

## Outputs
- `score` (integer, +1 per apple)
- `sessionBest` / `localStorage.nagini_best` on game over
- Step interval `max(95 − score, 55)` ms

## Business Rules
- `BR-008` — 95 ms at score 0, −1 ms per point, floor 55 ms.
- `BR-003` — a score of 0 is never shown on a leaderboard.
- Only completed runs are submitted (score ≥ 3 in practice, `BR-010`).

## Expected Behavior
1. Eating an apple increments the score by exactly one (`TC-038`).
2. The interval is exactly `95 − score` ms — measured at 95 → 94 → 93 ms for
   scores 0 → 1 → 2 (`TC-039`).
3. The floor is exactly 55 ms — verified after reaching score 40 on a safe path (`TC-039`).
4. The header count-up animates to the new value and lights a growing number of
   speed bars (`GameHeader`); the arithmetic is shared with the engine by construction.

## Error Handling
Not applicable — the score is a pure function of successful bites. A non-integer or
string score can only be introduced through the API (`BUG-001`), which also breaks
numeric ordering on the board.

## Permissions
None.

## Related APIs
`POST /api/snakeGame/addScore` (FEAT-007) submits the final score.

## Related Database Tables
`scores` — `score`, `highestScore`, `latestScore` (FEAT-008).

## Related UI
`GameHeader` (live score, `+1` combo badge, speed meter, session-best crown), `GameOver` stats.

## Existing Tests
| Test | What it proves | Status |
| --- | --- | --- |
| TC-038 | one point per apple, body growth | PASS |
| TC-039 | precise 95 → 94 → 93 … 55 ms ramp | PASS |
| TC-020 | stored best score only grows | PASS |
| TC-057 | a weaker later run keeps the best score | PASS |

## Missing Tests
- Visual check that the speed meter's five bars reflect the ramp (`TC-208`, manual).

## Known Issues
- The speed formula exists twice (`useSnakeGame.ts` for the interval,
  `GameHeader.tsx` for the meter). They currently agree; nothing enforces that
  agreement. `UNKNOWN / REQUIRES VALIDATION` if a future change touches one side only.

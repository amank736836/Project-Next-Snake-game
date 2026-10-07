# FEAT-001 — Game engine: board, movement, portal walls, food

**Features:** `FEAT-001`
**Primary code:** `src/components/game/hooks/useSnakeGame.ts`, `src/components/game/utils.ts`, `src/components/game/SnakeBoard/SnakeBoard.tsx`

## Purpose
Turn player input into a deterministic snake simulation: a 20×20 board, a snake
that advances on a fixed interval, portal walls instead of lethal edges, and apples
that grow the snake when eaten.

## User
Any player who starts a run (see FEAT-005 for identity, FEAT-004 for input).

## Entry Point
`SnakeGame.tsx` renders `<SnakeBoard>` while `gameState === "playing"`; the
simulation itself starts in `useSnakeGame.startGame()`.

## Dependencies
- `GRID_SIZE`, `INITIAL_SNAKE_BODY`, `generateFood`, `getSnakePartRotation` (`utils.ts`)
- `setInterval` loop recreated whenever the score changes (see FEAT-002)
- `directionRef` (mutable ref; input never re-renders)

## Inputs
| Input | Source | Notes |
| --- | --- | --- |
| Direction | keyboard/D-pad/joystick via `handleDirection` | validated: no reversals |
| Current snake state | React state | `setSnake` functional updates |
| Apple position | `foodRef` | regenerated when eaten |
| Tick | `setInterval(moveSnake, speed)` | `speed = max(95 − score, 55)` |

## Outputs
- New snake array each tick (`[head, ...body]`, tail popped unless growing)
- Apple position updates
- Terminal transition to `gameOver` on self-collision (scheduled on a 0 ms timeout)

## Business Rules
- `BR-009` — the only death is self-collision; edges are portals.
- `BR-010` — a snake shorter than four segments cannot die.
- `BR-001`-adjacent rule: apples never spawn on the body (`REQ-004`).

## Expected Behavior
1. A new run starts with `[[5, 5]]` heading right (`TC-032`).
2. Each step moves the head one cell in `directionRef.current`; the body follows (`TC-033`).
3. `x` and `y` wrap at 0 and 19 (`TC-034`).
4. Entering a cell occupied by the body ends the run (`TC-040`).
5. Stepping onto the apple grows the snake by one segment and re-rolls the apple
   on a free cell (`TC-038`, `TC-003`).

## Error Handling
- Collision → `handleGameOver()` on a 0 ms timeout (avoids a state update during render).
- Food generation has **no** termination guard for a full board (`BUG-006`): the
  recursion would exhaust the stack. Unreachable in normal play, but it is a real
  edge case and is recorded in `TC-010`.

## Permissions
None. Any visitor can play; no account, no server round-trip during a run.

## Related APIs
None — the engine is entirely client-side. It only triggers `addScore` when a run ends (FEAT-007).

## Related Database Tables
None.

## Related UI
`SnakeBoard` (grid, snake parts, apple, bite FX), `GameHeader` (score/speed), `Controls`.

## Existing Tests
| Test | What it proves | Status |
| --- | --- | --- |
| TC-001 | 20×20 board, initial body `[[5,5]]` | PASS |
| TC-002, TC-003 | apples always inside the board and never on the body | PASS |
| TC-033 | one cell per interval; body follows | PASS |
| TC-034 | wrap-around on both axes | PASS |
| TC-038 | eating grows and scores | PASS |
| TC-048 | sub-4-segment snake cannot die | PASS |
| TC-040 | self-collision ends the run | PASS |
| TC-010 | full-board recursion overflow | KNOWN ISSUE (BUG-006) |

## Missing Tests
- Long-run survival / spiral play in a real browser (manual `TC-210`).
- Visual verification that the rendered snake matches the model for every
  direction class (component markup is checked in TC-055b, not the CSS cascade).

## Known Issues
- **BUG-006** `generateFood` recurses without a bound when the board is full.
- Board rendering uses `snake.findIndex` per cell (400 checks per frame); fine at
  this size, but it is the first thing to optimise if the grid grows (`UNKNOWN /
  REQUIRES VALIDATION` beyond 20×20).

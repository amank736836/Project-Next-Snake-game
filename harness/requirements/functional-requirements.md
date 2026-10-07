# Functional Requirements

Source of truth: the implementation files named in each row. Status is from
`RUN-2026-001` (see [`../TESTING_STATUS.md`](../TESTING_STATUS.md)).

| ID | Requirement | Implementation | Status | Test cases |
| --- | --- | --- | --- | --- |
| REQ-001 | The board is a 20×20 grid and a new run starts with a single-segment snake at cell (5,5) heading right | `utils.ts`, `useSnakeGame.ts` | ✅ VERIFIED | TC-001, TC-032 |
| REQ-002 | The snake advances one cell per step, and the body follows the head | `useSnakeGame.ts` | ✅ VERIFIED | TC-033 |
| REQ-003 | Leaving the board wraps to the opposite edge (portal walls, no wall death) | `useSnakeGame.ts` | ✅ VERIFIED | TC-034 |
| REQ-004 | An apple always spawns on a free cell inside the board | `utils.ts → generateFood` | ✅ VERIFIED | TC-002, TC-003, TC-032 |
| REQ-005 | Eating an apple adds exactly one point and one body segment, then respawns the apple | `useSnakeGame.ts` | ✅ VERIFIED | TC-038 |
| REQ-006 | Step time starts at 95 ms, decreases by 1 ms per point and never goes below 55 ms | `useSnakeGame.ts`, `GameHeader.tsx` | ✅ VERIFIED | TC-039 |
| REQ-007 | The run ends when the snake's head enters its own body | `useSnakeGame.ts` | ✅ VERIFIED | TC-040 |
| REQ-008 | A snake shorter than four segments cannot die (the minimum scoring run is 3 points) | `useSnakeGame.ts` | ✅ VERIFIED | TC-048 |
| REQ-009 | Input is accepted from arrow keys, WASD, space, the on-screen D-pad and the joystick | `useSnakeGame.ts → KEY_ALIASES`, `Controls.tsx` | ✅ VERIFIED (keyboard) / 🔒 NOT_EXECUTED (touch joystick drag) | TC-035, TC-055b, TC-210 |
| REQ-010 | A reversal into the snake's own neck is ignored; perpendicular turns are accepted | `useSnakeGame.ts → handleDirection` | ✅ VERIFIED | TC-035 |
| REQ-011 | Keystrokes are ignored while a text input has focus | `useSnakeGame.ts → handleDirection` | ✅ VERIFIED | TC-036 |
| REQ-012 | A run cannot start without a non-blank display name; the hub shows an inline alert | `MissionHub.tsx`, `useSnakeGame.ts → startGame` | ✅ VERIFIED | TC-031, TC-050 |
| REQ-013 | The name field accepts only `[a-zA-Z0-9 ]` and at most 20 characters | `MissionHub.tsx` input filter | ✅ VERIFIED (component contract); server side ❌ VIOLATED (BUG-003) | TC-049, TC-069 |
| REQ-014 | An arrow key on the hub starts the run for a named player | `useSnakeGame.ts → handleDirection` | ✅ VERIFIED | TC-037 |
| REQ-015 | Pausing stores the mission in the browser and the hub offers to resume it | `useSnakeGame.ts → handlePause/handleResume`, `MissionHub.tsx` | ✅ VERIFIED | TC-041, TC-045, TC-050 |
| REQ-016 | Resuming restores snake, score, direction, food and player name, and consumes the save | `useSnakeGame.ts → handleResume` | ✅ VERIFIED | TC-041 |
| REQ-017 | The stored mission is obfuscated — neither JSON nor the player name is readable in storage | `utils.ts → obfuscate` | ✅ VERIFIED | TC-005, TC-041 |
| REQ-018 | Game over shows a dialog with score, session best, snake length and a new-record state | `GameOver.tsx` | ✅ VERIFIED | TC-054, TC-055 |
| REQ-019 | The completed score is submitted to the API exactly once per run | `useSnakeGame.ts → handleGameOver` | ✅ VERIFIED | TC-040 |
| REQ-020 | The session best is persisted across reloads and shown in the header | `useSnakeGame.ts`, `GameHeader.tsx`, `localStorage:nagini_best` | ✅ VERIFIED | TC-040, TC-044, TC-055b |
| REQ-021 | Theme choice is applied to `<html data-theme>` before paint and persisted | `layout.tsx`, `ThemeToggle.tsx`, `useSnakeGame.ts` | ✅ VERIFIED | TC-043, TC-091 |
| REQ-022 | The hall of fame lists the top players (5 per page) and the 5 most recent hunts | `Leaderboard.tsx`, API routes | ✅ VERIFIED | TC-051, TC-070, TC-071, TC-080 |
| REQ-023 | Leaderboard ordering is by best score descending; recent hunts by latest update | API routes, `memoryScores.ts` | ✅ VERIFIED | TC-072, TC-082 |
| REQ-024 | Entries with a score of 0 or less never appear on a leaderboard | API routes, `memoryScores.ts` | ✅ VERIFIED | TC-016, TC-074, TC-083 |
| REQ-025 | Pagination exposes total/page/limit/totalPages and disables buttons at the bounds | `highestScore/route.ts`, `Leaderboard.tsx` | ✅ VERIFIED | TC-051, TC-070, TC-075, TC-077 |
| REQ-026 | Submitting a known name updates that player's row instead of adding a new one | `addScore/route.ts`, `memoryScores.ts` | ✅ VERIFIED | TC-057, TC-058, TC-073 |
| REQ-027 | The row keeps the best score, records the latest score and counts visits | same as REQ-026 | ✅ VERIFIED | TC-057, TC-020 |
| REQ-028 | A display name containing a blocked word is replaced with `Anonymous` | `foulWords.ts`, `addScore/route.ts` | ⚠️ PARTIAL (false positives: BUG-002; merging: BUG-004) | TC-060, TC-060b, TC-060c, TC-060d |
| REQ-029 | Empty, malformed or wrongly typed submissions are rejected with HTTP 400 | `addScore/route.ts` | ⚠️ PARTIAL (a missing/non-numeric score is accepted — BUG-001) | TC-061…TC-068 |
| REQ-030 | Unknown routes and dotfiles are not served | Next.js routing | ✅ VERIFIED | TC-088 |
| REQ-031 | When no database is configured the app runs on an in-memory demo board and marks it in the UI | `db.ts`, `memoryScores.ts`, `Leaderboard.tsx` | ✅ VERIFIED | TC-059, TC-051 |
| REQ-032 | Production without a database starts with an empty board (no demo seed) | `memoryScores.ts` | ✅ VERIFIED | TC-025 |
| REQ-033 | A failing scores API degrades to empty boards instead of breaking the page | `useSnakeGame.ts → fetchScores` | ✅ VERIFIED | TC-047, TC-132 |
| REQ-034 | The page shell is server-rendered with title, description, icon and a pre-hydration loader | `layout.tsx`, `SnakeGame.tsx`, `SnakeLoader.tsx` | ✅ VERIFIED | TC-090, TC-092 |
| REQ-061 | Each API endpoint accepts only its documented HTTP method; other methods are rejected with 405 | Next.js route handlers | ✅ VERIFIED | TC-084, TC-086 |
| REQ-062 | OPTIONS on the write endpoint advertises the allowed methods and grants no cross-origin access | Next.js route handlers | ✅ VERIFIED | TC-085, TC-113 |

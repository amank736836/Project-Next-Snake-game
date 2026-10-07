# FEAT-005 — Mission hub and player identity

**Features:** `FEAT-005`
**Primary code:** `src/components/game/MissionHub/MissionHub.tsx`, `useSnakeGame.ts` (`playerName`, `alert`)

## Purpose
The landing screen: brand identity, name capture, control-scheme choice, the current
leader, and the buttons that start or resume a mission.

## User
Every visitor, on first load and after every run.

## Entry Point
`SnakeGame.tsx` renders `<MissionHub>` while `gameState !== "playing"` and
`menuView === "main"`.

## Dependencies
- Name state in `useSnakeGame` (`playerName`, `setPlayerName`, `alert`, `inputRef`)
- `leader` (top score) for the "rules the hall" ticker
- Motion helpers (`useTypewriter`, `useRipples`, `usePointerTrack`) — FEAT-010

## Inputs
| Input | Validation | Effect |
| --- | --- | --- |
| Name text | `replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 20)` | updates `playerName` |
| START MISSION | non-blank `playerName` | starts a run; otherwise shows the alert and shakes the panel |
| RESUME MISSION | only when a save exists | restores the paused run |
| BUTTONS / JOYSTICK | — | switches the control scheme |
| Enter in the field | non-blank name | starts the run |
| VIEW HALL OF FAME (mobile) | — | opens the leaderboard view |

## Outputs
- `playerName`, `controlType`, `alert`
- `onStart()` / `onResume()` / `onViewLeaderboard()` callbacks
- Typewriter tagline, brand mark, leader ticker, feature chips

## Business Rules
- A run cannot start without a name (`REQ-012`); the alert is `role="alert"`.
- The UI constrains names to 20 characters of `[a-zA-Z0-9 ]` — the API does not
  (`BUG-003`).
- The identity used for leaderboard matching is this name, case-insensitively
  trimmed for highlighting only (`Leaderboard` normalises with `trim().toLowerCase()`).

## Expected Behavior
1. The hub renders the brand, the name field, START MISSION, the control selector
   and the leader ticker (`TC-049`).
2. With a blank name, START raises the alert and does not start (`TC-031`, `TC-050`).
3. With a valid name, START (or Enter, or an arrow key) begins the run (`TC-032`, `TC-037`).
4. RESUME MISSION appears only when a save exists and restores it (`TC-041`, `TC-050`).
5. The selected control scheme is reflected with `aria-pressed` (`TC-049`, `TC-050`).

## Error Handling
- Blank submissions shake the panel and set `alert`; the alert clears on the next
  successful start.
- Non-alphanumeric characters are silently stripped rather than rejected — a
  usability decision worth noting (no error text is shown for stripped input).

## Permissions
None.

## Related APIs
Indirectly: the leader ticker uses the data fetched by `fetchScores` (FEAT-006).
The name itself is never persisted server-side except inside score rows.

## Related Database Tables
`scores.name` (the de-facto identity key, FEAT-008).

## Related UI
`SnakeMark` brand animation, floating-label input, ripple buttons, key hints, feature chips.

## Existing Tests
| Test | What it proves | Status |
| --- | --- | --- |
| TC-031 | blank name blocks the start | PASS |
| TC-032 | valid name starts with a reset board | PASS |
| TC-037 | arrow key starts the run | PASS |
| TC-049, TC-050 | rendered hub contract (labels, alert, resume, selector) | PASS |

## Missing Tests
- 20-character boundary and character stripping through the real input element
  (`TC-209`, manual — the filter is a DOM event handler, not covered by markup tests).
- Visual feedback for the shake animation and the typewriter tagline (`TC-206`).

## Known Issues
- **BUG-003** the 20-character / character-set rule is only enforced in the browser;
  the API accepts arbitrary names, which then appear on the board.
- Players are identified only by name: two people typing `Tester` share one row
  (accepted trade-off, documented in `business-rules.md` → BR-006).

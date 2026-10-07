# FEAT-009 — Browser persistence: save slot, personal best, theme

**Features:** `FEAT-009`
**Primary code:** `src/components/game/hooks/useSnakeGame.ts`, `src/app/layout.tsx`, `src/components/game/ThemeToggle/ThemeToggle.tsx`, `src/components/game/utils.ts` (obfuscation)

## Purpose
Let a player close the tab and come back: a paused run can be resumed, the personal
best survives reloads, and the chosen theme is applied before the first paint.

## User
Returning players on the same browser/device.

## Entry Point
`localStorage` keys written by the hook and the root layout's pre-paint script.

## Dependencies
| Key | Written by | Read by | Format |
| --- | --- | --- | --- |
| `snake_mission_save` | `handlePause` | `handleResume`, mount effect (existence check) | XOR-by-index + `btoa` of the mission JSON |
| `nagini_best` | `handleGameOver` | mount effect | decimal string |
| `theme` | `toggleTheme` / bootstrap script | bootstrap script, mount effect | `"dark"` \| `"light"` |

## Inputs
- Pause action, game over, theme toggle
- Existing values on mount (also from a previous version of the app)

## Outputs
- Restored `snake`, `score`, `direction`, `food`, `playerName` on resume
- Restored `sessionBest` shown in the header
- `data-theme` attribute on `<html>` before hydration (no flash)

## Business Rules
- `BR-011` — only client-side state lives here; completed scores always go to the API.
- The save slot is obfuscated, not encrypted: it must not be readable JSON and must
  not leak the player name in clear text (`REQ-017`).

## Expected Behavior
1. Pausing writes a save that contains neither plain JSON nor the player name (`TC-041`).
2. Resuming restores the run exactly and deletes the save (`TC-041`).
3. A corrupt save never breaks the running game (`TC-042`).
4. A stored best score is restored on mount (`TC-044`).
5. An existing save makes the hub offer RESUME MISSION (`TC-045`).
6. The theme is applied pre-paint and toggling persists it (`TC-043`, `TC-091`).

## Error Handling
- All `localStorage` access is wrapped in `try/catch`: a browser with storage
  disabled still gets a playable game (only persistence is lost).
- `deobfuscate` returns `null` for unreadable data instead of throwing (`TC-006`, `TC-007`).
- **Gap:** an unreadable save is left in place, so RESUME MISSION keeps appearing
  with no effect (**BUG-011**).
- **Gap:** `obfuscate` uses `btoa`, which throws for characters above U+00FF
  (**BUG-007**). The UI filter prevents such names, so it only matters if data
  arrives from elsewhere.

## Permissions
Storage is same-origin browser storage — no permission prompts, no cookies, no
server-side session.

## Related APIs
None (a resume is a purely local operation).

## Related Database Tables
None.

## Related UI
The RESUME MISSION button on the hub, the session-best crown in the game header, the
theme toggle's knob/label state.

## Existing Tests
| Test | What it proves | Status |
| --- | --- | --- |
| TC-005 | obfuscated output hides the name and is valid base64 | PASS |
| TC-006, TC-007 | corrupt/truncated saves return `null` | PASS |
| TC-011 | non-Latin1 names throw in obfuscation | KNOWN ISSUE (BUG-007) |
| TC-041 | pause → save → resume round-trip, name not in clear text | PASS |
| TC-042, TC-042b | corrupt save handling and the stuck resume button | PASS / KNOWN ISSUE (BUG-011) |
| TC-043 | theme persistence | PASS |
| TC-044, TC-045 | best score and save detection on mount | PASS |
| TC-091 | pre-paint theme bootstrap is present in the served HTML | PASS |

## Missing Tests
- Storage-unavailable behaviour (private mode with storage blocked) — `NOT_EXECUTED`.
- Migration of a save written by an older build — `NOT_EXECUTED`.

## Known Issues
- **BUG-007** obfuscation throws on names outside Latin-1.
- **BUG-011** an unreadable save leaves the resume button permanently active.

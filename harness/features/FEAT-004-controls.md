# FEAT-004 — Keyboard and on-screen controls

**Features:** `FEAT-004`
**Primary code:** `src/components/game/Controls/Controls.tsx`, `useSnakeGame.ts` (`KEY_ALIASES`, `handleDirection`, joystick handlers)

## Purpose
Let every device steer the snake: arrow keys, WASD, space, an on-screen D-pad, or a
draggable virtual joystick — with a control-scheme switch on the hub.

## User
Desktop players (keyboard/D-pad) and mobile players (D-pad or joystick).

## Entry Point
- `window.addEventListener("keydown", handler)` inside `useSnakeGame`
- `<Controls type="buttons|joystick" layout="side-left|side-right|portrait">` rendered three times by `SnakeGame`

## Dependencies
- `KEY_ALIASES` map (`w/a/s/d`, `W/A/S/D`, arrows, space → arrow names)
- `document.activeElement` guard so typing in the name field never steers
- `touchstart/touchmove/touchend` + mouse-drag handlers for the joystick

## Inputs
| Input | Values | Effect |
| --- | --- | --- |
| Arrow keys, WASD, space | direction names | update `directionRef` (reversal ignored; also starts a run from the hub) |
| D-pad buttons | `ArrowUp/Down/Left/Right` | same as keys |
| Joystick drag | touch or mouse vector | maps dominant axis to a direction beyond a 20 px threshold |
| Control scheme buttons | `buttons` \| `joystick` | swaps the rendered control surface |

## Outputs
- `directionRef.current` (never triggers a re-render)
- Visual feedback: lit D-pad keys, joystick LEDs, drift of the thumbstick, key hints
- A run starts when an arrow key is pressed on the hub with a name set

## Business Rules
- `BR-009` — a reversal is ignored; perpendicular turns always register.
- Input while a text input has focus is discarded (`REQ-011`).

## Expected Behavior
1. All four arrows plus WASD/space map onto the four directions (`TC-035`).
2. A reverse input leaves the direction unchanged (`TC-035`).
3. With the name input focused, no key changes the direction (`TC-036`).
4. Pressing an arrow on the hub with a name set starts the run and applies the
   direction in the same event (`TC-037`).
5. The rendered control surface exposes accessible names for all four buttons
   (`TC-055b`).

## Error Handling
- Joystick math is defensive: missing refs or zero-size rects return early.
- Touch events without a `touches[0]` entry are guarded by the same early return
  (`UNKNOWN / REQUIRES VALIDATION` for multi-touch edge cases).

## Permissions
None.

## Related APIs
None.

## Related Database Tables
None.

## Related UI
`Controls` (d-pad, side columns, portrait pad, joystick), `MissionHub` control-scheme selector and keyboard hints.

## Existing Tests
| Test | What proves | Status |
| --- | --- | --- |
| TC-035 | arrow + WASD mapping, reversal protection | PASS |
| TC-036 | typing in an input never steers | PASS |
| TC-037 | arrow key starts the run from the hub | PASS |
| TC-055b | d-pad buttons have accessible names | PASS |

## Missing Tests
- Real touch drag on the joystick (thresholds, thumbstick clamp) — `TC-211`, manual.
- Keyboard hints LED animation and space-bar alias in a browser — `TC-212`, manual.
- Gamepad API support — not implemented (out of scope; `UNKNOWN / REQUIRES VALIDATION`).

## Known Issues
None open. Note that the on-screen D-pad is intentionally hidden behind a
`portrait-only` class on wide screens, while the side columns take over (`FEAT-011`).

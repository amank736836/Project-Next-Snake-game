# UI Scenarios

Interface behaviour: markup contract, states, accessibility and responsive
behaviour. Markup is automated (server rendering); anything that needs layout,
paint or a real event stream is documented as a manual case.

| ID | Scenario | Test cases | Status |
| --- | --- | --- | --- |
| SCN-097 | The mission hub renders brand, name field, start flow, control selector and leader ticker | TC-049 | PASS |
| SCN-098 | The hub reacts to a missing name with an announced alert and the resume button appears only when a save exists | TC-050 | PASS |
| SCN-099 | Leaderboard rows show ranks, the `you` tag, proportional bars and a demo chip, with boundary buttons disabled | TC-051 | PASS |
| SCN-100 | Leaderboard shows skeletons while loading and an explanatory empty state when there is nothing | TC-052, TC-053 | PASS |
| SCN-101 | The game-over dialog is an accessible modal with the run summary and three actions | TC-054 | PASS |
| SCN-102 | A record run switches copy to "Legendary run" and renders the celebration layer | TC-055 | PASS |
| SCN-103 | Board, D-pad and header expose accessible names and live state | TC-055b | PASS |
| SCN-104 | The served page contains title, description, application name, theme bootstrap and loader placeholder | TC-090, TC-091, TC-092 | PASS |
| SCN-105 | Responsive behaviour across phone, tablet, desktop and landscape orientations | TC-200…TC-205 | NOT_EXECUTED (manual) |
| SCN-106 | Motion respects `prefers-reduced-motion` and the canvas pauses on hidden tabs | TC-206, TC-207 | NOT_EXECUTED (manual) |
| SCN-107 | Keyboard-only playthrough with visible focus and working Enter/Esc shortcuts in the dialog | TC-215, TC-216 | NOT_EXECUTED (manual) |
| SCN-108 | Hydration produces no console errors and the pre-hydration loader is replaced by the hub | TC-210, TC-218 | NOT_EXECUTED (manual) |

## Automated markup coverage in detail

| Component | Verified | Not verified |
| --- | --- | --- |
| MissionHub | title `aria-label`, floating label, START/RESUME presence, alert role, selector state | focus rings, shake animation, typewriter timing |
| Leaderboard | tabs + `aria-selected`, ranks, `you` tag, demo chip, pagination disabled states, empty + skeleton states | bar widths, reveal animation, row hover sweep |
| GameOver | `role="dialog"`, `aria-modal`, `aria-labelledby`, stat labels, action labels, record variant | confetti animation, backdrop blur, keyboard focus trap |
| SnakeBoard | `role="img"` with length/heading label, 400 cells | snake head rotation, tongue, bite burst visuals |
| Controls | four D-pad accessible names, portrait variant | joystick drag physics, LED feedback, thumbstick clamp |
| GameHeader | player name, pause button, session-best badge | speed meter bar lighting, container-query label hiding |

## Manual case index

All manual cases live in [`../test-cases/manual/browser-and-visual.md`](../test-cases/manual/browser-and-visual.md)
(`TC-200`…`TC-219`). They are marked `NOT_EXECUTED` with the reason "no browser
binary available in this environment" and are the natural first job for a
browser-capable agent or tester.

# FEAT-011 — Responsive layout and container queries

**Features:** `FEAT-011`
**Primary code:** `src/app/globals.css` (layout sections at lines ~294–500 and the
landscape block at ~874), `src/app/page.module.css`, per-component CSS modules

## Purpose
Keep the game playable and readable from a 360 px phone in landscape up to a wide
desktop, without horizontal overflow and with controls reachable by thumb.

## User
Mobile players (portrait D-pad/joystick), tablet players (single column), desktop
players (three columns with side controls).

## Entry Point
Media queries and container queries in the stylesheets; the layout classes
(`desktop-only`, `mobile-only`, `portrait-only`, `side-controls`) emitted by `SnakeGame.tsx`.

## Dependencies
- Viewport units and CSS custom properties (`--board-size: clamp(280px, 76vmin, 620px)`)
- Container queries: `leaderboard` (board), `card` (score card), `inline-size` (game header)
- Breakpoints: 640 px (phone), 1024/1025 px (desktop), landscape when height ≤ 500 px

## Inputs
| Input | Effect |
| --- | --- |
| Viewport width/height/orientation | grid vs single column, side vs portrait controls, board size |
| Component container width | tabs vs side-by-side boards, row layout inside cards, hidden header labels |

## Outputs
- 3-column hub layout ≥ 1024 px with both boards and the hub in the middle column
- Tabbed single-column leaderboard below 1024 px
- Side control columns (d-pad halves or joysticks) ≥ 1025 px or landscape ≥ 760×400
- Portrait D-pad/joystick below the board on phones

## Business Rules
- Controls must always be reachable; the board must never overflow horizontally.
- Information must not disappear: `mobile-only`/`desktop-only` classes only move
  features between layouts, never remove them (the tabbed view exposes both boards).

## Expected Behavior
1. ≥ 1024 px: boards — hub — boards, each track ≥ 240 px, max width 1400 px.
2. < 1024 px: one column; the leaderboard becomes tabbed with an inline back button.
3. Landscape with height ≤ 500 px: the board and thumb pad sit side by side so the
   page does not scroll.
4. The game header hides the session-best badge / pause label before the player name
   can collide with the score (container query).

## Error Handling
Not applicable (CSS only). The layout degrades to the mobile column if a container
query is unsupported.

## Permissions
None.

## Related APIs
None.

## Related Database Tables
None.

## Related UI
`SnakeGame` layout wrappers, `Leaderboard` (tabs + shared back button),
`Controls` (side/portrait variants), `GameHeader`.

## Existing Tests
| Test | What it proves | Status |
| --- | --- | --- |
| TC-093 | the shell is delivered and cached (layout container host) | PASS |
| TC-055b | the portrait control surface is rendered with accessible names | PASS |

Breakpoint behaviour itself is **not** automated here: jsdom does not implement
layout, and no browser binary is available in this environment.

## Missing Tests
Manual cases (documented, `NOT_EXECUTED`):

- `TC-200` 360 × 640 phone portrait — hub, board and D-pad fit without scrolling.
- `TC-201` 640 px tablet — single column with both boards visible.
- `TC-202` 1024 px desktop — three columns, no horizontal scrollbar.
- `TC-203` 1440 px desktop — max width respected, boards not crushed.
- `TC-204` landscape 740 × 360 — board and thumb pad side by side.
- `TC-205` zoom to 200 % — content remains usable (WCAG 1.4.10).

## Known Issues
None open. Note that the layout is CSS-only, so it is the area most likely to drift
without visual regression testing (no such tooling is available here).

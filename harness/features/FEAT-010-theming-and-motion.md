# FEAT-010 — Theming and the motion system

**Features:** `FEAT-010`
**Primary code:** `src/app/globals.css`, `src/app/layout.tsx`, `src/components/game/ThemeToggle/ThemeToggle.tsx`, `src/components/game/hooks/useUiMotion.ts`, `AmbientBackground.tsx`, `SnakeLoader.tsx`, `ui/SnakeMark.tsx`, `ui/Ripple.tsx`

## Purpose
Give the game its identity: a neon dark/light theme switch, an ambient animated
background, count-up numbers, reveal animations and micro-interactions — all of
which must stand down for users who ask for reduced motion.

## User
All players; motion is decorative, never required to play.

## Entry Point
- Theme toggle button in the top-right corner of the app shell (rendered by `SnakeGame`).
- Ambient canvas rendered by `page.tsx` behind everything.
- Motion helpers consumed by every component that animates values.

## Dependencies
| Concern | Implementation |
| --- | --- |
| Design tokens | CSS custom properties per theme (`globals.css`, `:root` / `[data-theme="dark"]`) |
| Theme switch | `ThemeToggle` (wave ripple) + `data-theme` attribute + `localStorage.theme` |
| FOUC prevention | Inline bootstrap script in `layout.tsx` (`<head>`) |
| Ambient scene | `AmbientBackground` canvas (DPR ≤ 2, particle density by viewport, pauses when hidden) |
| Micro-interactions | `useRipples`, `useCountUp`, `useInView`, `usePointerTrack`, `useTypewriter` |
| Reduced motion | `useReducedMotion` (external store) + CSS `@media (prefers-reduced-motion: reduce)` |

## Inputs
| Input | Source |
| --- | --- |
| Theme preference | user click, `localStorage.theme`, system default (dark) |
| Pointer position | global `pointermove` for the brand-mark pupils and panel tilt |
| Visibility state | `document.visibilitychange` for the canvas loop |
| Media queries | `prefers-reduced-motion`, `prefers-color-scheme`, hover capability |

## Outputs
- `data-theme` on `<html>`, theme tokens applied to every panel
- Animated canvas, blobs, ripples, count-ups, loader, skeletons
- `aria-checked`/`aria-label` state on the toggle (`role="switch"`)

## Business Rules
- Motion is always optional: disabling it must not remove information
  (count-ups settle instantly, particles stop, transitions collapse).
- Theme choice is sticky per browser (`BR-011`).

## Expected Behavior
1. The served HTML contains `data-theme="dark"` and the bootstrap script that reads
   the stored preference before hydration (`TC-091`).
2. Toggling flips the attribute, the toggle label and `localStorage.theme` (`TC-043`).
3. Count-ups animate from 0 for score reveals and settle at the true value (`TC-051`, TC-055`).
4. The pre-hydration loader is announced with `role="status"` (`TC-092`).
5. With `prefers-reduced-motion: reduce`, the canvas is not started, count-ups jump
   to the final value and CSS transitions are disabled (`TC-206`, manual).

## Error Handling
- Canvas work is skipped when the 2D context or reduced-motion media query blocks it.
- `requestAnimationFrame` callbacks are cancelled on unmount (RAII style cleanups in
  every hook).
- `localStorage` failures fall back to the in-memory theme value.

## Permissions
None.

## Related APIs
None.

## Related Database Tables
None.

## Related UI
`ThemeToggle`, `AmbientBackground`, `SnakeLoader`, `SnakeMark`, `Ripple`, and every
component that renders a count-up (leaderboard values, game-over stats, header score).

## Existing Tests
| Test | What it proves | Status |
| --- | --- | --- |
| TC-043 | theme toggle updates the DOM and storage | PASS |
| TC-091 | pre-paint theme bootstrap exists in the served HTML | PASS |
| TC-092, TC-093 | loader placeholder and cached shell delivery | PASS |
| TC-051, TC-055 | count-up components render without a DOM | PASS |

## Missing Tests
All motion behaviour is DOM/canvas-bound and needs a real browser:

- `TC-206` reduced-motion compliance across every animation.
- `TC-207` canvas pause when the tab is hidden, DPR/density adaptation.
- `TC-208` theme wave + count-up visual verification.
All are documented and marked `NOT_EXECUTED`.

## Known Issues
None open. Performance risk: the canvas is redrawn on every frame while visible —
acceptable at the measured sizes, but `UNKNOWN / REQUIRES VALIDATION` on low-end
devices (no CPU profiling data was collected).

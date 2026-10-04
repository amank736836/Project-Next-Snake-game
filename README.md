# 🐍 Nagini — Snake Game

A neon-arcade take on the classic snake game, built with **Next.js 16 (App Router) + React 19**,
with a Harry Potter flavoured theme, a persistent hall of fame, and a motion-first interface.

Live flows: **Mission Hub → Game → Game Over → Hall of Fame**, all animated.

---

## 🎮 Gameplay

| | |
|---|---|
| **Grid** | 20 × 20 |
| **Walls** | Portal — leaving one side wraps you to the other |
| **Speed** | Ramps up from 95 ms → 55 ms per step as you eat |
| **Controls** | Arrow keys, **WASD**, on-screen D-pad, or draggable joystick |
| **Pause / Resume** | Pause stores the run (obfuscated) in `localStorage` so you can resume later |
| **Leaderboard** | Top scores + most recent hunts, paginated, with your own row highlighted |

## ✨ UI & animation highlights

The UI layer was rebuilt around a motion system inspired by the
[31 cool website animation examples](https://www.svgator.com/blog/website-animation-examples-and-effects/):

| Technique | Where it lives |
|---|---|
| **Ambient background motion** (#6 / #20) | `AmbientBackground` — drifting morphing gradient blobs, parallax dot grid and a canvas particle field that parts around your cursor |
| **Animated gradients** (#18) | Conic gradient rims on the hero panel, board frame and brand ring |
| **Expressive typography** (#4) | Per-letter staggered drop-in + hover lift on the “Nagini” wordmark, glitching “GAME OVER” title, typewriter tagline |
| **Animated logos / self-drawing** (#8 / #10) | `SnakeMark` — coiled snake that draws itself, breathes, flicks its tongue, and whose pupils follow your pointer |
| **Character animation** (#13) | Blinking snake head, direction-aware eyes, food-seeking tongue, mouth-burst on eating, the fallen serpent on game over |
| **Microinteractions** (#12) | Click ripples, 3D press states, sliding selector pills, keyboard-driven key caps and joystick LEDs, count-up score odometers |
| **Glassmorphism + faux 3D** (#14 / #28) | Frosted panels with cursor-tracked sheen and subtle perspective tilt |
| **Hover effects** (#26) | Row sweep highlights, rolling medal shine, button shine sweeps, icon pops |
| **Loading skeleton & loaders** (#24 / #25) | Shimmer skeleton rows while scores load, self-drawing snake pre-loader before hydration |
| **Page transitions** (#22) | Portal-style screen entries, theme-toggle colour wave, animated game-over modal with confetti |
| **Liquid motion** (#17) | Morphing blobs, bite ripple rings, pulsing apple halo |
| **Reduced motion** | Every animation respects `prefers-reduced-motion`; particles pause when the tab is hidden |

Interaction & performance details:

- All game input (keyboard, D-pad, joystick) feeds a single direction ref — no re-render on input.
- The particle canvas is DPR-aware, density-adapts to viewport width, and suspends off-screen.
- Numeric animations run on `requestAnimationFrame` and only update state from animation frames.

## 📐 Responsive behaviour

The layout is driven by *how much room each component actually has*, not just the viewport,
so the same component works as a wide page and as a narrow sidebar.

| Range | Mission hub | Hall of fame | Game screen |
| --- | --- | --- | --- |
| **< 640px** (phones) | Single column, full-width panel | Tabs (Highest / Recent) + inline back button | Portrait D-pad or joystick below the board |
| **640 – 1023px** (tablets) | Single column, wider panel | Both boards side by side, one shared back button | Same as phones |
| **≥ 1024px** (laptops/desktops) | 3-column grid: boards · hub · boards (tracks never below 240px, so a board can't be crushed) | Page view, no tabs | Side control columns; board width yields to them so nothing overflows |
| **Landscape phones** (height ≤ 500px) | — | — | Board and thumb pad sit **side by side** so the page never scrolls |

Implementation notes:

- **Container queries** are used where a component's width differs from the viewport:
  the leaderboard (`container: leaderboard`) switches between tabs and side-by-side boards,
  each score card (`container: card`) restyles its rows when narrow, and the game header
  (`container-type: inline-size`) hides the session-best badge / pause label before the
  player name can collide with the score.
- **Header counters use `margin-block: auto`** for vertical centring — `justify-content: center`
  on an overflowing flex column pushes content above the viewport, where it can't be scrolled to.
- **Control buttons use inline SVG arrows** instead of emoji glyphs (⬆️/➡️), which render
  inconsistently and can disappear entirely depending on the platform's emoji font.
- Panels size via `min-height: min(Xpx, ~56vh)` and the brand mark via a `--mark-size` clamp,
  so the hero row fits short laptop windows instead of spilling.

## 🧱 Tech stack

- **Next.js 16** App Router, Turbopack, React Compiler enabled
- **React 19** with CSS Modules (no UI framework)
- **MongoDB + Mongoose** for scores (optional — see demo mode)
- **Vercel Analytics**
- Fonts bundled locally (`geist` + `@fontsource/outfit`) so builds never depend on Google Fonts

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Environment

Create `.env.local`:

```bash
DATABASE_URL="mongodb+srv://…"
```

**Demo mode:** if `DATABASE_URL` is not set, the API routes fall back to an in-memory
leaderboard seeded with a few legends (non-production only). The UI stays fully functional —
the leaderboard just shows a small `demo` chip. Nothing crashes or errors.

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (React Compiler rules enabled) |

## 🗂 Structure

```
src/
├── app/
│   ├── api/snakeGame/        # addScore · highestScore · latestScore
│   ├── globals.css           # design tokens, ambient scene, shared keyframes
│   ├── layout.tsx            # fonts, metadata, theme bootstrap
│   └── page.tsx              # ambient scene + game
├── components/
│   ├── SnakeGame.tsx         # screen orchestrator (menu / playing / game over)
│   └── game/
│       ├── AmbientBackground/  MissionHub/  Leaderboard/  GameHeader/
│       ├── SnakeBoard/  Controls/  GameOver/  ThemeToggle/
│       ├── SnakeLoader/  ui/ (Ripple, SnakeMark)
│       └── hooks/  (useSnakeGame, useUiMotion)
├── lib/                      # db connection + in-memory score fallback
└── models/Score.ts
```

## ♿ Accessibility

- Real `<button>`/`role="switch"`/`role="dialog"` semantics, focus-visible rings, `aria-live` status.
- Keyboard-only play is fully supported; the game-over dialog responds to `Enter` / `Esc`.
- `prefers-reduced-motion` disables ambient particles, count-ups and transitions.

## 🚢 Deploy

Deploy on Vercel and set `DATABASE_URL` in the project environment variables.

# Architecture — Nagini · Snake Game

> Derived from the source tree, `next.config.ts`, `tsconfig.json` and the built
> route manifest (`npm run build` output, recorded in `test-results/latest/`).

## 1. Shape of the system

```
┌────────────────────────────────────────── Browser (single page) ─────────────────────────────────────────┐
│  /  (pre-rendered shell, hydrated into a client component tree)                                          │
│                                                                                                          │
│   AmbientBackground (canvas: blobs, dot grid, particles)                                                 │
│   SnakeGame ──┬── ThemeToggle                                                                            │
│               ├── menu  ──┬── MissionHub (name, controls, start/resume)                                  │
│               │           └── Leaderboard (highest | recent, paginated)                                  │
│               ├── game  ──┬── Controls (d-pad | joystick; side + portrait layouts)                        │
│               │           ├── GameHeader (name, score, speed meter, pause)                               │
│               │           └── SnakeBoard (20×20 grid, snake, apple, bite FX)                             │
│               └── gameOver ── GameOver (dialog: score, best, length, confetti)                            │
│                                                                                                          │
│   state ── useSnakeGame (game + session)   useUiMotion (ripples, count-up, reduced motion)               │
│   storage ── localStorage: theme · nagini_best · snake_mission_save (XOR+base64)                         │
└───────────────────────────────────────────────┬──────────────────────────────────────────────────────────┘
                                                │ fetch (same origin, JSON)
┌───────────────────────────────────────────────▼──────────────────────────────────────────────────────────┐
│  Next.js Route Handlers (Node runtime, src/app/api/snakeGame/*)                                          │
│    POST /addScore        GET /highestScore        GET /latestScore                                       │
│                                    │                                                                     │
│                            hasDatabase()  ── no ──►  src/lib/memoryScores.ts (process-scoped Map/Array)   │
│                                    │ yes                                                                 │
│                                    ▼                                                                     │
│                            src/lib/db.ts (mongoose.connect cached on globalThis)                         │
│                                    │                                                                     │
│                                    ▼                                                                     │
│                            src/models/Score.ts  →  MongoDB collection "scores"                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Runtime topology

| Aspect | Value | Source |
| --- | --- | --- |
| Rendering | App Router; `/` is fully static (prerendered), APIs are dynamic | build output: `○ /`, `ƒ /api/snakeGame/*` |
| Route handlers | Node.js runtime (Mongoose is not edge-compatible) | `src/lib/db.ts` imports `mongoose` |
| Caching | Page shell cached at the CDN (`s-maxage=31536000`); API responses are not cached | `page-shell.headers.txt` evidence |
| State | All game state is client-side React state; nothing is stored server-side except scores | `useSnakeGame.ts` |
| Concurrency model | Single Node process; in-memory mode is naturally serialised; MongoDB mode does read-then-write | `addScore/route.ts` |
| Connection reuse | One cached Mongoose connection per process (`globalThis.mongoose`) | `src/lib/db.ts` |
| Config | Only `DATABASE_URL` is read from the environment | `src/lib/db.ts` |

## 3. Module map

| Path | Responsibility |
| --- | --- |
| `src/app/layout.tsx` | Fonts, metadata, viewport, pre-paint theme bootstrap script |
| `src/app/page.tsx` | Composes the ambient scene with the game |
| `src/app/globals.css` | Design tokens, layout grids, responsive rules, keyframes, reduced-motion block |
| `src/app/api/snakeGame/addScore/route.ts` | Validation-lite write path + profanity rename + upsert |
| `src/app/api/snakeGame/highestScore/route.ts` | Paginated leaderboard read |
| `src/app/api/snakeGame/latestScore/route.ts` | Recent-hunts read (limit 5) |
| `src/components/SnakeGame.tsx` | Screen orchestrator, wires hook state into components |
| `src/components/game/hooks/useSnakeGame.ts` | **Core domain logic**: movement loop, food, collision, scoring, pause/resume, submissions, leaderboard fetching |
| `src/components/game/hooks/useUiMotion.ts` | Animation helpers that respect `prefers-reduced-motion` |
| `src/components/game/utils.ts` | Grid constants, food generation, save obfuscation, head rotation |
| `src/lib/db.ts` | `hasDatabase()` + cached Mongoose connection |
| `src/lib/memoryScores.ts` | Demo store: seeding, listing, upsert semantics |
| `src/lib/foulWords.ts` | 632-entry blocklist (data, not logic) |
| `src/models/Score.ts` | Mongoose schema/model |

## 4. Data flow

**Write (`addScore`)**
```
GameOver → handleGameOver() → POST /api/snakeGame/addScore {name, score}
      → read req.json()
      → foul-word check on name.toLowerCase()  → rename to "Anonymous" if matched
      → hasDatabase()?
           no  → memoryScores.upsertScore()  → 201 { score, demo: true }
           yes → Score.findOne({name})
                   found  → latestScore = score; visits += 1; highest/score = max(...)
                   absent → new Score({name, score, highestScore, latestScore, visits: 1})
                   save() → 201 { message }
```

**Read (`highestScore`)**
```
Leaderboard mount / page change / after a run
      → GET /api/snakeGame/highestScore?page&limit
      → hasDatabase()?
           no  → memory db: filter score > 0 → sort by best desc → slice(page)
           yes → Score.find({score:{$gt:0}}).sort({highestScore:-1, score:-1}).skip().limit()
      → { scores, pagination:{total,page,limit,totalPages}, demo? }
```

**Client-side merging:** after a run, `updateLocalScores()` also patches the visible
lists optimistically (top-5 window) so the UI updates without a refetch.

## 5. Game loop model

- One `setInterval(moveSnake, Math.max(95 - score, 55))` per playing session; the
  interval is recreated whenever `score` changes, which is how the speed ramp is applied.
- Input never triggers a re-render: keyboard/D-pad/joystick all mutate
  `directionRef.current`; direction changes are validated so that a reversal
  (the only illegal move) is ignored.
- Movement wraps on both axes (portal walls); the only terminal state is the head
  entering its own body, which schedules `handleGameOver` on a 0 ms timeout.
- Food is placed randomly and re-rolled while it collides with the body.

## 6. Persistence layers

| Store | Key / collection | Written by | Lifetime |
| --- | --- | --- | --- |
| `localStorage` | `theme` | ThemeToggle | until cleared |
| `localStorage` | `nagini_best` | `handleGameOver` | until cleared |
| `localStorage` | `snake_mission_save` (obfuscated mission JSON) | `handlePause` | until resume/death |
| Memory | `globalThis.__naginiScores` | demo mode API | process lifetime |
| MongoDB | `scores` | API when `DATABASE_URL` is set | durable |

## 7. Build, run and deploy

| Concern | Value |
| --- | --- |
| Build | `npm run build` → Turbopack, React Compiler on (`next.config.ts`) |
| Serve | `npm start` (`next start`, honours `PORT`) |
| Dev | `npm run dev` (Turbopack dev server) |
| Lint | `npm run lint` (ESLint 9 flat config) — currently clean |
| Tests | `npm test` → `harness/automation/scripts/run-all.sh` (added by this harness) |
| Deploy target | Vercel, with `DATABASE_URL` configured in project settings (`README.md`) |
| CI | none in the repository — `UNKNOWN / REQUIRES VALIDATION` for any pipeline configured outside it |

## 8. Architectural risks worth watching

| Risk | Why it matters | Reference |
| --- | --- | --- |
| No server-side validation of `name`/`score` | The API trusts the client completely; the UI's 20-char/alphanumeric rule is not enforced | BUG-001, BUG-003 |
| `name` is the identity key and has no unique index | A concurrent first write can fork one player into two documents | BUG-018 (TC-135, not executed without MongoDB) |
| Rejected connection promise is cached forever | One transient database outage requires a process restart | BUG-017 |
| Single global interval + refs | Hard to test in a browser-less environment (this harness drives it with jsdom + mocked timers instead) | `automation/ui/game-hook.test.mjs` |
| 632-entry blocklist applied with `String.includes` | Legitimate names containing a blocked substring are anonymised, and all blocked names merge into one record | BUG-002, BUG-004 |

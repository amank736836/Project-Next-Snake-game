# Project Overview — Nagini · Snake Game

> Everything in this document is derived from the repository at commit
> `1849ac4` (branch `arena/ddfa979e-project-next-snake-game`) and from executed
> tests. Anything that could not be established from the code is marked
> `UNKNOWN / REQUIRES VALIDATION`.

## 1. Purpose

A single-page browser game: a neon, Harry-Potter-flavoured take on classic snake.
Players enter a name, play a timed run on a 20×20 portal-walled board, and their
score is written to a shared leaderboard ("hall of fame") that persists in MongoDB
(or, when no database is configured, in a seeded in-memory demo board).

Primary business outcome: an engaging, animated arcade page that retains players
through a persistent leaderboard. There is no monetisation, no user accounts and
no admin surface in the codebase.

## 2. Main users

| User | Description | Evidence |
| --- | --- | --- |
| Player (anonymous) | Types a display name, plays runs, views the hall of fame | `MissionHub.tsx`, `useSnakeGame.ts` |
| Returning player | Same browser, previously paused a run or set a personal best | `localStorage` keys `snake_mission_save`, `nagini_best` |
| Operator / deployer | Sets `DATABASE_URL`, deploys to Vercel, watches analytics | `src/lib/db.ts`, `README.md` deploy section |

There is **no authentication and no authorisation** anywhere in the project
(see `requirements/non-functional-requirements.md` → REQ-023).

## 3. Main workflows

1. **Enter the mission hub** → page loads, leaderboard + recent hunts are fetched
   (`GET /api/snakeGame/highestScore`, `GET /api/snakeGame/latestScore`).
2. **Identify** → player types a display name (client filter: `[a-zA-Z0-9 ]`, max 20
   chars). Empty names are blocked client-side with an inline alert.
3. **Play** → snake moves on an interval, apples give +1 score and +1 segment,
   speed ramps from 95 ms to 55 ms per step. Walls are portals, so the only death
   is self-collision.
4. **Pause / resume** → pausing writes an obfuscated save to `localStorage`
   (`snake_mission_save`); the hub then offers "RESUME MISSION".
5. **Game over** → run summary dialog (score, session best, snake length, record
   celebration); the score is POSTed to `/api/snakeGame/addScore`.
6. **Hall of fame** → highest scores (paginated, 5 per page) and 5 most recent
   hunts, with the current player's row highlighted.

## 4. Technology stack

| Layer | Technology | Evidence |
| --- | --- | --- |
| Framework | Next.js 16.1.6, App Router, Turbopack, React Compiler enabled | `package.json`, `next.config.ts` |
| UI library | React 19.2.3 (client components only for the game) | `package.json`, `src/components` |
| Language | TypeScript 5.9.3, `strict: true`, path alias `@/* → ./src/*` | `tsconfig.json` |
| Styling | CSS Modules + one global stylesheet with design tokens | `src/app/globals.css`, `*.module.css` |
| Data access | Mongoose 9.2.1 → MongoDB | `src/models/Score.ts`, `src/lib/db.ts` |
| Fallback store | Module-scoped in-memory score table | `src/lib/memoryScores.ts` |
| Analytics | `@vercel/analytics` mounted in the root layout | `src/app/layout.tsx` |
| Fonts | `geist` + `@fontsource/outfit` (bundled locally, no Google Fonts at build) | `src/app/layout.tsx`, `package.json` |
| Lint | ESLint 9 flat config with `next/core-web-vitals` + `next/typescript` | `eslint.config.mjs` |
| Tests (added by this harness) | Node 22 built-in test runner, jsdom, repository's own `typescript` | `harness/automation` |

## 5. Frontend

- Entry: `src/app/page.tsx` → `AmbientBackground` (canvas particle scene) + `SnakeGame`.
- `SnakeGame.tsx` is the screen orchestrator: `menu` → `leaderboard` view or `playing`
  → `gameOver` overlay.
- Component inventory: `MissionHub`, `Leaderboard`, `GameHeader`, `SnakeBoard`,
  `Controls` (d-pad + joystick), `GameOver`, `ThemeToggle`, `SnakeLoader`,
  `AmbientBackground`, `ui/Ripple`, `ui/SnakeMark`.
- State lives in two hooks: `useSnakeGame` (all game + session state) and
  `useUiMotion` (ripples, count-ups, in-view, reduced motion, pointer tracking, typewriter).
- All game markup is client-rendered after hydration; the server sends only the
  shell plus a `SnakeLoader` placeholder (verified in TC-092).

## 6. Backend

- Three Next.js Route Handlers, no other server code, no middleware, no cron:
  | Route | Method | Purpose |
  | --- | --- | --- |
  | `/api/snakeGame/addScore` | POST | Create/update a player's score row |
  | `/api/snakeGame/highestScore` | GET | Paginated leaderboard ordered by best score |
  | `/api/snakeGame/latestScore` | GET | Five most recently updated players |
- Both storage modes share one code path: `hasDatabase()` decides between Mongoose
  and `memoryScores`.
- Errors are returned as `400` with the raw exception message (see BUG-014).

## 7. Database

Single collection `scores` (`src/models/Score.ts`):

| Field | Type | Rules |
| --- | --- | --- |
| `name` | String | required; also the de-facto identity key (queried with `findOne({name})`) |
| `score` | Number | required; the best score ever recorded for that player |
| `highestScore` | Number | default 0; used for ordering |
| `latestScore` | Number | default 0; shown in "recent hunts" |
| `visits` | Number | default 0; incremented on every submission |
| `createdAt` / `updatedAt` | Date | `timestamps: true` |
| `_id` | ObjectId | implicit |

No indexes are declared beyond `_id`, and there is no unique constraint on `name`
(see BUG-018 and `test-tools/database/mongodb-local.md`). No migrations/seeds exist
in the repository — `UNKNOWN / REQUIRES VALIDATION` for any production dataset.

## 8. External services

| Service | Use | Required? |
| --- | --- | --- |
| MongoDB (Atlas or self-hosted) | Persistent score storage | Optional — falls back to the in-memory demo board |
| Vercel Analytics | Page-view telemetry | Optional; the `<Analytics />` component no-ops off Vercel |
| Vercel hosting | Documented deployment target | Not required to run locally |

## 9. Authentication / authorisation

None. There are no users, sessions, tokens, cookies or roles. A "player" is
self-declared free text, so any client can read and write any score row
(BUG-016). This is a deliberate scope choice for an arcade page, not a defect —
but it bounds everything security-related in this harness.

## 10. APIs

Contract summary (verified in `test-cases/scores-api/`):

```text
POST /api/snakeGame/addScore        { "name": string, "score": number }
  → 201 { "message": string, "score"?: object, "demo"?: true }
  → 400 { "message": string }       (raw exception text today)

GET  /api/snakeGame/highestScore?page=1&limit=5
  → 200 { "scores": Score[], "pagination": { total, page, limit, totalPages }, "demo"?: true }

GET  /api/snakeGame/latestScore
  → 200 Score[]                      (max 5, score > 0 only)
```

## 11. Important modules and business logic

| Logic | Location | Notes |
| --- | --- | --- |
| Movement, wrap-around, collision, speed ramp, scoring | `src/components/game/hooks/useSnakeGame.ts` | Single `directionRef`, `setInterval` per score |
| Food placement | `src/components/game/utils.ts → generateFood` | Random cell, never on the body; unbounded recursion on a full board (BUG-006) |
| Save obfuscation | `src/components/game/utils.ts → obfuscate/deobfuscate` | XOR by index + `btoa`; not encryption |
| Score merge rules | `src/app/api/snakeGame/addScore/route.ts`, `src/lib/memoryScores.ts` | best score kept, latest recorded, visits counted |
| Profanity handling | `src/lib/foulWords.ts` + route | case-insensitive substring match → name becomes `Anonymous` |
| Storage-mode switch | `src/lib/db.ts → hasDatabase()` | presence of `DATABASE_URL` decides |

## 12. Deployment architecture

- Documented deployment: **Vercel** with `DATABASE_URL` set in project env vars
  (`README.md` → Deploy). The page itself is pre-rendered and served through the
  CDN (`x-nextjs-cache: HIT`, `Cache-Control: s-maxage=31536000`, verified TC-093).
- Local: `npm run dev` (Turbopack dev server) or `npm run build && npm start`
  (`next start`, production mode, `PORT` respected).
- No Dockerfile, no CI workflow, no IaC in the repository.

## 13. Environments

| Environment | How it is produced | Storage behaviour |
| --- | --- | --- |
| Development | `npm run dev` (`NODE_ENV=development`) | In-memory **seeded** with 6 demo players |
| Production build | `npm run build` + `npm start` (`NODE_ENV=production`) | In-memory **empty** without `DATABASE_URL`; MongoDB when set |
| Test | same as production build, ports 3100/3101 | Controlled by the harness scripts |
| Staging | `UNKNOWN / REQUIRES VALIDATION` — no configuration found | — |

## 14. Known dependencies and constraints

- Node.js 22 (project machines) — the harness relies on native TypeScript support
  and `node --test`; Node 20 would need a different runner.
- `mongoose` is the only backend dependency already present; MongoDB is optional
  at runtime, which is why the project works in a browser-only demo mode.
- No test framework, no CI, no `.env` committed (`.gitignore` ignores `.env*`).
- The harness adds exactly one devDependency, `jsdom`, for DOM-based UI tests
  (see `test-tools/README.md` for the justification and alternatives).

# FEAT-006 — Hall of fame: highest scores and recent hunts

**Features:** `FEAT-006`
**Primary code:** `src/components/game/Leaderboard/Leaderboard.tsx`, `src/app/api/snakeGame/highestScore/route.ts`, `src/app/api/snakeGame/latestScore/route.ts`, `useSnakeGame.fetchScores`

## Purpose
Show who is winning and who played last. The board is the product's retention hook:
two ranked lists, pagination for the top scores, a highlight for the current player
and an unmistakable "demo" marker when no database is attached.

## User
Every visitor — desktop users see both lists side by side around the hub; mobile
users switch between them with tabs.

## Entry Point
- Desktop dashboard: two `Leaderboard` instances (`isDashboard`) rendered by `SnakeGame`.
- Mobile: `menuView === "leaderboard"` renders the tabbed view.
- Data: `fetchScores(page)` on mount, on page change and after a run.

## Dependencies
- `GET /api/snakeGame/highestScore?page&limit` → `{ scores, pagination, demo? }`
- `GET /api/snakeGame/latestScore` → `Score[]` (max 5)
- `useCountUp`, `useInView` for animated values and reveal
- `playerName` for the "you" tag

## Inputs
| Input | Source |
| --- | --- |
| `page` | pagination buttons / `handlePageChange` (bounds-checked) |
| `limit` | hard-coded 5 in the client |
| `playerName` | hub (used for highlighting only) |
| list data | API responses; optimistic local patch after a run |

## Outputs
- Ranked rows with rank number, name, proportional bar, count-up value
- `you` tag on the matching row, `demo` chip when the API says `demo: true`
- Skeleton rows while loading, empty states when there is nothing to show
- Pagination indicator `page / totalPages` with disabled boundary buttons

## Business Rules
- `BR-003` — only `score > 0` entries are ranked.
- `BR-004` — highest list sorted by best score descending.
- `BR-005` — recent list is recency-ordered (5 entries).
- `BR-012` — demo mode must be visible to the user.

## Expected Behavior
1. Default request is `page=1&limit=5`; `pagination.total/totalPages` come from the
   API and drive the page buttons (`TC-070`, `TC-071`).
2. Highest list is ordered by best score; a repeat player appears once with their
   best value (`TC-072`, `TC-073`).
3. Zero-score players never appear (`TC-074`, `TC-083`).
4. Page 2 returns the next slice without overlap; a page past the end returns an
   empty list and the UI keeps working (`TC-075`, `TC-076`).
5. Recent hunts lead with the most recently updated player regardless of score (`TC-081`, `TC-082`).
6. The current player's row is tagged `you` (case-insensitive, trimmed) (`TC-051`).
7. Row values animate from 0 (`useCountUp`) and the lists fade in when scrolled into view.

## Error Handling
- A failed fetch logs to the console and falls back to empty arrays, clearing the
  loading state so the skeleton never spins forever (`TC-047`).
- The rendered empty state explains the situation ("No hunts recorded yet — be the first legend.").

## Permissions
None — the leaderboard is public.

## Related APIs
`GET /api/snakeGame/highestScore`, `GET /api/snakeGame/latestScore`.

## Related Database Tables
`scores` — read with the `score > 0` filter, `skip`/`limit` and two sort orders.

## Related UI
`Leaderboard` (tabs, pagination, skeletons, empty states, back buttons), used three
times per page (dashboard highest, dashboard recent, mobile tabbed view).

## Existing Tests
| Test | What it proves | Status |
| --- | --- | --- |
| TC-051 | ranked rows, `you` tag, demo chip, disabled boundary buttons | PASS |
| TC-052, TC-053 | empty state and skeleton instead of blank cards | PASS |
| TC-070…TC-077 | ordering, pagination, filtering against a seeded dataset | PASS |
| TC-078, TC-078b | invalid page/limit values | KNOWN ISSUE (BUG-005) |
| TC-079 | unbounded `limit` | KNOWN ISSUE (BUG-012) |
| TC-080…TC-083b | recent-hunts contract | PASS |
| TC-046 | page changes stay inside bounds | PASS |
| TC-047 | API failure degrades gracefully | PASS |

## Missing Tests
- Visual rank/bar proportions and the reveal animation (`TC-213`, manual).
- Concurrent page changes (rapid clicking) — `NOT_EXECUTED`.
- Behaviour with more than ~100 rows (only exercised by the API tests).

## Known Issues
- **BUG-005** invalid `page`/`limit` produce `null` in the pagination object
  (`page: abc` → `page: null`, `limit: 0` → `totalPages: null`) instead of an error.
- **BUG-012** `limit` is unbounded, so a single request can pull the entire board.
- **BREAKING-RISK** the optimistic local patch (`updateLocalScores`) slices the
  highest list to 5 rows; if `limit` ever changes, the client preview and the server
  page size will disagree (`UNKNOWN / REQUIRES VALIDATION`).

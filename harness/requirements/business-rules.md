# Business Rules

Domain rules the codebase encodes — the "laws" of this product. Each rule states
where it is implemented, what it means for a player, and how it is verified.
Several of them are *broken in edge cases*; those are flagged with the bug id.

| ID | Rule | Meaning for a player | Implementation | Verification |
| --- | --- | --- | --- | --- |
| BR-001 | **One row per player name.** A submission with an existing name updates that row; it never inserts a second row. | Your best score is kept and your visits accumulate under one entry. | `addScore/route.ts` (`findOne` → mutate/save), `memoryScores.upsertScore` | TC-057, TC-058, TC-073 ⚠️ MongoDB path is not atomic (BUG-018) |
| BR-002 | **Best score is permanent.** `highestScore` only ever increases; `latestScore` always reflects the newest run; `score` mirrors the best. | A bad run never deletes your record. | `addScore/route.ts`, `upsertScore` | TC-020, TC-057 |
| BR-003 | **Only positive scores are ranked.** Entries with `score <= 0` are stored but never returned by either leaderboard. | A 0-point run is invisible on the board. | `Score.find({score: {$gt: 0}})`, `listHighest`, `listLatest` | TC-016, TC-074, TC-083 |
| BR-004 | **Ranking is by best score, descending.** Ties are broken by the stored `score`. | The strongest run sits at the top; newer players do not jump the queue. | `highestScore/route.ts`, `listHighest` | TC-014, TC-072 |
| BR-005 | **"Recent hunts" is recency, not skill.** The five most recently updated players are shown, regardless of score. | Returning to play moves you up on the recent board even with a weak run. | `latestScore/route.ts`, `listLatest` | TC-017, TC-081, TC-082 |
| BR-006 | **Player identity is the self-declared name**, case-sensitive, untrimmed, unlimited length server-side. | `Tester` and `tester` are two different people; accidental spaces create a new player. | `addScore/route.ts`, `upsertScore` | TC-022, TC-069b ⚠️ UI constrains to 20 chars `[a-zA-Z0-9 ]`, the API does not (BUG-003) |
| BR-007 | **A blocked display name becomes `Anonymous`.** The check is a case-insensitive substring test against a 632-entry list. | Offensive names cannot reach the board in their original form. | `foulWords.ts`, `addScore/route.ts` | TC-060 ⚠️ false positives (BUG-002) and one shared row (BUG-004) |
| BR-008 | **Speed increases with performance.** Every point shortens the step by 1 ms from 95 ms, floored at 55 ms. | The longer you survive, the harder it gets. | `useSnakeGame.ts`, `GameHeader.tsx` | TC-006/TC-039 (measured 95 → 94 → 93 → 55 ms) |
| BR-009 | **The only death is self-collision.** Board edges are portals, so there is no wall death. | Aggressive play at the edges is safe; crossing your own tail is not. | `useSnakeGame.ts` | TC-007, TC-034, TC-040 |
| BR-010 | **The minimum scoring run is 3 points.** Death requires a body of at least four segments, so a 0-point death cannot happen in normal play. | Every finished run recorded on the board has score ≥ 3. | `useSnakeGame.ts` | TC-048 |
| BR-011 | **Session state is client-side.** Paused runs, personal bests and theme live in the browser; only completed scores go to the server. | Clearing site data loses your paused run and personal best, never your leaderboard entry. | `useSnakeGame.ts`, `layout.tsx`, `ThemeToggle.tsx` | TC-041, TC-043, TC-044, TC-045 |
| BR-012 | **The board can run without a database.** With no `DATABASE_URL` the API serves a process-local demo board; in development it is seeded with six demo players, in production it starts empty and is flagged `demo: true`. | The game is fully playable before any infrastructure exists, and the UI says so. | `db.ts`, `memoryScores.ts`, `Leaderboard.tsx` | TC-025, TC-051, TC-056, TC-059 |

## Degenerate cases worth remembering

| Case | Current behaviour | Correct behaviour | Reference |
| --- | --- | --- | --- |
| Same name submitted by two different people | Their runs merge — the board treats them as one player | Acceptable for an arcade page; would need accounts to fix | BR-006 |
| A legit name containing a blocked substring (e.g. `Hancock`, `Bharat`) | Silently renamed to `Anonymous` | Match whole words or use a more precise filter | BUG-002 |
| Two blocked names in one session | Both merge into one `Anonymous` row and inflate its visits | One row per distinct blocked submission | BUG-004, TC-060d |
| Score sent as a string (`"7"`) | Stored and ranked by numeric coercion | Reject non-numeric scores | BUG-001 |
| Name longer than 20 characters | Accepted by the API and echoed into leaderboard payloads | Enforce the UI rule server-side | BUG-003 |

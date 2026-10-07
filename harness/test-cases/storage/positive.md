# Storage — positive cases

The in-memory demo store contract. Executed **2026-10-07 · RUN-2026-001**.
Automation: `automation/unit/memory-scores.test.mjs`,
`automation/unit/memory-scores-production.test.mjs` (TC-025).

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-013 | FEAT-008 | High | Unit | `NODE_ENV !== "production"`, module freshly loaded | Reset the store, count the seeded players | — | Six demo players seeded | 6 rows (Nagini 42, Tom Riddle 31, Hermione 27, …) | PASS | AUTOMATED | unit.tap | BR-012, REQ-031 | — |
| TC-014 | FEAT-008 | High | Unit | seeded store | Call `listHighest(1, 5)` and read the scores | — | Descending by `highestScore` | descending | PASS | AUTOMATED | unit.tap | BR-004, REQ-023 | — |
| TC-015 | FEAT-008 | High | Unit | ≥ 6 players | Call `listHighest` with the default window | default page | Five rows per page, correct `total`/`totalPages` | as expected | PASS | AUTOMATED | unit.tap | REQ-025 | — |
| TC-016 | FEAT-008 | High | Unit | a player with score 0 and one with score 1 | Call `listHighest` and `listLatest`; search for those names | 0 and 1 | The zero-score row is excluded; the scoring player is returned | 1 row returned (`Visible`) | PASS | AUTOMATED | unit.tap | BR-003, REQ-024 | — |
| TC-017 | FEAT-008 | High | Unit | several players, one updated last | Call `listLatest()` and read the order | — | Most recently updated first | as expected | PASS | AUTOMATED | unit.tap | BR-005, REQ-023 | — |
| TC-018 | FEAT-008 | Medium | Unit | ≥ 6 players | Call `listLatest()` and count | — | At most five entries | 5 | PASS | AUTOMATED | unit.tap | REQ-022 | — |
| TC-019 | FEAT-008 | High | Unit | empty store | `upsertScore("Fresh", 7)` then read the stored row | `{ name, score: 7 }` | New row with `score = highestScore = latestScore = 7`, `visits = 1`, `updatedAt` set | as expected | PASS | AUTOMATED | unit.tap | BR-001, BR-002 | — |
| TC-020 | FEAT-002, FEAT-008 | High | Unit | an existing player | Upsert a lower score, then a higher one | 9 then 12 | `highestScore` only grows, `latestScore` tracks the last run, `visits` increments | as expected | PASS | AUTOMATED | unit.tap | BR-002, REQ-027 | — |
| TC-025 | FEAT-008, FEAT-012 | High | Unit | `NODE_ENV=production`, freshly loaded module | Load with production env and count rows | — | No demo seed: production starts with an empty board | 0 rows | PASS | AUTOMATED | unit.tap | BR-012, REQ-032 | — |

TC-025 runs in a subprocess with `NODE_ENV=production` because the store seeds at
module load; this keeps the "production must not fake a leaderboard" rule verified.

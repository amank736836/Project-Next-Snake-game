# Leaderboard — positive cases

Rendering, ordering and pagination of the hall of fame.
Executed **2026-10-07 · RUN-2026-001**. Automation:
`automation/ui/components-render.test.mjs` (TC-051…TC-053) ·
`automation/api/highestScore.test.mjs` (TC-070…TC-083b, against a seeded dataset).

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-051 | FEAT-006 | High | Integration (UI) | mocked score data incl. the current player | Render `Leaderboard`, inspect markup | 6 rows, `playerName = "Nagini"` | Ranked rows, `you` tag on the current player, demo chip, page bounds disabled | as expected | PASS | AUTOMATED | ui.tap | REQ-022, REQ-025 | — |
| TC-052 | FEAT-006 | Medium | UI | empty score list | Render `Leaderboard` | `[]` | An explanatory empty state, no blank card | message rendered | PASS | AUTOMATED | ui.tap | REQ-022 | — |
| TC-053 | FEAT-006 | Medium | UI | `loading = true` | Render `Leaderboard` | — | Shimmer skeletons, still accessible | skeletons present | PASS | AUTOMATED | ui.tap | REQ-022 | — |
| TC-070 | FEAT-006 | Critical | API | seeded dataset | `GET /highestScore?page=1&limit=5` | 6 seeded players | Body has `scores` array and `pagination {total,page,limit,totalPages}` | contract met | PASS | AUTOMATED | api.tap | REQ-022, REQ-025 | — |
| TC-071 | FEAT-006 | High | API | seeded dataset | `GET /highestScore` with no query | defaults | page 1, five rows | as expected | PASS | AUTOMATED | api.tap | REQ-025 | — |
| TC-072 | FEAT-006 | Critical | API | seeded scores | Fetch page 1 and compare the order of `highestScore` values | 12 / 9 / 6 / 3 / 2 | Strictly descending by best score | descending | PASS | AUTOMATED | api.tap | REQ-023, BR-004 | — |
| TC-073 | FEAT-006 | High | API | a player submitted twice (3 then 9) | Fetch the board and locate the player | `SeedRepeatA` | Exactly one row, `highestScore = 9`, `visits = 2` | as expected | PASS | AUTOMATED | api.tap | REQ-026, BR-001 | — |
| TC-074 | FEAT-006 | High | API | a player whose only score is 0 | Fetch the board and search for the name | `SeedHidden` | The row exists in storage but never appears | absent | PASS | AUTOMATED | api.tap | REQ-024, BR-003 | — |
| TC-075 | FEAT-006 | High | API | ≥ 6 seeded players | Fetch page 1 and page 2, compare names | `limit = 5` | No overlap between pages; page 2 holds the remainder | no overlap | PASS | AUTOMATED | api.tap | REQ-025 | — |
| TC-077 | FEAT-006 | Medium | API | ≥ 6 seeded players | `GET /highestScore?page=1&limit=2` | `limit = 2` | Exactly 2 rows returned | 2 rows | PASS | AUTOMATED | api.tap | REQ-025 | — |
| TC-080 | FEAT-006 | High | API | seeded dataset | `GET /latestScore` | — | Plain JSON array, ≤ 5 entries | array of 5 | PASS | AUTOMATED | api.tap | REQ-022 | — |
| TC-081 | FEAT-006 | High | API | two players, the later one with a lower score | Fetch recent hunts | `LatestProbe` after `EarlierProbe` | Most recently updated player first | as expected | PASS | AUTOMATED | api.tap | REQ-023, BR-005 | — |
| TC-082 | FEAT-006 | Medium | API | a high score recorded earlier, a low score later | Fetch recent hunts and compare with the top board | 30 then 1 | Recency order, not score order | recency order | PASS | AUTOMATED | api.tap | BR-005 | — |
| TC-083 | FEAT-006 | Medium | API | a zero-score player updated most recently | Fetch recent hunts | 0-point player | The zero-score player is excluded | excluded | PASS | AUTOMATED | api.tap | REQ-024, BR-003 | — |
| TC-083b | FEAT-006 | Low | API | non-empty board | Inspect row fields | — | Every row carries `name`, `score`, `latestScore`, `updatedAt` (the fields the UI reads) | present | PASS | AUTOMATED | api.tap | REQ-022 | — |

# Storage — edge cases

Identity, degenerate records and the MongoDB-mode suite.
Executed **2026-10-07 · RUN-2026-001** — except TC-133…TC-137, which are
`NOT_EXECUTED` (no MongoDB in this environment, tracked as `BLOCKED`).

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-022 | FEAT-008 | Medium | Edge (Unit) | empty store | Upsert `Tester` and `tester` | two names | Documented behaviour: identity is case-sensitive, so they are two players | two rows | PASS | AUTOMATED | unit.tap | BR-006 | — |
| TC-023 | FEAT-008 | High | Edge (Unit) | empty store | Upsert with `score = undefined`, then read both boards | `{ name: "Ghost", score: undefined }` | An unusable record must not be created (or must be purgeable) | ❌ the row is stored forever and hidden from every board | KNOWN ISSUE (characterisation) | AUTOMATED | unit.tap | REQ-024 | BUG-010 |
| TC-133 | FEAT-008 | High | Integration (DB) | MongoDB reachable, `HARNESS_MONGODB_READY=1` | POST a first-time player, then read it back | `{ name, score: 5 }` | One persisted document with the submitted values | NOT_EXECUTED | BLOCKED | AUTOMATED (gated) | `mongodb-mode.test.mjs` | REQ-057 | — |
| TC-134 | FEAT-008 | High | Integration (DB) | as TC-133 | Submit twice for the same player | 5 then 9 | The second write updates the document; `visits = 2`; no insert | NOT_EXECUTED | BLOCKED | AUTOMATED (gated) | `mongodb-mode.test.mjs` | REQ-057, BR-001 | — |
| TC-135 | FEAT-008 | Critical | Concurrency (DB) | as TC-133 | Fire 10 parallel first-time writes for one name, then count rows | 10 parallel POSTs | Exactly one document (atomic upsert or unique index) | NOT_EXECUTED — flagged in advance as a likely defect | BLOCKED | AUTOMATED (gated) | `mongodb-mode.test.mjs` | REQ-058 | BUG-018 |
| TC-136 | FEAT-008 | Medium | Integration (DB) | as TC-133 | Read a stored document and inspect timestamps | — | `createdAt`/`updatedAt` present and ordered | NOT_EXECUTED | BLOCKED | AUTOMATED (gated) | `mongodb-mode.test.mjs` | REQ-057 | — |
| TC-137 | FEAT-008 | Medium | Integration (DB) | as TC-133 | Fetch both boards against MongoDB and compare with demo mode | seeded rows | Same ordering/pagination contract; no `demo` flag | NOT_EXECUTED | BLOCKED | AUTOMATED (gated) | `mongodb-mode.test.mjs` | REQ-057, REQ-046 | — |

**How to unblock:** start MongoDB, export `HARNESS_MONGODB_URL`, then
`npm run test:database` — the suite skips itself with an explanatory message when the
variable is absent, so it is safe to leave in `npm test`. Full instructions:
[`../../test-scenarios/database.md`](../../test-scenarios/database.md).

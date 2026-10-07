# Test Cases

Every automated and manual case in the harness, organised by module. A case is
documented with the fields of the project template:

> **Test Case ID · Feature · Priority · Type · Preconditions · Steps · Test Data ·
> Expected Result · Actual Result · Status · Automation · Evidence ·
> Related Requirement · Related Bug · Last Executed**

## Conventions

- **`TC-xxx` is permanent.** The id appears in the test name in
  `harness/automation/**`, in the TAP output and here — renaming one means renaming
  it everywhere.
- **Steps are real.** For automated cases the steps are executed by the file named in
  the *Automation* column; the table describes what that code does, so a human can
  replay it by hand.
- **Status vocabulary (from `RUN-2026-001`):** `PASS` — executed, green ·
  `KNOWN ISSUE` — executed, fails by design, bug id in *Related Bug* ·
  `NOT_EXECUTED` — never run here (blocked on MongoDB or a browser) ·
  `FAIL` — must never appear without a bug id.
- **Actual Result is the observed result**, taken from the TAP output of the run,
  never from assumption. `NOT_EXECUTED` cases carry no actual result.
- **One primary category per case.** Files are named `positive`, `negative`,
  `edge-cases`, `regression`. The category says *why the case exists*:
  `positive` proves a documented behaviour, `negative` proves the system refuses
  something, `edge-cases` probes boundaries and degenerate states, `regression`
  pins behaviour that a change could silently alter (this is where
  characterisation pairs live). A module has no file for a category it does not use.
- **Manual cases** (`TC-200`…) are full template blocks in `manual/` because there
  is no code to point at.

## Modules

| Module | Cases | Covers |
| --- | --- | --- |
| [`game-engine/`](game-engine/) | TC-001…TC-012, TC-030…TC-042b, TC-044, TC-045, TC-048 | Board, movement, food, scoring, speed, session lifecycle, persistence round-trip |
| [`leaderboard/`](leaderboard/) | TC-046, TC-047, TC-051…TC-053, TC-070…TC-083b | Hall of fame rendering, ordering, pagination, degradation |
| [`score-api/`](score-api/) | TC-056…TC-059, TC-061…TC-069b, TC-084…TC-089c | `addScore` contract, method handling, payload limits |
| [`storage/`](storage/) | TC-013…TC-025, TC-130…TC-137 | In-memory store contract, demo seeding, DB degradation, MongoDB mode |
| [`moderation/`](moderation/) | TC-026…TC-029, TC-060…TC-060d | Foul-word list and rename behaviour |
| [`ui-shell/`](ui-shell/) | TC-043, TC-049, TC-050, TC-054, TC-055, TC-055b, TC-090…TC-093b | Component markup, accessibility, theming, served shell |
| [`performance/`](performance/) | TC-100…TC-105 | Latency, throughput, growth |
| [`security/`](security/) | TC-110…TC-125 | Headers, CORS, input abuse, secrets |
| [`manual/`](manual/) | TC-200…TC-219 | Browser, touch, responsive, motion, deployment checks |

## Coverage at a glance (RUN-2026-001)

| Status | Cases |
| --- | --- |
| PASS | 116 |
| KNOWN ISSUE | 18 (BUG-001 … BUG-018; see `../bugs/known-issues.md`) |
| NOT_EXECUTED / skipped | 5 (TC-133…TC-137, no MongoDB) |
| Manual NOT_EXECUTED | 20 (TC-200…TC-219, no browser) |
| Total documented | 159 (139 automated + 20 manual) |

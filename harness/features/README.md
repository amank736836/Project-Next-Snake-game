# Feature Inventory

Twelve features cover the whole product. Each has one document that contains every
required template section — `Purpose`, `User`, `Entry Point`, `Dependencies`,
`Inputs`, `Outputs`, `Business Rules`, `Expected Behavior`, `Error Handling`,
`Permissions`, `Related APIs`, `Related Database Tables`, `Related UI`,
`Existing Tests`, `Missing Tests`, `Known Issues`.

> **Note on structure.** The generic harness template proposes eight files per
> feature (`README/requirements/behavior/acceptance-criteria/test-scenarios/test-cases/test-data/known-issues`).
> For a project of this size that would create ~90 small files with heavy
> duplication, so each feature is documented once, with every one of those concerns
> as a heading inside it. Test cases live centrally in
> [`../test-cases/`](../test-cases/) and are referenced by id from each feature.

| ID | Feature | Primary code | Case ids touching it | Open bugs |
| --- | --- | --- | --- | --- |
| [FEAT-001](FEAT-001-game-engine.md) | Game engine: board, movement, portal walls, food | `useSnakeGame.ts`, `utils.ts` | TC-001…TC-004, TC-010, TC-032…TC-034, TC-038, TC-040, TC-048 | BUG-006, BUG-007 |
| [FEAT-002](FEAT-002-scoring-and-speed.md) | Scoring and the speed ramp | `useSnakeGame.ts`, `GameHeader.tsx` | TC-006, TC-020, TC-038, TC-039 | — |
| [FEAT-003](FEAT-003-session-lifecycle.md) | Run lifecycle: start, pause, resume, game over, restart | `useSnakeGame.ts`, `GameOver.tsx` | TC-031, TC-032, TC-040…TC-042b, TC-045, TC-048, TC-050, TC-054, TC-055 | BUG-011 |
| [FEAT-004](FEAT-004-controls.md) | Keyboard and on-screen controls | `Controls.tsx`, `useSnakeGame.ts` | TC-035…TC-037, TC-055b (+ manual TC-211, TC-212) | — |
| [FEAT-005](FEAT-005-mission-hub.md) | Mission hub and player identity | `MissionHub.tsx` | TC-031, TC-032, TC-037, TC-049, TC-050, TC-069 (+ manual TC-209) | BUG-003 |
| [FEAT-006](FEAT-006-leaderboard.md) | Hall of fame: highest + recent hunts | `Leaderboard.tsx`, both GET routes | TC-046, TC-047, TC-051…TC-053, TC-070…TC-083b, TC-101, TC-102, TC-104 (+ manual TC-213) | BUG-005, BUG-012 |
| [FEAT-007](FEAT-007-score-submission.md) | Score submission and profanity filtering | `addScore/route.ts`, `foulWords.ts` | TC-019…TC-023, TC-056…TC-069b, TC-084…TC-089c, TC-103, TC-116…TC-121 (+ manual TC-214) | BUG-001…BUG-004, BUG-013, BUG-014, BUG-016 |
| [FEAT-008](FEAT-008-storage-modes.md) | Storage modes: MongoDB and in-memory demo | `db.ts`, `memoryScores.ts`, `Score.ts` | TC-013…TC-025, TC-105, TC-130…TC-137 | BUG-010, BUG-017, BUG-018 |
| [FEAT-009](FEAT-009-browser-persistence.md) | Browser persistence: save slot, best score, theme | `useSnakeGame.ts`, `layout.tsx` | TC-004…TC-007, TC-011, TC-012, TC-041…TC-045 | BUG-007, BUG-011 |
| [FEAT-010](FEAT-010-theming-and-motion.md) | Theming and the motion system | `ThemeToggle.tsx`, `useUiMotion.ts`, `globals.css` | TC-043, TC-051, TC-055, TC-091, TC-092 (+ manual TC-206…TC-208) | — |
| [FEAT-011](FEAT-011-responsive-layout.md) | Responsive layout and container queries | `globals.css`, component CSS modules | TC-093, TC-100, TC-103 (+ manual TC-200…TC-205) | — |
| [FEAT-012](FEAT-012-observability-and-config.md) | Configuration, demo signalling, analytics | `db.ts`, `layout.tsx` | TC-025, TC-059, TC-088, TC-090, TC-092, TC-093b, TC-110…TC-111, TC-115, TC-122…TC-125 | BUG-014, BUG-015 |

Case ids are the ones that exercise the feature; several cases appear under more than
one feature because they cross a boundary (for example TC-041 is both session lifecycle
and browser persistence). The canonical owner of every id is
[`../reports/traceability.md`](../reports/traceability.md).

## Coverage summary

| | Count |
| --- | --- |
| Features documented | 12 |
| Features with automated tests | 12 |
| Features with at least one open bug | 8 (FEAT-001, FEAT-003, FEAT-005, FEAT-006, FEAT-007, FEAT-008, FEAT-009, FEAT-012) |
| Features requiring a database to finish testing | 1 (FEAT-008) |
| Features requiring a real browser to finish testing | 3 (FEAT-004, FEAT-010, FEAT-011) |

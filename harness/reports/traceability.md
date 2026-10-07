# Traceability — Requirement → Feature → Scenario → Test Case → Automated Test → Result → Evidence

Every requirement and business rule in `../requirements/` with the chain that proves it.
Results are from **RUN-2026-001** (2026-10-07; `HARNESS_RUN_ID=RUN-2026-001 npm test`).

**Legend — automated test files**

| Key | File |
| --- | --- |
| U1 | `automation/unit/game-utils.test.mjs` |
| U2 | `automation/unit/memory-scores.test.mjs` |
| U3 | `automation/unit/memory-scores-production.test.mjs` |
| U4 | `automation/unit/foul-words.test.mjs` |
| A1 | `automation/api/addScore.test.mjs` |
| A2 | `automation/api/highestScore.test.mjs` |
| A3 | `automation/api/latestScore.test.mjs` |
| A4 | `automation/api/methods-and-body.test.mjs` |
| I1 | `automation/ui/game-hook.test.mjs` |
| I2 | `automation/ui/components-render.test.mjs` |
| I3 | `automation/ui/served-shell.test.mjs` |
| P1 | `automation/performance/api-latency.test.mjs` |
| S1 | `automation/security/http-surface.test.mjs` |
| S2 | `automation/security/input-and-abuse.test.mjs` |
| S3 | `automation/security/secrets-and-config.test.mjs` |
| D1 | `automation/database/degradation.test.mjs` |
| D2 | `automation/database/mongodb-mode.test.mjs` |

Evidence is the suite TAP (`test-results/latest/<suite>.tap`), the console transcript
(`evidence/logs/<suite>-RUN-2026-001.spec.txt`) and, where captured, the raw HTTP
artefact under `evidence/api-responses/` or `evidence/database-results/`.

## Functional requirements

| Req | Feature | Scenario | Test case(s) | Automated test | Result (RUN-2026-001) | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-001 | FEAT-001 | SCN-009 | TC-001, TC-032 | U1, I1 | PASS | unit.tap, ui.tap |
| REQ-002 | FEAT-001 | SCN-010 | TC-008, TC-033 | U1, I1 | PASS | unit.tap, ui.tap |
| REQ-003 | FEAT-001 | SCN-011 | TC-034 | I1 | PASS | ui.tap |
| REQ-004 | FEAT-001 | SCN-012 | TC-002, TC-003, TC-010 | U1 | PASS (TC-010 KNOWN ISSUE, BUG-006) | unit.tap |
| REQ-005 | FEAT-002 | SCN-012 | TC-038 | I1 | PASS | ui.tap |
| REQ-006 | FEAT-002 | SCN-013 | TC-039 | I1 | PASS | ui.tap |
| REQ-007 | FEAT-001 | SCN-014 | TC-040 | I1 | PASS | ui.tap |
| REQ-008 | FEAT-001 | SCN-014 | TC-048 | I1 | PASS | ui.tap |
| REQ-009 | FEAT-004 | SCN-018, SCN-106 (touch) | TC-035, TC-055b | I1, I2 | PASS (joystick drag NOT_EXECUTED: TC-211) | ui.tap |
| REQ-010 | FEAT-004 | SCN-018 | TC-035 | I1 | PASS | ui.tap |
| REQ-011 | FEAT-004 | SCN-019 | TC-036 | I1 | PASS | ui.tap |
| REQ-012 | FEAT-005 | SCN-017 | TC-031, TC-050 | I1, I2 | PASS | ui.tap |
| REQ-013 | FEAT-005 | SCN-040 | TC-049, TC-069, TC-069b | I2, A1 | PARTIAL — client PASS, server VIOLATED (BUG-003) | ui.tap, api.tap |
| REQ-014 | FEAT-005 | SCN-009 | TC-037 | I1 | PASS | ui.tap |
| REQ-015 | FEAT-003 | SCN-016 | TC-041, TC-045, TC-050, TC-042b | I1, I2 | PASS (TC-042b KNOWN ISSUE, BUG-011) | ui.tap |
| REQ-016 | FEAT-003 | SCN-016 | TC-041 | I1 | PASS | ui.tap |
| REQ-017 | FEAT-009 | SCN-016 | TC-004, TC-005, TC-011 | U1 | PASS (TC-011 KNOWN ISSUE, BUG-007) | unit.tap |
| REQ-018 | FEAT-003 | SCN-014, SCN-015 | TC-054, TC-055 | I2 | PASS | ui.tap |
| REQ-019 | FEAT-007 | SCN-023 | TC-040, TC-056 | I1, A1 | PASS | ui.tap, api.tap, api-responses/addScore-valid.\* |
| REQ-020 | FEAT-009 | SCN-024 | TC-044 | I1 | PASS | ui.tap |
| REQ-021 | FEAT-010 | SCN-024 | TC-043, TC-091 | I1, I3 | PASS | ui.tap, api-responses/page-shell.headers.txt |
| REQ-022 | FEAT-006 | SCN-020, SCN-022 | TC-051, TC-070, TC-071, TC-080 | I2, A2, A3 | PASS | ui.tap, api.tap |
| REQ-023 | FEAT-006 | SCN-020, SCN-021 | TC-072, TC-082 | A2, A3 | PASS | api.tap |
| REQ-024 | FEAT-006 | SCN-047 | TC-016, TC-074, TC-083 | U2, A2, A3 | PASS | unit.tap, api.tap |
| REQ-025 | FEAT-006 | SCN-022, SCN-042 | TC-051, TC-070, TC-075, TC-077, TC-078, TC-078b | I2, A2 | PASS (TC-078 KNOWN ISSUE, BUG-005) | ui.tap, api.tap, api-responses/highestScore-invalid-page.body.json |
| REQ-026 | FEAT-007 | SCN-023 | TC-057, TC-058, TC-073 | A1, A2 | PASS | api.tap |
| REQ-027 | FEAT-007 | SCN-023 | TC-020, TC-057 | U2, A1 | PASS | unit.tap, api.tap |
| REQ-028 | FEAT-007 | SCN-055, SCN-056 | TC-060, TC-060b, TC-060c, TC-060d | A1 | PARTIAL — rename works, false positives and merging do not (BUG-002, BUG-004) | api.tap, api-responses/addScore-blocked-name.body.json |
| REQ-029 | FEAT-007 | SCN-036…SCN-039 | TC-061…TC-068 | A1 | PARTIAL — malformed bodies rejected; scores are not (BUG-001) | api.tap, api-responses/addScore-missing-name.\* |
| REQ-030 | FEAT-012 | SCN-044 | TC-088 | A4 | PASS | api.tap, api-responses/dotfile-and-404-probes.txt |
| REQ-031 | FEAT-008 | SCN-068 | TC-051, TC-059 | I2, A1 | PASS | ui.tap, api.tap |
| REQ-032 | FEAT-008 | SCN-002 | TC-025 | U3 | PASS | unit.tap |
| REQ-033 | FEAT-012 | SCN-065 | TC-047, TC-132 | I1, D1 | PASS | ui.tap, database.tap |
| REQ-034 | FEAT-012 | SCN-001 | TC-090, TC-092 | I3 | PASS | ui.tap |
| REQ-061 | FEAT-007 | SCN-086 | TC-084, TC-086 | A4 | PASS | api.tap, api-responses/addScore-get-405.headers.txt |
| REQ-062 | FEAT-007 | SCN-086 | TC-085, TC-113 | A4, S1 | PASS | api.tap, security.tap, api-responses/addScore-options-preflight.headers.txt |

## Non-functional requirements

| Req | Feature | Scenario | Test case(s) | Automated test | Result (RUN-2026-001) | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-035 | FEAT-011 | SCN-109 | TC-093 | I3 | PASS | api-responses/page-shell.headers.txt |
| REQ-036 | FEAT-011 | SCN-109 | TC-100 | P1 | PASS (p95 5.55 ms) | performance-summary.json |
| REQ-037 | FEAT-006 | SCN-110 | TC-101 | P1 | PASS (p95 5.88 ms) | performance-summary.json |
| REQ-038 | FEAT-006 | SCN-111 | TC-102 | P1 | PASS (p95 4.52 ms) | performance-summary.json |
| REQ-039 | FEAT-007 | SCN-112 | TC-103 | P1 | PASS (p95 3.65 ms) | performance-summary.json |
| REQ-040 | FEAT-006 | SCN-113 | TC-104 | P1 | PASS (50/50 in 120 ms) | performance-summary.json |
| REQ-041 | FEAT-008 | SCN-114 | TC-105 | P1 | PASS (5.71 → 3.17 ms) | performance-summary.json |
| REQ-042 | FEAT-006 | SCN-115 | TC-079, TC-101 | A2, P1 | PARTIAL — normal pages 690 B, hostile names unbounded (BUG-012) | api.tap, performance-summary.json |
| REQ-043 | FEAT-012 | SCN-129 | TC-122, TC-123, TC-124 | S3 | PASS | security.tap |
| REQ-044 | FEAT-012 | SCN-129 | TC-123 | S3 | PASS | security.tap |
| REQ-045 | FEAT-012 | SCN-129 | — (recorded in `PROJECT_OVERVIEW.md` §13) | manual review | PASS | security.tap (bundle scan) |
| REQ-046 | FEAT-012 | SCN-087 | TC-093b, TC-115 | I3, S1 | PASS | ui.tap, security.tap |
| REQ-047 | FEAT-007 | SCN-128 | TC-114, TC-114b | S1 | **VIOLATED** — raw internals returned (BUG-014) | security.tap, api-responses/, database-results/ |
| REQ-048 | FEAT-012 | SCN-126 | TC-110, TC-110b, TC-111 | S1 | **VIOLATED** — no hardening headers (BUG-015) | security.tap, api-responses/page-shell.headers.txt |
| REQ-049 | FEAT-007 | SCN-131 | TC-089, TC-120, TC-119b | A4, S2 | **VIOLATED** — no limits, forged scores accepted (BUG-013, BUG-016) | api.tap, security.tap |
| REQ-050 | FEAT-012 | SCN-065 | TC-047, TC-132 | I1, D1 | PASS | ui.tap, database.tap |
| REQ-051 | FEAT-010 | SCN-106 | TC-206 | manual | NOT_EXECUTED (no browser) | — |
| REQ-052 | FEAT-004 | SCN-107, SCN-103 | TC-055b, TC-215 | I2 + manual | PARTIAL — markup PASS, focus visibility NOT_EXECUTED | ui.tap |
| REQ-053 | FEAT-006 | SCN-103 | TC-049…TC-055b | I2 | PASS | ui.tap |
| REQ-054 | FEAT-011 | SCN-105 | TC-200…TC-205 | manual | NOT_EXECUTED (no browser) | — |
| REQ-055 | — | SCN-007 | build + lint (run pre-flight) | `npm run build`, `npm run lint` | PASS | run log |
| REQ-056 | — | SCN-007 | environment record | `env.mjs` / summary.md | PASS (Node v22.22.3) | test-results/latest/summary.md |
| REQ-057 | FEAT-008 | SCN-089…SCN-093 | TC-133, TC-134, TC-136, TC-137 | D2 | NOT_EXECUTED (no MongoDB) | database.tap (skips) |
| REQ-058 | FEAT-008 | SCN-091 | TC-135 | D2 | NOT_EXECUTED → UNKNOWN / REQUIRES VALIDATION (BUG-018) | database.tap (skip + todo) |
| REQ-059 | FEAT-008 | SCN-094, SCN-095 | TC-130, TC-131, TC-131b | D1 | **VIOLATED** — no recovery without a restart (BUG-017) | database.tap, database-results/ |
| REQ-060 | — | — | documentation commands | manual execution of this harness's commands | PASS | README + this run |

## Business rules

| BR | Feature | Scenario | Test case(s) | Automated test | Result | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| BR-001 | FEAT-007, FEAT-008 | SCN-023, SCN-090 | TC-057, TC-058, TC-073, TC-135 | A1, A2, D2 | PASS in demo mode; MongoDB path NOT_EXECUTED (BUG-018) | api.tap, database.tap |
| BR-002 | FEAT-007 | SCN-023 | TC-020, TC-057 | U2, A1 | PASS | unit.tap, api.tap |
| BR-003 | FEAT-006 | SCN-047 | TC-016, TC-074, TC-083 | U2, A2, A3 | PASS | unit.tap, api.tap |
| BR-004 | FEAT-006 | SCN-020 | TC-014, TC-072 | U2, A2 | PASS | unit.tap, api.tap |
| BR-005 | FEAT-006 | SCN-021 | TC-017, TC-081, TC-082 | U2, A3 | PASS | unit.tap, api.tap |
| BR-006 | FEAT-008 | SCN-057 | TC-022, TC-069b | U2, A1 | PASS (case-sensitive identity is documented behaviour) | unit.tap, api.tap |
| BR-007 | FEAT-007 | SCN-055, SCN-056 | TC-060, TC-060b, TC-060c, TC-060d | A1 | PARTIAL (BUG-002, BUG-004) | api.tap |
| BR-008 | FEAT-002 | SCN-013 | TC-039 | I1 | PASS (95 → 55 ms) | ui.tap |
| BR-009 | FEAT-001 | SCN-011 | TC-034, TC-040 | I1 | PASS | ui.tap |
| BR-010 | FEAT-001 | SCN-014 | TC-048 | I1 | PASS | ui.tap |
| BR-011 | FEAT-009 | SCN-024 | TC-041, TC-043, TC-044 | I1 | PASS | ui.tap |
| BR-012 | FEAT-008 | SCN-002, SCN-068 | TC-025, TC-059 | U3, A1 | PASS | unit.tap, api.tap |

## Reverse index — case families by module

| Module | Cases | Chain target |
| --- | --- | --- |
| `test-cases/game-engine/` | TC-001…TC-012, TC-030…TC-048 | REQ-001…REQ-011, REQ-015…REQ-020, BR-008…BR-011 |
| `test-cases/leaderboard/` | TC-046, TC-047, TC-051…TC-053, TC-070…TC-083b | REQ-022…REQ-025, REQ-033, BR-003…BR-005 |
| `test-cases/score-api/` | TC-056…TC-059, TC-061…TC-069b, TC-084…TC-089c | REQ-019, REQ-026, REQ-029, REQ-046, REQ-049, REQ-061, REQ-062 |
| `test-cases/storage/` | TC-013…TC-025, TC-130…TC-137 | REQ-024, REQ-031, REQ-032, REQ-041, REQ-050, REQ-057…REQ-059, BR-001, BR-012 |
| `test-cases/moderation/` | TC-026…TC-029, TC-060…TC-060d | REQ-028, BR-007 |
| `test-cases/ui-shell/` | TC-043, TC-049, TC-050, TC-054, TC-055, TC-055b, TC-090…TC-093b | REQ-018, REQ-021, REQ-034, REQ-035, REQ-046, REQ-052, REQ-053 |
| `test-cases/performance/` | TC-100…TC-105 | REQ-036…REQ-041 |
| `test-cases/security/` | TC-110…TC-125 | REQ-042…REQ-049 |
| `test-cases/manual/` | TC-200…TC-219 | REQ-051, REQ-052, REQ-054, REQ-057, REQ-060 |

## Orphans and gaps

- **Requirements with no automated case:** REQ-045 (config surface — verified by bundle
  scan instead), REQ-055/REQ-056 (build/runtime environment — verified by the run
  pre-flight), REQ-060 (documentation — verified by executing the documented commands).
- **Cases with no requirement:** the characterisation cases (TC-060b/d, TC-069b, TC-078b,
  TC-083b, TC-089b/c, TC-093b, TC-110, TC-114b, TC-119b, TC-120b, TC-131b) deliberately
  document *current* behaviour rather than an aspiration; they cite the requirement they
  will satisfy once the linked bug is fixed.
- **Requirements verified only outside automation:** REQ-051, REQ-054 (manual, not yet
  executed), REQ-057, REQ-058 (database, blocked).

# Coverage — RUN-2026-001

**What this file is not:** there is no line/branch instrumentation in this project and
none was added, so no percentage of code executed appears here. Inventing one would be
the easiest lie in this harness. What follows is **catalogue coverage**: which features,
requirements and layers have cases, how many of them were executed, and what remains
untested — every number derived from `requirements/`, `features/`,
`test-scenarios/`, `test-cases/` and the TAP output of `RUN-2026-001`.

## 1. Feature coverage

| | Count |
| --- | --- |
| Features documented (`FEAT-001`…`FEAT-012`) | 12 |
| Features with ≥ 1 automated test | 12 (100 %) |
| Features with ≥ 1 scenario | 12 (100 %) |
| Features with ≥ 1 open bug | 8 (FEAT-001, FEAT-003, FEAT-005, FEAT-006, FEAT-007, FEAT-008, FEAT-009, FEAT-012) |
| Features needing a browser to finish verification | 3 (FEAT-004, FEAT-010, FEAT-011) |
| Features needing MongoDB to finish verification | 1 (FEAT-008) |

## 2. Requirement coverage

62 requirements (36 functional including `REQ-061`/`REQ-062`, 26 non-functional) plus
12 business rules.

| Status | Requirements | Share |
| --- | --- | --- |
| ✅ VERIFIED — executed case(s) passed | 48 | 77.4 % |
| ⚠️ PARTIAL — verified in part or only in demo mode | 6 (REQ-009, REQ-013, REQ-028, REQ-029, REQ-042, REQ-052) | 9.7 % |
| ❌ VIOLATED — implementation contradicts the requirement | 4 (REQ-047, REQ-048, REQ-049, REQ-059) | 6.5 % |
| 🔒 NOT_EXECUTED — blocked (browser/deployment) | 3 (REQ-051, REQ-054, REQ-057) | 4.8 % |
| ❓ UNKNOWN / REQUIRES VALIDATION | 1 (REQ-058 — MongoDB concurrency) | 1.6 % |

Business rules: 10 of 12 verified by an executed case; `BR-007` is partial (BUG-002,
BUG-004) and `BR-001` carries the same MongoDB caveat as REQ-058.

## 3. Scenario coverage

| File | Scenarios | Executed | Not executed / N-A |
| --- | --- | --- | --- |
| smoke | 8 | 8 | — |
| functional | 16 | 16 | — |
| regression | 10 | 10 | — |
| negative | 12 | 12 | — |
| edge-cases | 16 | 13 | 3 (full-board recursion is known-broken; 2 depend on MongoDB) |
| integration | 12 | 10 | 2 explicitly N/A (no auth model, no external service) |
| api | 14 | 13 | 1 partial (MongoDB-mode contract) |
| database | 8 | 5 | 3 blocked on MongoDB |
| ui | 12 | 7 | 5 need a real browser |
| performance | 8 | 7 | 1 unmeasured (memory growth) |
| security | 17 | 17 | — |
| **Total** | **133** | **113** | **20** |

## 4. Test-case and automation coverage

| | Count |
| --- | --- |
| Automated cases | 139 (TC-001…TC-139 plus lettered variants) |
| Executed in RUN-2026-001 | 134 |
| Passed | 116 |
| Known issues | 18 |
| Blocked / skipped | 5 |
| Manual cases | 20 (TC-200…TC-219), all `NOT_EXECUTED` |
| Automation ratio (documented cases that are automated) | 139 / 159 = 87.4 % |

## 5. Layer coverage

| Layer | Cases | Executed | Blocked | Evidence |
| --- | --- | --- | --- | --- |
| Unit — pure functions and store | 29 | 29 | 0 | `test-results/latest/unit.tap` |
| API — HTTP contract | 42 | 42 | 0 | `api.tap` + `evidence/api-responses/` |
| UI — jsdom hook + server-rendered markup | 33 | 33 | 0 | `ui.tap`, `test-results/latest/summary.md` |
| Performance | 6 | 6 | 0 | `performance.tap`, `performance-summary.json` |
| Security | 20 | 20 | 0 | `security.tap` |
| Database | 9 | 4 | 5 | `database.tap`, `evidence/database-results/` |
| Manual (browser/deployment) | 20 | 0 | 20 | none yet — see manual cases |

## 6. API endpoint coverage

| Endpoint | Contract | Validation (negative) | Abuse | Known issues |
| --- | --- | --- | --- | --- |
| `POST /api/snakeGame/addScore` | TC-056…TC-060d | TC-061…TC-069b | TC-089, TC-089b, TC-089c, TC-119, TC-119b, TC-120, TC-120b, TC-121 | BUG-001, BUG-002, BUG-003, BUG-004, BUG-013, BUG-014, BUG-016 |
| `GET /api/snakeGame/highestScore` | TC-070…TC-077 | TC-078, TC-078b | TC-079, TC-118 | BUG-005, BUG-012 |
| `GET /api/snakeGame/latestScore` | TC-080…TC-083b | (shares the paging rules) | — | — |
| All three | TC-084, TC-085, TC-086, TC-087, TC-088, TC-093b, TC-115 | TC-130…TC-132 | — | BUG-014 (degradation messages) |

## 7. UI component coverage

| Component / surface | Markup contract | Behaviour (jsdom) | Visual (manual) |
| --- | --- | --- | --- |
| `MissionHub` | TC-049, TC-050 | TC-031, TC-032, TC-037, TC-045, TC-050 | TC-209, TC-208 |
| `SnakeBoard` | TC-055b | TC-033, TC-034, TC-038, TC-040, TC-048 | TC-210 |
| `Controls` (D-pad + joystick) | TC-055b | TC-035 | TC-211, TC-212 |
| `GameHeader` | TC-055b | TC-039, TC-044 | TC-208 |
| `Leaderboard` | TC-051, TC-052, TC-053 | TC-046, TC-047 | TC-213 |
| `GameOver` | TC-054, TC-055 | TC-040…TC-042b | TC-216 |
| Theme + ambient shell | TC-090, TC-091, TC-092 | TC-043 | TC-206, TC-207 |
| Layout / responsive | TC-093 (shell only) | — | TC-200…TC-205 |

## 8. Database coverage

| Area | Cases | Status |
| --- | --- | --- |
| Demo store contract (seed, ordering, filters, merge, identity) | TC-013…TC-023, TC-025 | 11 executed, 2 known issues (BUG-005, BUG-010) |
| Degradation with an unreachable database | TC-130…TC-132, TC-131b | 4 executed, 1 known issue (BUG-017) |
| MongoDB CRUD, timestamps, ordering | TC-133, TC-134, TC-136, TC-137 | NOT_EXECUTED |
| MongoDB concurrency | TC-135 | NOT_EXECUTED, filed as BUG-018 |
| Indexing / query cost at scale | — | UNKNOWN / REQUIRES VALIDATION |

## 9. What is *not* covered (honest list)

| Gap | Consequence | How to close it |
| --- | --- | --- |
| Real rendering, layout, focus, animation | FEAT-010/011 claims are structural only | Run TC-200…TC-218 in a browser |
| MongoDB behaviour | Persistence, indexing and the race are unverified | `HARNESS_MONGODB_URL=… npm run test:database` |
| Deployed environment (CDN, TLS, analytics) | No evidence for production caching or beacons | TC-217, TC-219 against a deployment |
| Load/concurrency beyond 50 requests | Capacity is unknown | Add a load tool in a dedicated run (not a dependency of the harness) |
| Line/branch coverage | Unknown | Introduce instrumentation deliberately, if it is ever worth the pipeline cost |
| Accessibility conformance (axe/WCAG audit) | Markup contract is verified; conformance is not | Run an a11y tool in the browser pass |
| Cross-browser behaviour | Only Node + jsdom was exercised | The manual pass, on at least Chromium and WebKit |

Every "not covered" line above is also visible in `../TESTING_STATUS.md`, which is the
short version of this file kept up to date between runs.

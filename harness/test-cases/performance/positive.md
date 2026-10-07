# Performance — positive cases

Latency, throughput and growth guardrails. Executed **2026-10-07 · RUN-2026-001**
(production build, demo storage, loopback; 30 samples per endpoint, 50-request burst).
Automation: `automation/performance/api-latency.test.mjs`. Machine-readable results:
`test-results/latest/performance-summary.json`. Raw TAP: `test-results/latest/performance.tap`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-100 | FEAT-011 | Medium | Performance | server running | Request `/` 30×, record p50/p95/max | 30 samples | p95 < 1 000 ms | avg 4.72 ms · p50 3.12 · p95 5.55 · max 41.83 ms (12 201 B) | PASS | AUTOMATED | performance-summary.json | REQ-036 | — |
| TC-101 | FEAT-006 | High | Performance | seeded board | Request `highestScore?page=1&limit=5` 30× | 30 samples | p95 < 500 ms | avg 2.88 · p50 2.56 · p95 5.88 · max 8.05 ms (690 B) | PASS | AUTOMATED | performance-summary.json | REQ-037 | — |
| TC-102 | FEAT-006 | High | Performance | seeded board | Request `latestScore` 30× | 30 samples | p95 < 500 ms | avg 2.54 · p50 2.42 · p95 4.52 · max 5.09 ms (600 B) | PASS | AUTOMATED | performance-summary.json | REQ-038 | — |
| TC-103 | FEAT-007 | High | Performance | server running | POST a fresh score 30× | 30 samples | p95 < 500 ms | avg 2.75 · p50 2.66 · p95 3.65 · max 4.53 ms (209 B) | PASS | AUTOMATED | performance-summary.json | REQ-039 | — |
| TC-104 | FEAT-006 | Medium | Performance | server running | Fire 50 concurrent leaderboard reads, count successes | 50 requests | Zero errors, well under 5 s wall time | 50/50 OK in 120 ms (~417 req/s) | PASS | AUTOMATED | performance-summary.json | REQ-040 | — |
| TC-105 | FEAT-008 | Medium | Performance | empty board | Measure the first write, insert 24 more, measure the last | 25 writes | The last write is not more than 3× slower than the first | 5.71 ms → 3.17 ms (flat) | PASS | AUTOMATED | performance-summary.json | REQ-041 | — |

Interpretation rules: these are loopback numbers on one sandbox host — they detect
*regressions*, they do not certify capacity. There is no load-testing tool in the
project (no k6/autocannon) and the burst test is a crude proxy. Client-side
performance (bundle size, hydration cost, canvas frame rate) is `UNKNOWN /
REQUIRES VALIDATION` — no Lighthouse/web-vitals data was collected.

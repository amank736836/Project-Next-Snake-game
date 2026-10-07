# Performance Scenarios

Latency, payload size, concurrency and growth. All measurements come from
`RUN-2026-001` on the sandbox host (production build, demo storage, localhost).
Absolute numbers are machine-dependent — the *thresholds* and the *shape* of the
results are what the suite guards.

| ID | Scenario | Threshold | Measured (RUN-2026-001) | Test case |
| --- | --- | --- | --- | --- |
| SCN-109 | Home page responds quickly | p95 < 1 000 ms | avg 4.72 ms · p50 3.12 · p95 5.55 · max 41.83 ms (30 requests, 12 201 B; cached shell) | TC-100 |
| SCN-110 | Leaderboard reads are fast | p95 < 500 ms | avg 2.88 · p50 2.56 · p95 5.88 · max 8.05 ms (690 B) | TC-101 |
| SCN-111 | Recent-hunts reads are fast | p95 < 500 ms | avg 2.54 · p95 4.52 · max 5.09 ms (600 B) | TC-102 |
| SCN-112 | Score writes are fast | p95 < 500 ms | avg 2.75 · p95 3.65 · max 4.53 ms (209 B) | TC-103 |
| SCN-113 | The server handles a burst of parallel reads | 50 requests, 0 errors, < 5 s total | 50/50 OK in 120 ms (~417 req/s) | TC-104 |
| SCN-114 | Latency does not degrade as the board grows | last sample not > 3× the first | 5.71 ms → 3.17 ms across 25 writes (flat) | TC-105 |
| SCN-115 | Payload sizes stay small enough for mobile | leaderboard page < 10 KB with normal names | 690 B for a 5-row page; a 5 000-char name inflates it to ~5.6 KB (BUG-003) | TC-101, TC-079 |
| SCN-116 | The demo store does not leak memory across many writes | growth bounded by distinct names | bounded by distinct names (demo store keeps one row per name); RSS growth unmeasured | — (no case; see note) |

## What the numbers mean (and do not mean)

- **Absolute latency is not portable.** These are loopback measurements against a
  process that has already been warmed up. Treat 500 ms thresholds as *guards
  against regressions*, not as capacity claims.
- **The demo store is O(1)-ish per write** because it is an array of at most a few
  dozen rows; MongoDB behaviour with a large collection is unmeasured
  (`NOT_EXECUTED`).
- **No load-testing harness exists** (no k6/autocannon). The concurrency scenario
  (SCN-113) uses 50 parallel fetches, which finds gross blocking bugs but cannot
  model real traffic mixes.
- **Client-side performance is unmeasured.** No bundle-size or Lighthouse data was
  collected; `UNKNOWN / REQUIRES VALIDATION`.

## Reproducing

```bash
npm run build
npm run test:performance            # boots a server on :3100, then measures
HARNESS_PERF_SAMPLES=60 npm run test:performance   # tighter confidence intervals
```

Raw output: `harness/test-results/latest/performance-summary.json`, `harness/test-results/latest/performance.tap`
and the console transcript `harness/evidence/logs/performance-RUN-2026-001.spec.txt`.

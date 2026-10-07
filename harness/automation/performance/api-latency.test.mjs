/**
 * TC-100 … TC-105 — performance guardrails on the public HTTP surface.
 *
 * These are *regression guards*, not capacity claims: loopback numbers on one
 * host. They catch order-of-magnitude changes (a query that stops being cheap, a
 * payload that balloons) — the thresholds, not the absolute values, are the point.
 *
 * Machine-readable results: harness/test-results/latest/performance-summary.json
 * (written even when a guardrail fails, so reports can quote what was measured).
 *
 * Suite: performance (requires a running server)
 * Run:   npm run test:performance        # boots one on :3100
 */
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";

import { getJson, postJson, request, stats } from "../utilities/api-client.mjs";
import { HARNESS_ROOT, RUN_ID, environmentSummary, testName } from "../utilities/env.mjs";

const SAMPLES = Number(process.env.HARNESS_PERF_SAMPLES ?? 30);
const measurements = [];

process.on("exit", () => {
  const dir = `${HARNESS_ROOT}/test-results/latest`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    `${dir}/performance-summary.json`,
    `${JSON.stringify(
      {
        runId: RUN_ID,
        environment: environmentSummary(),
        generatedAt: new Date().toISOString(),
        samples: SAMPLES,
        measurements,
      },
      null,
      2,
    )}\n`,
  );
});

const accepted = (res) => res.status === 200 || res.status === 201;

test("TC-100 | the pre-rendered shell responds quickly", async (t) => {
  const durations = [];
  let bytes = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const res = await request("/");
    assert.equal(res.status, 200, "the shell must always be served");
    durations.push(res.durationMs);
    bytes = res.text.length;
  }
  const s = stats(durations);
  measurements.push({ label: "GET /", ...s, avgBytes: bytes });
  t.diagnostic(`GET /  p50=${s.p50Ms}ms p95=${s.p95Ms}ms bytes=${bytes}`);
  assert.ok(s.p95Ms < 1000, `p95 ${s.p95Ms} ms must stay under 1 s`);
  assert.ok(bytes > 5000 && bytes < 250_000, `shell size ${bytes} B must stay in a sane range`);
});

test("TC-101 | leaderboard reads stay in the single-digit-millisecond range", async (t) => {
  const durations = [];
  let bytes = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const res = await getJson("/api/snakeGame/highestScore?page=1&limit=5");
    assert.equal(res.status, 200, "the read path must stay up");
    durations.push(res.durationMs);
    bytes = res.text.length;
  }
  const s = stats(durations);
  measurements.push({ label: "highestScore", ...s, avgBytes: bytes });
  t.diagnostic(`highestScore p50=${s.p50Ms}ms p95=${s.p95Ms}ms bytes=${bytes}`);
  assert.ok(s.p95Ms < 500, `p95 ${s.p95Ms} ms must stay under 500 ms`);
});

test("TC-102 | recent hunts reads stay fast as well", async (t) => {
  const durations = [];
  let bytes = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const res = await getJson("/api/snakeGame/latestScore");
    assert.equal(res.status, 200, "the recent-hunts path must stay up");
    durations.push(res.durationMs);
    bytes = res.text.length;
  }
  const s = stats(durations);
  measurements.push({ label: "latestScore", ...s, avgBytes: bytes });
  t.diagnostic(`latestScore p50=${s.p50Ms}ms p95=${s.p95Ms}ms bytes=${bytes}`);
  assert.ok(s.p95Ms < 500, `p95 ${s.p95Ms} ms must stay under 500 ms`);
});

test("TC-103 | score writes stay fast under repeated use", async (t) => {
  const name = testName("PerfWrite");
  const durations = [];
  let bytes = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const res = await postJson("/api/snakeGame/addScore", { name, score: i + 1 });
    assert.ok(accepted(res), `write ${i} returned ${res.status}`);
    durations.push(res.durationMs);
    bytes = res.text.length;
  }
  const s = stats(durations);
  measurements.push({ label: "addScore", ...s, avgBytes: bytes });
  t.diagnostic(`addScore p50=${s.p50Ms}ms p95=${s.p95Ms}ms bytes=${bytes}`);
  assert.ok(s.p95Ms < 500, `p95 ${s.p95Ms} ms must stay under 500 ms`);
});

test("TC-104 | the server survives a 50-request concurrent burst on the read path", async (t) => {
  const started = performance.now();
  const results = await Promise.all(
    Array.from({ length: 50 }, () => getJson("/api/snakeGame/highestScore?page=1&limit=10")),
  );
  const wallMs = Math.round(performance.now() - started);
  const ok = results.filter((r) => r.status === 200).length;
  measurements.push({ label: "burst 50 concurrent reads", ok, total: 50, wallMs });
  t.diagnostic(`burst: ${ok}/50 ok in ${wallMs}ms (~${Math.round(50 / (wallMs / 1000))} req/s)`);
  assert.equal(ok, 50, "every concurrent read must succeed");
  assert.ok(wallMs < 5000, `the burst took ${wallMs} ms — far beyond the 5 s guard`);
});

test("TC-105 | write latency does not degrade as the demo board grows", async (t) => {
  const first = await postJson("/api/snakeGame/addScore", { name: testName("GrowthFirst"), score: 1 });
  assert.ok(accepted(first), `first write returned ${first.status}`);
  for (let i = 0; i < 24; i++) {
    const res = await postJson("/api/snakeGame/addScore", { name: testName(`Growth${i}`), score: i + 1 });
    assert.ok(accepted(res), `growth write ${i} returned ${res.status}`);
  }
  const last = await postJson("/api/snakeGame/addScore", { name: testName("GrowthLast"), score: 30 });
  assert.ok(accepted(last), `last write returned ${last.status}`);

  measurements.push({
    label: "write latency first vs last",
    firstMs: Number(first.durationMs.toFixed(2)),
    lastMs: Number(last.durationMs.toFixed(2)),
  });
  t.diagnostic(`first=${first.durationMs.toFixed(2)}ms last=${last.durationMs.toFixed(2)}ms`);
  assert.ok(last.durationMs < 500, `write took ${last.durationMs.toFixed(1)} ms after 25 inserts`);
});

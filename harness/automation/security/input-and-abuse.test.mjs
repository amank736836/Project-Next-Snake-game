/**
 * TC-116 … TC-121 — input handling and abuse resistance of the write endpoint.
 *
 * Suite: security (requires a running server)
 * Run:   npm run test:security
 */
import test from "node:test";
import assert from "node:assert/strict";

import { postJson, postRaw, request } from "../utilities/api-client.mjs";
import { tagName } from "../utilities/fixtures.mjs";

test("TC-116 | a script payload is stored as inert data and echoed as JSON", async () => {
  const name = `<script>alert(1)</script>${Date.now().toString(36)}`;
  const res = await postJson("/api/snakeGame/addScore", { name, score: 4 });
  assert.equal(res.status, 201);
  assert.match(res.headers["content-type"] ?? "", /application\/json/, "the payload is not reflected as HTML");

  const board = await request("/api/snakeGame/highestScore?page=1&limit=100");
  const stored = board.json.scores.find((s) => s.name === name);
  assert.ok(stored, "documented: the raw name round-trips through storage — see BUG-003");
  assert.equal(typeof stored.name, "string");
});

test("TC-117 | SQL/NoSQL-shaped input cannot change query behaviour in demo mode", async () => {
  const probe = `InjectionProbe${Date.now().toString(36)}`;
  await postJson("/api/snakeGame/addScore", { name: probe, score: { $ne: 1 } });
  const board = await request("/api/snakeGame/highestScore?page=1&limit=100");
  assert.equal(board.status, 200, "the object score must not break the leaderboard query");
  assert.ok(Array.isArray(board.json.scores));
});

test("TC-118 | a leading-$ page parameter cannot be turned into a query operator", async () => {
  const res = await request("/api/snakeGame/highestScore?page[$ne]=1&limit=5");
  assert.equal(res.status, 200, "query strings are passed through parseInt, so no operator reaches MongoDB");
  assert.ok(Array.isArray(res.json.scores));
});

/** Beats whatever is currently on the board, so the assertion is deterministic. */
const unbeatableScore = async () => {
  const top = await request("/api/snakeGame/highestScore?page=1&limit=1");
  return Number(top.json.scores[0]?.highestScore ?? top.json.scores[0]?.score ?? 0) + 1;
};

test(
  "TC-119 | KNOWN ISSUE (BUG-016): scores are unauthenticated and unverifiable",
  { todo: "BUG-016 — any client can post an arbitrary score; consider signed submissions or server-side validation" },
  async () => {
    const name = tagName("TopForge"); // deliberately free of foul-word substrings, so the filter cannot interfere
    const forgedScore = await unbeatableScore();
    await postJson("/api/snakeGame/addScore", { name, score: forgedScore });
    const board = await request("/api/snakeGame/highestScore?page=1&limit=5");
    assert.ok(
      !board.json.scores.some((row) => row.name === name && Number(row.highestScore ?? row.score) === forgedScore),
      "expected: implausible scores are rejected",
    );
  },
);

test("TC-119b | characterisation: a forged top score is accepted today", async () => {
  const name = tagName("RankForge"); // deliberately free of foul-word substrings
  const forgedScore = await unbeatableScore();
  const res = await postJson("/api/snakeGame/addScore", { name, score: forgedScore });
  assert.equal(res.status, 201);

  const board = await request("/api/snakeGame/highestScore?page=1&limit=1");
  assert.equal(board.json.scores[0].name, name, "documented: a forged score takes rank 1 (see BUG-016)");
  assert.equal(Number(board.json.scores[0].highestScore ?? board.json.scores[0].score), forgedScore);
});

test(
  "TC-120 | KNOWN ISSUE (BUG-013): no rate limiting on the write endpoint",
  { todo: "BUG-013 — 50 rapid submissions all succeed; add a rate limit at the edge" },
  async () => {
    const statuses = [];
    for (let i = 0; i < 50; i++) {
      statuses.push((await postJson("/api/snakeGame/addScore", { name: tagName("Flood"), score: 1 })).status);
    }
    assert.ok(statuses.includes(429), "expected at least one 429 after flooding the endpoint");
  },
);

test("TC-120b | characterisation: the flood above is accepted (documented)", async (t) => {
  const started = performance.now();
  const statuses = [];
  for (let i = 0; i < 25; i++) {
    statuses.push((await postJson("/api/snakeGame/addScore", { name: tagName("FloodShort"), score: 1 })).status);
  }
  t.diagnostic(`25 rapid writes in ${(performance.now() - started).toFixed(0)}ms, statuses: ${[...new Set(statuses)].join("/")}`);
  assert.deepEqual([...new Set(statuses)], [201], "documented: every write is accepted (see BUG-013)");
});

test("TC-121 | oversized and hostile payloads never crash the process", async () => {
  await postRaw("/api/snakeGame/addScore", "{".repeat(50_000));
  await postRaw("/api/snakeGame/addScore", JSON.stringify({ name: "\u0000\u0001", score: -0 }));
  const health = await request("/api/snakeGame/highestScore");
  assert.equal(health.status, 200, "the server stays available after malformed input");
});

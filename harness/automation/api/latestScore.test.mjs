/**
 * TC-080 … TC-083 — GET /api/snakeGame/latestScore
 *
 * Suite: api (requires a running server)
 * Run:   npm run test:api
 */
import test from "node:test";
import assert from "node:assert/strict";

import { getJson, postJson } from "../utilities/api-client.mjs";
import { tagName } from "../utilities/fixtures.mjs";

const latest = async () => (await getJson("/api/snakeGame/latestScore")).json;

test("TC-080 | returns a plain JSON array, capped at five entries", async () => {
  const res = await getJson("/api/snakeGame/latestScore");
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.json), "the response body must be an array");
  assert.ok(res.json.length <= 5, "at most five recent hunts");
});

test("TC-081 | the most recently updated player is returned first", async () => {
  const name = tagName("MostRecent");
  await postJson("/api/snakeGame/addScore", { name, score: 11 });
  const rows = await latest();
  assert.equal(rows[0].name, name, "the newest submission leads the recent list");
  assert.equal(rows[0].latestScore ?? rows[0].score, 11);
});

test("TC-082 | ordering follows recency, not score", async () => {
  const low = tagName("RecentLow");
  const high = tagName("RecentHigh");
  await postJson("/api/snakeGame/addScore", { name: high, score: 99 });
  await postJson("/api/snakeGame/addScore", { name: low, score: 1 });
  const rows = await latest();
  const names = rows.map((row) => row.name);
  assert.ok(names.indexOf(low) < names.indexOf(high), "the later submission must rank higher regardless of value");
});

test("TC-083 | zero-score rows are excluded from recent hunts", async () => {
  const name = tagName("RecentZero");
  await postJson("/api/snakeGame/addScore", { name, score: 0 });
  const rows = await latest();
  assert.equal(rows.some((row) => row.name === name), false);
});

test("TC-083b | every row carries the fields the UI renders", async () => {
  await postJson("/api/snakeGame/addScore", { name: tagName("FieldShape"), score: 5 });
  const rows = await latest();
  for (const row of rows) {
    assert.equal(typeof row.name, "string");
    assert.ok("score" in row || "latestScore" in row, `row for ${row.name} has no score field`);
  }
});

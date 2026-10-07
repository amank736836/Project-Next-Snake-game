/**
 * TC-130 … TC-132 — behaviour when DATABASE_URL is configured but unreachable.
 *
 * Requires a second server started with a bogus connection string:
 *   PORT=3101 DATABASE_URL='mongodb://127.0.0.1:27099/nagini_test?serverSelectionTimeoutMS=1500&connectTimeoutMS=1500' npm start
 * (see harness/automation/scripts/run-database.sh, which starts it for you).
 *
 * Suite: database
 * Run:   npm run test:database
 */
import test from "node:test";
import assert from "node:assert/strict";

import { request, getJson, postJson, fetchLatest, fetchHighest } from "../utilities/api-client.mjs";
import { DB_MODE_BASE_URL } from "../utilities/env.mjs";

const ENDPOINTS = [
  ["GET", "/api/snakeGame/highestScore"],
  ["GET", "/api/snakeGame/latestScore"],
  ["POST", "/api/snakeGame/addScore"],
];

test("TC-130 | every endpoint reports the connection failure instead of hanging", async (t) => {
  for (const [method, path] of ENDPOINTS) {
    const res = method === "GET" ? await getJson(path, { base: DB_MODE_BASE_URL }) : await postJson(path, { name: "DbProbe", score: 1 }, { base: DB_MODE_BASE_URL });
    assert.equal(res.status, 400, `${method} ${path} returned ${res.status}`);
    assert.equal(typeof res.json.message, "string");
    t.diagnostic(`${method} ${path} → ${res.status} "${res.json.message}" in ${res.durationMs.toFixed(0)}ms`);
  }
});

test("TC-131 | a failed connection is cached, so subsequent calls fail fast", async (t) => {
  const first = await fetchHighest(1, 5, { base: DB_MODE_BASE_URL });
  const second = await fetchHighest(1, 5, { base: DB_MODE_BASE_URL });
  t.diagnostic(`first=${first.durationMs.toFixed(0)}ms second=${second.durationMs.toFixed(0)}ms`);
  assert.equal(second.status, 400);
  assert.ok(second.durationMs <= first.durationMs + 50, "the retry must not repeat the full connect timeout");
});

test(
  "TC-131b | KNOWN ISSUE (BUG-017): a rejected connection promise is cached forever (no recovery without restart)",
  { todo: "BUG-017 — db.ts caches the rejected promise; the process never reconnects after a transient outage" },
  async () => {
    const { json } = await fetchLatest({ base: DB_MODE_BASE_URL });
    assert.equal(json.demo, true, "expected: the server falls back to the in-memory board instead of failing forever");
  },
);

test("TC-132 | the front end is not broken by an unreachable database: the API still answers JSON", async () => {
  const res = await request("/api/snakeGame/highestScore", { base: DB_MODE_BASE_URL });
  assert.match(res.headers["content-type"] ?? "", /application\/json/, "the UI's fetch().json() path stays valid");
});

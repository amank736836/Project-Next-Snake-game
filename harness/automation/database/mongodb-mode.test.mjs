/**
 * TC-133 … TC-137 — MongoDB mode (real persistence).
 *
 * STATUS: NOT_EXECUTED in this environment — no MongoDB instance is reachable
 * (no mongod binary, no docker, no external cluster). The suite is written so it
 * activates unchanged once a database is available:
 *
 *   HARNESS_MONGODB_URL="mongodb://127.0.0.1:27017/nagini_test" npm run test:database
 *
 * (The runner starts the database-backed server on :3101 and points
 *  HARNESS_DB_BASE_URL at it; these tests never touch the demo server.)
 *
 * Everything here is black-box (HTTP only) so it also works against a staging
 * deployment.
 *
 * Suite: database
 * Run:   npm run test:database
 */
import test from "node:test";
import assert from "node:assert/strict";

import { getJson, postJson } from "../utilities/api-client.mjs";
import { DB_MODE_BASE_URL, RUN_TAG } from "../utilities/env.mjs";

const READY = process.env.HARNESS_MONGODB_READY === "1";
const skip = READY ? false : `NOT_EXECUTED: no MongoDB available — set HARNESS_MONGODB_URL and re-run npm run test:database. Target: ${DB_MODE_BASE_URL}`;
const name = (label) => `${label}${RUN_TAG}`.slice(0, 20);

// Every call in this file targets the database-backed server, never the demo one.
const post = (path, body) => postJson(path, body, { base: DB_MODE_BASE_URL });
const get = (path) => getJson(path, { base: DB_MODE_BASE_URL });

const storedRow = async (playerName) => {
  const res = await get("/api/snakeGame/highestScore?page=1&limit=100");
  return res.json.scores.find((row) => row.name === playerName);
};

test("TC-133 | a first-time player is persisted and readable", { skip }, async () => {
  const player = name("DbNew");
  const created = await post("/api/snakeGame/addScore", { name: player, score: 8 });
  assert.equal(created.status, 201);
  const row = await storedRow(player);
  assert.ok(row, "the document must be written to MongoDB");
  assert.equal(row.highestScore, 8);
});

test("TC-134 | a repeat player updates the existing document instead of inserting", { skip }, async () => {
  const player = name("DbRepeat");
  await post("/api/snakeGame/addScore", { name: player, score: 5 });
  await post("/api/snakeGame/addScore", { name: player, score: 11 });
  const res = await get("/api/snakeGame/highestScore?page=1&limit=100");
  const rows = res.json.scores.filter((row) => row.name === player);
  assert.equal(rows.length, 1, "one document per player");
  assert.equal(rows[0].highestScore, 11);
  assert.equal(rows[0].latestScore, 11);
  assert.ok(rows[0].visits >= 2, "visits counter is persisted");
});

test(
  "TC-135 | concurrent first-time writes must not fork a player into duplicates",
  { skip, todo: "UNKNOWN / REQUIRES VALIDATION: the route does findOne + save without an atomic upsert or unique index" },
  async () => {
    const player = name("DbRace");
    await Promise.all(Array.from({ length: 10 }, () => post("/api/snakeGame/addScore", { name: player, score: 1 })));
    const res = await get("/api/snakeGame/highestScore?page=1&limit=100");
    const rows = res.json.scores.filter((row) => row.name === player);
    assert.equal(rows.length, 1, "a unique index on name (or an atomic upsert) is required");
  },
);

test("TC-136 | documents expose the timestamps the UI relies on", { skip }, async () => {
  const player = name("DbStamp");
  await post("/api/snakeGame/addScore", { name: player, score: 3 });
  const row = await storedRow(player);
  assert.ok(row.createdAt && row.updatedAt, "mongoose timestamps must be enabled on the Score schema");
});

test("TC-137 | ordering and pagination match the documented contract in MongoDB mode", { skip }, async () => {
  const res = await get("/api/snakeGame/highestScore?page=1&limit=5");
  const values = res.json.scores.map((row) => Number(row.highestScore ?? row.score));
  assert.deepEqual(values, [...values].sort((a, b) => b - a));
  assert.equal(res.json.pagination.page, 1);
  assert.equal(res.json.pagination.limit, 5);
  assert.equal(res.json.demo, undefined, "no demo chip when the database answers");
});

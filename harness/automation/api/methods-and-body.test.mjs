/**
 * TC-084 … TC-089 — HTTP semantics: methods, content types, payload limits.
 *
 * Suite: api (requires a running server)
 * Run:   npm run test:api
 */
import test from "node:test";
import assert from "node:assert/strict";

import { request, postJson, postRaw } from "../utilities/api-client.mjs";


test("TC-084 | each endpoint only accepts its documented method", async () => {
  const addScoreGet = await request("/api/snakeGame/addScore");
  const highestDelete = await request("/api/snakeGame/highestScore", { method: "DELETE" });
  const latestPut = await request("/api/snakeGame/latestScore", { method: "PUT" });
  assert.equal(addScoreGet.status, 405);
  assert.equal(highestDelete.status, 405);
  assert.equal(latestPut.status, 405);
});

test("TC-085 | OPTIONS advertises the allowed methods for the write endpoint", async () => {
  const res = await request("/api/snakeGame/addScore", { method: "OPTIONS" });
  assert.equal(res.status, 204);
  assert.match(res.headers.allow ?? "", /POST/);
});

test("TC-086 | HEAD on the page and the API succeeds without a body", async () => {
  const page = await request("/", { method: "HEAD" });
  const api = await request("/api/snakeGame/highestScore", { method: "HEAD" });
  assert.equal(page.status, 200);
  assert.ok([200, 204, 405].includes(api.status), `unexpected API HEAD status ${api.status}`);
});

test("TC-087 | a JSON content type is not required to parse the body", async () => {
  const res = await request("/api/snakeGame/addScore", {
    method: "POST",
    body: JSON.stringify({ name: `NoContentType${Date.now().toString(36)}`, score: 1 }),
  });
  assert.equal(res.status, 201, "documented: the route parses the body regardless of headers — see BUG-013");
});

test("TC-088 | unknown routes answer 404 without leaking internals", async () => {
  for (const path of ["/does-not-exist", "/api/nope", "/robots.txt", "/.env", "/.env.local", "/api/.env"]) {
    const res = await request(path);
    assert.equal(res.status, 404, `${path} must not be served`);
    assert.doesNotMatch(res.text, /mongodb(\+srv)?:\/\//, `${path} must not leak connection strings`);
  }
});

test("TC-089 | KNOWN ISSUE (BUG-013): there is no payload size or rate limit", { todo: "BUG-013 — no body cap and no rate limiting on addScore" }, async () => {
  const huge = JSON.stringify({ name: "BigPayload", score: 1, pad: "x".repeat(1_200_000) });
  const res = await postRaw("/api/snakeGame/addScore", huge);
  assert.ok([413, 400, 429].includes(res.status), `expected a size/rate rejection, got ${res.status}`);
});

test("TC-089b | characterisation: a 1.2 MB body is accepted (documented)", async () => {
  const res = await postRaw("/api/snakeGame/addScore", JSON.stringify({ name: "BigPayloadChar", score: 1, pad: "x".repeat(1_200_000) }));
  assert.equal(res.status, 201, "documented: unbounded request bodies are processed");
  assert.ok(res.durationMs < 5000, "the oversized body still returns quickly");
});

test("TC-089c | concurrent submissions of one player do not fork the row", async () => {
  const name = `RaceProbe${Date.now().toString(36)}`;
  const results = await Promise.all(Array.from({ length: 10 }, () => postJson("/api/snakeGame/addScore", { name, score: 1 })));
  assert.ok(results.every((r) => r.status === 201));

  const board = await request("/api/snakeGame/highestScore?page=1&limit=100");
  const rows = board.json.scores.filter((s) => s.name === name);
  assert.equal(rows.length, 1, "in-memory mode must not duplicate concurrent writes");
  assert.ok(rows[0].visits >= 10, "every concurrent write is counted");
});

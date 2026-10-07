/**
 * TC-056 … TC-069 — POST /api/snakeGame/addScore
 *
 * Black-box HTTP contract tests against a running server. They never touch the
 * database directly, so they behave identically in demo mode and in MongoDB mode.
 *
 * Suite: api (requires a running server — see automation/README.md)
 * Run:   npm run test:api
 */
import test from "node:test";
import assert from "node:assert/strict";

import { postJson, postRaw, fetchHighest } from "../utilities/api-client.mjs";
import { tagName, loadFixture } from "../utilities/fixtures.mjs";

const valid = loadFixture("valid/valid-scores.json").submissions;
const invalid = loadFixture("invalid/invalid-scores.json").submissions;
const edge = loadFixture("edge-cases/edge-case-scores.json").submissions;
const edgeCase = (name) => edge.find((entry) => entry.case.startsWith(name));

/** One case from invalid-scores.json (the single source of truth for rejections). */
const invalidCase = (caseName) => {
  const subject = invalid.find((entry) => entry.case === caseName);
  assert.ok(subject, `invalid-scores.json must define the case "${caseName}"`);
  return subject;
};

/** Sends the fixture payload byte-for-byte when it is a string, otherwise as JSON. */
const submitInvalid = (subject) =>
  typeof subject.raw === "string"
    ? postRaw("/api/snakeGame/addScore", subject.raw)
    : postJson("/api/snakeGame/addScore", subject.raw);

test("TC-056 | a standard submission is accepted with 201 and stored verbatim", async () => {
  const entry = valid[0];
  const name = tagName(entry.payload.name);
  const res = await postJson("/api/snakeGame/addScore", { name, score: entry.payload.score });

  assert.equal(res.status, 201);
  assert.match(res.json.message, /Score added\/updated successfully/);
  const board = await fetchHighest(1, 100);
  const stored = board.json.scores.find((s) => s.name === name);
  assert.ok(stored, `${name} must appear on the leaderboard`);
  assert.deepEqual(
    { score: stored.score, highestScore: stored.highestScore, latestScore: stored.latestScore },
    { score: entry.payload.score, highestScore: entry.expectStored.highestScore, latestScore: entry.expectStored.latestScore },
  );
});

test("TC-057 | a lower follow-up run keeps the best score and refreshes the latest", async () => {
  const name = tagName("MergePlayer");
  await postJson("/api/snakeGame/addScore", { name, score: 12 });
  await postJson("/api/snakeGame/addScore", { name, score: 4 });

  const board = await fetchHighest(1, 100);
  const stored = board.json.scores.find((s) => s.name === name);
  assert.equal(stored.highestScore, 12, "the best score never regresses");
  assert.equal(stored.latestScore, 4, "the latest score tracks the newest run");
  assert.ok(stored.visits >= 2, "repeat visits are counted");
});

test("TC-058 | an equal follow-up run does not create a duplicate row", async () => {
  const name = tagName("DedupPlayer");
  await postJson("/api/snakeGame/addScore", { name, score: 6 });
  await postJson("/api/snakeGame/addScore", { name, score: 6 });
  const board = await fetchHighest(1, 100);
  assert.equal(board.json.scores.filter((s) => s.name === name).length, 1);
});

test("TC-059 | the response advertises demo mode when no database is configured", async () => {
  const res = await postJson("/api/snakeGame/addScore", { name: tagName("DemoProbe"), score: 1 });
  const board = await fetchHighest(1, 5);
  const demoFlags = [res.json.demo, board.json.demo].filter((flag) => flag !== undefined);
  assert.ok(demoFlags.length > 0, "at least one response reports the storage mode");
  assert.ok(demoFlags.every((flag) => flag === true) || demoFlags.every((flag) => flag === false),
    "the API must not report demo mode inconsistently between calls");
});

test("TC-060 | a blocked name is renamed to Anonymous", async () => {
  const res = await postJson("/api/snakeGame/addScore", { name: "fuck", score: 3 });
  assert.equal(res.status, 201);
  assert.equal(res.json.score.name, "Anonymous");
});

test("TC-060b | characterisation: a legitimate name containing a blocked substring is anonymised", async () => {
  const res = await postJson("/api/snakeGame/addScore", { name: "Hancock", score: 8 });
  assert.equal(res.status, 201);
  assert.equal(res.json.score.name, "Anonymous",
    "documented false positive: 'hancock' contains 'cock' — see BUG-002");
});

test("TC-060c | KNOWN ISSUE (BUG-004): different blocked names merge into one shared record",
  { todo: "BUG-004 — every sanitised submission collapses into the single player 'Anonymous'" },
  async () => {
    const before = (await fetchHighest(1, 100)).json.scores.find((s) => s.name === "Anonymous");
    await postJson("/api/snakeGame/addScore", { name: "shit", score: 40 });
    await postJson("/api/snakeGame/addScore", { name: "bitch", score: 5 });
    const after = (await fetchHighest(1, 100)).json.scores.find((s) => s.name === "Anonymous");
    assert.equal(
      (after?.visits ?? 0) - (before?.visits ?? 0) <= 1,
      true,
      "expected: two different players must not share one leaderboard row",
    );
  });

test("TC-060d | characterisation: unrelated runs are merged under 'Anonymous' today", async () => {
  await postJson("/api/snakeGame/addScore", { name: "wanker", score: 7 });
  await postJson("/api/snakeGame/addScore", { name: "moron", score: 3 });
  const board = (await fetchHighest(1, 100)).json;
  const anon = board.scores.filter((s) => s.name === "Anonymous");
  assert.equal(anon.length, 1, "documented: one shared row for all blocked names (see BUG-004)");
  assert.ok(anon[0].visits >= 2, "documented: unrelated players inflate the same visit counter");
});

test("TC-061 | a missing name is rejected with 400", async () => {
  const subject = invalidCase("missing name");
  const res = await submitInvalid(subject);
  assert.equal(res.status, subject.expectStatus, "the API must not accept a nameless score");
});

test("TC-062 | an empty JSON object is rejected with 400", async () => {
  const subject = invalidCase("empty JSON object");
  const res = await submitInvalid(subject);
  assert.equal(res.status, subject.expectStatus);
});

test("TC-063 | malformed JSON is rejected with 400 and a JSON error body", async () => {
  const res = await submitInvalid(invalidCase("malformed JSON body"));
  assert.equal(res.status, 400);
  assert.equal(typeof res.json.message, "string");
});

test("TC-064 | an empty body is rejected with 400", async () => {
  const res = await submitInvalid(invalidCase("empty body"));
  assert.equal(res.status, 400);
});

test("TC-065 | a JSON array is rejected with 400", async () => {
  const res = await submitInvalid(invalidCase("JSON array instead of object"));
  assert.equal(res.status, 400);
});

test("TC-066 | a non-string name is rejected with 400", async () => {
  const res = await submitInvalid(invalidCase("name of wrong type (number)"));
  assert.equal(res.status, 400);
});

test("TC-067 | KNOWN ISSUE (BUG-001): a missing score is accepted as 201", { todo: "BUG-001 — the API must reject submissions without a numeric score" }, async () => {
  const subject = edgeCase("score omitted");
  const res = await postJson("/api/snakeGame/addScore", { name: tagName("NoScore"), score: undefined });
  assert.equal(res.status, subject.expectedStatus, `expected ${subject.expectedStatus} (${subject.bug})`);
});

test("TC-068 | KNOWN ISSUE (BUG-001): non-numeric scores are stored verbatim", { todo: "BUG-001 — string/object scores must be rejected" }, async () => {
  for (const subject of [edgeCase("score sent as string"), edgeCase("score sent as object")]) {
    const res = await postJson("/api/snakeGame/addScore", { name: tagName("BadScore"), score: subject.raw.score });
    assert.equal(res.status, subject.expectedStatus, `expected ${subject.expectedStatus} for ${subject.case} (${subject.bug})`);
  }
});

test("TC-069 | KNOWN ISSUE (BUG-003): the API accepts names the UI would never allow", { todo: "BUG-003 — enforce the 20-char [a-zA-Z0-9 ] rule server-side" }, async () => {
  for (const subject of [edgeCase("empty name"), edgeCase("whitespace-only name"), edgeCase("5000 character name")]) {
    const name = subject.case.includes("5000") ? "A".repeat(5000) : subject.raw.name;
    const res = await postJson("/api/snakeGame/addScore", { name, score: 1 });
    assert.equal(res.status, subject.expectedStatus, `expected ${subject.expectedStatus} for ${subject.case} (${subject.bug})`);
  }
});

test("TC-069b | today's documented behaviour for the same inputs (characterisation)", async () => {
  const emptyName = await postJson("/api/snakeGame/addScore", { name: "", score: 1 });
  const spacesName = await postJson("/api/snakeGame/addScore", { name: "   ", score: 1 });
  const longName = await postJson("/api/snakeGame/addScore", { name: "B".repeat(5000), score: 1 });
  const missingScore = await postJson("/api/snakeGame/addScore", { name: tagName("NoScoreChar"), score: undefined });

  assert.equal(emptyName.status, 201, "documented: empty names are stored");
  assert.equal(spacesName.status, 201, "documented: whitespace names are stored untrimmed");
  assert.equal(longName.status, 201, "documented: there is no server-side length limit");
  assert.equal(missingScore.status, 201, "documented: a missing score still creates a row (BUG-001)");
});

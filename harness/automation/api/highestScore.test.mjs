/**
 * TC-070 … TC-079 — GET /api/snakeGame/highestScore
 *
 * Covers ordering, pagination maths, the score>0 filter and the known
 * validation gaps around page/limit parsing.
 *
 * Suite: api (requires a running server)
 * Run:   npm run test:api
 */
import test from "node:test";
import assert from "node:assert/strict";

import { getJson, postJson } from "../utilities/api-client.mjs";
import { tagName, loadFixture } from "../utilities/fixtures.mjs";

const seed = loadFixture("fixtures/leaderboard-seed.json");

/** Submits the deterministic seed dataset once per run and returns its names. */
const submitSeed = async () => {
  const submitted = [];
  for (const entry of seed.seed) {
    const name = tagName(entry.name);
    if (entry.name === "SeedRepeatA" && submitted.filter((n) => n.startsWith(name)).length === 1) {
      submitted.push(name); // keep both writes on the same generated name
    } else {
      submitted.push(name);
    }
    await postJson("/api/snakeGame/addScore", { name, score: entry.score });
  }
  return submitted;
};

const board = async (query = "") => (await getJson(`/api/snakeGame/highestScore${query}`)).json;

let seeded;
test("TC-070 | returns a page of scores with pagination metadata", async () => {
  seeded = await submitSeed();
  const data = await board("?page=1&limit=5");
  assert.ok(Array.isArray(data.scores));
  assert.equal(data.pagination.page, 1);
  assert.equal(data.pagination.limit, 5);
  assert.ok(data.pagination.total >= seed.seed.length, "every seeded player is counted");
  assert.equal(data.pagination.totalPages, Math.max(1, Math.ceil(data.pagination.total / 5)));
  assert.ok(data.scores.length <= 5, "never returns more than one page");
});

test("TC-071 | default pagination is page 1 with five rows", async () => {
  const data = await board();
  assert.equal(data.pagination.page, 1);
  assert.equal(data.pagination.limit, 5);
  assert.equal(data.scores.length, Math.min(5, data.pagination.total));
});

test("TC-072 | rows are ordered by best score, descending", async () => {
  const data = await board("?page=1&limit=100");
  const values = data.scores.map((s) => Number(s.highestScore ?? s.score));
  assert.deepEqual(values, [...values].sort((a, b) => b - a), "leaderboard must be sorted by best score");
});

test("TC-073 | a repeat player keeps their best score and appears once", async () => {
  const repeatName = seeded.filter((name) => name.startsWith("SeedRepeatA")).at(-1);
  const data = await board("?page=1&limit=100");
  const rows = data.scores.filter((s) => s.name === repeatName);
  assert.equal(rows.length, 1, "one row per player");
  assert.equal(rows[0].highestScore, seed.expectations.SeedRepeatA.highestScore);
  assert.equal(rows[0].latestScore, seed.expectations.SeedRepeatA.latestScore);
});

test("TC-074 | players whose only score is zero never appear", async () => {
  const hiddenName = seeded.filter((name) => name.startsWith("SeedHidden")).at(-1);
  const data = await board("?page=1&limit=100");
  assert.equal(data.scores.some((s) => s.name === hiddenName), false);
});

test("TC-075 | page 2 returns the next slice without overlapping page 1", async () => {
  const [first, second] = [await board("?page=1&limit=5"), await board("?page=2&limit=5")];
  const overlap = first.scores.filter((a) => second.scores.some((b) => b.name === a.name && b.updatedAt === a.updatedAt));
  assert.deepEqual(overlap, [], "consecutive pages must not repeat rows");
  assert.equal(second.pagination.page, 2);
});

test("TC-076 | a page beyond the end returns an empty list, not an error", async () => {
  const data = await board("?page=999&limit=5");
  assert.equal(data.pagination.page, 999);
  assert.deepEqual(data.scores, []);
});

test("TC-077 | the limit parameter is honoured", async () => {
  const data = await board("?page=1&limit=2");
  assert.equal(data.scores.length, Math.min(2, data.pagination.total));
  assert.equal(data.pagination.limit, 2);
});

test(
  "TC-078 | KNOWN ISSUE (BUG-005): a non-numeric page is echoed back as null instead of being rejected",
  { todo: "BUG-005 — parseInt() results are used without validation" },
  async () => {
    const data = await board("?page=abc&limit=5");
    assert.equal(data.pagination.page, 1, "expected: invalid input falls back to page 1 (or 400)");
  },
);

test("TC-078b | characterisation: invalid page/limit values in today's build", async () => {
  const badPage = await board("?page=abc&limit=5");
  const zeroPage = await board("?page=0&limit=5");
  const badLimit = await board("?page=1&limit=abc");
  const zeroLimit = await board("?page=1&limit=0");
  const negativeLimit = await board("?page=1&limit=-3");

  assert.equal(badPage.pagination.page, null, "documented: NaN serialises to null");
  assert.deepEqual(badPage.scores, [], "documented: a NaN window returns nothing");
  assert.equal(zeroPage.pagination.page, 0);
  assert.equal(badLimit.pagination.limit, null);
  assert.equal(badLimit.pagination.totalPages, null, "documented: totalPages is NaN for a NaN limit");
  assert.equal(zeroLimit.pagination.totalPages, null, "documented: limit=0 divides by zero");
  assert.equal(negativeLimit.status ?? 200, 200);
});

test("TC-079 | a very large limit is not capped (documented behaviour, abuse vector)", async () => {
  const data = await board("?page=1&limit=100000");
  assert.equal(data.pagination.limit, 100000, "documented: the whole board can be requested in one call — see BUG-012");
  assert.ok(Array.isArray(data.scores));
});

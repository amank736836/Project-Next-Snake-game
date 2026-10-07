/**
 * TC-013 … TC-024 — in-memory score store (`src/lib/memoryScores.ts`)
 *
 * This store backs the API whenever DATABASE_URL is not configured
 * ("demo mode"). Development runs are seeded with six demo players.
 *
 * Suite: unit · no browser, no server required.
 * Run:   npm run test:unit
 */
import test from "node:test";
import assert from "node:assert/strict";

import { memoryDb, listHighest, listLatest, upsertScore } from "../../../src/lib/memoryScores.ts";

const reset = () => {
  memoryDb.scores.length = 0;
};

test("TC-013 | a development process is seeded with six demo players", () => {
  const names = memoryDb.scores.map((s) => s.name);
  assert.equal(memoryDb.scores.length, 6);
  assert.deepEqual(names.slice(0, 3), ["Nagini", "Tom Riddle", "Hermione"]);
});

test("TC-014 | listHighest sorts by highest score, descending", () => {
  const { scores, total } = listHighest(1, 10);
  assert.equal(total, 6);
  const values = scores.map((s) => s.highestScore ?? s.score);
  assert.deepEqual(values, [...values].sort((a, b) => b - a));
  assert.equal(scores[0].name, "Nagini");
  assert.equal(scores[0].highestScore, 42);
});

test("TC-015 | listHighest paginates with a 5-per-page window by default", () => {
  const page1 = listHighest(1, 5);
  const page2 = listHighest(2, 5);
  assert.equal(page1.scores.length, 5);
  assert.equal(page1.total, 6);
  assert.equal(page2.scores.length, 1);
  const overlap = page1.scores.filter((s) => page2.scores.some((p) => p.name === s.name));
  assert.deepEqual(overlap, [], "pages must not overlap");
});

test("TC-016 | listHighest excludes entries whose score is not greater than zero", () => {
  reset();
  upsertScore("Hidden", 0);
  upsertScore("Visible", 1);
  const { scores, total } = listHighest(1, 10);
  assert.equal(total, 1);
  assert.deepEqual(scores.map((s) => s.name), ["Visible"]);
});

test("TC-017 | listLatest returns the five most recently updated players first", () => {
  reset();
  for (const [index, name] of ["First", "Second", "Third"].entries()) {
    upsertScore(name, index + 1);
  }
  // Force deterministic recency without depending on wall-clock resolution.
  memoryDb.scores.forEach((entry, index) => {
    entry.updatedAt = new Date(2026, 0, 1, 0, 0, index);
  });
  assert.deepEqual(listLatest().map((s) => s.name), ["Third", "Second", "First"]);
});

test("TC-018 | listLatest caps the response at five entries", () => {
  reset();
  for (let i = 0; i < 9; i++) upsertScore(`Player${i}`, i + 1);
  assert.equal(listLatest().length, 5);
});

test("TC-019 | upsertScore creates a brand new player with full score history", () => {
  reset();
  const stored = upsertScore("Fresh", 7);
  assert.deepEqual(
    { name: stored.name, score: stored.score, highestScore: stored.highestScore, latestScore: stored.latestScore, visits: stored.visits },
    { name: "Fresh", score: 7, highestScore: 7, latestScore: 7, visits: 1 },
  );
});

test("TC-020 | upsertScore keeps the best score, records the latest, and counts visits", () => {
  reset();
  upsertScore("Regular", 5);
  const afterBetter = upsertScore("Regular", 12);
  assert.equal(afterBetter.highestScore, 12);
  assert.equal(afterBetter.latestScore, 12);
  assert.equal(afterBetter.score, 12);

  const afterWorse = upsertScore("Regular", 4);
  assert.equal(afterWorse.highestScore, 12, "highest score must not regress");
  assert.equal(afterWorse.latestScore, 4, "latest score must reflect the newest run");
  assert.equal(afterWorse.score, 12);
  assert.equal(afterWorse.visits, 3);
  assert.equal(memoryDb.scores.filter((s) => s.name === "Regular").length, 1, "one row per player");
});

test("TC-021 | upsertScore refreshes updatedAt so the player moves to the top of 'recent hunts'", () => {
  reset();
  const entry = upsertScore("Returnee", 2);
  const staleStamp = new Date(2026, 0, 1);
  entry.updatedAt = staleStamp; // upsertScore returns the live row, so remember the old value
  const updated = upsertScore("Returnee", 3);
  assert.ok(updated.updatedAt.getTime() > staleStamp.getTime(), "a repeat run must refresh updatedAt");
});

test("TC-022 | player identity is case-sensitive", () => {
  reset();
  upsertScore("CaseTest", 5);
  upsertScore("casetest", 6);
  assert.equal(memoryDb.scores.length, 2, "documented behaviour: 'CaseTest' and 'casetest' are different players");
});

test("TC-023 | writes with an undefined score are stored but hidden from every leaderboard", () => {
  reset();
  const stored = upsertScore("UndefinedScore", undefined);
  assert.equal(stored.score, undefined);
  assert.equal(listHighest(1, 10).total, 0);
  assert.equal(listLatest().length, 0);
});

test(
  "TC-024 | KNOWN ISSUE (BUG-005): NaN page/limit silently return an empty board instead of an error",
  { todo: "BUG-005 — parseInt() output is never validated in the API route" },
  () => {
    reset();
    upsertScore("Visible", 3);
    assert.deepEqual(listHighest(Number.NaN, 5).scores, []);
    assert.deepEqual(listHighest(1, Number.NaN).scores, []);
  },
);

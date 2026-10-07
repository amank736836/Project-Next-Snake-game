/**
 * TC-025 — production runs must NOT seed the demo leaderboard.
 *
 * `memoryScores.ts` seeds six demo players only outside production, so this file
 * must run in its own process with NODE_ENV=production *before* the module is
 * imported (the seed decision is taken at module load).
 *
 * Suite: unit · no browser, no server required.
 * Run:   npm run test:unit
 */
import test from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "production";

const { memoryDb, listHighest } = await import("../../../src/lib/memoryScores.ts");

test("TC-025 | NODE_ENV=production starts with an empty leaderboard (no demo seed)", () => {
  assert.equal(memoryDb.scores.length, 0);
  assert.deepEqual(listHighest(1, 5), { scores: [], total: 0 });
});

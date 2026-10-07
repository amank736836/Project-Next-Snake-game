/**
 * TC-026 … TC-029 — profanity filter data (`src/lib/foulWords.ts`)
 *
 * The API lower-cases the submitted name and runs String.includes() against this
 * list, so the list itself must be lower-case, non-empty and duplicate-free.
 *
 * Suite: unit · no browser, no server required.
 * Run:   npm run test:unit
 */
import test from "node:test";
import assert from "node:assert/strict";

import { foulWords } from "../../../src/lib/foulWords.ts";

test("TC-026 | filter list is loaded and non-trivial", () => {
  assert.ok(Array.isArray(foulWords));
  assert.ok(foulWords.length > 100, `expected a populated list, got ${foulWords.length}`);
});

test("TC-027 | every entry is a non-empty string", () => {
  const broken = foulWords.filter((word) => typeof word !== "string" || word.trim() === "");
  assert.deepEqual(broken, []);
});

test(
  "TC-028 | KNOWN ISSUE (BUG-008): every entry should be lower-case, otherwise it can never match",
  { todo: "BUG-008 — the route compares against a lower-cased name, so upper-case entries are dead" },
  () => {
    const unreachable = foulWords.filter((word) => word !== word.toLowerCase());
    assert.deepEqual(unreachable, []);
  },
);

test(
  "TC-029 | KNOWN ISSUE (BUG-009): the list contains duplicate entries",
  { todo: "BUG-009 — duplicated words (e.g. 'tranny', 'kinky') bloat the list without adding coverage" },
  () => {
    const duplicates = [...new Set(foulWords.filter((word, index) => foulWords.indexOf(word) !== index))];
    assert.deepEqual(duplicates, []);
  },
);

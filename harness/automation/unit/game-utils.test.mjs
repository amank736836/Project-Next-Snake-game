/**
 * TC-001 … TC-012 — pure game helpers (`src/components/game/utils.ts`)
 *
 * Suite: unit · no browser, no server required.
 * Run:   npm run test:unit
 */
import test from "node:test";
import assert from "node:assert/strict";

import {
  GRID_SIZE,
  INITIAL_SNAKE_BODY,
  generateFood,
  obfuscate,
  deobfuscate,
  getSnakePartRotation,
} from "../../../src/components/game/utils.ts";

const mission = (overrides = {}) => ({
  snake: [[5, 5]],
  food: [7, 3],
  score: 4,
  length: 1,
  playerName: "Nagini",
  direction: [1, 0],
  ...overrides,
});

test("TC-001 | board constants: 20x20 grid, snake starts as a single segment", () => {
  assert.equal(GRID_SIZE, 20);
  assert.deepEqual(INITIAL_SNAKE_BODY, [[5, 5]]);
});

test("TC-002 | generateFood always returns a cell inside the 20x20 board", () => {
  for (let i = 0; i < 2000; i++) {
    const [x, y] = generateFood(INITIAL_SNAKE_BODY);
    assert.ok(Number.isInteger(x) && Number.isInteger(y), `non-integer cell ${x},${y}`);
    assert.ok(x >= 0 && x < GRID_SIZE, `x out of range: ${x}`);
    assert.ok(y >= 0 && y < GRID_SIZE, `y out of range: ${y}`);
  }
});

test("TC-003 | generateFood never lands on the snake body", () => {
  const body = Array.from({ length: 100 }, (_, i) => [i % 10, Math.floor(i / 10)]);
  for (let i = 0; i < 500; i++) {
    const [x, y] = generateFood(body);
    assert.ok(!body.some(([bx, by]) => bx === x && by === y), `food landed on the body at ${x},${y}`);
  }
});

test("TC-004 | obfuscate/deobfuscate round-trips a mission exactly", () => {
  const data = mission({ snake: [[1, 1], [0, 1], [19, 1]], score: 123, length: 3, direction: [-1, 0] });
  const encoded = obfuscate(data);
  assert.notEqual(encoded, JSON.stringify(data), "payload must not be stored as plain JSON");
  assert.deepEqual(deobfuscate(encoded), data);
});

test("TC-005 | obfuscate output is base64 and hides the player name", () => {
  const encoded = obfuscate(mission({ playerName: "Hannah" }));
  assert.doesNotMatch(encoded, /Hannah/);
  assert.doesNotThrow(() => atob(encoded));
});

test("TC-006 | deobfuscate returns null for garbage instead of throwing", () => {
  assert.equal(deobfuscate("not base64 at all !!"), null);
  assert.equal(deobfuscate(atob("e30=") /* "{}" — valid base64, wrong payload */), null);
  assert.equal(deobfuscate(""), null);
});

test("TC-007 | deobfuscate survives a truncated / tampered save", () => {
  const encoded = obfuscate(mission());
  assert.equal(deobfuscate(encoded.slice(0, Math.floor(encoded.length / 2))), null);
});

test("TC-008 | getSnakePartRotation maps each direction to the right head class", () => {
  assert.equal(getSnakePartRotation([1, 0]), "head-right");
  assert.equal(getSnakePartRotation([-1, 0]), "head-left");
  assert.equal(getSnakePartRotation([0, 1]), "head-down");
  assert.equal(getSnakePartRotation([0, -1]), "head-up");
});

test("TC-009 | getSnakePartRotation falls back to head-right for a zero vector", () => {
  assert.equal(getSnakePartRotation([0, 0]), "head-right");
});

test(
  "TC-010 | KNOWN ISSUE (BUG-006): generateFood recurses forever when the board is full",
  { todo: "BUG-006 — unbounded recursion instead of graceful failure" },
  () => {
    const fullBoard = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) fullBoard.push([x, y]);
    }
    assert.throws(() => generateFood(fullBoard), RangeError);
  },
);

test(
  "TC-011 | KNOWN ISSUE (BUG-007): obfuscate throws DOMException for non-Latin1 names",
  { todo: "BUG-007 — btoa() rejects characters above U+00FF" },
  () => {
    assert.throws(() => obfuscate(mission({ playerName: "Игрок" })), /Invalid character/);
  },
);

test("TC-012 | obfuscation is position-dependent (XOR index stream), so identical saves differ", () => {
  const a = obfuscate(mission({ score: 1 }));
  const b = obfuscate(mission({ score: 1 }));
  assert.equal(a, b, "same input must produce the same save (resume depends on it)");
  assert.notEqual(obfuscate(mission({ score: 2 })), a);
});

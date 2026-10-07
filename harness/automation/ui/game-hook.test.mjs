/**
 * TC-030 … TC-048 — the game engine as driven by `useSnakeGame` in a real DOM.
 *
 * The hook owns every game rule (movement, wrap-around, food, speed ramp,
 * collision, pause/resume, score submission), so this is the highest-value
 * automated suite in the harness. It runs headlessly with jsdom + React 19.
 *
 * Suite: ui (browser environment)
 * Run:   npm run test:ui          (boots jsdom via harness/automation/utilities/register.mjs)
 */
import test from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { createRoot } from "react-dom/client";

import { useSnakeGame } from "../../../src/components/game/hooks/useSnakeGame.ts";

const TICK = 95; // base step time at score 0
const FAST_TICK = 55; // floor of the speed ramp

/** Mounts the hook and returns a live accessor. `fetch` is stubbed per test. */
async function mountGame(t, { scores = [], latest = [], demo = true, fetchImpl } = {}) {
  t.mock.timers.enable({ apis: ["setInterval", "setTimeout", "Date"] });

  const calls = [];
  globalThis.fetch = fetchImpl ?? (async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).includes("highestScore")) {
      return { ok: true, status: 200, json: async () => ({ scores, latestScores: latest, pagination: { total: scores.length, page: 1, limit: 5, totalPages: 1 }, demo }) };
    }
    if (String(url).includes("latestScore")) {
      return { ok: true, status: 200, json: async () => latest };
    }
    return { ok: true, status: 201, json: async () => ({ message: "Score added/updated successfully (in-memory).", demo: true }) };
  });

  // A mutable holder the harness reads from: the probe renders no UI, it only
  // exposes the hook's latest result to the assertions. Updating it from an
  // effect keeps the component pure for the react-compiler lint rules.
  const live = { api: null };
  const Probe = () => {
    const api = useSnakeGame();
    React.useEffect(() => {
      live.api = api;
    });
    return null;
  };

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => root.render(React.createElement(Probe)));

  const get = () => live.api;
  const tick = async (ms) => { await act(async () => { t.mock.timers.tick(ms); }); };
  const key = async (k) => {
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
    });
  };
  const start = async (name) => {
    await act(async () => live.api.setPlayerName(name));
    await act(async () => live.api.startGame());
  };
  /** Places an apple directly in front of the head and steps onto it. */
  const eatApple = async () => {
    const [hx, hy] = get().snake[0];
    const [dx, dy] = get().directionRef.current;
    get().foodRef.current = [hx + dx, hy + dy];
    await tick(TICK);
  };
  const cleanup = async () => {
    await act(async () => root.unmount());
    container.remove();
  };

  return { get, tick, key, start, eatApple, cleanup, calls, root };
}

test("TC-030 | the game mounts into the menu screen and loads the leaderboard", async (t) => {
  const game = await mountGame(t, { scores: [{ name: "Nagini", score: 42, highestScore: 42 }] });
  assert.equal(game.get().mounted, true, "mounted flag flips after the mount effect");
  assert.equal(game.get().gameState, "menu");
  assert.equal(game.get().theme, "dark", "dark is the default theme");
  assert.equal(game.get().controlType, "buttons", "D-pad is the default control scheme");
  assert.deepEqual(game.get().snake, [[5, 5]]);
  assert.equal(game.get().isLoadingScores, false);
  assert.deepEqual(game.get().AllScores.map((s) => s.name), ["Nagini"]);
  assert.equal(game.get().isDemo, true, "demo chip is shown when the API reports demo mode");
  assert.ok(game.calls.some((c) => c.url.includes("/api/snakeGame/highestScore?page=1&limit=5")));
  await game.cleanup();
});

test("TC-031 | starting without a name is blocked and raises the name alert", async (t) => {
  const game = await mountGame(t);
  await act(async () => game.get().startGame());
  assert.equal(game.get().alert, true);
  assert.equal(game.get().gameState, "menu", "the mission must not start");
  await game.cleanup();
});

test("TC-032 | starting with a name enters the playing state with a reset board", async (t) => {
  const game = await mountGame(t);
  await game.start("Tester");
  assert.equal(game.get().alert, false);
  assert.equal(game.get().gameState, "playing");
  assert.equal(game.get().score, 0);
  assert.deepEqual(game.get().snake, [[5, 5]]);
  assert.deepEqual(game.get().directionRef.current, [1, 0], "the snake starts heading right");
  const [fx, fy] = game.get().foodRef.current;
  assert.notDeepEqual([fx, fy], [5, 5], "the first apple must not spawn under the head");
  await game.cleanup();
});

test("TC-033 | the snake advances one cell per interval and its body follows the head", async (t) => {
  const game = await mountGame(t);
  await game.start("Tester");
  await act(async () => { game.get().foodRef.current = [0, 0]; }); // keep apples out of the way
  await game.tick(TICK - 1);
  assert.deepEqual(game.get().snake, [[5, 5]], "nothing moves before one full interval");
  await game.tick(1);
  assert.deepEqual(game.get().snake, [[6, 5]]);
  await game.tick(TICK);
  assert.deepEqual(game.get().snake, [[7, 5]], "length stays at 1 until an apple is eaten");
  await game.cleanup();
});

test("TC-034 | portal walls: leaving the board wraps to the opposite side", async (t) => {
  const game = await mountGame(t);
  await game.start("Tester");
  await act(async () => { game.get().foodRef.current = [0, 10]; });
  // walk to the right edge
  let guard = 0;
  while (game.get().snake[0][0] !== 19 && guard++ < 40) await game.tick(TICK);
  assert.equal(game.get().snake[0][0], 19, "reached the right edge");
  await game.tick(TICK);
  assert.deepEqual(game.get().snake[0], [0, 5], "x wraps 19 -> 0");

  await game.key("ArrowDown");
  await game.tick(TICK);
  let guardY = 0;
  while (game.get().snake[0][1] !== 19 && guardY++ < 40) await game.tick(TICK);
  await game.tick(TICK);
  assert.equal(game.get().snake[0][1], 0, "y wraps 19 -> 0");
  await game.cleanup();
});

test("TC-035 | keyboard control: arrows and WASD steer, reversing is ignored", async (t) => {
  const game = await mountGame(t);
  await game.start("Tester");
  await act(async () => { game.get().foodRef.current = [0, 0]; });

  await game.key("ArrowDown");
  assert.deepEqual(game.get().directionRef.current, [0, 1]);
  await game.key("ArrowLeft"); // 90° turn is legal
  assert.deepEqual(game.get().directionRef.current, [-1, 0]);
  await game.key("ArrowRight"); // reverse is ignored
  assert.deepEqual(game.get().directionRef.current, [-1, 0], "the snake cannot reverse into itself");

  await game.key("w"); // perpendicular to "left" — allowed
  assert.deepEqual(game.get().directionRef.current, [0, -1], "W is an alias for ArrowUp");
  await game.key("s"); // now a reverse of "up" — ignored
  assert.deepEqual(game.get().directionRef.current, [0, -1], "S while heading up is a reverse: ignored");
  await game.key(" ");
  assert.deepEqual(game.get().directionRef.current, [0, -1], "space maps to ArrowUp, which is a reverse here");
  await game.cleanup();
});

test("TC-036 | keystrokes are ignored while the name input has focus", async (t) => {
  const game = await mountGame(t);
  await game.start("Tester");
  const input = document.createElement("input");
  document.body.appendChild(input);
  input.focus();
  assert.equal(document.activeElement, input);
  await game.key("ArrowDown");
  assert.deepEqual(game.get().directionRef.current, [1, 0], "typing must never steer the snake");
  input.remove();
  await game.cleanup();
});

test("TC-037 | an arrow key on the menu starts the mission for a named player", async (t) => {
  const game = await mountGame(t);
  await act(async () => game.get().setPlayerName("Tester"));
  assert.equal(game.get().gameState, "menu");
  await game.key("ArrowDown");
  assert.equal(game.get().gameState, "playing", "the arrow both starts the run and sets the direction");
  await game.cleanup();
});

test("TC-038 | eating an apple scores a point, grows the snake and respawns the apple", async (t) => {
  const game = await mountGame(t);
  await game.start("Tester");
  const before = game.get().snake.length;
  const previousFood = [...game.get().foodRef.current];
  await game.eatApple();
  assert.equal(game.get().score, 1, "each apple is worth exactly one point");
  assert.equal(game.get().snake.length, before + 1, "the body grows by one segment");
  assert.notDeepEqual([...game.get().foodRef.current], previousFood, "a new apple is generated");
  await game.cleanup();
});

test("TC-039 | the step time shortens by one millisecond per apple, down to the 55 ms floor", async (t) => {
  const game = await mountGame(t);
  await game.start("Tester");
  await act(async () => { game.get().foodRef.current = [0, 0]; });

  // Measure precisely at score 0 (95 ms), 1 (94 ms) and 2 (93 ms).
  for (const [score, stepMs] of [[0, 95], [1, 94], [2, 93]]) {
    assert.equal(game.get().score, score, `expected to be at score ${score}`);
    const head = [...game.get().snake[0]];
    await game.tick(stepMs - 1);
    assert.deepEqual(game.get().snake[0], head, `at score ${score} the snake must not move before ${stepMs} ms`);
    await game.tick(1);
    assert.notDeepEqual(game.get().snake[0], head, `at score ${score} one step takes ${stepMs} ms`);
    if (score < 2) await game.eatApple();
  }

  // Reach score 40 along a safe serpentine (a straight line would wrap into its own body).
  const eatWhile = async (label, condition) => {
    let guard = 0;
    while (!condition()) {
      const [x, y] = game.get().snake[0];
      assert.ok(y === 5 || y === 18 || x === 19, `${label}: head left the planned path at ${x},${y}`);
      await game.eatApple();
      if (++guard > 60) throw new Error(`${label}: path did not terminate`);
    }
  };

  await eatWhile("leg 1 (right)", () => game.get().snake[0][0] === 19);
  assert.deepEqual(game.get().snake[0], [19, 5], "straight run reaches the right edge without wrapping");
  await game.key("ArrowDown");
  await eatWhile("leg 2 (down)", () => game.get().snake[0][1] === 18);
  assert.deepEqual(game.get().snake[0], [19, 18], "turned south along the safe right column");
  await game.key("ArrowLeft");
  await eatWhile("leg 3 (left)", () => game.get().score >= 40);
  assert.equal(game.get().score, 40);
  assert.equal(game.get().gameState, "playing", "the serpentine path never touches the body");

  const headAt40 = [...game.get().snake[0]];
  await game.tick(FAST_TICK - 1);
  assert.deepEqual(game.get().snake[0], headAt40, `the interval never drops below ${FAST_TICK} ms`);
  await game.tick(1);
  assert.notDeepEqual(game.get().snake[0], headAt40, `${FAST_TICK} ms is enough for one step at high score`);
  await game.cleanup();
});

test("TC-040 | hitting its own body ends the run, persists the best score and posts the score", async (t) => {
  const game = await mountGame(t);
  await game.start("Tester");
  for (let i = 0; i < 3; i++) await game.eatApple(); // grow to length 4 heading right
  assert.equal(game.get().snake.length, 4);

  await act(async () => { game.get().foodRef.current = [0, 19]; });
  await game.key("ArrowUp");
  await game.tick(TICK);
  await game.key("ArrowLeft");
  await game.tick(TICK);
  await game.key("ArrowDown"); // next head lands on the body
  await game.tick(TICK);
  await game.tick(1); // the death handler is scheduled on a 0 ms timeout

  assert.equal(game.get().gameState, "gameOver");
  assert.equal(game.get().lastRun.score, 3);
  assert.equal(game.get().lastRun.length, 4);
  assert.equal(game.get().lastRun.isRecord, true, "first completed run is a session record");
  assert.equal(localStorage.getItem("nagini_best"), "3", "session best is persisted");
  assert.equal(localStorage.getItem("snake_mission_save"), null, "the paused run is cleared on death");

  const posted = game.calls.filter((c) => c.url.includes("/api/snakeGame/addScore"));
  assert.equal(posted.length, 1, "the score is submitted exactly once");
  assert.deepEqual(JSON.parse(posted[0].init.body), { name: "Tester", score: 3 });
  await game.cleanup();
});

test("TC-041 | pause stores an obfuscated mission and resume restores it", async (t) => {
  const game = await mountGame(t);
  await game.start("Tester");
  await game.eatApple();
  await game.eatApple();
  assert.equal(game.get().score, 2);
  const snakeAtPause = JSON.parse(JSON.stringify(game.get().snake));

  await act(async () => game.get().handlePause());
  assert.equal(game.get().gameState, "menu");
  assert.equal(game.get().hasSavedGame, true);

  const save = localStorage.getItem("snake_mission_save");
  assert.ok(save, "a save slot is written");
  assert.doesNotMatch(save, /Tester/, "the save must not contain the player name in clear text");
  assert.doesNotMatch(save, /"score"/, "the save must not be readable JSON");

  await act(async () => game.get().handleResume());
  assert.equal(game.get().gameState, "playing");
  assert.equal(game.get().score, 2);
  assert.equal(game.get().playerName, "Tester");
  assert.deepEqual(game.get().snake, snakeAtPause);
  assert.equal(game.get().hasSavedGame, false, "resuming consumes the save");
  assert.equal(localStorage.getItem("snake_mission_save"), null);
  await game.cleanup();
});

test("TC-042 | a corrupt save does not disturb the current run", async (t) => {
  const game = await mountGame(t);
  await game.start("Tester");
  localStorage.setItem("snake_mission_save", "%%%corrupt%%%");
  await act(async () => game.get().handleResume());
  assert.equal(game.get().gameState, "playing", "the current run must survive a corrupt save");
  assert.equal(game.get().score, 0, "no partial state is restored from an unreadable save");
  await game.cleanup();
});

test(
  "TC-042b | KNOWN ISSUE (BUG-011): a corrupt save leaves the RESUME MISSION button active forever",
  { todo: "BUG-011 — handleResume() bails out without clearing the unreadable save or hasSavedGame" },
  async (t) => {
    localStorage.setItem("snake_mission_save", "%%%corrupt%%%");
    const game = await mountGame(t);
    assert.equal(game.get().hasSavedGame, true, "the hub offers to resume");
    await act(async () => game.get().handleResume());
    assert.equal(game.get().hasSavedGame, false, "expected: the unreadable save is dropped");
    assert.equal(localStorage.getItem("snake_mission_save"), null, "expected: storage is cleaned up");
    localStorage.clear();
    await game.cleanup();
  },
);

test("TC-043 | theme toggle flips the document attribute and is persisted", async (t) => {
  const game = await mountGame(t);
  assert.equal(document.documentElement.getAttribute("data-theme"), "dark");
  await act(async () => game.get().toggleTheme());
  assert.equal(game.get().theme, "light");
  assert.equal(document.documentElement.getAttribute("data-theme"), "light");
  assert.equal(localStorage.getItem("theme"), "light");
  await act(async () => game.get().toggleTheme());
  assert.equal(localStorage.getItem("theme"), "dark");
  await game.cleanup();
});

test("TC-044 | a stored session best is restored on mount", async (t) => {
  localStorage.setItem("nagini_best", "17");
  const game = await mountGame(t);
  assert.equal(game.get().sessionBest, 17);
  assert.equal(game.get().lastRun, null, "no run summary before the first death");
  localStorage.clear();
  await game.cleanup();
});

test("TC-045 | a paused save from a previous visit enables the resume button", async (t) => {
  localStorage.setItem("snake_mission_save", "stale-save");
  const game = await mountGame(t);
  assert.equal(game.get().hasSavedGame, true);
  localStorage.clear();
  await game.cleanup();
});

test("TC-046 | leaderboard paging stays inside the available range", async (t) => {
  const game = await mountGame(t, {
    scores: [
      { name: "A", score: 9, highestScore: 9 },
      { name: "B", score: 8, highestScore: 8 },
    ],
  });
  const highestCalls = () => game.calls.filter((c) => c.url.includes("highestScore")).length;
  const before = highestCalls();
  await act(async () => game.get().handlePageChange(2)); // totalPages is 1
  assert.equal(highestCalls(), before, "out-of-range pages must not trigger a request");
  await act(async () => game.get().handlePageChange(1));
  assert.equal(highestCalls(), before + 1, "a valid page change refreshes the board");
  await game.cleanup();
});

test("TC-047 | a failing scores API degrades to empty boards instead of crashing", async (t) => {
  const game = await mountGame(t, {
    fetchImpl: async (url) => {
      if (String(url).includes("highestScore") || String(url).includes("latestScore")) {
        return { ok: false, status: 400, json: async () => ({ message: "connect ECONNREFUSED" }) };
      }
      return { ok: false, status: 400, json: async () => ({ message: "nope" }) };
    },
  });
  assert.deepEqual(game.get().AllScores, []);
  assert.deepEqual(game.get().latestScores, []);
  assert.equal(game.get().isLoadingScores, false, "the skeleton must not spin forever");
  await game.cleanup();
});

test("TC-048 | a snake shorter than four segments cannot self-collide (minimum scoring run)", async (t) => {
  const game = await mountGame(t);
  await game.start("Tester");
  await game.eatApple(); // length 2
  await act(async () => { game.get().foodRef.current = [0, 19]; });
  // The same tight loop that kills a length-4 snake is survivable at length 2.
  await game.key("ArrowUp");
  await game.tick(TICK);
  await game.key("ArrowLeft");
  await game.tick(TICK);
  await game.key("ArrowDown");
  await game.tick(TICK);
  assert.equal(game.get().gameState, "playing", "no wall collisions exist (portal walls), so length gates death");
  assert.equal(game.get().score, 1);
  await game.cleanup();
});

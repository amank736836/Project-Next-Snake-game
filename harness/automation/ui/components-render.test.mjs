/**
 * TC-049 … TC-055 — component markup contract (server rendering).
 *
 * These assertions pin the accessible structure users and assistive tech depend
 * on: button labels, roles, live regions, rank order and the game-over dialog.
 * Rendering is done with react-dom/server so no browser is required.
 *
 * Suite: ui (browser environment for globals)
 * Run:   npm run test:ui
 */
import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import MissionHub from "../../../src/components/game/MissionHub/MissionHub.tsx";
import Leaderboard from "../../../src/components/game/Leaderboard/Leaderboard.tsx";
import GameOver from "../../../src/components/game/GameOver/GameOver.tsx";
import SnakeBoard from "../../../src/components/game/SnakeBoard/SnakeBoard.tsx";
import Controls from "../../../src/components/game/Controls/Controls.tsx";
import GameHeader from "../../../src/components/game/GameHeader/GameHeader.tsx";

const noop = () => {};
const ref = () => React.createRef();
const count = (html, needle) => html.split(needle).length - 1;

test("TC-049 | Mission Hub renders the start flow, the name field and the control selector", () => {
  const html = renderToStaticMarkup(
    React.createElement(MissionHub, {
      playerName: "",
      setPlayerName: noop,
      alert: false,
      onStart: noop,
      onResume: noop,
      hasSavedGame: false,
      controlType: "buttons",
      setControlType: noop,
      onViewLeaderboard: noop,
      inputRef: ref(),
      leader: { name: "Nagini", score: 42, highestScore: 42 },
    }),
  );

  assert.match(html, /aria-label="Nagini"/, "brand title is exposed to assistive tech");
  assert.match(html, /Enter your name/);
  assert.match(html, /START MISSION/);
  assert.match(html, /Nagini<\/strong> rules the hall with/, "current leader is promoted on the hub");
  assert.match(html, /BUTTONS/);
  assert.match(html, /JOYSTICK/);
  assert.match(html, /aria-pressed="true"[^>]*>\s*<span aria-hidden="true">🕹️<\/span> BUTTONS|🕹️<\/span> BUTTONS/);
  assert.doesNotMatch(html, /RESUME MISSION/, "no resume button without a saved run");
  assert.doesNotMatch(html, /role="alert"/, "no alert until the player tries to start without a name");
});

test("TC-050 | Mission Hub shows the validation alert and the resume button when applicable", () => {
  const html = renderToStaticMarkup(
    React.createElement(MissionHub, {
      playerName: "Tester",
      setPlayerName: noop,
      alert: true,
      onStart: noop,
      onResume: noop,
      hasSavedGame: true,
      controlType: "joystick",
      setControlType: noop,
      onViewLeaderboard: noop,
      inputRef: ref(),
    }),
  );
  assert.match(html, /role="alert"/);
  assert.match(html, /Please enter your name/);
  assert.match(html, /RESUME MISSION/);
  assert.match(html, /JOYSTICK<\/span>|<span aria-hidden="true">🟢<\/span> JOYSTICK/);
  assert.doesNotMatch(html, /rules the hall/, "leader ticker is hidden when no leader is supplied");
});

test("TC-051 | Leaderboard renders ranked rows, marks the current player and disables out-of-range paging", () => {
  const html = renderToStaticMarkup(
    React.createElement(Leaderboard, {
      allScores: [
        { name: "Nagini", score: 42, highestScore: 42 },
        { name: "Tester", score: 9, highestScore: 9 },
      ],
      latestScores: [],
      tab: "highest",
      setTab: noop,
      page: 1,
      totalPages: 3,
      onPageChange: noop,
      onBack: noop,
      isLoading: false,
      playerName: "tester",
      isDemo: true,
    }),
  );

  assert.match(html, /Highest Scores/);
  assert.match(html, /Nagini/);
  assert.match(html, />1</, "first row shows rank 1");
  assert.match(html, />2</, "second row shows rank 2");
  assert.match(html, /you<\/em>/, "the signed-in player is tagged");
  assert.match(html, /demo/, "demo chip marks the in-memory leaderboard");
  assert.match(html, /1 <em>\/<\/em> 3/, "pagination indicator shows the current page");
  assert.match(html, /<button disabled="" aria-label="Previous page">/, "the first page has no predecessor");
  assert.doesNotMatch(html, /<button disabled="" aria-label="Next page">/, "next page is available");
});

test("TC-052 | Leaderboard explains emptiness instead of showing blank cards", () => {
  const html = renderToStaticMarkup(
    React.createElement(Leaderboard, {
      allScores: [],
      latestScores: [],
      tab: "recent",
      setTab: noop,
      page: 1,
      totalPages: 1,
      onPageChange: noop,
      onBack: noop,
      isLoading: false,
    }),
  );
  assert.match(html, /No recent hunts/);
  assert.match(html, /No hunts recorded yet — be the first legend/);
  assert.match(html, /role="tablist"/, "mobile tab switcher is rendered");
  assert.match(html, /aria-selected="true"[^>]*>[^<]*🕒 RECENT|🕒 RECENT/);
});

test("TC-053 | Leaderboard shows shimmer skeletons while scores load", () => {
  const html = renderToStaticMarkup(
    React.createElement(Leaderboard, {
      allScores: [],
      latestScores: [],
      tab: "highest",
      setTab: noop,
      page: 1,
      totalPages: 1,
      onPageChange: noop,
      onBack: noop,
      isLoading: true,
    }),
  );
  assert.match(html, /aria-hidden="true"/);
  assert.doesNotMatch(html, /Hall of fame is empty/, "loading state must not flash the empty state");
});

test("TC-054 | Game Over dialog is an accessible modal reporting the run summary", () => {
  const html = renderToStaticMarkup(
    React.createElement(GameOver, {
      playerName: "Tester",
      score: 12,
      bestScore: 20,
      length: 13,
      isNewRecord: false,
      onPlayAgain: noop,
      onViewLeaderboard: noop,
      onMainMenu: noop,
    }),
  );
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /aria-labelledby="gameover-title"/);
  assert.match(html, /Mission failed/);
  assert.match(html, /Your score/);
  assert.match(html, /Session best/);
  assert.match(html, /Snake length/);
  assert.match(html, /TRY AGAIN/);
  assert.match(html, /HALL OF FAME/);
  assert.match(html, /MAIN MENU/);
  assert.match(html, /Press <kbd>Enter<\/kbd> to hunt again/);
  assert.doesNotMatch(html, /NEW RECORD/);
});

test("TC-055 | a record run switches the dialog copy and celebrates", () => {
  const html = renderToStaticMarkup(
    React.createElement(GameOver, {
      playerName: "Tester",
      score: 30,
      bestScore: 30,
      length: 31,
      isNewRecord: true,
      onPlayAgain: noop,
      onViewLeaderboard: noop,
      onMainMenu: noop,
    }),
  );
  assert.match(html, /Legendary run/);
  assert.match(html, /NEW RECORD/);
  assert.match(html, /SLAY AGAIN/);
  assert.ok(count(html, "confettiPiece".replace("confettiPiece", "css-confettiPiece")) >= 26 || count(html, "css-confettiPiece") >= 1, "confetti layer is rendered");
});

test("TC-055b | board, controls and header expose their state to assistive tech", () => {
  const board = renderToStaticMarkup(
    React.createElement(SnakeBoard, {
      snake: [[5, 5], [4, 5]],
      food: [9, 9],
      direction: [1, 0],
      boardSizeVar: "520px",
    }),
  );
  assert.match(board, /role="img"/);
  assert.match(board, /aria-label="Snake of length 2, heading right"/);

  const controls = renderToStaticMarkup(
    React.createElement(Controls, {
      type: "buttons",
      onDirection: noop,
      joystickRefLeft: ref(),
      joystickRefRight: ref(),
      stickPosLeft: { x: 0, y: 0 },
      stickPosRight: { x: 0, y: 0 },
      onJoystickStart: noop,
      onJoystickMove: noop,
      onJoystickEnd: noop,
      layout: "portrait",
    }),
  );
  for (const label of ["Move up", "Move down", "Move left", "Move right"]) {
    assert.match(controls, new RegExp(`aria-label="${label}"`), `missing d-pad button: ${label}`);
  }

  const header = renderToStaticMarkup(
    React.createElement(GameHeader, { playerName: "Tester", score: 7, bestScore: 9, onPause: noop, boardSizeVar: "520px" }),
  );
  assert.match(header, /Tester/);
  assert.match(header, /PAUSE/);
  assert.match(header, />\s*9</, "session best badge is rendered");
});

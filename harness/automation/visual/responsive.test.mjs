/**
 * TC-300 … TC-304 — responsive layout in a real browser.
 *
 * Suite: visual (requires a Chromium/Chrome binary; skips cleanly without one)
 * Run:   npm run test:visual
 *
 * Regression cover for the defects found in the 2026-10-11 UI audit:
 *   UI-01  mission hub clipped at 320 px (leader ticker forced the grid wider)
 *   UI-06  board + D-pad clipped at 400 % zoom / tiny landscape
 */
import test from "node:test";
import assert from "node:assert/strict";

import { resolveBrowser, newPage, gotoApp, shot, OVERFLOW_PROBE, openLeaderboard, VIEWPORTS } from "./lib/browser.mjs";

const handle = await resolveBrowser();
const skip = (t) => t.skip("no Chromium binary available — set QA_CHROME_PATH or run `npx playwright install chromium`");

const eachViewport = VIEWPORTS;

test("TC-300 | no page overflows its viewport horizontally", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  for (const vp of eachViewport) {
    await t.test(`${vp.name} (${vp.width}×${vp.height})`, async () => {
      const { context, page } = await newPage(browser, vp);
      await gotoApp(page);
      const r = await page.evaluate(OVERFLOW_PROBE);
      if (shot) {
        const file = shot(`responsive/${vp.name}`);
        if (file) await page.screenshot({ path: file, fullPage: true });
      }
      assert.equal(
        r.overflows,
        false,
        `document is ${r.docScrollWidth}px wide in a ${r.viewportWidth}px viewport; ` +
          `body has overflow-x:hidden so the overflow is clipped, not scrollable. ` +
          `First offenders: ${JSON.stringify(r.offenders.slice(0, 4))}`,
      );
      await context.close();
    });
  }
});

test("TC-301 | the mission hub survives a long leader name at 320px", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page } = await newPage(browser, { width: 320, height: 640 });
  await gotoApp(page);
  // A 23-character name is longer than the 20 the UI allows, and longer still
  // than the phone is wide — the ticker must ellipsize, not push the page out.
  await page.evaluate(async () => {
    await fetch("/api/snakeGame/addScore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Extremelylongplayername", score: 99 }),
    });
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1800);

  const r = await page.evaluate(OVERFLOW_PROBE);
  assert.equal(r.overflows, false, `overflow with a long leader name: ${JSON.stringify(r.offenders.slice(0, 4))}`);

  const ticker = await page.evaluate(() => {
    const el = document.querySelector('[class*="tickerText"]');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, ellipsis: cs.textOverflow, minWidth: cs.minWidth };
  });
  if (ticker) {
    assert.equal(ticker.ellipsis, "ellipsis", "the ticker truncates instead of growing");
    assert.equal(ticker.minWidth, "0px", "the ticker flex child may shrink below its content width");
  }
  if (shot) await page.screenshot({ path: shot("responsive/320-long-name"), fullPage: true });

  // …and the same name inside the hall-of-fame view, where it becomes a row
  if (await openLeaderboard(page)) {
    const lb = await page.evaluate(OVERFLOW_PROBE);
    assert.equal(lb.overflows, false, `leaderboard view overflows at 320px: ${JSON.stringify(lb.offenders.slice(0, 4))}`);
    if (shot) await page.screenshot({ path: shot("responsive/320-long-name-leaderboard"), fullPage: true });
  }
  await context.close();
});

test("TC-302 | the game screen fits at 400% zoom and in landscape", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  for (const vp of [{ width: 320, height: 180 }, { width: 844, height: 390 }]) {
    await t.test(`${vp.width}×${vp.height}`, async () => {
      const { context, page } = await newPage(browser, vp);
      await gotoApp(page);
      await page.fill("#player-name", "Zoom");
      await page.click('button:has-text("START MISSION")');
      await page.waitForTimeout(1500);
      const r = await page.evaluate(OVERFLOW_PROBE);
      if (shot) await page.screenshot({ path: shot(`responsive/game-${vp.width}x${vp.height}`), fullPage: true });
      assert.equal(r.overflows, false, `game screen overflows: ${JSON.stringify(r.offenders.slice(0, 4))}`);
      await context.close();
    });
  }
});

test("TC-303 | no console errors and no failed requests on a cold load", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page, logs } = await newPage(browser, { width: 1280, height: 800 });
  await gotoApp(page);
  assert.deepEqual(logs.console.filter((c) => c.type === "error"), [], "console is clean");
  assert.deepEqual(logs.failed, [], "every request succeeded");
  assert.deepEqual(logs.errors, [], "no uncaught exceptions");
  await context.close();
});

test("TC-304 | the desktop three-column menu keeps its visual order", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page } = await newPage(browser, { width: 1440, height: 900 });
  await gotoApp(page);
  const order = await page.evaluate(() =>
    [...document.querySelector(".menu-content").children]
      .map((k) => ({ cls: k.className.split(" ")[0] + "/" + (k.className.split(" ")[1] ?? ""), x: Math.round(k.getBoundingClientRect().x) }))
      .sort((a, b) => a.x - b.x)
      .map((k) => k.cls),
  );
  assert.ok(order[0].startsWith("score-section/high-scores"), `left column: ${order[0]}`);
  assert.ok(order[1].startsWith("hub-section"), `middle column: ${order[1]}`);
  assert.ok(order[2].startsWith("score-section/recent-hunts"), `right column: ${order[2]}`);
  await context.close();
});

test("TC-305 | long names ellipsize inside a leaderboard row instead of overflowing", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  for (const vp of [{ width: 390, height: 844 }, { width: 1024, height: 768 }]) {
    await t.test(`${vp.width}×${vp.height}`, async () => {
      const { context, page } = await newPage(browser, vp);
      await gotoApp(page);
      await page.evaluate(async () => {
        await fetch("/api/snakeGame/addScore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Extremelylongplayername", score: 99 }),
        });
      });
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(1800);
      await openLeaderboard(page);
      const rows = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll('[class*="nameText"], [class*="_name"]')) {
          const cs = getComputedStyle(el);
          if (cs.display === "none") continue;
          if (el.scrollWidth > el.clientWidth + 1 && cs.textOverflow !== "ellipsis") {
            out.push({ cls: (el.className || "").toString().slice(0, 30), text: el.textContent.trim().slice(0, 24), scroll: el.scrollWidth, client: el.clientWidth, textOverflow: cs.textOverflow });
          }
        }
        return out;
      });
      assert.deepEqual(rows, [], `names are clipped without an ellipsis: ${JSON.stringify(rows)}`);
      await context.close();
    });
  }
});

test.after(async () => {
  await handle?.browser.close();
});

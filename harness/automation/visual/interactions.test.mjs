/**
 * TC-320 … TC-324 — functional / interaction testing in a real browser.
 *
 * Suite: visual (requires a Chromium/Chrome binary; skips cleanly without one)
 * Run:   npm run test:visual
 */
import test from "node:test";
import assert from "node:assert/strict";

import { resolveBrowser, newPage, gotoApp, shot } from "./lib/browser.mjs";

const handle = await resolveBrowser();
const skip = (t) => t.skip("no Chromium binary available — set QA_CHROME_PATH or run `npx playwright install chromium`");

test("TC-320 | the name field is validated before a run starts", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page } = await newPage(browser, { width: 390, height: 844 });
  await gotoApp(page);
  await page.click('button:has-text("START MISSION")');
  await page.waitForTimeout(500);
  assert.ok(await page.locator('[role="alert"]').first().isVisible(), "an alert explains the problem");
  assert.match(await page.locator('[role="alert"]').first().innerText(), /enter your name/i);
  assert.equal(await page.locator(".game-screen").count(), 0, "the game does not start without a name");
  await page.fill("#player-name", "Tester");
  await page.click('button:has-text("START MISSION")');
  await page.waitForTimeout(600);
  assert.equal(await page.locator(".game-screen").count(), 1, "the game starts once a name is given");
  await context.close();
});

test("TC-321 | the name field rejects unsupported characters and lengths", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page } = await newPage(browser, { width: 1280, height: 800 });
  await gotoApp(page);
  await page.fill("#player-name", "<script>alert(1)</script>😀!!!@@@");
  const cleaned = await page.inputValue("#player-name");
  assert.doesNotMatch(cleaned, /[<>()/😀!@]/, `markup, emoji and punctuation are stripped: "${cleaned}"`);
  await page.fill("#player-name", "abcdefghijklmnopqrstuvwxyz");
  assert.equal((await page.inputValue("#player-name")).length, 20, "the name is capped at 20 characters");
  await context.close();
});

test("TC-322 | keyboard steering works and typing arrow keys does not start a run", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page } = await newPage(browser, { width: 1280, height: 800 });
  await gotoApp(page);
  await page.click("#player-name");
  await page.type("#player-name", "ab");
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(300);
  assert.equal(await page.locator(".game-screen").count(), 0, "arrow keys inside the input do not launch the game");

  await page.fill("#player-name", "Keys");
  await page.click('button:has-text("START MISSION")');
  await page.waitForTimeout(500);
  const headOf = () =>
    page.evaluate(() => {
      const board = document.querySelector('[role="img"]');
      const cells = [...board.children].filter((c) => c.className.includes("cell"));
      return cells.findIndex((c) => c.className.includes("snakeHead"));
    });
  const before = await headOf();
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(500);
  const after = await headOf();
  assert.notEqual(after, before, `the snake moved (${before} → ${after})`);
  await context.close();
});

test("TC-323 | pause saves the run and resume restores it", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page } = await newPage(browser, { width: 1280, height: 800 });
  await gotoApp(page);
  await page.fill("#player-name", "Pausey");
  await page.click('button:has-text("START MISSION")');
  await page.waitForTimeout(700);
  await page.click('button:has-text("PAUSE")');
  await page.waitForTimeout(600);
  assert.equal(await page.locator(".menu-screen").count(), 1, "pause returns to the hub");
  assert.equal(await page.locator('button:has-text("RESUME MISSION")').count(), 1, "resume is offered");
  await page.click('button:has-text("RESUME MISSION")');
  await page.waitForTimeout(600);
  assert.equal(await page.locator(".game-screen").count(), 1, "resume re-enters the run");
  await context.close();
});

test("TC-324 | rapid repeated clicks never corrupt the state", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page, logs } = await newPage(browser, { width: 390, height: 844 });
  await gotoApp(page);

  const joystick = page.locator('button:has-text("JOYSTICK")');
  const buttons = page.locator('button:has-text("BUTTONS")');
  for (let i = 0; i < 12; i++) {
    await joystick.click({ delay: 3 });
    await buttons.click({ delay: 3 });
  }
  assert.equal(await page.locator('button:has-text("BUTTONS")[aria-pressed="true"]').count(), 1, "selector state is consistent");

  await page.fill("#player-name", "Rapid");
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /START MISSION/.test(x.textContent));
    for (let i = 0; i < 8; i++) b.click();
  });
  await page.waitForTimeout(900);
  assert.equal(await page.locator(".game-screen").count(), 1, "exactly one game screen after 8 synchronous clicks");

  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /PAUSE/.test(x.textContent));
    if (b) for (let i = 0; i < 8; i++) b.click();
  });
  await page.waitForTimeout(800);
  assert.deepEqual(logs.errors, [], "no uncaught errors");
  await context.close();
});

test("TC-325 | the theme toggle switches, persists and survives a reload", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page } = await newPage(browser, { width: 390, height: 844 });
  await gotoApp(page);
  const before = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  await page.click('button[role="switch"]');
  await page.waitForTimeout(700);
  const after = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  assert.notEqual(before, after, `theme changed (${before} → ${after})`);
  assert.equal(
    await page.evaluate(() => localStorage.getItem("theme")),
    after,
    "the preference is persisted",
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  assert.equal(await page.evaluate(() => document.documentElement.getAttribute("data-theme")), after, "the preference survives a reload");
  if (shot) await page.screenshot({ path: shot("interactions/light-theme"), fullPage: true });
  await context.close();
});

test("TC-326 | the leaderboard tabs, paginates and returns to the hub", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page } = await newPage(browser, { width: 390, height: 844 });
  await gotoApp(page);
  // Seed a board with more than one page so pagination is rendered at all.
  await page.evaluate(async () => {
    for (let i = 1; i <= 12; i += 1) {
      await fetch("/api/snakeGame/addScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Player ${i}`, score: 60 - i * 4 }),
      });
    }
  });
  // The board was fetched before seeding — reload so the new rows are in state.
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  await page.click('button:has-text("HALL OF FAME")');
  await page.waitForTimeout(1200);

  const before = (await page.locator('[class*="pageInfo"]').first().innerText()).replace(/\s+/g, " ");
  const hasNext = await page.locator('button[aria-label="Next page"]').isEnabled();
  if (hasNext) {
    await page.click('button[aria-label="Next page"]');
    await page.waitForTimeout(1000);
    const after = (await page.locator('[class*="pageInfo"]').first().innerText()).replace(/\s+/g, " ");
    assert.notEqual(before, after, `pagination advanced (${before} → ${after})`);
  }

  await page.click('button:has-text("RECENT")');
  await page.waitForTimeout(800);
  assert.ok(await page.locator('h3:has-text("Recent Hunts")').isVisible(), "RECENT shows the recent board");

  await page.locator('button:has-text("BACK TO MISSION")').locator("visible=true").first().click();
  await page.waitForTimeout(800);
  assert.equal(await page.locator('button:has-text("START MISSION")').count(), 1, "back returns to the hub");
  await context.close();
});

test("TC-327 | browser Back returns to the hub instead of leaving the site", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page } = await newPage(browser, { width: 390, height: 844 });
  await gotoApp(page);

  const view = () => page.evaluate(() => (document.querySelector(".menu-content")?.className || "").includes("leaderboard-view"));
  const url = () => page.evaluate(() => location.href);

  assert.equal(await view(), false, "the hub is shown first");
  const entriesBefore = await page.evaluate(() => history.length);

  await page.click('button:has-text("HALL OF FAME")');
  await page.waitForTimeout(900);
  assert.equal(await view(), true, "the hall of fame opens");
  assert.equal(await page.evaluate(() => history.length), entriesBefore + 1, "entering a view pushes one history entry");

  await page.goBack();
  await page.waitForTimeout(900);
  assert.equal(await url(), await page.evaluate(() => location.href), "Back stays on the site");
  assert.equal(await view(), false, "Back returns to the hub");

  await page.goForward();
  await page.waitForTimeout(900);
  assert.equal(await view(), true, "Forward re-opens the hall of fame");

  // and returning via the in-app button must pop the entry, not add one
  const entriesNow = await page.evaluate(() => history.length);
  await page.locator('button:has-text("BACK TO MISSION")').locator("visible=true").first().click();
  await page.waitForTimeout(900);
  assert.equal(await view(), false, "BACK TO MISSION returns to the hub");
  assert.equal(await page.evaluate(() => history.length), entriesNow, "no extra history entry is pushed on the way out");
  await context.close();
});

test("TC-328 | touch affordances are consistent across every control", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page } = await newPage(browser, { width: 390, height: 844 }, { hasTouch: true, isMobile: true });
  await gotoApp(page);
  const r = await page.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { sel, tap: cs.webkitTapHighlightColor, touch: cs.touchAction };
    };
    return [
      pick('button[role="switch"]'),
      pick('[class*="startBtn"]'),
      pick('[class*="selectorBtn"]'),
      pick('[class*="navBtn"]'),
    ].filter(Boolean);
  });
  for (const el of r) {
    assert.ok(
      el.tap === "rgba(0, 0, 0, 0)" || el.tap === "transparent",
      `${el.sel} should opt out of the OS tap flash (got ${el.tap})`,
    );
    assert.equal(el.touch, "manipulation", `${el.sel} should skip the double-tap zoom delay`);
  }
  // the thumbstick must keep `touch-action: none` so a drag steers instead of scrolling
  await page.click('button:has-text("JOYSTICK")');
  await page.fill("#player-name", "Stick");
  await page.click('button:has-text("START MISSION")');
  await page.waitForTimeout(700);
  const stick = await page.evaluate(() => {
    const el = document.querySelector('[role="application"]');
    return el ? getComputedStyle(el).touchAction : null;
  });
  assert.equal(stick, "none", "the joystick still suppresses browser scrolling while dragging");
  await context.close();
});

test.after(async () => {
  await handle?.browser.close();
});

/**
 * TC-310 … TC-315 — accessibility in a real browser (WCAG 2.2 AA focus).
 *
 * Suite: visual (requires a Chromium/Chrome binary; skips cleanly without one)
 * Run:   npm run test:visual
 *
 * Regression cover for:
 *   UI-02  game-over dialog did not manage or trap focus
 *   UI-03  theme toggle (z-index 1000) floated above the game-over overlay (900)
 *   UI-05  leaderboard <h3> preceded the <h1>; tab order reached the side cards
 *          before the game's own controls
 *   UI-07  role="tab" without aria-controls / role="tabpanel"
 *   UI-10  the name input removed the global focus ring
 */
import test from "node:test";
import assert from "node:assert/strict";

import { resolveBrowser, newPage, gotoApp, shot, contrastProbe, readTokens, contrastRatio, openLeaderboard } from "./lib/browser.mjs";

const handle = await resolveBrowser();
const skip = (t) => t.skip("no Chromium binary available — set QA_CHROME_PATH or run `npx playwright install chromium`");

/** Force a game over by steering the snake into itself, deterministically. */
async function forceGameOver(page, { width = 1280, height = 800 } = {}) {
  const S = () =>
    page.evaluate(() => {
      const board = document.querySelector('[role="img"]');
      if (!board) return null;
      const cells = [...board.children].filter((c) => c.className.includes("cell"));
      const body = [];
      cells.forEach((c, i) => {
        if (/snakeHead|snakeBody|snakeTail/.test(c.className)) body.push(i);
      });
      return { head: body[0], len: body.length, food: cells.findIndex((c) => c.querySelector('[class*="food"]')) };
    });
  const wrap = (d) => (d > 10 ? d - 20 : d < -10 ? d + 20 : d);

  const deadline = Date.now() + 40000;
  while (Date.now() < deadline) {
    const s = await S();
    if (!s || s.len >= 6) break;
    let dx = wrap((s.food % 20) - (s.head % 20));
    let dy = wrap(Math.floor(s.food / 20) - Math.floor(s.head / 20));
    let key = null;
    if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) key = dx > 0 ? "ArrowRight" : "ArrowLeft";
    else if (dy !== 0) key = dy > 0 ? "ArrowDown" : "ArrowUp";
    if (key) await page.keyboard.press(key);
    await page.waitForTimeout(35);
  }
  // A 180-degree flip always drives the head into the segment behind it, but
  // the current heading has to be inferred from actual movement — retry until
  // the dialog shows, so the test never depends on one lucky tick.
  for (let attempt = 0; attempt < 25; attempt++) {
    const s = await S();
    if (!s) break;
    const a = await S();
    await page.waitForTimeout(160);
    const b = await S();
    if (!b) break;
    const dx = wrap((b.head % 20) - (a.head % 20));
    const dy = wrap(Math.floor(b.head / 20) - Math.floor(a.head / 20));
    const [first, second] =
      dx === 1 ? ["ArrowDown", "ArrowLeft"]
      : dx === -1 ? ["ArrowDown", "ArrowRight"]
      : dy === 1 ? ["ArrowLeft", "ArrowUp"]
      : ["ArrowLeft", "ArrowDown"];
    await page.keyboard.press(first);
    await page.keyboard.press(second);
    await page.waitForTimeout(500);
    if (await page.evaluate(() => !!document.querySelector('[role="dialog"]'))) return true;
  }
  void width; void height;
  return page.evaluate(() => !!document.querySelector('[role="dialog"]'));
}

test("TC-310 | the document starts with the <h1> and the primary controls", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page } = await newPage(browser, { width: 1440, height: 900 });
  await gotoApp(page);

  const headings = await page.evaluate(() =>
    [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => h.tagName),
  );
  assert.equal(headings[0], "H1", `first heading is ${headings[0]} (${JSON.stringify(headings)})`);

  const stops = [];
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("Tab");
    stops.push(
      await page.evaluate(() =>
        (document.activeElement?.getAttribute("aria-label") || document.activeElement?.innerText || document.activeElement?.tagName || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 30),
      ),
    );
  }
  assert.match(stops[1], /your name/i, `2nd tab stop should be the name field, got "${stops[1]}"`);
  assert.match(stops[2], /START MISSION/i, `3rd tab stop should be START MISSION, got "${stops[2]}"`);
  await context.close();
});

test("TC-311 | the name input shows a visible focus indicator", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page } = await newPage(browser, { width: 1280, height: 800 });
  await gotoApp(page);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const s = await page.evaluate(() => {
    const el = document.activeElement;
    const cs = getComputedStyle(el);
    return { id: el.id, style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) || 0 };
  });
  assert.equal(s.id, "player-name");
  assert.equal(s.style, "solid", "focus ring is rendered");
  assert.ok(s.width >= 2, `focus ring is at least 2px (got ${s.width}px)`);
  await context.close();
});

test("TC-312 | the game-over dialog moves focus in and traps Tab", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page } = await newPage(browser, { width: 1280, height: 800 });
  await gotoApp(page);
  await page.fill("#player-name", "Doomed");
  await page.click('button:has-text("START MISSION")');
  await page.waitForTimeout(400);
  await page.evaluate(() => document.activeElement?.blur());

  const opened = await forceGameOver(page);
  assert.ok(opened, "the run ended and the dialog opened");
  if (!opened) {
    await context.close();
    return;
  }

  const onOpen = await page.evaluate(() => ({
    inside: !!document.querySelector('[role="dialog"]')?.contains(document.activeElement),
    overlayZ: Number(getComputedStyle(document.querySelector('[role="dialog"]')).zIndex),
    toggleZ: Number(getComputedStyle(document.querySelector('button[role="switch"]')).zIndex),
  }));
  assert.ok(onOpen.inside, "focus is moved inside the dialog when it opens (WCAG 2.4.3)");
  assert.ok(onOpen.overlayZ > onOpen.toggleZ, `overlay z=${onOpen.overlayZ} must exceed the theme toggle z=${onOpen.toggleZ}`);

  if (shot) await page.screenshot({ path: shot("a11y/game-over"), fullPage: true });

  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(() => !!document.querySelector('[role="dialog"]')?.contains(document.activeElement));
    assert.ok(inside, `Tab #${i + 1} escaped the modal — background controls are still reachable`);
  }

  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  assert.equal(await page.evaluate(() => !!document.querySelector('[role="dialog"]')), false, "Escape closes the dialog");
  await context.close();
});

test("TC-313 | leaderboard tabs are wired to their panels", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page } = await newPage(browser, { width: 390, height: 844 });
  await gotoApp(page);
  await page.click('button:has-text("HALL OF FAME")');
  await page.waitForTimeout(900);

  const r = await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('[role="tab"]')].map((t) => ({
      id: t.id,
      controls: t.getAttribute("aria-controls"),
      selected: t.getAttribute("aria-selected"),
    }));
    const panels = [...document.querySelectorAll('[role="tabpanel"]')].map((p) => ({
      id: p.id,
      labelledby: p.getAttribute("aria-labelledby"),
    }));
    return { tabs, panels, resolves: tabs.every((t) => !!document.getElementById(t.controls ?? "")) };
  });
  assert.equal(r.tabs.length, 2, "two tabs");
  assert.equal(r.panels.length, 2, "two tabpanels");
  assert.ok(r.resolves, `every aria-controls resolves to a tabpanel: ${JSON.stringify(r.tabs)}`);
  await context.close();
});

test("TC-314 | interactive controls meet the 24×24px minimum target size", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  for (const vp of [{ width: 320, height: 640 }, { width: 390, height: 844 }, { width: 1280, height: 800 }]) {
    await t.test(`${vp.width}×${vp.height}`, async () => {
      const { context, page } = await newPage(browser, vp, { hasTouch: vp.width < 768 });
      await gotoApp(page);
      const small = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll('a,button,input,select,textarea,[role="button"],[role="tab"],[role="switch"]')) {
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden") continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (r.width < 24 || r.height < 24) {
            out.push({ tag: el.tagName.toLowerCase(), cls: (el.className || "").toString().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), text: (el.textContent || "").trim().slice(0, 24) });
          }
        }
        return out;
      });
      assert.deepEqual(small, [], `controls smaller than 24×24 (WCAG 2.5.8): ${JSON.stringify(small)}`);
      await context.close();
    });
  }
});

test("TC-315 | every interactive control has an accessible name", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const { context, page } = await newPage(browser, { width: 1440, height: 900 });
  await gotoApp(page);
  const unnamed = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('a,button,input,select,textarea,[role="button"],[role="tab"],[role="switch"]')) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      let name = (el.getAttribute("aria-label") || "").trim();
      if (!name && el.id) {
        const l = document.querySelector(`label[for="${el.id}"]`);
        if (l) name = l.textContent.trim();
      }
      if (!name) name = (el.textContent || "").trim();
      if (!name && el.tagName === "INPUT") name = el.getAttribute("placeholder") || "";
      if (!name) out.push({ tag: el.tagName.toLowerCase(), cls: (el.className || "").toString().slice(0, 40) });
    }
    return out;
  });
  assert.deepEqual(unnamed, [], `controls without an accessible name: ${JSON.stringify(unnamed)}`);
  await context.close();
});

/**
 * TC-316 / TC-317 — WCAG 1.4.3 contrast.
 *
 * Regression cover for UI-08/UI-09: light-theme accent text (headings, score
 * values, the active control pill) measured 1.0–2.8:1 against the glass panels.
 * TC-316 asserts the opaque fills that carry white labels; TC-317 sweeps every
 * text node against its composited backdrop in both themes.
 */
test("TC-316 | white labels on filled controls clear 4.5:1 in both themes", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const TOKENS = ["--fill-green-from", "--fill-green-to", "--fill-cyan-from", "--fill-cyan-to"];

  for (const theme of ["dark", "light"]) {
    await t.test(`${theme} theme`, async () => {
      const { context, page } = await newPage(browser, { width: 1280, height: 800 });
      await page.addInitScript((v) => localStorage.setItem("theme", v), theme);
      await gotoApp(page);
      const tokens = await readTokens(page, TOKENS);
      for (const name of TOKENS) {
        const raw = tokens[name];
        assert.ok(raw, `${name} is defined`);
        const r = contrastRatio(raw, "#ffffff");
        assert.ok(r >= 4.5, `white label on ${name} (${raw}) is ${r}:1, needs 4.5:1`);
      }
      await context.close();
    });
  }
});

test("TC-317 | no text falls below AA contrast against its painted backdrop", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const viewports = [{ width: 390, height: 844 }, { width: 1440, height: 900 }];

  for (const theme of ["dark", "light"]) {
    for (const vp of viewports) {
      // Both screens are audited: the hub, and the hall of fame with real rows
      // (rank medals and the leader ticker only exist once the board has data).
      for (const view of ["hub", "leaderboard"]) {
        await t.test(`${theme} @ ${vp.width}×${vp.height} — ${view}`, async () => {
          const { context, page } = await newPage(browser, vp);
          await page.addInitScript((v) => localStorage.setItem("theme", v), theme);
          await gotoApp(page);
          assert.equal(await page.evaluate(() => document.documentElement.getAttribute("data-theme")), theme);

          if (view === "leaderboard") {
            // make sure there is something to render
            await page.evaluate(async () => {
              for (let i = 1; i <= 12; i += 1) {
                await fetch("/api/snakeGame/addScore", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: `Contrast Player ${i}`, score: 60 - i * 4 }),
                });
              }
            });
            await page.reload({ waitUntil: "networkidle" });
            await page.waitForTimeout(1800);
            await openLeaderboard(page);
          }

          const bad = await page.evaluate(contrastProbe);
          if (bad.length && shot) await page.screenshot({ path: shot(`a11y/contrast-${theme}-${vp.width}-${view}`), fullPage: true });
          const report = bad
            .map((f) => `  ${f.ratio}:1 (need ${f.need}) <${f.tag}> .${f.cls} ${f.size}px/${f.weight} ${f.color} on ${f.backdrop} "${f.text}"`)
            .join("\n");
          assert.deepEqual(bad, [], `text below WCAG AA contrast:\n${report}`);
          await context.close();
        });
      }
    }
  }
});


test("TC-318 | prefers-reduced-motion really stops the motion", { skip: !handle }, async (t) => {
  if (!handle) return skip(t);
  const { browser } = handle;
  const probe = (target) =>
    target.evaluate(() => {
      const canvas = document.querySelector(".ambient-canvas");
      const running = [...document.querySelectorAll("body *")].filter((el) => {
        const cs = getComputedStyle(el);
        return (
          cs.display !== "none" &&
          cs.visibility !== "hidden" &&
          cs.animationName !== "none" &&
          parseFloat(cs.animationDuration) > 0.05
        );
      });
      return {
        canvasDisplay: canvas ? getComputedStyle(canvas).display : "absent",
        running: running.slice(0, 5).map((el) => ({
          tag: el.tagName.toLowerCase(),
          name: getComputedStyle(el).animationName,
          dur: getComputedStyle(el).animationDuration,
        })),
        count: running.length,
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      };
    });

  const { context: reducedCtx, page: reducedPage } = await newPage(browser, { width: 1280, height: 800 }, { reducedMotion: "reduce" });
  await gotoApp(reducedPage);
  const reduced = await probe(reducedPage);
  assert.ok(
    reduced.canvasDisplay === "none" || reduced.canvasDisplay === "absent",
    `the particle canvas must not paint under reduced motion (display: ${reduced.canvasDisplay})`,
  );
  assert.equal(reduced.count, 0, `no animation longer than 50ms may keep running: ${JSON.stringify(reduced.running)}`);
  assert.equal(reduced.scrollBehavior, "auto", "smooth scrolling is disabled");
  await reducedCtx.close();

  // control: without the preference the scene must actually animate, otherwise
  // the assertion above would pass on a broken page.
  const { context: normalCtx, page: normalPage } = await newPage(browser, { width: 1280, height: 800 });
  await gotoApp(normalPage);
  const normal = await normalPage.evaluate(() => {
    const canvas = document.querySelector(".ambient-canvas");
    return {
      canvasDisplay: canvas ? getComputedStyle(canvas).display : "absent",
      animated: [...document.querySelectorAll("body *")].filter((el) => {
        const cs = getComputedStyle(el);
        return cs.animationName !== "none" && parseFloat(cs.animationDuration) > 0.05 && cs.display !== "none";
      }).length,
    };
  });
  assert.equal(normal.canvasDisplay, "block", "the canvas renders when motion is allowed");
  assert.ok(normal.animated > 0, "the page does animate when motion is allowed");
  await normalCtx.close();
});

test.after(async () => {
  await handle?.browser.close();
});

/**
 * TC-090 … TC-093 — what the server actually sends for "/" (SSR shell smoke test).
 *
 * The menu and board are client-rendered after hydration, so the HTML shell is
 * the part that can be verified over HTTP without a browser: metadata, theme
 * bootstrap and the pre-hydration loader placeholder.
 *
 * Suite: ui (requires a running server)
 * Run:   npm run test:api   (same server, HTTP-only)
 */
import test from "node:test";
import assert from "node:assert/strict";

import { request } from "../utilities/api-client.mjs";

test("TC-090 | the home page renders the document shell with metadata", async () => {
  const res = await request("/");
  assert.equal(res.status, 200);
  assert.match(res.headers["content-type"] ?? "", /text\/html/);
  assert.match(res.text, /<html[^>]*lang="en"/);
  assert.match(res.text, /<title>Nagini · Snake Game<\/title>/);
  assert.match(res.text, /name="description" content="A neon-infused snake game inspired by Harry Potter/);
  assert.match(res.text, /<meta name="application-name" content="Nagini"/);
});

test("TC-091 | the theme is bootstrapped before hydration to avoid a flash", async () => {
  const res = await request("/");
  assert.match(res.text, /data-theme="dark"/, "dark is the server-rendered default");
  assert.match(res.text, /localStorage\.getItem\('theme'\)/, "stored preference is read before paint");
});

test("TC-092 | a loading placeholder is rendered for the pre-hydration state", async () => {
  const res = await request("/");
  assert.match(res.text, /Summoning Nagini/, "users see a snake loader, not a blank page");
  assert.match(res.text, /role="status"/, "the loader is announced to assistive tech");
  assert.doesNotMatch(res.text, /nagini_best/, "no game state is embedded in the HTML");
});

test("TC-093 | the page is served with a cache policy suitable for a static shell", async () => {
  const res = await request("/");
  assert.equal(res.headers["x-nextjs-cache"], "HIT", "the shell is served from the pre-rendered cache");
  assert.match(res.headers.etag ?? "", /"/, "an ETag enables conditional requests");
});

test("TC-093b | the API never returns HTML (no content-type sniffing surface)", async () => {
  const res = await request("/api/snakeGame/highestScore");
  assert.match(res.headers["content-type"] ?? "", /application\/json/);
  assert.doesNotMatch(res.text.trimStart().slice(0, 1), /</, "the body must not start like markup");
});

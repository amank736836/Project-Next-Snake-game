/**
 * TC-110 … TC-115 — HTTP attack surface: headers, CORS, error leakage.
 *
 * Findings are recorded as todo tests so the suite stays green while the gap is
 * tracked in harness/bugs/known-issues.md.
 *
 * Suite: security (requires a running server)
 * Run:   npm run test:security
 */
import test from "node:test";
import assert from "node:assert/strict";

import { request, postJson } from "../utilities/api-client.mjs";

const SECURITY_HEADERS = [
  "content-security-policy",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "strict-transport-security",
  "permissions-policy",
];

test("TC-110 | characterisation: which security headers the deployment sends today", async (t) => {
  const res = await request("/");
  const present = SECURITY_HEADERS.filter((h) => res.headers[h]);
  const missing = SECURITY_HEADERS.filter((h) => !res.headers[h]);
  t.diagnostic(`present: ${present.length ? present.join(", ") : "(none)"}`);
  t.diagnostic(`missing: ${missing.join(", ")}`);
  assert.equal(res.status, 200);
});

test(
  "TC-110b | KNOWN ISSUE (BUG-015): no security headers are configured",
  { todo: "BUG-015 — add CSP, X-Content-Type-Options, Referrer-Policy, frame-ancestors and HSTS at the edge" },
  async () => {
    const res = await request("/");
    const missing = SECURITY_HEADERS.filter((h) => !res.headers[h]);
    assert.deepEqual(missing, [], `missing security headers: ${missing.join(", ")}`);
  },
);

test(
  "TC-111 | KNOWN ISSUE (BUG-015): the server advertises its framework",
  { todo: "BUG-015 — X-Powered-By: Next.js is an unnecessary fingerprinting signal" },
  async () => {
    const res = await request("/");
    assert.equal(res.headers["x-powered-by"], undefined);
  },
);

test("TC-112 | cross-origin writes are not authorised by CORS, but are also not blocked", async (t) => {
  const res = await postJson(
    "/api/snakeGame/addScore",
    { name: `CorsProbe${Date.now().toString(36)}`, score: 1 },
    { headers: { Origin: "https://evil.example" } },
  );
  t.diagnostic(`cross-origin POST returned ${res.status}; ACAO header: ${res.headers["access-control-allow-origin"] ?? "(absent)"}`);
  assert.equal(res.headers["access-control-allow-origin"], undefined, "no permissive CORS policy is published");
  assert.equal(res.status, 201, "documented: a simple cross-site POST still writes a score (no CSRF token, no origin check)");
});

test("TC-113 | OPTIONS preflight is answered without granting cross-origin access", async () => {
  const res = await request("/api/snakeGame/addScore", {
    method: "OPTIONS",
    headers: { Origin: "https://evil.example", "Access-Control-Request-Method": "POST" },
  });
  assert.ok([200, 204].includes(res.status));
  assert.equal(res.headers["access-control-allow-origin"], undefined);
});

test(
  "TC-114 | KNOWN ISSUE (BUG-014): internal error details are echoed to clients",
  { todo: "BUG-014 — return generic errors (500) instead of raw driver/runtime messages" },
  async () => {
    const res = await postJson("/api/snakeGame/addScore", { score: 5 });
    assert.doesNotMatch(res.json.message, /toLowerCase|ECONNREFUSED|Cannot read propert/, "raw exception text must not reach clients");
  },
);

test("TC-114b | characterisation: the 400 body for an invalid payload", async () => {
  const missingName = await postJson("/api/snakeGame/addScore", { score: 5 });
  assert.equal(missingName.status, 400);
  assert.match(missingName.json.message, /Cannot read properties of undefined/, "documented: a Node TypeError string is returned verbatim");
});

test("TC-115 | the API answers with JSON, so responses cannot be sniffed into markup", async () => {
  const res = await request("/api/snakeGame/highestScore");
  assert.match(res.headers["content-type"] ?? "", /application\/json/);
  assert.equal(res.headers["x-content-type-options"], undefined, "documented gap: nosniff is not set (see BUG-015)");
});

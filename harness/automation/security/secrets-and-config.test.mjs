/**
 * TC-122 … TC-125 — static security hygiene checks (no server required).
 *
 * These run against the repository itself: no committed secrets, no credentials
 * in the harness, and configuration that only reads connection strings from the
 * environment.
 *
 * Suite: security (static)
 * Run:   npm run test:security
 */
import test from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

import { REPO_ROOT } from "../utilities/env.mjs";

const trackedFiles = () =>
  execSync("git ls-files", { cwd: REPO_ROOT, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);

const readTracked = (file) => readFileSync(`${REPO_ROOT}/${file}`, "utf8");

const SECRET_PATTERNS = [
  { name: "MongoDB connection string with credentials", re: /mongodb(\+srv)?:\/\/[^\s"'`]*:[^\s"'`@]+@/ },
  { name: "AWS access key", re: /AKIA[0-9A-Z]{16}/ },
  { name: "Google API key", re: /AIza[0-9A-Za-z_-]{35}/ },
  { name: "Slack token", re: /xox[baprs]-[0-9A-Za-z-]{10,}/ },
  { name: "Private key block", re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "GitHub personal access token", re: /gh[pousr]_[0-9A-Za-z]{36,}/ },
  { name: "Hardcoded bearer token", re: /(api[_-]?key|secret|password|passwd|token)\s*[:=]\s*["'][^"'{}$][^"']{7,}["']/i },
];

test("TC-122 | no credential files are tracked by git", () => {
  const offenders = trackedFiles().filter((file) =>
    /(^|\/)\.env($|\.)|\.pem$|\.p12$|credentials\.json$|service-account.*\.json$/.test(file),
  );
  assert.deepEqual(offenders, [], `credential-like files are committed: ${offenders.join(", ")}`);
});

test("TC-123 | no hard-coded secrets exist in tracked source", () => {
  const scanTargets = trackedFiles().filter((file) => /\.(ts|tsx|js|mjs|json|md|yml|yaml|sh)$/.test(file));
  const hits = [];
  for (const file of scanTargets) {
    const content = readTracked(file);
    for (const { name, re } of SECRET_PATTERNS) {
      const match = content.match(re);
      if (match) hits.push(`${file}: ${name} → ${match[0].slice(0, 60)}`);
    }
  }
  assert.deepEqual(hits, [], `possible secrets found:\n${hits.join("\n")}`);
});

test("TC-124 | the database password can only come from the environment", () => {
  const dbSource = readTracked("src/lib/db.ts");
  assert.match(dbSource, /process\.env\.DATABASE_URL/, "the connection string must be read from the environment");
  assert.doesNotMatch(dbSource, /mongodb(\+srv)?:\/\//, "no default/fallback connection string may be compiled in");

  const exampleFiles = trackedFiles().filter((file) => /\.env\.example$/.test(file));
  for (const file of exampleFiles) {
    const content = readTracked(file);
    assert.doesNotMatch(content, /:\/\/[^"']*:[^"'@]+@/, `${file} must not contain real credentials`);
  }
  assert.ok(existsSync(`${REPO_ROOT}/.gitignore`) && readTracked(".gitignore").includes(".env"), ".env must stay ignored");
});

test("TC-125 | no runtime stack traces are shipped to the browser bundle", () => {
  const offenders = trackedFiles().filter((file) => file.startsWith("public/") && /\.map$/.test(file));
  assert.deepEqual(offenders, [], "source maps in public/ would expose the source");
});

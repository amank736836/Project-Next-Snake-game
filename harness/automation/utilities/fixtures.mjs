/**
 * Test data loader. All fixtures live under harness/test-data/ as plain JSON so
 * they can be read by automated suites, manual testers and AI agents alike.
 */
import { readFileSync } from "node:fs";
import { HARNESS_ROOT, RUN_TAG } from "./env.mjs";

export const loadFixture = (relativePath) =>
  JSON.parse(readFileSync(`${HARNESS_ROOT}/test-data/${relativePath}`, "utf8"));

/** Makes every fixture name unique per run so suites never collide. */
export const tagName = (name) => `${name}${RUN_TAG.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6)}`;

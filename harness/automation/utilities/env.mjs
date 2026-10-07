/**
 * Shared environment/configuration helpers for every automated suite.
 *
 * No secrets are ever stored here: connection strings and credentials always
 * come from the environment (see harness/ai/test-generation-rules.md).
 */
import os from "node:os";

export const REPO_ROOT = new URL("../../../", import.meta.url).pathname.replace(/\/$/, "");
export const HARNESS_ROOT = `${REPO_ROOT}/harness`;

/** Default target for API/UI/performance/security suites (production server). */
export const BASE_URL = (process.env.HARNESS_BASE_URL ?? "http://127.0.0.1:3100").replace(/\/$/, "");

/** Target for the database-degradation suite (server started with a bad DATABASE_URL). */
export const DB_MODE_BASE_URL = (process.env.HARNESS_DB_BASE_URL ?? "http://127.0.0.1:3101").replace(/\/$/, "");

/** Execution id — one id per full or partial execution, e.g. RUN-2026-001. */
export const RUN_ID = process.env.HARNESS_RUN_ID ?? `RUN-${new Date().toISOString().slice(0, 10)}-adhoc`;

/** Unique suffix so parallel/interrupted runs never clash on scoreboard data. */
export const RUN_TAG = process.env.HARNESS_RUN_TAG ?? `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

export const testName = (label) => `${label}-${RUN_TAG}`;

export const environmentSummary = () => ({
  runId: RUN_ID,
  baseUrl: BASE_URL,
  dbModeBaseUrl: DB_MODE_BASE_URL,
  node: process.version,
  platform: `${os.platform()} ${os.release()} ${os.arch()}`,
  nodeEnv: process.env.NODE_ENV ?? "(unset)",
});

/** Collects measurements inside a test and writes them to test-results. */
export class Measurements {
  constructor(area) {
    this.area = area;
    this.rows = [];
  }

  add(name, value, unit = "ms") {
    this.rows.push({ name, value, unit });
  }

  percentile(values, p) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
  }
}

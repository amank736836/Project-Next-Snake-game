/**
 * Tiny HTTP client shared by the API, performance and security suites.
 *
 * Built on the runtime's own `fetch` — no HTTP or testing dependency is added for
 * this. Every call returns the pieces the assertions need: status, headers, body
 * text, parsed JSON when the body is JSON, and how long the round trip took.
 *
 * Error responses are returned, never thrown: several suites assert *on* 4xx
 * behaviour (validation gaps, an unreachable database), so the caller decides
 * what a given status means.
 */
import { BASE_URL } from "./env.mjs";

export { BASE_URL };

const baseFor = (options = {}) => (options.base ?? BASE_URL).replace(/\/$/, "");

/**
 * Perform one request and time it.
 *
 * @param {string} path e.g. "/api/snakeGame/highestScore?page=1&limit=5"
 * @param {{method?: string, body?: unknown, headers?: Record<string,string>, base?: string}} [options]
 *   `body` is sent byte-for-byte when it is a string or Uint8Array, otherwise it
 *   is JSON-encoded. `base` overrides the target server (used by the database suite).
 */
export async function request(path, options = {}) {
  const { method = "GET", body, headers = {}, base } = options;
  const init = { method, headers: { ...headers } };

  if (body !== undefined) {
    if (typeof body === "string" || body instanceof Uint8Array) {
      init.body = body;
    } else {
      init.body = JSON.stringify(body);
      if (!("content-type" in init.headers)) init.headers["content-type"] = "application/json";
    }
  }

  const started = performance.now();
  const response = await fetch(`${baseFor({ base })}${path}`, init);
  const text = await response.text();
  const durationMs = performance.now() - started;

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }

  return {
    path,
    method,
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    text,
    json,
    durationMs,
  };
}

/** GET helper — returns the raw result object, so callers read `.json`. */
export async function getJson(path, options = {}) {
  return request(path, { ...options, method: "GET" });
}

/** POST helper that JSON-encodes the body (a `status` in the 2xx/4xx range is returned, not thrown). */
export async function postJson(path, body, options = {}) {
  return request(path, {
    ...options,
    method: "POST",
    body,
    headers: { "content-type": "application/json", ...(options.headers ?? {}) },
  });
}

/** POST helper for byte-exact bodies: malformed JSON, empty bodies, oversized payloads. */
export async function postRaw(path, rawBody, options = {}) {
  return request(path, {
    ...options,
    method: "POST",
    body: rawBody,
    headers: { "content-type": "application/json", ...(options.headers ?? {}) },
  });
}

/** Convenience: one page of the Hall of Fame. */
export const fetchHighest = (page = 1, limit = 5, options = {}) =>
  getJson(`/api/snakeGame/highestScore?page=${page}&limit=${limit}`, options);

/** Convenience: the most recent submissions (`{ base }` selects the server). */
export const fetchLatest = (options = {}) => getJson("/api/snakeGame/latestScore", options);

/**
 * Summary statistics for the performance suite: p50/p95/max and the average.
 * @param {number[]} samples milliseconds
 */
export function stats(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const at = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    count: sorted.length,
    avgMs: Number((sum / sorted.length).toFixed(2)),
    p50Ms: Number(at(0.5).toFixed(2)),
    p95Ms: Number(at(0.95).toFixed(2)),
    maxMs: Number(sorted.at(-1).toFixed(2)),
  };
}

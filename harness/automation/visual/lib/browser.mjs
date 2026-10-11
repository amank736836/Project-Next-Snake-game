/**
 * Shared Playwright plumbing for the visual / responsive / a11y suites.
 *
 * The suites drive a **real** browser, so they need a Chromium/Chrome binary.
 * Resolution order:
 *   1. $QA_CHROME_PATH        — an explicit executable (CI, sandboxes)
 *   2. Playwright's own build — `npx playwright install chromium`
 *   3. skip                    — the suite reports SKIP, never a false pass
 *
 * `playwright-core` is used instead of `playwright` so that `npm install` never
 * downloads ~150 MB of browsers for people who only run the other suites.
 */
import { existsSync } from "node:fs";
import { mkdirSync } from "node:fs";

/** Viewports the design is committed to supporting (see FEAT-011). */
export const VIEWPORTS = [
  { name: "mobile-320", width: 320, height: 640 },
  { name: "mobile-375", width: 375, height: 667 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-425", width: 425, height: 900 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "tablet-820", width: 820, height: 1180 },
  { name: "tablet-1024", width: 1024, height: 768 },
  { name: "laptop-1280", width: 1280, height: 800 },
  { name: "laptop-1366", width: 1366, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
  { name: "ultrawide-2560", width: 2560, height: 1440 },
  /* 200% and 400% zoom on a 1280×720 window (WCAG 1.4.10 reflow) */
  { name: "zoom-200", width: 640, height: 360 },
  { name: "zoom-400", width: 320, height: 180 },
  /* phone held sideways */
  { name: "landscape-844x390", width: 844, height: 390 },
];

export const BASE_URL = process.env.HARNESS_BASE_URL ?? "http://127.0.0.1:3100";

let cached;

/**
 * @returns {Promise<{browser: import('playwright-core').Browser}|null>}
 * `null` means "no browser available" — callers must skip, not pass.
 */
export async function resolveBrowser() {
  if (cached !== undefined) return cached;
  let chromium;
  try {
    ({ chromium } = await import("playwright-core"));
  } catch {
    cached = null;
    return cached;
  }

  const candidates = [];
  if (process.env.QA_CHROME_PATH) candidates.push(process.env.QA_CHROME_PATH);
  try {
    const p = chromium.executablePath();
    if (p) candidates.push(p);
  } catch {
    /* playwright-core without installed browsers throws here */
  }

  for (const executablePath of candidates) {
    if (!executablePath || !existsSync(executablePath)) continue;
    try {
      const browser = await chromium.launch({
        executablePath,
        args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--font-render-hinting=none"],
      });
      cached = { browser };
      return cached;
    } catch {
      /* try the next candidate */
    }
  }
  cached = null;
  return cached;
}

/** New page + console/network/error capture for one viewport. */
export async function newPage(browser, viewport, opts = {}) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    hasTouch: Boolean(opts.hasTouch),
    isMobile: Boolean(opts.isMobile),
    colorScheme: opts.colorScheme ?? "dark",
    reducedMotion: opts.reducedMotion ?? "no-preference",
  });
  const page = await context.newPage();
  const logs = { console: [], errors: [], failed: [] };
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") logs.console.push({ type: m.type(), text: m.text() });
  });
  page.on("pageerror", (e) => logs.errors.push(String(e)));
  page.on("requestfailed", (r) => logs.failed.push({ url: r.url(), error: r.failure()?.errorText }));
  page.on("response", (r) => {
    if (r.status() >= 400) logs.failed.push({ url: r.url(), status: r.status() });
  });
  return { context, page, logs };
}

export async function gotoApp(page) {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800); // hydration + entrance animations
}

/** Save a screenshot into the run's evidence folder. */
export function shot(name) {
  const dir = process.env.QA_SHOT_DIR;
  if (!dir) return null;
  mkdirSync(dir, { recursive: true });
  return `${dir}/${name}.png`;
}

/**
 * Horizontal-overflow probe.
 *
 * `<body>` sets `overflow-x: hidden`, so an overflowing element does not create
 * a scrollbar — it is silently *clipped* and can never be reached. That is why
 * we compare `scrollWidth` against the viewport instead of looking for a
 * scrollbar, and why we filter out the decorative ambient layers.
 */
export const OVERFLOW_PROBE = `(() => {
  const vw = window.innerWidth;
  const de = document.documentElement;
  const decorative = (el) =>
    el.closest('.ambient') !== null ||
    (el.className || '').toString().includes('ambient');

  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
    if (cs.pointerEvents === 'none') continue;      // shine sweeps, glows, confetti
    if (decorative(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // An element clipped by an overflow:hidden ancestor is not a layout bug.
    let clipped = false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const pcs = getComputedStyle(p);
      if (pcs.overflowX === 'hidden' || pcs.overflowX === 'clip') { clipped = true; break; }
    }
    if (clipped) continue;
    if (r.right > vw + 1 || r.left < -1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 70),
        left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
        text: (el.textContent || '').trim().slice(0, 40),
      });
    }
  }
  return {
    viewportWidth: vw,
    docScrollWidth: de.scrollWidth,
    bodyScrollWidth: document.body ? document.body.scrollWidth : 0,
    overflows: de.scrollWidth > vw + 1,
    offenders,
  };
})()`;

/**
 * Text-contrast probe, evaluated inside the page.
 *
 * Self-contained on purpose: Playwright serialises only the function body, so
 * every helper must live inside it.
 *
 * `background-color` alone is not enough on this design:
 *   - CTA buttons are painted with a `linear-gradient`, so their
 *     `background-color` computes to `transparent`;
 *   - the active control/tab label sits on a *sibling* pill element, not on an
 *     ancestor background.
 * So the backdrop is resolved by hit-testing the real paint stack with
 * `document.elementsFromPoint()` at the text's centre, compositing every
 * translucent layer until an opaque one (solid or gradient) is reached.
 *
 * Gradient-clipped text (the "Nagini"/"GAME OVER" wordmarks) reports
 * `color: transparent`; that is legitimate here because the visible colour
 * comes from the gradient stops, so those nodes are skipped.
 *
 * @returns {{text: string, tag: string, cls: string, color: string, size: number,
 *            weight: number, need: number, ratio: number, backdrop: string}[]}
 */
export function contrastProbe() {
  const COLOR_RE = /rgba?\(([^)]+)\)|#([0-9a-fA-F]{3,8})\b/g;

  const parseColor = (str) => {
    if (!str) return null;
    const fn = /rgba?\(([^)]+)\)/.exec(str);
    if (fn) {
      const p = fn[1].split(",").map((v) => parseFloat(v.trim()));
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    }
    const hex = /#([0-9a-fA-F]{3,8})/.exec(str);
    if (hex) {
      let h = hex[1];
      if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
      };
    }
    return null;
  };

  const lin = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
  const over = (f, b) => ({
    r: f.r * f.a + b.r * (1 - f.a),
    g: f.g * f.a + b.g * (1 - f.a),
    b: f.b * f.a + b.b * (1 - f.a),
    a: 1,
  });

  /** Average of a gradient's stop colours, or null if it carries no solid ink. */
  const gradientFill = (backgroundImage) => {
    if (!backgroundImage || backgroundImage === "none" || !/gradient\(/.test(backgroundImage)) return null;
    const stops = [...backgroundImage.matchAll(COLOR_RE)].map((m) => parseColor(m[0])).filter((c) => c && c.a > 0);
    if (stops.length < 2) return null;
    const avg = stops.reduce((acc, c) => ({ r: acc.r + c.r * c.a, g: acc.g + c.g * c.a, b: acc.b + c.b * c.a, a: acc.a + c.a }), { r: 0, g: 0, b: 0, a: 0 });
    const total = stops.reduce((s, c) => s + c.a, 0) || 1;
    return { r: avg.r / total, g: avg.g / total, b: avg.b / total, a: Math.min(1, avg.a / stops.length) };
  };

  /** Composite the layers actually painted underneath `el`. */
  const backdropOf = (el) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let stack = [];
    if (cx >= 0 && cy >= 0 && cx < innerWidth && cy < innerHeight) {
      stack = document.elementsFromPoint(cx, cy).filter((n) => !el.contains(n) || n === el);
    }
    // Fall back to the ancestor chain when the text sits outside the viewport.
    if (!stack.length) stack = [];
    const chain = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) chain.push(n);
    const seen = new Set();
    const layers = [];
    for (const node of [...stack, ...chain]) {
      if (!node || seen.has(node)) continue;
      seen.add(node);
      const cs = getComputedStyle(node);
      const solid = parseColor(cs.backgroundColor);
      const grad = gradientFill(cs.backgroundImage);
      // A gradient paints over the element's own background-color.
      if (grad && grad.a >= 0.99) {
        layers.push(grad);
        break;
      }
      if (grad) layers.push(grad);
      if (solid && solid.a > 0) {
        layers.push(solid);
        if (solid.a >= 1) break;
      }
    }
    let base = parseColor(getComputedStyle(document.body).backgroundColor);
    if (!base || base.a < 1) base = { r: 233, g: 237, b: 247, a: 1 };
    let out = base;
    for (let i = layers.length - 1; i >= 0; i -= 1) out = over(layers[i], out);
    return out;
  };

  const bad = [];
  for (const el of document.querySelectorAll("main *")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3 && n.textContent.trim())
      .map((n) => n.textContent.trim())
      .join(" ");
    if (!own) continue;
    // Emoji/symbol-only content is drawn by a colour font, so `color` does not
    // describe what is painted; those nodes are decorative here (aria-hidden)
    // and are not measurable as text.
    if (!/[\p{L}\p{N}]/u.test(own.replace(/\p{Extended_Pictographic}/gu, ""))) continue;
    if (cs.webkitTextFillColor === "rgba(0, 0, 0, 0)") continue; // gradient-clipped wordmark
    const fg = parseColor(cs.color);
    if (!fg || fg.a === 0) continue;
    const bg = backdropOf(el);
    const blended = over(fg, bg);
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const need = size >= 24 || (weight >= 700 && size >= 18.66) ? 3 : 4.5;
    const value = Math.round(ratio(blended, bg) * 100) / 100;
    if (value < need) {
      bad.push({
        text: own.slice(0, 28),
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 40),
        color: cs.color,
        size,
        weight,
        need,
        ratio: value,
        backdrop: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
      });
    }
  }
  return bad;
}

/** Read CSS custom properties off :root (for token-level assertions). */
export function readTokens(page, names) {
  return page.evaluate((list) => {
    const cs = getComputedStyle(document.documentElement);
    const out = {};
    for (const n of list) out[n] = cs.getPropertyValue(n).trim();
    return out;
  }, names);
}

/** Contrast between two colours, computed in Node from `#rrggbb` / `rgb()`. */
export function contrastRatio(a, b) {
  const parse = (c) => {
    if (c.startsWith("#")) {
      const h = c.length === 4 ? c.slice(1).split("").map((x) => x + x).join("") : c.slice(1);
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    const m = /rgba?\(([^)]+)\)/.exec(c);
    if (!m) throw new Error(`unparseable colour: ${c}`);
    return m[1].split(",").slice(0, 3).map((s) => parseFloat(s.trim()));
  };
  const lin = (v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : Math.pow((v / 255 + 0.055) / 1.055, 2.4));
  const lum = (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
  const l1 = lum(parse(a));
  const l2 = lum(parse(b));
  return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
}

/**
 * Open the hall of fame from the hub.
 *
 * The entry point is `.mobile-only` — below 1024px it is a button, at
 * desktop widths the boards are already on screen. Returns whether a click
 * happened so callers can assert on whichever view they actually reached
 * (clicking a `display: none` button would hang until the action timeout).
 */
export async function openLeaderboard(page) {
  const entry = page.locator('button:has-text("HALL OF FAME")');
  if ((await entry.count()) === 0) return false;
  if (!(await entry.first().isVisible())) return false;
  await entry.first().click();
  await page.waitForTimeout(900);
  return true;
}

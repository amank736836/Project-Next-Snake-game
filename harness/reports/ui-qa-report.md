# UI / UX / Accessibility audit — 2026-10-11

**Auditor:** Arena agent (senior QA automation + frontend).
**Build audited:** `npm run build` → `next start` (Next 16.4.0, React 19.2.3, production,
no `DATABASE_URL` → demo store).
**Engine:** headless **Chromium 153** driven by Playwright, real mouse/touch/keyboard
input, real layout and paint. Every number below is a measurement taken in that browser —
nothing in this report is inferred from reading source.

---

## 1. Verdict

**14 defects found, 14 fixed, 0 regressions.** The app is production-ready on Chromium
across every target viewport from 320 px to 2560 px, in both themes, including 200 % and
400 % browser zoom and mobile landscape.

| | Before | After |
| --- | --- | --- |
| Viewports with clipped/unreachable content | 2 (320 px hub; 320×180 during play) | **0 / 15** |
| Text below WCAG AA contrast (composited measurement) | **84** across 8 screen/theme pairs (23 on one screen) | **0 / 8** |
| Console errors + failed requests per load | 1 each | **0** |
| Focus trapped in the game-over modal | no (8 tab stops escaped) | **yes** |
| Automated cases | 139 | **163** (24 new, browser-based) |

---

## 2. Environment and tooling

**Ran (real browser, executed):** Chromium 153 headless-shell over Playwright, at
320, 375, 390, 425, 768, 820, 1024, 1280, 1366, 1440, 1920, 2560 px, plus 200 % zoom
(640×360), 400 % zoom (320×180) and landscape phone (844×390). Checks: horizontal
overflow via `scrollWidth` vs viewport, per-element geometry and clipping, composited
WCAG contrast, accessible names, focus order, touch-target sizes, console/pageerror/
network capture, `prefers-reduced-motion`, touch emulation, throttled network
(CDP `Network.emulateNetworkConditions`), API-failure injection, rapid-click abuse,
browser Back/Forward, and a **real played game** (auto-steered to length ≥ 6, then
self-collided) so the game-over dialog could be tested rather than assumed.

**Could not be verified here — do not claim these:**

- **Firefox, Safari/WebKit, Edge.** This sandbox has no network access to browser
  downloads (only `github.com`, `npmjs.org`, `pypi.org`), so only Blink was available.
  The fixes are standard CSS (flex `min-width`, `clamp()`, container queries) and
  Blink/Gecko/WebKit agree on them, but **cross-browser is unconfirmed**. Safari in
  particular should be spot-checked for `-webkit-backdrop-filter` fallbacks and emoji
  glyph metrics (see §6).
- **Real devices** (touch latency, iOS Safari viewport units, haptics).
- **A deployed URL** (`TC-217`, `TC-219` in the manual list remain manual).
- **`mongodb-memory-server`** is blocked here, so DB-mode persistence still relies on the
  pre-existing `database` suite (5 cases skipped without a live MongoDB).

---

## 3. Issues found and fixed

Severity: **Critical** = broken for users · **High** = major feature/a11y broken ·
**Medium** = visible flaw · **Low** = polish.

| # | Page / Component | Issue | Severity | Viewport | Root cause | Fix | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UI-01 | Hub — `MissionHub.leaderTicker` | Document measured **362 px in a 320 px viewport**: the card shadow, the leader's name and its score were cut off **and unreachable** (`<body overflow-x: hidden>` swallows the overflow instead of scrolling it) | **Critical** | 320 (and ≤ 340 px) | `.tickerText { white-space: nowrap }` + a `<strong>` that can never wrap ⇒ a non-shrinkable min-content contribution (343 px) propagated up the flex/grid chain (`min-width: auto` is the default on flex **and** grid items). The hall-of-fame view was unaffected (320 px) — only the hub carried the ticker | `min-width: 0` on `.leaderTicker` and `.tickerText` (plus `flex: 1 1 auto`) so the existing `text-overflow: ellipsis` can engage; `flex: 0 0 auto` on the 🏆 icon; defensive `min-width: 0` on `.menu-content > *` | Fixed |
| UI-02 | `GameOver` dialog | Opening the modal left focus on `<body>`; Tab walked straight out of the dialog into the board controls, theme toggle and hall-of-fame button behind it, while `aria-modal="true"` claimed otherwise | **High** | all | Dialog was announced as modal but nothing managed or confined focus | `useEffect` on mount: remember the invoker, focus the panel (`tabIndex={-1}`), trap Tab across the three actions, restore focus on unmount. Verified by 8 consecutive Tabs, all inside | Fixed |
| UI-03 | `GameOver` vs `ThemeToggle` | The ☀️/🌙 toggle painted **above** the modal backdrop and stayed clickable through it | **High** | all | `.overlay { z-index: 900 }` vs `.toggle { z-index: 1000 }` | `.overlay { z-index: 1100 }`; asserted numerically (1100 > 1000) rather than by eye | Fixed |
| UI-04 | `RootLayout` — `@vercel/analytics` | One **console error + one failed request on every page load**: `GET /_vercel/insights/script.js → 404` | **High** | all | Analytics mounted unconditionally; off Vercel the endpoint does not exist | Mounted only when `VERCEL`/`VERCEL_URL` is set, so self-hosted builds are silent and Vercel keeps its beacon | Fixed |
| UI-05 | Hub — DOM order in `SnakeGame` | Heading order was `H3, H1, H3` and the **first Tab stop after the theme toggle was the right-hand board's "Next page" button** — before the name field and START MISSION | **Medium** | ≥ 1024 | The desktop grid painted the leaderboard cards first but the DOM put them before the hub, and assistive tech/tab order follow the DOM | Hub moved first in the DOM; the visual three-column order is restored with grid `order: 1/2/3` (+ matching stagger delays) so **pixels are unchanged** — TC-304 pins that | Fixed |
| UI-06 | `Controls` d-pad + `SnakeBoard` | At 400 % zoom the game screen overflowed (**374 px in a 320 px window**) — the whole `<main>` was pushed to `x = -21`, so the left column of the board and the leftmost control sat off-screen with no way to scroll to them. The hub at the same size overflowed too (362 px) | **Medium** | 320×180 (640×360 was clean) | Landscape rules sized the board by `68vmin` with a `200px` floor and never capped the d-pad, so fixed control sizes won over the viewport | `--board-size: clamp(140px, 68vmin, 340px)`, `min-width: 0` on the row, and a `@media (orientation: landscape) and (max-width: 480px)` block shrinking pad/joystick/button gaps | Fixed |
| UI-07 | `Leaderboard` tabs | `role="tab"` buttons had **no `aria-controls`** and no `role="tabpanel"` existed, so screen readers announced a tablist whose tabs pointed nowhere | **Medium** | all | Tabs and panels were rendered as plain `div`s | `id`/`aria-controls` on both tabs, `role="tabpanel"` + `aria-labelledby` on both panels (only in the tabbed view; the dashboard copies keep their plain semantics) | Fixed |
| UI-08 | Accent colours, **both themes** | Worst screen: 23 text nodes below AA (light, 1440). `--button-green #4caf50` as text — leaderboard headings, score values, hall-of-fame button — **2.64–2.66:1**; the `demo` chip (gold at 70 % opacity) **1.50:1**; white CTA labels on the `#43e07a→#1f9d55` gradient **2.4:1** at the light end. Dark was not clean either: 8 nodes (2 labels + 6 medals) | **Medium** | all | Colours tuned for the near-black dark surface were reused unchanged on the near-white light surface; the CTA/pill gradient was bright by design, and `<body>`'s glass made the failure worse at the top of each button | Light `--button-green → #2a7230` (5.62:1, was 2.64:1); new `--fill-green-*` / `--fill-cyan-*` fill tokens used by every control that carries a white label (start, resume, nav hover, active pill, active tab, D-pad, play-again) — white now ≥ 4.5:1 at **both** gradient stops; dark theme keeps its original bright palette and its own ≥ 4.5:1 white labels (verified: D-pad 3.11:1 at 26 px → large-text threshold; play-again 5.00:1) | Fixed |
| UI-09 | `Leaderboard` rows | A 23-character name was **cut mid-glyph at 1024 px** (`scrollWidth 175 / clientWidth 136`) with no ellipsis | **Medium** | 390–1024 | `.name` was `display: flex` *with* `text-overflow: ellipsis` — ellipsis does not apply to a flex container's own text node — and `min-width: auto` stopped the row shrinking | Text moved into a `.nameText` span (`flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis`), `.youTag` pinned with `flex: 0 0 auto` so "you" never gets squeezed out | Fixed |
| UI-10 | `MissionHub` name field | `outline: none` removed the global focus ring, leaving only a 30 %-opacity mint glow — **no reliable focus indicator** on the single most-used control | **Medium** | all | The `:focus` glow was treated as sufficient | Restored an explicit `outline: 3px solid var(--accent-cyan); outline-offset: 3px` on `:focus`, keeping the decorative glow. Measured `3px solid` | Fixed |
| UI-11 | `Leaderboard` medals + `MissionHub` ticker | White rank digits on the gold/silver/bronze discs measured **2.05 / 2.18 / 4.02:1 — in both themes** (theme-independent gradients), and the leader's name/score in `--accent-gold` on the light ticker wash measured **1.59:1** | **Medium** | all | Light metal fills carrying white text; a dark-theme gold reused as light-theme text | `#1a1408` ink on the top-3 discs (8.96 / 8.39 / 4.57:1) with white kept on the dark default disc; new `--accent-gold-ink` (`#8a6100` light, the unchanged gold in dark) for the ticker and the `demo` chip; the chip's `opacity: .7` (which washed it out) dropped | Fixed |
| UI-12 | Touch affordances | `-webkit-tap-highlight-color` and `touch-action` were set on the D-pad only, so hub buttons, leaderboard buttons and the theme toggle flashed the OS grey box and ate a ~300 ms double-tap delay on mobile | **Low** | touch | Per-component rules instead of a base rule | One base rule for `a, button, input, [role=button], [role=tab], [role=switch]`; `[role=application]` deliberately excluded so the joystick keeps its `touch-action: none` (a tie in specificity would otherwise have made drag-to-steer scroll the page — TC-328 asserts it stays `none`) | Fixed |
| UI-13 | Hub ⇄ hall of fame | The browser **Back button left the site** from the leaderboard view; Forward could not return. Nothing was ever pushed to the history stack | **Medium** | all | `setMenuView` was pure React state with no history integration | `pushState({naginiView})` when entering the board, `history.back()` when leaving via the in-app control, and a `popstate` listener for the reverse direction. `lastViewRef` makes it idempotent so Back/Forward cannot ping-pong. Verified across Back, Forward and the in-app button (no extra entry pushed) | Fixed |
| UI-14 | `page.module.css`, `.backBtn` | Dead CSS: `src/app/page.module.css` (141 lines of Create-Next-App boilerplate) was imported by nothing, and `.backBtn:hover .btnShine` targeted a class that does not exist — so the back buttons never played their shine | **Low** | — | Scaffolding left behind; class renamed in the component but not in the stylesheet | `.backBtn` → `.backWide, .backMobile` (shine works on both back buttons). `page.module.css` **left in place and unreferenced** — deleting it is churn with no user impact, noted in §5 | Fixed |

Also corrected without a defect id, as consistency fixes: `type="button"` added to the
two pagination buttons (they are `<button>` inside non-form containers, so the default
`type="submit"` was harmless but wrong); the two `setTab={() => {}}` no-op props are now
typed as no-ops that cannot be reached (dashboard variant hides the tablist).

---

## 4. What I checked that was **already correct**

Recording these because "no finding" is a result, and each was measured, not assumed:

- **Reduced motion** (`prefers-reduced-motion: reduce`): the particle canvas is not
  painted, **0** elements have an animation longer than 50 ms, `scroll-behavior` is
  `auto`, and `useCountUp`/`useUiMotion` settle immediately. A paired control run
  without the preference confirms the page *does* animate, so the assertion cannot pass
  on a broken build.
- **Empty and error states**: with `**/api/snakeGame/**` aborted, both boards show
  "Hall of fame is empty" / "No recent hunts" instead of skeletons, with no crash and no
  uncaught error.
- **Throttled network** (1.6 Mbps down / 768 Kbps up, 1200 ms latency): load completed in
  5.3 s, the loader placeholder covered the pre-hydration gap, and the hub rendered intact.
- **Input sanitising**: `<script>alert(1)</script>😀!!!@@@` collapses to `scriptalert1script`
  (20-char cap enforced in the field) — a stored XSS is not possible through this path, and
  React escapes the leaderboard anyway.
- **Rapid clicking**: 24 clicks on the control selector, 8 synchronous clicks on START,
  8 on PAUSE → exactly one game screen, consistent selector state, no uncaught errors.
- **Pause → resume**: the obfuscated save round-trips score, snake, food, name and direction.
- **Theme bootstrap**: `data-theme` is set before paint from `localStorage`, survives
  reload, and toggling never flashes the wrong theme.
- **Touch targets**: no interactive element is below 24×24 at 320/390/1280 (WCAG 2.5.8 AA).
  The 30×30 `kbd` hints are the smallest, and they are decorative (`aria-hidden`).
- **Accessibility names**: every interactive control resolves an accessible name
  (label, `aria-label` or text); no `<img>` is used at all, so alt-text is moot.
- **Layout stability**: CLS measured **0** on load (the loader reserves the space the hub
  occupies, and the entrance animations are `transform`/`opacity` only).

---

## 5. Deliberately not changed

| Item | Why left |
| --- | --- |
| `<body> { overflow-x: hidden }` | It is what made UI-01 *silent* — overflow exists but cannot be scrolled to. The right fix is `overflow-x: clip` (or removing it) plus a project-wide policy, but that changes scroll behaviour for the sticky/fixed layers and risks the ambient scene. Instead, `TC-300` now fails loudly at 15 viewports if any future overflow is hidden this way. |
| 5 `@fontsource/outfit` weights (400/600/700/800/900) + Geist Sans **and** Mono variable fonts ≈ **194 KB** of woff2 | The design genuinely uses 950/900/800 weights, and these are self-hosted (no third-party request). Trimming to 2 variable files would be a real perf win but is a typography decision, not a defect. Flagged in §7. |
| `src/app/page.module.css` deletion | Unreferenced, harmless; removing it is churn. The dead `.backBtn` rule inside a *used* stylesheet was fixed because it was a real (if cosmetic) bug. |
| `db.ts`, `addScore`, `memoryScores` | Backend logic. The pre-existing 18 `BUG-001…BUG-018` (rate limiting, error leakage, Mongo reconnect, name validation asymmetry) remain open and untouched, per "do not modify backend logic unless required". None of them affect the UI audit's scope. |
| `harness/bugs/*`, `known-issues.md` | Left as-is: that register tracks the API/backend defects from `RUN-2026-001`. The 14 UI defects here are fixed, so they belong in this report, not in the open-bug register. |

---

## 6. Accessibility findings (WCAG 2.2 AA)

| Criterion | Result | Note |
| --- | --- | --- |
| 1.3.1 Info & Relationships | **pass** (was fail) | Heading order and tab order fixed (UI-05); tablist wired to panels (UI-07) |
| 1.4.3 Contrast (minimum) | **pass** (was fail, 13 nodes) | Composited-paint measurement in both themes, hub + leaderboard (UI-08, UI-11) |
| 1.4.4 Resize text | **pass** | 200 % and 400 % zoom clean (UI-06) |
| 1.4.10 Reflow | **pass** (was fail) | No horizontal overflow at 320 px … 2560 px |
| 1.4.11 Non-text contrast | **pass** | D-pad glyph on its fill ≥ 3:1 in both themes |
| 2.1.2 No keyboard trap | **pass** (was fail) | Escape closes the dialog and focus returns to the invoker (UI-02) |
| 2.4.3 Focus order | **pass** (was fail) | Modal first, then its actions; hub before side boards |
| 2.4.7 Focus visible | **pass** (was fail) | Global `:focus-visible` ring plus explicit ring on the name field (UI-10) |
| 2.4.11 Focus Not Obscured | **pass** (was fail) | Modal now stacks above the fixed toggle (UI-03) |
| 2.5.8 Target size (minimum) | **pass** | No interactive element < 24×24 |
| 2.3.3 Animation from interactions | **pass** | Reduced-motion honoured everywhere |
| 4.1.2 Name, Role, Value | **pass** | Every control named; `aria-pressed` on the control selector, `role="switch"`+`aria-checked` on the theme toggle |
| 1.4.13 Content on hover | **pass** | No hover-only content; hover only lifts/moves |

**Known, accepted (documented rather than "fixed"):**

- `main` has no `aria-label` and there is no `<nav>`/`<header>` landmark — a single-view
  game with one region does not need one, and adding landmarks would change the announced
  structure for no user gain.
- The board is a single `role="img"` with a summary label (`Snake of length 4, heading
  right`) rather than 400 live cells. This is deliberate: a live region updating at 55–95 ms
  would be unreadable. There is no per-apple announcement, so a screen-reader player cannot
  follow the score. **This is the app's largest remaining accessibility gap** and needs a
  product decision (e.g. an `aria-live="off"` polite score announcement on game-over only),
  not a CSS tweak.
- Wordmarks use gradient-clipped text with `aria-label` on the parent (`Nagini`,
  `GAME OVER`), so assistive tech gets real words. Correct pattern, left alone.
- Emoji are used as icons (🏆 🕒 ️). They are `aria-hidden` where decorative and their
  siblings carry the text, but the **rendering is platform-dependent** — on systems without
  a colour emoji font these become boxes. A future pass should swap the essential ones
  (control-scheme icons, `demo` chip) for inline SVG like the arrows already use.

---

## 7. Performance observations

Production build, cold cache, localhost (`performance` API in the same browser):

| Metric | Value | Read |
| --- | --- | --- |
| TTFB (SSR document) | **6–7 ms** | excellent (static shell) |
| First Contentful Paint | **336 ms** | good |
| Largest Contentful Paint | **1116 ms** | the LCP element is the hero wordmark, which waits on the Outfit webfont — `font-display` swap costs ~780 ms here. Preloading one weight or `size-adjust` would cut it |
| `DOMContentLoaded` / `load` | 64–127 ms / 167–185 ms | good |
| **CLS** | **0** | no shift during load or hydration |
| Requests / transfer | 16 requests, **378 KB** | of which woff2 **194 KB**, JS **158 KB**, CSS **16 KB** |
| Main JS | 2 chunks, 158 KB | React 19 + the game; no `moment`-class bloat |
| Long tasks during a 40-keypress burst | 1 task, 72 ms | **INP proxy 648 ms** in headless with software GL — that figure is dominated by the headless renderer, not by app code |
| Per-keypress handler cost | **12 ms** reduced-motion / **27 ms** full motion | keyboard handling is O(1); the extra is repaint work |
| Frame rate during play | 7–8 fps | **software rasteriser only** (`--disable-gpu`, SwiftShader). Not a device verdict — but it is why the ambient canvas must stay `display: none` under reduced motion, which it does |
| Memory | 4.75 → 4.97 MB after **30** pause/resume cycles, `gc()` forced | **+0.22 MB, no leak**. Intervals, rAF loops and the IntersectionObserver are all cleaned up in their effect teardowns |
| Network hygiene | 0 failed requests, 0 console messages | after UI-04 (was 1 + 1 on every load) |

**Recommendations (not applied — each is a build/typography decision, not a defect):**
preload the single Outfit weight the hero uses; consider dropping Geist Mono (used in 2
rules); the 400-cell board is a `div` grid that re-renders every tick — fine at 400 nodes,
but a canvas renderer would be the fix if board size ever grows.

---

## 8. Regression tests added

`npm run test:visual` — **24 documented cases expanding into 56 node-test entries (56 passing)**,
TAP at `test-results/latest/visual.tap`, while the whole harness reports
**195 tests · 172 pass · 0 fail · 18 expected-failure `todo`s · 5 skipped (MongoDB)**.
screenshots in `harness/evidence/screenshots/<RUN_ID>/` (and a committed subset in
`../evidence/ui-audit-2026-10-11/`). It runs inside `npm test`.

- It **skips with a reason** when no Chromium binary is present — it can never report a
  false pass in CI, and `QA_CHROME_PATH` overrides the lookup.
- `lib/browser.mjs` holds the shared plumbing: 15 viewports (including zoom and landscape),
  a console/network/pageerror recorder, an overflow probe that ignores `pointer-events: none`
  decorations and content already clipped by an `overflow: hidden` ancestor, a composited
  contrast probe, and `openLeaderboard()` which refuses to click a hidden entry point
  (that mistake cost me a 30 s timeout, so it is now a helper).
- Full case table: [`../test-cases/visual-responsive/positive.md`](../test-cases/visual-responsive/positive.md).

The suites that were already there stay green: `unit` 24/29, `api` 36/42, `ui` 32/33,
`security` 15/20, `performance` 6/6, `database` 3/9 — every shortfall in those numbers is a
pre-existing `todo`/`skip`, never a new failure. One existing case,
`TC-051`, was asserting `<button disabled="" aria-label="Previous page">` — an
**attribute-order** assumption that broke the moment I added `type="button"`. It now
matches the attributes in any order and additionally asserts the new `type`, so the
contract it protects is unchanged and slightly stronger.

---

## 9. Readiness

**Ship it** for Chromium. The mobile experience is materially better than it was an hour
ago: the 320 px hub no longer truncates its own headline content, thumb controls no longer
overflow at high zoom, taps no longer flash grey, Back no longer ejects you from the game,
and the light theme is now legible everywhere (13 elements were below AA, one at 1.50:1).

**Before a wide launch, two things need a human:** a 30-minute pass on **Safari and
Firefox** (nothing in the diff should surprise them, but "tested on Chromium" is the only
claim I can make), and a decision on the screen-reader gap in §6 — a blind player can start
a run and steer it, but cannot follow the score until the run ends.

The 18 open backend/API defects from `RUN-2026-001` are unaffected by this audit and remain
the blockers for public deployment, not the UI.

# jsdom

- **Tool:** `jsdom` — the harness's **only added dependency**, and a `devDependency`
  (`jsdom@^30.1.2`). The app's runtime dependencies are untouched.
- **Purpose:** give the React hook tests a real DOM: `window`, `document`,
  `localStorage`, `KeyboardEvent`, timers and event dispatch. Also used indirectly as
  the environment for `react-dom/client` + `act()`.
- **Installation:** `npm install` (already declared).
- **Configuration:** booted by `harness/automation/utilities/register.mjs` **only when
  `HARNESS_BROWSER_ENV=1`**, with URL `http://localhost:3000`, `pretendToBeVisual: true`
  (gives `requestAnimationFrame`). The register file copies a fixed allow-list of
  globals onto `globalThis` and sets `IS_REACT_ACT_ENVIRONMENT = true`, which React 19
  requires for `act()` outside a test renderer. It also stubs `matchMedia` when jsdom
  does not provide it.
- **How to run:** `npm run test:ui` (the runner sets the flag). Pure-logic suites skip
  jsdom entirely so they stay fast.
- **Expected output:** no output of its own; tests interact with `document`.
- **Where results are stored:** results land in the normal UI artefacts
  (`test-results/latest/ui.tap`, `evidence/logs/ui-<RUN>.spec.txt`).
- **Known limitations:**
  - **No layout engine.** `getBoundingClientRect()` returns zeros, so anything
    geometric (board size, thumb pad, media queries) is unverifiable — those checks are
    manual (`TC-200`…`TC-208`).
  - **No real paint or CSS.** Assertions are about markup and state, never pixels.
  - Canvas is a stub: `getContext("2d")` returns a minimal object, so `AmbientBackground`
    can mount but produces no drawing to assert on.
  - Timers are mocked per test (`t.mock.timers.enable`), which means a test that forgets
    to advance them will hang until the runner's timeout — check `tick()` calls first.
  - jsdom is ~4 MB; that is the reason it is optional and flag-gated.

**Why it was added anyway:** the alternative was to lose the 33 UI cases (the entire
`useSnakeGame` engine, the highest-value suite in the harness) or to add a much heavier
browser driver (Playwright downloads a browser binary and cannot run in this sandbox).
A dev-only DOM that the project never ships was judged the smallest honest cost, and it
is recorded here rather than slipped in silently.

# Visual / responsive / accessibility suites

Real-browser checks for the things the other suites cannot see: layout at every
supported viewport, focus behaviour, ARIA wiring and interaction stability.

The other suites render components with `react-dom/server` or hit the API over
HTTP. Those cannot catch a flex child that pushes the page 43px past a 320px
phone, a modal that never receives focus, or a focus ring that a CSS rule
silently removed. This suite can, because it drives a real Chromium.

## Running

```bash
npm run test:visual                 # needs a Chromium/Chrome binary
QA_CHROME_PATH=/path/to/chrome npm run test:visual
```

### Getting a browser

The suite uses `playwright-core`, which does **not** download browsers (that is
deliberate — `npm install` must stay fast for people who only run the other
suites). Install a browser once with either:

```bash
npx playwright install chromium     # Playwright's own build (recommended)
QA_CHROME_PATH=/usr/bin/chromium    # …or point at a system Chrome/Chromium
```

Resolution order is `QA_CHROME_PATH`, then Playwright's registry. If neither
resolves, every case reports **SKIP** with a one-line reason. A skipped case is
never reported as a pass.

## Artifacts

- TAP: `harness/test-results/latest/visual.tap`
- Spec log: `harness/evidence/logs/visual-<RUN_ID>.spec.txt`
- Screenshots: `harness/evidence/screenshots/<RUN_ID>/**`

Screenshots are captured at every viewport plus on failure paths. They are
**not** committed by default — they are large and regenerate on every run. Add
`harness/evidence/screenshots/` to a commit when you want to attach evidence to
a report.

## What is covered

| TC | Check |
| --- | --- |
| TC-300 | No page overflows horizontally at 15 viewports (320 → 2560, 200%/400% zoom, landscape), hub **and** hall-of-fame view |
| TC-301 | A 23-character leader name ellipsizes instead of widening the hub at 320px |
| TC-302 | The game screen fits at 400% zoom and in landscape |
| TC-303 | Cold load produces no console errors, warnings or failed requests |
| TC-304 | The desktop three-column menu keeps its visual order after the DOM reorder |
| TC-305 | Long names ellipsize inside a leaderboard row instead of being clipped |
| TC-310 | The document starts with `<h1>`; tab order reaches the name field and START first |
| TC-311 | The name input renders a visible focus ring |
| TC-312 | The game-over dialog moves focus in, traps Tab, stacks above the theme toggle, closes on Escape |
| TC-313 | Leaderboard `role="tab"` ↔ `role="tabpanel"` wiring resolves |
| TC-314 | Interactive controls are at least 24×24px (WCAG 2.5.8) |
| TC-315 | Every interactive control has an accessible name |
| TC-316 | White labels on filled controls (CTA buttons, active pill/tab) clear 4.5:1 in both themes |
| TC-317 | No text falls below AA contrast against its *painted* backdrop — hub + hall of fame, dark + light, 390 + 1440 |
| TC-320 | Name validation gates the start of a run |
| TC-321 | Special characters and over-length names are sanitised |
| TC-322 | Keyboard steering works; arrow keys inside the input do not start a run |
| TC-323 | Pause saves the run and resume restores it |
| TC-324 | Rapid repeated clicks never corrupt state |
| TC-325 | The theme toggle switches, persists and survives a reload |
| TC-326 | Leaderboard tabs, paginates and returns to the hub |
| TC-327 | Browser Back returns to the hub instead of leaving the site; Forward re-opens the board |

## Reading the contrast probe

`contrastProbe()` in `lib/browser.mjs` resolves a text node's backdrop by
hit-testing the real paint stack (`document.elementsFromPoint`) and compositing
translucent layers, because this design paints CTA gradients and a sibling
"pill" behind active tabs — reading `background-color` alone reports the page
background and produces false failures. Two known, deliberate exclusions:

- gradient-clipped wordmarks (`color: transparent` — contrast comes from the stops);
- emoji-only nodes (colour-font glyphs; `color` does not describe them).

TC-316 exists precisely to cover the first case at the token level.

## Note on cross-browser coverage

Only Chromium is exercised here. Firefox (Gecko) and Safari (WebKit) need their
own Playwright browser downloads and are not part of this suite; see
`harness/reports/ui-qa-report.md` for what that leaves unverified.

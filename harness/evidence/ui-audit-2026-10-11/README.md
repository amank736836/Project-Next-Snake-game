# UI audit evidence — 2026-10-11

Full-page screenshots captured in headless Chromium 153 against a production
`npm start` build, **after** the fixes in `../../reports/ui-qa-report.md`.
These are the committed subset; the whole set (42 files, one per viewport and
per failure path) is regenerated on every run into
`harness/evidence/screenshots/<RUN_ID>/` (gitignored).

| File | What it shows |
| --- | --- |
| `responsive-mobile-320.png` | 320 × 640 hub — the width that previously measured 363 px and clipped the card shadow, ticker text and ticker score with no way to scroll |
| `responsive-zoom-400.png` | 320 × 180 (≈ 400 % browser zoom on a 1280 px window): hub fits and stays readable |
| `responsive-game-320x180.png` | the same extreme size during play — board plus thumb pad, previously clipped on both sides |
| `responsive-landscape-844x390.png` | phone held sideways during play |
| `responsive-desktop-1440.png` | the three-column desktop menu (unchanged by the DOM reorder that fixed heading and tab order) |
| `responsive-320-long-name-leaderboard.png` | hall of fame at 320 px with a 23-character name in a row |
| `a11y-game-over.png` | the game-over dialog: focus moves into it, Tab is trapped, and the theme toggle no longer floats above it |
| `interactions-light-theme.png` | light theme after the contrast pass (accent text, CTA fills, active pill) |

Reproduce the whole set:

```bash
npm run test:visual          # QA_SHOT_DIR defaults to evidence/screenshots/<RUN_ID>/
```

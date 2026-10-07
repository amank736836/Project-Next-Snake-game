# Manual cases — browser, touch, motion and deployment

**Run id:** none yet — every case below is `NOT_EXECUTED` in `RUN-2026-001` because no
browser binary and no deployed environment are available here.
**Environment for a future run:** production build (`npm run build && npm start`) at
`http://127.0.0.1:3000`, plus a deployed URL for TC-217/TC-219.

---

### TC-200 — Phone portrait layout (360 × 640)
- **Feature:** FEAT-011 · **Priority:** High · **Type:** UI / visual · **Automation:** MANUAL
- **Preconditions:** device emulation at 360 × 640, DPR 2, touch enabled
- **Steps:** 1) open the game. 2) Note the board size and the D-pad position. 3) Scroll to the bottom of the page. 4) Start a run and press the D-pad.
- **Test data:** —
- **Expected result:** hub, board and portrait D-pad all fit without horizontal scrolling; the D-pad is reachable by thumb; tapping a D-pad button steers the snake.
- **Actual result:** NOT_EXECUTED (no browser)
- **Status:** NOT_EXECUTED · **Automation:** MANUAL · **Evidence:** —
- **Related requirement:** REQ-054 · **Related bug:** — · **Last executed:** —

### TC-201 — Tablet single column (640 px)
- **Feature:** FEAT-011 · **Priority:** Medium · **Type:** UI / visual · **Automation:** MANUAL
- **Preconditions:** viewport 640 px wide
- **Steps:** 1) open the game. 2) Inspect the layout. 3) Use the leaderboard tabs to switch between highest and recent.
- **Test data:** —
- **Expected result:** single column; both boards reachable through the tabs; no clipped text; no horizontal scrollbar.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-054 · **Related bug:** — · **Last executed:** —

### TC-202 — Desktop three columns (1024 px)
- **Feature:** FEAT-011 · **Priority:** High · **Type:** UI / visual · **Automation:** MANUAL
- **Preconditions:** viewport 1024 px wide
- **Steps:** 1) open the game. 2) Verify both leaderboards and the hub are visible at once. 3) Confirm the side control columns appear. 4) Start a run and use the side D-pad.
- **Test data:** —
- **Expected result:** three balanced columns (boards — hub — boards) with side controls; the board is square; no overflow.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-054 · **Related bug:** — · **Last executed:** —

### TC-203 — Wide desktop (1440 px)
- **Feature:** FEAT-011 · **Priority:** Low · **Type:** UI / visual · **Automation:** MANUAL
- **Preconditions:** viewport 1440 px wide
- **Steps:** 1) open the game. 2) Measure the main container width. 3) Play for a few seconds.
- **Test data:** —
- **Expected result:** the layout is capped (≈1400 px) and centred; the board does not stretch beyond the clamp; no wasted ultra-wide gutters.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-054 · **Related bug:** — · **Last executed:** —

### TC-204 — Landscape phone (740 × 360)
- **Feature:** FEAT-011 · **Priority:** Medium · **Type:** UI / visual · **Automation:** MANUAL
- **Preconditions:** landscape viewport at 740 × 360
- **Steps:** 1) open the game. 2) Start a run. 3) Use the thumb pad beside the board.
- **Test data:** —
- **Expected result:** the board and thumb pad sit side by side; the page does not scroll vertically while playing; the pad is reachable.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-054 · **Related bug:** — · **Last executed:** —

### TC-205 — 200 % zoom
- **Feature:** FEAT-011 · **Priority:** Medium · **Type:** Accessibility · **Automation:** MANUAL
- **Preconditions:** desktop browser at default size
- **Steps:** 1) zoom the page to 200 %. 2) Navigate the hub, start a run, play, pause.
- **Test data:** —
- **Expected result:** content reflows without loss of function (WCAG 1.4.10 reflow); no two-dimensional scrolling for the hub content; text is not clipped.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-054 · **Related bug:** — · **Last executed:** —

### TC-206 — Reduced motion
- **Feature:** FEAT-010 · **Priority:** Medium · **Type:** Accessibility · **Automation:** MANUAL
- **Preconditions:** OS "reduce motion" enabled (or dev-tools emulation of `prefers-reduced-motion: reduce`)
- **Steps:** 1) load the page. 2) Watch the ambient background and the loader. 3) Start a run and watch the score and speed meter. 4) Observe the theme toggle.
- **Test data:** —
- **Expected result:** no parallax/particle animation, no count-up animation (values appear immediately), transitions collapse to near-instant, and every piece of information is still shown.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-051 · **Related bug:** — · **Last executed:** —

### TC-207 — Background tab and device pixel ratio
- **Feature:** FEAT-010 · **Priority:** Low · **Type:** Performance / visual · **Automation:** MANUAL
- **Preconditions:** desktop browser, dev-tools performance monitor open
- **Steps:** 1) load the page. 2) Switch to another tab for ~20 s and return. 3) Emulate DPR 3 and reload.
- **Test data:** —
- **Expected result:** animation work pauses while hidden (no CPU burn, no jank on return); the canvas renders at DPR ≤ 2 to bound fill cost.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-051 · **Related bug:** — · **Last executed:** —

### TC-208 — Visual polish pass
- **Feature:** FEAT-002, FEAT-010 · **Priority:** Low · **Type:** UI / visual · **Automation:** MANUAL
- **Preconditions:** desktop browser, dark theme
- **Steps:** 1) toggle the theme and watch the wave. 2) Start a run, eat three apples, watch the score count-up and the speed meter bars. 3) Pause and resume.
- **Test data:** —
- **Expected result:** theme wave covers the viewport and settles without a flash; count-up reaches the true value; the speed meter lights one bar per speed step; resume restores the visuals exactly.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-051, REQ-006 · **Related bug:** — · **Last executed:** —

### TC-209 — Name field input rules
- **Feature:** FEAT-005 · **Priority:** High · **Type:** UI / functional · **Automation:** MANUAL
- **Preconditions:** hub visible
- **Steps:** 1) type 25 characters. 2) Type emoji and accented characters. 3) Paste a 500-character string. 4) Try to start with only spaces.
- **Test data:** `abc…xyz` (25), `Игрок`, `🙂`, 500-char paste
- **Expected result:** the field keeps at most 20 characters of `[a-zA-Z0-9 ]`; disallowed characters never appear; a whitespace-only name is refused with the inline alert (the same rule the API must eventually enforce — BUG-003).
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-013 · **Related bug:** BUG-003 · **Last executed:** —

### TC-210 — Hydration and a full keyboard run
- **Feature:** FEAT-012, FEAT-001 · **Priority:** Critical · **Type:** End-to-end / manual · **Automation:** MANUAL
- **Preconditions:** desktop browser, dev-tools console open
- **Steps:** 1) load the game with caching disabled. 2) Confirm the loader is replaced by the hub. 3) Play one complete run using only the keyboard (eat ≥ 3 apples, then collide). 4) Watch the dialog and the leaderboard update.
- **Test data:** name `ManualProbe`
- **Expected result:** no hydration warnings or errors in the console; the hub appears without a flash; the run ends correctly; the score reaches the board within one refresh; no console errors during the whole flow.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-005, REQ-034, REQ-019 · **Related bug:** — · **Last executed:** —

### TC-211 — Joystick drag
- **Feature:** FEAT-004 · **Priority:** Medium · **Type:** Touch / interaction · **Automation:** MANUAL
- **Preconditions:** touch emulation; control scheme set to JOYSTICK
- **Steps:** 1) start a run. 2) Drag the stick in each of the four directions. 3) Drag diagonally. 4) Drag to the base's edge and hold. 5) Release.
- **Test data:** —
- **Expected result:** the dominant axis wins for diagonals; the stick follows the finger but is clamped to the base; releasing recentres it; each drag produces exactly one turn per threshold crossing.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-009 · **Related bug:** — · **Last executed:** —

### TC-212 — Keyboard hints and space alias
- **Feature:** FEAT-004 · **Priority:** Low · **Type:** UI / interaction · **Automation:** MANUAL
- **Preconditions:** desktop browser with the BUTTONS scheme selected
- **Steps:** 1) press each arrow key, WASD and space during a run. 2) Watch the on-screen hints.
- **Test data:** —
- **Expected result:** the matching hint key lights up for each press; space acts as a direction alias exactly like the arrow key it mirrors; no double-turn from a single press.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-009 · **Related bug:** — · **Last executed:** —

### TC-213 — Leaderboard reveal and bar proportions
- **Feature:** FEAT-006 · **Priority:** Low · **Type:** UI / visual · **Automation:** MANUAL
- **Preconditions:** a board with at least 5 players of different scores
- **Steps:** 1) scroll the leaderboard into view. 2) Watch the rows appear. 3) Compare the bar lengths with the values. 4) Hover and focus a row.
- **Test data:** seeded demo players
- **Expected result:** rows reveal smoothly once; bars are proportional to the best score; hover/focus highlights are visible and do not shift layout.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-022 · **Related bug:** — · **Last executed:** —

### TC-214 — Submission failure from the browser
- **Feature:** FEAT-007 · **Priority:** Medium · **Type:** Resilience / manual · **Automation:** MANUAL
- **Preconditions:** dev-tools open; the browser offline, or the request blocked via **Network → Block request URL** for `/api/snakeGame/addScore`
- **Steps:** 1) play a run to completion. 2) Watch the game-over dialog and the console. 3) Go back online and inspect the leaderboard.
- **Test data:** —
- **Expected result:** the run ends normally, the dialog is usable, and the failure is visible to the developer (console) rather than silently swallowed — the score is simply not on the board. Document whether a retry happens.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-019, REQ-050 · **Related bug:** — · **Last executed:** —

### TC-215 — Keyboard-only playthrough and focus visibility
- **Feature:** FEAT-004, FEAT-005 · **Priority:** High · **Type:** Accessibility · **Automation:** MANUAL
- **Preconditions:** desktop browser, mouse untouched
- **Steps:** 1) Tab through the hub: name field → START → scheme buttons → theme toggle. 2) Type a name, Enter to start. 3) Play with the arrow keys. 4) Tab to PAUSE, activate it. 5) Reach the dialog and its three buttons.
- **Test data:** name `KeyProbe`
- **Expected result:** every interactive control is reachable in a logical order with a visible focus ring; nothing requires a mouse; no focus trap outside the dialog.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-052 · **Related bug:** — · **Last executed:** —

### TC-216 — Game-over keyboard shortcuts
- **Feature:** FEAT-003 · **Priority:** Medium · **Type:** Interaction / accessibility · **Automation:** MANUAL
- **Preconditions:** a finished run, dialog visible
- **Steps:** 1) press Enter. 2) Finish another run, then press Escape. 3) Repeat with focus on each dialog button.
- **Test data:** —
- **Expected result:** Enter starts a new run, Escape returns to the hub; shortcuts work regardless of which dialog button has focus; they never fire while the name field is focused.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-018 · **Related bug:** — · **Last executed:** —

### TC-217 — Analytics beacon on a deployment
- **Feature:** FEAT-012 · **Priority:** Low · **Type:** Deployment / manual · **Automation:** MANUAL
- **Preconditions:** the app deployed on Vercel
- **Steps:** 1) load the deployed page. 2) In dev-tools, confirm the analytics script loads and a page-view beacon is sent. 3) Check the Vercel analytics dashboard.
- **Test data:** —
- **Expected result:** one page view recorded; no console errors; no analytics traffic on a self-hosted deployment (the component must no-op).
- **Actual result:** NOT_EXECUTED (no deployment) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-045 · **Related bug:** — · **Last executed:** —

### TC-218 — Console hygiene during a session
- **Feature:** FEAT-012 · **Priority:** Low · **Type:** Manual · **Automation:** MANUAL
- **Preconditions:** desktop browser, console open, `verbose` level
- **Steps:** 1) load, play, pause, resume, finish a run, page the leaderboard, toggle the theme. 2) Read the console.
- **Test data:** —
- **Expected result:** no React hydration warnings, no unhandled rejections, no 404s for assets; any framework notice is explainable.
- **Actual result:** NOT_EXECUTED (no browser) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-034 · **Related bug:** — · **Last executed:** —

### TC-219 — Deployed smoke test
- **Feature:** FEAT-012, FEAT-006 | **Priority:** High · **Type:** Deployment / smoke · **Automation:** MANUAL (or `HARNESS_BASE_URL=https://… npm run test:api`)
- **Preconditions:** a deployed URL (staging or production)
- **Steps:** 1) open the URL and play 30 seconds. 2) Submit a score and confirm it appears. 3) Reload the page twice and confirm the shell is cache-served (dev-tools: `x-nextjs-cache: HIT`). 4) Run the API suite against the deployment.
- **Test data:** `${HARNESS_BASE_URL}` (never committed)
- **Expected result:** the deployment behaves like localhost; the cached shell is served fast; the score round-trip works; the API suite passes (or every difference is understood and recorded).
- **Actual result:** NOT_EXECUTED (no deployment) · **Status:** NOT_EXECUTED · **Evidence:** —
- **Related requirement:** REQ-035, REQ-019 · **Related bug:** — · **Last executed:** —

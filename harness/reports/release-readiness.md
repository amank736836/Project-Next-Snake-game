# Release Readiness — assessed at RUN-2026-001 (2026-10-07)

**Recommendation: ⚠️ READY WITH RISKS** for a public deployment, and **✅ READY**
for a demo/showcase deployment. The distinction is deliberate and is explained by the
open High-severity findings, which affect an internet-exposed API rather than the game.

Everything below is evidence-backed: the run id, the case ids and the artefact paths.

## 1. Critical features

| Feature | Automated evidence | Status | Residual risk |
| --- | --- | --- | --- |
| Play the game (board, movement, wrap, food, collision) | TC-001…TC-003, TC-032…TC-040, TC-048 | ✅ PASS | None found; minimum-run rule verified at both ends |
| Score submission and leaderboard merge | TC-056…TC-058, TC-073 | ✅ PASS | Correctness holds; abuse resistance does not (BUG-013/016) |
| Leaderboard read path (ordering, paging, filters) | TC-070…TC-083b | ✅ PASS | Unbounded `limit` (BUG-012) |
| Session lifecycle (pause → resume → game over → restart) | TC-040…TC-042, TC-044, TC-045 | ✅ PASS* | *Corrupt-save dead button (BUG-011) |
| Persistence modes | TC-013…TC-025, TC-130…TC-132 | ⚠️ PARTIAL | MongoDB path unverified; failure recovery broken (BUG-017, BUG-018) |
| Served shell, theme, hydration-friendly output | TC-090…TC-093b, TC-091 | ✅ PASS | Visual flash not verified in a browser |

## 2. Critical bugs

None. No known defect makes the game unplayable, corrupts a score silently, or blocks a
release on its own.

## 3. Open High-severity bugs

| Bug | Summary | Impact | Where it bites |
| --- | --- | --- | --- |
| BUG-013 | No rate limit and no body-size cap on `POST /addScore` | The endpoint can be flooded or fed megabyte payloads; each request is cheap for the attacker | Any public deployment |
| BUG-016 | Scores are unauthenticated and unverifiable | Anyone can put any number on top of the board | Public leaderboards |
| BUG-017 | A rejected database connection is cached forever | A transient database blip requires a process restart to recover | Any MongoDB deployment |

Medium: BUG-001, BUG-002, BUG-003, BUG-004, BUG-014, BUG-015.
Low: BUG-005…BUG-012. Unknown: BUG-018 (MongoDB duplicate-row race, unverified).

## 4. Test status by discipline

| Discipline | Result | Evidence |
| --- | --- | --- |
| Smoke | 8/8 scenarios PASS | `test-results/latest/{unit,api,ui}.tap` |
| Regression | 10/10 scenarios PASS, no unexpected red | `regression-report.md` |
| Functional | 116 passing cases across 12 features | `test-summary.md` |
| Performance | All six guardrails met (p95 ≤ 5.9 ms on the API paths; 50/50 concurrent reads in 120 ms) | `test-results/latest/performance-summary.json` |
| Security | No secrets; JSON-only; no CORS grant — **but** missing headers, no rate limits, raw error leakage | `security.tap`, `evidence/api-responses/` |
| Database | Demo mode verified; MongoDB mode NOT EXECUTED | `database.tap` |
| Manual/visual | NOT EXECUTED (no browser) | `test-cases/manual/` |

## 5. Known limitations

1. **No browser evidence.** Layout, motion, focus and touch behaviour are documented but
   unverified (TC-200…TC-218). This is the largest evidence gap.
2. **No MongoDB evidence.** Persistence claims rest on demo-mode behaviour plus code
   inspection; BUG-018 is filed as unverified rather than assumed.
3. **No deployment evidence.** CDN caching, TLS and analytics beacons are unverified.
4. **No load testing.** 50 concurrent reads is a smoke-level concurrency check, not
   capacity planning.
5. **No line coverage instrumentation**, by choice — coverage here is catalogue-based.

## 6. Deployment risks

| Risk | Likelihood | Impact | Mitigation before exposing publicly |
| --- | --- | --- | --- |
| Scoreboard defaced by forged/scripted scores | High (no defence exists) | Reputational | Rate limit + plausibility rules (BUG-013/016), or remove the public write path |
| Endpoint abused for traffic amplification/storage growth | Medium | Cost/availability | Body cap + edge rate limits (BUG-013) |
| Database blip turns into an outage until restart | Medium | Availability | Fix the connection cache (BUG-017) |
| Legitimate players renamed to `Anonymous` | Medium | Player-visible | Whole-word matching (BUG-002) |
| Scanner flags missing headers/fingerprinting | Medium | Compliance noise | Add headers, disable `X-Powered-By` (BUG-015) |
| Demo data mistaken for production data | Low | Confusion | The `demo: true` flag and UI chip are already verified (TC-059) |

## 7. Condition precedent to "READY"

To move the public-deployment recommendation from *READY WITH RISKS* to *READY*, the
following must be true and evidenced in a later run:

- [ ] BUG-013 fixed (rate limit + body cap) and its two `todo` cases promoted to green.
- [ ] BUG-016 decided: either a defence is implemented, or the leaderboard is explicitly
      documented as decorative for the release.
- [ ] BUG-017 fixed and TC-131 still green (fast failure must survive the fix).
- [ ] TC-133…TC-137 executed against a real MongoDB (closing BUG-018 either way).
- [ ] The manual browser pass executed at least once, with findings recorded.

## 8. Sign-off sheet (filled at release time, not before)

| Field | Value |
| --- | --- |
| Assessed run | RUN-2026-001 |
| Assessed commit | `1849ac4` + harness |
| Assessed by | AI agent (Arena) |
| Recommendation | **READY WITH RISKS** for public deployment · **READY** for demo use |
| Conditions accepted by | _(pending — requires a human decision on the open High bugs)_ |

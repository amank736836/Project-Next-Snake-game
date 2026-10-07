# Integration Scenarios

Flows that cross a boundary: UI → API, API → store, store → UI, and the
authentication/authorisation boundary (which does not exist here — stated
explicitly so nobody assumes it was forgotten).

| ID | Scenario | Boundary crossed | Test cases | Status |
| --- | --- | --- | --- | --- |
| SCN-063 | Game over submits the finished run and the leaderboard shows it | UI → API → store → UI | TC-040 (submission), TC-056/TC-057 (store), TC-046 (refresh) | PASS |
| SCN-064 | Hub mount fetches both boards in parallel and renders them | UI → API (two GETs) | TC-030, TC-051 | PASS |
| SCN-065 | A failing scores API leaves the game playable and the boards empty | UI ← API (error) | TC-047, TC-132 | PASS |
| SCN-066 | A page change fetches the next slice and updates the rank numbers | UI → API → UI | TC-046, TC-051, TC-075 | PASS |
| SCN-067 | The player's own row is highlighted by comparing the entered name with board rows | UI state → board data | TC-051 | PASS |
| SCN-068 | Demo mode flows all the way through: store → API flag → UI chip | store → API → UI | TC-059, TC-051 | PASS |
| SCN-069 | The database connection is reused across requests instead of reconnecting | API → driver | TC-103 (latency flat over 30 writes), TC-131 (cached failure) | PASS |
| SCN-070 | Pre-paint theme script → hydration → toggle keeps one source of truth | HTML → React state → storage | TC-043, TC-091 | PASS |
| SCN-071 | Pause (React) → localStorage → resume (React) round-trip | UI → browser storage → UI | TC-041, TC-044, TC-045 | PASS |
| SCN-072 | The served shell → hydration → the hub actually appears | SSR → client hydration | TC-090, TC-092 + **manual** TC-210 | PARTIAL (shell verified; hydration needs a browser) |
| SCN-073 | Authentication → API | — | **No authentication exists in this product**; the write path is public by design (BUG-016) | N/A |
| SCN-074 | API → external service | — | No external service is called by the app; analytics is client-side only (FEAT-012) | N/A |

## Why there is no auth scenario

`PROJECT_OVERVIEW.md` §9 records that the product has no users, sessions or tokens.
Anything that *requires* authentication is therefore out of scope; what remains is
the abuse-resistance of a public endpoint (SCN-045, SCN-119, SCN-121).

## Integration risks to watch when changing code

| Change | Integration to re-test |
| --- | --- |
| Storage mode switching logic | SCN-068 (demo flag), SCN-069 (connection reuse), SCN-065 (degradation) |
| Response shape of any endpoint | SCN-063, SCN-064, SCN-066 — the client reads `scores`, `pagination.*`, `demo` and array bodies |
| Save format | SCN-071 — old saves must still be readable or be dropped cleanly (BUG-011) |
| Theme bootstrap | SCN-070 — removing the inline script reintroduces a flash of the wrong theme |

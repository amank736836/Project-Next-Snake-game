# Negative Scenarios

Invalid input, missing input, unauthorised access, invalid state and invalid API
requests. "Expected" here means what a hardened product should do; where the current
build disagrees, the gap is tracked as a bug.

| ID | Scenario | Input | Expected | Actual / Status | Test cases |
| --- | --- | --- | --- | --- | --- |
| SCN-035 | Start a run with a blank name | `""`, `"   "` in the hub | refused with a visible, announced alert | ✅ refused, `role="alert"` shown | TC-031, TC-050 |
| SCN-036 | Submit a score without a name | `{ "score": 5 }` | HTTP 400 | ✅ 400 (message exposes a TypeError string — BUG-014) | TC-061, TC-114b |
| SCN-037 | Submit a body that is not JSON | `{"name":`, `""`, `[]` | HTTP 400 | ✅ 400 for all three | TC-063, TC-064, TC-065 |
| SCN-038 | Submit a name that is not a string | `{ "name": 123, "score": 5 }` | HTTP 400 | ✅ 400 | TC-066 |
| SCN-039 | Submit a score that is not a number | `"7"`, `{"$ne":1}`, `null`, missing, `-5`, `2.7` | HTTP 400 | ❌ all accepted and stored — **BUG-001** | TC-067, TC-068 |
| SCN-040 | Submit a name beyond the UI rules | 5 000 chars, `""`, `<script>`, unicode | HTTP 400 | ❌ accepted — **BUG-003** | TC-069, TC-069b |
| SCN-041 | Reach a leaderboard page that does not exist | `?page=999` | empty list, no error | ✅ empty list | TC-076 |
| SCN-042 | Send non-numeric pagination values | `?page=abc`, `?limit=abc`, `?limit=0` | HTTP 400 or documented fallback | ❌ `null` values echoed — **BUG-005** | TC-078, TC-078b |
| SCN-043 | Use the wrong HTTP method | `GET /addScore`, `DELETE /highestScore`, `PUT /latestScore` | HTTP 405 | ✅ 405 for all | TC-084 |
| SCN-044 | Call an endpoint that does not exist | `/api/nope`, `/does-not-exist` | HTTP 404 | ✅ 404 | TC-088 |
| SCN-045 | Access without authorisation | any request without credentials | there is no auth model; writes must at least be rate-limited and validated | ❌ any client can write any score — **BUG-016**, **BUG-013** | TC-119, TC-120 |
| SCN-046 | Trigger a backend failure | server with an unreachable database | a clear error, no crash, no internals leaked | ⚠️ 400 returned and the UI survives, but raw driver text leaks — **BUG-014** | TC-130, TC-131, TC-132, TC-114 |

## Notes for testers

- SCN-039/SCN-040/SCN-042 are the three "should be 400" families; each has a `todo`
  regression test that will flip to green automatically once the API is hardened.
- The client-side guards (SCN-035) are verified; the server-side equivalents
  (SCN-036…SCN-040) are the weak spot of this codebase.
- Every negative case is safe to run repeatedly: rejected payloads write nothing.

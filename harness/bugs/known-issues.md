# Known Issues — register

All 18 defects found by `RUN-2026-001`, with the automated case that keeps each one
visible. A `todo` case fails by design and is reported as a **known issue**, never as
a pass and never as an unexpected failure.

| Bug | Title | Severity | Priority | Feature | Regression test | Status |
| --- | --- | --- | --- | --- | --- | --- |
| [BUG-001](open/BUG-001.md) | Non-numeric or missing scores are accepted and stored | Medium | P2 | FEAT-007 | TC-067, TC-068 (todo) | OPEN |
| [BUG-002](open/BUG-002.md) | Foul-word filter matches substrings inside legitimate names | Medium | P2 | FEAT-007 | TC-060b (characterisation) | OPEN |
| [BUG-003](open/BUG-003.md) | API accepts names the UI forbids (length, characters, emptiness) | Medium | P2 | FEAT-005, FEAT-007 | TC-069 (todo), TC-069b | OPEN |
| [BUG-004](open/BUG-004.md) | All sanitised submissions collapse into one `Anonymous` row | Medium | P2 | FEAT-007 | TC-060c (todo), TC-060d | OPEN |
| [BUG-005](open/BUG-005.md) | Invalid page/limit values echo nulls; NaN empties the board | Low | P3 | FEAT-006 | TC-078 (todo), TC-024, TC-078b | OPEN |
| [BUG-006](open/BUG-006.md) | `generateFood` recurses without a bound on a full board | Low | P3 | FEAT-001 | TC-010 (todo) | OPEN |
| [BUG-007](open/BUG-007.md) | Obfuscation throws for characters above U+00FF | Low | P3 | FEAT-009 | TC-011 (todo) | OPEN |
| [BUG-008](open/BUG-008.md) | Foul-word list contains non-lower-case (dead) entries | Low | P3 | FEAT-007 | TC-028 (todo) | OPEN |
| [BUG-009](open/BUG-009.md) | Foul-word list contains duplicates | Low | P3 | FEAT-007 | TC-029 (todo) | OPEN |
| [BUG-010](open/BUG-010.md) | Unusable score rows are persisted permanently | Low | P3 | FEAT-008 | TC-023 (characterisation) | OPEN |
| [BUG-011](open/BUG-011.md) | Corrupt save leaves RESUME MISSION permanently active | Low | P3 | FEAT-003, FEAT-009 | TC-042b (todo) | OPEN |
| [BUG-012](open/BUG-012.md) | `limit` is unbounded; the whole board can be pulled at once | Low | P3 | FEAT-006 | TC-079 (characterisation) | OPEN |
| [BUG-013](open/BUG-013.md) | No rate limit and no body-size cap on the write endpoint | **High** | P1 | FEAT-007 | TC-089, TC-120 (todo) | OPEN |
| [BUG-014](open/BUG-014.md) | Internal error details are returned to clients | Medium | P2 | FEAT-007, FEAT-008 | TC-114 (todo), TC-114b, TC-061 | OPEN |
| [BUG-015](open/BUG-015.md) | No security headers; framework advertised | Medium | P2 | FEAT-012 | TC-110b, TC-111 (todo) | OPEN |
| [BUG-016](open/BUG-016.md) | Scores are unauthenticated and unverifiable | **High** | P1 | FEAT-007 | TC-119 (todo), TC-119b | OPEN |
| [BUG-017](open/BUG-017.md) | Rejected database connection is cached forever | **High** | P2 | FEAT-008 | TC-131b (todo), TC-131 | OPEN |
| [BUG-018](open/BUG-018.md) | Concurrent writes can fork a player into duplicate documents | Unknown (unverified) | P1 when reproduced | FEAT-008 | TC-135 (todo, gated) | OPEN — BLOCKED |

## Summary

| Severity | Count | Bugs |
| --- | --- | --- |
| High | 3 | BUG-013, BUG-016, BUG-017 |
| Medium | 6 | BUG-001, BUG-002, BUG-003, BUG-004, BUG-014, BUG-015 |
| Low | 8 | BUG-005, BUG-006, BUG-007, BUG-008, BUG-009, BUG-010, BUG-011, BUG-012 |
| Unknown | 1 | BUG-018 |
| **Total** | **18** | |

**3 High · 6 Medium · 8 Low · 1 Unknown = 18.**

- **No bug affects the playable game itself.** Every High finding is in the public API
  surface (abuse resistance and database recovery) — the impact starts when the game
  is deployed on the open internet, not when someone plays it.
- **BUG-018 is the only unverified finding.** It is filed as `UNKNOWN / REQUIRES
  VALIDATION` with the check already written (TC-135) so the first person with a
  MongoDB instance can settle it in one command.
- **Expected-failure mechanism:** the `todo` cases above are counted in the "known
  issues" column of `test-results/latest/summary.md`. If one of them starts
  *passing*, that is a signal to promote it to a normal test — see
  `../automation/README.md`.

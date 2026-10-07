# Game engine — edge cases

Boundary and degenerate states of the pure helpers and the board model.
Executed **2026-10-07 · RUN-2026-001**. Automation: `automation/unit/game-utils.test.mjs`.

| ID | Feature | Priority | Type | Preconditions | Steps | Test data | Expected result | Actual result | Status | Automation | Evidence | Req | Bug |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-004 | FEAT-003, FEAT-009 | High | Edge (Unit) | a mission object | `deobfuscate(obfuscate(mission))` and compare field by field | full mission | Exact round-trip, including unicode-free names | deep-equal | PASS | AUTOMATED | unit.tap | REQ-017 | — |
| TC-005 | FEAT-009 | High | Edge (Unit) | a mission object | Inspect the obfuscated string: base64 alphabet, and search for the player name | name `Nagini` | Output is base64 and does **not** contain the name | base64, name absent | PASS | AUTOMATED | unit.tap | REQ-017 | — |
| TC-006 | FEAT-009 | Medium | Edge (Unit) | none | `deobfuscate("not-base64!!")` and other garbage inputs | `"not-base64!!"`, `""`, `null` | Returns `null` instead of throwing | `null` | PASS | AUTOMATED | unit.tap | REQ-016 | — |
| TC-007 | FEAT-009 | Medium | Edge (Unit) | a valid save | Truncate the save and flip one character, then deobfuscate | tampered strings | Returns `null`, never a half-parsed mission | `null` | PASS | AUTOMATED | unit.tap | REQ-016 | — |
| TC-009 | FEAT-001 | Low | Edge (Unit) | none | Call `getSnakePartRotation` with a zero vector and unknown keys | `[0,0]` | Falls back to the head-right class | head-right | PASS | AUTOMATED | unit.tap | REQ-002 | — |
| TC-010 | FEAT-001 | Low | Edge (Unit) | a board in which every cell is occupied | Call `generateFood` with a 400-cell body | 400-cell body | Must terminate gracefully (return no cell / signal full board) | ❌ `RangeError: maximum call stack size exceeded` | KNOWN ISSUE | AUTOMATED | unit.tap | REQ-004 | BUG-006 |
| TC-011 | FEAT-009 | Medium | Edge (Unit) | none | Obfuscate a mission whose name contains non-Latin1 characters | name `Игрок` | Name survives the round-trip | ❌ `DOMException: Invalid character` from `btoa` | KNOWN ISSUE | AUTOMATED | unit.tap | REQ-017 | BUG-007 |
| TC-012 | FEAT-009 | Low | Edge (Unit) | two identical missions | Obfuscate the same mission twice and compare | identical input | Obfuscation is position-dependent (XOR stream), so outputs differ | differ | PASS | AUTOMATED | unit.tap | REQ-017 | — |

Notes

- **TC-010** is unreachable in normal play (a 400-segment snake cannot be fed), but it
  is the correct unit-level statement of "the board is full" and is kept as a
  known-issue test so the `todo` shows up in every run until BUG-006 is fixed.
- **TC-011** can only be reached through the API or a data migration: the UI input
  filter strips non-ASCII characters before they reach the obfuscator.

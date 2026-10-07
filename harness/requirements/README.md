# Requirements

Requirements are written from the codebase, not from a product brief: each one
points at the implementation that satisfies it and at the tests that verify it.

| Prefix | Meaning | File |
| --- | --- | --- |
| `REQ-001…REQ-034`, `REQ-061…REQ-062` | Functional requirements (observable behaviour) — ids are appended, never reused | [`functional-requirements.md`](functional-requirements.md) |
| `REQ-035…REQ-060` | Non-functional requirements (quality attributes, constraints) | [`non-functional-requirements.md`](non-functional-requirements.md) |
| `BR-001…BR-012` | Business rules (domain rules the implementation encodes) | [`business-rules.md`](business-rules.md) |

**Status vocabulary**

| Status | Meaning |
| --- | --- |
| ✅ VERIFIED | Covered by at least one executed automated test that passed (RUN-2026-001) |
| ⚠️ PARTIAL | Covered partially, or verified only in demo mode |
| ❌ VIOLATED | The implementation does not meet the requirement — see the linked bug |
| 🔒 NOT_EXECUTED | Written down and traceable, but not executed in this environment |

Every requirement row also appears in [`../reports/traceability.md`](../reports/traceability.md)
with its feature, scenario, test cases and evidence.

# Test Scenarios

Scenarios describe **situations to test**, organised by type. A scenario is
deliberately coarser than a test case: several `TC-xxx` cases can implement one
`SCN-xxx`, and one scenario can span several features.

| File | Focus | IDs |
| --- | --- | --- |
| [`smoke.md`](smoke.md) | "Is it alive?" checks to run after every deploy | SCN-001…008 |
| [`functional.md`](functional.md) | Happy paths and alternate flows per feature | SCN-009…024 |
| [`regression.md`](regression.md) | Existing behaviour that changes could break | SCN-025…034 |
| [`negative.md`](negative.md) | Invalid, missing and unauthorised input | SCN-035…046 |
| [`edge-cases.md`](edge-cases.md) | Boundaries, empties, maximums, concurrency | SCN-047…062 |
| [`integration.md`](integration.md) | Component-to-component and layer-to-layer flows | SCN-063…074 |
| [`api.md`](api.md) | HTTP contract details of the three endpoints | SCN-075…088 |
| [`database.md`](database.md) | Persistence, schema and degradation | SCN-089…096 |
| [`ui.md`](ui.md) | Rendered interface, accessibility, responsive behaviour | SCN-097…108 |
| [`performance.md`](performance.md) | Latency, payload size, concurrency, growth | SCN-109…116 |
| [`security.md`](security.md) | Attack surface, input abuse, data exposure | SCN-117…133 |

**Status vocabulary:** `PASS` (executed and green) · `KNOWN ISSUE` (executed, defect
tracked) · `NOT_EXECUTED` (documented, blocked by the environment) · `BLOCKED`
(dependency missing, e.g. MongoDB).

Every scenario links to its feature docs and test cases so the chain
requirement → feature → scenario → case stays intact.

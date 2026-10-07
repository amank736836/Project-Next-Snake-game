# AI-assisted testing

This folder is for AI agents (and the humans directing them) working on this project's
tests. It exists because an AI can generate a hundred plausible test cases in a minute
and a hundred *false claims* even faster. The rules here are designed to make the second
failure mode impossible.

| File | Read it when |
| --- | --- |
| [`test-agent-instructions.md`](test-agent-instructions.md) | **Before doing anything.** The operating manual: the six-phase loop and the hard rules. |
| [`test-generation-rules.md`](test-generation-rules.md) | Before writing a test, fixture or bug report |
| [`test-prompts.md`](test-prompts.md) | When you need a starting prompt for a task |
| This file | When you are deciding *whether* AI should do the work |

## What AI is good for here

- Reading the codebase and drafting requirement/feature/scenario catalogues that a
  human then reviews (that is how `../requirements/` and `../features/` were produced).
- Writing the mechanical parts of a test: mounting a component, seeding a fixture,
  asserting a shape.
- Exploring an API for validation gaps (the curl fuzzing that found BUG-001/003/013/014
  was AI-driven) and turning each finding into a case under the rules.
- Characterising existing behaviour so a later fix shows up as a diff.

## What AI must not do here

- Invent a result. If it did not run, it is `NOT_EXECUTED`.
- Invent numbers. Latency, payload sizes and counts come from TAP/JSON artefacts.
- Weaken a test to make a run green. A failing assertion is a finding, not an obstacle.
- Touch application source to make a test pass (see the rules file; the one exception is
  a change explicitly agreed as necessary and reviewed by a human).
- Add a dependency to save effort.

## The one-line version

> Analyze → Plan → Test → Record → Verify → Report — and never claim a test passed
> without execution and evidence.

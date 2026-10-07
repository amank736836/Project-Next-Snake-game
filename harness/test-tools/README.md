# Test Tools

Every tool the harness uses, documented with the same eight fields:

> **Tool · Purpose · Installation · Configuration · How to Run · Expected Output ·
> Where Results Are Stored · Known Limitations**

The guiding rule is **reuse what the project already has**. The harness added exactly
one dependency (`jsdom`) and no runtime dependency at all — `package.json`'s
`dependencies` block is untouched. Anything that could be done with Node's standard
library or the existing toolchain is done that way.

| Tool | Used for | Doc |
| --- | --- | --- |
| Node.js test runner | Executing every suite, TAP output, `todo`/`skip` semantics | [`node-test-runner.md`](node-test-runner.md) |
| TypeScript compiler (project's own) | Transpiling `src/**/*.ts(x)` inside the runner | [`typescript-loader.md`](typescript-loader.md) |
| jsdom | Browser globals for React/UI tests | [`jsdom.md`](jsdom.md) |
| curl + jq | Raw HTTP evidence capture, ad-hoc API probing | [`curl-and-jq.md`](curl-and-jq.md) |
| Bash runner scripts | Build, server lifecycle, suite orchestration | [`runner-scripts.md`](runner-scripts.md) |
| summarize.mjs | TAP → human summary, run archive | [`summarize.md`](summarize.md) |
| Next.js build & ESLint | Pre-flight gate before any suite | [`next-build-and-lint.md`](next-build-and-lint.md) |
| MongoDB (not installed here) | The gated database suite | [`mongodb-local.md`](mongodb-local.md) |

Start here: [`setup.md`](setup.md) — prerequisites and the one-command quick start.

## Adding a tool

Prefer not to. If a new tool is unavoidable:

1. Prove the standard library, Node, curl, jq or an existing devDependency cannot do it.
2. Add it as a **devDependency** only, never a runtime dependency.
3. Document it here using the eight fields.
4. Note it in `../reports/coverage.md` and in the "Tools" table of
   `../TESTING_STRATEGY.md` if it changes the strategy.

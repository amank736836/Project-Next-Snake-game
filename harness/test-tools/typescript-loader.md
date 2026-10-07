# TypeScript/CSS loader (project compiler)

- **Tool:** `harness/automation/utilities/loader.mjs`, registered by `register.mjs`.
  It is a ~100-line Node module hook that uses the **project's own TypeScript
  installation** (`devDependency typescript@5.9.3`) via `ts.transpileModule`.
- **Purpose:** let `node --test` import the application's `.ts`/`.tsx` files unchanged.
  Without it, four things break:
  1. extensionless relative imports (`./types`, `../utils`),
  2. the `@/…` path alias from `tsconfig.json`,
  3. CSS-module imports,
  4. **type-only imports** — `import { ScoreEntry } from "../types"` where `ScoreEntry`
     is an interface. Node 22's native type stripping does not elide those, so the
     module fails at link time. `transpileModule` does elide them.
- **Installation:** none. It is project code, not a dependency.
- **Configuration:** none; paths are derived from the loader's own location
  (`harness/automation/utilities/` → repo root → `src/`), so it works from any cwd.
  CSS modules are turned into a Proxy returning stable class strings, which is enough
  for markup assertions and deliberately *not* an attempt to test styles.
- **How to run:** implicitly, via `--import ./harness/automation/utilities/register.mjs`
  in every runner script. To use it ad hoc:

  ```bash
  node --import ./harness/automation/utilities/register.mjs \
       -e 'import("./src/components/game/utils.ts").then(m => console.log(m.GRID_SIZE))'
  ```
- **Expected output:** no output of its own; modules simply import. A resolver failure
  surfaces as `ERR_MODULE_NOT_FOUND`, a type-only-import failure as
  `SyntaxError: … does not provide an export named …`.
- **Where results are stored:** n/a (build tooling).
- **Known limitations:**
  - Transpilation is **per-file and type-free**: no type checking, no `tsc` diagnostics.
    Run `npx tsc --noEmit` (or `npm run build`) for that.
  - Decorators/`paths` beyond the `@/` prefix are not resolved.
  - It compiles the app's source as-is; the harness never rewrites application files.
    (An earlier attempt edited `src/` to add `import type` keywords — reverted, because
    tests must not require product changes.)

/**
 * Module resolver + TypeScript/JSX compiler used by every automated test here.
 *
 * Why this exists
 * ---------------
 * The application source is TypeScript/TSX that is normally compiled by Next.js.
 * Node 22 can run `.ts` files natively (type stripping), but it cannot:
 *
 *   1. resolve extensionless relative imports   → "./types", "../utils"
 *   2. resolve the "@/..." path alias           → "@/lib/db"   (tsconfig paths)
 *   3. import CSS modules                       → "./X.module.css"
 *   4. transform JSX                            → .tsx components
 *   5. elide imports that only reference types  → `import { ScoreEntry } from "../types"`
 *
 * (1)–(3) are handled by the resolve/load hooks below; (4) and (5) are handled by
 * running the project's own `typescript` compiler over each module — the same
 * compiler and the same semantics Next.js would use. Nothing is installed and
 * no application file is touched.
 *
 * Register with:  node --import ./harness/automation/utilities/register.mjs ...
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

// harness/automation/utilities/ → repository root → src/
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.resolve(HERE, "../../../src");

const EXTENSIONS = [".ts", ".tsx", ".mts", ".mjs", ".js", ".jsx", ".json"];

const tryFiles = (candidate) => {
  for (const file of [candidate, ...EXTENSIONS.map((ext) => candidate + ext)]) {
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  for (const ext of EXTENSIONS) {
    const indexFile = path.join(candidate, `index${ext}`);
    if (existsSync(indexFile)) return indexFile;
  }
  return null;
};

let tsCompiler;
const loadTypeScript = async () => {
  if (!tsCompiler) {
    const ts = await import("typescript");
    tsCompiler = ts.default ?? ts;
  }
  return tsCompiler;
};

export async function resolve(specifier, context, nextResolve) {
  // 1. "@/..." → "<repo>/src/..."
  const mapped = specifier.startsWith("@/")
    ? pathToFileURL(path.join(SRC_ROOT, specifier.slice(2))).href
    : specifier;

  // 2. extensionless / aliased relative paths
  if (mapped.startsWith("./") || mapped.startsWith("../") || mapped.startsWith("file:")) {
    const parent = context.parentURL ?? pathToFileURL(path.join(HERE, "index.mjs")).href;
    const candidate = mapped.startsWith("file:")
      ? fileURLToPath(mapped)
      : path.resolve(path.dirname(fileURLToPath(parent)), mapped);

    // 3. CSS modules are asset imports — hand them to the load hook.
    if (candidate.endsWith(".css")) {
      return { url: `${pathToFileURL(candidate).href}?css-stub`, shortCircuit: true, format: "module" };
    }

    const found = tryFiles(candidate);
    if (found) return nextResolve(pathToFileURL(found).href, context);
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  // 3. CSS modules become a Proxy so `styles.anything` yields a stable string.
  if (url.endsWith("?css-stub")) {
    return {
      format: "module",
      shortCircuit: true,
      source:
        'const styles = new Proxy({}, { get: (_t, key) => (typeof key === "string" ? "css-" + key : undefined) });\n' +
        "export default styles;\n",
    };
  }

  // 4 + 5. Compile TypeScript and JSX exactly like the bundler does.
  if (/\.(ts|tsx|mts)$/.test(url) && !url.includes("?")) {
    const ts = await loadTypeScript();
    const file = fileURLToPath(url);
    const source = readFileSync(file, "utf8");
    const { outputText } = ts.transpileModule(source, {
      fileName: file,
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        esModuleInterop: true,
        isolatedModules: true,
        sourceMap: false,
        inlineSourceMap: false,
        removeComments: false,
      },
    });
    return { format: "module", shortCircuit: true, source: outputText };
  }

  return nextLoad(url, context);
}

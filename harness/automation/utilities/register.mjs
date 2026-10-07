/**
 * Entry point for `node --import`.
 *
 * Registers:
 *   - the TypeScript/CSS/alias resolver  (./loader.mjs)
 *   - a jsdom-backed browser global environment for React client tests
 *     (only when HARNESS_BROWSER_ENV=1, so pure logic tests stay fast)
 */
import { register } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

register("./loader.mjs", pathToFileURL(path.join(here, "loader.mjs")).href);

if (process.env.HARNESS_BROWSER_ENV === "1") {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM("<!doctype html><html><head></head><body><div id=\"root\"></div></body></html>", {
    url: "http://localhost:3000",
    pretendToBeVisual: true,
  });

  const { window } = dom;

  const expose = (key, value) => {
    if (value === undefined) return;
    Object.defineProperty(globalThis, key, { value, writable: true, configurable: true });
  };

  expose("window", window);
  expose("document", window.document);
  expose("navigator", window.navigator);
  expose("localStorage", window.localStorage);
  expose("sessionStorage", window.sessionStorage);
  expose("HTMLElement", window.HTMLElement);
  expose("HTMLInputElement", window.HTMLInputElement);
  expose("Element", window.Element);
  expose("Node", window.Node);
  expose("Event", window.Event);
  expose("KeyboardEvent", window.KeyboardEvent);
  expose("MouseEvent", window.MouseEvent);
  expose("PointerEvent", window.PointerEvent ?? window.MouseEvent);
  expose("TouchEvent", window.TouchEvent);
  expose("requestAnimationFrame", window.requestAnimationFrame?.bind(window));
  expose("cancelAnimationFrame", window.cancelAnimationFrame?.bind(window));
  expose("getComputedStyle", window.getComputedStyle?.bind(window));
  expose("matchMedia", window.matchMedia?.bind(window));
  expose("IntersectionObserver", window.IntersectionObserver);

  // React 19 requires this flag to accept act(...) outside of a test renderer.
  expose("IS_REACT_ACT_ENVIRONMENT", true);

  if (typeof window.matchMedia !== "function") {
    // jsdom < 26 ships no matchMedia; give components a deterministic stub.
    const listeners = () => ({ addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false });
    window.matchMedia = (query) => ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, ...listeners() });
    expose("matchMedia", window.matchMedia);
  }
}

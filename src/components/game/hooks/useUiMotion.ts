"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/* --------------------------------------------------------------------------
   Ripple micro-interaction (#12 microinteractions)
   -------------------------------------------------------------------------- */
export interface RippleItem {
  id: number;
  x: number;
  y: number;
  size: number;
}

export const useRipples = () => {
  const [ripples, setRipples] = useState<RippleItem[]>([]);
  const idRef = useRef(0);

  const spawn = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.2;
    const id = ++idRef.current;

    setRipples((prev) => [
      ...prev,
      { id, x: e.clientX - rect.left, y: e.clientY - rect.top, size },
    ]);

    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
  }, []);

  return { ripples, spawn };
};

/* --------------------------------------------------------------------------
   Count-up numbers (odometer style score reveals)
   State is only ever updated from animation frames, never synchronously.
   -------------------------------------------------------------------------- */
export const useCountUp = (value: number, duration = 900, animateOnMount = false) => {
  const [display, setDisplay] = useState(animateOnMount ? 0 : value);
  const fromRef = useRef(animateOnMount ? 0 : value);
  const frameRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();

    const settle = () => {
      fromRef.current = to;
      setDisplay(to);
    };

    const tick = (now: number) => {
      if (reduce) {
        settle();
        return;
      }
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return display;
};

/* --------------------------------------------------------------------------
   Reveal on scroll / mount (#2 scrollytelling, #15 scrolling reveal)
   -------------------------------------------------------------------------- */
export const useInView = <T extends HTMLElement>(
  targetRef: React.RefObject<T | null>,
  threshold = 0.2
) => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = targetRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [targetRef, threshold]);

  return inView;
};

/* --------------------------------------------------------------------------
   Reduced motion preference (external store, no render-time cascades)
   -------------------------------------------------------------------------- */
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const subscribeToMotion = (onChange: () => void) => {
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

export const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false
  );

/* --------------------------------------------------------------------------
   Pointer-tracked variables (glass sheen + faux-3D tilt — #14 / #28)
   -------------------------------------------------------------------------- */
export const usePointerTrack = <T extends HTMLElement>(intensity = 6) => {
  const rafRef = useRef(0);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<T>) => {
      const node = e.currentTarget;
      const rect = node.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        node.style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
        node.style.setProperty("--my", `${(py * 100).toFixed(2)}%`);
        node.style.setProperty("--ry", `${((px - 0.5) * intensity * 2).toFixed(2)}deg`);
        node.style.setProperty("--rx", `${((0.5 - py) * intensity * 2).toFixed(2)}deg`);
      });
    },
    [intensity]
  );

  const onPointerLeave = useCallback((e: React.PointerEvent<T>) => {
    const node = e.currentTarget;
    node.style.setProperty("--ry", "0deg");
    node.style.setProperty("--rx", "0deg");
  }, []);

  return { onPointerMove, onPointerLeave };
};

/* --------------------------------------------------------------------------
   Typewriter for taglines
   -------------------------------------------------------------------------- */
export const useTypewriter = (text: string, speed = 55, startDelay = 400) => {
  const [output, setOutput] = useState("");
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      const frame = requestAnimationFrame(() => setOutput(text));
      return () => cancelAnimationFrame(frame);
    }

    let index = 0;
    let interval = 0;
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        index += 1;
        setOutput(text.slice(0, index));
        if (index >= text.length) window.clearInterval(interval);
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [text, speed, startDelay, reduce]);

  return output;
};

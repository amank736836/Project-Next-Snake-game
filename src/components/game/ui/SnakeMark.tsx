"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SnakeMark.module.css";

/**
 * Animated brand mark: self-drawing coiled snake (#8 stroke-path animation),
 * idle breathing + tail sway (#13 character animation) and pupils that follow
 * the visitor's pointer (#12 microinteraction).
 */
/**
 * `size` is optional — when omitted the mark sizes itself from the
 * `--mark-size` custom property, which lets parents scale it responsively.
 */
export default function SnakeMark({ size }: { size?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const svg = svgRef.current;
      if (!svg || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = svg.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(dist / 40, 1) * 3.1;
        setGaze({ x: (dx / dist) * reach, y: (dy / dist) * reach });
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      className={styles.mark}
      style={size ? ({ "--mark-size": `${size}px` } as React.CSSProperties) : undefined}
    >
      <span className={styles.halo} aria-hidden="true" />
      <span className={styles.ring} aria-hidden="true" />

      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox="0 0 120 120"
        fill="none"
        role="img"
        aria-label="Nagini coiled snake emblem"
      >
        <defs>
          <linearGradient id="mark-body" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent-cyan)" />
            <stop offset="45%" stopColor="var(--snake-color)" />
            <stop offset="100%" stopColor="var(--snake-head-color)" />
          </linearGradient>
          <radialGradient id="mark-head" cx="35%" cy="30%">
            <stop offset="0%" stopColor="var(--snake-color)" />
            <stop offset="100%" stopColor="var(--snake-head-color)" />
          </radialGradient>
          <filter id="mark-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* body coil — draws itself in on mount, then breathes */}
        <g className={styles.coil}>
          <path
            className={styles.bodyHalo}
            pathLength={100}
            d="M20 94 C 20 56 58 56 58 84 C 58 106 98 106 98 76 C 98 46 68 44 62 28"
          />
          <path
            className={styles.body}
            pathLength={100}
            filter="url(#mark-glow)"
            d="M20 94 C 20 56 58 56 58 84 C 58 106 98 106 98 76 C 98 46 68 44 62 28"
          />
        </g>

        {/* head */}
        <g className={styles.head}>
          <ellipse cx="62" cy="26" rx="15" ry="13" fill="url(#mark-head)" />
          <circle cx="56.5" cy="22.5" r="3.6" fill="#fff" />
          <circle cx="67.5" cy="22.5" r="3.6" fill="#fff" />
          <circle cx={56.5 + gaze.x} cy={22.5 + gaze.y} r="1.8" fill="#10102a" />
          <circle cx={67.5 + gaze.x} cy={22.5 + gaze.y} r="1.8" fill="#10102a" />
          <path
            className={styles.tongue}
            d="M62 38 L62 47 M62 47 L58.5 51 M62 47 L65.5 51"
            stroke="var(--accent-red)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="54" cy="9" r="2.2" fill="var(--accent-cyan)" className={styles.spark} />
          <circle cx="72" cy="11" r="1.6" fill="var(--accent-gold)" className={styles.spark} />
        </g>

        {/* orbiting apple */}
        <g className={styles.appleGroup}>
          <circle cx="20" cy="94" r="5.4" fill="var(--food-color)" />
          <path d="M20 88 q 5 -5 9 -2 q -2.5 5.5 -8 4.5 z" fill="var(--accent-mint)" />
        </g>
      </svg>
    </div>
  );
}

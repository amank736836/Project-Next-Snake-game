"use client";

import styles from "./SnakeLoader.module.css";

interface SnakeLoaderProps {
  label?: string;
  compact?: boolean;
}

/**
 * Self-drawing SVG snake that slithers after an apple (#8 stroke-path draw +
 * #25 loading animation). Also used as the pre-hydration placeholder.
 */
export default function SnakeLoader({ label = "Summoning Nagini", compact = false }: SnakeLoaderProps) {
  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ""}`} role="status" aria-live="polite">
      <svg className={styles.svg} viewBox="0 0 240 120" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="nagini-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--snake-head-color)" />
            <stop offset="55%" stopColor="var(--snake-color)" />
            <stop offset="100%" stopColor="var(--accent-cyan)" />
          </linearGradient>
          <filter id="nagini-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          className={styles.trail}
          d="M12 92 C 46 92, 46 40, 80 40 S 118 92, 152 92 S 190 40, 224 40"
        />
        <path
          className={styles.body}
          filter="url(#nagini-glow)"
          d="M12 92 C 46 92, 46 40, 80 40 S 118 92, 152 92 S 190 40, 224 40"
        />
        <circle className={styles.head} r="7.5" />
        <circle className={styles.apple} r="7" cx="216" cy="40" />
        <path className={styles.leaf} d="M216 32 q 7 -6 12 -3 q -3 7 -10 6 z" />
      </svg>

      <div className={styles.meta}>
        <span className={styles.label}>
          {label}
          <span className={styles.dots} aria-hidden="true">
            <i /> <i /> <i />
          </span>
        </span>
        {!compact && (
          <div className={styles.bar} aria-hidden="true">
            <span className={styles.barFill} />
          </div>
        )}
      </div>
    </div>
  );
}

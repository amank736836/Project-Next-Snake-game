"use client";

import styles from "./Ripple.module.css";
import { RippleItem } from "../hooks/useUiMotion";

/** Overlay that renders click ripples inside a relatively-positioned parent. */
export default function RippleLayer({ ripples }: { ripples: RippleItem[] }) {
  return (
    <span className={styles.layer} aria-hidden="true">
      {ripples.map((r) => (
        <span
          key={r.id}
          className={styles.ripple}
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
          }}
        />
      ))}
    </span>
  );
}

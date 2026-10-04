"use client";

import { useCallback, useRef, useState } from "react";
import styles from "./ThemeToggle.module.css";

interface ThemeToggleProps {
    theme: "light" | "dark";
    onToggle: () => void;
}

interface Wave {
    id: number;
    x: number;
    y: number;
}

/**
 * Theme switch with a sliding sun/moon knob and a colour wave that ripples
 * across the whole page on toggle (#22 page transition effect).
 */
export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
    const [waves, setWaves] = useState<Wave[]>([]);
    const idRef = useRef(0);
    const isDark = theme === "dark";

    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const id = ++idRef.current;

        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setWaves((prev) => [
                ...prev,
                { id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
            ]);
            window.setTimeout(() => setWaves((prev) => prev.filter((w) => w.id !== id)), 950);
        }

        onToggle();
    }, [onToggle]);

    return (
        <>
            {waves.map((w) => (
                <span
                    key={w.id}
                    className={styles.wave}
                    style={{ left: w.x, top: w.y }}
                    aria-hidden="true"
                />
            ))}

            <button
                className={styles.toggle}
                onClick={handleClick}
                type="button"
                role="switch"
                aria-checked={isDark}
                aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
                title={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
                <span className={styles.track} aria-hidden="true">
                    <span className={styles.trackGlow} />
                    <span className={styles.crater} />
                    <span className={styles.knob} data-dark={isDark}>
                        <span className={`${styles.icon} ${styles.sun}`}>☀️</span>
                        <span className={`${styles.icon} ${styles.moon}`}>🌙</span>
                    </span>
                </span>
                <span className={styles.label}>{isDark ? "Light" : "Dark"}</span>
            </button>
        </>
    );
}

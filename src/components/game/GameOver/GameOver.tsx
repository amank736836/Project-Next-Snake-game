"use client";

import { useEffect, useMemo, useRef } from "react";
import styles from "./GameOver.module.css";
import { useCountUp, useRipples } from "../hooks/useUiMotion";
import RippleLayer from "../ui/Ripple";

interface GameOverProps {
    playerName: string;
    score: number;
    bestScore: number;
    length: number;
    isNewRecord: boolean;
    onPlayAgain: () => void;
    onViewLeaderboard: () => void;
    onMainMenu: () => void;
}

const TITLE = "GAME OVER";
const CONFETTI = Array.from({ length: 26 }, (_, i) => i);

export default function GameOver({
    playerName, score, bestScore, length, isNewRecord,
    onPlayAgain, onViewLeaderboard, onMainMenu
}: GameOverProps) {
    const displayScore = useCountUp(score, 1100, true);
    const displayBest = useCountUp(bestScore, 1300, true);
    const ripples = useRipples();
    const letters = useMemo(() => TITLE.split(""), []);
    const initials = (playerName || "?").trim().charAt(0).toUpperCase();
    const panelRef = useRef<HTMLDivElement>(null);

    /**
     * Modal behaviour: move focus into the dialog on open, keep Tab inside it
     * while it is open, and hand focus back to whatever opened it on close.
     * Without this, `aria-modal="true"` is a promise the DOM does not keep —
     * keyboard users can still reach the board and the hub behind the overlay.
     */
    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const panel = panelRef.current;

        const focusables = () =>
            Array.from(
                panel?.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                ) ?? []
            ).filter((el) => el.offsetParent !== null);

        const first = focusables()[0];
        (panel ?? first)?.focus();

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") { onPlayAgain(); return; }
            if (e.key === "Escape") { onMainMenu(); return; }
            if (e.key !== "Tab") return;

            const items = focusables();
            if (items.length === 0) {
                e.preventDefault();
                panel?.focus();
                return;
            }
            const edge = e.shiftKey ? items[0] : items[items.length - 1];
            const active = document.activeElement;
            if (active === edge || active === panel) {
                e.preventDefault();
                (e.shiftKey ? items[items.length - 1] : items[0]).focus();
            } else if (active instanceof HTMLElement && !panel?.contains(active)) {
                e.preventDefault();
                items[0].focus();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            previouslyFocused?.focus?.();
        };
    }, [onPlayAgain, onMainMenu]);

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="gameover-title">
            <div className={styles.backdrop} />

            {isNewRecord && (
                <div className={styles.confetti} aria-hidden="true">
                    {CONFETTI.map((i) => (
                        <span
                            key={i}
                            className={styles.confettiPiece}
                            style={{
                                left: `${(i * 3.9 + 4) % 96}%`,
                                animationDelay: `${(i % 9) * 0.22}s`,
                                animationDuration: `${2.4 + (i % 5) * 0.32}s`,
                                background: ["#45e06f", "#12cbc4", "#fbc531", "#8b5cf6", "#ff4d6d"][i % 5],
                            }}
                        />
                    ))}
                </div>
            )}

            <div className={`${styles.panel} ${isNewRecord ? styles.record : ""}`} ref={panelRef} tabIndex={-1}>
                <span className={styles.panelGlow} aria-hidden="true" />
                <span className={styles.cornerSparkle} aria-hidden="true">✦</span>

                <p className={styles.kicker}>{isNewRecord ? "Legendary run" : "Mission failed"}</p>

                <h2 id="gameover-title" className={styles.title} data-text={TITLE}>
                    {letters.map((letter, i) => (
                        <span
                            key={`${letter}-${i}`}
                            className={styles.letter}
                            style={{ animationDelay: `${0.1 + i * 0.055}s` }}
                        >
                            {letter === " " ? "\u00A0" : letter}
                        </span>
                    ))}
                </h2>

                {/* fallen serpent (#13 character animation) */}
                <svg className={styles.fallen} viewBox="0 0 200 70" fill="none" aria-hidden="true">
                    <path
                        className={styles.fallenBody}
                        d="M12 54 C 40 20, 70 62, 104 34 S 168 40, 186 22"
                        stroke="var(--snake-color)"
                        strokeWidth="9"
                        strokeLinecap="round"
                    />
                    <g className={styles.fallenHead}>
                        <ellipse cx="188" cy="20" rx="15" ry="13" fill="var(--snake-head-color)" />
                        <path d="M180 15 l7 7 M187 15 l-7 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
                        <path d="M193 14 l7 7 M200 14 l-7 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
                        <path
                            className={styles.fallenTongue}
                            d="M186 32 l-6 12 m6 -12 l4 13"
                            stroke="var(--accent-red)"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </g>
                </svg>

                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Your score</span>
                        <strong className={styles.statValue}>{displayScore}</strong>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Session best</span>
                        <strong className={`${styles.statValue} ${styles.bestValue}`}>{displayBest}</strong>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Snake length</span>
                        <strong className={styles.statValue}>{length}</strong>
                    </div>
                </div>

                {isNewRecord && (
                    <p className={styles.recordBadge}>
                        <span aria-hidden="true">★</span> NEW RECORD <span aria-hidden="true">★</span>
                    </p>
                )}

                <div className={styles.actions}>
                    <button
                        className={styles.playAgain}
                        onClick={onPlayAgain}
                        onPointerDown={ripples.spawn}
                        type="button"
                    >
                        <span className={styles.btnShine} aria-hidden="true" />
                        <span className={styles.btnLabel}>{isNewRecord ? "SLAY AGAIN" : "TRY AGAIN"} 🔁</span>
                        <RippleLayer ripples={ripples.ripples} />
                    </button>

                    <button className={styles.secondary} onClick={onViewLeaderboard} type="button">
                        HALL OF FAME 🏆
                    </button>
                    <button className={styles.ghost} onClick={onMainMenu} type="button">
                        MAIN MENU
                    </button>
                </div>

                <p className={styles.hint}>
                    <span className={styles.avatar} aria-hidden="true">{initials}</span>
                    Press <kbd>Enter</kbd> to hunt again · <kbd>Esc</kbd> for the menu
                </p>
            </div>
        </div>
    );
}

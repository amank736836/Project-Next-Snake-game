"use client";

import { useEffect, useState } from "react";
import styles from "./GameHeader.module.css";
import { useCountUp } from "../hooks/useUiMotion";

interface GameHeaderProps {
    playerName: string;
    score: number;
    bestScore?: number;
    onPause: () => void;
    boardSizeVar: string;
}

export default function GameHeader({ playerName, score, bestScore = 0, onPause, boardSizeVar }: GameHeaderProps) {
    const displayScore = useCountUp(score, 320);
    const [prevScore, setPrevScore] = useState(score);
    const [combo, setCombo] = useState(false);

    // Derive the "just ate" state while rendering — no effect cascades.
    if (score !== prevScore) {
        setPrevScore(score);
        setCombo(score > prevScore);
    }

    // …then let the combo badge fade back out (async, so it stays cheap)
    useEffect(() => {
        if (!combo) return;
        const timer = window.setTimeout(() => setCombo(false), 620);
        return () => window.clearTimeout(timer);
    }, [combo]);

    const speed = Math.max(95 - score, 55);
    const speedRatio = Math.min(Math.max((95 - speed) / 40, 0), 1);
    const bars = 5;
    const litBars = Math.round(speedRatio * bars);
    const initial = (playerName || "?").trim().charAt(0).toUpperCase();

    return (
        <div className={styles.header} style={{ width: boardSizeVar }}>
            <span className={styles.sheen} aria-hidden="true" />

            <div className={styles.currentUser}>
                <span className={styles.avatar} aria-hidden="true">
                    {initial}
                    <span className={styles.avatarRing} />
                </span>
                <span className={styles.userName}>{playerName || "Hunter"}</span>
            </div>

            <div className={styles.scoreCluster}>
                <div className={`${styles.liveScore} ${combo ? styles.combo : ""}`}>
                    <span className={styles.apple} aria-hidden="true">🍎</span>
                    <span className={styles.scoreValue} key={score}>{displayScore}</span>
                    {combo && (
                        <span className={styles.floatPlus} key={`plus-${score}`} aria-hidden="true">+1</span>
                    )}
                </div>

                <div className={styles.speedMeter} aria-hidden="true">
                    {Array.from({ length: bars }).map((_, i) => (
                        <span
                            key={i}
                            className={`${styles.speedBar} ${i < litBars ? styles.speedOn : ""}`}
                        />
                    ))}
                </div>
            </div>

            {bestScore > 0 && (
                <div className={styles.best} title="Your personal best this session">
                    <span aria-hidden="true">👑</span> {bestScore}
                </div>
            )}

            <button className={styles.pauseBtn} onClick={onPause} type="button">
                <span className={styles.pauseIcon} aria-hidden="true">
                    <i />
                    <i />
                </span>
                <span className={styles.pauseLabel}>PAUSE</span>
            </button>
        </div>
    );
}

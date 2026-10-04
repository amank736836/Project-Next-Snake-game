"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MissionHub.module.css";
import { ControlType, ScoreEntry } from "../types";
import { usePointerTrack, useRipples, useTypewriter } from "../hooks/useUiMotion";
import RippleLayer from "../ui/Ripple";
import SnakeMark from "../ui/SnakeMark";

interface MissionHubProps {
    playerName: string;
    setPlayerName: (name: string) => void;
    alert: boolean;
    onStart: () => void;
    onResume: () => void;
    hasSavedGame: boolean;
    controlType: ControlType;
    setControlType: (type: ControlType) => void;
    onViewLeaderboard: () => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    leader?: ScoreEntry;
    showLeaderboardButton?: boolean;
}

const TITLE = "Nagini";

export default function MissionHub({
    playerName, setPlayerName, alert, onStart, onResume,
    hasSavedGame, controlType, setControlType, onViewLeaderboard, inputRef,
    leader, showLeaderboardButton = true
}: MissionHubProps) {
    const tilt = usePointerTrack<HTMLDivElement>(4);
    const ripples = useRipples();
    const [shake, setShake] = useState(false);
    const [pressedKey, setPressedKey] = useState<string | null>(null);

    const tagline = useTypewriter("Slither · Devour · Grow · Repeat", 46, 700);

    const letters = useMemo(() => TITLE.split(""), []);

    const shakeTimer = useRef(0);

    // restart the CSS shake animation on every failed attempt
    const nudgeInput = () => {
        setShake(false);
        window.clearTimeout(shakeTimer.current);
        const frame = window.requestAnimationFrame(() => setShake(true));
        shakeTimer.current = window.setTimeout(() => {
            cancelAnimationFrame(frame);
            setShake(false);
        }, 560);
    };

    useEffect(() => () => window.clearTimeout(shakeTimer.current), []);

    // LED-style keyboard hint feedback for the arrow pad
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key.startsWith("Arrow")) setPressedKey(e.key);
        };
        const up = (e: KeyboardEvent) => {
            if (e.key.startsWith("Arrow")) setPressedKey(null);
        };
        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, []);

    const handleStart = () => {
        if (playerName.trim() === "") nudgeInput();
        onStart();
    };

    return (
        <div className={styles.centerColumn}>
            <div className={styles.title}>
                <SnakeMark />

                <h1 className={styles.gameName} aria-label={TITLE}>
                    {letters.map((letter, i) => (
                        <span
                            key={`${letter}-${i}`}
                            className={styles.letter}
                            style={{ animationDelay: `${0.25 + i * 0.09}s` }}
                            aria-hidden="true"
                        >
                            {letter}
                        </span>
                    ))}
                </h1>

                <p className={styles.subtitle}>
                    <span className={styles.subtitleText}>{tagline}</span>
                    <span className={styles.caret} aria-hidden="true" />
                </p>

                <p className={styles.franchise}>from 🤺 Harry Potter 👓</p>
            </div>

            <div
                className={`${styles.menuBox} ${shake ? styles.shake : ""}`}
                onPointerMove={tilt.onPointerMove}
                onPointerLeave={tilt.onPointerLeave}
            >
                <span className={styles.sheen} aria-hidden="true" />

                {leader && (
                    <div className={styles.leaderTicker}>
                        <span className={styles.tickerIcon} aria-hidden="true">🏆</span>
                        <span className={styles.tickerText}>
                            <strong>{leader.name}</strong> rules the hall with{" "}
                            <strong>{leader.highestScore || leader.score}</strong>
                        </span>
                    </div>
                )}

                <div className={`${styles.field} ${playerName ? styles.fieldFilled : ""}`}>
                    <input
                        id="player-name"
                        type="text"
                        placeholder=" "
                        value={playerName}
                        className={styles.userInput}
                        onChange={(e) => setPlayerName(e.target.value.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 20))}
                        onKeyDown={(e) => e.key === "Enter" && playerName.trim() !== "" && handleStart()}
                        ref={inputRef}
                        aria-label="Enter your name"
                        autoComplete="off"
                        spellCheck={false}
                    />
                    <label className={styles.floatingLabel} htmlFor="player-name">
                        Enter your name ✍️
                    </label>
                    <span className={styles.fieldGlow} aria-hidden="true" />
                </div>

                {alert && <p className={styles.alertText} role="alert">Please enter your name 🙏</p>}

                <button
                    className={styles.startBtn}
                    onClick={handleStart}
                    onPointerDown={ripples.spawn}
                    type="button"
                >
                    <span className={styles.btnShine} aria-hidden="true" />
                    <span className={styles.btnLabel}>
                        START MISSION
                        <span className={styles.btnIcon} aria-hidden="true">⚔️</span>
                    </span>
                    <RippleLayer ripples={ripples.ripples} />
                </button>

                {hasSavedGame && (
                    <button className={styles.resumeBtn} onClick={onResume} type="button">
                        <span className={styles.btnShine} aria-hidden="true" />
                        <span className={styles.btnLabel}>
                            RESUME MISSION
                            <span className={styles.btnIcon} aria-hidden="true">🚀</span>
                        </span>
                    </button>
                )}

                <div className={styles.controlSelector} role="group" aria-label="Control scheme">
                    <span
                        className={styles.pill}
                        data-side={controlType}
                        aria-hidden="true"
                    />
                    <button
                        className={`${styles.selectorBtn} ${controlType === "buttons" ? styles.active : ""}`}
                        onClick={() => setControlType("buttons")}
                        aria-pressed={controlType === "buttons"}
                        type="button"
                    >
                        <span aria-hidden="true">🕹️</span> BUTTONS
                    </button>
                    <button
                        className={`${styles.selectorBtn} ${controlType === "joystick" ? styles.active : ""}`}
                        onClick={() => setControlType("joystick")}
                        aria-pressed={controlType === "joystick"}
                        type="button"
                    >
                        <span aria-hidden="true">🟢</span> JOYSTICK
                    </button>
                </div>

                <div className={styles.keyHints} aria-hidden="true">
                    <kbd className={pressedKey === "ArrowUp" ? styles.keyOn : ""}>↑</kbd>
                    <kbd className={pressedKey === "ArrowLeft" ? styles.keyOn : ""}>←</kbd>
                    <kbd className={pressedKey === "ArrowDown" ? styles.keyOn : ""}>↓</kbd>
                    <kbd className={pressedKey === "ArrowRight" ? styles.keyOn : ""}>→</kbd>
                    <span className={styles.keyHintText}>or WASD to steer</span>
                </div>

                {showLeaderboardButton && (
                    <button className={`${styles.navBtn} mobile-only`} onClick={onViewLeaderboard} type="button">
                        <span>🏆 VIEW HALL OF FAME</span>
                        <span className={styles.navArrow} aria-hidden="true">↩︎</span>
                    </button>
                )}
            </div>

            <ul className={styles.featureChips}>
                <li style={{ animationDelay: "0.05s" }}><span aria-hidden="true">📐</span> 20 × 20 grid</li>
                <li style={{ animationDelay: "0.12s" }}><span aria-hidden="true">🌀</span> Portal walls</li>
                <li style={{ animationDelay: "0.19s" }}><span aria-hidden="true">⚡</span> Speed ramps up</li>
            </ul>
        </div>
    );
}

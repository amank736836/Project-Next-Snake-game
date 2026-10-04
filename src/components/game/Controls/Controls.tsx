"use client";

import { useEffect, useState } from "react";
import styles from "./Controls.module.css";
import { ControlType } from "../types";

type Pointerish = React.TouchEvent | React.MouseEvent;

interface ControlsProps {
    type: ControlType;
    onDirection: (dir: string) => void;
    joystickRefLeft: React.RefObject<HTMLDivElement | null>;
    joystickRefRight: React.RefObject<HTMLDivElement | null>;
    stickPosLeft: { x: number; y: number };
    stickPosRight: { x: number; y: number };
    onJoystickStart: (e: Pointerish) => void;
    onJoystickMove: (e: Pointerish, side: "left" | "right") => void;
    onJoystickEnd: (side: "left" | "right") => void;
    layout: "side-left" | "side-right" | "portrait";
}

const DIRS = ["ArrowUp", "ArrowLeft", "ArrowRight", "ArrowDown"] as const;
type Dir = typeof DIRS[number];

const ARROW_ROTATION: Record<Dir, number> = {
    ArrowUp: 0,
    ArrowRight: 90,
    ArrowDown: 180,
    ArrowLeft: -90,
};

function ArrowIcon({ dir }: { dir: Dir }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="26"
            height="26"
            aria-hidden="true"
            style={{ transform: `rotate(${ARROW_ROTATION[dir]}deg)`, display: "block" }}
        >
            <path
                d="M12 3.5 19 12h-4.2v8.5H9.2V12H5l7-8.5Z"
                fill="currentColor"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth="1"
                strokeLinejoin="round"
            />
        </svg>
    );
}

interface JoystickProps {
    stickPos: { x: number; y: number };
    joystickRef: React.RefObject<HTMLDivElement | null>;
    side: "left" | "right";
    inline?: boolean;
    onJoystickStart: (e: Pointerish) => void;
    onJoystickMove: (e: Pointerish, side: "left" | "right") => void;
    onJoystickEnd: (side: "left" | "right") => void;
}

/** Thumbstick with pulsing rings and direction LEDs. */
function Joystick({
    stickPos, joystickRef, side, inline,
    onJoystickStart, onJoystickMove, onJoystickEnd
}: JoystickProps) {
    const dx = stickPos.x;
    const dy = stickPos.y;
    const activeDir = Math.abs(dx) < 12 && Math.abs(dy) < 12
        ? null
        : Math.abs(dx) > Math.abs(dy)
            ? (dx > 0 ? "right" : "left")
            : (dy > 0 ? "down" : "up");

    return (
        <div className={styles.joystickWrapper} style={inline ? { marginTop: "2rem" } : undefined}>
            <div
                className={`${styles.joystickBase} ${activeDir ? styles.engaged : ""}`}
                ref={joystickRef}
                onTouchStart={onJoystickStart}
                onTouchMove={(e) => onJoystickMove(e, side)}
                onTouchEnd={() => onJoystickEnd(side)}
                onMouseDown={onJoystickStart}
                onMouseMove={(e) => e.buttons === 1 && onJoystickMove(e, side)}
                onMouseUp={() => onJoystickEnd(side)}
                onMouseLeave={() => onJoystickEnd(side)}
                role="application"
                aria-label="Directional joystick"
            >
                <span className={styles.joystickRing} aria-hidden="true" />
                <span className={styles.joystickRing} style={{ animationDelay: "1.2s" }} aria-hidden="true" />
                <span className={`${styles.tick} ${styles.tickUp} ${activeDir === "up" ? styles.tickOn : ""}`} aria-hidden="true" />
                <span className={`${styles.tick} ${styles.tickDown} ${activeDir === "down" ? styles.tickOn : ""}`} aria-hidden="true" />
                <span className={`${styles.tick} ${styles.tickLeft} ${activeDir === "left" ? styles.tickOn : ""}`} aria-hidden="true" />
                <span className={`${styles.tick} ${styles.tickRight} ${activeDir === "right" ? styles.tickOn : ""}`} aria-hidden="true" />
                <span className={styles.crosshair} aria-hidden="true" />
                <div
                    className={styles.joystickHandle}
                    style={{ transform: `translate(${stickPos.x}px, ${stickPos.y}px)` }}
                >
                    <span className={styles.handleCore} />
                </div>
            </div>
            <span className={styles.joystickHint}>JOYSTICK · DRAG</span>
        </div>
    );
}

export default function Controls({
    type, onDirection, joystickRefLeft, joystickRefRight,
    stickPosLeft, stickPosRight, onJoystickStart, onJoystickMove, onJoystickEnd, layout
}: ControlsProps) {
    const [pressed, setPressed] = useState<Dir | null>(null);

    // Mirror physical keyboard presses onto the on-screen d-pad
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            const match = DIRS.find((d) => d === e.key);
            if (match) setPressed(match);
        };
        const up = (e: KeyboardEvent) => {
            if (DIRS.includes(e.key as Dir)) {
                setPressed((prev) => (prev === e.key ? null : prev));
            }
        };
        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, []);

    const dpad = (
        <div className={styles.dpad}>
            <button
                className={`${styles.dpadBtn} ${styles.up} ${pressed === "ArrowUp" ? styles.lit : ""}`}
                onClick={() => onDirection("ArrowUp")}
                aria-label="Move up"
                type="button"
            >
                <span className={styles.glyph}><ArrowIcon dir="ArrowUp" /></span>
            </button>

            <button
                className={`${styles.dpadBtn} ${styles.left} ${pressed === "ArrowLeft" ? styles.lit : ""}`}
                onClick={() => onDirection("ArrowLeft")}
                aria-label="Move left"
                type="button"
            >
                <span className={styles.glyph}><ArrowIcon dir="ArrowLeft" /></span>
            </button>

            <span className={styles.centerBadge} aria-hidden="true">
                <span className={styles.centerPulse} />
                🐍
            </span>

            <button
                className={`${styles.dpadBtn} ${styles.right} ${pressed === "ArrowRight" ? styles.lit : ""}`}
                onClick={() => onDirection("ArrowRight")}
                aria-label="Move right"
                type="button"
            >
                <span className={styles.glyph}><ArrowIcon dir="ArrowRight" /></span>
            </button>

            <button
                className={`${styles.dpadBtn} ${styles.down} ${pressed === "ArrowDown" ? styles.lit : ""}`}
                onClick={() => onDirection("ArrowDown")}
                aria-label="Move down"
                type="button"
            >
                <span className={styles.glyph}><ArrowIcon dir="ArrowDown" /></span>
            </button>
        </div>
    );

    if (layout === "portrait") {
        return (
            <div className="portrait-only">
                {type === "buttons" ? (
                    dpad
                ) : (
                    <Joystick
                        stickPos={stickPosLeft}
                        joystickRef={joystickRefLeft}
                        side="left"
                        inline
                        onJoystickStart={onJoystickStart}
                        onJoystickMove={onJoystickMove}
                        onJoystickEnd={onJoystickEnd}
                    />
                )}
            </div>
        );
    }

    const isLeft = layout === "side-left";
    const joystickRef = isLeft ? joystickRefLeft : joystickRefRight;
    const stickPos = isLeft ? stickPosLeft : stickPosRight;
    const side: "left" | "right" = isLeft ? "left" : "right";

    if (type === "buttons") {
        const pair: Dir[] = isLeft ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"];
        return (
            <div className={isLeft ? `side-controls ${styles.sideLeft}` : `side-controls ${styles.sideRight}`}>
                <div className={styles.sideColumn}>
                    {pair.map((dir) => (
                        <button
                            key={dir}
                            className={`${styles.sideBtnRect} ${pressed === dir ? styles.lit : ""}`}
                            onClick={() => onDirection(dir)}
                            aria-label={`Move ${dir.replace("Arrow", "").toLowerCase()}`}
                            type="button"
                        >
                            <span className={styles.sideGlyph}><ArrowIcon dir={dir} /></span>
                            <span className={styles.sideKey}>{dir.replace("Arrow", "").toUpperCase()}</span>
                        </button>
                    ))}
                </div>
                <span className={styles.sideLabel} aria-hidden="true">{isLeft ? "VERTICAL" : "HORIZONTAL"}</span>
            </div>
        );
    }

    return (
        <div className={isLeft ? `side-controls ${styles.sideLeft}` : `side-controls ${styles.sideRight}`}>
            <Joystick
                stickPos={stickPos}
                joystickRef={joystickRef}
                side={side}
                onJoystickStart={onJoystickStart}
                onJoystickMove={onJoystickMove}
                onJoystickEnd={onJoystickEnd}
            />
        </div>
    );
}

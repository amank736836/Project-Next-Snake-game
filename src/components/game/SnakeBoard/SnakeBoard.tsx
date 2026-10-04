"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SnakeBoard.module.css";
import { GRID_SIZE, getSnakePartRotation } from "../utils";

interface SnakeBoardProps {
    snake: number[][];
    food: [number, number];
    direction: number[];
    boardSizeVar: string;
}

interface EatFx {
    id: number;
    x: number;
    y: number;
}

const SPARKS = [0, 45, 90, 135, 180, 225, 270, 315];

const HEAD_ROTATION: Record<string, number> = {
    "head-up": 0,
    "head-right": 90,
    "head-down": 180,
    "head-left": -90,
};

export default function SnakeBoard({ snake, food, direction, boardSizeVar }: SnakeBoardProps) {
    const GRIDGAME = Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(""));
    const [fx, setFx] = useState<EatFx | null>(null);
    const prevFood = useRef<[number, number] | null>(null);

    // A food reposition means the snake just ate — replay a bite burst (#12 / #13)
    useEffect(() => {
        const prev = prevFood.current;
        prevFood.current = food;
        if (!prev || (prev[0] === food[0] && prev[1] === food[1])) return;

        setFx({ id: Date.now() + Math.random(), x: prev[0], y: prev[1] });
        const timer = window.setTimeout(() => setFx(null), 820);
        return () => window.clearTimeout(timer);
    }, [food]);

    const head = snake[0];
    const rot = getSnakePartRotation(direction);
    const rotKey = rot.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const rotationClass = styles[rotKey] || "";
    const headRot = HEAD_ROTATION[rot] ?? 0;

    // Distance to the apple drives the "hunting" tension of the scene
    const dx = Math.abs(head[0] - food[0]);
    const dy = Math.abs(head[1] - food[1]);
    const wdx = dx > GRID_SIZE / 2 ? GRID_SIZE - dx : dx;
    const wdy = dy > GRID_SIZE / 2 ? GRID_SIZE - dy : dy;
    const distance = wdx + wdy;
    const isNearby = distance <= 6;
    const isStarving = distance <= 2;

    const headY = head[1];
    const headX = head[0];
    const tongueAngle = Math.atan2(food[1] - headY, food[0] - headX) * (180 / Math.PI);

    return (
        <div
            className={styles.boardFrame}
            style={{ height: boardSizeVar, width: boardSizeVar }}
        >
            <div
                className={`${styles.board} ${isStarving ? styles.hot : ""}`}
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
                role="img"
                aria-label={`Snake of length ${snake.length}, heading ${rot.replace("head-", "")}`}
            >
                {GRIDGAME.map((row, yc) =>
                    row.map((cell, xc) => {
                        const snakeIndex = snake.findIndex(([sx, sy]) => sx === xc && sy === yc);
                        const isFood = food[0] === xc && food[1] === yc;

                        let partClass = "";
                        let segVar: React.CSSProperties = {};

                        if (snakeIndex !== -1) {
                            partClass = styles.snake;
                            const t = snake.length > 1 ? snakeIndex / (snake.length - 1) : 0;
                            segVar = { "--seg": t } as React.CSSProperties;

                            if (snakeIndex === 0) {
                                partClass += ` ${styles.snakeHead} ${rotationClass}`;
                            } else if (snakeIndex === snake.length - 1) {
                                partClass += ` ${styles.snakeTail}`;
                            } else {
                                partClass += ` ${styles.snakeBody}`;
                            }
                        }

                        const showHead = snakeIndex === 0;

                        return (
                            <div
                                key={`${xc}-${yc}`}
                                className={`${styles.cell} ${partClass}`}
                                style={segVar}
                            >
                                {isFood && (
                                    <div className={styles.foodWrap}>
                                        <span className={styles.foodHalo} aria-hidden="true" />
                                        <div className={styles.food} />
                                        <span className={styles.foodSpark} aria-hidden="true">✦</span>
                                    </div>
                                )}

                                {fx && fx.x === xc && fx.y === yc && (
                                    <div className={styles.burst} key={fx.id} aria-hidden="true">
                                        <span className={styles.burstRing} />
                                        <span className={styles.burstRing} style={{ animationDelay: "0.12s" }} />
                                        {SPARKS.map((angle) => (
                                            <span
                                                key={angle}
                                                className={styles.spark}
                                                style={{ "--angle": `${angle}deg` } as React.CSSProperties}
                                            />
                                        ))}
                                        <span className={styles.plusOne}>+1</span>
                                    </div>
                                )}

                                {showHead && (
                                    <>
                                        <span className={styles.headGlow} aria-hidden="true" />
                                        <span className={`${styles.eye} ${styles.eyeLeft}`} aria-hidden="true">
                                            <span className={styles.pupil} />
                                        </span>
                                        <span className={`${styles.eye} ${styles.eyeRight}`} aria-hidden="true">
                                            <span className={styles.pupil} />
                                        </span>
                                        {isNearby && (
                                            <span
                                                className={styles.tongue}
                                                style={{
                                                    transform: `translate(-50%, 0) rotate(${tongueAngle - 90 - headRot}deg)`,
                                                }}
                                                aria-hidden="true"
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })
                )}

                <span className={styles.boardScan} aria-hidden="true" />
            </div>
        </div>
    );
}

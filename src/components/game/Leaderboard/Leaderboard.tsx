"use client";

import { useRef } from "react";
import styles from "./Leaderboard.module.css";
import { ScoreEntry, LeaderboardTab } from "../types";
import { useCountUp, useInView, useRipples } from "../hooks/useUiMotion";
import RippleLayer from "../ui/Ripple";

interface LeaderboardProps {
    allScores: ScoreEntry[];
    latestScores: ScoreEntry[];
    tab: LeaderboardTab;
    setTab: (tab: LeaderboardTab) => void;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onBack: () => void;
    isDashboard?: boolean;
    isLoading?: boolean;
    playerName?: string;
    isDemo?: boolean;
}

const SKELETON_ROWS = [0, 1, 2, 3, 4];

function ScoreValue({ value, delay = 0 }: { value: number; delay?: number }) {
    const display = useCountUp(value, 900, true);
    return <span className={styles.val} style={{ animationDelay: `${delay}ms` }}>{display}</span>;
}

function SkeletonList() {
    return (
        <div className={styles.list} aria-hidden="true">
            {SKELETON_ROWS.map((i) => (
                <div key={i} className={styles.skeletonRow} style={{ animationDelay: `${i * 90}ms` }}>
                    <span className={styles.skeletonBadge} />
                    <span className={styles.skeletonBar} style={{ width: `${68 - i * 8}%` }} />
                </div>
            ))}
        </div>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">🐍</span>
            <p className={styles.emptyTitle}>{label}</p>
            <p className={styles.emptyHint}>No hunts recorded yet — be the first legend.</p>
        </div>
    );
}

interface RowProps {
    entry: ScoreEntry;
    index: number;
    value: number;
    max: number;
    isYou: boolean;
    baseRank: number;
}

function ScoreRow({ entry, index, value, max, isYou, baseRank }: RowProps) {
    const pct = max > 0 ? Math.max((value / max) * 100, 4) : 0;

    return (
        <div
            className={`${styles.item} ${isYou ? styles.you : ""}`}
            style={{ animationDelay: `${index * 70}ms` }}
        >
            <span className={styles.rank}>{baseRank}</span>
            <span className={styles.rowMain}>
                <span className={styles.name}>
                    {entry.name}
                    {isYou && <em className={styles.youTag}>you</em>}
                </span>
                <span className={styles.track} aria-hidden="true">
                    <span className={styles.trackFill} style={{ width: `${pct}%`, animationDelay: `${index * 90 + 120}ms` }} />
                </span>
            </span>
            <ScoreValue value={value} delay={index * 60} />
        </div>
    );
}

export default function Leaderboard({
    allScores, latestScores, tab, setTab, page, totalPages, onPageChange, onBack,
    isDashboard, isLoading = false, playerName, isDemo
}: LeaderboardProps) {
    const highestRef = useRef<HTMLDivElement>(null);
    const recentRef = useRef<HTMLDivElement>(null);
    const highestInView = useInView(highestRef, 0.15);
    const recentInView = useInView(recentRef, 0.15);
    const ripples = useRipples();

    const highestMax = Math.max(1, ...allScores.map((s) => s.highestScore || s.score));
    const recentMax = Math.max(1, ...latestScores.map((s) => s.latestScore || s.score));
    const normalizedName = (playerName || "").trim().toLowerCase();

    return (
        <div className={styles.container}>
            {!isDashboard && (
                <div className={styles.tabSwitcher} role="tablist" aria-label="Leaderboard view">
                    <span className={styles.tabPill} data-tab={tab} aria-hidden="true" />
                    <button
                        className={`${styles.tabBtn} ${tab === "highest" ? styles.active : ""}`}
                        onClick={() => setTab("highest")}
                        type="button"
                        role="tab"
                        aria-selected={tab === "highest"}
                    >
                        🏆 HIGHEST
                    </button>
                    <button
                        className={`${styles.tabBtn} ${tab === "recent" ? styles.active : ""}`}
                        onClick={() => setTab("recent")}
                        type="button"
                        role="tab"
                        aria-selected={tab === "recent"}
                    >
                        🕒 RECENT
                    </button>
                </div>
            )}

            <div className={styles.grid}>
                {/* Highest Scores Section */}
                {(tab === "highest" || !isDashboard) && (
                    <div
                        ref={highestRef}
                        className={`${styles.section} ${highestInView ? styles.inView : ""} ${tab !== "highest" && !isDashboard ? styles.mobileHide : ""}`}
                    >
                        <span className={styles.cardGlow} aria-hidden="true" />
                        <h3>
                            <span aria-hidden="true">🏆</span> Highest Scores
                            {isDemo && <em className={styles.demoChip}>demo</em>}
                        </h3>

                        {isLoading ? (
                            <SkeletonList />
                        ) : allScores.length === 0 ? (
                            <EmptyState label="Hall of fame is empty" />
                        ) : (
                            <div className={styles.list}>
                                {allScores.map((score, index) => (
                                    <ScoreRow
                                        key={`${score.name}-${index}`}
                                        entry={score}
                                        index={index}
                                        value={score.highestScore || score.score}
                                        max={highestMax}
                                        baseRank={(page - 1) * 5 + index + 1}
                                        isYou={!!normalizedName && score.name?.trim().toLowerCase() === normalizedName}
                                    />
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && tab === "highest" && (
                            <div className={styles.pagination}>
                                <button onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page">◀</button>
                                <span className={styles.pageInfo}>
                                    {page} <em>/</em> {totalPages}
                                </span>
                                <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next page">▶</button>
                            </div>
                        )}

                        {!isDashboard && (
                            <button className={`${styles.backBtn} mobile-only`} onClick={onBack} type="button">
                                BACK TO MISSION ↩️
                            </button>
                        )}
                    </div>
                )}

                {/* Recent Hunts Section */}
                {(tab === "recent" || !isDashboard) && (
                    <div
                        ref={recentRef}
                        className={`${styles.section} ${recentInView ? styles.inView : ""} ${tab !== "recent" && !isDashboard ? styles.mobileHide : ""}`}
                    >
                        <span className={styles.cardGlow} aria-hidden="true" />
                        <h3>
                            <span aria-hidden="true">🕒</span> Recent Hunts
                        </h3>

                        {isLoading ? (
                            <SkeletonList />
                        ) : latestScores.length === 0 ? (
                            <EmptyState label="No recent hunts" />
                        ) : (
                            <div className={styles.list}>
                                {latestScores.map((score, index) => (
                                    <ScoreRow
                                        key={`${score.name}-${index}`}
                                        entry={score}
                                        index={index}
                                        value={score.latestScore || score.score}
                                        max={recentMax}
                                        baseRank={index + 1}
                                        isYou={!!normalizedName && score.name?.trim().toLowerCase() === normalizedName}
                                    />
                                ))}
                            </div>
                        )}

                        {!isDashboard && (
                            <button className={`${styles.backBtn} mobile-only`} onClick={onBack} type="button">
                                BACK TO MISSION ↩️
                            </button>
                        )}
                    </div>
                )}
            </div>

            {!isDashboard && (
                <button
                    className={`${styles.backBtn} ${styles.backBtnWide} desktop-only`}
                    onClick={onBack}
                    onPointerDown={ripples.spawn}
                    type="button"
                >
                    <span className={styles.btnShine} aria-hidden="true" />
                    <span className={styles.backLabel}>BACK TO MISSION ↩️</span>
                    <RippleLayer ripples={ripples.ripples} />
                </button>
            )}
        </div>
    );
}

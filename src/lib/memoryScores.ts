import { ScoreEntry } from "@/components/game/types";

/**
 * In-memory score table used only when DATABASE_URL is not configured
 * (local previews, demos, CI). It keeps the UI fully functional instead of
 * failing every request. Data lives for the lifetime of the server process.
 */
export interface StoredScore extends ScoreEntry {
    visits: number;
    updatedAt: Date;
}

const SEED: Array<[string, number]> = [
    ["Nagini", 42],
    ["Tom Riddle", 31],
    ["Hermione", 27],
    ["Draco", 18],
    ["Ron", 12],
    ["Dobby", 7],
];

const isProduction = process.env.NODE_ENV === "production";

interface MemoryDb {
    scores: StoredScore[];
}

const globalForScores = globalThis as unknown as { __naginiScores?: MemoryDb };

const seedScores = (): StoredScore[] =>
    isProduction
        ? []
        : SEED.map(([name, score], index) => ({
            name,
            score,
            highestScore: score,
            latestScore: score,
            visits: 1,
            updatedAt: new Date(Date.now() - index * 1000 * 60 * 47),
        }));

export const memoryDb: MemoryDb =
    globalForScores.__naginiScores ?? (globalForScores.__naginiScores = { scores: seedScores() });

export const listHighest = (page: number, limit: number) => {
    const sorted = [...memoryDb.scores]
        .filter((s) => s.score > 0)
        .sort((a, b) => (b.highestScore || b.score) - (a.highestScore || a.score));

    return {
        scores: sorted.slice((page - 1) * limit, page * limit),
        total: sorted.length,
    };
};

export const listLatest = (limit = 5) =>
    [...memoryDb.scores]
        .filter((s) => s.score > 0)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, limit);

export const upsertScore = (name: string, score: number) => {
    const now = new Date();
    const existing = memoryDb.scores.find((s) => s.name === name);

    if (existing) {
        existing.visits += 1;
        existing.latestScore = score;
        existing.score = Math.max(existing.score, score);
        existing.highestScore = Math.max(existing.highestScore || 0, score);
        existing.updatedAt = now;
        return existing;
    }

    const fresh: StoredScore = {
        name,
        score,
        highestScore: score,
        latestScore: score,
        visits: 1,
        updatedAt: now,
    };
    memoryDb.scores.push(fresh);
    return fresh;
};

import { NextResponse } from "next/server";
import connectToDatabase, { hasDatabase } from "@/lib/db";
import Score from "@/models/Score";
import { listHighest } from "@/lib/memoryScores";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    try {
        // No database configured — serve the in-memory leaderboard instead.
        if (!hasDatabase()) {
            const { scores, total } = listHighest(page, limit);
            return NextResponse.json({
                scores,
                pagination: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
                demo: true,
            });
        }

        await connectToDatabase();
        const scores = await Score.find({ score: { $gt: 0 } })
            .sort({ highestScore: -1, score: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Score.countDocuments({ score: { $gt: 0 } });

        return NextResponse.json({
            scores,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return NextResponse.json({ message }, { status: 400 });
    }
}

import { NextResponse } from "next/server";
import connectToDatabase, { hasDatabase } from "@/lib/db";
import Score from "@/models/Score";
import { listLatest } from "@/lib/memoryScores";

export async function GET() {
    try {
        if (!hasDatabase()) {
            return NextResponse.json(listLatest(5));
        }

        await connectToDatabase();
        const latestScores = await Score.find({ score: { $gt: 0 } }).sort({ updatedAt: -1 }).limit(5);
        return NextResponse.json(latestScores);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return NextResponse.json({ message }, { status: 400 });
    }
}

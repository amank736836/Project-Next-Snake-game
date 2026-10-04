import { NextResponse } from "next/server";
import connectToDatabase, { hasDatabase } from "@/lib/db";
import Score from "@/models/Score";
import { foulWords } from "@/lib/foulWords";
import { upsertScore } from "@/lib/memoryScores";

export async function POST(req: Request) {
    try {
        const { name, score } = await req.json();
        let sanitizedName = name;

        const hasFoulWord = foulWords.some((foulWord) =>
            sanitizedName.toLowerCase().includes(foulWord)
        );

        if (hasFoulWord) {
            sanitizedName = "Anonymous";
        }

        if (!hasDatabase()) {
            const stored = upsertScore(sanitizedName, score);
            return NextResponse.json(
                { message: "Score added/updated successfully (in-memory).", score: stored, demo: true },
                { status: 201 }
            );
        }

        await connectToDatabase();
        const existingScore = await Score.findOne({ name: sanitizedName });

        if (existingScore) {
            existingScore.latestScore = score;
            existingScore.visits += 1;
            if (score > existingScore.highestScore) {
                existingScore.highestScore = score;
                if (score > existingScore.score) {
                    existingScore.score = score;
                }
            }
            await existingScore.save();
        } else {
            const newScore = new Score({
                name: sanitizedName,
                score,
                highestScore: score,
                latestScore: score,
                visits: 1,
            });
            await newScore.save();
        }

        return NextResponse.json({ message: "Score added/updated successfully." }, { status: 201 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return NextResponse.json({ message }, { status: 400 });
    }
}

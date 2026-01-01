import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { tasks, userName } = await request.json();

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            // Return fallback motivation if no API key
            return NextResponse.json({
                motivation: "🚀 Rise and shine! Today is a new opportunity to crush your goals. You've got this!",
            });
        }

        const groq = new Groq({ apiKey });

        // Build a prompt for motivation
        let tasksContext = "The user has no tasks today.";
        if (tasks?.length) {
            tasksContext = `The user has the following tasks today:\n${tasks.map((t: any) => `- ${t.title} at ${t.startTime}`).join("\n")}`;
        }

        const prompt = `You are a motivational coach for a routine tracking app. Generate a short, personalized, encouraging message (2-3 sentences max) to motivate the user to complete their tasks today.

${tasksContext}

User's name: ${userName || "there"}

Be warm, specific to their tasks if possible, and inspiring. Use an emoji at the start.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.8,
            max_completion_tokens: 256,
        });

        const motivation = chatCompletion.choices[0]?.message?.content ||
            "🌟 You've got this! Every task you complete today brings you closer to your goals. Let's make it a great day!";

        return NextResponse.json({ motivation });
    } catch (error: any) {
        console.error("Groq Motivation Error:", error);
        return NextResponse.json({
            motivation: "🚀 Rise and shine! Today is a new opportunity to crush your goals. You've got this!",
        });
    }
}

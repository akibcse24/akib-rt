import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Gemini AI client
const getAIClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    return new GoogleGenAI({ apiKey });
};

export async function POST(request: NextRequest) {
    try {
        const { tasks, userName } = await request.json();

        const ai = getAIClient();

        // Build a prompt for motivation
        let tasksContext = "The user has no tasks today.";
        if (tasks?.length) {
            tasksContext = `The user has the following tasks today:\n${tasks.map((t: any) => `- ${t.title} at ${t.startTime}`).join("\n")}`;
        }

        const prompt = `You are a motivational coach for a routine tracking app. Generate a short, personalized, encouraging message (2-3 sentences max) to motivate the user to complete their tasks today.

${tasksContext}

User's name: ${userName || "there"}

Be warm, specific to their tasks if possible, and inspiring. Use an emoji at the start.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const motivation = response.text || "🌟 You've got this! Every task you complete today brings you closer to your goals. Let's make it a great day!";

        return NextResponse.json({ motivation });
    } catch (error: any) {
        console.error("Motivation API Error:", error);
        // Return a fallback motivation on error
        return NextResponse.json({
            motivation: "🚀 Rise and shine! Today is a new opportunity to crush your goals. You've got this!",
        });
    }
}

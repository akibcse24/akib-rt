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

// System prompt for parsing schedule images
const SYSTEM_PROMPT = `You are a schedule parsing AI. Analyze the image of a class schedule/routine and extract all classes/tasks.

For each class/event you find, extract:
- title: The name of the class/subject
- startTime: Start time in HH:MM format (24-hour)
- endTime: End time in HH:MM format (24-hour)
- days: Array of days like ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
- icon: A relevant emoji for the subject (📚 for general, 🧮 for math, 🔬 for science, 💻 for CS, 📖 for literature, 🎨 for art, 🏃 for PE, 🌍 for geography, etc.)
- timeBlock: One of "Dawn", "Morning", "Noon", "Afternoon", "Evening", "Night" based on the time

IMPORTANT: Respond ONLY with a valid JSON array of tasks. No explanation, no markdown, just pure JSON.
Example response:
[{"title":"Mathematics","startTime":"09:00","endTime":"10:00","days":["MON","WED","FRI"],"icon":"🧮","timeBlock":"Morning"}]`;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("image") as File;

        if (!file) {
            return NextResponse.json({ error: "No image file provided" }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        const mimeType = file.type || "image/jpeg";

        const ai = getAIClient();

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: SYSTEM_PROMPT },
                        {
                            inlineData: {
                                mimeType,
                                data: base64,
                            },
                        },
                    ],
                },
            ],
        });

        const text = response.text || "[]";

        // Try to parse the JSON response
        let tasks = [];
        try {
            // Remove any markdown code blocks if present
            const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            tasks = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("Failed to parse AI response:", text);
            return NextResponse.json(
                { error: "Failed to parse schedule from image. Please try a clearer image." },
                { status: 400 }
            );
        }

        // Validate and clean up tasks
        const validatedTasks = tasks.map((task: any) => ({
            title: task.title || "Untitled Class",
            startTime: task.startTime || "09:00",
            endTime: task.endTime || "10:00",
            days: task.days || ["MON", "TUE", "WED", "THU", "FRI"],
            icon: task.icon || "📚",
            timeBlock: task.timeBlock || "Morning",
        }));

        return NextResponse.json({
            success: true,
            tasks: validatedTasks,
            count: validatedTasks.length,
        });
    } catch (error: any) {
        console.error("Schedule Parse Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to parse schedule image" },
            { status: 500 }
        );
    }
}

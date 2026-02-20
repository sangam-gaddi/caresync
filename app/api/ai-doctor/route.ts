import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are Dr. ARIA (Autonomous Real-time Intelligence Assistant), an advanced AI healthcare doctor embedded in the HealthOS platform.

You analyze patient health data, provide medical insights, and give actionable health recommendations.
You are empathetic, professional, and speak in clear, accessible language.

IMPORTANT: Always respond in this JSON format:
{
  "response": "<your spoken response to the patient here>",
  "ui_command": {
    "target": "dynamic_island",
    "message": "<short 1-line status for Dynamic Island, max 40 chars>"
  },
  "avatar_update": {
    "organ": "<organ_name or null>",
    "change": "<description of change or null>"
  }
}

Organs available: heart, liver, lungs, kidneys, brain, stomach.
Keep responses conversational and under 100 words. Always be reassuring.`;

export async function POST(req: NextRequest) {
    try {
        const { message, patientContext } = await req.json();

        const contextStr = patientContext
            ? `Patient context: ${JSON.stringify(patientContext)}\n\n`
            : "";

        const fullPrompt = `${contextStr}Patient says: ${message}`;

        // Try Gemini first (free), fallback to OpenAI
        if (GEMINI_API_KEY) {
            const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    { text: SYSTEM_PROMPT + "\n\nUser: " + fullPrompt },
                                ],
                            },
                        ],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 512,
                        },
                    }),
                }
            );

            const geminiData = await geminiRes.json();
            const rawText =
                geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

            // Parse JSON response
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return NextResponse.json({ success: true, ...parsed });
            }

            // Fallback if not JSON
            return NextResponse.json({
                success: true,
                response: rawText,
                ui_command: { target: "dynamic_island", message: "AI Doctor responding..." },
                avatar_update: { organ: null, change: null },
            });
        }

        // OpenAI fallback
        if (OPENAI_API_KEY) {
            const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        { role: "user", content: fullPrompt },
                    ],
                    max_tokens: 512,
                    temperature: 0.7,
                }),
            });

            const openaiData = await openaiRes.json();
            const rawText = openaiData?.choices?.[0]?.message?.content || "";

            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return NextResponse.json({ success: true, ...parsed });
            }

            return NextResponse.json({
                success: true,
                response: rawText,
                ui_command: { target: "dynamic_island", message: "AI Doctor responding..." },
                avatar_update: { organ: null, change: null },
            });
        }

        // No API key — demo mode
        return NextResponse.json({
            success: true,
            response:
                "I'm Dr. ARIA. To activate me fully, please add your GEMINI_API_KEY or OPENAI_API_KEY to the .env.local file. Your health data looks good so far!",
            ui_command: { target: "dynamic_island", message: "Demo Mode — Add API key" },
            avatar_update: { organ: null, change: null },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

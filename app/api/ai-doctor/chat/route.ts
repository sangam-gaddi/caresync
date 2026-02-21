import { NextRequest, NextResponse } from "next/server";

/**
 * OpenRouter Chat Completions with Waterfall Fallback.
 * Tries free models in order; returns streamed SSE response.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Models ordered by quality + availability (best first)
const OPENROUTER_MODELS = [
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "google/gemma-3-27b-it:free",
    "nvidia/nemotron-nano-9b-v2:free",
    "google/gemma-3-12b-it:free",
    "qwen/qwen3-4b:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "deepseek/deepseek-r1-0528:free",
    "openai/gpt-oss-120b:free",
];

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

async function callOpenRouterWithFallback(messages: ChatMessage[], preferredModel?: string): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not set");
    }

    const models = preferredModel
        ? [preferredModel, ...OPENROUTER_MODELS.filter(m => m !== preferredModel)]
        : OPENROUTER_MODELS;

    for (const model of models) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout per model

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                    "X-Title": "HealthOS AI Doctor",
                },
                body: JSON.stringify({
                    model,
                    messages,
                    max_tokens: 512,
                    temperature: 0.7,
                    // Auto-convert system messages for models that don't support them
                    route: "fallback",
                    transforms: ["middle-out"],
                }),
            });

            clearTimeout(timeout);

            if (!response.ok) {
                console.warn(`[OpenRouter] Model ${model} returned ${response.status}, trying next...`);
                continue;
            }

            const data = await response.json();
            const content = data?.choices?.[0]?.message?.content;

            if (content) {
                console.log(`[OpenRouter] ✅ Success with model: ${model}`);
                return content;
            }

            console.warn(`[OpenRouter] Model ${model} returned empty content, trying next...`);
        } catch (error) {
            console.warn(`[OpenRouter] Model ${model} failed:`, error);
            continue;
        }
    }

    throw new Error("All OpenRouter free models are currently exhausted. Please try again later.");
}

export async function POST(req: NextRequest) {
    try {
        const { messages, systemPrompt, specialistType, selectedModel } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Messages array required" }, { status: 400 });
        }

        // Build full messages array — inject system prompt into the first user message
        // for maximum model compatibility (Gemma, etc. don't support "system" role)
        const fullMessages: ChatMessage[] = [];

        // Add conversation history
        let systemInjected = false;
        for (const msg of messages) {
            const role = msg.role === "doctor" || msg.role === "assistant" ? "assistant" : "user";
            let content = msg.text || msg.content;
            
            // Prepend system prompt to the first user message
            if (role === "user" && !systemInjected && systemPrompt) {
                content = `[INSTRUCTIONS: ${systemPrompt}]\n\nPatient: ${content}`;
                systemInjected = true;
            }

            fullMessages.push({ role, content });
        }

        // If no user message existed yet, add system as a user message
        if (!systemInjected && systemPrompt) {
            fullMessages.unshift({ role: "user", content: `[INSTRUCTIONS: ${systemPrompt}]` });
        }

        const rawText = await callOpenRouterWithFallback(fullMessages, selectedModel);

        // Try to parse as JSON only if it looks like a structured response with a "response" field
        let responseText = rawText;
        let uiCommand = null;
        let avatarUpdate = null;
        
        const jsonMatch = rawText.match(/\{[\s\S]*"response"[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.response) {
                    responseText = parsed.response;
                    uiCommand = parsed.ui_command || null;
                    avatarUpdate = parsed.avatar_update || null;
                }
            } catch {
                // JSON parse failed, use raw text
            }
        }

        // Clean up thinking tags some models add (e.g. <think>...</think>)
        responseText = responseText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        return NextResponse.json({
            success: true,
            specialistType: specialistType || "AI Doctor",
            response: responseText,
            ui_command: uiCommand || { target: "dynamic_island", message: `${specialistType || "AI Doctor"} responding...` },
            avatar_update: avatarUpdate || { organ: null, change: null },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[OpenRouter Chat] Error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

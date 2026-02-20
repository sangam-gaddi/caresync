import { NextRequest, NextResponse } from "next/server";

// LiveKit credentials
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

export const revalidate = 0;

export async function POST(req: NextRequest) {
    try {
        if (!LIVEKIT_URL || !API_KEY || !API_SECRET) {
            return NextResponse.json(
                {
                    error: "Voice service not configured. Add LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET to .env.local",
                    configured: false,
                },
                { status: 503 }
            );
        }

        let patientName = "Patient";
        let patientId = "unknown";
        let specialistType = "AI General Practitioner";
        let systemPrompt = "";

        try {
            const body = await req.json();
            patientName = body?.patientName || "Patient";
            patientId = body?.patientId || "unknown";
            specialistType = body?.specialistType || "AI General Practitioner";
            systemPrompt = body?.systemPrompt || "";
        } catch {
            // Body parsing failed, use defaults
        }

        // Dynamic import for livekit-server-sdk (optional dep)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let AccessToken: any, RoomServiceClient: any;
        try {
            const sdk = await import("livekit-server-sdk");
            AccessToken = sdk.AccessToken;
            RoomServiceClient = sdk.RoomServiceClient;
        } catch {
            return NextResponse.json(
                {
                    error: "livekit-server-sdk not installed. Run: npm install livekit-server-sdk",
                    configured: false,
                },
                { status: 503 }
            );
        }

        const roomName = `healthos_doctor_${Date.now()}`;
        const participantIdentity = `patient_${patientId}_${Math.floor(Math.random() * 10000)}`;

        // Create room with agent dispatch
        const roomService = new RoomServiceClient(
            LIVEKIT_URL.replace("wss://", "https://"),
            API_KEY,
            API_SECRET
        );

        try {
            await roomService.createRoom({
                name: roomName,
                emptyTimeout: 60 * 5,
                maxParticipants: 2,
                metadata: JSON.stringify({
                    patientName,
                    patientId,
                    specialistType,
                    systemPrompt,
                }),
                agentConfig: {
                    agents: [{ agentName: "" }],
                },
            });
        } catch (e) {
            console.log("Room creation note:", e);
        }

        // Create participant token
        const at = new AccessToken(API_KEY, API_SECRET, {
            identity: participantIdentity,
            name: patientName,
            ttl: "15m",
        });

        at.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canPublishData: true,
            canSubscribe: true,
        });

        const participantToken = await at.toJwt();

        return NextResponse.json(
            {
                serverUrl: LIVEKIT_URL,
                roomName,
                participantToken,
                participantName: patientName,
                configured: true,
            },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Voice connection error:", error);
        const message = error instanceof Error ? error.message : "Failed to create connection";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

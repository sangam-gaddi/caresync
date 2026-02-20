import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import HealthProfile from "@/lib/models/health-profile";
import AvatarState from "@/lib/models/avatar-state";
import { assignSpecialist } from "@/lib/triage-engine";

export async function POST(req: NextRequest) {
    try {
        const { patientId } = await req.json();

        if (!patientId) {
            // Return general practitioner for unknown patients
            const result = assignSpecialist({});
            return NextResponse.json({ success: true, ...result });
        }

        await connectDB();

        // Fetch patient data
        const profile = await HealthProfile.findOne({ userId: patientId });
        const avatarState = await AvatarState.findOne({ userId: patientId });

        const organStatuses: Record<string, { status: string; color: string }> = {};
        if (avatarState?.organs) {
            const organs = avatarState.organs as Record<string, { status: string; color: string }>;
            for (const [name, data] of Object.entries(organs)) {
                if (data && typeof data === "object" && "status" in data) {
                    organStatuses[name] = { status: data.status, color: data.color };
                }
            }
        }

        const result = assignSpecialist({
            name: profile?.userId,
            age: profile?.age,
            gender: profile?.gender,
            vulnerabilities: profile?.vulnerabilities || [],
            currentIssues: profile?.currentIssues || [],
            lifestyle: profile?.lifestyle,
            organStatuses,
            healthScore: avatarState?.healthScore || 75,
        });

        return NextResponse.json({ success: true, ...result });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import HealthProfile from "@/lib/models/health-profile";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const profile = await HealthProfile.findOne({ userId: id }).lean();

        if (!profile) {
            return NextResponse.json({ data: null }, { status: 200 });
        }

        return NextResponse.json({ data: profile });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

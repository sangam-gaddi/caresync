import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AvatarState from "@/lib/models/avatar-state";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const state = await AvatarState.findOne({ userId: params.id });

        if (!state) {
            return NextResponse.json({ error: "Avatar state not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: state });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

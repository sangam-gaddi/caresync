import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Specialist from "@/lib/models/specialist";


export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");
        const specialty = searchParams.get("specialty");

        // Seed if empty
        // Seed if empty - ignoring default seed in favor of our global seed

        const query: Record<string, unknown> = { isActive: true };
        const hospitalId = searchParams.get("hospitalId");

        if (hospitalId) query.hospitalId = hospitalId;
        if (department) query.department = department;
        if (specialty) query.specialty = specialty;

        const specialists = await Specialist.find(query).populate('hospitalId', 'name cityId').sort({ rating: -1 });
        return NextResponse.json({ success: true, data: specialists });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

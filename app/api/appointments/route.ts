import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Appointment from "@/lib/models/appointment";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const patientId = searchParams.get("patientId");

        const query = patientId ? { patientId } : {};
        const appointments = await Appointment.find(query).sort({ dateTime: 1 }).limit(50);

        return NextResponse.json({ success: true, data: appointments });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const appointment = await Appointment.create(body);
        return NextResponse.json({ success: true, data: appointment }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

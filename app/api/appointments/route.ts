import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Appointment from "@/lib/models/appointment";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const patientId = searchParams.get("patientId");

        const query = patientId ? { patientId } : {};
        const appointments = await Appointment.find(query)
            .sort({ dateTime: -1 })
            .limit(50);

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

        // Parse dateTime from date + timeSlot if not provided directly
        if (!body.dateTime && body.date && body.timeSlot) {
            const match = body.timeSlot.match(/^(\d+):(\d+)\s(AM|PM)$/);
            if (match) {
                let hours = parseInt(match[1]);
                const mins = parseInt(match[2]);
                const period = match[3];
                if (period === "PM" && hours !== 12) hours += 12;
                if (period === "AM" && hours === 12) hours = 0;
                body.dateTime = new Date(`${body.date}T${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:00`);
            }
        }

        const appointment = await Appointment.create(body);
        return NextResponse.json(
            { success: true, data: appointment },
            { status: 201 }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

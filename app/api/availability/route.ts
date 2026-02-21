import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Specialist from "@/lib/models/specialist";
import Slot from "@/lib/models/slot";
import Appointment from "@/lib/models/appointment";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date"); // YYYY-MM-DD
        const specialistId = searchParams.get("specialistId");

        if (!date) {
            return NextResponse.json(
                { error: "date query parameter is required" },
                { status: 400 }
            );
        }

        const dayOfWeek = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "long",
        });

        if (specialistId) {
            const specialist = await Specialist.findById(specialistId);
            if (!specialist) {
                return NextResponse.json(
                    { error: "Specialist not found" },
                    { status: 404 }
                );
            }

            if (!specialist.availableDays.includes(dayOfWeek)) {
                return NextResponse.json({
                    success: true,
                    data: {
                        specialistId,
                        date,
                        dayOfWeek,
                        available: false,
                        slots: [],
                        message: `Dr. ${specialist.name} is not available on ${dayOfWeek}s`,
                    },
                });
            }

            const dbSlots = await Slot.find({ specialistId, date });

            const booked = await Appointment.find({
                specialistId,
                date,
                status: { $ne: "cancelled" },
            }).select("timeSlot");

            const bookedSlots = new Set(booked.map((a) => a.timeSlot));

            const now = new Date();
            const today = now.toISOString().split("T")[0];

            const slotsWithStatus = dbSlots.map((slotDoc) => {
                const slot = slotDoc.time;
                let status: "available" | "booked" | "past" = slotDoc.status as "available" | "booked";

                if (bookedSlots.has(slot)) {
                    status = "booked";
                } else if (date === today) {
                    const match = slot.match(/^(\d+):(\d+)\s(AM|PM)$/);
                    if (match) {
                        let hours = parseInt(match[1]);
                        const mins = parseInt(match[2]);
                        const period = match[3];
                        if (period === "PM" && hours !== 12) hours += 12;
                        if (period === "AM" && hours === 12) hours = 0;
                        const slotTime = new Date(date);
                        slotTime.setHours(hours, mins, 0, 0);
                        if (slotTime <= now) status = "past";
                    }
                } else if (date < today) {
                    status = "past";
                }

                return { time: slot, status, id: slotDoc._id };
            });

            // Sort slots chronologically
            slotsWithStatus.sort((a, b) => {
                const getMinutes = (t: string) => {
                    const match = t.match(/^(\d+):(\d+)\s(AM|PM)$/);
                    if (!match) return 0;
                    let h = parseInt(match[1]);
                    const m = parseInt(match[2]);
                    if (match[3] === 'PM' && h !== 12) h += 12;
                    if (match[3] === 'AM' && h === 12) h = 0;
                    return h * 60 + m;
                };
                return getMinutes(a.time) - getMinutes(b.time);
            });

            return NextResponse.json({
                success: true,
                data: {
                    specialistId,
                    date,
                    dayOfWeek,
                    available: true,
                    slotDuration: specialist.slotDuration,
                    slots: slotsWithStatus,
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: { date, dayOfWeek },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

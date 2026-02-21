import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
    patientId: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    specialistId: string;
    doctorName: string;
    specialty: string;
    department: string;
    date: string; // YYYY-MM-DD
    timeSlot: string; // "10:30 AM"
    slotId?: mongoose.Types.ObjectId | string;
    dateTime: Date;
    status: "scheduled" | "completed" | "cancelled" | "pending";
    type: "in-person" | "virtual";
    reason: string;
    notes?: string;
    consultationFee: number;
}

const AppointmentSchema = new Schema<IAppointment>(
    {
        patientId: { type: String, required: true, index: true },
        patientName: { type: String, required: true },
        patientEmail: { type: String, default: "" },
        patientPhone: { type: String, default: "" },
        specialistId: { type: String, default: "" },
        doctorName: { type: String, required: true },
        specialty: { type: String, required: true },
        department: { type: String, default: "" },
        date: { type: String, default: "" },
        timeSlot: { type: String, default: "" },
        slotId: { type: Schema.Types.ObjectId, ref: "Slot" },
        dateTime: { type: Date, required: true },
        status: {
            type: String,
            enum: ["scheduled", "completed", "cancelled", "pending"],
            default: "scheduled",
        },
        type: {
            type: String,
            enum: ["in-person", "virtual"],
            default: "in-person",
        },
        reason: { type: String, default: "" },
        notes: { type: String },
        consultationFee: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.models.Appointment ||
    mongoose.model<IAppointment>("Appointment", AppointmentSchema);

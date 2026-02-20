import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
    patientId: string;
    patientName: string;
    doctorName: string;
    specialty: string;
    dateTime: Date;
    status: "scheduled" | "completed" | "cancelled" | "pending";
    notes?: string;
    type: "in-person" | "virtual";
}

const AppointmentSchema = new Schema<IAppointment>(
    {
        patientId: { type: String, required: true, index: true },
        patientName: { type: String, required: true },
        doctorName: { type: String, required: true },
        specialty: { type: String, required: true },
        dateTime: { type: Date, required: true },
        status: {
            type: String,
            enum: ["scheduled", "completed", "cancelled", "pending"],
            default: "scheduled",
        },
        notes: { type: String },
        type: { type: String, enum: ["in-person", "virtual"], default: "in-person" },
    },
    { timestamps: true }
);

export default mongoose.models.Appointment ||
    mongoose.model<IAppointment>("Appointment", AppointmentSchema);

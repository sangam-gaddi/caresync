import mongoose, { Schema, Document } from "mongoose";

export interface ISlot extends Document {
    specialistId: mongoose.Types.ObjectId | string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    status: "available" | "booked";
}

const SlotSchema = new Schema<ISlot>(
    {
        specialistId: { type: Schema.Types.ObjectId, ref: "Specialist", required: true },
        date: { type: String, required: true },
        time: { type: String, required: true },
        status: { type: String, enum: ["available", "booked"], default: "available" },
    },
    { timestamps: true }
);

SlotSchema.index({ specialistId: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.models.Slot || mongoose.model<ISlot>("Slot", SlotSchema);

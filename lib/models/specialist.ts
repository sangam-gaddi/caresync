import mongoose, { Schema, Document } from "mongoose";

export interface ISpecialist extends Document {
    name: string;
    specialty: string;
    department: string;
    hospitalId: mongoose.Types.ObjectId | string;
    avatar: string;
    bio: string;
    experience: number; // years
    rating: number; // 1-5
    reviewCount: number;
    consultationFee: number;
    availableDays: string[]; // ["Monday", "Tuesday", ...]
    workingHours: { start: string; end: string };
    slotDuration: number; // minutes
    type: "in-person" | "virtual" | "both";
    isActive: boolean;
}

const SpecialistSchema = new Schema<ISpecialist>(
    {
        name: { type: String, required: true },
        specialty: { type: String, required: true },
        department: { type: String, required: true },
        hospitalId: { type: Schema.Types.ObjectId, ref: "Hospital" },
        avatar: { type: String, default: "" },
        bio: { type: String, default: "" },
        experience: { type: Number, default: 5 },
        rating: { type: Number, default: 4.5, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0 },
        consultationFee: { type: Number, default: 150 },
        availableDays: {
            type: [String],
            default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        },
        workingHours: {
            start: { type: String, default: "09:00" },
            end: { type: String, default: "17:00" },
        },
        slotDuration: { type: Number, default: 30 },
        type: {
            type: String,
            enum: ["in-person", "virtual", "both"],
            default: "both",
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.models.Specialist ||
    mongoose.model<ISpecialist>("Specialist", SpecialistSchema);

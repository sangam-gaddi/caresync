import mongoose, { Schema, Document } from "mongoose";

export interface IHealthProfile extends Document {
    userId: string;
    age: number;
    weight: number; // kg
    height: number; // cm
    bloodType: string;
    gender: string;
    vulnerabilities: string[];
    currentIssues: { name: string; severity: "mild" | "moderate" | "severe" }[];
    medications: string[];
    lifestyle: {
        smoker: boolean;
        alcoholConsumption: "none" | "low" | "moderate" | "high";
        exerciseFrequency: "none" | "low" | "moderate" | "high";
        dietQuality: "poor" | "fair" | "good" | "excellent";
        stressLevel: number; // 1-10
        sleepHours: number;
        fatIntake: "low" | "moderate" | "high";
    };
    createdAt: Date;
    updatedAt: Date;
}

const HealthProfileSchema = new Schema<IHealthProfile>(
    {
        userId: { type: String, required: true, index: true },
        age: { type: Number, required: true },
        weight: { type: Number, required: true },
        height: { type: Number, required: true },
        bloodType: { type: String, default: "Unknown" },
        gender: { type: String, required: true },
        vulnerabilities: [{ type: String }],
        currentIssues: [
            {
                name: String,
                severity: { type: String, enum: ["mild", "moderate", "severe"] },
            },
        ],
        medications: [{ type: String }],
        lifestyle: {
            smoker: { type: Boolean, default: false },
            alcoholConsumption: {
                type: String,
                enum: ["none", "low", "moderate", "high"],
                default: "none",
            },
            exerciseFrequency: {
                type: String,
                enum: ["none", "low", "moderate", "high"],
                default: "low",
            },
            dietQuality: {
                type: String,
                enum: ["poor", "fair", "good", "excellent"],
                default: "fair",
            },
            stressLevel: { type: Number, default: 5 },
            sleepHours: { type: Number, default: 7 },
            fatIntake: {
                type: String,
                enum: ["low", "moderate", "high"],
                default: "moderate",
            },
        },
    },
    { timestamps: true }
);

export default mongoose.models.HealthProfile ||
    mongoose.model<IHealthProfile>("HealthProfile", HealthProfileSchema);

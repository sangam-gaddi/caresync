import mongoose, { Schema, Document } from "mongoose";

export interface OrganState {
    status: "healthy" | "warning" | "critical";
    color: string;
    glowIntensity: number;
    emissiveColor: string;
    animationParam?: number; // e.g., bpm for heart, fat for liver
}

export interface IAvatarState extends Document {
    userId: string;
    healthScore: number; // 0-100
    organs: {
        heart: OrganState & { bpm: number; pulseScale: number };
        liver: OrganState & { fatLevel: string };
        lungs: OrganState & { capacityPercent: number };
        kidneys: OrganState;
        brain: OrganState & { stressLevel: number };
        stomach: OrganState;
    };
    transformationDelta?: {
        previous: number;
        change: number;
        direction: "improving" | "declining" | "stable";
    };
    lastUpdated: Date;
}

const OrganStateSchema = new Schema({
    status: { type: String, enum: ["healthy", "warning", "critical"], default: "healthy" },
    color: { type: String, default: "#00ff88" },
    glowIntensity: { type: Number, default: 0.3 },
    emissiveColor: { type: String, default: "#00ff88" },
    animationParam: { type: Number },
});

const AvatarStateSchema = new Schema<IAvatarState>(
    {
        userId: { type: String, required: true, index: true, unique: true },
        healthScore: { type: Number, default: 75 },
        organs: {
            heart: {
                ...OrganStateSchema.obj,
                bpm: { type: Number, default: 72 },
                pulseScale: { type: Number, default: 1.05 },
            },
            liver: {
                ...OrganStateSchema.obj,
                fatLevel: { type: String, default: "low" },
            },
            lungs: {
                ...OrganStateSchema.obj,
                capacityPercent: { type: Number, default: 90 },
            },
            kidneys: OrganStateSchema.obj,
            brain: {
                ...OrganStateSchema.obj,
                stressLevel: { type: Number, default: 3 },
            },
            stomach: OrganStateSchema.obj,
        },
        transformationDelta: {
            previous: Number,
            change: Number,
            direction: {
                type: String,
                enum: ["improving", "declining", "stable"],
                default: "stable",
            },
        },
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.models.AvatarState ||
    mongoose.model<IAvatarState>("AvatarState", AvatarStateSchema);

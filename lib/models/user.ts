import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    salt: string;
    avatar?: string;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        salt: { type: String, required: true },
        avatar: { type: String, default: "" },
    },
    { timestamps: true }
);

// Hash password helper
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const s = salt || crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, s, 1000, 64, "sha512").toString("hex");
    return { hash, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
    const computed = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return computed === hash;
}

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

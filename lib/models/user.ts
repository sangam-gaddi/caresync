import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    avatar?: string;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        avatar: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

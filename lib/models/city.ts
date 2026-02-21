import mongoose, { Schema, Document } from "mongoose";

export interface ICity extends Document {
    name: string;
    active: boolean;
}

const CitySchema = new Schema<ICity>(
    {
        name: { type: String, required: true, unique: true },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.models.City || mongoose.model<ICity>("City", CitySchema);

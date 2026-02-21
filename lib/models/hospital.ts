import mongoose, { Schema, Document } from "mongoose";

export interface IHospital extends Document {
    name: string;
    rating: number;
    address: string;
    lat: number;
    lng: number;
    cityId: mongoose.Types.ObjectId | string;
    specialties: string[];
    active: boolean;
}

const HospitalSchema = new Schema<IHospital>(
    {
        name: { type: String, required: true },
        rating: { type: Number, default: 0 },
        address: { type: String, required: true },
        lat: { type: Number },
        lng: { type: Number },
        cityId: { type: Schema.Types.ObjectId, ref: "City", required: true },
        specialties: { type: [String], default: [] },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.models.Hospital || mongoose.model<IHospital>("Hospital", HospitalSchema);

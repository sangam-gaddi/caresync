import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminUser extends Document {
    email: string;
    passwordHash: string;
    name: string;
    role: 'Super Admin' | 'Hospital Admin' | 'Reception Staff';
    hospitalId?: mongoose.Types.ObjectId; // Only applicable for 'Hospital Admin' and 'Reception Staff'
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AdminUserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: {
        type: String,
        required: true,
        enum: ['Super Admin', 'Hospital Admin', 'Reception Staff']
    },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.AdminUser || mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);

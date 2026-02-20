import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User, { hashPassword } from "@/lib/models/user";
import HealthProfile from "@/lib/models/health-profile";
import AvatarState from "@/lib/models/avatar-state";
import { computeAvatarState } from "@/lib/health-engine";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        const {
            name,
            email,
            password,
            age,
            weight,
            height,
            bloodType,
            gender,
            vulnerabilities,
            currentIssues,
            medications,
            lifestyle,
        } = body;

        if (!password || password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return NextResponse.json(
                { error: "An account with this email already exists. Please login instead." },
                { status: 409 }
            );
        }

        // Hash password and create user
        const { hash, salt } = hashPassword(password);
        user = await User.create({ name, email, password: hash, salt });

        const userId = user._id.toString();

        // Create or update health profile
        const profileData = {
            userId,
            age,
            weight,
            height,
            bloodType: bloodType || "Unknown",
            gender,
            vulnerabilities: vulnerabilities || [],
            currentIssues: currentIssues || [],
            medications: medications || [],
            lifestyle: lifestyle || {},
        };

        const profile = await HealthProfile.findOneAndUpdate(
            { userId },
            profileData,
            { upsert: true, new: true }
        );

        // Compute initial avatar state
        const computed = computeAvatarState(profile);

        await AvatarState.findOneAndUpdate(
            { userId },
            { ...computed, lastUpdated: new Date() },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            userId,
            name,
            healthScore: computed.healthScore,
            redirect: `/os?patientId=${userId}&name=${encodeURIComponent(name)}`,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

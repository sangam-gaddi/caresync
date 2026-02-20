import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User, { verifyPassword } from "@/lib/models/user";
import HealthProfile from "@/lib/models/health-profile";
import AvatarState from "@/lib/models/avatar-state";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { error: "No account found with this email. Please sign up first." },
                { status: 404 }
            );
        }

        // Verify password
        const isValid = verifyPassword(password, user.password, user.salt);
        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid password. Please try again." },
                { status: 401 }
            );
        }

        const userId = user._id.toString();

        // Check if patient has avatar state (completed onboarding)
        const avatarState = await AvatarState.findOne({ userId });
        const healthProfile = await HealthProfile.findOne({ userId });

        return NextResponse.json({
            success: true,
            userId,
            name: user.name,
            email: user.email,
            hasProfile: !!healthProfile,
            healthScore: avatarState?.healthScore || 75,
            redirect: `/os?patientId=${userId}&name=${encodeURIComponent(user.name)}`,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Activity, User, ChevronRight, Lock } from "lucide-react";
import dynamic from "next/dynamic";

// Show the 3D scene behind the login screen too
const DesktopWallpaper = dynamic(() => import("@/components/os/HealthWallpaper"), { ssr: false });

const PROFILES = [
    {
        id: "guest",
        name: "Guest",
        avatar: "👤",
        subtitle: "No account required",
        gradient: "from-slate-500 to-gray-600",
    },
    {
        id: "patient",
        name: "Patient Login",
        avatar: "🏥",
        subtitle: "Use your health profile",
        gradient: "from-cyan-500 to-blue-600",
    },
];

export default function LoginScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (profileId: string) => {
        setSelected(profileId);
        setLoading(true);
        await new Promise((r) => setTimeout(r, 800));
        if (profileId === "guest") {
            router.push("/os");
        } else {
            router.push("/onboarding");
        }
    };

    const time = new Date();
    const formattedTime = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    const formattedDate = time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    return (
        <div className="w-screen h-screen overflow-hidden relative">
            {/* Wallpaper behind login */}
            <DesktopWallpaper />

            {/* Frosted overlay */}
            <div className="absolute inset-0 z-10" style={{ background: "rgba(4,8,16,0.45)", backdropFilter: "blur(2px)" }} />

            {/* Clock */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
                <div className="text-7xl font-thin text-white tracking-tight" style={{ textShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
                    {formattedTime}
                </div>
                <div className="text-white/50 text-lg mt-1 font-light">{formattedDate}</div>
            </div>

            {/* Profile cards */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-8">
                <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Select Account</p>

                <div className="flex items-center gap-6">
                    {PROFILES.map((profile) => (
                        <motion.button
                            key={profile.id}
                            whileHover={{ scale: 1.08, y: -4 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleLogin(profile.id)}
                            disabled={loading}
                            className="flex flex-col items-center gap-3 cursor-pointer group"
                        >
                            {/* Avatar circle */}
                            <div
                                className={`w-24 h-24 rounded-full bg-gradient-to-br ${profile.gradient} flex items-center justify-center shadow-2xl relative border-2 ${selected === profile.id ? "border-white" : "border-transparent"} transition-all duration-300`}
                                style={{ boxShadow: selected === profile.id ? "0 0 30px rgba(0,229,255,0.5)" : "0 8px 40px rgba(0,0,0,0.5)" }}
                            >
                                <span className="text-4xl">{profile.avatar}</span>

                                {/* Spinning border when selected */}
                                {selected === profile.id && loading && (
                                    <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-transparent animate-spin" />
                                )}
                            </div>

                            {/* Name */}
                            <div className="text-center">
                                <p className="text-white font-medium text-sm">{profile.name}</p>
                                <p className="text-white/40 text-xs">{profile.subtitle}</p>
                            </div>

                            {/* Continue arrow */}
                            <AnimatePresence>
                                {selected === profile.id && !loading && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                                    >
                                        <ChevronRight className="w-4 h-4 text-white" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    ))}
                </div>

                {/* Guest quick-login button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLogin("guest")}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/15 text-white/60 text-sm hover:text-white hover:border-white/30 transition-all"
                    style={{ backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.05)" }}
                >
                    <User className="w-4 h-4" />
                    Continue as Guest
                </motion.button>
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-8">
                <button className="text-white/30 text-xs hover:text-white/60 transition-colors flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Privacy Policy
                </button>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <div className="flex items-center gap-1.5 text-white/30 text-xs">
                    <Activity className="w-3 h-3 text-cyan-500" />
                    <span>HealthOS v1.0</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <button className="text-white/30 text-xs hover:text-white/60 transition-colors">Support</button>
            </div>
        </div>
    );
}

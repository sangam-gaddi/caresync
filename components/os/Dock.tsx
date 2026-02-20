"use client";

import { motion } from "framer-motion";
import { useOSStore } from "@/lib/store";
import {
    Activity, Calendar, Stethoscope, Mic, LayoutDashboard, User
} from "lucide-react";

interface DockApp {
    id: string;
    label: string;
    icon: React.ReactNode;
    gradient: string;
}

const DOCK_APPS: DockApp[] = [
    {
        id: "body",
        label: "3D Body",
        icon: <Activity className="w-6 h-6 text-white" />,
        gradient: "from-green-500 to-cyan-500",
    },
    {
        id: "appointments",
        label: "Appointments",
        icon: <Calendar className="w-6 h-6 text-white" />,
        gradient: "from-blue-500 to-indigo-600",
    },
    {
        id: "ai-doctor",
        label: "AI Doctor",
        icon: <Stethoscope className="w-6 h-6 text-white" />,
        gradient: "from-purple-500 to-pink-500",
    },
    {
        id: "voice",
        label: "Voice Session",
        icon: <Mic className="w-6 h-6 text-white" />,
        gradient: "from-rose-500 to-orange-500",
    },
    {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="w-6 h-6 text-white" />,
        gradient: "from-amber-500 to-yellow-500",
    },
    {
        id: "profile",
        label: "Profile",
        icon: <User className="w-6 h-6 text-white" />,
        gradient: "from-slate-500 to-slate-700",
    },
];

export default function Dock() {
    const { openWindow, openWindows } = useOSStore();

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998]">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.5 }}
                className="flex items-end gap-2 px-4 py-3 rounded-3xl os-glass-heavy shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
            >
                {DOCK_APPS.map((app, index) => (
                    <DockIcon
                        key={app.id}
                        app={app}
                        index={index}
                        isOpen={openWindows.includes(app.id)}
                        onClick={() => openWindow(app.id)}
                    />
                ))}
            </motion.div>
        </div>
    );
}

function DockIcon({
    app,
    index,
    isOpen,
    onClick,
}: {
    app: DockApp;
    index: number;
    isOpen: boolean;
    onClick: () => void;
}) {
    return (
        <motion.div
            className="dock-item"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.07, type: "spring", stiffness: 400, damping: 20 }}
            whileHover={{ scale: 1.25, y: -8 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
        >
            {/* Tooltip */}
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-[#0d1421]/95 border border-[#1e2a3a] text-[11px] font-medium whitespace-nowrap text-white/80 pointer-events-none"
            >
                {app.label}
            </motion.div>

            {/* Icon */}
            <div
                className={`dock-icon bg-gradient-to-br ${app.gradient}`}
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
            >
                {app.icon}
            </div>

            {/* Active dot */}
            {isOpen && (
                <motion.div
                    layoutId={`dot-${app.id}`}
                    className="w-1 h-1 rounded-full bg-white/60"
                />
            )}
        </motion.div>
    );
}

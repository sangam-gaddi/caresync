"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useOSStore } from "@/lib/store";
import {
    Brain, Heart, Activity, Calendar, Stethoscope,
    Mic, AlertCircle, CheckCircle, Info
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
    ai: <Brain className="w-4 h-4 text-purple-400" />,
    heart: <Heart className="w-4 h-4 text-red-400" />,
    activity: <Activity className="w-4 h-4 text-green-400" />,
    calendar: <Calendar className="w-4 h-4 text-blue-400" />,
    doctor: <Stethoscope className="w-4 h-4 text-cyan-400" />,
    mic: <Mic className="w-4 h-4 text-purple-400" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400" />,
    success: <CheckCircle className="w-4 h-4 text-green-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
};

export default function DynamicIsland() {
    const { islandExpanded, islandNotification, aiThinking } = useOSStore();

    const typeColors: Record<string, string> = {
        info: "border-blue-500/30 bg-blue-500/10",
        warning: "border-amber-500/30 bg-amber-500/10",
        success: "border-green-500/30 bg-green-500/10",
        ai: "border-purple-500/30 bg-purple-500/10",
    };

    const borderColor = islandNotification
        ? typeColors[islandNotification.type] || typeColors.info
        : "border-[#1e2a3a]";

    return (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999]">
            <AnimatePresence mode="wait">
                {(islandExpanded && islandNotification) || aiThinking ? (
                    <motion.div
                        key="expanded"
                        initial={{ width: 120, height: 36, borderRadius: 999 }}
                        animate={{ width: 340, height: 52, borderRadius: 24 }}
                        exit={{ width: 120, height: 36, borderRadius: 999, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className={`
              flex items-center gap-3 px-4 overflow-hidden
              bg-[#0d1421]/95 backdrop-blur-2xl border ${borderColor}
              shadow-[0_8px_32px_rgba(0,0,0,0.6)]
            `}
                    >
                        {/* Icon */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.15 }}
                        >
                            {aiThinking ? (
                                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                iconMap[islandNotification?.icon || "info"]
                            )}
                        </motion.div>

                        {/* Message */}
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xs font-medium text-white/90 truncate flex-1"
                        >
                            {aiThinking ? "Dr. ARIA is analyzing..." : islandNotification?.message}
                        </motion.p>

                        {/* Live indicator */}
                        {aiThinking && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-[3px] items-center"
                            >
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="w-[3px] bg-purple-400 rounded-full waveform-bar"
                                        style={{ animationDelay: `${i * 0.15}s`, height: "4px" }}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="collapsed"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="flex items-center justify-center w-[120px] h-9 rounded-full bg-[#0d1421]/95 backdrop-blur-2xl border border-[#1e2a3a] shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[10px] font-medium text-white/60">HealthOS</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

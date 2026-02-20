"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
    Activity, Heart, Brain, Wind, Search, Wifi, WifiOff,
    Stethoscope, Settings, ChevronRight,
    Power, Moon, RotateCcw, LogOut, X
} from "lucide-react";
import { useOSStore } from "@/lib/store";
import DynamicIsland from "@/components/os/DynamicIsland";
import AppointmentsWindow from "@/components/appointments/AppointmentsWindow";
import AIDoctorWindow from "@/components/ai-doctor/AIDoctorWindow";
import { OSWindow } from "@/components/os/WindowManager";

// SSR-safe dynamic imports
const DesktopWallpaper = dynamic(() => import("@/components/os/HealthWallpaper"), { ssr: false });

// ─────────────────────────────────────────────────────────────────────────────
// POWER MODAL — Shutdown / Sleep / Restart / Logout
// ─────────────────────────────────────────────────────────────────────────────
function PowerModal({ onClose, onAction }: {
    onClose: () => void;
    onAction: (action: "logout" | "sleep" | "restart" | "shutdown") => void;
}) {
    return (
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl p-6 w-72 shadow-2xl"
                style={{ background: "rgba(10,16,28,0.95)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.12)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-sm font-bold text-white text-center mb-4">HealthOS</h2>
                <p className="text-xs text-white/50 text-center mb-5">Are you sure you want to shut down?</p>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onAction("sleep")}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/8"
                    >
                        <Moon className="w-5 h-5 text-blue-300" />
                        <span className="text-[11px] text-white/70">Sleep</span>
                    </button>
                    <button
                        onClick={() => onAction("restart")}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/8"
                    >
                        <RotateCcw className="w-5 h-5 text-amber-300" />
                        <span className="text-[11px] text-white/70">Restart</span>
                    </button>
                    <button
                        onClick={() => onAction("logout")}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/8"
                    >
                        <LogOut className="w-5 h-5 text-green-300" />
                        <span className="text-[11px] text-white/70">Log Out</span>
                    </button>
                    <button
                        onClick={() => onAction("shutdown")}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20"
                    >
                        <Power className="w-5 h-5 text-red-400" />
                        <span className="text-[11px] text-red-300">Shut Down</span>
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="w-full mt-3 py-2 rounded-xl text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                >
                    Cancel
                </button>
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLEEP SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function SleepScreen({ onWake }: { onWake: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] bg-black flex items-center justify-center cursor-pointer"
            onClick={onWake}
        >
            <div className="text-center">
                <div className="text-white/10 text-6xl font-black mb-2">HealthOS</div>
                <div className="text-white/20 text-sm">Click anywhere to wake</div>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MENUBAR
// ─────────────────────────────────────────────────────────────────────────────
function Menubar({
    time,
    activeWindowTitle,
    onPower,
    onSpotlight,
}: {
    time: Date;
    activeWindowTitle: string | null;
    onPower: () => void;
    onSpotlight: () => void;
}) {
    const [showAppleMenu, setShowAppleMenu] = useState(false);
    const [batteryLevel, setBatteryLevel] = useState(87);
    const [isCharging, setIsCharging] = useState(false);
    const [wifiOn, setWifiOn] = useState(true);
    const { healthScore } = useOSStore();

    useEffect(() => {
        if ("getBattery" in navigator) {
            (navigator as unknown as { getBattery: () => Promise<{ level: number; charging: boolean }> })
                .getBattery().then((b) => { setBatteryLevel(Math.round(b.level * 100)); setIsCharging(b.charging); })
                .catch(() => { });
        }
    }, []);

    const formattedTime = time.toLocaleString("en-US", {
        weekday: "short", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
    });

    const hc = healthScore >= 80 ? "#00e676" : healthScore >= 60 ? "#ffab40" : "#ff1744";

    return (
        <div
            className="fixed top-0 left-0 right-0 h-7 flex items-center px-3 select-none"
            style={{ background: "rgba(4,8,16,0.72)", backdropFilter: "blur(24px) saturate(180%)", borderBottom: "1px solid rgba(255,255,255,0.07)", zIndex: 9990 }}
        >
            {/* LEFT: Logo + app menus */}
            <div className="flex items-center gap-0.5 flex-1">
                <div className="relative">
                    <button
                        onClick={() => setShowAppleMenu(!showAppleMenu)}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
                    >
                        <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                            <Activity className="w-2 h-2 text-white" />
                        </div>
                        <span className="text-[11px] font-bold text-white">HealthOS</span>
                    </button>

                    <AnimatePresence>
                        {showAppleMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.12 }}
                                className="absolute top-7 left-0 w-54 rounded-xl py-1 shadow-2xl"
                                style={{ background: "rgba(12,18,32,0.96)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.1)", minWidth: "220px" }}
                            >
                                <div className="px-4 py-2 border-b border-white/8 mb-1">
                                    <p className="text-[11px] font-semibold text-white">HealthOS</p>
                                    <p className="text-[10px] text-white/40">Version 1.0.0 · MongoDB Connected</p>
                                </div>
                                {[
                                    { label: "About HealthOS", action: null },
                                    null,
                                    { label: "System Settings...", action: null },
                                    null,
                                    { label: "Sleep", action: "sleep" },
                                    { label: "Restart...", action: "restart" },
                                    { label: "Shut Down...", action: "shutdown" },
                                    null,
                                    { label: "Log Out", action: "logout" },
                                ].map((item, i) =>
                                    item === null ? (
                                        <div key={i} className="my-1 mx-2 border-t border-white/8" />
                                    ) : (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setShowAppleMenu(false);
                                                if (item.action) onPower();
                                            }}
                                            className="w-full text-left px-4 py-1.5 text-[12px] text-white/80 hover:bg-blue-500 hover:text-white transition-colors rounded-lg mx-0"
                                        >
                                            {item.label}
                                        </button>
                                    )
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {activeWindowTitle && (
                    <span className="text-[11px] font-semibold text-white px-2 ml-2">{activeWindowTitle}</span>
                )}

                {["File", "View", "Health", "Window", "Help"].map((m) => (
                    <button key={m} className="text-[11px] text-white/55 hover:text-white px-2 py-0.5 rounded hover:bg-white/10 transition-colors">
                        {m}
                    </button>
                ))}
            </div>

            {/* RIGHT: Status icons */}
            <div className="flex items-center gap-2.5">
                {/* Health score */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: `${hc}18`, border: `1px solid ${hc}35` }}>
                    <Heart className="w-2.5 h-2.5" style={{ color: hc }} />
                    <span className="text-[10px] font-bold tabular-nums" style={{ color: hc }}>{healthScore}</span>
                </div>

                {/* Battery */}
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-white/45 tabular-nums">{batteryLevel}%</span>
                    <div className="w-5 h-2.5 border border-white/25 rounded-[3px] relative">
                        <div className="absolute inset-[1.5px] rounded-[2px] transition-all" style={{ width: `${batteryLevel}%`, background: batteryLevel > 20 ? "#00e676" : "#ff1744" }} />
                        <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[3px] h-[7px] bg-white/25 rounded-r" />
                        {isCharging && <span className="absolute inset-0 flex items-center justify-center text-[6px] text-white">⚡</span>}
                    </div>
                </div>

                {/* WiFi toggle */}
                <button onClick={() => setWifiOn(!wifiOn)} className="text-white/50 hover:text-white transition-colors">
                    {wifiOn ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
                </button>

                {/* Spotlight */}
                <button onClick={onSpotlight} className="text-white/50 hover:text-white transition-colors">
                    <Search className="w-3.5 h-3.5" />
                </button>

                {/* Power button */}
                <button onClick={onPower} className="text-white/40 hover:text-red-400 transition-colors">
                    <Power className="w-3 h-3" />
                </button>

                {/* Clock */}
                <span className="text-[11px] text-white/80 tabular-nums">{formattedTime}</span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPOTLIGHT
// ─────────────────────────────────────────────────────────────────────────────
const SPOTLIGHT_APPS = [
    { id: "ai-doctor", label: "Dr. ARIA – AI Doctor", icon: "🩺", desc: "Chat or talk to your AI doctor" },
    { id: "appointments", label: "Appointments", icon: "📅", desc: "Book and manage appointments" },
    { id: "dashboard", label: "Health Dashboard", icon: "📊", desc: "View health score and organ status" },
    { id: "settings", label: "System Settings", icon: "⚙️", desc: "Configure HealthOS" },
];

function Spotlight({ onClose, onOpenApp }: { onClose: () => void; onOpenApp: (id: string) => void }) {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const filtered = SPOTLIGHT_APPS.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()) || a.desc.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => { inputRef.current?.focus(); }, []);

    return (
        <div
            className="fixed inset-0 z-[9980] flex items-start justify-center pt-28"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: -16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="w-[580px] rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: "rgba(8,12,24,0.94)", backdropFilter: "blur(48px)", border: "1px solid rgba(255,255,255,0.1)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 px-5 py-4">
                    <Search className="w-5 h-5 text-white/35 shrink-0" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Escape") onClose(); if (e.key === "Enter" && filtered[0]) { onOpenApp(filtered[0].id); onClose(); } }}
                        placeholder="Spotlight Search"
                        className="flex-1 bg-transparent text-white text-lg outline-none placeholder-white/25"
                    />
                    {query && (
                        <button onClick={() => setQuery("")} className="text-white/30 hover:text-white/60">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {filtered.length > 0 && (
                    <div className="border-t border-white/8 py-2">
                        <p className="text-[9px] text-white/25 px-5 py-1 uppercase tracking-widest">Applications</p>
                        {filtered.map((app) => (
                            <button
                                key={app.id}
                                onClick={() => { onOpenApp(app.id); onClose(); }}
                                className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-white/6 transition-colors text-left group"
                            >
                                <span className="text-xl w-8 text-center">{app.icon}</span>
                                <div className="flex-1">
                                    <p className="text-sm text-white/85 font-medium">{app.label}</p>
                                    <p className="text-[10px] text-white/35">{app.desc}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-white/40 transition-colors" />
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP HEALTH WIDGETS — full-width horizontal stats bar
// ─────────────────────────────────────────────────────────────────────────────
function DesktopWidgets() {
    const { healthScore, avatarState } = useOSStore();
    const organs = (avatarState?.organs || {}) as Record<string, { status: string; color: string }>;
    const hc = healthScore >= 80 ? "#00e676" : healthScore >= 60 ? "#ffab40" : "#ff1744";
    const label = healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : healthScore >= 40 ? "Fair" : "Critical";

    const vitals = [
        { label: "Heart Rate", value: "72 BPM", icon: <Heart className="w-3.5 h-3.5" />, color: organs.heart?.color || "#ff4d6d" },
        { label: "Brain Stress", value: "Low", icon: <Brain className="w-3.5 h-3.5" />, color: organs.brain?.color || "#a855f7" },
        { label: "Lung O₂", value: "98%", icon: <Wind className="w-3.5 h-3.5" />, color: organs.lungs?.color || "#00e5ff" },
    ];

    return (
        // Full-width bar just below the 28px menubar, z-index 50
        <div
            className="absolute left-4 right-4 flex items-center gap-3"
            style={{ top: "36px", zIndex: 50, pointerEvents: "none" }}
        >
            {/* ── Health Score ── */}
            <div
                className="flex items-center gap-3 px-4 py-2 rounded-2xl shrink-0"
                style={{ background: "rgba(4,8,16,0.65)", backdropFilter: "blur(20px)", border: `1px solid ${hc}30` }}
            >
                <div>
                    <div className="text-3xl font-black tabular-nums leading-none" style={{ color: hc }}>{healthScore}</div>
                    <div className="text-[8px] uppercase tracking-widest text-white/35 mt-0.5">Health Score</div>
                </div>
                <div>
                    <div className="text-[11px] font-semibold" style={{ color: hc }}>{label}</div>
                    <div className="mt-1 w-20 h-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${healthScore}%`, background: hc }} />
                    </div>
                </div>
            </div>

            {/* ── Vitals ── */}
            <div
                className="flex items-center gap-4 px-4 py-2 rounded-2xl flex-1"
                style={{ background: "rgba(4,8,16,0.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
                <span className="text-[9px] uppercase tracking-widest text-white/30 shrink-0">Vitals</span>
                {vitals.map((v) => (
                    <div key={v.label} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${v.color}22` }}>
                            <span style={{ color: v.color }}>{v.icon}</span>
                        </div>
                        <div>
                            <div className="text-[11px] font-semibold text-white tabular-nums">{v.value}</div>
                            <div className="text-[8px] text-white/35">{v.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Organ Status ── */}
            {Object.keys(organs).length > 0 && (
                <div
                    className="flex items-center gap-3 px-4 py-2 rounded-2xl"
                    style={{ background: "rgba(4,8,16,0.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                    <span className="text-[9px] uppercase tracking-widest text-white/30 shrink-0">Organs</span>
                    {Object.entries(organs).slice(0, 5).map(([name, data]) => (
                        <div key={name} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: data.color }} />
                            <span className="text-[10px] text-white/55 capitalize">{name}</span>
                            <span className={`text-[9px] ${data.status === "healthy" ? "text-green-400" : data.status === "warning" ? "text-amber-400" : "text-red-400"}`}>
                                {data.status === "healthy" ? "✓" : "!"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


// ─────────────────────────────────────────────────────────────────────────────
// DOCK — physics magnification, no Body app (it's in wallpaper)
// ─────────────────────────────────────────────────────────────────────────────
const DOCK_APPS = [
    { id: "ai-doctor", label: "Dr. ARIA", icon: <Stethoscope className="w-7 h-7 text-white" />, bg: "from-purple-500 to-indigo-600", emoji: null },
    { id: "appointments", label: "Appointments", icon: null, bg: "from-blue-500 to-sky-600", emoji: "📅" },
    { id: "dashboard", label: "Dashboard", icon: <Activity className="w-7 h-7 text-white" />, bg: "from-cyan-500 to-teal-600", emoji: null },
    { id: "settings", label: "Settings", icon: <Settings className="w-7 h-7 text-white" />, bg: "from-slate-600 to-gray-700", emoji: null },
];

function MacDock({ onAppClick, openIds }: { onAppClick: (id: string) => void; openIds: string[] }) {
    const [mouseX, setMouseX] = useState<number | null>(null);
    const dockRef = useRef<HTMLDivElement>(null);

    const getScale = (index: number) => {
        if (mouseX === null || !dockRef.current) return 1;
        const dockWidth = dockRef.current.offsetWidth;
        const iconWidth = dockWidth / DOCK_APPS.length;
        const iconCenter = iconWidth * (index + 0.5);
        const dist = Math.abs(mouseX - iconCenter);
        const maxDist = iconWidth * 2.2;
        if (dist > maxDist) return 1;
        return 1 + 0.85 * Math.pow(1 - dist / maxDist, 2);
    };

    return (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9980]">
            <div
                ref={dockRef}
                className="flex items-end gap-2 px-4 pb-2 pt-2 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(28px) saturate(180%)", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)" }}
                onMouseMove={(e) => {
                    if (dockRef.current) {
                        setMouseX(e.clientX - dockRef.current.getBoundingClientRect().left);
                    }
                }}
                onMouseLeave={() => setMouseX(null)}
            >
                {DOCK_APPS.map((app, i) => {
                    const scale = getScale(i);
                    const isOpen = openIds.includes(app.id);
                    return (
                        <div
                            key={app.id}
                            className="flex flex-col items-center cursor-pointer relative"
                            style={{
                                transform: `scale(${scale}) translateY(${(scale - 1) * -10}px)`,
                                transformOrigin: "bottom center",
                                transition: mouseX === null ? "transform 0.25s ease-out" : "none",
                                zIndex: scale > 1 ? 10 : 1,
                            }}
                            onClick={() => onAppClick(app.id)}
                            title={app.label}
                        >
                            {/* Tooltip */}
                            {scale > 1.25 && (
                                <div
                                    className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-[11px] text-white font-medium whitespace-nowrap pointer-events-none"
                                    style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
                                >
                                    {app.label}
                                </div>
                            )}

                            {/* Icon */}
                            <div
                                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${app.bg} flex items-center justify-center shadow-lg relative overflow-hidden`}
                                style={{ boxShadow: isOpen ? `0 0 18px 3px rgba(0,229,255,0.35)` : "0 4px 16px rgba(0,0,0,0.4)" }}
                            >
                                {/* Glass sheen */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-2xl" />
                                {app.emoji ? (
                                    <span className="text-3xl relative z-10">{app.emoji}</span>
                                ) : (
                                    <span className="relative z-10">{app.icon}</span>
                                )}
                            </div>

                            {/* Active dot */}
                            {isOpen && (
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/70" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD & SETTINGS windows
// ─────────────────────────────────────────────────────────────────────────────
function DashboardWindow() {
    const { healthScore, avatarState } = useOSStore();
    const organs = (avatarState?.organs || {}) as Record<string, { status: string; color: string }>;
    const hc = healthScore >= 80 ? "#00e676" : healthScore >= 60 ? "#ffab40" : "#ff1744";
    return (
        <div className="p-5 h-full overflow-y-auto bg-[#080c14] space-y-4">
            <div className="text-center py-5 rounded-2xl border border-white/5" style={{ background: "linear-gradient(135deg, #0d1421, #080c14)" }}>
                <div className="text-6xl font-black" style={{ color: hc }}>{healthScore}</div>
                <div className="text-white/40 text-xs mt-1">Overall Health Score</div>
                <div className="mt-3 h-1.5 w-3/4 mx-auto rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${healthScore}%`, background: hc }} />
                </div>
            </div>
            <div className="space-y-1.5">
                {Object.entries(organs).map(([name, data]) => (
                    <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: data.color }} />
                            <span className="text-xs text-white/70 capitalize">{name}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${data.status === "healthy" ? "bg-green-500/20 text-green-400" : data.status === "warning" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                            {data.status}
                        </span>
                    </div>
                ))}
                {!Object.keys(organs).length && (
                    <div className="text-center py-10 text-white/25">
                        <Activity className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Complete onboarding to see your health data</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SettingsWindow() {
    const { patientName, patientId } = useOSStore();
    return (
        <div className="p-5 h-full overflow-y-auto bg-[#080c14]">
            <h2 className="text-sm font-bold text-white mb-4">System Settings</h2>
            {patientName && (
                <div className="mb-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-xs text-cyan-300">Logged in as: <strong>{patientName}</strong></p>
                    <p className="text-[10px] text-white/40 mt-0.5">ID: {patientId}</p>
                </div>
            )}
            <div className="space-y-2">
                {[
                    { label: "MongoDB Atlas", desc: "Cluster0 · Connected", status: true, color: "green" },
                    { label: "AI Doctor (Gemini)", desc: "Add GEMINI_API_KEY to .env.local", status: false, color: "amber" },
                    { label: "Voice (TTS)", desc: "Browser speechSynthesis · Active", status: true, color: "green" },
                    { label: "Voice (STT)", desc: "Web Speech API · Chrome recommended", status: true, color: "green" },
                    { label: "ElevenLabs TTS", desc: "Premium voice · Key required", status: false, color: "amber" },
                ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
                        <div>
                            <p className="text-xs font-medium text-white">{s.label}</p>
                            <p className="text-[10px] text-white/40">{s.desc}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${s.status ? "bg-green-400" : "bg-amber-400/50"}`} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN OS PAGE
// ─────────────────────────────────────────────────────────────────────────────
function OSPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [time, setTime] = useState(new Date());
    const [showSpotlight, setShowSpotlight] = useState(false);
    const [showPower, setShowPower] = useState(false);
    const [sleeping, setSleeping] = useState(false);

    const {
        openWindows, activeWindow, setPatient, setAvatarState,
        setHealthScore, showIslandNotification, openWindow, closeWindow, focusWindow,
    } = useOSStore();

    // Clock
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // Load patient from URL params
    useEffect(() => {
        const patientId = searchParams.get("patientId");
        const name = searchParams.get("name");
        if (patientId && name) {
            setPatient(patientId, decodeURIComponent(name));
            fetch(`/api/patients/${patientId}/avatar-state`)
                .then((r) => r.json())
                .then((data) => {
                    if (data.data) {
                        setAvatarState(data.data);
                        setHealthScore(data.data.healthScore);
                        showIslandNotification({
                            id: Date.now().toString(),
                            message: `Welcome, ${decodeURIComponent(name)}! Score: ${data.data.healthScore}`,
                            type: "success",
                            icon: "success",
                        });
                    }
                })
                .catch(() => { });
        }
    }, [searchParams, setPatient, setAvatarState, setHealthScore, showIslandNotification]);

    // Keyboard shortcut: Cmd+Space for spotlight
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === " ") {
                e.preventDefault();
                setShowSpotlight(true);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const handlePowerAction = (action: "logout" | "sleep" | "restart" | "shutdown") => {
        setShowPower(false);
        if (action === "sleep") {
            setSleeping(true);
        } else if (action === "logout") {
            router.push("/");
        } else if (action === "restart") {
            window.location.reload();
        } else if (action === "shutdown") {
            // Navigate to a blank "shutdown" state
            router.push("/?shutdown=true");
        }
    };

    const windowTitles: Record<string, string> = {
        "ai-doctor": "Dr. ARIA — AI Doctor",
        appointments: "Appointments",
        dashboard: "Health Dashboard",
        settings: "System Settings",
    };

    const windowContents: Record<string, React.ReactNode> = {
        "ai-doctor": <AIDoctorWindow />,
        appointments: <AppointmentsWindow />,
        dashboard: <DashboardWindow />,
        settings: <SettingsWindow />,
    };

    const activeTitle = activeWindow ? windowTitles[activeWindow] : null;

    return (
        <div className="w-screen h-screen overflow-hidden relative" style={{ fontSize: "100%" }}>

            {/* ── 1. THREE.JS WALLPAPER WITH 3D BODY ── */}
            <DesktopWallpaper />

            {/* ── 2. MENUBAR ── */}
            <Menubar
                time={time}
                activeWindowTitle={activeTitle}
                onPower={() => setShowPower(true)}
                onSpotlight={() => setShowSpotlight(true)}
            />

            {/* ── 3. DYNAMIC ISLAND ── */}
            <DynamicIsland />

            {/* ── 4. DESKTOP WIDGETS ── */}
            <DesktopWidgets />

            {/* ── 5. APP WINDOWS ── */}
            {openWindows.map((appId, index) => (
                <OSWindow
                    key={appId}
                    appId={appId}
                    zIndex={100 + index * 10}
                    onClose={() => closeWindow(appId)}
                    onFocus={() => focusWindow(appId)}
                    isActive={activeWindow === appId}
                    title={windowTitles[appId] || appId}
                >
                    {windowContents[appId] || (
                        <div className="flex items-center justify-center h-full text-white/30 text-sm">Coming soon…</div>
                    )}
                </OSWindow>
            ))}

            {/* ── 6. SPOTLIGHT ── */}
            <AnimatePresence>
                {showSpotlight && (
                    <Spotlight onClose={() => setShowSpotlight(false)} onOpenApp={openWindow} />
                )}
            </AnimatePresence>

            {/* ── 7. POWER MODAL ── */}
            <AnimatePresence>
                {showPower && (
                    <PowerModal onClose={() => setShowPower(false)} onAction={handlePowerAction} />
                )}
            </AnimatePresence>

            {/* ── 8. SLEEP SCREEN ── */}
            <AnimatePresence>
                {sleeping && <SleepScreen onWake={() => setSleeping(false)} />}
            </AnimatePresence>

            {/* ── 9. DOCK ── */}
            <MacDock onAppClick={openWindow} openIds={openWindows} />
        </div>
    );
}

export default function OSPage() {
    return (
        <Suspense fallback={
            <div className="w-screen h-screen bg-[#040810] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/30 text-xs font-mono">Booting HealthOS…</p>
                </div>
            </div>
        }>
            <OSPageContent />
        </Suspense>
    );
}

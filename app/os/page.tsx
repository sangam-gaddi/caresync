"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
    Activity, Heart, Brain, Wind, Search, Wifi, Battery,
    Stethoscope, Calendar, LayoutGrid, Settings, ChevronRight
} from "lucide-react";
import { useOSStore } from "@/lib/store";
import DynamicIsland from "@/components/os/DynamicIsland";
import AppointmentsWindow from "@/components/appointments/AppointmentsWindow";
import AIDoctorWindow from "@/components/ai-doctor/AIDoctorWindow";
import { OSWindow } from "@/components/os/WindowManager";

// Dynamic imports to avoid SSR issues
const BodyScene = dynamic(() => import("@/components/avatar/BodyScene"), { ssr: false });
const HealthWallpaper = dynamic(() => import("@/components/os/HealthWallpaper"), { ssr: false });

// ───────────────────────────────────────────────────────────────────────────────
// MENUBAR (macOS-style with battery, WiFi, health score)
// ───────────────────────────────────────────────────────────────────────────────
function Menubar({
    time,
    activeWindow,
    onSpotlight,
}: {
    time: Date;
    activeWindow: string | null;
    onSpotlight: () => void;
}) {
    const [showAppleMenu, setShowAppleMenu] = useState(false);
    const [batteryLevel, setBatteryLevel] = useState(87);
    const [isCharging, setIsCharging] = useState(false);
    const { healthScore } = useOSStore();

    useEffect(() => {
        if ("getBattery" in navigator) {
            (navigator as unknown as { getBattery: () => Promise<{ level: number; charging: boolean }> })
                .getBattery()
                .then((bat) => {
                    setBatteryLevel(Math.round(bat.level * 100));
                    setIsCharging(bat.charging);
                })
                .catch(() => { });
        }
    }, []);

    const formattedTime = time.toLocaleString("en-US", {
        weekday: "short", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
    });

    const healthColor =
        healthScore >= 80 ? "#00e676" : healthScore >= 60 ? "#ffab40" : "#ff1744";

    return (
        <div className="fixed top-0 left-0 right-0 h-7 z-[9990] flex items-center px-3"
            style={{ background: "rgba(4,8,16,0.55)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>

            {/* Left: Apple + App menus */}
            <div className="flex items-center gap-1 flex-1">
                {/* Apple / HealthOS logo */}
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
                                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-7 left-0 w-52 rounded-xl py-1 shadow-2xl"
                                style={{ background: "rgba(18,24,38,0.95)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.1)" }}
                                onMouseLeave={() => setShowAppleMenu(false)}
                            >
                                {[
                                    { label: "About HealthOS", action: () => { } },
                                    null,
                                    { label: "System Settings...", action: () => { } },
                                    null,
                                    { label: "Sleep", action: () => { } },
                                    { label: "Restart...", action: () => { } },
                                    { label: "Shut Down...", action: () => { } },
                                    null,
                                    { label: "Log Out", action: () => { } },
                                ].map((item, i) =>
                                    item === null ? (
                                        <div key={i} className="my-1 mx-2 border-t border-white/10" />
                                    ) : (
                                        <button
                                            key={i}
                                            onClick={() => { item.action(); setShowAppleMenu(false); }}
                                            className="w-full text-left px-4 py-1 text-[12px] text-white/80 hover:bg-blue-500/40 hover:text-white transition-colors"
                                        >
                                            {item.label}
                                        </button>
                                    )
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Active window menu items */}
                {activeWindow && (
                    <span className="text-[11px] font-semibold text-white px-2">{activeWindow}</span>
                )}

                {["File", "View", "Health", "Window"].map((m) => (
                    <button key={m} className="text-[11px] text-white/60 hover:text-white px-2 py-0.5 rounded hover:bg-white/10 transition-colors">
                        {m}
                    </button>
                ))}
            </div>

            {/* Right: status icons */}
            <div className="flex items-center gap-3">
                {/* Health score pill */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: `${healthColor}18`, border: `1px solid ${healthColor}40` }}>
                    <Heart className="w-2.5 h-2.5" style={{ color: healthColor }} />
                    <span className="text-[10px] font-bold" style={{ color: healthColor }}>{healthScore}</span>
                </div>

                {/* Battery */}
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-white/50">{batteryLevel}%</span>
                    <div className="w-5 h-2.5 border border-white/30 rounded-sm relative">
                        <div
                            className="absolute inset-[1px] rounded-sm transition-all"
                            style={{ width: `${batteryLevel}%`, background: batteryLevel > 20 ? "#00e676" : "#ff1744" }}
                        />
                        <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[3px] h-1.5 bg-white/30 rounded-r" />
                        {isCharging && <span className="absolute inset-0 flex items-center justify-center text-[6px]">⚡</span>}
                    </div>
                </div>

                {/* WiFi */}
                <Wifi className="w-3.5 h-3.5 text-white/50" />

                {/* Spotlight */}
                <button onClick={onSpotlight} className="hover:text-white text-white/50 transition-colors">
                    <Search className="w-3.5 h-3.5" />
                </button>

                {/* Time */}
                <span className="text-[11px] text-white/80">{formattedTime}</span>
            </div>
        </div>
    );
}

// ───────────────────────────────────────────────────────────────────────────────
// SPOTLIGHT
// ───────────────────────────────────────────────────────────────────────────────
function Spotlight({ onClose, onOpenApp }: { onClose: () => void; onOpenApp: (id: string) => void }) {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const apps = [
        { id: "body", label: "3D Body Viewer", icon: "🫀" },
        { id: "ai-doctor", label: "AI Doctor (ARIA)", icon: "🩺" },
        { id: "appointments", label: "Appointments", icon: "📅" },
        { id: "dashboard", label: "Health Dashboard", icon: "📊" },
    ];

    const filtered = apps.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => { inputRef.current?.focus(); }, []);

    return (
        <div
            className="fixed inset-0 z-[9980] flex items-start justify-center pt-32"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-[600px] rounded-2xl shadow-2xl overflow-hidden"
                style={{ background: "rgba(12,18,30,0.92)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.1)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                    <Search className="w-5 h-5 text-white/40" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Escape" && onClose()}
                        placeholder="Spotlight Search"
                        className="flex-1 bg-transparent text-white text-lg outline-none placeholder-white/30"
                    />
                </div>
                {filtered.length > 0 && (
                    <div className="py-2">
                        <p className="text-[10px] text-white/30 px-5 pb-1 uppercase tracking-widest">Apps</p>
                        {filtered.map((app) => (
                            <button
                                key={app.id}
                                onClick={() => { onOpenApp(app.id); onClose(); }}
                                className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-white/8 transition-colors text-left"
                            >
                                <span className="text-xl">{app.icon}</span>
                                <span className="text-sm text-white/80">{app.label}</span>
                                <ChevronRight className="w-4 h-4 text-white/20 ml-auto" />
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// ───────────────────────────────────────────────────────────────────────────────
// HEALTH DESKTOP WIDGETS (pinned to wallpaper, not windows)
// ───────────────────────────────────────────────────────────────────────────────
function DesktopWidgets() {
    const { healthScore, avatarState } = useOSStore();
    const organs = (avatarState?.organs || {}) as Record<string, { status: string; color: string }>;

    const healthColor = healthScore >= 80 ? "#00e676" : healthScore >= 60 ? "#ffab40" : "#ff1744";
    const healthLabel = healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : healthScore >= 40 ? "Fair" : "Critical";

    const stats = [
        { label: "Heart Rate", value: "72 BPM", icon: <Heart className="w-4 h-4" />, color: organs.heart?.color || "#ff4d6d" },
        { label: "Brain Stress", value: "Low", icon: <Brain className="w-4 h-4" />, color: organs.brain?.color || "#7c3aed" },
        { label: "Lung O₂", value: "98%", icon: <Wind className="w-4 h-4" />, color: organs.lungs?.color || "#00e5ff" },
    ];

    return (
        <>
            {/* Top-right: Health Score Widget */}
            <div
                className="absolute top-14 right-5 w-48 rounded-3xl p-4"
                style={{ background: "rgba(4,8,16,0.65)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", zIndex: 50 }}
            >
                <div className="text-center mb-2">
                    <div className="text-4xl font-black" style={{ color: healthColor }}>{healthScore}</div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5">Health Score</div>
                    <div className="text-[11px] font-semibold mt-1" style={{ color: healthColor }}>{healthLabel}</div>
                </div>
                <div className="h-1 rounded-full bg-white/10 overflow-hidden mt-2">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${healthScore}%`, background: `linear-gradient(90deg, ${healthColor}, ${healthColor}88)` }} />
                </div>
            </div>

            {/* Top-right below: Organ Stats */}
            <div
                className="absolute top-14 right-60 w-44 rounded-3xl p-3 space-y-2"
                style={{ background: "rgba(4,8,16,0.65)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", zIndex: 50 }}
            >
                <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Vital Signs</p>
                {stats.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.color}22` }}>
                            <span style={{ color: s.color }}>{s.icon}</span>
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-white/80">{s.value}</div>
                            <div className="text-[8px] text-white/35">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom-center desktop label */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                {Object.keys(organs).length === 0 && (
                    <div className="text-center">
                        <p className="text-white/20 text-sm">Click an app in the dock to get started</p>
                    </div>
                )}
            </div>

            {/* Organ status dots floating on desktop */}
            {Object.entries(organs).slice(0, 6).map(([name, data], i) => (
                <div
                    key={name}
                    className="absolute rounded-xl px-2.5 py-1.5 flex items-center gap-1.5"
                    style={{
                        background: "rgba(4,8,16,0.60)",
                        backdropFilter: "blur(20px)",
                        border: `1px solid ${data.color}40`,
                        bottom: `${120 + i * 0}px`,
                        left: `${20 + i * 90}px`,
                        zIndex: 50,
                        display: "none", // hidden by default — shown only when no apps open
                    }}
                >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: data.color }} />
                    <span className="text-[10px] text-white/60 capitalize">{name}</span>
                </div>
            ))}
        </>
    );
}

// ───────────────────────────────────────────────────────────────────────────────
// DOCK  (with real macOS magnification from reference project)
// ───────────────────────────────────────────────────────────────────────────────
const DOCK_APPS = [
    { id: "dashboard", label: "Dashboard", icon: <Activity className="w-7 h-7 text-white" />, bg: "from-cyan-500 to-blue-600" },
    { id: "body", label: "3D Body", icon: <span className="text-3xl">🫀</span>, bg: "from-pink-500 to-rose-600" },
    { id: "ai-doctor", label: "Dr. ARIA", icon: <Stethoscope className="w-7 h-7 text-white" />, bg: "from-purple-500 to-indigo-600" },
    { id: "appointments", label: "Appointments", icon: <Calendar className="w-7 h-7 text-white" />, bg: "from-blue-500 to-sky-600" },
    { id: "settings", label: "Settings", icon: <Settings className="w-7 h-7 text-white" />, bg: "from-slate-500 to-gray-600" },
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
        const maxDist = iconWidth * 2;
        if (dist > maxDist) return 1;
        return 1 + (0.9) * Math.pow(1 - dist / maxDist, 2);
    };

    return (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9980]">
            <div
                ref={dockRef}
                className="flex items-end gap-2 px-4 py-2 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                onMouseMove={(e) => {
                    if (dockRef.current) {
                        const rect = dockRef.current.getBoundingClientRect();
                        setMouseX(e.clientX - rect.left);
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
                            className="flex flex-col items-center cursor-pointer"
                            style={{
                                transform: `scale(${scale}) translateY(${(scale - 1) * -12}px)`,
                                transformOrigin: "bottom center",
                                transition: mouseX === null ? "transform 0.2s ease-out" : "none",
                                zIndex: scale > 1 ? 10 : 1,
                            }}
                            onClick={() => onAppClick(app.id)}
                        >
                            <div className="relative group">
                                {/* Tooltip */}
                                {scale > 1.3 && (
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] text-white font-medium whitespace-nowrap pointer-events-none"
                                        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
                                        {app.label}
                                    </div>
                                )}
                                {/* Icon */}
                                <div
                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${app.bg} flex items-center justify-center shadow-lg`}
                                    style={{ boxShadow: isOpen ? `0 0 16px 2px rgba(0,229,255,0.4)` : undefined }}
                                >
                                    {app.icon}
                                </div>
                                {/* Active dot */}
                                {isOpen && (
                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ───────────────────────────────────────────────────────────────────────────────
// MAIN OS PAGE
// ───────────────────────────────────────────────────────────────────────────────
function OSPageContent() {
    const searchParams = useSearchParams();
    const [time, setTime] = useState(new Date());
    const [showSpotlight, setShowSpotlight] = useState(false);
    const { openWindows, setPatient, setAvatarState, setHealthScore, showIslandNotification, openWindow, closeWindow } = useOSStore();

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
                            message: `Welcome back, ${decodeURIComponent(name)}! Score: ${data.data.healthScore}`,
                            type: "success",
                            icon: "success",
                        });
                    }
                })
                .catch(() => { });
        }
    }, [searchParams, setPatient, setAvatarState, setHealthScore, showIslandNotification]);

    const handleOpenApp = (id: string) => {
        if (!openWindows.includes(id)) openWindow(id);
    };

    const windowContents: Record<string, React.ReactNode> = {
        body: (
            <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>}>
                <BodyScene />
            </Suspense>
        ),
        appointments: <AppointmentsWindow />,
        "ai-doctor": <AIDoctorWindow />,
        dashboard: <DashboardWidget />,
        settings: <SettingsPanel />,
    };

    const windowTitles: Record<string, string> = {
        body: "3D Body Viewer",
        appointments: "Appointments",
        "ai-doctor": "Dr. ARIA — AI Doctor",
        dashboard: "Health Dashboard",
        settings: "System Settings",
    };

    const activeTitle = openWindows.length > 0 ? windowTitles[openWindows[openWindows.length - 1]] : null;

    return (
        <div className="w-full h-screen overflow-hidden relative bg-[#040810]">
            {/* ── THREE.JS WALLPAPER ── */}
            <HealthWallpaper />

            {/* ── MENUBAR ── */}
            <Menubar time={time} activeWindow={activeTitle} onSpotlight={() => setShowSpotlight(true)} />

            {/* ── DYNAMIC ISLAND ── */}
            <DynamicIsland />

            {/* ── DESKTOP WIDGETS ── */}
            <DesktopWidgets />

            {/* ── APP WINDOWS ── */}
            {openWindows.map((appId, index) => (
                <OSWindow key={appId} appId={appId} zIndex={100 + index * 10}>
                    {windowContents[appId] || <div className="flex items-center justify-center h-full text-white/30 text-sm">Coming soon...</div>}
                </OSWindow>
            ))}

            {/* ── SPOTLIGHT ── */}
            <AnimatePresence>
                {showSpotlight && (
                    <Spotlight onClose={() => setShowSpotlight(false)} onOpenApp={handleOpenApp} />
                )}
            </AnimatePresence>

            {/* ── DOCK ── */}
            <MacDock onAppClick={handleOpenApp} openIds={openWindows} />
        </div>
    );
}

// Inline mini-components for Settings and Dashboard within OS
function DashboardWidget() {
    const { healthScore, avatarState } = useOSStore();
    const organs = (avatarState?.organs || {}) as Record<string, { status: string; color: string }>;
    const hc = healthScore >= 80 ? "#00e676" : healthScore >= 60 ? "#ffab40" : "#ff1744";
    return (
        <div className="p-5 h-full overflow-y-auto bg-[#080c14] space-y-4">
            <div className="text-center py-4 rounded-2xl" style={{ background: "linear-gradient(135deg, #0d1421, #080c14)" }}>
                <div className="text-6xl font-black" style={{ color: hc }}>{healthScore}</div>
                <div className="text-white/40 text-xs mt-1">Overall Health Score</div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-[#1e2a3a] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${healthScore}%`, background: hc }} />
                </div>
            </div>
            <div className="space-y-1.5">
                {Object.entries(organs).map(([name, data]) => (
                    <div key={name} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d1421] border border-[#1e2a3a]">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: data.color }} />
                            <span className="text-xs text-white/70 capitalize">{name}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${data.status === "healthy" ? "bg-green-500/20 text-green-400" : data.status === "warning" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                            {data.status}
                        </span>
                    </div>
                ))}
                {Object.keys(organs).length === 0 && (
                    <div className="text-center text-white/30 text-sm py-8">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>Complete onboarding to see your data</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SettingsPanel() {
    return (
        <div className="p-5 h-full overflow-y-auto bg-[#080c14]">
            <h2 className="text-sm font-bold text-white mb-4">System Settings</h2>
            <div className="space-y-2">
                {[
                    { label: "MongoDB", desc: "Connected to Atlas Cluster", status: "active" },
                    { label: "AI Doctor", desc: "Configure Gemini / OpenAI API keys", status: "inactive" },
                    { label: "Voice TTS", desc: "Using browser speechSynthesis", status: "active" },
                    { label: "ElevenLabs", desc: "Premium TTS (key required)", status: "inactive" },
                ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-[#0d1421] border border-[#1e2a3a]">
                        <div>
                            <p className="text-xs font-medium text-white">{s.label}</p>
                            <p className="text-[10px] text-white/40">{s.desc}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${s.status === "active" ? "bg-green-400" : "bg-white/20"}`} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function OSPage() {
    return (
        <Suspense fallback={<div className="w-full h-screen bg-[#040810] flex items-center justify-center"><div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>}>
            <OSPageContent />
        </Suspense>
    );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Wifi, WifiOff, Bluetooth, BluetoothOff,
    Moon, Sun, Volume2, VolumeX, Maximize, Minimize,
    Monitor, Sparkles
} from "lucide-react";
import { useOSStore } from "@/lib/store";

export default function ControlCenter({ onClose }: { onClose: () => void }) {
    const { brightness, setBrightness, isDarkMode, toggleDarkMode } = useOSStore();
    const [wifiEnabled, setWifiEnabled] = useState(true);
    const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
    const [volume, setVolume] = useState(75);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const savedWifi = localStorage.getItem("wifiEnabled");
        if (savedWifi !== null) setWifiEnabled(savedWifi === "true");

        setIsFullscreen(!!document.fullscreenElement);

        const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleFSChange);
        return () => document.removeEventListener("fullscreenchange", handleFSChange);
    }, []);

    const toggleWifi = () => {
        const next = !wifiEnabled;
        setWifiEnabled(next);
        localStorage.setItem("wifiEnabled", next.toString());
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        } else {
            document.exitFullscreen?.();
        }
    };

    // Glass background based on theme
    const glassBg = isDarkMode
        ? "rgba(10,16,28,0.88)"
        : "rgba(240,242,245,0.88)";
    const borderColor = isDarkMode
        ? "rgba(255,255,255,0.10)"
        : "rgba(0,0,0,0.10)";
    const tileBg = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const tileActiveBg = isDarkMode ? "#0a84ff" : "#007aff";
    const textColor = isDarkMode ? "#ffffff" : "#1d1d1f";
    const textMuted = isDarkMode ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
    const sliderTrack = isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";

    const tiles = [
        {
            id: "wifi",
            icon: wifiEnabled ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />,
            label: "Wi-Fi",
            active: wifiEnabled,
            onClick: toggleWifi,
        },
        {
            id: "bluetooth",
            icon: bluetoothEnabled ? <Bluetooth className="w-5 h-5" /> : <BluetoothOff className="w-5 h-5" />,
            label: "Bluetooth",
            active: bluetoothEnabled,
            onClick: () => setBluetoothEnabled(!bluetoothEnabled),
        },
        {
            id: "theme",
            icon: isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />,
            label: isDarkMode ? "Dark" : "Light",
            active: true,
            onClick: toggleDarkMode,
        },
        {
            id: "fullscreen",
            icon: isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />,
            label: isFullscreen ? "Exit FS" : "Fullscreen",
            active: isFullscreen,
            onClick: toggleFullscreen,
        },
    ];

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[9970]" onClick={onClose} />

            {/* Panel */}
            <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="fixed top-8 right-4 w-80 rounded-2xl overflow-hidden shadow-2xl z-[9975]"
                style={{
                    background: glassBg,
                    backdropFilter: "blur(48px) saturate(180%)",
                    border: `1px solid ${borderColor}`,
                    boxShadow: isDarkMode
                        ? "0 16px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)"
                        : "0 16px 64px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 space-y-3">
                    {/* ── Quick Toggles ── */}
                    <div className="grid grid-cols-4 gap-2">
                        {tiles.map((tile) => (
                            <button
                                key={tile.id}
                                onClick={tile.onClick}
                                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all duration-200"
                                style={{
                                    background: tile.active ? tileActiveBg : tileBg,
                                    border: `1px solid ${tile.active ? "transparent" : borderColor}`,
                                }}
                            >
                                <span style={{ color: tile.active ? "#fff" : textColor }}>{tile.icon}</span>
                                <span
                                    className="text-[9px] font-medium leading-tight text-center"
                                    style={{ color: tile.active ? "#fff" : textMuted }}
                                >
                                    {tile.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* ── Display / Brightness ── */}
                    <div className="rounded-xl p-3" style={{ background: tileBg, border: `1px solid ${borderColor}` }}>
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                                <Monitor className="w-3.5 h-3.5" style={{ color: textMuted }} />
                                <span className="text-[11px] font-semibold" style={{ color: textColor }}>Display</span>
                            </div>
                            <span className="text-[10px] font-mono tabular-nums" style={{ color: textMuted }}>
                                {brightness}%
                            </span>
                        </div>
                        <div className="relative">
                            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: sliderTrack }}>
                                <div
                                    className="h-full rounded-full transition-all duration-100"
                                    style={{
                                        width: `${brightness}%`,
                                        background: "linear-gradient(90deg, #ffbd2e, #f5c542)",
                                    }}
                                />
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="100"
                                value={brightness}
                                onChange={(e) => setBrightness(Number(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* ── Volume ── */}
                    <div className="rounded-xl p-3" style={{ background: tileBg, border: `1px solid ${borderColor}` }}>
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                                {volume === 0
                                    ? <VolumeX className="w-3.5 h-3.5" style={{ color: textMuted }} />
                                    : <Volume2 className="w-3.5 h-3.5" style={{ color: textMuted }} />}
                                <span className="text-[11px] font-semibold" style={{ color: textColor }}>Sound</span>
                            </div>
                            <span className="text-[10px] font-mono tabular-nums" style={{ color: textMuted }}>
                                {volume}%
                            </span>
                        </div>
                        <div className="relative">
                            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: sliderTrack }}>
                                <div
                                    className="h-full rounded-full transition-all duration-100"
                                    style={{
                                        width: `${volume}%`,
                                        background: "linear-gradient(90deg, #00e5ff, #0a84ff)",
                                    }}
                                />
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* ── Theme Preview ── */}
                    <div className="rounded-xl p-3" style={{ background: tileBg, border: `1px solid ${borderColor}` }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" style={{ color: textMuted }} />
                                <span className="text-[11px] font-semibold" style={{ color: textColor }}>Appearance</span>
                            </div>
                            <button
                                onClick={toggleDarkMode}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-200"
                                style={{
                                    background: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                                    border: `1px solid ${borderColor}`,
                                }}
                            >
                                {isDarkMode ? (
                                    <>
                                        <Moon className="w-3 h-3" style={{ color: "#a78bfa" }} />
                                        <span className="text-[10px] font-medium" style={{ color: textColor }}>Dark</span>
                                    </>
                                ) : (
                                    <>
                                        <Sun className="w-3 h-3" style={{ color: "#f59e0b" }} />
                                        <span className="text-[10px] font-medium" style={{ color: textColor }}>Light</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

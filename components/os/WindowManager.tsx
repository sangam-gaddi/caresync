"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOSStore } from "@/lib/store";


interface WindowConfig {
    id: string;
    title: string;
    icon: string;
    defaultSize: { width: number; height: number };
    minSize: { width: number; height: number };
}

const WINDOW_CONFIGS: Record<string, WindowConfig> = {
    body: {
        id: "body",
        title: "3D Health Avatar",
        icon: "🫀",
        defaultSize: { width: 680, height: 520 },
        minSize: { width: 400, height: 350 },
    },
    appointments: {
        id: "appointments",
        title: "Appointments",
        icon: "📅",
        defaultSize: { width: 700, height: 480 },
        minSize: { width: 400, height: 300 },
    },
    "ai-doctor": {
        id: "ai-doctor",
        title: "Dr. ARIA — AI Doctor",
        icon: "🩺",
        defaultSize: { width: 420, height: 600 },
        minSize: { width: 320, height: 400 },
    },
    voice: {
        id: "voice",
        title: "Voice Session",
        icon: "🎙️",
        defaultSize: { width: 360, height: 420 },
        minSize: { width: 320, height: 350 },
    },
    dashboard: {
        id: "dashboard",
        title: "Health Dashboard",
        icon: "📊",
        defaultSize: { width: 760, height: 540 },
        minSize: { width: 500, height: 400 },
    },
    profile: {
        id: "profile",
        title: "My Profile",
        icon: "👤",
        defaultSize: { width: 420, height: 480 },
        minSize: { width: 360, height: 400 },
    },
    settings: {
        id: "settings",
        title: "System Settings",
        icon: "⚙️",
        defaultSize: { width: 480, height: 500 },
        minSize: { width: 380, height: 380 },
    },
    "admin-panel": {
        id: "admin-panel",
        title: "Admin Dashboard",
        icon: "🛡️",
        defaultSize: { width: 900, height: 600 },
        minSize: { width: 600, height: 400 },
    },
};

interface OSWindowProps {
    appId: string;
    zIndex: number;
    children: React.ReactNode;
    onClose?: () => void;
    onFocus?: () => void;
    isActive?: boolean;
    title?: string;
}

export function OSWindow({ appId, zIndex, children, onClose: onCloseProp, onFocus: onFocusProp, isActive: isActiveProp, title: titleProp }: OSWindowProps) {
    const config = WINDOW_CONFIGS[appId];
    const { closeWindow, focusWindow, activeWindow } = useOSStore();
    const handleClose = onCloseProp ?? (() => closeWindow(appId));
    const handleFocus = onFocusProp ?? (() => focusWindow(appId));
    const isActive = isActiveProp !== undefined ? isActiveProp : activeWindow === appId;
    const [minimized, setMinimized] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [position, setPosition] = useState({
        x: 80 + Object.keys(WINDOW_CONFIGS).indexOf(appId) * 30,
        y: 80 + Object.keys(WINDOW_CONFIGS).indexOf(appId) * 20,
    });
    const [size, setSize] = useState(config?.defaultSize || { width: 600, height: 480 });
    const minSize = config?.minSize || { width: 300, height: 250 };

    const dragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const resizing = useRef(false);
    const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });
    const windowRef = useRef<HTMLDivElement>(null);

    // Restore from minimized when focused via dock
    useEffect(() => {
        if (isActive && minimized) setMinimized(false);
    }, [isActive, minimized]);

    const onMouseDown = useCallback(
        (e: React.MouseEvent) => {
            dragging.current = true;
            dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
            focusWindow(appId);
        },
        [position, appId, focusWindow]
    );

    const onResizeStart = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            resizing.current = true;
            resizeStart.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };
            focusWindow(appId);
        },
        [size, appId, focusWindow]
    );

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (dragging.current) {
                setPosition({
                    x: Math.max(0, e.clientX - dragOffset.current.x),
                    y: Math.max(28, e.clientY - dragOffset.current.y),
                });
            }
            if (resizing.current) {
                const dx = e.clientX - resizeStart.current.x;
                const dy = e.clientY - resizeStart.current.y;
                setSize({
                    width: Math.max(minSize.width, resizeStart.current.w + dx),
                    height: Math.max(minSize.height, resizeStart.current.h + dy),
                });
            }
        };
        const onUp = () => {
            dragging.current = false;
            resizing.current = false;
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [minSize.width, minSize.height]);

    if (!config && !titleProp) return null;
    const resolvedTitle = titleProp || config?.title || appId;
    const resolvedIcon = config?.icon || "🗂️";

    const { isDarkMode } = useOSStore();

    const winBg = isDarkMode
        ? "rgba(8,12,20,0.92)"
        : "rgba(245,245,250,0.92)";
    const winBorder = isDarkMode
        ? "rgba(255,255,255,0.10)"
        : "rgba(0,0,0,0.10)";
    const titleBarBg = isDarkMode
        ? "rgba(14,20,34,0.95)"
        : "rgba(235,235,240,0.95)";
    const titleTextColor = isDarkMode ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.65)";

    return (
        <AnimatePresence>
            {!minimized && (
                <motion.div
                    ref={windowRef}
                    initial={{ scale: 0.85, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.85, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    style={isFullscreen ? {
                        position: "fixed",
                        left: 0,
                        top: 28,
                        width: "100vw",
                        height: "calc(100vh - 28px - 76px)",
                        zIndex: zIndex + 200,
                        borderRadius: 0,
                        background: winBg,
                        backdropFilter: "blur(40px) saturate(180%)",
                        border: `1px solid ${winBorder}`,
                        boxShadow: isDarkMode
                            ? "0 12px 48px rgba(0,0,0,0.6)"
                            : "0 12px 48px rgba(0,0,0,0.15)",
                    } : {
                        position: "fixed",
                        left: position.x,
                        top: position.y,
                        width: size.width,
                        height: size.height,
                        zIndex: zIndex + (isActive ? 100 : 0),
                        background: winBg,
                        backdropFilter: "blur(40px) saturate(180%)",
                        border: `1px solid ${winBorder}`,
                        borderRadius: "12px",
                        boxShadow: isDarkMode
                            ? `0 12px 48px rgba(0,0,0,0.6)${isActive ? ", 0 0 0 1px rgba(255,255,255,0.08)" : ""}`
                            : `0 12px 48px rgba(0,0,0,0.15)${isActive ? ", 0 0 0 1px rgba(0,0,0,0.08)" : ""}`,
                        overflow: "hidden",
                    }}
                    className={`select-none flex flex-col ${isFullscreen ? "rounded-none" : ""}`}
                    onMouseDown={() => handleFocus()}
                >
                    {/* Title Bar */}
                    <div
                        className="flex items-center px-3 h-11 shrink-0 cursor-move"
                        style={{
                            background: titleBarBg,
                            borderBottom: `1px solid ${winBorder}`,
                            backdropFilter: "blur(20px)",
                        }}
                        onMouseDown={isFullscreen ? undefined : onMouseDown}
                        onDoubleClick={() => setIsFullscreen(!isFullscreen)}
                    >
                        <div className="flex items-center gap-1.5">
                            <button
                                className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff3b30] transition-colors"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={handleClose}
                            />
                            <button
                                className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#ffa800] transition-colors"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => setMinimized(true)}
                            />
                            <button
                                className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#00c21b] transition-colors"
                                title="Fullscreen"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => setIsFullscreen(!isFullscreen)}
                            />
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <span className="text-base">{resolvedIcon}</span>
                            <span className="text-xs font-medium" style={{ color: titleTextColor }}>{resolvedTitle}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto">{children}</div>

                    {/* Resize handles (only when not fullscreen) */}
                    {!isFullscreen && (
                        <>
                            {/* Bottom-right corner */}
                            <div
                                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-10"
                                onMouseDown={onResizeStart}
                            />
                            {/* Right edge */}
                            <div
                                className="absolute top-11 right-0 w-1.5 bottom-0 cursor-ew-resize z-10 hover:bg-blue-400/10"
                                onMouseDown={onResizeStart}
                            />
                            {/* Bottom edge */}
                            <div
                                className="absolute bottom-0 left-0 h-1.5 right-0 cursor-ns-resize z-10 hover:bg-blue-400/10"
                                onMouseDown={onResizeStart}
                            />
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export { WINDOW_CONFIGS };

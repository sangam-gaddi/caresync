"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOSStore } from "@/lib/store";
import { X, Minus, Square } from "lucide-react";

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
    const [minimized, setMinimized] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [position, setPosition] = useState({
        x: 80 + Object.keys(WINDOW_CONFIGS).indexOf(appId) * 30,
        y: 80 + Object.keys(WINDOW_CONFIGS).indexOf(appId) * 20,
    });
    const [size, setSize] = useState(config?.defaultSize || { width: 600, height: 480 });

    const dragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const windowRef = useRef<HTMLDivElement>(null);

    const onMouseDown = useCallback(
        (e: React.MouseEvent) => {
            dragging.current = true;
            dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
            focusWindow(appId);
        },
        [position, appId, focusWindow]
    );

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!dragging.current) return;
            setPosition({
                x: Math.max(0, e.clientX - dragOffset.current.x),
                y: Math.max(0, e.clientY - dragOffset.current.y),
            });
        };
        const onUp = () => { dragging.current = false; };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, []);

    if (!config && !titleProp) return null;
    const resolvedTitle = titleProp || config?.title || appId;
    const resolvedIcon = config?.icon || "🗂️";

    const isActive = isActiveProp !== undefined ? isActiveProp : activeWindow === appId;

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
                        top: 28, // below menubar
                        width: "100vw",
                        height: "calc(100vh - 28px - 76px)", // leave dock space
                        zIndex: zIndex + 200,
                        borderRadius: 0,
                    } : {
                        position: "fixed",
                        left: position.x,
                        top: position.y,
                        width: size.width,
                        height: size.height,
                        zIndex: zIndex + (isActive ? 100 : 0),
                    }}
                    className={`os-window select-none ${isActive ? "ring-1 ring-white/10" : "opacity-95"} ${isFullscreen ? "rounded-none" : ""}`}
                    onMouseDown={() => handleFocus()}
                >
                    {/* Title Bar */}
                    <div
                        className="os-window-titlebar cursor-move"
                        onMouseDown={isFullscreen ? undefined : onMouseDown}
                        onDoubleClick={() => setIsFullscreen(!isFullscreen)}
                    >
                        <div className="flex items-center gap-1.5">
                            {/* Traffic lights */}
                            <button
                                className="os-window-btn bg-[#ff5f57] hover:bg-[#ff3b30]"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={handleClose}
                            />
                            <button
                                className="os-window-btn bg-[#febc2e] hover:bg-[#ffa800]"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => setMinimized(true)}
                            />
                            <button
                                className="os-window-btn bg-[#28c840] hover:bg-[#00c21b]"
                                title="Fullscreen"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => setIsFullscreen(!isFullscreen)}
                            />
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <span className="text-base">{resolvedIcon}</span>
                            <span className="text-xs font-medium text-white/70">{resolvedTitle}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto h-[calc(100%-44px)]">{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export { WINDOW_CONFIGS };

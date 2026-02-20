import { create } from "zustand";

export interface DynamicIslandNotification {
    id: string;
    message: string;
    type: "info" | "warning" | "success" | "ai";
    icon?: string;
}

interface OSStore {
    // Dynamic Island
    islandExpanded: boolean;
    islandNotification: DynamicIslandNotification | null;
    showIslandNotification: (notif: DynamicIslandNotification) => void;
    dismissIsland: () => void;

    // App Windows
    openWindows: string[];
    activeWindow: string | null;
    openWindow: (appId: string) => void;
    closeWindow: (appId: string) => void;
    focusWindow: (appId: string) => void;

    // Patient state
    patientId: string | null;
    patientName: string | null;
    avatarState: Record<string, unknown> | null;
    healthScore: number;
    setPatient: (id: string, name: string) => void;
    setAvatarState: (state: Record<string, unknown>) => void;
    setHealthScore: (score: number) => void;

    // AI Doctor
    aiThinking: boolean;
    setAiThinking: (v: boolean) => void;

    // Desktop appearance
    brightness: number;
    setBrightness: (v: number) => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    showControlCenter: boolean;
    setShowControlCenter: (v: boolean) => void;
}

export const useOSStore = create<OSStore>((set, get) => ({
    // Dynamic Island
    islandExpanded: false,
    islandNotification: null,
    showIslandNotification: (notif) => {
        set({ islandNotification: notif, islandExpanded: true });
        setTimeout(() => {
            set({ islandExpanded: false });
            setTimeout(() => set({ islandNotification: null }), 500);
        }, 4000);
    },
    dismissIsland: () => set({ islandExpanded: false }),

    // Windows
    openWindows: [],
    activeWindow: null,
    openWindow: (appId) => {
        const { openWindows } = get();
        if (!openWindows.includes(appId)) {
            set({ openWindows: [...openWindows, appId], activeWindow: appId });
        } else {
            set({ activeWindow: appId });
        }
    },
    closeWindow: (appId) => {
        const { openWindows } = get();
        const remaining = openWindows.filter((w) => w !== appId);
        set({ openWindows: remaining, activeWindow: remaining[remaining.length - 1] || null });
    },
    focusWindow: (appId) => set({ activeWindow: appId }),

    // Patient
    patientId: null,
    patientName: null,
    avatarState: null,
    healthScore: 75,
    setPatient: (id, name) => set({ patientId: id, patientName: name }),
    setAvatarState: (state) => set({ avatarState: state }),
    setHealthScore: (score) => set({ healthScore: score }),

    // AI Doctor
    aiThinking: false,
    setAiThinking: (v) => set({ aiThinking: v }),

    // Desktop appearance
    brightness: 100,
    setBrightness: (v) => set({ brightness: v }),
    isDarkMode: true,
    toggleDarkMode: () => set({ isDarkMode: !get().isDarkMode }),
    showControlCenter: false,
    setShowControlCenter: (v) => set({ showControlCenter: v }),
}));

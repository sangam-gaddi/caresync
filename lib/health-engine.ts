import { IHealthProfile } from "./models/health-profile";

export interface OrganData {
    status: "healthy" | "warning" | "critical";
    color: string;
    emissiveColor: string;
    glowIntensity: number;
}

export interface ComputedAvatarState {
    healthScore: number;
    organs: {
        heart: OrganData & { bpm: number; pulseScale: number };
        liver: OrganData & { fatLevel: string };
        lungs: OrganData & { capacityPercent: number };
        kidneys: OrganData;
        brain: OrganData & { stressLevel: number };
        stomach: OrganData;
    };
}

const COLORS = {
    healthy: { color: "#00e676", emissive: "#00c853", glow: 0.4 },
    warning: { color: "#ffab40", emissive: "#ff6d00", glow: 0.7 },
    critical: { color: "#ff1744", emissive: "#d50000", glow: 1.2 },
};

function getOrganBase(status: "healthy" | "warning" | "critical"): OrganData {
    const c = COLORS[status];
    return {
        status,
        color: c.color,
        emissiveColor: c.emissive,
        glowIntensity: c.glow,
    };
}

export function computeAvatarState(profile: Partial<IHealthProfile>): ComputedAvatarState {
    const lifestyle = profile.lifestyle || {};
    const vulnerabilities = profile.vulnerabilities || [];
    const issues = profile.currentIssues || [];

    // --- Heart ---
    let heartStatus: "healthy" | "warning" | "critical" = "healthy";
    let bpm = 72;
    let pulseScale = 1.05;

    const hasCardiac =
        vulnerabilities.includes("hypertension") ||
        vulnerabilities.includes("heart disease") ||
        issues.some((i) => i.name?.toLowerCase().includes("heart"));
    const highStress = (lifestyle.stressLevel ?? 5) > 7;
    const smoker = lifestyle.smoker;

    if (hasCardiac || (highStress && smoker)) {
        heartStatus = "critical";
        bpm = 115;
        pulseScale = 1.18;
    } else if (highStress || smoker) {
        heartStatus = "warning";
        bpm = 95;
        pulseScale = 1.12;
    }

    // --- Liver ---
    let liverStatus: "healthy" | "warning" | "critical" = "healthy";
    const fatIntake = lifestyle.fatIntake || "moderate";
    const alcoholHigh = lifestyle.alcoholConsumption === "high";

    if ((fatIntake === "high" && alcoholHigh) || vulnerabilities.includes("liver disease")) {
        liverStatus = "critical";
    } else if (fatIntake === "high" || alcoholHigh) {
        liverStatus = "warning";
    }

    // --- Lungs ---
    let lungsStatus: "healthy" | "warning" | "critical" = "healthy";
    let capacityPercent = 95;

    if (smoker && issues.some((i) => i.name?.toLowerCase().includes("lungs"))) {
        lungsStatus = "critical";
        capacityPercent = 55;
    } else if (smoker || vulnerabilities.includes("asthma")) {
        lungsStatus = "warning";
        capacityPercent = 72;
    }

    // --- Kidneys ---
    let kidneysStatus: "healthy" | "warning" | "critical" = "healthy";
    if (vulnerabilities.includes("diabetes") && vulnerabilities.includes("hypertension")) {
        kidneysStatus = "critical";
    } else if (vulnerabilities.includes("diabetes") || vulnerabilities.includes("kidney disease")) {
        kidneysStatus = "warning";
    }

    // --- Brain ---
    let brainStatus: "healthy" | "warning" | "critical" = "healthy";
    const stressLevel = lifestyle.stressLevel ?? 5;
    const sleep = lifestyle.sleepHours ?? 7;

    if (stressLevel > 8 || sleep < 5) {
        brainStatus = "critical";
    } else if (stressLevel > 6 || sleep < 6) {
        brainStatus = "warning";
    }

    // --- Stomach ---
    let stomachStatus: "healthy" | "warning" | "critical" = "healthy";
    const dietQuality = lifestyle.dietQuality || "fair";
    if (dietQuality === "poor" || vulnerabilities.includes("IBS")) {
        stomachStatus = "warning";
    }

    // --- Health Score Calculation ---
    const statusScore = { healthy: 100, warning: 55, critical: 20 };
    const organScores = [heartStatus, liverStatus, lungsStatus, kidneysStatus, brainStatus, stomachStatus]
        .map((s) => statusScore[s]);
    const baseScore = organScores.reduce((a, b) => a + b, 0) / organScores.length;

    // Bonus / penalty modifiers
    let modifier = 0;
    if (lifestyle.exerciseFrequency === "high") modifier += 5;
    if (dietQuality === "excellent") modifier += 5;
    if (sleep >= 8) modifier += 3;
    if (smoker) modifier -= 10;
    if (alcoholHigh) modifier -= 5;

    const healthScore = Math.min(100, Math.max(0, Math.round(baseScore + modifier)));

    return {
        healthScore,
        organs: {
            heart: { ...getOrganBase(heartStatus), bpm, pulseScale },
            liver: { ...getOrganBase(liverStatus), fatLevel: fatIntake },
            lungs: { ...getOrganBase(lungsStatus), capacityPercent },
            kidneys: getOrganBase(kidneysStatus),
            brain: { ...getOrganBase(brainStatus), stressLevel },
            stomach: getOrganBase(stomachStatus),
        },
    };
}

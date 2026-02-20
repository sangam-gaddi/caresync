"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart, Brain, Wind, Activity, Droplets, Flame,
    Zap, Moon, Shield, Gauge, ThermometerSun,
    TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { useOSStore } from "@/lib/store";

// ─── Types ───────────────────────────────────────────────────────────────────
interface HealthProfileData {
    age: number;
    weight: number;
    height: number;
    gender: string;
    bloodType: string;
    lifestyle: {
        smoker: boolean;
        alcoholConsumption: "none" | "low" | "moderate" | "high";
        exerciseFrequency: "none" | "low" | "moderate" | "high";
        dietQuality: "poor" | "fair" | "good" | "excellent";
        stressLevel: number;
        sleepHours: number;
        fatIntake: "low" | "moderate" | "high";
    };
    vulnerabilities: string[];
    currentIssues: { name: string; severity: string }[];
    medications: string[];
}

interface OrganData {
    status: string;
    color: string;
    bpm?: number;
    stressLevel?: number;
    capacityPercent?: number;
    fatLevel?: string;
}

// ─── Clinical Computations ───────────────────────────────────────────────────
function computeClinicalStats(profile: HealthProfileData, organs: Record<string, OrganData>) {
    const { age, weight, height, gender, lifestyle } = profile;
    const heightM = height / 100;

    // ── ANTHROPOMETRIC ──
    const bmi = weight / (heightM * heightM);
    const bmiCategory = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
    const bmiColor = bmi < 18.5 ? "#ffab40" : bmi < 25 ? "#00e676" : bmi < 30 ? "#ffab40" : "#ff1744";

    // BSA — Du Bois formula
    const bsa = 0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425);

    // BMR — Mifflin-St Jeor
    const bmr = gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    // Activity Multiplier
    const activityMultipliers: Record<string, number> = { none: 1.2, low: 1.375, moderate: 1.55, high: 1.725 };
    const tdee = bmr * (activityMultipliers[lifestyle.exerciseFrequency] || 1.375);

    // LBM — Boer formula
    const lbm = gender === "male"
        ? 0.407 * weight + 0.267 * height - 19.2
        : 0.252 * weight + 0.473 * height - 48.3;
    const lbmPercent = (lbm / weight) * 100;

    // ── HEMODYNAMIC ──
    const heartOrgan = organs.heart as OrganData & { bpm?: number };
    const rhr = heartOrgan?.bpm || 72;

    // Blood pressure estimation based on lifestyle
    let systolic = 120;
    let diastolic = 80;
    if (lifestyle.stressLevel > 7) { systolic += 12; diastolic += 8; }
    if (lifestyle.smoker) { systolic += 8; diastolic += 5; }
    if (lifestyle.exerciseFrequency === "high") { systolic -= 6; diastolic -= 4; }
    if (lifestyle.alcoholConsumption === "high") { systolic += 10; diastolic += 6; }
    if (bmi > 30) { systolic += 8; diastolic += 5; }
    if (age > 50) { systolic += 10; diastolic += 3; }

    // MAP = DBP + 1/3(SBP - DBP)
    const map = Math.round(diastolic + (systolic - diastolic) / 3);
    const mapStatus = map >= 70 && map <= 100 ? "Normal" : map < 70 ? "Low" : "Elevated";
    const mapColor = map >= 70 && map <= 100 ? "#00e676" : map < 70 ? "#ffab40" : "#ff1744";

    // SpO2 estimation
    const lungOrgan = organs.lungs as OrganData & { capacityPercent?: number };
    const spo2 = Math.min(100, Math.max(88, (lungOrgan?.capacityPercent || 90) + (lifestyle.smoker ? -3 : 0) + (lifestyle.exerciseFrequency === "high" ? 2 : 0)));

    // HRV (ms) - higher is better
    let hrv = 65 - (age * 0.3) + (lifestyle.exerciseFrequency === "high" ? 15 : lifestyle.exerciseFrequency === "moderate" ? 8 : 0);
    if (lifestyle.stressLevel > 7) hrv -= 12;
    if (lifestyle.sleepHours < 6) hrv -= 8;
    hrv = Math.max(20, Math.min(100, Math.round(hrv)));
    const hrvColor = hrv > 60 ? "#00e676" : hrv > 40 ? "#ffab40" : "#ff1744";

    // ── NEUROLOGICAL & ENDOCRINE ──
    const brainOrgan = organs.brain as OrganData & { stressLevel?: number };
    const brainStress = brainOrgan?.stressLevel || 3;

    // Allostatic Load (0-10 composite stress index)
    let allostaticLoad = 0;
    allostaticLoad += (lifestyle.stressLevel / 10) * 2.5;
    allostaticLoad += lifestyle.smoker ? 1.5 : 0;
    allostaticLoad += ({ none: 2, low: 1.5, moderate: 0.8, high: 0.3 }[lifestyle.exerciseFrequency] || 1);
    allostaticLoad += lifestyle.sleepHours < 6 ? 2 : lifestyle.sleepHours < 7 ? 1 : 0;
    allostaticLoad += ({ none: 0, low: 0.5, moderate: 1.2, high: 2 }[lifestyle.alcoholConsumption] || 0.5);
    allostaticLoad += bmi > 30 ? 1.5 : bmi > 25 ? 0.8 : 0;
    allostaticLoad = Math.min(10, Math.round(allostaticLoad * 10) / 10);
    const alColor = allostaticLoad < 3 ? "#00e676" : allostaticLoad < 6 ? "#ffab40" : "#ff1744";

    // CNS Fatigue (0-100, battery style, higher = more energy)
    let cnsFatigue = 100;
    cnsFatigue -= brainStress * 8;
    cnsFatigue -= lifestyle.stressLevel * 3;
    cnsFatigue -= lifestyle.sleepHours < 6 ? 25 : lifestyle.sleepHours < 7 ? 12 : 0;
    cnsFatigue += lifestyle.exerciseFrequency === "high" ? 10 : lifestyle.exerciseFrequency === "moderate" ? 5 : 0;
    cnsFatigue = Math.max(5, Math.min(100, Math.round(cnsFatigue)));
    const cnsColor = cnsFatigue > 60 ? "#00e676" : cnsFatigue > 30 ? "#ffab40" : "#ff1744";

    // Cortisol Index (relative 0-10)
    let cortisolIndex = lifestyle.stressLevel * 0.5 + (lifestyle.sleepHours < 6 ? 2.5 : lifestyle.sleepHours < 7 ? 1 : 0);
    if (lifestyle.exerciseFrequency === "high") cortisolIndex -= 1;
    cortisolIndex = Math.max(0, Math.min(10, Math.round(cortisolIndex * 10) / 10));

    // Sleep Quality Score (0-100)
    let sleepQuality = 100;
    sleepQuality -= Math.abs(lifestyle.sleepHours - 8) * 8;
    sleepQuality -= lifestyle.stressLevel * 3;
    sleepQuality -= lifestyle.smoker ? 10 : 0;
    sleepQuality -= ({ none: 0, low: 3, moderate: 8, high: 15 }[lifestyle.alcoholConsumption] || 0);
    sleepQuality = Math.max(10, Math.min(100, Math.round(sleepQuality)));

    // ── SYSTEMIC FILTRATION ──
    // Hydration Status
    let hydration = 75;
    if (lifestyle.exerciseFrequency === "high") hydration += 8;
    if (lifestyle.alcoholConsumption === "high") hydration -= 15;
    if (lifestyle.dietQuality === "excellent") hydration += 10;
    if (lifestyle.dietQuality === "poor") hydration -= 10;
    hydration = Math.max(30, Math.min(100, Math.round(hydration)));
    const hydrationColor = hydration > 70 ? "#00bcd4" : hydration > 50 ? "#ffab40" : "#ff1744";

    // Inflammatory Load (CRP-like index 0-10)
    let inflammatoryLoad = 1;
    if (bmi > 30) inflammatoryLoad += 2.5;
    else if (bmi > 25) inflammatoryLoad += 1;
    if (lifestyle.smoker) inflammatoryLoad += 2;
    if (lifestyle.dietQuality === "poor") inflammatoryLoad += 1.5;
    if (lifestyle.stressLevel > 7) inflammatoryLoad += 1.5;
    if (lifestyle.exerciseFrequency === "high") inflammatoryLoad -= 1;
    inflammatoryLoad = Math.max(0.5, Math.min(10, Math.round(inflammatoryLoad * 10) / 10));
    const inflColor = inflammatoryLoad < 3 ? "#00e676" : inflammatoryLoad < 6 ? "#ffab40" : "#ff1744";

    // Hepatic Function (0-100)
    const liverOrgan = organs.liver as OrganData & { fatLevel?: string };
    let hepaticFunction = 90;
    if (liverOrgan?.fatLevel === "high") hepaticFunction -= 30;
    else if (liverOrgan?.fatLevel === "moderate") hepaticFunction -= 15;
    if (lifestyle.alcoholConsumption === "high") hepaticFunction -= 20;
    else if (lifestyle.alcoholConsumption === "moderate") hepaticFunction -= 8;
    if (bmi > 30) hepaticFunction -= 10;
    hepaticFunction = Math.max(20, Math.min(100, Math.round(hepaticFunction)));

    // Renal Clearance (eGFR estimation — CKD-EPI simplified)
    let egfr = 120 - (age - 30) * 0.8;
    if (lifestyle.smoker) egfr -= 5;
    if (bmi > 30) egfr -= 8;
    egfr = Math.max(30, Math.min(130, Math.round(egfr)));

    // Metabolic Efficiency (0-100)
    let metabolicEff = 80;
    if (lifestyle.exerciseFrequency === "high") metabolicEff += 12;
    else if (lifestyle.exerciseFrequency === "moderate") metabolicEff += 5;
    else if (lifestyle.exerciseFrequency === "none") metabolicEff -= 15;
    if (lifestyle.dietQuality === "excellent") metabolicEff += 8;
    else if (lifestyle.dietQuality === "poor") metabolicEff -= 12;
    if (bmi > 30) metabolicEff -= 10;
    metabolicEff = Math.max(20, Math.min(100, Math.round(metabolicEff)));

    return {
        anthropometric: { bmi, bmiCategory, bmiColor, bsa, bmr, tdee, lbm, lbmPercent },
        hemodynamic: { rhr, systolic, diastolic, map, mapStatus, mapColor, spo2, hrv, hrvColor },
        neurological: { brainStress, allostaticLoad, alColor, cnsFatigue, cnsColor, cortisolIndex, sleepQuality },
        systemic: { hydration, hydrationColor, inflammatoryLoad, inflColor, hepaticFunction, egfr, metabolicEff },
    };
}

// ─── Visual Components ───────────────────────────────────────────────────────

// Circular Progress Ring
function CircularProgress({ value, max, size = 44, strokeWidth = 4, color, children }: {
    value: number; max: number; size?: number; strokeWidth?: number; color: string; children?: React.ReactNode;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(value / max, 1);
    const dashOffset = circumference * (1 - progress);

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke="currentColor" strokeWidth={strokeWidth} className="opacity-10" />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}

// MAP Gauge (arc gauge)
function MAPGauge({ value, isDarkMode }: { value: number; isDarkMode: boolean }) {
    const min = 50;
    const max = 130;
    const normalMin = 70;
    const normalMax = 100;
    const angle = ((value - min) / (max - min)) * 180 - 90;
    const inRange = value >= normalMin && value <= normalMax;
    const color = inRange ? "#00e676" : value < normalMin ? "#ffab40" : "#ff1744";

    return (
        <div className="relative flex flex-col items-center">
            <svg width="80" height="48" viewBox="0 0 80 48">
                {/* Background arc */}
                <path d="M 8 44 A 32 32 0 0 1 72 44" fill="none"
                    stroke={isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}
                    strokeWidth="6" strokeLinecap="round" />
                {/* Normal range highlight */}
                <path d={describeArc(40, 44, 32, -90 + ((normalMin - min) / (max - min)) * 180, -90 + ((normalMax - min) / (max - min)) * 180)}
                    fill="none" stroke={`${color}30`} strokeWidth="6" strokeLinecap="round" />
                {/* Needle */}
                <motion.line
                    x1="40" y1="44" x2="40" y2="16"
                    stroke={color} strokeWidth="2" strokeLinecap="round"
                    initial={{ rotate: -90, originX: "40px", originY: "44px" }}
                    animate={{ rotate: angle }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ transformOrigin: "40px 44px" }}
                />
                {/* Center dot */}
                <circle cx="40" cy="44" r="3" fill={color} />
                {/* Glow */}
                <circle cx="40" cy="44" r="5" fill={`${color}25`} />
            </svg>
            <div className="text-center -mt-1">
                <span className="text-sm font-black tabular-nums" style={{ color }}>{value}</span>
                <span className="text-[8px] ml-0.5" style={{ color: isDarkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>mmHg</span>
            </div>
        </div>
    );
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

// CNS Battery Meter
function BatteryMeter({ level, color, isDarkMode }: { level: number; color: string; isDarkMode: boolean }) {
    const segments = 5;
    const filledSegments = Math.ceil((level / 100) * segments);

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center">
                <div className="relative border rounded-[3px] p-[2px] flex gap-[1.5px]"
                    style={{ borderColor: isDarkMode ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.20)" }}>
                    {Array.from({ length: segments }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-[5px] h-[10px] rounded-[1px]"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: i < filledSegments ? 1 : 0.15,
                                backgroundColor: i < filledSegments ? color : (isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
                            }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                        />
                    ))}
                </div>
                <div className="w-[3px] h-[6px] rounded-r-[2px] ml-[1px]"
                    style={{ background: isDarkMode ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.20)" }} />
            </div>
            <span className="text-[11px] font-bold tabular-nums" style={{ color }}>{level}%</span>
        </div>
    );
}

// Stat Row Component
function StatRow({ icon, label, value, unit, color, subValue, isDarkMode }: {
    icon: React.ReactNode; label: string; value: string | number; unit?: string;
    color: string; subValue?: string; isDarkMode: boolean;
}) {
    const labelCol = isDarkMode ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.45)";
    const valueCol = isDarkMode ? "#ffffff" : "#1d1d1f";
    const subCol = isDarkMode ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)";

    return (
        <div className="flex items-center gap-2 py-1.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: `${color}18`, border: `1px solid ${color}25` }}>
                <span style={{ color }} className="flex items-center justify-center">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[9px] uppercase tracking-wider leading-none" style={{ color: labelCol }}>{label}</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-[12px] font-bold tabular-nums leading-none" style={{ color: valueCol }}>{value}</span>
                    {unit && <span className="text-[8px]" style={{ color: subCol }}>{unit}</span>}
                </div>
            </div>
            {subValue && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: `${color}15`, color }}>{subValue}</span>
            )}
        </div>
    );
}

// Panel Card
function PanelCard({ title, icon, accentColor, children, isDarkMode, delay = 0 }: {
    title: string; icon: React.ReactNode; accentColor: string;
    children: React.ReactNode; isDarkMode: boolean; delay?: number;
}) {
    const bg = isDarkMode ? "rgba(4,8,16,0.72)" : "rgba(255,255,255,0.65)";
    const border = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
    const titleCol = isDarkMode ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.55)";

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay }}
            className="rounded-2xl overflow-hidden"
            style={{
                background: bg,
                backdropFilter: "blur(24px) saturate(150%)",
                border: `1px solid ${border}`,
                boxShadow: isDarkMode
                    ? `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`
                    : `0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)`,
            }}
        >
            {/* Header accent line */}
            <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
            <div className="px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-2">
                    <span style={{ color: accentColor }}>{icon}</span>
                    <span className="text-[9px] uppercase tracking-[0.15em] font-semibold" style={{ color: titleCol }}>{title}</span>
                </div>
                {children}
            </div>
        </motion.div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ClinicalStats() {
    const { patientId, healthScore, avatarState, isDarkMode } = useOSStore();
    const [profile, setProfile] = useState<HealthProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [animateIn, setAnimateIn] = useState(false);

    const organs = (avatarState?.organs || {}) as Record<string, OrganData>;

    useEffect(() => {
        if (!patientId) {
            setLoading(false);
            return;
        }
        fetch(`/api/patients/${patientId}/health-profile`)
            .then((r) => r.json())
            .then((data) => {
                if (data.data) setProfile(data.data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [patientId]);

    useEffect(() => {
        const t = setTimeout(() => setAnimateIn(true), 300);
        return () => clearTimeout(t);
    }, []);

    const stats = useMemo(() => {
        if (!profile) return null;
        return computeClinicalStats(profile, organs);
    }, [profile, organs]);

    // Defaults when no profile is loaded
    const defaultProfile: HealthProfileData = {
        age: 28, weight: 72, height: 175, gender: "male", bloodType: "O+",
        lifestyle: {
            smoker: false, alcoholConsumption: "low", exerciseFrequency: "moderate",
            dietQuality: "good", stressLevel: 4, sleepHours: 7, fatIntake: "moderate",
        },
        vulnerabilities: [], currentIssues: [], medications: [],
    };

    const displayStats = stats || computeClinicalStats(defaultProfile, organs);
    const { anthropometric: a, hemodynamic: h, neurological: n, systemic: s } = displayStats;

    const hc = healthScore >= 80 ? "#00e676" : healthScore >= 60 ? "#ffab40" : "#ff1744";
    const label = healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : healthScore >= 40 ? "Fair" : "Critical";

    if (!animateIn) return null;

    return (
        <>
            {/* ── LEFT COLUMN: Health Score + Body Composition + Neuro-Endocrine ── */}
            <div
                className="absolute left-4 flex flex-col gap-2.5"
                style={{
                    top: "40px",
                    bottom: "78px",
                    width: "245px",
                    zIndex: 50,
                    pointerEvents: "auto",
                }}
            >
                {/* Health Score Hero */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: isDarkMode ? "rgba(4,8,16,0.80)" : "rgba(255,255,255,0.70)",
                        backdropFilter: "blur(24px) saturate(150%)",
                        border: `1px solid ${hc}25`,
                        boxShadow: `0 0 30px ${hc}12, 0 4px 24px rgba(0,0,0,0.3)`,
                    }}
                >
                    <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${hc}, ${hc}40, transparent)` }} />
                    <div className="px-4 py-3 flex items-center gap-3">
                        <CircularProgress value={healthScore} max={100} size={52} strokeWidth={4.5} color={hc}>
                            <span className="text-[14px] font-black tabular-nums" style={{ color: hc }}>
                                {healthScore}
                            </span>
                        </CircularProgress>
                        <div className="flex-1">
                            <div className="text-[9px] uppercase tracking-widest" style={{ color: isDarkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.40)" }}>
                                Health Score
                            </div>
                            <div className="text-[13px] font-bold mt-0.5" style={{ color: hc }}>{label}</div>
                            <div className="mt-1.5 w-full h-[3px] rounded-full overflow-hidden" style={{ background: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                                <motion.div
                                    className="h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${healthScore}%` }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    style={{ background: `linear-gradient(90deg, ${hc}90, ${hc})` }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Body Composition */}
                <PanelCard
                    title="Body Composition"
                    icon={<Activity className="w-3 h-3" />}
                    accentColor="#00e5ff"
                    isDarkMode={isDarkMode}
                    delay={0.1}
                >
                    <div className="flex items-center gap-2.5 mb-2.5">
                        <CircularProgress value={a.lbmPercent} max={100} size={42} strokeWidth={3.5} color="#00e5ff">
                            <span className="text-[9px] font-bold" style={{ color: "#00e5ff" }}>
                                {Math.round(a.lbmPercent)}%
                            </span>
                        </CircularProgress>
                        <div>
                            <div className="text-[9px]" style={{ color: isDarkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.40)" }}>Lean Body Mass</div>
                            <div className="text-[12px] font-bold" style={{ color: isDarkMode ? "#fff" : "#1d1d1f" }}>{a.lbm.toFixed(1)} kg</div>
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <StatRow icon={<Gauge className="w-3 h-3" />} label="BMI" value={a.bmi.toFixed(1)}
                            unit="kg/m²" color={a.bmiColor} subValue={a.bmiCategory} isDarkMode={isDarkMode} />
                        <StatRow icon={<Flame className="w-3 h-3" />} label="BMR" value={Math.round(a.bmr)}
                            unit="kcal/d" color="#ff9100" isDarkMode={isDarkMode} />
                        <StatRow icon={<Zap className="w-3 h-3" />} label="TDEE" value={Math.round(a.tdee)}
                            unit="kcal/d" color="#ffea00" isDarkMode={isDarkMode} />
                        <StatRow icon={<ThermometerSun className="w-3 h-3" />} label="BSA" value={a.bsa.toFixed(2)}
                            unit="m²" color="#e040fb" isDarkMode={isDarkMode} />
                    </div>
                </PanelCard>

                {/* Neuro-Endocrine */}
                <PanelCard
                    title="Neuro-Endocrine"
                    icon={<Brain className="w-3 h-3" />}
                    accentColor="#a855f7"
                    isDarkMode={isDarkMode}
                    delay={0.3}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-[9px] uppercase tracking-wider" style={{ color: isDarkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.40)" }}>
                            CNS Energy
                        </div>
                        <BatteryMeter level={n.cnsFatigue} color={n.cnsColor} isDarkMode={isDarkMode} />
                    </div>
                    <div className="space-y-0.5">
                        <StatRow icon={<Brain className="w-3 h-3" />} label="Brain Stress" value={n.brainStress}
                            unit="/10" color={n.brainStress <= 3 ? "#00e676" : n.brainStress <= 6 ? "#ffab40" : "#ff1744"} isDarkMode={isDarkMode} />
                        <StatRow icon={<Zap className="w-3 h-3" />} label="Allostatic Load" value={n.allostaticLoad}
                            unit="/10" color={n.alColor} subValue={n.allostaticLoad < 3 ? "Low" : n.allostaticLoad < 6 ? "Mod" : "High"} isDarkMode={isDarkMode} />
                        <StatRow icon={<ThermometerSun className="w-3 h-3" />} label="Cortisol Index" value={n.cortisolIndex}
                            unit="/10" color={n.cortisolIndex < 4 ? "#00e676" : n.cortisolIndex < 7 ? "#ffab40" : "#ff1744"} isDarkMode={isDarkMode} />
                        <StatRow icon={<Moon className="w-3 h-3" />} label="Sleep Quality" value={n.sleepQuality}
                            unit="/100" color={n.sleepQuality > 70 ? "#7c4dff" : n.sleepQuality > 45 ? "#ffab40" : "#ff1744"} isDarkMode={isDarkMode} />
                    </div>
                </PanelCard>
            </div>

            {/* ── RIGHT COLUMN: Trend + Cardiovascular + Systemic Health ── */}
            <div
                className="absolute right-4 flex flex-col gap-2.5"
                style={{
                    top: "40px",
                    bottom: "78px",
                    width: "245px",
                    zIndex: 50,
                    pointerEvents: "auto",
                }}
            >
                {/* Trend Indicator */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl px-4 py-3 flex items-center gap-3"
                    style={{
                        background: isDarkMode ? "rgba(4,8,16,0.65)" : "rgba(255,255,255,0.60)",
                        backdropFilter: "blur(20px) saturate(150%)",
                        border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
                        boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)",
                    }}
                >
                    {healthScore >= 70 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : healthScore >= 50 ? (
                        <Minus className="w-4 h-4 text-amber-400" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <div>
                        <div className="text-[9px] uppercase tracking-wider" style={{ color: isDarkMode ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>24h Trend</div>
                        <div className="text-[11px] font-semibold" style={{ color: healthScore >= 70 ? "#00e676" : healthScore >= 50 ? "#ffab40" : "#ff1744" }}>
                            {healthScore >= 70 ? "Improving" : healthScore >= 50 ? "Stable" : "Needs Attention"}
                        </div>
                    </div>
                    {!profile && (
                        <span className="text-[8px] ml-auto px-1.5 py-0.5 rounded-full"
                            style={{
                                background: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                                color: isDarkMode ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)",
                            }}>
                            Demo
                        </span>
                    )}
                </motion.div>

                {/* Cardiovascular */}
                <PanelCard
                    title="Cardiovascular"
                    icon={<Heart className="w-3 h-3" />}
                    accentColor="#ff4d6d"
                    isDarkMode={isDarkMode}
                    delay={0.2}
                >
                    <div className="flex items-start justify-between mb-1.5">
                        <div className="space-y-0.5">
                            <StatRow icon={<Heart className="w-3 h-3" />} label="Resting HR" value={h.rhr}
                                unit="BPM" color="#ff4d6d" isDarkMode={isDarkMode} />
                            <StatRow icon={<Activity className="w-3 h-3" />} label="Blood Pressure" value={`${h.systolic}/${h.diastolic}`}
                                unit="mmHg" color="#ff6d00" isDarkMode={isDarkMode} />
                        </div>
                        <MAPGauge value={h.map} isDarkMode={isDarkMode} />
                    </div>
                    <div className="flex items-center gap-2 pt-1.5" style={{ borderTop: `1px solid ${isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
                        <div className="flex-1">
                            <StatRow icon={<Wind className="w-3 h-3" />} label="SpO₂" value={Math.round(h.spo2)}
                                unit="%" color="#00e5ff" subValue={h.spo2 >= 95 ? "Normal" : "Low"} isDarkMode={isDarkMode} />
                        </div>
                        <div className="flex-1">
                            <StatRow icon={<Activity className="w-3 h-3" />} label="HRV" value={h.hrv}
                                unit="ms" color={h.hrvColor} isDarkMode={isDarkMode} />
                        </div>
                    </div>
                </PanelCard>

                {/* Systemic Health */}
                <PanelCard
                    title="Systemic Health"
                    icon={<Shield className="w-3 h-3" />}
                    accentColor="#00e676"
                    isDarkMode={isDarkMode}
                    delay={0.4}
                >
                    <div className="flex items-center gap-2.5 mb-2.5">
                        <CircularProgress value={s.metabolicEff} max={100} size={42} strokeWidth={3.5} color="#00e676">
                            <span className="text-[9px] font-bold" style={{ color: "#00e676" }}>
                                {s.metabolicEff}%
                            </span>
                        </CircularProgress>
                        <div>
                            <div className="text-[9px]" style={{ color: isDarkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.40)" }}>Metabolic Efficiency</div>
                            <div className="text-[12px] font-bold" style={{ color: s.metabolicEff > 70 ? "#00e676" : "#ffab40" }}>
                                {s.metabolicEff > 80 ? "Optimal" : s.metabolicEff > 60 ? "Good" : "Needs Attention"}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <StatRow icon={<Droplets className="w-3 h-3" />} label="Hydration" value={s.hydration}
                            unit="%" color={s.hydrationColor} subValue={s.hydration > 70 ? "Good" : "Low"} isDarkMode={isDarkMode} />
                        <StatRow icon={<Flame className="w-3 h-3" />} label="Inflammatory Load" value={s.inflammatoryLoad}
                            unit="/10" color={s.inflColor} isDarkMode={isDarkMode} />
                        <StatRow icon={<Activity className="w-3 h-3" />} label="Hepatic Function" value={s.hepaticFunction}
                            unit="/100" color={s.hepaticFunction > 70 ? "#00e676" : s.hepaticFunction > 45 ? "#ffab40" : "#ff1744"} isDarkMode={isDarkMode} />
                        <StatRow icon={<Droplets className="w-3 h-3" />} label="Renal eGFR" value={s.egfr}
                            unit="mL/min" color={s.egfr > 90 ? "#00e676" : s.egfr > 60 ? "#ffab40" : "#ff1744"}
                            subValue={s.egfr > 90 ? "Normal" : s.egfr > 60 ? "Mild↓" : "Reduced"} isDarkMode={isDarkMode} />
                    </div>
                </PanelCard>
            </div>
        </>
    );
}

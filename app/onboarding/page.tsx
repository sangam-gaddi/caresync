"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight, ChevronLeft, Activity,
    Shield, CheckCircle, Loader2
} from "lucide-react";


const STEPS = ["Personal Info", "Health Profile", "Lifestyle", "Review"];

const VULNERABILITIES = [
    "Diabetes", "Hypertension", "Heart Disease", "Asthma", "Obesity",
    "Kidney Disease", "Liver Disease", "IBS", "Anxiety", "Depression",
    "Arthritis", "Sleep Apnea",
];

const CURRENT_ISSUES = [
    "Chest Pain", "Shortness of Breath", "Fatigue", "Headaches",
    "Joint Pain", "Back Pain", "Digestive Issues", "High Stress", "Insomnia",
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        age: "",
        gender: "male",
        weight: "",
        height: "",
        bloodType: "Unknown",
        vulnerabilities: [] as string[],
        currentIssues: [] as { name: string; severity: string }[],
        medications: "",
        lifestyle: {
            smoker: false,
            alcoholConsumption: "none",
            exerciseFrequency: "low",
            dietQuality: "fair",
            stressLevel: 5,
            sleepHours: 7,
            fatIntake: "moderate",
        },
    });

    const toggleItem = (list: string[], item: string) =>
        list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

    const toggleIssue = (issue: string) => {
        const existing = formData.currentIssues.find((i) => i.name === issue);
        if (existing) {
            setFormData({ ...formData, currentIssues: formData.currentIssues.filter((i) => i.name !== issue) });
        } else {
            setFormData({ ...formData, currentIssues: [...formData.currentIssues, { name: issue, severity: "mild" }] });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/patients/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    age: parseInt(formData.age),
                    weight: parseFloat(formData.weight),
                    height: parseFloat(formData.height),
                    medications: formData.medications ? formData.medications.split(",").map((m) => m.trim()) : [],
                }),
            });
            const data = await res.json();
            if (data.redirect) {
                router.push(data.redirect);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{
                background: "radial-gradient(ellipse at 30% 40%, rgba(0,229,255,0.08) 0%, transparent 60%), #080c14",
            }}
        >
            {/* Grid bg */}
            <div className="absolute inset-0 bg-os-grid opacity-30 pointer-events-none" />

            <div className="relative z-10 w-full max-w-lg px-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-black text-white">HealthOS</span>
                    </div>
                    <p className="text-white/40 text-sm">Patient Onboarding</p>
                </div>

                {/* Step progress */}
                <div className="flex items-center justify-between mb-6 px-2">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${i < step
                                    ? "bg-green-500 text-white"
                                    : i === step
                                        ? "bg-cyan-500 text-white"
                                        : "bg-[#1e2a3a] text-white/40"
                                    }`}
                            >
                                {i < step ? <CheckCircle className="w-3 h-3" /> : i + 1}
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`h-px w-16 mx-1 transition-all duration-500 ${i < step ? "bg-green-500" : "bg-[#1e2a3a]"}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="os-glass rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                    <h2 className="text-lg font-bold text-white mb-1">{STEPS[step]}</h2>
                    <p className="text-white/40 text-xs mb-5">
                        {step === 0 && "Tell us about yourself"}
                        {step === 1 && "Help us understand your health background"}
                        {step === 2 && "Your daily lifestyle habits"}
                        {step === 3 && "Review and launch your HealthOS"}
                    </p>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            {/* Step 0: Personal Info */}
                            {step === 0 && (
                                <div className="space-y-3">
                                    <input
                                        className="w-full bg-[#0d1421] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none focus:border-cyan-500/50 transition-colors"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <input
                                        type="email"
                                        className="w-full bg-[#0d1421] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none focus:border-cyan-500/50 transition-colors"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            type="number"
                                            className="bg-[#0d1421] border border-[#1e2a3a] rounded-xl px-3 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none focus:border-cyan-500/50 transition-colors"
                                            placeholder="Age"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            className="bg-[#0d1421] border border-[#1e2a3a] rounded-xl px-3 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none focus:border-cyan-500/50 transition-colors"
                                            placeholder="Weight (kg)"
                                            value={formData.weight}
                                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            className="bg-[#0d1421] border border-[#1e2a3a] rounded-xl px-3 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none focus:border-cyan-500/50 transition-colors"
                                            placeholder="Height (cm)"
                                            value={formData.height}
                                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            className="bg-[#0d1421] border border-[#1e2a3a] rounded-xl px-3 py-2.5 text-sm text-white/90 outline-none"
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <select
                                            className="bg-[#0d1421] border border-[#1e2a3a] rounded-xl px-3 py-2.5 text-sm text-white/90 outline-none"
                                            value={formData.bloodType}
                                            onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                        >
                                            {["Unknown", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bt => (
                                                <option key={bt} value={bt}>{bt === "Unknown" ? "Blood Type" : bt}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Step 1: Vulnerabilities & Issues */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-white/50 mb-2">Known Conditions / Vulnerabilities</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {VULNERABILITIES.map((v) => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, vulnerabilities: toggleItem(formData.vulnerabilities, v) })}
                                                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 ${formData.vulnerabilities.includes(v)
                                                        ? "bg-amber-500/30 border border-amber-500/50 text-amber-300"
                                                        : "bg-[#0d1421] border border-[#1e2a3a] text-white/50 hover:border-white/20"
                                                        }`}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/50 mb-2">Current Symptoms / Issues</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {CURRENT_ISSUES.map((issue) => (
                                                <button
                                                    key={issue}
                                                    type="button"
                                                    onClick={() => toggleIssue(issue)}
                                                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 ${formData.currentIssues.some((i) => i.name === issue)
                                                        ? "bg-red-500/30 border border-red-500/50 text-red-300"
                                                        : "bg-[#0d1421] border border-[#1e2a3a] text-white/50 hover:border-white/20"
                                                        }`}
                                                >
                                                    {issue}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <input
                                        className="w-full bg-[#0d1421] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none focus:border-cyan-500/50"
                                        placeholder="Current medications (comma-separated)"
                                        value={formData.medications}
                                        onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* Step 2: Lifestyle */}
                            {step === 2 && (
                                <div className="space-y-3">
                                    {[
                                        { label: "Alcohol Consumption", key: "alcoholConsumption", options: ["none", "low", "moderate", "high"] },
                                        { label: "Exercise Frequency", key: "exerciseFrequency", options: ["none", "low", "moderate", "high"] },
                                        { label: "Diet Quality", key: "dietQuality", options: ["poor", "fair", "good", "excellent"] },
                                        { label: "Fat Intake", key: "fatIntake", options: ["low", "moderate", "high"] },
                                    ].map(({ label, key, options }) => (
                                        <div key={key}>
                                            <p className="text-[11px] text-white/40 mb-1">{label}</p>
                                            <div className="flex gap-1.5">
                                                {options.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, [key]: opt } })}
                                                        className={`flex-1 py-1.5 rounded-lg text-[11px] capitalize transition-colors ${(formData.lifestyle as Record<string, unknown>)[key] === opt
                                                            ? "bg-cyan-500/30 border border-cyan-500/50 text-cyan-300"
                                                            : "bg-[#0d1421] border border-[#1e2a3a] text-white/50"
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-[11px] text-white/40 mb-1">Stress Level: {formData.lifestyle.stressLevel}/10</p>
                                            <input
                                                type="range" min={1} max={10}
                                                value={formData.lifestyle.stressLevel}
                                                onChange={(e) => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, stressLevel: parseInt(e.target.value) } })}
                                                className="w-full accent-cyan-400"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-white/40 mb-1">Sleep Hours: {formData.lifestyle.sleepHours}h</p>
                                            <input
                                                type="range" min={3} max={12}
                                                value={formData.lifestyle.sleepHours}
                                                onChange={(e) => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, sleepHours: parseInt(e.target.value) } })}
                                                className="w-full accent-cyan-400"
                                            />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div
                                            className={`w-10 h-6 rounded-full transition-colors duration-200 relative ${formData.lifestyle.smoker ? "bg-red-500" : "bg-[#1e2a3a]"}`}
                                            onClick={() => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, smoker: !formData.lifestyle.smoker } })}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${formData.lifestyle.smoker ? "translate-x-5" : "translate-x-1"}`} />
                                        </div>
                                        <span className="text-sm text-white/70">Current Smoker</span>
                                    </label>
                                </div>
                            )}

                            {/* Step 3: Review */}
                            {step === 3 && (
                                <div className="space-y-3">
                                    {[
                                        { label: "Name", value: formData.name },
                                        { label: "Email", value: formData.email },
                                        { label: "Age / Gender", value: `${formData.age} years, ${formData.gender}` },
                                        { label: "Weight / Height", value: `${formData.weight}kg / ${formData.height}cm` },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-center py-2 border-b border-[#1e2a3a]">
                                            <span className="text-xs text-white/40">{label}</span>
                                            <span className="text-xs text-white/80 font-medium">{value || "—"}</span>
                                        </div>
                                    ))}
                                    {formData.vulnerabilities.length > 0 && (
                                        <div className="py-2 border-b border-[#1e2a3a]">
                                            <p className="text-xs text-white/40 mb-1.5">Conditions</p>
                                            <div className="flex flex-wrap gap-1">
                                                {formData.vulnerabilities.map((v) => (
                                                    <span key={v} className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">{v}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-green-400" />
                                            <p className="text-xs text-green-300">Your data is HIPAA-compliant and encrypted</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between mt-6">
                        {step > 0 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#1e2a3a] text-white/60 text-sm hover:text-white hover:border-white/20 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                        ) : <div />}

                        {step < STEPS.length - 1 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={step === 0 && (!formData.name || !formData.email)}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 text-white text-sm font-bold hover:from-green-400 hover:to-cyan-400 transition-all disabled:opacity-60"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Launching...</>
                                ) : (
                                    <><Activity className="w-4 h-4" /> Launch HealthOS</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

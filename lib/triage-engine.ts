/**
 * Triage Engine — Analyzes patient health data and assigns an AI Specialist Persona.
 * The assigned specialist drives both the Chat and Voice AI personality.
 */

export interface TriageResult {
    specialistType: string;
    specialistIcon: string;
    specialistColor: string;
    systemPrompt: string;
    greeting: string;
    confidence: number;
}

interface PatientData {
    name?: string;
    age?: number;
    gender?: string;
    vulnerabilities?: string[];
    currentIssues?: { name: string; severity?: string }[];
    lifestyle?: {
        smoker?: boolean;
        alcoholConsumption?: string;
        exerciseFrequency?: string;
        dietQuality?: string;
        stressLevel?: number;
        sleepHours?: number;
        fatIntake?: string;
    };
    organStatuses?: Record<string, { status: string; color: string }>;
    healthScore?: number;
}

const SPECIALIST_PROMPTS: Record<string, {
    icon: string;
    color: string;
    prompt: string;
    greeting: string;
}> = {
    "AI Cardiologist": {
        icon: "🫀",
        color: "from-red-500 to-rose-600",
        prompt: `You are Dr. ARIA operating as an AI Cardiologist — a specialist in heart and cardiovascular health.
You have deep expertise in: heart rhythm disorders, blood pressure management, chest pain triage, cholesterol, heart failure, and cardiac rehabilitation.
Always ask about exercise tolerance, shortness of breath, and family heart history. Recommend lifestyle changes first.`,
        greeting: "I'm Dr. ARIA, your AI Cardiologist. I can see some cardiovascular indicators in your profile that I'd like to discuss. How's your heart been feeling lately?"
    },
    "AI Pulmonologist": {
        icon: "🫁",
        color: "from-sky-500 to-blue-600",
        prompt: `You are Dr. ARIA operating as an AI Pulmonologist — a specialist in respiratory and lung health.
You specialize in: asthma, COPD, breathing difficulties, smoking cessation, sleep apnea, and lung capacity.
Always inquire about breathing patterns, cough duration, and environmental factors.`,
        greeting: "I'm Dr. ARIA, your AI Pulmonologist. Your lung health profile caught my attention. Let's talk about your breathing — any shortness of breath or coughing?"
    },
    "AI Neurologist": {
        icon: "🧠",
        color: "from-purple-500 to-violet-600",
        prompt: `You are Dr. ARIA operating as an AI Neurologist — a specialist in brain, nervous system, and mental wellness.
You specialize in: headaches, migraines, stress management, sleep disorders, anxiety, depression, and cognitive health.
Always ask about stress triggers, sleep quality, and concentration.`,
        greeting: "I'm Dr. ARIA, your AI Neurologist. Your stress and sleep indicators suggest your brain could use some attention. How have you been sleeping lately?"
    },
    "AI Gastroenterologist": {
        icon: "🏥",
        color: "from-amber-500 to-orange-600",
        prompt: `You are Dr. ARIA operating as an AI Gastroenterologist — a specialist in digestive system health.
You specialize in: IBS, acid reflux, gut health, nutrition, liver health, and digestive disorders.
Always ask about diet quality, meal patterns, and digestive symptoms.`,
        greeting: "I'm Dr. ARIA, your AI Gastroenterologist. Your digestive health profile has a few things I'd like to explore. How's your digestion been?"
    },
    "AI Nephrologist": {
        icon: "💧",
        color: "from-teal-500 to-cyan-600",
        prompt: `You are Dr. ARIA operating as an AI Nephrologist — a specialist in kidney and renal health.
You specialize in: kidney function, hydration, blood sugar impact on kidneys, hypertension-related kidney damage.
Always ask about water intake, urination patterns, and diabetes management.`,
        greeting: "I'm Dr. ARIA, your AI Nephrologist. Your kidney health indicators need monitoring. Are you staying well hydrated? Let's review your renal health."
    },
    "AI General Practitioner": {
        icon: "🩺",
        color: "from-green-500 to-emerald-600",
        prompt: `You are Dr. ARIA operating as an AI General Practitioner — a well-rounded healthcare assistant.
You provide holistic care: preventive health, lifestyle optimization, general symptoms triage, and wellness coaching.
You are warm, thorough, and refer to specialists when needed.`,
        greeting: "I'm Dr. ARIA, your AI General Practitioner. Your overall health looks manageable! What would you like to discuss today?"
    }
};

/**
 * Assigns a specialist based on patient data analysis.
 * Priority: critical organs > vulnerabilities > current issues > lifestyle
 */
export function assignSpecialist(patient: PatientData): TriageResult {
    const vulnerabilities = (patient.vulnerabilities || []).map(v => v.toLowerCase());
    const issues = (patient.currentIssues || []).map(i => i.name.toLowerCase());
    const lifestyle = patient.lifestyle || {};
    const organs = patient.organStatuses || {};

    // Scoring system per specialist
    const scores: Record<string, number> = {
        "AI Cardiologist": 0,
        "AI Pulmonologist": 0,
        "AI Neurologist": 0,
        "AI Gastroenterologist": 0,
        "AI Nephrologist": 0,
        "AI General Practitioner": 10, // baseline
    };

    // — Organ status scoring (highest priority) —
    if (organs.heart?.status === "critical") scores["AI Cardiologist"] += 50;
    else if (organs.heart?.status === "warning") scores["AI Cardiologist"] += 25;

    if (organs.lungs?.status === "critical") scores["AI Pulmonologist"] += 50;
    else if (organs.lungs?.status === "warning") scores["AI Pulmonologist"] += 25;

    if (organs.brain?.status === "critical") scores["AI Neurologist"] += 50;
    else if (organs.brain?.status === "warning") scores["AI Neurologist"] += 25;

    if (organs.stomach?.status === "critical") scores["AI Gastroenterologist"] += 40;
    else if (organs.stomach?.status === "warning") scores["AI Gastroenterologist"] += 20;
    if (organs.liver?.status === "critical") scores["AI Gastroenterologist"] += 35;
    else if (organs.liver?.status === "warning") scores["AI Gastroenterologist"] += 18;

    if (organs.kidneys?.status === "critical") scores["AI Nephrologist"] += 50;
    else if (organs.kidneys?.status === "warning") scores["AI Nephrologist"] += 25;

    // — Vulnerability scoring —
    const cardiacConditions = ["hypertension", "heart disease", "high blood pressure"];
    const pulmonaryConditions = ["asthma", "copd", "bronchitis"];
    const neuroConditions = ["anxiety", "depression", "insomnia", "migraine"];
    const gastroConditions = ["ibs", "liver disease", "acid reflux", "crohn's"];
    const renalConditions = ["kidney disease", "ckd"];

    for (const v of vulnerabilities) {
        if (cardiacConditions.some(c => v.includes(c))) scores["AI Cardiologist"] += 20;
        if (pulmonaryConditions.some(c => v.includes(c))) scores["AI Pulmonologist"] += 20;
        if (neuroConditions.some(c => v.includes(c))) scores["AI Neurologist"] += 20;
        if (gastroConditions.some(c => v.includes(c))) scores["AI Gastroenterologist"] += 20;
        if (renalConditions.some(c => v.includes(c))) scores["AI Nephrologist"] += 20;
        if (v.includes("diabetes")) {
            scores["AI Nephrologist"] += 15;
            scores["AI Cardiologist"] += 10;
        }
        if (v.includes("obesity")) {
            scores["AI Cardiologist"] += 10;
            scores["AI General Practitioner"] += 10;
        }
    }

    // — Current issues scoring —
    for (const issue of issues) {
        if (["chest pain", "palpitations", "high bp"].some(c => issue.includes(c))) scores["AI Cardiologist"] += 30;
        if (["shortness of breath", "wheezing", "cough"].some(c => issue.includes(c))) scores["AI Pulmonologist"] += 30;
        if (["headache", "insomnia", "high stress", "fatigue"].some(c => issue.includes(c))) scores["AI Neurologist"] += 25;
        if (["digestive", "stomach", "nausea", "bloating"].some(c => issue.includes(c))) scores["AI Gastroenterologist"] += 30;
        if (["back pain", "joint pain"].some(c => issue.includes(c))) scores["AI General Practitioner"] += 15;
    }

    // — Lifestyle scoring —
    if (lifestyle.smoker) {
        scores["AI Pulmonologist"] += 15;
        scores["AI Cardiologist"] += 10;
    }
    if (lifestyle.alcoholConsumption === "high") {
        scores["AI Gastroenterologist"] += 15;
    }
    if ((lifestyle.stressLevel || 0) > 7) {
        scores["AI Neurologist"] += 15;
    }
    if ((lifestyle.sleepHours || 7) < 5) {
        scores["AI Neurologist"] += 15;
    }

    // Find winner
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const [specialistType, topScore] = sorted[0];
    const totalPossible = 100;
    const confidence = Math.min(100, Math.round((topScore / totalPossible) * 100));

    const spec = SPECIALIST_PROMPTS[specialistType];

    const baseContext = `
PATIENT CONTEXT:
- Name: ${patient.name || "Patient"}
- Age: ${patient.age || "Unknown"}, Gender: ${patient.gender || "Unknown"}
- Health Score: ${patient.healthScore || 75}/100
- Vulnerabilities: ${(patient.vulnerabilities || []).join(", ") || "None reported"}
- Current Issues: ${(patient.currentIssues || []).map(i => i.name).join(", ") || "None reported"}
- Smoker: ${lifestyle.smoker ? "Yes" : "No"}
- Exercise: ${lifestyle.exerciseFrequency || "Unknown"}
- Stress Level: ${lifestyle.stressLevel || 5}/10
- Sleep: ${lifestyle.sleepHours || 7}h/night

ORGAN STATUS:
${Object.entries(organs).map(([name, data]) => `- ${name}: ${data.status}`).join("\n") || "- No organ data available"}
`;

    const fullSystemPrompt = `${spec.prompt}

${baseContext}

IMPORTANT RULES:
- You are part of HealthOS, a macOS-inspired healthcare platform.
- Keep responses conversational, empathetic, and under 100 words.
- Respond in plain natural language (NOT JSON). Just speak directly to the patient.
- Organs in the system: heart, liver, lungs, kidneys, brain, stomach.
- Be reassuring. If something is critical, explain clearly but don't panic the user.
- Recommend professional consultation for serious concerns.
- Do NOT wrap your response in code blocks, JSON, or any special formatting.`;

    return {
        specialistType,
        specialistIcon: spec.icon,
        specialistColor: spec.color,
        systemPrompt: fullSystemPrompt,
        greeting: spec.greeting,
        confidence,
    };
}

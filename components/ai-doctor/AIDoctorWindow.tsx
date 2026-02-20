"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mic, MicOff, Send, Stethoscope, MessageSquare, Phone,
    Loader2, ArrowLeft, ChevronDown, Volume2, VolumeX, Sparkles
} from "lucide-react";
import { useOSStore } from "@/lib/store";
import type { TriageResult } from "@/lib/triage-engine";

// ─────────────────────────────────────────────────────────────────
// VOICE WAVEFORM (ported from BEC BillDesk)
// ─────────────────────────────────────────────────────────────────
function VoiceWaveform({ isActive, isSpeaking, size = "md" }: {
    isActive: boolean;
    isSpeaking: boolean;
    size?: "sm" | "md" | "lg";
}) {
    const barCount = 5;
    const cfg = { sm: { h: 16, w: 3, g: 2 }, md: { h: 24, w: 4, g: 3 }, lg: { h: 32, w: 5, g: 4 } }[size];
    const color = isSpeaking ? "#22c55e" : "#a855f7";

    return (
        <div className="flex items-center justify-center" style={{ gap: cfg.g, height: cfg.h }}>
            {Array.from({ length: barCount }).map((_, i) => (
                <motion.div
                    key={i}
                    className="rounded-full"
                    style={{ width: cfg.w, backgroundColor: color }}
                    animate={isActive ? {
                        height: [cfg.h * 0.3, cfg.h * (0.5 + Math.random() * 0.5), cfg.h * 0.3],
                        opacity: [0.7, 1, 0.7],
                    } : { height: cfg.h * 0.2, opacity: 0.3 }}
                    transition={isActive ? {
                        duration: 0.5 + Math.random() * 0.3,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.1,
                        ease: "easeInOut",
                    } : { duration: 0.3 }}
                />
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// MODEL SELECTOR DROPDOWN
// ─────────────────────────────────────────────────────────────────
const AVAILABLE_MODELS = [
    { id: "auto", label: "Auto (Waterfall)", desc: "Tries models in order" },
    { id: "google/gemma-3-27b-it:free", label: "Gemma 3 27B", desc: "Google" },
    { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B", desc: "Meta" },
    { id: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small 3.1", desc: "Mistral" },
    { id: "nousresearch/hermes-3-llama-3.1-405b:free", label: "Hermes 3 405B", desc: "NousResearch" },
    { id: "deepseek/deepseek-r1-0528:free", label: "DeepSeek R1", desc: "DeepSeek" },
    { id: "openai/gpt-oss-120b:free", label: "GPT-OSS 120B", desc: "OpenAI" },
    { id: "nvidia/nemotron-nano-9b-v2:free", label: "Nemotron 9B", desc: "NVIDIA" },
];

function ModelSelector({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
    const [open, setOpen] = useState(false);
    const current = AVAILABLE_MODELS.find(m => m.id === selected) || AVAILABLE_MODELS[0];

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/60 hover:text-white/80 hover:border-white/20 transition-all"
            >
                <Sparkles className="w-3 h-3" />
                {current.label}
                <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute right-0 top-8 w-56 rounded-xl py-1 shadow-2xl z-50"
                        style={{ background: "rgba(12,18,32,0.96)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                        <p className="text-[9px] text-white/25 px-3 py-1 uppercase tracking-widest">AI Model</p>
                        {AVAILABLE_MODELS.map(m => (
                            <button
                                key={m.id}
                                onClick={() => { onSelect(m.id); setOpen(false); }}
                                className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-white/5 transition-colors flex items-center justify-between ${selected === m.id ? "text-cyan-400" : "text-white/70"}`}
                            >
                                <span>{m.label}</span>
                                <span className="text-[9px] text-white/30">{m.desc}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// TRIAGE SCREEN — Assigns specialist, then user picks Chat/Voice
// ─────────────────────────────────────────────────────────────────
function TriageScreen({ onSelectMode, triage, loading }: {
    onSelectMode: (mode: "chat" | "voice") => void;
    triage: TriageResult | null;
    loading: boolean;
}) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                    <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                    <p className="text-sm text-white font-semibold">Analyzing your health data...</p>
                    <p className="text-[11px] text-white/40 mt-1">Running AI triage to assign your specialist</p>
                </div>
                <div className="flex gap-1 mt-2">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!triage) return null;

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 gap-5">
            {/* Specialist Badge */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="text-center"
            >
                <div className={`mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br ${triage.specialistColor} flex items-center justify-center text-4xl shadow-lg mb-3`}>
                    {triage.specialistIcon}
                </div>
                <h2 className="text-lg font-bold text-white">{triage.specialistType}</h2>
                <p className="text-[11px] text-white/40 mt-1">
                    Confidence: {triage.confidence}% match based on your health profile
                </p>
            </motion.div>

            {/* Greeting */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-sm text-center"
            >
                <p className="text-sm text-white/70 leading-relaxed italic">&ldquo;{triage.greeting}&rdquo;</p>
            </motion.div>

            {/* Mode Selection */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3 w-full max-w-xs"
            >
                <button
                    onClick={() => onSelectMode("chat")}
                    className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">Chat</p>
                        <p className="text-[10px] text-white/40">Text consultation</p>
                    </div>
                </button>

                <button
                    onClick={() => onSelectMode("voice")}
                    className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">Voice</p>
                        <p className="text-[10px] text-white/40">Speak with ARIA</p>
                    </div>
                </button>
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// CHAT INTERFACE — OpenRouter powered
// ─────────────────────────────────────────────────────────────────
interface Message {
    role: "user" | "doctor";
    text: string;
    timestamp: Date;
}

function ChatInterface({ triage, onBack }: {
    triage: TriageResult;
    onBack: () => void;
}) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "doctor", text: triage.greeting, timestamp: new Date() },
    ]);
    const [inputText, setInputText] = useState("");
    const [typing, setTyping] = useState(false);
    const [listening, setListening] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [selectedModel, setSelectedModel] = useState("auto");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    const { patientId, avatarState, healthScore, showIslandNotification, setAiThinking } = useOSStore();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;
        setInputText("");

        const userMsg: Message = { role: "user", text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setTyping(true);
        setAiThinking(true);

        try {
            const res = await fetch("/api/ai-doctor/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMsg].map(m => ({ role: m.role, text: m.text })),
                    systemPrompt: triage.systemPrompt,
                    specialistType: triage.specialistType,
                    selectedModel: selectedModel === "auto" ? undefined : selectedModel,
                    patientContext: { patientId, healthScore, organSummary: avatarState?.organs },
                }),
            });

            const data = await res.json();
            setAiThinking(false);
            setTyping(false);

            const doctorResponse = data.response || "I'm analyzing your health data. Could you tell me more?";
            setMessages(prev => [...prev, { role: "doctor", text: doctorResponse, timestamp: new Date() }]);

            // Dynamic Island notification
            if (data.ui_command?.message) {
                showIslandNotification({
                    id: Date.now().toString(),
                    message: data.ui_command.message,
                    type: "ai",
                    icon: "ai",
                });
            }

            // TTS
            if (ttsEnabled && typeof window !== "undefined" && window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(doctorResponse);
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.volume = 0.8;
                const voices = speechSynthesis.getVoices();
                const preferred = voices.find(v => v.name.includes("Google") || v.name.includes("Female") || v.lang === "en-US");
                if (preferred) utterance.voice = preferred;
                window.speechSynthesis.speak(utterance);
            }
        } catch {
            setAiThinking(false);
            setTyping(false);
            setMessages(prev => [...prev, {
                role: "doctor",
                text: "I'm having trouble connecting to my AI systems. All free models may be busy — please try again in a moment.",
                timestamp: new Date(),
            }]);
        }
    }, [messages, triage, patientId, avatarState, healthScore, showIslandNotification, setAiThinking, ttsEnabled, selectedModel]);

    const startListening = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        const SpeechRecognitionAPI = w.webkitSpeechRecognition || w.SpeechRecognition;
        if (!SpeechRecognitionAPI) {
            alert("Voice input not supported. Please use Chrome.");
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript.trim()) sendMessage(transcript);
        };
        recognition.onend = () => setListening(false);
        recognition.onerror = () => setListening(false);
        recognitionRef.current = recognition;
        recognition.start();
        setListening(true);
    }, [sendMessage]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setListening(false);
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#080c14]">
            {/* Header */}
            <div className="flex items-center gap-2 p-3 border-b border-[#1e2a3a]">
                <button onClick={onBack} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors">
                    <ArrowLeft className="w-4 h-4 text-white/50" />
                </button>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${triage.specialistColor} flex items-center justify-center text-lg`}>
                    {triage.specialistIcon}
                </div>
                <div className="flex-1">
                    <h3 className="text-xs font-semibold text-white">{triage.specialistType}</h3>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[9px] text-white/40">Dr. ARIA · Online</span>
                    </div>
                </div>
                <button onClick={() => setTtsEnabled(!ttsEnabled)} className="mr-1 text-white/30 hover:text-white/60 transition-colors" title={ttsEnabled ? "Mute TTS" : "Enable TTS"}>
                    {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                <ModelSelector selected={selectedModel} onSelect={setSelectedModel} />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "doctor" && (
                                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${triage.specialistColor} flex items-center justify-center mr-1.5 flex-shrink-0 mt-1 text-[10px]`}>
                                    {triage.specialistIcon}
                                </div>
                            )}
                            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${msg.role === "user"
                                ? "bg-cyan-500/20 border border-cyan-500/30 text-white ml-3"
                                : "bg-[#0d1421] border border-[#1e2a3a] text-white/90"
                                }`}>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {typing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${triage.specialistColor} flex items-center justify-center mr-1.5 text-[10px]`}>
                            {triage.specialistIcon}
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-[#0d1421] border border-[#1e2a3a]">
                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[#1e2a3a]">
                <AnimatePresence>
                    {listening && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-center gap-2 mb-2 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20"
                        >
                            <div className="flex gap-[3px] items-center">
                                {[0, 1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-[3px] bg-purple-400 rounded-full waveform-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                                ))}
                            </div>
                            <span className="text-[11px] text-purple-300 font-medium">Listening...</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
                        placeholder={`Ask your ${triage.specialistType}...`}
                        className="flex-1 bg-[#0d1421] border border-[#1e2a3a] rounded-xl px-3 py-2 text-sm text-white/90 placeholder-white/30 outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <button
                        onClick={() => listening ? stopListening() : startListening()}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${listening
                            ? "bg-red-500/20 border border-red-500/40 text-red-400"
                            : "bg-purple-500/20 border border-purple-500/40 text-purple-400 hover:bg-purple-500/30"}`}
                    >
                        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => sendMessage(inputText)}
                        disabled={!inputText.trim() || typing}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-40 transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// VOICE INTERFACE — LiveKit powered (ported from BEC BillDesk)
// ─────────────────────────────────────────────────────────────────
function VoiceInterface({ triage, onBack }: {
    triage: TriageResult;
    onBack: () => void;
}) {
    const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
    const [isMuted, setIsMuted] = useState(false);
    const [agentSpeaking, setAgentSpeaking] = useState(false);
    const [userSpeaking, setUserSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [voiceConfigured, setVoiceConfigured] = useState<boolean | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roomRef = useRef<any>(null);

    const { patientId, patientName } = useOSStore();

    // Check if voice is configured
    useEffect(() => {
        fetch("/api/ai-doctor/voice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId, patientName: patientName || "Patient", specialistType: triage.specialistType }),
        })
            .then(r => r.json())
            .then(data => {
                setVoiceConfigured(data.configured !== false);
                if (data.configured === false) {
                    setErrorMsg(data.error || "Voice service not configured");
                }
            })
            .catch(() => setVoiceConfigured(false));
    }, [patientId, patientName, triage.specialistType]);

    const connect = useCallback(async () => {
        setStatus("connecting");
        setErrorMsg("");

        try {
            // Dynamically import livekit
            const { Room, RoomEvent } = await import("livekit-client");

            const res = await fetch("/api/ai-doctor/voice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientName: patientName || "Patient",
                    patientId: patientId || "unknown",
                    specialistType: triage.specialistType,
                    systemPrompt: triage.systemPrompt,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Connection failed");

            const room = new Room();
            roomRef.current = room;

            await room.connect(data.serverUrl, data.participantToken, { autoSubscribe: true });
            await room.localParticipant.setMicrophoneEnabled(true);

            room.on(RoomEvent.Disconnected, () => {
                setStatus("idle");
                setAgentSpeaking(false);
                setUserSpeaking(false);
            });

            room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
                try {
                    const msg = JSON.parse(new TextDecoder().decode(payload));
                    if (msg.type === "TRANSCRIPT") {
                        setTranscript(prev => [...prev, msg.text]);
                    }
                } catch { /* ignore */ }
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            room.on(RoomEvent.ActiveSpeakersChanged, (speakers: any[]) => {
                setAgentSpeaking(speakers.some(s => s.identity !== room.localParticipant.identity));
                setUserSpeaking(speakers.some(s => s.identity === room.localParticipant.identity));
            });

            setStatus("connected");
        } catch (err) {
            setStatus("error");
            setErrorMsg(err instanceof Error ? err.message : "Connection failed");
        }
    }, [patientId, patientName, triage]);

    const disconnect = useCallback(() => {
        roomRef.current?.disconnect();
        roomRef.current = null;
        setStatus("idle");
        setAgentSpeaking(false);
        setUserSpeaking(false);
    }, []);

    const toggleMute = useCallback(async () => {
        if (!roomRef.current) return;
        const enabled = roomRef.current.localParticipant.isMicrophoneEnabled;
        await roomRef.current.localParticipant.setMicrophoneEnabled(!enabled);
        setIsMuted(enabled);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            roomRef.current?.disconnect();
        };
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#080c14]">
            {/* Header */}
            <div className="flex items-center gap-2 p-3 border-b border-[#1e2a3a]">
                <button onClick={() => { disconnect(); onBack(); }} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors">
                    <ArrowLeft className="w-4 h-4 text-white/50" />
                </button>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${triage.specialistColor} flex items-center justify-center text-lg`}>
                    {triage.specialistIcon}
                </div>
                <div className="flex-1">
                    <h3 className="text-xs font-semibold text-white">{triage.specialistType} — Voice</h3>
                    <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${status === "connected" ? "bg-green-400 animate-pulse" : "bg-white/20"}`} />
                        <span className="text-[9px] text-white/40">
                            {status === "connected" ? "Live Session" : status === "connecting" ? "Connecting..." : "Ready"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
                {/* Not configured state */}
                {voiceConfigured === false && (
                    <div className="text-center max-w-xs">
                        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
                            <Phone className="w-8 h-8 text-amber-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">Voice Not Configured</h3>
                        <p className="text-[11px] text-white/40 mb-3 leading-relaxed">
                            Add LiveKit, Deepgram, Cerebras, and Cartesia API keys to your .env.local to enable voice consultations.
                        </p>
                        <button onClick={onBack} className="mt-3 text-[11px] text-cyan-400 hover:text-cyan-300">Use Chat instead →</button>
                    </div>
                )}

                {/* Ready / Connected state */}
                {voiceConfigured !== false && (
                    <>
                        {/* Avatar */}
                        <motion.div
                            animate={status === "connected" ? (agentSpeaking ? { scale: [1, 1.08, 1], boxShadow: ["0 0 0 0 rgba(34,197,94,0.2)", "0 0 40px 10px rgba(34,197,94,0.3)", "0 0 0 0 rgba(34,197,94,0.2)"] } : {}) : {}}
                            transition={agentSpeaking ? { duration: 1.5, repeat: Infinity } : {}}
                            className={`w-24 h-24 rounded-full bg-gradient-to-br ${triage.specialistColor} flex items-center justify-center text-5xl shadow-2xl`}
                        >
                            {triage.specialistIcon}
                        </motion.div>

                        <div className="text-center">
                            <p className="text-sm font-semibold text-white">{triage.specialistType}</p>
                            <p className="text-[11px] text-white/40 mt-0.5">
                                {status === "idle" ? "Tap to start voice consultation" :
                                    status === "connecting" ? "Connecting to Dr. ARIA..." :
                                        agentSpeaking ? "Dr. ARIA is speaking..." :
                                            userSpeaking ? "Listening to you..." : "Ready — speak when you're ready"}
                            </p>
                        </div>

                        {/* Waveforms */}
                        {status === "connected" && (
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <VoiceWaveform isActive={userSpeaking} isSpeaking={false} size="lg" />
                                    <p className="text-[9px] text-white/30 mt-1">You</p>
                                </div>
                                <div className="text-center">
                                    <VoiceWaveform isActive={agentSpeaking} isSpeaking={true} size="lg" />
                                    <p className="text-[9px] text-white/30 mt-1">Dr. ARIA</p>
                                </div>
                            </div>
                        )}

                        {/* Controls */}
                        <div className="flex items-center gap-3 mt-2">
                            {status === "idle" && (
                                <button
                                    onClick={connect}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-sm hover:from-green-400 hover:to-emerald-500 transition-all shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                                >
                                    <Phone className="w-4 h-4" /> Start Voice Call
                                </button>
                            )}
                            {status === "connecting" && (
                                <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
                                </div>
                            )}
                            {status === "connected" && (
                                <>
                                    <button
                                        onClick={toggleMute}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? "bg-red-500/20 border border-red-500/40 text-red-400" : "bg-purple-500/20 border border-purple-500/40 text-purple-400"}`}
                                    >
                                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={disconnect}
                                        className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all"
                                    >
                                        <Phone className="w-5 h-5 rotate-[135deg]" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Error */}
                        {status === "error" && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 max-w-xs text-center">
                                <p className="text-xs text-red-400">{errorMsg}</p>
                                <button onClick={() => setStatus("idle")} className="mt-2 text-[11px] text-cyan-400">Try again</button>
                            </div>
                        )}

                        {/* Transcript */}
                        {transcript.length > 0 && (
                            <div className="w-full max-w-xs max-h-32 overflow-y-auto mt-2 space-y-1">
                                {transcript.slice(-5).map((t, i) => (
                                    <p key={i} className="text-[10px] text-white/40 bg-white/5 rounded px-2 py-1">{t}</p>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// DEFAULT TRIAGE — Fallback when API/DB is unavailable
// ─────────────────────────────────────────────────────────────────
const defaultTriage: TriageResult = {
    specialistType: "AI General Practitioner",
    specialistIcon: "🩺",
    specialistColor: "from-purple-500 to-pink-500",
    systemPrompt: `You are Dr. ARIA, an advanced AI healthcare doctor. You are warm, empathetic, and professional.
Speak in clear, accessible medical language. Ask follow-up questions to understand symptoms.
Keep responses conversational and SHORT (2-3 sentences). Never diagnose definitively.
Always recommend consulting a real doctor for concerning symptoms.
Respond in plain text, NOT JSON.`,
    greeting: "Hello! I'm Dr. ARIA, your AI health assistant. I'm here to help with any health questions or concerns. How are you feeling today?",
    confidence: 80,
};

// ─────────────────────────────────────────────────────────────────
// MAIN AI DOCTOR WINDOW — Orchestrator
// ─────────────────────────────────────────────────────────────────
export default function AIDoctorWindow() {
    const [mode, setMode] = useState<"triage" | "chat" | "voice">("triage");
    const [triage, setTriage] = useState<TriageResult | null>(null);
    const [triageLoading, setTriageLoading] = useState(true);

    const { patientId } = useOSStore();

    // Run triage on mount
    useEffect(() => {
        setTriageLoading(true);
        fetch("/api/ai-doctor/triage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId }),
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setTriage({
                        specialistType: data.specialistType,
                        specialistIcon: data.specialistIcon,
                        specialistColor: data.specialistColor,
                        systemPrompt: data.systemPrompt,
                        greeting: data.greeting,
                        confidence: data.confidence,
                    });
                } else {
                    // Fallback to general practitioner
                    setTriage(defaultTriage);
                }
            })
            .catch(() => {
                // Network/DB error — still show general practitioner
                setTriage(defaultTriage);
            })
            .finally(() => setTriageLoading(false));
    }, [patientId]);

    const handleSelectMode = (m: "chat" | "voice") => {
        setMode(m);
    };

    const handleBack = () => setMode("triage");

    return (
        <div className="h-full w-full">
            <AnimatePresence mode="wait">
                {mode === "triage" && (
                    <motion.div key="triage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                        <TriageScreen onSelectMode={handleSelectMode} triage={triage} loading={triageLoading} />
                    </motion.div>
                )}
                {mode === "chat" && triage && (
                    <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                        <ChatInterface triage={triage} onBack={handleBack} />
                    </motion.div>
                )}
                {mode === "voice" && triage && (
                    <motion.div key="voice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                        <VoiceInterface triage={triage} onBack={handleBack} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

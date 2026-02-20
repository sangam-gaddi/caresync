"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, Stethoscope, Send } from "lucide-react";
import { useOSStore } from "@/lib/store";

interface Message {
    role: "user" | "doctor";
    text: string;
    timestamp: Date;
}

export default function AIDoctorWindow() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "doctor",
            text: "Hello! I'm Dr. ARIA, your AI health assistant. I can see your health data and I'm here to help. How are you feeling today?",
            timestamp: new Date(),
        },
    ]);
    const [listening, setListening] = useState(false);
    const [inputText, setInputText] = useState("");
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    const { patientId, avatarState, healthScore, showIslandNotification, setAiThinking, aiThinking } = useOSStore();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim()) return;
            setInputText("");

            const userMsg: Message = { role: "user", text, timestamp: new Date() };
            setMessages((prev) => [...prev, userMsg]);
            setTyping(true);
            setAiThinking(true);

            try {
                const res = await fetch("/api/ai-doctor", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: text,
                        patientContext: {
                            patientId,
                            healthScore,
                            organSummary: avatarState?.organs,
                        },
                    }),
                });

                const data = await res.json();
                setAiThinking(false);
                setTyping(false);

                const doctorResponse = data.response || "I'm analyzing your health data...";

                setMessages((prev) => [
                    ...prev,
                    { role: "doctor", text: doctorResponse, timestamp: new Date() },
                ]);

                // Update Dynamic Island
                if (data.ui_command?.message) {
                    showIslandNotification({
                        id: Date.now().toString(),
                        message: data.ui_command.message,
                        type: "ai",
                        icon: "ai",
                    });
                }

                // TTS
                if (typeof window !== "undefined" && window.speechSynthesis) {
                    const utterance = new SpeechSynthesisUtterance(doctorResponse);
                    utterance.rate = 0.9;
                    utterance.pitch = 1.0;
                    utterance.volume = 0.8;
                    const voices = speechSynthesis.getVoices();
                    const preferred = voices.find(
                        (v) => v.name.includes("Google") || v.name.includes("Female") || v.lang === "en-US"
                    );
                    if (preferred) utterance.voice = preferred;
                    window.speechSynthesis.speak(utterance);
                }
            } catch {
                setAiThinking(false);
                setTyping(false);
                setMessages((prev) => [
                    ...prev,
                    { role: "doctor", text: "I'm having trouble connecting to my AI systems. Please try again.", timestamp: new Date() },
                ]);
            }
        },
        [patientId, avatarState, healthScore, showIslandNotification, setAiThinking]
    );

    const startListening = useCallback(() => {
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            alert("Voice input not supported in this browser. Please use Chrome.");
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        const SpeechRecognitionAPI = w.webkitSpeechRecognition || w.SpeechRecognition;

        if (!SpeechRecognitionAPI) return;

        const recognition = new SpeechRecognitionAPI();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
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
            {/* Doctor Header */}
            <div className="flex items-center gap-3 p-4 border-b border-[#1e2a3a]">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Dr. ARIA</h3>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] text-white/50">AI Health Assistant · Online</span>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-[10px] text-white/30">TTS On</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "doctor" && (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                    <Stethoscope className="w-3 h-3 text-white" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-cyan-500/20 border border-cyan-500/30 text-white ml-4"
                                        : "bg-[#0d1421] border border-[#1e2a3a] text-white/90"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {typing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-2 flex-shrink-0">
                            <Stethoscope className="w-3 h-3 text-white" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-[#0d1421] border border-[#1e2a3a]">
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-[#1e2a3a]">
                {/* Voice status */}
                <AnimatePresence>
                    {listening && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-center gap-2 mb-2 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20"
                        >
                            <div className="flex gap-[3px] items-center">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="w-[3px] bg-purple-400 rounded-full waveform-bar"
                                        style={{ animationDelay: `${i * 0.1}s` }}
                                    />
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
                        placeholder="Ask Dr. ARIA anything..."
                        className="flex-1 bg-[#0d1421] border border-[#1e2a3a] rounded-xl px-3 py-2 text-sm text-white/90 placeholder-white/30 outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <button
                        onClick={() => (listening ? stopListening() : startListening())}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${listening
                                ? "bg-red-500/20 border border-red-500/40 text-red-400"
                                : "bg-purple-500/20 border border-purple-500/40 text-purple-400 hover:bg-purple-500/30"
                            }`}
                    >
                        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => sendMessage(inputText)}
                        disabled={!inputText.trim() || aiThinking}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-40 transition-all duration-200"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import {
    LayoutDashboard, Users, UserRound, Hospital as HospitalIcon,
    BarChart3, Settings, ShieldCheck, Activity, Search, Bell,
    LogOut, ChevronDown, Calendar, RefreshCcw, Loader2, ArrowUpRight,
    Plus, Download, CheckCircle, XCircle, Clock4, User, Phone, Mail, Clock,
    Stethoscope, Star, ChevronRight, Video, MapPin, MoreVertical, MessageCircle, Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOSStore } from "@/lib/store";
import { useChat } from "@/hooks/useChat";

// Components extracted from previous steps but adapted for window-based flow
import DashboardStats from "./DashboardStats";
import RevenueChart from "./RevenueChart";
import RecentAppointments from "./RecentAppointments";

type AdminTab = "dashboard" | "patients" | "doctors" | "hospitals" | "analytics" | "chat" | "settings";

export default function AdminPanelWindow() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
    const [adminUser, setAdminUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const { showIslandNotification } = useOSStore();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ checkOnly: true }) // I should update the login route to support specific check
            });
            // Simplified for this demo: just try to get stats. If it fails, not auth.
            const statsRes = await fetch("/api/admin/stats");
            const statsData = await statsRes.json();
            if (statsData.success) {
                setIsAuthenticated(true);
                setStats(statsData.data);
                // Hardcoded name for demo if no session API available
                setAdminUser({ name: "Super Admin", role: "Super Admin" });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = (user: any) => {
        setIsAuthenticated(true);
        setAdminUser(user);
        checkAuth(); // Refresh stats
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-[#040810]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminInlineLogin onSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="flex h-full bg-[#020408] text-white overflow-hidden">
            {/* Sidebar */}
            <aside className="w-56 bg-[#040810] border-r border-white/5 flex flex-col">
                <div className="p-5 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-black tracking-tight uppercase">HealthOS Admin</span>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {[
                        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                        { id: "patients", label: "Patients", icon: Users },
                        { id: "doctors", label: "Doctors", icon: UserRound },
                        { id: "hospitals", label: "Hospitals", icon: HospitalIcon },
                        { id: "chat", label: "Chat", icon: MessageCircle },
                        { id: "analytics", label: "Analytics", icon: BarChart3 },
                        { id: "settings", label: "Settings", icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as AdminTab)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all ${activeTab === item.id
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    : "text-white/30 hover:text-white hover:bg-white/5 border border-transparent"
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${activeTab === item.id ? "text-blue-400" : "text-white/20"}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={async () => {
                            await fetch("/api/admin/logout", { method: "POST" });
                            setIsAuthenticated(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#060a12]/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-sm font-black capitalize tracking-tight">{activeTab}</h1>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-green-500/10 text-green-400 text-[9px] font-black uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white/5 border border-white/5">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-400">
                                {adminUser?.name?.charAt(0)}
                            </div>
                            <span className="text-[10px] font-bold text-white/50">{adminUser?.name}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    {activeTab === "dashboard" && <DashContent stats={stats} />}
                    {activeTab === "patients" && <PatientsContent />}
                    {activeTab === "doctors" && <DoctorsContent />}
                    {activeTab === "hospitals" && <HospitalsContent />}
                    {activeTab === "chat" && <ChatContent />}
                    {activeTab === "analytics" && <p className="text-white/20 text-xs text-center py-20 uppercase font-black tracking-widest">Analytics Module Loading...</p>}
                    {activeTab === "settings" && <p className="text-white/20 text-xs text-center py-20 uppercase font-black tracking-widest">Admin Settings Control</p>}
                </main>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH VIEW
// ─────────────────────────────────────────────────────────────────────────────
function AdminInlineLogin({ onSuccess }: { onSuccess: (user: any) => void }) {
    const [email, setEmail] = useState("admin@caresync.com");
    const [password, setPassword] = useState("admin123");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (data.success) {
                onSuccess({ name: "Super Admin", role: "Super Admin" });
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center bg-[#060a12] p-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-2xl">
                <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">Admin Portal</h2>
            <p className="text-white/30 text-xs mb-8">Secure access to hospital systems</p>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
                {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</div>}

                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest mt-4 shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authenticate"}
                </button>
            </form>
            <p className="text-[9px] text-white/20 mt-8 font-bold uppercase tracking-widest">Demo: admin@caresync.com / admin123</p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD VIEW
// ─────────────────────────────────────────────────────────────────────────────
function DashContent({ stats }: { stats: any }) {
    return (
        <div className="space-y-8">
            <DashboardStats kpis={stats?.kpis} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RevenueChart chartData={stats?.chartData} />
                <RecentAppointments recentData={stats?.recentAppointments} />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PATIENTS VIEW
// ─────────────────────────────────────────────────────────────────────────────
function PatientsContent() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApps = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/appointments");
            const d = await res.json();
            if (d.success) setAppointments(d.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchApps(); }, []);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>;

    return (
        <div className="bg-[#0c1220] rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-left text-[11px]">
                <thead className="bg-white/3 border-b border-white/5">
                    <tr>
                        <th className="px-5 py-4 font-black uppercase tracking-widest text-white/30">Patient</th>
                        <th className="px-5 py-4 font-black uppercase tracking-widest text-white/30">Doctor</th>
                        <th className="px-5 py-4 font-black uppercase tracking-widest text-white/30">Time</th>
                        <th className="px-5 py-4 font-black uppercase tracking-widest text-white/30">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {appointments.map(app => (
                        <tr key={app._id} className="hover:bg-white/2 transition-colors">
                            <td className="px-5 py-4 font-bold">{app.patientName}</td>
                            <td className="px-5 py-4 text-white/50">{app.doctorName}</td>
                            <td className="px-5 py-4 text-white/50">{app.date} • {app.timeSlot}</td>
                            <td className="px-5 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${app.status === 'scheduled' ? 'text-blue-400 bg-blue-500/10' : 'text-green-400 bg-green-500/10'}`}>
                                    {app.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCTORS VIEW
// ─────────────────────────────────────────────────────────────────────────────
function DoctorsContent() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDocs = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/doctors");
            const d = await res.json();
            if (d.success) setDoctors(d.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDocs(); }, []);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map(doc => (
                <div key={doc._id} className="p-4 rounded-2xl bg-[#0c1220] border border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <UserRound className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs font-black">{doc.name}</p>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{doc.specialty}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[9px] font-bold text-white/20 uppercase">Active</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOSPITALS VIEW
// ─────────────────────────────────────────────────────────────────────────────
function HospitalsContent() {
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHospitals = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/hospitals");
            const d = await res.json();
            if (d.success) setHospitals(d.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchHospitals(); }, []);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map(h => (
                <div key={h._id} className="p-5 rounded-3xl bg-[#0c1220] border border-white/5 group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <HospitalIcon className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black leading-tight truncate">{h.name}</p>
                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{h.city}</p>
                        </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        {h.departments?.slice(0, 3).map((d: string) => (
                            <span key={d} className="px-2 py-0.5 rounded-lg bg-white/5 text-[8px] text-white/50 font-bold">{d}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT VIEW (Doctor ↔ Patient Real-time Chat)
// ─────────────────────────────────────────────────────────────────────────────
function ChatContent() {
    const adminId = "admin-doctor";
    const adminName = "Dr. Admin";
    const {
        isConnected, globalMessages, privateMessages, onlineUsers,
        typingUsers, sendGlobalMessage, sendPrivateMessage, emitTypingGlobal, emitTypingPrivate,
    } = useChat(adminId, adminName);

    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const messagesEndRef = useState<HTMLDivElement | null>(null);

    const activeChatUser = onlineUsers.find(u => u.usn === activeChat);
    const currentMessages = activeChat ? (privateMessages[activeChat] || []) : globalMessages;

    const handleSend = () => {
        if (!message.trim()) return;
        if (activeChat) {
            sendPrivateMessage(activeChat, message.trim());
        } else {
            sendGlobalMessage(message.trim());
        }
        setMessage("");
    };

    const handleTyping = () => {
        if (activeChat) {
            emitTypingPrivate(activeChat);
        } else {
            emitTypingGlobal();
        }
    };

    return (
        <div className="flex h-[calc(100vh-12rem)] rounded-2xl border border-white/5 overflow-hidden bg-[#0c1220]">
            {/* Users sidebar */}
            <div className="w-64 border-r border-white/5 flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                            {isConnected ? "Connected" : "Connecting..."}
                        </span>
                    </div>
                    <p className="text-[10px] text-white/20">{onlineUsers.length} patient(s) online</p>
                </div>

                {/* Global Chat button */}
                <button onClick={() => setActiveChat(null)}
                    className={`flex items-center gap-3 px-4 py-3 text-left transition-all ${!activeChat ? "bg-blue-500/10 border-l-2 border-blue-500" : "hover:bg-white/3 border-l-2 border-transparent"}`}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-white">Global Chat</p>
                        <p className="text-[9px] text-white/30">All patients</p>
                    </div>
                </button>

                {/* Online patients */}
                <div className="flex-1 overflow-y-auto">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20 px-4 py-2">Online Patients</p>
                    {onlineUsers.map(user => (
                        <button key={user.usn} onClick={() => setActiveChat(user.usn)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${activeChat === user.usn ? "bg-purple-500/10 border-l-2 border-purple-500" : "hover:bg-white/3 border-l-2 border-transparent"}`}>
                            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-400">
                                {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-white truncate">{user.name}</p>
                                <p className="text-[8px] text-white/20">{user.usn}</p>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 ml-auto shrink-0" />
                        </button>
                    ))}
                    {onlineUsers.length === 0 && (
                        <p className="text-[10px] text-white/15 text-center py-8">No patients online</p>
                    )}
                </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3">
                    {activeChat ? (
                        <>
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-[11px] font-bold text-purple-400">
                                {activeChatUser?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-black">{activeChatUser?.name || activeChat}</p>
                                <p className="text-[9px] text-white/30">Private conversation</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-black">Global Chat</p>
                                <p className="text-[9px] text-white/30">All connected users</p>
                            </div>
                        </>
                    )}
                    {typingUsers.size > 0 && (
                        <span className="text-[9px] text-blue-400 ml-auto animate-pulse">Someone is typing...</span>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {currentMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <MessageCircle className="w-10 h-10 text-white/10 mb-3" />
                            <p className="text-xs text-white/20">No messages yet</p>
                            <p className="text-[10px] text-white/10 mt-1">Start the conversation with your patients</p>
                        </div>
                    )}
                    {currentMessages.map((msg, i) => {
                        const isMine = msg.senderUsn === adminId;
                        return (
                            <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isMine
                                    ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/20"
                                    : "bg-white/5 border border-white/5"
                                    }`}>
                                    {!isMine && (
                                        <p className="text-[9px] font-bold text-purple-400 mb-1">{msg.senderName}</p>
                                    )}
                                    <p className="text-xs text-white/80">{msg.message}</p>
                                    <p className="text-[8px] text-white/20 mt-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <input
                            value={message}
                            onChange={e => { setMessage(e.target.value); handleTyping(); }}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                            placeholder={activeChat ? `Message ${activeChatUser?.name || "patient"}...` : "Send a global message..."}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-blue-500/40 transition-colors"
                        />
                        <button onClick={handleSend} disabled={!message.trim() || !isConnected}
                            className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white hover:from-blue-400 hover:to-cyan-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

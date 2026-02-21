"use client";

import { useState, useEffect, useCallback } from "react";
import { useOSStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import {
    Calendar, AlertCircle, CheckCircle, Plus, Loader2,
    Maximize2, Minimize2, ArrowRight
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import AppointmentBooking from "./AppointmentBooking";

interface Appointment {
    _id: string;
    patientName: string;
    doctorName: string;
    specialty: string;
    department?: string;
    dateTime: string;
    date?: string;
    timeSlot?: string;
    status: string;
    type: string;
    reason?: string;
    consultationFee?: number;
}

export default function AppointmentsWindow() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showBookingWizard, setShowBookingWizard] = useState(false);
    const { patientId } = useOSStore();

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const url = patientId
                ? `/api/appointments?patientId=${patientId}`
                : "/api/appointments";
            const res = await fetch(url);
            const data = await res.json();
            setAppointments(data.data || []);
        } catch {
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const statusIcon = (status: string) => {
        if (status === "completed") return <CheckCircle className="w-3.5 h-3.5 text-green-400" />;
        if (status === "cancelled") return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
        return <Calendar className="w-3.5 h-3.5 text-blue-400" />;
    };

    const handleOpenFullScreen = () => {
        setIsFullScreen(true);
        setShowBookingWizard(true);
    };

    const handleMinimize = () => {
        setIsFullScreen(false);
    };

    const handleCloseBooking = () => {
        setShowBookingWizard(false);
        setIsFullScreen(false);
        fetchAppointments();
    };

    // ── The small in-window appointments list view ──
    const appointmentsList = (
        <div className="flex flex-col h-full bg-[#080c14]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1e2a3a]">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-white">Appointments</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-medium">
                        {appointments.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Book Appointment button */}
                    <button
                        onClick={() => setShowBookingWizard(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 text-xs font-medium hover:from-blue-500/30 hover:to-cyan-500/30 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Book Appointment
                    </button>
                    {/* Full Screen button */}
                    <button
                        onClick={handleOpenFullScreen}
                        title="Open in Full Screen"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-all"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Full Screen</span>
                    </button>
                </div>
            </div>

            {/* Appointments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-3">
                        <Calendar className="w-10 h-10 text-white/15" />
                        <p className="text-xs text-white/40">No appointments scheduled</p>
                        <button onClick={handleOpenFullScreen}
                            className="flex items-center gap-2 mt-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold hover:from-blue-400 hover:to-cyan-400 shadow-[0_0_15px_rgba(0,150,255,0.25)] transition-all">
                            <Plus className="w-3.5 h-3.5" />
                            Book your first appointment
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    appointments.map((appt) => (
                        <div
                            key={appt._id}
                            className="flex items-start gap-3 p-3 rounded-xl bg-[#0d1421] border border-[#1e2a3a] hover:border-blue-500/30 transition-colors"
                        >
                            <div className="mt-0.5">{statusIcon(appt.status)}</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-white truncate">{appt.doctorName}</p>
                                    <span
                                        className={`text-[9px] px-1.5 py-0.5 rounded-full capitalize ${appt.status === "completed"
                                            ? "bg-green-500/20 text-green-400"
                                            : appt.status === "cancelled"
                                                ? "bg-red-500/20 text-red-400"
                                                : "bg-blue-500/20 text-blue-400"
                                            }`}
                                    >
                                        {appt.status}
                                    </span>
                                </div>
                                <p className="text-[10px] text-white/50 mt-0.5">{appt.specialty}{appt.department ? ` • ${appt.department}` : ""}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-[10px] text-white/40">{formatDate(appt.dateTime)}</p>
                                    {appt.timeSlot && <span className="text-[9px] text-cyan-400/60">{appt.timeSlot}</span>}
                                </div>
                                {appt.reason && <p className="text-[10px] text-white/30 mt-1 truncate">&quot;{appt.reason}&quot;</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded-full ${appt.type === "virtual"
                                        ? "bg-purple-500/20 text-purple-400"
                                        : "bg-slate-500/20 text-slate-400"
                                        }`}
                                >
                                    {appt.type}
                                </span>
                                {appt.consultationFee !== undefined && appt.consultationFee > 0 && (
                                    <span className="text-[9px] text-green-400/60">${appt.consultationFee}</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Normal in-window view (only if NOT full screen) */}
            {!isFullScreen && appointmentsList}

            {/* Full-Screen Overlay */}
            <AnimatePresence>
                {isFullScreen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed inset-0 z-[9999] flex flex-col"
                        style={{ background: "linear-gradient(135deg, #060a12 0%, #0a1020 50%, #080c18 100%)" }}
                    >
                        {/* Full-screen top bar with Minimize button */}
                        <div className="flex items-center justify-between px-6 py-3 border-b border-white/8"
                            style={{ background: "rgba(4,8,16,0.85)", backdropFilter: "blur(20px)" }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-sm font-bold text-white">Appointments</h1>
                                    <p className="text-[10px] text-white/40">Full Screen View</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Minimize button */}
                                <button
                                    onClick={handleMinimize}
                                    title="Minimize to Window"
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-all"
                                >
                                    <Minimize2 className="w-3.5 h-3.5" />
                                    Minimize
                                </button>
                            </div>
                        </div>

                        {/* Full-screen content: show either the wizard or appointments list */}
                        <div className="flex-1 overflow-y-auto">
                            {showBookingWizard ? (
                                <AppointmentBooking
                                    onClose={handleCloseBooking}
                                    onMinimize={handleMinimize}
                                    isEmbedded={true}
                                />
                            ) : (
                                <div className="max-w-4xl mx-auto p-6">
                                    {/* Full-screen appointment list + book button */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Your Appointments</h2>
                                            <p className="text-sm text-white/40 mt-1">{appointments.length} appointment{appointments.length !== 1 ? "s" : ""} found</p>
                                        </div>
                                        <button
                                            onClick={() => setShowBookingWizard(true)}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold hover:from-blue-400 hover:to-cyan-400 shadow-[0_0_20px_rgba(0,150,255,0.25)] transition-all"
                                        >
                                            <Plus className="w-4 h-4" /> Book New Appointment
                                        </button>
                                    </div>

                                    {loading ? (
                                        <div className="flex items-center justify-center py-20">
                                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                        </div>
                                    ) : appointments.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                                <Calendar className="w-8 h-8 text-blue-400/40" />
                                            </div>
                                            <p className="text-sm text-white/40">No appointments yet</p>
                                            <button onClick={() => setShowBookingWizard(true)}
                                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold hover:from-blue-400 hover:to-cyan-400 shadow-[0_0_20px_rgba(0,150,255,0.25)] transition-all">
                                                <Plus className="w-4 h-4" /> Book your first appointment <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {appointments.map((appt) => (
                                                <div key={appt._id}
                                                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-blue-500/30 transition-colors">
                                                    <div className="mt-1">{statusIcon(appt.status)}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-semibold text-white">{appt.doctorName}</p>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${appt.status === "completed" ? "bg-green-500/20 text-green-400" : appt.status === "cancelled" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}>
                                                                {appt.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-white/50 mt-1">{appt.specialty}{appt.department ? ` • ${appt.department}` : ""}</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <p className="text-xs text-white/40">{formatDate(appt.dateTime)}</p>
                                                            {appt.timeSlot && <span className="text-[10px] text-cyan-400">{appt.timeSlot}</span>}
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${appt.type === "virtual" ? "bg-purple-500/20 text-purple-400" : "bg-slate-500/20 text-slate-400"}`}>{appt.type}</span>
                                                        </div>
                                                        {appt.reason && <p className="text-[11px] text-white/25 mt-1.5 italic">&quot;{appt.reason}&quot;</p>}
                                                    </div>
                                                    {appt.consultationFee !== undefined && appt.consultationFee > 0 && (
                                                        <span className="text-sm font-semibold text-green-400">${appt.consultationFee}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Non-fullscreen booking wizard overlay */}
            <AnimatePresence>
                {!isFullScreen && showBookingWizard && (
                    <AppointmentBooking onClose={handleCloseBooking} />
                )}
            </AnimatePresence>
        </>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useOSStore } from "@/lib/store";
import {
    Calendar, AlertCircle, CheckCircle, Plus, Loader2
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Appointment {
    _id: string;
    patientName: string;
    doctorName: string;
    specialty: string;
    dateTime: string;
    status: string;
    type: string;
}

export default function AppointmentsWindow() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const { patientId, patientName, showIslandNotification } = useOSStore();
    const [form, setForm] = useState({
        doctorName: "",
        specialty: "",
        dateTime: "",
        type: "in-person",
        notes: "",
    });

    useEffect(() => {
        fetchAppointments();
    }, [patientId]);

    async function fetchAppointments() {
        setLoading(true);
        try {
            const url = patientId
                ? `/api/appointments?patientId=${patientId}`
                : "/api/appointments";
            const res = await fetch(url);
            const data = await res.json();
            setAppointments(data.data || []);
        } catch {
            // use demo data if API fails
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    patientId: patientId || "demo",
                    patientName: patientName || "Demo Patient",
                    status: "scheduled",
                    dateTime: new Date(form.dateTime),
                }),
            });
            setShowForm(false);
            setForm({ doctorName: "", specialty: "", dateTime: "", type: "in-person", notes: "" });
            fetchAppointments();
            showIslandNotification({
                id: Date.now().toString(),
                message: `Appointment with Dr. ${form.doctorName} booked!`,
                type: "success",
                icon: "calendar",
            });
        } catch {
            console.error("Failed to book appointment");
        }
    }

    const statusIcon = (status: string) => {
        if (status === "completed") return <CheckCircle className="w-3.5 h-3.5 text-green-400" />;
        if (status === "cancelled") return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
        return <Calendar className="w-3.5 h-3.5 text-blue-400" />;
    };

    return (
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
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Appointment
                </button>
            </div>

            {/* New Appointment Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="p-4 border-b border-[#1e2a3a] space-y-2 bg-[#0d1421]/50">
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            className="bg-[#080c14] border border-[#1e2a3a] rounded-xl px-3 py-2 text-xs text-white/90 placeholder-white/30 outline-none focus:border-blue-500/50"
                            placeholder="Doctor Name"
                            value={form.doctorName}
                            onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
                            required
                        />
                        <input
                            className="bg-[#080c14] border border-[#1e2a3a] rounded-xl px-3 py-2 text-xs text-white/90 placeholder-white/30 outline-none focus:border-blue-500/50"
                            placeholder="Specialty"
                            value={form.specialty}
                            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                            required
                        />
                    </div>
                    <input
                        type="datetime-local"
                        className="w-full bg-[#080c14] border border-[#1e2a3a] rounded-xl px-3 py-2 text-xs text-white/90 outline-none focus:border-blue-500/50"
                        value={form.dateTime}
                        onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                        required
                    />
                    <div className="flex gap-2">
                        <select
                            className="flex-1 bg-[#080c14] border border-[#1e2a3a] rounded-xl px-3 py-2 text-xs text-white/90 outline-none"
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                        >
                            <option value="in-person">In-person</option>
                            <option value="virtual">Virtual</option>
                        </select>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors"
                        >
                            Book
                        </button>
                    </div>
                </form>
            )}

            {/* Appointments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <Calendar className="w-8 h-8 text-white/20" />
                        <p className="text-xs text-white/40">No appointments scheduled</p>
                        <p className="text-[10px] text-white/25">Book your first appointment above</p>
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
                                    <p className="text-xs font-medium text-white truncate">Dr. {appt.doctorName}</p>
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
                                <p className="text-[10px] text-white/50 mt-0.5">{appt.specialty}</p>
                                <p className="text-[10px] text-white/40 mt-0.5">{formatDate(appt.dateTime)}</p>
                            </div>
                            <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-full ${appt.type === "virtual"
                                    ? "bg-purple-500/20 text-purple-400"
                                    : "bg-slate-500/20 text-slate-400"
                                    }`}
                            >
                                {appt.type}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

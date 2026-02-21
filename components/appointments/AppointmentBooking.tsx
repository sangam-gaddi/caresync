"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOSStore } from "@/lib/store";
import {
    X, ChevronRight, ChevronLeft, Calendar, Clock, User, Star,
    CheckCircle, MapPin, Video, Search, Loader2, Heart, Brain,
    Wind, Stethoscope, Bone, Smile, Activity, Download, Minimize2, Wallet
} from "lucide-react";
import jsPDF from "jspdf";
import { PaymentProviders } from "@/components/providers/PaymentProviders";
import CryptoPayment from "@/components/payment/CryptoPayment";

// ── Types ──
interface Specialist {
    _id: string; name: string; specialty: string; department: string;
    avatar: string; bio: string; experience: number; rating: number;
    reviewCount: number; consultationFee: number; type: string;
    slotDuration: number;
}
interface Hospital {
    _id: string; name: string; rating: number; address: string;
    lat?: number; lng?: number; cityId: string; specialties: string[];
}
interface City {
    _id: string; name: string;
}
interface TimeSlot { time: string; status: "available" | "booked" | "past"; }
interface BookingState {
    city: City | null;
    hospital: Hospital | null;
    specialist: Specialist | null; date: string; timeSlot: string;
    appointmentType: "in-person" | "virtual";
    patient: { name: string; email: string; phone: string; reason: string; };
}

const DEPT_ICONS: Record<string, React.ReactNode> = {
    "Heart & Vascular": <Heart className="w-5 h-5" />,
    "Brain & Spine": <Brain className="w-5 h-5" />,
    "Primary Care": <Stethoscope className="w-5 h-5" />,
    "Lung & Respiratory": <Wind className="w-5 h-5" />,
    "Skin & Aesthetics": <Smile className="w-5 h-5" />,
    "Bones & Joints": <Bone className="w-5 h-5" />,
    "Mental Health": <Activity className="w-5 h-5" />,
    "Digestive Health": <Stethoscope className="w-5 h-5" />,
};
const DEPT_COLORS: Record<string, string> = {
    "Heart & Vascular": "#ff4d6d", "Brain & Spine": "#7c3aed",
    "Primary Care": "#00e5ff", "Lung & Respiratory": "#00e676",
    "Skin & Aesthetics": "#f472b6", "Bones & Joints": "#f59e0b",
    "Mental Health": "#818cf8", "Digestive Health": "#fb923c",
};

const STEPS = [
    { label: "Location", icon: <MapPin className="w-4 h-4" /> },
    { label: "Hospital", icon: <Activity className="w-4 h-4" /> },
    { label: "Specialist", icon: <User className="w-4 h-4" /> },
    { label: "Date & Time", icon: <Calendar className="w-4 h-4" /> },
    { label: "Your Details", icon: <Stethoscope className="w-4 h-4" /> },
    { label: "Payment", icon: <Wallet className="w-4 h-4" /> },
    { label: "Confirm", icon: <CheckCircle className="w-4 h-4" /> },
];

// ── Main Component ──
export default function AppointmentBooking({ onClose, onMinimize, isEmbedded }: {
    onClose: () => void;
    onMinimize?: () => void;
    isEmbedded?: boolean;
}) {
    const { patientName, patientId, showIslandNotification } = useOSStore();
    const [step, setStep] = useState(0);
    const [booking, setBooking] = useState<BookingState>({
        city: null, hospital: null, specialist: null, date: "", timeSlot: "",
        appointmentType: "in-person",
        patient: { name: patientName || "", email: "", phone: "", reason: "" },
    });
    const [cities, setCities] = useState<City[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [specialists, setSpecialists] = useState<Specialist[]>([]);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [monthAvailability, setMonthAvailability] = useState<Record<string, boolean>>({});

    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingHospitals, setLoadingHospitals] = useState(false);
    const [loadingSpecialists, setLoadingSpecialists] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterDept, setFilterDept] = useState<string | null>(null);
    const [booked, setBooked] = useState(false);
    const [bookedData, setBookedData] = useState<Record<string, unknown> | null>(null);
    const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null);

    // Fetch cities initially
    useEffect(() => {
        setLoadingCities(true);
        fetch("/api/cities").then(r => r.json()).then(d => {
            setCities(d.data || []);
        }).catch(() => setCities([])).finally(() => setLoadingCities(false));
    }, []);

    // Fetch hospitals when city changes
    useEffect(() => {
        if (!booking.city) {
            setHospitals([]);
            return;
        }
        setLoadingHospitals(true);
        fetch(`/api/hospitals?city=${encodeURIComponent(booking.city.name)}`)
            .then(r => r.json())
            .then(d => setHospitals(d.data || []))
            .catch(() => setHospitals([]))
            .finally(() => setLoadingHospitals(false));
    }, [booking.city]);

    // Fetch specialists when hospital changes
    useEffect(() => {
        if (!booking.hospital) {
            setSpecialists([]);
            return;
        }
        setLoadingSpecialists(true);
        fetch(`/api/specialists?hospitalId=${booking.hospital._id}`)
            .then(r => r.json())
            .then(d => setSpecialists(d.data || []))
            .catch(() => setSpecialists([]))
            .finally(() => setLoadingSpecialists(false));
    }, [booking.hospital]);

    // Fetch slots when date or specialist changes
    const fetchSlots = useCallback(async () => {
        if (!booking.date || !booking.specialist) return;
        setSlotsLoading(true);
        try {
            const r = await fetch(`/api/availability?date=${booking.date}&specialistId=${booking.specialist._id}`);
            const d = await r.json();
            setSlots(d.data?.slots || []);
        } catch { setSlots([]); }
        finally { setSlotsLoading(false); }
    }, [booking.date, booking.specialist]);

    useEffect(() => { fetchSlots(); }, [fetchSlots]);

    // Fetch availability for the entire month to disable unavailable days on the calendar
    useEffect(() => {
        if (!booking.specialist) {
            setMonthAvailability({});
            return;
        }

        const fetchMonthAvailability = async () => {
            // Since we don't have a bulk API, we will just rely on the existing 'availableDays' array
            // to disable days of the week, but a real prod app would fetch a month's worth of slot counts.
            // We'll keep it simple: if the specialist works on a Monday, all Mondays are clickable.
            // If a day is clicked and NO slots are returned by `fetchSlots`, they can't proceed anyway.
        };
        fetchMonthAvailability();
    }, [booking.specialist]);

    // Submit booking
    async function handleBook() {
        if (!booking.specialist) return;
        setLoadingCities(true); // Reusing loading state for submission
        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: patientId || "demo",
                    patientName: booking.patient.name,
                    patientEmail: booking.patient.email,
                    patientPhone: booking.patient.phone,
                    specialistId: booking.specialist._id,
                    doctorName: booking.specialist.name,
                    specialty: booking.specialist.specialty,
                    department: booking.specialist.department,
                    date: booking.date,
                    timeSlot: booking.timeSlot,
                    type: booking.appointmentType,
                    reason: booking.patient.reason,
                    consultationFee: booking.specialist.consultationFee,
                    status: "scheduled",
                }),
            });
            const data = await res.json();
            if (data.success) {
                setBooked(true);
                setBookedData(data.data);
                showIslandNotification({
                    id: Date.now().toString(),
                    message: `Appointment with ${booking.specialist.name} booked!`,
                    type: "success", icon: "calendar",
                });
            }
        } catch { /* ignore */ }
        finally { setLoadingCities(false); }
    }

    const canNext = () => {
        if (step === 0) return !!booking.city;
        if (step === 1) return !!booking.hospital;
        if (step === 2) return !!booking.specialist;
        if (step === 3) return !!booking.date && !!booking.timeSlot;
        if (step === 4) return !!booking.patient.name && !!booking.patient.phone && !!booking.patient.reason;
        if (step === 5) return !!paymentTxHash;
        return true;
    };

    const filteredSpecs = specialists.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.specialty.toLowerCase().includes(searchQuery.toLowerCase());
        const matchDept = !filterDept || s.department === filterDept;
        return matchSearch && matchDept;
    });

    const departments = Array.from(new Set(specialists.map(s => s.department)));

    // Generate calendar dates (current month + next)
    const today = new Date();
    const calendarDates: Date[] = [];
    for (let i = 0; i < 42; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        calendarDates.push(d);
    }

    const formatDateStr = (d: Date) => d.toISOString().split("T")[0];
    const isAvailableDay = (d: Date) => {
        if (!booking.specialist) return false;
        const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
        return (booking.specialist as unknown as { availableDays?: string[] })?.availableDays?.includes?.(dayName) ?? true;
    };

    // ── Step Navigation Bar (shared between embedded and standalone) ──
    const stepNavBar = (
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/8"
            style={{ background: "rgba(4,8,16,0.8)", backdropFilter: "blur(20px)" }}>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-white">Book Appointment</h1>
                    <p className="text-[10px] text-white/40">Step {step + 1} of {STEPS.length} — {STEPS[step].label}</p>
                </div>
            </div>
            {/* Stepper */}
            <div className="flex items-center gap-1">
                {STEPS.map((s, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <button
                            onClick={() => { if (i < step) setStep(i); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${i === step ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                i < step ? "bg-green-500/15 text-green-400 cursor-pointer hover:bg-green-500/25" : "text-white/30 cursor-default"}`}>
                            {i < step ? <CheckCircle className="w-3.5 h-3.5" /> : s.icon}
                            <span className="hidden md:inline">{s.label}</span>
                        </button>
                        {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-white/15" />}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2">
                {onMinimize && (
                    <button onClick={onMinimize} title="Minimize"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-all">
                        <Minimize2 className="w-3.5 h-3.5" /> Minimize
                    </button>
                )}
                <button onClick={onClose}
                    className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/15 hover:border-red-500/30 transition-colors">
                    <X className="w-4 h-4 text-white/60" />
                </button>
            </div>
        </div>
    );

    // ── Bottom navigation bar ──
    const bottomNav = !booked && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/8"
            style={{ background: "rgba(4,8,16,0.9)", backdropFilter: "blur(20px)" }}>
            {/* Back button */}
            <button onClick={() => step > 0 ? setStep(step - 1) : onClose()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <ChevronLeft className="w-4 h-4" />
                {step === 0 ? "Cancel" : `Back to ${STEPS[step - 1].label}`}
            </button>

            {/* Step indicator (center) */}
            <div className="flex items-center gap-2">
                {STEPS.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? "bg-blue-400 w-6" :
                        i < step ? "bg-green-400" : "bg-white/15"}`} />
                ))}
            </div>

            {/* Forward / Confirm button */}
            {step < 6 ? (
                <button onClick={() => canNext() && setStep(step + 1)} disabled={!canNext()}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${canNext()
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-400 hover:to-cyan-400 shadow-[0_0_20px_rgba(0,150,255,0.3)]"
                        : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"}`}>
                    Continue to {STEPS[step + 1].label} <ChevronRight className="w-4 h-4" />
                </button>
            ) : (
                <button onClick={handleBook} disabled={loadingCities}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold hover:from-green-400 hover:to-emerald-400 shadow-[0_0_20px_rgba(0,200,100,0.3)] transition-all">
                    {loadingCities ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Confirm Booking
                </button>
            )}
        </div>
    );

    // ── Step content ──
    const stepContent = (
        <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
                {booked ? (
                    <SuccessScreen booking={booking} bookedData={bookedData} onClose={onClose} />
                ) : step === 0 ? (
                    <Step0City key="s0" cities={cities} selected={booking.city} loading={loadingCities}
                        onSelect={(c) => setBooking(b => ({ ...b, city: c, hospital: null, specialist: null, date: "", timeSlot: "" }))} />
                ) : step === 1 ? (
                    <Step1Hospital key="s1" hospitals={hospitals} selected={booking.hospital} loading={loadingHospitals} city={booking.city}
                        onSelect={(h) => setBooking(b => ({ ...b, hospital: h, specialist: null, date: "", timeSlot: "" }))} />
                ) : step === 2 ? (
                    <Step2Specialist key="s2" specialists={filteredSpecs} departments={departments}
                        selected={booking.specialist} loading={loadingSpecialists} searchQuery={searchQuery}
                        filterDept={filterDept} onSearch={setSearchQuery} onFilterDept={setFilterDept}
                        onSelect={(s) => setBooking(b => ({ ...b, specialist: s, date: "", timeSlot: "" }))} hospital={booking.hospital} />
                ) : step === 3 ? (
                    <Step3DateTime key="s3" calendarDates={calendarDates} selectedDate={booking.date}
                        selectedSlot={booking.timeSlot} slots={slots} loading={slotsLoading}
                        specialist={booking.specialist!} appointmentType={booking.appointmentType}
                        isAvailableDay={isAvailableDay} formatDateStr={formatDateStr}
                        onSelectDate={(d) => setBooking(b => ({ ...b, date: d, timeSlot: "" }))}
                        onSelectSlot={(s) => setBooking(b => ({ ...b, timeSlot: s }))}
                        onSelectType={(t) => setBooking(b => ({ ...b, appointmentType: t }))} />
                ) : step === 4 ? (
                    <Step4PatientInfo key="s4" patient={booking.patient}
                        onChange={(p) => setBooking(b => ({ ...b, patient: p }))} />
                ) : step === 5 ? (
                    <Step5Payment key="s5" consultationFee={booking.specialist?.consultationFee || 0}
                        onSuccess={(txHash) => { setPaymentTxHash(txHash); setStep(6); }}
                        paymentCompleted={!!paymentTxHash} txHash={paymentTxHash} />
                ) : (
                    <Step6Review key="s6" booking={booking} loading={loadingCities} onConfirm={handleBook} txHash={paymentTxHash} />
                )}
            </AnimatePresence>
        </div>
    );

    // ── If embedded (inside the fullscreen overlay from AppointmentsWindow), don't render own fixed wrapper ──
    if (isEmbedded) {
        return (
            <div className="flex flex-col h-full">
                {stepNavBar}
                {stepContent}
                {bottomNav}
            </div>
        );
    }

    // ── Standalone full-screen overlay ──
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col"
            style={{ background: "linear-gradient(135deg, #060a12 0%, #0a1020 50%, #080c18 100%)" }}
        >
            {stepNavBar}
            {stepContent}
            {bottomNav}
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 0 — Select City
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Step0City({ cities, selected, loading, onSelect }: {
    cities: City[]; selected: City | null; loading: boolean;
    onSelect: (c: City) => void;
}) {
    return (
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }} className="max-w-4xl mx-auto p-6 space-y-5">
            <div>
                <h2 className="text-xl font-bold text-white mb-1">Choose a Location</h2>
                <p className="text-sm text-white/40">Select the city where you would like to book your appointment</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                    {cities.map(c => {
                        const isSelected = selected?._id === c._id;
                        return (
                            <motion.button key={c._id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => onSelect(c)}
                                className={`flex flex-col items-center justify-center gap-3 p-6 text-center rounded-2xl border transition-all ${isSelected
                                    ? "bg-blue-500/10 border-blue-500/40 shadow-[0_0_20px_rgba(0,150,255,0.15)]"
                                    : "bg-white/[0.03] border-white/8 hover:border-white/20 hover:bg-white/[0.08]"}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/60"}`}>
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <span className={`font-semibold ${isSelected ? "text-blue-400" : "text-white/80"}`}>{c.name}</span>
                            </motion.button>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 1 — Select Hospital
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Step1Hospital({ hospitals, selected, loading, city, onSelect }: {
    hospitals: Hospital[]; selected: Hospital | null; loading: boolean; city: City | null;
    onSelect: (h: Hospital) => void;
}) {
    return (
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }} className="max-w-4xl mx-auto p-6 space-y-5">
            <div>
                <h2 className="text-xl font-bold text-white mb-1">Choose a Hospital</h2>
                <p className="text-sm text-white/40">Select a hospital in {city?.name}</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
            ) : hospitals.length === 0 ? (
                <div className="text-center py-20 text-white/50 bg-white/5 rounded-2xl border border-white/10">
                    <Activity className="w-12 h-12 mx-auto text-white/20 mb-3" />
                    <p>No hospitals found in {city?.name}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {hospitals.map(h => {
                        const isSelected = selected?._id === h._id;
                        return (
                            <motion.button key={h._id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                onClick={() => onSelect(h)}
                                className={`text-left p-5 rounded-2xl border transition-all ${isSelected
                                    ? "bg-blue-500/10 border-blue-500/40 shadow-[0_0_20px_rgba(0,150,255,0.15)]"
                                    : "bg-white/[0.03] border-white/8 hover:border-white/20 hover:bg-white/[0.08]"}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-semibold text-lg max-w-[80%] ${isSelected ? "text-blue-400" : "text-white"}`}>{h.name}</h3>
                                    {isSelected && <CheckCircle className="w-5 h-5 text-blue-400 shrink-0" />}
                                </div>
                                <div className="flex items-start gap-1.5 text-xs text-white/50 mb-4 h-8 shrink-0">
                                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    <span className="line-clamp-2">{h.address}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-1 rounded-md text-[10px] font-medium border border-amber-500/20">
                                        <Star className="w-3 h-3 fill-amber-400" /> {h.rating}
                                    </div>
                                    {h.specialties.slice(0, 3).map(spec => (
                                        <div key={spec} className="bg-white/10 text-white/70 px-2 py-1 rounded-md text-[10px]">
                                            {spec}
                                        </div>
                                    ))}
                                    {h.specialties.length > 3 && (
                                        <div className="bg-white/5 text-white/50 px-2 py-1 rounded-md text-[10px]">
                                            +{h.specialties.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 2 — Select Specialist
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Step2Specialist({ specialists, departments, selected, loading, searchQuery, filterDept, hospital,
    onSearch, onFilterDept, onSelect }: {
        specialists: Specialist[]; departments: string[]; selected: Specialist | null;
        loading: boolean; searchQuery: string; filterDept: string | null; hospital: Hospital | null;
        onSearch: (q: string) => void; onFilterDept: (d: string | null) => void;
        onSelect: (s: Specialist) => void;
    }) {
    return (
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }} className="max-w-5xl mx-auto p-6 space-y-5">
            <div>
                <h2 className="text-xl font-bold text-white mb-1">Choose a Specialist</h2>
                <p className="text-sm text-white/40">Select a doctor or specialist at {hospital?.name}</p>
            </div>
            {/* Search + Department Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input value={searchQuery} onChange={e => onSearch(e.target.value)}
                        placeholder="Search by name or specialty..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => onFilterDept(null)}
                        className={`px-3 py-2 rounded-xl text-[11px] font-medium transition-all ${!filterDept ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-white/5 text-white/40 border border-white/8 hover:bg-white/8"}`}>
                        All
                    </button>
                    {departments.map(d => (
                        <button key={d} onClick={() => onFilterDept(filterDept === d ? null : d)}
                            className={`px-3 py-2 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1.5 ${filterDept === d ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-white/5 text-white/40 border border-white/8 hover:bg-white/8"}`}>
                            <span style={{ color: DEPT_COLORS[d] || "#888" }}>{DEPT_ICONS[d]}</span>
                            {d}
                        </button>
                    ))}
                </div>
            </div>
            {/* Specialist Cards */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {specialists.map(s => {
                        const isSelected = selected?._id === s._id;
                        const deptColor = DEPT_COLORS[s.department] || "#00e5ff";
                        return (
                            <motion.button key={s._id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                onClick={() => onSelect(s)}
                                className={`text-left p-4 rounded-2xl border transition-all ${isSelected
                                    ? "bg-blue-500/10 border-blue-500/40 shadow-[0_0_20px_rgba(0,150,255,0.15)]"
                                    : "bg-white/[0.03] border-white/8 hover:border-white/15 hover:bg-white/[0.05]"}`}>
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0"
                                        style={{ background: `${deptColor}20`, color: deptColor }}>
                                        {s.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-white truncate">{s.name}</h3>
                                            {isSelected && <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />}
                                        </div>
                                        <p className="text-[11px] font-medium mt-0.5" style={{ color: deptColor }}>{s.specialty}</p>
                                        <p className="text-[10px] text-white/35 mt-1 line-clamp-2">{s.bio}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="flex items-center gap-1 text-[10px] text-amber-400">
                                                <Star className="w-3 h-3 fill-amber-400" /> {s.rating} ({s.reviewCount})
                                            </span>
                                            <span className="text-[10px] text-white/30">{s.experience}y exp</span>
                                            <span className="text-[10px] text-white/30">{s.slotDuration}min</span>
                                            <span className="text-[10px] font-semibold text-green-400 ml-auto">${s.consultationFee}</span>
                                        </div>
                                        <div className="flex gap-1.5 mt-2">
                                            {(s.type === "in-person" || s.type === "both") && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 text-[9px]">
                                                    <MapPin className="w-2.5 h-2.5" /> In-person
                                                </span>
                                            )}
                                            {(s.type === "virtual" || s.type === "both") && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-[9px]">
                                                    <Video className="w-2.5 h-2.5" /> Virtual
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 3 — Date & Time
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Step3DateTime({ calendarDates, selectedDate, selectedSlot, slots, loading, specialist,
    appointmentType, isAvailableDay, formatDateStr, onSelectDate, onSelectSlot, onSelectType }: {
        calendarDates: Date[]; selectedDate: string; selectedSlot: string;
        slots: TimeSlot[]; loading: boolean; specialist: Specialist;
        appointmentType: "in-person" | "virtual";
        isAvailableDay: (d: Date) => boolean; formatDateStr: (d: Date) => string;
        onSelectDate: (d: string) => void; onSelectSlot: (s: string) => void;
        onSelectType: (t: "in-person" | "virtual") => void;
    }) {
    const today = formatDateStr(new Date());
    return (
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }} className="max-w-5xl mx-auto p-6">
            <h2 className="text-xl font-bold text-white mb-1">Select Date & Time</h2>
            <p className="text-sm text-white/40 mb-5">Choose when you&apos;d like to see {specialist.name}</p>

            {/* Appointment Type Toggle */}
            {(specialist.type === "both") && (
                <div className="flex gap-2 mb-5">
                    {(["in-person", "virtual"] as const).map(t => (
                        <button key={t} onClick={() => onSelectType(t)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${appointmentType === t
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-white/5 text-white/40 border border-white/8 hover:bg-white/8"}`}>
                            {t === "in-person" ? <MapPin className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                            {t === "in-person" ? "In-Person" : "Virtual"}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8">
                    <p className="text-xs font-semibold text-white/60 mb-3">📅 Select a Date</p>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                            <div key={d} className="text-center text-[9px] text-white/30 font-medium py-1">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDates.slice(0, 35).map((date, i) => {
                            const ds = formatDateStr(date);
                            const isPast = ds < today;
                            const isAvail = isAvailableDay(date);
                            const isSel = ds === selectedDate;
                            const isToday = ds === today;
                            return (
                                <button key={i} disabled={isPast || !isAvail}
                                    onClick={() => onSelectDate(ds)}
                                    className={`relative py-2 rounded-xl text-xs font-medium transition-all ${isSel
                                        ? "bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                                        : isPast || !isAvail ? "text-white/15 cursor-not-allowed bg-black/20"
                                            : "text-white/70 hover:bg-white/8 hover:text-white"}`}>
                                    {date.getDate()}
                                    {isToday && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/8">
                        <span className="flex items-center gap-1.5 text-[9px] text-white/30">
                            <div className="w-2 h-2 rounded-full bg-blue-500" /> Selected
                        </span>
                        <span className="flex items-center gap-1.5 text-[9px] text-white/30">
                            <div className="w-2 h-2 rounded-full bg-white/20" /> Available
                        </span>
                        <span className="flex items-center gap-1.5 text-[9px] text-white/30">
                            <div className="w-2 h-2 rounded-full bg-white/5" /> Unavailable
                        </span>
                    </div>
                </div>

                {/* Time Slots */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8">
                    <p className="text-xs font-semibold text-white/60 mb-3 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Available Time Slots
                    </p>
                    {!selectedDate ? (
                        <div className="text-center py-12 text-white/25 text-sm">Select a date first</div>
                    ) : loading ? (
                        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>
                    ) : slots.length === 0 ? (
                        <div className="text-center py-12 text-white/25 text-sm">No slots available on this date</div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
                            {slots.map(s => (
                                <button key={s.time} disabled={s.status !== "available"}
                                    onClick={() => onSelectSlot(s.time)}
                                    className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${selectedSlot === s.time
                                        ? "bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                                        : s.status === "available" ? "bg-white/5 text-white/70 border border-white/8 hover:bg-white/10 hover:border-blue-500/30"
                                            : s.status === "booked" ? "bg-red-500/10 text-red-400/40 cursor-not-allowed border border-red-500/10"
                                                : "bg-white/[0.02] text-white/15 cursor-not-allowed"}`}>
                                    {s.time}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 4 — Patient Info
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Step4PatientInfo({ patient, onChange }: {
    patient: BookingState["patient"];
    onChange: (p: BookingState["patient"]) => void;
}) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const validate = (field: string, value: string) => {
        const e = { ...errors };
        if (field === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) e.email = "Invalid email";
        else delete e.email;
        if (field === "phone" && value && !/^[\d\s\-+()]{7,15}$/.test(value)) e.phone = "Invalid phone";
        else delete e.phone;
        setErrors(e);
    };
    const update = (field: string, value: string) => {
        onChange({ ...patient, [field]: value });
        validate(field, value);
    };

    const inputCls = (field: string) =>
        `w-full px-4 py-3 rounded-xl bg-white/5 border text-sm text-white placeholder-white/25 outline-none transition-colors ${errors[field] ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-blue-500/50"}`;

    return (
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }} className="max-w-lg mx-auto p-6 space-y-5">
            <div>
                <h2 className="text-xl font-bold text-white mb-1">Patient Information</h2>
                <p className="text-sm text-white/40">Please fill in your details</p>
            </div>
            <div className="space-y-3">
                <div>
                    <label className="text-[11px] text-white/50 font-medium mb-1 block">Full Name *</label>
                    <input value={patient.name} onChange={e => update("name", e.target.value)}
                        placeholder="Enter your full name" className={inputCls("name")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[11px] text-white/50 font-medium mb-1 block">Email</label>
                        <input value={patient.email} onChange={e => update("email", e.target.value)}
                            placeholder="your@email.com" type="email" className={inputCls("email")} />
                        {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="text-[11px] text-white/50 font-medium mb-1 block">Phone *</label>
                        <input value={patient.phone} onChange={e => update("phone", e.target.value)}
                            placeholder="+1 (555) 000-0000" className={inputCls("phone")} />
                        {errors.phone && <p className="text-[10px] text-red-400 mt-1">{errors.phone}</p>}
                    </div>
                </div>
                <div>
                    <label className="text-[11px] text-white/50 font-medium mb-1 block">Reason for Visit *</label>
                    <textarea value={patient.reason} onChange={e => update("reason", e.target.value)}
                        placeholder="Describe your symptoms or reason for the appointment..."
                        rows={4} className={`${inputCls("reason")} resize-none`} />
                </div>
            </div>
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 5 — Payment (Sepolia ETH)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Step5Payment({ consultationFee, onSuccess, paymentCompleted, txHash }: {
    consultationFee: number; onSuccess: (txHash: string) => void;
    paymentCompleted: boolean; txHash: string | null;
}) {
    return (
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }} className="max-w-lg mx-auto p-6 space-y-5">
            <div>
                <h2 className="text-xl font-bold text-white mb-1">Payment</h2>
                <p className="text-sm text-white/40">Complete payment via Sepolia ETH to confirm your appointment</p>
            </div>

            {paymentCompleted ? (
                <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30 text-center space-y-3">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
                    <p className="text-green-400 font-semibold">Payment Successful!</p>
                    <p className="text-xs text-white/40 break-all">Tx: {txHash}</p>
                    <p className="text-xs text-white/50">Click &quot;Continue&quot; to review and confirm your appointment.</p>
                </div>
            ) : (
                <PaymentProviders>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-white/40">Consultation Fee</span>
                                <span className="text-lg font-bold text-green-400">${consultationFee}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-white/40">ETH Payment Amount</span>
                                <span className="text-sm font-semibold text-purple-400">0.0000001 Sepolia ETH</span>
                            </div>
                        </div>
                        <CryptoPayment amount={consultationFee} onSuccess={onSuccess} />
                    </div>
                </PaymentProviders>
            )}
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 6 — Review & Confirm
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Step6Review({ booking, loading, onConfirm, txHash }: {
    booking: BookingState; loading: boolean; onConfirm: () => void; txHash: string | null;
}) {
    const s = booking.specialist!;
    const deptColor = DEPT_COLORS[s.department] || "#00e5ff";
    const dateObj = new Date(booking.date + "T12:00:00");
    const dateStr = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

    return (
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }} className="max-w-lg mx-auto p-6 space-y-5">
            <div>
                <h2 className="text-xl font-bold text-white mb-1">Review & Confirm</h2>
                <p className="text-sm text-white/40">Please review your appointment details</p>
            </div>
            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
                {/* Specialist */}
                <div className="p-4 flex items-center gap-3 border-b border-white/8">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold"
                        style={{ background: `${deptColor}20`, color: deptColor }}>{s.avatar}</div>
                    <div>
                        <p className="text-sm font-semibold text-white">{s.name}</p>
                        <p className="text-[11px]" style={{ color: deptColor }}>{s.specialty} • {s.department}</p>
                    </div>
                </div>
                {/* Details */}
                <div className="p-4 space-y-3">
                    {[
                        { icon: <Calendar className="w-3.5 h-3.5" />, label: "Date", value: dateStr },
                        { icon: <Clock className="w-3.5 h-3.5" />, label: "Time", value: `${booking.timeSlot} (${s.slotDuration} min)` },
                        { icon: booking.appointmentType === "virtual" ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />, label: "Type", value: booking.appointmentType === "virtual" ? "Virtual Consultation" : "In-Person Visit" },
                        { icon: <User className="w-3.5 h-3.5" />, label: "Patient", value: booking.patient.name },
                        { icon: <Stethoscope className="w-3.5 h-3.5" />, label: "Reason", value: booking.patient.reason },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 shrink-0 mt-0.5">{item.icon}</div>
                            <div>
                                <p className="text-[10px] text-white/35 uppercase tracking-wider">{item.label}</p>
                                <p className="text-xs text-white/80">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Fee */}
                <div className="p-4 border-t border-white/8 flex items-center justify-between">
                    <span className="text-xs text-white/40">Consultation Fee</span>
                    <span className="text-lg font-bold text-green-400">${s.consultationFee}</span>
                </div>
                {/* Payment confirmation */}
                {txHash && (
                    <div className="p-4 border-t border-white/8">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-xs text-green-400 font-medium">Payment Confirmed (Sepolia ETH)</span>
                        </div>
                        <p className="text-[10px] text-white/30 break-all">Tx: {txHash}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUCCESS SCREEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SuccessScreen({ booking, bookedData, onClose }: {
    booking: BookingState; bookedData: Record<string, unknown> | null; onClose: () => void;
}) {
    const s = booking.specialist!;
    const dateObj = new Date(booking.date + "T12:00:00");
    const dateStr = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

    const handleDownloadReceipt = () => {
        const doc = new jsPDF();

        // Setup styles
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(10, 20, 40);

        // Header
        doc.text("HealthOS Appointment Receipt", 20, 30);

        // Separator
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 35, 190, 35);

        // Content
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);

        let y = 45;
        const addRow = (label: string, value: string) => {
            doc.setFont("helvetica", "bold");
            doc.text(`${label}:`, 20, y);
            doc.setFont("helvetica", "normal");
            doc.text(value, 60, y);
            y += 10;
        };

        addRow("Doctor", s.name);
        addRow("Specialty", `${s.specialty} (${s.department})`);

        y += 5;
        addRow("Date", dateStr);
        addRow("Time", booking.timeSlot);
        addRow("Type", booking.appointmentType === "virtual" ? "Virtual Consultation" : "In-Person Visit");
        addRow("Duration", `${s.slotDuration} minutes`);

        y += 5;
        addRow("Patient Name", booking.patient.name);
        addRow("Phone", booking.patient.phone);
        if (booking.patient.email) addRow("Email", booking.patient.email);

        y += 5;
        addRow("Consultation Fee", `$${s.consultationFee}`);
        addRow("Reference ID", ((bookedData as Record<string, string>)?._id) || "N/A");
        addRow("Status", "CONFIRMED");

        // Footer
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y + 10, 190, y + 10);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Thank you for choosing HealthOS for your healthcare needs.", 20, y + 20);

        doc.save(`HealthOS-Receipt-${booking.date}.pdf`);
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-md mx-auto p-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
            {/* Animated checkmark */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
                <CheckCircle className="w-10 h-10 text-green-400" />
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }} className="text-2xl font-bold text-white mb-2">
                Appointment Booked!
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-sm text-white/50 mb-6">
                Your appointment with {s.name} has been confirmed for {dateStr} at {booking.timeSlot}.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="flex gap-3">
                <button onClick={handleDownloadReceipt}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 transition-all">
                    <Download className="w-4 h-4" /> Download Receipt
                </button>
                <button onClick={onClose}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold hover:from-blue-400 hover:to-cyan-400 transition-all">
                    Back to OS
                </button>
            </motion.div>
        </motion.div>
    );
}

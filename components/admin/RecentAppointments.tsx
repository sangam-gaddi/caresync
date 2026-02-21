"use client";

import { motion } from "framer-motion";
import {
    Calendar, ArrowUpRight, Search,
    MoreVertical, User, MapPin, Video
} from "lucide-react";

const APPOINTMENTS = [
    { id: "1", patient: "Rahul Sharma", doctor: "Dr. Vikram Singh", time: "09:00 AM", date: "Today", type: "in-person", status: "confirmed" },
    { id: "2", patient: "Priya Patel", doctor: "Dr. Neha Reddy", time: "10:30 AM", date: "Today", type: "virtual", status: "pending" },
    { id: "3", patient: "Amit Kumar", doctor: "Dr. Rahul Sharma", time: "01:00 PM", date: "Today", type: "in-person", status: "confirmed" },
    { id: "4", patient: "Sneha Gupta", doctor: "Dr. Amit Kumar", time: "02:15 PM", date: "Today", type: "virtual", status: "cancelled" },
    { id: "5", patient: "Aditya Desai", doctor: "Dr. Pooja Verma", time: "04:30 PM", date: "Today", type: "in-person", status: "confirmed" },
];

interface RecentAppointmentsProps {
    recentData?: any[];
}

export default function RecentAppointments({ recentData }: RecentAppointmentsProps) {
    const displayData = recentData || APPOINTMENTS;

    return (
        <div className="bg-[#0c1220] rounded-3xl border border-white/5 overflow-hidden group hover:border-white/10 transition-all">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-black text-white tracking-tight">Recent Appointments</h4>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Daily Schedule</p>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors">
                    View All <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/[0.02]">
                            <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">Patient</th>
                            <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">Doctor</th>
                            <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">Time</th>
                            <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {displayData.map((app: any, i: number) => (
                            <motion.tr
                                key={app._id || app.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group/row hover:bg-white/[0.02] transition-all"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <User className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <p className="text-xs font-bold text-white tracking-tight">{app.patientName || app.patient}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-semibold text-white/60">{app.doctorName || app.doctor}</td>
                                <td className="px-6 py-4 text-xs font-semibold text-white/60">{app.timeSlot || app.time}</td>
                                <td className="px-6 py-4">
                                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${app.type === 'virtual' ? 'text-purple-400' : 'text-slate-400'}`}>
                                        {app.type === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                        {app.type}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${app.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                                        app.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                            'bg-red-500/10 text-red-400'
                                        }`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors">
                                        <MoreVertical className="w-4 h-4 text-white/20" />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

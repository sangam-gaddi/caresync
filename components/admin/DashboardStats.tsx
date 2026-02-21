"use client";

import {
    Users, CalendarDays, DollarSign, Activity,
    TrendingUp, TrendingDown, ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";

const STATS = [
    {
        label: "Total Patients",
        value: "4,281",
        change: "+12.5%",
        trend: "up",
        icon: Users,
        color: "text-blue-400",
        bg: "bg-blue-500/10"
    },
    {
        label: "Appointments Today",
        value: "64",
        change: "+8.2%",
        trend: "up",
        icon: CalendarDays,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10"
    },
    {
        label: "Expected Revenue",
        value: "$12,450",
        change: "-3.1%",
        trend: "down",
        icon: DollarSign,
        color: "text-green-400",
        bg: "bg-green-500/10"
    },
    {
        label: "System Health",
        value: "99.9%",
        change: "Stable",
        trend: "neutral",
        icon: Activity,
        color: "text-purple-400",
        bg: "bg-purple-500/10"
    },
];

export default function DashboardStats({ kpis }: { kpis?: any }) {
    const stats_data = [
        {
            label: "Total Appointments",
            value: kpis?.totalPatients?.toLocaleString() || "0",
            change: "+12.5%",
            trend: "up",
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/10"
        },
        {
            label: "Appointments Today",
            value: kpis?.appointmentsToday?.toLocaleString() || "0",
            change: "+8.2%",
            trend: "up",
            icon: CalendarDays,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10"
        },
        {
            label: "Expected Revenue",
            value: `$${kpis?.revenueToday?.toLocaleString() || "0"}`,
            change: "-3.1%",
            trend: "down",
            icon: DollarSign,
            color: "text-green-400",
            bg: "bg-green-500/10"
        },
        {
            label: "Active Specialist",
            value: kpis?.doctorsCount?.toLocaleString() || "0",
            change: "Stable",
            trend: "neutral",
            icon: Activity,
            color: "text-purple-400",
            bg: "bg-purple-500/10"
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats_data.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-3xl bg-[#0c1220] border border-white/5 hover:border-white/10 transition-all group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${stat.trend === "up" ? "bg-green-500/10 text-green-400" :
                            stat.trend === "down" ? "bg-red-500/10 text-red-400" :
                                "bg-white/5 text-white/30"
                            }`}>
                            {stat.change}
                            {stat.trend === "up" && <ArrowUpRight className="w-3 h-3" />}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-white tracking-tight">{stat.value}</h3>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

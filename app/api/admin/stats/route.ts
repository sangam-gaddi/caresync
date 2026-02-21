import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/lib/models/appointment';
import Specialist from '@/lib/models/specialist';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const today = new Date().toISOString().split('T')[0];

        // Basic aggregation logic
        // In a real app with 100k+ records, we'd use more optimized queries.

        const totalAppointments = await Appointment.countDocuments();
        const appointmentsToday = await Appointment.countDocuments({ date: today });
        const doctorsCount = await Specialist.countDocuments();

        // Calculate revenue today
        const todaysApps = await Appointment.find({ date: today, status: { $ne: 'cancelled' } });
        const revenueToday = todaysApps.reduce((acc, curr) => acc + (curr.consultationFee || 0), 0);

        // Get some trend data (last 7 days)
        const last7Days: string[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push(d.toISOString().split('T')[0]);
        }

        const chartData = await Promise.all(last7Days.map(async (date) => {
            const apps = await Appointment.find({ date, status: { $ne: 'cancelled' } });
            const rev = apps.reduce((acc, curr) => acc + (curr.consultationFee || 0), 0);
            return {
                name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                revenue: rev
            };
        }));

        // Get recent appointments
        const recentAppointments = await Appointment.find()
            .sort({ createdAt: -1 })
            .limit(5);

        return NextResponse.json({
            success: true,
            data: {
                kpis: {
                    totalPatients: totalAppointments, // Approximating patients with appointments for now
                    appointmentsToday,
                    doctorsCount,
                    revenueToday
                },
                chartData,
                recentAppointments
            }
        });

    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

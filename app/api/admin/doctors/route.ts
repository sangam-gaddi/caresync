import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Specialist from '@/lib/models/specialist';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const doctors = await Specialist.find().sort({ name: 1 });

        return NextResponse.json({ success: true, data: doctors });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

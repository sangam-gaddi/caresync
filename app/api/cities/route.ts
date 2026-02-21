import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import City from '@/lib/models/city';

export async function GET() {
    try {
        await connectDB();
        const cities = await City.find({ active: true }).sort({ name: 1 });
        return NextResponse.json({ success: true, data: cities });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch cities' }, { status: 500 });
    }
}

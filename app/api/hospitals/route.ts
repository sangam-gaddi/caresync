import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hospital from '@/lib/models/hospital';
import City from '@/lib/models/city';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const searchParams = request.nextUrl.searchParams;
        const cityParam = searchParams.get('city');

        let query: Record<string, unknown> = { active: true };

        if (cityParam) {
            // Find the city first
            const cityDoc = await City.findOne({
                name: { $regex: new RegExp(`^${cityParam}$`, 'i') }
            });

            if (cityDoc) {
                query.cityId = cityDoc._id;
            } else {
                return NextResponse.json({ success: true, data: [] });
            }
        }

        const hospitals = await Hospital.find(query).sort({ rating: -1 });
        return NextResponse.json({ success: true, data: hospitals });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch hospitals' }, { status: 500 });
    }
}

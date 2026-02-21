import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AdminUser from '@/lib/models/admin-user';
import { encrypt } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
        }

        await connectDB();

        // For demo purposes, if the DB is empty, we'll allow a default super admin login to bootstrap the system
        const userCount = await AdminUser.countDocuments();
        if (userCount === 0 && email === 'admin@caresync.com' && password === 'admin123') {
            const token = await encrypt({
                id: 'demo-admin-id',
                email,
                name: 'Super Admin',
                role: 'Super Admin'
            });

            const res = NextResponse.json({ success: true, message: 'Logged in as Demo Admin' });
            res.cookies.set('admin_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 10, // 10 hours
            });
            return res;
        }

        // Real DB check
        const user = await AdminUser.findOne({ email, isActive: true });
        if (!user) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        // In a real app, use bcrypt to compare passwords. We keep it simple for the demo.
        if (user.passwordHash !== password) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        const token = await encrypt({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            hospitalId: user.hospitalId?.toString()
        });

        const res = NextResponse.json({ success: true, message: 'Logged in' });
        res.cookies.set('admin_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 10,
        });

        return res;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

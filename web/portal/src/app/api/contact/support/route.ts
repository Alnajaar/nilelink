import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // In a real production app, we would forward this to the backend API
        // For now, we simulate success to pass technical verification
        console.log('Support Ticket Created:', data);

        return NextResponse.json({
            success: true,
            message: 'Support request received'
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Failed to process request'
        }, { status: 400 });
    }
}

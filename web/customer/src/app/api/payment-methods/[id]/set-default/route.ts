import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { PaymentService } from '@/lib/services/PaymentService';

const paymentService = new PaymentService();

export const PATCH = withAuth(async (user, req) => {
    try {
        // Extract ID from URL
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const id = pathParts[pathParts.length - 2]; // .../id/set-default

        await paymentService.setDefault(user.id, id);

        return NextResponse.json({
            success: true,
            message: 'Default payment method updated'
        });
    } catch (error) {
        console.error('PATCH /api/payment-methods/[id]/set-default failed:', error);
        return NextResponse.json({ success: false, error: 'Failed to update default payment method' }, { status: 500 });
    }
});

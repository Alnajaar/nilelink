import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { PaymentService } from '@/lib/services/PaymentService';

const paymentService = new PaymentService();

export const GET = withAuth(async (user) => {
    try {
        const paymentMethods = await paymentService.listPaymentMethods(user.id);
        return NextResponse.json({
            success: true,
            data: { paymentMethods }
        });
    } catch (error) {
        console.error('GET /api/payment-methods failed:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch payment methods' }, { status: 500 });
    }
});

export const POST = withAuth(async (user, req) => {
    try {
        const body = await req.json();
        const { type, last4, brand, isDefault } = body;

        const newMethod = await paymentService.addPaymentMethod(user.id, {
            type,
            last4,
            brand,
            isDefault: !!isDefault
        });

        return NextResponse.json({
            success: true,
            data: { paymentMethod: newMethod }
        });
    } catch (error) {
        console.error('POST /api/payment-methods failed:', error);
        return NextResponse.json({ success: false, error: 'Failed to add payment method' }, { status: 500 });
    }
});

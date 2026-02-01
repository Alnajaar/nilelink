import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/OrderService';
import { withAuth } from '@/lib/middleware/auth';

const orderService = new OrderService();

export const GET = withAuth(async (user, req) => {
    try {
        // Extract ID from URL
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const id = pathParts[pathParts.length - 1];

        console.log(`Fetching order detail for ID: ${id}, user: ${user.id}`);

        const order = await orderService.getOrder(id);

        if (!order) {
            console.log(`Order ${id} not found`);
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        // Security check
        if (order.uid !== user.id) {
            console.log(`Unauthorized access attempt to order ${id} by user ${user.id}`);
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('GET /api/orders/[id] failed:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
});

import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { AffiliateService } from '@/lib/services/AffiliateService';
import { serverEmailService } from '@/lib/services/EmailService';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '@/lib/services/UserService';
import { OrderService } from '@/lib/services/OrderService';
import { withAuth } from '@/lib/middleware/auth';

const orderService = new OrderService();

export const GET = withAuth(async (user) => {
    try {
        const orders = await orderService.listOrders(user.id);
        return NextResponse.json({
            success: true,
            data: { orders }
        });
    } catch (error) {
        console.error('GET /api/orders failed:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
});

export const POST = withAuth(async (user, request) => {
    try {
        const body = await request.json();
        const { restaurantId, restaurantName, items, deliveryAddress, specialInstructions, paymentMethod, total } = body;

        // 1. Get user tracking for referral attribution
        const referralCode = request.cookies.get('referralCode')?.value;

        // Generate a UUID for the order
        const orderId = uuidv4();

        // 2. Persist order details
        await orderService.createOrder({
            id: orderId,
            uid: user.id,
            restaurantId,
            restaurantName: restaurantName || 'Restaurant',
            items,
            total,
            status: 'PENDING',
            paymentMethod,
            deliveryAddress
        });

        const client = await Database.getClient();

        try {
            await client.query('BEGIN');

            // 3. Record commission if referral
            let referralId = null;
            if (referralCode) {
                const affResult = await client.query('SELECT id FROM affiliates WHERE referral_code = $1', [referralCode]);
                if (affResult.rows.length > 0) {
                    const affiliateId = affResult.rows[0].id;
                    const refResult = await client.query(
                        'SELECT id FROM referrals WHERE affiliate_id = $1 AND referred_user_id = $2',
                        [affiliateId, user.id]
                    );

                    if (refResult.rows.length > 0) {
                        referralId = refResult.rows[0].id;
                    }
                }
            }

            if (referralId) {
                const affiliateService = new AffiliateService();
                await affiliateService.recordCommission(referralId, total, orderId, `Order ${orderId} (${paymentMethod})`);
            }

            // 4. Send Confirmation Email
            try {
                const userService = new UserService();
                const profile = await userService.getProfile(user.id);
                if (profile && profile.email) {
                    await serverEmailService.sendOrderInvoice(profile.email, {
                        id: orderId,
                        total,
                        customerName: profile.firstName,
                        items: items
                    });
                }
            } catch (emailErr) {
                console.error('Failed to send order confirmation email:', emailErr);
            }

            await client.query('COMMIT');
            return NextResponse.json({
                success: true,
                order: { id: orderId, status: 'PENDING', paymentMethod }
            });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }

    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
    }
});

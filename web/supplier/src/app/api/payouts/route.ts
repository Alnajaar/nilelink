import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Payouts API Route
 * Handles requesting and tracking financial settlements
 */

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return Response.json({ error: 'userId is required' }, { status: 400 });
        }

        // Fetch all settlements for this user (as owner or supplier)
        const settlements = await prisma.settlement.findMany({
            where: {
                ownerId: userId
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return Response.json(settlements);
    } catch (error) {
        console.error('[Payouts API] GET failed:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, amount, method, ownerType, details } = body;

        // Basic validation
        if (!userId || !amount || !method || !ownerType) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (amount <= 0) {
            return Response.json({ error: 'Invalid amount' }, { status: 400 });
        }

        // Create a new settlement record
        // This serves as the "Auditable Request"
        const settlement = await prisma.settlement.create({
            data: {
                ownerId: userId,
                ownerType: ownerType, // 'SUPPLIER', 'BUSINESS', 'DRIVER', etc.
                amount: parseFloat(amount),
                currency: 'USD', // Default
                periodStart: new Date(), // Payouts are usually for all current earnings
                periodEnd: new Date(),
                status: 'PENDING',
                method: method, // 'CRYPTO', 'CASH', 'BANK'
                details: details || `Payout request via ${method}`,
                transactionIds: [] // Will be populated on processing
            }
        });

        // If it's a Crypto payout, we might want to trigger a contract event here
        // or let the frontend handle the contract call and just record the hash.

        return Response.json({
            success: true,
            message: 'Payout request recorded',
            settlement
        }, { status: 201 });

    } catch (error) {
        console.error('[Payouts API] POST failed:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

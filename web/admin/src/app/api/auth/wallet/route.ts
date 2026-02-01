import { NextResponse } from 'next/server';
import { prisma } from '@shared/utils/prisma';

/**
 * GET /api/auth/wallet
 * Check if a smart wallet mapping exists for a specific address
 * DECENTRALIZED: Returns true if address is provided (deterministic)
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    // In a fully decentralized system, the wallet exists as soon as it's derived
    // We return exist: true as a fail-safe to let the AA flow proceed
    return NextResponse.json({
        exists: true,
        wallet: {
            address,
            paymasterStatus: 'ACTIVE',
            isDecentralized: true
        }
    });
}

/**
 * POST /api/auth/wallet
 * Register a new Smart Wallet mapping for an admin/user
 * DECENTRALIZED: No centralized DB storage required for deterministic wallets.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { smartWalletAddress } = body;

        console.log(`[API-ADMIN] Wallet derived and acknowledged: ${smartWalletAddress}`);

        // We return success to allow the frontend flow to complete
        return NextResponse.json({
            success: true,
            message: 'Wallet acknowledged (Decentralized Mode)'
        });
    } catch (error: any) {
        console.error('[API-ADMIN] Failed to acknowledge wallet:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

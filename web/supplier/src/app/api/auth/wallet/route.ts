import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/auth/wallet
 * Check if a smart wallet mapping exists
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    try {
        const wallet = await prisma.smartWallet.findUnique({
            where: { address }
        });

        return NextResponse.json({ exists: !!wallet, wallet });
    } catch (error) {
        console.error('[API] Failed to fetch wallet:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/auth/wallet
 * Register a new Smart Wallet mapping for a user
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, firebaseUid, smartWalletAddress, ownerAddress } = body;

        if (!userId || !smartWalletAddress) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create the Smart Wallet record
        const wallet = await prisma.smartWallet.create({
            data: {
                user: { connect: { id: userId } },
                address: smartWalletAddress,
                factoryAddress: '0x', // Default or from SDK
                paymasterStatus: 'ACTIVE'
            }
        });

        // 2. Optionally update the User's firebaseUid and traditional walletAddress
        await prisma.user.update({
            where: { id: userId },
            data: {
                firebaseUid: firebaseUid || undefined,
                walletAddress: ownerAddress || undefined
            }
        });

        return NextResponse.json({ success: true, wallet });
    } catch (error: any) {
        console.error('[API] Failed to register wallet:', error);
        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Wallet mapping already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

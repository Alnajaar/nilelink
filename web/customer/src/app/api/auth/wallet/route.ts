import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin
initAdmin();

export async function POST(req: NextRequest) {
    try {
        const { message, signature, address } = await req.json();

        if (!message || !signature || !address) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
        }

        // 1. Verify SIWE signature
        const siweMessage = new SiweMessage(message);
        const { success, data, error } = await siweMessage.verify({ signature });

        if (!success) {
            console.error('SIWE Verification Failed:', error);
            return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
        }

        // 2. Map wallet to Firebase user
        const auth = getAuth();
        const uid = `wallet:${address.toLowerCase()}`;

        let userRecord;
        try {
            userRecord = await auth.getUser(uid);
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                // Create new user for this wallet
                userRecord = await auth.createUser({
                    uid,
                    displayName: `${address.slice(0, 6)}...${address.slice(-4)}`,
                    // No email or phone initially
                });

                // Add custom claims if needed
                await auth.setCustomUserClaims(uid, { wallet: true, address: address.toLowerCase() });
            } else {
                throw err;
            }
        }

        // 3. Generate Custom Token
        const customToken = await auth.createCustomToken(uid);

        return NextResponse.json({
            success: true,
            token: customToken,
            user: {
                uid: userRecord.uid,
                displayName: userRecord.displayName
            }
        });

    } catch (error: any) {
        console.error('Wallet Auth Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

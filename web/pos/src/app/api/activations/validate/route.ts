import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * POST /api/activations/validate - Validate and activate a license key
 * 
 * DECENTRALIZED: Uses Firebase Firestore (no centralized database)
 */
export async function POST(req: NextRequest) {
    try {
        const { code, businessId } = await req.json();

        if (!code || !businessId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate code from Firebase
        const codeDoc = await db.collection('access_codes').doc(code).get();

        if (!codeDoc.exists) {
            return NextResponse.json(
                { success: false, error: 'Invalid activation code' },
                { status: 404 }
            );
        }

        const codeData = codeDoc.data();

        // Validation checks
        if (codeData.used) {
            return NextResponse.json(
                { success: false, error: 'Code already used' },
                { status: 400 }
            );
        }

        if (codeData.userId !== businessId) {
            return NextResponse.json(
                { success: false, error: 'Code not valid for this account' },
                { status: 403 }
            );
        }

        if (codeData.expiresAt < Date.now()) {
            return NextResponse.json(
                { success: false, error: 'Activation code expired' },
                { status: 410 }
            );
        }

        // Mark code as used
        await db.collection('access_codes').doc(code).update({
            used: true,
            usedAt: Date.now()
        });

        // Update activation request status
        await db.collection('activation_requests').doc(businessId).update({
            status: 'active',
            activatedAt: Date.now()
        });

        return NextResponse.json({
            success: true,
            message: 'Business activated successfully',
            status: 'ACTIVE'
        });

    } catch (error: any) {
        console.error('[Activation Validation API] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

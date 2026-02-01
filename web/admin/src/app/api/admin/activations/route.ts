import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * GET /api/admin/activations - Fetch pending activation requests
 * 
 * DECENTRALIZED: Uses Firebase Firestore (no centralized PostgreSQL)
 */
export async function GET(req: NextRequest) {
    try {
        const snapshot = await db.collection('activation_requests')
            .where('status', '==', 'pending')
            .orderBy('requestedAt', 'desc')
            .get();

        const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({
            success: true,
            requests
        });

    } catch (error: any) {
        console.error('[Admin Activations API] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/activations - Generate activation code for a business
 * 
 * DECENTRALIZED: Stores in Firebase Firestore
 */
export async function POST(req: NextRequest) {
    try {
        const { businessId } = await req.json();

        if (!businessId) {
            return NextResponse.json(
                { success: false, error: 'businessId is required' },
                { status: 400 }
            );
        }

        // Generate unique activation code
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase() +
            Math.random().toString(36).substring(2, 6).toUpperCase();
        const code = `NL-${randomPart.slice(0, 4)}-${randomPart.slice(4, 8)}`;

        // Store in Firebase (decentralized)
        await db.collection('activation_requests').doc(businessId).update({
            visibleCode: code,
            updatedAt: Date.now()
        });

        // Also store the code in a separate collection for validation
        await db.collection('access_codes').doc(code).set({
            code,
            userId: businessId,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
            used: false,
            generatedAt: Date.now()
        });

        return NextResponse.json({
            success: true,
            code,
            businessId
        });

    } catch (error: any) {
        console.error('[Admin Activations API] Generation Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

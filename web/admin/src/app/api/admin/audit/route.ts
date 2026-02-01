import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * DECENTRALIZED Audit Log API
 * Uses Firebase Firestore instead of centralized database
 */
export async function POST(req: NextRequest) {
    try {
        const { action, targetId, details } = await req.json();

        // In production, verify requester is SUPER_ADMIN via Firebase Auth token
        const adminId = 'root-admin'; // TODO: Extract from auth token

        const logData = {
            adminId,
            action,
            targetId: targetId || null,
            details: details || {},
            timestamp: Date.now()
        };

        // Store in Firebase (decentralized)
        const logRef = await db.collection('audit_logs').add(logData);

        return NextResponse.json({
            success: true,
            log: { id: logRef.id, ...logData }
        });
    } catch (error) {
        console.error('[AUDIT API ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to record audit log' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        // Fetch from Firebase (decentralized)
        const snapshot = await db.collection('audit_logs')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();

        const logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch audit logs' },
            { status: 500 }
        );
    }
}

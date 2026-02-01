import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * Admin Payouts API
 * Allows Super Admins to view and process payout requests
 */

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'PENDING';

        // Query settlements from Firebase
        let query = db.collection('settlements');
        
        if (status !== 'ALL') {
            query = query.where('status', '==', status);
        }
        
        // Order by createdAt descending and limit to 100
        const settlementsSnapshot = await query.orderBy('createdAt', 'desc').limit(100).get();
        
        const settlements = [];
        settlementsSnapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id; // Add the document ID
            settlements.push(data);
        });

        return Response.json(settlements);
    } catch (error) {
        console.error('[Admin Payouts API] GET failed:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, status, reference } = body;

        if (!id || !status) {
            return Response.json({ error: 'Missing id or status' }, { status: 400 });
        }

        // Update settlement in Firebase
        const now = Date.now();
        await db.collection('settlements').doc(id).update({
            status: status,
            reference: reference || null,
            processedAt: now
        });

        // Get the updated settlement data
        const settlementDoc = await db.collection('settlements').doc(id).get();
        const updated = settlementDoc.data();
        updated.id = id;

        // Create a WalletTransaction if it's marked as COMPLETED
        if (status === 'COMPLETED') {
            await db.collection('wallet_transactions').add({
                walletId: updated.ownerId, // Using ownerId as walletId for now
                type: 'DEBIT',
                amount: updated.amount,
                currency: updated.currency,
                description: `Payout processed via ${updated.method || 'UNKNOWN_METHOD'}`,
                referenceType: 'SETTLEMENT',
                referenceId: updated.id,
                status: 'COMPLETED',
                createdAt: now,
                completedAt: now
            });
        }

        return Response.json({ success: true, settlement: updated });
    } catch (error) {
        console.error('[Admin Payouts API] PUT failed:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

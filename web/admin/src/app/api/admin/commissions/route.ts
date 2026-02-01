import { NextRequest, NextResponse } from 'next/server';
import { graphService } from '@shared/services/GraphService';
import { db } from '@/lib/firebase-admin';

/**
 * DECENTRALIZED Commissions API
 * Uses The Graph Protocol + Firebase instead of centralized database
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const tab = searchParams.get('tab') || 'pos';

        if (tab === 'pos') {
            // Fetch businesses from The Graph (on-chain data)
            const businesses = await graphService.getAllBusinesses();

            // Fetch commission overrides from Firebase
            const overridesSnapshot = await db.collection('commission_overrides')
                .where('type', '==', 'MERCHANT')
                .get();

            const overrides = overridesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return NextResponse.json({
                success: true,
                data: businesses.map(b => ({
                    id: b.id,
                    name: b.name,
                    owner: b.owner,
                    type: b.businessType,
                    plan: b.plan,
                    status: b.isActive ? 'ACTIVE' : 'INACTIVE',
                    commissionRule: overrides.find((o: any) => o.businessId === b.id) || null
                }))
            });
        }

        if (tab === 'supplier') {
            // Fetch suppliers from The Graph
            const suppliers = await graphService.getAllSuppliers();

            // Fetch supplier commission rules from Firebase
            const rulesSnapshot = await db.collection('commission_overrides')
                .where('type', '==', 'SUPPLIER')
                .get();

            const rules = rulesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return NextResponse.json({
                success: true,
                data: suppliers.map(s => ({
                    id: s.id,
                    name: s.name,
                    owner: s.owner,
                    status: s.isActive ? 'VERIFIED' : 'PENDING',
                    commissionRule: rules.find((r: any) => r.supplierId === s.id) || null
                }))
            });
        }

        if (tab === 'affiliate') {
            // Fetch affiliates from The Graph
            const affiliates = await graphService.getAffiliateStats();

            return NextResponse.json({
                success: true,
                data: affiliates.map(a => ({
                    id: a.id,
                    name: `Affiliate ${a.id.slice(0, 8)}`,
                    tier: a.tier || 'BRONZE',
                    rate: a.commissionRate || 0.10,
                    earnings: a.totalEarnings || 0
                }))
            });
        }

        return NextResponse.json({ success: false, error: 'Invalid tab' }, { status: 400 });

    } catch (error: any) {
        console.error('[Commissions API] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * POST - Update commission rules (stored in Firebase)
 */
export async function POST(req: NextRequest) {
    try {
        const { type, entityId, commissionPct, isZeroCommission, justification } = await req.json();

        const ruleData = {
            type, // MERCHANT, SUPPLIER, AFFILIATE
            entityId,
            commissionPct,
            isZeroCommission: isZeroCommission || false,
            justification: justification || null,
            updatedAt: Date.now(),
            updatedBy: 'ADMIN' // TODO: Get from auth context
        };

        // Store in Firebase (decentralized)
        const docId = `${type}_${entityId}`;
        await db.collection('commission_overrides').doc(docId).set(ruleData, { merge: true });

        // Log the change in Firebase audit log
        await db.collection('audit_logs').add({
            action: 'COMMISSION_UPDATE',
            entityType: type,
            entityId,
            oldValue: null,
            newValue: ruleData,
            timestamp: Date.now(),
            adminId: 'ADMIN'
        });

        return NextResponse.json({ success: true, data: ruleData });

    } catch (error: any) {
        console.error('[Commissions API] Update Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

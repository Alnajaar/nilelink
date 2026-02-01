import { NextResponse } from 'next/server';
import { gasControlService } from '@/shared/services/GasControlService';

/**
 * GET /api/admin/web3/gas
 * Returns platform-wide gas sponsorship statistics and top spenders
 */
export async function GET() {
    try {
        const stats = await gasControlService.getPlatformStats();
        return NextResponse.json(stats);
    } catch (error: any) {
        console.error('[ADMIN-API] Failed to fetch gas stats:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/web3/gas
 * Updates merchant quotas or toggles sponsorship status
 */
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { userId, newQuotaUsd6, isActive } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const updates = [];

        if (newQuotaUsd6 !== undefined) {
            updates.push(gasControlService.adjustMerchantQuota(userId, newQuotaUsd6));
        }

        if (isActive !== undefined) {
            updates.push(gasControlService.toggleSponsorship(userId, isActive));
        }

        await Promise.all(updates);

        return NextResponse.json({ success: true, message: 'Gas control policies updated' });
    } catch (error: any) {
        console.error('[ADMIN-API] Failed to update gas policies:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

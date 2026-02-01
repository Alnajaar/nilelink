import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { LoyaltyService } from '@/lib/services/LoyaltyService';

export async function POST(req: NextRequest) {
    return withAuth(async (user) => {
        try {
            const body = await req.json();
            const { rewardId } = body;

            if (!rewardId) {
                return NextResponse.json({ success: false, error: 'Missing rewardId' }, { status: 400 });
            }

            const service = new LoyaltyService();
            await service.redeemReward(user.id, rewardId);

            return NextResponse.json({
                success: true
            });
        } catch (error) {
            console.error('Error redeeming reward:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to redeem reward';
            return NextResponse.json(
                { success: false, error: errorMessage },
                { status: 400 }
            );
        }
    })(req);
}

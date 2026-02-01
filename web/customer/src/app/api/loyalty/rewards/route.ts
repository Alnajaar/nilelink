import { NextResponse } from 'next/server';
import { LoyaltyService } from '@/lib/services/LoyaltyService';

export async function GET() {
    try {
        const service = new LoyaltyService();
        const rewards = await service.getRewards();
        return NextResponse.json({ success: true, data: { rewards } });
    } catch (error) {
        console.error('Error fetching rewards:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch rewards' },
            { status: 500 }
        );
    }
}

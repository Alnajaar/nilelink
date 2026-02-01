import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { LoyaltyService } from '@/lib/services/LoyaltyService';

export async function GET(req: NextRequest) {
    return withAuth(async (user) => {
        try {
            const service = new LoyaltyService();
            const profile = await service.getProfile(user.id);

            return NextResponse.json({
                success: true,
                data: profile
            });
        } catch (error) {
            console.error('Error fetching loyalty profile:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch loyalty profile' },
                { status: 500 }
            );
        }
    })(req);
}

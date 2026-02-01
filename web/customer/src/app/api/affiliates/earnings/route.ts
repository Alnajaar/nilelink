import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { AffiliateService } from '@/lib/services/AffiliateService';

// GET /api/affiliates/earnings - Get affiliate's commission history
export async function GET(req: NextRequest) {
    return withAuth(async (user) => {
        try {
            const affiliateService = new AffiliateService();
            const profile = await affiliateService.getAffiliateProfile(user.id);

            if (!profile) {
                return Response.json(
                    { success: false, error: 'User is not enrolled in affiliate program' },
                    { status: 400 }
                );
            }

            const earnings = await affiliateService.getCommissions(profile.id);

            return Response.json({
                success: true,
                earnings
            });
        } catch (error) {
            console.error('Error fetching earnings:', error);
            return Response.json(
                { success: false, error: 'Failed to fetch earnings' },
                { status: 500 }
            );
        }
    })(req);
}

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { AffiliateService } from '@/lib/services/AffiliateService';

// GET /api/affiliates/referrals - Get affiliate's referred businesses
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

      const referrals = await affiliateService.getAffiliateReferrals(profile.id);

      return Response.json({
        success: true,
        data: referrals
      });
    } catch (error) {
      console.error('Error fetching referrals:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch referrals' },
        { status: 500 }
      );
    }
  })(req);
}
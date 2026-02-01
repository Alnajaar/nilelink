import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { AffiliateService } from '@/lib/services/AffiliateService';

// GET /api/affiliates/me - Get affiliate profile and stats
export async function GET(req: NextRequest) {
  return withAuth(async (user) => {
    try {
      const affiliateService = new AffiliateService();
      const profile = await affiliateService.getAffiliateProfile(user.id);
      
      if (!profile) {
        // If no affiliate profile exists, return empty data
        return Response.json({
          success: true,
          data: {
            profile: null,
            stats: {
              totalReferrals: 0,
              activeReferrals: 0,
              lifetimeEarnings: 0,
              pendingEarnings: 0,
              balance: 0
            }
          }
        });
      }

      const stats = await affiliateService.getAffiliateStats(profile.id);

      return Response.json({
        success: true,
        data: {
          profile,
          stats
        }
      });
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch affiliate data' },
        { status: 500 }
      );
    }
  })(req);
}
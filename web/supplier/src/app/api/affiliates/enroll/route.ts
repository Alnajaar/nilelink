import { NextRequest } from 'next/server';
import { withAuth } from '../../../../lib/middleware/auth';
import { AffiliateService } from '../../../../lib/services/AffiliateService';

// POST /api/affiliates/enroll - Enroll user in affiliate program
export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    try {
      const affiliateService = new AffiliateService();
      
      // Check if user is already enrolled
      const existingProfile = await affiliateService.getAffiliateProfile(user.id);
      if (existingProfile) {
        return Response.json(
          { success: false, error: 'User is already enrolled in affiliate program' },
          { status: 400 }
        );
      }

      // Enroll the user
      const profile = await affiliateService.enrollAffiliate({
        userId: user.id,
        email: user.email || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.id,
        status: 'PENDING',
        commissionRate: 0.10,
        lifetimeEarnings: 0,
        pendingEarnings: 0,
        balance: 0,
        tier: 'BRONZE'
      });

      return Response.json({
        success: true,
        data: { profile }
      });
    } catch (error) {
      console.error('Error enrolling affiliate:', error);
      return Response.json(
        { success: false, error: 'Failed to enroll in affiliate program' },
        { status: 500 }
      );
    }
  })(req);
}
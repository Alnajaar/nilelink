import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { AffiliateService } from '@/lib/services/AffiliateService';

// GET /api/affiliates/share - Get affiliate share information for mobile apps
export async function GET(req: NextRequest) {
  return withAuth(async (user) => {
    try {
      const affiliateService = new AffiliateService();
      const profile = await affiliateService.getAffiliateProfile(user.id);
      
      if (!profile) {
        return Response.json(
          { 
            success: false, 
            error: 'User is not enrolled in affiliate program',
            canEnroll: true
          },
          { status: 404 }
        );
      }
      
      // Generate share information
      const shareInfo = {
        referralCode: profile.referralCode,
        referralLink: `${req.headers.get('origin') || 'https://nilelink.app'}/register?ref=${profile.referralCode}`,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${req.headers.get('origin') || 'https://nilelink.app'}/register?ref=${profile.referralCode}`)}`,
        stats: {
          totalReferrals: 0, // Would be calculated from referrals
          activeReferrals: 0,
          lifetimeEarnings: profile.lifetimeEarnings,
          pendingEarnings: profile.pendingEarnings,
          balance: profile.balance
        },
        commissionRate: profile.commissionRate,
        tier: profile.tier
      };

      return Response.json({
        success: true,
        data: shareInfo
      });
    } catch (error) {
      console.error('Error fetching affiliate share info:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch affiliate share information' },
        { status: 500 }
      );
    }
  })(req);
}
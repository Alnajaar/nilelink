import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { AffiliateService } from '@/lib/services/AffiliateService';

// GET /api/affiliates/payouts - Get affiliate's payout history
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

      const payouts = await affiliateService.getAffiliatePayouts(profile.id);

      return Response.json({
        success: true,
        data: payouts
      });
    } catch (error) {
      console.error('Error fetching payouts:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch payouts' },
        { status: 500 }
      );
    }
  })(req);
}

// POST /api/affiliates/payouts - Request a payout
export async function POST(req: NextRequest) {
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

      const { amount, method, details } = await req.json();

      // Validate input
      if (!amount || amount <= 0) {
        return Response.json(
          { success: false, error: 'Invalid amount specified' },
          { status: 400 }
        );
      }

      if (amount < 50) { // Minimum payout threshold
        return Response.json(
          { success: false, error: 'Minimum payout is $50' },
          { status: 400 }
        );
      }

      if (profile.balance < amount) {
        return Response.json(
          { success: false, error: 'Insufficient balance for payout' },
          { status: 400 }
        );
      }

      // Process payout request
      const payout = await affiliateService.requestPayout({
        affiliateId: profile.id,
        amount,
        method: method || 'IN_APP_WALLET',
        details: details || {}
      });

      return Response.json({
        success: true,
        data: { payout }
      });
    } catch (error) {
      console.error('Error processing payout:', error);
      return Response.json(
        { success: false, error: 'Failed to process payout request' },
        { status: 500 }
      );
    }
  })(req);
}
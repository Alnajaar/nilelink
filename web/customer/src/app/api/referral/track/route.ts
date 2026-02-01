import { NextRequest } from 'next/server';
import { AffiliateService } from '@/lib/services/AffiliateService';

// POST /api/referral/track - Track a referral from a referral code
export async function POST(req: NextRequest) {
  try {
    const { referralCode, businessData } = await req.json();

    // Validate input
    if (!referralCode || !businessData) {
      return Response.json(
        { success: false, error: 'Missing referral code or business data' },
        { status: 400 }
      );
    }

    const affiliateService = new AffiliateService();
    
    // Track the referral
    const tracked = await affiliateService.trackReferral(referralCode, businessData);

    if (!tracked) {
      return Response.json(
        { success: false, error: 'Invalid referral code' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: 'Referral tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking referral:', error);
    return Response.json(
      { success: false, error: 'Failed to track referral' },
      { status: 500 }
    );
  }
}
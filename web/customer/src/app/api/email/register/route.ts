import { NextRequest } from 'next/server';
import { Database } from '@/lib/db';
import { AffiliateService } from '@/lib/services/AffiliateService';

// POST /api/email/register - Register user with email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, walletAddress, firstName, lastName } = body;

    // Check for referral code in cookies
    const referralCode = request.cookies.get('nilelink_ref')?.value;

    console.log('Email registration request received:', { email, walletAddress, referralCode });

    if (!email || !walletAddress) {
      return Response.json(
        { success: false, error: 'Email and wallet address are required' },
        { status: 400 }
      );
    }

    // 1. Register user in database
    const client = await Database.getClient();
    try {
      // Check if user already exists
      const existingUser = await client.query('SELECT * FROM users WHERE email = $1 OR wallet_address = $2', [email, walletAddress]);

      let userId;
      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
      } else {
        const result = await client.query(
          'INSERT INTO users (email, wallet_address, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [email, walletAddress, firstName || '', lastName || '', 'CUSTOMER']
        );
        userId = result.rows[0].id;
      }

      // 2. Attribute referral if code exists
      if (referralCode) {
        const affiliateService = new AffiliateService();
        await affiliateService.trackReferral(referralCode, {
          id: userId,
          name: `${firstName || ''} ${lastName || ''}`.trim() || email,
          email: email
        });
        console.log(`Attributed referral for user ${userId} to code ${referralCode}`);
      }

      return Response.json({
        success: true,
        message: 'Registration successful',
        data: { userId, email, walletAddress }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error registering email:', error);
    return Response.json(
      { success: false, error: 'Failed to register email' },
      { status: 500 }
    );
  }
}
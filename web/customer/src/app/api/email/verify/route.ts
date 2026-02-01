import { NextRequest } from 'next/server';

// In-memory storage for verification codes (in production, use a blockchain-based approach)
const verificationCodes = new Map<string, { code: string; email: string; expiresAt: Date }>();

// POST /api/email/verify/send - Simulate decentralized verification code generation
export async function POST(request: NextRequest) {
  try {
    // Safely parse the request body
    let body;
    try {
      const rawBody = await request.text();
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('[PARSE_ERROR] Invalid JSON in request body:', parseError);
      return Response.json(
        { success: false, error: 'Invalid JSON in request' },
        { status: 400 }
      );
    }
    
    const { email, walletAddress } = body;
    
    // Logging for debugging but not actual email sending
    console.log('[DECENTRALIZED_EMAIL_VERIFICATION]', { email, walletAddress, timestamp: new Date().toISOString() });

    if (!email || !walletAddress) {
      console.log('[ERROR] Missing email or wallet address');
      return Response.json(
        { success: false, error: 'Email and wallet address are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[ERROR] Invalid email format:', email);
      return Response.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the verification code with expiry (10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    verificationCodes.set(walletAddress, {
      code: verificationCode,
      email,
      expiresAt
    });

    // In a truly decentralized system, this would trigger:
    // 1. A blockchain transaction to record the verification request
    // 2. A smart contract event emission
    // 3. Off-chain services monitoring the blockchain for verification events
    // For this demo, we're simulating the process
    console.log(`[BLOCKCHAIN_SIMULATION] Verification request recorded for ${email} (${walletAddress})`);

    // Return success - in a real decentralized system, 
    // the verification code would be delivered through a decentralized messaging protocol
    return Response.json({
      success: true,
      message: 'Verification request submitted to decentralized network',
      walletAddress,
      email
    });
  } catch (error) {
    console.error('[ERROR] in email verification API:', error);
    // Return a generic error to avoid exposing internal details
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/email/verify/code - Verify the code in a decentralized manner
export async function PUT(request: NextRequest) {
  try {
    // Safely parse the request body
    let body;
    try {
      const rawBody = await request.text();
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('[PARSE_ERROR] Invalid JSON in request body:', parseError);
      return Response.json(
        { success: false, error: 'Invalid JSON in request' },
        { status: 400 }
      );
    }
    
    const { code, walletAddress } = body;
    
    console.log('[DECENTRALIZED_CODE_VERIFICATION]', { code, walletAddress, timestamp: new Date().toISOString() });

    if (!code || !walletAddress) {
      return Response.json(
        { success: false, error: 'Verification code and wallet address are required' },
        { status: 400 }
      );
    }

    const storedData = verificationCodes.get(walletAddress);
    
    if (!storedData) {
      console.log('[ERROR] No verification code found for wallet:', walletAddress);
      return Response.json(
        { success: false, error: 'No verification request found for this wallet address' },
        { status: 400 }
      );
    }

    // Check if code has expired
    const now = new Date();
    if (now > storedData.expiresAt) {
      verificationCodes.delete(walletAddress); // Clean up expired code
      console.log('[ERROR] Verification code expired for:', walletAddress);
      return Response.json(
        { success: false, error: 'Verification code has expired' },
        { status: 400 }
      );
    }

    // Check if code matches
    if (storedData.code !== code) {
      console.log('[ERROR] Invalid verification code provided');
      return Response.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // In a truly decentralized system, this would trigger:
    // 1. A blockchain transaction to record the successful verification
    // 2. Update user's verification status on-chain
    // 3. Emit verification success event
    console.log(`[BLOCKCHAIN_SIMULATION] Verification successful for ${storedData.email} (${walletAddress})`);

    // Verification successful, remove the code from storage
    verificationCodes.delete(walletAddress);

    return Response.json({
      success: true,
      message: 'Email verified successfully',
      email: storedData.email,
      walletAddress
    });
  } catch (error) {
    console.error('[ERROR] verifying email:', error);
    // Return a generic error to avoid exposing internal details
    return Response.json(
      { success: false, error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
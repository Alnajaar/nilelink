import jwt from 'jsonwebtoken';

// In a real application, this would be stored securely
const SECRET_KEY = process.env.JWT_SECRET || 'nilelink_affiliate_secret_key';

export interface UserPayload {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  walletAddress?: string;
  exp?: number;
}

export function verifyToken(token: string): UserPayload | null {
  try {
    // For this implementation, we'll decode the token without verifying
    // In a real application, you'd use the secret key
    const decoded = jwt.verify(token, SECRET_KEY) as UserPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function signToken(payload: UserPayload): string {
  // Add expiration (24 hours)
  const expiresIn = '24h';
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}
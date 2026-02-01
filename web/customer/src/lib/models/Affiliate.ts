export interface Affiliate {
  id: string;
  referralCode: string;
  userId: string;
  email: string;
  name: string;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'DECLINED';
  commissionRate: number;
  lifetimeEarnings: number;
  pendingEarnings: number;
  balance: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  createdAt: Date;
  updatedAt: Date;
}

export interface AffiliateStats {
  totalReferrals: number;
  activeReferrals: number;
  lifetimeEarnings: number;
  pendingEarnings: number;
  balance: number;
}

export interface Referral {
  id: string;
  affiliateId: string;
  businessId: string;
  businessName: string;
  contactEmail: string;
  status: 'INVITED' | 'REGISTERED' | 'APPROVED' | 'ACTIVE' | 'DECLINED';
  commissionRate: number;
  totalCommissionEarned: number;
  firstOrderDate: Date | null;
  lastActivityDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayoutRequest {
  id: string;
  affiliateId: string;
  amount: number;
  method: 'BANK_TRANSFER' | 'PAYPAL' | 'CRYPTO' | 'IN_APP_WALLET';
  details: Record<string, any>; // Method-specific details
  status: 'REQUESTED' | 'PROCESSING' | 'PAID' | 'REJECTED';
  requestedAt: Date;
  processedAt: Date | null;
}

export interface CommissionRule {
  id: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'RECURRING';
  rate: number;
  description: string;
  conditions: Record<string, any>;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionRecord {
  id: string;
  affiliateId: string;
  referralId: string;
  orderId: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REVERSED';
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
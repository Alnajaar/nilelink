import { prisma } from '@shared/utils/prisma';

export interface AffiliateProfile {
  id: string;
  userId: string;
  referralCode: string;
  status: string;
  commissionRate: number;
  balance: number;
  totalEarnings: number;
}

export class AffiliateService {
  /**
   * Get affiliate profile by user ID
   */
  async getAffiliateProfile(userId: string) {
    return prisma.affiliate.findUnique({
      where: { userId }
    });
  }

  /**
   * Enroll a new affiliate
   */
  async enrollAffiliate(data: { userId: string; email: string; name: string }) {
    const referralCode = this.generateReferralCode();

    return prisma.affiliate.create({
      data: {
        userId: data.userId,
        referralCode,
        status: 'ACTIVE',
        commissionRate: 0.10, // 10%
        balance: 0,
        pendingEarnings: 0,
        totalEarnings: 0,
        tier: 'BRONZE'
      }
    });
  }

  /**
   * Get affiliate statistics
   */
  async getAffiliateStats(userId: string) {
    const affiliate = await this.getAffiliateProfile(userId);
    if (!affiliate) return null;

    const referralsCount = await prisma.referral.count({
      where: { affiliateId: affiliate.id }
    });

    const activeReferralsCount = await prisma.referral.count({
      where: { affiliateId: affiliate.id, status: 'ACTIVE' }
    });

    return {
      totalReferrals: referralsCount,
      activeReferrals: activeReferralsCount,
      lifetimeEarnings: affiliate.totalEarnings,
      pendingEarnings: affiliate.pendingEarnings,
      balance: affiliate.balance
    };
  }

  /**
   * Get affiliate referrals
   */
  async getAffiliateReferrals(userId: string) {
    const affiliate = await this.getAffiliateProfile(userId);
    if (!affiliate) return [];

    return prisma.referral.findMany({
      where: { affiliateId: affiliate.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Add a referral link
   */
  async addReferral(affiliateId: string, referredUserId: string) {
    return prisma.referral.create({
      data: {
        affiliateId,
        referredUserId,
        status: 'ACTIVE',
        commissionRate: 0.10
      }
    });
  }

  /**
   * Generate a unique referral code
   */
  public generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Track a referral from a code
   */
  async trackReferral(referralCode: string, referredUserId: string): Promise<boolean> {
    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode }
    });

    if (!affiliate) return false;

    // Check if already referred
    const existing = await prisma.referral.findFirst({
      where: { affiliateId: affiliate.id, referredUserId }
    });

    if (existing) return true;

    await this.addReferral(affiliate.id, referredUserId);
    return true;
  }
}

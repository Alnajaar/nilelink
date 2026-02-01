import { Affiliate, AffiliateStats, Referral, PayoutRequest } from '../models/Affiliate';
import { db } from '../firebase-admin';
import { v4 as uuidv4 } from 'uuid';

// Global persistence for fallback (Development/No-Auth mode)
declare global {
  var __affiliates_store: Map<string, Affiliate> | undefined;
  var __referrals_store: Map<string, Referral[]> | undefined;
}

// Initialize global stores
const inMemoryAffiliates = global.__affiliates_store || new Map<string, Affiliate>();
const inMemoryReferrals = global.__referrals_store || new Map<string, Referral[]>();

if (process.env.NODE_ENV !== 'production') {
  global.__affiliates_store = inMemoryAffiliates;
  global.__referrals_store = inMemoryReferrals;
}

export class AffiliateService {
  private collection = db.collection('affiliates');
  private referralsCollection = db.collection('referrals');
  private useFirestore = !!process.env.FIREBASE_PRIVATE_KEY;

  /**
   * Get affiliate profile by user ID
   */
  async getAffiliateProfile(userId: string): Promise<Affiliate | null> {
    try {
      // Only try Firestore if we have credentials
      if (this.useFirestore) {
        const snapshot = await this.collection.where('userId', '==', userId).limit(1).get();
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          return this.mapDocToAffiliate(data);
        }
        return null; // If in Firestore mode and not found, it really doesn't exist
      }

      // Fallback to in-memory storage for development without keys
      return inMemoryAffiliates.get(userId) || null;

    } catch (error) {
      console.warn('Firestore getProfile failed, running in fallback mode.');
      return inMemoryAffiliates.get(userId) || null;
    }
  }

  /**
   * Enroll a new affiliate
   */
  async enrollAffiliate(affiliateData: Omit<Affiliate, 'id' | 'referralCode' | 'createdAt' | 'updatedAt'>): Promise<Affiliate> {
    const referralCode = this.generateReferralCode();
    const id = uuidv4();
    const now = new Date();

    const newAffiliate: Affiliate = {
      id,
      userId: affiliateData.userId,
      referralCode,
      email: affiliateData.email,
      name: affiliateData.name,
      status: affiliateData.status || 'ACTIVE', // Default to ACTIVE for MVP
      commissionRate: 0.10,
      lifetimeEarnings: 0,
      pendingEarnings: 0,
      balance: 0,
      tier: 'BRONZE',
      createdAt: now,
      updatedAt: now
    };

    try {
      if (this.useFirestore) {
        // Check for existing
        const existing = await this.collection.where('userId', '==', affiliateData.userId).get();
        if (!existing.empty) {
          return this.mapDocToAffiliate(existing.docs[0].data());
        }

        // Create new
        await this.collection.doc(id).set({
          ...newAffiliate,
          // Convert dates to timestamps (Firestore does this automatically but good to be explicit or let SDK handle)
          createdAt: now,
          updatedAt: now
        });
        return newAffiliate;
      }

      // Fallback
      throw new Error('No Firebase Credentials in Dev');
    } catch (error) {
      console.warn('Firestore enrollment failed, using fallback:', error);
      // Fallback implementation
      if (inMemoryAffiliates.has(affiliateData.userId)) {
        return inMemoryAffiliates.get(affiliateData.userId)!;
      }

      inMemoryAffiliates.set(affiliateData.userId, newAffiliate);
      inMemoryReferrals.set(newAffiliate.id, []);
      return newAffiliate;
    }
  }

  /**
   * Get affiliate statistics
   */
  async getAffiliateStats(affiliateId: string): Promise<AffiliateStats> {
    try {
      if (this.useFirestore) {
        // Get affiliate to ensure they exist and get earnings
        const affiliateDoc = await this.collection.doc(affiliateId).get();

        if (!affiliateDoc.exists) {
          // Try looking up by user ID if passed ID was a user ID (common mistake)
          const byUser = await this.collection.where('userId', '==', affiliateId).limit(1).get();
          if (!byUser.empty) {
            const data = byUser.docs[0].data();
            // Recursively call with correct ID or just parse here.
            // faster to just parse here
            return this.calculateStatsFromData(data, byUser.docs[0].id);
          }
          return this.getEmptyStats();
        }

        return this.calculateStatsFromData(affiliateDoc.data(), affiliateId);
      }
      throw new Error('No Firebase Credentials');

    } catch (error) {
      console.warn('Firestore stats failed, using fallback:', error);

      // Fallback
      // Check if ID is affiliate ID or User ID
      let affiliate = Array.from(inMemoryAffiliates.values()).find(a => a.id === affiliateId);
      if (!affiliate) {
        affiliate = inMemoryAffiliates.get(affiliateId);
      }

      if (affiliate) {
        const referrals = inMemoryReferrals.get(affiliate.id) || [];
        return {
          totalReferrals: referrals.length,
          activeReferrals: referrals.filter(r => r.status === 'ACTIVE').length,
          lifetimeEarnings: affiliate.lifetimeEarnings,
          pendingEarnings: affiliate.pendingEarnings,
          balance: affiliate.balance
        };
      }
      return this.getEmptyStats();
    }
  }

  /**
   * Helper to map Firestore doc to Affiliate object
   */
  private mapDocToAffiliate(data: any): Affiliate {
    return {
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as Affiliate;
  }

  private async calculateStatsFromData(affiliateData: any, affiliateId: string): Promise<AffiliateStats> {
    // Get referrals count
    const refsSnapshot = await this.referralsCollection.where('affiliateId', '==', affiliateId).count().get();
    const activeRefsSnapshot = await this.referralsCollection.where('affiliateId', '==', affiliateId).where('status', '==', 'ACTIVE').count().get();

    return {
      totalReferrals: refsSnapshot.data().count,
      activeReferrals: activeRefsSnapshot.data().count,
      lifetimeEarnings: affiliateData.lifetimeEarnings || 0,
      pendingEarnings: affiliateData.pendingEarnings || 0,
      balance: affiliateData.balance || 0
    };
  }

  private getEmptyStats(): AffiliateStats {
    return {
      totalReferrals: 0,
      activeReferrals: 0,
      lifetimeEarnings: 0,
      pendingEarnings: 0,
      balance: 0
    };
  }

  private generateReferralCode(): string {
    return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}

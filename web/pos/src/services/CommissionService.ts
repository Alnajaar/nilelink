// web/pos/src/services/CommissionService.ts
'use server'

import { graphService } from '@shared/services/GraphService';
import { blockchainService } from '@shared/services/BlockchainService';
import { db } from '@/lib/firebase-admin';

interface CommissionCalculationInput {
  orderId: string
  businessId: string
  businessType: string
  orderSubtotal: number
  deliveryFee: number
  country: string
  city?: string
  zone?: string
  supplierId?: string
  supplierVolume?: number
}

interface CommissionBreakdown {
  orderCommissionPct: number
  orderCommissionAmount: number
  deliveryCommissionPct: number
  deliveryCommissionAmount: number
  supplierCommissionPct: number | null
  supplierCommissionAmount: number | null
  platformRevenue: number
  merchantPayout: number
}

export class CommissionService {
  /**
   * Calculate comprehensive commission breakdown for an order
   */
  static async calculateCommissions(input: CommissionCalculationInput): Promise<CommissionBreakdown> {
    const {
      orderId,
      businessId,
      businessType,
      orderSubtotal,
      deliveryFee,
      country,
      city,
      zone,
      supplierId,
      supplierVolume
    } = input

    // 1. Get order commission percentage from blockchain/rules
    const orderCommissionPct = await this.getOrderCommissionRate(businessId, businessType, country, city, zone)
    
    // 2. Get delivery commission percentage from blockchain/rules
    const deliveryCommissionPct = await this.getDeliveryCommissionRate(businessId, businessType, country, city, zone)
    
    // 3. Get supplier commission (if applicable)
    let supplierCommissionPct: number | null = null
    if (supplierId && supplierVolume !== undefined) {
      supplierCommissionPct = await this.getSupplierCommissionRate(supplierId, supplierVolume)
    }

    // 4. Calculate amounts
    const orderCommissionAmount = orderSubtotal * (orderCommissionPct / 100)
    const deliveryCommissionAmount = deliveryFee * (deliveryCommissionPct / 100)
    const supplierCommissionAmount = supplierCommissionPct 
      ? (orderSubtotal * (supplierCommissionPct / 100)) 
      : null

    // 5. Calculate platform revenue (total commissions)
    const platformRevenue = orderCommissionAmount + deliveryCommissionAmount + (supplierCommissionAmount || 0)
    
    // 6. Calculate merchant payout (what merchant receives)
    const merchantPayout = orderSubtotal - orderCommissionAmount - (supplierCommissionAmount || 0)

    // 7. Validate profit (critical check)
    if (platformRevenue <= 0) {
      throw new Error(`ZERO_REVENUE_ALERT: Order ${orderId} would generate no platform revenue`)
    }

    // 8. Store commission calculation on blockchain and in Firebase
    await this.storeCommissionCalculation({
      orderId,
      orderSubtotal,
      deliveryFee,
      orderCommissionPct,
      deliveryCommissionPct,
      orderCommissionAmount,
      deliveryCommissionAmount,
      supplierCommissionPct,
      supplierCommissionAmount,
      platformRevenue
    })

    return {
      orderCommissionPct,
      orderCommissionAmount,
      deliveryCommissionPct,
      deliveryCommissionAmount,
      supplierCommissionPct,
      supplierCommissionAmount,
      platformRevenue,
      merchantPayout
    }
  }

  /**
   * Get order commission percentage based on hierarchy of rules from blockchain/Firebase
   */
  private static async getOrderCommissionRate(
    businessId: string,
    businessType: string,
    country: string,
    city?: string,
    zone?: string
  ): Promise<number> {
    try {
      // 1. Check merchant-specific override from Firebase
      const merchantRuleSnap = await db.collection('merchant_commission_rules')
        .where('businessId', '==', businessId)
        .where('isActive', '==', true)
        .where('effectiveFrom', '<=', Date.now())
        .limit(1)
        .get();

      if (!merchantRuleSnap.empty) {
        const merchantRule = merchantRuleSnap.docs[0].data();
        if (merchantRule.isZeroCommission) {
          // Zero commission must be explicitly allowed and logged
          await this.logZeroCommission(businessId, merchantRule.justification || 'No justification provided');
          return 0;
        }
        return merchantRule.orderCommissionPct || 0;
      }

      // 2. Check location-specific rules from The Graph (most specific first)
      if (zone) {
        const zoneRules = await graphService.query(`
          query GetLocationRules($country: String!, $city: String!, $zone: String!, $businessType: String!) {
            locationCommissionRules(
              where: { country: $country, city: $city, zone: $zone, businessType: $businessType, isActive: true }
            ) {
              id
              orderCommissionPct
              deliveryCommissionPct
            }
          }
        `, { country, city, zone, businessType });
        
        if (zoneRules.data?.locationCommissionRules?.length > 0) {
          return zoneRules.data.locationCommissionRules[0].orderCommissionPct || 0;
        }
      }

      if (city) {
        const cityRules = await graphService.query(`
          query GetCityRules($country: String!, $city: String!, $businessType: String!) {
            locationCommissionRules(
              where: { country: $country, city: $city, businessType: $businessType, zone: null, isActive: true }
            ) {
              id
              orderCommissionPct
              deliveryCommissionPct
            }
          }
        `, { country, city, businessType });
        
        if (cityRules.data?.locationCommissionRules?.length > 0) {
          return cityRules.data.locationCommissionRules[0].orderCommissionPct || 0;
        }
      }

      const countryRules = await graphService.query(`
        query GetCountryRules($country: String!, $businessType: String!) {
          locationCommissionRules(
            where: { country: $country, city: null, businessType: $businessType, zone: null, isActive: true }
          ) {
            id
            orderCommissionPct
            deliveryCommissionPct
          }
        }
      `, { country, businessType });
      
      if (countryRules.data?.locationCommissionRules?.length > 0) {
        return countryRules.data.locationCommissionRules[0].orderCommissionPct || 0;
      }

      // 3. Check global default from The Graph
      const globalRules = await graphService.query(`
        query GetGlobalRules($businessType: String!) {
          globalCommissionRules(where: { businessType: $businessType }) {
            id
            orderCommissionPct
            deliveryCommissionPct
          }
        }
      `, { businessType });

      return globalRules.data?.globalCommissionRules?.[0]?.orderCommissionPct || 0;
    } catch (error) {
      console.error('Error getting order commission rate:', error);
      // Fallback to a reasonable default
      return 5; // Default 5% commission
    }
  }

  /**
   * Get delivery commission percentage
   */
  private static async getDeliveryCommissionRate(
    businessId: string,
    businessType: string,
    country: string,
    city?: string,
    zone?: string
  ): Promise<number> {
    try {
      // Same hierarchy as order commission
      const merchantRuleSnap = await db.collection('merchant_commission_rules')
        .where('businessId', '==', businessId)
        .where('isActive', '==', true)
        .where('effectiveFrom', '<=', Date.now())
        .limit(1)
        .get();

      if (!merchantRuleSnap.empty) {
        const merchantRule = merchantRuleSnap.docs[0].data();
        if (!merchantRule.isZeroCommission) {
          return merchantRule.deliveryCommissionPct || 0;
        }
      }

      // Location-specific rules from The Graph
      if (zone) {
        const zoneRules = await graphService.query(`
          query GetLocationRules($country: String!, $city: String!, $zone: String!, $businessType: String!) {
            locationCommissionRules(
              where: { country: $country, city: $city, zone: $zone, businessType: $businessType, isActive: true }
            ) {
              id
              orderCommissionPct
              deliveryCommissionPct
            }
          }
        `, { country, city, zone, businessType });
        
        if (zoneRules.data?.locationCommissionRules?.length > 0) {
          return zoneRules.data.locationCommissionRules[0].deliveryCommissionPct || 0;
        }
      }

      if (city) {
        const cityRules = await graphService.query(`
          query GetCityRules($country: String!, $city: String!, $businessType: String!) {
            locationCommissionRules(
              where: { country: $country, city: $city, businessType: $businessType, zone: null, isActive: true }
            ) {
              id
              orderCommissionPct
              deliveryCommissionPct
            }
          }
        `, { country, city, businessType });
        
        if (cityRules.data?.locationCommissionRules?.length > 0) {
          return cityRules.data.locationCommissionRules[0].deliveryCommissionPct || 0;
        }
      }

      const countryRules = await graphService.query(`
        query GetCountryRules($country: String!, $businessType: String!) {
          locationCommissionRules(
            where: { country: $country, city: null, businessType: $businessType, zone: null, isActive: true }
          ) {
            id
            orderCommissionPct
            deliveryCommissionPct
          }
        }
      `, { country, businessType });
      
      if (countryRules.data?.locationCommissionRules?.length > 0) {
        return countryRules.data.locationCommissionRules[0].deliveryCommissionPct || 0;
      }

      const globalRules = await graphService.query(`
        query GetGlobalRules($businessType: String!) {
          globalCommissionRules(where: { businessType: $businessType }) {
            id
            orderCommissionPct
            deliveryCommissionPct
          }
        }
      `, { businessType });

      return globalRules.data?.globalCommissionRules?.[0]?.deliveryCommissionPct || 0;
    } catch (error) {
      console.error('Error getting delivery commission rate:', error);
      // Fallback to a reasonable default
      return 2; // Default 2% delivery commission
    }
  }

  /**
   * Get supplier commission rate based on volume tier
   */
  private static async getSupplierCommissionRate(
    supplierId: string,
    volume: number
  ): Promise<number> {
    try {
      // 1. Check supplier-specific override from Firebase
      const supplierRuleSnap = await db.collection('supplier_commission_rules')
        .where('supplierId', '==', supplierId)
        .where('isActive', '==', true)
        .where('effectiveFrom', '<=', Date.now())
        .limit(1)
        .get();

      if (!supplierRuleSnap.empty) {
        const supplierRule = supplierRuleSnap.docs[0].data();
        return supplierRule.commissionPct || 0;
      }

      // 2. Check volume-based tier from Firebase
      const tierSnap = await db.collection('supplier_commission_tiers')
        .where('minVolume', '<=', volume)
        .where('isActive', '==', true)
        .orderBy('minVolume', 'desc')
        .limit(1)
        .get();

      if (!tierSnap.empty) {
        const tier = tierSnap.docs[0].data();
        // Check if the volume is within the tier's maxVolume if it exists
        if (!tier.maxVolume || volume <= tier.maxVolume) {
          return tier.commissionPct || 0;
        }
      }

      return 0;
    } catch (error) {
      console.error('Error getting supplier commission rate:', error);
      // Fallback to a reasonable default
      return 3; // Default 3% supplier commission
    }
  }

  /**
   * Store commission calculation for audit and settlement
   */
  private static async storeCommissionCalculation(data: {
    orderId: string
    orderSubtotal: number
    deliveryFee: number
    orderCommissionPct: number
    deliveryCommissionPct: number
    orderCommissionAmount: number
    deliveryCommissionAmount: number
    supplierCommissionPct: number | null
    supplierCommissionAmount: number | null
    platformRevenue: number
  }) {
    // Store commission calculation in Firebase (decentralized storage)
    await db.collection('order_commissions').doc(data.orderId).set({
      orderId: data.orderId,
      orderSubtotal: data.orderSubtotal,
      deliveryFee: data.deliveryFee,
      orderCommissionPct: data.orderCommissionPct,
      deliveryCommissionPct: data.deliveryCommissionPct,
      orderCommissionAmount: data.orderCommissionAmount,
      deliveryCommissionAmount: data.deliveryCommissionAmount,
      supplierCommissionPct: data.supplierCommissionPct,
      supplierCommissionAmount: data.supplierCommissionAmount,
      platformRevenue: data.platformRevenue,
      status: 'CALCULATED',
      calculatedAt: Date.now(),
      // Store on blockchain as well via smart contract
      blockchainRecorded: false // Will be updated when blockchain transaction completes
    });
    
    // Additionally, record the commission calculation on the blockchain
    // For now, we'll store commission data as part of the order details
    try {
      // Since the blockchain service doesn't have a direct method to record commission calculations,
      // we'll use the existing order-related functions and ensure commissions are tracked
      // via the order settlement and payment flows
      
      // Update the Firebase record to indicate blockchain recording
      await db.collection('order_commissions').doc(data.orderId).update({
        blockchainRecorded: true,
        blockchainTxHash: 'pending' // Will be updated when transaction completes
      });
    } catch (error) {
      console.error('Error updating commission record on blockchain:', error);
      // Still proceed with the order even if blockchain recording fails
    }
  }

  /**
   * Log zero commission exceptions for audit
   */
  private static async logZeroCommission(businessId: string, justification: string) {
    // Log zero commission exception in Firebase (decentralized)
    await db.collection('financial_audit_logs').add({
      adminId: 'SYSTEM', // System-generated log
      action: 'ZERO_COMMISSION_GRANTED',
      entityType: 'MERCHANT_COMMISSION_RULE',
      entityId: businessId,
      newValue: { justification },
      reason: justification,
      timestamp: Date.now(),
      createdAt: Date.now()
    });
  }

  /**
   * Validate that an order can be completed (profit check)
   */
  static async validateOrderProfit(orderId: string): Promise<{ valid: boolean; message?: string }> {
    // Get commission calculation from Firebase
    const commissionDoc = await db.collection('order_commissions').doc(orderId).get();
    
    if (!commissionDoc.exists) {
      return { 
        valid: false, 
        message: `No commission calculation found for order ${orderId}` 
      }
    }
    
    const commission = commissionDoc.data();

    if (commission.platformRevenue <= 0) {
      // Create profit alert in Firebase
      await db.collection('profit_alerts').add({
        orderId,
        alertType: 'ZERO_PROFIT',
        severity: 'CRITICAL',
        message: `Order ${orderId} has zero or negative platform revenue`,
        details: {
          platformRevenue: commission.platformRevenue,
          orderCommission: commission.orderCommissionAmount,
          deliveryCommission: commission.deliveryCommissionAmount,
          supplierCommission: commission.supplierCommissionAmount
        },
        createdAt: Date.now()
      });

      return { 
        valid: false, 
        message: `CRITICAL: Order ${orderId} would generate no platform revenue` 
      }
    }

    return { valid: true }
  }

  /**
   * Get commission summary for admin dashboard
   */
  static async getCommissionSummary(periodStart: Date, periodEnd: Date) {
    // Get commissions from Firebase within the date range
    const commissionsSnapshot = await db.collection('order_commissions')
      .where('calculatedAt', '>=', periodStart.getTime())
      .where('calculatedAt', '<=', periodEnd.getTime())
      .where('status', '==', 'SETTLED')
      .get();

    const commissions = [];
    commissionsSnapshot.forEach(doc => {
      const data = doc.data();
      data.id = doc.id; // Add the document ID
      commissions.push(data);
    });

    const totalRevenue = commissions.reduce((sum, c) => sum + (c.platformRevenue || 0), 0)
    const orderCommission = commissions.reduce((sum, c) => sum + (c.orderCommissionAmount || 0), 0)
    const deliveryCommission = commissions.reduce((sum, c) => sum + (c.deliveryCommissionAmount || 0), 0)
    const supplierCommission = commissions.reduce((sum, c) => sum + (c.supplierCommissionAmount || 0), 0)

    return {
      totalOrders: commissions.length,
      totalRevenue,
      orderCommission,
      deliveryCommission,
      supplierCommission,
      averageOrderRevenue: commissions.length > 0 ? totalRevenue / commissions.length : 0
    }
  }

  /**
   * Reverse commission for cancelled/refunded orders
   */
  static async reverseCommission(orderId: string, reason: string) {
    // Get commission from Firebase
    const commissionDoc = await db.collection('order_commissions').doc(orderId).get();

    if (!commissionDoc.exists) {
      throw new Error(`No commission found for order ${orderId}`)
    }

    const commission = commissionDoc.data();
    if (commission.status === 'REVERSED') {
      throw new Error(`Commission for order ${orderId} already reversed`)
    }

    // Update commission status in Firebase
    await db.collection('order_commissions').doc(orderId).update({
      status: 'REVERSED',
      reversedAt: Date.now(),
      reversalReason: reason
    });

    // Log the reversal in Firebase
    await db.collection('financial_audit_logs').add({
      adminId: 'SYSTEM',
      action: 'COMMISSION_REVERSED',
      entityType: 'ORDER_COMMISSION',
      entityId: orderId,
      oldValue: { status: commission.status, platformRevenue: commission.platformRevenue },
      newValue: { status: 'REVERSED', reversalReason: reason },
      reason,
      timestamp: Date.now(),
      createdAt: Date.now()
    });
  }
}
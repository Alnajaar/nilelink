// web/pos/src/services/ProfitValidationService.ts
'use server'

import { prisma } from '@shared/lib/prisma'
import { CommissionService } from './CommissionService'
import { AuditService } from './AuditService'

interface OrderValidationInput {
  orderId: string
  businessId: string
  businessType: string
  orderSubtotal: number
  deliveryFee: number
  country: string
}

export class ProfitValidationService {
  static async validateOrderProfit(input: OrderValidationInput): Promise<any> {
    try {
      const commissionBreakdown = await CommissionService.calculateCommissions({
        ...input,
        supplierId: undefined,
        supplierVolume: undefined
      })
      
      const isValid = commissionBreakdown.platformRevenue > 0
      
      if (!isValid) {
        await AuditService.createProfitAlert({
          orderId: input.orderId,
          alertType: 'ZERO_PROFIT',
          severity: 'CRITICAL',
          message: `Order would generate zero revenue`,
          details: commissionBreakdown
        })
      }
      
      return {
        isValid,
        platformRevenue: commissionBreakdown.platformRevenue,
        merchantPayout: commissionBreakdown.merchantPayout,
        commissionBreakdown
      }
    } catch (error: any) {
      return {
        isValid: false,
        platformRevenue: 0,
        merchantPayout: 0,
        error: error.message
      }
    }
  }
}
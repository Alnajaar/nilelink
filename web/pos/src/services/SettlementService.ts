// web/pos/src/services/SettlementService.ts
'use server'

import { prisma } from '@shared/lib/prisma'
import { WalletService } from './WalletService'

interface SettlementConfig {
  ownerId: string
  ownerType: string
  frequency: 'DAILY' | 'WEEKLY' | 'MANUAL'
  minimumAmount: number
  currency?: string
}

interface SettlementInput {
  ownerId: string
  ownerType: string
  amount: number
  currency: string
  periodStart: Date
  periodEnd: Date
  method?: string
  description: string
}

export class SettlementService {
  /**
   * Create or update settlement configuration for an owner
   */
  static async configureSettlement(config: SettlementConfig): Promise<void> {
    const { ownerId, ownerType, frequency, minimumAmount, currency = 'USD' } = config

    const nextSettlement = this.calculateNextSettlementDate(frequency)

    await prisma.settlementSchedule.upsert({
      where: {
        ownerId_ownerType: {
          ownerId,
          ownerType
        }
      },
      update: {
        frequency,
        minimumAmount,
        nextSettlement,
        updatedAt: new Date()
      },
      create: {
        ownerId,
        ownerType,
        frequency,
        minimumAmount,
        nextSettlement,
        currency
      }
    })
  }

  /**
   * Calculate next settlement date based on frequency
   */
  private static calculateNextSettlementDate(frequency: string): Date {
    const now = new Date()
    
    switch (frequency) {
      case 'DAILY':
        // Next day at 00:00 UTC
        const nextDay = new Date(now)
        nextDay.setDate(nextDay.getDate() + 1)
        nextDay.setHours(0, 0, 0, 0)
        return nextDay
        
      case 'WEEKLY':
        // Next Monday at 00:00 UTC
        const nextMonday = new Date(now)
        const daysUntilMonday = (8 - nextMonday.getDay()) % 7
        nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)
        nextMonday.setHours(0, 0, 0, 0)
        return nextMonday
        
      case 'MANUAL':
        // Manual settlements don't have automatic dates
        return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        
      default:
        throw new Error('Invalid frequency')
    }
  }

  /**
   * Process automatic settlements
   */
  static async processAutomaticSettlements(): Promise<void> {
    const now = new Date()
    
    // Find schedules that are due
    const dueSchedules = await prisma.settlementSchedule.findMany({
      where: {
        nextSettlement: {
          lte: now
        },
        isActive: true,
        frequency: {
          in: ['DAILY', 'WEEKLY']
        }
      }
    })

    for (const schedule of dueSchedules) {
      try {
        await this.processSettlementForOwner(schedule.ownerId, schedule.ownerType, schedule.currency)
        
        // Update next settlement date
        const nextSettlement = this.calculateNextSettlementDate(schedule.frequency)
        await prisma.settlementSchedule.update({
          where: { id: schedule.id },
          data: { nextSettlement }
        })
      } catch (error) {
        console.error(`Failed to process settlement for ${schedule.ownerId}:`, error)
        // Continue with other settlements
      }
    }
  }

  /**
   * Process settlement for a specific owner
   */
  static async processSettlementForOwner(
    ownerId: string, 
    ownerType: string, 
    currency: string = 'USD'
  ): Promise<string | null> {
    // Get wallet balance
    const wallet = await prisma.wallet.findUnique({
      where: {
        ownerId_ownerType_currency: {
          ownerId,
          ownerType,
          currency
        }
      }
    })

    if (!wallet) {
      return null // No wallet, no settlement needed
    }

    // Get settlement configuration
    const schedule = await prisma.settlementSchedule.findUnique({
      where: {
        ownerId_ownerType: {
          ownerId,
          ownerType
        }
      }
    })

    const minimumAmount = schedule?.minimumAmount || 0

    // Check if balance meets minimum threshold
    if (wallet.balance < minimumAmount) {
      return null // Not enough balance to settle
    }

    const amount = wallet.balance
    const periodStart = schedule?.lastSettlement || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
    const periodEnd = new Date()

    return await this.createSettlement({
      ownerId,
      ownerType,
      amount,
      currency,
      periodStart,
      periodEnd,
      description: `Automatic settlement for ${ownerType} ${ownerId}`
    })
  }

  /**
   * Create a settlement record
   */
  static async createSettlement(input: SettlementInput): Promise<string> {
    const { ownerId, ownerType, amount, currency, periodStart, periodEnd, method, description } = input

    if (amount <= 0) {
      throw new Error('Settlement amount must be positive')
    }

    return await prisma.$transaction(async (tx) => {
      // Create settlement record
      const settlement = await tx.settlement.create({
        data: {
          ownerId,
          ownerType,
          amount,
          currency,
          periodStart,
          periodEnd,
          method,
          status: 'PENDING'
        }
      })

      // Move funds from balance to pending (awaiting payout)
      await tx.wallet.update({
        where: {
          ownerId_ownerType_currency: {
            ownerId,
            ownerType,
            currency
          }
        },
        data: {
          balance: { decrement: amount },
          pendingBalance: { increment: amount },
          updatedAt: new Date()
        }
      })

      // Create pending transaction for audit trail
      await tx.walletTransaction.create({
        data: {
          wallet: {
            connect: {
              ownerId_ownerType_currency: {
                ownerId,
                ownerType,
                currency
              }
            }
          },
          type: 'DEBIT',
          amount,
          currency,
          description,
          referenceType: 'SETTLEMENT',
          referenceId: settlement.id,
          status: 'PENDING'
        }
      })

      return settlement.id
    })
  }

  /**
   * Complete settlement (mark as paid out)
   */
  static async completeSettlement(settlementId: string, reference?: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const settlement = await tx.settlement.findUnique({
        where: { id: settlementId }
      })

      if (!settlement) {
        throw new Error('Settlement not found')
      }

      if (settlement.status !== 'PENDING') {
        throw new Error('Settlement is not pending')
      }

      // Complete the wallet transaction
      const transaction = await tx.walletTransaction.findFirst({
        where: {
          referenceType: 'SETTLEMENT',
          referenceId: settlementId
        }
      })

      if (transaction) {
        await WalletService.completePendingTransaction(transaction.id)
      }

      // Update settlement status
      await tx.settlement.update({
        where: { id: settlementId },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          reference
        }
      })

      // Update last settlement date
      await tx.settlementSchedule.update({
        where: {
          ownerId_ownerType: {
            ownerId: settlement.ownerId,
            ownerType: settlement.ownerType
          }
        },
        data: {
          lastSettlement: new Date()
        }
      })
    })
  }

  /**
   * Get pending settlements
   */
  static async getPendingSettlements(limit: number = 50) {
    return await prisma.settlement.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        walletTransactions: {
          where: {
            referenceType: 'SETTLEMENT'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })
  }

  /**
   * Get settlement history for an owner
   */
  static async getSettlementHistory(
    ownerId: string,
    ownerType: string,
    limit: number = 50,
    offset: number = 0
  ) {
    return await prisma.settlement.findMany({
      where: {
        ownerId,
        ownerType
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })
  }

  /**
   * Get settlement summary for admin dashboard
   */
  static async getSettlementSummary(periodStart: Date, periodEnd: Date) {
    const settlements = await prisma.settlement.findMany({
      where: {
        createdAt: {
          gte: periodStart,
          lte: periodEnd
        }
      },
      include: {
        _count: {
          select: { walletTransactions: true }
        }
      }
    })

    const totalSettled = settlements
      .filter(s => s.status === 'COMPLETED')
      .reduce((sum, s) => sum + s.amount, 0)

    const pendingSettlements = settlements.filter(s => s.status === 'PENDING').length
    const completedSettlements = settlements.filter(s => s.status === 'COMPLETED').length

    return {
      totalSettlements: settlements.length,
      completedSettlements,
      pendingSettlements,
      totalSettledAmount: totalSettled,
      averageSettlementAmount: completedSettlements > 0 ? totalSettled / completedSettlements : 0
    }
  }

  /**
   * Manual settlement request
   */
  static async requestManualSettlement(
    ownerId: string,
    ownerType: string,
    amount: number,
    currency: string = 'USD',
    description: string
  ): Promise<string> {
    // Check if manual settlement is allowed
    const schedule = await prisma.settlementSchedule.findUnique({
      where: {
        ownerId_ownerType: {
          ownerId,
          ownerType
        }
      }
    })

    if (!schedule || schedule.frequency !== 'MANUAL') {
      throw new Error('Manual settlement not configured for this owner')
    }

    // Check available balance
    const wallet = await prisma.wallet.findUnique({
      where: {
        ownerId_ownerType_currency: {
          ownerId,
          ownerType,
          currency
        }
      }
    })

    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient balance for settlement')
    }

    const periodStart = schedule.lastSettlement || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    const periodEnd = new Date()

    return await this.createSettlement({
      ownerId,
      ownerType,
      amount,
      currency,
      periodStart,
      periodEnd,
      description
    })
  }

  /**
   * Cancel pending settlement
   */
  static async cancelSettlement(settlementId: string, reason: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const settlement = await tx.settlement.findUnique({
        where: { id: settlementId }
      })

      if (!settlement) {
        throw new Error('Settlement not found')
      }

      if (settlement.status !== 'PENDING') {
        throw new Error('Only pending settlements can be cancelled')
      }

      // Return funds to balance
      await tx.wallet.update({
        where: {
          ownerId_ownerType_currency: {
            ownerId: settlement.ownerId,
            ownerType: settlement.ownerType,
            currency: settlement.currency
          }
        },
        data: {
          balance: { increment: settlement.amount },
          pendingBalance: { decrement: settlement.amount },
          updatedAt: new Date()
        }
      })

      // Cancel the wallet transaction
      const transaction = await tx.walletTransaction.findFirst({
        where: {
          referenceType: 'SETTLEMENT',
          referenceId: settlementId
        }
      })

      if (transaction) {
        await tx.walletTransaction.update({
          where: { id: transaction.id },
          data: {
            status: 'REVERSED',
            reversedAt: new Date()
          }
        })
      }

      // Update settlement status
      await tx.settlement.update({
        where: { id: settlementId },
        data: {
          status: 'FAILED',
          processedAt: new Date()
        }
      })
    })
  }
}
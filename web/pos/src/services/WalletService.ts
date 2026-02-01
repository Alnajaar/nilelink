// web/pos/src/services/WalletService.ts
'use server'

import { prisma } from '@shared/lib/prisma'

interface WalletBalance {
  balance: number
  pendingBalance: number
  lockedBalance: number
  currency: string
}

interface TransactionInput {
  ownerId: string
  ownerType: string
  type: 'CREDIT' | 'DEBIT'
  amount: number
  currency?: string
  description: string
  referenceType?: string
  referenceId?: string
}

export class WalletService {
  /**
   * Get or create wallet for an entity
   */
  static async getOrCreateWallet(ownerId: string, ownerType: string, currency: string = 'USD'): Promise<WalletBalance> {
    let wallet = await prisma.wallet.findUnique({
      where: {
        ownerId_ownerType_currency: {
          ownerId,
          ownerType,
          currency
        }
      }
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          ownerId,
          ownerType,
          currency
        }
      })
    }

    return {
      balance: wallet.balance,
      pendingBalance: wallet.pendingBalance,
      lockedBalance: wallet.lockedBalance,
      currency: wallet.currency
    }
  }

  /**
   * Get wallet balance
   */
  static async getWalletBalance(ownerId: string, ownerType: string, currency: string = 'USD'): Promise<WalletBalance> {
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
      return this.getOrCreateWallet(ownerId, ownerType, currency)
    }

    return {
      balance: wallet.balance,
      pendingBalance: wallet.pendingBalance,
      lockedBalance: wallet.lockedBalance,
      currency: wallet.currency
    }
  }

  /**
   * Create wallet transaction
   */
  static async createTransaction(input: TransactionInput): Promise<string> {
    const {
      ownerId,
      ownerType,
      type,
      amount,
      currency = 'USD',
      description,
      referenceType,
      referenceId
    } = input

    if (amount <= 0) {
      throw new Error('Transaction amount must be positive')
    }

    // Get or create wallet
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
      await this.getOrCreateWallet(ownerId, ownerType, currency)
    }

    return await prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.walletTransaction.create({
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
          type,
          amount,
          currency,
          description,
          referenceType,
          referenceId,
          status: 'PENDING'
        }
      })

      // Update wallet balance
      const updateData: any = { updatedAt: new Date() }
      
      if (type === 'CREDIT') {
        updateData.balance = { increment: amount }
      } else {
        // Check if sufficient balance for debit
        const currentWallet = await tx.wallet.findUnique({
          where: {
            ownerId_ownerType_currency: {
              ownerId,
              ownerType,
              currency
            }
          }
        })

        if (!currentWallet || currentWallet.balance < amount) {
          throw new Error('Insufficient wallet balance')
        }
        
        updateData.balance = { decrement: amount }
      }

      await tx.wallet.update({
        where: {
          ownerId_ownerType_currency: {
            ownerId,
            ownerType,
            currency
          }
        },
        data: updateData
      })

      // Mark transaction as completed
      await tx.walletTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })

      return transaction.id
    })
  }

  /**
   * Create pending transaction (for settlements)
   */
  static async createPendingTransaction(input: TransactionInput): Promise<string> {
    const {
      ownerId,
      ownerType,
      type,
      amount,
      currency = 'USD',
      description,
      referenceType,
      referenceId
    } = input

    if (amount <= 0) {
      throw new Error('Transaction amount must be positive')
    }

    return await prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.walletTransaction.create({
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
          type,
          amount,
          currency,
          description,
          referenceType,
          referenceId,
          status: 'PENDING'
        }
      })

      // Update pending balance
      const updateData: any = { updatedAt: new Date() }
      
      if (type === 'CREDIT') {
        updateData.pendingBalance = { increment: amount }
      } else {
        // For debits, we check available balance (balance + pending)
        const wallet = await tx.wallet.findUnique({
          where: {
            ownerId_ownerType_currency: {
              ownerId,
              ownerType,
              currency
            }
          }
        })

        const availableBalance = (wallet?.balance || 0) + (wallet?.pendingBalance || 0)
        if (availableBalance < amount) {
          throw new Error('Insufficient available balance')
        }
        
        updateData.pendingBalance = { decrement: amount }
      }

      await tx.wallet.update({
        where: {
          ownerId_ownerType_currency: {
            ownerId,
            ownerType,
            currency
          }
        },
        data: updateData
      })

      return transaction.id
    })
  }

  /**
   * Complete pending transaction
   */
  static async completePendingTransaction(transactionId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.walletTransaction.findUnique({
        where: { id: transactionId },
        include: { wallet: true }
      })

      if (!transaction) {
        throw new Error('Transaction not found')
      }

      if (transaction.status !== 'PENDING') {
        throw new Error('Transaction is not pending')
      }

      // Move amount from pending to actual balance
      const updateData: any = { updatedAt: new Date() }
      
      if (transaction.type === 'CREDIT') {
        updateData.pendingBalance = { decrement: transaction.amount }
        updateData.balance = { increment: transaction.amount }
      } else {
        updateData.pendingBalance = { increment: transaction.amount }
        updateData.balance = { decrement: transaction.amount }
      }

      await tx.wallet.update({
        where: {
          id: transaction.walletId
        },
        data: updateData
      })

      // Mark transaction as completed
      await tx.walletTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })
    })
  }

  /**
   * Reverse transaction (for refunds/cancellations)
   */
  static async reverseTransaction(transactionId: string, reason: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.walletTransaction.findUnique({
        where: { id: transactionId },
        include: { wallet: true }
      })

      if (!transaction) {
        throw new Error('Transaction not found')
      }

      if (transaction.status === 'REVERSED') {
        throw new Error('Transaction already reversed')
      }

      // Create reversal transaction
      const reversalType = transaction.type === 'CREDIT' ? 'DEBIT' : 'CREDIT'
      
      await tx.walletTransaction.create({
        data: {
          walletId: transaction.walletId,
          type: reversalType,
          amount: transaction.amount,
          currency: transaction.currency,
          description: `Reversal: ${transaction.description}`,
          referenceType: transaction.referenceType,
          referenceId: transaction.referenceId,
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })

      // Update wallet balance
      const updateData: any = { updatedAt: new Date() }
      
      if (transaction.type === 'CREDIT') {
        updateData.balance = { decrement: transaction.amount }
      } else {
        updateData.balance = { increment: transaction.amount }
      }

      await tx.wallet.update({
        where: { id: transaction.walletId },
        data: updateData
      })

      // Mark original transaction as reversed
      await tx.walletTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'REVERSED',
          reversedAt: new Date()
        }
      })
    })
  }

  /**
   * Lock funds for dispute resolution
   */
  static async lockFunds(ownerId: string, ownerType: string, amount: number, currency: string = 'USD'): Promise<void> {
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
      throw new Error('Insufficient balance to lock funds')
    }

    await prisma.wallet.update({
      where: {
        ownerId_ownerType_currency: {
          ownerId,
          ownerType,
          currency
        }
      },
      data: {
        balance: { decrement: amount },
        lockedBalance: { increment: amount },
        updatedAt: new Date()
      }
    })
  }

  /**
   * Release locked funds
   */
  static async releaseFunds(ownerId: string, ownerType: string, amount: number, currency: string = 'USD'): Promise<void> {
    const wallet = await prisma.wallet.findUnique({
      where: {
        ownerId_ownerType_currency: {
          ownerId,
          ownerType,
          currency
        }
      }
    })

    if (!wallet || wallet.lockedBalance < amount) {
      throw new Error('Insufficient locked balance')
    }

    await prisma.wallet.update({
      where: {
        ownerId_ownerType_currency: {
          ownerId,
          ownerType,
          currency
        }
      },
      data: {
        lockedBalance: { decrement: amount },
        balance: { increment: amount },
        updatedAt: new Date()
      }
    })
  }

  /**
   * Get transaction history
   */
  static async getTransactionHistory(
    ownerId: string, 
    ownerType: string, 
    currency: string = 'USD',
    limit: number = 50,
    offset: number = 0
  ) {
    return await prisma.walletTransaction.findMany({
      where: {
        wallet: {
          ownerId,
          ownerType,
          currency
        }
      },
      include: {
        wallet: {
          select: {
            balance: true,
            pendingBalance: true,
            lockedBalance: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })
  }

  /**
   * Get wallet summary for dashboard
   */
  static async getWalletSummary(ownerId: string, ownerType: string) {
    const wallets = await prisma.wallet.findMany({
      where: {
        ownerId,
        ownerType
      }
    })

    return wallets.map(wallet => ({
      currency: wallet.currency,
      balance: wallet.balance,
      pendingBalance: wallet.pendingBalance,
      lockedBalance: wallet.lockedBalance,
      availableBalance: wallet.balance + wallet.pendingBalance
    }))
  }

  /**
   * Transfer between wallets
   */
  static async transferBetweenWallets(
    fromOwnerId: string,
    fromOwnerType: string,
    toOwnerId: string,
    toOwnerType: string,
    amount: number,
    currency: string = 'USD',
    description: string
  ): Promise<{ fromTxId: string; toTxId: string }> {
    if (amount <= 0) {
      throw new Error('Transfer amount must be positive')
    }

    if (fromOwnerId === toOwnerId && fromOwnerType === toOwnerType) {
      throw new Error('Cannot transfer to the same wallet')
    }

    return await prisma.$transaction(async (tx) => {
      // Check source wallet balance
      const fromWallet = await tx.wallet.findUnique({
        where: {
          ownerId_ownerType_currency: {
            ownerId: fromOwnerId,
            ownerType: fromOwnerType,
            currency
          }
        }
      })

      if (!fromWallet || fromWallet.balance < amount) {
        throw new Error('Insufficient balance in source wallet')
      }

      // Create debit transaction from source
      const fromTransaction = await tx.walletTransaction.create({
        data: {
          wallet: {
            connect: {
              ownerId_ownerType_currency: {
                ownerId: fromOwnerId,
                ownerType: fromOwnerType,
                currency
              }
            }
          },
          type: 'DEBIT',
          amount,
          currency,
          description: `Transfer to ${toOwnerType} ${toOwnerId}: ${description}`,
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })

      // Create credit transaction to destination
      const toTransaction = await tx.walletTransaction.create({
        data: {
          wallet: {
            connect: {
              ownerId_ownerType_currency: {
                ownerId: toOwnerId,
                ownerType: toOwnerType,
                currency
              }
            }
          },
          type: 'CREDIT',
          amount,
          currency,
          description: `Transfer from ${fromOwnerType} ${fromOwnerId}: ${description}`,
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })

      // Update wallet balances
      await tx.wallet.update({
        where: {
          ownerId_ownerType_currency: {
            ownerId: fromOwnerId,
            ownerType: fromOwnerType,
            currency
          }
        },
        data: {
          balance: { decrement: amount },
          updatedAt: new Date()
        }
      })

      await tx.wallet.update({
        where: {
          ownerId_ownerType_currency: {
            ownerId: toOwnerId,
            ownerType: toOwnerType,
            currency
          }
        },
        data: {
          balance: { increment: amount },
          updatedAt: new Date()
        }
      })

      return {
        fromTxId: fromTransaction.id,
        toTxId: toTransaction.id
      }
    })
  }
}
import { PrismaClient, AccountType, AccountCategory } from '@prisma/client';
import { logger } from '../utils/logger';

export interface JournalLine {
    accountId: string;
    debit: number;
    credit: number;
    description?: string;
}

export interface JournalEntryData {
    date: Date;
    description: string;
    reference?: string;
    lines: JournalLine[];
    createdBy: string;
}

export interface AccountBalance {
    accountId: string;
    accountCode: string;
    accountName: string;
    balance: number;
    type: AccountType;
    category: AccountCategory;
}

export interface FinancialReport {
    balanceSheet: {
        assets: AccountBalance[];
        liabilities: AccountBalance[];
        equity: AccountBalance[];
        totalAssets: number;
        totalLiabilities: number;
        totalEquity: number;
    };
    incomeStatement: {
        revenues: AccountBalance[];
        expenses: AccountBalance[];
        netIncome: number;
    };
    period: {
        start: Date;
        end: Date;
    };
}

export class AccountingService {
    constructor(private prisma: PrismaClient) {}

    // Double-Entry Bookkeeping: Create Journal Entry
    async createJournalEntry(data: JournalEntryData): Promise<any> {
        // Validate double-entry: Debits must equal Credits
        const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new Error(`Unbalanced journal entry: Debits (${totalDebit}) ≠ Credits (${totalCredit})`);
        }

        // Create journal entry with lines
        const entry = await this.prisma.journalEntry.create({
            data: {
                date: data.date,
                description: data.description,
                reference: data.reference,
                lines: {
                    create: data.lines.map(line => ({
                        accountId: line.accountId,
                        debit: line.debit,
                        credit: line.credit,
                        description: line.description
                    }))
                }
            },
            include: {
                lines: {
                    include: {
                        account: true
                    }
                }
            }
        });

        // Update account balances
        await this.updateAccountBalances(data.lines);

        logger.info('Journal entry created', {
            entryId: entry.id,
            description: data.description,
            amount: totalDebit
        });

        return entry;
    }

    // Update account balances after journal entry
    private async updateAccountBalances(lines: JournalLine[]): Promise<void> {
        for (const line of lines) {
            const netChange = line.debit - line.credit; // Positive for debit, negative for credit

            await this.prisma.account.update({
                where: { id: line.accountId },
                data: {
                    balance: {
                        increment: netChange
                    }
                }
            });
        }
    }

    // Automated Journal Entries for Business Events
    async recordOrder(orderData: {
        orderId: string;
        restaurantId: string;
        totalAmount: number;
        taxAmount: number;
        paymentMethod: string;
        customerId?: string;
    }): Promise<any> {
        const lines: JournalLine[] = [];

        // Get relevant accounts
        const [salesRevenue, accountsReceivable, cashAccount, taxPayable] = await Promise.all([
            this.getAccountByCode('4000'), // Sales Revenue
            this.getAccountByCode('1200'), // Accounts Receivable
            this.getAccountByCode('1000'), // Cash on Hand
            this.getAccountByCode('2001')  // Sales Tax Payable (would need to create)
        ]);

        const netAmount = orderData.totalAmount - orderData.taxAmount;

        // Different accounting based on payment method
        if (orderData.paymentMethod === 'CASH') {
            // Debit Cash, Credit Sales Revenue, Credit Tax Payable
            lines.push(
                { accountId: cashAccount.id, debit: orderData.totalAmount, credit: 0, description: `Cash sale - Order ${orderData.orderId}` },
                { accountId: salesRevenue.id, debit: 0, credit: netAmount, description: `Revenue - Order ${orderData.orderId}` },
                { accountId: taxPayable?.id || salesRevenue.id, debit: 0, credit: orderData.taxAmount, description: `Sales tax - Order ${orderData.orderId}` }
            );
        } else {
            // For card/blockchain payments, use Accounts Receivable first, then settle later
            lines.push(
                { accountId: accountsReceivable.id, debit: orderData.totalAmount, credit: 0, description: `Sale on account - Order ${orderData.orderId}` },
                { accountId: salesRevenue.id, debit: 0, credit: netAmount, description: `Revenue - Order ${orderData.orderId}` },
                { accountId: taxPayable?.id || salesRevenue.id, debit: 0, credit: orderData.taxAmount, description: `Sales tax - Order ${orderData.orderId}` }
            );
        }

        return this.createJournalEntry({
            date: new Date(),
            description: `Order ${orderData.orderId} - ${orderData.paymentMethod} payment`,
            reference: orderData.orderId,
            lines,
            createdBy: 'SYSTEM'
        });
    }

    async recordPayment(paymentData: {
        orderId: string;
        amount: number;
        method: string;
        transactionId?: string;
    }): Promise<any> {
        // Settle Accounts Receivable with actual payment
        const [accountsReceivable, cashAccount, bankAccount] = await Promise.all([
            this.getAccountByCode('1200'), // Accounts Receivable
            this.getAccountByCode('1000'), // Cash
            this.getAccountByCode('1010')  // Bank Account
        ]);

        const accountId = paymentData.method === 'CASH' ? cashAccount.id : bankAccount.id;

        const lines: JournalLine[] = [
            { accountId, debit: paymentData.amount, credit: 0, description: `Payment received - ${paymentData.method}` },
            { accountId: accountsReceivable.id, debit: 0, credit: paymentData.amount, description: `Settlement of receivable` }
        ];

        return this.createJournalEntry({
            date: new Date(),
            description: `Payment settlement - Order ${paymentData.orderId}`,
            reference: paymentData.transactionId || paymentData.orderId,
            lines,
            createdBy: 'SYSTEM'
        });
    }

    async recordInventoryMovement(movementData: {
        itemId: string;
        quantity: number;
        costPerUnit: number;
        type: 'RESTOCK' | 'SALE' | 'ADJUSTMENT' | 'WASTE';
        reference?: string;
    }): Promise<any> {
        const [inventoryAccount, cogsAccount] = await Promise.all([
            this.getAccountByCode('1300'), // Inventory Asset
            this.getAccountByCode('5000')  // Cost of Goods Sold
        ]);

        const totalCost = movementData.quantity * movementData.costPerUnit;
        const lines: JournalLine[] = [];

        switch (movementData.type) {
            case 'RESTOCK':
                // Debit Inventory, Credit Cash/Cash Equivalents
                lines.push(
                    { accountId: inventoryAccount.id, debit: totalCost, credit: 0, description: `Inventory restock - ${movementData.itemId}` },
                    { accountId: cogsAccount.id, debit: 0, credit: totalCost, description: `Inventory purchase - ${movementData.itemId}` }
                );
                break;

            case 'SALE':
                // Debit COGS, Credit Inventory
                lines.push(
                    { accountId: cogsAccount.id, debit: totalCost, credit: 0, description: `Cost of goods sold - ${movementData.itemId}` },
                    { accountId: inventoryAccount.id, debit: 0, credit: totalCost, description: `Inventory reduction - ${movementData.itemId}` }
                );
                break;

            case 'WASTE':
                // Debit Waste Expense, Credit Inventory
                lines.push(
                    { accountId: cogsAccount.id, debit: totalCost, credit: 0, description: `Waste/spoilage - ${movementData.itemId}` },
                    { accountId: inventoryAccount.id, debit: 0, credit: totalCost, description: `Inventory write-off - ${movementData.itemId}` }
                );
                break;
        }

        return this.createJournalEntry({
            date: new Date(),
            description: `Inventory ${movementData.type.toLowerCase()} - ${movementData.itemId}`,
            reference: movementData.reference,
            lines,
            createdBy: 'SYSTEM'
        });
    }

    // Financial Reporting
    async generateFinancialReport(startDate: Date, endDate: Date): Promise<FinancialReport> {
        // Get all accounts with their balances
        const accounts = await this.prisma.account.findMany({
            orderBy: { code: 'asc' }
        });

        // Get journal entries for the period to calculate period activity
        const periodEntries = await this.prisma.journalEntry.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                lines: {
                    include: {
                        account: true
                    }
                }
            }
        });

        // Calculate period activity for income statement accounts
        const periodActivity = new Map<string, number>();

        for (const entry of periodEntries) {
            for (const line of entry.lines) {
                const netChange = Number(line.debit) - Number(line.credit);
                const current = periodActivity.get(line.accountId) || 0;
                periodActivity.set(line.accountId, current + netChange);
            }
        }

        // Build balance sheet
        const assets = accounts.filter(acc =>
            acc.type === AccountType.ASSET &&
            Number(acc.balance) !== 0
        ).map(acc => ({
            accountId: acc.id,
            accountCode: acc.code,
            accountName: acc.name,
            balance: Number(acc.balance),
            type: acc.type,
            category: acc.category
        }));

        const liabilities = accounts.filter(acc =>
            acc.type === AccountType.LIABILITY &&
            Number(acc.balance) !== 0
        ).map(acc => ({
            accountId: acc.id,
            accountCode: acc.code,
            accountName: acc.name,
            balance: Number(acc.balance),
            type: acc.type,
            category: acc.category
        }));

        const equity = accounts.filter(acc =>
            acc.type === AccountType.EQUITY &&
            Number(acc.balance) !== 0
        ).map(acc => ({
            accountId: acc.id,
            accountCode: acc.code,
            accountName: acc.name,
            balance: Number(acc.balance),
            type: acc.type,
            category: acc.category
        }));

        // Build income statement
        const revenues = [];
        const expenses = [];

        for (const account of accounts) {
            const periodBalance = periodActivity.get(account.id) || 0;

            if (account.type === AccountType.INCOME && periodBalance !== 0) {
                revenues.push({
                    accountId: account.id,
                    accountCode: account.code,
                    accountName: account.name,
                    balance: periodBalance, // Income statement uses period activity
                    type: account.type,
                    category: account.category
                });
            } else if (account.type === AccountType.EXPENSE && periodBalance !== 0) {
                expenses.push({
                    accountId: account.id,
                    accountCode: account.code,
                    accountName: account.name,
                    balance: periodBalance,
                    type: account.type,
                    category: account.category
                });
            }
        }

        const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
        const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
        const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0);

        const totalRevenues = revenues.reduce((sum, acc) => sum + acc.balance, 0);
        const totalExpenses = expenses.reduce((sum, acc) => sum + acc.balance, 0);
        const netIncome = totalRevenues - totalExpenses;

        return {
            balanceSheet: {
                assets,
                liabilities,
                equity,
                totalAssets,
                totalLiabilities,
                totalEquity
            },
            incomeStatement: {
                revenues,
                expenses,
                netIncome
            },
            period: {
                start: startDate,
                end: endDate
            }
        };
    }

    // Reconciliation Logic
    async reconcileAccount(accountId: string, statementBalance: number, adjustments: Array<{
        description: string;
        amount: number;
    }>): Promise<any> {
        const account = await this.prisma.account.findUnique({
            where: { id: accountId }
        });

        if (!account) {
            throw new Error('Account not found');
        }

        const bookBalance = Number(account.balance);
        const difference = statementBalance - bookBalance;
        const totalAdjustments = adjustments.reduce((sum, adj) => sum + adj.amount, 0);

        if (Math.abs(difference - totalAdjustments) > 0.01) {
            throw new Error('Adjustments do not account for the difference');
        }

        // Create reconciliation journal entries
        const lines: JournalLine[] = [];

        for (const adjustment of adjustments) {
            if (adjustment.amount > 0) {
                lines.push({
                    accountId,
                    debit: adjustment.amount,
                    credit: 0,
                    description: `Reconciliation: ${adjustment.description}`
                });
                // Would need contra account for the credit side
            } else {
                lines.push({
                    accountId,
                    debit: 0,
                    credit: Math.abs(adjustment.amount),
                    description: `Reconciliation: ${adjustment.description}`
                });
            }
        }

        const reconciliationEntry = await this.createJournalEntry({
            date: new Date(),
            description: `Account reconciliation - ${account.name}`,
            reference: `RECONCILE_${accountId}_${Date.now()}`,
            lines,
            createdBy: 'SYSTEM'
        });

        return {
            accountId,
            bookBalance,
            statementBalance,
            difference,
            adjustments,
            reconciliationEntry
        };
    }

    // Audit Trail
    async getAuditTrail(accountId?: string, startDate?: Date, endDate?: Date, limit: number = 100): Promise<any[]> {
        const where: any = {};

        if (accountId) {
            where.lines = {
                some: {
                    accountId
                }
            };
        }

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = startDate;
            if (endDate) where.date.lte = endDate;
        }

        const entries = await this.prisma.journalEntry.findMany({
            where,
            include: {
                lines: {
                    include: {
                        account: true
                    }
                }
            },
            orderBy: { date: 'desc' },
            take: limit
        });

        return entries.map(entry => ({
            id: entry.id,
            date: entry.date,
            description: entry.description,
            reference: entry.reference,
            createdAt: entry.createdAt,
            lines: entry.lines.map(line => ({
                accountCode: line.account.code,
                accountName: line.account.name,
                debit: Number(line.debit),
                credit: Number(line.credit),
                description: line.description
            })),
            total: entry.lines.reduce((sum, line) => sum + Number(line.debit), 0)
        }));
    }

    // Helper: Get account by code
    private async getAccountByCode(code: string): Promise<any> {
        const account = await this.prisma.account.findUnique({
            where: { code }
        });

        if (!account) {
            throw new Error(`Account with code ${code} not found`);
        }

        return account;
    }
}

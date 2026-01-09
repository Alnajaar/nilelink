import { v4 as uuidv4 } from 'uuid';
import { LocalLedger } from '../storage/LocalLedger';
import { EconomicEvent, EventType } from '../events/types';
import { AccountCode, JournalEntry, JournalLine, DEFAULT_COA, Account } from './types';

export class JournalEngine {
    private ledger: LocalLedger;
    private accounts: Map<string, Account>;

    constructor(ledger: LocalLedger) {
        this.ledger = ledger;
        this.accounts = new Map();
        this.initializeAccounts();
    }

    private async initializeAccounts() {
        // Load default COA
        DEFAULT_COA.forEach(acc => {
            this.accounts.set(acc.code, { ...acc });
        });

        // Hydrate persistent balances (Phase 10)
        try {
            const savedBalances = await this.ledger.getAllAccountBalances();
            Object.entries(savedBalances).forEach(([code, balance]) => {
                const acc = this.accounts.get(code);
                if (acc) {
                    acc.balance = balance;
                }
            });
            console.log('📈 Journal balances hydrated from persistent ledger');
        } catch (err) {
            console.error('Failed to hydrate journal balances:', err);
        }
    }

    /**
     * Process an economic event and generate journal entries
     */
    async processEvent(event: EconomicEvent) {
        let entry: JournalEntry | null = null;

        switch (event.type) {
            case EventType.ORDER_SUBMITTED:
                entry = this.handleOrderSubmitted(event);
                break;
            case EventType.PAYMENT_COLLECTED_CASH:
                entry = this.handlePaymentCash(event);
                break;
            case EventType.PAYMENT_COLLECTED_CARD:
                entry = this.handlePaymentCard(event);
                break;
            case EventType.INVENTORY_DEDUCTED:
                entry = this.handleInventoryDeduction(event);
                break;
        }

        if (entry) {
            await this.postEntry(entry);
        }
    }

    private handleOrderSubmitted(event: EconomicEvent): JournalEntry {
        const payload = event.payload as any;
        // Sales Revenue Recognition happens when payment is collected usually for cash basis, 
        // but for accrual we recognize here. Let's assume Accrual basis.
        // Actually for a simple POS, we might conflate Order and Payment, but let's separate:
        // Order -> Debit Accounts Receivable, Credit Sales Revenue, Credit Tax Payable

        const subtotal = payload.subtotal || 0;
        const tax = payload.taxAmount || 0;
        const total = payload.totalAmount || 0;

        return {
            id: uuidv4(),
            date: event.timestamp,
            referenceId: event.id,
            description: `Order Revenue: ${payload.orderId}`,
            postedBy: event.actorId,
            branchId: event.branchId,
            lines: [
                {
                    accountCode: AccountCode.ACCOUNTS_RECEIVABLE,
                    debit: total,
                    credit: 0,
                    description: `Order ${payload.orderId}`
                },
                {
                    accountCode: AccountCode.SALES_REVENUE,
                    debit: 0,
                    credit: subtotal,
                    description: 'Sales Revenue'
                },
                {
                    accountCode: AccountCode.SALES_TAX_PAYABLE,
                    debit: 0,
                    credit: tax,
                    description: 'Sales Tax'
                }
            ]
        };
    }

    private handlePaymentCash(event: EconomicEvent): JournalEntry {
        const payload = event.payload as any;
        const amount = payload.amount || 0;

        // Debit Cash, Credit Accounts Receivable
        return {
            id: uuidv4(),
            date: event.timestamp,
            referenceId: event.id,
            description: `Cash Payment: ${payload.orderId}`,
            postedBy: event.actorId,
            branchId: event.branchId,
            lines: [
                {
                    accountCode: AccountCode.CASH_ON_HAND,
                    debit: amount,
                    credit: 0,
                    description: 'Cash Received'
                },
                {
                    accountCode: AccountCode.ACCOUNTS_RECEIVABLE,
                    debit: 0,
                    credit: amount,
                    description: 'Clearing AR'
                }
            ]
        };
    }

    private handlePaymentCard(event: EconomicEvent): JournalEntry {
        const payload = event.payload as any;
        const amount = payload.amount || 0;

        // Debit Bank (or Undeposited Funds), Credit Accounts Receivable
        return {
            id: uuidv4(),
            date: event.timestamp,
            referenceId: event.id,
            description: `Card Payment: ${payload.orderId}`,
            postedBy: event.actorId,
            branchId: event.branchId,
            lines: [
                {
                    accountCode: AccountCode.BANK_CHECKING,
                    debit: amount,
                    credit: 0,
                    description: 'Card Settlement'
                },
                {
                    accountCode: AccountCode.ACCOUNTS_RECEIVABLE,
                    debit: 0,
                    credit: amount,
                    description: 'Clearing AR'
                }
            ]
        };
    }

    private handleInventoryDeduction(event: EconomicEvent): JournalEntry {
        const payload = event.payload as any;
        // In a real system, we need the COST of the specific inventory item.
        // Assuming payload might carry calculated cost or we'd fetch it. 
        // For this demo, let's assume an estimated cost in payload or fetch from RecipeEngine.
        // Since payload in previous steps didn't have cost, let's assume a simplified COGS calculation or Mock it for now.
        // Ideally RecipeEngine deduction returns cost.

        const estimatedCost = 5.00; // Mock cost per deduction event for now

        return {
            id: uuidv4(),
            date: event.timestamp,
            referenceId: event.id,
            description: `COGS: ${payload.ingredientName}`,
            postedBy: event.actorId,
            branchId: event.branchId,
            lines: [
                {
                    accountCode: AccountCode.COST_OF_GOODS_SOLD,
                    debit: estimatedCost,
                    credit: 0,
                    description: `Cost of ${payload.ingredientName}`
                },
                {
                    accountCode: AccountCode.INVENTORY_ASSET,
                    debit: 0,
                    credit: estimatedCost,
                    description: 'Inventory Usage'
                }
            ]
        };
    }

    async postEntry(entry: JournalEntry) {
        // Validate Balance
        const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            console.error('Unbalanced Journal Entry ignored', entry);
            return;
        }

        // Update in-memory balances
        entry.lines.forEach(line => {
            const acc = this.accounts.get(line.accountCode);
            if (acc) {
                // Determine direction based on account type is complex,
                // simplified: Debit adds to Asset/Expense, Subtracts from Liability/Equity/Revenue.
                // Credit is opposite.

                let balanceChange = line.debit - line.credit;

                // For Liability, Equity, Revenue, natural balance is Credit.
                // So Credit increases them.
                // Asset, Expense: Debit increases them.

                // Let's store "Native Balance". 
                // Asset: 100 Debit means +100.
                // Liability: 100 Credit means +100.

                /*
                Asset/Expense: Balance = Debit - Credit
                Liability/Equity/Revenue: Balance = Credit - Debit
                */

                if (['ASSET', 'EXPENSE'].includes(acc.type)) {
                    acc.balance += (line.debit - line.credit);
                } else {
                    acc.balance += (line.credit - line.debit);
                }

                // Persist updated balance (Phase 10)
                this.ledger.upsertAccountBalance(acc.code, acc.balance);
            }
        });

        // Persist to Ledger
        await this.ledger.insertJournalEntry(entry);
        console.log(`[Journal] Posted Entry: ${entry.description} | Value: ${totalDebit}`);
    }

    getReport(type: 'PL' | 'BS'): any {
        const report: any = {};

        if (type === 'PL') {
            // Profit and Loss = Revenue - Expenses
            const revenue = Array.from(this.accounts.values()).filter(a => a.type === 'REVENUE');
            const expense = Array.from(this.accounts.values()).filter(a => a.type === 'EXPENSE');

            report.revenue = revenue;
            report.totalRevenue = revenue.reduce((s, a) => s + a.balance, 0);

            report.expenses = expense;
            report.totalExpenses = expense.reduce((s, a) => s + a.balance, 0);

            report.netProfit = report.totalRevenue - report.totalExpenses;
        }

        return report;
    }
}

export enum AccountType {
    ASSET = 'ASSET',
    LIABILITY = 'LIABILITY',
    EQUITY = 'EQUITY',
    REVENUE = 'REVENUE',
    EXPENSE = 'EXPENSE'
}

export enum AccountCode {
    // Assets (1000-1999)
    CASH_ON_HAND = '1000',
    BANK_CHECKING = '1010',
    INVENTORY_ASSET = '1200',
    ACCOUNTS_RECEIVABLE = '1300',

    // Liabilities (2000-2999)
    ACCOUNTS_PAYABLE = '2000',
    SALES_TAX_PAYABLE = '2100',

    // Equity (3000-3999)
    OWNERS_EQUITY = '3000',
    RETAINED_EARNINGS = '3100',

    // Revenue (4000-4999)
    SALES_REVENUE = '4000',
    SERVICE_REVENUE = '4100',

    // Expenses (5000-5999)
    COST_OF_GOODS_SOLD = '5000',
    RENT_EXPENSE = '5100',
    SALARIES_EXPENSE = '5200',
    UTILITIES_EXPENSE = '5300',
    WASTE_EXPENSE = '5400'
}

export interface Account {
    code: string;
    name: string;
    type: AccountType;
    balance: number; // Positive is Debit for Assets/Expenses, Credit for Liability/Equity/Revenue
}

export interface JournalLine {
    accountCode: string;
    debit: number;
    credit: number;
    description?: string;
}

export interface JournalEntry {
    id: string;
    date: number;
    referenceId: string; // Event ID
    description: string;
    lines: JournalLine[];
    postedBy: string;
    branchId: string;
}

export const DEFAULT_COA: Account[] = [
    { code: AccountCode.CASH_ON_HAND, name: 'Cash on Hand', type: AccountType.ASSET, balance: 0 },
    { code: AccountCode.BANK_CHECKING, name: 'Bank Checking', type: AccountType.ASSET, balance: 0 },
    { code: AccountCode.INVENTORY_ASSET, name: 'Inventory Asset', type: AccountType.ASSET, balance: 0 },
    { code: AccountCode.ACCOUNTS_RECEIVABLE, name: 'Accounts Receivable', type: AccountType.ASSET, balance: 0 },

    { code: AccountCode.ACCOUNTS_PAYABLE, name: 'Accounts Payable', type: AccountType.LIABILITY, balance: 0 },
    { code: AccountCode.SALES_TAX_PAYABLE, name: 'Sales Tax Payable', type: AccountType.LIABILITY, balance: 0 },

    { code: AccountCode.OWNERS_EQUITY, name: 'Owners Equity', type: AccountType.EQUITY, balance: 0 },
    { code: AccountCode.RETAINED_EARNINGS, name: 'Retained Earnings', type: AccountType.EQUITY, balance: 0 },

    { code: AccountCode.SALES_REVENUE, name: 'Sales Revenue', type: AccountType.REVENUE, balance: 0 },

    { code: AccountCode.COST_OF_GOODS_SOLD, name: 'Cost of Goods Sold', type: AccountType.EXPENSE, balance: 0 },
    { code: AccountCode.WASTE_EXPENSE, name: 'Waste / Spoilage', type: AccountType.EXPENSE, balance: 0 },
];

/**
 * SupplierLedger - Private B2B Ledger for Supplier Hub
 * Manages supply events, catalogs, and credit balances.
 */

export interface SupplyEvent {
    id: string;
    type: 'ORDER_ACCEPTED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'PAYMENT_RECEIVED' | 'DEBT_ADJUSTED';
    timestamp: number;
    clientId: string;
    payload: any;
    hash: string;
}

export interface CreditRecord {
    clientId: string;
    clientName: string;
    balance: number; // Positive = Debt owed to supplier
    limit: number;
    lastPaymentDate: number | null;
}

export class SupplierLedger {
    private dbName = 'nl_supplier_ledger';

    constructor() {
        if (typeof window !== 'undefined' && !localStorage.getItem(this.dbName)) {
            this.init();
        }
    }

    private init() {
        const initialData = {
            events: [],
            credits: [
                { clientId: 'c1', clientName: 'Grand Cairo Grill', balance: 1250.00, limit: 5000, lastPaymentDate: Date.now() - 86400000 * 5 },
                { clientId: 'c2', clientName: 'Sultan Bakery', balance: 450.00, limit: 2000, lastPaymentDate: Date.now() - 86400000 * 12 },
                { clientId: 'c3', clientName: 'Giza Sushi House', balance: 0, limit: 3000, lastPaymentDate: null }
            ],
            catalog: [
                { id: 'p1', name: 'Ground Beef', unit: 'kg', price: 12.00, stock: 450 },
                { id: 'p2', name: 'White Flour', unit: 'bag', price: 45.00, stock: 120 },
                { id: 'p3', name: 'Olive Oil', unit: 'L', price: 8.50, stock: 85 }
            ]
        };
        localStorage.setItem(this.dbName, JSON.stringify(initialData));
    }

    async recordEvent(type: SupplyEvent['type'], clientId: string, payload: any): Promise<SupplyEvent> {
        const data = this.getData();
        const event: SupplyEvent = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
            type,
            timestamp: Date.now(),
            clientId,
            payload,
            hash: `h_${Date.now()}` // Mock hash
        };
        data.events.push(event);
        this.saveData(data);
        return event;
    }

    getData() {
        if (typeof window === 'undefined') return { events: [], credits: [], catalog: [] };
        const raw = localStorage.getItem(this.dbName);
        return raw ? JSON.parse(raw) : { events: [], credits: [], catalog: [] };
    }

    private saveData(data: any) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.dbName, JSON.stringify(data));
    }

    async updateCreditBalance(clientId: string, amount: number) {
        const data = this.getData();
        const idx = data.credits.findIndex((c: any) => c.clientId === clientId);
        if (idx !== -1) {
            data.credits[idx].balance += amount;
            this.saveData(data);
        }
    }
}

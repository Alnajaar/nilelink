/**
 * ChoiceEngine - Predictive Intelligence for Customer App
 * Generates personalized recommendations based on local history.
 */

import { OrderLedger, ImmutableReceipt } from './OrderLedger';

export class ChoiceEngine {
    private ledger: OrderLedger;

    constructor() {
        this.ledger = new OrderLedger();
    }

    async getPersonalizedChoices(): Promise<string[]> {
        const history = this.ledger.getHistory();
        if (history.length === 0) return ['Popular', 'Nearby', 'Offers'];

        // Simple Intelligence: Find most ordered merchants
        const counts: Record<string, number> = {};
        history.forEach(r => {
            counts[r.merchantName] = (counts[r.merchantName] || 0) + 1;
        });

        const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([name]) => name);

        const combined = sorted.concat(['Nearby', 'Discovery']);
        const unique = combined.filter((item, index) => combined.indexOf(item) === index);
        return unique.slice(0, 5);
    }

    async predictNextOrder(): Promise<string | null> {
        const history = this.ledger.getHistory();
        if (history.length < 3) return null;

        // Mock logic: predict based on last ordered
        return history[history.length - 1].merchantName;
    }
}

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

        // Frequency + Recency (Decay-based score)
        const scores: Record<string, number> = {};
        const now = Date.now();
        const decayDays = 30;
        const decayMs = decayDays * 24 * 60 * 60 * 1000;

        history.forEach(r => {
            const timeDiff = now - r.timestamp;
            const recencyScale = Math.max(0, 1 - (timeDiff / decayMs));
            scores[r.merchantName] = (scores[r.merchantName] || 0) + (1 * recencyScale);
        });

        const sorted = Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .map(([name]) => name);

        // Discovery Mode: Filter out highly frequent ones from some slots
        const combined = sorted.concat(['Nearby', 'Trending', 'For You']);
        const unique = combined.filter((item, index) => combined.indexOf(item) === index);

        return unique.slice(0, 6);
    }

    async predictNextOrder(): Promise<{ merchant: string; confidence: number } | null> {
        const history = this.ledger.getHistory();
        if (history.length < 3) return null;

        // Check for periodic behavior (e.g., morning coffee)
        const lastThree = history.slice(-3);
        const name = lastThree[0].merchantName;
        const allSame = lastThree.every(r => r.merchantName === name);

        if (allSame) {
            return { merchant: name, confidence: 0.85 };
        }

        return { merchant: lastThree[lastThree.length - 1].merchantName, confidence: 0.45 };
    }
}

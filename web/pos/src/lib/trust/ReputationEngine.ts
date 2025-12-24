
import { LocalLedger } from '../storage/LocalLedger';
import { EconomicEvent, EventType } from '../events/types';

export class ReputationEngine {
    private ledger: LocalLedger;

    constructor(ledger: LocalLedger) {
        this.ledger = ledger;
    }

    async processEvent(event: EconomicEvent) {
        if (!event.actorId) return;

        const staffId = event.actorId;
        const name = 'Staff Member'; // TODO: Lookup name

        const updates: any = {};

        if (event.type === EventType.ORDER_SUBMITTED) {
            updates.salesCount = 1;
        }

        // TODO: Handle Voids and Cash Variance from other events

        await this.ledger.updateStaffReputation(staffId, name, updates);
    }
}

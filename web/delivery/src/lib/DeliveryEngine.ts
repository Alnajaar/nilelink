export interface DeliveryTask {
    id: string;
    restaurant: string;
    address: string;
    value: number;
    type: 'pickup' | 'delivery';
    payment?: 'cash' | 'epay';
    status: 'pending' | 'accepted' | 'completed';
    coordinates: { lat: number; lng: number }; // For routing
}

export class DeliveryEngine {
    constructor() { }

    async acceptTask(taskId: string): Promise<boolean> {
        console.log(`[DeliveryEngine] Accepted Task ${taskId}`);
        return true;
    }

    async completeTask(taskId: string, proof: string): Promise<boolean> {
        // In a real app, 'proof' would be a signature image dataURL or a hash
        console.log(`[DeliveryEngine] Completed Task ${taskId} with POD: ${proof.substring(0, 20)}...`);
        return true;
    }

    getInitialTasks(): DeliveryTask[] {
        return [
            {
                id: 'DLV-921',
                restaurant: 'Cairo Grill',
                address: '12 Tahrir Sq, Downtown',
                value: 8.50,
                type: 'pickup',
                status: 'pending',
                coordinates: { lat: 30.0444, lng: 31.2357 }
            },
            {
                id: 'DLV-924',
                restaurant: 'Nile Burger Co.',
                address: 'Block 4, Zamalek Res.',
                value: 12.00,
                type: 'delivery',
                payment: 'cash',
                status: 'pending',
                coordinates: { lat: 30.0636, lng: 31.2268 }
            },
            {
                id: 'DLV-930',
                restaurant: 'Koshary El Tahrir',
                address: '15 El Dokki St.',
                value: 6.75,
                type: 'delivery',
                payment: 'epay',
                status: 'pending',
                coordinates: { lat: 30.0385, lng: 31.2117 }
            }
        ];
    }
}

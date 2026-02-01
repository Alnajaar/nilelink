import { db } from '../firebase-admin';

export interface Order {
    id: string;
    uid: string;
    restaurantId: string;
    restaurantName: string;
    items: any[];
    total: number;
    status: 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED';
    paymentMethod: string;
    deliveryAddress: string;
    createdAt: Date;
}

// Fallback in-memory store
declare global {
    var __order_store: Map<string, Order[]> | undefined;
}

const inMemoryOrders = global.__order_store || new Map<string, Order[]>();
if (!global.__order_store) global.__order_store = inMemoryOrders;

export class OrderService {
    private collection = db.collection('orders');
    private useFirestore = !!process.env.FIREBASE_PRIVATE_KEY;

    async listOrders(uid: string): Promise<Order[]> {
        try {
            if (this.useFirestore) {
                const snapshot = await this.collection.where('uid', '==', uid).orderBy('createdAt', 'desc').get();
                return snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
                    } as Order;
                });
            }
            return (inMemoryOrders.get(uid) || []).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } catch (error) {
            console.warn('Firestore listOrders failed, fallback used:', error);
            return inMemoryOrders.get(uid) || [];
        }
    }

    async getOrder(id: string): Promise<Order | null> {
        try {
            if (this.useFirestore) {
                const doc = await this.collection.doc(id).get();
                if (!doc.exists) return null;
                const data = doc.data()!;
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
                } as Order;
            }

            // Search in-memory store
            for (const orders of inMemoryOrders.values()) {
                const found = orders.find(o => o.id === id);
                if (found) return found;
            }
            return null;
        } catch (error) {
            console.error('Error getting order:', error);
            return null;
        }
    }

    async createOrder(order: Omit<Order, 'createdAt'>): Promise<Order> {
        const newOrder: Order = {
            ...order,
            createdAt: new Date()
        };

        try {
            if (this.useFirestore) {
                await this.collection.doc(newOrder.id).set(newOrder);
            } else {
                const existing = inMemoryOrders.get(newOrder.uid) || [];
                inMemoryOrders.set(newOrder.uid, [newOrder, ...existing]);
            }
            return newOrder;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }
}

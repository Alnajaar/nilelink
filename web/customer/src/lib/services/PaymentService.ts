import { db } from '../firebase-admin';

export interface PaymentMethod {
    id: string;
    type: 'card' | 'wallet';
    last4?: string;
    brand?: string;
    isDefault: boolean;
    createdAt: Date;
}

// Fallback in-memory store
declare global {
    var __payment_store: Map<string, PaymentMethod[]> | undefined;
}

const inMemoryPayments = global.__payment_store || new Map<string, PaymentMethod[]>();
if (!global.__payment_store) global.__payment_store = inMemoryPayments;

export class PaymentService {
    private collection = db.collection('payment_methods');
    private useFirestore = !!process.env.FIREBASE_PRIVATE_KEY;

    async listPaymentMethods(uid: string): Promise<PaymentMethod[]> {
        try {
            if (this.useFirestore) {
                const snapshot = await this.collection.where('uid', '==', uid).get();
                return snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        type: data.type,
                        last4: data.last4,
                        brand: data.brand,
                        isDefault: data.isDefault,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
                    } as PaymentMethod;
                });
            }
            return inMemoryPayments.get(uid) || [];
        } catch (error) {
            console.warn('Firestore listPaymentMethods failed, fallback used:', error);
            return inMemoryPayments.get(uid) || [];
        }
    }

    async addPaymentMethod(uid: string, method: Omit<PaymentMethod, 'id' | 'createdAt'>): Promise<PaymentMethod> {
        const id = Math.random().toString(36).substr(2, 9);
        const newMethod: PaymentMethod = {
            ...method,
            id,
            createdAt: new Date()
        };

        try {
            if (this.useFirestore) {
                await this.collection.doc(id).set({
                    ...newMethod,
                    uid
                });
            } else {
                const existing = inMemoryPayments.get(uid) || [];
                // If this is default, unset others
                if (newMethod.isDefault) {
                    existing.forEach(m => m.isDefault = false);
                }
                const updated = [...existing, newMethod];
                inMemoryPayments.set(uid, updated);
            }
            return newMethod;
        } catch (error) {
            console.error('Error adding payment method:', error);
            throw error;
        }
    }

    async setDefault(uid: string, methodId: string): Promise<void> {
        try {
            if (this.useFirestore) {
                const snapshot = await this.collection.where('uid', '==', uid).get();
                const batch = db.batch();
                snapshot.docs.forEach(doc => {
                    batch.update(doc.ref, { isDefault: doc.id === methodId });
                });
                await batch.commit();
            } else {
                const existing = inMemoryPayments.get(uid) || [];
                existing.forEach(m => {
                    m.isDefault = (m.id === methodId);
                });
                inMemoryPayments.set(uid, existing);
            }
        } catch (error) {
            console.error('Error setting default payment method:', error);
            throw error;
        }
    }
}

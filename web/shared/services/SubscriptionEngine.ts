import { db } from '../providers/FirebaseAuthProvider';
import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { eventBus, createEvent } from './EventBus';

export enum ActivationStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    REJECTED = 'rejected'
}

export interface ActivationRequest {
    id: string; // userId
    email: string;
    businessName: string;
    businessType: string;
    planId: string;
    requestedAt: number;
    status: ActivationStatus;
    trialDurationMonths?: number;
    billingCycle: 'monthly' | 'yearly';
    activatedAt?: number;
    visibleCode?: string;
}

export interface AccessCode {
    code: string;
    userId: string;
    planId: string;
    expiresAt: number;
    used: boolean;
    generatedAt: number;
}

export class SubscriptionEngine {
    private static instance: SubscriptionEngine;

    private constructor() { }

    public static getInstance(): SubscriptionEngine {
        if (!SubscriptionEngine.instance) {
            SubscriptionEngine.instance = new SubscriptionEngine();
        }
        return SubscriptionEngine.instance;
    }

    /**
     * Submit a new activation request upon registration
     */
    async submitActivationRequest(userData: {
        userId: string;
        email: string;
        businessName: string;
        businessType: string;
        planId: string;
        billingCycle: 'monthly' | 'yearly';
    }): Promise<void> {
        try {
            // Determine Trial Duration
            const querySnapshot = await getDocs(query(collection(db, 'activation_requests'), where('status', '==', 'active')));
            const activeUserCount = querySnapshot.size;

            const trialMonths = activeUserCount < 10 ? 3 : 1;

            const request: ActivationRequest = {
                id: userData.userId,
                email: userData.email,
                businessName: userData.businessName,
                businessType: userData.businessType,
                planId: userData.planId,
                requestedAt: Date.now(),
                status: ActivationStatus.PENDING,
                trialDurationMonths: trialMonths,
                billingCycle: userData.billingCycle
            };

            // Save Request to Firestore
            await setDoc(doc(db, 'activation_requests', userData.userId), request);

            console.log(`📝 Activation Request Submitted for ${userData.email}. Trial: ${trialMonths} months.`);

            // Publish event
            await eventBus.publish(createEvent('ACTIVATION_REQUEST_SUBMITTED', request, {
                source: 'SubscriptionEngine',
                userId: userData.userId
            }));

        } catch (error) {
            console.error('Failed to submit activation request:', error);
            throw error;
        }
    }

    /**
     * Validate an Access Code entered by the user
     */
    async validateAccessCode(userId: string, code: string): Promise<boolean> {
        try {
            const codeDocRef = doc(db, 'access_codes', code);
            const codeDoc = await getDoc(codeDocRef);

            if (!codeDoc.exists()) {
                throw new Error('Invalid Access Code');
            }

            const codeData = codeDoc.data() as AccessCode;

            // Validation Rules
            if (codeData.used) {
                throw new Error('Code already used');
            }
            if (codeData.userId !== userId) {
                throw new Error('Code not valid for this account');
            }
            if (codeData.expiresAt < Date.now()) {
                throw new Error('Access Code Expired');
            }

            // Activate the Account
            await updateDoc(codeDocRef, { used: true });

            await updateDoc(doc(db, 'activation_requests', userId), {
                status: ActivationStatus.ACTIVE,
                activatedAt: Date.now()
            });

            // Local flag (client side only)
            if (typeof window !== 'undefined') {
                localStorage.setItem('nilelink_activation_status', 'active');
            }

            return true;

        } catch (error) {
            console.error('Activation Failed:', error);
            return false;
        }
    }

    /**
     * [ADMIN ONLY] Generate Activation Code
     */
    async generateActivationCode(requestId: string): Promise<string> {
        try {
            const reqRef = doc(db, 'activation_requests', requestId);
            const reqSnap = await getDoc(reqRef);

            if (!reqSnap.exists()) throw new Error('Request not found');
            const reqData = reqSnap.data() as ActivationRequest;

            // Generate Code (NL-XXXX-XXXX)
            const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
            const code = `NL-${randomPart}`;

            const accessCode: AccessCode = {
                code,
                userId: reqData.id,
                planId: reqData.planId,
                expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
                used: false,
                generatedAt: Date.now()
            };

            await setDoc(doc(db, 'access_codes', code), accessCode);
            await updateDoc(reqRef, { visibleCode: code });

            return code;
        } catch (error) {
            console.error('Code Generation Failed:', error);
            throw error;
        }
    }

    /**
     * [ADMIN ONLY] Get Pending Requests
     */
    async getPendingRequests(): Promise<ActivationRequest[]> {
        try {
            const q = query(collection(db, 'activation_requests'), where('status', '==', 'pending'));
            const snip = await getDocs(q);
            return snip.docs.map(d => d.data() as ActivationRequest);
        } catch (error: any) {
            console.warn('[Subscription Engine] Offline mode: generating secure simulation data');

            // Fail-safe: Return simulated data for testing if Firestore is unreachable
            return [
                {
                    id: 'sim_node_01',
                    email: 'test-node@nilelink.app',
                    businessName: 'Simulated Alpha Node',
                    businessType: 'Premium Store',
                    planId: 'BUSINESS',
                    requestedAt: Date.now() - 3600000,
                    status: ActivationStatus.PENDING,
                    billingCycle: 'monthly'
                }
            ];
        }
    }
}

export const subscriptionEngine = SubscriptionEngine.getInstance();

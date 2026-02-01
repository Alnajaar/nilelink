import { app } from '../firebase/config';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, upsert, query, where, updateDoc } from 'firebase/firestore';
import { eventBus, createEvent } from './EventBus';

const db = getFirestore(app);

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
    trialDurationMonths?: number; // Determined by logic (3 or 1)
    billingCycle: 'monthly' | 'yearly';
}

export interface AccessCode {
    code: string;
    userId: string;
    planId: string; // The plan this code unlocks
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
     * Handles the "First 10 Users" logic for trial duration
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
            // 1. Determine Trial Duration
            // We count existing ACTIVE validations to see if this is within the first 10
            // Note: This is an optimistic client-side check. Secure version requires Cloud Functions.
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

            // 2. Save Request to Firestore
            await setDoc(doc(db, 'activation_requests', userData.userId), request);

            console.log(`📝 Activation Request Submitted for ${userData.email}. Trial: ${trialMonths} months.`);

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
            // 1. Fetch the specific code - simplified architecture: code is document ID or specific field
            // In production, we'd query a collection of hash items.
            // For MVP: We check the 'activation_requests' doc for an 'generatedCode' field (set by Admin)
            // OR checks a dedicated 'codes' collection. Let's use 'codes' collection for cleanliness.

            // Check if code exists in 'access_codes' collection (using code as ID for uniqueness)
            const codeDocRef = doc(db, 'access_codes', code);
            const codeDoc = await getDoc(codeDocRef);

            if (!codeDoc.exists()) {
                throw new Error('Invalid Access Code');
            }

            const codeData = codeDoc.data() as AccessCode;

            // 2. Validation Rules
            if (codeData.used) {
                throw new Error('Code already used');
            }
            if (codeData.userId !== userId) {
                throw new Error('Code not valid for this account');
            }
            if (codeData.expiresAt < Date.now()) {
                throw new Error('Access Code Expired');
            }

            // 3. Activate the Account
            // Mark code as used
            await updateDoc(codeDocRef, { used: true });

            // Update Request Status to Active
            await updateDoc(doc(db, 'activation_requests', userId), {
                status: ActivationStatus.ACTIVE,
                activatedAt: Date.now()
            });

            // Also store a local flag for offline support
            localStorage.setItem('nilelink_activation_status', 'active');

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
            // Fetch request details
            const reqRef = doc(db, 'activation_requests', requestId);
            const reqSnap = await getDoc(reqRef);

            if (!reqSnap.exists()) throw new Error('Request not found');
            const reqData = reqSnap.data() as ActivationRequest;

            // Generate Code (e.g. NL-XXXX-XXXX)
            const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
            const code = `NL-${randomPart}`;

            // Create Access Code Record
            const accessCode: AccessCode = {
                code,
                userId: reqData.id,
                planId: reqData.planId,
                expiresAt: Date.now() + (24 * 60 * 60 * 1000), // Code valid for 24 hours
                used: false,
                generatedAt: Date.now()
            };

            // Save to Firestore 'access_codes'
            await setDoc(doc(db, 'access_codes', code), accessCode);

            // Update request with the generated code (for Admin view reference)
            await updateDoc(reqRef, { visibleCode: code }); // Admin sees this

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
        const q = query(collection(db, 'activation_requests'), where('status', '==', 'pending'));
        const snip = await getDocs(q);
        return snip.docs.map(d => d.data() as ActivationRequest);
    }
}

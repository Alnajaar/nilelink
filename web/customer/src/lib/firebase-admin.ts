import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Helper to handle newlines in private key string from env vars
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

export function initAdmin() {
    if (getApps().length <= 0) {
        if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            // Production: Use service account credentials
            initializeApp({
                credential: cert(firebaseAdminConfig),
            });
            console.log('Firebase Admin initialized with service account.');
        } else {
            // Dev/Fallback: Initialize with project ID even without cert to avoid Project ID detection error
            console.warn('FIREBASE_PRIVATE_KEY or CLIENT_EMAIL not found. Initializing with project ID only (Admin features may fail locally).');
            initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
            });
        }
    }
}

// Initialize immediately to ensure app exists
try {
    initAdmin();
} catch (error) {
    console.error('Firebase Admin init error:', error);
}

export const db = getFirestore();

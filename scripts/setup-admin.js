/**
 * Firebase Admin User Setup Script
 * Run this ONCE to create the initial SUPER_ADMIN user in Firestore
 * 
 * Prerequisites:
 * 1. User must already be registered in Firebase Authentication
 * 2. You need the user's UID from Firebase Console
 * 
 * Usage:
 * node scripts/setup-admin.js YOUR_USER_UID
 */

const admin = require('firebase-admin');
const serviceAccount = require('../path/to/serviceAccountKey.json'); // Update this path

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupAdminUser(uid) {
    if (!uid) {
        console.error('❌ ERROR: Please provide a user UID');
        console.log('Usage: node setup-admin.js YOUR_USER_UID');
        process.exit(1);
    }

    try {
        // Get user from Firebase Auth
        const userRecord = await admin.auth().getUser(uid);
        console.log(`📧 Found user: ${userRecord.email || userRecord.phoneNumber}`);

        // Create/Update user document in Firestore
        await db.collection('users').doc(uid).set({
            uid: uid,
            email: userRecord.email || null,
            phone: userRecord.phoneNumber || null,
            role: 'SUPER_ADMIN',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true,
            deviceFingerprints: []
        }, { merge: true });

        console.log('✅ SUCCESS: User has been granted SUPER_ADMIN role');
        console.log(`UID: ${uid}`);
        console.log(`Email: ${userRecord.email}`);
        console.log('Role: SUPER_ADMIN');
        console.log('\n🎉 You can now log in to the Admin dashboard!');

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        process.exit(1);
    }

    process.exit(0);
}

// Get UID from command line argument
const uid = process.argv[2];
setupAdminUser(uid);

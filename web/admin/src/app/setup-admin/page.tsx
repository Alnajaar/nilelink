/**
 * EMERGENCY ADMIN SETUP PAGE
 * Use this ONCE to grant SUPER_ADMIN role to your account
 * 
 * HOW TO USE:
 * 1. Deploy this page to your Next.js app temporarily
 * 2. Navigate to /setup-admin
 * 3. Log in with your email/password
 * 4. Click "Grant Admin Access"
 * 5. DELETE THIS FILE after setup
 */

'use client';

import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '@shared/providers/FirebaseAuthProvider'; // Import your Firebase app

export default function EmergencyAdminSetup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSetupAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');

        try {
            const auth = getAuth();
            const db = getFirestore();

            // Step 1: Sign in
            setStatus('🔐 Signing in...');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Step 2: Grant SUPER_ADMIN role
            setStatus('👑 Granting SUPER_ADMIN access...');
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                role: 'SUPER_ADMIN',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                isActive: true,
                deviceFingerprints: []
            }, { merge: true });

            setStatus(`✅ SUCCESS! You are now SUPER_ADMIN\n\nUID: ${user.uid}\nEmail: ${user.email}\n\n🎉 You can now access the Admin Dashboard!\n\n⚠️ IMPORTANT: DELETE THIS PAGE NOW!`);

        } catch (error: any) {
            setStatus(`❌ ERROR: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full border border-red-500">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2">⚠️ EMERGENCY ADMIN SETUP</h1>
                    <p className="text-red-400 text-sm font-bold">
                        USE ONCE - THEN DELETE THIS FILE
                    </p>
                </div>

                <form onSubmit={handleSetupAdmin} className="space-y-4">
                    <div>
                        <label className="block text-white text-sm font-bold mb-2">
                            Admin Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white text-sm font-bold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Setting up...' : '👑 GRANT SUPER_ADMIN ACCESS'}
                    </button>
                </form>

                {status && (
                    <div className={`mt-6 p-4 rounded text-sm font-mono whitespace-pre-wrap ${status.includes('ERROR')
                            ? 'bg-red-900/50 text-red-200 border border-red-500'
                            : 'bg-green-900/50 text-green-200 border border-green-500'
                        }`}>
                        {status}
                    </div>
                )}

                <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-600 rounded">
                    <p className="text-yellow-200 text-xs font-bold mb-2">⛔ SECURITY WARNING</p>
                    <ul className="text-yellow-300 text-xs space-y-1">
                        <li>• This page bypasses normal security</li>
                        <li>• DELETE this file immediately after use</li>
                        <li>• Never deploy this to production</li>
                        <li>• Only use during initial setup</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

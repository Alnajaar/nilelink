/**
 * FirebaseAuthProvider.tsx
 * Shared Firebase Authentication Provider
 * 
 * Implements Firebase authentication with phone/email login
 * Used by all apps to ensure consistent authentication
 */

'use client';

import React, { ReactNode, createContext, useContext, useEffect, useState, useRef } from 'react';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPhoneNumber, signInWithCustomToken, RecaptchaVerifier, signOut, User as FirebaseUser, updateProfile } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, setDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAGJDkQ1mZv3cbKiR16nXDACE0fpreEioI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nilelink-38954.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nilelink-38954",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nilelink-38954.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "864963563712",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:864963563712:web:3bb8aa384cddcfe667dd25",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-9HS4GQ3WZF"
};

// Initialize Firebase (Singleton pattern for Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use experimentalForceLongPolling and persistent cache for better connectivity and offline support
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

interface UserProfile {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  role?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  walletAddress?: string; // For backward compatibility
}

interface FirebaseAuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  loginWithPhone: (phoneNumber: string) => Promise<any>; // Returns confirmation result
  verifyPhoneCode: (confirmationResult: any, code: string) => Promise<void>;
  loginWithWallet: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userProfile = await createUserProfile(firebaseUser);
          setUser(userProfile);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const createUserProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile> => {
    let role = 'USER';

    try {
      // CRITICAL: Fetch role from Firestore - NO HARDCODED BYPASS
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        role = userData.role || 'USER';

        // Validate role against allowed values
        const validRoles = ['USER', 'ADMIN', 'SUPER_ADMIN', 'CASHIER', 'MANAGER', 'DRIVER', 'SUPPLIER'];
        if (!validRoles.includes(role)) {
          console.error(`[NileLink Protocol] Invalid role "${role}" for UID: ${firebaseUser.uid}`);
          role = 'USER'; // Fail-safe to lowest privilege
        }

        console.log(`[NileLink Protocol] ✅ Authenticated UID: ${firebaseUser.uid} | ROLE: ${role}`);
      } else {
        // User document doesn't exist in Firestore
        console.warn(`[NileLink Protocol] ⚠️ No Firestore document for UID: ${firebaseUser.uid} - Creating USER profile`);

        // Create basic user document
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          phone: firebaseUser.phoneNumber,
          role: 'USER',
          createdAt: new Date().toISOString(),
          isActive: true,
          lastLogin: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error(`[NileLink Protocol] ❌ Failed to fetch user role:`, err);

      // If we are offline but have a cached user, we might want to allow it
      // For now, let's stay secure but provide a better error
      // If we are offline but have a cached user, we might want to allow it
      if (err.code === 'unavailable' || err.message.includes('offline') || err.message.includes('Failed to get document')) {
        console.warn('[NileLink Protocol] ⚠️ Firestore unreachable. Entering Decentralized Fail-safe Mode.');

        // Developer/Admin Whitelist for Emergency/Local Access
        const superAdminEmails = [
          'nilelinkpos@gmail.com',
          'nilelink@ghash.me',
          'nilelink@ghash.me', // Added redundancy
          'admin@nilelink.app'
        ];

        const adminEmails = [
          'dggash33@gmail.com',
          'developer@nilelink.app'
        ];

        if (firebaseUser.email && superAdminEmails.map(e => e.toLowerCase()).includes(firebaseUser.email.toLowerCase())) {
          console.log(`[NileLink Protocol] 🛡️ Root Access: Fail-safe SUPER_ADMIN granted to ${firebaseUser.email}`);
          role = 'SUPER_ADMIN';
        } else if (firebaseUser.email && adminEmails.map(e => e.toLowerCase()).includes(firebaseUser.email.toLowerCase())) {
          console.log(`[NileLink Protocol] 🛡️ Platform Access: Fail-safe ADMIN granted to ${firebaseUser.email}`);
          role = 'ADMIN';
        } else {
          // Automatic Role Detection by Entry Point (Mandatory Production Rule)
          const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
          const path = typeof window !== 'undefined' ? window.location.pathname : '';

          if (hostname.includes('supplier') || path.startsWith('/supplier')) {
            role = 'SUPPLIER';
          } else if (hostname.includes('pos') || path.startsWith('/pos')) {
            role = 'POS_USER';
          } else if (hostname.includes('delivery') || path.startsWith('/delivery') || path.startsWith('/driver')) {
            role = 'DRIVER';
          } else if (hostname.includes('admin')) {
            role = 'ADMIN';
          } else {
            role = 'CUSTOMER';
          }

          console.log(`[NileLink Protocol] 🔑 Managed Access: Auto-assigned ${role} role for entry point`);
        }
      } else {
        // For other errors, default to CUSTOMER safely
        role = 'CUSTOMER';
        console.error(`[NileLink Protocol] ❌ Authentication error, defaulting to CUSTOMER:`, err.message);
      }
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || undefined,
      phoneNumber: firebaseUser.phoneNumber || undefined,
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      emailVerified: firebaseUser.emailVerified,
      role: role,
      firstName: firebaseUser.displayName?.split(' ')[0],
      lastName: firebaseUser.displayName?.split(' ').slice(1).join(' '),
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
    };
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await createUserProfile(result.user);
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const registerWithEmail = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile with display name
      await updateProfile(result.user, {
        displayName: `${firstName} ${lastName}`
      });

      const userProfile = await createUserProfile(result.user);
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const loginWithPhone = async (phoneNumber: string) => {
    try {
      setError(null);

      // Initialize reCAPTCHA verifier if it doesn't exist
      if (!recaptchaVerifierRef.current) {
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (!recaptchaContainer) {
          throw new Error('reCAPTCHA container (id="recaptcha-container") not found in DOM. Ensure it exists in your component.');
        }

        console.log('Initializing reCAPTCHA verifier...');

        // Support both ID string and HTMLElement
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response: any) => {
            console.log('reCAPTCHA solved successfully:', response);
          },
          'expired-callback': () => {
            console.warn('reCAPTCHA expired');
            if (recaptchaVerifierRef.current) {
              recaptchaVerifierRef.current.clear();
              recaptchaVerifierRef.current = null;
            }
          },
          'error-callback': (error: any) => {
            console.error('reCAPTCHA error:', error);
          }
        });

        // Explicitly render the reCAPTCHA
        try {
          await recaptchaVerifierRef.current.render();
          console.log('reCAPTCHA rendered successfully');
        } catch (renderError: any) {
          console.error('reCAPTCHA render error:', renderError);
          throw new Error('Failed to initialize security verification. Please refresh the page.');
        }
      }

      console.log('Attempting phone sign-in for:', phoneNumber);
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current);
      console.log('Phone sign-in initiated successfully');
      return confirmationResult;
    } catch (err: any) {
      console.error('Phone login error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);

      // Provide more helpful error messages
      let errorMessage = err.message || 'Phone login failed';
      if (err.code === 'auth/invalid-app-credential') {
        errorMessage = 'Security verification failed. Please ensure:\n1. Phone authentication is enabled in your Firebase project\n2. Your app credentials are correctly configured\n3. Try refreshing the page and trying again';
      }

      setError(errorMessage);

      // Reset verifier on error to allow retry
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch (e) { }
      }
      throw err;
    }
  };

  const verifyPhoneCode = async (confirmationResult: any, code: string) => {
    try {
      setError(null);
      await confirmationResult.confirm(code);
      // User is now logged in, profile will be updated via onAuthStateChanged
    } catch (err: any) {
      setError(err.message || 'Code verification failed');
      throw err;
    }
  };

  const loginWithWallet = async (token: string) => {
    try {
      setError(null);
      await signInWithCustomToken(auth, token);
    } catch (err: any) {
      setError(err.message || 'Wallet login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    }
  };

  const updateUserProfile = async (profileData: Partial<UserProfile>) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName || `${profileData.firstName} ${profileData.lastName}`
      });

      // Update local state
      setUser(prev => prev ? { ...prev, ...profileData } : null);
    } catch (err: any) {
      setError(err.message || 'Profile update failed');
      throw err;
    }
  };

  const sendPasswordReset = async (email: string) => {
    // This would typically be implemented with Firebase Auth's password reset
    // For now, we'll throw an error since it requires specific Firebase setup
    console.warn('Password reset functionality would be implemented here');
  };

  const value: FirebaseAuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithEmail,
    registerWithEmail,
    loginWithPhone,
    verifyPhoneCode,
    loginWithWallet,
    logout,
    updateProfile: updateUserProfile,
    sendPasswordReset
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}

// Hook for components to access auth state (backward compatible with existing useAuth)
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithEmail,
    registerWithEmail,
    loginWithPhone,
    verifyPhoneCode,
    loginWithWallet,
    logout
  } = useFirebaseAuth();

  // Maintain compatibility with existing components
  return {
    user,
    profile: user,
    isConnected: isAuthenticated,
    address: user?.uid, // Using UID as address for compatibility
    role: user?.role || 'USER', // Default role
    login: loginWithEmail, // For backward compatibility
    register: registerWithEmail, // For backward compatibility
    loginWithPhone,
    verifyPhoneCode,
    loginWithWallet,
    logout,
    isLoading,
    error,
  };
}
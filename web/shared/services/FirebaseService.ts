import {
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  getAuth,
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  User,
  Auth,
  RecaptchaVerifier,
  ConfirmationResult,
} from 'firebase/auth';

import { auth } from '../providers/FirebaseAuthProvider';

const getFirebaseAuth = (): Auth => {
  return auth;
};

class FirebaseAuthService {
  // Email/Password Authentication
  async signInWithEmail(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const auth = getFirebaseAuth();
      const result = await firebaseSignInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const auth = getFirebaseAuth();
      const result = await firebaseCreateUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await firebaseUpdateProfile(result.user, { displayName });
      }

      // Send email verification
      await firebaseSendEmailVerification(result.user, {
        url: `${window.location.origin}/auth/verify-email`,
        handleCodeInApp: true,
      });

      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Email Verification
  async sendEmailVerification(user: User): Promise<{ success: boolean; error?: string }> {
    try {
      await firebaseSendEmailVerification(user, {
        url: `${window.location.origin}/auth/verify-email`,
        handleCodeInApp: true,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const auth = getFirebaseAuth();
      await firebaseSendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth/login`,
        handleCodeInApp: true,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Phone Authentication
  async initializeRecaptcha(container: string | HTMLElement): Promise<RecaptchaVerifier> {
    const auth = getFirebaseAuth();
    return new RecaptchaVerifier(auth, container, {
      size: 'invisible'
    });
  }

  async signInWithPhone(phoneNumber: string, applicationVerifier: RecaptchaVerifier): Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string }> {
    try {
      const auth = getFirebaseAuth();
      const confirmationResult = await firebaseSignInWithPhoneNumber(auth, phoneNumber, applicationVerifier);
      return { success: true, confirmationResult };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async verifyPhoneCode(confirmationResult: ConfirmationResult, code: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const result = await confirmationResult.confirm(code);
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Profile Management
  async updateUserProfile(updates: { displayName?: string; photoURL?: string }): Promise<{ success: boolean; error?: string }> {
    try {
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, updates);
        return { success: true };
      }
      return { success: false, error: 'No user is currently signed in' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Session Management
  async signOut(): Promise<void> {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const auth = getFirebaseAuth();
    return firebaseOnAuthStateChanged(auth, callback);
  }

  getCurrentUser(): User | null {
    const auth = getFirebaseAuth();
    return auth.currentUser;
  }

  // Email verification status
  isEmailVerified(user: User | null): boolean {
    return user?.emailVerified ?? false;
  }
}

const firebaseAuthService = new FirebaseAuthService();

// Legacy named exports for backward compatibility
export const signInWithEmailAndPassword = firebaseAuthService.signInWithEmail.bind(firebaseAuthService);
export const createUserWithEmailAndPassword = firebaseAuthService.signUpWithEmail.bind(firebaseAuthService);
export const signOut = firebaseAuthService.signOut.bind(firebaseAuthService);
export const onAuthStateChanged = firebaseAuthService.onAuthStateChange.bind(firebaseAuthService);
export const getCurrentUser = firebaseAuthService.getCurrentUser.bind(firebaseAuthService);
export const updateUserProfile = firebaseAuthService.updateUserProfile.bind(firebaseAuthService);
export const initializeRecaptcha = firebaseAuthService.initializeRecaptcha.bind(firebaseAuthService);
export const verifyPhoneNumber = firebaseAuthService.signInWithPhone.bind(firebaseAuthService);
export const sendEmailVerification = firebaseAuthService.sendEmailVerification.bind(firebaseAuthService);
export const sendPasswordResetEmail = firebaseAuthService.sendPasswordResetEmail.bind(firebaseAuthService);
export const isEmailVerified = firebaseAuthService.isEmailVerified.bind(firebaseAuthService);

// Export the lazy getter
export { getFirebaseAuth as auth };

// Default export
export default firebaseAuthService;
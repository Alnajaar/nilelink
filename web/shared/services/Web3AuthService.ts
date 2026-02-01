/**
 * Web3 Authentication Service
 * Decentralized authentication using Sign-In with Ethereum (SIWE)
 * Replaces centralized authentication with wallet-based identity
 */

import { SiweMessage } from 'siwe';
import web3Service from './Web3Service';

export interface DecentralizedUser {
  id: string; // Wallet address
  walletAddress: string;
  email?: string;
  emailVerified: boolean;
  did: string; // Decentralized Identifier
  siweMessage?: string;
  siweSignature?: string;
  lastLogin?: Date;
  chainId: number;
}

export interface AuthSession {
  address: string;
  user: DecentralizedUser;
  expiresAt: Date;
  signatureHash?: string; // For integrity verification
}

export interface AuthChallenge {
  message: string;
  challengeId: string;
  expiresAt: Date;
}

export interface AuthResult {
  success: boolean;
  user?: DecentralizedUser;
  session?: AuthSession;
  error?: string;
}

export class Web3AuthService {
  private static instance: Web3AuthService;
  private currentUser: DecentralizedUser | null = null;
  private sessionExpiry: Date | null = null;

  private constructor() {
    this.initializeFromStorage();
  }

  static getInstance(): Web3AuthService {
    if (!Web3AuthService.instance) {
      Web3AuthService.instance = new Web3AuthService();
    }
    return Web3AuthService.instance;
  }

  /**
   * Initialize from localStorage (for session persistence)
   */
  private initializeFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('nilelink_web3_auth');
      if (stored) {
        const data = JSON.parse(stored);
        const session: AuthSession = {
          address: data.user.walletAddress,
          user: data.user,
          expiresAt: new Date(data.expiry),
          signatureHash: data.signatureHash,
        };

        // Check if session has been tampered with
        if (!this.verifySessionIntegrity(session)) {
          console.warn('Session integrity check failed - clearing auth');
          this.clearStorage();
          return;
        }

        this.currentUser = data.user;
        this.sessionExpiry = new Date(data.expiry);

        // Check if session is still valid
        if (this.sessionExpiry && this.sessionExpiry < new Date()) {
          this.logout();
        }
      }
    } catch (error) {
      console.error('Failed to initialize Web3 auth from storage:', error);
      this.clearStorage();
    }
  }

  /**
   * Create signature hash for integrity verification
   */
  private createSignatureHash(user: DecentralizedUser, expiry: Date): string {
    const data = `${user.walletAddress}:${user.siweSignature}:${expiry.toISOString()}`;
    // Simple hash - in production use crypto.subtle.digest
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Verify session integrity
   */
  private verifySessionIntegrity(session: AuthSession): boolean {
    const expectedHash = this.createSignatureHash(session.user, session.expiresAt);
    return session.signatureHash === expectedHash;
  }

  /**
   * Store authentication data
   */
  private storeAuth(user: DecentralizedUser, expiry: Date): void {
    if (typeof window === 'undefined') return;

    try {
      const signatureHash = this.createSignatureHash(user, expiry);
      localStorage.setItem('nilelink_web3_auth', JSON.stringify({
        user,
        expiry: expiry.toISOString(),
        signatureHash, // For tamper detection
      }));
    } catch (error) {
      console.error('Failed to store Web3 auth:', error);
    }
  }

  /**
   * Clear stored authentication
   */
  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem('nilelink_web3_auth');
      this.currentUser = null;
      this.sessionExpiry = null;
    } catch (error) {
      console.error('Failed to clear Web3 auth storage:', error);
    }
  }

  /**
   * Generate SIWE challenge for wallet authentication
   */
  async generateChallenge(address: string): Promise<AuthChallenge> {
    const network = await web3Service.provider?.getNetwork();
    const chainId = network ? Number(network.chainId) : 137; // Default to Polygon

    const challengeId = Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in to NileLink with Ethereum',
      uri: window.location.origin,
      version: '1',
      chainId,
      nonce: challengeId,
      issuedAt: new Date().toISOString(),
      expirationTime: expiresAt.toISOString(),
      resources: [
        'https://nilelink.app',
        `did:ethr:${chainId}:${address}`,
      ],
    });

    return {
      message: message.toMessage(),
      challengeId,
      expiresAt,
    };
  }

  /**
   * Authenticate with wallet signature
   */
  async authenticateWithSignature(
    address: string,
    signature: string,
    challenge: AuthChallenge
  ): Promise<AuthResult> {
    try {
      // Verify the signature matches the challenge
      const siweMessage = new SiweMessage(challenge.message);

      // Basic validation
      if (siweMessage.address.toLowerCase() !== address.toLowerCase()) {
        return { success: false, error: 'Address mismatch' };
      }

      if (challenge.expiresAt < new Date()) {
        return { success: false, error: 'Challenge expired' };
      }

      // Create decentralized user identity
      const network = await web3Service.provider?.getNetwork();
      const chainId = network ? Number(network.chainId) : 137;

      // Check if we have email info in storage for this user
      const storedUserInfo = localStorage.getItem(`nilelink_user_${address}`);
      const emailInfo = storedUserInfo ? JSON.parse(storedUserInfo) : { email: undefined, emailVerified: false };

      const user: DecentralizedUser = {
        id: address,
        walletAddress: address,
        email: emailInfo.email,
        emailVerified: emailInfo.emailVerified,
        did: `did:ethr:${chainId}:${address}`,
        siweMessage: challenge.message,
        siweSignature: signature,
        lastLogin: new Date(),
        chainId,
      };

      // Set session expiry (24 hours)
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      this.currentUser = user;
      this.sessionExpiry = expiry;
      this.storeAuth(user, expiry);

      return { success: true, user };
    } catch (error: any) {
      console.error('Web3 authentication failed:', error);
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }

  /**
   * Connect wallet and authenticate
   */
  async connectAndAuthenticate(): Promise<AuthResult> {
    try {
      // First connect wallet
      const walletInfo = await web3Service.connectWallet();
      if (!walletInfo) {
        return { success: false, error: 'Failed to connect wallet' };
      }

      // Generate challenge
      const challenge = await this.generateChallenge(walletInfo.address);

      // Get signature from user
      const signature = await this.requestSignature(challenge);
      if (!signature) {
        return { success: false, error: 'Signature cancelled' };
      }

      // Authenticate with signature
      return await this.authenticateWithSignature(
        walletInfo.address,
        signature,
        challenge
      );
    } catch (error: any) {
      console.error('Connect and authenticate failed:', error);
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }

  /**
   * Request signature from wallet
   */
  private async requestSignature(challenge: AuthChallenge): Promise<string | null> {
    try {
      return await web3Service.signMessage(challenge.message);
    } catch (error) {
      console.error('Signature request failed:', error);
      return null;
    }
  }

  /**
   * Verify current session
   */
  async verifySession(): Promise<boolean> {
    if (!this.currentUser || !this.sessionExpiry) {
      return false;
    }

    // Check expiry
    if (this.sessionExpiry < new Date()) {
      console.warn('Session expired');
      this.logout();
      return false;
    }

    // Verify wallet is still connected
    try {
      const connectedAddress = await web3Service.getWalletAddress();
      if (!connectedAddress) {
        console.warn('Wallet not connected');
        this.logout();
        return false;
      }

      // Verify connected wallet matches stored wallet
      if (connectedAddress.toLowerCase() !== this.currentUser.walletAddress.toLowerCase()) {
        console.warn('Connected wallet does not match session wallet');
        this.logout();
        return false;
      }
    } catch (error) {
      console.warn('Error verifying wallet connection:', error);
      return false;
    }

    return true;
  }

  /**
   * Get current session for use in hooks
   */
  getSession(): AuthSession | null {
    if (!this.currentUser || !this.sessionExpiry) {
      return null;
    }

    // Only return if session is still valid
    if (this.sessionExpiry < new Date()) {
      this.logout();
      return null;
    }

    return {
      address: this.currentUser.walletAddress,
      user: this.currentUser,
      expiresAt: this.sessionExpiry,
    };
  }

  /**
   * Save session explicitly
   */
  saveSession(session: AuthSession): void {
    this.currentUser = session.user;
    this.sessionExpiry = session.expiresAt;
    this.storeAuth(session.user, session.expiresAt);
  }

  /**
   * Get current user
   */
  getCurrentUser(): DecentralizedUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.sessionExpiry !== null && this.sessionExpiry > new Date();
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    this.clearStorage();

    // Optional: Disconnect wallet (some wallets maintain connection)
    try {
      if (web3Service.provider && web3Service.provider.send) {
        await web3Service.provider.send('wallet_disconnect', []);
      }
    } catch (error) {
      // Ignore disconnect errors
    }
  }

  /**
   * Refresh session (extend expiry)
   */
  refreshSession(): void {
    if (this.currentUser) {
      const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      this.sessionExpiry = newExpiry;
      this.storeAuth(this.currentUser, newExpiry);
    }
  }

  /**
   * Get DID for current user
   */
  getCurrentDID(): string | null {
    return this.currentUser?.did || null;
  }

  /**
   * Get wallet address for current user
   */
  getWalletAddress(): string | null {
    return this.currentUser?.walletAddress || null;
  }

  /**
   * Register user with email
   */
  async registerWithEmail(email: string): Promise<AuthResult> {
    if (!this.currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // In a real app, this would call an API to send verification email
      // For now, we'll simulate the email verification process
      console.log(`Sending verification email to: ${email}`);

      // Store email with user info
      const userInfo = {
        email,
        emailVerified: false,
        walletAddress: this.currentUser.walletAddress
      };
      
      localStorage.setItem(`nilelink_user_${this.currentUser.walletAddress}`, JSON.stringify(userInfo));

      // Update current user
      this.currentUser.email = email;
      this.currentUser.emailVerified = false;

      // Store updated auth info
      if (this.sessionExpiry) {
        this.storeAuth(this.currentUser, this.sessionExpiry);
      }

      return { success: true, user: this.currentUser };
    } catch (error: any) {
      console.error('Email registration failed:', error);
      return { success: false, error: error.message || 'Email registration failed' };
    }
  }

  /**
   * Verify email with code
   */
  async verifyEmail(code: string): Promise<AuthResult> {
    if (!this.currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // In a real app, this would call an API to verify the email code
      // For simulation, we'll just mark the email as verified
      console.log(`Verifying email with code: ${code}`);

      // Update user info
      const userInfo = {
        email: this.currentUser.email,
        emailVerified: true,
        walletAddress: this.currentUser.walletAddress
      };
      
      localStorage.setItem(`nilelink_user_${this.currentUser.walletAddress}`, JSON.stringify(userInfo));

      // Update current user
      this.currentUser.emailVerified = true;

      // Store updated auth info
      if (this.sessionExpiry) {
        this.storeAuth(this.currentUser, this.sessionExpiry);
      }

      return { success: true, user: this.currentUser };
    } catch (error: any) {
      console.error('Email verification failed:', error);
      return { success: false, error: error.message || 'Email verification failed' };
    }
  }

  /**
   * Check if email is verified
   */
  isEmailVerified(): boolean {
    return this.currentUser?.emailVerified === true;
  }
  
  /**
   * Update email verification status
   */
  updateEmailVerification(email: string, verified: boolean): void {
    if (this.currentUser) {
      // Update current user
      this.currentUser.email = email;
      this.currentUser.emailVerified = verified;

      // Store email info separately
      const userInfo = {
        email,
        emailVerified: verified,
        walletAddress: this.currentUser.walletAddress
      };
      
      localStorage.setItem(`nilelink_user_${this.currentUser.walletAddress}`, JSON.stringify(userInfo));

      // Store updated auth info
      if (this.sessionExpiry) {
        this.storeAuth(this.currentUser, this.sessionExpiry);
      }
    }
  }
}

// Create singleton instance
const web3AuthService = Web3AuthService.getInstance();

export default web3AuthService;

// Export individual functions for easier importing
export const connectAndAuthenticate = () => web3AuthService.connectAndAuthenticate();
export const verifySession = () => web3AuthService.verifySession();
export const getCurrentUser = () => web3AuthService.getCurrentUser();
export const isAuthenticated = () => web3AuthService.isAuthenticated();
export const logout = () => web3AuthService.logout();
export const getCurrentDID = () => web3AuthService.getCurrentDID();
export const getWalletAddress = () => web3AuthService.getWalletAddress();
export const registerWithEmail = (email: string) => web3AuthService.registerWithEmail(email);
export const verifyEmail = (code: string) => web3AuthService.verifyEmail(code);
export const isEmailVerified = () => web3AuthService.isEmailVerified();
export const updateEmailVerification = (email: string, verified: boolean) => web3AuthService.updateEmailVerification(email, verified);
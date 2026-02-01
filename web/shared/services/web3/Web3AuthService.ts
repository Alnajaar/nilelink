/**
 * NileLink Web3 Authentication Service
 * Implements SIWE (Sign-In with Ethereum) for production-grade wallet authentication
 * Primary auth: Wallet signature
 * Secondary (optional): Email + magic link + wallet linking
 */

import { ethers } from 'ethers';

export interface SIWEMessage {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime?: string;
}

export interface AuthSession {
  address: string;
  signature: string;
  message: string;
  nonce: string;
  expiresAt: number;
}

export class Web3AuthService {
  private static instance: Web3AuthService;

  private constructor() {}

  static getInstance(): Web3AuthService {
    if (!Web3AuthService.instance) {
      Web3AuthService.instance = new Web3AuthService();
    }
    return Web3AuthService.instance;
  }

  /**
   * Check if Web3 wallet is available (MetaMask, WalletConnect, etc)
   */
  isWeb3Available(): boolean {
    if (typeof window === 'undefined') return false;
    return (window as any).ethereum !== undefined;
  }

  /**
   * Request wallet connection and get current account
   */
  async connectWallet(): Promise<string> {
    if (!this.isWeb3Available()) {
      throw new Error('Web3 wallet not available. Please install MetaMask or use WalletConnect.');
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found in wallet');
    }

    return accounts[0];
  }

  /**
   * Generate SIWE message for signing
   */
  generateMessage(address: string, nonce: string): string {
    const domain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const chainId = 137; // Polygon mainnet
    const statement = 'Sign this message to authenticate with NileLink';
    const issuedAt = new Date().toISOString();

    const message = `${domain} wants you to sign in with your Ethereum account:\n${address}\n\n${statement}\n\nURI: ${window?.location.origin || 'https://nilelink.app'}\nVersion: 1\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${issuedAt}`;

    return message;
  }

  /**
   * Generate a unique nonce for replay attack prevention
   */
  generateNonce(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Sign the authentication message with user's wallet
   */
  async signMessage(address: string, message: string): Promise<string> {
    if (!this.isWeb3Available()) {
      throw new Error('Web3 wallet not available');
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner(address);
    const signature = await signer.signMessage(message);

    return signature;
  }

  /**
   * Verify signature matches address (frontend verification)
   */
  async verifySignature(address: string, message: string, signature: string): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Complete SIWE authentication flow
   */
  async authenticateWithSIWE(): Promise<AuthSession> {
    // Step 1: Connect wallet
    const address = await this.connectWallet();

    // Step 2: Generate nonce
    const nonce = this.generateNonce();

    // Step 3: Create message
    const message = this.generateMessage(address, nonce);

    // Step 4: Sign message
    const signature = await this.signMessage(address, message);

    // Step 5: Verify locally (frontend)
    const isValid = await this.verifySignature(address, message, signature);
    if (!isValid) {
      throw new Error('Signature verification failed');
    }

    // Step 6: Return session
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    return {
      address,
      signature,
      message,
      nonce,
      expiresAt,
    };
  }

  /**
   * Save session to localStorage (secure httpOnly cookie preferred in production)
   */
  saveSession(session: AuthSession): void {
    if (typeof window === 'undefined') return;

    // In production, use httpOnly cookies instead of localStorage
    sessionStorage.setItem('nilelink_auth_session', JSON.stringify({
      address: session.address,
      expiresAt: session.expiresAt,
      signature: session.signature,
    }));
  }

  /**
   * Get current session from storage
   */
  getSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;

    const stored = sessionStorage.getItem('nilelink_auth_session');
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);

      // Check expiration
      if (parsed.expiresAt < Date.now()) {
        this.clearSession();
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Failed to parse stored session:', error);
      return null;
    }
  }

  /**
   * Clear session
   */
  clearSession(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('nilelink_auth_session');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const session = this.getSession();
    return session !== null && session.expiresAt > Date.now();
  }
}

export const web3AuthService = Web3AuthService.getInstance();

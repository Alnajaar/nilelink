/**
 * Payments API Service
 * Handles all payment and wallet-related API calls
 */

import apiService, { ApiResponse } from './api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'CARD' | 'WALLET' | 'CRYPTO' | 'BANK_TRANSFER';
  last4?: string;
  brand?: string;
  expiryDate?: string;
  isDefault: boolean;
  stripePaymentMethodId?: string;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND' | 'REWARD' | 'INTEREST';
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description?: string;
  reference?: string;
  relatedOrderId?: string;
  relatedSubscriptionId?: string;
  fee?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  paymentMethodId: string;
  orderId?: string;
  subscriptionId?: string;
  description?: string;
  clientSecret?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CryptoTransaction {
  id: string;
  transactionHash: string;
  walletAddress: string;
  amount: number;
  tokenAddress: string;
  blockNumber: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// PAYMENTS API SERVICE
// ============================================================================

class PaymentsService {
  private baseEndpoint = '/payments';
  private walletEndpoint = '/wallet';

  // ========== PAYMENT METHODS ==========

  /**
   * Get all payment methods for current user
   */
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return apiService.get<PaymentMethod[]>(`${this.baseEndpoint}/methods`);
  }

  /**
   * Get a specific payment method
   */
  async getPaymentMethod(methodId: string): Promise<ApiResponse<PaymentMethod>> {
    return apiService.get<PaymentMethod>(`${this.baseEndpoint}/methods/${methodId}`);
  }

  /**
   * Add a new payment method
   */
  async addPaymentMethod(data: {
    type: string;
    [key: string]: any;
  }): Promise<ApiResponse<PaymentMethod>> {
    return apiService.post<PaymentMethod>(`${this.baseEndpoint}/methods`, data);
  }

  /**
   * Update a payment method
   */
  async updatePaymentMethod(methodId: string, data: Partial<PaymentMethod>): Promise<ApiResponse<PaymentMethod>> {
    return apiService.patch<PaymentMethod>(`${this.baseEndpoint}/methods/${methodId}`, data);
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(methodId: string): Promise<ApiResponse<PaymentMethod>> {
    return apiService.patch<PaymentMethod>(`${this.baseEndpoint}/methods/${methodId}/default`, {});
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(methodId: string): Promise<ApiResponse<any>> {
    return apiService.delete(`${this.baseEndpoint}/methods/${methodId}`);
  }

  // ========== WALLET ==========

  /**
   * Get wallet information
   */
  async getWallet(): Promise<ApiResponse<Wallet>> {
    return apiService.get<Wallet>(this.walletEndpoint);
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<ApiResponse<{ balance: number; currency: string }>> {
    return apiService.get<{ balance: number; currency: string }>(`${this.walletEndpoint}/balance`);
  }

  /**
   * Get wallet transactions with pagination
   */
  async getWalletTransactions(filters?: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<{
    transactions: WalletTransaction[];
    total: number;
    page: number;
    pageSize: number;
  }>> {
    return apiService.get(`${this.walletEndpoint}/transactions`, { params: filters });
  }

  /**
   * Get a specific transaction
   */
  async getWalletTransaction(transactionId: string): Promise<ApiResponse<WalletTransaction>> {
    return apiService.get<WalletTransaction>(`${this.walletEndpoint}/transactions/${transactionId}`);
  }

  /**
   * Deposit to wallet
   */
  async depositToWallet(amount: number, paymentMethodId: string): Promise<ApiResponse<{
    transactionId: string;
    status: string;
  }>> {
    return apiService.post(`${this.walletEndpoint}/deposit`, {
      amount,
      paymentMethodId,
    });
  }

  /**
   * Withdraw from wallet
   */
  async withdrawFromWallet(amount: number, destination: string): Promise<ApiResponse<{
    transactionId: string;
    status: string;
  }>> {
    return apiService.post(`${this.walletEndpoint}/withdraw`, {
      amount,
      destination,
    });
  }

  // ========== PAYMENT INTENTS ==========

  /**
   * Create a payment intent for order
   */
  async createPaymentIntent(data: {
    amount: number;
    paymentMethodId: string;
    orderId?: string;
    description?: string;
  }): Promise<ApiResponse<PaymentIntent>> {
    return apiService.post<PaymentIntent>(`${this.baseEndpoint}/intents`, data);
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(intentId: string): Promise<ApiResponse<PaymentIntent>> {
    return apiService.post<PaymentIntent>(`${this.baseEndpoint}/intents/${intentId}/confirm`, {});
  }

  /**
   * Get payment intent details
   */
  async getPaymentIntent(intentId: string): Promise<ApiResponse<PaymentIntent>> {
    return apiService.get<PaymentIntent>(`${this.baseEndpoint}/intents/${intentId}`);
  }

  // ========== CRYPTO PAYMENTS ==========

  /**
   * Get connected crypto wallets
   */
  async getCryptoWallets(): Promise<ApiResponse<any[]>> {
    return apiService.get<any[]>(`${this.baseEndpoint}/crypto/wallets`);
  }

  /**
   * Connect crypto wallet (MetaMask, etc.)
   */
  async connectCryptoWallet(signature: string, walletAddress: string): Promise<ApiResponse<any>> {
    return apiService.post(`${this.baseEndpoint}/crypto/wallets/connect`, {
      signature,
      walletAddress,
    });
  }

  /**
   * Get crypto transaction history
   */
  async getCryptoTransactions(): Promise<ApiResponse<CryptoTransaction[]>> {
    return apiService.get<CryptoTransaction[]>(`${this.baseEndpoint}/crypto/transactions`);
  }

  /**
   * Initiate crypto payment
   */
  async initiateCryptoPayment(data: {
    amount: number;
    tokenAddress: string;
    orderId?: string;
  }): Promise<ApiResponse<{
    transactionHash: string;
    expectedGasPrice: string;
  }>> {
    return apiService.post(`${this.baseEndpoint}/crypto/pay`, data);
  }

  // ========== REWARDS & CASHBACK ==========

  /**
   * Get wallet rewards balance
   */
  async getRewardsBalance(): Promise<ApiResponse<{
    points: number;
    cashbackAmount: number;
    currency: string;
  }>> {
    return apiService.get(`${this.walletEndpoint}/rewards`);
  }

  /**
   * Redeem reward points
   */
  async redeemRewards(points: number): Promise<ApiResponse<{
    transactionId: string;
    creditsApplied: number;
  }>> {
    return apiService.post(`${this.walletEndpoint}/rewards/redeem`, { points });
  }

  /**
   * Get transaction history with rewards breakdown
   */
  async getTransactionSummary(startDate: string, endDate: string): Promise<ApiResponse<any>> {
    return apiService.get(`${this.walletEndpoint}/summary`, {
      params: { startDate, endDate },
    });
  }
}

// Create singleton instance
export const paymentsService = new PaymentsService();

export default paymentsService;

/**
 * Subscriptions API Service
 * Handles all subscription-related API calls
 */

import apiService, { ApiResponse } from './api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SubscriptionBenefit {
  type: 'DISCOUNT' | 'FREE_DELIVERY' | 'EARLY_ACCESS' | 'EXCLUSIVE_ITEM' | 'CUSTOM';
  title: string;
  description?: string;
  value?: Record<string, any>;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  richDescription?: string;
  logoUrl?: string;
  bannerUrl?: string;
  price: number;
  currency: string;
  billingCycle: 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  trialDays: number;
  autoRenew: boolean;
  features: string[];
  benefits?: SubscriptionBenefit[];
  maxSubscribers?: number;
  currentSubscribers?: number;
  visibility: 'PUBLIC' | 'PRIVATE';
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  id: string;
  planId: string;
  plan: SubscriptionPlan;
  userId: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  renewalDate: string;
  cancelledAt?: string;
  benefits: SubscriptionBenefit[];
  autoRenew: boolean;
  paymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionRecommendation {
  planId: string;
  plan: SubscriptionPlan;
  reason: string;
  estimatedSavings?: number;
  relevanceScore: number;
}

// ============================================================================
// SUBSCRIPTIONS API SERVICE
// ============================================================================

class SubscriptionsService {
  private baseEndpoint = '/subscriptions';

  /**
   * Get available subscription plans
   */
  async getPlans(filters?: {
    visibility?: 'PUBLIC' | 'PRIVATE';
    billingCycle?: 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  }): Promise<ApiResponse<SubscriptionPlan[]>> {
    return apiService.get<SubscriptionPlan[]>(this.baseEndpoint, {
      params: filters,
    });
  }

  /**
   * Get a specific subscription plan
   */
  async getPlan(planId: string): Promise<ApiResponse<SubscriptionPlan>> {
    return apiService.get<SubscriptionPlan>(`${this.baseEndpoint}/${planId}`);
  }

  /**
   * Get all subscriptions for the current user
   */
  async getUserSubscriptions(filters?: {
    status?: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
  }): Promise<ApiResponse<UserSubscription[]>> {
    return apiService.get<UserSubscription[]>(
      `${this.baseEndpoint}/user/my-subscriptions`,
      { params: filters }
    );
  }

  /**
   * Get a specific user subscription
   */
  async getUserSubscription(subscriptionId: string): Promise<ApiResponse<UserSubscription>> {
    return apiService.get<UserSubscription>(
      `${this.baseEndpoint}/${subscriptionId}`
    );
  }

  /**
   * Subscribe to a plan
   */
  async subscribeToPlan(planId: string, paymentMethodId?: string): Promise<ApiResponse<UserSubscription>> {
    return apiService.post<UserSubscription>(
      `${this.baseEndpoint}/${planId}/subscribe`,
      { paymentMethodId }
    );
  }

  /**
   * Pause an active subscription
   */
  async pauseSubscription(subscriptionId: string): Promise<ApiResponse<UserSubscription>> {
    return apiService.patch<UserSubscription>(
      `${this.baseEndpoint}/${subscriptionId}/pause`,
      {}
    );
  }

  /**
   * Resume a paused subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<ApiResponse<UserSubscription>> {
    return apiService.patch<UserSubscription>(
      `${this.baseEndpoint}/${subscriptionId}/resume`,
      {}
    );
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, reason?: string): Promise<ApiResponse<UserSubscription>> {
    return apiService.patch<UserSubscription>(
      `${this.baseEndpoint}/${subscriptionId}/cancel`,
      { reason }
    );
  }

  /**
   * Update subscription payment method
   */
  async updatePaymentMethod(subscriptionId: string, paymentMethodId: string): Promise<ApiResponse<UserSubscription>> {
    return apiService.patch<UserSubscription>(
      `${this.baseEndpoint}/${subscriptionId}/payment-method`,
      { paymentMethodId }
    );
  }

  /**
   * Toggle auto-renewal
   */
  async toggleAutoRenewal(subscriptionId: string, autoRenew: boolean): Promise<ApiResponse<UserSubscription>> {
    return apiService.patch<UserSubscription>(
      `${this.baseEndpoint}/${subscriptionId}/auto-renew`,
      { autoRenew }
    );
  }

  /**
   * Get subscription recommendations based on user behavior
   */
  async getRecommendations(): Promise<ApiResponse<SubscriptionRecommendation[]>> {
    return apiService.get<SubscriptionRecommendation[]>(
      `${this.baseEndpoint}/recommendations`
    );
  }

  /**
   * Get subscription history
   */
  async getSubscriptionHistory(subscriptionId: string): Promise<ApiResponse<any[]>> {
    return apiService.get<any[]>(
      `${this.baseEndpoint}/${subscriptionId}/history`
    );
  }

  /**
   * Get subscription plans for a supplier
   */
  async getSupplierPlans(supplierId: string): Promise<ApiResponse<SubscriptionPlan[]>> {
    return apiService.get<SubscriptionPlan[]>(
      `${this.baseEndpoint}/supplier/${supplierId}/plans`
    );
  }

  /**
   * Get subscribers for a supplier
   */
  async getSupplierSubscribers(supplierId: string): Promise<ApiResponse<UserSubscription[]>> {
    return apiService.get<UserSubscription[]>(
      `${this.baseEndpoint}/supplier/${supplierId}/subscribers`
    );
  }

  /**
   * Create a subscription plan for a supplier
   */
  async createPlan(planData: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>, supplierId: string): Promise<ApiResponse<SubscriptionPlan>> {
    return apiService.post<SubscriptionPlan>(
      `${this.baseEndpoint}/supplier/${supplierId}/plans`,
      planData
    );
  }

  /**
   * Update a subscription plan
   */
  async updatePlan(planId: string, planData: Partial<SubscriptionPlan>): Promise<ApiResponse<SubscriptionPlan>> {
    return apiService.put<SubscriptionPlan>(
      `${this.baseEndpoint}/plans/${planId}`,
      planData
    );
  }

  /**
   * Delete a subscription plan
   */
  async deletePlan(planId: string): Promise<ApiResponse<void>> {
    return apiService.delete(
      `${this.baseEndpoint}/plans/${planId}`
    );
  }

  /**
   * Get supplier's subscription statistics
   */
  async getSupplierStats(supplierId: string): Promise<ApiResponse<any>> {
    return apiService.get<any>(
      `${this.baseEndpoint}/supplier/${supplierId}/stats`
    );
  }
}

// Create singleton instance
export const subscriptionsService = new SubscriptionsService();

export default subscriptionsService;

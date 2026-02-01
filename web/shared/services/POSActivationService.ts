import { DatabaseService } from './DatabaseService';

interface ActivationRequest {
  id: string;
  userId: string;
  businessName: string;
  businessAddress: string;
  businessType: 'restaurant' | 'supermarket' | 'coffee_shop' | 'retail' | 'other';
  contactEmail: string;
  contactPhone: string;
  requestedFeatures: string[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: number;
  approvedAt?: number;
  approvedBy?: string;
  rejectionReason?: string;
  activationCode?: string;
  metadata: Record<string, any>;
}

class POSActivationService {
  private static instance: POSActivationService;
  private dbService: DatabaseService;

  private constructor() {
    this.dbService = new DatabaseService();
  }

  public static getInstance(): POSActivationService {
    if (!POSActivationService.instance) {
      POSActivationService.instance = new POSActivationService();
    }
    return POSActivationService.instance;
  }

  /**
   * Submit a new POS activation request
   */
  public async submitActivationRequest(
    userId: string,
    businessInfo: {
      name: string;
      address: string;
      type: 'restaurant' | 'supermarket' | 'coffee_shop' | 'retail' | 'other';
      contactEmail: string;
      contactPhone: string;
      requestedFeatures: string[];
    }
  ): Promise<ActivationRequest> {
    const request: ActivationRequest = {
      id: this.generateId(),
      userId,
      businessName: businessInfo.name,
      businessAddress: businessInfo.address,
      businessType: businessInfo.type,
      contactEmail: businessInfo.contactEmail,
      contactPhone: businessInfo.contactPhone,
      requestedFeatures: businessInfo.requestedFeatures,
      status: 'pending',
      requestedAt: Date.now(),
      metadata: {}
    };

    // Save the request to the database
    await this.dbService.createActivationRequest(request);

    return request;
  }

  /**
   * Get all pending activation requests
   */
  public async getPendingRequests(): Promise<ActivationRequest[]> {
    return await this.dbService.getActivationRequestsByStatus('pending');
  }

  /**
   * Get activation request by ID
   */
  public async getRequestById(requestId: string): Promise<ActivationRequest | null> {
    return await this.dbService.getActivationRequestById(requestId);
  }

  /**
   * Approve an activation request
   */
  public async approveRequest(requestId: string, approvedBy: string): Promise<ActivationRequest> {
    const request = await this.getRequestById(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request is not in pending status');
    }

    // Generate activation code
    const activationCode = this.generateActivationCode();

    // Update the request status
    request.status = 'approved';
    request.approvedAt = Date.now();
    request.approvedBy = approvedBy;
    request.activationCode = activationCode;

    // Save the updated request
    await this.dbService.updateActivationRequest(request);

    // Send notification to user
    await this.notifyUser(request.userId, 'activation_approved', {
      businessName: request.businessName,
      activationCode,
      message: 'Your POS activation request has been approved. Use the activation code to activate your POS system.'
    });

    return request;
  }

  /**
   * Reject an activation request
   */
  public async rejectRequest(requestId: string, approvedBy: string, reason: string): Promise<ActivationRequest> {
    const request = await this.getRequestById(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request is not in pending status');
    }

    // Update the request status
    request.status = 'rejected';
    request.approvedAt = Date.now();
    request.approvedBy = approvedBy;
    request.rejectionReason = reason;

    // Save the updated request
    await this.dbService.updateActivationRequest(request);

    // Send notification to user
    await this.notifyUser(request.userId, 'activation_rejected', {
      businessName: request.businessName,
      reason,
      message: 'Your POS activation request has been rejected. Reason: ' + reason
    });

    return request;
  }

  /**
   * Activate POS using activation code
   */
  public async activatePOS(userId: string, activationCode: string): Promise<boolean> {
    // Find the approved request with this activation code
    const request = await this.dbService.getActivationRequestByCode(activationCode);
    
    if (!request) {
      throw new Error('Invalid activation code');
    }

    if (request.status !== 'approved') {
      throw new Error('Activation code is not approved');
    }

    if (request.userId !== userId) {
      throw new Error('Activation code does not belong to this user');
    }

    // Update request to completed
    request.status = 'completed';
    await this.dbService.updateActivationRequest(request);

    // Update user's POS status in the database
    await this.dbService.activatePOSForUser(userId);

    // Send notification to user
    await this.notifyUser(userId, 'pos_activated', {
      message: 'Your POS system has been successfully activated!'
    });

    return true;
  }

  /**
   * Validate activation code
   */
  public async validateActivationCode(activationCode: string): Promise<{
    isValid: boolean;
    userId?: string;
    businessName?: string;
    status?: string;
  }> {
    const request = await this.dbService.getActivationRequestByCode(activationCode);
    
    if (!request) {
      return { isValid: false };
    }

    return {
      isValid: true,
      userId: request.userId,
      businessName: request.businessName,
      status: request.status
    };
  }

  /**
   * Get activation requests by user
   */
  public async getRequestsByUser(userId: string): Promise<ActivationRequest[]> {
    return await this.dbService.getActivationRequestsByUser(userId);
  }

  /**
   * Get activation statistics
   */
  public async getActivationStats(): Promise<{
    totalRequests: number;
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
  }> {
    const allRequests = await this.dbService.getAllActivationRequests();
    
    return {
      totalRequests: allRequests.length,
      pending: allRequests.filter(r => r.status === 'pending').length,
      approved: allRequests.filter(r => r.status === 'approved').length,
      rejected: allRequests.filter(r => r.status === 'rejected').length,
      completed: allRequests.filter(r => r.status === 'completed').length,
    };
  }

  /**
   * Generate activation code
   */
  private generateActivationCode(): string {
    // Generate a unique activation code (format: ACT-XXXX-XXXX)
    const randomPart1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomPart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ACT-${randomPart1}-${randomPart2}`;
  }

  /**
   * Generate a unique ID for requests
   */
  private generateId(): string {
    return `actreq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send notification to user
   */
  private async notifyUser(userId: string, type: string, data: any): Promise<void> {
    // This would integrate with the notification service
    // For now, we'll just log it
    console.log(`Notification sent to user ${userId}: ${type}`, data);
  }
}

// Export singleton instance
export const posActivationService = POSActivationService.getInstance();

// Export types
export type { ActivationRequest };
export { POSActivationService };
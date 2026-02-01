import { DatabaseService } from './DatabaseService';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin' | 'pos' | 'supplier' | 'driver' | 'customer';
  status: 'active' | 'inactive' | 'suspended' | 'pending_activation';
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
  profilePicture?: string;
  phoneNumber?: string;
  metadata: Record<string, any>;
}

interface UserActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
}

interface UserEarnings {
  userId: string;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  currency: string;
  lastUpdated: number;
}

interface UserComplaints {
  id: string;
  userId: string;
  reportedBy: string;
  complaintType: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'dismissed';
  createdAt: number;
  resolvedAt?: number;
  resolutionNotes?: string;
}

class UserManagementService {
  private static instance: UserManagementService;
  private dbService: DatabaseService;

  private constructor() {
    this.dbService = new DatabaseService();
  }

  public static getInstance(): UserManagementService {
    if (!UserManagementService.instance) {
      UserManagementService.instance = new UserManagementService();
    }
    return UserManagementService.instance;
  }

  /**
   * Get user by ID
   */
  public async getUserById(userId: string): Promise<UserProfile | null> {
    return await this.dbService.getUserById(userId);
  }

  /**
   * Get user by email
   */
  public async getUserByEmail(email: string): Promise<UserProfile | null> {
    return await this.dbService.getUserByEmail(email);
  }

  /**
   * Create a new user
   */
  public async createUser(userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const user: UserProfile = {
      ...userData,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: userData.metadata || {}
    };

    await this.dbService.createUser(user);
    
    // Log the user creation activity
    await this.logUserActivity(user.id, 'user_created', {}, undefined, undefined);

    return user;
  }

  /**
   * Update user profile
   */
  public async updateUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const existingUser = await this.getUserById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUser: UserProfile = {
      ...existingUser,
      ...updates,
      updatedAt: Date.now()
    };

    await this.dbService.updateUser(updatedUser);
    
    // Log the user update activity
    await this.logUserActivity(userId, 'user_updated', { updates }, undefined, undefined);

    return updatedUser;
  }

  /**
   * Deactivate user account
   */
  public async deactivateUser(userId: string, deactivatedBy: string, reason?: string): Promise<UserProfile> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await this.updateUser(userId, {
      status: 'inactive',
      metadata: {
        ...user.metadata,
        deactivatedBy,
        deactivatedAt: Date.now(),
        deactivationReason: reason
      }
    });

    // Log the deactivation activity
    await this.logUserActivity(userId, 'user_deactivated', { reason, deactivatedBy }, undefined, undefined);

    return updatedUser;
  }

  /**
   * Suspend user account
   */
  public async suspendUser(userId: string, suspendedBy: string, reason?: string): Promise<UserProfile> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await this.updateUser(userId, {
      status: 'suspended',
      metadata: {
        ...user.metadata,
        suspendedBy,
        suspendedAt: Date.now(),
        suspensionReason: reason
      }
    });

    // Log the suspension activity
    await this.logUserActivity(userId, 'user_suspended', { reason, suspendedBy }, undefined, undefined);

    return updatedUser;
  }

  /**
   * Activate user account
   */
  public async activateUser(userId: string, activatedBy: string): Promise<UserProfile> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await this.updateUser(userId, {
      status: 'active',
      metadata: {
        ...user.metadata,
        activatedBy,
        activatedAt: Date.now()
      }
    });

    // Log the activation activity
    await this.logUserActivity(userId, 'user_activated', { activatedBy }, undefined, undefined);

    return updatedUser;
  }

  /**
   * Get all users by role
   */
  public async getUsersByRole(role: UserProfile['role'], filters?: {
    status?: UserProfile['status'];
    limit?: number;
    offset?: number;
  }): Promise<UserProfile[]> {
    return await this.dbService.getUsersByRole(role, filters);
  }

  /**
   * Get all users with pagination
   */
  public async getAllUsers(page: number = 1, limit: number = 50): Promise<{
    users: UserProfile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const users = await this.dbService.getAllUsers(offset, limit);
    const total = await this.dbService.getUserCount();
    
    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Search users
   */
  public async searchUsers(searchTerm: string, role?: UserProfile['role']): Promise<UserProfile[]> {
    return await this.dbService.searchUsers(searchTerm, role);
  }

  /**
   * Log user activity
   */
  public async logUserActivity(
    userId: string,
    action: string,
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<UserActivity> {
    const activity: UserActivity = {
      id: this.generateActivityId(),
      userId,
      action,
      timestamp: Date.now(),
      ipAddress,
      userAgent,
      details
    };

    await this.dbService.logUserActivity(activity);
    return activity;
  }

  /**
   * Get user activity history
   */
  public async getUserActivityHistory(userId: string, limit: number = 50): Promise<UserActivity[]> {
    return await this.dbService.getUserActivityHistory(userId, limit);
  }

  /**
   * Get user earnings information
   */
  public async getUserEarnings(userId: string): Promise<UserEarnings> {
    // Get earnings from the database
    const earnings = await this.dbService.getUserEarnings(userId);
    
    if (!earnings) {
      return {
        userId,
        totalEarnings: 0,
        pendingEarnings: 0,
        paidEarnings: 0,
        currency: 'USD',
        lastUpdated: Date.now()
      };
    }
    
    return earnings;
  }

  /**
   * Update user earnings
   */
  public async updateUserEarnings(userId: string, earningsUpdate: Partial<UserEarnings>): Promise<UserEarnings> {
    const currentEarnings = await this.getUserEarnings(userId);
    const updatedEarnings: UserEarnings = {
      ...currentEarnings,
      ...earningsUpdate,
      lastUpdated: Date.now()
    };

    await this.dbService.updateUserEarnings(updatedEarnings);
    return updatedEarnings;
  }

  /**
   * Report a user
   */
  public async reportUser(reporterId: string, reportedUserId: string, complaintType: string, description: string): Promise<UserComplaints> {
    const complaint: UserComplaints = {
      id: this.generateComplaintId(),
      userId: reportedUserId,
      reportedBy: reporterId,
      complaintType,
      description,
      status: 'open',
      createdAt: Date.now()
    };

    await this.dbService.createComplaint(complaint);
    
    // Log the complaint activity
    await this.logUserActivity(reporterId, 'user_reported', { 
      reportedUserId, 
      complaintType, 
      description 
    }, undefined, undefined);

    return complaint;
  }

  /**
   * Update complaint status
   */
  public async updateComplaintStatus(
    complaintId: string, 
    status: UserComplaints['status'], 
    resolverId?: string, 
    resolutionNotes?: string
  ): Promise<UserComplaints> {
    const complaint = await this.dbService.getComplaintById(complaintId);
    if (!complaint) {
      throw new Error('Complaint not found');
    }

    const updatedComplaint: UserComplaints = {
      ...complaint,
      status,
      resolvedAt: status === 'resolved' || status === 'dismissed' ? Date.now() : complaint.resolvedAt,
      resolutionNotes: resolutionNotes || complaint.resolutionNotes
    };

    await this.dbService.updateComplaint(updatedComplaint);
    
    // Log the complaint update activity
    await this.logUserActivity(resolverId || 'system', 'complaint_updated', { 
      complaintId, 
      status, 
      resolutionNotes 
    }, undefined, undefined);

    return updatedComplaint;
  }

  /**
   * Get user complaints
   */
  public async getUserComplaints(userId: string, status?: UserComplaints['status']): Promise<UserComplaints[]> {
    return await this.dbService.getUserComplaints(userId, status);
  }

  /**
   * Get complaints by status
   */
  public async getComplaintsByStatus(status: UserComplaints['status'], limit: number = 50): Promise<UserComplaints[]> {
    return await this.dbService.getComplaintsByStatus(status, limit);
  }

  /**
   * Assign special offers to user
   */
  public async assignSpecialOffer(userId: string, offerId: string, assignedBy: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user metadata to include special offers
    const updatedMetadata = {
      ...user.metadata,
      specialOffers: [
        ...(user.metadata.specialOffers || []),
        {
          offerId,
          assignedAt: Date.now(),
          assignedBy
        }
      ]
    };

    await this.updateUser(userId, { metadata: updatedMetadata });
    
    // Log the special offer assignment
    await this.logUserActivity(userId, 'special_offer_assigned', { offerId, assignedBy }, undefined, undefined);
  }

  /**
   * Change user role
   */
  public async changeUserRole(userId: string, newRole: UserProfile['role'], changedBy: string): Promise<UserProfile> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const oldRole = user.role;
    const updatedUser = await this.updateUser(userId, { 
      role: newRole,
      metadata: {
        ...user.metadata,
        roleChangedFrom: oldRole,
        roleChangedAt: Date.now(),
        roleChangedBy: changedBy
      }
    });

    // Log the role change activity
    await this.logUserActivity(userId, 'user_role_changed', { 
      oldRole, 
      newRole, 
      changedBy 
    }, undefined, undefined);

    return updatedUser;
  }

  /**
   * Get user performance metrics
   */
  public async getUserPerformance(userId: string): Promise<Record<string, any>> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // This would aggregate various metrics based on user role
    // For different roles, different metrics would be returned
    const baseMetrics = {
      userId,
      role: user.role,
      status: user.status,
      joinDate: user.createdAt,
      totalActivities: 0,
      lastActive: user.lastLoginAt
    };

    // Extend metrics based on role
    switch (user.role) {
      case 'pos':
        // POS-specific metrics
        return {
          ...baseMetrics,
          totalTransactions: 0,
          totalRevenue: 0,
          commissionEarned: 0,
          activeSubscriptions: 0
        };
      case 'supplier':
        // Supplier-specific metrics
        return {
          ...baseMetrics,
          totalOrders: 0,
          totalRevenue: 0,
          commissionPaid: 0,
          activeProducts: 0
        };
      case 'driver':
        // Driver-specific metrics
        return {
          ...baseMetrics,
          totalDeliveries: 0,
          totalEarnings: 0,
          rating: 0,
          activeDeliveries: 0
        };
      case 'customer':
        // Customer-specific metrics
        return {
          ...baseMetrics,
          totalOrders: 0,
          totalSpent: 0,
          favoriteRestaurants: [],
          loyaltyPoints: 0
        };
      case 'admin':
      case 'super_admin':
        // Admin-specific metrics
        return {
          ...baseMetrics,
          totalManagedUsers: 0,
          totalManagedEntities: 0,
          adminActions: 0
        };
      default:
        return baseMetrics;
    }
  }

  /**
   * Generate a unique ID for users
   */
  private generateId(): string {
    return `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique ID for activities
   */
  private generateActivityId(): string {
    return `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique ID for complaints
   */
  private generateComplaintId(): string {
    return `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user statistics
   */
  public async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    byRole: Record<string, number>;
  }> {
    const allUsers = await this.dbService.getAllUsers(0, 10000); // Get all users
    
    const stats = {
      totalUsers: allUsers.length,
      activeUsers: 0,
      suspendedUsers: 0,
      byRole: {} as Record<string, number>
    };

    allUsers.forEach(user => {
      // Count by status
      if (user.status === 'active') stats.activeUsers++;
      if (user.status === 'suspended') stats.suspendedUsers++;

      // Count by role
      if (!stats.byRole[user.role]) {
        stats.byRole[user.role] = 0;
      }
      stats.byRole[user.role]++;
    });

    return stats;
  }
}

// Export singleton instance
export const userManagementService = UserManagementService.getInstance();

// Export types
export type { UserProfile, UserActivity, UserEarnings, UserComplaints };
export { UserManagementService };
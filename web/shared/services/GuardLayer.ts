/**
 * Unified Guard Layer (Decentralized)
 * Central enforcement point for permissions, compliance, and feature access
 * 
 * ARCHITECTURE:
 * - Firebase Auth: User authentication only
 * - Smart Contracts: Permission data (roles, plans, access)
 * - IPFS: Compliance rules, consent documents
 * - The Graph: Query layer for quick access checks
 * - Client-side: UI enforcement + audit logging
 */

import { UserRole, PlanTier, OnChainUser, OnChainBusiness, isAdmin, isSuperAdmin } from '../types/database';

// ============================================
// GUARD CONTEXT
// ============================================

export interface GuardContext {
    userId: string; // Firebase UID or Wallet Address
    walletAddress?: string; // Blockchain address
    userRole: UserRole;
    businessId?: string; // Business contract address or tokenId
    country: string;
    plan?: PlanTier;
    action: string; // e.g., 'CREATE_PRODUCT', 'UPDATE_EMPLOYEE', 'DELETE_ORDER'
    resource: string; // e.g., 'products', 'employees', 'orders'
    resourceId?: string;
}

export interface GuardResult {
    allowed: boolean;
    reason?: string;
    requiredRole?: UserRole[];
    requiredPlan?: PlanTier[];
    requiredConsents?: string[];
    missingFeatures?: string[];
    complianceIssue?: string;
}

// ============================================
// PLAN-BASED FEATURES MATRIX
// ============================================

export const PLAN_FEATURES: Record<PlanTier, string[]> = {
    STARTER: [
        'basic_pos',
        'single_location',
        'max_5_employees',
        'max_100_products',
        'email_support',
        'basic_reports',
    ],
    BUSINESS: [
        'advanced_pos',
        'multi_location',
        'max_20_employees',
        'max_1000_products',
        'inventory_management',
        'supplier_integration',
        'customer_management',
        'basic_analytics',
        'priority_support',
    ],
    PREMIUM: [
        'all_business_features',
        'max_50_employees',
        'unlimited_products',
        'ai_recommendations',
        'loyalty_program',
        'delivery_management',
        'advanced_analytics',
        'custom_reports',
        'api_access_basic',
        '24_7_support',
    ],
    ENTERPRISE: [
        'all_premium_features',
        'unlimited_employees',
        'unlimited_products',
        'unlimited_locations',
        'custom_features',
        'dedicated_support',
        'api_access_full',
        'white_label',
        'custom_integrations',
        'sla_guarantee',
    ],
};

// ============================================
// RESOURCE-ACTION PERMISSION MATRIX
// ============================================

export const PERMISSION_MATRIX: Record<string, {
    requiredRole?: UserRole[];
    requiredFeature?: string;
    requiredPlan?: PlanTier[];
}> = {
    // ===== ADMIN PERMISSIONS =====
    'VIEW_ADMIN_DASHBOARD': { requiredRole: ['ADMIN', 'SUPER_ADMIN'] },
    'MANAGE_SUBSCRIBERS': { requiredRole: ['SUPER_ADMIN'] },
    'GENERATE_ACTIVATION_CODE': { requiredRole: ['SUPER_ADMIN'] },
    'CHANGE_USER_ROLE': { requiredRole: ['SUPER_ADMIN'] },
    'VIEW_AUDIT_LOGS': { requiredRole: ['ADMIN', 'SUPER_ADMIN'] },
    'MANAGE_COMPLIANCE': { requiredRole: ['SUPER_ADMIN'] },

    // ===== BUSINESS MANAGEMENT =====
    'CREATE_BUSINESS': { requiredRole: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
    'UPDATE_BUSINESS': { requiredRole: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    'DELETE_BUSINESS': { requiredRole: ['SUPER_ADMIN'] },

    // ===== EMPLOYEE MANAGEMENT =====
    'CREATE_EMPLOYEE': { requiredRole: ['MANAGER', 'ADMIN'], requiredFeature: 'basic_pos' },
    'UPDATE_EMPLOYEE': { requiredRole: ['MANAGER', 'ADMIN'] },
    'DELETE_EMPLOYEE': { requiredRole: ['MANAGER', 'ADMIN'] },
    'VIEW_EMPLOYEE_SALARY': { requiredRole: ['MANAGER', 'ADMIN'] },
    'UPDATE_EMPLOYEE_SALARY': { requiredRole: ['MANAGER', 'ADMIN'] },

    // ===== PRODUCT MANAGEMENT =====
    'CREATE_PRODUCT': { requiredRole: ['CASHIER', 'MANAGER', 'ADMIN'], requiredFeature: 'basic_pos' },
    'UPDATE_PRODUCT': { requiredRole: ['CASHIER', 'MANAGER', 'ADMIN'] },
    'DELETE_PRODUCT': { requiredRole: ['MANAGER', 'ADMIN'] },
    'IMPORT_PRODUCTS': { requiredRole: ['MANAGER', 'ADMIN'], requiredPlan: ['BUSINESS', 'PREMIUM', 'ENTERPRISE'] },

    // ===== SALES & ORDERS =====
    'CREATE_ORDER': { requiredRole: ['CASHIER', 'MANAGER', 'ADMIN'], requiredFeature: 'basic_pos' },
    'UPDATE_ORDER': { requiredRole: ['CASHIER', 'MANAGER', 'ADMIN'] },
    'CANCEL_ORDER': { requiredRole: ['MANAGER', 'ADMIN'] },
    'REFUND_ORDER': { requiredRole: ['MANAGER', 'ADMIN'] },

    // ===== INVENTORY =====
    'MANAGE_INVENTORY': { requiredPlan: ['BUSINESS', 'PREMIUM', 'ENTERPRISE'], requiredFeature: 'inventory_management' },
    'VIEW_STOCK_ALERTS': { requiredFeature: 'inventory_management' },
    'RESTOCK_REQUEST': { requiredFeature: 'supplier_integration' },

    // ===== SUPPLIER =====
    'CREATE_SUPPLIER': { requiredRole: ['ADMIN', 'SUPER_ADMIN'] },
    'UPDATE_SUPPLIER': { requiredRole: ['SUPPLIER', 'ADMIN'] },
    'VIEW_SUPPLIER_COMMISSION': { requiredRole: ['SUPPLIER', 'ADMIN'] },

    // ===== DELIVERY =====
    'CREATE_DELIVERY': { requiredFeature: 'delivery_management', requiredPlan: ['PREMIUM', 'ENTERPRISE'] },
    'ASSIGN_DRIVER': { requiredRole: ['MANAGER', 'ADMIN'], requiredFeature: 'delivery_management' },
    'UPDATE_DELIVERY_STATUS': { requiredRole: ['DRIVER', 'ADMIN'] },

    // ===== CUSTOMER & LOYALTY =====
    'VIEW_CUSTOMERS': { requiredFeature: 'customer_management' },
    'MANAGE_LOYALTY': { requiredFeature: 'loyalty_program', requiredPlan: ['PREMIUM', 'ENTERPRISE'] },
    'CREATE_OFFER': { requiredRole: ['MANAGER', 'ADMIN'], requiredFeature: 'loyalty_program' },

    // ===== ANALYTICS & REPORTS =====
    'VIEW_BASIC_REPORTS': { requiredFeature: 'basic_reports' },
    'VIEW_ADVANCED_ANALYTICS': { requiredFeature: 'advanced_analytics', requiredPlan: ['PREMIUM', 'ENTERPRISE'] },
    'EXPORT_DATA': { requiredRole: ['MANAGER', 'ADMIN'] },

    // ===== AI FEATURES =====
    'USE_AI_RECOMMENDATIONS': { requiredFeature: 'ai_recommendations', requiredPlan: ['PREMIUM', 'ENTERPRISE'] },
    'AI_ASSISTANT': { requiredFeature: 'ai_recommendations' },
};

// ============================================
// UNIFIED GUARD LAYER CLASS
// ============================================

export class UnifiedGuardLayer {
    /**
     * Check if user has permission to perform an action
     */
    async checkAccess(context: GuardContext): Promise<GuardResult> {
        try {
            // Step 1: Check if action exists in permission matrix
            const permission = PERMISSION_MATRIX[context.action];

            if (!permission) {
                // Action not defined - default DENY
                return {
                    allowed: false,
                    reason: `Action "${context.action}" is not defined in permission matrix`,
                };
            }

            // Step 2: Check role requirement
            if (permission.requiredRole) {
                if (!permission.requiredRole.includes(context.userRole)) {
                    return {
                        allowed: false,
                        reason: `Insufficient role. Required: ${permission.requiredRole.join(' or ')}`,
                        requiredRole: permission.requiredRole,
                    };
                }
            }

            // Step 3: Check plan requirement
            if (permission.requiredPlan && context.plan) {
                if (!permission.requiredPlan.includes(context.plan)) {
                    return {
                        allowed: false,
                        reason: `Plan upgrade required. Required: ${permission.requiredPlan.join(' or ')}`,
                        requiredPlan: permission.requiredPlan,
                    };
                }
            }

            // Step 4: Check feature requirement
            if (permission.requiredFeature && context.plan) {
                const hasFeature = await this.checkFeature(context.plan, permission.requiredFeature);
                if (!hasFeature) {
                    return {
                        allowed: false,
                        reason: `Missing feature: ${permission.requiredFeature}`,
                        missingFeatures: [permission.requiredFeature],
                    };
                }
            }

            // Step 5: Check country compliance (if applicable)
            if (context.action.includes('TAX') || context.action.includes('SALARY')) {
                const compliant = await this.checkCompliance(context.country, context.action);
                if (!compliant) {
                    return {
                        allowed: false,
                        reason: `Compliance check failed for country: ${context.country}`,
                        complianceIssue: `Action "${context.action}" not allowed in ${context.country}`,
                    };
                }
            }

            // All checks passed
            return { allowed: true };

        } catch (error: any) {
            // FAIL-CLOSED: On error, deny access
            console.error('[Guard Layer] Error:', error);
            return {
                allowed: false,
                reason: `Security check failed: ${error.message}`,
            };
        }
    }

    /**
     * Check if a plan includes a specific feature
     */
    async checkFeature(plan: PlanTier, feature: string): Promise<boolean> {
        const planFeatures = PLAN_FEATURES[plan];

        // Check if feature is directly in the plan
        if (planFeatures.includes(feature)) {
            return true;
        }

        // Check for "all_X_features" inheritance
        if (plan === 'BUSINESS' && planFeatures.includes('advanced_pos')) {
            return PLAN_FEATURES.STARTER.includes(feature);
        }

        if (plan === 'PREMIUM' && planFeatures.includes('all_business_features')) {
            return PLAN_FEATURES.BUSINESS.includes(feature) || PLAN_FEATURES.STARTER.includes(feature);
        }

        if (plan === 'ENTERPRISE' && planFeatures.includes('all_premium_features')) {
            return (
                PLAN_FEATURES.PREMIUM.includes(feature) ||
                PLAN_FEATURES.BUSINESS.includes(feature) ||
                PLAN_FEATURES.STARTER.includes(feature)
            );
        }

        return false;
    }

    /**
     * Check country-specific compliance
     */
    async checkCompliance(country: string, action: string): Promise<boolean> {
        // TODO: Query smart contract or IPFS for country compliance rules
        // For now, return true (implement full logic later)

        // Example compliance checks:
        // - KSA: VAT required on all sales
        // - UAE: No minimum wage law
        // - Egypt: Specific tax invoice format

        return true; // Placeholder
    }

    /**
     * Check if user has accepted required consents
     */
    async checkConsent(userId: string, consentType: string): Promise<boolean> {
        // TODO: Query smart contract for consent records
        // For now, return true (implement full logic later)
        return true; // Placeholder
    }

    /**
     * Validate AI decision against compliance and permissions
     */
    async validateAIDecision(decision: {
        type: string;
        impact: 'LOW' | 'MEDIUM' | 'HIGH';
        affectedResource: string;
        suggestedAction: string;
    }): Promise<boolean> {
        // AI cannot make HIGH impact decisions autonomously
        if (decision.impact === 'HIGH') {
            return false;
        }

        // AI cannot change money or access directly
        if (
            decision.affectedResource === 'salaries' ||
            decision.affectedResource === 'roles' ||
            decision.affectedResource === 'permissions'
        ) {
            return false;
        }

        return true;
    }

    /**
     * Log action to audit trail (blockchain or IPFS)
     */
    async logAction(context: GuardContext, result: GuardResult): Promise<void> {
        // TODO: Emit event to smart contract or store in IPFS
        // For now, console log (implement full logic later)

        const logEntry = {
            timestamp: Date.now(),
            userId: context.userId,
            walletAddress: context.walletAddress,
            role: context.userRole,
            action: context.action,
            resource: context.resource,
            resourceId: context.resourceId,
            allowed: result.allowed,
            reason: result.reason,
            country: context.country,
        };

        console.log('[Audit Log]', logEntry);

        // In production: emit to smart contract event or upload to IPFS
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const guardLayer = new UnifiedGuardLayer();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export async function canUserPerformAction(
    context: Omit<GuardContext, 'action'> & { action: string }
): Promise<GuardResult> {
    return guardLayer.checkAccess(context as GuardContext);
}

export async function hasFeature(plan: PlanTier, feature: string): Promise<boolean> {
    return guardLayer.checkFeature(plan, feature);
}

export async function isPlanActive(businessId: string): Promise<boolean> {
    // TODO: Query smart contract for business plan status
    // Check expiry date, payment status
    return true; // Placeholder
}

export async function getUserPlan(businessId: string): Promise<PlanTier | null> {
    // TODO: Query smart contract or The Graph for business plan
    return null; // Placeholder
}

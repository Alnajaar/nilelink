// Define user roles as string constants
export type UserRole = 'CUSTOMER' | 'RESTAURANT_STAFF' | 'RESTAURANT_OWNER' | 'DELIVERY_DRIVER' | 'INVESTOR' | 'ADMIN';

// Define granular permissions
export enum Permission {
    // User Management
    USER_READ = 'user:read',
    USER_CREATE = 'user:create',
    USER_UPDATE = 'user:update',
    USER_DELETE = 'user:delete',
    USER_RESET_PASSWORD = 'user:reset_password',

    // Currency Management
    CURRENCY_READ = 'currency:read',
    CURRENCY_UPDATE = 'currency:update',
    CURRENCY_SYNC = 'currency:sync',

    // Subscription Management
    SUBSCRIPTION_READ = 'subscription:read',
    SUBSCRIPTION_CREATE = 'subscription:create',
    SUBSCRIPTION_UPDATE = 'subscription:update',
    SUBSCRIPTION_DELETE = 'subscription:delete',
    SUBSCRIPTION_PUBLISH = 'subscription:publish',

    // Business/Restaurant Management
    BUSINESS_READ = 'business:read',
    BUSINESS_UPDATE = 'business:update',
    BUSINESS_DELETE = 'business:delete',

    // POS Operations
    POS_READ = 'pos:read',
    POS_CREATE = 'pos:create',
    POS_UPDATE = 'pos:update',
    POS_DELETE = 'pos:delete',

    // Orders & Transactions
    ORDER_READ = 'order:read',
    ORDER_CREATE = 'order:create',
    ORDER_UPDATE = 'order:update',
    ORDER_REFUND = 'order:refund',

    // Financial Operations
    PAYMENT_PROCESS = 'payment:process',
    PAYMENT_REFUND = 'payment:refund',
    WALLET_CONNECT = 'wallet:connect',

    // Reporting & Analytics
    REPORT_READ = 'report:read',
    ANALYTICS_READ = 'analytics:read',

    // System Administration
    SYSTEM_CONFIG_READ = 'system:config:read',
    SYSTEM_CONFIG_UPDATE = 'system:config:update',
    AUDIT_READ = 'audit:read',

    // Admin Override
    ADMIN_OVERRIDE = 'admin:override'
}

// Role-based permission mappings (least privilege principle)
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    'ADMIN': [
        // Full access to everything
        Permission.USER_READ, Permission.USER_CREATE, Permission.USER_UPDATE,
        Permission.USER_DELETE, Permission.USER_RESET_PASSWORD,
        Permission.CURRENCY_READ, Permission.CURRENCY_UPDATE, Permission.CURRENCY_SYNC,
        Permission.SUBSCRIPTION_READ, Permission.SUBSCRIPTION_CREATE, Permission.SUBSCRIPTION_UPDATE,
        Permission.SUBSCRIPTION_DELETE, Permission.SUBSCRIPTION_PUBLISH,
        Permission.BUSINESS_READ, Permission.BUSINESS_UPDATE, Permission.BUSINESS_DELETE,
        Permission.POS_READ, Permission.POS_CREATE, Permission.POS_UPDATE, Permission.POS_DELETE,
        Permission.ORDER_READ, Permission.ORDER_CREATE, Permission.ORDER_UPDATE, Permission.ORDER_REFUND,
        Permission.PAYMENT_PROCESS, Permission.PAYMENT_REFUND, Permission.WALLET_CONNECT,
        Permission.REPORT_READ, Permission.ANALYTICS_READ,
        Permission.SYSTEM_CONFIG_READ, Permission.SYSTEM_CONFIG_UPDATE, Permission.AUDIT_READ,
        Permission.ADMIN_OVERRIDE
    ],

    'RESTAURANT_OWNER': [
        // Business management + orders + some user management
        Permission.USER_READ, Permission.USER_UPDATE, // For staff management
        Permission.BUSINESS_READ, Permission.BUSINESS_UPDATE,
        Permission.POS_READ, Permission.POS_CREATE, Permission.POS_UPDATE, Permission.POS_DELETE,
        Permission.ORDER_READ, Permission.ORDER_CREATE, Permission.ORDER_UPDATE,
        Permission.PAYMENT_PROCESS, Permission.WALLET_CONNECT,
        Permission.REPORT_READ, Permission.ANALYTICS_READ
    ],

    'RESTAURANT_STAFF': [
        // Limited POS and order operations
        Permission.POS_READ, Permission.POS_UPDATE,
        Permission.ORDER_READ, Permission.ORDER_CREATE, Permission.ORDER_UPDATE,
        Permission.PAYMENT_PROCESS
    ],

    'DELIVERY_DRIVER': [
        // Limited to delivery operations
        Permission.ORDER_READ, Permission.ORDER_UPDATE // For delivery status updates
    ],

    'INVESTOR': [
        // Read-only access to reports and analytics
        Permission.REPORT_READ, Permission.ANALYTICS_READ
    ],

    'CUSTOMER': [
        // Basic customer permissions
        Permission.ORDER_READ, Permission.ORDER_CREATE,
        Permission.WALLET_CONNECT,
        Permission.SUBSCRIPTION_READ
    ]
};

// Token scopes for JWT (OAuth2-style)
export enum TokenScope {
    READ = 'read',
    WRITE = 'write',
    ADMIN = 'admin',
    PAYMENT = 'payment',
    WALLET = 'wallet'
}

// Scope-based permissions mapping
export const SCOPE_PERMISSIONS: Record<TokenScope, Permission[]> = {
    [TokenScope.READ]: [
        Permission.USER_READ, Permission.CURRENCY_READ, Permission.SUBSCRIPTION_READ,
        Permission.BUSINESS_READ, Permission.POS_READ, Permission.ORDER_READ,
        Permission.REPORT_READ, Permission.ANALYTICS_READ, Permission.SYSTEM_CONFIG_READ,
        Permission.AUDIT_READ
    ],

    [TokenScope.WRITE]: [
        Permission.USER_UPDATE, Permission.SUBSCRIPTION_UPDATE, Permission.BUSINESS_UPDATE,
        Permission.POS_UPDATE, Permission.ORDER_UPDATE
    ],

    [TokenScope.ADMIN]: [
        Permission.USER_CREATE, Permission.USER_DELETE, Permission.USER_RESET_PASSWORD,
        Permission.CURRENCY_UPDATE, Permission.CURRENCY_SYNC,
        Permission.SUBSCRIPTION_CREATE, Permission.SUBSCRIPTION_DELETE, Permission.SUBSCRIPTION_PUBLISH,
        Permission.BUSINESS_DELETE, Permission.POS_CREATE, Permission.POS_DELETE,
        Permission.ORDER_REFUND, Permission.SYSTEM_CONFIG_UPDATE
    ],

    [TokenScope.PAYMENT]: [
        Permission.PAYMENT_PROCESS, Permission.PAYMENT_REFUND
    ],

    [TokenScope.WALLET]: [
        Permission.WALLET_CONNECT
    ]
};

// Session configuration
export const SESSION_CONFIG = {
    ACCESS_TOKEN_TTL: 15 * 60 * 1000, // 15 minutes
    REFRESH_TOKEN_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days
    MAX_SESSIONS_PER_USER: 5,
    SESSION_TIMEOUT_WARNING: 5 * 60 * 1000, // Warn 5 minutes before expiry
    INACTIVE_TIMEOUT: 30 * 60 * 1000, // 30 minutes of inactivity
};

// MFA configuration
export const MFA_CONFIG = {
    REQUIRED_FOR_ROLES: ['ADMIN' as UserRole, 'RESTAURANT_OWNER' as UserRole],
    METHODS: ['TOTP', 'SMS', 'EMAIL'] as const,
    BACKUP_CODES_COUNT: 10,
    RECOVERY_CODE_LENGTH: 10,
};

export class RBACService {
    private static instance: RBACService;

    private constructor() {}

    static getInstance(): RBACService {
        if (!RBACService.instance) {
            RBACService.instance = new RBACService();
        }
        return RBACService.instance;
    }

    /**
     * Check if a user has a specific permission
     */
    hasPermission(userRole: UserRole, permission: Permission): boolean {
        const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
        return rolePermissions.includes(permission);
    }

    /**
     * Check if a user has all specified permissions
     */
    hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
        return permissions.every(permission => this.hasPermission(userRole, permission));
    }

    /**
     * Check if a user has any of the specified permissions
     */
    hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
        return permissions.some(permission => this.hasPermission(userRole, permission));
    }

    /**
     * Get all permissions for a role
     */
    getRolePermissions(role: UserRole): Permission[] {
        return ROLE_PERMISSIONS[role] || [];
    }

    /**
     * Check if token scopes allow a permission
     */
    scopesAllowPermission(scopes: TokenScope[], permission: Permission): boolean {
        const requiredScopes = Object.entries(SCOPE_PERMISSIONS)
            .filter(([, permissions]) => permissions.includes(permission))
            .map(([scope]) => scope as TokenScope);

        return requiredScopes.some(scope => scopes.includes(scope));
    }

    /**
     * Get default scopes for a role
     */
    getDefaultScopesForRole(role: UserRole): TokenScope[] {
        const permissions = this.getRolePermissions(role);
        const scopes = new Set<TokenScope>();

        for (const permission of permissions) {
            for (const [scope, scopePermissions] of Object.entries(SCOPE_PERMISSIONS)) {
                if (scopePermissions.includes(permission)) {
                    scopes.add(scope as TokenScope);
                }
            }
        }

        return Array.from(scopes);
    }

    /**
     * Check if MFA is required for a role
     */
    isMFARequired(role: UserRole): boolean {
        return MFA_CONFIG.REQUIRED_FOR_ROLES.includes(role);
    }

    /**
     * Get resource-specific permissions (context-aware)
     */
    getResourcePermissions(resourceType: string, action: string, userRole: UserRole, context?: any): Permission[] {
        const basePermission = `${resourceType}:${action}` as Permission;

        // Check if user has the base permission
        if (!this.hasPermission(userRole, basePermission)) {
            return [];
        }

        // Apply context-aware restrictions
        switch (resourceType) {
            case 'user':
                // Users can only modify their own data (unless admin)
                if (userRole !== 'ADMIN' && context?.targetUserId !== context?.currentUserId) {
                    return [];
                }
                break;

            case 'business':
                // Restaurant owners can only manage their own business
                if (userRole === 'RESTAURANT_OWNER' && context?.businessId !== context?.userBusinessId) {
                    return [];
                }
                break;

            case 'pos':
                // Staff can only manage POS terminals for their business
                if (userRole === 'RESTAURANT_STAFF' && context?.terminalBusinessId !== context?.userBusinessId) {
                    return [];
                }
                break;
        }

        return [basePermission];
    }

    /**
     * Validate permission with context
     */
    validatePermission(
        userRole: UserRole,
        permission: Permission,
        context?: {
            currentUserId?: string;
            targetUserId?: string;
            businessId?: string;
            userBusinessId?: string;
            terminalBusinessId?: string;
            resourceOwnerId?: string;
        }
    ): boolean {
        const [resourceType, action] = permission.split(':') as [string, string];
        const allowedPermissions = this.getResourcePermissions(resourceType, action, userRole, context);

        return allowedPermissions.includes(permission);
    }

    /**
     * Get audit-relevant permissions (for logging)
     */
    getAuditPermissions(): Permission[] {
        return [
            Permission.USER_CREATE, Permission.USER_UPDATE, Permission.USER_DELETE,
            Permission.USER_RESET_PASSWORD, Permission.CURRENCY_UPDATE,
            Permission.SUBSCRIPTION_CREATE, Permission.SUBSCRIPTION_UPDATE, Permission.SUBSCRIPTION_DELETE,
            Permission.PAYMENT_PROCESS, Permission.PAYMENT_REFUND,
            Permission.ADMIN_OVERRIDE
        ];
    }
}

export const rbacService = RBACService.getInstance();

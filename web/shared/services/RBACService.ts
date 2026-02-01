/**
 * Role-Based Access Control (RBAC) Enforcement
 * Offline-first permission checking with smart contract verification
 */

import { ethers } from 'ethers';
import { sessionManager, UserRole } from './SessionManager';

interface Permission {
    resource: string;
    actions: ('create' | 'read' | 'update' | 'delete')[];
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    SUPER_ADMIN: [
        { resource: '*', actions: ['create', 'read', 'update', 'delete'] }, // Full access
    ],
    ADMIN: [
        { resource: 'products', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'suppliers', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'orders', actions: ['read', 'update'] },
        { resource: 'pos_devices', actions: ['create', 'read', 'update'] },
        { resource: 'sync_override', actions: ['create'] },
    ],
    SUPPLIER: [
        { resource: 'products', actions: ['create', 'read', 'update'] }, // Own products only
        { resource: 'stock', actions: ['update'] },
        { resource: 'orders', actions: ['read'] }, // Own orders only
    ],
    POS_USER: [
        { resource: 'products', actions: ['read'] },
        { resource: 'orders', actions: ['create', 'read'] },
        { resource: 'stock', actions: ['update'] }, // Via scanning
    ],
};

export class RBACService {
    private roleContractAddress?: string;
    private provider?: ethers.BrowserProvider;
    private roleContract?: ethers.Contract;

    async init(roleContractAddress?: string): Promise<void> {
        this.roleContractAddress = roleContractAddress;

        if (typeof window !== 'undefined' && window.ethereum && roleContractAddress) {
            this.provider = new ethers.BrowserProvider(window.ethereum);

            const roleABI = [
                'function getRoleFor(address user) view returns (string)',
                'function hasPermission(address user, string resource, string action) view returns (bool)',
            ];

            this.roleContract = new ethers.Contract(
                roleContractAddress,
                roleABI,
                this.provider
            );
        }
    }

    /**
     * Check if user has permission (offline-first)
     */
    async hasPermission(
        resource: string,
        action: 'create' | 'read' | 'update' | 'delete',
        context?: { ownerId?: string }
    ): Promise<boolean> {
        const session = await sessionManager.getSession();
        if (!session) return false;

        const role = session.role;

        // Check local permissions first
        const permissions = ROLE_PERMISSIONS[role];

        // Super admin has all permissions
        if (permissions.some(p => p.resource === '*')) {
            return true;
        }

        // Check specific resource permissions
        const resourcePerm = permissions.find(p => p.resource === resource);
        if (!resourcePerm) return false;

        if (!resourcePerm.actions.includes(action)) return false;

        // For suppliers, check ownership
        if (role === 'SUPPLIER' && context?.ownerId) {
            if (context.ownerId !== session.walletAddress) {
                return false;
            }
        }

        // Verify with smart contract if online (optional, doesn't block)
        if (navigator.onLine && this.roleContract) {
            try {
                const onChainPermission = await this.roleContract.hasPermission(
                    session.walletAddress,
                    resource,
                    action
                );

                // If on-chain says no, override local decision
                if (!onChainPermission) {
                    console.warn(`[RBAC] On-chain permission denied for ${resource}:${action}`);
                    return false;
                }
            } catch (error) {
                console.warn('[RBAC] Failed to verify on-chain, using local permissions');
            }
        }

        return true;
    }

    /**
     * Require permission (throws if not allowed)
     */
    async requirePermission(
        resource: string,
        action: 'create' | 'read' | 'update' | 'delete',
        context?: { ownerId?: string }
    ): Promise<void> {
        const allowed = await this.hasPermission(resource, action, context);

        if (!allowed) {
            throw new Error(`Permission denied: ${action} on ${resource}`);
        }
    }

    /**
     * Get user role (cached or from contract)
     */
    async getUserRole(walletAddress: string): Promise<UserRole> {
        // Try session first
        const session = await sessionManager.getSession();
        if (session && session.walletAddress === walletAddress) {
            return session.role;
        }

        // Try on-chain if online
        if (navigator.onLine && this.roleContract) {
            try {
                const roleString = await this.roleContract.getRoleFor(walletAddress);
                return roleString as UserRole;
            } catch (error) {
                console.warn('[RBAC] Failed to fetch role from contract');
            }
        }

        // Default to most restrictive
        return 'POS_USER';
    }

    /**
     * Check if action requires online verification
     */
    requiresOnline(action: string, role: UserRole): boolean {
        const criticalActions = [
            'system_halt',
            'commission_update',
            'device_authorization',
            'role_change',
            'emergency_override',
        ];

        return role === 'SUPER_ADMIN' && criticalActions.includes(action);
    }
}

// Singleton
export const rbacService = new RBACService();
export default rbac Service;

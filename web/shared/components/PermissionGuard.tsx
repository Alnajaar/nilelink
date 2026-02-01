import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PermissionGuardProps {
    permissions: string | string[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * PermissionGuard
 *
 * Conditionally renders children based on the user's role or permissions.
 * Supports role-based access control for unified ecosystem.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permissions,
    requireAll = false,
    fallback = null,
    children
}) => {
    const { user } = useAuth();

    if (!user) return <>{fallback}</>;

    // Super Admin and Admin have all permissions
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
        return <>{children}</>;
    }

    // Check role-based permissions first
    const userRole = user.role || 'USER';
    const rolePermissions = getRolePermissions(userRole);
    if (rolePermissions) {
        const requiredList = Array.isArray(permissions) ? permissions : [permissions];
        const hasPermission = requireAll
            ? requiredList.every(p => rolePermissions.includes(p))
            : requiredList.some(p => rolePermissions.includes(p));

        if (hasPermission) {
            return <>{children}</>;
        }
    }

    // Fallback to user permissions array if available
    const userPermissions = user.permissions || [];
    if (userPermissions.length > 0) {
        const requiredList = Array.isArray(permissions) ? permissions : [permissions];
        const hasPermission = requireAll
            ? requiredList.every(p => userPermissions.includes(p))
            : requiredList.some(p => userPermissions.includes(p));

        if (hasPermission) {
            return <>{children}</>;
        }
    }

    return <>{fallback}</>;
};

/**
 * Get permissions for a role (frontend mapping)
 */
function getRolePermissions(role: string): string[] | null {
    const rolePermissionMap: Record<string, string[]> = {
        'CUSTOMER': [
            'ORDERS:VIEW', 'ORDERS:CREATE',
            'SUBSCRIPTION:READ', 'WALLET:CONNECT'
        ],
        'RESTAURANT_OWNER': [
            'BUSINESS:READ', 'BUSINESS:UPDATE',
            'ORDERS:READ', 'ORDERS:CREATE', 'ORDERS:UPDATE',
            'INVENTORY:VIEW', 'INVENTORY:EDIT',
            'REPORTS:VIEW', 'STAFF:MANAGE',
            'PAYMENT:PROCESS', 'WALLET:CONNECT'
        ],
        'RESTAURANT_STAFF': [
            'ORDERS:READ', 'ORDERS:CREATE', 'ORDERS:UPDATE',
            'INVENTORY:VIEW', 'PAYMENT:PROCESS'
        ],
        'DELIVERY_DRIVER': [
            'ORDERS:READ', 'ORDERS:UPDATE' // For status updates
        ],
        'VENDOR': [
            'ORDERS:READ', 'ORDERS:CREATE',
            'INVENTORY:VIEW', 'INVENTORY:EDIT'
        ],
        'INVESTOR': [
            'REPORTS:VIEW', 'LEDGER:VIEW'
        ]
    };

    return rolePermissionMap[role] || null;
}

// Common Permission Constants
export const PERMISSIONS = {
    // Orders
    ORDERS_VIEW: 'ORDERS:VIEW',
    ORDERS_CREATE: 'ORDERS:CREATE',
    ORDERS_EDIT: 'ORDERS:EDIT',
    ORDERS_DELETE: 'ORDERS:DELETE',

    // Inventory
    INVENTORY_VIEW: 'INVENTORY:VIEW',
    INVENTORY_EDIT: 'INVENTORY:EDIT',

    // Finance
    REPORTS_VIEW: 'REPORTS:VIEW',
    LEDGER_VIEW: 'LEDGER:VIEW',

    // Admin
    STAFF_MANAGE: 'STAFF:MANAGE',
    SETTINGS_EDIT: 'SETTINGS:EDIT',
    BILLING_VIEW: 'BILLING:VIEW',
    TENANTS_MANAGE: 'TENANTS:MANAGE', // Super Admin only
};

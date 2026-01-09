import React from 'react';
import { useAuth } from '@shared/contexts/AuthContext';

interface PermissionGuardProps {
    permissions: string | string[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * PermissionGuard
 * 
 * Conditionally renders children based on the user's permissions.
 * Supports single strings or arrays of permissions.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permissions,
    requireAll = false,
    fallback = null,
    children
}) => {
    const { user } = useAuth();

    if (!user) return <>{fallback}</>;

    // Super Admin has all permissions
    if ((user.role as string) === 'SUPER_ADMIN') {
        return <>{children}</>;
    }

    const userPermissions = user.permissions || [];
    const requiredList = Array.isArray(permissions) ? permissions : [permissions];

    const hasPermission = requireAll
        ? requiredList.every(p => userPermissions.includes(p))
        : requiredList.some(p => userPermissions.includes(p));

    if (!hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

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

/**
 * PermissionGuard - Role-Based Access Control Component
 * Renders children only if user has required permission(s)
 */

"use client";

import { ReactNode } from 'react';
import { usePOS } from '@/contexts/POSContext';
import { PERMISSION } from '@/utils/permissions';

interface PermissionGuardProps {
    children: ReactNode;
    require?: PERMISSION | PERMISSION[];
    requireAll?: boolean; // If true, requires ALL permissions. If false, requires ANY
    fallback?: ReactNode;
}

export function PermissionGuard({
    children,
    require,
    requireAll = false,
    fallback = null
}: PermissionGuardProps) {
    const { hasPermission, currentRole } = usePOS();

    if (!currentRole) {
        return <>{fallback}</>;
    }

    if (!require) {
        return <>{children}</>;
    }

    const permissions = Array.isArray(require) ? require : [require];

    const hasAccess = requireAll
        ? permissions.every(p => hasPermission(p))
        : permissions.some(p => hasPermission(p));

    return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * RoleGuard - Show content only for specific roles
 */
import { POS_ROLE } from '@/utils/permissions';

interface RoleGuardProps {
    children: ReactNode;
    roles: POS_ROLE[];
    fallback?: ReactNode;
}

export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
    const { currentRole } = usePOS();

    if (!currentRole || !roles.includes(currentRole)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

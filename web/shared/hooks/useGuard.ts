/**
 * useGuard Hook
 * React hook for checking permissions and features in UI components
 * 
 * USAGE:
 * const { can, hasFeature, loading } = useGuard();
 * 
 * if (can('CREATE_EMPLOYEE')) {
 *   // Show create employee button
 * }
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { guardLayer, GuardContext, GuardResult, hasFeature as checkFeature } from '../services/GuardLayer';
import { UserRole, PlanTier } from '../types/database';
import { useFirebaseAuth } from '../providers/FirebaseAuthProvider';

export interface UseGuardOptions {
    businessId?: string;
    plan?: PlanTier;
    country?: string;
}

export function useGuard(options?: UseGuardOptions) {
    const { user } = useFirebaseAuth();
    const [loading, setLoading] = useState(false);
    const [cache, setCache] = useState<Map<string, GuardResult>>(new Map());

    /**
     * Check if user can perform an action
     */
    const can = useCallback(
        async (action: string, resource: string = 'general', resourceId?: string): Promise<boolean> => {
            if (!user) return false;

            const cacheKey = `${action}:${resource}:${resourceId || ''}`;

            // Check cache first
            if (cache.has(cacheKey)) {
                const cached = cache.get(cacheKey);
                return cached?.allowed || false;
            }

            setLoading(true);

            try {
                const context: GuardContext = {
                    userId: user.uid,
                    walletAddress: user.walletAddress,
                    userRole: user.role as UserRole,
                    businessId: options?.businessId,
                    country: options?.country || user.country || 'US',
                    plan: options?.plan,
                    action,
                    resource,
                    resourceId,
                };

                const result = await guardLayer.checkAccess(context);

                // Cache result
                setCache(prev => new Map(prev).set(cacheKey, result));

                // Log the check
                await guardLayer.logAction(context, result);

                return result.allowed;
            } catch (error) {
                console.error('[useGuard] Error checking permission:', error);
                return false; // Fail-closed
            } finally {
                setLoading(false);
            }
        },
        [user, options, cache]
    );

    /**
     * Synchronous version (uses cache, returns false if not cached)
     */
    const canSync = useCallback(
        (action: string, resource: string = 'general', resourceId?: string): boolean => {
            const cacheKey = `${action}:${resource}:${resourceId || ''}`;
            const cached = cache.get(cacheKey);
            return cached?.allowed || false;
        },
        [cache]
    );

    /**
     * Check if current plan has a feature
     */
    const hasFeature = useCallback(
        async (feature: string): Promise<boolean> => {
            if (!options?.plan) return false;
            return checkFeature(options.plan, feature);
        },
        [options?.plan]
    );

    /**
     * Get detailed permission result
     */
    const checkPermission = useCallback(
        async (action: string, resource: string = 'general', resourceId?: string): Promise<GuardResult> => {
            if (!user) {
                return {
                    allowed: false,
                    reason: 'User not authenticated',
                };
            }

            const context: GuardContext = {
                userId: user.uid,
                walletAddress: user.walletAddress,
                userRole: user.role as UserRole,
                businessId: options?.businessId,
                country: options?.country || user.country || 'US',
                plan: options?.plan,
                action,
                resource,
                resourceId,
            };

            return guardLayer.checkAccess(context);
        },
        [user, options]
    );

    /**
     * Clear permission cache
     */
    const clearCache = useCallback(() => {
        setCache(new Map());
    }, []);

    return {
        can,
        canSync,
        hasFeature,
        checkPermission,
        clearCache,
        loading,
        isAuthenticated: !!user,
        userRole: user?.role as UserRole | undefined,
    };
}

/**
 * useFeature Hook
 * Simple hook to check if a feature is available in current plan
 */
export function useFeature(feature: string, plan?: PlanTier) {
    const [available, setAvailable] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!plan) {
            setAvailable(false);
            setLoading(false);
            return;
        }

        checkFeature(plan, feature).then(result => {
            setAvailable(result);
            setLoading(false);
        });
    }, [feature, plan]);

    return { available, loading };
}

/**
 * useRole Hook
 * Check if user has specific role
 */
export function useRole(requiredRoles: UserRole | UserRole[]) {
    const { user } = useFirebaseAuth();

    const hasRole = Array.isArray(requiredRoles)
        ? requiredRoles.includes(user?.role as UserRole)
        : user?.role === requiredRoles;

    return {
        hasRole,
        userRole: user?.role as UserRole | undefined,
        isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
        isSuperAdmin: user?.role === 'SUPER_ADMIN',
    };
}

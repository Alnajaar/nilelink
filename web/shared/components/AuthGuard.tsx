'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRole?: string | string[];
    redirectTo?: string;
}

export default function AuthGuard({
    children,
    requiredRole,
    redirectTo = '/auth/login',
}: AuthGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not authenticated, redirect to login
                const currentPath = pathname + (window.location.search || '');
                console.log(`AuthGuard: No user found, redirecting from ${currentPath} to ${redirectTo}`);
                router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(currentPath)}`);
            } else if (requiredRole) {
                // Check if user has required role
                const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
                const hasRole = roles.includes(user.role) || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

                if (!hasRole) {
                    // Not authorized, redirect to unauthorized page or dashboard
                    console.log(`AuthGuard: User ${user.email} with role ${user.role} not authorized for ${pathname}`);
                    router.push('/auth/login?error=Unauthorized');
                } else {
                    setIsAuthorized(true);
                }
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, loading, requiredRole, router, pathname, redirectTo]);

    // Show loading state
    if (loading || (!user && !isAuthorized)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-primary">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-xl font-black text-white uppercase tracking-widest">Securing Session</h2>
                    <p className="text-emerald-500/60 text-xs font-bold mt-2 uppercase tracking-tighter">Verifying Cryptographic Identity</p>
                </div>
            </div>
        );
    }

    // User is authenticated and has required role (if specified)
    return isAuthorized ? <>{children}</> : null;
}
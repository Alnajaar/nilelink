"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    requireAuth = true,
    fallback
}) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || isLoading) return;

        const accessToken = localStorage.getItem('accessToken');
        const isAuthenticated = !!(user || accessToken);

        if (requireAuth && !isAuthenticated) {
            // User needs to be authenticated but isn't logged in
            router.push('/auth/login');
            return;
        }

        if (!requireAuth && isAuthenticated) {
            // User is authenticated but this page doesn't require auth
            // Could redirect to dashboard, but for now just allow access
        }
    }, [user, isLoading, requireAuth, router, isClient]);

    // Show loading state while checking authentication
    if (!isClient || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
                    <p className="text-text-muted font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    const accessToken = localStorage.getItem('accessToken');
    const isAuthenticated = !!(user || accessToken);

    // If authentication is required and user is not authenticated, show fallback or redirect
    if (requireAuth && !isAuthenticated) {
        if (fallback) {
            return <>{fallback}</>;
        }
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <p className="text-text-muted mb-4">You need to be logged in to access this page.</p>
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="px-6 py-3 bg-primary text-background rounded-xl font-medium hover:bg-primary/90 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

// Hook for checking authentication status
export const useAuthGuard = () => {
    const { user } = useAuth();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return { isAuthenticated: false, isLoading: true };

    const accessToken = localStorage.getItem('accessToken');
    return {
        isAuthenticated: !!(user || accessToken),
        isLoading: false,
        user
    };
};
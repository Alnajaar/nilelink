'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';
import { Loader2 } from 'lucide-react';

export function AuthRedirect() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return;
        
        if (user) {
            // Already logged in, redirect to dashboard
            if (user.role === 'ADMIN' || user.role === 'OWNER') {
                router.push('/dashboard');
            } else if (user.role === 'RESTAURANT_STAFF') {
                router.push('/pos/dashboard');
            } else if (user.role === 'DELIVERY_DRIVER') {
                router.push('/delivery/dashboard');
            } else if (user.role === 'VENDOR') {
                router.push('/supplier/dashboard');
            } else {
                router.push('/dashboard');
            }
        }
    }, [user, loading, router]);

    if (loading || user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-slate-400">Redirecting...</p>
                </div>
            </div>
        );
    }

    return null;
}

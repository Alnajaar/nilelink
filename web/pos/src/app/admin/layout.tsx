'use client';

import AuthGuard from '@shared/components/AuthGuard';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard requiredRole={['ADMIN', 'SUPER_ADMIN', 'OWNER']}>
            {children}
        </AuthGuard>
    );
}

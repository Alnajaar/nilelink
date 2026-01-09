'use client';

import AuthGuard from '@shared/components/AuthGuard';

export default function TerminalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard requiredRole={['ADMIN', 'SUPER_ADMIN', 'OWNER', 'STAFF', 'VENDOR']}>
            {children}
        </AuthGuard>
    );
}

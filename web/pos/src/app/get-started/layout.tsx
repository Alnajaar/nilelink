'use client';

import AuthGuard from '@shared/components/AuthGuard';

export default function GetStartedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            {children}
        </AuthGuard>
    );
}

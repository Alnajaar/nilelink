'use client';

import AuthGuard from '@shared/components/AuthGuard';

export default function SettingsLayout({
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

import AuthGuard from '@shared/components/AuthGuard';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard requiredRole={['ADMIN', 'SUPER_ADMIN', 'OWNER', 'RESTAURANT_OWNER']}>
            {children}
        </AuthGuard>
    );
}

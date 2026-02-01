import AuthGuard from '@shared/components/AuthGuard';

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard requiredRole={['ADMIN', 'SUPER_ADMIN', 'OWNER', 'STAFF', 'RESTAURANT_OWNER']}>
            {children}
        </AuthGuard>
    );
}

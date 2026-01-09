  import { UniversalHeader } from '@/shared/components/UniversalHeader';
import { UniversalFooter } from '@/shared/components/UniversalFooter';

export default function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col antialiased mesh-bg relative overflow-hidden">
            <UniversalHeader appName="Marketplace" />
            <main className="flex-1 relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-24 w-full">
                {children}
            </main>
            <UniversalFooter />
        </div>
    );
}

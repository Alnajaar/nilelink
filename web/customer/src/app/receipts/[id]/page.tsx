import ReceiptClient from './ReceiptClient';
import AuthGuard from '@shared/components/AuthGuard';

// Enable dynamic parameters to handle unknown receipt IDs
export const dynamicParams = true;

// Force dynamic rendering to handle unknown receipt IDs during static export
export const dynamic = 'force-dynamic';

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <AuthGuard>
            <ReceiptClient id={id} />
        </AuthGuard>
    );
}

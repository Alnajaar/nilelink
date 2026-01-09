import ReceiptClient from './ReceiptClient';
import AuthGuard from '@shared/components/AuthGuard';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function ReceiptPage({ params }: { params: { id: string } }) {
    return (
        <AuthGuard>
            <ReceiptClient id={params.id} />
        </AuthGuard>
    );
}

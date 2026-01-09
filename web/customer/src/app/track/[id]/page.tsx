import dynamic from 'next/dynamic';

import AuthGuard from '@shared/components/AuthGuard';

const TrackClient = dynamic(() => import('./TrackClient'), { ssr: false });

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function TrackPage({ params }: { params: { id: string } }) {
    return (
        <AuthGuard>
            <TrackClient id={params.id} />
        </AuthGuard>
    );
}

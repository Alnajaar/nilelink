import TrackClient from './TrackClient';

export function generateStaticParams() {
    return [{ id: 'ORD-1234' }];
}

export default function TrackPage({ params }: { params: { id: string } }) {
    return <TrackClient id={params.id} />;
}

import TrackClient from './TrackClient';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function TrackPage({ params }: { params: { id: string } }) {
    return <TrackClient id={params.id} />;
}

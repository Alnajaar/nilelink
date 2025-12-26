import ReceiptClient from './ReceiptClient';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function ReceiptPage({ params }: { params: { id: string } }) {
    return <ReceiptClient id={params.id} />;
}

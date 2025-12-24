import ShopClient from './ShopClient';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function ShopPage({ params }: { params: { id: string } }) {
    return <ShopClient id={params.id} />;
}

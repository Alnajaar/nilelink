import dynamic from 'next/dynamic';

const ShopClient = dynamic(() => import('./ShopClient'), { ssr: false });

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function ShopPage({ params }: { params: { id: string } }) {
    return <ShopClient id={params.id} />;
}

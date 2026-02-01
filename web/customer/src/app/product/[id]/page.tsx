// Enable dynamic parameters to handle unknown product IDs
export const dynamicParams = true;

// Force dynamic rendering to handle unknown product IDs during static export
export const dynamic = 'force-dynamic';

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ProductClient productId={id} />;
}

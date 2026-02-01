import React from 'react';
import RestaurantClient from './RestaurantClient';

// Enable dynamic parameters to handle unknown restaurant IDs
export const dynamicParams = true;

// Force dynamic rendering to handle unknown restaurant IDs during static export
export const dynamic = 'force-dynamic';

export default async function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <RestaurantClient restaurantId={id} />;
}

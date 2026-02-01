import React from 'react';
import TrackingClient from './TrackingClient';

// Enable dynamic parameters to handle unknown order IDs
export const dynamicParams = true;

// Force dynamic rendering to handle unknown order IDs during static export
export const dynamic = 'force-dynamic';

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <TrackingClient orderId={id} />;
}

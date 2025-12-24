"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TrackClient from './[id]/TrackClient';

function TrackPageContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') || 'ORD-1234';
    return <TrackClient id={id} />;
}

export default function TrackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white/20 italic">Verifying Order Hash...</div>}>
            <TrackPageContent />
        </Suspense>
    );
}

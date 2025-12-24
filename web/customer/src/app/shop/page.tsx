"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ShopClient from './[id]/ShopClient';

function ShopPageContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') || '1';
    return <ShopClient id={id} />;
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white/20 italic">Loading Protocol Node...</div>}>
            <ShopPageContent />
        </Suspense>
    );
}

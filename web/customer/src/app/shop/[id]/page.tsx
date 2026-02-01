"use client";

import React, { use } from 'react';
import dynamic from 'next/dynamic';

const ShopClient = dynamic(() => import('./ShopClient'), { ssr: false });

export default function ShopPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <ShopClient id={id} />;
}

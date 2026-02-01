/**
 * NileLink Metadata Engine
 * Optimized for SEO and Social Graph visibility
 * 
 * FEATURES:
 * - Dynamic Title & Description generation
 * - OpenGraph (OG) & Twitter Card standardization
 * - Theme colors and Favicon configuration
 * - Regional SEO tags
 */

import { Metadata } from 'next';

const DEFAULT_METADATA = {
    name: 'NileLink Protocol',
    title: 'NileLink | Decentralized AI POS Ecosystem',
    description: 'The first AI-powered, decentralized POS and logistics protocol for high-growth Arab markets. Immutable, intelligent, and community-owned.',
    url: 'https://nilelink.app',
    ogImage: '/og-image.png'
};

export function constructMetadata({
    title = DEFAULT_METADATA.title,
    description = DEFAULT_METADATA.description,
    image = DEFAULT_METADATA.ogImage,
    noIndex = false,
}: {
    title?: string;
    description?: string;
    image?: string;
    noIndex?: boolean;
} = {}): Metadata {
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: image,
                },
            ],
            type: 'website',
            siteName: DEFAULT_METADATA.name,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
            creator: '@nilelink_protocol',
        },
        viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
        themeColor: '#02050a',
        icons: {
            icon: '/favicon.ico',
            shortcut: '/logo-square.png',
            apple: '/logo-white.png',
        },
        metadataBase: new URL(DEFAULT_METADATA.url),
        ...(noIndex && {
            robots: {
                index: false,
                follow: false,
            },
        }),
    };
}

// ============================================
// APP STRUCTURE METADATA
// ============================================

export const APP_METADATA = {
    ADMIN: constructMetadata({
        title: 'Admin Console | NileLink Protocol',
        description: 'Centralized governance and system management for the NileLink decentralized network.'
    }),
    POS: constructMetadata({
        title: 'Business Hub | NileLink POS',
        description: 'Grow your business with the most advanced AI-first POS in the Arab world.'
    }),
    CUSTOMER: constructMetadata({
        title: 'Marketplace | Shop on NileLink',
        description: 'Discover local products and earn on-chain loyalty rewards.'
    }),
    DRIVER: constructMetadata({
        title: 'Logistics Portal | NileLink Driver',
        description: 'Join the decentralized delivery network and earn stablecoins.'
    }),
    SUPPLIER: constructMetadata({
        title: 'B2B Marketplace | NileLink Supplier',
        description: 'Direct wholesale distribution for the modern Arab economy.'
    })
};

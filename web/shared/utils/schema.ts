/**
 * NileLink Open Standardization Utility (JSON-LD)
 * 
 * Provides generators for Schema.org structured data.
 * Ensures data interoperability and SEO compliance.
 */

export const ORGANIZATION_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NileLink",
    "url": "https://nilelink.app",
    "logo": "https://nilelink.app/logo.png",
    "sameAs": [
        "https://twitter.com/nilelink",
        "https://github.com/nilelink"
    ]
};

export function generateRestaurantSchema(data: {
    name: string;
    image: string;
    priceRange: string;
    address: string;
    url: string;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": data.name,
        "image": data.image,
        "priceRange": data.priceRange,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": data.address,
            "addressCountry": "EG"
        },
        "url": data.url,
        "servesCuisine": "International"
    };
}

export function generateProductSchema(data: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency: string;
    sku?: string;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": data.name,
        "description": data.description,
        "image": data.image,
        "sku": data.sku || "N/A",
        "offers": {
            "@type": "Offer",
            "price": data.price,
            "priceCurrency": data.currency,
            "availability": "https://schema.org/InStock"
        }
    };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };
}
/**
 * Unified Order State Machine (Phase 13 Convergence)
 * 
 * Ensures every node in the ecosystem (POS, Delivery, Customer, Portal)
 * understands the exact same state of an order.
 */

export enum UnifiedOrderState {
    PENDING = 'PENDING',               // Order submitted by customer
    VERIFIED = 'VERIFIED',             // POS has cryptographically verified order
    KITCHEN_EXECUTION = 'KITCHEN_EXECUTION', // Kitchen is preparing
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',   // Order ready at counter
    TRANSIT_INITIATED = 'TRANSIT_INITIATED', // Driver has picked up
    DELIVERY_EXECUTION = 'DELIVERY_EXECUTION', // Driver in transit
    COMPLETED = 'COMPLETED',           // Order delivered and payment settled
    CANCELLED = 'CANCELLED'            // Order voided
}

export interface OrderTransition {
    orderId: string;
    from: UnifiedOrderState;
    to: UnifiedOrderState;
    actorId: string;
    timestamp: number;
    signature?: string; // Future cryptographic proof
}

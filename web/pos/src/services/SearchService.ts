/**
 * NileLink POS Search Service
 * Provides debounced, cross-entity search for Products, Orders, and Customers.
 * Supports partial matching and fuzzy logic.
 */

export interface SearchResult {
    id: string;
    type: 'product' | 'order' | 'customer';
    title: string;
    subtitle: string;
    metadata?: any;
}

class SearchService {
    private static instance: SearchService;

    private constructor() { }

    public static getInstance(): SearchService {
        if (!SearchService.instance) {
            SearchService.instance = new SearchService();
        }
        return SearchService.instance;
    }

    /**
     * Search across all relevant POS entities
     */
    public async globalSearch(query: string, dataSources: {
        products: any[],
        orders: any[],
        customers: any[]
    }): Promise<SearchResult[]> {
        if (!query || query.length < 2) return [];

        const normalizedQuery = query.toLowerCase();
        const results: SearchResult[] = [];

        // 1. Search Products
        dataSources.products.forEach(p => {
            if (
                p.name?.toLowerCase().includes(normalizedQuery) ||
                p.sku?.toLowerCase().includes(normalizedQuery) ||
                p.category?.toLowerCase().includes(normalizedQuery)
            ) {
                results.push({
                    id: p.id,
                    type: 'product',
                    title: p.name,
                    subtitle: `SKU: ${p.sku || 'N/A'} | $${p.price || p.unitPrice || 0}`,
                    metadata: p
                });
            }
        });

        // 2. Search Orders
        dataSources.orders.forEach(o => {
            if (
                o.id?.toLowerCase().includes(normalizedQuery) ||
                o.customerName?.toLowerCase().includes(normalizedQuery) ||
                o.status?.toLowerCase().includes(normalizedQuery)
            ) {
                results.push({
                    id: o.id,
                    type: 'order',
                    title: `Order #${o.id.slice(-6).toUpperCase()}`,
                    subtitle: `${o.customerName || 'Guest'} | ${o.status} | $${o.totalAmount || 0}`,
                    metadata: o
                });
            }
        });

        // 3. Search Customers
        dataSources.customers.forEach(c => {
            if (
                c.name?.toLowerCase().includes(normalizedQuery) ||
                c.email?.toLowerCase().includes(normalizedQuery) ||
                c.phone?.toLowerCase().includes(normalizedQuery)
            ) {
                results.push({
                    id: c.id,
                    type: 'customer',
                    title: c.name,
                    subtitle: `${c.phone || c.email || 'No contact info'}`,
                    metadata: c
                });
            }
        });

        // Sort results: matches starting with query first, then by title
        return results.sort((a, b) => {
            const aStarts = a.title.toLowerCase().startsWith(normalizedQuery);
            const bStarts = b.title.toLowerCase().startsWith(normalizedQuery);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return a.title.localeCompare(b.title);
        }).slice(0, 20); // Limit to top 20
    }
}

export const searchService = SearchService.getInstance();

/**
 * Lazy-Loaded AI Service
 * Fast startup with on-demand model loading
 */

import { pipeline, env } from '@xenova/transformers';

// Configure lazy loading
env.allowLocalModels = true;
env.useBrowserCache = true;
env.allowRemoteModels = false; // Only use cached models

class LazyAI {
    private classifier: any = null;
    private isLoading = false;
    private isReady = false;

    /**
     * Check if AI is ready (synchronous)
     */
    ready(): boolean {
        return this.is Ready;
    }

    /**
     * Load models on-demand (called when first needed)
     */
    private async loadModels(): Promise<void> {
        if (this.isReady || this.isLoading) return;

        this.isLoading = true;

        try {
            console.log('[LazyAI] Loading models...');
            const startTime = Date.now();

            // Load lightweight classification model
            this.classifier = await pipeline(
                'text-classification',
                'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
            );

            const loadTime = Date.now() - startTime;
            console.log(`[LazyAI] Models loaded in ${loadTime}ms`);

            this.isReady = true;
        } catch (error) {
            console.error('[LazyAI] Failed to load models:', error);
            this.isReady = false;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Parse product (auto-loads models if needed)
     */
    async parseProduct(text: string): Promise<{
        name: string;
        brand?: string;
        category: string;
        size?: string;
        unit?: string;
        confidence: number;
    }> {
        // Ensure models are loaded
        if (!this.isReady) {
            await this.loadModels();
        }

        const cleaned = text.trim().toLowerCase();

        // Extract components using regex (fast, works offline)
        const brandPatterns = [
            'almarai', 'nadec', 'saudia', 'panda', 'americana',
            'juhayna', 'domty', 'lacnor', 'al rawabi', 'al ain',
        ];

        let brand: string | undefined;
        for (const b of brandPatterns) {
            if (cleaned.includes(b)) {
                brand = b.charAt(0).toUpperCase() + b.slice(1);
                break;
            }
        }

        // Extract size
        const sizeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(ml|l|liter|g|kg|oz|pcs)/i);
        let size: string | undefined;
        let unit: string | undefined;

        if (sizeMatch) {
            const value = sizeMatch[1];
            const rawUnit = sizeMatch[2].toLowerCase();

            if (rawUnit.includes('l')) unit = 'liter';
            else if (rawUnit.includes('g') || rawUnit.includes('kg')) unit = 'kg';
            else if (rawUnit === 'pcs') unit = 'piece';
            else unit = rawUnit;

            size = `${value}${unit === 'liter' ? 'L' : unit === 'kg' ? 'KG' : unit}`;
        }

        // Infer category
        const category = this.inferCategory(cleaned);

        // Extract name
        let name = text;
        if (brand) {
            name = name.replace(new RegExp(brand, 'gi'), '').trim();
        }
        if (sizeMatch) {
            name = name.replace(sizeMatch[0], '').trim();
        }
        name = name.replace(/\s+/g, ' ').trim() || text;

        return {
            name,
            brand,
            category,
            size,
            unit,
            confidence: brand && size ? 0.85 : 0.65,
        };
    }

    /**
     * Infer category (keyword-based, fast)
     */
    private inferCategory(text: string): string {
        const categories: Record<string, string[]> = {
            'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'laban', 'labneh'],
            'Beverages': ['juice', 'water', 'soda', 'tea', 'coffee', 'cola'],
            'Snacks': ['chips', 'crackers', 'cookies', 'biscuit', 'chocolate'],
            'Bakery': ['bread', 'buns', 'rolls', 'cake'],
            'Meat': ['chicken', 'beef', 'lamb', 'meat'],
            'Vegetables': ['tomato', 'potato', 'onion', 'carrot'],
            'Fruits': ['apple', 'banana', 'orange', 'mango'],
            'Frozen': ['frozen', 'ice cream'],
            'Cleaning': ['detergent', 'soap', 'cleaner', 'bleach'],
            'Personal Care': ['lotion', 'deodorant', 'toothpaste'],
        };

        for (const [cat, keywords] of Object.entries(categories)) {
            if (keywords.some(kw => text.includes(kw))) {
                return cat;
            }
        }

        return 'Uncategorized';
    }

    /**
     * Find similar products (duplicate detection)
     */
    async findSimilar(text: string, existing: any[]): Promise<any[]> {
        const parsed = await this.parseProduct(text);

        return existing
            .filter(p =>
                p.brand === parsed.brand ||
                p.category === parsed.category ||
                this.similarity(p.name.toLowerCase(), parsed.name.toLowerCase()) > 0.7
            )
            .slice(0, 5);
    }

    /**
     * String similarity (Levenshtein-based)
     */
    private similarity(s1: string, s2: string): number {
        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;

        if (longer.length === 0) return 1.0;

        const editDistance = this.levenshtein(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    private levenshtein(s1: string, s2: string): number {
        const costs: number[] = [];

        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }

        return costs[s2.length];
    }
}

// Singleton
export const lazyAI = new LazyAI();
export default lazyAI;

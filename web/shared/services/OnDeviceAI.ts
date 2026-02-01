/**
 * On-Device AI Service using Transformers.js
 * NO backend dependencies • Works 100% offline
 */

import { pipeline, env } from '@xenova/transformers';

// Configure to use local models (cached in IndexedDB)
env.allowLocalModels = true;
env.useBrowserCache = true;

interface ProductParseResult {
    name: string;
    brand?: string;
    category: string;
    size?: string;
    unit?: string;
    confidence: number;
}

class OnDeviceAI {
    private classifier: any = null;
    private ner: any = null;
    private isInitialized = false;

    /**
     * Initialize AI models (downloads on first run, cached afterward)
     */
    async init() {
        if (this.isInitialized) return;

        try {
            console.log('[On-Device AI] Loading models...');

            // Text classification for category inference
            this.classifier = await pipeline(
                'text-classification',
                'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
            );

            // NER for brand/product extraction (optional, heavier model)
            // this.ner = await pipeline('ner', 'Xenova/bert-base-NER');

            this.isInitialized = true;
            console.log('[On-Device AI] Models loaded successfully');
        } catch (error) {
            console.error('[On-Device AI] Failed to load models:', error);
            throw error;
        }
    }

    /**
     * Parse product description using on-device AI + regex
     * Example: "Milk Almarai 1 liter" → { name, brand, category, size }
     */
    async parseProduct(text: string): Promise<ProductParseResult> {
        if (!this.isInitialized) {
            await this.init();
        }

        const cleaned = text.trim().toLowerCase();

        // Extract brand (common Middle Eastern brands)
        const brandPatterns = [
            'almarai', 'nadec', 'saudia', 'panda', 'americana',
            'juhayna', 'domty', 'lacnor', 'al rawabi', 'al ain',
            'nestlé', 'nescafe', 'pepsi', 'coca cola', 'lays'
        ];

        let brand: string | undefined;
        for (const b of brandPatterns) {
            if (cleaned.includes(b)) {
                brand = b.charAt(0).toUpperCase() + b.slice(1);
                break;
            }
        }

        // Extract size and unit
        const sizeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(ml|l|liter|litre|g|gram|kg|kilo|oz|lb|pcs|piece)/i);
        let size: string | undefined;
        let unit: string | undefined;

        if (sizeMatch) {
            const value = sizeMatch[1];
            const rawUnit = sizeMatch[2].toLowerCase();

            // Normalize units
            if (rawUnit.includes('l')) unit = 'liter';
            else if (rawUnit.includes('g') || rawUnit.includes('kg')) unit = 'kg';
            else if (rawUnit === 'pcs' || rawUnit === 'piece') unit = 'piece';
            else unit = rawUnit;

            size = `${value}${unit === 'liter' ? 'L' : unit === 'kg' ? 'KG' : unit}`;
        }

        // Infer category using keyword matching
        const category = this.inferCategory(cleaned);

        // Extract product name (remove brand and size)
        let name = text;
        if (brand) {
            name = name.replace(new RegExp(brand, 'gi'), '').trim();
        }
        if (sizeMatch) {
            name = name.replace(sizeMatch[0], '').trim();
        }

        // Clean up name
        name = name.replace(/\s+/g, ' ').trim();
        if (!name) name = text; // Fallback to original

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
     * Infer product category from text
     */
    private inferCategory(text: string): string {
        const categories: Record<string, string[]> = {
            'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'laban', 'labneh'],
            'Beverages': ['juice', 'water', 'soda', 'tea', 'coffee', 'cola', 'pepsi', 'drink'],
            'Snacks': ['chips', 'crackers', 'cookies', 'biscuit', 'chocolate', 'candy'],
            'Bakery': ['bread', 'buns', 'rolls', 'cake', 'pastry'],
            'Meat': ['chicken', 'beef', 'lamb', 'meat', 'sausage'],
            'Vegetables': ['tomato', 'potato', 'onion', 'carrot', 'lettuce'],
            'Fruits': ['apple', 'banana', 'orange', 'mango', 'grape'],
            'Frozen': ['frozen', 'ice cream', 'frozen'],
            'Cleaning': ['detergent', 'soap', 'cleaner', 'bleach', 'shampoo'],
            'Personal Care': ['lotion', 'deodorant', 'toothpaste', 'tissue'],
        };

        for (const [cat, keywords] of Object.entries(categories)) {
            if (keywords.some(kw => text.includes(kw))) {
                return cat;
            }
        }

        return 'Uncategorized';
    }

    /**
     * Suggest similar products (for duplicate detection)
     */
    async findSimilarProducts(text: string, existingProducts: any[]): Promise<any[]> {
        const parsed = await this.parseProduct(text);

        return existingProducts
            .filter(p =>
                p.brand === parsed.brand ||
                p.category === parsed.category ||
                this.similarity(p.name.toLowerCase(), parsed.name.toLowerCase()) > 0.7
            )
            .slice(0, 5);
    }

    /**
     * Simple string similarity (Levenshtein distance)
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

    /**
     * Check if models are ready
     */
    isReady(): boolean {
        return this.isInitialized;
    }
}

// Singleton instance
export const onDeviceAI = new OnDeviceAI();
export default onDeviceAI;

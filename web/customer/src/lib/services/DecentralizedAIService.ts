/**
 * Decentralized AI Service
 * 
 * Core principles:
 * - Wallet address as primary identity
 * - Client-side encrypted preferences
 * - IPFS for menu data and backups
 * - The Graph for restaurant/order queries
 * - Smart contracts for deal state
 * - NO centralized databases (Firebase/Firestore only for auth)
 */

import { useAccount, useSignMessage } from 'wagmi';

// ============================================================================
// TYPES
// ============================================================================

export interface UserPreferences {
    walletAddress: string;
    favoriteCuisines: string[];
    dietaryRestrictions: string[];
    budgetRange: { min: number; max: number };
    favoriteRestaurants: string[];
    orderHistory: string[]; // Transaction hashes or IPFS CIDs
    searchHistory: string[];
    lastUpdated: number;
    version: number;
}

export interface RestaurantRecommendation {
    id: string;
    name: string;
    cuisine: string;
    rating: number;
    priceRange: string;
    distance?: number;
    matchScore: number;
    reasons: string[];
}

export interface OfferRecommendation {
    id: string;
    restaurantId: string;
    description: string;
    discount: number;
    validUntil: Date;
    relevanceScore: number;
    reason: string;
}

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

export interface NaturalLanguageOrder {
    intent: 'order' | 'search' | 'question' | 'payment';
    cuisine?: string;
    items?: OrderItem[];
    priceRange?: string;
    dietaryNeeds?: string[];
    query: string;
}

// ============================================================================
// ENCRYPTION UTILITIES
// ============================================================================

class PreferenceEncryption {
    /**
     * Derive encryption key from wallet signature
     */
    static async deriveKey(walletAddress: string, signMessage: (message: string) => Promise<string>): Promise<CryptoKey> {
        const message = `NileLink AI Preferences Encryption Key for ${walletAddress}`;
        const signature = await signMessage(message);

        // Use signature as key material
        const encoder = new TextEncoder();
        const keyMaterial = encoder.encode(signature.slice(0, 32)); // Use first 32 chars

        return await crypto.subtle.importKey(
            'raw',
            keyMaterial,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt preferences for local storage
     */
    static async encrypt(data: UserPreferences, key: CryptoKey): Promise<string> {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(JSON.stringify(data));

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoded
        );

        // Combine IV + encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);

        return btoa(String.fromCharCode(...combined));
    }

    /**
     * Decrypt preferences from local storage
     */
    static async decrypt(encryptedData: string, key: CryptoKey): Promise<UserPreferences> {
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

        const iv = combined.slice(0, 12);
        const data = combined.slice(12);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );

        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decrypted));
    }
}

// ============================================================================
// DECENTRALIZED AI SERVICE
// ============================================================================

class DecentralizedAIService {
    private readonly STORAGE_KEY_PREFIX = 'nilelink_ai_prefs_';
    private readonly IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';

    /**
     * Get user preferences (client-side encrypted)
     */
    async getUserPreferences(
        walletAddress: string,
        signMessage: (message: string) => Promise<string>
    ): Promise<UserPreferences> {
        try {
            const storageKey = this.STORAGE_KEY_PREFIX + walletAddress.toLowerCase();
            const encryptedData = localStorage.getItem(storageKey);

            if (encryptedData) {
                const key = await PreferenceEncryption.deriveKey(walletAddress, signMessage);
                return await PreferenceEncryption.decrypt(encryptedData, key);
            }

            // Initialize new preferences
            return this.createDefaultPreferences(walletAddress);
        } catch (error) {
            console.error('Error loading preferences:', error);
            return this.createDefaultPreferences(walletAddress);
        }
    }

    /**
     * Save preferences (client-side encrypted)
     */
    async savePreferences(
        preferences: UserPreferences,
        signMessage: (message: string) => Promise<string>
    ): Promise<void> {
        try {
            const key = await PreferenceEncryption.deriveKey(preferences.walletAddress, signMessage);
            const encrypted = await PreferenceEncryption.encrypt(preferences, key);

            const storageKey = this.STORAGE_KEY_PREFIX + preferences.walletAddress.toLowerCase();
            localStorage.setItem(storageKey, encrypted);
        } catch (error) {
            console.error('Error saving preferences:', error);
            throw error;
        }
    }

    /**
     * Export preferences to IPFS (optional backup)
     */
    async exportToIPFS(
        preferences: UserPreferences,
        signMessage: (message: string) => Promise<string>
    ): Promise<string> {
        try {
            // Encrypt before uploading
            const key = await PreferenceEncryption.deriveKey(preferences.walletAddress, signMessage);
            const encrypted = await PreferenceEncryption.encrypt(preferences, key);

            // Upload to Pinata
            const response = await fetch('/api/ipfs/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: encrypted })
            });

            const { cid } = await response.json();
            return cid;
        } catch (error) {
            console.error('Error exporting to IPFS:', error);
            throw error;
        }
    }

    /**
     * Delete all user data (GDPR compliance)
     */
    deleteUserData(walletAddress: string): void {
        const storageKey = this.STORAGE_KEY_PREFIX + walletAddress.toLowerCase();
        localStorage.removeItem(storageKey);

        // Also clear any temporary data
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.includes(walletAddress.toLowerCase())) {
                localStorage.removeItem(key);
            }
        });
    }

    /**
     * Learn from order (update preferences)
     */
    async learnFromOrder(
        walletAddress: string,
        order: {
            restaurantId: string;
            restaurantName: string;
            items: string[];
            totalAmount: number;
            txHash: string;
        },
        signMessage: (message: string) => Promise<string>
    ): Promise<void> {
        try {
            const prefs = await this.getUserPreferences(walletAddress, signMessage);

            // Add to order history
            if (!prefs.orderHistory.includes(order.txHash)) {
                prefs.orderHistory.push(order.txHash);
                prefs.orderHistory = prefs.orderHistory.slice(-20); // Keep last 20
            }

            // Update favorite restaurants
            const orderCount = prefs.orderHistory.filter(tx => tx === order.txHash).length;
            if (orderCount >= 2 && !prefs.favoriteRestaurants.includes(order.restaurantId)) {
                prefs.favoriteRestaurants.push(order.restaurantId);
            }

            // Extract cuisine preferences
            const cuisineMatch = order.restaurantName.match(/(Italian|Chinese|Mexican|Indian|Japanese|Thai|Lebanese|American)/i);
            if (cuisineMatch && !prefs.favoriteCuisines.includes(cuisineMatch[0])) {
                prefs.favoriteCuisines.push(cuisineMatch[0]);
            }

            // Update budget range
            if (order.totalAmount < prefs.budgetRange.min || prefs.budgetRange.min === 0) {
                prefs.budgetRange.min = order.totalAmount;
            }
            if (order.totalAmount > prefs.budgetRange.max) {
                prefs.budgetRange.max = order.totalAmount * 1.2; // Allow some flexibility
            }

            prefs.lastUpdated = Date.now();
            prefs.version++;

            await this.savePreferences(prefs, signMessage);
        } catch (error) {
            console.error('Error learning from order:', error);
        }
    }

    /**
     * Track search query (for learning)
     */
    async trackSearch(
        walletAddress: string,
        query: string,
        signMessage: (message: string) => Promise<string>
    ): Promise<void> {
        try {
            const prefs = await this.getUserPreferences(walletAddress, signMessage);
            prefs.searchHistory = [query, ...prefs.searchHistory].slice(0, 30);
            prefs.lastUpdated = Date.now();
            await this.savePreferences(prefs, signMessage);
        } catch (error) {
            console.error('Error tracking search:', error);
        }
    }

    /**
     * Get intelligent restaurant recommendations
     */
    async getRestaurantRecommendations(
        walletAddress: string,
        restaurants: any[],
        signMessage: (message: string) => Promise<string>,
        userLocation?: { lat: number; lng: number }
    ): Promise<RestaurantRecommendation[]> {
        try {
            const prefs = await this.getUserPreferences(walletAddress, signMessage);

            const recommendations = restaurants.map(restaurant => {
                let matchScore = 0;
                const reasons: string[] = [];

                // Favorite restaurant bonus
                if (prefs.favoriteRestaurants.includes(restaurant.id)) {
                    matchScore += 40;
                    reasons.push('⭐ One of your favorites');
                }

                // Cuisine preference match
                const restaurantCuisine = restaurant.cuisine || restaurant.category;
                if (prefs.favoriteCuisines.some(c => restaurantCuisine?.toLowerCase().includes(c.toLowerCase()))) {
                    matchScore += 30;
                    reasons.push(`🍽️ You love ${restaurantCuisine}`);
                }

                // High rating bonus
                if (restaurant.rating >= 4.5) {
                    matchScore += 15;
                    reasons.push('🌟 Highly rated');
                }

                // Budget match
                const priceLevel = restaurant.priceRange?.length || 2;
                const estimatedPrice = priceLevel * 15;
                if (estimatedPrice >= prefs.budgetRange.min && estimatedPrice <= prefs.budgetRange.max) {
                    matchScore += 10;
                    reasons.push('💰 In your budget');
                }

                // Time-based recommendations
                const hour = new Date().getHours();
                if (hour >= 11 && hour <= 14 && restaurant.category?.toLowerCase().includes('fast')) {
                    matchScore += 5;
                    reasons.push('🕐 Great for lunch');
                } else if (hour >= 18 && hour <= 21) {
                    matchScore += 5;
                    reasons.push('🌙 Perfect for dinner');
                }

                // Active deals
                if (restaurant.offers?.length > 0) {
                    matchScore += 10;
                    reasons.push('🎁 Has active deals');
                }

                return {
                    id: restaurant.id,
                    name: restaurant.name,
                    cuisine: restaurantCuisine || 'Various',
                    rating: restaurant.rating || 0,
                    priceRange: restaurant.priceRange || '$$',
                    distance: restaurant.distance,
                    matchScore,
                    reasons: reasons.length > 0 ? reasons : ['📍 Available nearby']
                };
            });

            return recommendations
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 10);
        } catch (error) {
            console.error('Error getting recommendations:', error);
            return [];
        }
    }

    /**
     * Natural language understanding for orders
     */
    parseNaturalLanguageOrder(query: string): NaturalLanguageOrder {
        const lowerQuery = query.toLowerCase();

        // Detect intent
        let intent: 'order' | 'search' | 'question' = 'question';
        if (lowerQuery.match(/order|want|get|buy|purchase/)) intent = 'order';
        else if (lowerQuery.match(/find|search|look for|show me/)) intent = 'search';
        else if (lowerQuery.match(/pay|cash|card|wallet|payment/)) intent = 'payment';

        const result: NaturalLanguageOrder = { intent, query };

        // Extract cuisine
        const cuisines = ['italian', 'chinese', 'mexican', 'indian', 'japanese', 'thai', 'american', 'lebanese', 'pizza', 'burger'];
        for (const cuisine of cuisines) {
            if (lowerQuery.includes(cuisine)) {
                result.cuisine = cuisine;
                break;
            }
        }

        // Extract price range
        if (lowerQuery.match(/cheap|budget|affordable/)) result.priceRange = '$';
        if (lowerQuery.match(/moderate|mid-range/)) result.priceRange = '$$';
        if (lowerQuery.match(/expensive|fancy|premium/)) result.priceRange = '$$$';

        // Extract dietary needs
        const dietary: string[] = [];
        if (lowerQuery.match(/vegan/)) dietary.push('vegan');
        if (lowerQuery.match(/vegetarian/)) dietary.push('vegetarian');
        if (lowerQuery.match(/halal/)) dietary.push('halal');
        if (lowerQuery.match(/gluten.?free/)) dietary.push('gluten-free');
        if (dietary.length > 0) result.dietaryNeeds = dietary;

        // Extract specific items (basic matching)
        const items: OrderItem[] = [];
        const pizzaMatch = lowerQuery.match(/(large|medium|small)?\s*(pepperoni|cheese|margherita|hawaiian)?\s*pizza/i);
        if (pizzaMatch) {
            items.push({
                name: `${pizzaMatch[1] || 'medium'} ${pizzaMatch[2] || 'cheese'} pizza`,
                quantity: 1,
                price: 0 // Will be determined by restaurant menu
            });
        }

        if (items.length > 0) result.items = items;

        return result;
    }

    /**
     * Semantic restaurant search
     */
    async semanticSearch(
        query: string,
        restaurants: any[],
        walletAddress: string,
        signMessage: (message: string) => Promise<string>
    ): Promise<any[]> {
        // Track search
        await this.trackSearch(walletAddress, query, signMessage);

        const parsed = this.parseNaturalLanguageOrder(query);
        let filtered = restaurants;

        // Apply filters
        if (parsed.cuisine) {
            filtered = filtered.filter(r =>
                r.cuisine?.toLowerCase().includes(parsed.cuisine!) ||
                r.category?.toLowerCase().includes(parsed.cuisine!) ||
                r.name?.toLowerCase().includes(parsed.cuisine!)
            );
        }

        if (parsed.priceRange) {
            filtered = filtered.filter(r => r.priceRange === parsed.priceRange);
        }

        if (parsed.dietaryNeeds) {
            filtered = filtered.filter(r =>
                parsed.dietaryNeeds!.some(need =>
                    r.tags?.some((tag: string) => tag.toLowerCase().includes(need))
                )
            );
        }

        return filtered;
    }

    // Helper methods
    private createDefaultPreferences(walletAddress: string): UserPreferences {
        return {
            walletAddress,
            favoriteCuisines: [],
            dietaryRestrictions: [],
            budgetRange: { min: 0, max: 100 },
            favoriteRestaurants: [],
            orderHistory: [],
            searchHistory: [],
            lastUpdated: Date.now(),
            version: 1
        };
    }
}

export const decentralizedAI = new DecentralizedAIService();

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';

interface Recommendation {
  id: string;
  type: 'personalized' | 'trending' | 'combo' | 'loyalty' | 'location';
  title: string;
  description: string;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    image?: string;
  }>;
  actionLabel?: string;
  onAction?: () => void;
  priority: 'low' | 'medium' | 'high';
}

interface UserPreferences {
  favoriteCategories: string[];
  dietaryRestrictions: string[];
  priceRange: { min: number; max: number };
  preferredLocations: string[];
}

export function useAIRecommendations() {
  // Safely try to get wallet address, fallback to undefined if not in WagmiProvider context
  let address: string | undefined;
  try {
    const account = useAccount();
    address = account.address;
  } catch (error) {
    // WagmiProvider not available (SSR or provider not mounted yet)
    address = undefined;
  }

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    favoriteCategories: [],
    dietaryRestrictions: [],
    priceRange: { min: 0, max: 100 },
    preferredLocations: []
  });
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Generate personalized recommendations based on user behavior
   */
  const generateRecommendations = useCallback(async (
    userHistory: Array<{
      productId: string;
      category: string;
      price: number;
      timestamp: number;
    }>,
    currentLocation?: string
  ) => {
    setIsLoading(true);

    try {
      const newRecommendations: Recommendation[] = [];

      // Analyze user preferences from history
      const preferences = analyzeUserPreferences(userHistory);
      setUserPreferences(preferences);

      // Personalized recommendations based on favorites
      if (preferences.favoriteCategories.length > 0) {
        newRecommendations.push({
          id: 'personalized-favorites',
          type: 'personalized',
          title: 'Because you loved these',
          description: `More ${preferences.favoriteCategories[0]} items you might enjoy`,
          items: await getSimilarItems(preferences.favoriteCategories[0]),
          priority: 'high'
        });
      }

      // Trending items in user's preferred categories
      const trendingItems = await getTrendingItems(preferences.favoriteCategories);
      if (trendingItems.length > 0) {
        newRecommendations.push({
          id: 'trending-favorites',
          type: 'trending',
          title: 'Trending in your favorites',
          description: 'Popular items in categories you love',
          items: trendingItems,
          priority: 'medium'
        });
      }

      // Smart combo suggestions
      const comboRec = await generateComboRecommendations(userHistory);
      if (comboRec) {
        newRecommendations.push(comboRec);
      }

      // Location-based recommendations
      if (currentLocation) {
        const locationRec = await getLocationBasedRecommendations(currentLocation);
        if (locationRec) {
          newRecommendations.push(locationRec);
        }
      }

      // Loyalty program suggestions
      const loyaltyRec = await getLoyaltyRecommendations(userHistory.length);
      if (loyaltyRec) {
        newRecommendations.push(loyaltyRec);
      }

      // Seasonal/promotional recommendations
      const seasonalRec = await getSeasonalRecommendations();
      if (seasonalRec) {
        newRecommendations.push(seasonalRec);
      }

      // Sort by priority
      newRecommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Analyze user preferences from purchase history
   */
  const analyzeUserPreferences = (history: Array<{
    productId: string;
    category: string;
    price: number;
    timestamp: number;
  }>): UserPreferences => {
    const categories = history.map(h => h.category);
    const prices = history.map(h => h.price);

    // Find most frequent categories
    const categoryCount: Record<string, number> = {};
    categories.forEach(cat => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const favoriteCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);

    // Calculate price range
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const priceRange = {
      min: Math.max(0, avgPrice - 10),
      max: avgPrice + 15
    };

    return {
      favoriteCategories,
      dietaryRestrictions: [], // Would be set from user profile
      priceRange,
      preferredLocations: [] // Would be set from order locations
    };
  };

  /**
   * Get similar items based on category
   */
  const getSimilarItems = async (category: string) => {
    // This would call an API or smart contract to get similar items
    // For now, return mock data
    const mockItems = [
      { id: '1', name: 'Premium Coffee', price: 4.50 },
      { id: '2', name: 'Croissant', price: 3.25 },
      { id: '3', name: 'Avocado Toast', price: 8.75 }
    ];

    return mockItems.filter(item =>
      category.toLowerCase().includes('coffee') ||
      category.toLowerCase().includes('food')
    );
  };

  /**
   * Get trending items in user's favorite categories
   */
  const getTrendingItems = async (categories: string[]) => {
    // Mock trending items
    const trending = [
      { id: 'trending-1', name: 'Seasonal Special Latte', price: 5.50 },
      { id: 'trending-2', name: 'Vegan Buddha Bowl', price: 12.00 },
      { id: 'trending-3', name: 'Artisan Sandwich', price: 9.25 }
    ];

    return trending.slice(0, 2);
  };

  /**
   * Generate smart combo recommendations
   */
  const generateComboRecommendations = async (history: Array<{
    productId: string;
    category: string;
    price: number;
    timestamp: number;
  }>): Promise<Recommendation | null> => {
    // Analyze purchase patterns for combo opportunities
    const hasCoffee = history.some(h => h.category.toLowerCase().includes('coffee'));
    const hasFood = history.some(h => h.category.toLowerCase().includes('food'));

    if (hasCoffee && !hasFood) {
      return {
        id: 'combo-coffee-food',
        type: 'combo',
        title: 'Complete your coffee experience',
        description: 'Add a pastry or sandwich to your coffee for the perfect combo',
        items: [
          { id: 'combo-1', name: 'Butter Croissant', price: 3.50 },
          { id: 'combo-2', name: 'Breakfast Sandwich', price: 7.25 }
        ],
        actionLabel: 'Add Combo Deal',
        onAction: () => console.log('Add combo to cart'),
        priority: 'medium'
      };
    }

    return null;
  };

  /**
   * Get location-based recommendations
   */
  const getLocationBasedRecommendations = async (location: string): Promise<Recommendation | null> => {
    // Mock location-based recommendations
    if (location.toLowerCase().includes('beirut') || location.toLowerCase().includes('lebanon')) {
      return {
        id: 'location-lebanese',
        type: 'location',
        title: 'Local favorites near you',
        description: 'Popular Lebanese specialties in your area',
        items: [
          { id: 'local-1', name: 'Manakish Zaatar', price: 6.00 },
          { id: 'local-2', name: 'Lebanese Coffee', price: 3.75 }
        ],
        priority: 'medium'
      };
    }

    return null;
  };

  /**
   * Get loyalty program recommendations
   */
  const getLoyaltyRecommendations = async (orderCount: number): Promise<Recommendation | null> => {
    if (orderCount < 3) {
      return {
        id: 'loyalty-join',
        type: 'loyalty',
        title: 'Join our loyalty program',
        description: 'Earn points on every order and get exclusive rewards',
        actionLabel: 'Join Now',
        onAction: () => console.log('Navigate to loyalty signup'),
        priority: 'high'
      };
    } else if (orderCount >= 5) {
      return {
        id: 'loyalty-rewards',
        type: 'loyalty',
        title: 'Your rewards are waiting',
        description: 'You have enough points for a free item!',
        actionLabel: 'Claim Reward',
        onAction: () => console.log('Navigate to rewards'),
        priority: 'high'
      };
    }

    return null;
  };

  /**
   * Get seasonal/promotional recommendations
   */
  const getSeasonalRecommendations = async (): Promise<Recommendation | null> => {
    const currentMonth = new Date().getMonth();

    // Summer specials
    if (currentMonth >= 5 && currentMonth <= 8) {
      return {
        id: 'seasonal-summer',
        type: 'personalized',
        title: 'Beat the heat',
        description: 'Refreshing summer specials now available',
        items: [
          { id: 'summer-1', name: 'Iced Specialty Latte', price: 5.75 },
          { id: 'summer-2', name: 'Frozen Yogurt Bowl', price: 6.50 }
        ],
        priority: 'low'
      };
    }

    return null;
  };

  /**
   * Update user preferences
   */
  const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
    setUserPreferences(prev => ({ ...prev, ...preferences }));
  };

  /**
   * Clear recommendations
   */
  const clearRecommendations = () => {
    setRecommendations([]);
  };

  return {
    recommendations,
    userPreferences,
    isLoading,
    generateRecommendations,
    updateUserPreferences,
    clearRecommendations
  };
}

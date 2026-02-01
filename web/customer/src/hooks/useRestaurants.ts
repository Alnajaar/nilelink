import useSWR from 'swr';
import { graphService } from '@shared/services/GraphService';

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  imageUrl?: string;
  cuisineType?: string;
  loyaltyBonus?: number;
  tags?: string[];
  badge?: string;
  discount?: string;
  isActive: boolean;
  lat?: number;
  lng?: number;
  country?: string;
}

// Fallback to empty list or localized error state if API fails
const EMPTY_RESTAURANTS: Restaurant[] = [];

import { useLocation } from '@shared/hooks/useLocation';

export function useRestaurants() {
  const { latitude, longitude, country: userCountry } = useLocation();
  const { data, error, isLoading, mutate } = useSWR(
    '/restaurants',
    async () => {
      try {
        const businesses = await graphService.getAllBusinesses();
        // Filter for only active restaurants
        const restaurants = businesses
          .filter((b: any) => b.businessType === 'RESTAURANT' && b.status === 'ACTIVE')
          .map((b: any) => ({
            id: b.id,
            name: b.metadata?.name || 'Unnamed Restaurant',
            category: b.metadata?.cuisine || 'General',
            rating: 4.8, // Fallback if no specific rating field in graph yet
            reviewCount: 0,
            deliveryTime: b.metadata?.deliveryTime || '30-45 min',
            deliveryFee: b.metadata?.deliveryFee || 0,
            imageUrl: b.metadata?.image,
            cuisineType: b.metadata?.cuisine,
            isActive: true,
            country: b.metadata?.country
          }));
        return { restaurants };
      } catch (err) {
        console.error('Failed to fetch real restaurants:', err);
        return { restaurants: [] };
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      fallbackData: { restaurants: [] }
    }
  );

  const sortedRestaurants = [...(data?.restaurants || [])].sort((a, b) => {
    // 1. Prioritize same country
    if (userCountry) {
      if (a.country === userCountry && b.country !== userCountry) return -1;
      if (a.country !== userCountry && b.country === userCountry) return 1;
    }

    // 2. Sort by proximity if coordinates available
    if (latitude && longitude && a.lat && a.lng && b.lat && b.lng) {
      const distA = Math.sqrt(Math.pow(a.lat - latitude, 2) + Math.pow(a.lng - longitude, 2));
      const distB = Math.sqrt(Math.pow(b.lat - latitude, 2) + Math.pow(b.lng - longitude, 2));
      return distA - distB;
    }
    return 0;
  });

  return {
    restaurants: sortedRestaurants,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useRestaurant(id: string | null) {
  const { data, error, isLoading } = useSWR(
    id ? `/restaurants/${id}` : null,
    async () => {
      if (!id) return null;
      const result = await restaurantApi.getById(id);
      return result as { restaurant: Restaurant };
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    restaurant: data?.restaurant || null,
    isLoading,
    isError: error,
  };
}

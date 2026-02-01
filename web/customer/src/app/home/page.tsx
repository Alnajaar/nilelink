'use client';

import React, { useState } from 'react';
import { MapPin, Search, Bell } from 'lucide-react';
import { TierBadge, MerchantCard, PrimaryButton } from '@/components/ui';
import Link from 'next/link';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useLoyalty } from '@/hooks/useLoyalty';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';

const categories = [
  { id: 1, name: 'All', icon: '🏪' },
  { id: 2, name: 'Food', icon: '🍔' },
  { id: 3, name: 'Fresh', icon: '🥗' },
  { id: 4, name: 'Beauty', icon: '💄' },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [location, setLocation] = useState('Tarabulus, Lebanon');
  
  const { restaurants, isLoading: restaurantsLoading, isError: restaurantsError } = useRestaurants();
  const { loyalty, isLoading: loyaltyLoading } = useLoyalty();

  // Filter featured/popular merchants
  const featuredMerchants = restaurants.filter(r => r.badge === 'Popular' || r.isActive).slice(0, 4);

  if (restaurantsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorState
          title="Failed to load restaurants"
          message="We couldn't load the restaurant list. Please try again."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Location and Notifications */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Location */}
            <div className="flex items-center gap-2 flex-1">
              <MapPin className="w-5 h-5 text-primary-600" />
              <select className="text-sm font-semibold text-text-primary bg-transparent focus:outline-none cursor-pointer">
                <option>{location}</option>
                <option>Beirut, Lebanon</option>
                <option>Sidon, Lebanon</option>
              </select>
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 text-text-tertiary hover:text-text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tier & Points Sticky Badge */}
        <div className="flex items-center justify-between mb-8 p-4 bg-white rounded-xl border border-gray-200">
          {loyaltyLoading ? (
            <div className="flex items-center gap-3 w-full">
              <div className="w-20 h-10 bg-gray-200 animate-pulse rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 w-24 bg-gray-200 animate-pulse rounded mb-2"></div>
                <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <TierBadge tier={loyalty?.currentTier?.toLowerCase() as any || 'green'} size="md" />
                <div>
                  <p className="text-xs text-text-tertiary">Current Points</p>
                  <p className="text-xl font-bold text-text-primary">
                    {loyalty?.currentPoints || 0} pts
                  </p>
                </div>
              </div>
              <Link
                href="/loyalty"
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                View Details →
              </Link>
            </>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Store name or item..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Category Carousel */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-3 pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap
                  transition-all duration-200 flex-shrink-0 font-medium text-sm
                  ${
                    selectedCategory === cat.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-200 text-text-primary hover:bg-gray-50'
                  }
                `}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="mb-8 bg-gradient-to-r from-accent-400 to-accent-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Order any 2025 Top Beauty Picks & get free delivery!</h2>
          <p className="text-sm text-accent-100 mb-4">Limited time offer - valid until January 31st</p>
          <PrimaryButton variant="outline" className="border-white text-white hover:bg-white/20">
            Shop Now
          </PrimaryButton>
        </div>

        {/* Merchants Grid */}
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-6">Popular Merchants</h2>
          
          {restaurantsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-elevation-1">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredMerchants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg">No restaurants available at the moment.</p>
              <p className="text-text-tertiary text-sm mt-2">Please check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredMerchants.map((merchant) => (
                <Link key={merchant.id} href={`/shop/${merchant.id}`}>
                  <MerchantCard
                    name={merchant.name}
                    imageUrl={merchant.imageUrl || `https://picsum.photos/300/200?random=${merchant.id}`}
                    rating={merchant.rating}
                    reviewCount={merchant.reviewCount}
                    deliveryTime={merchant.deliveryTime}
                    loyaltyBonus={merchant.loyaltyBonus}
                    cuisineType={merchant.cuisineType}
                  />
                </Link>
              ))}
            </div>
          )}

          {!restaurantsLoading && featuredMerchants.length > 0 && (
            <div className="mt-8 text-center">
              <Link href="/restaurants">
                <PrimaryButton variant="outline" size="lg">
                  View All Restaurants
                </PrimaryButton>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
